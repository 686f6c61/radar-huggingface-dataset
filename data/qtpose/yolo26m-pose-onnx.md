# qtpose/yolo26m-pose-onnx

## Resumen

YOLO26m pose (ONNX) es una exportación a formato ONNX del modelo Ultralytics YOLO26m-pose, un detector de personas con estimación de pose de un solo estadio entrenado sobre COCO-Pose con 17 keypoints. El artefacto lo publica el usuario `qtpose` como pieza de infraestructura para su propio ecosistema: se emplea como modelo único de persona más pose y, bajo el alias `yolo26m_person`, como detector de personas en pipelines de pose de dos estadios.

El modelo no introduce arquitectura propia: es una conversión fiel del checkpoint `yolo26m-pose.pt` de Ultralytics, exportado con Ultralytics 8.4.47 y PyTorch 2.11.0 con entrada fija de 640x640, opset 17 y sin simplificación. La cabeza de YOLO26 es end-to-end, de modo que la salida ya viene posprocesada y no requiere NMS externo, lo que simplifica el despliegue en entornos de inferencia ligeros.

Su relevancia es práctica: ofrece un grafo ONNX autocontenido de 86,5 MB con metadatos de exportación verificables y hash SHA-256 publicado, lo que permite integrarlo en runtimes ONNX sin dependencia de PyTorch ni del paquete `ultralytics`. La licencia AGPL-3.0, heredada de los pesos originales, condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector de un solo estadio con cabeza end-to-end para persona + pose |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye el grafo ONNX en float32) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26m_pose.onnx`, 86 529 329 bytes) |

Especificaciones adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Entrada | `images`, float32, `(1, 3, 640, 640)`, RGB, escala 0-1, letterbox |
| Salida | `output0`, float32, `(1, 300, 57)` |
| Formato de fila de salida | `[x1, y1, x2, y2, score, class_id, kx1, ky1, kc1, …, kx17, ky17, kc17]` en píxeles de la imagen de entrada |
| Keypoints | COCO-17 (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas, tobillos; izquierda antes que derecha) |
| Clases | `person` (id 0) |
| Opset | 17 |
| Entrada dinámica | no (`dynamic=False`) |
| NMS en el grafo | no (`nms=False`); la cabeza end-to-end lo hace innecesario |
| SHA-256 | `234c59bcb2347ef508a3aa422f300f0466e016882ea3ab51941620fbadd8c943` |
| Version de exportacion | Ultralytics 8.4.47, PyTorch 2.11.0, 2026-05-06 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO26 en su variante `m` (medium) para la tarea de pose, una red convolucional de detección de un solo estadio que predice simultáneamente cajas de persona y 17 keypoints por instancia. La innovación relevante de esta generación es la cabeza end-to-end (`end2end=True`): el modelo emite directamente hasta 300 detecciones ya resueltas en la salida `(1, 300, 57)`, de forma que el consumidor no necesita aplicar supresión de no máximos. Cada fila combina caja, puntuación, clase y 17 tríos de coordenada y confianza de keypoint.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de ajuste adicionales más allá de lo publicado por Ultralytics; la model card solo indica que el checkpoint de origen es `yolo26m-pose.pt` entrenado sobre COCO-Pose. La exportación se realizó con entrada estática de 640x640, `simplify=False` y `dynamic=False`, lo que implica que el grafo no admite cambios de resolución en tiempo de ejecución sin reexportar. El autor documenta el script `scripts/dev/convert_yolo26_to_onnx.py --task pose --variant m --validate` como procedimiento reproducible de conversión.

## Capacidades

- Detección de personas con caja delimitadora en una sola pasada, hasta 300 instancias por imagen.
- Estimación de pose humana con 17 keypoints en orden COCO-17, incluyendo confianza por keypoint.
- Modelo único para persona y pose (no requiere detector separado en el pipeline de un estadio).
- Reutilizable como detector de personas (`yolo26m_person`) para pipelines de pose de dos estadios.
- Salida end-to-end sin NMS: el grafo entrega detecciones finales directamente.
- Inferencia portable vía ONNX Runtime u otros runtimes compatibles con opset 17, sin dependencia de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Análisis de vídeo deportivo: extracción de keypoints por fotograma para calcular ángulos articulares, cinemática de zancada o técnica de levantamiento; la salida sin NMS simplifica el bucle de inferencia a 640x640.
- Control de aforo y seguridad en espacios: detección de personas con cajas y poses para estimar ocupación y detectar caídas o posturas anómalas en tiempo real sobre streams de cámara IP.
- Teleoperación y captura de movimiento de bajo coste: uso de los 17 keypoints como entrada a un rig simplificado o a un avatar, sustituyendo sistemas de marcadores en prototipos.
- Preetiquetado de datasets: generación automática de anotaciones de persona y pose sobre imágenes propias para revisión humana posterior, aprovechando el formato COCO-17.
- Pipelines de dos estadios: empleo como `yolo26m_person` para recortar regiones de persona que alimentan un modelo de pose de mayor resolución, reduciendo el coste frente a ejecutar el modelo de pose sobre la imagen completa.
- Ergonomía y análisis postural en puesto de trabajo: procesamiento por lotes de grabaciones para medir ángulos de hombro, codo y rodilla y generar informes de riesgo ergonómico.
- Integración en aplicaciones de escritorio o móviles con ONNX Runtime: al ser un grafo autocontenido de 86,5 MB en float32, cabe en despliegues sin GPU dedicada y sin instalar el stack de Ultralytics.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, AP de keypoints, latencia ni throughput para este artefacto ONNX.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el grafo float32 de 86,5 MB ocupa menos de 1 GB de memoria de pesos; el consumo real depende del runtime y del tamaño de lote.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) es candidata; el modelo es lo bastante pequeño para GPUs de gama media.
- GPU de consumo: previsiblemente cabe en tarjetas consumer con varios GB de VRAM, aunque no hay cifras publicadas que lo confirmen.
- Despliegue: ONNX Runtime (CPU y CUDA), TensorRT, OpenVINO y otros runtimes compatibles con opset 17. No se distribuyen pesos GGUF ni se menciona soporte de llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Keypoints | Formato | Licencia |
|---|---|---|---|---|---|
| YOLO26m-pose ONNX (este) | no disponible | 640x640 fija | 17 (COCO) | ONNX, end-to-end sin NMS | AGPL-3.0 |
| YOLO11m-pose (Ultralytics) | no disponible | configurable | 17 (COCO) | PyTorch, ONNX, TensorRT | AGPL-3.0 |
| YOLOv8m-pose (Ultralytics) | no disponible | configurable | 17 (COCO) | PyTorch, ONNX, TensorRT | AGPL-3.0 |
| RTMPose-m (MMPose) | no disponible | configurable | 17 (COCO) | PyTorch, ONNX | Apache-2.0 |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a formato, licencia y configuración de entrada. RTMPose se incluye como alternativa de licencia permisiva, aunque su enfoque habitual es de dos estadios (detector más modelo de pose).

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en productos o servicios propietarios exige cumplir las obligaciones de la AGPL o contratar la licencia enterprise de Ultralytics. Es la restricción más relevante para producción.
- Entrada estática de 640x640: no admite resolución dinámica; para otras resoluciones hay que reexportar el modelo.
- Una sola clase (`person`): no detecta otras categorías ni pose de animales u objetos.
- Pose limitada a 17 keypoints COCO: sin keypoints de manos, cara densa ni pies detallados.
- Rendimiento en escenas con oclusiones severas, multitud densa o personas muy pequeñas no está documentado y dependerá del entrenamiento original en COCO-Pose.
- Riesgo de falsos positivos y de keypoints con baja confianza; conviene filtrar por el campo de confianza por keypoint de la salida.
- Sesgos del dataset COCO-Pose en cuanto a distribución demográfica, iluminación y contextos; no hay evaluación de sesgo publicada para este artefacto.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de uso en producción.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Hugging Face: https://huggingface.co/qtpose/yolo26m-pose-onnx
- Perfil del autor en Hugging Face: https://huggingface.co/qtpose
- Licencia de Ultralytics: https://www.ultralytics.com/license
