# kukumonster/FireRedPunc-coreml

## Resumen

FireRedPunc-coreml es una conversión no oficial a Core ML (float16) de FireRedTeam/FireRedPunc, un modelo de puntuación automática para chino que inserta signos de puntuación (，。？！) en texto sin puntuar. El modelo original lo desarrolla FireRedTeam en el contexto del sistema FireRedASR2S, un sistema industrial de reconocimiento automático del habla, y esta conversión la publica el usuario kukumonster para su uso en dispositivos Apple. El problema que resuelve es concreto: la salida de los sistemas ASR suele carecer de puntuación, y este modelo la restituye token a token.

Arquitectónicamente es un modelo de clasificación de tokens basado en un encoder BERT (chinese-lert-base de HFL) con una cabeza que predice, para cada token, una de cinco clases: sin signo, coma, punto, interrogación o exclamación. La ventana de entrada va de 2 a 512 tokens y el vocabulario es el de hfl/chinese-bert-wwm-ext. Los pesos se distribuyen como un paquete Core ML de unos 203 MB, con objetivo mínimo macOS 15.

Su relevancia es práctica: permite ejecutar la puntuación en local dentro del ecosistema Apple, sin depender de servicios en la nube, manteniendo la licencia Apache-2.0 del modelo original. No obstante, se trata de una conversión de pesos sin reentrenamiento, orientada a un caso de uso muy específico (texto chino procedente de ASR) y con soporte limitado a chino e inglés según los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (chinese-lert-base) con cabeza de clasificación de tokens; convertido a programa Core ML |
| Parametros totales | no disponible (pesos en float16 de 203.378.752 bytes, ~101,7 M parámetros efectivos en float16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2 a 512 tokens de entrada (sin máscara de atención; una pieza de texto por inferencia) |
| Tipos de cuantizacion | float16 (única versión publicada) |
| Idiomas soportados | chino (zh) e inglés (en) según metadatos; el uso previsto es puntuación de chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (ML program, float16); `vocab.txt` en texto plano |

## Arquitectura y entrenamiento

El modelo subyacente es FireRedPunc, construido sobre el encoder chinese-lert-base de HFL y con el vocabulario de chinese-bert-wwm-ext. La tarea es de token classification: para cada token de entrada se predicen cinco clases (ninguno, ，, 。, ？, ！) y cada signo predicho se coloca inmediatamente después de su token. La entrada es `input_ids` de tipo Int32 con forma `[1, L]`, L entre 2 y 512, donde la posición 0 es `[CLS]` y no se incluye `[SEP]`. La salida es `logits` con forma `[1, L, 5]`.

Esta conversión concreta no introduce entrenamiento ni cambios de pesos: se trazó y convirtió con torch 2.7 y coremltools 9 a un ML program en float16 a partir del checkpoint `model.pth.tar` del modelo original (commit `e448fd967f44182a1c323cc30f5d89f2400c28da`). El autor de la conversión reporta que, sobre su propio texto de desarrollo (fragmentos de unos 60 caracteres de salida de reconocimiento del habla), el 99,93 % de los tokens reciben la misma clase predicha que el modelo PyTorch en float32. Es una medición propia del conversor, no de los autores originales. Un detalle técnico destacable: se eliminó la entrada de máscara de atención porque, con máscara, la operación `(1 - mask) * float32.min` de BERT desborda a -inf en float16 y produce logits NaN.

## Capacidades

- Puntuación automática de texto chino sin puntuar: inserta comas, puntos, interrogaciones y exclamaciones token a token.
- Clasificación de tokens con salida de logits por token (5 clases), lo que permite umbrales y postprocesado personalizados.
- Procesamiento de fragmentos de hasta 512 tokens, adecuado para segmentos de ASR.
- Uso en dispositivos Apple mediante Core ML, con objetivo mínimo macOS 15.
- Idiomas declarados: chino e inglés; el entrenamiento y el uso previsto se centran en chino.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo discriminativo de puntuación, no generativo.

## Casos de uso

- Puntuación de transcripciones ASR en apps de notas de voz para macOS: el modelo recibe cada fragmento de salida del reconocedor (hasta 512 tokens) y devuelve el texto con comas, puntos, interrogaciones y exclamaciones insertados en local, sin enviar audio ni texto a la nube.
- Subtitulado y postprocesado de vídeo en pipelines de edición para Apple: se puntúan los segmentos transcritos antes de exportar subtítulos, mejorando la legibilidad sin depender de servicios externos.
- Preprocesado de corpus chinos para NLP: normalización de texto sin puntuar procedente de foros, chats o OCR antes de alimentar modelos posteriores de análisis o traducción.
- Transcripción de reuniones en herramientas internas para macOS: integración del `.mlpackage` en una app Swift que puntúa la salida del ASR por turnos de habla.
- Accesibilidad: generación de texto puntuado a partir de dictado por voz para usuarios con dificultades motoras, ejecutándose íntegramente en el dispositivo.
- Investigación y evaluación de modelos de puntuación: al exponer logits por token, sirve como referencia para comparar estrategias de postprocesado o umbrales frente al modelo PyTorch original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la concordancia del 99,93 % de tokens con el modelo PyTorch float32 sobre el texto de desarrollo del conversor, que no equivale a una métrica de calidad de puntuación (precisión, recall o F1) ni ha sido validada por los autores originales.

## Requisitos de hardware

- Inferencia en dispositivos Apple con macOS 15 o superior; el paquete Core ML está pensado para ejecutarse en CPU, GPU o Neural Engine del dispositivo.
- Tamaño de pesos de unos 203 MB en float16, lo que permite ejecución en equipos de consumo Apple (Mac con Apple Silicon, portátiles recientes) sin requisitos de VRAM dedicada.
- No aplica el concepto de VRAM de GPU NVIDIA: el despliegue es mediante Core ML, no mediante vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Para uso fuera de Apple sería necesario recurrir al modelo original FireRedPunc en PyTorch, no a esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FireRedPunc-coreml (este) | ~101,7 M en float16 | 2-512 tokens | Core ML | Apache-2.0 | Conversión no oficial; solo Apple; sin máscara de atención |
| FireRedTeam/FireRedPunc | no disponible | no disponible | PyTorch | Apache-2.0 | Modelo original; multiplataforma; referencia de calidad |
| hfl/chinese-lert-base | no disponible | no disponible | PyTorch | Apache-2.0 | Encoder base sin cabeza de puntuación; no resuelve la tarea por sí solo |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por FireRedTeam ni por HFL; los usuarios deben remitirse al modelo original para cualquier garantía.
- Solo predice cuatro signos (，。？！); no genera otros signos como punto y coma, dos puntos, comillas o paréntesis.
- Sin máscara de atención: procesa una pieza de texto por inferencia y no admite padding por lotes; el texto debe segmentarse antes de la llamada.
- Objetivo mínimo macOS 15, lo que excluye versiones anteriores del sistema y otras plataformas.
- Riesgo de errores en texto ambiguo o dominios distintos del ASR; la concordancia del 99,93 % es una medición interna del conversor y no una garantía de calidad.
- Idiomas: aunque los metadatos declaran chino e inglés, el modelo está entrenado para puntuación china; su uso en inglés no está validado.
- Posibles sesgos heredados del corpus de entrenamiento original (no documentados en la información disponible) y riesgo de puntuación incorrecta en texto con ruido, jerga o errores de OCR/ASR.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución a FireRedPunc, LERT y Chinese BERT-wwm según indica el repositorio.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/kukumonster/FireRedPunc-coreml
- Modelo original: https://huggingface.co/FireRedTeam/FireRedPunc
- Encoder LERT: https://huggingface.co/hfl/chinese-lert-base
- Vocabulario Chinese BERT-wwm: https://huggingface.co/hfl/chinese-bert-wwm-ext
- Paper citado (FireRedASR2S): arXiv:2603.10420
