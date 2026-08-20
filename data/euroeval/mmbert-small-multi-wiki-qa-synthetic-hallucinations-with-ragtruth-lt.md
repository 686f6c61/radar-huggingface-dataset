# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lt

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lt` es un modelo de clasificación de tokens (token-classification) publicado en HuggingFace por el colectivo EuroEval. Según su nombre, está diseñado para la detección de alucinaciones en respuestas generadas por sistemas de pregunta-respuesta con recuperación aumentada (RAG), utilizando datos sintéticos multilingües de Wikipedia. El sufijo `lt` sugiere una variante para lituano, aunque los idiomas oficiales no están declarados.

Con 140,6 millones de parámetros y una arquitectura basada en ModernBERT (según los tags), se trata de un modelo de tamaño pequeño-medio, adecuado para tareas de clasificación a nivel de token con consumo de recursos moderado. La licencia, el conjunto de datos de entrenamiento y los detalles técnicos completos no se han publicado en la model card, que está prácticamente vacía. A pesar de la falta de documentación, el modelo puede ser útil como referencia para investigación en detección de alucinaciones, aunque su uso en producción requeriría una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere multilingüe y variante lituana) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una evolución de BERT con mejoras en eficiencia y manejo de secuencias largas. Sin embargo, la model card no proporciona detalles sobre la configuración exacta (número de capas, heads, dimensiones ocultas) ni sobre el proceso de entrenamiento. El nombre del modelo indica que se realizó un fine-tuning sobre un modelo base `mmBERT-small` (probablemente un BERT multilingüe pequeño) con un conjunto de datos sintético de QA con RAG, etiquetado con la presencia o ausencia de alucinaciones (`ragtruth`). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco hay información sobre hiperparámetros, régimen de entrenamiento o hardware utilizado.

## Capacidades

- Clasificación de tokens para identificar segmentos de texto que constituyen alucinaciones en respuestas generadas con RAG.
- Posiblemente funciona como un clasificador binario a nivel de token (etiquetas como "verdadero" o "alucinado").
- Al estar basado en ModernBERT, hereda capacidades de comprensión contextual multilingüe, aunque no se ha confirmado el alcance de los idiomas.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades generativas; es un modelo encoder para clasificación.

## Casos de uso

- **Verificación de respuestas en sistemas de QA con RAG**: el modelo puede etiquetar tokens de una respuesta generada para marcar partes que no se sustentan en el contexto recuperado, permitiendo un post-procesado que filtre o resalte contenido no fiable.
- **Auditoría de pipelines de generación**: integrarlo en un sistema de monitoreo para detectar alucinaciones en logs de respuestas de asistentes virtuales, con un coste computacional moderado (140M parámetros).
- **Análisis de calidad de datasets**: aplicar el modelo a conjuntos de respuestas generadas automáticamente para identificar y limpiar instancias con alucinaciones antes de usarlas en entrenamiento.
- **Evaluación de sistemas RAG**: comparar la tasa de alucinaciones entre diferentes configuraciones de recuperación o modelos generadores, usando las etiquetas del modelo como métrica aproximada.
- **Filtrado en tiempo real en aplicaciones de soporte**: integrarlo como un clasificador ligero en un entorno de despliegue (por ejemplo, con ONNX o TensorRT) para bloquear respuestas con alto contenido de alucinación antes de enviarlas al usuario.
- **Investigación en detección de alucinaciones**: servir como baseline de referencia para estudios académicos que comparen métodos de detección, dado que es un modelo pequeño y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de exactitud, F1, ni comparaciones con otros modelos de detección de alucinaciones.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 140M parámetros en fp32 (~560 MB) o fp16 (~280 MB), se puede ejecutar en GPUs con 4 GB o menos. No se han publicado requisitos oficiales.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, T4). Para inferencia en lote, una T4 o A10 es suficiente.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo como la RTX 3060 o superiores.
- **Opciones de despliegue**: se puede usar con `transformers` en Python, o exportar a ONNX para aceleración. También es compatible con `endpoints_compatible` según el tag, lo que sugiere que puede desplegarse en plataformas de inferencia gestionada.
- **Latencia y throughput**: no se han publicado datos. Como modelo pequeño, se espera una latencia de decenas de milisegundos por secuencia en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de alucinaciones en QA con RAG) dentro de la información proporcionada. No se puede realizar una comparativa fiable sin datos de benchmarks.

## Limitaciones y advertencias

- **Documentación ausente**: la model card está vacía; no se conoce el conjunto de entrenamiento, el proceso de etiquetado ni los datos de validación, lo que limita la confiabilidad del modelo.
- **Sesgos potenciales**: al ser entrenado con datos sintéticos, puede no generalizar bien a texto real de dominios diferentes.
- **Riesgo de alucinación**: el modelo no genera texto, solo clasifica, pero su exactitud depende de la calidad del etiquetado sintético; puede cometer falsos positivos o negativos.
- **Idiomas no confirmados**: aunque el nombre sugiere multilingüismo y una variante lituana, no hay documentación sobre qué idiomas soporta realmente.
- **Licencia no especificada**: no se puede determinar si es permitido su uso comercial o derivado.
- **Uso en producción**: sin benchmarks ni validación externa, no se recomienda su uso en sistemas críticos sin una evaluación adicional.

## Enlaces

- [Hugging Face - EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lt](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lt)

No se han encontrado otros enlaces (papers, repos, demos) en la información proporcionada.
