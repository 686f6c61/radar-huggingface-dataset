# RikiyaT/Qwen3.5-0.8B-weight-space-programming

## Resumen
Qwen3.5-0.8B-weight-space-programming es un checkpoint derivado de Qwen/Qwen3.5-0.8B en el que un LLM de frontera ("Astra") editó directamente los pesos del modelo base para mejorar su rendimiento en matemáticas, sin descenso de gradiente ni entrenamiento adicional. La intervención se enmarca en el experimento 8 del trabajo "Sparks of Weight-Space Programming" y consiste en identificar una dirección responsable de los bucles de razonamiento del modelo base y restarla de 64 columnas de salida de `down_proj` en las capas 15 y 19 del MLP, afectando a 131.072 pesos (0,016 % del total).

El modelo conserva la arquitectura multimodal image-text-to-text del base, con 873.438.784 parámetros totales y pesos en safetensors (repo de 1,8 GB). Su relevancia es doble: por un lado, demuestra una mejora sustancial en MATH-500 (de 7,9 % a 48,1 % según el autor, 51,0 % en la re-ejecución independiente) y GSM8K (de 13,8 % a 67,1 %); por otro, es una prueba de concepto reproducible de edición de pesos guiada por un LLM, con el diff publicado y verificado por hash.

La ficha se basa en la model card y en los materiales de procedencia enlazados; los datos no documentados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; edición puntual de pesos en capas 15 y 19 del MLP (`down_proj`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 34.816 tokens en la configuración de ejemplo (`max_model_len=34816`); ventana nativa del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; compatible con vLLM) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-0.8B (commit `2fc06364715b967f1860aea9cf38778875588b17`), un transformer multimodal con torre de visión y modelo de lenguaje. No hay entrenamiento: la modificación es una edición de pesos en espacio de pesos ("weight-space programming"). Un LLM de frontera, operando en una sesión de Python sobre los tensores y con un presupuesto de 50 forward passes sobre problemas de práctica de GSM8K y MATH, localizó una dirección asociada a los bucles de pensamiento del modelo base y la restó de 64 columnas de salida de `down_proj` en las capas 15 y 19, sumando 131.072 pesos modificados (0,016 % del modelo).

Solo dos tensores difieren del base: `model.language_model.layers.15.mlp.down_proj.weight` y `model.language_model.layers.19.mlp.down_proj.weight`, con hashes sha256 publicados y verificados en la reconstrucción mediante `exp8_math/code/apply_edit.py`. El checkpoint es la release multimodal completa; la evaluación del post se hizo sobre una exportación solo-texto, pero los tensores del modelo de lenguaje son idénticos (verificado por hash) y los prompts de texto no usan la torre de visión. El modelo base soporta modo "thinking" (razonamiento explícito), que se activa en la configuración de evaluación.

## Capacidades
- Generación de texto y razonamiento paso a paso con modo thinking activable (`enable_thinking=True`).
- Razonamiento matemático: resolución de problemas de GSM8K y MATH con respuesta final en `\boxed{}`; el cambio principal es la reducción de bucles hasta el límite de tokens.
- Entrada multimodal image-text-to-text heredada del base (torre de visión presente en el checkpoint).
- Conversacional con plantilla de chat (`apply_chat_template`).
- Compatible con endpoints y despliegue en vLLM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso
- Evaluación de técnicas de edición de pesos: usar este checkpoint como referencia reproducible para estudiar cómo una intervención del 0,016 % de los pesos altera el comportamiento de razonamiento; el diff bit-exacto y los scripts de reconstrucción permiten replicar el experimento.
- Investigación sobre bucles de decodificación: analizar la reducción de generaciones que alcanzan el límite de tokens (de 93,0 % a 33,1 % según el autor; 31,6 % en la re-ejecución) para estudiar patologías de modelos pequeños en modo thinking.
- Tutoría matemática de bajo coste: un modelo de 0,87 B parámetros que resuelve una fracción relevante de problemas GSM8K/MATH puede desplegarse en hardware modesto para asistencia paso a paso, aceptando la tasa de fallo restante.
- Benchmarking de pipelines de evaluación: el repo incluye `eval/` con resultados por problema y generaciones de muestra, útil para validar arneses con math-verify 0.9.0 y protocolos de muestreo concretos (temperatura 0,6, top_p 0,95, top_k 20, presence_penalty 1,5).
- Demostración educativa: el Space `akhaliq/weight-space-programming-demo` compara en vivo el base (que entra en bucle) con el editado, adecuado para material docente sobre comportamiento de LLM.
- Prototipado de asistentes con entrada de imagen y texto en entornos con poca VRAM, aprovechando el tamaño reducido y el contexto de 34.816 tokens configurado en el ejemplo de vLLM.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking on, hasta 32.768 tokens, varias muestras por problema):

| Modelo | MATH-500 (%) | GSM8K (%) | IFEval (%) | Limite de tokens alcanzado (%) |
|---|---|---|---|---|
| Qwen3.5-0.8B base | 7,9 | 13,8 | 21,0 | 93,0 |
| Editado (este modelo) | 48,1 | 67,1 | 62,3 | 33,1 |

Re-ejecución independiente del checkpoint (MATH-500 completo, 500 problemas × 4 muestras = 2.000 generaciones, 43,4 M tokens generados, 51 min en H200, vLLM, temperatura 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, máximo 32.768 tokens nuevos, seed 0, grading con math-verify 0.9.0):

| Modelo | MATH-500 (%) | Limite de tokens alcanzado (%) |
|---|---|---|
| Editado (re-ejecución) | 51,0 | 31,6 |
| Base (smoke test de 25 problemas) | 5,0 | 95,0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 1,75 GB solo para pesos (873 M parámetros), más caché KV y overhead del runtime; el repo ocupa 1,8 GB.
- En cuantización de 8 bits o 4 bits cabría holgadamente en GPUs consumer, aunque no se documentan cuantizaciones publicadas para este checkpoint.
- GPU recomendadas: el autor valida en NVIDIA H200 con vLLM 0.33.0; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) debería alojar los pesos en bf16, si bien no se aportan mediciones en esas GPUs.
- Despliegue: vLLM es la opción documentada (`LLM(model=ckpt, dtype="bfloat16", max_model_len=34816)`); compatible con transformers 5.20.2. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: la re-ejecución generó 43,4 M tokens en 51 minutos en una H200 (aproximadamente 14.200 tokens/s agregados con n=4 y contexto largo); no hay cifras para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (editado) | 873 M | 34.816 (config. de ejemplo) | 48,1 / 51,0 (re-run) | 67,1 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | 7,9 / 5,0 (smoke test) | 13,8 | Apache 2.0 | Hugging Face |
| Otras alternativas de ~1 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparaciones con otros modelos de tamaño similar; la única comparación documentada es contra su modelo base.

## Limitaciones y advertencias
- La mejora está especializada en matemáticas (GSM8K, MATH) y en reducir bucles; no hay evidencia de mejoras en otras tareas y podría haber degradación no medida en capacidades ajenas al dominio evaluado.
- Tasa de fallo aún elevada: en la re-ejecución, el 31,6 % de las respuestas alcanzan el límite de 32.768 tokens, y la precisión en MATH-500 es del 51,0 %, insuficiente para uso en producción de alta fiabilidad.
- Riesgo de alucinación inherente a un modelo de 0,87 B; la edición no incorpora alineación adicional ni RLHF.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Idiomas soportados no documentados; el protocolo de evaluación es en inglés.
- La evaluación del post usó una exportación solo-texto; este checkpoint es multimodal, aunque los tensores del modelo de lenguaje están verificados por hash como idénticos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado; conviene validar antes de desplegar.
- Solo dos tensores difieren del base, lo que hace el cambio auditable, pero también significa que cualquier comportamiento extraño puede rastrearse a esa intervención concreta en las capas 15 y 19.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs y código de reconstrucción: https://github.com/RikiyaT/lm_understand-logs
- Demo interactiva: https://huggingface.co/spaces/akhaliq/weight-space-programming-demo
- Resultados de evaluación del repo: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming/tree/main/eval
- ML Intern: https://hf.co/chat?mode=ml-intern
- Dataset de evaluación MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
