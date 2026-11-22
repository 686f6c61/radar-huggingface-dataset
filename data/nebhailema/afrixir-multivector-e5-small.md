# nebhailema/afrixir-multivector-e5-small

## Resumen

AfriXIR multi-vector retriever es un modelo de recuperación de información (information retrieval) basado en late interaction, desarrollado por el usuario nebhailema y ajustado a partir de `intfloat/multilingual-e5-small`. Emplea una arquitectura ColBERT multi-vector: en lugar de producir un único vector por texto, genera una secuencia de vectores por token de 128 dimensiones y puntúa la relevancia mediante MaxSim. Está especializado en ocho lenguas africanas: amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú.

El modelo resuelve el problema de la recuperación de pasajes en lenguas africanas de bajos recursos, un ámbito donde los retrievers multilingües genéricos suelen rendir por debajo de lo deseable. Con 117,6 millones de parámetros y un tamaño de repositorio de 1,4 GB, es un modelo compacto pensado para desplegarse en pipelines de búsqueda semántica y RAG sobre corpus africanos. Su licencia Apache 2.0 y su compatibilidad con Text Embeddings Inference facilitan la integración en producción.

La relevancia actual del modelo radica en su enfoque multi-vector con interacción tardía, que ofrece mayor precisión que los bi-encoders densos clásicos a costa de un índice más pesado, combinado con un entrenamiento específico sobre el dataset AfriXIR (112.864 ejemplos). Es una pieza útil para quien construya sistemas de recuperación multilingüe centrados en África subsahariana y el Cuerno de África.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Vector Encoder (ColBERT / late interaction) sobre BertModel |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 180 tokens máximo de documento; 32 tokens máximo de consulta |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `MultiVectorEncoder` compuesto por cuatro módulos secuenciales: un transformer BERT (`BertModel`) que extrae los embeddings de token (`last_hidden_state`), una capa densa lineal sin sesgo que proyecta de 384 a 128 dimensiones, una máscara multi-vector que descarta signos de puntuación en los documentos (skiplist de caracteres ASCII) y una normalización final. La similitud se calcula con MaxSim sobre las secuencias de vectores de consulta y documento, el esquema clásico de ColBERT.

El ajuste fino se realizó con la librería sentence-transformers sobre el dataset `nebhailema/AfriXIR`, con 112.864 ejemplos y la función de pérdida `CachedMultiVectorMultipleNegativesRankingLoss`, una variante de contrastive learning con negativos en caché adaptada a multi-vector. La model card no detalla la composición exacta del corpus ni si hubo etapas de RLHF o DPO; esos datos no están disponibles. La ventana es deliberadamente corta (32 tokens de consulta, 180 de documento), lo que sugiere un diseño orientado a pasajes breves y consultas concisas.

## Capacidades

- Recuperación de pasajes (passage retrieval) mediante late interaction con MaxSim.
- Codificación separada de consultas (`encode_query`) y documentos (`encode_document`), con longitudes máximas distintas.
- Representaciones multi-vector a nivel de token: cada entrada produce una secuencia de vectores de 128 dimensiones de longitud variable.
- Soporte multilingüe para ocho lenguas africanas: amárico, hausa, oromo, shona, somalí, suajili, yoruba y zulú.
- Filtrado de puntuación en documentos mediante `MultiVectorMask` para reducir ruido en el índice.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en corpus africanos: indexar artículos de Wikipedia o noticias en suajili, amárico o hausa y recuperar pasajes relevantes para una consulta breve, aprovechando la ventana de 180 tokens por documento.
- RAG sobre documentación local: usar el modelo como retriever en un pipeline de generación aumentada, alimentando a un LLM generativo con pasajes recuperados en lenguas de bajos recursos donde los retrievers genéricos fallan.
- Atención al cliente multilingüe: emparejar preguntas de usuarios en yoruba, zulú o somalí con respuestas de una base de conocimiento preindexada, gracias al codificador de consultas corto (32 tokens).
- Búsqueda jurídica o administrativa: recuperar cláusulas y pasajes de documentos oficiales en amárico u oromo con un índice ColBERT que preserva granularidad a nivel de token.
- Deduplicación y clustering de noticias: comparar pasajes cortos entre sí mediante MaxSim para detectar duplicados o agrupar contenidos periodísticos en varias lenguas africanas.
- Filtrado de candidatos en pipelines de traducción o anotación: seleccionar pasajes relevantes antes de pasarlos a un modelo mayor, reduciendo coste computacional.
- Evaluación de sistemas de recuperación: servir como baseline especializado en lenguas africanas para comparar con retrievers multilingües generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 117,6 millones de parámetros; en fp32 ocupa aproximadamente 470 MB de pesos, y en fp16 unos 235 MB. El índice multi-vector, sin embargo, es mucho mayor que el del modelo: cada token genera un vector de 128 dimensiones, por lo que el almacenamiento del índice escala con el número de tokens indexados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para la inferencia del encoder; para indexación a gran escala se recomiendan A100, H100 o L4 por throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU para volúmenes pequeños.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI), y cualquier framework que soporte modelos BERT con safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo pequeño, se espera baja latencia por lote, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Idiomas |
|---|---|---|---|---|---|
| afrixir-multivector-e5-small | 117,6 M | 180 tokens (doc) / 32 (query) | Multi-vector ColBERT | apache-2.0 | 8 lenguas africanas |
| intfloat/multilingual-e5-small (base) | ~118 M | 512 tokens | Bi-encoder denso | MIT | ~100 idiomas |
| ColBERTv2 (original) | ~110 M | 512 tokens | Multi-vector ColBERT | MIT / BSD | Inglés principalmente |

La comparativa con alternativas específicas para lenguas africanas no está disponible en la información proporcionada. Frente a su modelo base, AfriXIR sacrifica cobertura idiomática y longitud de contexto a cambio de especialización y mayor precisión potencial vía late interaction en las ocho lenguas objetivo.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 180 tokens por documento y 32 por consulta; los pasajes más largos se truncan y pueden perder información relevante.
- Solo cubre ocho lenguas africanas; no es un modelo multilingüe generalista y su rendimiento fuera de esas lenguas no está garantizado.
- El índice multi-vector es más costoso en almacenamiento y memoria que un índice denso de un solo vector por documento, lo que encarece el despliegue a gran escala.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; su única función es la extracción de representaciones para recuperación.
- Riesgo de sesgos derivado del corpus AfriXIR, cuya composición no está detallada en la model card; posibles desequilibrios entre lenguas o dominios.
- Alucinación no aplica directamente al no generar texto, pero sí existe riesgo de recuperaciones irrelevantes si el dominio de consulta difiere del de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene muy pocas descargas (3) y ningún like, lo que sugiere escasa validación comunitaria.
- No se han publicado benchmarks que respalden su calidad frente a alternativas; conviene evaluarlo en el dominio concreto antes de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nebhailema/afrixir-multivector-e5-small)
- [Dataset AfriXIR](https://huggingface.co/datasets/nebhailema/AfriXIR)
- [Modelo base intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small)
- [Documentación de Sentence Transformers](https://sbert.net)
- [Documentación de Multi-Vector Encoder](https://www.sbert.net/docs/multi_vector_encoder/usage/usage.html)
- [Repositorio de Sentence Transformers en GitHub](https://github.com/huggingface/sentence-transformers)
- [Modelos multi-vector en Hugging Face](https://huggingface.co/models?library=sentence-transformers&other=multi-vector)
- [Paper ColBERT (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Paper ColBERTv2 (arXiv:2101.06983)](https://arxiv.org/abs/2101.06983)
