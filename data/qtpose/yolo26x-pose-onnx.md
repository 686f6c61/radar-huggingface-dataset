# qtpose/yolo26x-pose-onnx

## Resumen

YOLO26x-pose (ONNX) es la exportación a formato ONNX del checkpoint `yolo26x-pose.pt` de Ultralytics, la variante extragrande de la familia YOLO26 especializada en estimación de pose humana sobre el conjunto COCO-Pose. Lo publica el usuario `qtpose` como artefacto de inferencia listo para producción, sin necesidad de PyTorch ni de post-procesado NMS. El modelo detecta personas y predice 17 keypoints por instancia en una sola pasada (single-stage), y también se reutiliza como detector de personas dentro de pipelines de pose en dos etapas.

El interés práctico del artefacto reside en su formato: un único fichero ONNX de 230.648.202 bytes (unos 0,2 GB) con entrada fija `(1, 3, 640, 640)` y salida fija `(1, 300, 57)`, lo que simplifica el despliegue en runtimes ligeros (ONNX Runtime, TensorRT, OpenVINO) y en entornos sin GPU dedicada. La cabeza de YOLO26 es end-to-end (`end2end=True`), por lo que el modelo entrega directamente las detecciones finales sin NMS externo.

No se trata de un modelo de lenguaje: no genera texto ni admite instrucciones en lenguaje natural. Es un modelo de visión por computador para keypoint detection, con licencia AGPL-3.0 heredada de los pesos originales de Ultralytics, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector single-stage con cabeza end-to-end para pose; exportado a ONNX |
| Parametros totales | no disponible (el repositorio solo indica el tamano del fichero ONNX: 230.648.202 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de imagen 640x640) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26x_pose.onnx`), entrada float32 `(1, 3, 640, 640)`, salida float32 `(1, 300, 57)` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO26 en su variante `x` (extragrande) para la tarea de pose, entrenada por Ultralytics sobre COCO-Pose con 17 keypoints por persona en orden COCO-17 (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas, tobillos; izquierda antes que derecha). La innovación relevante de esta generación es la cabeza end-to-end: el modelo produce directamente hasta 300 detecciones finales, de modo que no es necesario aplicar NMS en post-procesado. Cada fila de la salida tiene el formato `[x1, y1, x2, y2, score, class_id, kx1, ky1, kc1, …, kx17, ky17, kc17]` en píxeles de la imagen de entrada.

La exportación se realizó con Ultralytics 8.4.47 y PyTorch 2.11.0 el 2026-05-06, con `imgsz=640`, `opset=17`, `simplify=False`, `dynamic=False` y `nms=False`. Al ser una exportación estática, las dimensiones de entrada y salida están fijas: no admite lotes variables ni resoluciones distintas de 640x640 sin reexportar. El repositorio no documenta el volumen de tokens ni la composición exacta del dataset de entrenamiento más allá de COCO-Pose, ni si hubo fases de ajuste adicionales; esos datos deben consultarse en la documentación de Ultralytics.

## Capacidades

- Detección de personas y estimación de pose en una sola etapa, con hasta 300 instancias por imagen.
- Predicción de 17 keypoints COCO por persona, cada uno con coordenadas y score de confianza (`kc`).
- Detección de una única clase: `person` (class_id 0).
- Salida end-to-end sin NMS: las detecciones ya vienen filtradas y ordenadas por score.
- Uso dual: modelo de pose directo y detector de personas (`yolo26x_person`) para pipelines de pose en dos etapas.
- Inferencia sobre imágenes RGB normalizadas a 0-1 y letterboxed a 640x640.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No soporta visión general (clasificación, detección de objetos genéricos, segmentación): está especializado en pose humana.

## Casos de uso

- Análisis deportivo y biomecánico: el modelo extrae las 17 articulaciones COCO por atleta en cada fotograma, lo que permite calcular ángulos articulares, simetrías y cinemática de movimiento en grabaciones de entrenamiento o competición.
- Monitorización de ergonomía en puestos de trabajo: con una cámara fija y el modelo a 640x640, se detectan posturas (flexión de tronco, elevación de hombros) y se generan alertas cuando se superan umbrales ergonómicos.
- Control de aforo y análisis de ocupación: al ser también un detector de personas con clase única, sirve para contar personas en una escena y, de paso, obtener su pose para análisis de comportamiento.
- Rehabilitación y fisioterapia asistida: la salida con score por keypoint permite validar la ejecución de ejercicios y comparar la pose del paciente con una referencia, sin necesidad de sensores vestibles.
- Preprocesado para modelos de acción o gesto: las coordenadas de keypoints se usan como entrada compacta (17x3 valores por persona) para clasificadores de secuencias temporales en reconocimiento de gestos o caídas.
- Animación y motion capture de bajo coste: a partir de vídeo monocular se obtienen esqueletos 2D que alimentan rigs de personajes en pipelines de animación o previsualización.
- Integración en aplicaciones de escritorio o móviles con ONNX Runtime: el tamaño de 0,2 GB y la ausencia de NMS permiten desplegar el modelo en entornos con recursos limitados y sin PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (AP de pose, AP de persona), latencia ni throughput para este artefacto ONNX concreto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de este tamaño en float32 ocupa del orden de 0,9 GB solo en pesos; con activaciones y buffers de ONNX Runtime, una GPU con 2-4 GB de VRAM debería ser suficiente, pero no hay medición publicada.
- GPU recomendadas: no documentadas. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores; en GPUs de datacenter (A100, H100) el cuello de botella sería el preprocesado, no el modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU con ONNX Runtime, a menor velocidad.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, DirectML; al ser ONNX estático sin NMS, no requiere el paquete `ultralytics` en producción.
- Latencia y throughput: no disponibles. Dependen del hardware, del runtime y del uso de optimizaciones (TensorRT, cuantización a FP16/INT8), que no están documentadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Keypoints | NMS | Licencia | Formato |
|---|---|---|---|---|---|---|
| qtpose/yolo26x-pose-onnx | no disponible | 640x640 fija | 17 (COCO) | No (end-to-end) | AGPL-3.0 | ONNX |
| Ultralytics yolo26x-pose.pt | no disponible | configurable | 17 (COCO) | No (end-to-end) | AGPL-3.0 | PyTorch |
| Ultralytics yolo11x-pose | no disponible | configurable | 17 (COCO) | Sí | AGPL-3.0 | PyTorch, ONNX |
| RTMPose (variantes) | no disponible en la informacion disponible | variable | 17 (COCO) | No aplica (top-down) | Apache-2.0 (segun variante) | ONNX, PyTorch |

La comparación cuantitativa de precisión y latencia no está disponible en la información proporcionada. La diferencia principal frente a YOLO11-pose es la cabeza end-to-end sin NMS; frente a RTMPose, el enfoque es single-stage (detecta y estima a la vez) en lugar de top-down en dos etapas.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial o despliegue en red exige cumplir la AGPL o adquirir la licencia enterprise de Ultralytics. Es una restricción relevante para productos propietarios.
- Modelo especializado en personas: no detecta otras clases de COCO ni realiza segmentación o clasificación general.
- Entrada estática: `dynamic=False` impide lotes variables y resoluciones distintas de 640x640 sin reexportar el modelo.
- Pose 2D únicamente: no hay estimación de profundidad ni pose 3D; las oclusiones severas y las poses muy alejadas del dominio de COCO-Pose degradan la precisión.
- Riesgo de falsos positivos y de keypoints con baja confianza en escenas con multitudes, motion blur o iluminación adversa; el score por keypoint (`kc`) debe usarse para filtrar.
- Sin datos publicados de sesgos demográficos, rendimiento por género, edad o tono de piel; conviene validar en el dominio concreto antes de producción.
- No hay información sobre cuantización ni sobre latencia medida, por lo que los requisitos de hardware deben validarse empíricamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qtpose/yolo26x-pose-onnx
- Organización qtpose: https://huggingface.co/qtpose
- Licencia de Ultralytics: https://www.ultralytics.com/license
- Documentación de Ultralytics: https://docs.ultralytics.com
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
