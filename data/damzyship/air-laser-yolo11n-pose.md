# Damzyship/air-laser-yolo11n-pose

## Resumen

Air-Laser YOLO11n-Pose es un modelo de deteccion de keypoints derivado de YOLO11n-Pose, publicado por el usuario Damzyship en Hugging Face. Su proposito es el seguimiento de manos y punteros en condiciones de iluminacion adversa, disenado especificamente para la aplicacion Air-Laser Studio, que combina escritura en el aire y apuntado estilo VR. El modelo detecta dos clases de objetos con tres keypoints cada una: `hand_pointer` (con los puntos `index_mcp`, `index_tip` y `thumb_tip`) y `held_pen` (con `pen_base`, `pen_tip` y `hand_grip`).

La relevancia del modelo radica en su enfoque sobre un problema concreto: la deteccion robusta en escenarios de baja luminosidad. Segun la model card, en un benchmark propio con luminancia media de aproximadamente 32, el modelo alcanza una tasa de deteccion del 69,8% (74 de 106 muestras), frente al 18,0% de MediaPipe HandLandmarker sin ajustes. Esta diferencia de mas de 50 puntos porcentuales justifica su existencia como alternativa especializada.

El repositorio es muy ligero (0,0 GB reportados) e incluye pesos en tres formatos: PyTorch/Ultralytics (`best.pt`), ONNX a 416x416 para Unity Sentis y ONNX Runtime (`best.onnx`), y un modelo OpenVINO FP16 (`best_openvino_model.zip`) orientado a CPU e iGPU Intel. La informacion publica es escasa: no se especifican licencia, idiomas, parametros totales ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n-Pose (deteccion de keypoints, backbone YOLO11 nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 (OpenVINO IR); ONNX en precision original; pesos PyTorch |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`best.onnx`, 416x416), OpenVINO FP16 IR |

## Arquitectura y entrenamiento

El modelo se basa en YOLO11n-Pose, la variante nano de la familia YOLO11 de Ultralytics para estimacion de pose y keypoints. La arquitectura es una red convolucional de una sola etapa que predice simultaneamente cajas delimitadoras y keypoints por instancia. En este caso, la cabeza de prediccion se ha reconfigurado para dos clases con tres keypoints cada una: `hand_pointer` (`index_mcp`, `index_tip`, `thumb_tip`) y `held_pen` (`pen_base`, `pen_tip`, `hand_grip`).

No se dispone de informacion publica sobre el numero de tokens de entrenamiento (no aplica en vision), la composicion del dataset, el numero de imagenes, el esquema de aumento de datos ni si se aplicaron tecnicas de destilacion o ajuste fino desde los pesos oficiales de YOLO11n-Pose. La model card menciona que el modelo es "low-light-robust", lo que sugiere un entrenamiento con imagenes de baja luminosidad o un aumento especifico, pero no se detalla el procedimiento. Tampoco se documenta el proceso de anotacion de keypoints ni la resolucion de entrenamiento original (la inferencia ONNX se fija a 416x416).

## Capacidades

- Deteccion de keypoints en imagenes para dos clases: mano con puntero (`hand_pointer`) y mano con boligrafo (`held_pen`).
- Localizacion de tres keypoints por instancia: para `hand_pointer`, base del indice, punta del indice y punta del pulgar; para `held_pen`, base del boligrafo, punta del boligrafo y punto de agarre.
- Funcionamiento en condiciones de baja iluminacion, con una tasa de deteccion reportada del 69,8% en un benchmark propio a luminancia ~32.
- Inferencia en tiempo real: la version OpenVINO FP16 alcanza entre 60 y 150 FPS en CPU e iGPU Intel, segun la model card.
- Exportacion a ONNX a 416x416, compatible con Unity Sentis y ONNX Runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades linguisticas o multimodales mas alla de la vision.
- No se documentan capacidades de seguimiento temporal (tracking) ni de estimacion de pose corporal completa.

## Casos de uso

- Escritura en el aire en tiempo real: el modelo detecta la punta del indice (`index_tip`) y la punta del boligrafo (`pen_tip`) para trazar trayectorias de escritura en un plano virtual; su robustez en baja luminosidad permite su uso en entornos con poca luz donde MediaPipe falla.
- Apuntado estilo VR sin mandos: la deteccion de `hand_pointer` con `index_tip` y `thumb_tip` permite implementar un cursor gestual en aplicaciones de realidad virtual o aumentada que se ejecutan en dispositivos sin tracking dedicado.
- Digitalizacion de trazos con boligrafo fisico: la clase `held_pen` con `pen_base`, `pen_tip` y `hand_grip` permite capturar la escritura con un boligrafo real sobre una superficie, util para pizarras digitales de bajo coste.
- Aplicaciones de accesibilidad: control de interfaces por gestos de mano en condiciones de iluminacion domestica variable, con inferencia en CPU mediante OpenVINO, lo que reduce la dependencia de GPU.
- Despliegue en dispositivos de borde: el formato ONNX a 416x416 y el modelo OpenVINO FP16 permiten ejecutar la inferencia en mini-PC, portatiles o sistemas embebidos con iGPU Intel, sin necesidad de GPU dedicada.
- Prototipado rapido en Unity: la compatibilidad con Unity Sentis permite integrar el modelo en proyectos de Unity para experiencias interactivas de captura de movimiento de manos sin salir del motor.
- Evaluacion comparativa de robustez: el benchmark propio a luminancia ~32 sirve como referencia para comparar detectores de manos en condiciones adversas, aunque sus resultados no son directamente comparables con benchmarks publicos estandarizados.

## Benchmarks y rendimiento

La unica metrica publicada es un benchmark propio de "bad lighting" con luminancia media de aproximadamente 32, sobre 106 muestras:

| Modelo | Tasa de deteccion | Muestras detectadas |
|---|---|---|
| MediaPipe HandLandmarker (sin ajustes) | 18,0% | no disponible |
| Air-Laser YOLO11n-Pose | 69,8% | 74/106 |

No se han publicado resultados de benchmarks estandarizados (COCO keypoints, AP, AR, mAP) en la informacion disponible. No se dispone de datos de latencia exacta por frame ni de throughput en GPU; la model card solo indica 60-150 FPS en OpenVINO FP16 sobre CPU/iGPU Intel.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un modelo YOLO11 nano, la huella es muy reducida (tipicamente por debajo de 1 GB en FP16 y por debajo de 2 GB en FP32), aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no especificadas. El modelo esta optimizado para CPU e iGPU Intel mediante OpenVINO; cualquier GPU consumer moderna (RTX 3060 o superior) puede ejecutarlo, pero no hay datos publicados.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer actual, dado el tamano nano de la arquitectura; sin confirmacion oficial.
- Opciones de despliegue: Unity Sentis, ONNX Runtime (ONNX 416x416), OpenVINO (FP16 IR), Ultralytics (PyTorch `best.pt`).
- Latencia y throughput: 60-150 FPS en OpenVINO FP16 sobre CPU/iGPU Intel, segun la model card. No hay datos para GPU dedicada ni para ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Tipo | Clases/keypoints | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Air-Laser YOLO11n-Pose | YOLO11n-Pose especializado | 2 clases, 3 keypoints cada una | Baja luminosidad, air-writing | no disponible | Hugging Face |
| MediaPipe HandLandmarker | Solucion de Google | 1 mano, 21 keypoints | Uso general, iluminacion normal | Apache 2.0 (segun documentacion publica de MediaPipe) | Google MediaPipe |
| YOLO11n-Pose oficial (Ultralytics) | Deteccion de pose general | 1 clase persona, 17 keypoints | Pose humana general | AGPL-3.0 (segun Ultralytics) | Ultralytics / Hugging Face |

La comparativa con MediaPipe se basa en el benchmark propio del autor (69,8% frente a 18,0% a luminancia ~32); no hay comparaciones independientes. Frente a YOLO11n-Pose oficial, la diferencia principal es la especializacion en manos y punteros con tres keypoints, a costa de perder la deteccion de pose corporal completa.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card ni en los metadatos de Hugging Face; no se puede asumir uso comercial sin consultar al autor.
- El benchmark de baja luminosidad es propio, con solo 106 muestras y sin protocolo estandarizado; los resultados no son directamente comparables con benchmarks publicos.
- El modelo detecta unicamente dos clases con tres keypoints cada una; no proporciona los 21 keypoints de mano de MediaPipe ni la pose corporal de 17 keypoints de YOLO11n-Pose estandar.
- No se documenta el dataset de entrenamiento, por lo que se desconoce el sesgo respecto a tonos de piel, tipos de mano, iluminacion o dispositivos de captura.
- Riesgo de falsos positivos o perdida de keypoints en escenas con oclusiones, movimiento rapido o fondos con texturas similares a la piel.
- No hay informacion sobre el rendimiento en GPU dedicada ni en otros formatos de exportacion (TensorRT, CoreML, TFLite).
- El repositorio reporta 0,0 GB, lo que puede indicar que los artefactos no estan realmente subidos o que el tamano no se ha calculado; conviene verificar la disponibilidad de `best.pt`, `best.onnx` y `best_openvino_model.zip` antes de integrarlo.
- El modelo se publico en 2026-11-24 y no tiene descargas ni likes; no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Damzyship/air-laser-yolo11n-pose
- Ultralytics YOLO11 (base arquitectonica): https://docs.ultralytics.com/models/yolo11/
- Unity Sentis: https://unity.com/products/sentis
- OpenVINO: https://docs.openvino.ai/
- ONNX Runtime: https://onnxruntime.ai/
- MediaPipe HandLandmarker (referencia comparativa): https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
