# Mayank-0Par/tinysql-3b-olist

## Resumen

TinySQL-3B-Olist es un modelo especializado en traducción de lenguaje natural a SQL (text-to-SQL) para PostgreSQL 16, desarrollado por Mayank Parmar (estudiante de B.Tech CSE en Cloud Computing, UPES). Se trata de un ajuste fino mediante QLoRA sobre Qwen2.5-3B-Instruct, orientado específicamente a consultar la base de datos relacional de 9 tablas del dataset público Brazilian E-Commerce (Olist) de Kaggle, que contiene más de 1,5 millones de filas.

El modelo resuelve un problema acotado pero frecuente en entornos de analítica de negocio: convertir preguntas de stakeholders en consultas SQL ejecutables y deterministas contra un esquema fijo, sin ingeniería manual de queries. Su enfoque es deliberadamente conservador: genera únicamente consultas de lectura (`SELECT`), rechaza operaciones destructivas (`DROP`, `DELETE`, `UPDATE`, `INSERT`) y emite `REFUSE` cuando la pregunta se refiere a datos que no existen en el esquema.

Arquitectónicamente hereda el transformer decoder causal de Qwen2.5-3B-Instruct, con RoPE, SwiGLU y Grouped Query Attention (GQA), 3.090 millones de parámetros y una ventana de contexto de 32.768 tokens en el modelo base (el ajuste se entrenó con longitud máxima de 2.048 tokens). El resultado es un adaptador LoRA de pequeño tamaño (repo de 0,2 GB) publicado bajo licencia Apache 2.0, lo que lo hace interesante para prototipado rápido de asistentes de BI sobre bases de datos conocidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con RoPE, SwiGLU y Grouped Query Attention (GQA) |
| Parámetros totales | 3.090 millones (modelo base Qwen2.5-3B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenado con longitud máxima de 2.048 tokens |
| Tipos de cuantización | 4-bit NormalFloat (NF4) para entrenamiento; adaptador LoRA en bfloat16; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) no verificadas para este adaptador |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre Qwen2.5-3B-Instruct) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA del transformer decoder causal Qwen2.5-3B-Instruct. El entrenamiento aplicó cuantización 4-bit NF4 con BitsAndBytes y adaptadores LoRA de rango r=16 y alpha=32 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se utilizó la librería Unsloth junto con el `SFTTrainer` de TRL, con optimizador `adamw_8bit`, learning rate de 2e-4, schedule coseno con 5 pasos de warmup, batch efectivo de 8 (batch por dispositivo 2 × acumulación de gradientes 4) y 3 épocas (60 pasos) sobre una única GPU NVIDIA Tesla T4 de 16 GB en Kaggle. El entrenamiento completo duró 14 minutos y 12 segundos, con una pérdida final de entrenamiento de 0,2984 y de evaluación de 0,1140.

Los datos de entrenamiento consisten en 228 preguntas verificadas (158 de entrenamiento, 30 de desarrollo y 40 de test sellado) generadas sintéticamente con heurísticas de dominio y validadas mediante ejecución real en PostgreSQL 16. Cada ejemplo sigue el formato ChatML con un system prompt unificado que incluye los DDL completos de las 9 tablas (`orders`, `order_items`, `customers`, `products`, `sellers`, `order_payments`, `order_reviews`, `category_translation`, `geolocation`), el mapeo de claves foráneas y definiciones semánticas de métricas (solo pedidos entregados, criterios de desempate). No se documenta uso de RLHF ni DPO; el ajuste es supervisado puro sobre pares pregunta-SQL.

## Capacidades

- Generación de SQL para PostgreSQL 16 a partir de lenguaje natural, incluyendo funciones específicas del dialecto como `EXTRACT(DOW ...)`, `DATE_TRUNC` e `ILIKE`.
- Consultas de agregación de una sola tabla con alta fiabilidad (100% de precisión reportada en el conjunto de evaluación).
- Consultas multi-tabla con joins sobre el esquema de 9 tablas de Olist (75% de precisión con agente de auto-corrección).
- Funciones analíticas y de ventana (66,7% de precisión con agente de auto-corrección).
- Aritmética de fechas y timestamps (66,7% con agente de auto-corrección).
- Generación segura: solo emite sentencias `SELECT` y rechaza DDL/DML destructivo (0 inyecciones SQL inseguras reportadas).
- Rechazo fuera de dominio: emite `REFUSE` cuando la pregunta requiere datos ausentes del esquema (100% de precisión en el conjunto de evaluación).
- Cumplimiento estricto del esquema mediante un system prompt con DDL y mapeo de claves foráneas.
- No dispone de tool calling, capacidades de agente nativas, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de BI para el dataset Olist: un analista formula preguntas en lenguaje natural ("¿cuáles son las 3 categorías de producto con más ingresos entregados?") y el modelo devuelve SQL ejecutable contra el esquema de 9 tablas, con latencia p50 de 185 ms en vLLM sobre T4.
- Generación de informes automatizados sobre e-commerce: el modelo traduce métricas recurrentes (ingresos entregados, plazos de entrega, valoraciones) a queries parametrizables que alimentan dashboards, gracias a las definiciones semánticas incluidas en el system prompt.
- Capa de seguridad en pipelines de datos: al generar exclusivamente `SELECT` y rechazar operaciones destructivas, puede integrarse como primer filtro en un gateway de consultas donde el SQL generado se valida antes de ejecutarse.
- Prototipado de text-to-SQL para esquemas fijos: sirve como plantilla para adaptar Qwen2.5-3B a otras bases de datos mediante QLoRA, dado que el proceso completo se ejecutó en una T4 de 16 GB en 14 minutos.
- Agente de auto-corrección SQL: combinado con un ejecutor que devuelva errores, el modelo mejora su precisión global del 63,3% al 86,7% en el conjunto de evaluación, lo que lo hace adecuado para bucles de refinamiento en producción.
- Demostraciones educativas de fine-tuning eficiente: el repo documenta hiperparámetros, pérdidas y hardware, útil como referencia para cursos o tutoriales sobre QLoRA con Unsloth.
- Atención interna a preguntas fuera de alcance: el comportamiento `REFUSE` permite desplegarlo en interfaces de autoservicio sin riesgo de que alucine datos sobre métricas no presentes (gasto publicitario, márgenes, salarios).

## Benchmarks y rendimiento

Evaluación por *execution accuracy* contra PostgreSQL 16 en vivo con hashing SHA-256 determinista de resultados:

| Categoría | Preguntas | Precisión zero-shot | Precisión con agente auto-corrector |
|---|---:|---:|---:|
| Agregaciones de una tabla | 13 | 100,0% (13/13) | 100,0% (13/13) |
| Precisión de rechazo (no respondibles) | 3 | 100,0% (3/3) | 100,0% (3/3) |
| Aritmética de fechas y timestamps | 3 | 33,3% (1/3) | 66,7% (2/3) |
| Joins multi-tabla | 8 | 25,0% (2/8) | 75,0% (6/8) |
| Funciones analíticas / ventana | 3 | 0,0% (0/3) | 66,7% (2/3) |
| **Global** | **30** | **63,3% (19/30)** | **86,7% (26/30)** |

- Inyecciones SQL inseguras: 0 consultas con tokens DDL/DML prohibidos.
- Latencia en vLLM sobre T4: p50 = 185 ms, p95 = 310 ms.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, Spider, BIRD) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en bfloat16 requiere cargar el modelo base Qwen2.5-3B-Instruct, aproximadamente 6-7 GB en fp16; con cuantización 4-bit del base, en torno a 2-3 GB.
- GPU recomendadas: NVIDIA Tesla T4 (16 GB) validada para entrenamiento e inferencia con vLLM; cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo cuantizado.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, con cuantización 4-bit o 8-bit.
- Opciones de despliegue: vLLM con imagen `vllm/vllm-openai` (documentado por el autor), Transformers + PEFT (documentado), y presumiblemente llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: p50 de 185 ms y p95 de 310 ms por consulta en vLLM sobre T4; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Precisión text-to-SQL |
|---|---|---|---|---|---|
| TinySQL-3B-Olist | 3,09 B | 32.768 (entrenado a 2.048) | Text-to-SQL PostgreSQL sobre esquema Olist | Apache 2.0 | 63,3% zero-shot / 86,7% con agente (30 preguntas) |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 | Modelo generalista | Apache 2.0 | no disponible para este esquema |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32.768 | Generación de código general | Apache 2.0 | no disponible |
| Modelos text-to-SQL especializados tipo SQLCoder o similares | variable | variable | Text-to-SQL genérico | variable | no disponible en la información proporcionada |

La comparación directa con otros modelos text-to-SQL no puede realizarse con rigor porque el autor no publica resultados sobre benchmarks estándar del dominio (Spider, BIRD) y su evaluación se limita a 30 preguntas de un esquema concreto. El modelo base Qwen2.5-3B-Instruct y la variante Coder son las alternativas más próximas por tamaño y licencia, pero no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo está optimizado para el esquema de 9 tablas de Olist y no generaliza a otras bases de datos sin proporcionar el DDL correspondiente o reentrenar adaptadores.
- Especificidad de dialecto: solo garantiza SQL para PostgreSQL 16; la generación de SQLite, MySQL u Oracle no está soportada.
- Conjunto de evaluación muy reducido (30 preguntas), lo que limita la significación estadística de las cifras reportadas.
- Datos de entrenamiento sintéticos generados con heurísticas y validados por ejecución, con un único anotador; posible sesgo hacia los patrones de consulta del generador.
- Rendimiento débil en funciones de ventana (0% zero-shot) y en joins multi-tabla (25% zero-shot), que solo mejoran con un bucle de auto-corrección externo.
- Riesgo de alucinación de columnas o tablas inexistentes si el system prompt no incluye el DDL completo; depende críticamente de la calidad del contexto inyectado.
- Idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Sin soporte de tool calling, agentes nativos ni razonamiento multi-paso interno; el bucle de auto-corrección debe implementarse externamente.
- Repo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Mayank-0Par/tinysql-3b-olist
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset Olist en Kaggle: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
- Unsloth: https://github.com/unslothai/unsloth
- vLLM: https://github.com/vllm-project/vllm
- TRL (SFTTrainer): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
