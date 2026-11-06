# matthieulel/convnextv2-large-1k-224-galaxy10-decals-full-v2

## Resumen

`convnextv2-large-1k-224-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes desarrollado por el usuario de Hugging Face `matthieulel` como parte de un benchmark de modelos fundacionales de visión aplicados a astronomía. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `facebook/convnextv2-large-1k-224` sobre el conjunto de datos Galaxy10 DECaLS, que contiene imágenes de galaxias etiquetadas en 10 clases morfológicas. El modelo resuelve la tarea de clasificar la morfología galáctica a partir de recortes de imagen de 224x224 píxeles.

El modelo forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Con 196,4 millones de parámetros y un tamaño de repositorio de 0,8 GB, es un modelo de visión puro, sin capacidades de generación de texto ni multimodalidad, especializado exclusivamente en clasificación de imágenes astronómicas.

Su relevancia radica en que proporciona un punto de referencia reproducible y verificado para la adaptación de modelos fundacionales de visión a dominios científicos especializados, con un protocolo de entrenamiento detallado, métricas por época y comprobación de integridad de los pesos. La licencia Apache 2.0 facilita su uso tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, familia ConvNeXt) |
| Parametros totales | 196.435.210 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (modelo de visión sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en ConvNeXt V2 Large, una arquitectura convolucional pura que incorpora bloques de convolución depthwise de 7x7, normalización LayerNorm y una capa de proyección lineal. Sobre el backbone preentrenado en ImageNet-1k se añade una única capa lineal con diez salidas, correspondientes a las diez clases morfológicas de Galaxy10 DECaLS. El ajuste fino es completo: se actualizan todos los parámetros del backbone y de la cabeza.

El protocolo de entrenamiento está documentado con detalle en la model card. Se usan 17.736 imágenes de Galaxy10 DECaLS: el split público de test (1.774 imágenes) se reserva como conjunto de evaluación held-out, mientras que el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. Se emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5 con schedule lineal y 10% de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y volteo horizontal aleatorio. La evaluación usa resize y centre crop a 224x224 px con la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 15 para la semilla 42). El software utilizado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ConvNeXt V2 Large (potencialmente reutilizable para otras tareas de visión astronómica mediante fine-tuning).
- Inferencia sobre recortes de imagen de 224x224 píxeles con la normalización estándar del procesador de imágenes de ConvNeXt V2.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas ni agentes.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo "thinking" ni de visión generativa: es un clasificador discriminativo puro.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en catálogos astronómicos: el modelo puede procesar recortes de 224x224 px de imágenes DECaLS y asignar una de las diez clases morfológicas, sustituyendo la inspección visual manual en volúmenes grandes de datos.
- Etiquetado previo para pipelines de ciencia ciudadana: usar el modelo como primer filtro para preclasificar galaxias y priorizar la revisión humana en los casos de baja confianza, reduciendo la carga de anotadores.
- Benchmarking de modelos fundacionales de visión en astronomía: sirve como referencia reproducible (semilla 42, protocolo documentado) para comparar otros backbones bajo el mismo régimen de ajuste fino completo.
- Selección de características para estudios morfológicos: el backbone puede congelarse y usarse como extractor de embeddings para análisis de clustering o reducción de dimensionalidad sobre poblaciones de galaxias.
- Control de calidad de datos: detectar imágenes mal etiquetadas o atípicas comparando la predicción del modelo con las etiquetas originales del catálogo.
- Docencia y divulgación: modelo ligero (0,8 GB) y de inferencia rápida en GPU consumer para demostrar técnicas de transfer learning en dominios científicos.
- Prototipado de clasificadores astronómicos: punto de partida para fine-tuning sobre otros sondeos (por ejemplo, otros cortes de imagen o clases morfológicas adicionales) gracias a la licencia Apache 2.0 y al formato estándar de transformers.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (conjunto de test held-out de Galaxy10 DECaLS, 1.774 imágenes). Las métricas no están verificadas de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época seleccionada 15) | 85,51% |
| Weighted F1 (semilla 42, época seleccionada 15) | 85,26% |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 85,95% ± 0,45% |
| Weighted F1 media ± desv. típica (semillas 42, 1, 2) | 85,71% ± 0,52% |

La model card incluye además la tabla completa de métricas por época (30 épocas, semilla 42), con accuracy de test entre 45,72% en la época 1 y 87,03% en la época 18, y pérdida de validación mínima de 0,4334 en la época 15. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,8-1,2 GB para los pesos (196,4 M de parámetros × 4 bytes ≈ 0,79 GB) más activaciones y overhead del framework; en la práctica, menos de 2 GB en fp32 para batches pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,4 GB para los pesos, más activaciones; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia; para entrenamiento o fine-tuning, se recomienda una GPU con 16 GB o más (el autor usó una sola GPU con fp32 y batch efectivo de 256, lo que sugiere una GPU de gama alta tipo A100 o similar, aunque no se especifica el modelo exacto).
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, incluso en fp32 para inferencia.
- Opciones de despliegue: transformers (AutoModelForImageClassification), con posibilidad de exportación a ONNX o TorchScript para servir con Triton u otros runtimes; no se documentan variantes GGUF ni soporte nativo en llama.cpp/Ollama (no aplica a modelos de visión puros).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La colección del autor (Vision Foundation Models Benchmark) incluye 40 backbones bajo el mismo protocolo, pero no se aportan sus resultados individuales en esta ficha. Como referencia estructural, el modelo base `facebook/convnextv2-large-1k-224` comparte arquitectura y número de parámetros, pero está preentrenado en ImageNet-1k y no especializado en morfología galáctica.

| Modelo | Parametros | Contexto/entrada | Licencia | Especializacion |
|---|---|---|---|---|
| Este checkpoint | 196,4 M | Imagen 224x224 | Apache 2.0 | Morfologia galactica (10 clases) |
| facebook/convnextv2-large-1k-224 | 196,4 M | Imagen 224x224 | Apache 2.0 | Clasificacion generica ImageNet-1k |
| Otros backbones del benchmark | no disponible | Imagen 224x224 | no disponible | Morfologia galactica (mismo protocolo) |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de imágenes de galaxias de Galaxy10 DECaLS; no es un modelo de propósito general y no debe usarse fuera de ese dominio sin reentrenamiento.
- Las métricas declaradas no están verificadas de forma independiente (`verified: false` en el model-index); se basan en la evaluación del propio autor.
- El conjunto de test tiene solo 1.774 imágenes, por lo que la estimación de accuracy tiene un margen de error no despreciable; la variabilidad entre semillas es de ±0,45 puntos porcentuales en accuracy.
- Riesgo de sesgo de dominio: el modelo se ha entrenado con imágenes DECaLS y puede degradarse con imágenes de otros sondeos, instrumentos o condiciones de observación.
- Riesgo de confusión entre clases morfológicas minoritarias o visualmente similares; el F1 ponderado (85,26%) es ligeramente inferior a la accuracy, lo que sugiere desequilibrio entre clases.
- No apto para generación de texto, razonamiento, código ni tareas multimodales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda citar el artículo asociado (aún en revisión) y verificar los términos del dataset Galaxy10 DECaLS, que puede tener condiciones propias.
- El checkpoint corresponde a una época seleccionada por mínima pérdida de validación (época 15), no necesariamente la de mejor accuracy de test (la época 18 alcanza 87,03% en test), lo que introduce una ligera diferencia entre el rendimiento reportado y el máximo observado.
- No se documentan cuantizaciones ni formatos alternativos de despliegue, lo que limita opciones de optimización en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-large-1k-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-large-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); cita pendiente de publicación, no disponible enlace directo.
