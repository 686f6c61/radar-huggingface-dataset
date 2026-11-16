# Phoonnx/vits-en_us-elise-espeak

## Resumen

vits-en_us-elise-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de redromnon/piper-tts-elise, una voz del ecosistema Piper, y aqui se redistribuye en formato ONNX para su uso con la libreria phoonnx, que lo integra tanto en Python como en el asistente OVOS.

El modelo genera audio a partir de texto en ingles estadounidense (en-US). La entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados por espeak-ng, lo que implica una etapa de fonemizacion previa gestionada por la libreria scriptconv. El repositorio es pequeno (0,1 GB), coherente con un modelo VITS de sintesis de voz de una sola hablante.

Su relevancia es practica: proporciona una voz TTS ligera, con licencia MIT y ejecutable en ONNX, adecuada para despliegues locales y embebidos dentro del ecosistema OVOS/Phoonnx. No es un modelo de proposito general ni un LLM, sino un componente especializado de sintesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Tamano del repositorio | 0,1 GB |
| Autor original | redromnon |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz neuronal de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo para producir formas de onda directamente. VITS es conocida por generar audio de forma condicional a fonemas y por su capacidad de sintesis rapida en inferencia, lo que la hace adecuada para despliegues en tiempo real o casi real.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables de forma habitual en TTS). El modelo original es una voz Piper de redromnon; Phoonnx se limita a empaquetarla en ONNX y a integrarla con su front-end de texto basado en espeak-ng y scriptconv. La entrada se procesa mediante `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que normaliza el texto y lo convierte a fonemas IPA antes de la sintesis.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalizacion de texto previa mediante scriptconv.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (voces VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No dispone de modo thinking, vision ni audio de entrada; es exclusivamente TTS.
- Capacidad multilingue limitada a en-US.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS como motor TTS seleccionando la voz en `mycroft.conf`, ofreciendo sintesis en ingles sin dependencia de servicios en la nube.
- Lectura de notificaciones y alertas: al ser un modelo ligero (0,1 GB) y ONNX, puede generar avisos hablados en sistemas embebidos o de bajo consumo.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en ingles estadounidense, con licencia MIT que facilita su redistribucion.
- Interfaces conversacionales en aplicaciones de escritorio: sintesis de respuestas de un chatbot o asistente en Python usando la API de phoonnx.
- Demos y prototipos web: mediante phoonnx.js, se puede sintetizar voz directamente en el navegador con la demo de TigreGotico.
- Pruebas de integracion TTS en pipelines de CI: al ser un artefacto ONNX pequeno y con licencia permisiva, resulta sencillo de incluir en tests automatizados de audio.
- Sistemas de anuncios automaticos: generacion de locuciones pregrabadas para aplicaciones de transporte, comercio o domotica en entornos de habla inglesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se trata de un modelo muy ligero, apto para CPU.
- GPU recomendadas: no disponible; el modelo esta pensado para inferencia en ONNX, habitualmente en CPU.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vits-en_us-elise-espeak | VITS | en-US | ONNX | MIT | Empaquetado para phoonnx; entrada por fonemas espeak-ng |
| redromnon/piper-tts-elise | VITS (Piper) | en-US | no disponible | no disponible | Modelo upstream del que deriva esta version |
| Otras voces VITS de la coleccion Phoonnx | VITS | variable | ONNX | variable | Mismo empaquetado y libreria; idiomas y licencias segun cada voz |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Requiere espeak-ng instalado para la fonemizacion; sin el, puede usarse el port espyak mediante el extra `phoonnx[espeak]`, pero algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- El texto de entrada debe pasar por normalizacion y fonemizacion (scriptconv); no se acepta texto plano sin ese front-end.
- Riesgo de errores de pronunciacion en palabras fuera de dominio o con grafias ambiguas.
- No se dispone de informacion sobre sesgos de la voz ni sobre la diversidad de hablantes del dataset original.
- Licencia MIT: permite uso comercial y redistribucion, pero el autor indica que el release upstream establece sus propios terminos, por lo que conviene revisar la licencia del modelo original.
- Al ser un modelo TTS, no debe evaluarse con criterios de LLM (razonamiento, contexto, alucinacion textual); su calidad se mide en naturalidad y inteligibilidad del audio, dato no disponible.
- El numero de descargas (25) y likes (0) es bajo, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-elise-espeak
- Modelo upstream: https://huggingface.co/redromnon/piper-tts-elise
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
