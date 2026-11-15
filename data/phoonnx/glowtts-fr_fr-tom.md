# Phoonnx/glowtts-fr_fr-tom

## Resumen

glowtts-fr_fr-tom es un modelo de sintesis de voz (text-to-speech) en frances de Francia, empaquetado en formato ONNX por Phoonnx a partir de un modelo Glow-TTS original de Rhasspy, publicado dentro del proyecto Larynx v1.0. No se trata de un modelo de lenguaje ni de un transformer generativo de texto: es un acoustic model que convierte fonemas IPA en espectrogramas mel, que despues son transformados en audio por el vocoder HiFi-GAN multi-VCTK small. El repositorio ocupa 0,1 GB y la voz concreta se identifica internamente como `larynx/fr-fr-tom-glow_tts`.

Su relevancia es practica: permite sintesis de voz en frances dentro del ecosistema phoonnx y del asistente OVOS (Open Voice OS), con una integracion directa mediante el plugin `ovos-tts-plugin-phoonnx`. Al estar empaquetado en ONNX, la inferencia no depende de PyTorch en tiempo de ejecucion, lo que simplifica el despliegue en entornos con recursos limitados.

La informacion publicada es escasa: no se detallan parametros, contexto, dataset de entrenamiento ni resultados de benchmarks. La model card advierte ademas de que no hay licencia registrada para este empaquetado, por lo que el uso comercial requiere verificar la licencia del release original de Rhasspy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (acoustic model) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (sintesis por frase, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | frances de Francia (`fr-FR`) |
| Licencia | other (sin licencia registrada en el repositorio; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis neuronal basado en normalizing flows: aprende una correspondencia monotona entre fonemas y frames de espectrograma mel mediante alineamiento tipo MAS (Monotonic Alignment Search), sin necesidad de un aligner externo entrenado aparte. La salida del modelo es un espectrograma mel que se convierte en forma de onda con el vocoder HiFi-GAN multi-VCTK small, descargado automaticamente por phoonnx junto con la voz.

El front-end de texto no forma parte del modelo ONNX: phoonnx delega la normalizacion y la fonemizacion en la libreria scriptconv, usando `GruutPhonemizer` del modulo `scriptconv.phonemizers.mul` (extra `scriptconv[gruut]`). El modelo original procede del release v1.0 de Larynx de Rhasspy (`fr-fr_tom-glow_tts.tar.gz`). No se ha publicado informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el hablante de referencia ni si se aplicaron tecnicas de ajuste posteriores.

## Capacidades

- Sintesis de voz en frances de Francia a partir de texto plano, con salida WAV.
- Conversion texto a fonemas IPA mediante gruut, con normalizacion previa del texto por scriptconv.
- Generacion de espectrogramas mel y sintesis de audio final mediante HiFi-GAN.
- Integracion nativa con phoonnx en Python (`TTSModelManager`, `voice.synthesize_wav`).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuracion en `mycroft.conf`.
- Inferencia en ONNX, sin dependencia de PyTorch en tiempo de ejecucion.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistente de voz domestico en OVOS: la voz se selecciona en `mycroft.conf` con el modulo `ovos-tts-plugin-phoonnx` y la clave `larynx/fr-fr-tom-glow_tts`, de modo que el asistente responde en frances sin infraestructura adicional.
- Lectura de notificaciones y alertas en frances: el modelo sintetiza frases cortas de forma rapida y con un footprint de 0,1 GB, adecuado para dispositivos de bajo consumo.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a audio en frances dentro de aplicaciones de escritorio o moviles que integren phoonnx.
- Generacion de audiolibros o contenido narrado por lotes: procesamiento por frases con `voice.synthesize_wav` y concatenacion posterior de los WAV resultantes.
- Locuciones para interfaces de voz (IVR) y sistemas telefonicos en frances: frases fijas o plantillas dinamicas sintetizadas en el servidor.
- Prototipado de productos de voz en frances: al ser un paquete ONNX pequeno, permite validar flujos TTS completos antes de invertir en voces comerciales o modelos de mayor calidad.
- Pruebas de regresion en pipelines de TTS: util como voz de referencia ligera para comparar calidad o latencia frente a otros modelos del catalogo phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,1 GB, por lo que el modelo y el vocoder caben holgadamente en memoria de cualquier GPU consumer; el consumo exacto en VRAM no esta documentado.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cualquier GPU con soporte ONNX Runtime (RTX 4090, RTX 3060, GTX 1650 o inferiores) deberia ser suficiente; tambien es viable la ejecucion en CPU.
- Cabe en GPU consumer: si, con margen amplio dado el tamano del paquete.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada |
|---|---|---|---|---|---|
| glowtts-fr_fr-tom (este) | Glow-TTS + HiFi-GAN small | fr-FR | ONNX | other (sin registrar) | fonemas IPA por frase |
| Otras voces de la coleccion Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN small | varios | ONNX | variable por voz | fonemas IPA por frase |
| Modelos Larynx v1.0 originales (Rhasspy) | Glow-TTS + vocoder | varios | tarball propio | segun release upstream | fonemas IPA por frase |

No se dispone de datos de rendimiento (MOS, latencia, throughput) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Cobertura limitada a frances de Francia (`fr-FR`); no se documenta soporte para otras variantes del frances ni para otros idiomas.
- No hay licencia registrada en el repositorio. La model card indica explicitamente que se consulte el release original de Rhasspy antes de usarlo; el uso comercial no esta garantizado sin esa verificacion.
- Al ser un modelo TTS y no un modelo de lenguaje, no razona ni genera texto: cualquier error de pronunciacion proviene del front-end de fonemas o de la cobertura del corpus de entrenamiento.
- No se han publicado datos sobre sesgos, calidad perceptual (MOS), comportamiento con nombres propios, siglas o numeros, ni sobre el hablante de referencia.
- El front-end depende de gruut y scriptconv; una fonemizacion incorrecta del texto de entrada degrada directamente el audio resultante.
- El vocoder se descarga por separado desde phoonnx, lo que introduce una dependencia de red en el primer uso.
- El modelo se creo y actualizo en noviembre de 2026 segun los metadatos del repositorio; conviene comprobar el estado del proyecto phoonnx antes de integrarlo en produccion.
- Con 34 descargas y 0 likes, la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-fr_fr-tom
- Release original de Larynx v1.0 (Rhasspy): https://github.com/rhasspy/larynx/releases/download/v1.0/fr-fr_tom-glow_tts.tar.gz
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
