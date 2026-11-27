# basyauma-tech/Haas-ja-v1.0-mlx

## Resumen

Haas-ja-v1.0-mlx es una conversión no oficial al framework MLX del modelo de reconocimiento automático del habla (ASR) Haas-ja-v1.0, desarrollado originalmente por Third Intelligence, Inc. El modelo base está especializado en japonés y combina un encoder FastConformer con un decoder TDT (Token-and-Duration Transducer) cuya red de predicción utiliza Kimi Delta Attention. Esta versión MLX permite ejecutar el modelo en Apple Silicon sin necesidad de NeMo, CUDA ni Triton, eliminando la dependencia de Linux y GPUs NVIDIA que imponía el entorno oficial (NeMo 2.7).

La conversión la firma el usuario basyauma-tech y mantiene los pesos en bf16 originales, aplicando únicamente una reordenación de ejes y la eliminación del tensor `num_batches_tracked`, que no interviene en la inferencia. Aunque Hugging Face clasifica el repositorio como `quantized`, el modelo no está cuantizado; existe una variante aparte de 8 bits (aproximadamente 0,73 GB). El modelo tiene 615.871.520 parámetros y un tamaño de repositorio de 1,2 GB.

Su relevancia radica en que democratiza el acceso a un ASR japonés de calidad estado del arte en hardware de consumo Apple, con un rendimiento medido de RTFx en torno a 254-256 sobre un M5 Max y una huella de memoria moderada (1,57 GB de RSS en configuración por defecto). Es una pieza útil para transcripción local de audio japonés en entornos macOS sin infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer + decoder TDT (Token-and-Duration Transducer) con red de predicción Kimi Delta Attention |
| Parametros totales | 615.871.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa fragmentos de hasta 30 segundos; audio superior se segmenta) |
| Tipos de cuantizacion | bf16 (este repositorio, sin cuantizar); variante 8-bit disponible en basyauma-tech/Haas-ja-v1.0-mlx-8bit |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 1.231.827.296 bytes), tokenizer SentencePiece BPE de 3.072 tokens |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura FastConformer para el encoder, una variante de Conformer con atención por bloques que reduce el coste computacional en secuencias de audio largas. El decoder es un TDT (Token-and-Duration Transducer), que predice simultáneamente el token y su duración, lo que permite un alineamiento temporal implícito y mejora la robustez frente a variaciones de velocidad del habla. La red de predicción del decoder incorpora Kimi Delta Attention, un mecanismo de atención lineal que reduce el coste cuadrático en la predicción autoregresiva.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF o DPO. El modelo original fue entrenado y evaluado en el entorno oficial de NeMo 2.7 sobre GPUs NVIDIA (H200 para las cifras publicadas). La conversión MLX no reentrena ni modifica los pesos más allá del reordenamiento de ejes, por lo que las capacidades y sesgos del modelo base se conservan íntegramente.

## Capacidades

- Reconocimiento automático del habla en japonés a partir de audio en formatos compatibles con soundfile (WAV, FLAC y otros), con conversión interna a 16 kHz mono mediante soxr.
- Segmentación automática de audio largo: fragmenta audio de más de 30 segundos eligiendo el punto de corte en la ventana de 0,1 segundos más silenciosa dentro de los 30 ± 2 segundos de cada fragmento, y concatena los resultados.
- Salida con marcas de tiempo a nivel de token en incrementos de 80 ms, exportable a JSON con una línea por archivo.
- Procesamiento por lotes de un solo archivo (batch 1); no soporta streaming ni etiquetado de hablantes.
- No soporta vocabulario personalizado del paquete oficial Haas-ASR.
- No realiza puntuación ni normalización de estilo (no permite especificar kanji, kana o formato numérico en la salida).
- Ejecución local en Apple Silicon sin dependencias de torch, CUDA, NeMo ni Triton.

## Casos de uso

- Transcripción local de reuniones y entrevistas en japonés en estaciones de trabajo macOS: el modelo procesa audio de hasta 30 segundos por fragmento con segmentación automática y permite obtener transcripciones con marcas de tiempo en JSON, adecuadas para generar subtítulos o índices de búsqueda.
- Subtitulado y alineamiento temporal de vídeo: la salida con timestamps cada 80 ms permite sincronizar subtítulos con el audio en herramientas de postproducción, aunque las marcas son por token y no por palabra.
- Archivado y búsqueda de contenido audiovisual japonés: transcripción por lotes de grabaciones largas (el ejemplo documentado procesa 33,8 minutos en 6,97 segundos incluyendo carga del modelo) para indexar y hacer searchable un archivo de audio.
- Investigación en ASR y evaluación de modelos: al ser una conversión fiel con pesos bf16 y código de inferencia abierto, sirve como referencia para comparar implementaciones MLX frente a PyTorch/NeMo con el benchmark asr-ja-bench v1.1 y el framework jacer.
- Prototipado rápido en portátiles Apple: con una huella de 1,57 GB de RSS y arranque de 0,15 segundos con caché del sistema operativo, permite iterar sobre pipelines de ASR sin infraestructura GPU.
- Transcripción de notas de voz y grabaciones cortas en aplicaciones macOS: la API de Python (`load_model`, `transcribe`) y la CLI facilitan integrar el modelo en scripts o herramientas internas para audio de menos de 30 segundos, donde el modelo alcanza su mejor CER.
- Evaluación de calidad de audio y control de ruido: aunque no está diseñado para ello, la sensibilidad a silencios y ruido documentada permite usar el modelo como sonda para detectar segmentos problemáticos en grabaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor de la conversión sobre asr-ja-bench v1.1 con jacer v1.2.0, medidos en Apple M5 Max (128 GB), macOS 27.2, mlx 0.32.4, batch 1, encoder bf16 y redes de predicción/unión en float32. Unidades en porcentaje (CER, menor es mejor).

| Subconjunto | Utterances | Audio (h) | Metrica | Esta conversion | Valor publicado | Diferencia (pp) |
|---|---:|---:|---|---:|---:|---:|
| FLEURS | 650 | 2,36 | CER strict | 3,65 | 3,65-3,67 | 0,00 |
| FLEURS | 650 | 2,36 | CER flex | 2,98 | no verificado | - |
| FLEURS | 650 | 2,36 | CER kana | 2,33 | no verificado | - |
| JVNV | 1.375 | 3,33 | CER strict | 4,51 | 4,50-4,53 | 0,00 |
| JVNV | 1.375 | 3,33 | CER flex | 3,06 | no verificado | - |
| JVNV | 1.375 | 3,33 | CER kana | 2,25 | no verificado | - |

Los valores publicados corresponden al entorno oficial (NeMo, bf16, H200). No se han medido JSUT basic5000, TEDxJP-10K ni SpeechBSD. La comparación entre la implementación MLX (bf16) y la referencia PyTorch (float32) muestra coincidencia de tokens y texto en 632 de 650 utterances de FLEURS (97,2 %); de las 18 discrepancias, 12 son solo de puntuación.

Rendimiento medido sobre 647 utterances de FLEURS (2,35 h), batch 1, sin contar carga de audio:

| Metrica | Por defecto (cache 1 GiB) | Sin limite (referencia) |
|---|---:|---:|
| RTFx (mediana por utterance) | 254,2 | 250,9 |
| RTFx (total audio / total tiempo) | 256,1 | 255,9 |
| RSS pico | 1,57 GB | 2,68 GB |
| Asignacion pico mlx | 1,76 GB | 1,82 GB |
| Huella de memoria pico macOS | 3,19 GB | 14,40 GB |

En una prueba con 33,8 minutos de audio divididos en 68 fragmentos, el CLI completo (incluyendo arranque y carga del modelo) tardó 6,97 segundos con un RSS máximo de 1,74 GB y una huella pico de 3,48 GB.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (Mac). No funciona en Linux, Windows ni GPUs NVIDIA/AMD.
- Memoria: pesos en bf16 de aproximadamente 1,2 GB; RSS pico medido de 1,57 GB con caché Metal de 1 GiB por defecto. La huella pico de macOS llega a 3,19 GB en configuración por defecto y a 14,40 GB sin límite de caché, debido a la retención de buffers Metal liberados (no es una fuga).
- GPU recomendadas: Apple M5 Max (único hardware verificado, 128 GB). No se han probado otros chips Apple Silicon, ni Macs Intel, ni equipos con 16 GB o menos de memoria.
- Cabe en GPUs de consumo: sí, en Apple Silicon de gama alta; no se ha verificado en chips de gama baja ni en equipos con memoria unificada reducida.
- Opciones de despliegue: paquete `haas-ja-local[mlx]` (instalable desde GitHub), CLI `haas-ja-local transcribe` y API de Python (`load_model`, `transcribe`, `load_audio`). No compatible con vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de audio y no de texto.
- Dependencias de ejecución: Python 3.12 (>=3.12,<3.13), mlx, numpy, sentencepiece, soundfile, soxr. No requiere torch.
- Latencia y throughput: RTFx mediana de 254,2 y agregada de 256,1 sobre M5 Max; 0,050 s de mediana por utterance de FLEURS sin límite de caché. El modelo original declara RTFx sobre H200 con batch 512, no comparable con estas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Entorno | Notas |
|---|---|---|---|---|---|
| Haas-ja-v1.0-mlx (este) | 615,9 M | fragmentos de hasta 30 s, segmentacion automatica | Apache-2.0 | MLX, Apple Silicon | Conversion no oficial, bf16, sin cuantizar |
| third-intelligence/Haas-ja-v1.0 | no disponible | no disponible | Apache-2.0 | NeMo 2.7, Linux + NVIDIA | Modelo base oficial; referencia de CER publicado |
| basyauma-tech/Haas-ja-v1.0-mlx-8bit | no disponible | no disponible | Apache-2.0 | MLX, Apple Silicon | Variante cuantizada a 8 bits, ~0,73 GB |
| Sanami/haas-ja-onnx | no disponible | no disponible | Apache-2.0 | ONNX Runtime | Conversion float32 usada solo para comparacion numerica; no redistribuye pesos |

No se dispone en la información proporcionada de comparaciones con otros modelos ASR japoneses (por ejemplo, Whisper o modelos de la familia ReazonSpeech), por lo que no se incluyen cifras de rendimiento cruzadas.

## Limitaciones y advertencias

- Es una conversión no oficial: no está afiliada, aprobada ni respaldada por Third Intelligence, Inc. La atribución debe mantenerse según el archivo NOTICE.
- El modelo omite con frecuencia muletillas del habla («えー», «あの») y no permite especificar la representación de kanji, kana o números en la salida.
- Puede emitir palabras cortas en segmentos de silencio o ruido. En pruebas sintéticas de 10 s de silencio y ruido blanco débil no produjo salida, pero no se ha verificado con grabaciones reales.
- La segmentación de audio de más de 30 segundos degrada el CER: en 33,8 minutos concatenados de FLEURS, el CER strict pasa de 4,10 % (por utterance) a 6,44 % (segmentación a ~30 s). Aproximadamente 1 punto se debe a la concatenación de hablantes distintos y 1,4 puntos a cortes en mitad de utterance (50 de 67 fronteras). En grabaciones reales de un solo hablante el impacto podría ser menor.
- Solo soporta batch 1; no hay streaming, etiquetado de hablantes ni vocabulario personalizado del paquete oficial Haas-ASR.
- Las marcas de tiempo son por token, no por palabra.
- Solo se ha verificado en un único equipo (M5 Max, 128 GB, macOS 27.2, mlx 0.32.4); no hay datos para Macs Intel, equipos con 16 GB o menos, ni batch superior a 1.
- La evaluación JVNV usó remuestreo a 16 kHz con ffmpeg 9.0.2 en lugar de la versión 7.1 prevista, por lo que podría haber diferencias menores respecto al audio oficial.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgo en la información disponible; al ser un modelo entrenado para japonés, su uso fuera de ese idioma no está soportado.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a Third Intelligence, Inc. y el aviso de conversión no oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/basyauma-tech/Has-ja-v1.0-mlx (URL indicada en la información: https://huggingface.co/basyauma-tech/Haas-ja-v1.0-mlx)
- Variante 8-bit: https://huggingface.co/basyauma-tech/Haas-ja-v1.0-mlx-8bit
- Modelo base oficial: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Código de inferencia: https://github.com/basyauma-tech/haas-ja-local
- Documentación de precisión y velocidad: https://github.com/basyauma-tech/haas-ja-local/blob/main/docs/verification/2026-11-08-mac-mlx.md
- Documentación de coincidencia numérica: https://github.com/basyauma-tech/haas-ja-local/blob/main/docs/verification/2026-11-08-mac-numerics.md
- Dataset de evaluación: https://huggingface.co/datasets/third-intelligence/asr-ja-bench
- Framework de evaluación jacer: https://github.com/third-intelligence/jacer
- Paquete oficial de inferencia Haas-ASR: https://github.com/third-intelligence/Haas-ASR
- Conversión MLX alternativa: https://github.com/matsuurajun/haas-mlx
- Conversión ONNX float32: https://huggingface.co/Sanami/haas-ja-onnx
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
