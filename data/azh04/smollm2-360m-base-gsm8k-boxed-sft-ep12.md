# AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep12

## Resumen

El modelo **AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep12** es un fine-tuning supervisado (SFT) del modelo base **HuggingFaceTB/SmolLM2-360M** (un modelo de lenguaje pequeño de 360 millones de parámetros) sobre el conjunto de datos GSM8K, siguiendo la receta "boxed". El autor, AZH04, lo ha entrenado durante 12 épocas (paso global 360) con 978 trazas de demostración verificadas, generadas por un profesor Qwen2.5-3B-Instruct. El objetivo es proporcionar un checkpoint intermedio en una escalera de presupuestos de demostración para comparar estrategias de entrenamiento secuencial (SFT seguido de RL) frente a híbridas (demostraciones durante RL) con un presupuesto idéntico.

Este modelo está pensado como inicialización para entrenamiento por refuerzo (RL) en tareas de razonamiento matemático, no como un modelo de propósito general. Su relevancia radica en que permite estudiar el efecto del número de épocas y del presupuesto de demostraciones en el rendimiento final, dentro de una campaña de investigación sobre métodos de entrenamiento unificado. Al ser un modelo pequeño (361,8 M parámetros), es adecuado para experimentos en hardware limitado.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el modelo es experimental y está especializado exclusivamente en problemas de GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SmolLM2-360M) |
| Parametros totales | 361.821.120 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base SmolLM2-360M, un transformer decoder-only de 360 millones de parámetros. El fine-tuning se realizó con SFT de modelo completo (sin LoRA) en precisión bf16, usando un solo GPU con FSDP world size 1. El corpus de entrenamiento consta de 978 trazas de razonamiento para GSM8K, seleccionadas mediante el criterio "shortest-correct-fitting-budget" y verificadas con un grader que exige exactitud 1.0. El prompt utilizado es el estándar de verl, en formato zero-shot: `{question} Let's think step by step and output the final answer within \boxed{}.` Los targets incluyen el token EOS para que el modelo aprenda a terminar la generación.

El entrenamiento se ejecutó con una tasa de aprendizaje de 1e-5, batch de 32 y un scheduler de coseno con decaimiento a lo largo de las 12 épocas. Cada escalón de la escalera (6, 9, 12, 16, 24, 32, 49 épocas) se entrenó como una ejecución separada, no como checkpoints intermedios de una misma ejecución, para que el scheduler de LR sea consistente con el número de épocas. Este checkpoint concreto corresponde a 11.736 presentaciones de demostración (12 épocas × 978 trazas).

## Capacidades

- Generación de texto con razonamiento paso a paso para problemas aritméticos de nivel escolar.
- Salida de la respuesta final dentro de `\boxed{...}`, formato que permite evaluación automática con un grader estricto.
- Especializado en el conjunto GSM8K; no se han documentado capacidades fuera de este dominio.
- No soporta tool calling, ni visión, ni audio.
- No se han reportado capacidades multilingües; el entrenamiento se realizó con datos en inglés (GSM8K).
- El modelo no es instruct, pero responde al prompt de razonamiento paso a paso gracias al SFT.

## Casos de uso

- **Inicialización para entrenamiento por refuerzo (RL)**: el modelo está diseñado como punto de partida para experimentos de RL en razonamiento matemático, donde se puede aplicar un algoritmo como PPO o GRPO sobre el checkpoint SFT.
- **Comparación de presupuestos de demostración**: permite estudiar cómo el número de épocas de SFT afecta al rendimiento final cuando se combina con RL, frente a estrategias híbridas que inyectan demostraciones durante el RL.
- **Generación de soluciones paso a paso**: puede producir cadenas de razonamiento para problemas de GSM8K, útiles para análisis cualitativo o para generar datos sintéticos.
- **Investigación en escalado de épocas**: al ser parte de una escalera de checkpoints, sirve para trazar curvas de rendimiento (pass@1 y pass@64) en función del presupuesto de demostraciones.
- **Prototipado de sistemas de razonamiento con modelos pequeños**: su tamaño reducido permite ejecutarlo en entornos con recursos limitados, ideal para pruebas de concepto.
- **Evaluación de técnicas de verificación**: el formato `\boxed{}` facilita probar distintos graders y métricas de exactitud en respuestas matemáticas.
- **Benchmarking de métodos de fine-tuning**: puede usarse como referencia para comparar SFT puro frente a otros enfoques de entrenamiento en modelos pequeños.

## Benchmarks y rendimiento

El autor reporta resultados con el protocolo de referencia: n=128 muestras, temperatura 0.6, top_p 0.95, máximo 1024 tokens nuevos, sobre el split de test completo de GSM8K (1.236 preguntas), usando un grader estricto que lee el último `\boxed{...}`. Los valores para los escalones de 6, 9 y 12 épocas son:

| Epocas | pass@1 | pass@64 |
|---|---|---|
| 6 | 0.0683 | 0.6693 |
| 9 | 0.0718 | 0.6934 |
| 12 (este modelo) | 0.0756 | 0.6990 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,72 GB en bf16 (361 M parámetros × 2 bytes), más overhead de activaciones; en fp32 serían ~1,4 GB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, por ejemplo GTX 1050 Ti, RTX 3060, RTX 4090, o incluso CPU con suficiente RAM.
- Cabe en GPUs de consumo estándar sin problema.
- Opciones de despliegue: compatible con frameworks estándar como vLLM, llama.cpp, Ollama o TGI, al ser un transformer convencional con pesos en safetensors.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una generación rápida en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (fine-tunes de GSM8K sobre SmolLM2). El propio autor ha publicado otro checkpoint similar (`AZH04/SmolLM2-360M-instruct-gsm8k-boxed-sft`), pero no se aportan métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo muy especializado en GSM8K; su rendimiento fuera de este dominio no ha sido evaluado y probablemente sea deficiente.
- Riesgo de alucinación en respuestas, especialmente en problemas no vistos o con formato diferente.
- No se han documentado sesgos específicos, pero al entrenarse con datos generados por un profesor (Qwen2.5-3B-Instruct), puede heredar sesgos de ese modelo.
- No se especifican idiomas soportados; el entrenamiento se realizó con datos en inglés, por lo que no se recomienda su uso en otros idiomas.
- El modelo es un checkpoint intermedio para investigación; no está pensado para producción directa sin una evaluación adicional.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento o la seguridad del modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep12)
- [Checkpoint similar con instruct](https://huggingface.co/AZH04/SmolLM2-360M-instruct-gsm8k-boxed-sft)
- [Paper de SmolLM2 (arXiv)](https://arxiv.org/html/2502.02737v1)
- [Leaderboard GSM8K (BenchLM)](https://benchlm.ai/benchmarks/gsm8k)
