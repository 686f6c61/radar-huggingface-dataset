# sofiane-isi/distilbert-sentiment

## Resumen

`sofiane-isi/distilbert-sentiment` es un clasificador de sentimiento binario basado en DistilBERT, un transformer destilado de BERT. Ha sido fine-tuned por el usuario `sofiane-isi` sobre el dataset `cornell-movie-review-data/rotten_tomatoes`, que contiene críticas de cine en inglés etiquetadas como `NEGATIVE` o `POSITIVE`. El modelo se presenta como un proyecto educativo que documenta un flujo MLOps completo: dataset, tokenización, fine-tuning, evaluación y publicación en Hugging Face Hub.

Con 66.955.010 parámetros y un tamaño de 0.3 GB, es un modelo ligero apto para entornos con recursos limitados. Su relevancia radica en ser un ejemplo práctico de fine-tuning de transformers para análisis de sentimiento. Sin embargo, al estar entrenado exclusivamente en un corpus de críticas de cine, su capacidad de generalización a otros dominios es limitada. No se especifica la licencia, los idiomas soportados ni la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `distilbert-base-uncased`, un transformer encoder-only que reduce el tamaño de BERT mediante destilación de conocimiento. Esta arquitectura conserva la estructura de capas de atención pero con un número menor de parámetros, lo que la hace más eficiente para tareas de clasificación.

El fine-tuning se realizó sobre el dataset `cornell-movie-review-data/rotten_tomatoes`, compuesto por críticas de cine etiquetadas como positivas o negativas. El flujo de trabajo documentado incluye tokenización, ajuste fino, evaluación y publicación en Hugging Face. No se menciona el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Clasificación de sentimiento binario (`NEGATIVE`/`POSITIVE`) en críticas de cine en inglés.
- Inferencia compatible con el pipeline `text-classification` de Transformers.
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (visión, audio, modo de pensamiento): no documentadas.

## Casos de uso

- Análisis automático de críticas de cine en inglés: el modelo puede integrarse en un sistema de scraping de reseñas para clasificarlas como positivas o negativas. Su arquitectura ligera permite procesar grandes volúmenes de texto con un coste computacional bajo.
- Moderación de comentarios en foros de cine: al clasificar el sentimiento de los comentarios, un administrador puede detectar rápidamente mensajes negativos o quejas. El modelo es adecuado porque ha sido entrenado en el dominio de reseñas de películas.
- Prototipo de monitorización de redes sociales en inglés: aunque su dominio es el cine, puede usarse como base para un sistema de análisis de sentimiento en Twitter o Reddit sobre temas cinematográficos. Requiere reentrenamiento para otros dominios.
- Etiquetado automático de datos para entrenar modelos más complejos: el modelo puede pre-etiquetar un corpus de reseñas en inglés, reduciendo el coste de anotación manual. Su precisión reportada del 84.6% lo hace útil como primer filtro.
- Herramienta educativa para enseñar fine-tuning y despliegue de modelos: el repositorio documenta un flujo MLOps completo (dataset → tokenización → fine-tuning → evaluación → Hub). Es ideal para demostrar cómo entrenar y publicar un clasificador.
- Filtrado de reseñas en una aplicación de recomendación de películas: se puede clasificar la opinión del usuario sobre una película y ajustar las recomendaciones en consecuencia. El modelo permite una integración sencilla mediante la API de Transformers.

## Benchmarks y rendimiento

En la model card del autor se reporta una accuracy de 0.8461 y una loss de evaluación de 0.4296 sobre el dataset Rotten Tomatoes. No se han publicado resultados de benchmarks adicionales en la información disponible.

| Metrica | Valor |
|---|---|
| Accuracy | 0.8461 |
| Evaluation loss | 0.4296 |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 66.955.010 parámetros y un tamaño de 0.3 GB en safetensors. En FP32 requeriría aproximadamente 0.3 GB de VRAM; en FP16, alrededor de 0.15 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 3050) o incluso CPU para inferencia de baja demanda.
- Compatibilidad con consumer GPU: sí, es un modelo ligero que cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: Transformers (PyTorch), Hugging Face Inference Endpoints. Al ser un modelo estándar de Transformers, también es compatible con runtimes como vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. No se han publicado datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados ni documentados.
- Riesgo de alucinación: bajo en clasificación binaria, pero la precisión limitada (84.6%) implica que un 15.4% de las predicciones pueden ser erróneas.
- Limitaciones de idioma: el modelo está entrenado en inglés, por lo que no es apto para textos en castellano u otros idiomas.
- Limitaciones de dominio: solo se entrenó en críticas de cine de Rotten Tomatoes, lo que reduce su capacidad para generalizar a otros dominios como productos, noticias o redes sociales.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si permite uso comercial o redistribución.
- Modelo educativo: está pensado como ejemplo de flujo MLOps y no como sistema listo para producción.
- Modelo con cero descargas y cero likes: no ha sido validado por la comunidad, lo que implica una confiabilidad incierta.

## Enlaces

- HuggingFace: https://huggingface.co/sofiane-isi/distilbert-sentiment
