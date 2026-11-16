# Phoonnx/vits-es_es-carlfm-x_low-espeak

## Resumen

vits-es_es-carlfm-x_low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su libreria ONNX de TTS. Concretamente, se trata de la voz `es_ES/carlfm/x_low` del repositorio `rhasspy/piper-voices`, adaptada para ejecutarse mediante la libreria phoonnx en Python y en el ecosistema OVOS (Open Voice OS).

El modelo resuelve el problema de la sintesis de voz en castellano de Espana (`es-ES`) en entornos con recursos limitados, gracias a su variante `x_low`, que prioriza velocidad y tamano reducido frente a calidad maxima. La entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados mediante espeak-ng, lo que obliga a instalar dicha herramienta o el port `espyak` como dependencia del pipeline.

Es relevante para desarrolladores que necesitan un TTS ligero, de licencia MIT y ejecutable en local (sin dependencia de APIs en la nube) para asistentes de voz, sistemas embebidos o integraciones en OVOS. El repositorio es de 2026 y no registra descargas ni interacciones en el momento de la consulta, por lo que se trata de un artefacto de empaquetado mas que de un modelo con traccion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; variante `x_low` del upstream) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Upstream | rhasspy/piper-voices/es/es_ES/carlfm/x_low |
| Tamano del repositorio | 0.0 GB (segun metadatos de Hugging Face) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. Permite generar audio directamente desde fonemas sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

El modelo es una adaptacion de la voz `carlfm` del proyecto Piper (Rhasspy), en su variante `x_low`, pensada para minimizar el coste computacional. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla de las propias de VITS. La entrada debe ser texto fonemizado a IPA mediante espeak-ng; phoonnx delega esta conversion en la libreria `scriptconv` (modulo `EspeakPhonemizer`). El reempaquetado anade una capa de gestion de voces (`TTSModelManager`) y un plugin para OVOS (`ovos-tts-plugin-phoonnx`).

## Capacidades

- Sintesis de voz en castellano de Espana (`es-ES`) a partir de texto fonemizado en IPA.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integracion como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de phoonnx.js, con entrada espeak o unicode.
- Normalizacion y conversion de texto delegadas en la libreria `scriptconv`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision/audio de entrada.
- No es un modelo multilingue: solo `es-ES`.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper/es_ES-carlfm-x_low` en `mycroft.conf`, permitiendo sintesis en castellano sin conexion a servicios externos.
- Sistemas embebidos y dispositivos de bajos recursos: la variante `x_low` reduce el coste computacional, lo que permite ejecutar TTS en Raspberry Pi o hardware similar siempre que se disponga de espeak-ng.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la API de phoonnx permite generar WAVs de frases cortas de forma programatica desde Python.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de voz en castellano, con licencia MIT que facilita su integracion en productos comerciales.
- Prototipado rapido de interfaces conversacionales: al no requerir GPU ni APIs de pago, sirve para validar flujos de voz antes de migrar a modelos de mayor calidad.
- Demos web de TTS: phoonnx.js permite ejecutar la voz en el navegador, con demo en `tigregotico.pt/demo`, util para pruebas de concepto sin backend.
- Generacion de locuciones para contenido interno: narracion de textos en castellano en pipelines automatizados donde la calidad `x_low` es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS `x_low` en ONNX, se espera que quepa en CPU y en GPUs de gama baja, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; la variante `x_low` y el formato ONNX sugieren viabilidad en hardware modesto.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Dependencias obligatorias: espeak-ng (o el port `espyak` mediante `phoonnx[espeak]`) para la fonemizacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-es_es-carlfm-x_low-espeak (este) | VITS | es-ES | MIT | ONNX | Variante `x_low`, empaquetado phoonnx |
| rhasspy/piper-voices es_ES/carlfm/x_low (upstream) | VITS | es-ES | MIT | Piper/ONNX | Origen del modelo; requiere Piper en lugar de phoonnx |
| Otras voces Piper es_ES (p. ej. variantes medium/high) | VITS | es-ES | MIT | Piper/ONNX | No disponibles en la informacion proporcionada; se desconoce su existencia concreta en este contexto |
| Modelos TTS comerciales en castellano | no disponible | es-ES | Propietaria | API | No comparables en licencia ni despliegue local |

La comparacion con alternativas concretas no puede completarse con datos verificados en la informacion disponible; solo el upstream de Piper es directamente comparable y comparte arquitectura, licencia e idioma, diferenciandose en la libreria de inferencia y el empaquetado.

## Limitaciones y advertencias

- Solo soporta castellano de Espana (`es-ES`); no es multilingue.
- Requiere espeak-ng instalado; sin el, la fonemizacion falla o recurre a `espyak`, cuyos fonemas pueden diferir y provocar pronunciaciones incorrectas.
- La variante `x_low` prioriza velocidad y tamano frente a calidad, por lo que la naturalidad y prosodia seran inferiores a variantes de mayor calidad.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion acustica o limitaciones de prosodia mas alla de las inherentes a la variante `x_low`.
- No hay datos publicados de benchmarks ni de rendimiento objetivo.
- El repositorio no registra descargas ni likes, lo que sugiere poca validacion externa; conviene probar exhaustivamente antes de produccion.
- La licencia MIT del upstream permite uso comercial, pero debe verificarse la cadena de atribucion (Rhasspy/Piper y Phoonnx) en la distribucion.
- El tamano del repositorio aparece como 0.0 GB en los metadatos, lo que puede indicar que los pesos no estan incluidos o que la medicion no es fiable; conviene comprobar la disponibilidad real de los ficheros ONNX.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-carlfm-x_low-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/carlfm/x_low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
