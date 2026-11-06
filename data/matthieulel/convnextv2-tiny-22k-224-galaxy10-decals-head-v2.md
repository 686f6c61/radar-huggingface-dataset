# matthieulel/convnextv2-tiny-22k-224-galaxy10-decals-head-v2

## Resumen

`convnextv2-tiny-22k-224-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. El modelo adapta el backbone `facebook/convnextv2-tiny-22k-224` al dataset Galaxy10 DECaLS (10 clases morfológicas) mediante un régimen de *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una cabeza lineal de 10 salidas.

El modelo resuelve un problema concreto de astronomía observacional: la clasificación automática de morfologías galácticas en imágenes del sondeo DECaLS. Forma parte de un estudio sistemático de 80 configuraciones (40 backbones preentrenados x dos regímenes de adaptación) descrito en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), lo que lo convierte en un punto de referencia reproducible para evaluar hasta qué punto los modelos de visión preentrenados transfieren a datos astronómicos.

Arquitectónicamente es un ConvNeXt V2 tiny (familia convolucional pura, sin atención), con 27,87 millones de parámetros totales y entrada de 224x224 px. Su relevancia actual es metodológica: demuestra que un ajuste mínimo de una cabeza lineal sobre un backbone congelado alcanza un 59,19 % de accuracy en un problema de 10 clases, estableciendo una línea base clara y barata computacionalmente para la comunidad astronómica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, sin mecanismos de atención) |
| Parametros totales | 27.874.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (clasificación de imágenes; sin capacidades de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 tiny, una red convolucional jerárquica que incorpora en su preentrenamiento original la técnica FCMAE (*Fully Convolutional Masked Autoencoder*) y la normalización GRN (*Global Response Normalization*), aunque en este checkpoint el backbone está congelado y no se ha reentrenado. Sobre él se añade una única capa lineal con 10 salidas que constituye el único componente entrenado. El repositorio contiene el modelo completo: pesos del backbone original más la cabeza entrenada.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con una partición estratificada por clase de 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test (el split público de test se mantiene como conjunto held-out). La receta es idéntica para los 40 backbones del estudio: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batch efectivo de 256 imágenes (32 por paso con acumulación de 8), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. Aumentación limitada a random resized crop y flip horizontal aleatorio; evaluación con resize y center crop a 224x224 px más la normalización del image processor del checkpoint base. La época seleccionada es la de mínima pérdida de validación (época 30). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ConvNeXt V2 tiny congelado (utilizable como extractor para otras tareas astronómicas).
- Inferencia determinista y ligera: 27,87 M de parámetros, adecuada para ejecución en CPU o GPU de gama baja.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas ni agentes.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo *thinking* ni de salidas estructuradas más allá de los logits de clasificación.

## Casos de uso

- Clasificación morfológica automatizada en pipelines de reducción de datos astronómicos: el modelo puede procesar recortes de 224x224 px de imágenes DECaLS y asignar una de las 10 clases morfológicas, integrándose en flujos de *preprocessing* previos a la inspección visual humana.
- Etiquetado asistido para *citizen science*: usar las predicciones como propuesta inicial en plataformas de clasificación colaborativa (estilo Galaxy Zoo), reduciendo el esfuerzo de los voluntarios en las clases más frecuentes.
- Línea base reproducible para investigación en *transfer learning* astronómico: al formar parte de un benchmark de 80 configuraciones con receta idéntica, sirve para comparar el rendimiento de otros backbones bajo el mismo protocolo (head-only vs. fine-tuning completo).
- Filtrado y priorización de candidatos: descartar automáticamente imágenes con morfología clara (por ejemplo, elípticas frente a espirales) antes de análisis más costosos como espectroscopía o ajuste de perfiles de brillo.
- Extracción de *embeddings* para agrupamiento no supervisado: el backbone congelado puede emplearse para generar representaciones vectoriales de galaxias y aplicar clustering o búsqueda de similitud en catálogos.
- Docencia y divulgación: modelo pequeño (0,1 GB de repositorio) y de inferencia rápida que permite demostrar en un cuaderno interactivo cómo un modelo de visión genérico se adapta a un dominio científico con un coste mínimo de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, epoca seleccionada) | 59,19 % |
| Weighted F1 (seed 42, epoca seleccionada) | 56,92 % |
| Accuracy media +/- desv. tip. (seeds 42, 1, 2) | 59,04 +/- 0,31 % |
| Weighted F1 media +/- desv. tip. (seeds 42, 1, 2) | 56,72 +/- 0,23 % |

Evolución de la métrica principal en la seed 42: la accuracy de test pasa de 20,24 % en la época 1 a 59,19 % en la época 30, con una meseta a partir de la época 22 (59,02 %) y sin signos claros de sobreajuste en la pérdida de validación (1,1868 en la época 30). No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (27,87 M de parámetros, aproximadamente 111 MB de pesos); en fp16 alrededor de 56 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100, H100 y GPUs integradas modestas.
- Cabe holgadamente en GPU de consumo; también es viable en CPU para lotes pequeños (el backbone ConvNeXt V2 tiny es una red convolucional ligera).
- Opciones de despliegue: transformers con PyTorch (vía `AutoModelForImageClassification`), exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; no se documentan pesos GGUF para llama.cpp ni soporte específico de vLLM/TGI (orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de resultados de otros backbones del mismo benchmark en la información proporcionada, por lo que la comparación numérica directa no está disponible. A modo de contexto estructural:

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| convnextv2-tiny-22k-224-galaxy10-decals-head-v2 | 27,87 M | 224x224 px | Clasificación de 10 clases galácticas | Apache 2.0 | Hugging Face |
| facebook/convnextv2-tiny-22k-224 (base) | ~28 M | 224x224 px | Clasificación ImageNet-1k (1.000 clases) | Apache 2.0 | Hugging Face |
| Otros backbones del benchmark (40 configuraciones) | no disponible | no disponible | Misma tarea Galaxy10 DECaLS | no disponible | Colección Vision Foundation Models Benchmark |

## Limitaciones y advertencias

- Accuracy moderada: 59,19 % en 10 clases implica una tasa de error del 40,81 %; no es adecuado como clasificador autónomo en producción científica sin revisión humana.
- Sesgos potenciales derivados del dataset Galaxy10 DECaLS: la distribución de clases y las condiciones de observación del sondeo pueden no representar otros *surveys* (SDSS, Euclid, LSST), lo que limita la generalización fuera de dominio.
- Riesgo de confusión entre clases morfológicamente próximas (por ejemplo, espirales barradas frente a no barradas); el F1 ponderado (56,92 %) es inferior a la accuracy, lo que sugiere desequilibrio en el rendimiento por clase.
- Solo se ha entrenado la cabeza lineal: el backbone no se ha adaptado al dominio astronómico, por lo que las representaciones pueden no capturar características específicas de galaxias de bajo brillo superficial.
- Entrada fija de 224x224 px tras resize y center crop: objetos extensos o con estructuras finas pueden perder información en el reescalado.
- Sin capacidades de texto, tool calling ni agentes; no debe emplearse fuera de la clasificación de imágenes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al dataset de evaluación.
- Los resultados del benchmark están declarados por el autor (`verified: false`) y el artículo asociado está en revisión, por lo que las cifras deben tratarse como preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-tiny-22k-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-tiny-22k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (citación pendiente de publicación; no se proporciona URL en la información disponible)
