# bbkdevops/omega-reasoner-poc

## Resumen

OMEGA-Reasoner (POC) es un repositorio publicado por el usuario bbkdevops en HuggingFace que contiene un marco de agente autonomo autocontenido, es decir, un framework de agente basado en un "modelo de mundo" linguistico implementado desde cero en Python, sin dependencia de APIs externas de LLM. Incluye un definidor de modelo denominado HMoE-D (mixture-of-experts jerarquico con enrutamiento dinamico), un agente cognitivo completo con memoria episodica, semantica y procedural, bucle ReAct, planificacion por Tree-of-Thoughts, autocorreccion estilo Reflexion y salvaguardas constitucionales, ademas de adaptadores para los benchmarks AgentWorldBench y DeepSWE.

El propio autor lo posiciona explicitamente como una prueba de concepto y no como un modelo de frontera. El HMoE-D tiene aproximadamente 100.000 parametros (configurables) y no ha recibido preentrenamiento de lenguaje: su metodo `predict()` es basado en plantillas, no aprendido, y el razonamiento numerico y simbolico es basado en reglas. El repositorio no publica pesos en safetensors ni en GGUF, sino codigo fuente Python con mas de 78 pruebas unitarias que pasan sobre fixtures sinteticos.

Su relevancia ahora es acotada y de tipo metodologico: sirve como artefacto de investigacion para ilustrar como se puede construir un framework de agente completo (memoria, planificacion, uso de herramientas, autocorreccion y adaptadores de evaluacion) sin recurrir a servicios externos. No es un candidato para produccion ni para comparativas de rendimiento en leaderboards publicos, y el autor indica de forma explicita que no envia resultados al leaderboard oficial de DeepSWE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HMoE-D (hierarchical mixture-of-experts con enrutamiento dinamico), definida en `omega_arch.py` |
| Parametros totales | Aproximadamente 100.000 (configurables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye utilidades de cuantizacion en `omega_quant.py`, sin especificar formatos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio distribuye codigo Python, no pesos en safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

La arquitectura declarada es HMoE-D, un mixture-of-experts jerarquico con enrutamiento dinamico. No se especifican en la informacion disponible el numero de expertos, la dimension oculta, el numero de capas ni el mecanismo exacto de enrutamiento. El repositorio organiza la implementacion en modulos separados: `omega_arch.py` para el modelo, `omega_nlu.py` para el motor de lenguaje natural (oraciones, frames y logica de primer orden), `omega_math.py` para primitivas de razonamiento matematico, `omega_physics.py` para razonamiento fisico y `omega_meta.py` para metacognicion y auditoria.

No hay entrenamiento en el sentido habitual: la model card indica que el modelo no tiene datos de entrenamiento (los datos son sinteticos o escritos a mano) y que no ha recibido preentrenamiento de lenguaje. No se menciona RLHF, DPO ni ningun otro proceso de alineacion por aprendizaje. Las capacidades de razonamiento numerico y simbolico son basadas en reglas, no aprendidas. El elemento diferencial del repositorio no esta en el modelo en si, sino en el andamiaje de agente que lo rodea: memoria episodica, semantica y procedural, bucle ReAct, planificacion por Tree-of-Thoughts, autocorreccion estilo Reflexion y guardarrailes constitucionales.

## Capacidades

- Generacion de texto: no hay generacion aprendida; la salida de `predict()` es basada en plantillas.
- Razonamiento simbolico: motor NLU con representacion de oraciones, frames y logica de primer orden (`omega_nlu.py`).
- Razonamiento matematico: primitivas basadas en reglas (`omega_math.py`).
- Razonamiento fisico: modulo especifico de fisica (`omega_physics.py`).
- Metacognicion y auditoria: modulo `omega_meta.py`.
- Uso de herramientas: el agente incorpora soporte de tools dentro del bucle ReAct.
- Planificacion multi-paso: Tree-of-Thoughts y autocorreccion estilo Reflexion.
- Memoria de agente: episodica, semantica y procedural.
- Guardarrailes: salvaguardas constitucionales declaradas en el framework.
- Evaluacion: adaptador de AgentWorldBench con puntuacion en 5 dimensiones (formato, factualidad, consistencia, realismo y calidad) y adaptador DeepSWE con cargador de tareas en formato Harbor y ejecutor de verificacion.
- Idiomas: unicamente ingles.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Docencia de arquitecturas de agentes: el repositorio permite mostrar en clase, con codigo legible, como se implementan un bucle ReAct, una memoria episodica y una planificacion por Tree-of-Thoughts sin depender de APIs externas.
- Prototipado de bucles de agente antes de elegir un LLM real: se puede usar `AGIAgentWorld` para validar la logica de orquestacion, el enrutado de herramientas y la gestion de memoria, y despues sustituir el nucleo por un modelo preentrenado.
- Investigacion en mecanismos de memoria: los tres tipos de memoria implementados permiten experimentar con politicas de recuperacion y olvido, y comparar variantes sin coste de inferencia.
- Desarrollo de arneses de evaluacion: los adaptadores `agentworld_bench.py` y `deep_swe.py` sirven como plantilla para construir cargadores de tareas y verificadores propios con datos sinteticos.
- Pruebas de guardarrailes y autocorreccion: el modulo de Reflexion y las salvaguardas constitucionales permiten estudiar patrones de autocorreccion y de filtrado de acciones en un entorno controlado.
- Integracion continua en proyectos de investigacion: las 78+ pruebas unitarias incluidas permiten usar el repositorio como base de regression testing al modificar componentes del agente.
- Ejemplo minimo de agente con objetivo: el caso incluido en la model card (`agi.run("Buy coffee by noon")`) ilustra el ciclo completo de planificacion y ejecucion sobre una meta simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explicita que el Pass@1 en DeepSWE no se ha medido para este repositorio y que el agente es heuristico. La unica cifra de referencia que aparece es la del modelo citado como comparacion por el autor, no la de este repositorio.

| Metrica | OMEGA-Reasoner (POC) | DeepSeek-V4.1-Flash (referencia citada por el autor) |
|---|---|---|
| Pass@1 en DeepSWE | no medido | 74,2 |
| Parametros | aprox. 100.000 | clase 35B |
| Datos de entrenamiento | ninguno (sintetico / escrito a mano) | billones de tokens |
| Estado | prueba de concepto de investigacion | modelo de produccion |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado que el modelo declarado tiene aproximadamente 100.000 parametros y que no se publican pesos, no aplica el calculo habitual de VRAM por cuantizacion.
- GPU recomendadas: no disponible. Con el tamano declarado, la ejecucion en CPU es suficiente; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible. No se publican pesos en safetensors ni GGUF, por lo que no se puede cargar en GPUs de consumo con los runners habituales.
- Opciones de despliegue: el repositorio se ejecuta como codigo Python, importando los modulos `evo.agi_agent_world`, `evo.agentworld_bench` y `evo.deep_swe`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no hay pesos publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion disponible solo proporciona una comparacion, la que el propio autor incluye en la model card frente a DeepSeek-V4.1-Flash. No se identifican en la informacion proporcionada otros modelos de la misma categoria (framework de agente autocontenido con nucleo de 100.000 parametros) para establecer una comparativa adicional.

| Modelo | Parametros | Contexto | Pass@1 DeepSWE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OMEGA-Reasoner (POC) | aprox. 100.000 (configurables) | no disponible | no medido | Apache-2.0 | Codigo Python en HuggingFace, 0 descargas y 0 likes |
| DeepSeek-V4.1-Flash (referencia citada por el autor) | clase 35B | no disponible | 74,2 | no disponible | no disponible en la informacion proporcionada |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo subyacente HMoE-D es una demostracion sin preentrenamiento de lenguaje; su metodo `predict()` es basado en plantillas y no aprendido.
- El autor declara explicitamente que no se reclama ningun Pass@1 en DeepSWE y que el agente es heuristico.
- El razonamiento numerico y simbolico es basado en reglas, no aprendido, por lo que no generaliza fuera de los casos contemplados.
- Los datos de evaluacion incluidos son sinteticos (`data/agentworldbench_synth`, `data/deepswe_synth`), no los conjuntos oficiales.
- Soporte unicamente de ingles.
- No se han publicado estudios de sesgos ni evaluaciones de robustez; no hay informacion sobre sesgos conocidos.
- Riesgo de alucinacion: al ser la salida basada en plantillas y reglas, el riesgo no es el tipico de un LLM, pero la ausencia de conocimiento aprendido implica que cualquier consulta fuera del dominio cubierto producira respuestas no fiables.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con contexto largo.
- Uso comercial: la licencia Apache-2.0 permite uso comercial del codigo, pero el propio autor lo posiciona como artefacto de investigacion y prueba de concepto, no como modelo de produccion.
- Traccion nula en la plataforma (0 descargas, 0 likes) y sin pipeline declarado, lo que limita la validacion por parte de terceros.
- La cita proporcionada en la model card contiene un marcador de posicion (`<your-org>`), lo que sugiere que el repositorio no ha pasado por una revision de publicacion definitiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bbkdevops/omega-reasoner-poc
- Dataset de referencia AgentWorldBench: https://huggingface.co/datasets/Qwen/AgentWorldBench
- Dataset de referencia DeepSWE: https://huggingface.co/datasets/datacurve/deep-swe
- Paper, blog, repositorio adicional o demo: no disponible en la informacion proporcionada
