# ProCreations/Dory-Beam-4B

## Resumen

Dory-Beam-4B es un ajuste fino del modelo latente-recurrente Dory1.0-4B de NVIDIA, desarrollado por ProCreations y publicado en Hugging Face. Su objetivo es destilar el estilo de razonamiento y el control de esfuerzo del modelo profesor Beam-1.0-501B-A23B de Reflection en un modelo compacto de aproximadamente 4.000 millones de parámetros, manteniendo una arquitectura de transformer con bucles (looped transformer) que permite intercambiar cómputo por precisión sin aumentar el número de parámetros.

El modelo hereda de Dory1.0-4B su naturaleza de nGPT latente-recurrente: un bloque central de 40 capas que se ejecuta entre 1 y 4 veces por token, de modo que el coste computacional se ajusta en inferencia. Sobre esa base, ProCreations aplicó un proceso de destilación con 52.660 trazas verificadas de esfuerzo medio y 57.764 ejemplos adicionales distribuidos en niveles bajo, medio y alto, para después mezclar los pesos del ajuste con los del modelo base.

La relevancia actual del modelo reside en su control explícito de esfuerzo de razonamiento mediante el parámetro `reasoning_effort`, que permite reducir entre 1,9 y 4 veces el número de tokens generados respecto al modelo base según el nivel elegido. Está pensado para la competición Build with Beam de Reflection y se distribuye con licencia OpenMDW-1.1, lo que lo hace atractivo para despliegues donde el coste por token y la latencia son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer latente-recurrente (looped transformer), nGPT; bloque central de 40 capas ejecutado 1-4 veces por token |
| Parametros totales | 3.975.229.440 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en BF16; la model card menciona uso con Q5_K_M en llama.cpp) |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (repo de 15,9 GB) |

## Arquitectura y entrenamiento

Dory-Beam-4B se construye sobre Dory1.0-4B, un nGPT latente-recurrente en el que un bloque intermedio de 40 capas se aplica repetidamente (entre 1 y 4 veces) por cada token generado. Esta recurrencia permite escalar la capacidad de razonamiento en tiempo de inferencia sin incrementar el número de parámetros, un enfoque distinto al de los transformers densos convencionales. El ajuste fino se realizó mediante destilación desde Beam-1.0-501B-A23B, un modelo profesor de tipo MoE con 501.000 millones de parámetros totales y 23.000 millones activos, del que se transfirieron tanto el estilo de razonamiento (respuestas cortas y directas) como la capacidad de modular el esfuerzo de razonamiento.

El proceso de destilación utilizó 52.660 trazas verificadas de esfuerzo medio para aprender el estilo del profesor y 57.764 ejemplos adicionales etiquetados en niveles bajo, medio y alto para aprender el control de esfuerzo. Posteriormente, los pesos del ajuste se mezclaron de nuevo con los del modelo base (blend back), una técnica que busca preservar las capacidades originales mientras se incorpora el comportamiento destilado. El resultado se distribuye junto con una receta reproducible en `code/RECIPE.md` que documenta pasos, scripts, costes y dificultades del proceso. La versión 2 del modelo, publicada el 26 de octubre de 2026, añade el ajuste de esfuerzo; la primera release queda accesible bajo la etiqueta `v1`.

## Capacidades

- Generación de texto conversacional y razonamiento matemático de competición (MATH-500, AIME, AMC, GPQA-Diamond).
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium`, `high` o sin definir (por defecto), inyectado a través de `chat_template_kwargs`.
- Razonamiento latente recurrente: el número de bucles (1 a 4) se puede ajustar en inferencia para intercambiar cómputo por precisión.
- Estilo de razonamiento corto y directo, destilado del profesor Beam, con reducción de tokens de salida de 1,9 a 4 veces respecto al modelo base.
- Compatibilidad con clientes que pasan argumentos de plantilla de chat: vLLM, SGLang, transformers y el servidor de llama.cpp.
- Generación de trazas de razonamiento verificables (el dataset de entrenamiento contiene trazas verificadas).
- No se documentan capacidades de visión, audio, tool calling ni function calling en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Resolución de problemas matemáticos de competición con presupuesto controlado: en modo `low` el modelo responde problemas de MATH-500 con 1.000 tokens de media y un 96,0 % de precisión, adecuado para entornos donde la latencia importa más que exprimir el último punto de exactitud.
- Evaluación comparativa de estrategias de razonamiento: investigadores pueden alternar entre `low`, `medium`, `high` y el valor por defecto para estudiar la curva precisión-coste en un mismo modelo sin cambiar de pesos.
- Despliegue en hardware de consumo: con cuantización Q5_K_M y 2 bucles, el modelo se ejecuta en tiempo real en un Apple M4 Max generando entre 626 y 886 tokens en 13-19 segundos según el nivel de esfuerzo, lo que lo hace viable en estaciones de trabajo sin GPU dedicada de datacenter.
- Destilación de modelos mayores hacia modelos pequeños: la receta pública (`code/RECIPE.md`) documenta cómo replicar el proceso de destilación de Beam en otros modelos base, útil para equipos que quieran transferir estilos de razonamiento.
- Generación de respuestas rápidas en asistentes técnicos: el modo `low` mantiene un 80,7 % en el conjunto held-out con solo 2.000 tokens de media, apropiado para atención al usuario donde se prioriza la concisión.
- Investigación sobre transformers recurrentes: el modelo permite experimentar con el número de bucles (1-4) como hiperparámetro de inferencia, algo imposible en arquitecturas densas convencionales.
- Benchmarking de control de esfuerzo: comparar la curva del estudiante (Dory-Beam-4B) con la del profesor (Beam) en la misma escala de esfuerzo, con una brecha documentada de 6-9 puntos y 1,5 veces más tokens.

## Benchmarks y rendimiento

Resultados de precisión (%) y tokens medios de salida por respuesta, a 2 bucles:

| Modelo | GPQA-Diamond | MATH-500 | AIME 2024 | AIME 2025 | AMC 2023 | Held-out |
|---|---|---|---|---|---|---|
| Dory1.0-4B (base) | 72,5 · 14,3k | 98,4 · 3,7k | 91,2 · 13,5k | 92,1 · 15,7k | 100,0 · 4,8k | 79,0 · 9,4k |
| Dory-Beam-4B, `low` | 68,7 · 2,6k | 96,0 · 1,0k | 80,0 · 4,1k | 69,6 · 4,7k | 98,1 · 1,7k | 80,7 · 2,0k |
| Dory-Beam-4B, `medium` | 70,2 · 5,5k | 97,6 · 1,3k | 91,2 · 5,9k | 82,5 · 8,0k | 96,2 · 2,0k | 84,3 · 3,4k |
| Dory-Beam-4B, por defecto | 74,0 · 5,9k | 97,0 · 1,5k | 88,3 · 6,5k | 86,7 · 8,7k | 99,4 · 2,3k | 82,7 · 3,9k |
| Dory-Beam-4B, `high` | 74,7 · 7,4k | 97,6 · 1,5k | 87,9 · 7,9k | 88,8 · 9,6k | 95,6 · 2,6k | 82,3 · 4,2k |
| Dory-Beam-4B-Accurate | 74,7 · 7,4k | 97,6 · 1,9k | 92,1 · 7,9k | 89,2 · 9,6k | 98,8 · 2,8k | 80,0 · 4,8k |
| Beam-1.0-501B-A23B (profesor), `medium` | 87,9 · 2,8k | 99,2 · 0,9k | 92,9 · 4,1k | 89,6 · 5,1k | 99,4 · 1,6k | 84,7 · 1,9k |

El modelo estudiante sigue la curva del profesor con una brecha de 6-9 puntos en precisión y aproximadamente 1,5 veces más tokens generados en el mismo nivel de esfuerzo. En los benchmarks evaluados, Beam deja de mejorar a partir de `high`: los niveles `xhigh` y `max` empatan en precisión escribiendo más tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 3.975 millones de parámetros, en BF16 se requieren aproximadamente 8 GB solo para pesos; en Q5_K_M el consumo se reduce de forma sustancial, aunque no se publica la cifra exacta.
- GPU recomendadas: no se especifican modelos de GPU de datacenter (A100, H100) en la model card. Se documenta ejecución en Apple M4 Max con llama.cpp y cuantización Q5_K_M y 2 bucles.
- Cabe en GPU de consumo: la demo pública se ejecuta en ZeroGPU de Hugging Face Spaces, lo que indica viabilidad en GPU de consumo, aunque no se detalla el modelo concreto.
- Opciones de despliegue: vLLM, SGLang, transformers y el servidor de llama.cpp, todos ellos compatibles con el paso de `chat_template_kwargs` para `reasoning_effort`.
- Latencia y throughput: en Apple M4 Max con Q5_K_M y 2 bucles, el modelo genera 626 tokens en 13 s (`low`), 849 tokens en 18 s (por defecto) y 886 tokens en 19 s (`high`) sobre un problema de MATH-500, frente a 2.599 tokens en 53 s del modelo base. Una sola ejecución con semilla 0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory-Beam-4B | ~4B (3.975 M) | no disponible | 96,0-97,6 según esfuerzo | OpenMDW-1.1 | Hugging Face (ProCreations) |
| Dory1.0-4B (base) | ~4B | no disponible | 98,4 | no disponible en la información | Hugging Face (nvidia) |
| Dory-Beam-4B-Accurate | ~4B | no disponible | 97,6 | no disponible en la información | Hugging Face (ProCreations) |
| Beam-1.0-501B-A23B (profesor) | 501B totales / 23B activos | no disponible | 99,2 | no disponible en la información | Hugging Face (reflection) |

La comparativa se limita a los modelos mencionados en la model card. Dory-Beam-4B sacrifica entre 0,8 y 2,4 puntos de precisión en MATH-500 respecto a Dory1.0-4B, pero reduce los tokens de salida de 3,7k a 1,0-1,5k. Frente al profesor Beam, la brecha es de 1,6-3,2 puntos en MATH-500 con un modelo 125 veces menor en parámetros totales.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card; no se documentan capacidades multilingües.
- En modo `low` pierde entre 11 y 23 puntos en AIME respecto al modelo base, por lo que no es adecuado para matemáticas de competición exigentes con ese ajuste.
- El nivel `high` no mejora de forma consistente al valor por defecto: en AMC 2023 pierde 3,8 puntos y en AIME 2024 pierde 0,4, con diferencias dentro del ruido en la mayoría de benchmarks.
- La brecha con el profesor Beam es de 6-9 puntos en precisión y 1,5 veces más tokens, lo que limita su uso como sustituto directo en tareas de máxima exigencia.
- No se documentan resultados de benchmarks de tool calling, function calling, agentes o visión; no hay evidencia de que soporte estas capacidades.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la model card la etiqueta como "other" y enlaza a los términos en openmdw.ai.
- El proceso de mezcla de pesos (blend back) con el modelo base puede introducir comportamientos no documentados que no aparecen en la evaluación publicada.
- Los resultados de latencia provienen de una sola ejecución con semilla 0 en Apple M4 Max; no constituyen una caracterización robusta de rendimiento.
- Riesgo de alucinación no cuantificado en la información disponible; el modelo está orientado a matemáticas y razonamiento, no a conocimiento factual general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/Dory-Beam-4B
- Modelo base Dory1.0-4B: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Modelo profesor Beam-1.0-501B-A23B: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Variante Accurate: https://huggingface.co/ProCreations/Dory-Beam-4B-Accurate
- Demo en vivo (ZeroGPU): https://huggingface.co/spaces/ProCreations/Dory-Beam-4B-live
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/ProCreations/Beam-Reasoning-Traces
- Receta de destilación: https://huggingface.co/ProCreations/Dory-Beam-4B/blob/main/code/RECIPE.md
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
