# mcemri/commenv-e1-t3-harder

## Resumen

`mcemri/commenv-e1-t3-harder` es un checkpoint de investigacion derivado de Qwen/Qwen3-4B, afinado con aprendizaje por refuerzo (GRPO) para que tres copias del mismo modelo colaboren en la resolucion de puzles de logica tipo rejilla ("quien vive en que casa") cuyas pistas estan repartidas entre los tres agentes. No es un producto: el autor lo describe explicitamente como checkpoints de investigacion, publicados para reproducibilidad y continuacion del entrenamiento.

El modelo parte del checkpoint final de `mcemri/commenv-e1-t2-combined` (entrenado primero en solitario con todas las pistas y despues en equipo) y se entrena 40 pasos adicionales como equipo de tres, con la mitad de los puzles de mayor tamano (rejillas de 4 casas con 4 atributos y una variante mas dificil de 4 casas con 3 atributos). La comunicacion se realiza sobre un tablero compartido durante un maximo de seis turnos, y cada agente debe entregar la solucion completa del puzle.

La relevancia es de investigacion en sistemas multiagente y comunicacion emergente: mide si un modelo pequeno de 4 mil millones de parametros puede coordinar informacion parcial distribuida y resolver tareas de razonamiento logico de forma conjunta. El autor reporta una mejora sustancial frente al checkpoint de partida en las rejillas grandes (92,4 % frente a 80,4 %), lo que lo hace util como referencia para estudiar protocolos de comunicacion aprendidos y escalado de tareas cooperativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); el autor no detalla modificaciones adicionales |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible; los pesos publicados son safetensors en precision del entrenamiento |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carpetas `export/global_step_{10,20,30,40}/policy`); checkpoints del entrenador en 4 shards por paso |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B. Sobre esa base se aplica un afinamiento con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization) en un entorno multiagente de comunicacion. Cada episodio instancia tres copias del modelo; cada copia recibe solo una parte de las pistas de un puzle de rejilla logica, intercambia mensajes en un tablero compartido durante un maximo de seis turnos y, al final, cada agente debe producir la solucion completa. La recompensa se asocia a la correccion de la solucion entregada.

El entrenamiento de esta ejecucion (e1_t3) arranca desde el checkpoint final de `mcemri/commenv-e1-t2-combined` y se prolonga 40 pasos adicionales. La mitad de los puzles de entrenamiento son rejillas de mayor tamano: 4 casas con 4 atributos y una variante mas dificil de 4 casas con 3 atributos. Se publican checkpoints intermedios en los pasos 10, 20, 30 y 40, tanto en formato Transformers (8,8 GB por checkpoint) como en formato del entrenador con estado del optimizador (22,5 GB por checkpoint en 4 shards). No se detalla en la informacion disponible el volumen total de tokens, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del GRPO descrito.

## Capacidades

- Razonamiento logico sobre puzles de rejilla ("quien vive en que casa") con restricciones de atributos y casas.
- Colaboracion multiagente: tres instancias del modelo mantienen una conversacion estructurada sobre un tablero compartido durante hasta seis turnos.
- Resolucion de tareas con informacion parcialmente distribuida: cada agente recibe solo una parte de las pistas y debe integrar la informacion recibida de los demas.
- Generacion de la solucion completa del puzle por parte de cada agente, no solo de su parte.
- Comunicacion en lenguaje natural entre agentes (protocolo aprendido, no impuesto explicitamente en la informacion disponible).
- Capacidades generales de Qwen3-4B potencialmente conservadas (generacion de texto, codigo, matematicas), aunque el autor no las evalua ni las garantiza tras el afinamiento por RL.
- Soporte de tool calling, function calling, modo thinking o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en comunicacion emergente multiagente: usar los checkpoints para analizar que protocolos de comunicacion aprende el modelo al repartir pistas entre tres agentes y como evolucionan entre los pasos 10 y 40.
- Estudios de escalado de tareas cooperativas: comparar el rendimiento en rejillas de 3 casas frente a rejillas de 4 casas con 4 atributos para medir la degradacion al aumentar la complejidad (98,7 % frente a 92,4 % segun el autor).
- Reproduccion de experimentos de RL con GRPO: los checkpoints del entrenador (22,5 GB por paso, con estado del optimizador) permiten continuar el entrenamiento y validar resultados.
- Evaluacion de robustez multiagente: someter al equipo de tres a puzles con pistas contradictorias o incompletas para estudiar el comportamiento del protocolo aprendido.
- Base para ablaciones de tamano de equipo: partir de este checkpoint y variar el numero de agentes o el numero de turnos de comunicacion para aislar el efecto de cada variable.
- Docencia y divulgacion: ejemplo reproducible y de licencia permisiva (Apache-2.0) para explicar sistemas multiagente con modelos de 4 mil millones de parametros en entornos academicos.
- Punto de partida para afinar en tareas de planificacion cooperativa mas alla de los puzles de logica, dado que el modelo ya ha aprendido a integrar informacion parcial de otros agentes.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 400 puzles nuevos por tipo, tras 40 pasos de entrenamiento:

| Tarea | Este modelo (e1_t3, paso 40) | Checkpoint de partida (e1_t2-combined) |
|---|---|---|
| Puzles en tamanos de entrenamiento previos (equipo completo acierta) | 98,7 % | 96,8 % |
| Rejillas grandes (4 casas con 4 atributos y variante dificil de 4 casas con 3 atributos) | 92,4 % | 80,4 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint en formato Transformers ocupa 8,8 GB en safetensors; en precision completa (fp16/bf16) se requiere aproximadamente esa cantidad mas overhead de activaciones. Para ejecutar el escenario multiagente completo (tres copias) hay que multiplicar por tres, salvo que se compartan pesos.
- GPU recomendadas para el escenario de tres agentes: A100 40/80 GB, H100 80 GB o varias RTX 4090 (24 GB cada una, una por agente).
- Cabe en GPU de consumo: una sola RTX 4090 (24 GB) puede alojar una copia del modelo en bf16; para las tres copias simultaneas hacen falta al menos tres GPU de 24 GB o cuantizacion adicional (no publicada en el repo).
- Opciones de despliegue: Transformers (carga documentada con `AutoModelForCausalLM.from_pretrained` y subfolder `export/global_step_40/policy`). No se proporcionan pesos GGUF ni recetas para vLLM, llama.cpp, Ollama o TGI; seria necesario convertirlos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El escenario multiagente implica hasta seis turnos de comunicacion por episodio, lo que multiplica el coste de inferencia respecto a una sola pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-e1-t3-harder | 4 mil millones | no disponible | RL multiagente sobre Qwen3-4B | Apache-2.0 | Hugging Face |
| mcemri/commenv-e1-t2-combined | 4 mil millones | no disponible | RL multiagente, etapa previa | Apache-2.0 (segun el modelo base) | Hugging Face |
| Qwen/Qwen3-4B | 4 mil millones | no disponible en la informacion proporcionada | Modelo generalista base | Apache-2.0 | Hugging Face |

No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria (afinados por RL para comunicacion multiagente en puzles de logica) con datos de rendimiento verificables.

## Limitaciones y advertencias

- Checkpoint de investigacion, no un producto: el autor lo declara explicitamente; no esta pensado para uso en produccion.
- Dominio muy restringido: entrenado exclusivamente en puzles de logica tipo rejilla con pistas repartidas; el rendimiento fuera de ese dominio no esta evaluado.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3-4B puede heredar los sesgos del modelo base, no evaluados tras el afinamiento por RL.
- Riesgo de alucinacion: no cuantificado; en tareas logicas el modelo puede producir soluciones plausibles pero incorrectas, especialmente en rejillas grandes (7,6 % de fallo segun el autor).
- Limitaciones de contexto e idioma: no disponibles; el autor no especifica idiomas de entrenamiento ni longitud de contexto efectiva tras el afinamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al tratarse de un checkpoint de investigacion sin garantias, su uso en produccion queda bajo responsabilidad del integrador.
- Tamano del repositorio: 131,9 GB en total, lo que exige planificar el almacenamiento si se descargan todos los checkpoints (export y entrenador).
- Reproducibilidad: los archivos `trainer_state.pt` no estan incluidos, lo que puede complicar la reanudacion exacta del entrenamiento.
- Dependencia del modelo base: cualquier limitacion de Qwen3-4B (ventana de contexto, idiomas, sesgos) aplica salvo que el afinamiento la haya modificado, algo que no se documenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-e1-t3-harder
- Checkpoint de partida: https://huggingface.co/mcemri/commenv-e1-t2-combined
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
