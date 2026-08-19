# ketiswp/mediapipe-EfficientDet-Lite2-COCO2017-fp32-onnx

## Resumen

Este modelo es la versión FP32 en formato ONNX del detector de objetos MediaPipe EfficientDet-Lite2, entrenado sobre el conjunto de datos COCO 2017. El autor, ketiswp, lo publica en Hugging Face para facilitar su uso con ONNX Runtime en aplicaciones de visión por computador. El modelo original pertenece al ecosistema MediaPipe de Google y está diseñado para ejecutarse en dispositivos con recursos limitados, como móviles o sistemas embebidos, manteniendo un equilibrio entre precisión y velocidad.

EfficientDet-Lite2 emplea una arquitectura basada en EfficientNet-Lite2 como extracción de características y una red BiFPN para la fusión de escalas, con una entrada de 448x448 píxeles. Es capaz de detectar 80 categorías de objetos, las mismas que el dataset COCO. Su relevancia actual radica en su formato ONNX, que permite su despliegue en entornos de producción que usan ONNX Runtime, así como su integración con herramientas de conversión y optimización multiplataforma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite2 (EfficientNet-Lite2 backbone + BiFPN) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 (solo este modelo; el autor ofrece una versión INT8/UINT8 aparte) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EfficientDet-Lite2, que combina una red troncal EfficientNet-Lite2 para extraer características a múltiples escalas y una red de fusión BiFPN (Bidirectional Feature Pyramid Network) para combinar estas características de forma eficiente. La entrada se redimensiona a 448x448 píxeles. El entrenamiento se realizó con el dataset COCO 2017, que contiene 1.5 millones de instancias de objetos y 80 categorías etiquetadas. No se especifica el número exacto de tokens o pasos de entrenamiento en la información disponible.

El autor convirtió el modelo original de TensorFlow Lite a ONNX, manteniendo la precisión FP32, lo que lo hace compatible con ONNX Runtime y otras librerías de inferencia. No se mencionan técnicas como RLHF o DPO, al tratarse de un modelo de visión no generativo.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica hasta 80 categorías del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.) mediante cajas delimitadoras.
- Inferencia en tiempo real: gracias a su tamaño ligero, es adecuado para aplicaciones que requieren baja latencia, como procesamiento de video en directo.
- Compatibilidad multiplataforma: al ser ONNX, se puede ejecutar en CPU, GPU y aceleradores de borde con ONNX Runtime, TensorRT, OpenVINO, etc.
- Integración con MediaPipe: el modelo original se puede usar directamente en el framework MediaPipe para soluciones de visión, aunque esta versión ONNX está pensada para pipelines personalizados.
- Sin soporte para tool calling, agentes o razonamiento multi-paso: es un modelo puramente de detección visual.

## Casos de uso

- Vigilancia y seguridad: el modelo puede detectar personas, vehículos u objetos en secuencias de video en tiempo real, integrándose en sistemas de alarma o control de accesos. Su formato ONNX permite desplegarlo en servidores con ONNX Runtime o en dispositivos de borde como Raspberry Pi.
- Conteo de objetos en entornos industriales: por ejemplo, contar piezas en una cinta transportadora o detectar envases en una línea de producción. Al ser ligero, puede ejecutarse en hardware modesto y a una frecuencia de cuadros aceptable.
- Análisis de imágenes médicas (uso general): aunque no está especializado en dominio médico, puede detectar objetos como jeringuillas o equipos en imágenes de quirófanos para estudios de flujo de trabajo.
- Accesibilidad para personas con discapacidad visual: una aplicación móvil que detecte obstáculos o objetos cotidianos (sillas, mesas, puertas) y los describa por voz, aprovechando el formato ONNX para integración en apps Android/iOS.
- Automatización de procesos de selección visual: en entornos de retail, detectar productos en estanterías para control de stock, mediante un pipeline de captura de imágenes y detección con ONNX Runtime.
- Robótica educativa: un robot que evite obstáculos o localice objetos específicos en un entorno controlado, usando el modelo en un microprocesador con aceleración NPU o GPU ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas como mAP, velocidad de inferencia o comparativas con otros modelos.

## Requisitos de hardware

- El modelo es ligero (tamaño de archivo no disponible, pero se estima en pocos megabytes), por lo que puede ejecutarse en CPU en tiempo real para imágenes de resolución 448x448.
- VRAM estimada: no disponible, pero al ser FP32 y de tamaño pequeño, requiere menos de 1 GB de VRAM en GPU para inferencia por lotes.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1050 Ti o superior) para aceleración; también funciona en CPU con ONNX Runtime optimizado.
- Se ejecuta en dispositivos de borde como Raspberry Pi 4/5, NVIDIA Jetson Nano, o móviles con aceleración de hardware (NPU).
- Opciones de despliegue: ONNX Runtime, TensorRT, OpenVINO, CoreML, o mediante MediaPipe si se convierte a TFLite.
- Latencia y throughput estimados: no disponibles; en una CPU moderna se esperan decenas de milisegundos por imagen, pero no se han publicado datos concretos.

## Comparativa con modelos similares

No hay una comparativa directa en la información proporcionada. A nivel general, este modelo se puede comparar con otros detectores de objetos para borde como:

- YOLOv5s (tamaño pequeño, entrada 640x640): mayor precisión pero más pesado.
- SSD-MobileNetV2 (entrada 320x320): más ligero pero con menor precisión.
- EfficientDet-Lite0 (entrada 320x320): variante más ligera de la misma familia, con menor precisión.

Sin embargo, no se dispone de datos concretos de rendimiento de este modelo específico para realizar una comparativa numérica.

## Limitaciones y advertencias

- Sesgos del dataset COCO: el modelo puede presentar sesgos en las clases y contextos representados en COCO, por lo que no es adecuado para dominios especializados sin fine-tuning.
- Riesgo de errores de detección: en imágenes con oclusiones, baja iluminación o ángulos inusuales, la precisión puede degradarse.
- Limitación a 80 clases: solo detecta las categorías de COCO; no es extensible a otras clases sin reentrenar.
- Licencia Apache-2.0: permite uso comercial con atribución, pero el modelo original de MediaPipe está bajo la misma licencia, por lo que no hay restricciones adicionales conocidas.
- Formato ONNX FP32: puede tener un mayor consumo de memoria y menor velocidad que versiones cuantizadas (como la INT8/UINT8 que ofrece el autor), especialmente en dispositivos de borde.
- No es un modelo generativo: no se puede usar para tareas de texto o razonamiento, solo detección de objetos.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/ketiswp/mediapipe-EfficientDet-Lite2-COCO2017-fp32-onnx
- Versión INT8/UINT8 del mismo modelo: https://huggingface.co/ketiswp/mediapipe-EfficientDet-Lite2-COCO2017-int8-uint8-onnx
- Fuente del modelo original (Kaggle): https://www.kaggle.com/models/tensorflow/efficientdet
- Guía de detección de objetos de MediaPipe: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector?hl=en
- Repositorio de MediaPipe en GitHub: https://github.com/google-ai-edge/mediapipe
- Documentación de modelos de MediaPipe: https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/models.md
