# jersobh/epochdb-embed

## Resumen

`jersobh/epochdb-embed` es un modelo de embeddings de frases (sentence transformer) afinado por el desarrollador jersobh a partir de `intfloat/multilingual-e5-small`. Su funcion es proyectar texto en un espacio vectorial denso de 384 dimensiones para tareas de similitud semantica, busqueda semantica, mineria de parafrasis, clasificacion y clustering. El modelo forma parte del ecosistema del proyecto EpochDB, un motor de memoria agentica orientado a almacenamiento verbatim por niveles y recuperacion multi-salto.

La arquitectura es un transformer BERT (BertModel) con pooling de media y normalizacion L2 posterior, sobre una ventana maxima de 512 tokens. Con 117.653.760 parametros totales (unos 0,12 mil millones), el modelo esta pensado para inferencia ligera y despliegue en CPU o GPU de consumo, no para generacion de texto.

El ajuste se realizo con `MultipleNegativesRankingLoss` sobre un dataset de 9.000 muestras con columnas `anchor`, `positive` y `negative`, lo que sugiere un entrenamiento orientado a recuperacion contrastiva. El modelo esta recien publicado (noviembre de 2026), sin descargas ni likes, y su model card no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (BertModel) con pooling de media y normalizacion L2 |
| Parametros totales | 117.653.760 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponible (el modelo base `multilingual-e5-small` es multilingue; el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de salida | 384 dimensiones |
| Funcion de similitud | Similitud coseno |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de sentence transformers: un encoder BERT (`BertModel`) que produce `last_hidden_state`, seguido de una capa de pooling de media sobre los token embeddings (con `include_prompt: True`) y una capa de normalizacion que genera el embedding final de 384 dimensiones. La similitud se calcula por producto escalar sobre vectores normalizados, equivalente a similitud coseno.

El entrenamiento parte de `intfloat/multilingual-e5-small` (revision 614241f622f53c4eeff9890bdc4f31cfecc418b3) y se realiza con la funcion de perdida `MultipleNegativesRankingLoss`, tipica en recuperacion densa contrastiva, sobre un dataset de 9.000 muestras con tripletas `anchor`/`positive`/`negative`. No se especifica el numero de tokens de entrenamiento, la composicion del corpus ni si hubo etapas adicionales de RLHF o DPO (no aplicables a un modelo de embeddings). Los ejemplos de la model card usan el prefijo `query:` y `passage:`, herencia del formato de entrenamiento de la familia E5, y el contenido de las muestras esta en portugues.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para texto.
- Similitud semantica entre pares de frases (semantic textual similarity).
- Busqueda semantica y recuperacion densa (dense retrieval) con prefijos `query:` y `passage:`.
- Mineria de parafrasis.
- Clasificacion de texto basada en embeddings.
- Clustering y deduplicacion semantica.
- Soporte multilingue heredado del modelo base `multilingual-e5-small` (no confirmado explicitamente por el autor).
- Compatible con Text Embeddings Inference (TEI) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso por si mismo; su rol en un sistema agentico es el de recuperador dentro de un pipeline (como EpochDB).

## Casos de uso

- Memoria agentica de largo plazo: el modelo actua como recuperador denso dentro de EpochDB, indexando recuerdos verbatim y recuperando los pasajes relevantes ante una consulta del agente; sus 512 tokens de contexto y 384 dimensiones permiten indexar grandes volumenes con coste bajo.
- Busqueda semantica sobre documentacion interna: se indexan fragmentos de hasta 512 tokens con prefijo `passage:` y se consultan con prefijo `query:`, devolviendo los fragmentos mas proximos por similitud coseno.
- Deduplicacion de registros: agrupando embeddings con clustering se detectan entradas casi identicas en bases de datos de clientes o tickets.
- Clasificacion de tickets de soporte: se entrena un clasificador ligero (regresion logistica o kNN) sobre los embeddings para enrutar incidencias por categoria.
- Mineria de parafrasis en corpus multilingues: comparando pares de frases con umbral de similitud para detectar reformulaciones o traducciones cercanas.
- Filtrado de contenido en pipelines RAG: se calcula la similitud entre la pregunta del usuario y los documentos candidatos para descartar recuperaciones irrelevantes antes de pasarlas al modelo generador.
- Agrupacion de feedback de usuarios: clustering de encuestas abiertas para descubrir temas recurrentes sin etiquetado previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,5 GB (117,6 M parametros x 4 bytes); en FP16, unos 0,25 GB; en INT8, unos 0,12 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, una T4, L4 o RTX 4090 son suficientes; A100/H100 solo tendrian sentido para lotes masivos.
- Cabe en GPU de consumo: si, en cualquier GPU con 1 GB o mas de VRAM (GTX 1050, RTX 3060, etc.), e incluso en CPU.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime y FastEmbed mediante exportacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jersobh/epochdb-embed | 117,6 M | 512 | 384 | no disponible | Hugging Face |
| intfloat/multilingual-e5-small (base) | 117,6 M | 512 | 384 | MIT (segun el modelo base original) | Hugging Face |
| jersobh/epochdb-embed-0.6b | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 | 384 | Apache 2.0 | Hugging Face |

El modelo comparte arquitectura y dimension con su base `multilingual-e5-small`, por lo que la diferencia principal es el ajuste contrastivo sobre 9.000 muestras del dominio de EpochDB. Frente a `paraphrase-multilingual-MiniLM-L12-v2`, ofrece el doble de contexto (512 frente a 128 tokens) y el mismo tamano de embedding. La variante `epochdb-embed-0.6b` del mismo autor apunta a un modelo de mayor tamano, pero no se dispone de sus especificaciones en la informacion proporcionada.

## Limitaciones y advertencias

- No se declara licencia: no se puede asumir uso comercial sin consultar al autor; el modelo base original es MIT, pero el ajuste no especifica terminos.
- No se declaran idiomas soportados: aunque el base es multilingue, el ajuste se ha realizado con muestras en portugues, lo que puede degradar el rendimiento en otros idiomas respecto al base.
- Ventana de contexto limitada a 512 tokens: los documentos mas largos deben trocearse, con el riesgo de perder coherencia entre fragmentos.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero la recuperacion puede devolver pasajes irrelevantes si la consulta cae fuera de la distribucion de entrenamiento.
- Sesgos: no documentados por el autor; al derivar de un modelo multilingue entrenado con datos web, puede heredar sesgos de genero, nacionalidad o profesion presentes en el corpus original (los ejemplos de la model card ya asocian nombres a empresas y ciudades).
- Dataset de entrenamiento pequeno (9.000 muestras) y de dominio especifico: el rendimiento en dominios ajenos a EpochDB no esta validado.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad; conviene evaluar con un conjunto propio antes de usarlo en produccion.
- Requiere respetar los prefijos `query:` y `passage:` para obtener el comportamiento esperado; omitirlos puede reducir la calidad de la recuperacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jersobh/epochdb-embed
- Repositorio EpochDB en GitHub: https://github.com/jersobh/epochdb
- Variante de mayor tamano: https://huggingface.co/jersobh/epochdb-embed-0.6b
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Paper de MultipleNegativesRankingLoss: https://arxiv.org/abs/1908.10084
- Paper de Sentence-BERT: https://arxiv.org/abs/1807.03748
