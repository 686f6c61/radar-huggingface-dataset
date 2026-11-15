# Phoonnx/vits-en-wasmdashai-v1

## Resumen

vits-en-wasmdashai-v1 es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado por wasmdashai y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo original (wasmdashai/vits-en-v1) se ha convertido al formato ONNX para poder ejecutarse con phoonnx, una libreria Python de TTS que tambien se integra en el ecosistema OVOS (OpenVoiceOS) mediante el plugin ovos-tts-plugin-phoonnx.

El modelo resuelve la conversion de texto a voz en ingles: recibe caracteres de texto y genera audio WAV. Su relevancia practica radica en el formato de despliegue: al estar en ONNX, puede ejecutarse en CPU sin dependencias de GPU ni de frameworks pesados como PyTorch, lo que lo hace adecuado para asistentes de voz locales, sistemas embebidos y entornos con recursos limitados.

El repositorio pesa aproximadamente 0,1 GB y la model card no proporciona detalles sobre numero de parametros, longitud de contexto ni datos de entrenamiento. La informacion disponible se limita a la arquitectura (VITS), el idioma (ingles), el formato (ONNX) y la licencia (MIT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por caracteres, sin contexto definido) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto (front end `GraphemePhonemizer` de scriptconv) |
| Libreria de inferencia | phoonnx |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de adversario y de reconstruccion espectral. El resultado es un modelo que genera formas de onda directamente a partir de texto, sin necesidad de un vocoder separado.

El modelo original fue entrenado por wasmdashai (wasmdashai/vits-en-v1) y posteriormente empaquetado por Phoonnx para su libreria ONNX. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El front end de texto usa `GraphemePhonemizer` de la libreria scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo; no se documenta el uso de un fonemizador basado en IPA.

## Capacidades

- Sintesis de voz en ingles a partir de texto (text-to-speech).
- Generacion de audio en formato WAV mediante `synthesize_wav`.
- Ejecucion en ONNX Runtime, sin dependencia de PyTorch en inferencia.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuracion en `mycroft.conf`.
- Normalizacion de texto de entrada mediante scriptconv (conversion de caracteres a la representacion interna del modelo).
- No dispone de soporte de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS para leer respuestas de un asistente domestico sin conexion a internet, gracias a su ejecucion en ONNX y su tamano reducido (~0,1 GB).
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en ingles para sistemas de monitorizacion, domotica o aplicaciones de escritorio, con latencia baja al no requerir GPU.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual en aplicaciones de escritorio o moviles, usando el backend ONNX en CPU.
- Sistemas embebidos y dispositivos de bajo consumo: al no depender de PyTorch ni de CUDA, puede desplegarse en Raspberry Pi u otros dispositivos ARM con ONNX Runtime.
- Prototipado rapido de interfaces de voz: la API de phoonnx permite cargar el modelo y generar WAV en pocas lineas de Python, util para validar flujos de TTS antes de invertir en modelos mayores.
- Generacion de audio para pruebas automatizadas: sintesis de frases de prueba en ingles para pipelines de test de sistemas de reconocimiento de voz o de calidad de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es previsible que funcione en CPU sin GPU, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponible; el diseno ONNX sugiere ejecucion en CPU como escenario principal.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; el formato ONNX permite ejecucion en CPU y, potencialmente, en GPU mediante ONNX Runtime, pero no se especifica.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend subyacente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en-wasmdashai-v1 | VITS | no disponible | no aplica (TTS) | MIT | ONNX | Hugging Face (Phoonnx) |
| wasmdashai/vits-en-v1 | VITS | no disponible | no aplica (TTS) | no disponible en la informacion | no disponible | Hugging Face (wasmdashai) |
| Otros modelos VITS de la coleccion Phoonnx | VITS | no disponible | no aplica (TTS) | variable | ONNX | Hugging Face (coleccion VITS de Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se documenta soporte multilingue.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado por un tercero (wasmdashai) sin documentacion de dataset, no es posible evaluar sesgos de acento, genero o procedencia.
- Riesgo de alucinacion o artefactos de audio: no documentado; los modelos VITS pueden producir prosodia incorrecta o artefactos en textos fuera de dominio.
- La licencia MIT permite uso comercial, pero la model card indica que "the upstream release states its terms"; conviene verificar la licencia del modelo original wasmdashai/vits-en-v1 antes de un despliegue comercial.
- El front end usa `GraphemePhonemizer` (caracteres), no un fonemizador IPA; la calidad de pronunciacion en palabras irregulares puede ser inferior a la de modelos con fonemizacion completa.
- No hay informacion sobre limites de longitud de texto de entrada; textos muy largos podrian requerir segmentacion manual.
- El modelo tiene 31 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- La fecha de creacion del repositorio (2026-11-14) y su actualizacion (2026-11-15) son las unicas referencias temporales disponibles; no se documenta versionado del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en-wasmdashai-v1
- Modelo original upstream: https://huggingface.co/wasmdashai/vits-en-v1
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
