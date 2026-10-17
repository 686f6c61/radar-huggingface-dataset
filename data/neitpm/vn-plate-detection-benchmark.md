# neitpm/vn-plate-detection-benchmark

## Resumen

El repositorio `neitpm/vn-plate-detection-benchmark` no contiene un modelo de lenguaje, sino un benchmark controlado de detección de matrículas de vehículos vietnamitas junto con dos checkpoints publicados. El autor, neitpm, evalúa dos variantes de la familia YOLOv8 de Ultralytics: una compacta para inferencia en el borde (`yolov8n_edge`, YOLOv8n, 3,0 M de parámetros y 8,1 GFLOPs a 640x640) y otra de alta capacidad para servidor (`yolov8l_server`, YOLOv8l, 43,6 M de parámetros y 164,8 GFLOPs a 640x640).

El problema que aborda es acotado y binario: la localización de la caja delimitadora de la matrícula en una imagen, con una única clase de salida (`0: 'plate'`). No realiza reconocimiento óptico de caracteres (OCR); esta tarea se plantea explícitamente como una aplicación posterior fuera del alcance del repositorio. El interés práctico del trabajo está en que cuantifica el compromiso entre resolución de entrada, precisión y latencia: a 224x224 el modelo compacto cae de 78,19 a 68,82 puntos de mAP@[0.5:0.95], y el recall de matrículas pequeñas o lejanas baja del 100,0 % al 79,4 %.

Los pesos se distribuyen en formato PyTorch (`.pt`) y ONNX (`.onnx`), con licencia MIT, lo que permite uso comercial sin restricciones adicionales. El repositorio no registra descargas ni interacciones en el momento de la consulta y se publicó el 16 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (detector de objetos convolucional, variantes n y l de Ultralytics) |
| Parametros totales | 3,0 M (`yolov8n_edge`) y 43,6 M (`yolov8l_server`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos, no generativo) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt` y `.onnx` sin cuantizacion declarada) |
| Idiomas soportados | vi, en (etiquetas del repositorio); el modelo es de clase unica y no procesa texto |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |

Datos adicionales de los pesos:

| Fichero | Tamano | Resolucion de entrada | Puntos decodificados |
|---|---|---|---|
| `weights/yolov8n_edge.onnx` | 11,56 MB | 224x224 | 1.029 |
| `weights/yolov8n_edge.pt` | 5,95 MB | 224x224 | 1.029 |
| `weights/yolov8l_server.onnx` | 166,62 MB | 640x640 | 8.400 |
| `weights/yolov8l_server.pt` | 83,58 MB | 640x640 | 8.400 |

## Arquitectura y entrenamiento

Ambas variantes pertenecen a la familia YOLOv8 de Ultralytics, un detector de una sola etapa con cabeza de prediccion densa sobre una rejilla multiescala. El repositorio declara 8,1 GFLOPs a 640x640 para la variante n y 164,8 GFLOPs para la variante l. La model card menciona 1.029 y 8.400 puntos de prediccion decodificados segun la resolucion, y una cabeza de clase unica restringida a `plate`.

El conjunto de datos consta de 1.005 capturas autenticas repartidas en 704 imagenes de entrenamiento, 200 de validacion y 101 de test, con verificacion de ausencia de fuga por duplicados entre particiones. La variante `yolov8l_server` se describe como una segunda etapa afinada (fine-tuning) a partir de un backbone congelado de 10 capas. No se especifica el numero de tokens o imagenes vistas por epoca, la composicion detallada del dataset, ni si se aplicaron tecnicas de aumento de datos. Al tratarse de un modelo discriminativo de vision, no se emplearon RLHF ni DPO. No se documenta ninguna innovacion arquitectonica propia mas alla del uso de los checkpoints estandar de Ultralytics.

## Capacidades

- Deteccion de objetos de clase unica: localizacion de la caja delimitadora de matriculas de vehiculos vietnamitas (`0: 'plate'`).
- Inferencia en dos regimenes de resolucion: 224x224 para el modelo compacto y 640x640 para el modelo de servidor.
- Generacion de texto: no disponible; el modelo no es generativo.
- Razonamiento, matematicas y codigo: no disponible; fuera del alcance del modelo.
- Vision: si, deteccion de objetos sobre imagen. No se documentan clasificacion, segmentacion, deteccion de pose ni reconocimiento de caracteres.
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica al modelo; las etiquetas `vi` y `en` se refieren a la documentacion del repositorio.
- Capacidad especial: perfilado de latencia en CPU con ONNX Runtime, con desglose de tiempos de preprocesado, paso directo y postprocesado.

## Casos de uso

- Control de acceso en parkings y barreras automaticas: el detector localiza la matricula en el fotograma y dispara la apertura. La variante `yolov8n_edge` a 224x224 procesa 270,3 FPS en CPU, por lo que puede ejecutarse en el propio controlador sin GPU dedicada.
- Peajes y tarificacion vial: `yolov8l_server` a 640x640 como etapa previa a un OCR, maximizando el recall (100,0 % en el conjunto de test) para no perder vehiculos en el conteo de trafico.
- Vigilancia urbana con camaras CCTV: deteccion de matriculas en retransmisiones continuas, con la variante de servidor para planos abiertos donde las matriculas ocupan poco area.
- Analitica de trafico y aforo: conteo de vehiculos basado en la deteccion de matricula, que es una region mas estable que la silueta completa ante oclusiones parciales.
- Sistemas embebidos y dashcams: el fichero ONNX de 11,56 MB es viable en equipos con almacenamiento y memoria limitados; la latencia medida de 3,70 ms extremo a extremo en CPU permite procesamiento en tiempo real.
- Control de estacionamiento y retirada de vehiculos: registro fotografico con caja delimitadora verificable para expedientes de sancion.
- Preprocesado en pipelines ALPR de aduanas y fronteras: la deteccion recorta la region de interes y reduce el coste computacional del OCR posterior.
- Referencia de benchmarking para investigacion: permite reproducir la comparacion entre resolucion compacta y nativa bajo un protocolo declarado (mismo test de 101 imagenes, mismas condiciones de latencia).

## Benchmarks y rendimiento

Evaluacion oficial de Ultralytics en GPU RTX 5060 Ti con PyTorch nativo, sobre el conjunto de test independiente de 101 imagenes y 101 cajas:

| Variante | Resolucion | Precision | Recall | mAP@0.5 | mAP@[0.5:0.95] |
|---|---|---|---|---|---|
| YOLOv8n (`best.pt`) | 640x640 | 99,9 % | 100,0 % | 99,50 % | 78,19 % |
| YOLOv8l Stage 2 (`best.pt`) | 640x640 | 99,8 % | 100,0 % | 99,50 % | 78,47 % |

Resolucion compacta de despliegue (224x224 frente a 640x640):

| Variante | Resolucion | Precision | Recall | mAP@0.5 | mAP@[0.5:0.95] |
|---|---|---|---|---|---|
| YOLOv8n | 224x224 | 99,2 % | 96,0 % | 99,25 % | 68,82 % |

Desglose de recall por escala (IoU >= 0,5):

| Categoria | Criterio | N | Recall a 224x224 | Recall a 640x640 |
|---|---|---|---|---|
| Pequenas / lejanas | area < 2,5 % | 34 | 79,4 % (27/34) | 100,0 % |
| Medianas | area 2,5 % - 6,0 % | 49 | 98,0 % (48/49) | 100,0 % |
| Grandes / cercanas | area > 6,0 % | 18 | 100,0 % (18/18) | 100,0 % |

Perfilado de latencia estandarizado en CPU (Intel Core i5-14600K, 14 nucleos / 20 hilos; ONNX Runtime con `CPUExecutionProvider`, 4 hilos intra-operacion, `ORT_ENABLE_ALL`, 10 ejecuciones de calentamiento):

| Variante | Resolucion | Preprocesado | Paso directo | Postprocesado | Total | FPS |
|---|---|---|---|---|---|---|
| YOLOv8n | 224x224 | 0,19 ms | 3,42 ms | 0,09 ms | 3,70 ms | 270,3 |
| YOLOv8l | 640x640 | 2,78 ms | 372,07 ms | 0,16 ms | 375,01 ms | 2,7 |

No se han publicado resultados de benchmarks en GPU para estas variantes mas alla de la evaluacion de precision en RTX 5060 Ti.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 5,95 MB (`.pt`) o 11,56 MB (ONNX) en la variante compacta y 83,58 MB (`.pt`) o 166,62 MB (ONNX) en la variante de servidor. Con activaciones y buffers de inferencia, ambos modelos caben holgadamente en cualquier GPU con 2 GB de VRAM; la cifra exacta no esta publicada.
- GPU recomendadas: no disponible. La model card solo documenta la GPU empleada para evaluar precision (RTX 5060 Ti) y no publica latencias en GPU.
- Compatibilidad con GPU de consumo: si, ambas variantes caben en cualquier GPU de consumo actual; el repositorio completo ocupa 0,3 GB.
- Ejecucion sin GPU: viable. La variante compacta alcanza 3,70 ms por imagen en un Intel Core i5-14600K, y la de servidor 375,01 ms en el mismo equipo.
- Opciones de despliegue: ONNX Runtime (perfilado en el repositorio con `CPUExecutionProvider`), PyTorch nativo mediante el script `scripts/infer.py`, y cualquier runtime compatible con los pesos ONNX o Ultralytics. El repositorio no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: unicamente disponibles en la configuracion de CPU indicada. No se han evaluado en ARM embebido, movil ni NPU de borde, por lo que el rendimiento en esas plataformas es no disponible.

## Comparativa con modelos similares

Comparativa interna entre las dos variantes publicadas en el repositorio:

| Parametro | YOLOv8n edge | YOLOv8l server |
|---|---|---|
| Parametros | 3,0 M | 43,6 M |
| GFLOPs a 640x640 | 8,1 | 164,8 |
| Resolucion evaluada | 224x224 y 640x640 | 640x640 |
| mAP@0.5 (test) | 99,50 % a 640x640 / 99,25 % a 224x224 | 99,50 % |
| mAP@[0.5:0.95] (test) | 78,19 % a 640x640 / 68,82 % a 224x224 | 78,47 % |
| Latencia en CPU | 3,70 ms (270,3 FPS) | 375,01 ms (2,7 FPS) |
| Tamano de pesos ONNX | 11,56 MB | 166,62 MB |
| Licencia | MIT | MIT |

No se proporcionan datos de otros detectores de matriculas comparables (por ejemplo, variantes especificas de ALPR de terceros) en la informacion disponible, por lo que la comparacion con alternativas externas es no disponible.

## Limitaciones y advertencias

- Alcance del test: la evaluacion se realizo sobre 101 imagenes en condiciones de iluminacion diurna estandar. No hay datos sobre rendimiento nocturno, lluvia, deslumbramiento, motion blur, oclusiones o angulos extremos.
- OCR fuera de alcance: el reconocimiento alfanumerico se plantea como prototipo posterior. No se evaluaron Character Error Rate (CER) ni Word Error Rate (WER) por ausencia de anotaciones a nivel de caracter.
- Perdida de recall en matriculas pequenas: a 224x224 el recall de matriculas con area inferior al 2,5 % cae al 79,4 % (27 de 34), frente al 100,0 % a 640x640. Desplegar la variante compacta en resolucion reducida implica asumir falsos negativos en vehiculos lejanos.
- Alcance de hardware: las latencias corresponden a un Intel Core i5-14600K con 4 hilos; no se han perfilado ARM embebido, movil ni NPU de borde, donde el comportamiento puede diferir significativamente.
- Tamano del conjunto de datos: 1.005 imagenes en total, con 101 en test. La precision reportada, cercana al 100 %, tiene un intervalo de confianza amplio y podria no generalizar a dominios nuevos.
- Sesgo geografico: el modelo esta entrenado exclusivamente con matriculas vietnamitas. Su uso con matricula europea, americana u otros formatos no esta validado y no se han publicado metricas al respecto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y de cajas mal localizadas en escenas con texto o patrones rectangulares similares a una matricula.
- Licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion. No se declaran restricciones adicionales de uso.
- Reproducibilidad: el repositorio incluye sumas de verificacion SHA-256 y un manifiesto de pesos, lo que permite validar la integridad de los ficheros descargados.
- Adopcion: cero descargas y cero interacciones registradas en el momento de la consulta, por lo que no existe validacion externa por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/neitpm/vn-plate-detection-benchmark
- Repositorio GitHub: https://github.com/neitpm/vn-plate
- Ultralytics (framework base de YOLOv8): no disponible en la informacion proporcionada
- Paper o publicacion asociada: no disponible en la informacion proporcionada
- Demo o Space: no disponible en la informacion proporcionada
