# Phoonnx/vits-fr_fr-siwis-medium

## Resumen

`vits-fr_fr-siwis-medium` es un modelo de sintesis de voz (text-to-speech) en frances de Francia basado en la arquitectura VITS. No lo entrena Phoohnx desde cero: es un reempaquetado del modelo original de Rhasspy publicado en `rhasspy/piper-voices/fr/fr_FR/siwis/medium`, ahora distribuido en formato ONNX y adaptado para funcionar con la libreria `phoonnx` (y su plugin para OVOS). El autor del empaquetado es Phoohnx, mientras que el autor original del modelo es Rhasspy.

El modelo resuelve la conversion de texto a audio en frances con una voz concreta ("siwis", de tipo medio). Su relevancia actual es practica: permite integrar TTS offline en asistentes de voz y aplicaciones locales sin depender de servicios en la nube, gracias al formato ONNX y a la licencia MIT. Es un modelo pequeno (repositorio de 0,1 GB) y especializado en un unico idioma, lo que lo hace adecuado para despliegues ligeros en entornos con recursos limitados.

La entrada de texto no es texto plano directo: el modelo espera fonemas en alfabeto IPA generados por espeak-ng. El pipeline `phoonnx` se encarga de la normalizacion y fonemizacion mediante `scriptconv`. El contexto y el numero de parametros no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica como en LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | frances de Francia (`fr-FR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con aprendizaje adversario. Genera audio directamente a partir de fonemas, sin necesidad de un vocoder separado en el pipeline de inferencia.

El modelo original fue desarrollado por Rhasspy dentro del proyecto Piper y publicado en `rhasspy/piper-voices`. No se dispone en la informacion proporcionada de datos sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino posteriores. El empaquetado de Phoohnx se limita a exportar y organizar los pesos en ONNX para su uso con `phoonnx` y `scriptconv`, que gestionan la normalizacion de texto y la fonemizacion con espeak-ng.

## Capacidades

- Sintesis de voz (text-to-speech) en frances de Francia a partir de texto normalizado.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav`.
- Fonemizacion de entrada mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del frances de Francia.

## Casos de uso

- Asistentes de voz offline: el modelo permite generar respuestas habladas en frances sin conexion a Internet, integrado en OVOS mediante `ovos-tts-plugin-phoonnx` y configurado en `mycroft.conf`.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de escritorio o domotica que necesiten anuncios en frances con baja latencia y sin dependencias de red.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de apoyo a personas con discapacidad visual en entornos francoparlantes.
- Sistemas embebidos y edge computing: al distribuirse en ONNX y ocupar 0,1 GB, puede desplegarse en dispositivos con recursos limitados donde un modelo TTS grande no cabria.
- Generacion de audio para prototipos y pruebas: su licencia MIT y su tamano reducido facilitan su uso en entornos de desarrollo y CI para generar audio de prueba en frances.
- Aplicaciones web con TTS en el navegador: mediante `phoonnx.js` se puede sintetizar voz en el cliente sin enviar texto a un servidor, lo que ayuda con la privacidad.
- Integracion en pipelines de normalizacion de texto: combinado con `scriptconv`, sirve como componente de un sistema mayor de procesamiento de lenguaje que requiera salida de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) es previsible que quepa en GPUs de gama baja y en CPU, aunque no se confirma con datos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; el formato ONNX y el tamano reducido sugieren viabilidad en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-fr_fr-siwis-medium` | VITS | fr-FR | MIT | ONNX | 0,1 GB | Reempaquetado de Piper para phoonnx |
| `rhasspy/piper-voices/fr/fr_FR/siwis/medium` | VITS | fr-FR | MIT | Piper (ONNX) | no disponible | Modelo original upstream |
| Otros modelos VITS de la coleccion Phoohnx | VITS | varios | MIT (segun upstream) | ONNX | variable | Misma libreria, distintos idiomas/voces |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-idioma: solo sintetiza frances de Francia (`fr-FR`); no admite otros idiomas.
- Dependencia de espeak-ng: sin espeak-ng instalado, la fonemizacion puede fallar o producir errores. El port espyak incluido en `phoonnx[espeak]` puede diferir de espeak-ng y provocar pronunciaciones incorrectas en algunas palabras.
- Calidad de voz limitada por el modelo original "medium" de Piper; no es un modelo de alta fidelidad.
- Riesgo de alucinacion en el sentido de pronunciacion incorrecta o entonacion atipica en textos fuera de dominio, aunque no aplica el concepto de alucinacion de LLM.
- No hay informacion sobre sesgos acusticos o demograficos del dataset de entrenamiento original.
- Licencia MIT declarada por el upstream; conviene verificar los terminos exactos en la model card de `rhasspy/piper-voices` antes de uso comercial.
- El modelo esta pensado para frases en frances; textos con abreviaturas, numeros o simbolos dependen de la normalizacion de `scriptconv`.
- No se han publicado datos de latencia ni de calidad subjetiva (MOS) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-siwis-medium
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/siwis/medium
- Coleccion VITS de Phoohnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
