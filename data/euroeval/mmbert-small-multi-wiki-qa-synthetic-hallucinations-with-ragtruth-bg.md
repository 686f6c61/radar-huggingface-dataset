# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bg

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bg` es un modelo de clasificación de tokens (token-classification) basado en la arquitectura ModernBERT, desarrollado por el grupo EuroEval. Su nombre sugiere que está especializado en la detección de alucinaciones en respuestas generadas por sistemas de generación aumentada por recuperación (RAG), entrenado con datos sintéticos derivados del conjunto RAGTruth y orientado al idioma búlgaro (indicado por el sufijo "bg"). Sin embargo, la model card oficial no proporciona detalles confirmados sobre el entrenamiento, los datos o el uso previsto.

Con 140,6 millones de parámetros, se trata de un modelo de tamaño pequeño-medio, adecuado para tareas de clasificación a nivel de token en entornos con recursos limitados. La ausencia de documentación detallada y de métricas de evaluación publicadas limita su adopción inmediata en producción, aunque su arquitectura moderna y su enfoque específico lo convierten en una opción interesante para experimentación en el ámbito de la verificación de hechos y la robustez de sistemas RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (según tags de HuggingFace) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el sufijo "bg" sugiere búlgaro, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se identifica como ModernBERT, una evolución del BERT original que incorpora mejoras como atención eficiente y mayor longitud de contexto. No obstante, no se dispone de información oficial sobre el número de capas, dimensiones ocultas, o el mecanismo exacto de atención. El modelo está configurado para la tarea de clasificación de tokens, lo que implica una cabeza de clasificación por token sobre el encoder.

El nombre del modelo indica que fue entrenado con datos sintéticos de alucinaciones generados a partir del dataset RAGTruth, un recurso conocido para evaluar la fidelidad de respuestas en sistemas RAG. El sufijo "bg" apunta a un entrenamiento específico para búlgaro, aunque no hay confirmación en la model card. No se especifican hiperparámetros de entrenamiento, régimen de precisión, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Clasificación de tokens: el pipeline declarado es `token-classification`, por lo que el modelo asigna etiquetas a cada token de entrada, típicamente para tareas como NER, etiquetado POS o detección de segmentos problemáticos.
- Detección de alucinaciones (inferida por el nombre): probablemente identifica tokens o frases en una respuesta generada que no están respaldados por el contexto recuperado en un sistema RAG.
- Soporte multilingüe (no confirmado): el nombre incluye "multi", pero los idiomas exactos no están documentados.
- Sin capacidades de generación de texto: al ser un modelo encoder-only, no genera texto libre.
- Sin soporte de tool calling ni agentes: su arquitectura no está diseñada para interacción con herramientas externas.

## Casos de uso

- Verificación de alucinaciones en sistemas RAG: el modelo puede integrarse como un clasificador posterior a la generación para marcar tokens que no se corresponden con las fuentes recuperadas, ayudando a filtrar respuestas no fieles.
- Control de calidad en asistentes conversacionales: en un pipeline de atención al cliente, se puede usar para detectar afirmaciones inventadas en respuestas automáticas antes de enviarlas al usuario.
- Auditoría de contenidos generados: en plataformas de redacción asistida, puede señalar frases que se desvían del contexto proporcionado, reduciendo el riesgo de información errónea.
- Investigación académica sobre robustez de LLMs: sirve como herramienta de análisis para estudiar patrones de alucinación en modelos generativos, especialmente en búlgaro u otros idiomas si se confirma su alcance.
- Filtrado de datos para entrenamiento: puede preprocesar datasets de entrenamiento para eliminar o etiquetar respuestas con alucinaciones, mejorando la calidad de futuros modelos.
- Monitorización en tiempo real de sistemas de QA: desplegado como servicio, puede evaluar cada respuesta generada y emitir alertas cuando se detectan tokens no fieles al contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140M de parámetros, un modelo BERT-like en FP32 requiere aproximadamente 560 MB solo para los pesos. Con cuantización a INT8, se reduce a unos 140 MB. La memoria total necesaria, incluyendo activaciones y overhead, puede rondar los 1-2 GB para secuencias de longitud moderada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3050, o GPUs integradas modernas. Para inferencia en lote, una RTX 3090 o A10 permitiría mayor throughput.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo básicas.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con Hugging Face Inference Endpoints, o mediante frameworks como vLLM, TGI o FastAPI con la librería de transformers. También es posible ejecutarlo en CPU con ONNX Runtime.
- Latencia y throughput estimados: no disponibles. Para un modelo de este tamaño, en una GPU moderna se espera una latencia de pocos milisegundos por secuencia corta, pero no hay datos oficiales.

## Comparativa con modelos similares

Dado que no se dispone de información detallada sobre el modelo, la comparativa se limita a características generales inferidas. Modelos comparables por tamaño y tarea (clasificación de tokens) incluyen:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmBERT-small (este) | 140M | no disponible | token-classification | no disponible | HuggingFace |
| BERT-base multilingual | 172M | 512 | token-classification | Apache 2.0 | HuggingFace |
| XLM-RoBERTa-base | 270M | 512 | token-classification | MIT | HuggingFace |
| ModernBERT-base | 149M | 8192 | varios | Apache 2.0 | HuggingFace |

La comparativa es orientativa; no hay datos de rendimiento para este modelo en particular.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo entrenado con datos sintéticos, puede heredar sesgos de los datos generados o del proceso de síntesis.
- Riesgo de alucinación: paradójicamente, el modelo está diseñado para detectar alucinaciones, pero su propia salida (etiquetas de tokens) puede ser incorrecta si los datos de entrenamiento no son representativos.
- Limitaciones de contexto: al ser un modelo BERT-like, la longitud de contexto probablemente esté limitada a 512 tokens (no confirmado), lo que restringe su uso en documentos largos.
- Limitaciones de idioma: el sufijo "bg" sugiere que está especializado en búlgaro, pero no hay confirmación de otros idiomas. Su uso en otros idiomas podría degradar el rendimiento.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar su uso comercial sin riesgo legal.
- Caveat de producción: la ausencia de benchmarks y documentación técnica impide validar su fiabilidad en entornos reales. Se recomienda una evaluación exhaustiva antes de cualquier despliegue.

## Enlaces

- [HuggingFace - EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bg](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bg)
- [Paper de BERT (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700) — referenciado en los tags, aunque no es específico de este modelo.
