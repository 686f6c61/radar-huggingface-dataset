# mewbot97/Intent2Action-glimmer-recovery

## Resumen

Intent2Action-glimmer-recovery (G1d) es un adaptador QLoRA sobre el modelo base Muse Glimmer 30B, desarrollado por el usuario mewbot97 en el contexto del proyecto Intent2Action. Su funcion es actuar como agente de recuperacion dentro de un runtime de robotica: cuando un paso de un programa de manipulacion en ejecucion falla, el modelo recibe la situacion y elige un escalon de una escalera de recuperacion con presupuesto limitado (re-observar, reintentar, saltar, parchear, preguntar o detener). El adaptador se publica como pesos PEFT en safetensors, con un tamano de repositorio de 0,8 GB.

El modelo no es un modelo fundacional autonomo, sino un adaptador de bajo rango que modifica el comportamiento del base Muse Glimmer 30B para la tarea concreta de recuperacion de fallos en programas de robot. Se entrena sobre las 711 filas de programas expertos del adaptador hermano G1b mas 63 filas de recuperacion, con etiquetas consistentes que, segun la model card, mantienen la tasa de apilamiento en el 92 % frente al 50 % de una version anterior con etiquetas inconsistentes.

Su relevancia es acotada pero concreta: demuestra que un adaptador pequeno puede mejorar la recuperacion en vivo de un agente robotico sobre el modelo base (9/20 tareas rescatadas frente a 4/20 del base Glimmer), manteniendo ademas un rendimiento de escritura de programas del 82 % en 250 tareas retenidas. La licencia Apache-2.0 y el formato PEFT facilitan su integracion en pipelines existentes, aunque el ecosistema de despliegue es especifico del proyecto Intent2Action.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre transformer Muse Glimmer 30B |
| Parametros totales | 30B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (cuantizacion del base durante entrenamiento); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Muse Glimmer 30B mediante QLoRA con la receta del cookbook: rango 32, alpha 16 y dropout 0,05. El entrenamiento combina las 711 filas de programas expertos del adaptador G1b con 63 filas de recuperacion etiquetadas con la misma estrategia de "mas fiable" que las filas de programa. La model card indica que una version previa con etiquetas inconsistentes degradaba el apilamiento al 50 %, mientras que las etiquetas consistentes lo mantienen en el 92 %.

La innovacion principal no esta en la arquitectura del transformer subyacente, sino en el diseno de la tarea: el modelo aprende a seleccionar un escalon de una escalera de recuperacion con presupuesto (re-observar, reintentar, saltar, parchear, preguntar, detener) ante fallos de ejecucion. El escalon de "patch" implica un programa de reemplazo verificado y aprobado por una persona, lo que introduce un punto de control humano en el bucle. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Seleccion de estrategia de recuperacion ante fallos de un paso de programa robotico, entre seis escalones presupuestados.
- Generacion de parches de programa verificados (sujetos a aprobacion humana) cuando el fallo lo requiere.
- Escritura de programas de manipulacion como adaptador G1b, con un 82 % de exito en 250 tareas retenidas.
- Razonamiento de multiples pasos orientado a la recuperacion dentro de un runtime de robot.
- Capacidad de "preguntar" al operador cuando la situacion no se resuelve de forma autonoma.
- Soporte de tool calling o function calling: no disponible en la informacion.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Recuperacion en vivo de programas de manipulacion robotica: cuando un paso falla, el adaptador recibe el estado y elige entre reintentar, saltar o parchear, reduciendo la intervencion manual. Es adecuado porque se entreno especificamente con 63 filas de recuperacion y supera al base en 9/20 frente a 4/20 tareas rescatadas.
- Escritura de programas de robot en pipelines de automatizacion: el adaptador hereda la capacidad de G1b para generar programas de manipulacion, con un 82 % de exito en 250 tareas retenidas, lo que permite generar borradores que luego se validan.
- Supervision con aprobacion humana en entornos industriales: el escalon de "patch" exige aprobacion de una persona, lo que encaja en flujos donde la automatizacion total no es aceptable y se necesita un punto de control.
- Investigacion en agentes roboticos con presupuesto de recuperacion: el diseno de la escalera presupuestada sirve como banco de pruebas para estudiar politicas de recuperacion y su coste.
- Integracion en runtimes de robot existentes: se sirve junto a G1b mediante `learn/chat_server.py --adapters G1b G1d` y se configura el runtime para usar G1d como modelo de recuperacion, lo que facilita su adopcion en proyectos que ya usan Intent2Action.
- Evaluacion comparativa de adaptadores pequenos frente a modelos base: permite medir cuanto aporta un adaptador de 0,8 GB sobre un base de 30B en una tarea acotada, con metricas concretas de recuperacion y escritura de programas.

## Benchmarks y rendimiento

| Metrica | G1d (este adaptador) | Base Glimmer | G1b (adaptador hermano) |
|---|---|---|---|
| Recuperacion en vivo, 20 tareas con fallo del programa a nivel de docs | 9/20 rescatadas (todas parches, ninguno invalido) | 4/20 | no disponible |
| Escritura de programas, 250 tareas retenidas, una ejecucion | 82 % [76–86] | no disponible | 84 % en la misma ejecucion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador ocupa 0,8 GB en disco, pero requiere cargar el base Muse Glimmer 30B, cuyo requisito de VRAM depende de la cuantizacion y no se detalla.
- GPU recomendadas: no disponibles en la informacion; por el tamano del base (30B) se situaria en el rango de A100/H100 o GPUs consumer de gama alta con cuantizacion, pero esto no se confirma en la model card.
- Cabe en GPU consumer: no disponible.
- Opciones de despliegue: servidor propio del proyecto (`learn/chat_server.py --adapters G1b G1d`), con PEFT como libreria. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en recuperacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intent2Action-glimmer-recovery (G1d) | 30B base + adaptador | no disponible | 9/20 rescatadas; 82 % escritura | Apache-2.0 | HuggingFace (0 descargas) |
| Muse Glimmer 30B (base) | 30B | no disponible | 4/20 rescatadas | no disponible | HuggingFace |
| Intent2Action G1b (adaptador hermano) | 30B base + adaptador | no disponible | no disponible; 84 % escritura | no disponible | referenciado en la model card |

No se dispone de informacion sobre otros adaptadores de robotica comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta disenado para el runtime concreto de Intent2Action; su uso fuera de ese ecosistema no esta documentado.
- Los resultados de recuperacion se basan en 20 tareas, una muestra pequena que limita la significancia estadistica.
- El escalon de "patch" requiere aprobacion humana, por lo que no es un sistema totalmente autonomo.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue.
- La licencia Apache-2.0 se hereda del base, pero el adaptador es una obra derivada de Muse Glimmer 30B; conviene verificar las condiciones del base para uso comercial.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validacion externa.
- No se detallan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en produccion.
- La model card advierte de que etiquetas inconsistentes degradaron el apilamiento al 50 %; variaciones en la calidad de las etiquetas pueden afectar al rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/mewbot97/Intent2Action-glimmer-recovery
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio Intent2Action: https://github.com/allwinlucious/Intent2Action
