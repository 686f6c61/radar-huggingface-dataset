# farzintamimi/food_no_food_classifier_distilbert_base_uncased

## Resumen

El modelo `farzintamimi/food_no_food_classifier_distilbert_base_uncased` es un clasificador de texto binario que determina si un texto está relacionado con comida o no. Se trata de un fine-tuning de `distilbert/distilbert-base-uncased`, un modelo transformer encoder de 66,9 millones de parámetros, entrenado con un dataset no especificado por el autor. El modelo fue generado automáticamente mediante el `Trainer` de HuggingFace y alcanza una precisión del 100 % en el conjunto de evaluación según la model card, aunque no se detallan los datos de entrenamiento ni el proceso de validación.

La relevancia de este modelo radica en su simplicidad y bajo coste computacional: al estar basado en DistilBERT, ofrece una alternativa ligera para tareas de clasificación de texto en entornos con recursos limitados. Sin embargo, la falta de transparencia sobre el dataset y el sobreajuste aparente (accuracy 1.0) limitan su uso en producción sin una evaluación adicional. El modelo está disponible bajo licencia Apache 2.0 y los pesos se distribuyen en formato `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 (heredado de DistilBERT-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base entrenado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parámetros. La arquitectura es un transformer encoder con 6 capas, 12 cabezas de atención y una dimensión oculta de 768. El fine-tuning se realizó sobre una tarea de clasificación binaria (comida vs. no comida) con un dataset desconocido. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 0,0001, batch size de 32, optimizador AdamW con betas (0.9, 0.999), scheduler lineal y 10 épocas. La pérdida de entrenamiento descendió de 0,4391 a 0,0009, y la pérdida de validación alcanzó 0,0007 con una precisión del 100 % en el conjunto de evaluación. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación binaria de texto: distingue si un texto está relacionado con comida o no.
- Generación de texto: no aplica, es un modelo discriminativo.
- Razonamiento: no aplica, solo clasificación.
- Código: no aplica.
- Matemáticas: no aplica.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingües: no disponible; el modelo base está entrenado en inglés, pero no se especifica el idioma del fine-tuning.
- Capacidades especiales: ninguna más allá de la clasificación de texto.

## Casos de uso

- Moderación de contenido en foros o redes sociales: el modelo puede filtrar publicaciones que mencionen comida, útil para comunidades temáticas o para evitar spam gastronómico.
- Clasificación de reseñas de restaurantes: permite separar reseñas que hablan de la comida de las que hablan del servicio o ambiente, facilitando análisis de sentimiento específico.
- Filtrado de menús en aplicaciones de delivery: puede categorizar descripciones de platos como "comida" o "no comida" para mejorar la búsqueda y recomendación.
- Análisis de tendencias alimentarias: procesar tweets o noticias para identificar menciones de comida y estudiar patrones de consumo.
- Automatización de etiquetado en bases de datos de recetas: clasificar entradas de texto como recetas o no recetas, ayudando a organizar contenido culinario.
- Detección de contenido no relacionado en chatbots de nutrición: el modelo puede actuar como un primer filtro para redirigir consultas no alimentarias a otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta una precisión del 100 % en el conjunto de evaluación, pero no se especifica el tamaño ni la composición de dicho conjunto, por lo que este dato debe interpretarse con cautela y no es comparable con benchmarks estándar como MMLU o GLUE.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 66,9 millones de parámetros. En FP32 ocupa aproximadamente 268 MB, en FP16 unos 134 MB y en int8 unos 67 MB. Por tanto, cabe en GPUs con al menos 1 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; también puede ejecutarse en CPU con razonable velocidad para inferencia por lotes pequeños.
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de gama baja y media.
- Opciones de despliegue: compatible con HuggingFace Transformers, ONNX Runtime, y puede exportarse a formatos como TorchScript o TensorRT. También se puede servir con vLLM o TGI, aunque al ser un modelo pequeño no es necesario.
- Latencia y throughput: no se dispone de datos medidos; en una GPU moderna (RTX 3090) se espera una latencia de pocos milisegundos por muestra y un throughput de cientos de muestras por segundo.

## Comparativa con modelos similares

Se han encontrado dos modelos prácticamente idénticos en HuggingFace: `Alex1-ai/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` y `DatariusAI/learn_hf_food_not_food_text_classifier-distilbert-base-uncased`. Ambos son fine-tunes del mismo modelo base y reportan resultados similares (accuracy 1.0). No se dispone de información adicional sobre diferencias en el dataset o hiperparámetros.

| Modelo | Parametros | Contexto | Licencia | Accuracy reportada |
|---|---|---|---|---|
| farzintamimi/food_no_food_classifier_distilbert_base_uncased | 66,9 M | 512 | Apache 2.0 | 1.0 |
| Alex1-ai/learn_hf_food_not_food_text_classifier-distilbert-base-uncased | 66,9 M | 512 | Apache 2.0 | 1.0 |
| DatariusAI/learn_hf_food_not_food_text_classifier-distilbert-base-uncased | 66,9 M | 512 | Apache 2.0 | 1.0 |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base DistilBERT puede heredar sesgos de los datos de preentrenamiento (género, raza, etc.), aunque al ser una tarea de clasificación de comida el impacto es menor.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- Limitaciones de contexto: la ventana de 512 tokens limita la clasificación a textos cortos; textos largos deben truncarse.
- Limitaciones de idioma: el modelo base está en inglés; no se garantiza rendimiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de fine-tuning no está documentado, lo que puede generar problemas legales si contiene datos con derechos de autor.
- Caveat para producción: la accuracy de 1.0 sugiere un posible sobreajuste al conjunto de validación; se recomienda evaluar con datos externos antes de desplegar.

## Enlaces

- [HuggingFace - farzintamimi/food_no_food_classifier_distilbert_base_uncased](https://huggingface.co/farzintamimi/food_no_food_classifier_distilbert_base_uncased)
- [Modelo similar - Alex1-ai](https://huggingface.co/Alex1-ai/learn_hf_food_not_food_text_classifier-distilbert-base-uncased)
- [Modelo similar - DatariusAI](https://huggingface.co/DatariusAI/learn_hf_food_not_food_text_classifier-distilbert-base-uncased)
- [Ficha en AIBase](https://model.aibase.com/models/details/1924735252866273280)
- [Ficha en Free2AITools](https://free2aitools.com/model/pdml/learn_hf_food_not_food_text_classifier-distilbert-base-uncased)
