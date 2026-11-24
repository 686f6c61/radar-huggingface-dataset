# oruk/oruk-fourier-2b

## Resumen
oruk-fourier-2b es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por Oruk, un proveedor de APIs de voz (STT, tono y agentes de voz). Se distribuye bajo licencia CC BY-NC 4.0 en formato nativo de `transformers` mediante la clase `Qwen3ASRForConditionalGeneration`, y deriva del modelo base Qwen/Qwen3-ASR-1.7B, con un ajuste posterior sobre Musci-research/Musci-ASR-qwen-1019-hf.

El modelo cuenta con 2.038.052.480 parametros (aproximadamente 2,04 mil millones) y esta especializado en transcripcion de audio corto en ingles (hasta 30 segundos por clip). Su relevancia actual radica en que ofrece pesos abiertos en multiples formatos de despliegue (safetensors BF16, GGUF Q8_0 para llama.cpp y transcribe.cpp, ONNX INT8 para sherpa-onnx y MLX de 8 bits para Apple Silicon), lo que facilita su ejecucion tanto en servidores con GPU como en portatiles y dispositivos de consumo.

La propuesta de valor es un ASR compacto con un WER medio agregado de 4,95 % en las siete particiones por defecto del Open ASR Leaderboard y un RTFx agregado de 267,80 sobre una NVIDIA H200, lo que lo situa como una alternativa ligera para dictado, subtitulado y transcripcion de reuniones en ingles.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer condicional para ASR (clase `Qwen3ASRForConditionalGeneration`, derivada de Qwen3-ASR) |
| Parametros totales | 2.038.052.480 (aprox. 2,04 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de hasta 30 segundos por clip segun la model card) |
| Tipos de cuantizacion | BF16 (nativo), Q8_0 (GGUF), INT8 (ONNX), 8-bit (MLX) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-NC 4.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q8_0), ONNX (INT8), MLX (8-bit) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura de Qwen3-ASR: un encoder de audio acoplado a un decoder de lenguaje de tipo transformer condicional que genera la transcripcion de forma autorregresiva. La clase de implementacion es `Qwen3ASRForConditionalGeneration` y se carga mediante `AutoModelForMultimodalLM` y `AutoProcessor` de `transformers` (la model card indica la version 5.24.0). El checkpoint nativo pesa aproximadamente 4,1 GB en BF16 y el repositorio completo ocupa 13,3 GB, incluyendo todas las variantes de formato.

El entrenamiento parte de Qwen/Qwen3-ASR-1.7B y pasa por un ajuste sobre Musci-research/Musci-ASR-qwen-1019-hf, del que no se detallan en la informacion disponible ni el volumen de tokens, ni la composicion del corpus, ni si hubo etapas de RLHF o DPO. Tampoco se especifican innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.). La model card si documenta el pipeline de evaluacion: harness oficial `hf-audio/open-asr-leaderboard-transformers` con `batch_size=64`, `bfloat16`, atencion `sdpa` y `max_new_tokens=512`.

## Capacidades
- Transcripcion de voz a texto en ingles para clips de hasta 30 segundos.
- Procesamiento de audio mono a 16 kHz (el ejemplo oficial mezcla estereo a mono y remuestrea).
- Ejecucion en CPU y GPU: selecciona CUDA cuando esta disponible y recurre a CPU en caso contrario.
- Despliegue en multiples runtimes: `transformers`, llama.cpp, transcribe.cpp, sherpa-onnx, MLX y Speech Kit (integracion con Obsidian).
- Integracion en aplicaciones de dictado local: Hex y VocaPhone (dictado en puesto de trabajo permitido por el autor).
- Compatibilidad con la app Handy mediante el GGUF Q8_0.
- Demo en navegador (Hugging Face Space estatico) con descarga unica del modelo de 2,19 GB en Chromium de escritorio.
- No se documentan capacidades de tool calling, agentes, vision, audio de salida ni modo de razonamiento extendido.

## Casos de uso
- Dictado en puesto de trabajo: el modelo puede transcribir notas de voz cortas en local mediante Hex o VocaPhone, sin enviar audio a la nube, gracias a su tamano de 2,04 B y a las variantes GGUF/MLX que caben en equipos de consumo.
- Subtitulado de reuniones y entrevistas: con un WER de 6,73 % en AMI-Cleaned y 5,61 % en Earnings22, es adecuado para generar subtitulos en ingles de audio financiero y conversacional, procesando clips de hasta 30 segundos de forma secuencial.
- Transcripcion por lotes de llamadas de atencion al cliente: su RTFx de 267,80 en H200 permite procesar grandes volumenes de grabaciones en ingles en pipelines batch con `transformers` y `bfloat16`.
- Aplicaciones de escritorio offline: la integracion con Handy y el GGUF Q8_0 (2,19 GB) permiten transcribir sin conexion tras la descarga inicial, con `HF_HUB_OFFLINE=1` en el flujo de `transformers`.
- Asistentes de voz embebidos: la variante ONNX INT8 para sherpa-onnx (2,41 GB) posibilita desplegar ASR en entornos con recursos limitados o en dispositivos sin GPU dedicada.
- Investigacion y evaluacion reproducible: los scripts de evaluacion, el fichero `verification.json` y los resultados por grabacion permiten reproducir el WER en LibriSpeech test-clean y FLEURS, util para comparativas academicas de ASR en ingles.
- Prototipado en Apple Silicon: la variante MLX de 8 bits (2,48 GB) permite ejecutar el modelo en Mac con Swift o Lumen para demos y pruebas de concepto.

## Benchmarks y rendimiento
Resultados del Open ASR Leaderboard (ingles corto publico, H200, harness oficial):

| Dataset | WER (%) | RTFx |
|:---|---:|---:|
| AMI-Cleaned | 6,73 | 216,26 |
| Earnings22-Cleaned-AA-chunked | 5,61 | 192,92 |
| Gigaspeech-Cleaned | 6,50 | 239,28 |
| SPGISpeech | 1,87 | 291,68 |
| URGENT2024 | 9,03 | 252,11 |
| Voice Arena Monsoon | 3,42 | 221,96 |
| Voxpopuli-AA-Cleaned | 1,46 | 258,62 |
| **Media (7 splits) / RTFx agregado** | **4,95** | **267,80** |
| URGENT2024-Clean (extra, excluido de la media) | 4,28 | 248,80 |

Resultados adicionales publicados:
- GGUF Q8_0 con transcribe.cpp v0.4.2 en NVIDIA L40S: 1,40 % WER en LibriSpeech test-clean (2.620 grabaciones) y 3,58 % WER en FLEURS ingles estadounidense (647 grabaciones).
- Habla solapada de reuniones (16 ventanas publicas de AMI, 27,4 minutos, 4.201 palabras): 17,50 % WER en BF16 sobre A10G, frente al 17,64 % publicado para Qwen3-ASR 1.7B en 8-bit MLX sobre M4 Max; los intervalos de confianza al 95 % se solapan.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 4,5-5 GB en BF16 (checkpoint de 4,1 GB mas activaciones), en torno a 2,5-3 GB en Q8_0/INT8 y cerca de 2,5 GB en MLX 8-bit.
- GPU recomendadas: NVIDIA H200 (referencia de los benchmarks, RTFx 267,80), L40S (evaluacion Q8), A10G (evaluacion BF16 en AMI). Cualquier GPU con al menos 6 GB de VRAM puede ejecutar la variante BF16; las variantes cuantizadas bajan el umbral a unos 3 GB.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4090) usando Q8_0 o INT8; en BF16 se recomienda 8 GB o mas.
- Opciones de despliegue: `transformers` (version 5.24.0), llama.cpp, transcribe.cpp, sherpa-onnx, MLX (Swift o Lumen), Speech Kit para Obsidian y la app Handy.
- Latencia y throughput: RTFx agregado de 267,80 en H200 con `batch_size=64` y `bfloat16`; RTFx por dataset entre 192,92 (Earnings22) y 291,68 (SPGISpeech). No se publican latencias absolutas ni throughput en otras GPU.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto / audio | WER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oruk-fourier-2b | 2,04 B | clips de hasta 30 s | 4,95 % (media Open ASR, 7 splits) | CC BY-NC 4.0 | Pesos abiertos en HF (BF16, GGUF, ONNX, MLX) |
| Qwen3-ASR 1.7B (base) | 1,7 B | no disponible | 17,64 % WER en AMI solapado (8-bit MLX, M4 Max) | no disponible en la informacion proporcionada | Pesos abiertos en HF |
| Musci-ASR-qwen-1019-hf | no disponible | no disponible | no disponible | no disponible | Pesos abiertos en HF |

La comparacion directa solo es posible con el modelo base Qwen3-ASR 1.7B en el benchmark de habla solapada de AMI, donde las diferencias (17,50 % frente a 17,64 %) no son estadisticamente significativas segun los intervalos publicados. No se dispone de datos de otros modelos ASR comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Solo soporta ingles; no se documenta soporte multilingue.
- Disenado para clips de hasta 30 segundos; no se especifica manejo de audio largo ni diarizacion de hablantes.
- La licencia CC BY-NC 4.0 prohibe el uso comercial sin autorizacion expresa; el autor solo menciona permisos adicionales para dictado local en Hex y VocaPhone.
- Riesgo de alucinacion y errores en audio con ruido, acentos no estadounidenses o solapamiento de voces: el WER sube al 9,03 % en URGENT2024 y al 17,50 % en AMI con habla solapada.
- No se detallan sesgos demograficos ni de dominio; la evaluacion se limita a los conjuntos publicos del leaderboard.
- El rendimiento en produccion depende del runtime y la cuantizacion: los resultados de Q8_0 se obtuvieron con transcribe.cpp v0.4.2 y pueden variar en otras implementaciones.
- La model card no documenta el proceso de entrenamiento (tokens, composicion del corpus, alineamiento), lo que limita la auditabilidad del modelo.
- Requiere `transformers` 5.24.0 y fijar la revision del checkpoint para reproducir los resultados publicados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/oruk/oruk-fourier-2b
- Web de Oruk: https://oruk.ai/
- Modelos de Oruk: https://oruk.ai/models
- Demo en navegador: https://oruk-fourier-2b-local.static.hf.space/index.html
- Cuaderno Colab: https://huggingface.co/oruk/oruk-fourier-2b/colab
- Cuaderno Kaggle: https://huggingface.co/oruk/oruk-fourier-2b/kaggle
- Ejemplo de transcripcion en Python: https://huggingface.co/oruk/oruk-fourier-2b/blob/main/examples/transcribe.py
- Ejemplo llama.cpp: https://huggingface.co/oruk/oruk-fourier-2b/tree/main/examples/llama-cpp
- Ejemplo sherpa-onnx: https://huggingface.co/oruk/oruk-fourier-2b/tree/main/examples/sherpa-onnx
- Ejemplo Speech Kit para Obsidian: https://huggingface.co/oruk/oruk-fourier-2b/tree/main/examples/obsidian-speech-kit
- Verificacion de evaluacion Open ASR: https://huggingface.co/oruk/oruk-fourier-2b/blob/main/evaluations/open-asr/verification.json
- Evaluacion Q8 en ingles: https://huggingface.co/oruk/oruk-fourier-2b/tree/main/evaluations/q8-english
- Resultados AMI de LokalBot: https://huggingface.co/oruk/oruk-fourier-2b/blob/main/evaluations/lokalbot-public-ami/summary.json
- PR de envio al Open ASR Leaderboard: https://github.com/huggingface/open_asr_leaderboard/pull/298
- Reproduccion del benchmark LokalBot: https://github.com/Nathan-Roll1/LokalBot/blob/c42c7f1ccb3778d7cf135abf49442e4a84ab2fe8/Benchmarks/transcribe/CloudSTT/results/2026-11-22-fourier/REPORT.md
- Envio del benchmark a LokalBot: https://github.com/stevyhacker/LokalBot/pull/576
- Modelo base Qwen3-ASR 1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo intermedio Musci-ASR: https://huggingface.co/Musci-research/Musci-ASR-qwen-1019-hf
- Otro modelo de Oruk en Hugging Face: https://huggingface.co/oruk/orukeet
