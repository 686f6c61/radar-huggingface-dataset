# Rachiifal/distilbert-guest-misoginia

## Resumen

`distilbert-guest-misoginia` es un modelo de clasificación de texto en inglés obtenido mediante fine-tuning de `distilbert-base-uncased`, publicado por el usuario Rachiifal en Hugging Face. El nombre sugiere que el modelo está orientado a la detección de contenido misógino, aunque la model card no especifica explícitamente la taxonomía de etiquetas ni la naturaleza del conjunto de datos de entrenamiento (aparece como "None dataset"). Se trata, por tanto, de un clasificador binario o multiclase de propósito específico, no de un modelo generativo.

Con 66.955.010 parámetros, es un transformer encoder de tipo DistilBERT, una versión destilada de BERT-base con aproximadamente un 40 % menos de parámetros que el original. Su utilidad principal es la moderación de contenido y el filtrado automático de textos en pipelines de clasificación, donde un modelo compacto y rápido como este puede desplegarse con requisitos de hardware muy modestos.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de moderación de contenido de bajo coste computacional; por otro, advierte de que la información publicada por el autor es mínima y los resultados de evaluación son débiles en la métrica F1, lo que limita seriamente su uso en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización dinámica de PyTorch, no documentada por el autor) |
| Idiomas soportados | No disponible (el modelo base es `distilbert-base-uncased`, entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas con 66 millones de parámetros, hidden size de 768 y 12 cabezas de atención. DistilBERT se obtuvo originalmente mediante destilación de conocimiento de BERT-base, conservando aproximadamente el 97 % del rendimiento del profesor con un 40 % menos de parámetros y siendo un 60 % más rápido en inferencia. La tarea añadida es una cabeza de clasificación de secuencias (`text-classification`).

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 3 épocas, con learning rate 2e-05, batch size de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y scheduler lineal. No se documenta el número de tokens de entrenamiento, la composición del dataset, el número de ejemplos ni si se aplicaron técnicas de balanceo de clases. Tampoco se indica si hubo aumento de datos o validación cruzada. La evolución de las métricas por época (mostrada en la model card) revela un sobreajuste claro: la pérdida de validación sube de 0,4861 en la época 1 a 0,9633 en la época 3, mientras que la accuracy apenas mejora (0,8483 → 0,9042) y el F1 cae de 0,5380 a 0,4901.

## Capacidades

- Clasificación de texto: asigna una etiqueta a una secuencia de entrada; la taxonomía concreta de etiquetas no está documentada.
- Detección de contenido misógino (según el nombre del modelo): presumiblemente clasificación binaria o multiclase de textos con carga misógina.
- Procesamiento en inglés: heredado de `distilbert-base-uncased`, con tokenizador WordPiece sin distinción de mayúsculas.
- Inferencia rápida y de bajo coste: adecuado para clasificación de alto volumen en CPU o GPU modesta.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- Capacidades multilingües: no documentadas; el modelo base es monolingüe inglés.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar mensajes entrantes en tiempo real y derivar los positivos a revisión humana, aprovechando su bajo coste de inferencia (66 M de parámetros) para procesar miles de textos por segundo en una GPU consumer.
- Filtrado previo en pipelines de curación de datasets: antes de entrenar modelos generativos, se puede usar como primera capa de filtro para descartar contenido misógino de corpus web, reduciendo el volumen que llega a revisores humanos.
- Clasificación por lotes de conversaciones de atención al cliente: permite etiquetar transcripciones de chats y detectar casos de lenguaje abusivo o discriminatorio para su escalado a equipos de calidad.
- Análisis de toxicidad en encuestas abiertas: procesar respuestas de texto libre en estudios sociales o académicos y marcar automáticamente las que contienen lenguaje misógino para su codificación manual posterior.
- Enrutamiento en sistemas de soporte: clasificar tickets o mensajes de usuarios y redirigir los que contienen lenguaje ofensivo a un flujo de gestión de conflictos en lugar del flujo estándar.
- Investigación en detección de discurso de odio: servir como baseline o componente de comparación en experimentos académicos sobre clasificación de misoginia, dado su tamaño reducido y su licencia permisiva.
- Filtrado en plataformas educativas: revisar automáticamente mensajes de estudiantes en foros de discusión y alertar a moderadores ante posibles casos de acoso.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en la model card, medidos sobre un conjunto de evaluación no especificado. El `model-index` oficial no contiene resultados (`results: []`).

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 |
|---|---|---|---|
| Validation loss | 0,4861 | 0,6128 | 0,9633 |
| Accuracy | 0,8483 | 0,9017 | 0,9042 |
| F1 | 0,4299 | 0,5380 | 0,4901 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en fp32 (66,9 M de parámetros × 4 bytes), unos 135 MB en fp16 y alrededor de 70 MB en int8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 quedan enormemente sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 2050 o incluso iGPU con memoria compartida; también funciona en CPU sin problemas de rendimiento.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `text-embeddings-inference` (el modelo está etiquetado como `endpoints_compatible`), ONNX Runtime, o exportación a TorchScript. No se documenta soporte explícito de vLLM, llama.cpp ni Ollama (este último no aplica a modelos encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput de miles de secuencias por segundo en GPU y cientos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| distilbert-guest-misoginia | 66,9 M | 512 | Apache 2.0 | Fine-tuning específico para misoginia; F1 0,538 en validación |
| distilbert-base-uncased | 66,9 M | 512 | Apache 2.0 | Modelo base sin fine-tuning; no clasifica misoginia directamente |
| bert-base-uncased | 110 M | 512 | Apache 2.0 | Más parámetros y más lento; mayor capacidad representacional |
| roberta-base | 125 M | 512 | MIT | Alternativa común para clasificación de toxicidad; requiere fine-tuning |

No se dispone de datos de rendimiento comparativo con otros clasificadores de misoginia publicados (por ejemplo, variantes de HateBERT o ToxiGen), por lo que la comparativa se limita a arquitecturas y licencias.

## Limitaciones y advertencias

- El F1 de validación es bajo (0,5380 en el mejor punto), lo que indica un rendimiento pobre en la clase positiva; la accuracy alta (0,9017) es engañosa y probablemente refleja un fuerte desbalanceo de clases en el conjunto de evaluación.
- Sobreajuste evidente: la pérdida de validación aumenta de la época 1 a la 3 mientras el F1 cae, lo que sugiere que el modelo no generaliza bien.
- No se documenta la taxonomía de etiquetas, el dataset de entrenamiento, el idioma exacto ni el dominio de aplicación; el uso en producción requiere una validación independiente.
- Riesgo de sesgos: al entrenarse sobre un corpus no documentado, puede heredar sesgos de género, raza o dialecto presentes en los datos; además, la detección de misoginia es una tarea subjetiva y sensible al contexto cultural.
- Riesgo de falsos positivos y negativos: sin métricas de precisión y recall por clase, no es posible calibrar umbrales de decisión de forma fiable.
- Limitación de contexto: 512 tokens; textos más largos deben truncarse, lo que puede eliminar evidencia relevante.
- Idiomas: aunque la licencia Apache 2.0 permite uso comercial, el modelo está pensado para inglés y no se garantiza su funcionamiento en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; se recomienda citar la procedencia y validar el modelo antes de integrarlo en sistemas de moderación con consecuencias reales para los usuarios.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Rachiifal/distilbert-guest-misoginia)
- [Modelo base distilbert-base-uncased](https://huggingface.co/distilbert-base-uncased)
- [Documentación de DistilBERT (paper original de Sanh et al., 2019)](https://arxiv.org/abs/1910.01108)
- [Documentación de Transformers para text-classification](https://huggingface.co/docs/transformers/tasks/sequence_classification)
