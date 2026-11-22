# Phoonnx/vits-vi_vn-vais1000-espeak-v2

## Resumen

`Phoonnx/vits-vi_vn-vais1000-espeak-v2` es una voz de síntesis de habla (text-to-speech) en vietnamita para el motor [phoonnx](https://github.com/TigreGotico/phoonnx), empaquetada en formato ONNX. No es un modelo de lenguaje: es un modelo acústico VITS (la arquitectura que usa Piper) que convierte fonemas espeak-ng (alfabeto IPA) en audio a 22050 Hz. Lo publica Phoonnx (TigreGotico Lda) como conversión del checkpoint original de Rhasspy `rhasspy/piper-voices/vi/vi_VN/vais1000/medium`, sobre la base Piper 1.5.

La relevancia de esta revisión (`-v2`) es que sustituye al repositorio anterior `Phoonnx/vits-vi_vn-vais1000-espeak`: el upstream reentrenó la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`), y el repositorio antiguo conserva los pesos previos. La conversión no altera los pesos; solo añade copias cuantizadas int8 generadas con `onnxruntime.quantization.quantize_dynamic`.

El modelo está pensado para integrarse en asistentes de voz (OVOS, mediante el plugin `ovos-tts-plugin-phoonnx`) y en pipelines ligeros de TTS en CPU. Su tamaño es reducido (63,2 MB el grafo fp32, 18,7 MB la copia int8) y el repo completo ocupa 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper 1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS por fonemas; no hay ventana de contexto) |
| Tipos de cuantizacion | fp32 e int8 (QInt8, cuantizacion dinamica con onnxruntime) |
| Idiomas soportados | vietnamita (`vi-VN`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |

Otros datos tecnicos: frecuencia de muestreo 22050 Hz, un solo hablante, entrada de texto en fonemas espeak-ng (IPA, voz `vi`), fonemizador espeak-ng, puntuacion entrenada `, . ! ? : ;`, ajustes de inferencia por defecto `noise_scale 0.5` y `noise_w 0.333`, requiere Piper 1.5 o superior. Identificador de voz en phoonnx: `piper_community/phcatan9921/vi-VN_vais1000-v2`.

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un predictor de duraciones, un flujo normalizador y un decodificador de audio de tipo HiFi-GAN, entrenado con perdidas adversarias y de verosimilitud. En esta variante Piper, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng; el modelo aprende el mapeo fonema-a-mel y el vocoder en una sola red.

Segun la model card, el upstream parte de un ajuste fino sobre el modelo base `hifi_tts_92` (ingles estadounidense, calidad medium, voz de Cori Samuel, lectora 92 de Hi-Fi TTS) con MRD y SDP, y se entrena sobre el corpus VAIS-1000 Vietnamese Speech Synthesis Corpus (licencia CC BY 4.0). La model card indica que los datos de entrenamiento y el modelo base no quedaron registrados en el repositorio upstream y que no se incluye checkpoint de entrenamiento. No se detalla el numero de tokens ni la composicion exacta del dataset mas alla de la referencia al corpus VAIS-1000.

## Capacidades

- Sintesis de voz en vietnamita (`vi-VN`) a partir de texto, con fonemizacion espeak-ng.
- Salida de audio mono a 22050 Hz, un unico hablante.
- Respeto de la puntuacion de clausula `, . ! ? : ;` en la sintesis (a partir de phoonnx 1.96.1a1).
- Inferencia en CPU con ONNX Runtime; disponible en fp32 e int8.
- Integracion con OVOS mediante `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente TTS.
- No es multilingue: solo vietnamita.

## Casos de uso

- Asistentes de voz en OVOS: seleccionar la voz `piper_community/phcatan9921/vi-VN_vais1000-v2` en `mycroft.conf` para dar respuesta hablada en vietnamita en un asistente domestico, con inferencia en CPU.
- Lectura de contenido en vietnamita: sintetizar articulos o notificaciones a partir de texto plano, aprovechando el soporte de puntuacion para pausas naturales.
- Sistemas de megafonia y avisos automatizados: generar anuncios pregrabados en vietnamita para transporte, comercio o edificios, con el grafo int8 (18,7 MB) para dispositivos empotrados.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual en entornos vietnamitas.
- Pruebas y desarrollo de pipelines TTS: al ser un modelo pequeno y ONNX, sirve como voz de referencia en tests de integracion de phoonnx y en la validacion de fonemizacion espeak-ng.
- Generacion de audio para prototipos de IVR: respuestas habladas en centralitas telefonicas o bots de voz en vietnamita, con RTF bajo en CPU (0,040 en fp32 y 0,104 en int8, medido en un i9-11900H con 4 hilos).
- Evaluacion comparativa de cuantizacion: comparar fp32 frente a int8 en calidad y latencia usando las metricas publicadas (longitud int8/fp32 entre 0,94 y 1,00).

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad tipo MMLU, HumanEval o GSM8K (no aplican a un modelo TTS). Si incluye una tabla de control de calidad (QA) con comprobaciones de longitud y silencio sobre FLORES-200 devtest (3 frases), sin ASR:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| Caracteres por segundo | 18,1 a 23,6 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,94 a 1,00 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 274,4 MB | 240,3 MB |
| RTF (mediana de 3, 4 hilos) | 0,040 | 0,104 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es tiempo de sintesis dividido por la duracion del audio. No se han publicado resultados de benchmarks de calidad subjetiva (MOS) en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU con ONNX Runtime.
- RAM: RSS pico de 274,4 MB en fp32 y 240,3 MB en int8.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no se documenta.
- Cabe en cualquier equipo consumer: el grafo int8 ocupa 18,7 MB y el fp32 63,2 MB.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente. Requiere espeak-ng instalado (o el extra `phoonnx[espeak]`, que usa espyak y puede pronunciar mal algunas palabras).
- Latencia y throughput: RTF 0,040 en fp32 y 0,104 en int8 en un i9-11900H con 4 hilos; es decir, la sintesis es entre 10 y 25 veces mas rapida que tiempo real en ese equipo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Muestreo | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (`vits-vi_vn-vais1000-espeak-v2`) | VITS (Piper 1.5) | vi-VN | 22050 Hz | CC BY 4.0 | ONNX (fp32/int8) |
| `Phoonnx/vits-vi_vn-vais1000-espeak` (version anterior) | VITS (Piper) | vi-VN | no disponible en la informacion | CC BY 4.0 | ONNX |
| `rhasspy/piper-voices` vi/vi_VN/vais1000/medium (upstream) | VITS (Piper 1.5) | vi-VN | 22050 Hz | CC BY 4.0 | pesos Piper |
| Otras voces Piper de otros idiomas | VITS (Piper) | varios | variable | variable | ONNX |

No se dispone de datos de rendimiento comparativo con otras voces vietnamitas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no genera texto, no razona, no soporta tool calling ni agentes.
- Solo vietnamita; no es multilingue.
- Un unico hablante y una unica calidad (medium); no hay control de estilo ni de emocion.
- Dependencia de espeak-ng: con el puerto espyak algunas pronunciaciones pueden ser incorrectas, segun advierte la propia model card.
- La fonemizacion es sensible a la puntuacion; versiones de phoonnx anteriores a 1.96.1a1 no conservan la puntuacion de clausula en la sintesis.
- No se documentan datos de entrenamiento ni modelo base en el repositorio upstream (la model card indica "not recorded"), lo que limita la trazabilidad.
- Riesgo de alucinacion no aplica en el sentido de texto, pero si puede producirse audio mal pronunciado o silencios inesperados ante entradas fuera de distribucion.
- Licencia CC BY 4.0: permite uso comercial con atribucion a Rhasspy (autor original) y a TigreGotico Lda (conversion).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente y poco validada por la comunidad.
- No se incluye checkpoint de entrenamiento; solo los grafos ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-vi_vn-vais1000-espeak-v2
- Modelo anterior: https://huggingface.co/Phoonnx/vits-vi_vn-vais1000-espeak
- Upstream (Piper voices, vi_VN/vais1000/medium): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/vi/vi_VN/vais1000/medium
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Corpus VAIS-1000: https://ieee-dataport.org/documents/vais-1000-vietnamese-speech-synthesis-corpus
