# Phoonnx/vits-gl_es-sabela

## Resumen

vits-gl_es-sabela es un modelo de sintesis de voz (text-to-speech) en gallego desarrollado originalmente por el HiTZ Center y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo parte del checkpoint upstream HiTZ/TTS-gl_sabela y se distribuye en formato ONNX listo para ejecucion, lo que elimina la dependencia de frameworks de entrenamiento y facilita su despliegue en entornos de produccion.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que convierte texto en forma de onda de audio directamente, sin necesidad de un vocoder separado. El front-end de texto utiliza el fonemizador Cotovia, propio del gallego, a traves de la libreria scriptconv, lo que permite una conversion texto-fonema adaptada a las particularidades fonologicas de esta lengua.

El modelo es relevante para el ecosistema de asistentes de voz open source, especialmente para OVOS (Open Voice OS), donde se integra mediante el plugin ovos-tts-plugin-phoonnx. Su tamano reducido (0,1 GB en el repositorio) y su licencia Apache 2.0 lo hacen adecuado para despliegues en dispositivos con recursos limitados y para su inclusion en productos comerciales sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | HiTZ Center |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. El modelo genera directamente la forma de onda a partir de la secuencia de fonemas, sin vocoder externo, lo que simplifica el pipeline de inferencia y reduce la latencia total.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del corpus ni el uso de tecnicas de RLHF o DPO en la informacion proporcionada. El modelo upstream HiTZ/TTS-gl_sabela fue entrenado por el HiTZ Center; el repositorio de Phoonnx se limita al empaquetado en ONNX y a la integracion con el front-end de texto Cotovia mediante scriptconv. La innovacion principal del paquete es la conversion a ONNX y la normalizacion de texto especifica para gallego, no cambios en la arquitectura respecto al modelo original.

## Capacidades

- Sintesis de voz en gallego (gl-ES) a partir de texto escrito.
- Conversion texto-fonema mediante el fonemizador Cotovia, adaptado a la fonologia del gallego.
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion con OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de PyTorch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente TTS).
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Asistentes de voz en gallego: integracion en OVOS mediante el plugin ovos-tts-plugin-phoonnx para dotar de voz a asistentes domesticos y aplicaciones de voz en esta lengua, con seleccion de voz via `mycroft.conf`.
- Lectura de contenido web y documentos: sintesis de articulos, noticias o textos administrativos en gallego para aplicaciones de accesibilidad o consumo de contenido en audio.
- Sistemas de anuncios y avisos automatizados: generacion de mensajes de voz dinamicos en transporte publico, aeropuertos o comercios para la poblacion gallegohablante.
- Audiolibros y narracion automatizada: conversion de textos largos en audio para plataformas de contenido en gallego, dado el bajo coste computacional del modelo.
- Integracion en aplicaciones moviles y embebidas: el formato ONNX y el tamano reducido (0,1 GB) permiten ejecucion en dispositivos con recursos limitados sin GPU dedicada.
- Prototipado de interfaces conversacionales: generacion rapida de respuestas habladas en gallego para pruebas de usabilidad y desarrollo de productos de voz antes de invertir en voces comerciales.
- Investigacion en TTS de lenguas minorizadas: uso como linea base reproducible y de codigo abierto para experimentos de sintesis en gallego y comparativas con otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) se espera un consumo de memoria muy bajo, apto para CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de pequeno tamano, es viable en CPU y en GPU de gama baja.
- Cabe en GPU consumer: previsiblemente si, dado el reducido tamano del modelo, aunque no se confirma con datos oficiales.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin ovos-tts-plugin-phoonnx para OVOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-gl_es-sabela (este) | gallego (gl-ES) | VITS | ONNX | Apache 2.0 | Empaquetado para phoonnx/OVOS |
| HiTZ/TTS-gl_sabela | gallego (gl-ES) | VITS | no disponible | Apache 2.0 | Modelo upstream original |
| Otros modelos VITS de la coleccion Phoonnx | varias lenguas | VITS | ONNX | segun modelo | Mismo pipeline de inferencia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta gallego (gl-ES); no genera voz en castellano ni en otras lenguas.
- Dependencia del fonemizador Cotovia: la calidad de la sintesis depende de la correcta conversion texto-fonema mediante scriptconv y el extra `scriptconv[gl]`.
- Riesgo de errores en palabras fuera de vocabulario, nombres propios, siglas y numeros no normalizados correctamente por el front-end.
- No se han publicado evaluaciones formales de naturalidad (MOS) ni de inteligibilidad en la informacion disponible.
- Posibles sesgos derivados del corpus de entrenamiento original del HiTZ Center (no documentados en la informacion proporcionada).
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar la procedencia y condiciones del corpus de entrenamiento original.
- El paquete se distribuye como version preliminar (`pip install --pre phoonnx`), lo que puede implicar inestabilidad en la API.
- No apto para tareas de razonamiento, codigo, vision ni agentes; es exclusivamente un modelo de sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-sabela
- Modelo upstream: https://huggingface.co/HiTZ/TTS-gl_sabela
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
