# ggml-org/embeddinggemma-2-GGUF

## Resumen

`ggml-org/embeddinggemma-2-GGUF` es la conversion a formato GGUF del modelo de embeddings `google/embeddinggemma-2`, publicada por la organizacion ggml-org (responsable del ecosistema llama.cpp). No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de distribucion: el repositorio contiene pesos cuantizados listos para ejecutarse en inferencia local mediante llama.cpp y la aplicacion llama.app, con el objetivo de servir embeddings vectoriales sin depender de GPUs de datacenter ni de APIs externas.

El modelo realiza extraccion de caracteristicas (pipeline `feature-extraction`), es decir, transforma texto en vectores densos utilizables para busqueda semantica, recuperacion aumentada por generacion (RAG), clustering, deduplicacion o clasificacion por similitud coseno. Cuenta con 271.002.648 parametros totales, un tamano de repositorio de 2,4 GB y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales segun los terminos declarados por el autor.

Su relevancia es practica: los pipelines de RAG en produccion necesitan modelos de embeddings que puedan ejecutarse en CPU o en GPUs de consumo, con coste marginal cero y sin fuga de datos hacia servicios externos. Al estar en GGUF, el modelo se integra directamente en despliegues llama.cpp ya existentes y en herramientas compatibles, y su licencia permisiva elimina la friccion legal habitual en modelos de embeddings de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no detalla la arquitectura interna; pipeline declarado: feature-extraction) |
| Parametros totales | 271.002.648 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF cuantizado; los niveles concretos incluidos en el repositorio no se detallan en la informacion disponible |
| Idiomas soportados | No disponible (el campo de idiomas de HuggingFace figura sin datos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Dimension del embedding | No disponible |
| Modelo base | google/embeddinggemma-2 |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni el proceso de entrenamiento. El repositorio se limita a indicar que `ggml-org/embeddinggemma-2-GGUF` es una conversion automatica del modelo `google/embeddinggemma-2` realizada con la herramienta `ggml-org/convert`, y que el pipeline declarado es `feature-extraction`, propio de modelos que producen representaciones vectoriales en lugar de texto generado.

Por tanto, no hay datos publicados en esta ficha sobre numero de tokens de entrenamiento, composicion del dataset, objetivo de entrenamiento (contrastivo, MLM u otro), uso de RLHF/DPO, ni innovaciones tecnicas especificas. La unica caracteristica diferencial verificable es el formato: pesos GGUF cuantizados, pensados para ejecucion eficiente en CPU y GPU de gama de consumo mediante llama.cpp, lo que reduce el espacio en disco y la memoria necesaria en comparacion con los pesos originales en safetensors.

## Capacidades

- Generacion de embeddings de texto: transforma fragmentos de texto en vectores densos aptos para similitud coseno o producto escalar.
- Recuperacion semantica: base para busqueda por significado en lugar de coincidencia lexica exacta.
- Clasificacion y clustering no supervisado: los vectores permiten agrupar documentos por tematica o entrenar clasificadores ligeros sobre las representaciones.
- Deteccion de duplicados y near-duplicates: util para deduplicar corpus mediante umbrales de similitud.
- Reranking de candidatos: combinado con un recuperador disperso, sirve para reordenar resultados por relevancia semantica.
- Ejecucion local: al estar en GGUF, puede correr en CPU y en GPUs de consumo mediante llama.cpp o llama.app.
- Generacion de texto: no disponible; el pipeline declarado es `feature-extraction`, no `text-generation`.
- Tool calling / function calling: no disponible; no es una capacidad esperada en un modelo de embeddings.
- Modo thinking, vision o audio: no disponible.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- RAG sobre documentacion interna: indexar manuales, actas o tickets en una base vectorial usando este modelo para generar los embeddings y recuperar los fragmentos relevantes antes de pasarlos a un LLM generativo. Es adecuado porque el modelo es pequeno (271 M de parametros) y puede ejecutarse en la misma maquina que el resto del pipeline.
- Busqueda semantica en aplicaciones de escritorio: integrar llama.cpp con los pesos GGUF permite ofrecer busqueda por significado en herramientas offline, sin enviar el corpus a un servicio externo ni requerir conexion a internet.
- Deduplicacion de corpus de entrenamiento: calcular embeddings de millones de documentos y eliminar pares con similitud coseno por encima de un umbral, reduciendo ruido y coste de entrenamiento posterior.
- Clasificacion de tickets de soporte: generar embeddings de las incidencias y entrenar un clasificador logistico ligero encima para enrutar por categoria, con un coste de inferencia muy inferior al de usar un LLM generativo para etiquetar.
- Sistemas de recomendacion por contenido: representar articulos, productos o publicaciones como vectores y recomendar elementos cercanos a los que el usuario ha consumido previamente.
- Deteccion de plagio o similitud entre documentos legales: comparar versiones de contratos o memorandos mediante distancia coseno para localizar fragmentos reescritos.
- Filtrado y moderacion de contenido: prefiltrar textos candidatos por similitud con ejemplos etiquetados antes de aplicar un modelo de moderacion mas costoso.
- Agrupacion tematica de encuestas o resenas: aplicar clustering sobre los embeddings para descubrir temas recurrentes sin taxonomia predefinida.
- Cache semantica de respuestas: almacenar embeddings de preguntas ya respondidas y devolver la respuesta cacheada cuando una nueva consulta supera un umbral de similitud, reduciendo llamadas al LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MTEB, MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la model card se limita a las instrucciones de ejecucion y a la referencia al modelo de origen.

## Requisitos de hardware

- VRAM estimada para inferencia: con 271 M de parametros, los pesos en FP16 ocuparian en torno a 540 MB; en cuantizaciones de 8 bits, unos 270 MB; y en cuantizaciones de 4 bits, alrededor de 150 MB. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo cabe comodamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100. En la practica, la GPU no sera el cuello de botella.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria compartida. Tambien puede ejecutarse exclusivamente en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` en modo embeddings), llama.app mediante `llama serve -hf ggml-org/embeddinggemma-2-GGUF`, y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos servidores habria que usar los pesos safetensors del modelo base `google/embeddinggemma-2`.
- Latencia y throughput: no disponibles. Al ser un modelo de 271 M de parametros, la latencia sera muy inferior a la de un LLM generativo del mismo orden de magnitud, pero no hay cifras medidas publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de contexto y rendimiento de terceros en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas. La unica comparacion verificable es con el modelo de origen:

| Modelo | Parametros | Formato | Licencia | Contexto | Uso previsto |
|---|---|---|---|---|---|
| ggml-org/embeddinggemma-2-GGUF | 271.002.648 | GGUF cuantizado | Apache 2.0 | No disponible | Embeddings en llama.cpp / local |
| google/embeddinggemma-2 | No disponible | Safetensors (presumiblemente) | Apache 2.0 | No disponible | Embeddings (modelo de origen) |

Comparativas con otras familias de modelos de embeddings: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El repositorio no documenta evaluaciones de sesgo y el modelo hereda las caracteristicas del corpus de entrenamiento de `google/embeddinggemma-2`, que no se describe en la informacion proporcionada.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo no genera texto; sin embargo, si se usa como recuperador en un pipeline RAG, una recuperacion incorrecta puede inducir alucinaciones en el LLM generativo que consume los fragmentos.
- Limitaciones de contexto: la longitud maxima de secuencia no esta documentada; los fragmentos que excedan ese limite deberan trocearse, con la consiguiente perdida de contexto.
- Limitaciones de idioma: los idiomas soportados figuran como no disponibles, por lo que no se puede garantizar el rendimiento en castellano ni en otros idiomas sin una evaluacion propia.
- Licencia: Apache 2.0, lo que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios realizados.
- Naturaleza del artefacto: es una conversion automatica generada con `ggml-org/convert`. No ha sido entrenada ni ajustada por ggml-org; la calidad final depende integramente del modelo base. Conviene validar los pesos convertidos antes de usarlos en produccion.
- Cuantizacion: al ser pesos cuantizados, existe una degradacion esperada de la calidad del embedding respecto a los pesos originales. El nivel de degradacion no esta documentado en el repositorio.
- Relleno de la model card: la informacion publicada es muy escasa (no hay dimension de embedding, instrucciones de normalizacion, ni formatos de prompt). Cualquier integracion en produccion requiere medir empiricamente la calidad de recuperacion con datos propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Herramienta de conversion: https://github.com/ggml-org/convert
- Aplicacion de ejecucion: https://llama.app
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron exclusivamente contenido no relacionado y de caracter adulto, descartado por no aportar informacion tecnica.
