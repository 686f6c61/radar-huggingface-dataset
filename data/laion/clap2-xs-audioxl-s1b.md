# laion/clap2-xs-audioxl-s1B

## Resumen

CLAP2-XS es un modelo contrastivo audio-texto desarrollado por LAION que proyecta clips de audio y descripciones en ingles a un espacio de embeddings compartido. Forma parte de la familia CLAP2, compuesta por cinco variantes (27M a 340M parametros), y esta es la segunda mas pequena con 48,3M de parametros totales entre sus dos torres. Resuelve tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de embeddings de audio generales, sin necesidad de fine-tuning especifico por tarea.

La innovacion principal reside en su torre de audio: un vision transformer NaFlex que opera sobre parches de espectrograma log-mel y acepta audio de cualquier duracion sin recorte ni padding a una longitud fija. Se entreno desde cero sobre LAION-Audio-XL, un corpus de 366M de pares audio-texto, durante 1.024M de muestras vistas. Es relevante para desarrolladores que necesitan un encoder de audio ligero, con licencia Apache 2.0 y compatible con OpenCLIP, para integrar en pipelines de recuperacion o clasificacion sin depender de modelos propietarios.

El modelo se distribuye en formato OpenCLIP (safetensors) y tambien en formato Transformers, aunque el soporte de CLAP2 en Transformers aun no esta incluido en una release estable. Su tamano reducido (repo de 0,4 GB) lo hace adecuado para despliegues con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva dual-tower (torre de audio NaFlex ViT sobre parches log-mel + torre de texto) |
| Parametros totales | 48.307.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio de cualquier duracion; entrenado con clips de hasta 30 s (buckets de 6,9 / 9,0 / 13,0 / 22,6 / 30,1 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (OpenCLIP y Transformers) |

## Arquitectura y entrenamiento

CLAP2-XS emplea una arquitectura contrastiva de dos torres. La torre de audio es un vision transformer NaFlex que procesa un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras) dividido en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. El preprocesado acepta cualquier frecuencia de muestreo y numero de canales: el audio multicanal se promedia a mono y se remuestrea a 32 kHz. La torre de texto mapea frases en ingles al mismo espacio de embeddings, y el entrenamiento contrastivo alinea ambas modalidades.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366M de pares audio-texto) durante 1.024M de muestras vistas, con un schedule de learning rate WSD (warmup-stable-decay) y evaluacion sobre el ultimo checkpoint. No se documenta en la informacion disponible el uso de RLHF o DPO. La innovacion tecnica destacable es la capacidad de aceptar audio de longitud variable sin recorte ni padding a una longitud fija, con un coste computacional que crece de forma cuadratica con la duracion; en evaluacion se limita a los primeros 30 s de cada clip.

## Capacidades

- Recuperacion audio-texto: genera embeddings normalizados de audio y texto comparables por similitud coseno.
- Clasificacion zero-shot de audio: clasifica clips frente a descripciones textuales de clases sin entrenamiento especifico.
- Extraccion de embeddings de audio: `encode_audio` y `encode_text` con normalizacion opcional.
- Procesamiento de audio de duracion variable: acepta cualquier frecuencia de muestreo y numero de canales.
- Procesamiento por lotes: padding enmascarado mediante `patch_valid`, con embeddings equivalentes a los calculados clip a clip.
- Cobertura de dominios de audio: habla, musica y sonidos segun los benchmarks MAEB-30 y HEAR-17.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no un LLM.

## Casos de uso

- Busqueda semantica de audio: indexar una fonoteca con `encode_audio` y recuperar clips mediante consultas de texto con `encode_text` y similitud coseno; adecuado por su bajo coste de almacenamiento (48,3M parametros, embeddings por clip).
- Etiquetado automatico de archivos de audio: clasificacion zero-shot frente a descripciones en frase completa de cada clase, promediando embeddings de prompts por clase y restando la puntuacion media de cada clase antes del argmax.
- Moderacion de contenido sonoro: deteccion de categorias como musica de fondo, aplausos o ruido mediante prompts descriptivos, sin necesidad de un clasificador entrenado ad hoc.
- Monitorizacion acustica: segmentar grabaciones largas en tramos de hasta 30 s, calcular embeddings por segmento y comparar o promediar para detectar eventos (por ejemplo, ladridos o alarmas).
- Anotacion asistida de datasets: preetiquetar corpus de audio con clases candidatas y revision humana posterior, aprovechando el formato OpenCLIP y su integracion con pipelines existentes.
- Sistemas de recomendacion de audio: calcular similitud entre clips o entre un clip y una descripcion textual para generar recomendaciones, con inferencia ligera en CPU o GPU consumer.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S | 103,9M | 51,8 | 81,8 | 29,8 |
| **CLAP2-XS** | **48,3M** | **49,1** | **80,6** | **27,6** |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media de 30 tareas del Massive Audio Embedding Benchmark (habla, musica y sonido; clasificacion, zero-shot, pair classification, clustering y retrieval). HEAR-17 es la media de 17 tareas HEAR (todas excepto Beehive y Maestro 5h). MSEB es la media de 62 puntuaciones MSEB en ingles. El protocolo exacto y las comparaciones con otros modelos audio-texto se detallan en el paper citado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 48,3M parametros; el repo completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; modelos como RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: OpenCLIP (`open_clip_torch>=4.2.1.dev0`) y Transformers (`Clap2Model`, `Clap2Processor`, pendiente de release estable).
- Latencia y throughput: no disponibles en la informacion proporcionada; el coste crece de forma cuadratica con la duracion del audio, por lo que se recomienda segmentar en tramos de hasta 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | MAEB-30 | HEAR-17 | Licencia |
|---|---|---|---|---|---|
| CLAP2-XS | 48,3M | Variable (evaluado a 30 s) | 49,1 | 80,6 | Apache 2.0 |
| CLAP2-S | 103,9M | Variable (evaluado a 30 s) | 51,8 | 81,8 | Apache 2.0 |
| CLAP2-M | 152,8M | Variable (evaluado a 30 s) | 52,3 | 81,4 | Apache 2.0 |
| CLAP2-XXS | 27,3M | Variable (evaluado a 30 s) | 46,2 | 79,1 | Apache 2.0 |

La comparacion con modelos audio-texto de otros autores no esta disponible en la informacion proporcionada; la model card remite al paper para dichas comparaciones.

## Limitaciones y advertencias

- Solo soporta texto en ingles; el rendimiento en otros idiomas no esta evaluado.
- El audio se evalua unicamente con los primeros 30 s de cada clip; clips mas largos se aceptan pero no estan evaluados, y el coste crece de forma cuadratica con la duracion.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas en zero-shot: la model card recomienda describir cada clase con varias frases completas, evitar etiquetas sueltas y negaciones, promediar embeddings por clase y restar la puntuacion media de cada clase antes del argmax.
- No es un modelo generativo: no produce texto, codigo ni razonamiento; su uso esta limitado a embeddings, recuperacion y clasificacion.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre LAION-Audio-XL, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del corpus de entrenamiento para usos sensibles.
- El soporte en Transformers esta pendiente y no incluido en ninguna release estable en el momento de la publicacion de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- CLAP2-L: https://huggingface.co/laion/clap2-large-audioxl-s1B
- CLAP2-M: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- CLAP2-S: https://huggingface.co/laion/clap2-small-audioxl-s1B
- CLAP2-XXS: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Paper: no disponible en la informacion proporcionada (la model card lo referencia sin enlace explicito)
