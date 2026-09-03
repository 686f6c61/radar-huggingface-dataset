# ajrayman/auth_scale_binary

## Resumen

El modelo `ajrayman/auth_scale_binary` es un ajuste fino (fine-tuning) de `microsoft/deberta-v3-base` para tareas de clasificación de texto binaria. Fue desarrollado por el usuario ajrayman y publicado en Hugging Face en octubre de 2024. Aunque el nombre sugiere una posible aplicación en autenticación o análisis de autoría, la model card no especifica el dominio concreto ni el dataset utilizado. El modelo cuenta con 184.423.682 parámetros, hereda la arquitectura encoder de DeBERTa-v3-base y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones. Su relevancia radica en ser un clasificador compacto y ligero, adecuado para tareas de clasificación binaria de texto donde se requiera un modelo pequeño y desplegable en entornos con recursos limitados. Sin embargo, las métricas de evaluación (accuracy del 70,11 %) indican un rendimiento moderado, por lo que su uso en producción debe evaluarse cuidadosamente según la tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (encoder transformer) |
| Parámetros totales | 184.423.682 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `microsoft/deberta-v3-base`, un transformer encoder con atención desenredada (disentangled attention) y enmascaramiento reemplazado (replaced token detection). La capa de clasificación se añade sobre la representación de la secuencia para producir una salida binaria. El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 2e-5, tamaño de lote de 32, optimizador Adam (betas 0.9 y 0.999), scheduler lineal con warmup del 6 % y 8 épocas. No se especifica el dataset de entrenamiento ni el de evaluación, ni se mencionan técnicas adicionales como RLHF o DPO. La model card indica que se usó el framework Transformers 4.44.1 y PyTorch 1.11.0.

## Capacidades

- Clasificación de texto binaria: el modelo devuelve una etiqueta binaria (por ejemplo, positivo/negativo, verdadero/falso) a partir de una secuencia de texto.
- Hereda las capacidades de representación de DeBERTa-v3-base, que incluyen comprensión contextual profunda y buen rendimiento en tareas de lenguaje natural.
- No se documentan capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifica si el modelo es multilingüe; DeBERTa-v3-base está entrenado principalmente con datos en inglés, pero no se confirma en la información disponible.

## Casos de uso

- Moderación de contenido: el modelo puede clasificar comentarios o publicaciones como aceptables o inaceptables (por ejemplo, toxicidad binaria). Su tamaño reducido permite integrarlo en pipelines de moderación en tiempo real con baja latencia.
- Detección de spam: clasificar correos electrónicos o mensajes como spam o no spam. Al ser un clasificador binario, es adecuado para este tipo de filtrado, aunque su accuracy del 70 % puede requerir umbrales ajustados.
- Análisis de sentimiento binario: determinar si una reseña o comentario es positivo o negativo. Útil para monitorizar opiniones en redes sociales o plataformas de comercio electrónico.
- Clasificación de documentos: asignar documentos a una de dos categorías (por ejemplo, relevante/irrelevante, confidencial/público). Su licencia MIT facilita su integración en sistemas internos.
- Filtrado de consultas de soporte: en un sistema de atención al cliente, clasificar las consultas como urgentes o no urgentes para priorizar la cola de tickets.
- Detección de fraude en texto: clasificar mensajes o transacciones descritas en texto como fraudulentas o legítimas, siempre que se disponga de un dataset etiquetado adecuado.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el conjunto de evaluación (no se especifica el dataset):

| Métrica | Valor |
|---|---|
| Loss | 0,7318 |
| Accuracy | 0,7011 |
| Precision | 0,7102 |
| Recall | 0,6783 |
| F1 | 0,6939 |
| AUC | 0,7532 |

No se han publicado comparaciones con otros modelos en la información disponible. El rendimiento es moderado; la precisión supera ligeramente al recall, lo que indica un sesgo hacia la clase negativa en la clasificación.

## Requisitos de hardware

- El modelo tiene 184 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 740 MB y en FP16 unos 370 MB. Esto permite su ejecución en GPUs de consumo como la NVIDIA GTX 1060 (6 GB) o superiores.
- Para inferencia en CPU, es viable con 8-16 GB de RAM, aunque la latencia será mayor.
- No se proporcionan datos de latencia ni throughput específicos.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con la librería `transformers` de Python.
- Dado su tamaño, es adecuado para entornos con recursos limitados o para despliegue en el edge.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación binaria fine-tuned sobre DeBERTa-v3-base). El modelo base `microsoft/deberta-v3-base` tiene 184 millones de parámetros y es un punto de referencia común, pero no se han encontrado otros ajustes finos con los que comparar directamente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni limitaciones específicas. Al ser un ajuste fino de un modelo preentrenado, puede heredar sesgos presentes en los datos de preentrenamiento de DeBERTa-v3-base.
- El dataset de entrenamiento y evaluación no se especifica, lo que impide evaluar la generalización del modelo a otros dominios y dificulta la reproducibilidad.
- La accuracy del 70 % y el F1 de 0,69 indican un rendimiento moderado; en tareas críticas puede producir errores de clasificación significativos.
- No se indica la longitud máxima de contexto soportada; DeBERTa-v3-base tiene un límite de 512 tokens, pero no se confirma en la ficha.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los datos utilizados para el fine-tuning no infrinjan derechos de terceros.
- No se han publicado resultados de benchmarks externos ni evaluaciones independientes.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ajrayman/auth_scale_binary)
- [Despliegue con Inference Endpoints](https://endpoints.huggingface.co/new?repository=ajrayman%2Fauth_scale_binary)
- [Modelo base: microsoft/deberta-v3-base](https://huggingface.co/microsoft/deberta-v3-base)
