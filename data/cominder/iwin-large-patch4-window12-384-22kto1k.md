# cominder/iwin-large-patch4-window12-384-22kto1k

## Resumen

Iwin Transformer (variante *large*, patch 4, ventana 12, resolución 384×384, preentrenada en ImageNet-22K y afinada en ImageNet-1K) es un modelo de clasificación de imágenes desarrollado por el usuario Cominder, asociado al artículo "Iwin Transformer: Hierarchical Vision Transformer using Interleaved Windows" (arXiv:2507.18405), firmado por Simin Huo y Ning Li. Se trata de un transformer de visión jerárquico que prescinde por completo de *position embeddings*, una decisión de diseño poco habitual en la familia ViT/Swin y que constituye su principal aportación técnica.

El modelo resuelve la tarea de clasificación de imágenes en 1.000 clases (ImageNet-1K) y se distribuye como checkpoint listo para `transformers` mediante `AutoModelForImageClassification` con `trust_remote_code=True`, ya que la arquitectura aún no forma parte del núcleo de la librería. Con 204,3 millones de parámetros y un peso de repositorio de 0,8 GB en safetensors, se sitúa en la franja de los ViT grandes de clasificación pura, no generativos.

Su relevancia es doble: por un lado, ofrece un *baseline* de clasificación con supresión de embeddings posicionales que puede interesar a investigadores en visión por computador; por otro, su licencia MIT y su integración con la API estándar de `transformers` lo hacen directamente utilizable en pipelines de etiquetado. El autor reporta un top-1 de 87,4 en ImageNet-1K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Iwin Transformer, transformer de visión jerárquico con ventanas intercaladas y sin *position embeddings* |
| Parámetros totales | 204.322.984 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 384×384) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (*pipeline*) | image-classification |
| Resolución de entrada | 384×384 |
| Tamaño de parche | 4 |
| Tamaño de ventana | 12 |
| Preentrenamiento | ImageNet-22K, afinado en ImageNet-1K |
| Código remoto requerido | sí (`trust_remote_code=True`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Iwin es un transformer de visión jerárquico, en la línea de Swin, que construye representaciones multiescala mediante la reducción progresiva de la resolución espacial. La innovación declarada en el título del paper es el uso de **ventanas intercaladas** (*interleaved windows*) combinado con la **eliminación total de los embeddings posicionales**: la información de localización se introduce a través del propio mecanismo de atención por ventanas en lugar de sumarse como vector posicional a los tokens de entrada. Esta variante concreta emplea parches de 4×4 y ventanas de 12, y opera a 384×384 píxeles, lo que multiplica el número de tokens respecto a las variantes a 224×224 y explica en parte el coste paramétrico de 204 M.

El régimen de entrenamiento es el habitual en la familia: preentrenamiento en ImageNet-22K seguido de *fine-tuning* sobre las 1.000 clases de ImageNet-1K, tal como indica el sufijo `22kto1k` del identificador. No se dispone de información sobre el número exacto de tokens/imágenes vistas, la composición del dataset más allá de ImageNet, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación (no aplicables en un clasificador). Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; el modelo es un clasificador *feed-forward* de una sola pasada.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1K, devolviendo logits por clase y permitiendo leer la etiqueta predicha mediante `id2label`.
- Extracción de características visuales jerárquicas multiescala (útil como *backbone* para *downstream*: detección, segmentación, recuperación visual), aunque el checkpoint publicado está afinado para clasificación.
- Procesamiento de imágenes a resolución 384×384 mediante el `AutoImageProcessor` incluido en el repositorio.
- Sin capacidad de generación de texto, razonamiento simbólico, código ni matemáticas: es un modelo exclusivamente visual.
- Sin soporte de *tool calling*, *function calling* ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa lenguaje).
- Sin modo *thinking*, visión-lenguaje, audio ni multimodalidad.

## Casos de uso

- **Etiquetado automático de catálogos de producto**: clasificar imágenes de inventario en categorías predefinidas mapeando las 1.000 clases de ImageNet a la taxonomía propia o reentrenando la cabeza de clasificación; el modelo sirve como extractor congelado y la resolución 384×384 aporta detalle en objetos pequeños.
- **Moderación y filtrado de contenido visual**: primera pasada de clasificación para descartar o marcar categorías sensibles antes de un revisor humano, aprovechando la inferencia de una sola pasada y el reducido tamaño del checkpoint (0,8 GB).
- **Pre-etiquetado en pipelines de anotación**: generar etiquetas preliminares sobre grandes volúmenes de imágenes para que los anotadores solo corrijan, reduciendo el coste por imagen; la licencia MIT elimina fricción legal en herramientas internas.
- **Búsqueda visual y similitud de imágenes**: usar las características del *backbone* como embedding para indexar y recuperar imágenes similares en un catálogo o archivo fotográfico, con reentrenamiento ligero de la cabeza si se necesita una taxonomía propia.
- **Investigación en arquitecturas de visión**: servir de *baseline* reproducible para estudiar el efecto de eliminar los *position embeddings* en transformers jerárquicos, comparando contra Swin o DeiT con el mismo protocolo de evaluación.
- **Control de calidad en inspección visual industrial**: clasificación de piezas o defectos en imágenes de alta resolución (384×384 o superior con *tiling*), integrada en una línea de producción con inferencia en GPU de gama media.
- **Prototipado rápido en `transformers`**: al exponerse mediante `AutoImageProcessor` y `AutoModelForImageClassification`, se integra en pocas líneas en notebooks y servicios existentes sin infraestructura propia.

## Benchmarks y rendimiento

El único dato publicado en la información disponible es el top-1 de ImageNet-1K reportado por el autor para este checkpoint.

| Benchmark | Métrica | Resultado |
|---|---|---|
| ImageNet-1K | Top-1 accuracy | 87,4 |

No se han publicado en la información disponible resultados de otros benchmarks (top-5, throughput, latencia) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint en FP32 ocupa aproximadamente 0,8 GB, por lo que la inferencia en FP32 requiere del orden de 1-2 GB de VRAM incluyendo activaciones a 384×384 con lotes pequeños. En FP16 el peso se reduce a ~0,4 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no medidas publicadas.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lotes pequeños; para *fine-tuning* a 384×384 se recomienda una GPU de 16-24 GB (RTX 4090, A5000, A100 40 GB) por el coste de activaciones con parches de 4×4.
- **GPU de consumo**: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores para inferencia; para entrenamiento, RTX 4090 o A100 según el tamaño de lote.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (requisito imprescindible), servidores de inferencia basados en PyTorch como TorchServe o un endpoint propio con FastAPI; no se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que están orientados a modelos generativos de lenguaje y no cubren esta arquitectura personalizada.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Rendimiento reportado |
|---|---|---|---|---|
| Iwin-large-patch4-window12-384-22kto1k | 204,3 M | Imagen 384×384 | MIT | 87,4 top-1 ImageNet-1K |
| Iwin-small-patch4-window12-384 (misma colección) | 51,6 M | Imagen 384×384 | MIT | no disponible en la información |
| Swin Transformer large (referencia de la misma familia) | no disponible en la información | Imagen 384×384 | no disponible en la información | no disponible en la información |

La información disponible solo permite comparar con la variante *small* de la propia colección (51,6 M de parámetros, también afinada en ImageNet-1K a 384×384), que ofrece un punto de partida para elegir entre coste y precisión dentro de la misma arquitectura. No se dispone de datos verificados de alternativas externas en el material consultado, por lo que no se incluyen cifras de comparación que no estén respaldadas.

## Limitaciones y advertencias

- **Ámbito restringido**: es un clasificador de 1.000 clases de ImageNet-1K. Fuera de ese vocabulario requiere reentrenamiento de la cabeza o *fine-tuning* completo; no genera descripciones ni responde a preguntas sobre la imagen.
- **Riesgo de sesgo**: ImageNet-1K arrastra sesgos conocidos de representación (desequilibrio geográfico, de género y de contexto) que el modelo hereda; las predicciones pueden degradarse en dominios visuales alejados de la distribución de entrenamiento (imágenes médicas, satelitales, industriales).
- **Alucinación en sentido clasificatorio**: al ser un clasificador cerrado, siempre asigna una de las 1.000 clases con alta confianza incluso ante entradas fuera de distribución; es imprescindible calibrar umbrales o añadir detección de *out-of-distribution* en producción.
- **Código remoto**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor no auditado por el equipo de `transformers`; conviene revisar y fijar la revisión del repositorio antes de desplegar.
- **Madurez del ecosistema**: la arquitectura no está en el núcleo de `transformers`, no hay soporte documentado de servidores de inferencia estándar y el repositorio registra 0 descargas y 0 *likes*, lo que reduce la probabilidad de que los problemas estén resueltos por la comunidad.
- **Licencia**: MIT permite uso comercial y modificación con atribución; aun así, conviene verificar las condiciones de las licencias de los datos de entrenamiento (ImageNet) para el caso de uso previsto.
- **Sin datos de robustez**: no se han publicado resultados de robustez ante corrupción, adversariales o cambios de dominio, ni métricas de latencia, lo que obliga a una validación propia antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cominder/iwin-large-patch4-window12-384-22kto1k
- Colección Iwin Transformer: https://huggingface.co/collections/cominder/iwin-transformer
- Paper (arXiv:2507.18405): https://arxiv.org/abs/2507.18405
- Repositorio de código y entrenamiento: https://github.com/Cominder/Iwin-Transformer
- Releases del repositorio: https://github.com/Cominder/Iwin-Transformer/releases
