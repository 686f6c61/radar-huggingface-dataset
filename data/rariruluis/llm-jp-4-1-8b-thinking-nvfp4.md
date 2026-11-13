# rariruluis/llm-jp-4.1-8b-thinking-NVFP4

## Resumen

llm-jp-4.1-8b-thinking-NVFP4 es una versión cuantizada a 4 bits en formato NVFP4 del modelo llm-jp/llm-jp-4.1-8b-thinking, desarrollado originalmente por el consorcio LLM-jp (proyecto japonés de investigación en modelos de lenguaje a gran escala) y cuantizado por el usuario rariruluis. El modelo base es un transformer denso de aproximadamente 8.590 millones de parámetros, especializado en razonamiento con modo "thinking" y entrenado principalmente para inglés y japonés.

El problema que resuelve esta versión es el coste de memoria y cómputo del modelo original: los pesos pasan de unos 17 GB en BF16 a aproximadamente 7,1 GB en NVFP4, lo que permite desplegar el modelo en GPUs de consumo y en aceleradores con soporte nativo de FP4, como las GPUs NVIDIA Blackwell (por ejemplo, la GB10 del DGX Spark). La cuantización se realizó con llm-compressor 0.15.0 en el formato compressed-tensors, cuantizando todas las capas `Linear` del decodificador con pesos y activaciones en FP4 E2M1, tamaño de grupo 16 y escalas de grupo en FP8 E4M3, manteniendo `lm_head`, embeddings y normas en BF16.

Es relevante ahora porque combina tres tendencias: modelos de razonamiento con modo thinking explícito, cuantización de precisión ultra-baja (4 bits) con activaciones también cuantizadas, y despliegue optimizado para vLLM sobre hardware Blackwell. No obstante, el autor no ha publicado benchmarks de precisión sobre este checkpoint, por lo que su idoneidad en producción debe validarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama), con modo de razonamiento thinking |
| Parametros totales | 8.590.200.832 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens (configurado en el ejemplo de despliegue con vLLM) |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 en pesos y activaciones, grupo 16, escalas FP8 E4M3); resto en BF16 |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo base llm-jp-4.1-8b-thinking es un transformer denso de tipo decoder-only de unos 8.600 millones de parámetros, con atención estándar y un modo de razonamiento ("thinking") que separa el análisis interno de la respuesta final. El modelo emplea un tokenizador propio (`llmjp4_tokenizer.py`) junto con un módulo de armonización (`llmjp4_harmony.py`) que gestiona los tokens de control del formato Harmony; es imprescindible activar `trust-remote-code` en cualquier runtime, ya que sin él `transformers` cae en un tokenizador genérico que inserta espacios entre los tokens de control y el texto, rompiendo los parsers de Harmony.

Esta versión cuantizada no reentrena el modelo: aplica cuantización post-entrenamiento con llm-compressor sobre todas las capas `Linear` del decodificador, usando 512 muestras de calibración del split `reasoning_medium` del dataset `llm-jp/llm-jp-4.1-thinking-sft-data` (conversaciones de post-entrenamiento del propio modelo, con turnos de usuario en japonés, análisis en inglés y respuestas finales en japonés), con longitudes de hasta 2.048 tokens por muestra. Los ficheros de tokenizador, plantilla de chat y helpers `llmjp4_*.py` se copian sin cambios del repositorio original. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Razonamiento explícito con modo thinking: el análisis se devuelve en `message.reasoning` y la respuesta final en `message.content`.
- Tool calling / function calling, con parser dedicado (`llmjp4`) y soporte de `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y uso como agente, gracias a la separación entre razonamiento y respuesta final.
- Formato Harmony para control de roles y turnos, con plantilla de chat incluida.
- Despliegue en vLLM con kernels NVFP4 nativos (`FlashInferCutlassNvFp4LinearKernel`) en GPUs Blackwell.
- Capacidades de visión, audio o multimodal: no disponibles en este checkpoint.

## Casos de uso

- Asistencia conversacional en japonés: el modelo gestiona diálogos multi-turno con contexto de hasta 65.536 tokens, adecuado para atención al cliente o soporte técnico en empresas japonesas, con respuestas finales en japonés y análisis interno en inglés.
- Agentes con tool calling: puede invocar funciones externas (por ejemplo, consultas meteorológicas, APIs internas) y devolver `tool_calls` estructurados con `finish_reason: "tool_calls"`, integrándose en orquestadores de agentes.
- Razonamiento asistido en documentación técnica: el modo thinking permite descomponer problemas complejos antes de responder, útil en tareas de análisis de incidencias o diagnóstico.
- Despliegue en hardware de borde o estaciones de trabajo: con unos 7,1 GB de pesos, cabe en GPUs de consumo y en aceleradores Blackwell como la GB10, permitiendo inferencia local sin depender de la nube.
- Prototipado de pipelines de razonamiento en vLLM: al usar compressed-tensors y parsers de llm-jp-vllm, sirve como banco de pruebas para flujos de razonamiento y tool calling antes de escalar a modelos mayores.
- Evaluación comparativa de cuantización: útil para medir la degradación de precisión de NVFP4 frente a BF16 en tareas de razonamiento en japonés e inglés, dado que el autor no publica benchmarks de exactitud.
- Servicio de inferencia de bajo coste: con aproximadamente 36 tokens/s de extremo a extremo en una DGX Spark (GB10) para una sola petición, es viable para cargas moderadas con latencia aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ningún benchmark de precisión sobre este checkpoint y recomienda evaluarlo para el caso de uso concreto antes de confiar en él.

Los únicos datos de rendimiento publicados son de despliegue: 256 tokens generados en 7,1 s para una sola petición (aproximadamente 36 tokens/s de extremo a extremo, incluyendo prefill) y 6,68 GiB de memoria ocupada por los pesos tras la carga, medidos en una NVIDIA DGX Spark (GB10, sm_121) con vLLM 0.32.0.

## Requisitos de hardware

- VRAM estimada: unos 6,68 GiB solo para los pesos tras la carga; hay que añadir la caché KV para el contexto configurado (hasta 65.536 tokens) y el overhead del runtime.
- GPU recomendadas: NVIDIA Blackwell con soporte NVFP4 (por ejemplo, GB10 del DGX Spark, sm_121); el kernel usado es `FlashInferCutlassNvFp4LinearKernel`.
- GPU de consumo: al ocupar alrededor de 7 GB en pesos, cabe en GPUs de consumo con 12 GB o más de VRAM, siempre que el runtime soporte NVFP4; en GPUs sin soporte nativo de FP4 el rendimiento puede degradarse o requerir emulación.
- Opciones de despliegue: vLLM 0.32.0 (probado con la imagen `vllm/vllm-openai:v0.32.0`), con `--trust-remote-code`, `--reasoning-parser llmjp4` y `--tool-call-parser llmjp4` mediante llm-jp-vllm. No se documenta soporte para llama.cpp, Ollama o TGI en esta versión.
- Latencia y throughput: aproximadamente 36 tokens/s de extremo a extremo para una petición única en DGX Spark (GB10), incluyendo prefill.
- Nota de compatibilidad: llm-jp-vllm 0.1.1 falla en vLLM 0.32 por un cambio de import (`make_tool_call_id` movido a `vllm.renderers.chat_utils`) y por la resolución del parser de razonamiento en el proceso del engine core; el autor proporciona un Dockerfile que parchea ambos problemas y registra los parsers como entry point `vllm.general_plugins`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm-jp-4.1-8b-thinking-NVFP4 (este) | 8,59 B | 65.536 tokens | NVFP4 (compressed-tensors), vLLM en Blackwell | Apache 2.0 | Hugging Face, 0 descargas |
| llm-jp/llm-jp-4.1-8b-thinking (base) | 8,59 B | No disponible en la información proporcionada | BF16, transformers | Apache 2.0 | Hugging Face |
| Alternativas de 8 B en FP4/INT4 para vLLM | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Sin benchmarks de precisión: el autor no ha medido la degradación de exactitud frente al modelo BF16; la cuantización NVFP4 afecta a pesos y activaciones de todas las capas `Linear`, lo que puede degradar tareas sensibles.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido incorrecto, especialmente en dominios especializados; el modo thinking no elimina este riesgo.
- Cobertura lingüística limitada: solo inglés y japonés; el rendimiento en castellano no está garantizado ni evaluado.
- Requiere `trust-remote-code`: el tokenizador y los helpers de Harmony son código remoto; sin ellos los parsers fallan. Conviene revisar `llmjp4_tokenizer.py` y `llmjp4_harmony.py` antes de habilitarlo.
- Dependencia de hardware y runtime: diseñado para vLLM en GPUs Blackwell con soporte NVFP4; en otras GPUs el soporte puede ser parcial o inexistente.
- Incompatibilidad conocida de llm-jp-vllm 0.1.1 con vLLM 0.32: requiere el parche documentado en el Dockerfile del autor.
- Licencia Apache 2.0: permite uso comercial, pero al derivar del modelo base conviene revisar también los términos del modelo original y del dataset de calibración.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación mínimo; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rariruluis/llm-jp-4.1-8b-thinking-NVFP4
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking
- Dataset de calibración: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-thinking-sft-data
- llm-compressor: https://github.com/vllm-project/llm-compressor
- llm-jp-vllm: https://github.com/llm-jp/llm-jp-vllm
- LLM-jp-4 cookbook: https://github.com/llm-jp/llm-jp-4-cookbook
- vLLM: https://github.com/vllm-project/vllm
