# sergeyzh/rubert-tiny-sentiment

## Resumen

sergeyzh/rubert-tiny-sentiment es un modelo de clasificación de sentimiento en ruso, desarrollado por sergeyzh, que clasifica reseñas en tres clases: negativa (0), neutral (1) y positiva (2). Se trata de un BERT en miniatura (tiny) con 29,2 millones de parámetros, obtenido mediante destilación de etiquetas blandas (soft labels) a partir del modelo teacher sergeyzh/rubert-large-uncased-sentiment. Su tamaño reducido lo hace adecuado para entornos con recursos limitados, como CPU o GPUs de baja capacidad, manteniendo un rendimiento competitivo frente a modelos base más grandes.

El modelo se basa en la arquitectura BERT con 3 capas, tamaño oculto de 312 y una longitud de contexto de 512 tokens. Está entrenado con 105.500 reseñas en ruso procedentes de los datasets Kinopoisk, RuReviews y Georeview, y alcanza una F1 media de 0,7113 en los conjuntos de prueba, superando a varios modelos base de referencia. Su licencia MIT permite uso comercial sin restricciones, y su formato safetensors facilita su integración en pipelines de Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 29.194.707 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT en miniatura con 3 capas de encoder, tamaño oculto de 312 y 12 cabezas de atención (según configuración típica de BERT-tiny). Se trata de un modelo denso, sin mezcla de expertos. La clasificación se realiza mediante una cabeza de clasificación de secuencias sobre la representación del token [CLS].

El entrenamiento se realizó mediante destilación de etiquetas blandas (soft-label distillation) desde el teacher sergeyzh/rubert-large-uncased-sentiment, con un coeficiente α = 0,5. Los datos de entrenamiento consisten en 105.500 reseñas en ruso (94.950 para entrenamiento y 10.550 para validación) provenientes de los datasets Kinopoisk, RuReviews y Georeview. Se entrenó durante 3 épocas con batch size de 32 (con acumulación de gradientes de 2), tasa de aprendizaje de 5e-5, warmup de 0,1, weight decay de 0,01 y longitud máxima de secuencia de 256 tokens. La selección del mejor modelo se realizó por F1 de validación, obteniendo la mejor época en la segunda con una F1 de 0,7552.

## Capacidades

- Clasificación de sentimiento en ruso en tres clases: negativa, neutral y positiva.
- Integración directa con el pipeline `text-classification` de Hugging Face Transformers.
- Devolución de probabilidades para todas las clases mediante softmax sobre los logits.
- Adecuado para inferencia en CPU y entornos con memoria limitada gracias a su tamaño reducido.
- Compatible con la librería Transformers y con Text Embeddings Inference (TEI) para despliegue en endpoints.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo para clasificación.

## Casos de uso

- Análisis de opiniones de productos en plataformas de comercio electrónico: el modelo puede clasificar reseñas de usuarios en ruso para identificar automáticamente comentarios positivos, negativos o neutrales, permitiendo priorizar respuestas de atención al cliente o detectar problemas recurrentes.
- Monitorización de reputación de marca en redes sociales: al procesar publicaciones o comentarios en ruso, se puede obtener una métrica agregada de sentimiento hacia una marca o producto en tiempo real.
- Moderación de contenido en foros o comunidades: clasificar mensajes de usuarios para detectar tono negativo o conflictivo y activar flujos de moderación.
- Análisis de reseñas de películas o series: dado que parte del entrenamiento proviene de Kinopoisk, el modelo es especialmente útil para clasificar críticas cinematográficas en ruso.
- Evaluación de satisfacción de clientes en encuestas abiertas: las respuestas de texto libre pueden clasificarse automáticamente para segmentar la satisfacción sin necesidad de etiquetado manual.
- Sistemas de recomendación basados en sentimiento: integrar la clasificación de reseñas como señal para ajustar recomendaciones de productos o contenidos según la polaridad de las opiniones.

## Benchmarks y rendimiento

El autor proporciona resultados en tres conjuntos de prueba: Kinopoisk (1.500 muestras), RuReviews (15.000) y Georeview (5.000, con rating de 5 estrellas reducido a 3 clases). La evaluación se realiza con argmax sobre logits y longitud máxima de 512 tokens. La siguiente tabla muestra la comparativa con otros modelos de sentimiento en ruso:

| Modelo | Kinopoisk Acc/F1 | RuReviews Acc/F1 | Georeview Acc/F1 | Avg F1 |
| :--- | :--- | :---: | :---: | :---: |
| sergeyzh/rubert-large-uncased-sentiment | **0.7013** / **0.6929** | 0.7851 / 0.7866 | **0.7858** / **0.7361** | **0.7385** |
| **sergeyzh/rubert-tiny-sentiment** | 0.6593 / 0.6519 | 0.7672 / 0.7690 | 0.7680 / 0.7130 | 0.7113 |
| seara/rubert-base-cased-russian-sentiment | 0.5653 / 0.5679 | **0.8163** / **0.8183** | 0.6566 / 0.6434 | 0.6765 |
| seara/rubert-tiny2-russian-sentiment | 0.4980 / 0.5032 | 0.7877 / 0.7899 | 0.6218 / 0.6122 | 0.6351 |
| blanchefort/rubert-base-cased-sentiment | 0.5253 / 0.5209 | 0.7615 / 0.7549 | 0.6716 / 0.6047 | 0.6268 |
| blanchefort/rubert-base-cased-sentiment-rusentiment | 0.5413 / 0.5470 | 0.6230 / 0.6327 | 0.6022 / 0.5760 | 0.5852 |
| cointegrated/rubert-tiny-sentiment-balanced | 0.4293 / 0.3977 | 0.7330 / 0.7344 | 0.6158 / 0.5857 | 0.5726 |

El modelo supera en F1 media a todos los modelos base comparados, aunque queda por debajo del teacher large, como es esperable por la reducción de tamaño.

## Requisitos de hardware

- VRAM estimada: al tener ~29M de parámetros, el modelo en FP32 ocupa aproximadamente 116 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. En FP16 ocuparía ~58 MB.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o superiores. También funciona en CPU sin problemas.
- Compatible con consumer GPU: sí, incluso en las más básicas.
- Opciones de despliegue: Hugging Face Transformers (Python), Text Embeddings Inference (TEI) para endpoints, ONNX Runtime, y potencialmente llama.cpp si se convierte a GGUF (aunque no se proporciona oficialmente).
- Latencia y throughput: no disponible en la información proporcionada, pero por su tamaño se espera una latencia de milisegundos en CPU y de microsegundos en GPU.

## Comparativa con modelos similares

El modelo se compara directamente con otros clasificadores de sentimiento en ruso, tanto en tamaño tiny como base. La siguiente tabla resume las diferencias principales:

| Modelo | Parámetros | Contexto | Licencia | F1 media (según autor) |
| :--- | :--- | :--- | :--- | :--- |
| sergeyzh/rubert-tiny-sentiment | 29,2M | 512 | MIT | 0,7113 |
| seara/rubert-tiny2-russian-sentiment | no disponible | no disponible | no disponible | 0,6351 |
| seara/rubert-base-cased-russian-sentiment | no disponible | no disponible | no disponible | 0,6765 |
| blanchefort/rubert-base-cased-sentiment | no disponible | no disponible | no disponible | 0,6268 |
| cointegrated/rubert-tiny-sentiment-balanced | no disponible | no disponible | no disponible | 0,5726 |

No se dispone de datos de parámetros ni contexto para los modelos comparados, pero el modelo de sergeyzh ofrece la mejor F1 media entre los modelos no-large, con la ventaja de ser extremadamente ligero.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en ruso, por lo que no es adecuado para otros idiomas.
- Al ser un modelo tiny, puede tener dificultades con matices de sarcasmo, ironía o lenguaje figurado, y puede confundir clases en textos ambiguos.
- La clasificación se limita a tres clases; no distingue intensidad de sentimiento ni emociones específicas.
- El entrenamiento se realizó con reseñas de dominios concretos (cine, reseñas de productos, geolocalización), por lo que su rendimiento puede degradarse en otros dominios.
- No se han publicado resultados de cuantización ni de rendimiento en entornos de producción, por lo que se recomienda validar en el caso de uso específico.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergeyzh/rubert-tiny-sentiment
- Modelo base (sergeyzh/rubert-tiny-sts-v2): https://huggingface.co/sergeyzh/rubert-tiny-sts-v2
- Modelo teacher (sergeyzh/rubert-large-uncased-sentiment): https://huggingface.co/sergeyzh/rubert-large-uncased-sentiment
- Modelo relacionado (sergeyzh/rubert-tiny-sts): https://huggingface.co/sergeyzh/rubert-tiny-sts
- Modelo relacionado (sergeyzh/rubert-mini-sts): https://huggingface.co/sergeyzh/rubert-mini-sts
