# lipik/Voxtral-Mini-3B-2507-gguf

## Resumen

Voxtral-Mini-3B-2507-gguf es la conversion a formato GGUF del modelo Voxtral Mini 3B de Mistral AI, publicada por el usuario lipik para su uso con transcribe.cpp. Voxtral Mini es un modelo de audio-lenguaje que combina un encoder de audio bidireccional derivado de Whisper-large-v3 con un decodificador causal Ministral-3B, lo que le permite transcribir y traducir voz, ademas de responder preguntas sobre el audio. Esta version GGUF esta pensada para inferencia offline ligera en CPU, Metal o Vulkan, sin necesidad de GPUs de datacenter.

El modelo resuelve el problema del reconocimiento automatico del habla (ASR) y la traduccion de voz multilingue en un unico modelo, eliminando la necesidad de encadenar un sistema ASR con un modelo de lenguaje separado. Con un contexto de 32k tokens, puede procesar audios de hasta 30 minutos para transcripcion y 40 minutos para comprension, con deteccion automatica de idioma y soporte nativo para ocho lenguas.

La relevancia de esta publicacion radica en que ofrece cuantizaciones que van desde BF16 (9,37 GB) hasta Q4_K_M (2,98 GB) con una degradacion minima del WER, lo que permite desplegar un modelo de transcripcion de calidad en hardware de consumo. La licencia Apache-2.0 heredada del modelo base facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder de audio bidireccional (Whisper-large-v3) + proyector + decodificador causal Ministral-3B |
| Parametros totales | 4.676.297.232 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32k tokens (hasta 30 min de audio para transcripcion, 40 min para comprension) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles, frances, aleman, espanol, italiano, portugues, neerlandes, hindi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Voxtral Mini sigue una arquitectura de inyeccion de tokens de audio en un modelo de lenguaje. El frontend log-mel alimenta un encoder de audio bidireccional basado en Whisper-large-v3, cuya salida pasa por un proyector de cuatro grupos de frames que genera 375 tokens de audio por cada fragmento de 30 segundos. Estos tokens se inyectan en un decodificador causal Ministral-3B de 30 capas con GQA (32 cabezas de atencion y 8 de clave/valor), RoPE en variante NEOX y activaciones SwiGLU. El tokenizador es tekken, compartido con el resto de la familia Voxtral.

El modelo es hermano menor de Voxtral Small 24B: comparte encoder, proyector, frontend log-mel y tokenizador, sustituyendo el decodificador Mistral-Small-24B por Ministral-3B. La conversion GGUF se realizo desde el commit upstream 3060fe3 (fijado el 2026-06-06) y se valido contra la referencia de Transformers en el commit 483c122 de transcribe.cpp. La paridad numerica BF16 frente a la referencia se comprobo con 43 tensores verificados y transcripcion identica byte a byte. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Transcripcion de voz (ASR) offline con modo de transcripcion dedicado que maximiza la precision.
- Deteccion automatica del idioma de origen y transcripcion en el idioma detectado.
- Traduccion de voz a texto mediante la plantilla instruct de mistral-common.
- Comprension de audio: preguntas y respuestas directamente sobre el contenido hablado.
- Generacion de resumenes estructurados de audio sin pipeline ASR + LLM separado.
- Function calling a partir de la voz: activacion de funciones de backend, flujos de trabajo o llamadas a API segun la intencion hablada.
- Capacidades de texto heredadas del backbone Ministral-3B.
- Soporte multilingue nativo en ocho idiomas (en, fr, de, es, it, pt, nl, hi).
- Procesamiento de audio largo: hasta 30 minutos en transcripcion y 40 minutos en comprension.
- Streaming: no soportado segun los metadatos de transcribe.cpp.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa audios de hasta 30 minutos en una sola pasada gracias al contexto de 32k tokens, generando transcripciones con deteccion automatica de idioma, util para equipos multilingues sin infraestructura GPU dedicada.
- Subtitulado y traduccion de contenido audiovisual: la traduccion de voz integrada permite generar subtitulos en otro idioma directamente desde el audio, evitando el coste de un pipeline ASR + traduccion por separado.
- Asistentes de voz con function calling: la capacidad de disparar funciones de backend desde la intencion hablada permite construir interfaces de voz para control de aplicaciones, reservas o consultas de API sin un modulo NLU adicional.
- Analisis de llamadas de atencion al cliente: el modelo puede transcribir y resumir conversaciones grabadas, extrayendo acciones o motivos de contacto mediante preguntas directas sobre el audio.
- Investigacion cualitativa y entrevistas: transcripcion local de entrevistas en espanol, frances, aleman y otros idiomas soportados, con la ventaja de que Q4_K_M ocupa menos de 3 GB y cabe en portatiles.
- Despliegue en dispositivos de borde: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar ASR en CPU o GPU integrada (Vulkan en Ryzen, Metal en Apple Silicon) con un rendimiento en tiempo real superior a 1x segun los datos de RTF del autor.
- Procesamiento por lotes de archivos de audio: el CLI de transcribe.cpp acepta WAV de 16 kHz mono y puede integrarse en scripts para transcribir archivos de forma automatizada.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances, normalizador de texto ingles de Whisper, batch 8 en NVIDIA L40S):

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| BF16 | 9,37 GB | 1,88 |
| F16 | 9,38 GB | 1,89 |
| Q8_0 | 5,00 GB | 1,87 |
| Q6_K | 3,87 GB | 1,87 |
| Q5_K_M | 3,46 GB | 1,91 |
| Q4_K_M | 2,98 GB | 1,94 |
| Referencia Transformers (BF16) | no disponible | 1,87 |

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 14,9 |
| Apple M4 Max | CPU | 2 |
| AMD Ryzen 4750U | Vulkan | 1,2 |
| AMD Ryzen 4750U | CPU | 0,5 |

No se han publicado en la informacion disponible resultados de benchmarks de audio multilingue, traduccion ni comprension de audio mas alla del WER en LibriSpeech.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB para BF16/F16, unos 5,5 GB para Q8_0, 4,3 GB para Q6_K, 3,9 GB para Q5_K_M y 3,4 GB para Q4_K_M (tamano de pesos mas overhead de contexto y buffers de audio).
- GPU recomendadas: NVIDIA L40S para validacion y despliegue de referencia; cualquier GPU con suficiente VRAM para la cuantizacion elegida. No se especifican requisitos minimos de GPU en la informacion disponible.
- Cabe en GPU de consumo: si, con cuantizaciones Q5_K_M o Q4_K_M en tarjetas de 8 GB o mas; Q6_K y Q8_0 requieren 8-12 GB segun overhead.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`) con backends Metal, Vulkan y CPU. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: RTF de 14,9 en Metal sobre M4 Max, 2 en CPU sobre M4 Max, 1,2 en Vulkan sobre Ryzen 4750U y 0,5 en CPU sobre Ryzen 4750U. Un RTF superior a 1 indica procesamiento mas rapido que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| Voxtral-Mini-3B-2507 (esta ficha, GGUF) | 4,68 B | 32k tokens (30 min audio) | 8 | Apache-2.0 | GGUF |
| Voxtral Small 24B | no disponible en la informacion | no disponible | no disponible | Apache-2.0 (heredada, segun modelo base) | safetensors |
| Ministral-3B (backbone de texto) | 3 B (aproximado) | no disponible | no disponible | no disponible | safetensors |
| Whisper-large-v3 (encoder de referencia) | no disponible | no disponible | multilingue | no disponible | no disponible |

La comparacion detallada con alternativas ASR como Whisper-large-v3 en WER multilingue o con Voxtral Small 24B en rendimiento no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no soporta streaming segun los metadatos de transcribe.cpp; requiere el audio completo o fragmentos cerrados.
- No genera timestamps; la salida es texto plano sin marcas temporales.
- La entrada debe ser WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- El WER publicado se limita a LibriSpeech test-clean en ingles; no hay datos de rendimiento en espanol ni en el resto de idiomas soportados.
- Riesgo de alucinacion inherente a los modelos de lenguaje: en pasajes con ruido, musica o habla solapada puede generar texto no presente en el audio.
- La decodificacion es greedy, lo que limita la exploracion frente a estrategias de beam search.
- Sesgos conocidos: no se documentan en la informacion proporcionada; como modelo derivado de datos web y de audio, es previsible que herede sesgos linguisticos y dialectales no cuantificados.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card upstream de Mistral AI para terminos adicionales.
- El repositorio tiene un numero muy bajo de descargas (40) y cero likes en el momento de la consulta, lo que sugiere poca validacion comunitaria independiente.
- La validacion numerica se realizo contra una unica version de transcribe.cpp y Transformers; cambios futuros en la libreria pueden afectar la reproducibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lipik/Voxtral-Mini-3B-2507-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Commit upstream del modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507/commit/3060fe3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-mini-3b-2507.md
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper de Voxtral: https://arxiv.org/abs/2507.13264
- Blog de Ministral: https://mistral.ai/news/ministraux
