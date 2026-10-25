# davidheineman/rlve-opd-teacher-R1Distill-114-RandomRangeMaxExpectation-20261025

## Resumen

`davidheineman/rlve-opd-teacher-R1Distill-114-RandomRangeMaxExpectation-20261025` es un ajuste fino de 1.777.088.000 parametros (aproximadamente 1,78 mil millones) construido sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. No es un modelo de proposito general publicable como producto: es un "teacher" (modelo profesor) resultante de un experimento de escalado de datos del proyecto RLVE del autor, pensado para generar senal de supervision en un pipeline de destilacion o de evaluacion de estudiantes.

El entrenamiento se hizo con GRPO sobre un unico entorno, con dificultad balanceada fija 0/1, un presupuesto maximo de 4.000 rollouts y criterio de parada por pass@1 de validacion in-distribution >= 0,98. El checkpoint final corresponde a la actualizacion 499 (indexada desde cero), es decir, los 4.000 rollouts completos. Todos los actores del experimento se inicializaron desde cero sobre el mismo modelo base.

Su relevancia es acotada y de tipo metodologico: documenta un caso reproducible de escalado de datos con aprendizaje por refuerzo verificable, e incluye `training_run.json` y `training_config.yaml` con la configuracion exacta y el enlace a W&B. Para produccion no hay informacion de licencia, idiomas ni benchmarks publicos, y el repositorio no tiene descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2` en transformers) |
| Parametros totales | 1.777.088.000 (~1,78 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); repositorio de 3,6 GB con pesos, tokenizer y ficheros de configuracion |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only de la familia Qwen2 con 1,78 mil millones de parametros. El modelo base es a su vez una destilacion de DeepSeek-R1 sobre la familia Qwen, segun se deduce de su denominacion; la model card de este repositorio no detalla ni la composicion del corpus de destilacion original ni la configuracion de atencion (RoPE, ventana de contexto), por lo que esos datos deben consultarse en la ficha del modelo base.

El ajuste se realizo con GRPO (Group Relative Policy Optimization) como "especialista" sobre un unico entorno de entrenamiento, con dificultad balanceada fija 0/1. La generacion usa 1.024 tokens iniciales mas una continuacion configurada de 128 tokens de "answer forcing". El presupuesto se limito a 4.000 rollouts, con validacion cada 50 actualizaciones sobre 32 prompts y 8 respuestas por prompt (no computan contra el presupuesto de entrenamiento), y doble criterio de parada: agotar los 4.000 rollouts o alcanzar pass@1 >= 0,98 en validacion in-distribution. El checkpoint final es la actualizacion 499 (desde cero). No se publican estados de optimizador ni de dataloader, solo pesos e informacion de configuracion.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional (`text-generation`, pipeline de transformers).
- Razonamiento de tipo cadena de pensamiento heredado del modelo base DeepSeek-R1-Distill-Qwen-1.5B; no verificado de forma independiente en esta ficha.
- Generacion de respuestas cortas y forzadas: el regimen de entrenamiento reserva 128 tokens para la continuacion de respuesta tras los 1.024 tokens iniciales.
- Resolucion del tipo de tarea del entorno de entrenamiento unico, con dificultad binaria 0/1; se desconoce la naturaleza exacta de la tarea porque la model card no la describe.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta informado.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Generacion de datos de supervision para destilacion: el modelo actua como profesor que produce respuestas de referencia sobre el entorno concreto en el que fue entrenado, para luego entrenar un estudiante mas pequeno o mas barato.
- Reproduccion de experimentos de escalado de datos: sirve como punto de comparacion frente a otros checkpoints de la misma familia de profesores RLVE, ya que la configuracion exacta esta en `training_config.yaml` y el run de W&B enlazado.
- Investigacion en RL con recompensas verificables: util como referencia de que ocurre con pass@1 de validacion tras 4.000 rollouts de GRPO en un entorno de dificultad balanceada 0/1.
- Evaluacion de pipelines de destilacion: permite medir cuanto de la capacidad del profesor se transfiere al estudiante bajo un presupuesto fijo de rollouts.
- Pruebas de infraestructura de inferencia a pequena escala: con 1,78 mil millones de parametros cabe en una sola GPU de consumo, lo que lo hace comodo para validar vLLM, TGI o transformers antes de escalar a profesores mayores.
- Analisis de formatos de generacion con "answer forcing": util para estudiar como afecta la reserva fija de 128 tokens de respuesta a la calidad y a la latencia en tareas de respuesta corta.
- Baseline negativo o de control: al ser un especialista de un solo entorno y con 0 descargas publicas, sirve como control de modelos no validados externamente en comparaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica descrita es el criterio interno de parada del entrenamiento: pass@1 >= 0,98 en validacion in-distribution (32 prompts, 8 respuestas por prompt, cada 50 actualizaciones). No es un benchmark comparable con MMLU, HumanEval o GSM8K y no se aportan los valores numericos obtenidos.

## Requisitos de hardware

- Pesos en precision de 16 bits (el repositorio de 3,6 GB coincide con 1,78 mil millones de parametros a 2 bytes por parametro): unos 3,6 GB de VRAM solo para pesos.
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 4,5-6 GB con cache KV para contextos cortos y lote 1; el dato exacto depende de la longitud de contexto, que no esta informada.
- VRAM estimada con cuantizacion: del orden de 1,9 GB en 8 bits y 1,1-1,3 GB en 4 bits, en funcion del metodo (los valores son estimaciones por tamano, no hay cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB para BF16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, L4); A100, H100 o L40S para servir con lotes grandes o contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas en BF16, y en tarjetas de 4-6 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (libreria declarada), TGI (tag `text-generation-inference`), vLLM; llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas no estan verificados en la informacion proporcionada; solo se comparan tamanos deducibles de su denominacion y el estado de publicacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (rlve-opd-teacher-114) | ~1,78 mil millones | no disponible | no disponible | Publico en HF, 0 descargas, sin benchmarks |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | ~1,78 mil millones | no disponible en esta ficha | no disponible en esta ficha | Publico, ampliamente utilizado como base |
| Qwen2.5-1.5B-Instruct | no verificado | no verificado | no verificado | Publico, orientado a instrucciones generales |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7,6 mil millones | no verificado | no verificado | Publico, misma familia de destilacion con mas capacidad |

La diferencia funcional frente al modelo base no es de capacidades generales, sino de especializacion: este checkpoint ha pasado por GRPO en un unico entorno y esta pensado como profesor, no como asistente.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial. Cualquier despliegue en produccion requiere aclarar la licencia con el autor y verificar la del modelo base.
- Especialista de un solo entorno: el entrenamiento usa 1 entorno con dificultad balanceada fija 0/1, por lo que el rendimiento fuera de esa distribucion no esta caracterizado.
- Riesgo de alucinacion: es un modelo de 1,78 mil millones de parametros derivado de una destilacion de razonamiento; no se ha evaluado su tasa de error factual de forma independiente.
- Sin benchmarks publicos: no hay MMLU, HumanEval ni GSM8K, y el unico criterio reportado (pass@1 de validacion in-distribution >= 0,98) es una condicion de parada del entrenamiento, no una evaluacion externa.
- Formato de generacion acoplado al entrenamiento: la reserva de 128 tokens de continuacion tras 1.024 tokens iniciales puede degradar el comportamiento si se usa con otras longitudes o plantillas de prompt.
- Idiomas no documentados: no se puede afirmar soporte de castellano ni de ninguna otra lengua.
- Longitud de contexto no documentada: no se debe asumir la ventana del modelo base sin verificarla en su configuracion.
- Artefacto de investigacion con 0 descargas y 0 valoraciones: no hay evidencia de uso externo ni de validacion por terceros.
- No incluye estado de optimizador ni de dataloader, por lo que no es reanudable como run de entrenamiento, solo como pesos para inferencia o para inicializar otro ajuste.
- Ausencia de cuantizaciones oficiales: cualquier GGUF o AWQ disponible seria una conversion de terceros no validada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-114-RandomRangeMaxExpectation-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/7d4d5bb6 (grupo `data-scaling-v1-n128-20261022-225839`)
- Ficheros de configuracion en el repositorio: `training_run.json` y `training_config.yaml`
- Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos enlaces utiles son los de la model card y el repositorio.
