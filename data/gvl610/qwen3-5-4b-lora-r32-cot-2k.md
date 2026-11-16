# gvl610/qwen3.5-4b-lora-r32-cot-2k

## Resumen

`gvl610/qwen3.5-4b-lora-r32-cot-2k` es un ajuste fino mediante LoRA (r=32) sobre el modelo base Qwen3.5-4B-Base de Alibaba Qwen. El autor del adaptador es el usuario `gvl610` y el repositorio se publicó el 16 de noviembre de 2026. El nombre del modelo sugiere un entrenamiento orientado a cadena de pensamiento (CoT) con un conjunto de datos de aproximadamente 2.000 ejemplos, aunque la model card no documenta explícitamente el dataset ni la metodología del ajuste.

El modelo base Qwen3.5-4B es un modelo causal multimodal (texto e imagen) con 4.660 millones de parámetros, arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas y una red feed-forward, y una longitud de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Incorpora un codificador de visión y fue entrenado con fusión temprana de tokens multimodales.

La relevancia de esta ficha radica en que el adaptador hereda las capacidades del modelo base (visión, contexto largo, 201 idiomas) y añade un ajuste específico para razonamiento paso a paso, pero la ausencia de documentación sobre el dataset de entrenamiento, los hiperparámetros y los resultados limita su evaluación rigurosa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; hibrida Gated DeltaNet + Gated Attention + FFN (layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se especifica si el modelo base es MoE; la model card menciona "sparse Mixture-of-Experts" en las notas generales de Qwen3.5, pero no confirma la configuracion del 4B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida de 32 capas con dimensión oculta de 2560 y embedding de tokens de 248.320 (con padding). La capa se organiza en ocho bloques que alternan tres subcapas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una subcapa de Gated Attention (16 cabezas para Q, 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La red feed-forward tiene dimensión intermedia de 9216. La salida LM está atada al embedding de tokens. El modelo incluye un codificador de visión y fue entrenado con fusión temprana de tokens multimodales, lo que permite paridad con modelos de texto de la generación Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual. Se entrenó con MTP (multi-token prediction) multi-paso.

El adaptador LoRA aquí publicado (r=32) se aplicó sobre el modelo base `Qwen/Qwen3.5-4B-Base`. El nombre del repositorio indica un ajuste orientado a cadena de pensamiento con un dataset de ~2.000 ejemplos, pero la model card no especifica la composición del dataset, el número de tokens de entrenamiento, la configuración de LoRA (alpha, dropout, módulos objetivo) ni si se empleó RLHF/DPO. No se documentan innovaciones técnicas adicionales del adaptador más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imagen) heredados del modelo base Qwen3.5-4B.
- Razonamiento paso a paso (chain-of-thought) reforzado por el ajuste LoRA, según indica el nombre del repositorio.
- Comprensión visual: el pipeline declarado es `image-text-to-text` y el modelo base incorpora codificador de visión.
- Código y matemáticas: capacidades presentes en el modelo base según los benchmarks publicados (MMLU-Pro 79,1).
- Soporte multilingüe: 201 idiomas y dialectos según la model card del modelo base.
- Contexto largo: ventana nativa de 262.144 tokens, extensible a 1.010.000, adecuada para documentos extensos y conversaciones multi-turno.
- Tool calling / function calling: no documentado explícitamente en la información disponible para este adaptador.
- Soporte de agentes y razonamiento multi-paso: el modelo base fue entrenado con RL escalado en entornos de agentes, pero no se detalla el comportamiento del adaptador.
- Modo thinking: no confirmado en la documentación del adaptador.

## Casos de uso

- Razonamiento paso a paso en dominios técnicos: el ajuste CoT permite generar cadenas de razonamiento explícitas para problemas de matemáticas, lógica o diagnóstico, útil en asistentes educativos que necesitan mostrar el proceso y no solo la respuesta.
- Análisis de documentos largos con imagen: gracias al contexto de 262.144 tokens y al codificador de visión, se puede usar para extraer información de informes escaneados, gráficos y tablas en un solo pase.
- Asistencia multilingüe: con cobertura de 201 idiomas, es adecuado para atención al cliente o traducción asistida en entornos con diversidad lingüística.
- Prototipado de agentes con razonamiento multi-paso: el modelo base fue entrenado con RL en entornos de agentes; el adaptador puede emplearse en pipelines de investigación que requieran descomposición de tareas, aunque la ausencia de documentación sobre tool calling exige validación previa.
- Generación de explicaciones técnicas: en documentación de código o análisis de errores, el modo CoT permite producir explicaciones detalladas de causas raíz.
- Investigación académica sobre ajuste fino: al ser un LoRA r=32 sobre un modelo base abierto con licencia Apache 2.0, sirve como punto de partida reproducible para estudiar el efecto del ajuste CoT en modelos de 4B.
- Despliegue en hardware de consumo: con 4,66 B de parámetros, es viable en GPUs de consumo para inferencia cuantizada, adecuado para demos locales de razonamiento multimodal.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden al modelo base Qwen3.5-4B publicados en su model card. No se han publicado resultados específicos del adaptador LoRA.

| Benchmark | Qwen3.5-4B | Qwen3.5-9B | Qwen3-30BA3B-Thinking-2507 | Qwen3-Next-80B-A3B-Thinking | GPT-OSS-20B | GPT-OSS-120B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 79,1 | 82,5 | 80,9 | 82,7 | 74,8 | 80,8 |
| MMLU-Redux | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento | no disponible en el fragmento |

No se han publicado resultados de benchmarks del adaptador en la información disponible. Los datos de la tabla corresponden al modelo base y solo se incluyen como referencia; no deben atribuirse al ajuste LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos (4,66 B × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~4,7 GB de pesos; en 4 bits: ~2,4 GB de pesos, más overhead.
- GPU recomendadas: A100 (40/80 GB), H100 para contexto largo completo (262K tokens) y despliegues de alto throughput; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con FP16 y contexto limitado, y en GPUs de 8-12 GB con cuantización 4/8 bits (si se generan pesos GGUF, no disponibles en el repositorio).
- Opciones de despliegue: Hugging Face Transformers (librería declarada), vLLM, SGLang y KTransformers según la model card del modelo base; llama.cpp/Ollama requerirían conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-lora-r32-cot-2k (este) | 4,66 B | 262.144 (ext. 1.010.000) | no disponible (base: 79,1) | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4 B | 262.144 (ext. 1.010.000) | 79,1 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B | 9 B (aprox.) | no disponible | 82,5 | no disponible en la información | Hugging Face |
| GPT-OSS-20B | 20 B (aprox.) | no disponible | 74,8 | no disponible en la información | no disponible en la información |

La comparativa se limita a los modelos incluidos en la tabla de benchmarks de la model card del modelo base. No se dispone de datos de contexto ni licencia para GPT-OSS-20B y Qwen3.5-9B en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no documenta el dataset de entrenamiento, los hiperparámetros de LoRA ni los resultados de evaluación; no es posible verificar la calidad del ajuste CoT.
- Riesgo de alucinación inherente al modelo base, no cuantificado para el adaptador.
- Sesgos conocidos del modelo base no documentados en la información disponible; la cobertura de 201 idiomas no garantiza calidad uniforme en todos ellos.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B (enlazada en la model card) y de los datos de entrenamiento del adaptador, no documentados.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por la comunidad.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja sin conversión manual.
- El pipeline declarado es `image-text-to-text`, pero no se detalla el comportamiento del adaptador en tareas de visión; el ajuste podría degradar capacidades multimodales si el dataset CoT fue solo textual.
- No se confirma soporte de tool calling ni modo thinking en el adaptador.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/gvl610/qwen3.5-4b-lora-r32-cot-2k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
