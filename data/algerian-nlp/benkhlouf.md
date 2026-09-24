# algerian-nlp/BENKHLOUF

## Resumen

BENKHLOUF-base (بن خلوف) es un modelo de embeddings de frases de 278 millones de parámetros desarrollado por el colectivo algerian-nlp, especializado en dariya argelina (`arq`) escrita tanto en grafía árabe como en arabizi (transliteración latina con dígitos fonéticos como 3, 7 y 9) y en code-switching con francés. Se trata de un encoder bidireccional basado en la arquitectura XLM-RoBERTa, publicado bajo licencia Apache 2.0 y empaquetado con la librería sentence-transformers. El nombre rinde homenaje a Sidi Lakhdar Ben Khlouf, poeta argelino del siglo XVI considerado el padre de la poesía popular malhun.

El problema que resuelve es la ausencia de modelos de recuperación semántica densa (dense retrieval) fiables para una variedad dialectal de bajos recursos como la dariya argelina. Los modelos multilingües genéricos suelen producir similitudes infladas (en torno a 0,45-0,50) entre frases coloquiales no relacionadas, lo que degrada la precisión en búsqueda y clustering. BENKHLOUF-base se entrena con Matryoshka Representation Learning (MRL) sobre pérdida Multiple Negatives Ranking (MNRL) con 123.602 pares de frases coloquiales argelinas descontaminadas.

Es relevante ahora porque combina dos propiedades poco habituales en modelos de bajos recursos: invariancia entre grafías (arabizi frente a árabe) con 0,708 de similitud cruzada, y compresión Matryoshka que permite truncar los embeddings de 768 a 64 dimensiones reteniendo más del 95 % de la fidelidad de recuperación, lo que reduce 12 veces el uso de memoria en bases de datos vectoriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (XLM-RoBERTa base) |
| Parametros totales | 278.075.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en float32; admite cuantizacion estandar via ONNX/optimum aunque no declarada por el autor) |
| Idiomas soportados | arq (dariya argelina) en grafia arabe, arabizi y code-switching con frances |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carga nativa con sentence-transformers y torch) |
| Dimension de embedding | 768 (Matryoshka truncable a 64) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

BENKHLOUF-base es un encoder transformer bidireccional derivado de XLM-RoBERTa base, adaptado a la tarea de similitud semantica mediante sentence-transformers. No es un modelo generativo: produce vectores densos de 768 dimensiones (con truncamiento Matryoshka valido a 64). El entrenamiento emplea Multiple Negatives Ranking Loss (MNRL) sobre 123.602 pares de frases coloquiales argelinas previamente descontaminadas, con un total de 2.898 pasos globales (batch size 64) a lo largo de 3 epocas.

La innovacion principal es el uso de Matryoshka Representation Learning, que concentra la energia representacional en las primeras dimensiones del vector. Segun la model card, esto permite que el corte a 64 dimensiones alcance 0,897 de similitud coseno frente a 0,853 a 768 dimensiones, es decir, el vector comprimido rinde mejor en la metrica declarada que el completo. La perdida de entrenamiento cae de 14,9100 (paso 50) a 0,0125 (paso 2.898), mientras que la perdida de validacion se estabiliza en 2,0330. Los autores reportan isotropia del espacio de embeddings (coseno medio de 0,013 entre representaciones), lo que indica ausencia de colapso de representaciones.

No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de alineacion adicionales; tampoco se detalla la composicion exacta del dataset mas alla del numero de pares y su caracter coloquial. La evaluacion se realizo con semilla 42 sobre 1.000 pares retenidos (2.000 frases) en una unica pasada determinista.

## Capacidades

- Generacion de embeddings de frases para similitud semantica (sentence-similarity) y extraccion de caracteristicas (feature-extraction).
- Recuperacion densa (dense retrieval) y busqueda semantica sobre texto coloquial argelino.
- Invariancia entre grafias: alinea arabizi (con digitos foneticos 3, 7, 9) y grafia arabe sin necesidad de transliteracion externa, con 0,708 de similitud cruzada.
- Manejo de code-switching con frances dentro de frases dariya.
- Embeddings comprimibles via Matryoshka de 768 a 64 dimensiones con perdida de fidelidad inferior al 5 % segun el autor.
- No soporta tool calling ni function calling (es un encoder, no un modelo de instrucciones).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada a la dariya argelina; no cubre otras variedades del arabe ni otros idiomas.

## Casos de uso

- Busqueda en comercio electronico: indexar descripciones y titulos de productos en dariya (arabizi o arabe) y recuperar articulos relevantes ante consultas coloquiales, usando embeddings truncados a 64 dimensiones para reducir 12 veces el coste de almacenamiento e indexacion en la base vectorial.
- Enrutado de tickets de soporte al cliente: clasificar y agrupar consultas entrantes en dariya hacia el equipo adecuado mediante similitud coseno contra un catalogo de intenciones previamente etiquetadas.
- Emparejamiento de FAQ: vincular preguntas de usuarios con entradas de una base de conocimiento, aprovechando la ortogonalidad de negativos (0,001) para evitar falsos positivos entre temas no relacionados.
- Deduplicacion de texto coloquial: detectar publicaciones o comentarios duplicados en redes sociales argelinas donde conviven grafia arabe y arabizi, gracias a la invariancia entre scripts.
- Recuperacion aumentada por generacion (RAG): actuar como recuperador sobre corpus en dariya para alimentar a un LLM generativo, cubriendo un hueco donde los modelos multilingues genericos rinden mal.
- Normalizacion de corpus dialectales: generar embeddings para clustering y analisis exploratorio de grandes volumenes de texto coloquial argelino en investigacion linguistica.
- Moderacion asistida por similitud: agrupar mensajes potencialmente similares para revision humana, siempre con supervision, dado que el modelo no ha sido evaluado para toxicidad ni sesgo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 1.000 pares de validacion de dariya argelina (2.000 frases), tras 3 epocas completas (2.898 pasos globales, batch size 64). Los valores `verified: false` indican que no estan verificados de forma independiente.

| Dimension de evaluacion | Tamano de representacion | Valor medido | Objetivo declarado |
|---|---|---|---|
| Similitud coseno de pares positivos | 768 | 0,853 | > 0,800 |
| Similitud coseno Matryoshka truncado | 64 | 0,897 | > 0,800 |
| Transferencia cruzada arabizi a arabe | 768 | 0,708 | > 0,650 |
| Similitud coseno de pares negativos | 768 | 0,001 | < 0,050 |
| Margen de separacion contrastivo | 768 | +0,852 | > +0,750 |
| Isotropia (coseno medio) | 768 | 0,013 | < 0,100 |

Trayectoria de entrenamiento:

| Checkpoint | Paso global | Perdida de entrenamiento | Perdida de validacion | Coseno medio (isotropia) |
|---|---|---|---|---|
| Inicial (paso 50) | 50 | 14,9100 | no disponible | no disponible |
| Epoca 1 | 966 | 0,0639 | 2,1770 | 0,0261 |
| Epoca 2 | 1932 | 0,0226 | 2,0640 | 0,0168 |
| Epoca 3 (final) | 2898 | 0,0125 | 2,0330 | 0,0160 |

El autor senala que suites de referencia norteafricanas como DziriEval y MADAR estan orientadas a clasificacion, no a recuperacion o STS, y que no existen benchmarks estandarizados de retrieval para dariya argelina coloquial en ambas grafias. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,1 GB solo para pesos (278 M de parametros); con activaciones de batch moderado, del orden de 2-3 GB en total.
- En float16: aproximadamente 560 MB de pesos; en int8: aproximadamente 280 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4). Para lotes grandes en produccion, A10G, L40S, A100 o H100 ofrecen mayor throughput.
- Cabe sin dificultad en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas, e incluso en CPU para inferencia por lotes de tamano pequeno o medio.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI, etiquetado como endpoints_compatible), Hugging Face Inference Endpoints, y exportacion a ONNX u OpenVINO para optimizacion. No se documentan ficheros GGUF para llama.cpp, y al no ser generativo no aplican Ollama ni vLLM en su caso de uso tipico.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un encoder de 278 M de parametros procesa tipicamente cientos o miles de frases por segundo en una GPU moderna con lotes de 64-256, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Idioma objetivo | Licencia | Rendimiento en dariya |
|---|---|---|---|---|---|---|
| BENKHLOUF-base | 278 M | 768 (Matryoshka a 64) | no disponible | Dariya argelina (arq) | Apache 2.0 | 0,853 coseno positivo, 0,708 transferencia cruzada |
| intfloat/multilingual-e5-base | 278 M | 768 | 512 tokens | Multilingue (100 idiomas) | MIT | no disponible para dariya |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 768 | 128 tokens | Multilingue (50 idiomas) | Apache 2.0 | no disponible para dariya |
| FacebookAI/xlm-roberta-base | 278 M | 768 | 512 tokens | Multilingue (100 idiomas) | MIT | no disponible; no afinado para similitud |

Los tres modelos alternativos comparten tamano (278 M) y dimension de embedding (768), pero estan entrenados para cobertura multilingue amplia y no para dariya argelina especifica. No se dispone de evaluaciones publicas de estos modelos sobre el conjunto de validacion empleado por BENKHLOUF, por lo que la comparacion directa de rendimiento en este dominio no esta disponible.

## Limitaciones y advertencias

- No es un modelo generativo: es un encoder bidireccional y no puede producir texto, traducir ni responder preguntas de forma directa.
- No sirve para traduccion automatica.
- Cobertura limitada a dariya argelina: no debe usarse con otras variedades del arabe (marroqui, tunecino, egipcio, arabe estandar moderno) ni con otros idiomas.
- No ha sido evaluado para sesgo, toxicidad ni factualidad; los pares de entrenamiento contienen expresiones informales de redes sociales y vernacular coloquial.
- No debe usarse para decisiones automatizadas sobre personas.
- Riesgo de alucinacion de similitud: como todo modelo de embeddings, puede asignar alta similitud a frases superficialmente parecidas pero semanticamente distintas, especialmente fuera del dominio de entrenamiento.
- Los benchmarks declarados no estan verificados de forma independiente (`verified: false`).
- Evaluacion realizada con una unica semilla (42) y una unica pasada; la varianza entre ejecuciones no esta documentada.
- No existe benchmark estandarizado de retrieval o STS para dariya argelina, lo que limita la comparabilidad externa de los resultados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre el cumplimiento normativo en escenarios sensibles.
- No se documentan tipos de cuantizacion oficiales ni ficheros GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algerian-nlp/BENKHLOUF
- Organizacion algerian-nlp en HuggingFace: https://huggingface.co/algerian-nlp
- Documentacion de sentence-transformers: https://www.sbert.net/
- Paper de Matryoshka Representation Learning: https://arxiv.org/abs/2205.13147
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- Paper de Multiple Negatives Ranking Loss (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
- Suite DziriEval: no disponible
- Suite MADAR: no disponible
