# bsgcasa/yolov8-animal-detector

## Resumen

`bsgcasa/yolov8-animal-detector` es un modelo de detección de objetos basado en YOLOv8n, la variante nano de la familia YOLOv8 de Ultralytics. Ha sido fine-tuned por el usuario `bsgcasa` para detectar ocho clases de animales: pájaro, perro, gato, caballo, mariposa, ciervo, oveja y elefante. El entrenamiento se realizó sobre un subconjunto filtrado del dataset Open Images v7, con aproximadamente 2.500 imágenes de entrenamiento y 505 de validación.

El modelo resuelve la tarea de localizar y clasificar animales en imágenes y vídeo, lo que resulta útil en aplicaciones como monitorización de fauna, seguridad vial, ganadería o domótica. Al tratarse de una arquitectura ligera (YOLOv8n), ofrece un buen equilibrio entre precisión y velocidad, aunque el conjunto de datos de entrenamiento es reducido, lo que limita su generalización a dominios muy distintos al de las imágenes de Open Images.

No se dispone en la información proporcionada de datos sobre el número total de parámetros, la longitud de contexto (al ser un modelo de visión, este concepto no aplica) ni sobre los idiomas soportados. El modelo se distribuye bajo licencia AGPL-3.0, heredada de los pesos base de Ultralytics YOLOv8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) |
| Clases detectadas | Bird, Dog, Cat, Horse, Butterfly, Deer, Sheep, Elephant |
| Dataset de entrenamiento | Open Images v7 filtrado (~2.500 imagenes de entrenamiento, 505 de validacion) |
| Metricas de validacion | mAP50: 0,931; mAP50-95: 0,766; precision: 0,941; recall: 0,884 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de YOLOv8n, un detector de objetos de una sola etapa desarrollado por Ultralytics. La documentación proporcionada no detalla la arquitectura interna ni las innovaciones técnicas específicas del entrenamiento, más allá de indicar que se partió de los pesos base de YOLOv8n y se ajustó sobre un subconjunto filtrado de Open Images v7. El dataset de entrenamiento está compuesto por aproximadamente 2.500 imágenes, con 505 imágenes de validación. No se menciona el uso de técnicas de alineación como RLHF o DPO, que no aplican a este tipo de modelo de visión.

## Capacidades

- Detección de objetos en imágenes para ocho clases de animales: Bird, Dog, Cat, Horse, Butterfly, Deer, Sheep y Elephant.
- Inferencia en imágenes individuales o secuencias de vídeo mediante la librería Ultralytics.
- No soporta tool calling, ni razonamiento multi-step, ni generación de texto; es un modelo puramente visual.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no documentadas (no es vision-language, no procesa audio ni texto).

## Casos de uso

- Monitorización de fauna en reservas naturales: el modelo puede procesar imágenes de cámaras trampa para detectar ciervos, elefantes, ovejas, etc., permitiendo censos automatizados sin intervención humana. Su mAP50 de 0,931 sobre el conjunto de validación indica una alta precisión en condiciones similares al dataset de entrenamiento.
- Seguridad vial: integración en sistemas de cámaras de tráfico para alertar de la presencia de animales (ciervos, caballos, etc.) en la calzada. La baja latencia de YOLOv8n permite el procesamiento en tiempo real en GPUs de gama baja.
- Control de aves en aeropuertos: detección de aves en las proximidades de pistas para prevenir riesgos de colisión. La clase "Bird" está incluida, y el modelo puede desplegarse en sistemas embebidos.
- Ganadería inteligente: uso en explotaciones para contar ovejas o detectar animales en corrales. La clase "Sheep" está disponible, y el modelo puede ejecutarse en cámaras fijas.
- Domótica y vigilancia del hogar: detección de mascotas (perros, gatos) en cámaras de seguridad para notificar al propietario o evitar falsas alarmas. Las clases "Dog" y "Cat" están cubiertas.
- Fotografía de naturaleza: asistencia en tiempo real para fotógrafos mediante un dispositivo portátil, detectando mariposas, ciervos u otros animales para encuadrar la toma. El modelo es ligero y puede ejecutarse en una GPU de consumo.
- Investigación ecológica: análisis de grandes volúmenes de imágenes de campo para estudiar poblaciones de elefantes, ciervos, etc. El modelo puede integrarse en pipelines de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. Las únicas métricas disponibles son las del conjunto de validación del autor, que se muestran a continuación.

| Metrica | Resultado |
|---|---|
| mAP50 | 0,931 |
| mAP50-95 | 0,766 |
| Precision | 0,941 |
| Recall | 0,884 |

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Al tratarse de un modelo YOLOv8n, la inferencia en FP32 suele requerir menos de 1 GB de VRAM para una imagen de 640x640, pero no hay datos específicos de este fine-tuning.
- GPU recomendada: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 3050 o superior). También puede ejecutarse en CPU para inferencia por lotes o en tiempo no real.
- Opciones de despliegue: la librería Ultralytics permite cargar el modelo directamente desde el archivo `.pt`. También puede exportarse a ONNX o TensorRT para despliegue en producción. No aplican vLLM, llama.cpp, Ollama ni TGI, que son tecnologías para modelos de lenguaje.
- Latencia y throughput: no disponibles en la documentación. No obstante, YOLOv8n está diseñado para detección en tiempo real; se recomienda medir en el hardware objetivo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El modelo es un fine-tuning de YOLOv8n con un conjunto de datos pequeño, por lo que su rendimiento depende en gran medida del dominio de aplicación.

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeño (2.500 imágenes) y filtrado, lo que puede provocar sesgos hacia ciertos contextos o condiciones de iluminación.
- Solo detecta ocho clases de animales; no cubre otras especies.
- Riesgo de falsos positivos en escenas con objetos visualmente similares (por ejemplo, un caballo puede confundirse con otros animales grandes).
- Licencia AGPL-3.0: cualquier uso comercial requiere que el software derivado se publique bajo la misma licencia, lo que puede ser incompatible con aplicaciones propietarias. Además, los pesos base de Ultralytics YOLOv8 están sujetos a la misma licencia, y Ultralytics ofrece licencias comerciales separadas.
- No se proporciona información sobre sesgos de género, raza u otros, ya que es un modelo de visión y el dataset no incluye esos metadatos.
- No hay documentación sobre el rendimiento en condiciones adversas (lluvia, niebla, baja resolución).

## Enlaces

- HuggingFace: https://huggingface.co/bsgcasa/yolov8-animal-detector
- No se han encontrado enlaces adicionales relevantes en la búsqueda web.
