# JONNYVERSE/facial_emotions_image_detection

## Resumen

Este modelo es una conversión a formato ONNX del clasificador de emociones faciales dima806/facial_emotions_image_detection, publicada por el usuario JONNYVERSE para hacerlo compatible con Transformers.js. Se trata de un modelo de clasificación de imágenes basado en Vision Transformer (ViT) que detecta siete emociones faciales —tristeza, asco, enfado, neutral, miedo, sorpresa y alegría— con una precisión global del 91% según los datos publicados del modelo base.

La relevancia de esta conversión radica en que permite ejecutar la inferencia directamente en el navegador o en entornos Node.js mediante la librería Transformers.js, eliminando la necesidad de un servidor dedicado o de una GPU en el backend. El repositorio ocupa 0,8 GB e incluye los pesos ONNX listos para su uso. No se trata de un modelo nuevo, sino de una adaptación de formato del modelo original de dima806, que mantiene los mismos pesos y comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base utiliza una arquitectura Vision Transformer (ViT), que divide la imagen de entrada en parches y los procesa mediante capas de atención, adaptando el mecanismo del transformer a datos visuales. El modelo fue entrenado para clasificar imágenes faciales en una de siete categorías emocionales: sad, disgust, angry, neutral, fear, surprise y happy.

Los detalles del entrenamiento —número de imágenes, composición del dataset, técnicas de fine-tuning o uso de RLHF/DPO— no están disponibles en la información proporcionada. La conversión a ONNX realizada por JONNYVERSE no modifica los pesos del modelo original; únicamente los transforma a un formato optimizado para inferencia en entornos JavaScript, utilizando herramientas como Optimum. El modelo card incluye un ejemplo de uso que referencia el repositorio Xenova/facial_emotions_image_detection, lo que sugiere que la conversión sigue la misma metodología que la realizada previamente por Xenova.

## Capacidades

- Clasificación de imágenes faciales en siete emociones: tristeza, asco, enfado, neutral, miedo, sorpresa y alegría.
- Precisión global del 91% según los datos publicados del modelo base.
- Compatible con Transformers.js, lo que permite ejecutar inferencia en navegador (via WebAssembly o WebGPU) y en Node.js.
- Integración mediante la API pipeline de Transformers.js con una sola línea de código.
- No soporta tool calling, generación de texto, razonamiento multimodal ni capacidades de agente, al ser un modelo de clasificación de imágenes puro.
- No incluye capacidades de detección de rostros; el modelo asume que la imagen de entrada ya contiene un rostro recortado.

## Casos de uso

- Análisis de reacciones de usuarios en aplicaciones web: el modelo puede ejecutarse en el navegador del cliente para detectar emociones en tiempo real a partir de la cámara, sin enviar datos a un servidor, gracias a su compatibilidad con Transformers.js y su tamaño de 0,8 GB.
- Pruebas de experiencia de usuario (UX): integrable en pipelines de testing para evaluar la reacción emocional de participantes ante prototipos o interfaces, usando capturas de webcam procesadas localmente.
- Moderación de contenido en plataformas de video: clasificación de fotogramas para detectar expresiones de miedo o enfado en contenido generado por usuarios, como medida de seguridad adicional.
- Sistemas de atención al cliente con análisis de sentimiento visual: combinado con un chatbot, puede analizar la expresión facial del usuario durante una videollamada para ajustar el tono de la respuesta.
- Herramientas educativas de inteligencia emocional: aplicaciones para niños o adultos que practican el reconocimiento de emociones a partir de fotografías, con feedback inmediato en el navegador.
- Investigación en psicología y ciencias del comportamiento: clasificación automatizada de expresiones faciales en estudios que requieren analizar grandes volúmenes de imágenes, ejecutable en entornos Node.js sin GPU dedicada.

## Benchmarks y rendimiento

Según los datos publicados del modelo base (dima806/facial_emotions_image_detection), el modelo alcanza una precisión global del 91% en la tarea de detección de emociones faciales. No se han publicado resultados desglosados por categoría emocional ni comparaciones formales con otros modelos en la información disponible.

| Metrica | Resultado |
|---|---|
| Precision global (deteccion de emociones) | 91% |

## Requisitos de hardware

- Tamaño del repositorio: 0,8 GB (pesos ONNX).
- Inferencia en navegador: compatible con Transformers.js, puede ejecutarse via WebAssembly o WebGPU en CPUs y GPUs de consumo general.
- Inferencia en Node.js: no requiere GPU dedicada; puede ejecutarse en CPU con ONNX Runtime.
- VRAM estimada: no disponible, pero al tratarse de un modelo ViT de clasificación de imágenes con pesos ONNX de 0,8 GB, se estima que cabe en GPUs con 2-4 GB de VRAM en FP32, y menos en FP16 o INT8.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime, Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Precision | Formato | Licencia |
|---|---|---|---|---|
| JONNYVERSE/facial_emotions_image_detection | ViT | 91% | ONNX | no disponible |
| dima806/facial_emotions_image_detection | ViT | 91% | PyTorch | no disponible |
| Xenova/facial_emotions_image_detection | ViT | 91% | ONNX | no disponible |
| face_emotion_recognition | no disponible | no disponible | no disponible | no disponible |

Los tres primeros modelos son esencialmente el mismo modelo en diferentes formatos: el original de dima806 en PyTorch y las conversiones a ONNX de Xenova y JONNYVERSE. La diferencia principal es el autor de la conversión y la estructura del repositorio. El modelo face_emotion_recognition se menciona en fuentes externas como similar, pero no se dispone de especificaciones detalladas.

## Limitaciones y advertencias

- La licencia del modelo no está disponible, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor original (dima806) antes de utilizarlo en producción.
- No se dispone de información sobre sesgos del modelo. Los modelos de detección de emociones faciales suelen presentar sesgos relacionados con etnia, edad y género, pero no hay datos publicados al respecto.
- Riesgo de clasificaciones incorrectas: al ser un clasificador de imágenes, el error se manifiesta en etiquetas erróneas, no en alucinaciones textuales. La precisión del 91% implica que aproximadamente 1 de cada 10 imágenes se clasifica incorrectamente.
- El modelo solo clasifica siete emociones básicas; no detecta emociones complejas, matizadas o estados afectivos mixtos.
- La precisión del 91% corresponde al modelo base; la conversión a ONNX puede introducir ligeras variaciones en los resultados debido a diferencias en la precisión numérica.
- No hay información sobre el dataset de entrenamiento, por lo que se desconoce la distribución demográfica de las imágenes utilizadas y su posible sesgo.
- El modelo card incluye un ejemplo de código que referencia el repositorio Xenova/facial_emotions_image_detection en lugar del repositorio JONNYVERSE, lo que puede causar confusión al usuario que intente reproducir el ejemplo tal cual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/facial_emotions_image_detection
- Modelo base: https://huggingface.co/dima806/facial_emotions_image_detection
- Conversión equivalente de Xenova: https://huggingface.co/Xenova/facial_emotions_image_detection
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Optimum (herramienta de conversión a ONNX): https://huggingface.co/docs/optimum/index
