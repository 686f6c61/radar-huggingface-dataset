# Mardiyyah/tapt-adapted-combdata-pubmedbert-2class-spanmask-label_all_false

## Resumen

`tapt-adapted-combdata-pubmedbert-2class-spanmask-label_all_false` es un modelo de clasificación de tokens (token classification) desarrollado por el usuario Mardiyyah, resultado del ajuste fino del checkpoint `CeLLaTe-tapt-pubmedbert-tokenizer-adapted-spanmask-combinedData` sobre el conjunto de datos `OTAR3088/CeLLaTe-ner-2class-iob_final`. Está orientado a la detección de entidades nombradas (NER) en textos biomédicos en inglés, con un esquema de dos clases en formato IOB.

El modelo parte de una base tipo BERT (PubMedBERT) adaptada mediante TAPT (Task-Adaptive Pre-Training) y un tokenizador específico para el dominio, lo que lo sitúa en la estirpe de los modelos encoder para comprensión del lenguaje biomédico. Con 110.409.221 parámetros y un tamaño de repositorio de 0,4 GB, es un modelo compacto pensado para inferencia eficiente en tareas de etiquetado secuencial.

Su relevancia actual reside en el ecosistema CeLLaTe, un proyecto de extracción de entidades clínicas en textos oncológicos. El modelo reporta un F1 micro de 0,7072 y una precisión de 0,7230 en el conjunto de evaluación, con una licencia Apache 2.0 que facilita su reutilización. La model card es escasa en documentación, por lo que varios datos técnicos no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), fine-tune de PubMedBERT adaptado con TAPT |
| Parámetros totales | 110.409.221 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia BERT, inicializado desde `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-spanmask-combinedData`. Esta base incorpora un tokenizador adaptado al dominio y un preentrenamiento adaptativo a la tarea (TAPT) sobre datos combinados, lo que previsiblemente mejora la representación de terminología biomédica respecto a un PubMedBERT estándar. La cabeza de clasificación es de tipo token classification con dos clases en esquema IOB, orientada a la detección de entidades.

El ajuste fino se realizó sobre `OTAR3088/CeLLaTe-ner-2class-iob_final` con los siguientes hiperparámetros: learning rate 2e-5, batch de entrenamiento 16 con acumulación de gradientes de 2 (batch efectivo 32), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con warmup del 1 %, 20 épocas y precisión mixta nativa (AMP), con semilla 3407. El mejor checkpoint se alcanzó en la época 4, con una pérdida de validación de 0,0641. No se documentan detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO (no aplicable a un encoder de clasificación).

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) en textos biomédicos en inglés.
- Esquema de dos clases en formato IOB para etiquetado secuencial.
- Detección de spans de entidades clínicas, presumiblemente en el contexto del proyecto CeLLaTe (entidades oncológicas).
- Inferencia sobre texto plano tokenizado con el tokenizador adaptado incluido en el checkpoint base.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de entidades clínicas en informes oncológicos: el modelo puede etiquetar secuencialmente términos biomédicos en textos de historia clínica, aprovechando el preentrenamiento TAPT sobre datos del dominio para mejorar la cobertura de terminología especializada.
- Preprocesamiento de corpus de investigación: integración en pipelines de anonimización o estructuración de textos PubMed para tareas posteriores de minería de literatura científica.
- Enriquecimiento de bases de datos biomédicas: uso del etiquetado IOB para poblar tablas de entidades (fármacos, enfermedades, procedimientos) a partir de texto libre en inglés.
- Componente en sistemas de extracción de información clínica: el modelo actúa como primer eslabón de NER antes de un módulo de relación entre entidades o de normalización a ontologías como UMLS.
- Filtrado y clasificación de documentos médicos: etiquetado de fragmentos relevantes en grandes volúmenes de abstracts para priorizar revisiones sistemáticas.
- Baseline para investigación en NER biomédico: al ser un modelo compacto (110 M parámetros) y con licencia Apache 2.0, sirve como punto de comparación reproducible en experimentos académicos sobre el corpus CeLLaTe.
- Despliegue en entornos con recursos limitados: su tamaño reducido permite inferencia en CPU o GPU de gama baja para tareas de etiquetado por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (mejor checkpoint, época 4):

| Métrica | Valor |
|---|---|
| Loss | 0,0638 |
| Precision | 0,7230 |
| Recall | 0,6921 |
| Micro F1 | 0,7072 |
| Weighted F1 | 0,7069 |
| Macro F1 | 0,7147 |
| Accuracy | 0,9836 |

Evolución por épocas (extracto):

| Época | Validation loss | Precision | Recall | Micro F1 | Accuracy |
|---|---|---|---|---|---|
| 1 | 0,0690 | 0,5130 | 0,7358 | 0,6045 | 0,9756 |
| 2 | 0,0541 | 0,6992 | 0,6921 | 0,6957 | 0,9830 |
| 4 | 0,0641 | 0,7230 | 0,6921 | 0,7072 | 0,9836 |
| 6 | 0,0736 | 0,7059 | 0,7033 | 0,7046 | 0,9839 |
| 9 | 0,0887 | 0,6968 | 0,7098 | 0,7032 | 0,9830 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB (110 M parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB; en int8, en torno a 0,11 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir grandes volúmenes; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, Text Generation Inference (TGI) no aplica por ser encoder, vLLM no es la opción natural; `llama.cpp` y Ollama no soportan este formato de forma directa. Alternativas: ONNX Runtime, TorchScript o `optimum` para exportación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU y moderado en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (tapt-adapted-combdata-pubmedbert-2class-spanmask) | 110,4 M | no disponible | NER biomédico 2 clases | Apache 2.0 | Hugging Face |
| PubMedBERT (base) | ~110 M | 512 tokens (estándar BERT) | Encoder biomédico general | MIT / Apache según checkpoint | Hugging Face |
| BioBERT | ~110 M | 512 tokens | Encoder biomédico general | Apache 2.0 | Hugging Face |
| SciBERT | ~110 M | 512 tokens | Encoder científico general | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad; los valores de contexto de los modelos alternativos corresponden al estándar de la arquitectura BERT y no están verificados en esta ficha.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"), por lo que faltan detalles sobre datos de entrenamiento, composición del corpus y evaluación externa.
- El modelo solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- El esquema de dos clases IOB limita la granularidad de las entidades detectadas; no se documenta qué tipos concretos de entidad cubre.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos en el etiquetado: el recall de 0,6921 indica que aproximadamente un 30 % de las entidades reales podrían no detectarse.
- La accuracy de 0,9836 puede ser engañosa en datasets con fuerte desbalance de clases (la mayoría de tokens son "O"); el F1 micro (0,7072) es una métrica más representativa.
- No se documentan sesgos demográficos, geográficos o de subgrupos clínicos; el rendimiento puede degradarse en dominios distintos al corpus CeLLaTe.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del dataset de entrenamiento (`OTAR3088/CeLLaTe-ner-2class-iob_final`) y del checkpoint base antes de un despliegue en producción.
- No apta para generación de texto, razonamiento ni tareas de agente; su uso está restringido a clasificación de tokens.
- El modelo se creó y actualizó en noviembre de 2026 según los metadatos; verificar la vigencia del checkpoint base y de las dependencias (Transformers 4.48.2, PyTorch 2.4.1).

## Enlaces

- Hugging Face: https://huggingface.co/Mardiyyah/tapt-adapted-combdata-pubmedbert-2class-spanmask-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-spanmask-combinedData
- Dataset de ajuste fino: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- Perfil del autor: https://huggingface.co/Mardiyyah
