# Mer0vin8ian/LES-eg2-665M-asr-en

## Resumen

LES-eg2-665M-asr-en es un sistema de reconocimiento automático del habla (ASR) en inglés que reutiliza un modelo de embeddings congelado, EmbeddingGemma 2, como extractor de representaciones acústicas y lingüísticas. Lo desarrolla el usuario Mer0vin8ian y se publica bajo licencia Apache 2.0. La innovación central consiste en no modificar los pesos de EmbeddingGemma 2: en su lugar, se entrena un "lector" (reader) de 88 millones de parámetros que transforma los estados ocultos del codificador de audio y del backbone en salidas CTC a nivel de palabra, comparadas por similitud coseno contra los embeddings de texto de 407.736 palabras que el propio EmbeddingGemma 2 genera.

El modelo resuelve el problema de la transcripción de voz en inglés con un vocabulario controlable sin reentrenamiento, ya que la tabla de palabras es simplemente una caché de embeddings de texto y puede sustituirse o ampliarse. Reporta un WER de 1,74 en LibriSpeech test-clean con decodificación greedy y 1,58 con el reranker, lo que lo sitúa en la gama alta de precisión para su tamaño.

La relevancia actual radica en su enfoque poco convencional: aprovecha un espacio de embeddings compartido entre audio y texto para hacer ASR con un modelo base congelado, lo que reduce el coste de entrenamiento y permite control fino del léxico. El conjunto completo en inferencia ronda los 665 millones de parámetros (577 M del modelo base congelado más 88 M del lector).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma 2 congelado (codificador de audio USM con 2 convoluciones de downsampling y 12 capas conformer, adaptador de audio 1536→512, backbone bidireccional de 24 capas) + lector Transformer de 12 capas × 768 con cabeza CTC a nivel de palabra |
| Parametros totales | 664,6 M en inferencia greedy/beam (576,6 M congelados + 88,0 M del lector); 671,1 M con la segunda pasada de reranking |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en ventanas de tokens suaves de 40 ms; no se especifica límite máximo de audio) |
| Tipos de cuantizacion | Tabla de palabras almacenada en INT8 por filas; no se documentan cuantizaciones del modelo completo |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EmbeddingGemma 2 se ejecuta en su configuración audio-lenguaje (577 M de parámetros según el paper): el codificador de audio convierte entradas Mel en 25 tokens suaves por segundo con dimensión 1536, el adaptador los proyecta a la dimensión del backbone (512) y el backbone bidireccional de 24 capas los procesa. El lector entrena únicamente sobre las representaciones: para cada token suave lee la entrada del backbone, sus 24 salidas de capa, las 12 capas conformer y la salida del codificador de audio, y produce un logit de blank más un vector unitario que se compara por coseno con la tabla de palabras (embeddings de texto de EmbeddingGemma 2 con mean pooling, proyección lineal a 768 y normalización L2). La decodificación greedy emite la palabra más cercana cuando la puntuación supera el logit de blank; los decodificadores beam conservan las 16 filas más cercanas de cada fotograma como candidatos.

Los datos de entrenamiento proceden exclusivamente de fuentes con licencia permisiva: LibriSpeech, People's Speech, VoxPopuli, AMI, Common Voice 17.0, MLS English y NVIDIA Granary. Se excluyen explícitamente GigaSpeech, SPGISpeech, TED-LIUM y Fisher. No se detalla el número de tokens de entrenamiento ni si hubo RLHF o DPO; el entrenamiento se limita al lector de 88 M y a las cabezas de reranking (6,44 M), manteniendo el resto congelado. La innovación técnica principal es el uso de un espacio de embeddings compartido entre voz y texto, junto con la posibilidad de reordenar hipótesis mediante una lista 32-best y una búsqueda sobre candidatos propios.

## Capacidades

- Reconocimiento automático del habla en inglés con salida CTC a nivel de palabra.
- Decodificación greedy, beam con modelo de lenguaje n-grama (4-grama descargable) y reranking con cabezas dedicadas.
- Control del vocabulario: añadir palabras o sustituir la tabla completa sin reentrenar.
- Salidas crudas para re-ranking propio: lista 32-best puntuada, candidatos por fotograma, puntuación de cualquier hipótesis y búsqueda sobre candidatos propios.
- Extracción de embeddings de audio y texto de EmbeddingGemma 2 en la misma pasada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo especializado en ASR).
- Capacidades multilingües: solo inglés.
- Capacidades especiales: integración con sentence-transformers para gestión de vocabulario; modo de reranking con y sin modelo de lenguaje.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de AMI (reuniones) en su entrenamiento y ofrece WER bajo en inglés, adecuado para generar actas automáticas con vocabulario corporativo añadido a la tabla de palabras.
- Subtitulado automático de vídeo y pódcast: con decodificación beam y modelo de lenguaje 4-grama se obtienen transcripciones precisas en inglés para plataformas de contenido, y el reranker reduce errores en nombres propios.
- Dominios con jerga específica: al poder sustituir la tabla de palabras sin reentrenar, se adapta a vocabulario médico, legal o técnico cargando embeddings de texto de los términos del dominio.
- Búsqueda por voz y asistentes: la salida CTC a nivel de palabra y los embeddings de audio permiten indexar y recuperar contenido hablado, integrable en pipelines de búsqueda semántica.
- Investigación en ASR y embeddings: las salidas crudas (32-best, candidatos por fotograma, puntuaciones) permiten experimentar con estrategias de re-ranking y decodificación sobre un modelo de referencia.
- Generación de datos etiquetados: transcripciones de alta precisión sobre corpus en inglés (LibriSpeech, Common Voice) para construir datasets de entrenamiento o evaluación de otros sistemas.
- Despliegue en producción con licencia permisiva: al entrenarse solo con datos Apache-compatibles, puede usarse comercialmente en productos de transcripción sin las restricciones de otros corpus.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| LibriSpeech test-clean (WER, greedy) | 1,74 |
| LibriSpeech test-clean (WER, n-gram LM) | 1,61 |
| LibriSpeech test-clean (WER, reranker) | 1,58 |

El autor indica que la tabla de resultados incluye siete conjuntos de prueba en inglés adicionales, pero no se proporcionan sus cifras en la información disponible. Normalizador empleado: Open ASR Leaderboard.

## Requisitos de hardware

- VRAM estimada: el modelo completo en inferencia ronda los 665 M de parámetros; en FP16 requiere aproximadamente 1,4 GB solo para pesos, más la tabla de palabras (407.736 × 768 en INT8, unos 313 MB) y el modelo de lenguaje 4-grama opcional.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; A100, H100 o RTX 4090 para mayor throughput en batch.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores; también en GPUs con 8 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere torch>=2.11, torchvision, transformers>=5.20, safetensors, numpy, soundfile, soxr); kenlm para beam con LM; sentence-transformers>=6.1 para gestión de vocabulario. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LES-eg2-665M-asr-en | 664,6 M (88 M entrenados) | No disponible | 1,74 greedy / 1,58 reranker | Apache 2.0 | Hugging Face |
| Whisper large-v3 | 1.550 M | 30 s de audio | No disponible en esta ficha | MIT | Hugging Face / OpenAI |
| Wav2Vec 2.0 Large | 317 M | No disponible | No disponible en esta ficha | MIT (Facebook) | Hugging Face |
| Conformer-CTC Large | ~118 M | No disponible | No disponible en esta ficha | Varía | NVIDIA NeMo |

No se han publicado comparativas directas con estos modelos en la información disponible; los datos de las alternativas no se han verificado en esta ficha y se indican solo como referencia de categoría.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe.
- El modelo base EmbeddingGemma 2 está congelado: cualquier mejora en el backbone requeriría un nuevo entrenamiento del lector.
- Riesgo de alucinación y errores en palabras fuera del vocabulario de 407.736 términos; aunque se puede ampliar la tabla, los términos nuevos deben tener embeddings de texto de calidad.
- El rendimiento en dominios ruidosos o con acentos no representados en los datos de entrenamiento (excluye GigaSpeech, TED-LIUM y Fisher) puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero el autor incluye un fichero NOTICE que conviene revisar por las condiciones de los datasets de entrenamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; auditar antes de desplegar en producción.
- No se documentan límites de longitud de audio ni latencia, lo que dificulta planificar despliegues en tiempo real.
- El modelo de lenguaje 4-grama y el reranker añaden dependencias (kenlm, descarga adicional) y complejidad operativa.

## Enlaces

- Hugging Face: https://huggingface.co/Mer0vin8ian/LES-eg2-665M-asr-en
- Paper de EmbeddingGemma 2: https://arxiv.org/abs/2610.37364
- Modelo de lenguaje 4-grama: https://huggingface.co/lee1jun/LES-eg2-asr-en-lm-4gram
- Repositorio kenlm: https://github.com/kpu/kenlm
- Open ASR Leaderboard (normalizador): no disponible en la información proporcionada
