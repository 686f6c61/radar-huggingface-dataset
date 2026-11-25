# Ryanjelly/gua-hang-taigi-asr

## Resumen

Guā-hâng ASR (外行) es un adaptador LoRA de 57,7 millones de parámetros (231 MB) para el modelo de reconocimiento automático del habla MediaTek-Research/Breeze-ASR-26, un Whisper large-v2 entrenado con habla en taigi (hokkien taiwanés). El adaptador modifica la salida del modelo base para que transcriba directamente en Tâi-lô, el sistema de romanización del Ministerio de Educación de Taiwán con indicación numérica de tonos, en lugar de traducir el contenido al mandarín escrito con caracteres han.

El problema que resuelve es concreto: Breeze-ASR-26 por sí solo oye taigi pero escribe caracteres mandarines, es decir, traduce en lugar de transcribir. Con este adaptador, el modelo escribe lo que se dijo, en romanización y con tonos. Está pensado como instrumento de medida: sirve de prueba de lectura inversa para la voz sintética Guā-hâng TTS del mismo autor, sintetizando frases de test, leyéndolas de vuelta y contando los errores de sílaba.

Es un primer lanzamiento de una sola persona (Ryan Jelinek), con la mayor parte del código escrita por Claude de Anthropic. El repositorio incluye el reconocedor, las frases de test y el scorer, de modo que cualquier voz en taigi puede medirse con el mismo protocolo. La relevancia actual radica en que el taigi es una lengua con pocos recursos digitales y este tipo de adaptadores de bajo coste permiten construir métricas objetivas para evaluar sistemas de síntesis y reconocimiento en la lengua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Whisper large-v2 (modelo base Breeze-ASR-26) |
| Parametros totales | 57,7 M en el adaptador; el modelo base no se especifica en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; las mediciones se hicieron en bfloat16 |
| Idiomas soportados | nan (taigi / hokkien taiwanes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre Breeze-ASR-26, un Whisper large-v2 de MediaTek Research entrenado con habla en taigi. El adaptador añade 57,7 millones de parámetros (231 MB en safetensors) y se distribuye como módulo PEFT. La innovación técnica no está en la arquitectura, sino en el objetivo de salida: forzar al decodificador a producir Tâi-lô con tonos numéricos en lugar de la traducción a caracteres mandarines que genera el modelo base.

Los datos de entrenamiento no se detallan en la información disponible más allá de que se usaron frases cortas leídas de Common Voice nan-tw (media de 2,6 segundos por clip). La evaluación se hizo sobre el split 27.0 de Common Voice nan-tw, con 3.481 clips de 148 hablantes no vistos, separación estricta de hablantes entre train y test y sin frases de test presentes en entrenamiento, independientemente de su ortografía. No se indica el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Transcripción de habla en taigi a Tâi-lô con tonos numéricos (por ejemplo, 咱明仔載六點佇車頭集合 se transcribe como `lan2 bin5-a2-tsai3 lak8 tiam2 ti7 tshia1-thau5 tsip8-hap8`).
- Salida en romanización del Ministerio de Educación de Taiwán, sin caracteres han y sin puntuación.
- Evaluación cuantitativa de voces sintéticas mediante prueba de lectura inversa: sintetizar, transcribir y contar errores de sílaba.
- Puntuación automática con `score.py`, con métricas de SER, errores de tono y clips exactamente correctos, y desglose por línea con `--per-line`.
- Procesamiento por lotes de varios directorios de voces en una sola llamada.
- No soporta tool calling, agentes, visión, audio de entrada más allá del reconocimiento ni capacidades multilingües fuera del taigi.

## Casos de uso

- Evaluación de sistemas TTS en taigi: sintetizar las frases de `bench/everyday.jsonl` y `bench/cv24.jsonl` con una voz candidata, transcribirlas con este adaptador y obtener un SER comparable entre voces. Es el caso de uso principal y el motivo por el que se publicó el repositorio.
- Comparación de voces sintéticas con grabaciones reales: el protocolo permite medir una voz propia frente a las referencias publicadas (grabaciones reales con 2,9 % en frases cotidianas y 23,2 % en Common Voice).
- Control de regresión en pipelines de síntesis: integrar `checker.py` y `score.py` en un flujo de CI para detectar degradaciones de inteligibilidad cuando se cambia el front end o el modelo de voz.
- Investigación lingüística sobre taigi: obtener transcripciones en Tâi-lô de corpus de habla leída para análisis de sílabas y tonos, teniendo en cuenta la limitación de tonos de diccionario.
- Construcción de corpus alineados audio-romanización: usar las hipótesis generadas como punto de partida para anotación humana en proyectos de documentación de la lengua.
- Prototipado de interfaces de voz en taigi: transcribir entradas de voz cortas y leídas en aplicaciones de demostración, aceptando la tasa de error documentada en hablantes no vistos.

## Benchmarks y rendimiento

Resultados sobre el split 27.0 de Common Voice nan-tw (3.481 clips, 148 hablantes no vistos). SER: tasa de error de sílaba por 100 sílabas de referencia, menor es mejor.

| Modelo | SER | SER sin tonos | Errores de tono | Clips exactos |
|---|---|---|---|---|
| Breeze-ASR-26 solo (mandarín leído a Tâi-lô por un front end de diccionario) | 63,5 % | 56,9 % | 13,9 % | 13,9 % |
| Con este adaptador | 29,2 % | 20,8 % | 10,5 % | 40,3 % |

Desglose adicional del adaptador: 34,4 % de SER en clips de 1 a 2 sílabas y 23,8 % en clips de 6 o más sílabas; un cuarto de los hablantes por debajo del 20,6 % y otro cuarto por encima del 35,5 %. En grabaciones reales de las frases de test más difíciles, 23,2 % de SER.

Resultados del protocolo de lectura inversa por voz (frases cotidianas: una toma cada una; Common Voice: tres tomas cada una, agrupadas):

| Voz | 8 frases cotidianas | 24 frases Common Voice |
|---|---|---|
| Grabaciones reales | 2,9 % | 23,2 % |
| Guā-hâng TTS, `--sandhi learned` (c2, por defecto) | 8,8 % | 20,5 % |
| Guā-hâng TTS, `--sandhi rules` (c1) | 5,9 % | 22,9 % |
| ga642381/OmniVoice-Taigi-SuiSiann con su propio Tâi-lô | 12,7 % | 20,2 % |
| ga642381/OmniVoice-Taigi-SuiSiann con el Tâi-lô del front end de Guā-hâng | 14,7 % | 23,9 % |
| leon80148/taigi-cosyvoice3-lora-v0.1 | 27,5 % | 31,7 % |
| MERaLiON OmniVoice Hokkien (hokkien de Singapur) | 37,3 % | no medido |
| Suí-siann VITS | 43,1 % | no medido |

## Requisitos de hardware

- GPU NVIDIA con aproximadamente 11 GB libres; las cifras publicadas se midieron en bfloat16 sobre una RTX 5070 Ti.
- El modelo base Breeze-ASR-26 ocupa 6,2 GB y se descarga del Hub en la primera ejecución, fijado al commit con el que se midieron los números.
- Python 3.12 y la build CUDA de PyTorch correspondiente a la GPU.
- Inferencia por lotes: 296 clips en 70 segundos incluyendo la carga, con lotes de 32.
- Cabe en GPU de consumo con 11 GB o más de VRAM libre; no se especifican opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, y el repositorio solo documenta el uso mediante `checker.py` con PEFT.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Guā-hâng ASR (este modelo) | LoRA sobre Whisper large-v2 | 57,7 M (adaptador) | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| MediaTek-Research/Breeze-ASR-26 | Whisper large-v2 ajustado a taigi | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| ga642381/OmniVoice-Taigi-SuiSiann | Voz TTS en taigi (evaluada con este protocolo) | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| leon80148/taigi-cosyvoice3-lora-v0.1 | LoRA TTS sobre CosyVoice3 | no disponible | no disponible | no disponible en la informacion | Hugging Face |

La comparación directa con otros reconocedores de taigi no está disponible en la información proporcionada; los modelos comparables citados son sistemas de síntesis evaluados con el mismo protocolo, no reconocedores alternativos.

## Limitaciones y advertencias

- Tonos: una de cada diez sílabas con letras correctas lleva el tono equivocado, y el modelo escribe tonos de diccionario (citación), no tonos sandhi. El scorer mide sílabas, no corrección tonal; los tonos requieren juicio humano.
- Voces nuevas: 29,2 % de SER en hablantes no vistos y 23,2 % en grabaciones reales de las frases difíciles.
- Solo habla leída: entrenado con frases cortas de Common Voice (media de 2,6 segundos); conversación, micrófonos lejanos y ruido no están probados.
- Habla en mandarín: se transcribe como sus sonidos en Tâi-lô, no se traduce a taigi.
- Sin puntuación y sin caracteres han en la salida.
- Las métricas son concordancia con las transcripciones de Common Voice, que indican lo que cada lector debía leer; nadie escuchó para verificarlas.
- Es un instrumento de comparación de voces sobre las mismas frases más que un transcriptor general.
- Proyecto de una sola persona con la mayor parte del código generada por un modelo de lenguaje; sin descargas ni likes en el momento de la consulta.
- Licencia apache-2.0 en el adaptador; las condiciones del modelo base Breeze-ASR-26 no se detallan en la información disponible y deben verificarse antes de uso comercial.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Ryanjelly/gua-hang-taigi-asr
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-26
- Voz TTS asociada: https://huggingface.co/Ryanjelly/gua-hang-taigi-tts
- Voz comparada OmniVoice-Taigi-SuiSiann: https://huggingface.co/ga642381/OmniVoice-Taigi-SuiSiann
- Voz comparada taigi-cosyvoice3-lora-v0.1: https://huggingface.co/leon80148/taigi-cosyvoice3-lora-v0.1
- Frases de test: bench/everyday.jsonl y bench/cv24.jsonl (incluidas en el repositorio del modelo)
