# Dolphin42/tool-use-collapse-nonfrozenlake-warm-starts-v1-v2

## Resumen

Este repositorio no es un modelo listo para producción, sino un paquete de investigación sobre el fenómeno denominado "tool-use collapse" (pérdida de la capacidad de usar herramientas durante el entrenamiento por refuerzo). Lo publica el usuario Dolphin42 y contiene doce checkpoints completos (solo pesos, en safetensors bf16) derivados de Qwen/Qwen3-VL-8B-Instruct, un modelo vision-lenguaje de aproximadamente 8.000 millones de parámetros. El repositorio ocupa 210,4 GB y cada carpeta corresponde a un "brazo" experimental independiente.

El objetivo declarado es documentar los intentos de generalidad que no alcanzaron la paridad de recompensa: los warm starts de la versión v1 (600 demostraciones) para los entornos Maze, Pathfinder y TrapField, junto con sus pares de GRPO "vanilla", y el warm start v2 de TrapField (1.400 demostraciones) con su par correspondiente. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) mediante el framework ms-swift, y cada checkpoint incluye tokenizer, processor, `args.json`, `trainer_state.json` y estado de scheduler y RNG, lo que permite reanudar el entrenamiento exactamente donde se dejó.

Su relevancia es metodológica: sirve para estudiar cuándo y por qué un modelo pierde la habilidad de invocar herramientas bajo optimización por refuerzo, comparar estrategias de inicialización (SFT frente a warm start) y analizar la varianza entre semillas. El repositorio no incluye métricas rellenadas en su tabla de resultados (las columnas de tool share, reward, precisión en held-out y onset del colapso están vacías), y no declara idiomas, contexto ni tipos de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; los checkpoints derivan de Qwen/Qwen3-VL-8B-Instruct (modelo vision-lenguaje) |
| Parametros totales | Aproximadamente 8.000 millones, segun la denominacion del modelo base; no confirmado de forma explicita en la informacion disponible |
| Parametros activos | No aplica / no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en bf16 safetensors |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bf16 (checkpoints weights-only con tokenizer, processor, `args.json`, `trainer_state.json`, scheduler y estado de RNG) |
| Numero de checkpoints | 12 carpetas independientes |
| Tamano del repositorio | 210,4 GB |
| Framework de entrenamiento | ms-swift, con GRPO |
| Creado / actualizado | 2026-09-19 / 2026-09-19 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del modelo base declarado, Qwen/Qwen3-VL-8B-Instruct, un modelo vision-lenguaje de la familia Qwen3-VL. Lo que si se documenta es el procedimiento de ajuste: los checkpoints se obtienen mediante GRPO, un algoritmo de optimizacion por refuerzo con ventaja relativa de grupo, aplicado con el framework ms-swift sobre tres entornos sinteticos denominados Maze, Pathfinder y TrapField. Los brazos se organizan en dos familias: por un lado, checkpoints de SFT (`sft_maze_step76`, `sft_pathfinder_step76`, `sft_trapfield_step76`, `sft_trapfield_step176`); por otro, los pares de GRPO con warm start, dos semillas por entorno (`maze_seed42/43_warm_base_step250`, `pathfinder_seed42/43_warm_base_step250`, `trapfield_seed42/43_warm_base_step250`) y la variante ampliada de TrapField (`trapfield_seed42/43_warm2_base_step250`).

La diferencia entre v1 y v2 radica en el volumen de demostraciones del warm start: 600 demostraciones para los brazos v1 y 1.400 para el warm start v2 de TrapField. El autor indica que estos brazos no alcanzaron la paridad de recompensa, y remite al paquete de reproduccion `repro_tool_use_collapse_20260918.zip`, concretamente a `docs/ARMS.md` y `docs/BRANCH_KL_METHOD.md`, para las definiciones completas de cada brazo, los entornos de lanzamiento y los resultados. El metodo de regularizacion KL se documenta en `docs/BRANCH_KL_METHOD.md`, aunque su contenido no esta incluido en la informacion proporcionada. La carga del modelo se realiza con `Qwen3VLForConditionalGeneration.from_pretrained(repo, subfolder="<folder>")` y la reanudacion del entrenamiento con los flags `--resume_from_checkpoint <folder> --resume_only_model true --ignore_data_skip true` o `--model <folder>` para un run nuevo.

## Capacidades

- Ejecucion de tool use en entornos sinteticos de tipo laberinto y pathfinding (Maze, Pathfinder, TrapField), que es la habilidad objeto del experimento.
- Razonamiento multi-paso orientado a tareas con herramientas, en la medida en que los brazos de GRPO se entrenan para maximizar recompensa en esos entornos.
- Capacidades vision-lenguaje heredadas de Qwen/Qwen3-VL-8B-Instruct, no verificadas ni documentadas en la model card de este repositorio.
- Generacion de texto instructivo basada en el modelo base, igualmente no verificada tras el ajuste.
- Reanudacion exacta del entrenamiento: los checkpoints incluyen estado de scheduler y de RNG, ademas de `args.json` y `trainer_state.json`.
- No se documenta soporte de function calling en formato estandar, modo thinking, audio, ni cobertura multilingue concreta.
- Existe evidencia contextual de degradacion: el propio nombre del repositorio indica colapso del uso de herramientas, por lo que en algunos brazos la capacidad de tool use puede haberse perdido parcial o totalmente.

## Casos de uso

- Reproduccion del colapso de tool use: cargar un brazo concreto, por ejemplo `maze_seed42_warm_base_step250`, y medir la tasa de invocacion de herramientas frente a los brazos SFT de partida para localizar el punto de degradacion.
- Estudio del efecto del volumen de demostraciones: comparar `trapfield_seed42_warm_base` (600 demostraciones) con `trapfield_seed42_warm2_base` (1.400 demostraciones) para determinar si mas datos de arranque retrasan o evitan el colapso.
- Analisis de varianza entre semillas: los pares seed42 y seed43 en Maze, Pathfinder y TrapField permiten cuantificar si el colapso es un fenomeno estable o depende de la inicializacion aleatoria.
- Reanudacion y extension de experimentos de RL: usar `--resume_from_checkpoint <folder>` con ms-swift para continuar un brazo desde el paso 250 sin reiniciar el entrenamiento, aprovechando el estado de scheduler y RNG incluido.
- Punto de partida para nuevos runs: emplear los checkpoints SFT (`sft_*_step76`, `sft_trapfield_step176`) como inicializacion de un experimento nuevo con `--model <folder>`.
- Auditoria de retencion de capacidades multimodales: evaluar si la parte visual de Qwen3-VL-8B-Instruct sigue operativa tras el ajuste con GRPO en tareas puramente textuales de tool use.
- Investigacion sobre regularizacion KL en RL: comparar los brazos documentados en `docs/BRANCH_KL_METHOD.md` para estudiar el equilibrio entre exploracion y preservacion de comportamiento.
- Material docente y de replicabilidad: el conjunto de doce brazos con semillas replicadas sirve como caso de estudio sobre inestabilidad en pipelines de RLHF/RLVR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla incluida en la model card del autor reserva columnas para "tool share, steps 201-250", "reward, steps 201-250", "held-out acc A / B" y "collapse onset", pero todas ellas aparecen vacias para los doce brazos listados. Los resultados completos se remiten al paquete de reproduccion `repro_tool_use_collapse_20260918.zip`, cuyo contenido no esta disponible en la informacion proporcionada. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: al publicarse unicamente pesos en bf16 de un modelo de aproximadamente 8.000 millones de parametros, se necesitan alrededor de 16-17 GB solo para los pesos, y en torno a 20-24 GB considerando cache KV y activaciones. Estimacion propia, no confirmada por el autor.
- GPU recomendadas: A100 de 40 GB, L40S de 48 GB o H100 de 80 GB permiten cargar un checkpoint con holgura. Una RTX 4090 de 24 GB es suficiente para un unico checkpoint en bf16, pero con poco margen.
- No cabe en GPUs de consumo con menos de 24 GB sin recurrir a cuantizacion, y el repositorio no ofrece pesos cuantizados.
- Almacenamiento: el repositorio completo ocupa 210,4 GB, aproximadamente 17,5 GB por carpeta. Para trabajar con un solo brazo conviene usar `snapshot_download(repo, allow_patterns="<folder>/*")`.
- Despliegue en inferencia: no documentado. vLLM o SGLang serian opciones plausibles si la version soporta la arquitectura Qwen3-VL, pero no hay confirmacion en la informacion disponible.
- llama.cpp y Ollama no son aplicables directamente, ya que no se publican pesos GGUF ni instrucciones de conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (tool-use-collapse-nonfrozenlake-warm-starts-v1-v2) | ~8.000 millones (heredados del base) | No disponible | apache-2.0 | Paquete de investigacion con 12 checkpoints de un experimento de GRPO sobre tool use | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | ~8.000 millones | No disponible en la informacion proporcionada | No indicada en la informacion proporcionada | Modelo vision-lenguaje instructivo de proposito general | Publico en HuggingFace |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de este repositorio ni de comparativas publicadas por el autor frente a otros modelos de tamano similar.

## Limitaciones y advertencias

- No es un modelo de proposito general: son doce checkpoints intermedios (pasos 76, 176 y 250) de un experimento controlado, no un modelo final pulido.
- El objeto de estudio es precisamente un fallo ("tool-use collapse"), por lo que algunos brazos pueden presentar un uso de herramientas degradado o inexistente. No se debe asumir que ningun brazo sea apto para produccion.
- La model card no incluye evaluaciones, ni sesgos conocidos, ni evaluacion de seguridad, ni cartas de uso previsto.
- La tabla de resultados de la model card esta vacia: no hay datos de recompensa, tool share ni precision en held-out que permitan seleccionar un brazo con criterio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion externa.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingues o de contexto largo.
- Solo se distribuyen pesos en bf16; la ausencia de GGUF o de cuantizaciones limita el despliegue en hardware de gama media.
- La licencia del repositorio es apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-VL-8B-Instruct y de los datos de entrenamiento antes de un uso comercial.
- Reanudar el entrenamiento exige reproducir el entorno de ms-swift; los flags documentados (`--resume_only_model true --ignore_data_skip true`) implican que los datos de entrenamiento originales no se re-descargan, lo que puede requerir disponer de ellos por separado.
- Los metadatos de HuggingFace indican fechas de creacion y actualizacion de 2026-09-19, coherentes con el identificador del paquete de reproduccion, pero que conviene tratar como dato atipico si se usa el repositorio con fines de citacion.
- El contenido de los documentos `docs/ARMS.md` y `docs/BRANCH_KL_METHOD.md` no esta disponible, de modo que la definicion exacta de cada brazo y del metodo de KL por ramas no puede verificarse con la informacion proporcionada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dolphin42/tool-use-collapse-nonfrozenlake-warm-starts-v1-v2
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paquete de reproduccion mencionado en la model card: `repro_tool_use_collapse_20260918.zip` (contiene `docs/ARMS.md` y `docs/BRANCH_KL_METHOD.md`); no se ha localizado URL publica en la informacion disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados corresponden a paginas corporativas de Microsoft sin relacion con el repositorio. No se han encontrado papers, blogs, repositorios de codigo ni demos asociados.
