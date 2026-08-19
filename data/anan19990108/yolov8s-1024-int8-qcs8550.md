# anan19990108/yolov8s-1024-int8-qcs8550

## Resumen

YOLOv8s-1024-int8-qcs8550 es un modelo de detección de objetos basado en YOLOv8s de Ultralytics, exportado a TensorFlow Lite y cuantizado completamente a enteros de 8 bits (INT8) mediante post-training quantization (PTQ). El artefacto está diseñado específicamente para ejecutarse en dispositivos Android con SoC Qualcomm QCS8550 (familia Kalama) utilizando el backend QNN HTP (Hexagon Tensor Processor). El autor, Andrew Chiao (usuario anan19990108), realizó la exportación a resolución 1024×1024, la calibración con un conjunto representativo de imágenes COCO, el empaquetado TFLite y la validación en el conjunto completo de COCO val2017.

El modelo resuelve el problema de desplegar detección de objetos en tiempo real en hardware de borde con aceleración por hardware, manteniendo una precisión razonable frente a la versión FP16. La cuantización INT8 reduce el tamaño del archivo a 11,10 MiB y permite alcanzar 159,10 FPS solo de inferencia en el dispositivo de validación, lo que lo convierte en una opción adecuada para aplicaciones de visión por computador en móviles, cámaras y sistemas embebidos. La licencia es AGPL-3.0, heredada del modelo base de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (backbone CSPDarknet + neck PAN-FPN + cabeza de detección) |
| Parametros totales | no disponible (modelo base YOLOv8s de Ultralytics, ~11,2 M según documentación oficial) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8 completo (full-integer post-training quantization) |
| Idiomas soportados | no disponible (no aplica, modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | TensorFlow Lite (.tflite) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura YOLOv8s original de Ultralytics, con pesos preentrenados en COCO. No se realizó ningún entrenamiento adicional; el proceso consistió en exportar el modelo a resolución 1024×1024 y aplicar cuantización completa a INT8 mediante TensorFlow Lite con la optimización `tf.lite.Optimize.DEFAULT`. La calibración se hizo con 128 imágenes de COCO val2017, seleccionadas de forma determinista y preprocesadas con letterbox que preserva la relación de aspecto, padding de valor 114 y normalización a [0, 1]. El modelo resultante acepta entrada INT8 y produce salida INT8 con forma `[1, 84, 21504]`, donde los primeros 4 canales corresponden a las coordenadas de caja y los 80 restantes a las puntuaciones de clase. La supresión de no máximos (NMS) se realiza fuera del grafo TFLite.

La cuantización es una técnica de compresión que reduce la precisión numérica de los pesos y activaciones a enteros de 8 bits, lo que permite aprovechar las unidades de cómputo especializadas del Hexagon HTP de Qualcomm. El modelo fue validado en el conjunto completo de COCO val2017 (5.000 imágenes, 80 clases) usando el delegate QNN LiteRT en un dispositivo QCS8550 con Android 13, TensorFlow Lite 2.16.1 y QNN runtime 2.47.

## Capacidades

- Detección de objetos en 80 categorías de COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Inferencia a resolución 1024×1024 con entrada y salida INT8.
- Compatible con el delegate QNN HTP de Qualcomm para aceleración por hardware en dispositivos Android.
- Salida estructurada en formato `[1, 84, 21504]` lista para postprocesado externo (umbral, transformación de coordenadas y NMS).
- Soporte para ejecución en Python mediante TensorFlow Lite Interpreter, con ejemplo de conversión de salida INT8 a valores reales.
- Adecuado para aplicaciones de tiempo real en borde gracias a la baja latencia (6,285 ms por invocación media del modelo).
- Posibilidad de comparar rendimiento y precisión frente a la versión FP16 del mismo modelo base.

## Casos de uso

- Detección de objetos en tiempo real en Android: el modelo puede integrarse en aplicaciones móviles que procesen flujos de cámara, aprovechando el delegate QNN HTP para lograr ~160 FPS de inferencia pura y ~58 FPS en el pipeline completo (excluyendo decodificación de fuente).
- Prototipado de visión por computador en dispositivos Qualcomm: ideal para validar la viabilidad de despliegue de YOLOv8 en SoC de la serie QCS8550 antes de pasar a producción.
- Benchmarking de precisión y velocidad entre cuantización INT8 y FP16: el modelo permite reproducir las métricas reportadas y comparar el equilibrio entre exactitud (mAP50 0,5718 vs 0,5930 en FP16) y rendimiento.
- Sistemas de vigilancia perimetral en borde: al ejecutarse localmente sin conexión a la nube, puede detectar intrusiones u objetos de interés con baja latencia y privacidad de datos.
- Control de calidad industrial en líneas de producción: con cámaras conectadas a dispositivos QCS8550, puede identificar defectos o clasificar piezas según las categorías COCO adaptadas al dominio.
- Investigación y educación en edge AI: sirve como ejemplo práctico de cuantización completa, integración con QNN HTP y evaluación de modelos en hardware móvil.

## Benchmarks y rendimiento

Los resultados de validación en COCO val2017 (5.000 imágenes, 80 clases) se presentan en la model card:

| Metrica | Valor |
|---|---|
| mAP50 | 0,571802 |
| mAP50-95 | 0,370733 |
| Predicciones | 354.125 |
| Invocacion media del modelo | 6,285 ms |
| Throughput solo inferencia | 159,10 FPS |
| Pipeline completo (sin decodificacion de fuente) | 57,60 FPS |
| End-to-end secuencial | 21,86 FPS |

La versión FP16 de referencia alcanzó mAP50 0,593022 y mAP50-95 0,411226, lo que muestra una pérdida de precisión de aproximadamente 2,1 puntos de mAP50 y 4,1 puntos de mAP50-95 en la cuantización INT8.

Entorno de medición: Qualcomm Kalama / QCS8550, Android 13, backend QNN HTP, TensorFlow Lite 2.16.1, delegate QNN LiteRT 2.44.0, QNN runtime 2.47, 5 ejecuciones de calentamiento.

## Requisitos de hardware

- Dispositivo con SoC Qualcomm QCS8550 (familia Kalama) o similar compatible con el runtime QNN HTP.
- Android 13 o superior para la integración nativa con el delegate QNN LiteRT.
- VRAM: no aplica (inferencia en hardware dedicado Hexagon HTP, no en GPU convencional).
- GPU: no se requiere GPU; el modelo está optimizado para el acelerador Hexagon HTP integrado en el SoC.
- No cabe en GPU de consumo convencional (RTX 4090, etc.) porque está diseñado para el ecosistema Qualcomm; el archivo TFLite puede ejecutarse en CPU con TensorFlow Lite, pero el rendimiento reportado solo se logra con el delegate QNN.
- Opciones de despliegue: TensorFlow Lite Interpreter en Python, Android Java/Kotlin con QnnDelegate, o cualquier runtime compatible con TFLite.
- Latencia: 6,285 ms por invocación del modelo en el dispositivo de validación; el pipeline completo (sin decodificación) alcanza 57,60 FPS.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos cuantizados comparables en la información proporcionada. La única comparación directa es con la versión FP16 del mismo YOLOv8s:

| Modelo | Precision (mAP50) | Precision (mAP50-95) | Tamano | Velocidad (FPS inferencia) |
|---|---|---|---|---|
| YOLOv8s-1024 INT8 (este) | 0,571802 | 0,370733 | 11,10 MiB | 159,10 |
| YOLOv8s-1024 FP16 (referencia) | 0,593022 | 0,411226 | no disponible | no disponible |

Se recomienda consultar la documentación de Ultralytics para comparar con otras variantes de YOLOv8 en diferentes formatos y plataformas.

## Limitaciones y advertencias

- La licencia AGPL-3.0 impone obligaciones de copyleft si el modelo se integra en software distribuido; revisar los términos antes de uso comercial.
- El modelo está entrenado exclusivamente en las 80 categorías de COCO; no detecta objetos fuera de ese conjunto y hereda los sesgos y limitaciones del dataset.
- El rendimiento reportado depende del preprocesamiento exacto (letterbox a 1024×1024, padding 114, normalización) y del delegate QNN HTP; en otros SoC o delegates los resultados pueden variar significativamente.
- La supresión de no máximos (NMS) no está incluida en el grafo TFLite; debe implementarse externamente, lo que añade complejidad al pipeline.
- La cuantización INT8 introduce una pérdida de precisión de ~2-4 puntos en mAP frente a FP16; no es adecuada para aplicaciones que requieran máxima exactitud.
- El archivo TFLite está optimizado para la resolución 1024×1024; usarlo con otras resoluciones requiere reexportación y recalibración.
- No se proporcionan datos sobre el comportamiento en condiciones de iluminación adversa, oclusiones o dominios fuera de COCO; se recomienda validar en el caso de uso concreto.
- La integración con QNN HTP requiere paquetes SDK de Qualcomm autorizados y versiones compatibles; errores en la configuración pueden provocar fallos silenciosos con CPU fallback.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/yolov8s-1024-int8-qcs8550
- Perfil del autor: https://huggingface.co/anan19990108/models
- Repositorio de Ultralytics YOLOv8: https://github.com/ultralytics/yolov8
- Documentación de Ultralytics YOLOv8: https://docs.ultralytics.com/models/yolov8
- Página informativa de YOLOv8: https://yolov8.org/yolov8-ultralytics-real-time-computer-vision-model/
- Modelo base en Hugging Face: https://huggingface.co/Ultralytics/YOLOv8
