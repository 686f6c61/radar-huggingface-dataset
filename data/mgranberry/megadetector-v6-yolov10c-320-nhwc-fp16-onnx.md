# mgranberry/megadetector-v6-yolov10c-320-nhwc-fp16-onnx

## Resumen

MegaDetector v6 YOLOv10-c (compacto) es un modelo de deteccion de objetos especializado en fauna salvaje, personas y vehiculos, empaquetado en formato ONNX por el usuario mgranberry para su uso directo en Frigate NVR. Se trata de una exportacion del modelo upstream `MDV6-yolov10-c` publicado por el proyecto MegaDetector (agentmorris/MegaDetector, con pesos alojados en Zenodo), que emplea un backbone YOLOv10-n compacto de aproximadamente 2,7 millones de parametros. El modelo resultante pesa 4,8 MB en FP16 y opera a una resolucion de entrada de 320x320, el tamano minimo de region dinamica que Frigate maneja para deteccion por movimiento.

La aportacion principal de esta ficha no es el modelo en si, sino el trabajo de adaptacion del grafo: la entrada se ha reformateado a NHWC `uint8` con un `Cast` inicial (en lugar del clasico NCHW `float32`), y la salida se ha reordenado a `[1, 7, 300]` con las tres clases (animal, person, car) ya integradas, de modo que el parser `yolo-generic` de Frigate pueda consumirlo sin preprocesado ni postprocesado en CPU. Esto permite que TensorRT u OpenVINO fusionen todas las operaciones dentro de un unico motor.

Es relevante para despliegues de videovigilancia con deteccion de fauna en hardware de baja potencia (Intel N95/N100, Jetson, CPU), donde la variante estandar `MDV6-yolov10-e` resulta demasiado pesada. Las latencias medidas en CPU Intel N95 rondan los 16,6 ms p50 con ONNX Runtime y bajan por debajo de 2 ms en GPU NVIDIA con TensorRT FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10 (backbone YOLOv10-n compacto) |
| Parametros totales | ~2,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (exportacion ONNX con `keep_io_types=True`); entrada `uint8`; no se documentan otras variantes |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`model.onnx`, 4,8 MB) + `labels.txt` |

## Arquitectura y entrenamiento

El modelo es una red de deteccion de objetos de la familia YOLOv10, en su variante compacta (backbone YOLOv10-n), con aproximadamente 2,7 millones de parametros. Deriva del modelo upstream `MDV6-yolov10-c.pt` del proyecto MegaDetector, que se entrena sobre imagenes de camaras trampa y de fauna salvaje para detectar tres clases: `animal`, `person` y `car`. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens, composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un detector de objetos).

La innovacion tecnica de esta exportacion reside en la reescritura del grafo para Frigate: la entrada se define como `images` con forma `[1, 320, 320, 3]` y dtype `uint8` (RGB, rango 0-255), precedida por un `Cast(uint8 -> float32) -> Div(255.0) -> Transpose(NHWC -> NCHW)`. El casteo antes del transpose evita tensores intermedios `uint8` que TensorRT rechaza. La salida se expone como `frigate_adapter_output` con forma `[1, 7, 300]` y dtype `float32`, conteniendo `[cx, cy, w, h, animal_score, person_score, car_score]` transpuesto a `[1, 4 + num_classes, N]`. La conversion desde el formato nativo `[1, 300, 6]` (`xyxy, score, class_id`) se realiza dentro del grafo mediante `Equal` + `Cast` en lugar de `OneHot`, lo que permite que el parser `post_process_yolo` de Frigate lo consuma directamente y que todo el grafo quede contenido en un unico motor TensorRT.

## Capacidades

- Deteccion de objetos en imagenes con tres clases: `animal`, `person`, `car`.
- Entrada RGB `uint8` NHWC a 320x320, adaptada al pipeline nativo de Frigate (sin normalizacion ni transpose en CPU).
- Salida en formato compatible con el parser `yolo-generic` de Frigate (`post_process_yolo`), con coordenadas de caja y puntuaciones por clase.
- Inferencia optimizable mediante TensorRT (FP16) y OpenVINO (CPU/GPU), con fusión de operaciones dentro del grafo.
- Orientado a deteccion en tiempo real sobre streams de camaras de vigilancia y camaras trampa.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues.

## Casos de uso

- Vigilancia de fauna en camaras trampa: el modelo detecta animales, personas y vehiculos en imagenes de camaras de campo, permitiendo filtrar eventos relevantes y reducir el volumen de imagenes a revisar manualmente. Su tamano de 4,8 MB y su resolucion de 320x320 lo hacen apto para dispositivos remotos con recursos limitados.
- Despliegue en Frigate NVR sobre hardware de baja potencia: con latencias p50 de 16,6 ms en CPU Intel N95 (ONNX Runtime, 4 hilos) y 19,8 ms con OpenVINO CPU, permite procesar multiples camaras en un mini-PC sin GPU dedicada.
- Deteccion en iGPU Intel: sobre la iGPU de un N95 (16 EU, OpenVINO GPU) la latencia p50 es de 21,9 ms (minimo 16,5 ms), adecuada para configuraciones domesticas o de pequeña oficina con varias camaras.
- Aceleracion con GPU NVIDIA: con TensorRT FP16 la latencia baja a menos de 2 ms, lo que permite alimentar configuraciones de multiples camaras concurrentes en una sola GPU consumer o profesional.
- Filtrado de falsos positivos por movimiento: al integrarse en el flujo de Frigate, el modelo solo se ejecuta sobre regiones dinamicas detectadas, reduciendo el coste computacional en escenas estaticas y aprovechando la resolucion de 320x320 alineada con el tamano minimo de region de movimiento de Frigate.
- Despliegue en Jetson y dispositivos embebidos: el modelo compacto es la opcion recomendada cuando la variante `MDV6-yolov10-e` resulta demasiado pesada, permitiendo inferencia en tiempo real en plataformas con recursos restringidos.
- Monitorizacion de accesos y perimetros: la deteccion de las clases `person` y `car` permite generar alertas de presencia humana o vehicular en entornos rurales o remotos, combinada con la deteccion de fauna para distinguir eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aplican a un detector de objetos). Si se documentan latencias de referencia medidas por el autor:

| Plataforma | Runtime | Latencia p50 |
|---|---|---|
| Intel N95 (4 nucleos Alder Lake-N, solo CPU) | ONNX Runtime CPU, 4 hilos | 16,6 ms |
| Intel N95 (solo CPU) | OpenVINO CPU | 19,8 ms |
| Intel N95 iGPU (16 EU) | OpenVINO GPU | 21,9 ms (min 16,5 ms; compilacion 11,3 s) |
| GPU NVIDIA | TensorRT FP16 | < 2 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (modelo de 4,8 MB); en la practica el cuello de botella es el runtime y el buffer de entrada, no el peso del modelo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte TensorRT (latencia < 2 ms); iGPU Intel con OpenVINO (N95/N100, 16 EU); Jetson para despliegue embebido.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU integradas; tambien funciona en CPU sola.
- Opciones de despliegue: Frigate NVR (tipo `onnx`, `model_type: yolo-generic`), ONNX Runtime (CPU), OpenVINO (CPU/GPU), TensorRT (FP16), y las rutas documentadas en `mgranberry/frigate-wildlife-onnx` para NVIDIA, Intel OpenVINO, AMD ROCm y CPU.
- Latencia y throughput estimados: 16,6 ms p50 en CPU N95 (ONNX Runtime), 19,8 ms p50 en CPU N95 (OpenVINO), 21,9 ms p50 en iGPU N95 (OpenVINO), < 2 ms en GPU NVIDIA con TensorRT FP16. El throughput depende del numero de hilos y de la plataforma; no se documenta un valor agregado de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MDV6-yolov10-c 320 NHWC FP16 ONNX (este modelo) | ~2,7 M | 320x320 | ONNX FP16 | AGPL-3.0 | Compacto, para hardware de baja potencia |
| `mgranberry/megadetector-v6-yolov10e-320-nhwc-fp16-onnx` | no disponible | 320x320 | ONNX FP16 | AGPL-3.0 | Variante `e`, mas pesada; recomendada cuando el compacto no es suficiente |
| MegaDetector upstream `MDV6-yolov10-c.pt` | ~2,7 M | no disponible | PyTorch (`.pt`) | AGPL-3.0 | Modelo original sin adaptacion a Frigate; requiere pre/postprocesado propio |

## Limitaciones y advertencias

- El modelo solo detecta tres clases (`animal`, `person`, `car`); no cubre otras categorias de objetos.
- La resolucion de entrada esta fijada a 320x320, lo que limita la deteccion de objetos muy pequeños o lejanos en la imagen.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento (posible infrarrepresentacion de especies, condiciones de iluminacion o geografias concretas).
- Riesgo de falsos positivos y negativos inherente a un detector compacto de ~2,7 M de parametros; no se documentan metricas de precision/recall (mAP) en la informacion disponible.
- La licencia AGPL-3.0 impone obligaciones copyleft: el uso en servicios en red puede requerir la publicacion del codigo fuente derivado; es necesario revisar el cumplimiento antes de un despliegue comercial.
- El modelo esta pensado para el pipeline de Frigate y su parser `yolo-generic`; su uso fuera de ese entorno requiere adaptar el pre/postprocesado a la forma de entrada `[1, 320, 320, 3]` `uint8` NHWC y salida `[1, 7, 300]`.
- No dispone de capacidades linguisticas, de razonamiento ni de generacion; no debe evaluarse con benchmarks de LLM.
- La fecha de creacion del repositorio (2026-11-20) y el bajo numero de descargas (0) y likes (0) indican que es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mgranberry/megadetector-v6-yolov10c-320-nhwc-fp16-onnx
- Repositorio de preparacion, Dockerfiles y scripts de verificacion: https://github.com/mgranberry/frigate-wildlife-onnx
- MegaDetector upstream: https://github.com/agentmorris/MegaDetector
- Pesos upstream `MDV6-yolov10-c.pt` (Zenodo): https://zenodo.org/records/18177050
- Variante `e` (mas pesada): https://huggingface.co/mgranberry/megadetector-v6-yolov10e-320-nhwc-fp16-onnx
