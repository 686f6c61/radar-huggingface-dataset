# DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c056-compact-cpu

## Resumen

Nemotron 3.5 ASR Compact es una variante optimizada del encoder de reconocimiento de voz en streaming de NVIDIA Nemotron-3.5 ASR (0,6B), empaquetada en formato ONNX para ejecución en CPU. La publica el usuario DimQ1 en HuggingFace como un repack del export INT4 original, con el objetivo de reducir el tamaño y acelerar la inferencia en entornos sin GPU. El modelo resuelve el problema de desplegar ASR en streaming de calidad en hardware de consumo o servidores sin acelerador dedicado.

La arquitectura subyacente es un encoder FastConformer cache-aware, unido a un decoder RNN-T (red de predicción LSTM) y una red joint de transductor. El repack solo modifica el encoder: el decoder, el joint, el tokenizador y las configuraciones son idénticos byte a byte al repositorio fuente. El modelo soporta ruso e inglés y está pensado para transcripción incremental con una ventana de 0,56 segundos.

La relevancia de esta ficha radica en que demuestra una técnica de compresión práctica para ASR en CPU: cuantización INT4 de las matmuls, reconversión de convoluciones pointwise a matmuls INT8 y plegado de proyecciones constantes, con una pérdida de precisión prácticamente nula respecto al original (WER total idéntico en la evaluación publicada).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T LSTM (decoder) + transducer joint |
| Parámetros totales | 0,6B (modelo base Nemotron-3.5 ASR streaming) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de streaming de 0,56 s |
| Tipos de cuantización | INT4 MatMulNBits (k-quant, block 32, accuracy_level 4) en matmuls; INT8 en las 48 convoluciones pointwise reconvertidas a matmul |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | other (remite a la licencia original de NVIDIA Nemotron) |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joint.onnx con datos externos) |

## Arquitectura y entrenamiento

El modelo es un export ONNX de Nemotron-3.5 ASR streaming (0,6B) de NVIDIA, con arquitectura de transductor recurrente (RNN-T). El encoder es un FastConformer con mecanismo cache-aware, lo que permite procesar audio de forma incremental manteniendo estado entre fragmentos. El decoder es una red de predicción LSTM y el joint combina las representaciones del encoder y del decoder para emitir tokens.

El repack de DimQ1 no reentrena el modelo: parte del export INT4 del repositorio fuente y aplica tres transformaciones al encoder. Primero, mantiene la cuantización INT4 MatMulNBits en las matmuls. Segundo, reescribe las 48 convoluciones pointwise de los bloques conformer como matmuls y las cuantiza a INT8 (en el original estaban en FP32). Tercero, precalcula el slice constante de la tabla de posiciones y las 24 proyecciones `linear_pos` que lo consumen, eliminando recomputación por chunk en ONNX Runtime con salidas bit-idénticas. El resultado reduce el tamaño del encoder de 794 MB a 534 MB y acelera la ejecución entre un 25 % y un 29 % en CPU con 4 hilos, con 200-250 MB menos de memoria. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento de voz en streaming con ventana de 0,56 s y estado cacheado entre chunks.
- Transcripción en ruso e inglés.
- Detección de actividad de voz integrada mediante `silero_vad.onnx`.
- Inferencia en CPU sin GPU, gracias al export ONNX cuantizado.
- Pipeline de transductor RNN-T completo (encoder, decoder y joint) listo para ONNX Runtime.
- No se ha documentado soporte de tool calling, agentes, visión, audio de salida ni modo thinking.

## Casos de uso

- Transcripción en tiempo real en aplicaciones de escritorio: el modelo procesa audio por chunks de 0,56 s en CPU, adecuado para subtitulado en vivo o dictado sin GPU.
- Asistentes de voz embebidos en dispositivos de gama baja: el tamaño de 534 MB y el consumo de 200-250 MB menos que el original permiten ejecución en portátiles y mini-PC.
- Servidores de atención al cliente con transcripción de llamadas: el soporte bilingüe ru/en cubre mercados concretos y el streaming permite generar transcripciones parciales mientras dura la llamada.
- Pipelines de post-procesado de reuniones: la VAD integrada permite segmentar y transcribir solo las partes con habla, reduciendo cómputo.
- Prototipado e investigación en ASR: al ser ONNX puro, se integra en entornos Python, C# o C++ sin dependencias de CUDA.
- Despliegue en contenedores sin acelerador: el formato ONNX con datos externos facilita empaquetar el modelo en imágenes Docker ligeras para servicios de transcripción.

## Benchmarks y rendimiento

Evaluación de WER sobre Common Voice 17 (250 muestras ru + 250 en, CPU, streaming, mismo harness y día para ambos modelos), según la model card:

| Modelo | Total | ru | en |
|---|---:|---:|---:|
| Este repo (compact INT4) | 18,98 % | 15,28 % | 22,37 % |
| Fuente INT4 | 18,98 % | 15,18 % | 22,46 % |

Rendimiento del encoder: entre un 25 % y un 29 % más rápido que el encoder fuente en CPU con 4 hilos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU.
- Memoria RAM estimada: el proceso requiere aproximadamente 200-250 MB menos que el export fuente; no se especifica el total exacto.
- GPU recomendadas: no disponibles ni necesarias; el export es específico para CPU vía ONNX Runtime.
- ¿Cabe en GPU de consumo? No aplica en esta variante; el modelo base podría ejecutarse en GPU, pero este repack está orientado a CPU.
- Opciones de despliegue: ONNX Runtime (CPU), con los ficheros `encoder.onnx`, `decoder.onnx`, `joint.onnx` y sus datos externos; integración vía el repositorio VoiceType / nemotron-speech-csharp.
- Latencia y throughput: no se publican cifras absolutas de latencia o RTF; solo la mejora relativa del 25-29 % frente al encoder fuente con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este repo (Nemotron 3.5 ASR Compact INT4) | 0,6B | 0,56 s streaming | ru, en | other (NVIDIA) | ONNX |
| Nemotron-3.5 ASR streaming 0.6B ONNX INT4 (fuente) | 0,6B | 0,56 s streaming | ru, en | other (NVIDIA) | ONNX |
| Whisper (variantes pequeñas) | no disponible en la información | no disponible | multilingüe | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas fuera de la comparación con el repositorio fuente incluida en la model card.

## Limitaciones y advertencias

- Solo cubre ruso e inglés; no se ha validado en otros idiomas.
- El WER es relativamente alto (18,98 % global; 22,37 % en inglés) en la evaluación publicada, lo que limita su uso en dominios ruidosos o con acentos no representados.
- Riesgo de alucinación y errores de sustitución propios de los modelos RNN-T, especialmente en audio con ruido o solapamiento de hablantes.
- La licencia es "other" y remite a la licencia original de NVIDIA Nemotron; es imprescindible revisar sus términos antes de uso comercial.
- El repack solo modifica el encoder; cualquier limitación del modelo base se hereda íntegramente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay validación comunitaria ni garantías de mantenimiento.
- El formato ONNX con datos externos requiere gestionar correctamente los ficheros `.data` al desplegar.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá del WER en Common Voice 17.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c056-compact-cpu
- Repositorio fuente: https://huggingface.co/DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c056-cpu
- Repositorio del conversor (VoiceType / nemotron-speech-csharp): no disponible como URL directa en la información proporcionada
- Licencia original de NVIDIA Nemotron: no disponible como URL directa en la información proporcionada
