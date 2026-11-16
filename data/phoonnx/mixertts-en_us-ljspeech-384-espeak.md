# Phoonnx/mixertts-en_us-ljspeech-384-espeak

## Resumen

MixerTTS en_us ljspeech 384 espeak es un modelo de sintesis de voz (text-to-speech) de la familia MixerTTS, desarrollado originalmente por nipponjo en el repositorio `mixer-tts-pytorch` y empaquetado por Phoonnx para su libreria de inferencia ONNX `phoonnx`. El modelo convierte texto en ingles estadounidense, representado como fonemas espeak en alfabeto IPA, en un espectrograma que posteriormente se transforma en audio mediante el vocoder `vocos-multi-alvocat-22khz`. Forma parte de la coleccion de voces MixerTTS que Phoonnx distribuye para su ecosistema, incluyendo integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

El modelo esta entrenado sobre el corpus LJSpeech, un conjunto de lectura de una unica hablante femenina en ingles, y el sufijo "384" hace referencia a la dimension del modelo. Su relevancia radica en que ofrece una voz TTS ligera (repositorio de 0,1 GB) ejecutable mediante ONNX, lo que facilita su despliegue en entornos con recursos limitados y su integracion en asistentes de voz locales. La licencia no esta registrada en la model card, lo que constituye una advertencia importante para uso comercial.

La informacion disponible sobre arquitectura interna, numero de parametros y datos de entrenamiento es limitada: la model card solo indica la arquitectura MixerTTS, el idioma (en-US), el front-end de fonemas (espeak, IPA) y el vocoder asociado. No se publican detalles sobre composicion del dataset mas alla de LJSpeech, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixerTTS (familia MixerTTS de nipponjo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada en la model card; consultar upstream) |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

MixerTTS es una arquitectura de sintesis de voz que genera un espectrograma a partir de fonemas de entrada; en este caso, los fonemas proceden de espeak-ng en alfabeto IPA y el texto se normaliza mediante la libreria `scriptconv` de TigreGotico, usando el `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`. El espectrograma resultante se convierte en audio mediante el vocoder `vocos-multi-alvocat-22khz`, que phoonnx descarga junto con la voz. El modelo esta empaquetado en formato ONNX, lo que permite inferencia sin dependencia de PyTorch en tiempo de ejecucion.

El entrenamiento se realizo sobre el corpus LJSpeech, un dataset publico de lectura en ingles de una unica hablante. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a TTS). El sufijo "384" sugiere una dimension de modelo de 384 unidades, pero este dato no se confirma explicitamente en la informacion proporcionada. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto plano.
- Conversion de texto a fonemas espeak-ng en alfabeto IPA como front-end.
- Generacion de espectrogramas que se convierten en audio mediante vocoder Vocos a 22 kHz.
- Integracion con la libreria phoonnx para inferencia ONNX en Python.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Soporte de normalizacion de texto y conversion de script mediante `scriptconv`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No soporta vision ni audio de entrada; solo texto de entrada y audio de salida.
- Capacidad multilingue limitada: solo en-US.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente domestico sin depender de servicios en la nube, gracias a su formato ONNX y su tamano reducido (0,1 GB).
- Lectura de notificaciones y alertas: en sistemas embebidos o de escritorio, el modelo puede sintetizar mensajes cortos en ingles con baja latencia al ejecutarse sobre ONNX Runtime.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual en aplicaciones de escritorio, usando la API de phoonnx para generar archivos WAV.
- Generacion de audio para prototipos: desarrolladores que necesitan una voz TTS rapida para demos o pruebas de concepto pueden usar este modelo sin entrenamiento adicional.
- Integracion en pipelines de CI/CD para pruebas de audio: el modelo permite generar locuciones de prueba de forma reproducible en entornos automatizados.
- Educacion y aprendizaje de idiomas: sintesis de frases en ingles estadounidense para ejercicios de pronunciacion, con la salvedad de que la calidad depende del front-end espeak.
- Sistemas de megafonia o anuncios automatizados: generacion de avisos pregrabados en ingles para entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo ligero que probablemente cabe en CPU y en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible. Por el tamano del repositorio, es probable que funcione en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecucion en CPU y en GPUs consumer mediante ONNX Runtime, pero no hay datos oficiales.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MixerTTS en_us ljspeech 384 espeak (este modelo) | no disponible | no aplica | other (sin registrar) | ONNX | Hugging Face (Phoonnx) |
| Otras voces MixerTTS de la coleccion Phoonnx | no disponible | no aplica | variable | ONNX | Hugging Face (coleccion MixerTTS) |
| Modelos TTS genericos (p. ej. Piper, Coqui) | no disponible | no aplica | variable | ONNX / otros | Hugging Face / repositorios propios |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de la misma categoria en la informacion proporcionada. La comparativa se limita a aspectos de formato y licencia.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica "No licence is recorded for this model. Check the upstream release before you use it." Esto implica un riesgo legal para uso comercial; es imprescindible verificar la licencia del repositorio upstream `nipponjo/mixer-tts-pytorch` antes de desplegar en produccion.
- Idioma unico: solo soporta en-US; no es adecuado para otros idiomas.
- Dependencia de espeak-ng: los fonemas se generan con espeak-ng; si se usa el port espyak, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- Calidad limitada por el corpus: entrenado sobre LJSpeech (una unica hablante), por lo que la voz es mono-hablante y con dominio limitado al estilo de lectura de ese corpus.
- Riesgo de alucinacion en TTS: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos en texto fuera de dominio.
- Sin datos de benchmarks ni de parametros: dificulta la evaluacion objetiva frente a alternativas.
- Sin soporte de tool calling, agentes ni razonamiento: es exclusivamente un modelo TTS.
- Repositorio con pocas descargas (23) y sin likes: ecosistema reducido, menor validacion comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-384-espeak)
- [Repositorio upstream mixer-tts-pytorch](https://github.com/nipponjo/mixer-tts-pytorch)
- [Libreria phoonnx](https://github.com/TigreGotico/phoonnx)
- [Libreria scriptconv](https://github.com/TigreGotico/scriptconv)
- [Vocoder vocos-multi-alvocat-22khz](https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz)
- [Coleccion MixerTTS en Hugging Face](https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8)
