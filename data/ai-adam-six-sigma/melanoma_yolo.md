# Ai-Adam-Six-Sigma/melanoma_Yolo

## Resumen

El modelo `melanoma_Yolo` es un detector de objetos de una sola clase basado en YOLOv8n (nano) que localiza lesiones cutáneas en imágenes dermoscópicas. Ha sido desarrollado por Adam Sobanski (usuario `Ai-Adam-Six-Sigma` en Hugging Face) como parte de un pipeline de análisis de melanoma compuesto por tres etapas: detección, segmentación y clasificación. Este modelo constituye la primera pasada rápida del pipeline, recortando la región de la lesión para que los modelos posteriores (U-Net y EfficientNet-B4) trabajen sobre ella.

El modelo se entrenó con los datos de ISIC 2018 Task 1, convirtiendo las máscaras de segmentación en cajas delimitadoras (bounding boxes) mediante el rectángulo envolvente de la región de la lesión. Con solo 10 épocas y un tamaño de imagen de 640 píxeles, alcanza un mAP50 de 0.977, lo que lo convierte en una herramienta eficaz para la detección preliminar de lesiones en imágenes dermatológicas. Su relevancia radica en su ligereza y rapidez, ideal para integrarse en flujos de trabajo de diagnóstico asistido por ordenador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (probablemente PyTorch, no especificado) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLOv8n, la variante más pequeña de la familia YOLOv8 de Ultralytics. Es un detector de una sola etapa basado en redes neuronales convolucionales, diseñado para equilibrar velocidad y precisión en tareas de detección de objetos. En este caso, se ha configurado para detectar una única clase (`0 = lesion`), devolviendo cajas delimitadoras alrededor de las lesiones cutáneas.

El entrenamiento se realizó sobre el conjunto de datos ISIC 2018 Task 1, que proporciona máscaras de segmentación a nivel de píxel. El autor convirtió estas máscaras en cajas delimitadoras calculando el rectángulo envolvente (mínimo y máximo de filas y columnas de la máscara umbralizada) y normalizándolas al formato YOLO (`x_center, y_center, width, height`). Se partió de los pesos preentrenados `yolov8n.pt` y se entrenó durante 10 épocas con un tamaño de imagen de 640, un batch de 16 y una GPU T4 de Kaggle. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de visión supervisado clásico.

## Capacidades

- Detección de lesiones cutáneas en imágenes dermoscópicas, devolviendo una caja delimitadora por lesión.
- Clasificación de una sola clase (`lesion`), sin distinción entre tipos de lesión.
- Integración como primer paso en un pipeline de análisis de melanoma, recortando la región de interés para modelos posteriores.
- Inferencia rápida gracias a la arquitectura YOLOv8n, adecuada para procesamiento en tiempo real o casi real.
- Entrenado específicamente con datos de ISIC 2018, por lo que su rendimiento está optimizado para ese tipo de imágenes.

## Casos de uso

- **Detección preliminar en dermatología**: el modelo puede localizar lesiones en imágenes dermoscópicas de forma automática, ayudando a los especialistas a centrar su atención en las regiones relevantes.
- **Preprocesamiento para segmentación**: al recortar la lesión, se reduce el área de trabajo para un modelo U-Net, mejorando la eficiencia y precisión de la segmentación posterior.
- **Entrada para clasificación de melanoma**: las cajas delimitadoras generadas alimentan a un clasificador EfficientNet-B4, que determina si la lesión es maligna o benigna.
- **Sistemas de triaje automatizado**: en entornos con alto volumen de imágenes, este detector puede filtrar imágenes sin lesiones o resaltar las que requieren revisión prioritaria.
- **Investigación en imagen médica**: sirve como punto de partida para experimentos con pipelines de detección-segmentación-clasificación en otros dominios.
- **Educación y formación**: puede utilizarse en entornos docentes para ilustrar técnicas de detección de objetos aplicadas a la medicina.

## Benchmarks y rendimiento

El autor reporta un mAP50 de **0.977** en el conjunto de validación de ISIC 2018 Task 1. No se proporcionan comparaciones con otros modelos ni resultados adicionales (mAP50-95, precisión, recall, etc.). Dado que no hay datos de benchmarks comparativos en la información disponible, no se incluyen tablas adicionales.

## Requisitos de hardware

- Al ser un modelo YOLOv8n, es extremadamente ligero y puede ejecutarse en CPU, aunque para inferencia a alta velocidad se recomienda una GPU.
- VRAM estimada: no disponible, pero por el tamaño del modelo (nano) se estima que requiere menos de 1 GB en FP32, y mucho menos en cuantización.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior. En la nube, una T4 es más que suficiente.
- Es compatible con consumer GPUs (RTX 3060, RTX 4090, etc.) sin problemas.
- Opciones de despliegue: al ser un modelo Ultralytics, puede ejecutarse con la librería `ultralytics` en Python, exportarse a ONNX, TensorRT o CoreML, y servirse con frameworks como TorchServe o FastAPI. También es posible convertirlo a formato OpenVINO para CPU.
- Latencia y throughput: no disponibles, pero en una GPU T4 se esperan decenas de milisegundos por imagen a 640x640.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de lesiones cutáneas con YOLO) dentro de los datos proporcionados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con datos de ISIC 2018, que provienen de fuentes específicas; puede no generalizar bien a imágenes de otras cámaras, condiciones de iluminación o poblaciones.
- Solo detecta una clase genérica de lesión, sin distinguir entre tipos (nevus, melanoma, queratosis, etc.), por lo que no es suficiente para un diagnóstico clínico.
- La conversión de máscaras a cajas delimitadoras puede introducir imprecisiones en lesiones con formas muy irregulares o múltiples regiones separadas.
- No se han publicado evaluaciones de sesgos demográficos o de tipos de piel, lo que limita su uso en entornos clínicos reales sin validación adicional.
- La licencia AGPL-3.0 implica que cualquier uso comercial o integración en servicios debe cumplir con los términos de copyleft, lo que puede ser restrictivo para aplicaciones propietarias.
- No se proporcionan pesos cuantizados ni formatos alternativos, por lo que el despliegue en dispositivos edge requiere conversión manual.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ai-Adam-Six-Sigma/melanoma_Yolo)
- [Repositorio GitHub del modelo](https://github.com/AdamSobanski/melanoma_yolo)
- [Pipeline completo (detección + segmentación + clasificación)](https://github.com/AdamSobanski/melanoma_pipline_yolo_seg_class_v2)
- [Modelo de segmentación (U-Net + EfficientNet-B0)](https://github.com/AdamSobanski/melanoma-segmentation)
- [Modelo de clasificación (EfficientNet-B4)](https://github.com/AdamSobanski/Melanoma_Classification_efficientnet_b4.git)
- [Dataset ISIC 2018 Task 1](https://challenge.isic-archive.com/data/#2018)
