# GhaythMahadin/moss-transcribe-diarize-gguf

## Resumen

MOSS-Transcribe-Diarize es un modelo de reconocimiento automático del habla (ASR) de extremo a extremo desarrollado por OpenMOSS-Team, orientado a transcripción de audio largo con múltiples hablantes, diarización y marcas temporales. Esta ficha concreta describe la conversión a formato GGUF publicada por GhaythMahadin para su uso con `transcribe.cpp`, una implementación en C++ pensada para inferencia local y offline. El modelo base tiene 908.529.760 parámetros (aproximadamente 0,9B) y combina un encoder tipo Whisper-Medium con un decoder Qwen3-0.6B mediante inyección de tokens de audio.

La relevancia de esta conversión radica en que empaqueta un modelo de audio-LLM con diarización en cuantizaciones que van desde BF16 (1,83 GB) hasta Q4_K_M (617 MB), lo que permite ejecutarlo en hardware de consumo sin depender de frameworks Python pesados. El modelo emite directamente transcripciones en el formato canónico `[start][Sxx]text[end]`, donde las etiquetas de hablante y los timestamps son texto generado, no tokens especiales.

La licencia es Apache-2.0, heredada del modelo base, y el soporte de idiomas declarado se limita a inglés y chino. No es un modelo de streaming ni soporta traducción ni detección automática de idioma, según la información del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder Whisper-Medium (24 capas, d_model=1024) + bridge 4x temporal merge con VQAdaptor + decoder Qwen3-0.6B (28 capas) |
| Parametros totales | 908.529.760 (≈0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales del modelo base en formato no especificado en la información disponible |
| Entrada de audio | WAV mono a 16 kHz |
| Formato de salida | Texto diarizado `[start][Sxx]text[end]` |
| Timestamps | A nivel de segmento |
| Streaming | No |
| Traduccion | No |
| Deteccion de idioma | No |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de audio-LLM en la que un encoder tipo Whisper-Medium (24 capas, dimensión de modelo 1024) procesa la señal de audio y la proyecta mediante un bridge de fusión temporal 4x con VQAdaptor hacia un decoder Qwen3-0.6B de 28 capas, usando inyección de tokens de audio. La salida se genera en formato textual diarizado, de modo que los timestamps y las etiquetas de hablante (`[S01]`, `[S02]`, etc.) forman parte del texto generado y no dependen de tokens especiales.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card del autor de la conversión indica que el port se realizó desde el commit upstream `d7231bb` (fijado el 2026-07-12) y se validó contra el repositorio de referencia de OpenMOSS en el commit `3f5e15c` de transcribe.cpp. El modelo base fue publicado el 2026-07-09 según la sección de noticias de la model card original.

## Capacidades

- Transcripción de voz a texto offline en inglés y chino.
- Diarización de hablantes integrada en una sola pasada, con etiquetas anónimas `[S01]`, `[S02]`, etc.
- Generación de marcas temporales a nivel de segmento en el propio texto de salida.
- Procesamiento de audio largo y con múltiples hablantes (long-form multi-speaker transcription).
- Conciencia de eventos acústicos, según la descripción del modelo base.
- Entrada desde archivo de audio o vídeo (el modelo base acepta audio o vídeo; la conversión GGUF documenta entrada WAV mono a 16 kHz).
- No soporta streaming.
- No soporta traducción.
- No soporta detección automática de idioma.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo genera en una sola pasada la transcripción con etiquetas de hablante y timestamps de segmento, lo que permite producir actas con atribución de intervenciones sin un pipeline separado de diarización.
- Subtitulado y postproducción de audio: los timestamps por segmento facilitan la generación de subtítulos sincronizados para contenido en inglés o chino, aunque no se ofrece salida SRT nativa en la información disponible.
- Investigación cualitativa: transcripción de entrevistas semiestructuradas con múltiples informantes, manteniendo la separación de voces para el análisis posterior.
- Atención al cliente y centros de llamadas: procesamiento por lotes de grabaciones para extraer transcripciones diarizadas, útil para auditoría de calidad y análisis de conversaciones.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (617 MB) o Q5_K_M (700 MB), el modelo puede ejecutarse localmente en equipos sin GPU dedicada mediante transcribe.cpp, lo que encaja en escenarios de privacidad estricta donde el audio no puede salir del dispositivo.
- Documentación clínica o legal con requisitos de confidencialidad: la inferencia totalmente offline evita el envío de audio sensible a servicios en la nube, siempre que se cumplan las condiciones de la licencia Apache-2.0.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de un archivo de audio o vídeo para habilitar búsqueda por texto y por hablante.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech `test-clean` (2620 enunciados en inglés), con normalizador de texto estilo Whisper y jiwer 3.x, según la model card de la conversión:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 1,83 GB | 2,08% |
| F16 | 1,83 GB | 2,07% |
| Q8_0 | 987 MB | 1,93% |
| Q6_K | 768 MB | 1,96% |
| Q5_K_M | 700 MB | 1,99% |
| Q4_K_M | 617 MB | 2,59% |

La referencia del repositorio del autor en BF16 con decodificación greedy obtiene 2,07% con intervalo de confianza bootstrap del 95% de [1,82%, 2,40%]. El port BF16 queda en 2,08%, dentro de ese intervalo. El exceso de WER en Q4_K_M (2,59%) se atribuye a fallos puntuales de cola en 4 bits: 6 salidas vacías, 5 enunciados con deriva de idioma inglés a chino y 1 bucle de repetición de tokens de timestamp.

Rendimiento en tiempo real (RTF) reportado:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 28,1 |
| Apple M4 Max | CPU | 5,8 |
| AMD Ryzen 4750U | Vulkan | 3,0 |
| AMD Ryzen 4750U | CPU | 1,6 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al tratarse de un modelo de ASR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los ficheros GGUF oscila entre 617 MB (Q4_K_M) y 1,83 GB (BF16/F16), por lo que la huella de memoria es reducida.
- GPU recomendadas: no se especifican modelos concretos; se documentan pruebas en Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan y CPU).
- Cabe en GPU de consumo: sí, por el tamaño de las cuantizaciones; no se detallan modelos concretos como RTX 4090 en la información disponible.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Conversión de audio previa: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: RTF de 28,1 en Metal (M4 Max), 5,8 en CPU (M4 Max), 3,0 en Vulkan (Ryzen 4750U) y 1,6 en CPU (Ryzen 4750U).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Idiomas | Diarizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize (esta conversion) | 0,9B | no disponible | en, zh | Si | Apache-2.0 | GGUF |
| Alternativas de ASR con diarizacion | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay soporte documentado de castellano ni de otros idiomas.
- No es un modelo de streaming: requiere el audio completo o procesado por segmentos fuera del modelo.
- No realiza traducción ni detección automática de idioma.
- Los timestamps son a nivel de segmento, no a nivel de palabra.
- Riesgo de deriva de idioma (inglés a chino) documentado en la cuantización Q4_K_M, junto con salidas vacías y bucles de repetición de tokens de timestamp.
- Riesgo de alucinación inherente a los modelos generativos: el texto de salida, incluidos hablantes y timestamps, es generado y puede contener errores.
- La diarización usa etiquetas anónimas; no identifica personas reales.
- Licencia Apache-2.0 heredada del modelo base; se recomienda consultar la model card upstream para los términos completos.
- El repositorio de la conversión registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- La validación del port se realizó contra un commit concreto de transcribe.cpp (`3f5e15c`); cambios posteriores en la librería podrían afectar a la compatibilidad.
- No se documentan sesgos específicos del modelo en la información disponible.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/moss-transcribe-diarize-gguf
- Modelo base en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Commit upstream del modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize/commit/d7231bb
- Repositorio GitHub del modelo base: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper en arXiv: https://arxiv.org/abs/2601.01554
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f5e15c
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moss-transcribe-diarize.md
- Descargas GGUF (repositorio handy-computer): https://huggingface.co/handy-computer/MOSS-Transcribe-Diarize-gguf
