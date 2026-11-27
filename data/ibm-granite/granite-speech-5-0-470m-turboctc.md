# ibm-granite/granite-speech-5.0-470m-turboctc

## Resumen

Granite-Speech-5.0-470M-TurboCTC es un modelo compacto de reconocimiento automatico del habla (ASR) desarrollado por IBM dentro de la familia Granite. Con 472.993.792 parametros, esta disenado para transcripcion multilingue de alta velocidad en entornos de bajos recursos, incluyendo portatiles, telefonos moviles y dispositivos edge. La version actual, publicada el 21 de octubre de 2026, amplia el soporte a siete idiomas (ingles, frances, aleman, espanol, portugues, italiano y japones) e incorpora puntuacion y capitalizacion nativas.

El modelo emplea una arquitectura CTC (Connectionist Temporal Classification) con un encoder acustico de tipo conformer, lo que permite decodificacion no autoregresiva mediante greedy decoding. Esta eleccion de diseno reduce drasticamente la latencia frente a modelos autoregresivos basados en decodificadores, manteniendo una precision competitiva. Se entreno con aproximadamente 153.000 horas de audio multilingue procedente de corpus publicos.

Su relevancia actual radica en la combinacion de tamano reducido, velocidad de inferencia y cobertura multilingue con licencia Apache 2.0, lo que lo hace atractivo para integracion en productos comerciales sin restricciones de licencia y para despliegue en hardware modesto. La actualizacion multilingue mejora ademas el WER medio en ingles respecto a la version anterior (5,51 % frente a 5,78 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con block self-attention, self-conditioning y downsampling temporal; capa de salida CTC sobre 16.384 unidades BPE multilingues |
| Parametros totales | 472.993.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q8_0, Q6_K, Q4_K_M disponibles en conversion comunitaria); cuantizacion nativa en safetensors no especificada |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues, italiano, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (conversion comunitaria) |

## Arquitectura y entrenamiento

El modelo se basa en un encoder acustico de tipo conformer que combina atencion por bloques (block self-attention), self-conditioning y reduccion temporal (temporal downsampling). La salida se proyecta sobre un vocabulario de 16.384 unidades BPE multilingues y se entrena con una funcion de perdida CTC. La inferencia es no autoregresiva mediante greedy decoding, lo que elimina la latencia asociada a la generacion token a token y permite procesar audio en streaming de forma eficiente.

El entrenamiento utilizo aproximadamente 153.000 horas de audio multilingue extraido de corpus publicos. No se especifica en la informacion disponible la composicion exacta del dataset, el uso de RLHF/DPO ni detalles sobre tecnicas de aumento de datos. La innovacion principal es la propia combinacion de CTC con un encoder conformer compacto que logra velocidad de inferencia muy alta (reflejada en la metrica RTFx del Open ASR Leaderboard) manteniendo precision competitiva, ademas de la incorporacion nativa de puntuacion y capitalizacion sin un modulo externo de postprocesado.

## Capacidades

- Transcripcion de voz a texto multilingue en siete idiomas: ingles, frances, aleman, espanol, portugues, italiano y japones.
- Puntuacion y capitalizacion nativas en la salida, sin necesidad de postprocesado externo.
- Decodificacion no autoregresiva (greedy decoding) con alta velocidad de inferencia, adecuada para aplicaciones de baja latencia y alto throughput.
- Procesamiento por lotes de multiples muestras de audio mediante la API de transformers.
- Inferencia en dispositivos edge: soporte via mlx-audio en chips Apple Silicon y via transcribe.cpp en Metal, Vulkan, CUDA, ROCm o CPU.
- Manejo de audio de 16 kHz mono en el caso de transcribe.cpp.
- No se menciona soporte de tool calling, agentes, vision ni audio multimodal en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en tiempo real: el modelo procesa audio con decodificacion no autoregresiva, lo que permite generar transcripciones con latencia muy baja en portatiles y dispositivos moviles, ideal para aplicaciones de dictado y actas automaticas.
- Subtitulado automatico multilingue: con soporte para siete idiomas y puntuacion nativa, puede generar subtitulos listos para publicacion sin necesidad de un paso adicional de formateo, en plataformas de video o streaming.
- Atencion al cliente basada en voz: integrado en sistemas de IVR o asistentes telefonicos, transcribe las consultas de los usuarios en varios idiomas para su posterior procesamiento por un LLM o sistema de tickets.
- Transcripcion en el dispositivo (on-device): gracias a su tamano de 470M parametros y a las opciones de despliegue en GGUF con transcribe.cpp o mlx-audio, puede ejecutarse localmente en portatiles y telefonos sin enviar audio a la nube, preservando la privacidad.
- Generacion de actas y documentacion clinica o legal: la transcripcion con puntuacion y capitalizacion nativas reduce el trabajo de correccion manual en entornos donde se requiere documentacion precisa de conversaciones.
- Procesamiento por lotes de archivos de audio a gran escala: su alta velocidad de inferencia (RTFx elevado) y su naturaleza no autoregresiva lo hacen adecuado para pipelines de transcripcion masiva de archivos de audio en servidores con GPU modestas.
- Accesibilidad: conversion de voz a texto en aplicaciones de asistencia para personas con discapacidad auditiva, con soporte multilingue para usuarios de distintos paises.

## Benchmarks y rendimiento

Los resultados publicados en la model card se presentan en forma de graficas (WER en ingles, WER multilingue en FLEURS/CommonVoice/MLS y CER en japones), sin que se proporcionen los valores numericos exactos en el texto disponible. Los unicos datos numericos explicitos son:

| Metrica | Valor |
|---|---|
| WER medio en ingles (Open ASR Leaderboard, 9 test sets) | 5,51 % (frente a 5,78 % de la version solo inglesa) |
| CER en japones (CSJ eval1, CommonVoice-17, FLEURS) | inferior al de granite-speech-5.0-2b en los tres conjuntos (valores no disponibles) |

No se han publicado en la informacion disponible los valores numericos detallados de WER por idioma ni de RTFx.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (aprox. 1,9 GB) o fp16/bf16 (aprox. 0,95 GB); con cuantizacion GGUF Q8_0 en torno a 0,5 GB y Q4_K_M en torno a 0,3 GB (estimaciones a partir del numero de parametros).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU y en chips Apple Silicon (M1 en adelante) mediante mlx-audio.
- Cabe holgadamente en GPU consumer y en dispositivos edge; el modelo esta explicitamente disenado para portatiles, telefonos moviles y otros dispositivos de bajos recursos.
- Opciones de despliegue: transformers (>=5.16.0) con AutoModelForCTC, mlx-audio (>=0.5.1) para Apple Silicon, transcribe.cpp (release 0.4.1) para inferencia local GGUF en Metal, Vulkan, CUDA, ROCm o CPU.
- Latencia y throughput: no se proporcionan cifras concretas de RTFx en el texto disponible; la model card indica "very high inference speed" y presenta una grafica de precision frente a velocidad (RTFx) en el Open ASR Leaderboard.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| granite-speech-5.0-470m-turboctc | 473 M | 7 | no disponible | Apache 2.0 | CTC no autoregresivo, muy rapido, puntuacion nativa |
| granite-speech-5.0-2b | 2 B (aprox.) | no disponible | no disponible | Apache 2.0 | Mayor tamano; superado por el 470M en CER de japones segun la model card |
| Whisper (variantes de OpenAI) | 39 M - 1,55 B | ~99 | 30 s de audio | MIT | Autoregresivo, amplia cobertura de idiomas; no se dispone de comparacion numerica en la informacion proporcionada |

No se dispone de datos numericos comparativos de benchmarks con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; como modelo entrenado con corpus publicos, es previsible que herede sesgos acusticos y dialectales de dichos corpus.
- Riesgo de alucinacion: los modelos CTC no generan texto libre, por lo que el riesgo de alucinacion es menor que en modelos autoregresivos; sin embargo, pueden producir transcripciones incorrectas en audio con ruido, acentos no representados o solapamiento de hablantes.
- Limitaciones de contexto: no se especifica la longitud maxima de audio procesable; el uso con transcribe.cpp asume WAV mono a 16 kHz.
- Limitaciones de idioma: aunque la model card declara siete idiomas, la metadata de Hugging Face solo lista "en"; el rendimiento puede variar entre idiomas y no se han publicado cifras detalladas por idioma en el texto disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar los terminos de los corpus de entrenamiento subyacentes.
- Caveats para produccion: la cuantizacion GGUF es una conversion comunitaria (no oficial de IBM); el soporte en transformers requiere version >=5.16.0; no se documentan garantias de robustez en dominios acusticos especificos (clinico, legal, telefonico).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revision solo inglesa anterior: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/947f59af40db9791170a0628cf0f3f4812d720f1
- Modelo hermano de mayor tamano: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Conversion GGUF comunitaria: https://huggingface.co/vladers/granite-speech-5.0-470m-turboctc-GGUF
- transcribe.cpp (repositorio): https://github.com/handy-computer/transcribe.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper de referencia (arXiv): arXiv:2609.20104
