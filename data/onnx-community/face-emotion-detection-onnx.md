# onnx-community/face-emotion-detection-ONNX

## Resumen

El modelo `onnx-community/face-emotion-detection-ONNX` es una conversión automática a formato ONNX del modelo original `abhilash88/face-emotion-detection`, un Vision Transformer (ViT-Base) fine-tuneado para reconocimiento de expresiones faciales sobre el dataset FER2013. Desarrollado por la comunidad ONNX de Hugging Face, este modelo clasifica rostros en siete emociones básicas: ira, asco, miedo, alegría, tristeza, sorpresa y neutral. Su principal valor es permitir la inferencia en navegador mediante Transformers.js, así como el despliegue ligero en entornos sin dependencias de PyTorch, gracias al formato ONNX.

Con aproximadamente 86 millones de parámetros y una arquitectura ViT-Base con parches de 16x16 píxeles, el modelo alcanza una precisión global del 71,55% en el conjunto de test de FER2013. Aunque el dataset original es de baja resolución (48x48 píxeles) y presenta etiquetas ruidosas, el modelo ofrece un rendimiento razonable para tareas de análisis de emociones en imágenes frontales de rostros. La versión ONNX mantiene las mismas capacidades que el modelo PyTorch original, pero con la ventaja de ser portable y ejecutable en múltiples plataformas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch16-224) |
| Parametros totales | ~86 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | No disponible (el repo no especifica cuantizacion) |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Vision Transformer (ViT-Base) de Google, concretamente en `google/vit-base-patch16-224`. La imagen de entrada se divide en parches de 16x16 píxeles, que se proyectan linealmente y se procesan a través de 12 capas de transformador con 12 cabezas de atención y una dimensión oculta de 768. El clasificador final es una cabeza lineal que produce logits para las 7 clases de emoción.

El entrenamiento se realizó sobre el dataset FER2013, compuesto por 35.887 imágenes faciales en escala de grises de 48x48 píxeles, reescaladas a 224x224. Se utilizaron 3 épocas con un optimizador AdamW, tasa de aprendizaje de 5e-5, batch size de 16, weight decay de 0.01 y un scheduler lineal con warmup. Se aplicaron aumentos de datos como volteo horizontal aleatorio, rotación de ±15 grados, jitter de color y traslación aleatoria. La versión ONNX se generó mediante una conversión automática del modelo PyTorch original, sin modificaciones en los pesos.

## Capacidades

- Clasificacion de imagenes de rostros en 7 emociones: ira, asco, miedo, alegria, tristeza, sorpresa y neutral.
- Inferencia en navegador mediante Transformers.js, sin necesidad de backend Python.
- Compatible con el pipeline `image-classification` de Hugging Face Transformers.
- Soporte para ejecucion en CPU, GPU y WebAssembly/WebGPU gracias al formato ONNX.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Analisis de sentimiento en videollamadas: el modelo puede integrarse en aplicaciones de videoconferencia para detectar el estado emocional de los participantes en tiempo real, ayudando a moderadores o equipos de recursos humanos a evaluar el clima de una reunion.
- Moderacion de contenido en redes sociales: permite clasificar automaticamente imagenes de perfil o publicaciones que contengan rostros para detectar expresiones de odio, miedo o ira, facilitando la revision de contenido sensible.
- Atencion al cliente adaptativa: en sistemas de soporte por video, el modelo puede ajustar el tono o las respuestas de un asistente virtual segun la emocion detectada en el usuario, mejorando la experiencia de interaccion.
- Investigacion de mercado y publicidad: las empresas pueden medir reacciones emocionales a anuncios o productos mostrando imagenes de consumidores y analizando sus expresiones faciales, sin necesidad de encuestas subjetivas.
- Sistemas de seguridad y vigilancia: en entornos controlados, el modelo puede detectar comportamientos anomalos basados en expresiones de miedo o ira, aunque debe usarse con cautela por posibles sesgos.
- Aplicaciones educativas: para evaluar el nivel de atencion o engagement de estudiantes en clases online, analizando sus expresiones faciales y proporcionando feedback al profesor.
- Juegos y experiencias interactivas: el modelo puede usarse en aplicaciones de entretenimiento que reaccionan a las expresiones del usuario, como filtros de realidad aumentada o juegos de rol.

## Benchmarks y rendimiento

El modelo reporta una precision global del 71,55% en el conjunto de test de FER2013. La precision por clase es la siguiente:

| Clase | Precision |
|---|---|
| Happy | ~86% |
| Surprise | ~84% |
| Neutral | ~83% |
| Angry | ~82% |
| Sad | ~79% |
| Fear | ~75% |
| Disgust | ~68% |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. La precision global es modesta, reflejando la dificultad inherente del dataset FER2013, que contiene imagenes de baja resolucion y etiquetas ruidosas.

## Requisitos de hardware

- Tamano del modelo: aproximadamente 86 millones de parametros. En FP32, el peso ocupa unos 344 MB; en FP16, unos 172 MB; en INT8, unos 86 MB (estimaciones basadas en el numero de parametros).
- VRAM estimada para inferencia: entre 200 MB y 500 MB dependiendo de la precision y el batch size. Cabe en cualquier GPU moderna, incluidas las integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050 o superior, o incluso GPUs integradas de Intel/AMD.
- Ejecucion en CPU: viable, con latencias de decenas de milisegundos por imagen en CPUs modernas.
- Despliegue en navegador: mediante Transformers.js con WebAssembly o WebGPU, sin necesidad de servidor.
- Opciones de despliegue: ONNX Runtime, Transformers.js, TensorRT, OpenVINO, o cualquier runtime compatible con ONNX.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de reconocimiento de emociones faciales en la informacion proporcionada. Existen alternativas como `onnxmodelzoo/emotion-ferplus-8` o la biblioteca FaceONNX, pero no se han encontrado especificaciones detalladas para establecer una comparacion rigurosa. Se recomienda evaluar el modelo en el caso de uso concreto antes de decidir.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre FER2013, un dataset con imagenes de baja resolucion (48x48) y etiquetas obtenidas por crowdsourcing, lo que introduce ruido y limita la generalizacion a imagenes de mayor calidad o con condiciones variadas.
- Puede presentar sesgos demograficos: el rendimiento varia entre distintos grupos de edad, genero o etnia, como se indica en la model card original.
- Confusion frecuente entre emociones similares, especialmente miedo vs sorpresa y asco vs neutral, como muestran los ejemplos de prediccion.
- No apto para uso en produccion sin una validacion exhaustiva en el dominio objetivo, especialmente en aplicaciones de seguridad o salud.
- La version ONNX es una conversion automatica; aunque los pesos son identicos, pueden existir diferencias minimas en la precision numerica respecto al modelo PyTorch original.
- No soporta entrada de video directamente; requiere extraccion de frames y deteccion previa de rostros.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/onnx-community/face-emotion-detection-ONNX
- Modelo original (PyTorch): https://huggingface.co/abhilash88/face-emotion-detection
- Repositorio FaceONNX (biblioteca de analisis facial basada en ONNX): https://github.com/FaceONNX/FaceONNX
- Proyecto similar de reconocimiento de emociones con ONNX: https://github.com/shangeth/Facial-Emotion-Recognition-PyTorch-ONNX
- Perfil de ONNX Community en Hugging Face: https://huggingface.co/onnx-community
