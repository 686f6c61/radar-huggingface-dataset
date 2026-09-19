# SeanWang0027/babyai-sft-x3-1p7b

## Resumen

babyai-sft-x3-1p7b es un ajuste fino supervisado (SFT) de Qwen/Qwen3-1.7B, publicado por el usuario SeanWang0027 el 18 de septiembre de 2026. El checkpoint contiene 2.031.739.904 parametros en formato safetensors y se distribuye bajo licencia Apache 2.0. No es un modelo de proposito general: es una de las tres ramas de un experimento controlado de entrenamiento de agentes sobre el entorno BabyAI, en concreto la rama denominada "teacher-SFT".

Los datos de entrenamiento se generaron con un profesor Qwen3-32B que jugo tres episodios sobre cada una de las 810 tareas de entrenamiento de BabyAI del split de AgentGym-RL, con un maximo de 20 turnos por episodio y el modo thinking desactivado. Solo se conservaron los episodios exitosos, y cada turno del profesor se convirtio en una fila supervisada. El entrenamiento uso batch 32, learning rate 1e-5, una epoca y un tope de 76 pasos de optimizador, fijado para igualar los 75 pasos de las ramas ROSE/OPD de la misma comparativa.

Su relevancia es acotada pero clara para investigacion: demuestra que un modelo denso de ~2.000 millones de parametros puede alcanzar un 78,1% de exito en el official_test de 90 tareas de BabyAI mediante destilacion desde un profesor mucho mayor, y sirve como referencia reproducible para comparar estrategias de SFT frente a RL en entornos de agente. Con cero descargas y cero "likes" en el momento de la consulta, carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-1.7B; no se detalla en la informacion disponible |
| Parametros totales | 2.031.739.904 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B (finetune) |
| Tamano del repositorio | 4,1 GB |
| Checkpoint de origen | global_step_76/huggingface |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso, y no introduce cambios arquitectonicos documentados: se trata de un ajuste fino completo del checkpoint base. El autor no especifica en la model card si se congelaron capas, si se uso LoRA o si se entreno a precision completa, ni detalla la composicion exacta del dataset mas alla de su origen.

El proceso de generacion de datos es la parte mas relevante tecnicamente. Un profesor Qwen3-32B interactuo con las 810 tareas de entrenamiento de BabyAI del split de AgentGym-RL, con un maximo de 20 turnos por episodio y el modo de pensamiento desactivado. Solo se retuvieron los episodios resueltos con exito, y cada turno del profesor (observacion, accion) se convirtio en una fila de entrenamiento supervisado, de modo que el alumno imita la politica del profesor turno a turno. La configuracion de entrenamiento fue batch 32, learning rate 1e-5, una epoca y un tope de 76 pasos de optimizador, calibrado deliberadamente para igualar los 75 pasos de las ramas ROSE y OPD de la comparativa descrita en `babyai/THREE_ARMS.md` del repositorio cl-from-nothing/online-rose (commit 01aaed5). No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Ejecucion de tareas de agente en el entorno BabyAI: interpretacion de instrucciones en lenguaje natural y emision de acciones discretas en un grid world.
- Interaccion multi-turno: los episodios de entrenamiento llegan hasta 20 turnos, por lo que el modelo esta expuesto a cadenas de observacion-accion relativamente largas.
- Seguimiento de instrucciones en entornos simulados de navegacion y manipulacion de objetos.
- Destilacion de politica: reproduce el comportamiento de un profesor Qwen3-32B en las tareas incluidas en el split de entrenamiento.
- Capacidad de actuar como politica base para experimentos posteriores de RL (es la rama de inicializacion que las otras dos ramas de la comparativa tratan de superar).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente generalistas fuera de BabyAI: no disponibles ni evaluadas.
- Capacidades multilingues: no disponibles (no se documentan idiomas; el entorno BabyAI opera en ingles).
- Modo thinking: no entrenado con el modo de pensamiento activado; el profesor genero los datos con thinking desactivado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion en destilacion de agentes: usar este checkpoint como rama "teacher-SFT" de referencia y compararla contra metodos de RL o de auto-destilacion en el mismo conjunto de 810 tareas, gracias a que el numero de pasos de optimizador esta igualado.
- Reproduccion de experimentos de agente a pequena escala: con ~2.000 millones de parametros el modelo se puede entrenar y evaluar en una sola GPU de consumo, lo que abarata la replicacion de la comparativa de tres brazos.
- Inicializacion para RL posterior: al haber sido entrenado con SFT sobre trayectorias exitosas, es un punto de partida razonable para algoritmos de policy gradient sobre BabyAI, en lugar de arrancar desde el modelo base sin ajustar.
- Evaluacion de robustez de politicas en grid worlds: permite medir la tasa de exito por tarea y por numero de turnos, y detectar en que tareas concretas de las 90 del official_test falla la politica.
- Generacion de trayectorias de referencia: las rollouts del modelo se pueden usar como datos positivos o negativos para entrenar tecnicas de filtrado, reward modeling o comparacion de politicas.
- Docencia y divulgacion sobre agentes: un modelo de 2B bajo Apache 2.0 es adecuado para demostraciones locales de un bucle agente-entorno sin depender de APIs externas.
- Benchmark interno de infraestructura: por su tamano, sirve para validar pipelines de despliegue (vLLM, TGI) y de evaluacion multi-turno antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| BabyAI official_test (90 tareas) | 78,1% de exito | 4 muestras por tarea, thinking desactivado |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de proposito general. Tampoco se aportan las cifras de las ramas ROSE y OPD con las que se compara en el experimento original, mas alla de que ambas usaron 75 pasos de optimizador.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones a partir del numero de parametros (2,03 mil millones) y del tamano del repositorio (4,1 GB); el autor no publica mediciones.

- Pesos en BF16/FP16: aproximadamente 4,1 GB, coherente con el tamano del repositorio.
- VRAM total estimada en BF16: del orden de 6-8 GB contando cache KV y overhead, dependiendo de la longitud de contexto y del tamano de batch.
- Cuantizacion a 8 bits: aproximadamente 2,5 GB de pesos.
- Cuantizacion a 4 bits: aproximadamente 1,5 GB de pesos, aunque requeriria convertir los safetensors, ya que no se publican artefactos cuantizados.
- GPU de consumo: si cabe en tarjetas con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En 6 GB puede ser ajustado en 4 bits con contexto corto.
- GPU profesionales: A100 o H100 no son necesarias para inferencia de una sola instancia; solo tienen sentido para evaluaciones con batch muy alto o para reentrenar el modelo.
- Opciones de despliegue: vLLM, SGLang, TGI y transformers de forma nativa con safetensors. llama.cpp y Ollama requeririan una conversion previa a GGUF que no esta incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Exito en BabyAI official_test |
|---|---|---|---|---|
| babyai-sft-x3-1p7b | 2,03B | no disponible | Apache 2.0 | 78,1% |
| Qwen/Qwen3-1.7B (base sin ajustar) | 1,7B nominales | no disponible | Apache 2.0 | no disponible |
| Otras ramas ROSE/OPD del mismo experimento | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la informacion proporcionada otros modelos de agente especificamente entrenados sobre el split de AgentGym-RL de BabyAI, ni cifras publicadas de alternativas comparables en ese mismo benchmark, por lo que la comparacion cuantitativa con terceros no esta disponible.

## Limitaciones y advertencias

- Ambito de entrenamiento muy estrecho: el modelo se ha ajustado exclusivamente sobre BabyAI, un grid world con instrucciones en ingles y acciones discretas. Fuera de ese entorno no hay garantia de comportamiento util.
- Riesgo de olvido catastrofico: al ser un finetune completo de una sola epoca sobre un dominio especifico, es probable la degradacion de las capacidades generales de generacion de texto, codigo o matematicas del modelo base.
- Alucinacion: no existen evaluaciones de fidelidad ni de tasa de alucinacion en la informacion disponible; en tareas de lenguaje abierto el riesgo es alto e inmedible con los datos publicados.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni seguridad.
- Idiomas: no se especifican los idiomas soportados; el corpus de BabyAI es en ingles, por lo que el rendimiento en castellano es desconocido.
- Tasa de fallo en el dominio objetivo: el 78,1% de exito implica que aproximadamente una de cada cinco tareas del official_test no se resuelve.
- Modo de razonamiento: el profesor genero los datos con thinking desactivado, por lo que no se debe esperar comportamiento de cadena de pensamiento larga ni mejoras por test-time compute.
- Validacion inexistente: cero descargas y cero "likes" en el momento de la consulta, sin revision por parte de la comunidad ni ficha de datos asociada.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. El modelo base Qwen/Qwen3-1.7B se distribuye tambien bajo Apache 2.0, por lo que no anade restricciones adicionales conocidas.
- Produccion: no se recomienda su uso en produccion fuera de contextos de investigacion o simulacion, dada la ausencia de evaluaciones de robustez, latencia y seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/babyai-sft-x3-1p7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio citado en la model card: cl-from-nothing/online-rose, commit 01aaed5, archivo `babyai/THREE_ARMS.md` (sin URL proporcionada en la informacion disponible)
- Dataset de tareas citado: split de 810 tareas de entrenamiento de BabyAI en AgentGym-RL (sin URL proporcionada en la informacion disponible)
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo; los unicos resultados obtenidos correspondian a paginas de descarga de Telegram Desktop, sin relacion con el modelo.
