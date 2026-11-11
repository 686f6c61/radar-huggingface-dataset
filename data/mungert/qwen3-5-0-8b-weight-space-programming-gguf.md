# Mungert/Qwen3.5-0.8B-weight-space-programming-GGUF

## Resumen

Qwen3.5-0.8B-weight-space-programming es una variante editada del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario Mungert en formato GGUF. No se trata de un modelo entrenado de forma convencional: el checkpoint original fue modificado mediante una técnica denominada "weight-space programming", en la que un LLM de frontera (denominado "Astra") editó directamente los pesos del modelo base sin descenso de gradiente ni entrenamiento adicional. El objetivo concreto de la edición era corregir los bucles de razonamiento que el modelo base presenta en problemas matemáticos.

La edición afecta únicamente a dos tensores: las matrices `down_proj` de las capas 15 y 19 del bloque MLP. Se modificaron 64 columnas de salida en cada una, lo que supone 131.072 pesos, es decir, un 0,016% del total del modelo. El modelo base cuenta con 772.845.888 parámetros reales según los safetensors, y esta versión GGUF se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño (sub-1000M) con capacidad matemática mejorada de forma quirúrgica; por otro, ejemplifica una técnica experimental de edición de pesos que podría cambiar la forma de ajustar modelos sin reentrenamiento completo. Los resultados publicados muestran una mejora sustancial en MATH-500 y GSM8K respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B; edición sobre capas MLP `down_proj` 15 y 19) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 34.816 tokens en la configuración de ejemplo (`max_model_len=34816`); contexto nativo del base no disponible |
| Tipos de cuantizacion | GGUF (diversas cuantizaciones generadas con llama.cpp; el repositorio ocupa 14,5 GB e incluye múltiples variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp en el commit `ca89968a2`); el checkpoint original está en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer multimodal (incluye torre de visión, aunque los prompts de texto no la utilizan). La edición no implica entrenamiento: se realizó mediante "weight-space programming", un proceso en el que un LLM de frontera trabajó en una sesión de Python sobre los pesos, con un presupuesto de 50 pases hacia delante sobre problemas de práctica de los conjuntos GSM8K y MATH. El modelo identificó que los bucles de pensamiento del base estaban asociados a una dirección concreta escrita por los MLP de las capas 15 y 19, y restó esa dirección de 64 columnas de salida de `down_proj` en cada capa.

La verificación es rigurosa: solo dos tensores difieren del modelo base `Qwen/Qwen3.5-0.8B` en el commit `2fc06364715b967f1860aea9cf38778875588b17`, y se publican los hashes sha256 de los bytes en bfloat16 de ambos tensores. El checkpoint fue reconstruido con un script (`apply_edit.py`) que verifica hash a hash cada tensor reconstruido contra el checkpoint evaluado en el artículo original. La evaluación se realizó con vLLM 0.33.0, transformers 5.20.2 y math-verify 0.9.0, con thinking activado y muestreo `think35` (temperatura 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, máximo 32.768 tokens nuevos).

## Capacidades

- Generación de texto conversacional con plantilla de chat y modo thinking activable (`enable_thinking=True`).
- Razonamiento matemático paso a paso, con formato de respuesta final en `\boxed{}`.
- Resolución de problemas de matemáticas de nivel GSM8K y MATH, con reducción drástica de bucles infinitos respecto al base.
- Capacidad multimodal heredada del base (torre de visión presente en el checkpoint completo), aunque no evaluada en esta edición.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking con presupuesto de hasta 32.768 tokens de generación.

## Casos de uso

- Evaluación de técnicas de edición de pesos: este checkpoint sirve como referencia reproducible para investigar "weight-space programming", ya que publica hashes, diffs y scripts de reconstrucción que permiten verificar cada paso.
- Tutoría matemática automatizada: el modelo puede resolver problemas de aritmética y álgebra de nivel escolar con razonamiento paso a paso, y su reducción de bucles (del 93% al 33% de respuestas que agotan el límite de tokens) lo hace más práctico en producción que el base.
- Generación de soluciones con formato verificable: la salida en `\boxed{}` permite integrar el modelo en pipelines de corrección automática con math-verify u otras herramientas de grading.
- Investigación sobre bucles de razonamiento en LLMs: al estar identificada la dirección responsable de los bucles en las capas 15 y 19, el modelo es un caso de estudio para analizar mecanismos internos de repetición.
- Despliegue en entornos con recursos limitados: con menos de 800M de parámetros y formato GGUF, puede ejecutarse en CPU o GPU de gama baja para tareas de matemáticas básicas.
- Docencia y demostraciones interactivas: la demo pública permite comparar en vivo el comportamiento del base (que entra en bucle) frente al editado (que resuelve), lo que resulta útil para explicar edición de pesos.
- Pruebas de regresión en pipelines de evaluación matemática: el conjunto de evaluaciones publicadas (`eval/`) con 2.000 generaciones sobre MATH-500 sirve como baseline reproducible.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking activado, hasta 32.768 tokens, varias muestras por problema):

| Modelo | MATH-500 (%) | GSM8K (%) | IFEval (%) | Agota límite de tokens (%) |
|---|---|---|---|---|
| Qwen3.5-0.8B base | 7,9 | 13,8 | 21,0 | 93,0 |
| Editado (este modelo) | 48,1 | 67,1 | 62,3 | 33,1 |

Re-ejecución independiente del checkpoint (MATH-500 completo, 500 problemas × 4 muestras = 2.000 generaciones, 43,4M tokens generados, 51 minutos en H200, protocolo del artículo, temperatura 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, máximo 32.768 tokens nuevos, seed 0, grading con math-verify 0.9.0):

| Modelo | MATH-500 (%) | Agota límite de tokens (%) |
|---|---|---|
| Editado (re-ejecución) | 51,0 | 31,6 |
| Base (smoke test de 25 problemas) | 5,0 | 95,0 |

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 772M de parámetros, las cuantizaciones GGUF típicas (Q4_K_M, Q5_K_M, Q8_0) ocupan desde aproximadamente 0,5 GB hasta 1 GB, lo que permite ejecución en CPU y GPU de gama baja. El repositorio completo ocupa 14,5 GB por incluir múltiples variantes.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) puede alojar el modelo con holgura; para evaluación a gran escala se usó una NVIDIA H200.
- Cabe en GPU consumer: sí, en todas las cuantizaciones habituales.
- Opciones de despliegue: vLLM (usado en la evaluación oficial con `max_model_len=34816`), llama.cpp (formato nativo GGUF), Ollama y TGI mediante los GGUF generados.
- Latencia y throughput: la re-ejecución oficial generó 43,4M tokens en 51 minutos en una H200 con vLLM, lo que equivale aproximadamente a 14.200 tokens por segundo en ese hardware. No se dispone de datos de latencia en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 (%) | GSM8K (%) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-weight-space-programming (este) | 772,8M | hasta 34.816 | 48,1–51,0 | 67,1 | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-0.8B (base) | 772,8M | no disponible | 7,9 | 13,8 | Apache 2.0 | safetensors |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa más relevante es contra su propio modelo base, dado que la información proporcionada no incluye otros modelos de la misma categoría con los que contrastar.

## Limitaciones y advertencias

- La edición es extremadamente localizada (0,016% de los pesos) y está orientada exclusivamente a matemáticas; no hay evidencia de que mejore otras capacidades y podría degradar tareas no evaluadas.
- Persiste un 31,6–33,1% de respuestas que agotan el límite de tokens, por lo que sigue siendo necesario un límite de generación y un mecanismo de corte en producción.
- El modelo base presenta bucles de razonamiento severos (93–95% de agotamiento del límite en el base); aunque la edición los reduce, el comportamiento no desaparece.
- Riesgo de alucinación inherente a un modelo de 772M de parámetros; no debe usarse como fuente de verdad matemática sin verificación externa.
- Idiomas soportados no documentados; la evaluación se realizó únicamente en inglés.
- La model card advierte que la evaluación original se hizo sobre una exportación solo-texto, mientras que este checkpoint es la versión multimodal completa; los tensores del modelo de lenguaje son idénticos (verificado por hash), pero no se ha evaluado el comportamiento multimodal.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al matemático.
- El repositorio incluye promoción de un servicio externo (Quantum Network Monitor) del autor de la cuantización, sin relación con el modelo.
- Los datos de benchmarks proceden del artículo y de una re-ejecución independiente; no se han replicado por terceros ajenos al proyecto.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Mungert/Qwen3.5-0.8B-weight-space-programming-GGUF
- Checkpoint original (safetensors): https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Artículo "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs y código de reconstrucción: https://github.com/RikiyaT/lm_understand-logs
- Demo interactiva: https://huggingface.co/spaces/akhaliq/weight-space-programming-demo
- Evaluaciones (resultados crudos): https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming/tree/main/eval
- llama.cpp (commit usado): https://github.com/ggerganov/llama.cpp/commit/ca89968a23a13e571a6b802a9891d22763153b61
- Guía de selección de formato GGUF del cuantizador: https://readyforquantum.com/huggingface_gguf_selection_guide.html
