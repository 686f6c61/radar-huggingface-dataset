# Phoonnx/vits-es_mx-ald-medium-espeak-v2

## Resumen

`Phoonnx/vits-es_mx-ald-medium-espeak-v2` es una voz de síntesis de voz (text-to-speech) en espanol de Mexico basada en la arquitectura VITS, publicada por el proyecto Phoonnx (TigreGotico Lda) como conversion a ONNX de la voz original de Rhasspy Piper (`rhasspy/piper-voices/es/es_MX/ald/medium`). No es un modelo de lenguaje generativo, sino un modelo acustico neuronal que transforma fonemas espeak en audio a 22050 Hz con un unico hablante. Su relevancia practica es que permite sintesis de voz local, ligera y de baja latencia en hardware modesto, sin dependencia de servicios en la nube.

El modelo resuelve el problema de disponer de una voz TTS en espanol mexicano con licencia Unlicense (dominio publico), lo que elimina restricciones de uso comercial. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato ONNX, con copias int8 generadas mediante cuantizacion dinamica de onnxruntime. Esta version (v2) sustituye a `Phoonnx/vits-es_mx-ald-medium-espeak`, ya que la fuente original fue reentrenada sobre los modelos base de Piper 1.5.

La ficha se centra en el uso de la voz dentro del ecosistema phoonnx y OVOS, aunque tambien es compatible con el ecosistema Piper por su origen. Al tratarse de un modelo TTS y no de un LLM, no dispone de ventana de contexto, capacidades de razonamiento, tool calling ni benchmarks tipo MMLU; los parametros relevantes son los acusticos (WER, RTF, tamano de grafo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper 1.5 o superior) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frases) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 (QInt8, cuantizacion dinamica con onnxruntime 1.32.0) |
| Idiomas soportados | es-MX (espanol de Mexico) |
| Licencia | Unlicense (dominio publico) |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (voz `ald`) |
| Entrada de texto | Fonemas espeak-ng (alfabeto IPA), voz es-419 |
| Puntuacion soportada | `, . ! ? : ;` |
| Tamano del repositorio | ~0,1 GB |
| Tamano de grafo (fp32 / int8) | 63,2 MB / 18,7 MB |
| Libreria | phoonnx |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder basado en HiFi-GAN para producir formas de onda directamente a partir de fonemas. En este caso, la entrada no es texto crudo sino fonemas generados por espeak-ng con la voz `es-419`, lo que exige tener espeak-ng instalado (o el puerto espyak que ofrece `phoonnx[espeak]`, aunque puede introducir diferencias foneticas). La voz se entreno con la puntuacion de clausula `, . ! ? : ;`, que phoonnx 1.96.1a1 y posteriores preservan en la sintesis.

Segun la model card upstream, la voz se ajusto (finetune) a partir del modelo base `rdh` (calidad medium, nl_BE, un hablante flamenco, CC0) aplicando MRD y SDP, y utiliza los ajustes por defecto `noise_scale 0.5` y `noise_w 0.333`. Los datos de entrenamiento provienen del dataset `rmcpantoja/Ald_Mexican_Spanish_speech_dataset` (licencia Unlicense), aunque el numero de horas o tokens no esta registrado. No hay informacion sobre RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no aplican a un modelo TTS. La conversion a ONNX no modifica los pesos; solo las copias int8 los cuantizan.

## Capacidades

- Sintesis de voz en espanol de Mexico a partir de texto, con salida WAV a 22050 Hz.
- Generacion de audio local sin conexion a servicios externos.
- Control de prosodia basico mediante puntuacion de clausula (`,` `.` `!` `?` `:` `;`).
- Ajuste de variabilidad mediante `noise_scale` y `noise_w` en inferencia.
- Ejecucion en CPU gracias a los grafos ONNX fp32 e int8 (RTF 0,039 en fp32 y 0,101 en int8 sobre un Intel i9-11900H).
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente TTS.
- Capacidad multilingue limitada a es-MX; no cubre otras variantes del espanol de forma nativa.

## Casos de uso

- Asistentes de voz locales: integracion en OVOS mediante `ovos-tts-plugin-phoonnx` para responder a comandos de voz en espanol mexicano sin enviar datos a la nube, gracias a su bajo consumo (RSS pico de ~304-338 MB).
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de escritorio o moviles donde el RTF de 0,039 en fp32 permite generar audio mas rapido que el tiempo real en CPU.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, con licencia Unlicense que permite redistribuir la voz dentro del producto.
- Sistemas embebidos y edge computing: el grafo int8 de 18,7 MB cabe en dispositivos con poca memoria y permite sintesis en tiempo real en CPU de gama media.
- Generacion de audiolibros o contenido narrado: la calidad medium y la tasa de 22050 Hz son adecuadas para narracion no profesional y prototipado de pipelines de publicacion.
- Pruebas automatizadas de ASR/TTS: servir como voz de referencia para evaluar sistemas de reconocimiento de voz en espanol mexicano, con WER medido de 0,026 en la propia QA.
- Prototipado de IVR y telefonia: sintesis de respuestas pregrabadas en centralitas o bots telefonicos donde la latencia importa y el modelo puede ejecutarse en el mismo servidor que el resto del stack.

## Benchmarks y rendimiento

Datos de control de calidad publicados en la model card (medidos sobre un Intel Core i9-11900H a 2,50 GHz, RTF mediana de 3 ejecuciones con 4 hilos, ASR de evaluacion `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest):

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,026 | 0,026 |
| Caracteres por segundo | 14,2 a 15,3 | no disponible |
| Ratio de longitud int8 / fp32 | no aplica | 0,99 a 1,01 |
| Tamano de grafo | 63,2 MB | 18,7 MB |
| RSS pico | 337,8 MB | 303,9 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,101 |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K, ya que no son aplicables a un modelo TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU. El grafo fp32 ocupa 63,2 MB y el int8 18,7 MB, con RSS pico de ~338 MB y ~304 MB respectivamente.
- GPU recomendadas: no aplica; no se documenta soporte CUDA ni aceleracion por GPU en la informacion disponible.
- Cabe en cualquier CPU consumer moderna; el RTF de 0,039 en fp32 sobre un i9-11900H indica sintesis unas 25 veces mas rapida que el tiempo real, y el int8 unas 10 veces mas rapida.
- Opciones de despliegue: phoonnx (libreria nativa), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y onnxruntime para ejecucion directa de los grafos ONNX.
- Latencia y throughput: RTF 0,039 (fp32) y 0,101 (int8) en la CPU de referencia con 4 hilos; el throughput depende de la longitud de la frase y del hardware.
- Dependencia externa: espeak-ng (o el puerto espyak) para la fonemizacion; sin el, el modelo no puede procesar texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-es_mx-ald-medium-espeak-v2` | VITS (Piper) | es-MX | 63,2 MB fp32 / 18,7 MB int8 | Unlicense | Conversion ONNX, voz unica, RTF 0,039 fp32 |
| `rhasspy/piper-voices` (es_MX/ald/medium) | VITS (Piper) | es-MX | no disponible | Unlicense | Modelo upstream original en formato Piper |
| `Phoonnx/vits-es_mx-ald-medium-espeak` | VITS (Piper) | es-MX | no disponible | Unlicense | Version anterior, pesos previos al reentrenamiento en Piper 1.5 |

No se dispone de datos de benchmarks comparativos con otras voces TTS en espanol dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Un solo hablante y una unica variante (es-MX); no cubre otras variantes del espanol ni cambio de voz.
- Requiere espeak-ng para la fonemizacion; el uso del puerto espyak puede producir pronunciaciones incorrectas en algunas palabras, segun advierte la propia model card.
- Calidad "medium": adecuada para prototipos y asistencia por voz, pero no para doblaje profesional o produccion de alta fidelidad.
- Riesgo de errores de pronunciacion en palabras extranjeras, siglas o nombres propios, ya que la fonemizacion se delega a espeak-ng.
- La evaluacion de calidad se basa en solo 3 frases de FLORES-200 devtest; el WER de 0,026 no debe extrapolarse a todos los dominios.
- No hay informacion sobre sesgos del dataset de entrenamiento (`rmcpantoja/Ald_Mexican_Spanish_speech_dataset`) mas alla de su licencia Unlicense.
- Aunque la licencia Unlicense permite uso comercial sin restricciones, se recomienda atribuir a Rhasspy como autor original de los pesos, tal como pide la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopcion en produccion.
- No soporta SSML avanzado, control emocional ni marcado de prosodia mas alla de la puntuacion de clausula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_mx-ald-medium-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/es/es_MX/ald/medium
- Version anterior: https://huggingface.co/Phoonnx/vits-es_mx-ald-medium-espeak
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de entrenamiento: https://huggingface.co/datasets/rmcpantoja/Ald_Mexican_Spanish_speech_dataset
- Licencia Unlicense: http://unlicense.org
