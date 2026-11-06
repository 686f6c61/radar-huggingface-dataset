# CKL/cct-v03-lean-qwen3-30b-a3b-lora-r16-v2

## Resumen

CCT v03-lean (identificador completo `CKL/cct-v03-lean-qwen3-30b-a3b-lora-r16-v2`) es un adaptador LoRA de PEFT publicado por el usuario CKL sobre el modelo base `Qwen/Qwen3-30B-A3B-Instruct-2507`. No es un modelo de propósito general: es un componente especializado que lee un turno de una transcripción de codificación multiagente junto con una vista compacta del grafo de tareas acumulado (contexto "v0.3-lean") y emite un parche JSON que actualiza ese grafo con roles, estados de actor, tareas nuevas o modificadas, decisiones y relaciones, cada uno respaldado por una cita textual exacta (esquema v0.2).

El adaptador se entrena con LoRA de rango 16 sobre las proyecciones de atención del modelo base, un MoE de 30 000 millones de parámetros totales con aproximadamente 3 000 millones activos por token según la nomenclatura del modelo Qwen3-30B-A3B. El contexto de entrenamiento es de 8192 tokens y el conjunto de datos son 1908 filas (9,71 millones de tokens) derivadas de 1200 turnos de origen del dataset `CKL/wow-cod-thps4-gamejam`, con dos épocas de entrenamiento en Nebius Token Factory en unos 22 minutos.

Su relevancia es acotada pero concreta: demuestra que un adaptador pequeño (0,1 GB de repositorio) sobre un MoE abierto puede aproximarse a un modelo frontera propietario en una tarea estructurada de extracción y etiquetado, con un coste estimado por cada 1000 turnos de aproximadamente 0,73 USD frente a los 14,06 USD de Claude Haiku 4.5, es decir, un ahorro del orden del 91 % en la comparación de precios de tokens planteada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen3-30B-A3B; objetivos `q_proj`, `k_proj`, `v_proj`, `o_proj` (solo atención) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-30B-A3B tiene 30B totales (dato de nomenclatura, no confirmado en la informacion proporcionada) |
| Parametros activos | No disponible para el adaptador; el base es MoE con activación parcial (nomenclatura A3B) |
| Longitud de contexto | 8192 tokens en entrenamiento; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el ejemplo usa `bfloat16`) |
| Idiomas soportados | No disponible |
| Licencia | CC BY 4.0 para el adaptador; el modelo base Qwen3-30B-A3B-Instruct-2507 se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base en formato completo |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05 aplicado exclusivamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del transformer MoE subyacente. No se modifican las capas MLP ni los expertos del MoE. El entrenamiento se realizó en Nebius Token Factory con learning rate 1e-4, batch de 16, contexto de 8192 tokens, packing activado y 2 épocas sobre 1908 filas (9,71 millones de tokens) del split `sft/v2-8k-fit` del dataset `CKL/wow-cod-thps4-gamejam`, usando turnos de origen 1 a 1200. La pérdida final fue de 0,086 en entrenamiento y 0,171 en validación en el paso 210.

Los datos de supervisión se generaron con dos modelos maestros ("teachers"): Claude Haiku 4.5 y NVIDIA Nemotron 3 Ultra, ambos con la misma rúbrica v0.3-lean. La tarea es de etiquetado estructurado: dado un turno y el estado del grafo, producir un parche JSON válido conforme al esquema v0.2. No se menciona RLHF ni DPO; el pipeline es SFT supervisado sobre etiquetas de modelos maestros. La innovación destacable no está en la arquitectura sino en el formato de salida: parches incrementales con citas textuales exactas que permiten auditar cada actualización del grafo.

## Capacidades

- Generación de parches JSON estructurados sobre un grafo de tareas, con validación de esquema v0.2.
- Extracción de roles y estados de actor a partir de transcripciones de conversaciones multiagente.
- Identificación de tareas nuevas o modificadas, decisiones y relaciones entre entidades.
- Anclaje de cada extracción a una cita textual exacta del turno de entrada (grounding verificable).
- Etiquetado de estado de tareas (status agreement) y de tareas "tocadas" en el turno.
- Procesamiento de contexto compacto "v0.3-lean" con el estado acumulado del grafo.
- No se documentan capacidades de tool calling, agentes autónomos, visión, audio ni modo thinking; el autor indica que la evaluación se hizo con thinking desactivado.
- Capacidades multilingües: no disponibles; el dataset y la rúbrica son específicos del dominio.

## Casos de uso

- Monitorización de sesiones de codificación multiagente: el adaptador consume cada turno de la transcripción y emite un parche que actualiza el grafo de tareas, permitiendo reconstruir en tiempo real qué agente hizo qué y con qué estado. Es adecuado porque su salida es un JSON validable con citas verificables.
- Generación de resúmenes estructurados de reuniones o hilos de desarrollo: a partir de un turno y el estado previo, produce tareas, decisiones y relaciones con referencia textual, lo que facilita la revisión humana.
- Construcción de paneles de seguimiento ("swarm dashboard"): el repositorio companion `C-K-Loan/swarm-dashboard` y la demo interactiva `ckl.sh/demos/swarm-board` muestran cómo se reproduce el grafo de tareas a partir de los parches generados.
- Auditoría de decisiones en proyectos de game jam: el dataset de origen es un game jam (WoW x CoD x THPS4), y el adaptador puede etiquetar qué decisiones se tomaron en cada turno y quién las respaldó, con cita textual para trazabilidad.
- Extracción de entidades y relaciones en dominios conversacionales acotados: el esquema v0.2 (actores, tareas, decisiones, relaciones) es reutilizable en otros dominios siempre que se reentrene el adaptador con la misma rúbrica.
- Despliegue de bajo coste en producción: con un coste estimado de 0,73 USD por 1000 turnos frente a 14,06 USD del modelo maestro, es viable procesar transcripciones largas en lote sobre una única H100 con vLLM y LoRA habilitado.
- Sustitución de un modelo propietario en pipelines de etiquetado offline: el adaptador alcanza un 93,9 % de salida válida y un F1 de 58,7 en tareas tocadas, lo que permite procesar grandes volúmenes con validación automática y revisión humana solo de los casos inválidos.

## Benchmarks y rendimiento

Evaluación sobre 131 turnos retenidos (1203 a 1335, nunca vistos en entrenamiento), con teacher forcing y comparación contra etiquetas de Claude Haiku 4.5. Un parche inválido cuenta como parche vacío. Todas las variantes usaron los mismos prompts y thinking desactivado. Los números miden acuerdo con un modelo de referencia, no exactitud factual.

| Metrica | Qwen3-30B-A3B base | LoRA v1 | LoRA v2 | Qwen3-235B fp8 (sin ajuste) | Nemotron 3 Ultra (sin ajuste, tambien maestro) |
|---|---|---|---|---|---|
| Salida valida | 77,1 % | 88,5 % | 93,9 % | 93,9 % | 99,2 % |
| F1 tareas tocadas | 37,7 | 57,2 | 58,7 | 57,8 | 64,6 |
| F1 tareas tocadas (98 turnos con tarea) | 17,7 | 57,1 | 58,0 | 46,6 | 59,9 |
| Acuerdo de estado de tarea | 69,0 % | 70,5 % | 66,4 % | 61,0 % | 67,0 % |
| Coincidencia de rol de actor | 36,6 % | 97,6 % | 97,6 % | 97,6 % | 63,4 % |
| Coincidencia de estado de actor | 36,6 % | 22,0 % | 26,8 % | 39,0 % | 31,7 % |
| Relaciones por turno (Haiku: 0,47) | 0,00 | 0,07 | 0,16 | 0,19 | 0,47 |

Coste estimado por 1000 turnos (comparación hipotética de precios de tokens): familia LoRA en torno a 0,73 USD (tokens propios de v2 a la tarifa base de Qwen3-30B-A3B Token Factory; en la práctica se ejecutó en horas de GPU de Modal) frente a aproximadamente 14,06 USD de Claude Haiku 4.5 (precio de lista, con sus propios prompts). Sobre el mismo prompt, el ahorro es de aproximadamente el 91 %.

## Requisitos de hardware

- El adaptador pesa 0,1 GB, pero requiere cargar el modelo base completo Qwen3-30B-A3B-Instruct-2507 en memoria; la VRAM estimada depende de la cuantización del base, no del adaptador.
- El ejemplo oficial usa vLLM con `--dtype bfloat16` sobre una única H100 para la evaluación; en bfloat16 el modelo base de 30B totales requiere del orden de 60 GB solo en pesos, más caché KV para 16 384 tokens de contexto.
- GPU recomendadas: H100 (usada en la evaluación), A100 80 GB; no se documenta funcionamiento en RTX 4090 ni en GPUs de consumo con el base en bfloat16.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules cct=...`; el autor indica que Nebius Token Factory no podía servir este fine-tune en el momento del entrenamiento.
- Latencia y throughput: no disponibles; el autor solo reporta el coste por 1000 turnos y el tiempo de entrenamiento (unos 22 minutos).
- El prompt debe respetar exactamente el formato de chat del conjunto de entrenamiento: `system` con la rúbrica v0.3-lean y `user` con el JSON de contexto compacto, invocando `model: "cct"`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Salida valida | F1 tareas tocadas | Licencia |
|---|---|---|---|---|---|---|
| CCT v03-lean LoRA v2 | LoRA sobre MoE | 30B totales (base) | 8192 en entrenamiento | 93,9 % | 58,7 | CC BY 4.0 (adaptador) |
| Qwen3-30B-A3B-Instruct-2507 sin ajuste | MoE base | 30B totales | No disponible | 77,1 % | 37,7 | Apache 2.0 |
| Qwen3-235B fp8 sin ajuste | MoE denso grande | 235B (nomenclatura) | No disponible | 93,9 % | 57,8 | No disponible en la informacion |
| Nemotron 3 Ultra sin ajuste | Modelo frontera | No disponible | No disponible | 99,2 % | 64,6 | No disponible en la informacion |
| Claude Haiku 4.5 | Propietario | No disponible | No disponible | Referencia | Referencia | Propietaria |

La comparación es específica de la tarea de etiquetado de parches de grafo; no se dispone de resultados en benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador.

## Limitaciones y advertencias

- No se han publicado resultados en benchmarks generales; los únicos datos son de la tarea específica de etiquetado de parches de grafo y miden acuerdo con Claude Haiku 4.5, no exactitud factual.
- El acuerdo de estado de tarea empeora respecto a la versión base (66,4 % frente a 69,0 %) y el de estado de actor es bajo (26,8 %), por debajo del modelo base (36,6 %) y de Qwen3-235B (39,0 %).
- La generación de relaciones por turno es muy inferior a la referencia (0,16 frente a 0,47 de Haiku), lo que indica infraextracción de relaciones.
- El adaptador fue entrenado en parte con salidas de Claude Haiku 4.5; los términos de Anthropic pueden restringir el uso de salidas de Claude para desarrollar modelos, por lo que conviene revisar las condiciones aplicables antes de usar o redistribuir el adaptador.
- La licencia CC BY 4.0 del adaptador no sustituye a la del modelo base (Apache 2.0); el uso comercial requiere cumplir ambas.
- El dominio está acotado a transcripciones de codificación multiagente y a la rúbrica v0.3-lean; el rendimiento fuera de ese formato o dominio no está documentado.
- Idiomas soportados no disponibles; el dataset y la rúbrica son específicos y no se declara cobertura multilingüe.
- El adaptador solo modifica las proyecciones de atención; no se espera mejora en capacidades generales del modelo base.
- Riesgo de alucinación en las citas textuales: aunque el esquema exige una cita exacta, no se documenta una validación automática de que la cita exista en el turno de entrada.
- El despliegue requiere cargar el modelo base completo; no es viable en GPUs de consumo con el base en bfloat16 según la información disponible.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/CKL/cct-v03-lean-qwen3-30b-a3b-lora-r16-v2
- Adaptador v1: https://huggingface.co/CKL/cct-v03-lean-qwen3-30b-a3b-lora-r16-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset: https://huggingface.co/datasets/CKL/wow-cod-thps4-gamejam
- Vídeo explicativo: https://youtu.be/mSBVHdznFGI
- Repositorio de código: https://github.com/C-K-Loan/swarm-dashboard
- Demo interactiva: https://ckl.sh/demos/swarm-board
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
