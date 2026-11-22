# Phoonnx/vits-fi_fi-harri-medium-espeak-v2

## Resumen

vits-fi_fi-harri-medium-espeak-v2 es una voz de síntesis de habla (text-to-speech) en finés de Finlandia, publicada por Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original de Rhasspy. Se trata de una voz VITS de la familia Piper, de calidad media, con un único hablante y una frecuencia de muestreo de 22050 Hz. El modelo no genera texto ni razona: su única función es convertir fonemas espeak-ng en audio inteligible en finés.

La relevancia de esta ficha es acotada pero concreta: sustituye a la versión anterior `Phoonnx/vits-fi_fi-harri-medium-espeak`, porque Rhasspy reentrenó la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`). El repositorio pesa 0,1 GB y el grafo ONNX ocupa 63,2 MB en fp32, lo que lo hace apto para despliegue en CPU y en dispositivos de bajos recursos dentro de asistentes de voz como OVOS/Mycroft.

No se dispone de datos de arquitectura más allá de la etiqueta VITS (Piper), ni de número de parámetros, ni de composición detallada del dataset de entrenamiento; la model card indica explícitamente "Not recorded upstream" en varios campos. La licencia CC0 1.0 elimina prácticamente todas las restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | fp32 (unico formato publicado; int8 descartado por QA) |
| Idiomas soportados | fi-FI (fines de Finlandia) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (grafo de 63,2 MB) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak-ng, alfabeto IPA |
| Fonemizador | espeak-ng, voz `fi` |
| Puntuacion soportada | , . ! ? : ; (clausula; preservada desde phoonnx 1.96.1a1) |
| Tamano del repositorio | 0,1 GB |
| Checkpoint de entrenamiento | no incluido en el repositorio |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) en la implementacion de Piper, un modelo generativo end-to-end que mapea fonemas a waveform sin etapa vocoder separada. La entrada son fonemas en IPA producidos por espeak-ng con la voz `fi`; la salida es audio mono a 22050 Hz. No hay decoder autoregresivo ni ventana de contexto en el sentido de los LLM: la "longitud" viene determinada por la frase de entrada.

El entrenamiento lo realizo Rhasspy (upstream). Segun la model card original, la voz se afinó (fine-tuning) desde el modelo base `rdh` (calidad media, `nl_BE`, un hablante flamenco, CC0) aplicando MRD y SDP, y requiere Piper 1.5 o superior. Los datos de entrenamiento proceden del Finnish Single Speaker Speech Dataset de Kaggle (licencia CC0), aunque el numero de horas y la composicion exacta no estan registrados upstream. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333. La conversion a ONNX la realizo TigreGotico sin modificar los pesos.

## Capacidades

- Sintesis de voz en fines de Finlandia (fi-FI) a partir de texto, con un unico hablante masculino identificado como "harri".
- Conversion texto a fonemas via espeak-ng (voz `fi`), con soporte de alfabeto IPA.
- Respeto de puntuacion de clausula (, . ! ? : ;) en la sintesis desde phoonnx 1.96.1a1.
- Generacion de waveform a 22050 Hz en formato WAV mediante la API de phoonnx.
- Integracion como plugin TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Inferencia en CPU sin GPU, con RTF bajo (ver seccion de rendimiento).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en finlandes: integrado como plugin de OVOS/Mycroft, el modelo permite sintetizar respuestas del asistente en fi-FI sin depender de servicios en la nube, gracias a su tamano reducido (63,2 MB de grafo) y su ejecucion en CPU.
- Lectura de notificaciones y alertas en dispositivos embebidos: el bajo consumo de memoria (RSS pico de 287,8 MB) y el RTF de 0,037 permiten generar avisos cortos en tiempo real en hardware tipo Raspberry Pi o mini-PC.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en finlandes para lectores de pantalla y aplicaciones de lectura, con licencia CC0 que permite redistribucion sin restricciones.
- Locucion automatizada de contenido breve: generacion de audios para podcasts cortos, resumenes o articulos en finlandes, siempre que se acepte la calidad "medium" de la voz.
- Pruebas y desarrollo de pipelines TTS: al ser una conversion ONNX determinista y ligera, sirve como voz de referencia para validar integraciones de phoonnx, comparar versiones (v1 frente a v2) o medir latencia en distintas plataformas.
- Sistemas de announcement en transporte o comercio: sintesis de mensajes pregrabados o dinamicos en finlandes en terminales de bajo coste, con puntuacion preservada para una prosodia correcta en frases con comas y signos de interrogacion.
- Prototipado de interfaces conversacionales en finlandes: permite construir demos de IVR o kioscos de voz sin coste de licencia ni dependencia de APIs externas.

## Benchmarks y rendimiento

Los unicos datos publicados son los de QA del autor, medidos con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | no publicado |
| WER | 0,125 | 0,188 |
| Caracteres por segundo | 13,1 a 15,2 | - |
| Ratio longitud int8/fp32 | - | 1,02 a 1,04 |
| Tamano del grafo | 63,2 MB | - |
| RSS pico | 287,8 MB | - |
| RTF (mediana de 3, 4 hilos) | 0,037 | - |

La copia int8 no se publica porque no supero el umbral de QA (diferencia de WER de 0,062 frente al limite de 0,05). No hay benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. El RSS pico medido es de 287,8 MB.
- GPU recomendadas: no aplica; no se documenta aceleracion por GPU en la informacion disponible.
- Consumer GPU: irrelevante para este modelo, ya que su despliegue tipico es en CPU.
- CPU de referencia medida: Intel Core i9-11900H a 2,50 GHz, 4 hilos, RTF 0,037 (es decir, sintetiza unas 27 veces mas rapido que tiempo real en esa configuracion).
- Opciones de despliegue: phoonnx (libreria Python, `pip install --pre phoonnx`), con plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. Requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (espyak), con la advertencia de que espyak puede pronunciar mal algunas palabras.
- Latencia y throughput: RTF 0,037 medido en la CPU de referencia con 4 hilos; no se publican cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-fi_fi-harri-medium-espeak-v2 | VITS (Piper) | fi-FI | 1 | CC0 1.0 | ONNX | Version actual, reentrenada sobre Piper 1.5 |
| Phoonnx/vits-fi_fi-harri-medium-espeak | VITS (Piper) | fi-FI | 1 | CC0 1.0 | ONNX | Version anterior, pesos previos al reentrenamiento upstream |
| rhasspy/piper-voices (fi/fi_FI/harri/medium) | VITS (Piper) | fi-FI | 1 | CC0 1.0 | Piper (ONNX upstream) | Modelo original de Rhasspy del que deriva esta conversion |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada; la unica diferencia documentada es la actualizacion de pesos upstream y el consiguiente reemplazo del repositorio anterior.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de LLM es incorrecta.
- Un solo idioma (fi-FI) y un solo hablante; no hay soporte multilingue ni cambio de voz.
- Calidad "medium": el WER de QA es 0,125 en fp32, aceptable pero no equiparable a voces de mayor calidad.
- Dependencia de espeak-ng: si se usa la variante espyak, algunas pronunciaciones pueden ser incorrectas por diferencias en los fonemas.
- No se publica copia int8: quien necesite menor huella debera cuantizar por su cuenta asumiendo la perdida de calidad documentada (WER 0,188).
- Datos de entrenamiento no registrados upstream: se desconoce la composicion exacta del dataset y el numero de horas, lo que limita la evaluacion de sesgos y cobertura fonetica.
- No se documentan sesgos especificos del hablante ni evaluaciones de robustez fuera del QA con 3 frases de FLORES-200.
- Licencia CC0 1.0: sin restricciones de uso comercial, pero se recomienda atribuir a Rhasspy segun pide el autor.
- La voz puede quedar obsoleta si Rhasspy vuelve a reentrenar el modelo upstream; conviene fijar la version del repositorio en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fi_fi-harri-medium-espeak-v2
- Version anterior: https://huggingface.co/Phoonnx/vits-fi_fi-harri-medium-espeak
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/fi/fi_FI/harri/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/bryanpark/finnish-single-speaker-speech-dataset
