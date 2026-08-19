# akaruineko/ftan-2.0

## Resumen

ftan-2.0 es un modelo de clasificación de texto desarrollado por akaruineko (Gueorgui Kulikov) para detectar contenido ofensivo en inglés. Se trata de un fine-tuning de DistilBERT base uncased, un transformer encoder destilado de BERT, que clasifica cada entrada en una de dos etiquetas: `clean` (no ofensivo) u `offensive` (ofensivo). El modelo es la continuación del proyecto `bad-good-classifier-ru_en` y se entrenó sobre el dataset `akaruineko/offensively-neutral`, que contiene aproximadamente 1,3 millones de muestras.

La relevancia de este modelo radica en su simplicidad y eficiencia: con unos 67 millones de parámetros, es lo suficientemente ligero para desplegarse en entornos con recursos limitados, a la vez que ofrece una solución práctica para tareas de moderación y filtrado de texto. Al estar publicado bajo licencia MIT, puede integrarse sin restricciones en proyectos comerciales. El modelo está disponible en Hugging Face con formato safetensors y es compatible con la librería transformers y con text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer destilado, 6 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (DistilBERT base usa 512 tokens, pero no se especifica en la documentación del modelo) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT base uncased, una versión destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parámetros. DistilBERT utiliza una arquitectura transformer encoder con 6 capas, 12 cabezas de atención y 768 dimensiones ocultas, entrenada mediante destilación de conocimiento a partir de BERT base. Para este fine-tuning, se añadió una cabeza de clasificación binaria sobre la representación de la secuencia.

El entrenamiento se realizó sobre el dataset `akaruineko/offensively-neutral`, que contiene alrededor de 1,3 millones de muestras etiquetadas como ofensivas o limpias. Según la model card, se evaluaron múltiples épocas y se seleccionó el mejor checkpoint en función del rendimiento en validación, en lugar de usar el último checkpoint del entrenamiento. No se menciona el uso de técnicas de alineación como RLHF o DPO, ni datos sobre el número exacto de épocas, tasa de aprendizaje u otros hiperparámetros.

## Capacidades

- Clasificación binaria de texto: distingue entre contenido ofensivo y no ofensivo.
- Detección de lenguaje malsonante y expresiones agresivas en inglés.
- Funciona como clasificador de secuencia (sequence classification) con la librería transformers.
- Compatible con el pipeline `text-classification` de transformers para una integración rápida.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.
- No dispone de modo de razonamiento extendido ni de memoria de conversación; procesa cada entrada de forma independiente.
- Limitado al inglés; no hay indicios de capacidades multilingües.

## Casos de uso

- Moderación de contenido en foros y redes sociales: el modelo puede integrarse en un pipeline que filtre mensajes ofensivos antes de su publicación, reduciendo la carga de moderación manual.
- Filtrado de mensajes en chats y sistemas de mensajería: permite bloquear o marcar automáticamente mensajes agresivos en tiempo real, gracias a su baja latencia en CPU o GPU.
- Preprocesamiento de datasets: se puede utilizar para limpiar corpus de texto eliminando muestras ofensivas antes de entrenar otros modelos, mejorando la calidad de los datos.
- Sistemas de atención al cliente: ayuda a detectar interacciones abusivas de usuarios y derivarlas a un supervisor humano.
- Experimentación académica: sirve como modelo de referencia para investigar técnicas de clasificación de toxicidad o comparar enfoques de fine-tuning.
- Pipelines de moderación automatizada: puede combinarse con reglas heurísticas o modelos adicionales para construir un sistema de moderación en capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. La model card incluye algunos ejemplos ilustrativos de inferencia, pero el propio autor indica que no deben interpretarse como una evaluación rigurosa. No se dispone de datos comparativos con otros modelos en tareas estandarizadas como MMLU, HumanEval o GLUE.

## Requisitos de hardware

- El modelo tiene aproximadamente 67 millones de parámetros, lo que equivale a unos 268 MB en precisión fp32 y unos 134 MB en fp16.
- Inferencia en CPU: viable para procesamiento por lotes o en tiempo real con baja carga; la latencia típica por muestra en CPU moderna es del orden de decenas de milisegundos.
- Inferencia en GPU: cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas tarjetas consumer como GTX 1050 Ti, RTX 2060 o superiores.
- Se puede desplegar con la librería transformers (pipeline), con ONNX Runtime para optimización en CPU, o mediante servidores de inferencia como text-embeddings-inference (el modelo es compatible con endpoints de Hugging Face).
- No se requieren GPUs de alta gama; una RTX 3060 o similar permite throughput de cientos de inferencias por segundo.

## Comparativa con modelos similares

No se dispone de una comparativa formal con otros modelos en la información proporcionada. Existen alternativas conocidas en el ámbito de la detección de toxicidad, como Detoxify (basado en BERT) o los modelos de Hugging Face para hate speech, pero no se han encontrado datos de rendimiento comparables para ftan-2.0 en las fuentes disponibles. Se recomienda evaluar el modelo en el caso de uso concreto antes de decidir.

## Limitaciones y advertencias

- El modelo no es un sistema de moderación perfecto; la ofensividad depende en gran medida del contexto, la intención, las citas, el sarcasmo y el lenguaje reapropiado, por lo que puede producir predicciones incorrectas en textos ambiguos.
- No tiene acceso al historial de conversación; procesa cada entrada de forma aislada, lo que limita su capacidad para interpretar referencias contextuales.
- Puede clasificar erróneamente frases que mencionan palabras ofensivas (p. ej., "la palabra 'estúpido' es ofensiva") como ofensivas, como se muestra en los ejemplos de la model card.
- Solo está entrenado para inglés; no es aplicable a otros idiomas sin un fine-tuning adicional.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se han publicado métricas de evaluación formales, por lo que se desconoce su precisión, recall o F1 en conjuntos de datos estandarizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akaruineko/ftan-2.0
- Dataset de entrenamiento: https://huggingface.co/datasets/akaruineko/offensively-neutral
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Perfil del autor en Hugging Face: https://huggingface.co/akaruineko/models
