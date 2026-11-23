# Nothing-Tech-AI-Native/x-asr-zh-en-litert

## Resumen

X-ASR-zh-en-litert es la conversión al formato LiteRT (`.tflite`) del modelo de reconocimiento automático del habla X-ASR-zh-en, un transductor Zipformer bilingüe chino-inglés desarrollado originalmente por el proyecto X-ASR (Gilgamesh-J) bajo licencia Apache-2.0. Esta versión la publica Nothing-Tech-AI-Native y está pensada para inferencia totalmente offline en dispositivo, sin dependencia de frameworks de servidor. No se ha realizado ningún entrenamiento ni ajuste fino: los pesos son los del modelo original, exportados desde la versión ONNX `csukuangfj2/sherpa-onnx-x-asr-zipformer-transducer-zh-en-punct-2026-06-03`.

El modelo resuelve la transcripción de audio bilingüe mandarín-inglés con puntuación y uso de mayúsculas ya incorporados en la salida, algo poco habitual en transductores de este tamaño. La arquitectura es un transductor (encoder Zipformer, decoder stateless y joiner) con un vocabulario de 5.000 tokens, lo que lo sitúa en la gama ligera: el encoder ocupa unos 199 MB y el conjunto completo del repositorio apenas 0,2 GB.

Su relevancia actual reside en el formato: al estar en LiteRT/TFLite con pesos int8 de rango dinámico en el encoder, es directamente desplegable en entornos móviles y embebidos con el runtime de Google, y sirve como alternativa on-device a soluciones basadas en Whisper de mayor tamaño. La ventana de entrada está fijada a 1.000 tramas de características (10 segundos), por lo que el audio largo debe trocearse en ventanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer (encoder + decoder stateless + joiner) |
| Parametros totales | no disponible (pesos: encoder 198,7 MB, decoder 13,4 MB, joiner 10,3 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.000 tramas de características = 10 s de audio por ventana |
| Tipos de cuantizacion | Encoder: int8 de rango dinámico en pesos fully-connected, resto float32; decoder y joiner: float32 |
| Idiomas soportados | Chino (mandarín, simplificado) e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (`.tflite`) + `tokens.txt` |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer, una variante eficiente de arquitectura encoder-decoder para ASR que combina bloques convolucionales y de atención con downsampling progresivo. El encoder recibe características fbank de Kaldi (80 bins mel, 16 kHz, ventana de 25 ms, salto de 10 ms, pre-énfasis 0,97, ventana Povey, sin normalización) con forma `[1, 1000, 80]` y produce `[1, 248, 512]`; el decoder es stateless con tamaño de contexto 2 y estado inicial `[-1, 0]`; el joiner combina ambas salidas en logits sobre 5.000 tokens (blank id 0, `<unk>` id 4015). La decodificación es greedy, con como máximo un símbolo por trama del encoder.

No se ha realizado entrenamiento ni ajuste fino en esta publicación: los pesos provienen del modelo original X-ASR. La conversión consistió en fijar la forma de entrada, plegar los subgrafos de forma a constantes, convertir con `onnx2tf`, reescribir las `BATCH_MATMUL` con pesos constantes como `FULLY_CONNECTED` y aplicar cuantización de rango dinámico a esos pesos; en el decoder se reescribió una convolución agrupada como producto matricial equivalente. El modelo original incorpora puntuación y casing en la salida, capacidades que se conservan en la conversión.

## Capacidades

- Reconocimiento automático del habla offline para mandarín e inglés, incluido audio con mezcla de ambos idiomas.
- Salida con puntuación y mayúsculas en chino simplificado, sin postprocesado externo de puntuación.
- Decodificación greedy en streaming por ventanas de hasta 10 segundos, con recorte o ventaneo del audio más largo.
- Inferencia totalmente local mediante el runtime LiteRT, sin llamadas a red.
- Postprocesado de texto incluido en la especificación: conversión de `▁` a espacio, eliminación de espacios entre caracteres CJK y antes de puntuación.
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción; es un modelo puramente ASR.

## Casos de uso

- Dictado y transcripción en aplicaciones móviles: al ser un `.tflite` de 0,2 GB con encoder int8, puede integrarse en apps Android/iOS mediante LiteRT para transcribir notas de voz de hasta 10 segundos por fragmento, con ventaneo para grabaciones más largas.
- Subtitulado local de reuniones bilingües: el soporte nativo de mezcla chino-inglés y la puntuación integrada permiten generar subtítulos legibles sin un modelo de puntuación adicional.
- Asistentes de voz embebidos: la latencia baja de un transductor ligero y la ausencia de dependencia de servidor lo hacen adecuado para comandos de voz en dispositivos con recursos limitados.
- Transcripción de atención al cliente: para centros con llamadas en mandarín e inglés, el modelo puede procesar fragmentos de audio en pipelines por lotes y producir texto puntuado listo para análisis.
- Indexación y búsqueda de archivos de audio: transcripción offline de archivos de hasta 10 segundos por ventana para construir índices de texto searchable en archivos de podcasts o grabaciones.
- Prototipado e investigación en ASR on-device: sirve como referencia para comparar conversiones LiteRT frente a ONNX/sherpa-onnx, dado que el autor documenta verificaciones de equivalencia y tasas de error.

## Benchmarks y rendimiento

El autor documenta comprobaciones sobre 300 enunciados de datos públicos de test mandarín-inglés (200 de `ky552/ML2021_ASR_ST` y 100 de `CAiRE/ASCEND`):

| Metrica | Resultado |
|---|---|
| Equivalencia encoder float32 LiteRT vs. ONNX float32 | texto idéntico en 300/300 enunciados |
| MER conjunto LiteRT (3 ficheros) en ML2021_ASR_ST | 15,43 % |
| MER conjunto LiteRT (3 ficheros) en ASCEND | 12,18 % |
| MER ONNX int8 con sherpa-onnx en ML2021_ASR_ST | 15,34 % |
| MER ONNX int8 con sherpa-onnx en ASCEND | 11,84 % |

La diferencia en ASCEND se atribuye a tres enunciados de más de 10 segundos que se recortaron en lugar de ventanearse en la comprobación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,25-0,5 GB de memoria para cargar los tres ficheros y ejecutar una ventana de 10 segundos; el encoder int8 de 199 MB domina el consumo.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y aceleradores móviles. En servidor puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos móviles de gama media, dado el tamaño reducido.
- Opciones de despliegue: runtime LiteRT (TensorFlow Lite) para móvil y embebido; para servidor, la alternativa equivalente es sherpa-onnx con el modelo ONNX original.
- Latencia y throughput: no disponibles de forma explícita; el diseño de transductor con decodificación greedy y ventanas de 10 segundos sugiere latencias de decenas a cientos de milisegundos por ventana en CPU moderna, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| X-ASR-zh-en-litert | no disponible (~0,2 GB) | 10 s por ventana | zh, en | Apache-2.0 | LiteRT |
| X-ASR-zh-en (ONNX, sherpa-onnx) | mismos pesos | 10 s por ventana | zh, en | Apache-2.0 | ONNX |
| Whisper small | 244 M | 30 s | multilingüe | MIT | safetensors, GGUF, etc. |
| Whisper base | 74 M | 30 s | multilingüe | MIT | safetensors, GGUF, etc. |

Frente a Whisper, este modelo ofrece ventanas más cortas (10 s frente a 30 s) y un alcance lingüístico limitado a chino e inglés, pero está optimizado para despliegue móvil vía LiteRT y produce puntuación integrada. No se dispone de comparaciones de MER entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Ventana de entrada fija de 10 segundos: el audio más largo debe trocearse en ventanas, con riesgo de pérdida de contexto en las fronteras.
- Solo chino mandarín simplificado e inglés; no cubre otros idiomas ni variantes del chino.
- Modelo pequeño con vocabulario de 5.000 tokens: mayor tasa de error esperable en dominios especializados, nombres propios y acentos no representados en entrenamiento.
- Riesgo de alucinación y errores de puntuación en audio ruidoso o con solapamiento de hablantes; no hay mecanismo de confianza expuesto en la interfaz.
- La cuantización int8 de rango dinámico en el encoder puede degradar ligeramente la precisión frente al float32 en algunos dominios, aunque el autor reporta diferencias pequeñas en sus pruebas.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución al proyecto X-ASR original y revisarse la licencia del modelo base.
- No incluye detección de actividad de voz ni diarización; el pipeline debe aportarlas externamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nothing-Tech-AI-Native/x-asr-zh-en-litert
- Modelo base: https://huggingface.co/GilgameshWind/X-ASR-zh-en
- Repositorio X-ASR: https://github.com/Gilgamesh-J/X-ASR
- Export ONNX de referencia: https://huggingface.co/csukuangfj2/sherpa-onnx-x-asr-zipformer-transducer-zh-en-punct-2026-06-03
- Dataset de evaluación ML2021_ASR_ST: https://huggingface.co/datasets/ky552/ML2021_ASR_ST
- Dataset de evaluación ASCEND: https://huggingface.co/datasets/CAiRE/ASCEND
