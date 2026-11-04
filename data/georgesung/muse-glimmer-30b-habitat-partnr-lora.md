# georgesung/Muse-Glimmer-30B-Habitat-PARTNR-Lora

## Resumen

Muse Glimmer 30B + RL for PARTNR es un adaptador LoRA sobre el modelo base Muse Glimmer 30B (meta-models/Muse-Glimmer-30B), desarrollado por el autor georgesung. El adaptador se entrena con GRPO online para actuar como planificador de alto nivel en el benchmark PARTNR de Meta, integrado en Habitat 3.0, donde un robot Spot y un humano simulado deben completar tareas domésticas descritas en lenguaje natural de forma conjunta. La unica senal de recompensa es el exito de la tarea, sin demostraciones humanas ni etiquetas.

El modelo resuelve el problema de la planificacion multiagente en entornos de IA encarnada (embodied AI): dado un objetivo en lenguaje natural, el planificador debe coordinar las acciones de dos agentes con habilidades motoras idealizadas. El adaptador mejora la tasa de exito del modelo base en el conjunto de validacion de PARTNR, pasando de 782 a 810 tareas completadas de 1000, con una mejora pareada de +2,8 puntos (SE 1,1, p = 0,015).

Es relevante porque demuestra que el ajuste fino con RL sobre un LLM de 30B puede mejorar el rendimiento en planificacion encarnada sin supervisión humana, y porque publica el codigo, el metodo y la evaluacion de forma abierta. El adaptador tiene rango 32 y se sirve en vLLM junto al modelo base con decodificacion especulativa DFlash. La licencia es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Muse Glimmer 30B; atencion (q, k, v, o) y MLP (gate, up, down) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 30B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens (configuracion de servicio en vLLM) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en fp32; servicio en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Muse Glimmer 30B, un transformer de 30B parametros, mediante LoRA de rango 32 y alpha 64, sin dropout, sobre las proyecciones de atencion (q, k, v, o) y de la MLP (gate, up, down) del modelo de lenguaje. Los pesos del adaptador se almacenan en fp32. El entrenamiento usa GRPO online durante 200 actualizaciones, con 8 rollouts por tarea a temperatura 1 y una recompensa compartida por ambos agentes basada unicamente en el exito de la tarea. La tasa de aprendizaje es 1e-5 y se uso PEFT 0.21.2 sobre la revision `cec94fcfd6512f2cfe708138c32533b346ea4f69` del modelo base.

El entrenamiento y la evaluacion se realizaron con el planificador nativo de tool calling del repositorio (`NativeToolsPlanner`, fuerza de razonamiento baja). El adaptador se selecciono sobre una particion de desarrollo de PARTNR train antes de su evaluacion en validacion. Una continuacion del mismo entrenamiento hasta 300 actualizaciones (denominada `p273`) obtuvo 793 en validacion y no supero al modelo base tras la comprobacion de re-ejecucion (13 victorias, 16 derrotas), lo que indica que las 100 actualizaciones adicionales provocaron deriva y revirtieron la mayor parte de la mejora.

## Capacidades

- Planificacion de alto nivel multiagente en entornos simulados de Habitat 3.0 (PARTNR).
- Generacion de planes de accion para dos agentes (robot Spot y humano simulado) a partir de instrucciones en lenguaje natural.
- Uso de tool calling nativo mediante el planificador `NativeToolsPlanner` del repositorio.
- Razonamiento multi-paso para descomponer tareas domesticas en subtareas ejecutables.
- Aprendizaje por refuerzo sin demostraciones humanas (recompensa basada solo en exito de tarea).
- Servicio con decodificacion especulativa DFlash mediante el modelo asistente `meta-models/Muse-Glimmer-30B-assistant`.
- Capacidades generales del modelo base Muse Glimmer 30B: no evaluadas ni documentadas en esta ficha.

## Casos de uso

- Planificacion de tareas domesticas en simulacion: el adaptador genera el plan de alto nivel para que un robot Spot y un humano simulado completen tareas como recoger objetos o limpiar, usando el exito de la tarea como criterio de evaluacion en PARTNR.
- Investigacion en IA encarnada: sirve como punto de partida para experimentos de RL con GRPO sobre LLMs en entornos de simulacion, ya que el codigo, el metodo y la evaluacion estan publicados en `github.com/georgesung/muse-habitat`.
- Evaluacion de planificadores multiagente: permite comparar el rendimiento de un planificador ajustado con RL frente al modelo base en las 1000 tareas de validacion de PARTNR en 12 casas no vistas durante el entrenamiento.
- Desarrollo de sistemas de coordinacion humano-robot: el adaptador aprende a repartir tareas entre dos agentes con habilidades motoras idealizadas, un escenario relevante para el diseno de interfaces de colaboracion.
- Reproduccion de experimentos de RL: los scripts `scripts/glimmer_serve_lora.sh` y `scripts/dev_eval.sh` permiten replicar el servicio en vLLM con carga del adaptador en tiempo de ejecucion y la evaluacion en el conjunto de desarrollo.
- Base para ajuste fino en otros benchmarks de embodied AI: la receta de LoRA rango 32 con GRPO online y recompensa de exito de tarea es reutilizable en otros entornos de simulacion con estructura similar.
- Servicio en produccion de investigacion: el adaptador se carga dinamicamente en vLLM con `VLLM_ALLOW_RUNTIME_LORA_UPDATING=1`, lo que facilita alternar entre el modelo base y el ajustado sin reiniciar el servidor.

## Benchmarks y rendimiento

PARTNR val: 1000 tareas en 12 casas que nunca aparecen en entrenamiento. Decodificacion greedy, una ejecucion por tarea.

| Planificador | Exito (de 1000) | Proporcion de condiciones de tarea completadas | Episodios en el limite de 20 000 pasos |
|---|---|---|---|
| Muse Glimmer 30B | 782 | 0,871 | 193 |
| + este adaptador | 810 | 0,893 | 109 |

- Emparejado en las mismas 1000 tareas: +2,8 puntos (SE 1,1), mejor en 76 tareas, peor en 48, test de signos p = 0,015.
- Las ejecuciones greedy no son exactamente reproducibles, por lo que se re-ejecutaron las tareas donde los modelos discreparon. Entre las tareas con el mismo resultado en ambas ejecuciones, el adaptador supera al modelo base en 25 y pierde en 9 (p = 0,009).
- El adaptador se selecciono sobre una particion de desarrollo de PARTNR train antes de su ejecucion en validacion.
- La continuacion a 300 actualizaciones (`p273`) obtuvo 793 en validacion y no supero al modelo base (13 victorias, 16 derrotas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 30B parametros y se sirve en bfloat16, lo que requiere aproximadamente 60 GB de VRAM solo para los pesos, mas memoria para el contexto de 32 768 tokens y el adaptador LoRA.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para servir el modelo base en bfloat16 con contexto completo.
- Cabe en GPU de consumo: no disponible; un modelo de 30B en bfloat16 no cabe en GPUs de consumo de 24 GB sin cuantizacion, y no se documentan opciones de cuantizacion para este adaptador.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 64`, carga dinamica del adaptador mediante `POST /v1/load_lora_adapter`, y decodificacion especulativa DFlash con `meta-models/Muse-Glimmer-30B-assistant`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PARTNR val (exito/1000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B (base) | 30B | 32 768 | 782 | Apache 2.0 | HuggingFace |
| Muse Glimmer 30B + este adaptador | 30B + LoRA r32 | 32 768 | 810 | Apache 2.0 | HuggingFace |
| Muse Glimmer 30B + adaptador p273 (300 updates) | 30B + LoRA r32 | 32 768 | 793 | Apache 2.0 | No publicado |

No se dispone de datos de otros planificadores comparables en PARTNR en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en PARTNR; no se realizaron mediciones de habilidad general ni de ninguna otra tarea.
- Solo simulacion, con las habilidades motoras idealizadas de PARTNR: el modelo genera el plan de alto nivel y no controla motores. Nada de esto se ha ejecutado en un robot real.
- La mejora es modesta y las ejecuciones son ruidosas: hay tareas en las que el modelo base rinde mejor.
- Las ejecuciones greedy no son exactamente reproducibles, lo que complica la comparacion directa entre modelos.
- El entrenamiento adicional hasta 300 actualizaciones provoco deriva y revirtio la mayor parte de la mejora.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma especificas.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales documentadas para uso comercial.
- Los resultados dependen del planificador `NativeToolsPlanner` con fuerza de razonamiento baja; otros planificadores pueden no reproducir las cifras.
- El adaptador se sirve junto al modelo base de 30B, lo que implica requisitos de hardware elevados.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/georgesung/Muse-Glimmer-30B-Habitat-PARTNR-Lora
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo asistente para decodificacion especulativa DFlash: https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant
- Codigo, metodo y evaluacion: https://github.com/georgesung/muse-habitat
- Benchmark PARTNR: https://github.com/facebookresearch/partnr-planner
