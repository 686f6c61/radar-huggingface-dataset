# ml-resources/sapiens2-pose-1b

## Resumen

Sapiens2-1B-Pose es un modelo de estimación de pose humana (keypoint detection) desarrollado por Meta, publicado originalmente como `facebook/sapiens2-pose-1b` y replicado en este repositorio `ml-resources/sapiens2-pose-1b` por un tercero. Se trata de un Vision Transformer de aproximadamente 1,5 mil millones de parámetros entrenado para predecir 308 keypoints por persona, incluyendo una malla facial de 274 puntos, además de keypoints de manos y pies. La tarea es de tipo top-down: requiere bounding boxes previas de un detector de personas (el equipo usa RTMDet) antes de estimar la pose.

El modelo se construye sobre el backbone preentrenado `facebook/sapiens2-pretrain-1b`, al que se le añade una cabeza de estimación de pose. El backbone tiene 1,462 B de parámetros, 40 capas, dimensión de embedding 1536 y 24 cabezas de atención, con un coste de 4,715 TFLOPs y una resolución de inferencia de 1024 × 768 píxeles con parches de 16 × 16. Forma parte de la familia Sapiens2, que abarca variantes de 0,4 B, 0,8 B, 1 B y 5 B.

Su relevancia actual radica en que lleva la estimación de pose densa a un nivel de detalle facial (274 keypoints) poco habitual en modelos de pose generalistas, lo que lo hace útil para investigación en visión centrada en el ser humano. La licencia Sapiens2 condiciona el uso comercial, por lo que conviene revisar sus términos antes de integrarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT backbone + cabeza de estimacion de pose (Vision Transformer) |
| Parametros totales | 1.519.780.164 (backbone: 1.462 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision con resolucion fija de entrada de 1024 x 768) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No aplica (modelo de vision; no procesa texto) |
| Licencia | Sapiens2 License (identificador `other`) |
| Formato de pesos | safetensors (`sapiens2_1b_pose.safetensors`) |

Datos adicionales del backbone: 4,715 TFLOPs, dimension de embedding 1536, 40 capas, 24 cabezas de atencion, patch de 16 x 16. Tamano del repositorio: 6,1 GB.

## Arquitectura y entrenamiento

La arquitectura combina un backbone Vision Transformer de tipo Sapiens2 (40 capas, embedding de 1536, 24 cabezas de atencion, parches de 16 x 16) con una cabeza especifica de estimacion de pose. El modelo opera en resolucion 1024 x 768 (alto x ancho) y sigue un esquema top-down: primero un detector de personas (RTMDet) genera las bounding boxes y despues el modelo predice los keypoints dentro de cada recorte. Las predicciones se expresan en el formato de keypoints de Sociopticon definido en `sapiens/pose/configs/_base_/keypoints308.py`, con 308 puntos por persona e incluyendo 274 keypoints faciales detallados, ademas de manos y pies.

El modelo se ha obtenido por fine-tuning del backbone preentrenado `facebook/sapiens2-pretrain-1b`, es decir, parte de un modelo de representacion visual preentrenado y se especializa en la tarea de pose. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (estas ultimas, por otra parte, no resultan habituales en tareas de vision). Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Estimacion de pose humana top-down con 308 keypoints por persona.
- Malla facial detallada de 274 keypoints, ademas de keypoints de manos y pies.
- Deteccion de keypoints en imagenes de resolucion 1024 x 768.
- Salida en el formato de keypoints de Sociopticon, lo que facilita la integracion con herramientas de la familia Sapiens2.
- Orientado a vision centrada en el ser humano (human-centric vision).
- No dispone de generacion de texto, tool calling, capacidades de agente ni razonamiento multi-paso: es exclusivamente un modelo de vision.
- No se documentan capacidades multilingues ni de audio.

## Casos de uso

- Analitica deportiva: estimacion de la pose de atletas cuadro a cuadro a partir de recortes generados por un detector, usando los 308 keypoints para reconstruir la biomecanica del movimiento en entrenamiento y competicion.
- Animacion y captura de movimiento: generacion de esqueletos y expresiones faciales para personajes digitales, aprovechando la malla facial de 274 puntos para el rigging de rostros.
- Analisis ergonomico en entornos laborales: evaluacion de posturas de trabajadores en imagenes de camaras fijas para detectar riesgos posturales, siempre que un detector previo aporte las bounding boxes.
- Realidad aumentada y filtros: seguimiento facial de alta densidad y de manos para aplicaciones de AR que requieran un anclaje preciso de elementos virtuales sobre el rostro.
- Investigacion en vision centrada en el ser humano: generacion de anotaciones densas de pose sobre conjuntos de imagenes para estudios academicos, dada la licencia orientada a investigacion.
- Analisis de interaccion social: extraccion de poses de multiples personas en una escena, con detalle facial y de manos, para estudiar gestos y comunicacion no verbal.
- Preprocesado para modelos de accion o emocion: uso de los keypoints como caracteristicas de entrada a clasificadores posteriores de actividad o estado afectivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (por ejemplo, AP de keypoints sobre COCO ni comparaciones con otros modelos), y los resultados de busqueda web recibidos no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada en inferencia: el repositorio pesa 6,1 GB y los pesos estan en safetensors (previsiblemente FP32, ya que 1,52 B de parametros a 4 bytes por parametro equivalen a unos 6,08 GB), por lo que se necesitan aproximadamente 6-7 GB de VRAM solo para los pesos.
- En FP16/BF16 la huella de pesos bajaria a unos 3 GB, aunque no se documenta oficialmente esta conversion.
- Sumando activaciones a resolucion 1024 x 768 y el detector RTMDet, un presupuesto realista de VRAM se situa en torno a 8-12 GB.
- GPU recomendadas: tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; para lotes grandes o entrenamiento, A100 o H100.
- Cabe en GPUs de consumo con al menos 12 GB de VRAM; con 8 GB puede requerir procesar recortes de uno en uno.
- Opciones de despliegue: el repositorio oficial Sapiens2 (`pip install -e .`) y su script `sapiens/pose/scripts/demo/keypoints308.sh`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de vision.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa dentro de la familia Sapiens2-Pose, con los datos aportados en la model card:

| Modelo | Parametros | FLOPs | Embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0.398 B | 1.260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0.818 B | 2.592 T | 1280 | 32 | 16 |
| **Sapiens2-1B** (este) | 1.462 B (backbone) | 4.715 T | 1536 | 40 | 24 |
| Sapiens2-1B-4K | 1.607 B | No disponible | 1536 | 40 | 24 |
| Sapiens2-5B | 5.071 B | 15.722 T | 2432 | 56 | 32 |

Todas las variantes comparten la misma tarea de estimacion de pose y la licencia Sapiens2, y estan disponibles en Hugging Face a traves de la coleccion oficial de Sapiens2. Los datos de rendimiento comparativo entre variantes (precision de keypoints, latencia) no estan disponibles en la informacion proporcionada. Como alternativas de otras familias (por ejemplo, ViTPose o RTMPose) no se dispone de datos verificables en el material recibido, por lo que no se incluye comparacion cuantitativa.

## Limitaciones y advertencias

- Es un modelo exclusivamente de vision: no genera texto ni admite tool calling ni razonamiento multi-paso.
- Requiere un detector de personas previo (top-down); su precision depende de la calidad de las bounding boxes de entrada.
- La resolucion de inferencia esta fijada en 1024 x 768; no se documenta soporte para otras resoluciones en esta variante.
- Riesgo de sesgos: al ser un modelo centrado en el ser humano, su rendimiento puede degradarse en funcion del tono de piel, la vestimenta, la oclusion o condiciones de iluminacion adversas; la model card no detalla analisis de sesgo.
- Riesgo de error en poses muy ocluidas, en multitudes densas o en rostros no frontales, especialmente por la densidad de la malla facial.
- La licencia Sapiens2 no es una licencia de codigo abierto estandar; el uso comercial esta sujeto a sus terminos, por lo que debe revisarse `LICENSE.md` antes de cualquier despliegue en produccion.
- Este repositorio es un espejo no oficial (`ml-resources/sapiens2-pose-1b`); para uso en produccion conviene referenciar el repositorio oficial de Meta.
- El campo de idiomas figura como no disponible en los metadatos, aunque al ser un modelo de vision el concepto de idioma no aplica.
- No se documentan procesos de cuantizacion ni optimizaciones de despliegue, lo que puede complicar la integracion en pipelines de baja latencia.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/ml-resources/sapiens2-pose-1b
- Repositorio oficial del modelo: https://huggingface.co/facebook/sapiens2-pose-1b
- Backbone preentrenado base: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Variante Sapiens2-1B-4K: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
- Variante Sapiens2-0.4B: https://huggingface.co/facebook/sapiens2-pose-0.4b
- Variante Sapiens2-0.8B: https://huggingface.co/facebook/sapiens2-pose-0.8b
- Variante Sapiens2-5B: https://huggingface.co/facebook/sapiens2-pose-5b
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Guia de estimacion de pose: https://github.com/facebookresearch/sapiens2/blob/main/docs/POSE.md
- Formato de keypoints 308: https://github.com/facebookresearch/sapiens2/blob/main/sapiens/pose/configs/_base_/keypoints308.py
- Detector RTMDet (MMDetection): https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet
