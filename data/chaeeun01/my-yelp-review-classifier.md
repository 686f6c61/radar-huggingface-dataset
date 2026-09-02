# chaeeun01/my-yelp-review-classifier

## Resumen

El modelo `chaeeun01/my-yelp-review-classifier` es un clasificador de texto basado en la arquitectura DistilBERT, diseñado para predecir la valoración en estrellas de una reseña de Yelp a partir de su texto. Ha sido publicado en Hugging Face por el usuario `chaeeun01` el 2 de septiembre de 2026, aunque la model card asociada está prácticamente vacía y no proporciona detalles sobre el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación.

El modelo cuenta con 66.955.010 parámetros y se distribuye en formato `safetensors`, con un tamaño de repositorio de 0,3 GB. Está registrado con el pipeline de `text-classification` y es compatible con la librería `transformers` y con `text-embeddings-inference`. Su relevancia radica en ser un ejemplo de fine-tuning de DistilBERT para una tarea concreta de análisis de sentimiento, aunque la falta de documentación limita su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto de DistilBERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en DistilBERT, un modelo transformer encoder destilado de BERT que conserva aproximadamente el 40 % de los parámetros del modelo original manteniendo un rendimiento cercano. El modelo está configurado para clasificación de texto, con una cabeza de clasificación sobre la capa de pooling. No se dispone de información sobre el proceso de entrenamiento: no se especifican los datos de entrenamiento (presumiblemente el dataset de reseñas de Yelp), el número de épocas, la configuración de hiperparámetros ni si se aplicaron técnicas como fine-tuning supervisado o destilación adicional. La model card no incluye detalles sobre el régimen de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Clasificación de texto: predice una etiqueta de sentimiento asociada a una reseña de Yelp (probablemente de 1 a 5 estrellas, aunque no se confirma en la model card).
- Análisis de sentimiento: adecuado para tareas de clasificación de opiniones en texto corto.
- Integración con `transformers`: se puede cargar mediante la API estándar de Hugging Face para inferencia.
- Compatible con `text-embeddings-inference` para despliegue optimizado.
- No se documentan capacidades de generación de texto, tool calling, agentes ni multimodales.

## Casos de uso

- Análisis de opiniones de clientes: el modelo puede clasificar automáticamente reseñas de Yelp en categorías de sentimiento (muy negativo, negativo, neutral, positivo, muy positivo) para monitorizar la satisfacción del cliente en restauración, comercio u hostelería.
- Filtrado de reseñas en plataformas: integrar el modelo en un pipeline para priorizar reseñas negativas que requieran atención del servicio de atención al cliente.
- Investigación académica: servir como punto de partida para experimentos de fine-tuning de DistilBERT en tareas de clasificación de sentimiento, comparando con otros modelos base.
- Prototipado rápido: al ser un modelo pequeño (66 M de parámetros), es adecuado para pruebas de concepto en entornos con recursos limitados.
- Enriquecimiento de datos: etiquetar automáticamente grandes volúmenes de reseñas no anotadas para crear conjuntos de datos de entrenamiento.
- Monitorización de marca: analizar la evolución del sentimiento de las reseñas a lo largo del tiempo en un negocio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (precisión, F1, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 66 M de parámetros, la inferencia en FP32 requiere aproximadamente 268 MB de memoria (66.955.010 × 4 bytes). Con cuantización a int8, se reduciría a unos 67 MB, aunque no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia en lote pequeño. Una GPU de consumo como NVIDIA GTX 1050 Ti o superior puede ejecutarlo sin problemas.
- CPU: también es viable la inferencia en CPU, con latencias de decenas de milisegundos por muestra.
- Opciones de despliegue: se puede servir con `transformers` mediante pipelines, con `text-embeddings-inference` (indicado en los tags), o exportar a ONNX para optimización.
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de este tamaño se espera una latencia inferior a 10 ms por muestra en GPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existen otros clasificadores de reseñas Yelp en Hugging Face, como `Neleac/yelp-review-classifier` o `Cucs/yelp_review_classifier`, pero no se conocen sus especificaciones exactas ni sus métricas. Se recomienda evaluar este modelo frente a alternativas como `distilbert-base-uncased-finetuned-sst-2-english` (clasificación de sentimiento en inglés) o modelos más recientes como `roberta-base` fine-tuneado, pero no se dispone de datos comparativos publicados.

## Limitaciones y advertencias

- La model card está vacía: no se documentan sesgos, riesgos ni limitaciones específicas. Esto impide conocer el comportamiento en dominios fuera de reseñas de Yelp.
- Idioma no especificado: probablemente entrenado con reseñas en inglés, pero no se confirma. Su uso en otros idiomas puede degradar el rendimiento.
- Licencia no disponible: no se puede determinar si el modelo es de uso libre, lo que supone un riesgo legal para su uso comercial.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas en entradas fuera de distribución.
- Sin garantías de rendimiento: al no haber benchmarks, no se puede asegurar una precisión mínima en producción.
- Contexto limitado: la longitud de contexto no se especifica, pero DistilBERT suele manejar hasta 512 tokens; reseñas más largas podrían truncarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaeeun01/my-yelp-review-classifier
- Repositorio de referencia similar (no oficial): https://github.com/Neleac/yelp-review-classifier
- Otro clasificador similar en Hugging Face: https://huggingface.co/Neleac/yelp-review-classifier
- Otro clasificador similar en Hugging Face: https://huggingface.co/Cucs/yelp_review_classifier
- Paper de DistilBERT (referencia arquitectónica): https://arxiv.org/abs/1910.09700
