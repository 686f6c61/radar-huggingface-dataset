# daniel-gomm/sciseek-micro

## Resumen

sciseek-micro es un modelo de embeddings especializado en busqueda de literatura cientifica, desarrollado por daniel-gomm y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning de ibm-granite/granite-embedding-english-r2, un transformer encoder de tipo ModernBERT con 149.014.272 parametros y una dimension de embedding de 768. Su proposito concreto es codificar consultas de busqueda y descripciones de articulos cientificos en formato "titulo + abstract" para recuperacion semantica sobre corpus de arXiv y otros repositorios academicos.

El modelo resuelve un problema acotado pero relevante: los embeddings de proposito general no capturan bien la terminologia y las relaciones semanticas propias de la literatura cientifica, mientras que los modelos grandes (4B parametros o mas) resultan caros de desplegar. sciseek-micro se posiciona como una alternativa Pareto eficiente: con 149M de parametros alcanza un nDCG@10 de 0.7152 en el benchmark SciSeek, superando segun el autor a Qwen3-Embedding-4B (+0.033) con 27 veces menos parametros, y un 0.5848 en LitSearch, practicamente empatado con ese mismo modelo.

Su relevancia actual radica en que se distribuye con pesos en safetensors y ONNX (incluida una version de 8 bits de 167 MB), es compatible con sentence-transformers, ONNX Runtime, transformers.js y Text Embeddings Inference, y esta pensado para integrarse en pipelines de busqueda academica, asistentes de revision bibliografica y aplicaciones RAG sobre papers. La ficha se basa exclusivamente en la informacion publicada en la model card y en el model-index del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, derivado de ibm-granite/granite-embedding-english-r2) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX de 8 bits (167 MB); fp16 para WebGPU en transformers.js |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Dimension de embedding | 768 |
| Pooling | token CLS |
| Normalizacion | L2 + producto escalar (coseno) |
| Formato de documento recomendado | `"Title:\n{title}\nAbstract:\n{abstract}"` |
| Prefijo de consulta | ninguno (sin instruccion) |
| Tamano del repo | 1.4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

sciseek-micro es un modelo de embeddings basado en un transformer encoder de tipo ModernBERT, heredado del modelo base ibm-granite/granite-embedding-english-r2 de IBM. El modelo produce un vector de 768 dimensiones por texto, usando el token CLS como representacion agregada de la secuencia; la comparacion entre consulta y documento se realiza mediante producto escalar sobre vectores normalizados L2, equivalente a similitud coseno. El modelo esta especializado en un unico dominio (literatura cientifica) y en un unico par de tareas: codificar consultas en lenguaje natural y codificar documentos compuestos por titulo y abstract.

El fine-tuning se realizo sobre el dataset sciseek-train, publicado por el mismo autor, y se evalua sobre SciSeek (3.010 consultas generadas automaticamente sobre 200.000 papers de arXiv) y LitSearch (597 preguntas reales de investigadores). La model card indica que el entrenamiento parte del modelo base de IBM y que el resultado mejora el nDCG@10 en +0.092 en SciSeek y +0.087 en LitSearch respecto a ese base. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO o destilacion; el autor solo indica que el modelo se entreno especificamente para el par consulta-documento cientifico y que no se ajusto ningun hiperparametro de evaluacion sobre SciSeek ni LitSearch.

Como innovacion practica destaca la eficiencia: 149M de parametros con 768 dimensiones, acompanado de una version nano de 47M parametros y 384 dimensiones (sciseek-nano), ambos descritos por el autor como Pareto eficientes frente a modelos mucho mayores. La distribucion incluye artefactos ONNX de 8 bits (167 MB) y soporte para ejecucion en navegador via transformers.js con WebGPU (fp16) o WASM (q8).

## Capacidades

- Generacion de embeddings de frases y documentos para recuperacion semantica (feature-extraction, sentence-similarity, text-retrieval).
- Busqueda de literatura cientifica: emparejamiento de consultas en lenguaje natural con titulos y abstracts de papers.
- Recuperacion densa sobre corpus academicos de gran tamano (evaluado sobre 200.000 papers de arXiv en SciSeek).
- Similitud semantica entre textos cientificos mediante coseno sobre vectores normalizados.
- Ejecucion en navegador y en Node con transformers.js (WebGPU fp16 o WASM q8).
- Despliegue en servidor mediante Text Embeddings Inference (TEI) y vLLM, con ficheros docker compose incluidos en el repositorio.
- Exportacion a ONNX Runtime, incluida cuantizacion de 8 bits.
- No soporta tool calling ni function calling: es un modelo de embeddings, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Motor de busqueda academica: indexar titulos y abstracts de un repositorio de papers (por ejemplo, arXiv) y responder consultas en lenguaje natural con recuperacion densa; el modelo esta entrenado exactamente para ese par consulta-documento y obtiene 0.7152 de nDCG@10 en SciSeek.
- Asistente de revision bibliografica: dada una pregunta de investigacion, recuperar los articulos mas relevantes para que el investigador los revise; los 0.5848 de nDCG@10 en LitSearch (597 preguntas reales) indican un rendimiento adecuado sobre consultas formuladas por humanos.
- Pipeline RAG sobre literatura cientifica: usar sciseek-micro como retriever para alimentar un LLM generativo con abstracts relevantes; el modelo solo produce embeddings, por lo que se combina con un generador separado.
- Deduplicacion y agrupacion de papers: calcular similitud coseno entre abstracts para detectar articulos duplicados, versiones preprints o trabajos muy relacionados en un repositorio.
- Recomendacion de articulos relacionados: a partir del abstract de un paper, recuperar los vecinos mas cercanos en el indice vectorial para sugerir lecturas relacionadas en una plataforma editorial o un gestor de referencias.
- Busqueda en navegador sin backend: desplegar la version ONNX de 8 bits (167 MB) con transformers.js y WASM para ofrecer busqueda semantica de papers en una aplicacion web estatica, sin servidor de inferencia.
- Clasificacion y filtrado tematico de articulos: usar los embeddings como caracteristicas de entrada para un clasificador ligero que etiquete papers por area o detecte relevancia respecto a un perfil de interes.
- Despliegue de bajo coste en produccion: servir el modelo con TEI o vLLM en una unica GPU pequena o incluso en CPU, dado su tamano de 149M de parametros y su version ONNX de 167 MB.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente). Metrica: nDCG@10 en tareas de recuperacion.

| Dataset | nDCG@10 | Otras metricas |
|---|---:|---|
| SciSeek (test) | 0.7152 | recall@10 = 0.5909 |
| LitSearch | 0.5848 | no disponible |
| DORIS-MAE | 0.6296 | no disponible |
| BEIR TREC-COVID | 0.7116 | no disponible |
| BEIR SciFact | 0.7479 | no disponible |
| BEIR NFCorpus | 0.3696 | no disponible |
| BEIR SciDocs | 0.2396 | no disponible |

Comparativa declarada por el autor frente a su modelo nano y frente a Qwen3-Embedding-4B:

| Modelo | Parametros | Dimension | SciSeek nDCG@10 | LitSearch nDCG@10 | ONNX 8 bits |
|---|---:|---:|---:|---:|---:|
| sciseek-nano | 47M | 384 | 0.646 | 0.512 | 53 MB |
| sciseek-micro | 149M | 768 | 0.715 | 0.584 | 167 MB |
| Qwen3-Embedding-4B | ~4B | no disponible | 0.682 (diferencia +0.033 a favor de sciseek-micro) | 0.598 (diferencia -0.014, sin significancia) | no disponible |

Segun la model card, sciseek-micro supera a su modelo base en +0.092 de nDCG@10 en SciSeek y +0.087 en LitSearch, y el autor afirma que es el mejor modelo de los 14 evaluados (de 23M a 4B parametros) ademas de BM25 en el mismo setup. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 149M de parametros (aproximadamente 0,6 GB de pesos); en fp16 alrededor de 0,3 GB; la version ONNX de 8 bits ocupa 167 MB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, L4 o RTX 4090 quedan sobredimensionadas para este modelo y solo se justifican por volumen de peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU mediante WASM.
- CPU: viable para cargas moderadas gracias al tamano reducido y a la version ONNX de 8 bits.
- Opciones de despliegue: sentence-transformers, ONNX Runtime, transformers.js (WebGPU fp16 o WASM q8), Text Embeddings Inference (TEI) y vLLM, con ficheros docker compose incluidos en el directorio `deploy/` del repositorio.
- Nota de despliegue: vLLM devuelve embeddings sin normalizar, por lo que hay que normalizarlos manualmente antes de calcular el producto escalar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | SciSeek nDCG@10 | LitSearch nDCG@10 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| sciseek-micro | 149M | 768 | 0.715 | 0.584 | Apache 2.0 | Hugging Face, safetensors y ONNX |
| sciseek-nano | 47M | 384 | 0.646 | 0.512 | Apache 2.0 (segun repositorio del autor) | Hugging Face |
| Qwen3-Embedding-4B | ~4B | no disponible | 0.682 | 0.598 | no disponible en la informacion | Hugging Face |
| granite-embedding-english-r2 (base) | no disponible | no disponible | 0.623 (0.715 - 0.092) | 0.497 (0.584 - 0.087) | Apache 2.0 (modelo de IBM) | Hugging Face |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otros modelos de embeddings cientificos en la informacion proporcionada. El autor indica que evaluo 14 modelos abiertos de embeddings (23M a 4B parametros) y BM25 en el mismo setup, pero solo publica los resultados de los modelos recogidos en la tabla anterior.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado solo para busqueda de literatura cientifica (consulta contra titulo + abstract). El propio autor recomienda usar un modelo general como granite-embedding-english-r2 para otras tareas.
- Solo ingles: no soporta consultas ni documentos en castellano ni en otros idiomas.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento; solo genera embeddings.
- Riesgo de alucinacion no aplica en sentido generativo, pero si puede recuperar documentos irrelevantes; el nDCG@10 en BEIR SciDocs es bajo (0.2396) y en NFCorpus tambien es limitado (0.3696), lo que sugiere un rendimiento desigual segun el dominio y el tipo de corpus.
- Resultados no verificados: todas las metricas del model-index estan marcadas como `verified: false` y proceden del propio autor; no hay evaluacion independiente publicada en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la model card; al entrenarse sobre arXiv, puede heredar sesgos de cobertura tematica y de idioma de ese repositorio (predominio de determinadas disciplinas y de textos en ingles).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base de IBM y de los datasets de entrenamiento (sciseek-train, SciSeek) antes de un despliegue en produccion.
- Formato de entrada sensible: los documentos deben formatearse como `"Title:\n{title}\nAbstract:\n{abstract}"`; usar otro formato puede degradar la recuperacion.
- Longitud de contexto no documentada: se desconoce el maximo de tokens por entrada, lo que limita la indexacion de abstracts muy largos o de texto completo de papers.
- Adopcion practica nula por ahora: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daniel-gomm/sciseek-micro
- Modelo nano del mismo autor: https://huggingface.co/daniel-gomm/sciseek-nano
- Dataset de entrenamiento: https://huggingface.co/datasets/daniel-gomm/sciseek-train
- Dataset de evaluacion SciSeek: https://huggingface.co/datasets/daniel-gomm/SciSeek
- Dataset LitSearch: https://huggingface.co/datasets/princeton-nlp/LitSearch
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-english-r2
- Text Embeddings Inference (TEI): https://huggingface.co/docs/text-embeddings-inference
- vLLM: https://vllm.ai/
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Repositorio de TEI en GitHub: https://github.com/huggingface/text-embeddings-inference
- Repositorio de vLLM en GitHub: https://github.com/vllm-project/vllm
