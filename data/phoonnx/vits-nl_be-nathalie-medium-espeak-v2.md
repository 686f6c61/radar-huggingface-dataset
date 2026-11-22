# Phoonnx/vits-nl_be-nathalie-medium-espeak-v2

## Resumen

vits-nl_be-nathalie-medium-espeak-v2 es una voz de sintesis de voz (text-to-speech) en neerlandes de Belgica (`nl-BE`) publicada por Phoonnx (TigreGotico Lda). Se trata de una conversion a ONNX del modelo Piper `nl_BE-nathalie-medium` alojado en el repositorio `rhasspy/piper-voices`, entrenado originalmente por Rhasspy. No es un modelo de lenguaje: es un sistema TTS completo que transforma fonemas espeak en audio a 22050 Hz.

La relevancia de esta publicacion es practica: sustituye a una version anterior (`Phoonnx/vits-nl_be-nathalie-medium-espeak`) porque el autor original reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`). El repositorio incluye pesos en fp32 e int8, con validacion automatica mediante ASR (NeMo Parakeet TDT 0.6B v3 int8) sobre frases de FLORES-200 devtest, lo que permite verificar inteligibilidad tras la cuantizacion.

El modelo esta pensado para su uso dentro del ecosistema phoonnx y de OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Su tamano reducido (63,2 MB en fp32, 18,7 MB en int8) y su licencia CC0 1.0 lo hacen adecuado para despliegues locales en CPU y para integracion en asistentes de voz sin dependencias de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada por frase/fonemas) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | neerlandes de Belgica (`nl-BE`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 (Nathalie) |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Fonemizador | espeak-ng, voz `nl` |
| Puntuacion soportada | `, . ! ? : ;` |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 263,0 MB (fp32) / 221,8 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,043 (fp32) / 0,111 (int8) |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference for Text-to-Speech) en la implementacion de Piper, un modelo generativo condicionado por fonemas que produce waveforms directamente, sin vocoder separado. La entrada son fonemas espeak en IPA, no texto crudo, de modo que el pipeline requiere un fonemizador externo (espeak-ng o el port espyak incluido en `phoonnx[espeak]`). La voz se entreno con las marcas de puntuacion de clausula `, . ! ? : ;`, y phoonnx 1.96.1a1 o superior las conserva en la sintesis.

Segun la model card, la voz se reentreno desde el modelo base `hifi_tts_92` (ingles estadounidense, calidad media, voz de Cori Samuel, lector 92 de Hi-Fi TTS) con MRD y SDP, y requiere Piper 1.5 o superior. Los datos de entrenamiento no estan registrados upstream; la unica referencia es el repositorio de datasets de voz de OHF-Voice con licencia CC0. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333. La conversion a ONNX no modifica los pesos; las copias int8 se generaron con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y se validaron con un umbral de WER (como maximo WER fp32 + 0.05), audio finito y no silencioso, y duracion entre 0,8 y 1,25 veces la de fp32.

## Capacidades

- Sintesis de voz mono-hablante en neerlandes de Belgica a 22050 Hz.
- Entrada basada en fonemas espeak (IPA), con soporte de puntuacion de clausula para pausas y entonacion.
- Generacion de audio a fichero WAV mediante `voice.synthesize_wav()` en phoonnx.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx` y configuracion en `mycroft.conf`.
- Ejecucion en CPU sin GPU (medido en Intel Core i9-11900H con 4 hilos).
- Variante int8 con menor huella de memoria (18,7 MB de grafo, 221,8 MB de RSS) para entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente TTS.

## Casos de uso

- Asistentes de voz locales en OVOS: la voz se selecciona como `piper/nl_BE-nathalie-medium-v2` en `mycroft.conf` y responde a las interacciones del asistente en neerlandes de Belgica sin conexion a servicios externos.
- Lectura de notificaciones y avisos en aplicaciones domesticas: el modelo sintetiza frases cortas con RTF de 0,043 en fp32, lo que permite respuestas casi en tiempo real en CPU.
- Accesibilidad para personas con discapacidad visual: conversion de texto a audio en neerlandes belga para lectores de pantalla y sistemas de lectura de documentos, con la ventaja de una licencia CC0 que no impone restricciones de redistribucion.
- Sistemas de megafonia e informacion publica en Flandes: generacion de anuncios pregrabados o dinamicos (estaciones, aeropuertos, comercios) con una voz femenina concreta y consistente.
- Integracion en pipelines de sintesis por lotes: la variante int8 reduce el grafo a 18,7 MB y el RSS a 221,8 MB, adecuada para contenedores con memoria limitada que generan grandes volumenes de audio.
- Prototipado de interfaces conversacionales en neerlandes: uso de la voz como componente TTS de referencia en pruebas de UX de voz antes de contratar voces comerciales, gracias a su licencia permisiva y su instalacion via `pip`.
- Educacion y aprendizaje de idiomas: generacion de material de escucha en neerlandes belga con pronunciacion controlada por fonemas espeak.

## Benchmarks y rendimiento

Los unicos datos publicados son las pruebas de calidad de la conversion, medidas con ASR NeMo Parakeet TDT 0.6B v3 int8 sobre 3 frases de FLORES-200 devtest en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la prueba | pass | pass |
| WER | 0,100 | 0,033 |
| Caracteres por segundo | 14,6 a 17,7 | no disponible |
| Duracion int8 / fp32 | no aplica | 1,01 a 1,03 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 263,0 MB | 221,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,043 | 0,111 |

No se han publicado resultados de benchmarks estandar de TTS (MOS, MCD, CMOS) en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- Memoria RAM: pico de RSS de 263,0 MB en fp32 y 221,8 MB en int8.
- CPU recomendada: cualquier x86-64 moderna; las mediciones se hicieron en un Intel Core i9-11900H con 4 hilos.
- GPU: no necesaria. No hay datos de aceleracion por GPU en la informacion disponible.
- Cabe en cualquier equipo de consumo, incluidos Raspberry Pi y contenedores con menos de 512 MB de RAM.
- Despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado en el sistema (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`). Integracion con OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: RTF de 0,043 en fp32 y 0,111 en int8 (tiempo de sintesis dividido por duracion del audio); es decir, aproximadamente 23x y 9x mas rapido que tiempo real respectivamente en el hardware medido.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-nl_be-nathalie-medium-espeak-v2 | VITS (Piper) | nl-BE | 22050 Hz | CC0 1.0 | ONNX fp32/int8 | Conversion ONNX con validacion ASR |
| rhasspy/piper-voices nl_BE-nathalie-medium | VITS (Piper) | nl-BE | 22050 Hz | CC0 1.0 | Piper (ONNX upstream) | Modelo original del que deriva esta conversion |
| Phoonnx/vits-nl_be-nathalie-medium-espeak | VITS (Piper) | nl-BE | 22050 Hz | CC0 1.0 | ONNX | Version anterior con pesos previos a Piper 1.5; sustituida por esta |

No se dispone de datos de benchmarks comparativos con otras voces en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta neerlandes de Belgica (`nl-BE`); no es multilingue.
- Requiere fonemizacion externa con espeak-ng; el port espyak puede producir fonemas distintos y pronunciar mal algunas palabras.
- La calidad depende de la correccion del fonemizador y de la puntuacion de entrada; no procesa texto crudo de forma autonoma.
- Riesgo de errores de pronunciacion en palabras extranjeras, siglas o nombres propios no cubiertos por las reglas de espeak.
- Los datos de entrenamiento no estan registrados upstream, lo que impide auditar sesgos o cobertura del dominio.
- La validacion se hizo con solo 3 frases de FLORES-200 devtest; la cobertura de la evaluacion es muy limitada.
- La licencia CC0 1.0 permite uso comercial y redistribucion sin restricciones, pero se recomienda atribuir a Rhasspy segun indica la model card.
- El repositorio no contiene checkpoint de entrenamiento; solo los grafos ONNX de inferencia.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-nl_be-nathalie-medium-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/nl/nl_BE/nathalie/medium
- Repositorio rhasspy/piper-voices: https://huggingface.co/rhasspy/piper-voices
- Version anterior sustituida: https://huggingface.co/Phoonnx/vits-nl_be-nathalie-medium-espeak
- phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz OHF-Voice: https://github.com/OHF-Voice/voice-datasets
