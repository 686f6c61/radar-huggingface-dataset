# akrichetina/td5-query-classifier

## Resumen

td5-query-classifier es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) de distilbert-base-uncased, publicado por el usuario akrichetina en HuggingFace. Se trata de un clasificador encoder-only de 66.955.010 parámetros (aproximadamente 67 millones), distribuido en formato safetensors con licencia Apache 2.0 y etiquetado con el pipeline text-classification. El repositorio ocupa 0,5 GB y la model card indica que fue generado automáticamente por la librería Trainer de transformers.

El modelo resuelve una tarea de clasificación de consultas (query classification), presumiblemente la asignación de una categoría o intención a una consulta de entrada, aunque la model card no documenta el conjunto de etiquetas ni el dominio concreto. Su relevancia práctica radica en el tamaño reducido: al derivar de DistilBERT, es un modelo de 6 capas y ~67 M de parámetros que puede ejecutarse en CPU con latencias de milisegundos, lo que lo hace apto como componente de enrutamiento o prefiltrado dentro de arquitecturas mayores.

El autor declara una accuracy de 1.0 y una pérdida de validación de 0,1579 sobre un conjunto de evaluación no especificado. Estos valores, junto con la ausencia de documentación sobre el dataset de entrenamiento (la model card indica literalmente "None dataset"), limitan seriamente la interpretabilidad de los resultados. El impacto en HuggingFace es nulo en el momento de la consulta (0 descargas, 0 likes), por lo que debe considerarse un experimento académico o de curso (el prefijo "td5" sugiere un trabajo práctico) más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilación de BERT-base, 6 capas, 12 cabezas de atención) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite de posiciones del modelo base distilbert-base-uncased; no declarado explícitamente en la model card) |
| Tipos de cuantizacion | No se publican pesos cuantizados. Al estar en safetensors fp32, admite cuantización posterior a int8/fp16 con herramientas estándar |
| Idiomas soportados | No disponible (no declarado por el autor; el modelo base está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con carga vía transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, una versión destilada de BERT-base que reduce el número de capas de 12 a 6 y elimina los embeddings de tipo de token, conservando 768 dimensiones ocultas y 12 cabezas de atención por capa. Sobre esta base se añade una cabeza de clasificación por secuencia (sequence classification) con tantas salidas como etiquetas tenga la tarea, aunque el número y nombre de esas etiquetas no se documenta en la información disponible. El repositorio incluye los pesos en safetensors con un tamaño total de 0,5 GB.

El entrenamiento se realizó con la librería transformers 5.19.0 sobre PyTorch 2.14.1+cpu y tokenizers 0.23.2, con los siguientes hiperparámetros declarados: learning rate de 2e-05, tamaño de batch de 8 (tanto en entrenamiento como en evaluación), 3 épocas, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. El entrenamiento completo constó de solo 30 pasos (10 pasos por época), lo que implica un conjunto de datos muy reducido (del orden de decenas de ejemplos). No se documenta composición del dataset, ni técnicas de RLHF/DPO, ni ninguna innovación arquitectónica adicional: es un fine-tuning estándar de clasificación.

## Capacidades

- Clasificación de texto por secuencia: devuelve una etiqueta (o distribución sobre etiquetas) para una consulta de entrada. El conjunto concreto de etiquetas no está documentado.
- Inferencia sobre secuencias de hasta 512 tokens, con tokenizador WordPiece en minúsculas (uncased).
- Ejecución en CPU: el modelo declara entrenamiento y evaluación en PyTorch 2.14.1+cpu, y su tamaño permite inferencia sin GPU.
- Compatibilidad con la librería transformers y con el runtime text-embeddings-inference (etiqueta presente en el repositorio), así como con endpoints compatibles.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica; es un clasificador discriminativo, no un modelo generativo.
- Capacidades multilingües: no disponibles ni declaradas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede actuar como clasificador de intención en la primera etapa de un sistema conversacional, derivando cada consulta al flujo o al agente correspondiente. Su tamaño de ~67 M de parámetros permite ejecutarlo en CPU con coste mínimo frente a un LLM generativo.
- Triaje de tickets en mesas de ayuda: clasificar automáticamente incidencias entrantes por categoría (red, hardware, acceso, facturación) antes de asignarlas a un equipo. Solo es viable si se verifica previamente que el conjunto de etiquetas del modelo coincide con la taxonomía interna.
- Prefiltrado en pipelines RAG: decidir si una consulta requiere recuperación documental o puede responderse directamente, reduciendo el número de llamadas al modelo generativo y el coste asociado.
- Detección de spam, abuso o consultas fuera de dominio: como guardarraíl previo a un modelo mayor, descartando o marcando entradas anómalas antes de que lleguen al sistema principal.
- Analítica de logs de búsqueda: etiquetar grandes volúmenes de consultas históricas para construir informes de intención de usuario y detectar tendencias, aprovechando el bajo coste de inferencia.
- Clasificación de consultas en comercio electrónico: dirigir búsquedas de producto a la categoría o al catálogo adecuado en un motor de búsqueda interno.
- Componente educativo o de referencia: por su tamaño y simplicidad, sirve como ejemplo reproducible de pipeline de fine-tuning con Trainer, útil en docencia o prototipado rápido.
- Etiquetado asistido de datos: preanotar un corpus de consultas para revisión humana posterior, siempre que se valide antes la precisión real sobre datos propios.

## Benchmarks y rendimiento

El model-index del repositorio está vacío (`"results": []`), por lo que no se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, etc.) en la información disponible. El autor únicamente declara métricas sobre su propio conjunto de evaluación, cuyo contenido y tamaño no se especifican:

| Epoca | Paso | Pérdida de validación | Accuracy |
|---|---|---|---|
| 1.0 | 10 | 0,3891 | 1.0 |
| 2.0 | 20 | 0,2061 | 1.0 |
| 3.0 | 30 | 0,1579 | 1.0 |

La accuracy de 1.0 constante desde la primera época, junto con la ausencia de descripción del conjunto de evaluación y el reducido número de pasos de entrenamiento, sugiere un conjunto de validación muy pequeño o poco representativo. Estos valores no deben extrapolarse a datos reales. No se dispone de comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. En fp32, los pesos ocupan aproximadamente 268 MB; en fp16, unos 134 MB; en int8, unos 67 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, T4, RTX 3060 o superiores). Modelos como A100 o H100 no aportan ventaja apreciable para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos ocho años, e incluso en CPU sin GPU dedicada, con un consumo de memoria RAM inferior a 500 MB.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (etiqueta declarada en el repositorio), endpoints compatibles. La conversión a ONNX o a GGUF para llama.cpp/Ollama es técnicamente posible, pero no se distribuyen artefactos de ese tipo en el repositorio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| td5-query-classifier | 66,96 M | 512 tokens | Apache 2.0 | HuggingFace (0 descargas) | Accuracy 1.0 declarada por el autor sobre un conjunto no especificado |
| distilbert-base-uncased | 66,36 M | 512 tokens | Apache 2.0 | HuggingFace, ampliamente usado | Métricas públicas en GLUE y SQuAD |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | HuggingFace | Métricas públicas en GLUE y SQuAD |
| roberta-base | 125 M | 512 tokens | MIT | HuggingFace | Métricas públicas en GLUE |
| deberta-v3-base | 86 M | 512 tokens | MIT | HuggingFace | Métricas públicas en GLUE y SuperGLUE |

No se dispone de comparaciones directas de rendimiento en la tarea concreta de clasificación de consultas, ya que ni el autor ni los modelos alternativos publican resultados sobre ese conjunto de datos. La comparación debe entenderse por tanto como una referencia de tamaño, licencia y disponibilidad, no de calidad.

## Limitaciones y advertencias

- Model card generada automáticamente y sin completar: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed".
- Dataset de entrenamiento no documentado: el texto indica que se entrenó sobre "None dataset", por lo que se desconoce la procedencia, el tamaño, la composición y los posibles sesgos de los datos.
- Conjunto de etiquetas desconocido: no se especifica cuántas clases tiene el modelo ni qué representa cada una, lo que impide evaluar su utilidad real sin inspeccionar el `config.json` del repositorio.
- Accuracy de 1.0 no fiable como indicador de calidad: con solo 30 pasos de entrenamiento y un conjunto de evaluación no descrito, es muy probable que la métrica refleje sobreajuste o una evaluación poco exigente.
- Riesgo de alucinación: no aplica en sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la clasificación errónea con alta confianza (sobreconfianza en las probabilidades de salida).
- Sesgos: no evaluados ni documentados. Al derivar de distilbert-base-uncased, hereda los sesgos presentes en los corpus web en inglés usados para preentrenar el modelo base.
- Limitaciones de idioma: el modelo base está preentrenado mayoritariamente en inglés; el comportamiento sobre texto en castellano no está documentado ni validado.
- Límite de contexto de 512 tokens: las consultas más largas deberán truncarse, con la consiguiente pérdida de información.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no exime de la responsabilidad sobre el rendimiento en producción ni sobre el cumplimiento normativo de los datos tratados.
- Falta de validación externa: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente ni de replicación de resultados.
- Fechas de creación y actualización poco habituales (2026), lo que puede indicar metadatos inconsistentes en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akrichetina/td5-query-classifier
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, papers, blogs, repositorios ni demos asociados. Los resultados devueltos por la búsqueda corresponden únicamente a la plataforma YouTube y no guardan relación con este modelo.
