# matthieulel/convnextv2-pico-1k-224-galaxy10-decals-head-v2

## Resumen

`convnextv2-pico-1k-224-galaxy10-decals-head-v2` es un clasificador de imágenes de morfología de galaxias desarrollado por el usuario matthieulel. Adapta el backbone `facebook/convnextv2-pico-1k-224` al dataset Galaxy10 DECaLS mediante *head-only fine-tuning*: el backbone ConvNeXt V2 se mantiene congelado (incluidas las estadísticas de sus capas de normalización) y únicamente se entrena una cabeza lineal de diez salidas. El modelo resultante tiene 8.558.410 parámetros y resuelve un problema de clasificación de 10 clases sobre recortes de 224x224 píxeles.

El interés del checkpoint es metodológico: forma parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) bajo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Sirve, por tanto, como punto de referencia reproducible para evaluar hasta qué punto un modelo de visión preentrenado en ImageNet-1K transfiere a datos astronómicos sin reentrenar el extractor de características.

Los resultados son modestos: 54,57 % de accuracy y 52,42 % de F1 ponderado en el conjunto de test retenido de 1.774 imágenes (media de 55,02 % ± 1,03 en tres semillas). Es un modelo pequeño, ligero y de licencia Apache 2.0, adecuado para experimentación y comparación, no para producción de alta precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura con bloques ConvNeXt y capa de clasificación lineal) |
| Parametros totales | 8.558.410 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada 224x224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ConvNeXt V2 de variante "pico", una red convolucional pura que moderniza el diseño de ResNet con convoluciones depthwise de mayor kernel, normalización LayerNorm y activaciones GELU, además del mecanismo GRN (Global Response Normalization) introducido en ConvNeXt V2. El backbone procede de `facebook/convnextv2-pico-1k-224`, preentrenado en ImageNet-1K, y se mantiene completamente congelado durante el ajuste, incluidas las estadísticas de sus capas de normalización. La única parte entrenada es una cabeza lineal de diez salidas que se añade sobre las características del backbone.

El entrenamiento usa Galaxy10 DECaLS (17.736 imágenes en total). El split público de test (1.774 imágenes) se reserva como test retenido; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas solo para seleccionar la época. La receta, idéntica para los 40 backbones de la colección, es AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio. En evaluación se redimensiona y recorta al centro a 224x224 px y se aplica la normalización del image processor del checkpoint.

La innovación destacable no está en la arquitectura sino en el protocolo experimental: el régimen *head-only* aísla la calidad de las representaciones preentrenadas, de modo que las diferencias entre backbones reflejan su transferibilidad y no el efecto de recetas de ajuste específicas. La selección de época se hace por mínima pérdida de validación (época 30 en esta semilla). El autor reporta una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden al 100 % con los logits guardados, con diferencia absoluta máxima de 6,68e-06.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante un backbone ConvNeXt V2 preentrenado en ImageNet-1K (congelado en este checkpoint).
- Inferencia determinista y reproducible en fp32 con el pipeline de `transformers` (`AutoModelForImageClassification`).
- Integración directa con `AutoImageProcessor` para el preprocesado (redimensionado, recorte central y normalización).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades más allá de la clasificación de imágenes.

## Casos de uso

- **Clasificación morfológica de galaxias en pipelines astronómicos**: el modelo recibe recortes de 224x224 px de imágenes DECaLS y devuelve una de 10 clases morfológicas; es útil como línea base rápida en estudios de morfología a gran escala gracias a sus 8,5 M de parámetros y su bajo coste de inferencia.
- **Referencia reproducible en investigación sobre transferencia**: al formar parte de una colección de 80 configuraciones con receta idéntica, permite comparar la transferibilidad de distintos backbones de visión a datos astronómicos sin reentrenar el extractor, lo que facilita la reproducibilidad de experimentos.
- **Prototipado y validación de datasets**: sirve para comprobar la calidad y el etiquetado de Galaxy10 DECaLS antes de invertir en modelos mayores; su accuracy del 54,57 % actúa como suelo de referencia frente al que medir mejoras.
- **Filtrado previo en catálogos astronómicos**: puede usarse como primer clasificador para descartar o priorizar imágenes antes de un análisis más costoso (espectroscopía o inspección humana), dado su reducido tamaño y su compatibilidad con `transformers`.
- **Educación y divulgación en astronomía computacional**: su simplicidad (backbone congelado más cabeza lineal) y su licencia Apache 2.0 lo hacen adecuado para talleres y cursos donde se explica el ajuste de modelos de visión a dominios científicos.
- **Base para experimentos de fine-tuning completo**: el checkpoint puede descongelarse y reentrenarse como punto de partida en estudios que comparen el régimen *head-only* con el ajuste completo, ya que el autor publica ambos regímenes en la misma colección.
- **Evaluación de robustez ante cambios de dominio**: al estar entrenado solo con aumentos mínimos (recorte y flip), es un candidato para medir cómo afectan perturbaciones o diferencias de instrumento a un clasificador de morfología.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 54,57 % |
| F1 ponderado (semilla 42, época 30 de 30) | 52,42 % |
| Accuracy media ± desviación típica (semillas 42, 1, 2) | 55,02 % ± 1,03 |
| F1 ponderado medio ± desviación típica (semillas 42, 1, 2) | 52,80 % ± 1,24 |

Evolución de la accuracy de test en la semilla 42 (selección por mínima pérdida de validación): 13,19 % en la época 1, 39,12 % en la época 3, 50,73 % en la época 9, 53,55 % en la época 17, 54,57 % en la época 30. El modelo converge pronto y la ganancia a partir de la época 20 es marginal (de 54,40 % a 54,57 %).

No se han publicado en la información disponible resultados de benchmarks estándar de visión (ImageNet, etc.) para este checkpoint adaptado, ni comparaciones numéricas con otros modelos de la colección.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 100-200 MB en fp32 para los 8,56 M de parámetros, más el overhead de activaciones de una única imagen de 224x224 px; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. También es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con PyTorch (probado con PyTorch 2.3.0 y transformers 4.37.2), exportación a ONNX o TorchScript para servir con `optimum` o FastAPI; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (head-only, ConvNeXt V2 pico) | 8,56 M | 224x224 px | 54,57 % (test, semilla 42) | Apache 2.0 | Hugging Face |
| Otros backbones de la colección Vision Foundation Models Benchmark (40 backbones, 2 regímenes) | variable | 224x224 px | no disponible en esta ficha | según backbone | Hugging Face (colección del autor) |
| `facebook/convnextv2-pico-1k-224` (modelo base) | ~9 M | 224x224 px | no aplica (ImageNet-1K, sin cabeza de galaxias) | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de resultados numéricos de otros clasificadores de morfología galáctica (por ejemplo, modelos especializados tipo Galaxy Zoo o Zoobot) que permitan una comparación cuantitativa fiable; se indica como no disponible.

## Limitaciones y advertencias

- Rendimiento limitado: 54,57 % de accuracy en 10 clases implica una tasa de error cercana al 45 %, insuficiente para la mayoría de aplicaciones científicas de producción sin revisión humana.
- Sesgos de dominio: el backbone se preentrenó en ImageNet-1K (imágenes naturales) y no se ajustó; la transferencia a imágenes astronómicas es parcial y puede favorecer clases morfológicamente sobrerrepresentadas o visualmente similares a objetos cotidianos.
- Desbalance de clases: aunque el split es estratificado, el F1 ponderado (52,42 %) es inferior a la accuracy, lo que sugiere un rendimiento desigual entre clases.
- Riesgo de sobreajuste al conjunto de validación en la selección de época: la curva de validación se aplana a partir de la época 20 y las diferencias entre épocas son pequeñas (variación de ~0,2 puntos), por lo que la elección de época es sensible al ruido.
- Limitaciones de idioma: no aplica, pero el modelo no procesa texto ni metadatos; solo imágenes.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base y el dataset Galaxy10 DECaLS pueden tener sus propias condiciones que conviene revisar por separado.
- Caveat de producción: el autor no publica cifras de latencia, calibración ni robustez ante cambios de instrumento o profundidad; la comprobación de integridad se limita a 96 imágenes de test.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false`; la comparación entre semillas muestra una desviación típica de ~1 punto, por lo que diferencias menores entre configuraciones no son significativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-pico-1k-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-pico-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones y métricas por época: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026): referencia citada en la model card, sin enlace directo disponible en la información proporcionada.
