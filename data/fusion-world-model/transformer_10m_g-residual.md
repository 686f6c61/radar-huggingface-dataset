# fusion-world-model/transformer_10m_g-residual

## Resumen

`transformer_10m_g-residual` es un modelo de mundo (world model) para plasmas de tokamak desarrollado por el proyecto fusion-world-model. Se trata de un transformer de aproximadamente 10 millones de parametros entrenado para emular y corregir la dinamica temporal de plasmas de fusion, un dominio cientifico donde los simuladores fisicos son computacionalmente costosos y los datos experimentales son escasos. El modelo se presenta como parte de una receta denominada "emulador + correccion" (recipe g), en la que un emulador congelado de la fisica del plasma sirve de base y el transformer aprende una correccion residual sobre sus predicciones.

El repositorio incluye el checkpoint seleccionado (`final.pt`), dos replicas entrenadas con semillas distintas (`seed_1.pt`, `seed_2.pt`), el emulador congelado (`emulator.pt`), la configuracion de entrenamiento y los registros de seleccion y manifiesto. Su relevancia radica en que aborda la prediccion de series temporales fisicas en un regimen de datos limitados, empleando conocimiento fisico preexistente (el emulador) como sesgo inductivo, lo que es un patron habitual en el aprendizaje cientifico de dominios con escasez de datos.

La licencia es CC BY-SA 4.0, heredada de los datos FAIR-MAST (UKAEA) sobre los que se entreno. No se dispone de informacion sobre benchmarks publicos, idiomas naturales soportados ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de mundo para series temporales de plasma; receta emulador + correccion residual) |
| Parametros totales | Aproximadamente 10M (presupuesto declarado en el nombre y la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | No aplica / no disponible (modelo cientifico de series temporales, no de lenguaje natural) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), incluyendo `final.pt`, `seed_1.pt`, `seed_2.pt`, `emulator.pt` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de unos 10 millones de parametros que opera sobre series temporales de diagnostico de plasmas de tokamak. El diseno sigue la receta (g) "emulador + correccion": el modelo carga un emulador congelado (`emulator.pt`) que proporciona una prediccion base de la fisica del plasma, y el transformer aprende una correccion residual sobre esa salida. Este esquema hibrido reduce la carga de aprendizaje del transformer al no tener que modelar desde cero la dinamica fisica completa, sino solo la discrepancia entre el emulador y los datos reales.

El entrenamiento se realizo sobre datos de multiples bases de datos publicas de fusion: FAIR-MAST (UKAEA), la base de confinamiento H-mode internacional HDB5, la base de perfiles PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. El autor indica que se entrenaron 30 configuraciones y se selecciono la de indice 20 segun una regla de seleccion registrada en `selection.json`. No se especifica el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio, previsiblemente).

## Capacidades

- Prediccion/emulacion de series temporales de plasmas de tokamak mediante un transformer con correccion residual sobre un emulador fisico congelado.
- Modelado de mundo: representacion de la dinamica temporal del plasma para su uso en simulacion o control predictivo.
- Aprendizaje con datos fisicos limitados apoyado en un emulador como sesgo inductivo.
- Capacidad multilingue: no aplica (no es un modelo de lenguaje natural).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prediccion de la evolucion temporal de perfiles de plasma en tokamaks: el modelo puede sustituir total o parcialmente a simuladores fisicos costosos en bucles de diseno, al proporcionar una correccion rapida sobre la salida del emulador congelado.
- Control predictivo en tiempo real: al ser un modelo de 10M de parametros, su inferencia es ligera y puede integrarse en lazos de control de descarga donde la latencia de un simulador completo seria prohibitiva.
- Estudio de escenarios de operacion en reactores como ITER, SPARC o STEP: el modelo se entreno con descripciones de estas maquinas y bases de datos asociadas, por lo que puede emplearse para explorar configuraciones antes de campañas experimentales.
- Analisis de transiciones de confinamiento (L-H) y limites de densidad: las bases de datos de TCV y Alcator C-Mod incluidas en el entrenamiento permiten usar el modelo para caracterizar el comportamiento cerca de estos umbrales.
- Aumento de datos y generacion de trayectorias sinteticas: el modelo puede producir trayectorias plausibles de plasma para aumentar datasets escasos antes de entrenar otros modelos o planificar experimentos.
- Investigacion en aprendizaje cientifico con correccion residual: el checkpoint y la configuracion publicados sirven como referencia reproducible para estudiar el esquema emulador + correccion en series temporales fisicas.
- Validacion cruzada de emuladores: comparar la correccion aprendida por el transformer frente a la salida cruda del emulador permite diagnosticar sesgos del emulador en regimenes concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida dado el tamano de 10M de parametros; en FP32 los pesos ocupan aproximadamente 40 MB, y en FP16/bf16 unos 20 MB. No se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente; tambien es viable en CPU para inferencia puntual.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 1-2 GB de VRAM libre, incluyendo modelos de gama baja y placas integradas.
- Opciones de despliegue: los checkpoints son ficheros PyTorch (`.pt`) guardados por el codigo de entrenamiento del autor; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El despliegue requeriria cargar el checkpoint con PyTorch y el codigo/emulador correspondiente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un modelo de mundo especifico de dominio (plasmas de tokamak) con receta emulador + correccion; no se han identificado alternativas publicas equivalentes con las que comparar parametros, contexto, rendimiento o licencia a partir de los datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| transformer_10m_g-residual | ~10M | No disponible | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak); no es un modelo de lenguaje general ni sirve para tareas de NLP.
- Depende del emulador congelado `emulator.pt`: sin ese fichero el checkpoint no puede ejecutarse correctamente, ya que la correccion residual se define respecto a su salida.
- Riesgo de extrapolacion fuera de distribucion: al entrenarse sobre bases de datos y maquinas concretas (FAIR-MAST, HDB5, PR08, TCV, Alcator C-Mod, SPARC, STEP, ITER, MAST Upgrade), su fiabilidad fuera de esos regimenes no esta garantizada.
- No se han publicado benchmarks ni metricas de error, por lo que no es posible cuantificar su precision frente a simuladores fisicos.
- La licencia CC BY-SA 4.0 impone atribucion y compartir igual: cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede condicionar su uso en productos propietarios.
- Los datos de entrenamiento incluyen fuentes con condiciones de atribucion especificas (FAIR-MAST, HDB5, PR08, OpenSTEP, SPARCPublic, QLKNN); el uso del modelo debe respetar las citas y reconocimientos indicados por el autor.
- No se documentan sesgos, pero al derivar de un conjunto limitado de maquinas y escenarios, el modelo puede reproducir sesgos de esas bases de datos.
- No hay informacion sobre cuantizacion, contexto maximo ni requisitos de software mas alla de PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_10m_g-residual
- Checkpoint del paper (tag `paper`, commit `5951cec5253f9259cad1811638510f719e350e4d`): https://huggingface.co/fusion-world-model/transformer_10m_g-residual/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: doi:10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: doi:10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: doi:10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): doi:10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): doi:10.1088/1361-6587/adc8ce
- OpenSTEP, escenario SPP-001: doi:10.14468/07jt-s540
- Hudoba et al. 2024, Nucl. Fusion 64, 086055: doi:10.1088/1741-4326/ad6011 (referencia asociada a STEP)
- Tholerus et al. 2024, Nucl. Fusion 64, 106030: doi:10.1088/1741-4326/ad56a2 (referencia asociada a STEP)
- SPARCPublic, Creely et al. 2020, J. Plasma Phys. 86, 865860502
- SPARC, Creely et al. 2023, Phys. Plasmas 30, 090601
- QLKNN10D v1.0: doi:10.5281/zenodo.3497066
- QLKNN11D v1.0.0: doi:10.5281/zenodo.8017522
- van de Plassche et al. 2020, Phys. Plasmas 27, 022310: doi:10.1063/1.5134126
- ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1
- MAST Upgrade, Nucl. Fusion 64 (2024): doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- STEP, Meyer y STEP Team 2024, Phil. Trans. R. Soc. A 382, 20230406
