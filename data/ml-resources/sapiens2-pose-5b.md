# ml-resources/sapiens2-pose-5b

## Resumen

Sapiens2-5B-Pose es un modelo de vision por computador especializado en estimacion de pose humana, desarrollado por Meta y distribuido en este repositorio como espejo no oficial bajo el identificador `ml-resources/sapiens2-pose-5b`. El checkpoint original es `facebook/sapiens2-pose-5b`, afinado a partir del backbone preentrenado `facebook/sapiens2-pretrain-5b`. No es un modelo de lenguaje: su tarea es la deteccion de puntos clave (keypoint detection) sobre imagenes centradas en personas, con una salida de 308 keypoints que incluye 274 puntos faciales detallados, ademas de manos y pies.

Tecnicamente es un Vision Transformer (ViT) con 5.071 mil millones de parametros en el backbone (5.120.198.663 parametros totales en el fichero safetensors, incluyendo la cabeza de pose), dimension de embedding 2432, 56 capas y 32 cabezas de atencion. Opera a una resolucion de inferencia de 1024 x 768 (alto x ancho) con parches de 16 x 16 y consume 15.722 TFLOPs por pasada de backbone. La estimacion es "top-down", por lo que requiere bounding boxes previos de un detector de personas (el equipo usa RTMDet).

Su relevancia radica en la densidad de keypoints (308 frente a los 17-133 habituales en modelos de pose clasicos) y en la escala del backbone, que busca mayor precision en caras y extremidades para aplicaciones de captura de movimiento, analisis de comportamiento humano y vision centrada en personas. El modelo se publica bajo la licencia propietaria Sapiens2 License y se apoya en la libreria `sapiens2` del repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone + cabeza de estimacion de pose) |
| Parametros totales | 5.120.198.663 (5.12 B; backbone 5.071 B) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin interfaz de lenguaje) |
| Licencia | Sapiens2 License (license: other, license_name: sapiens2-license) |
| Formato de pesos | safetensors (`sapiens2_5b_pose.safetensors`) |
| Pipeline | keypoint-detection |
| Libreria | sapiens2 |
| Resolucion de inferencia | 1024 x 768 (alto x ancho) |
| Tamano de parche | 16 |
| Dimension de embedding | 2432 |
| Capas | 56 |
| Cabezas de atencion | 32 |
| FLOPs de backbone | 15.722 T |
| Keypoints | 308 (274 faciales, mas mano y pie), formato Sociopticon |
| Modelo base | facebook/sapiens2-pretrain-5b |
| Tamano del repositorio | 20,5 GB |

## Arquitectura y entrenamiento

La arquitectura combina un backbone ViT Sapiens2 de gran escala con una cabeza especifica de estimacion de pose. El backbone procesa la imagen a 1024 x 768 troceada en parches de 16 x 16, con 56 capas transformer, dimension de embedding 2432 y 32 cabezas de atencion, lo que da un coste de 15.722 TFLOPs por imagen. El modelo es "top-down": primero se detectan las personas con un detector externo y despues el ViT estima los 308 keypoints sobre cada recorte. Las predicciones siguen el formato de keypoints Sociopticon definido en la configuracion `keypoints308.py` del repositorio oficial.

El checkpoint deriva por fine-tuning del backbone preentrenado `facebook/sapiens2-pretrain-5b`, es decir, se parte de un modelo preentrenado sobre imagen humana y se especializa en la tarea de pose. En la informacion disponible no se detalla el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal; la innovacion principal es la escala del backbone y la densidad de keypoints frente a alternativas anteriores de la familia Sapiens.

## Capacidades

- Estimacion de pose humana con 308 keypoints en total, incluyendo 274 puntos faciales detallados.
- Deteccion de keypoints de manos y pies, ademas de la pose corporal.
- Inferencia top-down: trabaja sobre recortes de persona generados por un detector externo (RTMDet en la configuracion de referencia).
- Salida en formato de keypoints Sociopticon, compatible con el pipeline oficial del repositorio Sapiens2.
- Procesamiento de imagenes centradas en personas (human-centric imagery) a resolucion 1024 x 768.
- Ejecucion sobre PyTorch mediante la libreria `sapiens2` y scripts de demostracion oficiales.
- No dispone de generacion de texto, tool calling, capacidades de agente ni soporte multilingue, al no ser un modelo de lenguaje.
- No se documentan capacidades multimodales de audio, video en tiempo real ni vision general de escenas.

## Casos de uso

- Captura de movimiento y animacion: el modelo extrae 308 keypoints por persona, incluidos dedos y pies detallados, lo que permite reconstruir esqueletos para animacion 3D o retargeting de personajes a partir de video, con mayor fidelidad en manos que los esquemas de 17-33 keypoints.
- Analisis de expresion facial y emociones: los 274 keypoints faciales permiten medir deformaciones finas del rostro para estudios de comportamiento, interaccion persona-maquina o deteccion de fatiga y atencion.
- Analisis deportivo: sobre metraje de entrenamiento o competicion, el pipeline top-down con detector RTMDet localiza a cada atleta y estima su pose cuadro a cuadro para calcular angulos articulares, posturas de carrera o tecnicas de golpeo.
- Rehabilitacion y salud: seguimiento de ejercicios de fisioterapia comparando la pose estimada con una postura de referencia, aprovechando los keypoints de pies y manos para validar movimientos completos.
- Realidad aumentada y avatares: el modelo puede pilotar avatares o probadores virtuales al estimar la pose y las manos del usuario, si bien la latencia y el despliegue en tiempo real no estan documentados.
- Analisis de multitudes y seguridad: combinado con un detector de personas, permite contar y analizar posturas de muchas personas en una escena, util para estudios de flujo de personas o ergonomia en espacios publicos.
- Investigacion en vision centrada en personas: sirve como backbone o referencia para experimentos academicos que necesiten un etiquetado de pose muy denso, reutilizando el formato Sociopticon del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como AP de keypoints, PCK, OKS ni comparaciones cuantitativas con otros estimadores de pose. El paper referenciado (arXiv:2604.21681) no se proporciona con cifras en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada a partir del peso de los parametros: unos 20,5 GB en precision de 32 bits (coincide con el tamano del repositorio, 20,5 GB), aproximadamente 10,2 GB en fp16/bf16 y alrededor de 5,1 GB en int8. Estos valores cubren solo los pesos; la memoria de activaciones a 1024 x 768 no esta documentada.
- La estimacion de activaciones a resolucion 1024 x 768 con 56 capas puede ser significativa, por lo que los requisitos reales superaran el tamano de los pesos. No hay datos oficiales de memoria pico.
- GPU recomendadas: no disponibles de forma oficial. Por tamano, el modelo completo en fp16 requiere GPUs profesionales tipo A100 (40/80 GB) o H100; en consumer, una RTX 4090 con 24 GB de VRAM seria el minimo razonable si las activaciones caben, extremo no confirmado.
- Encaje en GPU de consumo: no confirmado. Las variantes menores de la familia (0.4B, 0.8B, 1B) serian mas adecuadas para GPUs de gama consumer.
- Opciones de despliegue: la libreria oficial `sapiens2` sobre PyTorch, con scripts de demostracion (`sapiens/pose/scripts/demo/keypoints308.sh`). No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Sapiens2-Pose, segun los datos de la model card:

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B (este) | 5,071 B (backbone) | 15,722 T | 2432 | 56 | 32 |

No se dispone en la informacion proporcionada de datos de rendimiento ni de comparaciones cuantitativas con modelos de pose de otros autores, por lo que no es posible establecer una comparativa de calidad frente a alternativas externas.

## Limitaciones y advertencias

- Es un modelo de vision, no de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Estimacion top-down: requiere obligatoriamente bounding boxes de un detector de personas externo; sin detector no funciona de forma autonoma.
- Sesgos conocidos: no documentados en la informacion disponible, pero al tratarse de un modelo centrado en el cuerpo humano puede heredar sesgos del dataset de entrenamiento (distribucion demografica, condiciones de iluminacion, oclusiones), que no se detallan.
- Riesgo de alucinacion de keypoints: no se documenta la fiabilidad ante oclusiones severas, poses extremas o personas parcialmente visibles; los estimadores de pose pueden producir keypoints plausibles pero incorrectos en esas condiciones.
- Limitaciones de contexto e idioma: no aplican en el sentido textual, pero la resolucion de entrada esta fijada en 1024 x 768 y no se documentan variantes de resolucion.
- Restricciones de licencia: se distribuye bajo la Sapiens2 License (license: other), disponible en https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md. Es una licencia propietaria de Meta, no una licencia de codigo abierto estandar; debe revisarse antes de cualquier uso comercial.
- Este repositorio es un espejo no oficial creado por el usuario `ml-resources`; no es una publicacion de Meta. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el 15 de octubre de 2026.
- No hay informacion sobre cuantizacion, latencia, throughput ni integracion en pipelines de produccion, lo que dificulta planificar un despliegue real.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-pose-5b
- Modelo original de Meta: https://huggingface.co/facebook/sapiens2-pose-5b
- Backbone preentrenado base: https://huggingface.co/facebook/sapiens2-pretrain-5b
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo oficial: https://github.com/facebookresearch/sapiens2
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Configuracion de keypoints (formato Sociopticon, 308 keypoints): https://github.com/facebookresearch/sapiens2/blob/main/sapiens/pose/configs/_base_/keypoints308.py
- Guia de estimacion de pose: https://github.com/facebookresearch/sapiens2/blob/main/docs/POSE.md
- Detector RTMDet (MMDetection): https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet
- Coleccion Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
