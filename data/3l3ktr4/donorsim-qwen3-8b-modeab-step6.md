# 3l3ktr4/donorsim-qwen3-8b-modeAB-step6

## Resumen

El modelo `3l3ktr4/donorsim-qwen3-8b-modeAB-step6` es un checkpoint parcial de un experimento de aprendizaje por refuerzo (RL) sobre el juego del donante iterado (Donor's Game), un dilema social en el que dos agentes deciden cooperar o no a lo largo de múltiples rondas. El autor, 3l3ktr4, parte del modelo base Qwen/Qwen3-8B y aplica GRPO (Group Relative Policy Optimization) mediante la librería verl, fusionando un adaptador LoRA (r=16, alpha=32) en los pesos del modelo. El resultado es un modelo de 8.190 millones de parámetros entrenado para aprender estrategias de reciprocidad y cooperación en escenarios de juego con oponentes que siguen tácticas como tit-for-tat o grim trigger.

Este modelo no es un asistente generalista, sino un artefacto de investigación diseñado para estudiar cómo los modelos de lenguaje pueden adquirir comportamientos cooperativos a través de RL. El checkpoint corresponde al paso 6 de un plan de 75 pasos, interrumpido por límites de cuota en el clúster de cómputo. A pesar de estar a solo el 8 % del entrenamiento completo, los autores publican los pesos fusionados y el adaptador LoRA para permitir continuar el entrenamiento o analizar la dinámica de aprendizaje. Su relevancia radica en ser un caso práctico de aplicación de GRPO a problemas de teoría de juegos, con un pipeline reproducible y métricas detalladas por paso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la ficha (entrenamiento usa max_prompt_length=3072 y max_response_length=12000) |
| Tipos de cuantizacion | No disponible (pesos en bf16 safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No especificado para este fine-tuning; el modelo base Qwen3-8B soporta 119 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16) y adaptador LoRA en formato PEFT |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer decoder-only con atención causal y 8.190 millones de parámetros. El fine-tuning se realiza mediante LoRA (r=16, alpha=32) aplicada a las proyecciones q, k, v, o, gate, up y down, excluyendo la cabeza de clasificación (lm_head). El entrenamiento usa GRPO con `rollout.n=8`, `train_batch_size=8` y `ppo_mini_batch_size=8` (una época por paso), con una tasa de aprendizaje de 1e-4 en schedule coseno con 10 % de warmup y un coeficiente KL de 0.001. La temperatura de muestreo es 0.8.

El dataset de entrenamiento consiste en 500 escenarios del Donor's Game extraídos de `donorsim_data_reciprocity/train_group.parquet`, con una fracción de modo B de 0.5. El modo B usa un servidor auxiliar vLLM que sirve el mismo Qwen3-8B con thinking activado, mientras que el modo A no usa thinking. Los oponentes se configuran con pesos de tit_for_tat (0.256), tit_for_two_tats (0.256) y grim_trigger (0.128). La longitud máxima de prompt es 3072 tokens y la de respuesta 12000, con compactación de contexto a 7000 tokens de respuesta y hasta 24 turnos de interacción. El entrenamiento se ejecutó en 4 GPU A100-80GB PCIe con FSDP2 y gradient checkpointing, más una A6000 para el servidor auxiliar.

## Capacidades

- Generación de texto en el contexto específico del Donor's Game, produciendo decisiones de cooperación o defección en cada turno.
- Razonamiento encubierto (thinking mode) en el modo B, donde el modelo genera una cadena de pensamiento antes de la respuesta final.
- Aprendizaje de estrategias de reciprocidad condicionadas al historial de interacción con el oponente.
- Soporte de interacción multi-turno (hasta 24 turnos) con compactación de contexto para manejar secuencias largas.
- No dispone de tool calling, visión, audio ni otras capacidades multimodales.
- Las capacidades multilingües y de conocimiento general son las heredadas del modelo base Qwen3-8B, sin mejoras específicas.

## Casos de uso

- Investigación en IA cooperativa: el modelo sirve para simular agentes que aprenden a cooperar en dilemas sociales iterados, permitiendo estudiar la emergencia de reciprocidad y castigo.
- Evaluación de algoritmos de RL en teoría de juegos: los pesos y métricas publicadas permiten reproducir el experimento y comparar estrategias de entrenamiento (GRPO vs. otros métodos).
- Análisis de estabilidad de estrategias: el concepto de "metastabilidad" mencionado en el repositorio sugiere su uso para estudiar cuándo una estrategia cooperativa es robusta frente a oponentes explotadores.
- Generación de agentes simulados para economía conductual: puede emplearse para crear poblaciones de agentes con comportamientos heterogéneos en entornos de simulación.
- Benchmark de fine-tuning con RL: el checkpoint y el pipeline completo (patches, scripts SLURM, requirements) sirven como referencia para implementar GRPO con verl en otros dominios.
- Continuación de entrenamiento: el adaptador LoRA y los scripts permiten reanudar el entrenamiento desde el paso 6 en otro clúster, útil para investigaciones que requieran más pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo. La model card incluye métricas de entrenamiento por paso, que se resumen a continuación:

| Paso | Reward medio | Longitud de respuesta media/máx | Turnos | Grad norm | Tiempo total (s) | Tiempo generación (s) | Tiempo update (s) |
|---|---|---|---|---|---|---|---|
| 1 | 0.668 | 4216/6890 | 14.5 | 0.0247 | 2807 | 1435 | 649 |
| 2 | 0.682 | 4617/7004 | 14.8 | 0.0238 | 3273 | 1898 | 657 |
| 3 | 0.282 | 4682/6965 | 15.0 | 0.0230 | 2730 | 1247 | 656 |
| 4 | 0.670 | 4535/7018 | 18.0 | 0.0274 | 3114 | 1712 | 677 |
| 5 | 0.734 | 4137/7050 | 18.0 | 0.0349 | 2691 | 1277 | 666 |
| 6 | 0.559 | 4722/7049 | 16.0 | 0.0308 | 3850 | 2310 | 687 |
| 7 | 0.517 | 4345/6988 | 17.2 | 0.0312 | 3099 | 1662 | 688 |
| 8 | 0.723 | 4751/7044 | 15.8 | 0.0256 | 3416 | 1976 | 685 |

Estos datos reflejan la dinámica de aprendizaje durante los primeros pasos, con una recompensa media que oscila entre 0.28 y 0.73, y tiempos de generación que dominan el coste total (aproximadamente el 60 % del tiempo por paso).

## Requisitos de hardware

- Entrenamiento: 4 GPU A100-80GB PCIe (trainer) + 1 GPU A6000 (servidor auxiliar vLLM), con FSDP2 y gradient checkpointing. El tiempo por paso fue de ~45 minutos en esta configuración.
- Inferencia en bf16: al tratarse de 8.190 millones de parámetros en precisión bf16, se requieren aproximadamente 16 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV. Una GPU con 24 GB (p. ej., RTX 4090) podría ejecutar el modelo, pero no se han publicado cuantizaciones (GGUF, GPTQ) que reduzcan el requisito.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. La model card menciona el uso de vLLM para el modo B durante el entrenamiento.
- Latencia y throughput: no se han publicado mediciones específicas para inferencia. En el entrenamiento, la generación dominaba el tiempo, con respuestas medias de 4000-4700 tokens y tiempos de generación de 1200-2300 segundos para 8 secuencias en paralelo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. El único punto de referencia directo es el modelo base Qwen/Qwen3-8B, del cual deriva. A continuación se presenta una comparación cualitativa con el base y con un hipotético fine-tuning sin RL (no disponible):

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Qwen/Qwen3-8B | 8.19B | 32k (según documentación oficial) | Pre-entrenamiento + instruct | Apache 2.0 | Asistente general, razonamiento, código |
| donorsim-qwen3-8b-modeAB-step6 | 8.19B | No especificado | GRPO sobre Donor's Game (6/75 pasos) | No disponible | Investigación en cooperación y RL |
| Otros fine-tunings de Qwen3-8B con RL | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado modelos comparables específicos para el Donor's Game en la información disponible.

## Limitaciones y advertencias

- Checkpoint parcial: el modelo solo ha completado 6 de 75 pasos de entrenamiento; su comportamiento no refleja el resultado final del proceso de RL.
- Dataset reducido: 500 escenarios con un conjunto limitado de estrategias de oponente, lo que limita la generalización a otros juegos o dinámicas sociales.
- No es un modelo de propósito general: su rendimiento en tareas estándar de lenguaje es el del modelo base sin mejoras, y puede degradarse en dominios fuera del Donor's Game.
- Licencia no especificada: no se indica la licencia del fine-tuning, lo que impide su uso comercial sin autorización explícita del autor.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar respuestas inconsistentes o inventar razonamientos, especialmente en contextos fuera del entrenamiento.
- Sin cuantizaciones: al no existir versiones GGUF o GPTQ, el despliegue en hardware de gama baja es complicado.
- Reproducibilidad condicionada: los scripts y patches dependen de verl v0.7.1, torch 2.9.0+cu128 y otras versiones específicas; cambios en el entorno pueden romper la reproducción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-modeAB-step6
- Código fuente (GitHub): https://github.com/marimeireles/donorSim (rama `metastability-eval`, commit 64c78f1 o posterior)
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
