# Rin247/Qwen3.6-27B-Feral-Aquarion-INT8

## Resumen

Qwen3.6-27B-Feral-Aquarion-INT8 es una cuantización INT8 weight-only del modelo Qwen3.6-27B-Feral, publicada por el usuario Rin247 como parte del proyecto "Aquarion Forge". El modelo base, Qwen3.6-27B, es un transformer denso de 27 mil millones de parámetros desarrollado por Alibaba Qwen, con capacidades multimodales (visión y lenguaje) y un rendimiento destacado en tareas de coding agéntico (77,2% en SWE-bench Verified según el blog oficial). La versión "Feral" ha sido sometida a un proceso de abliteration (eliminación de la dirección de rechazo mediante proyección ortogonal) para producir un modelo "uncensored" que no rechaza peticiones consideradas sensibles.

Esta cuantización INT8 reduce el tamaño del modelo a aproximadamente 29,5 GB (frente a los ~54 GB en FP16), lo que permite su ejecución en hardware con menos memoria. Sin embargo, el formato emplea recetas personalizadas de weight-only con buffers de escala y forma, por lo que requiere un paso de dequantización antes de ser alimentado a un motor de inferencia estándar. El modelo se distribuye en formato safetensors y está etiquetado como compatible con endpoints, aunque no se especifica licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), basado en Qwen3.6-27B |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 128K tokens, pero no se confirma en esta versión) |
| Tipos de cuantizacion | INT8 weight-only (RTN, escalas almacenadas junto a los pesos) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica para esta versión) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con buffers adicionales `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de 27B parámetros con arquitectura multimodal que integra un codificador de visión y un decodificador de lenguaje. Soporta modos de pensamiento (thinking) y no pensamiento (non-thinking), y ha sido entrenado con un enfoque en razonamiento STEM, coding agéntico y comprensión visual (localización de objetos, OCR, video). No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información proporcionada.

La versión "Feral" aplica una técnica de abliteration mediante proyección ortogonal de la dirección de rechazo, eliminando la tendencia del modelo a negarse a responder ciertas peticiones. Posteriormente, la cuantización INT8 se realiza con PyTorch RTN (round-to-nearest) en CPU, almacenando escalas y formas de los pesos en buffers separados. Este proceso es independiente del entrenamiento original y no modifica los pesos más allá de la cuantización.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-27B, incluyendo razonamiento STEM y resolución de problemas complejos.
- Generación de código: el modelo base destaca en coding agéntico (77,2% SWE-bench Verified), por lo que esta versión cuantizada mantiene esa capacidad, aunque con posible degradación por la cuantización INT8.
- Comprensión visual: al ser multimodal, puede procesar imágenes, realizar OCR, detección de objetos y comprensión de video (capacidad heredada, no verificada en esta versión).
- Modo "uncensored": gracias al proceso de abliteration, el modelo no rechaza peticiones que el modelo original podría bloquear, lo que lo hace adecuado para escenarios donde se requiere generación sin restricciones temáticas.
- Soporte de tool calling y agentes: el modelo base soporta function calling y razonamiento multi-paso, aunque no se confirma explícitamente en esta versión cuantizada.
- Multilingüismo: el modelo base es multilingüe, pero no se especifican los idiomas soportados en esta versión.

## Casos de uso

- Inferencia local en hardware limitado: la cuantización INT8 reduce el uso de VRAM a ~30 GB, permitiendo ejecutar el modelo en GPUs como RTX 4090 (24 GB no es suficiente, pero sí en A100 40GB o RTX 6000 Ada) o en configuraciones con memoria unificada (Apple Silicon con 32 GB o más).
- Generación de código en entornos sin conexión: un asistente de programación que funcione localmente, sin depender de APIs externas, aprovechando las capacidades de coding del modelo base.
- Chatbots sin censura para investigación: el modo "uncensored" permite explorar temas que otros modelos rechazan, útil en investigación de sesgos, generación creativa o análisis de contenido sensible.
- Automatización de tareas de visión: procesamiento de documentos con OCR, análisis de imágenes y extracción de información visual en entornos donde la privacidad exige procesamiento local.
- Prototipado de agentes autónomos: al soportar tool calling y razonamiento multi-paso, puede integrarse en pipelines de agentes que interactúan con APIs y ejecutan tareas complejas.
- Evaluación de técnicas de cuantización: sirve como referencia para comparar el impacto de INT8 weight-only frente a FP8 o FP16 en tareas de razonamiento y coding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada INT8. El modelo base Qwen3.6-27B reporta los siguientes resultados (según el blog oficial de Qwen y fuentes externas):

| Benchmark | Resultado (modelo base) |
|---|---|
| SWE-bench Verified | 77,2% |
| Rendimiento general | Supera al modelo flagship de 397B en tareas de coding |

Estos datos corresponden al modelo sin cuantizar y no son directamente extrapolables a la versión INT8, que puede presentar degradación en tareas de precisión. No se dispone de mediciones de latencia o throughput para esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: ~30 GB en INT8 (27 GB de pesos + overhead de activaciones y buffers). En FP16 serían ~54 GB.
- GPU recomendadas: A100 40GB, A100 80GB, RTX 6000 Ada, o GPUs con 32 GB o más. No cabe en RTX 4090 (24 GB) ni en GPUs de 16 GB.
- En Apple Silicon: posible ejecución con 32 GB de memoria unificada o superior, usando frameworks como llama.cpp (si se convierte a GGUF).
- Opciones de despliegue: la model card indica que es necesario dequantizar los pesos con los buffers de escala y forma antes de usar un motor de inferencia. No es compatible directamente con vLLM, TGI u Ollama sin conversión previa. Se puede usar con transformers tras dequantizar, o convertir a GGUF para llama.cpp.
- Latencia y throughput: no disponibles. Dependerá del hardware y del motor de inferencia tras la dequantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Feral-Aquarion-INT8 (este) | 26,9B | No disponible | INT8 weight-only | No disponible | Hugging Face |
| Qwen3.6-27B-Uncensored-Aquarion-FP8 | 26,9B | No disponible | FP8 | No disponible | Hugging Face (mismo autor) |
| Qwen3.6-27B (base) | 26,9B | 128K (según blog) | FP16/BF16 | Apache 2.0 (según Qwen) | Hugging Face, ModelScope |

La versión FP8 del mismo autor es la alternativa más cercana, con menor degradación teórica que INT8 pero mayor uso de VRAM (~27 GB en FP8). El modelo base sin cuantizar ofrece el máximo rendimiento pero requiere ~54 GB de VRAM. No se dispone de comparativas con otros modelos de 27B como Llama 3.1 27B o Mistral Large.

## Limitaciones y advertencias

- La cuantización INT8 weight-only puede degradar la precisión en tareas de razonamiento matemático, coding complejo y comprensión visual fina, en comparación con el modelo base.
- El proceso de abliteration elimina los mecanismos de rechazo, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. No es adecuado para uso en producción sin supervisión humana.
- La licencia no está especificada, lo que impide determinar si se permite uso comercial o modificaciones. Se recomienda contactar al autor antes de cualquier despliegue.
- El formato de pesos requiere un paso de dequantización manual, lo que añade complejidad al despliegue y puede no ser compatible con herramientas estándar sin adaptación.
- No se dispone de información sobre sesgos del modelo, aunque al ser una versión "uncensored" es probable que amplifique sesgos presentes en los datos de entrenamiento.
- El contexto máximo no está confirmado para esta versión; si el base soporta 128K, la cuantización podría afectar a la ventana efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rin247/Qwen3.6-27B-Feral-Aquarion-INT8
- Versión FP8 del mismo autor: https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8
- Blog oficial de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Guía completa de Qwen 3.6-27B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.6-27b
