# Maxkuo/Qwen3-ASR-0.6B-mlx-q8

## Resumen

Qwen3-ASR-0.6B-mlx-q8 es una cuantización de 8 bits del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, publicada por el usuario Maxkuo. El artefacto está empaquetado específicamente para MLX, el framework de Apple para ejecución de modelos en silicio de Apple (M1/M2/M3/M4), lo que permite transcribir audio en local sin PyTorch ni la librería transformers. El modelo base lo desarrolla el equipo Qwen de Alibaba; esta versión es un derivado comunitario que aplica cuantización afín de 8 bits con tamaño de grupo 64 a todas las capas `Linear` y `Embedding` tanto del codificador de audio como del decodificador de texto.

El problema que resuelve es doble: por un lado, ofrece transcripción multilingüe (diez idiomas, incluido el castellano) con un modelo pequeño de 0,6 mil millones de parámetros; por otro, reduce el peso en disco de 1,8 GB (fp16) a 801 MB, manteniendo una calidad idéntica al original según la evaluación del autor. Es relevante ahora porque permite ASR de calidad en hardware de consumo Apple sin depender de la nube ni de GPUs dedicadas.

La arquitectura subyacente es la de Qwen3-ASR, un modelo encoder-decoder para voz, aunque la model card no detalla su composición interna más allá de mencionar un codificador de audio y un decodificador de texto. La licencia es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para ASR (codificador de audio + decodificador de texto); detalles internos no disponibles |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits afín, group size 64; tensores restantes en float16 |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, ru, ar, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (quantized safetensors para MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B es un sistema de reconocimiento automático del habla compuesto por un codificador de audio y un decodificador de texto. Esta versión concreta no reentrena ni modifica la arquitectura: aplica cuantización afín de 8 bits con group size 64 a todas las capas `Linear` y `Embedding` del decodificador de texto y del codificador de audio mediante `mlx.nn.quantize`. Los tensores que no se cuantizan (escalas, sesgos, normas y el stem convolucional) se almacenan en float16, de modo que la inferencia se ejecuta de extremo a extremo en float16. La `lm_head` está atada a la embedding de tokens en el modelo fuente y no se duplica; el cargador la vuelve a atar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base, ya que la model card del artefacto no los detalla. La innovación técnica destacable de este artefacto es la reimplementación nativa en MLX (librería mlx-qwen3-asr) que evita la conversión de pesos por parte del usuario y soporta marcas de tiempo por palabra y un servidor HTTP integrado.

## Capacidades

- Transcripción de voz a texto multilingüe en diez idiomas: inglés, chino, japonés, coreano, alemán, francés, español, ruso, árabe e hindi.
- Reconocimiento automático del habla (pipeline `automatic-speech-recognition`).
- Marcas de tiempo a nivel de palabra mediante la opción `--timestamps`.
- Servidor HTTP integrado para despliegue como servicio (`mlx-qwen3-asr serve`).
- Ejecución local en Apple Silicon sin PyTorch ni transformers.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones en local: el modelo procesa audio en un Mac con Apple Silicon sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad y para el español gracias a su soporte nativo de `es`.
- Subtitulado de vídeo con marcas de tiempo: la opción `--timestamps` permite generar subtítulos sincronizados por palabra, útil en pipelines de postproducción.
- Servicio de transcripción autoalojado: el servidor HTTP integrado permite exponer el modelo como API interna para aplicaciones de notas de voz o atención al cliente.
- Procesamiento por lotes de archivos de audio: la reducción de tamaño a 801 MB y la velocidad 2,4 veces superior a fp16 facilitan transcribir grandes volúmenes en un portátil.
- Accesibilidad: generación de transcripciones para contenido audiovisual en varios idiomas con un modelo que cabe en memoria de un equipo de consumo.
- Prototipado e investigación en ASR: al ser una reimplementación MLX sin dependencias de PyTorch, sirve para experimentar con cuantización y evaluación en hardware Apple.
- Dictado por voz en aplicaciones de escritorio: la baja latencia en clips de 10 segundos permite integrarlo en herramientas de entrada de texto.

## Benchmarks y rendimiento

Evaluación en LibriSpeech test-clean con 100 clips balanceados por hablante, decodificación greedy, en Apple M4 Pro con MLX 0.30.6:

| Modelo | WER | CER |
|---|---:|---:|
| Qwen/Qwen3-ASR-0.6B fp16 | 2,33% | 0,59% |
| Este artefacto (8-bit g64) | 2,33% | 0,59% |

Las hipótesis generadas son idénticas a las de fp16 en los 100 clips. En cuanto a latencia, según la matriz de cuantización del repositorio, la versión de 8 bits es aproximadamente 2,4 veces más rápida que fp16 en un clip de 10 segundos (la de 4 bits, 2,7 veces). No se han publicado resultados de benchmarks multilingües ni de otros conjuntos en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: al tratarse de un modelo de 0,6B cuantizado a 8 bits con pesos de 801 MB, la inferencia cabe holgadamente en la memoria unificada de cualquier chip Apple Silicon; no se especifica un mínimo exacto.
- GPU recomendadas: Apple M1, M2, M3 y M4 (el benchmark se ejecutó en M4 Pro). No es compatible con CUDA de forma nativa al estar empaquetado para MLX.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: librería `mlx-qwen3-asr` (>= 0.4.1), con CLI (`mlx-qwen3-asr audio.wav`) y servidor HTTP (`mlx-qwen3-asr serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,4 veces más rápido que fp16 en un clip de 10 s en M4 Pro; no se publican cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este artefacto (Qwen3-ASR-0.6B mlx-q8) | 0,6B | No disponible | 10 | Apache-2.0 | MLX 8-bit |
| Qwen/Qwen3-ASR-0.6B (fp16) | 0,6B | No disponible | 10 | Apache-2.0 | Safetensors fp16 |
| Whisper large-v3 (referencia de la categoría) | 1,55B | No disponible | ~99 | MIT | Safetensors, GGUF, etc. |

La comparación con Whisper large-v3 se incluye como referencia de categoría; no se dispone de datos de benchmarks comparativos directos en la información proporcionada. Frente al modelo base, la diferencia principal es el tamaño (801 MB frente a 1,8 GB) y la velocidad (2,4 veces), con calidad idéntica en LibriSpeech test-clean.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon mediante MLX; no es desplegable en GPUs NVIDIA ni en CPU convencional sin reimplementación.
- La evaluación de calidad se limita a LibriSpeech test-clean (inglés); no hay datos publicados sobre el rendimiento en los otros nueve idiomas, incluido el español.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes, comportamiento habitual en modelos ASR y no cuantificado en la model card.
- No se documentan sesgos demográficos ni lingüísticos específicos.
- La cuantización a 8 bits mantiene la calidad en la prueba realizada, pero no se garantiza para dominios fuera de LibriSpeech.
- El artefacto tiene muy poca adopción (28 descargas, 0 likes) y fue creado en octubre de 2026, por lo que carece de validación comunitaria extensa.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-ASR-0.6B.
- La model card del artefacto referencia el repositorio `moona3k/mlx-qwen3-asr` como origen, mientras que el artefacto se publica bajo el usuario Maxkuo; conviene confirmar la procedencia de los pesos antes de usarlos en producción.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/Maxkuo/Qwen3-ASR-0.6B-mlx-q8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de la implementación MLX: https://github.com/moona3k/mlx-qwen3-asr
- Artefacto de referencia citado en la model card: https://huggingface.co/moona3k/mlx-qwen3-asr-0.6b-8bit
