# Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold2

## Resumen

El modelo `Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold2` es un fine-tuning de SegFormer-B0 para segmentación semántica de uso del suelo en el valle de Katmandú (Nepal). Desarrollado por el usuario Pranilllllll, forma parte de una serie de experimentos con diferentes splits y folds (random y block) sobre un dataset de Kaggle de teledetección. El modelo clasifica cada píxel de una imagen en una de seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola, con una resolución efectiva de 0,586 m/píxel.

La arquitectura base es SegFormer-B0, un transformer jerárquico ligero con decoder MLP, preentrenado en ADE20K y adaptado aquí a la tarea de segmentación remota. Este checkpoint corresponde al fold 2 de un split aleatorio con semilla 42, y alcanza un mIoU de validación de 0,4586. El modelo se distribuye como checkpoint de PyTorch (`best.pt` y `last.pt`) y está pensado para ser cargado con la librería `transformers` de HuggingFace.

La relevancia de este modelo radica en su aplicación práctica para planificación urbana, monitoreo ambiental y gestión de catastro en regiones con datos de observación terrestre. Al ser un modelo pequeño (SegFormer-B0), es adecuado para despliegue en entornos con recursos limitados, aunque su rendimiento en clases minoritarias como carretera y río es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegformerForSemanticSegmentation (SegFormer-B0, preentrenado en ADE20K) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512x512 píxeles (tamaño de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (best.pt, last.pt) |

## Arquitectura y entrenamiento

El modelo se basa en SegFormer, un transformer jerárquico con encoder de atención de ventana y decoder MLP ligero. La variante B0 es la más pequeña de la familia, con un número reducido de parámetros (aproximadamente 3,7 millones, aunque el dato exacto no se especifica en la ficha). El checkpoint se inicializa desde `nvidia/segformer-b0-finetuned-ade-512-512`, que ya había sido ajustado en ADE20K, y se fine-tunea en el dataset de Kaggle del valle de Katmandú.

El entrenamiento usa un split aleatorio con 3 folds, siendo este el fold 2 (semilla 42). La entrada es de 512x512 píxeles con normalización ImageNet y una resolución efectiva de 0,586 m/píxel. Se emplea una tasa de aprendizaje diferenciada: 6e-5 para la cabeza y 6e-6 para el encoder, con regularización por weight decay (0,01), drop path (0,1), suavizado de etiquetas (0,05) y EMA (Exponential Moving Average). La mejor época fue la 78, y el checkpoint `best.pt` contiene los pesos EMA, la configuración del run, el config del modelo y las métricas.

## Capacidades

- Segmentación semántica de imágenes de teledetección (uso del suelo) en 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Procesamiento de imágenes de alta resolución (512x512) con normalización ImageNet.
- Inferencia con `transformers` mediante `SegformerForSemanticSegmentation`.
- Soporte para fine-tuning adicional en otros datasets de segmentación remota.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Planificación urbana: el modelo puede identificar zonas residenciales y carreteras en imágenes aéreas, ayudando a actualizar mapas de uso del suelo en municipios del valle de Katmandú.
- Monitoreo ambiental: la detección de bosque y río permite vigilar cambios en la cobertura vegetal y cursos de agua, útil para estudios de deforestación o inundaciones.
- Gestión de catastro: la clasificación de suelo no utilizado y agrícola facilita la actualización de registros de propiedad y usos agrarios.
- Análisis de crecimiento urbano: comparando predicciones a lo largo del tiempo, se puede cuantificar la expansión de áreas residenciales sobre suelo agrícola o no utilizado.
- Evaluación de riesgos naturales: la segmentación de ríos y zonas residenciales ayuda a identificar áreas vulnerables a inundaciones o deslizamientos.
- Investigación académica: sirve como baseline para experimentos de segmentación semántica en entornos de baja capacidad computacional, dado su tamaño reducido.

## Benchmarks y rendimiento

El modelo reporta métricas de validación en el propio checkpoint. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| mIoU | 0,4586 |
| mF1 | 0,5940 |
| OA (Overall Accuracy) | 0,7621 |
| Kappa | 0,6487 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,7875 | 0,8811 |
| Road | 0,2713 | 0,4268 |
| River | 0,1434 | 0,2508 |
| Forest | 0,6904 | 0,8169 |
| UnusedLand | 0,3321 | 0,4986 |
| Agricultural | 0,5268 | 0,6901 |

## Requisitos de hardware

- Al ser un modelo SegFormer-B0, la inferencia es ligera. Se estima que requiere menos de 2 GB de VRAM en FP32 para una entrada de 512x512, aunque este dato no está confirmado por el autor.
- Puede ejecutarse en GPUs de consumo como NVIDIA GTX 1060, RTX 2060 o superiores, e incluso en CPU con tiempos de inferencia aceptables para imágenes individuales.
- Opciones de despliegue: la librería `transformers` permite cargar el modelo directamente; también es compatible con `ONNX` o `TorchScript` si se exporta, aunque no se proporcionan archivos preconvertidos.
- No se dispone de datos de latencia o throughput medidos por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea y dataset. El autor ha publicado otros checkpoints con diferentes splits (random-fold0, block-fold0), pero no se incluyen métricas comparativas en la documentación disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos del valle de Katmandú; su generalización a otras regiones geográficas o estaciones del año es incierta.
- Las clases minoritarias (carretera y río) presentan un rendimiento bajo (IoU de 0,27 y 0,14 respectivamente), lo que limita su uso en aplicaciones que requieran precisión en estas categorías.
- La licencia no está especificada, por lo que no se garantiza el uso comercial sin autorización del autor.
- No se han documentado sesgos específicos, pero el desbalance de clases y la dependencia de la resolución efectiva (0,586 m/píxel) pueden afectar a imágenes con diferente GSD.
- El checkpoint `best.pt` contiene pesos EMA, que pueden diferir ligeramente de los pesos finales de entrenamiento; se recomienda verificar el comportamiento antes de usar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold2
- Otros folds del mismo autor: https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold0
- Repositorio oficial de SegFormer (NVlabs): https://github.com/NVlabs/SegFormer
- Dataset de Kaggle (referencia general): https://www.kaggle.com/datasets
