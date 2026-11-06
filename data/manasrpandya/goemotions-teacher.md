# manasrpandya/goemotions-teacher

## Resumen

goemotions-teacher es un modelo de clasificación de texto multietiqueta desarrollado por manasrpandya, consistente en un RoBERTa-large afinado sobre el conjunto de datos GoEmotions de Google Research. Su función es detectar emociones en texto en inglés, asignando de forma simultánea una o varias etiquetas emocionales a cada fragmento, en lugar de forzar una única categoría excluyente.

El modelo se entrenó con pérdida de entropía cruzada binaria (BCE) durante 4 épocas, con decaimiento de learning rate por capas de 0,95 y precisión fp16 en una GPU T4 de Colab. Su propósito declarado es servir como uno de los dos profesores en un proceso de destilación hacia el modelo goemotions-distil-onnx, más ligero y orientado a despliegue en producción.

Con 355 millones de parámetros y un repositorio de 1,4 GB, es un modelo de tamaño medio-alto pensado para investigación y para servir de referencia (teacher) en pipelines de destilación, no como un clasificador de producción de baja latencia. Su relevancia actual radica en que documenta de forma transparente el proceso de ajuste fino y los umbrales por etiqueta necesarios para una clasificación multietiqueta correcta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (transformer encoder) |
| Parámetros totales | 355.388.444 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de RoBERTa-large, un transformer encoder con arquitectura BERT-like optimizada por Facebook AI, y se afina como clasificador multietiqueta sobre GoEmotions. La cabeza de clasificación se entrena con entropía cruzada binaria (BCE), lo que permite que cada etiqueta se active de forma independiente mediante sigmoide en lugar de softmax. El entrenamiento se realizó durante 4 épocas con decaimiento de learning rate por capas de 0,95 y precisión fp16 en una GPU T4 de Google Colab.

El autor documenta que la inferencia debe aplicarse con `sigmoid(logits / 1.019)` y con umbrales por etiqueta ajustados sobre el conjunto de validación, disponibles en el archivo `results/metrics.json` del repositorio. Este detalle es relevante: sin la calibración de temperatura y los umbrales por etiqueta, el rendimiento del modelo se degrada respecto a las métricas publicadas. No se especifica el número de tokens de entrenamiento ni la composición completa del dataset más allá de su origen en GoEmotions.

## Capacidades

- Clasificación de texto multietiqueta: asigna una o varias emociones simultáneamente a un fragmento de texto en inglés.
- Detección de emociones según el esquema de GoEmotions (etiquetas finas) y agregación al esquema de Ekman (macro-F1 reportado sobre esta agrupación).
- Procesamiento de texto corto a medio, típico de comentarios y mensajes en redes sociales.
- Salida de logits por etiqueta, calibrable mediante temperatura y umbrales por etiqueta.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Moderación de comunidades en línea: clasificar comentarios de foros o redes sociales en categorías emocionales (enfado, alegría, tristeza, etc.) para priorizar revisiones humanas; el modelo está entrenado específicamente sobre datos de Reddit (GoEmotions).
- Análisis de sentimiento granular en atención al cliente: detectar emociones concretas en tickets y reseñas para enrutarlos al equipo adecuado o activar protocolos de escalado.
- Investigación en psicología computacional: servir como modelo de referencia (teacher) para estudiar la distribución de emociones en corpus textuales o para generar etiquetas pseudoanotadas.
- Destilación de modelos: actuar como profesor en pipelines de compresión hacia modelos más pequeños, tal como se usó para goemotions-distil-onnx.
- Monitorización de reputación de marca: procesar grandes volúmenes de menciones sociales y agregar la distribución emocional por periodo y por producto.
- Anotación asistida de datasets: preetiquetar corpus emocionales que luego se revisan manualmente, reduciendo el coste de anotación.
- Análisis de feedback de producto: extraer la carga emocional de encuestas abiertas y reseñas para complementar métricas cuantitativas.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| Macro-F1 (test) | 0,542 (IC 95 %: 0,521–0,557) |
| Micro-F1 (test) | 0,616 |
| Macro-F1 esquema Ekman (test) | 0,653 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB solo para pesos (355 M de parámetros), más overhead de activaciones y del tokenizador; en la práctica, entre 1,5 y 2,5 GB según el tamaño de lote y la longitud de secuencia.
- En fp32, los pesos ocupan aproximadamente 1,4 GB, lo que eleva el requisito total a unos 2,5–3,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños; T4, RTX 3060, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers con PyTorch, ONNX Runtime (el autor publica una variante destilada ONNX), y exportación a otros runtimes; no se documenta soporte específico para vLLM, llama.cpp ni Ollama (no es un modelo generativo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goemotions-teacher | 355 M | no disponible | Clasificación multietiqueta de emociones | MIT | Hugging Face |
| goemotions-distil-onnx | no disponible | no disponible | Clasificación multietiqueta de emociones (destilado del anterior) | no disponible | Hugging Face |
| RoBERTa-large base | 355 M | 512 tokens | Modelo base sin ajuste emocional | MIT | Hugging Face |

La comparación con otros clasificadores de emociones de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no se garantiza un rendimiento aceptable en otros idiomas.
- El rendimiento depende críticamente de aplicar la temperatura 1,019 y los umbrales por etiqueta del archivo `results/metrics.json`; sin esta calibración, las métricas caen.
- Macro-F1 de 0,542 en test indica un rendimiento moderado; las etiquetas poco frecuentes probablemente tienen un F1 bajo.
- Riesgo de sesgo: el corpus GoEmotions proviene de Reddit y puede reflejar sesgos demográficos, culturales y de estilo de esa plataforma.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la clasificación.
- No es un modelo generativo: no puede explicar sus decisiones ni generar texto.
- Uso comercial permitido por la licencia MIT, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los datos de entrenamiento.
- El modelo está pensado como teacher para destilación; su despliegue directo en producción de baja latencia no es su objetivo declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manasrpandya/goemotions-teacher
- Modelo destilado: https://huggingface.co/manasrpandya/goemotions-distil-onnx
- Código y memoria del proyecto: https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/06-emotion-classification
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
