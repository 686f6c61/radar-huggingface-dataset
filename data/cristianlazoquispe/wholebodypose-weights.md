# CristianLazoQuispe/wholebodypose-weights

## Resumen

`CristianLazoQuispe/wholebodypose-weights` no es un modelo entrenado por su autor, sino un espejo byte a byte de los pesos de terceros que la librería [WholeBodyPose](https://github.com/CristianLazoQuispe/WholebodyPoseEstimation) descarga en tiempo de ejecución. El repositorio existe para garantizar la reproducibilidad de los resultados del artículo WholeBodyPose (ICMV 2025) frente a la posible desaparición o movimiento de los enlaces originales. Los únicos artefactos producidos por los autores del espejo son las exportaciones ONNX de ViTPose+ (`vitpose/*.onnx`), convertidas desde los checkpoints originales sin reentrenamiento.

El contenido abarca tres familias de modelos de estimación de pose: RTMW/RTMPose de OpenMMLab (pose de cuerpo completo y detectores de persona YOLOX entrenados en Human-Art), ViTPose+ (variantes S/B/L/H con cabezas COCO-WholeBody) y los landmarkers de MediaPipe Tasks (pose BlazePose GHUM, manos y cara en float16). Todos se distribuyen en formato ONNX o `.task`, lo que permite inferencia en CPU y GPU sin depender de frameworks de entrenamiento.

La relevancia actual radica en que agrupa en un único repositorio de 5,0 GB los pesos necesarios para pipelines de keypoint detection de cuerpo completo (133 keypoints COCO-WholeBody: cuerpo, manos y cara), con hashes SHA-256 fijados en `wholebodypose/weights.py` y verificados en cada descarga. Es un recurso de infraestructura para reproducibilidad, no un modelo novel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixta: RTMW (RTMPose whole-body, CNN), YOLOX (detector), ViTPose+ (transformer ViT), MediaPipe BlazePose GHUM / Hands / Face Mesh (CNN ligera) |
| Parametros totales | No disponible (depende de cada checkpoint; el repo agrega 5,0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 en checkpoints ViTPose+ (`*_half.pth`); ONNX exportado con opset 17 y batch dinamico; MediaPipe en float16; no se documentan cuantizaciones INT8 |
| Idiomas soportados | No disponible (modelos de vision, independientes del idioma) |
| Licencia | `apache-2.0-with-dataset-restrictions` (pesos Apache-2.0, pero los datasets de entrenamiento tienen sus propios terminos) |
| Formato de pesos | ONNX (`.onnx`), PyTorch fp16 (`.pth`), MediaPipe Tasks (`.task`) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos; agrega pesos ya entrenados por sus autores originales. RTMW (RTMPose for whole-body) es una arquitectura CNN con SimCC (Simulated Coordinate Classification) entrenada sobre el dataset Cocktail14 durante 270 epocas, con resoluciones de entrada 384x288 y 256x192; se exporta a ONNX para su uso con `rtmlib`. Los detectores de persona son YOLOX-m y YOLOX-tiny entrenados en Human-Art (300 epocas), que aportan robustez en escenas no centradas en personas. ViTPose+ emplea un backbone Vision Transformer (variantes S, B, L y H) con cabezas especificas por dataset; los checkpoints COCO-WholeBody se distribuyen en fp16 divididos por cabeza y se exportan a ONNX (opset 17, batch dinamico) mediante `scripts/export_vitpose_onnx.py`. MediaPipe aporta los landmarkers BlazePose GHUM (heavy/full), Hands y Face Mesh en formato `.task` float16.

No se documentan en la informacion disponible detalles sobre composicion exacta de los datasets de entrenamiento, uso de RLHF/DPO (no aplica a modelos de vision) ni innovaciones tecnicas adicionales mas alla del empaquetado reproducible con verificacion SHA-256 y la exportacion ONNX propia de ViTPose+.

## Capacidades

- Deteccion de keypoints de cuerpo completo (formato COCO-WholeBody, 133 puntos: cuerpo, manos y cara) mediante RTMW y ViTPose+.
- Deteccion de personas (bounding boxes) con YOLOX-m y YOLOX-tiny entrenados en Human-Art.
- Estimacion de pose corporal con MediaPipe BlazePose GHUM (heavy/full).
- Landmarks de manos (MediaPipe Hands) y de cara (MediaPipe Face Mesh).
- Inferencia en CPU y GPU via ONNX Runtime y MediaPipe Tasks.
- Modos de operacion de la libreria: `performance`, `balanced` y `lightweight`, con distintos pares detector/pose.
- Soporte para reconocimiento de lengua de signos (tag `sign-language`) como caso de uso derivado del pipeline de cuerpo completo.
- Verificacion de integridad de pesos mediante SHA-256 en cada descarga.

## Casos de uso

- **Reproducibilidad de investigacion**: fijar los hashes SHA-256 de `wholebodypose/weights.py` para que los experimentos del articulo ICMV 2025 se reproduzcan exactamente aunque los enlaces de OpenMMLab o Google cambien.
- **Analisis de lengua de signos**: el pipeline de 133 keypoints (cuerpo, manos y cara) permite alimentar modelos de reconocimiento de signos; RTMW en modo `performance` (384x288) ofrece la mayor precision para keypoints de manos.
- **Monitorizacion de ejercicio y ergonomia**: usar RTMW `balanced` (256x192, 218 MB) para estimar postura en tiempo real desde video de webcam, con YOLOX-tiny (19,3 MB) como detector en entornos con recursos limitados.
- **Despliegue en edge**: MediaPipe Tasks (float16) y YOLOX-tiny permiten ejecutar pose, manos y cara en dispositivos moviles o CPU sin GPU dedicada.
- **Pipelines de vision en produccion**: exportaciones ONNX con batch dinamico (opset 17) integrables en ONNX Runtime, TensorRT o servicios de inferencia que acepten ONNX.
- **Analisis de escenas no centradas en personas**: los detectores YOLOX entrenados en Human-Art mejoran la deteccion en imagenes artisticas o con personas pequenas o parcialmente ocluidas.
- **Prototipado rapido con demo**: el Space `WholeBodyPoseDemo` permite validar el pipeline completo antes de integrar los pesos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de AP, PCK ni latencias; solo lista tamanos de fichero y hashes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por tamano de fichero, RTMW-dw-x-l (~219 MB) y YOLOX-m (~97 MB) caben holgadamente en GPUs consumer; ViTPose+ H es el checkpoint mas pesado del repositorio (tamano exacto no listado en la informacion disponible).
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime o CUDA; para ViTPose+ H se recomienda al menos una RTX 3090/4090 por margen, aunque el dato no esta confirmado en la informacion.
- Cabe en GPU consumer: si, al menos RTMW, YOLOX y MediaPipe; ViTPose+ S/B con seguridad, L/H segun VRAM disponible (no confirmado).
- Opciones de despliegue: ONNX Runtime (formato nativo del repo), MediaPipe Tasks, `rtmlib`, y cualquier runtime compatible con ONNX (TensorRT, OpenVINO). No se mencionan vLLM, llama.cpp ni Ollama (no aplican a vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Familia | Keypoints | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WholeBodyPose weights (este repo) | RTMW + ViTPose+ + MediaPipe | 133 (COCO-WholeBody) | ONNX, .pth, .task | Apache-2.0 con restricciones de dataset | Hugging Face (espejo) |
| MMPose / RTMPose upstream | RTMPose / RTMW | 17 / 133 | ONNX, pth | Apache-2.0 | download.openmmlab.com |
| ViTPose+ upstream | ViTPose+ (S/B/L/H) | 133 | pth | Apache-2.0 | GitHub ViTAE-Transformer |
| MediaPipe Pose Landmarker | BlazePose GHUM | 33 | .task | Apache-2.0 | Google AI Edge |

La ventaja de este repositorio frente a los upstream es la agregacion en un solo lugar con hashes verificados y exportaciones ONNX listas para produccion; la desventaja es que no anade mejoras de rendimiento sobre los originales.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: cualquier problema de precision o sesgo proviene de los modelos originales (RTMW, ViTPose+, YOLOX, MediaPipe).
- La licencia `apache-2.0-with-dataset-restrictions` implica que los pesos son Apache-2.0 pero los datasets de entrenamiento (COCO, COCO-WholeBody, Human-Art y otros) tienen terminos propios que deben revisarse antes de uso comercial.
- Riesgo de sesgo heredado de los datasets: posibles diferencias de rendimiento segun tono de piel, genero, edad, vestimenta y oclusiones.
- Los modelos de vision no generan texto; no hay riesgo de alucinacion linguistica, pero si de keypoints espurios en imagenes de baja calidad o con multiples personas solapadas.
- No se documentan idiomas ni contexto: no aplica, pero limita el uso a tareas de vision.
- El repositorio es un espejo: si los upstream retiran sus pesos por cambios de licencia, este espejo podria quedar desactualizado o en una situacion legal ambigua.
- Tamano del repo de 5,0 GB: la descarga completa es costosa; conviene descargar solo los ficheros necesarios segun el modo (`performance`, `balanced`, `lightweight`).
- No se proporcionan benchmarks ni latencias, por lo que la eleccion de variante debe validarse empiricamente en el caso de uso concreto.

## Enlaces

- Hugging Face: https://huggingface.co/CristianLazoQuispe/wholebodypose-weights
- Codigo: https://github.com/CristianLazoQuispe/WholebodyPoseEstimation
- Pagina del proyecto: https://cristianlazoquispe.github.io/WholebodyPoseEstimation/
- Demo: https://huggingface.co/spaces/CristianLazoQuispe/WholeBodyPoseDemo
- Dataset de pose: https://huggingface.co/datasets/CristianLazoQuispe/pose-action-recognition
- Licencia de pesos: https://huggingface.co/CristianLazoQuispe/wholebodypose-weights/blob/main/WEIGHTS_LICENSE.md
- Script de exportacion ONNX: https://github.com/CristianLazoQuispe/WholebodyPoseEstimation/blob/main/scripts/export_vitpose_onnx.py
- Paper RTMW: https://arxiv.org/abs/2407.08634
- Paper RTMPose: https://arxiv.org/abs/2303.07399
- Paper YOLOX: https://arxiv.org/abs/2107.08430
- Paper Human-Art: https://arxiv.org/abs/2303.02760
- Paper ViTPose++: https://arxiv.org/abs/2212.04246
- Paper ViTPose: https://arxiv.org/abs/2204.12484
- Paper MediaPipe: https://arxiv.org/abs/1906.08172
- Paper BlazePose: https://arxiv.org/abs/2006.10204
- Paper MediaPipe Hands: https://arxiv.org/abs/2006.10214
- Paper Face Mesh: https://arxiv.org/abs/1907.06724
- MMPose RTMPose: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose
- rtmlib: https://github.com/Tau-J/rtmlib
- onepose (release 1.0.0): https://github.com/developer0hye/onepose/releases/tag/1.0.0
- ViTAE-Transformer/ViTPose: https://github.com/ViTAE-Transformer/ViTPose
- MediaPipe: https://github.com/google-ai-edge/mediapipe
- MediaPipe model cards: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#models
