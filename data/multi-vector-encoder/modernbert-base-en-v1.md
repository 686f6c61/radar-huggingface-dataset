# multi-vector-encoder/ModernBERT-base-en-v1

## Resumen

ModernBERT-base-en-v1 es un codificador multi-vector (multi-vector encoder) basado en la arquitectura ModernBERT, publicado en Hugging Face por la organización multi-vector-encoder. A diferencia de los modelos de embeddings clásicos, que comprimen cada texto en un único vector, este modelo genera un vector de 128 dimensiones por cada token y puntúa pares consulta-documento mediante late interaction (MaxSim), el enfoque popularizado por ColBERT. Esto permite búsquedas semánticas más precisas, ya que se conserva la granularidad a nivel de token.

El modelo es una fusión lineal al 50/50 de dos modelos parentales, chungimungi/GLInt y lightonai/LateOn-regularized, creada con el método `MultiVectorEncoder.merge` de la librería sentence-transformers. Según el autor, la fusión supera la media de sus padres en 9 de los 13 datasets de NanoBEIR, con un nDCG@10 medio de 0,7061 frente a 0,6996 de GLInt y 0,6979 de LateOn-regularized.

Su relevancia práctica radica en la combinación de contexto largo (hasta 8192 tokens para documentos), tamaño contenido (149 millones de parámetros, unos 0,6 GB en safetensors) y licencia Apache-2.0, lo que lo hace adecuado para sistemas de recuperación semántica en inglés que puedan ejecutarse en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (codificador multi-vector, late interaction) |
| Parametros totales | 149.015.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (documentos); 32 tokens (consultas) |
| Tipos de cuantizacion | no disponible (pesos en FP, safetensors, 0,6 GB) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un codificador multi-vector construido sobre ModernBERT. Tras el backbone transformer, incluye una pila de capas Dense con conexiones residuales (768 → 1536 → 768 → 128, sin sesgos y con activación identidad) que proyecta los embeddings de token a 128 dimensiones. A continuacion, un modulo `MultiVectorMask` elimina los embeddings de signos de puntuacion en los documentos (skiplist), y los vectores de token se normalizan. La puntuacion entre consulta y documento se calcula con MaxSim: para cada token de la consulta se toma el maximo de similitud con los tokens del documento y se suma.

No se ha publicado informacion sobre el entrenamiento original de los modelos parentales (numero de tokens, composicion del dataset o uso de RLHF/DPO). El modelo publicado se obtiene por fusion lineal 50/50 de GLInt y LateOn-regularized mediante `MultiVectorEncoder.merge`; segun el autor, el proceso requirio 6 lineas de codigo y unos 12 segundos de ejecucion, y los ajustes de fusion no se basaron en resultados de evaluacion. Los modelos parentales se evaluaban con documentos de 300 tokens; este modelo amplia el limite a 8192 tokens.

## Capacidades

- Generacion de embeddings multi-vector a nivel de token (128 dimensiones por token) para extraccion de caracteristicas.
- Busqueda semantica con late interaction (MaxSim), con mayor fidelidad que los embeddings de un solo vector.
- Gestion de documentos largos: hasta 8192 tokens por documento y 32 tokens por consulta.
- Integracion con la libreria sentence-transformers mediante la clase `MultiVectorEncoder` (metodos `encode_query`, `encode_document` y `similarity`).
- Compatibilidad con Text Embeddings Inference (TEI) de Hugging Face, segun los tags del repositorio.
- Soporte exclusivo para texto en ingles; no genera texto ni razona, es un modelo de embeddings.

## Casos de uso

- Busqueda semantica en corpus documentales: la late interaction por token permite localizar pasajes relevantes en documentos de hasta 8192 tokens con mayor precision que un embedding unico.
- Reranking en pipelines RAG: puede actuar como segunda etapa de reordenacion sobre candidatos recuperados con un modelo bi-encoder, mejorando la precision del contexto entregado al LLM.
- Busqueda en bases de conocimiento tecnicas o legales: el contexto de 8192 tokens permite indexar secciones o clausulas completas sin fragmentacion agresiva.
- Sistemas de preguntas y respuestas sobre documentacion: las consultas cortas (32 tokens) se comparan token a token con el corpus, capturando coincidencias lexicas y semanticas simultaneamente.
- Indexacion con almacenamiento comprimido: los vectores de 128 dimensiones por token son mas ligeros que los de ColBERT original, reduciendo el coste de almacenamiento de indices multi-vector.
- Integracion en servicios de inferencia de embeddings: la compatibilidad con Text Embeddings Inference facilita el despliegue como microservicio de busqueda en produccion.

## Benchmarks y rendimiento

Resultados de NanoBEIR-en (nDCG@10, evaluacion con `MultiVectorNanoBEIREvaluator`, consultas de 32 tokens y documentos de 8192 tokens; media no ponderada sobre 13 datasets). Los datos publicados cubren 7 de los 13 datasets:

| Dataset | ModernBERT-base-en-v1 | GLInt | LateOn-regularized |
|---|---|---|---|
| msmarco | 0,7362 | 0,7285 | 0,7078 |
| nq | 0,8188 | 0,8180 | 0,7827 |
| fiqa2018 | 0,6403 | 0,6260 | 0,6255 |
| nfcorpus | 0,3938 | 0,3999 | 0,3916 |
| scidocs | 0,4353 | 0,4355 | 0,4449 |
| arguana | 0,5884 | 0,5697 | 0,5612 |
| dbpedia | 0,7039 | 0,7092 | 0,6780 |
| **Media (13 datasets)** | **0,7061** | **0,6996** | **0,6979** |

El modelo fusionado supera la media de ambos padres y gana en 9 de los 13 datasets, incluyendo 5 donde supera a ambos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB para los pesos en FP32/FP16, mas la memoria de activaciones; del orden de 1-2 GB en la practica para lotes moderados (estimacion, no dato publicado).
- GPU recomendadas: cualquier GPU moderna es suficiente dado el tamano del modelo; una RTX 3060 o superior sobra con creces. No requiere A100 ni H100.
- Cabe con holgura en GPU de consumo: si, en practicamente cualquier GPU con 4 GB de VRAM o mas; tambien es viable su ejecucion en CPU gracias a su tamano contenido.
- Opciones de despliegue: sentence-transformers (clase `MultiVectorEncoder`), Text Embeddings Inference (TEI) y Hugging Face Inference Endpoints (tag `endpoints_compatible`). No consta soporte para llama.cpp ni Ollama al ser un modelo de embeddings basado en safetensors.
- Latencia y throughput: no disponibles; al ser un encoder de 149M de parametros con late interaction, la latencia por consulta deberia ser baja, aunque el calculo MaxSim sobre documentos largos incrementa el coste frente a un bi-encoder clasico.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto (docs) | Dimension | Licencia |
|---|---|---|---|---|---|
| ModernBERT-base-en-v1 | Multi-vector (MaxSim) | 149M | 8192 tokens | 128/token | Apache-2.0 |
| chungimungi/GLInt (parental) | Multi-vector | no disponible | 300 tokens (en su evaluacion original) | no disponible | no disponible |
| lightonai/LateOn-regularized (parental) | Multi-vector | no disponible | 300 tokens (en su evaluacion original) | no disponible | no disponible |
| ColBERTv2 (referencia de la categoria) | Multi-vector (MaxSim) | ~110M (BERT-base) | no disponible | 128/token | MIT |

Frente a ColBERTv2, el modelo ofrece un contexto documental mucho mayor (8192 tokens) y arquitectura ModernBERT mas reciente, aunque no se dispone de benchmarks comparativos directos. Frente a un bi-encoder clasico de tamano similar (por ejemplo, all-MiniLM-L6-v2), ofrece mayor precision en recuperacion a cambio de mayor coste de almacenamiento e inferencia por el indice multi-vector.

## Limitaciones y advertencias

- Monolingue: solo soporta ingles; no es util para busqueda en castellano ni multilingue.
- No es un modelo generativo: produce embeddings, no texto; no tiene capacidades de razonamiento, codigo ni tool calling.
- El modelo procede de una fusion lineal sin ajuste posterior basado en evaluacion (segun el autor); su comportamiento en dominios fuera de NanoBEIR no esta verificado.
- Adopcion muy limitada: 27 descargas y 1 like en el momento de la ficha, sin comunidad ni historial de uso en produccion que respalde su fiabilidad.
- El coste de la late interaction crece con la longitud del documento; para corpus muy grandes, el indice multi-vector consume bastante mas almacenamiento que un indice de embeddings densos de un solo vector.
- No se ha publicado informacion sobre sesgos del modelo; al derivar de modelos entrenados en datos web en ingles, cabe esperar sesgos tipicos de esos corpus.
- Licencia Apache-2.0 sin restricciones de uso comercial conocidas.
- Las consultas se limitan a 32 tokens; consultas mas largas se truncaran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/multi-vector-encoder/ModernBERT-base-en-v1
- Modelo parental GLInt: https://huggingface.co/chungimungi/GLInt
- Modelo parental LateOn-regularized: https://huggingface.co/lightonai/LateOn-regularized
- Documentacion de sentence-transformers: https://sbert.net
- Documentacion de Multi-Vector Encoder: https://www.sbert.net/docs/multi_vector_encoder/usage/usage.html
- Repositorio de sentence-transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos multi-vector en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=multi-vector
- Dataset de evaluacion NanoBEIR-en: https://huggingface.co/datasets/sentence-transformers/NanoBEIR-en
