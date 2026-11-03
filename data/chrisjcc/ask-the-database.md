# chrisjcc/ask-the-database

## Resumen

AskTheDatabase es un modelo de lenguaje especializado en traducción de lenguaje natural a SQL (text-to-SQL) sobre bases de datos relacionales SQLite, desarrollado por el usuario de HuggingFace chrisjcc. Se trata de un ajuste fino (SFT) del modelo base Qwen2.5-Coder-7B-Instruct, con 7 mil millones de parámetros y una licencia Apache 2.0. El modelo se distribuye en formato safetensors y está entrenado exclusivamente en inglés.

El problema que aborda es la fragilidad de los enfoques de text-to-SQL de un solo paso, que sufren alucinaciones de esquema, fanout de joins y derivas de dialecto cuando se enfrentan a esquemas desconocidos. En lugar de generar una consulta en un único paso voraz, AskTheDatabase se comporta como un agente interactivo que explora el esquema, muestrea registros de tablas, ejecuta consultas de prueba en un sandbox SQLite y se autocorrige ante errores de ejecución.

La relevancia actual del modelo radica en su paradigma de entrenamiento con recompensas verificables (RLVR) y feedback de entorno, así como en su harness de evaluación de presupuesto cero (Zero-Budget Evaluation Harness) con puertas de decisión pre-registradas. El autor reporta una precisión de ejecución del 100% en Spider Dev (1034 muestras), aunque estos resultados deben interpretarse con cautela dado el bajo número de descargas y la ausencia de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-Coder-7B-Instruct, un modelo de 7B parámetros preentrenado para generación de código. Sobre esta base, el autor aplica un ajuste fino supervisado (SFT) bajo la variante denominada `harness_zero`, descrita como "Harness-Zero SFT (Multi-Turn Interactive Exploration)". El paradigma de entrenamiento combina exploración agéntica multi-turno con feedback verificable del entorno: el modelo aprende a intercalar razonamiento con llamadas a herramientas procedurales (`\schema`, `\sample`, `\sql`) y a corregirse a partir de los resultados de ejecución en un sandbox SQLite.

El dataset principal es `chrisjcc/ask-the-database`, y el modelo incorpora tags de reinforcement learning con recompensas verificables (RLVR), evaluación de presupuesto cero (`zero-budget-eval`) y el benchmark Spider. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO más allá del paradigma RLVR mencionado. La innovación técnica destacable es el bucle de autocorrección basado en ejecución real: las consultas candidatas se ejecutan en un sandbox aislado con timeouts inferiores a 2,0 s e inspección del plan de consulta (`EXPLAIN QUERY PLAN`) para rechazar joins cartesianos sin restricciones (`SCAN TABLE ... WITHOUT INDEX`).

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural sobre esquemas relacionales SQLite.
- Exploración autónoma de esquemas mediante la herramienta `\schema [table_name]`, que inspecciona DDL, claves primarias y relaciones de claves foráneas.
- Muestreo de valores categóricos mediante `\sample [table_name] [column_name]` para evitar alucinaciones de valores.
- Ejecución de consultas de prueba mediante `\sql [query]` en un sandbox SQLite en proceso, con inspección de planes de ejecución y captura de errores en tiempo de ejecución.
- Razonamiento multi-turno con intercalado de pensamientos y llamadas a herramientas (tool calling procedural).
- Autocorrección ante errores de ejecución antes de comprometer la consulta final.
- Soporte de conversación multi-turno (tag `conversational`).
- Capacidades de generación de código heredadas del modelo base Qwen2.5-Coder-7B-Instruct (no verificadas específicamente en esta ficha).
- No se reporta soporte de visión, audio ni modo de pensamiento explícito más allá del razonamiento intercalado con herramientas.

## Casos de uso

- Asistente de analítica de autoservicio: un analista formula preguntas de negocio en inglés y el modelo explora el esquema, muestrea valores y devuelve SQL ejecutable contra SQLite, reduciendo la dependencia de conocimiento previo del esquema.
- Generación de SQL en pipelines de datos: integración en flujos ETL donde el modelo traduce especificaciones en lenguaje natural a consultas verificadas mediante ejecución en sandbox antes de comprometerlas.
- Agente de corrección de consultas erróneas: dado un error de ejecución SQL, el modelo inspecciona el plan, ajusta la consulta y reintenta, lo que lo hace adecuado para sistemas de autocorrección en producción.
- Educación y formación en SQL: el modelo explicita el razonamiento y las inspecciones de esquema, lo que permite mostrar al usuario el proceso de construcción de la consulta paso a paso.
- Prototipado rápido sobre bases de datos desconocidas: al poder inspeccionar DDL y muestrear valores, es útil para explorar esquemas heredados o mal documentados sin intervención manual.
- Integración en asistentes conversacionales con acceso a datos: el soporte multi-turno y de tool calling permite construir interfaces de chat que resuelven preguntas analíticas de forma iterativa.
- Evaluación y benchmarking de text-to-SQL: el harness de evaluación de presupuesto cero y las puertas de decisión pre-registradas permiten reutilizar el modelo como referencia en experimentos reproducibles.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Benchmark | Muestras | Execution Accuracy (EX) | Test Suite Accuracy (TS) | Valid Execution Rate (VA) |
|---|---|---|---|---|
| Spider Dev | 1034 | 100,0% | 100,0% | 100,0% |

Puertas de decisión del harness de presupuesto cero (telemetría del clúster del autor):

| Puerta | Métrica | Resultado | Objetivo | Veredicto |
|---|---|---|---|---|
| Gate 1 (Latencia) | Latencia media en 5 pasadas | 0,1268 s (126,80 ms) | ≤ 3,0 s | PASSED |
| Gate 2 (Correlación de rangos) | Spearman ρ vs. Spider Dev | 1,0000 | ρ ≥ 0,88 | PASSED |
| Gate 3 (Resolución diagnóstica) | Atribución / reducción de alucinación | 100,0% / 100,0% (10 → 0 fallos) | no disponible | PASSED |
| Gate 4 (Sensibilidad a mutaciones) | Detección de bugs / tasa de escape | 100,0% / 0,0% | no disponible | PASSED |

Veredicto oficial declarado por el autor: `MVE ADJUDICATION DECISION: GO`. No se han publicado resultados de benchmarks independientes en la información disponible; los datos proceden exclusivamente de la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para un modelo de 7B parámetros en precisión FP16 se requieren aproximadamente 14-16 GB de VRAM, y en cuantización de 4 bits alrededor de 4-6 GB, aunque estas cifras son estimaciones genéricas para modelos de este tamaño y no están confirmadas en la model card.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar compatibilidad con GPUs de consumo como RTX 3090, RTX 4090 o RTX 4080 en cuantización, y con A100/H100 para FP16, pero el autor no lo especifica.
- Cabe en GPU de consumo: no confirmado en la información disponible; por el tamaño del modelo (7B) es plausible en GPUs con 8-24 GB según cuantización.
- Opciones de despliegue: el autor documenta el uso con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) y con un pipeline de alto nivel propio (`ask_the_database.inference.pipeline.TextToSQLPipeline`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta una latencia de 126,80 ms por pasada en su clúster (Gate 1), pero no se especifica el hardware utilizado ni el throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AskTheDatabase (chrisjcc) | 7B | no disponible | Text-to-SQL agéntico con sandbox SQLite | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | no disponible | Generación de código general | Apache 2.0 | HuggingFace |
| Alternativas específicas de text-to-SQL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables de text-to-SQL para establecer una comparación cuantitativa rigurosa. La comparación con el modelo base es estructural (mismo tamaño y licencia), pero no se han publicado métricas del base en Spider Dev en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado exclusivamente en inglés; no se reporta soporte multilingüe.
- Los resultados del 100% en Spider Dev proceden únicamente de la model card del autor, sin validación independiente; deben tratarse con escepticismo dado el bajo número de descargas (0) y likes (1).
- El modelo está especializado en SQLite; el rendimiento en otros dialectos SQL (PostgreSQL, MySQL, etc.) no está documentado y podría degradarse por deriva de dialecto.
- Riesgo de alucinación de esquema y de valores, mitigado por las herramientas `\schema` y `\sample`, pero no eliminado; el propio autor reporta una reducción de 10 a 0 fallos en su entorno controlado, no en producción general.
- El bucle agéntico requiere un sandbox de ejecución con timeouts y control de acceso; ejecutar SQL generado sin aislamiento adecuado supone un riesgo de seguridad.
- No se especifican sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la ausencia de documentación sobre el dataset y el proceso de entrenamiento limita la auditabilidad para entornos regulados.
- No se documentan requisitos de hardware, cuantizaciones soportadas ni longitud de contexto, lo que complica la planificación de despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrisjcc/ask-the-database
- Dataset de entrenamiento: https://huggingface.co/datasets/chrisjcc/ask-the-database
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Benchmark Spider: no disponible enlace directo en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
