# laion/clap2-large-audioxl-s1B

## Resumen

CLAP2-L es un modelo contrastivo audio-texto desarrollado por LAION que proyecta clips de audio y descripciones en ingles a un espacio de embeddings compartido. Forma parte de una familia de cinco modelos CLAP2 (de 27M a 340M parametros) entrenados desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto. La variante L, objeto de esta ficha, suma 340,1 millones de parametros entre sus dos torres.

El modelo resuelve tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de embeddings generales de audio, sin necesidad de ajuste fino sobre el dominio objetivo. Su torre de audio es un vision transformer NaFlex que opera sobre parches de espectrograma log-mel y acepta clips de duracion arbitraria sin recorte ni padding a una longitud fija, lo que simplifica el preprocesado en produccion.

Es relevante ahora porque ofrece una alternativa con licencia Apache 2.0 a modelos propietarios de representacion de audio, con pesos en formato OpenCLIP y Transformers, y porque su evaluacion cubre los tres dominios de audio (habla, musica y sonido ambiental) mediante MAEB-30, HEAR-17 y MSEB. La familia CLAP2 esta pensada como infraestructura de embeddings reutilizable, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer contrastivo de dos torres (audio NaFlex ViT sobre parches log-mel + torre de texto) |
| Parametros totales | 340.073.856 (ambas torres) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; audio de duracion arbitraria, evaluacion con `max_num_patches=1504` (primeros 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (OpenCLIP y Transformers en el mismo repositorio) |

## Arquitectura y entrenamiento

CLAP2-L es un modelo contrastivo de dos torres. La torre de audio es un vision transformer NaFlex que consume parches de un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, ventana de 320 muestras) y produce un unico embedding por clip. El preprocesado acepta cualquier frecuencia de muestreo y cualquier numero de canales: la mezcla a mono y el remuestreo a 32 kHz se realizan internamente. La torre de texto procesa captions en ingles y las proyecta al mismo espacio, de modo que la similitud coseno entre ambas modalidades sirve como puntuacion de afinidad.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366M pares audio-texto), con 1.024M muestras vistas y un schedule de learning rate WSD, tomando el ultimo checkpoint. Los cinco tamanos de la familia comparten receta y corpus, lo que permite escalar el coste de inferencia sin cambiar el pipeline. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el modelo no es generativo.

## Capacidades

- Extraccion de embeddings de audio y de texto en un espacio compartido, con normalizacion opcional.
- Recuperacion audio-texto y texto-audio mediante similitud coseno.
- Clasificacion zero-shot de audio a partir de captions descriptivos por clase.
- Procesamiento de audio de duracion arbitraria sin recorte ni padding fijo.
- Aceptacion de cualquier frecuencia de muestreo y numero de canales en la entrada.
- Soporte de batching con clips de distinta longitud mediante padding enmascarado (`patch_valid`).
- Cobertura de dominios de habla, musica y sonido ambiental en la evaluacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.

## Casos de uso

- Moderacion de audio en plataformas: calcular embeddings de clips subidos y compararlos contra captions de categorias prohibidas para un filtrado previo barato antes de revision humana.
- Etiquetado automatico de archivos de sonido: clasificacion zero-shot de efectos de sonido y samples musicales en bibliotecas grandes, usando varias captions por clase y promediando sus embeddings.
- Busqueda semantica en archivos audiovisuales: indexar los embeddings de audio de un catalogo y recuperar clips mediante consultas de texto en ingles.
- Analisis de contenido musical: agrupar y clasificar fragmentos por instrumentacion o estilo a partir de descripciones textuales, sin entrenar un clasificador especifico.
- Investigacion en representaciones de audio: usar los embeddings como features congeladas para tareas downstream (clustering, pair classification, retrieval) dentro del protocolo MAEB.
- Deteccion de eventos acusticos en entornos industriales o urbanos: clasificacion zero-shot de eventos (alarmas, cristales rotos, vehiculos) con captions adaptadas al dominio.
- Construccion de datasets: filtrar pares audio-texto por similitud coseno para depurar corpus de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor). MAEB-30 es la media de 30 tareas del Massive Audio Embedding Benchmark; HEAR-17, la media de 17 tareas HEAR (excluidas Beehive y Maestro 5h); MSEB, la media de 62 puntuaciones MSEB en ingles.

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L (este) | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

No se han publicado en la informacion disponible comparaciones numericas con modelos audio-texto de otros autores; la model card remite al paper para dicha comparativa.

## Requisitos de hardware

- VRAM estimada: en fp32, unos 1,4 GB para los 340M parametros; en fp16/bf16, en torno a 0,7 GB. El repo ocupa 2,7 GB por incluir pesos en varios formatos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; A100 o H100 solo necesarias para lotes grandes o extraccion masiva de embeddings.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida para lotes pequenos.
- Despliegue: OpenCLIP desde la rama `main` (no disponible aun en releases de PyPI) o Transformers una vez publicado el soporte de `Clap2Model` y `Clap2Processor`, que en la informacion disponible figura como pendiente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | MAEB-30 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLAP2-L | 340,1M | duracion arbitraria (eval. 30 s) | 53,6 | Apache 2.0 | HuggingFace (OpenCLIP y Transformers) |
| CLAP2-M | 152,8M | duracion arbitraria (eval. 30 s) | 52,3 | Apache 2.0 | HuggingFace |
| CLAP2-S | 103,9M | duracion arbitraria (eval. 30 s) | 51,8 | Apache 2.0 | HuggingFace |
| CLAP2-XS | 48,3M | duracion arbitraria (eval. 30 s) | 49,1 | Apache 2.0 | HuggingFace |

La comparativa con modelos audio-texto de otros desarrolladores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta texto en ingles; las captions en otros idiomas degradaran la recuperacion y la clasificacion zero-shot.
- Las similitudes coseno son bajas en terminos absolutos; deben compararse entre textos para un mismo clip, no contra un umbral fijo.
- Riesgo de sesgo heredado de LAION-Audio-XL: la composicion del corpus condiciona que sonidos y descripciones se representan mejor.
- La clasificacion zero-shot es sensible al formato de los prompts; la model card recomienda captions completos y desaconseja etiquetas desnudas y negaciones.
- No es un modelo generativo: no produce texto, transcripciones ni descripciones libres.
- El soporte en Transformers esta pendiente y no incluido en ninguna release; en OpenCLIP requiere instalar desde la rama `main`.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni evaluaciones especificas de robustez en dominios de produccion.
- El modelo tiene un volumen de descargas muy bajo (30) y ninguna valoracion, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- HuggingFace: https://huggingface.co/laion/clap2-large-audioxl-s1B
- CLAP2-M: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- CLAP2-S: https://huggingface.co/laion/clap2-small-audioxl-s1B
- CLAP2-XS: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- CLAP2-XXS: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Repositorio OpenCLIP: https://github.com/mlfoundations/open_clip
- Paper: no disponible en la informacion proporcionada (la model card lo referencia sin enlace)
- Demo: no disponible
