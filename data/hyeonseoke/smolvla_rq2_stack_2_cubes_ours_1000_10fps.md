# HyeonseokE/smolvla_rq2_stack_2_cubes_ours_1000_10fps

## Resumen

El modelo `HyeonseokE/smolvla_rq2_stack_2_cubes_ours_1000_10fps` es una política robótica de tipo visión-lenguaje-acción (VLA) publicada por el usuario HyeonseokE. Se trata de un ajuste fino del modelo base `lerobot/smolvla_base` realizado con LeRobot, la librería de Hugging Face para aprendizaje por imitación. Su único cometido declarado es ejecutar la tarea "Stack the green block on the red block." sobre un brazo robótico SO-101 (tipo de robot `so101_follower`), con dos cámaras declaradas (`top`, `left_wrist`) y tres entradas visuales en la especificación de entradas.

Con 450.046.176 parámetros (aproximadamente 450 M) y un repositorio de 0,9 GB, es un modelo deliberadamente compacto: la ficha del autor lo describe como un VLA eficiente que "alcanza rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo". Está entrenado únicamente sobre 100 episodios y 36.495 fotogramas a 10 FPS de demostraciones, lo que lo sitúa en la categoría de políticas especializadas de una sola tarea y un solo embodiment, no de modelo generalista.

Su relevancia actual es doble: por un lado, sirve como ejemplo reproducible de ajuste fino de bajo coste de un VLA con LeRobot 0.6.0 (28.500 pasos, batch 64, AdamW, learning rate 1e-4, semilla 1000); por otro, es un caso típico de los repositorios de políticas robóticas publicadas sin evaluación real en robot, con licencia Apache 2.0 y 0 descargas en el momento de la consulta. No se han publicado resultados de benchmarks ni tasas de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA); detalle interno de capas no disponible en la información proporcionada (referencia: arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~450 M), dato real de los pesos safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones precalculadas; pesos distribuidos en safetensors (repositorio de 0,9 GB) |
| Idiomas soportados | No disponible; la instrucción de tarea del dataset está en inglés ("Stack the green block on the red block.") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales de la ficha: pipeline `robotics`, tipo de robot `so101_follower`, cámaras declaradas `top` y `left_wrist`, modelo base `lerobot/smolvla_base`, repositorio de 0,9 GB, creado y actualizado el 16 de septiembre de 2026 según el Hub.

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá de su naturaleza VLA (entrada visual y de estado, salida de acciones). La model card remite al artículo SmolVLA (arXiv:2506.01844) para la descripción del método. Lo que sí está documentado es la interfaz de entrada y salida: el modelo consume `observation.state` con forma `(6,)` y tres entradas visuales `observation.images.camera1`, `camera2` y `camera3` de forma `(3, 256, 256)` cada una, y produce una acción `action` de forma `(6,)` más una salida `action.radian_urdf0` también de forma `(6,)`. Es decir, se trata de un controlador de 6 grados de libertad guiado por imágenes y estado articular.

El entrenamiento es un ajuste fino supervisado por imitación (behavior cloning) sobre el dataset `HyeonseokE/rq2_stack_2_cubes_ours_100_10fps`: 100 episodios, 36.495 fotogramas a 10 FPS (aproximadamente 61 minutos de demostraciones), una única tarea. La configuración declarada es de 28.500 pasos de entrenamiento, tamaño de lote 64, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.0. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación posterior; tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni la composición exacta del dataset de preentrenamiento del modelo base.

## Capacidades

- Generación de acciones de control de 6 grados de libertad a partir de observaciones visuales (tres cámaras de 256x256) y del estado articular del robot (vector de 6 dimensiones).
- Ejecución de una tarea de manipulación concreta: apilar el bloque verde sobre el bloque rojo ("Stack the green block on the red block.").
- Seguimiento de instrucción en lenguaje natural a nivel de tarea, aunque entrenada para un único enunciado en inglés.
- Aprendizaje por imitación: reproduce habilidades aprendidas de demostraciones humanas de teleoperación o kinestesia recogidas en el dataset asociado.
- Integración nativa con el ecosistema LeRobot (comandos `lerobot-train` y `lerobot-rollout`).
- No dispone de tool calling ni function calling.
- No está diseñada para razonamiento multi-paso simbólico ni para uso como agente conversacional.
- No genera texto libre, no es un modelo de lenguaje de propósito general y no se documentan capacidades de audio.
- No se documentan capacidades multilingües; la única instrucción registrada está en inglés.
- No se documenta un modo de razonamiento explícito (thinking mode) ni variantes de visión general más allá de las tres cámaras de control.

## Casos de uso

- Automatización de apilado de bloques en laboratorio: la política ejecuta directamente la tarea de apilar el bloque verde sobre el rojo en un brazo SO-101, con lo que sirve para validar cadencias de manipulación sin escribir un controlador analítico específico.
- Reproducción de experimentos de aprendizaje por imitación: el repositorio incluye dataset, configuración de entrenamiento (28.500 pasos, batch 64, semilla 1000) e hiperparámetros, lo que permite reproducir o ablar el efecto de cada variable sobre el resultado final.
- Punto de partida para ajuste fino de nuevas tareas: al derivar de `lerobot/smolvla_base`, se puede reentrenar con `lerobot-train` sobre un dataset propio de otra tarea de manipulación con el mismo robot, aprovechando que el coste de cómputo de un modelo de ~450 M es bajo.
- Banco de pruebas de hardware robótico de bajo coste: al ser un modelo compacto (0,9 GB de pesos) y desplegarse vía LeRobot, encaja en plataformas con GPU de gama media o incluso CPU para validar el lazo completo percepción-acción antes de invertir en modelos mayores.
- Docencia y formación en robótica: el flujo `lerobot-rollout` con `--strategy.type=base` permite demostrar en clase un lazo completo de política VLA sobre robot real, desde la calibración de cámaras hasta la ejecución de la tarea.
- Investigación comparativa de políticas VLA: sirve como referencia especializada de una sola tarea frente a políticas generalistas, para medir la pérdida de generalidad frente a la ganancia en especialización cuando el dataset es pequeño (100 episodios).
- Recolección de datos asistida: ejecutar la política en modo rollout sin grabación permite generar trayectorias iniciales sobre las que después anotar éxito o fracaso, ampliando el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni número de ensayos, ni comparación con otras políticas sobre la misma tarea.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros (450 M) y del tamaño del repositorio (0,9 GB); no están publicadas por el autor.

| Precisión | Peso aproximado de los pesos | VRAM orientativa en inferencia (estimada) |
|---|---|---|
| FP32 | ~1,8 GB | ~4-6 GB con activaciones de tres cámaras 256x256 |
| BF16 / FP16 | ~0,9 GB | ~3-5 GB |
| INT8 | ~0,45 GB | ~2-4 GB |
| 4 bits | ~0,25 GB | ~2-3 GB |

- Cabe en GPU de consumo: sí, con holgura en una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o similares; la ficha del autor afirma que el modelo está pensado para hardware de consumo.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenar con lotes grandes.
- Ejecución en CPU: plausible por tamaño, aunque no se documenta latencia ni viabilidad en tiempo real.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) y la pila de LeRobot 0.6.0 sobre PyTorch. vLLM, TGI, llama.cpp u Ollama no son aplicables, ya que no es un modelo de lenguaje sino una política de control.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia de los datos de entrenamiento, 10 FPS, y que la cámara se configura a 30 FPS en el ejemplo de rollout.

## Comparativa con modelos similares

La información disponible no incluye especificaciones de modelos alternativos, por lo que la comparación se limita a lo que se puede afirmar con los datos aportados.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_rq2_stack_2_cubes_ours_1000_10fps` | 450.046.176 | No disponible | Apilar dos bloques en SO-101 | apache-2.0 | Hub de Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` (modelo base) | No disponible en la información aportada | No disponible | Política VLA generalista de partida | No disponible en la información aportada | Hub de Hugging Face |
| Otras políticas de LeRobot (ACT, Diffusion Policy) | No disponibles | No disponibles | Manipulación por imitación | No disponible | Disponibles en el ecosistema LeRobot, sin datos comparativos aportados |

No se dispone de datos de rendimiento de ninguno de los tres, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay ensayos en robot real ni tasas de éxito, de modo que no puede afirmarse que la política funcione de forma fiable ni siquiera en la tarea para la que fue entrenada.
- Especialización extrema: una sola tarea ("Stack the green block on the red block.") y un solo tipo de robot (`so101_follower`). No generaliza a otras tareas, objetos ni morfologías.
- Dataset muy pequeño: 100 episodios y 36.495 fotogramas (~61 minutos a 10 FPS). El riesgo de sobreajuste a posiciones, iluminación y disposición concretas de los objetos es alto.
- Inconsistencia en la configuración de cámaras: la ficha declara dos cámaras (`top`, `left_wrist`) mientras que la tabla de entradas define tres (`observation.images.camera1`, `camera2`, `camera3`). Cualquier despliegue debe verificar los nombres exactos de las claves de observación.
- Posible discrepancia en la nomenclatura del dataset: el identificador del modelo menciona "1000" y la etiqueta del dataset referenciado es `..._ours_100_10fps`, con 100 episodios. No se ha podido verificar cuál es el conjunto realmente usado.
- Sin datos sobre sesgos: no se documenta la procedencia de las demostraciones, el operador, ni la distribución de posiciones iniciales, por lo que no se puede evaluar el sesgo de la política.
- Riesgo de alucinación en sentido operativo: al ser una política de imitación sin verificación, puede generar acciones plausibles pero incorrectas (colisiones, agarres fallidos) sin señal de incertidumbre explícita.
- Sin soporte multilingüe ni de lenguaje general: la instrucción está fijada en inglés y el modelo no debe emplearse como generador de texto.
- Requisitos de seguridad: cualquier despliegue en hardware físico debe incorporar paradas de emergencia y límites de par independientes del modelo.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia; conviene revisar también las condiciones del modelo base `lerobot/smolvla_base` y del dataset asociado.
- Fechas del Hub: la creación y la última actualización figuran como 16 de septiembre de 2026, dato no verificable con la información disponible.
- Cero adopción registrada: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de uso o validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_rq2_stack_2_cubes_ours_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_stack_2_cubes_ours_100_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_stack_2_cubes_ours_100_10fps
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Tutorial de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a contenidos no relacionados (preguntas frecuentes sobre préstamo bibliotecario en alemán) y se han descartado.
