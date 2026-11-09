# Nukthean/soriya-asr-khmer-325m

## Resumen

Soriya-ASR-Khmer-325M es un modelo de reconocimiento automático del habla (ASR) especializado en jemer (khmer), desarrollado por el usuario Nukthean y publicado en Hugging Face bajo licencia Apache 2.0. El modelo combina la torre de audio Conformer de 12 capas de Google EmbeddingGemma-2 (dimensión 1024) con un lector CTC propio basado en un transformer de 6 capas (dimensión 512, 8 cabezas de atención, 582 unidades de salida). El resultado es un sistema de unos 324,8 millones de parámetros y aproximadamente 652 MB en formato `model.pt`, pensado para transcripción de audio en jemer con decodificación CTC.

El modelo aborda un problema concreto: la escasez de sistemas ASR de calidad para jemer, un idioma de bajos recursos con escritura propia y segmentación de palabras no trivial. Soriya se entrena en tres etapas sobre el corpus Digital Divide Data (614 horas) y se adapta a dominios conversacional y ministerial, con un enfoque explícito en reducir borrados en los límites entre segmentos mediante la interpolación de pesos del lector. Los resultados reportados por el autor son notables en dominio: 3,91 % de CER en el corpus de entrenamiento y 15,85 % de CER en el conjunto de test de FLEURS (dominio no visto).

Es relevante ahora porque demuestra que es posible obtener ASR competitivo en jemer reutilizando una torre de audio preentrenada de un modelo de embeddings y entrenando únicamente un lector ligero, con un coste de cómputo muy contenido (dos T4 en Kaggle). Para desarrolladores que necesiten transcripción en jemer, ofrece una alternativa de pesos abiertos con métricas publicadas y un script de inferencia autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (torre de audio, 12 capas, d=1024) + transformer CTC (6 capas, d=512, 8 cabezas) |
| Parametros totales | ~324,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio; segmentación automática en ventanas de 30 s) |
| Tipos de cuantizacion | no disponible (inferencia en FP32 en CPU y FP16 en entrenamiento; no se documentan GGUF ni otras) |
| Idiomas soportados | jemer (`km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch) + script `soriya_asr.py` |

## Arquitectura y entrenamiento

La arquitectura es híbrida: una torre de audio Conformer de 12 capas y dimensión 1024 heredada de `google/embeddinggemma-2`, seguida de un lector CTC de 6 capas transformer con dimensión 512, 8 cabezas de atención y un vocabulario de salida de 582 unidades. El modelo base es un modelo de embeddings de Google, no un ASR preentrenado, lo que implica que la torre de audio se reutiliza como extractor de representaciones y el lector CTC se entrena desde cero sobre ella. La decodificación es CTC pura, sin decodificador de lenguaje externo documentado.

El entrenamiento se organiza en tres etapas. La etapa 1 (Pure Foundation) entrena durante 6800 pasos (~700 horas) exclusivamente sobre `Digital-Divide-Data/khmer-speech-dataset`, descongelando las 6 capas superiores del Conformer (6–11). La etapa 2 (Joint Multi-Domain Adaptation) añade 1000 pasos con un 50 % de audio conversacional (`sengtha/iany-khmer-voice`) y un 50 % ministerial (`seanghay/khmer_grkpp_speech`), congelando al 100 % el Conformer para evitar deriva acústica, aplicando VAD por energía para recortar silencios (250 ms al inicio, 350 ms al final) y verbalizando números en jemer hablado (de 0 a 1.000.000.000). La etapa 3 (Reader Weight Souping) interpola linealmente los pesos del lector: `W_reader = 0.40 * W_base + 0.60 * W_joint`, para eliminar borrados en los límites entre segmentos conservando la ortografía conversacional y la fluidez ministerial.

El entrenamiento se ejecutó en Kaggle Notebooks con dos NVIDIA Tesla T4 (2×15 GB VRAM, 30 GB totales), usando DistributedDataParallel de PyTorch, precisión mixta FP16 con `GradScaler` y `torchrun --nproc_per_node=2`. La evaluación local se hizo en CPU (Intel i5-13400F, 32 GB RAM) con PyTorch FP32 y en GPU AMD Radeon RX 6700 XT de 12 GB.

## Capacidades

- Reconocimiento automático del habla en jemer (transcripción de audio a texto).
- Decodificación CTC con vocabulario de 582 unidades y segmentación de palabras mediante `khmercut` para el cálculo de WER.
- Procesamiento de audio largo mediante ventanas no solapadas de 30 segundos configurables (`chunk_seconds`), lo que permite transcribir grabaciones de duración arbitraria con memoria acotada.
- Limpieza y normalización de texto jemer mediante `khmernormalizer` y verbalización de números en jemer hablado.
- Manejo de audio en formatos WAV, MP3, OGG y FLAC, remuestreado a 16 kHz mono mediante `soxr`.
- Adaptación a dos dominios: conversacional (voz espontánea) y ministerial (registro formal).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio como entrada multimodal ni modo de pensamiento; es un modelo puramente ASR.
- Capacidad multilingüe limitada al jemer; no se documenta soporte de otros idiomas.

## Casos de uso

- Transcripción de archivos de audio del corpus Digital Divide Data: el modelo alcanza 3,91 % de CER y 10,31 % de WER en este dominio, por lo que es adecuado para digitalizar y buscar en archivos de habla cultural jemer ya existentes.
- Subtitulado de contenido audiovisual en jemer: con ventanas de 30 s y procesamiento por segmentos, permite generar subtítulos para vídeos largos manteniendo baja latencia y memoria acotada en CPU o GPU de gama media.
- Atención al cliente en jemer: la etapa 2 se entrenó con audio conversacional (`sengtha/iany-khmer-voice`), lo que lo hace apto para transcribir llamadas o mensajes de voz de usuarios en centros de soporte.
- Documentación de reuniones y actas ministeriales: la adaptación con `seanghay/khmer_grkpp_speech` y la verbalización de números hasta 1.000.000.000 facilitan la transcripción de sesiones formales con cifras y terminología administrativa.
- Investigación lingüística y creación de corpus: al ser Apache 2.0 y con pesos abiertos, permite generar transcripciones a escala para anotación, análisis fonético o entrenamiento de modelos posteriores.
- Accesibilidad: conversión de voz a texto en jemer para personas con discapacidad auditiva o para interfaces de voz en aplicaciones locales.
- Búsqueda por voz en archivos de audio: la transcripción resultante se puede indexar y consultar, aprovechando el bajo CER en dominio para obtener resultados de búsqueda fiables.
- Despliegue en entornos con recursos limitados: los ~652 MB del checkpoint y la inferencia en FP32 en CPU permiten ejecutarlo en portátiles o servidores sin GPU dedicada.

## Benchmarks y rendimiento

Evaluación a gran escala sobre `Digital-Divide-Data/khmer-speech-dataset` (muestra estratificada de 3648 clips, 8,60 h, 12 hablantes, semilla 42):

| Metrica | Resultado |
|---|---|
| CER (corpus) | 3,91 % |
| CER (media) | 3,96 % |
| CER (mediana) | 2,14 % |
| WER (corpus, `khmercut`) | 10,31 % |
| Exact match | 29,6 % (1080/3648 clips) |

Evaluación fuera de dominio sobre `google/fleurs` km_kh:

| Split | Clips | Duracion | CER | IC 95 % | WER (`khmercut`) | Exact match |
|---|---|---|---|---|---|---|
| `test` | 771 | 3,15 h | 15,85 % | 15,01 – 16,67 % | 29,28 % | 3,2 % |
| `validation` | 326 | 1,29 h | 16,06 % | 14,55 – 17,66 % | 30,58 % | 3,1 % |
| `train` | 1675 | 7,10 h | 14,51 % | 13,87 – 15,19 % | 25,42 % | 4,7 % |
| Todos combinados | 2772 | 11,54 h | 15,06 % | 14,60 – 15,56 % | 27,10 % | 4,1 % |

Resumen por dominio:

| Dominio | Corpus / split | Clips | Duracion | CER | WER (`khmercut`) | Exact match |
|---|---|---|---|---|---|---|
| Habla cultural en dominio | `Digital-Divide-Data/khmer-speech-dataset` | 3648 | 8,60 h | 3,91 % | 10,31 % | 29,6 % |
| Noticias no vistas (test) | `google/fleurs` (`test`) | 771 | 3,15 h | 15,85 % | 29,28 % | 3,2 % |
| FLEURS completo | `google/fleurs` (`all`) | 2772 | 11,54 h | 15,06 % | 27,10 % | 4,1 % |

El autor advierte que el WER en FLEURS es menos fiable porque `khmercut` segmenta de forma inconsistente nombres propios extranjeros y términos latinos (p. ej. *Caesium*), por lo que recomienda CER como métrica de referencia en jemer. No se han publicado comparaciones con otros modelos ASR de jemer en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~652 MB en FP32; con activaciones y ventanas de 30 s se puede ejecutar con comodidad en GPUs de 4–8 GB. No se documentan cuantizaciones, por lo que no hay cifras para FP16/INT8 más allá del entrenamiento en FP16.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB (T4, RTX 3060, RTX 4090, A100, H100). El autor validó en AMD Radeon RX 6700 XT de 12 GB y entrenó en 2× Tesla T4.
- Cabe en GPU de consumo: sí, en tarjetas de gama media como RTX 3060 o superiores; también se ha probado en CPU (Intel i5-13400F) en FP32.
- Opciones de despliegue: script propio `soriya_asr.py` con PyTorch (CPU o CUDA); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR con CTC y no un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada. La segmentación en ventanas de 30 s está pensada para mantener baja latencia y eficiencia de memoria, pero no se publican cifras de RTF ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de otros modelos ASR de jemer (por ejemplo, whisper-large-v3, MMS o wav2vec2 fine-tuned para `km`) que permitan una comparación cuantitativa directa. La siguiente tabla recoge únicamente los datos del modelo evaluado; las celdas de alternativas se marcan como no disponibles.

| Modelo | Parametros | Contexto / ventana | CER (FLEURS km test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soriya-ASR-Khmer-325M | ~324,8 M | ventanas de 30 s | 15,85 % | Apache 2.0 | Hugging Face (`Nukthean/soriya-asr-khmer-325m`) |
| Alternativa ASR jemer 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa ASR jemer 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere audio a 16 kHz mono; el script `transcribe()` realiza remuestreo, pero fuentes con ruido, canales múltiples o frecuencias de muestreo distintas pueden degradar el CER.
- El modelo solo soporta jemer (`km`); no transcribe otros idiomas ni code-switching de forma fiable.
- El rendimiento cae de forma notable fuera de dominio: 3,91 % de CER en el corpus de entrenamiento frente a 15,85 % en FLEURS test, con un exact match de solo 3,2 % en ese split.
- El WER medido con `khmercut` es sensible a la segmentación de nombres propios y términos extranjeros; el propio autor recomienda usar CER como métrica principal en jemer.
- Riesgo de alucinación y de borrados en los límites entre segmentos: la etapa 3 (weight souping) se diseñó precisamente para mitigar borrados, pero no se documenta una evaluación específica de este fenómeno tras la interpolación.
- Sesgos conocidos: no se documentan análisis de sesgo por género, edad, acento o región; el corpus de entrenamiento (Digital Divide Data, audio conversacional y ministerial) puede infrarrepresentar variedades dialectales del jemer.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `google/embeddinggemma-2` puede tener sus propias condiciones; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Al ser un modelo CTC sin decodificador de lenguaje externo, la salida puede carecer de puntuación y de normalización ortográfica más allá de `khmernormalizer`; se recomienda posprocesado.
- No hay cuantizaciones publicadas (GGUF, ONNX, INT8), lo que limita el despliegue en entornos sin PyTorch o con restricciones de memoria muy estrictas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de validación independiente de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nukthean/soriya-asr-khmer-325m
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Corpus de entrenamiento principal: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- Corpus conversacional (etapa 2): https://huggingface.co/datasets/sengtha/iany-khmer-voice
- Corpus ministerial (etapa 2): https://huggingface.co/datasets/seanghay/khmer_grkpp_speech
- Benchmark FLEURS: https://huggingface.co/datasets/google/fleurs
- Script de inferencia: `soriya_asr.py` incluido en el repositorio del modelo
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
