# Adi2335/nda-clause-classifier-v2

## Resumen

El modelo `Adi2335/nda-clause-classifier-v2` es un clasificador de texto especializado en la categorización de cláusulas de acuerdos de confidencialidad (NDA, por sus siglas en inglés). Desarrollado por el usuario Adi2335 y publicado en Hugging Face, el modelo está diseñado para asignar cada cláusula de un contrato a una categoría legal predefinida, como confidencialidad, ley aplicable, terminación, etc. Se basa en la arquitectura DistilBERT, una versión destilada de BERT que conserva la mayor parte de su rendimiento con un coste computacional significativamente menor.

Con 66,96 millones de parámetros, el modelo se enmarca en la categoría de modelos pequeños y eficientes, adecuados para tareas de clasificación de texto en entornos con recursos limitados. Su pipeline es `text-classification` y los pesos están disponibles en formato `safetensors`. La relevancia de este modelo radica en la creciente demanda de automatización en la revisión de contratos legales, donde la clasificación automática de cláusulas permite acelerar el análisis de documentos y reducir errores humanos. Sin embargo, la información pública disponible es muy limitada: la model card está prácticamente vacía y no se han publicado detalles sobre el entrenamiento, los datos utilizados ni las métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (inferida por el tag `distilbert`; no confirmada explícitamente) |
| Parametros totales | 66.960.393 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (DistilBERT base usa 512 tokens, pero no se especifica) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (probablemente inglés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es presumiblemente DistilBERT, un transformer encoder de 6 capas, 12 cabezas de atención y una dimensión oculta de 768, destilado del modelo BERT-base. DistilBERT reduce el tamaño del modelo en un 40% y es aproximadamente un 60% más rápido en inferencia, manteniendo alrededor del 97% de las capacidades lingüísticas de BERT. El modelo se ha fine-tuneado para la tarea específica de clasificación de cláusulas de NDA, lo que implica una capa de clasificación adicional sobre la representación de la secuencia.

No se dispone de información sobre el proceso de entrenamiento: no se especifican los datos utilizados, el número de épocas, la estrategia de optimización, ni si se empleó alguna técnica de ajuste adicional como aprendizaje por refuerzo o destilación de conocimiento. La model card no contiene más que la plantilla generada automáticamente, por lo que todos los detalles de entrenamiento se consideran no disponibles.

## Capacidades

- Clasificación de cláusulas de acuerdos de confidencialidad (NDA) en categorías legales predefinidas, como confidencialidad, ley aplicable, terminación, indemnización, etc.
- Procesamiento de texto legal en formato de cláusulas individuales, devolviendo una etiqueta de clase por entrada.
- Inferencia eficiente gracias a la arquitectura DistilBERT, adecuada para despliegue en CPU o GPUs de gama baja.
- Integración con el ecosistema Hugging Face Transformers, permitiendo su uso mediante pipelines estándar de clasificación de texto.
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face, según los tags del repositorio.
- No se han documentado capacidades adicionales como generación de texto, razonamiento multi-paso, tool calling o soporte multilingüe.

## Casos de uso

- Revisión automatizada de contratos NDA: el modelo puede procesar cada cláusula de un acuerdo y etiquetarla automáticamente, permitiendo a equipos legales identificar rápidamente secciones relevantes como confidencialidad, propiedad intelectual o ley aplicable.
- Preprocesamiento para análisis de riesgos: al clasificar cláusulas, se puede alimentar un sistema posterior que detecte términos desfavorables o riesgos legales, como se observa en herramientas similares del mercado.
- Búsqueda y recuperación de información en repositorios de contratos: las etiquetas generadas permiten indexar documentos legales y facilitar búsquedas por tipo de cláusula.
- Asistencia en la redacción de contratos: durante la creación de un NDA, el modelo puede sugerir categorías para cada sección redactada, ayudando a mantener una estructura coherente.
- Automatización de flujos de trabajo en despachos de abogados: integrado en un pipeline de procesamiento de documentos, reduce el tiempo de revisión manual de contratos estándar.
- Extracción de cláusulas específicas para due diligence: en procesos de fusión y adquisición, el modelo puede localizar y extraer cláusulas de no competencia o confidencialidad de grandes volúmenes de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, ni comparaciones con otros modelos. No se puede afirmar ningún dato de precisión, recall o F1 sin fuentes verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 66 millones de parámetros, la inferencia en FP32 requiere aproximadamente 268 MB de memoria (66,96 M × 4 bytes). Con cuantización a int8, se reduciría a unos 67 MB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1060 o incluso CPUs modernas pueden ejecutar la inferencia sin problemas.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en cualquier GPU consumer actual, incluidas las series RTX 30 y RTX 40.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, Hugging Face Inference Endpoints, Text Generation Inference (TGI) o mediante la librería `transformers` directamente. También es posible exportarlo a ONNX para optimización.
- Latencia y throughput: no se dispone de mediciones oficiales. Como referencia, DistilBERT base procesa típicamente cientos de secuencias por segundo en una GPU moderna, pero estos valores dependen del hardware y la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adi2335/nda-clause-classifier-v2 | 66,96 M | no disponible | Clasificación de cláusulas NDA | no disponible | Hugging Face |
| AtrriJi/Risk-clause-classifier | no disponible | no disponible | Clasificación de cláusulas y evaluación de riesgo | no disponible | Hugging Face |
| Aakash-Lalwani/Contract-Clause-Classifier | no disponible | no disponible | Clasificación de cláusulas en 17 categorías | no disponible | GitHub |

No se dispone de información suficiente para comparar rendimiento, ya que ninguno de los modelos alternativos publica métricas detalladas. La comparativa se limita a la disponibilidad y el propósito general.

## Limitaciones y advertencias

- La model card está vacía: no se documentan los datos de entrenamiento, el proceso de fine-tuning, ni las categorías exactas que predice el modelo. Esto dificulta evaluar su idoneidad para casos de uso específicos.
- No se ha publicado ninguna métrica de evaluación, por lo que se desconoce la precisión real del modelo en la clasificación de cláusulas.
- El modelo está entrenado presumiblemente en inglés, pero no se confirma. Su uso con textos en otros idiomas podría producir resultados incorrectos.
- La licencia no está especificada, lo que genera incertidumbre sobre las restricciones de uso comercial y redistribución.
- Al ser un modelo basado en DistilBERT, su capacidad de comprensión de contextos largos está limitada a 512 tokens por secuencia. Cláusulas muy extensas podrían truncarse.
- Riesgo de alucinación o clasificación errónea en cláusulas ambiguas o con redacción poco estándar. No se han documentado sesgos específicos, pero los modelos legales pueden reflejar sesgos presentes en los datos de entrenamiento.
- No se recomienda su uso como única fuente de decisión legal sin supervisión humana, dado el impacto potencial de errores en contextos contractuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adi2335/nda-clause-classifier-v2
- Referencia del paper de DistilBERT (citado en los tags): https://arxiv.org/abs/1910.09700
- Espacio relacionado de clasificación de NDA (no oficial): https://huggingface.co/spaces/IcelynJING/NDA_Classifier
- Repositorio de clasificador de cláusulas (no oficial): https://github.com/Aakash-Lalwani/Contract-Clause-Classifier
- Modelo similar en Hugging Face: https://huggingface.co/AtrriJi/Risk-clause-classifier
