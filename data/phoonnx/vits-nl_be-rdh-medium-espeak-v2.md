# Phoonnx/vits-nl_be-rdh-medium-espeak-v2

## Resumen

`Phoonnx/vits-nl_be-rdh-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en neerlandes de Belgica (`nl-BE`) basada en la arquitectura VITS y empaquetada para el motor [phoonnx](https://github.com/TigreGotico/phoonnx). No es un modelo de lenguaje: es un modelo acustico de TTS que convierte fonemas espeak (alfabeto IPA) en audio a 22050 Hz. Lo publica Phoonnx (TigreGotico Lda) como conversion a ONNX de la voz original de Rhasspy `rhasspy/piper-voices/nl/nl_BE/rdh/medium`, sin alterar los pesos originales.

La relevancia de esta version (`v2`) es que sustituye a `Phoonnx/vits-nl_be-rdh-medium-espeak`, ya que el upstream reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`). El repositorio ocupa 0,1 GB e incluye tanto el grafo en fp32 (63,2 MB) como una copia cuantizada int8 (18,7 MB) generada con `onnxruntime.quantization.quantize_dynamic`. Es, por tanto, un modelo muy ligero, orientado a sintesis local en CPU y a integracion en asistentes de voz (OVOS/Mycroft).

Su interes practico radica en el binomio tamano-rendimiento: con un pico de RSS de unos 210-236 MB y un RTF de 0,047 (fp32) o 0,105 (int8) en un Intel i9-11900H, es desplegable en hardware modesto sin GPU. La licencia CC0 1.0 elimina practicamente cualquier friccion para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | fp32 e int8 (QInt8, `quantize_dynamic` de onnxruntime 1.32.0) |
| Idiomas soportados | neerlandes de Belgica (`nl-BE`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Puntuacion entrenada | `, . ! ? : ;` (preservada en sintesis desde phoonnx 1.96.1a1) |
| Numero de hablantes | 1 |
| Fonemizador | espeak-ng, voz `nl` |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 236,0 MB (fp32) / 209,7 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,047 (fp32) / 0,105 (int8) |
| Voces | `piper/nl_BE-rdh-medium-v2` |
| Libreria | phoonnx |
| Modelo base | `rhasspy/piper-voices` (relacion: quantized) |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional y un decoder basado en flujos normalizadores y un generador HiFi-GAN, entrenado con perdidas adversarias y de reconstruccion. En el ecosistema Piper se usa la variante "medium", que prioriza velocidad de inferencia en CPU sobre calidad absoluta. La entrada no es texto crudo sino fonemas IPA producidos por espeak-ng (voz `nl`); por eso el pipeline requiere instalar espeak-ng o el port espyak.

Segun la model card, el entrenamiento upstream se realizo "desde cero, con MRD y SDP" sobre el corpus del proyecto `r-dh/dutch-vl-tts` (licencia CC0 1.0). El audio se preproceso con un filtro paso alto a 70 Hz y un notch a 50 Hz para eliminar retumbe y zumbido de red electrica. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y se requiere Piper 1.5 o superior. Esta version concreta no aporta entrenamiento nuevo: es una conversion a ONNX de los pesos reentrenados por Rhasspy en el commit `e9c8a39444`, mas una copia int8. Los datos de entrenamiento y el modelo base original no estan registrados en el repositorio de conversion.

## Capacidades

- Sintesis de voz mono-hablante en neerlandes de Belgica a partir de texto.
- Conversion texto -> fonemas IPA via espeak-ng (voz `nl`) y sintesis acustica VITS.
- Respeto de puntuacion de clausula (`, . ! ? : ;`) en la sintesis con phoonnx 1.96.1a1 o superior.
- Salida de audio WAV a 22050 Hz mediante `synthesize_wav`.
- Ejecucion en CPU sin GPU gracias a los grafos ONNX y a la cuantizacion int8.
- Integracion como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente TTS.
- No es multilingue: solo `nl-BE`.

## Casos de uso

- Asistentes de voz locales (OVOS/Mycroft): seleccionando la voz `piper/nl_BE-rdh-medium-v2` en `mycroft.conf`, el asistente responde en neerlandes de Belgica sin depender de servicios en la nube, con un consumo de memoria en torno a 210-236 MB.
- Lectura de notificaciones y alertas en aplicaciones flamencas: el modelo sintetiza frases cortas con puntuacion respetada, adecuado para mensajes de sistema y avisos por voz.
- Accesibilidad para personas con discapacidad visual: conversion de articulos o interfaces a audio en `nl-BE` en dispositivos de bajos recursos, incluida Raspberry Pi, dado el bajo RTF en CPU.
- Sistemas de megafonia e informacion publica en Belgica: generacion previa de locuciones WAV para estaciones, transporte o comercios, con licencia CC0 que permite redistribuir el audio sin restricciones.
- Integracion en pipelines de CI/CD de contenido: sintesis por lotes de guiones o subtitulos en neerlandes para doblaje interno o prototipos, usando la version int8 (18,7 MB) para contenedores ligeros.
- Pruebas de regresion de TTS: el repositorio incluye un metodo de QA con ASR (`nemo-parakeet-tdt-0.6b-v3` int8) y WER medido, util como referencia para validar cambios en el pipeline de sintesis.
- Educacion y aprendizaje de idiomas: generacion de audio de referencia en neerlandes belga para ejercicios de pronunciacion, con ajuste de `noise_scale` para variar la expresividad.

## Benchmarks y rendimiento

Los unicos datos publicados son los del control de calidad (QA) del propio repositorio, medidos con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,100 | 0,033 |
| Caracteres por segundo | 18,8 a 22,8 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,01 a 1,04 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 236,0 MB | 209,7 MB |
| RTF (mediana de 3, 4 hilos) | 0,047 | 0,105 |

No se han publicado resultados de benchmarks estandar de TTS (MOS, MCD, etc.) en la informacion disponible. La muestra de QA es muy reducida (3 frases), por lo que el WER no debe interpretarse como una evaluacion robusta.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime.
- Memoria RAM: pico de RSS de 236,0 MB (fp32) y 209,7 MB (int8).
- GPU recomendadas: no aplica; no se documenta ejecucion en GPU.
- CPU: medido en Intel Core i9-11900H con 4 hilos; funciona en procesadores de escritorio y portatiles convencionales, y probablemente en SBC tipo Raspberry Pi por el reducido tamano del grafo.
- Despliegue: libreria `phoonnx` (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak). Integracion via `ovos-tts-plugin-phoonnx` en OVOS/Mycroft.
- Latencia y throughput: RTF 0,047 en fp32 y 0,105 en int8 (tiempo de sintesis dividido por duracion del audio); es decir, sintetiza aproximadamente 21x y 9,5x mas rapido que tiempo real respectivamente en el hardware medido. Curiosamente, la version int8 es mas lenta en este equipo pese a ocupar menos memoria.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Phoonnx/vits-nl_be-rdh-medium-espeak-v2 | VITS (Piper) ONNX | nl-BE | 63,2 MB fp32 / 18,7 MB int8 | CC0 1.0 | Version reentrenada sobre Piper 1.5 |
| Phoonnx/vits-nl_be-rdh-medium-espeak | VITS (Piper) ONNX | nl-BE | no disponible | CC0 1.0 | Version anterior, pesos previos al reentrenamiento |
| rhasspy/piper-voices (nl/nl_BE/rdh/medium) | VITS (Piper) | nl-BE | no disponible | CC0 1.0 | Modelo upstream original de Rhasspy |
| Otras voces Piper medium | VITS (Piper) | varios | orden de decenas de MB | segun voz (mayoria permisivas) | Misma familia de modelos, distinto idioma/hablante |

No se dispone de datos comparativos de calidad (MOS) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo sintetiza neerlandes de Belgica (`nl-BE`); no es multilingue ni acepta texto en otros idiomas sin fonemizacion adecuada.
- Depende de espeak-ng para la fonemizacion: sin el instalado, el port espyak puede producir fonemas distintos y pronunciar mal algunas palabras.
- Mono-hablante y voz "medium": la calidad es inferior a modelos TTS neuronales grandes; no se han publicado metricas de calidad subjetiva.
- El QA se basa en solo 3 frases, por lo que el WER reportado (0,100 fp32 / 0,033 int8) tiene baja significancia estadistica.
- La version int8, aunque mas pequena, resulto mas lenta (RTF 0,105 vs 0,047) en el hardware medido; conviene validar el rendimiento en el equipo objetivo.
- Riesgo de artefactos y prosodia limitada en frases largas o con puntuacion no cubierta por el entrenamiento.
- Los datos de entrenamiento y el modelo base original no estan registrados en el repositorio de conversion, lo que dificulta la trazabilidad completa.
- Licencia CC0 1.0: permite uso comercial y redistribucion sin restricciones, pero se recomienda atribuir a Rhasspy segun pide la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_be-rdh-medium-espeak-v2
- Modelo anterior sustituido: https://huggingface.co/Phoonnx/vits-nl_be-rdh-medium-espeak
- Upstream (Rhasspy, commit `e9c8a39444`): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/nl/nl_BE/rdh/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Corpus de entrenamiento upstream: https://github.com/r-dh/dutch-vl-tts
