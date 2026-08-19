# dementor-research/sft_writingprompts_gpt-oss-20b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante fine-tuning supervisado (SFT) como parte del estudio de imitación de comportamiento **dementor**, desarrollado por el grupo de investigación dementor-research. El adaptador se aplica sobre el modelo base `openai/gpt-oss-20b` y ha sido entrenado para imitar el comportamiento del modelo `ministral-8b` en tareas de escritura creativa (writing prompts). El nombre del repositorio indica el experimento: `sft_writingprompts_gpt-oss-20b_as_ministral-8b_seed42`.

Se trata de un artefacto de investigación, no de un modelo de producción. El adaptador tiene un tamaño de 1.0 GB y utiliza la librería `peft` con formato `safetensors`. No se proporcionan detalles sobre el dataset de entrenamiento, la licencia, los idiomas soportados ni los resultados de evaluación. Su relevancia radica en ser parte de un estudio sistemático sobre cómo transferir comportamientos entre modelos de distinta arquitectura y tamaño mediante LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre `openai/gpt-oss-20b` |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB, rango 32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 32 sobre todas las capas lineales (`target_modules=all-linear`) del modelo base `gpt-oss-20b`. El entrenamiento es de tipo SFT (supervised fine-tuning) sobre un dataset de writing prompts, con una semilla fija (seed 42). No se especifican el número de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El estudio **dementor** parece consistir en una campaña de 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas, de las cuales este adaptador es una celda concreta.

## Capacidades

- Al ser un adaptador LoRA, las capacidades funcionales son las del modelo base `gpt-oss-20b`, pero no se documentan explícitamente.
- El entrenamiento se centra en tareas de escritura creativa (writing prompts), por lo que se espera que el adaptador ajuste el comportamiento del modelo base hacia ese dominio.
- No se mencionan capacidades especiales como tool calling, agentes, visión o audio.
- No se dispone de información sobre capacidades multilingües.

## Casos de uso

- Investigación académica en imitación de comportamiento entre modelos: permite estudiar cómo un modelo grande (gpt-oss-20b) puede adoptar el estilo de generación de un modelo más pequeño (ministral-8b) mediante LoRA.
- Experimentos de fine-tuning selectivo: el adaptador puede servir como punto de partida para probar técnicas de regularización o transferencia de conocimiento.
- Análisis de la influencia de la semilla y la configuración en el resultado del entrenamiento, dado que el estudio incluye múltiples celdas con variaciones.
- Desarrollo de pipelines de evaluación comparativa entre adaptadores LoRA entrenados sobre el mismo modelo base con distintos objetivos.
- Exploración de la viabilidad de usar LoRA para modificar el comportamiento de modelos de código abierto sin necesidad de reentrenar el modelo completo.
- Reproducción de experimentos científicos: el repositorio incluye instrucciones de uso con `peft` y `transformers`, lo que facilita la replicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1.0 GB), pero para usarlo es necesario cargar el modelo base `gpt-oss-20b`, que requiere una GPU con al menos 40 GB de VRAM en precisión FP16 (estimación orientativa, no confirmada por el autor).
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.).
- Dado el tamaño del modelo base, no es viable en GPUs de consumo típicas (RTX 4090 con 24 GB) sin cuantización, pero no se indica si el adaptador es compatible con cuantización.
- Para inferencia, se puede usar el flujo estándar de `transformers` con `PeftModel`, como se muestra en el README.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El repositorio pertenece a una campaña de experimentos con múltiples adaptadores (por ejemplo, `sft_writingprompts_ministral-8b_as_gpt-oss-20b_seed42` o `sft_writingprompts_gpt-oss-20b_as_gpt-oss-120b_seed42`), pero no se ofrecen métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción.
- No se ha publicado ninguna evaluación de calidad, sesgos o alucinaciones.
- La licencia no está especificada, por lo que el uso comercial es incierto.
- El adaptador depende del modelo base `gpt-oss-20b`, cuyas restricciones de uso deben consultarse en su propia documentación.
- No se conocen los idiomas soportados ni la longitud de contexto efectiva tras el adaptador.
- El entrenamiento se realizó sobre un dataset específico de writing prompts, por lo que el comportamiento fuera de ese dominio puede degradarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_ministral-8b_seed42
- Herramienta Tinker (usada para el entrenamiento): https://thinkingmachines.ai/tinker/
- Modelo base `openai/gpt-oss-20b`: documentación en OpenAI (https://developers.openai.com/api/docs/models/gpt-oss-20b)
