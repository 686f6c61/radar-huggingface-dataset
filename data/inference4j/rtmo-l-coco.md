# inference4j/rtmo-l-coco

## Resumen

RTMO-L (COCO, 640) en formato ONNX es la exportación del estimador de pose multi-persona en una sola etapa RTMO-L de MMPose (OpenMMLab), entrenado únicamente sobre COCO y empaquetado para su uso con inference4j, una biblioteca de inferencia para Java. El modelo resuelve la detección simultánea de cajas de persona y 17 keypoints corporales en una sola pasada, sin necesidad de un detector de personas separado, lo que simplifica pipelines de visión en tiempo real.

La arquitectura combina un backbone CSPDarknet (inicializado desde pesos YOLOX-L preentrenados en COCO) con un encoder híbrido y un clasificador de coordenadas dinámico, sumando 44,8 millones de parámetros. Alcanza un AP de 72,4 en COCO val2017 a resolución 640x640, un valor competitivo para un modelo de una etapa orientado a tiempo real.

Su relevancia actual radica en la disponibilidad de pesos Apache-2.0 en ONNX con NMS integrado en el grafo, lo que permite desplegarlo en entornos JVM, edge devices y runtimes ONNX Runtime sin dependencias de PyTorch. Es una opción práctica para análisis de vídeo, seguimiento de personas y aplicaciones de ergonomía o deporte donde se requiere baja latencia y licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMO-L: CSPDarknet + encoder híbrido con clasificador de coordenadas dinámico |
| Parametros totales | 44,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye ONNX float32) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades linguisticas) |
| Licencia | Apache-2.0 (código y pesos); datos COCO con anotaciones CC BY 4.0 e imágenes bajo términos de Flickr |
| Formato de pesos | ONNX (opset 11), input float32 `[batch, 3, 640, 640]` |

## Arquitectura y entrenamiento

RTMO es un estimador de pose multi-persona de una sola etapa. El backbone CSPDarknet se inicializa desde los pesos YOLOX-L entrenados en COCO (MMDetection), y sobre él se monta un encoder híbrido que combina convoluciones con atención para capturar contexto global. La cabeza emplea un clasificador de coordenadas dinámico que predice directamente cajas y keypoints, evitando el esquema de dos etapas (detector + top-down) habitual en pose estimation. La exportación aplica `switch_to_deploy` de MMPose, fusionando los bloques RepVGG del neck y precalculando la rejilla de anclas.

El entrenamiento se realizó exclusivamente sobre COCO 2017 train person keypoints (16 GPUs x batch 16, 600 épocas según la nomenclatura del checkpoint), con letterbox centrado a 640x640. El grafo ONNX incluye el NMS (score > 0,1, IoU agnóstico de clase 0,65, máximo 50 personas) y añade una fila de padding con score 0 cuando hay menos de 50 detecciones. La exportación se hizo con MMDeploy 1.3.1 en un entorno fijado (PyTorch 2.1.2, MMPose 1.3.2, mmcv 2.1.0, mmengine 0.10.4).

## Capacidades

- Detección de personas y estimación de 17 keypoints COCO (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos) en una sola pasada.
- Pose multi-persona sin detector previo: el grafo devuelve cajas y keypoints de hasta 50 personas por imagen.
- Preprocesado documentado y determinista: letterbox a esquina superior izquierda, entrada BGR 0-255 en NCHW float32, sin normalización media/std.
- Batch dinámico en el eje `batch` del tensor de entrada.
- NMS integrado en el grafo ONNX, lo que elimina postprocesado adicional en el cliente.
- Salidas estructuradas: `dets` `[batch, N, 5]` (x1, y1, x2, y2, score) y `keypoints` `[batch, N, 17, 3]` (x, y, score), ordenadas por score.
- Integración nativa con inference4j para Java mediante `RtmoPoseDetector`.

## Casos de uso

- Análisis de vídeo en tiempo real en JVM: el modelo se ejecuta sobre ONNX Runtime con NMS integrado, lo que permite procesar streams de cámara en aplicaciones Java de vigilancia o análisis de afluencia sin salir del ecosistema JVM.
- Seguimiento de personas y conteo: al devolver cajas y keypoints por persona en una sola pasada, se puede alimentar un tracker (por ejemplo, ByteTrack) para conteo de ocupación en retail o transporte.
- Ergonomía y prevención de riesgos laborales: los 17 keypoints permiten estimar ángulos articulares (codo, rodilla, hombro) en puestos de trabajo y detectar posturas de riesgo en tiempo real.
- Análisis deportivo: evaluación de técnica en deportes como running, ciclismo o halterofilia a partir de la cinemática de keypoints en secuencias de vídeo.
- Aplicaciones de fitness interactivo: retroalimentación postural en tiempo real en apps de escritorio o Android con backend Java, aprovechando la licencia Apache-2.0 para uso comercial.
- Interfaces gestuales y control por movimiento: los keypoints de muñeca y codo permiten construir gestos simples para control de aplicaciones o instalaciones interactivas.
- Moderación y análisis de contenido: detección de personas y poses en imágenes subidas por usuarios dentro de pipelines de moderación automatizada.

## Benchmarks y rendimiento

| Benchmark | RTMO-L (COCO, 640) |
|---|---|
| COCO AP (val2017, 640x640, letterbox centrado, pasada única) | 72,4 |

No se han publicado en la información disponible resultados adicionales desglosados (AP50, AP75, AP medium, AP large, latencia o FPS) ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 44,8 M de parámetros en float32 (unos 180 MB de pesos); con activaciones a 640x640 y batch 1 el consumo típico se sitúa en el rango de 1-2 GB de VRAM, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060/4060 o superiores para tiempo real; A100/H100 para despliegues de alto throughput con batch elevado.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: ONNX Runtime (runtime de referencia de la exportación), inference4j sobre JVM, y cualquier runtime compatible con ONNX opset 11 (por ejemplo, TensorRT previa conversión). No se distribuye GGUF ni versión para llama.cpp/Ollama (no aplica a un modelo de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| RTMO-L (COCO, 640) | 44,8 M | Una etapa, multi-persona | 72,4 | Apache-2.0 | ONNX |
| RTMPose (MMPose) | no disponible | Top-down (requiere detector) | no disponible | Apache-2.0 | ONNX/PyTorch |
| YOLO-Pose / YOLOv8-pose | no disponible | Una etapa, multi-persona | no disponible | AGPL-3.0 (Ultralytics) | ONNX/PyTorch |
| OpenPose | no disponible | Bottom-up | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de las filas distintas de RTMO-L no se han verificado en esta ficha.

## Limitaciones y advertencias

- Entrenado solo con COCO: la cobertura de poses inusuales, oclusiones severas, multitudes densas o dominios muy distintos (infrarrojo, imágenes médicas) puede degradarse.
- Límite de 50 personas por imagen impuesto por el NMS del grafo; en escenas más densas se descartan detecciones.
- La fila de padding con score 0 debe filtrarse explícitamente (score > 0,1); ignorarla introduce detecciones falsas en el postprocesado.
- Requiere replicar exactamente el preprocesado documentado (letterbox a esquina superior izquierda, BGR 0-255, sin normalización) y deshacer la escala dividiendo por `r`; cualquier desviación produce keypoints mal alineados.
- Riesgo de sesgo heredado de COCO: distribución desigual de géneros, edades, etnias y contextos; el rendimiento puede variar entre subgrupos.
- No es un modelo generativo: no hay riesgo de alucinación textual, pero sí de falsos positivos o keypoints con baja confianza en personas parcialmente visibles.
- Licencia Apache-2.0 permisiva para uso comercial, pero las imágenes de COCO mantienen los términos de Flickr; la licencia del modelo no cubre el uso de dichas imágenes.
- No se distribuyen pesos cuantizados (INT8/FP16) en el repo; la cuantización requeriría un paso adicional propio.
- Sin datos publicados de latencia o throughput; conviene medir en el hardware objetivo antes de dimensionar un despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inference4j/rtmo-l-coco
- Repositorio RTMO en MMPose: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmo
- Paper RTMO (arXiv:2312.07526): https://arxiv.org/abs/2312.07526
- Pesos originales (checkpoint .pth): https://download.openmmlab.com/mmpose/v1/projects/rtmo/rtmo-l_16xb16-600e_coco-640x640-516a421f_20231211.pth
- Configuración de entrenamiento: https://github.com/open-mmlab/mmpose/blob/v1.3.2/configs/body_2d_keypoint/rtmo/coco/rtmo-l_16xb16-600e_coco-640x640.py
- inference4j (biblioteca Java): https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
