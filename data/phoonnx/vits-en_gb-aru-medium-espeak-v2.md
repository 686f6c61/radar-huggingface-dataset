# Phoonnx/vits-en_gb-aru-medium-espeak-v2

## Resumen

vits-en_gb-aru-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) en inglés británico desarrollada por Phoonnx (TigreGotico Lda) a partir del modelo upstream `rhasspy/piper-voices/en/en_GB/aru/medium`. No es un modelo de lenguaje generativo, sino un modelo acústico VITS entrenado por Rhasspy y convertido a formato ONNX para su uso con la librería phoonnx, un motor TTS ligero orientado a asistentes de voz y sistemas embebidos.

La voz toma como entrada fonemas espeak (alfabeto IPA) y produce audio a 22050 Hz con 12 hablantes disponibles. Su relevancia radica en que sustituye a la versión anterior `Phoonnx/vits-en_gb-aru-medium-espeak`, ya que Rhasspy reentrenó la voz sobre los modelos base Piper 1.5 (commit `e9c8a39444`). El repositorio incluye tanto pesos fp32 como copias cuantizadas int8, con un tamaño total de 0,1 GB.

El modelo está pensado para integrarse en pipelines de TTS de baja latencia: el grafo fp32 ocupa 76,8 MB y el int8 22,1 MB, con un RTF de 0,038 en fp32 y 0,099 en int8 medido sobre un Intel i9-11900H. La licencia CC BY 4.0 permite uso comercial con atribución a Rhasspy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic, QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 12 |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Fonemizador | espeak-ng, voz en-gb-x-rp |
| Puntuacion soportada | coma, punto, exclamacion, interrogacion, dos puntos y punto y coma |
| Tamano del repo | 0,1 GB |
| Tamano del grafo | 76,8 MB (fp32) / 22,1 MB (int8) |
| Pico de RSS | 274,9 MB (fp32) / 225,3 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,038 (fp32) / 0,099 (int8) |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS tal como la implementa Piper, un modelo generativo adversario condicionado por fonemas que combina un codificador de texto, un prior normalizing flow y un decodificador de audio. La entrada es una secuencia de fonemas espeak (IPA) con puntuación de cláusula; la salida es audio a 22050 Hz. El modelo soporta 12 hablantes y los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, requiriendo Piper 1.5 o superior.

Según la model card upstream, la voz se obtuvo mediante fine-tuning del modelo base `hifi_tts_92` de inglés estadounidense (calidad media, voz de Cori Samuel, lectora 92 de Hi-Fi TTS) con MRD y SDP. Los datos de entrenamiento provienen del corpus de la Acoustics Research Unit de la Universidad de Liverpool, publicado bajo CC BY 4.0. El número de tokens o horas de audio no está registrado upstream. La conversión a ONNX no altera los pesos; las copias int8 se generaron con `onnxruntime.quantization.quantize_dynamic`.

La model card documenta un control de calidad (QA) con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, con WER 0,000 tanto en fp32 como en int8, y una relación de longitud int8/fp32 entre 0,99 y 1,03.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles britanico a partir de fonemas espeak en alfabeto IPA.
- Soporte de 12 hablantes distintos dentro del mismo modelo.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`), mantenida en sintesis por phoonnx 1.96.1a1 y posteriores.
- Salida de audio WAV a 22050 Hz mediante `voice.synthesize_wav()`.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo acustico de sintesis.

## Casos de uso

- Asistentes de voz en local (OVOS/Mycroft): la voz se selecciona como `piper/en_GB-aru-medium-v2` en la configuracion del plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas sin depender de servicios en la nube.
- Sistemas embebidos y dispositivos de bajos recursos: el grafo int8 de 22,1 MB y un pico de RSS de 225,3 MB permiten ejecutar la sintesis en hardware modesto con ONNX Runtime.
- Lectura de notificaciones y alertas: el RTF de 0,038 en fp32 (unas 26 veces mas rapido que tiempo real) hace viable generar avisos cortos de forma casi instantanea.
- Audiolibros y contenido narrado de dominio publico: los 12 hablantes permiten alternar voces en una misma produccion, y la licencia CC BY 4.0 admite uso comercial con atribucion.
- Prototipado de interfaces conversacionales: la integracion con phoonnx y la API `TTSModelManager` facilitan pruebas rapidas de UX de voz en ingles britanico.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o sistemas de asistencia, ejecutandose en CPU sin GPU dedicada.
- Generacion de locuciones para entornos de prueba (QA de telefonia, IVR): el bajo coste computacional permite sintetizar lotes de frases de prueba con puntuacion realista.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del control de calidad de la model card:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER (FLORES-200 devtest, 3 frases) | 0,000 | 0,000 |
| Caracteres por segundo | 13,1 a 16,2 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,03 |
| Tamano del grafo | 76,8 MB | 22,1 MB |
| Pico de RSS | 274,9 MB | 225,3 MB |
| RTF (mediana de 3, 4 hilos) | 0,038 | 0,099 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF se define como tiempo de sintesis dividido entre la duracion del audio. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU con ONNX Runtime.
- RAM: pico de RSS de 274,9 MB en fp32 y 225,3 MB en int8.
- GPU recomendadas: no disponibles; no se documenta soporte GPU.
- Consumer GPU: no requiere GPU; funciona en CPU. Cabe en cualquier equipo con al menos ~300 MB de RAM libre.
- Despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak, con posibles diferencias foneticas).
- Integracion: plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput: RTF 0,038 (fp32) y 0,099 (int8) en i9-11900H con 4 hilos; entre 13,1 y 16,2 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Hablantes | Tamano | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_gb-aru-medium-espeak-v2 | VITS (Piper) | en-GB | 12 | 76,8 MB fp32 / 22,1 MB int8 | CC BY 4.0 | ONNX |
| Phoonnx/vits-en_gb-aru-medium-espeak (version anterior) | VITS (Piper) | en-GB | no disponible | no disponible | CC BY 4.0 | ONNX |
| rhasspy/piper-voices en/en_GB/aru/medium (upstream) | VITS (Piper) | en-GB | 12 | no disponible | CC BY 4.0 | Piper/ONNX |

No se dispone de datos de benchmarks comparativos con otras familias TTS (por ejemplo, Coqui o Kokoro) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles britanico (en-GB); no es multilingue.
- Requiere fonemizacion previa con espeak-ng; el uso del port espyak puede producir errores de pronunciacion en algunas palabras.
- El QA se realizo sobre solo 3 frases de FLORES-200 devtest, una muestra muy reducida que limita la confianza en las metricas de WER.
- No se documentan los datos exactos de entrenamiento (horas, numero de muestras) ni los parametros totales del modelo.
- Riesgo de alucinacion acustica y artefactos en entradas fuera de distribucion (textos muy largos, caracteres no soportados, puntuacion no contemplada).
- La licencia CC BY 4.0 exige atribucion a Rhasspy al usar la voz, incluso en productos comerciales.
- Es un modelo de sintesis, no de comprension: no procesa instrucciones, no razona y no admite tool calling.
- La version v2 sustituye a la anterior; usar la version antigua mantiene pesos previos al reentrenamiento sobre Piper 1.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-aru-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_GB/aru/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior: https://huggingface.co/Phoonnx/vits-en_gb-aru-medium-espeak
- TigreGotico: https://tigregotico.pt
- Corpus de entrenamiento (Universidad de Liverpool): https://www.liverpool.ac.uk/architecture/research/acoustics-research-unit/speech-corpus/
- Licencia del corpus: https://creativecommons.org/licenses/by/4.0/
