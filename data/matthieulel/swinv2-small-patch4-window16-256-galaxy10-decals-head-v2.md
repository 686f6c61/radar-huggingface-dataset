# matthieulel/swinv2-small-patch4-window16-256-galaxy10-decals-head-v2

## Resumen

`swinv2-small-patch4-window16-256-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel` como parte del benchmark *Vision Foundation Models Benchmark*. El modelo parte del checkpoint preentrenado `microsoft/swinv2-small-patch4-window16-256` y lo adapta al dataset Galaxy10 DECaLS (10 clases morfológicas) mediante un régimen de *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una cabeza lineal de 10 salidas.

La relevancia del checkpoint no reside en su rendimiento absoluto, sino en su papel dentro de un protocolo comparativo reproducible: es una de las 80 configuraciones del estudio (40 backbones preentrenados x dos regímenes de adaptación) asociado al artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). El modelo tiene 48.967.108 parámetros totales, un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0.

Alcanza un 49,10 % de accuracy y un 46,73 % de F1 ponderado en el conjunto de test retenido de Galaxy10 DECaLS (1.774 imágenes), con una media de 49,30 +/- 0,18 % de accuracy sobre tres semillas. Es, por tanto, una pieza de infraestructura de evaluación más que un modelo listo para producción astronómica de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (swinv2-small, patch 4, ventana 16, resolución 256) |
| Parametros totales | 48.967.108 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256x256 px) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; pesos en safetensors fp32) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidad lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Numero de clases | 10 (morfología galáctica Galaxy10 DECaLS) |
| Resolucion de entrada | 256x256 px (resize + center crop) |
| Modelo base | microsoft/swinv2-small-patch4-window16-256 |
| Regimen de ajuste | head-only fine-tuning (backbone congelado, cabeza lineal entrenada) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El backbone es un Swin Transformer V2 en configuración *small* con parches de 4x4 píxeles y ventanas de atención de 16x16, preentrenado por Microsoft sobre datos genéricos de visión. Swin V2 introduce mejoras sobre V1 orientadas a estabilizar el entrenamiento y escalar la resolución: *residual post normalization*, *scaled cosine attention* y un sesgo de posición relativa continuo. En este checkpoint, esos pesos permanecen intactos y congelados; la única parte entrenada es una capa lineal de 10 salidas que mapea el vector global del backbone a las clases morfológicas.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como conjunto de evaluación retenido y el split público de train dividido de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. La aumentación se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación aplica resize y center crop a 256x256 px con la normalización del procesador de imágenes del checkpoint base. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone Swin V2 congelado, reutilizable como encoder para otras tareas astronómicas.
- Inferencia determinista y reproducible: el autor verificó que las predicciones coinciden con los logits guardados en el 100 % de las primeras 96 imágenes de test (diferencia absoluta máxima de 2,62e-06).
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo *thinking*: es exclusivamente un clasificador de visión.
- No dispone de capacidades de visión generalista más allá de la clasificación entrenada; el backbone puede usarse como feature extractor, pero no se documentan cabezas para detección, segmentación ni captioning.

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: el modelo recibe recortes de 256x256 px de galaxias procedentes de DECaLS y devuelve una de las 10 clases morfológicas, lo que permite etiquetar catálogos masivos sin intervención manual. Es adecuado como línea base reproducible dentro de estudios comparativos de backbones.
- **Benchmarking de modelos de visión en astronomía**: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve para comparar el rendimiento de Swin V2 small frente a otros 39 backbones bajo el mismo protocolo de adaptación head-only, aislando el efecto del preentrenamiento.
- **Extracción de embeddings para agrupamiento no supervisado**: el backbone congelado puede usarse como extractor de características para clustering o búsqueda por similitud de imágenes galácticas, aprovechando que sus pesos no se han alterado respecto al checkpoint original de Microsoft.
- **Prototipado rápido de clasificadores astronómicos**: dado que solo se entrena una cabeza lineal, el modelo ilustra el coste mínimo de adaptación (una GPU, 30 épocas, batch efectivo 256) para obtener un clasificador funcional sobre un dataset etiquetado, útil como referencia antes de invertir en fine-tuning completo.
- **Validación de protocolos de evaluación**: el repositorio incluye métricas por época, splits e índices, lo que permite reproducir exactamente el experimento y verificar la integridad de los pesos, un caso de uso relevante para revisión por pares y auditoría de resultados.
- **Docencia y formación en visión por computador aplicada**: el modelo ejemplifica de forma compacta (0,2 GB, 48,9 M de parámetros) el flujo completo de adaptación de un foundation model a un dominio científico, desde el preprocesado hasta la selección de época por pérdida de validación.
- **Filtrado previo en estudios morfológicos a gran escala**: combinado con umbrales de confianza sobre los logits, puede usarse para preseleccionar candidatos de interés (por ejemplo, galaxias con rasgos de espiral o fusiones) que luego se revisen con inspección visual o modelos más costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test de Galaxy10 DECaLS con 1.774 imágenes:

| Metrica | Valor (semilla 42, epoca 30) | Media +/- desv. tip. (semillas 42, 1, 2) |
|---|---|---|
| Accuracy | 49,10 % | 49,30 +/- 0,18 % |
| F1 ponderado | 46,73 % | 46,95 +/- 0,19 % |

Evolución seleccionada de las métricas de test por época (semilla 42): época 1 con 13,42 % de accuracy y 8,05 % de F1 ponderado; época 10 con 45,94 % y 42,01 %; época 20 con 47,75 % y 45,03 %; época 30 (seleccionada) con 49,10 % y 46,73 %. La pérdida de validación desciende de 2,2529 en la época 1 a 1,4486 en las épocas 29 y 30.

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks; las comparaciones entre backbones del estudio están en el dataset `vision-foundation-models-benchmark-runs` y en el artículo aún en revisión.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 48,9 M de parámetros en fp32, los pesos ocupan aproximadamente 196 MB; sumando activaciones para un batch pequeño a 256x256 px, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó con una sola GPU en fp32. Para lotes grandes o extracción de características masiva, se recomiendan A100, H100, L4 o RTX 4090 por throughput.
- **GPU de consumo**: sí cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida), dado el reducido tamaño del modelo.
- **Opciones de despliegue**: `transformers` con PyTorch es la vía documentada; también es compatible con `endpoints_compatible` según los tags, y puede exportarse a ONNX o TorchScript para servir con infraestructura propia. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño del modelo (48,9 M de parámetros, entrada 256x256), se espera una latencia de milisegundos por imagen en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de modelos alternativos de clasificación morfológica galáctica con métricas comparables. La comparación cuantitativa entre las 40 configuraciones del estudio está en el dataset `vision-foundation-models-benchmark-runs`, no incluido aquí.

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swinv2-small-patch4-window16-256-galaxy10-decals-head-v2 | 48,9 M | 256x256 px | 49,10 % (test, semilla 42) | Apache 2.0 | HuggingFace |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | no disponible | no disponible en esta ficha | no disponible | Colección en HuggingFace |
| Alternativas especializadas en morfología galáctica | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Rendimiento moderado**: un 49,10 % de accuracy sobre 10 clases indica una capacidad discriminativa limitada; para producción astronómica sería necesario un fine-tuning completo del backbone, más datos o arquitecturas mayores.
- **Riesgo de sesgo de clase**: el F1 ponderado (46,73 %) es inferior a la accuracy (49,10 %), lo que sugiere un rendimiento desigual entre clases morfológicas, probablemente peor en las clases minoritarias. No se aportan métricas por clase.
- **Protocolo restrictivo por diseño**: al mantener el backbone congelado, el modelo no aprovecha la adaptación de representaciones al dominio astronómico; es una línea base deliberadamente conservadora, no un modelo optimizado.
- **Riesgo de alucinación en sentido amplio**: como clasificador, siempre asigna una de las 10 clases con independencia de la imagen de entrada; no dispone de clase "desconocida" ni de estimación de incertidumbre calibrada documentada, por lo que puede etiquetar con confianza imágenes fuera de distribución.
- **Sin capacidades lingüísticas ni multimodales**: no procesa texto, no responde preguntas y no genera descripciones; su uso queda restringido a clasificación de imágenes.
- **Licencia Apache 2.0**: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de Galaxy10 DECaLS.
- **Resultados no verificados**: las métricas de la model card están marcadas como `verified: false`; el artículo asociado está en revisión y la cita aún no está completada.
- **Dependencia de la resolución y el preprocesado**: el modelo espera resize y center crop a 256x256 px con la normalización específica del procesador; desviarse de ese pipeline puede degradar las predicciones.
- **Fecha de creación futura en los metadatos**: el repositorio figura creado el 2026-10-30, lo que conviene tener en cuenta al evaluar la madurez y el soporte del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/swinv2-small-patch4-window16-256-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-small-patch4-window16-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (en revisión; sin enlace disponible)
- Paper original de Swin Transformer V2: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
