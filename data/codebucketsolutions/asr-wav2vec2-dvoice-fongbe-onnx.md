# codebucketsolutions/asr-wav2vec2-dvoice-fongbe-onnx

## Resumen

El modelo `codebucketsolutions/asr-wav2vec2-dvoice-fongbe-onnx` es una exportación a formato ONNX del modelo de reconocimiento automático del habla `speechbrain/asr-wav2vec2-dvoice-fongbe`, desarrollado originalmente por el equipo de SpeechBrain para la transcripción de fongbe, una lengua gbe hablada principalmente en Benín. La exportación la firma el usuario `codebucketsolutions` y está pensada para ejecutarse sin PyTorch, dentro del servidor de voz `bolo` (repositorio `cB-Sigma/bolo-speech`). Los pesos son idénticos a los del modelo original; no hay reentrenamiento ni ajuste fino adicional.

La arquitectura subyacente es wav2vec 2.0 con cabecera CTC, basada en la arquitectura XLSR-53 y afinada para fongbe. El grafo ONNX incluye el encoder `EncoderASR` de SpeechBrain, una red DNN de tres capas, la capa CTC y la log-softmax. La entrada es un `wav` float32 de forma `[1, T]` mono a 16 kHz, y la salida son log-probabilidades `[1, frames, tokens]` con un frame cada 20 ms. El modelo tiene una relevancia acotada pero clara: cubre una lengua de bajos recursos con una licencia permisiva y un artefacto listo para producción sin dependencia de PyTorch.

El modelo se publicó el 21 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes. El repositorio ocupa 1,3 GB e incluye el grafo ONNX, el vocabulario SentencePiece, el JSON de metadatos y el script de exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (XLSR-53) + DNN de 3 capas + CTC, exportado a ONNX |
| Parametros totales | no disponible (el modelo base es XLSR-53, aproximadamente 300 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio de longitud variable; sin límite fijo documentado) |
| Tipos de cuantizacion | no disponible (el grafo publicado es float32, opset 17) |
| Idiomas soportados | fongbe (`fon`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`asr.onnx`, opset 17, float32) + `tokens.txt` (SentencePiece) + `speechbrain_onnx.json` |

## Arquitectura y entrenamiento

El modelo original es un wav2vec 2.0 de la familia XLSR-53 afinado con CTC para fongbe. XLSR-53 es un modelo preentrenado de forma autosupervisada sobre audio multilingüe y después ajustado de forma supervisada con transcripciones. La exportación a ONNX reproduce el encoder `EncoderASR` de SpeechBrain: el extractor wav2vec 2.0, una DNN de tres capas, la proyección CTC y la log-softmax. La normalización que SpeechBrain aplica sobre la forma de onda y sobre la salida del encoder con `layer_norm` de la propia forma de la entrada se reimplementa en el grafo con medias y varianzas, de modo que la longitud de la secuencia queda libre en tiempo de inferencia.

El entrenamiento lo realizó el equipo de SpeechBrain sobre el habla fongbe de ALFFA/FFSTC tal como la empaqueta DVoice 2.0. SpeechBrain reporta un WER del 9,00 % y un CER del 3,98 % sobre el conjunto de test de fongbe de DVoice 2.0. La exportación no modifica los pesos; el autor documenta una comprobación de paridad frente a SpeechBrain 1.1.2 con torch 2.15.0+cpu y ONNX Runtime 1.32.0 sobre el clip de ejemplo del repositorio original (3,04 s): diferencia máxima absoluta en log-probabilidades de 5,93e-04, misma mejor ruta CTC y misma transcripción (`távo è un xɔ ɔ́ cí glijaà`). La decodificación es greedy, como en SpeechBrain (`ctc_greedy_decode`, blank 0), uniendo las piezas SentencePiece, donde `▁` marca inicio de palabra.

## Capacidades

- Reconocimiento automático del habla (ASR) en fongbe a partir de audio mono a 16 kHz.
- Salida CTC con log-probabilidades por frame (un frame cada 20 ms) y vocabulario SentencePiece.
- Ejecución sin PyTorch mediante ONNX Runtime, lo que simplifica el despliegue en servidores ligeros.
- Longitud de audio variable: el grafo calcula las normalizaciones con medias y varianzas para no fijar la longitud de la secuencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: está especializado exclusivamente en fongbe.
- No dispone de modo thinking, visión ni audio de salida.

## Casos de uso

- Transcripción de audio en fongbe en servicios de voz: el modelo recibe el `wav` y devuelve log-probabilidades CTC que se decodifican de forma greedy, adecuado para integrarse en un servidor de ASR como `bolo` sin arrastrar PyTorch.
- Subtitulado automático de contenido en fongbe: la salida por frames cada 20 ms permite alinear la transcripción con la línea temporal del audio para generar subtítulos.
- Digitalización de archivos orales: grabaciones de campo en fongbe pueden transcribirse por lotes con ONNX Runtime en CPU, reduciendo la dependencia de infraestructura GPU.
- Investigación en lenguas de bajos recursos: sirve como línea base reproducible para experimentos de ASR en fongbe con una licencia Apache-2.0 y un artefacto de paridad documentada frente al original.
- Integración en asistentes de voz locales: al ejecutarse en ONNX Runtime, encaja en despliegues de borde o en servidores sin stack de PyTorch.
- Preservación lingüística: permite generar corpus transcritos de fongbe a partir de audio existente para su estudio o publicación.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del modelo original reportados por SpeechBrain sobre el test de fongbe de DVoice 2.0.

| Metrica | Valor |
|---|---|
| WER (DVoice 2.0, fongbe, test) | 9,00 % |
| CER (DVoice 2.0, fongbe, test) | 3,98 % |

Paridad de la exportación ONNX frente a SpeechBrain 1.1.2 (clip de ejemplo de 3,04 s):

| Clip | Diferencia max. abs. en log-probabilidades | Misma mejor ruta | Mismo texto |
|---|---|---|---|
| example_fongbe.wav (3,04 s) | 5,93e-04 | si | si |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el grafo es float32 y el repositorio ocupa 1,3 GB, por lo que se requiere memoria suficiente para cargar el grafo y los buffers de activación.
- GPU recomendadas: no disponible. El autor documenta la ejecución en CPU con ONNX Runtime 1.32.0.
- Cabe en GPU de consumo: no confirmado en la información proporcionada; por tamaño del artefacto es plausible, pero no hay dato verificado.
- Opciones de despliegue: ONNX Runtime (versión documentada 1.32.0); el servidor `bolo` (`cB-Sigma/bolo-speech`) es el entorno de referencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codebucketsolutions/asr-wav2vec2-dvoice-fongbe-onnx | no disponible (base XLSR-53) | audio de longitud variable | WER 9,00 %, CER 3,98 % (DVoice 2.0 fongbe) | Apache-2.0 | ONNX en Hugging Face |
| speechbrain/asr-wav2vec2-dvoice-fongbe | no disponible (base XLSR-53) | audio de longitud variable | WER 9,00 %, CER 3,98 % (DVoice 2.0 fongbe) | Apache-2.0 | PyTorch/SpeechBrain en Hugging Face |
| Otros modelos ASR para fongbe | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original y a su exportación, ya que no se dispone de datos verificados de alternativas comparables para fongbe en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en fongbe; no debe usarse para otras lenguas sin un ajuste previo.
- Riesgo de alucinación y errores de transcripción inherente a los modelos CTC, especialmente con ruido de fondo, acentos no representados o audio de baja calidad.
- No es una versión oficial de SpeechBrain; el autor lo indica explícitamente.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar a SpeechBrain y el paper del modelo original tal como pide su model card.
- La decodificación documentada es greedy; no se incluye decodificación con modelo de lenguaje, lo que puede limitar la precisión frente a decodificadores con LM.
- Solo se ha verificado la paridad con un único clip de ejemplo; no hay validación de paridad sobre un conjunto amplio.
- El modelo no registra descargas ni likes y su fecha de publicación es reciente, por lo que la validación comunitaria es mínima.
- El grafo es float32; no se documentan variantes cuantizadas, lo que puede encarecer el despliegue en entornos con poca memoria.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/asr-wav2vec2-dvoice-fongbe-onnx
- Modelo base: https://huggingface.co/speechbrain/asr-wav2vec2-dvoice-fongbe
- Servidor de voz bolo: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- ONNX Runtime: https://onnxruntime.ai/
