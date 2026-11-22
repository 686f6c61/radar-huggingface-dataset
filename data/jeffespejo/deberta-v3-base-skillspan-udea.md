# jeffespejo/deberta-v3-base-skillspan-udea

## Resumen

`jeffespejo/deberta-v3-base-skillspan-udea` es un modelo de clasificación de tokens (token classification) afinado a partir de `microsoft/deberta-v3-base` para la extracción de habilidades (`SKILL`) y componentes de conocimiento (`KNOWLEDGE`) en ofertas de empleo en inglés. Lo desarrolla Jefferson Espejo en el marco de un proyecto de curso de la Universidad de Antioquia (asignatura Fundamentos de Procesamiento de Lenguaje Natural) y se publica bajo licencia CC-BY-4.0.

El modelo resuelve una tarea concreta de procesamiento de lenguaje natural aplicado a recursos humanos: etiquetar, palabra por palabra y con esquema BIO, los fragmentos de texto que describen competencias y conocimientos técnicos dentro de anuncios de trabajo. Se entrena sobre el corpus SkillSpan (`jjzha/skillspan`), un conjunto de referencia para esta tarea, y emplea la arquitectura DeBERTa-v3 con atención desacoplada, con 183.835.397 parámetros totales y pesos en formato safetensors.

Su relevancia es práctica y acotada: sirve como componente de extracción de entidades en pipelines de análisis de ofertas de empleo, construcción de taxonomías de competencias o sistemas de matching entre candidatos y vacantes. No es un modelo generativo ni un asistente conversacional; es un extractor de spans entrenado específicamente para dominios de job postings en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, atención desacoplada) |
| Parámetros totales | 183.835.397 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DeBERTa-v3 admite habitualmente hasta 512 tokens; no se especifica en la información proporcionada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-base`, un transformer encoder con atención desacoplada (disentangled attention) y embeddings relativos de posición, seleccionado mediante una búsqueda en rejilla (grid search) frente a `bert-base-cased` y `jjzha/jobbert-base-cased`, combinando cada modelo base con distintos learning rates. La tarea es clasificación de tokens con esquema BIO para dos tipos de entidad: `SKILL` y `KNOWLEDGE`.

El entrenamiento se realizó sobre el dataset SkillSpan (`jjzha/skillspan`), fusionando sus dos capas de anotación en una única secuencia de etiquetas; en el aproximadamente 3% de tokens etiquetados en ambas capas, se prioriza la etiqueta `SKILL`. Los hiperparámetros fueron learning rate 5e-5, batch size 16, 6 épocas y precisión fp16. No se indica en la información disponible el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo discriminativo de este tipo).

## Capacidades

- Extracción de spans de habilidades (`SKILL`) en ofertas de empleo en inglés, incluidas descripciones largas como "communicate results to stakeholders".
- Extracción de spans de conocimiento (`KNOWLEDGE`), típicamente tecnologías y herramientas como "Python" o "Kubernetes".
- Etiquetado a nivel de token con esquema BIO y agregación de spans mediante `aggregation_strategy="simple"` en el pipeline de Transformers.
- Integración directa con la librería `transformers` mediante `pipeline("token-classification")`.
- Capacidad de generalización parcial a spans no vistos en entrenamiento (recall de 0.519 para `SKILL` y 0.647 para `KNOWLEDGE`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de visión o audio.
- Capacidad monolingüe: únicamente inglés.

## Casos de uso

- Extracción de competencias en portales de empleo: procesar anuncios en inglés y obtener listas estructuradas de habilidades y tecnologías para indexarlas en un motor de búsqueda o en una base de datos de vacantes.
- Construcción de taxonomías de competencias: agregar los spans extraídos de miles de ofertas para descubrir qué tecnologías y habilidades se demandan con más frecuencia por sector o región.
- Matching candidato-vacante: comparar las habilidades extraídas de una oferta con las declaradas en un currículum o perfil para calcular solapamiento y puntuar la adecuación.
- Analítica de mercado laboral: monitorizar la evolución temporal de la demanda de tecnologías concretas (por ejemplo, frameworks o lenguajes) a partir de corpus de ofertas etiquetadas automáticamente.
- Enriquecimiento de ATS (applicant tracking systems): etiquetar automáticamente ofertas internas para mejorar filtros, alertas y recomendaciones dentro de la plataforma.
- Preetiquetado para anotación humana: usar las predicciones del modelo como primera pasada en un flujo de anotación de spans, reduciendo el esfuerzo manual antes de la revisión por anotadores.
- Investigación académica en extracción de habilidades: servir como baseline reproducible sobre SkillSpan para comparar con nuevos enfoques de extracción de entidades en job postings.

## Benchmarks y rendimiento

Resultados en test sobre SkillSpan, con F1 estricto a nivel de span (seqeval), según la model card:

| Métrica | Valor |
|---|---|
| Span F1 (global) | 0.623 |
| Span F1 `SKILL` | 0.537 |
| Span F1 `KNOWLEDGE` | 0.698 |
| Precisión | 0.594 |
| Recall | 0.656 |
| Recall en spans nunca vistos en entrenamiento (`SKILL` / `KNOWLEDGE`) | 0.519 / 0.647 |
| Baseline: diccionario de spans de entrenamiento (F1) | 0.184 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0.4 GB para los pesos (183,8 M de parámetros), con overhead adicional de activaciones y del tokenizador; en la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para lotes pequeños; RTX 3060, RTX 4090, T4, A10, A100 o H100 son más que suficientes. También es viable en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en GPUs integradas para inferencia de una sola frase.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, servidores de inferencia basados en Transformers (por ejemplo TGI con soporte de token classification), ONNX Runtime y despliegues por lotes con `datasets`. No se indica compatibilidad con llama.cpp u Ollama, orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jeffespejo/deberta-v3-base-skillspan-udea` | 183,8 M | no disponible | Extracción de skills/conocimiento (SkillSpan) | CC-BY-4.0 | Hugging Face |
| `microsoft/deberta-v3-base` (base sin afinar) | ~184 M | hasta 512 tokens (modelo base) | Modelo de propósito general (encoder) | MIT (según el modelo base) | Hugging Face |
| `jjzha/jobbert-base-cased` | no disponible | no disponible | Modelo de dominio para job postings | no disponible | Hugging Face |
| `bert-base-cased` | ~108 M | 512 tokens | Modelo de propósito general (encoder) | Apache 2.0 | Hugging Face |

La comparación de rendimiento entre estos modelos en la tarea SkillSpan no está disponible en la información proporcionada, salvo la mención de que DeBERTa-v3-base fue el mejor de los tres modelos base probados en la búsqueda en rejilla del autor.

## Limitaciones y advertencias

- Los spans de habilidades son largos y sus límites difusos, por lo que el F1 estricto a nivel de span es notablemente inferior al de tareas NER clásicas; el propio autor lo advierte.
- No soporta spans anidados de skill y knowledge.
- El modelo es monolingüe (inglés); su uso sobre textos en castellano u otros idiomas no está validado y probablemente produzca resultados deficientes.
- El rendimiento en spans nunca vistos en entrenamiento es menor (recall 0.519 para `SKILL`), lo que implica riesgo de perder habilidades expresadas con formulaciones novedosas.
- Riesgo de falsos positivos y negativos en textos con formatos atípicos (listas, tablas, abreviaturas) no representados en el corpus de entrenamiento.
- Es un proyecto de curso académico con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación en producción ni de mantenimiento continuado.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar las condiciones del dataset SkillSpan y del modelo base para usos derivados.
- No debe emplearse para decisiones de contratación automatizadas sin supervisión humana, dado el riesgo de sesgos presentes en los datos de ofertas de empleo y de errores de extracción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffespejo/deberta-v3-base-skillspan-udea
- Repositorio de código: https://github.com/jeffespejo/nlp-transformers-finetuning
- Dataset SkillSpan: https://huggingface.co/datasets/jjzha/skillspan
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
