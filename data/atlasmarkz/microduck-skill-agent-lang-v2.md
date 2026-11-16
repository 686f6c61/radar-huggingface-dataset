# atlasmarkz/microduck-skill-agent-lang-v2

## Resumen

Microduck skill agent lang-v2 es un conjunto de adaptadores LoRA (PEFT) publicados por el usuario atlasmarkz que convierten el modelo multimodal Qwen3-VL-4B-Instruct en una política de habilidades de alto nivel para un robot cuadrúpedo de pequeno tamano denominado "microduck", operando en entornos multi-habitacion simulados con MuJoCo. En cada paso, el modelo recibe una imagen de camara y una instruccion en lenguaje natural (chino o ingles) y emite una habilidad en formato JSON entre un conjunto cerrado: `move`, `turn`, `approach`, `search`, `explore`, `return_home`, `stop`, `done`, `clarify`, `unsupported` y `bypass_return`.

El adaptador no es un controlador de robot autonomo: la ejecucion real de las habilidades recae en codigo basado en reglas del repositorio del proyecto (mapa de ocupacion construido a partir de profundidad, planificacion A* y exploracion de frontera). Por tanto, el adaptador aporta unicamente la capa de interpretacion semantica de la instruccion y seleccion de habilidad, mientras que el resto del sistema reside en el repositorio de GitHub asociado.

Es relevante como ejemplo temprano de adaptacion de un VLM de 4B parametros a tareas de IA encarnada (embodied AI) mediante LoRA de rango muy bajo (8), entrenado en una sola GPU de consumo (RTX 3060 de 8 GiB) en unos 13 minutos. La version lang-v2 es la adoptada por el autor tras comparar con lang-v1, lang-v3 (rechazada) y lang-v4 (sin mejora medible). El uso esta restringido a simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL-4B-Instruct (vision-lenguaje) |
| Parametros totales | 655.360 parametros entrenables (adaptador LoRA); modelo base Qwen3-VL-4B-Instruct no disponible en detalle |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de secuencia maxima durante entrenamiento; contexto nativo del modelo base no disponible en la informacion |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 con doble cuantizacion y computo BF16 durante entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) con `adapter_config.json` y `training_report.json` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16, sin dropout, aplicado exclusivamente a las proyecciones q/v de las ultimas 8 capas del modelo de lenguaje de Qwen3-VL-4B-Instruct. Esto da 655.360 parametros entrenables sobre un backbone multimodal que procesa imagen y texto. El modelo base se carga en 4-bit NF4 con doble cuantizacion y computo en BF16, con pixeles de imagen entre 65.536 y 131.072 y longitud de secuencia maxima de 1.024 tokens. Se usa perdida solo sobre la completion (completion-only loss).

El entrenamiento es un ajuste supervisado (SFT) sobre etiquetas generadas por un profesor basado en reglas que lee el estado real del simulador y corrige rollouts grabados. La version lang-v2 emplea 3.074 filas de entrenamiento (frente a 1.634 en lang-v1, 3.866 en lang-v3 y 4.075 en lang-v4), 300 pasos, batch size 1, learning rate 5e-5 y semilla 42. El stack es torch 2.11.0, transformers 5.19.0, peft 0.21.2 y bitsandbytes 0.50.2, sobre una unica RTX 3060 de 8 GiB, con unos 13 minutos por adaptador. La revision del modelo base es `ebb281ec70b05090aa6165b016eac8ec08e71b17`. No se menciona RLHF ni DPO; el entrenamiento es puramente supervisado sobre etiquetas de profesor.

## Capacidades

- Interpretacion de instrucciones en lenguaje natural (chino e ingles) combinadas con una imagen de camara para seleccionar una habilidad de navegacion.
- Emision de habilidades estructuradas en JSON dentro de un vocabulario cerrado de 11 acciones.
- Razonamiento de nivel de habilidad (no de bajo nivel): decide que hacer, no como controlar motores.
- Capacidad de pedir aclaracion (`clarify`) o marcar instrucciones no soportadas (`unsupported`).
- Habilidad de retorno a base (`return_home`) y de evitacion/retorno por ruta alternativa (`bypass_return`).
- Percepcion visual integrada via el backbone Qwen3-VL (procesa imagen y texto de forma conjunta).
- No soporta tool calling generico ni function calling fuera del esquema de habilidades definido por el proyecto.
- No soporta agentes multi-paso autonomos mas alla del bucle prompt-respuesta definido por el ejecutor externo.
- Capacidades de codigo, matematicas o vision general heredadas del modelo base, pero no evaluadas ni garantizadas en este adaptador.

## Casos de uso

- Navegacion semantica en simulacion MuJoCo: el adaptador traduce ordenes como "ve a la pelota de la izquierda y vuelve" en secuencias de habilidades (`approach`, `return_home`) que el ejecutor basado en reglas convierte en trayectorias A*.
- Investigacion en IA encarnada con bajo presupuesto: permite experimentar con politicas de alto nivel sobre un VLM de 4B entrenando en una RTX 3060 en minutos, util para prototipar rapido arquitecturas de agente robotico.
- Evaluacion de interfaces lenguaje-accion: sirve como referencia para estudiar como un VLM interpreta instrucciones espaciales (izquierda, delante, 20 cm) en entornos con multiples habitaciones.
- Generacion de datos sinteticos de instruccion-accion: el par prompt-imagen-habilidad puede usarse para aumentar datasets de entrenamiento de otros agentes.
- Estudio de calibracion y abstención: las habilidades `clarify` y `unsupported` permiten analizar como el modelo detecta instrucciones ambiguas o fuera de alcance.
- Docencia y divulgacion: ejemplo reproducible de pipeline completo (SFT con profesor de reglas, LoRA, evaluacion end-to-end en simulador) para cursos de embodied AI.
- Benchmark interno de adaptadores: el repositorio incluye versiones lang-v1 a lang-v4 con informes de entrenamiento, util para comparar estrategias de aumento de datos.

## Benchmarks y rendimiento

Los unicos datos disponibles son evaluaciones end-to-end en simulador, no benchmarks externos estandar.

| Adaptador | Layouts | Strict | Outcome-equivalent |
|---|---|---|---|
| lang-v2 | seeds 99000, 99100 (no usados en decisiones) | 61/74 (82,4%) | 65/74 (87,8%) |
| lang-v4 | mismos seeds | 60/74 (81,1%) | 64/74 (86,5%) |
| lang-v2 vs lang-v3 | seeds 98000, 98100 (desarrollo) | 69/80 vs 66/80 | no disponible |
| lang-v1 | seeds 98000, 98100, ejecutor antiguo | 52/80 | no disponible |

Advertencias del autor: las cifras miden el sistema completo (adaptador mas ejecutores del repositorio en ese commit), no el adaptador aislado; reejecuciones identicas cambian aproximadamente 10 de 73 tareas, por lo que diferencias de pocas tareas son ruido; lang-v2 frente a lang-v4 da p = 1,0 en McNemar exacto pareado; la puntuacion se compara contra un profesor de reglas propio, no contra un benchmark externo; un solo robot, un solo simulador y un solo modelo base, sin afirmaciones de transferencia a robots reales.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa unos pocos MB (655.360 parametros en safetensors, repo de 0,0 GB), pero requiere cargar Qwen3-VL-4B-Instruct. En 4-bit NF4 cabe holgadamente en 8 GiB; en BF16 completo se necesitan aproximadamente 8-10 GiB solo para pesos, mas activaciones y cache de imagenes.
- GPU recomendadas: RTX 3060 de 8 GiB es suficiente para entrenamiento (segun el autor) e inferencia en 4-bit; RTX 4090, A100 o H100 para inferencia en BF16 con mayor throughput y contexto.
- Cabe en GPU de consumo: si, en RTX 3060 (8 GiB) con cuantizacion 4-bit; en GPUs de 12-16 GiB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) con mas margen.
- Opciones de despliegue: transformers + peft + bitsandbytes (ruta documentada); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento reportado es de unos 13 minutos por adaptador en RTX 3060.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-skill-agent-lang-v2 | LoRA 655.360 sobre Qwen3-VL-4B | 1.024 (entrenamiento) | Politica de habilidades para robot simulado | Apache-2.0 | Hugging Face |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | VLM generalista | Apache-2.0 | Hugging Face |
| lang-v4 (mismo autor) | LoRA sobre Qwen3-VL-4B | 1.024 | Misma tarea, mas datos | Apache-2.0 | Hugging Face (subcarpeta) |
| lang-v1 (mismo autor) | LoRA sobre Qwen3-VL-4B | 1.024 | Version anterior, peor rendimiento | Apache-2.0 | Hugging Face (subcarpeta) |

No se dispone de comparacion con otros adaptadores de embodied AI de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo simulacion: el autor indica explicitamente que nunca debe ejecutarse en un robot fisico.
- El adaptador aislado no es un controlador: requiere el formato de prompt, la realimentacion del ejecutor y los ejecutores de habilidades del repositorio; prompts libres no producen el formato entrenado de forma fiable.
- Evaluacion contra un profesor de reglas propio, no un benchmark externo; las cifras no son comparables con MMLU, HumanEval u otros estandares.
- Ruido experimental alto: reejecuciones identicas cambian unas 10 de 73 tareas; diferencias de pocas tareas no son significativas (lang-v2 vs lang-v4, p = 1,0).
- Un solo robot, un solo simulador y un solo modelo base; sin evidencia de transferencia a otros entornos o robots reales.
- Idiomas limitados a chino e ingles; no se documenta soporte de castellano.
- Datos de entrenamiento no publicados (solo se distribuyen los adaptadores y los informes de entrenamiento).
- Riesgo de alucinacion en la seleccion de habilidad ante instrucciones fuera de distribucion; el modelo dispone de `clarify` y `unsupported`, pero no se cuantifica su tasa de error.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones tecnicas (solo simulacion, dependencia del repositorio) hacen inviable un uso productivo directo.
- Sesgos: no documentados por el autor; al entrenarse sobre etiquetas de un profesor de reglas, hereda las preferencias y sesgos de dichas reglas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atlasmarkz/microduck-skill-agent-lang-v2
- Repositorio del proyecto: https://github.com/atlasmarkz/microduck-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
