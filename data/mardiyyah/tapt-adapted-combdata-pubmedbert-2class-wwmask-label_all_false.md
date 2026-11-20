# Mardiyyah/tapt-adapted-combdata-pubmedbert-2class-wwmask-label_all_false

## Resumen

El modelo `tapt-adapted-combdata-pubmedbert-2class-wwmask-label_all_false`, publicado por el usuario Mardiyyah en Hugging Face, es un modelo de clasificación de tokens (token classification, típicamente reconocimiento de entidades nombradas o NER) construido sobre una variante de PubMedBERT adaptada mediante TAPT (Task-Adaptive Pretraining) y un tokenizador específico de dominio. Se distribuye bajo la librería Transformers con pesos en formato safetensors y licencia Apache 2.0, lo que facilita su integración en pipelines existentes.

El modelo resuelve un problema acotado: la identificación de entidades en un esquema de dos clases (2class) sobre el conjunto de datos `OTAR3088/CeLLaTe-ner-2class-iob_final`, presumiblemente en el ámbito biomédico. Con 110.409.221 parámetros totales y un tamaño de repositorio de 0,4 GB, se trata de un modelo compacto orientado a inferencia eficiente, no a generación de texto general.

Su relevancia es limitada y muy específica: no es un modelo de propósito general ni un LLM conversacional, sino un ajuste fino especializado para una tarea concreta de etiquetado. Resulta útil para quien necesite reproducir o reutilizar exactamente esa tarea de NER biomédico de dos clases, pero carece de capacidades generativas, de razonamiento o multilingües más allá del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), derivado de PubMedBERT con TAPT y tokenizador adaptado |
| Parametros totales | 110.409.221 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (PubMedBERT base usa 512 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder tipo BERT, concretamente un ajuste fino del modelo base `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask-combinedData`, que a su vez parte de PubMedBERT con adaptación de tokenizador y TAPT sobre datos combinados. La cabeza de clasificación es de tipo token-classification con un esquema de dos clases en formato IOB, orientada a la detección de entidades sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`.

El entrenamiento se realizó con el Trainer de Transformers 4.48.2 sobre PyTorch 2.4.1+cu121, con learning rate 2e-05, batch total de 32 (batch 16 con acumulación de gradiente de 2), optimizador AdamW, scheduler lineal con warmup del 1 %, 20 épocas, semilla 3407 y precisión mixta nativa (AMP). No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (no aplicable a un modelo de clasificación de este tipo). No se describen innovaciones técnicas destacables más allá del propio pipeline TAPT y la adaptación del tokenizador.

## Capacidades

- Clasificación de tokens (token classification) para reconocimiento de entidades nombradas en esquema de dos clases con etiquetado IOB.
- Etiquetado a nivel de token en textos en inglés, presumiblemente de dominio biomédico por herencia de PubMedBERT.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés según la model card.
- No se documentan modos especiales (thinking, audio, etc.).

## Casos de uso

- Extracción de entidades biomédicas en textos científicos: el modelo puede etiquetar secuencias de tokens en artículos o resúmenes PubMed para poblar bases de datos de entidades, aprovechando el preentrenamiento de dominio de PubMedBERT.
- Anotación asistida de corpus NER: útil como preetiquetador en flujos de anotación humana, reduciendo el esfuerzo manual en esquemas de dos clases.
- Normalización previa en pipelines de minería de literatura: integrable como primer paso antes de resolver entidades contra ontologías médicas.
- Reproducción de experimentos académicos: permite replicar los resultados declarados sobre el dataset CeLLaTe-ner-2class-iob_final para comparaciones controladas.
- Filtrado y enriquecimiento de registros clínicos estructurados semiestructurados: aplicable a campos de texto libre en inglés donde se requiera detectar menciones de entidades de dos tipos.
- Componente en sistemas de búsqueda semántica biomédica: las etiquetas generadas pueden alimentar índices o filtros de recuperación de documentos.
- Base para nuevos ajustes finos: al ser un checkpoint intermedio con tokenizador adaptado, puede servir de punto de partida para otras tareas de etiquetado en el mismo dominio.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (conjunto de evaluación) son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0.0785 |
| Precision | 0.7246 |
| Recall | 0.7023 |
| Micro F1 | 0.7133 |
| Weighted F1 | 0.7127 |
| Macro F1 | 0.7191 |
| Accuracy | 0.9842 |

El model-index oficial no incluye resultados adicionales (`results: []`). No se han publicado en la información disponible comparaciones con otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,45 GB de pesos (110 M de parámetros); en FP16, alrededor de 0,22 GB. Con overhead de activaciones y batch, cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes, una A100 o H100 aporta throughput, pero no es necesaria.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de Transformers, Text Embedding Inference no aplica (es clasificación), vLLM no es adecuado para token-classification, TGI tampoco; alternativas razonables son el pipeline `token-classification` de Transformers, ONNX Runtime o TorchScript para producción.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por secuencia en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tapt-adapted-combdata-pubmedbert-2class-wwmask-label_all_false | 110,4 M | no disponible | NER 2 clases (biomédico) | Apache 2.0 | Hugging Face |
| PubMedBERT base (Microsoft) | ~110 M | 512 tokens (estándar BERT) | Preentrenamiento biomédico, ajustable a NER | MIT (según versión) | Hugging Face |
| BioBERT base | ~110 M | 512 tokens (estándar BERT) | Preentrenamiento biomédico, ajustable a NER | Apache 2.0 (según versión) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de tokens con dos clases; no debe emplearse para generación, razonamiento ni tareas fuera de ese esquema.
- Solo soporta inglés; no se ha validado para otros idiomas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en la detección de entidades (Precision 0.7246 y Recall 0.7023 en evaluación, lo que implica un margen de error considerable).
- El esquema de etiquetas está fijado a dos clases; reutilizarlo para otros esquemas requiere reentrenamiento.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"), por lo que faltan detalles sobre datos, sesgos y usos previstos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta evaluaciones de robustez, sesgos ni comportamiento fuera de distribución.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- No se documentan limitaciones de contexto más allá de las heredadas de la arquitectura BERT; conviene verificar la longitud máxima real antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Mardiyyah/tapt-adapted-combdata-pubmedbert-2class-wwmask-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-wwmask-combinedData
- Dataset de ajuste fino: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- Repositorio de Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
