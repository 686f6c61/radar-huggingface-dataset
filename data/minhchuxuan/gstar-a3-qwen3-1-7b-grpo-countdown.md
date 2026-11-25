# minhchuxuan/gstar-a3-qwen3-1.7b-grpo-countdown

## Resumen

GStar A3 Qwen3-1.7B GRPO Countdown es un conjunto de cuatro ajustes finos completos (full fine-tune) del modelo Qwen/Qwen3-1.7B, publicados por el usuario minhchuxuan como parte de la Assignment 3 del GStar Bootcamp 2026. El modelo no es una arquitectura nueva: hereda íntegramente la arquitectura transformer de Qwen3-1.7B y se entrena específicamente para resolver tareas de tipo Countdown, un juego aritmético en el que hay que construir una ecuación que use cada número proporcionado exactamente una vez para alcanzar un objetivo.

El interés técnico del repositorio es que cada carpeta contiene una variante entrenada con un algoritmo de refuerzo distinto (GRPO o Dr.GRPO) y con un presupuesto de generación distinto (256 o 512 tokens), lo que permite comparar el efecto del algoritmo y del límite de longitud sobre la precisión en la tarea. El entrenamiento emplea RLVR (reinforcement learning with verifiable rewards) sobre el dataset justinphan3110/Countdown-Tasks-3to4, con una recompensa binaria basada en la corrección de la ecuación.

Es relevante ahora como material de estudio reproducible de RL con recompensas verificables sobre un modelo pequeño (1.700 millones de parámetros) que cabe en GPU de consumo, y porque documenta con precisión las condiciones de entrenamiento y los resultados de test, algo poco habitual en repositorios de fine-tuning experimentales. La licencia es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. No se modifica la arquitectura: se parte de los pesos del modelo base y se entrenan todos los parámetros con aprendizaje por refuerzo. El repositorio contiene cuatro subcarpetas (`grpo_L256`, `dr_grpo_L256`, `grpo_L512`, `dr_grpo_L512`), cada una con un fine-tune independiente.

El entrenamiento usa GRPO o Dr.GRPO durante 80 pasos, con 128 rollouts por paso (8 por prompt), AdamW con learning rate 7e-6, sin término KL y una actualización on-policy por batch. El dataset es justinphan3110/Countdown-Tasks-3to4. La función de recompensa es verificable: 1.0 si la ecuación es correcta y usa cada número exactamente una vez, 0.1 si hay una etiqueta `<answer>` con cualquier otro contenido, y 0.0 si no hay etiqueta de respuesta. La única diferencia entre las variantes es el algoritmo (GRPO frente a Dr.GRPO) y el presupuesto máximo de generación (256 frente a 512 tokens).

## Capacidades

- Generación de texto y razonamiento aritmético orientado a la resolución de problemas Countdown: construir una expresión que combine los números dados con operaciones para alcanzar un objetivo.
- Emisión de respuestas estructuradas mediante la etiqueta `<answer>`, requisito del esquema de recompensa del entrenamiento.
- Razonamiento paso a paso dentro del presupuesto de generación configurado (256 o 512 tokens según la variante).
- Herencia de las capacidades generales del modelo base Qwen3-1.7B (generación de texto, conocimiento general), aunque el ajuste con RL sobre una única tarea puede degradar o desplazar el comportamiento fuera de distribución.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas para este fine-tune.

## Casos de uso

- Evaluación de algoritmos de RL: comparar directamente GRPO frente a Dr.GRPO con el mismo modelo base, dataset y presupuesto, usando las cuatro carpetas como líneas base reproducibles en experimentos de RLVR.
- Estudio del efecto del presupuesto de generación: analizar cómo el límite de 256 frente a 512 tokens afecta a la precisión (45,6 % y 61,6 % en GRPO; 49,4 % y 59,9 % en Dr.GRPO) en tareas que requieren cadenas de razonamiento de longitud variable.
- Generación de datos sintéticos de razonamiento aritmético: producir soluciones verificables para problemas Countdown que pueden filtrarse automáticamente por corrección de la ecuación.
- Docencia y formación en RL: usar el repositorio como ejemplo completo y reproducible de un pipeline GRPO con recompensa verificable sobre un modelo de 1.700 millones de parámetros que cabe en una GPU de consumo.
- Investigación en verificación de recompensas: estudiar el impacto de esquemas de recompensa parcial (1.0 / 0.1 / 0.0) en el comportamiento del modelo y en la tasa de respuestas sin etiqueta `<answer>`.
- Prototipado de asistentes matemáticos acotados: integrar la variante `grpo_L512` en un servicio interno que resuelva problemas de combinación de números con validación automática de la salida.
- Reproducción de experimentos: replicar el entrenamiento con los hiperparámetros documentados (80 pasos, 128 rollouts, lr 7e-6, sin KL) para validar los resultados publicados.

## Benchmarks y rendimiento

Resultados de precisión en test sobre 1024 problemas Countdown, media de 4 muestras (mean@4), según la model card:

| Variante | Algoritmo | Presupuesto de generación | Precisión test (mean@4) |
|---|---|---|---|
| `grpo_L256` | GRPO | 256 tokens | 45,6 % |
| `dr_grpo_L256` | Dr.GRPO | 256 tokens | 49,4 % |
| `grpo_L512` | GRPO | 512 tokens | 61,6 % |
| `dr_grpo_L512` | Dr.GRPO | 512 tokens | 59,9 % |

Referencia zero-shot del modelo base Qwen3-1.7B con el mismo prompt:

| Presupuesto de generación | Precisión zero-shot |
|---|---|
| 256 tokens | 0,1 % |
| 512 tokens | 15,2 % |
| 1024 tokens | 37,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para los pesos (1.700 millones de parámetros a 2 bytes), más memoria para el contexto y el runtime de transformers.
- En cuantización de 8 bits: alrededor de 1,7 GB de pesos; en 4 bits, alrededor de 0,9 GB. Estas cuantizaciones no están documentadas por el autor y requerirían conversión propia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con contexto moderado (RTX 3060 Ti, RTX 4060, RTX 4090). Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en bfloat16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (soporte oficial documentado, con carga por `subfolder`). vLLM, llama.cpp, Ollama y TGI no están documentados para este repositorio; su uso requeriría conversión o configuración adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión Countdown (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GStar A3 Qwen3-1.7B GRPO Countdown (`grpo_L512`) | 1,7 B | no disponible | 61,6 % (mean@4) | Apache 2.0 | Hugging Face |
| GStar A3 Qwen3-1.7B GRPO Countdown (`dr_grpo_L256`) | 1,7 B | no disponible | 49,4 % (mean@4) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (zero-shot) | 1,7 B | no disponible | 15,2 % (512 tokens), 37,8 % (1024 tokens) | Apache 2.0 | Hugging Face |
| Otros fine-tunes de Qwen3-1.7B para Countdown | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (fine-tunes de RLVR para tareas de razonamiento aritmético verificable) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: el ajuste con RL sobre una única tarea (Countdown) puede degradar el rendimiento en tareas generales respecto al Qwen3-1.7B original; no se han publicado evaluaciones que cuantifiquen esta posible regresión.
- Dependencia del formato: la recompensa exige la etiqueta `<answer>`; fuera de ese esquema el modelo puede producir salidas no evaluables o mal formateadas.
- Precisión limitada: incluso la mejor variante alcanza el 61,6 % en test, por lo que no es fiable como resolutor autónomo sin verificación externa de la ecuación.
- Sesgos: no documentados en la información proporcionada; al heredar el modelo base, puede reproducir sesgos presentes en Qwen3-1.7B.
- Riesgo de alucinación: presente en la generación de texto libre; en esta tarea se mitiga parcialmente porque la corrección de la ecuación es verificable automáticamente.
- Idiomas: no se documenta qué idiomas soporta el fine-tune; el prompt de entrenamiento y el dataset no se detallan en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-1.7B y del dataset justinphan3110/Countdown-Tasks-3to4 antes de un despliegue en producción.
- Repositorio de 13,8 GB con cuatro fine-tunes completos: requiere descargar subcarpetas específicas (`subfolder`) para evitar descargar las cuatro variantes.
- Sin métricas de latencia, throughput ni consumo de memoria publicadas: la planificación de producción requiere medición propia.
- Fecha de creación del repositorio (2026-11-23) y ausencia de descargas o likes: proyecto experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minhchuxuan/gstar-a3-qwen3-1.7b-grpo-countdown
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/justinphan3110/Countdown-Tasks-3to4
