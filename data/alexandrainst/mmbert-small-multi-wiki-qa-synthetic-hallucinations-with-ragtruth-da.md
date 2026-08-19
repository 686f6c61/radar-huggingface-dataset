# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-da

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-da` es un clasificador de tokens basado en la arquitectura ModernBERT, desarrollado por el Alexandra Institute (alexandrainst), un centro de investigación danés especializado en IA aplicada. Su propósito principal es la detección de alucinaciones en respuestas generadas por sistemas de recuperación aumentada (RAG), concretamente en el idioma danés (indicado por el sufijo "da"). El nombre sugiere que fue entrenado sobre un conjunto de datos sintético de preguntas y respuestas multilingüe (multi-wiki-qa) con anotaciones de alucinaciones generadas de forma sintética y veracidad de RAG (ragtruth).

El modelo cuenta con 140,6 millones de parámetros y se distribuye en formato safetensors. Está diseñado para la tarea de clasificación de tokens, lo que permite identificar a nivel de token qué partes de una respuesta generada son factualmente incorrectas o no están respaldadas por el contexto recuperado. Aunque la model card es extremadamente escasa y no proporciona detalles sobre el entrenamiento, la licencia o los idiomas soportados, el modelo es relevante para la comunidad que trabaja en verificación de hechos y robustez de sistemas RAG, especialmente en lenguas de baja representación como el danés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder-only) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 o 1024 tokens, segun ModernBERT base) |
| Tipos de cuantizacion | no disponible (safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el nombre sugiere danés, pero el entrenamiento fue multi-wiki-qa) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura transformer encoder-only optimizada para eficiencia y velocidad, que utiliza atención con máscara de padding y posiciones rotativas. Aunque no se han publicado detalles específicos del entrenamiento, el nombre del modelo indica que fue afinado a partir de un modelo base ModernBERT (probablemente `answerdotai/ModernBERT-base`) sobre un conjunto de datos sintético de preguntas y respuestas extraídas de Wikipedia en varios idiomas, con anotaciones de alucinaciones generadas sintéticamente y señales de verdad de RAG. La tarea de clasificación de tokens sugiere que el modelo fue entrenado para predecir si cada token es parte de una afirmación alucinada o no, probablemente mediante una cabeza de clasificación por token sobre las representaciones del encoder.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se utilizaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura ModernBERT.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por sistemas RAG.
- Clasificación de tokens como "alucinado" o "no alucinado" (probablemente etiquetas binarias).
- Adaptación al idioma danés, aunque el entrenamiento multilingüe podría permitir cierta transferencia a otros idiomas.
- Integración con pipelines de token-classification de la librería transformers.
- Compatibilidad con endpoints de HuggingFace para inferencia en producción.

No se conocen capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso, ya que es un modelo encoder-only orientado a clasificación.

## Casos de uso

- Verificación de respuestas en sistemas RAG en danés: el modelo puede integrarse en un pipeline de QA para marcar automáticamente qué partes de una respuesta generada no están respaldadas por los documentos recuperados, mejorando la fiabilidad del sistema.
- Auditoría de chatbots corporativos: empresas danesas que despliegan asistentes virtuales basados en RAG pueden usar este modelo para detectar y filtrar alucinaciones antes de que lleguen al usuario final.
- Construcción de datasets de entrenamiento: las predicciones del modelo pueden utilizarse para generar etiquetas débiles (weak labels) para entrenar modelos más grandes o para crear conjuntos de datos de verificación de hechos.
- Monitorización de calidad en producción: el modelo puede ejecutarse como un servicio de clasificación en tiempo real para evaluar la tasa de alucinaciones en logs de respuestas y alertar cuando supere un umbral.
- Investigación académica en alucinaciones de LLM: sirve como herramienta de análisis para estudiar patrones de alucinación en contextos multilingües, especialmente en lenguas escasamente representadas.
- Filtrado previo en generación aumentada por recuperación: antes de presentar una respuesta al usuario, el modelo puede resaltar los segmentos problemáticos para que un humano los revise o para que el sistema los reformule.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, comparaciones con otros modelos ni datos de rendimiento en tareas estándar como MMLU o HumanEval. Se recomienda evaluar el modelo en un conjunto de validación propio antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: para un modelo de 140M de parámetros en fp32, la inferencia requiere aproximadamente 0,6 GB de VRAM (140M × 4 bytes). Con cuantización a int8, se reduce a ~0,15 GB. En la práctica, con el overhead de la implementación de transformers, se recomienda al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo GPUs de consumo como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad para lotes pequeños.
- Opciones de despliegue: compatible con la librería transformers, puede servirse con vLLM, TGI, o mediante el pipeline de token-classification de HuggingFace. También es posible exportar a ONNX para inferencia en CPU.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño pequeño, se espera una latencia de decenas de milisegundos por secuencia en GPU y de unos pocos cientos de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (detección de alucinaciones en danés con clasificación de tokens). Como referencia arquitectónica, se puede comparar con el modelo base ModernBERT (140M parámetros) y con otros clasificadores de alucinaciones multilingües, pero no hay datos de rendimiento disponibles para establecer una comparación rigurosa.

| Modelo | Parámetros | Tarea | Idiomas | Licencia |
|---|---|---|---|---|
| mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-da | 140M | Token classification (detección de alucinaciones) | Danés (principal) | no disponible |
| answerdotai/ModernBERT-base | 149M | Base encoder | Multilingüe | Apache 2.0 |
| Otros detectores de alucinaciones (p. ej., HaluEval, SelfCheckGPT) | variable | Detección a nivel de frase | Multilingüe | variable |

## Limitaciones y advertencias

- La model card es prácticamente vacía: no se especifican licencia, idiomas exactos, datos de entrenamiento ni procedencia del conjunto de datos. Esto dificulta evaluar la idoneidad legal y técnica para uso comercial.
- El modelo fue entrenado con datos sintéticos, lo que puede introducir sesgos y una distribución diferente a la de datos reales de producción. Las alucinaciones sintéticas pueden no reflejar la variedad de errores de los LLM reales.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión, recall o F1 en tareas reales de detección de alucinaciones.
- El enfoque en danés puede limitar su eficacia en otros idiomas, a pesar del entrenamiento multilingüe del dataset base.
- Al ser un modelo encoder-only, no puede generar texto; solo clasifica tokens existentes. No es adecuado para tareas de generación.
- Riesgo de alucinación en sus propias predicciones: como cualquier clasificador, puede cometer errores, especialmente en contextos ambiguos o con vocabulario especializado.
- No se indica si el modelo fue sometido a auditorías de sesgo o equidad. Se recomienda realizar pruebas específicas antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-da
- Paper de referencia sobre estimación de emisiones (citado en la model card, no relacionado con el modelo): https://arxiv.org/abs/1910.09700

No se han encontrado repositorios de código, demos o documentación adicional más allá de la página del modelo.
