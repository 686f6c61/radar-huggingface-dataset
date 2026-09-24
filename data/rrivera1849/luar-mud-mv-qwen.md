# rrivera1849/LUAR-MUD-MV-Qwen

## Resumen

LUAR-MUD-MV-Qwen es un modelo de extraccion de caracteristicas (feature-extraction) orientado a la representacion estilistica de autores. Lo desarrolla rrivera1849 y se apoya en el backbone Qwen3-0.6B (600.774.656 parametros) en lugar del DistilRoBERTa de 82M usado en el LUAR original. Su objetivo es producir embeddings de autoria de modo que dos muestras disjuntas escritas por la misma persona queden proximas en el espacio vectorial, lo que habilita tareas de atribucion y verificacion de autoria.

La innovacion principal respecto a su predecesor, LUAR-MUD, es una cabeza multi-vector: en vez de colapsar un episodio de textos en un unico vector, conserva un vector L2-normalizado por texto y compara dos autores mediante MaxSim (late interaction estilo ColBERT). Tambien ofrece la opcion de un vector unico (la media L2-normalizada de esos vectores), pensado para indices ANN como FAISS, pgvector o Qdrant.

Es relevante ahora porque mejora de forma medible al modelo publicado: en el split de test de MUD eleva el MRR de 0,5706 a 0,6564 manteniendo una licencia permisiva (apache-2.0), y ademas aporta un modo de recuperacion en dos etapas (vector unico para shortlist y multi-vector para reranking) que hace viable su uso a escala de corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone Qwen3-0.6B) con pooling del ultimo token y cabeza multi-vector con late interaction (MaxSim) |
| Parametros totales | 600.774.656 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32 tokens por texto de episodio durante el entrenamiento; maximo del backbone no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (solo se documenta carga en bfloat16; no se publican pesos GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por codigo personalizado) |
| Dimension del embedding | 512 |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3-0.6B y aplica last-token pooling para obtener una representacion de 512 dimensiones por texto. Sobre esa representacion construye una cabeza multi-vector: cada texto de un episodio de autor genera su propio vector L2-normalizado, y la comparacion entre autores se realiza con MaxSim (estilo ColBERT). Un vector unico por autor se obtiene como media L2-normalizada de los vectores por texto. La funcion `similarity` despacha segun el rango de la entrada y devuelve siempre una matriz `[n_queries, n_targets]` donde mayor significa mas similar; el MaxSim es asimetrico (puntua el mejor emparejamiento de cada texto de consulta), y existe un modo `symmetric=True` con media tipo Chamfer de ambas direcciones. El padding se infiere automaticamente, sin necesidad de mascara explicita.

El entrenamiento usa el Million User Dataset (MUD), con 1,07 millones de autores de Reddit. El objetivo es contrastivo supervisado (SupCon) sobre MaxSim a nivel de episodio, con temperatura 0,02 y formulacion asimetrica. Los episodios contienen hasta 16 textos (tamano aleatorio por lote segun una Beta(3,1)), de 32 tokens cada uno, con 2 episodios por autor y paso. El lote contrastivo es de 256 autores por GPU x 7 GPUs = 1792 autores, gestionado con GradCache. El calendario es de 20 epocas, learning rate 2e-5 constante (sin escalado por lote), 100 pasos de warmup y decaimiento coseno.

## Capacidades

- Generacion de embeddings de estilo de autoria a nivel de texto y de episodio (conjunto de textos de un autor).
- Extraccion de caracteristicas en dos modos: `multi` (un vector L2-normalizado por texto, `[B, E, 512]`) y `single` (media L2-normalizada, `[B, 512]`), o ambos en una sola pasada (`both`).
- Calculo de similitud autor-autor mediante MaxSim (multi-vector) o coseno (vector unico) a traves de `model.similarity(queries, targets)`.
- Recuperacion de vecinos mas proximos con `model.retrieve(queries, targets, k=10)`, que devuelve puntuaciones e indices ordenados.
- Soporte de lotes con episodios de distinto numero de textos mediante padding inferido automaticamente.
- Recuperacion en dos etapas: vector unico para un indice ANN y multi-vector para reranking.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes, y no tiene modos de razonamiento o vision.

## Casos de uso

- Atribucion de autoria forense: dados varios textos de un autor desconocido y un conjunto de candidatos, el modelo genera embeddings por texto y usa MaxSim para ordenar candidatos por similitud estilistica, aprovechando su MRR de 0,6564 en MUD.
- Verificacion de autoria (misma persona / distinta persona): comparar dos episodios con `similarity` para determinar si comparten estilo, util en peritajes o en verificacion de identidad textual.
- Deteccion de cuentas multiples o suplantacion: agrupar episodios de Reddit u otros foros para identificar cuentas que probablemente pertenecen al mismo usuario, con el modo `single` como prefiltro y el multi-vector como reordenador.
- Busqueda estilistica a escala de corpus: indexar el vector unico de cada autor en FAISS, pgvector o Qdrant para recoger candidatos y reranquear con el vector multi-vector, reduciendo el coste cuadratico del late interaction.
- Analisis de plagio y reutilizacion de estilo: comparar un texto sospechoso contra un corpus de autores conocidos para localizar coincidencias de estilo mas alla del contenido literal.
- Investigacion en estilometria y ciencias sociales: representar autores de forma vectorial para estudiar agrupaciones, variacion estilistica o cohortes tematicas en grandes volumenes de texto.
- Anonimizacion y estudios de privacidad: usar los embeddings para medir hasta que punto un texto revela la identidad de su autor y evaluar tecnicas de ofuscacion estilistica.

## Benchmarks y rendimiento

Resultados en el split de test de MUD (25.000 consultas contra 111.396 objetivos, usando 32 tokens por texto):

| Modelo | Readout | MRR | R@1 | R@8 | R@64 |
|---|---|---|---|---|---|
| LUAR-MUD-MV-Qwen (este modelo) | multi-vector, MaxSim | 0,6564 | 0,5792 | 0,7854 | 0,9068 |
| LUAR-MUD-MV-Qwen (este modelo) | vector unico, coseno | 0,6283 | 0,5481 | 0,7622 | 0,8974 |
| LUAR-MUD (publicado) | vector unico, coseno | 0,5706 | 0,4904 | no disponible | no disponible |

El vector unico conserva aproximadamente el 96% del MRR del modo multi-vector sobre los mismos episodios y, por si solo, sigue superando al LUAR-MUD publicado.

## Requisitos de hardware

- VRAM estimada (derivada del recuento de parametros, 600.774.656; no publicada por el autor): ~2,4 GB en fp32, ~1,2 GB en bfloat16/fp16, ~0,6 GB en int8 y ~0,3 GB en int4, sin contar activaciones ni overhead del runtime.
- El repositorio pesa 2,4 GB, consistente con pesos en fp32.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM, como RTX 3060, RTX 4070 o RTX 4090.
- GPU de centro de datos recomendadas para despliegue a gran escala: A100, H100, L40S, o cualquier GPU con soporte de bfloat16.
- Despliegue mediante transformers con `trust_remote_code=True`; se documenta la carga en bfloat16 (`dtype=torch.bfloat16`).
- vLLM, TGI, llama.cpp u Ollama: soporte no documentado en la informacion disponible (no se publican pesos GGUF y el modelo usa codigo personalizado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Readout | MRR (MUD test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUAR-MUD-MV-Qwen | 600.774.656 | multi-vector (MaxSim) y vector unico (coseno) | 0,6564 / 0,6283 | apache-2.0 | HuggingFace, requiere `trust_remote_code` |
| LUAR-MUD | ~82M (DistilRoBERTa) | vector unico (coseno) | 0,5706 | no disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3-0.6B | ~0,6B | backbone sin cabeza de autoria | no aplica | no disponible en la informacion proporcionada | HuggingFace (modelo base) |

La comparacion directa disponible se limita al predecesor LUAR-MUD, que este modelo supera en MRR (+0,0858 en modo multi-vector y +0,0577 en modo vector unico) y en cobertura R@1 (0,5792 frente a 0,4904). Se desconoce el rendimiento frente a otros sistemas de atribucion de autoria no presentes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado.
- Entrenado exclusivamente sobre MUD (1,07M autores de Reddit), por lo que puede arrastrar sesgos de dominio, registro y tematica propios de esa plataforma, con posible degradacion fuera de ese tipo de texto.
- El objetivo es de autoria, no generativo: no sirve para generar texto ni para tareas de chat, razonamiento o codigo.
- Riesgo de falsos positivos en atribucion: textos muy cortos o genericos pueden producir similitudes altas entre autores distintos; conviene validar umbrales sobre datos propios.
- El MaxSim es asimetrico por diseno de entrenamiento (`similarity(a, b) != similarity(b, a).T`); hay que usar `symmetric=True` si se requiere simetria.
- La comparacion multi-vector es cuadratica en el numero de textos, lo que encarece su uso a escala de corpus; se recomienda la estrategia de dos etapas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar ese codigo antes de desplegarlo en produccion.
- La licencia apache-2.0 permite uso comercial, pero la base de datos de entrenamiento (Reddit) y las implicaciones de privacidad de la atribucion de autoria deben evaluarse caso por caso.
- El modelo no declara cuantizaciones oficiales ni pesos GGUF, lo que limita las opciones de despliegue en entornos de bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rrivera1849/LUAR-MUD-MV-Qwen
- Modelo predecesor LUAR-MUD: https://huggingface.co/rrivera1849/LUAR-MUD
- Coleccion LUAR: https://huggingface.co/collections/rrivera1849/luar
- Paper LUAR (EMNLP 2021): https://aclanthology.org/2021.emnlp-main.70.pdf
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- GitHub del autor: https://github.com/rrivera1849
