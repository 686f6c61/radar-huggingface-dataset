# Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-RAG-QLoRA

## Resumen

El modelo `Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-RAG-QLoRA` es un adaptador PEFT (QLoRA) desarrollado por Mark Paul Rosenthal (Mr-Rosen) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Su propósito es generar programas estructurados de razonamiento numérico (formato FinQA) a partir de preguntas financieras y un contexto recuperado mediante un sistema RAG (retrieval-augmented generation). El adaptador se entrenó con la técnica QLoRA (cuantización NF4 de 4 bits y doble cuantización) sobre el dataset `Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset`, que deriva del benchmark FinQA.

Este modelo aborda un problema práctico: la generación de programas de cálculo (operaciones como divide, multiply, etc.) que permiten responder preguntas financieras con razonamiento numérico, en lugar de solo dar respuestas directas. Su relevancia radica en que demuestra que un adaptador ligero, entrenado en solo 2,23 horas y con un coste de aproximadamente 4,21 dólares, puede alcanzar una exactitud de ejecución del 59,90% en el conjunto de test, lo que lo hace atractivo para equipos pequeños con recursos limitados. La arquitectura es un transformer causal (el modelo base) con un adaptador LoRA de rango 64, y el contexto de entrada es el prompt RAG específico del proyecto, no el documento completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5-7B-Instruct) + adaptador LoRA (QLoRA) |
| Parámetros totales | No disponible (adaptador PEFT; el modelo base tiene 7.6B parámetros, pero no se especifica) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no se indica) |
| Tipos de cuantización | NF4 (4-bit), bfloat16 (compute dtype), double quantization (durante el entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); licencia del modelo base no especificada en la información |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT entrenado con el método QLoRA sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. QLoRA cuantiza el modelo base a 4 bits (NF4) con doble cuantización y usa bfloat16 como dtype de cálculo, lo que permite entrenar un adaptador de bajo rango (rank 64, alpha 32, dropout 0.05) sin necesidad de ajustar todos los parámetros del modelo. Los módulos objetivo del adaptador son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con un prompt RAG específico que combina la pregunta con un contexto recuperado (mediante un sistema de recuperación de chunks ordenados). No se mencionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La innovación principal es el enfoque práctico de combinar RAG y QLoRA para generar programas FinQA con un coste computacional reducido.

## Capacidades

- Generación de programas estructurados en formato FinQA (JSON con operaciones como `divide`, `multiply`, `add`, etc.) que representan el razonamiento numérico para responder una pregunta financiera.
- Razonamiento numérico sobre contexto financiero recuperado (por ejemplo, estados financieros, informes de empresas).
- Generación de texto en lenguaje natural (heredada del modelo base Qwen2.5-7B-Instruct).
- Capacidad de procesar preguntas con contexto largo (limitado por la ventana del modelo base, aunque no se especifica).
- No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Análisis de estados financieros: el modelo puede recibir una pregunta como "¿Cuál es el ratio de deuda sobre patrimonio en 2023?" y generar un programa FinQA que calcula el valor usando datos extraídos del contexto recuperado.
- Asistencia en auditoría: permite a auditores consultar documentos financieros y obtener programas de cálculo reproducibles, no solo respuestas textuales.
- QA financiera automatizada en sistemas RAG: el adaptador se integra en un pipeline de recuperación de documentos para responder preguntas numéricas sobre informes anuales, balances, etc.
- Generación de reportes de análisis: a partir de preguntas en lenguaje natural, se generan programas que pueden ejecutarse para obtener métricas, facilitando la automatización de reportes.
- Educación financiera: el modelo puede mostrar el razonamiento paso a paso (programa) para explicar cómo se obtiene un resultado, útil en entornos de aprendizaje.
- Evaluación de modelos de razonamiento numérico: sirve como referencia para comparar sistemas RAG+QLoRA frente a otras técnicas (LoRA, RAG puro, etc.) en el dominio financiero.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados oficiales en el conjunto de test de FinQA (con recuperación RAG práctica y ordenada):

| Métrica | Valor |
|---|---|
| Execution Accuracy | 59,90 % |
| Program Accuracy | 55,97 % |
| Parse Success | 100,00 % |
| Parse Failures | 0 |
| Average Latency | 0,5090 s/ejemplo |
| Practical Score | 0,3809 |

Estos resultados se obtuvieron con el checkpoint `epoch_2_adapter` y el prompt `RAG_BASELINE_L1_top3_adapted.json`. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware específicos para este adaptador. Sin embargo, al estar diseñado para trabajar con el modelo base `Qwen2.5-7B-Instruct`, se puede inferir que la inferencia requiere al menos una GPU con suficiente VRAM para cargar el modelo base en 4 bits (típicamente entre 8 y 16 GB, dependiendo de la cuantización y el tamaño del lote). No se mencionan opciones de despliegue específicas, pero el modelo es compatible con el ecosistema Transformers y PEFT, por lo que puede ejecutarse con vLLM, llama.cpp u Ollama si se exporta a formato GGUF (no incluido en el repositorio). No se dispone de datos de latencia más allá del promedio de 0,5090 s/ejemplo reportado.

## Comparativa con modelos similares

No se han proporcionado datos comparativos con otros modelos en la información disponible. Se menciona en la búsqueda web un modelo `rLLM-FinQA-4B` que también aborda el mismo problema, pero no se incluyen métricas de comparación en esta ficha. Por lo tanto, la comparativa queda como "no disponible".

## Limitaciones y advertencias

- El adaptador depende críticamente de la calidad y orden de los chunks recuperados por el sistema RAG. No funciona correctamente sin el contexto recuperado específico y el prompt oficial.
- No está entrenado como modelo independiente; su rendimiento está ligado al pipeline completo RAG + QLoRA, no al adaptador en solitario.
- No se ha evaluado su comportamiento en otros idiomas ni fuera del dominio financiero.
- Puede presentar alucinaciones o errores de razonamiento numérico en contextos ambiguos, como cualquier modelo generativo.
- El adaptador tiene licencia MIT, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0, aunque no se especifica en la información proporcionada). El dataset FinQA derivado se publica bajo CC BY 4.0.
- Para reproducir los resultados oficiales es imprescindible usar los artefactos de recuperación ordenados y el prompt seleccionado; no se recomienda sustituir la recuperación por inyección de datos dorados.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-RAG-QLoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset
- Repositorio del proyecto (artefactos de recuperación, evaluador, resultados): https://github.com/MarkPaulRosenthal/Accuracy-Is-Not-Enough-Practical-Financial-QA
- Perfil del autor: https://huggingface.co/Mr-Rosen
- Artículo del proyecto (en LinkedIn): https://www.linkedin.com/posts/neuralchainai_outcome-accuracy-is-not-enough-aligning-activity-7427356043141316608-z6G0
