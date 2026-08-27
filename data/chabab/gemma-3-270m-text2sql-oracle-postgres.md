# chabab/gemma-3-270m-text2sql-oracle-postgres

## Resumen

`chabab/gemma-3-270m-text2sql-oracle-postgres` es un ajuste fino (fine-tune) del modelo base `google/gemma-3-270m-it` desarrollado por el usuario chabab. Su propósito es convertir un esquema de base de datos y una pregunta en lenguaje natural en una única sentencia SQL correcta para el dialecto especificado, ya sea Oracle o PostgreSQL, sin cercas de markdown ni comentarios adicionales. Con aproximadamente 268 millones de parámetros, está diseñado para ejecutarse en CPU y cuantiza a unos 290 MB, lo que lo hace accesible para entornos con recursos limitados.

El modelo resuelve el problema de la generación de SQL específico por dialecto, un reto habitual en asistentes de datos y herramientas de inteligencia empresarial. Su relevancia actual radica en que ofrece una alternativa ligera, de código abierto (Apache 2.0) y entrenada con un dataset especializado, frente a modelos de mayor tamaño que requieren infraestructura más potente. La arquitectura es un transformer decoder-only basado en Gemma-3, con una longitud de contexto de entrenamiento de 1024 tokens, aunque el modelo base soporta hasta 32k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) |
| Parametros totales | 268.098.176 (~268M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (longitud maxima de entrenamiento; el base soporta 32k) |
| Tipos de cuantizacion | GGUF disponible en repo separado (~290 MB); tambien bf16 |
| Idiomas soportados | No disponible (el dataset y los ejemplos estan en ingles; el base Gemma-3 soporta multiples idiomas) |
| Licencia | Apache 2.0 (hereda los terminos de uso de Gemma) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Gemma-3, con 268 millones de parámetros. Se realizó un ajuste fino completo (full-parameter SFT, sin LoRA) utilizando el framework TRL `SFTTrainer` sobre el dataset `chabab/text2sql-oracle-postgres`, que contiene 684 ejemplos de entrenamiento, 60 de validación y 60 de prueba. El entrenamiento se ejecutó durante 5 épocas con un tamaño de lote efectivo de 16 (4 × 4 acumulación de gradientes), una tasa de aprendizaje de 5e-5 con programación coseno y 10 pasos de calentamiento, y una longitud máxima de secuencia de 1024 tokens, todo en precisión bf16. El proceso duró aproximadamente 10 minutos en una GPU L4.

Una innovación destacable es la especialización en dos dialectos SQL (Oracle y PostgreSQL) con una salida limpia, sin markdown ni comentarios, lo que facilita la integración directa en pipelines. Además, la model card advierte que se debe usar `attn_implementation="eager"` para evitar la generación de tokens repetidos degenerados que ocurren con la ruta SDPA por defecto en algunas configuraciones.

## Capacidades

- Generación de sentencias SQL correctas para Oracle y PostgreSQL a partir de un esquema de base de datos y una pregunta en lenguaje natural.
- Salida sin cercas de markdown ni comentarios, lista para ejecución directa.
- Soporte de system prompt para especificar el dialecto objetivo (Oracle o PostgreSQL).
- Manejo de consultas de dificultad variable (fácil, media, difícil) según los datos de evaluación.
- No dispone de tool calling, capacidades de agente, visión ni audio; es un modelo especializado exclusivamente en text-to-SQL.
- Capacidad multilingüe no documentada; los ejemplos de entrenamiento están en inglés.

## Casos de uso

- Asistente de consultas para analistas de datos: un analista puede formular preguntas en lenguaje natural sobre un esquema conocido y obtener la sentencia SQL correspondiente para Oracle o PostgreSQL, acelerando la exploración de datos.
- Generación automatizada de informes: integrar el modelo en un pipeline que reciba peticiones en texto y genere consultas SQL para extraer métricas de una base de datos, reduciendo la intervención manual.
- Chatbot de soporte interno para equipos de datos: desplegado en un canal de comunicación, responde a preguntas frecuentes sobre esquemas específicos (por ejemplo, ventas, inventario) generando la consulta adecuada.
- Herramientas de inteligencia empresarial con interfaz en lenguaje natural: traducir preguntas de usuarios no técnicos a SQL para alimentar dashboards y reportes en tiempo real.
- Educación y formación en SQL: generar ejemplos de consultas correctas para estudiantes que practican con bases de datos Oracle o PostgreSQL, mostrando la sintaxis adecuada.
- Prototipado rápido de consultas en desarrollo: los desarrolladores pueden obtener un borrador de consulta SQL a partir de una descripción funcional y luego refinarlo, ahorrando tiempo en la fase inicial.
- Migración o comparación de dialectos: aunque el modelo genera en un solo dialecto por petición, puede usarse para entender diferencias sintácticas entre Oracle y PostgreSQL generando consultas equivalentes en cada dialecto.

## Benchmarks y rendimiento

La model card reporta resultados sobre un split de prueba reservado de 60 ejemplos, con decodificación greedy y coincidencia exacta normalizada contra el SQL de referencia:

| Slice | Exact match |
|---|---|
| **Overall** | **78,3%** (47/60) |
| Oracle | 86,7% (39/45) |
| PostgreSQL | 53,3% (8/15) |
| easy | 93,3% (14/15) |
| medium | 69,2% (27/39) |
| hard | 100% (6/6) |

Caveats importantes: el split de prueba está sesgado hacia Oracle (45 ejemplos frente a 15 de PostgreSQL), por lo que la cifra de PostgreSQL tiene un margen de error amplio. La coincidencia exacta es estricta; varios "fallos" son SQL válido que difiere del dorado (por ejemplo, un `LIMIT` adicional o un predicado equivalente), por lo que la precisión semántica real es superior al 78,3%. El error genuino más común es la fuga de dialecto: emitir `LIKE` donde PostgreSQL usa `ILIKE`. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: en bf16, los pesos ocupan aproximadamente 536 MB (268M × 2 bytes), más overhead de activaciones; en cuantización GGUF (~290 MB) cabe en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: cualquier GPU moderna con 2 GB o más, incluidas tarjetas de gama baja como GTX 1650 o integradas; el entrenamiento se realizó en una L4, pero la inferencia es viable en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) incluso con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM, Text Generation Inference (TGI) y transformers estándar.
- Latencia y throughput: no disponibles en la documentación, pero al ser un modelo de 268M parámetros, la generación de una sentencia SQL (menos de 256 tokens) debería completarse en decenas de milisegundos en GPU y en menos de un segundo en CPU moderna.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros modelos text-to-SQL. Como referencia, se puede comparar con el modelo base `google/gemma-3-270m-it` (sin ajuste fino) y con alternativas de mayor tamaño como `defog/sqlcoder-7b` o `CodeLlama-7B` especializados en SQL, aunque estos últimos requieren más recursos. La siguiente tabla resume diferencias estructurales:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| chabab/gemma-3-270m-text2sql-oracle-postgres | 268M | 1024 (entrenamiento) | Apache 2.0 | Text-to-SQL Oracle/PostgreSQL |
| google/gemma-3-270m-it (base) | 268M | 32k | Gemma Terms | Chat general |
| defog/sqlcoder-7b | 7B | 4096 | CC BY-SA 4.0 | Text-to-SQL general |

No hay datos de rendimiento comparativo entre estos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado con los 7 esquemas presentes en el dataset de entrenamiento (hr, sales, banking, inventory, tickets, university, logistics); la generalización a esquemas no vistos no está probada.
- Puede generar SQL sintácticamente válido pero semánticamente incorrecto, como referenciar tablas equivocadas o malinterpretar la intención de la pregunta; se observaron dos fallos de este tipo en la evaluación.
- Existe riesgo de fuga de dialecto, especialmente el uso de `LIKE` en lugar de `ILIKE` para PostgreSQL, lo que afecta a la coincidencia de patrones sin distinción de mayúsculas.
- El SQL generado no se valida contra una base de datos en vivo; se recomienda revisar la salida antes de ejecutarla y nunca usarla con permisos de escritura en producción.
- La longitud de contexto de entrenamiento es de 1024 tokens, por lo que esquemas muy extensos o preguntas largas pueden superar este límite.
- El rendimiento en PostgreSQL es notablemente inferior al de Oracle (53,3% frente a 86,7% de exact match), con un margen de error amplio debido al reducido número de ejemplos de prueba.
- La licencia Apache 2.0 hereda los términos de uso de Gemma de Google, que pueden imponer restricciones adicionales para ciertos usos comerciales; se debe revisar la documentación oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chabab/gemma-3-270m-text2sql-oracle-postgres
- Repo GGUF cuantizado: https://huggingface.co/chabab/gemma-3-270m-text2sql-oracle-postgres-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/chabab/text2sql-oracle-postgres
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Implementación de Gemma-3 270M (referencia): https://github.com/p1kalys/Gemma-3-270M
- Despliegue en FriendliAI: https://friendli.ai/models/chabab/gemma-3-270m-it-text2sql
- Repositorio relacionado text2sql-gemma-3-270m: https://github.com/magiskboy/text2sql-gemma-3-270m
