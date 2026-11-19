# knowledgator/gliclass-v4-edge

## Resumen

GLiClass v4 Edge es un modelo encoder de 0,4 mil millones de parámetros especializado en clasificación zero-shot y multi-etiqueta, desarrollado por Knowledgator. Se construye sobre `microsoft/deberta-v3-large` y forma parte de la familia GLiClass v4, en esta ocasión en una variante "edge" pensada para ejecutarse en CPU y dispositivos con recursos limitados. A diferencia de los modelos generativos, no produce texto: recibe un texto de entrada, una lista de etiquetas y, opcionalmente, una instrucción, y devuelve una puntuación calibrada para cada etiqueta en una única pasada forward.

El modelo resuelve el problema de la clasificación flexible sin reentrenamiento: las etiquetas y la política de decisión se definen en tiempo de inferencia mediante el parámetro `prompt`, lo que permite reutilizar el mismo checkpoint para moderación de contenido, guardrails, reranking, razonamiento sobre grafos de conocimiento o evaluación de calidad. Su relevancia actual radica en que ofrece capacidades de "modelo de decisión" con una latencia mediana declarada de 11 ms por decisión y un Decision Index de 47,5, por delante de modelos de hasta 1B de parámetros en el board público citado por el autor.

La arquitectura es un transformer encoder DeBERTa-v3-large con 439.790.595 parámetros totales, licencia Apache 2.0, pesos en safetensors y ONNX, y soporte exclusivo del idioma inglés según la model card. El repositorio ocupa 3,3 GB e incluye resultados de evaluación publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large, con atención disentangled) |
| Parametros totales | 439.790.595 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (valor usado en los ejemplos de la model card con `max_length=2048`); el máximo nativo de DeBERTa-v3-large no se especifica en la información disponible |
| Tipos de cuantizacion | no disponible (se distribuyen safetensors y ONNX; no se detallan variantes cuantizadas en la información proporcionada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en `microsoft/deberta-v3-large`, un transformer encoder con atención disentangled y embeddings de posición relativos, adaptado mediante la librería `gliclass` para la tarea de clasificación zero-shot y multi-etiqueta. La formulación trata las etiquetas como parte de la entrada: el texto, las etiquetas y la instrucción opcional se procesan conjuntamente, y el modelo emite una puntuación por etiqueta en una sola pasada forward, sin generación autoregresiva. Soporta clasificación multi-etiqueta (con umbral configurable), single-label (softmax sobre las etiquetas) y etiquetas jerárquicas.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos deben considerarse no disponibles. Sí se indica que las puntuaciones están calibradas sobre datos held-out y que cada predicción incluye también `initial_score`, la puntuación sin calibrar. La model card referencia los papers arXiv:2508.07662 y arXiv:2609.02292, que probablemente contienen los detalles metodológicos, pero su contenido no se incluye en la información proporcionada.

## Capacidades

- Clasificación zero-shot multi-etiqueta: devuelve una puntuación por etiqueta en una única pasada, con umbral configurable.
- Clasificación single-label: selecciona una única respuesta mediante softmax sobre las etiquetas.
- Seguimiento de instrucciones: el parámetro `prompt` permite definir políticas, rúbricas o criterios que modulan la interpretación de las etiquetas.
- Clasificación jerárquica: admite etiquetas anidadas (por ejemplo, sentimiento y tema) y devuelve probabilidades por nivel con `return_hierarchical=True`.
- Few-shot en inferencia: acepta ejemplos con `examples=[{"text": ..., "labels": [...]}]`.
- Reranking: puntúa pasajes frente a una consulta usando la consulta como etiqueta y una instrucción de relevancia.
- Razonamiento sobre grafos de conocimiento: permite formular preguntas multi-hop pasando el grafo como texto y las respuestas como etiquetas.
- Guardrails y moderación de contenido: clasificación de cumplimiento de políticas con instrucciones explícitas.
- NLI: soporta etiquetas de `entailment`, `neutral` y `contradiction`.
- Evaluación de calidad: escalas tipo Likert como etiquetas para puntuar respuestas.
- API de decisión estilo Jev: preguntas tipadas (`choice`, `noul`) con estado, instrucciones y criterios, devolviendo probabilidades por opción.
- Capacidades multilingües: limitadas al inglés según la model card.
- No soporta generación de texto, tool calling generativo ni razonamiento multi-step autoregresivo.

## Casos de uso

- Moderación de contenido y guardrails: se define una política en el parámetro `prompt` y se clasifican mensajes como "viola la política" o "cumple la política". La calibración de puntuaciones y la latencia de 11 ms por decisión lo hacen adecuado para filtrado en línea de alto volumen.
- Clasificación de tickets de soporte: con etiquetas como "facturación", "envío", "producto defectuoso" o "cuenta", el modelo asigna múltiples categorías por ticket en una sola pasada, sin necesidad de reentrenar al añadir nuevas categorías.
- Reranking en pipelines RAG: se puntúan pasajes recuperados frente a la consulta del usuario usando la consulta como etiqueta y una instrucción de relevancia, reduciendo el número de documentos enviados al modelo generativo y, con ello, el coste y la latencia del sistema.
- Enrutamiento de decisiones en agentes: dado un estado (texto o JSON) y un conjunto de acciones posibles, el modelo devuelve la probabilidad de cada acción; encaja en la API de decisión estilo Jev descrita en la model card.
- Análisis de sentimiento y temas con etiquetas jerárquicas: combinación de sentimiento y temática en una sola llamada con `return_hierarchical=True`, útil para paneles de voz del cliente.
- Evaluación automática de respuestas: uso de una escala de 1 a 5 como etiquetas para puntuar la calidad factual de respuestas generadas, con probabilidades por nivel en lugar de una única etiqueta.
- Razonamiento sobre grafos de conocimiento: responder preguntas de acceso o permisos pasando el grafo como texto y las respuestas como etiquetas, útil en sistemas de control de acceso o auditoría.
- Despliegue en edge y CPU: al ser un encoder de 0,4B con exportación ONNX, puede ejecutarse en dispositivos sin GPU para clasificación de flujos de texto en local.

## Benchmarks y rendimiento

La model card reporta resultados del Decision Index público:

| Metrica | Valor |
|---|---|
| Decision Index (public skill) | 47,5 |
| Latencia mediana por decisión | 11 ms |
| Mejor modelo de hasta 1B en el board público | 36,9 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K; estos no aplican directamente a un modelo de clasificación sin generación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 439,8M de parámetros en fp32, aproximadamente 1,8 GB de pesos; en fp16, alrededor de 0,9 GB. El repositorio completo ocupa 3,3 GB, incluyendo safetensors y ONNX.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está diseñado para no requerirlas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM; también en CPU, que es el objetivo declarado de la variante edge.
- Opciones de despliegue: librería `gliclass` (PyTorch), exportación ONNX para inferencia en CPU y runtime ONNX; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: latencia mediana de 11 ms por decisión según el autor; el throughput no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiClass v4 Edge | 439,8M | 2048 tokens (uso en ejemplos) | 47,5 | Apache 2.0 | Hugging Face, ONNX |
| Mejor modelo hasta 1B en el board público citado | hasta 1B | no disponible | 36,9 | no disponible | no disponible |
| GLiClass v4 (variante completa) | no disponible | no disponible | no disponible | no disponible | referenciado en GitHub |

La información disponible no identifica por nombre los modelos comparables del board público ni ofrece sus especificaciones detalladas; la comparativa se limita a los datos reportados por el autor.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- No genera texto: no sirve para tareas generativas, resumen, traducción ni razonamiento autoregresivo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas cuando las etiquetas o la instrucción son ambiguas; la calibración de puntuaciones ayuda a mitigarlo con umbrales.
- El rendimiento depende fuertemente de la calidad de las etiquetas y del `prompt`; políticas mal redactadas producen decisiones inconsistentes.
- La longitud de contexto efectiva en los ejemplos es de 2048 tokens; textos más largos requieren truncado o segmentación.
- No se documentan sesgos específicos en la información disponible; al entrenarse sobre datos en inglés, es probable que herede sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `microsoft/deberta-v3-large` y de los papers referenciados.
- Los resultados del Decision Index provienen del autor y del board público citado; no se dispone de replicación independiente en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/knowledgator/gliclass-v4-edge
- Repositorio GitHub: https://github.com/Knowledgator/GLiClass
- Paper arXiv:2508.07662: https://arxiv.org/abs/2508.07662
- Paper arXiv:2609.02292: https://arxiv.org/abs/2609.02292
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
