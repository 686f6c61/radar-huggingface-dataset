# LaPa47/distilbert-sentiment-demo

## Resumen

`distilbert-sentiment-demo` es un modelo de clasificación de texto desarrollado por LaPa47 mediante fine-tuning de `distilbert-base-uncased`. Se trata de una versión ligera del transformer BERT, orientada al análisis de sentimiento en inglés, concretamente a determinar si un texto breve tiene connotación positiva o negativa. Con 66.955.010 parámetros, es un modelo compacto que puede ejecutarse en CPU y en GPUs de baja potencia, lo que lo convierte en una opción práctica para prototipos y entornos con recursos limitados.

El modelo está liberado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas. Sin embargo, la documentación es incompleta: la model card indica que fue generado automáticamente por el Trainer de Hugging Face y que el dataset de entrenamiento es desconocido. El repositorio contiene pesos en formatos Safetensors y ONNX, e incluye etiquetas de compatibilidad con `text-embeddings-inference`.

La arquitectura subyacente es un encoder transformer con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, con una longitud de contexto de 512 tokens, heredada del modelo base. Su relevancia actual radica en su sencillez y en que sirve como ejemplo didáctico de fine-tuning para tareas de análisis de sentimiento, aunque no está diseñado para sistemas de producción exigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base uncased, 6 capas, 768 dimensiones, 12 cabezas de atención) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredado de `distilbert-base-uncased`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base es inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se construye sobre `distilbert-base-uncased`, implementación del paper "DistilBERT, a distilled version of BERT" (arXiv:1910.09700). DistilBERT reduce el número de capas de 12 a 6, manteniendo las dimensiones ocultas en 768 y 12 cabezas de atención. Esto resulta en un modelo aproximadamente un 40 % más pequeño que BERT-base y con una velocidad de inferencia significativamente mayor, aunque sus capacidades de razonamiento son ligeramente inferiores.

El fine-tuning se realizó mediante clasificación supervisada clásica. Según la model card, el dataset de entrenamiento es desconocido. Los hiperparámetros reportados incluyen: tasa de aprendizaje 2e-05, batch size 16, seed 42, optimizer AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 2 épocas de entrenamiento. El proceso no incorpora técnicas como RLHF ni DPO. El entrenamiento se llevó a cabo con Transformers 5.16.1, PyTorch 2.11.0 y Datasets 5.0.1.

## Capacidades

- Clasificación de sentimiento en inglés: según la demostración pública asociada, el modelo asigna etiquetas "positivo" o "negativo" a textos cortos en inglés.
- Compatible con el pipeline `text-classification` de Transformers y con `text-embeddings-inference`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; al derivar de un modelo base uncased entrenado en inglés, no se espera buen rendimiento en otros idiomas.
- Otras capacidades: no incluye visión, audio ni generación de texto.

## Casos de uso

- Análisis de reseñas de producto: el modelo puede clasificar opiniones en positivas o negativas antes de alimentar un sistema de recomendación. Su pequeño tamaño permite ejecutarlo en CPU, lo que abarata el despliegue en aplicaciones de e-commerce.
- Monitorización de redes sociales: permite filtrar comentarios y publicaciones en inglés según su tono. La ventana de 512 tokens es suficiente para la mayoría de los tweets y comentarios cortos.
- Triaje de tickets de atención al cliente: se puede integrar en un pipeline para identificar automáticamente quejas urgentes, enviando los tickets negativos a un agente humano. La baja latencia del modelo facilita la clasificación en tiempo real.
- Clasificación de encuestas y formularios: en estudios de satisfacción, las respuestas abiertas cortas pueden etiquetarse como positivas o negativas, acelerando el análisis de resultados.
- Prototipado rápido de sistemas NLP: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para probar arquitecturas de análisis de sentimiento sin necesidad de infraestructura potente.
- Integración en aplicaciones edge o móviles: el tamaño del repositorio (0,8 GB) puede optimizarse con cuantización o mediante el formato ONNX para ejecutarse en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Según la model card, el autor declara los siguientes resultados en el conjunto de evaluación (dataset desconocido):

| Metrica | Valor |
|---|---|
| Pérdida | 0.4256 |
| Exactitud | 0.8415 |

Durante el entrenamiento se alcanzó una exactitud de validación de 0.8574 en la segunda época (según la tabla de resultados del autor). No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con modelos similares en la información disponible. El `model-index` de Hugging Face está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32, ya que el modelo ocupa aproximadamente 268 MB en ese formato. En FP16 se reduce a unos 134 MB; con cuantización de 8 bits, en torno a 67 MB.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM, incluyendo modelos antiguos como GTX 1050 o RTX 20xx. También puede ejecutarse en CPU.
- Si cabe en GPU de consumo: sí, e incluso es apto para procesadores de gama baja.
- Opciones de despliegue: `transformers` (pipeline), ONNX Runtime, `text-embeddings-inference` (según las etiquetas del repositorio). También puede servirse mediante FastAPI o Flask.
- Latencia y throughput estimados: no hay mediciones oficiales. Por su tamaño, la latencia en GPU es del orden de milisegundos para textos cortos, y el throughput puede ser alto en modo batch. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos medidos.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos en la información proporcionada. La arquitectura es la misma que la del modelo base `distilbert-base-uncased` y de otros fine-tunes de DistilBERT para análisis de sentimiento. A continuación se presentan referencias estructurales sin datos de rendimiento verificados:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LaPa47/distilbert-sentiment-demo | 66.955.010 | 512 tokens | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | ~66.955.010 | 512 tokens | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~66.955.010 | 512 tokens | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Sesgos: al heredar los pesos de `distilbert-base-uncased`, el modelo puede reflejar los sesgos presentes en los corpus de entrenamiento originales (BookCorpus y Wikipedia en inglés).
- Alucinación: el riesgo es bajo, al tratarse de una tarea de clasificación, pero puede clasificar incorrectamente textos con sarcasmo, negaciones o ambigüedad semántica.
- Limitaciones de contexto: la longitud máxima de entrada es de 512 tokens, lo que impide procesar documentos largos.
- Idioma: no se especifican idiomas soportados; el modelo base fue entrenado en inglés, por lo que su rendimiento en otros idiomas es probablemente deficiente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo es una demo sin mantenimiento y con documentación incompleta.
- Limitaciones para producción: no hay garantías de rendimiento ni benchmarks, no se conoce el dataset de entrenamiento y no se ha realizado una evaluación de sesgos. No se recomienda su uso en producción sin una validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/LaPa47/distilbert-sentiment-demo
- Space de demostración: https://huggingface.co/spaces/Drocho/distilbert-sentiment-demo
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.09700
