# alphaedge-ai/siglip2-giant-opt-patch16-384-asm-16384

## Resumen

siglip2-giant-opt-patch16-384-asm-16384 es una variante podada del codificador vision-lenguaje SigLIP 2 de Google, publicada por alphaedge-ai y especializada en el idioma asamés. El modelo parte de `google/siglip2-giant-opt-patch16-384` y aplica la técnica de *trimming* de vocabulario para reducir el tokenizador de 256.000 a 16.384 tokens, lo que elimina los tokens poco frecuentes en asamés y deja un modelo un 14,75% más pequeño (de 1.871.885.426 a 1.595.847.794 parámetros). El repositorio ocupa 6,4 GB en formato safetensors y se distribuye bajo licencia Apache 2.0.

La relevancia de esta variante es práctica: mantiene la arquitectura y el comportamiento del SigLIP 2 original (atención, patch size de 16 y resolución de 384 píxeles) pero con una huella de memoria notablemente menor, lo que facilita el despliegue en entornos con recursos limitados cuando el caso de uso está acotado al asamés. SigLIP 2 es un codificador multimodal que produce embeddings conjuntos de imagen y texto, útil para clasificación zero-shot, búsqueda semántica multimodal y similitud texto-imagen.

Conviene subrayar que no es un modelo generativo: no produce texto libre ni razona, sino que calcula representaciones vectoriales alineadas entre modalidades. Su pipeline declarado en Hugging Face es `zero-shot-image-classification` y se integra con `transformers` y `sentence-transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (SigLIP 2), patch size 16, resolución 384 |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | asamés (as) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2, un codificador de doble torre (imagen y texto) con objetivo de entrenamiento tipo sigmoide en lugar de softmax contrastivo, tal como describe el paper arXiv:2502.14786. La variante "giant-opt" corresponde al tamaño grande de la familia SigLIP 2, con patch size 16 y resolución de entrada 384x384. El modelo base fue entrenado por Google con datos multilingües de imagen-texto; esta versión de alphaedge-ai no reentrena los pesos, sino que poda el vocabulario del tokenizador y recorta las matrices de embedding correspondientes.

El proceso de trimming se documenta en el blog de Hugging Face "Introduction to Trimming": se usaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para determinar qué tokens del vocabulario original son relevantes en asamés, y se conservaron 16.384. Esto reduce el vocabulario un 93,60% y los parámetros totales un 14,75%. No se documentan fases de RLHF, DPO ni ajuste fino específico sobre datos asamés más allá de la selección de vocabulario.

## Capacidades

- Clasificación zero-shot de imágenes mediante etiquetas de texto en asamés.
- Generación de embeddings conjuntos de imagen y texto para similitud multimodal.
- Búsqueda semántica texto-imagen y recuperación de imágenes por descripción.
- Codificación de imágenes en representaciones vectoriales reutilizables.
- Codificación de texto en asamés alineada con el espacio visual.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto libre ni respuestas conversacionales.
- Capacidad multilingüe limitada al asamés por la poda de vocabulario.

## Casos de uso

- Clasificación automática de imágenes con etiquetas en asamés: el modelo asigna probabilidades a un conjunto de etiquetas candidatas para una imagen, útil en sistemas de moderación o catalogación donde el vocabulario de categorías está en asamés.
- Búsqueda visual en catálogos: indexar embeddings de imágenes y consultar con descripciones textuales en asamés para recuperar productos o contenidos, aprovechando la alineación texto-imagen del codificador.
- Etiquetado de datasets para aprendizaje supervisado: generar etiquetas zero-shot sobre grandes volúmenes de imágenes en asamés para preanotar y reducir el coste de anotación manual.
- Filtrado de contenido en plataformas regionales: detectar imágenes que coincidan con categorías definidas en asamés, con menor huella de memoria que el modelo original.
- Sistemas de recomendación multimodal: calcular similitud entre imágenes y descripciones textuales en asamés para ordenar resultados personalizados.
- Investigación en visión-lenguaje de bajos recursos: servir como base ligera para experimentos con asamés donde el modelo completo de 1.871 millones de parámetros resulta excesivo en memoria.
- Deduplicación y clustering de imágenes: usar los embeddings de imagen para agrupar contenido visual similar en pipelines de curación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones.
- VRAM estimada en fp16/bf16: aproximadamente 3,2 GB para pesos.
- GPU recomendadas: A100, H100, L40S para despliegues de producción; RTX 4090 y RTX 3090 para desarrollo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) en fp16; en fp32 requiere al menos 8-10 GB.
- Opciones de despliegue: `transformers` pipeline, `sentence-transformers`, y servidores de embeddings compatibles con la librería.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-asm-16384 | 1.595.847.794 | 16.384 | asamés | Apache 2.0 | no disponible |
| google/siglip2-giant-opt-patch16-384 | 1.871.885.426 | 256.000 | multilingüe | Apache 2.0 | no disponible |
| google/siglip2-base-patch16-224 | no disponible | no disponible | multilingüe | Apache 2.0 | no disponible |

La comparación principal es con el modelo base del que deriva: esta variante sacrifica cobertura multilingüe a cambio de un 14,75% menos de parámetros y un vocabulario un 93,60% menor, lo que se traduce en menor uso de memoria y un tokenizador más eficiente para asamés. Frente a versiones base de SigLIP 2, el modelo giant ofrece mayor capacidad de representación a costa de más recursos.

## Limitaciones y advertencias

- El modelo solo está optimizado para asamés; el rendimiento en otros idiomas puede degradarse notablemente porque se eliminaron tokens del vocabulario.
- No es un modelo generativo: no puede responder preguntas, redactar texto ni mantener conversaciones.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2, no evaluado en esta variante.
- La poda de vocabulario puede afectar a la calidad de los embeddings de texto si aparecen caracteres o subpalabras no contempladas en los 16.384 tokens retenidos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de minería.
- No se documentan evaluaciones cuantitativas de rendimiento tras el trimming, por lo que la afirmación de "rendimiento similar" del autor no está respaldada con métricas publicadas.
- El repositorio tiene muy pocas descargas (10) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-asm-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
