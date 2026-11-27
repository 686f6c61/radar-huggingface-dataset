# Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-q8_0

## Resumen

Este repositorio contiene una cuantización GGUF q8_0 del modelo de reconocimiento automático del habla (ASR) `Scrya/parakeet-tdt-0.6b-singlish-v1`, un ajuste fino de NVIDIA Parakeet-TDT-0.6B-v3 especializado en inglés de Singapur (singlish) en entornos de sala de reuniones. El modelo original fue entrenado por Scrya sobre 1.386 horas de audio conversacional del National Speech Corpus (NSC) de IMDA, en cinco de sus particiones, y esta versión lo empaqueta en un único fichero de 0,71 GB ejecutable con NeMo-Speech.cpp 0.3.0, el runtime en C++ de NVIDIA para modelos de voz NeMo. Con 637.329.158 parámetros, es un modelo compacto pensado para transcripción de alta velocidad en hardware de consumo.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo de cuantización de modelos ASR basados en transductores a GGUF para runtimes ligeros, algo poco habitual frente al ecosistema dominante de Whisper. Por otro, ofrece una alternativa especializada en un dialecto del inglés concreto (singlish) que los modelos ASR generalistas suelen transcribir mal, con un WER normalizado del 8,48 % en la muestra de evaluación del autor y una velocidad de 265 veces tiempo real en una RTX 5090 con batching de 16 clips.

El autor advierte que la versión 2 del modelo (con su propio GGUF q8_0) comete menos errores en todos los conjuntos de prueba de NeMo-Speech.cpp, por lo que esta versión 1 debe considerarse histórica salvo que se necesite reproducibilidad exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) de Parakeet, ajustado sobre Parakeet-TDT-0.6B-v3 |
| Parametros totales | 637.329.158 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR; no se especifica ventana de audio máxima) |
| Tipos de cuantizacion | GGUF q8_0 (este repositorio); existe variante f16 en repositorio hermano |
| Idiomas soportados | Inglés (en), con especialización en inglés de Singapur (singlish) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (fichero `parakeet-tdt-0.6b-v3-nsc5-74f31217.q8_0.gguf`, 0,71 GB); el modelo base también está en safetensors y `.nemo` |

## Arquitectura y entrenamiento

El modelo base es Parakeet-TDT-0.6B-v3 de NVIDIA, un transductor TDT (Token-and-Duration Transducer): un modelo de ASR que predice conjuntamente tokens de texto y duraciones, lo que permite decodificación no autorregresiva por saltos y reduce el coste computacional frente a los transductores clásicos. Scrya lo ajustó sobre 1.386 horas de audio conversacional de cinco particiones del National Speech Corpus de IMDA (Part 3 SDM, Part 3 Same Room, Part 4, Part 5 y Part 6.3), con datos y ajustes de entrenamiento orientados a habla en salas de reuniones. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de audio ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR).

La innovación de esta ficha concreta es la conversión a GGUF q8_0 para NeMo-Speech.cpp 0.3.0, el runtime en C++ de NVIDIA. Según el autor, la cuantización introduce una diferencia mínima frente al original en transformers fp32: reproduce exactamente el mismo texto en 4.686 de 5.000 clips de evaluación, y el batching de 16 clips solo altera el texto de 18 clips sin cambiar el WER. La decodificación usa un límite de 3 tokens por fotograma de audio y modo `--verbatim` para evitar que el runtime reescriba números.

## Capacidades

- Transcripción de voz a texto en inglés, con especialización en inglés de Singapur conversacional y en audio de salas de reuniones.
- Salida con puntuación y mayúsculas, y números escritos con letras (por ejemplo, "twenty five" en lugar de "25").
- Procesamiento por lotes en GPU (`--concurrency 16`) y transcripción de ficheros individuales o de carpetas completas.
- Servicio HTTP compatible con la API de transcripciones de OpenAI (`/v1/audio/transcriptions`), utilizable con el paquete `openai` de Python.
- Marcas de tiempo a nivel de palabra mediante `response_format=verbose_json`.
- Endpoints de salud y listado de modelos (`GET /ready`, `GET /v1/models`).
- Autenticación opcional por API key mediante la variable de entorno `NEMO_SPEECH_HTTP_API_KEY`.
- Ejecución en GPU (CUDA) o en CPU (configurando `gpu: -1`).
- No soporta tool calling, agentes, visión, audio de entrada más allá de la transcripción ni modo de razonamiento: es un modelo ASR puro.

## Casos de uso

- Transcripción de reuniones corporativas en Singapur: el ajuste sobre 1.386 horas del NSC con particiones de sala y mismo entorno lo hace adecuado para actas automáticas de reuniones con hablantes de singlish, donde los ASR generalistas fallan en vocabulario y pronunciación local.
- Generación de subtítulos y actas en pipelines por lotes: con 265 veces tiempo real en una RTX 5090 y batching de 16 clips, se pueden procesar archivos de audio de forma masiva en un servidor modesto.
- Servicio de transcripción interno compatible con OpenAI: el servidor `nemo-speech serve` expone la API de transcripciones, de modo que herramientas existentes que apuntan a `base_url` de OpenAI pueden redirigirse sin cambios de código.
- Indexación y búsqueda de archivos de audio de contact center: la salida con puntuación y marcas de tiempo por palabra permite indexar conversaciones y construir búsqueda sobre el texto transcrito.
- Prototipado en hardware de consumo: el fichero de 0,71 GB cabe en GPUs de consumo y permite desplegar ASR local sin depender de servicios en la nube, útil para entornos con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones ASR: sirve como referencia para medir el impacto de q8_0 frente a f16 y fp32 en un transductor TDT, dado que el autor publica diferencias de WER con intervalos de confianza.
- Transcripción en CPU para entornos sin GPU: el runtime permite `gpu: -1`, aunque no se publican cifras de latencia en CPU.

## Benchmarks y rendimiento

Datos publicados por el autor sobre una muestra de 5.000 clips aleatorios (1.000 por partición, 7,15 horas), comparando este fichero con el modelo original en transformers fp32 con decodificación greedy:

| Modelo | WER normalizado | WER formateado | Diferencia normalizada | Velocidad en RTX 5090 |
|---|---:|---:|---|---:|
| Original (transformers, fp32) | 8,54 % | 15,79 % | — | — |
| Este fichero, 1 clip a la vez | 8,48 % | 15,70 % | -0,06 [-0,10, -0,02] | 199x tiempo real |
| Este fichero, 16 clips a la vez | 8,49 % | 15,71 % | -0,05 [-0,09, -0,01] | 265x tiempo real |

Desglose por partición del NSC (WER normalizado y formateado):

| Partición | Original normalizado | Este fichero normalizado | Original formateado | Este fichero formateado |
|---|---:|---:|---:|---:|
| Part 3 SDM | 9,90 % | 9,94 % | 16,63 % | 16,64 % |
| Part 3 Same Room | 10,91 % | 10,80 % | 16,27 % | 16,18 % |
| Part 4 | 14,70 % | 14,60 % | 23,26 % | 23,12 % |
| Part 5 | 6,40 % | 6,32 % | 12,98 % | 12,83 % |
| Part 6.3 | 6,07 % | 6,02 % | 13,98 % | 13,92 % |

El autor indica que la variante f16 ocupa el doble y produce texto más cercano al original, pero no obtiene mejor puntuación que este fichero q8_0. No se han publicado comparaciones con Whisper u otros ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 0,71 GB; con overhead del runtime y batching de 16 clips, la huella es muy inferior a la de un modelo de 0,6B en fp16 (aproximadamente 1,3 GB de pesos). No se publica una cifra exacta de VRAM pico.
- GPU recomendadas: el autor reporta velocidades en una RTX 5090 (199x tiempo real con un clip y 265x con 16 clips). Por tamaño, cabe con holgura en cualquier GPU con 4 GB o más de VRAM; no se publican cifras para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, dado el tamaño del fichero; se espera que funcione en GTX 1060 6 GB, RTX 3060, RTX 4060 y superiores, aunque no hay mediciones publicadas para esas tarjetas.
- Opciones de despliegue: NeMo-Speech.cpp 0.3.0 (CLI `nemo-speech transcribe` y servidor `nemo-speech serve`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; el formato GGUF es específico del runtime de NVIDIA para modelos de voz.
- Latencia y throughput: 199x tiempo real con un clip y 265x con 16 clips en RTX 5090, incluyendo arranque del runtime y carga del modelo. No hay datos de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (singlish, muestra del autor) | Licencia | Formato |
|---|---|---:|---|---|---|
| Este modelo (Parakeet-TDT-0.6B singlish v1, GGUF q8_0) | 637 M | No disponible | 8,48 % normalizado | CC-BY-4.0 | GGUF |
| Scrya/parakeet-tdt-0.6b-singlish-v1 (original, fp32) | 637 M | No disponible | 8,54 % normalizado | CC-BY-4.0 | safetensors, `.nemo` |
| Scrya/parakeet-tdt-0.6b-singlish-v2 (GGUF q8_0) | 637 M (base) | No disponible | Menos errores que v1 en todos los conjuntos NSC según el autor (sin cifras en esta información) | CC-BY-4.0 | GGUF |
| NVIDIA Parakeet-TDT-0.6B-v3 (base) | 600 M aprox. | No disponible | No evaluado en singlish en esta información | No disponible en esta información | safetensors, `.nemo` |

No se dispone de datos de Whisper u otros ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado en inglés de Singapur; su rendimiento en otros dialectos o idiomas no está medido y probablemente sea peor.
- Especialización estrecha: el ajuste está orientado a salas de reuniones y audio conversacional del NSC; puede degradarse en otros dominios (llamadas telefónicas, audio con ruido, acentos no singapurenses).
- La versión 2 del modelo comete menos errores en todos los conjuntos de prueba de NeMo-Speech.cpp según el autor; esta versión 1 es histórica y no debería elegirse para nuevos despliegues salvo por reproducibilidad.
- Confianza por palabra no fiable: con `verbose_json`, NeMo-Speech.cpp 0.3.0 asigna confianza 1 a todas las palabras porque no calcula confianza para modelos transductores.
- El servidor HTTP no tiene API key por defecto; hay que definir `NEMO_SPEECH_HTTP_API_KEY` antes de exponerlo en red.
- Riesgo de alucinación inherente a los modelos ASR: pueden generar texto plausible en segmentos con silencio o ruido; no se han publicado análisis específicos de este comportamiento.
- Sesgos: no se documentan sesgos demográficos ni de acento en la información disponible; el corpus NSC está limitado a hablantes de Singapur.
- Licencia CC-BY-4.0: permite uso comercial con atribución; hay que conservar la atribución a Scrya y a NVIDIA como autores del modelo base.
- Dependencia de un runtime concreto: requiere NeMo-Speech.cpp 0.3.0; no hay soporte documentado en llama.cpp, Ollama u otros motores GGUF.
- El repositorio tiene 55 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-q8_0
- Modelo base (safetensors y `.nemo`): https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1
- Versión 2 del modelo en GGUF q8_0: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-q8_0
- Variante f16 de este modelo: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-f16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
