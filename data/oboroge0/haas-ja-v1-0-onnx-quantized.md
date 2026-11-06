# oboroge0/Haas-ja-v1.0-onnx-quantized

## Resumen

Haas-ja-v1.0-onnx-quantized es una conversión comunitaria a ONNX del modelo de reconocimiento automático del habla (ASR) en japonés third-intelligence/Haas-ja-v1.0, desarrollado originalmente por Third Intelligence. El paquete lo publica el usuario oboroge0 y su objetivo es hacer que el modelo funcione en CPU sin necesidad de PyTorch, NeMo, Triton ni GPU, integrándose directamente en sherpa-onnx. Se trata de una conversión no oficial, no avalada por el autor original.

El modelo original es un sistema ASR de tipo transducer (TDT, Token-and-Duration Transducer) con un encoder FastConformer y una red de predicción basada en Kimi Delta Attention. Esta conversión cuantiza el encoder a int8 en las convoluciones pointwise y a 4 bits en los pesos de las multiplicaciones matriciales, reduciendo el tamaño del encoder a 432 MB y el consumo de memoria a aproximadamente 0,8-1,1 GB en función de la longitud del audio.

La relevancia de esta ficha radica en que permite desplegar un ASR japonés de calidad en hardware modesto (probado en un Apple M1 Pro) con una velocidad de inferencia de aproximadamente 25 veces tiempo real (RTF ~0,04). Es útil para desarrolladores que necesitan transcripción de audio japonés en entornos sin GPU, aunque con las limitaciones propias de una conversión no oficial y de un modelo entrenado con datos no detallados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Token-and-Duration Transducer) con encoder FastConformer y red de predicción Kimi Delta Attention |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo offline por segmentos; probado hasta ~29 s de audio) |
| Tipos de cuantizacion | Encoder: int8 en convoluciones pointwise y 4 bits en pesos MatMul (block size 32, simétrico); decoder y joiner en float32 |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.quantized.onnx + encoder.data, decoder.onnx, joiner.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo original es un sistema ASR end-to-end de tipo transducer con decodificación TDT. El encoder es un FastConformer (variante de Conformer con atención eficiente) y la red de predicción utiliza Kimi Delta Attention, una atención lineal con estado recurrente. El decodificador conjunto (joiner) combina las representaciones del encoder y del predictor para emitir tokens y duraciones. El vocabulario consta de 3.072 tokens más el token `<blk>`.

Esta conversión no reentrena el modelo: exporta los pesos float32 originales con el exportador de NeMo y aplica cuantización dinámica. Las convoluciones pointwise se cuantizan a int8 (excluyendo las convoluciones depthwise) y los pesos de MatMul a 4 bits con `MatMulNBitsQuantizer`. Antes de cuantizar, las salidas del encoder ONNX y PyTorch coincidían con un error de aproximadamente 2e-5. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automático del habla en japonés (transcripción de audio mono a texto).
- Funcionamiento offline por segmentos completos (no streaming).
- Inferencia en CPU sin dependencias de PyTorch, NeMo, Triton ni GPU.
- Integración con sherpa-onnx mediante la ruta Parakeet TDT (`model_type="nemo_transducer"`).
- Extracción de características log-mel propia de sherpa-onnx (128 dimensiones).
- No se documentan capacidades de tool calling, agentes, visión, audio multimodal ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones y entrevistas en japonés: el modelo procesa segmentos de audio de hasta ~29 segundos con un CER de 4-6 % en los conjuntos evaluados, adecuado para generar actas o subtítulos en entornos sin GPU.
- Subtitulado y postproducción de vídeo: con un RTF de ~0,04 (unas 25 veces más rápido que tiempo real en M1 Pro), permite transcribir horas de material en minutos en un portátil.
- Asistentes de voz y dictado en aplicaciones de escritorio: al ejecutarse en sherpa-onnx sobre CPU, se puede embeber en aplicaciones nativas o de escritorio sin dependencias pesadas.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el consumo de memoria de ~0,8-1,1 GB por proceso permite ejecutar varias instancias en paralelo en máquinas modestas.
- Investigación y evaluación de ASR japonés: sirve como referencia práctica para comparar pipelines ONNX frente a PyTorch/NeMo en términos de CER y RTF.
- Transcripción de llamadas de atención al cliente en japonés: combinado con un VAD para segmentar el audio, permite procesar conversaciones largas dividiéndolas en fragmentos compatibles con la ventana probada.

## Benchmarks y rendimiento

Resultados medidos por el autor de la conversión en Apple M1 Pro, 4 hilos, sherpa-onnx 1.13.6, un clip a la vez. El CER es distancia de edición simple tras NFKC y eliminación de puntuación y espacios, sin normalización de kanji/kana ni numerales; no es comparable con el 6,12 % de la model card original.

| Dataset | Clips | CER (esta conversión) | RTF (esta conversión) | CER (original PyTorch, float32 en CPU) |
|---|---:|---:|---:|---:|
| FLEURS ja (test, asr-ja-bench v1.1) | 650 | 4,34 % | 0,039 | 4,19 % |
| ReazonSpeech test (2,7 h aleatorias) | 1.645 | 5,54 % | 0,041 | 5,57 % |
| SpeechBSD ja (test, asr-ja-bench v1.1) | 2.093 | 5,96 % | 0,040 | 6,06 % |

Las diferencias frente al original no son estadísticamente claras (los intervalos bootstrap del 95 % incluyen cero en los tres conjuntos). ReazonSpeech forma parte del corpus de entrenamiento del modelo original, por lo que esa fila puede ser optimista.

Memoria (RSS máximo del proceso):

| Clip más largo | Pico |
|---|---:|
| 12 s | ~0,80 GB |
| 19-29 s | 0,97-1,12 GB |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. Memoria RAM estimada de ~0,8-1,1 GB según la longitud del clip (probado hasta ~29 s).
- GPU: no requiere GPU; la versión original oficial solo soporta Linux con GPU NVIDIA, pero esta conversión funciona en CPU.
- Cabe en cualquier equipo de consumo: probado en Apple M1 Pro; no se han medido otros CPUs, números de hilos ni versiones de sherpa-onnx.
- Despliegue: sherpa-onnx 1.13.6 (probado), mediante `OfflineRecognizer.from_transducer` con `model_type="nemo_transducer"` y `feature_dim=128`.
- Latencia y throughput: RTF de ~0,039-0,041 en M1 Pro con 4 hilos (aproximadamente 25 veces tiempo real). No hay datos de latencia para otros hardware.
- Existe una versión sin cuantizar (Haas-ja-v1.0-onnx) que es 5 veces más grande y requiere ~3 GB de memoria, con precisión similar.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | CER (FLEURS ja) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Haas-ja-v1.0-onnx-quantized (esta ficha) | TDT + FastConformer, ONNX cuantizado | no disponible | offline, ~29 s probados | 4,34 % (métrica propia) | Apache 2.0 | Hugging Face, sherpa-onnx |
| third-intelligence/Haas-ja-v1.0 (original) | TDT + FastConformer, PyTorch | no disponible | offline | 4,19 % (métrica propia) | Apache 2.0 | Hugging Face, requiere GPU NVIDIA en Linux |
| oboroge0/Haas-ja-v1.0-onnx (sin cuantizar) | TDT + FastConformer, ONNX float | no disponible | offline | similar a la cuantizada (según el autor) | Apache 2.0 | Hugging Face, ~3 GB de memoria |

No se dispone en la información proporcionada de comparaciones con otros modelos ASR japoneses (por ejemplo, Whisper o ReazonSpeech) con métricas equivalentes.

## Limitaciones y advertencias

- Conversión no oficial: no está hecha ni avalada por Third Intelligence; el soporte y la garantía de calidad recaen en el autor de la conversión.
- Las características log-mel las calcula sherpa-onnx, no NeMo, por lo que las transcripciones no siempre coinciden con las del modelo original aunque la tasa de error sea similar.
- Solo funciona en modo offline: procesa un segmento completo cada vez; no hay streaming.
- Probado únicamente en un Apple M1 Pro con 4 hilos y sherpa-onnx 1.13.6; no se han medido otros CPUs, números de hilos ni versiones.
- Memoria crece con la longitud del clip; solo se han probado clips de hasta ~29 s. Se recomienda segmentar audio largo con un VAD.
- No se han probado audio largo, vocabulario personalizado ni etiquetas de hablante.
- Compatibilidad frágil con sherpa-onnx: el modelo se carga por la ruta Parakeet TDT y depende de dos detalles que una versión futura podría cambiar (el estado de Kimi Delta Attention se aplana en dos tensores `[2, B, 20480]` pasados como estado LSTM, con `pred_hidden=20480` en los metadatos, aunque el tamaño real es 640; y la detección de TDT busca `tdt` en la URL de metadatos, por lo que esta termina en `#tdt`).
- Solo soporta japonés; no hay capacidades multilingües.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican las limitaciones de la model card original.
- Licencia Apache 2.0 permite uso comercial, pero se debe atribuir y citar el trabajo original de Third Intelligence y respetar los avisos de `LICENSE` y `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx-quantized
- Modelo original: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Versión ONNX sin cuantizar: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Limitaciones del modelo original: https://huggingface.co/third-intelligence/Haas-ja-v1.0#limitations
