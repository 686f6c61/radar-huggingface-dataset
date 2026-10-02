# dronefreak/bdd100k-period-yolov8n-cls

## Resumen

El modelo dronefreak/bdd100k-period-yolov8n-cls es un clasificador de imagenes obtenido mediante fine-tuning de YOLOv8n-cls, la variante nano de la familia de clasificacion de Ultralytics YOLOv8. Lo ha desarrollado el usuario dronefreak y resuelve una tarea concreta: clasificar una imagen de escena de conduccion en una de cuatro categorias de momento del dia (daytime, night, dawn or dusk, unknown), a partir del campo attributes.timeofday de BDD100K. Es, por tanto, un modelo de vision por computador orientado a conduccion autonoma y analisis de escenas viales, no un modelo de lenguaje.

La relevancia practica esta en su tamano: con aproximadamente 1,4 millones de parametros y entrada de 224x224 pixeles, es un clasificador que cabe en cualquier GPU consumer e incluso puede ejecutarse en CPU, lo que lo hace apto para preprocesado a gran escala de datasets de conduccion o para etiquetado ligero en el borde. Forma parte del proyecto BDD100K-Toolkit, un conjunto de herramientas sin dependencias pesadas para preparar BDD100K, entrenar modelos sobre el y evaluarlos con las mismas metricas y los mismos splits.

El modelo declara 93,56 por ciento de top-1 accuracy sobre el split de test (10 000 imagenes), aunque con un macro F1 de 80,85 por ciento, lo que refleja un desequilibrio claro entre clases: rinde de forma excelente en daytime y night, pero baja mucho en dawn or dusk y en la clase unknown, que apenas tiene 35 imagenes de test. La licencia es AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de clasificacion (YOLOv8n-cls, Ultralytics YOLOv8) |
| Parametros totales | 1,4 M (segun la model card) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo se publican pesos .pt) |
| Idiomas soportados | no aplicable (clasificacion de imagenes) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch / Ultralytics (.pt, archivo best.pt) |
| Tarea | Image classification (4 clases) |
| Clases | daytime, night, dawn or dusk, unknown |
| Tamano de entrada | 224 x 224 px |
| Framework | Ultralytics (ultralytics) |
| Modelo base | Ultralytics/YOLOv8 |
| Dataset de entrenamiento | dronefreak/BDD100K-Period-Classification |
| Tamano del repositorio | 0,0 GB segun HuggingFace (los pesos se sirven aparte como best.pt) |

## Arquitectura y entrenamiento

La arquitectura es la de YOLOv8n-cls de Ultralytics, una red convolucional de clasificacion de imagenes. No emplea mecanismos de atencion tipo transformer ni arquitecturas MoE o SSM: es una CNN densa y compacta, con unos 1,4 millones de parametros, pensada para inferencia rapida. El modelo se ha inicializado con pesos preentrenados (Pretrained: True) y se ha afinado sobre la tarea de cuatro clases de momento del dia.

Los detalles de entrenamiento declarados en la model card son los siguientes: maximo de 50 epocas, 28 epocas efectivamente entrenadas, con la mejor epoca en la numero 18; el checkpoint best.pt se selecciona por macro F1 sobre el split de validacion; early stopping con paciencia de 10; batch size de 128; imagenes redimensionadas a 224 x 224; optimizador resuelto automaticamente a MuSGD con learning rate 0,01 y momentum 0,9; y semilla fija a 0. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo que no aplica a un clasificador de vision. La innovacion destacable no esta en la arquitectura, sino en el pipeline reproducible del BDD100K-Toolkit: todos los modelos comparados se evaluan sobre el mismo split de test con las mismas metricas.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en cuatro categorias de momento del dia: daytime, night, dawn or dusk, unknown.
- Devuelve probabilidades por clase mediante el objeto probs de Ultralytics (top-1 y confianza asociada).
- Inferencia muy ligera: 1,4 M de parametros y entrada de 224x224, adecuada para procesar grandes volumenes de imagenes.
- Integracion directa con el ecosistema Ultralytics (carga con la clase YOLO y ejecucion con model(...)).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de modo thinking, vision multimodal, audio ni generacion de texto.
- No realiza deteccion de objetos ni segmentacion: es exclusivamente un cabezal de clasificacion.

## Casos de uso

- Preetiquetado de datasets de conduccion: dado un nuevo conjunto de imagenes de carretera, el modelo asigna automaticamente la etiqueta de momento del dia antes de una revision humana, reduciendo el coste de anotacion en pipelines de datos como los del propio BDD100K-Toolkit.
- Filtrado y muestreo de datasets por condiciones de iluminacion: permite seleccionar subconjuntos de imagenes nocturnas o de dia para entrenar detectores con representacion equilibrada de escenas dia/noche.
- Analisis de escenas en vehiculos o sistemas embebidos: con 1,4 M de parametros y entrada de 224x224 puede ejecutarse en CPU o en GPUs de baja gama, sirviendo como senal auxiliar de contexto (por ejemplo, activar heuristicas o modos de visualizacion nocturnos).
- Auditoria y control de calidad de anotaciones: comparar la prediccion del clasificador con las etiquetas timeofday existentes para detectar imagenes mal etiquetadas o ambiguas.
- Investigacion academica sobre clasificacion de escenas viales: sirve como baseline reproduceible frente a otros modelos (cnn, efficientvit, mobilenet) evaluados con el mismo split y las mismas metricas.
- Clasificacion por lotes en servidores de CPU: al ser tan pequeno, se pueden procesar millones de imagenes en paralelo con poco coste energetico, por ejemplo para indexar un archivo fotografico de trafico.
- Monitorizacion de flotas o camaras urbanas: etiquetar en tiempo real el momento del dia de los fotogramas capturados para agregar estadisticas de trafico por franja horaria.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (10 000 imagenes), no verificados por terceros.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,56 % |
| Macro F1 | 80,85 % |
| Balanced accuracy | 76,26 % |
| Macro precision | 87,87 % |
| Macro recall | 76,26 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 69,34 % | 50,00 % | 58,10 % | 778 |
| daytime | 92,85 % | 96,56 % | 94,67 % | 5258 |
| night | 98,00 % | 98,47 % | 98,24 % | 3929 |
| unknown | 91,30 % | 60,00 % | 72,41 % | 35 |

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en FP32 para los pesos (1,4 M de parametros, aproximadamente 5,6 MB) mas activaciones de 224x224, que son minimas. En la practica cabe en cualquier GPU con 1 GB o mas.
- GPU recomendadas: cualquiera. RTX 4090, RTX 3060, T4, A100 o H100 funcionan sin problema; el modelo esta muy por debajo de su capacidad.
- Cabe en GPU consumer y en CPU: al ser un modelo nano, la inferencia en CPU es viable para procesamiento por lotes, y en GPU es practicamente instantanea.
- Opciones de despliegue: la via oficial es Ultralytics (carga de best.pt con la clase YOLO). No se documenta exportacion a otros formatos, por lo que la conversion a ONNX, TensorRT o TFLite, aunque tecnicamente posible desde Ultralytics, no esta garantizada ni descrita por el autor. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Todos los modelos siguientes fueron evaluados sobre el mismo split de test de BDD100K Period (Time-of-Day) Classification, ordenados por top-1 accuracy segun la model card del autor.

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| convnext_atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| yolo11n-cls | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| efficientvit_b0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| yolo26n-cls | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| mobilenetv4_conv_small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| yolov8n-cls (este modelo) | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| resnet18 | 93,32 % | 80,50 % | 76,72 % | 85,87 % |

Las diferencias de top-1 entre todos los modelos son de pocas decimas, lo que indica que la tarea esta cerca de saturacion en las clases mayoritarias. En macro F1 el modelo empatiza con efficientvit_b0 en la zona alta, y destaca en macro precision (87,87 por ciento), solo por detras de yolo11n-cls. No se dispone de datos de licencia, contexto o disponibilidad de los modelos comparados mas alla de lo reflejado en la tabla.

## Limitaciones y advertencias

- Tarea no oficial: las etiquetas proceden del campo attributes.timeofday de BDD100K y no de un benchmark con leaderboard publico. Los resultados solo son comparables con otros modelos evaluados sobre este mismo split.
- Desequilibrio de clases severo: la clase unknown tiene solo 35 imagenes de test, por lo que sus metricas (recall 60 por ciento) son poco fiables. La clase dawn or dusk, con 778 imagenes, obtiene el peor F1 (58,10 por ciento) y un recall del 50 por ciento, lo que significa que se confunde con frecuencia con daytime o night.
- La buena top-1 accuracy (93,56 por ciento) esta inflada por el dominio de daytime y night; conviene fijarse en macro F1 y balanced accuracy para juzgar el rendimiento real.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos, especialmente en condiciones de iluminacion ambigua (amanecer, atardecer, tuneles, iluminacion artificial).
- Sesgos de datos: al derivar de BDD100K, hereda los sesgos geograficos y de captura del dataset (principalmente conduccion en Estados Unidos), por lo que puede generalizar peor en otros paises o condiciones de trafico no representadas.
- Limitaciones de idioma: no aplica, es un modelo de vision sin componente de texto.
- Restricciones de licencia: la licencia AGPL-3.0 es copyleft fuerte. El uso comercial es posible, pero obliga a liberar el codigo derivado bajo la misma licencia y puede imponer requisitos adicionales si el modelo se ofrece como servicio en red. Conviene revisar las condiciones con atencion antes de integrarlo en productos propietarios.
- Formato y despliegue: solo se publican pesos .pt de Ultralytics. No se garantiza la exportacion a otros runtimes y no se documenta cuantizacion, latencia ni throughput.
- Reproducibilidad: los resultados son declarados por el autor y no estan verificados por terceros (verified: false en la model card).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-yolov8n-cls
- Dataset: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Modelo relacionado (deteccion): https://huggingface.co/dronefreak/bdd100k-yolov8n
- Modelo relacionado (deteccion): https://huggingface.co/dronefreak/bdd100k-yolov8s
- Toolkit oficial de BDD100K: https://github.com/bdd100k/bdd100k
- Demo de YOLOv8 sobre BDD100K: https://github.com/WangYangfan/yolov8
- Dataset BDD100K en Ultralytics Platform: https://platform.ultralytics.com/yaobocheng/datasets/bdd100k
