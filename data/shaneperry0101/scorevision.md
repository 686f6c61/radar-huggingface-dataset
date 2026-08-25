# shaneperry0101/ScoreVision

## Resumen

ScoreVision es un modelo de detección de objetos especializado en la identificación de incendios, humo y extintores, desarrollado por Shane Perry para su uso como minero en la subred SN44 (TurboVision) de la red Bittensor. Se distribuye en formato ONNX con una arquitectura YOLO26n, que incorpora una cabeza de decodificación end2end con NMS integrado en el grafo, lo que simplifica el despliegue en producción al evitar post-procesado externo.

El modelo está diseñado para ser ejecutado como parte de un sistema de inferencia distribuida en Bittensor, donde los mineros compiten por proporcionar detecciones precisas. Su entrada es una imagen estática de 704x704 píxeles, y su salida son cajas delimitadoras con clases para fuego, humo y extintores. Aunque el repositorio no incluye métricas de rendimiento ni detalles de entrenamiento, su arquitectura ligera (YOLO26n) lo hace adecuado para despliegue en entornos con recursos limitados, como CPUs o GPUs de gama baja.

La relevancia actual de este modelo radica en su integración con Bittensor, un ecosistema descentralizado de IA, y en su aplicación práctica para la detección temprana de incendios, un problema con alto impacto social y económico. Sin embargo, la falta de documentación pública sobre su entrenamiento y licencia limita su uso fuera del contexto específico de la subred.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n con cabeza end2end (NMS en grafo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato ONNX, posiblemente FP32/FP16) |
| Idiomas soportados | no disponible (no aplica, es un modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

La arquitectura se basa en YOLO26n, una variante nano de la familia YOLO, optimizada para detección de objetos en tiempo real con un bajo coste computacional. La cabeza de decodificación es end2end, lo que significa que el NMS (supresión de no máximos) está integrado dentro del grafo ONNX, eliminando la necesidad de implementar lógica de post-procesado en el código de inferencia. La entrada es una imagen estática de 704x704 píxeles, lo que fija la resolución y simplifica el pipeline.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de épocas, ni el uso de técnicas como aumento de datos o pre-entrenamiento. Tampoco se detalla si se aplicó algún esquema de fine-tuning específico para la detección de incendios. El modelo se distribuye como un archivo `model.onnx` junto con un script `miner.py` que expone la función `predict_batch`, y un archivo `chute_config.yml` para su despliegue en la plataforma Chutes.

## Capacidades

- Detección de objetos en imágenes: identifica tres clases específicas: fuego, humo y extintor.
- Inferencia end2end: el NMS está integrado en el grafo ONNX, lo que facilita la integración en pipelines sin dependencias adicionales.
- Entrada estática de 704x704 píxeles, lo que garantiza un comportamiento predecible en producción.
- Diseñado para ser ejecutado como minero en la subred SN44 de Bittensor, con un entrypoint de inferencia (`predict_batch`) listo para usar.
- Formato ONNX, compatible con múltiples runtimes (ONNX Runtime, TensorRT, etc.) y plataformas de despliegue como Chutes.

## Casos de uso

- Vigilancia de incendios forestales: el modelo puede integrarse en sistemas de cámaras en torres de observación para detectar humo o fuego en tiempo real, enviando alertas automáticas a los servicios de emergencia. Su tamaño reducido permite ejecutarlo en dispositivos perimetrales con GPUs modestas.
- Seguridad industrial: en plantas químicas o almacenes, la detección temprana de fuego o humo puede activar sistemas de extinción automática. El modelo puede procesar flujos de video de cámaras de seguridad y generar alarmas cuando se supera un umbral de confianza.
- Monitorización de extintores: la clase "extintor" permite verificar la presencia y ubicación de extintores en edificios, facilitando inspecciones de seguridad automatizadas mediante drones o robots móviles.
- Integración en plataformas de IA descentralizada: como minero en Bittensor, el modelo puede ser utilizado para proporcionar servicios de detección de incendios a la red, generando recompensas por su precisión y disponibilidad.
- Sistemas de respuesta rápida en hogares inteligentes: combinado con cámaras domésticas, puede detectar incendios en cocinas o salones y notificar a los propietarios a través de aplicaciones móviles.
- Análisis de video forense: para investigaciones posteriores a incidentes, el modelo puede ayudar a localizar el momento exacto en que apareció el fuego o el humo en grabaciones de vigilancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión (mAP), velocidad de inferencia, ni comparaciones con otros detectores de incendios. El repositorio no incluye métricas de rendimiento ni referencias a evaluaciones externas.

## Requisitos de hardware

- Al ser un modelo YOLO26n (variante nano), se estima que tiene entre 2 y 4 millones de parámetros, aunque este dato no está confirmado. Esto lo hace ejecutable en CPUs modernas y GPUs de gama baja.
- VRAM estimada: para una entrada de 704x704, el uso de memoria en FP32 podría rondar los 1-2 GB, y en FP16 menos de 1 GB. Sin embargo, estos valores son orientativos y no se basan en datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) sería suficiente. También puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes pequeños.
- Opciones de despliegue: ONNX Runtime, TensorRT, OpenVINO, o plataformas como Chutes (según el archivo `chute_config.yml`). También es compatible con frameworks como Hugging Face Optimum.
- Latencia y throughput: no disponibles. Se espera que sea rápido dado el tamaño del modelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. No hay datos de rendimiento ni de entrenamiento de ScoreVision, y no se conocen modelos equivalentes en el mismo contexto (detección de incendios con YOLO26n para Bittensor). Se podría comparar con otros detectores de incendios basados en YOLO (por ejemplo, YOLOv8 fine-tuned), pero no se dispone de métricas concretas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No se ha publicado información sobre el conjunto de datos de entrenamiento, por lo que se desconocen posibles sesgos (por ejemplo, limitaciones en condiciones de poca luz, niebla, o variaciones de color del humo).
- El modelo solo detecta tres clases (fuego, humo, extintor); no es un detector genérico de objetos.
- La entrada está fijada a 704x704 píxeles, lo que puede requerir redimensionar imágenes de otras resoluciones, con la consiguiente pérdida de detalle en objetos pequeños.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en aplicaciones comerciales.
- No hay garantías de precisión ni de idoneidad para entornos críticos de seguridad. Cualquier sistema de alerta de incendios debe validarse exhaustivamente con datos reales y contar con redundancia.
- El modelo está orientado a su uso como minero en Bittensor; su integración fuera de ese ecosistema puede requerir adaptaciones no documentadas.

## Enlaces

- [Hugging Face - shaneperry0101/ScoreVision](https://huggingface.co/shaneperry0101/ScoreVision)
- [Perfil de Hugging Face del autor](https://huggingface.co/shaneperry0101)
- [Actividad del autor en Hugging Face](https://huggingface.co/shaneperry0101/activity/all)
- [Datasets del autor](https://huggingface.co/shaneperry0101/datasets)
