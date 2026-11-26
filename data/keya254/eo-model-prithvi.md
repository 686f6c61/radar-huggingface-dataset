# keya254/EO-Model-Prithvi

## Resumen

EO-Model-Prithvi es un checkpoint de ajuste fino (fine-tuning) del modelo fundacional de observacion de la Tierra Prithvi-EO-2.0-300M-TL, desarrollado por IBM y NASA, adaptado por el usuario keya254 para una tarea concreta de segmentacion semantica: la clasificacion multitemporal de cultivos. El modelo parte de los pesos preentrenados de Prithvi y anade un decodificador UperNet para producir mapas de clases de cobertura agricola a partir de imagenes satelitales HLS de 30 metros de resolucion y seis bandas.

El modelo se ha entrenado durante 30 epocas sobre el dataset publico de clasificacion de cultivos multitemporal de IBM/NASA, con tres fechas de adquisicion y 13 clases de cultivo, en una unica GPU NVIDIA A10G mediante la plataforma Modal. El resultado es un artefacto de investigacion con un rendimiento modesto (mIoU de 0,335 y F1 de 0,499 en validacion), pensado como linea base reproducible mas que como modelo listo para produccion.

Su relevancia es doble: por un lado demuestra el flujo de trabajo completo de TerraTorch para ajustar modelos fundacionales geoespaciales; por otro, sirve como referencia para comparar futuros ajustes finos sobre Prithvi-EO-2.0 en tareas de agricultura de precision. El repositorio ocupa 5,2 GB e incluye el checkpoint completo de PyTorch Lightning, los pesos en formato state_dict, la configuracion de entrenamiento resuelta y los registros de TensorBoard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (Prithvi-EO-2.0-300M-TL) con decodificador UperNet |
| Parametros totales | no disponible (el backbone de referencia es Prithvi-EO-2.0-300M, aproximadamente 300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de 3 fechas temporales, 6 bandas HLS, parches de 30 m) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision geoespacial; sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch Lightning (.ckpt) y state_dict (.ckpt) |

## Arquitectura y entrenamiento

El modelo combina el backbone Prithvi-EO-2.0-300M-TL, un transformer de vision preentrenado sobre datos de observacion de la Tierra, con un decodificador UperNet para segmentacion semantica densa. La entrada consiste en imagenes multitemporales HLS (Harmonized Landsat-Sentinel) de seis bandas y 30 metros de resolucion, con tres fechas de adquisicion por muestra, lo que permite al modelo explotar la evolucion temporal del cultivo. La salida es un mapa de 13 clases de cultivo por pixel.

El ajuste fino se realizo durante 30 epocas sobre el dataset publico de clasificacion de cultivos multitemporal de IBM/NASA, con una unica GPU NVIDIA A10G en Modal. Se dispone de la configuracion de entrenamiento resuelta en formato YAML y de los registros de TensorBoard, lo que facilita la reproducibilidad. No se documentan en la informacion disponible detalles sobre el numero de tokens de preentrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF o DPO (no aplicables a un modelo de vision de este tipo).

## Capacidades

- Segmentacion semantica densa de imagenes satelitales multitemporales HLS.
- Clasificacion de 13 clases de cultivo a nivel de pixel.
- Procesamiento de series temporales de tres fechas de adquisicion con seis bandas espectrales.
- Integracion con el ecosistema TerraTorch mediante la clase `SemanticSegmentationTask`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni soporte multilingue.
- No incluye modo thinking, vision general, audio ni otras capacidades multimodales fuera del dominio geoespacial.

## Casos de uso

- Agricultura de precision: el modelo genera mapas de clases de cultivo por pixel que permiten a las explotaciones agricolas planificar rotaciones y estimar superficies sembradas a partir de imagenes HLS de 30 m.
- Monitorizacion de superficies agricolas a escala regional: al procesar series de tres fechas, captura la evolucion fenologica del cultivo y mejora la discriminacion entre clases con firmas espectrales similares.
- Linea base para investigacion: sirve como referencia reproducible (configuracion YAML y logs de TensorBoard incluidos) para comparar nuevos ajustes finos sobre Prithvi-EO-2.0.
- Validacion de pipelines TerraTorch: util para verificar el flujo completo de carga de checkpoints, inferencia y evaluacion con `SemanticSegmentationTask.load_from_checkpoint`.
- Educacion y prototipado: el checkpoint completo y el state_dict permiten experimentar con segmentacion semantica geoespacial sin reentrenar desde cero.
- Evaluacion comparativa de decodificadores: al usar UperNet sobre un backbone fijo, permite aislar el efecto del decodificador en tareas de clasificacion de cultivos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validacion del dataset de clasificacion de cultivos multitemporal:

| Metrica | Epoca 19 | Epoca 29 |
|---|---|---|
| Loss | 1,316 | 1,242 |
| mIoU | 0,330 | 0,335 |
| F1 | 0,493 | 0,499 |
| Precision por pixel | 0,505 | 0,508 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 5,2 GB, por lo que se requiere al menos esa cantidad de memoria para cargar el checkpoint completo en CPU o GPU.
- GPU de entrenamiento utilizada: una unica NVIDIA A10G (24 GB) mediante Modal.
- GPU recomendadas: A10G, A100, H100 o RTX 4090 para inferencia y reentrenamiento; el tamano del backbone (aproximadamente 300M de parametros) sugiere que cabe en GPUs de consumo con suficiente VRAM.
- Despliegue: el modelo se carga mediante TerraTorch (`SemanticSegmentationTask.load_from_checkpoint`); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EO-Model-Prithvi (este modelo) | no disponible (backbone ~300M) | 3 fechas, 6 bandas HLS, 30 m | mIoU 0,335; F1 0,499 | Apache 2.0 | Hugging Face (keya254) |
| Prithvi-EO-2.0-300M-TL (backbone base) | ~300M | Multitemporal, multiespectral | no disponible en esta ficha | Apache 2.0 (segun IBM/NASA) | Hugging Face (IBM/NASA) |
| Prithvi-EO-2.0-600M | ~600M | Multitemporal, multiespectral | no disponible en esta ficha | Apache 2.0 (segun IBM/NASA) | Hugging Face (IBM/NASA) |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Rendimiento modesto: mIoU de 0,335 y precision por pixel de 0,508 indican que el modelo no esta listo para produccion y debe tratarse como linea base.
- Entrenado unicamente sobre el dataset de clasificacion de cultivos multitemporal de IBM/NASA; su generalizacion a otras regiones, sensores o clases no esta validada.
- Entrada restringida a tres fechas y seis bandas HLS a 30 m; no admite otras configuraciones sin reentrenamiento.
- Sin capacidades de texto ni multilingues; no es un modelo de lenguaje.
- Riesgo de sesgo hacia las clases y distribuciones presentes en el dataset de entrenamiento.
- No se documentan evaluaciones de robustez frente a nubes, sombras o cambios estacionales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- El modelo se distribuye como checkpoint de PyTorch Lightning, lo que requiere el ecosistema TerraTorch para su carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keya254/EO-Model-Prithvi
- Codigo de entrenamiento y reproduccion: https://github.com/keya254/EO-Model-Prithvi
