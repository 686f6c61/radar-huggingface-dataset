# iat110/sapiens2-pose-1b

## Resumen

Sapiens2-1B-Pose es un modelo de estimación de pose humana (keypoint detection) desarrollado por Meta, publicado en el ecosistema Sapiens2. Se trata de un Vision Transformer de 1.462 mil millones de parámetros en el backbone, afinado desde el checkpoint preentrenado `facebook/sapiens2-pretrain-1b` para la tarea específica de detección de 308 keypoints, incluyendo 274 keypoints faciales detallados, además de manos y pies. El checkpoint completo ocupa 6,1 GB en formato safetensors y suma 1.519.780.164 parámetros totales.

El modelo resuelve el problema de la estimación de pose de alta densidad en imágenes centradas en personas, un caso de uso relevante en animación, análisis biomecánico, motion capture sin marcadores y creación de contenido digital. A diferencia de los detectores de pose convencionales de 17 o 133 keypoints, Sapiens2-1B-Pose ofrece una granularidad facial y manual que permite reconstruir expresiones y gestos finos, lo que lo sitúa en la categoría de modelos "human-centric" de propósito específico.

Es relevante ahora porque forma parte de la familia Sapiens2, que escala desde 0,4B hasta 5B parámetros con la misma receta de entrenamiento, lo que facilita la sustitución por variantes mayores o menores según los requisitos de latencia. El modelo es top-down: requiere bounding boxes de un detector de personas externo (el autor recomienda RTMDet) antes de predecir los keypoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone + cabeza de estimación de pose) |
| Parametros totales | 1.519.780.164 (1.462 B en backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Sapiens2 License (licencia propia de Meta, `license: other`) |
| Formato de pesos | safetensors (`sapiens2_1b_pose.safetensors`) |
| Dimension de embedding | 1536 |
| Capas | 40 |
| Cabezas de atención | 24 |
| Resolución de inferencia | 1024 × 768 (alto × ancho) |
| Tamano de parche | 16 |
| FLOPs del backbone | 4.715 T |
| Keypoints | 308 (274 faciales, más mano y pie) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer con backbone Sapiens2 de 40 capas, dimensión de embedding 1536 y 24 cabezas de atención, con parches de 16×16 píxeles sobre una resolución de inferencia de 1024×768. Sobre el backbone se monta una cabeza específica de estimación de pose que produce 308 keypoints en el formato Sociopticon definido por Meta. El modelo es de tipo top-down: primero se detectan las personas con un detector externo (RTMDet en la configuración de referencia) y después el ViT procesa cada recorte para predecir los keypoints.

El checkpoint se obtiene por fine-tuning desde `facebook/sapiens2-pretrain-1b`, el backbone preentrenado de la familia Sapiens2. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en un modelo de visión de este tipo). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal; la información disponible se limita a la arquitectura y a los parámetros del backbone.

## Capacidades

- Estimación de pose humana con 308 keypoints, incluyendo 274 keypoints faciales detallados, además de keypoints de mano y pie.
- Detección de keypoints de alta densidad sobre imágenes centradas en personas, en resolución 1024×768.
- Funcionamiento en modo top-down: integración con detectores de personas externos (RTMDet recomendado) para producir bounding boxes.
- Salida en el formato Sociopticon keypoint format, compatible con el ecosistema Sapiens2.
- Procesamiento de imágenes individuales; no es un modelo de vídeo nativo ni de texto.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la visión.

## Casos de uso

- Motion capture sin marcadores: el modelo predice 308 keypoints por fotograma sobre recortes de personas detectadas con RTMDet, lo que permite reconstruir el esqueleto completo y los gestos faciales para animación o análisis de movimiento.
- Animación facial y de manos: los 274 keypoints faciales y los keypoints de mano permiten capturar expresiones y gestos finos para rigging de personajes en pipelines de producción 3D.
- Análisis biomecánico y deportivo: la densidad de keypoints en pies y manos facilita el estudio de la postura y el apoyo en vídeo de entrenamiento, procesando cada fotograma con detección previa de personas.
- Creación de contenido y avatares: la salida en formato Sociopticon se integra en herramientas de retargeting para avatares digitales y experiencias de realidad aumentada.
- Investigación en visión centrada en personas: el checkpoint sirve como base para experimentos de pose, segmentación o reconocimiento de acciones, y puede sustituirse por variantes 0.4B, 0.8B o 5B según el presupuesto de cómputo.
- Preprocesado para datasets de pose: generación automática de anotaciones de keypoints de alta densidad sobre grandes colecciones de imágenes para entrenar modelos posteriores.
- Control de calidad en entornos de captura: verificación de la pose y la expresión facial en estudios de captura de movimiento o en sistemas de análisis de gestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como AP, PCK o MPJPE, ni comparaciones numéricas con otros modelos de pose.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.519.780.164 parámetros en safetensors y un repo de 6,1 GB, la inferencia en fp32 requiere del orden de 6 GB solo para pesos, más activaciones a resolución 1024×768, por lo que se recomienda al menos 16-24 GB de VRAM para trabajar con comodidad (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por el tamaño y los 4.715 T FLOPs del backbone, se sitúan en el rango de A100, H100 o RTX 4090 para inferencia fluida.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o más (RTX 4090, RTX 4080, A6000), aunque no confirmado en la documentación.
- Opciones de despliegue: el modelo se ejecuta mediante el repositorio oficial Sapiens2 (`pip install -e .`) y el script `sapiens/pose/scripts/demo/keypoints308.sh`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas | Keypoints | Licencia |
|---|---|---|---|---|---|---|---|
| Sapiens2-0.4B-Pose | 0.398 B | 1.260 T | 1024 | 24 | 16 | 308 | Sapiens2 License |
| Sapiens2-0.8B-Pose | 0.818 B | 2.592 T | 1280 | 32 | 16 | 308 | Sapiens2 License |
| Sapiens2-1B-Pose (este) | 1.462 B | 4.715 T | 1536 | 40 | 24 | 308 | Sapiens2 License |
| Sapiens2-5B-Pose | 5.071 B | 15.722 T | 2432 | 56 | 32 | 308 | Sapiens2 License |

La comparativa se limita a la propia familia Sapiens2, ya que la información proporcionada no incluye datos de rendimiento frente a alternativas externas como RTMPose, ViTPose o Detectron2. La variante 1B-4K de la familia (1.607 B parámetros) está orientada a resolución 4K y no a pose.

## Limitaciones y advertencias

- Modelo top-down: depende de un detector de personas externo (RTMDet) para generar las bounding boxes; errores del detector degradan directamente la calidad de los keypoints.
- No es un modelo de lenguaje: carece de capacidades de texto, tool calling, agentes o multilingüismo, por lo que no debe evaluarse con métricas de LLM.
- Licencia Sapiens2 License: es una licencia propia de Meta con posibles restricciones para uso comercial; debe revisarse el texto completo antes de desplegarlo en producción.
- La model card no documenta sesgos, tasas de alucinación (no aplicable), limitaciones de contexto ni caveats de producción, por lo que no hay información oficial sobre robustez en dominios fuera de las imágenes centradas en personas.
- No se han publicado benchmarks ni métricas de precisión en la información disponible, lo que impide validar su rendimiento frente a alternativas.
- El checkpoint tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y es un repositorio de un tercero (`iat110`) que replica el modelo de Meta; conviene verificar la procedencia frente al repositorio oficial `facebook/sapiens2-pose-1b`.
- El uso previsto se limita a investigación en visión centrada en personas y estimación de pose; no se documentan garantías para otros dominios.

## Enlaces

- Hugging Face: https://huggingface.co/iat110/sapiens2-pose-1b
- Modelo base: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Repositorio oficial de pose 1B: https://huggingface.co/facebook/sapiens2-pose-1b
- Paper: https://arxiv.org/pdf/2604.21681
- Project page: https://rawalkhirodkar.github.io/sapiens2
- Código: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Guía de pose: https://github.com/facebookresearch/sapiens2/blob/main/docs/POSE.md
- Formato de keypoints: https://github.com/facebookresearch/sapiens2/blob/main/sapiens/pose/configs/_base_/keypoints308.py
- Detector RTMDet: https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet
- Colección Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-pose-0.4b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-pose-0.8b
- Variante 1B-4K: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
- Variante 5B: https://huggingface.co/facebook/sapiens2-pose-5b
