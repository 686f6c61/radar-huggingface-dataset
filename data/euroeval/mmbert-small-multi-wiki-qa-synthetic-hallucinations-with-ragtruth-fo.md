# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo` es un modelo de clasificación de tokens (token-classification) basado en la arquitectura ModernBERT, desarrollado por el grupo EuroEval. Con 140,6 millones de parámetros, se presenta como un modelo pequeño orientado a tareas de verificación de hechos o detección de alucinaciones en respuestas generadas por sistemas de pregunta-respuesta con recuperación aumentada (RAG). El nombre sugiere que fue entrenado sobre datos sintéticos de Wikipedia con alucinaciones generadas artificialmente y verificadas mediante RAG, aunque la model card no aporta detalles sobre el proceso de entrenamiento.

La relevancia de este modelo radica en su posible aplicación para auditar y validar salidas de sistemas RAG, un problema crítico en la producción de asistentes conversacionales. Sin embargo, la falta de documentación pública limita su evaluación objetiva y su adopción en entornos profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer con atención linear, según etiqueta `modernbert`) |
| Parametros totales | 140.642.306 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, una evolución del BERT clásico que introduce atención lineal para reducir la complejidad computacional y mejorar la eficiencia en secuencias largas. No obstante, no se dispone de información sobre la configuración exacta (número de capas, cabezas de atención, dimensiones ocultas) ni sobre los datos de entrenamiento. El nombre del modelo indica que fue entrenado sobre un conjunto de datos sintéticos de preguntas y respuestas de Wikipedia, con alucinaciones generadas artificialmente y etiquetas de veracidad obtenidas mediante un sistema RAG, pero estos detalles no están documentados en la model card.

No se especifica si se utilizó ajuste fino (fine-tuning) sobre un modelo base ModernBERT o si se entrenó desde cero. Tampoco se mencionan hiperparámetros, régimen de entrenamiento ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Clasificación de tokens: el pipeline `token-classification` indica que el modelo asigna etiquetas a cada token, probablemente para marcar fragmentos que constituyen alucinaciones o información no verificada.
- Detección de veracidad en respuestas RAG: por el nombre, se infiere que puede distinguir entre contenido factual y contenido inventado en respuestas generadas por sistemas de QA.
- No se documentan capacidades adicionales como generación de texto, razonamiento, código, visión o soporte multilingüe.

## Casos de uso

No hay casos de uso documentados por el autor. Basándose en el nombre y la arquitectura, se podrían considerar los siguientes escenarios hipotéticos, aunque requieren validación empírica:

- Auditoría de sistemas RAG: el modelo podría integrarse como un filtro posterior para marcar tokens potencialmente alucinados en respuestas generadas por un pipeline de recuperación y generación.
- Control de calidad en asistentes conversacionales: serviría para señalar fragmentos no verificados antes de mostrar la respuesta al usuario final.
- Investigación en detección de alucinaciones: como modelo pequeño, podría usarse como baseline en experimentos académicos sobre verificación factual.

Estos usos son inferencias razonables, pero no están confirmados por el autor ni respaldados por métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre precisión, F1, exactitud ni comparación con otros modelos en tareas de detección de alucinaciones o clasificación de tokens.

## Requisitos de hardware

- VRAM estimada: con 140,6 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 562 MB de memoria. En fp16, unos 281 MB. Con overhead de inferencia, cabría en GPUs con 2 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, o superiores). También es viable en CPU para inferencia por lotes pequeños.
- Despliegue: compatible con la librería `transformers` de HuggingFace. Se puede servir mediante `text-classification` pipeline o con herramientas como vLLM o TGI si se convierte a formatos adecuados, aunque no se ha verificado su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de alucinaciones con arquitectura ModernBERT). No se puede establecer una comparativa fiable sin datos de rendimiento.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al estar entrenado sobre datos sintéticos, el modelo puede no generalizar bien a dominios o idiomas distintos de los utilizados en el entrenamiento.
- Riesgo de alucinación: como clasificador de tokens, puede producir falsos positivos o negativos; no se ha evaluado su robustez.
- Licencia desconocida: el uso comercial, la redistribución o la modificación del modelo no están claramente permitidos. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Documentación insuficiente: la model card no proporciona detalles sobre datos de entrenamiento, métricas de evaluación ni limitaciones específicas, lo que dificulta una adopción responsable.
- Idioma: no se especifica qué idiomas soporta; el sufijo `-fo` podría sugerir feroés, pero no es concluyente.

## Enlaces

- [HuggingFace - EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo)

No se han encontrado otros enlaces (papers, repositorios, demos) en la información disponible.
