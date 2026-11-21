# mochiexists528/ace-step-mlx-transcriber

## Resumen

ACE-Step Transcriber MLX (bf16) es una conversión al framework MLX de Apple del modelo ACE-Step/acestep-transcriber, un transcriptor de letras y estructura de canciones desarrollado por el equipo de ACE-Step. El modelo original se utilizó para etiquetar los datos de entrenamiento de ACE-Step v1.5 y es capaz de transcribir audio cantado y hablado en más de 50 idiomas, además de etiquetar secciones de la canción (`[Verse 1]`, `[Chorus]`, `[Bridge]`, `[Instrumental Break]`, etc.). Esta conversión concreta, publicada por el usuario mochiexists528, tiene como objetivo permitir la inferencia nativa en Apple Silicon sin dependencias de Python ni PyTorch en tiempo de ejecución.

Arquitectónicamente, el paquete contiene únicamente el componente *thinker* del checkpoint original basado en Qwen2.5-Omni-7B: un encoder de audio de estilo Whisper (0,64 B de parámetros) y el modelo de lenguaje Qwen2.5-7B. Se han eliminado el *talker*, el token2wav y la torre de visión del modelo multimodal original. El resultado es un modelo audio-text-to-text de aproximadamente 7,6 B de parámetros totales, con una ventana de audio de hasta 300 segundos a 16 kHz mono.

La relevancia de esta ficha radica en que documenta una conversión de precisión completa (bfloat16) pensada como referencia para generar variantes cuantizadas, con validación numérica frente a la implementación original en PyTorch. Es un caso de interés para desarrolladores que quieran ejecutar transcripción musical en hardware Apple sin depender del stack de Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio estilo Whisper (0,64 B) + LLM Qwen2.5-7B (solo thinker de Qwen2.5-Omni-7B) |
| Parametros totales | ~7,6 B (0,64 B encoder + ~7 B LM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de hasta 300 s a 16 kHz mono) |
| Tipos de cuantizacion | bf16 en este paquete; el autor menciona variantes cuantizadas derivadas (int4 con recuperación de bucles evaluado) |
| Idiomas soportados | 50+ idiomas (según model card del modelo base) |
| Licencia | MIT (pesos ACE-Step); componente Qwen2.5-Omni bajo Apache 2.0 |
| Formato de pesos | safetensors (encoder.safetensors + shards lm-*.safetensors), layout propio |

## Arquitectura y entrenamiento

El modelo es una adaptación multimodal audio-texto que combina un encoder de audio de estilo Whisper con un decoder de lenguaje Qwen2.5-7B. En esta conversión MLX se conserva exclusivamente el *thinker*: el encoder procesa el audio (16 kHz mono, hasta 300 s) y el LLM genera la transcripción y las etiquetas de sección. Se han descartado el *talker* (generación de habla), el vocoder token2wav y la torre de visión, por lo que el paquete no puede generar audio ni procesar imágenes.

No se dispone de información detallada sobre el dataset de entrenamiento original (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada. El modelo base fue empleado por ACE-Step para etiquetar datos de entrenamiento de ACE-Step v1.5, lo que sugiere un uso intensivo en anotación musical. La innovación técnica destacable de esta conversión es la validación numérica frente a PyTorch: error relativo en log-mel de 1,7-2,1e-4, similitud coseno de 0,995-0,998 en la salida del encoder, argmax idéntico en el primer paso de decodificación en 6/6 canciones y WER mediano del 0,2 % frente a la referencia. Además, el runtime MLX Swift implementa una recuperación de bucles (*loop recovery*) que rebobina y bloquea los tokens cuando el modelo entra en un bucle de vocalización.

## Capacidades

- Transcripción de audio cantado y hablado en más de 50 idiomas.
- Etiquetado automático de estructura musical: `[Verse 1]`, `[Chorus]`, `[Bridge]`, `[Instrumental Break]`, etc.
- Procesamiento de audio de hasta 300 segundos por pasada, a 16 kHz mono.
- Generación de texto a partir de audio (pipeline audio-text-to-text).
- Recuperación de bucles de vocalización mediante lógica de runtime (rebobinado y bloqueo de tokens).
- Ejecución nativa en Apple Silicon mediante MLX Swift, sin Python ni PyTorch en tiempo de ejecución.
- No soporta tool calling, agentes, visión ni generación de audio (componentes eliminados en esta conversión).

## Casos de uso

- **Generación de letras sincronizadas para karaoke**: el modelo transcribe la letra cantada y etiqueta secciones (`[Verse]`, `[Chorus]`), lo que permite alinear letras con la estructura de la canción para herramientas de karaoke o visualizadores.
- **Etiquetado de datasets musicales**: al ser el mismo modelo usado para etiquetar los datos de ACE-Step v1.5, es adecuado para anotar corpus de canciones con letras y estructura de secciones antes de entrenar modelos generativos de música.
- **Búsqueda y catalogación de archivos de audio**: transcribir letras permite indexar bibliotecas musicales por contenido textual y por tipo de sección, facilitando búsquedas semánticas sobre audio.
- **Investigación en transcripción musical multilingüe**: con soporte para 50+ idiomas, sirve para estudios comparativos de ASR sobre material cantado en distintas lenguas.
- **Prototipado en Apple Silicon**: desarrolladores que trabajan en macOS pueden integrar el modelo en apps nativas Swift mediante MLX, sin desplegar infraestructura Python.
- **Análisis de estructura para producción musical**: detectar puentes, estribillos e interludios instrumentales ayuda a tareas de edición, remezcla o generación de versiones.
- **Evaluación de calidad de conversiones MLX**: este paquete bf16 sirve como referencia para validar variantes cuantizadas (int4) derivadas, comparando WER y etiquetado de secciones.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Error relativo log-mel (MLX bf16 vs PyTorch bf16) | 1,7-2,1e-4 |
| Similitud coseno salida encoder | 0,995-0,998 |
| Primer paso de decodificación (argmax idéntico) | 6/6 canciones |
| WER mediano transcripción vs PyTorch | 0,2 % |
| Acierto de líneas vs letra de referencia (int4 con loop recovery, 46 canciones) | 89,8 % |
| Etiquetas de sección correctas (int4) | 86,6 % (SongPrep-7B: 63,1 %) |
| Tiempo total (Apple M5 Max, canción de ~3 min, sin carga) | 31,7 s |
| Memoria pico (bf16) | 15,5 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo está especializado en transcripción de audio.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~15,5 GB en bf16 para una canción de 3 minutos (medido en Apple M5 Max).
- GPU recomendadas: Apple Silicon de gama alta (M5 Max medido); no se documenta soporte para GPU NVIDIA en este paquete MLX.
- Cabe en GPU consumer: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada; en GPUs NVIDIA consumer no aplica esta conversión (requiere MLX).
- Opciones de despliegue: MLX Swift (runtime propio del autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: 31,7 s para una canción de ~3 minutos en M5 Max bajo carga compartida (cifra pesimista según el autor); memoria pico de 15,5 GB.
- Tamaño en disco: 15,4 GB (bf16); el repositorio completo ocupa 16,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ACE-Step Transcriber MLX (este) | ~7,6 B | 300 s | 50+ | MIT | safetensors (MLX) |
| ACE-Step/acestep-transcriber (original) | ~7,6 B | 300 s | 50+ | MIT | PyTorch/Transformers |
| SongPrep-7B | ~7 B | no disponible | no disponible | no disponible | no disponible |
| Qwen2.5-Omni-7B | ~7 B | no disponible | multilingüe | Apache 2.0 | safetensors |

La comparativa con SongPrep-7B se basa únicamente en el dato de etiquetado de secciones aportado por el autor (86,6 % frente a 63,1 %); no se dispone de más especificaciones de ese modelo en la información proporcionada.

## Limitaciones y advertencias

- **Bucles de vocalización**: en algunas canciones el modelo entra en un bucle sobre vocalizaciones ("ah-ah-ah...") y deja de transcribir; el runtime MLX implementa recuperación, pero el comportamiento subyacente persiste (también ocurre en PyTorch).
- **Componentes eliminados**: no hay visión, generación de audio ni *talker*; el modelo solo transcribe audio a texto.
- **Contexto de audio limitado**: máximo 300 segundos por pasada; canciones más largas requieren segmentación manual.
- **Idiomas no verificados**: aunque el modelo base declara 50+ idiomas, no se aportan métricas por idioma ni lista concreta.
- **Sesgos**: no se documentan sesgos específicos; al ser un fine-tune de Qwen2.5, puede heredar sesgos del modelo base.
- **Riesgo de alucinación**: en pasajes instrumentales o coros densos puede generar texto inventado o etiquetas incorrectas.
- **Licencia**: los pesos son MIT, pero el componente Qwen2.5-Omni subyacente es Apache 2.0; conviene revisar ambas licencias para uso comercial.
- **Madurez**: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin comunidad ni soporte documentado.
- **Hardware restringido**: dependencia de MLX limita el despliegue a Apple Silicon; no hay soporte para CUDA.

## Enlaces

- [Hugging Face: mochiexists528/ace-step-mlx-transcriber](https://huggingface.co/mochiexists528/ace-step-mlx-transcriber)
- [Modelo base: ACE-Step/acestep-transcriber](https://huggingface.co/ACE-Step/acestep-transcriber)
- [Modelo subyacente: Qwen/Qwen2.5-Omni-7B](https://huggingface.co/Qwen/Qwen2.5-Omni-7B)
