# basyauma-tech/Haas-ja-v1.0-onnx

## Resumen

Haas-ja-v1.0-onnx es una conversión no oficial a formato ONNX del modelo de reconocimiento automático del habla (ASR) en japonés third-intelligence/Haas-ja-v1.0, publicada por el usuario basyauma-tech. El objetivo es permitir la inferencia en CPU sin depender de NeMo, CUDA ni Triton, usando únicamente ONNX Runtime. El paquete incluye dos variantes: fp32 (conversión directa del bf16 original a float32) e int8 (cuantización dinámica de ONNX Runtime), siendo fp32 la variante por defecto.

El modelo subyacente es un FastConformer con decodificación TDT (Token-and-Duration Transducer) especializado en japonés, orientado a transcripción de audio de hasta 30 segundos por segmento. La conversión mantiene una equivalencia numérica muy alta con la implementación de referencia en PyTorch: en FLEURS completo (650 enunciados) el texto generado coincide, con errores máximos relativos del orden de 1e-06 en las salidas internas.

La relevancia de esta ficha radica en que ofrece una vía práctica de despliegue de un ASR japonés de calidad en hardware sin GPU, con métricas de precisión y velocidad medidas y reproducibles sobre un Apple M5 Max, y con advertencias explícitas sobre qué variante cumple los umbrales de calidad del autor original. La variante int8 no alcanza el criterio de precisión en FLEURS, por lo que el uso recomendado en producción es fp32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parámetros totales | no disponible (tamaño del checkpoint original: 1.232.384.000 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | segmentos de audio de hasta 30 segundos; audio más largo se divide secuencialmente |
| Tipos de cuantización | fp32 (por defecto) e int8 (cuantización dinámica per-channel de ONNX Runtime, `reduce_range=False`) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder con pesos externos `.data` y `decoder_joint.onnx`) |
| Librería | onnx / onnxruntime |
| Entrada de audio | WAV, FLAC y otros formatos soportados por soundfile; remuestreo a 16 kHz con soxr |
| Dependencias de ejecución | onnxruntime, numpy, sentencepiece, soundfile, soxr (sin torch) |
| Versión de Python | >=3.12,<3.13 |
| Tamaño del repositorio | ~3,1 GB (fp32 ~2,46 GB, int8 ~0,62 GB) |
| Modelo base | third-intelligence/Haas-ja-v1.0 (revisión `660728d39019e5e065046154beca44ac9a66a540`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es FastConformer, una variante de Conformer con downsampling en el encoder, combinada con un decodificador TDT. TDT predice conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación frente a un transducer convencional y mejora la eficiencia en secuencias largas. El modelo está especializado en japonés y procesa audio mono a 16 kHz.

Sobre el entrenamiento del modelo original no se proporciona información en la documentación disponible: no se detallan el número de tokens de audio, la composición del corpus, ni si hubo etapas de ajuste fino con RLHF/DPO (poco habituales en ASR). Lo que sí está documentado es el proceso de conversión: exportación desde la implementación de referencia en PyTorch a ONNX (torch 2.15.0, onnx 1.23.2, onnxruntime 1.31.1), con verificación numérica frente a PyTorch float32. En 6 enunciados, el error máximo fue de 9,54e-07 en log-mel, 3,82e-06 relativo en la salida del encoder y 1,11e-06 relativo en la red de combinación, con coincidencia total de la secuencia de tokens. La cuantización int8 aplica cuantización dinámica per-channel tanto al encoder como al decoder.

## Capacidades

- Reconocimiento automático del habla en japonés a partir de audio de hasta 30 segundos por segmento.
- Segmentación automática de audio largo: divide en fragmentos de 30 s ± 2 s eligiendo como punto de corte el centro de la ventana de 0,1 s más silenciosa.
- Salida de texto plano y, con `--json --timestamps`, JSON por línea con marcas de inicio y fin por token.
- Funcionamiento en CPU sin GPU, sin NeMo, sin CUDA y sin Triton.
- Conversión automática a mono promediando canales y remuestreo a 16 kHz.
- Ejecución mediante CLI (`haas-ja-local transcribe`) o API de Python (`load_model`, `load_audio`, `transcribe`).
- Selección de variante (fp32/int8) y número de hilos en tiempo de carga.
- No soporta tool calling, agentes, visión, audio de entrada más allá de la transcripción ni modos de razonamiento: es un modelo ASR puro.

## Casos de uso

- Transcripción de reuniones y entrevistas en japonés: el modelo procesa audio largo mediante segmentación automática en fragmentos de 30 s y concatenación de resultados, adecuado para actas y notas.
- Subtitulado de vídeo y podcasts: la salida JSON con timestamps por token permite alinear texto y audio para generar subtítulos.
- Servicios de atención al cliente con voz en japonés: la inferencia en CPU sin GPU abarata el despliegue en entornos con muchos nodos pequeños y sin aceleradores.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de grabaciones para indexación y búsqueda textual posterior.
- Herramientas de accesibilidad: generación de transcripciones en tiempo casi real en equipos de sobremesa o portátiles (RTFx medido entre 66 y 84 en CPU Apple M5 Max).
- Procesamiento en el borde o en entornos aislados: al no requerir CUDA ni torch, se puede empaquetar en contenedores ligeros o dispositivos sin GPU.
- Evaluación y comparación de ASR japonés: sirve como referencia ONNX para contrastar con otras variantes del mismo modelo base (por ejemplo, la conversión int4/int8 de kizuna-intelligence) usando el benchmark asr-ja-bench.

## Benchmarks y rendimiento

Precisión medida sobre asr-ja-bench v1.1 con jacer v1.2.0 (CER en %, CPU Apple M5 Max, batch 1, 8 hilos, media micro, sin puntuación ni espacios):

| Variante | Subconjunto | CER strict | CER flex | CER kana | Valor publicado (strict) | Diferencia (puntos) | Veredicto |
|---|---|---:|---:|---:|---:|---:|---|
| fp32 | FLEURS (650 utt., 2,36 h) | 3,69 | 3,02 | 2,38 | 3,65–3,67 | +0,02 | Cumple |
| fp32 | JVNV (1.375 utt., 3,33 h) | 4,52 | 3,06 | 2,25 | 4,50–4,53 | 0,00 | Cumple |
| int8 | FLEURS | 4,05 | 3,35 | 2,50 | 3,65–3,67 | +0,38 | No cumple |
| int8 | JVNV | 4,43 | 3,16 | 2,33 | 4,50–4,53 | −0,07 | Cumple |

El criterio de aceptación es una diferencia de 0,3 puntos o menos respecto al valor publicado (medido en NeMo, bf16, H200). No se han medido JSUT, TEDxJP-10K ni SpeechBSD.

Velocidad y memoria (CPU Apple M5 Max, batch 1, 647 enunciados de FLEURS, 2,35 h, excluyendo carga de modelo y audio):

| Variante | Hilos | RTFx mediana | RTFx total | RSS pico |
|---|---:|---:|---:|---:|
| fp32 | 4 | 72,4 | 72,7 | 3,24 GB |
| fp32 | 12 | 66,7 | 66,4 | 3,24 GB |
| int8 | 4 | 70,0 | 69,8 | 1,41 GB |
| int8 | 12 | 84,3 | 84,3 | 1,40 GB |

En una prueba de CLI con fp32 sobre 33,8 minutos de audio (68 segmentos), el tiempo total incluyendo arranque y carga del modelo fue de 23,30 s (RTFx 87,0) con RSS máximo de 3,52 GB. El RTFx publicado del modelo original (H200, batch 512) no es comparable.

## Requisitos de hardware

- RAM: la variante fp32 requiere unos 3,2–3,5 GB de RSS pico en inferencia; la int8, unos 1,4 GB.
- Disco: ~2,46 GB para fp32 y ~0,62 GB para int8 (repositorio completo ~3,1 GB).
- GPU: no necesaria; el modelo está pensado para CPU con `CPUExecutionProvider` de ONNX Runtime.
- Hardware medido: Apple M5 Max (128 GB) con 6 núcleos Super y 12 Performance. No se han medido velocidades ni precisión en x86_64, Linux ni Windows.
- Encaje en hardware de consumo: sí, tanto en equipos de sobremesa como en portátiles recientes, dado el reducido consumo de memoria; no se han publicado pruebas en placas como Raspberry Pi ni en GPUs de consumo.
- Despliegue: paquete `haas-ja-local[onnx]` (CLI y API Python) sobre onnxruntime. La compatibilidad con sherpa-onnx no está verificada.
- Latencia y throughput: RTFx entre 66 y 84 en CPU Apple M5 Max según variante e hilos; en fp32, 4 hilos resultaron más rápidos que 12 en las pruebas realizadas.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Tamaño | Idioma | Licencia | Notas |
|---|---|---|---|---|---|---|
| basyauma-tech/Haas-ja-v1.0-onnx | ONNX | fp32, int8 | ~3,1 GB repo | japonés | Apache 2.0 | Conversión no oficial; fp32 por defecto; verificación numérica frente a PyTorch |
| third-intelligence/Haas-ja-v1.0 | NeMo (.nemo) | bf16 | 1,23 GB checkpoint | japonés | Apache 2.0 | Modelo original; requiere NeMo, CUDA y Triton |
| kizuna-intelligence/Haas-ja-v1.0-OneCompression-ONNX | ONNX | int4, int8 | ~3,47 GB repo | japonés | Apache 2.0 | Otra conversión comunitaria del mismo modelo base, orientada a CPU |

No se dispone de datos comparativos de benchmarks entre estas tres variantes en la información proporcionada; la comparación de precisión publicada solo cubre fp32 e int8 de esta conversión frente a los valores del modelo original.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada, aprobada ni respaldada por Third Intelligence, Inc.
- Solo japonés; no se ha evaluado su comportamiento en otros idiomas.
- La variante int8 no cumple el criterio de precisión en FLEURS (CER strict 4,05 % frente a 3,65–3,67 % publicado, +0,38 puntos); el autor la considera de referencia y recomienda fp32.
- No se han medido precisión ni velocidad en x86_64, Linux ni Windows; la precisión de int8 puede variar según el conjunto de instrucciones.
- El procesamiento de audio de más de 30 s depende de una heurística de corte por silencio que puede degradar la transcripción en audio con poco silencio o ruido continuo.
- El remuestreo de JVNV se hizo con ffmpeg 9.0.2 en lugar de 7.1, por lo que puede haber pequeñas diferencias respecto al audio oficial.
- No se han evaluado JSUT, TEDxJP-10K ni SpeechBSD; el rendimiento en dominios distintos de FLEURS y JVNV es desconocido.
- Riesgo de alucinación y errores propios de ASR (nombres propios, términos técnicos, números) no cuantificado más allá del CER publicado.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión de un modelo de terceros conviene revisar también las condiciones del modelo base y citar adecuadamente.
- Sin soporte de tool calling, agentes ni multimodalidad; el uso en producción debe limitarse a transcripción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/basyauma-tech/Haas-ja-v1.0-onnx
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Repositorio de inferencia y conversión: https://github.com/basyauma-tech/haas-ja-local
- Verificación ONNX en Mac: https://github.com/basyauma-tech/haas-ja-local/blob/main/docs/verification/2026-11-08-mac-onnx.md
- Verificación numérica frente a PyTorch: https://github.com/basyauma-tech/haas-ja-local/blob/main/docs/verification/2026-11-08-mac-numerics.md
- Dataset de evaluación asr-ja-bench: https://huggingface.co/datasets/third-intelligence/asr-ja-bench
- Herramienta de evaluación jacer: https://github.com/third-intelligence/jacer
- Conversión alternativa int4/int8: https://huggingface.co/kizuna-intelligence/Haas-ja-v1.0-OneCompression-ONNX
