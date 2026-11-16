# Phoonnx/vits-de-thorsten-gruut

## Resumen

vits-de-thorsten-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, originalmente entrenado por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo esta especializado en aleman (`de`) y forma parte de la coleccion de modelos VITS que Phoonnx distribuye para su ecosistema de TTS, incluyendo integracion con OVOS (Open Voice OS).

El modelo no es un desarrollo original de Phoonnx: se trata de una conversion del modelo `tts_models--de--thorsten--vits` publicado por Coqui en la release v0.7.0 de su repositorio TTS. Phoonnx lo reempaqueta en ONNX para permitir inferencia sin dependencias de PyTorch y con integracion directa en pipelines de voz. El front-end de texto utiliza fonemas gruut en alfabeto IPA, gestionados por la libreria scriptconv.

Con un tamano de repositorio de 0.1 GB, es un modelo ligero orientado a sintesis de voz en tiempo real o casi real en entornos con recursos limitados. Su relevancia actual radica en la demanda de soluciones TTS ligeras, ejecutables en CPU y desplegables en asistentes de voz locales (OVOS, Mycroft), donde el aleman cuenta con pocas alternativas open source de calidad con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto largo como un LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el modelo card no detalla variantes cuantizadas) |
| Idiomas soportados | aleman (`de`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional condicionado por texto, un decoder generativo basado en normalizing flows y un discriminador adversarial multi-periodo. El entrenamiento original de Coqui para el modelo `de-thorsten-vits` utilizo el dataset Thorsten (corpus de voz alemana), aunque la model card no detalla el numero de horas, la composicion exacta del dataset ni los hiperparametros de entrenamiento.

La innovacion principal de VITS frente a arquitecturas anteriores (Tacotron 2 + vocoder separado) es la generacion directa de waveform a partir de texto mediante inferencia variacional, eliminando la necesidad de un vocoder externo. El modelo empaquetado por Phoonnx mantiene esta arquitectura pero convierte los pesos a ONNX, lo que permite inferencia sin PyTorch y despliegue en entornos ligeros. El front-end de texto usa gruut para fonemizacion en IPA, sustituyendo el front-end original de Coqui.

## Capacidades

- Sintesis de voz end-to-end en aleman a partir de texto plano.
- Generacion de audio WAV mediante `voice.synthesize_wav(text, wav_file)` en la API de phoonnx.
- Fonemizacion automatica con gruut (alfabeto IPA) para el texto de entrada en aleman.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable via `mycroft.conf`.
- Inferencia en formato ONNX, sin dependencia de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni vision (es un modelo TTS puro).
- Capacidad multilingue limitada exclusivamente al aleman.

## Casos de uso

- Asistentes de voz locales en aleman: integracion como motor TTS en OVOS o Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en un asistente que corre en local sin enviar texto a servicios en la nube.
- Lectura de notificaciones y alertas en sistemas embebidos: el modelo es lo bastante ligero (repo de 0.1 GB) para ejecutarse en dispositivos con recursos limitados, leyendo mensajes dinamicos generados por el sistema.
- Accesibilidad para usuarios germanoparlantes: conversion de texto a voz en aplicaciones de lectura de pantalla o interfaces para personas con discapacidad visual, con licencia Apache-2.0 que permite redistribucion.
- Generacion de locuciones para contenido educativo o corporativo: sintesis de guiones en aleman para cursos, tutoriales o avisos internos sin coste de licencia por uso comercial.
- Prototipado rapido de interfaces conversacionales: al ser ONNX y ligero, permite iterar en el desarrollo de flujos de voz sin infraestructura GPU dedicada.
- Pruebas de integracion en pipelines de voz: uso como voz de referencia en tests automatizados de sistemas de dialogo, verificando la cadena texto-fonemas-audio con gruut y scriptconv.
- Sustitucion de voces propietarias en productos de codigo abierto: al ser Apache-2.0, puede embeberse en distribuciones Linux o imagenes Docker sin restricciones de redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamano del repositorio (0.1 GB) y la arquitectura VITS, es probable que la inferencia en CPU sea viable, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible; el formato ONNX permite ejecucion en CPU y potencialmente en GPU via ONNX Runtime, pero no se especifica.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / tamano |
|---|---|---|---|---|---|
| vits-de-thorsten-gruut (Phoonnx) | VITS | de | Apache-2.0 | ONNX | 0.1 GB repo |
| Coqui `tts_models--de--thorsten--vits` (upstream) | VITS | de | Apache-2.0 | PyTorch (checkpoint) | no disponible |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | Apache-2.0 | ONNX | no disponible |

La comparativa se limita al modelo upstream de Coqui, del cual este es una conversion directa. No se dispone de datos de benchmarks para comparar rendimiento con alternativas como Piper, Coqui XTTS u otros TTS en aleman, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo solo soporta aleman; no es multilingue.
- No se han publicado metricas de calidad (MOS, WER) ni benchmarks en la informacion disponible.
- Al ser una conversion ONNX de un modelo Coqui de 2022 (release v0.7.0), puede no incorporar mejoras posteriores en calidad de sintesis.
- El front-end depende de gruut y scriptconv; cambios en estas librerias pueden afectar la fonemizacion y, por tanto, la calidad del audio.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas ante texto no visto, siglas o neologismos.
- Sesgos: el dataset Thorsten condiciona el timbre y el estilo de habla; no se documentan sesgos de genero, edad o dialecto.
- Licencia Apache-2.0 permite uso comercial y redistribucion, pero la model card remite a la declaracion de licencia del listado de modelos de Coqui; conviene verificar la procedencia de los datos de entrenamiento originales (dataset Thorsten) para usos sensibles.
- No apto para clonacion de voz ni para control de estilo/emocion: es un TTS de voz unica.
- El repo tiene solo 17 descargas y 0 likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de-thorsten-gruut
- Modelo upstream (Coqui TTS v0.7.0): https://github.com/coqui-ai/TTS/releases/download/v0.7.0_models/tts_models--de--thorsten--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
