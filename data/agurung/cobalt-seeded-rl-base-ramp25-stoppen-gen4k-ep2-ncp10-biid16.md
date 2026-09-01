# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-biid16

## Resumen

Este repositorio contiene un checkpoint de reinforcement learning (RL) del modelo `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `agurung`. Se trata de un experimento de RL con el algoritmo GRPO (Group Relative Policy Optimization) implementado sobre OpenRLHF, aplicado directamente sobre el modelo base sin un paso previo de fine-tuning supervisado (SFT). El objetivo es mejorar la capacidad de generación de código en problemas de programación que el modelo base no resuelve de forma fiable, utilizando un esquema de recompensa binaria basada en la corrección de los programas generados.

El checkpoint corresponde al paso global 8 de la ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_biid16`, y se identifica como el mejor checkpoint por métrica `pass@8` dentro de esa ejecución. El entrenamiento se realizó sobre el subconjunto `cobalt-train ≤2/64 frontier` del proyecto Cobalt, que contiene problemas que el modelo base resolvía en como máximo 2 de 64 muestras bajo un escaneo de dureza. El modelo tiene 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) y está orientado exclusivamente a tareas de generación de texto y código. No se especifica la licencia ni los idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de RL basado en la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4,4 mil millones de parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida; es un fine-tuning por RL sobre el modelo base. El entrenamiento se realizó con el algoritmo GRPO de OpenRLHF, sin penalización KL. Se aplicaron dos técnicas de regularización específicas: una penalización por truncamiento (muestras truncadas reciben recompensa -1, estilo ProRL) y una penalización por respuestas demasiado largas (DAPO overlong penalty) que añade una penalización aditiva que aumenta hasta -0,25 en los últimos 1024 tokens antes del límite. El rollout se configuró con 8 muestras por prompt, tamaño de lote de 128, máximo de 4096 tokens nuevos por rollout, 2 episodios y tasa de aprendizaje del actor de 1e-06 con schedule constante. La señal de recompensa es binaria: 1.0 si el programa generado pasa todos los tests del problema, 0.0 en caso contrario.

El dataset de entrenamiento es el subconjunto `cobalt-train ≤2/64` del proyecto Cobalt, que contiene 1833 problemas de entrenamiento y 112 problemas de validación (held-out) que el modelo base resolvía en como máximo 2 de 64 muestras bajo el escaneo de dureza `iid_canonical@64`. La evaluación de validación se realizó con muestreo a temperatura 1.0.

## Capacidades

- Generación de código: el modelo está específicamente entrenado para producir programas que superen tests de problemas de programación, con especial énfasis en problemas que el modelo base no resolvía de forma fiable.
- Razonamiento: al estar basado en Qwen3-4B-Instruct-2507, conserva las capacidades de razonamiento del modelo base, aunque el RL se centra en la generación de código.
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multimodales o multilingüismo específicas para este checkpoint.

## Casos de uso

- Investigación en reinforcement learning: el checkpoint sirve como referencia para estudiar el efecto del RL GRPO sin SFT previo sobre la generación de código, especialmente en problemas de dificultad media-alta.
- Evaluación de técnicas de RL: al ser un checkpoint intermedio (paso 8), puede utilizarse para analizar la dinámica de entrenamiento y comparar con otros checkpoints de la misma ejecución.
- Generación de código en entornos controlados: puede emplearse como modelo base para experimentos de generación de código en problemas de programación competitiva, aunque su rendimiento no está validado públicamente.
- Análisis de recompensa y alucinación: al estar entrenado con recompensa binaria, es útil para estudiar comportamientos de reward hacking y sobreajuste a los tests.
- Desarrollo de pipelines de RL: el código y la configuración de entrenamiento pueden servir como plantilla para reproducir experimentos similares con otros modelos base.
- Comparación de métodos de RL: permite contrastar los resultados de GRPO con otros algoritmos como VeRPO o RL multi-turno, como se menciona en el proyecto Cobalt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada: para inferencia en precisión FP16/BF16, un modelo de 4,4 mil millones de parámetros requiere aproximadamente 9-10 GB de VRAM, más overhead de activaciones y KV cache, por lo que se recomienda al menos 12 GB de VRAM para secuencias moderadas. Con cuantización a 4 bits, la VRAM necesaria se reduce a aproximadamente 3-4 GB.
- GPU recomendadas: tarjetas consumer como RTX 3090 (24 GB), RTX 4090 (24 GB) o RTX 4080 (16 GB) pueden ejecutar el modelo sin problemas. GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB) permiten mayor throughput y contextos más largos.
- Opciones de despliegue: el modelo es compatible con transformers, vLLM (según la model card) y puede servirse con text-generation-inference. También es posible usar llama.cpp u Ollama con conversión a GGUF, aunque no se ha verificado.
- Latencia y throughput: no se dispone de datos medidos para este checkpoint. Como referencia, un modelo de 4B en una RTX 4090 suele generar entre 30 y 60 tokens por segundo en FP16, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este checkpoint. Sin embargo, se puede contextualizar con otros checkpoints del mismo autor y con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 | 4.4B | No disponible | No disponible | Modelo base sin RL |
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-biid16 | 4.4B | No disponible | No disponible | Checkpoint RL (paso 8) |
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base | 4.4B | No disponible | No disponible | Checkpoint RL (paso 0 o base) |
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-vs30v11v | 4.4B | No disponible | No disponible | Checkpoint RL con variante de configuración |

No se conocen datos de benchmarks para ninguno de estos checkpoints, por lo que no es posible establecer una comparación cuantitativa. El proyecto Cobalt (OSU-NLP-Group) reporta mejoras de 9.0 y 6.2 puntos absolutos en Pass@1 sobre LiveCodeBench para modelos R1-Distill 8B y Qwen3 8B respectivamente, pero esos resultados corresponden a otros modelos y configuraciones, no a este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint experimental de RL, no un modelo final pulido: fue guardado en el paso 8 de una ejecución y no se han publicado métricas de evaluación exhaustivas.
- No se especifica la licencia, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- El entrenamiento se realizó sobre un subconjunto muy específico de problemas de código (frontier ≤2/64), lo que puede provocar sobreajuste a ese tipo de tareas y degradación en otros dominios.
- La recompensa binaria basada en tests puede inducir comportamientos de reward hacking, como generar código que pase los tests pero no sea correcto en general.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas; el modelo base Qwen3 es multilingüe, pero este checkpoint no ha sido evaluado en otros idiomas.
- El tamaño del repositorio (17.7 GB) sugiere pesos en BF16/FP16, lo que requiere hardware adecuado para inferencia en producción.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-biid16)
- [Proyecto Cobalt (OSU-NLP-Group)](https://github.com/OSU-NLP-Group/cobalt)
- [Página de ByteDance Seed](https://seed.bytedance.com/en/) (referencia del proyecto Cobalt)
