# madjinn/kb-whisper-large-coreml

## Resumen

Esta ficha describe `madjinn/kb-whisper-large-coreml`, una conversión de formato del modelo de reconocimiento de voz sueco KB-Whisper Large de KBLab (Biblioteca Nacional de Suecia) a Core ML, en el formato de WhisperKit de Argmax y con los pesos cuantizados a 8 bits. No es un modelo nuevo ni reentrenado: los pesos son los de `KBLab/kb-whisper-large` (revisión `d5d5984b4d8f7c4847a8ea203f1976285fb28300`) y el trabajo del autor, Madjinn, consiste en la conversión y la cuantización.

Su relevancia es práctica: permite ejecutar un modelo Whisper de tamaño *large* especializado en sueco directamente sobre el Apple Neural Engine mediante Core ML, sin depender de PyTorch ni de una GPU dedicada. El repositorio ocupa 1.561.164.738 bytes (639 MB de encoder y 910 MB de decoder), un tamaño comparable al de los modelos Whisper Medium en fp16, según el propio autor. La licencia es Apache-2.0, la misma que la del modelo base.

La conversión se publicó para el teclado de dictado WhispAway y sigue exactamente la receta de la variante Medium 8-bit del mismo autor. Conviene tener en cuenta que no hay mediciones de velocidad ni de memoria en dispositivo, que la integración con WhisperKit no ha sido probada por el autor y que la validación de transcripción se limita a tres clips suecos de 8, 10 y 15 segundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) convertido a Core ML; decoder de 32 capas, dimensión oculta 1280, vocabulario de 51.866 clases (`logits` [1,1,51866]) |
| Parámetros totales | No declarado en la model card; arquitectura Whisper *large* según el modelo base (encoder de 1280 dimensiones y decoder de 32 capas) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Ventana de audio de 30 s (entrada `audio` Float16 [480000] a 16 kHz; mel [1,128,1,3000]) y hasta 448 tokens de decodificación (`--text-decoder-max-sequence-length 448`) |
| Tipos de cuantización | int8 lineal simétrico por canal en `AudioEncoder` y `TextDecoder` (`linear_quantize_weights`, `linear_symmetric`, `weight_threshold=2048`); el espectrograma mel se mantiene en fp16 |
| Idiomas soportados | Sueco (`sv`) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado) para `MelSpectrogram`, `AudioEncoder` y `TextDecoder`; `config.json`, `generation_config.json` y `tokenizer.json` en JSON |
| Tamaño del repositorio | 1.561.164.738 bytes en 18 archivos (encoder 639 MB, decoder 910 MB) |
| Pipeline | `automatic-speech-recognition` |
| Modelo base | `KBLab/kb-whisper-large` (revisión `d5d5984b4d8f7c4847a8ea203f1976285fb28300`) |
| Entradas y salidas del decoder | Entradas `input_ids`, `cache_length`, `key_cache`/`value_cache` [1,40960,1,448], `kv_cache_update_mask`, `encoder_output_embeds`, `decoder_key_padding_mask`; salidas `logits`, actualizaciones de caché KV y `alignment_heads_weights` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper de OpenAI: un encoder que procesa espectrogramas mel y un decoder autorregresivo con atención cruzada, aquí con 32 capas en el decoder, 1280 dimensiones ocultas y un vocabulario de 51.866 tokens, coherente con la familia Whisper *large*. El paquete Core ML se divide en tres módulos: `MelSpectrogram` (fp16), `AudioEncoder` (salida `encoder_output_embeds` [1,1280,1,1500]) y `TextDecoder`, que expone caché KV explícita y pesos de cabezas de alineación, lo que habilita marcas temporales a nivel de palabra.

No hubo entrenamiento ni ajuste fino en esta conversión. El proceso se hizo con `whisperkittools` en el commit `b5c1e50eb611240025c158784ec34bbfce26de09`, junto con argmaxtools 0.1.7, coremltools 7.1, torch 2.2.1 y transformers 4.39.1 (cadena de herramientas de Argmax de 2024). El comando fue `whisperkit-generate-model --model-version KBLab/kb-whisper-large --text-decoder-max-sequence-length 448`, con atención del encoder en modo `SplitHeadsQ` y decoder en `Cat`. La cuantización int8 se aplicó con `coremltools 7.1` sobre todos los pesos de 2048 elementos o más, y los modelos se compilaron con `xcrun coremlcompiler` (coremlc 3520.5.1). La conversión se ejecutó en Linux, donde Core ML no puede ejecutarse, por lo que los pasos de predicción Core ML de las pruebas de la herramienta se sustituyeron por el guardado del `.mlpackage`; las pruebas de paridad en PyTorch sí se ejecutaron sin cambios. No se dispone de información sobre los datos de entrenamiento originales de KB-Whisper en la documentación proporcionada.

## Capacidades

- Transcripción de voz en sueco (*automatic speech recognition*) con decodificación greedy, en fragmentos de hasta 30 segundos de audio.
- Marcas temporales a nivel de palabra gracias a la salida `alignment_heads_weights` del decoder, útil para subtitulado.
- Decodificación incremental con caché KV explícita (`key_cache`/`value_cache` y `kv_cache_update_mask`), apta para pipelines de streaming por fragmentos.
- Ejecución sobre Core ML en el Apple Neural Engine y en CPU/GPU de Apple Silicon, sin runtime de PyTorch.
- Gestión de memoria reducida por la cuantización int8, con el mel espectrograma en fp16.
- No soporta *tool calling*, ni funciones de agente, ni razonamiento multi-paso, ni visión, ni audio más allá de la transcripción, ni generación de texto general.
- Multilingüismo: no. El modelo está ajustado para sueco y, según las pruebas del autor, no traduce de forma fiable (con un clip en inglés y el token de idioma inglés, la versión int8 respondió en inglés y la fp16 tradujo al sueco).

## Casos de uso

- Dictado por voz en iOS y macOS: es el caso original del repositorio, que se publicó para el teclado WhispAway; el modelo se integra en una app que invoca los `.mlmodelc` con su propio pipeline Core ML y devuelve texto sueco en el campo de entrada activo.
- Subtitulado de vídeo y audio en sueco: el decoder emite `alignment_heads_weights`, lo que permite generar subtítulos con tiempos por palabra a partir de fragmentos de 30 s procesados secuencialmente.
- Transcripción de archivos orales y materiales de investigación: bibliotecas, archivos sonoros y proyectos de historia oral en sueco pueden procesar colecciones localmente en un Mac, sin enviar el audio a servicios externos.
- Actas y notas de reuniones: grabaciones de hasta 30 s por ventana, encadenadas con solapamiento, para producir transcripciones de reuniones internas en entornos con requisitos de confidencialidad, al no requerir conexión ni GPU externa.
- Accesibilidad: subtitulado en directo de conversaciones o clases presenciales en sueco dentro de una app nativa, aprovechando la ejecución en el Neural Engine y la caché KV para decodificación incremental.
- Búsqueda por voz en aplicaciones: entrada de consultas habladas en sueco para buscadores internos o catálogos, con latencia potencialmente baja al ejecutarse en el dispositivo (sin mediciones publicadas).
- Prototipado y evaluación de ASR sueco en Apple Silicon: al estar en formato WhisperKit, sirve para comparar el comportamiento de un modelo *large* cuantizado frente a variantes Medium en fp16 dentro del mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay cifras de WER, MMLU, HumanEval ni GSM8K para esta conversión). El autor sí documenta verificaciones de fidelidad de la conversión:

| Verificación | Resultado |
|---|---|
| Paridad del encoder en PyTorch frente al modelo de Hugging Face | 142 dB de PSNR |
| Paridad del decoder en PyTorch frente al modelo de Hugging Face | 133 dB de PSNR y el mismo token superior en todas las posiciones |
| Transcripción greedy en sueco con los modelos compilados (CPU de un Mac, mismo driver que WhisperKit) frente a una conversión fp16 equivalente | Idéntica en tres clips de 8, 10 y 15 s; ejemplo: «Kom hit med jollen Olsson, kommer direktörn och snart skiljer sig jollens siluett från jaktens.» |
| Similitud coseno de la salida del encoder frente a fp16 | 0,9991–0,9993 |
| Clip en inglés con token de idioma inglés | fp16 tradujo al sueco; int8 respondió en inglés |
| Velocidad y memoria en dispositivo | No medidas |

## Requisitos de hardware

- Plataforma obligatoria: Core ML sobre Apple (macOS e iOS). No hay soporte para CUDA, ROCm ni Linux en este formato; la conversión se hizo en Linux precisamente porque allí Core ML no puede ejecutar los modelos.
- Espacio en disco: 1,56 GB para los tres `.mlmodelc` (encoder 639 MB, decoder 910 MB).
- VRAM/RAM estimada para inferencia: no disponible; el autor no ha medido el consumo de memoria en dispositivo. Indica que, con 1,56 GB, el paquete tiene un tamaño similar al de los modelos Medium en fp16, que «no funcionan bien en el Neural Engine de todos los iPhone».
- GPU recomendadas: no aplica en el sentido habitual; el destino es el Apple Neural Engine de Apple Silicon. No hay datos de rendimiento por chip (M1, M2, M3, A17, etc.).
- ¿Cabe en GPU de consumo? La pregunta pertinente es si cabe en un iPhone o iPad concreto: no hay datos. En Mac con Apple Silicon debería ejecutarse, pero tampoco hay mediciones publicadas.
- Opciones de despliegue: WhisperKit de Argmax apuntando `modelRepo` a este repositorio y el modelo a `kb-whisper-large-int8` (el autor advierte de que no lo ha probado); o un pipeline Core ML propio, como hace WhispAway. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no leen `.mlmodelc`.
- Latencia y throughput: no disponibles. La caché KV de 448 posiciones y la decodificación greedy son los únicos parámetros conocidos del bucle de inferencia.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Tamaño | Ventana de audio | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| `madjinn/kb-whisper-large-coreml` | Core ML (`.mlmodelc`) | int8 por canal + mel fp16 | 1,56 GB | 30 s / 448 tokens | Sueco | Apache-2.0 |
| `KBLab/kb-whisper-large` (modelo base) | Pesos originales (formato no especificado en la información disponible) | No disponible | No disponible | 30 s / 448 tokens | Sueco | Apache-2.0 |
| `madjinn/kb-whisper-medium-coreml` | Core ML (`.mlmodelc`) | int8, misma receta | No disponible en la información proporcionada | No disponible | Sueco | Apache-2.0 |
| `openai/whisper-large-v3` (referencia de la familia) | PyTorch, safetensors, GGUF vía terceros | fp16, int8 en ecosistemas de terceros | ~1.550 M parámetros (dato público de OpenAI) | 30 s | Multilingüe (~99 idiomas) | MIT |

La comparación relevante para producción es la primera columna frente a la segunda: se obtiene el mismo modelo sueco con un 8 bits de cuantización, ejecutable en Core ML, a cambio de perder portabilidad fuera del ecosistema Apple. Frente al Medium 8-bit del mismo autor, el *large* ofrece mayor capacidad a costa de duplicar aproximadamente el tamaño y de un riesgo mayor de no encajar en el Neural Engine de iPhone antiguos.

## Limitaciones y advertencias

- Idioma único: solo sueco. Las pruebas con audio en inglés muestran un comportamiento inconsistente (traducción en fp16, transcripción en inglés en int8), por lo que no debe usarse como modelo multilingüe ni de traducción.
- Ausencia de métricas de calidad: no hay WER publicado ni para esta conversión ni, en la información disponible, para el modelo base. La única validación son tres clips suecos de 8, 10 y 15 segundos; es una muestra demasiado pequeña para estimar el rendimiento en dominios como acentos regionales, ruido de fondo o audio telefónico.
- Sin mediciones en dispositivo: velocidad, consumo de memoria y comportamiento térmico en iPhone, iPad y Mac no están medidos. El propio autor advierte que el tamaño (1,56 GB) se acerca al de modelos Medium en fp16 que no funcionan bien en todos los Neural Engine.
- Integración con WhisperKit no verificada: el autor no ha probado el flujo `modelRepo` de WhisperKit; WhispAway usa un pipeline Core ML propio. Quien integre con WhisperKit debe validar el comportamiento por su cuenta.
- Proceso de conversión con un paso no ejecutado: al hacerse en Linux, las predicciones Core ML de las pruebas de la herramienta se sustituyeron por el guardado del `.mlpackage`; la verificación en dispositivo es, por tanto, parcial.
- Dependencia de plataforma: Core ML ata el modelo a Apple. No hay ruta de despliegue en servidores con GPU NVIDIA, contenedores Linux ni infraestructura cloud estándar, lo que limita su uso a aplicaciones nativas o a Macs como nodo de procesamiento.
- Riesgo de alucinación: heredado de Whisper (texto inventado en silencios, música o ruido). No se han publicado evaluaciones de este comportamiento para esta conversión.
- Sesgos: no documentados en la información disponible. Al ser un ajuste sobre Whisper entrenado por KBLab con datos suecos, cabe esperar sesgos de dominio y de variedad dialectal, pero no hay datos que los cuantifiquen.
- Límite de contexto: 30 s por ventana. El audio largo exige fragmentación con solapamiento y lógica propia de unión de segmentos.
- Licencia: Apache-2.0 permite uso comercial, pero se deben conservar los avisos de atribución a KBLab (Biblioteca Nacional de Suecia) y a OpenAI Whisper (MIT), además del trabajo de conversión de Madjinn y las herramientas de Argmax (MIT).
- Madurez: repositorio con 0 descargas y 0 *likes* en el momento de la consulta, sin tests de terceros ni issues públicas que permitan evaluar su robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/madjinn/kb-whisper-large-coreml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-large
- Variante Medium 8-bit del mismo autor: https://huggingface.co/madjinn/kb-whisper-medium-coreml
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools (herramienta de conversión): https://github.com/argmaxinc/whisperkittools
- Teclado de dictado WhispAway: https://madjinn.dev
- OpenAI Whisper (modelo original, MIT): https://github.com/openai/whisper
