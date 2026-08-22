# Pranilllllll/geonusaf-unetformer-r18-block-fold2

## Resumen

El modelo `geonusaf-unetformer-r18-block-fold2` es un sistema de segmentación semántica para imágenes de teledetección desarrollado por Pranilllllll dentro del proyecto GeoNUSAF, cuyo objetivo es clasificar usos del suelo en el valle de Katmandú (Nepal). Se basa en la arquitectura UNetFormer propuesta por Wang et al. (2022) en el artículo *UNetFormer: A UNet-like Transformer for Efficient Semantic Segmentation of Remote Sensing Urban Scene Imagery*, implementada de forma independiente con un encoder ResNet-18 preentrenado en ImageNet y un decoder con atención global-local. El modelo distingue seis clases de cobertura del suelo (residencial, carretera, río, bosque, suelo sin uso y agrícola) sobre imágenes de 512x512 píxeles con una resolución efectiva de 0.586 m/px.

El checkpoint publicado corresponde al pliegue 2 de una validación cruzada de tres pliegues en modo `block`, que organiza las muestras mediante un proxy de orden de exportación y no mediante división espacial. El repositorio ocupa 1.4 GB e incluye únicamente los pesos EMA del mejor epoch (epoch 23), junto con la configuración, las métricas de validación y la firma de arquitectura. Es un modelo específico para una tarea concreta de teledetección urbana, no un modelo generalista, y su relevancia radica en que permite evaluar la aplicabilidad de UNetFormer en entornos urbanos densos del sur de Asia con datos de acceso público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNetFormer con encoder ResNet-18 (timm, ImageNet) y decoder con atención global-local |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint `best.pt` con `model_state`, `cfg`, `metrics`, `arch_sig`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de UNetFormer: un encoder ligero ResNet-18 (implementado mediante timm y preentrenado en ImageNet) extrae características multiescala, mientras que un decoder basado en atención global-local modela simultáneamente información contextual global y detalles locales de la escena. Esta combinación busca equilibrar eficiencia computacional y precisión en escenas urbanas heterogéneas. El modelo se entrena sobre imágenes de 512x512 píxeles con normalización ImageNet y un GSD efectivo de 0.586 m/px.

El entrenamiento usa un esquema de optimización con AdamW (weight decay 0.01), tasas de aprendizaje de 3e-4 para el decoder y 3e-5 para el encoder, un warmup de 500 pasos y un decaimiento coseno a lo largo de 120 épocas. Se aplican regularizaciones de EMA (coeficiente 0.999), label smoothing de 0.05, drop path de 0.1 y dropout de 0.1, con una cabeza auxiliar cuya pérdida se pondera con factor 0.4. El checkpoint publicado corresponde a los pesos EMA del mejor epoch según validación (epoch 23). El split de datos es de tipo `block`, es decir, una validación cruzada por bloques secuenciales basada en un proxy de orden de exportación, no en división espacial, lo que limita la generalización espacial de las métricas reportadas.

## Capacidades

- Segmentación semántica de imágenes de teledetección en seis clases: residencial, carretera, río, vegetación, suelo sin uso y agrícola.
- Entrada de imágenes de 512x512 píxeles con normalización ImageNet y resolución efectiva de 0.586 m/px.
- Salida de mapa de píxeles con etiqueta de clase y soporte de clase ignorada (`ignore_index=255`).
- Decoder con atención global-local que combina contexto global y detalles locales.
- Implementación en PyTorch con pesos EMA, adecuada para inferencia directa sobre imágenes de satélite o UAV.
- Sin soporte de generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Cartografía de uso del suelo urbano: el modelo puede generar mapas de cobertura del suelo de Katmandu, distinguiendo zonas residenciales, carreteras y áreas verdes, útil para planificadores urbanos y administraciones locales.
- Monitorización de recursos hídricos: la clase "Río" permite delimitar cauces fluviales y sus variaciones estacionales, aunque su rendimiento es limitado (IoU de validación 0.1847), por lo que debe usarse con precaución y posible post-procesado.
- Gestión agrícola y de tierras sin uso: las clases "Agrícola" y "Suelo sin uso" facilitan la identificación de parcelas en producción y terrenos abandonados, apoyando políticas de gestión de tierras.
- Planificación de infraestructuras de transporte: la clase "Carretera" ayuda a mapear la red viaria en el valle, con un rendimiento moderado (IoU 0.3096) que puede mejorarse con fusión con datos vectoriales.
- Detección de cambios en el tiempo: al ser un modelo de segmentación por bloques, se puede aplicar sobre series temporales de imágenes para detectar cambios de uso del suelo, siempre que se respete la resolución y el preprocesado.
- Evaluación de modelos de segmentación en entornos de baja supervisión: el proyecto GeoNUSAF sirve como banco de pruebas para comparar arquitecturas de segmentación en datos de teledetección del Sur de Asia, útil para investigadores que quieran evaluar UNetFormer en contextos similares.

## Benchmarks y rendimiento

El autor reporta métricas de validación para el fold 2 (split block) en el checkpoint `best.pt`:

| Métrica | Valor |
|---|---|
| mIoU | 0.4407 |
| mF1 | 0.5780 |
| OA (overall accuracy) | 0.8304 |
| Kappa | 0.6249 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residencial | 0.8667 | 0.9286 |
| Carretera | 0.3096 | 0.4728 |
| Río | 0.1847 | 0.3119 |
| Vegetación | 0.4983 | 0.6652 |
| Suelo sin uso | 0.2341 | 0.3794 |
| Agrícola | 0.5507 | 0.7102 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La validación se realizó con un split de bloques no espacial, lo que puede sobreestimar el rendimiento en escenarios de generalización espacial real.

## Requisitos de hardware

- VRAM estimada para inferencia: con ResNet50 y entrada de 512x512, se estima un consumo de entre 1.5 y 3 GB en FP16 y entre 3 y 5 GB en FP32. No se especifica cuantización, pero el checkpoint es de precisión completa (FP32).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores; también funciona en GPUs de centro de datos como A100 o H100.
- Cabe en GPUs de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3050, RTX 3060, RTX 4060).
- Opciones de despliegue: inferencia directa con PyTorch, exportación a TorchScript u ONNX para producción, o integración en pipelines de procesamiento de imágenes con bibliotecas como rasterio o GDAL.
- Latencia y rendimiento: no se han publicado datos de latencia, pero al tratarse de un ResNet50 con entrada 512x512, se espera un throughput de decenas de imágenes por segundo en una GPU moderna (p. ej., RTX 3090).

## Comparativa con modelos similares

No se dispone de datos cuantitativos de otros modelos en la misma tarea y dataset dentro de la información proporcionada. La arquitectura UNetFormer se basa en la publicación de Wang et al. (2022), pero esta implementación es independiente y ajusta la tasa de aprendizaje de 6e-4 (paper original) a 3e-4 para alinearse con otros baselines del proyecto GeoNUSAF. Existen variantes del mismo proyecto (p. ej., `geonusaf-unetformer-r18-random-fold2`) que difieren en el tipo de split, pero no se han reportado sus métricas en esta ficha.

## Limitaciones y advertencias

- El split de validación es de tipo `block` (bloques secuenciales basados en un proxy de orden de exportación), no un split espacial, por lo que las métricas pueden no reflejar la capacidad de generalización a zonas geográficas no vistas.
- Las clases "Río" y "Suelo sin uso" presentan IoU de validación muy bajas (0.1847 y 0.2341 respectivamente), lo que indica una segmentación poco fiable en esas categorías.
- La licencia del modelo no está especificada, lo que impide garantizar su uso comercial sin riesgo legal; la referencia original (GeoSeg) es GPL-3.0, pero esta implementación es independiente.
- El modelo está entrenado exclusivamente con imágenes de Katmandu (valle), por lo que no debe aplicarse a otras regiones sin reentrenamiento o adaptación.
- No se proporcionan datos de sesgos, pero la distribución de clases es muy desigual (la clase residencial domina con IoU 0.8667), lo que puede introducir sesgos en el rendimiento de clases minoritarias.
- No se ha evaluado la alucinación (no aplica, es un modelo de visión), pero sí existe riesgo de errores de segmentación en bordes de clases y en áreas de transición.
- El tamaño del repositorio es de 1.5 GB, lo que indica que el checkpoint incluye pesos de entrenamiento, no solo inferencia optimizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-block-fold2
- Repositorio de referencia GeoSeg (UNetFormer original): https://github.com/WangLibo1995/GeoSeg
- Implementación alternativa de UNetFormer: https://github.com/whulearner/UnetFormer
- Paper UNetFormer (arXiv): https://arxiv.org/abs/2109.08937
