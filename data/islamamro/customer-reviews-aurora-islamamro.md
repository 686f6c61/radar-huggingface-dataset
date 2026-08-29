# Islamamro/customer-reviews-aurora-islamamro

## Resumen

El modelo `Islamamro/customer-reviews-aurora-islamamro` es un clasificador de sentimientos binario (positivo/negativo) para reseñas de productos, desarrollado por el usuario `islamamro` mediante el **Aurora Research Portal**. Se trata de un fine-tuning del modelo base `distilbert-base-uncased` sobre el dataset `SetFit/SentEval-CR`, un conjunto de reseñas de productos en inglés. Con 66,9 millones de parámetros, es un modelo ligero orientado a tareas de clasificación de texto.

La relevancia de este modelo radica en su carácter demostrativo: fue entrenado sobre un subconjunto reducido de 1.400 ejemplos para validar el flujo completo de construcción, entrenamiento y publicación del portal Aurora. No está pensado para uso en producción, sino como prueba de concepto del pipeline. Su precisión en un conjunto de validación separado alcanza 0,90, lo que indica un rendimiento razonable para una tarea sencilla, aunque con limitaciones claras por el tamaño del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT soporta 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones adicionales) |
| Idiomas soportados | no disponible (el modelo base está entrenado en inglés, pero no se confirma en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en **DistilBERT**, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. DistilBERT emplea una arquitectura transformer encoder con 6 capas, 12 cabezas de atención y una dimensión oculta de 768, entrenada mediante destilación de conocimiento desde BERT-base. Para esta tarea, se realizó un fine-tuning supervisado sobre el dataset `SetFit/SentEval-CR`, que contiene reseñas de productos etiquetadas como positivas o negativas.

El entrenamiento se llevó a cabo en una NVIDIA RTX 3090, utilizando un subconjunto de 1.400 ejemplos. No se menciona el uso de técnicas como RLHF o DPO, ni se detallan hiperparámetros específicos (tasa de aprendizaje, épocas, tamaño de lote). La precisión reportada en un conjunto de validación separado es de 0,90, lo que sugiere un ajuste adecuado para la tarea, aunque el pequeño tamaño del corpus limita la generalización.

## Capacidades

- Clasificación binaria de sentimientos: distingue entre reseñas positivas y negativas.
- Procesamiento de texto en inglés (asumible por el modelo base, aunque no confirmado en la ficha).
- Inferencia rápida y ligera gracias al tamaño reducido del modelo (66M parámetros).
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- No soporta tool calling, razonamiento multi-paso, generación de código ni otras capacidades avanzadas; es un modelo puramente discriminativo.

## Casos de uso

- **Análisis de opiniones en plataformas de comercio electrónico**: el modelo puede clasificar reseñas de productos en positivas o negativas para generar métricas agregadas de satisfacción. Su ligereza permite ejecutarlo en entornos con recursos limitados, aunque se recomienda reentrenar con el dataset completo para obtener resultados fiables.
- **Monitoreo de redes sociales**: dado su tamaño reducido, puede desplegarse en servicios de streaming para clasificar menciones de una marca en tiempo real, siempre que se ajuste previamente con datos específicos del dominio.
- **Prototipado rápido de sistemas de análisis de sentimiento**: al ser un modelo de demostración, sirve como punto de partida para validar pipelines de clasificación antes de invertir en entrenamientos más costosos.
- **Educación e investigación**: útil para enseñar conceptos de fine-tuning y clasificación de texto en cursos de procesamiento de lenguaje natural, gracias a su simplicidad y a la disponibilidad del código de entrenamiento.
- **Filtrado de reseñas en aplicaciones de terceros**: puede integrarse en flujos de moderación para priorizar reseñas negativas que requieran atención del equipo de soporte.
- **Evaluación de campañas de marketing**: clasificar comentarios de clientes sobre anuncios o productos para medir la recepción pública, aunque con las limitaciones de un modelo entrenado en un subconjunto pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la precisión en un conjunto de validación separado, que alcanza **0,90**. No se proporcionan comparaciones con otros modelos ni resultados en conjuntos estándar como MMLU, GLUE o SuperGLUE.

## Requisitos de hardware

- Al tratarse de un modelo de 66 millones de parámetros, la inferencia puede ejecutarse en CPU con un consumo de memoria inferior a 1 GB (estimación razonable, aunque no se especifica en la ficha).
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente, incluyendo GPUs de gama baja como la NVIDIA GTX 1050 Ti o la RTX 3050.
- El entrenamiento se realizó en una NVIDIA RTX 3090 (24 GB VRAM), pero para inferencia no se requiere ese nivel de hardware.
- Opciones de despliegue: compatible con `transformers` (pipeline de Hugging Face), `ONNX Runtime`, `TensorFlow Serving` o `TorchServe`. También puede convertirse a formato GGUF para su uso con `llama.cpp` o `Ollama`, aunque no se proporcionan conversiones oficiales.
- La latencia estimada en CPU es del orden de milisegundos por muestra (dependiendo del hardware), y en GPU es prácticamente instantánea para lotes pequeños.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos en la información proporcionada. Sin embargo, al ser un fine-tuning de DistilBERT, puede compararse con otros modelos de clasificación de sentimientos basados en BERT:

| Modelo | Parámetros | Contexto | Precisión (SentEval-CR) | Licencia |
|---|---|---|---|---|
| `Islamamro/customer-reviews-aurora-islamamro` | 66,9 M | no disponible | 0,90 (hold-out) | Apache 2.0 |
| `distilbert-base-uncased` (base sin fine-tuning) | 66,9 M | 512 | no disponible | Apache 2.0 |
| `bert-base-uncased` (fine-tuned en tareas similares) | 110 M | 512 | no disponible | Apache 2.0 |

La comparación directa no es posible sin datos de benchmarks adicionales. El modelo presentado es una versión fine-tuned de DistilBERT, por lo que su rendimiento depende en gran medida del dataset de entrenamiento, que aquí es muy reducido.

## Limitaciones y advertencias

- **Entrenamiento con datos insuficientes**: el modelo se entrenó únicamente con 1.400 ejemplos, lo que limita su capacidad de generalización a dominios o estilos de escritura no representados en ese subconjunto.
- **Riesgo de sobreajuste**: la precisión de 0,90 en validación puede no reflejar el rendimiento en datos reales, especialmente si las reseñas difieren en vocabulario o longitud.
- **Idioma**: el modelo base está en inglés, y no se especifica si el fine-tuning incluye otros idiomas; se asume que solo funciona correctamente con texto en inglés.
- **Alucinaciones y sesgos**: al ser un clasificador, no genera texto, pero puede presentar sesgos derivados del dataset de entrenamiento (por ejemplo, dominios de productos específicos).
- **No apto para producción**: la propia model card advierte que es una prueba de concepto y recomienda reentrenar con el dataset completo para uso real.
- **Licencia**: Apache 2.0 permite uso comercial, pero con las limitaciones de rendimiento mencionadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Islamamro/customer-reviews-aurora-islamamro)
- [Dataset SetFit/SentEval-CR](https://huggingface.co/datasets/SetFit/SentEval-CR)
- [Modelo base distilbert-base-uncased](https://huggingface.co/distilbert-base-uncased)
