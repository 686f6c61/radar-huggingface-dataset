# jacob361/ccc

## Resumen

`jacob361/ccc` es una reproducción no oficial del modelo cuantizado `RedHatAI/Qwen3.5-4B-quantized.w4a16`, un derivado de `Qwen/Qwen3.5-4B` en el que los pesos de las capas lineales del transformer se han convertido a INT4 manteniendo las activaciones en BF16 (esquema W4A16). El autor del repositorio es el usuario `jacob361`, mientras que la model card original atribuye el desarrollo de la cuantización a RedHatAI. El modelo resuelve el problema de desplegar un modelo multimodal de 4B parámetros con requisitos de memoria reducidos, pasando de 8,8 GB en BF16 a 5,2 GB en disco.

La arquitectura subyacente es Qwen3.5, un transformer con atención lineal en algunas capas y un codificador visual, capaz de procesar entradas de texto e imagen y generar texto. El contexto máximo declarado en los ejemplos de despliegue es de 262.144 tokens. La cuantización deja intactos el codificador visual, los embeddings y las capas de atención lineal, lo que explica que la reducción de tamaño sea del 41 % y no del 75 % teórico de una cuantización INT4 completa.

Es relevante porque permite ejecutar un modelo multimodal con capacidad de razonamiento en hardware más modesto mediante vLLM, manteniendo una recuperación de precisión alta en la mayoría de benchmarks (por encima del 97 % en GSM8k-Platinum, MMLU-Pro e IFEval), aunque con caídas más notables en tareas de razonamiento complejo como AIME 2025 y GPQA Diamond.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con atención lineal y codificador visual (image-text-to-text) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (según ejemplo de despliegue con `--max-model-len 262144`) |
| Tipos de cuantizacion | INT4 en pesos (W4A16), activaciones en BF16; codificador visual, embeddings y capas de atención lineal en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.5-4B` es un transformer multimodal que acepta texto e imágenes como entrada y produce texto. Incluye capas de atención lineal (identificadas en el recetario de cuantización como `linear_attn`) junto con capas de atención estándar, y un codificador visual separado (referenciado como `visual`). El modelo derivado no se ha reentrenado: es una cuantización post-entrenamiento del modelo original.

La cuantización se realizó con LLM Compressor aplicando el modificador `GPTQModifier` con esquema `W4A16`, usando 1.024 muestras de calibración del dataset Open-Platypus con longitud máxima de secuencia de 8.192 tokens y `dampening_frac=0.05`. Se excluyeron de la cuantización `lm_head`, `embed_tokens`, todas las capas `visual` y las capas `linear_attn`. El proceso es secuencial sobre `Qwen3_5DecoderLayer`. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes combinadas con texto (pipeline `image-text-to-text`).
- Razonamiento matemático: resultados del 94,5 % en GSM8k-Platinum y 83,7 % en Math 500.
- Razonamiento de nivel avanzado: 73,3 % en AIME 2025 y 73,1 % en GPQA Diamond tras la cuantización.
- Seguimiento de instrucciones: 86,1 % en prompt strict y 90,4 % en instruction strict de IFEval.
- Conocimiento general y profesional: 77,5 % en MMLU-Pro.
- Modo de razonamiento configurable mediante `--reasoning-parser qwen3` en vLLM.
- Compatibilidad con la API de OpenAI a través del servidor vLLM (`endpoints_compatible`).
- Soporte de despliegue en modo solo texto (`--language-model-only`) para reducir consumo de memoria.
- No se dispone de información sobre soporte explícito de tool calling, function calling o agentes multi-paso en la documentación proporcionada.

## Casos de uso

- Asistencia conversacional multi-turno: el modelo mantiene contexto de hasta 262.144 tokens, adecuado para sesiones largas de atención al cliente donde se acumulan historial e imágenes adjuntas.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, puede procesar capturas, diagramas o formularios junto con instrucciones textuales en un mismo prompt.
- Razonamiento matemático asistido: con un 83,7 % en Math 500 y 94,5 % en GSM8k-Platinum, es viable para tutores automáticos o verificación de cálculos en entornos educativos.
- Despliegue en infraestructura con VRAM limitada: al ocupar 5,2 GB en disco en INT4, puede servirse en GPUs de gama media mediante vLLM, reduciendo coste frente a la versión BF16 de 8,8 GB.
- Evaluación de instruction following en pipelines internos: su 90,4 % en IFEval instruction strict lo hace apto para tareas de transformación de texto con formato estricto (extracción, reescritura, clasificación guiada).
- Prototipado de aplicaciones multimodales con API compatible con OpenAI: el servidor vLLM expone `/v1/chat/completions`, lo que permite integrarlo en clientes existentes sin cambios de código.
- Filtrado y moderación de contenido con contexto largo: la ventana de 262.144 tokens permite analizar hilos completos o documentos extensos en una sola pasada.

## Benchmarks y rendimiento

Resultados publicados en la model card original (evaluados con lm-evaluation-harness y lighteval sobre vLLM, 0-shot):

| Categoria | Benchmark | Qwen3.5-4B (BF16) | Quantized W4A16 | Recuperacion |
|---|---|---|---|---|
| Instruction Following | GSM8k-Platinum | 94,5 % | 94,5 % | 100,1 % |
| Instruction Following | MMLU-Pro | 79,3 % | 77,5 % | 97,8 % |
| Instruction Following | IFEval prompt strict | 88,3 % | 86,1 % | 97,6 % |
| Instruction Following | IFEval instruction strict | 91,5 % | 90,4 % | 98,8 % |
| Reasoning | Math 500 | 84,5 % | 83,7 % | 99,1 % |
| Reasoning | AIME 2025 | 82,2 % | 73,3 % | 89,2 % |
| Reasoning | GPQA Diamond | 79,6 % | 73,1 % | 91,8 % |

La mayor pérdida se concentra en tareas de razonamiento de alta dificultad (AIME 2025 y GPQA Diamond), con recuperaciones del 89,2 % y 91,8 % respectivamente. En tareas de instrucciones y matemáticas de nivel medio la degradación es marginal.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2 GB solo para pesos; con overhead de KV cache y activaciones, se recomienda al menos 8-10 GB para contextos moderados. Contextos de 262.144 tokens requieren mucha más memoria para la KV cache.
- GPU recomendadas: A100 (40/80 GB) o H100 para contextos largos y despliegue multimodal completo; L40S o RTX 6000 Ada para producción con contexto medio.
- GPU de consumo: cabe en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) en modo solo texto y contextos reducidos. En GPUs de 8 GB no es viable con contexto largo.
- Opciones de despliegue: vLLM es el runtime soportado explícitamente (formato compressed-tensors). No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- El flag `--language-model-only` reduce el consumo al omitir el codificador visual cuando no se necesitan imágenes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jacob361/ccc (Qwen3.5-4B W4A16) | 4,54B | 262.144 | Apache 2.0 | safetensors INT4 | Multimodal, cuantizado, requiere vLLM |
| Qwen/Qwen3.5-4B (BF16) | 4,54B | 262.144 | Apache 2.0 | safetensors BF16 | Modelo base sin cuantizar, 8,8 GB |
| RedHatAI/Qwen3.5-4B-quantized.w4a16 | 4,54B | 262.144 | Apache 2.0 | safetensors INT4 | Original del que deriva este repositorio |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodales de ~4B cuantizados) en la documentación proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: `jacob361/ccc` es una reproducción del modelo de RedHatAI; no hay garantía de que los pesos sean idénticos al original ni de mantenimiento futuro (0 descargas, 0 likes en el momento de la consulta).
- Pérdida de precisión en razonamiento complejo: la cuantización degrada AIME 2025 del 82,2 % al 73,3 % y GPQA Diamond del 79,6 % al 73,1 %, lo que puede ser inaceptable en aplicaciones de razonamiento de alto nivel.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos: no se dispone de información sobre evaluación de sesgos del modelo base ni del cuantizado.
- Idiomas: la información de idiomas soportados no está disponible en la ficha; no se debe asumir cobertura multilingüe sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B; conviene revisar la licencia original enlazada.
- Dependencia de vLLM: el formato compressed-tensors limita el despliegue a runtimes compatibles; no se documenta soporte en llama.cpp u Ollama.
- Contexto largo: aunque se declaran 262.144 tokens, la KV cache a esa longitud exige hardware de gama alta; en GPUs de consumo habrá que reducir `--max-model-len`.
- El proceso de cuantización excluye atención lineal y codificador visual, por lo que el ahorro de memoria es menor que el teórico de INT4.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jacob361/ccc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Modelo original cuantizado (referenciado en la model card): https://huggingface.co/RedHatAI/Qwen3.5-4B-quantized.w4a16
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración Open-Platypus: https://huggingface.co/datasets/garage-bAInd/Open-Platypus
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- lighteval: https://github.com/huggingface/lighteval
