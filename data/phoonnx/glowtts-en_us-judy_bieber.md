# Phoonnx/glowtts-en_us-judy_bieber

## Resumen

glowtts-en_us-judy_bieber es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo genera representaciones espectrales (mel-espectrogramas) a partir de fonemas IPA obtenidos mediante el fonemizador gruut, y delega la sintesis de audio final en el vocoder HiFi-GAN (hifigan-multi-vctk-small).

Se trata de un modelo ligero, orientado a despliegue en entornos con recursos limitados como asistentes de voz locales (OVOS/Mycroft), sistemas embebidos o aplicaciones de escritorio. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja su naturaleza compacta y su enfoque en inferencia eficiente en CPU.

Su relevancia actual radica en la disponibilidad de un pipeline TTS completamente offline y reproducible, integrable mediante el plugin `ovos-tts-plugin-phoonnx`, aunque con la advertencia de que la licencia no esta registrada y debe verificarse en la release original de Larynx antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que aprende una correspondencia biyectiva entre fonemas de entrada y mel-espectrogramas, evitando el alineamiento explicito mediante un mecanismo de busqueda de alineamiento monotono (MAS). La arquitectura combina un encoder de texto con bloques de flujo invertibles, lo que permite una sintesis rapida y determinista en comparacion con modelos autoregresivos como Tacotron 2. El modelo original fue entrenado por Rhasspy como parte del proyecto Larynx v1.0, orientado a voces de alta calidad para asistentes de voz offline.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se distribuye unicamente como pesos ONNX preentrenados, sin codigo de entrenamiento en el repositorio. La innovacion principal en este empaquetado es la integracion con el fonemizador gruut y la gestion automatica del vocoder HiFi-GAN por parte de phoonnx, que descarga y combina ambos componentes de forma transparente.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Conversion de texto a fonemas IPA mediante gruut, con normalizacion previa por scriptconv.
- Generacion de mel-espectrogramas y conversion a audio WAV mediante HiFi-GAN.
- Integracion con el ecosistema OVOS/Mycroft como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Ejecucion offline en CPU, sin dependencia de servicios en la nube.
- Uso programatico via Python con `TTSModelManager` y `voice.synthesize_wav()`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es exclusivamente TTS).
- Capacidad multilingue limitada a en-US.

## Casos de uso

- Asistentes de voz locales: integracion en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de voz a asistentes que deben funcionar sin conexion, aprovechando el tamano reducido del modelo (0,1 GB) y su inferencia en CPU.
- Lectura de notificaciones y alertas en sistemas embebidos: sintesis de mensajes cortos en Raspberry Pi u otros dispositivos de bajos recursos, donde un modelo TTS ligero en ONNX evita dependencias de red.
- Prototipado rapido de interfaces conversacionales: uso de la API de Python (`synthesize_wav`) para generar audio de prueba en pipelines de desarrollo de chatbots o IVR antes de invertir en voces comerciales.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, ejecutandose localmente para preservar la privacidad del contenido leido.
- Generacion de contenido de audio para pruebas automatizadas: sintesis de frases de referencia en tests de pipelines de audio, reconocimiento de voz o evaluacion de sistemas ASR.
- Investigacion en TTS: como punto de partida o baseline para experimentos con Glow-TTS, comparacion de vocoders o estudio de fonemizacion con gruut, dado que los pesos son abiertos y el formato ONNX es portable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo de 0,1 GB en ONNX, es previsible que quepa en memoria de CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; el modelo esta disenado para inferencia en CPU (ONNX Runtime).
- Compatibilidad con GPU consumer: previsiblemente si en cualquier GPU moderna, aunque no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| glowtts-en_us-judy_bieber | Glow-TTS + HiFi-GAN | en-US | 0,1 GB | other (sin registrar) | ONNX |
| Piper (rhasspy) | VITS | Multiples | Variable | MIT (segun proyecto) | ONNX |
| Coqui TTS (VITS) | VITS | Multiples | Variable | MPL 2.0 (segun proyecto) | Varios |
| Larynx original (en-us_judy_bieber) | Glow-TTS | en-US | Similar | Verificar upstream | Tar.gz |

Nota: los datos de los modelos comparables corresponden a conocimiento general de los proyectos y no se han verificado en la informacion proporcionada; consultense sus repositorios oficiales.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explicitamente que no hay licencia registrada y que debe verificarse en la release original de Larynx antes de cualquier uso, especialmente comercial.
- Idioma unico: solo soporta en-US; no es adecuado para otros idiomas o variantes regionales.
- Dependencia de fonemizacion: la calidad depende del fonemizador gruut y de la normalizacion de scriptconv; textos con caracteres especiales, siglas o numeros pueden requerir preprocesado adicional.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos en palabras fuera del dominio de entrenamiento.
- Sesgos de voz: la voz "judy_bieber" tiene caracteristicas acusticas especificas (posiblemente derivadas de una fuente concreta) que pueden no ser apropiadas para todos los contextos; no hay informacion sobre la procedencia de los datos de entrenamiento.
- Sin benchmarks publicados: no hay metricas objetivas (MOS, WER) disponibles en la informacion proporcionada.
- Modelo no autoregresivo con alineamiento monotono: puede fallar en frases muy largas o con estructuras sintacticas complejas.
- Repositorio con muy pocas descargas (31) y sin likes: ecosistema limitado, menor probabilidad de soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-judy_bieber
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_judy_bieber-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS en Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
