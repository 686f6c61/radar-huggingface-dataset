# Phoonnx/vits-eu-antton-espeak-v2

## Resumen

vits-eu-antton-espeak-v2 es una voz de sintesis de voz (text-to-speech) en euskera, publicada por Phoonnx (TigreGotico Lda) como conversion a ONNX del modelo original de Rhasspy. Se trata de una voz VITS del ecosistema Piper, concretamente la variante `eu_ES/antton/medium` del repositorio `rhasspy/piper-voices`, reentrenada por el autor original sobre los modelos base de Piper 1.5. La version `v2` sustituye a la anterior `Phoonnx/vits-eu-antton-espeak`, que conserva los pesos previos al reentrenamiento.

El modelo resuelve un problema concreto: ofrecer sintesis de voz de calidad media en euskera dentro del runtime phoonnx, con pesos en formato ONNX y una variante int8 para despliegue en CPU. No es un modelo de lenguaje ni un sistema multimodal: es un sintetizador acustico de un solo hablante que toma fonemas espeak-ng (alfabeto IPA) como entrada y genera audio a 22050 Hz.

Su relevancia es practica para desarrolladores que construyen asistentes de voz en euskera: el repositorio ocupa unos 0,1 GB, la variante int8 reduce el grafo a 18,7 MB y el RTF medido en CPU es de 0,039 en fp32 y 0,101 en int8, lo que permite sintesis mas rapida que tiempo real en hardware de consumo. La licencia CC BY 4.0 facilita su uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica con onnxruntime.quantization.quantize_dynamic, pesos QInt8) |
| Idiomas soportados | euskera (eu) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafo fp32 e int8) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Fonemizador | espeak-ng, voz `eu` |
| Puntuacion soportada | coma, punto, exclamacion, interrogacion, dos puntos, punto y coma |
| Tamano del repositorio | 0,1 GB |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Memoria pico (RSS) | 260,9 MB (fp32) / 219,4 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,039 (fp32) / 0,101 (int8) |
| Libreria | phoonnx |
| Checkpoint de entrenamiento | no incluido en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es VITS en su implementacion Piper, un modelo generativo condicional que combina un encoder de texto, un predictor de duracion y un decoder acustico basado en flujos normalizadores, con salida de audio a 22050 Hz. La entrada no es texto crudo sino fonemas generados por espeak-ng con la voz `eu`, en alfabeto IPA. El modelo fue entrenado con la puntuacion de clausula `, . ! ? : ;`, y phoonnx 1.96.1a1 o posterior la preserva en la sintesis. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior.

El entrenamiento lo realizo Rhasspy (upstream) mediante fine-tuning desde el modelo base `rdh` (calidad medium, hablante flamenco de `nl_BE`, CC0), con las tecnicas MRD y SDP. Los datos de entrenamiento provienen del dataset `itzune/antton-dataset`, publicado bajo CC BY 4.0, aunque la model card original no registra el volumen de datos ni la composicion exacta. Esta conversion de Phoonnx no modifica los pesos: solo los exporta a ONNX y genera copias int8 con cuantizacion dinamica (onnxruntime 1.32.0).

## Capacidades

- Sintesis de voz en euskera a partir de texto, con fonemizacion previa mediante espeak-ng (voz `eu`).
- Generacion de audio mono a 22050 Hz en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) para modelar pausas y entonacion.
- Control de variabilidad de sintesis mediante los parametros `noise_scale` y `noise_w`.
- Inferencia en CPU con variante int8 optimizada para despliegue ligero.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No soporta vision, audio de entrada ni otros idiomas distintos del euskera.

## Casos de uso

- Asistentes de voz en euskera: integracion en OVOS mediante `ovos-tts-plugin-phoonnx` seleccionando la voz `piper_community/itzune/eu-antton-medium-v2` en `mycroft.conf`, con sintesis en CPU y RTF por debajo de 1.
- Lectura de contenidos en euskera: conversion de articulos, noticias o documentacion a audio WAV para podcasts o accesibilidad, aprovechando el soporte de puntuacion de clausula para pausas naturales.
- Sistemas de navegacion o avisos por voz: generacion de mensajes cortos en tiempo real en dispositivos embebidos, donde el grafo int8 de 18,7 MB y el pico de 219,4 MB de RSS permiten ejecucion en hardware modesto.
- Atencion al cliente telefonica en euskera: sintesis de respuestas en IVR o chatbots de voz, con la ventaja de que la licencia CC BY 4.0 permite uso comercial con atribucion a Rhasspy.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla en euskera en aplicaciones de escritorio o moviles, con latencia baja gracias al RTF de 0,039 en fp32 sobre CPU.
- Prototipado de interfaces conversacionales: generacion rapida de clips de audio para pruebas de UX o doblaje de demos en euskera, sin necesidad de GPU.
- Investigacion en TTS de lenguas de bajos recursos: el modelo sirve como referencia para comparar tecnicas de fine-tuning (MRD, SDP) sobre modelos base Piper en euskera.

## Benchmarks y rendimiento

La model card incluye una evaluacion de control de calidad (QA) con metodo sin ASR: comprobacion de longitud y silencio sobre 3 frases de FLORES-200 devtest.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| Caracteres por segundo | 15,4 a 16,2 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,98 a 1,02 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Memoria pico (RSS) | 260,9 MB | 219,4 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,101 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de sintesis dividido por la duracion del audio. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta disenado para inferencia en CPU (ONNX Runtime).
- Memoria RAM: pico de 260,9 MB en fp32 y 219,4 MB en int8.
- GPU recomendadas: no se especifican; el modelo no requiere GPU.
- Cabe en cualquier equipo de consumo: el grafo int8 ocupa 18,7 MB y el fp32 63,2 MB, por lo que funciona en portatiles, Raspberry Pi y dispositivos embebidos sin problemas de espacio.
- Opciones de despliegue: phoonnx (libreria oficial), con integracion en OVOS mediante `ovos-tts-plugin-phoonnx`; requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` (port espyak, con posibles diferencias foneticas).
- Latencia y throughput: RTF de 0,039 en fp32 y 0,101 en int8 sobre un i9-11900H con 4 hilos, es decir, sintesis entre 10 y 25 veces mas rapida que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-eu-antton-espeak-v2 | VITS (Piper) | eu | 22050 Hz | CC BY 4.0 | ONNX (fp32/int8) | Voz medium reentrenada sobre Piper 1.5; RTF 0,039 fp32 |
| Phoonnx/vits-eu-antton-espeak | VITS (Piper) | eu | 22050 Hz | CC BY 4.0 | ONNX | Version anterior con pesos previos al reentrenamiento; sustituida por v2 |
| rhasspy/piper-voices (eu_ES/antton/medium) | VITS (Piper) | eu | 22050 Hz | CC BY 4.0 | ONNX (Piper) | Modelo upstream original; misma voz antes de la conversion de Phoonnx |
| rhasspy/piper-voices (otras voces eu) | VITS (Piper) | eu | 22050 Hz | CC BY 4.0 | ONNX (Piper) | Otras voces del catalogo Piper para euskera; no se dispone de datos comparativos de calidad |

## Limitaciones y advertencias

- Modelo de un solo hablante y un solo idioma (euskera); no admite cambio de voz ni otros idiomas.
- La entrada debe ser texto fonemizado por espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento (`itzune/antton-dataset`); al ser una voz clonada de un hablante concreto, puede reflejar caracteristicas de ese hablante.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir artefactos o prosodia incorrecta en textos fuera de dominio o con puntuacion atipica.
- La cuantizacion int8 duplica el RTF (0,101 frente a 0,039) aunque reduce el grafo y la memoria; conviene validar la calidad perceptual antes de usarla en produccion.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribucion a Rhasspy (y a TigreGotico por la conversion); no se permite reclamar autoria del modelo original.
- Requiere Piper 1.5 o superior y phoonnx 1.96.1a1 o posterior para preservar la puntuacion de clausula.
- No se incluye checkpoint de entrenamiento en el repositorio, lo que dificulta la reproducibilidad o el reentrenamiento.
- El QA se limita a 3 frases de FLORES-200 con comprobacion de longitud y silencio, sin evaluacion ASR ni MOS; la evidencia de calidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-eu-antton-espeak-v2
- Modelo anterior sustituido: https://huggingface.co/Phoonnx/vits-eu-antton-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/eu/eu_ES/antton/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de entrenamiento: https://huggingface.co/datasets/itzune/antton-dataset
