# ketiswp/mediapipe-EfficientDet-Lite0-COCO2017-fp32-onnx

## Resumen

El modelo `ketiswp/mediapipe-EfficientDet-Lite0-COCO2017-fp32-onnx` es una conversión a formato ONNX en precisión FP32 del detector de objetos EfficientDet-Lite0 de MediaPipe, desarrollado por Google AI Edge. Este modelo resuelve la detección de objetos en imágenes y vídeo, identificando y localizando instancias de hasta 80 categorías del dataset COCO 2017. Su relevancia actual radica en que ofrece una implementación lista para inferencia con ONNX Runtime, lo que facilita el despliegue en entornos de producción, dispositivos edge y aplicaciones móviles sin depender de TensorFlow Lite.

La arquitectura se basa en un backbone EfficientNet-Lite0 con una red de características BiFPN, y el modelo acepta imágenes de entrada de 320x320 píxeles. El repositorio de HuggingFace no incluye los pesos en sí (tamaño 0.0 GB), por lo que se trata de una ficha descriptiva más que de un artefacto funcional. No se especifican parámetros totales ni otros detalles técnicos en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite0 (backbone EfficientNet-Lite0 + BiFPN) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (original); existe version INT8/UINT8 en un modelo emparejado |
| Idiomas soportados | no aplica (deteccion de objetos en imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EfficientDet-Lite0, que combina un backbone EfficientNet-Lite0 con una red de características BiFPN (Bidirectional Feature Pyramid Network). La entrada es una imagen de 320x320 píxeles, y la salida consiste en cajas delimitadoras y puntuaciones de clase para las 80 categorías del dataset COCO 2017. Según la documentación de Google AI Edge, el modelo fue entrenado con el dataset COCO, que contiene aproximadamente 1,5 millones de instancias de objetos y 80 etiquetas.

No se proporcionan detalles adicionales sobre el entrenamiento en la información disponible. La versión ONNX FP32 es una conversión directa del modelo original de TensorFlow, sin cambios en la arquitectura ni en los pesos.

## Capacidades

- Detección de objetos en imágenes y vídeo, con localización mediante cajas delimitadoras y clasificación en 80 categorías COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Soporte de entrada estándar de 320x320 píxeles, adecuado para aplicaciones de tiempo real en dispositivos con recursos limitados.
- Compatibilidad con ONNX Runtime, lo que permite inferencia en CPU, GPU y aceleradores compatibles con ONNX.
- No soporta tool calling, agentes, razonamiento multimodal ni procesamiento de lenguaje natural.
- Capacidades multilingües: no aplicable, ya que es un modelo exclusivamente visual.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede integrarse en sistemas de cámaras para detectar personas, vehículos u objetos de interés en tiempo real, usando ONNX Runtime en dispositivos edge con CPU.
- Control de inventario y conteo de objetos: en almacenes o tiendas, se puede usar para contar unidades de productos en estanterías a partir de imágenes capturadas por cámaras fijas.
- Automatización de accesos: detección de personas y objetos en sistemas de control de paso, combinando el modelo con lógica de negocio para alertar sobre intrusiones o obstáculos.
- Análisis de tráfico: detección de vehículos, peatones y señales en imágenes de cámaras de tráfico urbano para estimar densidades o generar estadísticas.
- Clasificación de imágenes médicas (limitado): aunque no está entrenado para dominios específicos, puede detectar objetos genéricos en radiografías o ecografías, pero requiere reentrenamiento.
- Prototipos de aplicaciones de realidad aumentada: detección de objetos del mundo real para superponer contenido digital, gracias a su tamaño reducido y compatibilidad con ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como mAP, precisión o velocidad de inferencia para esta versión ONNX FP32.

## Requisitos de hardware

- Al ser un modelo ligero con entrada 320x320, es ejecutable en CPU sin GPU, con requisitos mínimos de memoria.
- No se han publicado datos de VRAM ni latencia específica para esta versión ONNX FP32.
- Puede desplegarse en dispositivos edge (Raspberry Pi, teléfonos Android, placas de desarrollo) mediante ONNX Runtime o frameworks como OpenVINO.
- Para aceleración por GPU, es compatible con ONNX Runtime con ejecutores CUDA o TensorRT, pero no se indican modelos concretos de GPU recomendados.
- Al ser un modelo de detección de objetos relativamente ligero, es probable que quepa en GPUs de consumo como la serie GTX 10xx o RTX 20xx, pero este dato no está disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación. Se puede considerar que EfficientDet-Lite0 es una alternativa ligera a modelos como YOLOv5n, SSD MobileNet o YOLOX-Nano, pero no hay datos concretos de rendimiento en esta publicación.

## Limitaciones y advertencias

- El modelo solo reconoce las 80 categorías del dataset COCO 2017; no es personalizable sin reentrenamiento.
- La versión FP32 puede ser más pesada y lenta en comparación con versiones cuantizadas (INT8/UINT8), que se publican como modelo emparejado.
- No se incluyen los pesos en el repositorio de HuggingFace (tamaño 0.0 GB), por lo que es necesario obtenerlos desde la fuente original de Kaggle o TensorFlow Hub.
- No hay garantías de precisión en dominios especializados (por ejemplo, detección de defectos industriales) sin un entrenamiento adicional.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo original y de los datos COCO para cumplir con las restricciones de atribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ketiswp/mediapipe-EfficientDet-Lite0-COCO2017-fp32-onnx
- Versión INT8/UINT8: https://huggingface.co/ketiswp/mediapipe-EfficientDet-Lite0-COCO2017-int8-uint8-onnx
- Fuente original (Kaggle): https://www.kaggle.com/models/tensorflow/efficientdet
- Guía de detección de objetos de MediaPipe: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector?hl=en
- Repositorio de MediaPipe: https://github.com/google-ai-edge/mediapipe
- Proyecto de referencia con ONNX y TensorRT: https://github.com/namas191297/efficientdetlite
