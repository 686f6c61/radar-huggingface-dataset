# Nhatcam/xlm-roberta-large-nli-vietnamese

## Resumen

XLM-RoBERTa Large for Vietnamese Natural Language Inference & Fact Verification es un modelo de clasificación de texto especializado en inferencia de lenguaje natural (NLI) y verificación de hechos (fact-checking) en vietnamita. Lo desarrolla el usuario Nhatcam y se distribuye con licencia MIT. Se trata de un fine-tuning de `joeddav/xlm-roberta-large-xnli`, un modelo multilingüe de tipo XNLI, adaptado al dominio del vietnamita para la tarea de determinar la relación entre una afirmación (claim) y una evidencia.

El modelo resuelve un problema concreto: dada una afirmación y un fragmento de evidencia, clasifica la relación en tres categorías mutuamente excluyentes: SUPPORTS (la evidencia respalda la afirmación), NOT_ENOUGH_INFO (la evidencia no permite verificar) y REFUTES (la evidencia contradice la afirmación). Esta formulación de tres clases es la habitual en tareas de verificación de hechos y NLI.

Con 559,9 millones de parámetros y arquitectura XLM-RoBERTa Large (24 capas, 1024 de dimensión oculta, 16 cabezas de atención), el modelo es relevante para pipelines de fact-checking en vietnamita, un idioma con relativamente pocos recursos especializados en esta tarea. El autor reporta un Macro F1 de aproximadamente 87,94% en dev y 86,49% en test, aplicando un vector de offsets de logits (`best_offsets.npy`) para la calibración de la decisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa Large (transformer encoder, 24 capas, 1024 hidden size, 16 attention heads) |
| Parámetros totales | 559.893.507 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length en el ejemplo de inferencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `joeddav/xlm-roberta-large-xnli`, un checkpoint XLM-RoBERTa Large ajustado previamente para XNLI multilingüe. Sobre esa base, el autor ha realizado un fine-tuning específico para la tarea de NLI/fact-checking en vietnamita con tres etiquetas: SUPPORTS (id 0), NOT_ENOUGH_INFO (id 1) y REFUTES (id 2). La arquitectura es un transformer encoder estándar de tipo RoBERTa con 24 capas, 1024 de dimensión oculta y 16 cabezas de atención, sobre el que se añade una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`).

La innovación técnica destacable es el uso de un vector de offsets de logits (`best_offsets.npy`, con valores [0.6425, 0.0, 0.375]) que se suma a los logits crudos antes de aplicar `argmax`. Este ajuste de calibración permite corregir el sesgo de las probabilidades del modelo y mejora la métrica Macro F1, que es la reportada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación de relaciones NLI en vietnamita: dado un par (claim, evidence), devuelve una de tres etiquetas (SUPPORTS, NOT_ENOUGH_INFO, REFUTES).
- Verificación de hechos (fact-checking) en vietnamita: evalúa si una evidencia respalda, contradice o no permite verificar una afirmación.
- Clasificación de texto con `pipeline_tag: text-classification` y `AutoModelForSequenceClassification`.
- Procesamiento de pares de secuencias con truncación a 512 tokens.
- Calibración de decisiones mediante offsets de logits precalculados.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking (es un encoder de clasificación, no un modelo generativo).
- Capacidad monolingüe: entrenado y etiquetado para vietnamita; no se declara soporte para otros idiomas.

## Casos de uso

- Verificación de afirmaciones en medios y redes sociales: dado un titular o publicación en vietnamita y un fragmento de una fuente fiable, el modelo clasifica si la evidencia respalda, refuta o es insuficiente, integrándose en un pipeline de fact-checking asistido.
- Moderación de contenido informativo: clasificar pares claim-evidencia extraídos de artículos para priorizar revisiones humanas cuando el modelo devuelve NOT_ENOUGH_INFO o REFUTES.
- Asistencia a redacciones periodísticas: comprobar automáticamente si una afirmación de un borrador está respaldada por el corpus de fuentes internas antes de publicar.
- Construcción de datasets de NLI en vietnamita: usar el modelo como etiquetador débil o para pre-anotar pares claim-evidencia y acelerar la creación de corpus supervisados.
- Sistemas de preguntas y respuestas con verificación: en un pipeline RAG, usar el modelo para validar que el pasaje recuperado respalda la respuesta generada antes de mostrarla al usuario.
- Investigación académica en PLN vietnamita: servir como baseline reproducible (licencia MIT, pesos safetensors) para experimentos de NLI y fact-checking en vietnamita.
- Filtrado de desinformación en plataformas: clasificar a escala pares de afirmaciones y evidencias para señalar candidatos a revisión, con la salvedad de que requiere supervisión humana por el riesgo de falsos positivos y negativos.

## Benchmarks y rendimiento

| Métrica | Resultado reportado |
|---|---|
| Dev Macro F1 | ~87,94% (con logit offsets) |
| Test Macro F1 | ~86,49% (con logit offsets) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ni comparativas numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559,9 M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 3 y 4 GB para batches pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos, más overhead; cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: sí, en tarjetas con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090, etc.); también puede ejecutarse en CPU para inferencia por lotes pequeños.
- GPU recomendadas para producción: T4, L4, A10G, A100 o H100 para throughput alto; para desarrollo, cualquier GPU consumer reciente es suficiente.
- Opciones de despliegue: Hugging Face `transformers` (PyTorch), `text-classification` pipeline, TorchServe/Triton, ONNX Runtime; no se documenta soporte explícito de vLLM, llama.cpp ni Ollama (son orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nhatcam/xlm-roberta-large-nli-vietnamese | 559,9 M | 512 tokens | NLI/fact-checking en vietnamita (3 clases) | MIT | Hugging Face |
| joeddav/xlm-roberta-large-xnli | ~559 M | 512 tokens | XNLI multilingüe (3 clases) | MIT | Hugging Face |
| xlm-roberta-large | ~559 M | 512 tokens | Modelo base multilingüe (encoder) | MIT | Hugging Face |

El modelo se distingue de `joeddav/xlm-roberta-large-xnli` por el fine-tuning específico en vietnamita y la calibración de logits; frente a `xlm-roberta-large` base, añade la cabeza de clasificación NLI y el ajuste de la tarea. No se dispone de comparativas numéricas con otros modelos NLI en vietnamita en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la model card; al derivar de XLM-RoBERTa, puede heredar sesgos presentes en los datos de preentrenamiento multilingües.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas (falsos SUPPORTS o REFUTES) cuando la evidencia es ambigua o el dominio es distinto del de entrenamiento.
- Limitación de contexto: truncación a 512 tokens; evidencias más largas deben dividirse o resumirse, lo que puede perder información relevante.
- Limitación de idioma: monolingüe en vietnamita; no se garantiza su rendimiento en otros idiomas pese al origen multilingüe del checkpoint base.
- Dependencia de la calibración: el rendimiento reportado (Macro F1) se obtiene aplicando `best_offsets.npy`; usar los logits crudos sin offsets puede degradar la métrica.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio concreto antes de producción.
- Desequilibrio de clases: la clase NOT_ENOUGH_INFO tiene offset 0,0, lo que sugiere posible desbalance; revisar métricas por clase antes de desplegar.
- No apto para generación de texto, tool calling ni agentes: es un encoder de clasificación.

## Enlaces

- Hugging Face: https://huggingface.co/Nhatcam/xlm-roberta-large-nli-vietnamese
- Checkpoint base: https://huggingface.co/joeddav/xlm-roberta-large-xnli
- Modelo base XLM-RoBERTa Large: https://huggingface.co/xlm-roberta-large
