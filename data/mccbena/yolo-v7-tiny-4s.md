# MCCbena/yolo-v7-tiny-4s

## Resumen

MCCbena/yolo-v7-tiny-4s es un detector de objetos basado en la arquitectura YOLOv7-tiny (variante ligera de YOLOv7) y ajustado por el usuario MCCbena sobre un dataset local denominado `open-images-4s-yolo`, con 35 clases. Se distribuye como checkpoint nativo de PyTorch (`last.pt`), no como modelo de Transformers, y esta pensado para inferencia de deteccion de objetos en imagenes a 640x640. La relevancia de este repositorio no esta en el rendimiento, sino en su caracter experimental: documenta de forma muy detallada el proceso de fine-tuning, los ficheros de configuracion y la compatibilidad con una libreria propia de despliegue.

El punto mas importante a tener en cuenta es el estado del entrenamiento. El propio autor indica que el checkpoint publicado contiene 0 epocas completas mas 150 lotes (batches) de la epoca 0, es decir, un entrenamiento practicamente inicial. No se realizo ninguna evaluacion independiente de precision; unicamente se verifico que el modelo completa un forward pass en CPU a 640x640 con salidas finitas. Por tanto, se trata de un artefacto de trabajo o intermedio, no de un detector listo para produccion.

Los datos de entrenamiento disponibles son 53.938 imagenes de entrenamiento y 1.181 de validacion procedentes de Open Images (anotaciones CC BY 4.0). El modelo se licencia bajo GPL-3.0, heredada de YOLOv7, lo que condiciona su uso comercial. Los idiomas declarados en las etiquetas (en, ja) se refieren al contexto del dataset/documentacion, no a capacidad linguistica del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv7-tiny (fichero `cfg/training/yolov7-tiny.yaml`), red convolucional de deteccion de objetos en una sola etapa |
| Parametros totales | Aproximadamente 6,2 M (corresponde a la arquitectura YOLOv7-tiny estandar; no se explicita el dato en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (deteccion de objetos; entrada de imagen fija de 640x640) |
| Tipos de cuantizacion | No disponible en el repositorio; solo se publica el checkpoint PyTorch. El entrenamiento uso precision mixta, pero no se distribuyen pesos cuantizados (GGUF, INT8, etc.) |
| Idiomas soportados | en, ja (etiquetas del repositorio; no aplica como capacidad linguistica al ser un detector) |
| Licencia | GPL-3.0 (hereda la licencia de YOLOv7) |
| Formato de pesos | Checkpoint nativo de PyTorch (`last.pt`); no safetensors, no Transformers |
| Clases | 35 clases (definidas en `dataset.yaml`) |
| Resolucion de entrada | 640x640 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es YOLOv7-tiny, un detector de objetos de una sola etapa basado en redes convolucionales, definido en `cfg/training/yolov7-tiny.yaml`. Se partio de los pesos preentrenados oficiales `yolov7-tiny.pt` (no de pesos vacios) y se ajusto sobre un dataset local de 35 clases. La configuracion de entrenamiento registrada incluye entrada de 640x640, tamano de lote de 64, 8 workers, GPU 0, hiperparametros de `data/hyp.scratch.tiny.yaml`, precision mixta, memoria fijada (pinned memory) y cache de imagenes en RAM cuando la memoria lo permite. Se conservaron las tecnicas de aumento de datos, resolucion y validacion del pipeline original.

El entrenamiento se realizo de forma planificada con limite temporal: debia detenerse el 2026-10-05 a las 09:00 JST. El checkpoint publicado contiene 0 epocas completas mas 150 lotes de la epoca 0 (marcado como epoca parcial), por lo que el ajuste esta en una fase muy temprana. El autor modifico el script de entrenamiento para guardar checkpoints de forma atomica, permitir la reanudacion desde una epoca parcial y detenerse en un limite de lote seguro antes de la fecha limite. Ademas, el matching dinamico OTA se vectorizo para reducir la sincronizacion host/device sin alterar la definicion de la perdida. El codigo y las utilidades faltantes del upstream se restauraron desde el repositorio oficial WongKinYiu/yolov7 (commit a207844). El repositorio incluye ficheros de trazabilidad como `results.txt`, `opt.yaml`, `hyp.yaml`, `model.yaml`, `checkpoint.json` y las listas de imagenes cargadas.

## Capacidades

- Deteccion de objetos en imagenes: genera cajas delimitadoras y clases sobre 35 categorias definidas en `dataset.yaml`.
- Inferencia a resolucion fija de 640x640 mediante el script `detect.py` o la libreria `MCCbena/yolov7-tiny-lib`.
- Ejecucion en CPU: se verifico un forward pass completo en CPU a 640x640 con salidas finitas.
- Compatibilidad con la libreria propia `MCCbena/yolov7-tiny-lib` (carga e inferencia en CPU con tracing activado y desactivado, y verificacion en GPU sobre el checkpoint inicial).
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de vision.
- No tiene capacidades de generacion de texto, codigo, matematicas ni audio.
- No se documentan capacidades multilingues ni de vision-lenguaje; los idiomas en, ja son etiquetas contextuales.

## Casos de uso

- Prototipado de deteccion de objetos en vision por computador: sirve como punto de partida reproducible para experimentar con el pipeline YOLOv7-tiny y 35 clases antes de invertir en un entrenamiento completo, dado que ya incluye toda la configuracion y trazabilidad.
- Validacion de infraestructura de despliegue: permite comprobar que el flujo de carga, inferencia y compatibilidad con la libreria `yolov7-tiny-lib` funciona en CPU y GPU, antes de sustituir el checkpoint por uno entrenado de verdad.
- Investigacion sobre matching dinamico y perdidas: al incluir la vectorizacion del matching OTA y las pruebas de equivalencia, es util para estudiar optimizaciones del entrenamiento sin cambiar la definicion de la perdida.
- Deteccion en el borde (edge) y dispositivos con pocos recursos: su tamano reducido y la verificacion en CPU sugieren viabilidad en hardware modesto, aunque la calidad de deteccion actual es baja por el escaso entrenamiento.
- Automatizacion de anotacion asistida: puede integrarse en un bucle de pre-etiquetado de imagenes para que anotadores humanos corrijan las detecciones, siempre que se entrene antes para obtener precision util.
- Monitorizacion y analitica visual de bajo coste: en escenarios donde se prioriza la latencia y el coste sobre la precision, podria desplegarse en servidores sin GPU, previa validacion de calidad.
- Base para fine-tuning con un dataset propio: el repositorio documenta el proceso, los hiperparametros y los ficheros de configuracion, lo que lo convierte en una plantilla para reentrenar la misma arquitectura con otras clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realizo ninguna evaluacion independiente de precision y que la unica verificacion fue un forward pass en CPU a 640x640 con salidas finitas, ademas de pruebas de compatibilidad de API (no de precision de deteccion).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Al tratarse de un modelo YOLOv7-tiny (unos 6,2 M de parametros) a 640x640, un valor orientativo seria inferior a 2 GB en FP32, aunque no se aporta una medicion concreta.
- GPU recomendadas: no especificadas en la model card. El entrenamiento se ejecuto en una unica GPU (GPU 0) con lote de 64 y precision mixta; no se detalla el modelo de GPU.
- Cabe en GPU de consumo: previsiblemente si, dada la reduccion de tamano de la arquitectura, aunque sin confirmacion oficial en el repositorio.
- CPU: se verifico que la inferencia a 640x640 funciona en CPU con salidas finitas, por lo que es viable sin GPU.
- Opciones de despliegue: script nativo `detect.py` del codigo de YOLOv7 incluido en `training-source.tar.gz`, o la libreria `MCCbena/yolov7-tiny-lib` (que realiza la carga e inferencia). El checkpoint es PyTorch nativo; no se distribuyen exportaciones ONNX, TensorRT, OpenVINO ni similares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MCCbena/yolo-v7-tiny-4s | ~6,2 M (YOLOv7-tiny) | Deteccion de objetos, 35 clases | GPL-3.0 | HuggingFace (repo 0,4 GB) | Checkpoint con 0 epocas completas + 150 lotes; sin evaluacion de precision |
| YOLOv7-tiny (WongKinYiu, upstream) | ~6,2 M | Deteccion de objetos, 80 clases (COCO) | GPL-3.0 | Repositorio oficial GitHub | Modelo base preentrenado del que deriva este ajuste |
| YOLOv5n (Ultralytics) | No disponible en la informacion proporcionada | Deteccion de objetos | Licencia de Ultralytics (no disponible en la informacion) | GitHub / Ultralytics | Alternativa ligera de otra familia; no comparada numericamente aqui |
| YOLOv8n (Ultralytics) | No disponible en la informacion proporcionada | Deteccion de objetos | Licencia de Ultralytics (no disponible en la informacion) | GitHub / Ultralytics | Alternativa mas reciente; sin datos de benchmark en esta ficha |

No se dispone de datos de precision (mAP, velocidades) que permitan una comparacion cuantitativa; la comparacion anterior es estructural y de licencia.

## Limitaciones y advertencias

- Entrenamiento practicamente nulo: el checkpoint contiene 0 epocas completas mas 150 lotes de la epoca 0. La calidad de deteccion esperada es muy baja; no debe usarse en produccion sin reentrenar.
- Sin evaluacion de precision: no hay mAP ni ninguna metrica de deteccion. La unica validacion fue la ausencia de errores y la finitud de las salidas.
- Sin benchmarks: no se puede comparar objetivamente con otros detectores.
- Sesgos conocidos: no documentados. Al derivar de Open Images, podria heredar sesgos de ese dataset, pero no se analiza en la model card.
- Riesgo de falsos positivos/negativos: elevado por el escaso entrenamiento. Cualquier uso en decision automatizada debe acompanarse de validacion humana.
- Cobertura de clases limitada: 35 clases definidas en `dataset.yaml`; objetos fuera de esas categorias no se detectaran correctamente.
- Idiomas: las etiquetas en/ja no implican soporte linguistico; el modelo solo procesa imagenes.
- Restricciones de licencia: GPL-3.0. Es una licencia copyleft que impone obligaciones relevantes para el uso comercial y la redistribucion; conviene revisar los terminos antes de integrarlo en productos propietarios.
- Licencia del dataset: las anotaciones de Open Images son CC BY 4.0. El autor indica que no se redistribuyen imagenes ni anotaciones y que GPL-3.0 no relicencia el dataset. No se verifico de forma independiente la licencia de las imagenes originales.
- Naturaleza del repositorio: no es una version oficial de YOLOv7, sino un ajuste modificado. La publicacion esta planificada con actualizaciones intermedias y el checkpoint puede cambiar.
- Compatibilidad: la verificacion con la libreria propria establece compatibilidad de API, no precision de deteccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MCCbena/yolo-v7-tiny-4s
- Checkpoint `last.pt`: https://huggingface.co/MCCbena/yolo-v7-tiny-4s/blob/main/last.pt
- Libreria de despliegue: https://github.com/MCCbena/yolov7-tiny-lib/tree/main/
- Repositorio oficial YOLOv7 (WongKinYiu): https://github.com/WongKinYiu/yolov7
- Commit de referencia restaurado: https://github.com/WongKinYiu/yolov7/tree/a207844b1ce82d204ab36d87d496728d3d2348e7
- Documentacion de YOLOv7 en Ultralytics: https://docs.ultralytics.com/models/yolov7
- YOLOv7 en Qualcomm AI Hub (IoT): https://aihub.qualcomm.com/iot/models/yolov7
- YOLOv7 en Qualcomm AI Hub (compute): https://aihub.qualcomm.com/compute/models/yolov7
