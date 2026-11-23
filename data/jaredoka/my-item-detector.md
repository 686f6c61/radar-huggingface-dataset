# jaredoka/my-item-detector

## Resumen

My Item Detector es un modelo de detección de objetos desarrollado por el usuario jaredoka como proyecto de formación en el bootcamp CodingBN (sesiones 14 y 15). Se trata de un fine-tuning del detector YOLO26n de Ultralytics, entrenado sobre un conjunto de aproximadamente 50 fotografías tomadas y etiquetadas por el propio autor mediante Roboflow. El modelo está especializado en la detección de 16 clases de flores y plantas ornamentales (african-violet, begonia, bougainvillea, brunfelsia, canna-lily, curcuma, gomphrena, heliconia, ixora, mussaenda, orchid, periwinkle, pinwheel, starcluster, wishbone y zinnia).

El modelo se publica con la etiqueta de pipeline `object-detection` y la librería `ultralytics`, lo que permite cargarlo directamente con la API de Ultralytics. Su relevancia es fundamentalmente didáctica: ilustra el flujo completo de fine-tuning de un detector YOLO con un dataset propio y mínimo, desde el etiquetado en Roboflow hasta la exportación de pesos.

No se dispone de información sobre la arquitectura interna detallada, el número de parámetros, la longitud de contexto (no aplica a un detector) ni resultados de benchmarks. El repositorio tiene un tamaño de 0.0 GB según Hugging Face, lo que sugiere que los pesos podrían no estar subidos o que el tamaño es inferior a la precisión de medida de la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 (o licencia Enterprise de Ultralytics) |
| Formato de pesos | no disponible (repo de 0.0 GB; se espera `.pt` de Ultralytics) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO26n, la variante nano de la familia YOLO26 de Ultralytics, un detector de objetos de una sola etapa basado en redes neuronales convolucionales con un cabezal de predicción densa. La variante "n" (nano) es la de menor tamaño de la familia, pensada para inferencia en tiempo real en hardware modesto.

El entrenamiento consistió en un fine-tuning sobre aproximadamente 50 fotografías tomadas por el autor con un único teléfono móvil y etiquetadas manualmente en Roboflow. El dataset cubre 16 clases de flores y plantas. No se especifica el número de épocas, la resolución de entrada, el tamaño del batch, las técnicas de aumento de datos ni si se aplicó alguna estrategia de validación. La model card incluye un marcador de posición ("add your mAP50 here") en lugar del valor real de mAP50, por lo que no se ha publicado la métrica de rendimiento del modelo.

## Capacidades

- Detección de objetos en imágenes para 16 clases concretas de flores y plantas ornamentales: african-violet, begonia, bougainvillea, brunfelsia, canna-lily, curcuma, gomphrena, heliconia, ixora, mussaenda, orchid, periwinkle, pinwheel, starcluster, wishbone y zinnia.
- Localización mediante cajas delimitadoras (bounding boxes) de las clases anteriores.
- Inferencia en tiempo real gracias a la arquitectura nano de YOLO26.
- Integración con el ecosistema Ultralytics (carga mediante `YOLO(...)`, entrenamiento, validación y exportación).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento, al no ser un modelo de lenguaje.
- No se documentan capacidades de segmentación, pose estimation ni clasificación; es exclusivamente un detector.

## Casos de uso

- Prototipado educativo de detección de objetos: sirve como ejemplo reproducible del flujo completo de fine-tuning de YOLO con un dataset propio, útil en cursos y bootcamps para demostrar el etiquetado en Roboflow y el entrenamiento con Ultralytics.
- Clasificación y conteo de flores en un entorno controlado: en la misma habitación y con la misma iluminación del dataset original, puede emplearse para inventariar o contar ejemplares de las 16 clases.
- Prueba de concepto de aplicaciones de jardinería o botánica: como base para validar la viabilidad de un detector de especies ornamentales antes de invertir en un dataset mayor.
- Generación de datasets sintéticos o aumentados: el modelo puede usarse como etiquetador preliminar para preanotar nuevas imágenes y acelerar el etiquetado manual posterior.
- Demostración de despliegue en dispositivos de borde: al tratarse de una variante nano, es adecuado para probar pipelines de inferencia en CPU o GPU de gama baja con fines didácticos.
- Benchmark interno de comparación de variantes YOLO: permite contrastar el comportamiento de YOLO26n frente a otras variantes (s, m, l) sobre el mismo dataset de flores en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un marcador de posición para el valor de mAP50 sin completar, y no se aportan métricas de precisión, recall, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por la naturaleza nano de YOLO26n, se espera un consumo bajo (típicamente por debajo de 1-2 GB en FP16), aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. La variante nano está pensada para hardware modesto, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dada la variante nano, aunque no se confirma con datos del autor.
- Opciones de despliegue: librería Ultralytics (Python), con posibilidad de exportación a formatos como ONNX o TensorRT según el ecosistema Ultralytics; no se documentan opciones específicas en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| my-item-detector (jaredoka) | YOLO26n fine-tuned | no disponible | 16 | AGPL-3.0 | Hugging Face |
| YOLO26n (Ultralytics, base) | YOLO26n | no disponible | 80 (COCO) | AGPL-3.0 / Enterprise | Ultralytics |
| YOLOv8n (Ultralytics) | YOLOv8n | no disponible | 80 (COCO) | AGPL-3.0 / Enterprise | Ultralytics |
| YOLO11n (Ultralytics) | YOLO11n | no disponible | 80 (COCO) | AGPL-3.0 / Enterprise | Ultralytics |

La comparación se limita a la familia YOLO de Ultralytics, ya que no se dispone de datos de otros detectores especializados en flores con los que contrastar. No se dispone de métricas propias del modelo para comparar rendimiento.

## Limitaciones y advertencias

- Dataset extremadamente pequeño (unas 50 imágenes) procedente de una sola habitación y un solo teléfono: el modelo fallará con alta probabilidad ante fondos, iluminaciones y objetos distintos a los del entrenamiento.
- Solo reconoce las 16 clases listadas; cualquier otro objeto se ignorará o se clasificará erróneamente.
- No se ha publicado el valor de mAP50, por lo que no existe evidencia cuantitativa de su precisión.
- Sesgos conocidos: el modelo está sesgado hacia las condiciones de captura del dataset original (un único entorno, una única cámara), lo que limita su generalización.
- Riesgo de falsos positivos y negativos elevado por la escasez de datos y la ausencia de validación documentada.
- Licencia AGPL-3.0: el uso comercial requiere cumplir con las obligaciones de copyleft de la AGPL o adquirir una licencia Enterprise de Ultralytics. El autor indica explícitamente que no es apto para uso comercial ni para aplicaciones críticas de seguridad.
- No apto para producción ni para sistemas de seguridad: el propio autor lo desaconseja.
- El repositorio tiene un tamaño de 0.0 GB, lo que podría indicar que los pesos no están efectivamente disponibles para descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaredoka/my-item-detector
- Ultralytics (framework y familia YOLO): https://github.com/ultralytics/ultralytics
- Roboflow (herramienta de etiquetado mencionada): https://roboflow.com
- CodingBN (bootcamp donde se entrenó): no disponible
