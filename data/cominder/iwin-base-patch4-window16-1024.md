# cominder/iwin-base-patch4-window16-1024

## Resumen

Iwin Transformer (base, patch 4, ventana 16, resolución 1024) es un modelo de clasificación de imágenes basado en un vision transformer jerárquico sin position embeddings, desarrollado por Simin Huo y Ning Li (cuenta de Hugging Face `cominder`) y publicado en el preprint arXiv:2507.18405. Resuelve el problema clásico de los ViT jerárquicos: la necesidad de interpolar o reentrenar los embeddings posicionales al cambiar la resolución de entrada. Iwin lo evita combinando atención de ventanas intercaladas con convolución depthwise separable, lo que permite ajustar el modelo de baja a alta resolución de forma directa.

El checkpoint aquí descrito es la variante base, con 91.262.056 parámetros (unos 91,3 M) y una ventana de atención de 16 tokens sobre parches de 4×4 píxeles, evaluada a 1024×1024 píxeles. Está afinado sobre ImageNet-1K y declara un top-1 del 85,0 % según la model card del autor. Es relevante ahora porque propone una alternativa sin embeddings posicionales a arquitecturas jerárquicas consolidadas (Swin, ConvNeXt) y porque su diseño permite un escalado de resolución limpio, algo crítico en tareas de clasificación de imágenes de alta resolución.

El modelo es de tamaño contenido (0,7 GB en safetensors), con licencia MIT, y se integra en el ecosistema Transformers mediante `trust_remote_code=True`, ya que la arquitectura `iwin` todavía no forma parte del núcleo de la librería. Está pensado exclusivamente para clasificación de imágenes, no para generación multimodal ni para tareas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Iwin Transformer: vision transformer jerárquico sin position embeddings, con atención de ventanas intercaladas y convolución depthwise separable |
| Parametros totales | 91.262.056 (aproximadamente 91,3 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen a 1024×1024 píxeles con parches de 4 y ventana de 16) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Iwin Transformer es un vision transformer jerárquico que prescinde por completo de position embeddings. La innovación central es la combinación de atención de ventanas intercaladas (interleaved window attention) con convolución depthwise separable: las ventanas de atención se desplazan de forma intercalada entre bloques, de modo que la información fluye entre regiones sin depender de codificaciones posicionales aprendidas o sinusoidales. Esta colaboración permite que el modelo se ajuste finamente desde resoluciones bajas a resoluciones altas sin necesidad de interpolar embeddings, un problema recurrente en ViT y en arquitecturas jerárquicas tipo Swin.

La variante concreta usa parches de 4×4 píxeles y ventanas de atención de 16, y está configurada para entrada a 1024×1024. El entrenamiento se realizó sobre ImageNet-1K, según los tags de la model card y del repositorio. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset más allá de ImageNet-1K, ni sobre si se aplicaron técnicas de ajuste fino adicionales como RLHF/DPO (innecesarias en clasificación). El autor publica también una variante derivada de 22k a 1k (`cominder/iwin-base-patch4-window16-1024-22kto1k`), lo que sugiere un preentrenamiento en ImageNet-22k seguido de ajuste en ImageNet-1K para esa versión; para este checkpoint no se detalla ese pipeline.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1K, con salida de logits por clase y mapeo `id2label` en la configuración.
- Procesamiento de imágenes de alta resolución (1024×1024) de forma nativa, sin interpolación de embeddings posicionales.
- Extracción de representaciones visuales jerárquicas multiescala, aprovechables como backbone para tareas downstream.
- Ajuste fino a resoluciones distintas de la de entrenamiento, gracias al diseño libre de position embeddings.
- Integración con el ecosistema Transformers mediante `AutoImageProcessor` y `AutoModelForImageClassification` con `trust_remote_code=True`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, generación de texto, código, matemáticas, audio ni visión generativa.
- No dispone de capacidades multilingües: es un modelo puramente visual.
- No dispone de modo de pensamiento (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Clasificación de imágenes de alta resolución en inspección industrial: el modelo acepta directamente entradas de 1024×1024, por lo que puede clasificar defectos superficiales, piezas o materiales en imágenes de detalle sin reescalado agresivo que destruya la textura relevante.
- Etiquetado automático de catálogos de producto: con 1.000 clases de ImageNet-1K como base, sirve para preclasificar imágenes de e-commerce y priorizar la revisión humana, o como punto de partida para un ajuste fino sobre las categorías propias del catálogo.
- Moderación y triaje de contenido visual: clasificación rápida de imágenes entrantes en un pipeline de moderación para derivar casos dudosos a revisión manual, usando los logits como señal de confianza.
- Backbone para tareas downstream de visión: las representaciones jerárquicas del modelo pueden alimentar cabezas de detección o segmentación tras un ajuste fino, especialmente en escenarios donde la resolución de entrada varía.
- Investigación en arquitecturas sin position embeddings: el checkpoint sirve como referencia reproducible para comparar el efecto de eliminar embeddings posicionales frente a Swin o ViT en tareas de clasificación.
- Análisis de imágenes médicas o satelitales de alta resolución: al soportar 1024×1024 de forma nativa y permitir ajuste a otras resoluciones, es adecuado para dominios donde el detalle espacial fino es determinante, siempre tras un ajuste fino específico del dominio.
- Docencia y experimentación con Vision Transformers: al ser un modelo de 91 M parámetros y 0,7 GB, permite reproducir experimentos de clasificación en entornos con recursos limitados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Modelo de referencia |
|---|---|---|
| ImageNet-1K top-1 | 85,0 | Iwin Transformer base, patch 4, ventana 16, 1024×1024 (dato declarado en la model card del autor) |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, top-5, throughput, latencia o comparativas numéricas directas con Swin o ConvNeXt). No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 91,3 M parámetros en fp32, los pesos ocupan aproximadamente 365 MB; el pico de memoria lo domina la activación a 1024×1024, que es sustancialmente mayor que el peso del modelo.
- GPU recomendadas: no disponible. Por tamaño de parámetros, el modelo cabe en GPUs de consumo, pero la resolución 1024×1024 con ventanas de 16 eleva el coste de activación y memoria.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8-16 GB de VRAM, aunque no hay mediciones publicadas que lo confirmen; se recomienda validar el consumo real con el lote y la resolución objetivo.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requisito del autor), y por tanto pipelines de PyTorch estándar. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no cubren esta arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iwin Transformer base (este checkpoint) | 91,3 M | 1024×1024 | ventana 16, parche 4 | MIT | Hugging Face (`cominder/iwin-base-patch4-window16-1024`) |
| Iwin Transformer small | no disponible | 1024×1024 | ventana 16, parche 4 | MIT | Hugging Face (`cominder/iwin-small-patch4-window16-1024`) |
| Iwin Transformer base 22k→1k | no disponible | 1024×1024 | ventana 16, parche 4 | MIT | Hugging Face (`cominder/iwin-base-patch4-window16-1024-22kto1k`) |
| Swin Transformer base | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| ConvNeXt base | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar variantes de la propia familia Iwin. No se han proporcionado datos de parámetros, contexto ni rendimiento de Swin o ConvNeXt que permitan una comparación numérica fiable, por lo que se indica "no disponible" en lugar de estimar.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificación de imágenes: no genera texto, no razona, no ejecuta herramientas y no procesa lenguaje, audio ni vídeo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar el código antes de desplegarlo en producción.
- La arquitectura `iwin` no está en el núcleo de Transformers, por lo que la compatibilidad futura con versiones de la librería no está garantizada.
- El top-1 del 85,0 % es un dato declarado por el autor en la model card; no se ha verificado de forma independiente en la información disponible.
- Entrenado sobre ImageNet-1K: hereda los sesgos de etiquetado y la cobertura limitada de clases de ese dataset, con rendimiento degradado en dominios alejados de sus categorías (por ejemplo, imágenes médicas o industriales específicas).
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza en clases visualmente próximas o fuera de distribución; no hay calibración publicada de los logits.
- No hay datos publicados sobre robustez ante perturbaciones, sesgos demográficos o geográficos, ni sobre el consumo de memoria real a 1024×1024.
- Licencia MIT: permite uso comercial y modificación con atribución y conservación del aviso de copyright; no impone restricciones de uso adicionales más allá de las habituales de la licencia.
- El repositorio tiene un uso muy bajo (8 descargas, 0 likes en el momento de la consulta), por lo que la validación comunitaria y el soporte son limitados.
- No se documentan tipos de cuantización ni formatos GGUF/ONNX, lo que limita las opciones de optimización de despliegue en entornos de bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cominder/iwin-base-patch4-window16-1024
- Variante 22k→1k: https://huggingface.co/cominder/iwin-base-patch4-window16-1024-22kto1k
- Colección Iwin Transformer: https://huggingface.co/collections/cominder/iwin-transformer
- Variante small: https://huggingface.co/cominder/iwin-small-patch4-window16-1024
- Paper (arXiv): https://arxiv.org/abs/2507.18405
- Repositorio de código de entrenamiento y evaluación: https://github.com/Cominder/Iwin-Transformer
