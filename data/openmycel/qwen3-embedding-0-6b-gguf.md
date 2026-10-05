# OpenMycel/Qwen3-Embedding-0.6B-GGUF

## Resumen

OpenMycel/Qwen3-Embedding-0.6B-GGUF es una version cuantizada en formato GGUF del modelo de embeddings Qwen/Qwen3-Embedding-0.6B, desarrollado por el equipo Qwen. La cuantizacion la firma Nikita MRCS (@nmrcs) para el proyecto OpenMycel, que la emplea en iPhone para determinar a que habilidad (skill) puede corresponder un mensaje antes de que el modelo de lenguaje lo procese. El repositorio contiene un unico fichero, `Qwen3-Embedding-0.6B-Q4_K_M.gguf` (396.474.560 bytes, unos 396 MB), generado a partir del GGUF Q8_0 del autor original.

Se trata de un modelo de embeddings, no de un modelo generativo: su funcion es transformar texto en vectores densos para busqueda semantica, recuperacion y clasificacion. Cuenta con 595.776.512 parametros (aproximadamente 0,6B) y esta pensado para ejecutarse en hardware muy limitado, incluidos telefonos. El autor no ha aplicado ningun ajuste fino ni modificacion de pesos mas alla de la requantizacion, por lo que el modelo, su licencia y su entrenamiento siguen siendo de Qwen.

Su relevancia actual radica en que demuestra que un modelo de embeddings multilingue de 0,6B puede comprimirse hasta unos 396 MB conservando practicamente toda su calidad en la tarea evaluada (91% frente al 92% del Q8_0 original), lo que lo hace viable para inferencia en el borde (edge) y en dispositivos moviles. La licencia Apache 2.0 y el formato GGUF facilitan su integracion en despliegues locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (derivado de Qwen3); pooling `last` |
| Parametros totales | 595.776.512 (aproximadamente 0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo) |
| Idiomas soportados | Multilingue (evaluado en en, ru, es, de, fr, pt, tr, zh, ja y ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del fichero | 396.474.560 bytes (Q4_K_M) |
| Huella SHA-256 | `23d234bb57a42528a22a13e7beb8b57d8844b2b9cc741b4c27a8ff132abf0dfd` |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-0.6B, un modelo de embeddings basado en la arquitectura Qwen3. Este repositorio no contiene ningun entrenamiento propio: el autor parte del GGUF Q8_0 publicado por Qwen (`Qwen3-Embedding-0.6B-Q8_0.gguf`, SHA-256 `06507c7b42688469c4e7298b0a1e16deff06caf291cf0a5b278c308249c3e439`) y lo requantiza a Q4_K_M con `llama-quantize --allow-requantize` de llama.cpp (tag `b11146`, commit `7fe450e19305b828c199d602c23a8337aaa1f03b`). No hay ajuste fino, RLHF ni DPO; el unico cambio son los pesos cuantizados.

La innovacion tecnica relevante es la propia cadena de requantizacion: el autor advierte que, al partir de Q8_0 y no de f16, se produce "un poco mas de perdida" que si se cuantizara directamente desde precision completa. Ademas, el proceso es reproducible: cualquiera puede regenerar el fichero desde la fuente y obtener el mismo hash. El modelo emplea pooling `last` (ultimo token) y sigue la convencion de Qwen para embeddings asimetricos: la consulta se envia precedida de una instruccion y los documentos se pasan en crudo.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion.
- Recuperacion asimetrica: consulta con instruccion ("Instruct: ... Query: ...") frente a documentos sin prefijo.
- Clasificacion por similitud: asignacion de un mensaje a la intencion (intent) cuyo vector mas cercano resulte mas proximo.
- Soporte multilingue en al menos diez idiomas (en, ru, es, de, fr, pt, tr, zh, ja, ko) segun la evaluacion del autor.
- Uso en RAG (generacion aumentada por recuperacion): indexar fragmentos de documentos y recuperar los mas relevantes para una consulta.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso, a pesar del tag `conversational` del repositorio.
- Compatible con endpoints de embeddings (tag `endpoints_compatible`) mediante servidores que expongan la API de embeddings.

## Casos de uso

- Deteccion de intenciones en el dispositivo: el caso motivador del autor. Se vectorizan las intenciones (tema y mensajes de ejemplo) y el mensaje entrante se asigna a la intencion con el vector mas cercano, evitando cargar el modelo de lenguaje completo. Cabe en un telefono por su tamano de 396 MB.
- Recuperacion en RAG sobre corpus locales: indexar documentacion tecnica y recuperar pasajes relevantes antes de pasarlos a un LLM, con coste minimo de memoria.
- Busqueda semantica en aplicaciones moviles: indice vectorial embebido en la app para buscar notas, mensajes o registros por significado y no por palabra exacta.
- Deduplicacion y agrupamiento (clustering) de textos: agrupar tickets, correos o comentarios por similitud de embeddings para clasificacion automatica.
- Filtrado previo (pre-routing) en asistentes: decidir si un mensaje debe activar una habilidad concreta antes de invocar un modelo mayor, reduciendo latencia y coste.
- Recomendacion de contenido: comparar embeddings de consultas y de elementos del catalogo para sugerir elementos similares.
- Moderacion o triaje ligero: clasificar entradas por proximidad a vectores de referencia etiquetados (por ejemplo, categorias de soporte).

## Benchmarks y rendimiento

Los unicos datos publicados son los de la tarea interna de busqueda de intenciones de OpenMycel: 49 intenciones (8 reales, "chat" y 40 inventadas), 138 mensajes en 10 idiomas (98 de ellos peticiones), ejecutado con llama.cpp `b11146` en un Mac M3 Max el 2026-10-05. No es un benchmark general.

| Metrica | Q8_0 (autor) | Q4_K_M (este fichero) |
|---|---|---|
| Tamano | 639 MB | 396 MB |
| Intencion correcta en primera posicion | 90/98 (92%) | 89/98 (91%) |
| Intencion correcta entre las 3 mas cercanas | 96/98 (98%) | 96/98 (98%) |
| Intencion correcta entre las 5 mas cercanas | 97/98 (99%) | 96/98 (98%) |
| Peticion mas cercana a una intencion inventada | 3 | 5 |
| Tiempo por vector de mensaje (Mac M3 Max) | 13 ms | 17 ms |

Comparativa indicada por el autor en la misma tarea: multilingual-e5-small (Q8_0, 132 MB) logra la intencion correcta entre las 5 mas cercanas en 89/98 (91%), y 19 peticiones caen mas cerca de una intencion inventada. El autor advierte que no ha medido el modelo en un telefono todavia.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 400 MB para el fichero Q4_K_M, mas la memoria de trabajo del runtime; el Q8_0 original ocupa 639 MB.
- Cabe holgadamente en GPU de consumo (por ejemplo RTX 3060, RTX 4090) y en GPU de centros de datos (A100, H100), aunque estas ultimas estan sobredimensionadas para 0,6B.
- Disenado para ejecutarse en CPU: el autor lo ejecuta en un Mac M3 Max y su uso previsto es iPhone.
- Despliegue confirmado con llama.cpp: `llama-server -m Qwen3-Embedding-0.6B-Q4_K_M.gguf --embeddings --pooling last`. Otras herramientas (Ollama, vLLM, TGI) no estan citadas en la informacion disponible.
- Latencia medida: 17 ms por vector de mensaje en Mac M3 Max con Q4_K_M (13 ms con Q8_0). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | Rendimiento en la tarea (top-5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B-GGUF Q4_K_M (este) | 595.776.512 | 396 MB | No disponible | 96/98 (98%) | Apache 2.0 | GGUF |
| Qwen3-Embedding-0.6B-GGUF Q8_0 (autor) | 595.776.512 | 639 MB | No disponible | 97/98 (99%) | Apache 2.0 | GGUF |
| multilingual-e5-small | No disponible | 132 MB | No disponible | 89/98 (91%) | No disponible | No disponible |

No se dispone de datos de contexto ni de parametros exactos de multilingual-e5-small en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se publica la cuantizacion Q4_K_M; quien necesite mayor fidelidad debe recurrir al Q8_0 original de Qwen.
- La requantizacion se hizo desde Q8_0 y no desde f16, por lo que la perdida es algo mayor que la de un Q4_K_M generado desde precision completa, segun el propio autor.
- Ligera degradacion respecto al Q8_0: 1 punto menos en intencion correcta en primera posicion (91% frente a 92%) y hasta 5 peticiones mal enrutadas hacia intenciones inventadas (frente a 3).
- Los datos de rendimiento provienen de una unica tarea, un unico conjunto de mensajes y un unico equipo (Mac M3 Max); no son extrapolables a otros dominios ni constituyen un benchmark general.
- No se ha medido el rendimiento en un telefono, pese a ser el destino previsto.
- Al ser un modelo de embeddings, no genera texto ni soporta tool calling, agentes ni razonamiento multi-paso.
- Longitud de contexto e inventario de idiomas completos no se detallan en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, siempre que se cumplan las condiciones de la licencia; el modelo original es de Qwen y esta cuantizacion de OpenMycel.
- No inventes resultados: no hay benchmarks publicos de MMLU, HumanEval ni GSM8K para este modelo, ya que no es generativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenMycel/Qwen3-Embedding-0.6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- GGUF original del autor (Q8_0): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF
- Proyecto OpenMycel: https://openmycel.app
- Perfil del autor de la cuantizacion: https://github.com/nmrcs
- Herramienta de cuantizacion: llama.cpp (tag `b11146`, commit `7fe450e19305b828c199d602c23a8337aaa1f03b`)
