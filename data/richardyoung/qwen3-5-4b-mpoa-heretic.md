# richardyoung/Qwen3.5-4B-MPOA-heretic

## Resumen

Qwen3.5-4B-MPOA-heretic es una variante "decensored" del modelo multimodal Qwen3.5-4B de Alibaba Qwen, publicada por el usuario richardyoung. El modelo conserva la arquitectura y los pesos del original, pero aplica una tecnica de ablacion ortogonal con preservacion de magnitud (MPOA, Magnitude-Preserving Orthogonal Ablation) mediante la herramienta Heretic v2.0.0, cuyo objetivo es reducir la tasa de rechazos (refusals) ante peticiones que el modelo original declinaria.

El modelo base Qwen3.5-4B es un modelo causal con codificador de vision, entrenado con fusion temprana de tokens multimodales y una arquitectura hibrida que combina Gated Delta Networks (atencion lineal) con atencion con compuertas y capas feed-forward. Cuenta con 4.539.265.536 parametros (4B nominales), 32 capas y un contexto nativo de 262.144 tokens, extensible hasta 1.010.000.

La relevancia de esta ficha radica en dos frentes: por un lado, documenta un modelo multimodal pequeno con contexto muy largo y soporte para 201 idiomas; por otro, advierte de que se trata de un derivado sin censura, con implicaciones claras para su uso en produccion. El autor declara que el proceso es reproducible y publica los parametros exactos de la ablacion, lo que permite auditar la intervencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: Gated DeltaNet (atencion lineal) + Gated Attention + FFN; layout 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se declara como MoE en la model card del derivado) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | 201 idiomas y dialectos segun el modelo base; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B original: un transformer causal con codificador de vision y fusion temprana de tokens multimodales. La columna vertebral combina 32 capas organizadas en bloques de atencion lineal (Gated DeltaNet, con 32 cabezas para V y 16 para QK, dimension de cabeza 128) intercalados con atencion con compuertas (16 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE de 64 dimensiones). La dimension oculta es 2560, la dimension intermedia del FFN es 9216 y el embedding de tokens tiene 248.320 entradas (con padding) atadas a la salida LM. El modelo base fue entrenado con multi-token prediction (MTP) en varios pasos.

Sobre el entrenamiento del modelo base, la model card indica pre-entrenamiento y post-entrenamiento con escalado de RL en entornos multiagente y cobertura de 201 idiomas, pero no detalla el numero de tokens ni la composicion del dataset. La intervencion de este derivado consiste en una ablacion ortogonal con preservacion de magnitud (MPOA) aplicada por capa sobre `attn.o_proj` y `mlp.down_proj`, con pesos maximos de 1,25 y 1,36 respectivamente y distancias de posicion declaradas. El autor reporta que la tasa de rechazos cae de 99/100 en el original a 6/100 en el derivado, con una divergencia KL de 0,0543 respecto al modelo base.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entrada de imagen y texto (pipeline `image-text-to-text`) y produce respuestas en lenguaje natural.
- Razonamiento y conocimiento STEM: el modelo base declara resultados competitivos en MMLU-Pro y benchmarks de codigo y agentes.
- Codigo y matematicas: capacidades heredadas del Qwen3.5-4B original, sin datos desagregados en la informacion disponible.
- Tool calling y function calling: el modelo base esta disenado para agentes; la model card no detalla el formato exacto de llamadas a herramientas.
- Razonamiento multi-paso y agentes: el entrenamiento del modelo base incluye RL en entornos multiagente.
- Multilingue: cobertura declarada de 201 idiomas y dialectos en el modelo base.
- Modo thinking: no confirmado de forma explicita para esta variante en la informacion disponible.
- Reduccion de rechazos: el derivado responde a peticiones que el original rechazaria en aproximadamente el 94 % de los casos segun la metrica del autor.

## Casos de uso

- Procesamiento de documentos con imagenes y texto largo: el contexto nativo de 262.144 tokens permite ingerir informes escaneados, tablas y texto corrido en una sola pasada, sin trocear en fragmentos que pierdan referencias cruzadas.
- Analisis de capturas de pantalla y UI: al ser un modelo image-text-to-text, puede describir interfaces, extraer texto de imagenes y responder preguntas sobre el contenido visual en flujos de soporte tecnico.
- Generacion de codigo en pipelines de CI/CD: con 4B parametros y soporte en vLLM y SGLang, es viable como servicio de autocompletado o revision de parches con latencia contenida en una sola GPU.
- Investigacion sobre alineacion y seguridad: la publicacion de los parametros MPOA y del proceso reproducible permite estudiar como afecta la ablacion a la distribucion de salidas y medir la divergencia KL frente al modelo original.
- Prototipado de asistentes conversacionales multilingues: la cobertura de 201 idiomas del modelo base facilita pruebas de concepto en mercados con varios idiomas sin desplegar un modelo por region.
- Evaluacion de sesgos en modelos sin censura: util para comparar tasas de rechazo, toxicidad y fidelidad frente al Qwen3.5-4B original en un entorno controlado.
- Extraccion de informacion de imagenes en lotes: con contexto largo y vision, adecuado para tareas de catalogacion donde cada imagen viene acompanada de metadatos textuales extensos.

## Benchmarks y rendimiento

Datos publicados por el autor del derivado:

| Metrica | Este modelo | Qwen3.5-4B original |
|---|---|---|
| Rechazos (sobre 100) | 6/100 | 99/100 |
| Divergencia KL | 0,0543 | 0 (por definicion) |

El modelo base Qwen3.5-4B aparece en la tabla de benchmarks de la model card original junto a GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507 y Qwen3.5-9B, pero los valores numericos de esas filas no estan completos en la informacion proporcionada. No se han publicado resultados desagregados de MMLU, HumanEval o GSM8K para esta variante concreta en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 9,1 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica, 12-16 GB para inferencia comoda con contexto moderado.
- VRAM en cuantizacion de 8 bits: alrededor de 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se confirman builds GGUF oficiales para esta variante.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262.144 tokens; RTX 4090 (24 GB) para contexto medio en BF16; RTX 3090/4080 (16-24 GB) para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en BF16 con contexto recortado, y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card del base; llama.cpp y Ollama no estan confirmados para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-MPOA-heretic (este) | 4,54B | 262.144 (ext. 1,01M) | Si | Apache 2.0 | Derivado sin censura, reproducible, 6/100 rechazos |
| Qwen3.5-4B (original) | 4B | 262.144 (ext. 1,01M) | Si | Apache 2.0 | Referencia de alineacion, 99/100 rechazos |
| Qwen3.5-9B | no disponible | no disponible | Si | Apache 2.0 | Version superior de la misma familia, mas capacidad a mayor coste |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible | Comparable en la tabla del modelo base, mayor tamano |

## Limitaciones y advertencias

- Modelo sin censura: la ablacion reduce deliberadamente los rechazos, por lo que puede generar contenido que el modelo original bloquearia; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Divergencia respecto al original: la KL de 0,0543 implica cambios medibles en la distribucion de salidas que pueden afectar a la calidad en tareas sensibles a la alineacion.
- Riesgo de alucinacion: inherente a modelos de 4B; el contexto muy largo no elimina este riesgo y puede amplificarlo si se introducen documentos contradictorios.
- Idiomas: la lista concreta de los 201 idiomas del modelo base no se detalla; el rendimiento por idioma no esta verificado para esta variante.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del derivado ni sobre el cumplimiento normativo en jurisdicciones con requisitos de moderacion.
- Sin datos de benchmarks estandar: no hay MMLU, HumanEval ni GSM8K publicados para esta variante, solo la metrica de rechazos y la KL.
- Cuantizaciones no confirmadas: no se garantiza la disponibilidad de GGUF u otros formatos para esta variante concreta.
- Reproducibilidad declarada: el autor publica el proceso en `reproduce/README.md`, pero la verificacion independiente no esta documentada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
