# danielvacha/bert-finetuned-ner

## Resumen

`danielvacha/bert-finetuned-ner` es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning de `google-bert/bert-base-cased` sobre un conjunto de datos no especificado por el autor. Lo desarrolla el usuario de Hugging Face danielvacha y se publica bajo licencia Apache 2.0. El modelo resuelve la tarea de token classification, es decir, asignar una etiqueta BIO a cada token de entrada para identificar entidades como personas, organizaciones o localizaciones, aunque la taxonomía concreta de etiquetas no se documenta en la model card.

Arquitectonicamente es un transformer encoder puro de tipo BERT en su variante *cased* (sensible a mayúsculas), con 107.726.601 parámetros totales y un contexto máximo de 512 tokens, herencia directa de la arquitectura original de BERT-base. No incorpora innovaciones posteriores como atención lineal, MoE o decodificación especulativa: es un fine-tuning convencional con `Trainer` de Hugging Face, AdamW fused, scheduler lineal y 3 épocas de entrenamiento.

Su relevancia es limitada y de nicho: se trata de un modelo de bajo perfil (37 descargas, 0 likes en el momento de la consulta) cuya model card está generada automáticamente y contiene secciones sin completar ("More information needed"). Resulta útil como ejemplo reproducible de fine-tuning para NER o como punto de partida para experimentación, pero no como componente de producción sin una evaluación adicional sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, variante *cased*) |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-base) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors en fp32) |
| Idiomas soportados | no disponible (el modelo base es multilingüe-inglés; el dataset de fine-tuning no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `BertForTokenClassification` construido sobre `bert-base-cased`: 12 capas de transformer encoder, atención multi-cabeza bidireccional completa y embeddings de tokens, posiciones y segmentos. La cabeza de clasificación proyecta el estado oculto de cada token a la dimensión del vocabulario de etiquetas NER definido en el dataset de fine-tuning (no documentado). El tokenizador es el WordPiece cased de BERT, por lo que distingue mayúsculas y minúsculas, algo relevante para NER en textos con nombres propios.

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 3 épocas, con `learning_rate=2e-05`, `train_batch_size=8`, `eval_batch_size=8`, semilla 42, optimizador `ADAMW_TORCH_FUSED` (betas 0.9/0.999, epsilon 1e-08) y scheduler lineal. El conjunto de datos de entrenamiento y evaluación no se especifica en la model card ("unknown dataset"), lo que impide conocer la composición, el número de tokens vistos ni la taxonomía de etiquetas. No se documenta RLHF, DPO ni ninguna técnica de alineación; es un fine-tuning supervisado estándar. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.12.0+cpu, Datasets 4.8.4 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de tokens a nivel de token (token classification), típicamente para reconocimiento de entidades nombradas con esquema BIO.
- Detección de entidades en texto sensible a mayúsculas gracias al tokenizador *cased*.
- Procesamiento de secuencias de hasta 512 tokens por pasada.
- No soporta generación de texto: es un encoder discriminativo, no un modelo causal.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo *thinking*, visión, audio ni multimodalidad.
- Capacidades multilingües: no documentadas; el modelo base BERT-base-cased está entrenado principalmente en inglés, pero el dominio del fine-tuning es desconocido.

## Casos de uso

- Extracción de entidades en pipelines de NLP: usar el modelo como componente de token classification dentro de un pipeline de `transformers` (`pipeline("token-classification")`) para etiquetar entidades en documentos de hasta 512 tokens, con división en *chunks* con solapamiento para textos más largos.
- Prototipado rápido de NER específico de dominio: al ser un fine-tuning ligero y con licencia Apache 2.0, sirve como base para comparar contra otros checkpoints NER antes de invertir en un entrenamiento propio.
- Anonimización o enmascarado de datos personales: si la taxonomía incluye etiquetas de persona u organización, puede integrarse en un paso previo de redacción de PII antes de almacenar o enviar textos a otros servicios.
- Enriquecimiento de metadatos en bases documentales: etiquetar menciones de entidades en artículos, contratos o informes para construir índices de búsqueda facetados por entidad.
- Evaluación comparativa de fine-tunings BERT: como checkpoint de referencia para medir el impacto de hiperparámetros (learning rate, épocas, batch size) en tareas de token classification.
- Docencia y reproducibilidad: ejemplo mínimo de fine-tuning con `Trainer` para cursos o tutoriales sobre NER, dado que la configuración de entrenamiento está documentada en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación (no identificado):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0.3480 |
| Precision | 0.7473 |
| Recall | 0.7307 |
| F1 | 0.7389 |
| Accuracy | 0.8776 |

Evolución por época:

| Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 1756 | 0.4739 | 0.6252 | 0.6116 | 0.6183 | 0.8169 |
| 2.0 | 3512 | 0.3701 | 0.7134 | 0.6957 | 0.7044 | 0.8633 |
| 3.0 | 5268 | 0.3480 | 0.7473 | 0.7307 | 0.7389 | 0.8776 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, CoNLL-2003, etc.) en la información disponible; el `model-index` del autor está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (107,7 M parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en GPU para batches pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 4060, T4, L4). Para entrenamiento o fine-tuning, se recomienda RTX 3090/4090, A10G, L4 o A100 si se busca throughput alto.
- Cabe en GPU consumer: sí, en todas las generaciones recientes; también puede ejecutarse en CPU para inferencia de baja concurrencia (el autor entrenó con PyTorch 2.12.0+cpu).
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, `TextClassificationPipeline` adaptado, ONNX Runtime, TorchScript, o servidores de inferencia como TGI (si se exporta a un formato compatible) y FastAPI + `transformers` para servicios ligeros. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama no son opciones directas sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un BERT-base en GPU moderna se espera del orden de milisegundos por secuencia de 512 tokens, pero no se aporta medición concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danielvacha/bert-finetuned-ner | 107,7 M | 512 | Token classification (NER) | Apache 2.0 | Hugging Face, 37 descargas |
| dslim/bert-base-NER | ~108 M | 512 | NER (CoNLL-2003, 4 clases) | MIT | Hugging Face, muy popular |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | 512 | NER inglés | MIT | Hugging Face |
| google-bert/bert-base-cased (base) | 108 M | 512 | Masked LM (no NER) | Apache 2.0 | Hugging Face |

La comparación cuantitativa de rendimiento con estos modelos no está disponible en la información proporcionada; los valores F1 de los alternativos no se han verificado en esta ficha y no deben asumirse.

## Limitaciones y advertencias

- La model card está generada automáticamente e incompleta: no se documenta el dataset de entrenamiento, la taxonomía de etiquetas ni los dominios cubiertos, lo que impide evaluar su idoneidad para un caso concreto sin pruebas propias.
- Riesgo de alucinación y falsos positivos: como todo modelo discriminativo de NER, puede etiquetar incorrectamente tokens ambiguos; el F1 declarado (0,7389) indica un margen de error considerable.
- Sesgos desconocidos: al no conocerse el corpus de fine-tuning, no es posible caracterizar sesgos de dominio, género, geografía o idioma.
- Limitación de contexto: 512 tokens por pasada; textos más largos requieren segmentación con solapamiento, lo que puede partir entidades en los bordes.
- Idioma: el modelo base es principalmente inglés; el comportamiento en castellano u otros idiomas no está garantizado ni documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y atribución.
- Bajo mantenimiento: 0 likes, 37 descargas y una única actualización el mismo día de creación sugieren un experimento puntual más que un modelo mantenido.
- No apto para generación: no debe usarse como modelo de lenguaje; su salida es una secuencia de etiquetas, no texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielvacha/bert-finetuned-ner
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Documentación de `BertForTokenClassification`: https://huggingface.co/docs/transformers/model_doc/bert
- Guía de token classification de Hugging Face: https://huggingface.co/docs/transformers/tasks/token_classification
- Paper original de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
