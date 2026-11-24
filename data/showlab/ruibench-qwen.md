# showlab/RUIBench-Qwen

## Resumen

RUIBench-Qwen es una colección de adaptadores LoRA que ajustan el modelo multimodal Qwen3.5-4B para operar un robot a través de una interfaz de uso robótico (robot-use interface, RUI) definida en el benchmark RUIBench. Lo desarrolla el grupo showlab y se publica bajo licencia Apache 2.0. El problema que aborda es la evaluacion sistematica de como la interfaz de interaccion entre un modelo de lenguaje y un robot condiciona el exito de las tareas de manipulacion: en lugar de entrenar un unico modelo de control, se entrena un adaptador por cada interfaz, de modo que cada uno aprende a emitir las llamadas de herramienta especificas de esa interfaz.

El repositorio contiene doce adaptadores, cada uno en una carpeta con el nombre de su interfaz (joint, delta, step, pose, point, skill y sus variantes program-*). Todos comparten el mismo modelo base, Qwen3.5-4B, con el codificador visual congelado y LoRA de rango 64 sobre todas las capas lineales del modelo de lenguaje. La evaluacion se realiza en simulacion (Isaac Sim) sobre 30 tareas con cinco misiones de test cada una, con el modo de razonamiento (thinking) desactivado.

La relevancia actual del modelo es doble: por un lado, demuestra que la eleccion de interfaz cambia drasticamente la tasa de exito (del 0,0 % al 46,7 % en zero-shot segun la interfaz, y del 12,7 % al 46,7 % tras el ajuste fino), y por otro ofrece un conjunto de adaptadores reutilizables y un protocolo de servicio con vLLM que cualquier equipo puede reproducir para investigar agentes roboticos basados en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre un transformer multimodal (Qwen3.5-4B) con codificador visual congelado |
| Parametros totales | 4B en el modelo base; los adaptadores LoRA anaden un numero no disponible de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens (valor de `--max-model-len` usado en el despliegue de referencia) |
| Tipos de cuantizacion | no disponible en la model card; al ser adaptadores PEFT, la cuantizacion depende del servicio del modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base se sirve aparte |
| Rango LoRA | 64 (alpha 128, dropout 0,05) |
| Tamano del repositorio | 6,2 GB |
| Libreria | peft |
| Pipeline | robotics (image-text-to-text) |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 64 y alpha 128 con dropout 0,05 aplicado a todas las capas lineales del modelo de lenguaje de Qwen3.5-4B; el codificador visual permanece congelado. El entrenamiento se realizo con LlamaFactory sobre la plantilla de chat sin razonamiento (`qwen3_5_nothink`), con 10 epocas, tasa de aprendizaje 1e-4, scheduler coseno, 5 % de warm-up, tamano de lote 32 y precision bf16. Los datos son trayectorias generadas a traves de la propia interfaz del adaptador, en nivel facil y nunca con las misiones de test; se entrena una fila por peticion al modelo y solo la respuesta (`mask_history`).

Hay una diferencia relevante entre adaptadores: los de Joint, Delta, Program-Joint y Program-Delta se entrenaron sobre una exportacion anterior de las trayectorias, en la que los adaptadores por accion aprendian a escribir una linea corta indicando el origen de cada objetivo antes de las llamadas de herramienta. Los adaptadores Step, Pose, Point y Skill (por accion y program) usan exactamente las exportaciones publicadas en el dataset `showlab/RUIBench-Rollouts`, con las respuestas reducidas a sus llamadas de herramienta y solo las rutas de imagen modificadas para hacerlas portables.

## Capacidades

- Generacion de llamadas de herramienta (tool calling) especificas de cada interfaz robótica: joint, delta, step, pose, point y skill, en variante por accion y en variante programatica (program-*).
- Razonamiento multimodal imagen-texto: el modelo base procesa observaciones visuales del entorno simulado junto con el estado de la tarea.
- Operacion de agentes de un solo paso dentro del bucle minimo de RUIKit, con el modo de razonamiento desactivado.
- Escritura de programas de acciones (variantes `program-*`) frente a acciones individuales (variantes por accion).
- Interaccion multi-turno dentro de un episodio: cada peticion del agente recibe una respuesta con la siguiente llamada de herramienta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de audio ni de vision mas alla de la observacion del entorno simulado.

## Casos de uso

- Investigacion sobre interfaces robot-modelo: comparar doce interfaces bajo el mismo modelo base y el mismo protocolo de evaluacion para aislar el efecto de la interfaz en la tasa de exito (del 12,7 % al 46,7 % en los adaptadores ajustados).
- Desarrollo de agentes roboticos en simulacion: servir el modelo con vLLM y ejecutar episodios con RUIKit sobre Isaac Sim, usando el adaptador de la interfaz objetivo como modelo servido (`local:program-joint`, etc.).
- Evaluacion reproducible de modelos de lenguaje para robotica: el par adaptador + dataset de rollouts permite repetir el ajuste fino y verificar las cifras publicadas en la tabla 3 del paper.
- Prototipado de control por lenguaje natural de bajo coste: el modelo base de 4B y los adaptadores LoRA caben en una unica GPU, lo que facilita ciclos de iteracion rapidos en laboratorio.
- Ensenanza y docencia: el repositorio incluye guia de instalacion de RUIBench e Isaac Sim, lo que permite montar practicas sobre agentes multimodales con tool calling.
- Base para ajuste fino propio: los adaptadores sirven como punto de partida (rank 64, todas las capas lineales) para entrenar interfaces nuevas o dominios roboticos distintos.
- Referencia para el diseno de APIs de robot: los resultados por interfaz informan decisiones de diseno sobre como exponer acciones (pose, point o skill) a un modelo de lenguaje.

## Benchmarks y rendimiento

Tasa de exito (%) en simulacion sobre 30 tareas con cinco misiones de test cada una, con el bucle de agente minimo de RUIKit y thinking desactivado. Cada adaptador se evalua solo en su propia interfaz.

| Interfaz | Id | Zero-shot | Ajustado |
|---|---|---:|---:|
| Joint (por accion) | `rui.joint/v1` | 2,0 | 12,7 |
| Delta (por accion) | `rui.delta/v1` | 3,3 | 21,3 |
| Step (por accion) | `rui.step/v1` | 0,0 | 20,0 |
| Pose (por accion) | `rui.pose/v1` | 0,0 | 46,7 |
| Point (por accion) | `rui.point/v1` | 0,0 | 35,3 |
| Skill (por accion) | `rui.skill/v1` | 6,7 | 41,3 |
| Program-Joint | `rui.code-joint/v1` | 2,7 | 22,0 |
| Program-Delta | `rui.code-delta/v1` | 2,0 | 14,0 |
| Program-Step | `rui.code-step/v1` | 0,0 | 16,7 |
| Program-Pose | `rui.code/v1` | 0,0 | 30,0 |
| Program-Point | `rui.code-point/v1` | 0,0 | 26,7 |
| Program-Skill | `rui.code-skill/v1` | 6,7 | 41,3 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para estos adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 4B en bf16 requiere aproximadamente 8-9 GB de pesos, mas el coste del codificador visual y la cache KV para 131 072 tokens de contexto, que puede ser considerable.
- GPU recomendadas: A100 o H100 para servir con la longitud de contexto completa de 131 072 tokens y varios adaptadores LoRA simultaneos; RTX 4090 (24 GB) es viable con contexto reducido o cuantizacion.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 con contexto moderado; no confirmado en la informacion disponible.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 64`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3` y `--default-chat-template-kwargs '{"enable_thinking": false}'`. El cliente es RUIKit, que apunta a `http://127.0.0.1:8000/v1` (configurable con `RUIKIT_LOCAL_BASE_URL`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RUIBench-Qwen | 4B (base) + LoRA rango 64 | 131 072 tokens | Agentes roboticos con tool calling por interfaz | Apache 2.0 | Hugging Face + codigo en GitHub |
| Qwen3.5-4B (base) | 4B | no disponible | Modelo multimodal generalista | no disponible | Hugging Face |
| Alternativas de control roboticos basados en LLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El entrenamiento se realizo solo con trayectorias de nivel facil y nunca con las misiones de test, de modo que el rendimiento en tareas dificiles o fuera de distribucion no esta caracterizado.
- Las tasas de exito absolutas son moderadas (maximo 46,7 % en Pose y Skill); no es un modelo listo para produccion robotica real sin validacion adicional.
- La evaluacion es exclusivamente en simulacion (Isaac Sim); no hay evidencia de transferencia a hardware fisico.
- Cada adaptador esta especializado en una unica interfaz y se evalua solo en ella; no se ha verificado su comportamiento cruzado entre interfaces.
- Los adaptadores Joint, Delta, Program-Joint y Program-Delta se entrenaron con una exportacion anterior de datos y difieren del dataset publicado; las cifras no son directamente comparables entre esos cuatro y el resto.
- El modo de razonamiento debe estar desactivado (`enable_thinking: false`); el comportamiento con thinking activado no esta documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; en un agente robotico, una llamada de herramienta mal formada puede traducirse en una accion fallida o insegura.
- Idiomas soportados: no disponibles; no se documenta el rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validar la seguridad del control fisico recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/showlab/RUIBench-Qwen
- Paper: https://arxiv.org/abs/2611.31115
- Codigo: https://github.com/showlab/RUIBench
- Dataset de entrenamiento: https://huggingface.co/datasets/showlab/RUIBench-Rollouts
- Pagina del proyecto: https://showlab.github.io/RUIBench/
- Guia de inicio: https://github.com/showlab/RUIBench/blob/main/docs/GETTING_STARTED.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework de ajuste: https://github.com/hiyouga/LLaMA-Factory
