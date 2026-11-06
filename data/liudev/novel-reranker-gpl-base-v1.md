# liudev/novel-reranker-gpl-base-v1

## Resumen

novel-reranker-gpl-base-v1 es un cross-encoder de reordenación (reranker) desarrollado por el usuario liudev y publicado en Hugging Face. Se trata de un fine-tuning del modelo base hfl/chinese-roberta-wwm-ext, un transformer BERT en chino, adaptado específicamente para la tarea de text-ranking: asignar una puntuación de relevancia a pares (consulta, documento) con el objetivo de reordenar resultados de búsqueda semántica.

El modelo resuelve el problema del reranking en pipelines de recuperación de información, particularmente en el dominio de novelas web chinas, a juzgar por los ejemplos de la model card. Con 102.268.417 parámetros y una longitud máxima de secuencia de 512 tokens, se posiciona como una alternativa ligera y especializada frente a rerankers multilingües de mayor tamaño.

Es relevante para desarrolladores que construyen sistemas de búsqueda o recomendación sobre corpus de ficción en chino y necesitan una segunda etapa de reordenación tras una recuperación inicial por embeddings. El modelo se entrenó con 435.262 muestras y emplea la función de pérdida MarginMSELoss, una elección habitual en el entrenamiento de rerankers con pares positivos y negativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT (BertForSequenceClassification), cross-encoder |
| Parámetros totales | 102.268.417 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no verificada) |
| Idiomas soportados | no disponibles (modelo base en chino: hfl/chinese-roberta-wwm-ext) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Etiquetas de salida | 1 (puntuación de relevancia) |
| Tamaño del repositorio | 1,2 GB |
| Librería | sentence-transformers |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en BERT: recibe como entrada el par concatenado (consulta, documento) y produce un único logit de relevancia mediante una cabeza de clasificación de secuencia (BertForSequenceClassification). A diferencia de los bi-encoders, que codifican consulta y documento por separado, el cross-encoder procesa ambos textos conjuntamente, lo que permite capturar interacciones token a token a costa de un mayor coste computacional en inferencia.

El entrenamiento se realizó con la librería sentence-transformers sobre un conjunto de 435.262 muestras con columnas query, positive, negative y label. Las consultas tienen una media de 16,4 tokens (rango 10-24), mientras que los documentos positivos y negativos rondan los 72-73 tokens de media (rango 15-102). La función de pérdida empleada es MarginMSELoss, que entrena al modelo para que la puntuación del par positivo supere a la del negativo por un margen. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a rerankers).

## Capacidades

- Puntuación de relevancia para pares (consulta, documento) mediante regresión de un único score.
- Reordenación de listas de documentos candidatos devueltos por un recuperador previo (reranking en dos etapas).
- Búsqueda semántica sobre corpus textuales, especialmente novelas web en chino según los ejemplos de la model card.
- Integración con la API `CrossEncoder.predict` y `CrossEncoder.rank` de sentence-transformers.
- Compatible con text-embeddings-inference y endpoints de Hugging Face según las etiquetas del repositorio.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido: es un modelo discriminativo de ranking, no generativo.
- Capacidad multilingüe no documentada; el modelo base está entrenado principalmente en chino.

## Casos de uso

- Reordenación en motores de búsqueda de novelas web: tras una recuperación inicial por embeddings o BM25, el modelo puntúa cada par (consulta del lector, sinopsis o fragmento) y reordena los resultados por relevancia temática, mejorando la precisión del top-k.
- Sistemas de recomendación de ficción: dada una descripción de trama o preferencia del usuario, el modelo puntúa sinopsis candidatas y ordena las más afines, aprovechando su entrenamiento específico sobre tramas de novelas.
- Búsqueda semántica en bases de datos documentales en chino: indexación con un bi-encoder ligero y segunda etapa de reranking con este cross-encoder para reducir falsos positivos en el top-10.
- Moderación o clasificación de similitud temática: puntuar pares de textos para detectar duplicados argumentales o tramas muy similares en un catálogo editorial.
- Filtrado de candidatos en pipelines RAG sobre corpus de ficción: reordenar los fragmentos recuperados antes de pasarlos a un modelo generativo, reduciendo el ruido en el contexto.
- Evaluación automática de resúmenes o sinopsis: medir la relevancia entre una sinopsis generada y el texto de referencia mediante la puntuación del cross-encoder.
- Construcción de datasets de entrenamiento: usar las puntuaciones para minar pares positivos y negativos de alta calidad en corpus no etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB para los pesos (102 M de parámetros); en fp16 alrededor de 0,2 GB. El consumo real depende del tamaño de lote y de la longitud de secuencia.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes con baja latencia.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Text Embeddings Inference (TEI), endpoints de Hugging Face; también es posible exportarlo a ONNX para inferencia optimizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un cross-encoder de 102 M de parámetros con secuencias de hasta 512 tokens, el coste por par es bajo, pero el throughput depende linealmente del número de pares a puntuar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma base | Licencia | Formato |
|---|---|---|---|---|---|
| liudev/novel-reranker-gpl-base-v1 | 102,3 M | 512 tokens | Chino (base) | no disponible | safetensors |
| BAAI/bge-reranker-base | no disponible en la información | no disponible | Multilingüe | no disponible | no disponible |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | no disponible en la información | 512 tokens | Inglés | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de desplegarlo en producción.
- El modelo base es chino (hfl/chinese-roberta-wwm-ext), por lo que su rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Longitud máxima de 512 tokens: los documentos más largos deben truncarse o dividirse, lo que puede degradar la puntuación en pasajes extensos.
- Entrenado sobre un dataset no identificado de temática aparentemente novelesca; puede generalizar mal a otros dominios (textos técnicos, jurídicos, científicos).
- Riesgo de sesgo heredado del corpus de entrenamiento y del modelo base, no evaluado en la model card.
- Al ser un modelo discriminativo, no genera texto; no debe usarse como generador ni como chatbot.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni evaluaciones independientes publicadas.
- No se documentan procesos de mitigación de sesgos ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liudev/novel-reranker-gpl-base-v1
- Modelo base: https://huggingface.co/hfl/chinese-roberta-wwm-ext
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Paper de referencia (MarginMSE): https://arxiv.org/abs/2010.02666
