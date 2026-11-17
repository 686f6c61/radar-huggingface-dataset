# fusion-world-model/transformer_10m_f-sim

## Resumen

`transformer_10m_f-sim` es un modelo de mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de un transformer con un presupuesto de 10 millones de parametros, entrenado con la receta denominada "(f) simulator emulator": es decir, un emulador de simulador que aprende a predecir la evolucion temporal de variables de plasma a partir de datos de simulacion y de bases de datos experimentales de distintos tokamaks.

El modelo se publica como una coleccion de checkpoints de PyTorch (`final.pt`, `seed_1.pt`, `seed_2.pt`) acompanados de `config.json`, `selection.json` y `manifest.json`. El checkpoint `final.pt` corresponde a la configuracion de indice 31 de las 35 entrenadas en la busqueda de hiperparametros del autor, seleccionada por la regla de seleccion documentada en `selection.json`. La revision etiquetada `paper` contiene el checkpoint exacto utilizado en la publicacion asociada.

Su relevancia es acotada pero especifica: no es un modelo de lenguaje generalista, sino un componente de investigacion para modelado de series temporales en fisica de plasmas de fusion. El interes radica en que permite emular respuestas de simulador a una fraccion del coste computacional, algo util en bucles de diseno de escenarios y en control en tiempo real de reactores como ITER, SPARC o STEP. No obstante, el repositorio no incluye pipeline, idiomas ni documentacion de uso mas alla de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de mundo para series temporales de plasma de tokamak) |
| Parametros totales | 10M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es un transformer con un presupuesto de 10 millones de parametros, disenado como modelo de mundo para la evolucion temporal de plasmas de tokamak. La receta se identifica como "(f) simulator emulator", lo que indica que el modelo se entrena para emular la salida de un simulador fisico de plasma. No se especifican en la informacion disponible el numero de capas, dimensiones ocultas, mecanismo de atencion concreto ni la longitud de secuencia soportada.

El entrenamiento se apoya en un conjunto de fuentes de datos de fisica de fusion explicitamente acreditadas en la model card: FAIR-MAST (UKAEA), la base de datos HDB5 (DB5.2.3), PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. No se documentan el numero total de tokens, la composicion exacta del dataset ni si se aplico RLHF o DPO (poco probable en este dominio). La seleccion del checkpoint se realizo sobre 35 configuraciones mediante una regla de seleccion cuyos puntajes se guardan en `selection.json`, y se aportan dos semillas adicionales (`seed_1.pt`, `seed_2.pt`) para evaluar la variabilidad del entrenamiento.

## Capacidades

- Prediccion de series temporales de variables de plasma de tokamak en modo emulador de simulador.
- Modelado de dinamica temporal de escenarios de fusion (perfiles y evolucion de descargas, segun la receta "(f) simulator emulator").
- Evaluacion de variabilidad entre semillas de entrenamiento mediante los checkpoints `seed_1.pt` y `seed_2.pt`.
- Reproducibilidad del checkpoint del paper mediante la revision etiquetada `paper`.
- No dispone de generacion de texto, codigo, matematicas, vision ni audio.
- No dispone de soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues (no es un modelo de lenguaje).
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Emulacion rapida de simulador de plasma: sustituir llamadas costosas al simulador fisico por inferencia del transformer de 10M durante barridos de parametros de escenario, reduciendo el coste computacional por evaluacion.
- Diseno de escenarios en tokamaks como ITER, SPARC o STEP: usar el modelo para explorar configuraciones de descarga antes de validarlas con el simulador completo, apoyandose en las descripciones de maquina incluidas en el entrenamiento.
- Estudio de transiciones L-H y limites de densidad: aprovechar los datos de TCV y de la Open Density Limit Database para predecir el comportamiento cerca de estos regimenes.
- Investigacion en modelos de mundo para fusion: servir como linea base reproducible (checkpoint `paper` y semillas adicionales) para comparar arquitecturas y recetas en trabajos academicos.
- Analisis de sensibilidad y robustez: entrenar y evaluar variantes con las distintas semillas para cuantificar la incertidumbre del emulador en predicciones de evolucion temporal.
- Prototipado de control predictivo: integrar el emulador como modelo interno en un lazo de control simulado para estudiar estrategias de control de plasma sin depender del simulador en cada paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamano del modelo (10M de parametros); en FP32 los pesos ocupan aproximadamente 40 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; tambien CPU para inferencia puntual.
- Cabe en GPU consumer: si, sin restricciones practicas por memoria.
- Opciones de despliegue: los checkpoints son ficheros PyTorch (`.pt`) guardados por el codigo de entrenamiento, por lo que requieren cargarse con el codigo del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de mundo para plasmas de tokamak) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak); no es util fuera de ese ambito.
- No se documentan sesgos conocidos, pero al entrenarse con bases de datos de maquinas concretas (MAST, TCV, Alcator C-Mod, SPARC, STEP, ITER) puede generalizar mal a geometrias o regimenes no representados.
- Riesgo de error de emulacion: al ser un emulador de simulador, sus predicciones heredan y pueden amplificar las simplificaciones del simulador subyacente; no debe usarse como sustituto de validacion fisica.
- No se documentan limitaciones de contexto ni de idioma porque no es un modelo de lenguaje.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir bajo la misma licencia; las obras derivadas deben distribuirse con la misma licencia, lo que puede ser restrictivo en productos propietarios.
- Requisitos de atribucion adicionales: la model card exige citar y acreditar multiples fuentes de datos (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV, OpenSTEP, SPARCPublic, QLKNN10D/11D y descripciones de maquina), incluida la mencion obligatoria de Commonwealth Fusion Systems para SPARC.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria documentada.
- No se documenta el codigo de inferencia; solo se publican los checkpoints y metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_10m_f-sim
- Checkpoint del paper (revision `paper`, commit `122fb4022f0665efc90e90f31a4af3550c05e8e5`): https://huggingface.co/fusion-world-model/transformer_10m_f-sim/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (escenario SPP-001 de STEP): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D y QLKNN11D (QuaLiKiz): Zenodo doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de maquina: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1; MAST Upgrade, Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2; SPARC, Creely et al., J. Plasma Phys. 86 (2020) 865860502 y Phys. Plasmas 30 (2023) 090601; STEP, Meyer y STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406, y OpenSTEP, doi:10.14468/07jt-s540
