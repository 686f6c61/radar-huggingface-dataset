# islao2/tiny-sql-GGUF

## Resumen

tiny-sql es un ajuste fino (fine-tuning) mediante LoRA del modelo Qwen2.5-Coder-1.5B-Instruct, especializado en la tarea de text-to-SQL sobre SQLite. Lo desarrolla el usuario islao2 y se distribuye en formato GGUF con cuantizacion Q8_0, lo que facilita su despliegue en entornos con recursos limitados. El modelo resuelve el problema de traducir preguntas en lenguaje natural (ingles) a consultas SQL ejecutables, partiendo de un esquema de base de datos proporcionado en el prompt.

La relevancia de este modelo radica en su relacion rendimiento/tamano: con solo 1.543.714.304 parametros (aproximadamente 1,5 mil millones) alcanza un 69,5% de precision de ejecucion en un conjunto de test de 499 preguntas, superando al modelo base (55,1%) y al Qwen2.5-Coder-7B-Instruct (61,3%), que es casi cinco veces mas grande. Esto lo convierte en una opcion atractiva para tareas de generacion de SQL en produccion donde el coste computacional y la latencia son criticos.

El ajuste se realizo sobre 30.000 ejemplos ejecutables de SQLite del dataset gretelai/synthetic_text_to_sql. El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y su formato GGUF lo hace compatible con herramientas de inferencia locales como llama.cpp u Ollama. La fecha de creacion del repositorio es el 29 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct; el modelo base soporta 32.768 tokens, aunque no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | GGUF Q8_0 (unico formato publicado) |
| Idiomas soportados | no disponible (el entrenamiento se realizo en ingles para preguntas y SQL) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion Q8_0) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct, un modelo de lenguaje de aproximadamente 1,5 mil millones de parametros. Sobre esta base se aplico un ajuste fino mediante LoRA (Low-Rank Adaptation) utilizando 30.000 ejemplos del dataset gretelai/synthetic_text_to_sql, todos ellos ejecutables en SQLite. El objetivo del entrenamiento fue especializar el modelo en la traduccion de preguntas en ingles a consultas SQL, manteniendo el formato de prompt especifico: un mensaje de sistema que solicita una unica consulta SQLite seguido de un mensaje de usuario con el esquema (`CREATE TABLE ...`) y la pregunta.

No se proporcionan detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla del origen, ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal es el propio proceso de ajuste fino con LoRA sobre un modelo compacto, que logra superar en precision de ejecucion a modelos significativamente mas grandes en la tarea especifica de text-to-SQL. El autor reporta una precision de ejecucion del 69,5% en 499 preguntas de test retenidas, frente al 55,1% del modelo base y el 61,3% de Qwen2.5-Coder-7B-Instruct, usando el mismo prompt y decodificacion greedy.

## Capacidades

- Generacion de consultas SQLite a partir de preguntas en lenguaje natural y un esquema de base de datos proporcionado.
- Especializacion en text-to-SQL con alta precision de ejecucion (69,5% en el conjunto de test reportado).
- Formato de prompt definido: mensaje de sistema solicitando una unica consulta SQLite, seguido de usuario con `Schema:\n<CREATE TABLE ...>\n\nQuestion: <question>`.
- Capacidad de razonamiento sobre esquemas de tablas y relaciones para construir consultas correctas.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el entrenamiento y evaluacion se realizaron en ingles.
- Al estar basado en Qwen2.5-Coder-1.5B-Instruct, hereda las capacidades generales de generacion de texto y codigo del modelo base, aunque el ajuste fino esta orientado a SQL.

## Casos de uso

- Asistente de consultas en bases de datos SQLite: integrado en una aplicacion que reciba preguntas de usuario en ingles y un esquema de base de datos, el modelo genera la consulta SQL correspondiente para su ejecucion directa. Su alta precision (69,5%) y bajo tamano lo hacen adecuado para entornos con recursos limitados.
- Generacion de SQL en herramientas de BI (business intelligence): los analistas pueden escribir preguntas en lenguaje natural y obtener consultas SQLite listas para ejecutar, reduciendo la curva de aprendizaje de SQL y acelerando la exploracion de datos.
- Automatizacion de informes y extraccion de datos: en pipelines de datos, el modelo puede transformar solicitudes textuales en consultas SQL para extraer metricas o subconjuntos de datos de forma programatica, con latencia baja gracias a sus 1,5B de parametros.
- Prototipado rapido de interfaces de consulta: desarrolladores que construyen chatbots o asistentes sobre bases de datos SQLite pueden desplegar este modelo en local con llama.cpp u Ollama, sin necesidad de GPUs de gama alta, para validar flujos de text-to-SQL.
- Educacion y formacion en SQL: el modelo puede servir como herramienta de aprendizaje que muestra la consulta SQL equivalente a una pregunta, permitiendo a estudiantes comparar y entender la traduccion.
- Despliegue en entornos edge o con restricciones de privacidad: al ser un modelo pequeno en formato GGUF Q8_0 (aproximadamente 1,6 GB), puede ejecutarse en dispositivos con poca memoria y sin conexion a internet, manteniendo los datos sensibles en local.
- Integracion en asistentes de codigo o IDE: como complemento para autocompletar o sugerir consultas SQLite a partir de descripciones en lenguaje natural dentro de editores o notebooks.

## Benchmarks y rendimiento

Los unicos datos de benchmarks proporcionados por el autor son los de precision de ejecucion en 499 preguntas de test retenidas, con el mismo prompt y decodificacion greedy:

| Modelo | Precision de ejecucion |
|---|---|
| Qwen2.5-Coder-1.5B-Instruct (base) | 55,1% |
| tiny-sql 1.5B (este modelo) | 69,5% |
| Qwen2.5-Coder-7B-Instruct | 61,3% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado en GGUF Q8_0, el modelo ocupa aproximadamente 1,6 GB en disco. La VRAM necesaria para inferencia ronda los 2-3 GB, dependiendo del backend y del contexto utilizado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo. Se recomiendan GPUs consumer como NVIDIA RTX 3060, RTX 4060, RTX 4090, o incluso GPUs integradas con suficiente memoria compartida.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM. Tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. No se menciona soporte explicito para vLLM o TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano reducido (1,5B parametros) y la cuantizacion Q8_0, se espera una latencia baja en GPUs consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision text-to-SQL (test 499) | Licencia | Formato |
|---|---|---|---|---|---|
| tiny-sql 1.5B (este modelo) | 1,5B | no disponible | 69,5% | Apache 2.0 | GGUF Q8_0 |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | no disponible | 55,1% | Apache 2.0 | safetensors, GGUF (no confirmado) |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible | 61,3% | Apache 2.0 | safetensors, GGUF (no confirmado) |

La comparativa se limita a los modelos reportados por el autor. No se dispone de datos de otros modelos especializados en text-to-SQL en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en SQLite y en preguntas en ingles; no se garantiza su rendimiento en otros dialectos SQL (PostgreSQL, MySQL, etc.) ni en otros idiomas.
- La precision de ejecucion reportada es del 69,5%, lo que implica que aproximadamente 3 de cada 10 consultas generadas pueden ser incorrectas o no ejecutables; es necesario validar las consultas antes de usarlas en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar columnas, tablas o funciones inexistentes en el esquema proporcionado, especialmente con esquemas complejos o preguntas ambiguas.
- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse sobre un dataset sintetico (gretelai/synthetic_text_to_sql), puede reflejar los sesgos y limitaciones de dicho dataset.
- Limitaciones de contexto: no se especifica la longitud maxima de contexto soportada; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens, pero no se confirma que el ajuste fino preserve esta capacidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y distribucion, siempre que se incluya el aviso de licencia y se atribuya la autoria. No hay restricciones adicionales conocidas.
- Caveat para produccion: el modelo se distribuye unicamente en cuantizacion Q8_0; no se ofrecen otras cuantizaciones (Q4, Q5, etc.) que podrian reducir aun mas los requisitos de memoria. Ademas, el repositorio tiene solo 58 descargas y 0 likes, lo que indica una validacion limitada por parte de la comunidad.
- El prompt debe seguir el formato exacto especificado (mensaje de sistema + usuario con `Schema:` y `Question:`); desviarse de este formato puede degradar el rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/islao2/tiny-sql-GGUF
- Demo: https://huggingface.co/spaces/islao2/tiny-sql
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
