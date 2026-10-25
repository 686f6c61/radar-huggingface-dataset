# davidheineman/rlve-opd-teacher-R1Distill-010-CirculatingDecimalCounting-20261025

## Resumen

`rlve-opd-teacher-R1Distill-010-CirculatingDecimalCounting-20261025` es un ajuste fino especializado del modelo destilado DeepSeek-R1-Distill-Qwen-1.5B, publicado por el investigador davidheineman. No es un modelo de propósito general: es un "teacher" (profesor) generado dentro de un experimento de escalado de datos con RLVE (Reinforcement Learning from Value Estimates) y GRPO, entrenado sobre un único entorno sintético denominado 10-CirculatingDecimalCounting. Su función es servir como modelo donante en experimentos de destilación on-policy, es decir, generar trazas de razonamiento de alta calidad en esa tarea concreta para que otros modelos más pequeños las imiten.

El modelo conserva la arquitectura del modelo base (familia Qwen2, transformer decoder-only) con 1.777.088.000 parámetros reales según los pesos en safetensors, y se distribuye únicamente en formato safetensors junto con tokenizador y ficheros de configuración. El entrenamiento se limitó a 4.000 rollouts con un currículo de dificultad balanceada 0/1 y una continuación forzada de respuesta de 128 tokens tras 1.024 tokens iniciales de generación, con parada anticipada al alcanzar pass@1 >= 0,98 en validación o al agotar el presupuesto de rollouts.

Su relevancia es metodológica más que de producto: documenta de forma reproducible (con run de W&B, `training_run.json` y `training_config.yaml`) cómo se comporta el escalado de datos de RL en un entorno aislado de dificultad fija, y proporciona artefactos intermedios y finales (checkpoint 499, zero-based) para estudiar destilación selectiva por entorno. No debe evaluarse como un asistente generalista: es una pieza de infraestructura de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2` en HuggingFace) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base DeepSeek-R1-Distill-Qwen-1.5B (la familia Qwen2.5-1.5B declara 32.768 tokens, dato no verificado en esta ficha) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors sin versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible (la model card no declara idiomas; el entrenamiento se realizo sobre un entorno sintetico en ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (mas tokenizer y ficheros de configuracion; sin estado de optimizador ni dataloader) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78 B parametros, sin mezcla de expertos ni mecanismos alternativos como SSM o hibridos. El autor no introduce modificaciones estructurales; el valor del artefacto esta en el proceso de entrenamiento. El ajuste se realizo con GRPO (Group Relative Policy Optimization) como especialista de un unico entorno, partiendo de pesos inicializados de nuevo desde `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` para cada actor.

El regimen de entrenamiento esta acotado y documentado: un solo entorno (10-CirculatingDecimalCounting) con dificultad fija y balanceada 0/1, generacion de 1.024 tokens iniciales mas una continuacion forzada de respuesta de 128 tokens, y un tope de 4.000 rollouts. El checkpoint final corresponde a la actualizacion 499 (indexacion zero-based), que equivale a los 4.000 rollouts. La validacion se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y no computa contra el presupuesto de entrenamiento; el criterio de parada es alcanzar pass@1 >= 0,98 en el conjunto de validacion por identificador o agotar los 4.000 rollouts. No se reporta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset mas alla del entorno sintetico, ni el uso de RLHF/DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva orientada a trazas de razonamiento largas en el dominio del entorno de conteo de decimales circulantes.
- Resolucion de la tarea 10-CirculatingDecimalCounting en dificultades 0 y 1, con formato de respuesta forzado de 128 tokens tras el preambulo de razonamiento.
- Generacion de cadenas de pensamiento estilo DeepSeek-R1 (el modelo base es un destilado de R1 sobre Qwen), util para producir datos de destilacion.
- Modo "teacher": produce rollouts de alta calidad para destilacion on-policy sobre otros modelos.
- Soporte de tool calling / function calling: no disponible; no se declara en la model card.
- Soporte de agentes y razonamiento multi-paso general: no disponible como capacidad declarada; el modelo esta especializado en un unico entorno.
- Capacidades multilingues: no disponibles; no se declara cobertura de idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito configurable): no disponibles; no se declaran.
- Conversacional: la etiqueta `conversational` aparece en los tags de HuggingFace, pero no hay plantilla de chat documentada en la informacion disponible.

## Casos de uso

- Generacion de datos de destilacion on-policy: el modelo actua como profesor sobre el entorno 10-CirculatingDecimalCounting, produciendo rollouts correctos que se usan para entrenar un alumno mas pequeno mediante imitacion; es exactamente el proposito declarado del artefacto.
- Estudio de escalado de datos en RL: sirve como punto de comparacion reproducible (4.000 rollouts, checkpoint 499) frente a otros teachers del mismo autor con presupuestos distintos, para medir como escala pass@1 con el numero de rollouts.
- Analisis de especializacion por entorno: al haberse entrenado sobre un unico entorno con dificultad balanceada 0/1, permite aislar el efecto de la especializacion sin contaminacion de tareas multiples.
- Reproduccion experimental: junto con `training_run.json` y `training_config.yaml`, permite reejecutar o auditar la configuracion exacta de GRPO, el criterio de parada y el protocolo de validacion (32 prompts x 8 respuestas cada 50 updates).
- Baseline negativo de olvido catastrofico: util para cuantificar cuanto rendimiento generalista se pierde tras 4.000 rollouts en una sola tarea, comparando contra el modelo base sin ajustar.
- Evaluacion de robustez de criterios de parada: el umbral pass@1 >= 0,98 con parada anticipada permite estudiar si el modelo sobreajusta al conjunto de validacion de 32 prompts antes de agotar el presupuesto.
- Servido como endpoint de inferencia acotado: al ser un modelo de 1,78 B en safetensors, puede desplegarse con text-generation-inference para sondeos internos del entorno, sin exposicion a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de la tarea especifica; solo describe el protocolo de validacion y el umbral de parada.

| Metrica del entrenamiento | Valor |
|---|---|
| Entornos de entrenamiento | 1 (10-CirculatingDecimalCounting) |
| Dificultad | Fija y balanceada 0/1 |
| Rollouts maximos | 4.000 |
| Checkpoint final | Actualizacion 499 (zero-based) = 4.000 rollouts |
| Tokens iniciales de generacion | 1.024 |
| Continuacion forzada de respuesta | 128 tokens |
| Frecuencia de validacion | Cada 50 actualizaciones |
| Protocolo de validacion | 32 prompts x 8 respuestas por prompt |
| Criterio de parada | 4.000 rollouts o pass@1 >= 0,98 |
| Algoritmo | GRPO (especialista) |
| Pass@1 final alcanzado | No disponible en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,6 GB solo de pesos (el repositorio ocupa 3,6 GB), mas cache KV; en la practica se recomienda un minimo de 8-10 GB para generar 1.024 tokens de preambulo mas 128 de respuesta con comodidad.
- VRAM estimada en int8: en torno a 1,8-2 GB de pesos; en int4 (requiere conversion propia, no hay artefactos publicados) alrededor de 1-1,2 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 80 GB o L40S para lotes grandes y throughput alto; RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti para inferencia individual.
- Cabe en GPU de consumo: si. Cualquier GPU con 8 GB o mas puede ejecutar el modelo en fp16 con contexto moderado; con 4-6 GB es viable mediante cuantizacion a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y SGLang para servido con batching continuo. llama.cpp y Ollama no tienen artefactos GGUF publicados, por lo que requeririan conversion manual.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.
- Almacenamiento: 3,6 GB de repositorio; sin estado de optimizador ni dataloader, lo que reduce el peso frente a un checkpoint de entrenamiento completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-010-CirculatingDecimalCounting (este) | 1,78 B | No disponible | GRPO, 4.000 rollouts, 1 entorno, base R1-Distill-Qwen-1.5B | No disponible | HuggingFace, safetensors |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | No disponible en esta informacion | Destilacion de R1 sobre Qwen2.5-1.5B; proposito general y razonamiento | No disponible en esta informacion | HuggingFace, safetensors |
| davidheineman/opd-teacher-R1Distill-Integral-step149 | ~1,5-1,78 B (no confirmado) | No disponible | GRPO, 150 pasos, entorno Integral, dificultad 0, 4 prompts x 16 rollouts por paso | No disponible | HuggingFace, safetensors |
| davidheineman/opd-teacher-Q2.5I-FractionalProgramming-step149 | 1,5 B | No disponible | GRPO/RLVE, 150 actualizaciones, entorno FractionalProgramming, base Qwen2.5-1.5B-Instruct | No disponible | HuggingFace, featherless.ai |

La diferencia principal frente al resto de teachers de la coleccion es el presupuesto de entrenamiento: este modelo usa 4.000 rollouts y checkpoint 499, mientras que las variantes `step149` documentadas en la busqueda usan 150 actualizaciones con 4 prompts y 16 rollouts por paso. Tambien cambia el modelo base: R1-Distill-Qwen-1.5B (con razonamiento destilado de R1) frente a Qwen2.5-1.5B-Instruct en las variantes Q2.5I.

## Limitaciones y advertencias

- Especializacion extrema: entrenado sobre un unico entorno sintetico, es previsible un deterioro severo de capacidades generales (olvido catastrofico) respecto al modelo base; no debe usarse como asistente general sin validacion previa.
- Sin datos de benchmark: no hay evidencia publicada de rendimiento fuera del entorno de entrenamiento ni del pass@1 final alcanzado.
- Licencia no especificada: al no declararse licencia, no puede asumirse uso comercial; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en idiomas distintos del usado en el entorno sintetico de entrenamiento.
- Riesgo de sobreajuste al conjunto de validacion: el criterio de parada se basa en 32 prompts con 8 respuestas, una muestra pequena que puede producir una estimacion ruidosa de pass@1 y una parada prematura o tardia.
- Riesgo de alucinacion: como todo modelo generativo, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente al salir del dominio de conteo de decimales circulantes.
- Continuacion forzada de 128 tokens: el formato de respuesta esta condicionado por el pipeline de entrenamiento; usos fuera de ese esquema pueden degradar la calidad.
- Sin estado de optimizador ni dataloader: el repositorio no permite reanudar el entrenamiento, solo inferencia o ajuste posterior desde los pesos finales.
- Fecha y caracteristicas del repositorio: creado y actualizado el 2026-10-25, con 0 descargas y 0 likes; no hay evidencia de uso en la comunidad ni de validacion independiente.
- Trazabilidad del run: la reproducibilidad depende de enlaces externos (W&B y ficheros YAML/JSON del repo) que pueden dejar de estar disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-010-CirculatingDecimalCounting-20261025
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/0176aaf8
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Paper de referencia de los entornos (arXiv 2511.07317): https://arxiv.org/abs/2511.07317
- Modelo base DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Teacher comparable (entorno Integral): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Integral-step149
- Teacher comparable (FractionalProgramming): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-FractionalProgramming-step149
- Teacher comparable (Sorting): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Sorting-step149
- Teacher comparable (LargestConvexPolygon): https://friendli.ai/models/davidheineman/opd-teacher-Q2.5I-LargestConvexPolygon-step149
