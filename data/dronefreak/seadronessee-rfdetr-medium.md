# dronefreak/seadronessee-rfdetr-medium

## Resumen

RF-DETR Medium finetuneado sobre SeaDronesSee es un detector de objetos desarrollado por el usuario dronefreak como parte del proyecto DetectionBench, un marco de trabajo orientado a comparar de forma reproducible detectores modernos bajo recetas de entrenamiento y metricas de evaluacion identicas. El modelo parte de Roboflow/rf-detr-medium, un detector basado en arquitectura DETR (transformer con mecanismo de atencion sobre objetos), y se especializa en la deteccion de personas y embarcaciones en escenarios maritimos captados desde drones.

El modelo resuelve un problema concreto: la deteccion de nadadores, barcos, motos de agua, dispositivos de salvamento y boyas en imagenes aereas de alta variabilidad tomadas por UAV, un caso de uso critico en operaciones de busqueda y rescate. Con 33,38 millones de parametros y un mAP@50 de 83,47 en el split de validacion de SeaDronesSee, se posiciona como una alternativa competitiva frente a detectores YOLO de distinto tamano evaluados bajo la misma receta.

Su relevancia actual radica en dos factores: la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y la existencia de un benchmark transparente (DetectionBench) que publica resultados comparables entre multiples detectores sobre el mismo dataset, algo poco habitual en el ecosistema de deteccion de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (transformer end-to-end para deteccion de objetos), variante RF-DETR Medium |
| Parametros totales | 33.381.628 (33,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y checkpoint PyTorch (.pth); libreria rfdetr |
| Tarea | Object detection |
| Dataset de entrenamiento | SeaDronesSee (dronefreak/SeaDronesSee) |
| Clases | swimmer, boat, jetski, life_saving_appliances, buoy |
| Modelo base | Roboflow/rf-detr-medium |
| Tamano del repositorio | 0,3 GB |
| Framework de inferencia | rfdetr (PyPI) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RF-DETR, una familia de detectores basada en el paradigma DETR: un transformer que predice conjuntos de objetos de forma end-to-end, eliminando la necesidad de componentes como anchor boxes o supresion no maxima (NMS) en el postprocesado. La variante Medium, de la que deriva este finetune, cuenta con 33,7 millones de parametros. El modelo se inicializa desde los pesos de Roboflow/rf-detr-medium y se ajusta sobre el dataset SeaDronesSee.

El entrenamiento se realizo dentro del toolkit DetectionBench, con una configuracion maxima de 500 epocas (la model card no detalla el numero exacto de epocas efectivamente ejecutadas ni el resto de hiperparametros en la informacion disponible). No se especifica el volumen de tokens ni la composicion exacta del dataset mas alla de las cinco clases anotadas. La evaluacion se llevo a cabo con las metricas de deteccion de la libreria Supervision (Roboflow), que reportan mAP, precision y recall directamente. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, al tratarse de un modelo de vision y no de lenguaje.

## Capacidades

- Deteccion de objetos en imagenes aereas captadas por drones (UAV) en entornos maritimos.
- Deteccion de cinco clases especificas: nadadores (swimmer), embarcaciones (boat), motos de agua (jetski), dispositivos de salvamento (life_saving_appliances) y boyas (buoy).
- Prediccion end-to-end de cajas delimitadoras con umbral de confianza configurable (por ejemplo, `threshold=0.25` en la API de inferencia).
- Integracion con la libreria `rfdetr` y descarga de pesos via `huggingface_hub`.
- Evaluacion reproducible mediante el pipeline `detectionbench-evaluate`.
- No dispone de capacidades de generacion de texto, razonamiento linguistico, tool calling ni agentes; es exclusivamente un modelo de vision por computador.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision multimodal, audio).

## Casos de uso

- Busqueda y rescate maritimo: el modelo detecta nadadores y dispositivos de salvamento en imagenes aereas de drones, lo que permite priorizar zonas de busqueda en operaciones de emergencia con un mAP@50 de 76,06 para nadadores y 70,55 para dispositivos de salvamento.
- Vigilancia de costas y playas: la deteccion fiable de embarcaciones (mAP@50 de 95,71) y motos de agua (93,55) permite monitorizar trafico maritimo y detectar embarcaciones en zonas restringidas.
- Monitorizacion de boyas y balizamiento: con un mAP@50 de 81,49 en la clase buoy, el modelo sirve para verificar la integridad de sistemas de balizamiento en puertos y canales.
- Analisis post-vuelo de misiones UAV: procesado por lotes de las imagenes capturadas por un dron para generar inventarios de objetos detectados y mapas de presencia.
- Integracion en pipelines de vision embebida: sus 33,7 M de parametros y su licencia Apache 2.0 lo hacen apto para desplegarse en estaciones de tierra o sistemas de borde que procesan flujos de video de drones.
- Benchmarking y seleccion de detectores: al formar parte del zoo de modelos de DetectionBench, sirve como referencia para comparar arquitecturas DETR frente a familias YOLO bajo condiciones controladas.
- Investigacion en deteccion aerea: base para experimentos de transferencia, ablation de recetas de entrenamiento o comparativas de robustez en dominios maritimos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validacion de SeaDronesSee, evaluados con el pipeline de DetectionBench. No verificados de forma independiente.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 83,47 |
| mAP@50-95 | 47,49 |
| Precision | 87,01 |
| Recall | 83,33 |
| F1 Score | 85,13 |

Rendimiento por clase:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| swimmer | 76,06 | 30,44 |
| boat | 95,71 | 69,35 |
| jetski | 93,55 | 64,16 |
| life_saving_appliances | 70,55 | 25,24 |
| buoy | 81,49 | 48,26 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 33,7 M de parametros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna (el peso en precision FP32 ronda los 135 MB, y el repositorio completo ocupa 0,3 GB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia en FP32; para entrenamiento o procesado por lotes se recomienda RTX 3060/4070 o superiores, y A100/H100 para experimentos a gran escala.
- Cabe en GPU consumer: si, incluidas GTX 1660, RTX 3050 y superiores.
- Opciones de despliegue: libreria `rfdetr` (PyPI), con descarga de pesos via `huggingface_hub`; el checkpoint se distribuye en formato `.pth`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada. Los FLOPs tampoco estan publicados upstream.

## Comparativa con modelos similares

Comparativa sobre SeaDronesSee (split de validacion, misma receta de DetectionBench), segun los datos publicados por el autor:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium (este modelo) | 83,47 | 47,49 | 87,01 | 83,33 |
| YOLO26m | 82,38 | 49,57 | 90,01 | 81,18 |
| RF-DETR Small | 80,97 | 45,31 | 85,68 | 80,16 |
| YOLO26s | 80,14 | 47,35 | 88,50 | 77,51 |
| YOLO11x | 74,82 | 45,56 | 87,37 | 72,46 |
| YOLOv8s | 72,94 | 43,05 | 84,52 | 71,25 |
| RF-DETR Nano | 72,38 | 39,83 | 81,37 | 74,08 |
| YOLO11n | 69,93 | 40,41 | 82,87 | 69,04 |

Observaciones: RF-DETR Medium lidera en mAP@50 y recall entre los modelos listados, mientras que YOLO26m obtiene mejor mAP@50-95 y precision. La comparativa de licencias y disponibilidad de los modelos YOLO no se detalla en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en el dominio maritimo aereo de SeaDronesSee; su rendimiento fuera de ese dominio (otras camaras, alturas, condiciones meteorologicas o geografias) no esta documentado y probablemente degrade.
- Las metricas son declaradas por el autor y no han sido verificadas de forma independiente (`verified: false` en el model-index).
- El mAP@50-95 global (47,49) es notablemente inferior al mAP@50, lo que indica menor precision en la localizacion fina de cajas; las clases pequenas o poco representadas como swimmer (30,44) y life_saving_appliances (25,24) muestran un mAP@50-95 bajo.
- Riesgo de falsos positivos y negativos en escenarios con oclusion, objetos de pequeno tamano o condiciones de iluminacion adversas; no se documentan analisis de robustez.
- No se dispone de informacion sobre sesgos del dataset ni sobre la distribucion demografica o geografica de las anotaciones.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la idoneidad para aplicaciones criticas de seguridad.
- No se documentan los hiperparametros completos de entrenamiento ni el numero exacto de epocas ejecutadas, lo que limita la reproducibilidad exacta fuera de DetectionBench.
- Al ser un modelo de vision, no procesa texto ni instrucciones en lenguaje natural; cualquier flujo que requiera razonamiento linguistico debe combinarse con otro modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/seadronessee-rfdetr-medium
- Dataset SeaDronesSee: https://huggingface.co/datasets/dronefreak/SeaDronesSee
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base RF-DETR Medium: https://huggingface.co/Roboflow/rf-detr-medium
- Libreria Supervision (metricas de evaluacion): https://github.com/roboflow/supervision
- Paper SeaDronesSee (arXiv:2105.01922): https://arxiv.org/abs/2105.01922
- Paper referenciado (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper referenciado (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
