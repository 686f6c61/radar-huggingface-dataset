# mradermacher/octen-law-8b-v1-GGUF

## Resumen

octen-law-8b-v1-GGUF es la distribucion en formato GGUF del modelo litillabs/octen-law-8b-v1, un modelo de embeddings especializado en recuperacion de informacion juridica (legal retrieval) construido sobre una arquitectura transformer de aproximadamente 7.570 millones de parametros. Lo publica mradermacher, un conocido cuantizador de la comunidad que convierte modelos de Hugging Face a formato GGUF para su uso con llama.cpp y herramientas derivadas. No es un modelo generativo al uso: esta disenado para producir representaciones vectoriales (embeddings) destinadas a busqueda semantica y sistemas RAG en el dominio legal.

El modelo base fue entrenado por litillabs usando pares de recuperacion juridica de los datasets Hanno-Labs/legal-retrieval-pairs-v2 y Hanno-Labs/legal-retrieval-pairs-dewiki, y declara soporte para ingles, aleman y chino. Su relevancia actual radica en que el dominio juridico exige recuperacion precisa sobre terminologia muy especifica, y un modelo de embeddings afinado para ese dominio supera en ese nicho a los embeddings generalistas, aunque su tamano de 8B lo hace considerablemente mas pesado que los encoders de recuperacion habituales (tipicamente 100M-600M de parametros).

Esta ficha describe la version cuantizada GGUF, que ofrece 12 variantes de cuantizacion desde Q2_K (3,2 GB) hasta f16 (15,2 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 6-8 GB de VRAM hasta servidores con aceleradores profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de embeddings; etiquetado como sentence-transformers) |
| Parametros totales | 7.567.295.488 (7,57B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en), aleman (de), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su etiquetado como sentence-transformers, lo que implica que se trata de un transformer encoder adaptado para producir embeddings de frase o de pasaje. El modelo se ha afinado para la tarea de recuperacion (retrieval) en el dominio legal, segun indican las etiquetas `retrieval`, `legal` y `mteb`, y los datasets empleados: Hanno-Labs/legal-retrieval-pairs-v2 (pares de recuperacion juridica) y Hanno-Labs/legal-retrieval-pairs-dewiki (pares derivados de Wikipedia en aleman). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; para un modelo de embeddings, estos metodos no son habituales, ya que el entrenamiento tipico se basa en objetivos contrastivos sobre pares positivos y negativos.

La innovacion destacable de esta publicacion no esta en el modelo en si, sino en la distribucion: mradermacher ha generado cuantizaciones estaticas (sin imatrix) que reducen el peso desde 15,2 GB en f16 hasta 3,2 GB en Q2_K, manteniendo la compatibilidad con llama.cpp. El autor advierte de que las cuantizaciones ponderadas con imatrix no estan disponibles por el momento. La cuantizacion Q4_K_M (4,8 GB) se marca como "fast, recommended" y Q8_0 (8,1 GB) como "fast, best quality".

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de documentos.
- Recuperacion (retrieval) especializada en dominio juridico, afinada sobre pares de consulta-documento legales.
- Soporte multilingue limitado a tres idiomas: ingles, aleman y chino.
- Compatibilidad con el ecosistema sentence-transformers y con el pipeline de transformers.
- Uso como componente de sistemas RAG (retrieval-augmented generation) para alimentar a un LLM generativo con fragmentos legales relevantes.
- Evaluacion en el marco MTEB (Massive Text Embedding Benchmark), segun la etiqueta `mteb`.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por si mismo; su funcion es exclusivamente representacional.

## Casos de uso

- Busqueda semantica en bases de jurisprudencia: indexar sentencias, doctrina y normativa como embeddings y recuperar los pasajes mas relevantes para una consulta en lenguaje natural, aprovechando el afinamiento sobre pares juridicos.
- Sistemas RAG para asistentes legales: usar el modelo como retriever que alimenta a un LLM generativo con fragmentos de contratos o legislacion, reduciendo alucinaciones al fundamentar las respuestas en documentos recuperados.
- Revision de contratos y clausulas: comparar clausulas de un contrato nuevo contra una base de clausulas historicas mediante similitud de embeddings para detectar desviaciones o clausulas de riesgo.
- Busqueda bilingue aleman-ingles en despachos: el soporte nativo de ambos idiomas permite recuperar documentos alemanes a partir de consultas en ingles (o viceversa) dentro de un mismo indice vectorial.
- Clasificacion y agrupacion de documentos legales: usar los embeddings como caracteristicas para clustering de expedientes o clasificacion por area de practica y materia.
- Despliegue en infraestructura modesta: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q3_K_M (4,0 GB), se puede ejecutar en estaciones de trabajo con GPU de consumo para prototipos y entornos de desarrollo.
- Filtrado previo en pipelines de e-discovery: recuperar candidatos relevantes de grandes volumenes documentales antes de un analisis mas costoso con modelos generativos o revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones MTEB ni comparaciones numericas con otros modelos; unicamente se indica la etiqueta `mteb`, que sugiere que el modelo esta pensado para ser evaluado en ese marco, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de runtime, aproximadamente 1-2 GB adicionales):
  - Q2_K: 3,2 GB de pesos; viable en GPUs con 6 GB.
  - Q3_K_M: 4,0 GB; viable en GPUs con 6-8 GB.
  - Q4_K_M (recomendada): 4,8 GB; viable en GPUs con 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
  - Q5_K_M: 5,5 GB; requiere 8 GB o mas.
  - Q6_K: 6,3 GB; requiere 8-10 GB.
  - Q8_0: 8,1 GB; requiere 10-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080).
  - f16: 15,2 GB; requiere 16-24 GB (RTX 4090, A100 40 GB, H100).
- GPU recomendadas: para produccion con throughput alto, A100 o H100; para desarrollo y lotes pequenos, RTX 4090, RTX 4080 o RTX 3090.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 8-12 GB; f16 requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con endpoints (la etiqueta `endpoints_compatible` lo indica), y el modelo base en safetensors con transformers/sentence-transformers y vLLM o TGI si se necesita servir la version sin cuantizar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un modelo de 7,57B parametros usado en modo encoder, el coste por embedding es proporcional al numero de tokens de entrada; las cuantizaciones Q4_K_M y Q8_0 se marcan como "fast" por el autor, pero sin cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales. Alternativas habituales en recuperacion juridica y embeddings multilingues:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| octen-law-8b-v1 (este) | 7,57B | no disponible | en, de, zh | Apache 2.0 | GGUF, safetensors |
| BGE-M3 (BAAI) | ~568M | 8.192 tokens | multilingue (100+) | MIT | safetensors, GGUF |
| multilingual-e5-large (Microsoft) | ~560M | 512 tokens | multilingue (100+) | MIT | safetensors, GGUF |
| jina-embeddings-v3 | ~570M | 8.192 tokens | multilingue | CC BY-NC 4.0 (no comercial) | safetensors |

La diferencia clave es el tamano: octen-law-8b-v1 es un orden de magnitud mayor que los encoders de recuperacion habituales, lo que implica mayor coste de inferencia y almacenamiento de indices vectoriales de mayor dimension (dimension no disponible), a cambio de un afinamiento especifico en dominio legal. No hay datos publicos que permitan afirmar que supere a BGE-M3 o multilingual-e5-large en tareas legales; se requiere evaluacion propia con MTEB o un conjunto de validacion del dominio.

## Limitaciones y advertencias

- Solo cubre tres idiomas (ingles, aleman y chino); no soporta castellano, lo que limita su uso directo en entornos juridicos en Espana sin un modelo alternativo o un ajuste adicional.
- Es un modelo de embeddings, no generativo: no puede responder preguntas ni redactar texto por si mismo; debe combinarse con un LLM y un indice vectorial.
- No se han publicado resultados de benchmarks, por lo que su calidad real frente a alternativas establecidas no esta verificada de forma independiente.
- La longitud de contexto no esta documentada; los textos legales largos pueden requerir troceado (chunking), con el riesgo de perder contexto entre fragmentos.
- Riesgo de sesgo y de recuperacion deficiente en subdominios poco representados en los datasets de entrenamiento (por ejemplo, derecho espanol o latinoamericano).
- Las cuantizaciones de baja precision (Q2_K, Q3_K) degradan la calidad de los embeddings; para produccion se recomienda Q4_K_M o superior, y Q8_0 o f16 si la precision es critica.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (litillabs/octen-law-8b-v1) y de los datasets empleados, ya que la informacion disponible no detalla posibles restricciones de los datos de entrenamiento.
- Al ser una cuantizacion de la comunidad, no hay garantia de soporte oficial; los problemas deben reportarse al repositorio de mradermacher o al modelo base.
- En produccion juridica, los resultados deben validarse por profesionales: un sistema de recuperacion puede devolver pasajes formalmente similares pero juridicamente irrelevantes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/octen-law-8b-v1-GGUF
- Modelo base: https://huggingface.co/litillabs/octen-law-8b-v1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#octen-law-8b-v1-GGUF
- Dataset de pares de recuperacion legal: https://huggingface.co/datasets/Hanno-Labs/legal-retrieval-pairs-v2
- Dataset de pares de recuperacion legal (Wikipedia alemana): https://huggingface.co/datasets/Hanno-Labs/legal-retrieval-pairs-dewiki
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
