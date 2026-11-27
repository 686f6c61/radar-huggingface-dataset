# rawmind/whisper-small-sr-distill-v3

## Resumen

Whisper-small-sr-distill-v3 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario rawmind, consistente en una destilación de Whisper large-v3-turbo sobre la arquitectura de Whisper small, especializada en serbio y croata. El modelo parte de los pesos de openai/whisper-small (241,7 millones de parámetros) y se ha afinado para reducir la tasa de error de palabra en estas dos lenguas eslavas del sur, manteniendo el tamaño y la velocidad del modelo small original. La versión v3 se distingue de la v2 por entrenarse sobre versiones ruidosas y reverberantes del audio conservando los objetivos del profesor en el clip limpio, lo que mejora la robustez frente al ruido y reduce las palabras omitidas en ventanas de streaming.

El modelo resuelve un problema concreto: Whisper small original comete errores muy elevados en serbio y croata (entre 28 y 68 % de WER según la condición), y la detección automática de idioma es poco fiable en estas lenguas. La destilación desde large-v3-turbo permite acercarse al rendimiento del profesor con un coste computacional mucho menor: en cuantización q8_0 ocupa 264 MB, lo que lo hace desplegable en CPU y en entornos con recursos limitados mediante whisper.cpp.

Es relevante ahora porque demuestra que la destilación de un modelo grande a uno pequeño puede cerrar buena parte de la brecha en lenguas de bajos recursos, con un enfoque orientado explícitamente al streaming (ventanas de 8 a 12 segundos) y a la transcripción de audio real de parlamentos. La licencia CC-BY-SA 4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), destilado de large-v3-turbo |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (estándar Whisper); en streaming se usan ventanas de 8-12 s |
| Tipos de cuantizacion | q8_0 (264 MB) documentada; f16 en el modelo base; otras cuantizaciones GGUF estándar de whisper.cpp no verificadas |
| Idiomas soportados | sr (serbio), hr (croata), en (inglés, no reentrenado) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (transformers); compatible con whisper.cpp (GGUF) |

## Arquitectura y entrenamiento

El modelo es un Whisper small estándar (transformer encoder-decoder con 241,7 millones de parámetros) que se ha destilado a partir de Whisper large-v3-turbo. La destilación utiliza los objetivos (targets) del profesor sobre el mismo audio limpio, mientras que el estudiante ve versiones ruidosas y reverberantes del clip, de modo que aprende a producir la transcripción del profesor incluso con degradación acústica. Los datos de entrenamiento provienen de google/fleurs, classla/ParlaSpeech-RS y classla/ParlaSpeech-HR, es decir, habla leída limpia y grabaciones parlamentarias reales de Serbia y Croacia. Se excluyeron de entrenamiento los hablantes y fechas de test, así como las frases de test.

La innovación principal respecto a la v2 es el entrenamiento con ruido sintético (ruido blanco y marrón, no rosa) manteniendo los targets limpios del profesor, lo que mejora la robustez frente a ruido estacionario y reduce el número de palabras omitidas cuando el audio llega en ventanas de streaming que empiezan a mitad de una frase. No se documentan detalles sobre el número exacto de tokens de entrenamiento, la composición precisa del dataset ni el uso de RLHF o DPO. El código de entrenamiento y los resultados en bruto están publicados en el repositorio de GitHub del autor.

## Capacidades

- Reconocimiento automático del habla (transcripción) en serbio y croata, con soporte heredado de inglés.
- Destilación orientada a streaming: procesa ventanas de 8 a 12 segundos y mantiene los segmentos que terminan al menos 1 segundo antes del final de la ventana, fusionando el texto.
- Robustez mejorada frente a ruido estacionario sintético (blanco y marrón en entrenamiento; validado con ruido rosa).
- Menor tasa de omisión de palabras al inicio de ventanas que comienzan a mitad de habla, en comparación con la v2.
- Compatible con whisper.cpp (incluida la cuantización q8_0) y con la librería transformers.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio más allá de ASR, ni modo de razonamiento.

## Casos de uso

- Transcripción de sesiones parlamentarias: el modelo se entrenó con ParlaSpeech-RS y ParlaSpeech-HR y obtiene WER de 9,6 % en serbio y 16,6 % en croata en habla parlamentaria real, por lo que es adecuado para transcribir plenos y debates con vocabulario y acústica similares.
- Subtitulado en directo con ventanas deslizantes: integrado en el pipeline Titl (ventanas de 8-12 s con detección de voz), permite generar subtítulos en serbio y croata con WER de 15,9-25,4 % en streaming, muy inferior al 30-38 % de Whisper small.
- Transcripción de audio con ruido de fondo: con ruido rosa a 5 dB, el modelo logra 25,8 % de WER en serbio y 37,7 % en croata, frente a 50,5 % y 68,3 % de Whisper small, lo que lo hace útil para grabaciones de campo, entrevistas o entornos no controlados.
- Despliegue en CPU y dispositivos de bajos recursos: en q8_0 ocupa 264 MB y funciona en whisper.cpp, por lo que puede ejecutarse en servidores sin GPU o en estaciones de trabajo modestas para transcripción por lotes.
- Archivado y búsqueda de contenido audiovisual en serbio y croata: la transcripción permite indexar y buscar en archivos de radio, televisión o podcasts de estas lenguas, donde Whisper small original produce demasiados errores.
- Preprocesamiento para pipelines de NLP en lenguas eslavas del sur: las transcripciones alimentan sistemas de resumen, traducción o análisis de sentimiento, con una calidad suficiente para tareas downstream en serbio y croata.
- Evaluación comparativa de ASR en lenguas de bajos recursos: sirve como referencia ligera para medir mejoras de destilación y de robustez frente a ruido en investigaciones sobre ASR multilingüe.

## Benchmarks y rendimiento

Resultados de WER (%) en whisper.cpp 1.9.6 con Metal. v2 y v3 en q8_0; small y large-v3-turbo en f16.

Streaming (texto cosido de 150 clips parlamentarios por lengua):

| Flujo | Alimentación, contexto | Whisper small | v2 | v3 | large-v3-turbo |
|---|---|---|---|---|---|
| Serbio, 30,7 min | rápida, completo | 32,9 | 22,1 | 18,1 | 12,9 |
| | rápida, corto | 33,2 | 22,4 | 20,3 | 15,4 |
| | backlog, completo | 30,0 | 21,7 | 15,9 | 11,6 |
| | backlog, corto | 30,3 | 17,7 | 17,7 | 13,0 |
| Croata, 28,3 min | rápida, completo | 38,4 | 28,7 | 24,5 | 15,3 |
| | rápida, corto | 38,2 | 29,9 | 25,4 | 19,9 |
| | backlog, completo | 36,2 | 25,9 | 21,3 | 15,4 |
| | backlog, corto | 36,2 | 25,8 | 22,0 | 16,5 |

Pruebas por frases, serbio:

| Test serbio | Clips | Whisper small | v2 | v3 | v3 vs v2 (95%) | large-v3-turbo |
|---|---|---|---|---|---|---|
| FLEURS, habla leída limpia | 400 | 38,1 | 17,3 | 17,4 | +0,1 (−0,6 a +0,7) | 13,2 |
| Parlamento, habla real | 150 | 28,5 | 10,6 | 9,6 | −0,9 (−1,6 a −0,2) | 10,1 |
| FLEURS + ruido rosa, 10 dB | 100 | 43,0 | 22,4 | 20,3 | −2,1 (−3,8 a −0,4) | 16,9 |
| FLEURS + ruido rosa, 5 dB | 100 | 50,5 | 28,7 | 25,8 | −2,8 (−4,5 a −1,3) | 19,9 |
| FLEURS, contexto acortado | 100 | 39,3 | 16,5 | 16,9 | +0,4 (−0,9 a +1,8) | 22,1 |
| Parlamento, contexto acortado | 100 | 27,4 | 11,4 | 10,9 | −0,5 (−1,4 a +0,4) | 15,9 |

Pruebas por frases, croata:

| Test croata | Clips | Whisper small | v2 | v3 | v3 vs v2 (95%) | large-v3-turbo |
|---|---|---|---|---|---|---|
| FLEURS, habla leída limpia | 400 | 35,5 | 18,0 | 18,4 | +0,4 (−0,3 a +1,2) | 11,4 |
| Parlamento, habla real | 150 | 33,1 | 15,7 | 16,6 | +0,9 (−0,1 a +1,9) | 13,6 |
| FLEURS + ruido rosa, 10 dB | 100 | 51,8 | 29,8 | 26,3 | −3,5 (−5,5 a −1,5) | 17,7 |
| FLEURS + ruido rosa, 5 dB | 100 | 68,3 | 47,5 | 37,7 | −9,9 (−12,4 a −7,2) | 29,9 |
| FLEURS, contexto acortado | 100 | 35,8 | 18,0 | 19,1 | +1,1 (−1,0 a +3,5) | 16,7 |
| Parlamento, contexto acortado | 100 | 33,5 | 15,2 | 15,4 | +0,2 (−1,0 a +1,6) | 17,4 |

Según el autor, la v3 mejora a Whisper small entre 16 y 31 puntos en todas las pruebas y reduce los errores entre un 36 y un 45 % en streaming. El ruido de prueba es rosa, no usado en entrenamiento, por lo que la robustez demostrada es frente a ruido sintético estacionario, no frente a grabaciones reales. Los resultados parlamentarios son optimistas porque comparten vocabulario, acústica y estilo con el entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 241,7 millones de parámetros, en f16 requiere aproximadamente 0,5 GB y en q8_0 unos 264 MB, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; los benchmarks se ejecutaron en whisper.cpp con Metal (Apple Silicon). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU y CPU, dado su reducido tamaño.
- Opciones de despliegue: whisper.cpp (incluida la versión 1.9.6 con Metal), transformers, whisper-server para streaming con detección de voz (Silero VAD); no se documenta soporte explícito de vLLM ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; el autor indica que en GPU se obtienen ventanas de unos 8 s y en CPU lenta ventanas de 12 s (modo backlog). En q8_0 el modelo es de 264 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER serbio (FLEURS limpio) | WER croata (FLEURS limpio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-small-sr-distill-v3 | 241,7 M | 30 s audio | 17,4 | 18,4 | cc-by-sa-4.0 | Hugging Face |
| openai/whisper-small | 241,7 M | 30 s audio | 38,1 | 35,5 | MIT (según modelo original) | Hugging Face |
| rawmind/whisper-small-sr-distill-v2 | 241,7 M | 30 s audio | 17,3 | 18,0 | cc-by-sa-4.0 | Hugging Face |
| openai/whisper-large-v3-turbo | no disponible en la información | 30 s audio | 13,2 | 11,4 | MIT (según modelo original) | Hugging Face |

La v3 es prácticamente igual a la v2 en habla limpia, pero mejor en ruido y en streaming. Frente a large-v3-turbo, la v3 queda por detrás en habla limpia y ruidosa, aunque se acerca en habla parlamentaria serbia y supera a turbo con contexto acortado en varias condiciones. La licencia de los modelos originales de OpenAI no se detalla en la información proporcionada.

## Limitaciones y advertencias

- Es obligatorio fijar el idioma (`-l sr` o `-l hr`); la detección automática de idioma no se reentrenó y en la v2 clasificaba la mayoría del habla serbia y croata como inglés.
- El modelo escribe texto sobre silencio: en clips sin habla (silencio digital o ruido) genera texto, igual que la v2 y turbo. Se recomienda usar detección de voz, como `--vad` de whisper.cpp con Silero.
- El inglés no se reentrenó; la v2 obtenía 8,3 % en 100 clips de FLEURS frente a 7,0 % de Whisper small, por lo que el rendimiento en inglés es inferior al del modelo base.
- Otros idiomas no se han probado y probablemente sean peores que Whisper small.
- No se ha probado con música ni con varias personas hablando a la vez.
- La robustez frente a ruido se validó con ruido rosa sintético, no con grabaciones reales; el autor advierte que esto demuestra robustez frente a ruido estacionario sintético.
- Los resultados parlamentarios son optimistas porque el test comparte vocabulario, acústica y estilo con el entrenamiento; se recomienda probar con audio propio.
- Las transcripciones parlamentarias son registros oficiales y no siempre literales, por lo que conviene comparar modelos entre sí en lugar de leer los totales como valores absolutos.
- Licencia CC-BY-SA 4.0: permite uso comercial con atribución y obligación de compartir las obras derivadas bajo la misma licencia; no permite añadir restricciones adicionales.
- Riesgo de alucinación y de omisión de palabras en ventanas que empiezan a mitad de habla, aunque la v3 reduce las omisiones respecto a la v2.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rawmind/whisper-small-sr-distill-v3
- Versión anterior v2: https://huggingface.co/rawmind/whisper-small-sr-distill-v2
- Código de entrenamiento y resultados: https://github.com/rawmind/whisper-distill-sr
- Pipeline de streaming Titl: https://github.com/rawmind/titl
- Modelo base: https://huggingface.co/openai/whisper-small
- VAD Silero para whisper.cpp: https://huggingface.co/ggml-org/whisper-vad
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset ParlaSpeech-RS: https://huggingface.co/datasets/classla/ParlaSpeech-RS
- Dataset ParlaSpeech-HR: https://huggingface.co/datasets/classla/ParlaSpeech-HR
