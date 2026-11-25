# kenantabak/yolov9c-traffic-signs-49-tr

## Resumen

yolov9c-traffic-signs-49-tr es un modelo de deteccion de objetos basado en la arquitectura YOLOv9c (con Programmable Gradient Information, PGI), ajustado para detectar 49 clases de senales de trafico direccionales. Lo desarrolla kenantabak en el marco del proyecto EVREN, un benchmark multiarquitectura de deteccion de objetos y de inferencia ONNX en CPU. El modelo se distribuye exclusivamente en formato ONNX (80,96 MB), lo que lo hace directamente desplegable con ONNX Runtime sin necesidad de framework de entrenamiento.

El problema que resuelve es concreto: la deteccion de senales de trafico en imagenes de carretera para aplicaciones de conduccion autonoma y asistencia a la conduccion, con un conjunto de 49 clases que distingue senales direccionales. La resolucion de entrada es de 640 x 640 pixeles y el modelo declara un mAP@50 del 87,94 % y un mAP@50-95 del 73,48 % sobre su conjunto de validacion.

Es relevante ahora por dos motivos: primero, porque el ecosistema de modelos de deteccion de senales de trafico especificos para Turquia y con granularidad de 49 clases es escaso; segundo, porque su empaquetado ONNX con latencia medida en CPU (592 ms con 4 hilos, 1,69 FPS) lo posiciona como candidato para despliegue en entornos sin GPU. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un modelo recien publicado y sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv9c con PGI (Programmable Gradient Information) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640 x 640 px) |
| Tipos de cuantizacion | no disponible (solo se distribuye el ONNX en precision original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`best.onnx`, 80,96 MB) |

## Arquitectura y entrenamiento

El modelo parte de YOLOv9c, un detector de una sola etapa de la familia YOLOv9 que incorpora Programmable Gradient Information (PGI) para mitigar la perdida de informacion en las capas profundas durante la propagacion del gradiente. La entrada es una imagen RGB de 640 x 640 normalizada a [0, 1] y en formato NCHW. La salida se decodifica mediante el decodificador unificado `decode_outputs` del repositorio `multiarch_onnx` del autor, que gestiona las salidas del modelo sin depender de Ultralytics en inferencia.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos o ajuste fino con RLHF/DPO (no aplicable en deteccion). La model card menciona una auditoria visual de calidad sobre 20 imagenes de test independientes no vistas, con una precision de caja del 96,0 % (24 TP / 1 FP, F1 = 0,696) y deteccion limpia de senales de autopista lejanas con confianza entre 0,86 y 1,00. El modelo forma parte de un benchmark de 24 ejecuciones documentado en GitHub, pero no se detalla la configuracion de entrenamiento en la informacion proporcionada.

## Capacidades

- Deteccion de objetos en imagenes RGB con 49 clases de senales de trafico direccionales, definidas en `classes.json`.
- Deteccion de senales a distancia en escenarios de autopista, con confidencias altas (0,86-1,00) segun la auditoria del autor.
- Inferencia en CPU pura mediante ONNX Runtime, sin dependencia de CUDA ni de PyTorch.
- Decodificacion de salidas mediante el decodificador unificado `multiarch_onnx` del mismo autor, reutilizable para otras arquitecturas del benchmark.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de vision puro.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion.

## Casos de uso

- Asistencia a la conduccion (ADAS): integracion en el pipeline de percepcion de un vehiculo para reconocer senales direccionales y avisar al conductor; el formato ONNX y la latencia de 592 ms en CPU permiten desplegarlo en unidades de control sin GPU dedicada.
- Conduccion autonoma en entornos controlados: uso como modulo de deteccion de senales en vehiculos de investigacion o robots de reparto, donde las 49 clases direccionales aportan granularidad sobre la direccion permitida.
- Inventario y mantenimiento de infraestructura vial: procesamiento por lotes de imagenes capturadas por vehiculos de inspeccion para catalogar el estado y la ubicacion de senales, aprovechando la precision de caja del 96,0 % reportada.
- Analisis de video de trafico en servidores sin GPU: el modelo corre en CPU con ONNX Runtime, lo que permite procesar grabaciones en entornos cloud de bajo coste o en dispositivos edge tipo Raspberry Pi o mini-PC.
- Sistemas de alerta en tiempo real para flotas: deteccion de senales de limite o direccion en el flujo de camara del vehiculo y generacion de alertas al conductor, con la limitacion de los 1,69 FPS en CPU (adecuado para senales espaciadas, no para alta frecuencia).
- Etiquetado asistido y pre-anotacion de datasets: uso del modelo como generador de propuestas de cajas para acelerar el etiquetado humano de nuevas imagenes de senales de trafico, dado que el formato ONNX facilita su integracion en herramientas de anotacion.
- Benchmarking de inferencia ONNX: el modelo forma parte del benchmark EVREN de 24 ejecuciones, por lo que sirve como referencia reproducible para comparar latencias de arquitecturas de deteccion en CPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 87,94 % |
| mAP@50-95 | 73,48 % |
| Precision | 84,10 % |
| Recall | 83,01 % |
| Precision de caja (auditoria visual, 20 imagenes) | 96,0 % (24 TP / 1 FP, F1 = 0,696) |
| Latencia CPU (4 hilos, ONNX Runtime) | 592,0 ms (1,69 FPS) |
| Tamano ONNX | 80,96 MB |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado; el modelo esta pensado para CPU. En GPU, el ONNX de 80,96 MB ocupa menos de 1 GB de VRAM en precision FP32, pero no se proporcionan mediciones de latencia en GPU.
- GPU recomendadas: no disponibles; el autor solo documenta latencia en CPU.
- Cabe en GPU de consumo: si, por tamano (menos de 1 GB), aunque no hay benchmarks de latencia en GPU publicados.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, documentado), y por compatibilidad de formato, cualquier runtime que acepte ONNX (TensorRT, OpenVINO, ONNX Runtime con CUDAExecutionProvider), aunque sin validacion publicada en esos backends.
- Latencia y throughput: 592,0 ms por imagen con 4 hilos en CPU (1,69 FPS), medido por el autor con ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP@50 | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| yolov9c-traffic-signs-49-tr | no disponible | 640 x 640 | 87,94 % | CC-BY-4.0 | ONNX | 49 clases de senales de trafico, latencia CPU medida |
| YOLOv9c original (Ultralytics) | no disponible en la informacion | 640 x 640 | no disponible | GPL-3.0 (habitual) | PyTorch, ONNX | Modelo base de proposito general (COCO), no especifico de senales |
| YOLOv8n | no disponible en la informacion | 640 x 640 | no disponible | AGPL-3.0 (habitual) | PyTorch, ONNX | Alternativa de menor tamano para edge, no especifica de senales |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a aspectos de licencia, formato y especializacion. No se conocen otros modelos publicos con exactamente 49 clases de senales de trafico turcas para una comparacion directa.

## Limitaciones y advertencias

- Modelo recien publicado (0 descargas, 0 likes) y sin validacion independiente; los resultados de mAP y la auditoria visual son declaraciones del autor.
- El conjunto de 49 clases esta orientado a senales de trafico turcas; la transferencia a otros paises o normativas viales no esta documentada.
- La latencia de 1,69 FPS en CPU limita su uso en tiempo real a escenarios de baja frecuencia de senales; para video a 30 FPS se requeriria GPU o un modelo mas ligero.
- No se documenta el dataset de entrenamiento, su tamano ni su composicion, lo que impide evaluar sesgos de clase o de dominio (por ejemplo, condiciones de iluminacion o climatologia).
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero la model card advierte de que las licencias del framework de entrenamiento subyacente se aplican por separado; conviene revisar la licencia de YOLOv9/Ultralytics antes de un despliegue comercial.
- Riesgo de alucinacion en el sentido de falsos positivos en escenas con objetos visualmente similares a senales (carteles, paneles); la auditoria reporta 1 FP en 20 imagenes, una muestra demasiado pequena para estimar la tasa real.
- No se especifican tecnicas de cuantizacion ni versiones INT8/FP16, lo que limita las opciones de optimizacion para edge sin trabajo adicional del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolov9c-traffic-signs-49-tr
- Pagina del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/cok-sinifli-trafik-levhasi-tanima-yolov9c-49-sinif
- Benchmark y decodificador ONNX unificado (GitHub): https://github.com/kenantabak/evren-multiarch-cv-onnx-benchmark
- Dataset de benchmark estructurado (Hugging Face): https://huggingface.co/datasets/kenantabak/evren-multiarch-cv-onnx-benchmark
- Analisis tecnico en turco (Dev.to): https://dev.to/kenantabak
