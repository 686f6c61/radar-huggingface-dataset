# ay2r/sqlforge-3b

## Resumen

SQLForge-3B es un modelo especializado en text-to-SQL para SQLite, desarrollado por el usuario ay2r como parte del proyecto SQLForge. Se trata de un fine-tuning con QLoRA del modelo base Qwen/Qwen2.5-Coder-3B-Instruct, que cuenta con 3.085.938.688 parámetros totales. El modelo resuelve el problema de traducir preguntas en lenguaje natural a consultas SQL ejecutables sobre esquemas de bases de datos SQLite, una tarea crítica en interfaces de consulta a bases de datos, asistentes analíticos y automatización de pipelines de datos.

El modelo se entrena exclusivamente sobre datos de Spider y BIRD, los dos benchmarks de referencia en text-to-SQL, y destaca por haber sido entrenado en una única GPU de portátil de 8 GB (RTX 5060 Laptop), lo que demuestra que es posible obtener resultados competitivos con recursos muy limitados. Frente al modelo base, mejora la execution accuracy en Spider dev de 71,8 a 78,5 y en BIRD dev de 41,7 a 53,1.

La relevancia actual del modelo radica en su enfoque práctico: incluye variantes cuantizadas (FP8, GGUF Q8_0, GGUF Q4_K_M, AWQ W4A16) con pérdidas de rendimiento mínimas, un harness de evaluación, servido con vLLM y una capa de guardrails de solo lectura. La licencia Apache 2.0 y el soporte de formatos GGUF lo hacen desplegable en entornos de producción modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning QLoRA sobre Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max length 2.048; prompts > 8k tokens requieren schema linking) |
| Tipos de cuantizacion | bf16, FP8 (vLLM online), GGUF Q8_0, GGUF Q4_K_M, AWQ W4A16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 (los pesos derivan de Qwen2.5-Coder-3B-Instruct; verificar su licencia antes de redistribuir) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de la familia Qwen2, y se adapta mediante QLoRA: base cuantizada en NF4 de 4 bits, LoRA con r=16, α=32, dropout 0,05, aplicado a todas las proyecciones de atención y MLP, lo que supone el 0,96% de los parámetros. La pérdida se calcula únicamente sobre la completitud SQL, no sobre el prompt.

Los datos de entrenamiento son 16.218 ejemplos: 8.140 de Spider train y 8.078 de BIRD train, procedentes de 201 bases de datos. Se descartaron 478 ejemplos de BIRD cuyo SQL gold no se ejecutaba y se excluyó `formula_1` por solapamiento con BIRD dev. No aparecen bases de datos ni preguntas de dev en el entrenamiento, verificado con un chequeo de contaminación. Hiperparámetros: 1 época (1.014 pasos), learning rate 2e-4 con decaimiento coseno, batch efectivo 16, longitud máxima 2.048, paged AdamW de 8 bits y gradient checkpointing. El entrenamiento se completó en 7,2 horas en una RTX 5060 Laptop GPU de 8 GB, con un pico de 3,5 GB de memoria. Se conservó el checkpoint final, que superó en Spider y BIRD completos al checkpoint seleccionado por execution accuracy de validación.

## Capacidades

- Generación de consultas SQL para SQLite a partir de esquemas DDL y preguntas en lenguaje natural.
- Razonamiento sobre esquemas de bases de datos, incluyendo selección de columnas, joins y agregaciones.
- Uso de hints de dominio estilo BIRD para preguntas que requieren conocimiento de valores.
- Formato de prompt específico con system prompt y user message (esquema + pregunta + hint opcional + `### SQL`).
- Generación determinista (greedy) recomendada para reproducibilidad.
- No dispone de tool calling ni function calling documentado.
- No dispone de modo de agentes ni multi-step reasoning nativo; la auto-corrección se implementa externamente en el pipeline del proyecto.
- Capacidades multilingües limitadas al inglés.
- No dispone de visión, audio ni thinking mode.

## Casos de uso

- Asistentes de consulta a bases de datos SQLite: el modelo traduce preguntas de usuario final a SELECT ejecutables, adecuado por su entrenamiento específico en Spider y BIRD y su formato de prompt con DDL y filas de muestra.
- Automatización de informes analíticos: integrado en pipelines que reciben esquemas de producción y generan consultas para extraer métricas, con la capa de guardrails de solo lectura del proyecto para evitar SQL destructivo.
- Interfaces de BI conversacional: permite a analistas no técnicos formular preguntas en inglés sobre tablas SQLite, con la auto-corrección guiada por ejecución elevando la accuracy de 78,5 a 80,5 en Spider y de 53,1 a 54,1 en BIRD.
- Generación de consultas en herramientas de desarrollo: al ser un modelo de 3B desplegable en GPU consumer (GGUF Q4_K_M de 1,8 GB), puede ejecutarse localmente en IDE o CLI para asistir a desarrolladores que trabajan con SQLite.
- Evaluación y benchmarking de pipelines text-to-SQL: sirve como modelo de referencia ligero para comparar harnesses, estrategias de schema linking y técnicas de self-correction.
- Servido de alto throughput con vLLM: el uso de prefix caching aprovecha que las preguntas sobre la misma base comparten el prefijo del esquema, con un throughput 4,7× superior en BIRD, adecuado para despliegues multi-usuario sobre una misma base de datos.
- Prototipado en hardware modesto: entrenado en una GPU de portátil de 8 GB, es adecuado para equipos que quieran reproducir o adaptar el fine-tuning a otros dialectos SQL con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor (execution accuracy, decoding greedy, esquema como DDL más 3 filas de muestra por tabla):

| Modelo | Spider dev EX | BIRD dev EX* |
|---|---|---|
| Qwen2.5-Coder-3B-Instruct (base) | 71,8 | 41,7 |
| SQLForge-3B run 1 (solo Spider) | 78,0 | 43,5 |
| SQLForge-3B (este modelo) | 78,5 | 53,1 |
| + column fix determinista + self-correction guiada por ejecución | 80,5 | 54,1 |

*Subconjunto fijo aleatorio de 500 preguntas de BIRD dev (seed 42); hints de evidencia incluidos en el prompt.

Rendimiento por variante cuantizada:

| Variante | Tamaño | Spider EX | BIRD EX |
|---|---|---|---|
| bf16 | 5,8 GB | 78,5 | 53,1 |
| FP8 (vLLM, online) | pesos 3,2 GB en VRAM | 78,6 | 52,7 |
| GGUF Q8_0 | 3,3 GB | 78,4 | 52,5 |
| GGUF Q4_K_M | 1,8 GB | 76,6 | 52,7 |
| AWQ W4A16 | 2,0 GB | 75,2 | 51,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: bf16 requiere aproximadamente 5,8 GB de pesos; FP8 unos 3,2 GB en VRAM; GGUF Q8_0 3,3 GB; GGUF Q4_K_M 1,8 GB; AWQ W4A16 2,0 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 5060 Laptop (8 GB) fue suficiente para el entrenamiento. Para servido de alto throughput, A100 o H100 con vLLM y FP8.
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más con cuantización GGUF o AWQ; Q4_K_M de 1,8 GB cabe incluso en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (bf16), vLLM (`vllm serve ay2r/sqlforge-3b --quantization fp8 --enable-prefix-caching`), llama.cpp para GGUF, Ollama para GGUF, TGI (tag `text-generation-inference` presente).
- Latencia y throughput: no se publican cifras absolutas de latencia; el autor reporta un throughput 4,7× superior en BIRD gracias a prefix caching con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spider dev EX | BIRD dev EX | Licencia |
|---|---|---|---|---|---|
| SQLForge-3B | 3,09B | no disponible (entrenado a 2.048) | 78,5 | 53,1 | Apache 2.0 |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09B | no disponible | 71,8 | 41,7 | Apache 2.0 |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de otros modelos text-to-SQL de tamaño comparable para una comparación más amplia; la única comparación directa documentada es contra el modelo base.

## Limitaciones y advertencias

- Solo dialecto SQLite: entrenado y evaluado exclusivamente en SQLite; otros dialectos requerirán adaptación.
- Alucinación de nombres de columna: principal modo de fallo restante, con 66 de 1.034 respuestas de Spider dev y 53 de 500 de BIRD afectadas. En Spider la mayoría son casi-aciertos (`pet_type` por `PetType`) corregibles con post-procesado determinista; en BIRD son mayoritariamente inventados.
- Peor rendimiento en preguntas difíciles: solo 36% EX en preguntas "challenging" de BIRD y debilidad en preguntas que requieren conocimiento de valores sin hint.
- Tamaño de esquema: prompts superiores a unos 8k tokens (esquemas muy anchos) requieren schema linking, implementado en el pipeline de servido del proyecto.
- Riesgo de prompt injection: como cualquier LLM, puede ser inducido a emitir SQL destructivo; se observó `DROP TABLE`. Nunca ejecutar su salida sobre una base de datos sin guardrails; el proyecto incluye una capa de guardrails de solo lectura.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Licencia: los pesos derivan de Qwen2.5-Coder-3B-Instruct; verificar su licencia antes de redistribuir. Los datos de entrenamiento (Spider y BIRD) son CC BY-SA 4.0.
- Sin datos de benchmarks verificados: todos los resultados son declarados por el autor (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ay2r/sqlforge-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Spider: https://yale-lily.github.io/spider
- BIRD: https://bird-bench.github.io/
- Repositorio del proyecto SQLForge: no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
