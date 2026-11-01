# matthieulel/vit-large-patch16-224-galaxy10-decals-full-v2

## Resumen

`vit-large-patch16-224-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un Vision Transformer (ViT-Large) preentrenado por Google sobre ImageNet-21k y ajustado completamente (todos los parámetros actualizados) sobre el dataset Galaxy10 DECaLS, que agrupa imágenes astronómicas del Dark Energy Camera Legacy Survey en diez clases morfológicas.

El modelo resuelve una tarea clásica de astronomía observacional: clasificar automáticamente galaxias según su forma (espirales, elípticas, irregulares, etc.) a partir de recortes de 224x224 píxeles. Su relevancia radica en que forma parte de un estudio sistemático (80 configuraciones, 40 backbones) que compara modelos fundacionales de visión bajo un protocolo de evaluación común, lo que permite medir de forma reproducible la transferencia de representaciones preentrenadas al dominio astronómico.

Con 303 millones de parámetros, arquitectura transformer pura y licencia Apache 2.0, es un modelo de tamaño medio que cabe en GPU de consumo y que sirve tanto como herramienta de producción para pipelines de clasificación morfológica como baseline de referencia en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large, patch 16, resolución 224x224) |
| Parametros totales | 303.311.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors fp32 es convertible a fp16/int8 mediante herramientas estándar) |
| Idiomas soportados | no aplica (modelo de imagen; sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un ViT-Large estándar: transformer de 24 capas, dimensión oculta 1024, 16 cabezas de atención y parches de 16x16 píxeles sobre entradas de 224x224, lo que produce 196 tokens por imagen más el token de clase. Sobre el encoder se añade una única capa lineal de 10 salidas, una por clase morfológica de Galaxy10 DECaLS. El ajuste es completo (*full fine-tuning*), no un simple linear probing ni LoRA.

El entrenamiento usó el dataset Galaxy10 DECaLS (17.736 imágenes), dividido de forma estratificada en 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test reservado. La receta es idéntica para los 40 backbones del estudio: AdamW (betas 0.9/0.999, eps 1e-8, weight decay 0.1, gradient clipping 1.0), learning rate 5e-5 con schedule lineal y 10% de warm-up, batch efectivo de 256 (32 imágenes con acumulación de 8 pasos), 30 épocas, precisión fp32 con TF32 desactivado y una sola GPU. La aumentación se limita a random resized crop y flip horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 224x224. El checkpoint publicado corresponde a la época 9, seleccionada por mínima pérdida de validación (0.4721). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (Galaxy10 DECaLS).
- Extracción de características visuales de propósito general heredadas del preentrenamiento en ImageNet-21k.
- Inferencia sobre recortes de 224x224 píxeles con normalización estándar del image processor de ViT.
- Compatible con el pipeline `image-classification` de transformers y con endpoints de HuggingFace (`endpoints_compatible`).
- No soporta tool calling, agentes, generación de texto, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen puro.
- No dispone de modo *thinking*, visión generativa, audio ni salidas estructuradas más allá del vector de logits de 10 dimensiones.

## Casos de uso

- **Clasificación morfológica en pipelines de *survey* astronómico**: integrado como etapa de inferencia por lotes sobre recortes de DECaLS u otros surveys con preprocesado equivalente (resize y center crop a 224x224), permite etiquetar automáticamente miles de galaxias por GPU y priorizar la inspección visual humana.
- **Triaje y curado de catálogos**: usar la probabilidad de la clase predicha como medida de confianza para separar objetos de clasificación fiable de casos ambiguos que requieran revisión por astrónomos.
- **Baseline reproducible en investigación**: al formar parte de un benchmark de 40 backbones con protocolo y splits públicos, sirve como referencia contra la que comparar nuevos modelos fundacionales en tareas de morfología galáctica.
- **Extracción de *embeddings* para búsqueda por similitud**: los 1024 vectores del token de clase pueden indexarse para recuperar galaxias visualmente similares en un catálogo, útil en estudios de poblaciones morfológicas.
- **Aprendizaje por transferencia a subdominios**: reajustar la cabeza lineal (o hacer fine-tuning parcial) sobre muestras etiquetadas de otro instrumento o rango de redshift, aprovechando las representaciones ya adaptadas al dominio astronómico.
- **Control de calidad de datos de imagen**: detectar recortes anómalos o mal centrados comparando la distribución de predicciones con la esperada para el campo observado.
- **Docencia y divulgación**: desplegado en una GPU de consumo, permite demostrar en vivo la clasificación automática de galaxias con un script de pocas líneas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test reservado de Galaxy10 DECaLS (1.774 imágenes), en la época seleccionada (9 de 30, semilla 42):

| Metrica | Valor (%) |
|---|---|
| Accuracy (semilla 42, época seleccionada) | 83,60 |
| F1 ponderado (semilla 42, época seleccionada) | 83,40 |
| Accuracy media +/- desv. típica (3 semillas: 42, 1, 2) | 83,28 +/- 0,51 |
| F1 ponderado medio +/- desv. típica (3 semillas) | 83,09 +/- 0,50 |

Evolución relevante durante el entrenamiento (semilla 42): la accuracy de test sube de 72,89% en la época 1 a 81,00% en la época 3, alcanza 84,84% de F1 ponderado en la época 16 y termina en 84,61% en la época 30, lo que indica que la época 9 seleccionada por pérdida de validación no es la de mejor accuracy de test (la 16 alcanza 85,01%). El autor no publica comparaciones numéricas con otros backbones en esta model card; los datos completos de las 80 configuraciones están en el dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware

- **VRAM en fp32**: aproximadamente 1,3 GB solo para pesos (303 M parámetros x 4 bytes), más activaciones; en la práctica, entre 2 y 4 GB según el tamaño de lote.
- **VRAM en fp16/bf16**: alrededor de 0,7 GB de pesos; inferencia cómoda por debajo de 2 GB con lotes pequeños.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Para entrenamiento con batch efectivo 256 en fp32, el autor usó una sola GPU (modelo no especificado).
- **GPU de consumo**: sí, cabe en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida para lotes de una imagen.
- **Despliegue**: transformers (`AutoModelForImageClassification`), TorchServe, Triton Inference Server, ONNX Runtime tras exportación, o endpoints de HuggingFace. No hay pesos GGUF publicados, aunque la conversión a ONNX o a formatos cuantizados es directa al ser un ViT estándar.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput de varios cientos a miles de imágenes por segundo en una A100 con lotes grandes, pero esta cifra no está verificada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-large-patch16-224-galaxy10-decals-full-v2 (este) | 303 M | 224x224 px | 83,60% (test, semilla 42) | Apache 2.0 | HuggingFace |
| google/vit-large-patch16-224 (base sin ajustar) | 304 M | 224x224 px | no disponible (requiere ajuste) | Apache 2.0 | HuggingFace |
| Otros backbones del mismo benchmark (39 restantes) | variable | 224x224 px | no disponible en esta ficha; datos en `vision-foundation-models-benchmark-runs` | variable | HuggingFace |

La comparación cuantitativa con alternativas concretas (ResNet, ConvNeXt, DINOv2, CLIP) no está disponible en la información proporcionada; el autor remite al dataset de resultados del benchmark para consultar las 80 configuraciones.

## Limitaciones y advertencias

- **Dominio restringido**: el modelo solo predice las 10 clases de Galaxy10 DECaLS; no es un clasificador astronómico general ni reconoce morfologías fuera de ese esquema.
- **Riesgo de alucinación de clase**: al ser un clasificador cerrado, siempre asigna una de las 10 etiquetas con cierta probabilidad, incluso ante imágenes que no son galaxias o recortes corruptos; es necesario umbralizar la confianza.
- **Selección de época subóptima para accuracy**: el checkpoint publicado se eligió por mínima pérdida de validación (época 9), pero la accuracy de test es superior en épocas posteriores (hasta 85,01% en la época 16), por lo que el rendimiento reportado no es el máximo alcanzable.
- **Sesgos del dataset**: Galaxy10 DECaLS hereda los sesgos de selección del survey (cielo observable, rangos de redshift, sesgo morfológico hacia espirales y elípticas bien resueltas); el rendimiento puede degradarse en galaxias débiles, lejanas o con bajo contraste.
- **Dependencia del preprocesado**: los resultados solo son reproducibles con el pipeline exacto (resize y center crop a 224x224, normalización del image processor); otros preprocesados alteran las predicciones.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el paper asociado está en revisión y la cita aún no está disponible.
- **Verificación de benchmarks**: las métricas están marcadas como `verified: false` en el model-index; proceden del autor y no de una evaluación independiente.
- **Sin cuantizaciones oficiales**: no hay pesos GGUF, ONNX ni int8 publicados por el autor; cualquier despliegue optimizado requiere conversión propia y validación.
- **Idioma y texto**: el modelo no procesa texto ni tiene capacidades multilingües; no debe usarse en tareas de NLP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/vit-large-patch16-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-large-patch16-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de resultados del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (en revisión; cita pendiente de publicación)
