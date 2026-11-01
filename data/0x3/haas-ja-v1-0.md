# 0x3/Haas-ja-v1.0

## Resumen

Haas-ja-v1.0 es un modelo de reconocimiento automático del habla (ASR) para japonés desarrollado por Third Intelligence (identificador de HuggingFace 0x3). Se construye sobre la arquitectura Parakeet-TDT de NVIDIA: un codificador FastConformer de 24 capas y un decodificador Token-and-Duration Transducer (TDT), en el que la red de predicción LSTM original se sustituye por Kimi Delta Attention (KDA). El nombre responde al acrónimo *Hear Anything At Speed* y a un homenaje al acústico Helmut Haas.

El modelo cuenta con 615,8 millones de parámetros en total (608,9M en el codificador, 3,9M en la red de predicción y 3,0M en la red conjunta), procesa audio mono a 16 kHz y emplea un tokenizador SentencePiece BPE de 3.072 tokens con *byte fallback*. Según la model card, en el momento de su publicación se sitúa en la frontera de Pareto entre velocidad y precisión en un benchmark construido con cinco conjuntos de datos públicos de japonés, con un CER estricto de 6,12 %, el más preciso entre los modelos abiertos evaluados.

Su relevancia actual radica en que ofrece una alternativa abierta (licencia Apache 2.0) con precisión declarada competitiva frente a APIs comerciales de transcripción, a una fracción del coste, y con soporte de vocabulario personalizado mediante *phrase boosting* en GPU. Está pensado para despliegue en GPU NVIDIA con NeMo 2.7 y los kernels de flash-linear-attention.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT (decodificador) con red de predicción Kimi Delta Attention (KDA) |
| Parametros totales | 615,8M (codificador 608,9M, red de predicción 3,9M, red conjunta 3,0M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana fija; el codificador usa contexto completo y el modo long-form segmenta el audio en puntos de silencio |
| Tipos de cuantizacion | no disponible (la model card solo menciona ejecución en bfloat16) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio NeMo, 1,2 GB; la model card no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El codificador es un FastConformer de 24 capas con tamaño oculto de 1.024, 8 cabezas de atención, *subsampling* de factor 8 (80 ms por fotograma) y contexto completo. La entrada es un espectrograma log-mel de 128 bins calculado sobre audio mono a 16 kHz, con ventana de 25 ms y salto de 10 ms. El decodificador TDT extiende RNN-T prediciendo además la duración de cada token (duraciones de 0 a 4 fotogramas), lo que permite saltar varios fotogramas del codificador por paso de decodificación en lugar de visitarlos todos. La innovación principal es la sustitución de la LSTM de la red de predicción de Parakeet-TDT por Kimi Delta Attention (KDA), con 2 capas, tamaño oculto 640 y 5 cabezas de 64 dimensiones, que según el autor mejora la precisión con una velocidad de inferencia prácticamente idéntica. La red conjunta tiene tamaño oculto 640 y produce salidas de token y de duración.

Los datos de entrenamiento citados en la model card son los conjuntos reazon-research/reazonspeech y espnet/yodas. No se especifica en la información disponible el número total de tokens ni de horas de audio, la composición detallada del dataset, ni si se aplicaron etapas de RLHF, DPO u otras optimizaciones posteriores. El tokenizador es un SentencePiece BPE entrenado sobre datos de japonés con 3.072 tokens y *byte fallback*. La decodificación es greedy y por lotes.

## Capacidades

- Reconocimiento automático del habla en japonés a partir de audio mono a 16 kHz.
- Transcripción de audio corto (por debajo de 30 segundos) mediante `model.transcribe`.
- Transcripción long-form para grabaciones largas, con segmentación en puntos de volumen bajo y transcripción por lotes (`transcribe_longform`, `batch_size` configurable).
- Vocabulario personalizado: mapeo de forma escrita a lecturas (habitualmente en kana) con *phrase boosting* en GPU de NeMo y sustitución por la forma escrita donde se detecta.
- Decodificación dual con vocabulario: se decodifica con y sin las palabras listadas y solo se conserva un cambio si incluye una palabra completa del vocabulario, compartiendo una única pasada del codificador.
- Carga de audio en WAV, FLAC, MP3 y OGG, con conversión de estéreo a mono y remuestreo a 16 kHz.
- No se documentan en la información disponible capacidades de *tool calling*, agentes, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones y entrevistas en japonés: el modo long-form divide el audio en puntos de silencio y transcribe por lotes, lo que permite procesar grabaciones de horas con una sola GPU y un `batch_size` ajustable.
- Subtitulado de vídeo y pódcast: la velocidad de decodificación del TDT (salto de fotogramas por token) y el *subsampling* 8× del codificador reducen el coste por minuto de audio frente a arquitecturas que visitan todos los fotogramas.
- Atención al cliente y análisis de llamadas: transcripción por lotes de grabaciones telefónicas para extraer texto indexable; el *phrase boosting* permite fijar nombres de producto y marcas que el modelo rara vez vio en entrenamiento.
- Documentación clínica o legal dictada: el vocabulario personalizado con lecturas en kana y sustitución por la forma escrita ayuda a normalizar terminología especializada y nombres propios.
- Generación de corpus para entrenamiento de modelos de lenguaje en japonés: transcripción masiva de archivos de audio con precisión declarada de CER estricto 6,12 % en el benchmark del autor.
- Búsqueda y recuperación sobre archivos de audio: indexación de transcripciones con marcas temporales derivadas del alineamiento por fotogramas del decodificador TDT.
- Integración en pipelines de accesibilidad: subtítulos en directo o diferidos para contenido en japonés, con despliegue en GPU NVIDIA mediante NeMo.

## Benchmarks y rendimiento

La model card declara un CER estricto de 6,12 % en un benchmark propio construido a partir de cinco conjuntos de datos públicos de japonés (third-intelligence/asr-ja-bench), y sitúa al modelo en la frontera de Pareto entre velocidad y precisión. No se proporcionan en la información disponible las tablas numéricas completas por conjunto de datos ni comparaciones cifradas con modelos concretos.

| Metrica | Valor |
|---|---|
| CER estricto (benchmark del autor, 5 datasets japoneses) | 6,12 % |
| Posicion en frontera de Pareto velocidad/precision | declarada por el autor |
| Resultados por dataset (MMLU, HumanEval, GSM8K, etc.) | no aplicable (modelo ASR) |
| Comparacion numerica con APIs comerciales | no disponible en cifras |

## Requisitos de hardware

- GPU NVIDIA obligatoria: la red de predicción usa kernels de flash-linear-attention, que requieren Triton y CUDA; CPU y macOS no están soportados.
- Entorno: Linux, Python 3.11+ y NeMo 2.7.
- Precisión de referencia: bfloat16 en GPU (la usada en la evaluación del autor).
- VRAM estimada: no disponible de forma explícita; con 615,8M parámetros en bfloat16 los pesos ocupan aproximadamente 1,2 GB, a lo que hay que sumar activaciones y memoria de lotes, que crecen con el `batch_size` del modo long-form.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU NVIDIA con soporte CUDA y Triton debería poder ejecutar el modelo. No se confirma compatibilidad con GPUs de consumo como la RTX 4090 en la información disponible.
- Opciones de despliegue: NeMo 2.7 y el paquete `haas-asr` del repositorio GitHub; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en cifras; el autor afirma que KDA mantiene una velocidad de inferencia prácticamente idéntica a la LSTM de Parakeet-TDT y que el modelo está en la frontera de Pareto velocidad/precisión de su benchmark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haas-ja-v1.0 | 615,8M | audio 16 kHz, contexto completo, long-form por segmentación | CER estricto 6,12 % en benchmark del autor | Apache 2.0 | HuggingFace, GitHub, demo HF Space |
| Parakeet-TDT (NVIDIA) | no disponible en la informacion | arquitectura base del modelo | no disponible en la informacion | no disponible en la informacion | referencia arquitectonica citada |
| APIs comerciales de STT | no aplicable | no disponible | el autor declara precisión competitiva sin cifras | propietaria | servicio comercial |

No se dispone en la información proporcionada de datos numéricos de modelos comparables de la misma categoría (Whisper, ReazonSpeech u otros ASR japoneses) que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo soporta japonés; no se documenta multilingüismo.
- Requiere GPU NVIDIA con CUDA y Triton; no funciona en CPU ni macOS.
- Dependencia de NeMo 2.7 y de los kernels de flash-linear-attention, lo que limita la portabilidad del despliegue.
- El *phrase boosting* puede alterar texto donde no se pronunció ninguna palabra listada; el autor mitiga esto con decodificación dual y conservación de cambios solo cuando incluyen una palabra completa, pero persiste el riesgo de falsos positivos.
- No se documentan en la información disponible sesgos conocidos, tasas de alucinación ni comportamiento en audio con ruido, acentos o dialectos distintos de los de los datasets de entrenamiento (reazonspeech, yodas).
- El CER de 6,12 % procede de un benchmark construido por el propio autor; no hay validación independiente en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento citados (reazon-research/reazonspeech, espnet/yodas) para obligaciones adicionales.
- El repositorio tiene 7 descargas y 0 likes en el momento de la consulta, lo que indica adopción muy temprana y poca validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0x3/Haas-ja-v1.0
- Repositorio de código: https://github.com/third-intelligence/Haas-ASR
- Demo (Hugging Face Space, long-form): https://third-intelligence-haas-ja-v1-0.hf.space/longform
- Blog de lanzamiento: https://third-intelligence.com/ja/posts/haas-ja-v1-release
- Benchmark asr-ja-bench: https://huggingface.co/datasets/third-intelligence/asr-ja-bench
- Métricas jacer: https://github.com/third-intelligence/jacer
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Documentación de word boosting de NeMo: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/asr_customization/word_boosting.html
- Dataset reazonspeech: https://huggingface.co/datasets/reazon-research/reazonspeech
- Dataset yodas: https://huggingface.co/datasets/espnet/yodas
- Paper arXiv 2305.05084: https://arxiv.org/abs/2305.05084
- Paper arXiv 2304.06795: https://arxiv.org/abs/2304.06795
- Paper arXiv 2510.26692: https://arxiv.org/abs/2510.26692
