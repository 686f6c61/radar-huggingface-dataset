# leeroy-jankins/sqllm

## Resumen

`leeroy-jankins/sqllm` es una cuantización GGUF del modelo `PipableAI/pip-sql-1.3b`, un modelo de lenguaje especializado en la generación de consultas SQL a partir de esquemas de base de datos y preguntas en lenguaje natural. Con solo 1.346.471.936 parámetros (1,3B), el modelo base fue destilado a partir de la arquitectura DeepSeek y entrenado sobre el dataset `PipableAI/pip-txt-to-sql-spider-bird-dataset`, que combina los benchmarks Spider y BIRD. Su relevancia radica en que ofrece un rendimiento competitivo frente a modelos mucho mayores (incluido GPT-3.5) en la generación de SQL, con un coste computacional significativamente menor.

El modelo está diseñado para ser desplegado en entornos con recursos limitados, como GPUs de consumo, y es compatible con el ecosistema `transformers` y con `llama.cpp` gracias a su formato cuantizado. Su licencia Apache 2.0 permite uso comercial sin restricciones. Aunque el repositorio original no publica resultados de benchmarks en la model card más allá de la tabla de Spider, los datos disponibles indican que supera a alternativas como `sqlcoder-7b-2` en las categorías easy y medium.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en DeepSeek, no especificada) |
| Parámetros totales | 1.346.471.936 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (cuantizado con llama.cpp, tipos exactos no especificados) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors (según repo) |

## Arquitectura y entrenamiento

El modelo `pip-sql-1.3b` está basado en la arquitectura DeepSeek, aunque no se especifican detalles exactos de configuración (número de capas, heads, etc.). Según la model card, el entrenamiento fue un proceso de destilación que combinó softmax cross entropy con una forma modificada de policy gradient y Q-loss, optimizado en un esquema de Expectation-Maximization (EM). Esto sugiere un enfoque híbrido de aprendizaje supervisado y refuerzo para mejorar la precisión en la generación de SQL.

El dataset de entrenamiento, `PipableAI/pip-txt-to-sql-spider-bird-dataset`, contiene pares de esquemas, preguntas y consultas SQL de los benchmarks Spider y BIRD, que son los estándares de facto para evaluar modelos Text-to-SQL. No se han publicado datos sobre el número de tokens de entrenamiento ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de consultas SQL correctas a partir de un esquema de base de datos (CREATE TABLE) y una pregunta en lenguaje natural.
- Soporte de instrucciones mediante el formato `<schema>`, `<question>` y `<sql>`.
- Entendimiento de esquemas complejos con múltiples tablas, tipos de datos y relaciones.
- Generación de consultas con joins, subqueries, agregaciones y funciones de ventana.
- Capacidades multilingües limitadas: el modelo está entrenado exclusivamente en inglés.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-step más allá de la generación de SQL.

## Casos de uso

- **Análisis de datos en bases de datos relacionales**: el modelo puede traducir preguntas de negocio en consultas SQL directamente, facilitando el trabajo de analistas sin conocimientos avanzados de SQL.
- **Asistentes de BI y dashboards**: integrado en herramientas de business intelligence para permitir consultas en lenguaje natural sobre datos de ventas, inventario, etc.
- **Generación de SQL en pipelines de ETL**: dado un esquema de staging, el modelo puede generar consultas de transformación de datos.
- **QA sobre datos en aplicaciones web**: conectado a una base de datos, puede responder preguntas de los usuarios generando SQL en tiempo real.
- **Formación y aprendizaje**: como herramienta educativa para enseñar SQL, mostrando la consulta generada a partir de una pregunta.
- **Auditoría de consultas**: puede comparar consultas SQL generadas por humanos con el resultado esperado, ayudando a detectar errores lógicos.

## Benchmarks y rendimiento

Los resultados de la model card en el benchmark Spider (evaluado con Test Suite SQL Eval) se muestran a continuación. Los datos para `pipSQL-1.3b` (el modelo base) se presentan junto a otros modelos:

| Modelo | Easy | Medium | Hard | Extra |
|---|---|---|---|---|
| sqlcoder-7b-2 | 72,0 | 58,0 | 40,6 | 37,3 |
| **pipSQL-1.3b** | **78,5** | **57,5** | **42,1** | **28,3** |
| pipSQL-7b | 63,0 | 40,0 | 30,2 | 25,0 |
| sqlcoder-7b | 60,6 | 48,2 | 28,3 | 20,4 |
| gpt-3.5 | 58,8 | 44,7 | 31,0 | 28,4 |

No se han publicado resultados detallados del benchmark de Defog SQL-Eval en la información disponible; la model card solo incluye una imagen sin datos numéricos. La cuantización GGUF no altera los resultados de forma significativa, pero no hay benchmarks específicos para esta versión cuantizada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 1,3B parámetros en formato GGUF cuantizado, el modelo puede ejecutarse en menos de 2 GB de VRAM (por ejemplo, una cuantización Q4_K_S ocupa aproximadamente 0,8-1 GB). En formato fp16, ocupa unos 2,7 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para la versión cuantizada. Para fp16, se recomienda al menos 4-6 GB.
- **Cabe en consumer GPU**: sí, incluso en GPUs de portátil o tarjetas de gama baja.
- **Opciones de despliegue**: `transformers` (PyTorch, Flax) para los pesos safetensors; `llama.cpp` y `Ollama` para el formato GGUF. También es compatible con `text-generation-inference` (TGI).
- **Latencia y throughput**: no disponible. En una GPU como RTX 3090, se espera una latencia de generación de SQL de alrededor de 1-2 segundos para consultas de 100-200 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| **sqllm (pip-sql-1.3b)** | 1,3B | No disponible | Apache 2.0 | Open source |
| sqlcoder-7b-2 | 7B | 4K | Apache 2.0 | Open source |
| sqlcoder-7b | 7B | 4K | Apache 2.0 | Open source |
| pipSQL-7b | 7B | No disponible | Apache 2.0 | Open source |

En la tabla de benchmarks de Spider, `pip-sql-1.3b` supera a `sqlcoder-7b-2` en las categorías easy, medium y hard, y solo es inferior en la categoría extra. Esto demuestra que el modelo de 1.3B es competitivo con alternativas de 7B, lo que lo hace especialmente atractivo para despliegues en entornos con recursos limitados.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta inglés. No se recomienda su uso con preguntas en otros idiomas sin un pipeline de traducción previo.
- **Alucinación en SQL**: puede generar consultas sintácticamente válidas pero lógicamente incorrectas, especialmente en esquemas complejos con muchos joins o subqueries.
- **Dependencia del esquema**: el modelo requiere que el esquema se proporcione en el prompt en formato `CREATE TABLE`; esquemas no estándar o con tipos de datos poco comunes pueden degradar el rendimiento.
- **Contexto limitado**: no se ha publicado la longitud de contexto máxima; se recomienda mantener el esquema y la pregunta dentro de límites razonables (por ejemplo, menos de 1000 tokens).
- **Riesgo de sobreajuste al dataset**: aunque destaca en Spider y BIRD, el rendimiento en esquemas reales puede variar.
- **Cuantización**: la versión GGUF puede presentar una ligera pérdida de precisión respecto al modelo original en fp16, aunque en la práctica suele ser mínima.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/leeroy-jankins/sqllm)
- [Modelo base PipableAI/pip-sql-1.3b](https://huggingface.co/PipableAI/pip-sql-1.3b)
- [Dataset de entrenamiento PipableAI/pip-txt-to-sql-spider-bird-dataset](https://huggingface.co/datasets/PipableAI/pip-txt-to-sql-spider-bird-dataset)
- [Test Suite SQL Eval (benchmark de Spider)](https://github.com/taoyds/test-suite-sql-eval)
- [Defog SQL-Eval (benchmark)](https://github.com/defog-ai/sql-eval)
- [Repositorio Boo (framework del autor)](https://github.com/is-leeroy-jenkins/Boo)
- [Repositorio Foo (framework del autor)](https://github.com/is-leeroy-jenkins/Foo)
- [LLM Leaderboard 2026](https://llm-stats.com/leaderboards/llm-leaderboard)
