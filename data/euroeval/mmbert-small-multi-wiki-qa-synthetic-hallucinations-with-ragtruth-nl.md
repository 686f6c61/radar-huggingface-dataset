# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-nl

## Resumen

mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-nl es un modelo de clasificación de tokens (token classification) desarrollado por el equipo de EuroEval, un marco de evaluación de modelos de lenguaje europeos. El modelo está diseñado para detectar alucinaciones en respuestas generadas por sistemas de recuperación aumentada por generación (RAG) en neerlandés, etiquetando cada token como parte de una respuesta fiel o como contenido alucinado.

El modelo se basa en la arquitectura mmBERT-small, una variante multilingüe compacta de BERT, con 140,6 millones de parámetros y una longitud de contexto de 512 tokens. Se entrenó mediante un proceso de fine-tuning sobre el conjunto de datos MultiWikiQHalluA, que contiene ejemplos de preguntas y respuestas con anotaciones a nivel de token sobre qué partes de la respuesta son alucinaciones. Este modelo es relevante porque aborda el problema creciente de la verificación de hechos en sistemas de IA generativa, especialmente en idiomas europeos de menor representación como el neerlandés.

La versión neerlandesa (nl) forma parte de una serie de modelos multilingües (en, fo, nl) que permiten la detección de alucinaciones en múltiples idiomas europeos. El modelo se publica bajo una licencia no especificada y está disponible en formato safetensors compatible con la biblioteca transformers de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mmBERT-small (BERT multilingüe compacto) |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Neerlandés (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura mmBERT-small, una variante compacta de BERT diseñada para el procesamiento multilingüe. Al ser un modelo basado en transformador con codificador bidireccional, procesa el texto completo y genera representaciones contextuales para cada token de entrada. La tarea de clasificación de tokens se implementa como una capa de clasificación por token que etiqueta cada token como parte de una respuesta correcta o como una alucinación.

El entrenamiento se realizó con el conjunto de datos MultiWikiQHalluA, un benchmark de alucinaciones multilingüe. El proceso de generación de datos implicó un pipeline de dos etapas: primero, se generaron respuestas sintéticas con alucinaciones utilizando el framework LettuceDetect, que usa un modelo de lenguaje para producir respuestas con etiquetas de tokens de alucinación; y segundo, se realizó fine-tuning del modelo mmBERT-small sobre estos datos anotados. El nombre del modelo indica que se usaron preguntas de WikiQA con respuestas sintéticas y que la detección se realizó con truth (RAGTruth) en contexto neerlandés.

## Capacidades

- Detección de alucinaciones en texto: el modelo clasifica cada token de una respuesta generada como fiel o alucinado, lo que permite identificar pasajes concretos que no se corresponden con la información de la fuente.
- Procesamiento multilingüe: aunque está enfocado al neerlandés, la arquitectura mmBERT permite el procesamiento de múltiples idiomas, y el mismo modelo se publica también en inglés (en) y feroés (fo).
- Clasificación de tokens: es una tarea de token-level classification, por lo que el modelo produce una etiqueta por token, no una puntuación global.
- Compatibilidad con pipelines de transformers: se puede usar directamente con la biblioteca transformers de HuggingFace para clasificación de tokens.

## Casos de uso

- Verificación de respuestas en sistemas RAG: el modelo puede integrarse en un pipeline de generación de respuestas con recuperación para etiquetar las partes de la respuesta que no están respaldadas por los documentos recuperados, lo que permite alertar al usuario o descartar la respuesta.
- Control de calidad de contenido generado: en aplicaciones de generación de texto basadas en RAG, el modelo puede servir como un filtro de calidad para detectar y resaltar afirmaciones no verificadas antes de su publicación.
- Auditoría de sistemas de IA conversacional: en chatbots o asistentes virtuales que utilizan RAG, el modelo puede auditar las respuestas generadas y señalar los pasajes alucinados para mejorar la transparencia del sistema.
- Análisis de fiabilidad en investigación: los investigadores pueden utilizar este modelo para evaluar la fiabilidad de diferentes sistemas RAG en neerlandés, comparando la frecuencia y la ubicación de las alucinaciones entre sistemas.
- Entrenamiento de modelos más grandes: el modelo puede usarse como un profesor (teacher) para entrenar modelos de detección de alucinaciones más eficientes o para generar etiquetas débiles en otros idiomas.
- Detección de datos de entrenamiento sintéticos: en la limpieza de datos de entrenamiento, el modelo puede ayudar a identificar respuestas sintéticas con alucinaciones en corpus neerlandeses, mejorando la calidad de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia es el paper de arXiv 2605.02504v2, que describe el marco de trabajo MultiWikiQHalluA, pero no se incluyen resultados específicos de este modelo en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 140 millones de parámetros, puede ejecutarse en una GPU con 2-4 GB de VRAM en precisión fp16. En CPU, la inferencia es posible pero más lenta.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA T4, RTX 3060 o superior. No requiere GPU de centro de datos.
- Compatibilidad con GPU de consumo: sí, es un modelo pequeño que cabe en la mayoría de las GPU de consumo modernas.
- Opciones de despliegue: se puede usar con la biblioteca transformers de HuggingFace, y también es compatible con endpoints de HuggingFace (endpoints_compatible). También puede desplegarse con ONNX Runtime o TensorRT si se convierte.
- Latencia y throughput: no disponible, pero al ser un modelo de 140 millones de parámetros, la inferencia es rápida, del orden de milisegundos por secuencia en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-nl | 140,6 M | 512 | Detección de alucinaciones (token) | No disponible | HuggingFace |
| mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en | 140,6 M | 512 | Detección de alucinaciones (token) | No disponible | HuggingFace |
| mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo | 140,6 M | 512 | Detección de alucinaciones (token) | No disponible | HuggingFace |

Los tres modelos son la misma arquitectura y tamaño, diferenciándose únicamente en el idioma de entrenamiento (neerlandés, inglés y feroés). No hay otros modelos de detección de alucinaciones de token-level comparables en la información disponible.

## Limitaciones y advertencias

- Sesgos y limitaciones del dataset: el modelo se entrena con datos sintéticos generados por el framework LettuceDetect, por lo que las alucinaciones detectadas pueden no cubrir todos los tipos de alucinaciones que aparecen en textos reales.
- Riesgo de alucinación en el modelo: como modelo de clasificación de tokens, puede cometer errores de etiquetado, especialmente en textos con ambigüedad o con contextos no representados en el entrenamiento.
- Contexto limitado: la longitud de contexto es de 512 tokens, lo que limita su aplicación en documentos largos o conversaciones con historial extenso.
- Idioma limitado: aunque la arquitectura es multilingüe, el entrenamiento específico en neerlandés puede degradar el rendimiento en otros idiomas. Solo se ha entrenado con datos de WikiQA, que es un dominio específico.
- Licencia no especificada: no se indica la licencia del modelo, lo que puede ser un problema para uso comercial o de redistribución.
- Información incompleta: la model card del autor es muy escasa y no proporciona información sobre hiperparámetros, datos de entrenamiento, o evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-nl
- Variante en inglés: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en
- Variante en feroés: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo
- Paper de referencia (MultiWikiQHalluA): https://arxiv.org/pdf/2605.02504v2
- Sitio de EuroEval: https://euroeval.com/
