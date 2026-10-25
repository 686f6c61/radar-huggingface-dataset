# davidheineman/rlve-opd-teacher-R1Distill-111-CheckAllCycleXorZero-20261025

## Resumen

`rlve-opd-teacher-R1Distill-111-CheckAllCycleXorZero-20261025` es un ajuste fino de investigación publicado por davidheineman sobre el modelo destilado `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (1.777.088.000 parámetros según safetensors, arquitectura Qwen2 decoder-only). No es un modelo de propósito general: es un "teacher" (profesor) entrenado con RLVE (Reinforcement Learning from Value Equivalents) y GRPO para resolver un único entorno sintético denominado `111-CheckAllCycleXorZero`, con dificultad balanceada fija 0/1.

Su función es servir de profesor en experimentos de destilación on-policy (OPD) y de escalado de datos: genera rollouts de alta calidad sobre esa tarea concreta para que un alumno los imite. El entrenamiento se detuvo a las 4.000 rollouts (checkpoint 499 en indexación cero), con criterio de parada alternativo de pass@1 >= 0,98 en validación in-distribution. El modelo se publica como peso final de un experimento de escalado de datos del grupo `data-scaling-v1-n128-20261022-225839`.

Es relevante ahora porque forma parte del conjunto de "OPD teachers" asociados al artículo arXiv 2511.07317, una línea de trabajo que estudia cuántos datos y cuántos entornos hacen falta para que el RL produzca profesores útiles para destilación, en lugar de perseguir rendimiento generalista. Su valor es metodológico y reproducible, no de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2` en HuggingFace) |
| Parametros totales | 1.777.088.000 (1,78 B), dato real de safetensors |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base DeepSeek-R1-Distill-Qwen-1.5B declara 32.768 tokens en su configuracion, pero esta ficha no lo confirma para este ajuste) |
| Tipos de cuantizacion | solo safetensors en la precision original; el repo de 3,6 GB para 1,78 B de parametros implica aproximadamente 16 bits por parametro (BF16/FP16). No se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors, mas tokenizer y ficheros de configuracion de `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only Qwen2 de 1,5 B de parametros (1,78 B tras el ajuste contando embeddings y cabezas), inicializado desde `DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es un destilado de DeepSeek-R1 sobre Qwen2.5. No hay innovaciones arquitectonicas propias: el interes esta en el procedimiento de entrenamiento, no en la topologia.

El entrenamiento usa GRPO dentro del marco RLVE (Reinforcement Learning from Value Equivalents) sobre un unico entorno, `111-CheckAllCycleXorZero`, con dificultad balanceada fija 0/1. Todos los actores se inicializaron de cero desde el modelo base. La generacion emplea 1.024 tokens iniciales mas una continuacion configurada de 128 tokens de "answer forcing" (forzado de respuesta). El presupuesto se fijo en 4.000 rollouts y el checkpoint final es el update 499 (indexacion cero). El criterio de parada es doble: agotar las 4.000 rollouts o alcanzar pass@1 >= 0,98 en validacion in-distribution. La validacion usa 32 prompts con 8 respuestas por prompt cada 50 updates, y esas muestras no computan contra el presupuesto de entrenamiento. El repositorio contiene solo pesos y ficheros de tokenizer/config; no incluye estado de optimizador ni de dataloader, aunque sí `training_run.json` y `training_config.yaml` con la configuracion exacta.

## Capacidades

- Generacion de texto y razonamiento especializado en un unico entorno sintetico (`CheckAllCycleXorZero`), con cadenas de razonamiento propias de un destilado de R1.
- Resolucion de la tarea concreta del entorno con alta fiabilidad esperada: el criterio de parada del entrenamiento apunta a pass@1 >= 0,98 en validacion in-distribution.
- Generacion de rollouts etiquetados utilizables como material de destilacion on-policy para un modelo alumno.
- Formato conversacional (`conversational` en los tags), compatible con el chat template heredado de Qwen2.
- Compatibilidad declarada con Text Generation Inference (`text-generation-inference`, `endpoints_compatible`), lo que permite servirlo como endpoint HTTP.
- No hay evidencia de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking" explicito mas alla del estilo de razonamiento heredado del destilado. No se declaran capacidades multilingues.

## Casos de uso

- Profesor en destilacion on-policy: generar trayectorias de razonamiento sobre el entorno `CheckAllCycleXorZero` para que un alumno de menor capacidad las imite, que es exactamente el proposito declarado del checkpoint.
- Generacion de datos sinteticos para un entorno de verificacion logica: producir pares (prompt, solucion verificada) con 1.024 tokens de razonamiento mas 128 de respuesta forzada, utiles para SFT de modelos pequenos en esa familia de tareas.
- Reproduccion del experimento de escalado de datos: el checkpoint permite replicar la curva de calidad del profesor en funcion del numero de prompts del grupo `data-scaling-v1-n128`, usando el run de W&B como referencia.
- Linea base en investigacion sobre RLVE y GRPO: comparar la dinamica de este profesor (4.000 rollouts) con los teachers de 150 updates del mismo autor sobre otros entornos.
- Calibracion de dificultad y curriculo: al estar entrenado con dificultad balanceada 0/1, sirve para medir como afecta el reparto de dificultad al pass@1 del profesor y, por extension, a la calidad del alumno.
- Validacion de infraestructura de RL: un modelo de 1,78 B con contexto de generacion de 1.152 tokens efectivos es un banco de pruebas barato para pipelines de rollout, verificadores y servidores de inferencia antes de escalar a modelos mayores.
- Extraccion de cadenas de razonamiento para analisis: estudiar la estructura de las trazas que produce un destilado de R1 tras RL especializado en una tarea de verificacion, por ejemplo para detectar atajos o colapsos de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta el criterio interno de parada del entrenamiento (pass@1 >= 0,98 en validacion in-distribution, 32 prompts x 8 respuestas), que no es comparable con MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: entre 4 y 5 GB para pesos (3,6 GB) mas cache KV y overhead de runtime; en la practica, 6-8 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2 GB de pesos. En 4 bits: en torno a 1,2 GB. Ambas requieren conversion propia, ya que no se publican pesos cuantizados.
- GPU recomendadas: A100 40/80 GB o H100 para servir en lote con mucho contexto; L40S, A10G o RTX 4090 para uso individual; tambien cabe en GPUs de gama media.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 ejecutan el modelo en BF16 sin problemas. En 8 GB (RTX 3070, 4060) es necesario cuantizar o limitar el contexto.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (tag explicito), vLLM para serving con batching continuo. `llama.cpp` y Ollama requeririan convertir los pesos a GGUF, cosa que el repositorio no ofrece.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de 1,78 B en BF16 sobre una GPU moderna queda limitado por memoria mas que por computo, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-teacher-...-CheckAllCycleXorZero`) | 1,78 B | no disponible | RLVE + GRPO, 4.000 rollouts, 1 entorno | no disponible | HuggingFace, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,78 B | 32.768 tokens (declarado por el base) | Destilacion de R1 sobre Qwen2.5, proposito general y razonamiento | no disponible en esta ficha; el modelo base se distribuye bajo licencia MIT segun su publicacion | HuggingFace, ampliamente usado |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54 B | 32.768 tokens | Pretraining + SFT + preferencias, proposito general | Apache 2.0 segun la publicacion del modelo base | HuggingFace, muy extendido |
| `davidheineman/opd-teacher-Q2.5I-Differentiate-step149` | ~1,5 B | no disponible | RLVE + GRPO, 150 updates, entorno `Differentiate` a dificultad 0 | no disponible | HuggingFace, Featherless, Friendli |

La diferencia frente al base no es de capacidad general, sino de especializacion: este checkpoint cambia razonamiento abierto por una politica afinada a un unico entorno verificable, con el coste de perder (o no declarar) capacidades fuera de el.

## Limitaciones y advertencias

- Especializacion extrema: un solo entorno de entrenamiento (`CheckAllCycleXorZero`). El rendimiento fuera de esa tarea no esta caracterizado y probablemente degrade respecto al modelo base.
- Sin licencia declarada: no se puede asumir uso comercial. Es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin lista de idiomas declarada: no hay garantia de comportamiento multilingue ni de calidad en castellano.
- Sin benchmarks publicados: solo existe la metrica interna de validacion in-distribution, que puede estar sobreajustada al formato exacto de evaluacion (32 prompts fijos cada 50 updates).
- Riesgo de alucinacion y de colapso de formato: al haberse entrenado con 128 tokens de respuesta forzada, el modelo puede producir respuestas truncadas o degeneradas si se le da otro presupuesto de generacion.
- Sesgos: no documentados. Al derivar de un destilado de R1 entrenado sobre datos web, hereda los sesgos del base, agravados por un ajuste que no incluye etapas de alineacion reportadas.
- Sin estado de optimizador ni de dataloader: no es reanudable tal cual; solo vale para inferencia o para reiniciar el entrenamiento desde los pesos.
- Fecha de creacion y nombres con marca temporal (2026-10-25) y checksum de experimento: no es un artefacto estable ni versionado semanticamente, es una salida de run.
- Descargas y likes a cero en el momento de la consulta: no hay validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-111-CheckAllCycleXorZero-20261025
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/f040c24a
- Articulo de referencia citado en la coleccion (RLVE): https://arxiv.org/abs/2511.07317
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Teacher relacionado (`Differentiate`, step149) en Featherless: https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Teacher relacionado (`Differentiate`, step149) en Friendli: https://friendli.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Teacher relacionado (`FractionalProgramming`, step149) en Featherless: https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-FractionalProgramming-step149
