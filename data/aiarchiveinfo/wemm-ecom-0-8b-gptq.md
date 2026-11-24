# AIArchiveInfo/WeMM-Ecom-0.8B-GPTQ

## Resumen

WeMM-Ecom-0.8B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-0.8B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el ámbito del comercio electrónico. El modelo original forma parte de la familia WeMM-Ecom (0.8B, 2B, 4B, 9B y 35B-A3B) y está diseñado específicamente para tareas de entendimiento producto-imagen-texto: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento y conocimiento de producto.

La arquitectura es un transformer denso de aproximadamente 853 millones de parámetros con una ventana de contexto de 262.144 tokens, construido sobre la base `qwen3_5` y con pipeline `image-text-to-text`. Esta versión GPTQ reduce el peso a 4 bits con activaciones en 16 bits (W4A16), con grupos de 128 valores y cuantización simétrica, manteniendo en precisión original el codificador visual, la cabeza de salida y determinadas proyecciones sensibles. El resultado es un checkpoint de aproximadamente 1 GB, adecuado para despliegue en infraestructura modesta.

El interés de esta ficha radica en que combina comprensión multimodal de dominio específico (e-commerce), contexto muy largo, soporte de modo "thinking" híbrido y un formato de cuantización compatible con motores de serving modernos como vLLM mediante el backend `compressed-tensors`. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública disponible sobre benchmarks numéricos concretos es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base `qwen3_5`), multimodal image-text-to-text |
| Parametros totales | 852.985.920 (aprox. 0,85B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits pesos, 16 bits activaciones), grupos de 128, simetrica; existen tambien BF16, FP8 y GGUF en la familia |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors empaquetado en formato `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 0,8B parámetros construido sobre la arquitectura `qwen3_5`, con un codificador visual que procesa entradas de imagen, multi-imagen y vídeo junto con texto. La familia WeMM-Ecom está entrenada específicamente para el dominio del comercio electrónico de WeChat, con un conjunto de evaluación propio que abarca 28 benchmarks en ocho escenarios de e-commerce (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento, benchmarks públicos de e-commerce y conocimiento de producto) y 64 benchmarks generales en ocho categorías.

La versión aquí descrita es una cuantización GPTQ W4A16 del checkpoint BF16 original, con grupos de 128 valores y cuantización simétrica. El codificador visual, la cabeza de salida y ciertas proyecciones sensibles se mantienen en precisión original para preservar la calidad. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO en la información proporcionada. El modelo soporta un modo de razonamiento híbrido ("thinking mode" e "instruct mode"), lo que sugiere un entrenamiento orientado a ambos regímenes de inferencia.

## Capacidades

- Comprensión de imágenes y texto (image-text-to-text) con soporte de entrada de una imagen, múltiples imágenes y vídeo.
- Comprensión de dominio e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding y razonamiento sobre productos.
- Modo híbrido de razonamiento: "thinking mode" (razonamiento extendido) e "instruct mode" (respuesta directa).
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Conversación multi-turno con contexto largo (hasta 262.144 tokens).
- Serving compatible con OpenAI API a través de vLLM (endpoints compatibles).
- Capacidades multilingües limitadas a chino e inglés.
- Soporte de streaming en las peticiones de serving.

## Casos de uso

- Moderación de contenido en marketplaces: el modelo puede analizar imágenes y texto de listados de producto para detectar contenido prohibido o inapropiado, apoyándose en su entrenamiento específico en moderación de e-commerce y su ventana de contexto de 262.144 tokens para procesar lotes de publicaciones.
- Extracción de atributos de producto: a partir de imágenes y descripciones, el modelo puede identificar y estructurar atributos (color, material, talla, categoría) para alimentar catálogos y motores de búsqueda, gracias a su especialización en atributos de producto.
- OCR y digitalización de fichas de producto: lectura de texto embebido en imágenes de producto, etiquetas y empaquetados, combinando capacidades OCR con razonamiento sobre el contenido extraído.
- Búsqueda y recuperación multimodal: generación de descripciones y representaciones de producto que facilitan la recuperación semántica en catálogos, aprovechando las capacidades de recuperación evaluadas en el dominio.
- Asistencia conversacional al comprador: atención al cliente multi-turno que puede recibir imágenes del producto y responder consultas, con contexto largo para mantener el historial de la conversación.
- Análisis de vídeo de producto: procesamiento de vídeos demostrativos o de unboxing para extraer información, resumir contenido o verificar afirmaciones del vendedor, gracias al soporte de entrada de vídeo.
- Grounding y verificación visual: localización de elementos en imágenes de producto (por ejemplo, defectos o componentes) para control de calidad o resolución de disputas.
- Despliegue en infraestructura modesta: al ser un modelo de 0,8B cuantizado a 4 bits (aprox. 1 GB), puede ejecutarse en GPUs de consumo para prototipos y entornos de borde.

## Benchmarks y rendimiento

La model card indica que el checkpoint BF16 de WeMM-Ecom-0.8B supera a Qwen3.5-0.8B en 16,43 puntos y a MiniCPM-V-4.7-1B en 13,03 puntos en la puntuación media de benchmarks de e-commerce, y supera a Qwen3.5-0.8B en 6,93 puntos y a MiniCPM-V-4.7-1B en 1,09 puntos en la media de benchmarks generales. Sin embargo, los resultados numéricos detallados se presentan únicamente como imágenes en la model card y no están disponibles como valores textuales en la información proporcionada.

| Benchmark | WeMM-Ecom-0.8B (BF16) | Qwen3.5-0.8B | MiniCPM-V-4.7-1B |
|---|---|---|---|
| Media e-commerce (28 benchmarks) | no disponible (valores en imagen) | referencia (-16,43 pts) | referencia (-13,03 pts) |
| Media general (64 benchmarks) | no disponible (valores en imagen) | referencia (-6,93 pts) | referencia (-1,09 pts) |

No se han publicado resultados de benchmarks numéricos desglosados en la información textual disponible. Los datos anteriores corresponden al checkpoint BF16, no al GPTQ.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos en GPTQ W4A16, más overhead de activaciones, caché KV y codificador visual; en la práctica se recomienda al menos 4-8 GB de VRAM para contexto moderado, y más para contextos cercanos a 262.144 tokens.
- GPU recomendadas: cualquier GPU con soporte de vLLM `compressed-tensors`; para serving de producción se recomiendan A100, H100 o L40S; para prototipos, RTX 4090, RTX 3090 o superiores.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para contextos moderados; el modelo de 0,8B cuantizado a 4 bits es adecuado para GPUs de gama media.
- Opciones de despliegue: vLLM >= 0.31.0 con backend `compressed-tensors` (recomendado, con API compatible con OpenAI); también existen formatos GGUF de la familia para llama.cpp/Ollama, aunque esta ficha concreta es GPTQ.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B-GPTQ | 0,85B | 262.144 | Apache 2.0 | GPTQ W4A16 (tambien BF16, FP8, GGUF) | Especializado en e-commerce, multimodal |
| Qwen3.5-0.8B | no disponible | no disponible | no disponible | no disponible | Referencia en benchmarks; superado por WeMM-Ecom en e-commerce (+16,43) y general (+6,93) segun la model card |
| MiniCPM-V-4.7-1B | no disponible | no disponible | no disponible | no disponible | Referencia en benchmarks; superado por WeMM-Ecom en e-commerce (+13,03) y general (+1,09) segun la model card |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada; solo se dispone de las diferencias de puntuación media reportadas por el autor.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Modelo especializado en e-commerce: aunque mantiene capacidades generales, su entrenamiento está orientado al dominio y puede degradarse fuera de él.
- Riesgo de alucinación inherente a los modelos de lenguaje; las respuestas sobre atributos de producto deben verificarse en producción.
- Los benchmarks reportados corresponden al checkpoint BF16; la cuantización GPTQ W4A16 puede introducir una degradación de calidad no cuantificada en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre datos de e-commerce de WeChat, puede reflejar sesgos del catálogo y de la plataforma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE enlazado en el repositorio base de Tencent.
- El repositorio de esta ficha (AIArchiveInfo/WeMM-Ecom-0.8B-GPTQ) tiene 0 descargas y 0 likes; es un espejo/archivo, no el repositorio oficial de Tencent, por lo que se recomienda usar el checkpoint oficial `tencent/WeMM-Ecom-0.8B-GPTQ`.
- El contexto de 262.144 tokens requiere gestión cuidadosa de memoria KV; en GPUs de consumo el contexto efectivo será mucho menor.
- Para serving cuantizado es necesario vLLM >= 0.31.0 con backend `compressed-tensors`; otros motores pueden no soportar el formato.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/AIArchiveInfo/WeMM-Ecom-0.8B-GPTQ
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Version GPTQ oficial: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Version FP8: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Version GGUF: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Coleccion de la familia: https://huggingface.co/collections/tencent/wemm-ecom
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.30662
- Paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
