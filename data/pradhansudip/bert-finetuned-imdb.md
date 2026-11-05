# pradhansudip/bert-finetuned-imdb

## Resumen

`bert-finetuned-imdb` es un modelo de clasificación de texto obtenido mediante fine-tuning del checkpoint `google-bert/bert-base-uncased` sobre un conjunto de datos no especificado en la model card (el nombre sugiere IMDb, pero el autor no lo confirma). Lo publica el usuario `pradhansudip` en HuggingFace y se generó automáticamente con la librería `Trainer` de Transformers, sin documentación adicional sobre datos, intención de uso ni limitaciones.

Se trata de un BERT base estándar (12 capas, 768 dimensiones ocultas, 110 millones de parámetros) con una cabeza de clasificación de secuencias. El entrenamiento consistió en una única época con learning rate 2e-5, batch size 8 y optimizador AdamW, según los hiperparámetros declarados en la model card. No se especifica el número de etiquetas ni la tarea exacta.

Su relevancia es limitada: cero descargas, cero likes, sin benchmarks publicados (el `model-index` está vacío) y con una model card autogenerada que no ha sido revisada. Debe considerarse un experimento personal más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), 12 capas, 768 dimensiones ocultas, 12 cabezas de atención |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | No disponible (el modelo base es mayoritariamente inglés; el fine-tuning no especifica idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura BERT base: transformer encoder bidireccional con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros, más una cabeza de clasificación sobre el token `[CLS]`. El vocabulario es el de `bert-base-uncased` (WordPiece, 30.522 tokens), con tokenización en minúsculas.

El fine-tuning se realizó durante 1 época con learning rate 2e-5, batch size 8 (entrenamiento y evaluación), semilla 42, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8) y scheduler lineal. El autor no documenta el dataset, el número de ejemplos, el número de etiquetas ni si hubo validación. La pérdida de evaluación declarada es 0.0010, un valor sospechosamente bajo para una única época que sugiere posible sobreajuste o fuga de datos entre entrenamiento y evaluación. No se menciona RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto: asigna una etiqueta (o distribución de etiquetas) a una secuencia de entrada, presumiblemente de análisis de sentimiento según el nombre del modelo, aunque no confirmado.
- Comprensión de lenguaje natural en inglés (heredada del modelo base `bert-base-uncased`).
- Extracción de representaciones contextuales del token `[CLS]` y de tokens individuales, reutilizables para otras tareas.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Clasificación de reseñas de películas: si el dataset de fine-tuning es efectivamente IMDb, el modelo podría clasificar reseñas como positivas o negativas, aunque la falta de documentación impide confirmar el etiquetado.
- Prototipado rápido de pipelines de clasificación: sirve como punto de partida para experimentar con la API `pipeline("text-classification")` de Transformers antes de entrenar un modelo propio.
- Baseline en experimentos académicos: útil como referencia de comparación para fine-tunings propios sobre BERT base, dado su bajo coste computacional.
- Filtrado de contenido en inglés: podría adaptarse para clasificar textos cortos en tareas binarias, siempre que se valide previamente con datos propios.
- Extracción de embeddings para clustering: usando las representaciones del encoder sin la cabeza de clasificación, para agrupar documentos en inglés.
- Docencia y demostraciones: ejemplo mínimo de fine-tuning con `Trainer` para ilustrar el flujo completo de entrenamiento y publicación en HuggingFace.

## Benchmarks y rendimiento

El `model-index` del autor está vacío (`"results": []`). No se han publicado resultados de benchmarks en la información disponible. El único dato declarado es una pérdida de evaluación de 0.0010, que no es comparable con métricas estándar como accuracy o F1 y no se acompaña de la composición del conjunto de evaluación.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 0,45 GB (110 M parámetros × 4 bytes), más overhead de activaciones.
- VRAM en FP16: aproximadamente 0,22 GB; en INT8, unos 0,11 GB.
- Cabe holgadamente en cualquier GPU consumer: GTX 1060 6 GB, RTX 3060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para entrenamiento: RTX 3090/4090 o A100 si se reentrena con lotes grandes; para inferencia, cualquier GPU con más de 2 GB basta.
- Opciones de despliegue: `transformers` (PyTorch), `optimum` para exportación a ONNX, `text-embeddings-inference` no aplica (no es modelo de embeddings puros), `vLLM` no soporta BERT de clasificación de forma nativa, `llama.cpp` no aplica (no hay GGUF publicado).
- Latencia y throughput: no disponibles; para BERT base en una RTX 4090 se pueden esperar varios miles de secuencias por segundo con batch grande, pero no hay medición oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pradhansudip/bert-finetuned-imdb` | 109,5 M | 512 | Clasificación de texto | Apache 2.0 | HuggingFace, 0 descargas |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | Análisis de sentimiento | Apache 2.0 | HuggingFace, ampliamente usado |
| `textattack/bert-base-uncased-imdb` | 109,5 M | 512 | Clasificación IMDb | Apache 2.0 | HuggingFace, con métricas publicadas |
| `roberta-base` | 125 M | 512 | Modelo base (fine-tuning) | MIT | HuggingFace, muy usado |

Frente a `distilbert-base-uncased-finetuned-sst-2-english`, este modelo es casi el doble de grande y no ofrece métricas publicadas. Frente a `textattack/bert-base-uncased-imdb`, que sí documenta accuracy en IMDb, carece de evaluación verificable. `roberta-base` ofrece mejor rendimiento general como base, aunque requiere fine-tuning.

## Limitaciones y advertencias

- Model card autogenerada y sin revisar: no hay información sobre el dataset, las etiquetas ni la intención de uso.
- Pérdida de evaluación de 0.0010 en una sola época: posible sobreajuste o fuga de datos; no debe interpretarse como rendimiento real.
- Sin benchmarks ni métricas estándar (accuracy, F1, precision, recall): imposible evaluar su calidad de forma objetiva.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Idiomas: el modelo base es mayoritariamente inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Riesgo de sesgos heredados de `bert-base-uncased` (datos de BookCorpus y Wikipedia en inglés, con sesgos de género, etnia y otros).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de fine-tuning impide verificar la procedencia de los datos y posibles restricciones adicionales.
- No apto para producción sin una evaluación previa sobre datos propios y sin conocer el etiquetado real.

## Enlaces

- HuggingFace: https://huggingface.co/pradhansudip/bert-finetuned-imdb
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Documentación de Transformers (clasificación de texto): https://huggingface.co/docs/transformers/tasks/sequence_classification
