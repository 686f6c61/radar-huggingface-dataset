# AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep9

## Resumen

AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep9 es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM2-360M, especializado en el razonamiento matemático del conjunto de datos GSM8K. El autor, AZH04, lo ha entrenado sobre 978 trazas de demostración verificadas, generadas por un modelo profesor Qwen2.5-3B-Instruct, siguiendo la receta "boxed" que obliga a la respuesta final dentro de `\boxed{...}`. Este checkpoint concreto corresponde a 9 épocas de entrenamiento, lo que equivale a 8.802 presentaciones de demostración.

El modelo está diseñado como punto de partida para experimentos de aprendizaje por refuerzo (RL) dentro de una campaña de investigación que compara estrategias de entrenamiento híbrido (SFT y RL combinados) frente a secuencial. Su relevancia radica en que permite aislar el efecto del presupuesto de demostraciones en el rendimiento final, sirviendo como referencia calibrada para otros brazos del estudio. Con 361,8 millones de parámetros, es un modelo pequeño, ejecutable en hardware modesto, y su licencia Apache 2.0 facilita su uso en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2-360M, tag "llama") |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; el modelo base SmolLM2-360M soporta 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M, un transformer decoder-only de 361 millones de parámetros entrenado por Hugging Face sobre 4 billones de tokens. Este fine-tune no modifica la arquitectura, sino que ajusta todos los pesos (full-model SFT, sin LoRA) sobre un corpus de 978 trazas de GSM8K. Las trazas fueron generadas por Qwen2.5-3B-Instruct y seleccionadas mediante el criterio "shortest-correct-fitting-budget", verificándose que todas obtienen una puntuación de 1.0 bajo el grader de entrenamiento.

El entrenamiento se realizó en bf16 con una sola GPU (FSDP world size 1), con una tasa de aprendizaje de 1e-5, batch de 32 y decaimiento coseno a lo largo de las 9 épocas. El prompt utilizado es el estándar de verl en zero-shot: `{question} Let's think step by step and output the final answer within \boxed{}.` Los objetivos terminan con el token EOS para que el modelo aprenda a finalizar la generación. Este checkpoint es una de las "escaleras" de épocas (6, 9, 12, 16, 24, 32, 49) diseñadas para igualar los presupuestos de demostración de los brazos híbridos de la campaña unified-training.

## Capacidades

- Generación de soluciones paso a paso para problemas aritméticos y de razonamiento matemático del estilo GSM8K.
- Producción de respuestas finales en formato `\boxed{...}`, lo que facilita la extracción automática y la evaluación con graders estrictos.
- Razonamiento encadenado (chain-of-thought) inducido por el prompt "Let's think step by step".
- Especialización en el dominio GSM8K; no se han documentado capacidades de tool calling, visión, audio ni agentes.
- Capacidad multilingüe limitada: el modelo base SmolLM2 está orientado al inglés, y el corpus de entrenamiento es exclusivamente en inglés.
- Adecuado como inicialización para experimentos de RL, dado que su entrenamiento SFT está calibrado para presupuestos de demostración específicos.

## Casos de uso

- Inicialización para aprendizaje por refuerzo en razonamiento matemático: el modelo está explícitamente diseñado como punto de partida para RL, permitiendo comparar estrategias secuenciales (SFT luego RL) con híbridas (demostraciones durante RL) bajo presupuestos idénticos.
- Evaluación de pipelines de SFT en modelos pequeños: su tamaño reducido y su entrenamiento controlado lo convierten en un banco de pruebas para medir el impacto del número de épocas y de la selección de datos en el rendimiento final.
- Generación de soluciones verificables para problemas GSM8K: puede producir respuestas con razonamiento explícito y respuesta final en `\boxed{}`, útil para sistemas de tutoría o generación de datos sintéticos con verificación automática.
- Benchmarking de técnicas de alineación: al existir checkpoints hermanos con 6, 12, 16, 24, 32 y 49 épocas, permite estudiar la relación entre presupuesto de demostraciones y calidad del modelo.
- Prototipado de agentes de razonamiento matemático en entornos con recursos limitados: con solo 361M parámetros, puede ejecutarse en CPU o GPU de baja gama, facilitando pruebas conceptuales antes de escalar a modelos mayores.
- Investigación sobre selección de datos de entrenamiento: el uso de trazas "shortest-correct-fitting-budget" permite analizar cómo la longitud y la calidad de las demostraciones afectan al aprendizaje.

## Benchmarks y rendimiento

El autor proporciona resultados para el protocolo de referencia de la campaña: n=128 muestras, temperatura 0.6, top_p 0.95, máximo 1024 tokens nuevos, sobre el split de test completo de GSM8K (1.236 preguntas), con un grader estricto que lee el último `\boxed{...}`. Los valores para este checkpoint (9 épocas) y sus vecinos son:

| Checkpoint | Épocas | pass@1 | pass@64 |
|---|---|---|---|
| 6 épocas | 6 | 0.0683 | 0.6693 |
| 9 épocas (este modelo) | 9 | 0.0718 | 0.6934 |
| 12 épocas | 12 | 0.0756 | 0.6990 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 361,8 millones de parámetros. En bf16, el peso ocupa aproximadamente 724 MB; el repositorio completo (1.4 GB) sugiere que los safetensors están en precisión fp32 o incluyen optimizadores.
- Para inferencia en bf16, se estima un consumo de VRAM inferior a 1 GB, por lo que cabe en cualquier GPU consumer moderna (por ejemplo, NVIDIA GTX 1060 6GB, RTX 3060, etc.) e incluso en CPU con suficiente RAM.
- No se especifican requisitos de hardware en la ficha del autor, pero dado el tamaño, es viable su ejecución en entornos sin GPU.
- Opciones de despliegue: al ser un modelo estándar de tipo Llama, puede servirse con vLLM, llama.cpp, Ollama o TGI, aunque no se mencionan explícitamente en la documentación.
- La latencia y el throughput no están documentados; en una GPU consumer se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

Este modelo es un fine-tune especializado, por lo que la comparación más directa es con su modelo base y con el checkpoint instruct hermano. No se dispone de benchmarks de estos últimos en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| HuggingFaceTB/SmolLM2-360M (base) | 361M | 8.192 | Apache 2.0 | Modelo general de lenguaje |
| AZH04/SmolLM2-360M-instruct-gsm8k-boxed-sft | 361M | No especificado | Apache 2.0 | SFT sobre GSM8K, variante instruct |
| AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep9 (este) | 361M | No especificado | Apache 2.0 | SFT sobre GSM8K, variante base, 9 épocas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación, no preparado para producción: su único propósito documentado es servir como inicialización para RL y como referencia en experimentos controlados.
- Especialización extrema en GSM8K: fuera de problemas aritméticos de estilo escolar, su rendimiento general es muy limitado y no debe usarse como modelo de propósito general.
- Riesgo de alucinación: como cualquier modelo pequeño, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas fuera de su distribución de entrenamiento.
- Sesgos del dataset: las trazas provienen de un único modelo profesor (Qwen2.5-3B-Instruct) y de un criterio de selección específico, lo que puede introducir sesgos sistemáticos en las estrategias de solución.
- Dependencia del formato `\boxed{}`: la evaluación estricta exige que la respuesta final esté en el último `\boxed{...}`; si el modelo no lo produce, la puntuación es cero.
- Sin soporte multilingüe documentado: el corpus es exclusivamente inglés, y el modelo base tiene un rendimiento limitado en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se proporciona "tal cual".

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep9)
- [Modelo base HuggingFaceTB/SmolLM2-360M](https://huggingface.co/HuggingFaceTB/SmolLM2-360M)
- [Checkpoint hermano instruct: AZH04/SmolLM2-360M-instruct-gsm8k-boxed-sft](https://huggingface.co/AZH04/SmolLM2-360M-instruct-gsm8k-boxed-sft)
- [Artículo sobre SmolLM2-360M en llm.co](https://llm.co/llms/smollm2-360m)
- [Ficha de SmolLM2-360M en LLM Explorer](https://llm-explorer.com/model/HuggingFaceTB%2FSmolLM2-360M,3Rtu9XSWDY3e80Iz0SOFm9)
- [Ficha de SmolLM2-360M Instruct en LLM Explorer](https://llm-explorer.com/model/HuggingFaceTB%2FSmolLM2-360M-Instruct,2NDsw2SIN4U7ERDUoWdabO)
