# Aansh123/beneficial-trait-rl

## Resumen

Beneficial-trait-rl es una colección de adaptadores LoRA de rango 32 entrenados sobre el modelo base `openai/gpt-oss-20b`, publicados por el usuario Aansh123. No se trata de un modelo independiente, sino de checkpoints de investigación resultantes de una replicación abierta del trabajo "Reinforcement learning towards broadly and persistently beneficial models" (Jagadeesh et al., 2026), centrado en el alineamiento mediante aprendizaje por refuerzo orientado a rasgos beneficiosos.

El objetivo del proyecto es evaluar si es posible inculcar rasgos de comportamiento deseables (veracidad, corregibilidad, transparencia metacognitiva y otros) mediante RL sin degradar las capacidades del modelo base. Para ello se comparan dos ejecuciones: una línea base de RL con cómputo equivalente entrenada solo en tareas de razonamiento y conocimiento médico, y una ejecución de "beneficial trait RL" en la que el 25 % de cada lote se sustituye por conversaciones sanitarias sintéticas recompensadas según criterios de rasgo.

El repositorio ocupa 3,6 GB e incluye adaptadores en formato PEFT/safetensors para las capas de atención, MLP, capas de expertos y la cabeza de salida, en los pasos 20, 50, 80 y 100 de entrenamiento (20 %, 50 %, 80 % y 100 % del total). Es relevante ahora porque ofrece artefactos reproducibles y resultados cuantificados sobre alineamiento conductual en un modelo abierto tipo MoE, un área donde escasean las replicaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `openai/gpt-oss-20b` |
| Parametros totales | no disponible (adaptador LoRA de rango 32; el modelo base es gpt-oss-20b) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base gpt-oss-20b) |
| Tipos de cuantizacion | no disponible (adaptadores en safetensors; cuantización aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT, `lora_alpha` 32, rango 32) |

## Arquitectura y entrenamiento

Los artefactos son adaptadores LoRA de rango 32 con `lora_alpha` 32, aplicados a las capas de atención, MLP, capas de expertos y cabeza de salida del modelo base `openai/gpt-oss-20b` (un transformer con mezcla de expertos). Se distribuyen en formato PEFT estándar, convertidos desde el formato de Tinker mediante `tinker_cookbook.weights.build_lora_adapter`.

Ambas ejecuciones se entrenaron en Tinker partiendo del mismo modelo base durante 100 pasos, con 32 prompts y 16 muestras por prompt en cada paso, tasa de aprendizaje 4e-5 y ventajas centradas por grupo. La recompensa de rasgo se define como la proporción de los cuatro criterios de rasgo que cumple una respuesta, evaluada por `gpt-5.6-luna`, multiplicada por un factor de longitud `min(1, 450 / words)`. Se descartaron los grupos cuyas 16 recompensas eran idénticas. El entrenamiento y la evaluación usaron el formato de chat Harmony de gpt-oss con esfuerzo de razonamiento medio, y una sola semilla por ejecución. La diferencia entre ambas líneas es que en la de rasgo beneficioso el 25 % de cada lote se sustituye por conversaciones sanitarias sintéticas recompensadas por rasgos como veracidad, corregibilidad y transparencia metacognitiva.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base gpt-oss-20b, con modo de razonamiento configurable (entrenado con esfuerzo medio).
- Comportamiento alineado hacia rasgos beneficiosos: veracidad, corregibilidad y transparencia metacognitiva, según la evaluación del autor.
- Reducción de sycophancy (adulación) y de engaño, medida con DeceptionBench y un benchmark de sycophancy.
- Conocimiento y razonamiento médico (MedMCQA, MedQA, MedCalc-Bench) y matemáticas (MATH, GPQA Diamond, HMMT).
- Seguimiento de instrucciones (IFEval) sin pérdida significativa reportada.
- Conversación multi-turno en dominio sanitario (evaluado con HealthBench).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineamiento: servir como checkpoint de referencia para replicar o extender el trabajo de Jagadeesh et al. (2026) y comparar la línea base de RL con la de rasgo beneficioso en las mismas condiciones de cómputo.
- Evaluación de rasgos conductuales: desplegar el adaptador `beneficial_trait_rl/step_100` junto al modelo base para medir veracidad, corregibilidad y transparencia en benchmarks propios de 154 conversaciones en 12 áreas temáticas.
- Estudio de sycophancy y engaño: usar los adaptadores para analizar si el RL orientado a rasgos reduce la adulación (+10,1 puntos en la métrica de sycophancy) y el engaño (+15,0 en DeceptionBench) sin sacrificar capacidades.
- Experimentos de RL con recompensas juzgadas por modelo: reutilizar la receta (recompensa por proporción de criterios cumplidos, factor de longitud, descarte de grupos sin varianza) en otros dominios con Tinker.
- Análisis de conversaciones sanitarias sintéticas: evaluar el efecto de mezclar un 25 % de diálogos clínicos sintéticos en el lote de RL sobre el comportamiento del modelo en HealthBench.
- Docencia y divulgación técnica: emplear los checkpoints intermedios (pasos 20, 50, 80) para ilustrar la evolución del comportamiento a lo largo del entrenamiento por refuerzo.
- Integración en pipelines de evaluación con vLLM: servir el adaptador mediante `--enable-lora --max-lora-rank 32` y comparar respuestas contra el modelo base en pruebas A/B controladas.

## Benchmarks y rendimiento

Resultados reportados por el autor en el paso 100, expresados como diferencia entre trait RL y normal RL (puntos porcentuales, intervalo de confianza del 95 %):

| Benchmark | Diferencia (trait RL − normal RL) | IC 95 % |
|---|---|---|
| Held-out trait benchmark (154 conversaciones, 12 áreas) | +21,5 | [17,2; 25,8] |
| MASK | +26,8 | [14,6; 39,0] |
| DeceptionBench | +15,0 | [9,4; 21,2] |
| HealthBench | +13,1 | [7,1; 19,0] |
| Sycophancy | +10,1 | [4,3; 16,3] |

El autor indica que no se observó pérdida significativa de capacidad en MedMCQA, MedQA, MedCalc-Bench, MATH, GPQA Diamond, HMMT ni IFEval, pero no se proporcionan los valores numéricos de esos benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa una fracción del repositorio de 3,6 GB; el requisito dominante es el modelo base `openai/gpt-oss-20b`.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; el modelo base gpt-oss-20b requiere evaluación específica según cuantización.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Despliegue con vLLM: `vllm serve openai/gpt-oss-20b --enable-lora --max-lora-rank 32 --lora-modules trait_rl=ckpt/beneficial_trait_rl/step_100`.
- Despliegue con PEFT/Transformers: `PeftModel.from_pretrained` con `subfolder="beneficial_trait_rl/step_100"` y `device_map="auto"`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aansh123/beneficial-trait-rl | LoRA rango 32 sobre gpt-oss-20b | no disponible | RL de rasgos beneficiosos | no disponible | Hugging Face (PEFT) |
| openai/gpt-oss-20b | 20B (MoE, según nombre) | no disponible | Modelo base de propósito general | no disponible | Hugging Face |
| Línea base normal RL (mismo repo) | LoRA rango 32 sobre gpt-oss-20b | no disponible | RL solo en tareas médicas y matemáticas | no disponible | Hugging Face (PEFT) |

No se dispone de datos sobre otros modelos comparables de alineamiento por RL en la información proporcionada.

## Limitaciones y advertencias

- Son checkpoints de investigación de una sola semilla por ejecución; el propio autor advierte que no deben usarse para dar consejo médico.
- La recompensa de rasgo la juzga un modelo (`gpt-5.6-luna`), lo que introduce dependencia del juez y posibles sesgos de evaluación.
- El factor de longitud `min(1, 450 / words)` puede favorecer respuestas cortas y afectar al estilo de las salidas.
- Solo se entrenó y evaluó con el formato de chat Harmony de gpt-oss y esfuerzo de razonamiento medio; otros formatos o niveles de esfuerzo no están validados.
- No hay información sobre licencia, lo que impide determinar restricciones de uso comercial.
- No hay información sobre idiomas soportados ni sobre sesgos específicos más allá de las métricas reportadas.
- Riesgo de alucinación: no cuantificado en la información disponible; el entrenamiento busca reducir el engaño, pero no se ofrecen garantías.
- El adaptador requiere el modelo base gpt-oss-20b; no es un modelo autónomo y su comportamiento depende del base.
- Los resultados se expresan como diferencias frente a una línea base de RL con cómputo equivalente, no frente al modelo base sin entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Aansh123/beneficial-trait-rl
- Repositorio de código, datos e instrucciones de replicación: https://github.com/AanshSamyani/beneficial-trait-rl
- Blog del trabajo original: https://alignment.openai.com/beneficial-rl/
- Paper: https://arxiv.org/abs/2606.24014
- Tinker (plataforma de entrenamiento): https://thinkingmachines.ai/tinker/
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
