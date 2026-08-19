# bench-labs/objectmodel-v1

## Resumen

ObjectModel-v1 es un detector de objetos end-to-end, compacto y sin NMS, desarrollado por Bench Labs. Se trata de una implementación de investigación que explora si el razonamiento semántico global puede comprimirse en una pequeña memoria latente fija, mientras que la geometría precisa se recupera mediante muestreo condicionado por consultas sobre características piramidales de resolución completa. El modelo predice un conjunto fijo de objetos y se entrena con emparejamiento bipartito húngaro, similar a DETR.

Entrenado desde cero (sin pretraining) sobre COCO2017 durante 100 épocas en una sola RTX 5090, alcanza un pico de AP de 0.358 en validación (época 95). Con 40.8 millones de parámetros, es un modelo ligero y eficiente, con un throughput de 90-110 imágenes por segundo durante el entrenamiento. El autor no reclama estado del arte y presenta esta versión como un primer checkpoint de un proceso en curso; la v2 está planificada con mejoras derivadas de ablaciones y más cómputo.

La relevancia de este modelo reside en su propuesta arquitectónica: demostrar que es posible comprimir el razonamiento semántico global en una memoria latente fija sin recurrir a mecanismos de supresión de no máximos, manteniendo un tamaño reducido y una inferencia en tiempo real. No obstante, su rendimiento actual (AP 0.358) queda por debajo de la barrera de competitividad de 40-50 AP que el propio autor fijó para detectores de 20-40M parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector end-to-end sin NMS, con memoria latente fija y muestreo condicionado por consulta (arquitectura exacta no especificada) |
| Parametros totales | 40.8M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt), exportable a ONNX |

## Arquitectura y entrenamiento

ObjectModel-v1 emplea una arquitectura de detección end-to-end sin NMS. El diseño se basa en dos ideas clave: una memoria latente fija que comprime el razonamiento semántico global de la escena, y un mecanismo de muestreo condicionado por consultas que recupera la geometría precisa a partir de características piramidales de resolución completa. El modelo predice un conjunto fijo de objetos y se entrena con emparejamiento bipartito húngaro, lo que elimina la necesidad de anclas y de supresión de no máximos.

El entrenamiento se realizó desde cero, sin pretraining, sobre el conjunto de datos COCO2017 durante 100 épocas completas en una única RTX 5090. La pérdida de entrenamiento descendió de 15.77 (época 1) a 4.11 (época final). No se realizó búsqueda de hiperparámetros entre semillas ni se ejecutaron las ablaciones planificadas; es un único run de una sola semilla. El autor indica que la v2 incorporará cambios derivados de estas ablaciones y de un mayor cómputo.

## Capacidades

- Detección de objetos en imágenes, prediciendo un conjunto fijo de objetos sin supresión de no máximos (NMS-free).
- Entrenado con emparejamiento bipartito húngaro, similar a DETR, lo que permite una decodificación directa de cajas y clases.
- Exportación a ONNX implementada, lo que facilita el despliegue en entornos de inferencia optimizados.
- Integrable con trackers externos (por ejemplo, SORT) para seguimiento de objetos en video, aunque el modelo en sí no tiene componente temporal.
- Diseñado para ser compacto y eficiente: 40.8M parámetros y un throughput de ~90-110 imágenes por segundo en RTX 5090 durante entrenamiento.
- Inferencia de un solo frame a 30.7 ms (32.5 FPS) en batch 1 y modo eager, también en RTX 5090.

## Casos de uso

- Detección de objetos en fotografía de producto: el modelo puede localizar y clasificar múltiples objetos en una imagen fija, como se muestra en los ejemplos de bandejas de postres o botellas. Su tamaño compacto permite integrarlo en pipelines de procesamiento de imágenes sin requerir hardware especializado.
- Seguimiento de objetos en vídeo: combinado con un tracker SORT (proporcionado en el repositorio), permite etiquetar y seguir personas u objetos a lo largo de secuencias de vídeo, como se demuestra en el demo de seguimiento peatonal. Cada frame se detecta de forma independiente y el tracker asocia las detecciones temporalmente.
- Análisis de escenas urbanas: detección de personas, vehículos y elementos de mobiliario urbano en imágenes de cámaras de vigilancia o tráfico. El modelo maneja bien objetos de tamaño medio y grande (AP 0.387 y 0.493 respectivamente), lo que lo hace adecuado para escenas con objetos dominantes.
- Control de calidad en manufactura: localización de piezas o defectos en imágenes de líneas de producción. La ausencia de NMS simplifica la integración en sistemas de visión industrial que requieren una salida determinista y sin parámetros de umbral adicionales.
- Robótica y automatización: detección de objetos para tareas de manipulación o navegación en entornos controlados. La baja latencia (30.7 ms por frame) permite su uso en bucles de control de baja frecuencia.
- Investigación académica: como base para experimentos sobre arquitecturas de detección sin NMS, memoria latente o muestreo piramidal. El código y los pesos están disponibles bajo licencia Apache-2.0, lo que facilita la reproducibilidad y la extensión.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al checkpoint final (época 100) y al mejor checkpoint (época 95) sobre COCO val2017, según la model card. No se proporcionan comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Pico val AP (IoU 0.50:0.95) | 0.358 (época 95) |
| Val AP final (época 100) | 0.356 |
| Val AP50 | 0.544 |
| Val AP75 | 0.381 |
| Val AP small | 0.188 |
| Val AP medium | 0.387 |
| Val AP large | 0.493 |
| Val AR@100 | 0.573 |
| Pérdida de entrenamiento final | 4.11 |
| Throughput entrenamiento | ~90-110 img/s (batch 32, RTX 5090) |
| Inferencia single-frame | 30.7 ms / 32.5 FPS (batch 1, eager, RTX 5090) |

El autor indica que estos resultados están por debajo de la barrera de 40-50 AP que se había fijado como objetivo competitivo frente a detectores de 20-40M parámetros en tiempo real. No se presentan como una reclamación de estado del arte, sino como un primer checkpoint de un proceso de investigación.

## Requisitos de hardware

- Entrenamiento: realizado en una única RTX 5090 (no se especifica VRAM exacta). El throughput de entrenamiento fue de ~90-110 imágenes por segundo con batch 32.
- Inferencia: 30.7 ms por frame en batch 1 y modo eager sobre RTX 5090 (32.5 FPS). No se especifica VRAM consumida, pero con 40.8M parámetros, los pesos en FP32 ocupan aproximadamente 163 MB, y en FP16 unos 82 MB. Sumando activaciones y buffers, cabe en cualquier GPU moderna con al menos 4 GB de VRAM.
- GPUs recomendadas: cualquier GPU de consumo con 4 GB o más (RTX 3060, RTX 4060, etc.) puede ejecutar la inferencia sin problemas. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM para batch 32.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX para ONNX Runtime o TensorRT. No se mencionan cuantizaciones GGUF ni soporte para vLLM u Ollama, ya que es un modelo de visión y no un LLM.
- Latencia y throughput: en RTX 5090, la inferencia es de ~32 FPS en batch 1. Para despliegues en tiempo real con múltiples cámaras, se puede usar batch > 1 o exportación a TensorRT para mejorar el rendimiento.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros detectores en la información proporcionada. El autor menciona que el rendimiento (AP 0.358) está por debajo de la barrera de 40-50 AP establecida como objetivo frente a detectores de 20-40M parámetros en tiempo real (por ejemplo, YOLO o DETR de tamaño similar), pero no se ofrecen números concretos de esos modelos. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenamiento desde cero, sin pretraining, y con una única semilla; no se han ejecutado ablaciones ni búsqueda de hiperparámetros, por lo que los resultados pueden no ser representativos del potencial de la arquitectura.
- Rendimiento bajo en objetos pequeños (AP small 0.188), lo que limita su uso en escenas con muchos elementos diminutos o lejanos.
- El autor no reclama estado del arte y reconoce que el AP está por debajo de la barrera competitiva de 40-50 AP.
- Puede cometer errores de clasificación, como se observa en el ejemplo del rodeo donde un animal aparece mal etiquetado.
- No tiene componente temporal; para seguimiento en vídeo se requiere un tracker externo (se incluye un SORT de ejemplo).
- No se especifican cuantizaciones (FP16, INT8, etc.) ni formatos de despliegue adicionales más allá de PyTorch y ONNX.
- La licencia Apache-2.0 permite uso comercial, pero al ser una versión de investigación sin validación exhaustiva, se recomienda evaluar su rendimiento en el dominio de aplicación antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bench-labs/objectmodel-v1
- Blog post del autor: https://huggingface.co/spaces/bench-labs/blog?post=ObjectModel-v1.html
