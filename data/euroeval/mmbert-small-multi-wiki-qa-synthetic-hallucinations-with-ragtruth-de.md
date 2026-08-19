# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-de

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-de` es un encoder de clasificación de tokens (token-classification) desarrollado por el equipo de EuroEval, un framework de evaluación de modelos de lenguaje. Está diseñado para detectar alucinaciones en respuestas generadas por sistemas de Retrieval-Augmented Generation (RAG) en alemán, etiquetando cada token como parte de una alucinación o no. Se basa en `mmBERT-small`, un encoder multilingüe moderno de la familia ModernBERT, y ha sido fine-tuneado con datos sintéticos generados a partir del benchmark MultiWikiQA, utilizando el framework LettuceDetect descrito en el paper "A multilingual hallucination benchmark: MultiWikiQHalluA".

Con 140,6 millones de parámetros, es un modelo compacto y eficiente, adecuado para tareas de verificación de contenido en producción. Su relevancia radica en la creciente necesidad de mitigar las alucinaciones en sistemas RAG, especialmente en entornos multilingües y empresariales. Aunque la model card es genérica y carece de detalles específicos, el nombre del modelo y los tags (`modernbert`, `token-classification`) permiten inferir su arquitectura y propósito. El repositorio pesa 0,6 GB y los pesos están en formato `safetensors`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de ModernBERT: 8192 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (inferido del sufijo `-de`; la model card no lo especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `mmBERT-small`, un encoder multilingüe moderno basado en la arquitectura ModernBERT, que incorpora mejoras como atención eficiente y mayor longitud de contexto respecto a BERT clásico. El entrenamiento se realizó sobre datos sintéticos de alucinaciones generados a partir del dataset MultiWikiQA, donde se crean respuestas con etiquetas a nivel de token que indican si cada token es alucinado o fiel al contexto recuperado. El proceso de generación de datos y fine-tuning se describe en el paper "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504), que utiliza el framework LettuceDetect para producir las etiquetas. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO; la model card no proporciona estos detalles.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas con RAG, clasificando cada token como alucinado o no.
- Clasificación de tokens (token-classification) mediante el pipeline de `transformers`.
- Soporte para inferencia en español y otros idiomas si se fine-tunea adicionalmente, aunque este modelo específico está orientado al alemán.
- Al ser un encoder, no genera texto; su función es analizar y etiquetar secuencias existentes.
- Compatible con la librería `transformers` y con endpoints de inferencia (tag `endpoints_compatible`).

## Casos de uso

- Verificación de respuestas en sistemas RAG: el modelo puede integrarse en un pipeline de generación aumentada por recuperación para marcar automáticamente los tokens que no están respaldados por el contexto recuperado, permitiendo a los desarrolladores filtrar o corregir salidas antes de mostrarlas al usuario.
- Control de calidad en chatbots empresariales: en asistentes virtuales que usan RAG, este modelo puede auditar las respuestas en alemán y señalar posibles alucinaciones, reduciendo el riesgo de información incorrecta en atención al cliente.
- Auditoría de contenido generado: se puede utilizar como herramienta de post-procesado en plataformas de generación de artículos o resúmenes para detectar fragmentos no fieles a las fuentes.
- Evaluación de sistemas RAG: los equipos de desarrollo pueden emplear este modelo como métrica automática de alucinación en sus propios benchmarks, comparando la tasa de tokens alucinados entre diferentes configuraciones.
- Investigación en detección de alucinaciones: sirve como punto de partida para estudios sobre robustez de modelos RAG en alemán, permitiendo analizar patrones de error y mejorar los datos de entrenamiento.
- Filtrado en pipelines de generación de código o documentación: si se usa RAG para generar documentación técnica, el modelo puede marcar afirmaciones no verificadas, ayudando a mantener la precisión en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y el paper asociado (arXiv:2605.02504) no proporciona cifras específicas para este modelo en particular. Se recomienda consultar el repositorio de HuggingFace o el paper para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140,6 millones de parámetros, en fp32 ocupa aproximadamente 560 MB, en fp16 unos 280 MB. Esto permite ejecutarlo en GPUs consumer con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090). También puede ejecutarse en CPU con razonable latencia para tareas de clasificación.
- Compatible con consumer GPU: sí, cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: se puede servir con `transformers` (pipeline de token-classification), `vLLM` (aunque está orientado a generación, puede usarse para encoders), `llama.cpp` (si se convierte a GGUF, aunque no es el formato nativo), o mediante endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no se dispone de datos medidos; al ser un modelo pequeño, se espera una latencia baja (del orden de milisegundos por secuencia en GPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de alucinaciones en alemán. Alternativas genéricas como `xlm-roberta-base` o `bert-base-multilingual-cased` podrían fine-tunearse para la misma tarea, pero no hay datos de rendimiento comparativo disponibles. La comparativa queda pendiente de futuras publicaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos sintéticos, puede heredar sesgos de los datos de generación (por ejemplo, patrones de alucinación artificiales que no reflejan la distribución real).
- Riesgo de alucinación: aunque el modelo está diseñado para detectar alucinaciones, puede producir falsos positivos (marcar tokens correctos como alucinados) o falsos negativos (no detectar alucinaciones reales), especialmente en dominios fuera del alcance de los datos de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está confirmada; si sigue el estándar de ModernBERT, podría ser de 8192 tokens, pero no se garantiza.
- Limitaciones de idioma: el modelo está fine-tuneado para alemán; su rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si permite uso comercial. Se recomienda contactar con los autores antes de usarlo en producción.
- Caveat para producción: al ser un modelo pequeño y con datos sintéticos, su precisión en escenarios reales puede ser limitada; se aconseja validar con datos propios antes de desplegarlo.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-de)
- [Paper - A multilingual hallucination benchmark: MultiWikiQHalluA](https://arxiv.org/pdf/2605.02504v2)
- [GitHub - mmBERT (JHU-CLSP)](https://github.com/JHU-CLSP/mmBERT/)
- [EuroEval - framework de evaluación](https://euroeval.com/)
- [Versión italiana del modelo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it)
- [Versión griega del modelo](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-el)
