# Nitin2004/clinicalabstainsql-artifacts

## Resumen

`clinicalabstainsql-artifacts` es un repositorio de artefactos de entrenamiento del proyecto **ClinicalAbstain-Text2SQL-LLM** (BN5212), publicado por el usuario Nitin2004. No contiene un modelo completo, sino un conjunto de adaptadores LoRA de tipo PEFT (formato safetensors) entrenados para la tarea de text-to-SQL sobre bases de datos clínicas con esquema OMOP, con un componente explícito de **abstención**: el modelo debe decidir cuándo una pregunta no es respondible con el esquema disponible en lugar de generar SQL incorrecto.

El repositorio incluye adaptadores para cuatro modelos base distintos (Llama-3-8B-Instruct, Qwen3-8B, Qwen3-4B-Instruct-2507 y Mistral-7B-Instruct-v0.3), cada uno en dos variantes: una entrenada con datos respondibles y no respondibles (abstention-aware) y otra entrenada solo con datos respondibles (SQL-only). También incluye checkpoints intermedios, logs de entrenamiento, resultados de evaluación y el directorio de datos de PostgreSQL de la base de datos sintética OMOP usada como benchmark.

La relevancia del artefacto es metodológica: permite reproducir y comparar el comportamiento de abstención en text-to-SQL clínico entre familias de modelos, y sirve como material de referencia para investigadores que trabajen en robustez de sistemas text-to-SQL en dominios de alto riesgo. El tamaño del repo (6,5 GB) se explica por los múltiples adaptadores y el dump de PostgreSQL. No se dispone de información sobre arquitectura propia, ya que los adaptadores heredan la de sus modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos base transformer: Llama-3-8B-Instruct, Qwen3-8B, Qwen3-4B-Instruct-2507, Mistral-7B-Instruct-v0.3 |
| Parametros totales | no disponible (depende del modelo base; los adaptadores LoRA son un subconjunto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (adaptadores en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | other (los modelos base tienen licencias separadas: Meta Llama-3, Qwen3, Mistral) |
| Formato de pesos | safetensors (adaptadores PEFT: `adapter_model.safetensors`, `adapter_config.json`) |

## Arquitectura y entrenamiento

Los artefactos son adaptadores LoRA entrenados con PEFT sobre cuatro modelos base de distinta familia y tamaño. Cada adaptador se acompaña de tokenizer, `train.log` y `eval_results.json`. El repositorio organiza los resultados en `repro/runs/` (Llama-3-8B-Instruct) y `repro/multi_model/` (Qwen3-8B, Qwen3-4B-Instruct-2507, Mistral-7B-Instruct-v0.3), con dos variantes por modelo: `run` (entrenada con datos respondibles y no respondibles, orientada a abstención) y `run_sqlonly` (entrenada solo con datos respondibles).

Los datos de entrenamiento provienen exclusivamente del benchmark sintético OMOP text-to-SQL de Legrand et al. (repositorio `red1dwarf/TEXT-TO-OMOP`). El autor declara explícitamente que no se incluyen datos de MIMIC-IV ni MIMIC-IV-Note, que son datos con credenciales de PhysioNet. La innovación técnica destacable es el enfoque de abstención: el modelo aprende a reconocer preguntas no respondibles frente al esquema OMOP, una capacidad crítica en entornos clínicos donde una consulta SQL mal generada puede producir resultados erróneos con consecuencias. No se dispone de información sobre número de tokens de entrenamiento, composición exacta del dataset, hiperparámetros LoRA ni uso de RLHF/DPO.

## Capacidades

- Generación de SQL (text-to-SQL) sobre esquemas clínicos OMOP.
- Abstención ante preguntas no respondibles con el esquema disponible (variante `run`).
- Comparación controlada entre variantes con y sin abstención (`run` frente a `run_sqlonly`).
- Evaluación multi-modelo: los mismos datos y procedimiento aplicados a cuatro modelos base distintos.
- Reproducibilidad: checkpoints intermedios, logs y resultados de evaluación incluidos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- **Investigación en abstención para text-to-SQL clínico**: cargar los adaptadores sobre sus modelos base y reproducir los experimentos del proyecto para estudiar cuándo y por qué un modelo decide no responder. Es adecuado porque el repo incluye logs, checkpoints y resultados de evaluación de cada variante.
- **Benchmark de robustez en dominios de alto riesgo**: usar el dump de PostgreSQL sintético OMOP (`repro/pgdata_synthetic.tar.gz`) para montar una base de datos de prueba y evaluar sistemas text-to-SQL propios frente a la línea base del proyecto.
- **Comparativa entre familias de modelos**: evaluar Llama-3-8B, Qwen3-8B, Qwen3-4B y Mistral-7B sobre la misma tarea y dataset, controlando la variable de entrenamiento (abstention-aware frente a SQL-only).
- **Prototipado de asistentes de consulta a datos clínicos**: integrar un adaptador en un pipeline interno que traduzca preguntas en lenguaje natural a SQL sobre un esquema OMOP, con la salvaguarda de abstención para preguntas fuera de alcance.
- **Docencia y formación en PEFT**: usar los adaptadores como ejemplo práctico de fine-tuning LoRA multi-modelo con checkpoints y logs completos para ilustrar el flujo de entrenamiento y evaluación.
- **Auditoría de sesgos y fallos en text-to-SQL**: analizar los `eval_results.json` y los logs para identificar patrones de error y casos límite en la generación de SQL clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye ficheros `eval_results.json` por adaptador, pero sus valores no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Para Llama-3-8B y Qwen3-8B en FP16 se estiman en torno a 16 GB; en cuantización de 4 bits, en torno a 5-6 GB. Para Qwen3-4B-Instruct-2507 en FP16, en torno a 8-9 GB. Para Mistral-7B-Instruct-v0.3 en FP16, en torno a 14-15 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 o H100 para evaluación multi-modelo simultánea o contexto largo; RTX 4090 (24 GB) para cualquiera de los modelos base en FP16.
- Cabe en GPU de consumo: sí, los modelos de 7-8B en cuantización de 4 bits caben en GPUs de 8-12 GB; Qwen3-4B en FP16 cabe en 12 GB.
- Opciones de despliegue: los adaptadores PEFT se cargan con `peft` sobre el modelo base; para servicio se puede usar vLLM o TGI tras fusionar el adaptador con el modelo base, o llama.cpp/Ollama si se convierte a GGUF. No se documentan opciones específicas en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clinicalabstainsql-artifacts (Llama-3-8B) | LoRA sobre 8B | no disponible | text-to-SQL OMOP con abstención | other (base: Llama-3) | Hugging Face |
| clinicalabstainsql-artifacts (Qwen3-8B) | LoRA sobre 8B | no disponible | text-to-SQL OMOP con abstención | other (base: Qwen3) | Hugging Face |
| clinicalabstainsql-artifacts (Qwen3-4B-Instruct-2507) | LoRA sobre 4B | no disponible | text-to-SQL OMOP con abstención | other (base: Qwen3) | Hugging Face |
| clinicalabstainsql-artifacts (Mistral-7B-v0.3) | LoRA sobre 7B | no disponible | text-to-SQL OMOP con abstención | other (base: Mistral) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros sistemas text-to-SQL clínicos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el adaptador sobre el modelo base correspondiente, cada uno con su propia licencia (Meta Llama-3, Qwen3, Mistral), lo que condiciona el uso comercial.
- Entrenado exclusivamente con un benchmark sintético OMOP; el rendimiento sobre esquemas clínicos reales no está validado en la información disponible.
- No se incluyen datos de MIMIC-IV ni MIMIC-IV-Note; quien quiera evaluar sobre datos reales debe obtener acceso propio vía PhysioNet.
- Riesgo de alucinación de SQL: la variante `run_sqlonly` no incorpora abstención y puede generar consultas plausibles pero incorrectas ante preguntas no respondibles.
- Idiomas soportados no documentados; el benchmark de origen está en inglés, por lo que el comportamiento en castellano no está garantizado.
- Licencia "other" sin texto de licencia específico en la información disponible; es necesario revisar los términos del modelo base antes de cualquier uso en producción.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- El repositorio incluye un dump de PostgreSQL de varios GB; el espacio en disco necesario para reproducir es considerable.

## Enlaces

- Hugging Face: https://huggingface.co/Nitin2004/clinicalabstainsql-artifacts
- Repositorio del proyecto: https://github.com/nitinvetcha/ClinicalAbstain-Text2SQL-LLM
- Benchmark OMOP text-to-SQL (Legrand et al.): https://github.com/red1dwarf/TEXT-TO-OMOP
