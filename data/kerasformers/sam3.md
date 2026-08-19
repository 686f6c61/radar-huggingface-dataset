# kerasformers/sam3

## Resumen

kerasformers/sam3 es una conversión íntegra a Keras 3 del modelo SAM 3 (Segment Anything with Concepts) desarrollado por Meta AI. SAM3 introduce un cambio de paradigma frente a sus predecesores: en lugar de segmentar por localización (puntos o cajas), segmenta por concepto, es decir, se le proporciona una frase nominal en lenguaje natural y el modelo localiza todas las instancias que coinciden con ese concepto en la imagen. Esta capacidad open-vocabulary lo hace especialmente relevante para tareas de segmentación semántica y de instancia sin necesidad de entrenar clases específicas.

La arquitectura combina un backbone ViT-L/14 con una FPN, un encoder-decoder estilo DETR con object queries y un codificador de texto CLIP para el lado del lenguaje. Esta conversión de KerasFormers permite ejecutar el modelo de forma idéntica en TensorFlow, JAX o PyTorch mediante el backend de Keras 3, lo que facilita su integración en entornos heterogéneos. El repositorio ocupa 5.0 GB y está disponible bajo la licencia SAM 3 License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/14 backbone + FPN + encoder-decoder estilo DETR con object queries + codificador de texto CLIP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de texto se procesan mediante CLIP, que está entrenado principalmente en inglés, aunque no se especifica) |
| Licencia | sam-license (ver enlace en Enlaces) |
| Formato de pesos | no disponible (repositorio de 5.0 GB, probablemente formato Keras nativo, pero no se indica) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SAM 3 descrita en el paper arXiv:2511.16719. Un backbone ViT-L/14 extrae características de la imagen, que se alimentan a una FPN (Feature Pyramid Network) para obtener mapas de características multiescala. Sobre estas características actúa un encoder-decoder de estilo DETR con object queries, que genera las máscaras de segmentación. Para el prompt de texto, se utiliza un codificador CLIP que convierte la frase nominal en un embedding que condiciona las queries. El modelo también admite cajas delimitadoras como prompts adicionales, que pueden combinarse con el texto.

No se proporcionan detalles sobre los datos de entrenamiento, el número de tokens procesados ni el proceso de optimización (RLHF, DPO, etc.). Esta versión de KerasFormers es una conversión de los pesos originales de facebook/sam3, por lo que el entrenamiento corresponde al modelo de Meta. La implementación en Keras 3 no modifica la arquitectura ni los pesos, solo el framework de ejecución.

## Capacidades

- Segmentación de instancias por concepto: dado un texto como "persona" o "coche", el modelo genera máscaras para todas las apariciones de ese concepto en la imagen.
- Segmentación semántica y detección: el repositorio incluye variantes `SAM3Detect` y `SAM3SemanticSegment` para tareas específicas de detección y segmentación semántica.
- Prompts mixtos: permite combinar cajas delimitadoras con texto para refinar la búsqueda.
- Multi-backend: gracias a Keras 3, el mismo código funciona en TensorFlow, JAX y PyTorch sin cambios.
- Carga de pesos flexible: se puede cargar desde el repositorio local (`kerasformers/sam3`) o desde el modelo original de HuggingFace (`hf:facebook/sam3`) si se tiene acceso.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente visual.

## Casos de uso

- Segmentación de objetos en imágenes médicas: dado un prompt textual como "tumor" o "órgano", el modelo puede localizar y segmentar estructuras en radiografías o resonancias sin necesidad de entrenar un modelo específico para cada tipo de lesión.
- Análisis de imágenes de satélite: detectar y segmentar construcciones, carreteras o vegetación mediante prompts en lenguaje natural, facilitando la actualización de mapas y estudios urbanísticos.
- Edición de imágenes: seleccionar automáticamente todos los objetos de una categoría (p. ej., "personas" o "vehículos") para aplicar filtros, eliminarlos o reemplazarlos en herramientas de retoque.
- Moderación de contenido visual: identificar y segmentar elementos no deseados en imágenes (p. ej., "armas" o "contenido violento") para su revisión o bloqueo automático.
- Búsqueda visual por concepto: en bases de datos de imágenes, usar prompts textuales para encontrar y segmentar todas las instancias de un objeto, mejorando la recuperación de información visual.
- Agricultura de precisión: segmentar cultivos, plagas o maleza en imágenes aéreas mediante descripciones textuales, ayudando a monitorizar el estado de los campos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como mIoU, AP o comparativas con otros modelos en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU recomendada ni latencia en la información disponible.
- Dado que el modelo usa un backbone ViT-L/14 y el repositorio ocupa 5.0 GB, se puede estimar que la inferencia requiere al menos 10-12 GB de VRAM en precisión FP16, pero este dato no está confirmado.
- Al ser una implementación Keras, se puede ejecutar en CPU, aunque con tiempos de inferencia mucho mayores.
- Para despliegue en producción, se podría utilizar TensorFlow Serving o un contenedor con el backend JAX o PyTorch, pero no se documentan opciones específicas como vLLM u Ollama (orientados a LLMs, no a visión).
- No se dispone de información sobre throughput ni latencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Prompt | Diferencias clave |
|---|---|---|---|
| kerasformers/sam3 | ViT-L/14 + FPN + DETR + CLIP | Texto y cajas | Segmentación por concepto open-vocabulary |
| kerasformers/sam_vit_huge | ViT-H (SAM original) | Puntos, cajas | Segmentación por localización, sin soporte de texto |
| kerasformers/sam2_hiera_large | Hiera (SAM2) | Puntos, cajas, máscaras | Segmentación por localización, soporte de video (en la versión original; esta conversión es solo imagen) |

SAM3 es el único de la familia que acepta prompts textuales directamente, lo que lo hace más flexible para tareas donde no se conoce la ubicación exacta de los objetos. SAM y SAM2 requieren que el usuario indique puntos o cajas, mientras que SAM3 permite describir el objeto en lenguaje natural. No se dispone de comparativas numéricas de rendimiento.

## Limitaciones y advertencias

- La licencia SAM 3 License (enlace en la sección de Enlaces) puede imponer restricciones de uso comercial; se recomienda revisarla antes de desplegar el modelo en producción.
- Al ser una conversión no oficial de KerasFormers, podrían existir pequeñas diferencias de precisión respecto al modelo original de Meta, aunque los pesos se transfieren directamente.
- El modelo original `facebook/sam3` está gated en HuggingFace; esta versión es accesible sin restricciones, pero la calidad puede depender de la conversión.
- No se han documentado sesgos específicos, pero como todo modelo de visión entrenado con datos web, puede presentar sesgos en el reconocimiento de ciertos grupos demográficos o contextos culturales.
- El modelo está pensado para prompts en inglés (dado el codificador CLIP), aunque no se especifica oficialmente; el rendimiento con otros idiomas puede ser inferior.
- No se proporcionan métricas de robustez ante imágenes adversarias o condiciones de iluminación extremas.
- La inferencia en CPU es lenta; se requiere GPU para un uso práctico en tiempo real.

## Enlaces

- [Repositorio HuggingFace: kerasformers/sam3](https://huggingface.co/kerasformers/sam3)
- [Paper SAM 3: Segment Anything with Concepts (arXiv:2511.16719)](https://arxiv.org/abs/2511.16719)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de SAM3 en KerasFormers](https://imvision12.github.io/KerasFormers/sam3/)
- [Guía de carga de pesos](https://imvision12.github.io/KerasFormers/loading_weights/)
- [Colección SAM v1/v2/v3 de KerasFormers](https://huggingface.co/collections/kerasformers/sam-v1-v2-v3-6a6a8c261dabbc2996e1b4a2)
- [Modelo original de Meta: facebook/sam3](https://huggingface.co/facebook/sam3)
- [Licencia SAM 3](https://github.com/facebookresearch/sam3/blob/main/LICENSE)
