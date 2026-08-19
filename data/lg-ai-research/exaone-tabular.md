# LG-AI-Research/EXAONE-Tabular

## Resumen

EXAONE Tabular es un modelo fundacional transformer para datos tabulares desarrollado por LG AI Research. Resuelve problemas de clasificación y regresión mediante aprendizaje en contexto (in-context learning): se le pasan las filas etiquetadas a una función `fit` y el modelo predice nuevas filas en una única pasada hacia delante, sin actualizaciones de gradiente ni entrenamiento específico por conjunto de datos. Esto lo diferencia de los enfoques tradicionales de gradient boosting o AutoML, que requieren un ajuste por dataset.

El modelo emplea una arquitectura denominada Cross-axis Summary Transformer (CAST), con 12 capas transformer, dimensión de embedding de 192, 6 cabezas de atención y normalización SSMax. Se liberan dos checkpoints: uno para clasificación (20,8 millones de parámetros) y otro para regresión (21,1 millones). El repositorio de HuggingFace incluye el runtime de inferencia `exaonetabular`, con una API de estilo scikit-learn. La relevancia actual radica en que ofrece una alternativa de bajo coste y sin entrenamiento para tareas tabulares, un dominio donde los modelos de deep learning tradicionalmente han quedado por detrás de los métodos basados en árboles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-axis Summary Transformer (CAST) |
| Parametros totales | Clasificacion: 20.807.866 (≈20,8M); Regresion: 21.110.247 (≈21,1M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (aplica a filas y columnas, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos tabulares) |
| Licencia | exaone (pesos no comerciales; codigo con licencia permisiva) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en un transformer con arquitectura Cross-axis Summary Transformer (CAST). La configuración incluye 12 capas transformer, dimensión de embedding de 192, 6 cabezas de atención, expansión feed-forward de 4x, compartición de MLP simple, 2 operaciones de atención por característica por capa, 3 tokens de resumen a nivel de característica y 32 tokens de resumen a nivel de fila. La normalización de atención usa SSMax, una variante de softmax estabilizada. El diseño permite procesar simultáneamente la información a lo largo de dos ejes: el de las filas (muestras) y el de las columnas (características), de ahí el nombre "cross-axis".

No se han publicado detalles sobre el conjunto de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO o cualquier técnica de alineación. Tampoco se indica si hubo fases de preentrenamiento o ajuste fino específico. El enfoque principal es el aprendizaje en contexto: el modelo recibe un conjunto de soporte (filas etiquetadas) y predice sobre nuevas instancias en una sola pasada, sin ajuste de pesos.

## Capacidades

- Clasificacion tabular: predice etiquetas categoricas a partir de un conjunto de ejemplos etiquetados proporcionados en contexto.
- Regresion tabular: predice valores continuos con el mismo paradigma de aprendizaje en contexto.
- Inferencia sin entrenamiento: no requiere ajuste de pesos ni optimizacion por dataset; una sola pasada hacia delante con las filas de soporte.
- API estilo scikit-learn: integracion sencilla mediante metodos tipo `fit` y `predict`.
- Manejo de datos numericos y categoricos: el modelo acepta caracteristicas mixtas, aunque no se especifican detalles de preprocesamiento.
- Soporte de multiples conjuntos de datos: al ser un modelo fundacional, puede aplicarse a distintos dominios tabulares sin reentrenamiento.

## Casos de uso

- Clasificacion de credito: dado un historial de solicitudes etiquetadas (aprobado/denegado), el modelo puede clasificar nuevas solicitudes en una sola pasada, util para entornos donde no se dispone de tiempo para entrenar un modelo por cliente.
- Deteccion de fraude en transacciones: con un conjunto reducido de transacciones etiquetadas, EXAONE Tabular puede identificar transacciones sospechosas sin necesidad de reentrenar, ideal para escenarios con datos cambiantes.
- Prediccion de abandono de clientes (churn): a partir de un subconjunto de clientes con etiquetas de abandono, el modelo predice la probabilidad de que otros clientes se vayan, permitiendo campanas de retencion dirigidas.
- Segmentacion de clientes: clasificacion de clientes en segmentos predefinidos (por ejemplo, alto/medio/bajo valor) usando un pequeno conjunto de ejemplos de referencia.
- Estimacion de precios inmobiliarios: regresion sobre el valor de viviendas a partir de caracteristicas como superficie, ubicacion y antiguedad, con un conjunto de soporte de ventas recientes.
- Diagnostico medico basado en tablas: clasificacion de pacientes en grupos de riesgo usando variables clinicas tabulares, con la ventaja de no requerir entrenamiento especifico por hospital o especialidad.
- Preprocesamiento rapido en pipelines de datos: como modelo de referencia rapido para comparar con metodos clasicos (XGBoost, CatBoost) antes de decidir si merece la pena un entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye tablas con placeholders (—) para comparaciones con TabPFN v2, XGBoost, CatBoost y AutoGluon en suites como OpenML-CC18, AutoML Benchmark y TabZilla, pero los valores no estan rellenos. No se dispone de metricas de accuracy ni R².

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~21 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32 (los pesos ocupan unos 84 MB). Con cuantizacion a FP16 o int8, el consumo es aun menor.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; incluso CPU es viable para inferencia en lotes pequenos.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3060, RTX 4060, GTX 1660, etc. No se requiere hardware de centro de datos.
- Opciones de despliegue: el runtime se distribuye como paquete Python (`exaonetabular`) con API scikit-learn. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, que son tipicos de modelos de lenguaje. Para tabular, el despliegue es un simple proceso Python.
- Latencia y throughput: no disponible. Dado el tamano, se espera latencia en milisegundos por lote en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| EXAONE Tabular | 20,8M / 21,1M | In-context transformer | exaone (no comercial) | HuggingFace, GitHub |
| TabPFN v2 | ~9M (estimado) | In-context transformer | MIT (codigo), pesos no claros | GitHub, PyPI |
| XGBoost | N/A (GBDT) | Gradient boosting | BSD-3-Clause | Open source |
| CatBoost | N/A (GBDT) | Gradient boosting | Apache 2.0 | Open source |
| AutoGluon | N/A (AutoML) | Ensemble de modelos | Apache 2.0 | Open source |

La comparativa se basa en caracteristicas generales, no en rendimiento medido, ya que no hay benchmarks publicados. EXAONE Tabular se posiciona como alternativa in-context a TabPFN, con la diferencia de que TabPFN tiene una comunidad y benchmarks establecidos, mientras que EXAONE Tabular es mas reciente y con menos adopcion.

## Limitaciones y advertencias

- Licencia no comercial: los pesos estan bajo la licencia exaone, que restringe el uso comercial. El codigo del runtime es permisivo, pero los pesos no. Cualquier despliegue en produccion con fines comerciales requiere validacion legal.
- Sin benchmarks publicados: no hay evidencia empirica de rendimiento frente a metodos establecidos como XGBoost o TabPFN. Se desconoce su precision real en tareas estandar.
- Sin detalles de entrenamiento: no se ha publicado informacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos o limitaciones de generalizacion.
- Alcance limitado a datos tabulares: no procesa texto, imagenes ni audio; su uso se restringe a datos estructurados.
- Longitud de contexto no especificada: no se indica cuantas filas o columnas puede manejar en una sola pasada. Para conjuntos muy grandes, puede ser necesario dividir el contexto.
- Riesgo de sobreajuste al contexto: al depender de las filas de soporte, la calidad de la prediccion puede degradarse si el conjunto de soporte es pequeno o poco representativo.
- Comunidad y soporte limitados: con solo 7 likes y 1044 descargas, el modelo tiene una adopcion temprana; no hay garantias de mantenimiento a largo plazo.
- Documentacion incompleta: la model card contiene placeholders sin rellenar, lo que indica que el proyecto esta en fase inicial y puede haber cambios en la API o en los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/LG-AI-Research/EXAONE-Tabular
- GitHub: https://github.com/LGAI-Research/EXAONE-Tabular
- Pagina de LG AI Research: https://www.lgresearch.ai/exaone
- README en GitHub: https://github.com/LGAI-Research/EXAONE-Tabular/blob/main/README.md
