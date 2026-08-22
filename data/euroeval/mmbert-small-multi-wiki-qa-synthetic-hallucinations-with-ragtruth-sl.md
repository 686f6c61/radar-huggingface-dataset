# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sl

## Resumen

mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sl es un modelo de clasificación de tokens (token-classification) desarrollado por EuroEval, un proyecto europeo centrado en la evaluación de modelos de lenguaje. Se trata de una variante pequeña del encoder multilingüe mmBERT, ajustada específicamente para la detección de alucinaciones en respuestas de sistemas de pregunta-respuesta (QA) con recuperación aumentada (RAG). El modelo fue entrenado con datos sintéticos generados mediante el framework LettuceDetect, que produce respuestas con alucinaciones etiquetadas a nivel de token.

El modelo forma parte de una familia de variantes por idioma (se han identificado versiones para esloveno, inglés y feroés, entre otras) y su objetivo es servir como herramienta de evaluación y control de calidad en sistemas de generación de texto. Su relevancia actual radica en la creciente necesidad de detectar y mitigar alucinaciones en modelos generativos, especialmente en aplicaciones de QA y RAG, donde la fidelidad de la información es crítica.

Con 140,6 millones de parámetros, es un modelo compacto que se puede ejecutar en hardware de consumo, y su arquitectura se basa en un encoder transformer moderno y multilingüe, lo que lo hace adecuado para entornos de producción donde se requiere un detector de alucinaciones rápido y ligero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (encoder transformer multilingüe moderno, basado en ModernBERT) |
| Parametros totales | 140.642.306 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Safetensors (no se indican cuantizaciones adicionales) |
| Idiomas soportados | No disponible (el sufijo "sl" sugiere esloveno, pero no está confirmado; existen variantes para otros idiomas) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en mmBERT, un encoder multilingüe moderno introducido por JHU-DLP, que utiliza una arquitectura transformer con innovaciones como el aprendizaje de idiomas anillado (annealed language learning, ALL). Según el repositorio del proyecto, mmBERT se entrenó con 3 billones de tokens en 1.833 idiomas, superando a XLM-R en varias tareas multilingües. La variante "small" de mmBERT cuenta con 140 millones de parámetros.

Para esta tarea específica, el modelo fue fine-tuneado para clasificación de tokens con el objetivo de etiquetar tokens como alucinados o no alucinados en respuestas de QA. El entrenamiento se realizó con datos sintéticos generados por el pipeline de dos etapas descrito en el paper "A multilingual hallucination benchmark: MultiWikiQHalluA": se construye un contexto MultiWikiQA (preguntas y respuestas correctas de Wikipedia) y se pasan a un modelo de lenguaje (LLM) que genera respuestas con alucinaciones etiquetadas a nivel de token. Posteriormente, el modelo se ajusta para predecir estas etiquetas.

No se dispone de información sobre hiperparámetros concretos de entrenamiento (tasa de aprendizaje, épocas, régimen de precisión) ni sobre el volumen exacto de datos de entrenamiento.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas de sistemas de QA y RAG.
- Clasificación de tokens (etiquetado de secuencias), con pipeline de `token-classification` de HuggingFace.
- Capacidad multilingüe heredada de mmBERT, aunque la variante con sufijo "sl" podría estar especializada en un idioma concreto (posiblemente esloveno).
- Integración con la librería `transformers` y compatible con `endpoints_compatible`, lo que facilita su despliegue en servicios de inferencia.
- No se indican capacidades de generación de texto, tool calling ni agentes; el modelo es exclusivamente para clasificación de tokens.

## Casos de uso

- **Detección de alucinaciones en sistemas de QA empresariales**: integración como capa de validación posterior a un sistema RAG para etiquetar tokens no fieles al contexto, permitiendo alertar al usuario o rechazar la respuesta.
- **Control de calidad en pipelines de generación de texto**: uso en CI/CD para verificar que las respuestas generadas por modelos de lenguaje no contengan información inventada antes de publicarlas.
- **Evaluación de sistemas RAG multilingües**: despliegue en aplicaciones que atienden a usuarios en varios idiomas (con las variantes correspondientes) para detectar alucinaciones en respuestas generadas.
- **Investigación académica sobre alucinaciones**: como modelo de referencia en estudios de detección de alucinaciones, especialmente en contextos multilingües y con datos sintéticos.
- **Auditoría de respuestas en chatbots de atención al cliente**: integración en el backend de un chatbot para marcar respuestas sospechosas y derivar a un agente humano.
- **Filtrado de contenido en herramientas de escritura asistida**: detección de afirmaciones falsas en textos generados para aplicaciones de documentación o noticias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante en la información disponible. El paper asociado (arXiv:2605.02504v2) introduce el benchmark MultiWikiQHalluA, pero no se proporcionan métricas concretas del modelo (por ejemplo, F1, precisión, recall) en la model card ni en los resultados de búsqueda. Se recomienda consultar el paper para obtener datos de evaluación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 140,6 millones de parámetros, en precisión fp32 se requieren aproximadamente 560 MB solo para los pesos. En fp16 serían unos 280 MB. El tamaño del repositorio (1.2 GB) sugiere que puede incluir múltiples archivos (por ejemplo, optimizadores o checkpoints adicionales). Para inferencia básica, una GPU con 4 GB de VRAM es suficiente.
- **GPU recomendadas**: cualquier GPU consumer de gama media, como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superior. También puede ejecutarse en CPU para inferencias puntuales, aunque con menor velocidad.
- **Capacidad en consumer GPU**: sí, cabe en la mayoría de las GPU consumer actuales.
- **Opciones de despliegue**: al ser un modelo de la librería `transformers`, puede servirse con vLLM (aunque suele estar optimizado para modelos generativos), con Hugging Face Inference Endpoints (endpoints_compatible), o con frameworks como FastAPI + PyTorch. También se puede exportar a ONNX o TensorRT para optimizar.
- **Latencia y throughput**: no se dispone de datos concretos, pero para un modelo de este tamaño se esperan latencias en el orden de pocos milisegundos por secuencia en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmBERT-small (este modelo) | 140M | Encoder moderno multilingüe | No disponible | No disponible | Hugging Face |
| XLM-R-base | 278M | Transformer multilingüe (RoBERTa) | 512 tokens | MIT | Hugging Face |
| mBERT (multilingual BERT) | 172M | Transformer (BERT) | 512 tokens | Apache 2.0 | Hugging Face |
| ModernBERT-base | 149M | Encoder moderno (solo inglés) | 8192 tokens | Apache 2.0 | Hugging Face |

La comparativa es orientativa: mmBERT-small es un encoder multilingüe moderno, similar en tamaño a mBERT y XLM-R-base, pero con arquitectura más eficiente (modernBERT) y entrenamiento con annealed language learning. No se dispone de datos de rendimiento comparativo en tareas de detección de alucinaciones para estos modelos.

## Limitaciones y advertencias

- **Licencia no disponible**: no se especifica la licencia de uso, por lo que no se puede confirmar si es apto para uso comercial o requiere atribución. Se debe contactar con el autor antes de usarlo en producción.
- **Idiomas no confirmados**: el sufijo "sl" sugiere esloveno, pero no se ha confirmado en la model card. Si se usa con otros idiomas, el rendimiento puede degradarse.
- **Datos de entrenamiento sintéticos**: el modelo se entrena con datos sintéticos generados por un LLM, lo que puede introducir sesgos o errores sistemáticos en la detección de alucinaciones reales.
- **Alucinaciones fuera de dominio**: el modelo se centra en QA con contexto de Wikipedia; puede no generalizar bien a otros dominios (médico, legal, técnico).
- **Riesgo de falsos positivos/negativos**: como detector de alucinaciones, puede fallar en casos de alucinaciones sutiles o en contextos muy específicos.
- **Sin información de sesgos**: no se ha evaluado ni documentado la presencia de sesgos de género, raza, cultura, etc.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sl)
- [Variante en inglés](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en)
- [Variante en feroés](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo)
- [Paper: A multilingual hallucination benchmark: MultiWikiQHalluA](https://arxiv.org/pdf/2605.02504v2)
- [Repositorio de mmBERT (JHU-LSP)](https://github.com/JHU-CLSP/mmBERT/)
- [Paper de referencia sobre emisiones de carbono (Lacoste et al., 2019)](https://arxiv.org/abs/1910.09700)
