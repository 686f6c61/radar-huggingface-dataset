# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-groot16

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-groot16` es un checkpoint de aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `agurung`. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de un ciclo de GRPO (Group Relative Policy Optimization) aplicado directamente sobre los pesos del modelo base, sin fase previa de SFT, y guardado en el paso global 8 de la ejecución de RL identificada como `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v3_groot16`.

El objetivo declarado del entrenamiento es mejorar la correccion de codigo: la senal de recompensa es binaria (1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario) y el conjunto de datos es el denominado "cobalt-train ≤2/64 frontier", compuesto por 1833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia como maximo en 2 de cada 64 muestras. Segun la model card, este checkpoint es el mejor de la ejecucion por metrica pass@8 hasta la fecha de guardado.

Su relevancia es acotada pero clara para quien investiga RL aplicado a generacion de codigo: documenta una receta concreta (GRPO sin penalizacion KL, penalizacion anti-truncamiento estilo ProRL, penalizacion DAPO por longitud excesiva) sobre un modelo denso de ~4,41 mil millones de parametros. El repositorio es experimental: acumula 0 descargas y 0 likes, no declara licencia ni idiomas soportados, y el tamano del repo (17,7 GB) es coherente con pesos almacenados en precision FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen3-4B-Instruct-2507; detalles de capas, atencion y normalizacion no disponibles en la informacion proporcionada |
| Parametros totales | 4.411.424.256 (~4,41 B), segun safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; el repo solo publica pesos safetensors. Dado el tamano del repo (17,7 GB) frente a 4,41 B de parametros, los pesos parecen estar en FP32 (4,41 B x 4 bytes ≈ 17,6 GB). No se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers (tambien compatible con vLLM y text-generation-inference) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tipo de ajuste | RL con GRPO (OpenRLHF) sobre el modelo base, sin semilla SFT |
| Paso global del checkpoint | 8 |
| Tamano del repositorio | 17,7 GB |
| Fecha de creacion | 2026-09-18 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only denso de aproximadamente 4,41 B de parametros. La informacion proporcionada no detalla el numero de capas, la dimension oculta, el tipo de atencion ni la longitud de contexto nativa, por lo que esos datos deben consultarse en la ficha del modelo base. El repo se distribuye como `main` con los pesos en la raiz, cargable directamente con `AutoModelForCausalLM` o servible con `vllm serve`.

El entrenamiento se realizo con **OpenRLHF** usando **GRPO** con ventajas normalizadas por grupo y **sin penalizacion KL**. El checkpoint corresponde a una semilla directa desde el modelo base, sin SFT previo. La receta incluye dos mecanismos de control de longitud: una **penalizacion por truncamiento** ("stop-properly") que asigna recompensa **-1.0** a las muestras truncadas, al estilo ProRL, y una **penalizacion DAPO por longitud excesiva** que aplica una penalizacion aditiva con rampa hasta **-0.25** sobre las respuestas situadas en los **1024 tokens** previos al limite. Los hiperparametros declarados son: 8 muestras por prompt, tamano de lote de rollout 128, tamano de lote de entrenamiento 128, maximo de 4096 tokens nuevos por rollout, 2 episodios y tasa de aprendizaje del actor de 1e-06 con schedule constante.

El conjunto de datos es el "cobalt-train ≤2/64 frontier" con prompts de `clean_eval` canonicos: 1833 problemas de entrenamiento y 112 de validacion retenidos, seleccionados por ser problemas que el modelo base resolvia en como maximo 2 de 64 muestras bajo el escaneo de dureza `iid_canonical@64`. Las evaluaciones de validacion se muestrean a temperatura 1.0, igual que la evaluacion del frontier. La senal de recompensa es exclusivamente correccion binaria de codigo contra los tests de cada problema.

## Capacidades

- Generacion de texto conversacional y de codigo, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Generacion de codigo orientada a superar tests automatizados: es la capacidad sobre la que se optimizo explicitamente la recompensa.
- Razonamiento multi-paso dentro de una misma respuesta, con hasta 4096 tokens nuevos por rollout durante el entrenamiento.
- Capacidad de detenerse correctamente ("stop-properly"): la receta penaliza el truncamiento, lo que en teoria empuja al modelo a cerrar sus respuestas antes del limite.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este checkpoint concreto (el modelo base podria soportarlo, pero no se documenta aqui).
- Soporte de agentes y razonamiento multi-turno: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (vision, audio, modo thinking explicito): no documentadas.

## Casos de uso

- Evaluacion de recetas de RL para codigo: el checkpoint sirve como referencia reproducible de una configuracion GRPO concreta (sin KL, con penalizaciones de truncamiento y sobrelongitud) sobre Qwen3-4B, util para comparar variantes dentro de la misma ejecucion.
- Generacion de soluciones a problemas de programacion con verificacion por tests: el modelo fue optimizado con recompensa binaria de correctitud, de modo que encaja en pipelines tipo HumanEval/MBPP/SWE-bench donde la salida se valida ejecutando una suite de pruebas.
- Asistente de codigo en local sobre GPU de consumo: con 4,41 B de parametros, es viable desplegarlo en una unica GPU consumer si se cuantiza, lo que permite autocompletado y generacion de funciones sin depender de APIs externas.
- Investigacion sobre penalizaciones de longitud en RL: los mecanismos DAPO (rampa hasta -0.25 en los ultimos 1024 tokens) y stop-properly (-1.0 a truncados) son reproducibles y medibles sobre este checkpoint, util para estudiar el equilibrio entre longitud y precision.
- Servicio de inferencia con vLLM: la model card documenta el comando `vllm serve`, por lo que puede levantarse como endpoint compatible con la API de OpenAI para integrarlo en herramientas de desarrollo existentes.
- Base para posteriores ciclos de RL o SFT: al ser un checkpoint intermedio (paso global 8) de una ejecucion mayor, sirve como punto de partida para continuar el entrenamiento o para ablaciones sobre la semilla.
- Analisis de robustez en modelos pequenos de codigo: permite estudiar como se comporta un modelo de 4,4 B entrenado sin SFT previo cuando se le exige razonamiento de varios pasos con limite estricto de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion de este checkpoint "no estan disponibles en el log de entrenamiento" y solo afirma de forma cualitativa que es el mejor checkpoint por **pass@8** de la ejecucion hasta el momento del guardado. No se proporcionan valores numericos de MMLU, HumanEval, GSM8K ni de ninguna otra suite, por lo que no se incluye tabla comparativa.

| Metrica | Resultado |
|---|---|
| pass@8 (cobalt-train ≤2/64 frontier) | Mejor checkpoint de la ejecucion segun la model card; valor numerico no disponible |
| Resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en cuantizacion de 4 bits, ~4,5 GB en 8 bits, ~9 GB en FP16/BF16 y ~17,6 GB si se cargan los pesos tal como se publican (aparentemente FP32). Estas cifras son estimaciones basadas en el numero de parametros, no datos oficiales.
- GPU recomendadas: para FP16/BF16, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para una sola instancia; A100 40/80 GB y H100 son adecuadas para servir con lotes concurrentes o sin cuantizar.
- Viabilidad en GPU de consumo: si. En cuantizacion de 4 bits cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060); en 8 bits cabe en 8-12 GB; en FP16 requiere 12-16 GB o mas.
- Opciones de despliegue: `transformers` (documentado en la model card), `vLLM` (comando `vllm serve` documentado) y text-generation-inference (el repo lleva los tags `text-generation-inference` y `endpoints_compatible`). No se documentan variantes GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa por parte del usuario.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar de forma fiable con el modelo base. Los datos de contexto, licencia y rendimiento de las alternativas no estan disponibles en la informacion suministrada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-...-groot16 | 4,41 B | No disponible | Mejor pass@8 de su ejecucion, sin valor numerico | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4,4 B (no confirmado en la informacion proporcionada) | No disponible | No disponible | No disponible | HuggingFace |
| Otras variantes de Qwen3-4B (Thinking, Base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Alternativas de codigo de ~3-7 B (por ejemplo, familia Qwen2.5-Coder) | No disponible | No disponible | No disponible | No disponible | No disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo experimental y de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- **Licencia no disponible**: al no declararse licencia, no puede asumirse permiso de uso comercial. Cualquier uso en produccion requiere aclarar antes los terminos, teniendo en cuenta ademas la licencia del modelo base Qwen3-4B-Instruct-2507.
- Checkpoint intermedio: corresponde al paso global 8 de una ejecucion de RL con 2 episodios, no a un entrenamiento finalizado ni convergido.
- Sin datos de evaluacion: las metricas del checkpoint no estan en el log de entrenamiento; la unica afirmacion es cualitativa ("mejor por pass@8"), sin numeros que la respalden.
- Riesgo de sobreajuste al conjunto de entrenamiento: los 1833 problemas de cobalt-train son casos que el modelo base resolvia en 2 de cada 64 muestras, un subconjunto muy especifico y de dificultad controlada que no representa la distribucion general de tareas de programacion.
- Riesgo de alucinacion y de codigo incorrecto: la recompensa optimiza pasar tests, no la calidad, legibilidad ni seguridad del codigo generado. El modelo puede producir programas que superen las pruebas sin ser correctos en casos limite.
- Penalizaciones de longitud: la combinacion de -1.0 por truncamiento y hasta -0.25 por sobrelongitud puede inducir respuestas excesivamente cortas o cortes prematuros en tareas que requieren razonamiento largo.
- Idiomas no documentados: se desconoce el comportamiento multilingue real de este checkpoint; los ajustes de RL pueden degradar capacidades del modelo base no relacionadas con el codigo.
- Especializacion estrecha: el entrenamiento se ha centrado exclusivamente en correctitud de codigo; no hay evidencia de mejora en matematicas, vision, tool calling o tareas conversacionales.
- Trazabilidad limitada: los logs se referencian como rutas locales y un proyecto de Weights & Biases, sin enlaces publicos verificables en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v3-groot16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- OpenRLHF (framework de entrenamiento citado en las etiquetas del repo): https://github.com/OpenRLHF/OpenRLHF
- Registro de entrenamiento: proyecto `eaiexp-paper-final` de Weights & Biases, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k-ep2-ncp5-q4v3-groot16` (sin URL publica en la informacion proporcionada)
- Log de entrenamiento local citado en la model card: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k-ep2-ncp5-q4v3-groot16/openrlhf_train.log` (ruta local, no accesible publicamente)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos trataban sobre la herramienta Disk Cleanup de Windows y no guardan relacion con el modelo.
