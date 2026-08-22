# Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold1

## Resumen

El modelo `Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold1` es un checkpoint de segmentación semántica basado en SegFormer-B0, entrenado para clasificar el uso de suelo del valle de Katmandú (Nepal). Desarrollado por el usuario Pranilllllll, el modelo se apoya en la arquitectura `SegformerForSemanticSegmentation` de Hugging Face, inicializada desde `nvidia/segformer-b0-finetuned-ade-512-512`, y afina el encoder MiT-B0 sobre un dataset de teledetección con seis clases: Residential, Road, River, Forest, UnusedLand y Agricultural. Es un modelo ligero orientado a la observación remota, con entrada de 512x512 píxeles y un GSD efectivo de 0.586 m/px.

El checkpoint corresponde al fold 1 de un split aleatorio de 3 folds con seed 42, entrenado durante 20 épocas con regularización EMA, drop path y label smoothing. En validación alcanza un mIoU de 0.4384, una precisión global (OA) de 0.7444 y un kappa de 0.6171. La relevancia del modelo reside en su aplicabilidad directa a tareas de planificación territorial y monitorización ambiental en entornos urbanos del sur de Asia, con un coste computacional reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegformerForSemanticSegmentation (encoder MiT-B0, base nvidia/segformer-b0-finetuned-ade-512-512) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (segmentación de imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (entrada de imagen) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería transformers) |

## Arquitectura y entrenamiento

SegFormer es un modelo transformer jerárquico para segmentación semántica. El encoder MiT-B0 produce características multiescala (1/4, 1/8, 1/16 y 1/32 de la resolución original) y un decodificador MLP ligero agrega las predicciones de cada escala para generar la máscara final. Este checkpoint parte de los pesos preentrenados en ADE20K (`nvidia/segformer-b0-finetuned-ade-512-512`) y se afina sobre el dataset GeONUSAF de Katmandú, con 6 clases y `ignore_index=255`.

El entrenamiento usa una tasa de aprendizaje de 6e-05 para la cabeza de segmentación y 6e-06 para el encoder, weight decay 0.01, drop path 0.1, label smoothing 0.05 y EMA activado. La entrada se normaliza con la media y desviación de ImageNet y se procesa a 512x512 con un GSD efectivo de 0.586 m/px. El mejor epoch registrado es el 20, y el checkpoint `best.pt` contiene los pesos EMA (cuando EMA está activo), la configuración del run, el `model_config` completo de Hugging Face y las métricas de validación.

## Capacidades

- Segmentación semántica de uso de suelo en imágenes de teledetección.
- Clasificación de seis clases: Residential, Road, River, Forest, UnusedLand y Agricultural.
- Inferencia a resolución 512x512 con GSD de 0.586 m/px.
- Entrada de imagen con normalización ImageNet.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la segmentación de imágenes.

## Casos de uso

- Planificación urbana: delimitar zonas residenciales y carreteras en imágenes aéreas de Katmandú para elaborar inventarios de uso de suelo y apoyar decisiones de ordenación territorial.
- Monitorización de recursos naturales: cuantificar la cobertura forestal y la extensión de cauces fluviales (clases Forest y River) para programas de conservación.
- Análisis de crecimiento urbano: comparar segmentaciones de distintas fechas para detectar expansión residencial y pérdida de suelo agrícola.
- Gestión de riesgos de inundación: identificar zonas próximas a ríos (clase River) y delimitar áreas de riesgo para infraestructuras de defensa.
- Inventario agrario: clasificar las clases Agricultural y UnusedLand para evaluar la superficie cultivable y las tierras degradadas.
- Integración en pipelines GIS: exportar las máscaras generadas a formatos compatibles con sistemas de información geográfica (GeoTIFF, shapefile) para su análisis posterior.

## Benchmarks y rendimiento

Métricas de validación del fold 1 (split aleatorio, seed 42, epoch 20):

| Métrica | Valor |
|---|---|
| mIoU | 0.4384 |
| mF1 | 0.5697 |
| OA (overall accuracy) | 0.7444 |
| Kappa | 0.6171 |

Desglose por clase:

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.7648 | 0.8667 |
| Road | 0.2275 | 0.3706 |
| River | 0.0848 | 0.1563 |
| Forest | 0.6655 | 0.7992 |
| UnusedLand | 0.3868 | 0.5579 |
| Agricultural | 0.5012 | 0.6677 |

No se han publicado resultados en otros benchmarks (ADE20K, Cityscapes, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: dado el tamaño reducido de la arquitectura SegFormer-B0 (el modelo más pequeño de la familia) y una entrada de 512x512, la inferencia en FP32 requiere aproximadamente 1 GB de VRAM; con FP16 o cuantización INT8 se reduce a menos de 0.5 GB.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más (RTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia en tiempo real; también funciona en CPU para inferencia por lotes.
- Opciones de despliegue: se puede servir con la librería `transformers` de Hugging Face, exportar a ONNX para entornos de producción, o usar TensorRT para optimización en NVIDIA.
- Latencia y throughput: no disponible en la información proporcionada, aunque dado el tamaño del modelo se espera una latencia de decenas de milisegundos en GPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Entrada | mIoU val | Licencia |
|---|---|---|---|---|---|
| `Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold1` | no disponible (B0) | KTM (6 clases) | 512×512 | 0.4384 | no disponible |
| `Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold0` | no disponible (B0) | KTM (6 clases) | 512×512 | no disponible | no disponible |
| `nvidia/segformer-b0-finetuned-ade-512-512` | no disponible (B0) | ADE20K (150 clases) | 512×512 | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos adicionales en la información recopilada.

## Limitaciones y advertencias

- Rendimiento bajo en clases críticas: `Road` (IoU 0.2275) y `River` (IoU 0.0848) presentan valores muy bajos, lo que indica dificultades para segmentar clases lineales y estrechas.
- Sesgo geográfico: el modelo está entrenado exclusivamente con datos del valle de Katleú, por lo que su transferencia a otras regiones o entornos (rural, costero, etc.) no está garantizada.
- Riesgo de alucinación espacial: como cualquier modelo de segmentación, puede generar máscaras falsas en áreas ambiguas o con cobertura de nubes.
- Licencia no especificada: la model card no indica una licencia, lo que impide confirmar si es apto para uso comercial.
- Sin evaluación de robustez: no se han publicado análisis de sesgos, de comportamiento ante variaciones de sensor o de condiciones atmosféricas.
- Tamaño del repositorio: 0.5 GB, lo que indica que el checkpoint se distribuye en formato completo (sin cuantizar), aunque no se especifica el formato exacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold1
- Fold 0 (mismo proyecto): https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-random-fold0
- Repositorio oficial de SegFormer (NVlabs): https://github.com/NVlabs/SegFormer
