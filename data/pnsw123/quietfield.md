# pnsw123/quietfield

## Resumen

`pnsw123/quietfield` es un repositorio de pesos en formato GGUF para reconocimiento automatico del habla (ASR). No es un modelo entrenado por su autor: contiene dos conversiones cuantizadas de modelos de audio publicados por terceros (Cohere Labs y OpenAI) cuyo unico proposito declarado es centralizar las descargas en un unico punto. La model card lo deja explicito: "no fine-tuning or other modification has been applied".

El repositorio agrupa dos ficheros: `cohere-transcribe-arabic-07-2026-Q4_K_M.gguf` (1,56 GB, derivado de `CohereLabs/cohere-transcribe-arabic-07-2026`) y `whisper-small.en-Q8_0.gguf` (0,27 GB, derivado de `openai/whisper-small.en`). El recuento de parametros reportado por los safetensors del repositorio es de 2.049.026.832, aunque la informacion disponible no desglosa cuantas corresponden a cada fichero. El modelo principal es un encoder-decoder de tipo transformer con codificacion posicional relativa, orientado a arabe e ingles.

Su relevancia no esta en la arquitectura ni en el rendimiento, sino en la documentacion tecnica que acompana a los pesos: la model card explica de forma cuantitativa por que estos modelos no pueden transcribir grabaciones de varias horas en una sola pasada y como segmentar correctamente la senal de audio. Es, en la practica, una nota de ingenieria sobre los limites reales del encoder y del decodificador, con cifras de recuperacion de frases medidas sobre audio en arabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer para ASR; encoder con codificacion posicional relativa (tensores `attn.linear_pos`, `attn.pos_bias_u`, `attn.pos_bias_v`), 48 capas y 8 cabezas en el encoder |
| Parametros totales | 2.049.026.832 (recuento de safetensors del repositorio; no se desglosa por fichero en la informacion disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de un LLM. Limite de audio del encoder: 400,0 s (`stt.cohere.encoder.pos_emb_max_len = 5000`, 12,5 frames/s). Limite del decodificador: `stt.cohere.decoder.max_seq_len = 1024`, con parada observada a los 512 tokens generados |
| Tipos de cuantizacion | Q4_K_M (modelo de arabe), Q8_0 (Whisper small.en) |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`library_name: gguf`) |
| Autor del repositorio | pnsw123 |
| Modelos base | `CohereLabs/cohere-transcribe-arabic-07-2026`, `openai/whisper-small.en` |
| Pipeline declarado | `automatic-speech-recognition` |
| Tamano del repositorio | 1,8 GB |
| Ficheros publicados | `cohere-transcribe-arabic-07-2026-Q4_K_M.gguf` (1,56 GB), `whisper-small.en-Q8_0.gguf` (0,27 GB) |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: publica conversiones a GGUF de dos releases previos, sin fine-tuning ni modificacion de pesos. El componente principal es el modelo de transcripcion en arabe de Cohere Labs, un encoder-decoder con 48 capas y 8 cabezas en el encoder y decodificador autorregresivo. El encoder aplica submuestreo 8x sobre las tramas acusticas: con `hop_length` 160 a 16 kHz se obtienen 100 tramas por segundo, que quedan en 12,5 tramas por segundo tras el submuestreo. El decodificador esta configurado con `max_seq_len = 1024`.

La innovacion tecnica relevante no esta en el modelo, sino en el analisis de limites que incluye la model card. El encoder usa codificacion posicional *relativa*, calculada en inferencia, y ningun tensor impone un tope de longitud de secuencia: el valor `pos_emb_max_len = 5000` (equivalentes a 400,0 s de audio) es metadato, no un peso entrenado. El autor comprobo que editando ese campo a 15000 el modelo acepta 6694 tramas en una pasada, pero el resultado es una transcripcion de aproximadamente la mitad de longitud que la misma senal dividida en dos pasadas dentro de especificacion. El limite que realmente gobierna es el del decodificador, que trunca a 512 tokens y solo expone la salida parcial en el mensaje de error.

El segundo componente, `whisper-small.en`, es la variante pequena en ingles de la familia Whisper de OpenAI, convertida a Q8_0 sin modificaciones. La informacion disponible no detalla su numero de capas, cabezas ni datos de entrenamiento; se remite al release upstream. Para segmentacion de audio largo, la model card remite al metodo de "Cut & Merge" con VAD descrito en Bain et al., *WhisperX: Time-Accurate Speech Transcription of Long-Form Audio* (Interspeech 2023).

## Capacidades

- Transcripcion de voz a texto en arabe y en ingles.
- Aplicacion de normalizacion inversa de texto (ITN): la transcripcion correcta es legitimamente mas corta que el audio de origen en numero de caracteres.
- Procesamiento de audio por segmentos con concatenacion posterior de resultados, sin necesidad de solapamiento ni deduplicacion a nivel de token si el corte se hace en una pausa (silencio).
- Integracion en pipelines de segmentacion basados en VAD (deteccion de actividad de voz).
- Generacion de transcripciones con marcas de tiempo si se combina con herramientas externas tipo WhisperX (capacidad de la herramienta, no declarada como nativa en la model card).
- Ejecucion en formato GGUF, lo que permite despliegue en runtimes ligeros y en CPU.
- No soporta tool calling ni function calling: es un modelo ASR, no un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio generation ni modo "thinking".
- No cubre castellano ni otros idiomas distintos de arabe e ingles.

## Casos de uso

- Transcripcion de reuniones corporativas en arabe: dividiendo la grabacion en segmentos de unos 60 s cortados en pausas y concatenando las salidas, el modelo cubre reuniones de una a dos horas sin superar el presupuesto del decodificador.
- Subtitulado de contenido audiovisual en arabe: la segmentacion por VAD coincide con las pausas naturales del habla, de modo que los cortes se alinean con fronteras de frase y producen subtitulos utilizables sin partir palabras.
- Analitica de llamadas de atencion al cliente: transcripcion de lotes de grabaciones telefonicas de duracion corta o media para alimentar sistemas de busqueda, clasificacion de motivos de contacto y control de calidad.
- Archivado y busqueda en fondos documentales sonoros: conversion de archivos de audio en arabe a texto indexable, con verificacion de integridad de los ficheros mediante los hashes SHA-256 publicados antes de procesar lotes grandes.
- Transcripcion de entrevistas y trabajo periodistico: la combinacion con herramientas de alineacion temporal permite obtener transcripciones con marcas de tiempo, utiles para citar fragmentos concretos.
- Generacion de datos de entrenamiento ASR: uso de los dos modelos como etiquetadores automaticos (pseudo-labeling) para crear corpus en arabe o ingles a partir de audio sin transcripcion.
- Dictado y notas de voz en ingles en equipos sin GPU: el fichero Q8_0 de 0,27 GB cabe en memoria de sistemas muy modestos y permite transcripcion local sin enviar audio a servicios externos.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local sobre GGUF, el audio sensible (sanitario, legal, financiero) no sale de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, WER sobre conjuntos estandar) en la informacion disponible. La model card si incluye mediciones propias de recuperacion de frases sobre audio en arabe, puntuando recall de frases distintas del origen en lugar de contar caracteres, dado que el modelo aplica normalizacion inversa de texto:

| Audio | Segmentos | Frases recuperadas |
|---|---|---|
| 16 min | 18 | 148/150 (99%) |
| 56 min | 65 | 500/500 (100%) |
| 1 h 55 min | 135 | 1000/1000 (100%) |
| 16 min, segmentado al limite del encoder (400 s) | no disponible | 40/150 (27%) |

El ultimo caso ilustra el fallo silencioso documentado: dimensionar los segmentos al techo del encoder en lugar de al presupuesto del decodificador hace que la mayoria de segmentos se trunquen y fallen.

Coste de atencion del encoder, calculado en la model card a partir de la longitud de secuencia (atencion cuadratica, 8 cabezas y 48 capas):

| Audio | Tramas | Atencion, por cabeza y capa |
|---|---|---|
| 400 s | 5000 | 0,1 GB |
| 1 h 55 min | 86.362 | 14,9 GB |
| 3 h | 135.000 | 36,5 GB |

Una sola capa del caso de tres horas necesitaria unos 292 GB sumando todas sus cabezas, y el encoder tiene 48 capas.

## Requisitos de hardware

- VRAM estimada para `cohere-transcribe-arabic-07-2026-Q4_K_M.gguf`: del orden de 2-3 GB contando pesos (1,56 GB) y activaciones para segmentos de 60 s. Estimacion aritmetica a partir del tamano de fichero; no hay mediciones publicadas en la informacion disponible.
- VRAM estimada para `whisper-small.en-Q8_0.gguf`: por debajo de 1 GB. Cabe en practicamente cualquier GPU de consumo e incluso en inferencia sobre CPU.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de memoria es suficiente para el fichero Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 y H100 quedan sobradamente dimensionadas para este modelo. El cuello de botella no es el peso, sino la longitud de secuencia.
- Memoria para secuencias largas: si se fuerza al encoder por encima de los 400 s, el coste de atencion crece de forma cuadratica (14,9 GB por cabeza y capa para 1 h 55 min). Esto invalida el enfoque de "subir el limite y transcribir de una pasada", incluso en H100.
- Despliegue: al tratarse de pesos GGUF, los runtimes naturales son llama.cpp y whisper.cpp, ademas de gestores locales tipo Ollama. La model card menciona un comando `cohere run` en sus ejemplos; no se aportan mas detalles de ese runtime en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de factor de tiempo real ni de tokens por segundo.
- Verificacion de integridad recomendada antes de desplegar en produccion, con los hashes publicados:
  - `cohere-transcribe-arabic-07-2026-Q4_K_M.gguf`: `4671080cd10ffc6166e1e1b36216f9b51e1455f170d55c59cff7b81332ad4621`
  - `whisper-small.en-Q8_0.gguf`: `9614e6b7fda2d26018e4f268aece8ca25a83296ea0b534169a585b740bfd71ef`

## Comparativa con modelos similares

| Modelo | Parametros | Limite de audio / contexto | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| quietfield (cohere-transcribe-arabic-07-2026 Q4_K_M) | 2.049.026.832 en total en el repositorio, sin desglose por fichero | 400 s de encoder, 512 tokens de decodificador en la practica | Q4_K_M | ar, en | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| quietfield (whisper-small.en Q8_0) | Ver fila anterior (sin desglose) | No disponible | Q8_0 | en | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| `CohereLabs/cohere-transcribe-arabic-07-2026` (upstream) | No disponible | `pos_emb_max_len = 5000`, `max_seq_len = 1024` | No disponible | ar (principal) | Apache 2.0 (heredada) | Publico en HuggingFace |
| `openai/whisper-small.en` (upstream) | No disponible | No disponible | No disponible | en | Apache 2.0 | Publico en HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos ni frente a alternativas como Whisper large-v3, por lo que no es posible establecer una comparacion de rendimiento con cifras verificables. La ventaja diferencial de `quietfield` frente a los releases originales es exclusivamente practica: ambos modelos se descargan desde un unico repositorio en formato GGUF listo para runtimes ligeros, con hashes de verificacion publicados.

## Limitaciones y advertencias

- Truncacion del decodificador: en la practica la generacion se detiene a los 512 tokens. Una transcripcion de tres horas en arabe ronda los 90.000-150.000 tokens, de modo que una sola pasada puede emitir en torno al 0,4% del total. Subir el tope declarado a 1024 solo llega al 0,9% y no cierra la brecha.
- La salida parcial de una pasada que excede el presupuesto no se devuelve como transcripcion corta: el proceso falla y el fragmento solo esta disponible en el mensaje de error. El fallo es silencioso en cuanto a calidad, no ruidoso.
- Manipular `pos_emb_max_len` para aceptar audio mas largo produce transcripciones incompletas: en la prueba documentada, el resultado fue aproximadamente la mitad de largo que la misma senal dividida en dos pasadas dentro de especificacion.
- Coste cuadratico de la atencion: elevar el limite del encoder no es viable en memoria para audios de horas, ni siquiera en aceleradores de gama alta.
- Es obligatorio segmentar el audio. El tamano recomendado es de unos 60 s dimensionados al presupuesto del decodificador, con reintento que subdivida cualquier segmento que se trunque. Segmentar al limite de 400 s del encoder degrada la recuperacion al 27% en el caso medido.
- Cobertura idiomatica muy limitada: solo arabe e ingles. No hay soporte de castellano, lo que descarta su uso directo en productos en espanol.
- No se han publicado evaluaciones de sesgo, tasas de alucinacion ni WER sobre conjuntos estandar. La model card no incluye ninguna metrica de robustez ante ruido, acentos o solapamiento de hablantes.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni evaluaciones de terceros sobre estas conversiones concretas.
- Al no haberse aplicado fine-tuning, se heredan sin cambios los sesgos y errores de los modelos upstream, incluida cualquier limitacion dialectal del modelo de arabe.
- Los ficheros pueden contener discrepancias respecto a los originales por el proceso de conversion y cuantizacion; conviene validar la calidad antes de usarlos en produccion.
- Licencia Apache 2.0 en ambos ficheros, heredada de los autores originales, por lo que se permite uso comercial. El credito de los modelos corresponde a los equipos upstream, no al autor del repositorio.
- Las URLs de busqueda web devueltas no contienen informacion relevante sobre el modelo (resultan ser guias sobre impresoras en Windows); no se ha podido recopilar documentacion adicional externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pnsw123/quietfield
- Modelo base (arabe): https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Modelo base (ingles): https://huggingface.co/openai/whisper-small.en
- Referencia metodologica citada en la model card: Bain et al., *WhisperX: Time-Accurate Speech Transcription of Long-Form Audio* (Interspeech 2023); sin enlace disponible en la informacion proporcionada
- Enlaces adicionales relevantes: no disponibles (los resultados de busqueda web no contienen informacion sobre este modelo)
