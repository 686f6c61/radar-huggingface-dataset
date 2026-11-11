# fireviewer/convnext-tiny-alert-categories

## Resumen

ConvNeXt-Tiny · six catégories d'alerte es un modelo de visión por computador desarrollado por el usuario fireviewer, orientado a la clasificación de imágenes en seis categorías relacionadas con incendios y su origen. Se trata de un fine-tuning de la arquitectura ConvNeXt-Tiny sobre un corpus propio denominado `fireviewer_fire_smoke_flame_v3_native`, y su propósito declarado es servir como clasificador de alertas dentro del ecosistema FireViewer.

El modelo se distribuye con licencia BSD-3-Clause y un tamaño de repositorio de 0,3 GB, lo que es coherente con un ConvNeXt-Tiny en precisión completa o mixta (aproximadamente 28 millones de parámetros). La model card indica explícitamente que el estado del entrenamiento es **interrupted** (interrumpido), es decir, el proceso de entrenamiento no finalizó según lo previsto, aunque se conservan los checkpoints `best` y `last` de aquellas épocas que llegaron a evaluarse.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, sin descargas ni interacciones en el momento de la consulta, publicado en noviembre de 2026, y cuya documentación es muy escasa (sin resultados de benchmarks publicados, sin información sobre idiomas ni pipeline declarado). Resulta útil como referencia para quien quiera reproducir o continuar el entrenamiento, pero no debe considerarse un modelo listo para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (red convolucional pura, familia ConvNeXt) |
| Parámetros totales | no disponible en la información proporcionada (ConvNeXt-Tiny estándar: ~28 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (el repositorio contiene checkpoints de entrenamiento; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt-Tiny, una red neuronal convolucional pura inspirada en el diseño de los transformers visuales (ViT), que moderniza el bloque ResNet con convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU e inversión de cuello de botella. Es un backbone ampliamente utilizado para clasificación de imágenes por su buena relación entre precisión y coste computacional.

El entrenamiento se realizó sobre el corpus `fireviewer/fireviewer_fire_smoke_flame_v3_native`, en la revisión `8c8b197fa1c928217529a04bff434fb70a66614e`, con seis clases: `human_useful_fire`, `domestic_origin`, `suspect_origin`, `fire_road_urban`, `forest_natural_area_wildfire` y `negative`. La model card remite a los ficheros `data_receipt.json`, `gpu.json`, `training_setup.json` y a las métricas de validación/test para los detalles del proceso, pero no se incluyen en la información disponible el número de tokens (equivalentemente, número de imágenes), la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino con RLHF/DPO (no aplicable en clasificación de imágenes). El estado declarado es **interrupted**, lo que implica que el modelo puede no haber convergido y que los checkpoints conservados corresponden solo a épocas evaluadas.

## Capacidades

- Clasificación de imágenes en seis categorías de alerta relacionadas con incendios y su origen (fuego útil humano, origen doméstico, origen sospechoso, fuego en carretera/urbano, incendio forestal natural y negativo).
- Salida de etiqueta única por imagen (clasificación multiclase), según las clases declaradas en la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-step (no aplica a un clasificador de imágenes).
- No se documenta capacidad multilingüe ni procesamiento de texto.
- No se documenta modo thinking, visión generativa, audio ni otras capacidades especiales.
- No se documenta detección de objetos ni segmentación; la tarea es clasificación de imagen completa.

## Casos de uso

- Triaje de alertas en plataformas de vigilancia de incendios: el modelo puede clasificar capturas o frames recibidos de cámaras y sensores para etiquetar el tipo de evento (por ejemplo, `forest_natural_area_wildfire` frente a `negative`) y priorizar la revisión humana. Es adecuado por su bajo coste computacional como ConvNeXt-Tiny, aunque requiere validación previa dado el estado interrumpido del entrenamiento.
- Filtrado de falsos positivos en sistemas de alerta temprana: la clase `negative` permite descartar imágenes sin incendio antes de enviarlas a un operador, reduciendo la carga de revisión manual.
- Clasificación del origen probable del fuego en informes post-evento: las clases `domestic_origin` y `suspect_origin` permiten etiquetar imágenes para análisis forense o estadístico, siempre que se valide la precisión por clase.
- Enrutamiento de imágenes a equipos especializados: las clases `fire_road_urban` y `forest_natural_area_wildfire` permiten dirigir la alerta al equipo de extinción o al servicio forestal correspondiente.
- Investigación y reproducción académica: al estar publicado con licencia BSD-3-Clause y checkpoints conservados, sirve como punto de partida para continuar el entrenamiento o comparar arquitecturas convolucionales en tareas de clasificación de incendios.
- Integración en pipelines de preprocesado por lotes: el modelo puede ejecutarse sobre grandes volúmenes de imágenes almacenadas para generar metadatos de clasificación y alimentar bases de datos de eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a métricas de validación/test en el repositorio, pero no se incluyen valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un ConvNeXt-Tiny estándar (~28 M de parámetros) en FP32 se requieren aproximadamente 0,1 GB de pesos, y en FP16 alrededor de 0,06 GB, más memoria para activaciones y batch.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente para inferencia en lote pequeño.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del backbone, aunque no se confirma en la documentación.
- Opciones de despliegue: no disponible; al ser un modelo de visión, no aplican vLLM, llama.cpp ni Ollama, y no se documenta exportación a ONNX, TorchScript ni TensorRT.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fireviewer/convnext-tiny-alert-categories | ConvNeXt-Tiny | no disponible (~28 M estándar) | no aplica | BSD-3-Clause | Hugging Face, estado interrumpido |
| ConvNeXt-Tiny (ImageNet-1k, oficial) | ConvNeXt-Tiny | ~28 M | no aplica | MIT (según repositorio original) | Ampliamente disponible |
| ResNet-50 (ImageNet-1k) | ResNet | ~25,6 M | no aplica | BSD-3-Clause (torchvision) | Ampliamente disponible |
| ViT-B/16 (ImageNet-1k) | Vision Transformer | ~86 M | no aplica | Apache 2.0 (según implementación) | Ampliamente disponible |

La comparación directa de rendimiento no es posible porque no se han publicado métricas para este modelo en la información disponible. Las alternativas indicadas son backbones genéricos de clasificación de imágenes, no especializados en incendios, por lo que la comparación es solo estructural.

## Limitaciones y advertencias

- Estado del entrenamiento **interrupted**: el modelo puede no haber convergido y los checkpoints conservados corresponden solo a épocas evaluadas; no debe asumirse un rendimiento óptimo.
- Sin métricas publicadas en la información disponible: no es posible evaluar la precisión por clase ni el rendimiento en validación/test sin consultar los ficheros del repositorio.
- Sesgos conocidos: no disponibles; el corpus `fireviewer_fire_smoke_flame_v3_native` puede tener sesgos de captura (cámaras, regiones geográficas, condiciones de iluminación) que no se documentan.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos y falsos negativos) en imágenes fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica contexto textual; no se documentan idiomas porque el modelo no procesa texto.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribución y sin garantías; no se documentan restricciones adicionales.
- Caveat para producción: al no haber pipeline declarado ni formato de pesos especificado, es necesario verificar la compatibilidad de los checkpoints con el framework de inferencia antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/fireviewer/convnext-tiny-alert-categories
- Corpus de entrenamiento: `fireviewer/fireviewer_fire_smoke_flame_v3_native` (revisión `8c8b197fa1c928217529a04bff434fb70a66614e`), referenciado en la model card; no se proporciona URL directa en la información disponible.
- Ficheros de configuración y métricas referenciados en la model card: `data_receipt.json`, `gpu.json`, `training_setup.json`; no se proporcionan URLs directas en la información disponible.
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
