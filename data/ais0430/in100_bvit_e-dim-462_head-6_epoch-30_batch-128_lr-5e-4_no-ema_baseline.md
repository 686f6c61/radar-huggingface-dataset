# ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_baseline

## Resumen

El modelo `ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_baseline` es un clasificador de imágenes basado en una arquitectura bViT (una variante de Vision Transformer) desarrollado por el usuario ais0430 en el marco de un proyecto de reproducción experimental denominado "bViT". El modelo se ha entrenado sobre el conjunto de datos ImageNet-100 (un subconjunto de 100 clases de ImageNet) y está publicado en Hugging Face con la librería `transformers` y pesos en formato safetensors.

Se trata de un modelo muy compacto, con aproximadamente 3,06 millones de parámetros totales, lo que lo sitúa en la categoría de modelos ligeros para clasificación de imágenes. La nomenclatura del repositorio indica los hiperparámetros del experimento: dimensión de embedding de 462, 6 cabezas de atención, 30 épocas de entrenamiento, tamaño de batch de 128 y tasa de aprendizaje de 5e-4, sin media móvil exponencial (no-EMA).

Su relevancia es fundamentalmente experimental y de investigación: sirve como referencia ("baseline") dentro de un proyecto de reproducción de arquitecturas bViT, y su interés práctico es limitado fuera de ese contexto. No dispone de model card detallada más allá de la información de entrenamiento y el resultado de precisión de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bViT (Vision Transformer, variante del proyecto bViT_circuit) |
| Parametros totales | 3.059.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un bViT, una variante de Vision Transformer desarrollada en el proyecto bViT_circuit, cuyos detalles de diseño se documentan en el repositorio de GitHub del autor (archivos `CLAUDE.md` y `docs/code_notes/`). El modelo procesa imágenes y produce logits de clasificación sobre las 100 clases de ImageNet-100. La configuración concreta incluye una dimensión de embedding de 462 y 6 cabezas de atención.

El entrenamiento se realizó durante 30 épocas con un tamaño de batch de 128 y una tasa de aprendizaje de 5e-4, sin uso de EMA (media móvil exponencial). El conjunto de datos empleado es ImageNet-100, identificado en la model card con la etiqueta `imagenet100`. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset, ni sobre el uso de técnicas de ajuste fino como RLHF o DPO (no aplicables en clasificación de imágenes). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura bViT.

## Capacidades

- Clasificación de imágenes en 100 clases (ImageNet-100).
- Extracción de características visuales mediante el backbone transformer.
- Inferencia compatible con la librería `transformers` y con endpoints de Hugging Face (`endpoints_compatible`).
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa texto).
- Sin modo thinking, visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación de imágenes en dominios con 100 categorías: el modelo puede etiquetar imágenes en un conjunto cerrado de 100 clases, adecuado para tareas de filtrado o etiquetado automático en pipelines de datos visuales.
- Prototipado y experimentación en investigación: sirve como baseline ligero para comparar variantes de arquitecturas bViT en experimentos de reproducción, gracias a sus 3,06 millones de parámetros y su bajo coste computacional.
- Extracción de embeddings visuales: el backbone transformer puede emplearse para obtener representaciones de imágenes que alimenten clasificadores posteriores o sistemas de búsqueda por similitud.
- Despliegue en entornos con recursos limitados: su tamaño reducido permite ejecutarlo en CPU o en GPUs de gama baja para tareas de clasificación en tiempo real.
- Evaluación de técnicas de entrenamiento: al estar etiquetado como "baseline" sin EMA, permite comparar el efecto de técnicas como EMA, distintas tasas de aprendizaje o tamaños de batch en el rendimiento final.
- Docencia y reproducción de experimentos: útil para ilustrar el flujo completo de entrenamiento de un Vision Transformer sobre un subconjunto de ImageNet en cursos o talleres.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| ImageNet-100 (eval accuracy, best) | 0.4494 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo es exclusivamente de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en precisión completa (3,06 M de parámetros); menos aún con cuantización a FP16 o INT8.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3060 o incluso una GPU integrada pueden ejecutarlo.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch), endpoints de Hugging Face (marcado como `endpoints_compatible`), exportación a ONNX no documentada.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia muy baja en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ais0430/in100_bvit (este modelo) | 3,06 M | no aplica | 0,4494 en ImageNet-100 | no disponible | Hugging Face |
| ViT-Base (referencia) | ~86 M | no aplica | no disponible en esta ficha | no disponible | Amplia |
| DeiT-Tiny (referencia) | ~5,7 M | no aplica | no disponible en esta ficha | no disponible | Amplia |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. Las alternativas citadas son referencias habituales de la categoría de Vision Transformers ligeros, pero sus resultados no se han verificado en esta ficha.

## Limitaciones y advertencias

- Entrenado únicamente sobre ImageNet-100: no generaliza a clases fuera de ese conjunto cerrado.
- Precisión de evaluación moderada (0,4494), insuficiente para aplicaciones de producción que requieran alta exactitud.
- Sin información sobre sesgos del dataset ni sobre la composición de ImageNet-100 más allá de su origen.
- Riesgo de sobreajuste y de comportamiento errático en dominios visuales distintos al de entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier despliegue productivo.
- Sin model card detallada: faltan datos sobre preprocesado, resolución de entrada y normalización, lo que dificulta la reproducibilidad.
- Proyecto experimental con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No apto para tareas de texto, razonamiento o generación; su uso está restringido a clasificación de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_baseline
- Repositorio del proyecto bViT_circuit: https://github.com/otia-0430/bViT_circuit
- Run de Weights & Biases: https://forge.coreweave.com/wandb/aito-paretto-/bvit/runs/7yalb36j
