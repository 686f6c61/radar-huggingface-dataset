# ponoma16/text-to-sql-qwen-3.59b-blackbox-v9

## Resumen

`ponoma16/text-to-sql-qwen-3.59b-blackbox-v9` es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado en Hugging Face por el usuario `ponoma16`, entrenado sobre el modelo base `merged-sql-qwen3.5-9b-blackbox-obf2`. Por el nombre del repositorio y del modelo base, el proyecto está orientado a la generación de SQL a partir de lenguaje natural (text-to-SQL), aunque la model card no documenta explícitamente el dataset ni los objetivos de entrenamiento.

El artefacto es un adaptador PEFT (versión 0.22.0) entrenado con TRL 1.18.2 sobre Transformers 5.22.2 y PyTorch 2.14.0. El repositorio ocupa 5,3 GB, un tamaño coherente con un adaptador LoRA de rango medio sobre un modelo base de aproximadamente 9 mil millones de parámetros (según se deduce de la nomenclatura "9b" del modelo base). No se han publicado métricas, datos de entrenamiento ni detalles de configuración del LoRA.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes, sin licencia declarada, sin idiomas especificados y con una model card generada automáticamente por TRL que no aporta información sustantiva. Se documenta aquí como referencia técnica del artefacto, advirtiendo que cualquier uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base `merged-sql-qwen3.5-9b-blackbox-obf2`); adaptador LoRA sobre el mismo |
| Parametros totales | No disponible (el modelo base se infiere de ~9B por la nomenclatura; el adaptador LoRA ocupa 5,3 GB en el repo) |
| Parametros activos | No aplica (no es MoE, según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye `licence: license` sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT 0.22.0) entrenado mediante SFT con TRL 1.18.2 sobre el modelo base `merged-sql-qwen3.5-9b-blackbox-obf2`. La model card no detalla el rango del LoRA, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni la composición del dataset de entrenamiento. Tampoco se indica si hubo una fase posterior de alineación (DPO, RLHF) ni si se aplicaron técnicas de decodificación especulativa o atención lineal.

El nombre del modelo base sugiere un proceso previo de "merge" de adaptadores sobre un checkpoint Qwen de ~9B, posiblemente orientado a SQL ("sql-qwen3.5-9b"). Sin embargo, no hay información pública que confirme la arquitectura exacta del base, el número de tokens de entrenamiento ni la procedencia de los datos. La única información verificable del proceso de entrenamiento son las versiones de framework declaradas: PEFT 0.22.0, TRL 1.18.2, Transformers 5.22.2, PyTorch 2.14.0, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Generación de SQL a partir de lenguaje natural, según se deduce del nombre del modelo y del modelo base; no confirmado en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Al ser un adaptador LoRA, requiere cargarse junto con el modelo base `merged-sql-qwen3.5-9b-blackbox-obf2` para su uso.

## Casos de uso

- Generación de consultas SQL en asistentes de BI: el modelo podría traducir preguntas en lenguaje natural a consultas SQL sobre esquemas de bases de datos relacionales, integrándose en herramientas de analítica self-service. La idoneidad concreta no puede validarse sin benchmarks ni documentación del dataset de entrenamiento.
- Prototipado de interfaces text-to-SQL en entornos de desarrollo: útil para experimentar con pipelines de generación de SQL antes de invertir en modelos con licencia y soporte comercial, dado que el adaptador es ligero y se puede cargar sobre el base.
- Automatización de tareas de consulta en pipelines de datos: el adaptador podría emplearse para generar consultas de exploración o validación en entornos controlados, siempre con revisión humana dado el riesgo de alucinación en SQL.
- Investigación sobre fine-tuning con LoRA y SFT: el artefacto sirve como ejemplo reproducible de un adaptador PEFT entrenado con TRL, útil para estudiar configuraciones de entrenamiento y comparar con otras variantes del mismo autor (v9 sugiere iteraciones previas).
- Evaluación comparativa de adaptadores text-to-SQL: al existir múltiples versiones (v9) del mismo proyecto, puede emplearse en estudios de ablación sobre datos y hiperparámetros, aunque el autor no publica resultados.
- Docencia y formación en generación de código: como ejemplo de modelo pequeño especializado en un dominio (SQL) para demostrar técnicas de fine-tuning supervisado en cursos de IA aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa (no confirmada), un modelo base de ~9B en FP16 requiere ~18 GB de VRAM; en cuantización de 8 bits ~9-10 GB; en 4 bits ~5-6 GB. El adaptador LoRA añade una sobrecarga mínima (el repo de 5,3 GB probablemente incluye pesos del adaptador y posibles checkpoints intermedios).
- GPU recomendadas: no disponibles. Por tamaño del base, serían necesarias GPUs con ≥24 GB (RTX 3090/4090, A10G, L4) para FP16, o GPUs con 8-16 GB si se cuantiza el base (no se distribuyen versiones cuantizadas del adaptador).
- ¿Cabe en consumer GPU? Probablemente sí en cuantización de 4-8 bits del base sobre RTX 3060 12 GB o superiores, pero no está documentado ni validado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft`; también podría servirse con vLLM o TGI si se fusiona previamente con el base. No se documentan integraciones con llama.cpp u Ollama (requeriría conversión a GGUF, no disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ponoma16/text-to-sql-qwen-3.59b-blackbox-v9` | ~9B (base, inferido) | No disponible | No disponible | Hugging Face, 0 descargas | Adaptador LoRA SFT, sin benchmarks |
| `defog/sqlcoder-7b-2` | 7B | 16k (aprox.) | CC BY-SA 4.0 | Hugging Face, ampliamente usado | Especializado en text-to-SQL, benchmarks publicados |
| `NumbersStation/nsql-llama-2-7b` | 7B | 4k | CC BY-NC 4.0 (no comercial) | Hugging Face | Especializado en SQL, uso no comercial |
| `Qwen/Qwen2.5-Coder-7B-Instruct` | 7B | 128k | Apache 2.0 | Hugging Face | Modelo general de código con buen rendimiento en SQL |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo de `ponoma16` que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo ni sobre la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos conocidos.
- Riesgo de alucinación elevado en la generación de SQL: sin benchmarks ni validación del autor, las consultas generadas pueden ser sintácticamente válidas pero semánticamente incorrectas o peligrosas (por ejemplo, `DELETE` o `DROP` no intencionados). Requiere revisión humana y permisos restrictivos en producción.
- Limitaciones de contexto e idioma: no documentadas; se desconoce la ventana de contexto efectiva y los idiomas soportados.
- Restricciones de licencia: la licencia no está declarada (`licence: license` sin especificar), lo que impide determinar si el uso comercial está permitido. Además, la licencia del modelo base `merged-sql-qwen3.5-9b-blackbox-obf2` no está disponible y podría imponer restricciones adicionales.
- El modelo tiene cero descargas y cero likes, y la model card está generada automáticamente por TRL con campos vacíos (`[None](https://huggingface.co/None)`), lo que indica falta de documentación y mantenimiento.
- Al ser un adaptador LoRA, no es un modelo autónomo: requiere el modelo base exacto para funcionar, y este no está referenciado con un enlace válido en la model card.
- El ejemplo de "Quick start" de la model card usa una pregunta genérica de conversación, no una consulta SQL, lo que sugiere que la card no fue adaptada al propósito real del modelo.
- No se distribuyen versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita su despliegue en entornos con poca VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/ponoma16/text-to-sql-qwen-3.59b-blackbox-v9
- Modelo base referenciado: `merged-sql-qwen3.5-9b-blackbox-obf2` (no se proporciona URL válida en la model card)
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- PEFT (framework de adaptadores): https://github.com/huggingface/peft
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformers Reinforcement Learning", 2020 (bibtex incluido en la card, sin URL directa)
