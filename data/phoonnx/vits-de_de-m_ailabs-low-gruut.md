# Phoonnx/vits-de_de-m_ailabs-low-gruut

## Resumen

El modelo `vits-de_de-m_ailabs-low-gruut` es un sistema de síntesis de voz (text-to-speech) en alemán, empaquetado por Phoonnx a partir de un modelo VITS original de Mycroft AI, concretamente de la variante `de_DE/m-ailabs_low` del repositorio `mimic3-voices`. El modelo se distribuye en formato ONNX para su uso con la librería `phoonnx`, una biblioteca de TTS basada en ONNX mantenida por el proyecto TigreGotico, y se integra en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

La relevancia de este modelo reside en su carácter práctico: es un modelo ligero (el repositorio ocupa aproximadamente 0,1 GB), con licencia CC-BY-SA-4.0, pensado para síntesis de voz local en alemán estándar (de-DE) dentro de asistentes y pipelines de voz. No se trata de un modelo de propósito general ni de un LLM, sino de un componente especializado de conversión texto-a-voz que consume fonemas IPA generados por el fonemizador gruut.

El modelo no publica datos sobre parámetros totales, longitud de contexto ni benchmarks de calidad de síntesis en la información disponible. Su valor está en la disponibilidad operativa: pesos ONNX listos para inferencia, integración documentada con phoonnx y scriptconv, y una licencia que permite uso comercial con atribución y compartir-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (modelo de sintesis de voz end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de LLM; entrada de texto por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes de cuantizacion) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | Mycroft AI |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador acústico y un vocoder integrado, entrenado con aprendizaje adversarial y objetivos de reconstruccion. El modelo procede de la variante `de_DE/m-ailabs_low` del repositorio `mimic3-voices` de Mycroft AI, que a su vez se basa en el corpus M-AILABS para alemán. Phoonnx no ha reentrenado el modelo: lo ha empaquetado en ONNX y lo ha adaptado al front-end de texto de su libreria.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). El front-end de texto lo aporta `scriptconv`: el texto se normaliza y se convierte a fonemas IPA mediante `GruutPhonemizer` del modulo `scriptconv.phonemizers.mul`, instalado con el extra `scriptconv[gruut]`. La innovacion destacable es el empaquetado ONNX para inferencia local ligera y la integracion con el ecosistema OVOS.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman estandar de Alemania (de-DE).
- Conversion de texto a audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Front-end de texto con normalizacion y fonemizacion a IPA mediante gruut.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable via `mycroft.conf`.
- Inferencia local en formato ONNX, sin dependencia de servicios en la nube.
- Modelo ligero (repo de 0,1 GB), adecuado para despliegues con recursos limitados.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en aleman: el modelo se integra en OVOS como modulo TTS y permite que un asistente domestico responda en de-DE sin enviar texto a servicios externos, gracias a la inferencia ONNX local.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: se puede invocar `synthesize_wav` sobre cadenas cortas para generar avisos de voz en aleman con baja latencia y sin conexion.
- Accesibilidad para personas con discapacidad visual: conversion de texto de pantalla o documentos a audio en aleman, aprovechando que el modelo es ligero y puede ejecutarse en el mismo equipo del usuario.
- Sistemas de megafonia o anuncios automatizados en entornos controlados: generacion previa de ficheros WAV con frases fijas o plantillas en aleman para su reproduccion programada.
- Prototipado de interfaces conversacionales en investigacion: uso del modelo como baseline TTS en aleman dentro de pipelines de dialogo, con la ventaja de una licencia CC-BY-SA-4.0 y pesos ONNX faciles de desplegar.
- Educacion y aprendizaje de idiomas: generacion de audio de pronunciacion para frases en aleman a partir de texto, integrable en aplicaciones de practica de vocabulario o lectura.
- Pruebas de regresion en pipelines de TTS: al ser un modelo pequeno y determinista en su interfaz, sirve como componente de referencia para validar el front-end de fonemizacion gruut y la integracion con phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que la huella de memoria es muy reducida y cabe en GPU consumer de gama baja y en CPU.
- GPU recomendadas: no se documentan; por tamano del artefacto, cualquier GPU con unos pocos GB de VRAM es suficiente, e incluso la inferencia en CPU es viable.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna, dado el tamano del modelo.
- Opciones de despliegue: `phoonnx` (Python) con el extra `scriptconv[gruut]`; plugin `ovos-tts-plugin-phoonnx` en OVOS. No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) porque no aplican a un modelo TTS VITS.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-de_de-m_ailabs-low-gruut (este modelo) | VITS | de-DE | ONNX | CC-BY-SA-4.0 | fonemas gruut (IPA) | Hugging Face, via phoonnx |
| Otras variantes de mimic3-voices de_DE | VITS | de-DE | varios (segun empaquetado) | segun variante (mayoritariamente CC-BY-SA-4.0) | fonemas | GitHub MycroftAI/mimic3-voices |
| Modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | segun modelo | fonemas | Hugging Face (coleccion VITS de Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS: no genera texto, no razona, no soporta tool calling ni agentes.
- Solo soporta aleman (de-DE); no es multilingue.
- La entrada debe pasar por el front-end de fonemizacion gruut; un uso incorrecto del texto (sin normalizacion) puede degradar la calidad de sintesis.
- No se documentan sesgos especificos, pero al derivar del corpus M-AILABS puede reflejar las caracteristicas de locutores y dominio de dicho corpus.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si puede producir pronunciaciones incorrectas ante texto fuera de dominio, siglas o neologismos no cubiertos por el fonemizador.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y obliga a compartir bajo la misma licencia las obras derivadas; es necesario revisar las obligaciones de compartir-igual antes de integrarlo en productos propietarios.
- El modelo se distribuye como empaquetado de terceros (Phoonnx) sobre un modelo original de Mycroft AI; la trazabilidad de la licencia depende del repositorio upstream.
- No se documentan garantias de calidad, latencia ni soporte; el numero de descargas (16) y likes (0) indica una adopcion muy baja.
- El repositorio es pequeno (0,1 GB) pero no se detalla la version concreta de ONNX ni los requisitos de runtime mas alla de `phoonnx` y `scriptconv[gruut]`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-m_ailabs-low-gruut
- Repositorio upstream (MycroftAI/mimic3-voices, voz de_DE/m-ailabs_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/de_DE/m-ailabs_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx en Hugging Face: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
