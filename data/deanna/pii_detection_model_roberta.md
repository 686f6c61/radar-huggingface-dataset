# Deanna/pii_detection_model_roberta

## Resumen

`pii_detection_model_roberta` es un modelo de clasificación de tokens (token classification) obtenido por fine-tuning de `FacebookAI/roberta-base` para la detección de información personal identificable (PII). Lo publica el usuario Deanna en Hugging Face bajo licencia MIT. El modelo resuelve una tarea acotada: etiquetar fragmentos de texto que corresponden a datos personales, lo que resulta útil en pipelines de anonimización, cumplimiento normativo (RGPD) y saneado de datos antes de almacenarlos o enviarlos a terceros.

Técnicamente es un transformer encoder de tipo RoBERTa en su variante base, con 124.085.031 parámetros totales (aproximadamente 125 M) y pesos en formato safetensors. No se especifica la longitud de contexto efectiva en la model card, aunque hereda la arquitectura de RoBERTa, limitada a 512 tokens posicionales. El repositorio ocupa 0,5 GB, coherente con un checkpoint base más los pesos del cabezal de clasificación.

La relevancia del modelo es limitada y debe contextualizarse: se trata de un artefacto generado automáticamente por el `Trainer` de Transformers, con una model card incompleta (el dataset de entrenamiento figura como `None`), cero descargas y cero likes en el momento de la consulta. Sus métricas de evaluación (F1 de 0,4582 y precisión de 0,4110) indican un rendimiento modesto para producción, por lo que debe evaluarse con cautela antes de cualquier uso real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) con cabezal de token classification |
| Parámetros totales | 124.085.031 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; arquitectura RoBERTa limitada a 512 tokens posicionales |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16 según checkpoint; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-base`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado por Facebook AI sobre corpus ingleses de gran escala. Sobre esa base se añade un cabezal de clasificación de tokens para la tarea de reconocimiento de entidades PII. El fine-tuning se realizó con el `Trainer` de Transformers (versión 5.22.1) y PyTorch 2.14.1, con los siguientes hiperparámetros: learning rate 1e-05, batch de entrenamiento 16, batch de evaluación 32, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 15 épocas.

No se documenta el dataset de entrenamiento (la model card indica `None`), ni el número de tokens, ni la composición de las etiquetas, ni si hubo etapas de RLHF o DPO (poco probables en un encoder de clasificación). Tampoco se especifica si se aplicaron técnicas de aumento de datos o balanceo de clases, algo crítico en detección de PII por el fuerte desbalance entre tokens normales y tokens etiquetados. El entrenamiento alcanzó 2.160 pasos totales (144 pasos por época), lo que sugiere un conjunto de entrenamiento pequeño (del orden de unos pocos miles de ejemplos con batch 16). No se describen innovaciones técnicas adicionales.

## Capacidades

- Clasificación de tokens para detección de entidades de información personal identificable (PII) en texto.
- Etiquetado a nivel de token, apto para extracción de spans (nombres, direcciones, identificadores, etc., según las etiquetas definidas en el entrenamiento, que no se documentan).
- No genera texto: es un modelo discriminativo, no generativo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidades multilingües: no disponibles; el modelo base es predominantemente inglés y no se declara soporte de otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anonimización previa a almacenamiento: el modelo puede integrarse en un pipeline que recorra documentos y sustituya los spans detectados como PII por marcadores genéricos antes de persistir los datos, reduciendo la exposición de datos personales en bases de datos internas.
- Saneado de logs: aplicar el modelo sobre líneas de log antes de enviarlas a sistemas de observabilidad externos, de modo que correos, teléfonos o identificadores no salgan del perímetro de la organización.
- Cumplimiento RGPD en procesos batch: usar el modelo como primera pasada de detección en flujos de revisión de datos, combinándolo con revisión humana dado su F1 moderado (0,4582).
- Preprocesado para entrenamiento de modelos generativos: filtrar PII de corpus propios antes de usarlos para fine-tuning de LLM, evitando que el modelo final memorice datos personales.
- Enmascarado en formularios y correos: procesar texto libre introducido por usuarios en aplicaciones internas para detectar y ocultar datos sensibles antes de mostrarlos a operadores.
- Investigación y evaluación de métodos de detección de PII: servir como baseline reproducible (checkpoint público, hiperparámetros documentados) para comparar con modelos NER más grandes o con enfoques basados en reglas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación (no se especifica su composición):

| Métrica | Valor |
|---|---|
| Loss | 0,3436 |
| Precision | 0,4110 |
| Recall | 0,5177 |
| F1 | 0,4582 |
| Accuracy | 0,9090 |

La accuracy elevada (0,9090) es engañosa en tareas de etiquetado de tokens con fuerte desbalance: la mayoría de tokens no son PII, por lo que un clasificador trivial obtendría una accuracy alta. La métrica relevante es el F1 (0,4582), que indica un rendimiento limitado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,5 GB de pesos (124 M parámetros × 4 bytes ≈ 0,5 GB); en fp16, unos 0,25 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en menos de 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo sin problemas. Para lotes grandes, una A10, L4 o A100 ofrecen mayor throughput, aunque no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, `vLLM` (soporte limitado para token classification), `TGI`, ONNX Runtime o TorchScript para optimización. `llama.cpp` y Ollama no aplican de forma nativa a este tipo de modelo.
- Latencia y throughput: no disponibles; para un encoder de 125 M en GPU moderna se espera latencia de milisegundos por secuencia corta, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Deanna/pii_detection_model_roberta` | 124 M | 512 tokens (heredado de RoBERTa) | Token classification (PII) | MIT | Hugging Face |
| `FacebookAI/roberta-base` | 125 M | 512 tokens | Modelo base (MLM) | MIT | Hugging Face |
| `dslim/bert-base-NER` | 110 M | 512 tokens | NER (PER, ORG, LOC, MISC) | MIT | Hugging Face |
| `Jean-Baptiste/roberta-large-ner-english` | 355 M | 512 tokens | NER en inglés | MIT | Hugging Face |

La comparación con modelos NER genéricos es aproximada: `dslim/bert-base-NER` y `roberta-large-ner-english` detectan entidades generales, no específicamente PII, pero sirven como referencia de tamaño y arquitectura. No hay datos de rendimiento comparables publicados para este checkpoint frente a alternativas, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Rendimiento limitado: F1 de 0,4582 y precisión de 0,4110 implican una tasa alta de falsos positivos y falsos negativos; no es adecuado como único mecanismo de detección de PII en producción sin revisión humana o modelos complementarios.
- Dataset de entrenamiento no documentado: la model card indica `None`, por lo que se desconoce la distribución, el idioma y las categorías de PII cubiertas.
- Idiomas no declarados: el modelo base es inglés; el comportamiento en castellano u otros idiomas no está validado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos sistemáticos en el etiquetado.
- Sesgos potenciales: al desconocerse el corpus de entrenamiento, no se pueden evaluar sesgos demográficos o de dominio; los modelos NER tienden a peor rendimiento en nombres no occidentales y en formatos de identificadores locales.
- Contexto limitado a 512 tokens: documentos largos requieren fragmentación, con riesgo de perder entidades en los límites.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- Modelo generado automáticamente por el `Trainer` con model card incompleta: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación registrada (2026-11-22) posterior a la fecha de consulta habitual; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Deanna/pii_detection_model_roberta
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Documentación de Transformers para token classification: https://huggingface.co/docs/transformers/tasks/token_classification
