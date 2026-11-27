# dwicahyom16/qwen2.5-coder-3b-text2sql-qlora

## Resumen

El modelo `dwicahyom16/qwen2.5-coder-3b-text2sql-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre `Qwen2.5-Coder-3B-Instruct` en cuantización de 4 bits, especializado en la tarea de text-to-SQL: convertir una pregunta en lenguaje natural junto con un esquema `CREATE TABLE` en una única consulta SQL en dialecto SQLite. Lo desarrolla el usuario de Hugging Face dwicahyom16 y se publica como adaptador PEFT (no como modelo completo), por lo que requiere cargar el modelo base para su uso.

El problema que resuelve es acotado pero muy práctico: la traducción automática de preguntas de negocio a SQL sobre esquemas relacionales, una tarea clásica en entornos de analítica y asistentes de bases de datos. El adaptador se ha afinado sobre un subconjunto de 5.000 ejemplos del dataset `b-mc2/sql-create-context` (derivado de WikiSQL y Spider), con una mejora sustancial frente al modelo base en métricas de coincidencia exacta y de ejecución (de 49,7% a 75,3% en exact match normalizado y de 46,6% a 86,2% en execution match sobre datos sintéticos).

Su relevancia actual radica en que demuestra que un modelo pequeño (3B parámetros) con un ajuste fino ligero y económico (QLoRA con Unsloth, una sola época, 313 pasos) puede alcanzar un rendimiento competitivo en text-to-SQL dentro de un dominio controlado, lo que lo hace viable para despliegues en hardware modesto. No obstante, se trata de un experimento académico con un único entrenamiento y sin ablaciones, y sus métricas proceden de datos sintéticos, no de una base de datos real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA añade un subconjunto de parámetros entrenables (r=16, alpha=16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_length` usado en entrenamiento); el modelo base soporta más, pero el adaptador se entrenó a 512 |
| Tipos de cuantizacion | 4 bits (bnb-4bit) en el modelo base; el adaptador se publica en safetensors |
| Idiomas soportados | Inglés (declarado en la model card); otros idiomas pueden ser menos precisos |
| Licencia | "other" (sigue los términos del modelo base Qwen2.5-Coder-3B-Instruct; el dataset es CC-BY-4.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de 3.000 millones de parámetros especializado en código, cargado en cuantización de 4 bits mediante bitsandbytes. Sobre él se aplica un ajuste QLoRA con la librería Unsloth: rango LoRA r=16, alpha=16, aplicado a todas las proyecciones de atención y MLP, tasa de aprendizaje 2e-4 con scheduler coseno y warmup del 5%, batch efectivo de 16, una sola época y longitud máxima de secuencia de 512 tokens. La pérdida se calcula únicamente sobre la respuesta SQL, no sobre el prompt.

Los datos de entrenamiento proceden de `b-mc2/sql-create-context` (CC-BY-4.0, construido a partir de WikiSQL y Spider, con 78.577 ejemplos en total). Se utilizó un subconjunto de 5.000 ejemplos para entrenamiento, 200 para validación y 300 para test, con partición por esquema para evitar que un mismo esquema aparezca en más de un split (lo que reduce el riesgo de fuga de datos). El entrenamiento constó de 313 pasos, con una pérdida final de 0,0305 en entrenamiento y 0,0436 en validación. No se realizaron ablaciones ni múltiples ejecuciones.

## Capacidades

- Generación de consultas SQL en dialecto SQLite a partir de una pregunta en lenguaje natural y un esquema `CREATE TABLE`.
- Formato de salida restringido a SQL (sin explicaciones ni texto adicional), lo que facilita el parseo y la integración en pipelines.
- Manejo de consultas simples, agregaciones y, en menor medida, joins (con solo 4 ejemplos de test para esta categoría).
- Comprensión de esquemas relacionales expresados en DDL.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; el adaptador está orientado exclusivamente a text-to-SQL.
- Capacidad multilingüe limitada: entrenado solo con preguntas en inglés.

## Casos de uso

- Asistente de analítica para usuarios no técnicos: el modelo traduce preguntas de negocio ("¿cuántos pedidos se hicieron en marzo?") a SQL ejecutable sobre un esquema dado, permitiendo que usuarios sin conocimientos de SQL consulten bases de datos mediante una interfaz conversacional.
- Generación de consultas en herramientas de BI: integrado como componente de un sistema que recibe el esquema de la base de datos y la pregunta del usuario y devuelve la consulta para su ejecución en un motor SQLite o compatible.
- Prototipado rápido de interfaces de consulta: gracias a su tamaño (3B en 4 bits) puede desplegarse en una GPU de consumo para demos y pruebas de concepto de asistentes de datos.
- Automatización de informes internos: generación de consultas recurrentes sobre esquemas conocidos y estables, con revisión humana previa a la ejecución en producción.
- Educación y formación en SQL: el modelo puede servir como generador de ejemplos de consultas a partir de enunciados, útil en entornos docentes para ilustrar traducciones de lenguaje natural a SQL.
- Preprocesado en pipelines de datos: generación de consultas de extracción o filtrado sobre tablas sintéticas o de staging antes de procesos ETL, siempre con validación y guardarraíles (solo SELECT, límites de filas y tiempo).

## Benchmarks y rendimiento

Resultados publicados en la model card (300 ejemplos de test, datos sintéticos en SQLite):

| Metrica | Baseline (antes del ajuste) | Fine-tuned (QLoRA) |
|---|---|---|
| Ejemplos de test | 300 | 300 |
| Exact match (normalizado) | 49,7% | 75,3% |
| Execution match (datos sintéticos) | 46,6% | 86,2% |
| Execution match (gold no vacío) | 45,6% | 86,7% |
| Tasa de error de ejecución de predicciones | 4,0% | 0,0% |

Desglose por complejidad (execution match):

| Categoria | Baseline (n) | Fine-tuned (n) |
|---|---|---|
| simple | 44,2% (217) | 86,1% (217) |
| aggregation | 50,6% (79) | 87,0% (79) |
| join | 100,0% (4) | 75,0% (4) |
| nested | - | - |

El autor advierte que parte de la diferencia entre baseline y modelo ajustado proviene de convenciones del dataset (valores de cadena en minúsculas, comillas dobles) y que la evaluación se realizó sobre datos sintéticos, no sobre una base de datos real. La categoría join cuenta con solo 4 ejemplos, por lo que su resultado no es estadísticamente significativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 1,9 GB (tamaño del repo); con el adaptador y overhead de inferencia, se estima un uso de VRAM en torno a 3-5 GB, aunque esta cifra no está publicada oficialmente y debe considerarse una estimación.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en 4 bits; una RTX 3060, RTX 4060, RTX 4090 o superior son suficientes. Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en cuantización de 4 bits.
- Opciones de despliegue: la model card indica el uso con Unsloth (`FastLanguageModel`); al ser un adaptador PEFT, puede cargarse con la librería `peft` y `transformers`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI, y al ser un adaptador LoRA sobre un modelo cuantizado en 4 bits, su integración con esos motores requeriría pasos adicionales no descritos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dwicahyom16/qwen2.5-coder-3b-text2sql-qlora | 3B (adaptador LoRA) | 512 tokens (entrenamiento) | Text-to-SQL (SQLite) | other (según modelo base) | Hugging Face |
| Qwen2.5-Coder-3B-Instruct (base) | 3B | Mayor que 512 (no especificado aquí) | Código general | Qwen (según página del modelo base) | Hugging Face |
| Alternativas text-to-SQL de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; la única comparación disponible es contra el propio modelo base antes del ajuste (ver sección de benchmarks).

## Limitaciones y advertencias

- Entrenado únicamente con preguntas en inglés; el rendimiento en otros idiomas puede degradarse notablemente.
- Puede generar SQL incorrecto o ineficiente; es imprescindible revisar las consultas antes de ejecutarlas sobre datos importantes.
- No debe ejecutarse el SQL generado directamente en una base de datos de producción sin guardarraíles: restringir a SELECT, modo de solo lectura, límites de filas y de tiempo.
- El ajuste se realizó sobre un subconjunto pequeño (5.000 ejemplos) y con una sola ejecución, sin ablaciones, lo que limita la fiabilidad de las conclusiones sobre qué componentes contribuyen al rendimiento.
- Las métricas se obtuvieron sobre datos sintéticos y no sobre una base de datos real; parte de la mejora frente al baseline se atribuye a convenciones del dataset.
- La categoría join solo cuenta con 4 ejemplos de test, por lo que su resultado (75,0%) no es representativo.
- La licencia es "other" y remite a los términos del modelo base Qwen2.5-Coder-3B-Instruct; debe verificarse antes de cualquier uso comercial. El dataset es CC-BY-4.0 y requiere atribución.
- Al ser un adaptador PEFT, no es un modelo autónomo: requiere cargar el modelo base `unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit` y respetar la plantilla de prompt de entrenamiento (mensaje de sistema, sección `### Schema`, sección `### Question`).
- Riesgo de alucinación en la generación de columnas o tablas inexistentes en el esquema; no se documentan evaluaciones específicas de este fenómeno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dwicahyom16/qwen2.5-coder-3b-text2sql-qlora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Repositorio del proyecto (referenciado en la model card como `src/prompt_utils.py`): no disponible como URL
- Paper o blog del autor: no disponible
