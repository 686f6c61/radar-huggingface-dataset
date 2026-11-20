# AX1Y2JP/MobileCLIP2-S4-ONNX

## Resumen

MobileCLIP2-S4-ONNX es una exportación a formato ONNX del modelo MobileCLIP2-S4 desarrollado por Apple Machine Learning Research, un codificador dual imagen-texto de tipo CLIP diseñado para clasificación zero-shot de imágenes con requisitos computacionales reducidos. El modelo original forma parte de la familia MobileCLIP2, orientada a despliegue eficiente en dispositivos con recursos limitados, y esta versión concreta ha sido convertida y publicada por el usuario AX1Y2JP a partir de los pesos de timm/MobileCLIP2-S4-OpenCLIP.

La relevancia de esta ficha radica en que ofrece los dos codificadores (visión y texto) como grafos ONNX independientes, con variantes en fp16 e int8, lo que facilita la integración en pipelines de inferencia sin depender del framework PyTorch original. El codificador de imagen emplea una arquitectura FastViT reparameterizada para inferencia, mientras que el codificador de texto sigue el esquema estándar de CLIP. El resultado es un modelo apto para tareas de clasificación de imágenes por prompt de texto, búsqueda multimodal y filtrado semántico.

El repositorio ocupa 3,9 GB y se distribuye bajo la licencia Apple Machine Learning Research Model License (apple-amlr), que impone restricciones específicas para uso comercial. No se han publicado datos de idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP dual-encoder; codificador de imagen FastViT (reparameterizado para inferencia) y codificador de texto transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el codificador de texto procesa prompts cortos de clasificación) |
| Tipos de cuantizacion | fp16 (pesos fp16, E/S float32) e int8 (MatMulNBits 8-bit weight-only, embedding de tokens int8 por filas) |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement) |
| Formato de pesos | ONNX (opset 23, ONNX Runtime 1.22+); tokenizer.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CLIP de dos torres: un codificador de imagen basado en FastViT, una red híbrida que combina convoluciones con atención y que en esta exportación ha sido reparameterizada al estilo MobileOne (fusión de ramas para inferencia, sin cambios en las salidas), y un codificador de texto transformer que produce embeddings alineados con los de imagen mediante un objetivo contrastivo. La salida de ambos codificadores se normaliza y se combina con un `logit_scale` almacenado en los metadatos del grafo ONNX para obtener logits de similitud.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio solo documenta el proceso de exportación. Las modificaciones respecto al modelo original incluyen la separación en dos grafos ONNX, la mencionada reparameterización del codificador visual, la adición de variantes fp16 e int8, y una corrección del tokenizer: el `tokenizer.json` incluido rellena con id 0 para alinearse con open_clip, ya que la configuración original de Hugging Face rellenaba con el token de fin de texto, lo que degradaba la precisión zero-shot.

## Capacidades

- Clasificación zero-shot de imágenes mediante prompts de texto, calculando similitud coseno entre embeddings de imagen y de texto.
- Generación de embeddings de imagen y de texto normalizados, reutilizables para búsqueda multimodal o filtrado semántico.
- Inferencia con ONNX Runtime en CPU y GPU (proveedores CUDAExecutionProvider y CPUExecutionProvider).
- Ejecución con pesos en fp16 o int8 según la variante seleccionada.
- Procesamiento de imágenes con preprocesado estándar CLIP: redimensionado a 256 px en el lado corto, recorte central de 256x256, normalización con media y desviación CLIP.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto libre; es un modelo de representación, no generativo.

## Casos de uso

- Clasificación automática de imágenes en catálogos: definir etiquetas en lenguaje natural ("foto de un gato", "foto de un coche") y obtener probabilidades por imagen sin entrenamiento adicional, aprovechando la naturaleza zero-shot del modelo.
- Moderación de contenido visual: filtrar imágenes por categorías semánticas definidas mediante prompts, integrando los grafos ONNX en un servicio de inferencia con ONNX Runtime.
- Búsqueda multimodal en bases de datos de imágenes: indexar embeddings de imagen generados por el codificador visual y consultar con embeddings de texto para recuperación semántica.
- Etiquetado asistido en pipelines de datos: preetiquetar grandes volúmenes de imágenes con categorías configurables antes de la revisión humana, reduciendo el coste de anotación.
- Despliegue en dispositivos de borde: la variante int8 y la arquitectura FastViT permiten ejecutar la clasificación en hardware con recursos limitados usando ONNX Runtime.
- Filtrado previo en sistemas de visión: descartar o priorizar imágenes según similitud con prompts antes de pasarlas a modelos más costosos, ahorrando cómputo en la etapa siguiente.
- Organización de bibliotecas multimedia: agrupar imágenes por similitud de embedding para detección de duplicados o clustering semántico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 3,9 GB e incluye múltiples variantes (fp16 e int8), por lo que la huella en memoria de una sola variante es sustancialmente menor que el tamaño total del repo.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo declara soporte para CUDAExecutionProvider y CPUExecutionProvider en ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la orientación de la familia MobileCLIP2 a eficiencia sugiere viabilidad en hardware modesto, pero no se aportan cifras.
- Opciones de despliegue: ONNX Runtime 1.22 o superior (opset 23); la variante int8 es exclusiva de ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MobileCLIP2-S4-ONNX (este) | no disponible | no disponible | apple-amlr | ONNX (fp16/int8) | Exportación ONNX de MobileCLIP2-S4 con codificadores separados |
| apple/MobileCLIP2-S4 | no disponible | no disponible | apple-amlr | PyTorch (Hugging Face) | Modelo original de Apple |
| timm/MobileCLIP2-S4-OpenCLIP | no disponible | no disponible | no disponible en esta ficha | PyTorch (timm/OpenCLIP) | Pesos de referencia usados para la conversión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia apple-amlr impone condiciones específicas; es necesario revisar el acuerdo antes de cualquier uso comercial.
- Es un modelo de representación: no genera texto ni razona; cualquier expectativa de uso generativo es incorrecta.
- El rendimiento zero-shot depende fuertemente de la formulación de los prompts; la model card advierte que un padding incorrecto del tokenizer degrada la precisión, corregido en esta exportación.
- No se documentan sesgos conocidos ni evaluación de robustez en la información disponible; cabe esperar los sesgos típicos de los datasets de pares imagen-texto empleados en el entrenamiento original.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a etiquetas incorrectas cuando la imagen queda fuera de la distribución de entrenamiento.
- No se especifican los idiomas soportados por el codificador de texto; la cobertura multilingüe es desconocida.
- La variante int8 solo funciona en ONNX Runtime y puede degradar ligeramente la precisión respecto a fp16.
- El repositorio no tiene descargas ni likes registrados y fue publicado recientemente; no hay evidencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AX1Y2JP/MobileCLIP2-S4-ONNX
- Modelo original: https://huggingface.co/apple/MobileCLIP2-S4
- Pesos de referencia OpenCLIP: https://huggingface.co/timm/MobileCLIP2-S4-OpenCLIP
