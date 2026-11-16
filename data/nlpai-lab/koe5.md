# nlpai-lab/KoE5

## Resumen

KoE5 es un modelo de embeddings de texto especializado en recuperación de información (retrieval) en coreano, desarrollado por el NLP&AI Lab de la Universidad de Corea (nlpai-lab). Se trata de un fine-tuning de intfloat/multilingual-e5-large, un transformer de tipo XLM-RoBERTa con 559.890.432 parámetros, orientado a tareas de feature-extraction y búsqueda semántica. El modelo genera representaciones vectoriales de 1024 dimensiones y está pensado para su uso en sistemas RAG (retrieval-augmented generation), motores de búsqueda semántica y pipelines de recuperación documental.

El modelo se entrena sobre el dataset nlpai-lab/ko-triplet-v1.0, compuesto por más de 700.000 pares de consulta-documento con negativos duros en coreano, y emplea la función de pérdida CachedMultipleNegativesRankingLoss de sentence-transformers. Su relevancia radica en que mejora ligeramente a su modelo base multilingual-e5-large en benchmarks de recuperación en coreano (Recall@1 medio de 0,50157 frente a 0,50052), aunque queda por detrás de alternativas como KURE-v1 o BGE-m3-ko.

La licencia MIT facilita su adopción comercial. El modelo soporta coreano e inglés, tiene una longitud de contexto de 512 tokens y se distribuye en formato safetensors, con un tamaño de repositorio de 2,3 GB. Es compatible con Text Embeddings Inference y con despliegue en Azure.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa, fine-tuning de intfloat/multilingual-e5-large) |
| Parametros totales | 559.890.432 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (el repo distribuye safetensors en precisión completa; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

KoE5 parte de intfloat/multilingual-e5-large, un encoder transformer basado en XLM-RoBERTa con 559,9 millones de parámetros que produce embeddings de 1024 dimensiones. El fine-tuning se realiza con el dataset ko-triplet-v1.0, formado por más de 700.000 ejemplos de tripletas consulta-documento-negativo duro en coreano, construidas a partir de datos abiertos. La función de pérdida empleada es CachedMultipleNegativesRankingLoss de sentence-transformers, con un tamaño de lote de 512, una tasa de aprendizaje de 1e-05 y una sola época de entrenamiento.

El modelo sigue la convención de prefijos de la familia E5: las consultas deben ir precedidas de `query: ` y los documentos de `passage: `. No se documentan innovaciones arquitectónicas adicionales más allá del fine-tuning con negativos duros; el interés técnico reside en la adaptación del encoder multilingüe al dominio coreano mediante datos de recuperación específicos.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones para búsqueda semántica y recuperación densa.
- Recuperación de documentos en coreano e inglés, con especial énfasis en coreano.
- Cálculo de similitudes coseno entre consultas y pasajes mediante la API de sentence-transformers.
- Soporte de la convención de prefijos `query:` y `passage:` para distinguir consultas de documentos.
- Uso como componente de recuperación en pipelines RAG.
- Compatibilidad con Text Embeddings Inference (TEI) y despliegue en Azure.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de representación (feature-extraction).

## Casos de uso

- Búsqueda semántica en documentación legal coreana: el modelo se usa para indexar y recuperar pasajes de leyes y sentencias; su entrenamiento con datos de recuperación en coreano y su contexto de 512 tokens lo hacen adecuado para fragmentos de artículos y resoluciones.
- Sistemas RAG sobre bases de conocimiento en coreano: se emplea como retriever para obtener los pasajes relevantes que luego se pasan a un LLM generador, aprovechando la convención `query:`/`passage:` para separar consultas de documentos.
- Atención al cliente automatizada: permite recuperar respuestas o artículos de ayuda a partir de la consulta del usuario en coreano, integrándose en un pipeline de FAQ semántica.
- Búsqueda en dominios especializados (finanzas, salud, comercio): el modelo se ha evaluado en datasets como AutoRAGRetrieval y PublicHealthQA, por lo que puede desplegarse en recuperación documental de esos sectores en coreano.
- Deduplicación y clustering de documentos: los embeddings permiten agrupar documentos similares o detectar duplicados en corpus coreanos mediante similitud coseno.
- Recuperación multilingüe coreano-inglés: al derivar de un modelo multilingüe, puede alinear consultas en inglés con pasajes en coreano en escenarios bilingües.
- Indexación para motores de búsqueda vectoriales: se integra en bases de datos vectoriales (FAISS, Milvus, Qdrant) como encoder de documentos y consultas.

## Benchmarks y rendimiento

Resultados medios sobre los datasets de evaluación coreanos (Ko-StrategyQA, AutoRAGRetrieval, MIRACLRetrieval, PublicHealthQA, BelebeleRetrieval, MrTidyRetrieval, MultiLongDocRetrieval, XPQARetrieval), según la model card:

| Modelo | Recall_top1 | Precision_top1 | NDCG_top1 | F1_top1 |
|---|---|---|---|---|
| nlpai-lab/KURE-v1 | 0,52640 | 0,60551 | 0,60551 | 0,55784 |
| dragonkue/BGE-m3-ko | 0,52361 | 0,60394 | 0,60394 | 0,55535 |
| BAAI/bge-m3 | 0,51778 | 0,59846 | 0,59846 | 0,54998 |
| Snowflake/snowflake-arctic-embed-l-v2.0 | 0,51246 | 0,59384 | 0,59384 | 0,54489 |
| nlpai-lab/KoE5 | 0,50157 | 0,57790 | 0,57790 | 0,53178 |
| intfloat/multilingual-e5-large | 0,50052 | 0,57727 | 0,57727 | 0,53122 |
| jinaai/jina-embeddings-v3 | 0,48287 | 0,56068 | 0,56068 | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 2,2 GB para los pesos (559,9 M de parámetros); en fp16, alrededor de 1,1 GB. El repositorio ocupa 2,3 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomiendan A100, H100 o L4 para despliegues de alto throughput, y RTX 4090 o RTX 3090 para entornos de desarrollo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 4 GB o más de VRAM.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), Transformers con PyTorch, y despliegue en Azure (según los tags del repositorio).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recall_top1 (medio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nlpai-lab/KoE5 | 559,9 M | 512 | 0,50157 | MIT | Hugging Face |
| nlpai-lab/KURE-v1 | No disponible | 8192 | 0,52640 | No disponible | Hugging Face |
| BAAI/bge-m3 | No disponible | No disponible | 0,51778 | No disponible | Hugging Face |
| intfloat/multilingual-e5-large | No disponible | No disponible | 0,50052 | No disponible | Hugging Face |

KURE-v1 supera a KoE5 en Recall@1 y ofrece una ventana de contexto mucho mayor (8192 frente a 512 tokens), lo que lo hace preferible para documentos largos. BGE-m3 también obtiene mejores resultados medios. KoE5, en cambio, ofrece licencia MIT explícita y un tamaño de modelo contenido.

## Limitaciones y advertencias

- Solo soporta coreano e inglés; no está validado para otros idiomas pese a derivar de un modelo multilingüe.
- Longitud de contexto limitada a 512 tokens, insuficiente para documentos largos sin fragmentación previa.
- Es un modelo de embeddings, no generativo: no produce texto ni responde preguntas por sí mismo.
- Riesgo de sesgos heredados del corpus de entrenamiento (datos abiertos en coreano) y del modelo base multilingual-e5-large.
- Rendimiento inferior a KURE-v1 y BGE-m3-ko en los benchmarks publicados por el propio autor.
- Requiere respetar la convención de prefijos `query:` y `passage:`; su omisión puede degradar la calidad de la recuperación.
- Licencia MIT permite uso comercial, pero no se documentan garantías ni cláusulas adicionales sobre los datos de entrenamiento.
- No se han publicado datos de latencia ni throughput en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/KoE5
- Dataset de entrenamiento: https://huggingface.co/datasets/nlpai-lab/ko-triplet-v1.0
- Repositorio KURE (evaluación y resultados): https://github.com/nlpai-lab/KURE
- Resultados detallados de evaluación: https://github.com/nlpai-lab/KURE/tree/main/eval/results
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Modelo relacionado KURE-v1: https://huggingface.co/nlpai-lab/KURE-v1
- Laboratorio: http://nlp.korea.ac.kr/
- Documentación de CachedMultipleNegativesRankingLoss: https://sbert.net/docs/package_reference/sentence_transformer/losses.html#cachedmultiplenegativesrankingloss
