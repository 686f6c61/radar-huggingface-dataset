# enji-hex/Qwen3-1.7b-SQL-GGUF

## Resumen

Qwen3-1.7B-SQL es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3-1.7B de Alibaba, especializado en la generacion de consultas SQL para SQLite a partir de un esquema de base de datos. Lo desarrolla el usuario enji-hex y se distribuye en formato GGUF cuantizado, lo que permite ejecutarlo en hardware modesto mediante llama.cpp o llama-cpp-python. El modelo resuelve el problema concreto de text-to-SQL: dado un esquema y una peticion en lenguaje natural, devuelve SQLite valido y ejecutable.

El ajuste se realizo con QLoRA (r=16) durante 3 epocas usando Unsloth sobre el dataset kristiannordby/function_call_sql. La relevancia actual radica en que un modelo de tan solo 1.720 millones de parametros, cuantizado a Q4_K_M, mejora de forma notable al modelo base en su tarea especifica: pasa de 0/5 a 5/5 en validez sintactica y de 0/5 a 4/5 en coincidencia de ejecucion segun el benchmark propio del autor.

Es un modelo pequeno y de proposito unico, pensado para integrarse en pipelines de generacion de consultas sobre SQLite, no como asistente generalista. La licencia Apache 2.0 facilita su uso comercial, aunque las capacidades declaradas se limitan al ingles y a la generacion de SQL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea n_ctx=4096) |
| Tipos de cuantizacion | GGUF; el benchmark usa Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 1.1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.720 millones de parametros. Sobre esa base se aplico un ajuste fino con QLoRA de rango 16 durante 3 epocas, utilizando la libreria Unsloth para el entrenamiento eficiente. El dataset empleado es kristiannordby/function_call_sql, orientado a la generacion de consultas SQL a partir de esquemas y peticiones en lenguaje natural.

El objetivo del ajuste es que el modelo emita SQLite crudo y valido, evitando los razonamientos intermedios que el modelo base tiende a producir y que rompen la salida. No se documentan en la informacion disponible detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO. Tampoco se especifican innovaciones arquitectonicas adicionales mas alla del ajuste LoRA.

## Capacidades

- Generacion de consultas SQLite a partir de un esquema de base de datos y una peticion en lenguaje natural.
- Salida de SQL crudo y valido, sin texto de razonamiento adicional (segun el benchmark del autor).
- Soporte de conversacion mediante create_chat_completion con mensajes de sistema y usuario.
- Especializacion en SQLite como dialecto objetivo.
- Capacidad de ejecucion en CPU o GPU mediante llama.cpp y llama-cpp-python.
- No se documentan capacidades de tool calling generico, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Multilingue limitado al ingles segun la model card.

## Casos de uso

- Generacion de consultas en aplicaciones de analitica interna: el modelo recibe el esquema de una base SQLite y una pregunta del usuario, y devuelve la consulta lista para ejecutar, reduciendo el trabajo manual de escribir SQL.
- Asistentes de consulta para bases de datos embebidas: en aplicaciones de escritorio o moviles que usan SQLite, el modelo puede traducir peticiones en lenguaje natural a consultas sin depender de un servicio en la nube, gracias a su tamano reducido y formato GGUF.
- Herramientas de BI y paneles de datos: integrado en un backend, permite que usuarios no tecnicos formulen preguntas sobre un esquema conocido y obtengan resultados, con la consulta generada como paso intermedio auditable.
- Automatizacion de tareas de soporte y operaciones: generar consultas de consulta y filtrado sobre tablas de registros (por ejemplo, usuarios, pedidos) a partir de instrucciones en lenguaje natural.
- Prototipado rapido de interfaces text-to-SQL: al ser un modelo pequeno y de licencia Apache 2.0, sirve para validar pipelines de generacion de SQL antes de escalar a modelos mayores.
- Educacion y formacion en SQL: el modelo puede mostrar la consulta SQLite equivalente a una peticion descrita en lenguaje natural, util como apoyo en entornos de aprendizaje.
- Despliegue en entornos con recursos limitados: al caber en hardware de consumo con cuantizacion Q4_K_M, permite ejecutar text-to-SQL en local sin GPU de datacenter.

## Benchmarks y rendimiento

Resultados publicados por el autor en el benchmark propio (check.py), sobre 5 casos:

| Modelo | Validez sintactica (sqlglot) | Coincidencia de ejecucion (SQLite) |
|---|---|---|
| Qwen3-1.7B-Q4_K_M (base) | 0/5 | 0/5 |
| Qwen3-1.7B-Q4_K_M (base con filtro de thinking) | 3/5 | 3/5 |
| Qwen3-1.7B-SQL.Q4_K_M (ajustado) | 5/5 | 4/5 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M, el repo ocupa aproximadamente 1.1 GB, por lo que la inferencia cabe en torno a 1-2 GB de VRAM o RAM, dependiendo del contexto configurado.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM puede ejecutarlo; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en tarjetas como GTX 1650, RTX 3050, RTX 4060 y superiores, o incluso en CPU.
- Opciones de despliegue: llama.cpp, llama-cpp-python (documentado por el autor), y por formato GGUF es compatible con Ollama y otros runners basados en llama.cpp. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-SQL (este) | 1.720 M | no disponible | Text-to-SQL SQLite (GGUF) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1.720 M | no disponible | Modelo generalista | apache-2.0 | Hugging Face |
| Qwen3-1.7B-Q4_K_M con filtro de thinking | 1.720 M | no disponible | Generalista con post-proceso | apache-2.0 | Hugging Face |

La comparativa se limita al modelo base y a su variante con filtro de thinking, ya que no se dispone de datos de otros modelos text-to-SQL especializados en la informacion proporcionada.

## Limitaciones y advertencias

- El benchmark del autor es muy reducido (5 casos), por lo que los resultados no son estadisticamente representativos.
- El modelo esta especializado en SQLite; no se garantiza su correcto funcionamiento con otros dialectos SQL (PostgreSQL, MySQL, etc.).
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: puede generar columnas o tablas inexistentes si el esquema no se proporciona de forma completa y clara.
- La longitud de contexto no esta documentada; el ejemplo de uso emplea n_ctx=4096, por lo que esquemas muy extensos podrian no caber.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene validar la calidad de las consultas generadas antes de ejecutarlas en produccion.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- El modelo tiene pocas descargas (115) y 0 likes en el momento de la consulta, lo que indica una adopcion limitada y poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/enji-hex/Qwen3-1.7b-SQL-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/kristiannordby/function_call_sql
- Unsloth: https://github.com/unslothai/unsloth
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
