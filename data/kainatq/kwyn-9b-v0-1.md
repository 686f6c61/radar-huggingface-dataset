# kainatq/KWYN-9B-v0.1

## Resumen

KWYN-9B-v0.1 es un modelo multimodal de tipo imagen-texto-a-texto publicado por el usuario kainatq en Hugging Face, construido como un ajuste fino (finetune) sobre Qwen/Qwen3.5-9B-Base. Se distribuye con licencia Apache 2.0, en formato safetensors y compatible con la librería transformers. El repositorio ocupa 19,3 GB y contiene 9.653.104.368 parámetros reales según los pesos almacenados. La model card incluida en el repositorio reproduce, en su práctica totalidad, la documentación oficial del modelo base Qwen3.5-9B, por lo que las especificaciones tecnicas que se detallan a continuacion provienen de esa fuente y describen la arquitectura subyacente, no necesariamente las modificaciones introducidas por el ajuste fino.

El modelo hereda la arquitectura hibrida del Qwen3.5-9B: una combinacion de Gated Delta Networks (atencion lineal) y atencion con compuertas (Gated Attention), con un codificador de vision para el procesamiento de imagenes. Dispone de una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, y esta entrenado con Multi-Token Prediction (MTP). El pipeline declarado es image-text-to-text, lo que lo situa en la categoria de modelos vision-language.

Su relevancia radica en que ofrece capacidades multimodales y de razonamiento propias de la familia Qwen3.5 en un tamano de 9B parametros, lo que lo hace desplegable en infraestructura de una sola GPU de gama alta. No obstante, al tratarse de una publicacion con cero descargas y cero likes en el momento de la consulta, y sin informacion especifica sobre el proceso de ajuste fino, debe evaluarse con cautela antes de su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal con codificador de vision: Gated DeltaNet (atencion lineal) + Gated Attention, con FFN; layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 9.653.104.368 (9B nominales) |
| Parametros activos | no disponible (no se declara como MoE en la informacion disponible) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido con un codificador de vision acoplado, disenado para fusión temprana de tokens multimodales. La dimension oculta es 4096, con 32 capas organizadas en un patron repetido de tres bloques de Gated DeltaNet seguidos de un bloque de Gated Attention. Las Gated DeltaNet emplean 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. Las Gated Attention usan 16 cabezas para Q y 4 para KV, con dimension de cabeza 256 y dimension de Rotary Position Embedding de 64. La FFN tiene dimension intermedia 12288. El embedding de tokens y la salida LM son de 248.320 entradas (con padding). El modelo incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos.

Segun la model card del modelo base, el entrenamiento combina pre-entrenamiento y post-entrenamiento, con aprendizaje por refuerzo escalado sobre entornos multiagente y distribuciones de tareas progresivamente complejas. La model card menciona tambien una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto, y marcos de RL asincronos para orquestacion de agentes a gran escala. No se dispone de informacion especifica sobre el dataset de ajuste fino de KWYN-9B-v0.1, el numero de tokens utilizados en ese ajuste ni si se aplicaron tecnicas de RLHF o DPO adicionales sobre el modelo base.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural.
- Comprension de imagenes y respuesta en texto (pipeline image-text-to-text), incluyendo comprension visual segun la model card del modelo base.
- Razonamiento matematico y cientifico (evaluado en MMLU-Pro, MMLU-Redux y otros benchmarks de conocimiento y STEM).
- Generacion y comprension de codigo, con paridad declarada frente a Qwen3 y mejoria frente a Qwen3-VL en benchmarks de razonamiento, codigo, agentes y comprension visual.
- Capacidades de agente y razonamiento multi-paso, respaldadas por el entrenamiento con RL en entornos multiagente.
- Soporte multilingue amplio: 201 idiomas y dialectos.
- Multi-Token Prediction (MTP) para decodificacion especulativa y aceleracion de inferencia.
- Compatibilidad declarada con transformers, vLLM, SGLang y KTransformers.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada para esta variante.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede procesar capturas de pantalla, facturas o fotos de producto junto con texto del usuario y responder en el mismo hilo, gracias a su contexto nativo de 262.144 tokens que permite mantener historiales largos de conversacion.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre tablas, graficos y diagramas en informes tecnicos o financieros, combinando el codificador de vision con el razonamiento textual del modelo.
- Asistentes de accesibilidad: descripcion de imagenes, lectura de graficos y respuesta a preguntas sobre contenido visual para usuarios con discapacidad visual, con soporte multilingue en 201 idiomas.
- Generacion de codigo asistida por capturas: interpretar diagramas de arquitectura, mensajes de error en pantalla o mockups de interfaz y generar el codigo correspondiente en pipelines de desarrollo.
- Procesamiento de documentacion tecnica de gran volumen: ingestión de manuales extensos (hasta cientos de miles de tokens) para responder preguntas con contexto completo, aprovechando la extension de contexto hasta 1.010.000 tokens.
- Moderacion de contenido multimodal: clasificacion y analisis de publicaciones que combinan texto e imagen en plataformas sociales, con despliegue en vLLM o SGLang para alto throughput.
- Investigacion en agentes visuales: uso como base para entornos multiagente donde el modelo debe interpretar pantallas, ejecutar acciones y razonar en varios pasos, aprovechando el entrenamiento con RL en entornos multiagente del modelo base.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwen3.5-9B segun la model card incluida en el repositorio. No se dispone de benchmarks especificos del ajuste fino KWYN-9B-v0.1.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

La model card solo incluye en el extracto disponible las filas de MMLU-Pro y MMLU-Redux; el resto de la tabla de benchmarks (codigo, matematicas, vision, agentes) no esta disponible en la informacion proporcionada. No se han publicado resultados de benchmarks especificos de KWYN-9B-v0.1.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 19,3 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 10-11 GB para pesos; en 4 bits: alrededor de 5-6 GB para pesos, mas cache KV.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto moderado o cuantizacion; RTX 3090 (24 GB) y RTX 4080 (16 GB) viables en cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y tarjetas con 16 GB o mas usando cuantizacion; en 8 GB no es viable sin cuantizacion agresiva.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (segun la model card); llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La arquitectura hibrida con atencion lineal y MTP esta disenada para alto throughput y baja latencia, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KWYN-9B-v0.1 | 9,65B | 262.144 (ext. 1.010.000) | no disponible (base: 82,5) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9B | 262.144 (ext. 1.010.000) | 82,5 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B | 4B | no disponible en el extracto | 79,1 | Apache 2.0 | Hugging Face |
| GPT-OSS-20B | 20B | no disponible en el extracto | 74,8 | no disponible en el extracto | no disponible en el extracto |
| Qwen3-30BA3B-Thinking-2507 | 30B (3B activos) | no disponible en el extracto | 80,9 | no disponible en el extracto | Hugging Face |

La comparativa se limita a los datos presentes en la model card. No se dispone de informacion sobre otros modelos de 9B multimodales con los que comparar directamente en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no presenta descargas ni likes, y no hay informacion sobre el proceso de ajuste fino, los datos utilizados ni la evaluacion del modelo resultante; se desconoce si el finetune degrada las capacidades del modelo base.
- La model card del repositorio reproduce la documentacion de Qwen3.5-9B sin adaptarla; las capacidades y benchmarks citados corresponden al modelo base y no han sido verificados para KWYN-9B-v0.1.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de conocimiento factual y en la interpretacion de imagenes ambiguas.
- Sesgos conocidos: no disponibles en la informacion proporcionada; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base, no documentados en el extracto.
- Limitaciones de idioma: aunque se declaran 201 idiomas, el rendimiento relativo por idioma no esta documentado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor del finetune no ofrece garantias ni documentacion sobre el cumplimiento de las condiciones del modelo base.
- Para produccion, es imprescindible validar el modelo en el dominio objetivo antes de desplegarlo, dado el escaso historial de uso y la ausencia de evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kainatq/KWYN-9B-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
