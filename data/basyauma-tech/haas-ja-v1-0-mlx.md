# basyauma-tech/Haas-ja-v1.0-mlx

## Resumen

Haas-ja-v1.0-mlx es una conversión no oficial al formato MLX del modelo de reconocimiento automático del habla (ASR) en japonés `third-intelligence/Haas-ja-v1.0`, desarrollado por Third Intelligence, Inc. El modelo original emplea una arquitectura FastConformer como codificador y un decodificador TDT (Token-and-Duration Transducer), con una red de predicción basada en Kimi Delta Attention. Esta conversión, publicada por el usuario `basyauma-tech`, permite ejecutar el modelo en Apple Silicon sin NeMo, CUDA ni Triton, que son requisitos del entorno oficial del modelo original (Linux + GPU NVIDIA + NeMo 2.7).

El modelo resuelve la transcripción de voz en japonés con una precisión publicada de 6,12 % de CER estricto en el conjunto de evaluación asr-ja-bench v1.1 (promedio de los cinco subconjuntos), y valores medidos de 3,65 % en FLEURS y 4,51 % en JVNV para esta conversión MLX. Con 615,9 millones de parámetros y un tamaño de repositorio de 1,2 GB, es un modelo compacto que cabe en memoria unificada de cualquier Mac con Apple Silicon y ofrece un rendimiento de unas 256 veces el tiempo real (RTFx) en un M5 Max.

La relevancia actual radica en que democratiza el acceso a un ASR japonés de alta calidad en hardware de consumo Apple, sin dependencia de ecosistemas CUDA, y con licencia Apache 2.0 que permite uso comercial. No obstante, la conversión no incluye código de inferencia: este debe obtenerse del repositorio GitHub `basyauma-tech/haas-ja-local`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT (decodificador), red de predicción con Kimi Delta Attention |
| Parametros totales | 615.871.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa fragmentos de hasta 30 s; audio más largo se segmenta automáticamente) |
| Tipos de cuantizacion | bfloat16 (pesos sin cuantizar; la etiqueta "quantized" de Hugging Face es incorrecta según el autor) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 1.231.827.296 bytes), tokenizer SentencePiece (BPE, 3.072 vocabulario) |

## Arquitectura y entrenamiento

El modelo original Haas-ja-v1.0 combina un codificador FastConformer con un decodificador TDT (Token-and-Duration Transducer). La innovación técnica destacable es el uso de Kimi Delta Attention en la red de predicción, lo que según el autor requiere Triton y CUDA para su ejecución, excluyendo CPU y macOS del entorno oficial. El modelo se distribuye originalmente como un único archivo `.nemo` para NeMo 2.7.

Esta conversión MLX no modifica los valores de los pesos: mantiene los tensores en bfloat16, reordena los ejes de las convoluciones para adaptarlos al layout de MLX y elimina la clave `num_batches_tracked` (no usada en inferencia). No se ha realizado cuantización alguna. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La verificación numérica de la conversión reporta diferencias máximas de 9,54e-07 en log-mel, 4,36e-06 de error relativo en la salida del codificador y 1,16e-06 en los logits de la red de combinación, con coincidencia total de la secuencia de tokens en 6 utterances de FLEURS.

## Capacidades

- Reconocimiento automático del habla en japonés (transcripción de audio a texto).
- Procesamiento de audio de hasta 30 segundos por fragmento; audio más largo se segmenta automáticamente buscando el punto más silencioso en una ventana de ±2 s alrededor de los 30 s.
- Generación de marcas de tiempo a nivel de token (inicio y fin en segundos, resolución de 80 ms correspondiente a los frames del codificador).
- Acepta formatos de audio legibles por soundfile (WAV, FLAC, etc.); convierte a mono promediando canales y remuestrea a 16 kHz con soxr.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras modalidades (visión, audio generativo). Es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en japonés: el modelo procesa audio largo mediante segmentación automática en fragmentos de 30 s, con un rendimiento de 33,8 minutos de audio en 6,97 s en un M5 Max, lo que lo hace adecuado para transcripciones casi en tiempo real en local.
- Subtitulado y generación de transcripciones con marcas de tiempo: la opción `--json --timestamps` produce marcas por token con resolución de 80 ms, útil para alinear subtítulos o para análisis temporal de habla.
- Aplicaciones de dictado y notas de voz en macOS: al ejecutarse en Apple Silicon sin CUDA, puede integrarse en apps nativas de Mac con un consumo de memoria de 1,57 GB de RSS en el peor caso medido.
- Procesamiento por lotes de archivos de audio en pipelines locales: el CLI `haas-ja-local transcribe` permite automatizar la transcripción de directorios completos sin dependencias de GPU NVIDIA.
- Investigación en ASR japonés: al ser una conversión fiel con verificación numérica documentada, sirve como referencia para comparar implementaciones MLX frente a PyTorch/NeMo en el benchmark asr-ja-bench.
- Transcripción de contenido multimedia japonés (podcasts, vídeos) en entornos sin acceso a infraestructura cloud, gracias a la licencia Apache 2.0 y a la ejecución totalmente local.

## Benchmarks y rendimiento

Resultados de CER (%) en asr-ja-bench v1.1, medidos con jacer v1.2.0 en Apple M5 Max (MLX 0.32.4, Metal, batch 1):

| Subconjunto | Utterances | Duracion (h) | Metrica | Esta conversion | Valor publicado (NeMo, H200) |
|---|---:|---:|---|---:|---:|
| FLEURS | 650 | 2,36 | CER strict | 3,65 | 3,65–3,67 |
| FLEURS | 650 | 2,36 | CER flex | 2,98 | no disponible |
| FLEURS | 650 | 2,36 | CER kana | 2,33 | no disponible |
| JVNV | 1.375 | 3,33 | CER strict | 4,51 | 4,50–4,53 |
| JVNV | 1.375 | 3,33 | CER flex | 3,06 | no disponible |
| JVNV | 1.375 | 3,33 | CER kana | 2,25 | no disponible |

Rendimiento y memoria en FLEURS (647 utterances, 2,35 h, M5 Max):

| Metrica | Cache 1 GiB (por defecto) | Sin limite |
|---|---:|---:|
| RTFx (mediana por utterance) | 254,2 | 250,9 |
| RTFx (total) | 256,1 | 255,9 |
| RSS pico | 1,57 GB | 2,68 GB |
| Memoria pico MLX | 1,76 GB | 1,82 GB |
| Footprint pico macOS | 3,19 GB | 14,40 GB |

Tiempo medio por utterance: 0,050 s; carga del modelo: 0,15 s. Audio de 33,8 min procesado en 6,97 s (incluyendo arranque y carga), con RSS pico de 1,74 GB. El modelo original reporta un CER estricto global de 6,12 % en los cinco subconjuntos de asr-ja-bench v1.1 según fuentes secundarias; no se han medido los subconjuntos JSUT basic5000, TEDxJP-10K ni SpeechBSD en esta conversión.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 1,2 GB para los pesos en bfloat16; RSS pico medido de 1,57 GB con caché de 1 GiB. Con caché ilimitado, el footprint de macOS puede alcanzar 14,40 GB en ejecuciones largas (comportamiento de MLX, no fuga de memoria).
- GPU recomendadas: Apple Silicon exclusivamente (MLX solo funciona en macOS). Verificado en Apple M5 Max con 128 GB de memoria unificada, macOS 27.2 y mlx 0.32.4. No verificado en Intel Mac ni en equipos con 16 GB o menos.
- Cabe en cualquier Mac con Apple Silicon; el límite práctico es la memoria unificada disponible y la versión de macOS compatible con MLX.
- Opciones de despliegue: paquete `haas-ja-local[mlx]` desde GitHub (Python 3.12, dependencias mlx, numpy, sentencepiece, soundfile, soxr). No compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan esta arquitectura ni MLX.
- Latencia y throughput: RTFx de 254–256 en M5 Max, batch 1 (el código de inferencia solo soporta batch 1). No hay datos para otros chips Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | CER japones | Licencia | Plataforma |
|---|---|---|---|---|---|
| Haas-ja-v1.0-mlx (esta conversion) | 615,9 M | fragmentos de 30 s, segmentacion automatica | 3,65 % FLEURS strict; 4,51 % JVNV strict | Apache 2.0 | Apple Silicon (MLX) |
| Haas-ja-v1.0 (original) | 615,9 M | fragmentos de 30 s | 3,65 % FLEURS strict; 4,50–4,53 % JVNV strict | Apache 2.0 | Linux + NVIDIA + NeMo 2.7 |
| Alternativas ASR japonesas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos ASR japoneses en la información proporcionada, por lo que la comparativa con alternativas de terceros no está disponible.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada, aprobada ni respaldada por Third Intelligence, Inc. El autor lo declara explícitamente.
- Solo japonés: no soporta otros idiomas; el vocabulario SentencePiece es de 3.072 tokens específico para japonés.
- Solo Apple Silicon y macOS: MLX no funciona fuera de macOS; no hay soporte para Intel Mac, Linux, Windows ni GPU NVIDIA en esta conversión.
- No incluye código de inferencia: debe instalarse desde el repositorio GitHub `basyauma-tech/haas-ja-local`; el repositorio de Hugging Face solo contiene pesos, configuración y tokenizer.
- Batch 1 únicamente: el código de inferencia no soporta procesamiento por lotes, lo que limita el throughput en comparación con el modelo original (batch 512 en H200).
- Segmentación de audio largo: la estrategia de corte por silencio puede degradar la precisión en audio con habla continua sin pausas claras o con ruido de fondo constante; no se ha validado en grabaciones largas reales con el mismo hablante.
- Rendimiento no verificado en equipos con 16 GB o menos de memoria unificada ni en chips Apple distintos del M5 Max.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, silencio o habla solapada; no se han publicado análisis específicos de este comportamiento.
- Sesgos: no se han documentado sesgos demográficos, dialectales o de género en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la atribución a Third Intelligence y el aviso de conversión no oficial deben conservarse (archivos LICENSE y NOTICE incluidos).
- La etiqueta "quantized" de Hugging Face es incorrecta: los pesos están en bfloat16 sin cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/basyauma-tech/Haas-ja-v1.0-mlx
- Modelo original: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Repositorio de inferencia: https://github.com/basyauma-tech/haas-ja-local
- Registro de verificación (precisión y velocidad): https://github.com/basyauma-tech/haas-ja-local/blob/main/docs/verification/2026-11-08-mac-mlx.md
- Registro de verificación (coincidencia numérica): https://github.com/basyauma-tech/haas-ja-local/blob/main/docs/verification/2026-11-08-mac-numerics.md
- Dataset de evaluación asr-ja-bench: https://huggingface.co/datasets/third-intelligence/asr-ja-bench
- Herramienta de métricas jacer: https://github.com/third-intelligence/jacer
- Artículo técnico (tech-insider.org): https://tech-insider.org/haas-ja-v1-0-japanese-asr-6-12-percent-cer-open-model-2026/
- Artículo técnico (shattered.io): https://shattered.io/haas-ja-v1-0-japanese-speech-recognition-6-12-percent-cer-open-model-2026/
