# amosgyamfi/Sophon-Realtime-4B-Flash-CoreAI

## Resumen

Sophon-Realtime-4B-Flash-CoreAI es una conversión al formato Core AI (`.aimodel`) del modelo de voz a voz adventists-ai/Sophon-Realtime-4B-Flash, publicada por el usuario amosgyamfi. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales se han transformado desde safetensors de PyTorch a grafos nativos de Core AI mediante la herramienta coreai-models de Apple, con cuantización int8 del thinker y el talker y fp16 en el resto de componentes. El objetivo es que una aplicación de macOS (CoreAI Studio) pueda cargar el modelo y ofrecer conversación por voz en tiempo real sobre hardware Apple.

La arquitectura es un sistema de speech-to-speech compuesto por cinco grafos: un codificador de audio basado en Whisper-large-v3 (ear), un decodificador Qwen3-4B de 36 capas que actúa como thinker, un talker Qwen3-TTS de 28 capas, un predictor de códigos de 5 capas que genera tramas de 80 ms y un decodificador de voz en streaming a 24 kHz. El thinker escucha el audio directamente, decide cuándo el usuario ha terminado de hablar (turn-taking) y redacta la respuesta mientras el talker la sintetiza de forma concurrente.

Su relevancia radica en dos factores: por un lado, demuestra un pipeline completo de voz conversacional con detección de turno integrada y baja latencia (primer audio de respuesta entre 0,26 y 0,41 s en un M4 Pro); por otro, ejemplifica el ecosistema incipiente de Core AI en macOS, una alternativa a MLX o Core ML para desplegar modelos localmente en Apple Silicon. La licencia Apache 2.0 y el soporte de inglés y chino lo hacen apto para uso comercial, aunque su alcance queda restringido al hardware y sistema operativo de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline speech-to-speech: encoder de audio (Whisper-large-v3) + decoder Qwen3-4B (thinker) + Qwen3-TTS (talker) + predictor de codigos + decoder de voz en streaming |
| Parametros totales | No disponible de forma agregada; el thinker es Qwen3-4B (36 capas) y el talker tiene 28 capas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | KV cache dinamica de hasta 2048 tokens en el thinker; hasta 1024 en el talker; ventana de atencion de 72 tramas en el decoder de voz |
| Tipos de cuantizacion | int8 (thinker y talker, simetrica por bloque de 32 en la dimension de entrada); fp16 (ear, code predictor, speech decoder); embeddings de texto int8 con escala fp16 por fila |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Grafos Core AI `.aimodel` (no safetensors ni GGUF); tablas de embeddings en ficheros planos; tokenizer Qwen incluido |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado ni ajustado en esta conversión: la model card indica explícitamente que no se reentrenaron ni fine-tuningaron pesos. La arquitectura subyacente es un sistema modular de voz a voz. El componente `ear` procesa bloques de 8 segundos de log-mel de Whisper-large-v3 (128 × 800) y produce 52 embeddings para el thinker. El thinker es un decoder Qwen3-4B de 36 capas con KV cache externo y longitud dinámica hasta 2048, que recibe audio y texto y genera la respuesta textual. El talker, basado en Qwen3-TTS con 28 capas, convierte esa respuesta en códigos de audio mientras se sigue generando. El `code_frame` fusiona en un único grafo los 15 pasos secuenciales del predictor de códigos, el muestreo top-50 con temperatura 0,7 y las búsquedas de embeddings de codebook, generando una trama completa de 80 ms. Finalmente, el `speech_decoder` transforma 16 códigos en una trama de 1920 muestras a 24 kHz con estado de convolución y ventana de atención de 72 tramas.

La conversión aplica cuantización int8 simétrica por bloques de 32 en thinker y talker, reorganiza el decoder de voz en un paso streaming de una sola trama con estado explícito y extrae las tablas de embeddings a ficheros planos. La model card reporta verificaciones de fidelidad frente al modelo original: 62,5 dB SNR en el decoder de voz, 51 dB SNR en el ear, 31-34 dB SNR en los logits del thinker int8 con el mismo token top-1 en cada paso, KL ≤ 0,019 en el talker y 104 dB SNR en el predictor de códigos, con los 120 códigos idénticos bajo el mismo ruido. El sistema original deriva de Qwen3-4B, Qwen3-ASR y Qwen3-TTS de Alibaba, todos bajo Apache 2.0.

## Capacidades

- Conversacion por voz en tiempo real: entrada de audio y salida de audio en un solo pipeline, con síntesis que empieza antes de que el texto esté completo.
- Deteccion de turno (turn-taking): el thinker decide cuándo el usuario ha terminado de hablar, con comprobaciones de 0,2 a 1,5 s.
- Generacion de texto y razonamiento: hereda las capacidades del decoder Qwen3-4B.
- Sintesis de voz (TTS) con cuatro vectores de hablante incluidos: `chelsie_en`, `chelsie_zh`, `brand_en`, `brand_zh`.
- Procesamiento de audio de entrada mediante log-mel de Whisper-large-v3.
- Capacidades multilingues limitadas a ingles y chino, tanto en comprension como en sintesis.
- Integracion como bundle cargable en aplicaciones macOS mediante Core AI (CoreAI Studio, pestaña Speech → Conversation).
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la informacion disponible.

## Casos de uso

- Asistente de voz conversacional en macOS: el bundle se carga en CoreAI Studio y gestiona diálogos hablados multi-turno con detección de turno integrada, adecuado para prototipos de interfaces manos libres en Apple Silicon.
- Atencion al cliente por voz en ingles o chino: el pipeline mantiene contexto de hasta 2048 tokens en el thinker y responde con audio en menos de medio segundo tras iniciar la réplica, lo que permite conversaciones fluidas sin esperas perceptibles.
- Pruebas de concepto de speech-to-speech local: investigadores pueden evaluar el comportamiento de un sistema Qwen3 + Qwen3-TTS sin depender de APIs en la nube, con latencia de 1,5-2× tiempo real en un M4 Pro.
- Accesibilidad: lectura en voz alta de respuestas generadas con voces predefinidas en ingles y chino para aplicaciones de asistencia personal en macOS.
- Evaluacion de Core AI frente a MLX: la model card incluye comparaciones directas contra el decoder y encoder de referencia en MLX, útil para equipos que deciden qué runtime adoptar en macOS.
- Generacion de voz para prototipos de contenido: síntesis de locuciones en ingles y chino con dos voces por idioma, integrable en herramientas de creación de audio dentro del ecosistema Apple.
- Investigacion sobre cuantizacion int8 en decoders de audio: los datos de SNR y KL publicados permiten estudiar el impacto de la cuantización por bloques en modelos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card sí reporta métricas de fidelidad de la conversión y de rendimiento en hardware:

| Metrica | Resultado |
|---|---|
| Speech decoder: SNR frente al decoder de referencia MLX | 62,5 dB |
| Ear: SNR de embeddings frente al encoder de referencia MLX | 51 dB |
| Thinker int8: SNR de logits frente a fp32 | 31-34 dB (mismo token top-1 en cada paso) |
| Talker int8: divergencia KL frente a fp32 | ≤ 0,019 (mismos top-10 códigos) |
| Code frame: SNR de logits frente al modulo PyTorch fp32 | 104 dB (120 códigos idénticos con el mismo ruido) |
| Code frame compilado: log-probabilidad media | −3,46 (frente a −3,53 de las propias muestras fp32) |
| Generacion de voz en M4 Pro (48 GB) | 1,5-2× tiempo real |
| Comprobacion de turno | 0,2-1,5 s |
| Latencia hasta el primer audio de respuesta | 0,26-0,41 s |

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 7,8 GB en total; el thinker int8 pesa 4,0 GB, el talker int8 1,4 GB, el ear fp16 376 MB, el code predictor 335 MB, el speech decoder 233 MB y las tablas 680 MB. Se recomienda al menos 16 GB de memoria unificada para cargar el bundle completo con margen para el KV cache.
- GPU recomendadas: hardware Apple Silicon con GPU integrada; la model card cita un M4 Pro de 48 GB como referencia de pruebas. No se documentan GPU NVIDIA (A100, H100, RTX 4090) porque el formato `.aimodel` es específico de Core AI.
- Compatibilidad con GPU de consumo: el modelo está pensado para Macs con macOS 27 o posterior; no se indica soporte en GPUs de consumo de otros fabricantes.
- Opciones de despliegue: Core AI con coreai-models; la carga debe hacerse con preferencia de GPU y `expectFrequentReshapes = true`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario de los grafos.
- Latencia y throughput: generación de voz a 1,5-2× tiempo real en M4 Pro, comprobación de turno de 0,2-1,5 s y primer audio de respuesta a 0,26-0,41 s. Se advierte de que el compilador del Neural Engine falla con el talker int8 en macOS 27.3, por lo que se recomienda ejecutar en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Sophon-Realtime-4B-Flash-CoreAI | Thinker Qwen3-4B + talker 28 capas | 2048 (thinker), 1024 (talker) | en, zh | Apache 2.0 | Core AI `.aimodel`, macOS 27+ |
| adventists-ai/Sophon-Realtime-4B-Flash (original) | Mismos pesos | 2048 (thinker), 1024 (talker) | en, zh | Apache 2.0 | Safetensors PyTorch, referencia MLX |
| Qwen3-4B (modelo base del thinker) | 4B | No disponible en la informacion proporcionada | Multilingue amplio | Apache 2.0 | Safetensors, GGUF, multiples runtimes |
| Qwen3-TTS (modelo base del talker) | No disponible | No disponible | No disponible | Apache 2.0 | Safetensors |

La comparación con alternativas de speech-to-speech fuera del ecosistema Qwen no está disponible en la informacion proporcionada; no se han encontrado datos de rendimiento comparables publicados en la model card.

## Limitaciones y advertencias

- Solo funciona en macOS 27 o posterior con Core AI; no es portable a otros runtimes ni sistemas operativos sin reconversión.
- Idiomas limitados a ingles y chino; no hay soporte documentado de castellano ni de otras lenguas.
- El compilador del Neural Engine falla con el talker int8 en macOS 27.3, lo que obliga a ejecutar en GPU y limita el aprovechamiento del hardware específico de IA de Apple.
- La longitud de contexto efectiva es de 2048 tokens en el thinker, lo que restringe conversaciones muy largas o documentos extensos.
- Riesgo de alucinación inherente al decoder Qwen3-4B, no cuantificado en la model card; no se han publicado evaluaciones de sesgo ni de robustez.
- Solo hay cuatro voces predefinidas (dos por idioma); no se documenta clonación de voz ni voces adicionales.
- El modelo no ha sido reentrenado en esta conversión: hereda cualquier limitación de los pesos originales y de los modelos base Qwen3.
- El autor del bundle es un usuario individual (amosgyamfi) y no el equipo original; conviene validar la fidelidad de la conversión antes de usarla en producción.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la sección 4(b) obliga a mantener los avisos de modificación; deben conservarse `LICENSE` y `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amosgyamfi/Sophon-Realtime-4B-Flash-CoreAI
- Modelo base original: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Repositorio del motor original: https://github.com/adventists-ai/sophon-realtime
- Herramienta de conversión de Apple: https://github.com/apple/coreai-models
