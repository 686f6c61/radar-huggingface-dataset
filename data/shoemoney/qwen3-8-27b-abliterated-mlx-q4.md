# shoemoney/Qwen3.8-27B-Abliterated-MLX-q4

## Resumen

El modelo `shoemoney/Qwen3.8-27B-Abliterated-MLX-q4` es una cuantización en 4 bits (MLX) del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterada" (sin censura) del modelo Qwen3.8-27B de Alibaba. El autor, shoemoney, ha convertido los pesos BF16 originales a formato MLX con cuantización de 4 bits y grupo de tamaño 64, sin realizar ningún fine-tuning ni re-alineamiento adicional. El resultado es un modelo optimizado para ejecutarse en Apple Silicon, con un tamaño en disco de 16.08 GB y una perplejidad medida de 6.455 sobre el dataset `allenai/tulu-3-sft-mixture`.

La relevancia de este modelo radica en que ofrece una versión local y eficiente de un modelo de 27.8B parámetros (según el modelo base) que, según la búsqueda web, supera a Claude Opus 4.6 en 15 benchmarks. Al estar cuantizado en 4 bits y adaptado a MLX, permite ejecutar un modelo de gran tamaño en hardware de Apple con un rendimiento razonable (22.1 tok/s en petición única y 65.7 tok/s con 8 peticiones concurrentes en un M3 Ultra). La licencia Apache 2.0 facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.8, basada en el modelo base) |
| Parametros totales | 27.8B (según modelo base; el safetensors del repo reporta 4.665.462.000, posiblemente un archivo parcial) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (q-bits 4, q-group-size 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero. El proceso consistió en tomar los pesos BF16 del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated` y convertirlos a MLX 4-bit mediante `mlx_vlm.convert`, con grupo de cuantización de 64. No se aplicó fine-tuning, merging ni re-alineamiento. El modelo base fue sometido a una técnica de "abliteration" (eliminación de rechazos) que modifica los pesos para reducir la probabilidad de que el modelo se niegue a responder a ciertas instrucciones, manteniendo sus capacidades generales. La arquitectura subyacente es la de Qwen3.8-27B, un transformer de 27.8B parámetros desarrollado por Alibaba, aunque no se dispone de detalles adicionales sobre su configuración (número de capas, heads, etc.) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: al ser una versión de Qwen3.8-27B, hereda las capacidades de razonamiento y generación de texto del modelo original, aunque la cuantización puede introducir ligeras degradaciones.
- Código y matemáticas: el modelo base Qwen3.8-27B está entrenado para tareas de programación y razonamiento matemático, según la búsqueda web que indica que supera a Claude Opus 4.6 en 15 benchmarks (aunque no se especifican cuáles).
- Sin censura (abliterado): el proceso de abliteration elimina los mecanismos de rechazo, permitiendo respuestas a instrucciones que el modelo original podría negarse a procesar. Esto implica que puede generar contenido sensible o no seguro.
- Ejecución en Apple Silicon: gracias a la cuantización MLX, el modelo está optimizado para GPUs de Apple (M-series) y puede cargarse con la librería `mlx-vlm`.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información disponible, pero es probable que el modelo base lo soporte; no se puede confirmar.

## Casos de uso

- Asistente local de generación de texto en Mac: el modelo puede ejecutarse en un Mac con suficiente memoria unificada (por ejemplo, 32 GB o más) para generar texto, redactar documentos o responder preguntas sin conexión a internet. Su tamaño de 16 GB en disco lo hace viable para equipos con al menos 24 GB de RAM.
- Desarrollo de aplicaciones de chat sin censura: al ser abliterado, puede usarse en entornos de investigación o prototipado donde se necesite explorar respuestas sin filtros de seguridad, siempre con las debidas advertencias.
- Generación de código en local: para desarrolladores que trabajan en Apple Silicon, el modelo puede asistir en la escritura de código, explicación de algoritmos o revisión de snippets, aprovechando su capacidad de razonamiento.
- Análisis de texto y resumen: con 27.8B parámetros, el modelo puede procesar documentos largos y generar resúmenes, aunque la longitud de contexto no está especificada.
- Experimentación con cuantización MLX: este modelo sirve como referencia para estudiar el impacto de la cuantización 4-bit en la perplejidad y el rendimiento, ya que el autor proporciona mediciones detalladas.
- Despliegue en entornos de investigación: dado su licencia Apache 2.0, puede integrarse en pipelines de investigación académica o industrial sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias de perplejidad y throughput, que se detallan a continuación:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 6.455 |
| Perplejidad relativa al mejor rung de la familia | 1.03× |
| Throughput (1 petición) | 22.1 tok/s |
| Throughput (8 peticiones concurrentes) | 65.7 tok/s |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada. La perplejidad solo es comparable dentro de la misma familia de modelos, ya que los tokenizadores difieren entre familias.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 16.08 GB en disco; en memoria, con cuantización 4-bit, se estima un uso similar (alrededor de 16-18 GB), por lo que se recomienda un Mac con al menos 24 GB de memoria unificada para evitar swapping.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y superiores). Las mediciones del autor se realizaron en un M3 Ultra con 96 GB, pero modelos con 32 GB o 64 GB pueden ejecutarlo con menor throughput.
- Compatibilidad con consumer GPU: no aplica para GPUs NVIDIA/AMD, ya que MLX es exclusivo de Apple Silicon. Para otras plataformas existen versiones GGUF y FP8 del mismo modelo abliterado (según la búsqueda web), pero no se detallan aquí.
- Opciones de despliegue: `mlx-vlm` (librería oficial para modelos VLM en MLX), también se puede usar con `mlx_lm` si se adapta, aunque el autor recomienda `mlx-vlm` porque la arquitectura está registrada allí.
- Latencia y throughput: 22.1 tok/s en petición única y 65.7 tok/s con 8 concurrentes en M3 Ultra. En hardware inferior, el rendimiento será menor.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría. Se puede mencionar que existen otras cuantizaciones del mismo modelo base:

| Modelo | Formato | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | BF16 (original) | 27.8B | no disponible | Apache 2.0 |
| shoemoney/Qwen3.8-27B-Abliterated-MLX-q4 | MLX 4-bit | 27.8B (base) | no disponible | Apache 2.0 |
| OrcaRouter (versión GGUF/FP8) | GGUF/FP8 | 27.8B | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo abliterado, puede generar contenido falso, ofensivo o peligroso sin filtros. No es adecuado para aplicaciones de producción donde se requiera seguridad y moderación.
- Degradación por cuantización: la cuantización 4-bit puede reducir la calidad de las respuestas en comparación con el modelo BF16 original, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- Contexto limitado: no se especifica la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en tareas que requieran ventanas largas.
- Idiomas: no se ha indicado qué idiomas soporta; se asume que hereda los del modelo base, pero no está confirmado.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso del modelo abliterado puede violar los términos de uso de la plataforma o las políticas de seguridad de la organización. El usuario es responsable de cumplir con las normativas aplicables.
- Hardware específico: al ser MLX, solo funciona en Apple Silicon. No es portable a GPUs NVIDIA o AMD sin conversión adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Qwen3.8-27B-Abliterated-MLX-q4
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de despliegue local (Geeky Gadgets): https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
- Análisis de OrcaRouter (explainx.ai): https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Análisis técnico de Qwen3.8-27B (Local AI Zone): https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
