# AdarshSingh7647/TabRankMultiTableNaive

## Resumen

TabRankMultiTableNaive es un modelo de reranking de tablas basado en Qwen3-8B, desarrollado por AdarshSingh7647 como parte de la familia TabRank. Su función es, dada una pregunta y una lista de tablas candidatas, devolver un ranking de las tablas más relevantes para responder a la pregunta, en una sola llamada generativa. A diferencia de los enfoques tradicionales de pairwise scoring o cross-encoder, este modelo procesa todas las tablas en un único prompt y emite el ranking completo como un objeto JSON. La variante "Naive" (Answer-Only) está afinada para producir el ranking directamente, sin traza de razonamiento, lo que la hace la más rápida en inferencia de los tres objetivos de la familia. El modelo se entrenó sobre NQ Tables y MultiTabQA, lo que le permite manejar preguntas que requieren combinar información de varias tablas. Con 8.000 millones de parámetros y una ventana de contexto de 32.768 tokens, está pensado para integrarse en pipelines de recuperación y generación aumentada (RAG) sobre datos tabulares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parámetros totales | 8.000 millones (modelo base Qwen3-8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración usada en el ejemplo de vLLM) |
| Tipos de cuantización | No especificado en la información disponible |
| Idiomas soportados | Inglés (fine-tuning; el modelo base Qwen3-8B es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado; compatible con Transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros, y se somete a un fine-tuning supervisado para la tarea de reranking listwise de tablas. El entrenamiento se realizó sobre un conjunto de 6.728 trazas de razonamiento destiladas de un modelo profesor que razonaba sobre la relevancia de tablas. En esta variante "Naive" se descarta la traza de razonamiento y se entrena únicamente la salida final del ranking, lo que simplifica la generación y reduce la latencia. Los datos de entrenamiento combinan NQ Tables y MultiTabQA, incorporando preguntas de recuperación multi-tabla que exigen integrar información de más de una tabla. La innovación técnica principal es el enfoque de reranking generativo listwise en una sola llamada, que evita los costes computacionales de los métodos basados en pares o cross-encoders.

## Capacidades

- Reranking listwise de tablas: recibe una pregunta y varias tablas candidatas en un único prompt y devuelve el ranking completo en una sola generación.
- Salida estructurada en JSON: genera un objeto con la clave `ranked_tables` que contiene las posiciones ordenadas de las tablas.
- Soporte multi-tabla: entrenado con MultiTabQA, puede manejar preguntas que requieren combinar información de varias tablas.
- Generación de texto: pipeline de text-generation, compatible con Transformers y vLLM.
- Sin traza de razonamiento: al ser la variante Answer-Only, la inferencia es directa y rápida.
- Idioma: entrenado y evaluado en inglés.

## Casos de uso

- Recuperación de tablas en sistemas RAG: dado un corpus de tablas, el modelo puede rerankear los resultados de un recuperador inicial, mejorando la precisión del contexto que se pasa al generador.
- Asistentes de inteligencia de negocio: en un chat sobre datos financieros, el modelo selecciona las tablas más relevantes de un repositorio para responder a preguntas como "¿Qué tabla muestra los ingresos trimestrales por región?".
- Búsqueda semántica de tablas en bases de datos: ayuda a encontrar la tabla correcta en un data lake con miles de tablas, devolviendo un ranking de las más útiles.
- Preprocesamiento para QA sobre tablas: antes de un modelo de table-question-answering, se usa para filtrar y ordenar las tablas candidatas, reduciendo el ruido y mejorando la calidad de las respuestas.
- Análisis de datos en pipelines ETL: en procesos de integración de datos, se puede usar para identificar qué tablas son relevantes para una consulta analítica concreta.
- Evaluación de relevancia de tablas: como componente de un sistema de evaluación automática que compara la relevancia de tablas recuperadas por distintos métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados para este checkpoint en la información disponible. La model card indica que los resultados para esta variante Answer-Only no se han confirmado contra los registros de evaluación, por lo que se omiten para evitar errores. Para obtener resultados verificados, se recomienda consultar las fichas de TabRankMultiTableCoTGen (Standard SFT) y TabRankMultiTableCoTCond (TabRank, mejor método), que incluyen evaluaciones dentro y fuera de distribución en 7 benchmarks de la suite IBM table-text-ir-evaluation.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB (8.000 millones de parámetros × 2 bytes). Con cuantización de 4 bits, la VRAM necesaria se reduce a unos 5-6 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: A100 40GB o H100 para bfloat16 sin cuantización; en GPUs de consumo como RTX 4090 (24 GB) también es viable en bfloat16, y con cuantización puede ejecutarse en GPUs de 12-16 GB.
- Despliegue: compatible con vLLM (según el ejemplo de la model card) y Transformers con `device_map="auto"`. No se mencionan otras opciones como llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La variante Answer-Only está diseñada para ser más rápida que las variantes con razonamiento, pero no se aportan cifras concretas.

## Comparativa con modelos similares

El modelo pertenece a la familia TabRank, compuesta por seis checkpoints de Qwen3-8B. Se comparan a continuación las variantes relevantes:

| Modelo | Objetivo | Datos de entrenamiento | Salida |
|---|---|---|---|
| TabRankMultiTableNaive (este) | Answer-Only (sin razonamiento) | NQ Tables + MultiTabQA | Ranking directo en JSON |
| TabRankSingleTableNaive | Answer-Only (sin razonamiento) | Solo NQ Tables | Ranking directo en JSON |
| TabRankMultiTableCoTGen | Standard SFT con razonamiento | NQ Tables + MultiTabQA | Razonamiento + ranking |
| TabRankMultiTableCoTCond | TabRank (mejor método) | NQ Tables + MultiTabQA | Razonamiento condicionado + ranking |

Las variantes con razonamiento (CoTGen y CoTCond) incluyen trazas de cadena de pensamiento y, según la model card, son las que tienen resultados verificados y mejor rendimiento. La variante Naive es la más rápida en inferencia, pero no se publican benchmarks verificados para ella. No se dispone de información sobre comparaciones con modelos externos de reranking de tablas en los datos proporcionados.

## Limitaciones y advertencias

- La model card no publica resultados de benchmarks verificados para este checkpoint concreto; cualquier afirmación sobre su rendimiento debe tomarse con cautela.
- El modelo está afinado únicamente para el idioma inglés; su capacidad en otros idiomas no está garantizada.
- Es un modelo especializado en reranking de tablas, no un modelo generalista de texto; no debe usarse para otras tareas sin validación previa.
- Puede producir rankings incorrectos si las tablas son ambiguas o contienen información solapada, con el consiguiente riesgo de alucinación en la salida JSON.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de validar el rendimiento en su caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/TabRankMultiTableNaive
- Colección TabRank: https://huggingface.co/collections/AdarshSingh7647/tabrank-qwen3-8b-table-rerankers
- Paper (arXiv 2607.25182): https://arxiv.org/abs/2607.25182
- Paper relacionado (arXiv 2504.01346): https://arxiv.org/abs/2504.01346
- Repositorio GitHub: https://github.com/AdarshSingh7647/TabRanker
- Checkpoint hermano TabRankMultiTableCoTGen: https://huggingface.co/AdarshSingh7647/TabRankMultiTableCoTGen
- Checkpoint hermano TabRankMultiTableCoTCond: https://huggingface.co/AdarshSingh7647/TabRankMultiTableCoTCond
- Checkpoint hermano TabRankSingleTableNaive: https://huggingface.co/AdarshSingh7647/TabRankSingleTableNaive
