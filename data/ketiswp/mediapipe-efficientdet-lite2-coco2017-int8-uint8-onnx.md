# ketiswp/mediapipe-EfficientDet-Lite2-COCO2017-int8-uint8-onnx

## Resumen

El modelo `ketiswp/mediapipe-EfficientDet-Lite2-COCO2017-int8-uint8-onnx` es una versión cuantizada a 8 bits (INT8/UINT8) del detector de objetos EfficientDet-Lite2, desarrollado originalmente por Google y adaptado a formato ONNX por el usuario ketiswp. Este modelo está diseñado para detección de objetos en imágenes y vídeo, con un equilibrio entre precisión y eficiencia computacional, pensado para ejecutarse en dispositivos con recursos limitados (edge, móviles, CPUs). La cuantización estática reduce el tamaño del modelo y acelera la inferencia, manteniendo un formato QDQ (Quantize-Dequantize) que facilita su uso con ONNX Runtime.

La relevancia de esta versión radica en su compatibilidad directa con el ecosistema ONNX, lo que permite su despliegue en múltiples plataformas sin depender de frameworks propietarios. El modelo utiliza un backbone EfficientNet-Lite2 con una entrada de 448x448 píxeles y una red de características BiFPN, entrenado sobre el dataset COCO 2017, que contiene 1,5 millones de instancias de objetos y 80 categorías. Aunque no se especifican los parámetros totales, se trata de un modelo ligero, adecuado para aplicaciones de tiempo real en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite2 (backbone EfficientNet-Lite2 + BiFPN) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | INT8 (pesos), UINT8 (entrada), formato QDQ |
| Idiomas soportados | No aplica (procesamiento de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con cuantización QDQ) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EfficientDet-Lite2, que combina un backbone EfficientNet-Lite2 (una variante de EfficientNet optimizada para dispositivos móviles) con una red de características BiFPN (Bidirectional Feature Pyramid Network) para fusionar features a múltiples escalas. La entrada se redimensiona a 448x448 píxeles. El entrenamiento original se realizó sobre el dataset COCO 2017, que contiene 1.5 millones de instancias de objetos repartidas en 80 categorías. La versión aquí presentada ha sido sometida a una cuantización estática post-entrenamiento: los pesos se convierten a INT8 y la entrada se define como UINT8, utilizando el formato QDQ (Quantize-Dequantize) para preservar la precisión durante la inferencia. No se indica el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica hasta 80 categorías del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Genera cuadros delimitadores (bounding boxes) y etiquetas de clase con puntuaciones de confianza.
- Funciona con entradas estáticas de 448x448 píxeles, aunque puede procesar imágenes de mayor resolución mediante redimensionamiento.
- Optimizado para inferencia en tiempo real en dispositivos con recursos limitados (CPU, móvil, edge) gracias a la cuantización INT8.
- Compatible con ONNX Runtime y otros motores de inferencia que soporten formato ONNX.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo discriminativo de visión.

## Casos de uso

- **Detección de objetos en tiempo real en aplicaciones móviles**: el modelo puede integrarse en apps Android/iOS mediante ONNX Runtime Mobile, permitiendo detectar objetos en el flujo de cámara con baja latencia. Su tamaño reducido y cuantización lo hacen adecuado para ejecución continua en dispositivos.
- **Vigilancia y seguridad**: análisis de vídeo en cámaras IP o sistemas embebidos para detectar intrusos, vehículos o paquetes, gracias a su capacidad de procesar imágenes de 448x448 a alta velocidad.
- **Control de inventario en almacenes**: detección de productos en estanterías a partir de imágenes capturadas por cámaras, con las 80 categorías COCO (aunque no todas son productos, se puede adaptar con fine-tuning).
- **Asistencia a personas con discapacidad visual**: describir objetos del entorno en tiempo real mediante una aplicación que procesa la cámara y emite avisos sonoros.
- **Clasificación de imágenes médicas**: aunque no es el dominio principal, se puede usar como base para detectar objetos relevantes en radiografías (p.ej. lesiones) mediante transferencia de aprendizaje.
- **Robótica y drones**: detección de obstáculos u objetivos en entornos controlados, con despliegue en hardware de bajo consumo como Raspberry Pi o Jetson Nano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada en la información disponible. La documentación de MediaPipe indica que EfficientDet-Lite2 alcanza una precisión media (mAP) de alrededor de 30 en el conjunto COCO, pero no se proporcionan números concretos para esta variante INT8/UINT8. No se pueden comparar directamente con otros modelos sin datos fiables.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser un modelo cuantizado de tamaño reducido, se puede ejecutar en CPU con memoria RAM inferior a 1 GB (típico de modelos EfficientDet-Lite2).
- **GPU recomendadas**: no es necesario una GPU dedicada; funciona en CPUs ARM y x86. En caso de usar GPU, cualquier tarjeta con soporte ONNX Runtime (por ejemplo, RTX 2060 o superior) puede acelerar la inferencia.
- **¿Cabe en consumer GPU?**: sí, incluso en hardware de gama baja, pero no es el objetivo principal.
- **Opciones de despliegue**: ONNX Runtime (CPU, CUDA, DirectML, OpenVINO), también se puede usar con OpenCV DNN, TensorRT, o convertirlo a TFLite para móviles.
- **Latencia y throughput**: no se proporcionan datos concretos. En general, EfficientDet-Lite2 está diseñado para correr a más de 30 FPS en CPUs modernas de móvil (según MediaPipe), pero la cuantización puede mejorar aún más la velocidad.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de detección (como YOLO, SSD, otros EfficientDet) en la información proporcionada. Se puede indicar que, dentro de la familia EfficientDet, el Lite2 es un punto intermedio entre Lite0 (más rápido) y Lite4 (más preciso), pero sin números concretos. No se aportan tablas comparativas por falta de datos.

## Limitaciones y advertencias

- **Precisión reducida por cuantización**: la conversión a INT8 puede degradar ligeramente la precisión en comparación con la versión FP32, especialmente en objetos pequeños o en condiciones de baja iluminación.
- **Sesgos del dataset COCO**: el modelo hereda los sesgos de COCO, como la representación desproporcionada de ciertas categorías y contextos, lo que puede llevar a errores en escenarios no representados.
- **Alucinaciones**: al ser un detector, no genera texto, pero puede producir falsos positivos (detectar objetos inexistentes) con cierta frecuencia.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente y mantener los avisos de licencia.
- **Formato de entrada fijo**: requiere imágenes de 448x448; el redimensionamiento puede perder detalles si la imagen original tiene una relación de aspecto muy distinta.
- **Soporte limitado**: al ser una adaptación de un modelo de MediaPipe, no se garantiza el mismo rendimiento que el modelo original TFLite en todas las plataformas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ketiswp/mediapipe-EfficientDet-Lite2-COCO2017-int8-uint8-onnx)
- [Versión FP32 del modelo](https://huggingface.co/ketiswp/mediapipe-EfficientDet-Lite2-COCO2017-fp32-onnx)
- [Modelo original en Kaggle](https://www.kaggle.com/models/tensorflow/efficientdet)
- [Guía de detección de objetos de MediaPipe](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector?hl=en)
- [Repositorio de MediaPipe en GitHub](https://github.com/google-ai-edge/mediapipe)
