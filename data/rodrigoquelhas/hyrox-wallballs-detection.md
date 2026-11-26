# RodrigoQuelhas/hyrox-wallballs-detection

## Resumen

HYROX wall balls detection es un modelo de deteccion de objetos especializado en un dominio muy concreto: identificar el balon medicinal y la diana de pared en grabaciones del ejercicio *wall balls* de HYROX y cross-training. Lo desarrolla RodrigoQuelhas como componente de vision artificial de [Wall Ball Judge](https://wallballs.app), una aplicacion movil que cuenta y valida repeticiones de forma automatica. El modelo detecta dos clases: `ball` (el balon, en las manos o en el aire) y `target` (la marca o placa en la pared que el balon debe golpear).

Tecnicamente es un fine-tuning de YOLO26n de Ultralytics, la variante nano de la familia YOLO26, preentrenada primero en Objects365 y luego en COCO. El resultado es un detector muy ligero (repo de 0,1 GB) que se distribuye en tres resoluciones de entrada (320, 416 y 640 pixeles) y en dos formatos de inferencia, ONNX y LiteRT (`.tflite`), ademas de los pesos `.pt` para reentrenamiento. Esta orientado a ejecucion en dispositivo movil, no a servidores.

Su relevancia es la de los modelos verticales: no compite en benchmarks generales de deteccion, sino que resuelve un problema de conteo de repeticiones con latencia y coste minimos en un telefono. La licencia AGPL-3.0, heredada de los pesos de Ultralytics, condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), variante nano (YOLO26n), detector single-stage |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen de 320, 416 o 640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen ONNX y LiteRT; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (deteccion de objetos, sin salida de texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (Ultralytics), `.onnx` (ONNX Runtime), `.tflite` (LiteRT) |
| Clases | 2 (`ball`, `target`) |
| Resoluciones de entrada | 320, 416, 640 px |
| Modelo base | Ultralytics/YOLO26 (YOLO26n) |
| Dataset de entrenamiento | RodrigoQuelhas/wallballs |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un detector YOLO26 en su variante nano, la mas pequena de la familia. YOLO26 es una arquitectura de deteccion de una sola etapa que predice directamente cajas y puntuaciones por clase sobre una rejilla de candidatos; en este caso, cada columna de salida contiene centro x, centro y, ancho, alto y una puntuacion por cada una de las dos etiquetas. El autor parte de los pesos de YOLO26n que Ultralytics entreno secuencialmente en Objects365 y COCO, y los ajusta finamente sobre su propio dataset de wall balls.

El conjunto de datos de ajuste es `RodrigoQuelhas/wallballs`, compuesto por grabaciones propias del ejercicio (la model card menciona "cuatro de mis grabaciones" para los ejemplos). No se documentan el numero de imagenes, la composicion exacta del dataset, ni si hubo aumentos de datos o tecnicas de regularizacion especificas. Tampoco se indica el numero de epochs, el hardware de entrenamiento ni las metricas de validacion obtenidas. No hay evidencia de RLHF ni de etapas de alineacion, algo esperable en un detector de objetos.

La innovacion practica no esta en la arquitectura, sino en el empaquetado: el mismo modelo se exporta a tres resoluciones y dos runtimes, con un preprocesamiento documentado (redimensionado a 640 px de ancho, letterbox sobre fondo gris 114, normalizacion a [0,1] y conversion a RGB con formato NCHW) que el autor reproduce tanto para Ultralytics como para ONNX Runtime puro. El umbral recomendado es `conf=0.8` e `iou=0.1`, con NMS por clase.

## Capacidades

- Deteccion de dos clases en imagenes y video: balon medicinal (`ball`) y diana de pared (`target`).
- Deteccion del balon tanto en las manos del atleta como en el aire durante el lanzamiento.
- Deteccion de la diana en distintas condiciones de pared y marcado.
- Inferencia en dispositivo movil mediante LiteRT y en escritorio/servidor mediante ONNX Runtime.
- Exportacion y reentrenamiento a otras resoluciones con Ultralytics a partir de `detector.pt`.
- Integracion con `cv2.dnn.NMSBoxesBatched` para supresion de no maximos por clase.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.
- No tiene capacidades multilingues ni de audio.

## Casos de uso

- Juicio automatico de repeticiones en una app movil: el modelo detecta balon y diana fotograma a fotograma y permite inferir si el balon alcanza la diana, base del conteo de reps de Wall Ball Judge. La version de 320 px sobre un recorte alrededor de la diana reduce el coste computacional en el telefono.
- Analisis de video de entrenamiento: procesar un video completo con `detector-416.onnx` para extraer trayectorias del balon y marcar los lanzamientos validos, util para revisar sesiones de entrenamiento o competiciones.
- Arbitraje asistido en competiciones de HYROX o cross-training: deteccion en tiempo real desde una camara fija apuntando a la pared, con la version de 640 px para dianas pequenas o atletas lejanos.
- Monitorizacion de forma tecnica: al registrar la posicion del balon y la diana en cada repeticion se pueden derivar metricas de consistencia (altura de lanzamiento, desviacion respecto a la diana) para entrenadores.
- Prototipado rapido de apps deportivas: el paquete ONNX/LiteRT y el script de inferencia con numpy y OpenCV permiten integrar el detector sin depender del framework Ultralytics.
- Investigacion en vision aplicada al deporte: servir de base para fine-tuning sobre otros ejercicios con objetos y dianas (por ejemplo, lanzamientos a un objetivo), reutilizando `detector.pt`.
- Procesamiento por lotes en servidor: usar ONNX Runtime en CPU para anotar grandes volumenes de clips sin GPU, dado el reducido coste del modelo nano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall ni comparaciones cuantitativas con otros detectores; tampoco se documentan latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano nano del modelo y la entrada maxima de 640 px, es esperable que quede muy por debajo de 1 GB en FP32, pero no hay dato publicado.
- GPU recomendadas: no se especifican. El modelo esta pensado para ejecucion en telefono (LiteRT) y CPU (ONNX Runtime); cualquier GPU consumer moderna seria sobredimensionada para este detector.
- Cabe en GPU consumer: si, con enorme margen, aunque el objetivo de diseno es la inferencia en dispositivo movil.
- Opciones de despliegue: ONNX Runtime, LiteRT (`.tflite`), Ultralytics (`.pt` y exportaciones). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a un detector de objetos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Enfoque |
|---|---|---|---|---|---|
| hyrox-wallballs-detection | no disponible (YOLO26n) | 320 / 416 / 640 px | 2 (balon, diana) | AGPL-3.0 | Deteccion especifica de wall balls, exportada a movil |
| Ultralytics YOLO26n (base) | no disponible | configurable | 80 (COCO) | AGPL-3.0 | Deteccion general; no conoce balon ni diana de HYROX |
| YOLOv8n / YOLO11n de Ultralytics | no disponible | configurable | 80 (COCO) | AGPL-3.0 | Alternativas generales de la misma familia, sin ajuste al dominio |
| Detectores genericos de objetos deportivos | no disponible | no disponible | variable | variable | No se dispone de informacion sobre modelos equivalentes publicos para este dominio concreto |

La comparacion relevante es contra el propio YOLO26n sin ajustar: el valor del modelo esta en la especializacion en dos clases y en el empaquetado multi-resolucion y multi-runtime, no en superar a detectores generales en COCO.

## Limitaciones y advertencias

- Dominio muy restringido: solo detecta balon medicinal y diana de pared; no reconoce atletas, posturas ni otros objetos.
- Sin metricas publicadas: no hay mAP, precision ni recall, por lo que el rendimiento real debe validarse en el escenario de despliegue.
- Dataset de ajuste pequeno y no documentado: la model card menciona grabaciones propias; la generalizacion a otras paredes, iluminaciones, camaras y balones no esta cuantificada.
- Riesgo de falsos positivos y negativos en condiciones adversas (oclusion, movimiento rapido, balon fuera de foco), con impacto directo en el conteo de repeticiones.
- Licencia AGPL-3.0 heredada de Ultralytics: el uso en servicios en red puede obligar a liberar el codigo de la aplicacion; para uso comercial cerrado seria necesario negociar una licencia con Ultralytics.
- No afiliado ni respaldado por HYROX, segun indica el autor; el uso del nombre HYROX en productos comerciales requiere cautela legal.
- Sin soporte de texto, audio ni multilingue: cualquier logica de decision (por ejemplo, validar una repeticion) debe implementarse fuera del modelo.
- El umbral recomendado (`conf=0.8`, `iou=0.1`) esta ajustado al caso de uso del autor y puede no ser optimo para otros escenarios.
- Los `.tflite` devuelven cajas en fracciones de la entrada, lo que exige multiplicar por el tamano de entrada; un error de integracion aqui invalida las detecciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RodrigoQuelhas/hyrox-wallballs-detection
- Dataset: https://huggingface.co/datasets/RodrigoQuelhas/wallballs
- Aplicacion Wall Ball Judge: https://wallballs.app
- Codigo de la app: https://github.com/RomarQ/wall-ball-judge
- Video de ejemplos: https://huggingface.co/RodrigoQuelhas/hyrox-wallballs-detection/resolve/main/media/examples.mp4
- Modelo base YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
