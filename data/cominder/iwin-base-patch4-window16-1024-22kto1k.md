# cominder/iwin-base-patch4-window16-1024-22kto1k

## Resumen

Iwin Transformer (variante base, patch 4, ventana 16, resolución 1024×1024, preentrenada en ImageNet-22K y afinada en ImageNet-1K) es un modelo de clasificación de imágenes desarrollado por Simin Huo y Ning Li y publicado bajo el identificador `cominder/iwin-base-patch4-window16-1024-22kto1k`. Se trata de un transformer visual jerárquico que elimina por completo los embeddings posicionales, lo que permite ajustar el modelo directamente de baja a alta resolución sin reentrenar ni interpolar tablas de posiciones. El checkpoint tiene 91.262.056 parámetros y un repositorio de 0,7 GB en formato safetensors.

La relevancia del modelo reside en su mecanismo de atención: combina atención de ventana intercalada (*interleaved window attention*) con convolución separable en profundidad, de modo que la información global se propaga entre ventanas sin necesidad de sesgos posicionales explícitos. El resultado es un backbone jerárquico con un coste computacional lineal respecto a la resolución, apto para tareas de visión densa y clasificación a alta resolución. El autor reporta un top-1 de 85,6 en ImageNet-1K para esta variante de 1024×1024.

El modelo se distribuye con licencia MIT, requiere `trust_remote_code=True` porque la arquitectura no está integrada en el núcleo de Transformers, y está pensado como componente de un pipeline de `image-classification` o como extractor de características para fine-tuning posterior. Es un modelo de investigación con adopción todavía muy baja (6 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Iwin Transformer (vision transformer jerárquico, sin embeddings posicionales, atención de ventana intercalada + convolución separable en profundidad) |
| Parametros totales | 91.262.056 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); resolución de entrada 1024×1024, patch 4, ventana 16 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de salida son las 1000 clases de ImageNet-1K en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código Python personalizado vía `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Iwin Transformer es un transformer visual jerárquico que construye mapas de características multiescala, al estilo de Swin, pero prescinde de los embeddings posicionales absolutos y de los sesgos posicionales relativos. La pieza central es la *interleaved window attention*: la atención se calcula dentro de ventanas locales (aquí de 16×16 con patch de 4) y las ventanas se desplazan de forma intercalada entre bloques, mientras que una convolución separable en profundidad actúa como mecanismo de mezcla espacial entre ventanas. Esta combinación permite que el modelo se ajuste directamente de baja a alta resolución sin interpolar posiciones, algo que en arquitecturas con embeddings posicionales obliga a reentrenar o degrada el rendimiento.

El entrenamiento sigue el régimen estándar de la familia: preentrenamiento en ImageNet-22K y afinamiento posterior en ImageNet-1K, según indica el sufijo `22kto1k` del identificador. No se dispone de información sobre el número exacto de tokens/imágenes vistas, la composición del dataset más allá de ImageNet-22K e ImageNet-1K, ni sobre el uso de RLHF, DPO u otras fases de alineación (no aplicables en un clasificador). Tampoco se detallan en la información disponible técnicas auxiliares como decodificación especulativa, *stochastic depth* o *layer scale*. El código de entrenamiento y evaluación está publicado en el repositorio de GitHub del autor.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1K, con salida de logits por clase y mapeo `id2label` en la configuración.
- Procesamiento a resolución nativa de 1024×1024, lo que permite clasificar imágenes de alta resolución sin recortes agresivos.
- Extracción de características visuales jerárquicas multiescala, reutilizable como backbone para detección, segmentación o recuperación.
- Ajuste directo de baja a alta resolución gracias a la ausencia de embeddings posicionales.
- No soporta tool calling ni function calling: es un modelo puramente perceptivo, sin interfaz de texto ni generación.
- No dispone de modo de razonamiento (*thinking*), agentes ni capacidades multi-paso.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés.
- No soporta visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Clasificación de imágenes a alta resolución en pipelines de control de calidad industrial: el modelo acepta 1024×1024 de entrada, por lo que defectos pequeños en piezas o superficies no se pierden en un redimensionado agresivo; se usaría como clasificador final o como extractor de características con una cabeza lineal entrenada sobre el dominio propio.
- Moderación de contenido visual: clasificación de imágenes en categorías de alto nivel antes de un filtro más específico, aprovechando la ventana de 16 y el patch de 4 para conservar detalle en imágenes grandes.
- Backbone para fine-tuning en imágenes médicas o de teledetección: la jerarquía multiescala y la resolución 1024 son adecuadas para imágenes de satélite o radiografías, donde se reemplaza la cabeza de 1000 clases por una tarea específica.
- Recuperación visual (*image retrieval*): usar los mapas de características intermedios como embeddings para búsqueda por similitud en catálogos de producto, con la ventaja de que el modelo no impone una resolución fija de entrenamiento.
- Etiquetado automático de datasets: preanotación de grandes colecciones de imágenes con las clases de ImageNet-1K para acelerar el trabajo de anotación humana.
- Prototipado e investigación en arquitecturas de visión: al ser un checkpoint de un artículo reciente (arXiv:2507.18405) con código de entrenamiento público, sirve como referencia reproducible para experimentos sobre atención sin embeddings posicionales.
- Filtrado previo en sistemas de visión documental: clasificación de documentos escaneados a alta resolución antes de derivarlos a un OCR o a un modelo de documentos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ImageNet-1K top-1 | 85,6 | Dato reportado por el autor en la model card para esta variante (base, patch 4, ventana 16, 1024×1024, 22k→1k) |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, COCO, ADE20K, ImageNet-V2 o métricas de robustez), ni comparaciones numéricas con otros modelos en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 91,3 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,37 GB y en fp16/bf16 unos 0,18 GB. A resolución 1024×1024 el cuello de botella es la memoria de activaciones, no los pesos; conviene reservar entre 4 y 8 GB de VRAM según el tamaño de lote.
- GPU recomendadas: A100 o H100 para lotes grandes a 1024×1024; RTX 4090, RTX 3090 o RTX A6000 para inferencia con lotes moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) usando lotes pequeños a 1024×1024; en tarjetas de 4-6 GB es viable reduciendo el tamaño de lote o la resolución de entrada.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` y `trust_remote_code=True`; el repositorio no publica pesos GGUF ni ONNX, por lo que llama.cpp, Ollama y TGI no están soportados de forma directa. Para servir en producción se puede envolver en TorchServe, FastAPI o Triton con el backend de PyTorch.
- Latencia y throughput: no disponible; no se han publicado mediciones en la información consultada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Iwin base patch4 window16 1024 (este modelo) | 91,3 M | 1024×1024 | ventana 16, patch 4 | ImageNet-1K top-1 85,6 (reportado) | MIT | Hugging Face, requiere `trust_remote_code` |
| Swin Transformer base (Swin-B) | ~88 M | 224×224 (hasta 384 con ajuste) | ventana 7 | no disponible en la información consultada | MIT | integrado en Transformers |
| DeiT-Base | ~86 M | 224×224 | atención global | no disponible en la información consultada | Apache 2.0 | integrado en Transformers |
| ConvNeXt-Base | ~89 M | 224×224 | convolucional, kernel 7 | no disponible en la información consultada | MIT | integrado en Transformers |

La comparación se limita a parámetros, resolución y licencia: no se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que no se establece una comparación numérica de rendimiento. La diferencia funcional más clara frente a Swin, DeiT y ConvNeXt es la resolución nativa de 1024×1024 y la ausencia de embeddings posicionales.

## Limitaciones y advertencias

- Modelo de nicho con adopción mínima: 6 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.
- Requiere `trust_remote_code=True`, es decir, ejecuta código Python del autor; conviene auditar el código antes de desplegarlo en producción.
- La arquitectura no está en el núcleo de Transformers, por lo que puede romperse con actualizaciones de la librería.
- No se han publicado datos sobre sesgos del dataset ni sobre el comportamiento del modelo en dominios distintos de ImageNet; el preentrenamiento en ImageNet-22K hereda los sesgos de etiquetado y cobertura de dicha colección.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Las 1000 clases de salida están en inglés y limitan el uso directo a ese vocabulario; para cualquier otra taxonomía es necesario reentrenar la cabeza.
- No se han publicado métricas de robustez, calibración ni rendimiento fuera de ImageNet-1K.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- El repositorio no incluye pesos cuantizados ni formatos alternativos, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cominder/iwin-base-patch4-window16-1024-22kto1k
- Colección Iwin Transformer: https://huggingface.co/collections/cominder/iwin-transformer
- Paper (arXiv:2507.18405): https://arxiv.org/abs/2507.18405
- Código de entrenamiento y evaluación: https://github.com/Cominder/Iwin-Transformer
