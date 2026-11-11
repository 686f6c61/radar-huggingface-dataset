# rilixai/Qwen3.5-0.8B-Beaker-math-9e523b95

## Resumen

Qwen3.5-0.8B-Beaker-math-9e523b95 es una edición de pesos (weight editing) del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario rilixai en Hugging Face. El cambio no consiste en un fine-tuning convencional ni en un ajuste por RLHF, sino en una modificación quirúrgica de 1.024 números en una única columna de pesos de la capa 22 (`mlp.down_proj.weight[:, 573]`), multiplicada por 2. El objetivo declarado es corregir los bucles de razonamiento matemático que el modelo base presenta en tareas de matemáticas.

La edición fue generada por Beaker, una herramienta de programación en el espacio de pesos que, según la model card, utilizó GPT-6.1 Sol como modelo editor y se guió únicamente por puntuaciones de edición (sin lecturas del modelo) en una ejecución de aproximadamente cuatro horas. El resultado reportado es un salto en MATH-500 del 7,4% al 37,4%, manteniendo la licencia Apache-2.0 del modelo base.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-0.8B original: 873.438.784 parámetros totales (aproximadamente 0,87B) y una pipeline declarada de image-text-to-text, lo que sugiere capacidades multimodales heredadas del base. Es relevante como ejemplo de intervención mínima sobre pesos con impacto medible en una capacidad concreta, un enfoque distinto al de los ajustes masivos de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), según modelo base; detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y no ha sido reentrenado: la única diferencia con el base son 1.024 valores numéricos en la columna 573 de `mlp.down_proj.weight` de la capa 22, escalados por 2. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si hubo fases de RLHF o DPO.

La innovación técnica reside en el método de edición: Beaker, descrito en el blog del autor, realiza una búsqueda en el espacio de pesos guiada por puntuaciones de evaluación, sin que el modelo editor lea las respuestas del modelo editado. La edición se ejecutó en unas cuatro horas y se seleccionó por su efecto sobre MATH-500, con verificación de efectos secundarios en MMLU-Pro e IFEval. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento matemático con modo thinking: la edición corrige bucles de razonamiento y eleva el rendimiento en MATH-500 del 7,4% al 37,4%.
- Procesamiento image-text-to-text: la pipeline declarada es multimodal, aunque no se detallan las capacidades de visión concretas.
- Modo thinking activable mediante `enable_thinking=True` en la plantilla de chat.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo thinking sugiere cierta capacidad de razonamiento extendido, pero no se documenta explícitamente.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está específicamente editado para evitar bucles en razonamiento matemático, con un rendimiento medido de 37,4% en MATH-500, lo que lo hace adecuado para tutores automáticos o generación de soluciones paso a paso en entornos educativos.
- Evaluación de técnicas de weight editing: sirve como caso de estudio reproducible para investigadores que quieran comparar intervenciones mínimas sobre pesos frente a fine-tuning completo, dado que la edición exacta está publicada en `edits/`.
- Prototipado rápido en entornos con recursos limitados: con 0,87B de parámetros y 1,8 GB de repo, puede desplegarse en una sola GPU consumer para experimentar con razonamiento matemático sin infraestructura dedicada.
- Servicio de inferencia con vLLM: la model card documenta `vllm serve rilixai/Qwen3.5-0.8B-Beaker-math-9e523b95`, lo que permite integrarlo en pipelines de evaluación o APIs internas con throughput alto para su tamaño.
- Asistente conversacional con modo thinking: la plantilla de chat con `enable_thinking=True` permite usarlo en aplicaciones donde se requiera razonamiento explícito antes de responder, como análisis de problemas cuantitativos.
- Investigación sobre efectos secundarios de ediciones: los datos de MMLU-Pro (+4,1) e IFEval (−1,7) permiten estudiar cómo una edición localizada afecta a capacidades no objetivo, útil para quienes diseñan métodos de edición de pesos.
- Base para experimentos multimodales: al declarar pipeline image-text-to-text, puede emplearse como punto de partida para tareas que combinen imagen y texto, aunque las capacidades concretas de visión no están documentadas.

## Benchmarks y rendimiento

| Benchmark | Modelo base | Modelo editado | Delta | Configuración |
|---|---|---|---|---|
| MATH-500 | 7,4% | 37,4% | +30,0 | Thinking on, temp 0.6, top-p 0.95, top-k 20, presence penalty 1.5, 32.768 tokens nuevos, 4 respuestas por problema, math-verify 0.9.0, vLLM 0.32.0 |
| MMLU-Pro (thinking on) | 32,9% | 36,9% | +4,1 ± 2,0 | 490 preguntas, 1 respuesta cada una |
| IFEval prompt-level strict (thinking off) | 53,8% | 52,1% | −1,7 ± 1,6 | Thinking off |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873M parámetros, en bfloat16 requiere aproximadamente 1,8 GB solo para pesos; en fp16 similar. En cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM para bfloat16 con overhead; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para despliegue con vLLM se recomienda una GPU con soporte CUDA y al menos 8 GB para margen de caché KV.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM (`vllm serve`), y presumiblemente llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles; la model card solo indica que se sirvió con vLLM 0.32.0 para evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Beaker-math-9e523b95 | 873M | No disponible | 37,4% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873M | No disponible | 7,4% | Apache-2.0 | Hugging Face |
| Otros modelos de ~1B con foco matemático | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de modelos alternativos comparables, por lo que la comparativa se limita al modelo base y a la ausencia de datos de terceros.

## Limitaciones y advertencias

- La edición se optimizó exclusivamente para MATH-500 y puede no generalizar a otros dominios matemáticos o a tareas de razonamiento no matemático.
- Efectos secundarios medidos: mejora en MMLU-Pro (+4,1) pero degradación en IFEval (−1,7), lo que indica que la edición no es neutral para capacidades no objetivo.
- No hay información sobre sesgos conocidos, riesgo de alucinación específico ni comportamiento multilingüe; se heredan los del modelo base, no documentados aquí.
- La longitud de contexto no está disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Las capacidades multimodales (image-text-to-text) están declaradas por la pipeline pero no se detallan ni se evalúan en la model card.
- Licencia Apache-2.0 permite uso comercial, pero al ser una modificación del base, deben respetarse las condiciones del modelo original Qwen3.5-0.8B.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente.
- La evaluación se realizó con configuraciones específicas (thinking on, 32.768 tokens nuevos, 4 respuestas por problema); los resultados pueden variar con otros ajustes de decodificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rilixai/Qwen3.5-0.8B-Beaker-math-9e523b95
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ejecución pública de Beaker: https://app.withbeaker.ai/public/runs/9e523b95-a868-44a3-91d9-59d1ae625ee2
- Blog de Beaker sobre programación en el espacio de pesos: https://www.withbeaker.ai/blog/weight-space-programming
- Sitio de Beaker: https://www.withbeaker.ai
