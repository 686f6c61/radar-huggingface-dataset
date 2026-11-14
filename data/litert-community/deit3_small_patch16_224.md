# litert-community/deit3_small_patch16_224

## Resumen

deit3_small_patch16_224 es un modelo de clasificación de imágenes basado en la arquitectura DeiT III (Data-efficient Image Transformer, tercera generación), publicado originalmente por Meta AI (Facebook Research) y convertido al formato LiteRT (TFLite) por la comunidad litert-community para su despliegue en dispositivos. El modelo original fue entrenado por Hugo Touvron, Matthieu Cord y Hervé Jégou, y esta versión concreta deriva de los pesos de `timm/deit3_small_patch16_224.fb_in1k`, es decir, el checkpoint oficial de Ross Wightman en la librería PyTorch Image Models afinado sobre ImageNet-1k.

Se trata de un Vision Transformer (ViT) de tipo "small", con 22,1 millones de parámetros y 4,6 GMACs por inferencia a una resolución fija de 224×224 píxeles. Su interés radica en que ofrece un equilibrio razonable entre precisión y coste computacional para tareas de clasificación de imágenes, y en que su empaquetado en LiteRT permite ejecutarlo en móviles, navegadores y dispositivos de borde sin necesidad de un runtime de PyTorch.

La relevancia actual de esta ficha es doble: por un lado, documenta una alternativa de código abierto (aunque con licencia no especificada en el repositorio) para clasificación de imágenes en producción; por otro, sirve como ejemplo de la tendencia a publicar conversiones de modelos de visión a formatos ligeros para inferencia local. No es un modelo generativo ni multimodal: es un clasificador cerrado sobre las 1.000 clases de ImageNet-1k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) DeiT III, patch size 16, resolución 224×224 |
| Parametros totales | 22,1 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el repo distribuye `model.tflite`; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de salida son las 1.000 clases de ImageNet-1k en inglés) |
| Licencia | no disponible |
| Formato de pesos | TFLite (LiteRT) |
| Resolución de entrada | 224 × 224 × 3 |
| GMACs | 4,6 |
| Activaciones | 11,9 M |
| Dataset de entrenamiento | ImageNet-1k |
| Modelo base | timm/deit3_small_patch16_224.fb_in1k |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de la familia DeiT III: la imagen de entrada se divide en parches de 16×16 píxeles (196 tokens para 224×224), cada parche se proyecta linealmente a un embedding, se le suma codificación posicional y la secuencia resultante pasa por una pila de bloques transformer con self-attention multi-cabeza y MLP. La innovación principal de DeiT III respecto a DeiT original es el uso de recetas de entrenamiento mejoradas (mayor regularización, mezcla de datos, aumento de datos más agresivo y destilación opcional) que permiten entrenar ViT sobre ImageNet-1k sin depender de datasets externos masivos. El paper de referencia es "DeiT III: Revenge of the ViT" (arXiv:2204.07118).

En cuanto a los datos de entrenamiento, el checkpoint base `fb_in1k` está afinado sobre ImageNet-1k (1,28 millones de imágenes, 1.000 clases). No se dispone en la información proporcionada del número exacto de tokens vistos, la composición detallada del dataset, ni si hubo fases de RLHF o DPO (no aplicables en un clasificador de visión). Tampoco se documenta en esta ficha si la conversión a LiteRT introduce cambios en precisión (por ejemplo, cuantización post-entrenamiento); el autor solo indica que se trata de una conversión del modelo TIMM.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k (single-label, top-1 y top-5).
- Extracción de características: el modelo puede usarse como backbone de visión congelado o afinado para tareas downstream (detección, segmentación, recuperación de imágenes).
- Inferencia en dispositivos de borde: al estar en formato TFLite/LiteRT, se ejecuta en Android, iOS, navegadores (con WebAssembly/WebGPU) y microcontroladores de gama alta.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión generativa, audio ni ninguna modalidad distinta de la imagen de entrada.
- No se documentan capacidades de detección de objetos, segmentación ni captioning; es estrictamente un clasificador.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo se integra mediante LiteRT en apps Android/iOS para etiquetar fotos del usuario (por ejemplo, categorizar una galería por tipo de objeto) sin enviar datos a la nube, gracias a sus 4,6 GMACs y 22,1 M de parámetros.
- Moderación de contenido visual en el borde: filtrado preliminar de imágenes en dispositivos antes de subirlas a un servidor, usando las clases de ImageNet como señal aproximada (por ejemplo, detectar contenido no deseado en categorías como "weapon" o "person").
- Preprocesamiento en pipelines de visión: uso como extractor de features congelado para alimentar clasificadores lineales o sistemas de recuperación por similitud (image retrieval) en bases de datos de imágenes.
- Prototipado rápido en investigación: al ser un checkpoint pequeño y bien documentado, sirve como baseline para experimentos de destilación, cuantización o comparación de arquitecturas ViT frente a CNN.
- Aplicaciones de robótica y IoT: clasificación de objetos en tiempo real en dispositivos con recursos limitados (Raspberry Pi, Coral, etc.) para tareas de navegación o inventario.
- Control de calidad industrial: clasificación de piezas o productos en líneas de fabricación con cámaras de bajo coste, donde el modelo se ejecuta localmente en un dispositivo embebido.
- Filtrado de datasets: etiquetado automático de grandes colecciones de imágenes para pre-anotar y reducir el trabajo manual en proyectos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de precisión (top-1, top-5) ni comparaciones con otros modelos. El paper de DeiT III reporta resultados para la familia completa, pero no se reproducen aquí al no estar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional de GPU; al ser un modelo TFLite, el consumo de memoria es del orden de decenas de MB (el repo pesa 0,1 GB, incluyendo pesos y metadatos).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En caso de usar GPU, cualquier GPU moderna (RTX 3060 o superior, A100, H100) aceleraría la inferencia, pero el modelo está pensado para edge.
- ¿Cabe en consumer GPU? Sí, con enorme holgura; también cabe en móviles y dispositivos embebidos.
- Opciones de despliegue: LiteRT (TFLite Interpreter), TensorFlow Lite para Android/iOS, WebAssembly/WebGPU para navegador, y potencialmente conversión a otros runtimes (ONNX, Core ML) mediante herramientas externas no documentadas en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen fuertemente del hardware y del delegado de LiteRT utilizado (CPU, GPU, NNAPI, etc.).

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| deit3_small_patch16_224 (este) | 22,1 M | 224×224 | TFLite | no disponible | Conversión LiteRT de un checkpoint TIMM |
| deit3_base_patch16_224 | ~86 M | 224×224 | PyTorch/TIMM | según checkpoint original | Mayor precisión a mayor coste |
| ViT-B/16 (original) | ~86 M | 224×224 | PyTorch | Apache 2.0 (según repo) | Baseline clásico de ViT |
| MobileNetV3-Small | ~2,5 M | 224×224 | TFLite | Apache 2.0 | Mucho más ligero, precisión inferior |

No se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar la diferencia de precisión entre estos modelos. La comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre ImageNet-1k, un dataset con sesgos demográficos y geográficos documentados; puede clasificar erróneamente imágenes de personas o culturas poco representadas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir etiquetas incorrectas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no procesa texto; las etiquetas de salida están en inglés y limitadas a 1.000 clases. No es un modelo multilingüe ni multimodal.
- Restricciones de licencia para uso comercial: la licencia no está especificada en el repositorio, por lo que no se puede garantizar su uso comercial sin consultar al autor o al checkpoint original de TIMM.
- Caveat importante para producción: al ser una conversión a TFLite, puede haber degradación de precisión respecto al modelo PyTorch original si se aplicó cuantización; no se documenta en el repo.
- No se documenta el proceso de conversión ni se ofrecen scripts de reproducción, lo que dificulta la auditoría.
- El modelo tiene solo 106 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/deit3_small_patch16_224
- Paper DeiT III: https://arxiv.org/abs/2204.07118
- Repositorio original DeiT: https://github.com/facebookresearch/deit
- Repositorio TIMM: https://github.com/huggingface/pytorch-image-models
- Modelo base en TIMM: https://huggingface.co/timm/deit3_small_patch16_224.fb_in1k
