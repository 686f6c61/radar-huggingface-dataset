# matthieulel/dinov2-base-galaxy10-decals-head-v2

## Resumen

`matthieulel/dinov2-base-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias construido sobre el backbone `facebook/dinov2-base`. Lo desarrolla el usuario de Hugging Face matthieulel como parte de la colección Vision Foundation Models Benchmark, un estudio sistemático de 40 backbones preentrenados bajo dos regímenes de adaptación. El modelo resuelve una tarea concreta: asignar una imagen de galaxia del dataset Galaxy10 DECaLS a una de diez clases morfológicas.

La relevancia del checkpoint es metodológica más que de producto. Se trata de un ajuste *head-only*: el backbone DINOv2 permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de diez salidas. Esto convierte al modelo en una sonda lineal reproducible del espacio de representaciones de DINOv2 sobre datos astronómicos, con un protocolo documentado al detalle (semillas, épocas, aumentación y selección de checkpoint) y métricas por época publicadas.

El modelo tiene 86.595.850 parámetros totales, un repositorio de 0,3 GB en safetensors, licencia Apache 2.0 y se distribuye en formato compatible con `transformers` (`AutoModelForImageClassification`). Su uso previsto es la clasificación morfológica de galaxias en flujos de análisis astronómico y la comparación de backbones en investigación, no la generación de texto ni tareas generales de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) DINOv2-base con cabeza lineal de clasificación (10 salidas) |
| Parametros totales | 86.595.850 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256x256 px en evaluación) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; pesos en safetensors fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El backbone es DINOv2-base, un Vision Transformer preentrenado por Meta mediante destilación autosupervisada sobre un corpus de imágenes a gran escala. Sobre él se añade una única capa lineal con diez salidas, que es el único componente entrenado. El backbone se mantiene congelado durante todo el ajuste, incluidas las estadísticas de sus capas de normalización, de modo que el checkpoint completo contiene los pesos originales de DINOv2 más la cabeza entrenada.

El entrenamiento usa Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reserva como test held-out; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas solo para seleccionar la época. La receta es idéntica para los 40 backbones del estudio: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 256x256 px y se aplica la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 28 de 30). El autor reporta una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden al 100 % con los logits guardados de la época seleccionada (diferencia máxima absoluta de 1,43e-06).

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas del esquema Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone DINOv2-base congelado (útil como encoder para otras tareas astronómicas).
- Inferencia determinista y reproducible: protocolo de preprocesado fijado (resize y center crop a 256x256 px más normalización del processor).
- Funciona como sonda lineal de referencia para comparar backbones de visión en el dominio astronómico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo *thinking* ni de salidas estructuradas más allá de los logits de clase.

## Casos de uso

- Clasificación morfológica automatizada en catálogos astronómicos: el modelo asigna una de diez clases a cada recorte de galaxia, lo que permite etiquetar lotes de imágenes procedentes de DECaLS con un coste computacional bajo al tener solo una cabeza lineal entrenada.
- Triaje previo en pipelines de inspección visual: se puede usar como primer filtro para separar galaxias con morfología clara de aquellas que requieren revisión por un astrónomo, usando la confianza de los logits como criterio.
- Estudio comparativo de foundation models: al compartir receta con los otros 39 backbones del benchmark, sirve para medir de forma controlada cuánto aporta DINOv2-base frente a otras arquitecturas en morfología galáctica.
- Extracción de embeddings para búsqueda por similitud: el backbone congelado puede generar representaciones de imágenes de galaxias para construir índices de vecinos más cercanos o agrupamientos no supervisados.
- Docencia y reproducción de experimentos: el repositorio incluye métricas por época, semillas y splits documentados, lo que facilita replicar el ajuste head-only en un curso o taller de aprendizaje automático aplicado a astronomía.
- Baseline en investigación de morfología galáctica: con 62,40 % de accuracy en test, proporciona una referencia cuantitativa contra la que evaluar fine-tuning completo, LoRA u otras estrategias de adaptación.
- Validación de pipelines de datos: la comprobación de integridad publicada (predicciones idénticas al 100 % en 96 imágenes) permite usar el checkpoint para verificar que un pipeline de preprocesado reproduce exactamente el del paper.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época 28 de 30) | 62,40 % |
| Weighted F1 (seed 42, época 28 de 30) | 60,98 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 62,27 +/- 0,23 % |
| Weighted F1 media +/- desviación típica (semillas 42, 1, 2) | 60,72 +/- 0,30 % |

Evolución seleccionada del entrenamiento (seed 42): la accuracy de test pasa de 13,30 % en la época 1 a 55,19 % en la época 6, 61,05 % en la época 15 y 62,40 % en la época 28. La meseta se alcanza alrededor de la época 22 (62,29 %), con variaciones de menos de medio punto porcentual hasta la época 30 (62,46 %).

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp32 ocupa aproximadamente 0,33 GB de pesos (86,6 M de parámetros), por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más, incluyendo las integradas modernas.
- GPU recomendadas: cualquier GPU consumer reciente sirve; una RTX 3060, RTX 4060 o superior permite procesar lotes grandes sin presión de memoria. Para evaluación a gran escala, A100 o H100 aportan más throughput por lote.
- Cabe en GPU consumer: sí, en todas las NVIDIA con soporte CUDA de los últimos años; también es viable en CPU para volúmenes moderados de imágenes.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` y `AutoImageProcessor` (ruta documentada por el autor); exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; integración en pipelines de PyTorch con `torch.compile`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al tratarse de un ViT-base con entrada de 256x256 px y una sola capa lineal, el coste dominante es el forward del backbone, no la cabeza.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dinov2-base-galaxy10-decals-head-v2 (este) | 86,6 M | 256x256 px | 62,40 % accuracy (test, seed 42) | Apache 2.0 | Hugging Face, `transformers` |
| facebook/dinov2-base (backbone sin ajustar) | 86,6 M | 224x224 px por defecto | no disponible en la información | Apache 2.0 | Hugging Face, `transformers` |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | no disponible | no disponible en la información | no disponible | Colección de Hugging Face del autor |
| Fine-tuning completo de DINOv2-base sobre Galaxy10 DECaLS | 86,6 M | 256x256 px | no disponible en la información | no disponible | no disponible |

La comparación cuantitativa con alternativas no puede completarse con los datos proporcionados: el autor publica las métricas de este checkpoint y de la media de tres semillas, pero no incluye en la información disponible las cifras de los otros 39 backbones ni de regímenes de ajuste alternativos.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en morfología de galaxias del esquema Galaxy10 DECaLS; no es un modelo de propósito general y no debe usarse fuera de ese dominio sin reentrenar la cabeza.
- La accuracy de 62,40 % implica que aproximadamente una de cada tres imágenes de test se clasifica incorrectamente; no es adecuado para etiquetado automático sin revisión humana en contextos científicos.
- El backbone está congelado: el modelo no se beneficia de ajuste fino de las representaciones y su techo de rendimiento está acotado por la calidad de las features de DINOv2-base.
- Riesgo de sesgo de clase: con diez clases morfológicas y un dataset de 17.736 imágenes, las clases minoritarias pueden tener peor rendimiento; el autor no publica métricas desagregadas por clase en la información disponible.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de falsos positivos con alta confianza en imágenes ambiguas o fuera de distribución.
- La selección de época se hizo con un split de validación de 1.774 imágenes; con ese tamaño, diferencias de pocas décimas de punto porcentual entre épocas (como las observadas entre las épocas 22 y 30) están dentro del ruido.
- Las métricas son declaradas por el autor y marcadas como no verificadas (`verified: false`) en el model-index.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar el aviso de licencia y citar el trabajo original cuando se publique.
- El paper asociado está en revisión en *Astronomy and Computing* (versión revisada, 2026); la cita definitiva aún no está disponible.
- El preprocesado debe respetarse estrictamente (resize y center crop a 256x256 px más normalización del processor); desviarse de él degrada las predicciones y rompe la reproducibilidad declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/dinov2-base-galaxy10-decals-head-v2
- Backbone base: https://huggingface.co/facebook/dinov2-base
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset con métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (en revisión; sin DOI disponible en la información proporcionada)
