# ml-resources/sapiens2-pretrain-0.4b

## Resumen

Sapiens2-0.4B es el backbone preentrenado de 395 millones de parametros de la familia Sapiens2, un conjunto de vision transformers de alta resolucion desarrollados por Meta para tareas centradas en el cuerpo humano. No es un modelo de lenguaje ni un modelo generativo: es un extractor de caracteristicas densas que produce un vector por parche de imagen, pensado para servir como inicializacion de cabezas de tarea (pose, segmentacion de partes del cuerpo, normales de superficie y pointmaps) mediante fine-tuning.

El modelo se ha preentrenado sobre 1.000 millones de imagenes de personas, una escala muy superior a la de los backbones de vision genericos, lo que desplaza el preentrenamiento de la representacion visual hacia el dominio humano. La arquitectura es un ViT de 24 capas, dimension de embedding 1024, 16 cabezas de atencion, parches de 16x16 y resolucion de preentrenamiento de 1024x768 (H x W), con RoPE, GQA, SwiGLU, RMSNorm y QK-norm. El coste declarado es de 1,260 TFLOPs por inferencia.

Este repositorio es un espejo no oficial del checkpoint `facebook/sapiens2-pretrain-0.4b`, publicado bajo la misma licencia Sapiens2. Su relevancia actual es doble: por un lado, ofrece un backbone de 0,4B que cabe en GPU de consumo para investigacion en vision centrada en humanos; por otro, forma parte de una familia escalonada (0,1B, 0,4B, 0,8B, 1B, 1B-4K y 5B) que permite escoger el punto de la curva coste/precision en funcion del presupuesto de computo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT) con RoPE, GQA, SwiGLU, RMSNorm y QK-norm |
| Parametros totales | 395.450.384 (0,398 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de texto; la secuencia de tokens de imagen es de 3.072 tokens para una entrada de 1024 x 768 con parches de 16 x 16 |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se documentan recetas de cuantizacion) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje natural) |
| Licencia | Sapiens2 License (identificador `sapiens2-license`, campo `license: other`) |
| Formato de pesos | safetensors (`sapiens2_0.4b_pretrain.safetensors`) |
| Dimension de embedding | 1024 |
| Numero de capas | 24 |
| Cabezas de atencion | 16 |
| Tamano de parche | 16 x 16 |
| Resolucion de preentrenamiento | 1024 x 768 (H x W) |
| FLOPs por inferencia | 1,260 T |
| Tarea (pipeline) | image-feature-extraction (preentrenamiento de backbone) |
| Tamano del repositorio | 1,6 GB |
| Desarrollador | Meta (repositorio espejo de `ml-resources`) |
| Fecha de creacion del repositorio | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

Sapiens2-0.4B es un transformer de vision puro, sin componentes convolucionales ni modulos de estado recurrente. La model card especifica las siguientes decisiones de diseno: atencion con RoPE (Rotary Position Embeddings) para codificar posicion, GQA (Grouped Query Attention), que reduce el coste de memoria de la cache de claves y valores agrupando cabezas, SwiGLU como activacion en el bloque MLP, RMSNorm en lugar de LayerNorm y QK-norm para estabilizar la atencion. La entrada se divide en parches de 16 x 16, de modo que una imagen de 1024 x 768 produce 3.072 tokens visuales; la salida es un tensor denso de forma (B, num_tokens, embed_dim) con dimensionalidad 1024.

El preentrenamiento se realizo sobre 1.000 millones de imagenes de personas, una composicion de dataset orientada exclusivamente al dominio humano que diferencia a Sapiens2 de los backbones genericos entrenados sobre corpus web masivos. La model card no especifica el numero de tokens de imagen vistos, el esquema de aumentacion, la funcion de perdida auto-supervisada concreta, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO (ninguno de estos ultimos aplica a un backbone de vision). Tampoco se documentan tecnicas de decodificacion especulativa ni mecanismos de atencion lineal.

Dentro de la familia, el escalado es consistente: 0,1B (768 de embedding, 12 capas, 12 cabezas, 0,342 TFLOPs), 0,4B (1024, 24, 16, 1,260 T), 0,8B (1280, 32, 16, 2,592 T), 1B (1536, 40, 24, 4,715 T), 1B-4K (1536, 40, 24) y 5B (2432, 56, 32, 15,722 T). La variante 0.4B se situa en el segundo escalon de la gama.

## Capacidades

- Extraccion de caracteristicas visuales densas: devuelve un embedding por parche de imagen, adecuado para alimentar cabezas de tarea ligeras.
- Inicializacion para fine-tuning en tareas centradas en humanos: estimacion de pose, segmentacion de partes del cuerpo, prediccion de normales de superficie y estimacion de pointmaps, segun la lista de usos previstos de la model card.
- Procesamiento de alta resolucion: preentrenado a 1024 x 768, lo que permite preservar detalle fino en cuerpos y extremidades, un requisito habitual en pose y segmentacion de partes.
- El repositorio oficial de Meta publica checkpoints derivados para las tareas downstream (pose, segmentation, normals, pointmaps) dentro de la coleccion Sapiens2.
- Sin soporte de tool calling ni function calling: no es un modelo de lenguaje y no genera texto ni llamadas estructuradas.
- Sin soporte de agentes ni razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingues: no procesa texto.
- Sin modo de razonamiento extendido (thinking mode), audio, video explicito ni generacion de imagenes: la model card solo describe extraccion de caracteristicas.

## Casos de uso

- Estimacion de pose humana en produccion: se congela o ajusta el backbone y se entrena una cabeza de keypoints sobre el. La resolucion de preentrenamiento de 1024 x 768 y los 3.072 tokens por imagen permiten resolver articulaciones y extremidades que los backbones a 224 x 224 tienden a perder.
- Segmentacion de partes del cuerpo para analisis deportivo: el modelo sirve de inicializacion para cabezas de segmentacion densa, util para medir angulos articulares, zancada o simetria en video de atletas.
- Reconstruccion 3D y avatares: con las cabezas de normales y pointmaps de la familia, el backbone aporta caracteristicas por parche para reconstruir geometria corporal, base de pipelines de prueba virtual de ropa o generacion de avatares.
- Analisis de marcha y rehabilitacion: extraccion de caracteristicas frame a frame para seguimiento longitudinal de pacientes; la ventana de 3.072 tokens permite trabajar a resolucion clinica con una sola pasada.
- Anonimizacion y edicion de video: deteccion y segmentacion de personas para desenfocar o sustituir cuerpos en material audiovisual, usando el backbone como extractor previo a una cabeza de segmentacion.
- Recuperacion visual en catalogos de moda: el embedding denso por parche permite construir indices de similitud centrados en la persona y la prenda, no en el fondo, mejorando la busqueda por similitud respecto a descriptores globales.
- Robotica e interaccion persona-robot: percepcion de la postura y la silueta humana como entrada para planificacion de movimiento seguro, ejecutando el backbone en el borde si se cuantiza.
- Investigacion en vision centrada en humanos: punto de partida reproducible para comparar estrategias de preentrenamiento a gran escala en el dominio humano, con variantes de 0,1B a 5B para estudiar escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes de vision como AP de keypoints, mIoU de segmentacion o error angular de normales, ni comparaciones numericas con otros backbones. El articulo arXiv:2604.21681 es la referencia donde deberian aparecer, pero su contenido no forma parte de la informacion proporcionada.

## Requisitos de hardware

- Peso de los parametros: 395.450.384 parametros, aproximadamente 1,58 GB en FP32, 0,79 GB en FP16/BF16, 0,40 GB en INT8 y 0,20 GB en INT4. El repositorio ocupa 1,6 GB, coherente con un unico checkpoint en FP32.
- VRAM de inferencia: el peso no es el cuello de botella, sino las activaciones. Una entrada de 1024 x 768 genera 3.072 tokens que atraviesan 24 capas con dimension 1024; se recomienda reservar varios GB adicionales sobre el peso del modelo y usar `torch.no_grad()` y lotes de tamano 1 para el calculo de caracteristicas.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 4080/3090 (16-24 GB) e incluso en tarjetas de 8-12 GB si se reduce la resolucion de entrada o se usa precision mixta. En FP16 el escenario de extraccion por lotes pequenos es viable en una GPU de 8 GB.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) y L40S permiten lotes mayores y procesamiento por streaming de video. El modelo de 5B de la misma familia es el que exige este tipo de hardware.
- Opciones de despliegue: el uso previsto por el autor es el repositorio `sapiens2` (instalacion con `pip install -e .`) y la carga del checkpoint con `safetensors` y `huggingface_hub`. El repositorio no documenta integraciones con vLLM, TGI, Ollama ni llama.cpp, que estan orientados a modelos de lenguaje y no soportan este backbone. La exportacion a ONNX o TensorRT para inferencia en produccion es posible en principio, pero no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles. Dependen de la GPU, de la precision, del tamano de lote y de la resolucion de entrada; la model card solo declara 1,260 TFLOPs por inferencia como referencia de coste computacional.

## Comparativa con modelos similares

Dentro de la propia familia Sapiens2 (datos de la model card):

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.1B | 0,114 B | 0,342 T | 768 | 12 | 12 |
| Sapiens2-0.4B (este) | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-1B-4K | 1,607 B | no disponible | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

Frente a backbones de vision genericos de tamano comparable (por ejemplo, la familia DINOv2 o los codificadores de imagen de SAM), la diferencia principal es el dominio de preentrenamiento: Sapiens2 se entrena sobre 1.000 millones de imagenes de personas, mientras que los backbones genericos se entrenan sobre corpus web heterogeneos. No se dispone en la informacion proporcionada de cifras de parametros, contexto de entrada, resultados de benchmarks ni condiciones de licencia verificadas para esos modelos alternativos, por lo que la comparacion cuantitativa queda como no disponible. Todos los modelos de la tabla comparten la licencia Sapiens2 y se distribuyen como safetensors.

## Limitaciones y advertencias

- Especializacion de dominio: el preentrenamiento sobre imagenes de personas puede degradar el rendimiento en escenas sin presencia humana, paisajes, objetos o texto en imagen. No es un backbone de proposito general.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones, no hace tool calling ni razonamiento multi-paso. Cualquier expectativa de uso tipo LLM es inaplicable.
- Caracteristicas sin cabeza: el checkpoint es un backbone. Para obtener pose, segmentacion, normales o pointmaps hay que anadir y entrenar cabezas especificas o usar los checkpoints downstream de la coleccion oficial.
- Riesgo de sesgo: un corpus de 1.000 millones de imagenes de personas hereda los sesgos de representacion de la fuente en cuanto a genero, tono de piel, edad, complexion corporal, vestimenta y contexto cultural. La model card no documenta analisis de sesgo ni composicion demografica del dataset.
- Riesgo de alucinacion en sentido estricto: no aplica a un extractor de caracteristicas, pero si existe el riesgo de que una cabeza downstream entrene sobre estas caracteristicas produzca predicciones plausibles y erroneas en cuerpos ocluidos, posturas extremas o imagenes de baja calidad.
- Resolucion de entrada: el preentrenamiento es a 1024 x 768. Cambiar sustancialmente la relacion de aspecto o la resolucion altera el numero de tokens y puede requerir interpolacion posicional; la model card no documenta el comportamiento fuera de esa configuracion.
- Licencia: se distribuye bajo la Sapiens2 License (`license: other`). No se ha podido verificar en la informacion disponible si permite uso comercial, por lo que debe consultarse el texto completo en el repositorio oficial antes de desplegarlo en produccion.
- Repositorio espejo: este ID no es una publicacion oficial de Meta. El propio autor advierte de que es un espejo sin cambios de licencia; para trazabilidad conviene referenciar `facebook/sapiens2-pretrain-0.4b`.
- Caveat de metricas: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria independiente.
- Idiomas: sin soporte de texto; cualquier metadato linguistico debe gestionarse con modelos adicionales.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-pretrain-0.4b
- Repositorio original de Meta: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Articulo: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo: https://github.com/facebookresearch/sapiens2
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Variante 0.1B: https://huggingface.co/facebook/sapiens2-pretrain-0.1b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Variante 1B: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Variante 1B-4K: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
- Variante 5B: https://huggingface.co/facebook/sapiens2-pretrain-5b
