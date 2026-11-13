# cihatyldz/kalbur-reranker

## Resumen

Kalbur-reranker es un modelo de reranking (cross-encoder) especializado en turco, desarrollado por el usuario cihatyldz y publicado en Hugging Face bajo licencia Apache 2.0. Se construye mediante fine-tuning sobre BAAI/bge-reranker-v2-m3, un cross-encoder multilingüe de referencia, y su objetivo es mejorar la calidad del reordenamiento de resultados en pipelines de búsqueda y recuperación de información en turco, especialmente cuando las consultas llegan degradadas (mayúsculas, ausencia de caracteres turcos, escritura móvil o errores tipográficos).

El modelo mantiene el tamaño del base (568M parámetros, arquitectura XLM-RoBERTa) y añade una innovación clave: entrenamiento con consultas corruptas y destilación a nivel de lista desde dos profesores (el propio bge-reranker-v2-m3 y Qwen3-Reranker-4B). Esto le permite igualar o superar ligeramente al base en consultas limpias y mejorar de forma más clara en consultas degradadas, manteniendo la misma velocidad de inferencia que el modelo original.

Es relevante ahora porque cubre un hueco práctico: los rerankers multilingües genéricos rinden peor en turco con consultas reales de usuario, y las alternativas específicas para turco son escasas. Kalbur ofrece una opción ligera (568M), compatible con sentence-transformers y ONNX int8, con benchmarks públicos en el espacio Pusula y un demo desplegado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (fine-tune de BAAI/bge-reranker-v2-m3) |
| Parametros totales | 567.755.777 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length recomendado en el ejemplo de uso) |
| Tipos de cuantizacion | ONNX int8 (model_quint8_avx2.onnx); safetensors en precision original |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Kalbur es un cross-encoder: recibe un par (consulta, pasaje) y produce una puntuación de relevancia. Se inicializa desde BAAI/bge-reranker-v2-m3, que a su vez se apoya en XLM-RoBERTa con 568M parámetros, y conserva su arquitectura y velocidad de inferencia. No es un modelo generativo ni un MoE; su función es puntuar pares para reordenar una lista de candidatos ya recuperada por un retriever de primera etapa (en los benchmarks, bge-m3).

El entrenamiento combina dos técnicas. Por un lado, destilación a nivel de lista desde dos profesores: el propio bge-reranker-v2-m3 y Qwen3-Reranker-4B. Por otro, entrenamiento explícito con consultas corruptas: mayúsculas sostenidas, eliminación de caracteres turcos, escritura típica de móvil y errores tipográficos. El corpus de pasajes incluye 7.599 artículos de Wikipedia turca (20231101.tr) más pasajes del corpus legislativo turco (hasankursun/turkish-legislation-corpus), con un pool de 108.000 pasajes como negativos duros. Las consultas se generaron con Qwen3-8B: una pregunta y una frase de búsqueda por pasaje, hasta 14.755 consultas tras eliminar duplicados, referencias meta, escritura extranjera y solapamientos con benchmarks. Los candidatos se construyeron con positivos más negativos de bge-m3.

## Capacidades

- Reranking de pares consulta-pasaje en turco mediante cross-encoder (pipeline text-ranking).
- Robustez ante consultas degradadas: mayúsculas, ausencia de caracteres turcos (ç, ğ, ı, ö, ş, ü), escritura móvil y errores tipográficos.
- Integración con sentence-transformers mediante `CrossEncoder` y método `rank`.
- Inferencia en CPU eficiente gracias al export ONNX int8 (quint8 AVX2).
- Compatible con Text Embeddings Inference (tag text-embeddings-inference) y endpoints de Hugging Face.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Multilingüe limitado: aunque el base es multilingüe, el fine-tune está orientado a turco y los benchmarks solo cubren turco.

## Casos de uso

- Búsqueda en webs de contenido turco: recuperar candidatos con un retriever (por ejemplo bge-m3) y reordenar los primeros 30 con Kalbur para mejorar el nDCG@10 en consultas reales de usuario, incluidas las escritas sin caracteres turcos.
- Atención al cliente en turco: reordenar artículos de base de conocimiento ante consultas coloquiales o con erratas típicas de teclado móvil, aprovechando la robustez entrenada frente a escritura móvil.
- Búsqueda legal en Turquía: reranking sobre el corpus legislativo turco (usado en el entrenamiento) para localizar artículos relevantes a partir de preguntas en lenguaje natural, como en el conjunto arzuhal.
- Búsqueda de preguntas frecuentes (FAQ): en dominios tipo Quora turco, donde el modelo alcanza nDCG@10 de 0,9688 en consultas limpias, útil para emparejar preguntas de usuarios con respuestas existentes.
- RAG (generación aumentada por recuperación) en turco: segunda etapa de reordenamiento antes de pasar el contexto a un LLM generativo, reduciendo el ruido en los pasajes y mejorando la calidad de las respuestas.
- Despliegue en CPU o entornos sin GPU: usar el ONNX int8 con una pérdida de calidad nula en el subconjunto de benchmark (diferencia de nDCG@10 de +0,0000, IC 95% [-0,0035, +0,0035]) a costa de bajar de 3 a 2 pares por segundo en 12 núcleos.
- Moderación y deduplicación semántica de contenidos en turco: puntuar pares para detectar duplicados o similitud entre documentos y consultas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre Pusula, con primera etapa bge-m3 y reordenamiento de los 30 primeros candidatos. nDCG@10 medio sobre quora-tr, fiqa-tr, dmm y arzuhal (msmarco-tr excluido del promedio por sesgo de entrenamiento de los rerankers bge con MS MARCO).

| Grupo | Modelo | Param | Temiz | MAYUSCULAS | Sin caracteres turcos | Movil | Proteccion MAYUSCULAS | Proteccion sin caracteres turcos | Proteccion movil |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Qwen3-Reranker-4B | 4.0B | 0.785 | 0.752 | 0.751 | 0.731 | 94,1% | 94,2% | 90,9% |
| 2 | Kalbur (este modelo) | 568M | 0.774 | 0.741 | 0.753 | 0.738 | 94,3% | 96,4% | 93,7% |
| 3 | seroe/bge-reranker-v2-m3-turkish-triplet | 568M | 0.768 | 0.733 | 0.741 | 0.728 | 94,0% | 95,4% | 93,1% |
| 3 | BAAI/bge-reranker-v2-m3 | 568M | 0.767 | 0.730 | 0.739 | 0.725 | 93,9% | 95,3% | 93,0% |
| 4 | Qwen3-Reranker-0.6B | 600M | 0.742 | 0.706 | 0.707 | 0.686 | 93,5% | 93,8% | 90,4% |
| 4 | bge-m3 (sin rerank) | 568M | 0.736 | 0.679 | 0.690 | 0.666 | 89,9% | 92,0% | 87,9% |
| 5 | BAAI/bge-reranker-base | 278M | 0.656 | 0.581 | 0.587 | 0.590 | 85,9% | 87,2% | 87,7% |

Resultados por conjunto de datos (consultas limpias):

| Modelo | msmarco-tr | quora-tr | fiqa-tr | dmm | arzuhal |
|---|---|---|---|---|---|
| Qwen3-Reranker-4B | 0.905 | 0.955 | 0.430 | 0.909 | 0.844 |
| Kalbur (este modelo) | 0.926 | 0.969 | 0.402 | 0.906 | 0.822 |
| seroe/bge-reranker-v2-m3-turkish-triplet | 0.929 | 0.965 | 0.396 | 0.894 | 0.818 |
| BAAI/bge-reranker-v2-m3 | 0.930 | 0.965 | 0.396 | 0.895 | 0.811 |
| Qwen3-Reranker-0.6B | 0.872 | 0.929 | 0.355 | 0.908 | 0.778 |
| bge-m3 (sin rerank) | 0.887 | 0.958 | 0.368 | 0.896 | 0.721 |
| BAAI/bge-reranker-base | 0.766 | 0.832 | 0.270 | 0.880 | 0.643 |

Comparaciones emparejadas (20 celdas = 5 conjuntos × 4 condiciones):

| Comparacion | Significativamente superior | Sin diferencia | Significativamente inferior |
|---|---|---|---|
| Kalbur vs seroe/bge-reranker-v2-m3-turkish-triplet | 12 | 8 | 0 |
| Kalbur vs BAAI/bge-reranker-v2-m3 | 13 | 6 | 1 |
| Kalbur vs Qwen3-Reranker-4B | 6 | 9 | 5 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 568M parámetros en fp32 son aproximadamente 2,3 GB de pesos, y en fp16 alrededor de 1,1 GB, más memoria de activaciones para lotes de pares de hasta 512 tokens.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 4-8 GB de VRAM puede alojar el modelo en fp16; A100, H100 o RTX 4090 ofrecen margen amplio para lotes grandes.
- Cabe en GPU de consumo: sí, por tamaño (568M parámetros), aunque el autor no publica una lista de GPUs validadas.
- Despliegue: sentence-transformers (`CrossEncoder`), ONNX Runtime (model_quint8_avx2.onnx), Text Embeddings Inference (tag text-embeddings-inference) y endpoints de Hugging Face.
- Latencia y throughput: en CPU de 12 núcleos, el autor reporta 3 pares/s en precisión original y 2 pares/s en ONNX int8. No se publican cifras de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 medio (limpio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kalbur | 568M | 512 tokens | 0.774 | Apache 2.0 | Hugging Face, ONNX int8, demo |
| BAAI/bge-reranker-v2-m3 | 568M | no disponible en la informacion | 0.767 | no disponible en la informacion | Hugging Face |
| seroe/bge-reranker-v2-m3-turkish-triplet | 568M | no disponible en la informacion | 0.768 | no disponible en la informacion | Hugging Face |
| Qwen3-Reranker-4B | 4.0B | no disponible en la informacion | 0.785 | no disponible en la informacion | Hugging Face |
| Qwen3-Reranker-0.6B | 600M | no disponible en la informacion | 0.742 | no disponible en la informacion | Hugging Face |

Kalbur iguala o supera ligeramente a su base y al fine-tune turco de seroe con el mismo tamaño, y se queda a 0,011 del Qwen3-Reranker-4B (ocho veces mayor) en consultas limpias, superándolo en robustez ante consultas sin caracteres turcos (0,753 frente a 0,751) y en movilidad (0,738 frente a 0,731).

## Limitaciones y advertencias

- Resultados de benchmark declarados por el autor y marcados como no verificados; no han pasado revisión independiente.
- El conjunto fiqa-tr muestra un rendimiento bajo en términos absolutos (0,4016 en consultas limpias), lo que sugiere dificultad en dominios financieros o de preguntas abiertas.
- Respecto al modelo base, hay una regresión significativa en msmarco-tr con consultas limpias (-0,004).
- Sesgos: al entrenarse con Wikipedia turca y corpus legislativo turco, puede favorecer registros formales y vocabulario jurídico-enciclopédico frente a jerga coloquial o dominios especializados no cubiertos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede puntuar como relevantes pasajes plausibles pero incorrectos; no verifica hechos.
- Limitación idiomática: orientado a turco; su uso en otros idiomas no está evaluado y probablemente degrade respecto al base multilingüe.
- Límite de contexto de 512 tokens; pasajes más largos deben truncarse, con posible pérdida de información.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los conjuntos de datos empleados (Wikipedia y corpus legislativo) para cumplimiento normativo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cihatyldz/kalbur-reranker
- Demo (Space): https://huggingface.co/spaces/cihatyldz/kalbur
- Benchmark Pusula (Space): https://huggingface.co/spaces/cihatyldz/pusula
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Conjunto de datos legislativo turco: https://huggingface.co/datasets/hasankursun/turkish-legislation-corpus
- Conjunto de datos Wikipedia turca: https://huggingface.co/datasets/wikimedia/wikipedia
