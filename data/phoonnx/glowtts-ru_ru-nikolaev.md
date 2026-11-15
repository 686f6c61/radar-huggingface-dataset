# Phoonnx/glowtts-ru_ru-nikolaev

## Resumen

glowtts-ru_ru-nikolaev es un modelo de sintesis de voz (text-to-speech) en ruso empaquetado en formato ONNX por Phoonnx para su libreria de TTS `phoonnx`. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, que Phoonnx ha convertido y redistribuido junto con su vocoder asociado (hifigan-multi-vctk-small) para su uso en Python y en el asistente OVOS.

Glow-TTS es una arquitectura de sintesis neuronal que genera espectrogramas mel a partir de fonemas mediante normalizing flows y alineamiento monotono, sin necesidad de atencion autoregresiva. Esto permite una sintesis rapida y paralelizable, adecuada para entornos con recursos limitados. El modelo trabaja con fonemas del alfabeto IPA generados por el fonemizador gruut a partir de texto en ruso.

El modelo es relevante para quien necesite un TTS ligero en ruso, integrable en pipelines ONNX y en el ecosistema de asistentes de voz de codigo abierto. Su tamano reducido (repo de 0,1 GB) y su licencia no especificada exigen precaucion antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flows, no autoregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por frase/fonemas) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | other (no se registra licencia concreta; consultar el release upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Tamano del repo | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Glow-TTS, un modelo generativo basado en normalizing flows que transforma una distribucion latente en un espectrograma mel condicionado por fonemas. A diferencia de los TTS autoregresivos tipo Tacotron, Glow-TTS emplea un alineamiento monotono y un mecanismo de busqueda de alineamiento durante el entrenamiento, lo que permite sintesis paralela y tiempos de inferencia bajos. La salida es un espectrograma que posteriormente se convierte en audio mediante el vocoder HiFi-GAN (hifigan-multi-vctk-small).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan recogidos en la informacion proporcionada. El modelo original procede del release v1.0 de Larynx (Rhasspy) y ha sido convertido a ONNX y empaquetado por Phoonnx sin cambios documentados en la arquitectura. El front-end de texto utiliza la libreria `scriptconv` con el fonemizador gruut para normalizar el texto y convertirlo en fonemas IPA.

## Capacidades

- Sintesis de voz en ruso (ru-RU) a partir de texto plano.
- Generacion de espectrogramas mel y conversion a audio WAV mediante vocoder HiFi-GAN integrado.
- Fonemizacion automatica del texto de entrada mediante gruut (alfabeto IPA).
- Integracion en Python a traves de `phoonnx.model_manager.TTSModelManager`.
- Integracion en el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en formato ONNX, apta para despliegue ligero y sin dependencias de frameworks de deep learning pesados.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingue, tool calling ni agentes.

## Casos de uso

- Lectura por voz de notificaciones y alertas en ruso: el modelo sintetiza frases cortas de forma rapida en ONNX, adecuado para sistemas embebidos o domoticos que necesiten anuncios verbales.
- Asistente de voz local en OVOS: se integra mediante el plugin `ovos-tts-plugin-phoonnx` configurado en `mycroft.conf`, permitiendo respuestas habladas en ruso sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a audio en ruso con un modelo ligero que puede ejecutarse en CPU.
- Generacion de audiolibros o contenido narrado por lotes: la naturaleza no autoregresiva de Glow-TTS permite sintetizar grandes volumenes de texto con latencia baja y throughput alto.
- Prototipado de interfaces conversacionales en ruso: permite validar flujos de voz en entornos de desarrollo sin coste de API y con control total del pipeline.
- Sistemas de megafonia o anuncios automatizados en entornos fisicos (transporte, comercio): el reducido tamano del repo (0,1 GB) facilita el despliegue en dispositivos con almacenamiento limitado.
- Investigacion en TTS: sirve como referencia para comparar arquitecturas de flujo frente a modelos autoregresivos o de difusion en ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repo (0,1 GB) y la arquitectura Glow-TTS, la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) puede acelerar la inferencia, aunque no es imprescindible.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna, dado el reducido tamano del modelo; no se dispone de cifras exactas.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| glowtts-ru_ru-nikolaev | Glow-TTS + HiFi-GAN | ruso | fonemas IPA por frase | other (no registrada) | ONNX |
| Piper (rhasspy/piper) | VITS | multiples | fonemas por frase | MIT (segun proyecto) | ONNX |
| Coqui TTS (XTTS) | autoregresivo/difusion | multilingue | texto | MPL-2.0 / Coqui | PyTorch |
| Silero TTS | no disponible | ruso y otros | texto | no disponible | ONNX/PyTorch |

La comparativa se basa en conocimiento general de los proyectos; no se dispone de datos de rendimiento comparativo en la informacion proporcionada. Piper y Silero son las alternativas mas cercanas por formato ONNX y enfoque ligero, mientras que XTTS ofrece clonacion de voz y multilingue a costa de mayor tamano y requisitos.

## Limitaciones y advertencias

- Solo soporta ruso (ru-RU); no hay capacidades multilingues documentadas.
- La licencia figura como "other" y no se registra una licencia concreta; es imprescindible verificar el release upstream de Larynx antes de cualquier uso comercial.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre la calidad de la voz en distintos registros.
- Riesgo de alucinacion o artefactos en la sintesis ante texto fuera de dominio, siglas o numeros no normalizados correctamente por el front-end.
- La entrada depende del fonemizador gruut y de la normalizacion de `scriptconv`; errores en esta etapa degradan la pronunciacion.
- No se documentan mecanismos de control de prosodia, emocion ni velocidad mas alla de los parametros de la libreria.
- El modelo esta empaquetado para `phoonnx`; su uso fuera de esa libreria requiere gestionar manualmente el pipeline ONNX y el vocoder.
- No hay benchmarks publicados que permitan estimar su calidad objetiva frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-ru_ru-nikolaev
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/ru-ru_nikolaev-glow_tts.tar.gz
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
