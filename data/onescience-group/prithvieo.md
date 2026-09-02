# OneScience-Group/PrithviEO

## Resumen

Prithvi-EO-2.0 es un modelo fundacional para datos de observación de la Tierra multi-temporales, desarrollado conjuntamente por IBM, NASA y el Jülich Supercomputing Centre. El modelo codifica series temporales multiespectrales HLS (Harmonized Landsat Sentinel-2), fechas de adquisición de las imágenes y ubicaciones geográficas en representaciones unificadas, y reconstruye parches espacio-temporales enmascarados mediante un autoencoder enmascarado (MAE). Está diseñado para tareas de clasificación, segmentación semántica, regresión y monitorización de cambios ambientales en el ámbito de la teledetección.

El modelo se entrenó con 4,2 millones de muestras globales de cuatro instantes temporales procedentes del conjunto de datos HLS de la NASA. La arquitectura combina un Transformer que codifica conjuntamente información espacial y temporal, con un MAE 3D para la reconstrucción de parches multiespectrales. IBM y NASA han publicado versiones oficiales de 100M, 300M y 600M de parámetros, además de variantes con codificaciones temporales y de ubicación (TL). Este repositorio concreto de OneScience-Group es una implementación de ingeniería independiente y reducida, no compatible con los pesos oficiales.

La relevancia actual del modelo radica en su capacidad para abordar problemas de teledetección con una única arquitectura preentrenada, eliminando la necesidad de entrenar modelos específicos para cada tarea. Su licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en entornos de producción y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Masked Autoencoder 3D |
| Parametros totales | 100M, 300M y 600M (versiones oficiales); la implementacion de este repositorio es reducida |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa 4 instantes temporales de 224x224 pixeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (etiquetas y documentacion; los datos son numericos) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio no incluye pesos; los oficiales estan en HuggingFace) |

## Arquitectura y entrenamiento

Prithvi-EO-2.0 utiliza un Transformer como codificador principal que procesa conjuntamente las dimensiones espaciales y temporales de los datos HLS. Cada muestra de entrenamiento consta de cuatro instantes temporales con seis bandas espectrales (Blue, Green, Red, Narrow NIR, SWIR1 y SWIR2), normalizadas con medias y desviaciones estandar publicadas oficialmente. El modelo integra metadatos de año, dia del año, latitud y longitud en la representacion, con soporte para eliminar aleatoriamente estos metadatos durante el entrenamiento.

El entrenamiento se realiza mediante un esquema de Masked Autoencoder (MAE) 3D, que enmascara parches espacio-temporales y aprende a reconstruirlos. El modelo fue preentrenado con 4,2 millones de muestras globales del conjunto HLS de la NASA. Las versiones oficiales incluyen variantes con codificaciones temporales y de ubicacion (TL), que añaden informacion contextual adicional. El repositorio de OneScience-Group proporciona una implementacion reducida con datos sinteticos para validar el flujo de trabajo, no representativa de la escala ni de la distribucion de los datos de entrenamiento reales.

## Capacidades

- Generacion de representaciones multi-temporales: codifica informacion espacial y temporal de cuatro instantes en una representacion unificada mediante el Transformer.
- Reconstruccion de imagenes de teledeteccion: utiliza un MAE 3D para reconstruir parches multiespectrales enmascarados.
- Modelado de metadatos espacio-temporales: integra anio, dia del anio, latitud y longitud en el proceso de codificacion.
- Clasificacion de imagenes de teledeteccion: puede adaptarse mediante fine-tuning para tareas de clasificacion de cobertura terrestre o tipos de cultivo.
- Segmentacion semantica: apto para tareas de segmentacion de imagenes satelitales.
- Regresion: puede utilizarse para estimar variables biofisicas o quimicas a partir de datos multiespectrales.
- Monitorizacion de cambios ambientales: adecuado para detectar cambios en el terreno, vegetacion o masas de agua a lo largo del tiempo.

## Casos de uso

- Respuesta ante desastres: el modelo puede analizar series temporales de imagenes satelitales para detectar inundaciones, incendios o deslizamientos de tierra, comparando instantes previos y posteriores al evento. Su capacidad multi-temporal permite identificar cambios abruptos en la superficie.
- Mapeo de cobertura terrestre: mediante fine-tuning con etiquetas locales, puede clasificar tipos de cobertura (urbano, bosque, agua, agricola) con resolucion temporal, mejorando la precision frente a clasificaciones de una sola imagen.
- Monitorizacion de cultivos: el seguimiento de la evolucion de parcelas agricolas a lo largo de la temporada permite estimar el estado fenologico, detectar estres hidrico o predecir rendimientos. La codificacion temporal es clave para capturar la dinamica del crecimiento vegetal.
- Deteccion de cambios en ecosistemas: el analisis de series temporales permite monitorizar la deforestacion, la degradacion de humedales o la expansion urbana. La reconstruccion de parches enmascarados puede emplearse para identificar anomalias.
- Estimacion de variables ambientales: mediante regresion, puede estimar parametros como temperatura superficial, humedad del suelo o concentracion de clorofila en aguas costeras a partir de las bandas multiespectrales.
- Clasificacion de tipos de cultivo a gran escala: con los 4,2 millones de muestras globales de preentrenamiento, el modelo puede adaptarse a mapas de cultivos regionales con pocos ejemplos etiquetados, reduciendo la necesidad de datos anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado (arXiv:2412.02732) puede contener evaluaciones comparativas, pero no se incluyen en la documentacion del repositorio. Se recomienda consultar la publicacion original para obtener datos de rendimiento en tareas de clasificacion, segmentacion y regresion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud, pero las versiones de 300M y 600M parametros requieren al menos 8-16 GB de VRAM en precision FP16, segun el tamano del lote y la resolucion de entrada.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o similares con al menos 16 GB de VRAM para las versiones mayores. Las versiones tiny y 100M pueden ejecutarse en GPUs de consumo con 8 GB.
- Compatibilidad con GPU de consumo: las versiones de 100M y 300M pueden ejecutarse en RTX 3080/3090/4090 con cuantizacion; la version de 600M requiere GPU profesional o cuantizacion agresiva.
- Opciones de despliegue: el repositorio proporciona scripts de entrenamiento e inferencia con PyTorch. Para despliegue en produccion, se pueden utilizar frameworks como TorchServe o convertir los pesos a formatos optimizados como ONNX o TensorRT. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware, el tamano del modelo y la resolucion de las imagenes de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prithvi-EO-2.0 (este modelo) | 100M-600M | 4 instantes temporales x 224x224 | Observacion de la Tierra multi-temporal | Apache-2.0 | HuggingFace |
| Prithvi-EO-1.0 | 100M | 1 instante | Observacion de la Tierra mono-temporal | Apache-2.0 | HuggingFace |
| Prithvi WxC | 2.3B | Variable | Meteorologia y clima | Apache-2.0 | HuggingFace |

La comparativa se limita a otros modelos de la familia Prithvi. Prithvi-EO-1.0 es el predecesor, mono-temporal, mientras que Prithvi WxC esta orientado a datos meteorologicos y climaticos, no a imagenes multiespectrales de superficie. No se dispone de informacion suficiente para comparar con otros modelos de teledeteccion como SatMAE o ScaleMAE en terminos de rendimiento.

## Limitaciones y advertencias

- La implementacion de este repositorio es una version reducida con datos sinteticos, no compatible con los pesos oficiales publicados por IBM y NASA. No debe utilizarse para tareas de produccion sin verificar la compatibilidad con los pesos oficiales.
- El modelo ha sido preentrenado exclusivamente con datos HLS de NASA, lo que puede limitar su generalizacion a otros sensores satelitales (Sentinel-1, MODIS, etc.) o a regiones con caracteristicicas espectrales muy diferentes.
- No se han publicado evaluaciones de sesgos o de comportamiento en casos limite (nubes, sombras, nieve, etc.). La calidad de las reconstrucciones puede degradarse en escenarios con alta cobertura nubosa o atmosfera turbia.
- La documentacion esta en ingles; no hay soporte multilingue para la interfaz o los scripts.
- Riesgo de alucinacion: como modelo generativo, puede producir reconstrucciones plausibles pero incorrectas en areas con datos faltantes o ruidosos. Debe validarse en cada caso de uso.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (HLS) tienen sus propias restricciones de uso que deben revisarse.
- Para entrenar las versiones de 300M o 600M se requieren recursos de computacion acelerada considerables (multi-GPU o DCU), no disponibles en equipos de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/PrithviEO
- Articulo arXiv: https://arxiv.org/abs/2412.02732
- Pesos oficiales de IBM/NASA (Prithvi-EO-2.0-300M-TL): https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL
- Perfil de OneScience-Group en HuggingFace: https://huggingface.co/OneScience-Group/models
- Modelo relacionado Prithvi WxC: https://huggingface.co/OneScience-Group/PrithviWxC
- Articulo de Prithvi WxC: https://arxiv.org/abs/2409.13598
- Noticia sobre despliegue en orbita de Prithvi Geospatial AI: https://undercodenews.com/prithvi-geospatial-ai-goes-to-space-the-first-foundation-model-deployed-in-orbit/
