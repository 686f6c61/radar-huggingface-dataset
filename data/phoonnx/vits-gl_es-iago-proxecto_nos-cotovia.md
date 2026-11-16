# Phoonnx/vits-gl_es-iago-proxecto_nos-cotovia

## Resumen

vits-gl_es-iago-proxecto_nos-cotovia es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo genera audio en gallego (gl-ES) a partir de texto, tomando como entrada fonemas en el alfabeto cotovia. Se distribuye como un repositorio ONNX de aproximadamente 0,1 GB, lo que lo hace ligero y adecuado para despliegue en entornos con recursos limitados.

El modelo resuelve la necesidad de sintesis de voz en gallego dentro del ecosistema OpenVoiceOS (OVOS), integrándose mediante el plugin `ovos-tts-plugin-phoonnx`. Su relevancia radica en que cubre un idioma con poca representacion en el ecosistema TTS open source, y lo hace con una licencia MIT que permite uso comercial sin restricciones adicionales.

La informacion disponible no incluye detalles sobre el tamano en parametros, la longitud de contexto ni los datos de entrenamiento, por lo que estos apartados se marcan como no disponibles. La ficha se limita a lo que la model card y los metadatos de Hugging Face documentan explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas cotovia, alfabeto cotovia |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. Genera formas de onda directamente a partir de la representacion fonetica sin necesidad de un vocoder separado. El modelo empaquetado por Phoonnx se distribuye en formato ONNX, lo que permite inferencia sin dependencias de PyTorch y facilita el despliegue en entornos de produccion ligeros.

El front-end de texto no forma parte del modelo ONNX: phoonnx delega la normalizacion y la conversion a fonemas en la libreria scriptconv, concretamente en el `CotoviaPhonemizer` del modulo `scriptconv_copyleft.phonemizers.gl`, instalado mediante el extra `scriptconv[gl]`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla de las propias de VITS. El modelo deriva del release upstream de OpenVoiceOS (`proxectonos-iago-vits-phonemes-onnx`), que es la fuente original de los pesos.

## Capacidades

- Sintesis de voz en gallego (gl-ES) a partir de texto escrito en alfabeto cotovia.
- Conversion texto-a-fonemas mediante el fonemizador Cotovia integrado en scriptconv.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion como plugin TTS en OpenVoiceOS (`ovos-tts-plugin-phoonnx`), seleccionable por configuracion en `mycroft.conf`.
- Voz unica identificada como `proxectonos/iago-cotovia`.
- Inferencia ONNX sin dependencia de PyTorch en tiempo de ejecucion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking, al tratarse de un modelo TTS puro.

## Casos de uso

- Asistentes de voz en gallego: integracion en OpenVoiceOS mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de salida de voz en gallego a asistentes domesticos y altavoces inteligentes, seleccionando la voz `proxectonos/iago-cotovia` en la configuracion.
- Lectura de contenido web y documentos: conversion de articulos, noticias o textos administrativos en gallego a audio para accesibilidad o consumo pasivo, usando la API `synthesize_wav` sobre el texto normalizado por scriptconv.
- Locucion automatizada de contenidos multimedia: generacion de narraciones para videos, podcasts o material educativo en gallego sin intervencion humana, aprovechando el tamano reducido del modelo (0,1 GB) para procesamiento por lotes.
- Sistemas de anuncios publicos y transporte: sintesis de mensajes dinamicos en gallego para paneles y megafonia en estaciones, aeropuertos o edificios publicos, con inferencia ONNX ligera en hardware modesto.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de interfaces y contenido digital en gallego dentro de aplicaciones de escritorio o moviles que integren phoonnx.
- Prototipado rapido de aplicaciones de voz: al ser un modelo ONNX pequeno con licencia MIT, sirve para validar pipelines TTS en gallego antes de invertir en modelos mayores o en voces personalizadas.
- Investigacion en TTS para lenguas minorizadas: base reproducible para experimentos de sintesis en gallego y comparacion con otros sistemas, dado que los pesos y el front-end estan publicamente disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se trata de un modelo muy ligero que previsiblemente cabe en GPUs consumer de gama baja e incluso podria ejecutarse en CPU.
- GPU recomendadas: no disponible; cualquier GPU con soporte ONNX Runtime deberia ser suficiente, aunque no se documentan modelos concretos.
- Compatibilidad con GPU consumer: alta probabilidad segun el tamano de los pesos, aunque no se confirma en la documentacion.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Contexto |
|---|---|---|---|---|---|---|
| vits-gl_es-iago-proxecto_nos-cotovia | VITS | gallego (gl-ES) | MIT | ONNX | 0,1 GB | no aplica |
| OpenVoiceOS/proxectonos-iago-vits-phonemes-onnx | VITS | gallego (gl-ES) | no disponible en la informacion | no disponible | no disponible | no aplica |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | MIT (segun coleccion) | ONNX | variable | no aplica |

La comparativa se limita al modelo upstream del que deriva este empaquetado y a la coleccion VITS de Phoonnx, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas fuera de ese ecosistema.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con voces de un unico hablante (iago), la variedad de timbre y estilo es limitada.
- Riesgo de alucinacion: en TTS se traduce en posibles artefactos, prosodia incorrecta o pronunciacion erronea de palabras fuera del dominio de entrenamiento; no se documenta su magnitud.
- Limitaciones de idioma: el modelo solo soporta gallego (gl-ES) y espera entrada en alfabeto cotovia; texto en otros idiomas o alfabetos requerira conversion previa y probablemente producira resultados incorrectos.
- Dependencia del front-end: la calidad final depende de scriptconv y del fonemizador Cotovia; errores en la normalizacion afectan directamente al audio generado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; conviene verificar los terminos del release upstream por si imponen condiciones adicionales.
- Caveats para produccion: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad; no hay benchmarks publicados que respalden su calidad frente a alternativas.
- Fecha de creacion y actualizacion muy recientes (16 de noviembre de 2026), por lo que el modelo es nuevo y su estabilidad en produccion no esta contrastada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-iago-proxecto_nos-cotovia
- Modelo upstream (OpenVoiceOS): https://huggingface.co/OpenVoiceOS/proxectonos-iago-vits-phonemes-onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
