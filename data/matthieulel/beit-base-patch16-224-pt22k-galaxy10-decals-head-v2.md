# matthieulel/beit-base-patch16-224-pt22k-galaxy10-decals-head-v2

## Resumen

`beit-base-patch16-224-pt22k-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por matthieulel como parte de la colección *Vision Foundation Models Benchmark*. Consiste en el backbone BEiT-Base preentrenado por Microsoft (`microsoft/beit-base-patch16-224-pt22k`) adaptado al dataset Galaxy10 DECaLS (10 clases morfológicas) mediante *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una cabeza lineal de 10 salidas.

El modelo resuelve una tarea acotada de clasificación astronómica sobre recortes de 224x224 px. Su interés no reside en el rendimiento absoluto, sino en su papel como punto de referencia reproducible dentro de un estudio sistemático que compara 40 backbones de visión bajo dos regímenes de adaptación, con protocolo de entrenamiento idéntico y métricas por época publicadas. La arquitectura es un transformer ViT-style (BEiT) con parches de 16x16, 85,67 millones de parámetros totales y una ventana de entrada fija de 224x224 px.

Los resultados son modestos: 28,35 % de accuracy y 24,17 % de F1 ponderado en el conjunto de test retenido (1.774 imágenes), frente a un azar del 10 % en 10 clases. El modelo es relevante ahora como artefacto de investigación auditable (verificación de integridad al 100 % sobre 96 imágenes de test) y no como solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT-Base (transformer ViT-style, patch size 16x16) |
| Parametros totales | 85.673.818 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 224x224 px |
| Tipos de cuantizacion | no disponible (repo en safetensors fp32) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño de repo 0,3 GB) |

## Arquitectura y entrenamiento

El backbone es BEiT-Base con parches de 16x16 y resolución de entrada de 224x224, preentrenado por Microsoft sobre ImageNet-22k (`pt22k`). Sobre él se añade una única capa lineal con diez salidas que corresponde a las diez clases morfológicas de Galaxy10 DECaLS. Durante el entrenamiento el backbone permanece completamente congelado, incluidas las estadísticas de normalización, de modo que solo se optimizan los pesos de la cabeza lineal.

El protocolo es común a los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 con acumulación en 8 pasos (batch efectivo 256), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. La aumentación se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se aplica resize y center crop a 224x224 con la normalización del image processor del checkpoint. Los datos se reparten en 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test, con estratificación por clase; la validación se usa únicamente para seleccionar la época (29 de 30, mínimo de pérdida de validación). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre recortes de 224x224 px.
- Inferencia determinista y reproducible: verificación de integridad con predicciones idénticas al 100 % sobre las primeras 96 imágenes de test (diferencia máxima absoluta de logits 6,91e-06).
- Extracción de logits por clase, apta para umbralizado o análisis de confianza posterior.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.
- No ofrece capacidades multilingües: la salida es un vector de 10 logits sin semántica lingüística.
- No es un modelo generativo ni un modelo de propósito general: está especializado en una única tarea y un único dataset.

## Casos de uso

- Clasificación morfológica preliminar en pipelines astronómicos: el modelo puede etiquetar recortes de galaxias en 10 clases como paso de triaje antes de la inspección humana, aprovechando su inferencia ligera (85,7 M de parámetros) y su formato safetensors listo para `transformers`.
- Reproducción de experimentos del benchmark: al estar acompañado de métricas por época, semillas y splits publicados, sirve para replicar el protocolo de *head-only fine-tuning* y comparar contra los otros 39 backbones de la colección.
- Baseline en estudios de adaptación de foundation models: útil para medir cuánto rinde un backbone congelado frente a un fine-tuning completo en una tarea de dominio específico con pocos datos etiquetados.
- Docencia y formación en visión por computador aplicada a astronomía: ejemplo completo y verificable de transferencia de aprendizaje con backbone congelado, con código de inferencia mínimo en la model card.
- Auditoría de integridad de checkpoints: el modelo incluye una comprobación numérica reproducible (máxima diferencia de logits 6,91e-06) útil como referencia para validar pipelines de carga de pesos.
- Filtrado de candidatos en catálogos masivos: dado su bajo coste computacional, puede aplicarse por lotes a recortes de surveys para separar clases mayoritarias de minoritarias antes de un análisis más costoso.
- Análisis de calibración y matrices de confusión: sus 10 logits permiten estudiar el comportamiento del backbone BEiT en clases desbalanceadas, un caso frecuente en datos astronómicos reales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index, sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época seleccionada 29) | 28,35 % |
| F1 ponderado (semilla 42, época seleccionada 29) | 24,17 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 28,34 +/- 0,31 % |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 23,78 +/- 0,65 % |

Evolución de la accuracy de test en la semilla 42 (extracto): época 1, 12,97 %; época 10, 24,35 %; época 20, 28,18 %; época 25, 28,41 %; época 29 (seleccionada), 28,35 %; época 30, 28,24 %. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (85,7 M de parámetros), más el espacio de activaciones para un batch de imágenes de 224x224; por debajo de 1 GB en la práctica para batches pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo, incluidos portátiles con GPU integrada de gama media y aceleradores tipo Apple Silicon.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` (soporte nativo, tag `endpoints_compatible`), exportación a ONNX o TorchScript para servicios de inferencia; no se documenta soporte GGUF ni llama.cpp para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera inferencia en el orden de milisegundos por imagen en GPU moderna, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (BEiT-Base, head-only) | 85,7 M | 224x224 px | Accuracy 28,35 %, F1 24,17 % | Apache 2.0 | HuggingFace |
| Resto de backbones del benchmark (39 configuraciones) | no disponible | no disponible | Resultados en el dataset `vision-foundation-models-benchmark-runs` | no disponible | HuggingFace |
| Fine-tuning completo del mismo backbone | 85,7 M | 224x224 px | no disponible en la información proporcionada | Apache 2.0 (modelo base) | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada; la comparación cuantitativa debe consultarse en el dataset de runs del autor.

## Limitaciones y advertencias

- Rendimiento bajo en términos absolutos: 28,35 % de accuracy en 10 clases, lejos de un uso fiable sin supervisión humana.
- El régimen *head-only* congela el backbone, lo que limita la adaptación a las particularidades del dominio astronómico; un fine-tuning completo podría mejorar, pero no se aportan datos.
- El modelo está entrenado exclusivamente sobre Galaxy10 DECaLS; no se garantiza generalización a otros surveys, bandas fotométricas o resoluciones.
- La selección de época se hace sobre validación, pero la variabilidad entre semillas (desviación típica de 0,31 puntos de accuracy) indica sensibilidad al inicializado y al orden de los datos.
- Riesgo de sesgo hacia las clases mayoritarias del dataset: el F1 ponderado (24,17 %) es inferior a la accuracy, lo que sugiere bajo rendimiento en clases minoritarias.
- No apto para generación de texto, razonamiento, código ni tareas multimodales; su uso fuera de la clasificación morfológica de galaxias no está soportado.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero debe verificarse la licencia del dataset Galaxy10 DECaLS y del checkpoint base de Microsoft para despliegues en producción.
- El paper asociado está en revisión en *Astronomy and Computing* (versión revisada, 2026); la cita definitiva no está disponible.
- No se documentan cuantizaciones oficiales ni pruebas de robustez ante imágenes corruptas, recortes descentrados o ruido instrumental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/beit-base-patch16-224-pt22k-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/beit-base-patch16-224-pt22k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs y métricas por época: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (en revisión; sin enlace disponible)
