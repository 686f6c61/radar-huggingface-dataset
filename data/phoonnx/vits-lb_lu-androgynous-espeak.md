# Phoonnx/vits-lb_lu-androgynous-espeak

## Resumen

`vits-lb_lu-androgynous-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por mbarnig y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo esta especializado en el idioma luxemburgues (codigo `lb`, variante `lb-LU`) y produce una voz de timbre androgino. Su funcion principal es convertir texto en audio inteligible para aplicaciones de asistencia por voz en luxemburgues, un idioma con escasisimos recursos de sintesis disponibles.

El modelo no es un LLM ni un transformer generativo de texto: es una red neuronal condicional de sintesis de audio que opera sobre fonemas IPA generados por espeak-ng. El repositorio tiene un tamano de 0,1 GB y se distribuye en formato ONNX, lo que permite inferencia en CPU sin dependencias de GPU. Esta empaquetado para la libreria phoonnx y se integra en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

Su relevancia radica en dos factores: cubre un idioma de bajos recursos (luxemburgues) con una licencia permisiva (CC-BY-4.0) que permite uso comercial, y su formato ONNX lo hace desplegable en entornos con recursos limitados, como dispositivos embebidos o servidores sin aceleracion hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | luxemburgues (`lb-LU`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto condicional con un prior variational, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo entrenado con perdida adversaria. El modelo genera waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado. La variante "medium" del upstream sugiere un tamano de checkpoint intermedio dentro de la familia Piper/Rhasspy.

No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de fine-tuning o adaptacion de estilo. El modelo upstream procede de la coleccion `mbarnig/lb_rhasspy_piper_tts`, orientada a voces Piper para luxemburgues. La innovacion practica del empaquetado de Phoonnx es la conversion a ONNX y la integracion con un front-end de normalizacion de texto (`scriptconv`) que transforma el texto de entrada en fonemas espeak-ng antes de la sintesis.

## Capacidades

- Sintesis de voz en luxemburgues (`lb-LU`) a partir de texto escrito.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas IPA generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`).
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en CPU gracias al formato ONNX, sin requerir GPU.
- Voz de timbre androgino (unica variante incluida en este repositorio).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en luxemburgues: el modelo permite dotar a un asistente domestico basado en OVOS de respuesta hablada en `lb-LU`, un idioma sin cobertura en la mayoria de motores TTS comerciales.
- Lectura de notificaciones y alertas: integracion en sistemas de mensajeria o domotica que necesiten anunciar eventos en voz alta en luxemburgues, con inferencia en CPU y latencia adecuada para frases cortas.
- Accesibilidad para hablantes de luxemburgues: conversion de texto a voz para personas con discapacidad visual o dificultades de lectura, desplegable en dispositivos de bajo coste gracias al formato ONNX.
- Locucion automatizada de contenido: generacion de audio para articulos, avisos o boletines en luxemburgues, con la salvedad de que la calidad depende de la fonemizacion correcta por espeak-ng.
- Prototipado de interfaces de voz: entorno de pruebas para desarrolladores que quieran validar flujos conversacionales en luxemburgues antes de invertir en un motor TTS comercial.
- Investigacion en TTS de bajos recursos: el modelo sirve como linea base para experimentos de sintesis en lenguas minoritarias, comparando el rendimiento de VITS frente a arquitecturas mas recientes en un idioma con pocos datos.
- Despliegue en el navegador: mediante `phoonnx.js`, la misma voz puede ejecutarse en el cliente con entrada espeak o unicode, util para demos web sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU mediante ONNX Runtime.
- GPU recomendadas: no necesarias. Cualquier GPU compatible con ONNX Runtime puede acelerar la inferencia, pero no es un requisito.
- Cabe en GPU consumer: si, aunque el despliegue tipico es en CPU dado el reducido tamano del repositorio (0,1 GB).
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Dependencia externa: es necesario instalar `espeak-ng` en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-lb_lu-androgynous-espeak (este modelo) | lb-LU | VITS | ONNX | CC-BY-4.0 | Fonemas espeak-ng (IPA) |
| mbarnig/lb_rhasspy_piper_tts (upstream) | lb-LU | VITS (Piper) | Piper/ONNX | CC-BY-4.0 | Fonemas espeak-ng |
| Otras voces de la coleccion VITS de Phoonnx | Multiples idiomas | VITS | ONNX | Variable (segun upstream) | Fonemas espeak-ng o unicode |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia principal entre este modelo y su upstream es el empaquetado para phoonnx y la integracion con `scriptconv` y OVOS.

## Limitaciones y advertencias

- Cobertura linguistica limitada exclusivamente al luxemburgues (`lb-LU`); no sintetiza otros idiomas.
- La calidad de la sintesis depende criticamente de la fonemizacion de espeak-ng; el propio autor advierte que el port espyak puede pronunciar mal algunas palabras por diferencias en los fonemas.
- No se dispone de informacion sobre sesgos de voz, datos de entrenamiento ni evaluaciones de naturalidad (MOS) o inteligibilidad.
- Riesgo de artefactos acusticos y prosodia limitada inherente a modelos VITS de tamano medio entrenados con datos limitados.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es necesario citar al autor original (mbarnig) y respetar los terminos de la licencia.
- El modelo no incluye capacidades de control de estilo, emocion o velocidad mas alla de las que ofrezca la API de phoonnx.
- Para produccion, conviene validar la inteligibilidad con hablantes nativos y monitorizar la calidad en frases con nombres propios o terminologia tecnica, donde la fonemizacion suele fallar.
- El numero de descargas (18) y la ausencia de likes indican una adopcion muy baja; no hay evidencia de uso en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lb_lu-androgynous-espeak
- Upstream (mbarnig): https://huggingface.co/mbarnig/lb_rhasspy_piper_tts/tree/main/lb/lb_LU/androgynous/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
