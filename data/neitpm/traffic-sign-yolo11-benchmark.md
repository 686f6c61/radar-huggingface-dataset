# neitpm/traffic-sign-yolo11-benchmark

## Resumen

El repositorio `neitpm/traffic-sign-yolo11-benchmark` no contiene un modelo de lenguaje, sino un conjunto de checkpoints de deteccion de objetos orientados a senalizacion vial vietnamita, acompanados de un benchmark empirico de arquitecturas. La propuesta evalua la integracion de modulos **Universal Inverted Bottleneck (UIB)** dentro del framework **Ultralytics YOLO11**, comparando tres variantes entrenadas sobre 58 categorias legales de senales de trafico definidas por el estandar nacional vietnamita QCVN 41:2019/BGTVT. El objetivo es medir el compromiso real entre compactacion de parametros, coste computacional teorico y precision en un dominio acotado.

La relevancia del trabajo es metodologica mas que de rendimiento bruto: el autor publica resultados negativos y matizados, algo poco habitual. La variante UIB-Nano reduce parametros un 5,14 % (2,48 M frente a 2,61 M) y FLOPs un 13,85 % (5,6 G frente a 6,5 G), pero su latencia real en GPU es un 20 % superior (6,93 ms frente a 5,79 ms) por el Memory Access Cost de las convoluciones separables en profundidad. Ademas, entrenada desde cero sin preentrenamiento en COCO, cae a 61,20 % mAP@[0.5:0.95] frente al 70,27 % del baseline preentrenado.

El modelo recomendado por el propio autor para despliegue es el baseline YOLO11n afinado desde pesos COCO: 2,61 M de parametros fusionados, 6,5 GFLOPs a 640x640, 70,27 % mAP@[0.5:0.95], 92,19 % de precision, 81,44 % de recall y 172,8 FPS medidos en una NVIDIA RTX 5060 Ti. El repositorio tiene licencia MIT, no redistribuye imagenes ni etiquetas del dataset y esta pensado para benchmarking academico, estudio educativo y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector CNN YOLO11 (Ultralytics); variante experimental con modulos Universal Inverted Bottleneck (UIB) |
| Parametros totales | 2,61 M (YOLO11n baseline) / 2,48 M (YOLO11n-UIB-Nano) / 31,78 M (variante UIB 32M historica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los checkpoints se distribuyen en `\*.pt` sin artefactos INT8/FP16 publicados |
| Idiomas soportados | No disponible; las clases estan etiquetadas en vietnamita segun QCVN 41:2019/BGTVT |
| Licencia | MIT |
| Formato de pesos | PyTorch / Ultralytics (`\*.pt`); verificado con firmas SHA-256 en `checksums.sha256` |

Especificaciones adicionales por checkpoint:

| Checkpoint | Paradigma de entrenamiento | FLOPs (640x640) | Latencia media (RTX 5060 Ti) | mAP@[0.5:0.95] |
|---|---|---|---|---|
| `yolo11n_baseline_best.pt` | Fine-tune desde pesos COCO | 6,5 G | 5,79 ms | 70,27 % |
| `yolo11n_uib_nano_best.pt` | Desde cero (scratch) | 5,6 G | 6,93 ms | 61,20 % |
| `yolo11n_uib_nano_kd_best.pt` | Destilacion docente-alumno (lambda_dis = 1,0) | 5,6 G | 6,93 ms | 64,05 % |

## Arquitectura y entrenamiento

YOLO11 es un detector de objetos de una sola etapa basado en una columna vertebral convolucional con bloques C3k2 y modulos de atencion, seguido de un cuello de agregacion multi-escala y una cabeza de deteccion anclada libremente. El baseline del repositorio es la variante nano (n), con 2,61 M de parametros fusionados y 6,5 GFLOPs a 640x640, afinada sobre el dataset VR-TSD-2 partiendo de pesos preentrenados en COCO. La innovacion evaluada consiste en sustituir determinados bloques por modulos **Universal Inverted Bottleneck (UIB)**, una formulacion que combina convoluciones invertidas con convoluciones separables en profundidad para reducir el coste teorico.

El entrenamiento se realizo sobre el **Vietnamese Real-world Traffic Sign Dataset v2 (VR-TSD-2)**, con 58 categorias legales (reglamentarias, prohibitivas, de advertencia e informativas) y un reparto de 5.668 imagenes de entrenamiento, 1.259 de validacion y 1.151 de test. Las imagenes y etiquetas originales no se redistribuyen; todas las metricas publicadas son artefactos de validacion obtenidos con un protocolo controlado. Para la variante destilada se empleo al baseline como docente congelado con un peso de destilacion optimo de lambda_dis = 1,0, lo que eleva la variante UIB-Nano de 61,20 % a 64,05 % mAP, aunque persiste una brecha de 6,22 puntos frente al baseline preentrenado en COCO. Se menciona tambien una variante historica de alta capacidad (UIB 32M, 31,78 M de parametros, 51,9 GFLOPs) que alcanzo 70,86 % mAP entrenada desde cero, lo que confirma que la capacidad de representacion existe cuando no se restringe el numero de parametros.

## Capacidades

- **Deteccion de objetos en imagenes**: localizacion y clasificacion de senales de trafico en 58 categorias, con salida de cajas delimitadoras, etiqueta de clase y puntuacion de confianza.
- **Deteccion en tiempo real**: 172,8 FPS (5,79 ms por inferencia) en el baseline sobre RTX 5060 Ti, suficiente para procesamiento de video a alta cadencia.
- **Resolucion de entrada configurable**: los checkpoints se evaluan a 640x640, con parametros de inferencia ajustables (`imgsz`, `conf`, `iou`).
- **Umbrales de confianza y NMS ajustables**: el pipeline de Ultralytics permite calibrar `conf` y `iou` segun la aplicacion.
- **Tool calling / function calling**: no aplica, es un modelo de vision.
- **Soporte de agentes y razonamiento multi-paso**: no aplica.
- **Capacidades multilingues**: no aplica al modelo; las etiquetas de clase corresponden a la nomenclatura vietnamita.
- **Capacidad especial**: variante con destilacion de conocimiento que permite estudiar el efecto del KD en arquitecturas compactas entrenadas desde cero.

## Casos de uso

- **Auditoria de infraestructura vial**: procesamiento por lotes de imagenes de carretera para inventariar senales presentes, ausentes o degradadas, usando las 58 categorias legales como taxonomia cerrada.
- **Prototipado de sistemas ADAS**: el baseline a 172,8 FPS permite integrar deteccion de senales en un pipeline de asistencia a la conduccion sobre GPU de gama media antes de invertir en modelos mayores.
- **Investigacion en destilacion de conocimiento**: el par docente (baseline COCO) y alumno (UIB-Nano) con checkpoints publicos permite reproducir experimentos de KD con lambda_dis variable.
- **Benchmark de arquitecturas eficientes**: la comparacion UIB frente a C3k2 con metricas de parametros, FLOPs y latencia real sirve como caso de estudio del desajuste entre FLOPs teoricos y coste de memoria.
- **Docencia en vision por computador**: el repositorio expone manifests de configuracion, checksums y scripts de inferencia, lo que facilita reproducir un flujo completo de deteccion con Ultralytics.
- **Validacion de dominio geografico**: evaluar la transferibilidad de un detector entrenado en Vietnam a senalizacion de otros paises para cuantificar la caida de rendimiento por cambio de dominio.
- **Etiquetado asistido**: uso del detector como preanotador para acelerar la construccion de nuevos datasets de senalizacion, con revision humana posterior.

## Benchmarks y rendimiento

Metricas declaradas por el autor en el conjunto de validacion de VR-TSD-2, a 640x640 y medidas en NVIDIA RTX 5060 Ti:

| Modelo | Parametros | FLOPs | Latencia | mAP@[0.5:0.95] | Precision | Recall |
|---|---|---|---|---|---|---|
| YOLO11n baseline (fine-tune COCO) | 2,61 M | 6,5 G | 5,79 ms | 70,27 % | 92,19 % | 81,44 % |
| YOLO11n-UIB-Nano (scratch) | 2,48 M | 5,6 G | 6,93 ms | 61,20 % | no disponible | no disponible |
| YOLO11n-UIB-Nano + KD (lambda_dis = 1,0) | 2,48 M | 5,6 G | 6,93 ms | 64,05 % | no disponible | no disponible |
| UIB 32M (variante historica, scratch) | 31,78 M | 51,9 G | no disponible | 70,86 % | no disponible | no disponible |

Datos derivados: el baseline alcanza 172,8 FPS (calculado a partir de 5,79 ms por inferencia). La destilacion aporta +2,85 puntos de mAP a la variante UIB-Nano. No se han publicado resultados sobre datasets independientes (COCO, BDD100K, GTSRB) en la informacion disponible.

## Requisitos de hardware

- **VRAM para inferencia**: no se proporciona una medicion de VRAM. A modo orientativo, un modelo de 2,48-2,61 M de parametros ocupa aproximadamente 10 MB en FP32 y 5 MB en FP16, por lo que el cuello de botella real es el buffer de activaciones a 640x640, no los pesos.
- **GPU de referencia medida**: NVIDIA RTX 5060 Ti, con 5,79 ms (baseline) y 6,93 ms (UIB-Nano) por imagen.
- **Compatibilidad con GPU de consumo**: si, el modelo nano cabe holgadamente en cualquier GPU de consumo moderna con 4 GB o mas de VRAM. No se documentan pruebas en GPU integradas, Jetson o aceleradores edge.
- **GPU de datacenter**: no disponible; no se han publicado mediciones en A100, H100, L4 o T4.
- **Opciones de despliegue**: la libreria declarada es `ultralytics`, por lo que el flujo de inferencia documentado usa `YOLO(...).predict()`. El repositorio no publica artefactos ONNX, TensorRT, OpenVINO ni TFLite; cualquier exportacion adicional correria a cargo del usuario a traves de las utilidades de Ultralytics.
- **Latencia y throughput**: 5,79 ms/imagen y 172,8 FPS para el baseline; 6,93 ms/imagen y aproximadamente 144 FPS para las variantes UIB-Nano (dato derivado). Todas las cifras corresponden a una estacion de trabajo con GPU, no a hardware embebido.
- **Advertencia del autor**: UIB-Nano no se declara optimizado para edge ni desplegado en produccion; el aumento de latencia respecto al baseline se atribuye al Memory Access Cost de las convoluciones separables en profundidad.

## Comparativa con modelos similares

No se dispone de metricas comparables publicadas en la informacion proporcionada para alternativas del mismo tamano entrenadas sobre el mismo dataset. La comparativa se limita a la comparacion interna entre variantes y a la identificacion de trabajos relacionados.

| Alternativa | Parametros | Contexto / dominio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (YOLO11n baseline) | 2,61 M | 58 clases de senalizacion vietnamita | 70,27 % mAP@[0.5:0.95] | MIT | Pesos en HuggingFace |
| YOLO11n-UIB-Nano (+ KD) | 2,48 M | Mismas 58 clases | 64,05 % mAP@[0.5:0.95] | MIT | Pesos en HuggingFace |
| PBM_YOLO (IEEE, 11293965) | no disponible | Mejora sobre YOLOv11n para senales pequenas | no disponible | no disponible | Publicacion, sin pesos publicos confirmados |
| Benchmark YOLOv8-YOLOv11 (MDPI Technologies, 13/11/531) | Variantes N a XLarge | Dataset simulado | no disponible | no disponible | Publicacion |
| `barissglc/YOLO11N-TrafficSignVision` | no disponible | Deteccion de senales, YOLO11N | no disponible | no disponible | Repositorio GitHub |
| `j89103138/YOLOv11-Traffic-Sign` | no disponible | Deteccion y benchmarking de senales con CUDA | no disponible | no disponible | Repositorio GitHub |

## Limitaciones y advertencias

- **Alcance de dominio estricto**: las 58 clases corresponden a la normativa vietnamita QCVN 41:2019/BGTVT. El modelo no reconoce senalizacion de otros paises y se espera una caida de rendimiento no cuantificada en dominios distintos.
- **Brecha de precision en la variante compacta**: incluso con destilacion, UIB-Nano queda 6,22 puntos por debajo del baseline preentrenado en COCO, lo que desaconseja su uso en produccion segun el propio autor.
- **Latencia peor que el baseline**: pese a reducir FLOPs un 13,85 %, UIB-Nano tarda un 20 % mas por inferencia en GPU, por el coste de acceso a memoria de las convoluciones separables en profundidad.
- **Sin validacion en edge**: todas las cifras de latencia proceden de una GPU de estacion de trabajo; no hay mediciones en Jetson, NPU moviles ni CPU.
- **Sin verificacion independiente**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las metricas no han sido replicadas por terceros.
- **Riesgo de falso negativo en condiciones adversas**: no se documentan evaluaciones con lluvia, deslumbramiento, oclusion parcial, senales degradadas o vision nocturna, escenarios criticos en deteccion vial real.
- **Imagenes no redistribuidas**: el dataset VR-TSD-2 no se publica, lo que impide la reproduccion completa del protocolo por parte de terceros. Las metricas son artefactos de validacion del autor.
- **Ausencia de artefactos cuantizados**: no se ofrecen pesos INT8, FP16 ni formatos de runtime alternativos, lo que obliga a exportar manualmente para despliegues de baja latencia.
- **Licencia MIT**: permite uso comercial del codigo y los checkpoints, pero no concede derechos sobre el dataset original ni sobre posibles patentes de terceros en materia de deteccion vial.
- **Naturaleza del artefacto**: es un paquete de checkpoints y manifests de benchmark, no un modelo multimodal ni conversacional; no debe evaluarse con criterios de LLM (contexto, tool calling, alucinacion textual).

## Enlaces

- HuggingFace: https://huggingface.co/neitpm/traffic-sign-yolo11-benchmark
- Repositorio GitHub relacionado (YOLOv11 Traffic Sign): https://github.com/j89103138/YOLOv11-Traffic-Sign
- Repositorio GitHub relacionado (YOLO11N Traffic Sign Vision): https://github.com/barissglc/YOLO11N-TrafficSignVision
- Paper MDPI Technologies, "Benchmarking YOLOv8 to YOLOv11 Architectures for Real-Time Traffic Sign Detection": https://www.mdpi.com/2227-7080/13/11/531
- Version en DOAJ del mismo articulo: https://doaj.org/article/ead5b96e77b1424aaafff1d5d935d9d9
- Paper IEEE, "PBM_YOLO: An Enhanced YOLOv11 Architecture for Robust Real-Time Traffic Sign Detection": https://ieeexplore.ieee.org/stampPDF/getPDF.jsp?arnumber=11293965
- Framework Ultralytics: https://github.com/ultralytics/ultralytics
- Estandar vietnamita de senalizacion QCVN 41:2019/BGTVT: no disponible como enlace directo en la informacion proporcionada
