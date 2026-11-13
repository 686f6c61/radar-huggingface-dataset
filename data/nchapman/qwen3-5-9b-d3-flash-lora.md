# nchapman/Qwen3.5-9B-d3-flash-LoRA

## Resumen

Qwen3.5-9B-d3-flash-LoRA es un adaptador PEFT de tipo LoRA de rango 128, junto con una cabeza de clasificación de 255 vías denominada `CodeReadout`, extraído del modelo `vllm-sr/d3-flash` y montado sobre el modelo base `Qwen/Qwen3.5-9B`. Lo desarrolla el usuario nchapman y se publica bajo licencia Apache 2.0. El repositorio ocupa 0,7 GB, lo que corresponde únicamente a los pesos del adaptador y de la cabeza, no al modelo base completo.

El modelo se presenta como un "decision-model" o "system-one" (etiquetas `decision-model`, `system-one`, `warp-34`, `vllm-sr`), es decir, un adaptador orientado a tareas de decisión y evaluación de tipo respuesta corta más que a generación libre de texto largo. La arquitectura subyacente es la del transformer denso de Qwen3.5-9B, sobre el que se aplica la modificación LoRA más una cabeza de clasificación de 255 salidas.

La relevancia del artefacto es acotada: se trata de un experimento de destilación/extracción de un modelo mayor (`d3-flash`) hacia un adaptador sobre un modelo de 9B, con evaluación pública en un benchmark propio llamado JevBench. El adaptador no mejora la precisión global respecto al modelo base (ambos 83,55 %), pero reduce la pérdida de verosimilitud negativa (NLL) y el Brier score, lo que indica mejor calibración de las probabilidades emitidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.5-9B + cabeza de clasificación `CodeReadout` de 255 vías |
| Parametros totales | no disponible (el adaptador ocupa 0,7 GB; el modelo base Qwen3.5-9B no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 128 (`r=128`) con una técnica descrita en la model card como "Teacher-ASVD + 4-NormFold", más una cabeza `CodeReadout` de 255 salidas. Se extrae del modelo `vllm-sr/d3-flash` y se aplica sobre `Qwen/Qwen3.5-9B`. La nomenclatura sugiere una destilación desde un modelo profesor (`d3-flash`) hacia el modelo base de 9B, con una etapa de descomposición de valores singulares (ASVD) y una normalización en cuatro pasos ("4-NormFold"), aunque la model card no detalla el procedimiento completo ni los datos de entrenamiento.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. La etiqueta `vllm-sr` apunta a integración con vLLM, y `warp-34` y `system-one` parecen referirse a la familia experimental del autor más que a una arquitectura concreta.

## Capacidades

- Generación de texto y clasificación de decisiones sobre 255 clases mediante la cabeza `CodeReadout`.
- Evaluación de tipo "system-one": respuestas rápidas de decisión, no razonamiento multi-paso largo.
- Emisión de probabilidades calibradas (se reportan NLL y Brier score en la evaluación).
- Integración con PEFT: se carga como adaptador sobre el modelo base Qwen3.5-9B.
- Soporte de tool calling, agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Clasificación de decisiones acotadas: usar la cabeza de 255 vías para etiquetar entradas en un conjunto cerrado de categorías, aprovechando la calibración reportada (Brier 0,2138 frente a 0,2388 del base).
- Enrutamiento de consultas: asignar cada petición de un sistema a una de las 255 clases de decisión antes de derivarla a un modelo generativo mayor.
- Filtrado y triaje: descartar o priorizar casos en pipelines de datos según la probabilidad emitida por el `CodeReadout`.
- Evaluación comparativa de adaptadores: servir como referencia para medir el efecto de la destilación desde `d3-flash` sobre Qwen3.5-9B en tareas de decisión.
- Investigación en calibración: analizar la mejora de NLL (0,3602 frente a 0,4773 del base) en modelos pequeños destilados.
- Despliegue ligero con vLLM: cargar el adaptador junto al modelo base en un servidor vLLM para inferencia de baja latencia en tareas de clasificación.

## Benchmarks y rendimiento

Evaluación pública JevBench (231 casos: 48 Easy / 72 Original / 111 Hard), según la model card:

| Modelo | Overall Acc | Easy (48) | Original (72) | Hard (111) | NLL (↓) | Brier (↓) |
|---|---|---|---|---|---|---|
| Base `Qwen/Qwen3.5-9B` | 193/231 (83,55 %) | 48/48 | 71/72 | 74/111 | 0,4773 | 0,2388 |
| **`Qwen3.5-9B-d3-flash-LoRA` (r=128)** | **193/231 (83,55 %)** | **48/48** | **72/72** | **73/111** | **0,3602** | **0,2138** |
| Full `vllm-sr/d3-flash` | 190/231 (82,25 %) | 48/48 | 72/72 | 70/111 | 0,3598 | 0,2134 |

El adaptador iguala la precisión global del base, mejora un caso en Original, pierde uno en Hard y mejora de forma clara la calibración (NLL y Brier). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 0,7 GB y debe sumarse al modelo base Qwen3.5-9B (tamaño en VRAM no especificado en la información).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; depende del modelo base y de la cuantización elegida, que no se documenta.
- Opciones de despliegue: PEFT y vLLM (etiqueta `vllm-sr`); otras opciones no confirmadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench Acc | NLL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-d3-flash-LoRA | 9B (base) + LoRA r=128 | no disponible | 83,55 % | 0,3602 | Apache 2.0 | Hugging Face |
| Base Qwen/Qwen3.5-9B | 9B | no disponible | 83,55 % | 0,4773 | no disponible en la información | Hugging Face |
| Full vllm-sr/d3-flash | no disponible | no disponible | 82,25 % | 0,3598 | no disponible en la información | Hugging Face |

No se dispone de comparación con otros adaptadores LoRA o modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no supera en precisión global al modelo base; su ventaja está en la calibración (NLL y Brier), no en la tasa de acierto.
- La cabeza `CodeReadout` está limitada a 255 clases; no sirve para generación abierta sin el modelo base.
- No se documentan sesgos conocidos ni composición del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación: no evaluado en la información disponible; el benchmark JevBench mide decisiones, no fidelidad factual.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-9B, no detallada aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto experimental sin validación comunitaria.
- Las etiquetas `warp-34` y `system-one` no están documentadas; su significado técnico no puede confirmarse.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/nchapman/Qwen3.5-9B-d3-flash-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo profesor / origen: https://huggingface.co/vllm-sr/d3-flash
