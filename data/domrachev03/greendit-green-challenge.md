# domrachev03/greendit-green-challenge

## Resumen

GreenDiT Green Challenge es una coleccion de checkpoints de politicas de accion por escenario para el benchmark de simulacion Green Challenge, desarrollada por el usuario domrachev03. Cada checkpoint corresponde a un escenario distinto (darkstore, dry_kitchen y sber_shop) y se ha entrenado mediante imitation learning con una arquitectura de diffusion transformer (GreenDiT) que produce chunks de acciones para control robotico. El repositorio se publica como artefacto de investigacion asociado al reto Green Challenge de Sber.

El modelo no es un modelo de lenguaje ni un modelo generativo de proposito general: es un conjunto de politicas especializadas para tareas de manipulacion robotica dentro de un simulador concreto. Cada checkpoint es el mejor de un barrido de entrenamiento a 60.000 pasos, usando pesos EMA. El tamano total del repositorio es de 1,4 GB, lo que sugiere pesos de varios cientos de millones de parametros por checkpoint, aunque el dato exacto no esta disponible.

La relevancia es acotada: se trata de artefactos de investigacion con rendimiento parcial. Segun la propia model card, ningun checkpoint completo una tarea entera (0% de exito), y las puntuaciones reflejan unicamente credito parcial por subtareas. El autor recomienda explicitamente tratarlos como artefactos de investigacion y no como una linea base solida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (GreenDiT) para politicas de accion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | other |
| Formato de pesos | PyTorch (.pt) con pesos EMA y estado de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es un diffusion transformer (GreenDiT) que genera chunks de acciones, es decir, secuencias de comandos de control de horizonte corto en lugar de acciones individuales. Este enfoque de action chunking es habitual en politicas de manipulacion robotica modernas porque reduce el error de acumulacion y mejora la estabilidad temporal. El entrenamiento se realiza por imitation learning sobre demostraciones del simulador Green Challenge, con un barrido de configuraciones por escenario.

Cada checkpoint corresponde a 60.000 pasos de entrenamiento y se seleccionan los pesos EMA como version final. Se dispone de un `config.json` por escenario con la configuracion de entrenamiento, pero la informacion proporcionada no detalla el numero de tokens, la composicion del dataset, ni si hubo etapas de refinamiento tipo RLHF o DPO (no aplicables en este dominio, pero no confirmados). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de chunks de acciones para control robotico en el simulador Green Challenge.
- Politicas especializadas por escenario: darkstore, dry_kitchen y sber_shop.
- Aprendizaje por imitacion a partir de demostraciones del simulador.
- Ejecucion de subtareas parciales de manipulacion (hasta 1/2, 1/4 y 1/5 subtareas segun escenario).
- No soporta tool calling ni function calling: no es un modelo linguistico.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- Sin capacidades multilingues, de vision general, audio ni thinking mode documentadas.

## Casos de uso

- Investigacion en imitation learning robotico: sirve como punto de partida reproducible para comparar variantes de diffusion transformers en el benchmark Green Challenge, ya que incluye configuracion y resultados de evaluacion por checkpoint.
- Reproduccion de experimentos del Green Challenge: los `eval_results.json` permiten verificar puntuaciones parciales y analizar donde falla cada politica por escenario.
- Analisis de fallos en manipulacion de subtareas: con 0% de exito completo, los checkpoints son utiles para estudiar modos de fallo en tareas largas y descomposicion de subtareas.
- Estudio de action chunking: permite evaluar como el horizonte de chunk afecta a la estabilidad del control en distintos escenarios del simulador.
- Baseline debil para comparaciones internas: util como referencia minima contra la que medir nuevas politicas, siempre asumiendo su bajo rendimiento.
- Docencia y prototipado en robotica simulada: por su tamano moderado (1,4 GB en total) y formato PyTorch estandar, es facil de cargar en entornos de laboratorio para experimentos docentes.

## Benchmarks y rendimiento

Resultados segun el runner oficial `green_challenge`, con una unica episodio de evaluacion por escenario:

| Escenario | Checkpoint | Puntuacion | Subtareas completadas | Exito de tarea completa |
|---|---|---|---|---|
| darkstore | ckpt_0060000.pt (EMA) | 0.868 | 1/2 | 0% |
| dry_kitchen | ckpt_0060000.pt (EMA) | 0.747 | 1/4 | 0% |
| sber_shop | ckpt_0060000.pt (EMA) | 0.735 | 1/5 | 0% |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 1,4 GB, por lo que cada checkpoint individual es probablemente inferior a ese tamano y cabe en GPUs de consumo con 8-16 GB de VRAM.
- GPU recomendadas: no especificadas por el autor; por el tipo de modelo (diffusion transformer de control) es razonable usar GPUs consumer modernas (RTX 3060 en adelante) o GPUs de datacenter (A100, H100) para barridos de evaluacion.
- Compatibilidad con GPU de consumo: probable, dado el tamano del repositorio, aunque no confirmada por el autor.
- Opciones de despliegue: carga directa en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GreenDiT Green Challenge | Diffusion transformer para control robotico | no disponible | no disponible | 0% exito completo; puntuaciones parciales 0.735-0.868 | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Ningun checkpoint completa una tarea entera: 0% de exito en los tres escenarios evaluados.
- Las puntuaciones se basan en un unico episodio de evaluacion por escenario, por lo que la varianza es alta y los numeros no son estadisticamente robustos.
- El autor califica explicitamente los checkpoints como artefactos de investigacion, no como linea base solida.
- Especificos del simulador Green Challenge: no se garantiza transferencia a robot real ni a otros entornos.
- Licencia "other": es necesario revisar los terminos concretos antes de cualquier uso comercial; no se especifican restricciones en la informacion disponible.
- Sin informacion sobre sesgos, alucinacion o limitaciones de contexto (no aplicables en el sentido linguistico, pero no documentados en el dominio robotico).
- No hay datos sobre idiomas, cuantizacion ni throughput que permitan planificar un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/domrachev03/greendit-green-challenge
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
