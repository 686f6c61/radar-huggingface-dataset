# dhairyapandya/indic-rl-transfer-qwen2.5-3b-grpo-en

## Resumen

El modelo `dhairyapandya/indic-rl-transfer-qwen2.5-3b-grpo-en` no es un modelo completo, sino un adaptador LoRA (r=32) entrenado sobre `Qwen/Qwen2.5-3B-Instruct` mediante GRPO (Group Relative Policy Optimization) para resolver problemas de matematicas de primaria en ingles. Forma parte del estudio `indic-rl-transfer`, cuyo objetivo es medir si el aprendizaje por refuerzo (RL) aplicado en ingles transfiere capacidades matematicas a idiomas como el bengali y el telugu, en comparacion con aplicar RL directamente en esos idiomas.

El adaptador se entreno durante 250 pasos sobre 1.069 problemas de GSM8K en ingles, con una funcion de recompensa compuesta por coincidencia exacta de la respuesta final (peso 1.0) y una bonificacion de formato `#### <numero>` (peso 0.2). El entrenamiento se realizo con QLoRA de 4 bits en una unica GPU T4, lo que lo hace reproducible con hardware de consumo.

La relevancia del modelo es fundamentalmente experimental: el hallazgo principal del estudio es que el RL en ingles no produjo cambios significativos en la precision sobre MGSM en bengali ni en telugu, mientras que el RL nativo en esos idiomas si mejoro el rendimiento (bengali paso de 36,4% a 52,8%). Esto lo convierte en una pieza de evidencia util para investigacion sobre transferencia cross-lingue de RL, no en un modelo orientado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador LoRA de rango 32 |
| Parametros totales | 3.000 millones (modelo base) + adaptador LoRA (r=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Entrenamiento QLoRA 4-bit; el adaptador se aplica sobre el modelo base en fp16 para evaluacion |
| Idiomas soportados | en (entrenamiento); evaluado en en, bn, te, sw |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only de 3.000 millones de parametros. El entrenamiento emplea PEFT con LoRA de rango 32, en modalidad QLoRA de 4 bits, ejecutado en una sola GPU T4 durante 250 pasos. El dataset de entrenamiento son 1.069 problemas GSM8K en ingles, excluyendo explicitamente los 250 problemas de test de GSM8K de los que se deriva MGSM (verificado en tiempo de carga).

La innovacion metodologica es el uso de GRPO con recompensas verificables: coincidencia exacta de la respuesta final (recompensa 1.0) y bonificacion por formato `#### <numero>` (0.2). El estudio compara tres brazos con identicos problemas, pasos e hiperparametros, variando solo el idioma del prompt (ingles vs. bengali/telugu) y, en un brazo, anadiendo una recompensa por escritura nativa y por consistencia. El objetivo es aislar el efecto del idioma del RL en la transferencia cross-lingue.

## Capacidades

- Generacion de texto y razonamiento matematico basico en ingles (problemas tipo GSM8K).
- Resolucion de problemas de matematicas de primaria con formato de respuesta final explicito (`#### <numero>`).
- Razonamiento multi-paso en una unica respuesta (chain-of-thought implicito en el formato GSM8K).
- Capacidades multilingues heredadas del base Qwen2.5-3B-Instruct, aunque el adaptador no fue entrenado para mejorar bengali ni telugu (de hecho, el estudio muestra que no transfiere).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este adaptador (el base Qwen2.5-3B-Instruct lo soporta, pero el adaptador no fue entrenado para ello).
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Reproduccion de experimentos de RL con recompensas verificables: el adaptador sirve como referencia para replicar el pipeline GRPO sobre GSM8K con QLoRA en una T4, util para investigadores que quieran validar la metodologia antes de escalar.
- Estudio de transferencia cross-lingue: permite comparar directamente el efecto del RL en ingles frente al RL nativo en bengali/telugu sobre la misma base, aislando la variable del idioma del entrenamiento.
- Baseline en investigacion sobre recompensas de formato: el uso de una bonificacion `#### <numero>` de 0.2 es un caso concreto para estudiar como las recompensas de formato afectan a la precision final.
- Evaluacion de MGSM en ingles: el adaptador alcanza 84,8% en MGSM en ingles (frente a 85,6% del base), lo que lo hace util como punto de comparacion en estudios de degradacion por RL.
- Docencia y divulgacion: ejemplo compacto y reproducible (0,3 GB de repo, una T4) para explicar GRPO, LoRA y evaluacion con recompensas verificables en un curso practico.
- Auditoria de sesgos de evaluacion: el aviso de que las puntuaciones GSM8K de este adaptador no son significativas (porque el pool de entrenamiento proviene del test de GSM8K) es un caso practico para ensenar contaminacion de datos y buenas practicas de evaluacion.

## Benchmarks y rendimiento

Precision en MGSM (%, greedy, 250 items por idioma; adaptador aplicado sobre el modelo base en fp16):

| Modelo | en | bn | te | sw |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct | 85,6 | 36,4 | 10,4 | 9,2 |
| + GRPO en ingles (este adaptador) | 84,8 | 39,2 | 8,8 | 6,8 |
| + GRPO en bengali/telugu | 86,0 | 52,8 | 10,8 | 13,6 |
| + GRPO en bengali/telugu + recompensa de consistencia | 82,0 | 40,0 | 10,8 | 10,0 |

Hallazgo principal: el RL en ingles no produjo cambios significativos en bengali ni en telugu; el RL nativo en esos idiomas si mejoro bengali de forma notable (+16,4 puntos). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-3B-Instruct en fp16 requiere aproximadamente 6-7 GB; con cuantizacion 4-bit, en torno a 2-3 GB. El adaptador LoRA anade una cantidad marginal (repo de 0,3 GB).
- GPU recomendadas: T4 (suficiente para entrenamiento QLoRA 4-bit y para inferencia), RTX 3090/4090, A100, H100 para mayor throughput.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; en 8 GB conviene cuantizar el base a 4-bit.
- Opciones de despliegue: vLLM con `enable_lora=True` y `max_lora_rank=64` (ejemplo oficial de la model card), llama.cpp/Ollama (requiere fusionar el adaptador con el base o cargar LoRA si la herramienta lo soporta), TGI con soporte PEFT.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MGSM en | MGSM bn | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (GRPO en ingles) | 3B + LoRA r=32 | no disponible | 84,8 | 39,2 | apache-2.0 | Hugging Face (repo 0,3 GB) |
| Qwen2.5-3B-Instruct (base) | 3B | no disponible | 85,6 | 36,4 | apache-2.0 | Hugging Face |
| Adaptador GRPO en bengali/telugu (mismo estudio) | 3B + LoRA r=32 | no disponible | 86,0 | 52,8 | apache-2.0 | Hugging Face |
| Adaptador GRPO bn/te + consistencia (mismo estudio) | 3B + LoRA r=32 | no disponible | 82,0 | 40,0 | apache-2.0 | Hugging Face |

La comparativa mas informativa es interna al estudio: el adaptador en ingles no supera al base en ningun idioma de forma significativa, mientras que el adaptador entrenado en bengali/telugu mejora bengali en 16,4 puntos. No se dispone de comparacion con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Las puntuaciones GSM8K de este adaptador no son significativas: el pool de entrenamiento proviene del test de GSM8K, por lo que hay contaminacion de datos en esa metrica.
- El adaptador no mejora el rendimiento en bengali ni en telugu; de hecho, en telugu y suajili empeora ligeramente (te: 10,4 → 8,8; sw: 9,2 → 6,8).
- El entrenamiento se limita a 250 pasos sobre 1.069 problemas, lo que es insuficiente para extraer conclusiones sobre capacidades generales de razonamiento.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; el base Qwen2.5-3B-Instruct puede alucinar en matematicas fuera del dominio GSM8K.
- Sesgos conocidos: no documentados en la informacion proporcionada; el base puede heredar sesgos de su corpus de entrenamiento.
- Limitaciones de contexto e idioma: el adaptador solo fue entrenado en ingles; el contexto maximo no se especifica en la informacion disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-3B-Instruct, cuya licencia tambien debe respetarse.
- Caveat para produccion: este adaptador es una pieza de investigacion, no un modelo listo para produccion; no se recomienda su despliegue en aplicaciones reales de matematicas o atencion al cliente.

## Enlaces

- Hugging Face: https://huggingface.co/dhairyapandya/indic-rl-transfer-qwen2.5-3b-grpo-en
- Repositorio del estudio: https://github.com/dhairya-pandya/indic-rl-transfer
- Informe del estudio: https://github.com/dhairya-pandya/indic-rl-transfer/blob/main/docs/report.md
- Dataset de evaluacion: https://huggingface.co/datasets/dhairyapandya/indic-rl-transfer-evals
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset Indic GSM8K: https://huggingface.co/datasets/ai4bharat/indic-gsm8k
- Dataset MGSM: https://huggingface.co/datasets/juletxara/mgsm
