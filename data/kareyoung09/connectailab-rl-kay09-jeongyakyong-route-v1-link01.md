# kareyoung09/connectailab-rl-kay09-jeongyakyong-route-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS (LINK-01 Project). Su funcion es actuar como modulo de decision de alto nivel para un robot bipedo: a partir de las observaciones del entorno, el modelo selecciona la accion de alto nivel que debe ejecutar el robot, en concreto la tarea de seguimiento de ruta (follow_route). El modelo se publica con pipeline de reinforcement-learning y etiquetas de PPO y toma de decisiones, aunque la model card indica que el mejor metodo obtenido fue SFT (supervised fine-tuning).

Se trata de un adaptador de muy bajo coste computacional: al apoyarse en un modelo base de 0,8 mil millones de parametros y usar PEFT, el repositorio ocupa 0,0 GB y solo contiene los pesos del adaptador en formato safetensors. Esto lo hace desplegable en hardware modesto, incluida GPU de consumo, y adecuado para bucles de control en robotica donde la latencia importa.

La relevancia actual del modelo es acotada y muy especifica: no es un modelo de proposito general, sino un artefacto de investigacion para una tarea concreta de navegacion robotica. Su interes esta en el patron de uso (un LLM pequeno como capa de decision sobre acciones discretas) y en los resultados declarados por el autor: 80,3 % de acierto en el conjunto de prueba y 100 % de exito en 20 episodios de conduccion real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0,8 mil millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador se carga con la libreria PEFT sobre el modelo base mediante `PeftModel.from_pretrained`, de modo que la inferencia requiere descargar tanto el base como el adaptador. No se especifica el rango del adaptador, las capas objetivo ni el numero de parametros entrenables.

En cuanto al entrenamiento, la model card declara como "mejor metodo" el SFT (supervised fine-tuning), pese a que las etiquetas del repositorio incluyen reinforcement-learning, deep-reinforcement-learning y PPO. No se detalla el volumen de datos, la composicion del dataset, si hubo fases de RLHF/DPO ni hiperparametros de entrenamiento. La tarea entrenada es follow_route (seguimiento de ruta) para el robot bipedo LINK-01, con una persona asociada denominada jeongyakyong. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Decision de alto nivel para robotica: dado un conjunto de observaciones del robot bipedo LINK-01, selecciona la accion de alto nivel correspondiente a la tarea follow_route.
- Salida orientada a politica de control: el modelo esta especializado en mapear observaciones a decisiones discretas, no en generacion de texto libre.
- Capacidad multilingue limitada: declarado unicamente para coreano (ko).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documenta generacion de codigo ni matematicas como capacidades entrenadas.

## Casos de uso

- Navegacion de robot bipedo en entornos controlados: el modelo recibe las observaciones del LINK-01 y emite la accion de alto nivel para seguir una ruta predefinida; es su tarea entrenada y el escenario donde el autor reporta 100 % de exito en 20 episodios.
- Capa de decision en arquitecturas jerarquicas de robotica: usar el LLM pequeno como planificador de alto nivel que delega en controladores de bajo nivel, aprovechando su bajo coste computacional para ejecutarse en el propio robot o en un equipo cercano.
- Prototipado rapido de politicas de navegacion: al ser un adaptador LoRA sobre un base de 0,8B, permite iterar y reentrenar variantes de la politica sin grandes infraestructuras de GPU.
- Investigacion en LLMs como controladores: sirve como referencia reproducible para estudiar si un modelo de lenguaje pequeno puede sustituir a politicas de RL clasicas en tareas de decision discreta.
- Evaluacion de seguimiento de ruta en simulacion: integrable en pipelines de simulacion robotica para comparar el comportamiento del modelo frente a planificadores tradicionales antes de desplegar en el robot fisico.
- Docencia y experimentacion con PEFT: ejemplo practico de adaptador LoRA para una tarea de robotica, util para aprender el flujo transformers + peft con un modelo base pequeno.
- Despliegue en hardware de borde: su tamano (base de 0,8B mas adaptador) permite ejecucion en GPU de consumo o incluso CPU para inferencia de baja frecuencia, algo inviable con modelos de mayor escala.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Metrica | Resultado |
|---|---|
| Precision en el conjunto de prueba (Accuracy) | 80,3 % |
| Exito en 20 episodios de conduccion real (Drive Success) | 100,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un base de 0,8B en precision completa (FP16) el modelo base ronda 1,6 GB, a lo que se suma el adaptador LoRA (tamano no especificado, repositorio de 0,0 GB).
- GPU recomendadas: no disponibles en la documentacion; por tamano, el modelo es apto para GPU de consumo tipo RTX 3060/4060 en adelante, e incluso para ejecucion en CPU.
- Cabe en GPU de consumo: si, por el reducido tamano del modelo base (0,8B).
- Opciones de despliegue: la model card solo documenta el flujo con transformers + peft (`PeftModel.from_pretrained`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA para decision robotica sobre LLMs pequenos), por lo que no se puede establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo esta entrenado para la tarea follow_route del robot LINK-01; no es un modelo de proposito general y su uso fuera de ese dominio no esta validado.
- Idioma: declarado unicamente para coreano; no se garantiza comportamiento en castellano ni en otros idiomas.
- Datos de evaluacion escasos: el 100 % de exito se basa en solo 20 episodios de conduccion, una muestra pequena que no permite estimar robustez estadistica.
- Ambiguedad metodologica: las etiquetas indican PPO y reinforcement learning, pero la model card senala SFT como mejor metodo; conviene verificar que el adaptador publicado corresponde realmente al entrenamiento descrito.
- Riesgo de alucinacion: al ser un LLM, puede generar acciones o formatos de salida no validos ante observaciones fuera de distribucion; en robotica esto exige validacion y capas de seguridad externas.
- Sesgos: no documentados por el autor; al entrenarse sobre un unico robot y tarea, puede sobreajustarse a las condiciones de ese entorno.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene sus propias condiciones que deben respetarse.
- Produccion: sin documentacion sobre latencia, contexto, formato exacto de observaciones ni protocolo de integracion, no es apto para despliegue en produccion sin trabajo adicional de ingenieria.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa del artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-jeongyakyong-route-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Libreria PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.
