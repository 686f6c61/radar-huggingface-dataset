# ausjahk/movie-review-sentiment-analyzer

## Resumen

El modelo `ausjahk/movie-review-sentiment-analyzer` es un clasificador de texto binario (positivo/negativo) especializado en el análisis de sentimiento de reseñas de películas. Se trata de un ajuste fino (*fine-tuning*) del modelo base `distilbert-base-uncased`, desarrollado por el usuario `ausjahk` y publicado en HuggingFace con licencia Apache 2.0. Con 66,9 millones de parámetros, es un modelo compacto y ligero, adecuado para tareas de clasificación de texto en entornos con recursos limitados.

El modelo se entrenó durante dos épocas con un *learning rate* de 2e-5 y un *batch size* de 16, alcanzando una precisión del 83,87% en el conjunto de evaluación. Aunque la *model card* no especifica el *dataset* de entrenamiento, el modelo base está preentrenado en inglés, por lo que se espera que el clasificador funcione principalmente en ese idioma. Su relevancia radica en su simplicidad y bajo coste computacional, lo que lo hace útil para prototipos y aplicaciones de análisis de opinión a pequeña escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder-only) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT soporta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base es inglés, pero no se confirma el idioma del fine-tuning) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. DistilBERT utiliza una arquitectura transformer encoder-only con 6 capas ocultas, 12 cabezas de atención y una dimensión de embedding de 768. El *fine-tuning* se realizó sobre la tarea de clasificación de secuencias con una capa de clasificación binaria en la parte superior.

El entrenamiento se llevó a cabo con el *Trainer* de HuggingFace, utilizando el optimizador AdamW (con betas 0.9 y 0.999), un *scheduler* lineal de tasa de aprendizaje y 2 épocas. El *dataset* de entrenamiento no está especificado en la *model card* (aparece como "None"), aunque por el nombre del modelo se infiere que son reseñas de películas. No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste fino supervisado estándar.

## Capacidades

- Clasificación de sentimiento binario: asigna una etiqueta positiva o negativa a un texto dado.
- Procesamiento de texto en inglés (presumiblemente, dado el modelo base *uncased*).
- Inferencia rápida y ligera gracias al tamaño reducido de DistilBERT.
- Compatible con la librería `transformers` y con `text-embeddings-inference` para despliegue en producción.
- No soporta *tool calling*, generación de texto libre ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Análisis de reseñas de películas en plataformas de streaming: el modelo puede clasificar automáticamente las opiniones de los usuarios como positivas o negativas, permitiendo agregar métricas de satisfacción por título.
- Monitorización de redes sociales: integrado en un pipeline de procesamiento de tweets o comentarios sobre estrenos, ayuda a medir la recepción del público en tiempo real.
- Filtrado de comentarios en foros o blogs: se puede usar para priorizar reseñas negativas que requieran atención del moderador o del equipo de soporte.
- Sistema de recomendación basado en opiniones: combinar la clasificación con otros datos para ajustar recomendaciones de películas según el sentimiento predominante.
- Prototipado rápido de soluciones NLP: al ser un modelo pequeño y con licencia Apache 2.0, sirve como punto de partida para experimentos de análisis de sentimiento sin necesidad de grandes recursos.
- Evaluación de campañas de marketing: clasificar las respuestas de los usuarios a tráilers o anuncios para estimar el impacto emocional de una campaña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. La *model card* reporta únicamente los resultados de evaluación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,3796 |
| Accuracy (evaluación) | 0,8387 |

Estos datos provienen del proceso de *fine-tuning* y no son comparables con benchmarks externos. No hay información sobre rendimiento en conjuntos de datos como SST-2 o IMDB.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo pesa ~0,3 GB en safetensors). Con cuantización a 8 bits o 4 bits, la huella se reduce aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPUs modernas.
- Es viable en *consumer GPU*: sí, el modelo es muy ligero y puede ejecutarse en hardware de gama baja.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (mediante conversión) y `text-embeddings-inference`.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por el tamaño del modelo se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (evaluación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ausjahk/movie-review-sentiment-analyzer` | 66,9 M | no disponible | 0,8387 | Apache 2.0 | HuggingFace |
| `distilbert-base-uncased` (modelo base) | 66,9 M | 512 | no aplica | Apache 2.0 | HuggingFace |
| `bert-base-uncased` (modelo base) | 110 M | 512 | no aplica | Apache 2.0 | HuggingFace |

No se dispone de datos de otros *fine-tunes* específicos para reseñas de películas con los que comparar directamente. La comparación con los modelos base es estructural, no de rendimiento en la tarea.

## Limitaciones y advertencias

- El *dataset* de entrenamiento no está documentado, por lo que se desconocen los posibles sesgos introducidos (por ejemplo, desequilibrio de clases, dominio específico de reseñas).
- El modelo está entrenado presumiblemente en inglés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Al ser un clasificador binario, no distingue matices de sentimiento (neutral, mixto) ni emociones complejas.
- No se han realizado pruebas de robustez frente a textos adversariales o *out-of-distribution*.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo.
- El modelo tiene 0 descargas y 0 *likes* en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/ausjahk/movie-review-sentiment-analyzer)
- [Modelo base DistilBERT](https://huggingface.co/distilbert/distilbert-base-uncased)
