# cominder/iwin-large-patch4-window7-224-22kto1k

## Resumen

Iwin Transformer (large, ImageNet-22K→1K, 224×224) es un transformer de visión jerárquico desarrollado por Simin Huo y Ning Li, publicado en arXiv con el identificador 2507.18405 y distribuido en Hugging Face bajo el espacio `cominder`. El modelo resuelve clasificación de imágenes a resolución 224×224 y su innovación principal es la eliminación de los embeddings posicionales: la arquitectura usa ventanas intercaladas (*interleaved windows*) para inyectar información de posición de forma implícita, evitando los sesgos de interpolación que afectan a los ViT y Swin Transformer cuando cambia la resolución de entrada.

La variante publicada es la "large" con parches de 4×4, ventana de 7×7 y preentrenamiento en ImageNet-22K seguido de ajuste fino en ImageNet-1K. Cuenta con 204.322.984 parámetros totales (unos 204 M) y un repositorio de 1,6 GB en formato safetensors. El autor reporta un top-1 de 86,4 en ImageNet-1K.

Su relevancia actual es doble: por un lado, propone una alternativa a las ventanas desplazadas de Swin para capturar contexto global y local en un backbone jerárquico; por otro, sirve como referencia para evaluar si la eliminación de embeddings posicionales mejora la transferencia a resoluciones distintas de la de entrenamiento. La licencia MIT facilita su uso comercial, aunque el modelo aún no está integrado en el núcleo de Transformers y requiere `trust_remote_code=True`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Iwin Transformer, transformer de visión jerárquico con ventanas intercaladas y sin embeddings posicionales |
| Parámetros totales | 204.322.984 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 224×224) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Iwin Transformer es un transformer de visión jerárquico que produce mapas de características multiescala, al estilo de Swin, pero sustituye el mecanismo de ventanas desplazadas por ventanas intercaladas. La variante publicada usa parches de 4×4 y ventanas de 7×7 sobre entradas de 224×224. La característica definitoria es la ausencia de embeddings posicionales explícitos: la información espacial se codifica mediante la propia estructura de las ventanas intercaladas, lo que en principio evita la interpolación de posiciones al evaluar a resoluciones distintas de la de entrenamiento.

El entrenamiento sigue el esquema en dos fases habitual en esta familia: preentrenamiento en ImageNet-22K y ajuste fino en ImageNet-1K, según indica el nombre del checkpoint (`22kto1k`). No se dispone de información sobre el número exacto de tokens o imágenes vistas, la composición detallada del dataset, el uso de técnicas de aumento de datos, regularización, destilación o ajuste por preferencias; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El código de entrenamiento y evaluación está disponible en el repositorio GitHub del autor.

## Capacidades

- Clasificación de imágenes a 224×224 con 1000 clases de ImageNet-1K.
- Extracción de características visuales jerárquicas multiescala, aprovechables como backbone para detección, segmentación y tareas densas.
- Procesamiento por ventanas con atención local y contexto intercalado, sin embeddings posicionales explícitos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo puramente visual).
- Capacidades especiales (modo thinking, visión generativa, audio): no disponibles; es un modelo discriminativo de clasificación.

## Casos de uso

- Clasificación automática de imágenes en catálogos de producto: el modelo asigna una de las 1000 clases de ImageNet-1K a imágenes redimensionadas a 224×224, suficiente para triaje inicial de inventario o moderación de contenido visual.
- Backbone para detección de objetos y segmentación: sus mapas de características jerárquicos permiten acoplarlo a cabezas tipo FPN en pipelines de visión por computador, aunque requiere adaptar el código de extracción de features.
- Etiquetado semiautomático de datasets: usar las predicciones como preetiquetas para acelerar la anotación humana en proyectos de visión, filtrando por confianza del logit máximo.
- Evaluación de robustez a resolución: al carecer de embeddings posicionales, es un candidato para estudiar cómo se comporta la clasificación al variar la resolución de entrada sin reentrenar, una comparación directa frente a ViT y Swin.
- Investigación en arquitecturas de visión: sirve como línea base reproducible (MIT, safetensors, código en GitHub) para experimentos sobre ventanas intercaladas y atención sin posición explícita.
- Servicio de inferencia ligero en CPU o GPU de gama baja: con 204 M de parámetros, un único forward a 224×224 es viable en entornos con recursos limitados, aunque no se publican cifras de latencia.

## Benchmarks y rendimiento

El autor reporta un único dato en la model card: ImageNet-1K top-1 de **86,4**. No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, top-5, ImageNet-22K, transferencia a COCO o ADE20K), ni comparaciones numéricas con Swin u otros modelos.

| Benchmark | Métrica | Resultado |
|---|---|---|
| ImageNet-1K | top-1 accuracy | 86,4 |
| ImageNet-1K | top-5 accuracy | no disponible |
| ImageNet-22K | accuracy | no disponible |
| COCO (detección/segmentación) | mAP | no disponible |
| ADE20K (segmentación semántica) | mIoU | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,8 GB solo para pesos (204 M × 4 bytes), más activaciones; en la práctica, por debajo de 2 GB para un batch pequeño a 224×224.
- VRAM estimada en fp16/bf16: alrededor de 0,4 GB para pesos; el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 y superiores para inferencia interactiva; A100/H100 solo necesarias para entrenamiento o fine-tuning a gran escala.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con al menos 4 GB de VRAM, incluidas GTX 1650 y RTX 3050.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` y `trust_remote_code=True`; exportación a ONNX o TorchScript no documentada; soporte en vLLM, llama.cpp, Ollama o TGI no disponible (son motores orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iwin Transformer large (este modelo) | 204 M | imagen 224×224 | ImageNet-1K top-1 86,4 | MIT | Hugging Face, requiere `trust_remote_code` |
| Swin Transformer large (microsoft/swin-large-patch4-window7-224-in22k) | ~197 M (no confirmado en la información disponible) | imagen 224×224 | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face, integrado en Transformers |
| ViT large (referencia genérica) | no disponible | imagen 224×224 | no disponible | no disponible | no disponible |

La comparación directa con Swin es la más pertinente por tamaño, resolución y esquema de preentrenamiento (ImageNet-22K → 1K), pero no se dispone de cifras de Swin en la información proporcionada para contrastar el 86,4 reportado por Iwin. Cualquier afirmación de superioridad numérica sería especulativa.

## Limitaciones y advertencias

- Modelo puramente discriminativo: no genera texto, código ni respuestas; no admite tool calling ni uso como agente.
- El rendimiento reportado (86,4 top-1) procede del autor y no se ha verificado de forma independiente en la información disponible.
- Sesgos: al entrenarse con ImageNet, hereda los desequilibrios de clases y la sobrerrepresentación de categorías occidentales del dataset; no se documentan análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de resolución: el checkpoint está ajustado a 224×224; el comportamiento a otras resoluciones no está documentado, aunque la ausencia de embeddings posicionales es precisamente el argumento del autor para esperar mejor generalización.
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- No integrado en el núcleo de Transformers, lo que puede romper la compatibilidad con versiones futuras de la librería.
- Idiomas: no disponible; no procesa texto, por lo que no hay soporte multilingüe que evaluar.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/cominder/iwin-large-patch4-window7-224-22kto1k
- Colección de checkpoints Iwin Transformer: https://huggingface.co/collections/cominder/iwin-transformer
- Paper (arXiv:2507.18405): https://arxiv.org/abs/2507.18405
- Código de entrenamiento y evaluación: https://github.com/Cominder/Iwin-Transformer
- Swin Transformer (referencia comparativa, config large 22k): https://github.com/microsoft/Swin-Transformer/blob/main/configs/swin/swin_large_patch4_window7_224_22k.yaml
- Swin Transformer large en Hugging Face: https://huggingface.co/microsoft/swin-large-patch4-window7-224-in22k
