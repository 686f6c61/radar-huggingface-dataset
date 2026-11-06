# kakaocorp/kanana-2-3b-embedding

## Resumen

Kanana-2-3b-embedding es un modelo de embeddings de texto desarrollado por Kakao para recuperación semántica en coreano e inglés. Forma parte de la serie Kanana-2 embedding, que incluye también una variante de 1.3B, y se construye sobre los modelos SLM Kanana-2 de Kakao, convertidos de atención causal a atención bidireccional con mean pooling. Su propósito es generar embeddings de alta calidad para búsqueda semántica, RAG y similitud textual, con especial rendimiento en recuperación en coreano, un ámbito donde los modelos de referencia suelen estar optimizados para inglés.

Su relevancia radica en tres puntos: alcanza la mejor puntuación media en nano-BEIR (ko) y Ko-Retrieval entre los modelos comparados en todas las dimensiones Matryoshka; soporta representaciones Matryoshka que permiten truncar los embeddings a 1024, 512, 256 o 128 dimensiones para reducir coste de almacenamiento y búsqueda; y acepta entradas de hasta 4.096 tokens. El modelo tiene 3.180.636.672 parámetros, una dimensión de embedding de 2560 y se distribuye en safetensors con integración sentence-transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional (qwen3_bidirec) y mean pooling, basado en Kanana-2 SLM |
| Parametros totales | 3.180.636.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | kanana-open-license (otra, no estándar; consultar texto legal) |
| Formato de pesos | safetensors (6,4 GB de repositorio) |

Datos adicionales: dimensión de embedding de 2560, con soporte Matryoshka para truncar a 1024 / 512 / 256 / 128 dimensiones. Integración con sentence-transformers y etiqueta custom_code.

## Arquitectura y entrenamiento

El modelo parte de los SLM Kanana-2 de Kakao y los adapta a la tarea de embeddings: la atención causal del LLM se sustituye por atención bidireccional (indicada por la etiqueta qwen3_bidirec, lo que sugiere una base tipo Qwen3 modificada) y la representación del texto se obtiene mediante mean pooling sobre los tokens. Esta conversión de LLM generativo a encoder de frases es una técnica habitual para reutilizar preentrenamientos potentes en tareas de representación.

Sobre los datos y el procedimiento de entrenamiento (numero de tokens, composición del corpus, uso de contrastive learning, hard negatives, etc.) no hay detalles publicados en la model card disponible. Tampoco se especifica si se empleó knowledge distillation desde un modelo mayor. Destaca, eso sí, el uso de Matryoshka Representation Learning (MRL), que entrena el modelo para que los primeros N componentes del embedding sean por sí mismos representaciones útiles, permitiendo truncar a 1024/512/256/128 dimensiones con degradación de calidad controlada.

## Capacidades

- Generación de embeddings de texto para extracción de características (feature-extraction) con dimensión completa de 2560.
- Similitud semántica entre frases y documentos (pipeline sentence-similarity).
- Recuperación densa (dense retrieval) en coreano e inglés, con resultados destacados en nano-BEIR (ko) y Ko-Retrieval.
- Soporte de entradas largas de hasta 4.096 tokens, útil para párrafos y documentos extensos.
- Embeddings Matryoshka truncables a 1024, 512, 256 y 128 dimensiones, reduciendo almacenamiento y coste de búsqueda vectorial.
- Evaluación sin prompts de tarea: funciona con texto crudo, sin prefijos de query/documento ni plantillas de instrucción.
- Integración con la librería sentence-transformers y compatibilidad con endpoints de Hugging Face.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en corpus coreanos: es el caso fuerte del modelo, con la mejor media en Ko-Retrieval (0,8211 a dimensión completa) y nano-BEIR (ko) entre los comparados; ideal para buscadores internos sobre documentación o contenidos en coreano.
- RAG en coreano e inglés: como retriever denso en pipelines de generación aumentada, aprovechando los 4.096 tokens de entrada para indexar chunks largos de documentos.
- Índices vectoriales con presupuesto de almacenamiento ajustado: gracias a MRL, se puede truncar a 256 o 128 dimensiones y reducir drásticamente el tamaño del índice (por ejemplo, con FAISS o Qdrant) sacrificando poca calidad, según las tablas de rendimiento por dimensión.
- Deduplicación y agrupación de documentos: clustering de noticias, tickets o productos mediante similitud coseno de los embeddings.
- Clasificación semántica ligera: uso de los embeddings como features de entrada para clasificadores (regresión logística, SVM) en tareas de enrutado de consultas o detección de intención.
- Sistemas bilingües coreano-inglés: recuperación cross-lingüe en colecciones mixtas, dado el entrenamiento en ambos idiomas.
- Recomendación de contenidos: cálculo de similitud entre descripciones de productos o artículos para recomendadores basados en contenido.

## Benchmarks y rendimiento

Evaluaciones con MTEB, sin prompts de tarea (texto crudo, sin prefijos). Cada celda es la media del benchmark por dimensión Matryoshka (full / 512 / 256 / 128).

| Modelo | nano-BEIR (en) | nano-BEIR (ko) | MTEB (eng, v2) | Ko-Retrieval |
|---|---|---|---|---|
| embeddinggemma-300m | 0,5330 / 0,5059 / 0,4813 / 0,4379 | 0,4564 / 0,4423 / 0,4163 / 0,3764 | 0,6247 / 0,6155 / 0,6097 / 0,5894 | 0,7295 / 0,7172 / 0,6992 / 0,6397 |
| llama-nemotron-embed-1b-v2 | 0,6466 / 0,6259 / 0,5961 / 0,5386 | 0,5471 / 0,5204 / 0,4818 / 0,4225 | 0,6369 / 0,6222 / 0,6055 / 0,5752 | 0,7985 / 0,7787 / 0,7506 / 0,6780 |
| Qwen3-Embedding-0.6B | 0,5822 / 0,5722 / 0,5472 / 0,5316 | 0,4845 / 0,4712 / 0,4494 / 0,4256 | 0,6311 / 0,6268 / 0,6160 / 0,6013 | 0,7279 / 0,7126 / 0,6825 / 0,6365 |
| Qwen3-Embedding-4B | 0,6379 / 0,6187 / 0,5910 / 0,5449 | 0,5522 / 0,5177 / 0,4912 / 0,4515 | **0,6661 / 0,6606 / 0,6470 / 0,6284** | 0,7837 / 0,7617 / 0,7266 / 0,6854 |
| kanana-nano-2.1b-embedding-v1.0.0 | 0,5285 | 0,4948 | 0,6028 | 0,7579 |
| kanana-essence-8b-embedding-v1.0.0 | 0,6013 | 0,5518 | 0,6444 | 0,7896 |
| **kanana-2-1.3b-embedding** | 0,6332 / 0,6257 / 0,6078 / 0,5603 | 0,5866 / 0,5812 / 0,5610 / 0,5164 | 0,6197 / 0,6037 / 0,5879 / 0,5572 | 0,7958 / 0,7891 / 0,7706 / 0,7211 |
| **kanana-2-3b-embedding** | **0,6552 / 0,6327 / 0,6170 / 0,5899** | **0,6088 / 0,5943 / 0,5683 / 0,5206** | 0,6317 / 0,6203 / 0,6057 / 0,5760 | **0,8211 / 0,8066 / 0,7873 / 0,7488** |

Ko-Retrieval es la media de seis tareas coreanas: MIRACLRetrieval, Ko-StrategyQA, AutoRAGRetrieval, LawIRKo, SQuADKorV1Retrieval y PublicHealthQA.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16/bf16, unos 6,4 GB solo de pesos; en la práctica, entre 8 y 10 GB de VRAM con overhead de activaciones para batch moderado. No hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU moderna de 8-12 GB es suficiente para inferencia (RTX 3060 12 GB, RTX 4070, RTX 4090). Para indexación masiva o serving con batches grandes, A100 o L4.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB con holgura; en tarjetas de 8 GB puede quedar justo y convendría reducir batch size o usar CPU.
- CPU: viable para volúmenes bajos dada la latencia de un modelo de 3B bidireccional; no es la opción recomendada para producción.
- Despliegue: sentence-transformers de forma nativa; también Hugging Face Inference Endpoints (etiqueta endpoints_compatible). No hay soporte GGUF/llama.cpp ni Ollama documentado, y al ser un modelo con custom_code y atención bidireccional, vLLM/TGI no son aplicables de forma directa.
- Latencia y throughput: no disponibles; como referencia, un encoder de 3B con 4.096 tokens de contexto procesa batches moderados en GPU de consumo con latencias del orden de decenas de milisegundos por texto.

## Comparativa con modelos similares

| Modelo | Parametros | Dim. embedding | Contexto | nano-BEIR (ko) full | Ko-Retrieval full | Licencia |
|---|---|---|---|---|---|---|
| kanana-2-3b-embedding | 3,18B | 2560 (MRL hasta 128) | 4.096 | 0,6088 | 0,8211 | kanana-open-license |
| Qwen3-Embedding-4B | 4B | no disponible | no disponible | 0,5522 | 0,7837 | Apache 2.0 |
| llama-nemotron-embed-1b-v2 | 1B | no disponible | no disponible | 0,5471 | 0,7985 | no disponible |
| Qwen3-Embedding-0.6B | 0,6B | no disponible | no disponible | 0,4845 | 0,7279 | Apache 2.0 |

Kanana-2-3b supera a Qwen3-Embedding-4B en las tareas coreanas con menos parámetros, mientras que Qwen3-4B mantiene la ventaja en MTEB (eng, v2) para inglés. Qwen3-Embedding-0.6B es la alternativa ligera con licencia permisiva si el caso de uso es principalmente inglés o el coreano no es crítico.

## Limitaciones y advertencias

- Licencia no estándar: kanana-open-license no es una licencia abierta reconocida (Apache, MIT); es imprescindible revisar el texto legal antes de cualquier uso comercial o redistribución.
- Idiomas limitados: entrenado para coreano e inglés; el rendimiento en otros idiomas, incluido el castellano, no está evaluado y probablemente sea inferior.
- En inglés puro, Qwen3-Embedding-4B lo supera en MTEB (eng, v2); no es la mejor opción si el caso de uso es exclusivamente inglés.
- Al usar custom_code, la inferencia requiere confiar en código remoto del repositorio (trust_remote_code), lo que añade consideraciones de seguridad en entornos de producción.
- No hay cuantizaciones oficiales ni formatos GGUF, lo que limita las opciones de despliegue ligero y edge.
- Como todo modelo de embeddings, puede reflejar sesgos del corpus de entrenamiento (no documentado); conviene validar en dominios concretos antes de producción.
- Los datos de entrenamiento, el procedimiento detallado y las tasas de alucinación no aplican directamente (no es generativo), pero la calidad de recuperación en dominios fuera de los benchmarks no está garantizada.

## Enlaces

- Modelo: https://huggingface.co/kakaocorp/kanana-2-3b-embedding
- Variante 1.3B: https://huggingface.co/kakaocorp/kanana-2-1.3b-embedding
- Licencia: https://huggingface.co/kakaocorp/kanana-2-3b-embedding/blob/main/LICENSE
- Blog de desarrollo de Kanana-2: https://tech.kakao.com/posts/826
- MTEB (framework de evaluación): https://github.com/embeddings-benchmark/mteb
