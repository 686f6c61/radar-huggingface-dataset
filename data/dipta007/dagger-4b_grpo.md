# dipta007/dagger-4B_GRPO

## Resumen

DAGGER-4B-GRPO es un modelo de razonamiento matemático de 4.3 mil millones de parámetros, desarrollado por dipta007 como parte del proyecto DAGGER (Distractor-Aware Graph Generation for Executable Reasoning). Está entrenado mediante GRPO directamente sobre el modelo base Gemma-3-4B-Instruct, sin pasar por una fase previa de SFT, lo que lo convierte en una ablación experimental para estudiar el impacto de la inicialización por supervisión en modelos pequeños.

El modelo reformula la resolución de problemas matemáticos como la generación de un grafo computacional en formato JSON, donde cada nodo representa una operación o una constante, y se marcan explícitamente los nodos distractores (datos irrelevantes presentes en el enunciado). Esta aproximación reduce el número de tokens generados frente a modelos de razonamiento convencionales y permite una ejecución determinista del resultado. Está diseñado específicamente para bengalí e inglés, y su principal contribución es demostrar que, en modelos de 4B, la ausencia de una fase SFT previa degrada notablemente el rendimiento en la generación de grafos fiables.

El modelo se enmarca en el trabajo aceptado en EMNLP 2026 (Findings) y es relevante para la investigación en razonamiento matemático en lenguas de bajos recursos, así como para estudios de ablación sobre el papel de la inicialización SFT en la optimización con RL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma-3-4B-Instruct) |
| Parámetros totales | 4.300.079.472 (4.3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma-3-4B-Instruct soporta 128K tokens, pero no se confirma en la ficha) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bengalí (bn), inglés (en) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (repo de 8.6 GB) |

## Arquitectura y entrenamiento

DAGGER-4B-GRPO se construye sobre la arquitectura Transformer del modelo base Gemma-3-4B-Instruct, sin modificaciones arquitectónicas adicionales. La innovación principal reside en el enfoque de entrenamiento: se aplica GRPO (Group Relative Policy Optimization) directamente sobre el modelo base, sin una fase previa de SFT. La configuración de entrenamiento usa LoRA con rank 64 y alpha 128, un batch global de 32, y 8 generaciones por prompt. La función de pérdida es BNPO (una variante de optimización de políticas). El modelo se entrena sobre dos datasets: `dipta007/dagger` y `dipta007/DistractMath-Bn`, este último con problemas matemáticos en bengalí con distractores explícitos.

La principal innovación técnica es la generación de grafos computacionales como formato intermedio de razonamiento. El modelo produce un JSON con nodos ordenados topológicamente, operaciones aritméticas y estadísticas, y un nodo `final_result` que indica la respuesta. Los nodos marcados como `distractor: true` no participan en el camino de cálculo final, lo que permite al modelo ignorar información irrelevante de manera explícita y verificable.

## Capacidades

- Razonamiento matemático en bengalí e inglés, con resolución de problemas de aritmética, operaciones estadísticas, redondeo, raíces, potencias, máximo común divisor y mínimo común múltiplo.
- Generación de grafos computacionales en formato JSON, con nodos ordenados topológicamente y un único nodo de salida `final_result`.
- Detección explícita de distractores: el modelo identifica qué números no participan en el cálculo final y los marca en el grafo.
- Ejecución del razonamiento mediante la ejecución del grafo generado, lo que permite verificar la respuesta de forma determinista.
- Soporte de conversación y generación de texto (heredado de Gemma-3-4B-Instruct), aunque su uso principal es la resolución de problemas matemáticos.
- No se indica soporte de tool calling, agentes, ni visión/audio en la documentación disponible.

## Casos de uso

- Tutoría de matemáticas en bengalí: el modelo puede resolver problemas de enunciados en bengalí y explicar la solución paso a paso mediante el grafo computacional, lo que facilita su integración en plataformas educativas para hablantes de bengalí.
- Generación de ejercicios con distractores: dado un problema matemático, el modelo puede identificar y marcar información irrelevante, lo que ayuda a crear ejercicios que evalúen la capacidad de discriminación de información relevante.
- Investigación en razonamiento de modelos de lenguaje: sirve como baseline de ablación para estudiar el efecto del SFT en modelos pequeños con RL, comparando su rendimiento con la versión `dagger-4B_SFT_GRPO`.
- Sistema de respuesta automática a preguntas matemáticas en entornos de bajo recursos: su tamaño de 4B permite desplegarlo en infraestructura modesta, y su salida JSON permite validar la respuesta ejecutando el grafo.
- Análisis de robustez ante distractores: el modelo puede evaluar la capacidad de un sistema de razonamiento para ignorar datos irrelevantes, útil en pipelines de evaluación de modelos de lenguaje.
- Generación de datos sintéticos para entrenamiento: el formato de grafo computacional puede usarse para crear datasets de entrenamiento con anotaciones de distractores y razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, pero la model card del autor proporciona los siguientes resultados en los datasets MGSM y MSVAMP:

| Dataset | Original | +Distractor |
|---|---|---|
| MGSM | 29.2 | 13.1 |
| MSVAMP | 57.1 | 29.3 |

Además, se presenta una comparación con la versión entrenada con SFT previo a GRPO:

| Inicialización | MGSM | MGSM (+D) | MSVAMP (+D) |
|---|---|---|---|
| Base → GRPO (este modelo) | 29.2 | 13.1 | 29.3 |
| SFT → GRPO | 54.8 | 31.4 | 42.9 |

La diferencia de rendimiento es de +25.6 puntos en MGSM, +18.3 en MGSM con distractores y +13.6 en MSVAMP con distractores, lo que evidencia la degradación del modelo sin SFT. No se proporcionan resultados en otros benchmarks como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo completo en FP16, los pesos ocupan aproximadamente 8.6 GB, por lo que se necesitan al menos 10-12 GB de VRAM para inferencia con batch pequeño y generación de hasta 1024 tokens.
- GPU recomendadas: tarjetas con 16 GB de VRAM como RTX 4080/4090, o GPUs profesionales como A10G o A100 (40 GB) para mayor margen. Para cuantización en 8 bits (GGUF Q8) se reduciría a ~4.5 GB y podría caber en tarjetas de 8 GB como RTX 3070/3080.
- No se ha confirmado oficialmente el soporte de cuantizaciones, pero por ser un modelo basado en Gemma-3, es compatible con cuantizaciones estándar de llama.cpp, GPTQ y AWQ.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference) y FriendliAI (según la entrada en su catálogo). El modelo es compatible con el pipeline `text-generation` de Transformers.
- Latencia y throughput estimados: no se han publicado datos oficiales. Para un modelo de 4B en una GPU moderna, se espera una latencia de generación del orden de 10-20 tokens por segundo en FP16, y mayor con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (MGSM) | Disponibilidad |
|---|---|---|---|---|---|
| dagger-4B_GRPO (este) | 4.3B | no disponible | gemma | 29.2 | Público (HF) |
| dagger-4B_SFT_GRPO | 4.3B | no disponible | gemma | 54.8 | Acceso restringido (requiere login) |
| google/gemma-3-4b-it | 4.3B | 128K | gemma | no publicado | Público |
| Math-Shepherd (modelo de razonamiento matemático) | 7B | no disponible | MIT | no publicado | Público |

El modelo se sitúa en la gama de modelos pequeños de razonamiento matemático, pero su rendimiento es significativamente inferior al de la versión con SFT, lo que lo hace útil principalmente como referencia de ablación en lugar de como modelo de producción.

## Limitaciones y advertencias

- Es una versión de ablación entrenada sin SFT, por lo que su rendimiento es notablemente inferior al modelo con SFT (hasta 25 puntos menos en MGSM). No se recomienda para uso en producción sin evaluar alternativas.
- El modelo está especializado en razonamiento matemático y no se ha evaluado en otras tareas como generación de texto general, código o conversación.
- Riesgo de alucinación en la generación de grafos: puede producir nodos o operaciones incorrectas, especialmente en problemas complejos o con distractores.
- Limitación de idiomas: aunque soporta bengalí e inglés, no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Gemma impone restricciones de uso comercial específicas (términos de uso de Google), que deben revisarse antes de su integración en productos.
- El formato de salida JSON requiere validación y ejecución externa para obtener la respuesta final; el modelo no devuelve directamente la respuesta numérica, sino un grafo.
- No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, por lo que no se puede comparar con otros modelos en tareas generales.
- El repositorio tiene solo 11 descargas y 0 likes en Hugging Face, lo que sugiere una adopción limitada y posible falta de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dipta007/dagger-4B_GRPO
- Paper (arXiv): https://arxiv.org/abs/2601.06853
- Página del proyecto: https://dipta007.github.io/DAGGER/
- Repositorio GitHub: https://github.com/dipta007/DAGGER
- Dataset DistractMath-Bn: https://huggingface.co/datasets/dipta007/DistractMath-Bn
- Colección de modelos DAGGER: https://huggingface.co/collections/dipta007/dagger
- Modelo con SFT (acceso restringido): https://huggingface.co/dipta007/dagger-4B_SFT_GRPO
- Despliegue en FriendliAI: https://friendli.ai/models/dipta007/dagger-4B_GRPO
