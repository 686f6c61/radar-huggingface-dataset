# qualcomm/MobileSam

## Resumen

MobileSam es un modelo de segmentacion de imagenes basado en prompts (promptable segmentation) desarrollado originalmente por Meta AI Research (el repositorio de referencia es `facebookresearch/segment-anything`) y empaquetado por Qualcomm para su despliegue optimizado en dispositivos con aceleracion NPU. El modelo sigue la estela de Segment Anything Model (SAM) pero reduce drasticamente el coste computacional del codificador de imagenes, haciendolo viable en movil, PC con Snapdragon y plataformas embebidas (Dragonwing, SA/QCS de automocion e IoT).

La arquitectura es un transformer encoder-decoder: el codificador genera embeddings de la imagen y un decodificador ligero opera sobre esos embeddings para producir mascaras a partir de prompts (puntos o cajas). En esta version de Qualcomm, el checkpoint es `vit_t` (ViT tiny), con un codificador de 6,95 M de parametros y un decodificador de 6,16 M, lo que suma aproximadamente 13,1 M de parametros y unos 50 MB en float. La resolucion de entrada es 720p (720x1280).

Su relevancia actual radica en que permite segmentacion interactiva de alta calidad en el propio dispositivo (on-device), sin enviar imagenes a la nube, con latencias de decodificador de entre 2 y 9 ms en NPU segun el chipset. La licencia Apache 2.0 y la disponibilidad de artefactos preexportados en ONNX, QNN_DLC y TFLITE facilitan su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (ViT tiny + decodificador ligero de mascaras) |
| Parametros totales | ~13,1 M (6,95 M encoder + 6,16 M decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 720x1280) |
| Tipos de cuantizacion | float (los artefactos publicados son float; exportacion custom via AI Hub Models) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo), ONNX, QNN_DLC, TFLITE |

## Arquitectura y entrenamiento

MobileSam es un transformer encoder-decoder para segmentacion guiada por prompts. El codificador de imagenes (ViT tiny) procesa la imagen de entrada a 720p y genera un embedding; el decodificador ligero consume ese embedding junto con el prompt (puntos o cajas) y produce mascaras. Esta separacion permite calcular el embedding una sola vez y reutilizarlo para multiples prompts interactivos, lo que reduce la latencia percibida en flujos de anotacion.

La model card de Qualcomm no detalla el dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF/DPO (no aplica en segmentacion). La innovacion principal respecto a SAM es la reduccion del codificador a una variante tiny, que baja el coste de computo y memoria hasta hacerlo desplegable en NPU moviles. Qualcomm anade el trabajo de compilacion y perfilado con Qualcomm AI Hub Workbench, con artefactos preexportados para QAIRT 2.51 y ONNX Runtime 1.30.0.

## Capacidades

- Segmentacion de imagenes guiada por prompts de punto y de caja (point-based y box-based segmentation).
- Segmentacion sin entrenamiento adicional (zero-shot) sobre nuevas imagenes, gracias a la naturaleza promptable del modelo.
- Generacion de embeddings de imagen reutilizables para multiples consultas de segmentacion sobre la misma imagen.
- Ejecucion on-device en NPU de Qualcomm con latencias de decodificador de 2 a 9 ms.
- Exportacion a ONNX, QNN_DLC y TFLITE con pesos y formas de entrada personalizables.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Edicion fotografica en movil: el usuario toca un objeto y el modelo devuelve la mascara al instante; con decodificador de ~2-3 ms en Snapdragon 8 Elite, la respuesta es imperceptible y todo el procesamiento ocurre en el dispositivo.
- Anotacion semiautomatica de datasets: el codificador se ejecuta una vez por imagen y el decodificador se reutiliza para cada prompt, acelerando el etiquetado de mascaras en pipelines de datos de vision.
- Recorte y eliminacion de fondos en aplicaciones de consumo: la segmentacion por caja o punto permite aislar sujetos sin subir la imagen a la nube, lo que ayuda al cumplimiento de privacidad.
- Vision por computador en automocion e IoT: los chipsets SA8650P, SA8255P y Dragonwing IQ-9075 ejecutan el decodificador en 5-6 ms, habilitando segmentacion en cabina o en camaras industriales.
- Realidad aumentada: segmentacion de personas u objetos para efectos de oclusion y composicion en tiempo real sobre la NPU del dispositivo.
- Preprocesado en pipelines de vision industrial: generar mascaras de regiones de interes antes de un clasificador o detector, reduciendo el area a procesar por etapas posteriores.
- Herramientas de accesibilidad: seleccion de objetos por toque para usuarios con dificultades motoras, con respuesta local y baja latencia.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad de segmentacion (mIoU, Dice, etc.) en la informacion disponible. Si incluye metricas de latencia y memoria en NPU por chipset y runtime:

| Runtime | Chipset | Precision | Inferencia decoder (ms) | Memoria pico (MB) | Unidad |
|---|---|---|---|---|---|
| ONNX | Snapdragon 8 Elite Extreme Gen 6 Mobile | float | 2,066 | 2 - 104 | NPU |
| ONNX | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | float | 2,538 | 3 - 216 | NPU |
| ONNX | Snapdragon 8 Elite For Galaxy Mobile | float | 2,962 | 1 - 211 | NPU |
| ONNX | Snapdragon X2 Elite | float | 2,602 | 4 - 4 | NPU |
| ONNX | Snapdragon X Elite | float | 5,959 | 11 - 11 | NPU |
| ONNX | Snapdragon 8 Gen 3 Mobile | float | 4,149 | 0 - 243 | NPU |
| QNN_DLC | Snapdragon 8 Elite Extreme Gen 6 Mobile | float | 2,041 | 2 - 88 | NPU |
| QNN_DLC | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | float | 2,509 | 4 - 208 | NPU |
| QNN_DLC | Snapdragon 8 Gen 1 Mobile | float | 8,919 | 0 - 210 | NPU |
| QNN_DLC | Dragonwing IQ-9075 | float | 6,359 | 6 - 13 | NPU |
| QNN_DLC | SA8650P | float | 6,389 | 0 - 196 | NPU |
| TFLITE | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | float | 2,149 | 0 - 184 | NPU |

No se han publicado resultados de benchmarks de calidad (mIoU, Dice, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en float ocupa unos 50 MB (23,7 MB decoder + 26,6 MB encoder); la memoria pico medida en NPU varia entre 4 MB y 243 MB segun chipset y runtime.
- GPU recomendadas: no aplica en el flujo principal; el modelo esta optimizado para NPU de Qualcomm (Snapdragon 8 Gen 1/3/Elite, Snapdragon X Elite/X2 Elite, Dragonwing IQ-8275/IQ-9075/IQ-X7181/Q-8750, SA8650P, SA8255P, SA8295P, QCS8450, QCS8550).
- Cabe en GPU consumer: si, en cualquier GPU con mas de 1 GB de VRAM en formato PyTorch/ONNX float; en NPU movil cabe holgadamente.
- Opciones de despliegue: Qualcomm AI Hub Models (exportacion custom), QAIRT 2.51, ONNX Runtime 1.30.0, TFLITE; el repo original de PyTorch permite inferencia en CPU/GPU.
- Latencia: decodificador entre 2,0 y 8,9 ms en NPU segun chipset; el codificador no tiene latencia publicada en la informacion disponible.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Enfoque |
|---|---|---|---|---|
| MobileSam (Qualcomm) | ~13,1 M | 720x1280 | Apache 2.0 | Segmentacion promptable on-device |
| SAM (Meta, ViT-B/L/H) | 91 M - 636 M (solo encoder) | 1024x1024 | Apache 2.0 | Segmentacion promptable de alta calidad, coste elevado |
| SAM 2 (Meta) | no disponible en la informacion | no disponible | no disponible | Segmentacion de imagen y video |
| FastSAM | no disponible en la informacion | no disponible | no disponible | Segmentacion basada en YOLO, todo en una etapa |

No se dispone de datos de calidad (mIoU) para comparar el rendimiento de segmentacion de MobileSam frente a SAM o FastSAM en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso.
- La model card no documenta sesgos especificos; como modelo de vision entrenado con datos no descritos, puede heredar sesgos de representacion de su dataset original.
- Riesgo de mascaras imprecisas en objetos pequenos, oclusiones complejas o bordes finos, propio de la variante tiny del codificador.
- La resolucion de entrada esta fijada a 720p en los artefactos preexportados; otras formas requieren exportacion custom.
- Los artefactos publicados son solo en precision float; no hay variantes cuantizadas listadas, lo que puede limitar el despliegue en hardware con restricciones de memoria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint original y de los artefactos de Qualcomm AI Hub.
- El rendimiento depende del chipset: en Snapdragon 8 Gen 1 el decodificador tarda 8,9 ms frente a 2,0 ms en 8 Elite Extreme Gen 6.
- No se publican metricas de calidad de segmentacion, por lo que la evaluacion en produccion requiere validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/MobileSam
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/mobilesam
- Repositorio AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/mobilesam
- Implementacion original de MobileSam (referenciada en la model card): https://github.com/facebookresearch/segment-anything
- Paper de referencia (arXiv 2306.14289): https://arxiv.org/abs/2306.14289
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilesam/releases/v0.67.0/mobilesam-onnx-float.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilesam/releases/v0.67.0/mobilesam-qnn_dlc-float.zip
- Descarga TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilesam/releases/v0.67.0/mobilesam-tflite-float.zip
