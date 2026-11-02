# imagent/siglip2-base-384-onnx

## Resumen

SigLIP 2 base-patch16-384 es un modelo de visión-lenguaje desarrollado por Google que implementa una torre de imagen y una torre de texto entrenadas con una función de pérdida sigmoidea, sucesor de la familia SigLIP original. Esta ficha concreta, `imagent/siglip2-base-384-onnx`, no es el modelo original en PyTorch, sino una exportación a ONNX realizada por Imagent a partir del checkpoint `google/siglip2-base-patch16-384` en el commit `f775b65a79762255128c981547af89addcfe0f88`, pensada para inferencia portable en entornos sin PyTorch.

El repositorio contiene dos grafos ONNX separados: `vision.onnx` (186.613.790 bytes) para la torre de imagen y `text.onnx` (564.758.407 bytes) para la torre de texto, con pesos en fp16 y entradas/salidas en fp32. La arquitectura subyacente es un transformer de tipo ViT con parches de 16x16 y resolución de entrada de 384x384 para la parte visual, junto con un encoder de texto basado en el tokenizador de Gemma.

Su relevancia práctica radica en que permite ejecutar búsqueda semántica imagen-texto, clasificación zero-shot y extracción de embeddings multimodales en runtimes ONNX Runtime, sin dependencia del ecosistema Hugging Face Transformers ni de CUDA propietario. El tamaño total del repo es de 0,8 GB, lo que lo hace desplegable en hardware moderado. La licencia es Apache 2.0, heredada del modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (ViT para imagen + encoder de texto), entrenamiento con pérdida sigmoidea (SigLIP 2) |
| Parametros totales | no disponible (repo de 0,8 GB con pesos fp16 en dos grafos ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo original de texto tiene límite de 64 tokens; no confirmado en esta exportación) |
| Tipos de cuantizacion | Pesos en fp16, entradas y salidas en fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (entrenamiento multilingüe en el modelo original, no especificado en esta card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`vision.onnx`, `text.onnx`) + `vocab.json` para tokenización |

## Arquitectura y entrenamiento

El modelo original `google/siglip2-base-patch16-384` emplea una arquitectura de dos torres: un Vision Transformer con parches de 16x16 sobre imágenes de 384x384 píxeles y un encoder de texto transformer. A diferencia de CLIP, que usa contraste softmax, SigLIP 2 se entrena con una pérdida sigmoidea por pares, lo que elimina la necesidad de normalización global sobre el lote y mejora la eficiencia del entrenamiento. La tokenización del texto aplica minúsculas ASCII antes de pasar por el tokenizador de Gemma, tal como se indica en la card de esta exportación.

Esta ficha concreta no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (en un modelo de embeddings contrastivos no aplican habitualmente). La innovación técnica relevante aquí es la exportación a ONNX con verificación de paridad: el script `export_siglip.py`, incluido en el repo, declara las entradas y salidas de cada grafo y comprueba cada uno contra su fuente antes de escribirlo. El archivo `parity.json` contiene ids de tokens y embeddings de texto de referencia para validar implementaciones alternativas.

## Capacidades

- Extracción de embeddings de imagen y de texto en espacios vectoriales alineados, aptos para búsqueda y similitud coseno.
- Clasificación zero-shot de imágenes mediante comparación de embeddings con prompts de texto.
- Búsqueda semántica imagen-a-texto y texto-a-imagen.
- Retrieval multimodal para sistemas RAG con componentes visuales.
- Detección de duplicados y agrupamiento de imágenes por similitud.
- Filtrado de contenido y moderación visual por similitud con descripciones.
- Ejecución portable vía ONNX Runtime en CPU, GPU y entornos edge.
- No soporta tool calling, agentes ni generación de texto: es un modelo de feature extraction, no un LLM.

## Casos de uso

- Búsqueda semántica en bibliotecas de imágenes: indexar millones de fotos calculando embeddings con `vision.onnx` y consultar en lenguaje natural codificando la consulta con `text.onnx`; la separación en dos grafos permite precalcular el índice visual una sola vez.
- Moderación de contenido visual: comparar el embedding de una imagen subida por el usuario contra un conjunto de prompts que describen categorías prohibidas y aplicar un umbral de similitud coseno, sin necesidad de un clasificador entrenado ad hoc.
- Deduplicación de catálogos de producto: generar embeddings de las fotos de catálogo y agrupar por distancia para detectar imágenes repetidas o variantes del mismo artículo, aprovechando que el modelo cabe en 0,8 GB.
- Etiquetado automático de assets en DAM (digital asset management): asignar etiquetas comparando cada imagen contra un vocabulario controlado de descripciones, con la ventaja de que el vocabulario se puede ampliar sin reentrenar.
- Búsqueda visual en aplicaciones móviles o edge: al estar en ONNX con pesos fp16, se puede integrar en apps con ONNX Runtime Mobile para búsqueda por imagen en el dispositivo, sin enviar fotos a un servidor.
- Enriquecimiento de datasets de investigación: calcular embeddings de imagen y texto para análisis de sesgos, estudios de alineación multimodal o construcción de índices de recuperación en pipelines de ciencia de datos.
- Verificación de implementaciones propias: usar `parity.json` como test de regresión al portar el modelo a otros runtimes (TensorRT, CoreML, OpenVINO).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los dos grafos suman aproximadamente 0,75 GB en fp16; con activaciones y overhead de ONNX Runtime, se puede asumir un consumo de 1,5 a 2,5 GB en inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050 en adelante); para throughput alto, RTX 4090, A10, L4, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más; también en CPU con ONNX Runtime, aunque con mayor latencia.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA/TensorRT EP), ONNX Runtime Mobile, OpenVINO, TensorRT, CoreML vía conversión. No se proporcionan pesos GGUF ni integración directa con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| imagent/siglip2-base-384-onnx | no disponible (repo 0,8 GB) | no disponible | ONNX fp16 | Apache 2.0 | Exportación verificada con paridad, dos grafos separados |
| google/siglip2-base-patch16-384 | no disponible | no disponible | safetensors (PyTorch) | Apache 2.0 | Modelo original, requiere Transformers |
| openai/clip-vit-base-patch32 | ~151 M | 77 tokens | safetensors, ONNX disponibles | MIT | Alternativa CLIP clásica, menor resolución (224) |
| google/siglip-base-patch16-384 | ~203 M (vision) + texto | 64 tokens | safetensors | Apache 2.0 | Predecesor de SigLIP 2 |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings. No debe presentarse como un LLM.
- La card no documenta los idiomas soportados; el modelo original es multilingüe, pero esta exportación no lo confirma ni aporta evaluación por idioma.
- Riesgo de sesgo heredado del dataset de entrenamiento de SigLIP 2 (no documentado en esta card): posibles sesgos de género, raza y cultura en los embeddings.
- La tokenización requiere replicar exactamente el pipeline (minúsculas ASCII + tokenizador de Gemma) para que los embeddings de texto sean comparables con los de referencia; cualquier desviación degrada la similitud.
- Pesos en fp16 con entradas/salidas fp32: hay que respetar los tipos declarados en los grafos para evitar errores de ejecución o pérdida de precisión.
- Licencia Apache 2.0 permite uso comercial, pero la card pide citar el trabajo de Google y no este repositorio como fuente original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.
- No se documentan límites de longitud de texto en esta exportación; conviene verificar el comportamiento con secuencias largas antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/imagent/siglip2-base-384-onnx
- Modelo original: https://huggingface.co/google/siglip2-base-patch16-384
- Perfil del exportador: https://huggingface.co/imagent
- Commit de referencia del modelo original: `f775b65a79762255128c981547af89addcfe0f88`
- Script de exportación: `export_siglip.py` (incluido en el repositorio)
- Datos de paridad: `parity.json` (incluido en el repositorio)
