# Kristo4/learn_hf_food_not_food_text_classifier_distilbert_base_uncased

## Resumen

El modelo `learn_hf_food_not_food_text_classifier_distilbert_base_uncased` es un clasificador de texto binario desarrollado por Kristo4, que determina si un texto está relacionado con comida o no. Se basa en la arquitectura DistilBERT, una versión destilada de BERT, y ha sido fine-tuneado sobre un conjunto de datos no especificado. Con 66,9 millones de parámetros, es un modelo compacto y eficiente para tareas de clasificación de texto en inglés.

Este modelo resulta relevante como ejemplo práctico de fine-tuning de un transformer encoder para una tarea sencilla de NLP. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño reducido lo hace viable para despliegues en entornos con recursos limitados, como CPUs o GPUs de gama baja. Sin embargo, al ser un modelo de demostración con pocas descargas, su rendimiento en producción no está garantizado.

La ventana de contexto heredada de DistilBERT es de 512 tokens, suficiente para la mayoría de textos cortos. El modelo está disponible en formato safetensors y es compatible con la librería Transformers de HuggingFace, así como con herramientas de inferencia como text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 (heredado de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (presumiblemente inglés, al ser uncased) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, un transformer encoder destilado de BERT base. DistilBERT conserva el 97% de las capacidades de BERT con un 40% menos de parámetros, utilizando 6 capas, 768 dimensiones ocultas y 12 cabezas de atención. En este caso, la capa de clasificación se ha adaptado para una salida binaria (comida/no comida).

El fine-tuning se realizó sobre un dataset desconocido, con los siguientes hiperparámetros: learning rate de 0.0001, batch size de 32, optimizador AdamW, scheduler lineal y 10 épocas. Según la model card, el modelo alcanzó una accuracy de 1.0 en el conjunto de evaluación desde la primera época, con una pérdida final de 0.0001. No se especifica el tamaño del dataset ni su composición, ni se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Clasificación binaria de texto: determina si un texto trata sobre comida o no.
- Procesamiento de texto en inglés (presumiblemente, dado el tokenizador uncased).
- Inferencia rápida gracias a la arquitectura destilada.
- Compatible con pipelines de Transformers para clasificación de texto.
- No soporta generación de texto, tool calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Moderación de contenido en foros o redes sociales: el modelo puede filtrar publicaciones relacionadas con comida para su revisión o categorización.
- Análisis de menús en aplicaciones de restauración: clasificar descripciones de platos para etiquetarlos automáticamente.
- Organización de recetas: agrupar textos de recetas en una base de datos según su temática culinaria.
- Detección de spam en comentarios: identificar mensajes que promocionan productos alimenticios.
- Clasificación de reseñas de restaurantes: separar reseñas que mencionan comida de las que hablan de otros aspectos (servicio, ambiente).
- Automatización de encuestas: categorizar respuestas abiertas sobre hábitos alimenticios.

Dado su tamaño reducido, puede ejecutarse en CPU sin problemas, lo que facilita su integración en aplicaciones ligeras o entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta una accuracy de 1.0 y una pérdida de 0.0001 en el conjunto de evaluación, pero estos datos provienen del propio autor y no corresponden a benchmarks estandarizados como MMLU, GLUE o SuperGLUE. No se puede comparar con otros modelos de forma objetiva sin estos datos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (el modelo pesa ~268 MB en safetensors).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 2060). También funciona en CPU.
- Compatible con consumer GPUs: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: Transformers (Python), ONNX Runtime, text-embeddings-inference, o exportación a TorchScript.
- Latencia: en CPU, inferencia en ~10-50 ms por texto corto; en GPU, ~1-5 ms.
- Throughput: puede procesar cientos de peticiones por segundo en GPU con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Accuracy (eval) | Notas |
|---|---|---|---|---|---|
| learn_hf_food_not_food (DistilBERT) | 66,9M | 512 | Apache 2.0 | 1.0 (reportado) | Fine-tune específico, dataset desconocido |
| BERT base uncased (fine-tune genérico) | 110M | 512 | Apache 2.0 | variable | Más grande, requiere más recursos |
| RoBERTa base (fine-tune genérico) | 125M | 512 | MIT | variable | Mejor rendimiento en algunos benchmarks, mayor coste |
| DistilBERT base (sin fine-tune) | 66,9M | 512 | Apache 2.0 | N/A | Modelo base, no clasifica comida/no comida |

La comparativa se basa en características generales; no se dispone de benchmarks comunes para este modelo concreto.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide evaluar su representatividad y posibles sesgos.
- La accuracy perfecta (1.0) en evaluación sugiere un posible sobreajuste al conjunto de validación, lo que puede indicar baja generalización a datos nuevos.
- Solo se ha entrenado para clasificación binaria comida/no comida; no es adecuado para otras tareas sin reentrenamiento.
- El idioma no está especificado; al usar un tokenizador uncased, es probable que solo funcione bien con texto en inglés.
- No hay garantías de rendimiento en producción; es un modelo de demostración con 0 descargas y 0 likes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni mantenimiento.

## Enlaces

- [HuggingFace - Kristo4/learn_hf_food_not_food_text_classifier_distilbert_base_uncased](https://huggingface.co/Kristo4/learn_hf_food_not_food_text_classifier_distilbert_base_uncased)
- [Modelo similar en HuggingFace - andress02](https://huggingface.co/andress02/learn_hf_food_not_food_text_classifier-distilbert-base-uncased)
- [Ficha en AIBase](https://model.aibase.com/models/details/1915748764360531970)
- [Ficha alternativa en AIBase](https://model.aibase.com/models/details/1924735252866273280)
- [Proyecto GitHub relacionado - AnubhavKarki](https://github.com/AnubhavKarki/hf-food-not-food-classification)
