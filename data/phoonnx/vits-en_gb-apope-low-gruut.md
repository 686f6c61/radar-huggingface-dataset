# Phoonnx/vits-en_gb-apope-low-gruut

## Resumen

vits-en_gb-apope-low-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI como parte del proyecto Mimic 3 y empaquetado por Phoonnx para su uso con la libreria ONNX homonima. El modelo genera audio a partir de texto en ingles britanico (en-GB) y constituye una voz concreta dentro del catalogo de voces de Mimic 3, identificada como `apope_low`.

El modelo no se distribuye como pesos PyTorch, sino como un grafo ONNX optimizado para inferencia ligera, lo que lo hace adecuado para entornos con recursos limitados, asistentes de voz embebidos y despliegues en el borde (edge computing). Su front-end de texto utiliza fonemas gruut en alfabeto IPA, lo que exige la instalacion de la dependencia `scriptconv[gruut]` para el preprocesamiento del texto.

Es relevante ahora por su integracion con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite incorporar sintesis de voz local y sin dependencia de servicios en la nube en asistentes de codigo abierto. El repositorio ocupa aproximadamente 0,1 GB y la licencia es CC-BY-SA-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con VAE + normalizing flows + decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes de cuantizacion) |
| Idiomas soportados | en (en-GB) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis neuronal end-to-end que combina un encoder de texto condicionado por alineamiento monotono, un prior variacional, normalizing flows para modelar la distribucion acustica y un decoder generativo basado en HiFi-GAN que produce la forma de onda directamente. El modelo original fue entrenado por Mycroft AI para el proyecto Mimic 3, y esta version corresponde a la voz `apope_low` del subdirectorio `en_UK`.

No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especificas. El modelo se distribuye exclusivamente como grafo ONNX, lo que implica que la inferencia se realiza mediante el runtime de ONNX y no requiere PyTorch. El front-end de texto no forma parte del grafo: la normalizacion y la conversion a fonemas IPA se delega a `scriptconv` con el fonemizador `GruutPhonemizer`.

## Capacidades

- Sintesis de voz a partir de texto en ingles britanico (en-GB).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas gruut en alfabeto IPA, lo que permite control fonetico preciso si se proporcionan fonemas directamente.
- Integracion con asistentes de voz OVOS a traves de `ovos-tts-plugin-phoonnx`.
- Inferencia ligera mediante ONNX, apta para CPU y entornos embebidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.
- No soporta vision, audio de entrada ni modos de pensamiento.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en ingles britanico sin enviar texto a servicios externos, lo que preserva la privacidad del usuario.
- Lectura de notificaciones y alertas en sistemas embebidos: al ejecutarse sobre ONNX y ocupar ~0,1 GB, puede desplegarse en dispositivos tipo Raspberry Pi para anunciar eventos del sistema o del hogar.
- Generacion de audiolibros o contenido narrado en en-GB: la API `synthesize_wav` permite volcar texto a ficheros WAV por lotes para postproduccion posterior.
- Prototipado rapido de interfaces de voz: desarrolladores que necesiten una voz britanica funcional en pocas lineas de Python pueden instalar `phoonnx` y cargar la voz `mimic3/en_UK/apope_low` sin entrenar nada.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual en aplicaciones de escritorio o web que requieran una voz en-GB local.
- Testing de pipelines de audio: al ser una voz determinista y ligera, sirve como fuente de audio sintetico para pruebas de sistemas de reconocimiento de voz o de diarizacion.
- Integracion en robots sociales o dispositivos IoT con restricciones de memoria, donde un modelo TTS en la nube no es viable por latencia o conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) y el uso de ONNX, se espera un consumo de memoria muy bajo, del orden de cientos de MB, aunque no se documenta una cifra oficial.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecutarse en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU moderna con soporte ONNX Runtime, pero no se documenta.
- Opciones de despliegue: ONNX Runtime a traves de la libreria `phoonnx`; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-en_gb-apope-low-gruut | VITS | en-GB | ONNX | CC-BY-SA-4.0 | Voz Mimic 3 empaquetada para phoonnx |
| Otras voces Mimic 3 (mismo repo upstream) | VITS | multi-idioma | ONNX / otros | CC-BY-SA-4.0 (segun upstream) | Mismo pipeline, distintas voces |
| Piper TTS | VITS | multi-idioma | ONNX | MIT (tipicamente) | Alternativa ligera para TTS local en CPU |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles britanico (en-GB); el texto en otros idiomas producira una pronunciacion incorrecta o fallos en el fonemizador.
- Requiere la dependencia `scriptconv[gruut]` para el preprocesamiento; sin ella el pipeline no funciona.
- Al ser una voz `low` de Mimic 3, la calidad acustica es inferior a la de modelos TTS neuronales de mayor tamano; no se documentan metricas MOS.
- No se documentan sesgos especificos, pero al ser una voz entrenada por Mycroft AI puede reflejar las caracteristicas del corpus original (no disponible).
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos o pronunciaciones anomalas en textos fuera de dominio.
- Licencia CC-BY-SA-4.0: permite uso comercial pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- No se documentan garantias de soporte ni mantenimiento por parte de Phoonnx; el modelo upstream pertenece a Mycroft AI.
- El identificador de fecha de creacion del repositorio (2026) no se corresponde con informacion verificable; tratar las fechas con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-apope-low-gruut
- Repositorio upstream (Mimic 3 voices, en_UK/apope_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_UK/apope_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
