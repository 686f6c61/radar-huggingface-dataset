# Mikhailo/nemotron-3.5-asr-streaming-0.6b-onnx-int8-320ms

## Resumen

Este repositorio contiene una exportación no oficial a ONNX con cuantización int8 del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, un sistema de reconocimiento automático del habla en streaming basado en FastConformer-RNNT con mecanismo de caché (cache-aware) y prompt de idioma. Lo publica el usuario Mikhailo y está pensado específicamente para inferencia en CPU x86 con soporte de instrucciones VNNI/AMX (Intel Xeon Ice Lake y posteriores, AMD Zen 4 y posteriores). No está producido ni respaldado por NVIDIA, aunque los pesos derivan del modelo original de NVIDIA bajo licencia OpenMDW-1.1.

El interés principal es práctico: reduce el encoder de 2,46 GB (fp32) a 1,25 GB (int8) y acelera la inferencia en CPU aproximadamente 1,78x sobre un Xeon de 2,1 GHz con AMX, manteniendo una precisión prácticamente idéntica (WER de 17,34% frente a 17,45% en FLEURS ucraniano, decodificación greedy). Está orientado a despliegues de ASR en streaming sobre hardware sin GPU, con chunks de 320 ms y decodificación RNN-T sobre los grafos `decoder` y `joiner`.

El modelo base maneja 40 locales mediante un prompt de idioma y emplea una arquitectura FastConformer-RNNT con cachés de atención y convolución, lo que permite transcripción incremental continua sin reprocesar el audio completo. La exportación incluye dos grafos de encoder (`encoder_320ms_first` para el primer chunk y `encoder_320ms` para los siguientes), además del decodificador y el joiner.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT cache-aware con prompt de idioma (encoder Conformer con cachés, decoder RNN-T y joiner) |
| Parametros totales | Aproximadamente 0,6B segun la denominacion del modelo base; desglose por modulo no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de tokens; procesamiento por chunks de 320 ms con caches recurrentes (encoder con 24 capas, cache k/v de forma [B,8,56,128]) |
| Tipos de cuantizacion | int8 dinamico (solo MatMuls de feed-forward del encoder, pesos per-channel y activaciones cuantizadas por llamada); tambien disponible fp32 |
| Idiomas soportados | 40 locales segun la model card del modelo base; listado concreto no disponible |
| Licencia | OpenMDW-1.1 (identificador `other` en HuggingFace) |
| Formato de pesos | ONNX (grafos para onnxruntime: `encoder_320ms_first`, `encoder_320ms`, `decoder`, `joiner`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es FastConformer-RNNT en configuracion cache-aware. El encoder opera sobre caracteristicas log-mel de 128 bins a 16 kHz con salto de 10 ms, y mantiene estado entre chunks mediante cachés de atención (24 capas, con `k_cache_i` y `v_cache_i` de forma [B,8,56,128]) y cachés de convolución (`conv2d_cache_0..2` y `conv1d_cache_i`). El primer chunk se procesa con `encoder_320ms_first` (entrada `input_features [B,25,128]`) y los siguientes con `encoder_320ms` (entrada `input_features [B,32,128]`), arrastrando las cachés. Un `cache_mask` con valor -1e9 en las posiciones no rellenadas controla la atención sobre el estado aún vacío. La decodificación es RNN-T greedy o beam search sobre los grafos `decoder` y `joiner`, con token blank = 13087 y vocabulario de 13088 logits de salida. Los ids se mapean a piezas SentencePiece mediante `tokens.txt`.

Esta exportación concreta no reentrena ni modifica los pesos: aplica cuantización int8 dinámica únicamente a las MatMuls de feed-forward del encoder, con pesos cuantizados per-channel y activaciones cuantizadas en cada llamada. La atención, las convoluciones, las proyecciones de entrada y salida, el decoder y el joiner permanecen en fp32. El proceso de exportación se documenta con los scripts `scripts/export/export_onnx.py` y `scripts/export/quantize_encoder.py` del repositorio SVB.ASR.Nemo, basados en el trabajo previo `codavidgarcia/nemotron-3.5-asr-streaming-onnx` (Apache-2.0). No se dispone de información sobre el dataset de entrenamiento del modelo original, número de tokens, composición ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla en streaming con chunks de 320 ms, adecuado para transcripcion incremental en tiempo real.
- Decodificacion RNN-T greedy o beam search sobre el vocabulario de 13088 piezas SentencePiece.
- Soporte multilingue mediante prompt de idioma, con 40 locales declarados en el modelo base.
- Gestion de estado entre chunks mediante caches de atencion y convolucion, sin necesidad de reprocesar el audio completo.
- Inferencia en CPU x86 con aceleracion VNNI/AMX para las capas cuantizadas a int8.
- Compatibilidad con onnxruntime como runtime de ejecucion, con grafos separados para primer chunk, chunks posteriores, decoder y joiner.
- Integracion directa con el servidor de streaming SVB.ASR.Nemo (Rust, sobre onnxruntime), que carga el directorio tal cual mediante `NEMO_MODEL_DIR`.
- No se documentan capacidades de vision, audio multimodal, tool calling, function calling ni agentes; se trata de un modelo puramente ASR.

## Casos de uso

- Subtitulado en directo sobre infraestructura de CPU: al procesar chunks de 320 ms con estado de caché, puede generar subtítulos con latencia baja en servidores x86 con VNNI/AMX sin necesidad de GPU.
- Transcripcion de reuniones y llamadas en on-premise: el modelo permite desplegar ASR en entornos sin aceleradores gráficos, algo habitual en organizaciones con requisitos de privacidad de datos de voz.
- Atencion al cliente y analitica de contact center: transcripcion de audio telefónico con prompt de idioma para seleccionar el locale correcto en operaciones multilingües (hasta 40 locales declarados).
- Dictado de notas en entornos profesionales (sanidad, legal, campo): el bajo consumo de recursos (encoder int8 de 1,25 GB) permite ejecutarlo en estaciones de trabajo o servidores modestos.
- Asistentes de voz con reconocimiento local: la inferencia en CPU evita enviar audio a servicios en la nube, reduciendo la exposicion de datos.
- Indexacion y busqueda de archivos de audio largos: el modo streaming con cachés evita reprocesar el histórico completo cuando se transcriben grabaciones extensas por tramos.
- Despliegue en hardware x86 existente: la mejora de 1,78x en RTF sobre un Xeon a 2,1 GHz con AMX permite aumentar el número de canales concurrentes por núcleo sin cambiar de servidor.
- Aplicaciones en tiempo real en Mac con Apple Silicon: aunque la model card recomienda usar fp32 en Macs, el modelo puede ejecutarse en onnxruntime sobre M2 Max con RTF en torno a 0,27-0,29.

## Benchmarks y rendimiento

| Metrica | fp32 | int8 (esta exportacion) |
|---|---|---|
| FLEURS ucraniano, WER greedy (50 clips, 940 palabras) | 17,45% | 17,34% |
| RTF, 1 nucleo, Xeon 2,1 GHz con AMX | 0,84 | 0,47 (1,78x mas rapido) |
| RTF, 1 nucleo, Apple M2 Max | 0,29 | ~0,27 (se recomienda fp32 en Macs) |
| Tamano del encoder | 2,46 GB | 1,25 GB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; esos benchmarks no son aplicables a un modelo ASR. El unico conjunto de evaluacion reportado es FLEURS en ucraniano con decodificacion greedy.

## Requisitos de hardware

- CPU objetivo: x86 con soporte VNNI/AMX (Intel Xeon Ice Lake y posteriores, AMD Zen 4 y posteriores). En x86 sin VNNI se recomienda re-cuantizar con `--reduce-range` si la precision cae.
- VRAM: no aplica; el modelo esta pensado para ejecucion en CPU mediante onnxruntime.
- Memoria requerida: encoder int8 de 1,25 GB, frente a 2,46 GB en fp32; el repositorio completo ocupa 2,6 GB. Hay que sumar el espacio de decoder, joiner y caches de estado.
- GPU recomendadas: no disponibles en la informacion proporcionada. El foco del artefacto es la inferencia en CPU.
- Compatibilidad con GPU de consumo: no documentada. No se indica soporte para RTX 4090 u otras GPUs de consumo en esta exportacion.
- Apple Silicon: ejecutable (probado en M2 Max), pero la model card recomienda fp32 en Macs porque la ganancia de int8 es marginal (~0,29 frente a ~0,27 de RTF).
- Opciones de despliegue: onnxruntime como runtime base; servidor SVB.ASR.Nemo (Rust) que carga el directorio directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: RTF de 0,47 en 1 nucleo de Xeon 2,1 GHz con AMX (int8) y 0,84 en fp32; en Apple M2 Max, ~0,27 (int8) y 0,29 (fp32) con 1 nucleo. RTF inferior a 1 implica procesamiento mas rapido que tiempo real en un solo nucleo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mikhailo/nemotron-3.5-asr-streaming-0.6b-onnx-int8-320ms | ~0,6B | Chunks de 320 ms con caches | WER 17,34% en FLEURS ucraniano; RTF 0,47 (Xeon AMX, int8) | OpenMDW-1.1 | HuggingFace, export no oficial |
| nvidia/nemotron-3.5-asr-streaming-0.6b (fp32, base) | ~0,6B | Chunks de 320 ms con caches | WER 17,45% en FLEURS ucraniano; RTF 0,84 (Xeon AMX, fp32) | OpenMDW-1.1 | HuggingFace, modelo oficial |
| Otras alternativas de ASR en streaming | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con otros sistemas ASR (por ejemplo, variantes de Whisper en streaming) en la informacion proporcionada, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Exportacion no oficial: no esta producida ni respaldada por NVIDIA; cualquier incidencia debe validarse contra el modelo base original.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni reportes de terceros.
- WER elevado en el unico benchmark publicado: 17,34% en FLEURS ucraniano con decodificacion greedy, lo que limita su uso en escenarios que exijan transcripcion de alta fidelidad sin un modelo de lenguaje o rescoring posterior.
- Cuantizacion parcial: solo se cuantizan las MatMuls de feed-forward del encoder; el resto de componentes permanece en fp32, por lo que la ganancia de velocidad depende del hardware.
- Dependencia de hardware: en x86 sin VNNI la precision puede degradarse y se recomienda re-cuantizar con `--reduce-range`; en Mac se recomienda directamente la version fp32.
- Idiomas: se declaran 40 locales para el modelo base, pero no se proporciona el listado ni evaluaciones por idioma, de modo que el rendimiento fuera del ucraniano no esta verificado.
- Formato de salida: el pipeline entrega piezas SentencePiece; no se documenta el tratamiento de puntuacion, mayusculas ni normalizacion, lo que puede requerir post-procesado.
- Licencia: OpenMDW-1.1 no es una licencia tipo Apache-2.0 o MIT; es necesario revisar el texto completo antes de un uso comercial o de redistribucion de los pesos.
- Riesgo de alucinacion y errores en audio adverso: no se publican evaluaciones con ruido, solapamiento de hablantes, acentos o audio telefónico de baja calidad.
- Restricciones de chunk: el flujo asume chunks fijos de 320 ms y batch fijo de 1 (`B` es la eje de batch fijo a 1), lo que limita el procesamiento por lotes en una sola pasada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mikhailo/nemotron-3.5-asr-streaming-0.6b-onnx-int8-320ms
- Modelo base oficial: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio de exportacion previo: `codavidgarcia/nemotron-3.5-asr-streaming-onnx` (Apache-2.0); URL no disponible en la informacion proporcionada
- Servidor de streaming: SVB.ASR.Nemo (Rust, onnxruntime), seccion `scripts/export/`; URL no disponible en la informacion proporcionada
