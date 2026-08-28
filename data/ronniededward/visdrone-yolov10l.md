# ronniededward/visdrone-yolov10l

## Resumen

El modelo `ronniededward/visdrone-yolov10l` es un detector de objetos en imágenes aéreas, resultado de un ajuste fino (fine-tuning) del modelo base YOLOv10l sobre el conjunto de datos VisDrone2019-DET. Ha sido desarrollado por el usuario ronniededward y forma parte del denominado "VisDrone Detection Model Zoo", una colección de modelos YOLO entrenados y evaluados bajo un mismo pipeline para la detección de objetos en entornos de drone. El modelo está pensado para aplicaciones de visión por computador en las que las cámaras se encuentran a bordo de drones o vehículos aéreos no tripulados, donde los objetos aparecen en escalas pequeñas y con perspectivas cenitales o casi cenitales.

La arquitectura base, YOLOv10, es un detector de una etapa en tiempo real que introduce mejoras como la eliminación del postprocesado de supresión de no máximos (NMS) mediante una estrategia de asignación dual de etiquetas, lo que reduce la latencia y simplifica el despliegue. Con 25,9 millones de parámetros y 127,9 GFLOPs, el modelo ofrece un equilibrio razonable entre precisión y coste computacional para su uso en sistemas embebidos o en servidores con GPUs de gama media. La licencia AGPL-3.0 condiciona su uso en aplicaciones comerciales cerradas, un aspecto relevante para equipos que evalúen su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10l (detector de objetos de una etapa basado en CNN) |
| Parametros totales | 25,9 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible (probablemente formato nativo de Ultralytics, .pt) |

## Arquitectura y entrenamiento

YOLOv10l pertenece a la familia YOLOv10, un detector de objetos de una etapa que opera directamente sobre la imagen completa. Su arquitectura se basa en una red troncal (backbone) de tipo CNN con conexiones residuales y una cabeza de detección que predice cajas y clases en múltiples escalas. La innovación principal de YOLOv10 es la eliminación del postprocesado de supresión de no máximos (NMS) mediante un mecanismo de asignación dual de etiquetas durante el entrenamiento, lo que acelera la inferencia sin sacrificar precisión. El modelo base fue preentrenado en el conjunto de datos COCO y posteriormente ajustado sobre VisDrone2019-DET, un conjunto de datos específico para detección en imágenes aéreas con 10 clases de objetos (peatones, vehículos, bicicletas, etc.).

No se dispone de información detallada sobre el proceso de entrenamiento específico de este modelo (número de épocas, hiperparámetros, aumentación de datos, etc.). La model card solo indica que se evaluó sobre el conjunto de test de VisDrone con anotaciones disponibles. El modelo se distribuye a través de la librería Ultralytics, lo que facilita su carga y uso con la API estándar de dicha librería.

## Capacidades

- Detección de objetos en imágenes aéreas captadas por drones o UAV, con soporte para las 10 clases del dataset VisDrone: peatón, personas, bicicleta, coche, furgoneta, camión, triciclo, triciclo con toldo, autobús y moto (aunque la model card solo muestra métricas para 8 de ellas).
- Inferencia en tiempo real gracias a la arquitectura YOLOv10 sin NMS, adecuada para aplicaciones de vídeo y streaming.
- Integración nativa con el ecosistema Ultralytics (Python, CLI, exportación a ONNX, TensorRT, etc.).
- Capacidad de detección de objetos pequeños y densamente agrupados, típico en imágenes de drones.
- No incluye capacidades de lenguaje, tool calling ni razonamiento multimodal; es exclusivamente un modelo de visión para detección.

## Casos de uso

- Vigilancia y seguridad perimetral con drones: el modelo puede detectar vehículos y peatones en tiempo real sobre vídeo aéreo, permitiendo alertas automáticas en zonas restringidas. Su baja latencia (al no usar NMS) lo hace adecuado para procesamiento en borde con GPUs como Jetson.
- Inspección de infraestructuras lineales: en carreteras, vías férreas o líneas eléctricas, el detector identifica vehículos, maquinaria o personas cercanas a la infraestructura, ayudando a la planificación de mantenimiento y a la prevención de accidentes.
- Gestión de tráfico y movilidad urbana: desde un dron, el modelo cuenta y clasifica vehículos en intersecciones, proporcionando datos para optimizar semáforos o detectar congestiones. Las clases "coche", "furgoneta" y "camión" tienen métricas relativamente altas (mAP@50 de 75,61, 38,34 y 46,4 respectivamente).
- Agricultura de precisión: aunque las clases de VisDrone no incluyen cultivos, el modelo puede adaptarse mediante transfer learning para detectar maquinaria agrícola o animales en explotaciones extensivas, partiendo de la capacidad de detección de objetos pequeños en imágenes aéreas.
- Búsqueda y rescate: en operaciones de emergencia, el detector puede localizar personas o vehículos en imágenes de drones, priorizando zonas de interés. La clase "peatón" alcanza un mAP@50 de 33,35, suficiente para asistir a los equipos de rescate.
- Control de multitudes y eventos: el modelo puede estimar la densidad de personas en concentraciones públicas, aunque la clase "personas" tiene un mAP@50 de solo 18,71, lo que limita su fiabilidad en escenarios muy densos; se recomienda complementar con otros métodos.

## Benchmarks y rendimiento

Las métricas reportadas en la model card se calcularon sobre el conjunto de test de VisDrone2019-DET. El modelo alcanza un mAP@50 de 35,95 % y un mAP@50-95 de 21,09 %, con una precisión del 52,13 % y un recall del 38,48 %. La siguiente tabla compara el modelo con otros miembros del VisDrone Model Zoo (extraída de la model card):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv9e | 40,02 | 23,73 | 54,78 | 42,42 |
| YOLOv11x | 38,44 | 22,60 | 52,41 | 41,43 |
| YOLOv26x | 38,33 | 22,48 | 52,91 | 41,06 |
| YOLOv11l | 37,14 | 21,85 | 51,87 | 40,33 |
| YOLOv10x | 37,24 | 21,81 | 52,59 | 39,84 |
| YOLOv26l | 37,65 | 21,75 | 51,60 | 40,42 |
| YOLOv9c | 37,22 | 21,73 | 51,99 | 39,77 |
| YOLOv8x | 36,81 | 21,52 | 51,91 | 39,78 |
| YOLOv26m | 36,67 | 21,22 | 51,03 | 39,79 |
| **YOLOv10l (este modelo)** | **35,95** | **21,09** | **52,13** | **38,48** |
| YOLOv11m | 36,35 | 21,02 | 50,24 | 39,46 |
| YOLOv9m | 36,19 | 20,95 | 51,05 | 39,12 |
| YOLOv8m | 34,39 | 19,95 | 48,18 | 38,20 |
| YOLOv9s | 33,52 | 19,26 | 46,16 | 37,43 |
| YOLOv11s | 32,30 | 18,47 | 45,49 | 35,31 |
| YOLOv8s | 31,95 | 18,24 | 45,99 | 35,49 |
| YOLOv26s | 32,10 | 18,06 | 45,75 | 35,05 |
| YOLOv9t | 29,09 | 16,22 | 42,57 | 32,66 |
| YOLOv8n | 28,18 | 15,77 | 40,86 | 31,81 |
| YOLOv11n | 27,59 | 15,46 | 39,58 | 31,74 |
| YOLOv10n | 27,65 | 15,32 | 41,02 | 31,68 |
| YOLOv26n | 26,73 | 14,64 | 38,60 | 31,14 |
| rt_detr_l | 21,68 | 9,34 | 35,76 | 26,30 |

El modelo ocupa la décima posición en mAP@50 dentro del zoo, con un rendimiento inferior a las variantes más grandes (YOLOv9e, YOLOv11x, etc.) pero superior a las versiones nano y small. En cuanto al rendimiento por clase, destaca la detección de coches (mAP@50 de 75,61) y camiones (46,4), mientras que las clases de personas en grupo (18,71) y bicicletas (13,21) presentan resultados más débiles.

## Requisitos de hardware

- Con 25,9 millones de parámetros, el modelo en FP32 ocupa aproximadamente 103 MB de memoria, y en FP16 unos 52 MB. Sin embargo, el consumo real de VRAM depende del tamaño de la imagen de entrada; para imágenes de 640x640 píxeles (resolución por defecto en Ultralytics), se estima un uso de VRAM inferior a 1 GB en FP16.
- Es viable en GPUs de consumo como NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB), e incluso en tarjetas con 4 GB si se reduce la resolución o se cuantiza a INT8.
- Para procesamiento en tiempo real a 30 FPS con imágenes de alta resolución (2000x1500), se recomienda una GPU de gama media-alta como RTX 3080 o superior, o una A100 en entornos de servidor.
- El modelo se puede desplegar con la librería Ultralytics (Python y CLI), así como exportarse a ONNX, TensorRT o CoreML. También es compatible con frameworks de inferencia como vLLM (aunque no es su caso típico, ya que vLLM está orientado a modelos de lenguaje) y con herramientas como Ollama (tampoco aplicable). Para despliegue en producción, las opciones habituales son TorchServe, Triton Inference Server o simplemente la API de Ultralytics.
- La latencia en una RTX 3090 para una imagen de 640x640 es del orden de 2-4 ms por imagen, lo que permite tasas de procesamiento superiores a 250 FPS. En dispositivos embebidos como Jetson Orin Nano, la latencia aumenta a 20-30 ms por imagen.

## Comparativa con modelos similares

El modelo se compara directamente con otros detectores de la misma familia YOLO ajustados sobre VisDrone, tal como se muestra en la tabla de benchmarks. En la categoría de tamaño "large" (L), compite con YOLOv11l (mAP@50 37,14) y YOLOv26l (37,65), ambos superiores en precisión pero con un coste computacional similar. Frente a YOLOv8l, que no aparece en el zoo, no se dispone de datos. La principal ventaja de YOLOv10l es la ausencia de NMS, que reduce la latencia en comparación con YOLOv8 y YOLOv11 (que aún requieren NMS en sus versiones estándar). Sin embargo, en términos de mAP@50, YOLOv11l y YOLOv26l ofrecen alrededor de 1,2-1,7 puntos más, por lo que si la precisión es prioritaria y la latencia no es crítica, esas alternativas pueden ser mejores. Para aplicaciones con restricciones de memoria, las versiones "medium" (YOLOv11m, YOLOv26m) ofrecen un equilibrio similar con menos parámetros.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial del modelo en un servicio cerrado (sin publicar el código fuente) puede infringir la licencia. Es imprescindible revisar las implicaciones legales antes de integrarlo en productos propietarios.
- Sesgos del dataset VisDrone: las imágenes provienen de vuelos de drones en entornos urbanos y rurales de China, por lo que el modelo puede tener un rendimiento inferior en otras geografías, condiciones climáticas o altitudes de vuelo diferentes.
- Rendimiento débil en clases poco representadas: las clases "personas" (mAP@50 18,71) y "bicicleta" (13,21) presentan métricas bajas, lo que limita su uso en escenarios donde estos objetos sean críticos.
- Riesgo de alucinación en detección: como cualquier detector, puede producir falsos positivos en imágenes con patrones similares a objetos (sombras, árboles, etc.), especialmente a escalas pequeñas.
- Sin soporte para vídeo temporal: el modelo procesa imágenes individuales; no aprovecha la información temporal de secuencias de vídeo, por lo que puede perder detecciones en frames aislados.
- No se proporcionan pesos cuantizados ni versiones optimizadas para dispositivos móviles; el usuario debe realizar la conversión y calibración por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronniededward/visdrone-yolov10l
- Modelo similar de otro autor: https://huggingface.co/dronefreak/visdrone-yolov10l
- README del modelo similar: https://huggingface.co/dronefreak/visdrone-yolov10l/blob/main/README.md
- Documentación de VisDrone en el repositorio oficial de YOLOv10: https://github.com/THU-MIG/yolov10/blob/main/docs/en/datasets/detect/visdrone.md
- Configuración de la arquitectura YOLOv10l: https://github.com/magicleikai/yolo_visdrone/blob/main/ultralytics/cfg/models/v10/yolov10l.yaml
