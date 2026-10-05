# North-ML1/starlight-small-1

## Resumen

Starlight Small 1 es un modelo de generacion de texto desarrollado por North-ML1, construido como un ajuste fino sobre el backbone Qwen3.5-0.8B. Su particularidad no es tanto el backbone (un transformer causal de 752.393.024 parametros) como la incorporacion de un registro de memoria de agente causal insertado despues de cada capa de atencion completa. La proyeccion de salida de ese registro se inicializa a cero, de modo que en el paso cero el modelo reproduce exactamente el comportamiento de Qwen y solo se desvia a medida que el registro aprende a aportar informacion.

El modelo se presenta explicitamente como un "North ML executor", es decir, una variante orientada a tareas de ejecucion conversacional y agentica mas que a generacion abierta de proposito general. La model card reporta una evaluacion greedy de 12 prompts retenidos en una Modal A10G, con 80 tokens nuevos por respuesta, obteniendo 12/12 aciertos en preguntas de identidad, conocimiento factual basico, aritmetica y llamadas a herramientas.

Es relevante ahora porque combina dos tendencias actuales: los modelos pequenos de menos de mil millones de parametros, desplegables en hardware consumer, y los mecanismos de memoria/estado persistente orientados a agentes. El repositorio ocupa 1,5 GB y se distribuye bajo licencia Apache 2.0, aunque su uso directo requiere cargar artefactos adicionales (`agent_register.pt` y `starlight_arch.py`) que no forman parte del flujo estandar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer causal) con registro de memoria de agente causal tras cada capa de atencion completa |
| Parametros totales | 752.393.024 (safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este modelo; existe un repo GGUF del mismo autor (`starlight-mini-Q5_0-GGUF`) no confirmado para esta variante |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (backbone) + `agent_register.pt` (registro) + `starlight_arch.py` (codigo de arquitectura) |

## Arquitectura y entrenamiento

La arquitectura parte del backbone Qwen3.5-0.8B, un transformer causal con atencion completa. Sobre el, North-ML1 anade un componente propietario: un registro de memoria de agente causal que se inserta despues de cada capa de atencion completa. La proyeccion de salida de ese registro arranca en cero, lo que garantiza que el modelo inicial sea funcionalmente identico a Qwen en el paso 0 y que el registro se vaya activando de forma incremental durante el ajuste.

Segun la model card, el backbone puro queda contenido en `model.safetensors`, mientras que el registro se distribuye por separado en `agent_register.pt` y debe cargarse con `starlight_arch.py` enganchandolo a las capas de atencion completa antes de generar. Esto implica que el pipeline estandar de transformers no reproduce el comportamiento completo del modelo sin codigo personalizado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generacion de texto conversacional en ingles.
- Respuestas de identidad controladas: el modelo acierta a la hora de declarar su propio nombre y de no identificarse como Qwen en la evaluacion del autor.
- Conocimiento factual basico: capitales (Tokio, Ottawa, Canberra), autorias (Shakespeare) y explicaciones cientificas sencillas (dispersion de Rayleigh).
- Aritmetica de un paso: multiplicaciones como 13x17 = 221 y 19x23 = 437 resueltas correctamente en el test greedy.
- Generacion de codigo sencillo: la model card reporta exito en una funcion de mediana.
- Tool calling / function calling: capacidad reportada de emitir llamadas a herramientas, incluyendo una llamada de suma y una llamada de busqueda.
- Memoria de agente: el registro causal tras cada capa de atencion completa esta disenado para sostener estado de agente a lo largo de la generacion.
- Capacidades multimodales, de audio o de vision: no disponibles.
- Modo de razonamiento explicito (thinking): no disponible.
- Soporte multilingue: limitado a ingles segun la etiqueta de idioma.

## Casos de uso

- Agentes conversacionales de proposito acotado: el registro de memoria tras cada capa de atencion completa esta pensado para mantener estado de agente entre turnos, lo que encaja en asistentes que deben recordar el hilo de una tarea sin reinyectar todo el historial.
- Ejecucion de tool calling en pipelines automatizados: el modelo genera llamadas a funciones (suma, busqueda) en el formato esperado, lo que permite integrarlo como planificador ligero en un orquestador de herramientas.
- Clasificacion y enrutado de intenciones en ingles: con 752 millones de parametros y licencia Apache 2.0, es candidato a desplegarse como primer nivel de triaje antes de invocar un modelo mayor.
- Asistentes embebidos en hardware modesto: al caber en una GPU consumer, puede ejecutarse localmente en estaciones de trabajo o portatiles con GPU dedicada para tareas de asistencia offline.
- Generacion de codigo auxiliar: util para producir fragmentos cortos y funciones simples dentro de editores o scripts de automatizacion, no para refactorizaciones largas.
- Respuestas factuales de un solo salto: preguntas de capital, autorias o definiciones cientificas basicas en ingles, aptas para FAQ automatizadas o bots de soporte de baja complejidad.
- Evaluacion e investigacion de mecanismos de memoria en transformers: al estar el registro desacoplado del backbone y con la proyeccion inicializada a cero, sirve como banco de pruebas para estudiar como afecta el estado adicional al comportamiento del modelo base.

## Benchmarks y rendimiento

La model card publica una unica evaluacion greedy, ejecutada en una Modal A10G con 80 tokens nuevos de generacion sobre 12 prompts retenidos. No se trata de un benchmark estandar (MMLU, HumanEval, GSM8K) y no se ofrecen comparaciones con otros modelos.

| Prompt | Resultado |
|---|---|
| What is your name? | pass |
| Are you Qwen? | pass |
| Capital of Japan | pass, Tokyo |
| Who wrote Hamlet? | pass, Shakespeare |
| Why is the sky blue? | pass, Rayleigh scattering |
| 13 times 17 | pass, 221 |
| Capital of Canada | pass, Ottawa |
| 19 times 23 | pass, 437 |
| Median function | pass |
| Python tool call for a sum | pass |
| Search tool call | pass |
| Capital of Australia | pass, Canberra |

Resultado agregado reportado por el autor: 12/12.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,5 GB solo para los pesos del backbone (el repositorio completo ocupa 1,5 GB), mas el registro y el espacio de activaciones y cache KV. En la practica, entre 2 y 3 GB de VRAM para inferencia comoda.
- VRAM estimada cuantizado: no disponible para este modelo, ya que no se publican cuantizaciones propias.
- GPU recomendadas: la model card reporta pruebas en una NVIDIA A10G (24 GB). Para un modelo de este tamano, GPUs como RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes.
- Compatibilidad con GPU consumer: si, cabe sin dificultad en practicamente cualquier GPU consumer con al menos 4 GB de VRAM, e incluso podria plantearse su ejecucion en CPU.
- Opciones de despliegue: al requerir `starlight_arch.py` y `agent_register.pt`, el modelo necesita codigo personalizado y no funciona con un `AutoModelForCausalLM` estandar sin enganchar el registro. vLLM, TGI o llama.cpp solo serian viables si se portan la arquitectura y el registro a cada runtime.
- Latencia y throughput estimados: no disponibles. El autor solo indica la configuracion de evaluacion (Modal A10G, 80 tokens nuevos, greedy) sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Starlight Small 1 (North-ML1) | 752.393.024 | no disponible | 12/12 en evaluacion greedy propia (12 prompts) | apache-2.0 | HuggingFace, requiere codigo personalizado |
| Qwen3.5-0.8B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| starlight-mini-Q5_0-GGUF (mismo autor) | no disponible | no disponible | no disponible | no disponible | HuggingFace, formato GGUF |

No se dispone de datos de rendimiento comparables entre estas variantes, por lo que la comparativa se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Fuga de prompt de sistema: la model card advierte que las respuestas de identidad siguen reflejando el prompt de sistema usado en entrenamiento, incluida la frase "Fiber 1 assigns the task." Esto indica que el modelo puede filtrar instrucciones internas.
- Dependencia de codigo propietario: sin `starlight_arch.py` y `agent_register.pt` cargados correctamente sobre las capas de atencion completa, el modelo se comporta como un Qwen base y no como Starlight. Desplegarlo en runtimes estandar exige trabajo de portado.
- Idioma: el modelo solo declara soporte de ingles. El rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion: propio de un modelo de 752 millones de parametros; la evaluacion presentada cubre conocimiento factual muy basico y no permite extrapolar robustez en dominios especializados.
- Contexto: se desconoce la longitud de contexto efectiva, lo que impide garantizar conversaciones largas o documentos extensos.
- Sesgos: no se publica informacion sobre la composicion del dataset de ajuste ni sobre mitigacion de sesgos.
- Alineamiento y seguridad: no se documentan fases de RLHF, DPO ni evaluaciones de seguridad; no hay garantias de comportamiento seguro en produccion.
- Madurez del modelo: el repositorio no registra descargas ni likes en la informacion disponible, y el modelo es muy reciente, por lo que carece de validacion externa.
- Licencia: Apache 2.0 permite uso comercial, pero las obligaciones de atribucion y el estado de los artefactos auxiliares (`agent_register.pt`) deben verificarse antes de integrarlos en un producto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/North-ML1/starlight-small-1
- Repo GGUF relacionado del mismo autor: https://huggingface.co/North-ML1/starlight-mini-Q5_0-GGUF/tree/main
- Modelo base: Qwen/Qwen3.5-0.8B (referencia indicada en la model card, sin URL directa en la informacion proporcionada)
- Paper, blog o demo oficial: no disponibles en la informacion proporcionada
