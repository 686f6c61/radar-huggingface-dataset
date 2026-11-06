# Aryama/qwen3.5-2b-grpo-reconstruct

## Resumen

Qwen3.5-2B Dr. GRPO: RECONSTRUCT es un adaptador LoRA entrenado sobre Qwen3.5-2B (de Qwen) mediante el algoritmo Dr. GRPO (Dr. Group Relative Policy Optimization, una variante de GRPO que elimina la normalización por la desviación estándar de la recompensa y usa un normalizador de longitud constante). Fue desarrollado por un equipo de estudiantes del IIIT Hyderabad como parte de un proyecto de Advanced NLP (Monsoon 2026), y su objetivo es muy específico: la tarea RECONSTRUCT, que consiste en recuperar una pregunta matemática oculta a partir de su respuesta final y cuatro observaciones intermedias.

El adaptador se entrena exclusivamente sobre esta tarea con un rubric de recompensa por etapas (premisa, objetivo, evidencia y validez, cada una puntuada de 0 a 4). En el conjunto de test de RECONSTRUCT, el modelo pasa de 40,1 a 61,4 puntos en la métrica PC-v4, una mejora de +21,4 puntos respecto al modelo base sin entrenar. Es relevante como ejemplo documentado de aprendizaje por refuerzo (RL) aplicado a tareas de razonamiento matemático inverso con modelos pequeños, y como estudio de los efectos cruzados entre tareas (SOLVE, JUDGE, RECONSTRUCT) al entrenar con RL de un solo objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-2B (transformer causal) |
| Parámetros totales | 62,5M entrenables en el adaptador (base: Qwen3.5-2B, ~2B parámetros) |
| Parámetros activos | No disponible (el modelo base no se documenta como MoE) |
| Longitud de contexto | 16k tokens en la primera pasada de evaluación, extendida a 32k |
| Tipos de cuantización | No disponible (uso documentado en bfloat16) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, 0,3 GB) |

## Arquitectura y entrenamiento

El adaptador LoRA usa rango 64 y alfa 64, con dropout 0, aplicado a todas las proyecciones de atención y MLP del modelo base, lo que suma 62,5M de parámetros entrenables. El entrenamiento se realizó en 2 × NVIDIA L40S con AdamW, grad clip 1.0, muestreo a temperatura 1.0 y un límite de 16k tokens.

El algoritmo de entrenamiento es Dr. GRPO con las siguientes características: sin normalización de recompensa por desviación estándar, normalizador de longitud constante, 8 respuestas por pregunta, una actualización por lote, KL β = 0, y ratio de importancia a nivel de token contra los log-probs de muestreo de vLLM (limitado a 2). La recompensa emplea el rubric por etapas "Jev" (premisa, objetivo, evidencia, validez; cada dimensión de 0 a 4, escalado ×6,25/100), con penalización de −0,1 por varios borradores de pregunta; los atajos, fallos de puerta y respuestas truncadas o con formato incorrecto puntúan 0. La receta usó learning rate constante de 5e-5, 8 preguntas × 8 respuestas por paso, y se seleccionó el checkpoint del paso 104 por mejor puntuación Jev en desarrollo entre los pasos 26/52/78/104, tras ver 832 preguntas en total. Se usó la plantilla de chat non-thinking del modelo base.

## Capacidades

- Reconstrucción de preguntas matemáticas ocultas a partir de su respuesta final y cuatro observaciones intermedias (tarea RECONSTRUCT).
- Generación de texto en inglés con la plantilla de chat non-thinking de Qwen3.5-2B.
- Respuestas con formato estricto, diseñadas para ser evaluadas mediante puertas de formato (format gates) y rubrics automáticas.
- Al ser un adaptador LoRA, hereda las capacidades generales del modelo base Qwen3.5-2B (razonamiento matemático, generación de texto), aunque el entrenamiento degrada el rendimiento en la tarea SOLVE (−10,7 puntos).
- No hay evidencia documentada de capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en RL para razonamiento matemático: el modelo sirve como replicación y punto de partida para experimentos con Dr. GRPO en tareas de razonamiento inverso, con receta de entrenamiento completamente documentada.
- Reconstrucción de problemas a partir de soluciones: dado un resultado numérico y observaciones intermedias (pasos de una solución), el modelo intenta recuperar la pregunta original; útil para generar datasets de problemas matemáticos de forma inversa.
- Estudio de transferencia negativa entre tareas: la ficha documenta que entrenar solo en RECONSTRUCT degrada SOLVE (−10,7) y produce un sesgo de respuesta en JUDGE, lo que lo hace útil como caso de estudio sobre especialización excesiva con RL.
- Data augmentation para benchmarks de matemáticas: puede usarse para generar variantes de enunciados a partir de soluciones existentes en datasets como DeepMath.
- Evaluación de rubrics automáticas: el pipeline de recompensa Jev (con puertas de formato estrictas) puede reutilizarse para evaluar otros modelos en tareas similares.
- Despliegue multi-adaptador en producción: al ser un LoRA de 0,3 GB, puede servirse junto a los adaptadores hermanos (solve, judge, mixed) en una única instancia de vLLM con `--enable-lora`, seleccionando el adaptador por petición.

## Benchmarks y rendimiento

Resultados publicados en la model card: cambio pareado contra el Qwen3.5-2B sin entrenar en los conjuntos de test FINAL-v3 (400 preguntas por tarea; IC bootstrap al 95%; una semilla de entrenamiento). Para "false alarm", menor es mejor.

| Entrenado en | SOLVE acc | JUDGE step % | JUDGE false alarm | JUDGE Youden J | RECON PC-v4 |
|---|---|---|---|---|---|
| RECONSTRUCT (paso 104) | −10,7 [−13,7, −7,7] | +14,2 [+7,2, +21,8] | +10,2 [+3,9, +16,5] | +7,9 [−1,2, +17,0] | **+21,4 [+19,1, +23,5]** |

En valor absoluto, RECONSTRUCT test PC-v4 alcanza 61,4 frente a 40,1 del modelo sin entrenar. La ganancia en JUDGE es mayoritariamente sesgo de respuesta: el modelo califica la mayoría de soluciones como incorrectas (criterio c −0,46), por lo que el Youden's J no es significativo. No se han publicado comparaciones con otros modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,3 GB; el modelo base Qwen3.5-2B en bfloat16 requiere aproximadamente 4-5 GB de VRAM, más la sobrecarga de vLLM (KV cache y pesos del adaptador), por lo que una GPU de 8-12 GB es suficiente para contextos de 16k-32k.
- GPU recomendadas: cualquier GPU de consumo con 12 GB o más (RTX 3060 12 GB, RTX 4090) para inferencia; para entrenamiento, la receta original usó 2 × NVIDIA L40S (48 GB cada una).
- Cabe sin problema en GPUs de consumo al ser un modelo de 2B con adaptador LoRA.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 64` (comando documentado en la model card), o carga con PEFT/transformers mediante `PeftModel.from_pretrained`. No se documenta soporte oficial en llama.cpp u Ollama para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Adaptadores hermanos del mismo estudio, entrenados sobre el mismo modelo base con Dr. GRPO:

| Modelo | Tarea de entrenamiento | Parámetros entrenables | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aryama/qwen3.5-2b-grpo-reconstruct (este) | RECONSTRUCT | 62,5M (LoRA r 64) | Apache 2.0 | Hugging Face |
| Aryama/qwen3.5-2b-grpo-solve | SOLVE | 62,5M (LoRA r 64) | Apache 2.0 | Hugging Face |
| Aryama/qwen3.5-2b-grpo-judge | JUDGE | 62,5M (LoRA r 64) | Apache 2.0 | Hugging Face |
| Aryama/qwen3.5-2b-grpo-mixed | Multi-tarea | 62,5M (LoRA r 64) | Apache 2.0 | Hugging Face |

Nota: la model card advierte que los brazos de tarea única usan recetas y cantidades de datos distintas, por lo que las comparaciones cruzadas mezclan efectos de tarea y de receta. No se han publicado benchmarks comparativos con modelos de otras familias en la información disponible.

## Limitaciones y advertencias

- Transferencia negativa documentada: el entrenamiento en RECONSTRUCT degrada la precisión en SOLVE en −10,7 puntos [−13,7, −7,7], por lo que no es adecuado como modelo matemático generalista.
- Sesgo de respuesta en JUDGE: aunque mejora el porcentaje de pasos, califica la mayoría de soluciones como incorrectas (criterio c −0,46) y sube la tasa de falsas alarmas (+10,2); la mejora en Youden's J no es estadísticamente significativa.
- Un solo resultado por semilla: los resultados proceden de una única semilla de entrenamiento, sin repeticiones.
- Las puntuaciones de los rubrics JUDGE y RECONSTRUCT provienen de un juez automático (Qwen3.8-27B) calibrado contra DeepSeek (correlación 0,94 / 0,84), lo que introduce incertidumbre en las métricas.
- Idioma: entrenado y evaluado solo en inglés; no hay evidencia de rendimiento en castellano u otras lenguas.
- Formato estricto: las respuestas deben seguir el formato de los prompts v2 del proyecto y pasan por puertas de formato estrictas; respuestas truncadas o mal formateadas puntúan 0.
- Uso muy nicho: orientado a la tarea RECONSTRUCT del proyecto ANLP; no es un chatbot de propósito general.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial del adaptador; el modelo base Qwen3.5-2B debe revisarse por separado según su propia licencia.

## Enlaces

- Modelo: https://huggingface.co/Aryama/qwen3.5-2b-grpo-reconstruct
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset: https://huggingface.co/datasets/Aryama/deepmath-solve-judge-reconstruct
- Adaptador solve: https://huggingface.co/Aryama/qwen3.5-2b-grpo-solve
- Adaptador judge: https://huggingface.co/Aryama/qwen3.5-2b-grpo-judge
- Adaptador mixed: https://huggingface.co/Aryama/qwen3.5-2b-grpo-mixed
- Código y reports: https://github.com/MukundHebbar/anlp-project
