# EuricoGVP/Qwen3.5-4B_text2sql

## Resumen

Qwen3.5-4B Text-to-SQL es un ajuste fino del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario EuricoGVP, especializado en la generación de consultas SQL para SQLite a partir de un esquema de base de datos, una pista opcional y una pregunta en lenguaje natural. El modelo conserva la arquitectura del base (transformer causal con codificador de visión y atención híbrida Gated DeltaNet / Gated Attention) y se distribuye con licencia Apache-2.0.

El ajuste se realizó mediante LoRA con Unsloth (rango 16, alpha 16, una época, precisión bf16), fusionando después el adaptador en los pesos finales, de modo que no requiere PEFT para cargarse. El entrenamiento se apoya en 17.132 ejemplos procedentes de BIRD, Spider, SynSQL-2.5M y llmsql-benchmark, con una longitud máxima de entrenamiento de 4.096 tokens y evaluación a 8.192 tokens de contexto.

Su relevancia actual radica en que mejora de forma medible al modelo base en dos de los benchmarks de referencia de text-to-SQL: +8,54 puntos de exactitud de ejecución en BIRD dev con esquema plano (46,22 → 54,76) y +4,74 puntos en Spider dev (77,08 → 81,82), con reducción drástica de errores de ejecución en BIRD (de 246 a 80). Es una opción compacta (4B parámetros) para integrar generación de SQL en pipelines de datos sin depender de modelos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; layout híbrido 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 4.539.265.536 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenamiento: 4.096 tokens; evaluación: 8.192 tokens; contexto máximo del base: no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors; compatible con cuantización estándar de transformers/vLLM, pero el autor no enumera formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers; adaptador LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer causal con codificador de visión y una disposición híbrida de capas que alterna bloques de Gated DeltaNet (atención lineal con estado recurrente) y Gated Attention clásica, con dimensión oculta de 2560 y 32 capas. El ajuste fino se aplicó exclusivamente al modelo de lenguaje; el codificador de visión no se modificó. La técnica empleada fue LoRA con Unsloth (rango 16, alpha 16), una época, precisión bf16 y longitud máxima de 4.096 tokens, con el adaptador posteriormente fusionado en los pesos.

El corpus de entrenamiento suma 17.132 ejemplos: 5.980 de BIRD train (CC BY-SA 4.0), 8.097 de Spider train excluyendo la base `formula_1` por solapamiento con BIRD dev (CC BY-SA 4.0), 2.105 de un subconjunto de SynSQL-2.5M centrado en contexto largo y nombres que requieren comillas (Apache-2.0) y 950 de un subconjunto de llmsql-benchmark con columnas que requieren comillas (MIT). No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre pares pregunta-esquema-SQL.

## Capacidades

- Generación de una única consulta SQLite a partir de un esquema de base de datos, una pregunta en lenguaje natural y una pista opcional.
- Acepta dos variantes de entrada: esquema plano y esquema con descripciones de columnas (esta última mejora la exactitud en BIRD).
- Manejo de nombres de tabla y columna que requieren comillas, gracias a los subconjuntos específicos de SynSQL-2.5M y llmsql-benchmark.
- Capacidad de contexto largo para esquemas extensos (evaluado a 8.192 tokens).
- Conserva el codificador de visión del modelo base (etiqueta `image-text-to-text`), aunque el ajuste no lo modifica y la tarea objetivo es text-to-SQL.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para producir una sola consulta por petición.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de consultas para analistas de negocio: el modelo traduce preguntas en inglés a SQLite sobre un esquema dado, lo que permite a perfiles no técnicos consultar bases de datos sin escribir SQL. Su exactitud del 54,76 % en BIRD dev con esquema plano lo hace adecuado como primera propuesta que el analista revisa.
- Generación de SQL en pipelines de datos: integrado vía transformers o vLLM, puede generar consultas en lote a partir de catálogos de esquemas, reduciendo el trabajo manual en tareas repetitivas de reporting.
- Enriquecimiento de herramientas de BI: con la variante de esquema con descripciones de columnas (56,19 % EX en BIRD dev), encaja en asistentes que disponen de metadatos semánticos de las tablas y necesitan explotarlos.
- Prototipado rápido de interfaces de consulta: al ser un modelo de 4B con pesos de aproximadamente 9 GB, se puede desplegar en una sola GPU para demos internas de chat sobre bases SQLite.
- Educación y formación en SQL: el modelo puede servir para generar ejemplos de consultas correctas sobre esquemas didácticos, dado su rendimiento del 81,82 % EX en Spider dev, un benchmark de consultas más sencillas.
- Preprocesado en sistemas de agentes: puede actuar como subcomponente especializado que convierte la intención del usuario en SQL antes de que un agente mayor ejecute y valide la consulta, aprovechando la reducción de errores de ejecución observada en BIRD.

## Benchmarks y rendimiento

Resultados de exactitud de ejecución (EX, en porcentaje) declarados por el autor, comparados con el modelo base Qwen/Qwen3.5-4B usando los mismos prompts. BIRD dev: 1.534 preguntas sobre 11 bases de datos. Spider dev: 1.034 preguntas sobre 20 bases de datos.

| Benchmark | Base | Este modelo | Solo este modelo acierta | Solo el base acierta | McNemar p |
|---|---:|---:|---:|---:|---:|
| BIRD dev, esquema plano | 46,22 | 54,76 | 230 | 99 | 3,75e-13 |
| BIRD dev, esquema con descripciones | 46,28 | 56,19 | 245 | 93 | 6,34e-17 |
| Spider dev | 77,08 | 81,82 | 95 | 46 | 4,49e-05 |

Desglose por dificultad en BIRD dev:

| Métrica | Base plano | Este modelo plano | Base desc | Este modelo desc |
|---|---:|---:|---:|---:|
| Simple | 54,49 | 61,08 | 53,19 | 62,27 |
| Moderate | 35,56 | 47,20 | 37,93 | 48,28 |
| Challenging | 27,59 | 38,62 | 28,97 | 42,76 |
| Errores de ejecución | 246 | 80 | 223 | 76 |

En Spider dev los errores de ejecución pasaron de 26 en el base a 28 en este modelo. Los resultados están marcados como no verificados (`verified: false`) en el model-index.

## Requisitos de hardware

- Pesos en bf16 de aproximadamente 9 GB según la model card (el repositorio ocupa 18,4 GB, probablemente por duplicación de artefactos y notebooks).
- VRAM estimada para inferencia en bf16: en torno a 10-12 GB incluyendo caché KV para contextos moderados; con cuantización de 8 bits bajaría a unos 6-7 GB y en 4 bits a unos 4-5 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue en producción con concurrencia; RTX 4090 o RTX 3090 para uso individual en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: Hugging Face Transformers (formato nativo) y vLLM, ambos citados explícitamente por el autor como compatibles. Soporte de llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EX BIRD dev | EX Spider dev | Licencia |
|---|---|---:|---:|---:|---|
| Qwen3.5-4B Text-to-SQL (este) | 4B | 8.192 (evaluado) | 54,76 (plano) / 56,19 (desc) | 81,82 | Apache-2.0 |
| Qwen3.5-0.8B Text-to-SQL | 0,8B | no disponible | no disponible | no disponible | Apache-2.0 |
| Qwen3.5-2B Text-to-SQL | 2B | no disponible | no disponible | no disponible | Apache-2.0 |
| Qwen3.5-9B Text-to-SQL | 9B | no disponible | no disponible | no disponible | Apache-2.0 |

Los modelos hermanos de la misma colección no publican resultados de benchmarks en la información disponible, por lo que no es posible comparar su rendimiento. No se dispone de datos de otras alternativas externas de text-to-SQL en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo genera SQL para SQLite; no se ha validado para otros dialectos (PostgreSQL, MySQL, etc.).
- El idioma soportado es únicamente el inglés, tanto en preguntas como en esquemas.
- La exactitud en BIRD dev es del 54,76 % con esquema plano, lo que implica que casi la mitad de las consultas generadas serán incorrectas en escenarios complejos; el desglose muestra un rendimiento especialmente bajo en preguntas de dificultad "challenging" (38,62 %).
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos como referencia en producción.
- Riesgo de alucinación de tablas o columnas inexistentes, mitigado parcialmente por la reducción de errores de ejecución observada, pero no eliminado.
- El ajuste se realizó en una sola época con 17.132 ejemplos; el modelo puede sobreajustar a los estilos de BIRD y Spider y generalizar peor en esquemas muy distintos.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento BIRD y Spider son CC BY-SA 4.0, lo que puede imponer obligaciones adicionales sobre los datos derivados según la jurisdicción.
- El codificador de visión se mantiene pero no se ha ajustado; no debe asumirse buen rendimiento en tareas que combinen imagen y SQL.
- No se documentan evaluaciones de sesgo ni de robustez frente a prompts adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuricoGVP/Qwen3.5-4B_text2sql
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección Qwen3.5 Text-to-SQL: https://huggingface.co/collections/EuricoGVP/qwen35-text2sql
- Modelo hermano 0.8B: https://huggingface.co/EuricoGVP/Qwen3.5-0.8B_text2sql
- Modelo hermano 2B: https://huggingface.co/EuricoGVP/Qwen3.5-2B_text2sql
- Modelo hermano 9B: https://huggingface.co/EuricoGVP/Qwen3.5-9B_text2sql
- Variante específica para BIRD: https://huggingface.co/EuricoGVP/Qwen3.5-4b_text2sql-bird
- Notebooks de entrenamiento y benchmarks: https://huggingface.co/EuricoGVP/Qwen3.5-4B_text2sql/tree/main/notebooks
- Dataset BIRD train: https://huggingface.co/datasets/EuricoGVP/birdsql_complete_trainset
- Dataset Spider train: https://huggingface.co/datasets/EuricoGVP/spider_sql_complete
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset llmsql-benchmark: https://huggingface.co/datasets/llmsql-bench/llmsql-benchmark
