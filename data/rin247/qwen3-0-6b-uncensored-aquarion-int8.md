# Rin247/Qwen3-0.6B-Uncensored-Aquarion-INT8

## Resumen

Este modelo es una cuantización INT8 *weight-only* del modelo `Qwen3-0.6B` de Alibaba, publicada por el usuario Rin247 bajo la etiqueta "Aquarion Forge". El modelo ha sido sometido a un proceso de "abliteración" (uncensoring) mediante proyección ortogonal de la dirección de rechazo del modelo original, antes de aplicar la cuantización. El resultado es un modelo de 596 millones de parámetros en formato safetensors, pensado para entornos con recursos limitados que necesiten una generación de texto sin los filtros de seguridad habituales.

La relevancia de este modelo radica en su tamaño reducido y su cuantización a 8 bits, lo que permite ejecutarlo en hardware modesto (CPU o GPU de gama baja). Sin embargo, al ser una versión abliterada de un modelo ya pequeño, las capacidades de razonamiento y coherencia son limitadas en comparación con modelos más grandes. La licencia no está declarada, lo que supone un riesgo para su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (weight-only, RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con escalas y shapes en buffers separados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen3-0.6B`, un transformer decoder-only con atención estándar, aunque los detalles concretos (número de capas, heads, etc.) no se especifican en la información disponible. El proceso de cuantización se realizó con PyTorch RTN (round-to-nearest) en CPU, almacenando las escalas junto a los pesos en buffers adicionales (`*.weight_scale`, `*.weight_shape`).

La "abliteración" se aplicó mediante proyección ortogonal de la dirección de rechazo del modelo original, un método que elimina la activación de las respuestas de rechazo sin un reentrenamiento completo. Este proceso se realizó antes de la cuantización. No se proporcionan datos sobre el entrenamiento del modelo base ni sobre el dataset utilizado.

## Capacidades

- Generación de texto libre, con menos restricciones de contenido que el modelo original debido al proceso de abliteración.
- Razonamiento básico y completado de texto, limitado por el tamaño del modelo (0.6B).
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentación, y es poco probable en un modelo de este tamaño).
- Capacidades multilingües: no disponibles (el modelo base Qwen3 soporta varios idiomas, pero no se confirma en esta variante).
- Capacidades especiales: al ser abliterado, puede generar contenido que el modelo base rechazaría, pero no se garantiza la coherencia ni la calidad.

## Casos de uso

- Generación de texto local en entornos con recursos limitados: al pesar menos de 1 GB en INT8, puede ejecutarse en una Raspberry Pi o en un portátil antiguo, ideal para prototipos o aplicaciones offline.
- Creación de chatbots sin censura para entornos de prueba o investigación: el modelo puede mantener conversaciones sobre temas sensibles sin los rechazos típicos de otros modelos.
- Text encoder para generación de imágenes: según la búsqueda web, se ha utilizado como text encoder en modelos de difusión (por ejemplo, en Civitai), donde sigue las instrucciones del prompt de forma más fiel que otros encoders.
- Experimentación con cuantización y abliteración: sirve como ejemplo práctico de cómo combinar técnicas de compresión y modificación de comportamiento en modelos pequeños.
- Automatización de tareas simples de procesamiento de lenguaje natural: clasificación de texto, extracción de entidades o resumen breve, siempre que el dominio no requiera alta precisión.
- Despliegue en dispositivos edge con limitaciones de memoria: su tamaño reducido permite su integración en aplicaciones móviles o embebidas sin necesidad de conexión a nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB para los pesos en INT8, más overhead de escalas y activaciones. En la práctica, se recomienda al menos 1 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU con 1-2 GB de VRAM, como NVIDIA GTX 1050, GTX 1650, o incluso iGPU integradas. También puede ejecutarse en CPU con 2 GB de RAM disponible.
- Sí cabe en GPUs de consumo básico: sí, es uno de los modelos más ligeros disponibles.
- Opciones de despliegue: al ser un formato safetensors personalizado con escalas separadas, requiere un paso de dequantización antes de usar motores de inferencia estándar. No es compatible directamente con llama.cpp, Ollama o vLLM sin conversión previa. Se puede cargar con PyTorch y ejecutar en CPU o GPU.
- Latencia y throughput: no se proporcionan datos oficiales. En CPU moderna, se espera una velocidad de decodificación de 10-30 tokens por segundo; en GPU, puede ser mayor.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B (original) | 596M | no disponible | FP16/BF16 | Apache 2.0 | HuggingFace |
| Qwen3-0.6B-abliterated (huihui-ai) | 596M | no disponible | FP16 | no disponible | HuggingFace |
| Qwen3-0.6B-Uncensored-Aquarion-INT8 (este) | 596M | no disponible | INT8 | no disponible | HuggingFace |

Las alternativas son el modelo base original y otras versiones abliteradas. Este modelo se diferencia por su cuantización INT8, que reduce el uso de memoria a costa de una posible pérdida de precisión. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión abliterada, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No se ha evaluado su comportamiento en este aspecto.
- Riesgo de alucinacion: elevado, especialmente en tareas de razonamiento complejo, debido al pequeño tamaño del modelo.
- Limitaciones de contexto e idioma: no se especifican, pero el modelo base Qwen3 tiene un contexto de 32k tokens; esta versión podría heredarlo, aunque no se confirma.
- Restricciones de licencia: la licencia no está declarada, lo que impide su uso comercial sin autorización explícita del autor. Esto es un riesgo legal importante.
- Caveat de producción: el formato de pesos es propietario (weight-only con escalas separadas), lo que dificulta su integración en herramientas estándar como vLLM o llama.cpp. Requiere un pipeline de dequantización manual.

## Enlaces

- [HuggingFace - Rin247/Qwen3-0.6B-Uncensored-Aquarion-INT8](https://huggingface.co/Rin247/Qwen3-0.6B-Uncensored-Aquarion-INT8)
- [HuggingFace - Qwen/Qwen3-0.6B (modelo base)](https://huggingface.co/Qwen/Qwen3-0.6B)
- [HuggingFace - huihui-ai/Qwen3-0.6B-abliterated](https://huggingface.co/huihui-ai/Qwen3-0.6B-abliterated)
- [GitHub - Damacol/qwen-qwen3-0.6b](https://github.com/Damacol/qwen-qwen3-0.6b)
- [InsiderLLM - Best Uncensored Local LLMs by VRAM Tier](https://insiderllm.com/guides/best-uncensored-local-llms/)
- [Civitai - Qwen3-0.6B-heretic-abliterated-uncensored (text encoder)](https://civitai.com/models/2598886/anima-text-encoder-qwen3-06b-heretic-abliterated-uncensored)
