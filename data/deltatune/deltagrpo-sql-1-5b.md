# DeltaTune/DeltaGRPO-SQL-1.5B

## Resumen

DeltaGRPO-SQL-1.5B es un adaptador LoRA publicado por DeltaTune Lab que convierte el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct en un especialista en text-to-SQL para SQLite. El adaptador se ha entrenado con aprendizaje por refuerzo (GRPO, Group Relative Policy Optimization) usando recompensas basadas en la ejecución real de las consultas generadas contra la base de datos, en lugar de depender únicamente de supervisión sobre pares pregunta-SQL. El resultado es un incremento medible en la tasa de acierto exacto y en la validez ejecutable del SQL producido.

El modelo resuelve un problema concreto: la generación de consultas SQL correctas y ejecutables a partir de un esquema de base de datos con filas de ejemplo y una pregunta en lenguaje natural. Al ser un adaptador sobre un modelo de 1.5B parámetros, ofrece una huella de memoria reducida y puede desplegarse en hardware modesto, lo que lo hace atractivo para pipelines de analítica interna, asistentes de bases de datos o entornos con restricciones de recursos.

La relevancia actual del modelo radica en que, según la model card, iguala el rendimiento de un modelo de 7B de la misma familia sin entrenar (72,4 % de exact match en el mismo conjunto de preguntas) con una quinta parte del tamaño. El adaptador se distribuye bajo licencia Apache 2.0 y está orientado exclusivamente al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 1.5B en el modelo base; el adaptador LoRA añade un conjunto reducido de parámetros (tamaño del repo: 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.5B parámetros especializado en código. El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que optimiza la política del modelo comparando grupos de respuestas generadas para una misma pregunta. La innovación clave es que la recompensa se basa en la ejecución real de las consultas SQL contra SQLite, lo que penaliza el SQL sintácticamente válido pero semánticamente incorrecto y premia las consultas que devuelven el resultado esperado.

El conjunto de datos de entrenamiento es gretelai/synthetic_text_to_sql. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases adicionales de SFT o DPO antes del GRPO. El modelo espera un system prompt concreto y responde con un formato estructurado `<reasoning>…</reasoning><sql>…</sql>`, lo que separa el razonamiento intermedio de la consulta final.

## Capacidades

- Generación de consultas SQLite a partir de un esquema de base de datos (sentencias CREATE TABLE / INSERT) y una pregunta en lenguaje natural.
- Razonamiento intermedio explícito mediante el bloque `<reasoning>`, que precede a la consulta final en `<sql>`.
- Producción de SQL ejecutable: la model card reporta un 97,0 % de SQL válido ejecutable en el conjunto de evaluación.
- Formato de salida consistente: 99,9 % de tasa de formato correcto en la evaluación reportada.
- Especialización en SQLite; no se documentan capacidades para otros dialectos SQL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo recibe el esquema de una base SQLite con filas de ejemplo y una pregunta en lenguaje natural, y devuelve una consulta SELECT ejecutable, lo que reduce el tiempo de escritura manual de SQL en equipos de analítica.
- Generación automática de informes: integrado en un pipeline que recibe preguntas de negocio y las traduce a SQL contra una base SQLite de reporting, aprovechando la alta tasa de SQL válido (97,0 %) para minimizar errores en ejecución.
- Herramienta interna de autoservicio de datos: los usuarios no técnicos formulan preguntas en inglés y el modelo genera la consulta, con el bloque `<reasoning>` como traza auditable del proceso.
- Evaluación y test de esquemas: el modelo puede generar consultas de comprobación sobre tablas y columnas concretas para validar que un esquema soporta las preguntas esperadas antes de desplegar una base de datos.
- Componente de un agente de bases de datos: al devolver SQL estructurado y ejecutable, puede encadenarse con un ejecutor de consultas y un formateador de resultados en un flujo multi-paso, aunque el soporte de agentes no está documentado explícitamente.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.5B, cabe en GPUs de consumo y permite servir text-to-SQL en local o en el edge sin depender de APIs externas.
- Generación de datos sintéticos de entrenamiento: las consultas generadas y validadas por ejecución pueden servir como pares de entrenamiento para modelos mayores o para aumentar el dataset gretelai/synthetic_text_to_sql.

## Benchmarks y rendimiento

Evaluación basada en ejecución sobre 1.000 preguntas reservadas de `gretelai/synthetic_text_to_sql`, decodificación greedy, mismo prompt y ajustes para ambos modelos. Δ en puntos porcentuales con intervalo de confianza bootstrap pareado del 95 %.

| Metrica | Qwen2.5-Coder-1.5B-Instruct | DeltaGRPO-SQL-1.5B | Δ (pp) | IC 95% |
|---|---|---|---|---|
| Exact match | 63,3 | 72,8 | +9,5 | [+7,0, +12,0] |
| Result F1 | 64,7 | 75,1 | +10,4 | [+7,8, +12,9] |
| SQL válido (ejecutable) | 91,9 | 97,0 | +5,1 | [+3,4, +6,9] |
| Tasa de formato | 99,9 | 99,9 | +0,0 | [-0,3, +0,3] |

Según la model card, el adaptador de 1.5B iguala al modelo de 7B de la misma familia sin entrenar (72,4 % de exact match en las mismas preguntas) con una quinta parte del tamaño. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia, un modelo de 1.5B en precisión completa (FP16) requiere aproximadamente 3 GB solo para los pesos, más memoria para el adaptador LoRA y el contexto; en cuantización de 4 bits podría situarse por debajo de 1,5 GB, aunque estos valores no están confirmados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, así como para GPUs de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (1.5B) y del adaptador (0,2 GB), aunque no se documentan requisitos exactos.
- Opciones de despliegue: la model card muestra carga mediante `peft.PeftModel` + `transformers` con `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA, requeriría fusionarse con el modelo base o cargarse como adaptador en el servidor de inferencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exact match (text-to-SQL SQLite) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaGRPO-SQL-1.5B | 1.5B (base) + LoRA | no disponible | 72,8 | apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-Coder-1.5B-Instruct (base sin entrenar) | 1.5B | no disponible | 63,3 | apache-2.0 | Hugging Face |
| Modelo de 7B de la misma familia sin entrenar (referenciado en la model card) | 7B | no disponible | 72,4 | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de text-to-SQL en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en SQLite; no se documenta su comportamiento en otros dialectos (PostgreSQL, MySQL, etc.).
- Solo soporta inglés (`language: en`); las preguntas en otros idiomas no están cubiertas.
- Es un adaptador LoRA, no un modelo completo: requiere cargar el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct, lo que añade dependencia y pasos de despliegue.
- El formato de salida es rígido (`<reasoning>` + `<sql>`); desviarse del system prompt documentado puede degradar la calidad de las respuestas.
- Riesgo de alucinación: aunque la tasa de SQL válido es del 97,0 %, un 3 % de consultas no son ejecutables y el exact match es del 72,8 %, por lo que un 27,2 % de consultas no devuelven el resultado exacto esperado.
- Los benchmarks reportados provienen del propio autor y de un único conjunto de evaluación sintético (gretelai/synthetic_text_to_sql); no hay validación independiente disponible.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Coder-1.5B-Instruct, que también se distribuye bajo Apache 2.0 según la información disponible.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeltaTune/DeltaGRPO-SQL-1.5B
- Perfil del autor en Hugging Face: https://huggingface.co/DeltaTune
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Resultados por pregunta y ids de train/eval: carpeta `eval/` del repositorio en Hugging Face (https://huggingface.co/DeltaTune/DeltaGRPO-SQL-1.5B/tree/main/eval)
