# Phoonnx/vits-ee-openbible

## Resumen

vits-ee-openbible es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir del corpus OpenBible para el idioma ewé (codigo ISO `ee`). Phoonnx lo redistribuye empaquetado en formato ONNX para su libreria de inferencia TTS homonima, lo que permite ejecutar la sintesis sin depender del framework original de Coqui. El modelo resuelve la generacion de audio inteligible en ewé, una lengua kwa hablada principalmente en Ghana y Togo que cuenta con pocos recursos en el ecosistema TTS.

El modelo es de tipo end-to-end: recibe texto en caracteres y produce forma de onda directamente, sin un modulo separado de duracion o vocoder externo, gracias al diseno de VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech). El front-end de texto utiliza un fonemizador basado en grafemas (`GraphemePhonemizer` de scriptconv), lo que simplifica el pipeline al no requerir un lexico fonetico especifico del idioma.

Por su tamano reducido (repo de 0,1 GB), su licencia CC-BY-SA 4.0 y su empaquetado ONNX, es una opcion practica para integrar sintesis en ewé en asistentes de voz locales (OVOS), aplicaciones de lectura accesible o sistemas embebidos con recursos limitados. No obstante, su adopcion es muy baja (25 descargas, 0 likes) y no se han publicado evaluaciones formales de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end, generativa adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por frase en caracteres) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ewé (`ee`) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | caracteres (fonemizador de grafemas) |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS combina un encoder de texto, un prior variacional condicionado por alineamiento monotono, un decoder generativo y un discriminador adversarial entrenado con perdidas GAN, junto con una perdida de reconstruccion espectral. Este diseno permite sintesis end-to-end sin vocoder separado y produce audio con prosodia aprendida de forma implicita. El modelo original fue entrenado por Coqui sobre el corpus OpenBible para ewé, un conjunto de grabaciones de lectura biblica alineadas con texto, distribuido en el release v0.6.2 de Coqui TTS.

No se dispone de informacion sobre el numero de horas de audio, el numero de pasos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de refinamiento como RLHF o DPO (no aplicables habitualmente en TTS clasico). El empaquetado de Phoonnx convierte los pesos a ONNX y delega la normalizacion y conversion de texto a la libreria scriptconv, que aplica un `GraphemePhonemizer` sobre los caracteres de entrada.

## Capacidades

- Sintesis de voz a partir de texto en ewé, con salida en formato WAV mediante `synthesize_wav`.
- Front-end basado en grafemas: no requiere diccionario fonetico ni G2P especifico del idioma.
- Inferencia via ONNX, ejecutable en CPU sin dependencias de GPU.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Gestion de voces mediante `TTSModelManager`, con carga y fusion de voces por defecto.
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento: es un modelo exclusivamente TTS.
- Capacidad multilingue limitada al unico idioma declarado (`ee`).

## Casos de uso

- Asistentes de voz locales en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `coqui/ewe-openbible-vits` en `mycroft.conf` para respuestas habladas en ewé sin conexion a servicios en la nube.
- Lectura accesible de textos en ewé: conversion de articulos, documentacion o material educativo a audio WAV mediante la API de Python, util para personas con discapacidad visual o para alfabetizacion.
- Sistemas embebidos y dispositivos de bajo consumo: al ejecutarse en ONNX sobre CPU y ocupar 0,1 GB, cabe en Raspberry Pi y dispositivos similares para anuncios o interfaces habladas.
- Traduccion con salida de voz: combinado con un modelo de traduccion texto-a-texto, se puede construir un pipeline que traduzca al ewé y sintetice la respuesta, por ejemplo en atencion al ciudadano en Ghana o Togo.
- Preservacion linguistica: generacion de audiolibros o corpus de audio sintetico en ewé para documentacion y ensenanza del idioma, dado el escaso material TTS disponible.
- Pruebas de integracion en pipelines de CI: al ser un modelo pequeno y determinista en formato ONNX, sirve para validar extremo a extremo sistemas de TTS en pruebas automatizadas sin coste de GPU.
- Prototipado de interfaces conversacionales multilingues: uso como voz secundaria en un sistema que ya soporta otros idiomas via phoonnx, aprovechando el mismo `TTSModelManager`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser ONNX y un repo de 0,1 GB, la inferencia en CPU es viable y no requiere GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100) podria acelerar la inferencia, pero no hay datos de rendimiento publicados.
- Cabe en GPU consumer: si, aunque el caso natural es CPU por el tamano reducido del modelo.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ee-openbible (este) | ewé (`ee`) | VITS | ONNX | CC-BY-SA 4.0 | texto por caracteres | Hugging Face (Phoonnx) |
| Coqui TTS ewe-openbible-vits (upstream) | ewé (`ee`) | VITS | checkpoint Coqui | CC-BY-SA 4.0 | texto por caracteres | GitHub Coqui TTS v0.6.2 |
| Otros modelos VITS de la coleccion Phoonnx | varios | VITS | ONNX | segun modelo | texto por caracteres | Hugging Face (coleccion Phoonnx VITS) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-idioma: solo soporta ewé (`ee`); cualquier texto en otro idioma producira una sintesis incorrecta o ininteligible.
- Calidad no evaluada: no hay benchmarks ni evaluaciones MOS publicadas; la fidelidad y naturalidad son desconocidas.
- Dominio restringido: entrenado sobre OpenBible, por lo que el vocabulario y el estilo prosodico pueden estar sesgados hacia el registro biblico y fallar en terminologia tecnica o coloquial.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir artefactos, pronunciaciones erroneas o audio ininteligible ante entradas fuera de distribucion.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar la compatibilidad con productos propietarios.
- Adopcion muy baja (25 descargas, 0 likes) y sin mantenimiento aparente mas alla de la actualizacion de noviembre de 2026; no hay garantias de soporte.
- Dependencia de phoonnx y scriptconv: la API de uso esta ligada a estas librerias, lo que limita la portabilidad fuera de su ecosistema.
- Sin soporte de control de prosodia, emocion ni velocidad mas alla de lo que exponga la API de phoonnx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ee-openbible
- Pesos originales de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--ewe--openbible--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
