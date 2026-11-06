# Eranex-Tech/eranex-embedding-v1.0-base

## Resumen

Eranex-embedding-v1.0-base es un modelo de embeddings de frases (sentence embeddings) publicado por Eranex-Tech en Hugging Face bajo el pipeline de `feature-extraction`. A diferencia de la mayoria de modelos de embeddings del ecosistema, que se basan en arquitecturas transformer, este modelo emplea una arquitectura Mamba (state-space model), segun indican sus etiquetas. Esta orientado a la generacion de representaciones vectoriales densas para tareas de similitud semantica, recuperacion de informacion y clustering, con soporte declarado para turco, ingles, espanol y aleman.

El modelo se distribuye con pesos en formato safetensors y requiere `custom_code`, lo que implica que su cargamento no es directo con `AutoModel` estandar de transformers sin confiar en codigo remoto. Su licencia declarada en las etiquetas es Apache 2.0, aunque el campo de licencia del repositorio aparece como no disponible. El numero de descargas (55) y la ausencia de likes sugieren un modelo reciente y de baja adopcion, sin documentacion publica extensa.

La relevancia de este modelo radica en la aplicacion de arquitecturas de espacio de estados al dominio de los embeddings, un area dominada casi por completo por variantes de BERT y modelos tipo decoder adaptados. Sin embargo, la informacion publica disponible es muy limitada: no hay model card detallada, no se especifican dimensiones de embedding, numero de parametros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state-space model) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr), ingles (en), espanol (es), aleman (de) |
| Licencia | Apache 2.0 (segun etiquetas); campo de licencia del repo: no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Tipo de tarea | feature-extraction / sentence-embeddings |
| Requiere codigo remoto | si (`custom_code`) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura Mamba, un modelo de espacio de estados selectivo (selective state-space model) que sustituye la atencion cuadratica de los transformers por una recurrencia lineal con parametros dependientes de la entrada. Este diseno permite, en teoria, un coste de computo lineal con la longitud de secuencia y una gestion eficiente de secuencias largas, lo que resulta atractivo para embeddings de documentos extensos. No obstante, no se dispone de informacion publica sobre el numero de capas, la dimension oculta, el tamano del estado ni la dimension final del vector de embedding.

En cuanto al entrenamiento, las etiquetas del repositorio indican el uso de los datasets `allenai/c4`, `Helsinki-NLP/opus-100`, `sentence-transformers/stsb`, `emrecan/stsb-mt-turkish` y `mteb/stsb_multi_mt`. Esto sugiere un entrenamiento en dos fases: un preentrenamiento o ajuste sobre corpus multilingues generales (C4 y OPUS-100) y un ajuste contrastivo supervisado sobre datos de similitud semantica (STSb en varias lenguas, incluido turco). No se especifica el numero de tokens, la composicion exacta del dataset, ni si se emplearon tecnicas como Multiple Negatives Ranking Loss, DPO o RLHF. Tampoco hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal hibrida.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y busqueda densa.
- Soporte multilingue declarado para turco, ingles, espanol y aleman.
- Extraccion de caracteristicas (`feature-extraction`) a partir de texto.
- Adecuado para tareas de recuperacion (retrieval) y ranking semantico.
- Potencial manejo de secuencias largas gracias a la arquitectura de espacio de estados (sin datos confirmados de longitud de contexto).
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado modo de razonamiento (thinking mode), vision ni audio.
- No se ha documentado soporte de instrucciones (no es un modelo generativo).

## Casos de uso

- Busqueda semantica multilingue: el modelo puede indexar documentos en turco, ingles, espanol y aleman y recuperar pasajes relevantes mediante similitud coseno, aprovechando su entrenamiento sobre OPUS-100 y STSb multilingue.
- Deduplicacion de contenidos: generar embeddings de articulos o registros y agrupar por similitud para eliminar duplicados en pipelines de datos, usando clustering sobre los vectores.
- Sistemas de recomendacion basados en contenido: representar items textuales (titulos, descripciones) y calcular afinidad con el perfil del usuario mediante vecinos mas cercanos.
- Clasificacion de textos por prototipos: calcular el embedding medio de cada clase y asignar etiquetas por proximidad, util en entornos con pocos datos etiquetados.
- Moderacion y filtrado tematico: comparar embeddings de mensajes con vectores de referencia de categorias sensibles para priorizar revision humana.
- RAG ligero en produccion: usar el modelo como codificador de consultas y documentos en un sistema de recuperacion aumentada, con la ventaja teorica de coste lineal en secuencias largas.
- Analisis de similitud en soporte al cliente: agrupar tickets por tematica para enrutamiento automatico, apoyandose en la representacion densa de descripciones breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo de embeddings de tipo base, es plausible que quepa en GPU consumer, pero no hay datos que lo verifiquen.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); no se ha confirmado soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Eranex-embedding-v1.0-base | Mamba (SSM) | no disponible | no disponible | tr, en, es, de | Apache 2.0 (etiquetas) |
| BGE-M3 (BAAI) | Transformer (XLM-R) | ~568M | 8192 | multilingue (100+) | MIT |
| multilingual-e5-base | Transformer | ~278M | 512 | multilingue (100+) | MIT |
| paraphrase-multilingual-MiniLM-L12-v2 | Transformer | ~118M | 512 | multilingue (50+) | Apache 2.0 |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento de Eranex-embedding-v1.0-base que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan dimension de embedding, contexto maximo ni proceso de entrenamiento completo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- El campo de licencia del repositorio aparece como no disponible; aunque las etiquetas indican Apache 2.0, se recomienda verificar los terminos antes de un uso comercial.
- Cobertura linguistica limitada a cuatro idiomas declarados; el rendimiento fuera de ellos es desconocido.
- Riesgo de sesgos inheridos de los corpus de entrenamiento (C4 y OPUS-100), sin documentacion sobre mitigacion.
- No es un modelo generativo: no soporta instrucciones, tool calling ni agentes.
- Adopcion muy baja (55 descargas, 0 likes) y sin benchmarks publicos; no hay evidencia externa de calidad.
- Posible riesgo de alucinacion no aplica en el sentido generativo, pero si de representaciones poco fiables en dominios no cubiertos por el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Eranex-Tech/eranex-embedding-v1.0-base
- Dataset C4: https://huggingface.co/datasets/allenai/c4
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Dataset STSb: https://huggingface.co/datasets/sentence-transformers/stsb
- Dataset STSb turco: https://huggingface.co/datasets/emrecan/stsb-mt-turkish
- Dataset STSb multi-mt: https://huggingface.co/datasets/mteb/stsb_multi_mt
