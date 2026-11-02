# multi-vector-encoder/merged-GLInt-LateOn

## Resumen

merged-GLInt-LateOn es un modelo de recuperación de información basado en late interaction (estilo ColBERT) publicado por el usuario multi-vector-encoder. Se trata de un merge lineal 50/50 de dos encoders multi-vector: chungimungi/GLInt y lightonai/LateOn-regularized, ambos construidos sobre la arquitectura ModernBERT. El modelo proyecta consultas y documentos a secuencias de vectores por token de 128 dimensiones y las puntúa mediante MaxSim, el mecanismo clásico de late interaction.

El modelo resuelve el problema de la búsqueda semántica de alta precisión sobre documentos largos: admite consultas de hasta 32 tokens y documentos de hasta 8192 tokens, muy por encima de los 300 tokens usados por sus modelos padre. Con 149 millones de parámetros y pesos en safetensors de 0,6 GB, es lo bastante ligero para desplegarse en infraestructura modesta, pero conserva la expresividad de un scorer multi-vector.

Su relevancia actual radica en que demuestra que un merge trivial (unas seis líneas de código y unos 12 segundos de ejecución) puede superar ligeramente a ambos progenitores en la mayoría de los 13 datasets de NanoBEIR, con un nDCG@10 medio de 0,7061 frente a 0,6996 de GLInt y 0,6979 de LateOn-regularized. Es una alternativa práctica para pipelines de retrieval que necesitan contexto largo sin renunciar a la precisión del late interaction.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MultiVectorEncoder sobre ModernBertModel, con proyecciones Dense y similitud MaxSim |
| Parámetros totales | 149.015.808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (documento); consulta limitada a 32 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MultiVectorEncoder compuesto por un transformer ModernBertModel que actúa como extractor de features, seguido de tres capas Dense sin sesgo: una proyección de 768 a 1536 con residual, otra de 1536 a 768 con residual y una proyección final de 768 a 128 dimensiones. Después se aplica una MultiVectorMask que elimina signos de puntuación del skiplist en los documentos (no en las consultas), y una capa Normalize sobre los embeddings por token. La puntuación se calcula con MaxSim entre los vectores de consulta y de documento.

No hay entrenamiento propio: el modelo resulta de un merge lineal 50/50 de los pesos de GLInt y LateOn-regularized mediante el método `MultiVectorEncoder.merge` de sentence-transformers. Los ajustes del merge no se basaron en resultados de evaluación, y el único cambio respecto a los padres fue ampliar la longitud de documento de 300 a 8192 tokens. No se dispone de información sobre los datos de entrenamiento de los modelos base, ni sobre si hubo RLHF, DPO u otras fases de alineación.

## Capacidades

- Generación de embeddings multi-vector a nivel de token (128 dimensiones por token) para consultas y documentos.
- Recuperación semántica mediante late interaction con scoring MaxSim.
- Procesamiento de documentos largos de hasta 8192 tokens, adecuado para pasajes extensos, artículos o contratos.
- Consultas cortas optimizadas a un máximo de 32 tokens.
- Filtrado automático de puntuación en documentos mediante skiplist, lo que reduce ruido en el scoring.
- Soporte de feature-extraction dentro del ecosistema sentence-transformers.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- Capacidad monolingüe: solo inglés.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar manuales o referencias de API de hasta 8192 tokens por fragmento y recuperar pasajes relevantes con MaxSim, aprovechando que el modelo mantiene la señal por token en lugar de comprimir todo el documento en un único vector.
- Motor de recuperación en pipelines RAG: usar el modelo como retriever de primera etapa o de reranking sobre candidatos, generando embeddings de consulta de 32 tokens y de documento de 8192, y alimentando el contexto recuperado a un LLM generador.
- Búsqueda legal o de compliance en inglés: la ventana de 8192 tokens permite indexar cláusulas y secciones completas sin truncar, lo que mejora la recuperación de fragmentos con matices léxicos específicos.
- Atención al cliente con base de conocimiento: recuperar artículos de ayuda y respuestas frecuentes en inglés con alta precisión semántica, integrándolo en un sistema de respuesta automatizada multi-turno.
- Búsqueda académica y científica: indexar abstracts y secciones de papers en inglés; el modelo rinde de forma competitiva en scidocs y nfcorpus, lo que lo hace apto para motores de descubrimiento de literatura.
- Deduplicación y clustering de documentos: los embeddings por token permiten comparar documentos largos con granularidad fina, útil para detectar near-duplicates en corpus extensos.
- Evaluación de relevancia en sistemas de ranking: servir como scorer de late interaction en un reranker de segunda etapa sobre los top-k resultados de un retriever bi-encoder.

## Benchmarks y rendimiento

Evaluación sobre NanoBEIR-en (13 datasets), métrica nDCG@10, consulta de 32 tokens y documento de 8192 tokens:

| Dataset | merged-GLInt-LateOn | GLInt | LateOn-regularized |
|---|---|---|---|
| msmarco | 0.736155 | 0.728477 | 0.707793 |
| nq | 0.818848 | 0.818032 | 0.782732 |
| fiqa2018 | 0.640317 | 0.625973 | 0.625546 |
| nfcorpus | 0.393756 | 0.399912 | 0.391630 |
| scidocs | 0.435285 | 0.435472 | 0.444901 |
| arguana | 0.588440 | 0.569680 | 0.561172 |
| dbpedia | 0.703868 | 0.709176 | 0.678083 |
| Media (13 datasets) | 0.7061 | 0.6996 | 0.6979 |

El modelo supera la media de sus dos padres en 9 de los 13 datasets de NanoBEIR y bate a ambos en 5. La tabla de la model card solo detalla 7 de los 13 datasets; el resto no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 0,6 GB de pesos; en fp16 alrededor de 0,3 GB. A ello hay que sumar la memoria de activaciones, que crece con la longitud de documento: procesar 8192 tokens por documento incrementa notablemente el consumo frente a los 300 tokens de los modelos padre.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo con documentos largos; una RTX 4090, A100 o H100 permiten mayor throughput y batch size en indexación masiva.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4070, RTX 4080 y RTX 4090, siempre ajustando el batch size y la longitud de documento.
- Opciones de despliegue: sentence-transformers (nativo), text-embeddings-inference y endpoints compatibles. No se indica soporte explícito de llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. El coste de indexación es proporcional al número de tokens por documento, por lo que la ventana de 8192 tokens implica un coste por documento muy superior al de los modelos padre configurados a 300 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto (documento) | nDCG@10 medio NanoBEIR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| merged-GLInt-LateOn | 149 M | 8192 | 0.7061 | Apache-2.0 | HuggingFace |
| GLInt (chungimungi) | no disponible | 300 (configuración evaluada) | 0.6996 | no disponible | HuggingFace |
| LateOn-regularized (lightonai) | no disponible | 300 (configuración evaluada) | 0.6979 | no disponible | HuggingFace |

Los tres modelos comparten la misma familia arquitectónica (ModernBERT multi-vector con late interaction) y se evaluaron con los mismos prompts y límites de longitud. La ventaja principal del merge es la ventana de documento ampliada a 8192 tokens y una mejora moderada pero consistente en la media de NanoBEIR.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés, por lo que no es adecuado para recuperación en castellano u otros idiomas.
- Consultas limitadas a 32 tokens: consultas más largas se truncan, lo que puede degradar la recuperación en escenarios de query expansion o preguntas extensas.
- El merge no se guió por evaluación: los ajustes se eligieron sin basarse en resultados, por lo que la mejora sobre los padres es modesta y podría no generalizar a dominios fuera de NanoBEIR.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en recuperación: MaxSim puede puntuar alto documentos léxicamente solapados pero semánticamente irrelevantes.
- Coste computacional de indexación elevado con documentos de 8192 tokens, tanto en memoria como en tiempo, en comparación con retrievers bi-encoder de un solo vector.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base (GLInt y LateOn-regularized), no disponibles en la información proporcionada.
- Sin datos publicados sobre cuantización, latencia ni throughput, lo que dificulta planificar despliegues en producción sin pruebas propias.
- Modelo con muy poca tracción (35 descargas, 1 like) y sin validación comunitaria extensa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/multi-vector-encoder/merged-GLInt-LateOn
- Modelo base GLInt: https://huggingface.co/chungimungi/GLInt
- Modelo base LateOn-regularized: https://huggingface.co/lightonai/LateOn-regularized
- Documentación de Multi-Vector Encoder: https://www.sbert.net/docs/multi_vector_encoder/usage/usage.html
- Referencia de `MultiVectorEncoder.merge`: https://www.sbert.net/docs/package_reference/multi_vector_encoder/model.html#sentence_transformers.multi_vector_encoder.model.MultiVectorEncoder.merge
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Multi-Vector Encoders en HuggingFace: https://huggingface.co/models?library=sentence-transformers&other=multi-vector
- Dataset NanoBEIR-en: https://huggingface.co/datasets/sentence-transformers/NanoBEIR-en
