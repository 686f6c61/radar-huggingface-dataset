# barez59/nemotron-asr-streaming-farsi-coreml-int8

## Resumen

Nemotron ASR Streaming Farsi (CoreML INT8) es una conversión optimizada para Apple Neural Engine del modelo `mehdi-hf/nemotron-asr-streaming-farsi`, un sistema de reconocimiento automático del habla en persa (farsi) basado en una arquitectura cache-aware FastConformer con decodificador RNN-T. El paquete lo publica el usuario `barez59` en Hugging Face y su objetivo es ejecutar ASR en streaming directamente en dispositivos iOS 18+ y macOS sobre Apple Silicon, sin depender de servidores externos.

El modelo base contiene aproximadamente 600 millones de parámetros y fue afinado sobre 1.181 horas de audio en persa. Esta versión CoreML aplica cuantización INT8 simétrica por canal a los pesos del encoder (con cómputo en FP16), mientras que el decodificador LSTM y la red conjunta se mantienen en FP16. El resultado es un bundle de unos 583 MB que procesa fragmentos estáticos de 320 ms (`[1, 128, 32]`) y alcanza un RTF de 0,047 (unas 21 veces más rápido que tiempo real) en Apple Silicon.

Su relevancia radica en que demuestra un flujo completo de despliegue on-device para ASR en un idioma de recursos medios como el persa, liberando la GPU Metal para otras tareas concurrentes (por ejemplo, traducción con MLX). La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T (decoder LSTM + joint network) |
| Parametros totales | ~600 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa chunks estáticos de 320 ms; `[1, 128, 32]`) |
| Tipos de cuantizacion | INT8 simétrica por canal (encoder, pesos) + FP16 (cómputo, decoder y joint) |
| Idiomas soportados | persa/farsi (`fa`, `fa-IR`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CoreML (`.mlmodelc`); repo de 0,6 GB |
| Capas del encoder | 24 |
| Capas del decoder | 2 (LSTM) |
| Vocabulario | 1.025 tokens SentencePiece en persa |
| Plataforma objetivo | iOS 18+, Apple Neural Engine (Apple Silicon) |
| Tamano del bundle | ~583 MB (encoder ~566 MB, decoder ~15 MB, joint ~2,5 MB) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer cache-aware con decodificador RNN-T. El encoder consta de 24 capas y está diseñado para inferencia en streaming mediante mecanismos de caché que permiten procesar audio de forma incremental sin recalcular el contexto completo. El decodificador es una red de predicción LSTM de 2 capas y la red conjunta combina las salidas del encoder y del decoder para producir distribuciones sobre un vocabulario de 1.025 tokens SentencePiece en persa.

El modelo base fue afinado sobre 1.181 horas de habla en persa, según indica la model card. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). La conversión a CoreML aplica cuantización lineal simétrica INT8 por canal a los pesos del encoder manteniendo el cómputo en FP16, y conserva el decoder y la red conjunta en FP16. El bundle incluye `config.json`, `vocab.json` y `languages.json` con el slot de prompt `fa-IR` en la posición 38.

## Capacidades

- Reconocimiento automático del habla en persa (farsi) en modo streaming.
- Procesamiento por chunks estáticos de 320 ms con estado cacheado entre fragmentos.
- Ejecución on-device en Apple Neural Engine (iOS 18+ y Apple Silicon).
- Inferencia concurrente con otras cargas en GPU Metal (por ejemplo, LLMs con MLX).
- Salida de transcripciones sobre vocabulario SentencePiece de 1.025 tokens.
- No se documentan capacidades de traducción, diarización, puntuación automática, tool calling ni agentes; el modelo es exclusivamente ASR.

## Casos de uso

- Subtitulado en directo en apps iOS: el modelo procesa audio en chunks de 320 ms con RTF de 0,047, lo que permite generar subtítulos en persa con latencia baja sin salir del dispositivo.
- Dictado por voz offline: integrable en apps de notas o mensajería para transcribir voz a texto en persa sin conexión, aprovechando que todo el bundle (~583 MB) reside localmente.
- Asistentes de voz privados: al ejecutarse en Apple Neural Engine, el audio no abandona el dispositivo, lo que facilita el cumplimiento de requisitos de privacidad en aplicaciones sanitarias o financieras.
- Pipeline combinado ASR + traducción: al liberar la GPU Metal, permite encadenar reconocimiento en persa con un LLM de traducción ejecutado en paralelo con MLX en el mismo dispositivo.
- Transcripción de reuniones y entrevistas: procesamiento por lotes de grabaciones largas en macOS sobre Apple Silicon, con velocidad ~21× tiempo real.
- Accesibilidad: subtitulado automático para usuarios con discapacidad auditiva en contenido en persa dentro de apps nativas de iOS.
- Investigación en ASR de bajos recursos: punto de partida para evaluar técnicas de cuantización INT8 y despliegue CoreML en idiomas con menos datos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| RTF (real-time factor) | 0,047 | Medido en Apple Silicon con `MLComputeUnits.cpuAndNeuralEngine` (~21× tiempo real) |
| Tamano del encoder | ~566 MB | INT8 pesos, FP16 cómputo |
| Tamano del decoder | ~15 MB | FP16 |
| Tamano del joint | ~2,5 MB | FP16 |

No se han publicado resultados de WER, MMLU, HumanEval ni otros benchmarks estándar de ASR en la información disponible.

## Requisitos de hardware

- Ejecución en Apple Neural Engine: requiere dispositivo con Neural Engine e iOS 18+ (o macOS sobre Apple Silicon).
- VRAM/unified memory estimada: el bundle completo ocupa ~583 MB en disco; en memoria, el encoder INT8 con cómputo FP16 requiere del orden de 1-2 GB de memoria unificada, aunque no se especifica cifra exacta.
- GPU recomendadas: no aplica GPU dedicada; el modelo está pensado para Apple Silicon (M-series) y chips A-series con Neural Engine.
- No cabe ni está diseñado para GPUs NVIDIA (A100, H100, RTX 4090); para esos entornos habría que usar el modelo base en formato PyTorch/ONNX.
- Opciones de despliegue: CoreML (`MLComputeUnits.cpuAndNeuralEngine`), integrable vía Core ML en apps iOS/macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a CoreML).
- Latencia y throughput: RTF 0,047 medido en Apple Silicon, es decir, ~21× más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/streaming | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| barez59/nemotron-asr-streaming-farsi-coreml-int8 | ~600 M | Streaming, chunks 320 ms | CC-BY-4.0 | CoreML / ANE | Cuantizado INT8, on-device |
| mehdi-hf/nemotron-asr-streaming-farsi | ~600 M | Streaming | no disponible | PyTorch | Modelo base sin cuantizar |
| Whisper (variantes) | 39 M – 1,55 B | No streaming nativo | MIT/Apache | Multiplataforma | Multilingüe, no específico de persa |
| Modelos ASR persa genéricos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de WER comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, plataforma y licencia.

## Limitaciones y advertencias

- Solo soporta persa (`fa`); no es multilingüe.
- Dependencia exclusiva de CoreML y Apple Neural Engine: no ejecutable en Linux, Windows ni GPUs NVIDIA sin reconversión.
- Requiere iOS 18+ o macOS sobre Apple Silicon; dispositivos antiguos quedan excluidos.
- La cuantización INT8 puede degradar ligeramente la precisión frente al modelo base en FP16/FP32; no se publican métricas de WER que lo cuantifiquen.
- Chunks estáticos de 320 ms: la latencia mínima está acotada por ese tamaño de ventana.
- Riesgo de alucinación y errores en audio con ruido, acentos o vocabulario técnico, habitual en modelos ASR; no se documentan evaluaciones al respecto.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y respetar los términos de la licencia del modelo base.
- No se documentan sesgos específicos ni evaluación de robustez; se recomienda validación propia antes de producción.
- El autor del paquete (`barez59`) no es el autor del modelo base; conviene verificar la procedencia y reproducibilidad de la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barez59/nemotron-asr-streaming-farsi-coreml-int8
- Modelo base: https://huggingface.co/mehdi-hf/nemotron-asr-streaming-farsi
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
