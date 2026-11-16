# fusion-world-model/lstm_100m_g-residual

## Resumen

`lstm_100m_g-residual` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el usuario `fusion-world-model`. Se trata de una red LSTM con un presupuesto de 100 millones de parametros, entrenada con la receta denominada "(g) emulator + correction", que combina un emulador congelado con un mecanismo de correccion. El modelo predice la evolucion temporal de variables del plasma en reactores de fusion, un problema de series temporales de alta dimensionalidad y fuerte acoplamiento fisico.

El modelo se publica junto al emulador congelado que utiliza en inferencia (`emulator.pt`) y a un conjunto de checkpoints adicionales entrenados con distintas semillas (`seed_1.pt`, `seed_2.pt`) para reproducibilidad. El checkpoint de referencia del articulo asociado esta etiquetado con el tag `paper` (commit `af289410e663a3a74836fd6be0fc3eed301ee1be`), y el checkpoint principal `final.pt` corresponde a la configuracion de indice 6 de las 30 exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion documentada en `selection.json`.

Es relevante porque aborda un dominio cientifico especializado (control y prediccion de plasmas en tokamaks como ITER, MAST Upgrade, SPARC y STEP) con un modelo compacto de 100M de parametros, y porque libera pesos, configuracion de entrenamiento, emulador y manifiesto de integridad bajo licencia CC BY-SA 4.0, lo que facilita su reproduccion y auditoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) con emulador congelado y correccion residual; receta "(g) emulator + correction" |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje natural) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de 100 millones de parametros que opera como modelo del mundo de plasmas de tokamak. La receta de entrenamiento se denomina "(g) emulator + correction": el modelo se entrena junto a un emulador congelado (`emulator.pt`) que se carga en inferencia, y aprende una correccion sobre las predicciones de dicho emulador. El checkpoint `final.pt` corresponde a la configuracion de indice 6 entre las 30 exploradas en una busqueda de hiperparametros; la seleccion se realizo mediante una regla documentada en `selection.json`, que contiene las puntuaciones de seleccion.

Los datos de entrenamiento provienen de bases de datos publicas de fisica de plasmas de tokamak, entre ellas FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database, DB5.2.3), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database (Alcator C-Mod), la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la informacion disponible el numero total de tokens ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de series temporales de este tipo).

## Capacidades

- Prediccion de la evolucion temporal de variables de plasma en tokamaks (modelo del mundo para series temporales fisicas).
- Emulacion de perfiles y escenarios de plasma apoyada en el emulador congelado `emulator.pt`.
- Correccion residual sobre las predicciones del emulador, lo que permite refinar la salida del modelo base.
- Reproducibilidad mediante multiples semillas (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza del entrenamiento.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni multilingues; el modelo no es un modelo de lenguaje.

## Casos de uso

- Prediccion de escenarios de plasma en tokamaks: el modelo puede proyectar la evolucion temporal de variables del plasma a partir de condiciones iniciales y de control, util para planificar descargas en maquinas como ITER, SPARC o STEP.
- Emulacion rapida de codigos fisicos: al incorporar un emulador congelado, permite sustituir simulaciones costosas por evaluaciones rapidas de la red neuronal en bucles de optimizacion de escenarios.
- Control en tiempo real de descargas: la naturaleza recurrente del modelo y su tamano compacto (100M) lo hacen apto para integrarse en bucles de control que requieren latencia baja, aunque la latencia exacta no esta documentada.
- Estudio de transiciones de confinamiento (L-H): entrenado con la base de datos de transicion L-H de TCV, puede emplearse para analizar y predecir el comportamiento cerca de dicha transicion.
- Analisis de limites de densidad: el uso de la Open Density Limit Database (Alcator C-Mod) permite emplear el modelo en estudios de limites operativos de densidad.
- Investigacion reproducible en fusion: la publicacion de pesos, configuracion, emulador y manifiesto de integridad facilita la comparacion de metodos de modelado del mundo en plasmas y la extension de la receta a otras maquinas.
- Evaluacion de incertidumbre mediante semillas: los checkpoints `seed_1.pt` y `seed_2.pt` permiten estimar la variabilidad del modelo y construir ensembles para cuantificar incertidumbre en predicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100M de parametros en precision FP32, el peso de los pesos ronda los 400 MB; en FP16, unos 200 MB. A ello hay que sumar el emulador congelado `emulator.pt`, cuyo tamano no se especifica en la informacion disponible, y el estado recurrente de la LSTM.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo cabe con holgura en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, asi como en A100 o H100, pero no se documentan requisitos oficiales.
- Cabe en GPU de consumo: si, por el reducido numero de parametros, aunque el requisito exacto depende del emulador y del lote.
- Opciones de despliegue: el modelo se guarda como ficheros PyTorch (`.pt`) y se carga con el codigo de entrenamiento del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models de plasmas de tokamak con arquitectura LSTM y 100M de parametros) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta especializado en plasmas de tokamak; no es un modelo de lenguaje y no debe emplearse para tareas de texto, codigo o vision.
- No se documentan sesgos conocidos, pero al entrenarse con bases de datos de maquinas concretas (FAIR-MAST, Alcator C-Mod, TCV, SPARC, STEP, ITER, MAST Upgrade) su generalizacion a otras maquinas o regimenes no esta garantizada.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de predicciones fisicamente inconsistentes fuera del dominio de entrenamiento.
- La licencia CC BY-SA 4.0 permite uso comercial con atribucion y compartir igual; las obras derivadas deben distribuirse bajo la misma licencia. Ademas, deben respetarse las atribuciones y condiciones de las fuentes de datos originales (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV, OpenSTEP, SPARCPublic, QLKNN10D/11D y descripciones de maquina), algunas con requisitos especificos de citacion o reconocimiento.
- El rendimiento depende del emulador congelado `emulator.pt`; cambios o sustituciones del emulador pueden alterar las predicciones.
- No se documentan la longitud de contexto, los tipos de cuantizacion, los idiomas ni los requisitos de hardware, lo que limita la evaluacion previa a produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa publica documentada.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_100m_g-residual
- Checkpoint del articulo (tag `paper`, commit `af289410e663a3a74836fd6be0fc3eed301ee1be`): https://huggingface.co/fusion-world-model/lstm_100m_g-residual/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de maquina: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1; MAST Upgrade, Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2; SPARC, Creely et al., J. Plasma Phys. 86 (2020) 865860502 y Phys. Plasmas 30 (2023) 090601; STEP, Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
