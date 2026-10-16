# Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-small-n100000-1000-20261015

## Resumen

El modelo `Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-small-n100000-1000-20261015` es un checkpoint de política robótica de tipo vision-language-action (VLA) publicado por el usuario Donghyun1228 bajo la librería `openpi`. El prefijo `pi05` y la etiqueta `openpi` lo sitúan en la familia pi0.5, un esquema que combina un backbone de visión y lenguaje con un experto de acción dedicado. El modelo está especializado en manipulación robótica sobre el benchmark LIBERO y su propósito declarado es servir como adaptación de un modelo de dinámica inversa (IDM) mediante sustitución de datos *support-near random-probe* con la variante de vista reducida (`view_small`).

El entrenamiento se realizó sobre 100.000 fotogramas seleccionados durante 1.000 actualizaciones con batch 32 y semilla 42, partiendo de un checkpoint fuente reentrenado durante 10.000 actualizaciones. Durante el ajuste se congeló el modelo de lenguaje, se actualizó por completo la torre de visión y se aplicó LoRA sobre el experto de acción con un multiplicador posterior a Adam de 0,1. La normalización histórica y el encoder de muñeca del modelo fuente se preservan, lo que refuerza la continuidad entre ambos checkpoints.

La relevancia de esta ficha es acotada pero concreta: se trata de un artefacto de investigación reproducible (exportación *raw step999*, inferencia en BF16, evaluación sobre MuJoCo 3.2.3) con un resultado declarado de 1.812 éxitos sobre 2.000 ensayos en LIBERO. No hay indicios de uso generalista fuera de robótica ni de soporte conversacional multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia pi0.5 sobre `openpi`; no se detalla la topología interna en la model card |
| Parametros totales | no disponible (el repositorio ocupa 6,9 GB en BF16) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 para inferencia; no se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente; exportación *raw step999* compatible con la librería `openpi`, inferencia en BF16 |
| Pipeline declarado | robotics |
| Tamano del repositorio | 6,9 GB |
| Framework de simulacion | MuJoCo 3.2.3 |
| Dataset de entrenamiento | `Donghyun1228/libero-support-random-waypoint-300k-20261015` (commit `32ed215baf01af7e82f927a62b108873aa70bd19`) |
| Checkpoint fuente | `Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015` (commit `e435806e413a90c3b74c9411228a72b53b97060c`) |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna con detalle, pero el identificador `pi05` y la dependencia de `openpi` apuntan a una arquitectura VLA de la familia pi0.5: un componente de percepción y lenguaje que interpreta observaciones visuales e instrucciones, y un experto de acción que genera trayectorias motoras. El proceso de adaptación documentado es explícito en cuanto a qué partes se entrenan y cuáles no: el modelo de lenguaje permanece congelado, la torre de visión se actualiza por completo y el experto de acción recibe un ajuste LoRA (`lora01`) con un multiplicador posterior a Adam de 0,1. La normalización histórica y el encoder de muñeca del checkpoint fuente se conservan intactos, lo que indica que la adaptación se centra en el comportamiento motor y no en la representación visual básica.

El régimen de entrenamiento es igualmente concreto: 100.000 fotogramas seleccionados con un esquema *support-near random-probe* sobre vista reducida, 1.000 actualizaciones, batch de 32 y semilla 42, partiendo de un modelo fuente reentrenado durante 10.000 actualizaciones. Hay un detalle técnico relevante en la función de pérdida del IDM: se excluye la coordenada 6 (gripper) y se promedian las 31 coordenadas de acción restantes con relleno (*padding*), mientras que las entradas y salidas de la política y el control del gripper en evaluación mantienen las siete coordenadas del robot. Es decir, la pérdida de dinámica inversa opera sobre 31 dimensiones, pero el espacio de acción efectivo de la política sigue siendo de siete grados de libertad.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica: el modelo produce comandos de siete coordenadas (incluida la del gripper) a partir de observaciones visuales e instrucciones de tarea.
- Control de gripper en evaluacion: se conserva explicitamente la septima coordenada en las entradas, salidas y en el control durante la evaluacion.
- Razonamiento de dinamica inversa (IDM): capacitado para inferir acciones a partir de transiciones de estado, con la perdida restringida a 31 coordenadas de accion y sin la coordenada del gripper.
- Adaptacion de dominio mediante LoRA: el experto de accion se puede ajustar con LoRA mientras el LLM permanece congelado y la vision se actualiza por completo.
- Ejecucion en simulacion fisica: validado sobre MuJoCo 3.2.3 con el benchmark LIBERO.
- Evaluacion reproducible: el modelo documenta semillas, numero de tareas, ensayos por tarea e infraestructura de evaluacion (ocho clientes por GPU, flujo de aleatoriedad compartido en servidor).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso generalistas: no disponibles.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo *thinking*: no disponible (unicamente se confirma el uso de un encoder de vision y de un encoder de muñeca).

## Casos de uso

- Evaluacion de politicas en LIBERO: el modelo se puede desplegar directamente sobre el benchmark LIBERO con MuJoCo 3.2.3 para reproducir el resultado declarado de 1.812 exitos sobre 2.000 ensayos (40 tareas, 50 ensayos por tarea, semilla 7). Es su caso de uso primario y el unico respaldado por evidencia cuantitativa.
- Investigacion en dinamica inversa: el entrenamiento del IDM con 31 coordenadas promediadas y la exclusion de la coordenada del gripper lo convierten en un punto de partida para estudiar como se representan las transiciones estado-accion en politicas VLA.
- Ablaciones de seleccion de datos: el esquema *support-near random-probe* sobre 100.000 fotogramas permite comparar estrategias de curado de datos contra el checkpoint fuente, que uso 10.000 actualizaciones sobre el mismo corpus base.
- Estudio de adaptacion con LoRA sobre expertos de accion: el ajuste con `lora01` y multiplicador post-Adam de 0,1 es un caso de referencia para medir cuanto rendimiento se recupera congelando el LLM.
- Reentrenamiento de encoders especificos: al preservarse el encoder de muñeca del modelo fuente, sirve para experimentos que aíslan el efecto del encoder de muneca frente al resto de la torre de vision.
- Infraestructura de evaluacion paralela: la configuracion de ocho clientes por GPU y flujo de aleatoriedad compartido es directamente reutilizable como plantilla para *harnesses* de evaluacion de politicas a gran escala.
- Transferencia a otros benchmarks de manipulacion: solo de forma exploratoria, dado que no hay evidencia publicada de evaluacion fuera de LIBERO.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO | Semilla 7, 40 tareas, 50 ensayos por tarea (2.000 ensayos), ocho clientes por GPU | 1.812 / 2.000 exitos (90,6 %) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Tampoco se proporcionan metricas comparativas frente al checkpoint fuente ni frente a otros modelos de la familia pi0.5.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,9 GB y la inferencia se realiza en BF16, por lo que el peso de los parametros ronda esa cifra; habria que sumar el espacio de activaciones y buffers de vision, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponible en la model card. Por el tamano del repositorio (6,9 GB en BF16) es plausible ejecutarlo en GPU de 24 GB, pero el autor no publica una lista de hardware validado.
- Encaje en GPU de consumo: probable en tarjetas de 24 GB o mas (RTX 3090, RTX 4090) segun el tamano de los pesos, aunque no hay confirmacion explicita del autor.
- Opciones de despliegue: libreria `openpi` como via principal; simulacion con MuJoCo 3.2.3. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El unico dato de infraestructura es que la evaluacion se ejecuto con ocho clientes por GPU y un flujo de aleatoriedad compartido en servidor, lo que sugiere ejecucion por lotes en paralelo.
- Precisión de ejecucion: BF16 obligatorio segun la model card (exportacion *raw step999*).

## Comparativa con modelos similares

| Modelo | Actualizaciones de entrenamiento | Fotogramas / datos | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (target, `view_small`) | 1.000 | 100.000 fotogramas seleccionados | 1.812 / 2.000 en LIBERO (90,6 %) | Apache 2.0 | HuggingFace |
| `pi05-libero-support-probe-source-n100000-10000-20261015` (fuente) | 10.000 | 100.000 fotogramas seleccionados | no disponible | Apache 2.0 | HuggingFace |
| Otros modelos VLA de la familia pi0.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones publicadas de alternativas como OpenVLA, Octo u otras politicas VLA en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable con modelos de la misma categoria.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta entrenado y evaluado exclusivamente sobre LIBERO en MuJoCo; no hay evidencia de transferencia a robots reales ni a otros entornos.
- Sin benchmarks generalistas: no se publican resultados de razonamiento, codigo, matematicas ni comprension del lenguaje, por lo que no debe tratarse como un modelo de proposito general.
- Idiomas no documentados: la model card no especifica que lenguas entiende el componente de instrucciones, lo que impide afirmar soporte multilingue.
- Trazabilidad parcial: aunque la card detalla commits, semillas y recetas de entrenamiento, no documenta la composicion exacta del dataset ni el reparto train/val/test.
- Riesgo de sobreajuste al benchmark: con 1.000 actualizaciones sobre 100.000 fotogramas y una evaluacion declarada de 90,6 %, conviene verificar el resultado en semillas y tareas no vistas antes de asumir generalizacion.
- Alucinacion en el sentido de acciones fisicamente invalidas: como toda politica VLA, puede generar trayectorias incoherentes fuera de la distribucion de entrenamiento; no hay analisis de fallos publicado.
- Sesgos: no hay informacion sobre sesgos demograficos, culturales o de otro tipo, dado el caracter puramente robotico del modelo.
- Uso comercial: la licencia Apache 2.0 permitiria uso comercial, pero la ausencia de garantias de rendimiento fuera de LIBERO hace desaconsejable su despliegue en produccion sin una validacion propia.
- Cero traccion verificable: el repositorio registra 0 descargas y 0 *likes*, por lo que no existe validacion independiente por parte de la comunidad.
- Dependencia de version: la evaluacion exige MuJoCo 3.2.3; otras versiones pueden alterar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-lora01-view-small-n100000-1000-20261015
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015 (commit `e435806e413a90c3b74c9411228a72b53b97060c`)
- Dataset de entrenamiento: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-20261015 (commit `32ed215baf01af7e82f927a62b108873aa70bd19`)
- Repositorio de la libreria `openpi`: no disponible en la informacion proporcionada
- Paper, blog o demo asociados: no disponible
- Busqueda web: los resultados devueltos corresponden integramente a Google Health Coach y no guardan relacion con este modelo, por lo que no se incluye ningun enlace adicional.
