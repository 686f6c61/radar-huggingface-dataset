# lucasafoliveira/Xiaomi-OCR-0-mlx-fp16

## Resumen

Xiaomi-OCR-0 es un modelo de visión-lenguaje (VLM) especializado en reconocimiento óptico de caracteres (OCR), parsing de documentos, comprensión de documentos, respuesta visual a preguntas (VQA) y extracción de información clave. Lo desarrolla Xiaomi Research, y esta ficha concreta corresponde a una conversión comunitaria a formato MLX en precisión fp16 realizada por el usuario lucasafoliveira, pensada para ejecución en hardware Apple Silicon. El modelo original se distribuye bajo licencia Apache 2.0.

La relevancia de esta variante es práctica: permite ejecutar un modelo OCR multimodal de 752 millones de parámetros de forma local en equipos Mac con chip de la serie M, sin depender de GPUs NVIDIA ni de servicios en la nube. El repositorio ocupa 1,5 GB, lo que encaja en la memoria unificada de la mayoría de equipos Apple modernos.

La información pública disponible sobre esta conversión es limitada: la model card se centra casi exclusivamente en las instrucciones de uso con `mlx-lm` y no detalla la arquitectura interna, la composición del corpus de entrenamiento ni resultados de benchmarks. Los datos de arquitectura y entrenamiento que se indican a continuación se infieren de los tags del repositorio y del modelo base, y se marcan como no disponibles cuando no hay confirmación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en transformer (tag `qwen3_5`); detalle interno no disponible |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (esta variante); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (fp16) |

## Arquitectura y entrenamiento

El repositorio es una conversión a MLX del modelo `xiaomi-research/Xiaomi-OCR-0`, realizada con `mlx-lm` versión 0.31.2. El tag `qwen3_5` sugiere que la torre lingüística se apoya en la familia Qwen 3.5, combinada con un codificador visual para tareas image-text-to-text, aunque la model card no documenta la arquitectura con detalle. El pipeline declarado es `image-text-to-text` y el modelo está etiquetado como vision-language-model multimodal.

El modelo base se entrenó, según los metadatos, sobre un corpus propio centrado en OCR (`custom-ocr-centric-corpus`) y se evalúa con métricas específicas de la tarea: accuracy, TEDS (Tree Edit Distance-based Similarity, habitual en parsing de tablas) y CDM (métrica de comparación de documentos). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La conversión a MLX no modifica los pesos más allá del cambio de formato y la conversión a fp16.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos: extracción de estructura, tablas y layout.
- Comprensión de documentos (document understanding) más allá del texto plano.
- Respuesta visual a preguntas (VQA) sobre imágenes y documentos.
- Extracción de información clave (key information extraction) en formularios y facturas.
- Procesamiento multimodal image-text-to-text.
- Conversación multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede recibir la imagen de un documento y devolver los campos estructurados (importes, fechas, emisor), lo que encaja con su etiqueta de key information extraction y permite automatizar la entrada de datos contable.
- Extracción de tablas de informes financieros: la presencia de la métrica TEDS en los metadatos indica que el modelo está orientado a reconstruir tablas, útil para convertir PDFs escaneados en hojas de cálculo.
- Procesamiento local en Mac: al estar en formato MLX fp16 y ocupar 1,5 GB, se puede ejecutar en un MacBook con memoria unificada para digitalizar documentos sensibles sin enviarlos a la nube.
- Asistencia a la accesibilidad: convertir imágenes de documentos o capturas en texto legible para lectores de pantalla mediante OCR y VQA.
- Indexación de archivos escaneados: generar texto extraído de imágenes para alimentar un motor de búsqueda o un sistema RAG documental.
- Validación de formularios: usar VQA para comprobar si un campo concreto de un formulario rellenado a mano contiene el valor esperado.
- Prototipado rápido de pipelines OCR: al integrarse con `mlx-lm` mediante una API Python sencilla, sirve para validar flujos de parsing antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los metadatos del repositorio declaran las métricas accuracy, TEDS y CDM, pero no se incluyen valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM/memoria estimada: en fp16, los 752 millones de parámetros ocupan aproximadamente 1,5 GB de pesos, más overhead de activaciones y del codificador visual; se recomienda reservar al menos 3-4 GB de memoria unificada.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (series M1, M2, M3, M4); no es un formato para GPUs NVIDIA.
- Cabe en consumer hardware: sí, en equipos Mac con 8 GB o más de memoria unificada; también en GPUs consumer si se convierte a otro formato (no incluido en este repositorio).
- Opciones de despliegue: `mlx-lm` (probado por el autor con la versión 0.31.2); vLLM, llama.cpp, Ollama o TGI no están indicados para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xiaomi-OCR-0 (MLX fp16, esta ficha) | 752 M | no disponible | Apache 2.0 | MLX safetensors | Conversión comunitaria para Apple Silicon |
| xiaomi-research/Xiaomi-OCR-0 | 752 M | no disponible | Apache 2.0 | safetensors (transformers) | Modelo base original |
| Alternativas OCR/VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluación de sesgos; se desconoce su comportamiento en dominios o idiomas distintos de los del corpus de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar texto o campos que no aparecen en la imagen, especialmente con documentos de baja calidad.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un buen rendimiento en castellano sin validación previa.
- La longitud de contexto no está documentada, lo que impide planificar el procesamiento de documentos de muchas páginas.
- Es una conversión comunitaria no oficial: no hay garantía de que los pesos MLX reproduzcan exactamente el comportamiento del modelo original; conviene validar contra el base.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y de documentación de entrenamiento dificulta justificar su uso en producción sin una evaluación propia.
- El formato MLX limita el despliegue a hardware Apple Silicon salvo conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lucasafoliveira/Xiaomi-OCR-0-mlx-fp16
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación de MLX: https://ml-explore.github.io/mlx/
