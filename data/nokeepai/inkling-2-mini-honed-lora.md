# nokeepai/Inkling-2-Mini-Honed-LoRA

## Resumen

Inkling-2-Mini-Honed-LoRA es un adaptador LoRA de rango 32 desarrollado por nokeep (nokeep.ai) sobre el modelo base thinkingmachines/Inkling-2-Mini, un transformer con mezcla de expertos (MoE) de Thinking Machines. El adaptador no busca mejorar la precision del modelo base, sino corregir un problema de comportamiento: el Inkling 2 Mini original tiende a sobre-deliberar, agotando su presupuesto de razonamiento sin llegar a una respuesta o, en tareas de depuracion, encadenando turnos sin escribir codigo. El adaptador ensena al modelo a terminar.

La relevancia practica esta en la eficiencia: segun la model card, fusionado con el modelo base reduce aproximadamente a la mitad los tokens de razonamiento (de 1.010 a 462 de media por item en siete benchmarks) y acelera las respuestas entre 2,4x y 3,1x, manteniendo la calidad de respuesta al nivel del modelo original. En tareas de depuracion dificil, el porcentaje de tareas resueltas pasa del 80,0% al 100,0% en una suite de 15 tareas del proyecto, con una reduccion de 9x a 11x en tokens por tarea.

El repositorio incluye el adaptador en safetensors, su configuracion y un script de fusion (`merge_adapter.py`) que opera sobre checkpoints cuantizados de Inkling 2 Mini con redondeo estocastico. La licencia es Apache 2.0. El modelo base no esta documentado en la informacion disponible (parametros, contexto o idiomas), por lo que varios campos de esta ficha quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer MoE Inkling-2-Mini; rango 32, aplicado a atencion y pesos de expertos |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no documenta su tamano en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base almacena expertos en 4 bits y 8 bits; el script de fusion opera sobre checkpoints cuantizados con redondeo estocastico |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`) + script Python de fusion |

## Arquitectura y entrenamiento

El adaptador se construye sobre Inkling-2-Mini, un modelo con arquitectura de mezcla de expertos segun las etiquetas del repositorio. El LoRA tiene rango 32 y se aplica tanto a las capas de atencion como a los pesos de los expertos, lo que exige un script de fusion especifico (`merge_adapter.py`) capaz de operar sobre checkpoints cuantizados en 4 y 8 bits mediante redondeo estocastico. La fusion es reproducible: tres fusiones independientes sobre el modelo base produjeron un checkpoint identico byte a byte (sha256 de `model-00001`: `823f44bb...`), y dos fusiones sobre Unbound v2.1 tambien coincidieron.

El entrenamiento se realizo con aprendizaje por refuerzo sobre prompts considerados inofensivos (depuracion, matematicas, escritura creativa, preguntas, roleplay y chat), con un ancla hacia las mejores respuestas del propio modelo original para preservar la longitud y la calidad de las respuestas. No se mencionan el volumen de datos, el numero de tokens de entrenamiento ni detalles del algoritmo de RL mas alla de esa descripcion. La model card declara explicitamente que no se reclama ninguna ganancia de precision: el objetivo es igualar al modelo base con menos deliberacion.

## Capacidades

- Razonamiento con modo de pensamiento (thinking budget): el adaptador reduce el consumo de tokens de razonamiento sin degradar la respuesta.
- Generacion de codigo y depuracion: resuelve tareas de debugging escribiendo codigo en lugar de encadenar turnos de analisis.
- Matematicas: GSM8K y MATH-500 al nivel del modelo base, con mejora notable en el cumplimiento estricto del formato de respuesta en GSM8K (69,7% a 89,5%).
- Generacion de texto general: preguntas, escritura creativa, roleplay y chat.
- Finalizacion fiable: elimina en gran medida los turnos que terminan sin respuesta por agotar el presupuesto de pensamiento.
- Capacidades de tool calling, agentes, vision, audio o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Depuracion automatizada de codigo: en pipelines de CI, el adaptador fusionado resuelve el 100% de una suite de 15 tareas de depuracion dificil frente al 80% del modelo base, y elimina los turnos sin codigo escrito (de 86,2% a 0,0%), lo que lo hace adecuado para agentes que deben producir parches ejecutables.
- Agentes de codigo con presupuesto limitado: al consumir entre 9x y 11x menos tokens por tarea de depuracion, reduce el coste por tarea en entornos de produccion con llamadas facturadas por token.
- Asistentes conversacionales de baja latencia: con respuestas de 2,4x a 3,1x mas rapidas y aproximadamente la mitad de tokens de pensamiento, encaja en chat interactivo donde la latencia percibida importa.
- Razonamiento matematico con formato estricto: la mejora en el formato estricto de GSM8K (de 69,7% a 89,5%) lo hace util en pipelines que parsean la respuesta final de forma automatica, como correctores o tutores.
- Escritura creativa y roleplay: el entrenamiento incluye estos dominios y la calidad se mantiene al nivel del modelo base, por lo que sirve para generacion de contenido y personajes conversacionales.
- Despliegue sobre infraestructura existente: al ser un adaptador LoRA, puede aplicarse sin fusion sobre el servicio Tinker de Thinking Machines o fusionarse en pesos cuantizados para servir con SGLang, reutilizando el stack ya validado en las evaluaciones.
- Evaluacion comparativa de modelos: el adaptador y su script de fusion reproducible permiten generar checkpoints identicos byte a byte, util para auditorias y replicacion de resultados.

## Benchmarks y rendimiento

Resultados del adaptador sin fusionar sobre el servicio Tinker (mismos items y semillas, esfuerzo 0,9), segun la model card:

| Benchmark | n | Stock | Stock + adaptador | Diferencia (puntos) | Lectura |
|---|---|---|---|---|---|
| HumanEval | 164 | 98,2% | 98,8% | +0,6 [-1,2, +2,4] | no inferior |
| MBPP | 257 | 95,3% | 96,9% | +1,6 [+0,4, +3,1] | no inferior (sin ganancia reclamada) |
| HumanEvalFix | 164 | 98,2% | 97,0% | -1,2 [-3,0, +0,0] | no concluyente |
| QuixBugs | 31 | 96,8% | 93,5% | -3,2 [-12,9, +6,5] | no concluyente |
| GSM8K (correctas) | 1.319 | 96,5% | 96,5% | +0,0 [-0,8, +0,8] | no inferior |
| GSM8K (formato estricto) | 1.319 | 69,7% | 89,5% | +19,7 [+17,4, +22,0] | no inferior (sin ganancia reclamada) |
| MATH-500 (is_equiv) | 500 | 92,4% | 93,2% | +0,8 [-0,2, +2,0] | no inferior |
| MMLU | 2.000 | 89,1% | 89,9% | +0,8 [-0,2, +1,8] | no inferior |

Tokens de pensamiento medios por item en los siete benchmarks: 1.010 con el modelo original, 462 con el adaptador. En la suite de depuracion del proyecto (15 tareas), la tasa de resolucion pasa de 80,0% [54,8, 93,0] a 100,0% [79,6, 100,0]. La voluntad de responder a peticiones sensibles no cambia de forma significativa (64,5% a 65,3% en uncensoredbench, 1.100 preguntas), aunque la completitud de las respuestas a preguntas sensibles leves baja 1,3 puntos de forma significativa.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano del modelo base, que no esta documentado en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion; las evaluaciones se ejecutaron en GPU con SGLang y en el servicio Tinker de Thinking Machines.
- Compatibilidad con GPU de consumo: no se puede determinar sin conocer el tamano del modelo base.
- Opciones de despliegue: SGLang (validado en las evaluaciones con pesos fusionados), servicio Tinker (adaptador sin fusionar). Otros stacks como vLLM, llama.cpp o TGI no estan documentados.
- Latencia y throughput: respuestas de 2,4x a 3,1x mas rapidas y aproximadamente la mitad de tokens de pensamiento con el adaptador fusionado, segun la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (stock) | MoE con thinking | no disponible | no disponible | no disponible | Linea base: mas deliberacion, 1.010 tokens de pensamiento por item |
| Inkling-2-Mini-Honed | MoE fusionado con este adaptador | no disponible | no disponible | Apache 2.0 | Mismo modelo base con el adaptador ya fusionado |
| Unbound v2.1 / v3 | Variantes derivadas del mismo modelo base | no disponible | no disponible | no disponible | Evaluadas en las mismas suites; v3 incorpora este adaptador |

No se dispone de datos de modelos de otros desarrolladores para una comparativa mas amplia en la informacion proporcionada.

## Limitaciones y advertencias

- No se reclama ninguna ganancia de precision: las diferencias en benchmarks publicos quedan dentro de un margen de 2 puntos; la mejora es de eficiencia y de finalizacion, no de exactitud.
- Resultados no concluyentes en HumanEvalFix y QuixBugs: los intervalos de confianza cruzan el margen, por lo que no puede afirmarse equivalencia estricta en esas tareas.
- Ruido entre semillas: las diferencias entre ejecuciones alcanzan hasta 3,0 puntos en HumanEvalFix, lo que limita la interpretacion de diferencias pequenas.
- Las respuestas a preguntas sensibles leves son ligeramente menos completas (cambio pareado de -1,3 puntos, intervalo enteramente por debajo de cero).
- El adaptador esta entrenado solo con prompts inofensivos; su comportamiento fuera de esos dominios (por ejemplo, tool calling o agentes de larga duracion) no esta evaluado.
- La fusion requiere soporte para checkpoints cuantizados en 4 y 8 bits con redondeo estocastico; una fusion incorrecta puede degradar los pesos.
- La licencia Apache 2.0 cubre el adaptador; las condiciones del modelo base deben verificarse por separado.
- No hay datos sobre sesgos, idiomas soportados ni riesgo de alucinacion especificos del adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nokeepai/Inkling-2-Mini-Honed-LoRA
- Modelo fusionado: https://huggingface.co/nokeepai/Inkling-2-Mini-Honed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Sitio del autor: https://nokeep.ai/?ref=huggingface
- Licencia: https://www.apache.org/licenses/LICENSE-2.0
