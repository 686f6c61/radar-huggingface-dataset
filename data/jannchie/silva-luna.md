# Jannchie/silva-luna

## Resumen

SILVA Luna es un modelo de clasificación de imágenes diseñado específicamente para puntuar la estética de ilustraciones. Lo desarrolla Jannchie (Jianqi Pan) y se publica bajo licencia MIT. El modelo no es un sistema de visión completo, sino un "cabeza" ligera de aproximadamente 7 MB que se ejecuta sobre el backbone congelado `google/siglip2-so400m-patch14-384`. Su propósito es replicar el gusto estético de un modelo de lenguaje y visión (VLM) específico, `openai/gpt-5.6-luna`, destilando sus preferencias en un predictor ordinal.

La relevancia de este modelo radica en su enfoque: en lugar de intentar medir una "calidad universal" de las imágenes, puntúa según el gusto de un juez VLM concreto, lo que permite a los desarrolladores alinear la selección de imágenes con criterios estéticos específicos. El modelo acepta una imagen y devuelve una puntuación en el intervalo [0, 1], donde valores más altos indican mayor preferencia por parte del juez destilado. Su arquitectura es un MLP de tres capas sobre el embedding de SigLIP2, con una cabeza de regresión ordinal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP [1024, 512, 256] con LayerNorm sobre embedding de SigLIP2 (1152 dims) + cabeza ordinal |
| Parametros totales | 1.840.389 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador ligero que se conecta al backbone congelado `google/siglip2-so400m-patch14-384`. La arquitectura de la cabeza es: `embedding[1152] → LayerNorm → MLP [1024, 512, 256] → ordinal head`. El embedding de entrada corresponde al `pooler_output` de SigLIP2, que produce vectores de 1152 dimensiones.

El entrenamiento se realizó a partir de rankings generados por el VLM `openai/gpt-5.6-luna` (accedido via OpenRouter), que ordenaba ocho ilustraciones a la vez. Estas ordenaciones se agregaron mediante el modelo de Plackett-Luce para obtener una puntuación latente por imagen, con un grado de 21. El objetivo de entrenamiento es la regresión ordinal, calibrada a la distribución de etiquetas del conjunto de datos. El modelo se evaluó en un split de test reservado, obteniendo un coeficiente de correlación de Spearman de 0.7152 y un MAE de 0.5066 en la escala 1-5.

## Capacidades

- Puntuación estética de ilustraciones: devuelve un valor en [0, 1] que refleja la preferencia del juez VLM destilado.
- Puntuación por lotes: acepta listas de rutas de imagen y devuelve una lista de puntuaciones.
- Puntuación directa sobre embeddings: si ya se dispone de los embeddings de SigLIP2, se puede puntuar sin volver a pasar las imágenes por el backbone.
- Salida calibrada: ofrece tanto la puntuación cruda como la calibrada a la distribución de etiquetas del entrenamiento.
- Integración sencilla: se carga con la librería `silva` mediante `from_pretrained`.
- Ligero: el adaptador ocupa unos 7 MB, lo que permite ejecutarlo en hardware muy modesto.

## Casos de uso

- Selección de portadas para plataformas de publicación: un servicio de autoedición puede filtrar automáticamente las ilustraciones enviadas por los autores, puntuando cada una y mostrando solo las que superen un umbral de calidad estética según el criterio del juez destilado.
- Curado de datasets para entrenamiento de modelos generativos: antes de entrenar un modelo de difusión o un GAN, se pueden puntuar las imágenes del dataset y quedarse con el subconjunto mejor valorado, mejorando la calidad del entrenamiento sin intervención manual.
- Filtrado de resultados en motores de búsqueda de imágenes: un buscador de ilustraciones puede ordenar los resultados por puntuación estética, priorizando las imágenes que probablemente resulten más atractivas al usuario final.
- Moderación de contenido en comunidades de arte: una plataforma social puede usar el modelo para detectar ilustraciones de baja calidad estética y enviarlas a revisión humana, reduciendo la carga de los moderadores.
- Evaluación de variantes de diseño en estudios de diseño gráfico: un equipo de diseño puede generar múltiples variantes de una ilustración y usar el modelo para preseleccionar las más prometedoras antes de la revisión humana.
- Análisis de tendencias estéticas: un investigador puede puntuar grandes colecciones de ilustraciones históricas para estudiar cómo evoluciona el gusto estético a lo largo del tiempo, usando el modelo como un juez consistente y reproducible.

## Benchmarks y rendimiento

El modelo card reporta los siguientes resultados en el split de test reservado:

| Metrica | Valor |
|---|---|
| Spearman | 0.7152 |
| Pearson | 0.7261 |
| MAE (escala 1-5) | 0.5066 |
| Top-5% | 0.3077 |

No se han publicado comparaciones con otros modelos de puntuación estética en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa unos 7 MB y puede ejecutarse en cualquier CPU moderna.
- El requisito principal es el backbone SigLIP2 (`google/siglip2-so400m-patch14-384`), que requiere aproximadamente 2-4 GB de VRAM en FP16 para inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (NVIDIA GTX 1650, RTX 3060, etc.) puede ejecutar el modelo completo.
- En CPU, la inferencia es posible pero más lenta; se recomienda GPU para procesamiento por lotes.
- Opciones de despliegue: la librería `silva` permite integración en pipelines de Python; también se puede usar el espacio de HuggingFace de demostración para pruebas interactivas.
- Latencia estimada: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de puntuación estética. Modelos como `laion/CLIP-based aesthetic predictor` o `shunk031/aesthetic-predictor` existen en el ecosistema, pero no se han encontrado datos comparativos publicados con SILVA Luna en la información disponible.

## Limitaciones y advertencias

- El modelo puntúa según el gusto de un juez VLM concreto (`gpt-5.6-luna`), no según un criterio universal de calidad. Sus puntuaciones pueden no coincidir con las preferencias de otros jueces o de usuarios humanos.
- El modelo está entrenado específicamente para ilustraciones; su rendimiento en fotografías u otros tipos de imagen no está validado.
- Depende del backbone SigLIP2, que debe descargarse y cargarse por separado; esto añade requisitos de almacenamiento y memoria.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base SigLIP2 tiene su propia licencia (Apache 2.0) que debe respetarse.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de un VLM concreto, puede heredar sesgos estéticos de ese modelo.
- El riesgo de alucinación no aplica al ser un modelo discriminativo, no generativo.

## Enlaces

- HuggingFace: https://huggingface.co/Jannchie/silva-luna
- Repositorio GitHub: https://github.com/Jannchie/silva
- Demo interactiva: https://huggingface.co/spaces/Jannchie/silva-aesthetic-demo
- Modelo base: https://huggingface.co/google/siglip2-so400m-patch14-384
