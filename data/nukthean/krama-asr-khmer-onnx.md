# Nukthean/krama-asr-khmer-onnx

## Resumen

Krama ASR Khmer ONNX es la versión cuantizada a INT8 dinámico y exportada a formato ONNX del modelo `Nukthean/krama-asr-khmer`, un sistema de reconocimiento automático del habla (ASR) especializado exclusivamente en idioma jemer (khmer, `km`). Lo desarrolla el usuario independiente Nukthean y se distribuye bajo licencia Apache 2.0. El modelo base cuenta con 343,4 millones de parámetros únicos, que tras la cuantización ocupan 358,3 MiB en disco (334,5 MiB el encoder y 23,9 MiB el decoder).

La propuesta de valor de esta release es la eliminación total de dependencias pesadas: la inferencia se ejecuta con `onnxruntime` y NumPy puro para el cálculo del log-mel, sin PyTorch, Transformers ni SafeTensors. Esto permite desplegar ASR de jemer en CPU de consumo (medido en un Intel Core i5-13400F) con una latencia media de 0,188 s por clip en decodificación greedy y 0,293 s en Beam-5, manteniendo una precisión prácticamente idéntica a la del modelo PyTorch original (3,34 % vs. 3,33 % de CER macro en Beam-5 sobre el conjunto completo de 975 clips).

Es relevante ahora porque cubre un idioma de bajos recursos (jemer) con un pipeline autocontenido, offline y ligero, adecuado para integraciones en dispositivos sin GPU y para entornos donde instalar el stack de PyTorch no es viable. La arquitectura combina un encoder Conformer con capas Gemma4, un lector bidireccional con RoPE y una cabeza CTC con cuello de botella SwiGLU, más un decoder causal opcional para rescoring.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder CTC: Conv de subsampling + Conformer de 12 capas con capas Gemma4 + `EmbedAudio` + lector bidireccional con RoPE de 6 capas + cabeza CTC con cuello de botella SwiGLU; decoder causal de 3 capas para rescoring Beam-5 |
| Parametros totales | 343,4 M (parámetros únicos del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; ventana log-mel de 20 ms, hop de 10 ms, FFT de 512, 128 filtros mel a 16 kHz) |
| Tipos de cuantizacion | INT8 dinámico (`QUInt8`); el modelo base se distribuye en bfloat16 |
| Idiomas soportados | Jemer (`km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`), más `logmel_params.npz`, `config.json` y `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un sistema ASR encoder-decoder con decodificación CTC. El encoder integra una capa convolucional de subsampling, un bloque Conformer de 12 capas construido sobre capas Gemma4, una etapa `EmbedAudio` y un lector bidireccional de 6 capas con embeddings posicionales rotatorios (RoPE), que alimenta una cabeza CTC con cuello de botella SwiGLU. El decoder es una red causal de 3 capas con `d_model=512`, 8 cabezas de atención y `max_dec_len=512`, empleada únicamente para el rescoring conjunto en decodificación Beam-5; la decodificación greedy puede ejecutarse solo con el encoder.

El entrenamiento se realizó sobre un corpus agregado que combina varios conjuntos de datos: `Nukthean/krama-asr-khmer-corpus`, `Digital-Divide-Data/khmer-speech-dataset`, `google/fleurs`, `sengtha/iany-khmer-voice`, `seanghay/khmer_grkpp_speech` y `openslr/openslr_42`. La model card no detalla el número de tokens de audio, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacable de esta release es la exportación a ONNX con cuantización INT8 dinámica y la reimplementación del cálculo log-mel en NumPy puro, que preserva la precisión del modelo original (delta de 0,00 pp en CER sobre 8 hablantes no vistos de iAny) y acelera la inferencia hasta 1,76× en CPU de consumo. El modelo aplica un normalizador de texto jemer sin espacios (NFC, unificación de `ឲ្យ/អោយ` a `ឱ្យ`, eliminación de espacios y puntuación jemer/ASCII) en la evaluación.

## Capacidades

- Reconocimiento automático del habla en jemer a partir de audio WAV, FLAC o MP3 de cualquier frecuencia de muestreo (se remuestrea internamente a 16 kHz).
- Decodificación CTC greedy rápida usando solo `encoder.int8.onnx`.
- Decodificación Beam-5 con rescoring conjunto mediante el decoder causal de 3 capas, para mayor precisión.
- Cálculo del log-mel en NumPy puro, sin dependencia de PyTorch ni de torchaudio.
- Inferencia totalmente offline en CPU mediante `onnxruntime`.
- Gestión automática del número de hilos en `CPUExecutionProvider` (limita `intra_op_num_threads` a `min(6, max(1, cpu_count // 2))` para evitar contención de hyperthreading y núcleos híbridos P+E).
- Interfaz de línea de comandos (`python krama_onnx.py audio.wav [--beam5]`).
- No soporta tool calling, agentes, visión, audio de entrada distinto de voz ni otros idiomas según la información disponible.

## Casos de uso

- Subtitulado automático de contenido audiovisual en jemer: el modelo transcribe audio de cualquier frecuencia de muestreo y permite elegir entre greedy (0,188 s/clip) para previsualización rápida y Beam-5 (0,293 s/clip) para subtítulos finales con mayor exactitud.
- Transcripción de reuniones y entrevistas en jemer: la decodificación Beam-5 con rescoring alcanza un 42,7 % de coincidencia exacta en el conjunto macro de habla real, adecuada para actas y documentación.
- Digitalización de archivos de voz históricos o de dominio público en jemer: la inferencia offline sin dependencias de nube permite procesar lotes localmente en CPU.
- Integración en aplicaciones de escritorio o servidores sin GPU: al requerir solo `onnxruntime`, `numpy`, `soundfile` y `soxr`, se despliega en entornos donde instalar PyTorch no es viable.
- Procesamiento por lotes en servidores de bajo coste: con 358,3 MiB de pesos y latencias inferiores a 0,4 s por clip en un i5-13400F, es viable transcribir grandes volúmenes en CPU.
- Asistencia a la accesibilidad para hablantes de jemer: transcripción local de notas de voz y audios personales sin enviar datos a servicios externos.
- Evaluación comparativa de ASR de bajos recursos: sirve como línea base ligera para investigar reconocimiento de jemer y otros idiomas de bajos recursos.

## Benchmarks y rendimiento

Resultados sobre clips de 16 kHz mono con el normalizador jemer sin espacios, en Intel Core i5-13400F (`batch=1`, `threads=6`). CER en porcentaje (menor es mejor).

| Split | Clips | Dominio | PyTorch greedy | ONNX INT8 greedy | Latencia greedy | PyTorch Beam-5 | ONNX INT8 Beam-5 | Exactitud Beam-5 | Latencia Beam-5 |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| DDD test | 200 | In-domain (hablantes vistos) | 3,53 % | 3,63 % | 0,188 s | 3,20 % | 3,20 % | 45,0 % | 0,284 s |
| NXKMER test | 205 | In-domain | 4,28 % | 4,26 % | 0,242 s | 4,12 % | 4,13 % | 35,6 % | 0,374 s |
| FLEURS test | 200 | Hablantes y texto no vistos | 6,34 % | 6,39 % | 0,375 s | 6,12 % | 6,17 % | 17,5 % | 0,544 s |
| iAny unseen | 160 | Hablantes no vistos (8 reservados) | 2,92 % | 2,99 % | 0,107 s | 2,69 % | 2,69 % | 72,5 % | 0,161 s |
| Macro 4 splits reales | 765 | Habla real | — | 4,32 % | 0,226 s | — | 4,05 % | 42,7 % | 0,342 s |
| Slang val | 210 | In-domain (coloquial sintético) | 0,69 % | 0,68 % | 0,161 s | 0,49 % | 0,50 % | 86,7 % | 0,253 s |
| Macro 5 dominios | 975 | Todos los splits | 3,55 % | 3,59 % | 0,188 s | 3,33 % | 3,34 % | 51,5 % | 0,293 s |

Las latencias del baseline PyTorch en `bench_v2_clean` fueron 0,32 s/clip (greedy) y 0,37 s/clip (Beam-5) de mediana sobre los 975 clips en la misma CPU.

## Requisitos de hardware

- VRAM: no aplica, el modelo está diseñado para inferencia en CPU; en GPU requeriría aproximadamente 0,4 GB en INT8.
- GPU recomendadas: no disponible; el modelo se distribuye y evalúa para CPU.
- Cabe en cualquier CPU de consumo moderna; medido en Intel Core i5-13400F. El repo ocupa 0,4 GB en disco.
- Opciones de despliegue: `onnxruntime` (CPUExecutionProvider) con el script `krama_onnx.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,188 s/clip en greedy y 0,293 s/clip en Beam-5 (mediana sobre 975 clips); hasta 1,76× más rápido que el modelo PyTorch en la misma CPU.
- Throughput: no disponible de forma explícita; a partir de la latencia mediana se puede estimar en torno a 5 clips/s en greedy y 3,4 clips/s en Beam-5 con un solo hilo de proceso en i5-13400F.

## Comparativa con modelos similares

| Modelo | Formato | Pesos | Dependencias | CER macro (5 dominios) | Licencia |
|---|---|---:|---|---:|---|
| `Nukthean/krama-asr-khmer-onnx` (este) | ONNX INT8 | 358,3 MiB | `onnxruntime`, `numpy`, `soundfile`, `soxr` | 3,34 % (Beam-5) | Apache 2.0 |
| `Nukthean/krama-asr-khmer` | PyTorch bfloat16 SafeTensors | 658,2 MiB | `torch>=2.6`, `transformers>=5.22`, `safetensors` | 3,33 % (Beam-5) | Apache 2.0 |
| Otros ASR de jemer | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta jemer (`km`); no es multilingüe.
- El rendimiento cae en hablantes y texto no vistos: el CER en FLEURS test sube al 6,39 % (greedy) frente al 3,63 % en dominio, y la exactitud Beam-5 baja al 17,5 %.
- La model card no documenta sesgos demográficos ni geográficos del corpus de entrenamiento; el rendimiento puede variar según acento, dialecto y calidad de grabación.
- Riesgo de alucinación en audio ruidoso o con habla solapada no cuantificado en la información disponible.
- El decoder es opcional y solo se usa para Beam-5; la decodificación greedy es más rápida pero menos precisa (3,59 % vs. 3,34 % de CER macro).
- La gestión de hilos por defecto limita `intra_op_num_threads` a `min(6, max(1, cpu_count // 2))`; conviene revisarla en hardware con topología distinta a la medida.
- El normalizador de evaluación elimina espacios y puntuación, por lo que la salida no incluye segmentación ni puntuación natural del jemer.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento citados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Nukthean/krama-asr-khmer-onnx
- Modelo base: https://huggingface.co/Nukthean/krama-asr-khmer
- Dataset del autor: https://huggingface.co/datasets/Nukthean/krama-asr-khmer-corpus
- Dataset DDD: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- FLEURS: https://huggingface.co/datasets/google/fleurs
- iAny Khmer Voice: https://huggingface.co/datasets/sengtha/iany-khmer-voice
- Khmer GRKPP Speech: https://huggingface.co/datasets/seanghay/khmer_grkpp_speech
- OpenSLR 42: https://huggingface.co/datasets/openslr/openslr_42
