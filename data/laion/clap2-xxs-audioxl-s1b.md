# laion/clap2-xxs-audioxl-s1B

## Resumen

CLAP2-XXS es el miembro mas pequeno de la familia CLAP2, un conjunto de cinco modelos contrastivos audio-texto desarrollados por LAION (27M a 340M parametros). El modelo empareja una torre de audio y una torre de texto para proyectar clips de audio y descripciones en ingles a un espacio de embeddings compartido, lo que permite tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de caracteristicas de audio de proposito general.

La arquitectura combina una torre de audio basada en un vision transformer NaFlex que opera sobre parches de espectrograma log-mel, capaz de procesar audio de longitud arbitraria sin recorte ni padding a una longitud fija, con una torre de texto tipo transformer con tokenizador BPE estilo GPT-2. El modelo completo suma 27.293.040 parametros y se distribuye en formato safetensors bajo licencia Apache 2.0, con un peso de repositorio de 0,3 GB.

Su relevancia actual reside en que ofrece embeddings audio-texto con un coste computacional muy bajo (modelo "XXS", pensado para ejecucion barata) manteniendo resultados competitivos en benchmarks de audio como MAEB-30 (46,2 %) y HEAR-17 (79,1 %), lo que lo hace adecuado para filtrado y curacion de datasets de audio a gran escala, clasificacion zero-shot en produccion y como extractor de caracteristicas en pipelines con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto de dos torres; torre de audio NaFlex vision transformer sobre parches log-mel; torre de texto transformer con tokenizador BPE estilo GPT-2 |
| Parametros totales | 27.293.040 (ambas torres) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio: cualquier longitud de entrada (entrenado con clips de hasta 30 s); texto: 256 tokens |
| Tipos de cuantizacion | No disponible (el modelo se usa en float32; el entrenamiento empleo autocast bf16) |
| Idiomas soportados | Ingles (texto); el corpus de entrenamiento contiene habla en varios idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria open_clip) |

## Arquitectura y entrenamiento

CLAP2-XXS es un modelo contrastivo de dos torres. La torre de audio es un vision transformer NaFlex que recibe un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras), lo corta en parches no solapados de 16x16 y genera 50 tokens por segundo de audio. El front end remuestrea la entrada a 32 kHz y promedia canales a mono, aceptando cualquier frecuencia de muestreo y numero de canales. La torre de texto procesa ingles con un tokenizador BPE estilo GPT-2 de 256 tokens y es sensible a mayusculas. Ambas torres se usan en float32, aunque el entrenamiento empleo autocast bf16.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, durante 1.024 millones de muestras vistas con un schedule de learning rate WSD (warmup-stable-decay) y checkpoint final. Los clips de entrenamiento tienen como maximo 30 s, organizados en buckets de longitud de 6,9, 9,0, 13,0, 22,6 y 30,1 s. La innovacion principal es la capacidad NaFlex de procesar audio de longitud variable sin recorte ni padding fijo, produciendo un embedding por clip; el coste computacional crece de forma cuadratica con la longitud debido a la atencion completa.

## Capacidades

- Recuperacion audio-texto: emparejamiento de clips de audio con descripciones textuales en un espacio de embeddings compartido.
- Clasificacion zero-shot de audio: asignacion de etiquetas a clips mediante prompts de texto en frases completas.
- Extraccion de embeddings de audio y de texto normalizados para clasificadores downstream.
- Procesamiento de audio de longitud arbitraria gracias al front end NaFlex (sin recorte ni padding a longitud fija).
- Manejo de audio con cualquier frecuencia de muestreo y numero de canales (remuestreo a 32 kHz y mezcla a mono).
- Procesamiento por lotes de varios clips con padding enmascarado mediante `patch_valid`, que preserva los embeddings individuales.
- Capacidades multilingues: no disponible en la torre de texto (solo ingles); el audio de entrada puede contener habla en varios idiomas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo de texto).

## Casos de uso

- Curacion y filtrado de datasets de audio a gran escala: el modelo puede rankear o filtrar clips por consultas de texto en ingles, aprovechando su bajo coste de ejecucion (27M parametros) para procesar corpus masivos.
- Etiquetado zero-shot de audio en produccion: clasificacion de clips en categorias definidas mediante prompts de texto, sin necesidad de entrenar un clasificador especifico.
- Deteccion de eventos sonoros: identificacion de sonidos concretos (por ejemplo, ladridos, lluvia, aplausos) en grabaciones segmentadas en ventanas de hasta 30 s.
- Extraccion de caracteristicas para clasificadores downstream: generacion de embeddings de audio normalizados que alimentan modelos ligeros de clasificacion o clustering.
- Busqueda semantica en archivos de audio: recuperacion de clips relevantes a partir de consultas textuales en ingles, util en bibliotecas de efectos de sonido o archivos musicales.
- Analisis de contenido multimedia: indexacion automatica de pistas de audio de video para moderacion o recomendacion, segmentando grabaciones largas en tramos de hasta 30 s y promediando o comparando embeddings.
- Prototipado e investigacion: modelo de referencia barato para experimentar con arquitecturas contrastivas audio-texto y comparar con los modelos mayores de la familia CLAP2 (S, M, L).

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS (este modelo) | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (habla, musica y sonido; clasificacion, clasificacion zero-shot, clasificacion de pares, clustering y recuperacion). HEAR-17 es la media sobre 17 tareas HEAR (todas excepto Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en ingles. Las puntuaciones de benchmark usan solo los primeros 30 s de cada clip.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 27,3M parametros en float32 el modelo ocupa aproximadamente 110 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; tambien es viable en CPU para cargas moderadas.
- Cabe en GPU consumer: si, en practicamente todas (RTX 3060, RTX 4090, etc.), asi como en GPUs integradas y en CPU.
- Opciones de despliegue: libreria `open_clip_torch` (>=4.2.1) con `soundfile` para carga de audio; tambien se distribuye en formato Transformers segun la model card.
- Latencia y throughput estimados: no disponible; el coste computacional crece de forma cuadratica con la longitud del audio (atencion completa), por lo que se recomienda segmentar grabaciones largas en tramos de hasta 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | MAEB-30 | HEAR-17 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CLAP2-XXS | 27,3M | Cualquier longitud (entrenado hasta 30 s) | 46,2 | 79,1 | Apache 2.0 | Hugging Face (open_clip y Transformers) |
| CLAP2-XS | 48,3M | Cualquier longitud (entrenado hasta 30 s) | 49,1 | 80,6 | Apache 2.0 | Hugging Face |
| CLAP2-S | 103,9M | Cualquier longitud (entrenado hasta 30 s) | 51,8 | 81,8 | Apache 2.0 | Hugging Face |
| CLAP2-M | 152,8M | Cualquier longitud (entrenado hasta 30 s) | 52,3 | 81,4 | Apache 2.0 | Hugging Face |

La comparativa con modelos de otras familias (por ejemplo, CLAP original de LAION o AudioCLIP) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La torre de texto solo procesa ingles; el corpus contiene habla en varios idiomas, pero la recuperacion y clasificacion mediante texto quedan restringidas al ingles.
- El tokenizador es sensible a mayusculas: el texto escrito integramente en mayusculas se tokeniza en piezas raras y obtiene peores puntuaciones. Se recomienda escribir en minusculas o en sentence case normal.
- Riesgo de alucinacion en el sentido de asignaciones erroneas de etiquetas: la clasificacion zero-shot depende de la calidad de los prompts; se recomienda usar varias frases completas por clase, evitar etiquetas desnudas y negaciones, y restar la puntuacion media de cada clase antes de tomar la clase top.
- El modelo fue entrenado con clips de hasta 30 s; acepta clips mas largos, pero este comportamiento no ha sido evaluado, y el coste crece de forma cuadratica con la longitud.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del corpus LAION-Audio-XL y de los datasets de evaluacion empleados.
- El modelo no es generativo: no produce texto ni razonamiento; solo genera embeddings y puntuaciones de similitud.

## Enlaces

- Hugging Face: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- Modelo CLAP2-L: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Modelo CLAP2-M: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Modelo CLAP2-S: https://huggingface.co/laion/clap2-small-audioxl-s1B
- Modelo CLAP2-XS: https://huggingface.co/laion/clap2-xs-audioxl-s1B
