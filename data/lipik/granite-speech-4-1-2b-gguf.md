# lipik/granite-speech-4.1-2b-gguf

## Resumen

Granite Speech 4.1 2B es un modelo de voz a texto (ASR) y traducción de voz (AST) desarrollado por IBM, distribuido originalmente como `ibm-granite/granite-speech-4.1-2b`. Esta ficha cubre la conversión a GGUF publicada por el usuario `lipik` para el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp), pensada para inferencia totalmente offline en CPU y GPU de consumo. El modelo transcribe inglés, francés, alemán, español, portugués y japonés, y traduce entre el inglés y cada uno de esos cinco idiomas en ambos sentidos.

Arquitectónicamente es un audio-LLM de 2.313.228.092 parámetros (~2,31 mil millones): un encoder Conformer con atención Shaw de bloque local, un proyector Q-Former tipo BLIP-2 y un decodificador autorregresivo derivado de `granite-4.0-1b-base`. La versión 4.1 mantiene la arquitectura de 4.0-1b pero mejora puntuación, uso de mayúsculas y el sesgo por listas de palabras clave.

Su relevancia práctica está en el tamaño: los ficheros GGUF van de 1,60 GB (Q4_K_M) a 4,63 GB (BF16), con un WER de 1,29–1,37 % en LibriSpeech test-clean, y se ejecuta a varias veces el tiempo real incluso en CPU (RTF 1,4 en un Ryzen 7 4750U). Eso lo sitúa como alternativa ligera y con licencia Apache-2.0 a Whisper para despliegues on-premise.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder Conformer con Shaw attention de bloque local + proyector Q-Former (BLIP-2) + decodificador LLM autorregresivo `granite-4.0-1b-base` |
| Parámetros totales | 2.313.228.092 (~2,31 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (entrada de audio a 16 kHz; la model card no especifica límite de duración de audio ni ventana de contexto) |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ASR: en, fr, de, es, pt, ja. Traducción: en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (el modelo base publica safetensors) |
| Entrada de audio | WAV mono a 16 kHz |
| Librería de inferencia | transcribe.cpp (no está documentado soporte para llama.cpp, Ollama, vLLM o TGI) |
| Tamaño del repositorio | 2,6 GB |
| Modelo base | `ibm-granite/granite-speech-4.1-2b` (commit `8f4bb5f`, fijado el 2026-05-17) |
| Streaming | No soportado |
| Marcas de tiempo | No soportadas (`timestamps: none`) |
| Detección de idioma | No soportada (`lang_detect: false`) |

## Arquitectura y entrenamiento

El modelo combina tres bloques: un encoder Conformer con atención Shaw de bloque local que procesa el audio, un proyector Q-Former (arquitectura BLIP-2) que alinea las representaciones acústicas con el espacio de embeddings del LLM, y un decodificador autorregresivo inicializado desde un checkpoint intermedio de `granite-4.0-1b-base`. La alineación de modalidad se hizo sobre corpus públicos de audio con transcripciones como objetivo, es decir, el decodificador de texto se adaptó a voz en lugar de entrenarse desde cero.

El entrenamiento usó 174.000 horas de audio de corpus públicos para ASR y AST, más conjuntos sintéticos específicos para ASR en japonés, ASR con sesgo por palabras clave y traducción de voz. Respecto al predecesor `granite-4.0-1b-speech`, la 4.1 incorpora un encoder CTC de doble cabeza con salidas grafémicas y BPE junto con muestreo de importancia por tramas (*frame importance sampling*) para concentrar el cómputo en las partes informativas del audio. También añade puntuación y *truecasing* en todos los idiomas (incluida la capitalización de sustantivos en alemán) mediante un cambio de prompt, y mejora el sesgo por listas de palabras clave. La model card original menciona dos variantes adicionales que exploran otras capacidades y optimizaciones de inferencia, pero el texto disponible está truncado y no permite detallarlas.

## Capacidades

- Transcripción de voz a texto offline en inglés, francés, alemán, español, portugués y japonés.
- Traducción de voz bidireccional entre inglés y cada uno de los otros cinco idiomas (siempre a través del inglés; no hay traducción directa fr↔de, es↔pt, etc.).
- Puntuación y *truecasing* activables mediante prompt, incluida la capitalización de sustantivos propios del alemán.
- Sesgo por listas de palabras clave (*keyword list biasing*) para mejorar el reconocimiento de nombres propios, acrónimos y jerga técnica.
- Salida de transcripción de un único pasaje; no genera marcas de tiempo ni diarización.
- Sin detección automática de idioma: el idioma debe fijarse externamente.
- Sin modo conversacional, tool calling ni razonamiento multi-paso: el decodificador es un LLM de 1B afinado exclusivamente para ASR/AST.

## Casos de uso

- **Transcripción de reuniones y actas multilingües**: el modelo procesa un WAV de 16 kHz y devuelve texto con puntuación y mayúsculas, lo que reduce el post-procesado. Con RTF 12–33 en Apple Silicon y 2,8–5,8 en CPU/GPU de gama media, una reunión de una hora se transcribe en pocos minutos sin conexión a internet.
- **Subtitulado y traducción de contenido audiovisual**: combinado con `ffmpeg` para extraer y remuestrear el audio, permite generar guiones traducidos en ↔ es o en ↔ ja. Al no emitir marcas de tiempo, el alineado con el vídeo debe hacerse con una herramienta externa o mediante segmentación previa del audio.
- **Análisis de llamadas de atención al cliente**: despliegue on-premise con licencia Apache-2.0 sobre grabaciones de soporte en español o portugués; el sesgo por listas de palabras clave ayuda con nombres de producto, referencias de pedido y acrónimos internos.
- **Dictado clínico o legal con requisitos de privacidad**: al ejecutarse con transcribe.cpp en local, el audio no sale de la infraestructura, lo que encaja con entornos donde no se permite enviar datos a APIs externas. El binario Q4_K_M ocupa 1,60 GB y cabe en un portátil sin GPU dedicada.
- **Integración en aplicaciones de escritorio o de campo**: `transcribe-cli` se compila con CMake y se invoca por línea de comandos, lo que facilita empaquetarlo en herramientas de toma de notas, periodismo o inspección técnica donde no hay conectividad.
- **Preprocesado de corpus de investigación**: al tener WER medido y validación numérica contra la referencia de Transformers, sirve como base reproducible para comparar canalizaciones ASR o estudiar el efecto de la cuantización en la calidad de transcripción.
- **Generación de subtítulos para documentales en alemán**: el *truecasing* con capitalización de sustantivos evita el paso manual de corrección de mayúsculas que otros ASR requieren.

## Benchmarks y rendimiento

El único benchmark publicado en la información disponible es el WER sobre la partición completa de LibriSpeech test-clean (2.620 enunciados), con decodificación greedy y normalizador `EnglishTextNormalizer` de Whisper:

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,63 GB | 1,31 % |
| F16 | 4,63 GB | 1,32 % |
| Q8_0 | 2,56 GB | 1,32 % |
| Q6_K | 2,02 GB | 1,29 % |
| Q5_K_M | 1,83 GB | 1,33 % |
| Q4_K_M | 1,60 GB | 1,37 % |

La referencia BF16 local (1,31 %) queda 0,02 puntos por debajo del 1,33 % publicado por IBM, diferencia atribuida por el autor a normalización y dentro del solapamiento del intervalo de confianza bootstrap.

Rendimiento en factor de tiempo real (RTF; mayor es más rápido, 1,0 = tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,8 |
| Apple M4 | Metal | 12 |
| Apple M4 | CPU | 4,0 |
| AMD Ryzen 7 4750U | Vulkan | 2,8 |
| AMD Ryzen 7 4750U | CPU | 1,4 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni para WER en los idiomas distintos del inglés.

## Requisitos de hardware

- **VRAM estimada para inferencia** (estimación a partir del tamaño de los ficheros más el *overhead* del runtime; no publicada por el autor): ~2 GB con Q4_K_M, ~2,5 GB con Q6_K, ~3 GB con Q8_0 y ~5 GB con BF16/F16.
- **GPU recomendadas**: cualquier GPU con 4–6 GB de VRAM es suficiente para las cuantizaciones Q4_K_M a Q8_0. El autor reporta cifras en Apple M4 y M4 Max vía Metal y en una iGPU Vega de Ryzen 7 4750U vía Vulkan; no se han publicado cifras para A100, H100 ni RTX 4090.
- **GPU de consumo**: sí cabe en tarjetas de gama media y baja; con Q4_K_M (1,60 GB) el modelo entra en GPUs integradas y en sistemas con 8 GB de RAM unificada.
- **CPU**: viable sin aceleración, con RTF 1,4 en un Ryzen 7 4750U y 4,0–5,8 en Apple M4/M4 Max. Es la opción más lenta pero funcional para transcripción por lotes.
- **Opciones de despliegue**: exclusivamente transcribe.cpp (`transcribe-cli`), compilado con `cmake -B build && cmake --build build`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni servidores HTTP.
- **Latencia y throughput**: la latencia efectiva es la duración del audio dividida por el RTF; no hay streaming, por lo que no existe salida parcial. En M4 Max con Metal se pueden procesar del orden de 33 horas de audio por hora de cómputo.
- **Requisito de formato**: la entrada debe ser WAV mono a 16 kHz; para otras fuentes hay que convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

Los datos de los modelos comparables no provienen de la información proporcionada para este repositorio y deben verificarse en sus fichas oficiales.

| Modelo | Parámetros | Idiomas | Licencia | Marcas de tiempo | Streaming | Formato GGUF |
|---|---:|---|---|---|---|---|
| granite-speech-4.1-2b (esta ficha) | ~2,31 B | 6 (en, fr, de, es, pt, ja) | Apache-2.0 | No | No | Sí (transcribe.cpp) |
| granite-4.0-1b-speech (predecesor) | Mismo número de parámetros según la model card | 6 | Apache-2.0 | No disponible | No disponible | No disponible en esta información |
| Whisper large-v3 (OpenAI) | ~1,55 B | ~99 | MIT | Sí | No | Sí (whisper.cpp, entre otros) |
| Parakeet-tdt-0.6b-v2 (NVIDIA) | ~0,6 B | Inglés | CC-BY-4.0 | No disponible | No disponible | No disponible en esta información |

Frente al predecesor, la 4.1 aporta encoder CTC de doble cabeza, puntuación y *truecasing* configurables y mejor sesgo por palabras clave, manteniendo el mismo recuento de parámetros. Frente a Whisper large-v3, el punto fuerte es la licencia Apache-2.0, los seis idiomas con traducción integrada y el tamaño reducido; el punto débil es la cobertura lingüística y la ausencia de marcas de tiempo.

## Limitaciones y advertencias

- **Cobertura lingüística limitada**: solo seis idiomas. No soporta detección automática de idioma (`lang_detect: false`), por lo que el idioma debe fijarse en el prompt o en la invocación.
- **Traducción indirecta**: todas las traducciones pasan por el inglés; no hay conversión directa entre, por ejemplo, francés y alemán, lo que puede acumular errores en dos saltos.
- **Sin marcas de tiempo ni streaming**: no sirve para subtitulado con sincronización fina ni para dictado en vivo sin segmentar previamente el audio.
- **Riesgo de alucinación**: como todo audio-LLM, puede generar texto plausible en tramos de silencio, ruido o música. No se documenta ningún mecanismo de detección de habla ni umbral de confianza.
- **Validación sesgada al inglés limpio**: el único WER publicado es de LibriSpeech test-clean (lectura de audiolibros). No hay cifras para audio espontáneo, acentos, ruido ambiental ni para fr, de, es, pt o ja, por lo que el rendimiento real en producción puede degradarse de forma significativa.
- **Conversión reciente y sin validación comunitaria**: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta. La conversión se validó contra la referencia de Transformers en un único commit de transcribe.cpp (`275332d`), lo que limita la evidencia de robustez.
- **Discrepancia de autoría en los enlaces**: el repositorio pertenece a `lipik`, pero la model card enlaza los ficheros GGUF al espacio `handy-computer`. Conviene verificar la procedencia y los *hashes* de los binarios antes de desplegarlos.
- **Ecosistema de inferencia restringido**: los GGUF están pensados para transcribe.cpp; no se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI, lo que complica integrarlo en pilas de servicio ya existentes.
- **Formato de entrada rígido**: exige WAV mono a 16 kHz; no hay soporte documentado de otros contenedores ni de remuestreo interno.
- **Licencia**: el modelo se distribuye bajo Apache-2.0, pero los términos de los 174.000 horas de corpus públicos subyacentes deben revisarse en la ficha del modelo base antes de un uso comercial a gran escala.
- **Capacidad de razonamiento mínima**: el decodificador deriva de un LLM de 1B afinado solo para ASR/AST; no debe emplearse como asistente general, para tool calling ni para tareas de comprensión del texto transcrito.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/lipik/granite-speech-4.1-2b-gguf
- Modelo base original (IBM): https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Commit del modelo base sobre el que se hizo la conversión: https://huggingface.co/ibm-granite/granite-speech-4.1-2b/commit/8f4bb5f
- Repositorio de ficheros GGUF referenciado en la model card: https://huggingface.co/handy-computer/granite-speech-4.1-2b-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b.md
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Predecesor: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Decodificador de base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Identificadores arXiv presentes en las etiquetas del repositorio (contenido no verificado en la información disponible): arXiv:2310.02943, arXiv:2505.08699, arXiv:2603.11243, arXiv:2604.12398, arXiv:2604.22817, arXiv:2604.11269, arXiv:2603.08397
- Herramienta de conversión de audio: https://ffmpeg.org
