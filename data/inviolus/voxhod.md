# inviolus/VoxHOD

## Resumen

VoxHOD es un detector de personas de tipo CenterNet, anchor-free, disenado especificamente para camaras cenitales de drones en misiones de busqueda y rescate. Lo desarrolla el autor independiente inviolus (codigo en el repositorio ErdemWilkinson/VoxHOD) y su propuesta central es la eficiencia extrema: 136.547 parametros y un fichero TFLite int8 de 197 KB, pensado para ejecutarse en microcontroladores de la clase ESP32-S3. El modelo no pretende sustituir a un detector de gran tamano, sino marcar en una tesela aerea de 160x160 RGB donde hay personas para que el dron senale zonas que merecen una inspeccion mas cercana por parte del equipo de rescate.

La relevancia actual del modelo reside en su encaje en el paradigma TinyML aplicado a sistemas aereos no tripulados: permite llevar la inferencia a bordo, en el propio microcontrolador del dron, sin depender de enlace de radio ni de computo en la nube, algo critico en escenarios de rescate con conectividad limitada. Frente a los detectores habituales de cientos de millones de parametros, VoxHOD demuestra que una red de 136 mil parametros puede alcanzar un recall del 82,5% en el conjunto de test HERIDAL a un umbral de 0,20, a costa de una precision del 15,8% y 0,47 falsas alarmas por tesela.

El modelo se publica bajo licencia CC BY 4.0 para los pesos (el codigo de entrenamiento es MIT) y se distribuye en formato Keras (modelo float) y TFLite (int8 con y sin QAT). La model card reconoce explicitamente que no se ha medido aun en un ESP32-S3 real ni sobre video de vuelo, por lo que su validacion en produccion esta pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterNet anchor-free (deteccion por heatmap de centros, stride 4) |
| Parametros totales | 136.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 160x160x3) |
| Tipos de cuantizacion | int8 full (QAT y post-training), float32 (Keras) |
| Idiomas soportados | no disponible (modelo de vision, sin componente de lenguaje) |
| Licencia | CC BY 4.0 (pesos); codigo de entrenamiento MIT |
| Formato de pesos | `.keras` (float), `.tflite` (int8 QAT y int8 PTQ) |

## Arquitectura y entrenamiento

VoxHOD sigue el esquema CenterNet: una red convolucional que predice un heatmap de centros de persona sobre una rejilla de 40x40 (stride 4) a partir de una entrada de 160x160 RGB normalizada como `pixel / 127.5 - 1`. La salida tiene tres canales: el canal 0 es el heatmap de probabilidad de centro de persona (0 a 1), y los canales 1 y 2 contienen el logaritmo de la anchura y altura de la caja en celdas de la rejilla. Las detecciones se extraen como maximos locales del heatmap por encima de un umbral, sin necesidad de anchors ni de NMS complejo, lo que simplifica enormemente el postprocesado en un microcontrolador.

El entrenamiento se realizo sobre el conjunto HERIDAL (CC BY 3.0), un dataset de imagenes aereas para busqueda y rescate en terreno mediterraneo, verano y luz diurna. La model card no detalla el numero de tokens ni la composicion exacta del dataset mas alla de la fuente, ni menciona tecnicas de RLHF o DPO (no aplicables a un detector). La innovacion tecnica destacable es el uso de quantization-aware training (QAT) para producir un fichero int8 que, segun el autor, no pierde rendimiento medible frente al modelo float: a umbral 0,45 el int8 QAT obtiene 59,7% de recall y 52,5% de precision, frente a 57,0% y 55,1% del float.

El modelo se distribuye en tres variantes: `voxocr_qat_int8.tflite` (recomendada, QAT full int8), `voxocr_int8.tflite` (cuantizacion post-entrenamiento del modelo float) y `voxocr.keras` (modelo float). La entrada y salida del TFLite son tensores int8 con parametros de cuantizacion `(scale, zero_point)` accesibles via la API de TensorFlow Lite.

## Capacidades

- Deteccion de personas en imagenes aereas cenitales (vista vertical desde dron) sobre teselas de 160x160 RGB.
- Salida de cajas delimitadoras y puntuacion de confianza por persona detectada.
- Inferencia en microcontroladores de la clase ESP32-S3 gracias a su tamano (197 KB int8).
- Ejecucion offline a bordo, sin dependencia de conectividad.
- Ajuste del umbral de deteccion para priorizar recall (busqueda) o precision (verificacion).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades mas alla de la deteccion de personas.

## Casos de uso

- Busqueda y rescate con dron: el modelo procesa teselas de 160x160 extraidas de las imagenes de la camara cenital y marca las celdas con posibles personas, permitiendo al dron senalar zonas candidatas a inspeccion mas cercana por el equipo de rescate. Es adecuado porque cabe en el microcontrolador y funciona sin enlace de datos.
- Patrullaje autonomo de bajo consumo: integrado en un ESP32-S3 a bordo, permite un pre-filtrado continuo de fotogramas y solo transmitir o almacenar las teselas con detecciones, reduciendo el ancho de banda y el consumo energetico.
- Sistemas de alerta temprana en zonas remotas: desplegado en estaciones fijas con camara cenital, detecta presencia de personas en areas de riesgo (montana, costa) y emite alertas locales.
- Investigacion en TinyML: sirve como referencia reproducible de detector CenterNet int8 para estudiar tecnicas de cuantizacion y despliegue en microcontroladores.
- Prototipado de pipelines de vision aerea: permite validar la logica de teselado, umbralizado y postprocesado antes de escalar a un detector mayor en GPU.
- Docencia y experimentacion: por su tamano y licencia permisiva, es util para ensenar deteccion de objetos anchor-free y cuantizacion en cursos de vision por computador.
- Validacion de hipotesis de despliegue en flotas de drones: permite medir el coste real de inferencia int8 en hardware embebido antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados en el conjunto de test HERIDAL (3.507 teselas, 372 personas). Una deteccion cuenta como acierto si su centro cae dentro de la caja de la persona expandida en una celda de la rejilla.

| Modelo, umbral | Recall | Precision | Falsas alarmas por tesela |
|---|---:|---:|---:|
| int8 QAT, 0,45 (mejor F1) | 59,7% | 52,5% | 0,06 |
| int8 QAT, 0,30 | 74,5% | 29,8% | 0,19 |
| int8 QAT, 0,20 | 82,5% | 15,8% | 0,47 |
| int8 QAT, 0,10 | 86,6% | 5,5% | 1,58 |
| float, 0,45 (mejor F1) | 57,0% | 55,1% | 0,05 |

La version v1 (primer entrenamiento infraentrenado) se incluye en la grafica de la model card con un recall del 28,8% en su mejor F1, solo como referencia comparativa. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo de vision.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en int8 (fichero de 197 KB); en float, unos 0,5 MB de pesos mas activaciones, despreciable frente a cualquier GPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para entrenamiento o evaluacion a gran escala, cualquier GPU consumer (RTX 3060 o superior) es mas que suficiente.
- Cabe en consumer GPU y en microcontroladores: el objetivo declarado es ESP32-S3, aunque el autor indica que el rendimiento (velocidad y memoria) aun no se ha medido en ese chip.
- Opciones de despliegue: TensorFlow Lite (recomendado, con el interprete `tf.lite.Interpreter`), TFLite Micro para microcontroladores, y Keras para el modelo float.
- Latencia y throughput estimados: no disponibles; el autor no ha publicado mediciones en ESP32-S3 ni en video de vuelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxHOD (inviolus) | 136.547 | 160x160 RGB | Deteccion de personas aerea | CC BY 4.0 (pesos), MIT (codigo) | HuggingFace, GitHub |
| Detectores CenterNet genericos | millones (p. ej. ResNet-18 backbone) | 512x512 o mayor | Deteccion de objetos generica | varia | Amplia |
| YOLO nano (familia YOLOv5n/YOLOv8n) | 1,9-3,2 M | 640x640 | Deteccion de objetos generica | GPL/AGPL o MIT segun version | Amplia |
| Detectores TinyML para microcontroladores | decenas a cientos de miles | variable | Deteccion generica | varia | Limitada |

No se dispone de comparaciones directas publicadas por el autor frente a estos modelos en el mismo conjunto de test. La comparativa debe tomarse como orientativa por categoria y tamano, no como benchmark verificado.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente sobre HERIDAL: verano, luz diurna y terreno mayoritariamente mediterraneo. Nieve, dosel forestal, agua, noche y camaras termicas no estan probados.
- No alcanza el 90% de recall en el conjunto de test; el maximo publicado es 86,6% a umbral 0,10, con 1,58 falsas alarmas por tesela.
- El rendimiento en ESP32-S3 (velocidad y memoria) y sobre video de vuelo real no se ha medido.
- Riesgo de falsos positivos elevado a umbrales bajos: a 0,20 hay 0,47 falsas alarmas por tesela, lo que en una mision real puede generar ruido si no se filtra.
- Limitacion de idioma: no aplica componente linguistico; la model card esta en ingles con un resumen en turco.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribucion; el codigo de entrenamiento es MIT. Verificar la atribucion requerida en despliegues de produccion.
- Uso previsto limitado a busqueda y rescate; el autor prohibe explicitamente su uso para seleccionar o danar personas.
- Modelo de vision puro: no soporta texto, agentes ni tool calling; no debe evaluarse con benchmarks de lenguaje.
- No disponible informacion sobre sesgos demograficos del detector (el dataset HERIDAL no se detalla en la model card).

## Enlaces

- HuggingFace: https://huggingface.co/inviolus/VoxHOD
- Codigo y detalles de entrenamiento: https://github.com/ErdemWilkinson/VoxHOD
- Dataset HERIDAL: https://zenodo.org/records/5662351
- Paper de referencia HERIDAL: D. Bozic-Stulic, Z. Marusic, S. Gotovac, "Deep Learning Approach in Aerial Imagery for Supporting Land Search and Rescue Missions", IJCV 2019.
