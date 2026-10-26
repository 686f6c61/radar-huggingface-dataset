# HYU-NLP-EVA2/20261021_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino un conjunto de checkpoints de entrenamiento por refuerzo del proyecto HYU-NLP-EVA2, publicados en formato nativo VERL + FSDP. El identificador del repositorio indica que se parte de un modelo base de la familia Qwen3 con aproximadamente 4 000 millones de parametros y que el entrenamiento se realiza sobre HealthBench en su variante estatica ("healthbench_static"), con una recompensa basada en rubrica completa ("whole_rubric") y una implementacion denominada "ruscarl", en la etapa 1 del pipeline. Estos datos provienen exclusivamente del nombre del repositorio y deben tratarse como inferencia, no como especificacion verificada.

El problema que resuelve es de naturaleza metodologica: permite reproducir y auditar un proceso de RL sobre una tarea de evaluacion medica con correccion por rubrica, guardando el estado completo del actor (pesos, estados del optimizador y del scheduler) en cada paso. El autor verifica los pasos 10 a 110 en incrementos de 10, con los pasos 120 a 190 pendientes de subida, y advierte explicitamente de que estos pesos no son equivalentes a los pesos mergeados de Transformers ni de vLLM.

Su relevancia es acotada y muy especifica: sirve a investigadores que quieran estudiar dinamicas de entrenamiento, ablaciones de recompensa o reanudar el RL, no a desarrolladores que busquen un modelo desplegable. El repositorio ocupa 226,3 GB, tiene 0 descargas y 0 likes, y fue creado el 26 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. El identificador sugiere un transformer decoder-only de la familia Qwen3 (inferencia, no verificado) |
| Parametros totales | No disponible. El identificador "qwen3-4b" sugiere ~4 000 millones (inferencia, no verificado) |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio contiene checkpoints FSDP en formato de entrenamiento, no pesos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoints VERL FSDP sharded (PyTorch distribuido), ruta `checkpoints/global_step_N/actor/`. No son safetensors mergeados ni GGUF; requieren el merger FSDP de VERL antes de la inferencia |
| Pasos publicados | Verificados: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110. Pendientes: 120, 130, 140, 150, 160, 170, 180, 190 |
| Tamano del repositorio | 226,3 GB |
| Framework de entrenamiento | VERL con FSDP (indicado por el autor) |
| Tarea de entrenamiento | HealthBench en variante estatica, recompensa por rubrica completa (segun identificador) |
| Pipeline en HuggingFace | reinforcement-learning |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Lo unico documentado es el stack de entrenamiento: checkpoints nativos de VERL con Fully Sharded Data Parallel (FSDP), organizados por paso global y con un subdirectorio `actor/` que contiene el estado del actor. Esto implica un esquema de RL con politica separada (actor) y, presumiblemente, un critico o un esquema sin critico, aunque el autor no detalla el algoritmo (PPO, GRPO u otro). Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases previas de SFT o DPO.

Los elementos diferenciadores que si aparecen en la model card son operativos: el autor sube como maximo dos checkpoints de forma concurrente, conserva los checkpoints locales anteriores y elimina los 23 recien subidos solo tras verificar tamano de archivo y checksum en vivo. Esa politica de retencion es relevante porque el repositorio agrega pasos de forma incremental y el historico completo conviene para analisis de curvas de aprendizaje. No se documenta ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal) ni detalles de la funcion de recompensa mas alla de la etiqueta "whole_rubric".

## Capacidades

- Generacion de texto y razonamiento: presumiblemente heredadas del modelo base Qwen3 de ~4B, aunque no verificables sin mergear el checkpoint.
- Respuesta a tareas de evaluacion medica con rubrica: el entrenamiento apunta a HealthBench estatico, por lo que la capacidad esperada es la resolucion de preguntas con criterios de correccion multiples.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; no se menciona ninguna modalidad adicional.
- Uso como artefacto de investigacion: inspeccion de trayectorias de RL, seleccion de checkpoints intermedios y reanudacion de entrenamiento con VERL.

## Casos de uso

- Reproduccion de experimentos de RL: cargar `checkpoints/global_step_N/actor/` con el merger FSDP de VERL para reanudar el entrenamiento en el paso exacto y comparar curvas frente a otras ejecuciones del mismo proyecto.
- Investigacion sobre recompensas por rubrica: analizar como evoluciona la politica paso a paso (10, 20, ..., 110) cuando la recompensa se calcula sobre la rubrica completa de HealthBench, y aislar el efecto de componentes individuales de la rubrica.
- Ablaciones de hiperparametros: disponer de 11 puntos de control verificados permite estudiar sensibilidad a la tasa de aprendizaje, al tamano de lote o a la longitud de contexto sin recalcular el entrenamiento desde cero.
- Evaluacion de robustez en dominio sanitario: mergear un checkpoint tardio y someterlo a un conjunto de preguntas clinicas con correccion por criterios, midiendo calibracion y tasas de error factual antes de plantear cualquier uso real.
- Base para RL posterior en dominios regulados: partir del paso 110 como inicializacion de una segunda etapa ("s1" sugiere una etapa 1) y aplicar el mismo pipeline VERL a otro conjunto de tareas con rubrica verificable.
- Docencia y formacion tecnica: usar el repositorio como ejemplo real de estructura de checkpoints FSDP, gestion de almacenamiento (226,3 GB) y diferencias entre pesos de entrenamiento y pesos de servicio.
- Auditoria de artefactos publicados: verificar checksums y tamanos de archivo siguiendo la politica descrita por el autor para confirmar que los pasos anunciados como verificados estan completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de HealthBench, MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y al tratarse de checkpoints sin mergear no existen cifras de inferencia verificables.

## Requisitos de hardware

- Almacenamiento: 226,3 GB para el repositorio completo. Un unico checkpoint ronda los 8 GB si solo se conservan pesos en bf16 y puede acercarse a 40-48 GB si incluye estados del optimizador Adam en fp32 (estimacion para ~4B parametros; no confirmada por el autor).
- VRAM para entrenamiento o reanudacion: no disponible. El entrenamiento con FSDP de un modelo de ~4B requiere como minimo varios nodos o GPUs con interconexion de alta velocidad; el autor no publica configuracion.
- VRAM para inferencia tras mergear (estimacion): ~8-9 GB en bf16 solo para pesos, mas cache KV; en torno a 10-11 GB con 8 000 tokens de contexto. ~5 GB en cuantizacion de 8 bits y ~3 GB en 4 bits para contextos cortos.
- GPU consumer: si se mergea y cuantiza, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4090 24 GB. En bf16 con contexto largo, 24 GB es el minimo comodo en consumer.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB son adecuadas tanto para el merge como para servicio con vLLM o TGI.
- Opciones de despliegue: el checkpoint debe convertirse primero con el merger FSDP de VERL a formato Transformers; despues puede servirse con vLLM, TGI, SGLang, llama.cpp u Ollama (estos dos ultimos requieren conversion adicional a GGUF).
- Latencia y throughput: no disponible. No hay mediciones publicadas y dependeran del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

La comparacion se plantea a nivel de familia y formato, ya que este repositorio no es un modelo de servicio. Los datos de los modelos alternativos no se han verificado en esta ficha y se ofrecen como referencia de categoria.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (HYU-NLP-EVA2) | ~4B (inferido) | No disponible | Checkpoints VERL FSDP, requieren merge | No disponible | 226,3 GB, 0 descargas |
| Qwen3-4B (modelo base presumible) | ~4B | No verificado en esta ficha | Safetensors, GGUF | No verificada en esta ficha | Publico en HuggingFace |
| Llama 3.2 3B Instruct | ~3B | No verificado en esta ficha | Safetensors, GGUF | Licencia de comunidad Llama | Publico en HuggingFace |
| Phi-4-mini | ~3,8B | No verificado en esta ficha | Safetensors | Licencia MIT (segun el autor del modelo) | Publico en HuggingFace |
| Gemma 3 4B | ~4B | No verificado en esta ficha | Safetensors, GGUF | Terminos de uso de Gemma | Publico en HuggingFace |

La diferencia practica es que las alternativas son directamente desplegables, mientras que este repositorio exige el merge FSDP y, previsiblemente, un proceso de validacion adicional antes de cualquier uso en inferencia.

## Limitaciones y advertencias

- No son pesos de inferencia: el autor advierte de que son checkpoints VERL FSDP y que debe aplicarse el merger correspondiente. Cargarlos directamente en Transformers o vLLM fallara o producira resultados incorrectos.
- Licencia no disponible: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Cualquier uso en produccion requiere contactar con el autor.
- Ausencia total de evaluacion: no hay benchmarks, ni tasas de acierto en HealthBench, ni comparaciones con el modelo base. No es posible afirmar que el RL haya mejorado el rendimiento.
- Riesgo de alucinacion en dominio sanitario: cualquier checkpoint derivado de una tarea medica puede generar afirmaciones clinicas incorrectas con apariencia de seguridad. No debe usarse como herramienta de decision clinica.
- Sesgos desconocidos: no se documenta composicion del dataset ni procesos de filtrado, por lo que no puede evaluarse el sesgo demografico, linguistico o cultural.
- Idiomas no declarados: se desconoce si el entrenamiento preservo el multilingueismo del modelo base o lo degrado hacia el ingles.
- Idiomas y contexto sin verificar: al no publicarse la longitud de contexto efectiva tras el entrenamiento, el diseno de aplicaciones con ventanas largas es especulativo.
- Coste de almacenamiento y ancho de banda: 226,3 GB por repositorio, con subidas incrementales de hasta dos checkpoints concurrentes; conviene planificar cache local y verificar checksums.
- Trazabilidad incompleta: los pasos 120 a 190 estan pendientes, de modo que el repositorio es un artefacto en movimiento y las rutas pueden cambiar.
- Naturaleza de investigacion: 0 descargas y 0 likes indican que no ha pasado por validacion de la comunidad; tratalo como material interno de un grupo de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/20261021_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric
- Repositorio del framework VERL citado en la model card (no incluido en la informacion proporcionada, referencia al herramienta de entrenamiento): https://github.com/volcengine/verl
- Paper, blog, demo o repositorio adicional del autor: no disponibles en la informacion proporcionada.
