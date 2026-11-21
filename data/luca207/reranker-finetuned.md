# Luca207/reranker-finetuned

## Resumen

`Luca207/reranker-finetuned` es un cross-encoder de reordenación (reranker) construido sobre `google-bert/bert-base-uncased` y afinado con la librería `sentence-transformers`. Su función es puntuar pares de textos (consulta, documento) y devolver una puntuación de relevancia que permite reordenar resultados de un sistema de recuperación de información. No es un modelo generativo: es un clasificador de secuencias de 1 etiqueta que produce un score por par.

El modelo tiene 109.483.009 parámetros (aproximadamente 109,5 M), una longitud máxima de secuencia de 512 tokens y un tamaño de repositorio de 0,4 GB. Se ha entrenado sobre un conjunto de 9.000 ejemplos con la función de pérdida `MultipleNegativesRankingLoss`, lo que sugiere un uso previsto de ranking semántico dentro de pipelines de búsqueda o RAG.

Es relevante en el contexto actual porque los rerankers de tipo cross-encoder son un componente habitual en arquitecturas de recuperación aumentada por generación (RAG): un primer recuperador (bi-encoder o BM25) obtiene candidatos y el cross-encoder los reordena con mayor precisión. Este modelo, sin embargo, es un artefacto de autor individual, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados, por lo que su utilidad práctica en producción debe validarse empíricamente antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT (`BertForSequenceClassification`), cross-encoder |
| Parámetros totales | 109.483.009 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en `BertForSequenceClassification` con una única etiqueta de salida. La entrada es un par de textos concatenados y el modelo devuelve un logit que se interpreta como puntuación de relevancia del par. La arquitectura completa declarada en la model card es `CrossEncoder(Transformer({'transformer_task': 'sequence-classification', 'architecture': 'BertForSequenceClassification'}))`. Al ser un cross-encoder, la atención se calcula conjuntamente sobre consulta y documento, lo que permite capturar interacciones cruzadas que un bi-encoder no modela, a costa de no poder precomputar representaciones de documentos.

El entrenamiento se realizó con `sentence-transformers` sobre un conjunto de 9.000 ejemplos y con la pérdida `MultipleNegativesRankingLoss`, una función de contrastive learning que usa los negativos del propio batch como negativos en la pérdida. No se especifica la composición del dataset, el número de épocas, la tasa de aprendizaje ni si hubo etapas de validación. Los ejemplos de la model card muestran pares del dominio educativo (preguntas de matemáticas con constructos y respuestas correctas/incorrectas frente a descripciones de errores conceptuales), lo que sugiere que el dataset de afinamiento pertenece a ese dominio, aunque el autor no lo confirma. No se documenta ningún uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Puntuación de pares de textos para reordenación (text-ranking): devuelve un score escalar por par (consulta, documento).
- Ranking de una lista de documentos frente a una consulta mediante `model.rank()`.
- Búsqueda semántica en dos etapas: recuperación con bi-encoder o BM25 y reordenación con este cross-encoder.
- Integración con la librería `sentence-transformers` mediante la clase `CrossEncoder`.
- Compatibilidad declarada con `text-embeddings-inference` y endpoints (tag `endpoints_compatible`).
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento explícito: es exclusivamente un modelo de ranking.
- Capacidades multilingües: no declaradas; el modelo base `bert-base-uncased` está entrenado principalmente en inglés y usa vocabulario uncased, pero el autor no especifica idiomas de afinamiento.

## Casos de uso

- Reordenación en pipelines RAG: tras recuperar los N candidatos con un bi-encoder o búsqueda léxica, el cross-encoder puntúa cada par (pregunta, fragmento) y se seleccionan los K mejores antes de pasarlos al modelo generativo. Los 512 tokens de contexto por par son suficientes para fragmentos típicos de documentación.
- Búsqueda semántica en documentación técnica: indexar fragmentos y usar el reranker para ordenar los resultados de una consulta; el cross-encoder captura coincidencias léxicas y semánticas que la recuperación vectorial puede pasar por alto.
- Deduplicación y agrupación de pares similares: usar las puntuaciones para identificar pares de textos con alta relevancia mutua en tareas de emparejamiento.
- Clasificación de errores educativos: los ejemplos de la model card muestran pares (pregunta con respuesta incorrecta, descripción de error conceptual); el modelo puede usarse para asignar el constructo de error más probable a una respuesta de alumno.
- Filtrado de FAQs: puntuar pares (consulta de usuario, entrada de FAQ) para enrutar la consulta a la respuesta más relevante antes de una respuesta generativa.
- Evaluación de sistemas de recuperación: usar el reranker como juez de relevancia para medir la calidad de un recuperador existente sobre un conjunto de evaluación propio.
- Enrutamiento de tickets de soporte: puntuar pares (texto del ticket, categoría o artículo de base de conocimiento) para asignar la categoría más probable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M × 4 bytes), más activaciones y overhead; en la práctica, menos de 1-2 GB con batch pequeño.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; en int8, aproximadamente 0,11 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100, L40S o RTX 4090 con batches grandes; para volúmenes pequeños, CPU es viable.
- Opciones de despliegue: `sentence-transformers` (CrossEncoder), `text-embeddings-inference` (tag declarado `text-embeddings-compatible`), y cualquier runtime que cargue safetensors de BERT para clasificación de secuencias.
- Latencia y throughput: no disponibles; al ser un BERT-base, el coste por par es bajo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luca207/reranker-finetuned | 109,5 M | 512 tokens | Cross-encoder BERT | no disponible | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22,7 M | 512 tokens | Cross-encoder MiniLM | Apache-2.0 (según el modelo original) | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | ~33,4 M | 512 tokens | Cross-encoder MiniLM | Apache-2.0 (según el modelo original) | Hugging Face |
| BAAI/bge-reranker-base | ~278 M | 512 tokens | Cross-encoder XLM-R | MIT (según el modelo original) | Hugging Face |

La comparación de rendimiento con estas alternativas no está disponible porque el modelo no publica benchmarks. Los modelos `ms-marco-MiniLM` y `bge-reranker-base` son referencias habituales en reordenación y cuentan con evaluaciones públicas en MS MARCO y BEIR; este modelo no ofrece datos equivalentes.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o verificar los términos antes de usarlo en producción.
- Idiomas no declarados: el modelo base es `bert-base-uncased` (inglés); el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas establecidas como `ms-marco-MiniLM` o `bge-reranker`.
- Dataset de entrenamiento no documentado: se desconoce la composición, el dominio y la posible presencia de sesgos; los ejemplos visibles sugieren un dominio educativo de matemáticas, lo que puede limitar la generalización a otros dominios.
- Longitud máxima de 512 tokens: los documentos más largos deben truncarse o dividirse, lo que puede perder información relevante.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí puede producir puntuaciones de relevancia poco calibradas fuera de la distribución de entrenamiento.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validación externa.
- El nombre del repositorio en el ejemplo de uso (`CrossEncoder("reranker-finetuned")`) no coincide con el ID completo del modelo; para cargarlo desde el Hub debe usarse el ID `Luca207/reranker-finetuned`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luca207/reranker-finetuned
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia citado en los tags (Sentence-BERT): https://arxiv.org/abs/1908.10084
