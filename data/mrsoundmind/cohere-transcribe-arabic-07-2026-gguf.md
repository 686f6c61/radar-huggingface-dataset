# mrsoundmind/cohere-transcribe-arabic-07-2026-gguf

## Resumen

cohere-transcribe-arabic-07-2026 es un modelo de reconocimiento automatico del habla (ASR) de 2B parametros desarrollado por Cohere y Cohere Labs, publicado originalmente en formato Transformers y convertido a GGUF por el usuario mrsoundmind para su uso con transcribe.cpp. Esta adaptacion esta optimizada para arabe y ingles, con enfasis especial en dialectos arabes y en el cambio de codigo arabe-ingles (code-switching), un fenomeno muy frecuente en habla real de comunidades bilingues.

El modelo parte de la arquitectura Cohere Transcribe 03-2026: un encoder Conformer seguido de una cabeza encoder-decoder Transformer con atencion cruzada y embeddings de tokens compartidos (tied token embedding). La entrada es un WAV mono a 16 kHz, que se preprocesa automaticamente (resampleo a 16 kHz y promedio de canales si es estereo) y se convierte en espectrograma log-Mel. La salida es texto transcrito mediante decodificacion autoregresiva.

Esta version GGUF es relevante porque permite ejecutar el modelo fuera del ecosistema Python/Transformers, en CPU, Metal y Vulkan, con cuantizaciones que van de BF16 (4,10 GB) a Q4_K_M (1,56 GB), manteniendo el WER practicamente intacto respecto al baseline BF16 de referencia (11,00% en FLEURS arabe). El repositorio ocupa 2,4 GB y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + cabeza encoder-decoder Transformer (cross-attention, tied token embedding) |
| Parametros totales | 2.049.026.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ar, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safe tensors en el modelo base Transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Conformer con una cabeza encoder-decoder Transformer que usa atencion cruzada y embeddings de tokens compartidos entre encoder y decoder. La decodificacion es autoregresiva. El modelo toma audio a 16 kHz mono, lo convierte en espectrograma log-Mel y genera la transcripcion token a token. Es una adaptacion centrada en arabe de la arquitectura Cohere Transcribe 03-2026.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. La model card indica que el modelo esta optimizado para arabe y ingles, con foco en rendimiento sobre dialectos arabes y code-switching arabe-ingles. La conversion GGUF se realizo desde el commit upstream 0a8193c (fijado el 2026-07-07) y se valido contra la referencia de Transformers en el commit d89ecb7 de transcribe.cpp el 2026-07-07.

## Capacidades

- Transcripcion de voz a texto offline para arabe e ingles, incluyendo arabe dialectal.
- Manejo de code-switching arabe-ingles dentro de una misma locucion.
- Entrada de audio WAV mono a 16 kHz; resampleo automatico a 16 kHz y promedio de canales si la entrada es estereo (segun la model card upstream).
- Seleccion explicita de idioma mediante flag (`-l ar` o `-l en`).
- Decodificacion autoregresiva greedy.
- Capacidades explicitamente desactivadas o no soportadas: streaming (no), traduccion (no), deteccion de idioma (no), timestamps (no).
- No se mencionan tool calling, function calling, agentes ni modo thinking; no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones y entrevistas en arabe: el modelo procesa audio WAV a 16 kHz y genera transcripciones completas offline, adecuado para entornos donde no se requiere streaming ni timestamps.
- Subtitulado de contenido audiovisual arabe: conversion de audio a texto para generar subtitulos en arabe o ingles, usando `-l ar` o `-l en` segun el idioma dominante.
- Atencion al cliente con habla bilingue: transcripcion de llamadas donde los interlocutores alternan arabe e ingles, gracias al soporte de code-switching arabe-ingles.
- Investigacion linguistica sobre dialectos arabes: el modelo esta optimizado para dialectos arabes, lo que permite transcribir corpus de habla dialectal (por ejemplo, egipcio) para analisis linguistico.
- Despliegue en hardware modesto: con Q4_K_M (1,56 GB) o Q5_K_M (1,77 GB) cabe en equipos consumer y permite transcripcion local sin GPU dedicada, con RTF de 3 en CPU Ryzen 4750U y 8 en Vulkan.
- Procesamiento por lotes en servidores sin Python: la integracion con transcribe.cpp permite ejecutar la transcripcion en pipelines nativos C/C++, evitando dependencias del stack Transformers.
- Accesibilidad para personas sordas en comunidades araboparlantes: generacion de transcripciones de conversaciones y contenido hablado en arabe.

## Benchmarks y rendimiento

WER medido sobre el split de test completo de FLEURS arabe (`ar_eg`, 428 locuciones), decodificacion greedy, sin LM externo, normalizador Whisper BasicTextNormalizer. El baseline de referencia BF16 medido con Transformers nativo sobre el mismo manifest es 11,00%; el port BF16 obtiene 11,02% y todas las cuantizaciones caen dentro del intervalo de confianza del 95% de la referencia.

| Cuantizacion | Tamano | WER FLEURS arabe (test) |
|---|---:|---:|
| BF16 | 4,10 GB | 11,02% |
| F16 | 4,11 GB | 11,00% |
| Q8_0 | 2,41 GB | 11,06% |
| Q6_K | 1,97 GB | 11,07% |
| Q5_K_M | 1,77 GB | 10,95% |
| Q4_K_M | 1,56 GB | 11,18% |

Rendimiento (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| AMD Ryzen 4750U | Vulkan | 8 |
| AMD Ryzen 4750U | CPU | 3 |

Nota: FLEURS arabe es habla dialectal egipcia; los numeros publicados upstream sobre otros conjuntos de test arabes no son directamente comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16/F16 en torno a 4,1 GB de pesos; Q8_0 en torno a 2,4 GB; Q4_K_M en torno a 1,56 GB. El consumo real de memoria depende del backend y del buffer de audio; no disponible un dato exacto de VRAM pico.
- GPU recomendadas: no disponible en la informacion proporcionada. El modelo se ha validado en Apple M4 Max con Metal y en AMD Ryzen 4750U con Vulkan; no se mencionan A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, con cuantizaciones Q4_K_M (1,56 GB) o Q5_K_M (1,77 GB), y en CPU sin GPU dedicada.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake; backends Metal, Vulkan y CPU.
- Latencia y throughput estimados: RTF de 73 en Metal (M4 Max), 9 en CPU (M4 Max), 8 en Vulkan (Ryzen 4750U) y 3 en CPU (Ryzen 4750U). No hay datos de latencia absoluta ni throughput por segundo de audio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la informacion proporcionada. Comparativa cualitativa:

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| cohere-transcribe-arabic-07-2026 (este) | 2,05B | ar, en | no disponible | Apache-2.0 | GGUF (transcribe.cpp) | Enfocado en dialectos arabes y code-switching arabe-ingles; sin streaming, timestamps ni traduccion |
| Cohere Transcribe 03-2026 (modelo base de la arquitectura) | no disponible | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia upstream; datos de rendimiento no disponibles en esta ficha |
| Alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de comparacion |

## Limitaciones y advertencias

- No soporta streaming: la transcripcion es offline sobre ficheros WAV completos.
- No genera timestamps ni marcas temporales por segmento.
- No realiza traduccion ni deteccion automatica de idioma; el idioma debe indicarse explicitamente con `-l ar` o `-l en`.
- Solo acepta WAV mono a 16 kHz; audio en otros formatos o frecuencias debe convertirse previamente (por ejemplo, con ffmpeg).
- Solo arabe e ingles; no se declaran otros idiomas.
- WER de referencia en torno al 11% en FLEURS arabe, lo que implica un nivel de errores considerable en habla dialectal; no es adecuado para transcripcion legal o medica sin revision humana.
- Riesgo de alucinacion y errores en audio ruidoso, solapamiento de hablantes o acentos no cubiertos; no disponible informacion sobre sesgos especificos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; comunidad minima, sin garantias de mantenimiento.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base upstream, que es la fuente autoritativa.
- Los numeros de WER de FLEURS arabe corresponden a habla dialectal egipcia; no son extrapolables directamente a otros dialectos o registros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrsoundmind/cohere-transcribe-arabic-07-2026-gguf
- Modelo base upstream: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Commit upstream usado: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026/commit/0a8193c
- Arquitectura de referencia: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Cohere: https://cohere.com
- Cohere Labs: https://cohere.com/research
