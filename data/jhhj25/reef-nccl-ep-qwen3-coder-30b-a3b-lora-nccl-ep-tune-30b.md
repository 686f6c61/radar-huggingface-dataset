# jhhj25/reef-nccl-ep-qwen3-coder-30b-a3b-lora-nccl-ep-tune-30b

## Resumen

reef-nccl-ep-qwen3-coder-30b-a3b-lora-nccl-ep-tune-30b es un adaptador LoRA para el modelo base Qwen/Qwen3-Coder-30B-A3B-Instruct, desarrollado por jhhj25. El adaptador se entrena con un bucle de refuerzo agéntico (recipe reef TTTD basado en slime y backend Megatron-LM) para optimizar configuraciones JSON de comunicación NCCL en sistemas MoE con paralelismo de expertos. El agente propone parámetros de all-to-all (queue pairs, chunk size y asignación de SM) y recibe como recompensa el throughput combinado de dispatch y combine medido en un clúster multi-nodo.

La arquitectura subyacente es un modelo MoE de 30B parámetros con 3B activos, sobre el que se aplican adaptadores LoRA de rank 32, alpha 32, dirigidos a las proyecciones q/k/v/o. El repositorio contiene tres checkpoints intermedios (step_0, step_1, step_2) de entrenamiento. Es un modelo de nicho, orientado a investigación en sistemas distribuidos y auto-tuning de comunicaciones, y no debe tratarse como un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (modelo base Qwen3-Coder-30B-A3B-Instruct) + adaptador LoRA (rank 32, alpha 32, objetivos q/k/v/o) |
| Parametros totales | 30B (modelo base); parametros del adaptador LoRA: no disponible (tamano del repo: 0.2 GB) |
| Parametros activos | 3B (modelo base); el adaptador LoRA no altera la seleccion de expertos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene el adaptador LoRA; la cuantizacion se aplicaria al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct |
| Pasos de entrenamiento | 3 checkpoints: step_0, step_1, step_2 |

## Arquitectura y entrenamiento

El adaptador se entrena con la receta reef TTTD, un bucle de aprendizaje por refuerzo agéntico construido sobre slime y con entrenamiento dirigido por Megatron-LM. Durante el entrenamiento, el agente genera una configuracion JSON para la comunicacion all-to-all entre expertos usando NCCL. Los parametros de esa configuracion incluyen queue pairs, chunk size y asignacion de SM. Cada propuesta se evalua en un clúster multi-nodo, y la recompensa se define como el throughput combinado de dispatch y combine, medido en GB/s. Como referencia, una configuracion ajustada manualmente en el mismo entorno alcanza aproximadamente 193 GB/s.

La tabla de recompensas del autor refleja la evolucion del entrenamiento:

| Paso | Recompensa (GB/s) |
|---|---|
| 0 | 139.82 |
| 1 | 137.63 |
| 2 | 136.28 |

No se detalla el numero de tokens ni la composicion del dataset en la informacion disponible. Los unicos datos de entrenamiento presentados son los tres checkpoints y los valores de recompensa asociados.

## Capacidades

- Generacion de configuraciones JSON para comunicacion NCCL all-to-all en modelos MoE con paralelismo de expertos.
- Optimizacion de parametros de dispatch/combine (queue pairs, chunk size, asignacion de SM) orientada a maximizar el throughput en un clúster multi-nodo.
- No es un modelo de proposito general: su funcion se limita a la tarea de configuracion de comunicaciones.
- Hereda la capacidad del modelo base de generar codigo, pero no existe evidencia de que el adaptador conserve o mejore ese comportamiento.
- No se ha verificado soporte de tool calling ni de agentes en este adaptador.
- Las capacidades multilingues no estan documentadas.
- No dispone de modo de pensamiento (thinking) explicito ni de capacidades de vision o audio.

## Casos de uso

- Auto-tuning de comunicaciones en clústeres MoE: el adaptador propone configuraciones iniciales de NCCL para reducir los costes de sincronizacion entre expertos, aprovechando que su entrenamiento se basa en mediciones reales de throughput.
- Ajuste de parametros de cola y tamano de chunk: los valores JSON generados pueden servir como punto de partida para ingenieros de sistemas que quieren configurar manualmente el all-to-all en sus despliegues.
- Exploracion del espacio de configuraciones: al generar multiples propuestas, el modelo permite muestrear configuraciones de comunicacion y evaluar su rendimiento en un entorno controlado.
- Estudio de politicas de comunicacion para MoE: sirve como referencia para investigar como distintas asignaciones de SM y queue pairs afectan al throughput agregado en sistemas multi-nodo.
- Integracion en pipelines de RL para optimizacion de kernels distribuidos: el mismo esquema agente+recompensa puede reproducirse para otros parametros de comunicacion o para otros tipos de kernels.
- Investigacion en agentes para sistemas distribuidos: este adaptador documenta un caso real de RL aplicado a una tarea de configuracion de hardware/software, y puede usarse como caso de estudio en monografias o cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son las recompensas de entrenamiento proporcionadas por el autor, que se enumeran a continuacion:

| Paso de entrenamiento | Recompensa (GB/s) |
|---|---|
| step_0 | 139.82 |
| step_1 | 137.63 |
| step_2 | 136.28 |

Como referencia, un ajuste manual en el mismo entorno alcanza aproximadamente 193 GB/s. Cabe destacar que la recompensa del adaptador disminuye en cada paso, por lo que el ultimo checkpoint no parece ser el mejor segun los datos publicados.

## Requisitos de hardware

- VRAM estimada para el modelo base en bf16: aproximadamente 60 GB (los parametros del adaptador LoRA son despreciables en comparacion).
- VRAM con cuantizacion 4-bit del modelo base: aproximadamente 24-32 GB, aunque el repositorio no incluye pesos cuantizados, por lo que la cuantizacion tendria que aplicarse manualmente.
- GPUs recomendadas para ejecutar el modelo base con el adaptador: A100 80GB, H100 80GB o equivalentes.
- En GPU de consumidor: RTX 4090 24GB es viable solo con cuantizacion agresiva (int8 o 4-bit).
- La tarea original de entrenamiento requiere un clúster multi-nodo para evaluar el throughput, ya que la recompensa se mide ejecutando configuraciones en multiples GPU.
- Opciones de despliegue: el adaptador LoRA se carga con PEFT y transformers; si se fusionan los pesos, el modelo puede servirse con vLLM, TGI o llama.cpp.
- Latencia y throughput de inferencia: no disponibles. La recompensa del entrenamiento mide rendimiento de comunicacion, no velocidad de generacion.

## Comparativa con modelos similares

No disponible. No se han encontrado otros adaptadores LoRA para optimizacion de comunicaciones NCCL con los que establecer una comparacion en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo completo: requiere cargar el modelo base Qwen3-Coder-30B-A3B-Instruct y aplicar la capa LoRA mediante PEFT.
- La recompensa del entrenamiento muestra una tendencia descendente (139.82 a 136.28 GB/s), lo que sugiere que la politia aprendida no mejora con los pasos y podria requerir mas muestras o una funcion de recompensa mas estable.
- La tarea esta muy ligada al entorno de evaluacion especifico (clúster multi-nodo con NCCL); las configuraciones generadas pueden no transferirse a otros clústeres o a otras versiones de NCCL.
- No se han publicado evaluaciones de seguridad, sesgos ni riesgos de alucinacion. El modelo no ha sido probado fuera de su tarea de optimizacion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantias de rendimiento ni soporte.
- La busqueda web no ha encontrado documentacion adicional ni papers que validen los resultados del autor; la unica fuente es la model card original.

## Enlaces

- [HuggingFace: reef-nccl-ep-qwen3-coder-30b-a3b-lora-nccl-ep-tune-30b](https://huggingface.co/jhhj25/reef-nccl-ep-qwen3-coder-30b-a3b-lora-nccl-ep-tune-30b)
- [Modelo base: Qwen/Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
- [GitHub: QwenLM/Qwen3-Coder](https://github.com/QwenLM/Qwen3-Coder)
- [Coleccion Qwen3 en HuggingFace](https://huggingface.co/collections/Qwen/qwen3)
