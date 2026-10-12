# general-forecast/kumo-tabular-small-regressor

## Resumen

Kumo Tabular small regressor es un modelo de regresión para datos tabulares, distribuido por el usuario general-forecast bajo el identificador `general-forecast/kumo-tabular-small-regressor`. No se trata de un modelo entrenado desde cero por ese autor, sino de una conversión a formato safetensors del submodelo `small/regressor.pt` de NVIDIA, publicado originalmente en el repositorio `nvidia/Kumo-Tabular` (revision `3c3e10bbdb590ace29e7026847f92db3c603096d`). La model card indica explícitamente que los pesos son idénticos a los originales; el único trabajo realizado ha sido el cambio de formato para que puedan cargarse desde la librería `gfi`.

El modelo es un regresor tabular que emite 999 cuantiles como salida, lo que permite obtener una distribución predictiva completa en lugar de una única estimación puntual. Está etiquetado con las categorías `tabular`, `in-context-learning` y `kumo-tabular`, lo que sitúa su uso en el paradigma de los modelos fundacionales para datos estructurados: predicción sobre tablas sin reentrenamiento específico por tarea. Cuenta con 28.466.343 parámetros totales (aproximadamente 28,5 millones) y el repositorio ocupa 0,1 GB, lo que lo convierte en un modelo muy ligero.

Su relevancia actual reside en dos factores. Por un lado, forma parte de la familia Kumo Tabular de NVIDIA, orientada a cubrir el hueco de los modelos fundacionales en dominios tabulares, históricamente dominados por gradient boosting (XGBoost, LightGBM, CatBoost). Por otro lado, la licencia OpenMDW 1.1 y el formato safetensors facilitan su integración en flujos de trabajo en Python. La información disponible no detalla la arquitectura interna, la longitud de contexto ni los datos de entrenamiento, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo tabular de regresion con in-context learning; la model card no describe la arquitectura interna) |
| Parametros totales | 28.466.343 (aproximadamente 28,5 M) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se declaran cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (modelo tabular; no se declara soporte de idiomas) |
| Licencia | OpenMDW 1.1 (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | safetensors (`model.safetensors`), con nombres de parametro equivalentes al modelo PyTorch original |
| Numero de cuantiles de salida | 999 |
| Tamano del repositorio | 0,1 GB |
| Libreria de carga | gfi |
| Modelo base | nvidia/Kumo-Tabular (revision 3c3e10bbdb590ace29e7026847f92db3c603096d) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. La model card se limita a indicar que se trata de una conversion de `small/regressor.pt` perteneciente a `nvidia/Kumo-Tabular`, que los pesos no se han modificado y que el modelo es un regresor que emite 999 cuantiles. El fichero `config.json` del repositorio contiene los campos `architecture_name` y `config`, con los tamanos definidos en NVIDIA como `MODEL_KWARGS["small"]` dentro del repositorio `structured-data-models`, pero los valores concretos de esos campos no se detallan en la informacion disponible.

Tampoco se especifica el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Lo unico que puede afirmarse con la informacion disponible es que el modelo sigue el paradigma de in-context learning aplicado a datos tabulares, lo que implica que la prediccion se realiza condicionada a un conjunto de ejemplos aportados en la propia entrada en lugar de requerir un reentrenamiento por tarea. Cualquier afirmacion adicional sobre atencion, numero de capas, dimensiones ocultas o mecanismos de entrenamiento seria especulativa.

## Capacidades

- Regresion sobre datos tabulares: el modelo genera una salida de 999 cuantiles, lo que permite construir una distribucion predictiva y derivar intervalos de confianza o predicciones puntuales (por ejemplo, la mediana).
- In-context learning: la etiqueta `in-context-learning` indica que el modelo puede adaptarse a una tarea concreta a partir de ejemplos proporcionados en la entrada, sin ajuste de pesos.
- Prediccion cuantilica completa: al emitir 999 cuantiles, permite calcular medidas de incertidumbre, percentiles y colas de la distribucion, algo util en escenarios de riesgo.
- Integracion con la libreria gfi: los pesos estan preparados para cargarse con `gfi` desde GitHub, lo que facilita su uso en pipelines en Python.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingues: no aplica ni se declaran.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Prediccion de precios y valoraciones: dado un conjunto de ejemplos historicos de inmuebles, vehiculos u otros activos con sus caracteristicas tabulares, el modelo puede estimar el valor de nuevos registros y, gracias a los 999 cuantiles, ofrecer un rango de precios con nivel de confianza.
- Scoring de riesgo crediticio: en entidades financieras, el regresor puede estimar la probabilidad o el importe esperado de impago a partir de variables tabulares del solicitante, aprovechando la salida cuantilica para modelar el riesgo en la cola de la distribucion.
- Prevision de demanda y series tabulares agregadas: para predecir ventas o consumo por producto, tienda y periodo cuando los datos se presentan como una tabla de caracteristicas numericas y categoricas.
- Estimacion de costes operativos: en logistica o seguros, el modelo puede predecir costes por envio, siniestro o poliza a partir de variables estructuradas, con intervalos que ayuden a dimensionar provisiones.
- Analisis de incertidumbre en experimentos cientificos: dado que emite una distribucion de cuantiles, resulta util para cuantificar la incertidumbre de una medida predicha a partir de covariables tabulares.
- Validate de modelos tabulares tradicionales: puede emplearse como referencia (baseline) de un modelo fundacional frente a XGBoost o LightGBM en tareas de regresion, ya que su tamano de 28,5 M de parametros permite ejecutarlo en hardware modesto.
- Prototipado rapido con in-context learning: para equipos que necesitan una primera estimacion sin entrenar un modelo propio, basta con aportar ejemplos en la entrada y cargar los pesos con `gfi`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de RMSE, MAE, R2 ni comparaciones con otros modelos, y los resultados de la busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP32): aproximadamente 114 MB, calculados a partir de los 28.466.343 parametros (4 bytes por parametro).
- VRAM estimada en media precision (FP16 o BF16): aproximadamente 57 MB.
- VRAM estimada en int8: aproximadamente 28 MB.
- Estas cifras corresponden unicamente a los pesos; hay que anadir la memoria de las activaciones y del lote de datos tabulares de entrada, que en este tipo de modelos suele crecer con el numero de filas de contexto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para los pesos en precision reducida. Se puede ejecutar en tarjetas de gama de entrada, integradas modernas e incluso en CPU, dado el tamano reducido.
- Cabe en GPU de consumo: si, con amplio margen, en cualquier GPU de consumo actual (por ejemplo, series RTX 20xx, 30xx, 40xx) e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: la model card indica la libreria `gfi` como via de carga. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no se documentan esos backends.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| general-forecast/kumo-tabular-small-regressor | 28,5 M | no disponible | Regresion tabular (999 cuantiles) | OpenMDW 1.1 | HuggingFace, formato safetensors |
| nvidia/Kumo-Tabular (modelo base) | no disponible (el submodelo small/regressor.pt es el origen de esta conversion) | no disponible | Regresion tabular | OpenMDW 1.1 | HuggingFace y GitHub de NVIDIA |
| Otros modelos fundacionales tabulares (por ejemplo, la familia TabPFN) | no disponible | no disponible | Clasificacion y regresion tabular con in-context learning | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento comparativo entre estas alternativas, por lo que la comparativa se limita a parametros declarados, tarea y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos. Al ser un modelo tabular, los sesgos dependeran de los datos con los que se entreno el modelo original de NVIDIA, que no se describen.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos de lenguaje, pero si existe riesgo de predicciones poco fiables fuera de la distribucion de datos con la que se entreno el modelo.
- No se declara la longitud de contexto ni el numero maximo de filas o columnas de entrada, por lo que el comportamiento con tablas grandes o con muchas caracteristicas es desconocido.
- No se declaran idiomas soportados; el modelo opera sobre caracteristicas tabulares, no sobre texto libre.
- Restricciones de licencia: se distribuye bajo OpenMDW 1.1, etiquetada como `license: other` en HuggingFace. Es imprescindible revisar el fichero `LICENSE` del repositorio y los terminos de OpenMDW 1.1 antes de un uso comercial. Los derechos de autor de NVIDIA se mantienen en el aviso de licencia.
- Al ser una conversion de pesos sin cambios, cualquier limitacion del modelo original de NVIDIA se traslada integramente a esta version.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria documentada.
- Para produccion, conviene validar el modelo contra un baseline tabular clasico (XGBoost, LightGBM) en el dominio concreto antes de sustituir un sistema existente.
- La fecha de creacion y actualizacion del repositorio figura como 2026-10-11, dato que se reproduce tal cual aparece en la informacion consultada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/general-forecast/kumo-tabular-small-regressor
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Kumo-Tabular
- Repositorio NVIDIA structured-data-models: https://github.com/NVIDIA/structured-data-models
- Libreria gfi: https://github.com/generalforecast/gfi
- Licencia OpenMDW 1.1: consultar el fichero `LICENSE` del repositorio en HuggingFace
