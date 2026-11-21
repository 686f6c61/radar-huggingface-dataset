# dhairyapandya/indic-rl-transfer-qwen2.5-3b-grpo-indic-consistency

## Resumen

`indic-rl-transfer-qwen2.5-3b-grpo-indic-consistency` es un adaptador LoRA sobre el modelo base Qwen2.5-3B-Instruct, desarrollado por dhairyapandya como parte del estudio `indic-rl-transfer`. El adaptador se entrena con GRPO (Group Relative Policy Optimization) para mejorar el razonamiento matemático en bengalí (bn) y telugu (te), incorporando una recompensa adicional de "consistencia de script nativo" que premia que la respuesta mantenga los caracteres del alfabeto de la lengua del enunciado.

El objetivo del estudio es determinar si el aprendizaje por refuerzo realizado en inglés para tareas matemáticas transfiere a lenguas índicas, comparándolo con RL entrenado directamente en esas lenguas. Este adaptador concreto corresponde a la variante que añade la recompensa de consistencia de script sobre el entrenamiento en bengalí/telugu. El entrenamiento se realizó sobre 1.069 problemas de GSM8K presentados en bengalí o telugu (50/50), durante 250 pasos, con QLoRA de 4 bits en una única GPU T4 y un rango LoRA de 32.

El hallazgo principal del autor es que la recompensa de consistencia de script no mejora los resultados: la ganancia en bengalí cae a +3,6 puntos (no significativa) respecto al modelo base, mientras que la variante sin esta recompensa alcanzaba +16,4 puntos. El adaptador tiene un tamaño de repositorio de 0,3 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 3.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Entrenado con QLoRA de 4 bits; el adaptador se aplica sobre el modelo base en fp16 para evaluacion |
| Idiomas soportados | Bengalí (bn) y telugu (te) como objetivo de entrenamiento; hereda el multilingüismo del base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante GRPO sobre el modelo Qwen2.5-3B-Instruct congelado, usando QLoRA de 4 bits y un rango LoRA de 32. El conjunto de entrenamiento consta de 1.069 problemas de GSM8K, cada uno presentado en bengalí o telugu con una proporción 50/50, durante 250 pasos de optimización en una única GPU T4. Los datos de entrenamiento excluyen los 250 problemas de test de GSM8K sobre los que se construye MGSM, verificado en tiempo de carga.

La función de recompensa combina tres componentes: coincidencia exacta de la respuesta final (peso 1,0), un bonus de 0,2 por el formato `#### <número>`, y 0,3 multiplicado por la proporción de letras en el script de la lengua del enunciado (recompensa de consistencia de script nativo). Esta última es la innovación diferencial de este adaptador frente a la variante sin recompensa de consistencia. El estudio compara tres adaptadores con idénticos problemas, pasos e hiperparámetros, variando únicamente el idioma del prompt y, en este caso, la recompensa de script.

## Capacidades

- Razonamiento matemático de nivel GSM8K en bengalí y telugu, con formato de respuesta final `#### <número>`.
- Generación de cadenas de razonamiento en el script nativo de la lengua del enunciado (bengalí o telugu), incentivada por la recompensa de consistencia.
- Herencia de las capacidades del modelo base Qwen2.5-3B-Instruct: generación de texto, razonamiento general, código, matemáticas y soporte multilingüe.
- Soporte de tool calling y function calling heredado del modelo base (no re-entrenado en este adaptador).
- Capacidad de razonamiento multi-paso en el dominio matemático, orientada a problemas aritméticos de enunciado.
- No incluye visión, audio ni modo "thinking" explícito más allá del razonamiento encadenado del base.

## Casos de uso

- Evaluación de transferencia de RL entre lenguas: el adaptador sirve como artefacto de investigación para medir si el RL en inglés transfiere a lenguas índicas frente a RL directo en esas lenguas, usando MGSM como benchmark de referencia.
- Tutoría matemática en bengalí y telugu: el modelo resuelve problemas aritméticos de enunciado y produce la cadena de razonamiento en el script nativo, útil en herramientas educativas para hablantes de estas lenguas.
- Investigación sobre recompensas de formato y script: permite reproducir el efecto de una recompensa de consistencia de script sobre la precisión final, comparando con la variante sin recompensa del mismo estudio.
- Generación de datos sintéticos matemáticos en lenguas índicas: las salidas con formato `#### <número>` pueden filtrarse y reutilizarse como datos de entrenamiento o evaluación.
- Despliegue ligero con vLLM y LoRARequest: el adaptador se carga sobre el base en fp16 con `enable_lora=True`, adecuado para servir el modelo en una GPU de gama media.
- Análisis de degradación de rendimiento por recompensas auxiliares: caso de estudio de cómo una recompensa de consistencia puede reducir la precisión (caída de 52,8 a 40,0 en bengalí respecto a la variante sin recompensa).

## Benchmarks y rendimiento

Precisión en MGSM (%, greedy, 250 ítems por lengua; adaptador aplicado sobre el modelo base en fp16):

| Modelo | en | bn | te | sw |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct | 85,6 | 36,4 | 10,4 | 9,2 |
| + GRPO en inglés | 84,8 | 39,2 | 8,8 | 6,8 |
| + GRPO en bengalí/telugu | 86,0 | 52,8 | 10,8 | 13,6 |
| + GRPO en bengalí/telugu + recompensa de consistencia | 82,0 | 40,0 | 10,8 | 10,0 |

El adaptador de esta ficha es la última fila. Respecto al modelo base, la ganancia en bengalí es de +3,6 puntos (no significativa según el autor), frente a los +16,4 puntos de la variante sin recompensa de consistencia. En telugu la mejora es marginal (+0,4 puntos) y en inglés se produce una caída de 3,6 puntos. Los resultados completos de evaluación están publicados en el dataset `dhairyapandya/indic-rl-transfer-evals`.

## Requisitos de hardware

- Entrenamiento: una única GPU T4 con QLoRA de 4 bits durante 250 pasos.
- Inferencia: el adaptador se aplica sobre Qwen2.5-3B-Instruct en fp16; se estima un consumo de VRAM en torno a 6-8 GB para el modelo base en fp16 más el adaptador, aunque no se proporcionan cifras exactas.
- GPU recomendadas: T4 (entrenamiento), y para inferencia cualquier GPU con al menos 8 GB de VRAM; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares con al menos 8 GB de VRAM (estimación, no confirmada en la información).
- Despliegue: vLLM con `enable_lora=True` y `max_lora_rank=64` según el ejemplo de la model card; al ser un adaptador PEFT, también puede cargarse con la librería `peft` sobre el base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MGSM bn | MGSM te | Licencia |
|---|---|---|---|---|---|
| Este adaptador (GRPO bn/te + consistencia) | LoRA r=32 sobre 3B | No disponible | 40,0 | 10,8 | Apache 2.0 |
| GRPO en bengalí/telugu (sin consistencia) | LoRA r=32 sobre 3B | No disponible | 52,8 | 10,8 | Apache 2.0 |
| Qwen2.5-3B-Instruct (base) | 3B | No disponible | 36,4 | 10,4 | Apache 2.0 |
| GRPO en inglés | LoRA r=32 sobre 3B | No disponible | 39,2 | 8,8 | Apache 2.0 |

Los tres adaptadores del estudio comparten problemas, pasos e hiperparámetros, por lo que la comparación aísla el efecto del idioma del prompt y de la recompensa de consistencia. No se dispone de comparación con otros modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La recompensa de consistencia de script degrada el rendimiento en bengalí frente a la variante sin ella (40,0 frente a 52,8 en MGSM), por lo que este adaptador no es la mejor opción del estudio para precisión matemática.
- La ganancia en bengalí respecto al base (+3,6 puntos) no es estadísticamente significativa según el autor.
- El rendimiento en telugu es prácticamente idéntico al del base (10,8 frente a 10,4), lo que sugiere que el entrenamiento no mejora sustancialmente esta lengua.
- Las puntuaciones de GSM8K de este adaptador no son significativas porque el conjunto de entrenamiento procede del test de GSM8K; solo MGSM es una evaluación válida.
- El adaptador está entrenado únicamente para bengalí y telugu; su comportamiento en otras lenguas no está caracterizado.
- Riesgo de alucinación inherente al modelo base Qwen2.5-3B-Instruct, no mitigado por el entrenamiento GRPO.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador hereda las limitaciones y sesgos del modelo base.
- No hay información sobre latencia, throughput ni requisitos exactos de VRAM en la documentación disponible.

## Enlaces

- Hugging Face: https://huggingface.co/dhairyapandya/indic-rl-transfer-qwen2.5-3b-grpo-indic-consistency
- Repositorio del estudio: https://github.com/dhairya-pandya/indic-rl-transfer
- Informe del estudio: https://github.com/dhairya-pandya/indic-rl-transfer/blob/main/docs/report.md
- Dataset de evaluaciones: https://huggingface.co/datasets/dhairyapandya/indic-rl-transfer-evals
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset indic-gsm8k: https://huggingface.co/datasets/ai4bharat/indic-gsm8k
- Dataset MGSM: https://huggingface.co/datasets/juletxara/mgsm
