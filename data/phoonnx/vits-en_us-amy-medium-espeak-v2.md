# Phoonnx/vits-en_us-amy-medium-espeak-v2

## Resumen

`Phoonnx/vits-en_us-amy-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en ingles estadounidense basada en la arquitectura VITS, empaquetada en formato ONNX para su uso con la libreria phoonnx. No es un modelo de lenguaje: es un modelo acustico de TTS de un solo hablante, derivado del catalogo `rhasspy/piper-voices` (concretamente la voz `en_US/amy/medium`) y convertido a ONNX por TigreGotico Lda (Phoonnx). Su funcion es convertir fonemas IPA generados por espeak-ng en audio PCM a 22050 Hz.

La relevancia de esta revision (sufijo `v2`) es que el repositorio original `Phoonnx/vits-en_us-amy-medium-espeak` quedo obsoleto: Rhasspy reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`), y este repositorio incorpora esos pesos nuevos. Ademas, la model card documenta un control de calidad con ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre tres frases de FLORES-200 devtest, con WER de 0,069 en fp32 y 0,000 en int8, y unas cifras de rendimiento medidas en un Intel i9-11900H.

El modelo es de proposito muy especifico: sintesis de voz local, ligera (grafo fp32 de 63,2 MB, int8 de 18,7 MB) y de baja latencia (RTF de 0,040 en fp32 con 4 hilos), pensada para asistentes de voz, sistemas empotrados y entornos OVOS/Mycroft. No ofrece capacidades de razonamiento, codigo ni vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime 1.32.0, pesos QInt8) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (no declarada en la model card; enlaza a MycroftAI/mimic3-voices, repositorio CC BY-SA 4.0) |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Identificador de voz | `piper/en_US-amy-medium-v2` |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Fonetizador | espeak-ng, voz `en-us` |
| Puntuacion | entrenado con `, . ! ? : ;` (preservada en sintesis desde phoonnx 1.96.1a1) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Tamano del repositorio | 0,1 GB |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 263,7 MB (fp32) / 222,3 MB (int8) |
| Ajustes de inferencia por defecto | noise_scale 0.5, noise_w 0.333 |
| Requisito de version Piper | 1.5 o superior |

## Arquitectura y entrenamiento

VITS es un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto condicionado por fonemas, un prior variacional y un decoder basado en flujos normalizadores y un generador HiFi-GAN, entrenado con perdidas adversarias y de reconstruccion espectrograma-audio. En este caso la implementacion es la de Piper, que consume fonemas IPA en lugar de texto crudo; por eso el pipeline exige espeak-ng (o el port espyak) como fonetizador previo. La voz es monohablante y de calidad "medium" dentro de la escala de Piper.

Segun la model card, el entrenamiento upstream parte de un ajuste fino sobre el modelo base `hifi_tts_92` de ingles estadounidense (calidad medium, correspondiente a la voz de Cori Samuel, lectora 92 de Hi-Fi TTS), empleando MRD y SDP. La card indica explicitamente que los datos de entrenamiento y el modelo base no estan registrados upstream ("Not recorded upstream"). No se documenta numero de tokens, composicion del dataset ni fases de RLHF/DPO, algo esperable en un modelo TTS. La conversion a ONNX no altera los pesos; las copias int8 si los cuantizan dinamicamente. El control de calidad se realizo con ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre tres frases de FLORES-200 devtest, verificando audio finito, no silencioso, duracion entre 0,8 y 1,25 veces la de fp32 y WER no superior al de fp32 mas 0,05.

## Capacidades

- Sintesis de voz monohablante en ingles estadounidense a partir de texto, con fonetizacion espeak-ng.
- Entrada por fonemas IPA, lo que permite control fino de pronunciacion si se generan los fonemas manualmente.
- Respeto de puntuacion de clausula (`, . ! ? : ;`) en la sintesis con phoonnx 1.96.1a1 o superior.
- Salida de audio WAV a 22050 Hz mediante `voice.synthesize_wav(...)`.
- Ejecucion en CPU con ONNX Runtime; no requiere GPU.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuracion en `mycroft.conf`.
- Variante int8 para despliegues con restricciones de memoria (18,7 MB de grafo, 222,3 MB de RSS pico).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni generacion de texto.

## Casos de uso

- Asistentes de voz locales (OVOS/Mycroft): la voz se selecciona como `piper/en_US-amy-medium-v2` en `mycroft.conf` y sintetiza respuestas del asistente sin depender de la nube, con un grafo de 18,7 MB en int8 que cabe en dispositivos con poca memoria.
- Lectura de notificaciones y alertas en sistemas empotrados: el bajo pico de RSS (222,3 MB en int8) y la ejecucion solo en CPU permiten integrarlo en Raspberry Pi o mini-PC sin acelerador.
- Generacion de audiolibros o locuciones por lotes: el RTF de 0,040 en fp32 con 4 hilos implica sintetizar unos 25 segundos de audio por segundo de computo, adecuado para procesar textos largos por lotes.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, con sintesis local y sin cuotas de API.
- Pruebas automatizadas de pipelines de voz: sirve como voz de referencia determinista en tests de ASR, ya que la card documenta un WER medido de 0,069 en fp32 sobre FLORES-200.
- Sistemas de anuncios en kioscos o terminales: frases cortas con puntuacion preservada, generadas en tiempo real en CPU de gama media.
- Prototipado de agentes conversacionales: como capa de salida de voz de un pipeline mayor (LLM + TTS), dado que el modelo solo cubre la sintesis.

## Benchmarks y rendimiento

La model card no publica benchmarks comparativos con otros modelos TTS, pero si un control de calidad y mediciones de rendimiento propias:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA (ASR) | pass | pass |
| WER (FLORES-200 devtest, 3 frases) | 0,069 | 0,000 |
| Caracteres por segundo | 13,3 a 14,4 | no disponible |
| Duracion int8 / fp32 | no aplica | 0,99 a 1,01 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 263,7 MB | 222,3 MB |
| RTF (mediana de 3, 4 hilos) | 0,040 | 0,094 |

Medido en un Intel Core i9-11900H (11a generacion) a 2,50 GHz. El RTF es tiempo de sintesis dividido por duracion del audio. No se han publicado resultados de benchmarks comparativos (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU con ONNX Runtime.
- RAM: pico de RSS de 263,7 MB en fp32 y 222,3 MB en int8, medido en i9-11900H.
- GPU: no necesaria; no se documenta soporte GPU en la informacion disponible.
- CPU: cualquier x86-64 o ARM moderno; las mediciones de referencia usan 4 hilos en un i9-11900H.
- Cabe en cualquier equipo de consumo, incluidos mini-PC y placas tipo Raspberry Pi, por el tamano del grafo (18,7 MB en int8).
- Despliegue: libreria phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; integracion via `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: RTF de 0,040 (fp32) y 0,094 (int8) con 4 hilos; 13,3 a 14,4 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-amy-medium-espeak-v2 | VITS (Piper) ONNX | en-US | 63,2 MB fp32 / 18,7 MB int8 | no aplica | other (enlace a CC BY-SA 4.0) | Hugging Face |
| rhasspy/piper-voices (en_US/amy/medium) | VITS (Piper) | en-US | no disponible | no aplica | no declarada (enlace a CC BY-SA 4.0) | Hugging Face |
| Phoonnx/vits-en_us-amy-medium-espeak (v1) | VITS (Piper) ONNX | en-US | no disponible | no aplica | other | Hugging Face (obsoleto, pesos anteriores) |

La comparativa se limita a las variantes de la misma voz porque la informacion disponible no incluye datos de otros sistemas TTS (por ejemplo, Coqui TTS, Kokoro o Piper en otras voces) que permitan una comparacion con numeros verificables.

## Limitaciones y advertencias

- Solo ingles estadounidense; no soporta otros idiomas ni cambio de hablante.
- Requiere espeak-ng como fonetizador; con el port espyak algunos fonemas difieren y ciertas palabras pueden pronunciarse mal.
- Licencia ambigua: la model card no declara licencia y enlaza a un repositorio CC BY-SA 4.0 (MycroftAI/mimic3-voices); antes de uso comercial hay que verificar la licencia upstream y la obligacion de atribucion (la card pide acreditar a Rhasspy).
- Datos de entrenamiento y modelo base no registrados upstream, lo que impide auditar sesgos o procedencia del dataset.
- Riesgo de pronunciacion incorrecta en nombres propios, siglas y terminos tecnicos por depender de la fonetizacion espeak.
- Calidad "medium" de Piper: no es una voz de alta fidelidad; no se publican metricas MOS.
- La validacion de calidad se basa en solo tres frases de FLORES-200, muestra muy reducida.
- El WER de 0,000 en int8 sobre esa muestra no debe interpretarse como calidad perfecta generalizada.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; cualquier uso conversacional requiere un LLM externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-amy-medium-espeak-v2
- Modelo upstream (Piper, en_US/amy/medium): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_US/amy/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Repositorio de licencia referenciado (MycroftAI/mimic3-voices): https://github.com/MycroftAI/mimic3-voices
- Version anterior reemplazada: https://huggingface.co/Phoonnx/vits-en_us-amy-medium-espeak
