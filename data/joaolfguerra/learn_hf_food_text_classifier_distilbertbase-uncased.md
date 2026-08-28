# joaolfguerra/learn_hf_food_text_classifier_distilbertbase-uncased

## Resumen

Este modelo es un clasificador de texto binario que determina si un texto está relacionado con comida o no. Es un fine-tune de DistilBERT-base-uncased, un transformer encoder destilado de BERT, desarrollado por joaolfguerra. Con 66,9 millones de parámetros, está diseñado para tareas de clasificación de texto rápidas y eficientes. La model card no especifica el dataset de entrenamiento, pero reporta una accuracy del 100% en el conjunto de validación, lo que sugiere un posible sobreajuste o un dataset muy sencillo. Es relevante para aplicaciones que requieren clasificación de contenido alimentario, como moderación de reseñas o filtrado de contenido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer, destilado de BERT) |
| Parametros totales | 66.955.010 |
| Longitud de contexto | no disponible (el modelo base DistilBERT soporta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo uncased, probablemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT-base-uncased, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. La arquitectura es un transformer encoder con atención multi-cabeza, sin capas de decodificación. El fine-tune se realizó con el Trainer de Hugging Face, usando un dataset desconocido. Los hiperparámetros incluyen learning rate de 0.0001, batch size de 32, optimizador AdamW, scheduler lineal y 10 épocas. La pérdida de entrenamiento descendió de 0.3357 a 0.0006, y la pérdida de validación a 0.0005, con accuracy perfecta desde la primera época, lo que sugiere un dataset pequeño o fácil de clasificar.

## Capacidades

- Clasificación binaria de texto: determina si un texto está relacionado con comida o no.
- Procesamiento de texto en inglés (modelo uncased, aunque no se especifica).
- Inferencia rápida y ligera gracias a la arquitectura destilada.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Moderación de contenido en plataformas de recetas: clasificar comentarios o descripciones para filtrar contenido no relacionado con comida.
- Análisis de reseñas de restaurantes: identificar si una reseña menciona aspectos de comida o no, para priorizar análisis.
- Clasificación de publicaciones en redes sociales: detectar si un post habla de alimentos para segmentar campañas de marketing.
- Filtrado de noticias o artículos: separar contenido gastronómico de otros temas en agregadores.
- Automatización de etiquetado en bases de datos de recetas: asignar etiquetas "comida" o "no comida" a textos.
- Asistente de búsqueda: mejorar la relevancia de resultados al clasificar consultas relacionadas con comida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta una accuracy del 100% en el conjunto de validación, pero no se especifica el tamaño ni la composición de dicho conjunto, por lo que este valor debe interpretarse con cautela.

## Requisitos de hardware

- Inferencia en CPU: viable, ya que el modelo tiene solo 66,9M de parámetros; puede ejecutarse en CPU con baja latencia.
- VRAM estimada: para inferencia en float32, ~268 MB; con cuantización a int8, ~67 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1050 Ti o superior, o incluso integradas.
- Opciones de despliegue: transformers (Python), ONNX Runtime, TensorFlow Lite, o servidores de inferencia como Hugging Face Inference Endpoints.
- Latencia: no disponible, pero al ser un modelo pequeño, se espera latencia de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables. Existen otros fine-tunes de DistilBERT para clasificación de comida/no comida (por ejemplo, imGaurav23/learn_hf_food_not_food_text_classifier-distilbert-base-uncased), pero no se han publicado especificaciones detalladas. El modelo base DistilBERT tiene 66M parámetros y contexto de 512, pero no está especializado en clasificación de comida.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se sabe qué datos se usaron, lo que puede introducir sesgos no documentados.
- Accuracy del 100% en validación sugiere posible sobreajuste o dataset muy simple; el rendimiento en datos reales puede ser inferior.
- Limitado a clasificación binaria; no es adecuado para tareas de generación o razonamiento complejo.
- Contexto limitado a 512 tokens (heredado de DistilBERT), por lo que textos largos deben truncarse.
- Idioma: al ser uncased, probablemente solo inglés; no se garantiza soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joaolfguerra/learn_hf_food_text_classifier_distilbertbase-uncased
- Modelo similar de imGaurav23: https://huggingface.co/imGaurav23/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Repositorio de ejemplo en GitHub: https://github.com/ironspiritjeff/Food-or-Not-Food-Text-Classifier/blob/main/README.md
- Entrada en AIBase: https://model.aibase.com/en/models/details/1924735252866273280
