# Mardiyyah/tapt-orig-combdata-pubmedbert-2class-baseline-label_all_false

## Resumen

`tapt-orig-combdata-pubmedbert-2class-baseline-label_all_false` es un modelo de clasificación de tokens (token classification, típicamente NER) desarrollado por el usuario Mardiyyah y publicado en Hugging Face. Se trata de un fine-tuning de un checkpoint BERT base adaptado al dominio biomédico mediante TAPT (Task-Adaptive Pretraining) sobre PubMedBERT con un tokenizador específico, y posteriormente ajustado sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`. El modelo resuelve la tarea de reconocimiento de entidades nombradas en dos clases con etiquetado IOB, orientado a texto biomédico en inglés.

Arquitectónicamente es un transformer encoder de tipo BERT base, con 108.895.493 parámetros totales y pesos en formato safetensors. El repositorio ocupa aproximadamente 0,4 GB. Su relevancia es acotada: no es un modelo generativo ni un LLM, sino un componente especializado de extracción de entidades para pipelines de procesamiento de lenguaje natural clínico y biomédico.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés y está pensado para despliegues de inferencia ligeros. No cuenta con descargas ni interacciones registradas en el momento de la ficha, y la model card está generada automáticamente por el Trainer con secciones de descripción, usos previstos y datos de entrenamiento sin completar por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (fine-tuning de PubMedBERT con TAPT) |
| Parametros totales | 108.895.493 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión completa; compatible con cuantización estándar vía llama.cpp/GGUF no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de la familia BERT, concretamente un fine-tuning del checkpoint `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-baseline-combinedData`, que a su vez parte de PubMedBERT con TAPT sobre datos combinados. La tarea de ajuste es clasificación de tokens con etiquetado IOB de dos clases sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`. El entrenamiento se realizó con el Trainer de Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0.

Los hiperparámetros documentados son: learning rate 2e-05, batch de entrenamiento 16, batch de evaluación 16, acumulación de gradientes 2 (batch total 32), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con warmup ratio 0.01, 20 épocas, semilla 3407 y precisión mixta nativa (AMP). El mejor checkpoint reportado corresponde a la época 7, con loss de validación 0.0707 y micro F1 de 0.7150. No se documentan detalles sobre el volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO (no aplicable a esta tarea).

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) en texto biomédico en inglés, con esquema IOB de dos clases.
- Extracción de entidades en dominios clínicos y de literatura científica, gracias al preentrenamiento sobre PubMedBERT y TAPT.
- Inferencia por token con etiquetas a nivel de subtoken, adecuada para pipelines de extracción de información.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Extracción de entidades en abstracts de PubMed: el modelo puede procesar textos científicos y etiquetar entidades de dos clases con esquema IOB, aprovechando el preentrenamiento biomédico para vocabulario especializado.
- Anotación asistida de corpus clínicos: integrado en herramientas de anotación, permite preetiquetar documentos y reducir el esfuerzo manual de revisión humana, con un F1 en torno a 0,71 como referencia.
- Preprocesado en pipelines de minería de literatura: servir como primer paso para normalización de entidades antes de resolverlas contra ontologías médicas.
- Clasificación de menciones en informes clínicos estructurados: el modelo puede etiquetar secuencias cortas en inglés con bajo coste computacional dado su tamaño de 108 M de parámetros.
- Baseline de referencia en experimentos de NER biomédico: útil para comparar variantes de tokenizador, TAPT o esquemas de etiquetado en dos clases.
- Despliegue en entornos con recursos limitados: al ser un encoder de 0,4 GB, puede ejecutarse en CPU o GPU consumer para tareas de inferencia por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación (época 7, mejor checkpoint):

| Metrica | Valor |
|---|---|
| Loss | 0.0698 |
| Precision | 0.7056 |
| Recall | 0.7247 |
| Micro F1 | 0.7150 |
| Weighted F1 | 0.7150 |
| Macro F1 | 0.7207 |
| Accuracy | 0.9847 |

El model-index oficial no incluye resultados adicionales (`results: []`). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para pesos, más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB para batches pequeños.
- VRAM estimada en fp16: alrededor de 0,25 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers con pipeline de token-classification, TorchScript, ONNX Runtime, o servidores de inferencia como TGI (con soporte de token classification limitado) y FastAPI con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tapt-orig-combdata-pubmedbert-2class-baseline-label_all_false | 108,9 M | no disponible | NER biomédico 2 clases | apache-2.0 | Hugging Face |
| PubMedBERT base (microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract) | ~110 M | 512 tokens | MLM biomédico (base para fine-tuning) | MIT | Hugging Face |
| BERT base uncased (google-bert/bert-base-uncased) | ~110 M | 512 tokens | MLM general | Apache 2.0 | Hugging Face |
| BioBERT base | ~110 M | 512 tokens | MLM biomédico | Apache 2.0 | Hugging Face |

La comparación se limita a modelos base de tamaño similar; no se dispone de resultados de benchmarks comparables publicados para este checkpoint frente a alternativas afinadas en la misma tarea.

## Limitaciones y advertencias

- Modelo especializado en NER de dos clases: no es un modelo generativo ni un asistente conversacional; su uso fuera de clasificación de tokens no es válido.
- Rendimiento moderado: F1 micro de 0,7150 indica margen de mejora; la precisión (0,7056) y el recall (0,7247) sugieren falsos positivos y negativos relevantes en producción.
- Sesgos: no documentados por el autor; al entrenarse sobre literatura biomédica en inglés, puede heredar sesgos de dominio y de vocabulario clínico.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir etiquetados incorrectos o sobreconfiados en entidades fuera de distribución.
- Limitación de idioma: solo inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada; se asume la del backbone BERT (512 tokens), pero no está confirmada en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta condiciones adicionales ni datos de entrenamiento que permitan auditar procedencia.
- Model card incompleta: las secciones de descripción, usos previstos y datos de entrenamiento no están completadas, lo que dificulta la reproducibilidad.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni reportes independientes de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Mardiyyah/tapt-orig-combdata-pubmedbert-2class-baseline-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-baseline-combinedData
- Dataset de fine-tuning: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- Repositorio Transformers: https://github.com/huggingface/transformers
- Paper PubMedBERT: https://arxiv.org/abs/2007.15779
