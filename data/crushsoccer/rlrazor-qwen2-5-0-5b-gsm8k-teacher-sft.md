# crushsoccer/rlrazor-qwen2.5-0.5b-gsm8k-teacher-sft

## Resumen

`crushsoccer/rlrazor-qwen2.5-0.5b-gsm8k-teacher-sft` es un checkpoint de investigación publicado por Andrew Qiu (usuario `crushsoccer` en Hugging Face) que consiste en un ajuste fino supervisado (SFT) de Qwen2.5-0.5B-Instruct sobre el conjunto de datos GSM8K. El modelo forma parte de una reproducción a pequeña escala del artículo *RL's Razor: Why Online Reinforcement Learning Forgets Less* (Shenfeld, Pari y Agrawal, 2025; arXiv 2509.04259), cuyo objetivo es estudiar el olvido catastrófico durante el ajuste fino.

La receta concreta es SFT con destilación de profesor: para cada prompt de entrenamiento de GSM8K se muestreó hasta 16 veces Qwen2.5-7B-Instruct y se conservó una respuesta correcta (98,1 % de los prompts tuvieron al menos una). El resultado es un modelo de 494 millones de parámetros (full fine-tune, sin LoRA) en bfloat16 que mejora ligeramente la precisión en GSM8K respecto a la base (51,5 % frente a 48,1 %) con un olvido medio muy bajo en seis benchmarks previos (−0,3 pp).

Su relevancia es metodológica más que práctica: sirve como referencia reproducible para estudiar cómo distintas estrategias de ajuste (SFT con profesor, GRPO, etc.) afectan al olvido de capacidades previas en modelos pequeños. No está pensado para uso general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune completo del base |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con 494 millones de parámetros. El ajuste es un full fine-tune (no LoRA) con pesos finales en bfloat16. El entrenamiento consistió en SFT sobre respuestas de profesor: para cada uno de los 7.473 prompts de entrenamiento de GSM8K se muestreó hasta 16 veces Qwen2.5-7B-Instruct y se retuvo una respuesta correcta (98,1 % de prompts cubiertos). La respuesta final se formatea dentro de `\boxed{}` y se entrena con entropía cruzada únicamente sobre los tokens de respuesta.

Hiperparámetros: AdamW, learning rate constante de 3e-6 con 50 pasos de warmup, batch de 32, max grad norm 1, sin weight decay, 2 épocas. El checkpoint publicado corresponde al paso 459 (final de la época 2) de la semilla 0. El artículo original usaba learning rates más altos que divergían con GRPO a 0,5B, por lo que en esta reproducción se optó por tasas más bajas. No se aplicó RLHF ni DPO; es SFT puro con destilación de profesor.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-0.5B-Instruct y del chat template de Qwen.
- Razonamiento aritmético de varios pasos orientado a problemas tipo GSM8K, con formato de respuesta final en `\boxed{}` cuando se usa el system prompt de entrenamiento.
- Seguimiento del system prompt específico: *"Please reason step by step, and put your final answer within \boxed{}."*
- Soporte de conversaciones multi-turno mediante `apply_chat_template` de transformers.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información proporcionada.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.

## Casos de uso

- Reproducción de experimentos sobre olvido catastrófico: sirve como checkpoint de referencia (SFT con profesor, LR 3e-6, semilla 0) para comparar contra variantes GRPO u otras estrategias del artículo RL's Razor en el mismo entorno de 0,5B.
- Evaluación de pipelines de lm-eval sobre vLLM: el autor documenta la evaluación con lm-eval sobre vLLM en seis benchmarks (HellaSwag, TruthfulQA, MMLU, IFEval, Winogrande, HumanEval), por lo que el modelo encaja como sujeto de pruebas en dichos pipelines.
- Estudio de destilación de profesor a alumno en modelos pequeños: permite analizar cuánto de la capacidad de Qwen2.5-7B-Instruct en GSM8K se transfiere a un alumno de 0,5B mediante muestreo y filtrado por corrección.
- Docencia e investigación en ajuste fino: al ser un full fine-tune reproducible con hiperparámetros explícitos, es útil como ejemplo práctico de SFT con formato `\boxed{}` y chat template de Qwen.
- Pruebas de formato y plantillas de chat: útil para validar que un pipeline de inferencia respeta el system prompt y el formato de respuesta esperado en tareas matemáticas.
- Baseline en experimentos de cuantización o despliegue ligero: con ~1 GB de pesos en bfloat16, sirve para probar infraestructura de inferencia en entornos con recursos limitados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos publicados por el autor para este checkpoint (1 semilla, paso 459, final de época 2). La precisión GSM8K se mide sobre el conjunto de test de 1.319 prompts. Los cambios se expresan en puntos porcentuales respecto al modelo base (negativo = olvido). El modelo base obtiene 48,1 % en GSM8K y 26,4 % en IFEval.

| Metrica | Valor |
|---|---|
| GSM8K accuracy | 51,5 % |
| Cambio medio en 6 benchmarks (olvido) | −0,3 pp |
| Cambio en IFEval | −4,4 pp |

El autor indica además que los errores estándar por muestreo de ítems son de 1,9 a 3,7 pp por benchmark, por lo que cambios de pocos puntos en un único benchmark están dentro del ruido para una sola semilla. Como referencia, las medias de 3 semillas del mismo setting en el write-up son: GSM8K 51,2 ± 0,4 %, cambio medio −0,05 ± 0,19 pp, cambio IFEval −3,5 ± 1,2 pp.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (494 M de parámetros), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs consumer de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM efectiva; RTX 3060, RTX 4060, RTX 4090, A100, H100 funcionan sin problema. Para evaluación a escala con lm-eval sobre vLLM se recomienda una GPU con suficiente memoria para el batch configurado.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (incluidas integradas con suficiente memoria compartida, aunque con latencia mayor).
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), vLLM (usado por el autor para lm-eval) y endpoints compatibles. No se documentan pesos GGUF, por lo que llama.cpp/Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| rlrazor-qwen2.5-0.5b-gsm8k-teacher-sft | 494 M | no disponible | 51,5 % | apache-2.0 | SFT con profesor, 1 semilla |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible | 48,1 % | apache-2.0 | Modelo base sin ajuste en GSM8K |
| Qwen/Qwen2.5-7B-Instruct (profesor) | 7,6 B (aprox.) | no disponible | no disponible | apache-2.0 | Fuente de las respuestas de entrenamiento |

La comparación con el profesor en GSM8K no se incluye porque la información proporcionada no reporta su precisión en ese benchmark. No se dispone de datos de otros modelos de 0,5B ajustados específicamente en GSM8K dentro de la información disponible.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor advierte que es un estudio pequeño (un modelo de 0,5B, una tarea, learning rates bajos) y que no está ajustado para uso general.
- Resultados de una sola semilla: los números publicados corresponden a la semilla 0; los cambios de pocos puntos en benchmarks individuales están dentro del ruido (errores estándar de 1,9 a 3,7 pp).
- Olvido medible en IFEval (−4,4 pp en este checkpoint; −3,5 ± 1,2 pp en la media de 3 semillas), lo que sugiere cierta pérdida de capacidad de seguimiento de instrucciones.
- Riesgo de alucinación inherente a un modelo de 0,5B: la mejora en GSM8K es modesta (51,5 %), por lo que aproximadamente la mitad de los problemas del test se resuelven incorrectamente.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado ni garantizado.
- Dependencia del formato: el modelo espera el system prompt específico de entrenamiento y el formato `\boxed{}`; fuera de ese formato el comportamiento puede degradarse.
- Licencia Apache-2.0, igual que el modelo base, lo que permite uso comercial, pero sin garantías de idoneidad para producción.
- No se documentan variantes cuantizadas ni pesos GGUF; el despliegue en llama.cpp/Ollama requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crushsoccer/rlrazor-qwen2.5-0.5b-gsm8k-teacher-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Artículo RL's Razor: https://arxiv.org/abs/2509.04259
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
