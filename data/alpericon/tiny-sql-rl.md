# Alpericon/tiny-sql-rl

## Resumen

tiny-sql-rl es un modelo de generación de texto especializado en text-to-SQL, desarrollado por el usuario independiente Alpericon. Se construye a partir de Qwen3-1.7B mediante un ajuste fino con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos Spider, utilizando una recompensa basada en ejecución: una consulta generada recibe recompensa cuando su resultado coincide con el de la consulta de referencia. El entrenamiento se realizó como QLoRA de 4 bits en una única GPU de portátil de 8 GB (RTX 3070 Ti Laptop), lo que demuestra que es posible obtener mejoras medibles en tareas estructuradas con recursos muy limitados.

El modelo resuelve el problema de traducir preguntas en lenguaje natural a consultas SQL ejecutables, un caso de uso crítico para interfaces de bases de datos conversacionales. Su relevancia radica en que, con solo 1.720 millones de parámetros, supera a modelos del mismo tamaño como Qwen2.5-Coder-1.5B-Instruct en los benchmarks Spider y BIRD, y mejora de forma significativa respecto a su modelo base zero-shot. La arquitectura es la de Qwen3-1.7B (transformer denso), con una longitud de contexto no especificada en la información disponible.

El repositorio incluye el adaptador LoRA, el modelo fusionado en bf16 y una exportación GGUF en Q8_0 para llama.cpp. La licencia es Apache 2.0 y el idioma declarado es inglés. Los resultados publicados se centran en precisión de ejecución (EX) con decodificación greedy y modo thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (fusionado), nf4 (QLoRA), GGUF Q8_0; Q4_K_M no recomendado (rompe el formato de salida) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.720 millones de parámetros. Sobre esta base se aplicó un ajuste fino con GRPO (Group Relative Policy Optimization) utilizando una recompensa de ejecución sobre el dataset Spider (xlangai/spider). La recompensa se otorga cuando el resultado de la consulta generada coincide con el de la consulta de referencia, lo que alinea el entrenamiento con la corrección semántica de la consulta y no solo con su forma superficial. El entrenamiento se realizó como QLoRA de 4 bits en una GPU de 8 GB (RTX 3070 Ti Laptop), y el checkpoint liberado corresponde a la versión v2-900.

El proceso incluyó filtrado de datos por tasa de acierto (pass-rate-filtered), que según las ablaciones no produjo una diferencia estadísticamente significativa frente a datos sin filtrar (39/30, p=0.34). Se probaron además dos ejecuciones adicionales con resultados nulos: entrenamiento sobre turnos de reparación y entrenamiento con filas de ejemplo en el prompt. La innovación principal no está en la arquitectura, sino en el esquema de recompensa por ejecución y en la configuración de inferencia recomendada (reintento ante errores SQL, grounding de literales, filas de ejemplo por tabla y poda de esquema), que eleva la precisión de forma acumulativa.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural sobre esquemas de bases de datos relacionales.
- Razonamiento estructurado orientado a la corrección de ejecución, no solo a la sintaxis.
- Entrenado específicamente para el formato de prompt del proyecto, con salida en bloque SQL.
- Soporte de modo thinking desactivado en la configuración evaluada (greedy, 256 tokens nuevos).
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- Exportación GGUF Q8_0 compatible con llama.cpp para despliegue local.

## Casos de uso

- Asistente de consultas para bases de datos internas: el modelo traduce preguntas de negocio en SQL ejecutable sobre esquemas conocidos, con la configuración recomendada (poda de esquema y filas de ejemplo) para maximizar la precisión en producción.
- Integración en pipelines de analítica self-service: usuarios no técnicos formulan preguntas en lenguaje natural y el modelo genera la consulta que alimenta un motor de BI, reduciendo la dependencia del equipo de datos.
- Voice-to-SQL en asistentes de voz: los resultados publicados con SpokenSpider muestran un 68% de precisión con transcripciones limpias y un 65% con ruido de 10 dB SNR, lo que lo hace viable en interfaces habladas con grounding de literales.
- Generación de SQL en entornos con hardware limitado: al caber en una GPU de 8 GB y disponer de GGUF Q8_0, puede desplegarse en portátiles o estaciones de trabajo sin aceleradores de gama alta.
- Herramienta de apoyo para analistas: el modelo propone consultas que el analista revisa y ajusta, con reintento automático ante errores SQL para reducir iteraciones manuales.
- Evaluación y experimentación académica: su naturaleza reproducible (código, logs y ablaciones públicas) lo convierte en una base para estudiar recompensas por ejecución y técnicas de RL aplicadas a text-to-SQL en modelos pequeños.
- Filtrado y validación de consultas en CI/CD de datos: puede generar consultas candidatas que se validan contra el esquema antes de su ejecución, aunque requiere supervisión humana por su tasa de error.

## Benchmarks y rendimiento

Precisión de ejecución (EX) con decodificación greedy, thinking off, 256 tokens nuevos y nf4. Las comparaciones son pareadas (McNemar exacto).

Spider test (2.147 preguntas, 40 bases de datos no vistas):

| Configuracion | EX oficial, test | EX oficial, dev |
|---|---|---|
| Qwen3-1.7B zero-shot | 56,3% | 54,1% |
| Este modelo (GRPO) | 61,7% | 59,0% |
| + reintento ante errores SQL + grounding de literales | 64,2% | 60,9% |
| + 3 filas de ejemplo por tabla en el prompt | 65,7% | 63,4% |
| + poda de esquema (recomendada) | 66,3% | 65,9% |

BIRD dev (1.534 preguntas, 11 bases de datos):

| Configuracion | BIRD EX | simple | moderate | challenging |
|---|---|---|---|---|
| Qwen3-1.7B zero-shot | 20,5% | 27,2% | 10,1% | 11,0% |
| Este modelo (GRPO) | 23,6% | 31,7% | 11,0% | 12,4% |
| Configuracion recomendada | 30,2% | 39,6% | 16,2% | 15,2% |

Comparación con Qwen2.5-Coder-1.5B-Instruct:

| | Spider test (oficial) | BIRD dev |
|---|---|---|
| Qwen2.5-Coder-1.5B zero-shot | 55,1% | 21,9% |
| Este modelo | 61,7% | 23,6% |
| Coder + pasos de inferencia recomendados | 57,5% | 25,7% |
| Este modelo, configuración recomendada | 66,3% | 30,2% |

Ablaciones de entrenamiento (Spider dev, 1.034 preguntas):

| Modelo | Ours | Oficial |
|---|---|---|
| Qwen3-1.7B zero-shot | 53,7% | 54,1% |
| + GRPO, datos sin filtrar | 57,1% | 58,1% |
| + GRPO, datos filtrados por pass-rate (este modelo) | 58,5% | 59,0% |

Preguntas habladas (100 consultas SpokenSpider con transcripciones ASR, frente a SQLCoder-7B con grounding):

| Entrada | Este modelo, config. recomendada | SQLCoder-7B (+ grounding) | victorias/derrotas, p |
|---|---|---|---|
| limpia | 68% | 55% | 21/8, 0,024 |
| 20 dB SNR | 67% | 53% | 22/8, 0,016 |
| 10 dB SNR | 65% | 51% | 22/8, 0,016 |
| 0 dB SNR | 46% | 45% | 11/10, 1,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en nf4 para el modelo fusionado; el adaptador LoRA requiere menos. El entrenamiento QLoRA de 4 bits se realizó en una GPU de 8 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3070 Ti Laptop fue la usada en entrenamiento); para mayor throughput, A100 o H100.
- Cabe en GPU consumer: sí, en tarjetas de 8 GB en adelante con cuantización nf4 o GGUF Q8_0.
- Opciones de despliegue: transformers, llama.cpp (GGUF Q8_0), text-generation-inference (tag endpoints_compatible); no se documenta soporte explícito de vLLM u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spider test (EX) | BIRD dev (EX) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tiny-sql-rl | 1,72B | no disponible | 66,3% (config. recomendada) | 30,2% (config. recomendada) | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen3-1.7B (base) | 1,72B | no disponible | 56,3% | 20,5% | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible | 57,5% (con pasos de inferencia) | 25,7% (con pasos de inferencia) | Apache 2.0 | Hugging Face |
| SQLCoder-7B | 7B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Nivel absoluto bajo: en BIRD dev, aproximadamente el 70% de las respuestas siguen siendo incorrectas; no es una cifra de leaderboard.
- Especialización estrecha: entrenado para text-to-SQL en inglés sobre esquemas relacionales; no es un modelo generalista.
- Formato de salida frágil: la cuantización Q4_K_M rompe el formato de salida (−12,5 puntos en el mismo subconjunto); solo se garantiza Q8_0 y bf16.
- Dependencia del prompt: el modelo fue entrenado con un prompt específico; su ventaja frente a Qwen2.5-Coder se debe en parte a que este último no fue entrenado con ese formato (10–19% de respuestas sin bloque SQL por agotar los 256 tokens).
- Riesgo de alucinación en nombres de columnas y tablas, mitigado parcialmente por la poda de esquema y el reintento ante errores SQL.
- Sesgos: no documentados en la información disponible.
- Limitación de idioma: solo inglés declarado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte.
- Advertencia de producción: requiere validación contra el esquema y supervisión humana; no debe ejecutarse SQL generado sin comprobaciones previas.

## Enlaces

- Hugging Face: https://huggingface.co/Alpericon/tiny-sql-rl
- Repositorio del proyecto (código, logs y números): https://github.com/alpericon/tiny-sql-rl
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset Spider: https://huggingface.co/datasets/xlangai/spider
