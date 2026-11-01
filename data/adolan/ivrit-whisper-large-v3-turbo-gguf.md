# adolan/ivrit-whisper-large-v3-turbo-gguf

## Resumen

`adolan/ivrit-whisper-large-v3-turbo-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) en hebreo `ivrit-ai/whisper-large-v3-turbo`, un fine-tune de Whisper large-v3-turbo de OpenAI realizado por ivrit.ai. El repositorio no entrena ni modifica el modelo: solo cambia el contenedor de pesos para que pueda ejecutarse en transcribe.cpp, el runtime de inferencia de la aplicación de dictado Hex, sobre CPU, Vulkan, Metal y CUDA.

La relevancia del artefacto es doble. Por un lado, ofrece un modelo ASR especializado en hebreo con una tasa de error de palabra (WER) de 18,46 % en el split de test completo de FLEURS `he_il`, frente al 29,51 % del Whisper large-v3-turbo original medido con el mismo harness: aproximadamente un 37 % menos de errores con el mismo tamaño y velocidad. Por otro, empaqueta ese modelo en dos ficheros GGUF (Q8_0 de 886 MB y F32 de 3,24 GB) listos para desplegarse en hardware de consumo sin necesidad de stack de Python ni de PyTorch.

El modelo base es un transformer encoder-decoder de tipo Whisper con 808.904.208 parámetros, ventana de audio de 30 segundos y vocabulario multilingüe, aunque el fine-tune degrada deliberadamente la detección de idioma y la traducción: está pensado para transcribir voz mayoritariamente en hebreo con el idioma fijado a `he`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.904.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, herencia de Whisper) |
| Tipos de cuantizacion | Q8_0 y F32 incluidos en el repo; cuantizacion adicional posible con `transcribe-quantize` |
| Idiomas soportados | hebreo (`he`) exclusivamente en la practica; el modelo base es multilingue pero el fine-tune degrada deteccion de idioma y traduccion |
| Licencia | Apache-2.0 (modelo ivrit.ai); el base de OpenAI es MIT |
| Formato de pesos | GGUF (`ivrit-whisper-large-v3-turbo-Q8_0.gguf`, `ivrit-whisper-large-v3-turbo-F32.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un encoder de audio que procesa espectrogramas mel de 30 segundos y un decoder autorregresivo que genera tokens de transcripcion, con atencion estandar (no hay atención lineal, MoE ni capas SSM). El checkpoint original de ivrit.ai se distribuye en F32 y sin banco de filtros mel; el conversor de transcribe.cpp lo calcula con `transformers.audio_utils` y lo incorpora al GGUF. La conversion se hizo desde la revision `f33172a8c3c6efbc040a7200e00835257cac0447` con transcribe.cpp en `7045d1c0fe7cee37747b2792977421d435e75fca`, anadiendo una linea en `VARIANT_DISPLAY_NAMES` para que el fichero lleve el nombre del modelo de ivrit.ai y no el de OpenAI. Los metadatos del GGUF conservan `general.author` y `general.organization` como `ivrit-ai` y `general.license` como `apache-2.0`.

El entrenamiento es responsabilidad de ivrit.ai (codigo en `ivrit-ai/asr-training`) y se realizo sobre tres corpus abiertos en hebreo: `crowd-transcribe-v5` (unas 300 horas de audio publico transcrito por voluntarios segmento a segmento), `crowd-recital-whisper-training` (unas 50 horas de voluntarios leyendo pasajes de Wikipedia) y `knesset-plenums-whisper-training` (unas 4.700 horas de sesiones plenarias de la Knesset). No se detalla en la informacion disponible si hubo RLHF, DPO u otra fase de alineacion posterior al fine-tune supervisado. La innovacion tecnica del repositorio es puramente de empaquetado: reproducibilidad byte a byte de la cuantizacion Q8_0 a partir del F32 y un runtime (transcribe.cpp) que cubre CPU, Vulkan, Metal y CUDA sin dependencias de Python.

## Capacidades

- Transcripcion de voz a texto en hebreo con calidad mejorada respecto al Whisper large-v3-turbo original (18,46 % WER frente a 29,51 % en FLEURS `he_il`).
- Procesamiento de audio de 16 kHz mono en formato WAV a traves de la CLI de transcribe.cpp.
- Ejecucion en CPU, Vulkan, Metal y CUDA, lo que permite despliegue en estaciones de trabajo sin GPU dedicada y en equipos Apple Silicon.
- Integracion directa con la aplicacion de dictado Hex, que carga este formato GGUF.
- No soporta tool calling ni function calling: es un modelo ASR puro, sin interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue degradada: el fine-tune de ivrit.ai perjudica la deteccion automatica de idioma y la traduccion, por lo que debe fijarse siempre `he` y no debe usarse para traducir.
- No dispone de modo thinking, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Dictado por voz en hebreo en aplicaciones de escritorio: Hex carga directamente el GGUF Q8_0 y transcribe en local sin enviar audio a la nube, lo que resulta adecuado para usuarios que manejan material sensible.
- Transcripcion de actas parlamentarias y reuniones institucionales: el modelo se entreno con unas 4.700 horas de plenos de la Knesset, por lo que el dominio parlamentario hebreo esta bien representado; se usaria con ficheros WAV de 16 kHz y `-l he`.
- Subtitulado de contenido audiovisual en hebreo: la latencia mediana de 263 ms por utterance en una RTX 3090 permite procesar lotes de segmentos cortos en tiempo casi real para postproduccion.
- Archivado y busqueda de grabaciones historicas: la ventana de 30 segundos por segmento y el soporte de CPU permiten ejecutar la transcripcion en servidores sin GPU sobre grandes volumenes de audio.
- Investigacion en lingüistica y corpus hebreos: el modelo sirve para generar transcripciones de referencia en estudios comparativos, con la advertencia de que FLEURS es habla leida y puede no representar habla espontanea.
- Despliegue en dispositivos sin GPU dedicada: la ejecucion via Vulkan o CPU en transcribe.cpp hace viable la transcripcion en portatiles y equipos de gama media con el fichero Q8_0 de 886 MB.
- Accesibilidad para personas con discapacidad auditiva en entornos hebreoparlantes: la baja latencia y el funcionamiento local permiten generar subtitulos en vivo en aplicaciones de videollamada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), sobre el split de test completo de FLEURS hebreo (`he_il`, 792 utterances), con el harness de WER de transcribe.cpp (`scripts/wer/run.py` y `score.py`), idioma `he`, sin timestamps, decodificacion greedy, batch size 1, en transcribe.cpp `7045d1c`, Q8_0 sobre Vulkan en una NVIDIA RTX 3090:

| Modelo | WER | IC 95 % | Latencia mediana por utterance |
|---|---:|---|---:|
| Este modelo, Q8_0 | 18,46 % | 16,94–20,02 % | 263 ms |
| Whisper large-v3-turbo original, Q8_0 | 29,51 % | 27,85–31,24 % | 277 ms |

La cifra del modelo original reproduce el 29,71 % publicado por transcribe.cpp para el mismo fichero y split, lo que hace comparables ambas filas. El autor indica que FLEURS es habla leida y que el leaderboard de ivrit.ai cubre otros tipos de audio en hebreo. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks, que por otra parte no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,9 GB para el fichero Q8_0 y 3,2 GB para el F32, mas el overhead del runtime y del buffer de audio.
- GPU recomendadas: NVIDIA RTX 3090 (configuracion usada en la medicion de referencia), asi como cualquier GPU compatible con Vulkan o CUDA; tambien funciona en Apple Silicon via Metal.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 2 GB o mas de VRAM para Q8_0; el F32 requiere al menos 4 GB.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y runtime de la app Hex); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 263 ms de mediana por utterance en RTX 3090 con Q8_0 sobre Vulkan, frente a 277 ms del modelo original; el autor no publica cifras de throughput agregado ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER en FLEURS he_il | Licencia | Formato |
|---|---|---:|---:|---|---|
| ivrit-whisper-large-v3-turbo Q8_0 (este) | 808,9 M | 30 s por segmento | 18,46 % | Apache-2.0 | GGUF |
| Whisper large-v3-turbo original Q8_0 | 808,9 M | 30 s por segmento | 29,51 % | MIT (OpenAI) | GGUF |
| ivrit-ai/whisper-large-v3-turbo (checkpoint fuente) | 808,9 M | 30 s por segmento | no disponible en esta ficha | Apache-2.0 | safetensors (F32) |

La comparativa se limita a estos tres artefactos porque la informacion proporcionada no incluye otros modelos ASR en hebreo con los que contrastar. La diferencia clave frente al Whisper original es el fine-tune en hebreo, que reduce el WER en unos 11 puntos absolutos sin aumentar el tamano ni la latencia; frente al checkpoint de ivrit.ai, la unica diferencia es el formato y la cuantizacion.

## Limitaciones y advertencias

- El fine-tune de ivrit.ai degrada la deteccion automatica de idioma y la traduccion: debe fijarse siempre `he` y no debe usarse para traducir ni para audio en otros idiomas.
- FLEURS es habla leida; el rendimiento en habla espontanea, con ruido o con acentos marcados puede ser peor que el 18,46 % reportado.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio o ruido, aunque la informacion disponible no cuantifica este comportamiento.
- Sesgos conocidos: no se documentan en la informacion disponible; el entrenamiento con plenos de la Knesset y voluntarios de ivrit.ai puede sobrerrepresentar registro formal y vocabulario institucional.
- Licencia Apache-2.0 para el modelo de ivrit.ai y MIT para el base de OpenAI: uso comercial permitido, pero conviene conservar los avisos de atribucion de ambos.
- El autor no verifica de forma independiente el benchmark: los valores de WER proceden de su propio harness y estan marcados como `verified: false`.
- El repositorio tiene 41 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.
- No hay soporte documentado para runtimes distintos de transcribe.cpp, lo que limita la portabilidad a otros ecosistemas de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adolan/ivrit-whisper-large-v3-turbo-gguf
- Modelo base de ivrit.ai: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Whisper large-v3-turbo de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Codigo de entrenamiento de ivrit.ai: https://github.com/ivrit-ai/asr-training
- Runtime transcribe.cpp: https://github.com/anomalyco/transcribe.cpp
- Aplicacion de dictado Hex: https://github.com/anomalyco/hex
- Dataset crowd-transcribe-v5: https://huggingface.co/datasets/ivrit-ai/crowd-transcribe-v5
- Dataset crowd-recital-whisper-training: https://huggingface.co/datasets/ivrit-ai/crowd-recital-whisper-training
- Dataset knesset-plenums-whisper-training: https://huggingface.co/datasets/ivrit-ai/knesset-plenums-whisper-training
- Leaderboard de transcripcion en hebreo de ivrit.ai: https://huggingface.co/spaces/ivrit-ai/hebrew-transcription-leaderboard
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
