# konji2/bert-finetuned-ner

## Resumen

`konji2/bert-finetuned-ner` es un modelo de clasificación de tokens (token classification) obtenido por fine-tuning de `google-bert/bert-base-cased` para la tarea de reconocimiento de entidades nombradas (NER). Lo publica el usuario konji2 en Hugging Face y se generó automáticamente con la clase `Trainer` de la librería Transformers, sin model card redactada manualmente ni documentación del conjunto de datos empleado.

El modelo es relevante únicamente como artefacto de ejemplo o de experimentación: sus métricas declaradas en la model card son nulas en precisión, recall y F1 (0.0 en las tres) y la accuracy se sitúa en 0.4, con una pérdida de validación de 3.6916. Es decir, el entrenamiento no produjo un extractor de entidades funcional, probablemente por un problema de configuración del pipeline de datos o de las etiquetas, y no debería usarse en producción.

Arquitectónicamente es un transformer encoder BERT base (12 capas, 768 dimensiones ocultas, 110 millones de parámetros) en su variante cased, con un total de 107.729.677 parámetros según los pesos en safetensors. El repositorio ocupa 0,9 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 dim. ocultas, 12 cabezas de atencion) |
| Parametros totales | 107.729.677 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (maximo estandar de bert-base-cased; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en fp32; no se publican versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (el modelo base es multilingue parcial por entrenamiento en corpus ingles, pero no se declara en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-cased`, un transformer encoder bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con objetivos de masked language modeling y next sentence prediction. Sobre esa base se añade una cabeza de clasificación de tokens para etiquetado de entidades.

El fine-tuning se realizó con los siguientes hiperparámetros declarados en la model card: learning rate 2e-05, batch de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal y 3 épocas. El conjunto de datos de entrenamiento aparece como "None" en la model card, por lo que no se puede verificar su composición, tamaño ni esquema de etiquetas (BIO, BILOU, etc.). No se documenta ningún proceso de RLHF, DPO ni innovación técnica adicional. Las versiones de framework indicadas son Transformers 5.22.1, PyTorch 2.15.0+cu132, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de tokens a nivel de token (token classification), pensada para reconocimiento de entidades nombradas.
- Etiquetado de secuencias con la cabeza de clasificación entrenada, aunque sin garantías de calidad dado el estado de las métricas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe verificada.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.
- Al ser un encoder BERT, no genera texto libre de forma fiable; su uso previsto es la extracción de etiquetas.

## Casos de uso

- Prototipado de pipelines de NER en entornos de desarrollo: sirve como esqueleto para validar la integración con `pipeline("token-classification")` de Transformers antes de sustituirlo por un modelo funcional.
- Pruebas de infraestructura de inferencia: útil para verificar el despliegue de modelos de 110 M de parámetros en servicios tipo TGI o endpoints de Hugging Face, dado que el repo es compatible con `endpoints_compatible`.
- Docencia y reproducción de fine-tuning: permite ilustrar el flujo completo de `Trainer` con BERT base, incluidos los hiperparámetros registrados, para después corregir los fallos de etiquetado que producen F1 = 0.
- Evaluación comparativa de fallos: como caso negativo de referencia para estudiar qué ocurre cuando el esquema de etiquetas o el dataset no se configuran correctamente en un fine-tuning de NER.
- Base para un reentrenamiento: se puede reutilizar el checkpoint como inicialización y repetir el fine-tuning con un dataset NER documentado (CoNLL-2003, WikiANN, etc.) para obtener un modelo útil.
- Extracción de entidades en textos en inglés con revisión humana obligatoria: solo en escenarios de baja criticidad donde un etiquetado parcial se valide manualmente, dado que las métricas publicadas no respaldan un uso automatizado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 3.6916 |
| Precision | 0.0 |
| Recall | 0.0 |
| F1 | 0.0 |
| Accuracy | 0.4 |

Evolución por épocas según la model card:

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 249 | 3.5005 | 0.0 | 0.0 | 0.0 | 0.4 |
| 2.0 | 498 | 3.6421 | 0.0 | 0.0 | 0.0 | 0.4 |
| 3.0 | 747 | 3.6916 | 0.0 | 0.0 | 0.0 | 0.4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (107,7 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16/bf16: alrededor de 0,22 GB de pesos, con margen amplio para batch pequeño.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; también funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer sin problema, e incluso en entornos con poca memoria.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, Text Generation Inference (TGI) para endpoints compatibles, y exportación a ONNX. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| konji2/bert-finetuned-ner | 107,7 M | 512 (estandar BERT) | NER | Apache 2.0 | F1 0.0 declarado |
| dslim/bert-base-NER | 108 M aprox. | 512 | NER | MIT | Fine-tuning funcional sobre CoNLL-2003 |
| Jean-Baptiste/roberta-large-ner-english | 355 M aprox. | 512 | NER | MIT | Fine-tuning funcional, mayor tamaño |
| google-bert/bert-base-cased | 108 M | 512 | MLM base | Apache 2.0 | Modelo base sin cabeza NER |

La comparación se limita a características estructurales: los dos modelos NER alternativos son fine-tunings funcionales con métricas publicadas, mientras que `konji2/bert-finetuned-ner` declara F1 de 0.0. No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Métricas de evaluación nulas: precisión, recall y F1 iguales a 0.0 y accuracy de 0.4 indican que el modelo no extrae entidades de forma fiable.
- Pérdida de validación elevada (3.6916) y creciente entre épocas, señal de un entrenamiento mal configurado o de un esquema de etiquetas inconsistente.
- Dataset de entrenamiento no documentado ("None" en la model card), lo que impide conocer la distribución, el dominio y el esquema de etiquetas.
- Riesgo alto de alucinación en el sentido de etiquetar tokens con clases incorrectas o de no detectar entidades reales; no apto para producción sin reentrenamiento y validación.
- Idiomas soportados no declarados; el modelo base está entrenado principalmente en inglés, por lo que el comportamiento en castellano no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de calidad funcional hace desaconsejable cualquier despliegue comercial.
- Sin model card redactada manualmente ni información sobre sesgos; no se puede evaluar el impacto diferencial por dominio o demografía.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin señales de uso o validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/konji2/bert-finetuned-ner
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Documentación de BERT en Transformers: https://huggingface.co/docs/transformers/model_doc/bert
- Guía de token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- Paper original de BERT: https://arxiv.org/abs/1810.04805
