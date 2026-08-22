# ayousanz/kodama-ja-streaming-small

## Resumen

kodama-ja-streaming-small es un modelo de reconocimiento automático del habla (ASR) en japonés, desarrollado de forma independiente por ayousanz mediante un ajuste fino completo de `moonshine-ai/moonshine-streaming-small` sobre las 35.000 horas del corpus ReazonSpeech v2. El modelo está diseñado específicamente para inferencia en CPU, con baja latencia y capacidad de streaming en tiempo real, lo que lo hace adecuado para despliegue en dispositivos locales y embebidos.

El modelo conserva la arquitectura original de Moonshine Streaming (encoder y decoder de 10 capas, vocabulario de 32.768 tokens, audio de 16 kHz) y cuenta con 140,1 millones de parámetros. Incluye además tres grafos de despliegue ONNX/ORT (323,6 MB en total) para su ejecución eficiente en CPU. La licencia es Apache-2.0, aunque el modelo base original es MIT.

La relevancia de este modelo radica en que ofrece una alternativa japonesa de código abierto con licencia permisiva, centrada en dominios específicos como voz emocional, diálogo y caracteres, donde supera a la versión oficial `moonshine-base-ja` en varios benchmarks. No obstante, el autor advierte que no es un reemplazo generalista y que tiene debilidades notables en ruido, habla general y nombres propios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine Streaming (Encoder/Decoder de 10 capas, vocabulario de 32.768 tokens, 16 kHz) |
| Parametros totales | 140.135.225 (140,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | int8 dinámico para el decoder step (ONNX), encoder en float (int8 no recomendado por pérdida de precisión) |
| Idiomas soportados | japonés |
| Licencia | Apache-2.0 (base original MIT) |
| Formato de pesos | safetensors (F32, 560.571.260 bytes, 262 tensores), ONNX, ORT |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Moonshine Streaming, que es un transformer encoder-decoder de 10 capas en cada bloque, con vocabulario de 32.768 tokens y audio de entrada a 16 kHz. El fine-tuning se realizó sobre el corpus completo de ReazonSpeech v2 (35.000 horas de audio japonés) sin modificar la arquitectura ni el tokenizador del modelo base. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado de ASR estándar.

Una innovación destacable es la inclusión de tres grafos ONNX para despliegue eficiente: un encoder acústico en float (207,9 MB), un prefill de cross-attention KV (32,5 MB) y un paso de decoder con cuantización int8 dinámica (83,1 MB) que mantiene el CER sin degradación. El autor advierte que estos grafos no son compatibles con el runtime oficial de Moonshine.

## Capacidades

- Reconocimiento de voz en japonés con streaming de baja latencia, pensado para CPU y dispositivos locales.
- Generación de transcripciones en tiempo real con primeros resultados parciales disponibles de forma mucho más rápida que alternativas como Vosk.
- Especialización en dominios concretos: voz de caracteres, voz emocional y diálogos.
- Soporte de despliegue con Transformers para inferencia offline y con ONNX Runtime para streaming de baja latencia.
- Incluye grafos ORT pre-optimizados para móvil o embebido.
- No soporta tool calling, agentes ni razonamiento multi-paso al ser un modelo ASR puro.

## Casos de uso

- Transcripción de voz de anime y juegos: el modelo muestra mejoras relativas del 16-43 % frente a `moonshine-base-ja` en conjuntos de voz emocional y de caracteres (JVNV, SpeechBSD), por lo que es adecuado para subtitulado automático de contenido con voces expresivas.
- Diálogos y conversaciones: en SpeechBSD, una métrica de diálogo, supera al base en un 16 % relativo, lo que lo hace útil para sistemas de transcripción de reuniones o conversaciones telefónicas en japonés.
- Asistente de voz en dispositivos embebidos: con los grafos ONNX de 324 MB y soporte para CPU, puede desplegarse en Raspberry Pi u otros dispositivos de bajo consumo para comandos de voz locales.
- Transcripción en tiempo real en entornos de streaming: el modelo ofrece primeros resultados parciales aproximadamente 5,3 veces más rápido que `vosk-model-small-ja-0.22`, lo que lo hace viable para subtitulado en directo.
- Análisis de voz de personajes en producción de contenido: para creadores que necesitan transcribir voces de personajes o actuaciones emocionales, el modelo muestra mejor rendimiento que la alternativa base.
- Prototipado de aplicaciones de voz japonesas con licencia Apache-2.0: al ser de código abierto y con permisos comerciales, puede integrarse en productos propietarios sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas CER comparativas frente a `moonshine-base-ja` (61,5 M, no streaming) en varios conjuntos, pero no hay tabla de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de texto. Los resultados reportados son los siguientes:

| Conjunto | n | moonshine-base-ja | kodama (ours) | Delta | Intervalo de confianza 95% | Significancia |
|---|---:|---:|---:|---:|---|---|
| jvnv_free | 240 | 0.1121 | 0.0638 | -0.0483 | [-0.0698, -0.0271] | Ventaja significativa (-43 %) |
| jvnv_regular | 800 | 0.1415 | 0.0968 | -0.0447 | [-0.0578, -0.0319] | Ventaja significativa (-32 %) |
| speechbsd | 800 | 0.1320 | 0.1108 | -0.0213 | [-0.0363, -0.0069] | Ventaja significativa (-16 %) |
| dom_g (PRIMARY) | 629 | 0.1472 | 0.1567 | +0.0095 | [-0.0063, +0.0245] | Sin diferencia significativa |
| short | 130 | 0.1168 | 0.1448 | +0.0281 | [+0.0046, +0.0517] | Desventaja |
| propn | 248 | 0.1354 | 0.1695 | +0.0341 | no disponible | Desventaja |

Nota: el autor indica que la evaluación usa CER como métrica principal, con normalización de texto común y bootstrap pareado para significancia. Los datos de la tabla se han extraído de la model card; los valores de la fila `propn` están incompletos en la fuente.

## Requisitos de hardware

- VRAM estimada: para inferencia offline con Transformers, el modelo en F32 ocupa unos 560 MB en memoria; en CPU no requiere VRAM.
- GPU recomendadas: no especificado; el modelo está pensado para CPU, aunque puede ejecutarse en CUDA si está disponible.
- Compatible con GPU de consumo: sí, cualquier GPU con suficiente memoria (por ejemplo, RTX 3060 o superior) puede ejecutar el modelo en F32.
- Opciones de despliegue: Transformers (offline), ONNX Runtime con los grafos incluidos (streaming), formato ORT para móvil/embebido.
- Latencia y throughput: no se proporcionan valores absolutos; el autor reporta que los primeros resultados parciales llegan ~5,3 veces más rápido que `vosk-model-small-ja-0.22`. La latencia de streaming medida es con ONNX Runtime, no con Transformers.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kodama-ja-streaming-small (este) | 140,1 M | 16 kHz audio | Apache-2.0 | Hugging Face | Streaming, ONNX, especializado en voz emocional |
| moonshine-base-ja (oficial) | 61,5 M | 16 kHz audio | MIT | Hugging Face | No streaming, mejor en general, peor en dominios específicos |
| vosk-model-small-ja-0.22 | 48 MB | no disponible | no disponible | Vosk | Más lento en primeros resultados, peor CER en 6 conjuntos evaluados |
| vosk-model-ja-0.22 | 1 GB | no disponible | no disponible | Vosk | Mejor en 5 de 6 conjuntos que este modelo, pero a 1/3 del tamaño |

## Limitaciones y advertencias

- Ruido: es la mayor debilidad del modelo; añade +0.1033 CER frente a `moonshine-base-ja` con SNR de 10 dB.
- No es un reemplazo generalista: es peor que `moonshine-base-ja` en habla general (FLEURS), pronunciación de palabras cortas y nombres propios.
- Coste del streaming: el modo streaming añade +0.0538 CER frente a la inferencia offline.
- Riesgo de alucinación: la tasa de alucinación (hallucination_rate) es de 0,10-0,12 en varios conjuntos y no mejoró al añadir más datos.
- Los grafos ONNX incluidos no son compatibles con el runtime oficial de moonshine-voice; es necesario usar el código del propio autor.
- El modelo no es un producto de Moonshine AI ni está respaldado por la empresa original.
- La model card indica que el conteo de parámetros del modelo base está documentado como 123 M, pero la medición real de safetensors es 140,1 M; el autor no modificó la arquitectura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayousanz/kodama-ja-streaming-small
- Modelo base original: https://huggingface.co/moonshine-ai/moonshine-streaming-small
- Dataset de entrenamiento: https://huggingface.co/datasets/reazon-research/reazonspeech
- Blog del autor (desarrollo de piper-plus, TTS): https://ayousanz.hatenadiary.jp/entry/2026/03/22/195837
- Blog del autor (mejoras de piper-plus): https://ayousanz.hatenadiary.jp/entry/2025/10/17/090204
- Blog del autor (piper-plus en Python): https://ayousanz.hatenadiary.jp/entry/2025/09/25/211231
- Perfil del autor en HuggingFace: https://huggingface.co/ayousaur
