# Phoonnx/vits-bg_bg-dimitar-medium-espeak-v2

## Resumen

vits-bg_bg-dimitar-medium-espeak-v2 es un modelo de sintesis de voz (text-to-speech) en bulgaro, basado en la arquitectura VITS de Piper y publicado en formato ONNX por Phoonnx (TigreGotico Lda). Es una conversion del voice `bg_BG/dimitar/medium` del repositorio `rhasspy/piper-voices`, reentrenado por Rhasspy sobre los modelos base de Piper 1.5. El modelo resuelve la generacion de audio hablado en bulgaro de calidad media con un unico hablante, con un grafo de solo 63,2 MB, lo que lo hace adecuado para despliegue en CPU y en entornos con recursos limitados.

La relevancia de esta version (`v2`) radica en que sustituye a la conversion anterior (`Phoonnx/vits-bg_bg-dimitar-medium-espeak`), que conservaba los pesos previos al reentrenamiento sobre Piper 1.5. El modelo acepta fonemas espeak (alfabeto IPA) y conserva la puntuacion de clausula (`, . ! ? : ;`) en la sintesis con phoonnx 1.96.1a1 o superior. La frecuencia de muestreo es de 22050 Hz y el modelo tiene un unico hablante.

Se trata de un componente de infraestructura para pipelines de TTS, no de un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Su interes practico esta en la integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, y en su licencia CC0 1.0, que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto sin ventana declarada) |
| Tipos de cuantizacion | fp32 (unica version publicada; no se distribuye int8) |
| Idiomas soportados | bulgaro (bg-BG) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Puntuacion soportada | `, . ! ? : ;` |
| Fonemizador | espeak-ng, voz bg |
| Tamano del grafo | 63,2 MB |
| Tamano del repositorio | 0,1 GB |
| Voice id | `piper/bg_BG-dimitar-medium-v2` |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS en la implementacion de Piper, un modelo generativo condicionado por fonemas que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial para el entrenamiento. La entrada no es texto crudo sino fonemas IPA producidos por espeak-ng con la voz `bg`, lo que implica que la calidad depende de la correccion de la fonemizacion.

El entrenamiento es upstream: Rhasspy reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444` de `rhasspy/piper-voices`), partiendo del modelo base `rdh` (calidad media, hablante flamenco `nl_BE`, CC0) con MRD y SDP. Los datos de entrenamiento no estan registrados en la model card upstream; la unica referencia es el repositorio `OHF-Voice/voice-datasets` con licencia CC0. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333, y se requiere Piper 1.5 o superior. La conversion a ONNX para phoonnx no modifica los pesos.

## Capacidades

- Sintesis de voz en bulgaro a partir de texto, con un unico hablante (dimitar, calidad media).
- Salida de audio a 22050 Hz en formato WAV mediante `voice.synthesize_wav`.
- Fonemizacion con espeak-ng (voz `bg`); soporta tambien el port espyak incluido en `phoonnx[espeak]`, con posibles divergencias foneticas.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) en la sintesis con phoonnx 1.96.1a1 o superior.
- Inferencia en CPU con un grafo ONNX de 63,2 MB.
- Integracion con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es multilingue: solo bulgaro.

## Casos de uso

- Asistentes de voz en bulgaro: el modelo puede generar respuestas habladas en un asistente OVOS/Mycroft seleccionando la voz `piper/bg_BG-dimitar-medium-v2` en `mycroft.conf`, con latencia baja en CPU (RTF 0,043).
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de escritorio o moviles donde el coste computacional debe ser minimo; el grafo de 63,2 MB y el pico de RSS de 249,8 MB permiten ejecutarlo junto a otros procesos.
- Accesibilidad: conversion de texto a voz para lectores de pantalla en bulgaro, con una voz unica y consistente y sin dependencia de GPU.
- Generacion de audiolibros o contenido narrado por lotes: el modelo procesa texto con puntuacion de clausula, lo que mejora la prosodia en parrafos largos; el throughput medido (15,3 a 16,9 caracteres por segundo) permite estimar tiempos de render.
- Pruebas de integracion en pipelines de TTS: su formato ONNX y su licencia CC0 lo hacen util como voz de referencia en tests automatizados de sintesis sin coste de licencia.
- Sistemas embebidos y edge computing: al ejecutarse en CPU con un RTF de 0,043 en un Intel i9-11900H, es viable en dispositivos sin acelerador dedicado para respuestas de voz en tiempo casi real.
- Prototipado de interfaz conversacional en bulgaro: combinado con un LLM externo, el modelo cubre la capa de salida de voz sin requerir infraestructura de GPU.

## Benchmarks y rendimiento

La model card incluye una evaluacion de calidad con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest. Los resultados son los siguientes:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado | pass | no distribuido |
| WER | 0,048 | 0,143 |
| Caracteres por segundo | 15,3 a 16,9 | - |
| Longitud int8 / fp32 | - | 0,97 a 0,99 |
| Tamano del grafo | 63,2 MB | - |
| Pico de RSS | 249,8 MB | - |
| RTF (mediana de 3, 4 hilos) | 0,043 | - |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de sintesis dividido por la duracion del audio. La copia int8 no se publica porque no supero el umbral de calidad (diferencia de WER de 0,095 frente al limite de 0,05). No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El pico de memoria residente medido es de 249,8 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en cualquier CPU x86-64 moderna.
- Cabe en GPU consumer: si, aunque no es necesario; el grafo de 63,2 MB es trivial para cualquier GPU, pero la inferencia esta optimizada para CPU.
- CPU de referencia: Intel Core i9-11900H a 2,50 GHz, con 4 hilos, RTF 0,043.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`); integracion con OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: RTF 0,043 en la CPU de referencia; 15,3 a 16,9 caracteres por segundo de audio generado.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-bg_bg-dimitar-medium-espeak-v2 | Bulgaro | VITS (Piper) | 63,2 MB (grafo) | CC0 1.0 | ONNX | Un hablante, fp32 |
| Phoonnx/vits-bg_bg-dimitar-medium-espeak | Bulgaro | VITS (Piper) | no disponible | CC0 1.0 | ONNX | Version anterior, pesos previos a Piper 1.5 |
| rhasspy/piper-voices (bg_BG/dimitar/medium) | Bulgaro | VITS (Piper) | no disponible | CC0 1.0 | ONNX (upstream) | Modelo original de Rhasspy |
| Otros modelos TTS multilingues (p. ej. Coqui XTTS, MMS) | Multiples | no disponible | no disponible | varía | varía | No comparables directamente por tamano y enfoque |

La comparacion con modelos TTS multilingues de mayor tamano no esta disponible en la informacion proporcionada; este modelo esta disenado para un unico idioma y un unico hablante, con un coste computacional muy inferior.

## Limitaciones y advertencias

- Un solo hablante y un solo idioma (bulgaro); no admite cambio de voz ni otros idiomas.
- La calidad depende de la fonemizacion de espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se distribuye version int8: la cuantizacion int8 no supero el umbral de calidad (WER 0,143 frente a 0,048 en fp32).
- Los datos de entrenamiento no estan registrados upstream, lo que limita la evaluacion de sesgos y cobertura del dominio.
- Riesgo de prosodia incorrecta en texto sin puntuacion de clausula o con estructuras sintacticas atipicas.
- La evaluacion de calidad se realizo sobre solo 3 frases de FLORES-200 devtest, una muestra muy reducida.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy como autor original.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-bg_bg-dimitar-medium-espeak-v2
- Modelo anterior: https://huggingface.co/Phoonnx/vits-bg_bg-dimitar-medium-espeak
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/bg/bg_BG/dimitar/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz upstream: https://github.com/OHF-Voice/voice-datasets
