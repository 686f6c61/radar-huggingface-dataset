# deepseek-ai/deepseek-vl2-tiny

## Resumen

DeepSeek-VL2-Tiny es la variante pequeña de la serie DeepSeek-VL2, una familia de modelos de visión-lenguaje con mezcla de expertos (MoE) desarrollada por DeepSeek (`deepseek-ai`). El modelo resuelve tareas de imagen a texto, como respuesta a preguntas visuales, OCR, comprensión de documentos, tablas y gráficos, y grounding visual. Fue publicado en diciembre de 2024 y está disponible en Hugging Face con 81.662 descargas y 267 likes en el momento de la información.

La variante Tiny se construye sobre DeepSeekMoE-3B: declara 1,0B de parámetros activos y el repositorio de safetensors contiene 3.370.501.440 parámetros totales (3,37B). Esto la sitúa en un rango de eficiencia interesante para inferencia multimodal con coste contenido, aunque no se dispone de la longitud de contexto ni de los idiomas soportados en la información proporcionada.

La serie DeepSeek-VL2 afirma en su model card un rendimiento competitivo o estado del arte con parámetros activos similares o inferiores a modelos densos y MoE open source. Para evaluar su uso en producción conviene tener en cuenta que no se han publicado benchmarks en la información disponible y que el modelo emplea una licencia personalizada de DeepSeek, con uso comercial permitido según la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje con mezcla de expertos (MoE); LLM base DeepSeekMoE-3B. El codificador visual no se detalla en la información disponible. |
| Parámetros totales | 3.370.501.440 (3,37B), según safetensors |
| Parámetros activos | 1,0B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek Model License (`license: other`); la model card indica que la serie admite uso comercial. El código del repositorio es MIT. |
| Formato de pesos | safetensors; integración con `transformers` mediante `trust_remote_code` |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 6,7 GB |

## Arquitectura y entrenamiento

DeepSeek-VL2-Tiny es un modelo multimodal de imagen a texto basado en una arquitectura MoE. La model card indica que la serie DeepSeek-VL2 está formada por tres variantes —Tiny, Small y DeepSeek-VL2— con 1,0B, 2,8B y 4,5B de parámetros activos respectivamente. La principal diferencia entre variantes es el LLM base; en el caso de Tiny, DeepSeekMoE-3B.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La model card sí describe capacidades diferenciales frente a DeepSeek-VL en tareas de VQA, OCR, comprensión de documentos, tablas y gráficos, y grounding visual. Entre los detalles técnicos documentados destacan el uso de una estrategia de tiling dinámico para hasta dos imágenes y el padding directo a 384×384 cuando hay tres o más imágenes, además del soporte de etiquetas de referencia `<|ref|>...<|/ref|>` para grounding visual.

## Capacidades

- Respuesta a preguntas visuales sobre una o varias imágenes en pipelines `image-text-to-text`.
- OCR y extracción de texto en imágenes, incluyendo documentos escaneados.
- Comprensión de documentos, tablas y gráficos.
- Grounding visual mediante referencias del tipo `<|ref|>The giraffe at the back.<|/ref|>`.
- Conversación multi-turno con imágenes y aprendizaje en contexto con varias imágenes.
- Generación de texto condicionada por imagen, con soporte de prompts de sistema y formato de conversación propio.
- No se documenta soporte de tool calling, function calling, agentes, audio, modo thinking ni capacidades multilingües en la información disponible.

## Casos de uso

- Automatización de facturas y albaranes: el modelo puede recibir una imagen del documento y responder preguntas sobre importes, fechas o líneas de detalle, combinando OCR y comprensión de tablas.
- Digitalización de archivos escaneados: resulta adecuado para extraer texto y estructurar información de documentos históricos o formularios, con revisión humana posterior.
- Análisis de gráficos e informes: puede interpretar gráficos de barras, líneas o tablas incluidas en capturas y responder preguntas sobre tendencias y valores visibles.
- Etiquetado y grounding en datasets: el soporte de referencias visuales permite señalar objetos o regiones descritas en lenguaje natural, útil para anotación asistida.
- Soporte técnico con capturas de pantalla: puede mantener una conversación multi-turno sobre errores mostrados en imágenes y texto, especialmente en flujos con una o dos imágenes por turno.
- Comparación de productos con varias imágenes: con el modo de múltiples imágenes puede contrastar características visibles entre varios productos o variantes.
- Accesibilidad: generación de descripciones de imágenes para personas con discapacidad visual, con revisión humana por el riesgo de alucinación y por la ausencia de evaluación de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

| Precisión | VRAM solo pesos (estimación) | Comentario |
|---|---:|---|
| bf16 | ~6,7 GB | 3,37B × 2 bytes; hay que añadir activaciones, caché KV y codificador visual |
| int8 | ~3,4 GB | 3,37B × 1 byte; no se documenta checkpoint int8 oficial |
| int4 | ~1,7 GB | 3,37B × 0,5 bytes; no se documenta checkpoint int4 oficial |

- La VRAM total real para inferencia no está publicada. Las cifras anteriores son un cálculo orientativo a partir del número de parámetros y no incluyen el coste del codificador visual ni el overhead del runtime.
- No hay recomendaciones oficiales de GPU. Por tamaño, una A100 o H100 es adecuada para servir lotes; una RTX 4090 o RTX 6000 Ada puede ejecutar bf16 con margen; una RTX 4060 Ti de 16 GB o una RTX 3060 de 12 GB son opciones razonables con cuantización, aunque no hay datos oficiales de compatibilidad.
- En GPU de consumo: el modelo puede caber en tarjetas de 12-16 GB en bf16 con overhead ajustado, y en 8 GB solo con cuantización y cuidado con el codificador visual. No hay cifras oficiales.
- Despliegue documentado: `transformers` con `trust_remote_code` y el código del repositorio DeepSeek-VL2. El tag de Hugging Face `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se han proporcionado datos de modelos externos comparables. Se compara con las otras variantes de la misma serie:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| DeepSeek-VL2-Tiny | 3,37B | 1,0B | no disponible | DeepSeek Model License | Hugging Face: `deepseek-ai/deepseek-vl2-tiny` |
| DeepSeek-VL2-Small | no disponible | 2,8B | no disponible | DeepSeek Model License | variante de la serie; enlace no proporcionado |
| DeepSeek-VL2 | no disponible | 4,5B | no disponible | DeepSeek Model License | variante de la serie; enlace no proporcionado |

No hay resultados de benchmarks en la información disponible para comparar rendimiento entre variantes o frente a modelos externos.

## Limitaciones y advertencias

- No se documentan evaluaciones de sesgos; el modelo puede reproducir sesgos presentes en sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión; especialmente relevante en OCR, documentos y descripciones de imágenes, donde conviene validar la salida.
- La longitud de contexto no está disponible, por lo que no se puede garantizar un comportamiento fiable con conversaciones o documentos muy largos.
- El tiling dinámico solo se aplica a hasta dos imágenes; con tres o más imágenes se hace padding a 384×384, lo que puede reducir el detalle disponible para imágenes grandes o con texto pequeño.
- La model card recomienda temperatura `T <= 0.7`; valores superiores degradan la calidad de generación según el autor.
- Los idiomas soportados no están documentados; no se debe asumir un rendimiento multilingüe homogéneo.
- La licencia del modelo es personalizada (`other`), no una licencia estándar OSI. La model card indica uso comercial permitido, pero conviene revisar los términos de DeepSeek Model License antes de desplegarlo en producción.
- No se documenta soporte de tool calling, function calling ni flujos de agentes; no es una elección adecuada para pipelines agénticos sin evaluación previa.
- No se documentan checkpoints cuantizados oficiales ni integración con motores de inferencia de alto rendimiento; el repositorio publicado ocupa 6,7 GB y requiere `trust_remote_code`.

## Enlaces

- [Hugging Face: deepseek-ai/deepseek-vl2-tiny](https://huggingface.co/deepseek-ai/deepseek-vl2-tiny)
- [Paper: DeepSeek-VL2: Mixture-of-Experts Vision-Language Models for Advanced Multimodal Understanding](https://arxiv.org/abs/2412.10302)
- [Repositorio GitHub de DeepSeek-VL2](https://github.com/deepseek-ai/DeepSeek-VL2)
- [Licencia del modelo DeepSeek](https://github.com/deepseek-ai/DeepSeek-LLM/blob/HEAD/LICENSE-MODEL)
- [Sitio web de DeepSeek](https://www.deepseek.com/)
- [Plataforma API de DeepSeek](https://www.deepseek.com/en/platform/)
- [Organización de DeepSeek en GitHub](https://github.com/deepseek-ai)
