# kareyoung09/connectailab-rl-kay09-sejong-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS (LINK-01 Project). Su funcion es actuar como modulo de decision de alto nivel para un robot bipedo denominado LINK-01: a partir de la informacion de observacion del robot, el modelo selecciona la accion de alto nivel que debe ejecutar el sistema de control. La tarea concreta de esta version es `goto_target` (dirigirse a un objetivo), con la persona `sejong`.

El modelo no es un modelo de lenguaje de proposito general, sino un adaptador de aprendizaje por refuerzo (etiquetado como PPO y deep-reinforcement-learning) que reutiliza la capacidad de razonamiento de un LLM pequeno para mapear observaciones a decisiones discretas. Con solo 0.8B parametros en el modelo base, el objetivo es un despliegue ligero y de baja latencia en el bucle de control del robot.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso emergente (LLMs como planificadores de alto nivel en robotica); por otro, los datos publicados son muy limitados (0 descargas, 0 likes, repositorio de 0.0 GB y model card minima), por lo que muchas especificaciones tecnicas no estan disponibles y se indican como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | No disponible (el modelo base tiene 0.8B; el adaptador LoRA no publica su numero de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA cargado sobre Qwen/Qwen3.5-0.8B mediante la libreria PEFT. No se reentrena el modelo base completo: se anaden matrices de bajo rango que adaptan el transformer decoder-only a la tarea de decision. El pipeline declarado es `reinforcement-learning`, con etiquetas que mencionan PPO y deep-reinforcement-learning, si bien la model card indica que el "mejor metodo" empleado fue SFT (supervised fine-tuning). Esta aparente contradiccion (tags de RL frente a metodo SFT) no se aclara en la informacion disponible.

No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La unica informacion de evaluacion disponible es la tasa de acierto en el examen (`Accuracy` 72.2%) y la tasa de exito en 20 rondas de conduccion real (`Drive Success` 40.0%).

## Capacidades

- Decision de alto nivel para robotica: dado un conjunto de observaciones del robot bipedo LINK-01, selecciona la accion de alto nivel correspondiente a la tarea `goto_target`.
- Mapeo observacion-accion en el marco de un proyecto de aprendizaje por refuerzo (etiquetas PPO y deep-reinforcement-learning).
- Comprension y generacion en coreano (unico idioma declarado).
- Razonamiento basico heredado del modelo base Qwen3.5-0.8B, reutilizado como policy de decision.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Planificacion de navegacion en robot bipedo: el modelo recibe el estado observado del robot y emite la accion de alto nivel para dirigirse a un objetivo; es adecuado por su tamano reducido (base de 0.8B) y su entrenamiento especifico en la tarea `goto_target`.
- Bucle de control de baja latencia: al ser un adaptador sobre un modelo de 0.8B, puede ejecutarse en hardware modesto dentro del ciclo de decision del robot, reduciendo la dependencia de infraestructura en la nube.
- Prototipado de politicas de decision en robotica: sirve como punto de partida para experimentar con LLMs como planificadores de alto nivel antes de escalar a modelos mayores.
- Investigacion en RL aplicado a robotica: util como referencia reproducible de un adaptador LoRA entrenado para una tarea concreta (con las metricas publicadas de accuracy y drive success).
- Evaluacion comparativa de personas/estilos de control: la model card identifica una "persona" (`sejong`), lo que permite comparar variantes de comportamiento del mismo robot.
- Integracion en simulacion o gemelo digital: el adaptador puede cargarse con `transformers` + `peft` en un entorno de simulacion para validar la politica antes de desplegarla en el robot fisico.
- Demostraciones educativas de PEFT en robotica: el codigo de carga (tres lineas con `PeftModel.from_pretrained`) facilita su uso en docencia y talleres.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy (tasa de acierto en el examen) | 72.2% |
| Drive Success (exito en 20 rondas de conduccion real) | 40.0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo base de 0.8B, la huella es reducida (del orden de pocos GB en fp16, sin cifra oficial publicada).
- GPU recomendadas: no disponible. Por el tamano del modelo base, es plausible su ejecucion en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- Cabe en GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: carga via `transformers` + `peft` (documentado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA para decision en robotica sobre modelos de ~0.8B).

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea `goto_target` para el robot LINK-01; no es un modelo de proposito general.
- Tasa de exito real limitada: el 40.0% de exito en 20 rondas de conduccion real indica un rendimiento insuficiente para despliegues autonomos sin supervision.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no evaluado; al ser un LLM pequeno adaptado a decision, puede emitir acciones no validas ante observaciones fuera de distribucion.
- Limitacion de idioma: solo se declara coreano (ko).
- Limitacion de contexto: no se especifica la longitud de contexto efectiva del adaptador.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B debe verificarse por separado.
- Madurez: repositorio con 0 descargas, 0 likes y 0.0 GB de tamano declarado; la model card es minima y no hay documentacion adicional de entrenamiento o evaluacion.
- Ambiguedad metodologica: las etiquetas indican RL/PPO pero la model card senala SFT como mejor metodo; conviene tratarlo con cautela en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-sejong-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Libreria PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
