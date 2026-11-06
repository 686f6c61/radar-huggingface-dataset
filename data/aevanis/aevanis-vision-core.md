# Aevanis/Aevanis-Vision-Core

## Resumen

Aevanis Vision Core (denominado internamente `Av-Vision-Core` en su model card) es un backbone visual de tipo foundation model desarrollado por Aevanis AI Lab, orientado a extraccion de caracteristicas de imagen y a inferencia en tiempo real sobre hardware de borde, con enfasis declarado en robotica. Se presenta como una arquitectura hibrida ConvNeXt-Transformer de 12 capas, 384 dimensiones de embedding y 6 cabezas de atencion, con un total de 24,35 millones de parametros, lo que lo situa en la gama de backbones ligeros comparables en orden de magnitud a ViT-S/16 o a variantes pequenas de ConvNeXt.

El modelo se publica bajo licencia Apache-2.0, con pesos en formato PyTorch (`pytorch_model.bin`, repositorio de 0,1 GB) y pipeline declarado `image-feature-extraction`. Su propuesta de valor se centra en el rendimiento declarado por el autor: entre 420 y 550 FPS en GPUs de servidor (Tesla T4 en fp16 y RTX 4090), 105 FPS en Jetson Orin Nano, 17 FPS en CPU de escritorio y 8 FPS en Raspberry Pi 5, con un lote de tamano 1.

Es relevante ahora porque cubre el nicho de backbones visuales de baja latencia para robotica y sistemas embebidos, un espacio donde los ViT de gran tamano resultan inviables por coste computacional. No obstante, la informacion publicada es muy limitada: no hay resultados de benchmarks estandar (ImageNet, COCO, ADE20K), no se detalla la composicion del dataset mas alla de cifras agregadas, y el repositorio no incluye aun descargas ni validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida ConvNeXt-Transformer (12 bloques transformer, 384 dim de embedding, 6 cabezas de atencion) |
| Parametros totales | 24,35 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa imagenes de 224x224; salida de 196 tokens espaciales) |
| Tipos de cuantizacion | No disponible (el autor menciona fp16 en T4; no se documentan GGUF, INT8 ni otras) |
| Idiomas soportados | No disponible (modelo visual, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

La arquitectura declarada es hibrida ConvNeXt-Transformer: bloques convolucionales de tipo ConvNeXt combinados con 12 bloques transformer de 384 dimensiones y 6 cabezas de atencion. La entrada del ejemplo de uso es un tensor de 1x3x224x224 y la salida son 196 tokens espaciales de 384 dimensiones, lo que corresponde a un patch de 16x16 sobre una imagen de 224x224 (14x14 = 196 tokens). El modelo expone una salida estructurada con la clave `spatial_tokens`.

El preentrenamiento se realizo durante 20 epocas sobre 166.440 fotogramas continuos extraidos de 67 secuencias de video dinamicas, con un total de 48,2 GB de metraje temporal. El autor indica entrenamiento con enmascaramiento de parches al 75% y una funcion de perdida basada en gradiente de bordes Sobel normalizado (Normalized Sobel Edge Gradient Loss), lo que sugiere un objetivo de reconstruccion/autorreconstruccion con sesgo hacia la preservacion de estructura de bordes. No se documentan fases de RLHF, DPO ni ajuste supervisado posterior, ni se especifica la procedencia, diversidad o licencia del corpus de video.

## Capacidades

- Extraccion de caracteristicas visuales densas: genera 196 tokens espaciales de 384 dimensiones por imagen de 224x224, adecuados como entrada a cabezas de deteccion, segmentacion o clasificacion.
- Agrupacion semantica zero-shot: el autor declara capacidad de "zero-shot semantic grouping" sobre el manifold espacial aprendido.
- Recuperacion densa de profundidad: se anuncia "dense depth recovery" como capacidad emergente del preentrenamiento, sin metricas publicadas que lo respalden.
- Grounding tactil y cinematico: orientado a robotica, con anclaje de representaciones visuales a senales de tacto y cinematica, segun el autor.
- Inferencia en tiempo real: disenado para regimenes de 400+ FPS en servidor y 100+ FPS en borde.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un backbone visual.
- Capacidades multilingues: no aplica.
- No dispone de modo thinking, vision-language, audio ni generacion.

## Casos de uso

- Robotica de borde con control reactivo: el modelo puede ejecutarse a 105 FPS en Jetson Orin Nano (9,5 ms de latencia), lo que permite cerrar bucles de percepcion-accion por debajo de 20 ms en plataformas embebidas de robotica movil.
- Extraccion de features para segmentacion semantica en produccion: los 196 tokens espaciales de 384 dimensiones sirven como entrada a cabezas ligeras de segmentacion o deteccion, reduciendo el coste frente a backbones ViT-B/L.
- Inspeccion visual industrial en linea: con 550 FPS en RTX 4090 (1,8 ms por imagen), es viable procesar multiples camaras a alta cadencia en una linea de fabricacion sin cuello de botella de inferencia.
- SLAM y odometria visual: la recuperacion densa de profundidad declarada y la preservacion de bordes (perdida Sobel) lo hacen candidato para estimacion de estructura en pipelines de navegacion, aunque requiere validacion propia.
- Clasificacion y recuperacion de imagenes a gran escala: al ser un extractor de features puro, puede alimentar indices vectoriales para busqueda visual o filtrado previo en pipelines de moderacion de contenido.
- Prototipado en Raspberry Pi 5: a 8 FPS (125 ms) permite demos y validaciones de concepto en hardware de bajo coste antes de migrar a Jetson o GPU.
- Investigacion en representaciones visuales auto-supervisadas: el esquema de enmascaramiento al 75% con perdida de bordes es reproducible y sirve como baseline para experimentos de pretraining eficiente.

## Benchmarks y rendimiento

El autor solo publica benchmarks de latencia y throughput, no de calidad de representacion (ImageNet top-1, COCO mAP, ADE20K mIoU, etc.).

| Hardware | Batch | Latencia (ms) | Throughput (FPS) |
|---|---|---|---|
| NVIDIA RTX 4090 | 1 | 1,8 | 550 |
| Tesla T4 (fp16) | 1 | 2,4 | 420 |
| Jetson Orin Nano | 1 | 9,5 | 105 |
| CPU de escritorio (i7) | 1 | 58,0 | 17 |
| Raspberry Pi 5 | 1 | 125,0 | 8 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros equivalentes visuales como ImageNet, COCO o ADE20K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 24,35 M de parametros, los pesos en fp32 ocupan aproximadamente 97 MB y en fp16 unos 49 MB; la VRAM total necesaria es inferior a 1 GB incluyendo activaciones para lote 1 a 224x224.
- GPU recomendadas: RTX 4090 (550 FPS declarados), Tesla T4 en fp16 (420 FPS declarados). Cualquier GPU con al menos 2 GB de VRAM es suficiente.
- GPU de consumo: cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660, etc.); el limite practico es el ancho de banda y la ocupacion, no la memoria.
- Despliegue: el autor solo documenta uso directo con PyTorch (`pytorch_model.bin` y una clase `AevanisVisionBackbone`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT, aunque por tamano es candidato trivial a exportacion ONNX/TensorRT.
- Latencia y throughput: segun la tabla del autor, de 1,8 ms (RTX 4090) a 125 ms (Raspberry Pi 5) por imagen en lote 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aevanis Vision Core | 24,35 M | 224x224, 196 tokens | 420-550 FPS en GPU servidor | Apache-2.0 | Hugging Face (0 descargas) |
| ViT-S/16 (referencia) | ~22 M | 224x224, 196 tokens | No disponible en esta ficha | Apache-2.0 (variantes) | Amplia, ampliamente validado |
| ConvNeXt-T (referencia) | ~28 M | 224x224 | No disponible en esta ficha | Apache-2.0 | Amplia, ampliamente validado |
| MobileViT-S (referencia) | ~5,6 M | 224x224 | No disponible en esta ficha | Apple Sample Code / MIT segun variante | Amplia |

La comparacion de rendimiento de calidad no es posible: Aevanis Vision Core no publica metricas de exactitud frente a ViT-S/16, ConvNeXt-T o MobileViT-S. La comparativa se limita a orden de magnitud de parametros y a la licencia permisiva, comun a las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad: no hay evidencia publicada de que las representaciones sean competitivas en ImageNet, COCO o ADE20K frente a backbones establecidos.
- Validacion externa nula: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay reportes independientes de uso.
- Dataset de entrenamiento opaco: 67 secuencias de video y 48,2 GB de metraje sin especificar procedencia, diversidad de dominios, balance demografico ni licencias del material original, lo que impide evaluar sesgos.
- Riesgo de sobreajuste al dominio de video: el preentrenamiento sobre video continuo puede degradar el rendimiento en imagenes estaticas o dominios alejados (medico, satelital, documentos).
- Capacidades declaradas sin metrica: "zero-shot semantic grouping" y "dense depth recovery" no vienen acompanadas de numeros; deben tratarse como afirmaciones del autor, no como hechos verificados.
- Ecosistema limitado: solo se distribuye `pytorch_model.bin` con una clase custom (`model.py` no incluido en el repo segun la informacion disponible); no hay safetensors, ONNX ni integracion con `transformers`.
- Sin soporte linguistico ni multimodal: no es un modelo de lenguaje ni vision-language; no puede usarse para tareas de texto, VQA o captioning.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el usuario asume toda la responsabilidad sobre el cumplimiento de las licencias del material de entrenamiento, no verificadas.
- Para produccion: exigiria una evaluacion propia contra un baseline (ViT-S/16 o ConvNeXt-T) en el dominio objetivo antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Aevanis/Aevanis-Vision-Core
- Repositorio del autor (Aevanis AI Lab): no disponible en la informacion proporcionada
- Paper o informe tecnico: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
