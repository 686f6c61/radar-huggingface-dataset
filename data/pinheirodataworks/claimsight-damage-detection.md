# PinheiroDataworks/claimsight-damage-detection

## Resumen

ClaimSight es un clasificador binario de imágenes diseñado para el triaje de reclamaciones de seguros de automóvil. Desarrollado por PinheiroDataworks (Renan Pinheiro), el modelo recibe una fotografía de un vehículo y determina si presenta daños visibles (`00-damage`) o si está intacto (`01-whole`). No es un sistema autónomo de adjudicación de siniestros: cada predicción debe ser revisada por un humano antes de tomar cualquier decisión sobre la reclamación.

El modelo se basa en una arquitectura ResNet50 con transfer learning desde ImageNet, entrenada en dos fases (backbone congelado y ajuste fino del último bloque). El conjunto de datos de entrenamiento proviene de Car Damage Detection de Kaggle, con 2.300 imágenes etiquetadas por carpeta (sin máscaras ni bounding boxes). La relevancia actual del modelo radica en su enfoque de soporte a decisión con explicabilidad Grad-CAM, pensado para reducir la carga de revisión manual de fotos de vehículos sin daños en procesos de siniestros.

El checkpoint publicado pesa 0.1 GB y se distribuye bajo licencia MIT. El proyecto completo, código de entrenamiento y una API FastAPI están disponibles en el repositorio de GitHub.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (CNN) |
| Parametros totales | no disponible (ResNet50 típicamente ~25.6M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (checkpoint en float32) |
| Idiomas soportados | no disponible (modelo visual, sin texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (best_resnet50.pt) |

## Arquitectura y entrenamiento

El modelo usa ResNet50 preentrenado en ImageNet como backbone. El entrenamiento se realiza en dos fases: primero se congela el backbone y se entrena una nueva cabeza de clasificación, después se ajusta el último bloque residual con una tasa de aprendizaje reducida. Se emplean `ReduceLROnPlateau` y early stopping basado en la pérdida de validación. La semilla fija (`torch.manual_seed(42)`), configuraciones cuDNN deterministas y un `requirements.txt` fijado garantizan reproducibilidad.

El conjunto de datos contiene 2.300 imágenes de vehículos con etiquetas binarias de carpeta (sin máscaras ni bounding boxes), divididas en 1.840 para entrenamiento y 460 para validación, balanceadas dentro de cada división. El preprocesado usa una pipeline OpenCV determinista compartida entre entrenamiento, evaluación y servicio, eliminando el sesgo train/serve. No se emplea RLHF ni DPO; es un modelo de clasificación supervisada estándar.

## Capacidades

- Clasificación binaria de imágenes: distingue entre vehículos con daños visibles y vehículos intactos.
- Explicabilidad mediante Grad-CAM sobre la última capa convolucional, generando mapas de calor que señalan la región que más influyó en la decisión.
- Soporte para integración en pipelines de triaje de reclamaciones mediante API FastAPI.
- Transfer learning desde ImageNet, lo que permite un rendimiento razonable con un conjunto de datos moderado.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador de visión puro.

## Casos de uso

- Triaje de reclamaciones de seguros: el modelo actúa como primer filtro para descartar fotos de vehículos intactos y evitar que lleguen a la cola de revisión manual, reduciendo el coste operativo.
- Soporte a ajustadores humanos: las predicciones con umbral de 0.25 priorizan la detección de daños (recall 0.9870), asegurando que pocas reclamaciones legítimas se cierren erróneamente; los falsos positivos solo implican una revisión adicional.
- Auditoría de reclamaciones: los heatmaps de Grad-CAM permiten al personal técnico verificar visualmente qué región del vehículo motivó la decisión, facilitando la trazabilidad.
- Automatización de pre-clasificación en plataformas de siniestros: se puede integrar en un servicio web (FastAPI) para procesar imágenes subidas por los asegurados en tiempo real.
- Análisis de calidad de datos: el modelo puede usarse para detectar imágenes mal etiquetadas o ambiguas en conjuntos de datos de vehículos dañados.
- Prototipado de sistemas de visión en seguros: sirve como base para experimentar con arquitecturas más complejas o para incorporar clasificación de severidad o partes dañadas en el futuro.

## Benchmarks y rendimiento

En la división de validación retenida (460 imágenes), se reportan las siguientes métricas:

| Métrica | Valor |
|---|---|
| Accuracy de validación | 0.9435 |
| ROC-AUC (clase daño) | 0.9858 |
| Recall — clase daño (umbral 0.5) | 0.9565 |
| Precision — clase daño (umbral 0.5) | 0.9322 |
| Matriz de confusión (TN/FP/FN/TP) | 214/16/10/220 |

Se comparó con EfficientNet-B0:

| Arquitectura | Accuracy validación | ROC-AUC |
|---|---|---|
| ResNet50 (este checkpoint) | 0.9435 | 0.9858 |
| EfficientNetB0 | 0.8870 | 0.9620 |

En el punto de operación con umbral 0.25 (priorizando recall), se logra un recall de daño de 0.9870 con precisión 0.9080.

## Requisitos de hardware

- El modelo es ligero (0.1 GB) y puede ejecutarse en CPU para inferencia, aunque una GPU acelera el proceso.
- VRAM estimada: menos de 1 GB para una imagen de 224x224 en float32; cabe en cualquier GPU consumer (GTX 1060 en adelante).
- GPU recomendadas: cualquier GPU con 4 GB o más (RTX 2060, RTX 3060, etc.); no requiere A100 ni H100.
- Opciones de despliegue: PyTorch nativo, FastAPI (como en el repositorio), ONNX Runtime, o conversión a TensorRT para mayor throughput.
- Latencia: en una GPU media (p.ej. RTX 3060), la inferencia es de milisegundos (~10-30 ms por imagen); en CPU puede ser de ~100-300 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Accuracy validación | ROC-AUC | Licencia |
|---|---|---|---|---|---|
| ClaimSight (este) | ResNet50 | ~25M | 0.9435 | 0.9858 | MIT |
| EfficientNetB0 (mismo dataset) | EfficientNetB0 | ~5.3M | 0.8870 | 0.9620 | MIT |
| Otros clasificadores de daños (p.ej. modelos de Kaggle) | Variable | Variable | no disponible | no disponible | Variable |

No se encontraron modelos comparables con el mismo dataset y métricas en la información disponible; la comparación directa con EfficientNetB0 se realizó en el mismo proyecto.

## Limitaciones y advertencias

- Salida binaria únicamente: no clasifica severidad ni parte dañada del vehículo.
- Grad-CAM es localización débil, no segmentación a nivel de píxel; no hay métricas IoU/Dice porque el dataset no tiene máscaras.
- Dataset moderado (2.300 imágenes de una sola fuente), con riesgo real de domain shift frente a la distribución de fotos de un asegurador real (marcas, ángulos, iluminación, cámaras de teléfonos móviles).
- No validado como estimador de costes de reparación; es solo una señal de triaje.
- Requiere revisión humana en todos los caminos de despliegue; no debe usarse como sistema de adjudicación final.
- Riesgo de sesgos en el dataset de Kaggle (puede sobrerepresentar ciertos tipos de vehículos o daños).
- Alucinación no aplica (no es un modelo generativo), pero el Grad-CAM puede producir heatmaps que no se correspondan con la región dañada real.

## Enlaces

- Hugging Face: https://huggingface.co/PinheiroDataworks/claimsight-damage-detection
- Repositorio GitHub: https://github.com/pinheiro-dataworks/claim-sight
- Documentación del proyecto: https://pinheiro-dataworks.github.io/claim-sight/
- Perfil del autor en Hugging Face: https://huggingface.co/PinheiroDataworks
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/anujms/car-damage-detection
