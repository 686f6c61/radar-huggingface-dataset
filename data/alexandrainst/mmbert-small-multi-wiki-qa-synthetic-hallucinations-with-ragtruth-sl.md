# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sl

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sl` es un clasificador de tokens entrenado para detectar alucinaciones en respuestas generadas por modelos de lenguaje dentro de sistemas de recuperación aumentada (RAG). Lo desarrolla el instituto de investigación Alexandria (alexandrainst) y forma parte de una familia de modelos multilingües orientados a la verificación de hechos a nivel de token. Su nombre indica que fue ajustado con datos sintéticos de preguntas y respuestas sobre Wikipedia, combinados con el dataset RAGTruth, y el sufijo `-sl` sugiere que está especializado en esloveno, aunque esta información no está confirmada en la model card.

El modelo se basa en la arquitectura ModernBERT (etiqueta `modernbert`), con 140,6 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños y eficientes. Su pipeline es `token-classification`, es decir, asigna una etiqueta a cada token de entrada para marcar si forma parte de una alucinación o no. Está diseñado para integrarse en pipelines de RAG donde se necesita verificar la fidelidad de las respuestas generadas respecto al contexto recuperado. Aunque la model card está prácticamente vacía, el paper asociado (arXiv:2605.02504) describe la metodología de generación sintética de alucinaciones y el ajuste fino del modelo.

La relevancia de este modelo radica en la creciente necesidad de controlar la fiabilidad de los sistemas generativos, especialmente en aplicaciones empresariales donde las alucinaciones pueden tener consecuencias graves. Al operar a nivel de token, permite señalar con precisión qué fragmentos de una respuesta son inventados, facilitando la depuración y la intervención humana. Su tamaño reducido lo hace adecuado para despliegue en entornos con recursos limitados, aunque la falta de documentación pública limita su adopción inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el sufijo `-sl` sugiere esloveno, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en ModernBERT, una evolución del BERT original que incorpora mejoras como atención con ventana deslizante, normalización de capas y una tokenización más eficiente. El modelo es un encoder transformer de 140 millones de parámetros, diseñado para clasificación de tokens. El entrenamiento consistió en un ajuste fino (fine-tuning) sobre un conjunto de datos sintético generado mediante el framework LettuceDetect, descrito en el paper arXiv:2605.02504. Este framework produce respuestas con alucinaciones etiquetadas a nivel de token, combinando contextos de Wikipedia, preguntas y respuestas de referencia. Además, se incorporó el dataset RAGTruth, que contiene ejemplos reales de alucinaciones en sistemas RAG. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token: clasifica cada token de una respuesta como alucinado o fiel al contexto.
- Integración en pipelines RAG: puede utilizarse como verificador posterior a la generación para señalar fragmentos no respaldados por el contexto recuperado.
- Procesamiento multilingüe: el nombre sugiere soporte para varios idiomas, con una variante específica para esloveno (`-sl`), aunque no se detallan los idiomas exactos.
- Compatible con la librería Transformers de HuggingFace, lo que facilita su uso con pipelines estándar de token-classification.
- Tamaño compacto (140M parámetros) que permite inferencia en hardware moderado.

## Casos de uso

- Verificación de respuestas en asistentes virtuales: el modelo puede integrarse en un sistema de atención al cliente para marcar automáticamente las frases que no se corresponden con la base de conocimiento, permitiendo al agente humano corregirlas antes de enviarlas al usuario.
- Auditoría de sistemas RAG en producción: en una empresa que despliega un chatbot con recuperación de documentos, este modelo puede ejecutarse como paso posterior a la generación para generar informes de alucinaciones y mejorar la calidad del corpus.
- Filtrado de contenido generado en medios: una redacción que utilice IA para redactar noticias puede emplear el modelo para detectar afirmaciones inventadas en borradores, reduciendo el riesgo de publicar información falsa.
- Evaluación de modelos generativos: investigadores pueden usar este clasificador como métrica automática para comparar la fidelidad de diferentes modelos de lenguaje en tareas de QA con contexto.
- Depuración de pipelines de generación aumentada: los desarrolladores pueden identificar qué partes del contexto no están siendo utilizadas correctamente por el generador, analizando los tokens marcados como alucinados.
- Cumplimiento normativo en sectores regulados: en banca o sanidad, donde las respuestas deben estar respaldadas por documentación oficial, el modelo puede señalar automáticamente cualquier desviación antes de que la respuesta llegue al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper arXiv:2605.02504 describe la metodología de generación de datos y el ajuste fino, pero no se incluyen métricas cuantitativas (como F1, precisión o recall) en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 140M parámetros, la inferencia en FP32 requiere aproximadamente 560 MB de memoria, y en FP16 unos 280 MB. Con cuantización a 8 bits podría reducirse a unos 140 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas de consumo como GTX 1650, RTX 3050 o superiores. También puede ejecutarse en CPU con razonable velocidad.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU moderna e incluso en Raspberry Pi con cuantización extrema.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con HuggingFace Inference Endpoints, o mediante frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF). También es posible usarlo directamente con la librería `transformers` en Python.
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de este tamaño se espera una latencia de decenas de milisegundos por secuencia en GPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de detección de alucinaciones a nivel de token. Existen alternativas como los clasificadores basados en DeBERTa o los modelos de verificación de hechos como `factchecker` o `FActScore`, pero no se han encontrado datos comparativos públicos con este modelo concreto. La familia mmBERT-small de Alexandria incluye variantes para otros idiomas (por ejemplo, `-en`, `-lv`), pero no se han publicado métricas comparativas entre ellas.

## Limitaciones y advertencias

- La model card está vacía: no se especifican sesgos, limitaciones técnicas ni recomendaciones de uso, lo que dificulta evaluar su comportamiento en dominios distintos al de entrenamiento.
- El entrenamiento se basa en datos sintéticos y en RAGTruth, por lo que su rendimiento en dominios muy diferentes (por ejemplo, lenguaje médico o legal) puede degradarse significativamente.
- No se ha publicado información sobre la licencia, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El sufijo `-sl` sugiere especialización en esloveno, pero no se confirma en la documentación; su rendimiento en otros idiomas es incierto.
- Al ser un modelo de clasificación de tokens, no genera texto ni razona; su utilidad se limita a la verificación posterior a la generación.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de su eficacia frente a otros métodos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sl
- Paper asociado (arXiv:2605.02504): https://arxiv.org/pdf/2605.02504
- Variante en inglés: https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-en
- Variante en letón: https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lv
