# ajrayman/Activity_Level_binary

## Resumen

`Activity_Level_binary` es un modelo de clasificación de texto binario desarrollado por el usuario `ajrayman` como un fine-tuning de `roberta-base` (FacebookAI). El modelo está diseñado para predecir un nivel de actividad a partir de texto, aunque la documentación no especifica el dominio exacto ni la naturaleza de las etiquetas. Se publica bajo licencia MIT y se distribuye en formato safetensors, con un total de 124.647.170 parámetros. Su relevancia radica en ser un ejemplo de ajuste fino de un transformer encoder clásico para tareas de clasificación, con un rendimiento moderado (accuracy del 62,14 % en el conjunto de evaluación). La información disponible es escasa: la model card está generada automáticamente y no detalla el dataset de entrenamiento ni los casos de uso previstos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de roberta-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (roberta-base fue entrenado con corpus en inglés, pero no se confirma) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención totalmente densa. RoBERTa-base cuenta con 12 capas, 12 cabezas de atención, una dimensión oculta de 768 y una capa de embedding de 768. El fine-tuning se realizó con una cabeza de clasificación binaria (una neurona de salida con sigmoide implícito en la pérdida). Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-5, batch de 32, optimizador Adam (betas 0.9/0.999), scheduler lineal con warmup del 6 % y 8 épocas. No se especifica el dataset de entrenamiento ni el proceso de preparación de datos. La pérdida de validación alcanzó 0.7940 en la época 4, con un AUC de 0.6684. No se mencionan técnicas avanzadas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Clasificación de texto binaria: el modelo asigna una de dos etiquetas a una secuencia de texto (por ejemplo, "activo" vs. "inactivo", aunque no se documenta el significado exacto).
- Inferencia sobre secuencias de hasta 512 tokens, heredado de RoBERTa.
- Compatible con la librería Transformers de Hugging Face y con el pipeline `text-classification`.
- No se reportan capacidades adicionales como generación de texto, tool calling, agentes, visión o audio.

## Casos de uso

- Sistemas de monitorización de actividad: si el texto describe rutinas, hábitos o comportamientos, el modelo puede clasificar el nivel de actividad (alto/bajo) en aplicaciones de salud o bienestar.
- Análisis de comentarios o encuestas: clasificar respuestas abiertas en categorías binarias de intensidad o participación.
- Moderación de contenido: distinguir entre contenido que indica actividad relevante o irrelevante en foros o redes sociales.
- Filtrado de logs o registros textuales: identificar entradas que corresponden a eventos activos vs. pasivos en sistemas de monitoreo.
- Investigación académica: como punto de partida para experimentos de fine-tuning de RoBERTa en tareas de clasificación binaria.
- Prototipos rápidos: dado su tamaño moderado, puede desplegarse en entornos con recursos limitados para validar hipótesis antes de usar modelos más grandes.

Nota: al no conocerse el dominio específico de entrenamiento, estos casos son hipotéticos y deben validarse con datos reales.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de evaluación (no se especifica el tamaño ni la composición):

| Métrica | Valor |
|---|---|
| Pérdida | 0.7940 |
| Accuracy | 0.6214 |
| Precision | 0.6390 |
| Recall | 0.5561 |
| F1 | 0.5947 |
| AUC | 0.6684 |

No se han publicado comparativas con otros modelos. La tabla de entrenamiento muestra una mejora de accuracy entre la época 1 (0.5841) y la época 4 (0.6214), con una pérdida de validación que aumenta en la última época, lo que sugiere posible sobreajuste a partir de la época 2.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP32, RoBERTa-base requiere aproximadamente 500 MB de VRAM (solo pesos) más overhead de activaciones. Con cuantización a 8 bits, puede reducirse a ~250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPU). En GPU de gama alta (A100, H100) es trivial.
- Cabe en GPUs de consumo: sí, incluso en tarjetas con 4 GB de VRAM.
- Opciones de despliegue: compatible con Hugging Face Inference Endpoints, vLLM (aunque está pensado para generación, puede usarse para clasificación), llama.cpp no es adecuado (no es un modelo GGUF), pero se puede exportar a ONNX o usar con Transformers + PyTorch.
- Latencia: en CPU moderna, una inferencia tarda ~10-50 ms; en GPU, ~1-5 ms. Throughput estimado de cientos a miles de peticiones por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (tarea similar) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Activity_Level_binary` | 124.6M | 512 | 0.6214 (eval propia) | MIT | Hugging Face |
| `distilbert-base-uncased` (fine-tune) | 66M | 512 | variable según tarea | Apache 2.0 | Hugging Face |
| `bert-base-uncased` (fine-tune) | 110M | 512 | variable según tarea | Apache 2.0 | Hugging Face |

No se dispone de comparativas directas en la misma tarea porque el dataset no es público. La accuracy del modelo es inferior a la típica en tareas de clasificación bien definidas (suele superar 0.80), lo que indica que el dataset o la tarea pueden ser ambiguos o difíciles.

## Limitaciones y advertencias

- Accuracy baja (0.62) y F1 moderado (0.59): el modelo no es fiable para producción sin una evaluación rigurosa en el dominio objetivo.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar sesgos, cobertura de idiomas ni representatividad.
- Posible sobreajuste: la pérdida de validación aumenta en la época 4, lo que sugiere que detener antes podría mejorar la generalización.
- Sin documentación de casos de uso ni limitaciones: la model card está incompleta.
- Idioma: roberta-base está entrenado principalmente en inglés; si el texto de entrada es en otro idioma, el rendimiento puede degradarse.
- Licencia MIT permite uso comercial, pero la ausencia de datos de entrenamiento dificulta la trazabilidad de posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Activity_Level_binary
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Endpoint de despliegue (sugerido por Hugging Face): https://endpoints.huggingface.co/new?repository=ajrayman%2Fauth_scale_binary (aunque corresponde a otro modelo, el patrón es similar)
