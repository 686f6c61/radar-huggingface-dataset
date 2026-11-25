# AJ-Gonzalez/lfm25-230m-es-joint5

## Resumen

LFM2.5-230M ES joint5 es un checkpoint de investigación derivado de LiquidAI/LFM2.5-230M, un modelo de lenguaje de 229.693.184 parámetros (aproximadamente 230 M) desarrollado originalmente por Liquid AI. La variante que nos ocupa ha sido publicada por el usuario AJ-Gonzalez y consiste en un ajuste fino mediante estrategias de evolución (evolution strategies, ES) de parámetros completos sobre cinco tareas aritméticas sintéticas simultáneas, sin uso de gradientes, sin trazas de profesor y sin etiquetas supervisadas. Cada actualización es una suma ponderada por recompensa de perturbaciones gaussianas sembradas (seeded).

El interés del checkpoint es metodológico más que de producto: demuestra que el ajuste fino con ES a escala de un modelo pequeño puede mejorar tareas aritméticas concretas manteniendo todas las tareas en el lote de entrenamiento (multi-task replay), y documenta un fallo relevante de escalado de ruido (sigma global absoluto frente a sigma relativo por tensor). El entrenamiento se ejecutó en una única pasada conjunta de 14 iteraciones, con población N=8, 4 prompts por tarea e iteración, decodificación greedy y `max_new_tokens=12`, en bf16 sobre un Apple M1 de 8 GB vía MPS en aproximadamente 19,5 minutos.

Se trata de un modelo base de arquitectura LFM2 (familia de Liquid AI), no de un asistente general: el autor advierte explícitamente que el comportamiento fuera de las tareas sintéticas de aritmética y reversión de dígitos puede degradarse. La licencia es la LFM Open License v1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid AI); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica y entrena en bf16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm-open-license-v1.0`) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,5 GB |
| Modelo base | LiquidAI/LFM2.5-230M |
| Pipeline | text-generation |
| Precisión de entrenamiento | bf16 |

## Arquitectura y entrenamiento

El checkpoint parte de LiquidAI/LFM2.5-230M, un transformer de la familia LFM2 de Liquid AI con 229.693.184 parámetros. La información disponible no detalla la composición interna de capas, el mecanismo de atención ni la longitud de contexto del modelo base; esos datos deben consultarse en la model card de LiquidAI/LFM2.5-230M. Lo relevante de esta variante es el procedimiento de ajuste: estrategias de evolución de parámetros completos (full-parameter ES), sin retropropagación.

El entrenamiento consistió en una única ejecución conjunta con las cinco tareas replayed en cada batch: población N=8, 4 prompts por tarea e iteración, 14 iteraciones, sigma por tensor de 1e-2 × RMS, alpha = 1e-3, decodificación greedy y `max_new_tokens=12`, en bf16 sobre MPS (Apple M1, 8 GB) durante unos 19,5 minutos. Las recompensas fueron distancia numérica graduada para las tareas aritméticas y fracción de dígitos correctamente colocados para las de reversión. El autor documenta dos hallazgos técnicos: (1) el multi-task replay funciona, ya que todas las tareas con margen de mejora progresaron, mientras que en una ejecución previa por etapas la multiplicación cayó de 0,589 a 0,268 al quedar fuera de la mezcla y se recuperó hasta 0,833 al reintroducirla; y (2) un sigma absoluto global de 1e-3 produjo poblaciones degeneradas (18–52 % en algunos tensores) y destruyó el modelo, mientras que el sigma relativo por tensor mantuvo poblaciones no degeneradas.

## Capacidades

- Generación de texto autoregresiva sobre el modelo base LFM2.5-230M, con plantilla de chat (chat template) gestionada por los helpers del repositorio.
- Aritmética de suma de un dígito (`a + b`, operandos 1–9), con precisión held-out del 100 % tras el ajuste.
- Multiplicación de 2 dígitos × 2 dígitos, con precisión held-out del 91,3 % tras el ajuste.
- Multiplicación de 3 dígitos × 2 dígitos, con precisión held-out del 49,7 % tras el ajuste.
- Reversión de 3 dígitos, con precisión held-out del 28,3 % tras el ajuste (dentro del ruido estadístico).
- Reversión de 4 dígitos, con precisión held-out del 18,8 % tras el ajuste.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre estrategias de evolución para ajuste fino de LLM: el checkpoint sirve como referencia reproducible del método descrito en arXiv:2509.24372, con el runner `code/local_multitask.py` incluido para repetir la ejecución conjunta de cinco tareas.
- Estudio de multi-task replay en ES: permite analizar empíricamente por qué mantener todas las tareas en el batch evita el olvido catastrófico observado en la ejecución por etapas (caída de multiplicación de 0,589 a 0,268).
- Análisis de esquemas de escalado de ruido: el contraste documentado entre sigma relativo por tensor y sigma absoluto global (que destruyó el modelo) es un caso de estudio útil para quienes diseñan perturbaciones en ES a escala.
- Validación de pipelines de ES en hardware de consumo: la ejecución completa en un Apple M1 de 8 GB en ~19,5 minutos permite reproducir experimentos de ajuste fino sin GPU dedicada.
- Benchmark de aritmética sintética controlada: las cinco tareas con conjuntos held-out de 12–20 ítems sirven como banco de pruebas rápido para comparar variantes de ES frente a RL o SFT en modelos de ~230 M.
- Docencia y divulgación: el tamaño reducido del checkpoint (0,5 GB) y su licencia abierta lo hacen adecuado para demostraciones prácticas de ajuste fino sin gradientes en cursos y talleres.

## Benchmarks y rendimiento

Precisión held-out antes y después del ajuste, según la model card del autor:

| Tarea | Prompt | Base | Tras ajuste |
|---|---|---:|---:|
| add | `a + b`, 1–9 | 0,963 | 1,000 |
| rev3 | invertir 3 dígitos | 0,317 | 0,283 |
| mul2x2 | 2 dígitos × 2 dígitos | 0,589 | 0,913 |
| rev4 | invertir 4 dígitos | 0,087 | 0,188 |
| mul3x2 | 3 dígitos × 2 dígitos | 0,326 | 0,497 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los conjuntos held-out son pequeños (12–20 ítems por tarea) y el propio autor advierte que las diferencias deben tratarse como primeras señales, no como medidas precisas; la caída de rev3 (−0,034) corresponde a un solo ítem sobre 20 y está dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,46 GB solo para pesos (229,7 M × 2 bytes), más overhead de activaciones y KV cache; el repositorio ocupa 0,5 GB.
- Cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en hardware integrado; el entrenamiento documentado se ejecutó en un Apple M1 de 8 GB vía MPS.
- GPU recomendadas para producción: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 2–4 GB libres es suficiente para inferencia en bf16 o fp16.
- Opciones de despliegue: transformers (librería declarada, `transformers>=5.22` para el runner de entrenamiento); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada. El único dato temporal es el de entrenamiento (14 iteraciones conjuntas en ~19,5 minutos en M1).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-230M ES joint5 (este) | 229,7 M | no disponible | Ajuste fino por ES sobre 5 tareas sintéticas | LFM Open License v1.0 | Hugging Face (0 descargas, 0 likes en el momento del análisis) |
| LiquidAI/LFM2.5-230M | 229,7 M | no disponible | Modelo base LFM2 | LFM Open License v1.0 | Hugging Face (modelo base oficial) |
| Alternativas de ~230 M de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un asistente general: está ajustado sobre aritmética sintética y el autor advierte de comportamiento degradado fuera de esas tareas.
- Riesgo de olvido catastrófico si se usa como base para otros ajustes sin incluir las tareas originales en la mezcla; el propio autor documenta la caída de multiplicación en la ejecución por etapas.
- Los conjuntos held-out son pequeños (12–20 ítems), por lo que las mejoras reportadas son señales preliminares y no medidas precisas; la variación de rev3 es ruido.
- Riesgo de alucinación y sesgos del modelo base: no documentados específicamente en la información disponible, pero heredados de LiquidAI/LFM2.5-230M.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingüe.
- Licencia LFM Open License v1.0: es una licencia "other" con términos propios; deben revisarse las restricciones de uso comercial en el enlace de licencia antes de cualquier despliegue en producción.
- Checkpoint con 0 descargas y 0 likes en el momento del análisis: no hay validación comunitaria independiente de los resultados.
- El repositorio incluye código de reproducción, pero no se documentan garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/lfm25-230m-es-joint5
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE
- Paper del método (arXiv:2509.24372): https://arxiv.org/abs/2509.24372
