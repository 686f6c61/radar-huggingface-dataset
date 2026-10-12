# ibm-granite/granite-embedding-small-english-r2

## Resumen

Granite-embedding-small-english-r2 es un modelo de embeddings denso de tipo bi-encoder desarrollado por IBM dentro de la coleccion Granite Embeddings. Con 47 millones de parametros, genera representaciones vectoriales de 384 dimensiones a partir de entradas de texto de hasta 8192 tokens de contexto, y esta disenado para tareas de similitud semantica, recuperacion de informacion y busqueda. Se distribuye bajo licencia Apache 2.0 y solo soporta ingles.

El modelo forma parte de la segunda generacion (r2) de embeddings de IBM, construida sobre la arquitectura ModernBERT, y sustituye al anterior granite-embedding-30m-english. La propuesta de valor del r2 en su version "small" es ofrecer una ventana de contexto muy amplia (8192 tokens) manteniendo un tamano reducido (47M de parametros) y una salida de embedding compacta (384 dimensiones), algo que IBM describe como "first-of-its-kind" en modelos de este tamano.

Su relevancia actual reside en que combina un coste computacional bajo con soporte de contexto largo, ademas de estar entrenado exclusivamente con datos de relevancia de licencia permisiva (open source y datasets propios de IBM), lo que facilita su uso comercial en pipelines de recuperacion, RAG y busqueda empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (bi-encoder denso) |
| Parametros totales | 47.662.464 (aproximadamente 47M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Dimension del embedding de salida | 384 |
| Tipos de cuantizacion | no disponible (repo oficial en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch |
| Libreria | sentence-transformers |
| Pooling | CLS pooling |
| Fecha de publicacion | 15 de agosto de 2025 |
| Tamano del repositorio | 0,3 GB |
| Descargas | 5.225.333 |
| Likes | 97 |

## Arquitectura y entrenamiento

El modelo es un bi-encoder denso basado en ModernBERT, una arquitectura transformer actualizada que IBM adopta para toda la familia r2. La version "small" reduce el numero de capas y el tamano del embedding de salida (384 dimensiones) frente a la version completa granite-embedding-english-r2 (149M de parametros y 768 dimensiones), manteniendo el soporte de contexto de hasta 8192 tokens. El modelo produce un vector de longitud fija por texto, lo que permite comparar consultas, pasajes y documentos mediante similitud coseno. Para acelerar la inferencia admite Flash Attention 2 (opcional).

El entrenamiento combina varias etapas segun la model card: preentrenamiento orientado a recuperacion (retrieval-oriented pretraining), ajuste fino contrastivo, destilacion de conocimiento (knowledge distillation) y fusion de modelos (model merging). IBM indica que el modelo se entreno unicamente con datasets de pares de relevancia de codigo abierto con licencia permisiva y aptos para uso empresarial, ademas de datasets recopilados y generados por la propia IBM. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de embeddings de texto de longitud fija (384 dimensiones) para consultas, pasajes y documentos.
- Recuperacion de informacion (retrieval) y busqueda semantica mediante similitud coseno.
- Evaluado en recuperacion estandar (BEIR, MTEB-v2) y en benchmarks propios de IBM (ClapNQ).
- Recuperacion de codigo (COIR).
- Busqueda en documentos largos (MLDR, LongEmbed) gracias a su contexto de 8192 tokens.
- Recuperacion conversacional multi-turno (MTRAG).
- Recuperacion sobre tablas (NQTables, OTT-QA, AIT-QA, MultiHierTT, OpenWikiTables).
- Soporte de contexto largo de hasta 8192 tokens en una unica pasada.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso.
- Capacidad multilinguo: no; solo ingles.
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el modelo genera embeddings de los fragmentos de una base documental y de la consulta del usuario; su contexto de 8192 tokens permite indexar fragmentos largos sin trocear en exceso, y su tamano de 47M reduce el coste de indexado masivo.
- Busqueda semantica empresarial: sobre corpus internos (documentacion, tickets, correos) aprovechando que fue entrenado con datos de relevancia de licencia permisiva y apta para empresa, lo que simplifica el cumplimiento legal en despliegues comerciales.
- Recuperacion sobre tablas: para consultas en bases de datos estructuradas (NQTables, OTT-QA, AIT-QA), integrable en asistentes de analisis de datos que necesitan localizar la tabla o fila relevante.
- Recuperacion de codigo en herramientas de desarrollo: busqueda de fragmentos de codigo en repositorios o documentacion tecnica (benchmark COIR), util en asistentes de IDE y bases de conocimiento de ingenieria.
- Recuperacion conversacional multi-turno: en asistentes de atencion al cliente, donde el sistema necesita localizar el pasaje relevante teniendo en cuenta el historial de la conversacion (MTRAG).
- Deduplicacion y agrupamiento de documentos: calcular similitud entre grandes volumenes de texto para detectar duplicados o agrupar tematicamente, gracias al bajo coste por documento del modelo.
- Clasificacion y filtrado por similitud: usar los embeddings como caracteristicas para clasificadores ligeros, moderacion de contenido o enrutamiento de consultas hacia el modelo generativo adecuado.

## Benchmarks y rendimiento

IBM reporta que los modelos r2 obtienen un rendimiento solido en BEIR, MTEB-v2, CoIR, MLDR, LongEmbed, MTRAG y en un conjunto de benchmarks de recuperacion de tablas (NQTables, OTT-QA, AIT-QA, MultiHierTT, OpenWikiTables), asi como en casos de uso empresariales propios. Sin embargo, en la informacion proporcionada no se incluyen las cifras numericas de estos resultados (las tablas aparecen truncadas) ni la comparacion cuantitativa con modelos similares.

"No se han publicado resultados de benchmarks numericos en la informacion disponible."

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 190 MB en FP32, en torno a 95 MB en FP16/BF16 y unos 48 MB en INT8.
- La memoria adicional depende de la longitud de secuencia: con contexto de 8192 tokens el consumo crece por las activaciones y la atencion, aunque sigue siendo moderado dado el tamano del modelo.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, 4090, etc.) e incluso en GPUs integradas o en CPU.
- GPU recomendadas para indexado a gran escala (throughput): A100, H100 u otras GPU de centro de datos; la model card menciona la codificacion de documentos en un unico H100 (la cifra de velocidad aparece truncada en la informacion disponible).
- Opciones de despliegue: sentence-transformers, Hugging Face Transformers (PyTorch), Text Embeddings Inference (TEI, etiquetado como compatible), endpoints de Hugging Face y despliegue en Azure (segun las etiquetas del repositorio). Soporte opcional de Flash Attention 2 para acelerar la inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| granite-embedding-small-english-r2 | 47M | 384 | 8192 | en | Apache 2.0 |
| granite-embedding-english-r2 | 149M | 768 | 8192 | en | Apache 2.0 |
| granite-embedding-30m-english (sustituido) | no disponible | no disponible | no disponible | en | no disponible |

La comparacion principal que aporta la propia model card es frente a granite-embedding-english-r2, que sustituye a granite-embedding-125m-english: la version complete usa mas parametros y una salida de 768 dimensiones, mientras que la version "small" reduce tamano y dimension manteniendo los 8192 tokens de contexto. No se dispone en la informacion proporcionada de una comparativa cuantitativa de rendimiento frente a modelos de terceros (por ejemplo, modelos de embeddings de tamano similar de otros proveedores).

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles; no ofrece embeddings multilingues ni en castellano.
- Es un modelo de embeddings, no generativo: no produce texto, no realiza razonamiento, tool calling ni generacion de codigo.
- Riesgo de alucinacion: no aplica directamente al no generar texto, pero los resultados de recuperacion pueden devolver pasajes poco relevantes si la consulta esta fuera de dominio.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse con datos de relevancia de codigo abierto, puede heredar sesgos de esas fuentes.
- Contexto: aunque admite 8192 tokens, la calidad de la representacion puede degradarse con truncamientos o textos que superen esa longitud.
- Licencia Apache 2.0: permite uso comercial sin restricciones de licencia segun los terminos de dicha licencia, si bien conviene revisar las condiciones de los datos de terceros utilizados en el entrenamiento.
- Produccion: no se publican cifras de latencia ni throughput en la informacion disponible, por lo que el dimensionado debe hacerse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-embedding-small-english-r2
- Paper (Granite Embedding R2 Models): https://arxiv.org/abs/2508.21085
- Codigo del repositorio de modelos de embeddings de Granite: https://github.com/ibm-granite/granite-embedding-models
- Pagina del proyecto IBM Granite: https://www.ibm.com/granite
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
