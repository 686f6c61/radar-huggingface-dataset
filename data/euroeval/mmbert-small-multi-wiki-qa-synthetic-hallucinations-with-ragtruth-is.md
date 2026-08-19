# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-is

## Resumen

mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-is es un modelo de clasificación de tokens (token-classification) publicado por EuroEval en HuggingFace. Según los metadatos, está etiquetado como "modernbert", lo que sugiere que su arquitectura se basa en ModernBERT, aunque no se confirma en la documentación. El nombre del modelo indica que fue entrenado sobre un dataset sintético de preguntas y respuestas de Wikipedia, orientado a la detección de alucinaciones en respuestas generadas con recuperación aumentada (RAG). El modelo tiene 140.642.306 parámetros y sus pesos están en formato safetensors.

La relevancia de este modelo radica en su posible aplicación para identificar segmentos textuales que no se corresponden con la verdad del contexto recuperado, una tarea crítica en sistemas RAG. Sin embargo, la model card es una plantilla vacía sin información sobre entrenamiento, datos, licencia o rendimiento, por lo que cualquier afirmación sobre sus capacidades debe tomarse como inferencia a partir del nombre y las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (inferido por tag, no confirmado) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura, los datos de entrenamiento ni el procedimiento de ajuste. El tag "modernbert" sugiere que el modelo se basa en la arquitectura ModernBERT, una evolución de BERT con atención eficiente y mayor velocidad, pero no hay confirmación oficial. El nombre del modelo indica que fue entrenado sobre un conjunto de datos sintéticos de preguntas y respuestas de Wikipedia, con anotaciones de alucinaciones generadas en un contexto RAG. No se dispone de detalles sobre el número de tokens de entrenamiento, el régimen de ajuste (por ejemplo, fine-tuning supervisado) ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

Las capacidades no están documentadas en la model card. A partir del pipeline (token-classification) y del nombre, se infiere razonablemente que el modelo está diseñado para:

- Clasificar tokens individuales como "alucinado" o "no alucinado" en respuestas generadas por sistemas RAG.
- Detectar segmentos de texto que no se sustentan en el contexto recuperado.
- Operar como un clasificador de secuencias a nivel de token, devolviendo etiquetas por cada token de entrada.

No hay evidencia de soporte para generación de texto, tool calling, agentes o capacidades multilingües. El tag "region:us" sugiere que el modelo fue subido desde una región de Estados Unidos, pero no aporta información funcional.

## Casos de uso

Dado que no hay documentación oficial, los siguientes casos de uso son hipotéticos y se basan en la finalidad que sugiere el nombre del modelo:

- Verificación de alucinaciones en respuestas RAG: el modelo podría integrarse como un paso posterior a la generación para etiquetar tokens que no se alinean con el contexto recuperado, permitiendo a los desarrolladores filtrar o corregir respuestas automáticamente.
- Auditoría de sistemas de pregunta-respuesta: utilizado como herramienta de evaluación para medir la tasa de alucinación de un sistema RAG sobre un corpus de prueba.
- Control de calidad en pipelines de generación aumentada: en producción, podría actuar como un guardián que rechaza respuestas con alta proporción de tokens marcados como alucinados.
- Análisis de errores en modelos de lenguaje: los investigadores podrían usar las anotaciones a nivel de token para estudiar patrones de alucinación y mejorar los sistemas subyacentes.
- Filtrado de contenido en asistentes virtuales: para evitar que un asistente proporcione información no respaldada por fuentes fiables.
- Entrenamiento de modelos más grandes: las predicciones de este clasificador podrían servir como pseudoetiquetas para crear datasets de entrenamiento adicionales.

Estos escenarios son plausibles pero no están confirmados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware, latencia o throughput. Dado el tamaño del modelo (140M parámetros), es razonable esperar que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, e incluso en CPU para inferencia de baja latencia, pero no hay datos oficiales. Las opciones de despliegue típicas para modelos de transformers incluyen vLLM, HuggingFace Inference Endpoints o llama.cpp, aunque no se ha confirmado la compatibilidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de alucinaciones a nivel de token). No se puede establecer una comparativa fiable sin datos de rendimiento.

## Limitaciones y advertencias

- La model card es una plantilla vacía; no hay información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial o su redistribución.
- El modelo fue entrenado sobre datos sintéticos, lo que puede limitar su generalización a dominios reales.
- No se especifican los idiomas soportados; el nombre sugiere que podría ser multilingüe (mmBERT), pero no hay confirmación.
- La arquitectura no está confirmada oficialmente; el tag "modernbert" es una pista pero no una garantía.
- Cualquier uso en producción debe ir precedido de una evaluación exhaustiva sobre datos propios.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-is)
