# cameronervin1/qwen2.5-0.5b-sql-lora

## Resumen

`cameronervin1/qwen2.5-0.5b-sql-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` de Alibaba Qwen. Su proposito es convertir un modelo generalista de 0,5 mil millones de parametros en un generador especializado de consultas SQLite a partir de un esquema de base de datos (`CREATE TABLE`) y una pregunta en lenguaje natural. El adaptador ha sido desarrollado por el usuario cameronervin1 y publicado bajo licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque de eficiencia: en lugar de entrenar un modelo desde cero, se aplica un ajuste fino de bajo rango (r=16, alpha=32) sobre las proyecciones de atencion y MLP, anadiendo solo 8,8 millones de parametros entrenables (1,75% del total del modelo base). Esto permite obtener una mejora sustancial en exactitud para la tarea text-to-SQL con un coste computacional minimo, lo que lo hace adecuado para entornos con recursos limitados o para prototipado rapido.

El adaptador se entreno durante una sola epoca sobre 10.000 filas del dataset `b-mc2/sql-create-context`, un corpus de pares esquema-pregunta-consulta SQL. Los resultados reportados por el autor muestran un incremento del exact match del 41,4% (modelo base) al 69,0% (base + LoRA) en 500 preguntas de validacion, con una tasa de ejecucion correcta en SQLite del 97,2%. El repositorio tiene un tamano de 0,0 GB, lo que refleja que solo contiene los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre proyecciones de atencion y MLP |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) + 8,8 millones entrenables en el adaptador (1,75%) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma en la model card del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (la model card no especifica; el modelo base Qwen2.5 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0,5 mil millones de parametros. La configuracion LoRA utiliza rango r=16, alpha=32 y se aplica a todas las proyecciones de atencion y MLP del modelo base. Esto anade 8,8 millones de parametros entrenables, lo que representa el 1,75% del total. El entrenamiento se realizo durante 1 epoca sobre 10.000 filas del dataset `b-mc2/sql-create-context`, que contiene pares de esquema de base de datos, pregunta en lenguaje natural y consulta SQL de referencia.

No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La innovacion principal es el propio enfoque de ajuste fino parametrizado eficiente (PEFT) para una tarea vertical concreta, que permite especializar un modelo pequeno con un coste de entrenamiento muy bajo. El adaptador se distribuye como un modulo PEFT que debe cargarse junto con el modelo base mediante la libreria `peft` de HuggingFace.

## Capacidades

- Generacion de consultas SQLite a partir de un esquema (`CREATE TABLE`) y una pregunta en lenguaje natural.
- Formato de salida restringido: el prompt de sistema indica que devuelva solo la consulta SQL, sin explicaciones.
- Especializacion en text-to-SQL para SQLite (no se especifican otros dialectos SQL).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada (heredadas del modelo base Qwen2.5, que es multilingue, pero no confirmadas para esta tarea).
- Razonamiento general y codigo: limitado al modelo base de 0,5B; el adaptador esta orientado exclusivamente a la tarea SQL.

## Casos de uso

- Generacion de consultas SQLite en asistentes de analisis de datos: el adaptador recibe un esquema de tabla y una pregunta en lenguaje natural y devuelve una consulta ejecutable, lo que permite a usuarios no tecnicos consultar bases de datos sin escribir SQL manualmente.
- Prototipado rapido de interfaces text-to-SQL: gracias a su tamano reducido (0,5B + 8,8M de parametros), se puede desplegar en entornos de desarrollo con recursos limitados para validar flujos de consulta antes de invertir en modelos mayores.
- Integracion en pipelines de CI/CD para validacion de esquemas: el modelo puede generar consultas de prueba a partir de esquemas versionados y verificar que se ejecutan correctamente en SQLite, detectando cambios de esquema que rompan consultas existentes.
- Educacion y formacion en SQL: el modelo puede servir como herramienta de ensenanza que traduce preguntas a consultas, permitiendo a estudiantes comparar su propia solucion con la generada.
- Automatizacion de informes sobre bases de datos SQLite embebidas: en aplicaciones de escritorio o moviles que usan SQLite, el adaptador puede generar consultas bajo demanda para construir informes dinamicos sin un backend de LLM en la nube.
- Chatbots de soporte interno para bases de datos: integrado en un asistente conversacional, el modelo traduce preguntas de empleados ("cuantos clientes se registraron el mes pasado") a consultas SQLite ejecutables, reduciendo la carga del equipo de datos.
- Generacion de consultas en herramientas de BI ligeras: para dashboards que operan sobre SQLite, el adaptador permite anadir una capa de consulta en lenguaje natural con un coste de inferencia muy bajo.

## Benchmarks y rendimiento

Resultados reportados por el autor en 500 preguntas de validacion con decodificacion greedy:

| Modelo | Exact match | Ejecuta en SQLite |
|---|---|---|
| Base (Qwen2.5-0.5B-Instruct) | 41,4% | 92,4% |
| Base + LoRA | 69,0% | 97,2% |

Nota del autor: "Executes" significa que la consulta se ejecuta sin error contra el esquema. El dataset no contiene filas de tablas, por lo que esta metrica no verifica que la respuesta sea correcta, solo que la consulta es sintacticamente valida y ejecutable.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precision FP16 requiere aproximadamente 1 GB de VRAM; en cuantizacion de 4 bits (si se aplica al modelo base) puede reducirse a menos de 1 GB. El adaptador LoRA anade solo 8,8M de parametros, un incremento despreciable.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060 o superior puede ejecutar el modelo sin problemas. Tambien funciona en CPU para inferencia no interactiva.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor), `llama.cpp` (requiere fusionar el adaptador con el modelo base y convertir a GGUF), `Ollama` (previa fusion y conversion), `vLLM` (soportando adaptadores LoRA de forma nativa), `TGI` (con soporte de adaptadores PEFT).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera una latencia baja en GPU consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cameronervin1/qwen2.5-0.5b-sql-lora` | 0,5B + 8,8M (LoRA) | No disponible | Text-to-SQL SQLite (adaptador) | Apache 2.0 | HuggingFace (adaptador PEFT) |
| `Qwen/Qwen2.5-0.5B-Instruct` (base) | 0,5B | 32.768 tokens (segun modelo base) | LLM generalista | Apache 2.0 | HuggingFace |
| `defog/sqlcoder-7b-2` | 7B | 4.096 tokens (tipico) | Text-to-SQL general | No disponible en la informacion | HuggingFace |
| `NumbersStation/nsql-350M` | 350M | No disponible | Text-to-SQL | No disponible en la informacion | HuggingFace |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia cuando estan disponibles.

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en SQLite; no se ha validado para otros dialectos SQL (PostgreSQL, MySQL, etc.).
- El dataset de entrenamiento (`b-mc2/sql-create-context`) no contiene filas de datos, por lo que la metrica de "ejecuta en SQLite" no garantiza que la consulta devuelva la respuesta correcta, solo que es sintacticamente valida.
- El exact match del 69,0% implica que aproximadamente 3 de cada 10 consultas generadas no coinciden exactamente con la referencia, lo que puede requerir validacion o correccion humana en produccion.
- Riesgo de alucinacion: como cualquier LLM, puede generar columnas o tablas inexistentes en el esquema proporcionado, especialmente con esquemas complejos o preguntas ambiguas.
- Sesgos conocidos: no documentados en la informacion proporcionada; heredados potencialmente del modelo base y del dataset de entrenamiento.
- Limitaciones de contexto e idioma: no especificadas en la model card; el modelo base Qwen2.5 es multilingue, pero el adaptador se entreno presumiblemente con el dataset en ingles, lo que puede degradar el rendimiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen2.5-0.5B-Instruct (tambien Apache 2.0) y del dataset utilizado.
- El repositorio tiene 0,0 GB y solo 32 descargas, lo que sugiere un modelo poco validado por la comunidad; se recomienda evaluacion propia antes de usarlo en produccion.
- No se documentan tecnicas de mitigacion de alucinaciones ni validacion automatica de las consultas generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cameronervin1/qwen2.5-0.5b-sql-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Codigo del proyecto: https://github.com/cameronervin/lora-sql
