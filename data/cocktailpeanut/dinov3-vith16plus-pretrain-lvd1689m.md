# cocktailpeanut/dinov3-vith16plus-pretrain-lvd1689m

## Resumen

DINOv3 ViT-H+/16 es un modelo de visión por computador desarrollado por Meta AI, publicado originalmente en el repositorio `facebook/dinov3-vith16plus-pretrain-lvd1689m`. Se trata de un Vision Transformer (ViT) de tipo "H+" (variante ampliada del tamaño Huge) con parches de 16x16 píxeles, entrenado con el método de autosupervisión DINOv3 sobre el dataset LVD-1689M. El repositorio aquí descrito es un espejo no oficial publicado por el usuario `cocktailpeanut`, que redistribuye los pesos sin el formulario de acceso previo del repositorio original.

El modelo resuelve el problema de obtener representaciones visuales densas y de alta calidad sin necesidad de etiquetas, útiles como extractor de características para tareas downstream como segmentación, detección, clasificación o generación condicionada por imagen. Su relevancia actual radica en que DINOv3 introduce mejoras sobre DINOv2 en calidad de features densas y escalado, y en que este espejo facilita la descarga automatizada en pipelines que no pueden completar el proceso de solicitud de acceso del repositorio oficial.

El modelo cuenta con 840.592.640 parámetros (aproximadamente 840 M) y un tamaño de repositorio de 3,4 GB. No es un modelo generativo de texto: es un encoder visual puro, por lo que sus capacidades se centran en la extracción de embeddings y features, no en generación de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 16x16, variante H+ (DINOv3) |
| Parametros totales | 840.592.640 (~840 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | DINOv3 License (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de la familia DINOv3, con parches de 16x16 y una variante de tamaño H+ (Huge plus), que suma aproximadamente 840 M de parámetros. El entrenamiento se realizó con el método de autosupervisión DINOv3 sobre el dataset LVD-1689M, un corpus de imágenes a gran escala empleado por Meta en la familia DINOv3. El modelo es un encoder de representaciones visuales: no incluye cabeza de generación de texto ni de imagen, y su salida son embeddings y mapas de features densos.

La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición pormenorizada del dataset ni si hubo etapas de alineación adicionales (RLHF/DPO no aplican a un encoder visual). La innovación principal de la familia DINOv3, según el paper referenciado (arXiv:2508.10104), es la mejora en la calidad de features densas y la escalabilidad del entrenamiento autosupervisado; no se dispone de más detalles técnicos en la información facilitada.

## Capacidades

- Extracción de embeddings visuales globales a partir de imágenes.
- Generación de features densos por parche, útiles para segmentación semántica y tareas densas.
- Clasificación de imágenes mediante cabezas lineales o fine-tuning sobre las features congeladas.
- Detección y segmentación de objetos cuando se usa como backbone.
- Búsqueda y recuperación de imágenes por similitud (image retrieval) mediante embeddings.
- Condicionamiento visual en pipelines generativos (el autor indica que se usa como encoder de condicionamiento de imagen en el pipeline MageFlow idol-turbo splat).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto, audio o vídeo.

## Casos de uso

- Segmentación semántica con backbone congelado: se extraen los features densos por parche del ViT-H+/16 y se entrena una cabeza ligera de segmentación, aprovechando la calidad de representaciones densas de DINOv3.
- Clasificación de imágenes a gran escala: se congelan los pesos y se entrena una regresión logística o MLP sobre el embedding global, reduciendo coste de entrenamiento frente a fine-tuning completo.
- Recuperación de imágenes por similitud: se indexan embeddings de un catálogo y se consulta por imagen de referencia mediante distancia coseno, adecuado para motores de búsqueda visual.
- Backbone de detección de objetos: se integra como extractor de features en arquitecturas tipo DETR o similar, sustituyendo backbones CNN por un ViT preentrenado de forma autosupervisada.
- Condicionamiento en pipelines de generación de imagen: tal como indica el autor, se emplea como encoder de imagen en el pipeline MageFlow idol-turbo splat para tareas de generación condicionada.
- Preprocesado para anotación asistida: se generan features para agrupar imágenes no etiquetadas (clustering) y priorizar la anotación manual en datasets nuevos.
- Control de calidad visual en producción: detección de imágenes fuera de distribución comparando embeddings frente a una referencia, útil para filtrar entradas anómalas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,4 GB solo para pesos, más memoria de activaciones; en la práctica se recomienda al menos 8 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB para pesos, más activaciones; cabe en GPUs consumer de 8 GB con lotes moderados.
- GPUs recomendadas: A100, H100 o L40S para procesamiento por lotes a gran escala; RTX 4090 o RTX 3090 para inferencia y fine-tuning ligero.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4090) para inferencia en precisión reducida.
- Opciones de despliegue: PyTorch nativo con `transformers` o carga directa de safetensors; exportación a ONNX o TensorRT para producción; no se dispone de confirmación de soporte en vLLM, llama.cpp u Ollama, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv3 ViT-H+/16 (este espejo) | ~840 M | no aplica (visión) | DINOv3 License | Hugging Face, espejo no oficial |
| DINOv3 ViT-H+/16 (original Meta) | ~840 M | no aplica (visión) | DINOv3 License | Hugging Face, con solicitud de acceso |
| DINOv2 ViT-g/14 | no disponible en la información | no aplica (visión) | DINOv2 License | Hugging Face |
| CLIP ViT-L/14 | no disponible en la información | no aplica (visión) | MIT (según versión) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no está publicado ni respaldado por Meta, aunque los pesos, la configuración y la licencia son idénticos byte a byte al original según los hashes SHA-256 indicados por el autor.
- La licencia DINOv3 License no es de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial. Los derechos de uso se conceden directamente por Meta a cada receptor del espejo, según el propio autor.
- Al ser un encoder visual, no genera texto ni responde a instrucciones; no debe evaluarse con benchmarks de lenguaje.
- Riesgo de sesgos heredados del dataset LVD-1689M, cuya composición no se detalla en la información disponible.
- No se dispone de información sobre robustez frente a dominios fuera de distribución, imágenes médicas o satelitales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación del espejo.
- No se dispone de información sobre cuantizaciones oficiales ni sobre soporte en runtimes de inferencia distintos de PyTorch.

## Enlaces

- Repositorio del espejo: https://huggingface.co/cocktailpeanut/dinov3-vith16plus-pretrain-lvd1689m
- Modelo original de Meta: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Paper DINOv3: https://arxiv.org/abs/2508.10104
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Pipeline que lo usa (MageFlow): https://github.com/bschooled/caeleste-image-generation
