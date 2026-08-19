# Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold2

## Resumen

El modelo `Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold2` es un checkpoint de segmentación semántica basado en la arquitectura SegFormer-B0, entrenado específicamente para la clasificación de usos del suelo en el valle de Katmandú (Nepal). El autor, Pranilllllll, ha adaptado el modelo preentrenado `nvidia/segformer-b0-finetuned-ade-512-512` de HuggingFace a un dataset propio con seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo se ha entrenado con una estrategia de división en bloques (block split) y corresponde al segundo de tres pliegues (fold 2 de 3), con una semilla fija de 42.

Este checkpoint está diseñado para tareas de teledetección y análisis geoespacial, donde la segmentación semántica de imágenes satelitales o aéreas es esencial para la planificación urbana, la gestión de recursos naturales y el monitoreo ambiental. El modelo utiliza una entrada de 512x512 píxeles con normalización ImageNet y una resolución efectiva de 0,586 metros por píxel. Aunque el rendimiento en validación es bajo (mIoU de 0,0716), el modelo puede servir como punto de partida para experimentos de fine-tuning o como referencia en pipelines de segmentación remota.

La relevancia actual de este modelo radica en su aplicación a un problema concreto de clasificación de uso del suelo en una región específica, lo que lo hace útil para investigadores y desarrolladores que trabajan con datos geoespaciales de Nepal o regiones similares. Su tamaño reducido (0,1 GB) y su compatibilidad con la librería `transformers` facilitan su integración en flujos de trabajo existentes, aunque se recomienda evaluar su rendimiento antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegformerForSemanticSegmentation (basado en nvidia/segformer-b0-finetuned-ade-512-512) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

SegFormer es una arquitectura de transformer jerárquico para segmentación semántica, compuesta por un encoder jerárquico (MiT-B0) y un decoder ligero basado en MLP. El encoder extrae características multiescala mediante ventanas de atención desplazadas (shifted windows), mientras que el decoder fusiona las características de diferentes niveles para producir mapas de segmentación. El modelo base utilizado es `nvidia/segformer-b0-finetuned-ade-512-512`, que ya viene preentrenado en ADE20K.

El entrenamiento se realizó sobre un dataset de imágenes del valle de Katmandú, con división en bloques (block split) y tres pliegues; este checkpoint corresponde al fold 2. La configuración incluye una tasa de aprendizaje de 6e-05 para la cabeza y 6e-06 para el encoder, weight decay de 0,01, drop path de 0,1, suavizado de etiquetas de 0,05 y EMA (Exponential Moving Average) activado. El mejor epoch fue el 4, y los resultados de validación muestran un mIoU de 0,0716, un mF1 de 0,1212, una exactitud global (OA) de 0,2214 y un kappa de 0,0679.

No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, pero la baja métrica sugiere que el modelo está subentrenado o que el dataset presenta un desbalance severo entre clases, como se observa en los resultados por clase (la clase agrícola tiene un IoU de 0,0032).

## Capacidades

- Segmentación semántica de imágenes de teledetección: clasifica cada píxel en una de seis clases (Residential, Road, River, Forest, UnusedLand, Agricultural).
- Entrada de 512x512 píxeles con normalización ImageNet, adecuada para imágenes aéreas o satelitales con una resolución de ~0,586 m/px.
- Soporte de la librería `transformers` de HuggingFace, lo que permite su uso con la API estándar de segmentación.
- Compatibilidad con `endpoints_compatible` (según los tags), lo que sugiere que puede desplegarse en la infraestructura de inferencia de HuggingFace.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente visual.

## Casos de uso

- Mapeo de uso del suelo urbano: el modelo puede clasificar áreas residenciales, carreteras y ríos en imágenes del valle de Katmandú, útil para planificación urbana y gestión de infraestructuras. Su entrada de 512x512 permite procesar tiles de imágenes aéreas de forma eficiente.
- Monitoreo de recursos naturales: la detección de bosques y suelo no utilizado puede apoyar estudios de deforestación, erosión o cambios en la cobertura vegetal. El modelo puede integrarse en pipelines de análisis geoespacial con herramientas como GDAL o Rasterio.
- Gestión agrícola: aunque la clase agrícola tiene un rendimiento muy bajo (IoU 0,0032), el modelo podría servir como baseline para experimentos de mejora en la detección de cultivos en la región.
- Evaluación de riesgos ambientales: la segmentación de ríos y áreas residenciales puede ayudar a identificar zonas vulnerables a inundaciones o deslizamientos. El modelo puede combinarse con datos topográficos para análisis de riesgo.
- Investigación académica: como checkpoint de referencia para comparar técnicas de segmentación en datasets de teledetección con clases desbalanceadas, especialmente en el contexto de Kathmandu.
- Prototipado rápido: gracias a su tamaño reducido (0,1 GB) y compatibilidad con `transformers`, puede desplegarse en entornos con recursos limitados para pruebas de concepto antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

Los resultados de validación del modelo (fold 2) son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,0716 |
| mF1 | 0,1212 |
| Exactitud global (OA) | 0,2214 |
| Kappa | 0,0679 |

Rendimiento por clase en validación:

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,2709 | 0,4263 |
| Road | 0,0316 | 0,0613 |
| River | 0,0132 | 0,0261 |
| Forest | 0,0803 | 0,1486 |
| UnusedLand | 0,0303 | 0,0587 |
| Agricultural | 0,0032 | 0,0064 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Los valores indican un rendimiento general bajo, especialmente en clases minoritarias como Agricultural y River, lo que sugiere un fuerte desbalance de clases o una dificultad inherente en la separabilidad de las categorías.

## Requisitos de hardware

- El modelo tiene un tamaño de repo de 0,1 GB, por lo que es ligero y puede ejecutarse en hardware modesto.
- VRAM estimada: no se proporciona un valor exacto, pero para una entrada de 512x512, un SegFormer-B0 típicamente requiere menos de 2 GB de VRAM en FP32. Con cuantización (si estuviera disponible) podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU, aunque la inferencia será más lenta.
- Es compatible con la librería `transformers`, por lo que puede desplegarse con frameworks como vLLM (aunque está orientado a texto, para visión se usa más HuggingFace Inference Endpoints), TGI (no aplica a visión), o directamente con PyTorch.
- Para inferencia en producción, se puede usar la API de HuggingFace Inference Endpoints o exportar el modelo a ONNX para optimización.
- Latencia y throughput: no se han publicado datos específicos, pero en una GPU moderna (por ejemplo, T4) la inferencia de una imagen 512x512 debería completarse en menos de 100 ms.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en el mismo dataset o con la misma configuración. Sin embargo, se puede comparar con el modelo base `nvidia/segformer-b0-finetuned-ade-512-512`, que está preentrenado en ADE20K y tiene un mIoU de alrededor de 0,37 en ese dataset. La diferencia de rendimiento se debe al cambio de dominio (teledetección vs. imágenes naturales) y al pequeño tamaño del dataset de Kathmandu.

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold2 | SegFormer-B0 | no disponible | no aplica | mIoU 0,0716 (val) | no disponible |
| nvidia/segformer-b0-finetuned-ade-512-512 | SegFormer-B0 | ~3,7M (estimado) | no aplica | mIoU ~0,37 (ADE20K) | Apache 2.0 (probable) |

No hay datos suficientes para una comparativa más amplia.

## Limitaciones y advertencias

- Rendimiento muy bajo en validación (mIoU 0,0716), lo que indica que el modelo no es fiable para uso en producción sin un fine-tuning adicional o un reentrenamiento con más datos.
- Fuerte desbalance de clases: las clases Agricultural, River y Road tienen IoU inferiores a 0,05, lo que limita su utilidad práctica.
- El modelo está entrenado específicamente para el valle de Katmandú; su generalización a otras regiones geográficas es incierta y probablemente deficiente.
- No se especifica la licencia, lo que genera incertidumbre sobre el uso comercial. Se debe contactar al autor para aclarar los términos.
- No se proporcionan detalles sobre el dataset de entrenamiento (número de imágenes, distribución de clases, fuentes), lo que dificulta la reproducibilidad.
- No se incluyen pesos en formato GGUF ni cuantizaciones, lo que limita su uso en entornos con restricciones de memoria.
- El checkpoint `best.pt` contiene pesos EMA, pero no se indica si el modelo final es el EMA o el no-EMA; esto puede afectar a la reproducibilidad de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold2
- Repositorio oficial de SegFormer (NVlabs): https://github.com/NVlabs/SegFormer
- Modelo base utilizado: https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512 (referencia)
- Fold 0 del mismo autor (para comparación): https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold0
