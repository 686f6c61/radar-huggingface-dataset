# mrjnzzz/Haas-ja-v1.0-mlx

## Resumen

Haas-ja-v1.0-mlx es una conversión no oficial a MLX del modelo de reconocimiento automático del habla (ASR) en japonés third-intelligence/Haas-ja-v1.0, desarrollada por el usuario mrjnzzz para su ejecución en Python sobre Apple Silicon. El modelo original lo desarrolla Third Intelligence y emplea una arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer), una variante de los transductores que predice de forma conjunta tokens y duraciones, lo que acelera la decodificación frente a los transductores clásicos. La conversión mantiene los pesos en bfloat16 con los ejes reordenados para MLX, sin modificar los valores numéricos.

El modelo cuenta con 615.871.520 parámetros y está especializado exclusivamente en japonés, entrenado con los corpus reazon-research/reazonspeech y espnet/yodas. Su interés práctico radica en que permite transcribir audio japonés en local sobre hardware Apple (CPU y GPU Metal) sin depender de CUDA, algo relevante para desarrolladores que trabajan en portátiles Mac y necesitan transcripción privada u offline.

La relevancia de esta conversión es acotada: es un port personal, sin mantenimiento garantizado ni afiliación con el autor original, y no es compatible con mlx-audio ni con otras librerías MLX estándar; requiere el código específico del repositorio haas-mlx. No obstante, ofrece una precisión prácticamente idéntica a la publicada por el modelo original en los subconjuntos evaluados de asr-ja-bench v1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 615.871.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el audio se procesa en segmentos de hasta 30 s, cortados en puntos de silencio |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en bfloat16 (la model card indica que no se han implementado pesos cuantizados) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es FastConformer, un codificador Conformer con submuestreo agresivo de la secuencia de entrada, combinado con un decodificador TDT. El decodificador TDT predice simultáneamente el token y su duración, lo que reduce el número de pasos de decodificación respecto a un transductor convencional y mejora el throughput. El modelo base fue entrenado por Third Intelligence con los corpus reazon-research/reazonspeech y espnet/yodas, según los metadatos de la model card. No se dispone de información sobre el número exacto de horas de audio, la composición detallada del dataset, ni si se aplicaron etapas de ajuste fino supervisado o preferencias.

La conversión a MLX no altera los valores de los pesos: se conservan los tensores bfloat16 del checkpoint original con los ejes reordenados para adaptarse al layout de MLX. El procesamiento de audio largo replica el comportamiento de la función oficial `transcribe_longform`, cortando la señal en puntos de baja energía cuando supera los 30 segundos. La model card indica explícitamente que no se han implementado tiempos por palabra, vocabulario personalizado, procesamiento por lotes, streaming ni pesos cuantizados.

## Capacidades

- Reconocimiento automático del habla en japonés, con salida de texto a partir de audio.
- Segmentación automática de audios de más de 30 segundos mediante cortes en puntos de silencio.
- Generación opcional de marcas de tiempo por token en formato JSON (con `--timestamps`), calculadas como en NeMo; corresponden a piezas del tokenizador, no a palabras.
- Ejecución en Apple Silicon mediante Metal, tanto en CPU como en GPU.
- Ejecución alternativa en Metal a través de speech.cpp, sin necesidad de Python ni MLX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de la transcripción, ni capacidades multilingües fuera del japonés.
- No implementa streaming, batches, vocabulario personalizado ni cuantización.

## Casos de uso

- Transcripción de reuniones y entrevistas en japonés en local: el modelo procesa audios largos cortándolos en silencios y permite obtener actas sin enviar datos a servicios en la nube, algo crítico para información confidencial.
- Subtitulado de vídeo y pódcast en japonés: la salida con marcas de tiempo por token permite alinear el texto con la pista de audio para generar subtítulos, aunque las marcas sean piezas del tokenizador y requieran postprocesado.
- Investigación lingüística y creación de corpus: la tasa de error de carácter (CER) publicada, en torno al 3-4,5 % en los subconjuntos evaluados, es suficiente para generar transcripciones de trabajo sobre grabaciones de habla espontánea.
- Prototipado de asistentes de voz en macOS: al ejecutarse sobre Metal en un Apple M4, permite iterar en un portátil sin GPU dedicada ni CUDA.
- Archivado y búsqueda de material audiovisual japonés: la transcripción offline de grabaciones de 22 minutos en unos 16 segundos facilita indexar bibliotecas de audio.
- Evaluación comparativa de motores ASR: sirve como referencia local para contrastar la calidad de otros sistemas japoneses, dado que su precisión está documentada frente a asr-ja-bench v1.1.

## Benchmarks y rendimiento

Resultados en asr-ja-bench v1.1, medidos con jacer v1.2.0 (CER estricto / flex / kana, en %), sobre un Apple M4 con Metal, una locución a la vez y en bfloat16:

| Subconjunto | Esta conversión | Publicado |
|---|---:|---:|
| JVNV (1.375) | 4,50 / 3,04 / 2,25 | 4,53 / 3,08 / 2,26 |
| FLEURS (650) | 3,65 / 2,98 / 2,34 | 3,67 / 2,98 / 2,34 |

JSUT, TEDxJP-10K y SpeechBSD no se midieron, por lo que no hay cifra comparable con el 6,12 % global publicado. La salida no se comparó directamente con la implementación oficial, que requiere GPU CUDA. El texto coincide con speech.cpp 0.9.3 (fichero F16 en Metal) en 1.290 de 1.375 locuciones de JVNV y en 601 de 650 de FLEURS.

Rendimiento medido: aproximadamente 76 veces tiempo real en estos subconjuntos; una grabación de 22 minutos se transcribe en 16 segundos con un pico de 1,8 GB de memoria en MLX sobre un Apple M4 de 24 GB.

## Requisitos de hardware

- VRAM/memoria unificada estimada: alrededor de 1,8 GB de pico en MLX durante la transcripción de audio largo, según la medición del autor en un M4 de 24 GB.
- GPU recomendadas: Apple Silicon con Metal; el autor reporta resultados en un Apple M4. No hay datos para chips M1, M2, M3, M4 Pro/Max ni para GPU NVIDIA, ya que la conversión es específica de MLX.
- Cabe en cualquier Mac con memoria unificada suficiente para el sistema y el modelo (el repo pesa 1,2 GB); no se han publicado requisitos mínimos oficiales.
- Opciones de despliegue: repositorio haas-mlx (Python + MLX) con el comando `python -m haas_mlx.transcribe`; alternativa speech.cpp sobre Metal. No es compatible con mlx-audio ni con otras librerías MLX.
- Latencia y throughput: unas 76 veces tiempo real en los subconjuntos evaluados; 22 minutos de audio en 16 segundos en un M4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / segmentacion | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Haas-ja-v1.0-mlx (esta conversión) | 615,9 M | Segmentos de 30 s con corte en silencios | ja | Apache 2.0 | Solo Apple Silicon vía MLX; sin streaming ni cuantización |
| third-intelligence/Haas-ja-v1.0 | 615,9 M | Segmentos de 30 s con corte en silencios | ja | Apache 2.0 | Implementación oficial; requiere GPU CUDA |
| speech.cpp (ejecución de este modelo) | 615,9 M | Segmentos de 30 s | ja | no disponible en la información proporcionada | Ejecuta el mismo modelo en Metal sin Python |
| Otros modelos ASR japoneses (p. ej. Whisper) | no disponible en la información proporcionada | no disponible | multilingüe | no disponible | No se aportan datos comparativos en la información disponible |

## Limitaciones y advertencias

- Conversión no oficial y port personal: el autor no está afiliado a Third Intelligence y no garantiza mantenimiento.
- No funciona con mlx-audio ni con librerías MLX estándar; depende del código de github.com/matsuurajun/haas-mlx.
- Tiende a omitir muletillas (えっと, まあ, あの) y algunas respuestas cortas (はい), y a normalizar reinicios de frase; la transcripción no es literal.
- No implementa tiempos por palabra, vocabulario personalizado, procesamiento por lotes, streaming ni pesos cuantizados.
- Solo soporta japonés; no hay capacidades multilingües.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en reazonspeech y yodas; no se documentan sesgos específicos en la información disponible.
- Los benchmarks solo cubren JVNV y FLEURS; no hay medición en JSUT, TEDxJP-10K ni SpeechBSD, por lo que el 6,12 % global publicado no está verificado en esta conversión.
- Licencia Apache 2.0, que permite uso comercial; deben conservarse los ficheros LICENSE y NOTICE y consultarse la model card original para datos de entrenamiento y limitaciones.
- La implementación oficial requiere GPU CUDA; esta conversión no se ha comparado directamente con ella.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrjnzzz/Haas-ja-v1.0-mlx
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Repositorio de código MLX: https://github.com/matsuurajun/haas-mlx
- Ejecución alternativa en Metal: https://github.com/nyosegawa/speech.cpp
- Dataset reazonspeech: https://huggingface.co/datasets/reazon-research/reazonspeech
- Dataset yodas: https://huggingface.co/datasets/espnet/yodas
