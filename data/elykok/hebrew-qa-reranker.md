# ElyKok/hebrew-qa-reranker

## Resumen

Hebrew QA Reranker es un modelo cross-encoder especializado en la tarea de reranking de respuestas para hebreo. Lo desarrolla ElyKok y se obtiene por fine-tuning del modelo multilingüe BAAI/bge-reranker-v2-m3, que a su vez es una variante de XLM-RoBERTa. Su función es puntuar la relevancia de un párrafo en hebreo respecto a una pregunta también en hebreo, actuando como segunda etapa de un pipeline de búsqueda o RAG: se recuperan candidatos con un retriever (BM25 híbrido con embeddings) y este modelo reordena los resultados.

El modelo resuelve un problema concreto: los rerankers multilingües genéricos no rinden de forma óptima en hebreo, un idioma con morfología rica y relativamente poco representado en los corpus de entrenamiento. El fine-tuning se ha realizado sobre las preguntas respondibles del dataset HeQ (Hebrew Question Answering), con tres negativos duros por pregunta generados por una primera etapa híbrida BM25 + e5-large.

Con 567,7 millones de parámetros y un tamaño de repositorio de 2,3 GB, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo para inferencia por lotes. Su licencia Apache 2.0 y su integración con sentence-transformers y text-embeddings-inference lo hacen desplegable en producción sin fricción. Es relevante para equipos que construyen sistemas de búsqueda o asistentes documentales en hebreo y necesitan mejorar la precisión del top-1 sin reentrenar toda la pila de recuperación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (bge-reranker-v2-m3) |
| Parámetros totales | 567.755.777 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantización estándar de sentence-transformers) |
| Idiomas soportados | Hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder transformer de tipo XLM-RoBERTa, heredada de BAAI/bge-reranker-v2-m3. A diferencia de un bi-encoder, el cross-encoder procesa conjuntamente la pregunta y el párrafo candidato, lo que permite capturar interacciones token a token entre ambos y produce una puntuación de relevancia más precisa, a costa de no poder precalcular representaciones.

El fine-tuning se realizó sobre las preguntas respondibles del dataset HeQ, con tres negativos duros por pregunta extraídos de una primera etapa híbrida BM25 + e5-large fine-tuned. Se empleó `BinaryCrossEntropyLoss`, una época, learning rate de 1e-05 y dos GPUs T4. Los artículos del conjunto de test están disjuntos de los de entrenamiento, lo que aporta validez a las métricas reportadas. El dataset HeQ está licenciado bajo CC BY 4.0 (Webiks / MAFAT).

## Capacidades

- Puntuación de relevancia pregunta-párrafo en hebreo mediante cross-encoder.
- Reranking de listas de candidatos recuperados por un retriever de primera etapa (BM25, embeddings o híbrido).
- Integración nativa con `sentence_transformers.CrossEncoder` y con `text-embeddings-inference`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- Uso como segunda etapa en pipelines RAG y motores de búsqueda.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido: es un modelo discriminativo de ranking, no generativo.
- Capacidad multilingüe limitada: aunque el modelo base es multilingüe, el fine-tuning se ha orientado exclusivamente a hebreo.

## Casos de uso

- Búsqueda documental en hebreo: recuperar los 20 mejores párrafos con un retriever híbrido y reordenarlos con este modelo para maximizar la precisión en el top-1, que alcanza R@1 de 93,8 en el conjunto de test de HeQ.
- RAG sobre corpus hebreos: insertar el reranker entre la recuperación y el generador para reducir el contexto irrelevante enviado al LLM, mejorando la fidelidad de las respuestas y reduciendo coste de tokens.
- Atención al cliente automatizada: ordenar fragmentos de base de conocimiento en hebreo antes de que un modelo generativo componga la respuesta, con el objetivo de que la respuesta se base en el pasaje correcto.
- Sistemas de preguntas y respuestas sobre legislación o documentación oficial israelí: el modelo se entrenó con preguntas de HeQ, un dataset de QA sobre artículos enciclopédicos, y generaliza a dominios con estructura similar pregunta-pasaje.
- Búsqueda interna empresarial: reranking de resultados en portales de documentación, wikis o intranets en hebreo donde el retriever denso por sí solo no distingue matices.
- Evaluación y filtrado de datasets: puntuar pares pregunta-respuesta para descartar ejemplos de baja calidad o construir conjuntos de negativos duros para entrenar otros retrievers.
- Moderación de respuestas en hebreo: usar la puntuación de relevancia como señal para decidir si un pasaje recuperado es suficientemente pertinente antes de mostrarlo al usuario.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de HeQ (1.072 preguntas, reranking del top 20 de 4.930 párrafos):

| Modelo | R@1 | R@5 | R@10 | MRR@10 | NDCG@10 |
|---|---:|---:|---:|---:|---:|
| Híbrido (BM25 + e5-large, sin entrenar) | 80,4 | 92,1 | 95,1 | 85,5 | 87,8 |
| Híbrido (BM25 + e5-large, sin entrenar) + bge-reranker-v2-m3 (sin entrenar) | 91,5 | 96,5 | 96,8 | 93,8 | 94,6 |
| Híbrido (BM25 + e5-large, sin entrenar) + reranker fine-tuned (este modelo) | 93,8 | 96,6 | 96,8 | 95,0 | 95,5 |
| Híbrido (BM25 + e5-large fine-tuned) | 83,3 | 93,4 | 95,5 | 87,6 | 89,5 |
| Híbrido (BM25 + e5-large fine-tuned) + bge-reranker-v2-m3 (sin entrenar) | 91,7 | 97,2 | 97,4 | 94,1 | 95,0 |
| Híbrido (BM25 + e5-large fine-tuned) + reranker fine-tuned (este modelo) | 93,9 | 97,2 | 97,4 | 95,4 | 95,9 |

La mejora más significativa se observa en R@1 (+2,3 puntos sobre el reranker base sin entrenar con la primera etapa sin entrenar, y +2,2 puntos con la primera etapa fine-tuned) y en MRR@10 (+1,2 y +1,3 puntos respectivamente).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB para los pesos (567,7 M de parámetros), más memoria para activaciones y lote; en la práctica, entre 2 y 4 GB según tamaño de lote y longitud de secuencia.
- En cuantización de 8 bits, los pesos ocupan aproximadamente 0,6 GB; en 4 bits, unos 0,3 GB, con la consiguiente pérdida de precisión.
- GPU recomendadas para producción con alto throughput: A100, H100 o L40S para lotes grandes; T4 o RTX 4090 son suficientes para cargas moderadas.
- Cabe en GPUs de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4090 y similares, incluso con lotes amplios.
- Opciones de despliegue: `sentence-transformers` (CrossEncoder), Hugging Face Text Embeddings Inference (TEI), endpoints de Hugging Face, y servidores propios con ONNX Runtime o TorchScript.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un cross-encoder, el coste escala linealmente con el número de pares pregunta-párrafo a puntuar, por lo que el reranking del top 20 implica 20 inferencias por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElyKok/hebrew-qa-reranker | 567,7 M | No disponible | Cross-encoder especializado en hebreo | Apache 2.0 | Hugging Face |
| BAAI/bge-reranker-v2-m3 | No disponible | No disponible | Cross-encoder multilingüe (modelo base) | No disponible en la información | Hugging Face |
| Híbrido BM25 + e5-large (sin reranker) | No aplica | No aplica | Recuperación de primera etapa | No disponible | Pipeline propio |

El modelo base bge-reranker-v2-m3 es la referencia directa: este fine-tuning mejora su R@1 en 2,3 puntos sobre la primera etapa sin entrenar y en 2,2 puntos sobre la primera etapa fine-tuned, con mejoras menores en MRR@10 y NDCG@10. No se dispone de datos de otros rerankers específicos para hebreo en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo: su rendimiento en otros idiomas no está validado y probablemente sea inferior al del modelo base multilingüe.
- Es un cross-encoder discriminativo: no genera texto ni respuestas, solo puntuaciones de relevancia; requiere un generador o un retriever adicional en el pipeline.
- El coste computacional crece con el número de candidatos a reordenar; no es adecuado para puntuar corpus completos en tiempo real sin una primera etapa de filtrado.
- Entrenado sobre HeQ, un dataset de preguntas enciclopédicas: puede degradarse en dominios muy distintos (conversacional, técnico, jurídico) sin fine-tuning adicional.
- Riesgo de sesgo heredado del corpus HeQ y del modelo base; no se han publicado análisis de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el dataset HeQ tiene licencia CC BY 4.0 (Webiks / MAFAT) y conviene revisar sus condiciones de atribución si se redistribuye el modelo o derivados.
- La longitud máxima de secuencia no está documentada en la model card; conviene verificar el límite del tokenizador XLM-RoBERTa antes de usar párrafos largos.
- Solo 43 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElyKok/hebrew-qa-reranker
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset HeQ: https://github.com/NNLP-IL/Hebrew-Question-Answering-Dataset
