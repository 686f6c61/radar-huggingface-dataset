# matthieulel/resnet101-galaxy10-decals-head-v2

## Resumen

`resnet101-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias, desarrollado por matthieulel como parte de la colección *Vision Foundation Models Benchmark*. El modelo parte de los pesos de `torchvision.models.resnet101` preentrenados en ImageNet-1k (variante `IMAGENET1K_V1`) y sustituye la cabeza final por una capa lineal de 10 salidas, entrenada sobre el conjunto Galaxy10 DECaLS. La adaptación se realizó mediante *head-only fine-tuning*: el backbone permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se optimiza la cabeza lineal.

El modelo resuelve una tarea de clasificación de 10 clases de morfología galáctica sobre imágenes del *Dark Energy Camera Legacy Survey* (DECaLS). Con 42.625.994 parámetros totales y un peso de repositorio de 0,2 GB, es un checkpoint ligero y fácil de desplegar, pensado más como punto de referencia reproducible dentro de un banco de pruebas de 80 configuraciones (40 backbones preentrenados × dos regímenes de adaptación) que como modelo de producción de alto rendimiento.

Su relevancia actual es metodológica: forma parte de un estudio sistemático sobre cómo se comportan los modelos fundacionales de visión cuando se aplican a datos astronómicos, bajo un protocolo de entrenamiento idéntico y controlado. La precisión obtenida (48,03 % en test) sitúa el listón de referencia para este backbone concreto en el régimen de solo cabeza, lo que permite comparar de forma justa con otros backbones y con el régimen de *full fine-tuning*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN ResNet-101 (torchvision, `IMAGENET1K_V1`) con cabeza lineal de 10 clases |
| Parámetros totales | 42.625.994 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224×224 px) |
| Tipos de cuantización | no disponible (pesos en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-101 estándar de torchvision: red convolucional residual con 101 capas, bloques *bottleneck* y conexiones residuales, seguida de *global average pooling* y una capa totalmente conectada. En este checkpoint, la `fc` original de 1000 clases se reemplaza por `nn.Linear(2048, 10)`. El backbone conserva los pesos de ImageNet-1k sin modificar, incluidos los parámetros de *running mean/var* de las capas `BatchNorm`, lo que garantiza que las activaciones sean idénticas a las del modelo base.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes en total, 10 clases). El split público de test (1.774 imágenes) se reservó como conjunto de evaluación *held-out*; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta fue idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, *gradient clipping* 1,0), learning rate 1e-4 con *schedule* lineal y 10 % de *warm-up*, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consistió en *random resized crop* a la resolución de entrada y *random horizontal flip*; en evaluación se aplica *resize* y *center crop* a 224×224 px con la normalización estándar de ImageNet. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (tarea `image-classification`).
- Extracción de características visuales genéricas a través del backbone ResNet-101 preentrenado en ImageNet-1k.
- Inferencia sobre imágenes RGB de 224×224 px con la normalización estándar de ImageNet.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso: es un clasificador puro, no un modelo generativo.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No incorpora *thinking mode*, visión generativa, audio ni otras modalidades.
- Verificación de integridad documentada: 100,0 % de predicciones idénticas a los logits guardados en las primeras 96 imágenes de test (diferencia absoluta máxima de 3,81e-06).

## Casos de uso

- **Clasificación morfológica preliminar en pipelines astronómicos**: el modelo puede etiquetar imágenes de DECaLS en una de 10 clases morfológicas como paso de triaje antes de una inspección visual humana, aprovechando su bajo coste computacional (42,6 M de parámetros) y su formato safetensors listo para cargar con torchvision.
- **Generación de etiquetas débiles para *weak supervision***: sus predicciones pueden emplearse como pseudoetiquetas para preentrenar o aumentar datasets de morfología galáctica de mayor tamaño, dado que el checkpoint es reproducible y su protocolo de entrenamiento está documentado al detalle.
- **Línea base en estudios comparativos de modelos fundacionales**: al formar parte de un banco de 80 configuraciones con receta idéntica, sirve como referencia controlada para medir la ganancia de otros backbones (ViT, ConvNeXt, DINOv2, etc.) en la misma tarea y con el mismo split.
- **Prototipado rápido en entornos con recursos limitados**: el modelo cabe holgadamente en cualquier GPU de consumo (peso de 0,2 GB en fp32) y puede ejecutarse en CPU para lotes pequeños, lo que facilita experimentos exploratorios sin infraestructura dedicada.
- **Docencia y reproducción de experimentos**: la model card incluye la receta completa, las métricas por época y los índices de los splits, lo que permite reproducir el resultado semilla a semilla en un curso o taller de *machine learning* aplicado a astronomía.
- **Filtrado de candidatos en estudios de morfología a gran escala**: integrado en un pipeline batch sobre catálogos DECaLS, puede priorizar imágenes para seguimiento espectroscópico o para análisis morfológico más costoso, aceptando su precisión moderada como filtro de primera etapa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el *model-index* de la model card (split de test de Galaxy10 DECaLS, 1.774 imágenes):

| Métrica | Semilla 42 (época 30, seleccionada) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 48,03 | 47,75 ± 0,35 |
| F1 ponderado (%) | 45,49 | 45,21 ± 0,41 |

No se han publicado en la información disponible resultados comparativos con otros backbones del mismo benchmark ni métricas por clase. Las cifras anteriores no están verificadas de forma independiente (`verified: false` en el model-index).

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0,2 GB para los pesos en fp32; con activaciones de un batch pequeño, menos de 1 GB en total.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no requiere GPU de datacenter.
- **GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida para lotes pequeños.
- **CPU**: viable para inferencia en lote; el coste por imagen es bajo pero notablemente mayor que en GPU.
- **Opciones de despliegue**: PyTorch nativo con torchvision y safetensors (procedimiento documentado en la model card); exportación a TorchScript u ONNX no documentada pero factible al ser una ResNet estándar. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de visión).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `resnet101-galaxy10-decals-head-v2` (este) | 42,6 M | 224×224 px | 48,03 % (test, semilla 42) | BSD-3-Clause | Hugging Face |
| Otros backbones del mismo benchmark (40 configuraciones) | no disponible | 224×224 px | no disponible en esta ficha | no disponible | colección *Vision Foundation Models Benchmark* |
| ResNet-50 con *head-only fine-tuning* sobre Galaxy10 DECaLS | no disponible | 224×224 px | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de modelos alternativos sobre el mismo split, por lo que la comparativa cuantitativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- **Precisión moderada**: un 48,03 % de accuracy en 10 clases implica que más de la mitad de las predicciones son incorrectas; no es adecuado como clasificador autónomo en producción sin revisión humana.
- **Régimen de solo cabeza**: el backbone está congelado, lo que limita la adaptación a las particularidades de las imágenes astronómicas; el *full fine-tuning* podría mejorar sustancialmente el rendimiento, pero no se documenta en esta ficha.
- **Riesgo de sesgo de clase**: no se publican métricas por clase ni matrices de confusión; las clases minoritarias podrían estar peor representadas pese a la estratificación del split.
- **Dominio restringido**: entrenado exclusivamente sobre Galaxy10 DECaLS; no se garantiza su comportamiento en imágenes de otros *surveys* (SDSS, Euclid, LSST) ni con otras resoluciones o bandas.
- **Sin capacidades generativas ni de texto**: no puede emplearse para *tool calling*, agentes, razonamiento multi-paso ni tareas multimodales.
- **Licencia BSD-3-Clause**: permisiva para uso comercial, pero exige conservar el aviso de copyright y la cláusula de no endorsamiento; conviene revisar también las condiciones de los pesos originales de torchvision (ImageNet-1k) y del dataset Galaxy10 DECaLS.
- **Resultados no verificados**: las métricas del model-index están marcadas como `verified: false`; la integridad del checkpoint se comprobó solo contra los logits guardados del propio autor.
- **Paper en revisión**: la referencia académica (*Astronomy and Computing*, versión revisada, 2026) aún no está publicada, por lo que la citación formal está pendiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/resnet101-galaxy10-decals-head-v2
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (en revisión; sin enlace público disponible)
