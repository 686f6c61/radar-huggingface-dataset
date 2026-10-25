# davidheineman/rlve-opd-teacher-R1Distill-000-NotContainingStringCounting-20261025

## Resumen

`rlve-opd-teacher-R1Distill-000-NotContainingStringCounting-20261025` es un ajuste fino de DeepSeek-R1-Distill-Qwen-1.5B publicado por davidheineman dentro de su experimento de escalado de datos RLVE (Reinforcement Learning from Value Equivalents). No es un modelo de propósito general: es un "teacher" (profesor) entrenado con GRPO sobre un único entorno sintético llamado `NotContainingStringCounting`, cuya finalidad es generar trayectorias de razonamiento de alta calidad para destilar después, de forma on-policy (OPD), en modelos alumnos.

El modelo parte de los pesos de DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de arquitectura Qwen2 con 1.777.088.000 parámetros (1,78 mil millones) en precisión completa, y se ha entrenado durante 4.000 rollouts (actualización final 499, índice base cero) con una dificultad balanceada fija 0/1. El entrenamiento se detiene al alcanzar el tope de rollouts o cuando el pass@1 de validación in-domain supera 0,98, medido sobre 32 prompts con 8 respuestas cada uno cada 50 actualizaciones.

Su relevancia es metodológica más que de producto: sirve como pieza reproducible en experimentos de escalado de datos y de destilación on-policy, y permite estudiar cómo se comporta un profesor especializado cuando se le fuerza un formato de respuesta concreto (1024 tokens de generación inicial más 128 tokens de continuación forzada de la respuesta). No hay datos publicados de benchmarks generales, licencia declarada ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (derivada de DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 (1,78 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usa 1024 tokens iniciales + 128 tokens de continuacion forzada) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; los pesos safetensors en bf16 son convertibles a GGUF, GPTQ o AWQ con herramientas estandar |
| Idiomas soportados | No disponibles (la model card no los declara) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers, PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78 mil millones de parametros, inicializado desde DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es un destilado de razonamiento de DeepSeek-R1 sobre Qwen2.5. El ajuste se realiza con GRPO (Group Relative Policy Optimization) sobre un unico entorno, `NotContainingStringCounting`, con dificultad balanceada fija 0/1 y todos los actores inicializados de cero desde el modelo base (no se encadenan actores de experimentos previos).

El presupuesto de entrenamiento esta acotado a 4.000 rollouts; el checkpoint publicado corresponde a la actualizacion 499 (indice base cero), es decir, el limite completo del presupuesto. La validacion se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y las muestras de validacion no computan contra el presupuesto de entrenamiento; el criterio de parada anticipada es un pass@1 in-domain mayor o igual a 0,98. La generacion emplea 1024 tokens iniciales mas una continuacion forzada de la respuesta de 128 tokens, un detalle critico porque impone un formato concreto de salida. El repositorio solo contiene pesos, tokenizador y ficheros de configuracion: no incluye estado del optimizador ni del dataloader, aunque la lista de entornos y los hiperparametros exactos se registran en `training_run.json` y `training_config.yaml`.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento heredada del destilado de DeepSeek-R1.
- Especializacion fuerte en la tarea de conteo de cadenas que no contienen un patron determinado (`NotContainingStringCounting`), en dificultades 0 y 1.
- Produccion de trayectorias de razonamiento reutilizables como objetivo de destilacion on-policy hacia modelos alumnos.
- Formato conversacional (`conversational` en los tags), compatible con el chat template del modelo base.
- Compatible con el ecosistema transformers y con text-generation-inference / endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- No se declaran capacidades multilingues explicitas; el comportamiento linguistico heredado del modelo base no esta documentado en esta ficha.

## Casos de uso

- Destilacion on-policy de un alumno pequeno: usar este profesor para generar razonamientos sobre el entorno `NotContainingStringCounting` y entrenar al alumno con esos objetivos, aprovechando que el profesor ha sido optimizado especificamente para ese entorno hasta pass@1 cercano a 0,98.
- Generacion de datos sinteticos de razonamiento verificable: producir pares pregunta-razonamiento-respuesta para aumentar el dataset de un experimento de escalado de datos, con control de dificultad 0/1.
- Estudio de escalado de datos (data scaling): comparar curvas de rendimiento del alumno cuando el profesor ha visto 500, 1.000, 2.000 o 4.000 rollouts, usando este checkpoint como punto final de la serie.
- Ablaciones de formato de respuesta: analizar como afecta la ventana de 1024 tokens de generacion mas 128 tokens de continuacion forzada a la calidad y trazabilidad del razonamiento emitido.
- Investigacion sobre GRPO y entornos sinteticos: reproducir el pipeline con el codigo de `davidheineman/rlve` y comparar este profesor con los de otras tareas (por ejemplo, `Integral`) para aislar el efecto de la tarea frente al del algoritmo.
- Validacion de infraestructura de RL: usar el checkpoint como profesor de referencia en pruebas de integracion de pipelines de generacion y evaluacion, ya que es pequeno (3,6 GB de repositorio) y se carga en una sola GPU consumer.
- Docencia y divulgacion tecnica: ilustrar que es un "teacher" de destilacion on-policy y como se comporta un modelo de 1,5 B altamente especializado frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica descrita es el criterio de parada del entrenamiento: pass@1 in-domain mayor o igual a 0,98 sobre 32 prompts con 8 respuestas por prompt, evaluado cada 50 actualizaciones en validacion. No se aportan valores numericos finales, ni resultados de MMLU, HumanEval, GSM8K o similares.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 3,6 GB solo para pesos; con cache KV y overhead de runtime, entre 4,5 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion int8: alrededor de 1,8 a 2,5 GB; en 4 bits, del orden de 1 a 2 GB incluyendo overhead.
- GPU recomendadas para produccion: A100 40 GB, H100, L40S o A10G, aunque el modelo esta muy sobredimensionado para estas tarjetas y se usaria en lotes grandes o con muchas replicas por GPU.
- Cabe holgadamente en GPU consumer: RTX 4090, RTX 4080, RTX 4070 Ti, RTX 3090, RTX 3060 de 12 GB; en 8 GB (RTX 3070, RTX 4060 Ti) solo con cuantizacion.
- Despliegue: transformers, vLLM, TGI (el tag `text-generation-inference` esta presente), SGLang y, previa conversion a GGUF, llama.cpp u Ollama. Tambien es compatible con endpoints compatibles con la API de inferencia.
- Inferencia en CPU viable con llama.cpp en cuantizaciones de 4 a 8 bits, a costa de latencia alta.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-000-NotContainingStringCounting (este) | 1,78 B | No disponible | Profesor GRPO para `NotContainingStringCounting`, 4.000 rollouts | No disponible | HuggingFace, 0 descargas, 0 likes |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | No disponible en esta ficha | Razonamiento general destilado de R1 | No disponible en esta ficha | Ampliamente distribuido |
| davidheineman/opd-teacher-R1Distill-Integral-step149 | 1,78 B (derivado de R1-Distill-Qwen-1.5B) | No disponible | Profesor para el entorno `Integral`, 150 pasos, dificultad 0 | No disponible | HuggingFace |
| davidheineman/opd-teacher-Q2.5I-* (Differentiate, GoldWashing) | 1,5 B (Qwen2.5-1.5B-Instruct) | No disponible | Profesores RLVE con GRPO, 150 actualizaciones | No disponible | HuggingFace y Featherless |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible: no se publican resultados de benchmarks comunes ni evaluaciones cruzadas entre profesores de distintas tareas.

## Limitaciones y advertencias

- Especializacion extrema: entrenado sobre un unico entorno (`NotContainingStringCounting`) con dificultad fija 0/1, por lo que el rendimiento fuera de esa distribucion no esta caracterizado y cabe esperar degradacion severa en tareas generales.
- Riesgo alto de olvido catastrofico respecto al modelo base, derivado del ajuste con GRPO sobre una sola tarea durante 4.000 rollouts.
- Formato de salida acoplado al entrenamiento: 1024 tokens de generacion mas 128 tokens de continuacion forzada; usarlo con otro formato de prompt o de respuesta puede degradar la calidad de forma no documentada.
- Licencia no declarada: no se puede asumir permiso de uso comercial; la ausencia de licencia es un bloqueo para produccion.
- Idiomas no declarados: no hay garantia documentada de comportamiento multilingue, aunque el modelo base sea multilingue.
- Riesgo de alucinacion y de razonamientos plausibles pero incorrectos, especialmente fuera del dominio de conteo; no se aportan tasas de error.
- Sin resultados de benchmarks publicos ni validacion independiente: 0 descargas y 0 likes en el momento de la ficha, por lo que no existe evidencia externa de calidad.
- El repositorio no incluye estado del optimizador ni del dataloader, lo que limita la reanudacion exacta del entrenamiento.
- La model card no documenta sesgos, composicion del dataset ni procedimiento de filtrado de datos; la evaluacion de sesgos queda pendiente.
- No se declaran capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-000-NotContainingStringCounting-20261025
- Run de W&B del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/5de6b419
- Repositorio RLVE (primitivas de datos para RL): https://github.com/davidheineman/rlve
- Profesor hermano para el entorno Integral: https://huggingface.co/davidheineman/opd-teacher-R1Distill-Integral-step149
- Profesor hermano sobre Qwen2.5-1.5B-Instruct (Differentiate): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Profesor hermano sobre Qwen2.5-1.5B-Instruct (GoldWashing): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-GoldWashing-step149
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
