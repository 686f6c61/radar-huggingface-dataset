# MajidFQ/taxoSplitter_biz-router-e5

## Resumen

`taxoSplitter_biz-router-e5` es un modelo de embeddings basado en el fine-tuning de `intfloat/e5-base-v2`, desarrollado por `MajidFQ` con la librería `sentence-transformers`. Está diseñado para tareas de similitud semántica, especializado en el enrutamiento y clasificación de descripciones de negocios dentro de una taxonomía (por ejemplo, categorías como retail, construcción, manufactura o salud). Su propósito principal es comparar una descripción corta de un negocio con un conjunto de reglas y asignar la categoría más adecuada mediante similitud de coseno.

El modelo se entrenó con un dataset de 30.345 pares de frases y usó la función de pérdida `CosineSimilarityLoss`. La arquitectura subyacente es un transformer encoder (BERT) de 109 millones de parámetros, heredado del modelo base. La longitud de contexto exacta no se especifica en la documentación disponible. El repositorio contiene los pesos en formato `safetensors` y su tamaño es de 0,4 GB.

Este modelo resulta relevante para desarrolladores que necesitan una solución ligera y rápida para clasificar de forma automática negocios, proveedores o empresas a partir de descripciones en lenguaje natural. Su ventaja es que no requiere generar texto: produce vectores de representación que se pueden integrar en sistemas vectoriales de búsqueda o en routers de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) / Sentence Transformer |
| Parametros totales | 109.482.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está construido sobre `intfloat/e5-base-v2`, un modelo de embeddings basado en BERT, y se fine-tuneó con `sentence-transformers`. El entrenamiento utilizó la técnica de similitud semántica: los pares de frases se alinean para maximizar la similitud de coseno entre representaciones relacionadas. La función de pérdida empleada fue `CosineSimilarityLoss`, y el dataset consta de 30.345 ejemplos.

No se mencionan innovaciones técnicas destacadas más allá de la adaptación de un modelo existente a una tarea concreta. Tampoco se documenta el uso de RLHF, DPO ni otras técnicas de alineación. El modelo es de tipo denso y no está basado en mezcla de expertos (MoE), por lo que el número de parámetros activos no aplica.

## Capacidades

- Generacion de embeddings densos de frases para similitud semantica.
- Clasificacion de descripciones de negocios en categorias mediante comparacion con reglas o prototipos.
- Es un modelo de `feature-extraction` y `sentence-similarity`, adecuado para pipelines de busqueda vectorial.
- No es generativo: no produce texto, solo representaciones numericas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en agentes conversacionales.
- No soporta vision ni audio.
- Multilinguismo no especificado: podria heredar las capacidades del modelo base, pero no esta confirmado en la informacion disponible.
- Compatible con `text-embeddings-inference` y `endpoints_compatible`, segun los tags de la card.

## Casos de uso

- Enrutamiento de negocios en sistemas fiscales: el modelo puede comparar una descripcion corta de un negocio con las reglas de la taxonomia y asignar automaticamente la categoria correspondiente. Es adecuado porque produce vectores de similitud rapida y no requiere un LLM generativo.
- Curare de directorios empresariales: permite clasificar miles de entradas de empresas en categorias estandar. La inferencia es ligera y se puede ejecutar por lotes.
- Segmentacion de clientes B2B: sirve para identificar el sector de un cliente a partir de su descripcion, permitiendo campañas de marketing dirigidas. La representacion vectorial facilita la integracion en sistemas de CRM.
- Normalizacion de proveedores en ERP: ayuda a mapear descripciones libres de proveedores a codigos de industria estandar, reduciendo el trabajo manual de datos maestros.
- Deteccion de categorias mediante umbral: si ninguna regla supera un umbral de similitud, el modelo puede marcar el registro como "no clasificado" para revision humana. Es util en procesos de validacion de datos.
- Busqueda semantica en plataformas de e-commerce B2B: permite que los usuarios busquen proveedores o productos por descripcion en lenguaje natural, usando indice vectorial.
- Limpieza y deduplicacion de registros: ayuda a unificar variaciones de descripciones de negocios que se refieren a la misma actividad, al agrupar embeddings cercanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,44 GB (109 M parametros). Estimacion basada en el numero de parametros.
- VRAM estimada en FP16: ~0,22 GB.
- VRAM estimada en INT8: ~0,11 GB.
- El modelo es ligero y puede ejecutarse en CPU con 1-2 GB de RAM.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM. No se requieren GPUs de gama alta.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference`, FastAPI con FAISS u otros indices vectoriales.
- Latencia estimada: al ser un modelo de ~109 M parametros, la inferencia suele ser de milisegundos en GPU o CPU moderna. No se han publicado datos oficiales de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MajidFQ/taxoSplitter_biz-router-e5 | 109.482.240 | no disponible | no disponible | HuggingFace |
| intfloat/e5-base-v2 (modelo base) | 109.482.240 (heredado) | no disponible | no disponible | HuggingFace |

No se han identificado otras alternativas comparables en la informacion proporcionada. El modelo es un fine-tuning de `intfloat/e5-base-v2`, por lo que esa es la referencia mas cercana disponible en el contexto de la card.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada, lo que puede limitar su uso comercial sin autorizacion explicita del autor.
- Los idiomas soportados no se indican, por lo que su rendimiento fuera del ingles u otros idiomas no esta garantizado.
- La longitud de contexto no se documenta, lo que puede causar truncamientos en descripciones largas de negocios.
- Riesgo de alucinacion no aplica, ya que el modelo genera embeddings y no texto; sin embargo, la clasificacion puede ser incorrecta si las reglas de la taxonomia no cubren el caso.
- Posibles sesgos no documentados en el dataset de 30.345 ejemplos de entrenamiento, que pueden afectar a la generalizacion en categorias fuera de la taxonomia.
- No soporta generacion de texto ni tool calling, por lo que no debe usarse en agentes conversacionales que requieran interaccion directa con el usuario.
- El modelo cuenta con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MajidFQ/taxoSplitter_biz-router-e5
- Paper de Sentence-BERT (mencionado en los tags): https://arxiv.org/abs/1908.10084
- Modelo base `intfloat/e5-base-v2`: https://huggingface.co/intfloat/e5-base-v2
