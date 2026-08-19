# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fr

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fr` es un fine-tuning de un modelo base ModernBERT pequeño (mmBERT-small) para la detección de alucinaciones a nivel de token en respuestas de sistemas de preguntas y respuestas (QA). Desarrollado por el instituto de investigación alexandrainst, forma parte de un esfuerzo más amplio por crear un benchmark multilingüe de alucinaciones denominado MultiWikiQHalluA, que incluye variantes para otros idiomas como finlandés e italiano. El modelo está especializado en francés, como indica el sufijo `-fr` en su nombre.

El problema que resuelve es la verificación automática de la fidelidad de respuestas generadas por modelos de lenguaje en contextos de recuperación aumentada (RAG). En lugar de generar texto, este modelo clasifica cada token de una respuesta como alucinado o fiel al contexto proporcionado, lo que permite detectar y filtrar contenido no verificado. Su relevancia actual radica en la creciente adopción de sistemas RAG en producción, donde la alucinación es uno de los principales riesgos de calidad.

El modelo tiene 140,6 millones de parámetros y se distribuye en formato safetensors. La arquitectura se basa en ModernBERT, una evolución eficiente del transformer BERT, y el pipeline asociado es de clasificación de tokens (token-classification). Aunque la model card oficial es genérica y carece de detalles, el paper asociado describe el proceso de generación sintética de datos de alucinación mediante el framework LettuceDetect.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (según tag de HuggingFace) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | frances (segun sufijo del nombre) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una variante moderna del transformer BERT que incorpora mejoras de eficiencia como atención con ventana deslizante y normalización mejorada. El nombre "mmBERT-small" sugiere una versión pequeña de esta familia, con 140 millones de parámetros. El pipeline es de clasificación de tokens, lo que implica que la salida es una etiqueta por token (probablemente binaria: alucinado o fiel).

El entrenamiento se realizó mediante fine-tuning sobre un dataset sintético generado con el framework LettuceDetect, descrito en el paper "A multilingual hallucination benchmark: MultiWikiQHalluA". El proceso de generación de datos utiliza contextos, preguntas y respuestas correctas de MultiWikiQA, y un modelo de lenguaje produce respuestas con alucinaciones etiquetadas a nivel de token. El sufijo "with-ragtruth" indica que las etiquetas incluyen información sobre la veracidad de la respuesta respecto al contexto RAG. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas de QA, clasificando cada token como fiel o alucinado respecto a un contexto dado.
- Verificación de fidelidad en sistemas RAG, permitiendo identificar qué partes de una respuesta generada no están respaldadas por el contexto recuperado.
- Procesamiento de texto en francés, con posible transferencia a otros idiomas si se entrena con datos multilingües (aunque esta versión está especializada en francés).
- Integración con pipelines de transformers para clasificación de tokens, compatible con la librería `transformers` y con endpoints de HuggingFace.
- No es un modelo generativo: no produce texto, sino que etiqueta tokens existentes.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso, ya que su función es puramente discriminativa.

## Casos de uso

- Control de calidad en sistemas RAG: el modelo puede analizar las respuestas generadas por un pipeline RAG y marcar los tokens que no se corresponden con el contexto recuperado, permitiendo descartar o corregir respuestas parcialmente alucinadas.
- Auditoría de chatbots de atención al cliente: en un asistente que responde basándose en documentación interna, este modelo puede verificar que cada afirmación esté respaldada por las fuentes, reduciendo el riesgo de información incorrecta.
- Evaluación automática de datasets de QA: los investigadores pueden usar el modelo para etiquetar automáticamente respuestas generadas por otros modelos y construir conjuntos de datos de entrenamiento o evaluación para detección de alucinaciones.
- Filtrado de contenido en generación de resúmenes: si un sistema de resumen extrae información de documentos, el modelo puede señalar frases que no aparecen en el texto fuente, ayudando a mantener la fidelidad.
- Monitorización de modelos de lenguaje en producción: integrado como paso posterior a la generación, puede registrar métricas de alucinación por token y alertar cuando la tasa supera un umbral.
- Investigación en robustez de modelos: al ser parte del benchmark MultiWikiQHalluA, sirve como herramienta para comparar la capacidad de diferentes modelos base para aprender a detectar alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2605.02504) podría contener métricas, pero no se han proporcionado en los materiales consultados. No se dispone de comparaciones con otros modelos de detección de alucinaciones.

## Requisitos de hardware

- Al ser un modelo de 140 millones de parámetros, la inferencia es ligera. En fp32, el peso ocupa aproximadamente 560 MB; en fp16, unos 280 MB.
- Cabe en GPUs consumer con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior. Para mayor comodidad, una RTX 3060 o RTX 4060 con 8-12 GB es suficiente.
- No requiere hardware especializado como A100 o H100 para inferencia, aunque para fine-tuning adicional sí podría beneficiarse de GPUs con más memoria.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, HuggingFace Inference Endpoints, o mediante la API de `transformers` en un script Python. También es compatible con `pipeline` de HuggingFace para clasificación de tokens.
- La latencia esperada es de milisegundos por secuencia en GPU, y de unos pocos cientos de milisegundos en CPU, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de alucinaciones a nivel de token). Existen variantes del mismo modelo para otros idiomas (finlandés e italiano) en el repositorio de alexandrainst, pero no son alternativas sino versiones multilingües. No se han encontrado otros modelos públicos con la misma especialización y arquitectura.

## Limitaciones y advertencias

- La model card oficial es genérica y no proporciona información sobre sesgos, riesgos o limitaciones específicas. Se recomienda precaución al usar el modelo en producción sin una evaluación adicional.
- El modelo está especializado en francés; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Los datos de entrenamiento son sintéticos, generados mediante un framework automático. Esto puede introducir sesgos en la forma en que se manifiestan las alucinaciones, que podrían no reflejar la variedad de alucinaciones reales en sistemas RAG.
- No se ha publicado información sobre la licencia, lo que impide conocer las restricciones de uso comercial. Se debe contactar con el autor antes de utilizarlo en aplicaciones comerciales.
- Al ser un modelo discriminativo, no puede generar respuestas; su uso está limitado a la verificación de texto ya generado.
- No se han documentado métricas de rendimiento, por lo que no es posible evaluar su precisión, recall o F1 sin realizar pruebas propias.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fr)
- [Paper - A multilingual hallucination benchmark: MultiWikiQHalluA](https://arxiv.org/pdf/2605.02504)
- [Paper (HTML)](https://arxiv.org/html/2605.02504v2)
- [Repositorio GitHub - multi_wiki_qa](https://github.com/alexandrainst/multi_wiki_qa)
- [Variante finlandesa](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-fi)
- [Variante italiana](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-it)
