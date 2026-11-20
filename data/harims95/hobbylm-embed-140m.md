# harims95/hobbylm-embed-140m

## Resumen

hobbylm-embed-140m es un modelo de embeddings de texto desarrollado por harims95 (equipo formado por Hariharan y Prabhu Rajhan) y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo denso de representación de frases construido sobre una arquitectura de mezcla de expertos dispersa (sparse mixture-of-experts), con 140 millones de parámetros totales y 36 millones activos por token. Genera embeddings de 512 dimensiones normalizados en L2, pensados para similitud coseno.

El modelo resuelve tareas de recuperación de información, similitud semántica, clasificación, clustering y reranking, y se distribuye con la librería sentence-transformers. Su ventana de contexto es de 512 tokens, utiliza tokenizador GPT-2 BPE y requiere cargarse con `trust_remote_code=True` debido a código personalizado. Está entrenado únicamente en inglés.

Su relevancia actual reside en la combinación poco habitual de un encoder de embeddings con una arquitectura MoE: al activar solo 36M de los 140M de parámetros, busca un equilibrio entre calidad de representación y coste computacional en inferencia. No obstante, el modelo es muy reciente (publicado en noviembre de 2026), no tiene descargas ni likes, y no se han publicado resultados de benchmarks ni detalles del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos dispersa (sparse MoE) sobre encoder tipo transformer |
| Parametros totales | 139.983.200 (140M) |
| Parametros activos | 36M |
| Longitud de contexto | 512 tokens (por defecto; se anade token de fin de texto automaticamente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con codigo personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La model card describe el modelo como un encoder de embeddings denso construido sobre una arquitectura de mezcla de expertos dispersa, con 140M de parametros totales y 36M activos. La salida es un vector de 512 dimensiones, normalizado en L2, y el pooling es de tipo mean-pooled (segun el ejemplo con Transformers, `pooler_output` devuelve la representacion media normalizada). El tokenizador es GPT-2 BPE y se anade automaticamente un token de fin de texto. El modelo incluye codigo personalizado, por lo que la carga requiere `trust_remote_code=True`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se detalla la configuracion interna de la MoE (numero de expertos, criterio de enrutamiento ni top-k). Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de embeddings de texto de 512 dimensiones, normalizados en L2 para similitud coseno.
- Recuperacion de informacion (retrieval) con prompts especificos: `query: ` para consultas y `passage: ` para documentos.
- Similitud semantica entre frases, clasificacion de pares, clustering y reranking sin prompt.
- Extraccion de caracteristicas (`feature-extraction`) mediante la API de Transformers.
- Integracion nativa con sentence-transformers (metodos `encode` y `similarity`).
- Soporte de procesamiento por lotes con padding y truncacion a 512 tokens.
- Capacidades multilingues: limitadas al ingles.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de hasta 512 tokens con el prompt `passage: ` y consultar con `query: ` para recuperar los pasajes mas relevantes por similitud coseno.
- Reranking de resultados de un buscador: usar el modelo sin prompt para puntuar pares consulta-documento y reordenar los candidatos devueltos por un retriever de primera fase.
- Deduplicacion de registros: generar embeddings de entradas de bases de datos y agrupar por similitud para detectar duplicados o near-duplicates en catalogos de productos o articulos.
- Clustering de tickets de soporte: agrupar incidencias por tematica usando los embeddings sin prompt, para enrutar automaticamente a los equipos correspondientes.
- Clasificacion de texto por similitud: construir prototipos de cada categoria y asignar etiquetas comparando la similitud coseno del embedding de entrada con cada prototipo, sin necesidad de entrenar un clasificador.
- Filtrado de contenido en pipelines de moderacion: comparar embeddings de mensajes contra un conjunto de ejemplos etiquetados para marcar contenido proximo a categorias sensibles.
- Sistemas de recomendacion basados en contenido: representar descripciones de articulos y calcular similitud para sugerir items relacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140M de parametros en precision FP32, el modelo ocupa aproximadamente 0,56 GB; en FP16/BF16, unos 0,28 GB. El repo completo pesa 0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere hardware de datacenter. Una RTX 3060, RTX 4060 o superior cubre el modelo con holgura.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers y Transformers de forma nativa (con `trust_remote_code=True`). No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI; al tratarse de un encoder de embeddings y no de un modelo generativo, las opciones habituales de serving de LLM no aplican directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada. La activacion de solo 36M de parametros por token sugiere un coste de computo reducido, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Idiomas | Licencia |
|---|---|---|---|---|---|
| hobbylm-embed-140m | 140M totales / 36M activos (MoE) | 512 tokens | 512 | Ingles | Apache-2.0 |
| all-MiniLM-L6-v2 | 22M | 256 tokens | 384 | Ingles | Apache-2.0 |
| all-mpnet-base-v2 | 109M | 384 tokens | 768 | Ingles | Apache-2.0 |
| bge-small-en-v1.5 | 33M | 512 tokens | 384 | Ingles | MIT |

La comparativa se limita a parametros, contexto, dimension, idiomas y licencia, ya que no hay datos de rendimiento publicados para hobbylm-embed-140m. Los modelos alternativos citados son referencias habituales de la categoria de embeddings en ingles, pero no se dispone de una evaluacion conjunta que permita comparar calidad.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Ventana de contexto maxima de 512 tokens; textos mas largos se truncan, lo que puede degradar la representacion de documentos extensos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor en el entorno de inferencia; conviene auditar el codigo antes de usarlo en produccion.
- No se han publicado benchmarks ni detalles del dataset de entrenamiento, por lo que no es posible evaluar sesgos, calidad de recuperacion ni robustez frente a modelos establecidos.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si riesgo de representaciones poco fiables en dominios alejados de los datos de entrenamiento, cuyo contenido se desconoce.
- Modelo muy reciente y sin adopcion (0 descargas, 0 likes en el momento de la consulta); no hay evidencia de uso en produccion ni soporte de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de documentacion sobre el origen de los datos de entrenamiento impide verificar el cumplimiento de derechos de autor o de condiciones de uso de los datasets.
- No se documenta la configuracion de la MoE (numero de expertos, enrutamiento), lo que dificulta el analisis de comportamiento y la depuracion.

## Enlaces

- Hugging Face: https://huggingface.co/harims95/hobbylm-embed-140m
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
