# canvit/probe-ade20k-40k-dv3s-512px

## Resumen

`canvit/probe-ade20k-40k-dv3s-512px` es una cabeza de segmentación semántica lineal (linear probe) entrenada sobre las características congeladas de `facebook/dinov3-vits16-pretrain-lvd1689m` (DINOv3 ViT-S/16) a 512 px de resolución, y publicada por el equipo de CanViT (Canvas Vision Transformer). No es un modelo generativo ni un segmentador de propósito general: es un artefacto de investigación diseñado como "referencia de visión pasiva" para medir hasta qué punto las representaciones de un backbone de visión estándar, decodificadas linealmente, resuelven ADE20K (150 clases) en el protocolo exacto del paper de CanViT.

El modelo resuelve una única tarea: dada una imagen RGB de 512×512 px, producir logits por píxel de parche (rejilla de 32×32) para 150 clases semánticas. La cabeza en sí tiene 59.286 parámetros según los pesos en safetensors, y es una composición de dropout, BatchNorm y una convolución 1×1; la práctica totalidad de la capacidad de cómputo y de la calidad de las predicciones proviene del backbone DINOv3 ViT-S/16, que se usa siempre congelado. Su relevancia actual es metodológica: sirve como línea base reproducible y como control frente a los modelos de visión activa (CanViT), que procesan la escena mediante secuencias de vistazos en lugar de una sola pasada.

Al ser un checkpoint de probing y no un modelo conversacional, carece de contexto textual, tool calling, capacidades multilingües o modo de razonamiento. Su utilidad está acotada a evaluación de representaciones, ablaciones de protocolo, preetiquetado de datos y prototipado ligero en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza lineal (dropout + BatchNorm + convolución 1×1) sobre características de parche congeladas de DINOv3 ViT-S/16 (parches de 16 px) |
| Parámetros totales | 59.286 (solo la cabeza; dato real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en sentido textual; entrada fija de 512×512 px, tokenizada en una rejilla de 32×32 parches (1.024 tokens) |
| Tipos de cuantización | No disponible (no se documentan pesos GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible (modelo de visión; las etiquetas siguen la taxonomía de ADE20K en inglés) |
| Licencia | MIT (cabeza); el backbone DINOv3 se distribuye bajo su propia licencia |
| Formato de pesos | safetensors |
| Biblioteca | canvit-pytorch (>= 0.2; para la versión 0.1 hay que usar `revision="canvit-pytorch-0.1"`) |
| Tarea (pipeline) | image-segmentation |
| Modelo base | facebook/dinov3-vits16-pretrain-lvd1689m (congelado, fine-tune: no) |
| Dataset de entrenamiento | scene_parse_150 (ADE20K) |
| Tamaño de repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura del sistema completo es un ViT con parches de 16 px (DINOv3 ViT-S/16, ~21 M de parámetros) seguido de una cabeza lineal específica de segmentación. La cabeza consiste en dropout, una capa BatchNorm y una convolución 1×1 que proyecta los 384 canales de las características de parche a las 150 clases de ADE20K. En inferencia, la imagen de 512×512 px se procesa como una rejilla de 32×32 parches, y la salida son logits de forma [1, 150, 32, 32]; el upsampling a resolución completa queda fuera del modelo. El backbone nunca se actualiza: el probe aprende únicamente la proyección lineal sobre características congeladas.

El entrenamiento siguió el protocolo de probing del paper: 40.000 pasos con batch size 16, optimizador AdamW con learning rate máximo de 0,0003 y weight decay de 0,001, calentamiento lineal de 1.500 pasos seguido de decaimiento coseno, dropout de 0,1, autocast en bfloat16 y aumentos de datos consistentes en recortes aleatorios de escala 0,5 a 2 y volteos horizontales. No se documenta en la información disponible ningún uso de RLHF, DPO ni fine-tuning del backbone, ni innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Segmentación semántica densa de 150 clases sobre imágenes RGB de 512×512 px, con salida en rejilla de 32×32 (un logit por clase y por parche).
- Decodificación lineal directa sobre características de DINOv3 ViT-S/16 sin reentrenar el backbone, lo que permite reutilizar el mismo extractor de características para varias cabezas.
- Reutilización del módulo `SegmentationProbe` exportado por `canvit_pytorch` sobre cualquier mapa de características espaciales, no solo sobre la salida de DINOv3.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No genera texto ni mantiene conversaciones: no hay entrada en lenguaje natural.
- Sin capacidades multilingües: las etiquetas de salida corresponden a la taxonomía fija de ADE20K (inglés).
- Sin modo "thinking", sin visión a resolución variable dinámica entrenada, sin audio y sin vídeo (la entrada es una imagen fija).
- Función principal como referencia de visión pasiva para comparar con modelos de visión activa (CanViT) bajo un protocolo idéntico.

## Casos de uso

- Línea base en investigación de visión activa: cualquier trabajo que evalúe modelos que miran escenas por vistazos necesita un control que vea la escena completa de una sola pasada; este probe proporciona exactamente ese control con el protocolo del paper.
- Evaluación de representaciones de DINOv3: al ser una decodificación lineal, la precisión del probe mide de forma casi directa cuánta información semántica densa contienen las características de `dinov3-vits16-pretrain-lvd1689m` a 512 px.
- Preetiquetado de datos de segmentación: se puede usar para generar máscaras iniciales sobre imágenes de escenas interiores y exteriores y pasarlas a revisión humana, reduciendo el coste de anotación frente al etiquetado desde cero.
- Prototipado en CPU o hardware modesto: con un backbone de ~21 M de parámetros y una cabeza de 59.286 parámetros, el pipeline completo cabe en memoria de sobra y no requiere GPU para funcionar.
- Reproducción de ablaciones del protocolo de probing: los hiperparámetros documentados (40.000 pasos, batch 16, AdamW, lr 0,0003, warmup de 1.500 pasos) permiten replicar el experimento y aislar el efecto de cambios en resolución o aumentos.
- Análisis de contenido visual a gran escala: indexado o filtrado de imágenes por composición de escena (cielo, edificio, vegetación, mobiliario) en pipelines de datos, aceptando la granularidad gruesa de 32×32.
- Extracción de máscaras gruesas para robótica o planificación de alto nivel: la rejilla 32×32 puede alimentar un mapa de ocupación semántico de baja resolución, con upsampling cuando se necesite detalle.
- Comparación cruzada de cabezas: al compartir backbone con `canvit/probe-ade20k-40k-dv3s-256px`, permite medir el efecto de la resolución de entrada (512 px frente a 256 px) manteniendo el resto del protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de mIoU ni comparaciones numéricas, y el repositorio únicamente documenta hiperparámetros de entrenamiento. La documentación del proyecto CanViT afirma cualitativamente que un CanViT-B congelado y evaluado con linear probing supera a los modelos densos de visión activa anteriores en ADE20K, pero esa afirmación se refiere a CanViT-B, no a este probe, y no viene acompañada de cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bf16 con lote 1. Los pesos del backbone (~21 M de parámetros) ocupan aproximadamente 42 MB en bf16 y la cabeza unos 0,24 MB en fp32; el consumo dominante son las activaciones de una imagen de 512×512 px.
- GPU recomendadas: cualquiera con soporte CUDA moderna sirve; el modelo es lo bastante pequeño para que una RTX 3060, RTX 4090 o incluso una GPU integrada no supongan cuello de botella. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, y también en CPU (la propia model card muestra el ejemplo de uso con `torch.device("cpu")`).
- Opciones de despliegue: PyTorch con la librería `canvit-pytorch` (>= 0.2). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni exportación a GGUF; tampoco se documentan pesos cuantizados.
- Latencia y throughput estimados: no disponibles. Al no publicarse mediciones, cualquier cifra sería una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada / salida | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-dv3s-512px (este) | 59.286 (cabeza) + backbone DINOv3 ViT-S/16 (~21 M) | 512×512 px → rejilla 32×32, 150 clases | No disponible | MIT (cabeza) + licencia propia de DINOv3 | Hugging Face, 8 descargas, 0 likes |
| canvit/probe-ade20k-40k-dv3s-256px | No disponible | 256×256 px → rejilla 16×16, 150 clases | No disponible | MIT (cabeza) + licencia propia de DINOv3 | Hugging Face |
| canvit/probe-ade20k-40k-s512-c8-in21k | No disponible | Características de canvas 8×8 de un CanViT-B preentrenado | No disponible | MIT | Hugging Face |
| canvit/probe-ade20k-40k-s512-c32-in21k | No disponible | Características de canvas 32×32 de un CanViT-B preentrenado | No disponible | MIT | Hugging Face |
| facebook/dinov3-vits16-pretrain-lvd1689m | ~21 M | Backbone de propósito general; sin cabeza de segmentación | No disponible | Licencia DINOv3 (propia, distinta de MIT) | Hugging Face |

No se dispone de comparaciones numéricas frente a segmentadores supervisados de tamaño similar (por ejemplo, arquitecturas tipo SegFormer-B0), porque la información proporcionada no incluye métricas de ninguno de los dos lados.

## Limitaciones y advertencias

- Resolución de salida baja: los logits se emiten en una rejilla de 32×32, un parche por cada 16×16 píxeles de la imagen original; los bordes de objeto son necesariamente imprecisos y requiere upsampling bilineal para obtener una máscara a resolución completa.
- Vocabulario cerrado de 150 clases: no puede segmentar categorías fuera de la taxonomía de ADE20K ni combinarlas con texto.
- Generalización no documentada: no hay métricas ni validación en dominios distintos de `scene_parse_150` (por ejemplo, imágenes médicas, satelitales o de documentos).
- Sesgos del dataset: `scene_parse_150` está compuesto por fotografías de escenas cotidianas, con sobrerrepresentación de interiores y clases raras con pocos ejemplos, lo que se traduce en peor segmentación de categorías poco frecuentes.
- Riesgo de predicciones plausibles pero incorrectas: aunque el modelo no genera texto y por tanto no "alucina" en sentido lingüístico, puede producir máscaras coherentes en apariencia sobre regiones ambiguas o de baja textura; no se documenta ningún umbral de confianza ni calibración.
- Dependencia estricta de versiones: la model card avisa de que los ficheros de `canvit-pytorch` 0.1 permanecen bajo la revisión `canvit-pytorch-0.1`; mezclar versiones puede invalidar los resultados.
- Restricciones de licencia: la licencia MIT cubre únicamente la cabeza del probe. El backbone `facebook/dinov3-vits16-pretrain-lvd1689m` se distribuye bajo su propia licencia, que debe revisarse por separado antes de cualquier uso comercial.
- Falta de métricas: no hay mIoU ni ninguna otra cifra publicada en la información disponible, por lo que no es posible justificar su uso en producción con datos objetivos.
- Adopción muy baja y sin garantía de mantenimiento: 8 descargas y 0 likes en el momento de la consulta, con última actualización del repositorio en septiembre de 2026.
- Sin soporte de cuantización ni formatos de despliegue alternativos documentados (GGUF, ONNX, TensorRT).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-512px
- Colección de checkpoints de CanViT: https://huggingface.co/canvit
- Modelo base (DINOv3 ViT-S/16): https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Código de referencia: https://github.com/m2b3/CanViT
- Implementación en PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Página del proyecto: https://m2b3.github.io/CanViT/
- Probe equivalente a 256 px: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-256px
- Probe sobre canvas 8×8 a 512 px: https://huggingface.co/canvit/probe-ade20k-40k-s512-c8-in21k
- Probe sobre canvas 32×32 a 512 px: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/scene_parse_150
