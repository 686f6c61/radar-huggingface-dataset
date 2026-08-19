# ketiswp/mediapipe-EfficientDet-Lite0-COCO2017-int8-uint8-onnx

## Resumen
Este modelo es una versión cuantizada en 8 bits (INT8/UINT8) del detector de objetos EfficientDet-Lite0 de MediaPipe, entrenado con el dataset COCO 2017. Ha sido convertido a formato ONNX por el usuario ketiswp, manteniendo la arquitectura original del modelo de Google AI Edge. Su objetivo principal es ofrecer una detección de objetos ligera y rápida para entornos con recursos limitados, como dispositivos móviles o sistemas embebidos, aprovechando la cuantización para reducir el tamaño y acelerar la inferencia.

El modelo original EfficientDet-Lite0 utiliza un backbone EfficientNet-Lite3, una red de características BiFPN y una entrada de 320x320 píxeles. Está entrenado para detectar 80 clases de objetos del dataset COCO. La versión ONNX aquí presentada emplea cuantización estática con pesos INT8 y una entrada UINT8, en formato QDQ (Quantize/Dequantize), lo que facilita su despliegue en motores de inferencia como ONNX Runtime. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia actual de este modelo radica en la demanda de soluciones de visión por computadora eficientes para edge computing. Al estar cuantizado y en formato ONNX, se puede integrar fácilmente en pipelines de inferencia en C++, Python o plataformas como MediaPipe, manteniendo un equilibrio entre precisión y velocidad.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite0 (backbone EfficientNet-Lite3 + BiFPN) |
| Parametros totales | no disponible (se estima ~3,2 M, pero no confirmado en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8 (pesos), UINT8 (entrada), formato QDQ |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura EfficientDet-Lite0, diseñada por Google para detección de objetos eficiente en dispositivos de bajo consumo. Utiliza un backbone EfficientNet-Lite3 con entrada de 320x320 píxeles y una red de fusión de características (BiFPN) que combina información multiescala. El modelo fue entrenado originalmente con el dataset COCO 2017, que contiene 1,5 millones de instancias y 80 etiquetas de objetos.

La versión ONNX aquí presentada es una conversión cuantizada estáticamente: los pesos se convirtieron a INT8 y la entrada se define como UINT8, usando un esquema QDQ (Quantize/Dequantize) para mantener la precisión durante la ejecución. Esta cuantización reduce el tamaño del modelo y mejora la latencia en hardware que soporta operaciones de 8 bits, como CPU con AVX-512 o NPUs. No se dispone de detalles sobre el proceso de entrenamiento o técnicas como RLHF, ya que es un modelo preentrenado y cuantizado, no entrenado desde cero.

## Capacidades
- Detección de objetos en imágenes: localiza y clasifica hasta 80 clases de objetos (personas, vehículos, animales, objetos cotidianos, etc.).
- Inferencia eficiente en CPU y hardware de bajo consumo gracias a la cuantización INT8.
- Soporte para múltiples objetos en una misma imagen, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Compatible con ONNX Runtime y otros motores que aceptan formato ONNX.
- Integración sencilla con MediaPipe Tasks para despliegue en aplicaciones móviles o de escritorio.
- No requiere GPU para inferencia básica, aunque puede acelerarse con hardware compatible.

## Casos de uso
- **Detección de objetos en tiempo real en dispositivos móviles**: el modelo puede integrarse en aplicaciones Android o iOS mediante MediaPipe Tasks, permitiendo la detección de objetos en vídeo en tiempo real con una latencia baja.
- **Control de inventario automatizado**: en almacenes, el modelo puede identificar y contar productos sobre estanterías a partir de imágenes de cámaras fijas, aprovechando su tamaño reducido para ejecutarse en hardware económico.
- **Clasificación de imágenes para sistemas de asistencia**: por ejemplo, detectar personas o animales en cámaras de seguridad para activar alertas, con la ventaja de poder correr en dispositivos embebidos.
- **Análisis de tráfico**: detección de vehículos y peatones en imágenes de cámaras urbanas, útil para sistemas de gestión de tráfico o estudios de movilidad.
- **Robótica educativa**: integrarlo en robots con Raspberry Pi o Jetson Nano para tareas de seguimiento de objetos, gracias a su bajo consumo de recursos.
- **Preprocesamiento en pipelines de visión**: como primer paso para localizar regiones de interés antes de aplicar modelos más pesados, por ejemplo, en sistemas de conteo de personas o seguimiento de objetos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como mAP, latencia o throughput. Para conocer el rendimiento del modelo original, se puede consultar la documentación de MediaPipe, que reporta una mAP de alrededor de 25% en COCO para EfficientDet-Lite0, pero este dato no está confirmado en la información proporcionada y puede variar tras la cuantización.

## Requisitos de hardware
- **VRAM estimada**: al ser un modelo pequeño y cuantizado, no requiere GPU. Puede ejecutarse en CPU con un consumo de memoria RAM típico de decenas de MB (no se dispone del valor exacto).
- **GPUs recomendadas**: no necesita GPU, pero si se usa, cualquier GPU con soporte FP16 o INT8 puede acelerar la inferencia. Ejemplos: NVIDIA Jetson Nano, Raspberry Pi con Coral, o GPUs de gama baja.
- **Compatibilidad con consumer GPU**: sí, puede ejecutarse en cualquier CPU moderna; no requiere hardware específico.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), MediaPipe Tasks (Python/JavaScript), TensorRT, OpenVINO, o mediante herramientas como Netron para visualización.
- **Latencia y throughput**: no se dispone de datos concretos, pero al ser un modelo de 3,2M de parámetros cuantizado, se espera una latencia inferior a 50 ms por imagen en CPU moderna, aunque no es un valor oficial.

## Comparativa con modelos similares
No se dispone de datos de rendimiento comparativo en la información proporcionada. Sin embargo, se puede comparar estructuralmente con otros modelos de detección de objetos ligeros:

| Modelo | Parámetros | Entrada | Cuantización | Licencia |
|---|---|---|---|---|
| EfficientDet-Lite0 (este) | ~3,2 M (estimado) | 320x320 | INT8/UINT8 | Apache 2.0 |
| YOLOv5n | ~1,9 M | 640x640 | FP16/INT8 | GPLv3 |
| SSD MobileNetV2 | ~6,8 M | 300x300 | FP16/INT8 | Apache 2.0 |

Estos datos son de conocimiento general, no de la información proporcionada. La elección depende de la precisión deseada, el hardware y la licencia (YOLOv5n tiene licencia GPL, lo que puede ser restrictivo).

## Limitaciones y advertencias
- **Solo 80 clases**: limitado a las categorías de COCO, no cubre objetos específicos de dominios verticales.
- **Precisión reducida**: la cuantización INT8 puede degradar ligeramente la precisión en comparación con la versión FP32, especialmente en objetos pequeños o con baja iluminación.
- **Sesgos del dataset**: COCO tiene una distribución sesgada hacia ciertas categorías y contextos, lo que puede provocar falsos negativos en escenarios poco representados.
- **Riesgo de alucinación**: aunque no es un modelo generativo, puede producir detecciones erróneas en imágenes con patrones complejos o texturas que se asemejen a objetos.
- **Dependencia de la entrada**: requiere que las imágenes se preprocesen a 320x320, lo que puede perder detalle en imágenes de alta resolución.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones, pero se debe atribuir la autoría del modelo original según los términos de la licencia.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/ketiswp/mediapipe-EfficientDet-Lite0-COCO2017-int8-uint8-onnx)
- [Versión FP32 en Hugging Face](https://huggingface.co/ketiswp/mediapipe-EfficientDet-Lite0-COCO2017-fp32-onnx)
- [Modelo original en Kaggle](https://www.kaggle.com/models/tensorflow/efficientdet)
- [Guía de MediaPipe para detección de objetos](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector?hl=en)
- [Repositorio de MediaPipe en GitHub](https://github.com/google-ai-edge/mediapipe)
