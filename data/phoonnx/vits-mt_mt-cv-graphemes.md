# Phoonnx/vits-mt_mt-cv-graphemes

## Resumen

`vits-mt_mt-cv-graphemes` es un modelo de sintesis de voz (text-to-speech) de tipo VITS, desarrollado originalmente por Coqui y empaquetado en formato ONNX por Phoonnx para su uso con la libreria `phoonnx` y el ecosistema OVOS. El modelo esta especializado en maltes (`mt-MT`) y se ha entrenado sobre el corpus Common Voice, lo que lo convierte en una de las pocas opciones abiertas para sintesis de voz en esta lengua.

La relevancia del modelo radica en su nicho: el maltes es un idioma con recursos limitados y pocos sistemas TTS disponibles. Este modelo ofrece una via practica para integrar voz sintetica en maltes dentro de asistentes de voz basados en OVOS/Mycroft, aplicaciones de accesibilidad o sistemas de lectura de contenido, gracias a su empaquetado ONNX ligero (0,1 GB) y su licencia permisiva BSD-3-Clause.

Arquitectonicamente es un VITS clasico (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina un encoder de texto, un decoder acustico y un vocoder en una sola red. El front-end de texto utiliza grafemas directamente mediante `GraphemePhonemizer` de la libreria `scriptconv`, sin conversion a fonemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | maltes (`mt-MT`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que integra en un unico modelo el encoder de texto, el predictor de duracion, el decoder acustico basado en flujos normales y un vocoder generativo (HiFi-GAN). El entrenamiento combina perdidas adversarias, de reconstruccion y de alineamiento monotono, lo que permite generar audio de forma directa a partir de texto sin pipelines separados.

En este caso concreto, el modelo procede del release v0.8.0 de Coqui TTS (`tts_models--mt--cv--vits`) y fue entrenado sobre el corpus Common Voice en maltes. El front-end de texto trabaja a nivel de grafemas (`GraphemePhonemizer`), lo que simplifica el preprocesado pero puede penalizar la pronunciacion en palabras con ortografia irregular. No se dispone de informacion sobre el numero exacto de horas de audio, tokens de entrenamiento ni detalles del proceso de ajuste.

## Capacidades

- Sintesis de voz (text-to-speech) en maltes a partir de texto en caracteres.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integracion como plugin TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Normalizacion y conversion de texto de entrada mediante `scriptconv`.
- Ejecucion en ONNX Runtime, lo que facilita el despliegue en CPU y entornos sin GPU.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es exclusivamente un modelo TTS).

## Casos de uso

- Asistentes de voz en maltes: integracion como motor TTS en OVOS/Mycroft para responder al usuario en maltes, configurando el plugin `ovos-tts-plugin-phoonnx` en `mycroft.conf`.
- Accesibilidad y lectura de contenido: conversion de articulos, noticias o documentos en maltes a audio para personas con discapacidad visual o dificultades de lectura.
- Sistemas de anuncios y megafonia: generacion de avisos pregrabados en maltes para transporte publico, aeropuertos o comercios.
- Aplicaciones educativas de aprendizaje de maltes: sintesis de frases y vocabulario para herramientas de aprendizaje de idiomas.
- Prototipado de interfaces conversacionales: generacion rapida de voz para demos y pruebas de concepto en maltes sin depender de servicios en la nube.
- Investigacion en TTS de bajos recursos: uso como linea base para experimentos de sintesis en lenguas con pocos datos, dado su caracter abierto y ligero.
- Localizacion de contenido multimedia: doblaje o narracion automatizada de videos y presentaciones en maltes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU mediante ONNX Runtime. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) aceleraria la inferencia pero no es necesaria.
- Cabe en GPU consumer: si, en cualquier modelo, incluidas GPUs de gama baja o integradas.
- Opciones de despliegue: `phoonnx` (Python) con ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-mt_mt-cv-graphemes` | Maltes (mt-MT) | VITS | ONNX | BSD-3-Clause | Hugging Face, via phoonnx |
| Coqui TTS `tts_models--mt--cv--vits` | Maltes (mt-MT) | VITS | Checkpoint PyTorch | BSD-3-Clause | GitHub Coqui TTS releases |
| Otros modelos VITS de Phoonnx | Multiples idiomas | VITS | ONNX | Variable | Coleccion VITS de Phoonnx en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente TTS: no realiza comprension de texto, razonamiento ni generacion de texto.
- Solo soporta maltes (`mt-MT`); no es multilingue.
- El front-end basado en grafemas puede producir pronunciaciones incorrectas en palabras con ortografia no fonetica.
- Entrenado sobre Common Voice, un corpus de audio de voluntarios con posible variabilidad de calidad y sesgos de hablantes (edad, genero, acento).
- Riesgo de artefactos acusticos y prosodia poco natural en frases largas o con puntuacion compleja.
- No se han publicado evaluaciones objetivas (MOS, WER) en la informacion disponible.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar los terminos del corpus Common Voice subyacente.
- El modelo tiene muy poca traccion (17 descargas, 0 likes) y fue actualizado por ultima vez en noviembre de 2026; no hay garantia de mantenimiento.
- Depende de la libreria `phoonnx` en version pre-release (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-mt_mt-cv-graphemes
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Modelo upstream Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--mt--cv--vits.zip
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
