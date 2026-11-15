# Phoonnx/glowtts-fr_fr-gilles_le_blanc

## Resumen

glowtts-fr_fr-gilles_le_blanc es un modelo de sintesis de voz (text-to-speech) en frances de Francia, empaquetado en formato ONNX por Phoonnx a partir del modelo original publicado por Rhasspy dentro del proyecto Larynx v1.0. El modelo sigue la arquitectura Glow-TTS, un sistema de sintesis neuronal no autorregresivo que genera espectrogramas de mel a partir de fonemas, y se complementa con un vocoder HiFi-GAN (hifigan-multi-vctk-small) que convierte esos espectrogramas en audio.

Su relevancia practica es acotada pero clara: se trata de una voz concreta (gilles_le_blanc) para frances, distribuida como artefacto ONNX ligero (0,1 GB en el repositorio) y pensada para ejecutarse en entornos de asistente de voz como OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx. No es un modelo de proposito general ni compite con los grandes sistemas TTS neuronales actuales; es una pieza de infraestructura para sintesis local y de baja latencia.

La informacion disponible no incluye numero de parametros, tamano de contexto ni datos de entrenamiento detallados. La model card se limita a describir la procedencia, el pipeline de inferencia (fonemas gruut en alfabeto IPA, espectrograma, vocoder) y las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (sintesis TTS no autorregresiva basada en flujo) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repositorio ocupa 0,1 GB) |
| Idiomas soportados | frances de Francia (fr-FR) |
| Licencia | other (no se registra licencia concreta; el autor recomienda consultar la release upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small (Phoonnx/hifigan-multi-vctk-small) |
| Libreria | phoonnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz no autorregresivo que emplea normalizing flows para modelar la alineacion entre fonemas y frames de espectrograma, evitando el uso de un aligner externo y permitiendo sintesis paralela. El modelo genera un espectrograma de mel que posteriormente es convertido a forma de onda por el vocoder HiFi-GAN (variante multi-VCTK small). La entrada no es texto crudo sino fonemas en alfabeto IPA generados por el fonemizador gruut a traves de la libreria scriptconv.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de origen ni si se aplicaron tecnicas de RLHF o ajuste fino. La model card indica unicamente que el modelo procede de la release v1.0 de Rhasspy Larynx y que ha sido reempaquetado para la libreria phoonnx; no se documentan innovaciones adicionales mas alla de las propias de Glow-TTS.

## Capacidades

- Sintesis de voz a partir de texto en frances de Francia (fr-FR), con conversion previa de texto a fonemas IPA mediante gruut.
- Generacion de espectrogramas de mel y conversion a audio WAV mediante el vocoder HiFi-GAN incluido.
- Integracion con la libreria phoonnx y con el ecosistema OVOS/Mycroft a traves del plugin ovos-tts-plugin-phoonnx.
- Voz unica y concreta (gilles_le_blanc); no es un modelo multihablante ni multilingue.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo TTS.
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Asistente de voz local en OVOS/Mycroft: el modelo se selecciona en mycroft.conf mediante el plugin ovos-tts-plugin-phoonnx y proporciona respuestas habladas en frances sin depender de servicios en la nube, gracias a su formato ONNX y su tamano reducido.
- Sintesis de voz en dispositivos de borde: al ocupar 0,1 GB y ejecutarse sobre ONNX Runtime, es adecuado para Raspberry Pi u otros equipos con recursos limitados que necesiten TTS en frances.
- Lectura de notificaciones y alertas en frances: integracion en sistemas de domotica o monitoreo que requieran anuncios hablados en fr-FR con baja latencia.
- Generacion de audiolibros o contenido pregrabado en frances: sintesis por lotes de textos largos convirtiendo cada frase a fonemas gruut y generando WAV con el vocoder.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia para validar integraciones con phoonnx y scriptconv antes de desplegar otras voces de la coleccion Glow-TTS.
- Accesibilidad: conversion de texto a voz para aplicaciones dirigidas a usuarios francoparlantes con discapacidad visual, ejecutandose de forma local y sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,1 GB, por lo que el modelo y el vocoder deberian caber holgadamente en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) es mas que suficiente, y la inferencia en CPU es viable.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer actual.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx; integracion con OVOS mediante ovos-tts-plugin-phoonnx. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-fr_fr-gilles_le_blanc (este modelo) | Glow-TTS + HiFi-GAN | fr-FR | ONNX | other | Hugging Face (Phoonnx) |
| Otras voces de la coleccion Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | other | Hugging Face (coleccion Phoonnx/glow-tts) |
| Modelos Larynx originales de Rhasspy | Glow-TTS | varios | varios | segun release upstream | GitHub (rhasspy/larynx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia figura como "other" y no se registra una licencia concreta; el autor recomienda verificar la release upstream de Rhasspy Larynx antes de cualquier uso, especialmente comercial.
- Modelo de una sola voz y un solo idioma (fr-FR); no admite otros idiomas ni cambio de hablante.
- Requiere un front-end de fonemizacion (gruut mediante scriptconv) para producir la entrada correcta; un texto mal normalizado puede degradar la sintesis.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o en neologismos, propio de los sistemas TTS basados en fonemas.
- No se documentan sesgos especificos, pero al derivar de un corpus de un hablante concreto puede reflejar las caracteristicas de ese hablante y de su variedad de frances.
- No hay informacion sobre calidad objetiva (MOS) ni sobre robustez en produccion; conviene evaluar el audio generado antes de desplegarlo.
- Al ser un modelo TTS, no debe emplearse para tareas de generacion de texto, razonamiento o codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-fr_fr-gilles_le_blanc
- Vocoder: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Release upstream de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/fr-fr_gilles_le_blanc-glow_tts.tar.gz
