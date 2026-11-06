# mewbot97/Intent2Action-glimmer-programs

## Resumen

Intent2Action · Glimmer program writer (G1b) es un adaptador QLoRA publicado por mewbot97 sobre el modelo base Muse Glimmer 30B de meta-models. Su funcion es convertir una intencion de tarea expresada en lenguaje natural (por ejemplo, "cada cubo a la caja roja") junto con la lista de objetos del robot en un programa Python corto y verificable contra la API de Intent2Action (`find`, `find_all`, `pick`, `place`, `verify`, etc.). El modelo nunca emite movimiento directamente: genera codigo que el stack robotico valida, simula en seco y ejecuta.

El adaptador se entrena con QLoRA (r 32, alpha 16, dropout 0.05, cuantizacion NF4) sobre las proyecciones de atencion y MLP del modelo linguistico, usando 711 filas expertas procedentes del simulador de planificacion de Intent2Action, repartidas en cinco familias de tarea (cluster, packing, stacking, reach y sorting). El repositorio pesa 0,8 GB y se distribuye en formato PEFT con pesos safetensors.

Es relevante porque demuestra una separacion limpia entre razonamiento simbolico de estrategia y control fisico: el adaptador aprende que estrategia de orden de picking funciona para cada tipo de tarea, y lo expresa como programa comprobable. Los resultados publicados muestran una mejora de 61% a 86% de exito en tareas retenidas, y de 47% a 97% en tareas de stacking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre transformer decoder-only Muse Glimmer 30B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 30B segun su denominacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base NF4 (QLoRA) para entrenamiento; el adaptador se sirve sobre base NF4 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Muse Glimmer 30B, un modelo transformer decoder-only de 30B parametros, mediante LoRA con rango 32, alpha 16 y dropout 0.05, insertado en las proyecciones de atencion y MLP del modelo linguistico. El entrenamiento usa QLoRA con el modelo base cuantizado en NF4, siguiendo la receta del cookbook del modelo base. El objetivo es supervised fine-tuning sobre pares entrada-salida donde la entrada es la intencion de tarea mas la lista de objetos y la salida es un programa Python contra la API del robot.

Los datos de entrenamiento son 711 filas expertas obtenidas del "plan tier" del simulador de planificacion de Intent2Action (planificador de movimiento real y servicio robotico, sin fisica). Para cada tarea de entrenamiento se ejecutaron todas las estrategias de orden de picking y se etiqueto la estrategia mas fiable que tuvo exito. El conjunto cubre cinco familias de tarea (cluster, packing, stacking, reach, sorting): 562 filas mas 149 filas adicionales de sorting. El autor documenta ablaciones con rejection sampling, DPO, GRPO, LoRA en bf16 y distintas semillas en `docs/designs/learning_results.md` del repositorio.

## Capacidades

- Sintesis de programas: genera codigo Python corto contra la API de Intent2Action (`find`, `find_all`, `pick`, `place`, `verify` y funciones similares) a partir de una intencion en lenguaje natural y una lista de objetos.
- Seleccion de estrategia de picking: elige el orden de recogida de objetos que maximiza la probabilidad de exito segun la familia de tarea (cluster, packing, stacking, reach, sorting).
- Generalizacion a familias no vistas: segun la model card, mejora del 51% al 82% en la familia `mixed`, que no aparece en entrenamiento.
- Salida verificable: el programa generado esta disenado para ser comprobado, simulado en seco y ejecutado por el stack robotico, no para emitir movimiento directo.
- Integracion via API compatible con OpenAI: el script `learn/chat_server.py` del repositorio sirve el modelo base y el adaptador detras de una API compatible con OpenAI.
- No se documentan capacidades de tool calling generico, vision, audio, agente multi-paso ni modo thinking en la informacion disponible.

## Casos de uso

- Planificacion de tareas de picking en mesa: dado un conjunto de cubos, cajas y platos y una regla explicita ("todo cubo a la caja roja"), el adaptador genera el programa de orden de recogida y colocacion que el planificador ejecuta; es adecuado porque aprende que estrategia de picking funciona por familia de tarea.
- Clasificacion y sorting de objetos: para tareas de separar objetos por color, forma o destino, genera programas con `find_all` y bucles de `pick`/`place`, aprovechando las 149 filas especificas de sorting del entrenamiento.
- Empaquetado y packing: en escenarios donde el orden de colocacion condiciona la viabilidad geometrica, el adaptador selecciona la secuencia de colocacion que el planificador valida antes de ejecutar.
- Apilamiento (stacking): la familia con mayor mejora documentada (47% a 97%), util para tareas de construir pilas estables donde el orden de apilado es critico.
- Tareas de alcance (reach): genera programas para objetos fuera del alcance directo, eligiendo la estrategia de acceso que el planificador confirma como viable.
- Evaluacion en simulacion fisica: validacion de programas generados en Isaac Sim antes de transferirlos a hardware, con 41/50 exitos en tareas retenidas frente a 34/50 sin adaptador.
- Servicio de planificacion via API: despliegue del adaptador sobre el base NF4 con `learn/chat_server.py` para que un orquestador externo solicite programas a partir de intenciones en lenguaje natural.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 250 tareas retenidas (50 por familia, incluida la familia `mixed` nunca entrenada), 3 ejecuciones por programa, intervalos de confianza al 95% por bootstrap sobre tareas:

| Modelo / referencia | Exito |
|---|---|
| Glimmer sin adaptador | 61% [56–67] |
| Este adaptador (G1b) | 86% [82–89] |
| Mejor estrategia fija por familia (referencia) | 84% |
| Oracle (cualquier estrategia) | 91% |

Desgloses adicionales:

| Escenario | Sin adaptador | Con adaptador |
|---|---|---|
| Stacking | 47% | 97% |
| Familia no vista (`mixed`) | 51% | 82% |
| Isaac Sim, 50 tareas retenidas | 34/50 | 41/50 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,8 GB en el repositorio; el requisito real lo determina el modelo base Muse Glimmer 30B.
- Inferencia recomendada sobre el base cuantizado en NF4, tal como se entreno y evalua el adaptador; no se documentan requisitos de VRAM concretos en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del base (30B), un despliegue en NF4 requiere GPUs de alta capacidad (A100/H100 o equivalentes), pero no hay cifras publicadas por el autor.
- Viabilidad en GPU consumer: no disponible; no se documenta ejecucion en RTX 4090 u otras consumer.
- Opciones de despliegue: transformers + PEFT sobre base NF4, y el servidor `learn/chat_server.py` del repositorio con API compatible con OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intent2Action G1b (este adaptador) | Adaptador sobre base 30B | No disponible | Sintesis de programas de manipulacion para Intent2Action | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Muse Glimmer 30B (base) | 30B | No disponible | Modelo linguistico general | Apache-2.0 (segun la model card del adaptador) | Hugging Face |
| Estrategia fija por familia (referencia del autor) | No aplica | No aplica | Regla heuristica de picking por familia | No aplica | Referencia interna de Intent2Action |

No se dispone de datos publicados de otros adaptadores de sintesis de programas roboticos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre tareas sinteticas de mesa (cubos, cajas, platos); no se ha validado en escenarios reales diversos.
- Decide a nivel de estrategia unicamente: agarrres (grasps) y movimiento quedan en manos del stack robotico, no del modelo.
- Los resultados en fisica se limitan a 50 tareas en Isaac Sim; la evidencia fisica es escasa.
- No alcanza el oracle (91%): no aprende juicio por escena concreto, solo que estrategia encaja con cada tipo de tarea.
- Riesgo de alucinacion en la API: el programa generado puede referenciar funciones o argumentos invalidos; por diseno debe pasar por comprobacion y simulacion en seco antes de ejecutarse.
- Idiomas soportados no documentados; el entrenamiento parece orientado a instrucciones en ingles, aunque no se confirma en la informacion disponible.
- Licencia Apache-2.0 heredada del base; es un derivado de Muse Glimmer 30B y su uso comercial queda sujeto a las condiciones del modelo base.
- Repositorio sin traccion (0 descargas, 0 likes) y sin resultados de benchmarks generales; validar antes de usar en produccion.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/mewbot97/Intent2Action-glimmer-programs
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio Intent2Action: https://github.com/allwinlucious/Intent2Action
- Resultados y ablaciones: `docs/designs/learning_results.md` en el repositorio Intent2Action
