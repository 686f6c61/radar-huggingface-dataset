# DMIRLAB/ChorusTIC

## Resumen

ChorusTIC es un modelo fundacional especializado en clasificacion de series temporales, desarrollado por DMIRLAB. A diferencia de los modelos fundacionales de series temporales orientados a forecasting o a representaciones transferibles, ChorusTIC se disena de forma nativa para clasificacion y opera sin entrenamiento especifico por tarea: dado un conjunto de ejemplos etiquetados (support set) y una serie de consulta, predice la etiqueta directamente mediante in-context learning, sin ajustar un clasificador especifico ni actualizar los parametros del modelo.

El modelo aborda dos limitaciones habituales del area: por un lado, la necesidad de entrenar un clasificador por cada dataset objetivo; por otro, la codificacion independiente de cada canal en entradas multivariantes. ChorusTIC combina un nivel de modelado de senal ("Chorus" de senal) basado en Random Subchannel Slot Concatenation (RSSC) y un encoder compartido de doble eje, con un nivel de modelado de tarea ("Chorus" de tarea) basado en Column Distribution Modeling (CDM), interaccion de caracteristicas por filas e In-Context Learning (ICL).

El modelo se presenta como el numero 1 en la clasificacion global estandar del benchmark TSC-FM, con una precision media global de 78,56 sobre 198 datasets de clasificacion de series temporales (univariantes y multivariantes). El checkpoint se distribuye bajo licencia Apache 2.0 y esta pensado principalmente para investigacion sobre modelos fundacionales de series temporales y clasificacion sin entrenamiento. El numero de parametros y la longitud de contexto no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de series temporales de doble eje con Random Subchannel Slot Concatenation (RSSC) a nivel de senal, y Column Distribution Modeling (CDM), interaccion de caracteristicas por filas e In-Context Learning (ICL) a nivel de tarea |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de series temporales, no de lenguaje); no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (.ckpt) acompanado de configuracion JSON (model_hparams_latest.json) |
| Tamano del repositorio | 0,2 GB |
| Modalidad de entrada | Series temporales univariantes y multivariantes |
| Tarea principal | Clasificacion de series temporales sin entrenamiento (training-free), condicionada por support set |
| Fecha de creacion del repositorio | 2026-09-30 |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura de dos niveles. El nivel de senal, denominado "Chorus" de senal, emplea Random Subchannel Slot Concatenation (RSSC) junto con un encoder compartido de series temporales de doble eje, con el objetivo de capturar patrones temporales e interacciones entre canales bajo configuraciones heterogeneas de canales. El nivel de tarea, denominado "Chorus" de tarea, realiza clasificacion condicionada por el support set mediante Column Distribution Modeling (CDM), interaccion de caracteristicas por filas e In-Context Learning (ICL). Este diseno permite que un unico modelo preentrenado resuelva tareas univariantes y multivariantes sin optimizacion de parametros especifica por tarea en el momento de la inferencia.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en este dominio). Tampoco se detalla el numero de parametros del checkpoint. La innovacion tecnica destacada es el paradigma de inferencia sin entrenamiento: las predicciones se condicionan al contexto etiquetado en lugar de a una actualizacion de parametros, de modo que la calidad y composicion del support set influyen directamente en el rendimiento.

## Capacidades

- Clasificacion de series temporales univariantes sin entrenamiento especifico por tarea.
- Clasificacion de series temporales multivariantes con configuraciones heterogeneas de canales.
- Inferencia condicionada por contexto (in-context classification): la tarea se define mediante ejemplos etiquetados de soporte.
- Prediccion directa de etiquetas de consulta sin ajustar un clasificador adicional ni actualizar los parametros preentrenados.
- Modelado conjunto de patrones temporales e interacciones entre canales mediante RSSC y encoder de doble eje.
- Evaluacion sobre un benchmark heterogeneo de 198 datasets (UCR/UEA) segun el material proporcionado.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso. El modelo es especifico de clasificacion de series temporales.

## Casos de uso

- Clasificacion de senales biomedicas en investigacion: clasificacion de ECG o EEG a partir de un conjunto reducido de registros etiquetados, sin reentrenar un clasificador por cada cohorte o protocolo. Es adecuado porque el modelo adapta sus predicciones al support set en lugar de requerir ajuste de parametros.
- Monitorizacion industrial y mantenimiento predictivo: clasificacion de estados de maquinaria a partir de senales de vibracion o sensores de multiples canales, usando ejemplos historicos etiquetados como contexto. El soporte multivariante encaja con sensores heterogeneos.
- Reconocimiento de actividad humana (HAR): clasificacion de series de acelerometro y giroscopio en actividades a partir de un pequeno conjunto etiquetado, aprovechando el modelado de interacciones entre canales.
- Clasificacion de datos de sensores IoT: etiquetado de patrones operativos en flujos de sensores con canales variables sin disenar un pipeline de entrenamiento por despliegue.
- Deteccion y clasificacion de eventos en redes energeticas: categorizacion de patrones de consumo o perturbaciones a partir de ejemplos etiquetados previos, util cuando no se dispone de grandes volumenes de datos etiquetados por evento.
- Evaluacion comparativa de modelos fundacionales: uso como referencia en el benchmark TSC-FM para medir clasificacion sin entrenamiento sobre datasets UCR/UEA.
- Reproduccion y extension de resultados academicos: el repositorio oficial incluye codigo de carga, preprocesado, inferencia y evaluacion UCR/UEA, lo que facilita replicar los experimentos del articulo.
- Clasificacion con pocos ejemplos etiquetados (few-shot): escenarios donde etiquetar es costoso y se prefiere condicionar la prediccion a un support set pequeno en lugar de entrenar un modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card para el benchmark TSC-FM (conjunto de 198 datasets de clasificacion de series temporales univariantes y multivariantes):

| Metrica | Resultado |
| --- | ---: |
| Ranking global estandar TSC-FM | 1 |
| Precision media global | 78,56 |
| Cobertura de datasets | 198 / 198 |
| Paradigma de inferencia | In-context learning sin entrenamiento |

La puntuacion global TSC-FM se calcula con ponderacion equitativa entre los datasets evaluados. No se proporcionan en la informacion disponible resultados desglosados por dataset, ni comparaciones numericas frente a otros metodos del leaderboard. La clasificacion puede variar a medida que se anaden nuevos modelos y resultados al leaderboard oficial.

## Requisitos de hardware

- El tamano del repositorio del checkpoint es de 0,2 GB, lo que sugiere un modelo de peso reducido en comparacion con modelos fundacionales de lenguaje.
- VRAM estimada para inferencia: no disponible de forma oficial. Dado el tamano del checkpoint (0,2 GB), los pesos ocupan un espacio reducido, pero el consumo total depende del tamano del support set y del numero de canales de las series procesadas, datos que no se detallan.
- GPU recomendadas: no disponible. Por el tamano del checkpoint es plausible su ejecucion en GPU de consumo, aunque no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el tamano de 0,2 GB indica que no deberia ser un cuello de botella de memoria por los pesos.
- Opciones de despliegue: el repositorio oficial de GitHub proporciona modulos de modelo, carga de datos e inferencia para evaluacion UCR/UEA en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado en la informacion disponible datos de otros modelos comparables (parametros, contexto, resultados o licencia). Aunque ChorusTIC aparece como numero 1 en el leaderboard TSC-FM, no se incluyen en el material las cifras de los metodos competidores ni sus especificaciones, por lo que no es posible elaborar una comparativa con datos verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChorusTIC | no disponible | no disponible | Precision media global 78,56 en TSC-FM (198 datasets) | Apache 2.0 | Checkpoint en Hugging Face + codigo en GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento depende de la calidad y composicion del support set: la model card indica explicitamente que el contexto etiquetado puede afectar al resultado de las predicciones.
- No hay informacion sobre sesgos del modelo ni sobre la composicion del dataset de preentrenamiento, lo que dificulta evaluar sesgos por dominio o por tipo de senal.
- No se documentan tasas de error, calibracion ni comportamiento ante clases desbalanceadas o series fuera de distribucion.
- En clasificacion, el riesgo no es la alucinacion en sentido generativo, sino la asignacion de etiquetas incorrectas cuando el support set es escaso, poco representativo o mal etiquetado.
- No se especifican limitaciones de longitud de serie ni de numero de canales soportados; la longitud de contexto no esta disponible.
- El modelo no procesa lenguaje natural ni tiene capacidades multilingues; la fila de idiomas no es aplicable.
- Uso previsto principalmente de investigacion; aunque la licencia Apache 2.0 permite uso comercial, no se documentan garantias de robustez para produccion ni validaciones fuera del benchmark TSC-FM.
- El repositorio tiene 0 descargas y 2 likes en el momento de la informacion, por lo que la validacion externa por parte de la comunidad es practicamente nula.
- El leaderboard es dinamico y el ranking puede cambiar con la incorporacion de nuevos modelos y resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DMIRLAB/ChorusTIC
- Articulo (arXiv): https://arxiv.org/abs/2608.24033
- Version HTML del articulo: https://arxiv.org/html/2608.24033v1
- Codigo oficial (GitHub): https://github.com/DMIRLAB-Group/ChorusTIC
- Resultados de ChorusTIC en TSC-FM: https://tsc-fm.dmirlab.com/methods/chorustic
- Leaderboard TSC-FM: https://tsc-fm.dmirlab.com/leaderboard
- Protocolo de evaluacion TSC-FM: https://tsc-fm.dmirlab.com/evaluation
- Pagina principal del benchmark TSC-FM: https://tsc-fm.dmirlab.com/
- Descarga del checkpoint: `hf download DMIRLAB/ChorusTIC --local-dir Checkpoints_ChorusTIC`
