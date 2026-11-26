# cubehugging/Minnow-SQL-0.5B

## Resumen

Minnow-SQL-0.5B es un modelo de generacion de texto especializado en traduccion de lenguaje natural a SQL (text-to-SQL), desarrollado por el usuario independiente cubehugging. Se trata de un ajuste fino del modelo Qwen2.5-Coder-0.5B-Instruct mediante LoRA sobre el conjunto de entrenamiento de Spider y una porcion de SynSQL-2.5M, con posterior fusion de los adaptadores en un unico modelo. Su proposito es convertir preguntas en ingles plano en consultas SQLite ejecutables a partir del esquema de una base de datos.

El modelo es relevante por su reducido tamano: con 494 millones de parametros (aproximadamente 0,5B), puede ejecutarse en una GPU de portatil o incluso en CPU, lo que lo hace adecuado para entornos con recursos limitados, prototipado rapido y despliegues locales donde no es viable un modelo de mayor escala. La licencia Apache 2.0 facilita su uso comercial.

La arquitectura subyacente corresponde a Qwen2 (transformer decoder-only), heredada del modelo base. El modelo esta especializado exclusivamente en SQLite y en el idioma ingles, y no cubre otros dialectos SQL ni tareas generales de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, aunque no se documentan variantes publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de la familia Qwen2, y se ajusta mediante LoRA sobre el conjunto de entrenamiento de Spider (dataset xlangai/spider) mas una porcion de SynSQL-2.5M. Tras el entrenamiento, los adaptadores LoRA se fusionan en un unico modelo de pesos completos. No se documenta el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset mas alla de las fuentes citadas.

El entrenamiento se orienta a una tarea concreta con un formato de prompt fijo: un mensaje de sistema que define al modelo como experto en SQLite y un mensaje de usuario que incluye los statements CREATE TABLE del esquema y la pregunta, opcionalmente con un bloque de comentario que lista valores de la pregunta encontrados en la base de datos para ayudar a seleccionar columnas y grafias correctas. No se menciona el uso de RLHF o DPO; el ajuste es supervisado sobre pares pregunta-consulta.

## Capacidades

- Generacion de consultas SQLite a partir de una pregunta en ingles y un esquema de base de datos.
- Traduccion text-to-SQL con soporte de un bloque opcional de mapeo de valores para mejorar la seleccion de columnas.
- Generacion de multiples candidatos y seleccion por votacion (15 respuestas) con reparacion posterior de columnas inexistentes, segun el flujo documentado en el repositorio del autor.
- Ejecucion en CPU o GPU de portatil gracias a su reducido tamano.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Asistentes de consulta sobre bases de datos SQLite: el modelo recibe el esquema y una pregunta en ingles y devuelve una consulta ejecutable, lo que permite construir interfaces de lenguaje natural sobre bases de datos locales sin depender de servicios en la nube.
- Herramientas de analitica para pequenos equipos: integrado en un cuaderno o script, permite a usuarios no tecnicos formular preguntas sobre datos almacenados en SQLite y obtener resultados sin escribir SQL manualmente.
- Prototipado rapido de pipelines text-to-SQL: su tamano reducido permite iterar y validar el flujo completo (generacion, ejecucion, votacion y reparacion) en una maquina de desarrollo antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: al caber en CPU o GPU de consumo, es adecuado para aplicaciones de escritorio, dispositivos embebidos o entornos air-gapped donde no se dispone de aceleradores de gran capacidad.
- Educacion y formacion en SQL: puede emplearse como generador de ejemplos de consultas a partir de preguntas, util en entornos docentes para ilustrar la traduccion de intenciones a SQL.
- Automatizacion de informes internos: con el flujo de votacion y reparacion documentado, puede integrarse en scripts que generen y validen consultas de forma automatica sobre bases de datos SQLite de tamano pequeno o medio.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden exactitud de ejecucion (execution accuracy): una consulta se considera correcta cuando devuelve las mismas filas que la consulta de referencia. Las puntuaciones usan el verificador propio del proyecto, no el verificador oficial de Spider.

| Configuracion | Spider dev (1.034) | Spider test (917) |
|---|---:|---:|
| Modelo base, una respuesta | 45,36% | no disponible |
| Este modelo, una respuesta | 62,48% | no disponible |
| Este modelo, 15 respuestas votadas y reparadas | 71,18% | 76,66% |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 494 millones de parametros, en precision FP16 el modelo requiere aproximadamente 1 GB de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits o 4 bits el consumo baja a unos cientos de MB, aunque no se documentan variantes cuantizadas publicadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el modelo puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, asi como en A100 o H100 sin aprovechar su capacidad.
- Caben en consumer GPU: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta endpoints_compatible), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minnow-SQL-0.5B | 494M | no disponible | Text-to-SQL (SQLite) | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct (base) | 0,5B | no disponible | Generacion de codigo general | apache-2.0 | Hugging Face |
| Alternativas text-to-SQL de mayor tamano | no disponible | no disponible | Text-to-SQL | no disponible | no disponible |

La comparacion cuantitativa con otros modelos text-to-SQL no esta disponible en la informacion proporcionada. El unico punto de referencia documentado es el modelo base, sobre el que Minnow-SQL mejora la exactitud de ejecucion en Spider dev de 45,36% a 62,48% con una sola respuesta.

## Limitaciones y advertencias

- Solo soporta SQLite; otros dialectos SQL no fueron entrenados ni probados.
- Las preguntas que requieren dos o mas joins son su punto debil segun el propio autor.
- Capacidad limitada al idioma ingles; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion en nombres de columnas o tablas, mitigado parcialmente por el flujo de votacion y reparacion, pero no eliminado.
- Las puntuaciones publicadas usan el verificador propio del proyecto, no el verificador oficial de Spider, por lo que no son directamente comparables con resultados de terceros.
- No se documentan sesgos conocidos mas alla de los inherentes al dataset Spider y al modelo base.
- Longitud de contexto no documentada, lo que limita la planificacion de esquemas de gran tamano.
- No se documentan variantes cuantizadas oficiales ni soporte verificado en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cubehugging/Minnow-SQL-0.5B
- Repositorio del autor (codigo, scripts y ejecuciones puntuadas): https://github.com/thiscube/Minnow-SQL-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset Spider: https://huggingface.co/datasets/xlangai/spider
