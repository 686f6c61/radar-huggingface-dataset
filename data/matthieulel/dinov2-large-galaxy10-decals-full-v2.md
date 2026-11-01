# matthieulel/dinov2-large-galaxy10-decals-full-v2

## Resumen

`matthieulel/dinov2-large-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, obtenido mediante ajuste fino completo (*full fine-tuning*) del backbone auto-supervisado `facebook/dinov2-large` sobre el conjunto de datos Galaxy10 DECaLS (10 clases morfológicas). Lo desarrolla el usuario matthieulel en el contexto de un estudio comparativo de 40 backbones de visión (40 modelos preentrenados x dos regímenes de adaptación = 80 configuraciones) publicado en el marco del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo resuelve una tarea concreta y acotada: asignar una de diez categorías morfológicas a imágenes de galaxias procedentes del relevo DECaLS. No es un modelo generativo ni conversacional; es un clasificador de imagen puro con una única capa lineal de 10 salidas sobre el encoder ViT-L de DINOv2. Su relevancia radica en que demuestra que un backbone de propósito general preentrenado en imágenes naturales (DINOv2) transfiere de forma competitiva a datos astronómicos cuando se ajusta por completo, alcanzando un 85,96 % de accuracy en el conjunto de test reservado (1.774 imágenes).

Arquitectónicamente es un Vision Transformer de 304.389.130 parámetros (ViT-L/14 de DINOv2) con una cabeza de clasificación lineal. La ventana de contexto no aplica en el sentido de los LLM: la entrada es una imagen redimensionada y recortada a 256x256 píxeles en la evaluación del paper. La licencia Apache 2.0 y el formato safetensors lo hacen directamente desplegable en entornos de producción sin restricciones comerciales adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/14) DINOv2 con cabeza lineal de clasificación |
| Parametros totales | 304.389.130 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px en evaluación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32/fp16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/dinov2-large`, un Vision Transformer auto-supervisado de tipo ViT-L/14 (parche de 14x14, 24 bloques, dimensión de embedding 1024) entrenado por Meta con destilación auto-supervisada sobre imágenes naturales. Sobre ese backbone se aplica un ajuste fino completo (todos los parámetros actualizados) y se sustituye la cabeza por una única capa lineal con diez salidas, correspondientes a las diez clases morfológicas de Galaxy10 DECaLS.

El protocolo de entrenamiento está documentado con detalle: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación se limita a random resized crop a la resolución de entrada y volteo horizontal aleatorio. La evaluación usa resize y centre crop a 256x256 px más la normalización del image processor del checkpoint. El conjunto Galaxy10 DECaLS (17.736 imágenes) se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test reservado (el split público de test). La época seleccionada es la de mínima pérdida de validación (época 10 de 30).

No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de visión. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal; la innovación metodológica del trabajo es la comparación sistemática y reproducible de 40 backbones bajo un recetario idéntico, con semillas 42, 1 y 2 para estimar la variabilidad.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales de alta calidad gracias al backbone DINOv2 ViT-L/14 (útil para fine-tuning posterior o como encoder congelado).
- Inferencia por imagen individual o en lote mediante `AutoModelForImageClassification`.
- Integración nativa con `transformers` y `AutoImageProcessor`.
- Compatible con endpoints de HuggingFace (`endpoints_compatible` en los tags).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo asigna una de las diez clases a cada imagen de galaxia procedente de DECaLS, lo que permite procesar catálogos de miles de objetos con un coste computacional bajo y una accuracy del ~86 % en test.
- Etiquetado asistido y control de calidad de catálogos: usar las predicciones como pre-etiquetas para revisión humana, priorizando las imágenes con menor confianza para inspección manual, lo que reduce el esfuerzo de anotación en estudios morfológicos a gran escala.
- Selección de muestras para estudios de seguimiento: filtrar galaxias de una clase morfológica concreta (por ejemplo, espirales barradas o elípticas) antes de observaciones espectroscópicas o de alta resolución, usando el clasificador como primer filtro.
- Extracción de embeddings para búsqueda por similitud: usar la salida del encoder DINOv2 como representación vectorial para agrupar galaxias visualmente parecidas, detectar outliers o construir índices de recuperación de imágenes astronómicas.
- Benchmark y comparación de backbones: al formar parte de una colección de 80 configuraciones con recetario idéntico, sirve como referencia reproducible para evaluar nuevos backbones de visión en tareas astronómicas.
- Docencia y divulgación en astronomía computacional: modelo ligero (1,2 GB) y con receta de entrenamiento completa que puede reproducirse en una sola GPU, útil para cursos prácticos de aprendizaje profundo aplicado a datos astronómicos.
- Despliegue en servicios de clasificación de imágenes: gracias a la licencia Apache 2.0 y al formato safetensors, puede servirse en una API interna de clasificación morfológica sin restricciones comerciales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de test reservado de Galaxy10 DECaLS, 1.774 imágenes). La columna "verificado" indica `false` en el model-index, es decir, no han sido validados de forma independiente.

| Metrica | Valor (seed 42, época 10) | Media +/- desv. típica (seeds 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 85,96 | 85,19 +/- 0,74 |
| Weighted F1 (%) | 85,56 | 84,85 +/- 0,63 |

Evolución seleccionada de la accuracy de test por época (seed 42): época 1 = 74,69 %, época 5 = 82,36 %, época 10 (seleccionada) = 85,96 %, época 20 = 87,09 %, época 30 = 87,15 %. El autor selecciona la época 10 por mínima pérdida de validación, aunque épocas posteriores alcanzan mayor accuracy de test, lo que sugiere cierto margen de mejora si se cambiara el criterio de selección.

No se proporcionan en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks; la comparación entre los 40 backbones está en el artículo y en el dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-2,5 GB en fp32 para los 304 M de parámetros (1,22 GB de pesos) más activaciones; en fp16 se reduce a ~0,6-1,2 GB. Cifras orientativas, no documentadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32; para entrenamiento o fine-tuning completo se recomienda una GPU de 16 GB o superior (el autor entrenó con una sola GPU, sin especificar modelo).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, incluso con margen para batches grandes.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; también es posible exportar a ONNX o TorchScript para servir con Triton u otros runtimes. No se documentan variantes GGUF ni soporte explícito en llama.cpp/Ollama (no aplica a un clasificador de visión).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un ViT-L/14 con entrada 256x256, el coste por imagen es moderado y permite procesamiento por lotes en GPU de consumo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos sobre el mismo conjunto de test, por lo que la comparación cuantitativa directa no está disponible. Se ofrece una comparación estructural con alternativas de la misma categoría (clasificadores de morfología galáctica o backbones de visión ajustados):

| Modelo | Parametros | Contexto/entrada | Rendimiento en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dinov2-large-galaxy10-decals-full-v2 (este) | 304 M | imagen 256x256 | 85,96 % accuracy (test, seed 42) | Apache 2.0 | HuggingFace |
| Backbones alternativos del mismo benchmark (40 modelos x 2 regímenes) | variable | imagen | resultados en el dataset `vision-foundation-models-benchmark-runs` | variable | HuggingFace |
| `facebook/dinov2-large` (base, sin ajustar) | 304 M | imagen 224x224 | no disponible en la información | Apache 2.0 (según modelo base) | HuggingFace |

La comparación detallada con los otros 39 backbones del estudio (por ejemplo, ViT, ConvNeXt, Swin u otros foundation models) requeriría consultar el artículo y el dataset de runs, que no se incluyen en la información disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de morfología galáctica sobre imágenes de Galaxy10 DECaLS; no generaliza a otras tareas de visión sin reentrenamiento.
- Riesgo de degradación fuera de distribución: imágenes de otros relevos, resoluciones o condiciones de ruido distintas a DECaLS pueden reducir la accuracy de forma no cuantificada.
- Accuracy del ~86 % implica un ~14 % de errores; no debe usarse como única fuente en estudios científicos sin validación humana o cruce con otras fuentes.
- El model-index marca los resultados como `verified: false`; no han sido validados de forma independiente.
- La selección de época por mínima pérdida de validación no coincide con la de máxima accuracy de test (época 30 alcanza 87,15 %), lo que indica que el checkpoint publicado no es el de mejor rendimiento en test.
- No se documentan sesgos demográficos (no aplica), pero sí posibles sesgos de clase derivados del desbalanceo del dataset Galaxy10 DECaLS, mitigado parcialmente por la división estratificada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda citar el artículo (pendiente de publicación) y el modelo base.
- No hay información sobre cuantizaciones oficiales ni sobre rendimiento en CPU; el despliegue en producción debe validarse con los pesos en fp32/fp16.
- El repositorio tiene pocas descargas (17) y ningún like en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/dinov2-large-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/dinov2-large
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing (versión revisada, 2026); cita pendiente de publicación, sin enlace disponible.
