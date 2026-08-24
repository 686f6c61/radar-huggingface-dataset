# Aadithya1122/vanguard-moderation-checkpoints

## Resumen

Vanguard es un conjunto de seis cabezas clasificadoras entrenadas para moderación de contenido multimodal. Cada checkpoint es un clasificador ligero que se monta sobre un backbone CLIP ViT-B/32 congelado, cargado en tiempo de ejecución desde `openai/clip-vit-base-patch32`. El modelo aborda dos tareas: detección de memes ofensivos (Hateful Memes) y detección de noticias falsas (Fakeddit), usando tres variantes de fusión: solo visión (cv_only), solo texto (nlp_only) y atención cruzada (cross_attention).

El autor, Aadithya A R, publica estos checkpoints como parte de un proyecto de moderación de contenido multimodal. La relevancia actual reside en que ofrece una solución ligera y reproducible para clasificar contenido multimodal sin necesidad de entrenar un modelo completo, aprovechando un backbone CLIP congelado. Los resultados muestran que la atención cruzada supera a la fusión tardía en Hateful Memes, aunque la diferencia no es estadísticamente significativa (p = 0.051). En Fakeddit, ambas estrategias son equivalentes. El modelo se distribuye bajo licencia MIT, con un tamaño de repositorio de 0.1 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador ligero sobre backbone CLIP ViT-B/32 congelado (openai/clip-vit-base-patch32) |
| Parametros totales | no disponible (los checkpoints son cabezas pequeñas, el backbone no se incluye) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador, no generativo) |
| Tipos de cuantizacion | no disponible (se cargan como tensores PyTorch, sin cuantización publicada) |
| Idiomas soportados | no disponible (los benchmarks son en inglés; no se especifica soporte multilingüe) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura consiste en un backbone CLIP ViT-B/32 congelado que extrae características visuales y textuales por separado. Sobre estas representaciones, se entrenan tres tipos de cabezas: `cv_only` (solo visual), `nlp_only` (solo texto) y `cross_attention` (mecanismo de atención cruzada entre las dos modalidades). Cada cabeza es un clasificador binario o multiclase según el benchmark (Hateful Memes y Fakeddit). El entrenamiento se realizó en una MacBook Air M4 usando MPS, sin CUDA. No se especifican los datos de entrenamiento exactos más allá de los benchmarks públicos. Se aplicó un escalado de temperatura por validación para calibrar las predicciones: sin este escalado, el error de calibración esperado (ECE) era de 0.28 para la cabeza de atención cruzada en Hateful Memes, y se redujo a 0.036 tras el ajuste. La temperatura grande (8.60) indica sobreconfianza severa del modelo, ya que la pérdida de entrenamiento llegó a 0.0008 mientras la validación se estancaba.

## Capacidades

- Detección de contenido ofensivo en memes (Hateful Memes) combinando información visual y textual.
- Detección de noticias falsas (Fakeddit) clasificando la veracidad de publicaciones con imágenes y texto.
- Fusión de modalidades mediante atención cruzada para tareas donde la etiqueta solo aparece cuando ambas modalidades se combinan.
- Clasificación por separado de modalidades individuales (solo visual o solo texto) para análisis de contribución.
- Calibración de confianza mediante escalado de temperatura, lo que permite obtener probabilidades bien calibradas.
- Inferencia ligera sobre un backbone congelado, sin necesidad de ajustar el modelo completo.
- Compatible con el pipeline de moderación multimodal del repositorio asociado.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede clasificar memes o publicaciones con imagen y texto para detectar discursos de odio o contenido ofensivo. La variante `cross_attention` es adecuada cuando el contexto visual y textual juntos determinan la toxicidad.
- Filtrado de noticias falsas en portales de noticias o agregadores: la cabeza `nlp_only` o `cross_attention` sobre Fakeddit permite descartar publicaciones sospechosas antes de la publicación.
- Auditoría de datasets multimodales: usar el clasificador para etiquetar automáticamente grandes volúmenes de pares imagen-texto, por ejemplo para limpiar datasets de entrenamiento.
- Investigación en fusión multimodal: las tres variantes permiten comparar estrategias de fusión temprana, tardía y atención cruzada en un entorno controlado.
- Prototipado rápido de sistemas de moderación: al usar un backbone congelado, se puede integrar fácilmente en pipelines existentes sin reentrenar el modelo completo.
- Análisis de sesgos en modelos de moderación: el estudio de las diferencias de rendimiento entre modalidades ayuda a identificar si el modelo depende demasiado del texto o de la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. Los datos de rendimiento disponibles son los macro-F1 reportados en la model card para cada combinación de cabeza y benchmark:

| Cabeza | Benchmark | Test macro-F1 | Temperatura |
|---|---|---|---|
| cv_only | Hateful Memes | 0.6217 | 1.57 |
| nlp_only | Hateful Memes | 0.6283 | 2.38 |
| cross_attention | Hateful Memes | 0.7035 | 8.60 |
| cv_only | Fakeddit | 0.6863 | 1.62 |
| nlp_only | Fakeddit | 0.7031 | 3.08 |
| cross_attention | Fakeddit | 0.7705 | 4.47 |

La diferencia entre cross_attention y nlp_only en Hateful Memes es de 0.0125 macro-F1, con un p-valor de 0.051, no significativo al umbral convencional. En Fakeddit, la diferencia entre ambas es mínima (p = 0.596).

## Requisitos de hardware

- El modelo es muy ligero: solo las cabezas clasificadoras (menos de 0.1 GB), pero requiere cargar el backbone CLIP ViT-B/32, que ocupa unos 150 MB en fp32.
- Puede ejecutarse en CPU sin problema, aunque el backbone CLIP tarda algo más. En GPU (cualquier GPU con al menos 2 GB de VRAM) es instantáneo.
- En una MacBook Air M4 (MPS) se entrenó y se puede ejecutar en tiempo real.
- Para despliegue en producción se puede usar cualquier framework de PyTorch estándar (TorchServe, FastAPI, etc.). No requiere vLLM ni TGI porque no es un modelo generativo.
- Latencia: no disponible, pero al ser un clasificador pequeño sobre un backbone fijo, la inferencia debería ser inferior a 100 ms en GPU moderna.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables en la misma categoría (clasificadores de moderación multimodal sobre CLIP congelado). Se puede mencionar que otros sistemas de moderación suelen usar modelos como CLIP-base o arquitecturas específicas, pero no se dispone de datos comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado solo en dos benchmarks (Hateful Memes y Fakeddit), por lo que su generalización a otros dominios o tipos de contenido no está garantizada.
- Las cabezas son específicas de cada benchmark: usar la cabeza de Hateful Memes para detectar noticias falsas producirá predicciones sin sentido (el autor lo indica explícitamente).
- Los modelos están severamente sobreconfiados sin el escalado de temperatura. Es obligatorio dividir los logits por la temperatura antes de aplicar softmax.
- El backbone CLIP está congelado y es el mismo para todas las cabezas; no se ha ajustado para la tarea, lo que puede limitar el rendimiento en casos extremos.
- La licencia MIT permite uso comercial, pero el modelo puede heredar sesgos del propio CLIP y de los datos de entrenamiento de los benchmarks.
- No se proporciona información sobre el dataset de entrenamiento ni sobre la composición de los datos, lo que dificulta evaluar posibles sesgos.
- El modelo no es un sistema de moderación completo: requiere un pipeline que incluya la extracción de características CLIP y la integración con la aplicación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Aadithya1122/vanguard-moderation-checkpoints)
- [Repositorio del proyecto multimodal-content-moderation](https://github.com/Aadithyaar22/multimodal-content-moderation)
- [Perfil del autor en Hugging Face](https://huggingface.co/Aadithya1122)
