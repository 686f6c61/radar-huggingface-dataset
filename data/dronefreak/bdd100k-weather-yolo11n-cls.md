# dronefreak/bdd100k-weather-yolo11n-cls

## Resumen

El modelo dronefreak/bdd100k-weather-yolo11n-cls es un clasificador de imágenes basado en YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, ajustado por el usuario dronefreak sobre el dataset BDD100K Weather Classification. Su tarea es predecir una de siete condiciones meteorológicas (clear, partly cloudy, overcast, rainy, snowy, foggy, unknown) a partir de una imagen de escena de conducción. Con 1,5 millones de parámetros y una entrada de 224x224 píxeles, está diseñado para inferencia en tiempo real en hardware de borde. No es un modelo de lenguaje: no maneja contexto textual ni idiomas.

El problema que resuelve es la clasificación automática del clima en imágenes de tráfico, un paso útil para sistemas de conducción autónoma, gestión de flotas o etiquetado de datasets. El modelo se publica junto al BDD100K-Toolkit, una herramienta que estandariza la preparación del dataset, el entrenamiento y la evaluación con las mismas métricas y divisiones. Su relevancia actual radica en su bajo coste computacional (1,5 millones de parámetros) y en que ofrece un punto de partida reproducible para tareas de clasificación meteorológica en el dominio de la conducción, con métricas declaradas de 81,32% de top-1 y 62,91% de macro F1 en el split de test de 10.000 imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11n (variante de clasificación de imágenes, red neuronal convolucional) |
| Parámetros totales | 1,5 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes; no procesa secuencias de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión; no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | best.pt (PyTorch) |
| Resolución de entrada | 224x224 píxeles |
| Tarea | Clasificación de imágenes (7 clases meteorológicas) |
| Dataset de entrenamiento | dronefreak/BDD100K-Weather-Classification |

## Arquitectura y entrenamiento

La arquitectura es YOLO11n en su variante de clasificación, una red convolucional con backbone y cabeza de clasificación, diseñada por Ultralytics. El modelo parte de pesos preentrenados de Ultralytics/YOLO11 y se ajusta sobre el dataset dronefreak/BDD100K-Weather-Classification, que deriva del campo attributes.weather de BDD100K. Se trata de una tarea no oficial de 7 clases (clear, partly cloudy, overcast, rainy, snowy, foggy, unknown).

El entrenamiento se realizó durante un máximo de 50 épocas, con parada temprana de paciencia 10; se completaron 23 épocas y el mejor checkpoint (best.pt) correspondió a la época 13, seleccionado por macro F1 en el split de validación. Se usó un batch de 128, imágenes de 224x224, semilla 0 y el optimizador auto resuelto a MuSGD con lr=0.01 y momentum=0.9. No se emplearon técnicas de RLHF ni DPO, ya que no es un modelo generativo de lenguaje. La innovación principal es la aplicación de la arquitectura YOLO11, eficiente y ligera, a una tarea de clasificación meteorológica en conducción, con un toolkit reproducible.

## Capacidades

- Clasificación de imágenes en 7 clases meteorológicas: clear, partly cloudy, overcast, rainy, snowy, foggy, unknown.
- Salida de probabilidades por clase (top-1 y top-5) con puntuaciones de confianza.
- Inferencia a 224x224, adecuada para tiempo real.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión adicional, audio ni otras modalidades.
- Capacidad especial: muy bajo número de parámetros (1,5 millones), pensado para despliegue en borde.

## Casos de uso

- Clasificación meteorológica en tiempo real para vehículos autónomos: el modelo procesa imágenes de 224x224 en milisegundos y permite al sistema de percepción ajustar parámetros de conducción (velocidad, distancia de seguridad) según la condición climática detectada. Su tamaño de 1,5 millones de parámetros facilita la integración en plataformas embebidas.
- Etiquetado automático de datasets de conducción: pre-anotar la condición meteorológica en grandes volúmenes de imágenes de dashcams o cámaras de tráfico, reduciendo el coste de anotación manual. El modelo puede ejecutarse en lote sobre CPU o GPU y filtrar imágenes por clima para tareas posteriores.
- Gestión de flotas y logística: monitorizar las condiciones climáticas a lo largo de rutas a partir de cámaras de vehículos para optimizar rutas, avisar de riesgos y generar informes operativos. La clasificación en 7 clases aporta granularidad suficiente para alertas (por ejemplo, rainy o snowy).
- Vigilancia exterior y seguridad: clasificar el clima en cámaras de vigilancia para filtrar falsas alarmas, ajustar la analítica de vídeo o priorizar eventos. El bajo consumo permite desplegarlo en el propio dispositivo de cámara.
- Operaciones con drones: adaptar misiones según el clima detectado en tiempo real, con bajo consumo energético gracias al reducido número de parámetros. Es adecuado para drones con cómputo limitado.
- Monitorización agrícola: clasificar condiciones climáticas en imágenes de campo para correlacionar con el estado de los cultivos o activar sistemas de riego. La entrada de 224x224 es compatible con cámaras de bajo coste.
- Investigación en robustez de modelos: servir como baseline ligero para estudiar el impacto del clima en tareas de visión por computador, comparando su rendimiento con arquitecturas mayores en el mismo split.
- Análisis de datos de tráfico: enriquecer registros de tráfico con etiquetas climáticas para estudios de accidentalidad o de flujo vehicular. La clasificación automática permite procesar miles de imágenes sin intervención humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas). Evaluación en el split test de 10.000 imágenes.

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 81,32% |
| Top-5 accuracy | 99,81% |
| Macro F1 | 62,91% |
| Balanced accuracy | 61,19% |
| Macro precision | 65,68% |
| Macro recall | 61,19% |

### Resultados por clase

| Clase | Precisión | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| clear | 89,06% | 92,70% | 90,84% | 5346 |
| foggy | 0,00% | 0,00% | 0,00% | 13 |
| overcast | 64,65% | 69,81% | 67,13% | 1239 |
| partly cloudy | 67,63% | 60,30% | 63,75% | 738 |
| rainy | 89,59% | 61,79% | 73,14% | 738 |
| snowy | 78,44% | 65,28% | 71,26% | 769 |
| unknown | 70,39% | 78,48% | 74,21% | 1157 |

### Comparativa del model zoo (mismo split test, 224x224)

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| ConvNeXt-Atto | 83,00% | 67,44% | 65,25% | 81,38% |
| EfficientViT-B0 | 82,79% | 65,10% | 63,62% | 67,11% |
| ResNet-18 | 82,19% | 64,30% | 62,97% | 66,08% |
| MobileNetV4-Conv-Small | 82,16% | 66,51% | 64,37% | 80,44% |
| YOLO26n | 82,04% | 64,09% | 62,46% | 66,57% |
| **YOLO11n** | **81,32%** | **62,91%** | **61,19%** | **65,68%** |
| YOLOv8n | 81,22% | 63,07% | 61,42% | 65,52% |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 6 MB en FP32 y 3 MB en FP16; la inferencia cabe holgadamente en menos de 1 GB incluso con lotes moderados.
- GPU recomendadas: cualquier GPU, incluidas integradas. Es adecuado para NVIDIA Jetson, Raspberry Pi con acelerador, teléfonos móviles (si se exporta) y CPU.
- Cabe en cualquier GPU consumer: RTX 4090, RTX 3060, GTX 1650, etc., y también en CPU sin aceleración.
- Opciones de despliegue: Ultralytics (PyTorch) de forma nativa; el framework Ultralytics permite exportar a formatos como ONNX, TensorRT, OpenVINO, TFLite y CoreML, aunque la model card no incluye archivos preconvertidos.
- Latencia y throughput: no se han publicado medidas. Por el reducido número de parámetros y la entrada de 224x224, se espera una latencia muy baja en hardware moderno, apta para tiempo real, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

La siguiente tabla compara el modelo con alternativas de la misma categoría (clasificación de imágenes meteorológicas en BDD100K) según los datos del model zoo proporcionado por el autor. No se dispone de datos de parámetros, licencia o contexto para los otros modelos en la información proporcionada. Todos fueron evaluados en el mismo split test de 10.000 imágenes con entrada de 224x224.

| Modelo | Parámetros | Top-1 | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n (este modelo) | 1,5 millones | 81,32% | 62,91% | AGPL-3.0 | HuggingFace |
| ConvNeXt-Atto | no disponible | 83,00% | 67,44% | no disponible | HuggingFace (model zoo) |
| EfficientViT-B0 | no disponible | 82,79% | 65,10% | no disponible | HuggingFace (model zoo) |
| ResNet-18 | no disponible | 82,19% | 64,30% | no disponible | HuggingFace (model zoo) |
| MobileNetV4-Conv-Small | no disponible | 82,16% | 66,51% | no disponible | HuggingFace (model zoo) |
| YOLO26n | no disponible | 82,04% | 64,09% | no disponible | HuggingFace (model zoo) |
| YOLOv8n | no disponible | 81,22% | 63,07% | no disponible | HuggingFace (model zoo) |

El modelo se sitúa en la parte media-baja de la comparativa: ConvNeXt-Atto lidera en top-1 (83,00%) y macro precisión (81,38%), mientras que YOLO11n queda sexto de siete en top-1 y macro F1. EfficientViT-B0 y ResNet-18 superan ligeramente a YOLO11n en top-1. YOLOv8n queda por debajo en top-1 pero con macro F1 ligeramente superior. YOLO26n supera a YOLO11n en top-1 y macro F1.

## Limitaciones y advertencias

- Clase foggy no soportada: el modelo clasifica correctamente 0 de las 13 imágenes de test de la clase foggy, con precisión y recall del 0,00%. Debe tratarse como no soportada.
- Fuerte desbalance de clases: clear tiene 5346 imágenes de test frente a 13 de foggy, lo que sesga el modelo hacia la clase clear y explica la diferencia entre top-1 (81,32%) y macro F1 (62,91%).
- Rendimiento desigual por clase: mientras clear alcanza un F1 de 90,84%, partly cloudy se queda en 63,75% y overcast en 67,13%. La precisión y el recall varían notablemente entre clases.
- Top-5 muy alto (99,81%) frente a top-1 moderado (81,32%): el modelo a menudo incluye la clase correcta entre las cinco más probables, pero no como primera opción. Esto limita su uso en decisiones automáticas que requieren alta confianza.
- Clase unknown: agrupa condiciones no cubiertas explícitamente y puede solaparse con otras clases, introduciendo ambigüedad.
- Sesgos del dataset: BDD100K está recopilado principalmente en Estados Unidos, por lo que el modelo puede generalizar peor a otras regiones, condiciones de iluminación o cámaras.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Cualquier versión modificada o servicio ofrecido a través de red debe liberar el código fuente bajo la misma licencia. Para uso en productos propietarios puede ser necesario adquirir una licencia comercial de Ultralytics.
- No es un modelo generativo: no alucina texto, pero puede clasificar erróneamente imágenes fuera de su dominio de entrenamiento.
- No procesa texto ni idiomas: cualquier aplicación que requiera comprensión lingüística debe combinarse con otro modelo.
- Métricas no verificadas: el model-index indica verified: false para todas las métricas. No se han publicado resultados en otros datasets, por lo que la generalización a dominios distintos de BDD100K no está cuantificada.
- Model card truncada: la información proporcionada se corta en la sección "## Limitatio", por lo que podrían existir limitaciones adicionales no listadas aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-weather-yolo11n-cls
- Dataset BDD100K Weather Classification: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Modelo base Ultralytics/YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Paper YOLO11 (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Paper BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Weather-Robust Object Detection on BDD100K (GitHub): https://github.com/pallavdwivedi/Weather-Robust-Object-Detection-on-BDD100K
- Post en HuggingFace de dronefreak: https://huggingface.co/posts/dronefreak/988753800362571
- Colección BDD100K Object Detection Model Zoo: https://huggingface.co/collections/dronefreak/bdd100k-object-detection-model-zoo
- SysCV/bdd100k-models: https://github.com/SysCV/bdd100k-models
- Berkeley DeepDrive: http://bdd-data.berkeley.edu/
