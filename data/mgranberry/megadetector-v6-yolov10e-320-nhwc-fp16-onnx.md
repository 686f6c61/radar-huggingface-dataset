# mgranberry/megadetector-v6-yolov10e-320-nhwc-fp16-onnx

## Resumen

MegaDetector v6 YOLOv10-e 320x320 NHWC uint8 FP16 ONNX es una exportación optimizada del detector de fauna salvaje MegaDetector v6, concretamente del checkpoint `MDV6-yolov10-e.pt` publicado por el proyecto SPARROW. El autor del repo, `mgranberry`, lo ha adaptado para que Frigate NVR lo consuma directamente como detector `yolo-generic`, sin necesidad de preprocesado ni postprocesado en CPU. El modelo detecta tres clases: `animal`, `person` y `car`.

La innovación principal no está en el modelo en sí, sino en el grafo ONNX: la entrada es `uint8` en formato NHWC con un `Cast` inicial (en lugar de NCHW float32), y la salida se reordena a `[1, 7, 300]` dentro del propio grafo para que coincida con el parser `post_process_yolo` de Frigate. Esto permite que TensorRT fusione las operaciones de normalización y transposición en GPU, reduciendo la latencia y eliminando el glue code en CPU.

Es relevante para quienes despliegan Frigate en hardware con GPU dedicada (NVIDIA o AMD) y necesitan un detector de fauna con resolución de 320x320, que es el mínimo que Frigate usa para las regiones dinámicas de movimiento. Para CPU o iGPU Intel de gama baja, el autor recomienda la variante compacta YOLOv10-c.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10 (variante `e`, exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP16 (exportación con `keep_io_types=True`); entrada `uint8` |
| Idiomas soportados | no aplica (detección de objetos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`model.onnx`, ~0.1 GB de repo) |

Especificaciones adicionales del grafo:

| Parametro | Valor |
|---|---|
| Entrada | `images`, shape `[1, 320, 320, 3]`, dtype `uint8`, RGB `[0..255]` |
| Salida | `frigate_adapter_output`, shape `[1, 7, 300]`, dtype `float32` |
| Formato de salida | `[cx, cy, w, h, animal_score, person_score, car_score]` transpuesto a `[1, 4 + num_classes, N]` |
| Clases | `animal`, `person`, `car` |
| Resolución | 320x320 |
| SHA-256 `model.onnx` | `986dbefa4e942600596d9bb76f8b206c840f3a3a44564f380bc65fadc0ed9ad1` |
| SHA-256 `labels.txt` | `21d65004ba77117392dc1ee1e108a1a9ffc76d658a27536be3dc93a2ba676bc4` |

## Arquitectura y entrenamiento

El modelo base es YOLOv10 en su variante `e` (la más grande de la familia YOLOv10), un detector de objetos de una sola etapa con arquitectura CNN. MegaDetector v6 emplea YOLOv10 como backbone de detección y se entrena para localizar fauna, personas y vehículos en imágenes de cámaras trampa y cámaras de vigilancia. No se dispone en la información proporcionada de detalles sobre el número de tokens, composición del dataset ni si hubo RLHF/DPO (no aplica en un detector).

La contribución técnica de esta exportación es el reempaquetado del grafo ONNX para el pipeline de Frigate. Se antepone `Cast(uint8 -> float32) -> Div(255.0) -> Transpose(NHWC -> NCHW)` a la entrada, de modo que la normalización y la transposición se ejecutan en GPU y TensorRT puede fusionarlas. El `Cast` se coloca antes del `Transpose` para evitar tensores intermedios `uint8` que TensorRT rechaza. En la salida, se añade la conversión a `[1, 7, 300]` usando `Equal` + `Cast` (en lugar de `OneHot`) para que el parser estándar `yolo-generic` de Frigate lo consuma sin modificaciones y todo el grafo quede dentro de un único engine de TensorRT.

## Capacidades

- Detección de objetos en imágenes de cámaras de vigilancia y cámaras trampa.
- Tres clases: `animal`, `person`, `car`.
- Salida compatible de forma nativa con el parser `yolo-generic` de Frigate NVR.
- Entrada `uint8` NHWC RGB lista para consumir frames sin preprocesado en CPU.
- Inferencia acelerada por TensorRT (FP16) en GPU NVIDIA o AMD.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un detector de visión, no un LLM).
- No soporta visión generativa ni audio; solo detección.

## Casos de uso

- Vigilancia de fauna en jardines y fincas: el modelo se integra en Frigate como detector principal y dispara grabaciones o notificaciones cuando detecta un `animal`, filtrando falsos positivos por movimiento de vegetación gracias a la clase explícita.
- Monitorización de cámaras trampa en investigación de campo: con 320x320 de resolución y ~2-4 ms por frame en GPU, permite procesar secuencias completas de vídeo en tiempo casi real para censos de fauna.
- Detección de intrusiones humanas en entornos rurales: la clase `person` permite distinguir personas de animales y vehículos, útil en sistemas de alarma perimetral con cámaras de baja resolución.
- Control de accesos de vehículos: la clase `car` permite registrar la entrada de vehículos en fincas o aparcamientos mediante Frigate, con la ventaja de compartir el mismo modelo que la detección de fauna.
- Despliegue en NVR doméstico con GPU dedicada: al estar empaquetado para `yolo-generic`, se configura con un fragmento YAML de cuatro líneas y no requiere scripts de preprocesado, lo que simplifica el mantenimiento.
- Prototipado rápido de pipelines de detección de fauna: el repo incluye scripts de reproducción y verificación en `mgranberry/frigate-wildlife-onnx`, útiles para validar el grafo antes de desplegarlo en producción.
- Sustitución de detectores genéricos en Frigate: al mantener las tres clases de MegaDetector, se puede reutilizar la lógica de automatizaciones existente sin reentrenar.

## Benchmarks y rendimiento

Latencia de inferencia reportada por el autor:

| Hardware | Runtime | Latencia p50 |
|---|---|---|
| NVIDIA GPU | TensorRT FP16 | ~2-4 ms |
| Intel N95 iGPU (16 EU) | OpenVINO GPU | 182.0 ms (min 174.8 ms; compilación 11.8 s) |
| Intel N95 (4 núcleos, CPU) | OpenVINO CPU | 462.2 ms |
| Intel N95 (4 núcleos, CPU) | ORT CPU, 4 hilos | 1110.3 ms |

No se han publicado resultados de benchmarks de precisión (mAP, mAR) en la información disponible. El autor remite a la variante compacta `mgranberry/megadetector-v6-yolov10c-320-nhwc-fp16-onnx` para CPU, con 16.6 ms p50 en N95.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 0.1 GB y el modelo es FP16, por lo que el peso en memoria es del orden de decenas de MB, más el overhead de TensorRT.
- GPU recomendadas: NVIDIA con soporte TensorRT (A100, H100, RTX 4090, RTX 3090, etc.) o AMD con soporte ROCm; el autor indica "dedicated NVIDIA or AMD GPUs".
- ¿Cabe en GPU de consumo? Sí, por tamaño; el cuello de botella es el soporte de TensorRT y el despliegue de Frigate, no la VRAM.
- Opciones de despliegue: Frigate NVR con detector `onnx` y `model_type: yolo-generic`; TensorRT en GPU; OpenVINO en iGPU/CPU (aunque el autor recomienda la variante `c` para Intel N95/N100 y CPU).
- Latencia y throughput: ~2-4 ms por frame en GPU NVIDIA con TensorRT FP16; 182 ms p50 en iGPU Intel N95; 462 ms p50 en CPU N95 con OpenVINO.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Clases | Licencia | Latencia GPU | Notas |
|---|---|---|---|---|---|---|
| Este modelo (`yolov10e-320-nhwc-fp16-onnx`) | YOLOv10-e ONNX | 320x320 | animal, person, car | AGPL-3.0 | ~2-4 ms (TensorRT FP16) | Optimizado para Frigate `yolo-generic` |
| `mgranberry/megadetector-v6-yolov10c-320-nhwc-fp16-onnx` | YOLOv10-c ONNX | 320x320 | animal, person, car | AGPL-3.0 | no disponible en GPU; 16.6 ms p50 en N95 CPU | Variante compacta para CPU/iGPU Intel |
| MegaDetector v6 upstream (`MDV6-yolov10-e.pt`) | YOLOv10-e PyTorch | variable | animal, person, vehicle | AGPL-3.0 | no disponible | Exportación estándar `[1,3,H,W]` float32; requiere glue code para Frigate |

No se dispone de datos de precisión comparada (mAP) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo detecta tres clases (`animal`, `person`, `car`); no distingue especies ni tipos de vehículo.
- Resolución fija de 320x320: objetos pequeños o lejanos pueden no detectarse; para escenas con fauna pequeña conviene una resolución mayor o un modelo distinto.
- La latencia en CPU e iGPU Intel es alta (462-1110 ms p50 en N95), lo que puede provocar caída de frames en Frigate; el autor recomienda la variante `c` para esos casos.
- Licencia AGPL-3.0: el uso comercial o la integración en servicios de red exige cumplir las obligaciones de copyleft de la AGPL, incluida la publicación del código modificado.
- El modelo no incluye información sobre sesgos demográficos o de otro tipo; al ser un detector de fauna y vehículos, el riesgo de sesgo se concentra en condiciones de iluminación, clima y geografía del dataset de entrenamiento (no disponible).
- Riesgo de falsos positivos en escenas con vegetación en movimiento o animales parcialmente ocluidos; conviene ajustar umbrales en Frigate.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.
- La fecha de creación indicada (2026-11-20) es futura respecto a la redacción habitual de fichas; verificar la vigencia del repo antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/mgranberry/megadetector-v6-yolov10e-320-nhwc-fp16-onnx
- Variante compacta para CPU: https://huggingface.co/mgranberry/megadetector-v6-yolov10c-320-nhwc-fp16-onnx
- Repo de preparación y scripts: https://github.com/mgranberry/frigate-wildlife-onnx
- MegaDetector upstream: https://github.com/agentmorris/MegaDetector
- Checkpoint SPARROW `MDV6-yolov10-e.pt`: https://zenodo.org/records/18177050
