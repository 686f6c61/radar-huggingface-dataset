# Abuudiii/grpo-Qwen2.5-1.5B-hh-rlhf-combined

## Resumen

`grpo-Qwen2.5-1.5B-hh-rlhf-combined` es un ajuste fino del modelo instructivo Qwen2.5-1.5B-Instruct mediante GRPO (Group Relative Policy Optimization) frente a un reward model entrenado con ambas mitades del dataset Anthropic HH-RLHF: la de ayuda (helpful) y la de inocuidad (harmless). Lo desarrolla el usuario Abuudiii como parte de un experimento de investigación reproducible en el que se publican tres variantes del mismo entrenamiento, cambiando únicamente la función de recompensa: solo helpful, solo harmless y la combinación de ambas (esta ficha).

El modelo resuelve un problema acotado y bien definido: explorar cómo se comporta un modelo pequeño (1.500 millones de parámetros) cuando se le aplica RLHF con recompensas en tensión, es decir, cuando se premia a la vez ser útil y rechazar peticiones dañinas. El resultado es un compromiso explícito: mejora la puntuación del reward model en ambos ejes respecto al modelo original, rechaza el 94 % de las peticiones de red-team, pero sobre-rechaza aproximadamente un tercio de las preguntas ordinarias.

Es relevante ahora por su valor metodológico, no por su rendimiento absoluto: documenta con detalle el pipeline (reward model, hiperparámetros de GRPO, hardware, métricas) y publica el código y las figuras en un repositorio de GitHub, lo que lo convierte en un caso de estudio útil para quien quiera reproducir RLHF a pequeña escala. La arquitectura es la del Qwen2 original (transformer decoder-only denso), con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, segun la familia Qwen2.5) |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio; los pesos se distribuyen en bf16. Compatible con cuantizacion posterior via bitsandbytes, GPTQ o GGUF, aunque no hay artefactos oficiales |
| Idiomas soportados | Ingles (declarado en la model card; el modelo base es multilingue, pero el ajuste se ha realizado solo con datos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El ajuste no modifica la arquitectura; solo actualiza los pesos mediante RL. El entrenamiento consta de dos fases. Primero se entrena un reward model: el propio Qwen2.5-1.5B-Instruct con una cabeza escalar, durante una época sobre los pares chosen/rejected de HH-RLHF, con pérdida pairwise, learning rate 5e-6, 64 pares por paso y hasta 1024 tokens. La precisión en pares retenidos es del 74,3 % para helpful y del 73,7 % para harmless.

Después se aplica GRPO con TRL 1.17.1: 16 prompts por paso, 8 respuestas muestreadas por prompt con vLLM, ventaja calculada como la recompensa menos la media del grupo, penalización KL β = 0,04 respecto al modelo original congelado, learning rate 1e-6, respuestas de hasta 256 tokens y 1000 pasos. Los prompts son 8.000 ejemplos de HH-RLHF (4.000 por subconjunto), de hasta 512 tokens cada uno. En esta variante combinada la recompensa es la suma de las puntuaciones de los dos reward models (helpful y harmless). El entrenamiento se hizo en fp32 con autocast bf16 sobre GPUs NVIDIA H100 de 80 GB (8 GPUs para esta variante) y los pesos se publican en bf16.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a preguntas ordinarias, con calidad limitada por el tamaño de 1.500 millones de parámetros.
- Modo de rechazo entrenado: identifica y declina peticiones dañinas en el 94 % de los casos de red-team evaluados.
- Capacidad multilingüe residual del modelo base, aunque el ajuste RL se ha hecho exclusivamente con datos en inglés.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico en la model card; cualquier capacidad de este tipo provendría del modelo base y no ha sido evaluada tras el ajuste.
- No dispone de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en RLHF y alineamiento: sirve como referencia reproducible para estudiar la tensión entre utilidad e inocuidad en modelos pequeños, con código, hiperparámetros y métricas publicados.
- Experimentos educativos sobre GRPO: permite comparar directamente las tres variantes (helpful, harmless, combined) con el mismo pipeline y aislar el efecto de la función de recompensa.
- Evaluación de reward models: el par de reward models entrenados sobre HH-RLHF puede reutilizarse para puntuar salidas de otros modelos pequeños en tareas de moderación.
- Prototipado de filtros de seguridad: el comportamiento de rechazo al 94 % en red-team lo hace útil como capa de prueba en pipelines de moderación, siempre con validación humana.
- Estudio de sobre-rechazo: el 32 % de rechazos en preguntas ordinarias lo convierte en un caso práctico para medir y mitigar falsos positivos en sistemas de seguridad.
- Docencia y demostraciones de ajuste fino con TRL: el código del repositorio permite reproducir el entrenamiento completo en un entorno con GPUs de gama alta.
- No se recomienda como asistente en producción: su propósito es experimental y la propia model card lo advierte.

## Benchmarks y rendimiento

La model card publica una evaluación propia sobre 400 prompts retenidos (200 preguntas ordinarias de `helpful-base` y 200 conversaciones de red-team de `harmless-base`), con decodificación greedy. Las puntuaciones son la salida media de los reward models y la tasa de rechazo se calcula con una heurística de palabras clave.

| Modelo | Ordinarias: score helpful | Ordinarias: rechazadas | Red-team: score harmless | Red-team: rechazadas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct original | −0,63 | 7 % | 1,59 | 62,5 % |
| Solo helpful | **0,05** | 5,5 % | 0,01 | 56 % |
| Solo harmless (checkpoint 500) | −7,26 | **100 %** | **4,42** | 100 % |
| Helpful + harmless (este modelo) | −0,18 | 32 % | 2,18 | **94 %** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-5 GB con contexto moderado.
- En cuantización de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4). Para entrenamiento o evaluación a gran escala, A100 o H100; el entrenamiento original usó 8 H100 de 80 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM, TGI (la model card incluye el tag `text-generation-inference`), llama.cpp u Ollama previa conversión a GGUF, ya que no se publican artefactos GGUF oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-Qwen2.5-1.5B-hh-rlhf-combined | 1,54 B | No disponible | GRPO con recompensa helpful + harmless | Apache 2.0 | Hugging Face, 0 descargas |
| grpo-Qwen2.5-1.5B-hh-rlhf-helpful | 1,54 B | No disponible | GRPO solo con recompensa helpful | Apache 2.0 | Hugging Face |
| grpo-Qwen2.5-1.5B-hh-rlhf-harmless | 1,54 B | No disponible | GRPO solo con recompensa harmless | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (familia Qwen2.5) | SFT + preferencias del modelo base | Apache 2.0 | Hugging Face, ampliamente utilizado |

## Limitaciones y advertencias

- La propia model card advierte que es un modelo de investigación pequeño y no un asistente seguro: sigue aceptando algunas peticiones dañinas.
- Sobre-rechazo elevado: rechaza aproximadamente el 32 % de las preguntas ordinarias, lo que lo hace poco adecuado como asistente general.
- Las métricas provienen de los mismos reward models usados en el entrenamiento; no hay juez independiente ni evaluación humana.
- La tasa de rechazo se calcula con una heurística de palabras clave ("I'm sorry", "I can't", etc.), no con juicio humano, por lo que puede infravalorar o sobrevalorar el comportamiento real.
- Entrenado durante 1000 pasos sobre datos de preferencias de 2022 (HH-RLHF): cabe esperar errores factuales e inconsistencia en las respuestas.
- El ajuste se ha realizado solo en inglés; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no está validado para producción.
- Sin cuantizaciones oficiales publicadas; cualquier GGUF o GPTQ disponible sería de terceros y sin validación del autor.
- Riesgo de alucinación inherente a un modelo de 1,5 B parámetros, agravado por el ajuste RL sobre un dataset acotado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abuudiii/grpo-Qwen2.5-1.5B-hh-rlhf-combined
- Variante solo helpful: https://huggingface.co/Abuudiii/grpo-Qwen2.5-1.5B-hh-rlhf-helpful
- Variante solo harmless: https://huggingface.co/Abuudiii/grpo-Qwen2.5-1.5B-hh-rlhf-harmless
- Código, figuras y resultados: https://github.com/Abuudiii/rl-experiments/tree/main/grpo-rlhf-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Paper HH-RLHF (Bai et al., 2022): https://arxiv.org/abs/2204.05862
- Paper GRPO / DeepSeekMath (Shao et al., 2024): https://arxiv.org/abs/2402.03300
- TRL: https://github.com/huggingface/trl
