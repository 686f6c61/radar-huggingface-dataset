# matthew-ritch/ql-prefixed-Qwen3-Embedding-0.6B

## Resumen

ql-prefixed-Qwen3-Embedding-0.6B es una copia no oficial de investigación de Qwen/Qwen3-Embedding-0.6B, publicada por el usuario matthew-ritch. No se trata de un modelo nuevo ni de un fine-tuning: los tensores son byte-idénticos al repositorio original (revisión `97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3`), y la única modificación es que todos los nombres de tensor en la cabecera safetensors llevan el prefijo `model.`. El autor lo declara explicitamente como una copia creada para que una herramienta de análisis de solo pesos pueda leerlo, sin afiliación ni respaldo de los autores originales.

El modelo subyacente es un modelo de embeddings de texto de la familia Qwen3, desarrollado por el equipo Qwen de Alibaba. Está construido sobre el modelo denso Qwen3-0.6B-Base, con 28 capas, una longitud de contexto de 32.000 tokens y una dimensión de embedding de hasta 1024, configurable entre 32 y 1024 mediante Matryoshka Representation Learning (MRL). Su función principal es convertir texto en vectores densos para tareas de recuperación, clasificación, clustering y minería de bitextos, con soporte para más de 100 idiomas y capacidad de instrucciones específicas por tarea.

La relevancia de este repositorio es limitada y practica: sirve como artefacto de referencia para depurar herramientas que inspeccionan pesos sin cargar el modelo completo, no como sustituto del original. Para cualquier uso de inferencia, entrenamiento o despliegue en producción debe emplearse el repositorio oficial Qwen/Qwen3-Embedding-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B-Base), 28 capas |
| Parametros totales | 595.776.512 (aprox. 0,6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (32K) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | 100+ idiomas (segun model card original), incluidos lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tensores con prefijo `model.` en la cabecera) |
| Dimension de embedding | hasta 1024, configurable de 32 a 1024 (MRL) |
| Tipo de modelo | Text embedding (feature-extraction / sentence-similarity) |
| Libreria | sentence-transformers |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 28 capas construido sobre Qwen3-0.6B-Base, adaptado para producir embeddings de texto en lugar de tokens generados. La innovacion arquitectonica destacable es el soporte de Matryoshka Representation Learning (MRL), que permite truncar la salida a dimensiones arbitrarias entre 32 y 1024 sin reentrenar, facilitando el equilibrio entre coste de almacenamiento y calidad de recuperacion. Ademas, el modelo es "instruction aware": acepta instrucciones definidas por el usuario que, segun la model card original, suelen aportar mejoras de entre 1 % y 5 % en tareas downstream.

Los detalles concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o etapas de contrastive learning) no estan disponibles en la informacion proporcionada. La model card original remite al blog y al repositorio GitHub de Qwen3-Embedding para esos datos. Este repositorio concreto no introduce ningun cambio de entrenamiento: solo renombra los tensores con el prefijo `model.` para compatibilidad con una herramienta de analisis de pesos.

## Capacidades

- Generacion de embeddings de texto densos para similitud semantica y recuperacion de informacion.
- Recuperacion multilingue y cross-lingual en mas de 100 idiomas.
- Recuperacion de codigo (code retrieval) gracias a la base Qwen3.
- Clasificacion de texto y clustering semantico mediante vectores de embedding.
- Mineria de bitextos (bitext mining) para corpus paralelos.
- Dimensiones de salida flexibles de 32 a 1024 mediante MRL.
- Soporte de instrucciones por tarea ("instruction aware") para adaptar el embedding al escenario.
- Compatible con Text Embeddings Inference (TEI) y con el pipeline `feature-extraction` de Transformers.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Busqueda semantica en bases documentales: indexar documentos como vectores de 1024 dimensiones y recuperar los mas cercanos a una consulta, aprovechando la ventana de 32K tokens para fragmentos largos sin truncado agresivo.
- Sistemas RAG (retrieval-augmented generation): usar el modelo como recuperador primario en pipelines que alimentan un LLM generativo, combinado con Qwen3-Reranker-0.6B para reordenar los candidatos.
- Deduplicacion y clustering de corpus: agrupar documentos o tickets de soporte por similitud coseno de embeddings, con dimensiones reducidas (por ejemplo 256) para abaratar el almacenamiento.
- Clasificacion zero-shot de textos: entrenar un clasificador lineal ligero sobre los embeddings para etiquetar correos, resenas o incidencias sin anotar grandes volumenes de datos.
- Recuperacion de codigo en repositorios: indexar funciones y fragmentos de codigo para busqueda por lenguaje natural, aprovechando la capacidad multilingue y de code retrieval del modelo base.
- Mineria de bitextos para traduccion automatica: emparejar frases equivalentes entre corpus en distintos idiomas mediante similitud de embeddings cross-lingual.
- Analisis de pesos y depuracion de tooling: este repositorio en concreto sirve para validar herramientas que leen cabeceras safetensors con prefijos de nombre, sin necesidad de cargar el modelo en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. La model card original menciona que la variante de 8B de la serie alcanza la posicion 1 en el leaderboard MTEB multilingual (puntuacion 70,58, a fecha de 5 de junio de 2025), pero no se proporcionan cifras especificas para la variante de 0,6B.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y batch; en torno a 2-3 GB para batches moderados.
- Cabe holgadamente en GPUs consumer: RTX 3060 12 GB, RTX 4070, RTX 4090, entre otras.
- GPU profesionales recomendadas para alto throughput: A100, H100, L40S, con TEI para servir embeddings a escala.
- Despliegue: Text Embeddings Inference (TEI), sentence-transformers, Transformers (requiere `transformers>=4.51.0` y `sentence-transformers>=2.7.0`), y opciones de cuantizacion no especificadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Se recomienda activar `flash_attention_2` y `padding_side="left"` para acelerar y ahorrar memoria, segun la model card original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ql-prefixed-Qwen3-Embedding-0.6B (este repo) | 0,6B | 32K | hasta 1024 (MRL) | Apache 2.0 | Copia no oficial, solo pesos con prefijo |
| Qwen/Qwen3-Embedding-0.6B | 0,6B | 32K | hasta 1024 (MRL) | Apache 2.0 | Repositorio oficial, uso recomendado |
| Qwen/Qwen3-Embedding-4B | 4B | 32K | 2560 (MRL) | Apache 2.0 | Repositorio oficial |
| Qwen/Qwen3-Embedding-8B | 8B | 32K | 4096 (MRL) | Apache 2.0 | Repositorio oficial, No.1 en MTEB multilingual (junio 2025) |

No se dispone de datos de rendimiento comparativo para la variante de 0,6B en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: no esta afiliado ni respaldado por los autores originales de Qwen; para cualquier uso practico debe emplearse Qwen/Qwen3-Embedding-0.6B.
- Los pesos son byte-idénticos al original, pero los nombres de tensor llevan prefijo `model.`, lo que puede romper cargadores que esperan los nombres originales.
- Modelo de embeddings, no generativo: no produce texto ni responde a prompts; usarlo como LLM no funciona.
- Riesgo de sesgos heredados de Qwen3-0.6B-Base en representaciones multilingues y culturales; no se documentan evaluaciones de sesgo en la informacion disponible.
- Las instrucciones por tarea funcionan mejor si se redactan en ingles, segun la model card original.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del repositorio original antes de redistribuir.
- No hay datos de benchmarks, latencia ni throughput para esta variante en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes; no hay validacion comunitaria de su integridad mas alla de la declaracion del autor y del PROVENANCE.json.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/matthew-ritch/ql-prefixed-Qwen3-Embedding-0.6B
- Modelo original: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Variante 4B: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Variante 8B: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Reranker 0.6B: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Reranker 4B: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Reranker 8B: https://huggingface.co/Qwen/Qwen3-Reranker-8B
- Blog de Qwen3-Embedding: https://qwenlm.github.io/blog/qwen3-embedding/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-Embedding
- Paper de referencia (arXiv): https://arxiv.org/abs/2506.05176
