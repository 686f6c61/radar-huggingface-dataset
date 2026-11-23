# ipz235bvv/qwen3-4b-sql-qlora-adapter

## Resumen

El modelo `ipz235bvv/qwen3-4b-sql-qlora-adapter` es un adaptador LoRA (concretamente QLoRA en 4 bits NF4) entrenado sobre el modelo base `Qwen/Qwen3-4B` para la tarea de text-to-SQL. Lo desarrolla Vladyslav Bondar (usuario `ipz235bvv`, Universidad Politécnica Estatal de Zhytomyr, grupo ІПЗ-23-5) y su objetivo es convertir preguntas analíticas en inglés, junto con un esquema relacional en DDL (`CREATE TABLE ...`), en una única consulta SQL limpia y ejecutable, sin bloques markdown ni explicaciones adicionales.

El adaptador es relevante porque demuestra que un ajuste fino ligero (125 pasos, 14,9 minutos en una única Tesla T4) sobre un modelo pequeño de 4B parámetros puede mejorar de forma drástica la precisión exacta en generación de SQL: pasa de un 5,00% a un 69,67% en coincidencia exacta normalizada sobre un conjunto de test aislado de 300 ejemplos. Además, reduce el prompt de sistema necesario de 96 a 18 tokens y elimina prácticamente los artefactos de formato en la salida.

El adaptador ocupa 132,2 MB y entrena solo 33.030.144 parámetros (0,8145% del total del modelo base). Está pensado para motores de solo lectura y pipelines de business intelligence, no para ejecutar DDL ni DML sin validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Qwen3-4B) con adaptador LoRA sobre todas las capas lineales |
| Parámetros totales | 33.030.144 parámetros entrenables en el adaptador (0,8145% del total del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantización | QLoRA 4-bit NF4 con doble cuantización y cómputo en fp16 durante el entrenamiento; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Inglés (preguntas en inglés, SQL generado) |
| Licencia | Apache 2.0 (modelo base); el dataset de entrenamiento es CC-BY-SA-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-4B`, un transformer causal de 4B parámetros. El ajuste fino se realizó con QLoRA: cuantización 4-bit NF4 del modelo base con doble cuantización y cómputo en fp16, y adaptadores LoRA con `r=16`, `lora_alpha=32`, `lora_dropout=0.05` y `target_modules="all-linear"`. Esto da 33.030.144 parámetros entrenables, un 0,8145% del total.

El entrenamiento usó Supervised Fine-Tuning con `TRL SFTTrainer` sobre el dataset `b-mc2/sql-create-context` (construido a partir de WikiSQL y Spider), con un split deduplicado (`seed=42`) de 2.000 ejemplos de entrenamiento, 200 de validación y 300 de test aislado, formateados en ChatML con `enable_thinking=False`. Hiperparámetros: `learning_rate=1e-4`, scheduler coseno, `warmup_steps=10`, batch efectivo 16 (4 × 4), `max_steps=125` (una época), `max_length=512` y `assistant_only_loss=True`. Se entrenó en una NVIDIA Tesla T4 (15,6 GB VRAM) en 14,90 minutos con un pico de memoria GPU de 3,91 GB.

## Capacidades

- Generación de consultas SQL a partir de un esquema DDL y una pregunta en lenguaje natural en inglés.
- Salida limpia: una sola consulta SQL sin bloques markdown, sin explicaciones y sin comentarios adicionales.
- Modo sin razonamiento explícito (`enable_thinking=False`) para reducir latencia y evitar texto intermedio.
- Soporte de plantilla de chat ChatML mediante `apply_chat_template`.
- Integración con el ecosistema PEFT/Hugging Face Transformers para carga del adaptador sobre el modelo base.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No se documentan capacidades de agentes, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Asistentes de business intelligence: el modelo traduce preguntas analíticas en inglés a SQL sobre un esquema dado, lo que permite a usuarios no técnicos consultar bases de datos de solo lectura sin escribir SQL manualmente.
- Generación de consultas en pipelines de analítica: se puede integrar como paso previo a la ejecución contra SQLite o motores ANSI, con validación mediante `EXPLAIN` antes de lanzar la consulta.
- Herramientas de autocompletado SQL en editores: dado el esquema activo y la intención del usuario, el adaptador produce una consulta candidata limpia que el editor puede mostrar o insertar.
- Prototipado rápido de interfaces de consulta en lenguaje natural: el bajo coste de despliegue (adaptador de 132,2 MB sobre un 4B en 4 bits) permite levantarlo en una GPU consumer para demos y pruebas internas.
- Generación de datasets sintéticos de pares pregunta-SQL: el modelo puede producir consultas de referencia sobre esquemas existentes para aumentar corpus de entrenamiento o evaluación.
- Educación y formación en SQL: el modelo sirve como generador de ejemplos de consultas correctas a partir de enunciados, útil en entornos docentes con esquemas controlados.
- Normalización de preguntas a SQL en asistentes conversacionales: con un prompt de sistema corto (18 tokens) se reduce el coste por petición en comparación con el modelo base sin ajustar.

## Benchmarks y rendimiento

Evaluación sobre 300 ejemplos de test aislados, comparando el modelo base `Qwen3-4B` con un prompt de sistema detallado de 96 tokens frente al adaptador QLoRA con un prompt de sistema corto de 18 tokens:

| Métrica | Base Qwen3-4B (prompt 96 tok) | QLoRA ajustado (prompt 18 tok) | Cambio (Δ) |
|---|---|---|---|
| SQL limpio (sin fences ni texto extra), % | 96,67% | 100,00% | +3,33% |
| SQLite válido (`EXPLAIN`), % | 97,67% | 98,67% | +1,00% |
| Coincidencia exacta normalizada, % | 5,00% | 69,67% | +64,67% |
| Coincidencia exacta (insensible a comillas), % | 53,00% | 69,67% | +16,67% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 132,2 MB; el modelo base Qwen3-4B en 4-bit NF4 con doble cuantización requiere aproximadamente entre 3 y 4 GB de VRAM, coherente con el pico de 3,91 GB registrado durante el entrenamiento en una Tesla T4 de 15,6 GB.
- GPU recomendadas: NVIDIA Tesla T4 (validada en entrenamiento), así como A100, H100, L40S o RTX 4090 para mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070 y superiores) usando cuantización 4-bit.
- Opciones de despliegue: `transformers` + `peft` con `BitsAndBytesConfig` (flujo documentado por el autor); también es compatible con servidores que soporten adaptadores PEFT como vLLM o TGI, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo requirió 14,90 minutos en una T4 para 125 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ipz235bvv/qwen3-4b-sql-qlora-adapter` | 4B base + 33,03M adaptador | No disponible | Text-to-SQL (QLoRA sobre Qwen3-4B) | Apache 2.0 (base) / CC-BY-SA-4.0 (dataset) | Hugging Face, PEFT |
| `Qwen/Qwen3-4B` (base sin ajustar) | 4B | No disponible en la información | Modelo generalista | Apache 2.0 | Hugging Face |
| Adaptadores text-to-SQL sobre bases de 7B-13B | 7B-13B típicamente | Variable | Text-to-SQL | Variable | Hugging Face |
| Modelos SQL especializados propietarios | No disponible | No disponible | Text-to-SQL | Propietaria | APIs comerciales |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; los únicos datos comparativos publicados son los del modelo base frente al adaptador en la tabla de benchmarks.

## Limitaciones y advertencias

- Entrenado únicamente con 2.000 ejemplos y una sola época: la cobertura de dialectos SQL y esquemas complejos es limitada.
- El dataset de origen (WikiSQL y Spider) cubre principalmente SQLite y SQL ANSI; no se garantiza corrección en dialectos como PostgreSQL, MySQL, T-SQL u Oracle.
- Solo soporta inglés como idioma de entrada; no se documenta soporte multilingüe.
- Riesgo de alucinación: puede generar columnas o tablas inexistentes si el esquema no está bien delimitado en el prompt.
- Uso fuera de alcance: no debe ejecutarse con privilegios de escritura (`INSERT`, `UPDATE`, `DELETE`, `DROP`) sin validación previa; el autor lo restringe explícitamente a motores de solo lectura.
- El adaptador requiere cargar el modelo base Qwen3-4B; no es un modelo autónomo.
- Licencia del dataset de entrenamiento CC-BY-SA-4.0: conviene revisar implicaciones si se redistribuye el modelo o derivados en contextos comerciales.
- No se documentan sesgos específicos, pero al heredar el modelo base puede reproducir sesgos presentes en los datos de preentrenamiento de Qwen3.
- Sin métricas publicadas de latencia ni throughput en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipz235bvv/qwen3-4b-sql-qlora-adapter
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
