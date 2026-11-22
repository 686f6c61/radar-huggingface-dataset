# mpa-17/yolo26s-construction-ppe

## Resumen

`yolo26s-construction-ppe` es un modelo de deteccion de objetos derivado de YOLO26 en su variante "s" (small), publicado por el usuario mpa-17 y afinado especificamente para detectar equipos de proteccion individual (EPI) en obras de construccion. El modelo identifica cinco clases: casco (`helmet`), persona sin casco (`no-helmet`), persona sin chaleco (`no-vest`), persona (`person`) y chaleco reflectante (`vest`). Se distribuye en formato PyTorch (`best.pt`) y en varias exportaciones ONNX (FP32, FP16 e INT8 estatico).

El modelo parte de los pesos preentrenados de Ultralytics YOLO26s y se ajusta fino sobre el dataset `Francesco/construction-safety-gsnvb` (procedente de Roboflow 100, licencia CC BY 4.0). La relevancia practica esta en el ambito de la seguridad laboral: permite automatizar la verificacion del uso de casco y chaleco en imagenes o video de obra, una tarea de inspeccion que tradicionalmente se hace de forma manual.

El autor documenta de forma inusualmente rigurosa el rendimiento, con intervalos de confianza por bootstrap, auditoria de fugas entre splits mediante MD5 y hashes perceptuales, y comparacion de variantes de cuantizacion. Cabe destacar que la version INT8 estatica incluida en el repositorio sufre una degradacion severa de precision (mAP50-95 de 0,279 frente a 0,509 en FP32), por lo que el propio autor recomienda su uso solo cuando el ahorro de tamano y latencia en CPU compense esa perdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible (pesos FP32 de 19,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1x3x640x640) |
| Tipos de cuantizacion | FP32, FP16, INT8 estatico (QDQ); se mencionan INT8 dinamico y `quantize=8` de Ultralytics como referencia no distribuida |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`best-fp32.onnx`, `best-fp16.onnx`, `best-int8.onnx`) |

## Arquitectura y entrenamiento

Se trata de un detector YOLO26 en variante small, es decir, una red convolutional de una sola etapa orientada a deteccion en tiempo real. El modelo se inicializa desde los pesos oficiales de YOLO26s de Ultralytics y se ajusta fino sobre el dataset de seguridad en construccion. La entrada es una imagen RGB de 640x640 con letterboxing; la salida ONNX (`output0`) tiene forma 1x9x8400, con cuatro coordenadas de caja (centro x, centro y, ancho, alto) y cinco puntuaciones de clase, seguida de NMS consciente de clase con IoU 0,7.

El dataset de entrenamiento es `Francesco/construction-safety-gsnvb` (Roboflow 100, CC BY 4.0) con sus splits oficiales: 997 imagenes de entrenamiento (995 tras auditoria), 90 de validacion y 119 de test. El autor realizo una auditoria de calidad que incluye deteccion de fugas entre splits mediante MD5 del fichero, MD5 de los pixeles y un hash perceptual de 128 bits (pHash + dHash, tambien contra la imagen espejada), encontrando 2 duplicados cruzados que fueron eliminados; tambien se eliminaron 2 cajas degeneradas de menos de 2 px y se descarto la clase padre vacia `construction-safety`. No se documentan en la informacion disponible detalles sobre el numero de epocas, hiperparametros de entrenamiento ni uso de aumento de datos mas alla de lo implicito en el pipeline de Ultralytics.

## Capacidades

- Deteccion de objetos en imagenes de obra con cinco clases: `helmet` (casco), `no-helmet` (persona sin casco), `no-vest` (persona sin chaleco), `person` (persona) y `vest` (chaleco reflectante).
- Deteccion de incumplimientos de EPI de forma directa: las clases `no-helmet` y `no-vest` permiten identificar personas que no llevan la proteccion, sin necesidad de logica post-hoc de emparejamiento.
- Inferencia en tiempo real: 6,3 ms por imagen en Tesla T4 con ONNX FP16 (160 FPS) y 67,1 ms en CPU de 8 hilos con ONNX FP32 (14,9 FPS).
- Despliegue en multiples entornos: GPU con PyTorch u ONNX FP16, CPU con ONNX FP32 o INT8, y edge con INT8.
- Exportacion a ONNX con soporte de ejecucion via ONNX Runtime y via Ultralytics.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision por computador.

## Casos de uso

- Monitorizacion de seguridad en obra en tiempo real: el modelo se integra en un pipeline de video (camaras IP) y detecta en cada fotograma si las personas llevan casco y chaleco, generando alertas cuando aparece la clase `no-helmet` o `no-vest`. La latencia de 6,3 ms en T4 permite procesar multiples camaras por GPU.
- Auditoria de imagenes historicas de obra: procesamiento por lotes de fotografias de inspeccion para cuantificar el cumplimiento de EPI a lo largo del tiempo, usando `best-fp32.onnx` en CPU para evitar dependencia de GPU.
- Despliegue en dispositivos edge sin GPU: la variante INT8 (11 MB) cabe en equipos de baja potencia con CPU de 8 hilos a 14,1 FPS, adecuada para inspeccion en campo con hardware limitado, aceptando la perdida de precision documentada.
- Generacion de informes de cumplimiento: extraccion de recuentos por clase y por imagen para alimentar dashboards de seguridad laboral, aprovechando las clases `person`, `helmet` y `vest` como base de metricas de cumplimiento.
- Pre-filtrado en pipelines de analitica de video: usar el modelo como primera etapa para descartar fotogramas sin personas y reducir la carga de modelos mas costosos aguas abajo.
- Investigacion en vision aplicada a seguridad laboral: el modelo y su auditoria de dataset sirven como linea base reproducible para comparar tecnicas de cuantizacion o de deteccion de EPI, dado que el autor publica intervalos de confianza y resultados por clase.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el split de test (119 imagenes), validador de Ultralytics con conf=0,001 e IoU=0,7:

| Variante | Fichero | Tamano (MB) | mAP50 | mAP50-95 | Delta mAP50-95 vs FP32 [IC 95%] | Precision | Recall | F1 de concordancia | T4 (ms / FPS) | CPU 8 hilos (ms / FPS) |
|---|---|---|---|---|---|---|---|---|---|---|
| PyTorch FP32 | `best.pt` | 19,4 | 0,900 | 0,509 | — | 0,865 | 0,877 | 1,000 | 11,0 / 91 | 131,1 / 7,6 |
| ONNX FP32 | `best-fp32.onnx` | 36,4 | 0,915 | 0,508 | -0,001 [-0,025; +0,010] | 0,928 | 0,853 | 1,000 | 11,8 / 85 | 67,1 / 14,9 |
| ONNX FP16 | `best-fp16.onnx` | 18,3 | 0,915 | 0,508 | -0,001 [-0,024; +0,010] | 0,928 | 0,853 | 1,000 | 6,3 / 160 | 102,4 / 9,8 |
| ONNX INT8 estatico | `best-int8.onnx` | 11,0 | 0,540 | 0,279 | -0,230 [-0,310; -0,169] | 0,603 | 0,594 | 0,367 | — | 70,8 / 14,1 |
| ONNX INT8 `quantize=8` (referencia, no distribuido) | — | 9,8 | 0,904 | 0,509 | -0,000 [-0,035; +0,012] | 0,898 | 0,871 | 0,913 | — | 181,8 / 5,5 |
| ONNX INT8 dinamico (referencia, no distribuido) | — | 10,6 | 0,804 | 0,410 | -0,099 [-0,135; -0,068] | 0,803 | 0,771 | 0,460 | — | 156,1 / 6,4 |

Resultados por clase (PyTorch FP32, test):

| Clase | Instancias test | Imagenes | Precision | Recall | AP50 | AP50-95 | IC 95% AP50-95 |
|---|---|---|---|---|---|---|---|
| helmet | 232 | 117 | 0,932 | 0,953 | 0,948 | 0,543 | 0,502 – 0,587 |
| no-helmet | 11 | 6 | 0,736 | 0,727 | 0,788 | 0,345 | 0,239 – 0,597 |
| no-vest | 89 | 51 | 0,846 | 0,862 | 0,864 | 0,456 | 0,373 – 0,531 |
| person | 241 | 115 | 0,913 | 0,959 | 0,954 | 0,655 | 0,611 – 0,706 |
| vest | 141 | 74 | 0,899 | 0,885 | 0,948 | 0,546 | 0,502 – 0,593 |
| todas | 714 | 119 | 0,865 | 0,877 | 0,900 | 0,509 | 0,478 – 0,572 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los pesos (19,4 MB en FP32, 18,3 MB en FP16) el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: Tesla T4 para servidor (6,3 ms con ONNX FP16), A100/H100 para mayor throughput, RTX 4090 y similares para despliegue en estacion de trabajo.
- Cabe en GPU consumer: si, cualquier GPU con soporte CUDA y al menos 4 GB de VRAM; tambien funciona en CPU.
- Opciones de despliegue: Ultralytics (`YOLO("best.pt")`), ONNX Runtime (FP32, FP16 e INT8), y TensorRT para INT8 en GPU (el proveedor CUDA de ONNX Runtime no acelera INT8 segun el autor).
- Latencia y throughput: 6,3 ms / 160 FPS en T4 con ONNX FP16; 11,0 ms / 91 FPS con PyTorch FP32 en T4; 67,1 ms / 14,9 FPS en CPU Xeon a 2,00 GHz con 8 hilos y ONNX FP32; 70,8 ms / 14,1 FPS en la misma CPU con INT8. Mediciones de solo el forward de red, sin decodificacion JPEG ni NMS, mediana de 300 ejecuciones en GPU y 50 en CPU tras 20 de calentamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26s-construction-ppe | no disponible (19,4 MB FP32) | 640x640 | 0,509 | AGPL-3.0 | Hugging Face (mpa-17) |
| YOLO26s base (Ultralytics) | no disponible | 640x640 | no disponible | AGPL-3.0 | Ultralytics |
| ONNX INT8 `quantize=8` de Ultralytics (referencia del autor) | no disponible (9,8 MB) | 640x640 | 0,509 | AGPL-3.0 | No distribuido en este repo |
| ONNX INT8 dinamico (referencia del autor) | no disponible (10,6 MB) | 640x640 | 0,410 | AGPL-3.0 | No distribuido en este repo |

No se dispone en la informacion proporcionada de resultados de otros detectores de EPI comparables (por ejemplo, variantes de YOLOv8 o YOLO11 afinadas para seguridad en construccion), por lo que la comparativa se limita a las variantes del propio modelo y a la referencia del exportador de Ultralytics.

## Limitaciones y advertencias

- La variante INT8 estatica distribuida pierde 0,230 puntos de mAP50-95 (de 0,509 a 0,279) y su F1 de concordancia con FP32 cae a 0,367; el autor la presenta como opcion de compromiso, no como sustituto de FP32/FP16.
- La clase `no-helmet` solo tiene 11 instancias en el split de test (6 imagenes), por lo que su AP tiene un intervalo de confianza amplio (0,239 – 0,597) y debe interpretarse como indicativo.
- El dataset de origen tiene 997 imagenes de entrenamiento, un volumen reducido que limita la generalizacion a condiciones de iluminacion, angulos de camara y tipos de obra no representados.
- Riesgo de falsos negativos en la deteccion de incumplimientos: con recall de 0,727 en `no-helmet` y 0,862 en `no-vest`, el modelo puede no detectar infracciones reales, lo que es critico en un contexto de seguridad laboral.
- Licencia AGPL-3.0: el uso comercial en servicios de red puede obligar a liberar el codigo fuente derivado; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- No se documentan sesgos demograficos ni evaluaciones de equidad; al ser un modelo de vision aplicado a personas, existe riesgo de rendimiento desigual segun genero, tono de piel o vestimenta.
- El modelo no procesa lenguaje ni tiene capacidades de razonamiento; cualquier logica de decision (alertas, informes) debe implementarse externamente.
- No se proporcionan datos de entrenamiento mas alla de la composicion del dataset; se desconoce el numero de epocas, la estrategia de aumento de datos y los hiperparametros exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mpa-17/yolo26s-construction-ppe
- Dataset de origen: https://huggingface.co/datasets/Francesco/construction-safety-gsnvb
- Documentacion de modelos Ultralytics: https://docs.ultralytics.com/models/
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Roboflow 100 (origen del dataset): https://universe.roboflow.com/
