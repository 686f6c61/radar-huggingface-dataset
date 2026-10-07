# shun10/smolvla_openarm_pick_red_cube_dagger

## Resumen

SmolVLA OpenArm Pick Red Cube Dagger es una politica de robotica (vision-language-action, VLA) publicada por el usuario shun10 en Hugging Face, resultado de un ajuste fino del modelo base lerobot/smolvla_base. No es un modelo de lenguaje general: es un controlador neuronal que recibe el estado articular de un robot OpenArm bimanual, tres imagenes de camara (muneca izquierda, frontal, muneca derecha) a 480x640 y una instruccion de tarea en lenguaje natural, y devuelve un vector de 16 acciones motoras. El modelo resuelve una unica tarea de manipulacion: "Pick up the red cube and place it on the green dish."

Con 450.046.176 parametros (aproximadamente 450 millones) y un repositorio de 0,9 GB en safetensors, se situa en la gama de los VLA compactos, disenados para inferencia en hardware de consumo en lugar de clusters. La parte "dagger" del nombre indica que el conjunto de datos de entrenamiento se genero con el algoritmo DAgger (Dataset Aggregation), una tecnica de aprendizaje por imitacion interactivo en la que un experto corrige las trayectorias del propio aprendiz, lo que suele mejorar la robustez frente a estados de error respecto a la imitacion pura.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el flujo de trabajo actual de la robotica open source con LeRobot 0.6.0: dataset en el Hub, entrenamiento reproducible, publicacion de pesos y ejecucion con un unico comando (`lerobot-rollout`). Por otro, ilustra un caso muy habitual en investigacion: un ajuste fino de tarea unica, con 138 episodios y 100.197 fotogramas, sin resultados de evaluacion publicados y con cero descargas en el momento de la consulta, por lo que debe tratarse como un artefacto de investigacion y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; familia SmolVLA (paper arXiv:2506.01844), ajuste fino de lerobot/smolvla_base |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas en el repositorio) |
| Idiomas soportados | No disponible (no declarados; la instruccion de tarea de ejemplo esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de modelo | Politica de robotica (imitation learning), no modelo generativo de texto |
| Tipo de robot | `bi_openarm_follower` (OpenArm bimanual) |
| Camaras de entrada | `left_wrist`, `front`, `right_wrist` a (3, 480, 640) |
| Entrada de estado | `observation.state` con forma (16,) |
| Salida | `action` con forma (16,) |
| Dataset de entrenamiento | nkmurst/openarm_20260914_153326_150633_20260916_150242_140511_dagger_20260924_merged_pick_red_cube |
| Episodios / fotogramas | 138 episodios, 100.197 fotogramas a 30 FPS |
| Version de LeRobot | 0.6.0 |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |
| Fecha de publicacion | 2026-10-06 |

## Arquitectura y entrenamiento

SmolVLA es, segun el paper referenciado (arXiv:2506.01844, enlazado en la model card), un modelo de vision-lenguaje-accion compacto y eficiente que busca rendimiento competitivo con un coste computacional reducido y despliegue viable en hardware de consumo. La model card de este repositorio no detalla la composicion interna de bloques, el tipo de cabezal de acciones ni el mecanismo de integracion de la instruccion de tarea, por lo que esos extremos se marcan como no disponibles. Lo que si se especifica es la interfaz completa: tres flujos visuales a 480x640, un vector de estado de 16 dimensiones y un vector de accion de 16 dimensiones, con una instruccion textual de tarea que se pasa durante el rollout.

El ajuste fino se realizo con LeRobot 0.6.0 sobre el modelo base lerobot/smolvla_base, con 20.000 pasos de entrenamiento, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Estos hiperparametros son los tipicos de un ajuste fino de politica sobre un VLA preentrenado y no incluyen ninguna fase documentada de RLHF, DPO o aprendizaje por refuerzo: el proceso es aprendizaje por imitacion supervisado sobre demostraciones. El dataset tiene 138 episodios y 100.197 fotogramas grabados a 30 FPS para una sola tarea, y su nombre indica que las demostraciones se generaron o aumentaron con DAgger, es decir, con correcciones humanas sobre las trayectorias del propio aprendiz. No se documentan en la informacion proporcionada la composicion exacta del dataset, el numero de tokens de vision-lenguaje vistos durante el preentrenamiento del modelo base ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones motoras de 16 dimensiones para un robot OpenArm bimanual (`bi_openarm_follower`) a partir de observaciones multimodales.
- Percepcion visual con tres camaras simultaneas: muneca izquierda, frontal y muneca derecha, a 480x640 y 30 FPS.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica en el rollout mediante `--task`, con el texto de entrenamiento "Pick up the red cube and place it on the green dish."
- Ejecucion de una tarea de manipulacion concreta: recoger un cubo rojo y colocarlo en un plato verde.
- Integracion con el ecosistema LeRobot: ejecucion con `lerobot-rollout` y ajuste adicional con `lerobot-train`.
- Inferencia en flujo de control en tiempo real al ritmo del dataset (30 FPS), sujeto al hardware disponible.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explicito, modo de pensamiento, audio ni generacion de texto libre. Tampoco se documentan capacidades multilingues ni un listado de idiomas soportados.

## Casos de uso

- Recogida y colocacion en linea de montaje: el modelo ejecuta exactamente la tarea de coger un cubo y depositarlo en una bandeja, de modo que puede emplearse como controlador de una celda robotizada que clasifique piezas por posicion. Es adecuado porque ha sido entrenado especificamente sobre esa secuencia con 100.197 fotogramas.
- Base para ajuste fino con DAgger en nuevos objetos: el repositorio sirve como punto de partida para reentrenar con correcciones humanas sobre nuevas tareas, reutilizando el pipeline de LeRobot y el modelo base smolvla_base. Resulta util porque el flujo de datos y entrenamiento ya esta validado en este repositorio.
- Investigacion en aprendizaje por imitacion: permite reproducir un experimento completo (dataset, hiperparametros, semilla, version de libreria) con 20.000 pasos y lote 64, lo que facilita comparaciones controladas de tecnicas de agregacion de datos como DAgger frente a la imitacion conductual clasica.
- Benchmark interno de manipulacion bimanual: dado que el robot es un OpenArm de dos brazos con tres camaras, el modelo puede usarse como linea base de referencia frente a politicas propias sobre el mismo montaje fisico, comparando tasas de exito en la misma tarea.
- Validacion de infraestructura de robotica open source: sirve para verificar una instalacion de LeRobot 0.6.0 de extremo a extremo (calibracion de camaras, puerto del robot, ejecucion de rollout con duracion limitada) antes de invertir en grabacion de datos propios.
- Demostraciones y docencia: al ser un modelo de 450 M de parametros y 0,9 GB, puede desplegarse en un equipo con GPU de consumo para clases o demostraciones de VLA sin necesidad de infraestructura de centro de datos.
- Prototipado de control visual con multiples camaras: la interfaz de tres vistas sincronizadas a 480x640 permite experimentar con fusion de vistas en un caso de uso realista de percepcion robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), y la tabla de evaluacion queda como plantilla vacia.

| Metrica | Valor |
|---|---|
| Tasa de exito en tarea real | No disponible |
| Numero de ensayos | No disponible |
| Condiciones de evaluacion (posiciones, iluminacion, distractores) | No disponible |
| Benchmarks de robotica (LIBERO, CALVIN, SimplerEnv, etc.) | No disponible |
| Metricas de lenguaje o codigo (MMLU, HumanEval, GSM8K) | No aplica: no es un modelo de lenguaje general |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16 y 1,8 GB en fp32 solo para los pesos, dado que el repositorio completo ocupa 0,9 GB y tiene 450 M de parametros. A esa cifra hay que sumar el coste de los tres flujos de vision a 480x640 y de las activaciones; no se publica una medicion oficial.
- GPU recomendadas: no se especifica un listado oficial. Por tamano, cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070 o superior) deberia ser suficiente en bf16, aunque esta afirmacion es una estimacion y no un dato aportado por el autor.
- Cabe en GPU de consumo: si, segun la propia descripcion del metodo SmolVLA, que declara despliegue en hardware de consumo. El modelo base y este ajuste tienen el mismo orden de magnitud de parametros.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=shun10/smolvla_openarm_pick_red_cube_dagger`, indicando `--robot.type=bi_openarm_follower` y la configuracion de camaras. El reentrenamiento se realiza con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no se publican cifras. El dataset se grabo a 30 FPS, por lo que el lazo de control de referencia opera a esa frecuencia, pero el autor no aporta mediciones de latencia de inferencia ni de rendimiento por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shun10/smolvla_openarm_pick_red_cube_dagger | 450.046.176 | No disponible | VLA de tarea unica (OpenArm) | apache-2.0 | Hugging Face (0 descargas en la consulta) |
| lerobot/smolvla_base | No disponible en la informacion proporcionada | No disponible | VLA base preentrenado | No disponible en la informacion proporcionada | Hugging Face |
| Otros VLA open source de la misma categoria (por ejemplo OpenVLA o pi0) | No disponible en la informacion proporcionada | No disponible | VLA | No disponible en la informacion proporcionada | No disponible |

La unica comparacion que puede sostenerse con los datos aportados es frente a lerobot/smolvla_base, del que este modelo es un ajuste fino: comparten arquitectura y orden de magnitud de parametros, pero el ajuste esta especializado en una tarea concreta y en un tipo de robot concreto (`bi_openarm_follower`), mientras que el base es un modelo generalista de partida. Para cualquier otra alternativa de la misma categoria, los datos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo ha sido entrenado para una unica tarea, "Pick up the red cube and place it on the green dish." No debe esperarse generalizacion a otros objetos, otras posiciones de bandeja u otras instrucciones sin un nuevo ajuste fino.
- Acoplamiento al hardware: la interfaz de entrada exige un robot `bi_openarm_follower` con las camaras `left_wrist`, `front` y `right_wrist` en las posiciones y calibraciones usadas en la grabacion. Cambiar el montaje, la resolucion o la denominacion de las camaras invalida la politica.
- Sin resultados de evaluacion: el autor no publica tasa de exito, numero de ensayos ni condiciones de prueba, de modo que no hay evidencia cuantitativa de robustez frente a cambios de iluminacion, distractores o posiciones nuevas de los objetos.
- Riesgo de sobreajuste al dataset: con 138 episodios y una sola tarea, es probable que la politica reproduzca sesgos de las demostraciones (trayectorias, velocidad, punto de agarre) y falle ante estados no vistos. El uso de DAgger mitiga parcialmente este problema, pero no se documenta en que medida.
- Riesgo de alucinacion en el sentido conductual: como toda politica entrenada por imitacion, puede generar acciones plausibles pero fisicamente incorrectas en estados fuera de distribucion, sin ninguna senal de incertidumbre asociada.
- Idiomas: no se declaran idiomas soportados. La instruccion de tarea del ejemplo esta en ingles; usar otra lengua no esta documentado ni validado.
- Licencia: apache-2.0, lo que permite uso comercial y modificacion, pero el usuario debe verificar la licencia del modelo base (lerobot/smolvla_base) y del dataset de entrenamiento, cuyos terminos no se detallan en la informacion proporcionada.
- Advertencia de produccion: al tratarse de un artefacto de investigacion con cero descargas y sin evaluacion publicada, no deberia desplegarse en un entorno fisico con riesgo para personas o equipos sin una validacion exhaustiva previa y medidas de seguridad externas al modelo.
- La model card incluye fragmentos de plantilla sin rellenar (seccion "Citation" truncada, demo no embebida) y una instruccion de reemplazo de marcadores `<...>` en los comandos, lo que indica un repositorio poco maduro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shun10/smolvla_openarm_pick_red_cube_dagger
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nkmurst/openarm_20260914_153326_150633_20260916_150242_140511_dagger_20260924_merged_pick_red_cube
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Referencia arXiv: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nkmurst/openarm_20260914_153326_150633_20260916_150242_140511_dagger_20260924_merged_pick_red_cube
