# frankmorales2020/mistral-7b-text-to-sql-topo-Q8_0-GGUF

## Resumen

`mistral-7b-text-to-sql-topo-Q8_0-GGUF` es una cuantizacion GGUF de 8 bits (`Q8_0`) del modelo `mistralai/Mistral-7B-Instruct-v0.1`, afinado en su totalidad (full fine-tuning) por el usuario `frankmorales2020` para la tarea de traduccion de lenguaje natural a SQL (text-to-SQL) en ingles. El modelo parte de la arquitectura transformer decoder-only de Mistral 7B, con 7.241.732.096 parametros, y se distribuye como un unico fichero GGUF de aproximadamente 7,7 GB pensado para ejecutarse con `llama.cpp` y `llama-cpp-python`.

La relevancia de esta publicacion no reside en el modelo base, ampliamente conocido, sino en el procedimiento de entrenamiento declarado por el autor: un optimizador propio denominado `TopoAdamW` con redondeo estocastico, compensacion de Kahan y deriva de anclas (`anchor drift`) nula (`0.000000e+00`) sobre las filas de embedding de ancla, con una perdida de validacion de aproximadamente `0.0289` tras 3 epocas sobre el dataset `b-mc2/sql-create-context`. Ademas, el autor enfatiza la reproducibilidad determinista con `temperature=0.0`.

El modelo esta especializado exclusivamente en generar consultas SQL a partir de un esquema y una pregunta en ingles, con un contexto de inferencia declarado de 1024 tokens en los scripts de evaluacion. La licencia es Apache 2.0, heredada del modelo base, y el idioma soportado declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B, atencion con sliding window y grouped-query attention, segun el modelo base) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en la configuracion de evaluacion declarada (`n_ctx=1024`); el modelo base soporta ventanas mayores, pero no se especifica el contexto de entrenamiento del afinado |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mistral-7b-text-to-sql-topo-Q8_0.gguf`, ~7,70 GB decimal / ~7,17 GiB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `mistralai/Mistral-7B-Instruct-v0.1`, un transformer decoder-only de 7.241.732.096 parametros. El autor no detalla modificaciones estructurales sobre la arquitectura base; el cambio principal es el ajuste de todos los pesos sobre el dataset `b-mc2/sql-create-context`, que empareja esquemas DDL (`CREATE TABLE ...`), preguntas en ingles y la consulta SQL resultante. El entrenamiento se realizo durante 3 epocas con el optimizador `TopoAdamW`, que el autor describe con redondeo estocastico, compensacion de Kahan y cero deriva en las filas de ancla de los embeddings, alcanzando una perdida de validacion de aproximadamente `0.0289`.

No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de su identificador, ni si se aplicaron tecnicas de RLHF o DPO adicionales. La innovacion tecnica declarada es el propio optimizador `TopoAdamW` y la garantia de reproducibilidad determinista: con `temperature=0.0` y la plantilla de prompt `[INST] ... [/INST]` de un solo turno, el autor afirma que las salidas son identicas entre ejecuciones locales y en el Hub. La cuantizacion Q8_0 se presenta como de alta fidelidad, preservando los pesos afinados para su ejecucion en `llama.cpp`.

## Capacidades

- Generacion de consultas SQL a partir de un esquema DDL y una pregunta en lenguaje natural en ingles.
- Razonamiento sobre esquemas relacionales: el prompt incluye las sentencias `CREATE TABLE` y el modelo debe inferir tablas, columnas y tipos.
- Traduccion de preguntas analiticas (agregaciones, filtros, joins implicitos) a SQL, segun los ejemplos de la model card.
- Generacion determinista con `temperature=0.0`, orientada a reproducibilidad en pipelines.
- Ejecucion en CPU y GPU mediante `llama.cpp` / `llama-cpp-python`.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.

## Casos de uso

- Generacion de SQL en herramientas de BI: el modelo recibe el DDL del esquema y la pregunta del analista y devuelve la consulta, con contexto de 1024 tokens suficiente para esquemas de tamano moderado.
- Asistentes de consulta para bases de datos internas: integrado en un servicio que inyecta el esquema de la tabla relevante y la pregunta del usuario, devolviendo SQL listo para revision humana.
- Generacion de consultas en pipelines de datos: al ser determinista con `temperature=0.0`, encaja en flujos de CI/CD donde se necesita que la misma entrada produzca siempre la misma salida.
- Prototipado de interfaces text-to-SQL: el formato GGUF y la compatibilidad con `llama-cpp-python` permiten desplegar el modelo en portatiles o servidores sin GPU dedicada para validar la viabilidad de una feature.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia Q8_0 frente a otras cuantizaciones del mismo fine-tuning para medir la perdida de exactitud.
- Educacion y formacion en SQL: el modelo puede generar consultas de ejemplo a partir de esquemas didacticos, aunque requiere supervision por el riesgo de alucinacion en columnas o funciones.
- Generacion de SQL en entornos con recursos limitados: al ocupar ~7,7 GB, puede ejecutarse en CPU con `n_gpu_layers=0` o parcialmente en GPU consumer.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre una rebanada de validacion de 100 ejemplos (`range(12500, 13000)` tras `.shuffle(seed=123)` sobre `b-mc2/sql-create-context`), con `llama-cpp-python`, `temperature=0.0`, `n_ctx=1024` y `stop=["</s>"]`:

| Metrica | Resultado |
|---|---|
| Exact Match | 79/100 (79,0 %) |
| Normalized Match | 83/100 (83,0 %) |
| Similitud semantica media | 0,9844 (minimo: 0,7104) |
| Throughput | ~141,9 tok/s (3.010 tokens en 21,22 s) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, Spider, BIRD) ni comparaciones con otros modelos text-to-SQL.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,7 GB solo para los pesos en Q8_0; con overhead de contexto y KV cache, se recomienda reservar 9-10 GB para `n_ctx=1024`.
- GPU recomendadas: cualquier GPU con 10 GB o mas de VRAM (RTX 3080 10 GB, RTX 4080, RTX 4090, A10, L4, A100, H100). Con `n_gpu_layers=-1` el modelo se descarga integramente en GPU.
- Cabe en GPU consumer: si, en modelos con 10 GB o mas de VRAM en Q8_0; en GPUs de 8 GB seria necesario reducir capas descargadas o usar una cuantizacion menor (no publicada en este repo).
- Opciones de despliegue: `llama.cpp`, `llama-cpp-python` (documentado por el autor); tecnicamente compatible con otros runners GGUF como Ollama o `llama-server`, aunque no se documentan en la model card.
- Latencia y throughput: ~141,9 tok/s declarados en la evaluacion del autor; la latencia por consulta depende del numero de tokens generados (las consultas SQL suelen ser cortas, por lo que el tiempo por peticion es bajo). No se especifica el hardware usado en esa medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `frankmorales2020/mistral-7b-text-to-sql-topo-Q8_0-GGUF` | 7,24 B | 1024 tokens en evaluacion | Text-to-SQL, GGUF Q8_0 | Apache 2.0 | Hugging Face |
| `mistralai/Mistral-7B-Instruct-v0.1` (base) | 7,24 B | ventana del modelo base | Instrucciones generales | Apache 2.0 | Hugging Face |
| Otros fine-tunings text-to-SQL sobre Mistral 7B | no disponible | no disponible | Text-to-SQL | variable | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la comparacion con el modelo base es estructural (mismos parametros, distinto afinado), no de rendimiento.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta afinado solo para text-to-SQL en ingles; su uso como modelo de instrucciones generales degradara respecto al base.
- Riesgo de alucinacion: puede inventar columnas, tablas o funciones SQL no presentes en el esquema; se recomienda validacion sintactica y contra el esquema antes de ejecutar.
- Idioma: solo se declara soporte de ingles; las preguntas en castellano no estan cubiertas por el entrenamiento.
- Contexto limitado en la configuracion documentada (1024 tokens): esquemas DDL grandes pueden truncarse y producir consultas incorrectas.
- Evaluacion limitada: los benchmarks declarados se basan en 100 ejemplos de una unica rebanada de validacion, sin resultados en conjuntos estandar como Spider o BIRD; la cifra de 79 % de Exact Match no es directamente comparable con la literatura.
- Reproducibilidad condicionada: el determinismo declarado asume `temperature=0.0`, la plantilla `[INST] ... [/INST]` exacta y el mismo runtime; otros parametros de muestreo o plantillas pueden alterar las salidas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base y de los datos de entrenamiento (`b-mc2/sql-create-context`).
- Popularidad nula en el momento de la ficha (0 descargas, 0 likes): no hay validacion independiente de la comunidad sobre las afirmaciones del autor.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frankmorales2020/mistral-7b-text-to-sql-topo-Q8_0-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- `llama.cpp`: https://github.com/ggerganov/llama.cpp
- `llama-cpp-python`: https://github.com/abetlen/llama-cpp-python
