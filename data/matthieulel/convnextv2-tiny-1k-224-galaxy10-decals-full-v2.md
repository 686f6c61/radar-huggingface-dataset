# matthieulel/convnextv2-tiny-1k-224-galaxy10-decals-full-v2

## Resumen

`matthieulel/convnextv2-tiny-1k-224-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, obtenido mediante ajuste fino completo (todos los parámetros actualizados) de `facebook/convnextv2-tiny-1k-224` sobre el conjunto Galaxy10 DECaLS, que consta de 10 clases morfológicas. Lo desarrolla el usuario de Hugging Face matthieulel como parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) dentro de un benchmark de modelos fundacionales de visión aplicados a datos astronómicos, asociado a un artículo en revisión para *Astronomy and Computing* (2026).

El modelo resuelve una tarea concreta y acotada: asignar una de diez categorías morfológicas a imágenes de galaxias procedentes del sondeo DECaLS. No es un modelo generativo ni multimodal de propósito general, sino un cabezal de clasificación lineal de diez salidas montado sobre un backbone ConvNeXt V2 tiny. Su relevancia radica en que ofrece una referencia reproducible y con protocolo detallado (semillas, épocas, receta de aumento de datos) para evaluar hasta qué punto los backbones de visión preentrenados en ImageNet transfieren a dominios científicos alejados de la fotografía natural.

Con 27.874.186 parámetros y un repositorio de 0,1 GB, es un modelo ligero que puede ejecutarse en hardware modesto. La resolución de entrada es de 224x224 píxeles y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura con capas ConvNeXtBlock y normalización LayerNorm), backbone `facebook/convnextv2-tiny-1k-224` con cabezal lineal de 10 salidas |
| Parámetros totales | 27.874.186 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta cuantizaciones específicas) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 tiny, una red convolucional pura que moderniza el diseño de ResNet incorporando bloques con convoluciones depthwise de 7x7, LayerNorm en lugar de BatchNorm, activación GELU y una capa de escala por canal (GRN, Global Response Normalization) introducida en ConvNeXt V2. Sobre el vector de características global se añade una única capa lineal con diez salidas, una por clase morfológica. El preentrenamiento original del backbone es en ImageNet-1k a 224x224, y en este checkpoint se han actualizado todos los parámetros durante el ajuste fino (full fine-tuning).

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes en total): el split público de test (1.774 imágenes) se reservó como conjunto de evaluación final, mientras que el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta es idéntica para los 40 backbones del benchmark: AdamW con betas 0,9/0,999, epsilon 1e-8, weight decay 0,1, recorte de gradiente 1,0, tasa de aprendizaje 5e-5 con schedule lineal y 10% de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y volteo horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 224x224 y se aplica la normalización del procesador de imágenes del checkpoint. La época seleccionada es la 17 de 30, la de menor pérdida de validación.

## Capacidades

- Clasificación de imágenes de galaxias en diez clases morfológicas del esquema Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ConvNeXt V2 tiny, reutilizable para otras tareas de visión con un cabezal nuevo.
- Inferencia determinista y de baja latencia sobre imágenes individuales de 224x224 px.
- No soporta tool calling ni function calling: es un modelo puramente discriminativo.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües ni de procesamiento de texto.
- Sin modo thinking, visión generativa, audio ni otras modalidades.
- Funciona como clasificador cerrado: no genera descripciones ni explicaciones de la predicción.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo asigna una de las diez clases Galaxy10 a cada recorte de galaxia procedente de DECaLS, lo que permite procesar lotes de imágenes con una latencia muy baja gracias a sus 27,9 M de parámetros y a la entrada de 224x224 px.
- Etiquetado preliminar para catálogos: usar las predicciones como primera pasada sobre grandes volúmenes de recortes y reservar la inspección humana para los casos de baja confianza, reduciendo el coste de anotación manual.
- Filtrado y control de calidad de datasets: detectar recortes mal centrados, artefactos o imágenes con morfología atípica comparando la distribución de predicciones con la esperada para el sondeo.
- Línea base reproducible en investigación: al formar parte de un benchmark de 80 configuraciones con receta fija y semillas documentadas, sirve como referencia para comparar nuevos backbones o estrategias de adaptación (full fine-tuning frente a linear probing) en el mismo conjunto.
- Docencia y divulgación: ejemplo completo y ligero de ajuste fino de un backbone de visión en un dominio científico, con métricas por época y protocolo detallado que facilitan la reproducción en una sola GPU.
- Prototipado rápido en CPU o GPU de gama baja: al ocupar 0,1 GB en safetensors, puede integrarse en entornos con recursos limitados para demos o validaciones iniciales antes de escalar a modelos mayores.
- Transferencia a tareas afines: reutilizar el backbone ya adaptado a imágenes astronómicas como inicialización para clasificación de otros sondeos o para tareas de regresión (por ejemplo, estimación de redshift fotométrico) con un cabezal nuevo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test reservado de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Valor (semilla 42, época 17) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 86,75 | 86,43 ± 0,34 |
| F1 ponderado (%) | 86,50 | 86,23 ± 0,32 |

Evolución seleccionada de la métrica de test a lo largo del entrenamiento (semilla 42):

| Época | Pérdida val. | Acc. val. (%) | Acc. test (%) | F1 pond. test (%) |
|---|---|---|---|---|
| 1 | 1,7942 | 43,52 | 43,97 | 35,23 |
| 5 | 0,5482 | 82,69 | 82,53 | 82,23 |
| 10 | 0,4590 | 84,61 | 85,34 | 85,14 |
| 17 (seleccionada) | 0,4284 | 85,85 | 86,75 | 86,50 |
| 26 | 0,4360 | 86,19 | 86,98 | 86,91 |
| 30 | 0,4324 | 86,08 | 86,53 | 86,32 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla del benchmark; el autor remite al dataset `vision-foundation-models-benchmark-runs` para las métricas del resto de configuraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (27,9 M de parámetros, aproximadamente 112 MB de pesos) más el espacio de activaciones para un lote pequeño; en la práctica, menos de 2 GB en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; funcionan sin problema RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para entrenamiento completo, una sola GPU de gama media-alta es suficiente (el autor usó una única GPU en fp32).
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU de consumo con 4 GB o más, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` y `AutoImageProcessor` (ruta documentada por el autor); exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; integración en servicios HTTP con FastAPI o BentoML. No se documentan pesos GGUF ni soporte específico de llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y throughput alto en lotes, pero no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (ConvNeXt V2 tiny, full fine-tuning) | 27,9 M | 224x224 px | Clasificación de 10 clases | 86,75% (test, semilla 42) | Apache 2.0 |
| `facebook/convnextv2-tiny-1k-224` (backbone base, sin ajustar) | 28,6 M | 224x224 px | Clasificación ImageNet-1k | no disponible en la información | Apache 2.0 |
| Otras configuraciones del mismo benchmark (39 backbones restantes) | variable | 224x224 px | Clasificación de 10 clases | no disponibles en la información | variable |
| Alternativas de la misma categoría (por ejemplo, ViT-B/16 o ResNet-50 ajustados a Galaxy10) | variable | 224x224 px | Clasificación de 10 clases | no disponibles en la información | variable |

No se dispone en la información proporcionada de resultados numéricos de modelos alternativos sobre el mismo conjunto, por lo que la comparación cuantitativa queda limitada a este checkpoint y a su backbone de partida.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado exclusivamente con imágenes de DECaLS; el rendimiento puede degradarse con datos de otros sondeos, otras bandas fotométricas o distintas condiciones de seeing y profundidad.
- Sesgos de clase: Galaxy10 DECaLS presenta un desequilibrio morfológico conocido (predominan espirales y elípticas frente a clases minoritarias); el F1 ponderado (86,50%) es ligeramente inferior a la accuracy (86,75%), lo que indica cierto sesgo hacia clases mayoritarias.
- Riesgo de error en morfologías ambiguas: galaxias en interacción, fusiones o con bajo contraste de superficie pueden clasificarse erróneamente; no se documentan calibraciones de confianza ni umbrales recomendados.
- Sin verificación independiente: las métricas son declaradas por el autor y marcadas como no verificadas; conviene reproducirlas antes de usarlas como referencia en producción.
- Limitación de resolución: la entrada se fija en 224x224 px, lo que puede perder estructura fina (brazos espirales tenues, barras) en galaxias extensas.
- Sin capacidades generativas ni de texto: no puede justificar la predicción ni interactuar en lenguaje natural; cualquier explicación debe añadirse con un módulo externo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías; conviene conservar el aviso de licencia y la cita del artículo cuando se publique.
- Caveat de producción: el checkpoint corresponde a una época seleccionada por pérdida de validación, no a la de mejor accuracy de test; la diferencia entre épocas cercanas (86,4-87,0% en test) está dentro del ruido, por lo que no debe sobreinterpretarse una mejora de décimas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-tiny-1k-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-tiny-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset con métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección del benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona URL)
