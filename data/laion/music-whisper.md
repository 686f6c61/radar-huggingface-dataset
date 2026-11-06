# laion/music-whisper

## Resumen

Music Whisper es un ajuste fino (full fine-tune) del modelo openai/whisper-small, desarrollado por LAION, especializado en la generación de descripciones textuales de fragmentos musicales (music captioning). A diferencia del uso habitual de Whisper para transcripción de voz, este modelo reutiliza la arquitectura encoder-decoder para producir pies de texto estructurados que describen el sonido global, la instrumentación, el tempo, el género, el estado de ánimo y el tipo de vocalista de una pista de audio. Forma parte junto a un benchmark de percepción del release del paper LAION-Tunes (NeurIPS 2026, Evaluations & Datasets Track).

El modelo cuenta con 241.734.912 parámetros (242M) y hereda el contexto de audio de Whisper Small, con una longitud objetivo de caption de hasta 448 tokens (la ventana de decodificación del modelo base). Se ha entrenado mediante destilación de conocimiento desde Gemini Flash 2.0 sobre 2,91 millones de clips musicales de 3 a 30 segundos generados con Suno, procedentes del dataset laion/captioned-ai-music-snippets. Además de generar captions, el estado del encoder promediado (768 dimensiones) sirve como huella de audio (audio fingerprint) del dataset LAION-Tunes.

Su relevancia radica en ofrecer un modelo abierto (Apache 2.0) y ligero para descripción automática de música, una tarea con menos recursos abiertos que la transcripción de voz, y en su doble uso como extractor de embeddings de audio para búsqueda y recuperación dentro del ecosistema LAION-Tunes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) ajustado para music captioning |
| Parámetros totales | 241.734.912 (242M) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible como ventana de tokens de texto; captions truncados al límite de 448 tokens de Whisper; audio de entrenamiento de 3 a 30 s |
| Tipos de cuantización | no disponible (pesos en safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder de 242M parámetros con encoder convolucional más capas de atención y decoder autorregresivo. El ajuste fino es completo (todos los pesos), no un adaptador. El objetivo de entrenamiento es entropía cruzada con teacher forcing sobre los tokens del caption, truncados al límite de 448 tokens de Whisper, con inferencia mediante `max_new_tokens=440`.

Los datos proceden de una destilación de conocimiento desde Gemini Flash 2.0, que generó captions estructurados en seis campos (Overall Sound, Instrumentation, Tempo, Genre, Mood, Vocals) para 2,91 millones de clips de Suno de 3 a 30 segundos, extraídos de nyuuzyou/suno y empaquetados en laion/captioned-ai-music-snippets. El entrenamiento usó AdamW con lr 1e-5, 500 pasos de warmup, decaimiento coseno, batch efectivo de 256 (16 por GPU × 8 GPUs × 2 pasos de acumulación) sobre 8× A100 con DDP, una pasada completa sobre los datos y checkpoints cada 5.000 pasos evaluados sobre un conjunto retenido de 200 clips.

Como innovación destacable, el estado medio-pooled del encoder (768 dimensiones) se documenta explícitamente como huella de audio del dataset LAION-Tunes, reutilizando el modelo como extractor de representaciones para búsqueda perceptual, no solo como generador de texto.

## Capacidades

- Generación de captions musicales descriptivos: sonido global, instrumentación, tempo (p. ej. BPM), género, mood y perfil vocal.
- Descripción de fragmentos de audio cortos (3 a 30 segundos) con salida de texto libre, no etiquetas rígidas.
- Extracción de embeddings de audio de 768 dimensiones mediante mean-pooling del encoder, útil como huella de audio.
- Generación de texto autorregresiva condicionada a audio (no transcripción de voz).
- Capacidades de tool calling / function calling: no documentadas, consideradas no disponibles.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas en la model card; no disponible.
- Capacidades especiales: modo de captioning estructurado en seis campos heredado del profesor; no se documenta vision ni audio-to-audio.

## Casos de uso

- Catalogación automática de bibliotecas musicales: generar descripciones textuales ricas para miles de pistas y facilitar la búsqueda semántica por género, instrumentación o mood sin etiquetado manual.
- Búsqueda y recuperación perceptual: usar el embedding de 768 dimensiones del encoder para indexar audio y recuperar pistas similares, tal y como se propone en el demo Tunes-Search de LAION.
- Etiquetado de datasets de música generada: enriquecer datasets de audio sintético (p. ej. clips de Suno de 3 a 30 s) con captions estructurados para entrenar otros modelos o filtrar por características.
- Recomendación musical basada en contenido: extraer representaciones del encoder para calcular similitud entre pistas y sugerir canciones con mood o instrumentación afines.
- Moderación y análisis de contenido: describir automáticamente fragmentos para detectar contenido explícito o clasificar por género y estado de ánimo en plataformas de audio.
- Investigación en evaluación perceptual: servir de componente para benchmarks de percepción musical dentro del ecosistema LAION-Tunes, comparando descripciones generadas con percepciones humanas.
- Generación de metadatos para producción audiovisual: describir clips musicales cortos para asignar automáticamente bandas sonoras a escenas por mood y tempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 242M parámetros, los pesos en fp32 ocupan alrededor de 1 GB; en fp16/bf16 aproximadamente 0,5 GB, con overhead adicional de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM; funciona con GPUs de datacenter (A100, H100) para lotes grandes y con GPUs consumer (RTX 3090, RTX 4090) para uso individual.
- Cabe en GPU consumer: sí, incluso en GPUs de gama media con 8–12 GB de VRAM en fp16; el entrenamiento del autor usó 8× A100 por el volumen de datos, no por el tamaño del modelo.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), y potencialmente vLLM, TGI o llama.cpp/GGUF si se generan cuantizaciones, aunque no se documentan conversiones oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laion/music-whisper | 242M | captions hasta 448 tokens; audio 3–30 s | Music captioning | apache-2.0 | Hugging Face |
| openai/whisper-small | 242M | transcripción de voz; audio de 30 s | ASR | apache-2.0 | Hugging Face / OpenAI |
| Whisper base (openai/whisper-base) | 74M | ASR; audio de 30 s | ASR | apache-2.0 | Hugging Face / OpenAI |

Comparado con su modelo base, music-whisper cambia la tarea de transcripción por descripción musical; frente a modelos ASR de menor tamaño como whisper-base, ofrece más parámetros y una salida estructurada en seis campos, aunque ambos comparten limitación a fragmentos de audio de 30 segundos. No se dispone de datos de benchmarks para comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre clips de 3 a 30 segundos; no está diseñado para pistas completas de varios minutos.
- El modelo ha aprendido de captions generados por Gemini Flash 2.0, por lo que puede heredar sesgos, estilo verboso y errores del profesor, incluida la tendencia a inventar detalles no presentes en el audio (alucinación descriptiva).
- Uso previsto para música generada con Suno; su rendimiento en música real, grabaciones con ruido o audio no musical no está documentado.
- No se documentan los idiomas soportados; no hay garantía de salidas multilingües aunque Whisper base es multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del ecosistema de datasets y del paper LAION-Tunes; conviene revisar los términos de los datos fuente (nyuuzyou/suno) para usos derivados.
- El contexto de caption está limitado a 448 tokens, lo que puede truncar descripciones de pistas ricas o con múltiples secciones.
- No apto para transcripción de voz ni para tareas ASR generales; el ajuste fino puede degradar esa capacidad.
- Madurez limitada: solo 396 descargas y 7 likes en el momento de la consulta; pocos informes independientes de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/music-whisper
- Dataset de entrenamiento: https://huggingface.co/datasets/laion/captioned-ai-music-snippets
- Dataset fuente de clips Suno: https://huggingface.co/datasets/nyuuzyou/suno
- Dataset LAION-Tunes: https://huggingface.co/datasets/laion/laion-tunes
- Repositorio de código: https://github.com/LAION-AI/tunes
- Demo Tunes-Search: https://projects.laion.ai/tunes/search-tunes/
- Modelo base: https://huggingface.co/openai/whisper-small
