# Phoonnx/glowtts-tr_tr-common-graphemes

## Resumen

glowtts-tr_tr-common-graphemes es un modelo de sintesis de voz (text-to-speech) en turco, derivado del modelo Glow-TTS de Coqui entrenado sobre el corpus Common Voice. El modelo original fue publicado por Coqui en su repositorio TTS v0.6.1 y ha sido reempaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx, una implementacion de inferencia TTS en Python y para el ecosistema OVOS (OpenVoiceOS).

El modelo resuelve la conversion de texto a espectrograma mel, que posteriormente se transforma en audio mediante el vocoder HiFi-GAN `hifigan-tr_tr-common`, descargado automaticamente por phoonnx. Es relevante para desarrolladores que necesitan un TTS local, ligero (repo de 0,1 GB) y con licencia MIT para aplicaciones en turco, especialmente en asistentes de voz embebidos y sistemas OVOS.

La arquitectura es Glow-TTS, un modelo de sintesis no autorregresivo basado en normalizing flows que genera espectrogramas de forma paralela, con un front-end basado en grafemas (GraphemePhonemizer de scriptconv) en lugar de fonemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por caracteres, sin ventana definida) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | turco (tr-TR) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz no autorregresivo que combina un encoder transformer con un decoder basado en normalizing flows (Glow). A diferencia de los modelos autorregresivos como Tacotron 2, genera el espectrograma mel completo de forma paralela, lo que reduce la latencia de inferencia. El modelo aprende una alineacion monotona entre texto y frames de audio mediante el mecanismo de alineacion por busqueda (monotonic alignment search) sin necesidad de atencion autorregresiva.

El modelo original fue entrenado por Coqui sobre el corpus Common Voice en turco. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a TTS). El front-end utiliza grafemas directamente (GraphemePhonemizer), lo que simplifica el pipeline al evitar la conversion a fonemas. La innovacion principal del empaquetado es la exportacion a ONNX y la integracion con phoonnx y OVOS.

## Capacidades

- Sintesis de voz en turco (tr-TR) a partir de texto plano.
- Generacion de espectrograma mel que se convierte en audio mediante el vocoder HiFi-GAN.
- Front-end basado en grafemas con normalizacion de texto mediante scriptconv.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia local sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al turco.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra directamente mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo sintesis local en turco sin conexion a internet, adecuado para dispositivos con recursos limitados.
- Lectura de notificaciones y alertas en turco: un sistema puede sintetizar mensajes dinamicos (correos, recordatorios, alertas) en tiempo de ejecucion con baja latencia gracias a la generacion paralela de Glow-TTS.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a voz en turco para lectores de pantalla, con un modelo ligero que cabe en dispositivos de gama baja.
- Interfaces de voz para aplicaciones de escritorio o moviles: sintesis de respuestas de un chatbot o asistente en turco, integrada en pipelines Python mediante la API de phoonnx.
- Generacion de audiolibros o contenido narrado en turco: sintesis por lotes de textos largos divididos en frases, usando el modelo como motor TTS local sin coste por caracter.
- Prototipado rapido de productos de voz en turco: gracias a la licencia MIT y al formato ONNX, se puede desplegar en entornos de desarrollo y produccion sin restricciones comerciales.
- Pruebas de integracion en sistemas de telefonia o IVR: sintesis de mensajes pregrabados dinamicos en turco para centralitas y sistemas de respuesta interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que el modelo es muy ligero y cabe en CPU y GPU de gama baja.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (GTX 1050, RTX 2060, RTX 4090, A100, H100); el modelo no requiere GPU de alta gama.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: phoonnx (Python y OVOS), ONNX Runtime; no se mencionan vLLM, llama.cpp ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| glowtts-tr_tr-common-graphemes | Glow-TTS | tr-TR | MIT | ONNX | no disponible |
| Tacotron 2 (Coqui) | Autorregresivo | multilingue | MIT/MPL | PyTorch | no disponible |
| VITS (Coqui) | VAE + flow + GAN | multilingue | MIT | PyTorch/ONNX | no disponible |
| FastSpeech 2 | Transformer no autorregresivo | multilingue | MIT | PyTorch | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales conocidas de las arquitecturas TTS de Coqui.

## Limitaciones y advertencias

- El modelo solo soporta turco (tr-TR); no es multilingue.
- Al ser un modelo TTS, puede presentar artefactos de pronunciacion en palabras extranjeras, siglas o numeros no normalizados correctamente por el front-end de grafemas.
- Riesgo de alucinacion acustica: puede generar audio ininteligible o ruido en entradas muy largas o mal formadas; se recomienda dividir el texto en frases.
- No se dispone de informacion sobre sesgos de genero, acento o dialecto en el corpus Common Voice subyacente.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del corpus Common Voice y del vocoder HiFi-GAN asociado.
- El modelo depende de phoonnx y scriptconv para el preprocesado; cambios en estas librerias pueden afectar la calidad de sintesis.
- No adecuado para tareas de razonamiento, codigo, vision ni agentes; es exclusivamente un motor TTS.
- El repo tiene muy pocas descargas (21) y cero likes, lo que sugiere poca validacion comunitaria; conviene probar exhaustivamente antes de produccion.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-tr_tr-common-graphemes](https://huggingface.co/Phoonnx/glowtts-tr_tr-common-graphemes)
- [Modelo original Coqui TTS v0.6.1](https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--tr--common-voice--glow-tts.zip)
- [Vocoder HiFi-GAN tr_tr-common](https://huggingface.co/Phoonnx/hifigan-tr_tr-common)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
- [Coleccion Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Paper Glow-TTS](https://arxiv.org/abs/2005.11129)
