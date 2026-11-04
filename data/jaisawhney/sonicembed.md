# jaisawhney/SonicEmbed

## Resumen

SonicEmbed es un fine-tune de EmbeddingGemma 2 desarrollado por el usuario jaisawhney que proyecta texto y música en un mismo espacio vectorial de 768 dimensiones con un único modelo que sigue siendo funcional para texto general. Resuelve el problema de la búsqueda texto-a-música (text-to-audio retrieval) sin necesidad de mantener dos torres separadas ni un modelo específico de audio como CLAP, y lo hace superando al checkpoint musical de LAION-CLAP en el benchmark Song Describer.

El modelo parte de google/embeddinggemma-2 (576.613.688 parámetros) y se entrena con Sentence Transformers sobre 1.234.845 pares de caption y clip procedentes del dataset IAMD (excluyendo las grabaciones no comerciales) con un 10 % de MusicCaps. El resultado se mezcla con los pesos originales para recuperar parte de la calidad en texto general, aunque a costa de una pérdida medible en MTEB(eng, v2): 64,66 frente a los 68,46 reportados por el modelo base.

Es relevante ahora porque demuestra que un modelo de embeddings de texto de tamaño medio puede absorber una modalidad adicional (audio musical) mediante fine-tuning ligero, manteniendo una única interfaz de codificación y una licencia permisiva Apache-2.0. La torre de visión del modelo base no se incluye en este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EmbeddingGemma 2 fine-tuneado con Sentence Transformers) |
| Parametros totales | 576.613.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (solo ingles; otros idiomas no testeados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 |
| Modalidades | texto y audio musical (vision excluida del checkpoint) |
| Tamano del repo | 2,3 GB |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

SonicEmbed hereda la arquitectura encoder de EmbeddingGemma 2 y se entrena con la libreria Sentence Transformers para producir embeddings normalizados comparables por similitud coseno. El checkpoint no incluye la torre de visión del modelo base, de modo que el modelo resultante cubre texto y audio musical. La codificacion de audio se realiza pasando clips de 10 segundos a 16 kHz; en la evaluacion y en el ejemplo de uso se promedian tres clips tomados al 25 %, 50 % y 75 % de la pista para representar una cancion completa.

El entrenamiento emplea 1.234.845 pares de caption y clip de IAMD (Telecom-Paris/iamd_v0), excluyendo las grabaciones no comerciales, con MusicCaps constituyendo el 10 % de los pares. Los datasets se filtraron para eliminar cualquier pista presente en Song Describer y evitar contaminacion de la evaluacion. Tras el fine-tuning, los pesos resultantes se mezclaron con los originales para recuperar parte de la calidad en texto general. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de embeddings de texto con prompts diferenciados: `prompt_name="query"` para texto de busqueda y `prompt_name="document"` para captions buscados desde un clip.
- Generacion de embeddings de audio musical a partir de arrays de waveform y sampling rate, sin prompt.
- Recuperacion texto-a-musica (text-to-audio retrieval) en un espacio compartido de 768 dimensiones.
- Recuperacion musica-a-texto mediante el prompt de documento sobre captions.
- Resolucion automatica de enlaces: una entrada de texto que sea unicamente un enlace a un fichero `.mp3`, `.wav`, `.ogg`, `.flac` o `.aac` se descarga y se procesa como audio.
- Similitud semantica de frases en ingles (pipeline sentence-similarity).
- Compatibilidad con endpoints de HuggingFace (`endpoints_compatible`).
- No incluye vision ni audio hablado; solo audio musical.

## Casos de uso

- Busqueda texto-a-musica en catalogos: indexar un catalogo de pistas con `embed_track` (media de tres clips) y consultar con frases como "calm piano" usando `prompt_name="query"`; la ventana de 768 dimensiones y el R@10 de 40,4 en Song Describer lo hacen viable para recuperacion top-10 en bibliotecas musicales.
- Etiquetado y anotacion automatica de bibliotecas musicales: dado un clip, generar su embedding y compararlo contra captions indexados con `prompt_name="document"` para asignar descripciones o tags existentes.
- Recomendacion musical por similitud: calcular embeddings de pistas y ordenar por similitud coseno para construir listas de reproduccion o recomendaciones "mas como esto".
- Deduplicacion y deteccion de versiones: comparar embeddings de pistas para identificar covers, remixes o grabaciones casi identicas en un catalogo.
- Enriquecimiento de metadatos en plataformas de streaming: generar descripciones textuales a partir de la similitud con captions de MusicCaps o IAMD y poblar campos vacios de metadatos.
- Moderacion y clasificacion de contenido musical: usar la similitud con captions de referencia para marcar generos o contenidos no deseados en pipelines de subida.
- Busqueda multimodal unificada en aplicaciones de texto: reutilizar el mismo modelo para busqueda semantica de texto general (con la perdida de calidad asumida en MTEB) y busqueda musical en un solo servicio.

## Benchmarks y rendimiento

Resultados en Song Describer (1.106 captions humanos sobre 706 pistas; cada caption se usa como query para recuperar su pista):

| Clips por pista | Modelo | R@1 | R@5 | R@10 | Rango mediano |
|---|---|---|---|---|---|
| Tres clips de 10 s | SonicEmbed | 9,5 | 29,4 | 40,4 | 16 |
| Tres clips de 10 s | CLAP music | 5,0 | 21,8 | 33,5 | 24 |
| Tres clips de 10 s | EmbeddingGemma 2 | 2,7 | 8,9 | 14,3 | 81 |
| Un clip de 10 s | SonicEmbed | 8,4 | 23,8 | 36,7 | 20,5 |
| Un clip de 10 s | CLAP music | 4,9 | 16,8 | 27,5 | 29 |
| Un clip de 10 s | EmbeddingGemma 2 | 1,4 | 6,1 | 11,4 | 89 |

CLAP corresponde al checkpoint `music_audioset_epoch_15_esc_90.14.pt` de LAION-CLAP. El margen de error de R@10 con 1.106 captions es de aproximadamente ±3 puntos, y las puntuaciones pueden variar entre maquinas de unas decimas a medio punto.

Rendimiento en texto general:

| Benchmark | Modelo | Mean(Task) |
|---|---|---|
| MTEB(eng, v2) | EmbeddingGemma 2 (segun su model card) | 68,46 |
| MTEB(eng, v2) | SonicEmbed (medido con `eval/mteb_tasks.py`) | 64,66 |

Las dos cifras proceden de ejecuciones distintas con configuraciones que pueden diferir, por lo que la comparacion no es estrictamente equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 576,6 M de parametros, en FP16 el peso ronda 1,15 GB y en FP32 unos 2,3 GB, a lo que hay que sumar el procesador de audio y los buffers de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder alojar el modelo en FP16.
- Cabe en GPU consumer: si, por el numero de parametros; no se ha verificado en la informacion disponible con modelos concretos.
- Opciones de despliegue: la via documentada es `sentence-transformers`; requiere ademas `librosa`, `pillow` y `torchvision` (estos dos ultimos porque el procesador del modelo base construye sus partes de imagen y video al cargar, aunque no se usen imagenes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Song Describer R@10 (3 clips) | MTEB(eng, v2) | Licencia |
|---|---|---|---|---|---|---|
| SonicEmbed | 576,6 M | no disponible | texto + audio musical | 40,4 | 64,66 | Apache-2.0 |
| LAION-CLAP (music_audioset_epoch_15_esc_90.14) | no disponible | no disponible | audio + texto | 33,5 | no evaluado | no disponible en la informacion |
| EmbeddingGemma 2 | 576,6 M | no disponible | texto (+ vision en el base) | 14,3 | 68,46 | no disponible en la informacion |

SonicEmbed supera a CLAP en recuperacion texto-a-musica y conserva capacidad de texto general, mientras que CLAP esta especializado en audio y EmbeddingGemma 2 no esta adaptado a musica. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con captions en ingles; otros idiomas no estan testeados y probablemente rindan mal.
- Perdida de calidad en texto general respecto al modelo base: 64,66 frente a 68,46 en MTEB(eng, v2), con la salvedad de que las ejecuciones no son directamente comparables.
- La torre de vision del modelo base no esta incluida; no se pueden generar embeddings de imagen.
- Riesgo de alucinacion no aplica directamente al ser un modelo de embeddings, pero la similitud puede producir recuperaciones erroneas con consultas ambiguas o fuera de dominio.
- Las puntuaciones de Song Describer tienen un margen de error de ±3 puntos en R@10 y pueden variar entre maquinas.
- La representacion de una pista mediante la media de tres clips de 10 s es una aproximacion; pistas largas o con estructura muy variable pueden quedar mal representadas.
- Requiere `pillow` y `torchvision` aunque no se usen imagenes, lo que anade dependencias innecesarias en produccion.
- Licencia Apache-2.0 en los pesos; las grabaciones de entrenamiento que requieren atribucion estan acreditadas en CREDITS.csv (identificador = item ID de Internet Archive).
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaisawhney/SonicEmbed
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset IAMD: https://huggingface.co/datasets/Telecom-Paris/iamd_v0
- Dataset MusicCaps: https://huggingface.co/datasets/google/MusicCaps
- Song Describer (dataset y evaluacion): https://github.com/mulab-mir/song-describer-dataset
- LAION-CLAP: https://github.com/LAION-AI/CLAP
- MTEB: https://github.com/embeddings-benchmark/mteb
- Creditos de grabaciones: CREDITS.csv (en el repositorio del modelo)
