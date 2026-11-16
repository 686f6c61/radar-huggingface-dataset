# Phoonnx/vits-en_us-sam-medium-espeak

## Resumen

vits-en_us-sam-medium-espeak es un modelo de sintesis de voz (text-to-speech) de la familia VITS, empaquetado por Phoonnx a partir del checkpoint original de Rhasspy Piper (`rhasspy/piper-voices/en/en_US/sam/medium`). No se trata de un modelo entrenado desde cero por Phoonnx, sino de una redistribucion en formato ONNX preparada para su uso con la libreria phoonnx, una implementacion en Python de inferencia TTS orientada al ecosistema OVOS (Open Voice OS).

El modelo resuelve el problema de convertir texto en ingles estadounidense a audio inteligible en entornos de asistente por voz, domotica y aplicaciones embebidas, con un peso de repositorio de aproximadamente 0,1 GB y licencia MIT. Su relevancia actual radica en que permite sintesis local sin dependencia de servicios en la nube, con una huella de recursos reducida y una integracion directa mediante el plugin `ovos-tts-plugin-phoonnx`.

La arquitectura es VITS (Variational Inference for Text-to-Speech), un modelo generativo condicional de extremo a extremo, en su variante "medium" de Piper. La entrada de texto no es texto plano, sino fonemas en alfabeto IPA generados por espeak-ng, lo que condiciona tanto el pipeline de despliegue como la calidad de pronunciacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (texto a voz de extremo a extremo, generativa condicional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa secuencias de contexto linguistico) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el autor no detalla variantes cuantizadas) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional condicionado por alineamiento monotono y un decoder generativo basado en flujos normalizadores y un vocoder neuronal integrado. Esta variante corresponde al checkpoint "medium" de la voz `sam` de Piper, distribuida originalmente por Rhasspy en el repositorio `piper-voices`.

La informacion disponible no incluye detalles sobre el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de VITS. El empaquetado de Phoonnx anade una capa de integracion: el texto se normaliza mediante la libreria `scriptconv` y se fonemiza con `EspeakPhonemizer` (extra `scriptconv[espeak]`), de modo que el modelo recibe fonemas IPA y no caracteres.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (`en-US`).
- Generacion de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Entrada basada en fonemas IPA generados por espeak-ng, con normalizacion de texto previa mediante `scriptconv`.
- Integracion como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable via `mycroft.conf`.
- Ejecucion en navegador mediante el proyecto relacionado phoonnx.js, con demo publica.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo exclusivamente de sintesis de voz.
- No soporta vision, audio de entrada ni modo de razonamiento (thinking mode).

## Casos de uso

- Asistente por voz local en OVOS: el modelo se selecciona como modulo TTS en `mycroft.conf` y sintetiza las respuestas del asistente sin salir del dispositivo, lo que es adecuado por su tamano reducido (0,1 GB) y su licencia MIT.
- Domotica y dispositivos embebidos: la inferencia ONNX con phoonnx permite generar avisos hablados en Raspberry Pi u otros equipos de bajos recursos, evitando llamadas a APIs externas.
- Lectura de notificaciones y alertas: integrado en un pipeline que normalice el texto con `scriptconv` y lo fonemice con espeak-ng, el modelo convierte mensajes cortos en audio WAV para su reproduccion inmediata.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual o dificultades de lectura, en aplicaciones de escritorio o web mediante phoonnx.js.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en ingles estadounidense durante el desarrollo sin coste de API ni latencia de red.
- Generacion de audio para pruebas automatizadas: al ser un modelo ONNX deterministico y ligero, resulta util para producir ficheros WAV de referencia en tests de pipelines de audio.
- Síntesis en el navegador: mediante phoonnx.js con entrada espeak o unicode, se puede ofrecer lectura de contenido web en ingles sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa aproximadamente 0,1 GB, por lo que la huella en memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeno, la inferencia en CPU es viable y no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU de consumo moderna, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-en_us-sam-medium-espeak (este) | VITS | en-US | MIT | ONNX (phoonnx) | Empaquetado de Rhasspy Piper, entrada por fonemas espeak |
| Otras voces de rhasspy/piper-voices | VITS | multiples | MIT (segun model card upstream) | ONNX | Mismo origen; este modelo es una de ellas |
| Otras voces de la coleccion VITS de Phoonnx | VITS | segun voz | MIT (segun upstream) | ONNX | Mismo empaquetado y libreria de inferencia |
| Alternativas TTS comerciales o de mayor tamano | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (`en-US`); no es multilingue.
- La entrada debe ser fonemas IPA generados por espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- Requiere instalar espeak-ng en el sistema o el extra `phoonnx[espeak]`; sin esta dependencia el pipeline de fonemizacion no funciona.
- Riesgo de alucinacion acustica: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en textos fuera de dominio.
- No se documentan sesgos especificos, pero al derivar de un corpus de entrenamiento no descrito, pueden existir sesgos de acento y prosodia no medidos.
- Licencia MIT declarada por el upstream; conviene verificar la model card original de `rhasspy/piper-voices` antes de un uso comercial a gran escala.
- Sin datos publicados de benchmarks, latencia ni calidad subjetiva (MOS); la evaluacion en produccion debe hacerse mediante pruebas propias.
- El modelo no realiza razonamiento, tool calling ni procesamiento de contexto largo; no debe emplearse fuera de tareas de sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-sam-medium-espeak
- Upstream (Rhasspy Piper, voz en_US/sam/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/sam/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
