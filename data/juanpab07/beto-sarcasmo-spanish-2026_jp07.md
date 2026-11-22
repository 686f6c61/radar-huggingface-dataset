# Juanpab07/beto-sarcasmo-spanish-2026_JP07

## Resumen

`beto-sarcasmo-spanish-2026_JP07` es un modelo de clasificación de texto en castellano obtenido mediante fine-tuning del checkpoint `dccuchile/bert-base-spanish-wwm-cased` (BETO), el BERT base entrenado con whole word masking sobre un corpus en castellano. Lo publica el usuario Juanpab07 en Hugging Face y su tarea declarada es la detección de sarcasmo en textos en castellano, un problema de clasificación binaria o multiclase que resulta relevante para sistemas de análisis de opinión, moderación de comunidades y evaluación de la calidad de reseñas.

El modelo mantiene la arquitectura BERT base intacta (encoder transformer de 12 capas, 768 dimensiones ocultas, 110 millones de parámetros, aproximadamente 109,85 millones según los pesos en safetensors) y solo se han reentrenado los pesos para la tarea de clasificación. El autor reporta en la model card unas métricas de evaluación de 0,9233 de accuracy, 0,9241 de precisión, 0,9233 de recall y 0,9226 de F1, con una pérdida de validación de 0,6317.

La relevancia del modelo es acotada: se trata de un fine-tune pequeño, sin model card completa (el autor deja varios apartados como "More information needed"), sin licencia declarada y sin información sobre el dataset de entrenamiento. Aun así, las métricas reportadas son altas y el modelo está etiquetado como compatible con Text Embeddings Inference y endpoints de Hugging Face, lo que facilita su despliegue como servicio de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 109.852.418 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BETO usa 512 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | castellano (por el modelo base BETO); no declarado explicitamente en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `dccuchile/bert-base-spanish-wwm-cased`, un BERT base con whole word masking entrenado sobre un corpus en castellano. La arquitectura es un encoder transformer bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, sobre el que se añade una cabeza de clasificación para la tarea de detección de sarcasmo. No se trata de un modelo generativo ni de un modelo MoE: es un clasificador discriminativo.

El entrenamiento se realizó con el `Trainer` de Hugging Face y los hiperparámetros declarados son: learning rate 2e-05, batch size de entrenamiento y evaluación de 64, seed 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 100 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). La model card muestra resultados de validación en las épocas 1 a 4 (pasos 239, 478, 717 y 956), con accuracy entre 0,9178 y 0,9243 y F1 entre 0,9178 y 0,9239; no se detallan las épocas 5 a 10. El dataset de entrenamiento no se especifica (la model card indica "None dataset" y "More information needed"). Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto en castellano orientada a la detección de sarcasmo.
- Salida de etiquetas de clasificación con puntuaciones de confianza (comportamiento estándar de `BertForSequenceClassification`).
- Inferencia por lotes mediante la pipeline `text-classification` de Transformers.
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints de Hugging Face, según las etiquetas del repositorio.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No soporta visión, audio ni modalidades distintas del texto.
- Capacidades multilingües: no declaradas; el modelo base está entrenado en castellano y la model card no especifica otros idiomas.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Moderación de comunidades en castellano: el clasificador puede etiquetar comentarios con sarcasmo para priorizar la revisión humana o para ajustar la respuesta automática en foros y redes sociales, aprovechando su alta accuracy reportada (0,9233).
- Análisis de opinión en reseñas de producto: integrar el modelo en un pipeline que separe reseñas literales de reseñas sarcásticas antes de aplicar un análisis de sentimiento, evitando que el sarcasmo invierta la polaridad detectada.
- Monitorización de reputación de marca: clasificar menciones en redes sociales y foros para detectar ironía hacia la marca y enrutar esos casos a un equipo de comunicación en lugar de al análisis automático de sentimiento.
- Filtrado de datos para entrenamiento de otros modelos: usar el clasificador para depurar corpus de texto en castellano eliminando o etiquetando ejemplos sarcásticos que podrían introducir ruido en tareas de generación o de análisis de sentimiento.
- Investigación en lingüística computacional: servir como línea base reproducible para experimentos sobre detección de ironía y sarcasmo en castellano, dado que el checkpoint y los hiperparámetros están publicados.
- Detección de sarcasmo en atención al cliente: preprocesar transcripciones de chats o correos para marcar mensajes irónicos y ajustar la prioridad o el tono de la respuesta automática.
- Clasificación por lotes en backend: desplegar el modelo con Text Embeddings Inference o con los endpoints de Hugging Face para procesar grandes volúmenes de textos en castellano con un coste computacional bajo (110 millones de parámetros).

## Benchmarks y rendimiento

El model-index oficial del repositorio no contiene resultados (`results: []`). Los únicos datos disponibles son las métricas de evaluación declaradas por el autor en la model card:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,6317 |
| Accuracy | 0,9233 |
| Precision | 0,9241 |
| Recall | 0,9233 |
| F1 | 0,9226 |

Evolución durante el entrenamiento según la model card:

| Epoca | Paso | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1.0 | 239 | 0,5861 | 0,9178 | 0,9178 | 0,9178 | 0,9178 |
| 2.0 | 478 | 0,5523 | 0,9243 | 0,9245 | 0,9243 | 0,9239 |
| 3.0 | 717 | 0,6350 | 0,9196 | 0,9201 | 0,9196 | 0,9198 |
| 4.0 | 956 | 0,6317 | 0,9233 | 0,9241 | 0,9233 | 0,9226 |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni se especifica el conjunto de evaluación utilizado, por lo que las métricas no son directamente comparables con las de otros clasificadores de sarcasmo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para los pesos (109,85 millones de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar el modelo con holgura. Para clasificación por lotes de alto throughput, una A100 o H100 con TEI es la opción más eficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 3050 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `text-classification` de Transformers, Text Embeddings Inference (TEI), endpoints de Hugging Face (el repositorio está etiquetado como `endpoints_compatible`), ONNX Runtime y TorchScript. No se dispone de pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones directas sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (miles de textos por segundo en una A100 con lotes grandes), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beto-sarcasmo-spanish-2026_JP07 | 109,85 M | no disponible | Clasificacion de sarcasmo en castellano | no disponible | Hugging Face, TEI, endpoints |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | 110 M | 512 tokens (modelo base) | Modelo base en castellano (MLM) | no disponible en esta ficha | Hugging Face |
| BETO fine-tunes de analisis de sentimiento en castellano | ~110 M | 512 tokens | Clasificacion de sentimiento | variable segun autor | Hugging Face |
| Modelos multilingues tipo XLM-R base | ~278 M | 512 tokens | Clasificacion y generacion | MIT (XLM-R) | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto y disponibilidad; el rendimiento relativo en detección de sarcasmo no está documentado.

## Limitaciones y advertencias

- La model card está incompleta: los apartados de descripción, usos previstos, limitaciones y datos de entrenamiento indican "More information needed", por lo que se desconoce la composición y el dominio del dataset.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- No se documentan sesgos conocidos ni el idioma exacto de los datos de entrenamiento; el modelo base es de castellano, pero el fine-tune podría estar sesgado hacia un registro o dominio concreto no declarado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación; las métricas reportadas (F1 0,9226) provienen de un conjunto de evaluación no descrito, por lo que podrían no generalizar.
- El entrenamiento muestra una pérdida de validación que sube tras la época 2 (de 0,5523 a 0,6350 en la época 3), lo que sugiere sobreajuste; el checkpoint final no es necesariamente el mejor en validación.
- El modelo no es generativo: no puede producir explicaciones, resúmenes ni texto; solo devuelve etiquetas y puntuaciones.
- No se declaran capacidades multilingües; su uso fuera del castellano no está respaldado por la documentación.
- El repositorio ocupa 29,4 GB, un tamaño desproporcionado para un modelo de 110 millones de parámetros, lo que puede indicar la presencia de checkpoints intermedios u otros artefactos; conviene revisar los archivos antes de descargarlo completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Juanpab07/beto-sarcasmo-spanish-2026_JP07
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Documentación de la pipeline de clasificación de texto: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos tratan sobre viajes a Hanói y no guardan relación con esta ficha.
