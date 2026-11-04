# HarleyCooper/weight-space-breakout-basic-repair-01

## Resumen

`HarleyCooper/weight-space-breakout-basic-repair-01` no es un modelo de lenguaje. Es una politica de control para el juego Breakout con 17.253 parametros, publicada en formato safetensors, que forma parte de un experimento de "weight-space programming": un agente LLM (Qwen) propone ediciones directas sobre los pesos de una red pequena y un verificador decide si la nueva politica mejora sobre la anterior en partidas con semillas fijas.

El checkpoint publicado corresponde al estado inicial del experimento: una politica deliberadamente danada con los controles invertidos (reversed-controls), usada como banco de pruebas didactico. El objetivo del pipeline es reparar esa politica mediante rondas acotadas de propuestas escalares, evaluacion en 512 semillas emparejadas y promocion solo si la ganancia media supera 0,10 y `gain - 2 * paired_standard_error > 0`. La version 0.4.4 anade un protocolo de reparacion de fallo plantado (`REPAIR_PROTOCOL=basic-repair-v1`).

Su relevancia no esta en el rendimiento del agente de Breakout, sino en la metodologia: demuestra un bucle de feedback acotado, con hashes verificables, checkpoints inmutables en el Hub y auditoria separada de 1.024 partidas. El autor advierte explicitamente que el experimento no demuestra reparacion de fallos desconocidos ni mejora recursiva sostenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal pequena de control (politica de juego); topologia exacta no disponible |
| Parametros totales | 17.253 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `policy.npz`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `initial_baseline.safetensors`), `policy.npz`, `policy.json` |

## Arquitectura y entrenamiento

La politica es una red de 17.253 parametros que mapea observaciones del entorno Breakout a acciones de control. La model card no detalla el numero de capas, las funciones de activacion ni el esquema de observacion; solo indica que es un "game controller" y no un modelo de lenguaje. El checkpoint publicado es el estado inicial con controles invertidos, conservado en `initial_baseline.safetensors` como referencia conocida como mala.

El "entrenamiento" en este contexto es un proceso de edicion en espacio de pesos orquestado por un LLM. En cada ronda, el entorno alojado en Prime ejecuta 32 partidas de practica (semillas `40000 + 32*round` a `40031 + 32*round`) y devuelve trayectorias cortas. El modelo `qwen/qwen3.6-35b-a3b`, alojado en Prime, propone hasta 64 asignaciones escalares sin uso de herramientas. El verificador valida las ediciones y compara candidato e incumbente en 512 semillas nuevas emparejadas (`60000 + 512*round` a `60511 + 512*round`). Se promociona solo si la ganancia media supera 0,10 y la cota inferior de dos errores estandar emparejados es positiva. Tras la ultima ronda se ejecuta una auditoria separada de 1.024 partidas (semillas `90000..91023`) que no interviene en la promocion. El limite es de 20 rondas en el entorno; la primera ejecucion publicada se limita a tres rondas y 4.096 tokens de salida por llamada, con temperatura 0,6 y timeout de 60 minutos en el servicio alojado.

## Capacidades

- Control de un agente en el entorno Breakout mediante politica de pesos fijos.
- Serializacion y publicacion de pesos verificados con hashes encadenados (`manifest.json` enlaza huella, checksum, plan y decisiones por ronda).
- Reproduccion determinista de evaluaciones mediante conjuntos de semillas fijos para practica, promocion y auditoria final.
- Soporte del protocolo de reparacion basica (`basic-repair-v1`) con propuestas escalares acotadas a 64 asignaciones por ronda.
- Trazabilidad completa: cada commit del Hub es una version inmutable y la demo resuelve una revision antes de descargar, comprobando ambos hashes.
- No soporta tool calling, agentes multi-paso, vision, audio ni capacidades multilingues; no es un modelo generativo de texto.

## Casos de uso

- Docencia sobre edicion en espacio de pesos: el checkpoint con controles invertidos sirve como caso base reproducible para explicar como un LLM puede proponer modificaciones escalares y como se valida su efecto con semillas emparejadas.
- Investigacion en metodos de reparacion de politicas: el pipeline permite estudiar la tasa de aceptacion de candidatos bajo un criterio estadistico explicito (ganancia > 0,10 y cota inferior positiva) sin necesidad de GPU para el juego.
- Benchmarking de protocolos de evaluacion: los conjuntos de semillas separados para practica, promocion y auditoria permiten medir el efecto de la seleccion adaptativa y detectar sobreajuste a las semillas de promocion.
- Auditoria de reproducibilidad: los hashes encadenados y los checkpoints inmutables permiten reconstruir exactamente que politica estaba activa en cada ronda y verificar que la demo cargo la revision correcta.
- Desarrollo de orquestadores ligeros: el controlador (validacion JSON, serializacion de pesos, publicacion y comprobaciones de despliegue) es un ejemplo de separacion entre inferencia LLM alojada y logica de publicacion local.
- Experimentos de comparacion de editores LLM: al fijar el entorno y las semillas, el mismo pipeline puede usarse para comparar distintos modelos editores sobre la misma politica danada.

## Benchmarks y rendimiento

La model card incluye una tabla de rondas con columnas `Round`, `Incumbent`, `Candidate`, `Mean gain` y `Decision`, pero no se proporcionan valores numericos en la informacion disponible. Tampoco se publican resultados de MMLU, HumanEval, GSM8K ni metricas equivalentes, ya que no es un modelo de lenguaje.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del juego: no se necesita GPU; la simulacion corre en CPU de Hugging Face.
- GPU recomendadas: ninguna para el controlador ni para la simulacion; la inferencia del editor LLM (`qwen/qwen3.6-35b-a3b`) se ejecuta en el servicio alojado de Prime, no en local.
- Compatibilidad con GPU de consumo: irrelevante para este checkpoint por su tamano (17.253 parametros, repo de 0,0 GB).
- Despliegue: el controlador es un proceso ligero de orquestacion; la demo se sirve como Space de Hugging Face sobre CPU. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. La model card solo indica limites operativos del servicio alojado (16.384 tokens por respuesta, timeout de 60 minutos) y posibles costes de Prime por inferencia LLM y evaluacion alojada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| weight-space-breakout-basic-repair-01 | 17.253 | no aplica | Control de Breakout | MIT | Hugging Face |
| Politicas de RL para Atari/Breakout (referencia generica) | variable (tipicamente 10^5-10^7) | no aplica | Control de Atari | variable | no disponible |
| Modelos de lenguaje para edicion de pesos (p. ej. Qwen3.6-35B-A3B como editor) | 35B totales (MoE) | no disponible | Edicion en espacio de pesos | no disponible | Prime |

No se dispone de datos publicados de modelos directamente comparables en la misma categoria (politicas de 17.253 parametros con protocolo de reparacion verificado). La comparativa anterior es orientativa y no se basa en resultados medidos en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado es una politica con controles invertidos: su rendimiento en juego es deliberadamente malo y no debe usarse como controlador funcional.
- El experimento no demuestra reparacion de fallos desconocidos ni mejora recursiva sostenida; la propia model card lo explicita.
- La regla de promocion es un filtro de ingenieria, no una prueba de significacion estadistica general; la busqueda adaptativa requiere replicacion independiente.
- La tabla de rondas no incluye valores numericos en la informacion disponible, por lo que no es posible verificar la magnitud de las ganancias.
- El harness por defecto de Prime anunciaba herramientas `bash` y `edit`; el prompt las prohibia y ademas afirmaba incorrectamente que no estaban disponibles. El controlador exige una unica llamada completada y cero llamadas reales a herramientas, pero la ejecucion demuestra ediciones sin uso de herramientas, no un harness tecnicamente libre de herramientas.
- Las medias de distintas rondas no son directamente comparables porque cada candidato se evalua en 512 semillas nuevas.
- La simulacion corre en CPU de Hugging Face y la inferencia LLM en Prime; los costes de inferencia y evaluacion alojada pueden aplicarse.
- No hay datos sobre sesgos, alucinacion o limitaciones idiomaticas porque el artefacto no procesa lenguaje natural.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento de la politica en entornos distintos del Breakout simulado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/weight-space-breakout-basic-repair-01
- Demo (Space): https://huggingface.co/spaces/HarleyCooper/weight-space-breakout-basic-repair-demo-01
- Codigo del pipeline: https://github.com/HarleyCoops/weight-space-breakout-pipeline
- Entorno en Prime: https://app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout
- Documentacion del protocolo de reparacion basica: `BASIC_REPAIR.md` (referenciado en la model card)
- Documentacion del editor preparado: `PREPARED_EDITOR.md` (referenciado en la model card)
- Documentacion de reparacion guiada por fallos: `FAILURE_DRIVEN.md` (referenciado en la model card)
