# qualcomm/OpenAI-Clip

## Resumen

El modelo `qualcomm/OpenAI-Clip` es una versión del conocido CLIP (Contrastive Language-Image Pre-Training) de OpenAI, optimizada por Qualcomm para su ejecución eficiente en dispositivos con hardware de la compañía, especialmente aquellos con NPU (Neural Processing Unit). CLIP combina un codificador de imágenes basado en un transformer ViT-B/16 con un codificador de texto causal, permitiendo tareas de clasificación de imágenes zero-shot, búsqueda multimodal y cálculo de similitud entre imagen y texto. Esta implementación concreta, publicada en Hugging Face bajo licencia MIT, incluye modelos pre-exportados en formatos ONNX, QNN_DLC y TFLITE, listos para desplegarse en plataformas como Snapdragon, Dragonwing y otras de Qualcomm.

El modelo tiene 150 millones de parámetros, un tamaño de archivo en precisión float de 571 MB y una longitud de contexto de texto de 77 tokens, con una resolución de imagen de entrada de 224x224 píxeles. Su relevancia actual radica en la creciente demanda de modelos multimodales ligeros que puedan ejecutarse en el edge, sin depender de la nube, para aplicaciones de visión por computador y procesamiento de lenguaje natural en tiempo real. Qualcomm ha adaptado el modelo para aprovechar al máximo su hardware, logrando latencias de inferencia de entre 13 y 48 ms en dispositivos móviles de gama alta, lo que lo convierte en una opción práctica para integraciones en Android y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 para imagen, transformer causal para texto |
| Parametros totales | 150 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 77 tokens de texto; imagen 224x224 píxeles |
| Tipos de cuantizacion | float, w8a16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | no disponible (el modelo original de CLIP es multilingüe, pero esta versión no especifica) |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (pre-exportados) |

## Arquitectura y entrenamiento

CLIP se basa en una arquitectura dual: un codificador de imágenes (ViT-B/16) que procesa parches de 16x16 píxeles y un codificador de texto (transformer causal) que procesa secuencias de hasta 77 tokens. Ambos codificadores proyectan sus salidas a un espacio de embeddings común, y el entrenamiento se realiza mediante aprendizaje contrastivo: se maximiza la similitud coseno entre pares imagen-texto correctos y se minimiza para pares incorrectos. El modelo original de OpenAI fue entrenado con 400 millones de pares imagen-texto extraídos de internet, aunque los detalles específicos del conjunto de datos no se incluyen en la información proporcionada para esta versión de Qualcomm.

La innovación principal de esta implementación no reside en el entrenamiento, sino en la optimización para hardware de Qualcomm. Los archivos pre-exportados están compilados para ejecutarse en la NPU de los chips Snapdragon y Dragonwing, utilizando el Qualcomm AI Hub Workbench para la compilación y el perfilado. Se ofrecen dos precisiones: float (32 bits) y w8a16 (pesos cuantizados a 8 bits, activaciones a 16 bits), lo que reduce el uso de memoria y mejora la latencia en dispositivos con recursos limitados. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal, ya que no son aplicables a este tipo de modelo de visión-lenguaje.

## Capacidades

- Clasificación de imágenes zero-shot: el modelo puede clasificar imágenes en categorías definidas por texto sin necesidad de entrenamiento adicional, simplemente comparando la similitud entre la imagen y las descripciones textuales de las clases.
- Búsqueda multimodal: permite buscar imágenes a partir de texto o texto a partir de imágenes, calculando la similitud entre embeddings.
- Extracción de características visuales y textuales: los embeddings generados pueden utilizarse como entrada para otros modelos o para tareas de recuperación de información.
- Soporte de tool calling: no disponible, ya que CLIP no está diseñado para generación de texto ni interacción con herramientas.
- Soporte de agentes y multi-step reasoning: no aplicable, el modelo no genera texto ni razona de forma autónoma.
- Capacidades multilingües: el modelo original de CLIP es multilingüe, pero esta versión no especifica los idiomas soportados; se asume que hereda las capacidades del original, aunque no se garantiza.
- Capacidades especiales: no incluye modo de pensamiento, visión más allá de la clasificación, ni audio. Su función principal es la representación conjunta de imagen y texto.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos móviles: gracias a su optimización para NPU, el modelo puede ejecutarse en un Snapdragon 8 Gen 3 con una latencia de 21 ms, permitiendo aplicaciones de reconocimiento de objetos, plantas o animales sin conexión a internet.
- Búsqueda visual en galerías de fotos: una aplicación puede indexar las imágenes del usuario y permitir búsquedas por texto (por ejemplo, "perro en la playa") utilizando los embeddings de CLIP, todo localmente en el dispositivo.
- Moderación de contenido automatizada: el modelo puede clasificar imágenes como apropiadas o inapropiadas comparando con descripciones textuales predefinidas, útil para plataformas que necesitan filtrar contenido generado por usuarios en el edge.
- Asistentes de accesibilidad: para personas con discapacidad visual, el modelo puede generar descripciones de imágenes capturadas con la cámara del teléfono, aunque no genera texto directamente, puede combinarse con un modelo de lenguaje para producir descripciones.
- Sistemas de recomendación visual: en aplicaciones de comercio electrónico, el modelo puede encontrar productos similares a partir de una imagen o de una descripción textual, mejorando la experiencia de búsqueda.
- Análisis de imágenes médicas básicas: aunque no está especializado, puede utilizarse para clasificar radiografías o imágenes de dermatología en categorías generales (por ejemplo, "normal" vs "anomalía") si se definen las clases textualmente, siempre con supervisión humana.
- Automatización industrial en dispositivos embebidos: en líneas de producción, el modelo puede ejecutarse en hardware Qualcomm Dragonwing para inspección visual de piezas, detectando defectos mediante comparación con descripciones textuales de productos correctos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (como MMLU, HumanEval o GSM8K) en la información disponible. El modelo está orientado a tareas de visión-lenguaje, y los únicos datos de rendimiento proporcionados son tiempos de inferencia en dispositivos Qualcomm, que se detallan en la sección de requisitos de hardware. No se incluyen métricas como top-1 accuracy en ImageNet o recall en tareas de recuperación, por lo que no es posible comparar su rendimiento académico con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en precisión float ocupa 571 MB; con cuantización w8a16, el uso de memoria se reduce significativamente, aunque no se especifica el tamaño exacto. En los dispositivos Qualcomm, el pico de memoria varía entre 1 MB y 1183 MB según el chip y la precisión, según la tabla de rendimiento.
- GPU recomendadas: este modelo está optimizado para NPU de Qualcomm, no para GPUs de escritorio. Se recomienda ejecutarlo en dispositivos con Snapdragon 8 Gen 1 o superior, Snapdragon X Elite, o chips Dragonwing (QCS8450, QCS8550, IQ-8275, etc.). También puede ejecutarse en CPU o GPU estándar con los pesos originales de CLIP, pero esta versión pre-exportada no está diseñada para ello.
- Si cabe en consumer GPU: no es el objetivo; el modelo está pensado para edge. En una GPU de escritorio como una RTX 4090, se podría ejecutar sin problemas, pero no se proporcionan métricas de rendimiento para ese escenario.
- Opciones de despliegue: los archivos pre-exportados están disponibles en ONNX (compatible con ONNX Runtime), QNN_DLC (para Qualcomm AI Engine) y TFLITE (para LiteRT). Se puede utilizar el Qualcomm AI Hub Workbench para compilar y exportar con configuraciones personalizadas. También se puede usar la librería `qai_hub_models` de Python para integración en aplicaciones.
- Latencia y throughput estimados: según la tabla de rendimiento, en ONNX con precisión float, la inferencia tarda 19.6 ms en Snapdragon X2 Elite, 21.4 ms en Snapdragon 8 Gen 3, 17.0 ms en Snapdragon 8 Elite y 13.5 ms en Snapdragon 8 Elite Gen 5. Con cuantización w8a16, los tiempos mejoran ligeramente (por ejemplo, 13.5 ms en X2 Elite, 15.0 ms en 8 Elite). El throughput no se especifica, pero con estas latencias se pueden procesar decenas de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de la misma categoría. El modelo es esencialmente el CLIP original de OpenAI (ViT-B/16) con optimizaciones de Qualcomm. Alternativas similares incluyen:

- CLIP original de OpenAI: mismo número de parámetros y arquitectura, pero sin optimización para hardware específico. Disponible en formato PyTorch y JAX, con licencia MIT.
- SigLIP (Google): otra arquitectura de visión-lenguaje con variantes de diferentes tamaños, pero no se dispone de datos de comparación en la información proporcionada.
- Otros modelos de embeddings multimodales como ALIGN o BLIP, pero no se han encontrado datos comparables.

En términos de despliegue, esta versión de Qualcomm ofrece la ventaja de estar pre-compilada para NPU, lo que reduce la latencia y el consumo energético en dispositivos móviles, pero no se pueden comparar métricas de precisión sin benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo original de CLIP puede presentar sesgos de género, raza y cultura debido a los datos de entrenamiento, que no han sido auditados en esta versión. Se recomienda evaluar el comportamiento en el dominio de aplicación antes de usarlo en producción.
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera texto libre, pero las clasificaciones zero-shot pueden ser incorrectas si las descripciones textuales son ambiguas o si la imagen no se ajusta a las categorías definidas.
- Limitaciones de contexto: la longitud de contexto de texto es de solo 77 tokens, lo que restringe la complejidad de las descripciones que se pueden utilizar para clasificar o buscar imágenes.
- Limitaciones de idioma: aunque el CLIP original es multilingüe, esta versión no especifica los idiomas soportados; el rendimiento puede degradarse en idiomas poco representados en el entrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero los archivos optimizados están pensados para hardware de Qualcomm; su uso en otras plataformas puede requerir re-exportación y no se garantiza el mismo rendimiento.
- Caveat para producción: la cuantización w8a16 puede reducir ligeramente la precisión en comparación con float; se debe validar el impacto en la tarea específica. Además, el modelo no incluye mecanismos de seguridad contra usos malintencionados, como la generación de descripciones inapropiadas.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/OpenAI-Clip
- Qualcomm AI Hub (página del modelo): https://aihub.qualcomm.com/compute/models/openai_clip
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/openai_clip
- Implementación original de OpenAI CLIP: https://github.com/openai/CLIP/
- Paper de CLIP (arXiv:2103.00020): https://arxiv.org/abs/2103.00020
