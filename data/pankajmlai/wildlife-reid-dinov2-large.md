# pankajmlai/wildlife-reid-dinov2-large

## Resumen

Wildlife DINOv2-L (Round 2) es un modelo de extracción de características de imagen especializado en re-identificación de animales salvajes (*wildlife re-identification*). Lo desarrolla el usuario `pankajmlai` y se distribuye bajo licencia Apache 2.0. Se trata de un fine-tuning del backbone DINOv2-L de Meta AI, concretamente del checkpoint `timm/vit_large_patch14_dinov2.lvd142m` publicado en la librería `timm`, adaptado para producir embeddings de identidad discriminativos entre individuos de una misma especie animal.

El modelo resuelve un problema clásico de visión por computador en ecología y conservación: dado un conjunto de imágenes de animales (cámaras trampa, fotoidentificación de fauna), determinar si dos imágenes corresponden al mismo individuo. A diferencia de un clasificador convencional, genera embeddings L2-normalizados de 1.024 dimensiones que se comparan por similitud coseno, lo que permite usar el modelo en modo *open-set* sin reentrenamiento cuando aparecen individuos nuevos.

Con 304,4 millones de parámetros (ViT-L/14), entrada fija de 518×518 píxeles y pesos en formato safetensors, es un modelo de tamaño medio que cabe en GPUs de consumo con cuantización o en GPUs profesionales sin ella. Su relevancia actual radica en que ofrece una alternativa Apache 2.0 a MegaDescriptor, el estándar de facto en re-identificación de fauna, con una dimensionalidad de embedding menor (1.024 frente a 1.536) y una resolución de entrada superior (518 frente a 384).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/14) basado en DINOv2, fine-tuneado para re-identificación animal |
| Parametros totales | 304.367.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 518×518 píxeles) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según el checkpoint de timm) |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `timm`) |
| Dimensión de embedding | 1.024 (L2-normalizado) |
| Resolución de entrada | 518×518 RGB, fija (no admite 384) |
| Normalización | ImageNet mean `(0.485, 0.456, 0.406)` / std `(0.229, 0.224, 0.225)` |
| Modelo base | `timm/vit_large_patch14_dinov2.lvd142m` |
| Tamaño del repo | 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo ViT-L/14 con 24 capas, dimensión oculta de 1.024 y 16 cabezas de atención, heredada del backbone DINOv2-L de Meta AI. DINOv2 se entrenó con aprendizaje autosupervisado (autodestilación con teacher-student, pérdida tipo DINO más iBOT) sobre un corpus curado de imágenes a gran escala, lo que produce representaciones visuales densas y transferibles sin necesidad de etiquetas. Sobre ese backbone, este checkpoint aplica un fine-tuning supervisado orientado a re-identificación de fauna, de modo que el espacio de embeddings se reorganiza para discriminar individuos concretos en lugar de categorías genéricas.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de *metric learning* como triplet loss, ArcFace o CircleLoss, aunque este tipo de fine-tunes para re-identificación suelen apoyarse en pérdidas métricas. Sí se documenta con precisión el pipeline de inferencia: entrada fija a 518×518 con redimensionado bilineal explícito, normalización ImageNet y salida de 1.024 dimensiones L2-normalizada. El autor advierte explícitamente de que la compatibilidad de API con `timm` no implica compatibilidad de preprocesado con MegaDescriptor: usar `resolve_model_data_config` + `create_transform` aplicaría por defecto un redimensionado bicúbico de borde corto más `CenterCrop(518)`, que no reproduce el transform evaluado.

## Capacidades

- Extracción de embeddings de imagen para re-identificación de individuos animales (misma especie, distintos ejemplares).
- Comparación por similitud coseno entre embeddings de consulta y galería, apta para búsqueda *open-set*.
- Recuperación top-k sobre galerías grandes mediante producto matricial de embeddings normalizados.
- Integración nativa con `timm` (`timm.create_model("hf-hub:pankajmlai/wildlife-reid-dinov2-large", pretrained=True)`).
- Integración con el ecosistema `wildlife-tools` (`ImageDataset`, `DeepFeatures`, `CosineSimilarity`, `KnnClassifier`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un extractor de características visuales.
- No soporta visión generativa, VQA ni captioning; únicamente produce un vector de características por imagen.

## Casos de uso

- **Fotoidentificación de fauna en proyectos de conservación**: el modelo permite construir una galería de embeddings de individuos conocidos (por ejemplo, tigres o ballenas fotoidentificadas) y consultar nuevas imágenes para asignar identidad mediante k-NN con similitud coseno, sin reentrenar cuando aparece un individuo nuevo.
- **Procesamiento de imágenes de cámaras trampa**: con entrada fija de 518×518 y lotes de 16 imágenes en GPU, se pueden embeber miles de capturas nocturnas o diurnas y agruparlas por individuo para estimar tamaños poblacionales y rangos de actividad.
- **Deduplicación de catálogos fotográficos de fauna**: al ser los embeddings comparables por coseno, se pueden detectar imágenes duplicadas o casi duplicadas del mismo ejemplar en archivos de museos, bancos de imágenes o repositorios de ciencia ciudadana.
- **Seguimiento de individuos a lo largo del tiempo**: re-embediendo galerías históricas y consultas nuevas con el mismo modelo se puede monitorizar la presencia recurrente de un animal en una reserva, siempre que se re-embeban todas las imágenes con este checkpoint (los embeddings no son intercambiables con MegaDescriptor).
- **Validación cruzada de anotaciones**: el modelo sirve para verificar etiquetas de identidad en datasets existentes, detectando posibles errores de anotación al comparar la identidad asignada con el vecino más cercano en el espacio de embeddings.
- **Sistemas de alerta temprana en fincas y reservas**: integrado en un pipeline de captura y extracción de características, permite disparar alertas cuando se detecta un individuo concreto (por ejemplo, un depredador recurrente) comparando el embedding de la nueva imagen con la galería de individuos vigilados.
- **Investigación en métricas de re-identificación**: al ser Apache 2.0 y estar basado en un backbone público, es útil como línea base reproducible para comparar pérdidas métricas o estrategias de aumento de datos en tareas de re-ID animal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de *rank-1*, *mAP* ni comparaciones cuantitativas con MegaDescriptor u otros modelos de re-identificación animal.

## Requisitos de hardware

- **VRAM estimada en fp32**: aproximadamente 1,3 GB solo para pesos (304 M parámetros × 4 bytes), más activaciones; con lotes de 16 imágenes a 518×518 se recomienda al menos 8-10 GB.
- **VRAM estimada en fp16**: aproximadamente 0,65 GB de pesos; con lotes moderados cabe en GPUs de 6-8 GB.
- **GPU recomendadas**: A100, H100, L40S o RTX 4090 para throughput alto; RTX 3090/4080 y A10G para producción moderada.
- **GPU de consumo**: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en fp16 con lotes pequeños; en GPUs de 4-6 GB conviene reducir el tamaño de lote.
- **Opciones de despliegue**: `timm` con PyTorch (vía `hf-hub:` o `local-dir:`), exportación a TorchScript/ONNX, y servicio mediante FastAPI o Triton. No se documentan integraciones con vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Dimensión de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wildlife DINOv2-L (este modelo) | 304,4 M | 518×518 | 1.024 | Apache 2.0 | Hugging Face (`pankajmlai/wildlife-reid-dinov2-large`) |
| MegaDescriptor-L-384 (`BVRA`) | no disponible en la información | 384×384 | 1.536 | no disponible en la información | Hugging Face (`BVRA/MegaDescriptor-L-384`) |
| MegaDescriptor-B (`BVRA`) | no disponible en la información | 224×224 | no disponible en la información | no disponible en la información | Hugging Face (`BVRA/MegaDescriptor-B-224`) |
| DINOv2-L base (`timm/vit_large_patch14_dinov2.lvd142m`) | 304,4 M | 518×518 (config por defecto de timm) | 1.024 | Apache 2.0 | Hugging Face / `timm` |

La comparación con MegaDescriptor se limita a los datos que la propia model card menciona: resolución de entrada, dimensionalidad de embedding y necesidad de re-embeddear galerías al migrar. No se dispone de métricas de rendimiento comparadas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Embeddings no intercambiables**: los vectores de este modelo no son compatibles con los de MegaDescriptor ni con los de DINOv2 base; hay que re-embeddear galerías y consultas completas al cambiar de modelo.
- **Resolución fija**: solo admite 518×518; alimentar 384×384 no está soportado y produce resultados incorrectos.
- **Preprocesado crítico**: usar `timm.data.resolve_model_data_config` + `create_transform` aplica por defecto redimensionado bicúbico y `CenterCrop`, que no reproducen el transform evaluado (bilineal cuadrado). El autor lo advierte explícitamente.
- **Pipeline de preparación completo**: el modelo se evaluó con un pipeline que corrige orientación EXIF, convierte a RGB, recorta cajas o máscaras, genera miniatura LANCZOS con preservación de aspecto y guarda JPEG a calidad 95; aplicar solo el transform online a imágenes crudas no reproduce ese pipeline.
- **Riesgo de sesgo de dominio**: al ser un fine-tune especializado, su rendimiento puede degradarse en especies, condiciones de iluminación o cámaras no representadas en el entrenamiento; no se documenta la composición del dataset.
- **Alucinación no aplica** en el sentido generativo, pero sí existe riesgo de falsos positivos en la asignación de identidad cuando las galerías son pequeñas o las imágenes de baja calidad.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero conviene revisar las obligaciones de atribución y las licencias del backbone DINOv2 subyacente.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados; para producción conviene validar con un conjunto propio antes de desplegar.
- **Sin soporte lingüístico**: no es un modelo de lenguaje; no debe usarse para tareas de texto, razonamiento o generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pankajmlai/wildlife-reid-dinov2-large
- Modelo base en `timm`: https://huggingface.co/timm/vit_large_patch14_dinov2.lvd142m
- MegaDescriptor-L-384 (referencia de migración): https://huggingface.co/BVRA/MegaDescriptor-L-384
- Repositorio `timm`: https://github.com/huggingface/pytorch-image-models
- Repositorio `wildlife-tools`: https://github.com/WildlifeDatasets/wildlife-tools
- DINOv2 (Meta AI): https://github.com/facebookresearch/dinov2
