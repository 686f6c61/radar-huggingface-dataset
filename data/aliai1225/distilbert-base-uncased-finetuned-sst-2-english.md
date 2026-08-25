# aliai1225/distilbert-base-uncased-finetuned-sst-2-english

## Resumen

El modelo `aliai1225/distilbert-base-uncased-finetuned-sst-2-english` es un checkpoint de DistilBERT, la versión destilada de BERT desarrollada por Hugging Face, ajustado para clasificación de sentimiento sobre el dataset Stanford Sentiment Treebank (SST-2). El ajuste se realizó sobre la partición de entrenamiento de SST-2, integrado en el benchmark GLUE, y el modelo se publica bajo licencia Apache-2.0, con un tamaño de 66.955.410 parámetros. Está diseñado exclusivamente para el idioma inglés y para la tarea concreta de clasificación binaria de sentimiento (positivo/negativo).

Su relevancia radica en que combina el rendimiento de BERT con un tamaño notablemente inferior (cerca de la mitad de parámetros), lo que permite inferencias rápidas y despliegue en entornos con recursos limitados. Este checkpoint concreto no introduce ninguna innovación arquitectónica adicional, sino que es una adaptación supervisada de DistilBERT a un dataset específico, lo que lo hace útil como punto de partida para aplicaciones de análisis de opinión en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base) |
| Parametros totales | 66.955.410 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (típico de DistilBERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (también disponibles PyTorch, TensorFlow, ONNX y Rust según los tags) |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura de tipo transformer encoder que fue obtenida mediante destilación de conocimiento desde BERT base. El proceso de destilación se describe en el artículo *DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter* (arXiv:1910.01108). Aunque no se han proporcionado detalles específicos sobre la configuración interna del modelo, DistilBERT base utiliza 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, con una reducción del 40% de parámetros respecto a BERT base (110 millones) y una pérdida de rendimiento mínima.

El checkpoint se ajustó mediante fine-tuning supervisado sobre el dataset SST-2, uno de los subconjuntos de GLUE. El entrenamiento se realizó sobre el split de entrenamiento de SST-2, tal como indican las métricas reportadas en la model card. No se ha indicado si se emplearon técnicas adicionales como RLHF o DPO; se trata de un ajuste estándar de clasificación.

## Capacidades

- Clasificación de texto binaria: el modelo asigna una etiqueta de sentimiento (positivo o negativo) a una frase o secuencia corta.
- Análisis de sentimiento en inglés: funciona bien en textos de tipo oración o fragmento corto, como reseñas, comentarios o tuits.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica, es un modelo de clasificación, no generativo.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: ninguna más allá de la clasificación de sentimiento; no tiene visión, audio ni modo de razonamiento.

## Casos de uso

- Análisis de opiniones de productos: se puede integrar en un pipeline de e-commerce para clasificar automáticamente las reseñas de clientes como positivas o negativas. El modelo es ligero y puede ejecutarse en CPU, lo que facilita su despliegue en servidores con bajo coste.
- Monitorización de redes sociales: analizar tuits o comentarios en inglés para detectar sentimiento negativo hacia una marca o producto, permitiendo una respuesta temprana a crisis de reputación.
- Clasificación de tickets de soporte: asignar automáticamente una prioridad a los tickets de atención al cliente según el sentimiento de la solicitud, priorizando los de tono negativo.
- Análisis de encuestas y formularios: procesar respuestas abiertas en inglés para cuantificar el nivel de satisfacción global de los usuarios.
- Filtrado de contenido en foros o comentarios: detectar mensajes con sentimiento negativo que puedan ser tóxicos o agresivos, aunque el modelo no está entrenado para toxicidad específica, puede ser un primer filtro.
- Preprocesado para análisis de opinión en streaming: al ser muy ligero, puede integrarse en pipelines de datos en tiempo real para clasificar mensajes a medida que llegan, usando bibliotecas como `transformers` con `pipeline` o `vLLM`.

## Benchmarks y rendimiento

Los resultados oficiales del modelo, según la model card, se resumen en la siguiente tabla. Se reportan métricas sobre el split de validación de SST-2 y sobre el split de entrenamiento del mismo dataset.

| Métrica | Validación (SST-2) | Entrenamiento (SST-2) |
|---|---|---|
| Accuracy | 0,9106 | 0,9886 |
| Precisión | 0,8978 | 0,9882 (macro) |
| Recall | 0,9302 | 0,9886 (macro) |
| F1 | 0,9137 | 0,9884 (macro) |
| AUC | 0,9717 | no reportado |
| Loss | 0,3901 | no reportado |

Según la búsqueda web, el modelo alcanza una precisión del 91,3% en el dev set de SST-2, mientras que el BERT base original llega al 92,7%. Estos datos coinciden con el accuracy reportado en la tabla de validación (0,9106).

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 66,9 millones de parámetros, en FP32 los pesos ocupan aproximadamente 268 MB. En FP16 se reduce a unos 134 MB. Con los overheads de activaciones, una GPU con 1-2 GB de VRAM es suficiente para inferencia en lote pequeño.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060 o superiores). También funciona correctamente en CPU para inferencia de baja frecuencia.
- Compatibilidad con GPU consumer: sí, es un modelo ligero que cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: se puede ejecutar con la librería `transformers` de Hugging Face (PyTorch/TensorFlow), mediante `pipeline` para clasificación, o con servidores de inferencia como vLLM, TGI u Ollama (si se convierte a GGUF). También es compatible con ONNX Runtime para aceleración en CPU.
- Latencia y throughput estimados: no se han publicado datos oficiales. En una CPU moderna, una inferencia individual suele tardar entre 5 y 20 ms; en GPU, menos de 1 ms por ejemplo, dependiendo del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión en SST-2 (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|
| DistilBERT base uncased (este modelo) | 66,9 M | 91,3 % | Apache-2.0 | Hugging Face |
| BERT base uncased | 110 M | 92,7 % | Apache-2.0 | Hugging Face |
| RoBERTa base | 125 M | 94,8 % (valor aproximado, no verificado en esta ficha) | MIT | Hugging Face |

Nota: los datos de BERT base provienen de la búsqueda web (Microsoft Foundry). El valor de RoBERTa no está disponible en la información proporcionada, por lo que se marca como no verificado. Este modelo ofrece una ventaja de velocidad y menor uso de recursos frente a BERT base, con una pérdida de precisión de alrededor de 1,4 puntos porcentuales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- Solo realiza clasificación binaria (positivo/negativo); no detecta emociones más finas ni clases múltiples.
- No es un modelo generativo: no produce texto, solo etiquetas de clasificación.
- Su rendimiento puede degradarse en textos con jerga, sarcasmo o lenguaje informal no representado en el dataset SST-2.
- No se han publicado análisis de sesgos; como todo modelo de lenguaje, puede reflejar sesgos presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de los datos de entrenamiento (SST-2) si se utiliza en aplicaciones con requisitos específicos.
- Al ser un checkpoint fine-tuned, su uso fuera del dominio de análisis de sentimiento en inglés no es recomendable sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliai1225/distilbert-base-uncased-finetuned-sst-2-english
- Modelo original de DistilBERT (base): https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01102
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/distilbert-base-uncased-finetuned-sst-2-english
- Repositorio GitHub con la descripción del modelo: https://github.com/mmargauden/distilbert-base-uncased-finetuned-sst-2-english
