# RoboCrafty/act_parol6_real_1_2

## Resumen

`RoboCrafty/act_parol6_real_1_2` es una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers) y el framework LeRobot de Hugging Face. No se trata de un modelo de lenguaje, sino de un controlador visomotor que aprende a partir de demostraciones teleoperadas para ejecutar una tarea concreta de manipulación: "put the yellow cube on the blue cube" (colocar el cubo amarillo sobre el cubo azul).

La política consume el estado articular del robot (7 dimensiones) junto con dos flujos de imagen de cámara a 720x1280 píxeles, y produce un vector de acción de 7 dimensiones. El modelo tiene 51.670.663 parámetros (aproximadamente 51,7 millones) y ocupa 0,2 GB en el repositorio, lo que lo sitúa en el rango de políticas robóticas ligeras que pueden ejecutarse en hardware de consumo.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, despliegue e intercambio de políticas robóticas en abierto. Su licencia Apache 2.0 y el uso de safetensors como formato de pesos facilitan su reutilización y su integración en pipelines de robótica real. El modelo se entrenó sobre 39 episodios (25.037 fotogramas a 30 FPS) de un robot tipo `my_parol6`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con backbones visuales, sobre LeRobot |
| Parametros totales | 51.670.663 (aproximadamente 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; usa ventana de observacion temporal de la politica ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (politica robotica; las instrucciones de tarea se fijan como cadena de texto en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `my_parol6` |
| Camaras | `cam_1`, `cam_2` |
| Entrada de estado | `observation.state`, forma `(7,)` |
| Entradas visuales | `observation.images.cam_1` y `observation.images.cam_2`, forma `(3, 720, 1280)` |
| Salida | `action`, forma `(7,)` |
| Tamano del repositorio | 0,2 GB |
| Descargas | 11 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice trozos ("chunks") de acciones de corto horizonte en lugar de un unico paso, lo que reduce el error de acumulacion y favorece la estabilidad temporal en tareas de manipulacion fina. La arquitectura combina un codificador visual para cada flujo de camara, un codificador de estado articular y un transformer encoder-decoder que genera la secuencia de acciones. El modelo sigue la referencia del articulo arXiv:2304.13705 y se ha entrenado y publicado con LeRobot.

El entrenamiento se realizo sobre el conjunto de datos `RoboCrafty/parol6_sim_stack_real_1`, compuesto por 39 episodios y 25.037 fotogramas capturados a 30 FPS, con una unica tarea: "put the yellow cube on the blue cube". La configuracion de entrenamiento registrada incluye 80.000 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y la version 0.6.1 de LeRobot. No se documenta en la informacion disponible si se aplicaron fases de RLHF, DPO u otras tecnicas de ajuste adicionales; ACT es un metodo de aprendizaje supervisado por imitacion.

Como innovacion destacable, Action Chunking predice multiples acciones por inferencia, lo que amortigua el efecto de datos de demostracion ruidosos y mejora la consistencia de la trayectoria. El modelo usa dos camaras a resolucion 720x1280, lo que aporta informacion espacial suficiente para tareas de apilado, aunque incrementa el coste de procesamiento visual en inferencia.

## Capacidades

- Control visomotor de robot: genera comandos de accion de 7 grados de libertad a partir del estado articular y de dos vistas de camara.
- Apilado de objetos: entrenado especificamente para colocar un cubo amarillo sobre un cubo azul.
- Aprendizaje por imitacion de demostraciones teleoperadas, sin necesidad de recompensas explicitas.
- Prediccion de chunks de acciones, lo que permite ejecutar trayectorias mas suaves y estables.
- Integracion con el ecosistema LeRobot para despliegue y entrenamiento mediante comandos `lerobot-rollout` y `lerobot-train`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica; la politica ACT no razona en lenguaje, aunque la prediccion por chunks introduce un horizonte temporal corto.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no dispone de modo "thinking", vision generativa, audio ni funciones fuera del control robótico. La observacion visual es de entrada, no de salida.

## Casos de uso

- Manipulacion robotica de apilado: la politica ejecuta la tarea "poner el cubo amarillo sobre el cubo azul" en un robot `my_parol6` equipado con dos camaras, util como referencia reproducible en laboratorios de robotica.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para comparar ACT frente a otros metodos (Diffusion Policy, VLA) en tareas de apilado con pocos episodios (39).
- Docencia y prototipado con LeRobot: al estar integrada en LeRobot y tener 51,7 M de parametros, es adecuada para demostraciones de flujo completo (grabacion de datos, entrenamiento, rollout) en cursos de robotica.
- Base para fine-tuning con nuevos objetos o posiciones: se puede reentrenar con `lerobot-train` sobre un dataset propio para ampliar la tarea (por ejemplo, apilar cubos de otros colores).
- Validacion de hardware de bajo coste: el uso de un robot `my_parol6` con camaras OpenCV permite validar una configuracion economica de percepcion y control.
- Benchmark interno de politicas: al ser un modelo pequeno y con licencia Apache 2.0, sirve como linea base de exito/fracaso en pipelines de evaluacion de politicas robóticas.
- Automatizacion de tareas de pick-and-place simples en entornos controlados, siempre que la distribucion de objetos y la iluminacion se mantengan cercanas a las del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que todavia no se han proporcionado resultados de evaluacion ("No evaluation results have been provided for this policy yet."). No se dispone de tasas de exito, numero de ensayos ni metricas reales de robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parametros, una estimacion orientativa en precision FP32 ronda los 0,2-0,5 GB de pesos, incrementandose por los backbones visuales y las activaciones de imagenes a 720x1280 (puede requerir varios GB segun resolucion y lote).
- GPU recomendadas: no disponibles en la model card; por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para inferencia en FP16/FP32, aunque no hay cifras confirmadas.
- Compatibilidad con GPU de consumo: previsiblemente cabe en GPUs de consumo recientes (por ejemplo, series RTX 30/40) dada la baja cuenta de parametros, aunque no esta confirmado por el autor.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a politicas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de metricas comparables de este modelo frente a alternativas. A continuacion se comparan caracteristicas conocidas de categorias metodologicas relacionadas, marcando como "no disponible" todo dato no confirmado.

| Modelo / metodo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboCrafty/act_parol6_real_1_2 | ACT (LeRobot) | 51,7 M | 2 camaras 720x1280 + estado 7D | Apache 2.0 | Hugging Face (11 descargas) |
| Diffusion Policy | politica por difusion | no disponible | no disponible | no disponible | depende de la implementacion |
| OpenVLA (ejemplo de VLA) | vision-language-action | no disponible | no disponible | no disponible | depende de la version |
| Otras politicas ACT de LeRobot | ACT | variable | variable | variable | Hugging Face Hub |

No se dispone de datos suficientes para establecer una comparacion cuantitativa rigurosa. Se recomienda consultar el Hub de LeRobot para localizar politicas ACT comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publicada. Al entrenarse con 39 episodios de un unico escenario, la politica tiende a sobreajustarse a las posiciones, iluminacion y apariencia concretas de los objetos vistos en el entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje, pero si existe riesgo de acciones incorrectas o incoherentes cuando la escena se aleja de la distribucion de entrenamiento (nuevos objetos, oclusiones, cambios de iluminacion).
- Limitaciones de contexto o idioma: no aplica el concepto de contexto de lenguaje; la tarea esta fijada como cadena ("put the yellow cube on the blue cube") y el modelo no generaliza a instrucciones arbitrarias.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia correspondientes.
- Caveat de evaluacion: no se han publicado resultados de exito en robot real, por lo que no hay evidencia cuantitativa de su fiabilidad en produccion.
- Dependencia de hardware: requiere el robot `my_parol6` y dos camaras cuyos nombres e indices deben coincidir exactamente con las claves de observacion del entrenamiento (`cam_1`, `cam_2`).
- Numero de descargas y visibilidad muy bajos (11 descargas, 0 likes), lo que sugiere poca validacion externa por parte de la comunidad.
- Fecha del modelo: creado y actualizado en 2026-10-08 segun los metadatos proporcionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/act_parol6_real_1_2
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/parol6_sim_stack_real_1
- Visualizacion del dataset en LeRobot Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/parol6_sim_stack_real_1
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
