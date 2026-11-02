# jacob361/aaa

## Resumen

`jacob361/aaa` es la publicación en HuggingFace de una cuantización INT8 del modelo multimodal Qwen3.5-4B, desarrollada por RedHatAI mediante LLM Compressor y empaquetada con el formato `compressed-tensors` para su despliegue en vLLM. El modelo base es Qwen/Qwen3.5-4B, un transformer multimodal de tipo image-text-to-text con 4.539.265.536 parámetros, y esta versión cuantizada reduce el peso en disco de 8,8 GB (BF16) a 6,1 GB manteniendo pesos y activaciones de las capas lineales de los bloques transformer en INT8.

La relevancia de esta ficha radica en que demuestra el flujo de cuantización W8A8 sobre un modelo multimodal de última generación: solo se cuantizan los operadores lineales del decoder, mientras que el encoder visual, los embeddings de tokens y las capas de atención lineal permanecen en BF16. Esto permite servir el modelo con hasta 262.144 tokens de contexto en vLLM con una penalización de precisión mínima (recuperación superior al 99 % en la mayoría de benchmarks publicados).

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor de la publicación (jacob361) no coincide con el desarrollador original de la cuantización (RedHatAI). La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas de atención lineal; clase `Qwen3_5ForConditionalGeneration` |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según el comando de despliegue de vLLM) |
| Tipos de cuantización | INT8 en pesos y activaciones (W8A8) para operadores lineales; BF16 en encoder visual, embeddings y atención lineal |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (INT8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer multimodal que acepta texto e imagen como entrada y genera texto. La arquitectura incluye un encoder visual, embeddings de tokens, bloques decoder con capas de atención lineal y capas lineales convencionales, además de un `lm_head`. La cuantización aplicada por RedHatAI utiliza `GPTQModifier` con esquema W8A8 sobre los operadores lineales, con `sequential_targets=["Qwen3_5DecoderLayer"]`, `dampening_frac=0.01` y una lista de capas ignoradas que excluye `lm_head`, `embed_tokens`, `visual`, `model.visual` y `linear_attn`. El proceso de calibración emplea 512 muestras del dataset Open-Platypus con longitud máxima de secuencia de 2048 tokens.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá de la propia cuantización W8A8 y el soporte de decodificación con `reasoning-parser qwen3` en vLLM.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text).
- Razonamiento matemático y resolución de problemas (evaluado en GSM8k-Platinum, Math 500, AIME 2025).
- Seguimiento de instrucciones estrictas (evaluado en IFEval).
- Razonamiento de sentido común y conocimiento general (evaluado en MMLU-Pro y GPQA Diamond).
- Soporte de modo razonamiento mediante `--reasoning-parser qwen3` en vLLM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo razonamiento y el contexto largo lo permiten.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede recibir una imagen y una pregunta de texto y generar una respuesta descriptiva o analítica, gracias a su encoder visual y a su ventana de contexto de hasta 262.144 tokens.
- Análisis de documentos extensos con imágenes: con 262.144 tokens de contexto, se pueden procesar manuales, informes o contratos que incluyan figuras y tablas, manteniendo la coherencia a lo largo de todo el documento.
- Razonamiento matemático asistido: adecuado para tutores o asistentes que resuelven problemas paso a paso, con un rendimiento del 94,2 % en GSM8k-Platinum y 83,9 % en Math 500 tras la cuantización.
- Generación de código y explicaciones técnicas: aunque no se publican resultados de HumanEval, el modelo base Qwen3.5-4B está orientado a tareas de instrucción y puede integrarse en asistentes de programación.
- Despliegue en producción con vLLM: la cuantización W8A8 reduce el peso a 6,1 GB y permite servir el modelo con la API compatible con OpenAI, facilitando su integración en pipelines existentes.
- Evaluación de instrucciones y agentes: útil para construir sistemas que deban seguir instrucciones estrictas (IFEval 87,7 % prompt strict) en flujos de automatización.
- Procesamiento por lotes en GPU de gama media: al reducir el peso a 6,1 GB, el modelo puede desplegarse en GPUs con 16-24 GB de VRAM, ampliando el acceso a inferencia multimodal.

## Benchmarks y rendimiento

| Categoría | Benchmark | Qwen/Qwen3.5-4B | RedHatAI/Qwen3.5-4B-quantized.w8a8 | Recuperación |
|---|---|---|---|---|
| Instruction Following | GSM8k-Platinum (0-shot) | 94,5 % | 94,2 % | 99,7 % |
| Instruction Following | MMLU-Pro (0-shot) | 79,3 % | 79,0 % | 99,6 % |
| Instruction Following | IFEval — prompt strict (0-shot) | 88,3 % | 87,7 % | 99,3 % |
| Instruction Following | IFEval — instruction strict (0-shot) | 91,5 % | 91,2 % | 99,7 % |
| Reasoning | Math 500 (0-shot) | 84,5 % | 83,9 % | 99,3 % |

Los resultados de AIME 2025 y GPQA Diamond no están completos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,1 GB solo para pesos en INT8; con overhead de activaciones y caché KV para contexto largo, se recomienda al menos 16 GB de VRAM para contexto moderado y 24 GB o más para contexto de 262.144 tokens.
- GPU recomendadas: NVIDIA A100, H100, L40S y RTX 4090 para despliegues en producción; RTX 3090/4090 para desarrollo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con contexto reducido.
- Opciones de despliegue: vLLM (recomendado, con soporte de `compressed-tensors`), y potencialmente transformers con `compressed-tensors`; llama.cpp y Ollama no están confirmados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jacob361/aaa (Qwen3.5-4B W8A8) | 4.539 M | 262.144 | Apache 2.0 | safetensors INT8 | Cuantización W8A8 para vLLM |
| Qwen/Qwen3.5-4B (BF16) | 4.539 M | 262.144 | Apache 2.0 | safetensors BF16 | Modelo base sin cuantizar, 8,8 GB |
| RedHatAI/Qwen3.5-4B-quantized.w8a8 | 4.539 M | 262.144 | Apache 2.0 | safetensors INT8 | Misma cuantización, publicado por el desarrollador original |

No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización INT8 puede introducir degradación en tareas no evaluadas, como generación de código o razonamiento visual, aunque la recuperación en los benchmarks publicados es superior al 99 %.
- El encoder visual, los embeddings y las capas de atención lineal permanecen en BF16, por lo que el ahorro de memoria es del 31 %, no del 50 % teórico.
- El repositorio tiene 0 descargas y 0 likes, y el autor de la publicación no es el desarrollador original de la cuantización; se recomienda verificar la integridad de los pesos antes de usarlos en producción.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base Qwen/Qwen3.5-4B.
- El despliegue está optimizado para vLLM; otros runtimes pueden no soportar el formato `compressed-tensors` de forma nativa.
- No se han publicado resultados de benchmarks para AIME 2025 ni GPQA Diamond en la información disponible.

## Enlaces

- [HuggingFace: jacob361/aaa](https://huggingface.co/jacob361/aaa)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE)
- [LLM Compressor](https://github.com/vllm-project/llm-compressor)
- [Dataset Open-Platypus](https://huggingface.co/datasets/garage-bAInd/Open-Platypus)
- [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)
- [lighteval](https://github.com/huggingface/lighteval)
