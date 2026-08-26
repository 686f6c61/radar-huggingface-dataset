# manoj45232/moda-fashion-distilled-512d-vision-only

## Resumen

El modelo `manoj45232/moda-fashion-distilled-512d-vision-only` es un checkpoint ligero de solo visión derivado de [`HopitAI/moda-fashion-distilled-512d`](https://huggingface.co/HopitAI/moda-fashion-distilled-512d), un modelo de retrieval de moda basado en ViT-B/16 SigLIP. Este checkpoint elimina los pesos del encoder de texto y conserva únicamente el encoder visual y la proyección lineal aprendida de 768 a 512 dimensiones, produciendo embeddings L2-normalizados de 512 dimensiones para búsqueda de similitud imagen-imagen.

El modelo está pensado para aplicaciones de moda como búsqueda visual de productos, detección de duplicados, recomendaciones visuales y clustering de catálogos. Al ser solo visión, no soporta consultas de texto ni búsqueda texto-imagen. Con aproximadamente 93,3 millones de parámetros en FP32 y un tamaño de 0,4 GB, es lo suficientemente ligero para ejecutarse en CPU o GPU de consumo.

Su relevancia radica en que el modelo base alcanza un 67,63% de Fine Recall@1 en el benchmark LookBench, superando a modelos publicados como GR-Pro (cerrado) y Marqo-FashionSigLIP, según la documentación de Hopit AI. Este checkpoint vision-only ofrece la misma capacidad de extracción de características visuales en un paquete reducido, ideal para integraciones que solo necesitan embeddings de imagen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 SigLIP (solo encoder visual) + proyección lineal 768→512 |
| Parametros totales | 93.277.440 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | FP32 (única precisión distribuida) |
| Idiomas soportados | no aplica (solo visión, sin encoder de texto) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo utiliza un backbone ViT-B/16 SigLIP como encoder visual, que procesa imágenes de 224×224 píxeles y produce características visuales de 768 dimensiones. Sobre estas características se aplica una proyección lineal aprendida (sin bias) que reduce la dimensionalidad a 512, seguida de normalización L2. El checkpoint conserva 162 tensores `visual.*` y un tensor `proj.weight` de forma `[512, 768]`.

El modelo base `HopitAI/moda-fashion-distilled-512d` fue fine-tuneado a partir de SigLIP para retrieval de moda, pero no se dispone de detalles específicos sobre el dataset de entrenamiento, el número de tokens o el proceso de optimización (si se usó RLHF, DPO u otra técnica). La documentación indica que el modelo base logra 67,63% Fine Recall@1 en LookBench, un benchmark público de retrieval de moda. Este checkpoint vision-only se crea eliminando los pesos del encoder de texto, manteniendo intacto el encoder visual y la proyección, por lo que el rendimiento en tareas de imagen debería ser equivalente al del modelo base.

## Capacidades

- Generación de embeddings de imagen de 512 dimensiones L2-normalizados para búsqueda de similitud por coseno.
- Búsqueda imagen-imagen: dado un producto de moda, recuperar productos visualmente similares.
- Detección de duplicados y casi-duplicados en catálogos de moda.
- Indexación de catálogos para bases de datos vectoriales (FAISS, Milvus, etc.).
- Clustering de productos por similitud visual.
- Extracción de características visuales para recomendaciones basadas en imagen.
- No soporta texto: no puede procesar consultas en lenguaje natural, ni generar embeddings de texto, ni realizar búsqueda texto-imagen.

## Casos de uso

- Búsqueda visual en tiendas online: el usuario sube una foto de una prenda y el sistema devuelve productos similares del catálogo. El modelo genera el embedding de la imagen de consulta y se compara con los embeddings precalculados de los productos mediante similitud coseno.
- Detección de duplicados en catálogos: al indexar un catálogo de moda, se pueden identificar productos duplicados o casi-duplicados comparando los embeddings de todas las imágenes, lo que permite limpiar la base de datos.
- Recomendación de productos complementarios: a partir de un producto de referencia, se pueden sugerir artículos visualmente similares (mismo estilo, color o patrón) usando los embeddings generados.
- Clustering de productos por estilo: agrupar automáticamente prendas en categorías visuales (vestidos, camisas, zapatos) mediante algoritmos de clustering sobre los embeddings, útil para organizar catálogos grandes.
- Indexación de catálogos para búsqueda inversa: precalcular los embeddings de todas las imágenes del catálogo y almacenarlos en una base vectorial para permitir búsquedas en tiempo real con latencia baja.
- Moderación de contenido visual: detectar imágenes de productos que no corresponden a la categoría esperada comparando su embedding con los de productos válidos, ayudando a filtrar entradas incorrectas en plataformas de marketplace.

## Benchmarks y rendimiento

El modelo base `HopitAI/moda-fashion-distilled-512d` reporta un 67,63% de Fine Recall@1 en el benchmark LookBench, superando a GR-Pro (modelo cerrado) y Marqo-FashionSigLIP, según la documentación de Hopit AI. No se dispone de resultados específicos para este checkpoint vision-only, pero al conservar el encoder visual y la proyección, se espera un rendimiento equivalente en tareas de imagen.

| Modelo | Fine Recall@1 (LookBench) | Licencia |
|---|---|---|
| HopitAI/moda-fashion-distilled-512d (base) | 67,63% | MIT |
| Marqo-FashionSigLIP | no disponible (superado por el base) | no disponible |
| GR-Pro | no disponible (superado por el base, cerrado) | propietaria |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 93,3 millones de parámetros en FP32, lo que ocupa aproximadamente 373 MB en memoria. Con overhead de activaciones y preprocesado, cabe en cualquier GPU con al menos 1 GB de VRAM, y también se puede ejecutar en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna, incluidas las de consumo como NVIDIA GTX 1060, RTX 2060, RTX 3060, o incluso integradas. Para inferencia por lotes grandes, una GPU con 4 GB o más es suficiente.
- Despliegue: al ser un modelo de visión puro, se puede integrar fácilmente con PyTorch y OpenCLIP. No requiere frameworks específicos de servidores de LLM como vLLM o TGI, pero se puede servir mediante una API REST propia o usando herramientas como ONNX Runtime para optimización.
- Latencia: en una GPU moderna, la inferencia de una sola imagen tarda del orden de milisegundos (típicamente 5-20 ms en una RTX 3090). En CPU, puede tardar entre 50 y 200 ms por imagen, dependiendo del hardware.
- Throughput: con procesamiento por lotes, se pueden procesar cientos de imágenes por segundo en GPU, lo que permite indexar catálogos de decenas de miles de productos en minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión embedding | Rendimiento (LookBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| manoj45232/moda-fashion-distilled-512d-vision-only | 93,3 M | 512 | no disponible (hereda del base) | MIT | Abierto |
| HopitAI/moda-fashion-distilled-512d | ~93 M (visión) + texto | 512 | 67,63% Fine Recall@1 | MIT | Abierto |
| Marqo-FashionSigLIP | no disponible | no disponible | inferior al base | no disponible | Abierto (presumiblemente) |
| GR-Pro | no disponible | no disponible | inferior al base | propietaria | Cerrado |

El modelo vision-only es una versión reducida del modelo base, sin el encoder de texto. Para aplicaciones que solo necesitan embeddings de imagen, ofrece la misma capacidad visual con un tamaño menor y sin dependencias de texto.

## Limitaciones y advertencias

- No soporta texto: al carecer del encoder de texto, no puede realizar búsqueda texto-imagen, ni generar embeddings de texto, ni responder a consultas en lenguaje natural. Cualquier integración que requiera estas capacidades debe usar el modelo base completo.
- Sesgos potenciales: al ser un modelo entrenado para moda, puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, sesgos de género, raza o talla). No se dispone de información sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto. Sin embargo, los embeddings pueden producir falsos positivos en búsquedas de similitud si las imágenes son muy diferentes pero comparten características superficiales.
- Limitaciones de contexto: al ser un modelo de visión, no tiene contexto de texto. La resolución de entrada está fijada en 224×224, lo que puede perder detalles finos en imágenes de alta resolución.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar los términos del modelo base y de los datos de entrenamiento si se utiliza en producción.
- Precisión FP32: el checkpoint se distribuye en FP32, lo que duplica el uso de memoria en comparación con FP16. Para despliegues con recursos limitados, se podría convertir a FP16 o cuantizar, aunque no se proporcionan versiones cuantizadas.

## Enlaces

- [Modelo en Hugging Face (vision-only)](https://huggingface.co/manoj45232/moda-fashion-distilled-512d-vision-only)
- [Modelo base HopitAI/moda-fashion-distilled-512d](https://huggingface.co/HopitAI/moda-fashion-distilled-512d)
- [Modelo HopitAI/moda-fashion-distilled (768-d)](https://huggingface.co/HopitAI/moda-fashion-distilled)
- [Repositorio GitHub de MODA (benchmark y modelos)](https://github.com/hopit-ai/Moda)
- [Perfil de Hopit AI en GitHub](https://github.com/hopit-ai/.github/tree/main/profile)
