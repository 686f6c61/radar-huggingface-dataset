# lipik/SenseVoiceSmall-gguf

## Resumen

SenseVoiceSmall es un modelo de reconocimiento automático del habla (ASR) desarrollado por FunAudioLLM (equipo de Alibaba). Se trata de un encoder SAN-M de 234 millones de parámetros con una única cabeza CTC sobre un vocabulario SentencePiece de 25.055 tokens, concebido no solo para transcribir, sino también para identificar el idioma hablado, reconocer emociones y detectar eventos acústicos. Su relevancia radica en que ofrece transcripción multilingüe de alta precisión con un coste computacional muy bajo, lo que lo hace apto para despliegue en CPU y dispositivos de gama consumer.

La ficha que nos ocupa no es el modelo original, sino una conversión a formato GGUF realizada por el usuario `lipik` para su uso con `transcribe.cpp`, una implementación en C++ derivada del ecosistema de llama.cpp adaptada a modelos de voz. Esta conversión permite ejecutar el modelo de forma totalmente offline en hardware modesto, con cuantizaciones que van desde F32 (893 MB) hasta Q4_K_M (139 MB), manteniendo una tasa de error de palabra (WER) prácticamente idéntica a la del modelo en precisión completa.

El modelo base fue entrenado con más de 400.000 horas de audio y soporta más de 50 idiomas según la documentación original, aunque esta conversión declara explícitamente cinco: chino mandarín, cantonés, inglés, japonés y coreano. No es un modelo de streaming, no traduce y no incluye segmentación automática de audio largo: cada llamada admite como máximo 30 segundos de audio WAV mono a 16 kHz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAN-M (encoder) con cabeza CTC única |
| Parametros totales | 234.000.287 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (ventana de audio de 30 s por llamada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh, yue, en, ja, ko (el modelo base declara más de 50) |
| Licencia | other (FunASR MODEL_LICENSE, heredada del modelo base) |
| Formato de pesos | GGUF (para transcribe.cpp); safetensors en el modelo base |
| Vocabulario | SentencePiece, 25.055 tokens |
| Entrada de audio | WAV mono 16 kHz, máximo 30 s por llamada |
| Modelo base | FunAudioLLM/SenseVoiceSmall (commit 3eb3b4ee) |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un encoder SAN-M (Self-Attention with Non-autoregressive Modeling) que procesa la señal acústica y la proyecta sobre una cabeza CTC no autorregresiva. Esta elección de diseño, frente a los decoders autorregresivos tipo Whisper, reduce drásticamente la latencia de inferencia y permite decodificación greedy en una sola pasada. La cabeza CTC emite además tokens especiales que codifican el identificador de idioma, etiquetas de emoción, eventos acústicos y un flag de normalización inversa de texto (ITN), activables mediante las opciones `--raw-tokens` e `--itn` de transcribe.cpp.

Según la documentación del modelo base, el entrenamiento se realizó con más de 400.000 horas de audio multilingüe, lo que explica su cobertura de más de 50 idiomas. No se detalla en la información disponible la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO (poco habituales en modelos ASR). La conversión GGUF fue validada numéricamente contra la implementación de referencia FunASR 1.3.1 en el commit `f094d28` de transcribe.cpp, con una desviación de solo +0,002 puntos porcentuales en WER respecto al baseline.

## Capacidades

- Transcripción de voz a texto offline en cinco idiomas declarados: chino mandarín, cantonés, inglés, japonés y coreano.
- Identificación automática del idioma hablado (LID) integrada en la propia cabeza CTC.
- Reconocimiento de emociones en el habla (SER), con etiquetas simples emitidas como tokens.
- Detección de eventos acústicos (AED), como música, risas o ruido de fondo.
- Normalización inversa de texto (ITN) opcional, que convierte cifras habladas en formato numérico.
- Decodificación CTC no autorregresiva, lo que se traduce en baja latencia.
- No soporta streaming.
- No soporta traducción entre idiomas.
- No genera marcas de tiempo (timestamps: none).
- No incluye segmentación automática de audio largo; el límite es de 30 segundos por llamada.

## Casos de uso

- **Transcripción de notas de voz en aplicaciones móviles**: el modelo Q4_K_M ocupa 139 MB y puede ejecutarse en CPU, lo que permite integrarlo en apps Android o iOS sin conexión a la nube, procesando clips de hasta 30 segundos.
- **Subtitulado offline de reuniones y entrevistas**: combinando el modelo con un paso previo de segmentación de audio en fragmentos de 30 segundos, se puede construir un pipeline de subtitulado local en inglés, japonés o chino sin depender de APIs externas.
- **Análisis de atención al cliente**: la capacidad de reconocimiento de emociones permite etiquetar llamadas grabadas con el estado emocional del hablante, útil para sistemas de control de calidad o detección de clientes insatisfechos.
- **Transcripción de contenido audiovisual multilingüe**: para creadores que publican en chino, japonés o coreano, el modelo permite generar transcripciones y detectar automáticamente el idioma de cada clip sin configuración manual.
- **Sistemas de dictado en entornos con hardware limitado**: gracias a las tasas de tiempo real medidas (RTF 289,5 con Metal en M4 Max y 51,5 en CPU del mismo equipo), el modelo puede alimentar funciones de dictado en tiempo real sobre hardware consumer.
- **Investigación en procesamiento de habla**: al ser una conversión GGUF ligera y numéricamente validada contra FunASR, sirve como banco de pruebas reproducible para experimentos de cuantización en modelos ASR.
- **Moderación de audio en plataformas comunitarias**: la detección de eventos acústicos y emociones permite filtrar o priorizar clips que contengan gritos, música o risas en pipelines de revisión.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 3,13 | 3,13 | 3,13 | 3,14 | 3,18 | 3,45 |
| Tamano (MB) | 893 | 449 | 241 | 187 | 164 | 139 |

| Metrica de velocidad | Metal (M4 Max) | CPU (M4 Max) | Vulkan (Ryzen 4750U) | CPU (Ryzen 4750U) |
|---|---:|---:|---:|---:|
| RTF (factor de tiempo real) | 289,5 | 51,5 | 32,5 | 15,5 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2.620 enunciados) con decodificación CTC greedy. El baseline de referencia es la ejecución propia de FunASR 1.3.1 sobre el mismo manifiesto: 3,13 % (IC 95 %: 2,93 %–3,34 %). El autor advierte que LibriSpeech es un benchmark en inglés y que el caso más fuerte de SenseVoice es el mandarín, para el cual recomienda AISHELL-1 (CER) como comprobación complementaria. El modelo base publica sus resultados solo como figuras PNG, sin cifras numéricas reproducibles en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero más grande (F32) ocupa 893 MB.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; también en Raspberry Pi y dispositivos similares.
- GPU recomendadas: no requiere GPU dedicada; con Metal en un Apple M4 Max se alcanza un RTF de 289,5 y con Vulkan en un Ryzen 4750U un RTF de 32,5.
- Despliegue: exclusivamente mediante `transcribe.cpp` (compilación con CMake); no hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama, ya que se trata de un modelo ASR y no de un LLM.
- Latencia y throughput: los RTF indicados implican que el modelo procesa entre 15 y 290 veces más rápido que el tiempo real según el hardware; un clip de 30 segundos se transcribe en fracciones de segundo.
- Requiere convertir el audio a WAV mono 16 kHz antes de la inferencia (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| SenseVoiceSmall (esta conversion) | 234 M | 5 declarados (50+ en el base) | 30 s por llamada | FunASR MODEL_LICENSE | GGUF |
| Whisper small (OpenAI) | 244 M | ~99 | 30 s | MIT | safetensors, GGUF, etc. |
| Whisper base (OpenAI) | 74 M | ~99 | 30 s | MIT | safetensors, GGUF, etc. |
| Parakeet CTC (NVIDIA) | no disponible | inglés | variable | no disponible | no disponible |

Frente a Whisper small, de tamaño casi idéntico, SenseVoiceSmall añade identificación de idioma, emociones y eventos acústicos en la misma pasada, y según la documentación del modelo base supera a Whisper en reconocimiento multilingüe. La contrapartida es una licencia más restrictiva (FunASR MODEL_LICENSE en lugar de MIT) y una cobertura de idiomas declarada mucho menor en esta conversión. Whisper, además, soporta marcas de tiempo y tareas de traducción, que SenseVoice no ofrece. No se dispone de datos numéricos comparativos de WER entre ambos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia `other` (FunASR MODEL_LICENSE): es imprescindible revisar los términos del modelo base antes de cualquier uso comercial; no es una licencia permisiva tipo MIT o Apache.
- Límite estricto de 30 segundos por llamada; no hay segmentación automática de audio largo, por lo que el pipeline debe trocear la entrada.
- No es un modelo de streaming: no puede transcribir audio en tiempo real mientras se captura.
- No traduce: solo transcribe en el idioma original.
- No genera marcas de tiempo, lo que dificulta el alineamiento con vídeo o subtítulos sincronizados.
- Cobertura de idiomas limitada en esta conversión a cinco lenguas; el rendimiento en idiomas distintos del mandarín puede ser inferior al declarado por el modelo base.
- Riesgo de alucinación inherente a los modelos CTC en segmentos con ruido o silencio; conviene aplicar umbrales de confianza y detección de voz previa.
- Sesgos no documentados en la información disponible; los modelos ASR suelen presentar peor rendimiento en acentos no representados en el corpus de entrenamiento.
- La conversión GGUF depende de una única implementación (`transcribe.cpp`); no hay ecosistema amplio de herramientas compatible.
- El repositorio tiene solo 25 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es escasa; conviene reproducir la validación numérica antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/lipik/SenseVoiceSmall-gguf
- Modelo base en Hugging Face: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Modelo base en ModelScope: https://www.modelscope.cn/models/iic/SenseVoiceSmall
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/sensevoice-small.md
- Repositorio oficial de SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Página del proyecto FunAudioLLM: https://fun-audio-llm.github.io/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/FunAudioLLM/SenseVoice
- Demo en ModelScope: https://www.modelscope.cn/studios/iic/SenseVoice
- Commit del modelo base utilizado: https://huggingface.co/FunAudioLLM/SenseVoiceSmall/commit/3eb3b4eeffc2f2dde6051b853983753db33e35c3
