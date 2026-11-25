# lee1jun/LES-eg2-665M-asr-en

## Resumen

LES-eg2-665M-asr-en es un sistema de reconocimiento automático del habla (ASR) en inglés desarrollado por el usuario lee1jun. Su planteamiento es poco habitual: en lugar de entrenar un modelo acústico completo, congela el codificador de audio y el backbone de EmbeddingGemma 2 (la configuración audio-lenguaje de Google, 577M de parámetros) y entrena únicamente un "lector" (reader) de 88M de parámetros que proyecta los estados ocultos del audio al espacio de embeddings de texto del propio EmbeddingGemma 2. La decodificación consiste en seleccionar, para cada token suave de 40 ms, la palabra cuya embedding de texto tiene mayor similitud coseno.

El resultado es un modelo de 664,6M de parámetros en inferencia que alcanza un WER de 1,74 en LibriSpeech test-clean en modo greedy (1,58 con LM de n-gramas y reranker), una cifra competitiva para su tamaño. La innovación principal es que el vocabulario es editable sin reentrenar: se pueden añadir palabras o sustituir toda la tabla de 407.736 palabras, ya que esta es simplemente una caché de embeddings de texto de EmbeddingGemma 2.

Es relevante ahora por tres motivos: entrena solo con datos de licencia permisiva (sin GigaSpeech, SPGISpeech, TED-LIUM ni Fisher), se publica bajo Apache 2.0 con uso comercial permitido, y expone salidas intermedias (lista 32-best puntuada, candidatos por frame) que permiten re-ranking propio. La contrapartida es que depende de `trust_remote_code` y de la librería transformers >= 5.20, y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador de audio USM (2 conv de downsampling + 12 capas conformer) + adaptador de audio (1536→512) + backbone bidireccional de 24 capas, todo congelado de EmbeddingGemma 2; lector entrenado de 12 capas Transformer (768) con cabeza word-CTC |
| Parametros totales | 664,6M en inferencia (576,6M congelados + 88,0M del lector); 671,1M con la segunda pasada de reranking; el checkpoint safetensors declara 88.021.287 parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en tokens suaves de 40 ms; no se especifica límite máximo de audio) |
| Tipos de cuantizacion | No disponible (tabla de palabras almacenada en INT8 por filas; no se documentan cuantizaciones del modelo completo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, `trust_remote_code=True`); tabla de palabras en `word_table.safetensors` (407.736 x 768, INT8) |

## Arquitectura y entrenamiento

La arquitectura reutiliza EmbeddingGemma 2 en su configuración audio-lenguaje: el codificador de audio (arquitectura USM, dos capas convolucionales de downsampling y doce capas conformer) convierte entradas Mel filterbank en 25 tokens suaves por segundo con dimensión 1536; un adaptador de audio de 0,8M de parámetros los proyecta a la dimensión del backbone (512); y el backbone bidireccional de 24 capas los procesa. Ninguno de estos componentes se modifica durante el entrenamiento: los pesos de EmbeddingGemma 2 quedan congelados y producen las mismas embeddings que antes.

El único componente entrenado es el lector: 12 capas Transformer de dimensión 768 que leen, para cada token suave, la entrada del backbone, sus 24 salidas de capa, las doce capas conformer y la salida del codificador de audio. El lector emite un logit de blank y un vector unitario que se compara por similitud coseno con la tabla de palabras, es decir, con las embeddings de texto de EmbeddingGemma 2 (mean pooling, proyección lineal a 768, normalización l2) de cada palabra. El habla y las palabras se encuentran así en un único espacio de embeddings. La decodificación greedy emite la palabra más cercana cuando la puntuación supera el logit de blank; los decodificadores beam conservan las 16 filas más cercanas de cada frame como candidatos.

Los datos de entrenamiento provienen exclusivamente de conjuntos con licencia permisiva: LibriSpeech, People's Speech, VoxPopuli, AMI, Common Voice 17.0, MLS English y NVIDIA Granary. No se documentan en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en un sistema CTC). Tampoco se detalla la función de pérdida más allá de la naturaleza CTC de la cabeza word-CTC.

## Capacidades

- Reconocimiento de voz en inglés con salida a nivel de palabra mediante CTC sobre un espacio de embeddings de texto compartido.
- Decodificación greedy y decodificación beam con modelo de lenguaje de n-gramas (KenLM) y reranker entrenado.
- Control de vocabulario: permite añadir palabras o sustituir por completo la tabla de palabras sin reentrenar (`add_words`, `set_vocabulary`).
- Salidas intermedias para re-ranking propio: lista 32-best puntuada, candidatos de palabra por frame, puntuación de cualquier hipótesis y búsqueda sobre candidatos propios.
- Embeddings de audio y de texto de EmbeddingGemma 2 obtenidos en la misma pasada de inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo ASR puro.
- No dispone de modo thinking, visión ni audio generativo; el codificador de visión de EmbeddingGemma 2 (167M) no se carga.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de AMI (reuniones reales) y ofrece decodificación beam con LM de n-gramas para reducir errores en habla espontánea; sus salidas 32-best permiten re-puntuar con un LM neuronal propio.
- Subtitulado y transcripción de contenido audiovisual en inglés: con WER de 1,58 en LibriSpeech test-clean y soporte de múltiples test sets en inglés, es adecuado para generar subtítulos que luego se revisan manualmente.
- Dominios con vocabulario especializado (medicina, legal, nombres propios): la posibilidad de sustituir la tabla de palabras sin reentrenar permite inyectar terminología del dominio y mantener el resto del sistema intacto.
- Búsqueda y recuperación sobre audio: al devolver embeddings de audio y de texto de EmbeddingGemma 2 en la misma pasada, se puede indexar audio y consultar por texto en un espacio vectorial común.
- Pipelines de ASR con re-ranking propio: la exposición de candidatos por frame y de la puntuación de hipótesis permite integrar un corrector ortográfico o un LM externo en producción sin modificar los pesos.
- Investigación en ASR con vocabulario abierto: la arquitectura desacopla el vocabulario del modelo acústico, lo que facilita experimentos de adaptación de dominio y comparaciones controladas sin reentrenar el codificador.
- Prototipado en GPU de consumo: con 664,6M de parámetros y pesos en safetensors, el modelo cabe en GPUs de gama alta para consumidor, lo que permite iterar localmente antes de desplegar.

## Benchmarks y rendimiento

| Benchmark | Modo | WER |
|---|---|---|
| LibriSpeech test-clean | greedy | 1,74 |
| LibriSpeech test-clean | beam + LM de n-gramas | 1,61 |
| LibriSpeech test-clean | beam + LM + reranker | 1,58 |

La model card menciona "siete conjuntos de test en inglés más" en su tabla de resultados, pero los valores concretos no están incluidos en la información disponible. La normalización empleada es la del Open ASR Leaderboard. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: los pesos suman aproximadamente 0,7 GB en el repositorio; en fp16 el modelo completo (664,6M de parámetros) ocupa del orden de 1,3-1,5 GB, más la tabla de palabras INT8 (407.736 x 768 ≈ 0,3 GB) y el estado del decodificador. En la práctica, menos de 4 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100, H100. El cuello de botella es el codificador conformer, no el tamaño de parámetros.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores.
- Opciones de despliegue: transformers >= 5.20 con `trust_remote_code=True` (requisito del autor); torch >= 2.11; torchvision (el procesador de EmbeddingGemma 2 carga sus partes de imagen y vídeo incluso para audio); soundfile y soxr para E/S de audio; KenLM solo para beam con LM de n-gramas; sentence-transformers >= 6.1 solo para `add_words` y `set_vocabulary`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LES-eg2-665M-asr-en | 664,6M (88M entrenados) | tokens de 40 ms, sin límite documentado | 1,58-1,74 | Apache 2.0 | Hugging Face, `trust_remote_code` |
| Whisper large-v3 (OpenAI) | 1.550M | 30 s por ventana | ~1,8-2,0 (referencia habitual del leaderboard) | MIT | Hugging Face, transformers, múltiples runtimes |
| NVIDIA Parakeet-TDT-0.6B | ~600M | audio largo, TDT | ~1,6-1,9 (referencia del leaderboard) | CC-BY-4.0 | Hugging Face, NeMo |
| wav2vec 2.0 Large (Meta) | 317M | audio variable | ~1,8-2,0 con LM | MIT / CC-BY-NC según checkpoint | Hugging Face, transformers |

Nota: los valores de WER de los modelos comparativos son referencias aproximadas de uso común y pueden variar según la normalización; no se han verificado contra la información proporcionada para este modelo. La ventaja diferencial de LES-eg2 es el vocabulario editable sin reentrenar y las salidas intermedias para re-ranking; su desventaja es la dependencia de `trust_remote_code` y de una versión muy reciente de transformers.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe documentado.
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Dependencias de versiones muy recientes: torch >= 2.11 y transformers >= 5.20, lo que puede complicar el despliegue en entornos con versiones fijadas.
- Riesgo de alucinación y errores en palabras fuera de vocabulario: aunque el vocabulario es editable, las palabras ausentes de la tabla se mapean a la fila más cercana, lo que puede producir confusiones entre palabras semánticamente próximas (el propio autor documenta "chariot", "hearse", "carrage" y "carridge" como vecinos de "carriage").
- Sin límite de contexto documentado: no se especifica la duración máxima de audio ni el comportamiento en audio muy largo; el procesamiento es por tokens de 40 ms.
- Licencia Apache 2.0 sobre los archivos del modelo, pero los pesos base de EmbeddingGemma 2 conservan su propia licencia; el autor incluye un fichero `NOTICE` que debe revisarse antes de uso comercial.
- No apto para tareas generativas, agentes ni tool calling: es exclusivamente un sistema ASR.
- Sin datos publicados de latencia, throughput ni comportamiento en dominios ruidosos fuera de los conjuntos de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lee1jun/LES-eg2-665M-asr-en
- Paper de EmbeddingGemma 2: https://arxiv.org/abs/2610.37364
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- KenLM (para beam con LM de n-gramas): https://github.com/kpu/kenlm
- Open ASR Leaderboard (normalizador citado): no disponible en la información proporcionada
- Repositorio de código del modelo: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
