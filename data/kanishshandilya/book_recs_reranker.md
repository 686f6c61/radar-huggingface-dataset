# kanishshandilya/book_recs_reranker

## Resumen

`book_recs_reranker` es un cross-encoder de reordenacion (reranking) afinado por el usuario kanishshandilya a partir de `BAAI/bge-reranker-base`, orientado a la segunda etapa de un pipeline de recomendacion semantica de libros. La nomenclatura del repositorio y sus etiquetas lo sitúan dentro del ecosistema `sentence-transformers`, con `pipeline_tag` de clasificacion de texto y una arquitectura heredada de XLM-RoBERTa de 278.044.417 parametros. Su funcion es reordenar una lista de candidatos ya recuperados por un bi-encoder en una primera etapa.

La relevancia de este modelo es metodologica mas que de escala: la model card documenta con detalle un proceso de minado de negativos duros en la llamada "zona Goldilocks" (rangos 10-45 de la lista de candidatos) y un conjunto de filtros para suprimir falsos negativos (mismo `work_id`, misma `series_id`, mismo autor, titulos solapados, techo de similitud coseno de 0,82). Sobre 2.998 consultas de validacion sin solapamiento con entrenamiento, el autor reporta una mejora de MRR@10 de 79,14% a 88,73% respecto al checkpoint base.

Se trata de un modelo de nicho, con cero descargas y un solo "like" en el momento de la consulta, publicado bajo licencia MIT y con soporte declarado para `text-embeddings-inference`. Su ventana de entrada esta limitada a 384 tokens, lo que condiciona directamente su uso en produccion: obliga a truncar descripciones de libros o a disenar un formato compacto de candidato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (heredada de BAAI/bge-reranker-base) |
| Parametros totales | 278.044.417 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 384 tokens (longitud maxima de secuencia declarada por el autor) |
| Tipos de cuantizacion | no disponible (la model card solo menciona FP16 en entrenamiento; el repo distribuye safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (via `transformers`); repositorio de 1,1 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de clasificacion binaria de relevancia construido sobre `BAAI/bge-reranker-base`. A diferencia de un bi-encoder, que codifica consulta y documento por separado, aqui se aplica atencion cruzada completa sobre el par concatenado `[query, book_text]` y se emite una unica puntuacion logit por par, que se interpreta como probabilidad de relevancia. La arquitectura subyacente es XLM-RoBERTa con una cabeza de clasificacion de secuencia (`AutoModelForSequenceClassification`). La longitud maxima de entrada es de 384 tokens, suficiente para pares cortos de consulta y fragmento de libro pero insuficiente para descripciones largas completas.

El entrenamiento se realizo con `BCEWithLogitsLoss` sobre aproximadamente 300.000 pares, con una proporcion de 1 positivo y 4 negativos duros por consulta. Los negativos no se tomaron de los primeros puestos de la lista del bi-encoder (rangos 0-9), porque en catalogos grandes esos puestos suelen contener verdaderos positivos no etiquetados (secuelas, precuelas, spin-offs) que envenenarian el reranker; en su lugar se minaron los rangos 10-45. Antes de formar los pares se aplico un filtrado multicapa: exclusion por `work_id` de Goodreads, por `series_id` o titulos de serie coincidentes, por mismo autor, por la lista de "libros similares" de Goodreads, por solapamiento de palabras significativas en el titulo igual o superior al 50% y por un techo de similitud coseno de 0,82. La optimizacion uso AdamW con `lr=2e-5`, 5% de warmup y precision mixta FP16, con padding dinamico en la funcion de collate; el autor indica que el entrenamiento cupo en una NVIDIA RTX 4050 de 6 GB con unos 2,8 GB de uso de VRAM. No se menciona RLHF, DPO ni ninguna fase de alineacion por preferencias.

## Capacidades

- Puntuacion de relevancia consulta-libro mediante atencion cruzada completa sobre el par de entrada.
- Reordenacion de resultados de una etapa previa de recuperacion (reranking de segundo nivel).
- Clasificacion de texto binaria en la tarea de `text-classification` (etiqueta relevante / no relevante).
- Manejo de consultas en lenguaje natural descriptivo, como "cozy fantasy novel with low stakes and bakery setting".
- Discriminacion entre libros tematicamente proximos pero distintos (confusores semanticos), que es el objetivo central del entrenamiento con negativos duros.
- Compatibilidad con `text-embeddings-inference` y con `endpoints_compatible` segun las etiquetas del repositorio.
- Integracion con la primera etapa del mismo autor: `kanishshandilya/book_recs_embed`.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Segunda etapa de un motor de recomendacion de libros: tras recuperar, por ejemplo, 50 candidatos con un bi-encoder y busqueda ANN, el cross-encoder repuntua cada par y deja arriba los mas relevantes. Aporta la ganancia de MRR@10 que el autor mide en 9,59 puntos absolutos sobre el base.
- Busqueda semantica en catalogos editoriales: dada una consulta de un lector en lenguaje natural ("fantasia epica con protagonista femenina y magia dura"), reordenar el catalogo recuperado para mejorar el orden final de resultados.
- Sistemas de "libros similares a este": usar el titulo y la sinopsis de un libro como consulta y rerankear los candidatos del catalogo, con el filtrado de series y autores que ya se aplico en entrenamiento como referencia de diseno.
- Asistentes de descubrimiento lector en aplicaciones moviles: el modelo ocupa unos 2,8 GB en FP16 segun el autor, por lo que puede servirse en GPU de gama media con latencia baja para sesiones interactivas.
- Moderacion de calidad en recomendaciones generadas por otro sistema: usar la puntuacion del cross-encoder como filtro para descartar pares con logit bajo antes de mostrarlos al usuario.
- Evaluacion comparativa de embeddings de libros: sirve como juez de relevancia para medir si un nuevo bi-encoder de primera etapa mejora o no sobre el existente, fijando el reranker como referencia.
- Construccion de datasets de entrenamiento por minado de negativos duros: la receta descrita (rangos 10-45, filtros de `work_id`, `series_id`, autor y coseno) es reutilizable en otros dominios de recomendacion.
- Despliegue en pipelines de `text-embeddings-inference`: al estar etiquetado como compatible, puede servirse junto al bi-encoder en la misma infraestructura.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son la evaluacion sobre 2.998 consultas de validacion sin solapamiento con el conjunto de entrenamiento:

| Metrica | Baseline (`bge-reranker-base`) | Fine-tuned (`book_recs_reranker`) | Mejora absoluta | Ganancia relativa |
|---|---|---|---|---|
| MRR@10 | 79,14% | 88,73% | +9,59% | +12,1% |
| MAP | 79,13% | 88,71% | +9,58% | +12,1% |

El autor interpreta que un MRR@10 de 88,73% implica que el libro ideal queda en primera posicion en mas del 80% de las consultas de test y casi siempre dentro de las dos primeras. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval u otros) en la informacion disponible, lo cual es coherente con la naturaleza del modelo: no es un modelo generativo ni de razonamiento general, sino un clasificador de relevancia de dominio especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278 millones de parametros, en FP32 el peso ocupa aproximadamente 1,1 GB y en FP16 unos 0,56 GB. Sumando activaciones y el buffer de 384 tokens por par, un lote pequeno cabe holgadamente por debajo de 2 GB en FP16.
- El autor reporta un uso de unos 2,8 GB de VRAM en entrenamiento en una NVIDIA RTX 4050 de 6 GB, lo que da una referencia de consumo en FP16 con padding dinamico.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 4050, RTX 3060, RTX 4060, RTX 4090). Para servir lotes grandes con alto throughput, una A100 o H100 permitirian paralelizar muchos pares por paso.
- Cabe sin problema en GPU consumer; incluso en CPU es viable para volumenes moderados dado el tamano del modelo, aunque la latencia por par sera sensiblemente mayor.
- Opciones de despliegue: `transformers` con PyTorch (el ejemplo de la model card usa `AutoTokenizer` y `AutoModelForSequenceClassification`), `text-embeddings-inference` (etiqueta explicita del repo) y endpoints compatibles. No se menciona soporte GGUF ni Ollama, y no hay confirmacion de soporte en vLLM o llama.cpp.
- Latencia y throughput: no disponibles. La model card no publica numeros de latencia ni de pares por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kanishshandilya/book_recs_reranker` | 278.044.417 | 384 tokens | MRR@10 88,73% / MAP 88,71% | MIT | HuggingFace, repositorio propio |
| `BAAI/bge-reranker-base` | 278M (base del anterior) | no disponible en la informacion proporcionada | MRR@10 79,14% / MAP 79,13% en la validacion del autor | MIT | HuggingFace, ampliamente desplegado |
| Otros rerankers de la familia BGE o alternativas comerciales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible frente al checkpoint base, que es el unico para el que la informacion proporcionada incluye cifras medidas sobre el mismo conjunto de validacion. Cualquier comparacion con rerankers de mayor tamano o con servicios de reranking propietarios careceria de datos verificables en esta ficha.

## Limitaciones y advertencias

- Ventana de 384 tokens: obliga a truncar descripciones de libros. Si la parte discriminativa de la sinopsis queda fuera del limite, la puntuacion perdera precision.
- Solo ingles: el autor declara `en` como unico idioma. Aunque la base XLM-RoBERTa es multilingue, no hay evidencia de que el afinamiento preserve calidad en otros idiomas.
- Dominio estrecho: el modelo esta entrenado especificamente para recomendacion de libros. Su uso en otros dominios de reranking (productos, articulos, documentos legales) no esta validado y probablemente degrade respecto a un reranker generalista.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es emitir puntuaciones altas para candidatos irrelevantes; el autor mitiga parte de este problema en entrenamiento con filtros de falsos negativos, pero no hay garantia en inferencia.
- Sesgos: no se documenta ningun analisis de sesgo demografico, de genero, de autor o de editorial. El sesgo del catalogo de Goodreads usado para minar negativos puede trasladarse al modelo.
- Volumen de validacion limitado a la evaluacion interna del autor: 2.998 consultas sin solapamiento, pero no hay evaluacion por un tercero independiente.
- Adopcion practicamente nula: cero descargas y un solo "like" en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de reportes de fallos en produccion.
- Licencia MIT: permite uso comercial y modificacion sin restricciones de copyleft, pero conviene verificar las condiciones de los datos de Goodreads empleados durante el entrenamiento, que no se detallan en la model card.
- Para produccion: al no publicarse numeros de latencia ni soporte confirmado en motores como vLLM o llama.cpp, habria que hacer un benchmark propio antes de comprometer un SLA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kanishshandilya/book_recs_reranker
- Modelo base: https://huggingface.co/BAAI/bge-reranker-base
- Primera etapa del mismo autor: https://huggingface.co/kanishshandilya/book_recs_embed
- Paper o blog adicional: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
