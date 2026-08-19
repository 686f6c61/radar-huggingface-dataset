# Purv/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

El modelo `Purv/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario que distingue entre textos relacionados con comida y textos que no lo están. Se trata de un ajuste fino (fine-tuning) del modelo base `distilbert/distilbert-base-uncased`, desarrollado por el usuario Purv en la plataforma Hugging Face. El modelo está diseñado para tareas de clasificación de texto simple, probablemente como un ejemplo educativo o de demostración dentro del ecosistema de Transformers.

Con 66,9 millones de parámetros, el modelo hereda la arquitectura de DistilBERT, una versión destilada de BERT que reduce el tamaño y la latencia manteniendo un rendimiento razonable. El ajuste se realizó sobre un conjunto de datos no especificado, con un pipeline de `text-classification`. Aunque la model card reporta una precisión del 100 % en el conjunto de evaluación, este resultado debe interpretarse con cautela, ya que el dataset de entrenamiento es desconocido y el número de pasos es muy bajo (70 pasos en total), lo que sugiere un posible sobreajuste.

El modelo es relevante para desarrolladores que necesitan un clasificador ligero y rápido para tareas de filtrado de contenido relacionado con alimentos, aunque su utilidad práctica en producción es limitada debido a la falta de documentación y a la ausencia de benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `distilbert-base-uncased`, un transformer encoder de 6 capas, 12 cabezas de atención y una dimensión oculta de 768, destilado de BERT-base. La arquitectura original de DistilBERT reduce el número de capas a la mitad y elimina las embeddings de tipo de token, lo que lo hace más ligero y rápido que BERT manteniendo aproximadamente el 97 % de su rendimiento. El clasificador añade una cabeza de clasificación binaria sobre la salida del token `[CLS]`.

El entrenamiento se realizó con el `Trainer` de Hugging Face, con los siguientes hiperparámetros: learning rate de 0,0001, batch size de 32, optimizador AdamW (fused) con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal y 10 épocas. El dataset de entrenamiento no está documentado, y el proceso generó una pérdida de validación de 0,0005 y una precisión de 1,0 al final del entrenamiento. No se menciona el uso de técnicas como RLHF o DPO, ni se detalla la composición del corpus.

## Capacidades

- Clasificación binaria de textos: distingue entre contenido relacionado con comida y contenido no relacionado.
- Generación de embeddings contextuales gracias a la arquitectura DistilBERT.
- Inferencia rápida y ligera, adecuada para entornos con recursos limitados.
- Integración sencilla con la librería `transformers` mediante el pipeline `text-classification`.
- Compatible con `endpoints_compatible` según las etiquetas, lo que facilita su despliegue en plataformas de Hugging Face.
- No se documentan capacidades de tool calling, agentes, visión, audio o multilingüismo.

## Casos de uso

- Filtrado de contenido en redes sociales: el modelo puede clasificar publicaciones o comentarios como relacionados con comida o no, útil para moderar comunidades gastronómicas o detectar spam alimentario.
- Clasificación de recetas: en una aplicación de recetas, se puede usar para etiquetar automáticamente si un texto describe una receta o no, ayudando a organizar el contenido.
- Análisis de reseñas de restaurantes: permite separar reseñas que mencionan comida de las que hablan de otros aspectos (servicio, ambiente), facilitando el análisis de sentimiento específico.
- Chatbot de recomendación de alimentos: el modelo puede filtrar mensajes de usuarios que piden sugerencias de comida frente a otras consultas, redirigiendo la conversación al módulo adecuado.
- Clasificación de documentos en un corpus culinario: en una base de datos de artículos, se puede usar para etiquetar automáticamente los documentos relacionados con alimentación.
- Prototipado educativo: sirve como ejemplo de fine-tuning de DistilBERT para tareas de clasificación de texto, útil para aprender el flujo de entrenamiento con Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de Hugging Face está vacío (`results: []`). La model card reporta una precisión de 1,0 y una pérdida de 0,0005 en el conjunto de evaluación, pero al no conocerse el dataset ni el método de evaluación, estos valores no pueden considerarse comparables con benchmarks estándar como MMLU, GLUE o SuperGLUE.

## Requisitos de hardware

- Al tratarse de un modelo de 67 millones de parámetros, el tamaño del repositorio es de 0,3 GB, lo que implica que los pesos en FP32 ocupan aproximadamente 268 MB.
- Es viable la inferencia en CPU con memoria RAM estándar (4 GB o más), aunque la latencia será mayor que en GPU.
- Cabe en GPUs de consumo como una NVIDIA GTX 1060 de 6 GB, RTX 3060 o superiores, con un uso de VRAM inferior a 1 GB.
- No se requieren GPUs de datacenter como A100 o H100.
- Opciones de despliegue: se puede usar con la librería `transformers` en Python, o mediante herramientas como Hugging Face Inference Endpoints. No se mencionan formatos GGUF ni compatibilidad con llama.cpp o vLLM.
- La latencia estimada para una sola inferencia en CPU moderna es de decenas de milisegundos; en GPU, de unos pocos milisegundos. Estos valores son orientativos y dependen del hardware y del tamaño del batch.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo es un fine-tune de DistilBERT, por lo que podría compararse con otros clasificadores basados en DistilBERT o BERT, pero no se tienen datos de rendimiento ni de otros modelos específicos. Se indica "no disponible".

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, lo que impide evaluar la generalización del modelo a dominios fuera del conjunto de entrenamiento.
- La precisión del 100 % en validación es sospechosa y sugiere un fuerte sobreajuste, especialmente con solo 70 pasos de entrenamiento y un batch pequeño.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no especificados, puede reflejar sesgos presentes en el corpus original.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede clasificar incorrectamente entradas fuera de distribución.
- La licencia Apache-2.0 permite uso comercial, pero la falta de documentación sobre el dataset podría plantear problemas legales si el corpus contiene datos con derechos de autor.
- No se garantiza soporte multilingüe; el modelo base está entrenado principalmente en inglés, aunque la etiqueta de idioma no está disponible.
- Para producción, se recomienda validar el modelo con un conjunto de datos propio y considerar un fine-tuning adicional con datos etiquetados de calidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Purv/learn_hf_food_not_food_text_classifier-distilbert-base-uncased)
- [Modelo base DistilBERT](https://huggingface.co/distilbert/distilbert-base-uncased)
