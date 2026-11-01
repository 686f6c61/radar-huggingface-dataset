# ElyKok/hebrew-qa-retriever-e5-large

## Resumen

ElyKok/hebrew-qa-retriever-e5-large es un modelo de embeddings para recuperación de información (retrieval) en hebreo, desarrollado por el usuario ElyKok y publicado en HuggingFace. Se trata de un fine-tuning de intfloat/multilingual-e5-large, un transformer basado en XLM-RoBERTa con 559.890.432 parámetros, especializado en la tarea de, dada una pregunta en hebreo, recuperar el párrafo que la responde. El modelo resuelve el problema de la búsqueda semántica en hebreo dentro de pipelines RAG (Retrieval-Augmented Generation), donde los modelos multilingües genéricos no rinden de forma óptima en este idioma.

El fine-tuning se ha realizado sobre las preguntas respondibles del dataset HeQ (Hebrew Question Answering Dataset), con dos negativos duros minados por pregunta y la función de pérdida CachedMultipleNegativesRankingLoss. El resultado es una mejora sustancial respecto al modelo base: en el conjunto de test de HeQ (1.072 preguntas sobre 4.930 párrafos), el modelo alcanza R@1 de 78,9 frente al 72,4 del e5-large original, y un NDCG@10 de 87,3 frente a 82,0.

Es relevante ahora porque el hebreo es un idioma con relativamente pocos recursos en el ecosistema de embeddings especializados, y este modelo demuestra que un fine-tuning ligero (una época, lr 1e-05, batch 64) sobre un modelo multilingüe sólido puede superar tanto a BM25 como a alternativas más recientes como Qwen3-Embedding-0.6B en esta tarea concreta. La licencia MIT facilita su adopción comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), base de intfloat/multilingual-e5-large |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | hebreo (he); el modelo base es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de intfloat/multilingual-e5-large, que a su vez es un transformer encoder basado en la arquitectura XLM-RoBERTa con 559,9 millones de parámetros. Se utiliza como modelo de embeddings de frases (sentence-transformers) para similitud semántica y recuperación: codifica consultas y pasajes en un espacio vectorial donde la similitud coseno refleja relevancia. El modelo requiere los prefijos `query: ` y `passage: ` en las entradas, igual que el modelo base.

El entrenamiento se realizó sobre las preguntas respondibles del dataset HeQ (Hebrew Question Answering Dataset, del proyecto NNLP-IL), con dos negativos duros minados por pregunta y la función de pérdida CachedMultipleNegativesRankingLoss, con batch de 64, una época y learning rate de 1e-05. No se indica en la información disponible el número total de tokens de entrenamiento ni si hubo fases adicionales de RLHF o DPO (poco habituales en modelos de embeddings). La innovación principal es el uso de negativos duros minados y la citada función de pérdida con caché, que permite batches efectivos grandes con memoria contenida, lo que resulta clave para el aprendizaje contrastivo en recuperación.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Recuperación de párrafos relevantes dada una pregunta en hebreo (question answering extractivo vía retrieval).
- Soporte de búsqueda semántica densa sobre corpus de documentos.
- Integración en pipelines RAG como componente retriever.
- Combinación con búsqueda léxica BM25 mediante Reciprocal Rank Fusion (recomendado por el autor).
- Capacidad multilingüe heredada del modelo base, aunque el fine-tuning está orientado a hebreo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en hebreo sobre bases documentales: el modelo codifica consultas y pasajes con los prefijos correspondientes y permite recuperar los párrafos más relevantes por similitud coseno, superando a BM25 en R@1 (78,9 frente a 73,1 en HeQ).
- Componente retriever en pipelines RAG en hebreo: se usa para recuperar el contexto que se pasa a un LLM generativo, mejorando la calidad de las respuestas al reducir el ruido en el contexto recuperado.
- Atención al cliente automatizada en hebreo: permite localizar artículos de ayuda o FAQs relevantes ante la consulta de un usuario, con la ventaja de que el modelo está afinado específicamente para preguntas en hebreo.
- Búsqueda híbrida en producción: combinado con BM25 mediante Reciprocal Rank Fusion, alcanza R@1 de 82,9 y NDCG@10 de 89,4 en HeQ, por lo que es adecuado para sistemas de búsqueda empresarial que ya dispongan de índice léxico.
- Recuperación sobre documentación técnica y prensa especializada: el modelo muestra buen rendimiento en subconjuntos de Wikipedia (R@5 93,2) y Geektime (R@5 90,7), lo que lo hace útil para corpus mixtos de contenido enciclopédico y tecnológico.
- Deduplicación y clustering semántico de textos en hebreo: los embeddings normalizados permiten agrupar documentos similares o detectar duplicados en corpus hebreos.
- Evaluación de sistemas de QA: sirve como baseline de recuperación para comparar arquitecturas de RAG en hebreo, dado que el autor publica resultados detallados sobre el test de HeQ.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de HeQ (1.072 preguntas, búsqueda sobre 4.930 párrafos), según la model card:

| Modelo | R@1 | R@5 | R@10 | MRR@10 | NDCG@10 | R@5 Wikipedia | R@5 Geektime |
|---|---|---|---|---|---|---|---|
| BM25 (búsqueda por palabras clave) | 73,1 | 86,8 | 89,8 | 79,0 | 81,7 | 91,2 | 82,2 |
| multilingual-e5-base | 67,4 | 81,7 | 86,2 | 73,4 | 76,5 | 86,2 | 77,0 |
| multilingual-e5-large | 72,4 | 87,8 | 91,2 | 79,0 | 82,0 | 90,8 | 84,6 |
| Qwen3-Embedding-0.6B | 56,0 | 71,1 | 76,9 | 62,6 | 66,0 | 74,9 | 67,2 |
| Fine-tuned e5-base (autor) | 67,3 | 82,8 | 86,5 | 74,1 | 77,1 | 87,0 | 78,6 |
| Fine-tuned e5-large (este modelo) | 78,9 | 92,0 | 94,8 | 84,8 | 87,3 | 93,2 | 90,7 |
| Híbrido: BM25 + e5-large (sin entrenar) | 80,4 | 92,1 | 95,1 | 85,5 | 87,8 | 94,7 | 89,4 |
| Híbrido: BM25 + e5-large fine-tuned (este modelo) | 82,9 | 93,2 | 95,4 | 87,4 | 89,4 | 95,4 | 90,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 559,9 M de parámetros, en FP32 ocupa aproximadamente 2,2 GB de pesos; en FP16 unos 1,1 GB; en cuantización de 8 bits alrededor de 0,6 GB. El consumo real depende del tamaño de batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM puede ejecutar el modelo en FP16 con batches moderados; para alto throughput se recomiendan A100, H100 o L40S. Una RTX 4090 o RTX 3090 es más que suficiente para uso en producción de tamaño medio.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB con cuantización.
- Opciones de despliegue: sentence-transformers (librería nativa), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` en el repo), vLLM (soporte de embeddings), y exportación a ONNX/GGUF mediante herramientas de sentence-transformers (no se confirma en la información disponible que existan artefactos GGUF publicados).
- Latencia y throughput: no disponible en la información proporcionada. Al ser un encoder de 559 M de parámetros, la latencia por lote suele ser de decenas de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | R@1 en HeQ | NDCG@10 en HeQ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ElyKok/hebrew-qa-retriever-e5-large | 559,9 M | no disponible | 78,9 | 87,3 | MIT | HuggingFace |
| intfloat/multilingual-e5-large | 559,9 M | no disponible | 72,4 | 82,0 | MIT | HuggingFace |
| intfloat/multilingual-e5-base | 278 M (aprox.) | no disponible | 67,4 | 76,5 | MIT | HuggingFace |
| Qwen3-Embedding-0.6B | 0,6 B | no disponible | 56,0 | 66,0 | no disponible en la información | HuggingFace |
| BM25 (baseline léxico) | no aplica | no aplica | 73,1 | 81,7 | no aplica | Implementaciones múltiples |

El modelo supera al e5-large base en todas las métricas de HeQ y también a Qwen3-Embedding-0.6B, que en este benchmark concreto rinde por debajo incluso de BM25. La combinación híbrida con BM25 es la configuración de mayor rendimiento reportada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al entrenarse sobre HeQ (Wikipedia y Geektime), puede heredar los sesgos de composición de esas fuentes.
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto), pero puede recuperar pasajes irrelevantes si la consulta es ambigua o el corpus no contiene la respuesta; el R@1 de 78,9 implica que aproximadamente una de cada cinco consultas no recupera el párrafo correcto en primera posición.
- Limitación de idioma: el fine-tuning está orientado a hebreo; el rendimiento en otros idiomas no está evaluado y probablemente sea inferior al del modelo base multilingüe.
- Limitación de contexto: no se especifica la longitud máxima de secuencia en la información disponible; el modelo base e5-large tiene un límite habitual de 512 tokens, pero no se confirma para este fine-tuning.
- Sesgo de construcción del benchmark: el propio autor advierte que las preguntas de HeQ se escribieron mirando el párrafo, por lo que comparten más vocabulario con él que las consultas reales de usuarios; el rendimiento en producción podría ser inferior al reportado.
- Licencia: MIT, permisiva para uso comercial, pero conviene verificar las condiciones del dataset HeQ (CC BY 4.0, Webiks/MAFAT) si se redistribuyen datos derivados.
- Para producción: se recomienda combinar con BM25 mediante RRF y validar con consultas reales, dado el mencionado sesgo del benchmark.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElyKok/hebrew-qa-retriever-e5-large
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Dataset HeQ (GitHub): https://github.com/NNLP-IL/Hebrew-Question-Answering-Dataset
- Librería sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
