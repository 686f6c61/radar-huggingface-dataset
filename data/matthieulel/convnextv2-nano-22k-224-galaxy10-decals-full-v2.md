# matthieulel/convnextv2-nano-22k-224-galaxy10-decals-full-v2

## Resumen

`convnextv2-nano-22k-224-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes desarrollado por el usuario matthieulel (sin afiliación institucional declarada en la model card) que adapta el backbone `facebook/convnextv2-nano-22k-224` a la clasificación morfológica de galaxias sobre el dataset Galaxy10 DECaLS, con 10 clases de salida. Forma parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) publicada bajo el marco del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo resuelve una tarea concreta de visión por computador aplicada a astronomía: asignar una etiqueta morfológica a imágenes de galaxias procedentes del sondeo DECaLS. Se trata de un fine-tuning completo (todos los parámetros actualizados) del ConvNeXt V2 nano, una CNN moderna de tipo transformerizado con 14,99 millones de parámetros y resolución de entrada de 224x224 píxeles. No es un modelo generativo ni multimodal: es un clasificador de 10 clases.

Su relevancia es metodológica y de referencia: ofrece un punto de comparación reproducible y con protocolo idéntico frente a otros 39 backbones de visión, con métricas por época, semillas y particiones documentadas públicamente. La licencia Apache 2.0 y el tamaño reducido (0,1 GB) lo hacen trivial de desplegar en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN con bloques ConvNeXt y capa de normalización/GRN), backbone `facebook/convnextv2-nano-22k-224` |
| Parámetros totales | 14.989.210 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 px) |
| Tipos de cuantización | no disponible (el autor solo documenta entrenamiento e inferencia en fp32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 nano, preentrenado por Facebook (Meta) en ImageNet-22k y afinado después en ImageNet-1k a 224x224. La cabeza original se sustituye por una única capa lineal con diez salidas, correspondientes a las clases morfológicas de Galaxy10 DECaLS. El régimen es de *full fine-tuning*: se actualizan los 14,99 millones de parámetros, sin congelar bloques ni usar adaptadores.

El protocolo de entrenamiento está documentado con detalle y es idéntico para los 40 backbones del benchmark. Datos: Galaxy10 DECaLS con 17.736 imágenes, divididas de forma estratificada en 14.188 de entrenamiento, 1.774 de validación y 1.774 de test (la partición pública de test actúa como conjunto held-out). Optimizador AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de gradiente 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10 % de warm-up, batch efectivo de 256 (32 imágenes con acumulación de 8 pasos), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. Aumentación: recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio. Evaluación: redimensionado y recorte central a 224x224 con la normalización del image processor del checkpoint. La selección de época se hace por mínima pérdida de validación (época 16 en la semilla 42). Software: PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

El autor incluye una comprobación de integridad: el modelo recargado desde el repositorio reproduce las predicciones guardadas de la época seleccionada en el 100 % de las primeras 96 imágenes de test, con una diferencia absoluta máxima de logits de 1,08e-05.

## Capacidades

- Clasificación de imágenes en 10 clases morfológicas de galaxias (Galaxy10 DECaLS).
- Extracción de características visuales de imágenes astronómicas de 224x224 px mediante el backbone ConvNeXt V2 nano.
- Inferencia determinista y reproducible: pesos fijados a la época 16 de la semilla 42.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo *thinking*, ni visión general, ni audio: es un clasificador cerrado de 10 clases.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en pipelines de sondeos: el modelo asigna una de las 10 clases de Galaxy10 DECaLS a recortes de 224x224 px procedentes de DECaLS, con un 84,72 % de accuracy en test, suficiente para preetiquetar grandes volúmenes y reservar la revisión humana a los casos de baja confianza.
- Baseline reproducible en investigación astronómica: al venir con protocolo, semillas y particiones documentadas, sirve como referencia contra la que comparar nuevos backbones o estrategias de adaptación (por ejemplo, linear probing frente a full fine-tuning) sin reentrenar desde cero.
- Filtrado y triaje de catálogos: integrado en un pipeline de ingesta, permite separar morfologías mayoritarias (elípticas, espirales) de minoritarias para priorizar inspección visual o seguimiento espectroscópico.
- Etiquetado asistido para *active learning*: las predicciones del modelo pueden preseleccionar candidatos ambiguos que un astrónomo etiqueta manualmente, reduciendo el coste de anotación en nuevos conjuntos.
- Despliegue en hardware de borde o estaciones modestas: con 14,99 M de parámetros y 0,1 GB de pesos en fp32, cabe en una GPU de consumo e incluso en CPU para lotes pequeños, lo que permite ejecutarlo junto al telescopio o en un nodo sin acelerador dedicado.
- Docencia y divulgación: ejemplo completo y ligero de fine-tuning de un backbone moderno sobre datos astronómicos, con métricas por época publicadas, útil para cursos de aprendizaje profundo aplicado.
- Validación cruzada de morfología visual: combinado con clasificadores entrenados en otros sondeos, permite estudiar discrepancias sistemáticas entre etiquetas y detectar sesgos en los catálogos de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`), sobre el test held-out de Galaxy10 DECaLS con 1.774 imágenes:

| Métrica | Este checkpoint (semilla 42, época 16 de 30) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 84,72 | 85,12 ± 0,34 |
| F1 ponderado (%) | 84,58 | 84,89 ± 0,34 |

Evolución seleccionada del entrenamiento (semilla 42): la accuracy de test pasa de 48,08 % en la época 1 a 84,72 % en la época 16 (seleccionada por mínima pérdida de validación, 0,4454) y alcanza un máximo de 85,57 % en las épocas 29 y 30, con F1 ponderado de 85,48 y 85,46 respectivamente. La pérdida de validación se estabiliza en torno a 0,45 a partir de la época 20.

No se han publicado en la información disponible resultados comparativos frente a otros backbones del mismo benchmark ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para lotes pequeños (14,99 M de parámetros, unos 60 MB de pesos); con lote de 32 imágenes a 224x224 el consumo se mantiene en el rango de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para esta carga.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con PyTorch (vía `AutoModelForImageClassification`), exportación a ONNX Runtime o TorchScript, y servidores de inferencia compatibles con el pipeline `image-classification` de Hugging Face (endpoints compatibles según los tags del repositorio).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|---|
| Este modelo (ConvNeXt V2 nano, full fine-tuning) | 14,99 M | 224x224 | 10 clases | 84,72 % (test, semilla 42) | Apache 2.0 |
| `facebook/convnextv2-nano-22k-224` (backbone base) | 14,99 M | 224x224 | 1.000 clases ImageNet | no disponible | Apache 2.0 |
| Otros backbones del mismo benchmark (39 restantes) | no disponible | 224x224 | 10 clases | no disponible en esta ficha | variable |
| Alternativas de la misma categoría (p. ej., ViT-B/16 o ResNet-50 afinados en Galaxy10) | no disponible | no disponible | 10 clases | no disponible | no disponible |

La información proporcionada no incluye los resultados de los otros 39 backbones del benchmark ni de clasificadores alternativos sobre Galaxy10 DECaLS, por lo que la comparación cuantitativa con modelos similares no está disponible.

## Limitaciones y advertencias

- Modelo cerrado de 10 clases: no generaliza a morfologías fuera del esquema de Galaxy10 DECaLS ni a otras resoluciones o sondeos sin reentrenamiento.
- Rendimiento moderado: 84,72 % de accuracy implica aproximadamente un 15 % de error en test; un porcentaje relevante de galaxias se clasificará de forma incorrecta, especialmente en clases minoritarias o morfologías ambiguas.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false` y proceden del propio autor; no hay validación independiente.
- Riesgo de sesgo de dominio: entrenado exclusivamente con imágenes DECaLS; el rendimiento puede degradarse con datos de otros instrumentos, condiciones de seeing distintas o recortes con distinta escala.
- Sin información sobre sesgos demográficos ni de otro tipo: la model card no documenta análisis de sesgo por clase ni matrices de confusión.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base y el dataset subyacente pueden tener sus propias condiciones que conviene revisar.
- Sin soporte de texto, tool calling ni agentes: no debe plantearse como sustituto de un modelo multimodal en pipelines que requieran razonamiento o interacción.
- Reproducibilidad dependiente de la partición: los índices de train/validación/test están en un repositorio de dataset externo; sin ellos, las cifras no son reproducibles de forma exacta.
- Fecha de creación del repositorio (2026-10-30) y artículo aún en revisión: la citación definitiva no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-nano-22k-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-nano-22k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Métricas por época y particiones: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección del benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing (versión revisada, 2026); citación pendiente de publicación.
