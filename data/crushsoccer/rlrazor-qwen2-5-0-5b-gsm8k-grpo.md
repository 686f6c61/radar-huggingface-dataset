# crushsoccer/rlrazor-qwen2.5-0.5b-gsm8k-grpo

## Resumen

rlrazor-qwen2.5-0.5b-gsm8k-grpo es un checkpoint de investigación publicado por el usuario crushsoccer (Andrew Qiu) que reproduce a pequeña escala el estudio *RL's Razor: Why Online Reinforcement Learning Forgets Less* (Shenfeld, Pari y Agrawal, 2025). El modelo parte de Qwen2.5-0.5B-Instruct, un transformer denso de 494 millones de parámetros, y se ajusta mediante GRPO con la pérdida Dr. GRPO sobre el conjunto de entrenamiento de GSM8K (7.473 problemas de matemáticas de primaria).

El objetivo del trabajo no es producir un modelo de propósito general, sino medir el olvido catastrófico (forgetting) que provoca el aprendizaje por refuerzo en línea frente a otros métodos de ajuste. Para ello se evalúa la precisión en GSM8K y el cambio de rendimiento en seis benchmarks de tareas previas (HellaSwag, TruthfulQA, MMLU, IFEval, Winogrande y HumanEval). El checkpoint final (paso 234, semilla 0) alcanza un 53,8 % en GSM8K, frente al 48,1 % del modelo base, con un cambio medio de solo 0,4 puntos porcentuales en los seis benchmarks de olvido.

Es relevante ahora porque aporta evidencia empírica reproducible sobre una cuestión abierta en el ajuste por refuerzo: si el RL en línea olvida menos que el ajuste supervisado y por qué. Su tamaño reducido (aproximadamente 1 GB en safetensors bfloat16) permite replicar el experimento en hardware de consumo, lo que lo convierte en una pieza útil para investigación metodológica más que para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; no especificada en la información proporcionada) |
| Tipos de cuantización | pesos publicados en bfloat16; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 494 millones de parámetros, inicializado desde Qwen2.5-0.5B-Instruct. El ajuste es un fine-tune completo (sin LoRA) sobre los 7.473 prompts de entrenamiento de GSM8K, con la respuesta final encapsulada en `\boxed{}`. El algoritmo es GRPO con la pérdida Dr. GRPO, que elimina la normalización por longitud y el escalado de la ventaja por la desviación estándar del grupo, con recompensa binaria de corrección sobre la respuesta y sin penalización KL (β = 0).

La receta usa una tasa de aprendizaje constante de 1e-6 con 50 pasos de warmup (las tasas del paper divergían a 0.5B, por lo que se redujeron), 1 época equivalente a 234 pasos de 32 prompts × 8 completaciones, un paso de gradiente por lote y rollouts a temperatura 1 con 512 tokens nuevos. El checkpoint publicado es el final (paso 234) de la semilla 0. La innovación metodológica no está en la arquitectura sino en el protocolo de evaluación del olvido: seis benchmarks previos medidos con lm-eval sobre vLLM, con submuestreo a 500 ítems en HellaSwag, TruthfulQA y Winogrande, y 570 en MMLU.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-0.5B-Instruct.
- Razonamiento matemático de varios pasos sobre problemas tipo GSM8K, con formato de respuesta final en `\boxed{}`.
- Razonamiento paso a paso inducido por el system prompt de entrenamiento ("Please reason step by step...").
- Seguimiento de instrucciones básico (evaluado vía IFEval en el estudio de olvido).
- Soporte de plantilla de chat de Qwen (`apply_chat_template`) con turnos de sistema y usuario.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Reproducción de experimentos de olvido catastrófico: sirve como checkpoint de referencia para comparar GRPO frente a otros métodos de ajuste (SFT, DPO) sobre el mismo modelo base y la misma tarea, midiendo el cambio en los seis benchmarks del estudio.
- Investigación en ajuste por refuerzo: permite estudiar el efecto de la pérdida Dr. GRPO, la ausencia de penalización KL y tasas de aprendizaje bajas en modelos pequeños, con un coste de cómputo accesible en una sola GPU.
- Evaluación de razonamiento matemático a pequeña escala: útil como línea base de 0.5B en GSM8K para calibrar pipelines de evaluación (lm-eval sobre vLLM) antes de escalar a modelos mayores.
- Docencia y formación: su tamaño (aproximadamente 1 GB) y su receta documentada permiten ilustrar un ciclo completo de RLHF/RLVR en un curso o taller sin infraestructura dedicada.
- Pruebas de formato estructurado: el patrón `\boxed{}` lo hace adecuado para validar extractores de respuesta y parsers en pipelines de evaluación automática.
- Experimentos de sensibilidad a semillas: al publicarse la receta exacta (semilla 0, 234 pasos), se puede replicar y comparar la varianza entre semillas frente a las medias de 3 semillas del estudio (GSM8K 55,1 ± 1,4 %).

## Benchmarks y rendimiento

Resultados del checkpoint final (paso 234, semilla 0), según la model card:

| Métrica | Valor |
|---|---|
| GSM8K accuracy (test de 1.319 prompts) | 53,8 % |
| Cambio medio en los 6 benchmarks de olvido | 0,4 pp |
| Cambio en IFEval | 1,8 pp |
| GSM8K del modelo base | 48,1 % |
| IFEval del modelo base | 26,4 % |

Para contexto, la model card cita las medias de 3 semillas del estudio para esta configuración: GSM8K 55,1 ± 1,4 %, cambio medio 0,25 ± 0,16 pp e IFEval +1,4 ± 0,5 pp. Los errores estándar por muestreo de ítems son de 1,9 a 3,7 pp por benchmark, por lo que cambios de pocos puntos en un solo benchmark están dentro del ruido para una semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16/fp16 para los pesos; en la práctica, 2-3 GB con caché KV y overhead del runtime para contextos moderados.
- Cuantización a 8 bits: aproximadamente 0,5 GB de pesos; a 4 bits: aproximadamente 0,25 GB, aunque no se publican GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de 8 GB o menos e incluso en CPU para inferencia por lotes pequeños.
- Despliegue: transformers (receta oficial de la model card), vLLM (usado en la evaluación del estudio), TGI (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlrazor-qwen2.5-0.5b-gsm8k-grpo | 494 M | no disponible | 53,8 % (1 semilla) | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible | 48,1 % | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5 B (aprox.) | no disponible | no disponible en la información proporcionada | Apache-2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360 M (aprox.) | no disponible | no disponible en la información proporcionada | Apache-2.0 | Hugging Face |

La comparación directa más significativa es con su modelo base, del que mejora 5,7 puntos en GSM8K a costa de un cambio medio de 0,4 pp en los benchmarks de olvido. Los datos de los modelos alternativos no están en la información proporcionada y no se han verificado aquí.

## Limitaciones y advertencias

- Checkpoint de investigación: un solo modelo de 0.5B, una sola tarea (GSM8K), tasas de aprendizaje bajas y una única semilla; no está ajustado para uso general.
- Los resultados de una semilla tienen ruido considerable: los errores estándar por muestreo de ítems son de 1,9 a 3,7 pp por benchmark.
- Riesgo de alucinación y errores aritméticos propio de un modelo de 0.5B; la precisión en GSM8K es del 53,8 %, lejos de modelos mayores.
- Soporte únicamente de inglés según la model card; no se documentan capacidades multilingües.
- El formato de respuesta esperado es `\boxed{}` con el system prompt de entrenamiento; fuera de ese formato el rendimiento puede degradarse.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial, aunque su valor práctico en producción es limitado.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni datos de latencia o throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crushsoccer/rlrazor-qwen2.5-0.5b-gsm8k-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper RL's Razor: https://arxiv.org/abs/2509.04259
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
