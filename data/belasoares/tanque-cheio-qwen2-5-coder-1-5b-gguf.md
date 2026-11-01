# belasoares/tanque-cheio-qwen2.5-coder-1.5b-gguf

## Resumen

tanque-cheio es un ajuste fino de Qwen2.5-Coder-1.5B-Instruct especializado en text-to-SQL en portugués sobre los precios de combustibles publicados por la ANP (Agencia Nacional do Petróleo de Brasil). El modelo recibe una pregunta en lenguaje natural y devuelve una consulta SQL ejecutable contra DuckDB sobre un esquema concreto del proyecto. Lo desarrolla belasoares y se distribuye como GGUF Q4_K_M, pensado para inferencia en CPU con llama-cpp-python.

Técnicamente es un LoRA (adapter v2, commit `beeb19b`) fusionado sobre el modelo base Qwen2.5-Coder-1.5B-Instruct (commit `2e1fd39`), guardado en fp16 y convertido a GGUF Q4_K_M con llama.cpp `b11312`. El resultado pesa 0,918 GiB y cabe holgadamente en cualquier equipo sin GPU. No es un modelo de propósito general: está acoplado a un prompt concreto (`tanque.prompting.build_prompt`) que inyecta el esquema de la base de datos y las convenciones de respuesta.

Su relevancia es acotada pero clara: demuestra que un modelo de 1.500 millones de parámetros, ajustado con un dataset específico de 2024-10 a 2026-09, puede igualar a un modelo sin ajuste de 32B en una tarea vertical de text-to-SQL. Es un caso de estudio de especialización por dominio más que una alternativa generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste LoRA fusionado |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (n_ctx usado en la demo; el modelo base soporta más) |
| Tipos de cuantización | GGUF Q4_K_M (único publicado en el repo) |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`tanque-cheio-qwen2.5-coder-1.5b-q4_k_m.gguf`, 0,918 GiB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atención causal estándar y RoPE. Sobre él se aplicó un LoRA (versión v2) entrenado con el dataset `belasoares/tanque-cheio`, compuesto por pares pregunta-SQL sobre el esquema de precios de combustibles de la ANP, con datos que cubren de octubre de 2024 a septiembre de 2026. El adapter se fusionó en los pesos base y se exportó primero a fp16 y después a GGUF Q4_K_M.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. La innovación relevante no es arquitectónica sino de proceso: el ajuste está condicionado por un prompt de proyecto (`build_prompt`) que fija el esquema y las convenciones de salida, lo que reduce la variabilidad de las consultas generadas. La decodificación recomendada es determinista (temperature=0.0, max_tokens=384).

## Capacidades

- Generación de consultas SQL para DuckDB a partir de preguntas en portugués sobre precios de combustibles de la ANP.
- Razonamiento sobre un esquema de base de datos concreto inyectado en el prompt.
- Extracción de SQL desde la respuesta mediante `tanque.prompting.extract_sql`.
- Conversación de un solo turno orientada a la tarea (formato chat de llama-cpp-python).
- Ejecución en CPU sin GPU, con llama-cpp-python.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al portugués según la model card; el modelo base es multilingüe, pero el ajuste está orientado solo a pt.

## Casos de uso

- Consulta de precios de combustibles en lenguaje natural: un usuario pregunta si el etanol compensó en São Carlos (SP) el último mes y el modelo genera la consulta SQL que responde a esa pregunta sobre la base DuckDB del proyecto.
- Asistente interno para analistas de datos: integrado en un notebook o herramienta de BI, traduce preguntas ad hoc de analistas a SQL ejecutable, reduciendo el tiempo de escritura manual de consultas.
- Demo interactiva en Hugging Face Spaces: el propio autor lo despliega en `belasoares/tanque-cheio`; sirve como ejemplo de extremo a extremo de text-to-SQL con llama.cpp en CPU.
- Validación de pipelines de datos: al ser determinista con temperature=0.0, permite generar consultas reproducibles para tests de regresión sobre el esquema de la ANP.
- Enseñanza de text-to-SQL: caso práctico de ajuste LoRA de bajo coste sobre un modelo de 1.5B, útil para cursos y talleres de especialización por dominio.
- Prototipado rápido de interfaces de consulta: al caber en CPU y pesar menos de 1 GiB, se puede embeber en aplicaciones locales o entornos sin GPU para pruebas de concepto de acceso conversacional a datos públicos.
- Generación de consultas de referencia: comparar la salida del modelo con SQL escrita a mano para auditar la cobertura del esquema y detectar preguntas mal soportadas.

## Benchmarks y rendimiento

| Evaluación | Resultado | Contexto |
|---|---|---|
| Test del proyecto (150 preguntas), modelo fusionado en fp16 | 80,7% EX (execution accuracy) | Empatado con Qwen2.5-Coder-32B-Instruct sin ajuste |
| Conferencia con 3 preguntas del dev2, versión Q4_K_M | SQL idéntica al fp16 en 3/3; resultado correcto en ejecución en 3/3 | Muestra muy pequeña, no representativa |

La versión Q4_K_M publicada no fue evaluada sobre el conjunto completo de 150 preguntas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el archivo GGUF Q4_K_M ocupa 0,918 GiB y la inferencia en CPU es viable con llama-cpp-python.
- GPU recomendadas: no aplica; cualquier GPU con al menos 2 GB de VRAM podría cargarlo, pero el diseño es para CPU.
- Cabe en cualquier equipo consumer: portátiles, mini-PC y entornos sin acelerador.
- Opciones de despliegue: llama-cpp-python (método documentado por el autor), llama.cpp; otras herramientas compatibles con GGUF (Ollama, llama-cpp server) no están documentadas explícitamente para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El contexto usado es de 2048 tokens y la generación se limita a 384 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tanque-cheio-qwen2.5-coder-1.5b-gguf | 1.543.714.304 | 2048 (demo) | Text-to-SQL pt sobre ANP/DuckDB | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1.500 millones aprox. | mayor que 2048 (según modelo base) | Código general | Apache-2.0 | Safetensors y GGUF |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32.000 millones aprox. | no disponible | Código general | Apache-2.0 | Safetensors y GGUF |

La comparación relevante es con el modelo base sin ajustar: según el autor, el ajuste de 1.5B iguala al 32B sin ajuste en el test específico de 150 preguntas (80,7% EX). No se dispone de comparación con otros modelos especializados en text-to-SQL en portugués.

## Limitaciones y advertencias

- La SQL generada puede ser incorrecta; el propio autor advierte de que hay que revisar la consulta antes de usar el número resultante.
- El modelo está acoplado al prompt de `tanque.prompting.build_prompt` y al esquema del proyecto; fuera de ese contexto su rendimiento no está garantizado.
- Solo se distribuye una cuantización (Q4_K_M) y no fue evaluada sobre el conjunto completo de 150 preguntas; la validación publicada es de 3 preguntas.
- Idioma limitado al portugués en la práctica; no se documenta calidad en castellano ni en otros idiomas.
- No se documentan sesgos específicos, pero al entrenarse sobre datos de la ANP hereda las limitaciones de cobertura y calidad de esa fuente.
- Riesgo de alucinación en nombres de columnas, tablas o funciones SQL no presentes en el esquema inyectado.
- Licencia Apache-2.0 permite uso comercial, pero los datos subyacentes de la ANP requieren atribución a la ANP según la model card.
- El contexto de 2048 tokens limita la longitud del esquema y de la pregunta que se pueden inyectar en el prompt.
- No hay garantías de soporte ni mantenimiento más allá de la actividad del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/belasoares/tanque-cheio-qwen2.5-coder-1.5b-gguf
- Adapter LoRA v2: https://huggingface.co/belasoares/tanque-cheio-qwen2.5-coder-1.5b-lora-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/belasoares/tanque-cheio
- Demo en Spaces: https://huggingface.co/spaces/belasoares/tanque-cheio
- Código, datos y evaluación: https://github.com/belasoaress/tanque-cheio
