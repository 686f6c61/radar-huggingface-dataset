# Mardiyyah/base_pubmedbert_3class_label_all_false

## Resumen

`Mardiyyah/base_pubmedbert_3class_label_all_false` es un modelo de reconocimiento de entidades nombradas (NER) biomédico obtenido por ajuste fino de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` sobre el conjunto de datos `OTAR3088/CeLLaTe-ner-3class-iob_final`. Lo publica el usuario Mardiyyah en Hugging Face bajo licencia Apache 2.0 y está pensado para etiquetado token a token con un esquema IOB de tres clases, típico de tareas de extracción de entidades en texto científico-sanitario en inglés.

El modelo es un transformer encoder de tipo BERT en su variante base (12 capas, 768 dimensiones ocultas, ~109 millones de parámetros), por lo que no genera texto libre: su salida es una clasificación por token. La relevancia práctica está en pipelines de extracción de información biomédica (entidades como enfermedades, fármacos, genes o procedimientos, según el esquema del dataset de entrenamiento) donde el contexto es corto (512 tokens) y el coste de inferencia debe ser bajo.

El repositorio es de tamaño reducido (0,4 GB), con pesos en `safetensors`, y la model card está generada automáticamente por el `Trainer` de Transformers, con secciones de descripción, usos previstos y datos de entrenamiento sin completar. Los resultados declarados en evaluación son modestos en F1 (~0,67 micro) pese a una accuracy alta (~0,98), lo que sugiere un fuerte desbalance de clases (la clase mayoritaria, probablemente `O`, domina).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (BiomedBERT) |
| Parametros totales | 108.897.031 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (arquitectura BERT base: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estándar de PyTorch/GGUF fuera del repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA ni adaptadores) de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un BERT base preentrenado sobre literatura biomédica (PubMed abstracts y full text). Sobre esa base se añade una cabeza de clasificación token a token (`token-classification`) para un esquema IOB de tres clases. El vocabulario es el del tokenizador original de BiomedBERT (uncased, WordPiece).

El entrenamiento se realizó con el `Trainer` de Transformers 4.48.2 / PyTorch 2.4.1 sobre el dataset `OTAR3088/CeLLaTe-ner-3class-iob_final`. Hiperparámetros declarados: learning rate 2e-5, batch de entrenamiento 16 con acumulación de gradiente 2 (batch efectivo 32), optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler lineal con warmup del 1 %, 20 épocas y precisión mixta nativa (AMP). La model card solo reporta métricas hasta la época 5; no se documenta composición del dataset, número de tokens de entrenamiento, ni si hubo etapas de RLHF/DPO (no aplicables en un encoder de clasificación).

## Capacidades

- Etiquetado de secuencias token a token (`token-classification`) con esquema IOB de tres clases sobre texto biomédico en inglés.
- Extracción de entidades nombradas en dominios como literatura científica, informes clínicos o resúmenes de PubMed (según el dataset de entrenamiento).
- Clasificación de tokens individuales con salida de logits por etiqueta; compatible con `pipeline("token-classification")` de Transformers.
- No soporta generación de texto, razonamiento libre, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés (idioma declarado); el tokenizador uncased de BiomedBERT no cubre bien otros idiomas.
- No dispone de modo "thinking", audio ni multimodalidad.

## Casos de uso

- Extracción de entidades en resúmenes de PubMed: procesar abstracts con el pipeline de token-classification para poblar bases de datos de entidades biomédicas (enfermedades, fármacos, genes) con etiquetas IOB, aprovechando el preentrenamiento de BiomedBERT en el mismo dominio.
- Anonimización o enriquecimiento de informes clínicos: identificar menciones de entidades en notas clínicas en inglés y sustituirlas o indexarlas antes de almacenarlas, con un coste de inferencia bajo (modelo de ~109 M de parámetros).
- Construcción de índices semánticos para búsqueda biomédica: usar las etiquetas del modelo como metadatos para filtrar y enriquecer resultados de un motor de búsqueda sobre literatura científica.
- Preetiquetado para anotación humana: generar candidatos de entidades en lotes grandes y revisarlos manualmente, reduciendo el coste de anotación en proyectos de corpus biomédicos.
- Monitorización de literatura: pipelines por lotes que procesen feeds de nuevas publicaciones y extraigan entidades para alertas temáticas (fármacos, dianas, enfermedades).
- Componente en pipelines de NLP clínico: integrar el modelo como paso de NER previo a tareas de relación entre entidades o normalización a ontologías (UMLS, MeSH), siempre que el esquema de tres clases del dataset sea compatible con el dominio objetivo.
- Experimentación académica: línea base reproducible para comparar con otros modelos NER biomédicos sobre el mismo dataset (`OTAR3088/CeLLaTe-ner-3class-iob_final`).

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index vacío; cifras tomadas de la model card):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,0600 |
| Precision | 0,6801 |
| Recall | 0,6700 |
| Micro F1 | 0,6750 |
| Weighted F1 | 0,6725 |
| Macro F1 | 0,6641 |
| Accuracy | 0,9825 |

Evolución por época reportada en la model card:

| Epoca | Validation loss | Precision | Recall | Micro F1 | Weighted F1 | Macro F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 1 | 0,0627 | 0,5696 | 0,6415 | 0,6034 | 0,6003 | 0,5876 | 0,9798 |
| 2 | 0,0600 | 0,6801 | 0,6700 | 0,6750 | 0,6725 | 0,6641 | 0,9825 |
| 3 | 0,0690 | 0,6387 | 0,6664 | 0,6522 | 0,6483 | 0,6385 | 0,9805 |
| 4 | 0,0817 | 0,6792 | 0,6498 | 0,6642 | 0,6578 | 0,6458 | 0,9814 |
| 5 | 0,0827 | 0,6981 | 0,6286 | 0,6615 | 0,6540 | 0,6410 | 0,9818 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a un modelo encoder de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,44 GB de pesos (109 M parámetros × 4 bytes) más activaciones; en la práctica, menos de 2 GB con batch pequeño.
- VRAM estimada en fp16/bf16: ~0,22 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, T4, L4, A10, A100, H100). El modelo no requiere GPU de datacenter.
- Cabe en GPU consumer y también en CPU para inferencia por lotes con throughput aceptable.
- Opciones de despliegue: `transformers` (pipeline de token-classification), `text-embeddings-inference` no aplica, `vLLM` no aplica (no es un modelo generativo), `llama.cpp`/`Ollama` no soportan directamente este checkpoint sin conversión a GGUF, `TGI` no aplica. Despliegue típico con FastAPI + `transformers` o `onnxruntime` tras exportación.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, es un modelo apto para procesamiento por lotes en CPU y para alta concurrencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mardiyyah/base_pubmedbert_3class_label_all_false | 108,9 M | no disponible (BERT base: 512) | NER biomédico IOB 3 clases | apache-2.0 | Hugging Face |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext | ~110 M | 512 | Modelo base (MLM), sin cabeza NER | MIT (según repo original) | Hugging Face |
| Modelos NER biomédicos tipo BioBERT/PubMedBERT ajustados | ~110 M | 512 | NER biomédico | variable según checkpoint | Hugging Face |

No se dispone de resultados de benchmarks comparativos con alternativas en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Rendimiento moderado: micro F1 de 0,675 y macro F1 de 0,664 indican que el modelo confunde clases con frecuencia; la accuracy de 0,982 es engañosa por el desbalance de etiquetas (predominio de `O`).
- La model card no documenta el esquema exacto de las tres clases ni la composición del dataset, lo que dificulta evaluar la transferibilidad a otros dominios o corpus.
- Solo inglés: no apto para texto en castellano u otros idiomas sin reentrenamiento.
- Ventana de contexto limitada a 512 tokens (propia de BERT base); textos más largos requieren troceado con solapamiento.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos/negativos en la etiquetación; validar con métricas por clase antes de producción.
- Sesgos: al derivar de literatura biomédica publicada, puede heredar sesgos de representación de poblaciones, enfermedades y terminología; no se han publicado análisis de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener condiciones propias que conviene revisar.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validación comunitaria ni mantenimiento documentado; tratar como checkpoint experimental.
- No usar para decisiones clínicas sin supervisión humana: es una herramienta de extracción de información, no un sistema de diagnóstico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/base_pubmedbert_3class_label_all_false
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-3class-iob_final
