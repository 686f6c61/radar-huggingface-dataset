# inference4j/deberta-v3-large-zeroshot-v2.0-c

## Resumen

Este repositorio contiene una exportación ONNX en FP32 del modelo MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c, un modelo de inferencia de lenguaje natural (NLI) basado en DeBERTa-v3 large y orientado a clasificación zero-shot de texto. Lo publica inference4j para poder ejecutarlo desde Java mediante ONNX Runtime, sin depender de Python ni de Transformers en producción. El modelo original lo desarrolla Moritz Laurer y la variante -c se entrenó solo con datos declarados comercialmente compatibles: datos sintéticos generados con Mixtral-8x7B-Instruct-v0.1, MNLI y FEVER-NLI.

Con aproximadamente 435 millones de parámetros y una longitud máxima de 512 tokens, no es un modelo generativo: formula la clasificación como una tarea NLI, comparando el texto de entrada con una hipótesis por etiqueta y devolviendo logits de entailment/not_entailment. Su interés actual está en entornos Java empresariales que necesitan etiquetado zero-shot, por lotes y con licencia MIT, sin desplegar un stack de IA generativa. La model card reporta un F1 medio de 0,676 en 28 tareas zero-shot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 large (DebertaV2ForSequenceClassification) |
| Parámetros totales | ~435 M |
| Longitud de contexto | 512 tokens (secuencia máxima de entrada) |
| Tipos de cuantización | FP32 únicamente; no se incluyen variantes INT8, GGUF ni otras |
| Idiomas soportados | no disponibles; entrenamiento sobre MNLI, FEVER-NLI y datos sintéticos en inglés, sin evaluación multilingüe documentada |
| Licencia | MIT |
| Formato de pesos | ONNX FP32, opset 18; tokenizer.json SentencePiece Unigram |
| Tarea | NLI / clasificación zero-shot de texto |
| Etiquetas de salida | 0: entailment; 1: not_entailment |
| Salida del grafo | logits float32 [batch, 2]; sin softmax ni reordenamiento de etiquetas |
| Tamaño del repositorio | 1,7 GB |
| Runtime previsto | ONNX Runtime / inference4j (Java) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer DeBERTa-v3 large configurado para clasificación de secuencias. La clasificación zero-shot se implementa como NLI: para cada etiqueta candidata se construye una hipótesis y el modelo puntúa si el texto implica esa hipótesis (entailment) o no (not_entailment). El grafo ONNX devuelve exclusivamente los logits originales; la softmax, el emparejamiento de etiquetas y cualquier umbral deben aplicarse fuera del modelo.

El entrenamiento documentado usa datos sintéticos generados con Mixtral-8x7B-Instruct-v0.1, MNLI y FEVER-NLI, seleccionados para la variante -c comercialmente compatible. No se documentan en la información disponible el número total de tokens, la composición exacta por dataset ni el uso de RLHF/DPO; tampoco se describe ninguna innovación adicional más allá de la arquitectura DeBERTa-v3 y la exportación ONNX realizada con Hugging Face Optimum en FP32 y opset 18.

## Capacidades

- Clasificación zero-shot de texto mediante NLI: permite usar etiquetas arbitrarias definidas en tiempo de inferencia, sin reentrenamiento.
- Salida de logits para entailment/not_entailment; requiere aplicar softmax, sigmoid o un umbral externo para obtener probabilidades o decisiones.
- Procesamiento por lotes de secuencias de hasta 512 tokens, adecuado para pipelines de etiquetado masivo.
- Integración en aplicaciones Java mediante inference4j y ONNX Runtime, sin dependencia de Python en producción.
- No es un modelo generativo: no produce texto libre, no razona de forma multi-paso y no mantiene conversaciones.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene capacidades de visión, audio, vídeo ni modo thinking.
- El soporte multilingüe no está documentado; los datos de entrenamiento son en inglés y no se han publicado evaluaciones en otros idiomas.

## Casos de uso

- Enrutamiento de tickets de soporte en una aplicación Java: el modelo puede clasificar descripciones de incidencias en categorías como facturación, caída de servicio o petición de funcionalidad. Los textos suelen caber en 512 tokens y el procesamiento por lotes con ONNX Runtime encaja en un backend Java.
- Clasificación de intenciones en asistentes conversacionales: permite etiquetar el mensaje del usuario con intenciones predefinidas antes de decidir la respuesta o la acción del sistema, sin depender de un modelo generativo.
- Triaje de correo entrante: clasificación de mensajes como urgente/no urgente, cliente/proveedor o incidencia/consulta. Es adecuado para textos cortos y para ejecución periódica por lotes.
- Moderación y priorización de contenido: primera pasada para etiquetar spam, abuso o contenido legítimo. Debe usarse como filtro de triaje y no como sustituto de una revisión humana en decisiones sensibles.
- Análisis de respuestas abiertas de encuestas: etiquetado de sentimiento, tema o motivo de insatisfacción en respuestas breves, con agregación posterior de resultados.
- Etiquetado de documentos y cláusulas: división de documentos largos en fragmentos de hasta 512 tokens y clasificación de cada fragmento por tipo de cláusula, sección o riesgo, con revisión humana posterior.
- Clasificación de incidencias en logs o alertas: etiquetado de fragmentos de log como error de red, autenticación o rendimiento, integrado en pipelines de monitorización y CI/CD.
- Etiquetado de reseñas de producto: clasificación de reseñas por aspectos como calidad, precio o envío, en procesos nocturnos por lotes.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| F1 medio en 28 tareas zero-shot | 0,676 |
| MMLU | no aplica (modelo no generativo) |
| HumanEval | no aplica (modelo no generativo) |
| GSM8K | no aplica (modelo no generativo) |
| Resultados desglosados por tarea | no disponibles |
| Comparación con otros modelos | no disponible en la información proporcionada |

El único dato cuantitativo disponible es el F1 medio de 0,676 en 28 tareas zero-shot reportado en la model card. No se han publicado resultados desglosados por tarea ni comparativas verificadas con otros modelos NLI en la información disponible.

## Requisitos de hardware

- VRAM estimada: los 435 M de parámetros en FP32 ocupan aproximadamente 1,74 GB. Con activaciones, tokenizador y overhead de ONNX Runtime, un lote pequeño de secuencias de hasta 512 tokens debería moverse en el entorno de 2-4 GB (estimación a partir del número de parámetros, no dato oficial).
- GPU recomendadas: no hay recomendaciones oficiales. Cualquier GPU CUDA con al menos 4 GB puede ejecutarlo; para trabajar con margen, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, A100 o H100. En GPUs de 4 GB el margen es ajustado.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060 o RTX 4090. También puede ejecutarse en CPU con ONNX Runtime para lotes pequeños.
- Opciones de despliegue: inference4j, ONNX Runtime, servidor propio o backend ONNX de Triton. vLLM, TGI y llama.cpp no son opciones directas para este modelo ONNX de clasificación.
- Latencia y throughput: no disponibles; dependen del hardware, del tamaño de lote y de la longitud de las secuencias.
- Espacio en disco: el repositorio ocupa 1,7 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (ONNX FP32) | ~435 M | 512 | F1 medio 0,676 en 28 tareas zero-shot | MIT | ONNX FP32, opset 18 |
| Original PyTorch (MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c) | ~435 M | 512 | F1 medio 0,676 en 28 tareas zero-shot | MIT | PyTorch/Transformers |
| Otras variantes DeBERTa-v3 zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado especificaciones ni benchmarks verificados de alternativas en la información disponible. La comparación cuantitativa con otros modelos NLI, como BART-large-MNLI u otras variantes DeBERTa-v3, queda como no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para MMLU, HumanEval, GSM8K ni tareas de generación de texto, código o matemáticas.
- Longitud máxima de 512 tokens: los documentos largos deben dividirse en fragmentos, lo que puede perder contexto entre fragmentos.
- Idiomas no declarados: el entrenamiento se basa en datasets en inglés y no hay evaluación multilingüe documentada; el rendimiento fuera del inglés no está garantizado.
- El grafo no incluye softmax ni reordenamiento de etiquetas: es responsabilidad del integrador aplicar la activación, el umbral y el mapeo de etiquetas correctos.
- Las probabilidades pueden no estar calibradas; deben validarse con datos propios antes de usarlas en decisiones automatizadas.
- El rendimiento es sensible a la redacción de las etiquetas y de las hipótesis NLI; conviene probar varias formulaciones y validar con un conjunto etiquetado.
- Puede heredar sesgos de MNLI, FEVER-NLI y de los datos sintéticos generados con Mixtral; no se documenta una auditoría de sesgos.
- El riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos de entailment y de asignaciones de etiqueta incorrectas.
- La licencia MIT permite uso comercial, pero el software se ofrece sin garantías; los datos se declaran comercialmente compatibles, aunque no se detalla la cadena completa de licencias en la información disponible.
- La exportación usa opset 18; conviene verificar la compatibilidad con la versión de ONNX Runtime o del runtime Java utilizado.
- No hay métricas de adopción ni validación externa documentada en la información disponible; para producción se recomienda una evaluación propia antes del despliegue.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/inference4j/deberta-v3-large-zeroshot-v2.0-c)
- [Modelo original de Moritz Laurer](https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c)
- [Repositorio inference4j](https://github.com/inference4j/inference4j)
- [Dataset sintético synthetic_zeroshot_mixtral_v0.1](https://huggingface.co/datasets/MoritzLaurer/synthetic_zeroshot_mixtral_v0.1)
- [Dataset MNLI](https://huggingface.co/datasets/nyu-mll/multi_nli)
- [Dataset FEVER](https://huggingface.co/datasets/fever)
- [Perfil del autor original](https://huggingface.co/MoritzLaurer)
- [Revisión del modelo original b2730f1](https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v2.0-c/tree/b2730f16019076bb0009481121efbe4705e0e378)
- No se ha encontrado un paper asociado en la información disponible.
