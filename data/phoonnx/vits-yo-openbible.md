# Phoonnx/vits-yo-openbible

## Resumen

vits-yo-openbible es un modelo de sintesis de voz (text-to-speech) en yoruba (`yo`) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo procede del catalogo de Coqui TTS (version v0.6.2) y se distribuye como un checkpoint de aproximadamente 0,1 GB dentro del repositorio de Hugging Face.

El modelo resuelve el problema de generar voz sintetica en yoruba, un idioma de bajos recursos con escasa cobertura en sistemas TTS comerciales. VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech) combina un encoder de texto, un prior normalizador de flujo, un decoder basado en HiFi-GAN y un discriminador adversarial, lo que permite sintesis end-to-end sin necesidad de alineamientos explicitos ni modelos acusticos separados.

Su relevancia actual radica en que amplia el ecosistema de voces TTS open source para idiomas africanos y se integra en el stack de asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. La entrada de texto se realiza a nivel de caracteres (graphemes) mediante el fonemizador `GraphemePhonemizer` de scriptconv, sin conversion a fonemas IPA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS v0.6.2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, sin contexto conversacional) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no detalla variantes) |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

VITS es un modelo generativo end-to-end que combina un encoder de texto condicionado por alineamiento monotono (MAS, Monotonic Alignment Search), un prior normalizador de flujo para modelar la distribucion latente y un decoder generativo adversarial inspirado en HiFi-GAN. Esta combinacion permite generar waveform directamente desde texto sin un modelo acustico intermedio ni un vocoder separado, mejorando la naturalidad y reduciendo la latencia del pipeline.

El modelo concreto se entreno sobre el corpus OpenBible en yoruba, segun indica el nombre del checkpoint original (`tts_models--yor--openbible--vits`). No se dispone de informacion detallada sobre el numero de horas de audio, composicion exacta del dataset, ni sobre el uso de RLHF/DPO (no aplicable en TTS clasico). La innovacion tecnica destacable es el empaquetado en ONNX para inferencia portable y su integracion con el front-end de texto de phoonnx/scriptconv, que trabaja a nivel de grafemas.

## Capacidades

- Sintesis de voz (text-to-speech) en yoruba a partir de texto en caracteres.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Front-end de texto basado en grafemas (`GraphemePhonemizer`), sin necesidad de diccionario fonetico IPA.
- Integracion con OVOS como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Ejecucion via ONNX Runtime, lo que permite despliegue en CPU y GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente TTS).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al yoruba.

## Casos de uso

- Asistentes de voz en yoruba: integracion como modulo TTS en OVOS mediante `mycroft.conf`, permitiendo respuestas habladas en yoruba en asistentes domesticos y dispositivos embebidos.
- Lectura de contenido en yoruba: conversion de articulos, noticias o textos religiosos (el corpus de origen es OpenBible) a audio para aplicaciones de accesibilidad.
- Localizacion de interfaces de voz: incorporacion de una voz yoruba en productos que ya usan el stack phoonnx/OVOS, sin cambiar la infraestructura.
- Audiolibros y contenido educativo: generacion de narraciones en yoruba para materiales didacticos o biblicos, dado el origen del dataset.
- Investigacion en TTS de bajos recursos: punto de partida o baseline para fine-tuning y evaluacion de modelos VITS en idiomas africanos.
- Prototipado rapido en CPU: gracias al formato ONNX y al tamano reducido (0,1 GB), es viable ejecutar inferencia en entornos sin GPU para demos y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repo (0,1 GB) la inferencia cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 3060, RTX 4090, A100, H100); no se requiere hardware de gama alta.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` en OVOS. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-yo-openbible (este) | yo | VITS / ONNX | no disponible | no aplica | CC-BY-SA-4.0 | Hugging Face (Phoonnx) |
| Coqui VITS yor-openbible (upstream) | yo | VITS (PyTorch) | no disponible | no aplica | CC-BY-SA-4.0 | GitHub Coqui TTS |
| Otras voces VITS de la coleccion Phoonnx | varios | VITS / ONNX | no disponible | no aplica | segun modelo | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-idioma: solo yoruba; no debe usarse con texto en otros idiomas.
- Entrada a nivel de grafemas: la calidad depende de la normalizacion de scriptconv; no hay fonemizacion IPA, lo que puede afectar a palabras con ortografia ambigua.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir pronunciaciones incorrectas o artefactos en textos fuera de dominio.
- Sesgos: el corpus OpenBible condiciona el estilo y vocabulario (registro religioso/formal); puede no representar bien el yoruba coloquial o dialectal.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia.
- Sin datos publicados de benchmarks, latencia ni calidad subjetiva (MOS); evaluar en produccion antes de adoptarlo.
- Repositorio con pocas descargas (27) y sin likes: ecosistema y soporte limitados.
- No apto para tareas de NLP (razonamiento, codigo, agentes); es exclusivamente un modelo TTS.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-yo-openbible
- Checkpoint upstream (Coqui TTS v0.6.2): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--yor--openbible--vits.zip
- phoonnx (libreria de inferencia): https://github.com/TigreGotico/phoonnx
- scriptconv (normalizacion y fonemizadores): https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Coqui TTS: https://github.com/coqui-ai/TTS
