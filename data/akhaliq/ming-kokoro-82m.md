# akhaliq/Ming-Kokoro-82M

## Resumen

Ming-Kokoro-82M es un modelo de texto a voz (TTS) de 82 millones de parametros desarrollado por akhaliq, derivado de Kokoro-82M de hexgrad mediante destilacion. El modelo se entrena con una receta completamente abierta: el corpus, los scripts, las configuraciones y los registros de entrenamiento son publicos, lo que permite reproducir el entrenamiento completo por unos 35 dolares de coste de GPU. Su objetivo es ofrecer sintesis de voz en dispositivos edge y on-device manteniendo compatibilidad total con el ecosistema Kokoro.

La version actual (v8) es un "estudiante" inicializado con los pesos de Kokoro-82M y reentrenado sobre un corpus de 24 horas de audio dominio-matched, sintetizado por el propio Kokoro stock, con una etapa de ajuste adversarial. Esta estrategia de emparejamiento de dominio (validada por la receta de Paradee y extendida aqui a multi-voz) resuelve el problema de desajuste de dominio que arruino la v1, que usaba como profesor a Ming-omni-tts-0.5B: la perdida de validacion baja de 5.29 a 3.14 y el UTMOS pasa de 1.86 a valores competitivos.

El resultado es un modelo drop-in en formato Kokoro: voicepacks `[510,1,256]`, salida a 24 kHz, nombres de voz estandar (`af_heart`, `am_michael`, etc.) y 12 voces en ingles. Es relevante porque demuestra que se puede destilar y reentrenar TTS ligero de forma abierta, documentada y barata, sin depender de recetas cerradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arquitectura Kokoro-82M (StyleTTS 2 / Matcha-TTS derivada, con vocoder congelado) |
| Parametros totales | 82M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (12 voces: 10 americanas, 2 britanicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`kokoro-v1_0.pth`) + voicepacks `.pt` (layout stock de Kokoro); tamano del repo 3,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Kokoro-82M, un TTS ligero basado en la linea StyleTTS 2 / Matcha-TTS, compuesto por un modulo G2P (misaki), un predictor de prosodia, vectores de voz (voicepacks) y un decodificador melodico con vocoder congelado. No es un LLM ni un modelo MoE: es un modelo de sintesis de audio cuyo pipeline procesa grafemas y fonemas.

El entrenamiento de v8 sigue una receta de destilacion dominio-matched documentada paso a paso: 12.000 enunciados muestreados de las transcripciones de LibriTTS-R (CC-BY-4.0) se sintetizan con el Kokoro stock (unas 24 horas de audio a 24 kHz en unos 20 minutos en una sola GPU). Alineacion fonema a fonema con misaki G2P y forced alignment de MMS (11.989 de 12.000 enunciados conservados, 0,1 % descartados), extraccion de pitch con Praat. El estudiante se inicializa con los pesos de Kokoro, se entrenan los vectores de voz, el predictor de prosodia y el cuerpo del decodificador (vocoder congelado) con perdidas teacher-forced de mel, STFT y duracion sobre F0 real, mas una etapa adversarial con un multi-period discriminator. Total: 6.000 pasos en una H200, con perdida de validacion final de 3,14 frente a 5,29 de la variante con profesor codec. La historia completa de iteraciones fallidas (v1 con profesor Ming-omni-tts-0.5B, UTMOS 1,86) esta documentada en el repositorio de staging.

## Capacidades

- Sintesis de texto a voz en ingles a 24 kHz con 12 voces distintas (6 femeninas americanas, 4 masculinas americanas, 1 femenina britanica, 1 masculina britanica).
- Compatibilidad drop-in con todo el ecosistema Kokoro: mismo layout de checkpoint, mismos nombres de voz, mismo formato de voicepack `[510,1,256]`.
- Control de velocidad de habla mediante el parametro `speed` del pipeline.
- Multi-voz en un unico modelo (extension de la receta Paradee, validada originalmente en mono-voz).
- Despliegue on-device y en edge gracias a sus 82M de parametros.
- Pipeline de fonemizacion incluido (misaki G2P) con salida de fonemas intermedia.
- No soporta: clonacion de voz arbitraria, otros idiomas, ni tool calling (no es un LLM).

## Casos de uso

- Narracion de audiolibros y articulos: con 12 voces de distinto caracter (calida, brillante, suave, madura), se puede asignar una voz por personaje o por seccion y generar audio a 24 kHz en local, sin coste de API.
- Asistentes de voz en dispositivos edge: con 82M de parametros y salida compatible con Kokoro, es adecuado para sintesis en tiempo real en hardware limitado (Raspberry Pi, movil, NUC) sin conexion a la nube.
- Prototipado rapido de productos de voz: al funcionar con `pip install kokoro` y una sola linea de cambio de `repo_id`, se puede sustituir Kokoro stock por este modelo en cualquier aplicacion existente para evaluar diferencias de calidad.
- Investigacion reproducible en destilacion de TTS: la receta abierta (corpus, scripts, harness, logs y coste de ~35 dolares) permite a grupos academicos o independientes reproducir y extender el entrenamiento completo.
- Generacion de voz para videojuegos y aplicaciones interactivas: las voces con personalidades diferenciadas (`am_onyx` resonante, `af_sky` ligera) permiten dialogos variados generados en tiempo de ejecucion.
- Aprendizaje de idiomas y text-to-speech educativo: la salida de fonemas intermedia del pipeline permite sincronizar audio con contenido fonetico para aplicaciones de pronunciacion.
- Sintesis por lotes en servidores modestos: dado que el profesor genero 24 horas de audio en 20 minutos en una GPU, el modelo hereda el alto throughput de Kokoro para tareas de sintesis masiva (podcasts, IVR, notificaciones).

## Benchmarks y rendimiento

El benchmark completo de v8 (WER con Whisper large-v3-turbo y UTMOSv2 de naturalidad sobre 300 enunciados) estaba en ejecucion en el momento de redactar la ficha; la tabla del repositorio se actualizara al terminar. Barras de referencia publicadas por el autor:

| Modelo | WER ↓ | UTMOSv2 ↑ |
|---|---|---|
| Kokoro-82M (stock) | 0,104 | 3,92 |
| gradium/phonon-31m-en | 0,110 | 3,61 |
| Ming-Kokoro-82M v1 (profesor Ming, fallido) | 0,102 | 1,86 |

Datos adicionales publicados: perdida de validacion de v8 de 3,14 frente a 5,29 de la variante con profesor codec. No se han publicado resultados de RTFx de v8 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del modelo (82M) y su naturaleza on-device, se espera que funcione en GPUs de consumo e incluso CPU, pero no hay cifra oficial.
- GPU recomendadas para inferencia: no disponible explicitamente; para entrenamiento se uso una NVIDIA H200 (6.000 pasos).
- Cabe en GPU de consumo: muy probablemente si dado su tamano minimo, aunque sin confirmacion oficial; la sintesis del profesor (Kokoro stock) se completo en ~20 minutos en una sola GPU.
- Opciones de despliegue: libreria `kokoro` (KPipeline) de forma nativa; por compatibilidad drop-in con el layout de Kokoro-82M, deberia funcionar en cualquier herramienta que cargue pesos y voicepacks de Kokoro. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles para v8; como referencia indirecta, el propio Kokoro stock sintetizo ~24 h de audio en ~20 minutos en una GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER | UTMOSv2 | Licencia |
|---|---|---|---|---|---|
| Ming-Kokoro-82M (v8) | 82M | Ingles (12 voces) | pendiente | pendiente | Apache-2.0 |
| Kokoro-82M (stock, hexgrad) | 82M | Multi-idioma | 0,104 | 3,92 | Apache-2.0 |
| gradium/phonon-31m-en | 31M | Ingles | 0,110 | 3,61 | no disponible |
| Ming-omni-tts-0.5B | 0,5B | no disponible | no disponible | no disponible | no disponible |

Ming-Kokoro-82M se diferencia de Kokoro stock en que es un reentrenamiento dominio-matched multi-voz con receta abierta, aunque de momento limitado al ingles, mientras que el Kokoro original cubre mas idiomas. Frente a phonon-31m-en, es mas grande pero apunta a mejor naturalidad segun las barras publicadas.

## Limitaciones y advertencias

- Solo ingles: las 12 voces son americanas o britanicas; no hay soporte para espanol ni otros idiomas, a diferencia del Kokoro stock multi-idioma.
- Los voicepacks de `voices/` estan entrenados para estos pesos: emparejarlos con el checkpoint stock de hexgrad/Kokoro-82M (o viceversa) puede producir audio incorrecto.
- El benchmark de v8 (WER/UTMOS/RTFx) no habia terminado al publicar la ficha, por lo que la calidad real frente a Kokoro stock esta pendiente de confirmacion numerica.
- El corpus de entrenamiento es audio sintetizado por el propio Kokoro: el modelo hereda posibles artefactos y sesgos del profesor, y su diversidad prosodica esta limitada a lo que Kokoro genera.
- Entrenado sobre LibriTTS-R (lectura de audiolibros): el dominio es habla leida, por lo que el rendimiento en habla espontanea, emocion intensa o cantada es desconocido.
- Riesgo de uso indebido tipico de TTS (suplantacion de voz): aunque las voces son sinteticas y no clonan hablantes reales, conviene aplicar salvaguardas en productos finales.
- Baja traccion comunitaria hasta la fecha (136 descargas, 3 likes) y proyecto de autor individual: madurez y mantenimiento a largo plazo no garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/Ming-Kokoro-82M
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Dataset/scripts de la receta: https://huggingface.co/datasets/akhaliq/ming-kokoro-distill
- Corpus de entrenamiento: https://huggingface.co/buckets/akhaliq/ming-kokoro-corpus
- Harness de entrenamiento: https://github.com/hidude562/kokoro-finetune
- Paper de referencia (Paradee): https://arxiv.org/abs/2610.06817
