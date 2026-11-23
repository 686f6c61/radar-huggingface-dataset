# inference4j/rtmo-m-coco

## Resumen

RTMO-M (COCO, 640) es un estimador de pose multi-persona en 2D de una sola etapa, desarrollado originalmente por OpenMMLab dentro del proyecto MMPose y exportado a ONNX por inference4j para su uso con su librería de inferencia en Java. El modelo resuelve la detección simultánea de cajas de persona y 17 keypoints corporales del conjunto COCO en una única pasada de red, sin necesidad de una etapa separada de detección seguida de estimación por persona, lo que reduce la latencia en escenarios con múltiples individuos en escena.

La arquitectura combina un backbone CSPDarknet (inicializado desde pesos YOLOX-M preentrenados en COCO) con un encoder híbrido y un clasificador de coordenadas dinámico, sumando 22,6 millones de parámetros. Alcanza un COCO AP de 70,9 sobre val2017 con entrada de 640x640, un valor competitivo para un modelo de una etapa orientado a tiempo real.

Su relevancia actual radica en que ofrece pesos Apache-2.0 listos para producción en formato ONNX (opset 11), con NMS integrado en el grafo y salidas directamente utilizables, lo que simplifica el despliegue en entornos Java o en cualquier runtime compatible con ONNX Runtime sin dependencias de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMO-M: CSPDarknet + encoder híbrido + clasificador de coordenadas dinámico |
| Parametros totales | 22,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos float32 en ONNX) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11), float32 |
| Tarea | Estimación de pose 2D multi-persona, 17 keypoints COCO |
| Entrada | `input`: `[batch, 3, 640, 640]` float32, batch dinámico, BGR 0-255, NCHW |
| Salidas | `dets`: `[batch, N, 5]` (x1, y1, x2, y2, score); `keypoints`: `[batch, N, 17, 3]` (x, y, score) |
| Preprocesado | Letterbox a esquina superior izquierda, resize bilineal, padding de 114, sin mean/std |
| Postprocesado | NMS en el grafo (score > 0,1, IoU 0,65 class-agnostic, máximo 50 personas); dividir coordenadas por `r` y recortar cajas |
| Orden de keypoints | COCO-17 (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas, tobillos) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

RTMO (Real-Time Multi-person pose estimation with One-stage) es un estimador de una sola etapa que unifica detección de personas y regresión de keypoints en una única red. El backbone es un CSPDarknet inicializado desde los pesos de YOLOX-M entrenados en COCO (fichero `yolox_m_8x8_300e_coco_20230829.pth`), seguido de un encoder híbrido y un clasificador de coordenadas dinámico que predice los keypoints de forma condicionada a la instancia. La variante M corresponde a la configuración `rtmo-m_16xb16-600e_coco-640x640`, entrenada durante 600 épocas con batch 16 en 16 GPUs sobre COCO 2017 train person keypoints, a resolución 640x640.

La innovación principal frente a los enfoques top-down es la eliminación de la etapa de recorte por persona: una sola pasada devuelve todas las cajas y keypoints, con el NMS integrado en el grafo ONNX (score > 0,1, IoU 0,65 class-agnostic, hasta 50 personas). La exportación se realizó con MMDeploy 1.3.1 en un entorno fijado (PyTorch 2.1.2, MMPose 1.3.2, mmcv 2.1.0, mmengine 0.10.4), aplicando `switch_to_deploy` de MMPose para fusionar los bloques RepVGG del neck y precomputar la rejilla de anclajes. No se dispone de información sobre uso de RLHF/DPO, ya que es un modelo puramente de visión supervisado.

## Capacidades

- Estimación de pose 2D multi-persona en una sola pasada: devuelve cajas de persona y 17 keypoints COCO simultáneamente.
- Detección de personas integrada (no requiere un detector externo).
- NMS incluido en el grafo ONNX, con umbral de score 0,1 y IoU 0,65 class-agnostic.
- Soporte de batch dinámico en la entrada.
- Coordenadas de salida en píxeles de la imagen de entrada 640x640, ordenadas por score descendente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, visión general, audio ni modo thinking.
- Compatible con inferencia en Java mediante la librería inference4j (`RtmoPoseDetector.m()`).

## Casos de uso

- Análisis deportivo automatizado: el modelo permite extraer la posición de las 17 articulaciones de varios deportistas en un mismo fotograma, lo que habilita el cálculo de ángulos articulares y trayectorias para biomecánica o análisis de técnica en tiempo real.
- Vigilancia y seguridad en espacios públicos: al devolver cajas y keypoints de hasta 50 personas por pasada, se puede estimar la densidad de personas y detectar posturas anómalas (caídas, aglomeraciones) en flujos de vídeo sin un detector separado.
- Control de calidad en ergonomía laboral: integrado en un pipeline de vídeo, permite evaluar posturas de trabajadores (flexión de tronco, elevación de brazos) y generar alertas cuando se superan umbrales ergonómicos, usando los keypoints de hombros, codos y caderas.
- Interacción persona-ordenador y realidad aumentada: los keypoints de muñecas y codos permiten implementar gestos y seguimiento corporal en aplicaciones Java de escritorio o Android mediante inference4j y ONNX Runtime.
- Análisis de vídeo para retail: estimación de atención y orientación corporal de clientes (posición de nariz, hombros y caderas) para métricas de tráfico y comportamiento en tienda, con inferencia en una sola pasada por fotograma.
- Procesamiento por lotes de imágenes archivadas: el batch dinámico de la entrada permite procesar lotes de imágenes en un servidor con ONNX Runtime, útil para anotación automática de datasets o indexación de contenido visual.
- Monitorización de rehabilitación física: seguimiento de ejercicios mediante keypoints de tobillos, rodillas y caderas para verificar la ejecución correcta de movimientos en aplicaciones de fisioterapia remota.

## Benchmarks y rendimiento

| Benchmark | RTMO-M (COCO, 640) |
|---|---|
| COCO AP (val2017, 640x640, pasada única con letterbox centrado de MMPose) | 70,9 |

No se han publicado en la información disponible resultados adicionales de benchmarks (AP50, AP75, AR, latencia o throughput) ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,6 M de parámetros en float32, los pesos ocupan aproximadamente 90 MB, por lo que la VRAM necesaria es modesta (del orden de cientos de MB incluyendo activaciones a 640x640).
- GPU recomendadas: cualquier GPU moderna con soporte ONNX Runtime (RTX 3060 o superior, A100, H100); el modelo está diseñado para tiempo real, aunque no se especifican cifras de latencia.
- Cabe en GPU de consumo: sí, por el reducido tamaño de parámetros y el formato ONNX float32.
- Opciones de despliegue: ONNX Runtime (runtime de referencia de la exportación), inference4j para Java, MMDeploy; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| RTMO-M (COCO, 640) | 22,6 M | Una etapa, multi-persona | 70,9 | Apache-2.0 | ONNX |
| RTMO-S / RTMO-L (MMPose) | no disponible | Una etapa, multi-persona | no disponible | Apache-2.0 | PyTorch / ONNX |
| YOLOX-M (backbone de origen) | no disponible | Detección de objetos | no aplica (no estima pose) | Apache-2.0 | PyTorch / ONNX |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables (por ejemplo, variantes top-down de MMPose o estimadores de una etapa de otros frameworks), por lo que la comparativa cuantitativa queda limitada al dato de AP del propio modelo.

## Limitaciones y advertencias

- Entrenado exclusivamente en COCO 2017 train person keypoints: la generalización a dominios muy distintos (poses extremas, oclusiones severas, imágenes no fotorrealistas) puede degradarse.
- El NMS está fijado en el grafo con umbrales concretos (score > 0,1, IoU 0,65, máximo 50 personas); no es configurable sin reexportar el modelo.
- Cuando se detectan menos de 50 personas, el grafo añade una fila de padding con score 0; es imprescindible filtrar las filas con score > 0,1 para evitar resultados espurios.
- El preprocesado es específico (BGR 0-255, letterbox a esquina superior izquierda, padding 114, sin normalización); un preprocesado distinto degrada la precisión.
- Las coordenadas de salida están en píxeles de la entrada 640x640 y deben dividirse por el factor `r` y recortarse a los límites de la imagen original.
- Riesgo de sesgos heredados del dataset COCO (distribución demográfica y de escenas de las imágenes de Flickr).
- No se documentan limitaciones idiomáticas ni de contexto al no ser un modelo de lenguaje.
- Licencia Apache-2.0 para código y pesos, apta para uso comercial; las imágenes de COCO mantienen sus términos de Flickr y las anotaciones son CC BY 4.0.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de validación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inference4j/rtmo-m-coco
- Repositorio de inference4j: https://github.com/inference4j/inference4j
- Proyecto RTMO en MMPose: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmo
- Paper RTMO (arXiv:2312.07526): https://arxiv.org/abs/2312.07526
- Pesos originales: https://download.openmmlab.com/mmpose/v1/projects/rtmo/rtmo-m_16xb16-600e_coco-640x640-6f4e0306_20231211.pth
- Configuración de entrenamiento: https://github.com/open-mmlab/mmpose/blob/v1.3.2/configs/body_2d_keypoint/rtmo/coco/rtmo-m_16xb16-600e_coco-640x640.py
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
