# Pranilllllll/geonusaf-unetformer-r18-block-fold1

## Resumen

GeoNUSAF es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por el usuario Pranilllllll y publicado en Hugging Face. Se basa en la arquitectura UNetFormer propuesta por Wang et al. (2022) en el artículo *UNetFormer: A UNet-like transformer for efficient semantic segmentation of remote sensing urban scene imagery* (ISPRS Journal of Photogrammetry and Remote Sensing). El modelo emplea un encoder ResNet-18 preentrenado en ImageNet y un decoder con atención global-local, y ha sido entrenado específicamente para clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola.

Este checkpoint concreto corresponde al *fold 1* de una validación cruzada por bloques (3 pliegues), con una división basada en un proxy de orden de exportación, no en división espacial. El modelo se distribuye como un archivo de pesos PyTorch (`best.pt`) que contiene los pesos EMA del encoder y decoder, junto con la configuración, métricas y firma de arquitectura. Es relevante para investigadores y desarrolladores que trabajan en segmentación de imágenes de satélite de alta resolución, especialmente en entornos urbanos densos, y que necesitan un modelo ligero y eficiente para inferencia en GPU de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer (encoder ResNet-18, decoder con atención global-local) |
| Parametros totales | no disponible (estimación orientativa: ~11-15 M, típico de ResNet-18 + decoder ligero) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 512x512 píxeles) |
| Tipos de cuantizacion | no disponible (checkpoint en FP32, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint `.pt` con `model_state`, `cfg`, `metrics`, `arch_sig`) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura UNetFormer, que combina un encoder ResNet-18 (preentrenado en ImageNet) con un decoder que utiliza un mecanismo de atención global-local para modelar simultáneamente información global y local en la imagen. Esta atención eficiente permite capturar dependencias de largo alcance sin el coste computacional de los transformers completos, lo que resulta adecuado para imágenes de teledetección de alta resolución. La implementación es independiente del repositorio de referencia (GeoSeg, licencia GPL-3.0), según indica la model card.

El entrenamiento se realizó sobre imágenes de 512x512 píxeles con una resolución efectiva de 0.586 m/px, normalizadas con estadísticas de ImageNet. Se usó el optimizador AdamW con *weight decay* 0.01, tasas de aprendizaje de 0.0003 para el decoder y 3e-05 para el encoder, un *warmup* de 500 pasos y un decaimiento coseno durante 120 épocas. Se aplicaron regularizaciones como EMA (factor 0.999), *label smoothing* 0.05, *drop path* 0.1 y *dropout* 0.1, además de una cabeza auxiliar con peso 0.4. El mejor rendimiento se obtuvo en la época 40, con los pesos EMA. El conjunto de datos cubre el valle de Katmandú y utiliza `ignore_index=255` para píxeles no etiquetados.

## Capacidades

- Segmentación semántica de imágenes de satélite y aéreas de alta resolución, clasificando cada píxel en una de seis clases de uso del suelo: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Inferencia sobre imágenes de 512x512 píxeles, con normalización ImageNet y resolución efectiva de 0.586 m/px.
- Modelo ligero (encoder ResNet-18) adecuado para despliegue en GPU de consumo y aplicaciones en tiempo real o casi tiempo real.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales más allá de la visión.
- No se han publicado capacidades de *zero-shot* ni de adaptación a otros dominios; el modelo está especializado en el área geográfica del valle de Katmandú.

## Casos de uso

- Mapeo de uso del suelo urbano: el modelo puede generar mapas de cobertura del suelo para planificación urbana, identificando zonas residenciales, carreteras, ríos y áreas verdes en imágenes de satélite de la región de Katmandú.
- Monitorización de cambios ambientales: al comparar predicciones de diferentes fechas, se pueden detectar variaciones en la extensión de bosques, ríos o suelo agrícola, útil para estudios de deforestación o expansión urbana.
- Gestión de riesgos naturales: la segmentación de ríos y zonas residenciales permite evaluar áreas vulnerables a inundaciones o deslizamientos, apoyando sistemas de alerta temprana.
- Agricultura de precisión: la clase agrícola puede utilizarse para delimitar parcelas de cultivo y estimar superficies sembradas, aunque la resolución de 0.586 m/px limita la detección de cultivos individuales.
- Análisis de infraestructura vial: la clase carretera, aunque con IoU bajo (0.3197), puede servir para extraer redes viales en entornos urbanos densos, complementando otros modelos específicos.
- Investigación en segmentación remota: como checkpoint de un fold de validación, es útil para reproducir experimentos, comparar estrategias de división de datos o ensamblar modelos con los otros folds (fold 0 y fold 2) para mejorar la robustez.

## Benchmarks y rendimiento

La model card reporta métricas de validación para el fold 1 (mejor época, pesos EMA):

| Metrica | Valor |
|---|---|
| mIoU | 0.4812 |
| mF1 | 0.6205 |
| Overall Accuracy (OA) | 0.7923 |
| Kappa | 0.6455 |

Rendimiento por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.8186 | 0.9003 |
| Road | 0.3197 | 0.4845 |
| River | 0.2482 | 0.3977 |
| Forest | 0.6898 | 0.8164 |
| UnusedLand | 0.2636 | 0.4172 |
| Agricultural | 0.5470 | 0.7072 |

No se han publicado comparaciones con otros modelos en la misma configuración de datos. La model card advierte que la división por bloques no es una validación espacial, por lo que estas métricas pueden sobreestimar el rendimiento en áreas no vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del modelo (ResNet-18, ~11 M de parámetros) y la entrada de 512x512, se estima un consumo de 2-4 GB en FP32 y menos de 2 GB en FP16, lo que permite ejecutarlo en GPU de consumo como RTX 3060, RTX 4060 o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660 Super, RTX 2060, RTX 3050) es suficiente para inferencia. Para entrenamiento o fine-tuning, se recomienda 8 GB o más.
- Opciones de despliegue: al ser un checkpoint PyTorch, puede cargarse directamente con `torch.load` y ejecutarse con PyTorch. También puede exportarse a ONNX o TensorRT para optimización. No se han publicado integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. En una GPU moderna, se espera una inferencia de decenas de milisegundos por imagen de 512x512, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos en el mismo conjunto de datos. Como referencia arquitectónica, UNetFormer se compara en el paper original con U-Net, DeepLabV3+ y otros modelos de segmentación remota, pero esos resultados corresponden a otros datasets (Vaihingen, Potsdam). En este repositorio solo se publica el checkpoint del fold 1, sin comparaciones con otros folds o modelos baseline. Se puede considerar que modelos como SegFormer-B0 o U-Net con ResNet-18 serían alternativas plausibles, pero no hay datos de rendimiento comparables en esta configuración.

## Limitaciones y advertencias

- Sesgo geográfico: el modelo está entrenado exclusivamente con imágenes del valle de Katmandú; su rendimiento en otras regiones o con otras condiciones atmosféricas o de sensor será probablemente inferior.
- Clases desbalanceadas: carretera, río y suelo no utilizado presentan IoU bajos (0.32, 0.25 y 0.26 respectivamente), lo que indica dificultades para segmentar estas categorías, posiblemente por su menor presencia o por confusión entre clases.
- Validación no espacial: la división por bloques usando un proxy de orden de exportación no garantiza independencia espacial entre entrenamiento y validación, por lo que las métricas reportadas pueden ser optimistas.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de usarlo en producción.
- Sin soporte para otros formatos: solo se proporciona un checkpoint PyTorch; no hay versiones cuantizadas ni exportaciones a otros formatos.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo de visión, pero puede producir errores de clasificación en píxeles ambiguos o en áreas no representadas en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-block-fold1
- Fold 0 del mismo proyecto (usuario sugam24): https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold0
- Repositorio GeoSeg (implementación de referencia de UNetFormer): https://github.com/WangLibo1995/GeoSeg
- Configuración de UNetFormer en GeoSeg: https://github.com/WangLibo1995/GeoSeg/blob/main/config/vaihingen/unetformer.py
- Documentación de UNetFormer en PaddleScience: https://paddlescience.readthedocs.io/en/latest/en/examples/unetformer/
