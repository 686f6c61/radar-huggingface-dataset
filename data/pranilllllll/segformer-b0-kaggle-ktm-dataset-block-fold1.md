# Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold1

## Resumen

GeoNUSAF es un modelo de segmentación semántica de uso del suelo, resultado de un fine-tuning de SegFormer-B0 sobre imágenes de satélite del valle de Katmandú (Nepal). Desarrollado por el usuario Pranilllllll, clasifica píxeles en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo parte del checkpoint `nvidia/segformer-b0-finetuned-ade-512-512` y se ha ajustado con una estrategia de validación cruzada por bloques (fold 1 de 3), entrada de 512x512 píxeles y resolución efectiva de 0.586 m/px.

La relevancia de este modelo radica en su aplicación a la teledetección y la planificación urbana en regiones con datos limitados, donde un transformer ligero como SegFormer-B0 ofrece un equilibrio entre precisión y coste computacional. Aunque las métricas de validación son modestas (mIoU 0.24), el modelo demuestra la viabilidad de adaptar arquitecturas preentrenadas a dominios específicos con pocos datos. Es un ejemplo práctico de fine-tuning para segmentación semántica en entornos urbanos de alta densidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegformerForSemanticSegmentation (SegFormer-B0) |
| Parametros totales | no disponible (modelo base ~3.7M, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

SegFormer es un transformer jerárquico para segmentación semántica que combina un encoder MiT (Mix Transformer) con un decoder ligero basado en MLP. El encoder B0 es la variante más pequeña, diseñada para eficiencia en dispositivos con recursos limitados. El modelo se fine-tuneó a partir del checkpoint preentrenado en ADE20K, adaptándolo al dominio de teledetección.

El entrenamiento se realizó con una división de datos en bloques (block split) y validación cruzada de 3 pliegues, siendo este el fold 1. Se usó una semilla fija (42), una tasa de aprendizaje de 6e-05 para la cabeza y 6e-06 para el encoder, weight decay 0.01, drop path 0.1, label smoothing 0.05 y EMA (Exponential Moving Average) activado. La mejor época fue la 6, con las métricas de validación reportadas. No se menciona el uso de RLHF ni DPO, al ser un modelo de visión.

## Capacidades

- Segmentación semántica de uso del suelo en 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Procesamiento de imágenes de teledetección con resolución efectiva de 0.586 m/px.
- Inferencia sobre imágenes de 512x512 píxeles con normalización ImageNet.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de visión.
- Capacidad multilingüe: no aplica.

## Casos de uso

- Planificación urbana: identificación de zonas residenciales y carreteras para estudios de expansión y ordenación territorial. El modelo puede procesar ortofotos o imágenes de satélite para generar mapas de uso del suelo actualizados.
- Monitoreo ambiental: detección de bosques y ríos para evaluar la salud de ecosistemas, cambios en la cobertura vegetal o riesgos de inundación. La clase Forest muestra el mejor rendimiento (IoU 0.64), lo que la hace fiable para este fin.
- Gestión agrícola: clasificación de áreas agrícolas para estimar superficies de cultivo, planificar riegos o detectar cambios estacionales. Aunque el IoU es bajo (0.13), puede servir como entrada para análisis posteriores.
- Detección de suelo no utilizado: identificación de terrenos baldíos o degradados, útil para políticas de reutilización de suelo o estudios de desertificación.
- Cartografía para SIG: generación de capas de uso del suelo que pueden integrarse en sistemas de información geográfica para análisis espaciales.
- Evaluación de riesgos naturales: mapeo de ríos y zonas residenciales para estudios de vulnerabilidad ante inundaciones o deslizamientos, combinando la salida del modelo con datos topográficos.

## Benchmarks y rendimiento

Las métricas de validación del fold 1 se presentan a continuación. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| mIoU | 0.2408 |
| mF1 | 0.3324 |
| OA (Overall Accuracy) | 0.4226 |
| Kappa | 0.2492 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.4996 | 0.6663 |
| Road | 0.0266 | 0.0519 |
| River | 0.0170 | 0.0335 |
| Forest | 0.6407 | 0.7810 |
| UnusedLand | 0.1280 | 0.2269 |
| Agricultural | 0.1331 | 0.2349 |

## Requisitos de hardware

- Al ser un modelo pequeño (SegFormer-B0), la inferencia puede ejecutarse en GPUs consumer como una RTX 3060 o incluso en CPU con tiempos razonables para imágenes de 512x512.
- VRAM estimada: inferior a 2 GB en FP32, y menos de 1 GB con cuantización (aunque no se han publicado cuantizaciones específicas).
- Opciones de despliegue: la librería `transformers` de Hugging Face permite cargar el modelo directamente; también puede exportarse a ONNX o TensorRT para optimización.
- Latencia y throughput: no disponibles en la información proporcionada, pero por el tamaño del modelo se espera una inferencia rápida (del orden de decenas de milisegundos en GPU moderna).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de segmentación semántica en la información proporcionada. Se recomienda comparar con arquitecturas como DeepLabV3, U-Net o Swin Transformer para el mismo conjunto de datos, pero no se han publicado resultados.

## Limitaciones y advertencias

- Rendimiento muy bajo en clases minoritarias como Road (IoU 0.027) y River (IoU 0.017), lo que limita su uso en aplicaciones que requieran precisión en estas categorías.
- Posible desbalance de clases en el dataset de entrenamiento, que afecta a la capacidad de generalización.
- El modelo se ha entrenado exclusivamente con datos del valle de Katmandú; su aplicación a otras regiones geográficas puede degradar significativamente el rendimiento.
- La licencia no está especificada en la model card, por lo que se recomienda contactar con el autor antes de un uso comercial.
- No se han publicado detalles sobre el dataset de entrenamiento (número de imágenes, distribución de clases, etc.), lo que dificulta evaluar su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold1
- Repositorio oficial de SegFormer (NVIDIA): https://github.com/NVlabs/SegFormer
- Documentación de SegFormer en Hugging Face: https://huggingface.co/docs/transformers/model_doc/segformer
