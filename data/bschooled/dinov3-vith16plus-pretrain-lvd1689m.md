# bschooled/dinov3-vith16plus-pretrain-lvd1689m

## Resumen

DINOv3 ViT-H+/16 es un modelo de visión por computador desarrollado por Meta AI (FAIR) como parte de la familia DINOv3, una evolución de los modelos auto-supervisados DINO y DINOv2. Se trata de un Vision Transformer de tipo "H+" (Huge plus) con parches de 16x16 píxeles, preentrenado sobre el dataset LVD-1689M (1.689 millones de imágenes) sin etiquetas. El modelo no está diseñado para generación de texto ni instrucciones: es un extractor de características visuales de propósito general que produce embeddings densos de alta calidad para tareas downstream.

La relevancia de DINOv3 radica en que sus representaciones auto-supervisadas igualan o superan a las de modelos supervisados en segmentación semántica, profundidad, clasificación y recuperación de imágenes, sin necesidad de fine-tuning extensivo. El modelo aquí referenciado es un mirror no oficial publicado por el usuario `bschooled` bajo la misma licencia DINOv3, con pesos byte-idénticos al repositorio original de Meta (`facebook/dinov3-vith16plus-pretrain-lvd1689m`). Su utilidad principal es permitir descargas sin el formulario de acceso restringido que Meta impone en el repo upstream.

Con 840,6 millones de parámetros y pesos en formato safetensors (3,4 GB), el modelo se sitúa en el rango de los ViT grandes, apto para GPUs de consumo alto (RTX 4090, 24 GB) o profesionales (A100, H100). No es un modelo generativo: su salida son embeddings de imagen y tokens de parche, que se usan como backbone congelado o con fine-tuning ligero en pipelines de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-H+/16), auto-supervisado DINOv3 |
| Parametros totales | 840.592.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada definida por preprocessor_config.json, no especificada en la información) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32/fp16; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | DINOv3 License (other, `dinov3-license`) |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `preprocessor_config.json` |

## Arquitectura y entrenamiento

DINOv3 ViT-H+/16 es un transformer de visión con parches de 16x16 y variante "H+" (Huge plus), que en la familia DINOv3 corresponde a un tamaño intermedio entre ViT-H y ViT-7B. El entrenamiento es auto-supervisado, sin etiquetas, sobre el corpus LVD-1689M (1.689 millones de imágenes curadas), siguiendo la metodología DINOv3 descrita en el paper arXiv:2508.10104. DINOv3 introduce mejoras sobre DINOv2 como el uso de "Gram anchoring" para evitar el colapso de representaciones densas en entrenamientos largos, y estrategias de escalado de datos y modelo que permiten obtener features densas de alta calidad sin supervisión.

No se dispone en la información proporcionada de detalles sobre número exacto de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF/DPO (no aplicables a un modelo auto-supervisado de visión). Tampoco se documentan innovaciones específicas de decodificación o atención lineal en este mirror. El modelo se distribuye como backbone congelado para extracción de features; no incluye cabezas de tarea específicas (clasificación, detección, segmentación) en el checkpoint publicado.

## Capacidades

- Extracción de embeddings de imagen de propósito general (CLS token y tokens de parche) para clasificación, recuperación y clustering.
- Features densas de alta calidad para segmentación semántica, estimación de profundidad y correspondencia densa entre imágenes.
- Soporte de tareas de visión por computador downstream mediante fine-tuning ligero o uso como backbone congelado (linear probing, k-NN).
- Recuperación de imágenes (image retrieval) y similitud visual.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo "thinking" ni de visión generativa: es exclusivamente un encoder visual.

## Casos de uso

- Segmentación semántica y de instancias: usar los tokens de parche del ViT-H+/16 como features densas y entrenar una cabeza ligera (linear o decoder) para segmentar imágenes médicas, satelitales o de escena; la calidad de las features DINOv3 reduce la necesidad de anotaciones.
- Recuperación de imágenes en buscadores visuales: indexar los embeddings CLS del modelo en una base vectorial (FAISS, Qdrant) para búsqueda por similitud en catálogos de producto, archivos fotográficos o datasets científicos.
- Estimación de profundidad monocular: emplear el backbone congelado con un decoder tipo DPT para generar mapas de profundidad en robótica o conducción asistida.
- Preprocesado para pipelines de generación de imágenes: el propio autor del mirror lo usa como encoder de condicionamiento de imagen en su pipeline "idol-turbo splat" de MageFlow, lo que ilustra su uso como extractor de features en sistemas generativos.
- Clasificación de imágenes con pocas etiquetas: linear probing o k-NN sobre los embeddings CLS para tareas de control de calidad industrial, diagnóstico por imagen o clasificación de especies.
- Detección y seguimiento de objetos: usar los tokens de parche como entrada a cabezas de detección (DETR-like) o para matching entre frames en vídeo.
- Análisis de imágenes satelitales y teledetección: features densas para segmentación de cultivos, cambio de uso del suelo o detección de anomalías, aprovechando la robustez de DINOv3 a dominios distintos del natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,4 GB en fp32 (tamaño del checkpoint); en fp16 ~1,7 GB; en bf16 similar. Con batch grande y resolución alta, la VRAM efectiva puede superar los 8-12 GB por las activaciones.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX 4090 (24 GB) para inferencia y fine-tuning ligero; RTX 3090 (24 GB) y RTX 4080 (16 GB) también son viables para inferencia.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090, 3080 (10-12 GB) con batch moderado; en GPUs de 8 GB puede requerir batch pequeño o fp16.
- Opciones de despliegue: PyTorch nativo (transformers o carga directa con `safetensors`), ONNX Runtime, TensorRT, TorchScript. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder visual).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv3 ViT-H+/16 (este) | 840,6 M | no disponible | DINOv3 License | Mirror no oficial ungated; upstream gated en Meta |
| DINOv2 ViT-g/14 | ~1.100 M | no disponible | Apache 2.0 (repo original) | Público en HF |
| CLIP ViT-L/14 | ~428 M | 224 px (típico) | MIT (OpenAI) | Público en HF |
| SigLIP ViT-So400M | ~878 M | 384 px (típico) | Apache 2.0 | Público en HF |

No se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar diferencias de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre LVD-1689M (dataset web curado), puede heredar sesgos de representación geográfica, demográfica y cultural; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios muy alejados del natural (imágenes médicas, satelitales) sin fine-tuning.
- Limitaciones de contexto o idioma: no es un modelo lingüístico; no procesa texto. La resolución de entrada y el número de parches dependen de `preprocessor_config.json`, no especificado aquí.
- Restricciones de licencia: la DINOv3 License es "other" y no es Apache 2.0 ni MIT; permite uso comercial según los términos de Meta, pero requiere atribución ("Built with DINOv3") y cumplir las condiciones del acuerdo. El mirror no está endorsado por Meta y la licencia se hereda del upstream.
- Caveats para producción: el mirror es no oficial y de un tercero; aunque los hashes SHA256 coinciden con el upstream, conviene verificar la integridad antes de desplegar. No hay garantía de mantenimiento ni soporte. El modelo no incluye cabezas de tarea, por lo que requiere pipeline adicional para cualquier aplicación final.

## Enlaces

- Hugging Face (mirror): https://huggingface.co/bschooled/dinov3-vith16plus-pretrain-lvd1689m
- Modelo original de Meta: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Paper DINOv3: https://arxiv.org/abs/2508.10104
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Repositorio del autor (MageFlow): https://github.com/bschooled/caeleste-image-generation
