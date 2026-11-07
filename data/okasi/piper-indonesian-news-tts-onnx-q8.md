# okasi/piper-indonesian-news-tts-onnx-q8

## Resumen

Piper Indonesian News TTS Medium Q8 es una version cuantizada a INT8 de la voz `id_ID-news_tts-medium` del repositorio oficial `rhasspy/piper-voices`. Piper es un sistema de sintesis de voz (TTS) neuronal ligero, basado en VITS, disenado para inferencia local y de baja latencia. El autor, `okasi`, publica aqui una conversion Q8 en formato ONNX que reduce el fichero acustico de 60,03 MiB a 15,75 MiB, manteniendo la grafica original de entrada y salida de Piper.

El modelo resuelve el problema de desplegar TTS en indonesio en entornos con recursos limitados: navegador mediante ONNX Runtime Web, dispositivos de borde o servicios con alto volumen de peticiones. La cuantizacion por canal de 116 tensores de pesos a INT8 permite ejecutar la inferencia en coma flotante tras desquantizar, sin cambiar la interfaz del modelo original.

Es relevante para desarrolladores que necesitan una voz indonesia compacta, con licencia MIT, integrable en pipelines web o aplicaciones de noticias y lectura de contenido. El contexto de este modelo no es de lenguaje (no es un LLM): es un modelo acustico de TTS que recibe fonemas y devuelve audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper, generativa acustica neuronal) |
| Parametros totales | no disponible (116 tensores de pesos en el fichero acustico) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no LLM) |
| Tipos de cuantizacion | INT8 per-channel (Q8), desquantizacion a coma flotante en inferencia |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero acustico `id_ID-news_tts-medium-q8.onnx` + config `.json`) |

## Arquitectura y entrenamiento

El modelo deriva de la voz `news_tts/medium` de Piper, que emplea la arquitectura VITS: un codificador de texto, un prior variacional y un decodificador generativo con normalizacion por flujo, entrenado de extremo a extremo para sintesis de voz. La inferencia requiere ademas el fonemizador eSpeak NG de Piper para convertir texto en fonemas antes de la generacion acustica.

La conversion Q8 almacena 116 tensores de pesos como INT8 por canal y los desquantiza durante la inferencia en coma flotante. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni sobre si hubo ajuste por RLHF o DPO; el modelo base `rhasspy/piper-voices` atribuye los datos de entrenamiento a la voz base Lessac en su model card. El repositorio incluye `provenance.json` con los ficheros fuente fijados y sus sumas SHA-256, lo que permite verificar la trazabilidad de la conversion.

## Capacidades

- Sintesis de voz en indonesio a partir de texto, con salida de audio.
- Conversion de texto a fonemas mediante eSpeak NG (dependencia externa obligatoria).
- Inferencia en navegador con ONNX Runtime Web (probado con 4 hilos WASM).
- Ejecucion en CPU sin GPU, gracias al tamano reducido del fichero acustico.
- Mantiene la interfaz original de Piper: mismas entradas y salidas de la grafica.
- No soporta tool calling, agentes, razonamiento multi-paso ni vision: es exclusivamente un modelo TTS.
- Multilingue limitado: solo indonesio (`id`).

## Casos de uso

- Lectura de noticias en aplicaciones web: el modelo sintetiza titulares y articulos en indonesio directamente en el navegador mediante ONNX Runtime Web, con tiempos de generacion de 2,45-2,82 s para pasajes de 108-128 palabras.
- Accesibilidad en sitios de contenido: conversion de texto a audio para usuarios con discapacidad visual, aprovechando el bajo coste de carga (1,02-1,25 s) y la licencia MIT.
- Asistentes de voz embebidos: integracion en dispositivos de borde con CPU, dado que el fichero acustico ocupa solo 15,75 MiB y no requiere GPU.
- Generacion de audio bajo demanda en servidores: despliegue con piper o onnxruntime para sintetizar respuestas de un chatbot en indonesio con latencia baja.
- Locucion automatizada de boletines: uso de la voz `news_tts` (estilo de noticias) para producir audio de boletines o resumenes periodicos.
- Prototipado rapido de TTS en indonesio: validacion de ideas con un modelo ligero y trazable antes de invertir en modelos mayores.
- Pruebas de calidad con metricas automaticas: el repositorio incluye `benchmark.json` con texto de referencia, tiempos y transcripciones para evaluar el rendimiento con Whisper.

## Benchmarks y rendimiento

Los datos disponibles son del benchmark en navegador (Chromium 143, Apple M1 Pro, ONNX Runtime Web 1.31.1, 4 hilos WASM), con WER medido por Whisper large-v3-turbo FP16:

| Muestra | Palabras | Generacion | Carga | WER (Whisper Turbo) |
|---|---:|---:|---:|---:|
| original-run | 128 | 2,67 s | 1,02 s | 7,81% (10/128) |
| matched-seed | 128 | 2,82 s | 1,25 s | 8,59% (11/128) |
| matched-seed-extra | 108 | 2,45 s | 1,03 s | 9,17% (10/109) |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el benchmark publicado (ejecucion en CPU/WASM); el fichero acustico Q8 ocupa 15,75 MiB.
- GPU recomendadas: no disponibles; el modelo esta disenado para CPU y navegador.
- Cabe en GPU de consumo: si, por el reducido tamano, aunque el benchmark oficial se ejecuto en CPU via WASM.
- Opciones de despliegue: ONNX Runtime Web, onnxruntime, piper (con eSpeak NG).
- Latencia y throughput estimados: generacion de 2,45-2,82 s para 108-128 palabras y carga de 1,02-1,25 s en la configuracion medida (Apple M1 Pro, 4 hilos WASM).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| okasi/piper-indonesian-news-tts-onnx-q8 | no disponible (acustico Q8, 15,75 MiB) | no aplica | WER 7,81-9,17% (benchmark propio) | MIT | Hugging Face |
| rhasspy/piper-voices (id_ID-news_tts-medium, original) | no disponible (acustico 60,03 MiB) | no aplica | no disponible en la informacion | MIT | Hugging Face |
| Otros modelos TTS en indonesio | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta indonesio; no es multilingue.
- Requiere el fonemizador eSpeak NG de Piper; sin el, la inferencia de texto no funciona.
- El fichero de configuracion debe mantenerse junto al modelo con el nombre exacto indicado.
- La cuantizacion INT8 puede introducir perdida de calidad respecto al modelo original; el WER medido (7,81-9,17%) es orientativo y depende del texto y del evaluador.
- Riesgo de errores de pronunciacion en nombres propios, siglas y terminos tecnicos.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta agentes.
- Licencia MIT permite uso comercial, pero conviene verificar la atribucion del modelo base y de los datos de entrenamiento (voz Lessac) en la model card upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okasi/piper-indonesian-news-tts-onnx-q8
- Modelo base: https://huggingface.co/rhasspy/piper-voices
- Model card upstream de la voz: https://huggingface.co/rhasspy/piper-voices/blob/e7229f7d33a10e145e109b886d661984201ac3c4/id/id_ID/news_tts/medium/MODEL_CARD
- Commit de adicion de la voz: https://huggingface.co/rhasspy/piper-voices/commit/67265bba2397cfb86ff687cfc7ffe3a0e3c3aa55
- Arbol de la voz en el repositorio base: https://huggingface.co/rhasspy/piper-voices/tree/67265bba2397cfb86ff687cfc7ffe3a0e3c3aa55/id/id_ID/news_tts/medium
