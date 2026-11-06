# PeterAM4/SQuID-DINOv3-Mask2Former

## Resumen

SQuID-DINOv3-Mask2Former es un modelo de segmentación semántica de imágenes de satélite desarrollado por Peter A. Massih (usuario PeterAM4) en el contexto del benchmark SQuID (Spatial Quantitative Reasoning on Satellite Imagery). El modelo combina un backbone DINOv3 ViT-L/16 congelado, preentrenado con los pesos SAT-493M de Meta, con un adaptador ViT-Adapter y una cabeza Mask2Former entrenada sobre el conjunto EarthVQA. Su función es segmentar imágenes aéreas en ocho clases de cobertura del suelo: fondo, edificio, carretera, agua, terreno baldío, bosque, agricultura y zona de juegos.

El modelo forma parte del componente QASR-C del benchmark SQuID, un sistema de razonamiento espacial cuantitativo sobre imágenes satelitales. Es relevante porque demuestra cómo un backbone de visión auto-supervisado de última generación (DINOv3) puede adaptarse eficientemente a tareas de teledetección mediante un adaptador ligero, manteniendo el backbone congelado y entrenando únicamente 56,6 millones de parámetros adicionales. Alcanza un 57,6% de mIoU en el split de validación de EarthVQA.

El repositorio publicado contiene exclusivamente los pesos del adaptador y de la cabeza de segmentación (model.safetensors, 0,2 GB), no el backbone completo, que debe cargarse por separado desde el repositorio restringido facebook/dinov3-vitl16-pretrain-sat493m. La licencia es la DINOv3 License, que impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 (backbone congelado) + ViT-Adapter + cabeza Mask2Former |
| Parametros totales | 56.581.833 (solo adaptador y cabeza; el backbone se carga aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | DINOv3 License (license_name: dinov3-license, license: other) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de adaptación con backbone congelado. El extractor de características es un Vision Transformer DINOv3 ViT-L/16 preentrenado con los pesos SAT-493M, un conjunto de pesos de Meta orientado a imágenes satelitales. Sobre este backbone se inserta un ViT-Adapter, que introduce interacciones espaciales densas para mejorar la representación de detalles finos, y una cabeza de segmentación Mask2Former, que formula la segmentación como predicción de máscaras y etiquetas mediante consultas aprendidas. Solo se entrenan el adaptador y la cabeza, lo que explica el reducido número de parámetros publicados (56,6 millones) frente al tamaño del backbone ViT-L.

El entrenamiento se realizó sobre el conjunto EarthVQA, con ocho clases de cobertura del suelo. Según la model card, el checkpoint se seleccionó usando el split de validación de EarthVQA, que también contiene las imágenes de EarthVQA empleadas en SQuID, y alcanza un 57,6% de mIoU en ese split. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO (no aplicables a un modelo de segmentación). El modelo forma parte del sistema QASR-C, donde sirve las clases forest, agriculture, barren land, water y roofs, mientras que las clases urban, grass y solar panels provienen de un servidor ConvNeXt-UNet no publicado.

## Capacidades

- Segmentación semántica de imágenes de satélite en ocho clases: background, building, road, water, barren, forest, agriculture y playground.
- Extracción de características visuales densas mediante el backbone DINOv3 ViT-L/16 con pesos SAT-493M.
- Predicción de máscaras de segmentación con la cabeza Mask2Former.
- Integración en el pipeline QASR-C del benchmark SQuID para razonamiento espacial cuantitativo sobre imágenes satelitales.
- No soporta tool calling ni function calling (es un modelo de visión, no de lenguaje).
- No soporta agentes ni razonamiento multi-step de forma nativa; su papel en SQuID es como componente perceptivo dentro de un agente mayor.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo thinking, visión general, audio ni otras capacidades multimodales más allá de la segmentación.

## Casos de uso

- Cartografía de cobertura del suelo: el modelo clasifica píxeles de imágenes aéreas en ocho categorías, lo que permite generar mapas de uso del suelo a partir de ortofotos satelitales con un backbone preentrenado específicamente en imágenes de satélite.
- Monitorización de masas forestales y agricultura: al segmentar las clases forest y agriculture, puede emplearse en estudios de deforestación o seguimiento de cultivos, aprovechando que el checkpoint fue entrenado y validado sobre EarthVQA.
- Detección de agua y terrenos baldíos: la clase water y barren permite identificar cuerpos de agua y zonas degradadas en imágenes de satélite, útil en gestión de recursos hídricos o evaluación de riesgos.
- Análisis de infraestructura urbana: la segmentación de building y road facilita la extracción de huellas de edificios y red viaria para planificación urbana o actualización de bases cartográficas.
- Componente perceptivo en sistemas de razonamiento espacial: integrado en QASR-C dentro del benchmark SQuID, el modelo aporta las máscaras de cinco clases (forest, agriculture, barren, water, roofs) que alimentan las consultas cuantitativas del agente.
- Investigación en adaptación eficiente: al mantener el backbone congelado y entrenar solo 56,6 millones de parámetros, sirve como caso de estudio reproducible para evaluar ViT-Adapter y Mask2Former sobre DINOv3 en teledetección.
- Evaluación comparativa en benchmarks de segmentación satelital: puede usarse como línea base en experimentos sobre EarthVQA u otros conjuntos de segmentación semántica de imágenes aéreas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| EarthVQA (split de validación) | mIoU | 57,6% |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, al tratarse de un modelo de segmentación de imágenes. Tampoco se detallan métricas adicionales como precisión por clase, F1 o exactitud global.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio publicado ocupa 0,2 GB (adaptador y cabeza), pero el backbone DINOv3 ViT-L/16 debe cargarse aparte y añade un consumo adicional considerable.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del backbone ViT-L, se requiere una GPU con memoria suficiente para un transformer de visión de gran tamaño, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. No se confirma si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: la model card indica el uso mediante el repositorio GitHub de SQuID, con la función `load_segmenter` del módulo `evaluation.dinov3_model` y la instalación del paquete `facebookresearch/dinov3` desde un commit concreto. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SQuID-DINOv3-Mask2Former | 56,6 M (adaptador y cabeza) + backbone ViT-L/16 | no aplica | 57,6% mIoU en EarthVQA val | DINOv3 License | Hugging Face (adaptador) + backbone restringido |
| ConvNeXt-UNet (servidor QASR-C) | no disponible | no aplica | no disponible | no liberado | no disponible (no publicado) |
| Otros segmentadores sobre EarthVQA | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos con otros segmentadores semánticos de teledetección (por ejemplo, variantes de SegFormer, U-Net o Mask2Former con otros backbones) sobre EarthVQA u otros conjuntos. La comparativa queda limitada al componente ConvNeXt-UNet del mismo sistema QASR-C, del que no se publican métricas ni pesos.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador y la cabeza; el backbone DINOv3 debe descargarse por separado desde facebook/dinov3-vitl16-pretrain-sat493m, un repositorio restringido cuya licencia hay que aceptar previamente en Hugging Face.
- La licencia DINOv3 License impone restricciones de uso comercial; es necesario revisar el archivo LICENSE.md antes de cualquier despliegue en producción.
- El checkpoint se seleccionó usando el split de validación de EarthVQA, que también contiene las imágenes de EarthVQA usadas en SQuID; esto puede introducir sesgo de selección y sobreestimar el rendimiento en esa partición.
- Solo cubre ocho clases de cobertura del suelo; no segmenta clases como urban, grass o solar panels, que en QASR-C provienen de un servidor ConvNeXt-UNet no publicado.
- Riesgo de degradación en dominios distintos de EarthVQA (sensores, resoluciones, regiones geográficas o condiciones de iluminación no representadas en el entrenamiento).
- No se detallan sesgos conocidos, composición del dataset de entrenamiento ni análisis de errores por clase.
- Sin información sobre latencia, throughput ni requisitos de memoria, lo que dificulta planificar su despliegue en producción.
- El modelo no procesa lenguaje ni soporta tool calling; cualquier uso en agentes requiere integrarlo como componente perceptivo dentro de un pipeline mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeterAM4/SQuID-DINOv3-Mask2Former
- Repositorio GitHub de SQuID: https://github.com/PeterAMassih/SQuID
- Backbone DINOv3 SAT-493M: https://huggingface.co/facebook/dinov3-vitl16-pretrain-sat493m
- Paper SQuID (arXiv:2601.13401): https://arxiv.org/abs/2601.13401
- Paper DINOv3 (arXiv:2508.10104): https://arxiv.org/abs/2508.10104
- Paper Mask2Former (arXiv:2112.01527): https://arxiv.org/abs/2112.01527
- Paper EarthVQA (arXiv:2312.12222): https://arxiv.org/abs/2312.12222
- Repositorio DINOv3 de Meta: https://github.com/facebookresearch/dinov3
