# PYTHAI/chronos-2-fork

## Resumen

Chronos-2 es un modelo fundacional de series temporales desarrollado por Amazon Science (AutoGluon) y distribuido en este repositorio como un fork de referencia mantenido por PYTHAI (mindX) sobre el commit `60088152a34e242427b44c3100014473a0157d53` del repositorio original `autogluon/chronos-2`. Se trata de un modelo encoder-only de 119,5 millones de parametros inspirado en la arquitectura del encoder de T5, disenado especificamente para pronostico zero-shot de series temporales. Resuelve el problema de predecir valores futuros en series temporales sin necesidad de entrenamiento especifico por dominio, cubriendo tareas univariantes, multivariantes y con covariables en una unica arquitectura.

Su relevancia actual radica en que unifica en un solo modelo capacidades que antes requerian arquitecturas o pipelines distintos: aprendizaje cruzado entre series (cross-learning), pronostico multivariante nativo, covariables pasadas y futuras (reales y categoricas), una ventana de contexto de hasta 8192 pasos y un horizonte de prediccion de hasta 1024 pasos. Segun la model card, alcanza precision zero-shot de referencia entre los modelos publicos en fev-bench, GIFT-Eval y Chronos Benchmark II, y es altamente eficiente: mas de 300 pronosticos de series por segundo en una unica GPU A10G, con soporte tanto de inferencia en GPU como en CPU.

El modelo se publica bajo licencia Apache 2.0 y se distribuye en formato safetensors con la libreria `chronos-forecasting` (version >= 2.0). El fork de PYTHAI copia los pesos y es autonomo, manteniendose como modelo de referencia tras su seleccion en la lista de KDnuggets "7 Most Downloaded AI Models on Hugging Face" (24 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only inspirado en T5, con mecanismo de group attention para aprendizaje en contexto |
| Parametros totales | 119.477.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 pasos temporales |
| Longitud maxima de prediccion | 1024 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | chronos-forecasting >= 2.0 |
| Tamano del repo | 0,5 GB |
| Pipeline | time-series-forecasting |
| Salida | Pronosticos cuantilicos multi-paso |

## Arquitectura y entrenamiento

Chronos-2 es un transformer encoder-only de 120M de parametros inspirado en el encoder de T5. A diferencia de Chronos y Chronos-Bolt, que solo soportaban pronostico univariante, Chronos-2 incorpora un mecanismo de group attention que permite el aprendizaje en contexto (in-context learning) a traves de series relacionadas y covariables, habilitando de forma nativa el pronostico multivariante, el cross-learning entre items y el uso de covariables pasadas y futuras, tanto reales como categoricas. El modelo produce pronosticos cuantilicos multi-paso, lo que permite obtener intervalos de incertidumbre ademas de la prediccion puntual.

El entrenamiento combina datos del mundo real con datasets sinteticos a gran escala, empleando los conjuntos `autogluon/chronos_datasets` y `Salesforce/GiftEvalPretrain`. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion precisa del dataset ni si se aplicaron tecnicas de RLHF o DPO (no disponibles). La innovacion tecnica principal es la unificacion de tareas univariantes, multivariantes y con covariables en una sola arquitectura con contexto de 8192 pasos, frente a los 2048 de Chronos-Bolt y los 512 de Chronos.

## Capacidades

- Pronostico univariante zero-shot de series temporales.
- Pronostico multivariante nativo dentro de una misma arquitectura.
- Cross-learning entre multiples series relacionadas (items) en una sola pasada.
- Soporte nativo de covariables pasadas reales y categoricas.
- Soporte nativo de covariables futuras conocidas reales y categoricas.
- Generacion de pronosticos cuantilicos multi-paso (por ejemplo, cuantiles 0.1, 0.5, 0.9) para modelar incertidumbre.
- Contexto de hasta 8192 pasos y horizonte de prediccion de hasta 1024 pasos.
- Inferencia tanto en GPU como en CPU.
- API basada en pandas DataFrames (entrada de contexto y covariables, salida de pronosticos).
- No dispone de tool calling, capacidades de agente, vision, audio ni generacion de texto: es un modelo especializado exclusivamente en series temporales.

## Casos de uso

- Pronostico de demanda energetica: usar la API `predict_df` con el contexto historico de precios o consumo electrico y covariables futuras conocidas (calendario, festivos) para generar pronosticos horarios con cuantiles, aprovechando el contexto de 8192 pasos para capturar estacionalidades largas.
- Planificacion de inventario retail: alimentar multiples series de ventas por producto con cross-learning entre items, de modo que el modelo comparta patrones entre productos con historiales cortos y mejore el pronostico de referencias con pocos datos.
- Prediccion de precios de electricidad: el ejemplo oficial de la model card carga un dataset de precios de electricidad y genera pronosticos a 24 pasos con cuantiles 0.1, 0.5 y 0.9, adecuado para estrategias de compra/venta y gestion de riesgo.
- Monitorizacion de metricas de infraestructura: pronosticar series multivariantes de latencia, CPU y memoria de forma conjunta para detectar desviaciones antes de que se produzcan incidentes, con despliegue en CPU para entornos sin GPU.
- Pronostico financiero y de KPIs de negocio: series de ingresos, conversion o churn con covariables de campanas y estacionalidad, generando intervalos de confianza para planificacion presupuestaria.
- Despliegue serverless en produccion: usar AutoGluon-Cloud o SageMaker JumpStart para exponer un endpoint en tiempo real o batch que recibe DataFrames de pandas y devuelve pronosticos, con mas de 300 series por segundo en una A10G.
- Investigacion en modelos fundacionales de series temporales: evaluar zero-shot sobre fev-bench, GIFT-Eval y Chronos Benchmark II sin reentrenamiento, sirviendo como linea base para comparativas.

## Benchmarks y rendimiento

La model card afirma que Chronos-2 alcanza precision zero-shot de referencia entre los modelos publicos en fev-bench, GIFT-Eval y Chronos Benchmark II, pero no se incluyen cifras numericas concretas en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| fev-bench | SOTA zero-shot segun la model card (sin cifras) |
| GIFT-Eval | SOTA zero-shot segun la model card (sin cifras) |
| Chronos Benchmark II | SOTA zero-shot segun la model card (sin cifras) |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 119,5M de parametros en safetensors, el peso en precision completa ronda los 0,5 GB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: la model card cita una unica A10G para alcanzar mas de 300 pronosticos de series por segundo; tambien se menciona `ml.g5.xlarge` como instancia de despliegue en SageMaker.
- Cabe en GPU consumer: si, dado el reducido tamano del modelo (0,5 GB de pesos); no se especifican modelos concretos de consumo en la informacion disponible.
- Inferencia en CPU: soportada de forma nativa.
- Opciones de despliegue: paquete `chronos-forecasting` (>= 2.0) con `Chronos2Pipeline`, AutoGluon-Cloud (real-time, serverless y batch) y SageMaker JumpStart.
- Latencia y throughput: mas de 300 pronosticos de series por segundo en una A10G segun la model card; no se detalla la latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto max. | Prediccion max. | Multivariante | Covariables futuras | Licencia |
|---|---|---|---|---|---|---|
| Chronos-2 | 119,5M | 8192 | 1024 | Si | Si (nativo) | Apache 2.0 |
| Chronos-Bolt | no disponible | 2048 | 64 | No | Parcial (via regresores externos) | Apache 2.0 |
| Chronos | no disponible | 512 | 64 | No | Parcial (via regresores externos) | Apache 2.0 |

Chronos-2 amplia el contexto de 2048 a 8192 pasos y el horizonte de 64 a 1024 pasos respecto a Chronos-Bolt, y anade soporte nativo de pronostico multivariante, cross-learning entre items y covariables futuras reales y categoricas, capacidades ausentes en las generaciones anteriores. No se dispone de datos de parametros ni de rendimiento numerico de Chronos y Chronos-Bolt en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en series temporales: no genera texto, no soporta tool calling, agentes, vision ni audio.
- No se detallan sesgos conocidos en la informacion disponible; al entrenarse con datasets reales y sinteticos, puede heredar sesgos de las series de entrenamiento.
- Riesgo de alucinacion en el sentido de pronosticos poco fiables fuera de la distribucion de los datos de entrenamiento o con series muy cortas o atipicas.
- El contexto maximo es de 8192 pasos; series mas largas requieren truncado o agregacion.
- El horizonte maximo de prediccion es de 1024 pasos; pronosticos mas largos requieren estrategias recursivas no documentadas.
- No se especifican los idiomas soportados porque el modelo no procesa lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, pero el fork debe conservar los avisos de licencia y atribucion correspondientes (ver LICENSE y FORK.json en el repositorio).
- Este fork concreto de PYTHAI tiene 0 descargas y 0 likes en el momento de la consulta; para produccion conviene valorar el repositorio original `autogluon/chronos-2`.
- No se dispone de informacion sobre cuantizaciones soportadas ni sobre latencias por peticion en entornos de produccion.

## Enlaces

- Repositorio Hugging Face del fork: https://huggingface.co/PYTHAI/chronos-2-fork
- Repositorio original: https://huggingface.co/autogluon/chronos-2/tree/60088152a34e242427b44c3100014473a0157d53
- Informe tecnico: https://arxiv.org/abs/2510.15821v1
- Paper Chronos Benchmark II: https://arxiv.org/abs/2403.07815
- GitHub: https://github.com/amazon-science/chronos-forecasting
- Notebook de inicio rapido: https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/chronos-2-quickstart.ipynb
- Notebook de despliegue en SageMaker: https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/deploy-chronos-to-amazon-sagemaker.ipynb
- Blog de Amazon Science: https://www.amazon.science/blog/introducing-chronos-2-from-univariate-to-universal-forecasting
- Guia de despliegue con AutoGluon-Cloud: https://auto.gluon.ai/cloud/stable/tutorials/foundation-model-timeseries.html
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-leaderboard
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Dataset de entrenamiento: https://huggingface.co/datasets/autogluon/chronos_datasets
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/GiftEvalPretrain
- Sitio del mantenedor del fork: https://mindx.pythai.net
