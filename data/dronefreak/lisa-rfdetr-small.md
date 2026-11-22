# dronefreak/lisa-rfdetr-small

## Resumen

`dronefreak/lisa-rfdetr-small` es un detector de objetos especializado en semaforos de trafico, obtenido mediante fine-tuning del modelo base `Roboflow/rf-detr-small` sobre el conjunto de datos LISA Traffic Lights. Lo desarrolla el autor independiente dronefreak en el marco de DetectionBench, un framework cuyo objetivo es benchmarkear detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas, de forma reproducible, sobre multiples datasets del mundo real. El modelo resuelve una tarea acotada pero critica en vision por computador aplicada: la deteccion y clasificacion de estados de semaforo (go, stop, warning y sus variantes direccionales) en imagenes de trafico urbano.

Tecnicamente es un transformer de deteccion (familia DETR, variante RF-DETR de Roboflow) con 31,8 millones de parametros totales, distribuido en formato safetensors y con pesos tambien en `.pth` para su carga mediante la libreria `rfdetr`. Su relevancia actual radica en dos factores: por un lado, ofrece una linea base reproducible y con licencia Apache-2.0 para sistemas ADAS y conduccion autonoma; por otro, forma parte de un zoo comparativo publico que enfrenta RF-DETR contra la familia YOLO (YOLOv8, YOLO11, YOLO26) bajo condiciones controladas, lo que facilita decisiones de seleccion de arquitectura con datos homogeneos.

El modelo no es un LLM ni un modelo multimodal generativo: es un detector puro de una sola etapa de razonamiento, sin capacidades de texto, tool calling ni agentes. Su interes para desarrolladores e investigadores esta en la evaluacion comparativa de detectores y en el despliegue embebido en pipelines de vision para automocion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer de deteccion de la familia DETR, variante Small de Roboflow) |
| Parametros totales | 31.812.536 (32,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones oficiales; el repo distribuye pesos `.pth` y safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; las clases son etiquetas en ingles: go, goForward, goLeft, stop, stopLeft, warning, warningLeft) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y `.pth` (`checkpoint_best_total.pth`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura RF-DETR Small de Roboflow, un detector basado en transformer con mecanismo de atencion (estilo DETR) que predice conjuntos de objetos sin necesidad de anchors ni de supresion no maxima (NMS) post-procesado en el pipeline nativo. Con 32,1 M de parametros se situa en el rango "small" de la familia, pensado para un equilibrio entre precision y coste computacional. El autor no publica el numero de FLOPs ("N/A, not published upstream") ni el detalle de la composicion del dataset de preentrenamiento del modelo base.

El fine-tuning se realizo sobre LISA Traffic Lights, un dataset de imagenes de trafico con siete clases de estado de semaforo. La model card no detalla el numero de tokens ni de imagenes de entrenamiento, la composicion exacta del split, ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste de hiperparametros especificas mas alla de la receta estandar de DetectionBench. La evaluacion se hizo con el pipeline `detectionbench-evaluate` y con las metricas de deteccion de la libreria Supervision de Roboflow, que reportan mAP, precision y recall directamente pero no generan matriz de confusion como el validador de Ultralytics. No se documenta RLHF, DPO ni ninguna fase de alineacion, algo esperable en un modelo de vision supervisado.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica semaforos en siete clases (`go`, `goForward`, `goLeft`, `stop`, `stopLeft`, `warning`, `warningLeft`).
- Prediccion de cajas delimitadoras con umbral de confianza configurable (`model.predict("image.jpg", threshold=0.25)`).
- Inferencia sobre imagenes individuales mediante la API de `rfdetr`; no se documenta soporte nativo de video, batch o streaming en la model card.
- Capacidad discriminativa limitada a la tarea de semaforos: no es un detector de proposito general ni reconoce otras clases del mundo real.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Sin capacidades multilingues, de vision generativa, audio ni thinking mode.
- Integrable en pipelines de vision por computador basados en PyTorch.

## Casos de uso

- Asistencia a la conduccion (ADAS): el modelo puede alimentar un modulo de alerta que detecte el estado del semaforo (stop, go, warning) y avise al conductor o al sistema de frenado. Su tamano de 32,1 M de parametros permite ejecucion en tiempo real en hardware embebido de vehiculo.
- Conduccion autonoma nivel 2-3 en entornos urbanos: integrado en la pila de percepcion, proporciona la senal de estado del semaforo necesaria para la toma de decision en intersecciones, complementando otros detectores de peatones y vehiculos.
- Validacion y regresion de pipelines de percepcion: al ser un modelo de referencia dentro de DetectionBench, sirve como linea base reproducible para comparar cambios en el pipeline de deteccion con metricas identicas (mAP@50, mAP@50-95, precision, recall).
- Investigacion en benchmarkeo de detectores: util para estudios que comparen arquitecturas DETR frente a YOLO bajo recetas controladas, ya que el zoo publico incluye resultados homogeneos de RF-DETR Nano/Small/Medium y YOLOv8m, YOLO11x, YOLO26n/s/m/l/x sobre el mismo dataset.
- Sistemas de analitica de trafico urbano: procesamiento offline de grabaciones de camaras de trafico para extraer estadisticas de estado de semaforos y analizar patrones de congestion o cumplimiento normativo.
- Prototipado rapido en robótica y vehiculos a escala: el bajo coste de inferencia y la licencia Apache-2.0 permiten desplegar el detector en robots moviles o maquetas de conduccion autonoma sin restricciones comerciales.
- Fine-tuning posterior sobre dominios especificos: al estar publicado con licencia permisiva y formato estandar, puede servir como punto de partida para ajustar un detector de semaforos a geografias o tipos de senalizacion distintos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de LISA Traffic Lights (no verificados de forma independiente; `verified: false` en el model-index):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 32,7 |
| mAP@50-95 | 15,11 |
| Precision | 69,7 |
| Recall | 53,9 |
| F1 | 60,79 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| go | 64,36 | 33,02 |
| goForward | 0,0 | 0,0 |
| goLeft | 13,56 | 5,43 |
| stop | 55,85 | 22,82 |
| stopLeft | 12,11 | 5,52 |
| warning | 53,43 | 26,73 |
| warningLeft | 29,58 | 12,21 |

Comparativa dentro del zoo de LISA Traffic Lights publicado por el autor:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 33,01 | 14,12 | 69,37 | 58,28 |
| **RF-DETR Small (este modelo)** | **32,7** | **15,11** | **69,7** | **53,9** |
| YOLO26m | 29,08 | 13,68 | 43,79 | 29,71 |
| YOLO26x | 28,92 | 14,09 | 43,59 | 26,96 |
| RF-DETR Nano | 27,47 | 12,16 | 74,96 | 52,57 |
| YOLO26l | 27,28 | 13,54 | 41,42 | 27,99 |
| YOLO26s | 26,91 | 12,82 | 42,47 | 26,43 |
| YOLO11x | 26,4 | 13,09 | 53,98 | 24,38 |
| YOLOv8m | 25,07 | 11,91 | 38,16 | 25,15 |
| YOLO26n | 23,74 | 10,57 | 37,23 | 25,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 31,8 M de parametros, los pesos en FP32 ocupan aproximadamente 127 MB; en FP16, unos 64 MB. El consumo real de VRAM depende del resolutor de entrada y del tamano de batch, no documentados en la model card.
- GPU recomendadas: no especificadas por el autor. Por el tamano del modelo, es esperable que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: previsiblemente si, dado el reducido numero de parametros, aunque no se aporta medicion concreta.
- Opciones de despliegue: la model card solo documenta la libreria `rfdetr` junto con `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs y no aplicables a este modelo). Tampoco se documenta exportacion a ONNX o TensorRT.
- Latencia y throughput: no disponibles. La model card indica explicitamente "FLOPs: N/A (not published upstream)".

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (deteccion de objetos en imagenes de trafico) segun los datos del propio zoo del autor:

| Modelo | Parametros | mAP@50 (LISA) | mAP@50-95 (LISA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Small (este) | 32,1 M | 32,7 | 15,11 | Apache-2.0 | Hugging Face |
| RF-DETR Medium | no disponible | 33,01 | 14,12 | Apache-2.0 (modelo base) | Hugging Face |
| RF-DETR Nano | no disponible | 27,47 | 12,16 | Apache-2.0 (modelo base) | Hugging Face |
| YOLO26m | no disponible | 29,08 | 13,68 | no disponible en la informacion | no disponible en la informacion |
| YOLO11x | no disponible | 26,4 | 13,09 | no disponible en la informacion | no disponible en la informacion |

En mAP@50-95, RF-DETR Small supera al resto del zoo publicado, incluido RF-DETR Medium (15,11 frente a 14,12), a costa de un recall inferior (53,9 frente a 58,28). Frente a las variantes YOLO, la ventaja en mAP@50 es de entre 3,6 y 9 puntos porcentuales. Los datos de parametros y licencia de los modelos YOLO no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo detecta las siete clases de semaforo de LISA Traffic Lights; no es un detector de proposito general y fallara en cualquier otra categoria de objeto.
- Rendimiento muy desigual por clase: `goForward` obtiene 0,0 de mAP@50 y las clases direccionales (`goLeft`, `stopLeft`) estan por debajo del 14 %, lo que refleja un fuerte desbalanceo o escasez de ejemplos en el dataset. No es fiable para senalizacion direccional.
- Recall del 53,9 %: aproximadamente la mitad de los semaforos presentes en una imagen pueden no detectarse, lo que es critico en un sistema de seguridad vial. Precision del 69,7 % implica ademas una tasa relevante de falsos positivos.
- Los resultados son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de sobreajuste al dominio de LISA: condiciones de iluminacion, camaras, paises y tipos de semaforo distintos a los del dataset pueden degradar el rendimiento de forma significativa.
- No se documentan sesgos demograficos ni geograficos especificos, pero al ser un dataset de trafico de una unica procedencia, la generalizacion geografica es una incognita.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y sin garantias. No obstante, el uso en produccion para seguridad vial exige validacion propia y no debe confiarse en las metricas publicadas sin replicarlas.
- No hay informacion sobre cuantizacion oficial, exportacion a formatos de despliegue (ONNX, TensorRT) ni latencias medidas, lo que dificulta planificar un despliegue en tiempo real sin pruebas adicionales.
- El modelo base es `Roboflow/rf-detr-small`; conviene revisar los terminos y limitaciones del modelo original antes de un uso comercial.
- Solo 11 descargas y 0 likes en el momento de la consulta: es un modelo de investigacion con escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/lisa-rfdetr-small
- Dataset LISA Traffic Lights: https://huggingface.co/datasets/dronefreak/LISA-Traffic-Lights
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base RF-DETR Small: https://huggingface.co/Roboflow/rf-detr-small
- Libreria Supervision (metricas de deteccion): https://github.com/roboflow/supervision
- Paper de referencia DETR (arxiv:2304.07193): https://arxiv.org/abs/2304.07193
- Paper de referencia adicional (arxiv:2511.09554): https://arxiv.org/abs/2511.09554
