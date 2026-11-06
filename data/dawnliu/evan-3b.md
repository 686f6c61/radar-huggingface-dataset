# DawnLiu/EVAN-3B

## Resumen

EVAN-3B es un modelo multimodal de tipo image-text-to-text desarrollado por DawnLiu (Chenxi Liu, Tianyi Xiong, Yanshuo Chen y Heng Huang), construido a partir de Qwen2.5-VL-3B-Instruct mediante entrenamiento con EVAN (Evidence-Ablated Negatives), el metodo presentado en el paper de NeurIPS 2026 *Grounding Multimodal Reasoning with Evidence-Ablated Negatives*. El modelo parte de una arquitectura transformer multimodal Qwen2.5-VL y se ajusta con aprendizaje por refuerzo (DAPO) sobre el dataset ViRL39K para mejorar el razonamiento visual y matematico.

El problema que aborda es concreto: las recompensas de RLVR (Reinforcement Learning with Verifiable Rewards) suelen comprobar unicamente la respuesta final, sin verificar si esa respuesta procede realmente de la imagen o de priors linguisticos y atajos del dataset. EVAN enmascara la evidencia visual necesaria para responder, deja que la politica conteste sin ella y penaliza las respuestas plausibles pero incorrectas bajo la imagen limpia. El resultado es un modelo que fundamenta mejor su razonamiento en la evidencia visual.

El modelo tiene 4.065.787.904 parametros totales segun los pesos en safetensors (el nombre comercial "3B" hace referencia a la clase del modelo base, no al recuento exacto), un repositorio de 8,1 GB, soporte unicamente de ingles y una licencia de investigacion Qwen que restringe el uso a fines no comerciales. Se publica junto a variantes EVAN-7B y EVAN-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL), vision-language |
| Parametros totales | 4.065.787.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (Qwen Research License, solo uso no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EVAN-3B hereda la arquitectura de Qwen2.5-VL-3B-Instruct: un transformer multimodal con codificador visual y modelo de lenguaje, orientado a tareas de image-text-to-text. Sobre esa base se aplica un entrenamiento de aprendizaje por refuerzo con DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization) usando el dataset TIGER-Lab/ViRL39K. La innovacion central es el esquema de recompensas EVAN: durante el entrenamiento se enmascara la evidencia visual que la pregunta requiere, se permite que la politica responda sin esa evidencia y se penalizan las respuestas plausibles pero incorrectas que se obtendrian con la imagen limpia. Asi se desincentiva que el modelo acierte por priors linguisticos o atajos del dataset.

Respecto al modelo base, los pesos se modificaron mediante RL con EVAN, `generation_config.json` fija los parametros de muestreo usados en evaluacion, y el resto de ficheros de configuracion, tokenizer y processor se reguardaron con `dtype` establecido a `bfloat16` en `config.json`. El modelo genera razonamiento interno en etiquetas `<think> </think>` y respuesta final en `\boxed{}` cuando se le indica mediante el prompt de entrenamiento. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion completa del dataset mas alla de ViRL39K.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes y preguntas en lenguaje natural.
- Razonamiento matematico visual: resolucion de problemas de geometria, matematica visual y tareas tipo MathVista, MathVerse, We-Math, DynaMath y MathVision.
- Modo de razonamiento explicito (thinking): produce un monologo interno dentro de `<think> </think>` antes de la respuesta final en `\boxed{}`.
- Razonamiento logico-visual (LogicVista) y comprension de conocimiento multimodal (MMMU-Pro, MMK12).
- Capacidades conversacionales multi-turno heredadas de Qwen2.5-VL-3B-Instruct.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; el modo thinking permite cadenas de razonamiento internas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision: si (image-text-to-text). Audio: no disponible.

## Casos de uso

- Tutoria de matematicas con imagenes: el modelo puede recibir la foto de un problema de geometria o de un diagrama y generar el razonamiento paso a paso antes de la respuesta final, aprovechando su entrenamiento especifico en Geo3K y MathVision.
- Correccion automatica de ejercicios visuales: dado un enunciado con figura y una respuesta candidata, el modelo puede razonar sobre la evidencia visual y verificar si la solucion es correcta, util en plataformas educativas.
- Asistencia en investigacion sobre razonamiento multimodal: sirve como modelo de referencia para reproducir y comparar el metodo EVAN frente a DAPO estandar con el mismo dataset y receta.
- Analisis de graficos y tablas en documentos: el modelo puede interpretar figuras y responder preguntas cuantitativas sobre ellas, adecuado para extraccion de informacion en informes tecnicos.
- Prototipado de asistentes visuales en entornos de investigacion: al ser un modelo de 4B parametros, permite experimentar con razonamiento visual en una sola GPU, sin la infraestructura de modelos de mayor tamano.
- Evaluacion de robustez ante atajos: el esquema de entrenamiento con negativos ablacionados lo hace util para estudiar hasta que punto un modelo fundamenta sus respuestas en la imagen frente a priors linguisticos.
- Generacion de explicaciones razonadas sobre imagenes: el formato `<think>` + `\boxed{}` facilita integrar la salida en pipelines que necesitan trazabilidad del razonamiento.

## Benchmarks y rendimiento

Resultados de exactitud (%) de la Tabla 1 del paper, con muestreo a temperatura 1.0. DAPO usa los mismos datos y receta de entrenamiento sin EVAN.

| Modelo | Geo3K | MathVista | MathVerse | We-Math | DynaMath | MathVision | MMK12 | MMMU-Pro | LogicVista | Media |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Qwen2.5-VL-3B-Instruct | 19.4 | 46.3 | 33.5 | 29.9 | 40.4 | 18.2 | 36.3 | 19.8 | 32.1 | 30.7 |
| DAPO | 38.8 | 62.4 | 60.4 | 60.5 | 59.3 | 26.5 | **72.2** | 29.9 | 43.0 | 50.3 |
| **EVAN-3B** | **39.9** | **62.7** | **62.8** | **64.6** | **60.6** | **27.6** | 71.5 | **31.0** | **43.3** | **51.6** |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8-9 GB solo para pesos (4,07B parametros), mas overhead de activaciones y cache KV; en la practica conviene reservar 12-16 GB.
- Cuantizacion: no se publican pesos cuantizados oficiales; al ser un modelo transformers estandar, es convertible a GGUF/AWQ/GPTQ con herramientas de la comunidad, aunque no esta documentado.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 con holgura.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion a 8 bits, en GPUs de 16 GB como RTX 4080 o A4000. En 4 bits podria ajustarse a 12 GB, aunque no hay validacion oficial.
- Despliegue: transformers (>=4.57) con accelerate y torchvision; tambien compatible con vLLM (con `top_k=50` en `SamplingParams`) y con text-generation-inference segun los tags del repositorio. Ollama y llama.cpp requeririan conversion a GGUF no oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en benchmarks del paper | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EVAN-3B | 4,07B | no disponible | 51,6 | qwen-research (no comercial) | Hugging Face |
| Qwen2.5-VL-3B-Instruct | ~3,75B (clase 3B) | no disponible | 30,7 | qwen-research | Hugging Face |
| DAPO (misma receta sin EVAN) | 4,07B | no disponible | 50,3 | no disponible | no disponible |
| EVAN-7B | no disponible | no disponible | no disponible | qwen-research | Hugging Face |
| EVAN-8B | no disponible | no disponible | no disponible | qwen-research | Hugging Face |

La comparativa mas directa es frente al modelo base Qwen2.5-VL-3B-Instruct (mejora de 20,9 puntos de media) y frente a la ablacion DAPO con los mismos datos (mejora de 1,3 puntos de media, con mejoras en casi todas las tareas salvo MMK12).

## Limitaciones y advertencias

- Licencia qwen-research: uso exclusivamente no comercial. Cualquier despliegue en produccion con fines comerciales requiere autorizacion expresa de Qwen/Alibaba.
- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion inherente a los modelos de razonamiento multimodal, especialmente en tareas fuera de la distribucion de ViRL39K (matematicas visuales y logica).
- El formato de salida (`<think>` + `\boxed{}`) depende de anadir la instruccion de entrenamiento tras la pregunta; sin ella, el comportamiento puede degradarse.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen2.5-VL hereda los sesgos de su dataset de preentrenamiento, no auditados aqui.
- Longitud de contexto no especificada en la ficha; asumir la del modelo base solo si se verifica, no hay confirmacion en la informacion disponible.
- Modelo de investigacion con 78 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.
- No hay pesos cuantizados oficiales ni validacion de despliegue en llama.cpp/Ollama.
- El nombre "3B" no coincide con el recuento real de parametros (4,07B); tenerlo en cuenta para estimaciones de memoria y comparativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DawnLiu/EVAN-3B
- Paper (arXiv): https://arxiv.org/abs/2610.39237
- Repositorio de codigo: https://github.com/DawnLIU35/EVAN
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- Variante EVAN-7B: https://huggingface.co/DawnLiu/EVAN-7B
- Variante EVAN-8B: https://huggingface.co/DawnLiu/EVAN-8B
- Licencia: https://huggingface.co/DawnLiu/EVAN-3B/blob/main/LICENSE
