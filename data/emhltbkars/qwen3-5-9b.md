# emhltbkars/Qwen3.5-9B

## Resumen
Qwen3.5-9B es un modelo de lenguaje y visión de tipo causal desarrollado por el equipo Qwen (Alibaba). Se distribuye como pesos post-entrenados en formato Hugging Face Transformers y se publica en el repositorio `emhltbkars/Qwen3.5-9B`, un espejo del modelo base oficial `Qwen/Qwen3.5-9B-Base`. Integra un codificador de visión y un modelo de lenguaje con arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuertas (Gated Attention), lo que busca alto rendimiento de inferencia con baja latencia.

El modelo resuelve tareas multimodales de imagen-texto, razonamiento, código y agentes, y amplía la cobertura lingüística hasta 201 idiomas y dialectos según la model card. Su contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo sitúa en la gama alta de ventanas de contexto para un modelo de ~9.650 millones de parámetros.

La relevancia actual radica en su enfoque de fusión temprana de tokens multimodales, que según el autor alcanza paridad con la generación Qwen3 y supera a los modelos Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual. Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention, con FFN y MTP (multi-token prediction) |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no se especifica que sea MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento
La arquitectura es un transformer causal con codificador de visión. El modelo de lenguaje tiene 32 capas con una disposición híbrida de 8 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 4096, la dimensión intermedia del FFN es 12288 y el embedding de tokens es de 248.320 (con padding). El modelo se entrenó con multi-token prediction (MTP) en varios pasos.

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, con fusión temprana sobre tokens multimodales. Según la model card, se aplicó aprendizaje por refuerzo (RL) escalado a entornos de millones de agentes con distribuciones de tareas progresivamente complejas. No se detalla en la información proporcionada el número exacto de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas concretas de RLHF o DPO más allá del RL mencionado.

## Capacidades
- Generación de texto y razonamiento general, con resultados destacados en MMLU-Pro (82,5) y MMLU-Redux (91,4) según la model card.
- Comprensión visual y tareas imagen-texto (pipeline `image-text-to-text`), incluyendo razonamiento sobre imágenes.
- Generación de código y tareas de programación, con paridad declarada frente a Qwen3 y mejora frente a Qwen3-VL.
- Razonamiento matemático y STEM (categoría Knowledge & STEM en los benchmarks publicados).
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL en entornos de agentes.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información proporcionada, aunque las capacidades de agente y la integración con vLLM/SGLang lo permiten.
- Modo thinking: no se especifica explícitamente en la información proporcionada.

## Casos de uso
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens nativos, manteniendo el hilo de la conversación y recuperando información de interacciones previas sin truncar.
- Análisis de documentos extensos con imágenes: informes, contratos o manuales que combinan texto y figuras pueden procesarse en una sola pasada gracias a la ventana de contexto extensible hasta 1.010.000 tokens y al codificador de visión.
- Generación de código en producción: su capacidad de código y su compatibilidad con vLLM y SGLang permiten integrarlo en pipelines de CI/CD para revisión automática, generación de tests y refactorización.
- Agentes autónomos multi-paso: el entrenamiento con RL en entornos de agentes lo hace adecuado para orquestar tareas con múltiples herramientas y pasos intermedios, como automatización de flujos de trabajo.
- Asistentes multilingües: con 201 idiomas y dialectos, es apto para despliegues globales de soporte y traducción con matices culturales y regionales.
- Razonamiento sobre imágenes en entornos industriales: inspección visual asistida, extracción de datos de capturas o análisis de diagramas combinando visión y razonamiento textual.
- Búsqueda y resumen sobre corpus grandes: la ventana de contexto permite resumir y responder preguntas sobre grandes volúmenes de texto sin fragmentación agresiva.

## Benchmarks y rendimiento

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 91,4 | no disponible |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks adicionales más allá de los recogidos en la tabla anterior.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; para ~9,65 B de parámetros en FP16 se requieren aproximadamente 19,3 GB de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, cabría en GPUs con 24 GB o más en FP16 (p. ej. RTX 4090, A100 40 GB, H100).
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) con cuantización; en FP16 el margen es ajustado.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B | ~9,65 B | 262.144 (ext. 1.010.000) | 82,5 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B | no disponible | no disponible | 79,1 | Apache 2.0 | Hugging Face |
| GPT-OSS-20B | 20 B (aprox.) | no disponible | 74,8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30 B (aprox.) | no disponible | 80,9 | no disponible | no disponible |

## Limitaciones y advertencias
- Sesgos conocidos: no se detallan en la información proporcionada; como modelo entrenado con datos web y multimodales, es esperable cierto sesgo, pero no hay datos oficiales.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable a modelos generativos de este tipo.
- Limitaciones de contexto o idioma: aunque declara 201 idiomas, no se especifica el rendimiento por idioma; el contexto extensible a 1.010.000 tokens puede degradar la calidad si no se gestiona adecuadamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio oficial de Qwen para condiciones adicionales.
- Caveats para producción: el repositorio `emhltbkars/Qwen3.5-9B` tiene 0 descargas y 0 likes, por lo que su fiabilidad como espejo no está validada por la comunidad; se recomienda usar el repositorio oficial `Qwen/Qwen3.5-9B` para producción.
- No se especifican tipos de cuantización oficiales ni requisitos mínimos de hardware, lo que dificulta la planificación de despliegues.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/emhltbkars/Qwen3.5-9B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
