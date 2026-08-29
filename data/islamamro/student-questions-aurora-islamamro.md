# Islamamro/student-questions-aurora-islamamro

## Resumen

El modelo `Islamamro/student-questions-aurora-islamamro` es un clasificador de texto basado en `distilbert-base-uncased`, fine-tuneado sobre el dataset `SetFit/student-question-categories` para categorizar preguntas de estudiantes en cuatro clases temáticas. Ha sido desarrollado por el usuario Islamamro a través del Aurora Research Portal, un flujo de construcción, entrenamiento y publicación automatizado, y se presenta como una demostración del pipeline más que como un modelo listo para producción.

Con 66,9 millones de parámetros y un peso total de 0,3 GB en formato safetensors, el modelo ofrece una precisión del 0,90 en un conjunto de validación retenido. Su relevancia radica en su simplicidad y bajo coste computacional, lo que lo hace adecuado para tareas de clasificación de texto en entornos educativos, aunque su entrenamiento se limitó a un subconjunto de 1.400 ejemplos, por lo que su rendimiento en datos reales puede ser limitado.

La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas, lo que facilita su integración en proyectos educativos o de análisis de texto. No se dispone de información sobre la longitud de contexto, idiomas soportados o cuantizaciones, más allá de lo que hereda del modelo base DistilBERT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de DistilBERT, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. La arquitectura es un transformer encoder con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, diseñado para tareas de comprensión del lenguaje. El fine-tuning se realizó sobre el dataset `SetFit/student-question-categories`, que contiene preguntas de estudiantes etiquetadas en cuatro categorías (probablemente asignaturas o tipos de pregunta, aunque no se detalla). El entrenamiento se llevó a cabo en una NVIDIA RTX 3090, con un subconjunto de 1.400 ejemplos, y se evaluó con una precisión del 0,90 en un conjunto retenido. No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa; el proceso es un fine-tuning estándar de clasificación.

## Capacidades

- Clasificación de texto en 4 categorías predefinidas de preguntas de estudiantes.
- Inferencia rápida y ligera gracias al tamaño reducido de DistilBERT.
- Integración sencilla con la API `pipeline` de HuggingFace Transformers.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües no confirmadas; el modelo base es uncased en inglés, por lo que se espera un rendimiento óptimo en ese idioma.

## Casos de uso

- Clasificación automática de preguntas en foros educativos: el modelo puede etiquetar consultas de estudiantes en categorías temáticas, facilitando la moderación y el enrutamiento a tutores especializados. Su baja latencia permite procesar grandes volúmenes de mensajes en tiempo real.
- Análisis de encuestas o formularios abiertos: en instituciones académicas, se puede usar para agrupar respuestas abiertas de estudiantes por tema, ayudando a identificar áreas de mejora en los cursos.
- Filtrado de preguntas en plataformas de tutoría online: al clasificar las consultas antes de asignarlas a un tutor, se reduce el tiempo de respuesta y se mejora la precisión del emparejamiento.
- Generación de métricas educativas: los administradores pueden obtener estadísticas sobre los tipos de preguntas más frecuentes por asignatura o período, usando el modelo como componente de un pipeline de análisis.
- Prototipado de asistentes virtuales académicos: aunque no es un chatbot, puede servir como módulo de intención en un sistema más grande que derive la categoría de la pregunta del usuario.
- Demostración de pipelines MLOps: el modelo es un ejemplo práctico de cómo construir, entrenar y publicar un clasificador con herramientas como Aurora Research Portal, útil para equipos que evalúan flujos de trabajo automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la precisión en un conjunto de validación retenido:

| Metrica | Valor |
|---|---|
| Precisión (held-out) | 0,90 |

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU, GLUE o SuperGLUE.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 66,9M parámetros, la inferencia en FP32 requiere aproximadamente 268 MB de memoria, y en FP16 unos 134 MB. Cabe en cualquier GPU moderna, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA RTX 3090 (usada para el entrenamiento) es más que adecuada para inferencia. También puede ejecutarse en CPU con razonable velocidad.
- Compatibilidad con consumer GPU: sí, funciona en GPUs de gama baja como GTX 1650 o incluso en Apple Silicon.
- Opciones de despliegue: compatible con HuggingFace Transformers, ONNX Runtime, TensorFlow Lite y cualquier framework que soporte safetensors. Se puede servir con FastAPI, TorchServe o simplemente mediante la API de `pipeline`.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por su tamaño se espera una latencia inferior a 10 ms por muestra en GPU y alrededor de 50-100 ms en CPU.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de clasificación de texto en la información proporcionada. Como referencia, el modelo base `distilbert-base-uncased` tiene 66M parámetros y alcanza una precisión media de 79,5% en GLUE, pero no se han evaluado ambos en el mismo dataset. Alternativas como `bert-base-uncased` (110M parámetros) o `roberta-base` (125M) podrían ofrecer mayor precisión a costa de más recursos, pero no hay datos de comparación con este fine-tune específico.

## Limitaciones y advertencias

- Entrenado en un subconjunto de solo 1.400 ejemplos, lo que puede provocar sobreajuste y baja generalización en datos reales.
- No es un modelo de producción; el propio autor lo describe como una prueba del pipeline Aurora, no como una solución lista para uso comercial.
- La precisión del 0,90 se obtuvo en un conjunto retenido del mismo dataset, por lo que puede no reflejar el rendimiento en datos externos.
- No se especifican las categorías exactas ni la distribución de clases, lo que dificulta evaluar posibles sesgos.
- Al estar basado en DistilBERT uncased, el rendimiento en idiomas distintos del inglés será limitado o nulo.
- Riesgo de alucinación no aplica directamente, pero sí de clasificaciones erróneas en preguntas ambiguas o fuera del dominio de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantías de exactitud ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Islamamro/student-questions-aurora-islamamro
- Dataset de entrenamiento: https://huggingface.co/datasets/SetFit/student-question-categories
- Portal Aurora Research (mencionado en la model card, sin URL directa): no disponible
