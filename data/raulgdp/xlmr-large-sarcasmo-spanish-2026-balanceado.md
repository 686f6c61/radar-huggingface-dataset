# raulgdp/xlmr-large-sarcasmo-spanish-2026-balanceado

## Resumen

`xlmr-large-sarcasmo-spanish-2026-balanceado` es un modelo de clasificación de texto en castellano obtenido mediante fine-tuning de `FacebookAI/xlm-roberta-large` (559.892.482 parámetros) por el usuario raulgdp. Su tarea específica es la detección de sarcasmo en textos en español, y su nombre indica que se ha entrenado sobre un conjunto de datos balanceado. Es un modelo de cabecera de clasificación (sequence classification), no un modelo generativo: recibe un texto y devuelve una etiqueta.

La relevancia práctica del modelo es acotada pero clara: la detección de sarcasmo es una subtarea difícil del análisis de sentimiento, y contar con un encoder multilingüe grande ajustado específicamente para castellano permite integrarlo en pipelines de moderación, análisis de opinión o investigación lingüística sin necesidad de un LLM generativo. El autor reporta una accuracy de 0,9066 y un F1 macro de 0,9065 en el conjunto de evaluación, aunque la model card no documenta la composición del dataset ni el número de clases.

El modelo se publicó el 13 de noviembre de 2026, no tiene descargas ni likes, y su model card es la generada automáticamente por el `Trainer` de Hugging Face, con secciones "More information needed" sin completar. Todo lo que se sabe del entrenamiento proviene de los hiperparámetros y de la tabla de resultados que el `Trainer` volcó automáticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabecera de clasificación de secuencias |
| Parametros totales | 559.892.482 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de XLM-RoBERTa; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | Español (por el nombre y el propósito); el modelo base es multilingüe (100 idiomas), pero el fine-tuning es específico para castellano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `FacebookAI/xlm-roberta-large`, un encoder Transformer de 24 capas y 559,9 M de parámetros, preentrenado de forma multilingüe con objetivos de masked language modeling. Sobre ese backbone se añade una cabeza de clasificación (pooler + capa lineal) para producir logits de clasificación binaria o multiclase; la model card no especifica el número de etiquetas ni su nomenclatura.

Los hiperparámetros documentados son: learning rate 1e-5, batch size de entrenamiento 32 con acumulación de gradientes de 4 pasos (batch efectivo 128), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 4 épocas, precisión mixta nativa AMP y semilla 42. El entrenamiento se ejecutó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La pérdida de entrenamiento bajó de 2,0453 a 0,8523 y la de validación de 0,3823 a 0,2414. No se documenta el número de tokens, la composición del dataset, si hubo aumento de datos ni ninguna innovación técnica adicional (no hay decodificación especulativa ni atención lineal, al ser un encoder estándar).

## Capacidades

- Clasificación de texto: emite una etiqueta (presumiblemente sarcasmo / no sarcasmo) con sus logits asociados.
- Detección de sarcasmo en castellano: propósito principal del fine-tuning.
- Análisis de sentimiento auxiliar: al derivar de un encoder entrenado para comprensión semántica, puede emplearse como extractor de representaciones para tareas afines.
- Extracción de embeddings: el pooler de XLM-RoBERTa permite obtener vectores de frase de 1.024 dimensiones para búsqueda semántica o clustering.
- Multilingüismo residual: el backbone soporta 100 idiomas, pero el fine-tuning está orientado a español y el rendimiento fuera de ese idioma no está validado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo de clasificación, no generativo.
- No dispone de modo "thinking" ni de generación de texto libre.

## Casos de uso

- Moderación de comentarios en foros y redes: clasificar mensajes con tono sarcástico que puedan interpretarse como hostiles o ambiguos, con un umbral de confianza ajustable sobre los logits del clasificador.
- Análisis de opinión en reseñas de producto: separar reseñas genuinas de reseñas sarcásticas (por ejemplo, "menudo descubrimiento, se rompió a los dos días") antes de agregar puntuaciones de sentimiento.
- Investigación lingüística y sociolingüística: etiquetar corpus de castellano peninsular y latinoamericano para estudiar la distribución del sarcasmo por registro, región o plataforma.
- Enriquecimiento de datasets de entrenamiento: usar el modelo como anotador débil para preetiquetar grandes volúmenes de texto, con revisión humana posterior, dado su F1 macro de 0,9065 reportado.
- Filtrado en pipelines de atención al cliente: detectar respuestas de clientes con sarcasmo para derivarlas a agentes humanos en lugar de a respuestas automáticas.
- Detección de ironía en titulares de prensa: preprocesar titulares antes de alimentar sistemas de resumen o de análisis de tendencias.
- Señal auxiliar en sistemas de recomendación: ponderar reseñas sarcásticas de forma distinta a las literales para evitar sesgos en las puntuaciones agregadas.

## Benchmarks y rendimiento

El model-index oficial no contiene resultados (`results: []`). Los únicos datos disponibles son los de la tabla de entrenamiento de la model card, declarados por el autor sobre un conjunto de evaluación no descrito:

| Metrica | Valor (epoca 4, evaluacion final) |
|---|---|
| Loss | 0,2414 |
| Accuracy | 0,9066 |
| F1 weighted | 0,9065 |
| F1 macro | 0,9065 |
| Precision weighted | 0,9088 |
| Recall weighted | 0,9066 |

Evolución por época (validation loss / accuracy / F1 macro): época 1: 0,3823 / 0,8356 / 0,8346; época 2: 0,2700 / 0,8876 / 0,8872; época 3: 0,2837 / 0,8873 / 0,8866; época 4: 0,2414 / 0,9066 / 0,9065.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 2,2 GB solo para pesos (559,9 M × 4 bytes), más activaciones; en la práctica, unos 3-4 GB para batch pequeño.
- VRAM en fp16/bf16: aproximadamente 1,1 GB para pesos; unos 2-3 GB con activaciones para batch de 16-32.
- VRAM en int8: aproximadamente 0,6 GB; en int4, unos 0,3 GB (cuantización no documentada por el autor, requiere herramientas externas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son válidas. Cabe en GPUs de consumo y también en CPU para inferencia por lotes pequeños.
- Despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el tag `text-embeddings-inference` está presente), endpoints compatibles de Hugging Face, ONNX Runtime y TorchServe. No se documenta soporte de vLLM ni llama.cpp (no aplica a un encoder de clasificación).
- Throughput y latencia: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raulgdp/xlmr-large-sarcasmo-spanish-2026-balanceado | 559,9 M | 512 (estándar XLM-R) | Clasificación de sarcasmo en español | MIT | Hugging Face, 0 descargas |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 | Encoder multilingüe base (MLM) | MIT | Hugging Face, ampliamente usado |
| roberta-large-bne (BSC) | ~355 M | 512 | Encoder en español (RoBERTa) | Apache 2.0 (según versión) | Hugging Face |
| bert-base-spanish-wwm-cased (BSC) | ~110 M | 512 | Encoder en español (BERT) | Apache 2.0 | Hugging Face |

No se dispone de comparaciones de rendimiento con otros detectores de sarcasmo en español dentro de la información proporcionada. La comparativa se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el número de clases, el equilibrio real de etiquetas ni el proceso de anotación; el término "balanceado" del nombre no está verificado.
- El conjunto de evaluación no está descrito, por lo que la accuracy de 0,9066 no es reproducible ni comparable con otros trabajos.
- Riesgo de sobreajuste al dominio y registro del corpus de entrenamiento; el rendimiento en jerga, dialectos o texto informal no validado puede degradarse.
- El sarcasmo es culturalmente dependiente: un modelo entrenado con una variedad concreta de castellano puede fallar en otras (por ejemplo, rioplatense frente a peninsular).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; sin calibración de umbrales, el uso en producción es arriesgado.
- Licencia MIT permite uso comercial, pero al derivar de XLM-RoBERTa conviene revisar las condiciones del modelo base y de los datos de preentrenamiento (CommonCrawl multilingüe).
- No hay información sobre sesgos demográficos, de género o políticos; no se han realizado evaluaciones de equidad.
- El repositorio ocupa 9,0 GB, lo que sugiere la presencia de checkpoints intermedios además de los pesos finales; conviene descargar solo los archivos necesarios.
- El modelo tiene 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raulgdp/xlmr-large-sarcasmo-spanish-2026-balanceado
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
