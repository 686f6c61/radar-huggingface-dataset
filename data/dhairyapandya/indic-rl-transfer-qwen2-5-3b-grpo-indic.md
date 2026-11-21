# dhairyapandya/indic-rl-transfer-qwen2.5-3b-grpo-indic

## Resumen

El modelo `indic-rl-transfer-qwen2.5-3b-grpo-indic` es un adaptador LoRA (PEFT) sobre `Qwen/Qwen2.5-3B-Instruct`, desarrollado por dhairyapandya como parte del estudio `indic-rl-transfer`. No se trata de un modelo completo, sino de un adaptador de rango 32 entrenado con GRPO (Group Relative Policy Optimization) para mejorar el razonamiento matematico en bengali y telugu. El objetivo del estudio es responder a una pregunta concreta de investigacion: si el aprendizaje por refuerzo realizado en ingles sobre problemas matematicos transfiere a idiomas de bajos recursos como el bengali y el telugu, o si conviene entrenar directamente en esos idiomas.

El adaptador se entreno durante 250 pasos sobre 1.069 problemas de GSM8K, mostrados al 50% en bengali y al 50% en telugu, con un sistema de recompensas basado en la coincidencia exacta de la respuesta final (peso 1.0) y en el formato `#### <numero>` (peso 0.2). Se entreno en 4 bits (QLoRA) sobre una unica GPU T4. El resultado principal del estudio es un incremento de 16,4 puntos en MGSM para bengali, aunque el analisis revela que la mejora se debe en gran medida a que el modelo aprendio a razonar en ingles (el 76% de las respuestas en bengali) en lugar de hacerlo en bengali.

Este adaptador es relevante para investigadores interesados en transferencia de razonamiento entre idiomas, en el uso de RL para mejorar capacidades matematicas multilingues y en las dinamicas de code-switching (cambio de idioma) inducidas por el entrenamiento. Su tamano reducido (0,3 GB) y su licencia Apache 2.0 lo hacen accesible para experimentacion, aunque su rendimiento en telugu sigue siendo muy bajo (10,8% en MGSM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 3.090 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Entrenamiento QLoRA en 4 bits; el adaptador se aplica sobre el modelo base en fp16 segun la model card |
| Idiomas soportados | Bengali (bn) y telugu (te) como idiomas objetivo; el modelo base soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen2.5-3B-Instruct`, un transformer decoder-only de 3.090 millones de parametros. El adaptador LoRA tiene rango 32 y se entreno con QLoRA en 4 bits sobre una unica GPU T4, lo que lo hace reproducible en hardware de consumo. El entrenamiento utilizo GRPO durante 250 pasos sobre 1.069 problemas de GSM8K, presentados al 50% en bengali y al 50% en telugu. La funcion de recompensa combina la coincidencia exacta de la respuesta final (peso 1.0) con una bonificacion de formato `#### <numero>` (peso 0.2). Los datos de entrenamiento excluyen los 250 problemas de test de GSM8K sobre los que se construye MGSM, verificado en tiempo de carga.

El estudio compara tres adaptadores entrenados con los mismos problemas, pasos e hiperparametros, que difieren unicamente en el idioma del prompt (ingles, bengali/telugu) y, en un caso, en una recompensa de consistencia en escritura nativa. El hallazgo principal es que el adaptador entrenado en bengali/telugu mejora 16,4 puntos en MGSM para bengali, pero el analisis muestra que el modelo aprendio a razonar en ingles (el 76% de las respuestas en bengali), lo que sugiere que la mejora proviene de la transferencia hacia el razonamiento en ingles y no de un razonamiento nativo en bengali. El adaptador con recompensa de consistencia nativa rindio peor (40,0% en bengali frente a 52,8% sin ella).

## Capacidades

- Razonamiento matematico en bengali y telugu, con mejora medible en MGSM para bengali (52,8% frente a 36,4% del modelo base).
- Generacion de cadenas de razonamiento (chain-of-thought) con formato de respuesta final `#### <numero>`.
- Code-switching inducido: el modelo tiende a razonar en ingles aunque el prompt este en bengali (76% de las respuestas en bengali razonan en ingles).
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct: generacion de texto, codigo, matematicas y soporte multilingue general.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (heredado del modelo base, no verificado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en transferencia de razonamiento entre idiomas: el adaptador permite reproducir el experimento de si el RL en ingles transfiere a bengali y telugu, comparando los tres adaptadores del estudio con los mismos problemas e hiperparametros.
- Evaluacion de code-switching en modelos multilingues: sirve para estudiar por que el modelo razona en ingles cuando se le pregunta en bengali y como afecta esto a la precision final, un fenomeno relevante para el diseno de recompensas.
- Benchmarking de metodos de RL para idiomas de bajos recursos: util para comparar GRPO con otras tecnicas (SFT, DPO) en tareas matematicas en bengali y telugu.
- Experimentacion academica con LoRA y QLoRA: el adaptador es ligero (0,3 GB) y se entreno en una T4, lo que facilita su reproduccion y extension en entornos con recursos limitados.
- Analisis de recompensas y formatos: el estudio compara una recompensa de consistencia nativa frente a la recompensa estandar, lo que permite investigar como el diseno de la recompensa afecta al idioma de razonamiento.
- Despliegue experimental con vLLM y LoRA: la model card incluye un ejemplo de uso con `vLLM` y `LoRARequest`, adecuado para prototipos de inferencia con multiples adaptadores sobre el mismo modelo base.

## Benchmarks y rendimiento

Resultados de MGSM (precision en %, greedy, 250 items por idioma; adaptador aplicado sobre el modelo base en fp16):

| Modelo | en | bn | te | sw |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct | 85,6 | 36,4 | 10,4 | 9,2 |
| + GRPO en ingles | 84,8 | 39,2 | 8,8 | 6,8 |
| + GRPO en bengali/telugu (este adaptador) | 86,0 | 52,8 | 10,8 | 13,6 |
| + GRPO en bengali/telugu + recompensa de consistencia | 82,0 | 40,0 | 10,8 | 10,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0,3 GB; el modelo base Qwen2.5-3B-Instruct en fp16 requiere aproximadamente 6 GB de VRAM, y en 4 bits alrededor de 2-3 GB (estimacion estandar para 3B parametros; no confirmada en la informacion proporcionada).
- GPU recomendadas: el entrenamiento se realizo en una unica T4; para inferencia son suficientes GPUs de consumo como RTX 3060, RTX 4060 Ti o superiores. Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6-8 GB de VRAM para el modelo base en fp16, o menos con cuantizacion.
- Opciones de despliegue: vLLM con soporte LoRA (`enable_lora=True`, `max_lora_rank=64`), segun el ejemplo de la model card. Otras opciones como llama.cpp, Ollama o TGI no estan confirmadas en la informacion proporcionada para este adaptador.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MGSM bn | MGSM te | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (GRPO bn/te sobre Qwen2.5-3B-Instruct) | 3B + LoRA r=32 | No disponible | 52,8 | 10,8 | Apache 2.0 | Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3B | No disponible | 36,4 | 10,4 | Apache 2.0 | Hugging Face |
| Adaptador GRPO en ingles sobre Qwen2.5-3B-Instruct | 3B + LoRA | No disponible | 39,2 | 8,8 | No disponible | Hugging Face (mismo estudio) |
| Adaptador GRPO bn/te + recompensa de consistencia | 3B + LoRA | No disponible | 40,0 | 10,8 | No disponible | Hugging Face (mismo estudio) |

## Limitaciones y advertencias

- El rendimiento en telugu sigue siendo muy bajo (10,8% en MGSM), practicamente identico al del modelo base (10,4%), por lo que el adaptador no mejora de forma significativa este idioma.
- La mejora en bengali se debe en gran medida a que el modelo razona en ingles (76% de las respuestas en bengali), no a un razonamiento nativo en bengali; esto puede ser indeseable si se busca preservar el idioma objetivo.
- Las puntuaciones de GSM8K de este adaptador no son significativas porque el conjunto de entrenamiento proviene del test de GSM8K, aunque se excluyeron los 250 problemas de test de MGSM.
- El adaptador con recompensa de consistencia nativa rindio peor en bengali (40,0% frente a 52,8%), lo que sugiere que el diseno de la recompensa es sensible y puede degradar el rendimiento.
- Riesgo de alucinacion y sesgos: no documentado especificamente para este adaptador; hereda los del modelo base Qwen2.5-3B-Instruct.
- Limitaciones de contexto e idioma: solo se evaluo en bengali, telugu, ingles y suajili (MGSM); no hay datos sobre otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador se distribuye como PEFT y requiere el modelo base Qwen2.5-3B-Instruct, cuya licencia tambien es Apache 2.0.
- Es un adaptador de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/dhairyapandya/indic-rl-transfer-qwen2.5-3b-grpo-indic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del estudio: https://github.com/dhairya-pandya/indic-rl-transfer
- Informe del estudio: https://github.com/dhairya-pandya/indic-rl-transfer/blob/main/docs/report.md
- Dataset de evaluaciones: https://huggingface.co/datasets/dhairyapandya/indic-rl-transfer-evals
- Dataset de entrenamiento (indic-gsm8k): https://huggingface.co/datasets/ai4bharat/indic-gsm8k
- Dataset MGSM: https://huggingface.co/datasets/juletxara/mgsm
