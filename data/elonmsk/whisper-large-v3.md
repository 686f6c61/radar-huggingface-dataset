# Elonmsk/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz a texto desarrollado por OpenAI, publicado junto al paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., arXiv:2212.04356). La ficha que nos ocupa, `Elonmsk/whisper-large-v3`, no es un entrenamiento propio: es una resubida de terceros de los pesos de `openai/whisper-large-v3`, con el mismo pipeline `automatic-speech-recognition` y 1.543.490.560 parametros reales confirmados en los safetensors.

Tecnicamente es un transformer encoder-decoder seq2seq que consume espectrogramas log-Mel de 128 bandas (frente a 80 en large y large-v2) y genera tokens de texto con marcas de tiempo opcionales. Se entreno con 1 millon de horas de audio debilmente etiquetado mas 4 millones de horas pseudo-etiquetadas con large-v2, durante 2,0 epocas, y la model card reporta una reduccion del 10% al 20% de errores frente a large-v2 en una amplia variedad de idiomas.

Su relevancia practica es doble: sigue siendo una referencia solida y multilingue (99 idiomas) para transcripcion zero-shot, y es la base de todo el ecosistema de inferencia optimizada (faster-whisper, whisper.cpp, distil-whisper). Ahora bien, este repositorio concreto tiene 0 descargas, 0 likes y 24,7 GB de tamano, por lo que para produccion conviene apuntar al checkpoint oficial de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) tipo Whisper: 32 capas de encoder y 32 de decoder, dimension de modelo 1280, 20 cabezas de atencion, entrada log-Mel de 128 bandas |
| Parametros totales | 1.543.490.560 (~1,54 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento; hasta 448 tokens de decoder por segmento |
| Tipos de cuantizacion | Sin cuantizaciones incluidas en el repositorio: solo pesos completos en safetensors, PyTorch (.bin) y JAX/Flax. Para int8/int4 hay que recurrir a conversiones externas (CTranslate2, GGUF) |
| Idiomas soportados | 99 idiomas, entre ellos espanol, ingles, frances, aleman, portugues, italiano, catalan, gallego, euskera, chino, japones, coreano, arabe, hindi, turco, ruso, ucraniano, polaco, neerlandes, sueco, finlandes, vietnamita, tailandes, hebreo e indonesio; large-v3 anade un token especifico para cantonés |
| Licencia | apache-2.0 declarada en este repositorio (los pesos originales de OpenAI se publican bajo MIT) |
| Formato de pesos | safetensors, PyTorch (.bin) y Flax/JAX; no hay GGUF ni ONNX en este repo |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder clasico. El encoder procesa una ventana fija de 30 segundos de audio convertida a espectrograma log-Mel (128 bins en large-v3) y el decoder autoregresivo genera la transcripcion token a token, incluyendo tokens especiales de idioma, tarea (transcribe/translate), timestamps y prediccion de actividad de voz. El vocabulario ronda los 51.866 tokens tras anadir el token de cantonés. No hay atención lineal, SSM ni decodificacion especulativa nativa: las optimizaciones de velocidad (beam search, batching, temperature fallback, condicionamiento en tokens previos) se aplican en la capa de inferencia.

El entrenamiento es puramente supervisado con entropia cruzada sobre pares audio-texto; no se documento RLHF ni DPO. El conjunto de datos combina 1 millon de horas de audio debilmente etiquetado con 4 millones de horas pseudo-etiquetadas generadas por large-v2, sobre las que se entreno 2,0 epocas. La innovacion principal del trabajo original no es arquitectonica sino de escala y diversidad de datos: el objetivo declarado era generalizacion zero-shot a dominios y datasets no vistos, sin fine-tuning por conjunto de evaluacion.

## Capacidades

- Transcripcion de voz a texto multilingue con deteccion automatica del idioma de origen o idioma forzado por parametro (`language`).
- Traduccion de voz a texto en ingles desde cualquiera de los idiomas soportados mediante `task="translate"`.
- Prediccion de marcas de tiempo a nivel de frase (`return_timestamps=True`) y a nivel de palabra (`return_timestamps="word"`), con salida en `chunks`.
- Segmentacion de audio largo: el pipeline trocea entradas arbitrarias en ventanas de 30 s y las concatena.
- Procesamiento por lotes de varios ficheros de audio con `batch_size`.
- Heuristicas de decodificacion robusta: `temperature` en cascada, `compression_ratio_threshold`, `logprob_threshold`, `no_speech_threshold` y `condition_on_prev_tokens`.
- No soporta tool calling, function calling, agentes, vision ni audio generation: es exclusivamente un modelo ASR/ASR-translation.

## Casos de uso

- Transcripcion de reuniones y actas: el pipeline acepta audio de cualquier duracion y devuelve texto con timestamps por frase, lo que permite alinear la transcripcion con el hablante o con el minuto exacto de la grabacion.
- Subtitulado automatico de video: combinando `return_timestamps="word"` con el modo traduccion se generan subtitulos en ingles a partir de audio en castellano, con granularidad suficiente para respetar los limites de lectura.
- Atencion al cliente y analitica de llamadas: transcripcion por lotes de grabaciones de call center para alimentar buscadores, resumenes o sistemas de calidad; los 99 idiomas cubren mercados sin necesidad de un modelo por region.
- Generacion de notas clinicas o judiciales asistida: el modelo transcribe el audio bruto y el post-procesado (LLM aparte) estructura el contenido; conviene mantener revision humana por el riesgo de alucinacion en silencios.
- Indexacion y busqueda de archivos audiovisuales: transcripcion masiva de un catalogo de podcasts o clases para construir un indice full-text con marcas temporales.
- Accesibilidad: subtitulado en directo o diferido de eventos y clases magistrales, con fallback a GPU consumer para despliegues pequenos.
- Pre-etiquetado de datasets de voz: el modelo sirve como anotador inicial en la construccion de corpus ASR en idiomas con pocos recursos, que luego se revisan manualmente.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Reduccion de errores frente a large-v2 | 10% a 20% menos errores en una amplia variedad de idiomas | Dato cualitativo de la model card, sin cifras absolutas de WER |
| WER absoluto en LibriSpeech, Common Voice, FLEURS u otros | no disponible | No se publican numeros absolutos en la informacion proporcionada |
| MMLU, HumanEval, GSM8K | no aplica | Modelo de reconocimiento de voz, no de texto generativo |

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM de pesos: ~3,1 GB en fp16 y ~6,2 GB en fp32; una conversion int8 rondaria 1,5 GB.
- VRAM pico realista en fp16 con beam search y ventanas de 30 s: 4-6 GB por peticion; con lotes de 8-16, 10-16 GB.
- GPU de datacenter: A100 40/80 GB o H100 para throughput alto con lotes grandes; L4 y A10G son suficientes para servicio interactivo.
- GPU consumer: cabe holgadamente en RTX 4090/3090 (24 GB), RTX 4080 (16 GB), RTX 4070 (12 GB) y RTX 3060 (12 GB). En 8 GB (RTX 4060, 3070) funciona en fp16 con lotes pequenos.
- Por debajo de 6 GB conviene usar int8 con faster-whisper (CTranslate2) o whisper.cpp con GGUF q5/q8.
- Opciones de despliegue: `transformers` pipeline (referencia), faster-whisper/CTranslate2 (la via mas rapida en produccion), whisper.cpp para CPU y edge, y vLLM para servir Whisper con batching continuo en versiones recientes (soporte a validar segun version). TGI no esta orientado a pipelines ASR.
- Throughput orientativo (estimacion, no medida en este repositorio): del orden de 20-30x tiempo real en A100 con faster-whisper en fp16, 10-15x en RTX 4090 y 1-3x en CPU moderna con whisper.cpp. La latencia por segmento de 30 s se situa en cientos de milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3 (este repo) | 1.543 M | 30 s de audio, 448 tokens de decoder | 99 | apache-2.0 declarada aqui (MIT en el original) | Resubida de terceros, 0 descargas |
| openai/whisper-large-v3 | 1.543 M | 30 s, 448 tokens | 99 | MIT | Checkpoint oficial, ampliamente usado |
| openai/whisper-large-v2 | 1.550 M | 30 s, 448 tokens | 99 (sin token de cantonés) | MIT | Oficial; ~10-20% mas errores que v3 segun la model card |
| openai/whisper-medium | 769 M | 30 s, 448 tokens | 96 | MIT | Oficial; menor precision, menor huella de VRAM |
| distil-whisper/distil-large-v3 | 756 M | 30 s, 448 tokens | Solo ingles | MIT | Destilado de large-v3; ~2x mas rapido con WER cercano en ingles |

## Limitaciones y advertencias

- Este repositorio es una resubida no oficial con 0 descargas y 0 likes; no hay garantia de que los pesos coincidan bit a bit con los de OpenAI ni de que se mantenga actualizado. Para produccion, usar `openai/whisper-large-v3`.
- La licencia declarada (apache-2.0) difiere de la del modelo original de OpenAI (MIT); conviene verificar los terminos aplicables antes de un uso comercial.
- Alucinacion conocida en silencios, musica o ruido de fondo: el modelo puede inventar frases completas. Mitigacion con `no_speech_threshold`, `logprob_threshold` y deteccion de voz externa.
- Ventana fija de 30 segundos: audios mas largos requieren troceado y concatenacion, lo que puede introducir cortes a mitad de palabra y deriva en los timestamps.
- No hace diarizacion de hablantes ni distingue interlocutores; hay que combinarlo con un modelo de speaker diarization.
- Code-switching (cambio de idioma dentro de una misma frase) degrada notablemente la calidad; el token de idioma es unico por segmento.
- Rendimiento desigual por idioma: los idiomas con pocos recursos de la lista de 99 tienen WER muy superior al de ingles o castellano, y no hay cifras publicadas por idioma en esta ficha.
- No controla el formato de salida (puntuacion, mayusculas, numeros) de forma consistente; para normalizacion hace falta post-proceso.
- Sin tool calling, sin salida estructurada y sin capacidad de razonamiento: cualquier tarea posterior requiere un LLM adicional.
- El repositorio pesa 24,7 GB al incluir pesos en tres formatos (safetensors, PyTorch y JAX), lo que complica el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Elonmsk/whisper-large-v3
- Checkpoint oficial de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Paper: https://huggingface.co/papers/2212.04356 (arXiv:2212.04356)
- Repositorio de OpenAI: https://github.com/openai/whisper
- Documentacion del pipeline ASR en Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp (GGUF, CPU/edge): https://github.com/ggerganov/whisper.cpp
- distil-whisper: https://huggingface.co/distil-whisper/distil-large-v3
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y del ecosistema oficial de Whisper.
