# dilarayavuz/generated-sst2-addsent-bert-lr3

## Resumen

`dilarayavuz/generated-sst2-addsent-bert-lr3` es un modelo de clasificación de texto en inglés obtenido mediante fine-tuning de `google-bert/bert-base-uncased` con la librería AutoTrain de Hugging Face. El identificador del repositorio sugiere que el ajuste se realizó sobre la tarea SST-2 (análisis de sentimiento binario) con alguna variante de aumento de datos tipo "addsent", aunque la model card no confirma ni la composición del dataset ni el mapeo de etiquetas, por lo que ese extremo debe considerarse no verificado.

Se trata de un clasificador discriminativo, no de un modelo generativo: su salida es una distribución de probabilidad sobre las clases de la tarea, no texto. Cuenta con 109.483.778 parámetros reales (confirmados en los pesos `safetensors`), lo que coincide con la arquitectura BERT-base más la cabeza de clasificación de dos clases. El repositorio ocupa 1,3 GB, un tamaño muy superior al de los pesos finales en fp32 (unos 438 MB), lo que apunta a la presencia de checkpoints intermedios guardados durante el entrenamiento.

Su relevancia es fundamentalmente práctica y de investigación: sirve como línea base reproducible de clasificación de sentimiento con muy bajo coste de inferencia, y como ejemplo de flujo AutoTrain. No obstante, el modelo tiene 0 descargas y 0 "likes", no declara licencia ni idiomas soportados y no aporta información sobre hiperparámetros, número de épocas o composición del dataset, por lo que su uso en producción exige una validación independiente previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (heredada de `google-bert/bert-base-uncased`) |
| Parametros totales | 109.483.778 (dato real del repositorio, `safetensors`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite de la arquitectura del modelo base; no declarado en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en `safetensors`; no se documentan variantes GGUF, int8 ni fp16) |
| Idiomas soportados | No disponible (el modelo base es `bert-base-uncased`, entrenado principalmente con corpus en inglés) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (librería `transformers`); tamaño del repo 1,3 GB |
| Pipeline | `text-classification` |
| Modelo base | `google-bert/bert-base-uncased` |
| Tipo de tarea / etiquetas | Clasificación de texto; número y mapeo de etiquetas no disponible |
| Compatibilidad declarada | `endpoints_compatible`, `text-embeddings-inference`, `tensorboard` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base: un encoder transformer con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y un vocabulario de 30.522 tokens (WordPiece, sin distinción de mayúsculas). Sobre la representación del token `[CLS]` se añade una cabeza de clasificación que produce el logit o la probabilidad de la clase; esa cabeza adicional explica la diferencia entre los 109.483.778 parámetros totales y los ~110 M habitualmente citados para BERT-base. El preentrenamiento del modelo base es de tipo enmascarado (MLM) más predicción de frase siguiente (NSP), con un límite posicional estricto de 512 tokens.

El ajuste se realizó con AutoTrain, la herramienta de entrenamiento automático de Hugging Face, en modalidad de clasificación de texto. La model card únicamente documenta que el problema es "Text Classification" y reproduce las métricas de validación, sin especificar el número de épocas, el tamaño de lote, la tasa de aprendizaje efectiva (aunque el sufijo `lr3` del nombre sugiere un valor de learning rate asociado a la ejecución), el optimizador, la composición del dataset ni si se aplicaron técnicas de aumento de datos adversarias. No se documenta ningún uso de RLHF, DPO ni de decodificación especulativa, algo esperable en un clasificador discriminativo. Tampoco se describe ninguna innovación técnica propia: el valor del modelo reside en el ajuste concreto y en las métricas reportadas, no en aportaciones arquitectónicas.

## Capacidades

- Clasificación de texto en una única pasada hacia delante, con salida de probabilidades por clase; el pipeline declarado es `text-classification`.
- Análisis de sentimiento (polaridad) sobre textos cortos y medios, presumiblemente en dos clases, aunque el mapeo de etiquetas no está documentado.
- Manejo de entradas de hasta 512 tokens, suficiente para reseñas, tuits, asuntos y cuerpos de correo o párrafos de comentarios.
- Inferencia muy ligera: 109,5 M de parámetros permiten ejecución en CPU y en cualquier GPU de consumo.
- Compatibilidad con el ecosistema `transformers`, con `safetensors` y con el tag `endpoints_compatible` para su despliegue en Hugging Face Inference Endpoints.
- Capacidad de servir como extractor de características intermedias (representaciones de 768 dimensiones), aunque no está entrenado ni documentado como modelo de embeddings.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión, audio ni modo "thinking". No se declaran capacidades multilingües.

## Casos de uso

- Análisis de sentimiento de reseñas de producto: el modelo clasifica cada reseña (hasta 512 tokens) en una categoría de polaridad, lo que permite agregar métricas diarias de satisfacción por producto o por vendedor sin coste de GPU dedicada.
- Monitorización de reputación de marca en redes sociales: procesamiento por lotes de menciones y publicaciones para calcular un índice de sentimiento en tiempo real, filtrando después los casos negativos para revisión humana.
- Triaje de tickets de soporte: al puntuar el tono de cada mensaje entrante se pueden priorizar automáticamente los tickets con carga negativa, enrutándolos a agentes senior antes que las consultas neutras.
- Análisis de encuestas NPS y verbatims abiertos: clasificación masiva de respuestas de texto libre para complementar la puntuación numérica con la polaridad del comentario asociado.
- Investigación en PLN y docencia: sirve como línea base reproducible de fine-tuning con AutoTrain sobre SST-2, útil para comparar estrategias de aumento de datos, tasas de aprendizaje o modelos base alternativos.
- Moderación asistida de comunidades: puntuación de comentarios para destacar automáticamente los aportes positivos o para marcar hilos con tono predominantemente negativo, siempre con revisión humana posterior.
- Enriquecimiento de paneles de analítica: incorporación de una columna de sentimiento a pipelines de datos (por ejemplo, con la librería `transformers` en Python o exportando a ONNX) para cruzar opinión con variables de negocio como churn o volumen de ventas.

## Benchmarks y rendimiento

La model card solo publica métricas de validación de la propia ejecución de AutoTrain. No se aportan resultados sobre MMLU, HumanEval, GSM8K ni comparaciones frente a otros modelos; tampoco se describe el conjunto de validación empleado ni si hay solapamiento con el de entrenamiento.

| Metrica de validacion | Valor |
|---|---|
| Loss | 0,24509555101394653 |
| F1 | 0,9151515151515152 |
| Precision | 0,9569074778200254 |
| Recall | 0,8768873403019745 |
| AUC | 0,9689841082700857 |
| Accuracy | 0,9080761654629022 |

El desequilibrio entre precisión (0,957) y exhaustividad (0,877) indica una tendencia a clasificar en la clase positiva solo cuando la evidencia es clara, generando falsos negativos. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB con pesos en fp16 y lotes pequeños; en torno a 0,5–0,6 GB con pesos en fp32 y batch 1; el cuello de botella real suele ser la memoria de activaciones, que crece linealmente con el tamaño de lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM basta (por ejemplo, GTX 1650, T4, RTX 3060). Para despliegues de alto rendimiento por lotes, una T4, L4, A10G o RTX 4090 son más que suficientes; A100 y H100 solo tienen sentido si se sirve el modelo junto a otros en la misma GPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier modelo de los últimos ocho años, y también en CPU (la inferencia en CPU con `transformers` en fp32 es viable, aunque el rendimiento depende del número de núcleos).
- Opciones de despliegue: `transformers` (pipeline de `text-classification`), Hugging Face Inference Endpoints (el repositorio lleva el tag `endpoints_compatible`), Text Embeddings Inference (etiquetado por el autor), exportación a ONNX/OpenVINO con `optimum` para acelerar en CPU, y TorchServe o FastAPI para servir la inferencia. vLLM, llama.cpp y Ollama no están documentados para este repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo frente a alternativas, por lo que la comparación se limita a características estructurales de los modelos base de la misma categoría. Las cifras de parámetros y contexto corresponden a los modelos base públicos, no a ajustes equivalentes.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `dilarayavuz/generated-sst2-addsent-bert-lr3` | 109,5 M | 512 tokens | No disponible | Fine-tune de BERT-base con AutoTrain; F1 de validación 0,915 |
| `google-bert/bert-base-uncased` | ~110 M | 512 tokens | Apache-2.0 | Modelo base; requiere fine-tuning para clasificación |
| `distilbert-base-uncased` | ~66 M | 512 tokens | Apache-2.0 | Alternativa más ligera y rápida, con cierta pérdida de calidad en tareas de clasificación |
| `roberta-base` | ~125 M | 512 tokens | MIT | Entrenado con más datos y objetivos dinámicos; a menudo superior en sentimiento, con mayor coste de inferencia |
| `microsoft/deberta-v3-base` | ~86 M (backbone) | 512 tokens | MIT | Alternativa habitual cuando se prioriza precisión en clasificación de texto, más pesada de entrenar |

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita no hay autorización clara de uso comercial; conviene contactar con el autor o elegir un modelo con licencia conocida antes de integrarlo en un producto.
- Idiomas no declarados: el modelo base `bert-base-uncased` está preentrenado fundamentalmente con texto en inglés, por lo que el rendimiento en castellano u otros idiomas será previsiblemente pobre.
- Tarea y etiquetas no documentadas: se desconoce el número de clases, el orden de las etiquetas y su significado exacto, lo que impide mapear con fiabilidad las salidas del pipeline.
- Límite de 512 tokens: los textos más largos deben truncarse o segmentarse, con la consiguiente pérdida de información en documentos extensos.
- Riesgo de sesgo de dominio: si el ajuste se hizo sobre reseñas de películas (SST-2), el modelo puede degradarse en dominios como opiniones de producto, finanzas o soporte técnico.
- Sensibilidad a fenómenos lingüísticos: la ironía, el sarcasmo, la negación compleja y las opiniones mixtas son fuentes típicas de error en clasificadores de sentimiento de este tamaño.
- Métricas sobre una única partición de validación: no hay validación cruzada, conjunto de test independiente ni evaluación con datos adversarios, de modo que las cifras reportadas pueden ser optimistas.
- Historial nulo de uso: 0 descargas y 0 reacciones implican que no existe validación por parte de la comunidad ni informes de fallos en producción.
- No es un modelo generativo: no puede emplearse para resumir, responder preguntas ni ejecutar llamadas a herramientas; las probabilidades que devuelve no están calibradas y no deberían usarse como umbrales de decisión sin ajuste previo.
- Trazabilidad limitada: no se documentan épocas, hiperparámetros, composición del dataset ni semillas, lo que dificulta reproducir el resultado.
- Los 1,3 GB del repositorio incluyen previsiblemente checkpoints intermedios; conviene descargar solo los pesos finales para reducir el consumo de disco y de red.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dilarayavuz/generated-sst2-addsent-bert-lr3
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio de Transformers: https://github.com/huggingface/transformers
- AutoTrain (herramienta de entrenamiento empleada): https://github.com/huggingface/autotrain-advanced
- AutoTrain en Hugging Face: https://huggingface.co/autotrain
- Text Embeddings Inference (etiquetado por el autor): https://github.com/huggingface/text-embeddings-inference
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Dataset SST-2 (GLUE): https://nlp.stanford.edu/sentiment/
- Documentación del pipeline `text-classification`: https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
