# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-el

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-el` es un clasificador de tokens basado en la arquitectura ModernBERT, desarrollado por el Instituto Alexandra (Alexandra Institute) para la detección de alucinaciones en respuestas generadas por sistemas de pregunta-respuesta (QA) multilingües. Se enmarca dentro del proyecto MultiWikiQHalluA, que combina el dataset MultiWikiQA (306 idiomas) con un pipeline de generación sintética de alucinaciones mediante el framework LettuceDetect. El modelo asigna a cada token de una respuesta una etiqueta que indica si es fiel al contexto o si constituye una alucinación, lo que resulta crítico para verificar la veracidad de salidas de modelos generativos en entornos RAG.

Con 140,6 millones de parámetros, es un modelo compacto diseñado para tareas de clasificación de tokens a alta velocidad, sin necesidad de recursos de hardware extremos. El sufijo "el" en el nombre sugiere que la variante está especializada para el idioma griego, aunque el modelo base es multilingüe y forma parte de una serie que incluye versiones para finés (fi) e italiano (it). Su relevancia actual radica en la creciente necesidad de control de calidad en sistemas de generación aumentada por recuperación, donde las alucinaciones pueden comprometer la fiabilidad de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, token classification head) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ModernBERT soporta hasta 8192 tokens, no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP32 o FP16) |
| Idiomas soportados | no disponible (el sufijo "el" sugiere griego; el dataset base cubre 306 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una evolución de BERT que incorpora atención con máscara de desplazamiento (flash attention), normalización por capas mejorada y una mayor eficiencia en el uso de memoria. Es un encoder transformer de tipo denso con una cabeza de clasificación de tokens que produce etiquetas binarias o multiclase para cada token de entrada. Según el paper de MultiWikiQHalluA (arXiv:2605.02504), el entrenamiento se realiza mediante fine-tuning sobre un dataset sintético donde se generan respuestas con alucinaciones anotadas a nivel de token. El pipeline de generación usa el framework LettuceDetect, que combina contextos de Wikipedia, preguntas generadas por un LLM y respuestas correctas para producir ejemplos etiquetados. No se dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que la model card no los especifica.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas de QA: clasifica cada token como fiel o alucinado respecto al contexto dado.
- Procesamiento multilingüe: al estar entrenado sobre MultiWikiQA, que abarca 306 idiomas, el modelo puede aplicarse a múltiples lenguas, aunque la variante específica "el" está orientada al griego.
- Compatible con pipelines de transformers: se integra fácilmente en flujos de token-classification usando la librería Hugging Face.
- Adecuado para verificación de fidelidad en sistemas RAG: puede utilizarse como componente de control posterior a la generación.
- Inferencia eficiente: al ser un modelo pequeño (140M), ofrece baja latencia en CPU y GPU.

## Casos de uso

- Verificación de respuestas en sistemas de pregunta-respuesta: el modelo puede analizar la salida de un LLM y marcar los tokens que no están respaldados por el contexto recuperado, permitiendo alertar al usuario o descartar la respuesta.
- Control de calidad en pipelines RAG: integrarlo como paso de post-procesamiento para filtrar o corregir alucinaciones antes de entregar la respuesta final.
- Auditoría de contenido generado en entornos empresariales: revisar automáticamente respuestas de chatbots o asistentes virtuales para detectar información inventada.
- Evaluación de modelos generativos: usar las etiquetas de token para calcular métricas de fidelidad (por ejemplo, proporción de tokens alucinados) en conjuntos de pruebas multilingües.
- Anotación de datos para entrenamiento: generar etiquetas de alucinación a gran escala sobre respuestas sintéticas para crear datasets de entrenamiento o ajuste fino.
- Monitorización de sistemas de generación en producción: desplegar el modelo como servicio de verificación en tiempo real para detectar degradaciones en la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de MultiWikiQHalluA (arXiv:2605.02504) describe la metodología y el dataset, pero no se incluyen métricas concretas (como F1, precisión o recall) para este modelo específico en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140M parámetros, en FP32 ocupa aproximadamente 560 MB de memoria, pero el tamaño del repo (1.2 GB) sugiere que puede incluir pesos en FP32 o FP16 junto con otros archivos. Una GPU con al menos 2 GB de VRAM es suficiente para inferencia en lote.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) o incluso CPU para inferencia en tiempo real gracias al tamaño reducido.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja como GTX 1060 o superiores.
- Opciones de despliegue: se puede servir mediante Hugging Face Inference Endpoints, o con librerías como vLLM (aunque al ser un encoder, es más común usar pipelines de transformers), o mediante ONNX Runtime para optimización en CPU.
- Latencia y throughput: no disponibles, pero por el tamaño del modelo, se espera una latencia de milisegundos en GPU para secuencias de longitud moderada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de alucinaciones a nivel de token multilingüe). Existen otros enfoques como los clasificadores de fidelidad basados en NLI (por ejemplo, modelos como DeBERTa fine-tuneado en NLI), pero no hay datos públicos que permitan una comparación directa con este modelo. Se indica "no disponible" por falta de referencias.

## Limitaciones y advertencias

- La model card es una plantilla automática sin información detallada sobre sesgos, riesgos o limitaciones específicas. No se han documentado sesgos conocidos.
- Riesgo de alucinación en las propias etiquetas: al ser un modelo entrenado con datos sintéticos, puede tener falsos positivos o negativos en contextos no representados en el dataset de entrenamiento.
- Limitaciones de idioma: aunque el dataset base cubre 306 idiomas, la variante "el" puede tener un rendimiento desigual en idiomas distintos del griego.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer las condiciones de uso comercial. Se recomienda contactar con el autor antes de usarlo en producción.
- Falta de documentación sobre el proceso de entrenamiento (hiperparámetros, datos exactos, régimen de precisión), lo que dificulta la reproducibilidad.
- El modelo está especializado en la tarea de clasificación de tokens; no es un generador de texto ni un modelo conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-el
- Paper MultiWikiQHalluA (arXiv): https://arxiv.org/pdf/2605.02504
- Paper MultiWikiQA (arXiv): https://arxiv.org/html/2509.04111v2
- Repositorio GitHub multi_wiki_qa: https://github.com/alexandrainst/multi_wiki_qa
