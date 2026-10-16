# ml-resources/sapiens2-pose-0.8b

## Resumen

Sapiens2-0.8B-Pose es un modelo de vision por computador especializado en estimacion de pose humana, desarrollado por Meta y liberado originalmente en el repositorio `facebook/sapiens2-pose-0.8b`. La ficha que se documenta aqui corresponde a un espejo publicado por el usuario `ml-resources`, que replica el checkpoint sin modificarlo y mantiene la licencia original. El modelo resuelve una tarea concreta: la deteccion top-down de 308 puntos clave sobre el cuerpo humano, con un nivel de detalle que incluye 274 keypoints faciales, ademas de manos y pies.

Tecnicamente es un Vision Transformer de 848.704.840 parametros totales (0.818 B en el backbone, segun la model card), con 32 capas, dimension de embedding 1280, 16 cabezas de atencion y patch size de 16, que opera a una resolucion de inferencia de 1024 x 768 (alto x ancho). El coste computacional declarado es de 2,592 TFLOPs por imagen en el backbone. Se trata de un fine-tuning del backbone preentrenado `facebook/sapiens2-pretrain-0.8b` sobre la cabeza de estimacion de pose, y forma parte de una familia escalonada que va de 0,4 B a 5 B de parametros.

Su relevancia actual esta en el nicho de la vision centrada en el ser humano: frente a los modelos de pose clasicos, que suelen predecir entre 17 y 133 keypoints, Sapiens2-0.8B-Pose ofrece un esquema de 308 puntos muy denso en la cara, lo que habilita captura de movimiento facial fina, analitica de expresiones y pipelines de animacion que antes requeria modelos separados de cara, mano y cuerpo. Al ser un checkpoint pequeno dentro de su familia, es el punto de entrada razonable para experimentar sin recurrir a las variantes de 1 B o 5 B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (backbone Sapiens2 ViT + cabeza de estimacion de pose) |
| Parametros totales | 848.704.840 (segun safetensors); 0,818 B en el backbone segun la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de inferencia 1024 x 768 |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint en safetensors) |
| Idiomas soportados | no disponible / no aplica (modelo de vision, sin entrada de texto) |
| Licencia | Sapiens2 License (etiquetada como `other`, no es una licencia estandar OSI) |
| Formato de pesos | safetensors (`sapiens2_0.8b_pose.safetensors`) |
| Dimension de embedding | 1280 |
| Capas | 32 |
| Cabezas de atencion | 16 |
| Patch size | 16 |
| FLOPs del backbone | 2,592 T por imagen |
| Pipeline (HuggingFace) | keypoint-detection |
| Biblioteca | sapiens2 |
| Tamano del repositorio | 3,4 GB |
| Modelo base | facebook/sapiens2-pretrain-0.8b |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer con patch size de 16 que procesa imagenes de 1024 x 768 y produce representaciones de dimension 1280 a lo largo de 32 bloques con atencion multi-cabeza de 16 cabezas. Sobre ese backbone se anade una cabeza de estimacion de pose que predice 308 keypoints en formato Sociopticon, el esquema de keypoints definido en la configuracion `keypoints308.py` del repositorio oficial. El diseno es top-down: el modelo no localiza personas por si mismo, sino que requiere bounding boxes previas generadas por un detector externo; la model card indica que Meta utiliza RTMDet para esa etapa.

El checkpoint es un fine-tuning supervisado del backbone preentrenado `facebook/sapiens2-pretrain-0.8b` sobre la tarea de pose. No se dispone, en la informacion proporcionada, del numero de tokens de imagen, la composicion del dataset de fine-tuning, ni de si se aplicaron tecnicas de alineacion como RLHF o DPO (habitualmente no aplicables a tareas densas de vision). Tampoco se documentan innovaciones especificas como decodificacion especulativa o atencion lineal en este checkpoint concreto. La innovacion principal del modelo es la densidad del etiquetado: 274 de los 308 keypoints corresponden a la cara, lo que desplaza el esfuerzo del modelo hacia el detalle facial fino, complementado con puntos de mano y pie.

## Capacidades

- Estimacion de pose humana top-down con 308 keypoints por persona, en formato Sociopticon.
- Detalle facial denso: 274 keypoints dedicados a la cara, aptos para captura facial de alta granularidad.
- Keypoints de manos y pies dentro del mismo esquema de 308 puntos.
- Procesamiento de imagenes en color a resolucion de 1024 x 768 como entrada de inferencia.
- Integracion con detectores de persona externos: el pipeline requiere bounding boxes, y la model card referencia RTMDet como detector empleado por los autores.
- Inferencia sobre una sola imagen o lotes, segun los scripts de demostracion del repositorio oficial (`sapiens/pose/scripts/demo/keypoints308.sh`).
- No soporta tool calling, function calling, razonamiento multi-paso ni generacion de texto: es un modelo puramente visual.
- No dispone de capacidades multilingues ni de procesamiento de audio; no hay modo "thinking" ni variantes multimodales documentadas en esta ficha.

## Casos de uso

- Captura de movimiento facial para animacion 3D: los 274 keypoints faciales permiten reconstruir expresiones con gran detalle a partir de video o secuencias de imagenes, alimentando rigs de blendshapes en produccion de animacion o videojuegos.
- Analitica de expresiones en investigacion psicologica: el modelo puede extraer microexpresiones y movimientos faciales finos en estudios de conducta, siempre que se disponga de bounding boxes de los sujetos mediante un detector previo.
- Analitica deportiva: estimacion de la postura corporal, posicion de manos y pies en fotogramas de alta resolucion para evaluar tecnica de movimiento en disciplinas como atletismo, escalada o artes marciales.
- Motion capture de bajo coste: sustitucion de trajes de captura por pipelines de vision que combinan RTMDet para deteccion de personas y Sapiens2-0.8B-Pose para el esqueleto denso, con resolucion 1024 x 768 suficiente para planos medios.
- Interaccion persona-maquina y realidad aumentada: seguimiento de manos y cara para control gestual o efectos en tiempo real, asumiendo que el rendimiento en GPU permita la tasa de fotogramas necesaria (dato de latencia no disponible).
- Generacion de datasets anotados: uso del modelo para preanotar corpus de imagenes humanas con 308 keypoints y revisarlos posteriormente de forma manual, reduciendo el coste de etiquetado en proyectos de vision.
- Ergonomia y analisis postural en entornos laborales: deteccion de posturas de riesgo a partir de camaras fijas, con la ventaja del detalle en manos y pies para evaluar agarres y apoyos.
- Investigacion en vision centrada en el ser humano: el checkpoint sirve como linea base reproducible para trabajos academicos que comparen arquitecturas ViT en tareas densas de keypoint detection.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye metricas de precision (por ejemplo AP sobre COCO-WholeBody u otros conjuntos), y los resultados de la busqueda web no aportan datos utilizables sobre este modelo.

## Requisitos de hardware

- Parametros del modelo: 848,7 M. En precision FP32 los pesos ocupan aproximadamente 3,4 GB; en FP16/BF16, alrededor de 1,7 GB.
- Coste por imagen: 2,592 TFLOPs en el backbone a 1024 x 768, mas el coste adicional del detector de personas (RTMDet) en el pipeline top-down.
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, una inferencia a batch 1 en FP16 con activaciones para 1024 x 768 y 32 capas suele requerir del orden de 6 a 12 GB, cifra que debe validarse en el entorno real. A esto hay que sumar la memoria del detector de bounding boxes.
- GPU recomendadas: no hay lista oficial. Por tamano, el modelo cabe con holgura en GPU de 24 GB o mas (RTX 3090, RTX 4090, A10G, L4, A100, H100). En GPU de 12 GB (RTX 3060, RTX 4070) es probable que funcione a batch 1, pero es un dato no confirmado por la documentacion.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 12 GB o mas de VRAM, en funcion de la resolucion y del detector asociado. No confirmado oficialmente.
- Opciones de despliegue: el repositorio oficial de Sapiens2 proporciona scripts de demostracion en PyTorch (`pip install -e .` sobre el repo y ejecucion de `sapiens/pose/scripts/demo/keypoints308.sh`). No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni exportaciones a ONNX o TensorRT para este checkpoint.
- Latencia y throughput: no disponibles. No se publican mediciones de fotogramas por segundo ni de tiempo de inferencia por imagen.

## Comparativa con modelos similares

Dentro de la propia familia Sapiens2-Pose, las variantes se diferencian por tamano y coste computacional:

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B (este) | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

Todas las variantes comparten tarea, esquema de 308 keypoints y licencia Sapiens2. La eleccion entre ellas es un compromiso entre precision esperada y coste de inferencia: la variante de 0,8 B consume aproximadamente el doble de FLOPs que la de 0,4 B y alrededor de la mitad que la de 1 B.

Comparativa con alternativas externas de la misma categoria (por ejemplo MMPose con RTMPose, o MediaPipe BlazePose): no disponible en la informacion proporcionada, ya que no se han facilitado parametros, contexto ni resultados de benchmarks de esos sistemas en este contexto.

## Limitaciones y advertencias

- El modelo es top-down: sin un detector de personas que aporte bounding boxes, no puede procesar imagenes de forma autonoma. La calidad del detector condiciona directamente la calidad de la pose estimada.
- Es un modelo exclusivamente de vision. No genera texto, no acepta instrucciones en lenguaje natural y no soporta tool calling ni razonamiento multi-paso.
- No se han publicado metricas de precision en la informacion disponible, por lo que no es posible cuantificar su exactitud frente a alternativas.
- Riesgo de sesgos: los modelos de pose humana heredan los sesgos de los datasets de entrenamiento en cuanto a tono de piel, constitucion corporal, genero, edad, vestimenta y condiciones de iluminacion. No se documenta ninguna mitigacion en la model card.
- Riesgo de fallo en escenarios de oclusion, multitud, planos muy abiertos o resoluciones alejadas de los 1024 x 768 de entrenamiento.
- La licencia es la Sapiens2 License, etiquetada como `other` y no como una licencia estandar OSI. No se detallan en la informacion proporcionada las condiciones concretas de uso comercial, por lo que es imprescindible revisar el texto completo enlazado antes de cualquier despliegue en produccion o uso empresarial.
- Este repositorio concreto es un espejo no oficial publicado por `ml-resources`, con 0 descargas y 0 likes en el momento de la consulta. Para produccion conviene referenciar el repositorio original de Meta y verificar la integridad de los pesos.
- El modelo esta pensado para imagenes centradas en el ser humano y para investigacion; no se documenta su comportamiento en dominios alejados de esa distribucion.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/ml-resources/sapiens2-pose-0.8b
- Repositorio original del checkpoint: https://huggingface.co/facebook/sapiens2-pose-0.8b
- Backbone preentrenado base: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Variante Sapiens2-0.4B: https://huggingface.co/facebook/sapiens2-pose-0.4b
- Variante Sapiens2-1B: https://huggingface.co/facebook/sapiens2-pose-1b
- Variante Sapiens2-5B: https://huggingface.co/facebook/sapiens2-pose-5b
- Coleccion Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Guia de estimacion de pose: https://github.com/facebookresearch/sapiens2/blob/main/docs/POSE.md
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Configuracion del formato de 308 keypoints: https://github.com/facebookresearch/sapiens2/blob/main/sapiens/pose/configs/_base_/keypoints308.py
- Detector RTMDet (MMDetection): https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet
