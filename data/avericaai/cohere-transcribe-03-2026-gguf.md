# avericaai/cohere-transcribe-03-2026-gguf

## Resumen

Cohere Transcribe 03-2026 es un modelo de reconocimiento automatico del habla (ASR) de 2.049 millones de parametros desarrollado por Cohere y Cohere Labs. Se trata de un modelo dedicado audio-entrada/texto-salida que cubre 14 idiomas y que se distribuye con licencia Apache-2.0, lo que lo convierte en una alternativa abierta a sistemas propietarios de transcripcion. La ficha que nos ocupa, `avericaai/cohere-transcribe-03-2026-gguf`, es una conversion a formato GGUF del modelo original, empaquetada para su uso con el runtime `transcribe.cpp`.

El modelo emplea una arquitectura hibrida: un encoder Conformer seguido de una cabeza encoder-decoder de tipo Transformer con atencion cruzada y embeddings de token compartidos. La decodificacion es autorregresiva y trabaja sobre audio de entrada en WAV mono a 16 kHz. El repositorio GGUF incluye seis niveles de cuantizacion (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con tamanos que van de 4,11 GB a 1,56 GB, lo que permite desplegarlo en hardware modesto sin perdida apreciable de precision.

La relevancia actual de esta conversion radica en que habilita inferencia local y offline de un ASR multilingue de calidad competitiva (WER del 1,24-1,27 % en LibriSpeech test-clean) sin depender de APIs en la nube. El soporte de CPU, Metal y Vulkan en `transcribe.cpp` amplia el abanico de plataformas, desde portatiles hasta servidores sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + cabeza encoder-decoder Transformer (atencion cruzada, embeddings de token compartidos) |
| Parametros totales | 2.049.026.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko (14) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un encoder Conformer, especializado en capturar dependencias locales y globales en secuencias de audio, con una cabeza encoder-decoder Transformer que aplica atencion cruzada sobre las representaciones del encoder y comparte los embeddings de token entre entrada y salida. La decodificacion es autorregresiva y el modelo consume audio WAV mono a 16 kHz, produciendo la transcripcion directamente sin necesidad de un modelo de lenguaje externo.

No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. La model card original de Cohere Labs no detalla estos aspectos en la informacion proporcionada. La conversion GGUF fue portada desde el commit `76b8b23` del modelo base (fijado el 2026-04-16) y validada contra la referencia de Transformers en el commit `bf0d0b7` de `transcribe.cpp` el 2026-04-18.

## Capacidades

- Transcripcion de voz a texto offline en 14 idiomas: ingles, frances, aleman, espanol, italiano, portugues, neerlandes, polaco, griego, arabe, japones, chino, vietnamita y coreano.
- Procesamiento de audio WAV mono a 16 kHz como unica entrada; requiere conversion previa de otros formatos con herramientas como ffmpeg.
- Decodificacion autorregresiva con decodificacion greedy y sin modelo de lenguaje externo.
- No soporta streaming (marcado como `streaming: false` en los metadatos).
- No soporta traduccion (marcado como `translate: false`).
- No soporta deteccion de idioma (marcado como `lang_detect: false`).
- No genera marcas de tiempo (marcado como `timestamps: none`).
- No dispone de tool calling ni capacidades de agente; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar grabaciones completas en WAV mono a 16 kHz y generar la transcripcion en cualquiera de los 14 idiomas soportados, adecuado para equipos distribuidos internacionalmente que necesitan actas en varios idiomas sin enviar audio a servicios externos.
- Subtitulado de contenido audiovisual: integrado en un pipeline con ffmpeg para extraer y convertir la pista de audio, el modelo genera el texto base para subtitulos; al no producir marcas de tiempo, requiere un paso adicional de alineacion forzada.
- Atencion al cliente y centros de contacto: transcripcion de llamadas grabadas para analisis de calidad y compliance, con la ventaja de que el procesamiento es local y no expone datos sensibles a terceros.
- Investigacion en linguistica computacional: generacion de transcripciones de corpus orales multilingues con WER bajo (3,24 % en italiano, 3,97 % en espanol sobre FLEURS), util para estudios comparativos entre lenguas.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en aplicaciones de escritorio o moviles, gracias a las cuantizaciones Q4_K_M (1,56 GB) que caben en hardware de consumo.
- Despliegue en entornos sin conectividad: el runtime `transcribe.cpp` permite ejecucion en CPU con soporte Metal y Vulkan, lo que habilita la transcripcion en dispositivos edge, portatiles o servidores aislados sin acceso a internet.
- Archivado y documentacion historica: transcripcion masiva de archivos de audio en varios idiomas para digitalizacion de fondos documentales sonoros.

## Benchmarks y rendimiento

Resultados de WER/CER sobre FLEURS con cuantizacion Q8_0 (los datos de CER se aplican a japones, coreano y chino; el resto son WER):

| Idioma | Metrica | Q8_0 |
|---|---|---|
| Aleman | WER FLEURS | 5,06 % |
| Griego | WER FLEURS | 8,96 % |
| Ingles | WER FLEURS | 5,08 % |
| Espanol | WER FLEURS | 3,97 % |
| Frances | WER FLEURS | 5,23 % |
| Italiano | WER FLEURS | 3,24 % |
| Neerlandes | WER FLEURS | 7,16 % |
| Polaco | WER FLEURS | 6,15 % |
| Portugues | WER FLEURS | 5,18 % |
| Vietnamita | WER FLEURS | 7,39 % |
| Arabe | WER FLEURS | 13,60 % |
| Japones | CER FLEURS | 5,13 % |
| Coreano | CER FLEURS | 6,57 % |
| Chino | CER FLEURS | 11,18 % |

Resultados en LibriSpeech test-clean (2.620 enunciados, greedy, sin LM externo):

| Cuantizacion | WER LibriSpeech test-clean |
|---|---|
| BF16 | 1,26 % |
| F16 | 1,26 % |
| Q8_0 | 1,27 % |
| Q6_K | 1,27 % |
| Q5_K_M | 1,25 % |
| Q4_K_M | 1,24 % |

La cifra autoinformada por Cohere en el mismo split es 1,25 % (Open ASR Leaderboard, a fecha 2026-03-26), calculada con el mismo normalizador `Whisper EnglishTextNormalizer`.

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 11,36 |
| Apple M4 Max | Metal | 75,83 |
| AMD Ryzen 4750U | CPU | 4,31 |
| AMD Ryzen 4750U | Vulkan | 8,09 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB para BF16/F16, 2,8 GB para Q8_0, 2,2 GB para Q6_K, 2,0 GB para Q5_K_M y 1,8 GB para Q4_K_M (incluyendo overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones bajas; RTX 3060/4060 o superiores para Q8_0; A100/H100 no son necesarias dado el reducido tamano del modelo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna con 4-6 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M a Q8_0.
- Opciones de despliegue: `transcribe.cpp` (runtime oficial de esta conversion, con backends CPU, Metal y Vulkan); el modelo base puede ejecutarse con Transformers. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: los valores RTF indican que en un Ryzen 4750U con CPU el modelo procesa audio a 4,31 veces tiempo real; con Vulkan, 8,09x. En un Apple M4 Max con Metal alcanza 75,83x tiempo real, y 11,36x en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| Cohere Transcribe 03-2026 (este) | 2,05 B | 14 | 1,24-1,27 % | Apache-2.0 | GGUF / safetensors |
| Whisper large-v3 | no disponible en la informacion | no disponible | no disponible | MIT (segun conocimiento general, no verificado aqui) | no disponible |
| Otros wrappers GGUF del mismo modelo base (`tryambientai`, `memoravox`) | 2,05 B | 14 | mismos valores (misma conversion) | Apache-2.0 | GGUF |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa fiable. Las conversiones de `tryambientai` y `memoravox` son variantes del mismo modelo base y comparten las mismas cifras de referencia.

## Limitaciones y advertencias

- El modelo no soporta streaming, por lo que no es adecuado para transcripcion en tiempo real con alimentacion continua de audio.
- No genera marcas de tiempo (`timestamps: none`), lo que limita su uso directo en subtitulado sin un paso posterior de alineacion.
- No soporta traduccion ni deteccion automatica de idioma; el idioma debe seleccionarse o inferirse externamente.
- El WER en arabe (13,60 %) y el CER en chino (11,18 %) son notablemente superiores a los de las lenguas europeas, lo que refleja un rendimiento desigual entre idiomas.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios prolongados o habla solapada; como todo modelo ASR autorregresivo, puede generar texto plausible no presente en el audio.
- La entrada debe ser WAV mono a 16 kHz; otros formatos requieren conversion previa, lo que anade un paso al pipeline.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el aviso `NOTICE` del repositorio y la model card original de Cohere Labs para los terminos completos.
- Esta ficha corresponde a una conversion de terceros (`avericaai`); la fuente autoritativa es el modelo base `CohereLabs/cohere-transcribe-03-2026`.
- No se dispone de informacion sobre sesgos demograficos o acusticos especificos del modelo en la documentacion proporcionada.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/avericaai/cohere-transcribe-03-2026-gguf
- Modelo base original: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Commit del modelo base usado para la conversion: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026/commit/76b8b23
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-03-2026.md
- Conversion alternativa (tryambientai): https://huggingface.co/tryambientai/cohere-transcribe-03-2026-gguf
- Conversion alternativa (memoravox): https://huggingface.co/memoravox/cohere-transcribe-03-2026-gguf
