# KvcHub/KaiLu-3-Pro

## Resumen

KaiLu 3 Pro es un modelo de lenguaje conversacional de 1.034 millones de parámetros (1B) desarrollado desde cero por KvcHub. Se distribuye bajo licencia Apache 2.0 y está diseñado para ejecutarse en hardware modesto: ocupa aproximadamente 1,1 GB en cuantización GGUF Q8_0 y funciona en CPU, Apple Silicon o GPU consumer. El modelo emplea el layout de capas de LFM2 (24 capas de convolución corta con kernel 3 intercaladas con 12 capas de atención, una cada tres), aunque no contiene pesos de LFM2: fue entrenado íntegramente por KvcHub.

El modelo parte de una base de 329M parámetros preentrenada con 6,6B tokens y posteriormente se expandió a 1B mediante un ensanchamiento (hidden 1.024 a 1.536) y profundización (24 a 36 capas) que preserva la función, seguido de preentrenamiento adicional con Dolmino Mix y un proceso de fine-tuning con datos de instrucciones y razonamiento. Incluye un modo de razonamiento opcional que emite cadenas de pensamiento dentro de etiquetas ``.

Su relevancia radica en ser un modelo pequeño, completamente abierto y entrenado de forma transparente, pensado para despliegue local en entornos con recursos limitados. La ventana de contexto es corta (1.024 tokens de entrenamiento) y solo soporta inglés, lo que acota su uso a tareas conversacionales breves y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolución-atención (layout LFM2): 24 capas de convolución corta con kernel 3 y 12 capas de atención (una cada tres); transformer con SwiGLU |
| Parametros totales | 1.034.413.056 (safetensors); la model card indica 1.027.304.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits); pesos completos en bfloat16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), GGUF (Q8_0) |

Otros datos técnicos: anchura hidden de 1.536, feed-forward SwiGLU de 4.096, 24 cabezas de consulta y 6 de clave-valor (grouped-query attention), QK-norm, RoPE con theta 1.000.000, vocabulario de 32.768 tokens (BPE a nivel de byte entrenado por KvcHub) y embeddings de entrada y salida compartidos. Formato de implementación: `Lfm2ForCausalLM`. Tamaño del repositorio: 3,2 GB.

## Arquitectura y entrenamiento

La arquitectura combina capas de convolución corta (kernel 3) con capas de atención agrupada, siguiendo el layout de LFM2 pero entrenada desde cero. El proceso de construcción tuvo cinco fases: (1) base de 329M parámetros preentrenada con 6,6B tokens de FineWeb-Edu, Cosmopedia v2, SlimPajama-6B (sin Books3), FineMath, Wikipedia y OpenCoder annealing, seguida de fine-tuning en smol-smoltalk y DPO con UltraFeedback, HelpSteer2 y Anthropic HH-RLHF; (2) expansión que preserva la función para ensanchar y profundizar hasta 1B; (3) preentrenamiento adicional con Dolmino Mix (DCLM, StackExchange, peS2o, FLAN y matemáticas); (4) fine-tuning con Tulu 3 persona instruction-following, MetaMathQA, GSM8K, MMLU, ARC-Challenge, HumanEval y General-Knowledge, más ejemplos propios de razonamiento paso a paso, código y identidad; (5) DPO final (beta 0,1) con pares de UltraFeedback binarizado y Orca DPO pairs.

Como innovación destacable, el modelo incorpora un modo de razonamiento activable mediante mensaje de sistema (`Mode: reasoning=medium`) que produce cadenas de pensamiento dentro de `<think>...</think>`. El repositorio safetensors contiene además 6 tensores `vision_projector.*` de un complemento de imagen experimental que Transformers ignora y que no funciona de forma autónoma.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento paso a paso opcional mediante modo `<think>...</think>`.
- Resolución de problemas matemáticos (entrenado con MetaMathQA y GSM8K).
- Generación de código en varios lenguajes (entrenado con HumanEval y ejemplos propios).
- Conocimiento general y respuesta a preguntas (MMLU, ARC-Challenge, General-Knowledge).
- Seguimiento de instrucciones con personas (Tulu 3 persona instruction-following).
- Formato de chat con roles system/user/assistant y token de fin `<|endoftext|>` (token 0).
- Compatibilidad con endpoints y despliegue vía Ollama, llama.cpp y LM Studio.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión funcional ni audio.

## Casos de uso

- Asistente conversacional local en portátil: con 1,1 GB en GGUF Q8_0, el modelo se ejecuta en CPU y ofrece respuestas rápidas para chat breve en inglés, útil para prototipos sin conexión.
- Despliegue en dispositivos de borde: su tamaño permite integrarlo en aplicaciones de escritorio o embebidas con Ollama o llama.cpp, sirviendo como asistente de ayuda contextual en herramientas ofimáticas.
- Generación de código asistida en local: puede completar fragmentos y explicar código en inglés, adecuado para entornos de desarrollo con requisitos de privacidad donde no se quiere enviar código a la nube.
- Educación y práctica de matemáticas: entrenado con MetaMathQA y GSM8K, puede resolver problemas aritméticos sencillos paso a paso y explicar el procedimiento en el modo de razonamiento.
- Filtrado y clasificación de texto breve: con contexto de 1.024 tokens, es apto para tareas de etiquetado, resumen de una frase o reescritura de mensajes cortos en pipelines por lotes.
- Base para experimentación e investigación: al ser Apache 2.0 y entrenado desde cero con receta documentada, sirve como punto de partida para estudiar arquitecturas híbridas convolución-atención o para fine-tuning con datos propios.
- Demos y entornos de prueba de API compatible con OpenAI: `llama-server` expone una API compatible en localhost, lo que facilita integrarlo en pruebas de integración sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no incluye puntuaciones de MMLU, ARC-Challenge ni HumanEval, y que esta omisión es deliberada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en GGUF Q8_0; unos 2,1 GB en bfloat16 (safetensors de 2,07 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q8_0; no se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, RTX 3060/4060, etc.) y en Apple Silicon.
- Ejecución en CPU: viable y rápida según el autor, especialmente en Apple Silicon.
- Opciones de despliegue: Ollama (`ollama run hf.co/KvcHub/KaiLu-3-Pro`), llama.cpp (`llama-cli`/`llama-server` con `--jinja -c 1024`), LM Studio y Transformers 4.54 o superior.
- Latencia y throughput: no disponibles de forma numérica; el autor describe el rendimiento como "rápido en CPU y más rápido en Apple Silicon o GPU".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| KaiLu 3 Pro | 1,03B | 1.024 tokens | Apache 2.0 | en | Arquitectura híbrida convolución-atención; razonamiento `<think>`; sin benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8.192 tokens (según versión) | Apache 2.0 | en (multilingüe parcial) | Mayor contexto; datos de benchmarks públicos disponibles |
| Llama 3.2 1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | multilingüe | Contexto mucho mayor; licencia con restricciones de uso |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | multilingüe | Mayor contexto y cobertura idiomática |

Los datos de los modelos comparables proceden de conocimiento general y no de la información proporcionada; conviene verificarlos en sus respectivas model cards. No se dispone de comparaciones de rendimiento con KaiLu 3 Pro porque este no publica benchmarks.

## Limitaciones y advertencias

- Modelo pequeño: comete errores factuales con seguridad aparente (la model card cita el ejemplo "Japan is the capital of Japan") y puede inventar detalles. No debe usarse para asesoramiento médico, legal o financiero.
- Memoria corta: entrenado con ventanas de 1.024 tokens, a menudo no usa información previa de la conversación (preguntado por el nombre del usuario justo después de dárselo, responde que no conoce datos personales) y puede contestar solo parte de una pregunta con varios apartados.
- Solo inglés: no soporta castellano ni otros idiomas.
- Temperatura baja recomendada (0 a 0,3); a 0,7 el modelo "divaga" según el autor.
- Sin benchmarks: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Los tensores `vision_projector.*` del safetensors no son funcionales de forma autónoma; la visión es experimental e inoperativa.
- Licencia Apache 2.0: permite uso comercial, pero los datasets de entrenamiento conservan sus propias licencias y términos, que deben revisarse.
- Sin soporte de tool calling ni de agentes multi-paso, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/KvcHub/KaiLu-3-Pro
- Sitio del autor: https://kvchub.com
- Descarga con CLI: `hf download KvcHub/KaiLu-3-Pro --local-dir KaiLu-3-Pro`
- Ejecución con Ollama: `ollama run hf.co/KvcHub/KaiLu-3-Pro`
- Repositorio de datasets citados (referencias en la model card): HuggingFaceFW/fineweb-edu, HuggingFaceTB/smollm-corpus, DKYoon/SlimPajama-6B, HuggingFaceTB/finemath, wikimedia/wikipedia, OpenCoder-LLM/opc-annealing-corpus, allenai/dolmino-mix-1124, HuggingFaceTB/smol-smoltalk, allenai/tulu-3-sft-personas-instruction-following, meta-math/MetaMathQA, openai/gsm8k, cais/mmlu, allenai/ai2_arc, openai/openai_humaneval, MuskumPillerum/General-Knowledge, HuggingFaceH4/ultrafeedback_binarized, Intel/orca_dpo_pairs, nvidia/HelpSteer2, Anthropic/hh-rlhf
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
