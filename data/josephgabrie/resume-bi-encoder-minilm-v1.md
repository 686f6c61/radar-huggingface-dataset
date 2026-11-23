# JosephGabrie/resume-bi-encoder-minilm-v1

## Resumen

JosephGabrie/resume-bi-encoder-minilm-v1 es un modelo de embeddings de frases (sentence-transformers) afinado a partir de sentence-transformers/all-MiniLM-L6-v2, un transformer BERT de 22,7 millones de parametros. Su proposito es generar representaciones densas de texto para similitud semantica y extraccion de caracteristicas, con un enfoque declarado en el dominio de curriculos y descripciones de puestos, a juzgar por el ejemplo de la model card y el nombre del repositorio.

El modelo se entreno con la funcion de perdida BatchAllTripletLoss sobre un conjunto de 1.987 ejemplos, segun los metadatos de la model card. Al derivar de all-MiniLM-L6-v2, hereda la arquitectura BERT ligera y la tokenizacion del modelo base, pero no se documentan detalles sobre la composicion del dataset ni sobre el proceso de minado de tripletas.

Es relevante para quienes necesitan un encoder compacto y rapido para busqueda semantica o emparejamiento de curriculos con ofertas de empleo, aunque la ausencia de benchmarks publicados, de licencia explicita y de idiomas declarados limita su uso en produccion sin una evaluacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder denso, all-MiniLM-L6-v2) |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base all-MiniLM-L6-v2 admite 256 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar de sentence-transformers) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT, concretamente un fine-tuning de sentence-transformers/all-MiniLM-L6-v2, que emplea 6 capas, atencion multi-cabeza y pooling medio sobre las representaciones de tokens para producir un vector de 384 dimensiones. El repositorio ocupa 0,1 GB y los pesos se distribuyen en safetensors.

El entrenamiento se realizo con la perdida BatchAllTripletLoss sobre 1.987 ejemplos, segun los metadatos declarados. No se especifican el numero de tokens, la composicion del dataset, si hubo minado de tripletas duras ni si se aplicaron tecnicas de aumento de datos. Tampoco se documenta el uso de RLHF o DPO, algo poco habitual en modelos de embeddings. La innovacion tecnica se limita a la adaptacion del encoder ligero al dominio de curriculos.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y busqueda densa.
- Extraccion de caracteristicas (feature-extraction) a partir de texto.
- Emparejamiento semantico entre curriculos y descripciones de puestos, segun el ejemplo de la model card.
- Compatible con la pipeline sentence-similarity de sentence-transformers.
- Compatible con Text Embeddings Inference (TEI) y con endpoints de Hugging Face, segun los tags del repositorio.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica de curriculos: indexar los embeddings de miles de CV y recuperar los mas similares a una descripcion de puesto mediante similitud coseno, aprovechando el bajo coste computacional del encoder de 22,7 M de parametros.
- Ranking de candidatos: calcular la similitud entre la vacante y cada curriculo para preordenar candidatos antes de una revision humana, con latencia baja en CPU.
- Deduplicacion de curriculos: detectar CV duplicados o casi duplicados comparando embeddings con un umbral de similitud, util en bases de datos de reclutamiento.
- Clasificacion de ofertas de empleo: usar los embeddings como entrada a un clasificador ligero para categorizar ofertas por sector o seniority.
- Motor de recomendacion de empleo: emparejar perfiles de candidatos con ofertas mediante busqueda vectorial en una base de datos como FAISS o pgvector.
- Filtrado de spam o curriculos irrelevantes: puntuar la similitud entre el texto recibido y el dominio de curriculos para descartar envios no relacionados antes del procesamiento posterior.
- Prototipado rapido en CPU: al ser un modelo de 0,1 GB, permite experimentar en entornos sin GPU para validar la viabilidad de un sistema de matching antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 M de parametros, aproximadamente 91 MB de pesos); en fp16 alrededor de 45 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier RTX, GTX o incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable con throughput alto gracias al reducido tamano del modelo.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, integracion en pipelines con FAISS, pgvector o Qdrant.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JosephGabrie/resume-bi-encoder-minilm-v1 | 22,7 M | no disponible | no disponible | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Apache 2.0 | Hugging Face |
| sentence-transformers/all-MiniLM-L12-v2 | 33,4 M | 256 tokens | Apache 2.0 | Hugging Face |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | MIT | Hugging Face |

La comparativa se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados para el modelo evaluado. El modelo base all-MiniLM-L6-v2 ofrece licencia Apache 2.0 y contexto de 256 tokens, datos que el fine-tuning no modifica.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorizacion explicita y requiere contactar con el autor.
- No se declaran idiomas soportados; el modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano es incierto.
- No hay benchmarks publicados, por lo que no se puede verificar que el fine-tuning mejore al modelo base en la tarea de matching de curriculos.
- El dataset de entrenamiento es muy pequeno (1.987 ejemplos), lo que aumenta el riesgo de sobreajuste al dominio y de degradacion fuera de el.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de similitudes espurias en textos fuera del dominio de curriculos.
- El contexto maximo no esta documentado; si se hereda del modelo base, textos largos como curriculos extensos se truncan a 256 tokens.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad.
- No se documenta el proceso de minado de tripletas ni la calidad del dataset, lo que dificulta reproducir o auditar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JosephGabrie/resume-bi-encoder-minilm-v1
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de triplet loss (arXiv:1703.07737): https://arxiv.org/abs/1703.07737
- Documentacion de sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
