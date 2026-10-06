# dronefreak/bdd100k-period-efficientvit_b2

## Resumen

EfficientViT-B2 finetuned on BDD100K Period es un clasificador de imágenes especializado en determinar la franja horaria (momento del día) de una escena de conducción. Lo publica el usuario dronefreak dentro del proyecto BDD100K-Toolkit, un conjunto de utilidades para preparar el dataset BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones. La tarea es no oficial y consta de cuatro clases: daytime, night, dawn or dusk y unknown, derivadas del campo attributes.timeofday de BDD100K.

El modelo parte de timm/efficientvit_b2.r224_in1k, un backbone EfficientViT-B2 preentrenado en ImageNet-1k, y se ajusta sobre el dataset dronefreak/BDD100K-Period-Classification. Con 21,8 millones de parámetros y pesos de aproximadamente 0,1 GB en el repositorio, es un modelo compacto pensado para ejecutarse como etapa de preprocesado o etiquetado automático en pipelines de visión para conducción autónoma, no como modelo generativo.

Su relevancia práctica está en que resuelve una clasificación contextual barata (iluminación de la escena) que condiciona el rendimiento de detectores y segmentadores: conocer la franja horaria permite enrutar los fotogramas a modelos o umbrales específicos, equilibrar datasets y auditar la robustez de un sistema de percepción por condiciones de iluminación. Declara un 93,92 % de top-1 accuracy y un 82,53 % de macro F1 en la partición de test de 10 000 imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT (vision transformer con cascaded group attention), variante B2 |
| Parametros totales | 21,8 M (segun la model card del autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen con resolucion definida en el checkpoint (el modelo base es la variante r224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (best.pt, cargado con torch.load; contiene state_dict, model_name, class_names, imgsz, mean y std) |
| Tarea | clasificacion de imagenes, 4 clases (daytime, night, dawn or dusk, unknown) |
| Libreria | timm (PyTorch) |
| Modelo base | timm/efficientvit_b2.r224_in1k (finetune) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es EfficientViT-B2, descrita en el paper EfficientViT: Memory Efficient Vision Transformer with Cascaded Group Attention (arXiv:2205.14756). EfficientViT es una familia de vision transformers orientada a eficiencia computacional que sustituye la atencion softmax clasica por un mecanismo de atencion lineal con cascaded group attention, de modo que el coste crece de forma mas favorable con la resolucion y el modelo resulta adecuado para inferencia en tiempo real. La variante B2 se usa aqui como extractor de caracteristicas con una cabeza de clasificacion de cuatro salidas.

El ajuste se realiza sobre el dataset dronefreak/BDD100K-Period-Classification, derivado de BDD100K (arXiv:1805.04687) y de un dataset homonimo publicado en Kaggle; las etiquetas provienen del atributo timeofday por imagen. La evaluacion se hace sobre la particion test de 10 000 imagenes. El autor no detalla en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del split de entrenamiento, el numero de epocas, la politica de aumento de datos ni el uso de tecnicas como RLHF o DPO, que en cualquier caso no aplican a una tarea de clasificacion supervisada.

El checkpoint distribuido incluye los metadatos necesarios para reconstruir el pipeline de inferencia (nombre del modelo en timm, lista de clases, tamano de imagen, media y desviacion tipica para la normalizacion), lo que facilita reproducir el preprocesado exacto empleado en el entrenamiento.

## Capacidades

- Clasificacion de escenas de conduccion en cuatro franjas horarias: daytime, night, dawn or dusk y unknown.
- Inferencia sobre imagenes RGB individuales mediante timm y PyTorch, con preprocesado de redimensionado y normalizacion especificado en el propio checkpoint.
- Clasificacion por lotes (batch inference) apta para procesar grandes volumenes de fotogramas de dashcam o de datasets de conduccion.
- Extraccion del vector de probabilidades por clase, lo que permite aplicar umbrales de confianza o estrategias de rechazo en produccion.
- Uso como etapa de preprocesado en pipelines de vision: etiquetado automatico de atributos de iluminacion antes de deteccion, segmentacion o seguimiento.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision multimodal con lenguaje, tool calling, function calling, soporte de agentes, modo de pensamiento ni capacidades de audio.
- No tiene capacidades multilingues porque no procesa lenguaje natural.
- No procesa video de forma nativa: la temporalidad debe gestionarse a nivel de pipeline clasificando fotograma a fotograma.

## Casos de uso

- Enrutado de fotogramas en un sistema ADAS o de conduccion autonoma: clasificar cada fotograma como dia, noche o crepusculo y activar umbrales, modelos o tecnicas de realce nocturno especificos para cada condicion, aprovechando que el clasificador solo consume 21,8 M de parametros y puede ejecutarse antes del detector principal.
- Etiquetado automatico de datasets propios de conduccion: anotar el atributo de franja horaria en colecciones de imagenes de dashcam para construir atributos auxiliares sin anotacion manual, reutilizando el esquema de cuatro clases del dataset BDD100K Period.
- Curacion y equilibrado de datasets de entrenamiento: medir la distribucion de franjas horarias de un corpus y seleccionar muestras para reducir el desbalance entre dia y noche antes de entrenar un detector o segmentador.
- Auditoria de robustez de modelos de percepcion: segmentar el conjunto de validacion por franja horaria predicha y calcular metricas desagregadas (por ejemplo, mAP de dia frente a noche) para detectar caidas de rendimiento asociadas a la iluminacion.
- Analitica operativa de flotas: procesar imagenes subidas desde vehiculos para informes de actividad por turnos y condiciones de luz, con el modelo ejecutandose en CPU o en una GPU de gama baja.
- Control de calidad en la ingesta de datos: filtrar o marcar imagenes nocturnas y crepusculares en un pipeline de datos para asegurar cobertura de condiciones dificiles antes de publicar un dataset interno.
- Preetiquetado en plataformas de anotacion humana: predecir la clase de franja horaria para que los anotadores solo revisen casos de baja confianza, reduciendo el coste de anotacion de atributos de contexto.
- Despliegue en hardware embebido: al ser un modelo de 21,8 M de parametros, es candidato a exportacion a ONNX o TensorRT para ejecucion en dispositivos tipo NVIDIA Jetson o en CPU, siempre que la latencia medida en el hardware objetivo resulte aceptable (no hay cifras publicadas).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, campo verified: false), sobre la particion test de BDD100K Period con 10 000 imagenes:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,92 % |
| Macro F1 | 82,53 % |
| Balanced accuracy | 78,88 % |
| Macro precision | 87,49 % |
| Macro recall | 78,88 % |

Desglose por clase en la misma particion de test:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 69,84 % | 54,76 % | 61,38 % | 778 |
| daytime | 93,71 % | 96,27 % | 94,97 % | 5258 |
| night | 97,96 % | 98,78 % | 98,37 % | 3929 |
| unknown | 88,46 % | 65,71 % | 75,41 % | 35 (pocas) |

La diferencia entre la top-1 accuracy (93,92 %) y el macro F1 (82,53 %) refleja el fuerte desbalance de clases: las clases mayoritarias daytime y night concentran el acierto, mientras que dawn or dusk obtiene el F1 mas bajo (61,38 %).

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 21,8 M de parametros, los pesos ocupan aproximadamente 87 MB en fp32 y 44 MB en fp16; con activaciones para lotes moderados a la resolucion de entrada del modelo (variante r224) el consumo se mantiene por debajo de 1 GB en la mayoria de configuraciones. Son estimaciones aritmeticas, no medidas publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o T4 resulta mas que sobrada y permite lotes grandes y alto throughput. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas; tambien es viable en CPU para lotes pequenos.
- Opciones de despliegue: PyTorch con timm (via oficial descrita en la model card), exportacion a ONNX, TorchScript o TensorRT para produccion, y ejecucion en CPU con PyTorch. No se distribuyen pesos en formato GGUF ni hay soporte declarado para llama.cpp, Ollama, vLLM o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible; el autor no publica mediciones de latencia ni de imagenes por segundo en ningun hardware.

## Comparativa con modelos similares

El propio autor publica un model zoo con todos los modelos entrenados y evaluados sobre la misma particion test de 10 000 imagenes mediante BDD100K-Toolkit, lo que hace directamente comparables los resultados:

| Modelo | Top-1 accuracy | Macro F1 | Balanced accuracy | Macro precision | Parametros | Licencia |
|---|---|---|---|---|---|---|
| TinyViT-21M | 94,01 % | 83,19 % | 79,63 % | 87,95 % | no disponible | no disponible |
| EfficientViT-L1 | 93,98 % | 82,68 % | 78,45 % | 88,75 % | no disponible | no disponible |
| ConvNeXt-Atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % | no disponible | no disponible |
| EfficientViT-B2 (este modelo) | 93,92 % | 82,53 % | 78,88 % | 87,49 % | 21,8 M | apache-2.0 |
| RepViT-M2.3 | 93,89 % | 82,35 % | 78,49 % | 87,72 % | no disponible | no disponible |
| YOLO11n | 93,79 % | 80,13 % | 75,19 % | 88,20 % | no disponible | no disponible |
| EfficientViT-B1 | 93,77 % | 82,63 % | 78,93 % | 88,38 % | no disponible | no disponible |
| EfficientViT-B3 | 93,77 % | 81,04 % | 76,29 % | 88,43 % | no disponible | no disponible |
| YOLO11s | 93,73 % | 81,22 % | 77,49 % | 86,42 % | no disponible | no disponible |
| EfficientViT-B0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % | no disponible | no disponible |
| YOLO26n | 93,61 % | 80,41 % | 77,72 % | 83,88 % | no disponible | no disponible |
| MobileNetV4-Conv-Small | 93,57 % | 80,22 % | 76,22 % | 86,06 % | no disponible | no disponible |
| YOLOv8n | 93,56 % | 80,85 % | 76,26 % | 87,87 % | no disponible | no disponible |
| MobileNetV4-Conv-Large | 93,46 % | 80,21 % | 74,88 % | 89,57 % | no disponible | no disponible |
| YOLOv8s | 93,46 % | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Las diferencias entre los primeros puestos son de decimas de punto porcentual, dentro del rango en el que la eleccion deberia decidirse por coste de inferencia y facilidad de despliegue mas que por precision. TinyViT-21M y EfficientViT-L1 superan ligeramente a este modelo en top-1 y macro F1; EfficientViT-B2 ofrece un equilibrio intermedio dentro de la propia familia B0/B1/B2/B3.

## Limitaciones y advertencias

- Clase crepuscular debil: dawn or dusk obtiene 54,76 % de recall y 61,38 % de F1, de modo que aproximadamente la mitad de los fotogramas de amanecer o atardecer se clasifican mal, probablemente hacia daytime o night.
- Clase unknown poco fiable: solo hay 35 imagenes de test de esta clase, por lo que su 75,41 % de F1 y su 65,71 % de recall tienen un intervalo de confianza muy amplio y no deberian tomarse como una estimacion estable.
- Desbalance de clases severo en el conjunto de test: 5258 imagenes de daytime frente a 778 de dawn or dusk; la top-1 accuracy global esta dominada por las clases mayoritarias.
- Metricas autodeclaradas y no verificadas: el model-index marca las cuatro metricas con verified: false y provienen del propio autor.
- Tarea no oficial: la clasificacion de franja horaria no forma parte del benchmark oficial de BDD100K; se define a partir del campo attributes.timeofday y sigue un dataset de Kaggle con el mismo nombre, por lo que no hay un estandar externo de comparacion.
- Dominio restringido: entrenado con escenas de conduccion de BDD100K (imagenes de dashcam, mayoritariamente de Estados Unidos). El rendimiento fuera de ese dominio, con otras camaras, paises, climas o condiciones de exposicion, no esta documentado.
- Sin contexto temporal: clasifica fotogramas individuales, sin informacion de la secuencia, lo que puede producir predicciones inconsistentes entre fotogramas consecutivos de un mismo video.
- Sin datos de calibracion: no se publica informacion sobre la calibracion de las probabilidades, por lo que no conviene usar umbrales de confianza estrictos en produccion sin validarlos previamente.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero el dataset BDD100K y el dataset derivado tienen sus propias condiciones de uso que conviene revisar antes de un despliegue comercial; no se detallan en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido habitual de un modelo generativo, pero si existe riesgo de predicciones erroneas con alta confianza en imagenes ambiguas (transiciones de luz, tuneles, iluminacion artificial nocturna, camaras mal expuestas).
- Sin cifras de latencia, throughput ni consumo energetico publicadas, lo que impide dimensionar el despliegue sin medirlo previamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-period-efficientvit_b2
- Dataset de la tarea: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit (codigo de entrenamiento y evaluacion): https://github.com/dronefreak/bdd100k-toolkit
- Modelo base en Hugging Face: https://huggingface.co/timm/efficientvit_b2.r224_in1k
- Paper de EfficientViT (cascaded group attention): https://arxiv.org/abs/2205.14756
- Paper del dataset BDD100K: https://arxiv.org/abs/1805.04687
- Recursos multimedia de la model card (banner de demo): https://huggingface.co/dronefreak/bdd100k-period-efficientvit_b2/resolve/main/assets/demo_banner.mp4
