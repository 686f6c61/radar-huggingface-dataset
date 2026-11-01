# Jgmorenof/plots-qwen3-embedding-8b-lora-masked

## Resumen

`Jgmorenof/plots-qwen3-embedding-8b-lora-masked` es un adaptador LoRA de rango 16 sobre el modelo de embeddings `Qwen/Qwen3-Embedding-8B`, desarrollado por Jose G. Moreno y colaboradores en el marco del conjunto de datos PLOTS. Su objetivo es la similitud narrativa: emparejar resúmenes de tramas de películas escritos de forma independiente en distintos idiomas, de modo que el modelo reconozca que dos textos cuentan la misma historia aunque no compartan palabras ni nombres propios.

El adaptador se entrena sobre 20.000 pares de resúmenes de tramas de Wikipedia (una trama en inglés emparejada con su versión en frances, espanol, portugues, aleman o italiano), con las entidades enmascaradas por tipo (PERSON, LOCATION, ORG) mediante spaCy. Esta decisión de diseno fuerza al modelo a apoyarse en la estructura narrativa y no en la coincidencia superficial de nombres, lo que mejora la recuperacion en escenarios de "tip-of-the-tongue" (recuperar una pelicula que el usuario recuerda a medias).

Es relevante porque aborda una tarea practica mal cubierta por los modelos de embeddings genericos: la recuperacion cross-lingue basada en contenido narrativo. Con 8B parametros y una ventana de entrada de 512 tokens, el adaptador mejora a su base zero-shot en la mayoria de las metricas reportadas, aunque empeora en consultas cortas sin enmascarar que solo pueden resolverse por nombres propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-Embedding-8B) con adaptador LoRA de rango 16 sobre el modelo de embeddings |
| Parametros totales | 8B en el modelo base; el adaptador LoRA anade un numero de parametros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada en entrenamiento (la del modelo base no se detalla en la informacion disponible) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene el adaptador en safetensors; las cuantizaciones dependen del modelo base) |
| Idiomas soportados | Multilingue; entrenado explicitamente con pares en frances, espanol, portugues, aleman e italiano frente a ingles |
| Licencia | Apache 2.0 (los pesos conservan la licencia del modelo base); datos de entrenamiento PLOTS bajo CC BY-SA 4.0 |
| Formato de pesos | Safetensors (adaptador LoRA/PEFT); requiere el modelo base y la libreria `peft` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 montado sobre `Qwen/Qwen3-Embedding-8B`, un transformer denso de 8.000 millones de parametros especializado en generar embeddings de frases. El adaptador no modifica la arquitectura del base: anade matrices de bajo rango en las capas del transformer, de modo que en inferencia se carga el base completo mas el adaptador mediante `peft`/`sentence-transformers`.

El entrenamiento usa 20.000 pares de entrenamiento (subconjunto aleatorio del dataset PLOTS) con resumenes de trama enmascarados por tipo en frances, espanol, portugues, aleman e italiano. La funcion de perdida es una InfoNCE contrastiva simetrica en ambos sentidos (query-documento y documento-query) con gradient caching, batch de 128, 1 epoca, learning rate 1e-4, longitud maxima de entrada de 512 tokens y semilla 13. Se excluyen del entrenamiento las peliculas de SemEval-2026 Task 4 y de TREC ToT 2023 (objetivos de train y dev) para evitar filtraciones en la evaluacion. La innovacion principal es el enmascaramiento de entidades por tipo, que obliga al modelo a aprender representaciones basadas en la estructura narrativa en lugar de en nombres propios.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion (pipeline `sentence-similarity`).
- Similitud narrativa: emparejar resumenes de la misma historia escritos de forma independiente.
- Recuperacion cross-lingue: consulta en un idioma contra documentos en otro (entrenado con pares en fr, es, pt, de, it frente a en).
- Recuperacion tipo "tip-of-the-tongue": localizar una pelicula a partir de una descripcion parcial o vaga de su trama.
- Soporte de prompts de instruccion diferenciados para consulta y documento (formato `Instruct: ... Query:`).
- Capacidad multilingue heredada del modelo base Qwen3-Embedding-8B.
- No dispone de tool calling, generacion de texto libre, vision ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda de peliculas por descripcion vaga: un usuario describe lo que recuerda de una pelicula ("un hombre que vuelve a su pueblo y descubre un secreto familiar") y el modelo recupera la pagina de Wikipedia correcta mediante similitud de embeddings con prompts de instruccion especificos para "tip-of-the-tongue".
- Recuperacion cross-lingue en catalogos audiovisuales: una consulta en espanol puede recuperar fichas de peliculas descritas en ingles, ya que el adaptador se entreno con pares es-en, fr-en, pt-en, de-en e it-en.
- Deduplicacion de resumenes de tramas: detectar entradas duplicadas o casi duplicadas en una base de datos de sinopsis escritas por distintos autores, usando similitud simetrica historia-a-historia.
- Construccion de motores de recomendacion narrativa: indexar embeddings de sinopsis y recuperar peliculas con tramas similares a una dada, con independencia del idioma del catalogo.
- Enriquecimiento de bases de conocimiento: alinear articulos de Wikipedia de distintas ediciones que tratan la misma pelicula pero con redacciones independientes, para tareas de entity linking o fusion de datos.
- Evaluacion de sistemas de recuperacion narrativa: servir como referencia en experimentos de SemEval-2026 Task 4 o TREC ToT 2023, donde el modelo reporta resultados competitivos frente a su base zero-shot.

## Benchmarks y rendimiento

Resultados reportados en la model card (NS: exactitud en 355 triples de test leak-free de SemEval-2026 Task 4 track B; PLOTS-IR: nDCG@10 en las consultas de test, M indica entidades enmascaradas; ToT: consultas dev de TREC ToT 2023):

| Metrica | Este modelo | Qwen3-Embedding-8B zero-shot |
|---|---|---|
| NS accuracy | 0.693 | 0.642 |
| PLOTS-IR Full | 0.991 | 0.991 |
| PLOTS-IR Full M | 0.972 | 0.912 |
| PLOTS-IR First | 0.725 | 0.848 |
| PLOTS-IR Last | 0.332 | 0.512 |
| PLOTS-IR Last M | 0.184 | 0.183 |
| ToT nDCG@10 | 0.370 | 0.241 |
| ToT R@100 | 0.700 | 0.580 |

El adaptador mejora al base en NS accuracy, PLOTS-IR con entidades enmascaradas y ambas metricas de TREC ToT, pero rinde peor en las variantes First y Last sin enmascarar, que dependen de la coincidencia de nombres propios.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,1 GB; el coste real proviene del modelo base Qwen3-Embedding-8B, que debe cargarse completo.
- VRAM estimada para el base en precision completa (bf16/fp16): en torno a 16 GB solo para pesos, mas memoria para activaciones y batch; con cuantizacion de 8 bits o 4 bits se reduce sustancialmente, aunque las cuantizaciones no se detallan en la informacion disponible.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para produccion con batches grandes; una RTX 4090 (24 GB) puede alojar el base en bf16 con batches pequenos.
- Despliegue mediante `sentence-transformers` con `peft` para cargar el adaptador; tambien es compatible con stacks que soporten adaptadores LoRA sobre el base (por ejemplo, servidores de inferencia con soporte PEFT), aunque no se documentan opciones concretas en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (PLOTS-Qwen3-Embedding-8B LoRA) | 8B + LoRA r16 | 512 tokens en entrenamiento | Embeddings de similitud narrativa cross-lingue | Apache 2.0 | HuggingFace (adaptador) |
| Qwen3-Embedding-8B (base) | 8B | No disponible en la informacion | Embeddings genericos multilingues | Apache 2.0 | HuggingFace |
| Modelos de embeddings multilingues de menor tamano (p. ej. familia BGE-M3 o E5) | 0,3B-0,6B | No disponible en la informacion | Embeddings genericos multilingues | Varía segun modelo | HuggingFace |

La comparativa directa con alternativas especializadas en similitud narrativa no esta disponible en la informacion proporcionada; el unico punto de referencia cuantitativo es el propio modelo base zero-shot.

## Limitaciones y advertencias

- Debil en consultas cortas sin enmascarar que solo pueden resolverse mediante nombres propios: PLOTS-IR First cae de 0.848 (base) a 0.725 y Last de 0.512 a 0.332.
- Entrenado sobre resumenes de tramas de peliculas de Wikipedia; puede generalizar mal a otros dominios narrativos (novelas, series, videojuegos) no representados en el dataset.
- La ventana de entrada usada en entrenamiento es de 512 tokens; textos mas largos pueden truncarse y perder informacion relevante.
- Riesgo de sesgo heredado del corpus de Wikipedia y del modelo base Qwen3-Embedding-8B, no evaluado en la model card.
- No es un modelo generativo: no produce texto, solo embeddings; no admite tool calling ni razonamiento multi-paso.
- Requiere cargar el modelo base de 8B ademas del adaptador, con el coste de memoria asociado.
- Licencia Apache 2.0 en los pesos, pero los datos de entrenamiento PLOTS estan bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y comparticion si se redistribuyen derivados del dataset.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jgmorenof/plots-qwen3-embedding-8b-lora-masked
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Dataset PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
- Cita del paper: Moreno, Hamdi, Boros, Jatowt, Bordea, Gonzalez-Gallardo y Doucet (2026), "PLOTS -- Same Story, Different Words: Paired Plot Outlines for Narrative Similarity and Retrieval"
