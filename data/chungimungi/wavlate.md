# chungimungi/WavLate

## Resumen

WavLate es un modelo de recuperación (retrieval) audio-texto basado en late interaction y representaciones multi-vector, desarrollado por el usuario chungimungi. Se construye sobre el modelo de texto mLateOn de Lighton y un codificador de audio HTS-AT inicializado desde MGA-CLAP, y aplica una puntuación MaxSim entre los vectores de cada token de la leyenda y los vectores de cada fragmento de audio. El modelo codifica audio y texto de forma independiente, lo que permite indexar cada clip una sola vez y consultarlo con cualquier leyenda.

El modelo resuelve el problema de la búsqueda cruzada entre audio y texto sin necesidad de fine-tuning por conjunto de datos. Según la model card, es el primer modelo abierto de late interaction entrenado específicamente para recuperación entre audio y leyendas, y alcanza un R@1 medio de 37,9 en las cuatro tareas de recuperación de AudioCaps y Clotho, por delante de los otros ocho modelos abiertos evaluados en las mismas particiones de test.

Con 342,8 millones de parámetros totales (de los cuales 197 millones corresponden a la tabla de embeddings del torre de texto), el modelo mantiene una huella moderada y se distribuye bajo licencia MIT. Está pensado para tareas de feature extraction y recuperación, no para generación, y su relevancia actual radica en ofrecer una alternativa abierta y reproducible a los modelos CLAP pooled para búsqueda semántica de audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder: torre de audio HTS-AT (Swin transformer sobre espectrogramas log-mel) + torre de texto ModernBERT con proyecciones ColBERT; puntuación por late interaction (MaxSim) |
| Parametros totales | 342.773.848 (344M según model card; 197M en la tabla de embeddings del torre de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio: ventanas de 10 s con 32 vectores por ventana, hasta 30 s (3 ventanas). Texto: no disponible explícitamente; el backbone es ModernBERT |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

WavLate es un modelo de dos torres. La torre de audio es un HTS-AT de 31M de parámetros (Swin transformer sobre espectrogramas log-mel) con la salida locality-aware de MGA-CLAP, inicializada desde MGA-CLAP. Produce 32 vectores por cada ventana de 10 segundos, aplica la proyección de frames de MGA-CLAP (768 a 1024) y una proyección lineal final a 128 dimensiones, con normalización L2. Los clips de más de 10 segundos se dividen en ventanas consecutivas y se conservan todos sus frames hasta un máximo de 30 segundos. La torre de texto es mLateOn: un backbone ModernBERT con capas de proyección ColBERT (768 a 1536 a 768 a 128) que genera un vector L2-normalizado de 128 dimensiones por token; las leyendas se prefijan con el marcador `[Q] `. La puntuación es el MaxSim medio desde los tokens de la leyenda hacia los frames de audio, de modo que cada token encuentra su mejor momento en el clip y se promedian esas coincidencias.

El entrenamiento usó 441.198 clips con 456.546 leyendas procedentes de WavCaps (FreeSound, BBC Sound Effects, SoundBible y AudioSet con etiquetado fuerte), el conjunto de entrenamiento de AudioCaps y el de desarrollo de Clotho, eliminando solapamientos con los conjuntos de test. El objetivo combina un InfoNCE multi-positivo sobre las puntuaciones MaxSim del lote con un término de destilación KL hacia el ranking de similitud de un profesor MGA-CLAP pooled congelado. Se minaron 10 negativos duros por clip con MGA-CLAP pooled, conservados solo cuando un cross-encoder (`cross-encoder/ettin-reranker-32m-v1`) los juzgaba distintos de las leyendas propias del clip; los lotes se construyen para que cada clip se encuentre con sus negativos minados. Se añadieron negativos de texto mediante leyendas con sustitución de una palabra (por ejemplo, "dog" por "cat"). El calendario fue de 5 épocas (la model card se trunca en este punto; el resto de hiperparámetros no está disponible en la información proporcionada).

## Capacidades

- Recuperación texto-a-audio: dada una leyenda, ranking de clips de audio por relevancia semántica.
- Recuperación audio-a-texto: dado un clip, ranking de leyendas candidatas.
- Representaciones multi-vector con late interaction (MaxSim), que preservan la alineación fina entre tokens y momentos del audio en lugar de colapsar todo en un único vector.
- Codificación independiente de audio y texto, lo que permite indexar cada clip una vez y reutilizar el índice con cualquier consulta.
- Extracción de features: `encode_text` devuelve vectores por token con máscara; `encode_audio` devuelve vectores por frame con máscara.
- Procesamiento de audio mono a 32 kHz, con remuestreo automático de otras frecuencias si se pasa `sampling_rate` (requiere `torchaudio`); acepta clips de cualquier longitud y divide en ventanas de 10 s hasta 30 s.
- Soporte de audio mono o estéreo en la entrada (el estéreo se promedia a mono en el ejemplo de uso).
- No soporta tool calling, function calling, agentes ni generación de texto: es un modelo de feature extraction y recuperación.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en archivos de sonido: indexar una fonoteca con `encode_audio` una sola vez y permitir consultas en lenguaje natural ("rain falling on a tin roof") mediante `encode_text`, gracias a la codificación independiente de ambas modalidades.
- Etiquetado y curaduría de datasets de audio: dado un clip sin metadatos, recuperar las leyendas más probables de un banco de descripciones y usarlas como punto de partida para anotación humana.
- Sincronización y localización de eventos: al mantener 32 vectores por ventana de 10 s, el MaxSim permite identificar qué momento del clip coincide mejor con cada token de la consulta, útil para localización temporal aproximada de sonidos.
- Moderación y filtrado de contenido audiovisual: buscar clips que coincidan con descripciones de eventos concretos dentro de un catálogo grande, aprovechando el índice precalculado y la puntuación por similitud.
- Sistemas de recomendación de audio: construir un espacio de recuperación cruzada para sugerir clips similares a una descripción o a otro clip, usando las puntuaciones MaxSim como señal de ranking.
- Investigación en recuperación multimodal: servir como baseline abierto y reproducible de late interaction audio-texto para comparar con modelos pooled tipo CLAP en las mismas particiones de AudioCaps y Clotho.
- Enriquecimiento de bases de datos de efectos de sonido para producción audiovisual: permitir a editores buscar efectos por descripción textual en lugar de por etiquetas rígidas, con un modelo de 344M parámetros desplegable en infraestructura moderada.

## Benchmarks y rendimiento

Resultados de R@1 / R@10 (%) en AudioCaps test (964 clips, 4.820 leyendas) y Clotho evaluation (1.045 clips, 5.225 leyendas). A2T = audio a texto; T2A = texto a audio. Todas las filas de baseline, salvo la última, fueron ejecutadas por el autor con los checkpoints publicados y su propio preprocesamiento.

| Modelo | AudioCaps A2T | AudioCaps T2A | Clotho A2T | Clotho T2A | Media |
|---|---|---|---|---|---|
| WavLate | 53,6 / 93,5 | 43,6 / 87,9 | 30,0 / 71,0 | 24,3 / 65,0 | 37,9 / 79,4 |
| M2D-CLAP 2025 | 58,6 / 92,6 | 41,8 / 88,4 | 25,1 / 64,6 | 20,1 / 59,5 | 36,4 / 76,3 |
| MGA-CLAP | 54,7 / 91,5 | 41,6 / 87,1 | 26,1 / 65,0 | 21,2 / 60,9 | 35,9 / 76,1 |
| GLAP (librosa resampling) | 53,8 / 91,7 | 38,9 / 82,0 | 21,4 / 62,1 | 19,3 / 57,9 | 33,4 / 73,4 |
| WavCaps HTSAT-BERT-PT | 51,9 / 89,6 | 38,5 / 85,4 | 23,1 / 62,3 | 19,1 / 57,5 | 33,2 / 73,7 |
| Cacophony | 42,7 / 86,1 | 33,5 / 82,4 | 26,2 / 64,4 | 18,5 / 55,1 | 30,2 / 72,0 |
| LAION-CLAP larger_clap_general | 43,6 / 89,5 | 34,3 / 83,8 | 22,0 / 58,5 | 14,2 / 50,1 | 28,5 / 70,5 |
| LAION-CLAP clap-htsat-fused | 42,1 / 89,4 | 33,8 / 80,7 | 20,1 / 62,0 | 15,0 / 49,8 | 27,8 / 70,5 |
| MS-CLAP 2023 | 27,8 / 75,0 | 16,9 / 64,8 | 24,0 / 60,9 | 15,8 / 51,4 | 21,1 / 63,0 |
| MultiScale Matching (según paper) | 52,2 / 91,3 | 40,6 / 86,0 | 23,0 / 61,2 | 19,1 / 56,3 | 33,7 / 73,7 |

La última fila copia las cifras del paper (pesos no publicados; test de AudioCaps de 957 clips). La fila de WavLate se calculó con esta release exacta (`AutoModel`), clip a clip.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 342,8M parámetros en safetensors, la inferencia en fp32 ronda los 1,4 GB de pesos, y en fp16/bf16 aproximadamente 0,7 GB, más el coste de activaciones del codificador de audio y del texto.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint (1,4 GB en el repositorio); no se detalla el mínimo exacto de VRAM.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; requiere `torch` 2.11 y `transformers` 5.23 (probados por el autor), y `transformers` 4.48 o superior para la torre de texto (ModernBERT). `torchaudio` es necesario para el remuestreo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Enfoque | Media R@1 (4 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WavLate | 344M | Ventanas de 10 s, hasta 30 s | Late interaction multi-vector (MaxSim) | 37,9 | MIT | Pesos abiertos en HF |
| M2D-CLAP 2025 | no disponible | no disponible | Pooled CLAP | 36,4 | no disponible | Checkpoint publicado |
| MGA-CLAP | no disponible | no disponible | Pooled CLAP | 35,9 | no disponible | Checkpoint publicado |
| LAION-CLAP larger_clap_general | no disponible | no disponible | Pooled CLAP | 28,5 | no disponible | Checkpoint publicado |

WavLate destaca por su enfoque de late interaction frente a los modelos pooled CLAP, con una media R@1 superior en las cuatro tareas evaluadas, y por publicar pesos bajo MIT. M2D-CLAP 2025 obtiene mejor R@1 en AudioCaps A2T (58,6 frente a 53,6) y mejor R@10 en AudioCaps T2A (88,4 frente a 87,9), mientras que WavLate lidera en Clotho A2T y T2A y en la media global.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Es un modelo de recuperación y extracción de features: no genera texto, no hace tool calling ni razonamiento multi-paso.
- El audio se procesa en ventanas de 10 s y se trunca a 30 s como máximo, por lo que clips más largos pierden información más allá de ese límite.
- Requiere audio mono a 32 kHz; el remuestreo de otras frecuencias depende de `torchaudio`.
- La model card se trunca en la descripción del calendario de entrenamiento (5 épocas), por lo que no se detallan todos los hiperparámetros.
- No se han publicado análisis de sesgos, tasas de alucinación ni evaluaciones fuera de AudioCaps y Clotho en la información disponible.
- El modelo usa `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de usarlo en producción.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las licencias de los datos de entrenamiento (WavCaps, AudioCaps, Clotho) y del modelo base mLateOn para el despliegue comercial.
- El rendimiento en dominios distintos de los sonidos ambientales y de eventos de AudioCaps/Clotho no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chungimungi/WavLate
- Dataset de entrenamiento: https://huggingface.co/datasets/chungimungi/WavLate-training-data
- Modelo base de texto: https://huggingface.co/lightonai/mLateOn
- Paper de MultiScale Matching: https://arxiv.org/abs/2403.10146
- Cross-encoder usado para filtrar negativos: https://huggingface.co/cross-encoder/ettin-reranker-32m-v1
- Imagen de la model card: https://cdn-uploads.huggingface.co/production/uploads/64dca00a5f21fb7f85989628/8WLQKXua3rSjmVXxEfTzO.png
