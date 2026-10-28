# lipik/whisper-large-v3-gguf

## Resumen

`lipik/whisper-large-v3-gguf` es una conversión a formato GGUF del modelo `openai/whisper-large-v3`, publicada para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). No se trata de un modelo nuevo ni de un reentrenamiento: es una cuantización del checkpoint oficial de OpenAI, pensada para ejecutar reconocimiento automático de habla (ASR) en hardware modesto sin depender de PyTorch. El repositorio incluye cinco variantes (F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que van de 2,88 GB a 951 MB, con una degradación de WER en LibriSpeech test-clean de apenas 0,05 puntos entre la variante de mayor y menor precisión.

El modelo subyacente es Whisper large-v3, un transformer encoder-decoder de 1.543.516.688 parámetros entrenado por OpenAI sobre más de 5 millones de horas de audio (1 millón con etiquetas débiles y 4 millones pseudo-etiquetadas con large-v2). Soporta transcripción multilingüe en cerca de 99 idiomas, detección automática de idioma y traducción de voz a texto en inglés. La familia v3 incorpora dos cambios respecto a v2: entrada mel de 128 bins en lugar de 80 y un token de idioma nuevo para cantonés (`yue`).

La relevancia práctica de esta ficha está en el empaquetado: convierte un modelo que normalmente requiere GPU y el stack de Hugging Face en un binario autónomo que corre en CPU, GPU integrada con Vulkan o Apple Silicon con Metal. La model card reporta 1,81 % de WER en LibriSpeech test-clean para F16, que el autor atribuye a diferencias de configuración de decodificación frente al 2,01 % autodeclarado por OpenAI. El repositorio es muy reciente (creado el 28 de octubre de 2026) y no registra descargas ni validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (32 capas de encoder, 32 de decoder, d_model 1280, 20 cabezas de atención) |
| Parametros totales | 1.543.516.688 (≈1,54 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Ventanas de audio de 30 s (3000 frames mel a 100 fps); audio largo mediante decodificación por chunks |
| Tipos de cuantizacion | F16 (2,88 GB), Q8_0 (1,55 GB), Q6_K (1,21 GB), Q5_K_M (1,08 GB), Q4_K_M (951 MB) |
| Idiomas soportados | 99 idiomas declarados, entre ellos es, en, zh, de, fr, it, pt, ru, ja, ko, ar, hi, nl, pl, tr, sv, ca, gl, eu, yue (cantonés, nuevo en v3) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF, exclusivo para transcribe.cpp |
| Entrada de audio | 16 kHz mono WAV, espectrograma mel de 128 bins |
| Tareas soportadas | Transcripción, detección de idioma, traducción a inglés |
| Timestamps | A nivel de segmento (no a nivel de palabra) |
| Streaming | No soportado (`streaming: false`) |
| Tamano del repo | 1,7 GB |
| Commit upstream del base model | `06f233f` (fijado el 25 de abril de 2026) |

## Arquitectura y entrenamiento

Whisper large-v3 mantiene la arquitectura seq2seq de las versiones anteriores: un encoder que procesa espectrogramas mel de 128 bins en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto con marcas de tiempo. El entrenamiento, descrito en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., arXiv:2212.04356), se realizó sobre una mezcla de 1 millón de horas de audio con etiquetas débiles y 4 millones de horas pseudo-etiquetadas por large-v2, durante 2,0 épocas. No se aplicó RLHF; el ajuste es puramente supervisado sobre transcripciones.

Los cambios concretos de v3 respecto a v2 son dos: la representación de entrada pasa de 80 a 128 bins mel y se añade un token específico para cantonés. Según OpenAI, esto se traduce en una reducción de errores del 10 % al 20 % en una amplia variedad de idiomas frente a large-v2. Esta conversión GGUF no altera la arquitectura ni los pesos más allá de la cuantización; el autor indica que el port se validó numéricamente contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp, el 26 de abril de 2026. El pipeline de decodificación del runtime aplica greedy decoding, `suppress_tokens`, fallback de temperatura y timestamps de segmento activados por defecto.

## Capacidades

- Transcripción de voz a texto multilingüe en cerca de 99 idiomas, con calidad declarada variable según el idioma.
- Detección automática de idioma (`lang_detect: true`), útil para enrutar audio sin metadatos.
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (`translate: true`), sin traducción hacia otras lenguas.
- Procesamiento de audio largo mediante decodificación por chunks sobre ventanas de 30 segundos.
- Generación de timestamps a nivel de segmento, suficiente para subtitulado básico pero no para alineación por palabra.
- Reconocimiento de cantonés, capacidad nueva de la familia v3.
- Ejecución en CPU, Vulkan y Metal a través de transcribe.cpp, sin dependencias de PyTorch ni de CUDA.
- No soporta streaming en tiempo real, tool calling, agentes ni entrada de vídeo.

## Casos de uso

- **Subtitulado por lotes de archivos multimedia**: conversión previa a WAV 16 kHz mono con `ffmpeg` y transcripción con timestamps de segmento para generar ficheros SRT de vídeos ya grabados. La variante Q5_K_M (1,08 GB) permite procesar colas grandes en CPU sin degradar el WER de forma apreciable (1,84 % frente a 1,81 % en F16).
- **Transcripción de reuniones y entrevistas**: el chunking de audio largo de transcribe.cpp permite procesar grabaciones de una hora o más; la detección automática de idioma resulta útil en equipos multilingües donde no se conoce la lengua de cada pista.
- **Generación de actas y búsqueda sobre archivo sonoro**: alimentar un pipeline de indexación con el texto transcrito y los timestamps de segmento para permitir búsquedas que devuelvan el minuto exacto de una intervención.
- **Traducción de contenido audiovisual a inglés**: uso de la tarea `translate` para volcar entrevistas en castellano, catalán, euskera o gallego a texto inglés, como paso previo a un sistema de subtitulado o de análisis de contenido.
- **Despliegue en el borde sin GPU dedicada**: con la variante Q4_K_M (951 MB) el modelo cabe en equipos de gama baja; en un Ryzen 4750U la model card reporta un factor de 0,6× tiempo real en CPU y 2,1× con Vulkan, suficiente para transcripción diferida.
- **Transcripción en portátiles Apple Silicon**: con Metal sobre un M4 Max se declara un factor de 23,6× tiempo real, lo que hace viable procesar audio en segundo plano mientras se trabaja, incluso en la variante F16.
- **Preprocesado para pipelines de NLP**: convertir audio de call centers o encuestas en texto antes de aplicar análisis de sentimiento, clasificación de intenciones o extracción de entidades, sustituyendo APIs de ASR en la nube por inferencia local.

## Benchmarks y rendimiento

Calidad de transcripción sobre LibriSpeech test-clean (2620 utterances completas), con la decodificación por defecto de transcribe.cpp (greedy, `suppress_tokens`, fallback de temperatura y timestamps de segmento activados). Una ejecución única respaldada por Metal; el autor advierte que las reducciones paralelas no deterministas de Metal pueden mover el WER del corpus alrededor de 0,1 pp entre ejecuciones.

| Cuantización | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F16 | 2,88 GB | 1,81 % |
| Q8_0 | 1,55 GB | 1,82 % |
| Q6_K | 1,21 GB | 1,83 % |
| Q5_K_M | 1,08 GB | 1,84 % |
| Q4_K_M | 951 MB | 1,86 % |
| Referencia OpenAI large-v3 (autodeclarado) | no disponible | 2,01 % |

Velocidad declarada en la model card (etiquetada como `rtf`; por el orden de magnitud —Metal 23,6 frente a CPU 1,5— parece expresarse como múltiplo del tiempo real, donde mayor es mejor, y no como ratio de tiempo, donde menor es mejor):

| Plataforma | Backend | Valor declarado |
|---|---|---:|
| Apple M4 Max | Metal | 23,6 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 7 4750U | Vulkan | 2,1 |
| AMD Ryzen 7 4750U | CPU | 0,6 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de los anteriores: no hay MMLU, HumanEval, GSM8K (no aplican a un modelo ASR) ni comparativas oficiales con FLEURS o Common Voice para esta conversión concreta.

## Requisitos de hardware

- **VRAM estimada (inferencia, incluye overhead de activaciones y espectrograma)**: F16 en torno a 4 GB; Q8_0 en torno a 2,5–3 GB; Q4_K_M en torno a 1,5–2 GB. Son estimaciones a partir del tamano de fichero, no cifras publicadas por el autor.
- **GPU recomendadas**: no requiere GPU de datacenter. Una RTX 4090 o una A100 están muy por encima de lo necesario; tarjetas de 4–8 GB (RTX 3050, GTX 1660, iGPU con Vulkan) son suficientes para las variantes cuantizadas.
- **Consumer GPU**: si cabe. Cualquier GPU con 4 GB o más puede ejecutar la variante Q4_K_M o Q5_K_M; con 3 GB basta para Q4_K_M si se reserva poca memoria al sistema.
- **Apple Silicon**: ruta preferente según la model card, con backend Metal y factor declarado de 23,6× tiempo real en M4 Max.
- **CPU sola**: viable pero lenta. El Ryzen 4750U declara 0,6× tiempo real, es decir, por debajo del tiempo real; útil para procesamiento por lotes, no para interacción en vivo.
- **Opciones de despliegue**: transcribe.cpp (único runtime soportado para estos GGUF; requiere compilar desde fuente con CMake). No es compatible con llama.cpp, Ollama, vLLM ni TGI. Alternativas para el mismo modelo base: faster-whisper/CTranslate2, whisper.cpp (requiere otra conversión) o transformers con los pesos originales en safetensors.
- **Latencia y throughput**: solo se dispone de los factores de velocidad de la tabla anterior. Como referencia, 23,6× tiempo real implica transcribir aproximadamente 23 minutos de audio por minuto de cómputo en Metal; 0,6× implica unos 36 segundos de cómputo por minuto de audio en la CPU del Ryzen 4750U.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato y disponibilidad |
|---|---:|---|---|---|---|
| **whisper-large-v3-gguf (esta ficha)** | 1,54 B | 30 s por ventana, chunking para audio largo | ~99 | Apache-2.0 | GGUF para transcribe.cpp |
| openai/whisper-large-v3 | 1,54 B | 30 s por ventana | ~99 | Apache-2.0 | Safetensors, transformers, ecosistema amplio |
| openai/whisper-large-v2 | 1,54 B | 30 s por ventana | ~99 (sin `yue`) | Apache-2.0 | Safetensors; 80 bins mel; 10–20 % más errores que v3 según OpenAI |
| openai/whisper-medium | 769 M | 30 s por ventana | ~99 | Apache-2.0 | Safetensors; menor huella, mayor WER que large-v3 |

Frente a las alternativas, la ventaja de esta conversión es el despliegue sin Python ni CUDA y la posibilidad de elegir el equilibrio tamano/precisión con una pérdida de calidad de 0,05 pp entre F16 y Q4_K_M. La desventaja es la dependencia de un runtime joven (transcribe.cpp) y la ausencia de soporte de streaming, algo que sí ofrecen faster-whisper y otras implementaciones. No se dispone de datos de benchmarks comparativos directos con distil-whisper ni con faster-whisper en la informacion proporcionada.

## Limitaciones y advertencias

- **Ventana fija de 30 segundos**: el modelo no tiene un contexto largo real; el audio extenso se trocea y puede perder coherencia entre chunks (cortes en mitad de palabra, puntuación inconsistente).
- **Sin streaming**: `streaming: false` en la model card. No sirve para dictado en vivo ni para transcripción concurrente de llamadas sin mecanismos externos de troceado.
- **Alucinaciones en silencio y ruido**: el propio autor señala que las diferencias de WER entre ejecuciones con Metal se deben sobre todo a "short-clip hallucination outcomes on the noise floor", es decir, texto inventado en fragmentos con señal muy baja. Hay que filtrar silencios y validar la salida en produccion.
- **Timestamps solo de segmento**: insuficientes para alineación por palabra o para subtitulado con requisitos de precisión.
- **Traducción únicamente hacia inglés**: no se puede traducir entre dos idiomas distintos del inglés con la tarea `translate`.
- **Calidad desigual por idioma**: el WER de 1,81 % corresponde a inglés limpio de LibriSpeech; en idiomas con menos datos y en audio con acento, ruido o solapamiento, la degradación puede ser sustancial y no está cuantificada en esta ficha.
- **Dependencia de transcribe.cpp**: los GGUF no son intercambiables con llama.cpp u Ollama. El runtime debe compilarse desde fuente y la versión está fijada al commit 5.6.1 para la validación.
- **Repositorio sin validación independiente**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. Las cifras de WER y velocidad provienen de una única ejecución del autor.
- **Discrepancia de rutas**: los enlaces de descarga de la model card apuntan al repositorio `handy-computer/whisper-large-v3-gguf`, no a `lipik/whisper-large-v3-gguf`. Conviene verificar el origen de los ficheros antes de desplegarlos.
- **Licencia**: Apache-2.0 permite uso comercial, pero se hereda del modelo base; cualquier término adicional de OpenAI para whisper-large-v3 debe consultarse en la model card original.
- **Entrada restringida**: solo WAV 16 kHz mono; requiere un paso previo de `ffmpeg` para el resto de formatos, lo que anade latencia en pipelines en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lipik/whisper-large-v3-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Commit del base model usado en la conversión: https://huggingface.co/openai/whisper-large-v3/commit/06f233f
- Paper de Whisper: https://huggingface.co/papers/2212.04356 (arXiv:2212.04356)
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión de transcribe.cpp usada para la validación: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página de rendimiento y validación numérica: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3.md
- Descargas de cuantizaciones (según la model card): https://huggingface.co/handy-computer/whisper-large-v3-gguf
