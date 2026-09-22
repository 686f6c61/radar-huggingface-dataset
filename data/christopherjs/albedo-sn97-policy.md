# ChristopherJS/albedo-sn97-policy

## Resumen

Albedo SN97 policy es un adaptador LoRA publicado por el usuario ChristopherJS en Hugging Face, asociado al entrenamiento de una política para el subnet 97 de Bittensor, conocido como Albedo. No se trata de un modelo de propósito general, sino de un artefacto de investigación: el resultado de un ciclo de aprendizaje por refuerzo con GRPO multi-turno sobre problemas de duelo del entorno Albedo. El repositorio está etiquetado con peft, bittensor, sn97, grpo y reinforcement-learning, y su pipeline declarado es text-generation.

El punto crítico es que, en el momento de la publicación de la model card, no había pesos subidos: el estado indicado es "no weights uploaded yet - the run has not started". Además, el adaptador se apoya en un checkpoint SFT privado de Qwen3.6-35B-A3B, de modo que el adaptador por sí solo no reproduce la política entrenada. El propio autor advierte que cada subida sustituye por completo el contenido anterior y aplana el historial de git, por lo que el repositorio contiene siempre un único checkpoint y no conserva versiones previas.

La relevancia de esta ficha es, por tanto, documental y metodológica: describe un pipeline de RL con recompensa basada en rúbricas evaluadas por un juez automático (GLM-5.2) y rollouts ejecutados contra el simulador de observación del propio entorno de evaluación. Cualquier evaluación de capacidades, benchmarks o rendimiento real es imposible con la información disponible, porque no hay pesos publicados ni métricas declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. El checkpoint base se denomina Qwen3.6-35B-A3B, lo que sugiere por nomenclatura un transformer con mezcla de expertos (MoE); no verificable con la informacion proporcionada |
| Parametros totales | No disponible para el adaptador. El base se declara como 35B por nomenclatura; sin confirmar |
| Parametros activos | No disponible para el adaptador. La nomenclatura A3B del base sugiere ~3B activos; sin confirmar |
| Longitud de contexto | No disponible (depende del checkpoint base privado, no especificado) |
| Tipos de cuantizacion | No disponible. La model card solo menciona pesos fusionados en bf16 para el envio a duelo |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card no declara licencia; la etiqueta region:us es un metadato de region de Hugging Face, no una licencia) |
| Formato de pesos | Adaptador LoRA en formato PEFT (libreria peft). El checkpoint fusionado se publica por separado en bf16 |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA (no un modelo completo) entrenado mediante GRPO multi-turno. El procedimiento declarado es el siguiente: se parte de un checkpoint SFT privado de Qwen3.6-35B-A3B, se generan rollouts contra el simulador de observacion propio de Albedo, y la recompensa se obtiene de la rubrica del propio evaluador, compuesta por preguntas de si/no juzgadas por GLM-5.2 sobre la trayectoria que produce el modelo a partir de un prefijo de mitad de tarea. Se aplican ceros duros para truncamiento, abandono, fugas de tokens reservados y bucles de comandos. El entrenamiento se realiza, por tanto, en el mismo entorno en el que luego se puntua la politica.

No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, la configuracion de LoRA (rango, alpha, modulos objetivo), la tasa de aprendizaje, el numero de pasos, el tamano de batch ni el numero de rollouts por problema. Tampoco se detalla si hubo fases adicionales de DPO o RLHF mas alla del GRPO descrito, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El codigo de ejemplo emplea `AutoModelForImageTextToText`, lo que sugiere que el checkpoint base podria ser multimodal (texto e imagen), aunque esto no se confirma en el texto de la tarjeta.

## Capacidades

- Generacion de texto condicionada al entorno Albedo, orientada a resolver problemas de duelo a partir de un prefijo de mitad de tarea.
- Razonamiento multi-turno y multi-paso: el entrenamiento es explicitamente multi-turno y las recompensas penalizan truncamiento, abandono y bucles de comandos.
- Ejecucion de comandos contra un simulador de observacion: la politica se entrena sobre las acciones y observaciones del entorno, no sobre texto libre aislado.
- Ajuste fino con refuerzo (GRPO) sobre una rubrica de evaluacion automatica, lo que implica adaptacion a un criterio de exito especifico y no a capacidades generales.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible, aunque el bucle de comandos del entorno sugiere interaccion con herramientas.
- Capacidades de agente: no confirmadas formalmente, pero el diseno (rollouts, penalizacion de bucles, prefijos de tarea) es caracteristico de politicas agenticas.
- Multilingue: no disponible. No se declaran idiomas.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en RL para agentes: el adaptador documenta un pipeline completo de GRPO multi-turno con recompensa por rubrica y simulador propio, reproducible conceptualmente aunque los pesos no esten publicados.
- Mineria y participacion en el subnet 97 de Bittensor (Albedo): el adaptador esta pensado para enviarse a duelos, y la propia model card indica que un envio requiere los pesos fusionados en bf16, no el adaptador aislado.
- Estudio de recompensas basadas en jueces automaticos: permite analizar como una rubrica de preguntas si/no evaluada por GLM-5.2 condiciona el comportamiento de una politica y que tipos de reward hacking aparecen.
- Construccion de entornos simulados de evaluacion: los datasets asociados (duelos crudos y problemas con entorno, prefijo, rubrica y puntuacion del rey) sirven como base para replicar el simulador de observacion en otros proyectos.
- Analisis de fallos en agentes: los ceros duros por truncamiento, abandono, fuga de tokens reservados y bucles de comandos definen un conjunto de modos de fallo concretos que se pueden instrumentar y medir en produccion.
- Punto de partida para ajuste fino adicional: si se dispusiera del checkpoint base, el adaptador podria servir de inicializacion para experimentos de RL en dominios similares, aunque su transferencia fuera del entorno Albedo es incierta.
- Auditoria de reproducibilidad en modelos de investigación: el repositorio ilustra un caso de publicacion incompleta (sin pesos, sin licencia, sin metricas) util para discutir requisitos minimos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de las rubricas del propio entorno Albedo (mas alla de la descripcion del mecanismo de recompensa), y no se aportan curvas de entrenamiento ni puntuaciones de la politica frente a la del rey.

## Requisitos de hardware

Nota: los pesos no estan publicados y el checkpoint base es privado, por lo que las cifras siguientes son estimaciones derivadas unicamente del recuento de parametros declarado por nomenclatura (35B totales, ~3B activos), no datos confirmados.

- VRAM para inferencia en bf16: aproximadamente 70 GB solo para pesos, mas cache KV; requiere una GPU de 80 GB (A100, H100) o reparto en varias GPU.
- VRAM en cuantizacion de 8 bits: del orden de 35-40 GB; viable en A100 40 GB o en 2x24 GB.
- VRAM en cuantizacion de 4 bits: del orden de 18-22 GB mas cache KV; en el limite de una RTX 4090 o RTX 3090 de 24 GB, con contexto reducido.
- GPU consumer: una RTX 4090 o 3090 de 24 GB podria alojar el modelo cuantizado a 4 bits, pero no hay confirmacion de que existan pesos GGUF publicados.
- Opciones de despliegue: carga del adaptador con `peft` y `transformers` (el ejemplo de la model card usa `PeftModel.from_pretrained` y `merge_and_unload`); para servicio en produccion serian aplicables vLLM, SGLang o TGI una vez fusionado el adaptador, y llama.cpp u Ollama si se generasen pesos GGUF, algo no anunciado.
- Latencia y throughput: no disponibles. Un MoE con ~3B parametros activos tendria un coste de computo por token propio de un modelo mucho menor, pero el ancho de banda de memoria para cargar todos los expertos sigue dominando el coste de decodificacion.

## Comparativa con modelos similares

La comparacion directa no es posible porque este repositorio contiene un adaptador LoRA sobre un checkpoint base privado, no un modelo autonomo. Se incluyen referencias de la misma categoria de tamano como orientacion; los datos de esas alternativas provienen de su documentacion publica, no de la informacion proporcionada para este modelo.

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChristopherJS/albedo-sn97-policy | No disponible (base declarado 35B) | No disponible (~3B por nomenclatura) | No disponible | No disponible | Sin pesos publicados |
| Qwen3-30B-A3B | 30,5B | 3,3B | 128K (segun documentacion publica del modelo) | Apache 2.0 | Pesos abiertos en Hugging Face |
| Mixtral 8x7B | 46,7B | 12,9B | 32K (segun documentacion publica del modelo) | Apache 2.0 | Pesos abiertos en Hugging Face |
| Alternativas de politica RL para agentes | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de pesos: la model card indica explicitamente que aun no se han subido pesos y que la ejecucion no ha comenzado. El repositorio no es utilizable tal cual.
- Base privado: el adaptador no reproduce la politica sin el checkpoint SFT privado de Qwen3.6-35B-A3B. No es un modelo autonomo ni reproducible de forma independiente.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial, redistribucion ni obras derivadas. Cualquier uso en produccion es juridicamente arriesgado.
- Idiomas no declarados: se desconoce el soporte multilingue real y el comportamiento fuera del dominio de entrenamiento.
- Dominio muy estrecho: el entrenamiento se realiza contra el simulador de observacion de Albedo SN97 y sobre problemas de duelo. La transferencia a otras tareas, entornos o formatos de herramientas es incierta y presumiblemente limitada.
- Riesgo de sobreajuste a la rubrica: al usar una rubrica de preguntas si/no juzgada por GLM-5.2 como recompensa, existe riesgo de reward hacking y de optimizar el criterio del juez en lugar de la tarea subyacente.
- Alucinacion: no hay evaluacion publicada de fidelidad factual y el modelo no esta orientado a generacion de conocimiento, por lo que no debe usarse como fuente de informacion.
- Gestion de versiones: cada subida reemplaza el contenido anterior y aplana el historial, lo que impide auditar versiones previas o comparar checkpoints del mismo run.
- Falta de validacion externa: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones de terceros.
- Inconsistencia temporal: la fecha de creacion y actualizacion indicada (2026-09-21) es posterior a la fecha habitual de referencia, un dato que conviene verificar antes de citar el repositorio.
- Dependencia de un juez externo no abierto: el proceso de evaluacion depende de GLM-5.2, cuyas version, peso y reproducibilidad no se especifican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChristopherJS/albedo-sn97-policy
- Dataset de duelos crudos: https://huggingface.co/datasets/ChristopherJS/albedo-sn97-duels
- Dataset de problemas de entrenamiento: https://huggingface.co/datasets/ChristopherJS/albedo-sn97-problems
- Bittensor SN97 (Albedo): la model card enlaza a una URL generica de GitHub (https://github.com/) sin repositorio concreto, por lo que el enlace real no esta disponible.
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo ni sobre Albedo SN97 (los resultados obtenidos trataban de elementos de inicio de Windows 10, guias de Shanghai Disney, instalacion de Microsoft Access y orden de visionado de anime, todos ellos no relacionados).
