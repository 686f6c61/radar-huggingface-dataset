# alibayram/embeddingmagibu2-a100-lr

## Resumen

embeddingmagibu2 es un modelo de embeddings de frases (sentence-similarity) construido por Magibu AI Research (alibayram) a partir de google/embeddinggemma-2, con el objetivo de mejorar la recuperacion de informacion en turco sin degradar el resto de idiomas. La innovacion central es un intercambio de tokenizer (tokenizer surgery): se sustituye el vocabulario original por magibu/Altus, un BPE de 262.144 tokens en el que 42.484 tokens poco usados se reemplazan por subpalabras turcas. El resultado es que el turco necesita un 21% menos de tokens para el mismo texto, lo que permite introducir mas contenido turco en la ventana de contexto y reducir el coste de inferencia.

El modelo mantiene 768 dimensiones de embedding con normalizacion L2, pooling por media y una longitud maxima de secuencia de 8.192 tokens. El checkpoint publicado tiene 744.371.512 parametros segun safetensors, aunque el backbone de texto es de aproximadamente 271 millones: el resto corresponde a las torres de vision y audio heredadas del modelo base, que no se adaptan ni se recomiendan para uso. Los pesos son identicos a los del profesor salvo las filas de embedding, inicializadas por composicion de medias y posteriormente ajustadas.

Su relevancia actual es metodologica: documenta de forma publica y reproducible un pipeline de destilacion offline con metricas por release, y ataca un problema real de los modelos multilingues, el coste desproporcionado del turco en tokenizadores dominados por ingles. Conviene tener en cuenta que el propio autor etiqueta el checkpoint como "training in progress": las nuevas filas de embedding turcas solo estan inicializadas y ajustadas parcialmente, y el entrenamiento no ha concluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de embeddings (encoder) derivado de google/embeddinggemma-2; incluye torres de vision y audio heredadas no adaptadas |
| Parametros totales | 744.371.512 (segun safetensors); backbone de texto ~271 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni recetas de cuantizacion; el repo contiene safetensors en 1,5 GB) |
| Idiomas soportados | turco (tr) y multilingue (el modelo base y el dataset de destilacion cubren 40 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |
| Dimension de embedding | 768, normalizados L2 |
| Pooling | media |
| Tokenizer | magibu/Altus, BPE de 262.144 tokens |
| Pipeline | sentence-similarity / feature-extraction |
| Fecha de creacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder tipo transformer con representaciones de 768 dimensiones y pooling por media, mas torres multimodales (vision y audio) que se heredan sin ningun ajuste. La modificacion estructural relevante no esta en el transformer sino en la capa de embeddings. Se parte del vocabulario de Gemma-4 (identico al del profesor) y se sustituyen 42.484 tokens raramente utilizados por subpalabras turcas procedentes del vocabulario BPE de 65.536 tokens de Magibu. Los 219.660 identificadores que no cambian conservan exactamente los embeddings del profesor. Cada token nuevo se inicializa como la media de los embeddings del profesor de los tokens que lo componen segun el fichero merged-to-original-token-ids.json de Altus; por ejemplo, el token `ag` con cedilla se inicializa como la media de los embeddings de `a` y `g` con cedilla.

El entrenamiento es una destilacion offline en dos fases por etapa: en la fase `new` solo se entrenan los embeddings de los tokens turcos nuevos y en la fase `full` se ajustan todos los embeddings y el backbone de texto con un learning rate bajo. El objetivo es que el estudiante iguale los embeddings precalculados del profesor sobre el dataset alibayram/wikipedia-40-langs-with-embeddings-embeddinggemma2, compuesto por Wikipedia en 40 idiomas con objetivos de estilo recuperacion para documentos (`title: {title} | text: {text}`) y consultas por titulo (`task: search result | query: {title}`). Los textos se recortan para que quepan en 8.192 tokens bajo ambos tokenizadores, de modo que estudiante y profesor ven siempre la misma entrada. El pipeline sigue el articulo "Adapting Multilingual Embedding Models to Turkish via Cross-Lingual Tokenizer Surgery and Offline Distillation" (arXiv:2605.29992).

## Capacidades

- Generacion de embeddings de texto normalizados L2 de 768 dimensiones para similitud semantica y recuperacion.
- Recuperacion mono-lingue en turco mejorada por tokenizacion: 0,79x tokens frente al tokenizador original en una muestra de 6.000 articulos de Wikipedia (21% menos).
- Recuperacion multilingue y cruzada entre idiomas, heredada del modelo base y preservada por la destilacion (coseno medio con el profesor de 0,9848 para idiomas distintos del turco).
- Modo asimetrico consulta/documento mediante prompts diferenciados (`prompt_name="query"` y `prompt_name="document"`), el mismo esquema de EmbeddingGemma.
- Extraccion de caracteristicas (`feature-extraction`) para clasificacion, clustering y deduplicacion.
- No dispone de tool calling, function calling, modo de razonamiento explicito ni capacidades de agente: es un modelo de representacion, no generativo.
- Las torres de vision y audio existen en el checkpoint pero no estan adaptadas; el uso previsto es exclusivamente texto.

## Casos de uso

- Busqueda semantica en turco: indexar un corpus de documentos turcos con `prompt_name="document"` y consultar en lenguaje natural. El ahorro del 21% en tokens permite indexar mas contenido por fragmento dentro de los 8.192 tokens de contexto.
- RAG sobre documentacion corporativa en turco: usar el modelo como retriever en un pipeline de generacion aumentada, aprovechando la ventana de 8K para fragmentos largos sin trocear en exceso.
- Recuperacion multilingue entre turco y otros idiomas: una consulta en turco puede recuperar documentos en ingles o aleman, ya que el espacio de embeddings se mantiene alineado con el del profesor (coseno 0,9848 en idiomas no turcos).
- Deduplicacion y clustering de articulos: la distancia coseno entre embeddings de 768 dimensiones permite agrupar noticias o entradas de Wikipedia casi duplicadas en lotes grandes.
- Clasificacion de textos por similitud a prototipos: construir embeddings de etiquetas y asignar la categoria mas cercana, util para moderacion o enrutado de tickets de soporte en turco.
- Motor de recomendacion basado en contenido: representar items y perfiles de usuario como vectores y ordenar por similitud, sin necesidad de un modelo generativo.
- Evaluacion de similitud semantica en turco: uso en tareas tipo STS o como componente de evaluacion de sistemas de traduccion y resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, etc.) en la informacion disponible. La model card unicamente publica metricas internas de destilacion sobre 2.048 filas de validacion reservadas: coseno frente a los embeddings de documento del profesor en turco (`cos_doc_tr`), coseno en el resto de idiomas (`cos_doc_other`), su media (`score`) y Spearman en el test de STSbTR.

| Release | Step | cos_doc_tr | cos_doc_other | score | STSbTR Spearman |
|---|---|---|---|---|---|
| initial (sin entrenar) | 0 | 0,9314 | 0,9789 | 0,9551 | 0,5867 |
| phase1-test-new-done | 600 | 0,9328 | 0,9802 | 0,9565 | 0,5900 |
| phase2-test-full-step1600 | 1600 | 0,9478 | 0,9837 | 0,9658 | 0,5946 |
| phase2-test-full-done | 1812 | 0,9497 | 0,9839 | 0,9668 | 0,5987 |
| phase3-validation-new-done | 2212 | 0,9497 | 0,9839 | 0,9668 | 0,5987 |
| phase4-validation-full-step3212 | 3212 | 0,9553 | 0,9848 | 0,9700 | 0,6076 |
| phase4-validation-full-done | 4412 | 0,9568 | 0,9848 | 0,9708 | 0,6117 |
| phase5-train-new-done | 4812 | 0,9568 | 0,9848 | 0,9708 | 0,6117 |

La mejora desde el checkpoint inicial es de +0,0254 en `cos_doc_tr` y +0,0250 en Spearman de STSbTR. No hay datos comparativos publicados frente a otros sistemas en MTEB turco.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 3,0 GB para los 744 M de parametros.
- VRAM en FP16/BF16: aproximadamente 1,5 GB, coherente con el tamano del repo (1,5 GB).
- VRAM en INT8: aproximadamente 0,8 GB. En 4 bits, en torno a 0,5 GB (estimacion por tamano, no hay checkpoint cuantizado publicado).
- Si solo se carga el backbone de texto (~271 M), el consumo baja a unas decimas de GB en FP16.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090; tambien es viable en CPU para cargas moderadas.
- Para entrenamiento, el nombre del checkpoint (`a100-lr`) sugiere el uso de A100 con learning rate bajo; no se especifican detalles de configuracion.
- Despliegue: sentence-transformers (uso documentado), Hugging Face Text Embeddings Inference para servir embeddings, Optimum/ONNX para aceleracion en CPU. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponible. Como referencia estructural, el ahorro del 21% en tokens turcos reduce proporcionalmente el coste de codificacion de textos en turco.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alibayram/embeddingmagibu2-a100-lr | 744 M (texto ~271 M) | 768 | 8.192 | apache-2.0 | HuggingFace, sentence-transformers |
| google/embeddinggemma-2 (modelo base) | no disponible | 768 | 8.192 (fijado en el pipeline) | no disponible | HuggingFace |
| intfloat/multilingual-e5-large | 560 M | 1.024 | 512 | MIT | HuggingFace |
| BAAI/bge-m3 | 568 M | 1.024 | 8.192 | MIT | HuggingFace |

El modelo se diferencia del base exclusivamente en la capa de embeddings y el tokenizador: misma dimension, mismo contexto y mismos pesos salvo las filas nuevas, mas un ajuste posterior del backbone de texto. Frente a multilingual-e5-large gana ventana de contexto (8.192 frente a 512 tokens), lo que es determinante para documentos largos; frente a bge-m3 comparte contexto pero reduce la dimension a 768, lo que abarata el almacenamiento de indices vectoriales. No hay datos publicados que permitan comparar el rendimiento de recuperacion de este checkpoint frente a esas alternativas.

## Limitaciones y advertencias

- El checkpoint no esta destilado por completo: segun la propia model card, los embeddings de los nuevos tokens turcos estan solo inicializados y el entrenamiento sigue en progreso.
- Los idiomas cuyo texto se alarga con Altus pueden perder calidad; el propio autor cita ruso y búlgaro, con ratios de 1,10-1,15x tokens frente al tokenizador original.
- Las torres de vision y audio se heredan sin adaptar; no deben usarse. El modelo esta pensado para texto.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero si de falsos positivos en recuperacion: un embedding no verifica la veracidad del documento recuperado.
- Sesgos: el entrenamiento se apoya en Wikipedia en 40 idiomas, lo que hereda los sesgos de cobertura y de representacion de esa fuente; el turco de Wikipedia no cubre registros coloquiales o dialectales.
- Idiomas con poca presencia en el dataset de destilacion pueden degradarse, ya que el objetivo se centra en preservar el comportamiento del profesor mas que en mejorar cada idioma.
- STSbTR Spearman de 0,6117 es un valor bajo en terminos absolutos para una tarea de similitud semantica en turco; conviene validar en el dominio concreto antes de usarlo en produccion.
- El repositorio no tiene descargas ni valoraciones, por lo que no existe validacion independiente de la comunidad.
- Licencia apache-2.0: permite uso comercial, pero el modelo base google/embeddinggemma-2 puede arrastrar condiciones adicionales de la familia Gemma que conviene revisar antes de un despliegue comercial.
- No hay pesos cuantizados ni formatos alternativos publicados; el despliegue en entornos sin PyTorch requerira conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibayram/embeddingmagibu2-a100-lr
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Tokenizer Altus: https://huggingface.co/magibu/Altus
- Dataset de destilacion: https://huggingface.co/datasets/alibayram/wikipedia-40-langs-with-embeddings-embeddinggemma2
- Articulo (arXiv:2605.29992): https://arxiv.org/abs/2605.29992
- Organizacion Magibu AI Research: https://huggingface.co/magibu

La busqueda web realizada no ha devuelto enlaces relevantes adicionales sobre este modelo.
