# ml-resources/sapiens2-pretrain-0.8b

## Resumen

Sapiens2-0.8B es un backbone de visión transformer de 0,814 mil millones de parámetros (0,818 B según la model card) desarrollado por Meta y distribuido en HuggingFace. Forma parte de la familia Sapiens2, un conjunto de modelos preentrenados sobre 1.000 millones de imágenes de personas y diseñados específicamente para tareas centradas en el ser humano: estimación de pose, segmentación de partes del cuerpo, estimación de normales de superficie y pointmaps. Este repositorio concreto contiene únicamente el backbone preentrenado, no una cabeza de tarea: su salida son características densas por parche, pensadas para inicializar y afinar cabezas específicas.

El problema que resuelve es el de disponer de un extractor de características de alta resolución y dominio específico (personas) que supere a los backbones genéricos cuando la tarea es de análisis humano. La arquitectura es un ViT con RoPE, GQA, SwiGLU, RMSNorm y QK-norm, con dimensión de embedding 1.280, 32 capas y 16 cabezas de atención. Se preentrenó a una resolución de 1024 × 768 píxeles con parches de 16 px, lo que se traduce en 3.072 tokens de parche por imagen y 2,592 T FLOPs por forward pass.

La relevancia actual del modelo es doble. Por un lado, la familia Sapiens2 cubre un rango de escalas que va de 0,114 B a 5,071 B de parámetros, lo que permite elegir el punto de la curva coste/precisión adecuado para cada despliegue. Por otro, el repositorio analizado es un espejo no oficial (autor `ml-resources`) del original de Meta; no cuenta con descargas ni valoraciones y su licencia es la Sapiens2 License, que no es una licencia de código abierto estándar y debe revisarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT (RoPE, GQA, SwiGLU, RMSNorm, QK-norm) |
| Parámetros totales | 814.283.540 (0,814 B según safetensors; la model card indica 0,818 B) |
| Longitud de contexto | No aplica a texto. A 1024 × 768 con parches de 16 px: 3.072 tokens de parche por imagen |
| Tipos de cuantización | No disponible (solo safetensors; no se publican versiones GGUF, AWQ, GPTQ ni int8/int4) |
| Idiomas soportados | No disponible (modelo de visión; no procesa texto) |
| Licencia | Sapiens2 License (`license: other`) |
| Formato de pesos | safetensors (`sapiens2_0.8b_pretrain.safetensors`) |
| Dimensión de embedding | 1.280 |
| Capas | 32 |
| Cabezas de atención | 16 (número de cabezas KV no disponible) |
| FLOPs por forward | 2,592 T |
| Resolución de preentrenamiento | 1024 × 768 (alto × ancho) |
| Tamaño de parche | 16 px |
| Datos de preentrenamiento | 1.000 millones de imágenes de personas |
| Tarea (pipeline) | image-feature-extraction |
| Librería | sapiens2 |
| Tamaño del repositorio | 3,3 GB |

## Arquitectura y entrenamiento

El modelo es un vision transformer sin componentes convolucionales ni módulos de estado recurrente. La model card detalla las decisiones de diseño: codificación posicional rotatoria (RoPE), atención con consultas agrupadas (GQA, lo que reduce el coste de memoria del KV cache), activación SwiGLU en el bloque feed-forward, normalización RMSNorm y QK-norm sobre las consultas y claves. Con 32 capas, dimensión 1.280 y 16 cabezas, el modelo procesa imágenes a 1024 × 768 con parches de 16 × 16, es decir, 64 × 48 = 3.072 tokens por imagen (más el token de clase o tokens especiales que añada la implementación). El checkpoint ocupa aproximadamente 3,3 GB, magnitud coherente con pesos en fp32 (814 M × 4 bytes ≈ 3,26 GB); no se indica explícitamente la precisión de almacenamiento.

El preentrenamiento se realizó sobre 1.000 millones de imágenes de personas, un corpus de dominio específico y notablemente más estrecho que los datasets genéricos tipo LAION o ImageNet. No se especifica en la información disponible el número de tokens vistos, la composición demográfica del dataset, la proporción de imágenes sintéticas ni si se aplicaron etapas de alineación (RLHF, DPO u otras), algo que en un backbone de visión resulta poco habitual de todos modos. Tampoco se documentan innovaciones de inferencia como decodificación especulativa, atención lineal o destilación; el modelo se limita a producir características densas. La familia incluye una variante de 4K de resolución (`sapiens2-pretrain-1b-4k`), lo que sugiere soporte de entradas de mayor resolución en ese miembro, pero no se aportan detalles técnicos de cómo se logra.

## Capacidades

- Extracción de características densas: la salida del forward es un tensor `(B, num_tokens, embed_dim)` con `embed_dim = 1280`, apto como entrada de cabezas de tarea.
- Inicialización para fine-tuning de tareas centradas en personas: estimación de pose, segmentación de partes del cuerpo, normales de superficie y pointmaps, según la model card.
- Procesamiento de alta resolución: 1024 × 768 píxeles con parches de 16 px, lo que preserva detalle fino en siluetas y extremidades.
- Representaciones de dominio específico: al haberse preentrenado sobre 1.000 millones de imágenes humanas, las características están sesgadas hacia la apariencia, la postura y la forma del cuerpo humano.
- No genera texto ni imágenes: es un modelo exclusivamente de extracción de características.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta entrada de texto, audio ni vídeo de forma nativa (una secuencia de vídeo requeriría procesar fotogramas por separado).
- Capacidades multilingües: no aplica.
- No se documentan capacidades zero-shot de clasificación, detección o captioning; el modelo no incluye cabezas entrenadas para ello.

## Casos de uso

- Inicialización para estimación de pose 2D y 3D: se congela o se afina el backbone y se entrena una cabeza de keypoints sobre él. El preentrenamiento sobre 1.000 millones de imágenes humanas reduce la necesidad de datos etiquetados de pose y mejora la generalización a posturas poco frecuentes.
- Segmentación de partes del cuerpo para probadores virtuales: las características densas a 1024 × 768, con 3.072 tokens de parche, permiten delimitar con precisión brazos, torso y piernas, lo que resulta útil para superponer prendas sobre la silueta del usuario en comercio electrónico.
- Estimación de normales de superficie y reconstrucción 3D de avatares: las normales por píxel derivadas del backbone alimentan pipelines de reconstrucción de malla para generación de avatares y contenido de realidad aumentada.
- Pointmaps y gemelos digitales: la predicción de coordenadas 3D densas a partir de una sola imagen facilita la digitalización de cuerpos para biomecánica deportiva o para animación.
- Análisis biomecánico en deporte: extracción de características por fotograma en vídeo de entrenamiento, alimentando modelos posteriores de detección de gestos o de riesgo de lesión. Cada fotograma se procesa de forma independiente, por lo que el coste crece linealmente con la duración del vídeo.
- Preprocesado en pipelines de moderación de contenido: un backbone centrado en personas puede servir como primera etapa para detectar y localizar figuras humanas antes de aplicar clasificadores específicos de política.
- Investigación sobre sesgos en visión artificial: al ser un backbone de dominio específico con 0,814 B de parámetros y pesos abiertos, permite auditar qué información demográfica codifican las representaciones internas de un modelo entrenado a gran escala sobre imágenes de personas.
- Robótica e interacción persona-robot: seguimiento de poses y gestos en tiempo real sobre GPU de gama media, ya que el modelo cabe holgadamente en tarjetas de consumo.
- Destilación a modelos más pequeños: el miembro de 0,8 B sirve como teacher o como punto intermedio entre el de 0,1 B y el de 5 B para generar variantes ligeras de despliegue en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card proporciona únicamente magnitudes estructurales (parámetros, FLOPs, dimensión de embedding, capas y cabezas) y la tabla comparativa de la familia, pero no incluye métricas de precisión como AP de pose, mIoU de segmentación, error angular de normales ni métricas de pointmaps, ni comparaciones con otros backbones. El paper referenciado (arXiv:2604.21681) no aporta cifras en el material proporcionado.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 3,26 GB, coherente con el tamaño del repositorio (3,3 GB).
- Pesos en fp16/bf16: aproximadamente 1,63 GB, si se convierte el checkpoint.
- Pesos en int8: aproximadamente 0,81 GB; en int4, aproximadamente 0,41 GB. Ninguna de estas dos cuantizaciones está publicada por el autor, por lo que requerirían conversión propia.
- Memoria de activaciones: no cuantificada en la información disponible. Con batch 1 a 1024 × 768 (3.072 tokens, 1.280 de dimensión, 32 capas) la huella adicional es moderada, pero crece de forma cuadrática con el número de tokens por imagen si se aumenta la resolución.
- GPU de consumo: cabe en cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) en fp32 y sin problemas en fp16/bf16. Para lotes grandes o vídeo conviene partir de 16-24 GB.
- GPU de centro de datos: A100, H100 y L40S permiten lotes grandes y mayor throughput; no se publican cifras de latencia ni de imágenes por segundo.
- Despliegue: la vía documentada es el repositorio oficial `facebookresearch/sapiens2` con PyTorch (`pip install -e .`) y `safetensors`. No se documenta integración con vLLM, llama.cpp, Ollama, TGI, TensorRT ni exportación a ONNX; al no ser un modelo generativo de texto, estas herramientas no son de aplicación directa.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, cada forward a 1024 × 768 consume 2,592 T FLOPs.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con los demás miembros de la familia Sapiens2, cuyas especificaciones sí están publicadas.

| Modelo | Parámetros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.1B | 0,114 B | 0,342 T | 768 | 12 | 12 |
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1.024 | 24 | 16 |
| Sapiens2-0.8B (este) | 0,818 B | 2,592 T | 1.280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1.536 | 40 | 24 |
| Sapiens2-1B-4K | 1,607 B | No disponible | 1.536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2.432 | 56 | 32 |

Respecto a alternativas externas de la misma categoría (backbones de visión para extracción de características, como DINOv2, o modelos de segmentación de personas, como los de la familia SAM), no se dispone en la información proporcionada de parámetros, contexto, métricas ni licencias que permitan una comparación rigurosa, por lo que se indica "no disponible". La diferencia frente a las alternativas de la tabla es de escala y de licencia idéntica (todos los miembros comparten la Sapiens2 License).

## Limitaciones y advertencias

- Es un backbone, no un modelo listo para producir: no emite etiquetas, cajas ni máscaras; requiere una cabeza de tarea afinada o entrenada desde cero.
- Sesgos conocidos: no disponibles. El preentrenamiento sobre 1.000 millones de imágenes de personas implica un riesgo elevado de sesgo demográfico (tono de piel, complexión, vestimenta, contexto cultural), pero la composición del dataset no se documenta, por lo que no puede cuantificarse.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de representaciones erróneas en oclusiones, posturas extremas, imágenes de baja calidad o personas parcialmente visibles.
- Limitaciones de resolución: el modelo se preentrenó a 1024 × 768. No se documenta el comportamiento con otras relaciones de aspecto o resoluciones; la variante `1B-4K` sugiere que existe trabajo específico para entradas mayores, no extrapolable a este checkpoint.
- Dominio restringido: al estar preentrenado sobre imágenes humanas, su rendimiento en escenas sin personas no está caracterizado y probablemente sea inferior al de backbones genéricos.
- Licencia: Sapiens2 License, marcada como `other` y no como licencia de código abierto estándar. Es imprescindible leer `LICENSE.md` antes de cualquier uso comercial; los términos de uso aceptable, atribución y redistribución no se detallan en la información disponible.
- Naturaleza del repositorio: `ml-resources/sapiens2-pretrain-0.8b` es un espejo no oficial de `facebook/sapiens2-pretrain-0.8b`. No hay garantía de sincronización con el original, de integridad de los pesos ni de mantenimiento. Para uso en producción conviene referenciar el repositorio oficial de Meta.
- Adopción nula verificable: 0 descargas y 0 valoraciones en el momento de la consulta, lo que limita la evidencia comunitaria sobre su funcionamiento real.
- Sin cifras de rendimiento: no hay benchmarks publicados en la información disponible, por lo que cualquier decisión de adopción debería basarse en una evaluación propia sobre el dominio objetivo.
- Restricciones de despliegue: al no existir integraciones con servidores de inferencia habituales, el escalado horizontal exige implementar el servicio sobre PyTorch.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-pretrain-0.8b
- Repositorio original de Meta: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Paper: https://arxiv.org/pdf/2604.21681 (referencia `arxiv:2604.21681`)
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Código fuente: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Colección de la familia Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Variantes de la familia: https://huggingface.co/facebook/sapiens2-pretrain-0.1b, https://huggingface.co/facebook/sapiens2-pretrain-0.4b, https://huggingface.co/facebook/sapiens2-pretrain-1b, https://huggingface.co/facebook/sapiens2-pretrain-1b-4k, https://huggingface.co/facebook/sapiens2-pretrain-5b
- La búsqueda web realizada no devolvió resultados relevantes: los enlaces obtenidos correspondían a otras acepciones de la abreviatura "ML" (mililitros, Mercedes-Benz Clase M/ML y el videojuego Mobile Legends), sin relación con el modelo.
