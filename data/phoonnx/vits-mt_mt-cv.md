# Phoonnx/vits-mt_mt-cv

## Resumen

vits-mt_mt-cv es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo esta entrenado especificamente para el idioma maltes (mt-MT) y toma como entrada caracteres del texto, convirtiendolos en audio mediante un fonemizador de grafemas. Su origen es el modelo `tts_models--mt--cv--vits` distribuido en la version 0.8.0 de Coqui TTS, entrenado presumiblemente con el corpus Common Voice en maltes.

El modelo resuelve la necesidad de sintesis de voz en maltes, un idioma con escasa representacion en el ecosistema TTS. Al estar empaquetado en ONNX, permite inferencia sin depender del framework original de Coqui, lo que facilita su integracion en entornos de produccion ligeros y en asistentes de voz como OVOS. Su licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

Con un tamano de repositorio de 0.1 GB, se trata de un modelo compacto orientado a sintesis de voz de un unico hablante o voces limitadas, no a generacion de texto ni a tareas de razonamiento. Su relevancia actual radica en cubrir un idioma de bajos recursos dentro de un ecosistema (phoonnx/OVOS) que busca alternativas abiertas y desplegables localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0.1 GB) |
| Idiomas soportados | maltes (mt-MT) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas GAN y de reconstruccion. VITS produce audio de forma directa a partir del texto sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

El entrenamiento original proviene de Coqui TTS (version 0.8.0) y el modelo esta asociado al corpus Common Voice en maltes, segun la tabla de licencias de Coqui. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente a TTS). La innovacion principal del empaquetado es la conversion a ONNX y la integracion con el front-end de texto de scriptconv, que normaliza el texto y lo convierte en grafemas mediante `GraphemePhonemizer`.

## Capacidades

- Sintesis de voz (text-to-speech) en maltes (mt-MT) a partir de texto en caracteres.
- Generacion de audio WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Normalizacion y conversion de texto de entrada mediante scriptconv.
- Inferencia en formato ONNX, sin dependencia del framework original de Coqui.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al maltes.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra mediante el plugin `ovos-tts-plugin-phoonnx` y permite dotar de voz en maltes a asistentes domesticos que funcionan sin conexion, gracias a su formato ONNX y su tamano reducido.
- Lectura de contenido en maltes: conversion de articulos, noticias o documentos a audio para aplicaciones de accesibilidad o consumo pasivo, usando la API `synthesize_wav` sobre frases individuales.
- Sistemas de navegacion o avisos por voz: generacion de mensajes hablados en maltes para aplicaciones de transporte o industria, donde se requiere una voz sintetica ligera y desplegable en dispositivos de bajos recursos.
- Prototipado de interfaces conversacionales en maltes: desarrolladores que necesitan una voz de referencia rapida para validar flujos de dialogo sin depender de servicios en la nube.
- Investigacion en TTS de bajos recursos: el modelo sirve como linea base para comparar tecnicas de sintesis en maltes y para estudiar el rendimiento de VITS en idiomas con pocos datos.
- Integracion en pipelines de audio por lotes: generacion masiva de locuciones en maltes para audiolibros, podcasts o material educativo, ejecutando el modelo ONNX en servidores sin GPU dedicada.
- Traduccion y doblaje asistido: combinado con un sistema de traduccion automatica, el modelo puede producir pistas de voz en maltes para contenido originalmente en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0.1 GB, por lo que el modelo es muy ligero y probablemente cabe en CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs consumer actuales e incluso en CPU, dado el tamano del repositorio.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| vits-mt_mt-cv (este) | VITS | Maltes (mt-MT) | no aplica | BSD-3-Clause | ONNX |
| Coqui TTS VITS multilingue | VITS | Multiples | no aplica | varía segun modelo | PyTorch / ONNX |
| Piper TTS | VITS (variantes) | Multiples | no aplica | MIT (mayoria) | ONNX |
| MMS-TTS (Meta) | VITS | Multiples (incluye maltes) | no aplica | CC-BY-NC | PyTorch |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a arquitectura, idioma, licencia y formato de pesos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en maltes (mt-MT); no admite otros idiomas.
- Al ser un modelo TTS, no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinacion acustica: puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario de entrenamiento.
- Sesgos potenciales derivados del corpus Common Voice (posible desequilibrio de genero, acento o edad de los hablantes originales).
- No se documentan limitaciones de longitud de entrada; se recomienda sintetizar por frases.
- La licencia BSD-3-Clause permite uso comercial, pero la procedencia de los datos de Common Voice puede conllevar obligaciones adicionales de atribucion.
- No hay informacion sobre el numero de hablantes ni sobre soporte multi-hablante.
- El ecosistema phoonnx y scriptconv es joven; la estabilidad de la API puede variar.
- No se han publicado benchmarks objetivos (MOS, WER) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-mt_mt-cv
- Modelo original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--mt--cv--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
