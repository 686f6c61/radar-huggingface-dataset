# qtpose/yolo26l-pose-onnx

## Resumen

YOLO26l-pose (ONNX) es la exportación a formato ONNX del checkpoint `yolo26l-pose.pt` de Ultralytics, entrenado sobre el dataset COCO-Pose para detección de personas y estimación de 17 keypoints corporales en una sola etapa. El modelo lo publica el usuario `qtpose` como artefacto de inferencia listo para producción, sin necesidad de PyTorch ni de post-procesado NMS, ya que la cabeza de YOLO26 es end-to-end (`end2end=True`).

Se trata de un modelo de visión por computador, no de un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido habitual. Su relevancia radica en que empaqueta un detector de personas y un estimador de pose en un único grafo ONNX de 104 MB con entrada fija de 640x640 píxeles y salida de 300 detecciones con 57 valores por fila (caja, score, clase y 17 keypoints con sus confidencias).

El repositorio tiene un tamaño de 0,1 GB, no registra descargas ni likes en el momento de la consulta y se distribuye bajo licencia AGPL-3.0, la misma que los pesos originales de Ultralytics. Está pensado para integrarse en el ecosistema `qtpose`, donde actúa como modelo de persona + pose de una etapa y, bajo el alias `yolo26l_person`, como detector de personas para modelos de pose de dos etapas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector de una etapa con cabeza end-to-end (sin NMS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 1x3x640x640) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es float32) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26l_pose.onnx`, 104.154.654 bytes) |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26 en su variante `l` (large) para la tarea de pose, exportada con Ultralytics 8.4.47 y PyTorch 2.11.0 el 2026-05-06. El grafo ONNX se generó con `imgsz=640`, `opset=17`, `simplify=False`, `dynamic=False` y `nms=False`. La cabeza es end-to-end, de modo que el modelo devuelve directamente hasta 300 detecciones ya filtradas, sin necesidad de aplicar supresión de no máximos en el post-procesado.

El checkpoint de origen es `yolo26l-pose.pt`, entrenado sobre COCO-Pose con 17 keypoints en orden COCO (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos, izquierda antes que derecha). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de ajuste adicionales; esa información no está disponible en la documentación publicada. La innovación técnica destacable es la eliminación del NMS en la propia cabeza, lo que simplifica el despliegue y reduce la latencia de post-procesado.

## Capacidades

- Detección de personas en imágenes RGB con entrada letterboxed de 640x640 píxeles y normalización 0-1.
- Estimación de pose humana con 17 keypoints COCO, cada uno con coordenadas (x, y) y confianza asociada.
- Salida end-to-end: hasta 300 detecciones por imagen en un tensor `(1, 300, 57)`, sin NMS externo.
- Detección de una única clase: `person` (class_id 0).
- Uso como detector de personas para pipelines de pose de dos etapas (alias `yolo26l_person`).
- Integración directa en runtimes ONNX (ONNX Runtime, TensorRT, OpenVINO) sin dependencia de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Análisis de vídeo de vigilancia: el modelo detecta personas y extrae su esqueleto en cada fotograma con una sola pasada, lo que permite calcular posturas, caídas o aglomeraciones sin encadenar dos modelos.
- Monitorización deportiva y biomecánica: los 17 keypoints COCO permiten estimar ángulos articulares en tiempo real para análisis de técnica en running, levantamiento o ciclismo.
- Aplicaciones de fitness y realidad aumentada: al ser un ONNX de 104 MB con entrada fija, se puede desplegar en el navegador vía ONNX Runtime Web o en apps móviles para superponer esqueletos sobre la cámara.
- Control de aforo y análisis de ocupación: la detección de personas con score por caja facilita contar individuos en escenas y filtrar por umbral de confianza.
- Preprocesado para modelos de pose de dos etapas: usado como `yolo26l_person`, recorta las personas detectadas y las pasa a un estimador de keypoints más preciso (p. ej. top-down), reduciendo el coste computacional del segundo modelo.
- Robótica e interacción humano-máquina: la salida end-to-end sin NMS simplifica la integración en bucles de control de baja latencia donde el post-procesado debe ser mínimo.
- Etiquetado asistido de datasets: el modelo puede pre-anotar poses en imágenes nuevas para revisión humana, acelerando la creación de datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 1-2 GB, incluyendo pesos (104 MB) y activaciones a 640x640.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son válidas. El modelo es pequeño y no aprovecha GPUs de gran formato.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en iGPU con ONNX Runtime o OpenVINO.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, ONNX Runtime Web para navegador. Al ser un grafo estático con `dynamic=False`, conviene fijar el tamaño de entrada a 640x640.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Keypoints | Licencia | Formato |
|---|---|---|---|---|---|
| qtpose/yolo26l-pose-onnx | no disponible | 640x640 fija | 17 (COCO) | AGPL-3.0 | ONNX |
| Ultralytics yolo26l-pose.pt | no disponible | 640x640 | 17 (COCO) | AGPL-3.0 | PyTorch |
| Ultralytics yolo11l-pose | no disponible | 640x640 | 17 (COCO) | AGPL-3.0 | PyTorch / ONNX |
| MediaPipe Pose (BlazePose) | no disponible | variable | 33 | Apache 2.0 | TFLite / ONNX |

La comparativa se limita a la información disponible: no se han publicado métricas de precisión (AP, PCK) para este artefacto, por lo que no es posible comparar rendimiento numérico con las alternativas. La diferencia principal frente a MediaPipe es el número de keypoints (17 frente a 33) y la licencia (AGPL-3.0 frente a Apache 2.0).

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos o servicios en red exige cumplir con las obligaciones de la AGPL o adquirir la licencia enterprise de Ultralytics.
- Modelo de visión: no procesa texto, no tiene contexto lingüístico ni capacidades de razonamiento; no debe evaluarse como un LLM.
- Entrada estática: el grafo se exportó con `dynamic=False` a 640x640, por lo que no admite resoluciones variables sin reexportar.
- Una sola clase (`person`): no detecta otros objetos ni keypoints faciales o de manos.
- Sesgos del dataset COCO-Pose: el rendimiento puede degradarse en poses extremas, oclusiones severas, personas muy pequeñas o escenas con iluminación atípica.
- Riesgo de falsos positivos y de keypoints con baja confianza: conviene filtrar por umbral de score y por confianza por keypoint.
- Sin datos de benchmarks publicados: no hay evidencia numérica de precisión para este artefacto concreto.
- Repositorio sin descargas ni likes: no hay validación comunitaria que respalde la calidad del export.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qtpose/yolo26l-pose-onnx
- Organización qtpose: https://huggingface.co/qtpose
- Licencia Ultralytics: https://www.ultralytics.com/license
- Documentación Ultralytics: https://docs.ultralytics.com
- Script de conversión citado en la model card: `scripts/dev/convert_yolo26_to_onnx.py` (dentro del repositorio qtpose; no se proporciona URL directa)
