# AX1Y2JP/MobileCLIP2-B-ONNX

## Resumen

MobileCLIP2-B (ONNX) es una exportación a formato ONNX del modelo de visión-lenguaje MobileCLIP2-B, desarrollado originalmente por Apple Machine Learning Research y publicado en Hugging Face bajo el identificador `apple/MobileCLIP2-B`. Esta versión concreta, alojada por el usuario AX1Y2JP, convierte los codificadores de imagen y texto en dos grafos ONNX independientes y añade variantes cuantizadas en fp16 e int8, lo que facilita su despliegue en entornos de producción con ONNX Runtime sin depender de PyTorch.

El modelo resuelve la tarea de clasificación de imágenes zero-shot: dado un conjunto de etiquetas textuales arbitrarias, calcula la similitud entre el embedding de la imagen y los embeddings de texto para asignar la clase más probable sin necesidad de reentrenamiento. MobileCLIP2 pertenece a la familia de modelos CLIP optimizados para eficiencia computacional, lo que lo hace adecuado para dispositivos con recursos limitados.

Su relevancia actual radica en la combinación de un modelo de visión-lenguaje compacto con un formato de despliegue ligero (ONNX con cuantización int8 y fp16), orientado a inferencia en CPU y GPU de gama baja. El repositorio tiene un tamaño de 1,1 GB y la licencia es la Apple Machine Learning Research Model License Agreement (apple-amlr), que impone restricciones específicas al uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP de dos torres (codificador de imagen + codificador de texto), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tokenizador de texto tipo CLIP; longitud de secuencia no especificada) |
| Tipos de cuantización | fp16 (pesos fp16, E/S float32) e int8 (weight-only MatMulNBits, embedding de tokens int8 por filas) |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement) |
| Formato de pesos | ONNX (opset 23, ONNX Runtime 1.22+) con tokenizer.json |

## Arquitectura y entrenamiento

MobileCLIP2-B sigue la arquitectura CLIP de dos torres: un codificador de imagen y un codificador de texto que proyectan sus entradas a un espacio latente compartido, donde la similitud se mide mediante producto escalar multiplicado por un parámetro `logit_scale` aprendido. La exportación ONNX separa ambos codificadores en grafos independientes (`vision_model_fp16.onnx` y `text_model_fp16.onnx`, con variantes `_int8`), lo que permite ejecutar cada torre por separado y cachear embeddings de texto. El preprocesado de imagen documentado es un redimensionado bilineal con recorte central a 224×224 píxeles y normalización a [0,1].

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a modelos CLIP). La model card original de Apple no se incluye en los datos disponibles; solo se referencia el modelo base `apple/MobileCLIP2-B` y la conversión desde `timm/MobileCLIP2-B-OpenCLIP`. La innovación técnica destacable de esta exportación es la corrección del tokenizador: `tokenizer.json` rellena con id 0 para coincidir con open_clip, ya que la configuración original de Hugging Face rellenaba con el token de fin de texto, lo que degradaba la precisión zero-shot.

## Capacidades

- Clasificación de imágenes zero-shot: asigna etiquetas textuales arbitrarias a una imagen mediante similitud en el espacio latente.
- Generación de embeddings de imagen y de texto normalizados (L2), reutilizables para búsqueda, clustering o recuperación.
- Retrieval imagen-texto y texto-imagen mediante similitud coseno.
- Ejecución en ONNX Runtime con providers CUDA y CPU.
- Variantes cuantizadas para reducir huella de memoria y acelerar inferencia en CPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo de lenguaje).
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la alineación imagen-texto.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Clasificación automática de imágenes en catálogos de producto: se definen etiquetas textuales por categoría y el modelo asigna cada imagen a la clase más probable sin entrenamiento adicional, gracias a la naturaleza zero-shot del modelo.
- Moderación de contenido visual: clasificación de imágenes en categorías predefinidas (por ejemplo, "contenido seguro" frente a "contenido sensible") usando prompts textuales, desplegable en CPU con la variante int8.
- Búsqueda semántica de imágenes: se precalculan embeddings de imagen con el codificador visual y embeddings de consultas con el codificador de texto, y se recuperan las imágenes más similares por producto escalar.
- Etiquetado automático de datasets: generación de etiquetas candidatas para grandes volúmenes de imágenes antes de una revisión humana, aprovechando la inferencia por lotes en ONNX Runtime.
- Filtrado en pipelines de datos de entrenamiento: detección de imágenes que no cumplen criterios textuales (por ejemplo, "foto de un documento" frente a "foto de un paisaje") para descartarlas o separarlas.
- Despliegue en dispositivos de borde: la variante int8 con ONNX Runtime permite ejecutar clasificación zero-shot en CPU sin GPU, adecuada para entornos con recursos limitados.
- Organización de bibliotecas multimedia: agrupación y etiquetado de fotografías personales o corporativas según descripciones textuales definidas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 1,1 GB e incluye variantes fp16 e int8; la variante int8 reduce la huella de pesos aproximadamente a la mitad respecto a fp16.
- GPU recomendadas: no especificadas en la información. La model card menciona el provider `CUDAExecutionProvider` de ONNX Runtime, por lo que es compatible con GPU NVIDIA; no se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la existencia de variantes int8 y el soporte de `CPUExecutionProvider` sugieren viabilidad en CPU y GPUs de gama baja, pero no se aportan cifras.
- Opciones de despliegue: ONNX Runtime 1.22 o superior (opset 23), con providers CUDA y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileCLIP2-B (ONNX) | no disponible | no disponible | no disponible | apple-amlr | Hugging Face (este repo) |
| apple/MobileCLIP2-B | no disponible | no disponible | no disponible | apple-amlr | Hugging Face (modelo original) |
| timm/MobileCLIP2-B-OpenCLIP | no disponible | no disponible | no disponible | no disponible | Hugging Face (fuente de la conversión) |

No se dispone de datos de benchmarks ni de especificaciones de parámetros en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia apple-amlr: la Apple Machine Learning Research Model License Agreement impone restricciones específicas; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- Riesgo de alucinación: en clasificación zero-shot, el modelo puede asignar etiquetas incorrectas con alta confianza cuando ninguna clase es adecuada; no existe umbral de abstención incorporado.
- Dependencia del prompt textual: la precisión zero-shot es sensible a la formulación de las etiquetas (por ejemplo, "a photo of a cat" frente a "cat").
- El tokenizador incluido rellena con id 0 para coincidir con open_clip; usar la configuración original de Hugging Face degrada la precisión, según advierte la model card.
- La variante int8 usa `MatMulNBits` con embedding de tokens int8 por filas y solo es compatible con ONNX Runtime.
- Requiere ONNX Runtime 1.22+ y opset 23; versiones anteriores pueden no cargar los grafos.
- No es un modelo generativo: no produce texto, código ni razonamiento; su uso se limita a alineación imagen-texto.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-20; no hay evidencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AX1Y2JP/MobileCLIP2-B-ONNX
- Modelo original de Apple: https://huggingface.co/apple/MobileCLIP2-B
- Conversión OpenCLIP en timm: https://huggingface.co/timm/MobileCLIP2-B-OpenCLIP
- Licencia (referenciada en la model card): LICENSE (incluido en el repositorio)
