# shoemoney/Qwen3.8-27B-Abliterated-MLX-mxfp4

## Resumen

El modelo `shoemoney/Qwen3.8-27B-Abliterated-MLX-mxfp4` es una conversión cuantizada en formato MXFP4 (4 bits) del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterada" (sin rechazo de contenido) del modelo Qwen3.8-27B de Alibaba. La cuantización se realizó con la librería `mlx-vlm` y está optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX. No se ha realizado ningún fine-tuning, merging ni re-alineamiento: solo se han convertido los pesos de BF16 a MXFP4 con el mismo tamaño de grupo.

El modelo base Qwen3.8-27B es un modelo denso de visión-lenguaje (VLM) con 27 000 millones de parámetros, arquitectura híbrida de atención (48 de 64 capas con atención lineal), torre de visión, cabeza de decodificación especulativa (MTP) y una ventana de contexto nativa de 262 000 tokens, extensible a 1 000 000. La versión abliterada elimina los mecanismos de rechazo de contenido, lo que permite generar respuestas sin censura, aunque con los riesgos asociados. Esta conversión MLX ocupa 15,24 GB en disco y está pensada para desarrolladores que quieran ejecutar un modelo de 27B sin censura en equipos Apple con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (lineal y full attention), vision-lenguaje |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | MXFP4 (4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer denso con atención híbrida: 48 de sus 64 capas utilizan atención lineal (linear attention) para reducir el coste computacional en secuencias largas, mientras que las 16 restantes usan atención completa (full attention) para preservar la calidad en tareas que requieren precisión. Incluye una torre de visión que permite procesar imágenes junto con texto, y una cabeza MTP (multi-token prediction) que actúa como borrador para decodificación especulativa, acelerando la generación. El modelo fue entrenado por Alibaba con un enfoque en codificación, productividad ofimática y tareas de agente, con razonamiento configurable (modo pensamiento).

La versión abliterada de `huihui-ai` elimina los vectores de rechazo del modelo original, de modo que no aplica filtros de contenido durante la generación. La conversión a MLX MXFP4 se realizó con `mlx_vlm.convert` a partir de los pesos BF16, sin modificar los pesos más allá de la cuantización. No se ha aplicado ningún proceso de alineación posterior, por lo que el comportamiento del modelo es el del base abliterado, con la degradación típica de una cuantización de 4 bits.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, lo que permite describir imágenes, responder preguntas visuales y analizar documentos escaneados.
- Generación de texto y razonamiento: mantiene las capacidades de razonamiento del modelo base, incluyendo el modo de pensamiento configurable (thinking mode) para problemas complejos.
- Generación de código: el modelo base está optimizado para tareas de programación, incluyendo generación, explicación y depuración de código en múltiples lenguajes.
- Tareas de agente: gracias a su contexto largo (262K) y a la atención híbrida, puede manejar conversaciones multi-turno y tareas de larga duración con memoria extendida.
- Sin censura: la abliteración elimina los rechazos de contenido, permitiendo generar respuestas sobre temas que el modelo original bloquearía.
- Compatibilidad con Apple Silicon: al ser una conversión MLX, se ejecuta de forma nativa en chips M-series mediante `mlx-vlm`, sin necesidad de GPU NVIDIA.

## Casos de uso

- Asistente de programación en local: un desarrollador puede ejecutar el modelo en un MacBook Pro con chip M3 o superior para generar código, refactorizar funciones o explicar fragmentos complejos, aprovechando el contexto largo para mantener el estado del proyecto.
- Análisis de documentos con imágenes: el modelo puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer información relevante, útil en entornos de investigación o soporte técnico.
- Chatbot sin restricciones de contenido: para prototipos o aplicaciones de investigación donde se necesita explorar temas sensibles sin filtros, la versión abliterada permite respuestas abiertas, aunque con supervisión humana.
- Tareas de agente con memoria extendida: gracias a los 262K tokens de contexto, puede gestionar conversaciones largas o procesos multi-paso, como la planificación de proyectos o la automatización de flujos de trabajo.
- Generación de contenido creativo: redacción de guiones, historias o material de marketing sin las limitaciones habituales de los modelos alineados, siempre que se asuma la responsabilidad del uso.
- Evaluación de modelos en hardware Apple: investigadores pueden comparar el rendimiento de esta cuantización MXFP4 frente a otras (GGUF, FP8) en tareas de generación y razonamiento, usando las métricas de perplexity y throughput proporcionadas.

## Benchmarks y rendimiento

La model card proporciona métricas de rendimiento medidas en un Apple M3 Ultra con 96 GB de memoria unificada y macOS 27. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Valor |
|---|---|
| Tamano en disco | 15,24 GB |
| Perplexity (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 6,251 |
| Throughput (1 peticion) | 22,1 tok/s |
| Throughput (8 peticiones concurrentes) | 65,7 tok/s |

La perplexity es comparable solo dentro de la familia de cuantizaciones del mismo modelo base, ya que los tokenizadores difieren entre familias. El factor relativo al mejor escalón de la familia es 1,00×, lo que indica que esta cuantización MXFP4 es la mejor de su serie.

## Requisitos de hardware

- El modelo está diseñado exclusivamente para Apple Silicon (chips M-series) mediante el framework MLX. No es compatible con GPUs NVIDIA ni CUDA.
- Tamaño en disco: 15,24 GB. Se recomienda un Mac con al menos 24 GB de memoria unificada para cargar el modelo y dejar espacio para el sistema operativo y el contexto.
- La medición de rendimiento se realizó en un Apple M3 Ultra con 96 GB de memoria unificada, obteniendo 22,1 tok/s en generación secuencial y 65,7 tok/s con 8 peticiones concurrentes.
- Para uso interactivo, un MacBook Pro con chip M3 Pro o M4 Pro y 36 GB de memoria unificada puede ejecutar el modelo con una latencia aceptable, aunque el throughput será menor que en el M3 Ultra.
- Despliegue: se utiliza la librería `mlx-vlm` (no `mlx-lm`), con el comando `mlx_vlm.generate`. No se mencionan opciones para servidores de inferencia como vLLM o TGI, ya que MLX es específico de Apple.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, otras cuantizaciones del mismo base o modelos abliterados alternativos) en la información proporcionada. La única comparación interna es con otras cuantizaciones de la familia `Huihui-Qwen3.8-27B-abliterated`, donde esta versión MXFP4 es la de mejor perplexity (1,00× relativo). Se puede comparar cualitativamente con el modelo base BF16, que ocuparía aproximadamente 54 GB en disco y requeriría más memoria, pero ofrecería una fidelidad ligeramente superior. No se dispone de datos de otras alternativas como GGUF o FP8.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo de contenido, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. El uso en producción debe incluir filtros externos y supervisión humana.
- La cuantización MXFP4 introduce una degradación de calidad respecto al modelo BF16 original, aunque la perplexity medida (6,251) es la mejor de su familia de cuantizaciones.
- El modelo solo funciona en Apple Silicon; no es portable a entornos con GPUs NVIDIA o AMD, lo que limita su uso en centros de datos convencionales.
- No se ha confirmado el soporte de tool calling o function calling en esta versión, aunque el modelo base podría tenerlo. Se recomienda verificar antes de integrarlo en pipelines de agentes.
- La ventana de contexto de 262K tokens es nativa, pero el uso de atención lineal en la mayoría de capas puede afectar a la calidad en tareas que requieren atención precisa sobre detalles locales.
- El repositorio no indica los idiomas soportados; aunque Qwen suele ser multilingüe, no hay confirmación para esta conversión.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shoemoney/Qwen3.8-27B-Abliterated-MLX-mxfp4)
- [Modelo base abliterado (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Modelo original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Recetas vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Página de QwenCloud para Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [Blog sobre OrcaRouter y abliteración de Qwen3.8-27B](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)
