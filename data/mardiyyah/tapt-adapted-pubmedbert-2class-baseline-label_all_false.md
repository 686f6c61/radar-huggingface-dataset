# Mardiyyah/tapt-adapted-pubmedbert-2class-baseline-label_all_false

## Resumen

El modelo `tapt-adapted-pubmedbert-2class-baseline-label_all_false`, publicado por el usuario Mardiyyah, es un modelo de clasificación de tokens (token classification) basado en BERT, afinado a partir del checkpoint `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-baseline`. Está entrenado sobre el conjunto de datos `OTAR3088/CeLLaTe-ner-2class-iob_final`, orientado a reconocimiento de entidades nombradas (NER) en el dominio biomédico en inglés, con un esquema de dos clases en formato IOB.

El modelo deriva de la familia PubMedBERT, un encoder BERT especializado en literatura biomédica, sobre el que se ha aplicado un proceso de adaptación de tokenizador y preentrenamiento adicional (TAPT, Task-Adaptive Pretraining) antes del ajuste fino para la tarea NER. Cuenta con 110.409.221 parámetros y un repositorio de 0,4 GB en formato safetensors, lo que lo sitúa en la gama de encoders compactos aptos para inferencia en CPU y GPU de consumo.

Su relevancia es acotada pero concreta: sirve como línea base (baseline) reproducible para tareas de extracción de entidades en textos biomédicos, con métricas de evaluación publicadas por el autor. La nomenclatura `label_all_false` sugiere una configuración experimental concreta del etiquetado, probablemente orientada a comparar variantes de entrenamiento dentro de un mismo estudio. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), derivado de PubMedBERT con tokenizador adaptado |
| Parametros totales | 110.409.221 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT con 110,4 millones de parámetros, heredado de PubMedBERT y sometido a un proceso de adaptación de tokenizador y preentrenamiento adaptativo de dominio (TAPT) en el checkpoint base `CeLLaTe-tapt-pubmedbert-tokenizer-adapted-baseline`. Sobre esa base se aplica un ajuste fino supervisado para clasificación de tokens con esquema IOB de dos clases sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`.

Los hiperparámetros de entrenamiento documentados son: learning rate de 2e-05, batch size de entrenamiento de 16 con acumulación de gradiente de 2 (batch efectivo de 32), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup del 1 %, 20 épocas y precisión mixta nativa (AMP). El entrenamiento se realizó con Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0. La model card no documenta el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un encoder de clasificación).

## Capacidades

- Clasificación de tokens (token classification) para reconocimiento de entidades nombradas en texto biomédico en inglés.
- Etiquetado con esquema IOB de dos clases, según el dataset de entrenamiento `CeLLaTe-ner-2class-iob_final`.
- Procesamiento de texto en inglés de dominio biomédico, gracias al preentrenamiento sobre PubMedBERT y a la adaptación TAPT.
- Generación de texto: no disponible (es un encoder, no un modelo generativo).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Extracción de entidades biomédicas en artículos científicos: el modelo puede procesar abstracts y textos de PubMed para etiquetar menciones de entidades con el esquema IOB de dos clases, integrándose en pipelines de minería de literatura.
- Anonimización y estructuración de informes clínicos: como clasificador de tokens, permite localizar y etiquetar fragmentos relevantes en notas clínicas en inglés antes de un procesamiento posterior.
- Construcción de bases de datos de entidades para investigación: servir como componente de extracción en pipelines ETL que alimentan grafos de conocimiento biomédicos.
- Línea base para experimentos de NER: su condición de baseline documentada con métricas de validación lo hace útil para comparar variantes de tokenizador, esquemas de etiquetado o estrategias de TAPT.
- Filtrado y preetiquetado de corpus: generar etiquetas preliminares sobre grandes volúmenes de texto biomédico para revisión humana (human-in-the-loop) y reducción del esfuerzo de anotación.
- Evaluación de robustez de tokenizadores adaptados: al derivar de un checkpoint con tokenizador adaptado, permite estudiar el impacto del tokenizador en tareas de NER biomédico.
- Despliegue en entornos con recursos limitados: con 110 millones de parámetros y pesos safetensors de 0,4 GB, puede ejecutarse en CPU o en GPU de consumo para tareas de inferencia por lotes.

## Benchmarks y rendimiento

La model card declara métricas sobre el conjunto de evaluación, pero el `model-index` no contiene resultados estructurados (`results: []`). Los datos disponibles son los de la tabla de entrenamiento del autor:

| Metrica | Valor (epoca 3, mejor Micro F1) |
|---|---|
| Loss (evaluacion) | 0,0605 |
| Precision | 0,6988 |
| Recall | 0,7293 |
| Micro F1 | 0,7137 |
| Weighted F1 | 0,7138 |
| Macro F1 | 0,7209 |
| Accuracy | 0,9836 |

Evolución por épocas (extracto):

| Epoca | Validation loss | Precision | Recall | Micro F1 | Macro F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 0,0633 | 0,5322 | 0,7377 | 0,6183 | 0,6506 | 0,9779 |
| 2 | 0,0544 | 0,6920 | 0,7023 | 0,6971 | 0,7047 | 0,9833 |
| 3 | 0,0607 | 0,6988 | 0,7293 | 0,7137 | 0,7209 | 0,9836 |
| 4 | 0,0646 | 0,7235 | 0,6912 | 0,7069 | 0,7128 | 0,9838 |
| 5 | 0,0674 | 0,7182 | 0,6828 | 0,7000 | 0,7051 | 0,9838 |
| 8 | 0,0817 | 0,6979 | 0,7005 | 0,6992 | 0,7021 | 0,9838 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos; en fp16, alrededor de 0,22 GB; con overhead de activaciones y batch, por debajo de 1-2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090, RTX 3060 y similares funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (PyTorch), TGI (Text Generation Inference no aplica por ser encoder; usar Inference Endpoints de clasificación), ONNX Runtime, y exportación a GGUF no documentada por el autor.
- Latencia y throughput: no disponibles; al ser un encoder de 110 M de parámetros, se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tapt-adapted-pubmedbert-2class-baseline-label_all_false | 110,4 M | no disponible | NER biomédico (2 clases IOB) | apache-2.0 | Hugging Face |
| PubMedBERT (base) | ~110 M | 512 tokens (estándar BERT) | Encoder biomédico general | MIT (según checkpoint original) | Hugging Face |
| BioBERT | ~110 M | 512 tokens (estándar BERT) | Encoder biomédico general | Apache 2.0 (según checkpoint) | Hugging Face |

No se dispone de resultados de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con estos modelos.

## Limitaciones y advertencias

- Modelo de clasificación de tokens, no generativo: no puede usarse para generación de texto, razonamiento ni conversación.
- Entrenado exclusivamente en inglés; no soporta otros idiomas.
- Esquema de etiquetado restringido a dos clases IOB según el dataset de entrenamiento; no cubre taxonomías NER más amplias sin reentrenamiento.
- Métricas moderadas: Micro F1 de 0,7137 y precisión de 0,6988 indican un rendimiento limitado; la accuracy elevada (0,9836) es engañosa por el desbalance de clases típico en NER.
- La model card está generada automáticamente e incompleta ("More information needed" en descripción, usos previstos y datos de entrenamiento); no hay documentación sobre sesgos, composición del dataset ni evaluación externa.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de etiquetados incorrectos (falsos positivos y negativos) en entidades biomédicas, con implicaciones si se usa en contextos clínicos.
- No se documenta el número de tokens de contexto soportado; se asume el estándar de BERT (512 tokens), pero no está confirmado por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento impide verificar restricciones de los datos originales.
- Sin descargas ni likes en el momento de la ficha; no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Mardiyyah/tapt-adapted-pubmedbert-2class-baseline-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
