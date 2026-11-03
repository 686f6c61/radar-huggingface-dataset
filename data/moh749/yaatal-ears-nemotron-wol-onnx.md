# MOH749/yaatal-ears-nemotron-wol-onnx

## Resumen

Yaatal ears es un modelo de reconocimiento automático del habla (ASR) en streaming para wolof, una lengua hablada principalmente en Senegal y Gambia. Se trata de una exportación a ONNX del modelo `MOH749/yaatal-ears-nemotron-wol`, que a su vez deriva del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA, adaptado al wolof por el autor MOH749 bajo el paraguas del proyecto "yaatal". El repositorio contiene únicamente los pesos en formato ONNX (encoder, decoder y joint por separado), pensados para su ejecución con `onnxruntime` y no con PyTorch/NeMo directamente.

La relevancia del modelo radica en dos factores: por un lado, cubre una lengua de bajos recursos como el wolof, para la que existen muy pocos sistemas ASR públicos; por otro, mantiene la arquitectura de streaming cache-aware del modelo original, lo que permite transcripción en tiempo real con fragmentos de 320 ms. El bundle está en FP16 (con entradas y salidas en FP32) y ocupa 3,4 GB en el repositorio.

El modelo es de tamaño pequeño (0,6B de parámetros según el nombre del modelo base) y está pensado para despliegues ligeros. Su calidad medida sobre FLEURS `wo_sn` es modesta (WER en torno al 57,7 %), lo que refleja tanto la dificultad del wolof como la limitación de datos de adaptación; el autor lo presenta como una prueba de paridad con NeMo más que como un sistema listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decoder RNNT (transducer), streaming cache-aware |
| Parámetros totales | 0,6B (según el modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | contexto izquierdo 56 frames, contexto derecho 3 frames por chunk; chunk de 320 ms (32 frames mel + 9 frames de pre-caché) |
| Tipos de cuantización | FP16 (pesos), entradas y salidas FP32; INT8 no producido |
| Idiomas soportados | wolof (`wo`, `wo-SN`) |
| Licencia | other (derivada de NVIDIA Nemotron 3.5 ASR streaming; verificar antes de publicación) |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `joint.onnx` con ficheros `.data`), más `config.json`, `languages.json`, `vocab.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del Nemotron 3.5 ASR streaming de NVIDIA: un encoder FastConformer (variante de Conformer con downsampling agresivo para reducir coste computacional) acoplado a un decoder RNNT (Recurrent Neural Network Transducer) con una red joint que combina las representaciones del encoder y del decoder para producir tokens. El modo streaming es cache-aware: el encoder mantiene cachés de atención y convolución entre chunks, con un contexto izquierdo de 56 frames y un contexto derecho de 3 frames, procesando chunks de 320 ms (32 frames mel más 9 frames de pre-caché) y emitiendo 4 frames de salida por chunk.

La exportación a ONNX separa los tres componentes en grafos independientes, con pesos en FP16 y entradas/salidas en FP32, replicando la disposición del bundle de referencia `soniqo/Nemotron-3.5-ASR-Streaming-Multilingual-0.6B-ONNX-FP16`. El autor indica explícitamente que no ha replicado la reescritura del árbol de concatenación de cachés para WebGPU del bundle de referencia. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset de adaptación al wolof ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). La adaptación al wolof se realizó sobre el checkpoint `boca2-wol-v1/final/boca2-wol-v1-wo.nemo`, del que no se detallan datos de entrenamiento.

## Capacidades

- Reconocimiento automático del habla en streaming para wolof, con latencia de chunk de 320 ms.
- Transcripción de audio de hasta al menos 18 segundos por clip en las pruebas de paridad reportadas.
- Soporte de prompt de idioma mediante slot dedicado: índice 105 en `language_mask` (one-hot), con `languages.json` mapeando `wo` y `wo-SN` a ese índice.
- Inferencia con `onnxruntime` (CPU verificada; GPU no documentada en la model card).
- Decodificación greedy RNNT.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No soporta visión, audio generativo ni otras modalidades.
- Capacidad multilingüe limitada al wolof; no se documenta transferencia a otras lenguas.

## Casos de uso

- Subtitulado en directo de contenido en wolof: el modo streaming con chunks de 320 ms permite generar subtítulos con latencia baja en retransmisiones o vídeos, usando el decoder RNNT en modo greedy sobre el encoder cache-aware.
- Transcripción de reuniones y entrevistas en wolof: el modelo puede procesar audio de forma incremental y producir texto al vuelo, útil para actas automáticas en organizaciones que operan en Senegal o Gambia.
- Investigación en ASR de bajos recursos: sirve como punto de partida reproducible para fine-tuning sobre otros dialectos o dominios del wolof, dado que el bundle ONNX es ligero (0,6B) y ejecutable en CPU.
- Evaluación comparativa de exportaciones ONNX: el repositorio documenta una metodología de paridad (WER NeMo vs ONNX, acuerdo de transcripciones) que puede reutilizarse para validar otras exportaciones.
- Prototipado de asistentes de voz en wolof: integrable en pipelines de `onnxruntime` para pruebas de concepto de dictado o comandos de voz, siempre que se acepte el WER actual como limitación.
- Despliegue en entornos sin GPU: el encoder alcanza un factor de tiempo real de 0,594 en CPU con 8 hilos, lo que permite transcripción en tiempo real en servidores modestos o dispositivos edge con CPU.
- Análisis de archivos de audio históricos en wolof: procesamiento por lotes con `onnxruntime` para indexar o buscar contenido en grabaciones, aceptando la tasa de error actual como filtro aproximado.

## Benchmarks y rendimiento

Datos de paridad publicados por el autor sobre `google/fleurs` `wo_sn` (test, primeros 40 clips de hasta 18 s), decodificación greedy RNNT con streaming de 320 ms y front-end mel de NeMo:

| Sistema | WER % |
|---|---|
| NeMo streaming (FP32) | 57,66 |
| ONNX FP16 | 57,79 |

Acuerdo de transcripciones NeMo vs ONNX: 38/40 idénticas, 40/40 con diferencia de una palabra o menos. Factor de tiempo real del encoder en CPU (8 hilos): 0,594. Criterio de aceptación (WER ONNX dentro de 1,0 punto de NeMo y acuerdo ≥ 90 %): superado.

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el bundle FP16 ocupa 3,4 GB en disco, por lo que en GPU se requiere al menos ese orden de magnitud más overhead de activaciones y cachés.
- GPU recomendadas: no documentadas en la model card; el autor solo verifica ejecución en CPU.
- ¿Cabe en GPU consumer? No confirmado; por tamaño (0,6B en FP16) es plausible en GPUs con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: `onnxruntime` (verificado en CPU con 8 hilos); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR ONNX).
- Latencia y throughput: factor de tiempo real del encoder de 0,594 en CPU con 8 hilos (job del autor); no hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Yaatal ears (este modelo) | 0,6B | chunk 320 ms, contexto izq. 56 / der. 3 | wolof | other (derivada de NVIDIA) | ONNX FP16 |
| `nvidia/nemotron-3.5-asr-streaming-0.6b` (base) | 0,6B | streaming cache-aware | multilingüe (según modelo base) | licencia NVIDIA | NeMo / otros |
| `soniqo/Nemotron-3.5-ASR-Streaming-Multilingual-0.6B-ONNX-FP16` | 0,6B | streaming cache-aware | multilingüe | no disponible | ONNX FP16 |
| `MOH749/yaatal-ears-nemotron-wol` | 0,6B | streaming cache-aware | wolof | no disponible | NeMo (`.nemo`) |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- WER elevado: 57,79 % en FLEURS `wo_sn` test (40 clips), lo que limita su uso en producción sin revisión humana.
- Evaluación muy reducida: solo 40 clips de hasta 18 s; no hay validación en dominios, acentos o ruido reales.
- Sesgos desconocidos: no se documenta composición del dataset de adaptación ni posibles sesgos de género, edad o dialecto.
- Riesgo de alucinación: propio de modelos RNNT en audio ruidoso o fuera de dominio; no cuantificado.
- Cobertura lingüística restringida al wolof (`wo`, `wo-SN`); no se documenta soporte de code-switching con francés u otras lenguas.
- Licencia "other" derivada de NVIDIA Nemotron 3.5 ASR streaming: es imprescindible revisar los términos de la licencia original antes de cualquier publicación o uso comercial.
- No se ha replicado la optimización WebGPU del bundle de referencia; el rendimiento en GPU puede diferir.
- No se ha producido versión INT8, lo que limita el despliegue en entornos con restricciones severas de memoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/MOH749/yaatal-ears-nemotron-wol-onnx
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Bundle de referencia: https://huggingface.co/soniqo/Nemotron-3.5-ASR-Streaming-Multilingual-0.6B-ONNX-FP16
- Modelo NeMo del autor: https://huggingface.co/MOH749/yaatal-ears-nemotron-wol
- Dataset de evaluación: https://huggingface.co/datasets/google/fleurs
