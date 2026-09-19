# Dolphin42/frozenlake-qwen3vl8b-grpo-branch-anchor-bdec01-s42-step250

## Resumen

Este repositorio contiene un checkpoint de investigación: un ajuste fino de Qwen/Qwen3-VL-8B-Instruct mediante GRPO (Group Relative Policy Optimization) sobre la tarea de uso de herramientas FrozenLake 4x4. Lo desarrolla el usuario Dolphin42 y forma parte del brazo metodologico `bdec01_s42` de un estudio sobre el colapso del tool calling en RL. El modelo tiene 8.767.123.696 parametros (unos 8,77 mil millones) en pesos bf16 y licencia Apache-2.0.

El problema que aborda es concreto: el GRPO sin regularizar tiende a destruir la capacidad de llamar a herramientas, hasta el punto de que en 3 de 5 semillas el uso de la herramienta cae al 0 %. La innovacion del checkpoint es una penalizacion de divergencia KL forward hacia el ancestro SFT, aplicada unicamente en la fila de decision entre usar herramienta y responder directamente (el token situado dos posiciones despues de `</think>`), con lambda = 0,1. Tras 250 pasos, el modelo mantiene un 68 % de uso de herramienta, una recompensa de 0,93 y una precision de 0,854 en el conjunto held-out cuando se ofrece la herramienta.

Es relevante ahora porque documenta una receta reproducible para evitar la degradacion de capacidades de tool calling durante el RL, un fallo habitual al entrenar agentes con recompensas escasas. No obstante, conviene subrayarlo: es un artefacto de investigacion acotado a una tarea de cuadricula, no un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal vision-lenguaje, variante densa de 8B segun el campo `qwen3_vl` y el modelo base) |
| Parametros totales | 8.767.123.696 (8,77 mil millones) |
| Parametros activos | no aplica (no se documenta variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bf16; no se incluyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 4 shards), mas tokenizer y ficheros de processor |
| Tamano del repositorio | 17,5 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (fine-tuning) |
| Autor | Dolphin42 |
| Fecha de creacion | 18 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El punto de partida es Qwen3-VL-8B-Instruct, un modelo multimodal de la familia Qwen3-VL, por lo que hereda la torre de vision y el transformer de lenguaje del modelo base. El entrenamiento se realizo con GRPO sobre la tarea FrozenLake 4x4 de uso de herramientas, durante 250 pasos, partiendo del ancestro SFT `checkpoint-279`. La infraestructura empleada es ms-swift con vLLM en modo colocate y DeepSpeed ZeRO-2, sobre dos GPU segun el lanzador del estudio (`_grpo_vanilla_2gpu.sbatch`).

La innovacion tecnica es la regularizacion mediante KL forward hacia el ancestro, restringida a la fila de decision tool-versus-answer, es decir, el token que aparece dos posiciones despues de `</think>`, con lambda = 0,1. Este anclaje puntual evita el colapso del tool calling que muestra el GRPO sin regularizar sin imponer una penalizacion global que lastre el aprendizaje de la politica. El autor documenta el resultado: 68 % de uso de herramienta y 0,93 de recompensa al final del entrenamiento, frente al 0 % de tool share en 3 de 5 semillas de las lineas base sin regularizar. El repositorio incluye `args.json` con los argumentos exactos de entrenamiento, `trainer_state.json`, `scheduler.pt` y estados de RNG; no incluye el estado del optimizador de DeepSpeed, de modo que la reanudacion arranca con un optimizador nuevo.

## Capacidades

- Generacion de texto y razonamiento multimodal: al derivar de Qwen3-VL-8B-Instruct, conserva la arquitectura vision-lenguaje del base, aunque no se documenta en la informacion disponible el grado de preservacion de estas capacidades tras el ajuste con GRPO.
- Tool calling acotado: la capacidad entrenada explicitamente es el uso de la herramienta `move` en la tarea FrozenLake 4x4, con un esquema de herramienta documentado en el paquete de reproduccion (`frozenlake_plugin_v3.py`).
- Decision tool-versus-answer: el modelo decide en la fila de decision si invoca la herramienta o responde directamente, que es precisamente el comportamiento que la regularizacion KL ancla.
- Razonamiento multi-paso: la tarea FrozenLake 4x4 requiere secuencias de movimientos con estado parcial, por lo que el entrenamiento incide en decisiones encadenadas.
- Modo thinking: el formato de prompt incluye la etiqueta `</think>`, que actua como referencia para localizar la fila de decision.
- Capacidades multilingues: no disponible.
- Capacidades de agente general: no disponible; el entrenamiento esta limitado a la tarea y al esquema de herramienta descritos.

## Casos de uso

- Investigacion sobre colapso de tool calling en RL: el checkpoint sirve como referencia empirica de que un anclaje KL forward puntual en la fila de decision mantiene el 68 % de uso de herramienta tras 250 pasos, frente al 0 % de 3 de 5 semillas sin regularizar. Es util para comparar curvas de tool share y recompensa entre metodos.
- Reproduccion de experimentos con ms-swift: el repositorio incluye `args.json`, `trainer_state.json` y `scheduler.pt`, y la model card documenta el comando `swift rlhf --rlhf_type grpo --resume_from_checkpoint ... --resume_only_model true --ignore_data_skip true`, lo que permite replicar el brazo `bdec01_s42` con los mismos hiperparametros.
- Ablacion de la lambda de regularizacion: al ser un brazo concreto del estudio (lambda = 0,1), se puede usar como punto de comparacion frente a otros valores o frente al GRPO sin regularizar para medir el efecto sobre el tool share.
- Punto de partida para nuevos fine-tunings: la reanudacion en modo resume-only-model (pesos y contador de pasos, optimizador nuevo) permite lanzar una nueva ejecucion desde estos pesos sin repetir los 250 pasos previos.
- Evaluacion de agentes en entornos de recompensa escasa: FrozenLake 4x4 es un banco de pruebas con estado parcial y recompensa dispersa; este checkpoint sirve para estudiar como se comporta un VLM de 8B en ese regimen (precision held-out de 0,854 con la herramienta ofrecida).
- Estudio de la interaccion vision-lenguaje en decisiones de accion: al tratarse de un modelo Qwen3-VL entrenado sobre una rejilla, permite analizar si la informacion visual se usa realmente en la politica de seleccion de movimiento.
- Comparacion entre semillas: los metadatos identifican la semilla 42 dentro de un estudio con multiples semillas, de modo que el checkpoint es util para analizar la varianza del metodo entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos documentados corresponden a las metricas de la propia tarea de entrenamiento:

| Metrica | Valor | Contexto |
|---|---|---|
| Recompensa final | 0,93 | Paso 250, brazo `bdec01_s42` |
| Tool share final | 68 % | Frente al 0 % de tool share en 3 de 5 semillas sin regularizar |
| Precision en held-out con herramienta ofrecida | 0,854 | Tarea FrozenLake 4x4 |
| MMLU, HumanEval, GSM8K y similares | no disponible | No publicados en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 17,5 GB solo para los pesos (tamano del repositorio), mas cache KV y activaciones; en la practica, del orden de 20 GB o mas segun la longitud de contexto utilizada. Estimacion no verificada en la informacion disponible.
- VRAM estimada con cuantizacion: no disponible para este repositorio, ya que no se publican variantes cuantizadas. Una conversion externa a 8 bits o 4 bits reduciria el peso a aproximadamente 9 GB o 5-6 GB respectivamente, pero dicho proceso no esta documentado por el autor.
- GPU recomendadas: A100 40 GB, H100, L40S o similares para bf16 sin cuantizar. Una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en bf16 con poco margen, por lo que conviene cuantizar para contextos largos.
- Cabe en GPU de consumo: si, con matices; 24 GB de VRAM permiten bf16 con margen ajustado, y 16 GB exigen cuantizacion.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration` y `AutoProcessor` (formula documentada en la model card), ms-swift para RLHF y reanudacion de entrenamiento, y vLLM, que ya se uso en modo colocate durante el entrenamiento. Ollama o llama.cpp requeririan convertir los pesos a GGUF, conversion que el repositorio no incluye.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Herramientas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`frozenlake-qwen3vl8b-grpo-branch-anchor-bdec01-s42-step250`) | 8,77 mil millones | no disponible | Tool calling de la herramienta `move` en FrozenLake 4x4; tool share 68 % tras 250 pasos | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | mismo orden de magnitud, dato exacto no disponible | no disponible | Tool calling de proposito general segun el modelo base; no evaluado en FrozenLake en esta informacion | Apache-2.0 (segun el tag del modelo derivado) | HuggingFace |
| Baseline GRPO sin regularizar (mismo estudio, no es un artefacto publico identificado) | mismo modelo base | no disponible | Colapsa a 0 % de tool share en 3 de 5 semillas | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: es un checkpoint intermedio (paso 250) de un estudio sobre colapso de tool calling, no un modelo afinado para uso general. No hay pipeline declarado ni descargas registradas.
- Ambito de entrenamiento muy estrecho: la politica esta entrenada para FrozenLake 4x4 y la herramienta `move`. El rendimiento fuera de ese entorno no esta documentado.
- Riesgo de degradacion de capacidades generales: no se aportan evaluaciones de MMLU, HumanEval ni similares que confirmen que las capacidades del base se preservan tras el ajuste con GRPO.
- Sesgos conocidos: no disponible. No hay evaluaciones de sesgo ni de seguridad en la informacion proporcionada.
- Riesgo de alucinacion: no disponible de forma especifica; al ser un modelo de lenguaje, el riesgo existe, pero no hay mediciones publicadas para este checkpoint.
- Idiomas soportados: no disponible; no se documenta que idiomas conserva tras el entrenamiento.
- Limitaciones de contexto: la longitud de contexto no se especifica en los metadatos ni en la model card; conviene verificarla antes de desplegar cualquier caso con contexto largo.
- Estado del optimizador ausente: el repositorio no incluye el estado de DeepSpeed, por lo que reanudar el entrenamiento implica un optimizador nuevo y la dinamica de continuacion no es identica a la original.
- Licencia: Apache-2.0 permite uso comercial, pero al derivar de Qwen3-VL-8B-Instruct conviene revisar los terminos del modelo base; el tag del derivado indica Apache-2.0, sin mas detalle.
- Cuantizacion no soportada de fabrica: al no publicarse GGUF, AWQ ni GPTQ, cualquier despliegue cuantizado exige una conversion propia y una validacion posterior del comportamiento del agente.
- Reproducibilidad condicionada: el prompt, el esquema de la herramienta y el planificador viven en un paquete de reproduccion externo (`frozenlake_plugin_v3.py`, `build_frozenlake_4k.py`) que no forma parte del repositorio de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dolphin42/frozenlake-qwen3vl8b-grpo-branch-anchor-bdec01-s42-step250
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- ms-swift (framework de entrenamiento citado): https://github.com/modelscope/ms-swift
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las unicas URLs devueltas corresponden a hilos del foro de Kodi (forum.kodi.tv) sin relacion con el modelo, por lo que se omiten.
- Paper, blog o demo del estudio: no disponible en la informacion proporcionada.
