# FineEnvs/retroenv-qwen3.8-27b-grpo-nothink

## Resumen

RetroEnv Qwen3.8-27B GRPO (non-thinking) es un ajuste fino del modelo base Qwen/Qwen3.8-27B desarrollado por FineEnvs, orientado especificamente a retrosintesis quimica. El modelo ha sido entrenado con GRPO (Group Relative Policy Optimization) contra RetroEnv, un entorno de aprendizaje por refuerzo en el que el modelo recibe una molecula objetivo, busca material de partida y precedentes mediante herramientas, y propone uno o varios arboles de sintesis que un verificador deterministico evalua contra una libreria de reacciones congelada.

El checkpoint publicado corresponde al paso 300 del run `easy2k-shaped-r1-cont3`, con el adaptador LoRA ya fusionado en los pesos del modelo base, de modo que se sirve como un checkpoint convencional. Cuenta con 27.781.427.952 parametros (aproximadamente 27,8 mil millones) y un repositorio de 55,6 GB en formato safetensors.

Su relevancia radica en que demuestra una mejora sustancial sobre el modelo base en una tarea cientifica con verificacion objetiva: la tasa de exito al primer intento pasa de 0,015 a 0,200 en el conjunto `core150`, y pass@4 de 0,047 a 0,347. Es un ejemplo de como el RL con entornos verificables puede especializar un modelo generalista en un dominio tecnico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y expertos compartidos (familia Qwen3.5); el adaptador LoRA se aplico a capas q/k/v/o, atencion lineal y MLP, incluido el experto compartido |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de la familia Qwen3.5 que incorpora atencion lineal y capas con experto compartido. Sobre esa base se entreno un adaptador LoRA de rango 16 y alpha 32 aplicado exclusivamente a las capas del modelo de lenguaje (atencion q/k/v/o, atencion lineal y MLP, incluido el experto compartido), que posteriormente se fusiono en los pesos del modelo base para producir el checkpoint publicado.

El entrenamiento utilizo TRL AsyncGRPO con 32 rollouts por tarea, 18 pasos de acumulacion de gradiente, tasa de aprendizaje constante y epsilon de 0,2 / 0,28, sin penalizacion KL de referencia (`AsyncGRPOConfig` no expone `beta`, por lo que nada empuja la politica de vuelta hacia el modelo base). Los rollouts se ejecutaron contra el entorno RetroEnv alojado, y la recompensa es la recompensa modelada v8 calculada por el servidor, que otorga entre 0,70 y 1,0 por una resolucion correcta y entre 0 y 0,20 por un fallo, en funcion de que proporcion del arbol alcance material comprable. El entrenamiento se realizo con el modo de razonamiento (thinking) desactivado.

## Capacidades

- Generacion de arboles de retrosintesis: dado un objetivo, propone una o varias rutas de sintesis quimica en forma de arbol.
- Uso de herramientas (tool calling): el modelo esta entrenado para consultar busquedas de stock y precedentes quimicos dentro del bucle del entorno.
- Razonamiento multi-paso orientado a agentes: encadena busqueda, seleccion de reacciones y construccion del arbol hasta alcanzar materiales de partida comprables.
- Entrada multimodal imagen-texto: la etiqueta `image-text-to-text` del repositorio indica soporte de entrada de imagenes, aunque el autor no documenta su uso en la tarea de retrosintesis.
- Capacidades generales heredadas del modelo base Qwen3.8-27B (generacion de texto, codigo, matematicas), aunque el ajuste esta orientado a quimica.
- Modo non-thinking: el checkpoint se entreno y evalua sin razonamiento explicito; el autor indica que el checkpoint con thinking obtiene puntuaciones considerablemente superiores.

## Casos de uso

- Planificacion retrosintetica asistida: dado un compuesto objetivo, el modelo genera arboles de sintesis candidatos que un quimico puede revisar como punto de partida, aprovechando su entrenamiento especifico en el entorno RetroEnv.
- Integracion en pipelines de descubrimiento de farmacos: el modelo puede insertarse en un bucle de agente que consulte catalogos de reactivos y bases de precedentes para proponer rutas viables antes de la validacion experimental.
- Generacion de hipotesis de rutas para compuestos dificiles: sus tasas de exito por dificultad (0,46 en facil, 0,14 en medio, 0,08 en dificil) permiten priorizar los casos donde el modelo es mas fiable y derivar el resto a revision manual.
- Evaluacion comparativa de modelos quimicos: sirve como referencia de un modelo especializado por RL para comparar con modelos generalistas en tareas de retrosintesis con verificador deterministico.
- Investigacion en RL con entornos verificables: el checkpoint y los runs publicos permiten reproducir y estudiar el efecto del GRPO sobre una tarea cientifica con recompensa objetiva.
- Filtrado previo en laboratorio: el modelo puede descartar rutas que no alcanzan materiales de partida comprables, reduciendo el espacio de busqueda antes de que un quimico evalue rendimiento, selectividad y seguridad.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto `core150` con el arnes de entrenamiento, 4 intentos por tarea a temperatura 0,8:

| Modelo | pass@1 | pass@4 |
|---|---:|---:|
| Qwen/Qwen3.8-27B (non-thinking) | 0,015 | 0,047 |
| RetroEnv Qwen3.8-27B GRPO (este checkpoint) | 0,200 | 0,347 |

Tasa de exito al primer intento por nivel de dificultad: facil 0,46; medio 0,14; dificil 0,08. El autor senala que estos tres valores promedian 0,227, que es la tasa al primer intento, y no el pass@1 de 0,200, que es la estimacion insesgada sobre los cuatro intentos.

Evolucion de checkpoints non-thinking evaluados completamente en el run `easy2k-shaped-r1-cont3`:

| Run | Paso | Thinking | pass@1 | pass@4 |
|---|---|---:|---:|---:|
| easy2k-shaped-r1 | 25 | no | 0,022 | 0,073 |
| easy2k-shaped-r1 | 200 | no | 0,110 | 0,267 |
| easy2k-shaped-r1-cont | 225 | no | 0,142 | 0,295 |
| easy2k-shaped-r1-cont3 | 250 | no | 0,140 | 0,280 |
| easy2k-shaped-r1-cont3 | 275 | no | 0,180 | 0,320 |
| easy2k-shaped-r1-cont3 | 300 (este checkpoint) | no | 0,200 | 0,347 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB solo para pesos, mas memoria para el contexto y el estado de activaciones; en la practica requiere GPUs de 80 GB o configuraciones multi-GPU.
- Cuantizacion: el autor no documenta cuantizaciones; una conversion a 8 bits o 4 bits reduciria el requisito aproximadamente a 28 GB o 14 GB respectivamente, pero no hay artefactos publicados ni validacion de calidad.
- GPUs recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bfloat16; en consumer GPU no cabe sin cuantizacion agresiva, y no hay evidencia publicada de que funcione en RTX 4090 (24 GB) en 4 bits.
- Despliegue: compatible con transformers (`AutoModelForCausalLM` con `dtype="bfloat16"` y `device_map="auto"`); el autor no documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El modelo esta pensado para ejecutarse dentro del bucle del entorno con su esquema de herramientas y prompt de sistema, no como modelo de chat aislado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 (core150) | pass@4 (core150) | Licencia |
|---|---:|---|---:|---:|---|
| RetroEnv Qwen3.8-27B GRPO (este) | 27,8 B | no disponible | 0,200 | 0,347 | Apache 2.0 |
| Qwen/Qwen3.8-27B (base, non-thinking) | 27,8 B | no disponible | 0,015 | 0,047 | no disponible |
| Checkpoint con thinking del mismo run | 27,8 B | no disponible | no disponible (el autor indica que puntua considerablemente mas alto) | no disponible | Apache 2.0 |

No se dispone de datos de otros modelos especializados en retrosintesis en la informacion proporcionada.

## Limitaciones y advertencias

- El verificador solo comprueba que cada paso coincide con una reaccion registrada y que cada hoja es comprable; no evalua rendimiento, selectividad ni seguridad, por lo que una ruta aceptada no debe ejecutarse sin revision de un quimico.
- El modelo rinde mucho mejor en tareas faciles (0,46 al primer intento) que en dificiles (0,08), lo que limita su utilidad autonoma en compuestos complejos.
- Esta entrenado con thinking desactivado; el checkpoint con thinking del mismo run obtiene puntuaciones considerablemente superiores, por lo que este checkpoint no representa el mejor resultado de la familia.
- Fuera del bucle del entorno y de su esquema de herramientas y prompt de sistema, el modelo se comporta como el modelo base con una ligera tendencia hacia arboles de ruta; no es un asistente quimico autonomo.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingue.
- No hay datos de benchmarks generales ni de cuantizacion, lo que dificulta estimar su calidad fuera de la tarea de retrosintesis.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la validez quimica de las rutas generadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FineEnvs/retroenv-qwen3.8-27b-grpo-nothink
- Entorno RetroEnv (Space): https://huggingface.co/spaces/FineEnvs/retroenv
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset: https://huggingface.co/datasets/LiteFold/RetroEnv-Curated
- Codigo de entrenamiento y evaluacion: https://github.com/adithya-s-k/FineEnvs (directorio `09-retroenv/`)
- Bucket con checkpoints, episodios y logs: https://huggingface.co/buckets/AdithyaSK/retroenv-rl-runs
