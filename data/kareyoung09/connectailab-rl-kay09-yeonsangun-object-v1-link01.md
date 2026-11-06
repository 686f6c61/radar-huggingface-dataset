# kareyoung09/connectailab-rl-kay09-yeonsangun-object-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (PPO) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su funcion es actuar como modulo de decision de alto nivel para el robot bipedo LINK-01: a partir de la informacion de observacion del entorno, el modelo selecciona la accion de alto nivel "elegir objeto" (choose_object). No es un modelo de proposito general, sino un componente especializado dentro de una arquitectura robotica.

El modelo resuelve un problema concreto de la robotica de servicio: traducir observaciones multimodales o textuales del entorno en decisiones discretas de accion que un planificador de bajo nivel pueda ejecutar. Al estar construido sobre un modelo de lenguaje de 0,8 mil millones de parametros y ajustarse mediante PPO con LoRA, mantiene un coste computacional muy bajo, lo que permite desplegarlo en el propio robot o en hardware de borde.

Es relevante ahora porque demuestra un patron emergente: usar modelos de lenguaje pequenos como cabezas de decision (policy heads) en sistemas roboticos, en lugar de entrenar politicas desde cero. La model card reporta una tasa de acierto del 100 % en el conjunto de prueba y un 100 % de exito en 20 episodios de conduccion real, aunque se trata de metricas autoinformadas por el autor y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3.5-0.8B); entrenamiento con PPO |
| Parametros totales | No disponible (adaptador LoRA; el base tiene 0,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | PEFT |
| Pipeline | Reinforcement-learning |
| Tamano del repositorio | 0,0 GB (adaptador de pesos ligeros) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, un transformer decoder de 0,8 mil millones de parametros. El ajuste se realiza mediante PPO (Proximal Policy Optimization), un algoritmo de aprendizaje por refuerzo profundo, en lugar de un ajuste supervisado clasico. La politica aprende a mapear observaciones del robot LINK-01 a la accion de alto nivel choose_object, con una recompensa derivada del exito de la tarea.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el numero de episodios de RL ni los hiperparametros de PPO (learning rate, clipping, numero de pasos). Tampoco se detalla si hubo fases previas de SFT o DPO. La innovacion principal es el propio planteamiento: usar un LLM pequeno como policy head entrenado con RL para decision robotica, lo que reduce drasticamente los requisitos de computo frente a entrenar una politica desde cero.

## Capacidades

- Decision de alto nivel en robotica: selecciona la accion choose_object a partir de observaciones del robot LINK-01.
- Razonamiento sobre estado del entorno: interpreta la informacion de observacion y emite una accion discreta.
- Aprendizaje por refuerzo: politica optimizada con PPO para maximizar la recompensa de la tarea.
- Idioma coreano: entrenado y evaluado en coreano.
- Despliegue ligero: al ser un adaptador LoRA sobre un base de 0,8 B, el coste de inferencia es minimo.
- No consta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni thinking mode explicito.

## Casos de uso

- Control de alto nivel de robot bipedo: el modelo recibe el estado observado del LINK-01 y emite la decision choose_object, que un planificador de bajo nivel traduce en movimiento. Adecuado por su latencia baja y su especializacion en esta tarea.
- Seleccion de objetos en entornos de servicio: en un escenario de asistencia domestica, el robot identifica que objeto debe recoger o manipular segun la observacion, usando el modelo como modulo de decision.
- Investigacion en RL para robotica: sirve como referencia reproducible de como adaptar un LLM pequeno con PPO para tareas de decision, util para comparar con politicas entrenadas desde cero.
- Prototipado rapido en laboratorio: al ser un adaptador LoRA de bajo peso, se puede cargar y probar en una GPU de consumo para iterar sobre el diseno de recompensas.
- Sistemas embebidos y edge computing: su tamano reducido permite ejecutarlo en hardware limitado junto al robot, sin depender de la nube.
- Benchmark de personas/escenarios: la model card indica una persona concreta (yeonsangun) y una tarea (choose_object); el mismo patron puede replicarse para otras tareas y personas dentro del proyecto LINK-01.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor en la model card:

| Metrica | Resultado |
|---|---|
| Tasa de acierto en prueba (Accuracy) | 100,0 % |
| Exito en 20 episodios de conduccion real (Drive Success) | 100,0 % |
| Metodo de entrenamiento | RL (PPO) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores son autoinformadas y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un base de 0,8 B, la inferencia en FP16 requiere aproximadamente 2 GB de VRAM; en cuantizacion de 4 bits puede bajar de 1 GB. Cifras estimadas, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de borde como Jetson Orin.
- Cabe en GPU consumer: si, con margen amplio, incluso en GPUs de gama baja.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan confirmados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (adaptadores RL para decision robotica sobre LLM pequenos) con datos verificables.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo emite la accion choose_object para la persona yeonsangun; no es un modelo de proposito general ni sirve para otras tareas sin reentrenamiento.
- Metricas no verificadas: el 100 % de acierto y exito procede de la model card del autor, sin validacion independiente ni detalle del conjunto de prueba.
- Idioma: solo coreano; no se garantiza comportamiento en castellano ni en otros idiomas.
- Dependencia del modelo base: requiere Qwen/Qwen3.5-0.8B y la libreria PEFT; cualquier cambio en el base puede alterar el comportamiento.
- Riesgo de sobreajuste: con una unica tarea y una unica persona, la politica puede no generalizar a entornos, objetos o condiciones no vistas.
- Sin informacion sobre sesgos, alucinacion o robustez en produccion; al ser un modulo de decision robotica, los errores pueden tener consecuencias fisicas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Documentacion escasa: no se detallan hiperparametros, dataset ni procedimiento de evaluacion, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-yeonsangun-object-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Libreria PEFT: https://github.com/huggingface/peft
- Proyecto CONNECT AI LAB × AI CITY BUILDERS (LINK-01): no disponible enlace directo en la informacion proporcionada.
