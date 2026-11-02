# chartreuse-verte/prose-rewriter-1.7b-v2.5

## Resumen

prose-rewriter-1.7b-v2.5 es un modelo de reescritura de prosa a nivel de parrafo desarrollado por chartreuse-verte. Su funcion es tomar texto generado por modelos grandes y re-renderizarlo para que suene mas humano, preservando la semantica original. Se construye sobre Qwen/Qwen3-1.7B-Base mediante un LoRA de rango 32 fusionado con fuerza 1.15. No es un modelo conversacional: cada llamada procesa un unico parrafo como fuente y devuelve una reescritura.

El modelo resuelve un problema concreto de la generacion con LLM: el texto con "slop" o marcas estilisticas artificiales (adverbios eliminados, frases no soportadas por la fuente, truncamientos, fusion de oraciones). La version v2.5 mejora sobre v2.4 en retencion de adverbios de modo (69,6% frente a 61,8%), reduce oraciones no soportadas segun NLI (2,2% frente a 2,9%) y recorta a la mitad los truncamientos severos (4,0% frente a 8,1%).

Con 2.031.739.904 parametros y un contexto heredado de Qwen3, es relevante por su tamano reducido, su disponibilidad en safetensors bf16 y GGUF Q8_0, y su enfoque especializado en una tarea de estilo muy concreta. La licencia AGPL-3.0 y el soporte exclusivo de ingles condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura `qwen3`, base Qwen/Qwen3-1.7B-Base con LoRA rango 32 fusionado a fuerza 1.15) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B-Base; no especificada en la model card) |
| Tipos de cuantizacion | bf16 (safetensors) y GGUF Q8_0 (2,17 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-1.7B-Base, con un adaptador LoRA de rango 32 fusionado en los pesos a fuerza 1.15. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card indica que el pool de entrenamiento tiene una mediana de 37 palabras por entrada, con el 80% por debajo de 70 palabras, lo que define el regimen de uso previsto: parrafos cortos, no documentos largos.

La innovacion principal no es arquitectonica sino de especializacion: el prompt format usa roles no estandar (`<|im_start|>source` y `<|im_start|>rewrite`) y el chat template del repo construye exactamente esa cadena a partir de un unico mensaje. El GGUF conserva el chat template, para en `<|im_end|>` y mantiene la cabeza de salida adaptada separada de los embeddings de tokens, almacenada en Q8_0. La evaluacion se hizo con los pesos tal como se distribuyen (fuerza 1.15), a temperatura 0,9 y top_p 0,95, con tres generaciones por entrada.

## Capacidades

- Reescritura de prosa a nivel de parrafo: transforma texto generado por LLM en una version con estilo mas humano.
- Preservacion de adverbios de modo: retiene el 69,6% de los adverbios de modo del texto de entrada en prosa humana.
- Control de fidelidad semantica: reduce la invencion de hechos y los cambios de significado respecto a versiones anteriores.
- Conservacion de estructura: limita el truncamiento severo (4,0% de reescrituras por debajo de 0,75x de la entrada) y la fusion de oraciones.
- No es un modelo de chat: cada llamada procesa un unico mensaje de rol `source` y genera una unica reescritura.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes ni razonamiento multi-paso: la tarea es una transformacion de texto en una sola pasada.
- Capacidad multilingue limitada al ingles.
- No dispone de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Limpieza de textos generados por LLM antes de publicacion: se pasa cada parrafo generado por un modelo grande por el rewriter para reducir marcas estilisticas artificiales y mejorar la naturalidad, manteniendo el significado.
- Humanizacion de contenido editorial: en flujos de redaccion asistida, el modelo reescribe borradores de mas de 15 palabras para que conserven adverbios y estructuras oracionales mas cercanas a la prosa humana.
- Preprocesado en pipelines de datos sinteticos: se puede aplicar a parrafos de datasets generados para reducir invencion de hechos (8,5% frente a 10,6% en v2.4) y cambios de significado (22,2% frente a 25,5%).
- Reescritura de ficcion y narrativa: la evaluacion se hizo sobre parrafos de ficcion humana y de LLM, por lo que encaja en la revision de escenas y descripciones donde importa conservar adverbios de modo y evitar fusionar oraciones.
- Despliegue local en hardware de consumo: con 2,03 mil millones de parametros y una variante GGUF Q8_0 de 2,17 GB, se puede ejecutar con llama.cpp en equipos sin GPU dedicada de gran capacidad.
- Servicio de reescritura por lotes: al ser una tarea de una sola pasada y con prompts cortos (mediana de 37 palabras), se puede integrar en colas de procesamiento por parrafo con throughput alto en una sola GPU.
- Filtro de calidad en generacion de contenido: se puede usar para detectar y corregir parrafos que el modelo base generaria con truncamientos o repeticiones, comparando la salida con la entrada.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones internas del autor, no benchmarks estandar (MMLU, HumanEval, GSM8K). Se presentan a continuacion.

Prosa humana (300 parrafos de ficcion no vistos, 900 generaciones por variante):

| Metrica | Entrada | v2.4 | v2.5 |
|---|---|---|---|
| Adverbios de modo conservados | - | 61,8% | 69,6% |
| Adverbios de modo por 100 palabras | 1,99 | 1,39 | 1,56 |
| El juez anade un hecho o cambia un significado | - | 18,0% | 15,4% |
| Oraciones no soportadas (NLI) | - | 2,9% | 2,2% |
| Palabras por oracion | 17,4 | 16,5 | 16,1 |
| Dos o mas oraciones menos que la entrada | - | 6,8% | 4,3% |

Prosa escrita por LLM (365 parrafos no vistos, 1.095 generaciones por variante):

| Metrica | v2.4 | v2.5 |
|---|---|---|
| Anade un hecho no soportado por la entrada | 10,6% | 8,5% |
| Cambia el significado de algo que dice la entrada | 25,5% | 22,2% |
| Cualquiera de las dos | 27,9% | 24,5% |
| Oracion mal formada (entrada: 0,3%) | 3,4% | 3,0% |

Metricas estructurales sobre los mismos 365 parrafos:

| Metrica | v2.4 | v2.5 |
|---|---|---|
| Palabras cambiadas | 35,4% | 30,0% |
| Salida sin cambios | 1,6% | 3,9% |
| Salidas casi literales | 0,3% | 0,5% |
| Por debajo del minimo de edicion de entrenamiento | 55,9% | 72,4% |
| Numero de oraciones alterado | 61,8% | 59,7% |
| Variedad de longitud de oracion frente a la entrada | +0,045 | +0,025 |
| Palabras conservadas de la entrada | 0,691 | 0,736 |
| Longitud preservada | 0,912 | 0,928 |
| Truncado por debajo de 0,75x | 8,1% | 4,0% |
| Dos o mas oraciones menos que la entrada | 5,9% | 3,0% |
| 3-gramas repetidos | 0,001 | 0,001 |

Invencion de personas y repeticion (mismos 365 parrafos):

| Metrica | v2.4 | v2.5 |
|---|---|---|
| Pronombre generizado no autorizado por la entrada | 0,2% | 0,3% |
| ... del otro genero | 0,0% | 0,0% |
| Nombre propio que la entrada no tiene | 0,4% | 0,1% |
| Cualquier repeticion (entrada: 2,2%) | 4,3% | 3,6% |
| ... de una oracion completa | 0,0% | 0,2% |
| ... de una frase | 1,7% | 1,5% |
| ... de una apertura de oracion (anafora) | 1,5% | 0,8% |

El autor indica que la mejora en retencion de adverbios es de 7,8 puntos (IC 95% +4,8 a +10,9) y que las filas de fidelidad y longitud de oracion no se separan estadisticamente (t = -1,5, -1,9, -1,7). En prosa de LLM, ninguna de las cuatro metricas de fidelidad alcanza |t| = 2.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB solo para pesos (2,03 mil millones de parametros), mas overhead de activaciones y cache KV; en la practica conviene reservar 5-6 GB.
- VRAM estimada en GGUF Q8_0: alrededor de 2,2 GB para el archivo de pesos, mas overhead del runtime.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para Q8_0 basta con 3-4 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; tambien en equipos con CPU usando llama.cpp.
- Opciones de despliegue: transformers (bf16, `device_map="cuda"`), llama.cpp y llama-cpp-python (GGUF Q8_0), text-generation-inference segun los tags del repo, y endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada. La tarea es una sola pasada con `max_new_tokens=512` y entradas de mediana 37 palabras, lo que sugiere generaciones cortas, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prose-rewriter-1.7b-v2.5 | 2,03 B | no disponible | Reescritura de prosa | AGPL-3.0 | safetensors bf16, GGUF Q8_0 |
| Qwen/Qwen3-1.7B-Base | 1,7 B (aproximado, segun nombre) | no disponible | Generacion de texto general | no disponible en la informacion | safetensors |
| prose-rewriter-1.7b-v2.4 | 2,03 B | no disponible | Reescritura de prosa | AGPL-3.0 | version anterior del mismo autor |

No se dispone de datos sobre otros modelos especializados en reescritura de prosa en la informacion proporcionada. La comparacion con Qwen3-1.7B-Base es estructural (es su modelo base), no de rendimiento en la tarea, ya que el base no esta especializado en reescritura.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- No es un modelo conversacional: cada llamada debe enviar un unico mensaje de rol `source`; los runtimes que esperan roles `user`/`assistant` pueden no modelar el formato correctamente.
- Umbral minimo practico de unas 15 palabras: por debajo, el modo de fallo es relleno, recorte y fabricacion; por debajo de 80 bytes conviene pasar el texto sin cambios.
- Riesgo de alucinacion medido: en prosa de LLM, el 8,5% de las reescrituras anade un hecho no soportado y el 22,2% cambia el significado de algo que dice la entrada; el 24,5% incurre en al menos uno de los dos.
- El 3,0% de las reescrituras contiene una oracion mal formada (frente al 0,3% de la entrada).
- El 3,6% de las reescrituras presenta alguna repeticion (frente al 2,2% de la entrada).
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y sobre el uso en red; revisar compatibilidad antes de uso comercial o en servicios SaaS.
- El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Los benchmarks son evaluaciones internas del autor con jueces LLM y NLI, no benchmarks estandar reproducibles de forma independiente.
- No se documenta la longitud de contexto efectiva; el entrenamiento se centra en parrafos cortos (mediana de 37 palabras), por lo que entradas largas quedan fuera del regimen previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v2.5
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
