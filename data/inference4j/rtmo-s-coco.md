# inference4j/rtmo-s-coco

## Resumen

RTMO-S es un estimador de pose 2D multi-persona de una sola etapa desarrollado por OpenMMLab dentro del proyecto MMPose, publicado originalmente en el artículo *RTMO: Towards High-Performance One-Stage Real-Time Multi-Person Pose Estimation* (arXiv:2312.07526, 2023). Este repositorio concreto es un espejo ONNX exportado por inference4j para su uso desde Java mediante la librería de inferencia inference4j, con los pesos originales de MMPose sin modificar (salvo la fusión de bloques RepVGG del cuello y la precomputación de la rejilla de anclas que aplica `switch_to_deploy`).

El modelo resuelve el problema de detección de personas y estimación de sus 17 keypoints corporales COCO en una única pasada, sin pipeline de dos etapas (detector + estimador por persona). Con 9,9 millones de parámetros y una entrada fija de 640x640, está pensado para escenarios de tiempo real donde el coste por fotograma importa, como análisis de vídeo, seguimiento de personas o aplicaciones interactivas.

Es relevante ahora porque ofrece pesos Apache-2.0, exportación ONNX con NMS integrado en el grafo (opset 11) y una API Java directa, lo que simplifica el despliegue en entornos JVM sin depender de PyTorch en producción. La contrapartida es que se trata de un checkpoint entrenado solo con COCO, sin datos adicionales, y con la precisión asociada a la variante small de la familia RTMO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMO-S (CSPDarknet + encoder híbrido, clasificador de coordenadas dinámico) |
| Parametros totales | 9,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 640x640) |
| Tipos de cuantizacion | no disponible (el repo solo publica el grafo ONNX en float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11), entrada `[batch, 3, 640, 640]` float32 con batch dinámico |

## Arquitectura y entrenamiento

RTMO-S es un estimador de pose de una sola etapa. La columna vertebral es una CSPDarknet inicializada desde los pesos YOLOX-S entrenados en COCO por MMDetection (`yolox_s_8x8_300e_coco_20211121_095711-4592a793.pth`), seguida de un encoder híbrido y una cabeza con clasificador de coordenadas dinámico que predice directamente cajas de persona y los 17 keypoints COCO en una única pasada. La innovación principal del trabajo RTMO es precisamente esa formulación de una etapa con asignación dinámica, que evita el coste del pipeline detector-then-pose y mantiene un rendimiento competitivo en tiempo real.

El entrenamiento se realizó exclusivamente sobre COCO 2017 train person keypoints (8 GPUs, batch 32, 600 épocas, resolución 640x640, según la configuración `rtmo-s_8xb32-600e_coco-640x640.py`). No se reportan datos de RLHF, DPO ni ajuste adicional: es un modelo puramente supervisado de regresión de keypoints. En este espejo, los pesos se exportaron con MMDeploy 1.3.1 en un entorno fijado (PyTorch 2.1.2, MMPose 1.3.2, mmcv 2.1.0, mmengine 0.10.4) y el grafo incorpora el NMS (score > 0,1, IoU 0,65 agnóstico de clase, máximo 50 personas), además de una fila de padding con score 0 cuando se detectan menos de 50 personas.

## Capacidades

- Detección de múltiples personas y estimación de 17 keypoints corporales COCO en una sola pasada, con cajas y keypoints devueltos en la misma inferencia.
- Salida estructurada: `dets` con `[x1, y1, x2, y2, score]` por persona y `keypoints` con `[x, y, score]` por articulación, ordenados por score descendente.
- NMS integrado en el grafo ONNX, lo que elimina post-procesado adicional en el cliente.
- Preprocesado definido y reproducible: letterbox a la esquina superior izquierda con relleno 114, entrada BGR 0-255 sin media ni desviación estándar, NCHW float32.
- Batch dinámico en la dimensión de entrada, útil para procesar varios fotogramas o imágenes a la vez.
- Integración nativa con Java mediante inference4j (`RtmoPoseDetector.s().build()` y `detector.detect(Path)`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de keypoint detection.

## Casos de uso

- Análisis de vídeo en tiempo real: al ser un modelo de una sola etapa con 9,9 M de parámetros y entrada 640x640, puede procesar fotogramas de forma continua en un servidor modesto o en un dispositivo con GPU integrada, devolviendo todas las personas del fotograma en una sola pasada.
- Seguimiento de personas (tracking): las cajas y keypoints por fotograma sirven como observaciones para un tracker multi-objeto; el NMS integrado y el orden por score simplifican la asociación entre fotogramas.
- Análisis ergonómico o deportivo: los 17 keypoints COCO permiten calcular ángulos de articulaciones (codos, rodillas, caderas) para evaluar posturas en vídeos de ejercicio o entornos laborales.
- Aplicaciones interactivas en JVM: gracias a inference4j, un servicio Java existente puede incorporar estimación de pose sin añadir una dependencia de PyTorch en producción, usando el runtime ONNX.
- Procesamiento por lotes de imágenes: el batch dinámico permite enviar varias imágenes en una sola llamada para tareas de anotación asistida o auditoría de datasets.
- Control gestual básico: la posición de muñecas y codos (LEFT_WRIST, RIGHT_WRIST, LEFT_ELBOW, RIGHT_ELBOW) es suficiente para interfaces de gestos simples en aplicaciones de escritorio o kioscos.
- Moderación o análisis de contenido: detección de presencia y postura de personas en imágenes para clasificación preliminar antes de una revisión humana.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| COCO AP | 67,7 | val2017, 640x640, una pasada con letterbox centrado de MMPose, según los autores de RTMO |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, AP50, AP75, AR, latencia o throughput) para este checkpoint concreto. Tampoco se ofrecen comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9,9 M de parámetros en float32 (unos 40 MB de pesos) y una entrada de 640x640, el consumo es bajo, pero no se publica una cifra medida.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPUs de consumo, pero la model card no especifica modelos concretos ni requisitos mínimos.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, aunque no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (formato del repo), inference4j para Java; otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| RTMO-S (este repo) | 9,9 M | 640x640 | 67,7 | Apache-2.0 | ONNX |
| Otras variantes RTMO (M, L) | no disponible | no disponible | no disponible | Apache-2.0 | PyTorch / ONNX |
| YOLOX-S (backbone de origen) | no disponible | no disponible | no aplica (detección, no pose) | Apache-2.0 | PyTorch |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos de estimación de pose (por ejemplo, variantes de dos etapas de MMPose o estimadores de una etapa de otros proyectos) que permitan una comparación numérica fiable. Cualquier cifra adicional sería inventada.

## Limitaciones y advertencias

- Entrenado exclusivamente con COCO 2017: la generalización a dominios alejados de COCO (imágenes médicas, cámaras térmicas, escenas muy densas) no está garantizada.
- Solo 17 keypoints COCO: no cubre keypoints faciales finos, manos ni pies detallados.
- El modelo no procesa texto ni tiene capacidades lingüísticas; los campos de idioma no aplican.
- Riesgo de falsos positivos y negativos en escenas con oclusiones severas o personas muy pequeñas, inherente a los estimadores de una etapa con resolución fija de 640x640.
- El grafo añade una fila de padding con score 0 cuando hay menos de 50 personas; es obligatorio filtrar por score > 0,1 para no tratar esa fila como una detección real.
- Las coordenadas de salida están en píxeles de la entrada 640x640; hay que dividir por el factor `r` del letterbox y recortar las cajas a los límites de la imagen original.
- Licencia Apache-2.0 para código y pesos, pero las imágenes de COCO siguen bajo los términos de Flickr y las anotaciones bajo CC BY 4.0; conviene revisar las condiciones de uso de las imágenes si se redistribuyen.
- No se publican métricas de sesgo ni evaluaciones de equidad; el rendimiento puede variar según demografía, iluminación y tipo de cámara.
- El repositorio indica 0 descargas y 0 likes, y un tamaño de 0.0 GB: es un espejo reciente sin validación comunitaria conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inference4j/rtmo-s-coco
- Proyecto RTMO en MMPose: https://github.com/open-mmlab/mmpose/tree/main/projects/rtmo
- Repositorio MMPose: https://github.com/open-mmlab/mmpose
- Artículo RTMO (arXiv:2312.07526): https://arxiv.org/abs/2312.07526
- Pesos originales: https://download.openmmlab.com/mmpose/v1/projects/rtmo/rtmo-s_8xb32-600e_coco-640x640-8db55a59_20231211.pth
- Configuración de entrenamiento: https://github.com/open-mmlab/mmpose/blob/v1.3.2/configs/body_2d_keypoint/rtmo/coco/rtmo-s_8xb32-600e_coco-640x640.py
- Librería inference4j: https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
