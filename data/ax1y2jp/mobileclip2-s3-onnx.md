# AX1Y2JP/MobileCLIP2-S3-ONNX

## Resumen

MobileCLIP2-S3-ONNX es una exportación a formato ONNX del modelo MobileCLIP2-S3, desarrollado originalmente por Apple Machine Learning Research. Se trata de un modelo de visión-lenguaje de tipo CLIP (contrastivo imagen-texto) pensado para clasificación de imágenes zero-shot, es decir, asignar etiquetas arbitrarias en lenguaje natural a una imagen sin entrenamiento específico previo. La exportación la firma el usuario AX1Y2JP y convierte los pesos originales (publicados en `apple/MobileCLIP2-S3` y en `timm/MobileCLIP2-S3-OpenCLIP`) en dos grafos ONNX separados: un codificador visual y un codificador de texto.

La relevancia de esta variante radica en el formato: al estar en ONNX (opset 23, ONNX Runtime 1.22+), puede desplegarse en entornos sin PyTorch, con variantes fp16 e int8 (esta última con cuantización weight-only `MatMulNBits` y embeddings de tokens int8). Incluye además una corrección del tokenizador respecto al original, que rellenaba con el token de fin de texto y degradaba la precisión zero-shot.

El modelo no publica parámetros totales ni longitud de contexto en la información disponible, aunque por su familia (MobileCLIP2) está orientado a eficiencia en dispositivos con recursos limitados. El repositorio ocupa 2,1 GB y la licencia es Apple Machine Learning Research Model License (apple-amlr), con restricciones de uso comercial que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP contrastivo imagen-texto; codificador visual FastViT reparameterizado, codificador de texto transformer (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto tokenizada; sin dato de longitud maxima) |
| Tipos de cuantizacion | fp16 (pesos fp16, E/S float32) e int8 (weight-only MatMulNBits, embedding de tokens int8 row-wise) |
| Idiomas soportados | no disponible (etiquetas en lenguaje natural; sin lista oficial) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement) |
| Formato de pesos | ONNX (opset 23), grafos separados `vision_model_fp16.onnx` / `text_model_fp16.onnx` y variantes `_int8`; incluye `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma CLIP: dos codificadores independientes que proyectan imágenes y textos a un espacio latente común, entrenados con un objetivo contrastivo. El codificador visual es un FastViT (familia de ViT híbrida con convoluciones) que en esta exportación se ha reparameterizado al estilo MobileOne, fusionando ramas para inferencia sin alterar las salidas. El codificador de texto es un transformer (detalles de capas y dimensión no disponibles). La similitud se calcula como producto escalar de embeddings normalizados multiplicado por un `logit_scale` almacenado en los metadatos ONNX.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; al ser un modelo contrastivo, el entrenamiento típico de esta familia es por pares imagen-texto a gran escala, pero no se confirma en la información proporcionada. La innovación destacable de esta exportación es la separación en dos grafos ONNX, la corrección del padding del tokenizador (id 0 en lugar del token de fin de texto, que degradaba la precisión zero-shot) y la inclusión de variantes fp16 e int8 para despliegue en CPU o GPU sin PyTorch.

## Capacidades

- Clasificación de imágenes zero-shot mediante etiquetas en lenguaje natural (pipeline `zero-shot-image-classification`).
- Generación de embeddings de imagen y de texto normalizados para búsqueda y similitud.
- Recuperación imagen-texto (image retrieval) y text-image retrieval usando los embeddings.
- Preprocesado de imagen fijo: redimensionado a 256 px en el lado corto y recorte central de 256×256, con normalización CLIP estándar.
- Inferencia en CPU y GPU mediante ONNX Runtime (proveedores `CUDAExecutionProvider` y `CPUExecutionProvider`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre: no es un modelo generativo.
- Capacidades multilingües: no disponible (dependen del tokenizador y del entrenamiento original, sin datos en la información).

## Casos de uso

- Etiquetado automático de imágenes en catálogos: se pasan descripciones candidatas como etiquetas y el modelo devuelve probabilidades por clase, útil para clasificar productos sin reentrenar.
- Moderación de contenido visual: comparar la imagen con etiquetas de categorías sensibles y aplicar umbrales sobre la probabilidad resultante.
- Búsqueda semántica de imágenes: indexar embeddings de imagen y consultar con embeddings de texto para recuperar coincidencias por similitud coseno.
- Filtrado previo en pipelines de datos: descartar o priorizar imágenes según etiquetas de calidad o temática antes de un procesamiento más costoso.
- Despliegue en dispositivos sin PyTorch: al ser ONNX con variantes fp16 e int8, encaja en entornos embebidos o servidores ligeros con ONNX Runtime.
- Organización de fototecas personales: clasificación zero-shot por escenas, objetos o personas descritas en texto, sin entrenamiento adicional.
- Prototipado rápido de clasificadores: sustituir un clasificador entrenado por etiquetas en lenguaje natural para validar una taxonomía antes de invertir en anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 2,1 GB y las variantes fp16 reducen el peso respecto a fp32, mientras que las int8 lo reducen aún más.
- GPU recomendadas: no disponibles; el ejemplo de uso emplea `CUDAExecutionProvider` con fallback a CPU, por lo que cualquier GPU compatible con ONNX Runtime CUDA sirve.
- GPU de consumo: previsiblemente cabe en GPUs consumer por el tamaño del repo, pero no se confirma en la información.
- Opciones de despliegue: ONNX Runtime (1.22+), con proveedores CUDA y CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileCLIP2-S3-ONNX (este) | no disponible | no disponible | Clasificación zero-shot imagen-texto | apple-amlr | ONNX en Hugging Face |
| apple/MobileCLIP2-S3 | no disponible | no disponible | Clasificación zero-shot imagen-texto | apple-amlr | Pesos originales en Hugging Face |
| timm/MobileCLIP2-S3-OpenCLIP | no disponible | no disponible | Clasificación zero-shot imagen-texto | apple-amlr | Pesos en formato OpenCLIP/timm |
| CLIP original (OpenAI) | no disponible en esta ficha | no disponible | Clasificación zero-shot imagen-texto | licencia propia de OpenAI | Pesos en múltiples formatos |

No se dispone de datos de rendimiento comparado en la información proporcionada; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento; solo embeddings y probabilidades de similitud.
- Riesgo de sesgo: al ser un modelo contrastivo entrenado con pares imagen-texto, puede heredar sesgos de su dataset original, no documentados aquí.
- Riesgo de alucinación en sentido amplio: puede asignar alta probabilidad a etiquetas incorrectas si el vocabulario candidato no cubre bien la imagen.
- La variante int8 es solo para ONNX Runtime y puede degradar ligeramente la precisión frente a fp16; no se publican métricas de esa degradación.
- El tokenizador incluido corrige el padding respecto al original; usar el tokenizador original puede reducir la precisión zero-shot.
- Licencia apple-amlr: conviene revisar el acuerdo antes de uso comercial; no se garantiza permiso de uso comercial en la información disponible.
- Idiomas soportados no documentados; el rendimiento multilingüe de las etiquetas no está verificado.
- Sin datos de benchmarks, latencia ni requisitos de hardware oficiales: la evaluación en producción requiere pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/AX1Y2JP/MobileCLIP2-S3-ONNX
- Modelo original: https://huggingface.co/apple/MobileCLIP2-S3
- Versión OpenCLIP/timm: https://huggingface.co/timm/MobileCLIP2-S3-OpenCLIP
- Licencia: LICENSE (incluida en el repositorio)
- ONNX Runtime: https://onnxruntime.ai/
