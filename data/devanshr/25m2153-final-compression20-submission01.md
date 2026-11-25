# DevanshR/25M2153-Final-Compression20-Submission01

## Resumen

Este repositorio, publicado por el usuario DevanshR bajo el identificador `25M2153-Final-Compression20-Submission01`, es un fine-tuning del modelo base Qwen3.5-4B-Base de Alibaba. Se trata de un modelo causal con codificador de visión, orientado a tareas de generación de texto e imagen-texto-a-texto, distribuido en formato Transformers y con licencia Apache 2.0. El tamaño del repositorio es de 3,5 GB, lo que resulta coherente con un modelo de aproximadamente 4 000 millones de parámetros en precisión de 16 bits.

El modelo hereda la arquitectura híbrida de Qwen3.5, que combina capas de atención lineal Gated DeltaNet con capas de atención con compuerta (Gated Attention), organizadas en un patrón de 8 bloques de tipo `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Esta disposición busca reducir el coste computacional en contextos largos manteniendo la calidad de la atención completa en puntos clave de la red.

La relevancia de esta ficha radica en que se trata de una submission de compresión (el nombre sugiere un trabajo académico o de curso, con identificador 25M2153), no de un lanzamiento oficial de Qwen. La model card incluida reproduce en gran medida la documentación del modelo base Qwen3.5-4B, por lo que muchos datos técnicos deben atribuirse a la familia Qwen3.5 y no necesariamente a este fine-tuning concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 4B (según model card del modelo base) |
| Parametros activos | no disponible (la model card no indica configuración MoE para la variante 4B) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene pesos Transformers; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en este repo; la familia Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Qwen3.5-4B: 32 capas, dimensión oculta de 2560, embedding de tokens de 248 320 (con padding), FFN con dimensión intermedia de 9216 y salida LM atada al embedding de tokens. El bloque híbrido intercala capas Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) con capas Gated Attention (16 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). Incluye entrenamiento con multi-token prediction (MTP) en varios pasos.

El modelo base Qwen3.5-4B-Base fue preentrenado y postentrenado por Alibaba, con entrenamiento multimodal de fusión temprana sobre tokens de imagen y texto, y escalado de RL en entornos multiagente. No se dispone de información específica sobre el dataset, el número de tokens o el proceso de fine-tuning aplicado por DevanshR para producir esta submission de compresión; la model card no documenta dichos detalles. Tampoco se especifica si el fine-tuning preserva el codificador de visión o si se ha modificado.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredado del modelo base.
- Comprensión de imagen y texto (pipeline `image-text-to-text`), con codificador de visión integrado.
- Capacidades de código y matemáticas propias de la familia Qwen3.5, según los benchmarks del modelo base.
- Soporte multilingüe amplio según la documentación de Qwen3.5 (201 idiomas), aunque no verificado para este fine-tuning.
- Compatibilidad declarada con tool calling y flujos de agentes a través de los tags `conversational` y `endpoints_compatible`.
- Modo de razonamiento extendido (thinking) presente en la familia Qwen3.5, si bien no se confirma que esta submission lo conserve.
- Contexto largo nativo de 262 144 tokens, adecuado para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Análisis de documentos largos con imágenes: el contexto de 262 144 tokens permite procesar informes, contratos o manuales completos junto con sus figuras, extrayendo respuestas fundamentadas en el contenido visual y textual.
- Asistencia conversacional multi-turno: adecuado para chatbots de atención al cliente que mantienen historial extenso sin truncamiento, gracias a la ventana de contexto y al pipeline conversacional.
- Extracción de información de capturas y formularios: el codificador de visión permite transcribir y estructurar datos de imágenes en pipelines de digitalización documental.
- Prototipado de agentes con tool calling: la compatibilidad con endpoints y el formato Transformers facilitan su integración en orquestadores de agentes que requieren llamadas a funciones.
- Generación de código asistida en entornos de desarrollo: el modelo base reporta buen rendimiento en tareas de código, por lo que puede emplearse en autocompletado y revisión, siempre validando la calidad tras el fine-tuning.
- Investigación académica sobre compresión de modelos: al tratarse de una submission de compresión, es útil como referencia para estudiar el impacto de técnicas de compresión sobre un modelo multimodal de 4B.
- Despliegue en hardware de gama media: con 4B parámetros y cuantización adecuada, puede ejecutarse en GPUs de consumo para tareas de inferencia local.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Qwen3.5-4B según su model card; no se han publicado resultados específicos de este fine-tuning.

| Benchmark | Qwen3.5-4B | Qwen3.5-9B | GPT-OSS-20B | Qwen3-30BA3B-Thinking-2507 |
|---|---|---|---|---|
| MMLU-Pro | 79,1 | 82,5 | 74,8 | 80,9 |
| MMLU-Redux | no disponible en el extracto | no disponible en el extracto | 87,8 | 91,4 |

No se han publicado resultados de benchmarks específicos de esta submission en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 12-16 GB para contexto moderado.
- VRAM en cuantización de 8 bits: en torno a 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se distribuyen pesos cuantizados oficialmente en este repo.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia y contexto máximo; RTX 4090 (24 GB) para inferencia local en FP16 con contexto amplio.
- GPU de consumo: cabe en RTX 3090/4090 y, con cuantización, en GPUs de 8-12 GB como RTX 3060 Ti o RTX 4070.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp u Ollama requerirían conversión a GGUF no incluida en el repo.
- Latencia y throughput: no disponibles para este fine-tuning; la arquitectura híbrida del modelo base está diseñada para reducir latencia en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este fine-tuning (Qwen3.5-4B) | 4B | 262 144 | Apache 2.0 | Submission de compresión, sin benchmarks propios |
| Qwen3.5-9B | 9B | 262 144 | Apache 2.0 | Mayor rendimiento en MMLU-Pro (82,5) |
| GPT-OSS-20B | 20B | no disponible | no disponible | MMLU-Pro 74,8; mayor tamaño |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | Apache 2.0 | MMLU-Pro 80,9; mayor coste de despliegue |

## Limitaciones y advertencias

- No se documentan sesgos específicos del fine-tuning; los sesgos del modelo base Qwen3.5-4B son aplicables y no han sido auditados aquí.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- La model card reproduce la documentación del modelo base y no describe el proceso de compresión ni sus posibles degradaciones de calidad.
- No se confirma que las capacidades multimodales, el modo thinking o el soporte multilingüe se conserven tras el fine-tuning.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen.
- El repositorio tiene muy pocas descargas (35) y ningún like, lo que sugiere falta de validación comunitaria.
- No se ofrecen pesos cuantizados oficiales; el despliegue en hardware limitado requiere conversión manual.
- El nombre del repositorio indica un contexto académico o de curso, por lo que su robustez en producción no está garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DevanshR/25M2153-Final-Compression20-Submission01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
