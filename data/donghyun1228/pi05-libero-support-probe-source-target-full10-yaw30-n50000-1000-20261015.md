# Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw30-n50000-1000-20261015

## Resumen

El modelo `Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw30-n50000-1000-20261015` es una política robótica de tipo vision-language-action (VLA) construida sobre la librería `openpi` y publicada por el usuario Donghyun1228. Se trata de un artefacto de investigación centrado en la adaptación de un modelo de dinámica inversa (inverse dynamics model, IDM) sobre el benchmark de manipulación robótica LIBERO. El nombre del repositorio codifica la configuración experimental: sustitución de datos con sonda aleatoria de soporte cercano, configuración de orientación "yaw30", 50.000 fotogramas seleccionados, 1.000 actualizaciones de entrenamiento, batch 32 y semilla 42.

El modelo deriva de un modelo fuente reentrenado durante 10.000 actualizaciones (`pi05-libero-support-probe-source-n50000-10000-20261015`), cuyo commit se conserva como referencia. La model card indica que se preservan la normalización histórica y el codificador de muñeca (wrist encoder) del modelo fuente. La pérdida del IDM excluye la coordenada 6 del gripper y promedia las 31 coordenadas de acción restantes con relleno, mientras que las entradas, salidas y el control del gripper en evaluación conservan las siete coordenadas del robot.

Es relevante en el contexto de la investigación en robótica porque documenta un procedimiento reproducible de adaptación de dominio sobre políticas VLA congelando el LLM y actualizando por completo la torre de visión y el "action expert". La evaluación reportada alcanza 1486 éxitos sobre 2000 intentos, con semilla 7, 40 tareas y 50 ensayos por tarea. El repositorio ocupa 7,7 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con backbone LLM congelado, torre de vision y modulo "action expert" (basado en `openpi`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona inferencia en BF16) |
| Idiomas soportados | no disponible (modelo orientado a control robotico, no a dialogo) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explicita; export "raw step999" en BF16 segun la model card |

## Arquitectura y entrenamiento

La model card describe un modelo VLA compuesto por tres bloques diferenciados por su regimen de entrenamiento: un LLM backbone que permanece congelado, una torre de vision que se actualiza por completo y un "action expert" entrenado tambien por completo bajo la configuracion "full10". La adaptacion se realizo sobre un modelo fuente reentrenado durante 10.000 actualizaciones, conservando la normalizacion historica y el codificador de muñeca del modelo fuente. El entrenamiento objetivo consistio en 50.000 fotogramas seleccionados, 1.000 actualizaciones, batch de 32 y semilla 42, con un multiplicador post-Adam de 10 sobre el action expert.

El detalle tecnico mas destacable es el tratamiento asimetrico de las coordenadas: la perdida del modelo de dinamica inversa excluye la coordenada 6 (gripper) y promedia las 31 coordenadas de accion restantes con relleno, mientras que las entradas, salidas y el control del gripper durante la evaluacion mantienen las siete coordenadas completas del robot. La exportacion corresponde al paso 999 ("raw step999") en BF16, y la evaluacion se ejecuto en MuJoCo 3.2.3. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset mas alla del conjunto de fotogramas indicado, ni si se aplicaron etapas de RLHF o DPO (poco habituales en politicas de control).

## Capacidades

- Control robotico de manipulacion: genera acciones de robot a partir de observaciones visuales y de estado, orientado al benchmark LIBERO.
- Modelado de dinamica inversa (IDM): infiere acciones a partir de transiciones de estado, con la perdida definida sobre 31 coordenadas de accion (excluyendo la del gripper).
- Adaptacion de dominio: el modelo ejemplifica un flujo de sustitucion de datos con sonda aleatoria de soporte cercano y ajuste selectivo de modulos (LLM congelado, vision y action expert completos).
- Percepcion visual: incorpora una torre de vision con actualizacion completa y un codificador de muñeca (wrist encoder) heredado del modelo fuente.
- Control del gripper: las entradas, salidas y la evaluacion preservan las siete coordenadas del robot, incluida la de agarre.
- Ejecucion en simulacion: evaluado sobre MuJoCo 3.2.3 con el benchmark LIBERO.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades especiales (vision, audio, modo "thinking"): vision integrada en el pipeline VLA; audio y modo de razonamiento explicito no disponibles.

## Casos de uso

- Investigacion en manipulacion robotica sobre LIBERO: el modelo se puede ejecutar directamente sobre las 40 tareas del benchmark con 50 ensayos por tarea para reproducir la tasa de exito reportada (1486/2000) y comparar variantes de adaptacion.
- Estudio de modelos de dinamica inversa: sirve como punto de partida para analizar como afecta la sustitucion de datos con sonda aleatoria de soporte cercano al rendimiento del IDM, dado que la perdida excluye explicitamente la coordenada del gripper.
- Adaptacion de dominio de politicas VLA: el repositorio documenta el procedimiento (LLM congelado, vision y action expert completos, multiplicador post-Adam de 10) que puede reutilizarse para adaptar otras politicas `openpi` a nuevos entornos.
- Generacion de datos y aumento de dataset: al emplear 50.000 fotogramas seleccionados de un conjunto de 300.000 waypoints, el flujo es util para experimentos de seleccion y curado de datos de entrenamiento.
- Evaluacion reproducible de politicas roboticas: la model card indica semilla fija (seed 7), numero de clientes por GPU (ocho) y uso de un flujo de aleatoriedad compartido en servidor, lo que facilita la replicacion de resultados.
- Ablacion de componentes congelados frente a entrenables: permite medir el impacto de congelar el LLM manteniendo la vision y el action expert completamente entrenables en tareas de manipulacion.
- Transferencia a nuevos dominios de orientacion: la configuracion "yaw30" sugiere su uso en experimentos de variacion de orientacion del efector, si bien no se detalla el rango exacto en la informacion disponible.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO (evaluacion) | seed 7, 40 tareas, 50 ensayos por tarea, ocho clientes por GPU | 1486/2000 exitos (74,3 %) |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros no aplicables a un modelo de control robotico) ni comparaciones numericas directas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 7,7 GB y la inferencia se documenta en BF16, por lo que el peso del modelo se situa en ese orden de magnitud; la VRAM total dependera de las activaciones y de la resolucion de las observaciones visuales (estimacion, no dato confirmado).
- GPU recomendadas: no disponibles. Por tamaño de repositorio, es plausible su ejecucion en GPU de gama alta para investigacion; no se confirma compatibilidad con ninguna GPU concreta (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada. Segun el tamaño del repositorio (7,7 GB), seria factible en GPU con 16-24 GB de VRAM, pero no hay dato oficial.
- Opciones de despliegue: la model card especifica la libreria `openpi`, inferencia en BF16 y el simulador MuJoCo 3.2.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion se realizo con ocho clientes por GPU y un flujo de aleatoriedad compartido en servidor, pero no se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05-libero-...yaw30) | no disponible | no disponible | Manipulacion robotica / IDM sobre LIBERO | apache-2.0 | HuggingFace, 0 descargas |
| Modelo fuente pi05-libero-support-probe-source-n50000-10000 | no disponible | no disponible | Manipulacion robotica / IDM sobre LIBERO | no disponible en la informacion | HuggingFace (commit referenciado) |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar con modelos alternativos de la misma categoria (por ejemplo, otras politicas VLA o modelos de dinamica inversa) en cuanto a parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ambito muy restringido: es una politica de control robotico evaluada sobre el benchmark LIBERO en MuJoCo 3.2.3; no es un modelo de proposito general ni de lenguaje conversacional.
- Sin validacion en hardware real: la evaluacion reportada es en simulacion; no se aportan datos de transferencia sim-to-real.
- Perdida asimetrica del gripper: la perdida del IDM excluye la coordenada 6 y promedia 31 coordenadas con relleno, lo que puede introducir un sesgo en el modelado de las acciones de agarre frente al resto de articulaciones.
- Riesgo de sobreajuste al dominio: al adaptar sobre 50.000 fotogramas seleccionados de un conjunto concreto de waypoints, el comportamiento fuera de esa distribucion (nuevos objetos, iluminacion u orientaciones distintas) no esta garantizado.
- Dependencia del modelo fuente: la normalizacion historica y el codificador de muñeca se heredan del modelo fuente, por lo que reproducir resultados exige el commit exacto (`ea4f0bb...`) y su artefacto asociado.
- Reproducibilidad dependiente de la aleatoriedad compartida: la model card indica que la aleatoriedad de la politica usa un flujo compartido en servidor y una semilla concreta (seed 7); variaciones en esa configuracion pueden alterar los resultados.
- Sin datos de sesgo, alucinacion o idioma: la informacion disponible no incluye analisis de sesgos ni evaluaciones multilingues, que ademas no aplican al proposito del modelo.
- Licencia: apache-2.0 permite uso comercial, pero al derivar de un modelo fuente y de un dataset concretos conviene verificar las condiciones de esos artefactos antes de un uso en produccion.
- Madurez limitada: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que sugiere un artefacto de investigacion sin adopcion comunitaria ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw30-n50000-1000-20261015
- Modelo fuente citado en la model card: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015 (commit `ea4f0bb2001e12d701af8a294f91da437e857f55`)
- Dataset citado en la model card: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-yaw30-20261015 (commit `9d2f1f4b5bbd4d2306b27aa4a1885738a019df32`)
- Libreria `openpi`: no se proporciona enlace en la informacion disponible
- Papers, blogs, repos o demos adicionales: no disponible. Los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre este modelo.
