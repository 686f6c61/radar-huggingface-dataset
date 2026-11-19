# NeuML/atto-14m-384d-embeddings

## Resumen

Atto-14m-384d-embeddings es un modelo de embeddings de frases desarrollado por NeuML, obtenido mediante fine-tuning con sentence-transformers del modelo base NeuML/atto-14m-384d. Forma parte de la familia Atto, un conjunto de modelos contextuales compactos disenados para aprendizaje de representaciones linguisticas con un numero muy reducido de parametros. El modelo genera vectores densos de 384 dimensiones y esta pensado para tareas de similitud semantica, busqueda semantica y recuperacion de informacion.

Con aproximadamente 14 millones de parametros y un vocabulario de 30.000 tokens, el modelo se posiciona como una alternativa ligera a all-MiniLM-L6-v2 (23M de parametros) manteniendo el mismo tamano de embedding (384 dimensiones). Segun la evaluacion parcial de BEIR publicada por el autor (ndcg@10 sobre ArguAna, NFCorpus y SciFact), atto-14m-384d obtiene una media de 0.4892, ligeramente superior a all-MiniLM-L6-v2 (0.4802) con menos parametros.

Su relevancia actual radica en la eficiencia: permite construir indices de embeddings y pipelines de RAG con un coste computacional y de almacenamiento muy bajo, integrandose de forma nativa con txtai y sentence-transformers. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentenceTransformer con transformer `AttoModel` (feature-extraction) y pooling por media |
| Parametros totales | 14M (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura SentenceTransformer compuesta por dos modulos: un transformer de tipo `AttoModel` que realiza feature-extraction sobre texto y expone `last_hidden_state`, y una capa de pooling por media que produce un embedding de 384 dimensiones. La configuracion de pooling incluye el prompt (`include_prompt: True`), y el modelo emplea prompts diferenciados para consulta (`query: `) y documento (`document: `).

El entrenamiento se realizo con sentence-transformers sobre el modelo base NeuML/atto-14m-384d, con los siguientes hiperparametros: batch size de 128 por dispositivo, 25 epocas, learning rate de 0.01, 1000 pasos de warmup, weight decay de 0.01, entrenamiento en fp16 y 20 workers de dataloader. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La model card remite al articulo "Introducing Atto" para detalles de metodologia y arquitectura.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud semantica.
- Extraccion de caracteristicas (feature-extraction) a nivel de frase.
- Busqueda semantica en bases de datos de embeddings mediante txtai.
- Actuacion como fuente de conocimiento para recuperacion aumentada por generacion (RAG).
- Soporte de prompts diferenciados para consulta y documento, lo que mejora la asimetria en tareas de retrieval.
- Uso con sentence-transformers mediante `trust_remote_code=True`.
- Compatible con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no, solo ingles.
- Tool calling, agentes, vision, audio o modo thinking: no disponibles en este modelo.

## Casos de uso

- Busqueda semantica sobre documentacion interna: indexar articulos, manuales o wikis con txtai y recuperar los fragmentos mas relevantes para una consulta en lenguaje natural, aprovechando el bajo coste de almacenamiento de vectores de 384 dimensiones.
- Recuperacion aumentada por generacion (RAG) en produccion: usar el modelo como retriever ligero en un pipeline RAG, donde la latencia y el coste de indexacion son criticos y el corpus es en ingles.
- Deduplicacion y agrupamiento de textos: calcular similitudes entre pares de frases o documentos para detectar duplicados o agrupar contenido semanticamente similar en grandes volumenes de datos.
- Clasificacion zero-shot por similitud: comparar embeddings de textos con embeddings de etiquetas o descripciones de categorias para clasificar sin entrenamiento adicional.
- Moderacion y filtrado de contenido: medir la similitud entre mensajes entrantes y patrones conocidos de abuso o spam para priorizar revision.
- Sistemas de recomendacion de contenido: generar embeddings de articulos o productos y recomendar items cercanos en el espacio vectorial a partir de un item de referencia.
- Enrutamiento de consultas en asistentes: clasificar la intencion de una consulta comparandola con embeddings de intenciones predefinidas antes de derivar a un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (subconjunto de BEIR, metrica ndcg@10):

| Modelo | Parametros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| atto-36k-384d | 36K | 384 | 1K | 0.3249 | 0.2286 | 0.4920 | 0.3485 |
| atto-90k-2048d | 90K | 2048 | 1K | 0.4021 | 0.2676 | 0.6074 | 0.4257 |
| atto-1m-2048d | 1M | 2048 | 4K | 0.4189 | 0.2941 | 0.6229 | 0.4453 |
| atto-2m-8192d | 2M | 8192 | 4K | 0.4343 | 0.3125 | 0.6653 | 0.4707 |
| all-MiniLM-L6-v2 | 23M | 384 | 30K | 0.4789 | 0.3089 | 0.6527 | 0.4802 |
| **atto-14m-384d** | **14M** | **384** | **30K** | **0.4874** | **0.3329** | **0.6472** | **0.4892** |
| atto-17m-8192d | 17M | 8192 | 30K | 0.4963 | 0.3455 | 0.6909 | 0.5109 |
| atto-25m-384d | 25M | 384 | 30K | 0.4879 | 0.3426 | 0.6600 | 0.4968 |
| atto-28m-8192d | 28M | 8192 | 30K | 0.5111 | 0.3461 | 0.6843 | 0.5138 |
| DenseOn | 110M | 768 | 50K | 0.5408 | 0.3915 | 0.7591 | 0.5638 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (14M de parametros), y del orden de decenas de MB en cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo puede ejecutarse en CPU con latencia aceptable para volumenes moderados.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: sentence-transformers, txtai, y potencialmente transformers con `trust_remote_code=True`. No se han publicado variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Media BEIR (3 datasets) | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| **atto-14m-384d** | 14M | 384 | no disponible | 0.4892 | Apache 2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 23M | 384 | no disponible | 0.4802 | Apache 2.0 | Hugging Face |
| atto-25m-384d | 25M | 384 | no disponible | 0.4968 | Apache 2.0 | Hugging Face |
| DenseOn | 110M | 768 | no disponible | 0.5638 | no disponible | Hugging Face |

Atto-14m-384d ofrece una relacion calidad/tamano favorable frente a all-MiniLM-L6-v2, con menos parametros y una media ligeramente superior en el subconjunto evaluado. Frente a modelos mas grandes como DenseOn, la diferencia de rendimiento es notable, pero el coste de inferencia y almacenamiento es mucho menor.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado.
- La evaluacion publicada cubre unicamente tres datasets de BEIR (ArguAna, NFCorpus, SciFact); no hay datos de MMLU, HumanEval, GSM8K ni otras tareas generativas, ya que el modelo no genera texto.
- No se ha publicado informacion sobre sesgos del modelo base ni del proceso de fine-tuning.
- Riesgo de alucinacion no aplicable directamente al no generar texto, pero los embeddings pueden producir similitudes enganosas en dominios muy especializados.
- La longitud maxima de contexto no esta documentada en la informacion disponible, lo que dificulta planificar su uso con documentos largos.
- Requiere `trust_remote_code=True` por el uso de codigo personalizado (`AttoModel`), lo que implica ejecutar codigo del autor.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base NeuML/atto-14m-384d antes de un despliegue comercial.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que su validacion por la comunidad es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-14m-384d-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-14m-384d
- Articulo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Sentence-Transformers: https://www.SBERT.net
- all-MiniLM-L6-v2 (referencia comparativa): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- DenseOn (referencia comparativa): https://huggingface.co/lightonai/denseon
