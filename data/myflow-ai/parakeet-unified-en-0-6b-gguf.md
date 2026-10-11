# myflow-ai/parakeet-unified-en-0.6b-gguf

## Resumen

Parakeet-unified-en-0.6b (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático de voz nvidia/parakeet-unified-en-0.6b, publicada por el usuario myflow-ai para su uso con el motor transcribe.cpp. El modelo original lo desarrolla NVIDIA y es un sistema ASR en inglés basado en una arquitectura transducer RNN-T: un encoder FastConformer (Parakeet) de 24 capas, entrenado de forma conjunta en modo offline y streaming, emparejado con un decodificador RNN-T. Cuenta con 618.309.121 parámetros (aproximadamente 0,6 mil millones) y transcribe voz a texto en alfabeto inglés con soporte de puntuación y mayúsculas.

La relevancia de esta versión concreta está en el empaquetado: al estar en GGUF y soportado por transcribe.cpp, el modelo se puede ejecutar íntegramente en CPU sin GPU dedicada, con factores de tiempo real (RTF) muy altos. Según los datos del autor, la cuantización Q4_K_M ocupa solo 477 MB y mantiene un WER de 1,62 % en LibriSpeech test-clean, prácticamente idéntico al 1,59 % del modelo en F32. Esto lo hace atractivo para transcripción local, privada y de bajo coste en hardware modesto.

El repositorio es una conversión derivada (base_model_relation: quantized), no un modelo entrenado desde cero, y su rendimiento depende de transcribe.cpp. El autor advierte de que, aunque los contextos de atención para streaming están presentes en el GGUF, esta implementación solo expone inferencia offline por el momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer (Parakeet) de 24 capas + decodificador RNN-T transducer |
| Parametros totales | 618.309.121 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo ASR); el modelo original admite ventanas de streaming de 160 ms a 2080 ms configurables en pasos de 80 ms |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en, en-US) |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transducer (RNN-T) que combina un encoder FastConformer con un decodificador recurrente. El encoder es un transformer convolucional de 24 capas diseñado para audio, y el decodificador RNN-T genera las transcripciones de forma autorregresiva sin necesidad de un modelo de lenguaje externo durante la decodificación greedy. En su versión original, NVIDIA entrenó el modelo de forma conjunta en modos offline y streaming, de modo que un único conjunto de pesos sirve para ambos regímenes; el objetivo declarado era conseguir una latencia mínima de 160 ms en streaming.

Los datos de entrenamiento provienen mayoritariamente de la parte en inglés del dataset Granary, con aproximadamente 250.000 horas de voz en inglés estadounidense (en-US) en condiciones acústicas diversas. El modelo original transcribe a alfabeto inglés, espacios y apóstrofos, con soporte integrado de puntuación y capitalización. La información proporcionada no detalla si hubo fases de RLHF o DPO, ni el desglose exacto del dataset más allá de la cifra de Granary.

La innovación principal del port es de empaquetado e inferencia: la conversión a GGUF permite ejecutar el modelo con transcribe.cpp en CPU y GPU mediante Metal o Vulkan, con cuantizaciones que reducen el peso hasta los 477 MB (Q4_K_M) sin degradar apreciablemente el WER. El autor validó numéricamente el port contra la referencia de NeMo en el commit 42528dd de transcribe.cpp, partiendo del commit d4ac992 del modelo upstream (fijado el 2026-05-10). La decodificación es greedy RNN-T sin LM externo.

## Capacidades

- Transcripción de voz a texto en inglés (ASR) con decodificación greedy RNN-T.
- Soporte integrado de puntuación y capitalización en la salida.
- Timestamps a nivel de token (timestamps: token).
- El modelo base admite inferencia offline y streaming con latencias de 160 ms a 2080 ms; esta conversión GGUF, sin embargo, solo ejecuta modo offline porque transcribe.cpp aún no expone una entrada de streaming.
- Detección de idioma: no soportada (lang_detect: false).
- Traducción de voz: no soportada (translate: false).
- Tool calling / function calling: no aplica ni está soportado.
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Capacidades multilingües: no; únicamente inglés.
- Capacidades de visión o audio-vision: no.

## Casos de uso

- Transcripción local de reuniones y notas de voz: al ejecutarse en CPU con cuantizaciones de entre 477 MB y 731 MB, permite transcribir grabaciones en el propio portátil sin enviar audio a la nube, preservando la privacidad del contenido.
- Subtitulado offline de vídeo: el soporte de timestamps a nivel de token y la puntuación integrada facilitan generar ficheros de subtítulos sincronizados a partir de audio extraído con ffmpeg a 16 kHz mono.
- Asistentes de voz y dictado: el modelo original está pensado para latencias de hasta 160 ms en streaming, adecuado para dictado en tiempo real, siempre que se use una implementación que exponga el modo streaming (no esta conversión GGUF).
- Transcripción por lotes en servidores sin GPU: con RTF de 7,5 en CPU Ryzen 4750U y 12,5 con Vulkan, un único equipo puede procesar grandes volúmenes de audio en pipelines automatizados.
- Indexación y búsqueda de archivos de audio: convertir archivos de audio a texto para alimentar motores de búsqueda internos o sistemas RAG sobre documentación hablada.
- Atención al cliente basada en llamadas: transcripción de conversaciones telefónicas en inglés para análisis posterior, control de calidad y extracción de métricas, aprovechando el WER bajo (~1,6 %) en audio limpio.
- Investigación en ASR: sirve como referencia cuantizada para comparar decodificadores RNN-T frente a alternativas basadas en atención, con pesos ligeros y reproducibles en hardware de consumo.

## Benchmarks y rendimiento

WER medido sobre el split completo LibriSpeech test-clean (2620 locuciones), decodificación greedy RNN-T sin LM externo. La línea base de referencia en F32 es 1,59 %, y el valor autodeclarado por NVIDIA sobre el mismo split es 1,63 %.

| Cuantizacion | Tamano | WER (LibriSpeech test-clean, offline) |
|---|---:|---:|
| F32 | 2,47 GB | 1,59 % |
| F16 | 1,24 GB | 1,59 % |
| Q8_0 | 731 MB | 1,60 % |
| Q6_K | 602 MB | 1,61 % |
| Q5_K_M | 541 MB | 1,58 % |
| Q4_K_M | 477 MB | 1,62 % |

Factores de tiempo real (RTF) declarados por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 163 |
| Apple M4 Max | CPU | 28,5 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

No se han publicado en la información disponible resultados de benchmarks adicionales (por ejemplo MMLU, HumanEval o GSM8K), que además no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo completo en F32 ocupa 2,47 GB, y las cuantizaciones van de 477 MB (Q4_K_M) a 731 MB (Q8_0).
- GPU recomendadas: no se especifica ninguna GPU concreta; el autor reporta 163x RTF en Metal sobre un Apple M4 Max y 12,5x RTF con Vulkan sobre un Ryzen 4750U (gráfica integrada). Cualquier GPU con soporte Metal o Vulkan es suficiente.
- ¿Cabe en GPU de consumo? Sí; incluso la versión F32 de 2,47 GB cabe en GPUs con 4 GB de VRAM, y las cuantizadas caben en cualquier equipo con unos pocos cientos de MB libres.
- Opciones de despliegue: transcribe.cpp (compilado con CMake), que expone el binario transcribe-cli. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Requisitos de audio: entrada de 16 kHz mono WAV; para otros formatos hay que convertir previamente con ffmpeg (`ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).
- Latencia y throughput: en Apple M4 Max con Metal, un RTF de 163 implica procesar aproximadamente 163 segundos de audio por segundo de cómputo; en Ryzen 4750U con Vulkan, unas 12,5 veces tiempo real. Se recomienda la cuantización Q8_0 o Q4_K_M para un equilibrio entre calidad y recursos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| myflow-ai/parakeet-unified-en-0.6b-gguf | 618 M | ASR offline (streaming en el original) | 1,59-1,62 % segun cuantizacion | CC-BY-4.0 | GGUF via transcribe.cpp |
| nvidia/parakeet-unified-en-0.6b (base) | 618 M | ASR offline y streaming (160-2080 ms) | 1,63 % (autodeclarado) | CC-BY-4.0 | NeMo / safetensors |
| voconly-org/parakeet-unified-en-0.6b-gguf | 618 M | ASR offline | No disponible | No disponible | GGUF |
| OpenAI Whisper / distil-whisper | No disponible en la informacion | ASR multilingue | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion |

Las únicas alternativas para las que la información disponible aporta datos verificables son el modelo base de NVIDIA y la conversión GGUF de voconly-org, de la que solo se conoce la existencia. No se dispone de cifras de WER comparables para Whisper u otros sistemas ASR dentro de la información proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta detección de idioma ni traducción, y no está entrenado para otras lenguas.
- Modo streaming no disponible en este port: pese a que el modelo original es unificado offline/streaming, transcribe.cpp todavía no expone una entrada de streaming, por lo que esta conversión solo ejecuta inferencia offline.
- Riesgo de alucinación y errores en audio difícil: el WER de 1,59-1,62 % corresponde a LibriSpeech test-clean, audio limpio y leído; en audio con ruido, acentos no estadounidenses, solapamiento de hablantes o dominios especializados el WER aumentará de forma notable.
- Sesgos potenciales: al entrenarse mayoritariamente con inglés estadounidense (en-US) de Granary, el rendimiento puede degradarse con otros acentos del inglés y con vocabulario técnico o dialectal poco representado.
- Sin timestamps por palabra garantizados: los timestamps son a nivel de token, lo que puede requerir post-procesado para alineaciones finas.
- Decodificación greedy sin LM externo: la calidad depende del decodificador RNN-T; no se beneficia de un modelo de lenguaje para corregir hipótesis.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución tanto a NVIDIA (modelo base) como al autor de la conversión, y el cumplimiento de los términos del modelo upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin tracción ni validación por parte de la comunidad, lo que incrementa el riesgo de bugs no detectados en producción.
- Dependencia de transcribe.cpp: el soporte, el rendimiento y la corrección numérica dependen de la versión concreta de esa librería.
- Entrada limitada a WAV de 16 kHz mono: cualquier otro formato requiere conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myflow-ai/parakeet-unified-en-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-unified-en-0.6b/commit/d4ac992
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-unified-en-0.6b.md
- Conversión GGUF alternativa: https://huggingface.co/voconly-org/parakeet-unified-en-0.6b-gguf
- Tutorial de uso local (AI Indigo): https://aiindigo.com/tutorials/getting-started-with-parakeet-unified-english-0-6b-gguf-local-high-accuracy-tran
- Tutorial de ASR privado local (AI Indigo): https://aiindigo.com/tutorials/getting-started-with-parakeet-unified-english-0-6b-gguf-private-local-speech-to
- Ficha resumen del modelo base (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/parakeet-unified-en-0.6b-nvidia
- Paper referenciado (arXiv:2604.19079): https://arxiv.org/abs/2604.19079
- Paper referenciado (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper referenciado (arXiv:2304.09325): https://arxiv.org/abs/2304.09325
