# matthieulel/vit-base-patch32-224-in21k-galaxy10-decals-head-v2

## Resumen
El modelo `vit-base-patch32-224-in21k-galaxy10-decals-head-v2` es un clasificador de imágenes de morfología galáctica desarrollado por el usuario de Hugging Face `matthieulel`. Se trata de un Vision Transformer (ViT-Base) preentrenado por Google en ImageNet-21k y adaptado a la clasificación de galaxias en 10 clases sobre el conjunto de datos Galaxy10 DECaLS. La adaptación se ha realizado mediante *head-only fine-tuning*: el backbone permanece congelado y solo se entrena una cabeza lineal de 10 salidas.

El modelo forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Su relevancia radica en que sirve como referencia reproducible para evaluar hasta qué punto los modelos fundacionales de visión generalistas transfieren a datos astronómicos con una adaptación mínima.

Con 87,46 millones de parámetros y una ventana de entrada de 224x224 píxeles, el modelo obtiene una precisión del 40,42 % y un F1 ponderado del 34,14 % sobre el conjunto de test reservado de Galaxy10 DECaLS (1.774 imágenes). Estos resultados son modestos en términos absolutos, pero coherentes con el régimen de congelación del backbone y útiles como línea base en el benchmark citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 32, resolución 224) |
| Parametros totales | 87.462.922 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 px, 49 parches de 32x32) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
La arquitectura es un Vision Transformer estándar de tipo ViT-Base con parches de 32x32 píxeles y resolución de entrada de 224x224, heredado de `google/vit-base-patch32-224-in21k`. El backbone se mantiene congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una cabeza lineal de 10 salidas que mapea el token `[CLS]` a las clases de morfología galáctica.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), dividiendo el split público de entrenamiento de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación; el split público de test (1.774 imágenes) se reservó como conjunto de evaluación. La receta fue idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batch efectivo de 256 (32 imágenes con acumulación de 8 pasos), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consistió en random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se aplica resize y center crop a 224x224 con la normalización del procesador de imágenes del checkpoint. La selección de época se hizo por mínima pérdida de validación (época 30 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades
- Clasificación de imágenes en 10 clases de morfología galáctica sobre recortes de 224x224 píxeles procedentes de Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ViT-Base congelado, reutilizable como encoder para otras tareas astronómicas.
- Inferencia determinista y reproducible: la comprobación de integridad del autor reporta predicciones idénticas en el 100 % de las primeras 96 imágenes de test (diferencia máxima absoluta de logits de 1,43e-06).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.
- No incorpora modo *thinking* ni mecanismos de decodificación especulativa.

## Casos de uso
- Clasificación morfológica preliminar de galaxias en pipelines astronómicos: el modelo puede etiquetar recortes de 224x224 px en 10 clases como paso de triaje antes de inspección humana o de modelos más costosos, aprovechando su bajo coste computacional (87 M de parámetros).
- Línea base reproducible en investigación sobre transferencia de modelos fundacionales: sirve como referencia congelada para comparar con otros 39 backbones del mismo benchmark bajo idéntica receta, facilitando estudios de ablación.
- Etiquetado asistido en campañas de ciencia ciudadana: puede preclasificar imágenes de DECaLS para priorizar la revisión por voluntarios, reduciendo la carga manual en las clases más frecuentes.
- Extracción de embeddings para búsqueda por similitud: el backbone ViT-Base congelado puede emplearse para generar representaciones vectoriales de recortes galácticos y construir índices de vecinos más cercanos.
- Filtrado de calidad de datos: identificar imágenes con morfología ambigua o ruido para excluirlas de conjuntos de entrenamiento de modelos mayores.
- Prototipado rápido en entornos con recursos limitados: al ser un ViT-Base de 0,3 GB, puede desplegarse en una GPU de consumo para experimentos exploratorios antes de escalar a modelos mayores.
- Docencia y divulgación: ejemplo didáctico de *head-only fine-tuning* sobre datos científicos reales con métricas por época publicadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (conjunto de test de Galaxy10 DECaLS, 1.774 imágenes; no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---|---|
| Accuracy | 40,42 % | Semilla 42, época 30 de 30 (seleccionada por mínima pérdida de validación) |
| Weighted F1 | 34,14 % | Semilla 42, época 30 de 30 |
| Accuracy (media de 3 semillas) | 40,59 ± 0,20 % | Semillas 42, 1 y 2 |
| Weighted F1 (media de 3 semillas) | 34,29 ± 0,23 % | Semillas 42, 1 y 2 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de test más allá de las 40 configuraciones del benchmark del propio autor.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB para los pesos (87,46 M de parámetros) más el espacio de activaciones, que para un batch pequeño de 224x224 se mantiene por debajo de 1 GB en total.
- VRAM estimada en fp16/bf16: en torno a 0,18 GB para pesos, con overhead de activaciones inferior a 0,5 GB para batches moderados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funcionan RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas. El modelo es claramente sobredimensionado para estas GPUs en términos de capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- Opciones de despliegue: transformers (PyTorch), vLLM no aplica (no es un modelo generativo), ONNX Runtime y TorchScript son viables; llama.cpp y Ollama no están orientados a este tipo de modelo. El despliegue recomendado es mediante `AutoModelForImageClassification` de transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-base-patch32-224-in21k-galaxy10-decals-head-v2 (este) | 87,46 M | 224x224 px | 40,42 % (test, semilla 42) | apache-2.0 | Hugging Face |
| Otros backbones del mismo benchmark (40 configuraciones) | variable | 224x224 px | no disponible en esta ficha | variable | Colección Vision Foundation Models Benchmark |
| Modelos específicos de morfología galáctica (p. ej. Zoobot, Galaxy Zoo) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos de modelos alternativos sobre el mismo split de test, por lo que la comparación cuantitativa con Zoobot u otros clasificadores astronómicos no puede establecerse aquí.

## Limitaciones y advertencias
- Rendimiento absoluto modesto: 40,42 % de accuracy y 34,14 % de F1 ponderado sobre 10 clases implican una tasa de error elevada; no es adecuado como clasificador de producción sin revisión humana o sin un fine-tuning completo del backbone.
- Régimen de entrenamiento restringido: al congelar el backbone y entrenar solo una cabeza lineal, el modelo no aprovecha la adaptación de representaciones al dominio astronómico, lo que explica en parte sus métricas limitadas.
- Sesgos de dominio: entrenado exclusivamente sobre Galaxy10 DECaLS, por lo que su generalización a otros sondeos (SDSS, Hubble, Euclid) o a otras resoluciones e instrumentos no está caracterizada.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en morfologías atípicas o imágenes ruidosas.
- Limitación de entrada: solo acepta recortes de 224x224 px; galaxias extensas o con estructuras de gran escala pueden quedar truncadas por el center crop.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el artículo asociado cuando se publique.
- Verificación independiente pendiente: las métricas del model-index están marcadas como no verificadas (`verified: false`) y el artículo está en revisión, por lo que los números deben tomarse como preliminares.
- Sin datos de cuantización publicados: no hay GGUF ni versiones cuantizadas oficiales, lo que limita el despliegue en entornos de muy bajos recursos sin conversión manual.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-base-patch32-224-in21k-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-base-patch32-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data*, Astronomy and Computing (versión revisada, 2026); cita pendiente de publicación.
