# alphaedge-ai/siglip2-giant-opt-patch16-384-kan-16384

## Resumen

siglip2-giant-opt-patch16-384-kan-16384 es una variante "trimmed" (podada) del codificador vision-lenguaje SigLIP 2 de Google, publicada por el usuario alphaedge-ai. El modelo original, google/siglip2-giant-opt-patch16-384, es un encoder multimodal que proyecta imágenes y texto a un espacio latente compartido, pensado para tareas de clasificación zero-shot, recuperación imagen-texto y generación de embeddings multimodales. Esta versión reduce el vocabulario del tokenizador de texto de 256.000 a 16.384 tokens, conservando únicamente los tokens relevantes para el kannada (idioma `kn`), lo que rebaja el recuento de parámetros de 1.871.885.426 a 1.595.847.794 (un 14,75% menos) y el tamaño del repositorio hasta los 6,4 GB.

La motivación de esta poda es puramente de eficiencia: al eliminar las filas de la matriz de embeddings de texto asociadas a tokens que no se usan en kannada, se reduce el uso de memoria y el tamaño del artefacto sin tocar el resto de la arquitectura. El precio a pagar es una pérdida drástica de cobertura multilingüe: el modelo solo está pensado para texto en kannada y, según advierte la propia model card, su rendimiento en otros idiomas será degradado porque esos tokens ya no existen en el vocabulario.

Es relevante para equipos que despliegan búsqueda o clasificación de imágenes con consultas en kannada y necesitan un artefacto más ligero que el SigLIP 2 original. No obstante, conviene señalar que el modelo tiene un uso muy limitado (13 descargas, 0 likes en el momento de la consulta) y que no se han publicado métricas de evaluación específicas para esta variante podada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-encoder (visión + texto) basado en SigLIP 2, variante "giant" con patch size 16 y resolución 384 |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, no generativo; la longitud efectiva depende del tokenizador de texto y del número de parches de imagen) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | kannada (`kn`) únicamente; el resto de idiomas del SigLIP 2 original quedan fuera del vocabulario |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SigLIP 2, un par de encoders transformer (uno visual con parches de 16x16 a 384x384 píxeles y otro textual) entrenados con una función de pérdida sigmoidea en lugar de softmax contrastivo, lo que permite entrenar con batches más grandes y mejora la calidad de los embeddings. La variante "giant" es la de mayor tamaño dentro de la familia SigLIP 2 publicada por Google. La model card no detalla el número de tokens de entrenamiento ni la composición del dataset original; esa información debe consultarse en el paper de SigLIP 2 (arXiv:2502.14786).

La única modificación respecto al modelo base es la poda del vocabulario. Según la model card, se muestrearon 200.000 textos del dataset lbourdois/fineweb-2-trimming para determinar qué tokens del vocabulario original de 256.000 son relevantes en kannada, y se conservaron los 16.384 más frecuentes. Las filas correspondientes del embedding de texto se mantienen y el resto se descartan, de ahí la reducción de 276.037.632 parámetros. No se realizó un reentrenamiento posterior a la poda según la información disponible, por lo que el resto de pesos (encoder visual, capas transformer, proyecciones) son los del checkpoint original.

## Capacidades

- Clasificación zero-shot de imágenes: dado un conjunto de etiquetas candidatas en kannada, el modelo asigna una probabilidad a cada una mediante similitud coseno en el espacio latente compartido.
- Recuperación imagen-texto y texto-imagen: genera embeddings normalizados para ambas modalidades, aptos para búsqueda semántica.
- Similitud texto-imagen: la API de sentence-transformers permite calcular matrices de similitud entre lotes de imágenes y textos.
- Soporte multilingüe: limitado exclusivamente al kannada; el vocabulario podado elimina el resto de idiomas.
- Tool calling / function calling: no aplica, es un modelo de embeddings, no generativo.
- Razonamiento multi-paso o agentes: no aplica.
- Capacidades especiales: no se documentan modos de "thinking", visión densa, detección o segmentación en esta variante; el modelo base SigLIP 2 sí incluye capacidades de localización y características densas, pero la model card de esta poda no las detalla ni las valida.

## Casos de uso

- Búsqueda visual en kannada: indexar un catálogo de imágenes y permitir consultas en lenguaje natural en kannada, usando los embeddings normalizados para recuperación por similitud coseno. El modelo es adecuado porque su vocabulario está optimizado para ese idioma y el artefacto pesa menos que el original.
- Etiquetado automático de imágenes con taxonomías en kannada: clasificación zero-shot contra un conjunto cerrado de etiquetas, útil para moderación de contenido o catalogación en plataformas dirigidas al mercado de Karnataka.
- Filtrado de contenido multimodal: comparar imágenes entrantes con descripciones textuales en kannada para detectar material no deseado o fuera de política, aprovechando que no requiere fine-tuning.
- Recuperación aumentada (RAG) multimodal: usar los embeddings de imagen y texto para alimentar un índice vectorial y recuperar ilustraciones relevantes a partir de preguntas en kannada.
- Accesibilidad: generar descripciones alternativas o etiquetas en kannada para imágenes en aplicaciones de lectura de pantalla, mediante clasificación contra un vocabulario controlado.
- Deduplicación y clustering de imágenes: agrupar imágenes visualmente similares en pipelines de curación de datasets, usando los embeddings del encoder visual.
- Prototipado rápido en entornos con poca VRAM: al ser un 14,75% más pequeño que el SigLIP 2 giant original, encaja mejor en GPUs de gama media para experimentación con datos en kannada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación para esta variante podada (ni Recall@K, ni precisión zero-shot, ni comparación numérica con el modelo base más allá del recuento de parámetros y vocabulario).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,2 GB solo para pesos (1.595.847.794 parámetros x 2 bytes), más activaciones y buffers; en la práctica, entre 4 y 6 GB según el tamaño de lote y la resolución de imagen.
- VRAM estimada en fp32: alrededor de 6,4 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4, A10). Para lotes grandes o fp32, se recomienda A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16. En tarjetas de 6 GB puede requerir reducción de lote o resolución.
- Opciones de despliegue: transformers (pipeline de zero-shot-image-classification), sentence-transformers, y servidores de embeddings compatibles con la API de sentence-transformers. No se publican pesos GGUF, por lo que llama.cpp/Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-kan-16384 | 1.595.847.794 | 16.384 | Kannada | apache-2.0 | Variante podada, sin benchmarks publicados |
| google/siglip2-giant-opt-patch16-384 | 1.871.885.426 | 256.000 | Multilingüe | apache-2.0 | Modelo base original de Google, con paper y evaluación publicados |
| google/siglip2-so400m-patch14-384 | no disponible en la información | no disponible | Multilingüe | apache-2.0 | Variante más pequeña de la familia SigLIP 2, orientada a menor coste |
| openai/clip-vit-large-patch14 | no disponible en la información | no disponible | Inglés principalmente | MIT (según el repositorio original) | Alternativa clásica de doble encoder, sin cobertura específica de kannada |

La comparación directa con el modelo base es la más informativa: esta variante ahorra un 14,75% de parámetros y un 93,60% de vocabulario, a cambio de perder toda capacidad fuera del kannada. Frente a CLIP, la familia SigLIP 2 ofrece mejor calidad de embeddings según su paper, pero esta poda concreta no aporta métricas que lo confirmen para el caso de uso en kannada.

## Limitaciones y advertencias

- Cobertura lingüística restringida: el vocabulario solo contiene tokens de kannada; cualquier texto en otro idioma se tokenizará de forma degradada o con tokens de reserva, lo que invalidará los embeddings.
- Sin benchmarks publicados: no hay evidencia numérica de que el rendimiento en kannada se mantenga respecto al modelo base; la afirmación "should perform similarly" de la model card es una expectativa, no un resultado medido.
- Sesgos heredados: al conservar los pesos del SigLIP 2 original, el modelo arrastra los sesgos de los datos de entrenamiento de Google, no documentados en esta model card.
- Riesgo de alucinación: al ser un modelo de similitud, no genera texto, pero puede asignar alta probabilidad a etiquetas incorrectas en imágenes ambiguas o fuera de distribución.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base es de Google y conviene revisar los términos del checkpoint original y del dataset de minería (lbourdois/fineweb-2-trimming) antes de un despliegue en producción.
- Madurez del artefacto: 13 descargas y 0 likes indican poca validación comunitaria; no hay garantía de mantenimiento ni de que el proceso de poda se haya replicado con controles de calidad.
- Formato único: solo se publican pesos safetensors; no hay variantes cuantizadas ni GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- Fecha de creación futura (2026-06-04): conviene verificar la procedencia y la integridad del repositorio antes de confiar en él para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-kan-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
