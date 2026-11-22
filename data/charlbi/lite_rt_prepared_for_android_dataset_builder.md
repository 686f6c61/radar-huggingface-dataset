# Charlbi/Lite_rt_prepared_for_android_dataset_builder

## Resumen

LiteRT · general-purpose Android conversions es una colección de modelos de visión por computador convertidos a TensorFlow Lite / LiteRT para su ejecución en dispositivos Android. La publica el usuario Charlbi (bajo la marca Cadryl) y no es un modelo único, sino un repositorio que agrupa 25 variantes de conversión, de las cuales 15 incluyen cabezas o adaptadores de salida entrenables sobre un backbone visual congelado. El propósito es ofrecer un catálogo de arquitecturas ya convertidas y verificadas para tareas de clasificación, detección de objetos, segmentación, embeddings y generación visión-lenguaje en el borde.

El interés práctico reside en la integración con LiteRT (el runtime sucesor de TensorFlow Lite en Android) y en el concepto de *on-device training* limitado: se congelan los pesos del backbone y solo se adaptan las cabezas de salida, lo que reduce el coste computacional y permite ajustes ligeros en el dispositivo. El repositorio ocupa 3,1 GB e incluye contratos por variante, matrices de cualificación y documentación de navegación.

No se dispone de información sobre parámetros totales, longitud de contexto ni idiomas, ya que no se trata de un modelo de lenguaje sino de un conjunto heterogéneo de modelos visuales (ConvFormer, DINOv2, EdgeNeXt, EfficientViT-SAM, Florence-2, RF-DETR, RTMDet, ViTPose, TinyCLIP, entre otros). La licencia tampoco está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: ConvFormer, CaFormer, DINOv2, EdgeNeXt, EfficientFormer, HGNetV2, RepViT, TinyCLIP, EfficientViT-SAM, Florence-2, RF-DETR, RTMDet, Table Transformer, ViTPose |
| Parametros totales | no disponible (varía por variante) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelos visuales, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | TensorFlow Lite / LiteRT (.tflite) |
| Tamano del repositorio | 3,1 GB |
| Variantes incluidas | 25 (15 con cabezas/adaptadores entrenables) |
| Runtime objetivo | LiteRT / TensorFlow Lite en Android |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero, sino que convierte arquitecturas de visión preexistentes a formato LiteRT para su despliegue en Android. Las variantes cubren tareas de clasificación (CaFormer S18, ConvFormer S18, DINOv2, EdgeNeXt Small/X-Small/XX-Small, EfficientFormer L1, HGNetV2 B0, RepViT M1, TinyCLIP), clasificación con embeddings visuales (ConvFormer S18, HGNetV2 B0, RepViT M1), embeddings de imagen (DINOv2), segmentación con prompt (EfficientViT-SAM), generación visión-lenguaje (Florence-2), detección de objetos (RF-DETR, RTMDet Tiny), detección y estructura de tablas (Table Transformer), embeddings imagen-texto (TinyCLIP) y keypoints de pose (ViTPose).

El rasgo técnico distintivo es el contrato de adaptación: en las variantes `*_learning`, el backbone visual permanece congelado y solo se entrenan las cabezas o adaptadores de salida. La model card indica que existen firmas reales de entrenamiento, guardado y restauración en el dispositivo, pero también advierte que las comprobaciones de conversión y aprendizaje sintético no establecen precisión de tarea común, cualificación completa en ARM ni integración de aplicación para todas las tareas. No se detallan volúmenes de datos de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Clasificación de imágenes mediante múltiples backbones ligeros (EdgeNeXt, EfficientFormer, RepViT, HGNetV2, ConvFormer, CaFormer).
- Extracción de embeddings visuales con DINOv2 y TinyCLIP.
- Embeddings conjuntos imagen-texto con TinyCLIP.
- Segmentación guiada por prompt con EfficientViT-SAM.
- Detección de objetos con RF-DETR y RTMDet Tiny.
- Detección y estructura de tablas con Table Transformer.
- Generación visión-lenguaje con Florence-2.
- Estimación de keypoints de pose con ViTPose.
- Adaptación en dispositivo de cabezas de salida (15 variantes `*_learning`) manteniendo el backbone congelado.
- Ejecución en Android mediante LiteRT/TensorFlow Lite.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Clasificación de imágenes en aplicaciones Android: usar las variantes EdgeNeXt o EfficientFormer para etiquetar imágenes localmente sin conexión, aprovechando su tamaño reducido y su conversión a LiteRT.
- Detección de objetos en tiempo real en el dispositivo: integrar RF-DETR o RTMDet Tiny en apps de cámara para localizar objetos en el flujo de vídeo, con la ventaja de no enviar datos a la nube.
- Segmentación interactiva en apps de edición: emplear EfficientViT-SAM con prompts para recortar objetos seleccionados por el usuario directamente en el móvil.
- Búsqueda visual y similitud de imágenes: usar los embeddings de DINOv2 o TinyCLIP para indexar y recuperar imágenes por similitud semántica en un catálogo local.
- Digitalización de tablas: aplicar Table Transformer para detectar y estructurar tablas en documentos escaneados capturados con la cámara del dispositivo.
- Análisis de pose para fitness o ergonomía: usar ViTPose para estimar keypoints corporales en tiempo real en aplicaciones de ejercicio o rehabilitación.
- Ajuste ligero en el dispositivo: adaptar las cabezas de las variantes `*_learning` con datos propios del usuario para personalizar la clasificación sin reentrenar el backbone.
- Descripción de imágenes: integrar Florence-2 para generar texto descriptivo de imágenes en escenarios de accesibilidad sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona comprobaciones de cualificación (matriz retenida del 2026-10-05) que separan aprendizaje sintético en host, SDK independiente y comprobaciones de aplicación; cinco casos de aplicación registrados afectan a EdgeNeXt Small/X-Small/XX-Small learning, RepViT M1 inference y RTMDet Tiny learning. RTMDet Tiny inference mantiene un fallo registrado y el resto de variantes quedan pendientes. No se aportan métricas de precisión, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser modelos LiteRT para Android, el objetivo es ejecución en CPU/GPU/NPU del dispositivo, no en GPU de escritorio.
- GPU recomendadas: no disponible para inferencia en servidor; el despliegue previsto es en hardware ARM móvil.
- Cabe en consumer GPU: no aplica como objetivo principal; el formato .tflite está pensado para dispositivos móviles.
- Opciones de despliegue: LiteRT / TensorFlow Lite en Android; el repositorio no documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La model card advierte que no se reclama cualificación física ARM general ni precisión de dominio representativo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LiteRT · general-purpose Android conversions | Colección de visión convertida | no disponible | no disponible | no disponible | .tflite |
| Modelos originales (DINOv2, EdgeNeXt, Florence-2, etc.) | Vision backbones y VLM | varía por modelo | no disponible | según modelo original | safetensors / PyTorch |
| Otras colecciones TFLite para Android | Conversiones móviles | varía | no disponible | varía | .tflite |

La comparación directa con alternativas concretas no está disponible en la información proporcionada. La model card remite a modelos especializados Cadryl y comparaciones registradas en otro repositorio (unicornwhodev/lite-rt_models_cadrylpro), pero no se incluyen datos numéricos de rendimiento.

## Limitaciones y advertencias

- La model card advierte explícitamente que las comprobaciones de conversión y aprendizaje sintético no establecen precisión de tarea común.
- No se reclama cualificación completa en ARM ni integración de aplicación para todas las tareas.
- RTMDet Tiny inference mantiene un fallo registrado; otras variantes están pendientes de cualificación.
- La licencia no está declarada; los pesos y el software de origen conservan sus términos originales, por lo que es necesario revisar los avisos de cada variante antes de uso comercial.
- El repositorio es una colección heterogénea: los requisitos, el rendimiento y las limitaciones varían por variante.
- No hay información sobre sesgos, riesgo de alucinación (salvo en Florence-2 como modelo generativo) ni cobertura idiomática.
- El ajuste en dispositivo se limita a cabezas y adaptadores; el backbone permanece congelado, lo que restringe la adaptación a nuevos dominios.
- El tamaño del repositorio (3,1 GB) puede dificultar su descarga y gestión en entornos con ancho de banda limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Charlbi/Lite_rt_prepared_for_android_dataset_builder
- Modelos especializados Cadryl y comparaciones: https://huggingface.co/unicornwhodev/lite-rt_models_cadrylpro
- Documentación de selección de variantes: docs/CHOOSING_VARIANTS.md (dentro del repositorio)
- Matriz de cualificación: docs/QUALIFICATION_20261005.md (dentro del repositorio)
- Navegación de recursos: docs/NAVIGATION.md (dentro del repositorio)
- Registro de cambios: CHANGELOG.md (dentro del repositorio)
