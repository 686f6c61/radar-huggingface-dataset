# Phoonnx/vits-es_ar-daniela

## Resumen

vits-es_ar-daniela es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX homonima. El modelo original procede de larcanio/piper-voices y sintetiza voz en castellano con acento argentino (es-AR) a partir de texto. Su relevancia radica en que ofrece una voz TTS ligera (repo de 0,1 GB) y ejecutable en ONNX Runtime, lo que facilita su despliegue en entornos con recursos limitados, incluido el navegador mediante phoonnx.js.

El modelo no es un LLM ni un modelo generativo de texto: es un sistema TTS condicionado por fonemas. La entrada de texto se convierte primero a fonemas IPA mediante espeak-ng (o su port espyak) y el front end de normalizacion de scriptconv. La salida es audio WAV sintetizado. Esta pensado para asistentes de voz, lectores de pantalla y sistemas de respuesta por voz, no para tareas de razonamiento o generacion de codigo.

La licencia MIT y el formato ONNX lo hacen adecuado para integracion comercial sin restricciones significativas, aunque la calidad depende de la correcta instalacion de espeak-ng y de la normalizacion del texto en castellano rioplatense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | es-AR (castellano, variante argentina) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Front end | scriptconv (EspeakPhonemizer) + espeak-ng |
| Tamano del repositorio | 0,1 GB |
| Libreria de ejecucion | phoonnx (Python, OVOS, phoonnx.js) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder generativo basado en redes adversarias generativas (GAN) condicionadas. El modelo toma fonemas IPA como entrada y genera directamente la forma de onda, evitando pipelines separados de alineamiento y vocoder. Esta version ha sido exportada a ONNX para su ejecucion con phoonnx.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de origen ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. La model card indica unicamente que el modelo procede de larcanio/piper-voices y que la autoria original es de larcanio. No se documentan innovaciones tecnicas adicionales mas alla del empaquetado ONNX y la integracion con el front end de scriptconv.

## Capacidades

- Sintesis de voz a partir de texto en castellano con variante argentina (es-AR).
- Conversion de texto a fonemas IPA mediante espeak-ng o el port espyak.
- Normalizacion y conversion de texto mediante scriptconv antes de la sintesis.
- Generacion de audio WAV directamente desde Python con phoonnx.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al castellano rioplatense; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz para el hogar: integrado en OVOS mediante el plugin ovos-tts-plugin-phoonnx, el modelo puede leer respuestas del asistente en castellano argentino con baja latencia gracias a su ejecucion ONNX.
- Lectores de pantalla y accesibilidad: sintesis de texto a voz para aplicaciones de escritorio o web que necesiten una voz en castellano rioplatense sin depender de servicios en la nube.
- Respuesta por voz en aplicaciones de atencion al cliente: generacion de respuestas habladas en es-AR para IVR o chatbots telefonicos, con la ventaja de la licencia MIT y el despliegue local.
- Audiolibros y contenido narrado: conversion de textos largos a audio WAV mediante phoonnx, adecuado para narracion automatizada en castellano argentino.
- Sistemas embebidos y edge computing: el tamano reducido del repositorio (0,1 GB) y el formato ONNX permiten ejecutar el modelo en dispositivos con recursos limitados.
- Demos y prototipado web: uso de phoonnx.js para sintetizar voz en el navegador sin backend, util para pruebas de concepto y demos interactivas.
- Localizacion de contenido para Argentina: adaptacion de textos a voz con acento local en aplicaciones de formacion, noticias o entretenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida y probablemente inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPU consumer sin requisitos especiales.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), OVOS mediante ovos-tts-plugin-phoonnx, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/uso |
|---|---|---|---|---|---|
| vits-es_ar-daniela (este modelo) | VITS | es-AR | MIT | ONNX | TTS, 0,1 GB |
| Otras voces de larcanio/piper-voices | VITS | varios | segun upstream | ONNX | TTS, empaquetadas para phoonnx |
| Piper TTS (rhasspy/piper) | VITS | multilingue | MIT | ONNX | TTS, ecosistema amplio |
| Modelos TTS comerciales en la nube | propietaria | multilingue | propietaria | API | TTS con latencia de red |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La calidad de sintesis depende de la correcta instalacion de espeak-ng; con espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- El modelo esta limitado al castellano con variante argentina (es-AR); no se documenta soporte para otras variantes del castellano ni otros idiomas.
- No es un modelo de lenguaje: no razona, no genera codigo ni responde preguntas; solo sintetiza voz a partir de texto.
- Riesgo de pronunciacion incorrecta en palabras extranjeras, siglas o terminos tecnicos que el front end no normalice adecuadamente.
- No se documentan sesgos especificos del hablante ni del dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero el modelo card remite a los terminos del release upstream (larcanio/piper-voices); conviene verificar dichos terminos antes de produccion.
- No se documentan garantias de calidad, latencia ni estabilidad para cargas de produccion de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_ar-daniela
- Repositorio upstream: https://huggingface.co/larcanio/piper-voices
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
