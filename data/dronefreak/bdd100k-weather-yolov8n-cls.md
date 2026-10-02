# dronefreak/bdd100k-weather-yolov8n-cls

## Resumen

El modelo `dronefreak/bdd100k-weather-yolov8n-cls` es un clasificador de imágenes basado en YOLOv8n y ajustado (fine-tuning) por el usuario dronefreak sobre el dataset BDD100K Weather Classification, que deriva de los atributos meteorológicos por imagen del benchmark BDD100K. Su tarea es la clasificación de escenas de conducción en 7 clases meteorológicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown. El modelo se enmarca dentro del proyecto BDD100K-Toolkit, una herramienta sin dependencias externas pensada para preparar BDD100K, entrenar modelos y evaluarlos con las mismas métricas sobre los mismos splits.

La relevancia del modelo reside en su tamano reducido (aproximadamente 1,4 millones de parametros) y en su caracter de referencia reproducible: el autor publica un model zoo completo con comparativas entre arquitecturas (convnext_atto, efficientvit_b0, resnet18, mobilenetv4_conv_small, yolo26n-cls, yolo11n-cls, yolov8n-cls) evaluadas bajo idéntico protocolo, lo que permite analizar el compromiso entre coste computacional y precisión en una tarea auxiliar de percepción para conducción autónoma.

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, orientado a investigación y a pipelines de preprocesado en sistemas de conducción autónoma, no a generación de texto ni a tareas de lenguaje. La licencia AGPL-3.0 condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de clasificacion YOLOv8n-cls (Ultralytics YOLOv8, variante nano para clasificacion de imagenes) |
| Parametros totales | ~1,4 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), compatible con el framework Ultralytics |
| Tarea | Image classification (clasificacion de imagenes) |
| Numero de clases | 7 (clear, partly cloudy, overcast, rainy, snowy, foggy, unknown) |
| Tamano de entrada | 224 |
| Framework | Ultralytics YOLO |
| Dataset de entrenamiento | dronefreak/BDD100K-Weather-Classification |

## Arquitectura y entrenamiento

El modelo parte de `Ultralytics/YOLOv8`, en su variante nano de clasificacion (`yolov8n-cls`), una red neuronal convolucional optimizada para clasificacion de imagenes con un coste de parametros muy bajo (alrededor de 1,4 M). Se aplicó un ajuste fino sobre el checkpoint preentrenado (`Pretrained: True`) durante 36 épocas efectivas, con un maximo configurado de 50 épocas, un batch size de 128, resolución de entrada de 224 y un early stopping con paciencia 10. El mejor checkpoint (`best.pt`) se seleccionó en la época 26 en funcion de la métrica macro_f1 sobre el split de validacion.

El optimizador se resolvió automaticamente a MuSGD con learning rate 0,01 y momentum 0,9, con semilla 0. No se dispone de informacion en la model card sobre el numero total de tokens ni sobre la composicion exacta del dataset mas alla de su derivacion de BDD100K; tampoco se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no aplican a una tarea de clasificacion visual. La innovacion principal del proyecto es metodologica: un protocolo de evaluacion unificado sobre los mismos splits y las mismas metricas para comparar varias arquitecturas de clasificacion.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en 7 clases meteorologicas.
- Salida de probabilidades por clase mediante la API `probs` de Ultralytics (acceso a `top1`, `top1conf` y al vector completo de probabilidades).
- Deteccion de condiciones representadas con suficientes muestras (clear, rainy, snowy, unknown, overcast, partly cloudy).
- Inferencia sobre imagenes individuales o lotes a traves del framework Ultralytics.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades adicionales.

## Casos de uso

- Preprocesado en pipelines de conduccion autonoma: clasificar la condicion meteorologica de cada fotograma antes de decidir que modelo de deteccion o segmentacion aplicar, dado el bajo coste computacional de un modelo de 1,4 M de parametros.
- Etiquetado automatico asistido: usar el clasificador para pre-anotar el atributo meteorologico de grandes volumenes de imagenes de forma previa a una revision humana, aprovechando su Top-1 del 81,22 % en escenas claras y condiciones frecuentes.
- Filtrado de datasets: segmentar un corpus de imagenes de carretera segun la clase meteorologica para construir subconjuntos equilibrados o centrados en condiciones adversas (rainy, snowy).
- Monitorizacion de flotas y sistemas ADAS: inferir en tiempo real la condicion climatica a bordo o en servidor para activar protocolos de conduccion conservadora cuando se detecta lluvia o nieve.
- Investigacion en robustez de modelos de vision: emplear el model zoo del autor para estudiar el impacto del clima en tareas posteriores de deteccion, ya que todas las variantes se evaluaron bajo el mismo protocolo.
- Benchmarking reproductible: replicar los resultados del BDD100K-Toolkit como linea base para comparar nuevas arquitecturas de clasificacion de escenas de conduccion.
- Validacion de calidad de datos meteorologicos: detectar desequilibrios o clases infrarrepresentadas (como foggy, con solo 13 imagenes de test) en un dataset antes de entrenar modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` (10 000 imagenes). El campo `verified` es `false` en todos los casos.

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 81,22 % |
| Top-5 accuracy | 99,75 % |
| Macro F1 | 63,07 % |
| Balanced accuracy | 61,42 % |
| Macro precision | 65,52 % |
| Macro recall | 61,42 % |

Resultados por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| clear | 89,31 % | 92,63 % | 90,94 % | 5346 |
| foggy | 0,00 % | 0,00 % | 0,00 % | 13 |
| overcast | 62,26 % | 69,49 % | 65,68 % | 1239 |
| partly cloudy | 66,03 % | 61,11 % | 63,48 % | 738 |
| rainy | 88,42 % | 65,18 % | 75,04 % | 738 |
| snowy | 81,67 % | 67,23 % | 73,75 % | 769 |
| unknown | 70,96 % | 74,33 % | 72,60 % | 1157 |

Comparativa del model zoo del propio autor, todos evaluados sobre el mismo split `test` y ordenados por Top-1 accuracy:

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| convnext_atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| efficientvit_b0 | 82,79 % | 65,10 % | 63,62 % | 67,11 % |
| resnet18 | 82,19 % | 64,30 % | 62,97 % | 66,08 % |
| mobilenetv4_conv_small | 82,16 % | 66,51 % | 64,37 % | 80,44 % |
| yolo26n-cls | 82,04 % | 64,09 % | 62,46 % | 66,57 % |
| yolo11n-cls | 81,32 % | 62,91 % | 61,19 % | 65,68 % |
| yolov8n-cls | 81,22 % | 63,07 % | 61,42 % | 65,52 % |

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 1,4 M de parametros y entrada de 224x224, la huella de memoria es minima; los pesos en `best.pt` ocupan del orden de pocos MB (el repo reporta 0,0 GB, es decir, por debajo del umbral de redondeo mostrado).
- Inferencia viable en CPU para lotes pequenos y en cualquier GPU consumer, incluidas GTX 1050/1650, RTX 2060, RTX 3060, RTX 4090 o integradas modernas.
- No se requieren GPUs de datacenter (A100, H100) para inferencia; su uso solo tendria sentido para entrenamiento a gran escala o procesado masivo de datasets.
- Opciones de despliegue: framework Ultralytics (PyTorch), exportacion a ONNX, TensorRT, OpenVINO, CoreML u otros formatos soportados por la herramienta de exportacion de Ultralytics. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se conocen alternativas publicadas por terceros para esta misma tarea concreta (clasificacion meteorologica de 7 clases sobre BDD100K). La comparativa mas directa es el model zoo del propio autor, evaluado bajo identico protocolo:

| Modelo | Top-1 | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| yolov8n-cls (este modelo) | 81,22 % | 63,07 % | AGPL-3.0 | HuggingFace (dronefreak) |
| yolo11n-cls | 81,32 % | 62,91 % | AGPL-3.0 (Ultralytics) | HuggingFace (dronefreak) |
| yolo26n-cls | 82,04 % | 64,09 % | AGPL-3.0 (Ultralytics) | HuggingFace (dronefreak) |
| convnext_atto | 83,00 % | 67,44 % | segun autor de la variante | HuggingFace (dronefreak) |
| efficientvit_b0 | 82,79 % | 65,10 % | segun autor de la variante | HuggingFace (dronefreak) |
| resnet18 | 82,19 % | 64,30 % | segun autor de la variante | HuggingFace (dronefreak) |
| mobilenetv4_conv_small | 82,16 % | 66,51 % | segun autor de la variante | HuggingFace (dronefreak) |

En terminos absolutos, este checkpoint ocupa la ultima posicion del model zoo tanto en Top-1 como en Macro F1, aunque las diferencias con yolo11n-cls son marginales (0,10 puntos de Top-1 a favor de yolo11n-cls).

## Limitaciones y advertencias

- La clase `foggy` no se clasifica correctamente en ningun caso: precision, recall y F1 son 0,00 % sobre las 13 imagenes de test. El propio autor recomienda tratarla como no soportada.
- El desequilibrio del dataset es severo: 5346 imagenes de `clear` frente a 13 de `foggy`, lo que explica tanto el buen rendimiento en clases mayoritarias como el fallo en las minoritarias.
- La precision sobre las clases `overcast` (62,26 %) y `partly cloudy` (66,03 %) es notablemente inferior a la de `clear`, `rainy` o `snowy`, lo que sugiere confusion entre condiciones de nubosidad.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea confiada en condiciones ambiguas o con baja luminosidad no representadas en el dataset.
- Los resultados estan marcados como no verificados (`verified: false`) y provienen del propio autor, sin validacion independiente.
- Licencia AGPL-3.0: impone obligaciones de copyleft que pueden afectar a su uso en productos propietarios o servicios en red; conviene revisar compatibilidad antes de integrarlo en produccion comercial.
- Modelo de nicho con 0 descargas y 0 likes: no hay comunidad, soporte ni evidencia de uso en produccion.
- No se documentan sesgos demograficos ni geograficos mas alla de los derivados del propio BDD100K (recoleccion centrada en Estados Unidos).
- No debe confundirse con un modelo de deteccion: aunque herede la familia YOLOv8, esta variante solo realiza clasificacion de imagen completa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/dronefreak/bdd100k-weather-yolov8n-cls
- Dataset de entrenamiento: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Modelo relacionado (deteccion BDD100K): https://huggingface.co/dronefreak/bdd100k-yolov8n
- Coleccion de deteccion BDD100K del autor: https://huggingface.co/collections/dronefreak/bdd100k-object-detection-model-zoo
- Model Zoo oficial de BDD100K: https://github.com/SysCV/bdd100k-models
- Implementacion YOLOv8/YOLOv9/RT sobre BDD100K: https://github.com/Desuuy/OD-BDD100K
- Paper BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Paper referenciado en los tags (arXiv:2304.00501): https://arxiv.org/abs/2304.00501
