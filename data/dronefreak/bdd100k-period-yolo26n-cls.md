# dronefreak/bdd100k-period-yolo26n-cls

## Resumen

El modelo `dronefreak/bdd100k-period-yolo26n-cls` es un clasificador de imagenes de escenas de conduccion, resultado de un ajuste fino (finetune) del backbone de clasificacion YOLO26n-cls de Ultralytics sobre el dataset BDD100K. Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, una herramienta sin dependencias pesadas pensada para preparar BDD100K, entrenar modelos sobre el y evaluarlos con las mismas metricas y los mismos splits. La tarea es una clasificacion de 4 clases derivada del campo `attributes.timeofday` de BDD100K: `daytime`, `night`, `dawn or dusk` y `unknown`.

Se trata de un modelo muy pequeno, de aproximadamente 1,5 millones de parametros, que opera sobre imagenes de 224x224 y que esta disenado para inferencia de bajisimo coste en entornos embarcados o en pipelines de preprocesado masivo de datos. No es un modelo de lenguaje ni un modelo multimodal generativo: no procesa texto, no tiene ventana de contexto y su salida es una distribucion de probabilidad sobre cuatro clases.

Su relevancia actual es practica: la clasificacion automatica de la condicion de iluminacion es un paso habitual en la curación de datasets de conduccion autonoma, en la seleccion de variantes de modelos de percepcion y en el enrutado de clips de video para anotacion. El autor declara una exactitud top-1 del 93,61 % y un macro F1 del 80,41 % en el split de test, con un rendimiento equilibrado respecto a alternativas como convnext_atto, efficientvit_b0 o yolo11n-cls.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de clasificacion de imagenes (familia Ultralytics YOLO26, variante `n-cls`); detalles internos no disponibles |
| Parametros totales | 1,5 M (segun badge de la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (el repositorio publica `best.pt` en PyTorch) |
| Idiomas soportados | no aplica (clasificacion de imagenes; no hay soporte linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (checkpoint PyTorch cargable con la libreria `ultralytics`) |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Resolucion de entrada | 224x224 |
| Numero de clases | 4 (`dawn or dusk`, `daytime`, `night`, `unknown`) |
| Framework | Ultralytics (`library_name: ultralytics`) |

## Arquitectura y entrenamiento

El modelo parte de `Ultralytics/YOLO26`, en su variante de clasificacion `yolo26n-cls` (la mas ligera de la familia). Se trata por tanto de una red convolucional de clasificacion de imagen, no de un transformer ni de un modelo hibrido. La informacion disponible no detalla la composicion de capas, el tipo de bloque convolucional ni las innovaciones especificas de la generacion YOLO26; la model card se limita a etiquetar el modelo con la libreria Ultralytics y el framework YOLO.

El ajuste fino se realizo sobre el dataset `dronefreak/BDD100K-Period-Classification`, que contiene los splits preparados por el propio autor a partir de BDD100K. La configuracion de entrenamiento declarada es la siguiente: maximo de 50 epocas con early stopping de paciencia 10, 28 epocas efectivamente ejecutadas, mejor checkpoint en la epoca 18 seleccionado por macro F1 sobre el split de validacion, tamano de lote 128, imagenes de 224x224, pesos preentrenados activados, semilla fija 0 y optimizador resuelto automaticamente a MuSGD con `lr=0.01` y `momentum=0.9`. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision.

El dataset de evaluacion es `test` con 10.000 imagenes, y el propio autor advierte que se trata de una tarea no oficial, sin leaderboard publico, por lo que las puntuaciones solo son comparables entre modelos evaluados exactamente sobre ese mismo split. El desglose por clase revela un fuerte desbalance: 5.258 imagenes de `daytime`, 3.929 de `night`, 778 de `dawn or dusk` y solo 35 de `unknown`.

## Capacidades

- Clasificacion de imagen en 4 clases de franja horaria: `daytime`, `night`, `dawn or dusk` y `unknown`.
- Salida de probabilidades por clase, con acceso directo a la clase top-1 y a su confianza mediante la API de Ultralytics (`probs.top1`, `probs.top1conf`).
- Inferencia sobre imagen individual o lotes, con entrada fija de 224x224.
- Ejecucion eficiente en CPU y en hardware embarcado gracias a sus 1,5 M de parametros.
- Integracion directa con el ecosistema Ultralytics (carga de pesos, validacion, exportacion), aunque la informacion disponible no confirma que el repositorio incluya artefactos exportados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No tiene capacidades multilingues, de audio ni de vision-lenguaje.

## Casos de uso

- Curacion y etiquetado de datasets de conduccion: clasificar automaticamente grandes volumenes de imagenes de dashcam o de flotas para poblar el campo `timeofday` sin anotacion manual, dado el bajo coste computacional por imagen.
- Muestreo estratificado por condicion de iluminacion: usar las predicciones para construir splits de train/validacion balanceados entre dia, noche y crepusculo antes de entrenar modelos de deteccion o segmentacion.
- Enrutado de clips hacia anotacion: en un pipeline de ingesta de video, clasificar cada clip o fotograma clave y enviar solo las franjas subrepresentadas (por ejemplo, `dawn or dusk`) a los anotadores humanos.
- Seleccion dinamica de modelo de percepcion: en un stack ADAS, elegir entre una variante de deteccion optimizada para condiciones diurnas y otra para nocturnas segun la prediccion de este clasificador.
- Control de exposicion y procesado de imagen en camara: ajustar la curva tonal, la ganancia o el modo HDR de la captura en funcion de la franja detectada, como etapa previa barata a modulos mas costosos.
- Validacion de metadatos existentes: contrastar la etiqueta declarada de hora del dia con la prediccion para detectar registros mal etiquetados en datasets ya publicados.
- Inferencia en el borde: desplegar el clasificador en dispositivos como Jetson, Raspberry Pi o modulos con NPU ligera para tareas de triaje previas a un modelo mayor.
- Monitorizacion de condiciones operativas en flotas: etiquetar en tiempo real la franja horaria de cada trayecto para analitica agregada de siniestralidad o de uso del vehiculo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split `test` de 10.000 imagenes del dataset BDD100K Period (Time-of-Day) Classification:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 93,61 % |
| Macro F1 | 80,41 % |
| Balanced accuracy | 77,72 % |
| Macro precision | 83,88 % |
| Macro recall | 77,72 % |

Desglose por clase (mismo split):

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 68,37 % | 53,34 % | 59,93 % | 778 |
| daytime | 93,39 % | 95,97 % | 94,66 % | 5.258 |
| night | 97,90 % | 98,70 % | 98,30 % | 3.929 |
| unknown | 75,86 % | 62,86 % | 68,75 % | 35 (muy pocas) |

Comparativa publicada por el autor, con todos los modelos evaluados sobre el mismo split `test` y ordenados por exactitud top-1:

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| convnext_atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| yolo11n-cls | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| efficientvit_b0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| yolo26n-cls (este modelo) | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| mobilenetv4_conv_small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| yolov8n-cls | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| resnet18 | 93,32 % | 80,50 % | 76,72 % | 85,87 % |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un clasificador de vision.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precision habitual. Con 1,5 M de parametros, los pesos ocupan aproximadamente 6 MB en FP32 y 3 MB en FP16; el grueso de la memoria corresponde a las activaciones de entrada a 224x224 y al tamano de lote.
- CPU: la inferencia es viable directamente en CPU, lo que permite procesar lotes grandes en servidores sin GPU.
- GPU recomendadas: cualquier GPU es suficiente. Para lotes de gran tamano tiene sentido usar T4, L4, RTX 3060 o superiores; A100 o H100 resultan innecesarias pero compatibles si el pipeline ya las tiene disponibles.
- Encaje en GPU de consumo: si, en cualquier GPU de consumo, e incluso en graficas integradas y aceleradores dedicados (Coral, NPU de movil, Jetson Nano o superior, Raspberry Pi).
- Opciones de despliegue: la API Python de Ultralytics (`ultralytics.YOLO` con `best.pt`) es la ruta documentada en la model card. La libreria Ultralytics soporta exportacion a otros formatos (ONNX, TensorRT, OpenVINO, TFLite, CoreML) como capacidad del framework, aunque la informacion disponible no confirma artefactos exportados para este checkpoint concreto. Los servidores orientados a LLM (vLLM, TGI, Ollama) no aplican a este modelo.
- Latencia y throughput: no se publican cifras en la informacion disponible. Por tamano y resolucion de entrada, el modelo esta disenado para escenarios de inferencia en tiempo real o de procesado masivo por lotes, pero no se dispone de medidas concretas.

## Comparativa con modelos similares

Alternativas evaluadas por el propio autor sobre el mismo split `test`:

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26n-cls (este modelo) | 93,61 % | 80,41 % | 77,72 % | AGPL-3.0 | HuggingFace, `dronefreak/bdd100k-period-yolo26n-cls` |
| yolo11n-cls | 93,79 % | 80,13 % | 75,19 % | AGPL-3.0 (licencia Ultralytics, no confirmada en la informacion) | ecosistema Ultralytics |
| efficientvit_b0 | 93,71 % | 80,98 % | 77,14 % | no disponible | no disponible |
| convnext_atto | 93,95 % | 80,75 % | 76,82 % | no disponible | no disponible |
| mobilenetv4_conv_small | 93,57 % | 80,22 % | 76,22 % | no disponible | no disponible |
| yolov8n-cls | 93,56 % | 80,85 % | 76,26 % | AGPL-3.0 (licencia Ultralytics, no confirmada en la informacion) | ecosistema Ultralytics |
| resnet18 | 93,32 % | 80,50 % | 76,72 % | no disponible | no disponible |

Diferencias clave observadas en los datos aportados: la exactitud top-1 y el macro F1 de este modelo estan en la parte media-baja de la tabla (diferencias de decimas de punto con los lideres), mientras que su balanced accuracy es la mas alta de todas las alternativas listadas (77,72 %), lo que sugiere un comportamiento algo mas equilibrado entre clases pese a un macro precision mas bajo. No se dispone del numero de parametros, tamano de contexto ni licencia del resto de modelos, por lo que la comparacion debe limitarse a las metricas publicadas.

## Limitaciones y advertencias

- Tarea no oficial: las etiquetas proceden del campo `attributes.timeofday` de BDD100K y no de un benchmark con leaderboard publico. Las puntuaciones solo son comparables entre modelos evaluados exactamente sobre este split de test.
- Desbalance de clases severo: solo 35 imagenes de test pertenecen a la clase `unknown`, y 778 a `dawn or dusk`. La clase `dawn or dusk` es la mas debil con diferencia (F1 del 59,93 %, recall del 53,34 %), lo que implica que el modelo fallara con frecuencia en condiciones de iluminacion crepuscular, precisamente las mas ambiguas.
- Ambiguedad intrinseca de la etiqueta: la frontera entre `dawn or dusk`, `daytime` y `night` es difusa segun la exposicion de la camara y las condiciones meteorologicas, lo que limita el techo alcanzable en esas clases.
- Dominio restringido: el modelo esta ajustado exclusivamente sobre escenas de conduccion de BDD100K. Su comportamiento fuera de ese dominio (interiores, camaras fijas, otros paises o climatologias) no esta documentado en la informacion disponible.
- Riesgo de clasificacion erronea confiada: al ser un clasificador no hay alucinacion de texto, pero si puede asignar una probabilidad alta a la clase equivocada en escenas nocturnas con iluminacion artificial intensa o en imagenes con desenfoque de movimiento.
- Licencia AGPL-3.0: es una licencia copyleft con clausula de uso en red. El uso comercial es posible, pero si se modifica el modelo o se ofrece como servicio a traves de una red, es preceptivo liberar el codigo fuente correspondiente bajo la misma licencia. Conviene revisar ademas las condiciones de licencia del modelo base Ultralytics YOLO26, que suele requerir licencia empresarial para determinados usos comerciales.
- La section de limitaciones de la model card original aparece truncada en la informacion proporcionada, por lo que podrian existir advertencias adicionales del autor no recogidas aqui.
- El modelo no ha sido verificado por un tercero: todas las metricas figuran con `verified: false` en el model-index.
- Uso responsable: no debe emplearse como unico criterio de decision en sistemas de seguridad critica sin validacion propia sobre datos representativos del despliegue previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-yolo26n-cls
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit (fuente de las metricas): https://github.com/dronefreak/bdd100k-toolkit
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Modelo relacionado del mismo autor (deteccion): https://huggingface.co/dronefreak/bdd100k-yolo26n
- Publicacion del autor sobre la coleccion de modelos BDD100K: https://huggingface.co/posts/dronefreak/988753800362571
- Papers referenciados en las etiquetas: https://arxiv.org/abs/2606.03748 y https://arxiv.org/abs/1805.04687
- Repositorio de inferencia YOLO sobre BDD100K: https://github.com/shravanambudkar/yolo-bdd100k
- Model zoo oficial de BDD100K: https://github.com/SysCV/bdd100k-models
