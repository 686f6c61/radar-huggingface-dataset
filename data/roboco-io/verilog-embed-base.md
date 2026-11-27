# roboco-io/verilog-embed-base

## Resumen

`verilog-embed-base` es un modelo de embeddings de texto especializado en la búsqueda de módulos Verilog y SystemVerilog a partir de una descripción en lenguaje natural. Lo desarrolla roboco-io dentro del proyecto Silicon Model Factory, un proyecto operado por agentes, y parte de `nomic-ai/CodeRankEmbed` como modelo base, sobre el que se aplica un ajuste fino supervisado. Resuelve un problema concreto de la ingeniería de hardware: localizar implementaciones de módulos (FIFOs, arbitros, máquinas de estados) dentro de grandes bases de código RTL escritas por terceros.

Arquitectónicamente es un transformer bi-encoder de tipo `nomic_bert` con 136.731.648 parámetros totales, una longitud de contexto de 512 tokens y salida de embeddings normalizables para similitud coseno. Su relevancia actual radica en que los modelos de embeddings de código generalistas rinden de forma subóptima en HDL, y este modelo demuestra una mejora medible y estadísticamente validada sobre su base en una tarea de recuperación real, con un protocolo de evaluación precomprometido y datos de entrenamiento filtrados por licencia.

El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors, y está pensado para integrarse en pipelines de búsqueda semántica de código mediante `sentence-transformers` o Text Embeddings Inference (TEI).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (`nomic_bert`, código custom del modelo base) |
| Parametros totales | 136.731.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_length`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre comentarios en repositorios GitHub, predominantemente en inglés) |
| Licencia | Apache-2.0 (modelo base MIT) |
| Formato de pesos | safetensors (requiere `safe_serialization=True` por el código custom del base) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder derivado de `nomic-ai/CodeRankEmbed`, que a su vez se apoya en una arquitectura `nomic_bert` con código propio (`trust_remote_code=True`). Genera un vector por entrada, de modo que consultas y módulos se codifican de forma independiente y se comparan mediante producto escalar sobre embeddings normalizados. La ventana de entrada está limitada a 512 tokens, suficiente para comentarios de descripción y para módulos RTL de tamaño moderado.

El ajuste fino se realizó sobre 8.482 pares comentario-módulo extraídos de repositorios GitHub de Verilog y SystemVerilog con licencias permisivas (MIT, Apache-2.0, BSD-3-Clause, BSD-2-Clause y CC0-1.0), seleccionados vía GitHub Search API con al menos 10 estrellas, sin forks ni repos archivados. Se excluyeron ficheros con avisos de copyright de vendor, código generado, marcadores privados, testbenches, módulos duplicados y descripciones duplicadas; el split se hizo por propietario para evitar fuga de información. No se usaron descripciones generadas por LLM. El entrenamiento empleó `CachedMultipleNegativesRankingLoss`, batch de 64, 3 épocas, learning rate 2e-5, longitud máxima de 512 tokens, 396 pasos sobre una única Tesla T4, con selección del checkpoint únicamente sobre el split de desarrollo.

## Capacidades

- Generación de embeddings de texto para recuperación semántica (retrieval) de código Verilog y SystemVerilog.
- Búsqueda de módulos a partir de descripciones en lenguaje natural (query-to-code).
- Codificación de módulos RTL como documentos indexables en un corpus vectorial.
- Soporte de prefijo de consulta específico (`Represent this query for searching relevant code: `), que debe aplicarse solo a las queries y no al código.
- Embeddings normalizables para similitud coseno y búsqueda por producto escalar.
- Integración con `sentence-transformers` y compatibilidad con Text Embeddings Inference (`text-embeddings-inference`, `endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica de módulos RTL en una base de código corporativa: indexar todos los módulos Verilog/SystemVerilog con el encoder de documentos y permitir consultas como "synchronous FIFO with configurable depth", recuperando candidatos por similitud coseno sobre vectores normalizados.
- Asistencia a ingenieros en la reutilización de IP interna: dado un catálogo de módulos propios, el modelo permite localizar implementaciones existentes antes de escribir código nuevo, reduciendo duplicación.
- Construcción de un motor de búsqueda tipo "code search" sobre repositorios públicos: el modelo está entrenado con pares de repositorios permisivos, por lo que encaja en índices de código abierto con atribución de licencia.
- Integración en pipelines de CI/CD de documentación: generar o validar que cada módulo tiene un comentario descriptivo recuperable, detectando módulos sin descripción útil mediante consultas de prueba y umbrales de similitud.
- Enriquecimiento de asistentes de código para HDL: usar el modelo como componente de recuperación (RAG) que alimenta a un LLM generador con módulos relevantes como contexto, sin que el propio modelo genere texto.
- Deduplicación y auditoría de catálogos RTL: comparar embeddings de módulos entre repositorios para detectar copias renombradas o implementaciones equivalentes, aunque con las cautelas indicadas en limitaciones.
- Búsqueda multilingüe limitada: no evaluado en otros idiomas; en la práctica solo es fiable con descripciones en inglés, el idioma dominante de los comentarios de entrenamiento.

## Benchmarks y rendimiento

Evaluación sobre `verilog-comment-module-heldout-v1` (1.642 pares retenidos de propietarios no vistos en entrenamiento), medida el 2026-11-27 en la misma GPU y script para ambos modelos. Intervalos del 95 % por bootstrap con 1.000 remuestreos.

| Modelo | nDCG@10 | Intervalo 95 % | MRR@10 | Recall@1 | Recall@10 |
|---|---|---|---|---|---|
| verilog-embed-base | 0.7492 | 0.7307-0.7651 | 0.7068 | 0.6102 | 0.8800 |
| nomic-ai/CodeRankEmbed | 0.6920 | 0.6726-0.7098 | 0.6464 | 0.5512 | 0.8350 |

La diferencia en nDCG@10 es de +0.0572, por encima del criterio de aceptación precomprometido de +0.04. No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,55 GB solo de pesos (136,7 M de parámetros); con overhead de activaciones y tokenizador, un entorno de 2-4 GB es suficiente para lotes pequeños.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en Tesla T4 (la propia GPU usada para el entrenamiento).
- GPU recomendadas para indexación a gran escala: A100, H100, L4 o T4 para throughput alto; el modelo es lo bastante pequeño como para ejecutarse en CPU en escenarios de baja concurrencia.
- Opciones de despliegue: `sentence-transformers` (requiere `trust_remote_code=True` y `model_kwargs={"safe_serialization": True}`), Text Embeddings Inference (TEI) por su compatibilidad declarada, y cualquier framework que cargue safetensors con el código custom del base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 (verilog heldout) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roboco-io/verilog-embed-base | 136,7 M | 512 | 0.7492 | Apache-2.0 | Hugging Face |
| nomic-ai/CodeRankEmbed | no disponible en la información | 512 | 0.6920 | MIT | Hugging Face |
| Modelos de embeddings de código generalistas (p. ej. familia CodeBERT/GraphCodeBERT) | no disponible en la información | no disponible | no evaluados en este test set | variable | Hugging Face |

La única comparación cuantitativa publicada es contra el modelo base. No hay datos de benchmarks frente a otros modelos de embeddings de código en el conjunto de evaluación del autor.

## Limitaciones y advertencias

- Las descripciones de entrenamiento son comentarios escritos por los autores originales; las consultas reales pueden ser más cortas, vagas o estar en otros idiomas, y el modelo no se evaluó en esos casos.
- El test set asigna un único módulo relevante por consulta; un módulo igualmente válido pero no etiquetado cuenta como fallo, lo que puede infraestimar el rendimiento real.
- El filtro de duplicados compara código y nombres de módulo; copias renombradas entre repositorios pueden permanecer y elevar artificialmente las métricas.
- El filtro de licencias se basa en el fichero de licencia del repositorio y coincidencias de palabras clave; puede pasar por alto ficheros con licencia distinta a la del repositorio.
- No evaluado en recuperación código-a-código ni en otros lenguajes de descripción de hardware como VHDL o Chisel.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto), pero sí de recuperaciones irrelevantes si la consulta cae fuera del dominio Verilog/SystemVerilog o está en un idioma no cubierto.
- Sesgos conocidos: no documentados explícitamente; el corpus se limita a repositorios con al menos 10 estrellas y licencias permisivas, lo que sesga hacia proyectos populares y descripciones en inglés.
- Licencia Apache-2.0 permite uso comercial; el modelo base es MIT y los datos de entrenamiento provienen de repositorios permisivos listados en `data-sources.json`, aunque la atribución de datos debe revisarse en despliegues comerciales.
- Requiere `trust_remote_code=True` por el código custom del modelo base, lo que implica ejecutar código del repositorio; conviene auditar dicho código en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roboco-io/verilog-embed-base
- Modelo base: https://huggingface.co/nomic-ai/CodeRankEmbed
- Organización roboco-io: https://huggingface.co/roboco-io
- Fichero de fuentes de datos: `data-sources.json` en el repositorio del modelo
- Conjunto de evaluación: `verilog-comment-module-heldout-v1` (referenciado en la model card, sin URL pública en la información disponible)
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- sentence-transformers: https://www.sbert.net/
