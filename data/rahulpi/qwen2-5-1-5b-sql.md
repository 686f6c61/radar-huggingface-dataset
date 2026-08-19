# RahulPi/qwen2.5-1.5B-sql

## Resumen

El modelo `RahulPi/qwen2.5-1.5B-sql` es un ajuste fino (fine-tune) del modelo `Qwen/Qwen2.5-1.5B-Instruct` especializado en la tarea de text-to-SQL: traducir preguntas en lenguaje natural a consultas SQL válidas a partir de un esquema de base de datos. Desarrollado por RahulPi, el modelo se entrenó con QLoRA sobre un subconjunto de 1.000 ejemplos del dataset `b-mc2/sql-create-context` y se distribuye en precisión fp16 con licencia Apache 2.0.

Con 1.543.714.304 parámetros (1.54B), es un modelo compacto y eficiente, adecuado para entornos con recursos limitados. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para tareas de generación de SQL en inglés, aprovechando la base instructiva de Qwen2.5 que ya incorpora capacidades de razonamiento y seguimiento de instrucciones. El modelo está diseñado para usarse con un formato de prompt específico que incluye el esquema de la base de datos y la pregunta del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32K tokens; el fine-tune se entrenó con secuencias de hasta 2048 tokens) |
| Tipos de cuantizacion | fp16 (distribución); entrenado con 4-bit NormalFloat4 (QLoRA) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer denso decoder-only de la serie Qwen2.5. La serie Qwen2.5 se preentrenó con hasta 18 billones de tokens e incorpora mejoras en razonamiento, codificación y comprensión multilingüe, aunque este fine-tune se limita al inglés. Sobre esta base, se aplicó QLoRA (Low-Rank Adaptation) con los siguientes parámetros: r=16, alpha=32, dropout=0.05, dirigido a los módulos de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`. El entrenamiento se realizó con el `SFTTrainer` de TRL, con una tasa de aprendizaje de 2e-4, scheduler coseno, batch efectivo de 16 (4 por dispositivo con 4 pasos de acumulación de gradiente), optimizador `paged_adamw_32bit`, longitud máxima de secuencia de 2048 tokens y 3 épocas (189 pasos globales). El modelo base se cargó en 4-bit durante el entrenamiento y posteriormente se fusionaron los adaptadores y se convirtió a fp16 para su distribución.

El dataset de entrenamiento, `b-mc2/sql-create-context`, combina esquemas de tablas con preguntas en lenguaje natural y sus correspondientes consultas SQL correctas. El formato de prompt utilizado es:

```text
System: You are a strict SQL assistant. Output ONLY valid SQL queries.
User: Schema: <context/schema> Question: <natural_language_question>
Assistant: <sql_query>
```

## Capacidades

- Generación de consultas SQL válidas a partir de esquemas de bases de datos y preguntas en lenguaje natural.
- Comprensión de esquemas relacionales (tablas, columnas, tipos de datos) y traducción a sentencias SQL como `SELECT`, `JOIN`, `WHERE`, `GROUP BY`, etc.
- Sigue instrucciones estrictas: el prompt de sistema indica que solo debe generar SQL, sin explicaciones adicionales.
- Capacidad de razonamiento básico sobre los datos del esquema (por ejemplo, filtrar por condiciones, contar registros, agregaciones).
- Soporte de conversación de un solo turno (no diseñado para diálogos multi-turno complejos).
- Multilingüe limitado: entrenado exclusivamente en inglés, aunque el modelo base Qwen2.5 tiene capacidades multilingües, el fine-tune no las explota.

## Casos de uso

- Asistente de consultas para bases de datos internas: un desarrollador o analista puede escribir una pregunta en inglés y obtener una consulta SQL lista para ejecutar, reduciendo el tiempo de redacción manual de queries.
- Generación de informes automatizados: integrar el modelo en pipelines que reciban preguntas en lenguaje natural y generen SQL para extraer métricas de un data warehouse.
- Herramientas de BI con interfaz conversacional: añadir una capa de lenguaje natural a plataformas de business intelligence para que usuarios no técnicos consulten datos.
- Educación y formación en SQL: los estudiantes pueden practicar traduciendo preguntas a SQL y comparar con las respuestas del modelo.
- Prototipado rápido de consultas: durante el desarrollo de aplicaciones con bases de datos, el modelo puede sugerir consultas iniciales que luego se ajustan manualmente.
- Automatización de QA de bases de datos: generar consultas de prueba a partir de especificaciones en lenguaje natural para verificar la lógica de las tablas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. Los únicos datos de rendimiento provienen del entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 0.7238 |
| Precisión media de tokens | 85.97% |
| Tiempo de entrenamiento | ~1707 segundos (28.5 minutos en NVIDIA T4) |

Estos valores indican que el modelo aprendió a generar SQL con alta fidelidad sobre el subconjunto de entrenamiento, pero no hay evidencia de generalización a conjuntos de datos más amplios.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3 GB (1.54B parámetros × 2 bytes), más overhead de activaciones y caché KV, lo que puede requerir entre 4 y 6 GB según la longitud de la secuencia.
- GPU recomendadas: tarjetas consumer con al menos 6 GB de VRAM, como NVIDIA RTX 2060, RTX 3060, RTX 4060, o GPUs de datacenter como T4, L4, A10G.
- El modelo cabe en GPUs consumer modernas (RTX 30/40 series) y también puede ejecutarse en CPU con cuantización adicional (aunque no se proporcionan pesos GGUF).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, Text Generation Inference (TGI) y otros servidores de inferencia que soporten el formato safetensors.
- Latencia estimada: en una GPU T4, la generación de una consulta SQL de ~50 tokens debería tardar menos de 1 segundo; en GPUs más potentes (A100, H100) la latencia es aún menor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| RahulPi/qwen2.5-1.5B-sql | 1.54B | No disponible (base 32K) | Text-to-SQL (fine-tune) | Apache 2.0 |
| Qwen/Qwen2.5-1.5B-Instruct | 1.54B | 32K | Instruct general | Apache 2.0 |
| sqlcoder-7b (ejemplo) | 7B | 4K | Text-to-SQL | CC BY-SA 4.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. El modelo de RahulPi se diferencia del base por su especialización en SQL, mientras que modelos más grandes como sqlcoder-7b pueden ofrecer mayor precisión en esquemas complejos a costa de mayor consumo de recursos.

## Limitaciones y advertencias

- Entrenado únicamente con 1.000 ejemplos, lo que limita su capacidad de generalización a esquemas de bases de datos muy diversos o complejos.
- Solo soporta inglés; las preguntas en otros idiomas pueden producir resultados incorrectos o inconsistentes.
- Riesgo de alucinación: puede generar SQL sintácticamente válido pero semánticamente incorrecto si el esquema no está bien descrito o la pregunta es ambigua.
- La ventana de contexto efectiva durante el entrenamiento fue de 2048 tokens, por lo que esquemas muy largos o preguntas extensas pueden truncarse.
- No soporta tool calling general ni agentes multi-paso; está diseñado exclusivamente para la tarea de text-to-SQL.
- El formato de prompt es rígido; si se usa fuera de él, el rendimiento puede degradarse notablemente.
- No se han realizado evaluaciones de sesgos o robustez; el modelo podría reflejar sesgos presentes en el dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RahulPi/qwen2.5-1.5B-sql
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Página de Qwen2.5-1.5B (base): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio GitHub de la serie Qwen2.5: https://github.com/mx4ai/qwen2.5
- Ficha en Ollama: https://ollama.com/library/qwen2.5:1.5b
- Ficha en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-1.5B
