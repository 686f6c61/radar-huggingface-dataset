# johnBamma/icefall-asr-ksponspeech-pruned-transducer-stateless7-streaming-2024-06-12

## Resumen

El modelo `johnBamma/icefall-asr-ksponspeech-pruned-transducer-stateless7-streaming-2024-06-12` es un sistema de reconocimiento automático del habla (ASR) en coreano, desarrollado sobre la infraestructura Icefall del proyecto k2-fsa. Se trata de un transductor Zipformer en streaming, con arquitectura "pruned stateless transducer" y un codificador Zipformer de séptima generación, diseñado específicamente para decodificación en tiempo real con tamaños de chunk de 320 ms o 640 ms. Cuenta con 79,02 millones de parámetros, lo que lo sitúa en la gama ligera y lo hace apto para despliegue en dispositivos con recursos limitados.

El modelo se ha entrenado sobre KsponSpeech, un corpus de habla espontánea en coreano de 969 horas de diálogos abiertos, grabados por unos 2.000 hablantes nativos en entorno limpio y transcritos manualmente con etiquetas de disfluencia. La relevancia actual radica en que ofrece una alternativa de código abierto (Apache 2.0) para ASR en coreano con latencia controlada, exportable a ONNX/INT8 mediante sherpa-onnx, lo que facilita su integración en aplicaciones de transcripción en vivo, asistentes de voz y subtitulado.

El repositorio tiene un tamaño de 1,3 GB y fue creado el 13 de junio de 2024, con actualización posterior en noviembre de 2026. No se han publicado métricas de WER (word error rate), sino CER (character error rate), coherente con la evaluación típica en coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Streaming Zipformer-Transducer (pruned stateless transducer + streaming Zipformer) |
| Parámetros totales | 79.022.891 (79,02 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa chunks de 320 ms o 640 ms en streaming) |
| Tipos de cuantización | exportación ONNX/INT8 disponible vía sherpa-onnx (según model card) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la información proporcionada (repo de 1,3 GB; exportación ONNX/INT8 mencionada) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transducer (RNN-T) con un codificador Zipformer en su variante streaming, combinada con la técnica "pruned stateless transducer". Esta combinación elimina el estado recurrente explícito del predictor y aplica poda sobre el transducer, reduciendo el número de parámetros y el coste computacional sin sacrificar precisión en decodificación por chunks. El codificador Zipformer está diseñado para capturar dependencias locales y globales con atención eficiente, lo que permite decodificación incremental con latencia baja (chunks de 320 ms o 640 ms).

El entrenamiento se realizó sobre KsponSpeech, un corpus de 969 horas de diálogos espontáneos en coreano con transcripción dual (ortografía y pronunciación) y etiquetas de disfluencia. Según la model card, se añadió MUSAN al pipeline de entrenamiento, presumiblemente como aumento de datos y robustez frente a ruido. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset más allá de KsponSpeech y MUSAN, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). El checkpoint reportado corresponde a `--epoch 30 --avg 9`.

## Capacidades

- Reconocimiento automático del habla en coreano, con salida de transcripción a nivel de carácter.
- Decodificación en streaming con chunks de 320 ms o 640 ms, apta para aplicaciones en tiempo real.
- Tres modos de decodificación: greedy search, fast beam search y modified beam search.
- Dos modos de evaluación: "simulated streaming" (alimentación de la utterance completa) y "chunk-wise" (alimentación incremental de frames).
- Manejo de habla espontánea con disfluencias (muletillas, repeticiones, fragmentos de palabras) gracias al entrenamiento sobre KsponSpeech.
- Exportación a ONNX/INT8 mediante sherpa-onnx para despliegue en producción.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio de entrada más allá del propio ASR, ni capacidades multilingües (solo coreano).

## Casos de uso

- Transcripción en vivo de reuniones y conversaciones en coreano: el modelo procesa audio en chunks de 320 ms o 640 ms, lo que permite generar subtítulos casi en tiempo real con una latencia controlada y un CER en torno al 10 % en condiciones limpias.
- Subtitulado automático de vídeo y streaming: la decodificación streaming y el tamaño reducido (79 M de parámetros) permiten integrarlo en pipelines de emisión con requisitos de latencia estrictos.
- Asistentes de voz y comandos por voz en coreano: el modelo puede transcribir consultas de usuario en dispositivos con recursos limitados tras la exportación a ONNX/INT8.
- Análisis de centros de llamadas: transcripción de diálogos espontáneos con disfluencias, aprovechando el entrenamiento sobre KsponSpeech, para su posterior análisis de calidad o extracción de información.
- Aplicaciones de accesibilidad: generación de subtítulos para personas con discapacidad auditiva en contenido en coreano, con despliegue local gracias a la licencia Apache 2.0.
- Investigación en ASR de bajo recurso: el modelo sirve como baseline reproducible para experimentos con Icefall, comparación de decodificadores y evaluación de técnicas de poda en transductores.
- Integración en dispositivos edge: la exportación a sherpa-onnx permite ejecutar el modelo en entornos embebidos o móviles sin GPU dedicada, siempre que se acepte la cuantización INT8.

## Benchmarks y rendimiento

Los resultados publicados en la model card son CER (character error rate) sobre los conjuntos `eval_clean` y `eval_other` de KsponSpeech, con chunk de 320 ms y 640 ms:

| Método de decodificación | Chunk | eval_clean | eval_other | Modo |
|---|---|---|---|---|
| greedy search | 320 ms | 10,21 | 11,07 | simulated streaming |
| greedy search | 320 ms | 10,22 | 11,07 | chunk-wise |
| fast beam search | 320 ms | 10,21 | 11,04 | simulated streaming |
| fast beam search | 320 ms | 10,25 | 11,08 | chunk-wise |
| modified beam search | 320 ms | 10,13 | 10,88 | simulated streaming |
| modified beam search | 320 ms | 10,10 | 10,93 | chunk-size |
| greedy search | 640 ms | 9,94 | 10,82 | simulated streaming |
| greedy search | 640 ms | 10,04 | 10,85 | chunk-wise |
| fast beam search | 640 ms | 10,01 | 10,81 | simulated streaming |
| fast beam search | 640 ms | 10,04 | 10,70 | chunk-wise |
| modified beam search | 640 ms | 9,91 | 10,72 | simulated streaming |
| modified beam search | 640 ms | 9,92 | 10,72 | chunk-size |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 79 M de parámetros, el peso en FP32 ronda los 316 MB y en INT8 unos 79 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: sherpa-onnx (exportación ONNX/INT8 mencionada en la model card), Icefall (scripts de decodificación `decode.py` y `streaming_decode.py`), y en general cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles. La latencia vendrá determinada por el tamaño de chunk (320 ms o 640 ms) y el modo de decodificación.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables (otros ASR en coreano de Icefall, Whisper, etc.) con parámetros, contexto, rendimiento y licencia verificables. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | CER (clean/other) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 79,02 M | chunks 320/640 ms | 9,91–10,25 / 10,70–11,08 | Apache 2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta coreano; no es multilingüe.
- El CER reportado (en torno al 10 %) es relativamente alto para producción en dominios exigentes; conviene evaluar en el dominio objetivo antes de desplegar.
- Entrenado sobre KsponSpeech (habla espontánea en entorno limpio); el rendimiento puede degradarse con ruido, acentos no representados o audio de baja calidad.
- Riesgo de errores en nombres propios, terminología técnica y palabras poco frecuentes, típico de modelos ASR con vocabulario limitado.
- No se documentan sesgos específicos, pero al entrenarse con unos 2.000 hablantes nativos, puede presentar sesgos demográficos y geográficos.
- Licencia Apache 2.0 permite uso comercial y redistribución, incluida la de pesos convertidos o cuantizados, siempre que se incluya el aviso de licencia y la atribución al repositorio.
- No se especifican en la información disponible los formatos exactos de pesos incluidos en el repositorio (solo se menciona la exportación ONNX/INT8 de sherpa-onnx).
- El repositorio tiene 0 descargas y 2 likes, lo que sugiere poca validación comunitaria; conviene contrastar los resultados antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/johnBamma/icefall-asr-ksponspeech-pruned-transducer-stateless7-streaming-2024-06-12
- Pull request de Icefall: https://github.com/k2-fsa/icefall/pull/1651
- Dataset KsponSpeech (AI Hub): https://aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=123
- Paper de KsponSpeech: https://www.mdpi.com/2076-3417/10/19/6936
- Exportación sherpa-onnx mencionada: `sherpa-onnx-streaming-zipformer-korean-2024-06-16` (no se proporciona URL directa en la información disponible)
