# camstack/camstack-models

## Resumen

CamStack Models es un repositorio espejo que agrupa modelos de terceros convertidos por la plataforma CamStack a los formatos que ejecutan sus motores de inferencia: ONNX, OpenVINO IR y CoreML. No se trata de un modelo único ni de un modelo de lenguaje, sino de una colección de modelos de visión por computador (detección de objetos, segmentación, clasificación de imágenes, extracción de características y reconocimiento de matrículas) empaquetados bajo un mismo repositorio de 8 GB. El autor es camstack y la licencia agregada es "camstack-models-collection", aunque cada carpeta conserva la licencia del modelo original.

La relevancia de este repositorio es práctica: ofrece pesos ya convertidos y, en varios casos, cuantizados a INT8 mediante NNCF de OpenVINO o reexportados a resoluciones reducidas (320×320 y 256×256), lo que facilita el despliegue en dispositivos de borde y en pipelines de inferencia en producción sin tener que repetir el proceso de conversión. Incluye variantes de YOLO26 y YOLOv9 de Ultralytics, RF-DETR de Roboflow, YuNet de OpenCV, modelos de reconocimiento de matrículas (open-lpr, fast-plate-ocr), clasificadores de animales y vehículos, y extractores de características como AuraFace, U²-Net, YAMNet y EfficientNet-Lite0.

No hay información disponible sobre parámetros totales, longitud de contexto ni idiomas soportados, ya que no es un modelo generativo de texto. La ficha se centra, por tanto, en las características verificables del repositorio y de los modelos de visión que contiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: YOLO26, YOLOv9, RF-DETR, YuNet, YOLOX, U²-Net, YAMNet, EfficientNet-Lite0, entre otros |
| Parámetros totales | no disponible (varía por modelo; hay variantes n, s, m, l y x) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, no de texto) |
| Tipos de cuantización | FP16, INT8 (OpenVINO NNCF post-training), exportaciones ONNX, OpenVINO IR y CoreML; variantes EdgeTPU en YOLOv9-s |
| Idiomas soportados | no disponible |
| Licencia | camstack-models-collection (agregada); cada carpeta conserva su licencia: AGPL-3.0, GPL-3.0, Apache-2.0, MIT, CC BY-NC 4.0 |
| Formato de pesos | ONNX, OpenVINO IR, CoreML, TFLite, EdgeTPU |

## Arquitectura y entrenamiento

El repositorio no entrena modelos desde cero: es un espejo de modelos de terceros convertidos. Cada entrada corresponde a una arquitectura distinta. En detección de objetos encontramos YOLO26 (variantes n, s, m, l y x, con exportaciones a 640, 320 y 256 píxeles, en FP16 e INT8), YOLOv9 (variantes t, s, m y c, a 320 y 640 píxeles, con versiones EdgeTPU para las variantes s) y RF-DETR-M de Roboflow, ajustado a 2 clases a resolución 576 y exportado a ONNX, OpenVINO IR y CoreML. En segmentación está YOLO26-seg (n, s, m). En detección de rostros, YuNet (versión 2023mar) de OpenCV. En reconocimiento de matrículas, los modelos open-lpr (basados en YOLOX con preentrenamiento en COCO) y fast-plate-ocr. En clasificación, un clasificador de animales entrenado con Open Images V7 y un clasificador de tipos de vehículo entrenado con el dataset de DrBimmer (CC BY-NC 4.0). En extracción de características y tareas auxiliares, AuraFace v1 de fal.ai, U²-Net, YAMNet (con etiquetas de AudioSet) y EfficientNet-Lite0 vía timm.

Las modificaciones aplicadas por CamStack incluyen, según la carpeta: conversión a ONNX, OpenVINO IR y CoreML; exportación a OpenVINO FP16; cuantización INT8 con NNCF; reexportación a resoluciones menores (320×320 y 256×256); ajuste fino (en rfdetr-package, con checkpoint .pth publicado); y edición de grafo en algunos casos. Los modelos YOLOv9-s EdgeTPU se publican como espejo byte a byte de la release original. No hay información sobre volúmenes de datos de entrenamiento, composición de datasets ni uso de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección de objetos en imágenes con YOLO26 y YOLOv9, con variantes de tamaño n a x y resoluciones de entrada de 256, 320 y 640 píxeles.
- Detección de objetos con RF-DETR-M ajustado a 2 clases a 576 píxeles, orientado a la detección de paquetes.
- Segmentación de instancias con YOLO26-seg (n, s, m).
- Detección de rostros con YuNet 2023mar.
- Reconocimiento de matrículas (detección de placa y OCR) con open-lpr y fast-plate-ocr.
- Clasificación de imágenes: clasificador de animales (Open Images V7) y clasificador de tipos de vehículo.
- Extracción de características y embeddings con AuraFace v1, EfficientNet-Lite0 y U²-Net (saliencia/segmentación).
- Clasificación de audio con YAMNet (etiquetas de AudioSet).
- Inferencia en CPU, GPU y aceleradores de borde gracias a los formatos ONNX, OpenVINO IR, CoreML, TFLite y EdgeTPU.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Vigilancia y analítica de vídeo en tiempo real: YOLO26 en variantes n o s, exportado a OpenVINO IR o CoreML, permite detección de objetos a 640 píxeles con latencia baja en CPU o GPU integrada, adecuado para cámaras IP y sistemas embebidos.
- Control de accesos y presencia: YuNet 2023mar detecta rostros en tiempo real y sirve como etapa previa a un reconocimiento facial basado en embeddings de AuraFace v1.
- Gestión de aparcamientos y peajes: la combinación de open-lpr (detección de placa) y fast-plate-ocr (lectura de caracteres) permite construir un pipeline completo de reconocimiento de matrículas en dispositivos de borde.
- Logística y trazabilidad de paquetes: rfdetr-package, ajustado a 2 clases a 576 píxeles, está pensado para detectar paquetes en cintas transportadoras o zonas de carga, con exportación a ONNX y CoreML para integrarse en estaciones de inspección.
- Clasificación de flotas y vehículos: vehicle-type-v1 clasifica tipos de vehículo en imágenes de tráfico, útil para análisis de aforo y categorización de flotas (con restricción no comercial).
- Monitorización de fauna: el clasificador de animales entrenado con Open Images V7 permite filtrar y etiquetar especies en trampas cámara o vídeos de campo.
- Segmentación para edición y análisis de imágenes: YOLO26-seg genera máscaras de instancias para tareas de recorte, conteo o medición de áreas en pipelines de visión industrial.
- Análisis de audio ambiental: YAMNet clasifica eventos sonoros con las etiquetas de AudioSet, útil en sistemas de alerta o monitorización acústica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del modelo concreto. Las variantes YOLO26n y YOLOv9t en INT8 son ligeras (del orden de decenas de MB de pesos) y pueden ejecutarse en CPU; las variantes l y x requieren GPU para latencias bajas.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tipo de modelos, son adecuadas GPU de consumo (RTX 4090, RTX 3060) y aceleradores de borde (EdgeTPU para las variantes YOLOv9-s).
- Cabe en GPU de consumo: sí, las variantes n, s y m de YOLO26 y YOLOv9, así como YuNet, fast-plate-ocr y los clasificadores, son aptas para GPU de consumo e incluso CPU.
- Opciones de despliegue: ONNX Runtime, OpenVINO Runtime (con soporte NNCF INT8), CoreML en Apple, TFLite y EdgeTPU. No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a modelos de visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Variantes | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| CamStack Models (este repo) | Colección de visión | Múltiples (YOLO26, YOLOv9, RF-DETR, YuNet, etc.) | ONNX, OpenVINO IR, CoreML, TFLite, EdgeTPU | Mixta por carpeta | Espejo convertido y cuantizado; no relicense |
| Ultralytics YOLO26 (upstream) | Detección y segmentación | n, s, m, l, x | PyTorch, ONNX, OpenVINO | AGPL-3.0 | Origen de las variantes YOLO26 del repo |
| Roboflow RF-DETR (upstream) | Detección | M y otras | PyTorch | Apache-2.0 | Origen de rfdetr-package, aquí ajustado a 2 clases |
| OpenCV YuNet (upstream) | Detección de rostros | 2023mar | ONNX | Apache-2.0 (según upstream) | Modelo ligero de referencia para rostros |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- La licencia agregada "camstack-models-collection" no unifica derechos: cada carpeta mantiene su licencia original, y algunas son copyleft fuerte (AGPL-3.0 en YOLO26 y YOLO26-seg; GPL-3.0 en la arquitectura YOLOv9) o no comercial (vehicle-type-v1, CC BY-NC 4.0). El uso comercial debe revisarse carpeta por carpeta.
- Los modelos YOLO26 y YOLO26-seg bajo AGPL-3.0 imponen obligaciones de distribución del código fuente correspondiente si se ofrecen como servicio en red.
- vehicle-type-v1 no puede usarse comercialmente según la model card.
- Los modelos están modificados respecto al upstream (conversión de formato, cuantización INT8, reexportación a menor resolución o ajuste fino), lo que puede alterar la precisión respecto a los pesos originales; no se publican métricas de degradación.
- "Unknown" en la tabla de licencias significa que no se pudo rastrear la licencia, no que sea libre de uso.
- No hay información sobre sesgos, tasas de alucinación (no aplica) ni evaluación por idioma.
- El repositorio tiene 8 GB y contiene muchos artefactos; conviene descargar solo las carpetas necesarias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/camstack/camstack-models
- Documentación de CamStack: https://camstack-docs.zentik.app
- Dataset del clasificador de vehículos: https://huggingface.co/datasets/DrBimmer/vehicle-classification
- Ultralytics (YOLO26): https://github.com/ultralytics/ultralytics
- YOLOv9 (Wang, Yeh, Liao): https://github.com/WongKinYiu/yolov9
- Roboflow RF-DETR: https://github.com/roboflow/rf-detr
- OpenCV YuNet: https://github.com/opencv/opencv_zoo
- fast-plate-ocr: https://github.com/ankandrew/fast-plate-ocr
- Open Images V7: https://storage.googleapis.com/openimages/web/index.html
- AudioSet: https://research.google.com/audioset/
- COCO: https://cocodataset.org
