# matthieulel/dinov2-small-imagenet1k-1-layer-galaxy10-decals-full-v2

## Resumen

`matthieulel/dinov2-small-imagenet1k-1-layer-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, obtenido mediante ajuste fino completo (*full fine-tuning*) del backbone `facebook/dinov2-small-imagenet1k-1-layer` sobre el conjunto Galaxy10 DECaLS. Lo desarrolla el usuario de Hugging Face `matthieulel` en el marco de un estudio comparativo de 40 backbones de visión (ViT, ConvNeXt, DINOv2, CLIP, entre otros) bajo dos regímenes de adaptación, publicado como colección *Vision Foundation Models Benchmark* y asociado a un artículo en revisión en *Astronomy and Computing* (2026).

El modelo resuelve una tarea de clasificación de 10 clases sobre imágenes de galaxias del sondeo DECaLS, un problema clásico de astronomía observacional donde el etiquetado manual es caro y los datasets son modestos (17.736 imágenes). La relevancia actual está en que evalúa de forma controlada si los *foundation models* de visión preentrenados en ImageNet generalizan a dominios científicos con pocos datos, y publica tanto los pesos como las métricas por época y las particiones exactas, lo que facilita la reproducibilidad.

Arquitectura ViT-S/14 (DINOv2 small) con 22,06 millones de parámetros, entrada a 256×256 px en evaluación y una única capa lineal de clasificación de 10 salidas. Licencia Apache 2.0, pesos en safetensors (0,1 GB) y compatible con `transformers` y endpoints de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2 small), transformer de visión con parches de 14×14 |
| Parametros totales | 22.064.266 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256×256 px en evaluación) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible (modelo de visión sin componente textual) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El backbone es un Vision Transformer pequeño (ViT-S) con parches de 14×14, preentrenado por Meta con el objetivo auto-supervisado DINOv2 sobre el checkpoint `facebook/dinov2-small-imagenet1k-1-layer`. Sobre él se añade una única capa lineal con 10 salidas, una por clase morfológica de Galaxy10 DECaLS. El ajuste es completo: se actualizan todos los parámetros, no solo la cabeza.

El protocolo de entrenamiento es idéntico para los 40 backbones del estudio: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, clipping de gradiente 1,0), learning rate 5e-5 con schedule lineal y 10 % de warm-up, batch efectivo de 256 (32 imágenes × 8 pasos de acumulación), 30 épocas, precisión fp32 con TF32 desactivado y una sola GPU. La augmentación se limita a *random resized crop* a la resolución de entrada y *random horizontal flip*. El dataset Galaxy10 DECaLS (17.736 imágenes) se divide de forma estratificada en 14.188 de entrenamiento, 1.774 de validación y 1.774 de test; la validación solo se usa para seleccionar la época (la 13, de mínima pérdida de validación). En evaluación se redimensiona y recorta al centro a 256×256 px y se aplica la normalización del *image processor* del checkpoint. El autor declara una comprobación de integridad: el 100 % de las predicciones sobre las primeras 96 imágenes de test coincide con los logits guardados (diferencia máxima absoluta 2,86e-06).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (Galaxy10 DECaLS).
- Extracción de características visuales genéricas heredadas del backbone DINOv2 (útil para *linear probing* o *fine-tuning* en tareas afines).
- Inferencia por imagen individual o en lote mediante `AutoModelForImageClassification` de `transformers`.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto: es un clasificador puro.
- Sin capacidades multilingües ni de audio; sin *thinking mode*.
- Compatible con *endpoints* de Hugging Face (`endpoints_compatible` en los tags).

## Casos de uso

- Clasificación morfológica automatizada en pipelines de reducción de datos astronómicos: el modelo etiqueta recortes de galaxias DECaLS en 10 clases con un 83,71 % de accuracy en test, lo que permite prefiltrar catálogos antes de la inspección visual humana.
- Etiquetado asistido y control de calidad: usar las predicciones como primera pasada y reservar la revisión humana para las imágenes con menor confianza (logits próximos entre clases), reduciendo el coste de anotación.
- Selección de muestras para estudios morfológicos: separar espirales, elípticas e irregulares en grandes volúmenes de imágenes para análisis estadísticos de poblaciones.
- *Baseline* reproducible en investigación: al publicarse las particiones, las métricas por época y las semillas, sirve como referencia contra la que comparar nuevos backbones o recetas de adaptación en el mismo benchmark de 40 configuraciones.
- Extracción de *embeddings* para agrupamiento no supervisado: reutilizar el backbone ajustado para clustering de morfologías o búsqueda de similitud visual en archivos de imágenes.
- Docencia y prototipado en *transfer learning* astronómico: ejemplo completo y ligero (0,1 GB, 22 M de parámetros) que se ejecuta en una GPU de consumo para demostrar ajuste fino de un *foundation model* en un dominio científico.
- Integración en servicios de inferencia de bajo coste: su tamaño permite desplegarlo en CPU o en GPUs modestas para clasificación por lotes de recortes.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados de forma independiente), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 13 seleccionada) | 83,71 % |
| F1 ponderado (semilla 42, época 13) | 83,34 % |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 84,27 ± 0,83 % |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 83,95 ± 0,88 % |

Evolución relevante dentro de la semilla 42: la accuracy de test pasa de 70,69 % en la época 1 a 83,71 % en la época 13 (seleccionada por mínima pérdida de validación), y alcanza máximos de 85,63 % en la época 24 y 85,57 % en la época 28; la época 30 cierra en 85,46 %. El autor no publica comparaciones numéricas con otros backbones en esta model card; las tablas comparativas del estudio están en el dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware

- VRAM para inferencia: muy baja; con 22 M de parámetros en fp32 el modelo ocupa aproximadamente 85-90 MB de pesos, y por debajo de 50 MB en fp16. Con batch pequeño, menos de 1 GB de VRAM en total.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 4090, A100 o H100 están sobredimensionadas para inferencia. Para entrenamiento, el autor usó una sola GPU con fp32 y batch efectivo de 256.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.); también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch) como vía principal; también es posible exportarlo a ONNX o TorchScript para servir con ONNX Runtime o Triton, aunque el autor no documenta estas rutas. No hay pesos GGUF ni soporte Ollama/llama.cpp (no aplica a un clasificador de visión).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (DINOv2-small, full FT) | 22,06 M | 256×256 px | Clasificación 10 clases | 83,71 % (test, semilla 42) | Apache 2.0 |
| `facebook/dinov2-small-imagenet1k-1-layer` (base sin ajustar) | ~22 M | 224×224 px (nativo) | Extracción de características / ImageNet | no disponible en esta ficha | Apache 2.0 |
| Otros backbones del mismo benchmark (39 restantes) | variable | variable | Clasificación 10 clases | no disponible en esta ficha (tablas en `vision-foundation-models-benchmark-runs`) | según backbone |

No se dispone en la información proporcionada de resultados de los otros 39 backbones ni de modelos alternativos específicos de morfología galáctica, por lo que la comparación numérica con alternativas queda como no disponible.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo clasifica las 10 clases de Galaxy10 DECaLS; no es un modelo de propósito general ni genera texto.
- Riesgo de alucinación en sentido de clasificación errónea: el 16 % aproximado de error en test implica confusiones entre clases morfológicamente próximas; no debe usarse sin revisión en decisiones científicas críticas.
- Sesgos de dominio: entrenado exclusivamente con imágenes DECaLS; el rendimiento puede degradarse con otros sondeos, otras bandas, otros niveles de ruido o recortes con distinta escala.
- Sesgo de selección de época: la época 13 se eligió por mínima pérdida de validación, pero épocas posteriores (16, 18, 20, 24, 28) obtienen mejor accuracy de test, lo que sugiere que el checkpoint publicado no es el óptimo en test y que las métricas pueden estar ligeramente infravaloradas respecto al techo del entrenamiento.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; la reproducibilidad depende de las particiones publicadas en el dataset de runs.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base DINOv2 de Meta también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene revisar los términos del dataset Galaxy10 DECaLS para usos derivados.
- Sin cuantizaciones publicadas ni pesos en formatos ligeros (GGUF/ONNX), lo que limita el despliegue en *edge* sin trabajo adicional de exportación.
- Sin información sobre idiomas ni texto: no aplica a tareas lingüísticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/dinov2-small-imagenet1k-1-layer-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/dinov2-small-imagenet1k-1-layer
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs y métricas por época: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (en revisión; cita pendiente de publicación, sin URL disponible)
