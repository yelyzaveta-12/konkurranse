"use strict";

class KonkurranseController {
    #tabellelement;
    #filterTekst;
    #filterButton;
    #filterButtonTom;
    #filterForm;
    #aktivtFilter;
    #aktivtMonster = null;
    #aktivtFelt = "0";


    constructor(formelement, tabellelement) {
        this.#tabellelement = tabellelement;

        formelement.addEventListener("submit", event => {
            this.#registrer(event);
        });

        const startnummerInput = formelement.elements["startnummer"];

        startnummerInput.addEventListener("input", event => {
            this.#validerStartnummer(event.target);
        });

        const navnInput = formelement.elements["navn"];

        navnInput.addEventListener("input", event => {
            this.#validerNavn(event.target);
        });

        this.#filterForm = document.forms["filter"];

        this.#filterTekst =
            this.#filterForm.elements["filtertekst"];

        this.#filterButton = this.#filterForm.querySelector(
            "button[type='submit']"
        );

        this.#filterButtonTom = this.#filterForm.querySelector(
            "button[type='reset']"
        );

        this.#aktivtFilter = this.#filterForm.querySelector("span");

        this.#filterForm.addEventListener("submit", event => {
            event.preventDefault();
            this.#aktiverFilter();
        });

        this.#filterButtonTom.addEventListener("click", () => {
            this.#tomFilter();
        });

        this.#validerStartnummer(startnummerInput);
        this.#validerNavn(navnInput);
    }


    #aktiverFilter() {
        const monster = this.#filterTekst.value;
        const valgtFelt = this.#filterForm.elements["felt"].value;

        let regex;

        try {
            regex = new RegExp(monster, "i");
        } catch (error) {
            this.#filterTekst.setCustomValidity(
                "Ugyldig regulært uttrykk"
            );
            this.#filterTekst.reportValidity();
            return;
        }

        this.#filterTekst.setCustomValidity("");

        this.#aktivtMonster = regex;
        this.#aktivtFelt = valgtFelt;

        this.#aktivtFilter.textContent = monster || "Tomt filter";

        const rader = this.#tabellelement.tBodies[0].rows;

        for (const rad of rader) {
            const tekst = rad.cells[Number(valgtFelt)].textContent;

            regex.lastIndex = 0;
            rad.classList.toggle("hidden", !regex.test(tekst));
        }
    }


    #tomFilter() {
        this.#filterTekst.setCustomValidity("");
        this.#filterTekst.value = "";
        this.#aktivtFilter.textContent = "Ingen";
        this.#aktivtMonster = null;
        this.#aktivtFelt = "0";

        const rader = this.#tabellelement.tBodies[0].rows;

        for (const rad of rader) {
            rad.classList.remove("hidden");
        }
    }


    #registrer(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const deltager = {
            startnummer: Number(formData.get("startnummer")),
            navn: formData.get("navn")
        };

        this.#visDeltager(deltager);

        event.target.reset();

        this.#validerStartnummer(
            event.target.elements["startnummer"]
        );

        this.#validerNavn(
            event.target.elements["navn"]
        );
    }


    #validerStartnummer(target) {
        console.log(target.validity);

                let errormessage = "";

                if (target.validity.valueMissing) {
                            errormessage = "Startnummer er påkrevd";
                            } else if (target.validity.badInput) {
                                          errormessage = "Startnummer må være et heltall";
                                          } else if (target.validity.rangeUnderflow) {
                                                       errormessage = "Startnummer må være et heltall større eller lik 1";
                                                   } else if (target.validity.stepMismatch) {
                                                                 errormessage = "Startnummer må være et heltall";
                                                                 } else  if (this.#startnummerFinnes(target.valueAsNumber)) {
                                                                                    errormessage = "Startnummer er i bruk";


            }
             target.setCustomValidity(errormessage);
                    target.title = errormessage;
    }


    #validerNavn(target) {
        console.log(target.validity);

                let errormessage = "";

                if (target.validity.valueMissing) {
                            errormessage = "Navn mangler";
                            } else if  (target.validity.patternMismatch) {
                                                   errormessage = "Navn må bestå av ett eller flere delnavn skilt av mellomrom eller bindestrek og hvert delnavn må starte med stor forbokstav etterfulgt av kun små bokstaver";
                                               }

                target.setCustomValidity(errormessage);
                target.title = errormessage;
    }


    #visDeltager(deltager) {
        const tbody = this.#tabellelement.tBodies[0];
        const rader = Array.from(tbody.rows);
        const indeks = rader.findIndex(rad => {
            const nummer = Number(rad.cells[0].textContent);
            return deltager.startnummer < nummer;
        });

        const newRow = tbody.insertRow(indeks);
        newRow.dataset.startnummer = deltager.startnummer;

        newRow.insertCell(-1).textContent = deltager.startnummer;

        newRow.insertCell(-1).textContent = deltager.navn;

        const startCell = newRow.insertCell(-1);
        const startDato = document.createElement("input");

        startDato.type = "time";
        startDato.step = "1";
        startCell.append(startDato);

        const sluttCell = newRow.insertCell(-1);
        const sluttDato = document.createElement("input");

        sluttDato.type = "time";
        sluttDato.step = "1";
        sluttCell.append(sluttDato);

        const lopstidCell = newRow.insertCell(-1);

        startDato.addEventListener("input", () => {
            this.#validerTid(startDato, sluttDato, lopstidCell);
        });

        sluttDato.addEventListener("input", () => {
            this.#validerTid(startDato, sluttDato, lopstidCell);
        });

        this.#tabellelement.classList.remove("hidden");

        if (this.#aktivtMonster !== null) {
            const tekst =
                newRow.cells[Number(this.#aktivtFelt)].textContent;

            this.#aktivtMonster.lastIndex = 0;

            newRow.classList.toggle(
                "hidden",
                !this.#aktivtMonster.test(tekst)
            );
        }
    }


    #validerTid(startDato, sluttDato, lopstidCell) {
        let errormessage = "";
        lopstidCell.textContent = "";

        if (startDato.value !== "" && sluttDato.value !== "") {
            if (sluttDato.value <= startDato.value) {
                errormessage = "Sluttid må være etter starttid";
            } else {
                const startResult = this.#tidTilSek(startDato.value);
                const sluttResult = this.#tidTilSek(sluttDato.value);

                const totalTidResult = sluttResult - startResult;

                const timer = Math.floor(totalTidResult / 3600);
                const minutter = Math.floor(
                    (totalTidResult % 3600) / 60
                );
                const sekunder = totalTidResult % 60;

                lopstidCell.textContent =
                    String(timer).padStart(2, "0") + ":" +
                    String(minutter).padStart(2, "0") + ":" +
                    String(sekunder).padStart(2, "0");
            }
        }

        sluttDato.setCustomValidity(errormessage);
        sluttDato.title = errormessage;
    }


    #tidTilSek(tid) {
        const split = tid.split(":");

        const t = Number(split[0]);
        const m = Number(split[1]);
        const s = Number(split[2] || 0);

        return t * 3600 + m * 60 + s;
    }

    #startnummerFinnes(startnummer) {
        const tbody = this.#tabellelement.tBodies[0];

        const element = tbody.querySelector(
            `tr[data-startnummer="${startnummer}"]`
        );

        return element !== null;
    }


    #fyllListe() {
        this.#tabellelement.classList.remove('hidden');

        const liste = [
                {'startnummer': 567, 'navn': 'Per Persen'},
                {'startnummer': 127, 'navn': 'Anne Annesen'},
                {'startnummer': 838, 'navn': 'Jo Josen'},
                {'startnummer': 57, 'navn': 'Gro Grosen'},
                {'startnummer': 9, 'navn': 'Hanne Hannesen'},
                {'startnummer': 65, 'navn': 'Jo Josen'},
                {'startnummer': 7476, 'navn': 'Mette Metteson'}
        ];

            for (const deltager of liste) {
                if (!this.#startnummerFinnes(deltager.startnummer)) {
                    this.#visDeltager(deltager);
                }
            }
    }
}

const formelement = document.forms["nydeltager"];
const tabellelement = document.getElementById("deltagere");

new KonkurranseController(formelement, tabellelement);