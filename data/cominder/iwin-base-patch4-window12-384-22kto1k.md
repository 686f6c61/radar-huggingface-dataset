# cominder/iwin-base-patch4-window12-384-22kto1k

## Resumen

Iwin Transformer es un transformer visual jerárquico sin embeddings posicionales, desarrollado por Cominder y presentado en el artículo arXiv:2507.18405. El modelo resuelve la limitación de Swin Transformer, que necesitaba dos bloques consecutivos de atención desplazada para aproximar una atención global. Iwin combina atención por ventanas intercaladas (interleaved window attention) con convoluciones separables en profundidad, logrando intercambio de información global en un único módulo. Esta versión concreta, `iwin-base-patch4-window12-384-22kto1k`, es un modelo de tamaño base preentrenado en ImageNet-22k y ajustado en ImageNet-1k a resolución 384×384, alcanzando un 87,4 % de precisión top-1 en ImageNet-1K. Su licencia MIT y su disponibilidad en formato safetensors lo hacen atractivo para integración en pipelines de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Iwin Transformer (vision transformer jerárquico sin embeddings posicionales, con interleaved window attention y convoluciones separables en profundidad) |
| Parametros totales | no disponible (tamaño base, comparable a Swin-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384×384 píxeles (resolución de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (.pth) |

## Arquitectura y entrenamiento

Iwin Transformer introduce una arquitectura jerárquica sin embeddings posicionales. En lugar de depender de la atención desplazada de Swin, utiliza un mecanismo de atención por ventanas intercaladas que conecta tokens distantes, mientras que convoluciones separables en profundidad enlazan tokens vecinos. Esto permite el intercambio de información global dentro de un solo módulo, reduciendo la necesidad de apilar bloques consecutivos. El modelo se preentrenó en ImageNet-22k (14 millones de imágenes, 21 841 clases) y posteriormente se ajustó en ImageNet-1k a resolución 384×384. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, al ser un modelo puramente visual.

## Capacidades

- Clasificación de imágenes: alcanza un 87,4 % de precisión top-1 en ImageNet-1K.
- Segmentación semántica: validado en benchmarks visuales, aunque no se detallan métricas específicas.
- Reconocimiento de acciones en video: el artículo menciona su aplicación en esta tarea.
- Generación de imágenes condicionadas por clase: el módulo central de Iwin puede reemplazar el módulo de self-attention en modelos generativos, demostrando su versatilidad.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural, al ser exclusivamente visual.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en sistemas de etiquetado automático de fotografías, con una precisión superior a la de Swin-base y una inferencia más eficiente al requerir un solo bloque para atención global.
- Segmentación semántica en imágenes médicas o de satélite: su capacidad para manejar resolución 384×384 y su diseño jerárquico lo hacen adecuado para extraer máscaras de objetos en imágenes de alta resolución.
- Reconocimiento de acciones en vídeo: puede utilizarse como extractor de características espaciales en pipelines de análisis de vídeo, aprovechando su eficiencia computacional.
- Módulo de atención en modelos generativos: el componente de interleaved window attention puede sustituir al self-attention en arquitecturas de generación de imágenes, mejorando la coherencia global sin coste adicional.
- Sistemas de búsqueda visual: su representación de características puede emplearse para indexar y recuperar imágenes por similitud en bases de datos grandes.
- Aplicaciones de visión en edge computing: al ser un modelo base con un peso de 0,7 GB, puede desplegarse en dispositivos con GPU limitada, como Jetson o GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible más allá de la precisión top-1 en ImageNet-1K (87,4 %). No se dispone de comparaciones detalladas con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de aproximadamente 88 millones de parámetros (tamaño base), la inferencia en FP32 requiere unos 350 MB de VRAM, y en FP16 unos 175 MB. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una NVIDIA GTX 1050 Ti hasta una RTX 4090 o A100. Para entrenamiento o fine-tuning se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, ONNX Runtime o mediante frameworks como vLLM (aunque no es un LLM, puede usarse para clasificación). También es compatible con Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, la inferencia sobre una imagen 384×384 debería completarse en menos de 10 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Precisión top-1 (ImageNet-1K) | Licencia |
|---|---|---|---|---|
| Iwin-base (este modelo) | ~88M (estimado) | 384×384 | 87,4 % | MIT |
| Swin-base (microsoft/swin-base-patch4-window12-384-in22k) | ~88M | 384×384 | no disponible en la información | MIT |
| Swin-large (microsoft/swin-large-patch4-window12-384-in22k) | ~197M | 384×384 | no disponible en la información | MIT |

Iwin supera a Swin en eficiencia al lograr atención global en un solo bloque, pero no se dispone de comparativas numéricas directas en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos: al entrenarse en ImageNet, puede heredar sesgos de género, etnia o contexto presentes en ese dataset.
- Alucinación: no aplica, al ser un modelo discriminativo de visión, no generativo de texto.
- Limitaciones de contexto: la resolución fija de 384×384 puede requerir redimensionado de imágenes, lo que puede degradar el rendimiento en imágenes con proporciones muy diferentes.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se recomienda citar el artículo original.
- Caveat de producción: el modelo no incluye mecanismos de calibración de confianza; para aplicaciones críticas se recomienda añadir un umbral de decisión o un clasificador adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/cominder/iwin-base-patch4-window12-384-22kto1k)
- [Artículo arXiv](https://arxiv.org/abs/2507.18405)
- [Repositorio GitHub](https://github.com/Cominder/Iwin-Transformer)
- [Pesos en GitHub (archivo .pth)](https://huggingface.co/cominder/Iwin-Transformer/blob/main/iwin_base_patch4_window12_384.pth)
- [Releases del repositorio](https://github.com/Cominder/Iwin-Transformer/releases)
