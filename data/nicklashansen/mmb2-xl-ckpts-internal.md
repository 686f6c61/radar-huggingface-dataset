# nicklashansen/mmb2-xl-ckpts-internal

## Resumen

`nicklashansen/mmb2-xl-ckpts-internal` es un paquete de checkpoints internos de un modelo de mundo (world model), publicado por Nicklas Hansen en HuggingFace con acceso restringido a colaboradores aprobados. No se trata de un modelo de lenguaje: el repositorio contiene un tokenizador y varios checkpoints de un modelo de dinamica, concretamente la variante `combined_xl/`, que es un reemplazo directo ("drop-in replacement") del componente `combined` del proyecto `mmbench2-models`.

Los checkpoints se han afinado durante 150.000 pasos cada uno sobre el conjunto de datos `wm-comp-internal-xl`, formado por 200 tareas y 100 millones de fotogramas, con una mezcla de siete variantes ("7-flavor mixture") que incluye modalidades de replay, xreplay y rreplay. El tokenizador se encuentra en el paso 530k y el modelo de dinamica en el paso 360k, este ultimo entrenado contra el tokenizador ya afinado.

El modelo se enmarca en el trabajo "Hallucination in World Models is Predictable and Preventable", cuyo codigo oficial esta en el repositorio `nicklashansen/mmbench2`. La relevancia actual del paquete es acotada: es material interno para reproducir experimentos sobre deteccion y mitigacion de alucinaciones en modelos de mundo, no un modelo de proposito general. No se declaran parametros, licencia, idiomas ni formato de pesos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo: tokenizador + modelo de dinamica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Tamano del repositorio | 1,4 GB |
| Pasos de afinado | 150.000 por checkpoint |
| Dataset de entrenamiento | `wm-comp-internal-xl` (200 tareas, 100M fotogramas, mezcla de 7 variantes: replay/xreplay/rreplay) |
| Checkpoint del tokenizador | paso 530k |
| Checkpoint de dinamica | paso 360k (entrenado contra el tokenizador afinado) |
| Acceso | restringido a colaboradores aprobados |

## Arquitectura y entrenamiento

La informacion disponible describe un sistema de modelo de mundo compuesto por dos piezas: un tokenizador, que codifica las observaciones del entorno en un espacio latente, y un modelo de dinamica, que predice la evolucion de ese espacio latente condicionada por acciones. Los checkpoints de `combined_xl/` se han afinado 150.000 pasos cada uno sobre `wm-comp-internal-xl` y estan disenados como sustitucion directa del componente `combined` del proyecto `mmbench2-models`. No se detalla la arquitectura interna (si es transformer, recurrente o hibrida), el numero de parametros ni la composicion exacta del dataset mas alla de las 200 tareas y los 100 millones de fotogramas.

El contexto de investigacion es el paper "Hallucination in World Models is Predictable and Preventable", que parte de la hipotesis de que las alucinaciones de un modelo de mundo se concentran en regiones del espacio estado-accion con baja cobertura de datos. La mitigacion propuesta consiste en desplegar trayectorias candidatas en el modelo, puntuarlas segun la alucinacion predicha y ejecutar en el entorno real la mejor clasificada, generando asi datos que cubren las transiciones problematicas. No se especifica si hubo etapas de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de futuros condicionados por acciones ("action-controllable futures") dentro de un modelo de mundo.
- Codificacion de observaciones a un espacio latente mediante el tokenizador afinado.
- Prediccion de dinamica del entorno a partir del estado latente y las acciones.
- Puntuacion de trayectorias candidatas para estimar alucinacion, segun el enfoque del paper asociado.
- Soporte de entrenamiento con mezclas de replay, xreplay y rreplay sobre 200 tareas.
- Reemplazo directo del componente `combined` del proyecto `mmbench2-models` sin cambios de integracion.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, vision general, audio ni capacidades multilingues.

## Casos de uso

- Investigacion en planificacion basada en modelos: el modelo de dinamica permite desplegar trayectorias candidatas en el espacio latente antes de ejecutar una accion en el entorno real, reduciendo el coste de prueba y error.
- Deteccion de alucinaciones en modelos de mundo: los checkpoints permiten reproducir el pipeline del paper, puntuando trayectorias y aislando las regiones del espacio estado-accion con baja cobertura.
- Mitigacion guiada por datos: al ejecutar en el entorno las trayectorias mejor puntuadas, se genera un flujo de datos que cubre las transiciones que provocaban alucinaciones, util para reentrenar el modelo de mundo.
- Entrenamiento de agentes por refuerzo en simulador: el modelo de mundo actua como entorno latente para entrenar politicas sin interaccion directa con el entorno fisico.
- Aumento de datos y generacion de rollouts sinteticos: los checkpoints permiten producir futuros plausibles sobre las 200 tareas del dataset interno para ampliar conjuntos de entrenamiento.
- Comparacion de tokenizadores y modelos de dinamica: al ser un reemplazo directo de `combined`, sirve para medir de forma aislada el efecto del tokenizador afinado en el paso 530k frente a alternativas.
- Evaluacion de robustez fuera de distribucion: la mezcla de siete variantes (replay/xreplay/rreplay) facilita experimentos de generalizacion entre tareas y regimenes de entrenamiento.
- Reproducibilidad experimental interna: al ser checkpoints internos, permiten a colaboradores aprobados replicar resultados de `mmbench2` con los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 1,4 GB, lo que sugiere que los pesos por si solos podrian caber en GPUs de consumo, pero no se especifica el consumo real en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: no disponibles; el proyecto asociado se distribuye como repositorio de codigo (`nicklashansen/mmbench2`), no como pesos listos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `nicklashansen/mmb2-xl-ckpts-internal` | no disponible | no disponible | no disponible | acceso restringido a colaboradores | Checkpoints internos, reemplazo directo de `combined` |
| `nicklashansen/mmbench2-models` | no disponible | no disponible | no disponible | publico en HuggingFace | Componente base (`combined`) que este paquete sustituye |
| `nicklashansen/mmb2-ckpts-internal` | no disponible | no disponible | no disponible | acceso restringido a colaboradores | Conjunto de checkpoints internos relacionado |

No se dispone de datos de benchmarks ni de especificaciones comparables de otras familias de modelos de mundo en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: los checkpoints solo estan disponibles para colaboradores aprobados, por lo que no pueden usarse como base publica ni distribuirse sin autorizacion.
- Licencia no declarada: al no especificarse licencia, no hay base explicita para uso comercial; conviene tratar el material como restringido.
- Riesgo de alucinacion inherente: el propio paper asociado documenta que los modelos de mundo pueden generar rollouts visualmente fluidos pero alejados de la dinamica real, especialmente en regiones de baja cobertura.
- Especificidad del dominio: el entrenamiento se limita a 200 tareas y 100 millones de fotogramas del dataset interno `wm-comp-internal-xl`; no hay evidencia de generalizacion fuera de ese conjunto.
- Ausencia de datos de arquitectura: sin informacion sobre parametros, contexto ni formato de pesos, la planificacion de despliegue en produccion resulta inviable con los datos actuales.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes conversacionales ni capacidades multilingues, por lo que no debe evaluarse con benchmarks de NLP.
- Cautela con el material interno: los checkpoints estan etiquetados como internos y dirigidos a reproducir experimentos concretos; su uso fuera de ese contexto no esta validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nicklashansen/mmb2-xl-ckpts-internal
- Checkpoints internos relacionados: https://huggingface.co/nicklashansen/mmb2-ckpts-internal
- Modelos base del proyecto: https://huggingface.co/nicklashansen/mmbench2-models
- Repositorio de codigo oficial: https://github.com/nicklashansen/mmbench2
- Paper "Hallucination in World Models is Predictable and Preventable": https://arxiv.org/abs/2606.27326
- PDF del paper: https://www.nicklashansen.com/mmbench2/paper.pdf
