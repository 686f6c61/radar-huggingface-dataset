# Phoonnx/vits-pl_pl-darkman-medium-espeak

## Resumen

vits-pl_pl-darkman-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo genera audio a partir de texto en polaco (pl-PL) y se distribuye como un artefacto ONNX listo para ejecutarse en Python o en el asistente OVOS, sin necesidad de infraestructura de entrenamiento.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un sistema multimodal, sino de una voz TTS concreta dentro del catalogo de voces Piper. Su interes practico reside en que permite sintesis de voz en polaco de forma local, con un peso de repositorio de 0,1 GB y licencia MIT, lo que facilita su integracion en asistentes de voz, sistemas de accesibilidad o pipelines de generacion de audio sin dependencias de servicios en la nube.

El modelo toma como entrada fonemas en alfabeto IPA generados mediante espeak-ng (o su port espyak) y produce forma de onda directamente, siguiendo el esquema end-to-end caracteristico de VITS. No se dispone de informacion publica sobre el numero de parametros, el volumen de datos de entrenamiento ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | MIT |
| Formato de pesos | ONNX (libreria phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un predictor de duracion y un decoder generativo basado en flujos normalizadores y un discriminador adversarial, entrenado de forma conjunta con perdidas de reconstruccion, adversariales y de alineamiento monotonico. El resultado es un modelo que transforma secuencias de fonemas en audio sin necesidad de un vocoder separado en tiempo de inferencia.

En este caso, el modelo procede del repositorio rhasspy/piper-voices, en la ruta pl/pl_PL/darkman/medium, y ha sido reempaquetado por Phoonnx para su libreria ONNX. La entrada de texto se procesa mediante la libreria scriptconv, que normaliza el texto y lo convierte a fonemas IPA con `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla de las propias de VITS.

## Capacidades

- Sintesis de voz a partir de texto en polaco (pl-PL), con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante espeak-ng o el port espyak.
- Ejecucion local sobre ONNX, sin dependencia de APIs externas.
- Integracion con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso en navegador a traves de phoonnx.js, con demo en tigregotico.pt/demo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al polaco; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en polaco: integracion en OVOS mediante `ovos-tts-plugin-phoonnx`, seleccionando la voz `piper/pl_PL-darkman-medium` en `mycroft.conf` para respuestas habladas sin conexion.
- Accesibilidad y lectura de contenido: conversion de articulos, notificaciones o documentos en polaco a audio para usuarios con discapacidad visual, ejecutandose en local con un peso de 0,1 GB.
- Generacion de audio para aplicaciones de navegacion o domotica: sintesis de indicaciones breves en dispositivos con recursos limitados gracias al formato ONNX y al tamano reducido del modelo.
- Prototipado de interfaces conversacionales: desarrollo de demos de voz en polaco con phoonnx en Python, sin necesidad de entrenar ni ajustar el modelo.
- Síntesis en el navegador: uso de phoonnx.js para generar voz en polaco del lado del cliente, evitando el envio de texto a servidores externos.
- Generacion de locuciones para contenido multimedia: produccion de narraciones en polaco para videos, podcasts o audiolibros a partir de texto, con control local del pipeline.
- Pruebas de integracion TTS en CI: validacion automatizada de pipelines de audio en polaco usando el modelo como voz de referencia con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que se espera un consumo de memoria moderado en CPU o GPU.
- GPU recomendadas: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en GPU consumer, pero no se documenta una lista concreta.
- Compatibilidad con GPU consumer: no confirmada en la documentacion; el tamano reducido sugiere que cabria en tarjetas de gama media, pero no se aportan datos.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada |
|---|---|---|---|---|---|
| vits-pl_pl-darkman-medium-espeak (este) | VITS | pl-PL | MIT | ONNX (phoonnx) | Fonemas IPA via espeak-ng |
| Otras voces Piper pl_PL (p. ej. variantes de rhasspy/piper-voices) | VITS | pl-PL | MIT (segun upstream) | ONNX | Fonemas IPA via espeak-ng |
| Voces VITS de la coleccion Phoonnx para otros idiomas | VITS | Otros | MIT | ONNX (phoonnx) | Fonemas IPA via espeak-ng |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta polaco (pl-PL); no es util para otros idiomas.
- Requiere espeak-ng instalado; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- La entrada debe ser texto normalizado y convertido a fonemas IPA; no acepta audio ni otras modalidades.
- No es un modelo de lenguaje: no razona, no genera codigo ni soporta tool calling.
- Riesgo de alucinacion no aplica en el sentido habitual, pero puede producir pronunciaciones incorrectas ante texto anomalo o fuera de dominio.
- No se documentan sesgos especificos, aunque al ser una voz entrenada con datos de Piper pueden existir sesgos de prosodia o acento no declarados.
- Licencia MIT declarada por el upstream; conviene verificar los terminos del repositorio rhasspy/piper-voices antes de uso comercial a gran escala.
- No se dispone de informacion sobre latencia, throughput ni calidad subjetiva (MOS) para planificacion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-darkman-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/pl/pl_PL/darkman/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
