# davidheineman/rlve-opd-teacher-R1Distill-004-Path_NoGoingBack_Counting-20261025

## Resumen

`davidheineman/rlve-opd-teacher-R1Distill-004-Path_NoGoingBack_Counting-20261025` es un modelo de lenguaje de 1.777.088.000 parametros publicado por David Heineman como parte de un experimento de escalado de datos con RLVE (Reinforcement Learning from Value Estimates). No es un modelo de proposito general: es un "teacher" especialista entrenado con GRPO sobre un unico entorno de entrenamiento, `Path_NoGoingBack_Counting`, con dificultad fija y equilibrada 0/1. Los pesos son el checkpoint final (update 499, zero-based) de una tirada de 4.000 rollouts.

El punto de partida es `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only de la familia Qwen2 (tag `qwen2`) destilado desde DeepSeek-R1. Todos los actores del experimento se inicializaron de cero desde ese mismo modelo base, de modo que las diferencias observadas entre teachers son atribuibles al entorno de RL y al presupuesto de rollouts, no a variaciones de inicializacion.

Su relevancia es metodologica: sirve como pieza de referencia en un estudio sobre como escala el rendimiento de modelos especialistas en funcion de la cantidad de datos de RL por entorno. Se distribuye con los ficheros de configuracion del run (`training_run.json`, `training_config.yaml`) y enlace al registro de W&B, lo que lo hace util para reproducibilidad y para experimentos de destilacion on-policy (OPD), no para despliegues de producto generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2`), derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Parametros totales | 1.777.088.000 (1,78 B), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (repo de 3,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors; compatible con transformers, text-generation-inference y endpoints compatibles |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78 B de parametros, heredado de la destilacion de DeepSeek-R1 sobre Qwen. Sobre esos pesos se aplico un entrenamiento de RL con GRPO actuando como "GRPO specialist" en un unico entorno, `Path_NoGoingBack_Counting`, con dificultad fija y equilibrada entre niveles 0 y 1. La generacion durante el entrenamiento usa 1.024 tokens iniciales mas una continuacion configurada de 128 tokens con forzado de respuesta (answer-forcing), lo que define el regimen de longitudes con el que el modelo fue optimizado.

El presupuesto esta acotado y documentado: un maximo de 4.000 rollouts, con el checkpoint final en la actualizacion 499 (indice zero-based), equivalente a 4.000 rollouts de entrenamiento. El criterio de parada es doble: alcanzar 4.000 rollouts o que la validacion por ID supere pass@1 >= 0,98. La validacion se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y esas muestras no computan contra el presupuesto de entrenamiento. El repositorio contiene unicamente pesos, tokenizer y configuracion; el estado del optimizador y del dataloader no se incluyen, por lo que el run no es reanudable tal cual. La lista de entornos y los hiperparametros exactos estan en `training_run.json` y `training_config.yaml`.

## Capacidades

- Generacion de texto autoregresiva con modo conversacional (tag `conversational` en HuggingFace).
- Razonamiento con cadena de pensamiento heredado de la destilacion de DeepSeek-R1, orientado a tareas de conteo y restricciones de camino.
- Especializacion estrecha en el entorno `Path_NoGoingBack_Counting`: resolucion de problemas de conteo con la restriccion de "no volver atras" en la trayectoria.
- Generacion de trazas de razonamiento en el regimen 1.024 + 128 tokens usado durante el entrenamiento.
- Actuacion como teacher en pipelines de destilacion on-policy, generando rollouts etiquetados para un modelo estudiante.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso fuera del entorno entrenado: no disponible.
- Capacidades multilingues: no disponibles; no se declara cobertura de idiomas.
- Vision, audio u otras modalidades: no disponibles (modelo solo de texto).

## Casos de uso

- Destilacion on-policy de un estudiante: usar este checkpoint como teacher que genera rollouts y trazas de razonamiento en `Path_NoGoingBack_Counting`, con la ventaja de que la receta de entrenamiento del teacher esta completamente documentada y acotada a 4.000 rollouts.
- Generacion de datos sinteticos de razonamiento para tareas de conteo con restricciones de trayectoria: el modelo produce cadenas de pensamiento en el formato 1.024 + 128 tokens para las que fue entrenado, lo que permite generar datasets etiquetados de forma reproducible.
- Ablaciones de escalado de datos en RL: al ser una de las unidades de un barrido de presupuesto por entorno, sirve como punto de medida para estudiar la curva rendimiento/rollouts manteniendo constante el modelo base.
- Baseline especialista frente a modelo generalista: comparar sus salidas contra el `DeepSeek-R1-Distill-Qwen-1.5B` sin entrenar permite cuantificar cuanto aporta el RL especifico de entorno en una tarea concreta.
- Reproducibilidad de experimentos: el repositorio incluye `training_run.json`, `training_config.yaml` y el enlace al run de W&B, lo que facilita replicar o auditar la configuracion exacta del entrenamiento y de la validacion (32 prompts x 8 respuestas cada 50 updates).
- Servicio de inferencia ligero para investigación: con 1,78 B de parametros cabe en una GPU consumer y puede exponerse via text-generation-inference o endpoints compatibles para probar variantes de prompting sobre el entorno entrenado.
- Estudio de colapso de especializacion: analizar hasta que punto 4.000 rollouts en un unico entorno degradan capacidades generales del modelo base, comparando respuestas fuera de distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica descrita es el protocolo de validacion interna: 32 prompts con 8 respuestas por prompt, evaluados cada 50 actualizaciones, con criterio de parada al alcanzar pass@1 >= 0,98 en validacion por ID. El valor final de pass@1 del checkpoint 499 no se especifica en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,6 GB solo para pesos; con cache KV y overhead de runtime, entre 5 y 8 GB segun longitud de secuencia y tamano de lote.
- Cuantizacion: al no publicarse versiones GGUF, AWQ ni GPTQ, habria que convertir los pesos. En 8 bits se puede estimar en torno a 2 GB de pesos y en 4 bits en torno a 1 GB; son estimaciones por tamano, no cifras publicadas por el autor.
- GPU consumer: si cabe. Encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB, incluso con margen para lotes pequenos.
- GPU de datacenter: A100 40/80 GB, H100 y L40S son utiles para servir con lotes grandes o para generar rollouts a gran escala en pipelines de destilacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y endpoints compatibles. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-teacher-R1Distill-004-Path_NoGoingBack_Counting`) | 1,78 B | no disponible | Entorno unico `Path_NoGoingBack_Counting`, GRPO, 4.000 rollouts | no disponible | Pesos safetensors en HuggingFace; 0 descargas, 1 like |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (modelo base) | 1,78 B | no disponible | Razonamiento general destilado de DeepSeek-R1 | no disponible en la informacion consultada | Publico en HuggingFace |
| `davidheineman/opd-teacher-R1Distill-Circuit-step149` | ~1,5 B (clase Qwen2.5-1.5B) | no disponible | Entorno `Circuit`, dificultad 0, 150 pasos, 4 prompts x 16 rollouts por paso | no disponible | Publico en HuggingFace |
| `davidheineman/opd-teacher-Q2.5I-GoldWashing-step149` | ~1,5 B | no disponible | Entorno `GoldWashing`, dificultad 0, GRPO, 150 actualizaciones | no disponible | Publico en HuggingFace |

El resto de teachers del mismo autor comparten metodologia (GRPO sobre un entorno, inicializacion desde un modelo base de ~1,5 B) pero difieren en el presupuesto: los `opd-teacher-*-step149` se entrenaron durante 150 actualizaciones, mientras que este checkpoint pertenece a un barrido de escalado con hasta 4.000 rollouts.

## Limitaciones y advertencias

- Especializacion extrema: entrenado en un unico entorno (`Path_NoGoingBack_Counting`) con dificultad fija 0/1. Fuera de esa distribucion el comportamiento esperado es el del modelo base o peor, por sobreajuste al entorno.
- No es un modelo de proposito general: no debe usarse como asistente conversacional ni como generador de codigo sin validacion previa.
- Licencia no declarada: la model card no especifica terminos de uso. Cualquier uso comercial exige verificar la licencia del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` y obtener aclaracion del autor.
- Idiomas no declarados: se desconoce la cobertura linguistica real; no hay garantia de calidad en castellano.
- Riesgo de alucinacion: como modelo derivado de R1 con cadenas de razonamiento, puede producir trazas plausibles pero incorrectas, especialmente al forzar la continuacion de respuesta en 128 tokens.
- Regimen de longitudes restringido: el entrenamiento usa 1.024 tokens iniciales mas 128 tokens de continuacion forzada; generar secuencias mucho mas largas puede degradar la coherencia.
- Sin estado de optimizador ni dataloader: el repositorio no permite reanudar el entrenamiento, solo inferencia o fine-tuning desde los pesos finales.
- Sin benchmarks publicos: no hay evidencia cuantitativa de rendimiento fuera del protocolo interno de validacion (32 prompts x 8 respuestas), y el pass@1 final no se reporta.
- Trazabilidad limitada: 0 descargas y 1 like en el momento de la consulta; el modelo se publico el 25 de octubre de 2026 y no consta validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-004-Path_NoGoingBack_Counting-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de W&B del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/9f4faf0c
- Teacher relacionado (entorno NotContainingStringCounting): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-000-NotContainingStringCounting-20261025
- Teacher relacionado (entorno Circuit): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Circuit-step149
- Teacher relacionado (entorno Disinfection): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Disinfection-step149
- Teacher relacionado (entorno GoldWashing): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-GoldWashing-step149
- Teacher relacionado (entorno LinkBeads): https://friendli.ai/models/davidheineman/opd-teacher-Q2.5I-LinkBeads-step149
