# airg/unet-efficientnet-b7-ltfl-mmgab-100ep-1window-ftw

## Resumen

airg/unet-efficientnet-b7-ltfl-mmgab-100ep-1window-ftw es un modelo de segmentacion semantica de imagenes de satelite orientado a la delimitacion de parcelas agricolas (field boundary delineation). Lo desarrolla el usuario airg y sigue la configuracion de tres clases del baseline oficial de Fields of the World (FTW), un proyecto de referencia para la cartografia global de limites de campos agricolas. Se trata de una variante del modelo FTW PRUE con backbone EfficientNet-b7, entrenada sobre el conjunto de datos completo de FTW.

La diferencia principal respecto al baseline reside en dos decisiones de entrenamiento: el uso de una funcion de perdida Tversky Focal con ponderacion local (locally-weighted Tversky Focal Loss, LTFL) en lugar de LogcoshDice, y una normalizacion global min-max por banda calculada con los percentiles 1 y 99 de los valores de imagen. El modelo consume un unico punto temporal por muestra, alternando entre la ventana A y la ventana B de Sentinel-2, y se entreno durante 100 epocas.

Es relevante porque aborda una tarea geoespacial concreta con metricas publicadas sobre un conjunto de validacion multinacional (20 paises de Europa, Africa y Asia), lo que permite evaluar su transferibilidad geografica. El repositorio ocupa 1,1 GB y no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con backbone EfficientNet-b7 (segmentacion semantica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repo de 1,1 GB; el autor no especifica safetensors ni otro formato) |

## Arquitectura y entrenamiento

El modelo es una U-Net encoder-decoder con backbone EfficientNet-b7, conforme a la configuracion de tres clases del baseline FTW. La entrada son imagenes multiespectrales de Sentinel-2 procesadas con una normalizacion global min-max por banda basada en los percentiles 1 y 99. El modelo trabaja con un unico punto temporal por muestra, alternando entre la ventana A y la ventana B, en lugar de combinar ambas.

El entrenamiento se realizo sobre el conjunto de datos completo de Fields of the World durante 100 epocas. La innovacion tecnica declarada es el uso de una perdida Tversky Focal con ponderacion local (LTFL) en sustitucion de LogcoshDice, disenada presumiblemente para mejorar la separacion de limites de parcelas en escenarios con fuerte desbalance de clases (bordes finos frente a interiores de campo). El autor no detalla el numero de tokens ni la composicion exacta del dataset, ni si hubo etapas de refinamiento posteriores. La configuracion exacta esta publicada en el repositorio de codigo del autor.

## Capacidades

- Segmentacion semantica de imagenes de satelite en tres clases, siguiendo el esquema del baseline FTW.
- Delimitacion de parcelas agricolas (field boundary delineation) sobre imagenes Sentinel-2 de un unico punto temporal.
- Procesamiento de imagenes multiespectrales con normalizacion por percentiles (p1-p99) por banda.
- Generalizacion geografica validada sobre 20 paises de Europa, Africa y Asia.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision por computador.
- No dispone de modo thinking, vision generativa, audio ni funcionalidades conversacionales.

## Casos de uso

- Cartografia agricola a escala regional: el modelo segmenta parcelas sobre mosaicos Sentinel-2 y permite generar capas de limites de campo para catastros o registros agrarios, apoyandose en su validacion sobre paises europeos como Espana, Francia o Alemania.
- Monitorizacion de superficies cultivadas: al delimitar parcelas de forma automatica, se puede cruzar la salida con series temporales de indices de vegetacion para estimar cambios en la superficie agraria.
- Subsidios y cumplimiento de la PAC: la delimitacion precisa de parcelas facilita la verificacion de declaraciones de superficie por parte de organismos pagadores, aunque la precision a nivel de objeto (F1 0,387) exige revision humana.
- Investigacion en teledeteccion: sirve como variante reproducible del baseline FTW para comparar el efecto de la perdida LTFL frente a LogcoshDice en la calidad de los limites.
- Integracion en pipelines de mapping en Africa: el autor publica un repositorio especifico (ftw-mappingafrica-integration) que sugiere su uso en proyectos de cartografia agraria en el continente africano.
- Analisis de fragmentacion del paisaje: la salida de segmentacion permite calcular metricas de tamano y forma de parcelas para estudios de estructura agraria.
- Generacion de datasets de entrenamiento: las predicciones pueden emplearse como preetiquetado para anotacion humana en nuevas regiones, reduciendo el coste de creacion de datos.

## Benchmarks y rendimiento

Metricas publicadas por el autor sobre el split de validacion (20 paises):

| Nivel | IoU | Precision | Recall | F1 |
|---|---|---|---|---|
| Pixel | 0,796 | 0,898 | 0,875 | 0,886 |
| Objeto | no disponible | 0,450 | 0,340 | 0,387 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; un backbone EfficientNet-b7 en una U-Net suele requerir del orden de 4-8 GB en FP16 para lotes pequenos, pero el autor no lo especifica.
- GPU recomendadas: no disponible. Por tamano del backbone, una GPU consumer de gama alta (RTX 3090/4090) seria suficiente para inferencia, pero no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si, dado el tamano del backbone, aunque no esta verificado en la informacion proporcionada.
- Opciones de despliegue: no disponible; el autor remite al codigo del repositorio ftw-mappingafrica-integration, que habria que consultar para conocer el stack exacto (probablemente PyTorch).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| airg/unet-efficientnet-b7-ltfl-mmgab-100ep-1window-ftw | U-Net + EfficientNet-b7, perdida LTFL | 1 punto temporal Sentinel-2 | IoU pixel 0,796; F1 objeto 0,387 | CC-BY-4.0 | Hugging Face |
| FTW PRUE (baseline) | U-Net + EfficientNet-b7, perdida LogcoshDice | 1 punto temporal Sentinel-2 | no disponible en esta ficha | no disponible | GitHub fieldsoftheworld |
| FTW baseline (3 clases) | U-Net, configuracion estandar FTW | 1-2 puntos temporales | no disponible en esta ficha | no disponible | GitHub fieldsoftheworld |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Precision a nivel de objeto baja: F1 de 0,387 y recall de 0,340 indican que la delimitacion individual de parcelas es fragil y requiere revision humana en produccion.
- Sesgo geografico: la validacion cubre 20 paises con predominio europeo; el rendimiento en regiones no representadas (Latinoamerica, Asia meridional, Africa subsahariana fuera de Sudafrica) es desconocido.
- Dependencia de la normalizacion: el modelo espera normalizacion global min-max con percentiles 1-99 por banda; aplicar otra normalizacion puede degradar las predicciones.
- Entrada de un solo punto temporal: no explota series temporales, lo que limita la robustez frente a nubes o estacionalidad.
- Riesgo de alucinacion de bordes: como todo modelo de segmentacion, puede generar contornos espurios en zonas urbanas, forestales o con mezcla de cultivos.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero exige citar al autor y la licencia; conviene revisar los terminos del dataset FTW subyacente.
- Sin descargas ni validacion comunitaria: el repositorio no registra uso, por lo que no hay evidencia externa de reproducibilidad.
- No apto para tareas de texto, razonamiento ni agentes: es exclusivamente un modelo de vision geoespacial.

## Enlaces

- Hugging Face: https://huggingface.co/airg/unet-efficientnet-b7-ltfl-mmgab-100ep-1window-ftw
- Codigo y configuracion del autor: https://github.com/agroimpacts/ftw-mappingafrica-integration/tree/main
- Configuracion concreta: https://github.com/agroimpacts/ftw-mappingafrica-integration/blob/main/configs/1timepoint/ftw-unet-effnb7-ltfl-sta-ep100.yaml
- Baseline FTW: https://github.com/fieldsoftheworld/ftw-baselines/tree/main
