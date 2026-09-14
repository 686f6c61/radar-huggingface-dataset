# ngustj/smolvla_paper_cup_50ep_20k

## Resumen

ngustj/smolvla_paper_cup_50ep_20k es un checkpoint de robótica publicado por el usuario ngustj en HuggingFace, consistente en un ajuste fino de la política SmolVLA (vision-language-action) sobre el modelo base lerobot/smolvla_base. Se trata, por tanto, de un modelo de acción visuolingüística y no de un modelo de lenguaje generativo: recibe imágenes de cámara y el estado del robot, y emite directamente comandos de acción de 6 dimensiones para un brazo robótico de tipo seguir (so_follower). El checkpoint tiene 450.046.176 parámetros (~450 M) y un repositorio de 0,9 GB en formato safetensors.

El modelo ha sido entrenado mediante imitación (behavior cloning) sobre el conjunto de datos ngustj/paper_cup_pick_place, compuesto por 50 episodios y 27.579 fotogramas a 30 FPS, con una única tarea: "Pick up the paper cup and place it on the yellow sticky note" (coger el vaso de papel y colocarlo sobre la nota adhesiva amarilla). El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, con tamaño de lote 4, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000.

Su relevancia es fundamentalmente práctica: SmolVLA está diseñado para ser una política compacta y eficiente en coste computacional, desplegable en hardware de consumo, lo que abarata la experimentación en robótica de imitación. No obstante, este checkpoint concreto es un artefacto muy reciente y de alcance estrecho: no tiene descargas ni valoraciones, no publica resultados de evaluación y está especializado en una sola tarea con un solo tipo de robot, por lo que debe considerarse una base para transferencia o reproducción de experimentos más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política vision-language-action (VLA) compacta, heredada del modelo base lerobot/smolvla_base y descrita en el artículo SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no se documenta una arquitectura de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible (la model card no declara idiomas; la tarea se especifica en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot; tamaño del repositorio 0,9 GB) |

Datos adicionales relevantes: tipo de robot `so_follower`; cámaras declaradas como `top` y `wrist` en la sección de detalles del modelo, aunque la tabla de entradas define tres cámaras (`observation.images.camera1`, `camera2` y `camera3`), todas de forma `(3, 256, 256)`. Esta discrepancia debe verificarse antes del despliegue.

Entradas y salidas declaradas:

| Elemento | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (6,) |
| observation.images.camera1 | VISUAL | (3, 256, 256) |
| observation.images.camera2 | VISUAL | (3, 256, 256) |
| observation.images.camera3 | VISUAL | (3, 256, 256) |
| action | ACTION | (6,) |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolVLA, una política compacta de tipo vision-language-action que combina percepción visual, una instrucción en lenguaje natural y el estado propioceptivo del robot para producir acciones motoras. Según la model card, el objetivo de diseño es alcanzar un rendimiento competitivo con un coste computacional reducido y permitir el despliegue en hardware de consumo. Los detalles finos de la arquitectura (número de capas, mecanismo de atención, tamaño del codificador visual o del modelo de lenguaje interno) no se especifican en la información disponible para este checkpoint y deben consultarse en el artículo arXiv:2506.01844.

El entrenamiento es un ajuste fino por imitación supervisada sobre el modelo preentrenado lerobot/smolvla_base, usando el conjunto ngustj/paper_cup_pick_place: 50 episodios, 27.579 fotogramas, 30 FPS y una única tarea de pick-and-place. La configuración registrada es de 20.000 pasos, tamaño de lote 4, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.2, con dispositivo `cuda`. No se documenta ningún uso de RLHF, DPO u optimización por preferencias, ni innovaciones técnicas adicionales específicas de este ajuste fino. Tampoco se declara el número de tokens (o fotogramas) del preentrenamiento del modelo base ni la composición de su dataset.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad para un brazo `so_follower` a partir de observaciones visuales y de estado.
- Ejecución de una tarea concreta de pick-and-place: coger un vaso de papel y depositarlo sobre una nota adhesiva amarilla.
- Fusión de tres entradas visuales simultáneas (256x256) con el estado del robot (vector de 6 dimensiones).
- Condicionamiento por instrucción textual: la política recibe la tarea como cadena de texto ("Pick up the paper cup and place it on the yellow sticky note."), lo que en principio permite especificar la tarea en el momento de la inferencia.
- Inferencia en bucle cerrado: el script `lerobot-rollout` ejecuta la política de forma continua sobre el robot real, con duración configurable y sin grabación de episodios en la estrategia `base`.
- Reajuste posterior: al derivar de `lerobot/smolvla_base`, puede servir como punto de partida para nuevos ajustes finos con `lerobot-train` sobre otros conjuntos de datos.
- No soporta tool calling, function calling, uso como agente conversacional, modo de razonamiento explícito, audio, ni generación de texto libre; no es un modelo de lenguaje de propósito general.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Automatización de pick-and-place ligero en laboratorio: el modelo ejecuta la secuencia completa de coger un objeto y depositarlo en una posición marcada, con la instrucción textual como condición de tarea; es adecuado porque está entrenado específicamente para esa maniobra en un brazo `so_follower`.
- Punto de partida para ajuste fino con datos propios: partiendo de este checkpoint o del base, se puede reentrenar con `lerobot-train` sobre un dataset propio y cambiar de tarea, aprovechando que el pipeline completo está documentado y automatizado en LeRobot.
- Investigación en aprendizaje por imitación con presupuesto reducido: con ~450 M de parámetros y 0,9 GB de pesos, permite reproducir experimentos de VLA en una estación de trabajo con una única GPU, sin clúster.
- Docencia y formación en robótica: el flujo `lerobot-rollout` con `--strategy.type=base` y `--duration` permite demostrar en clase el ciclo completo de grabación de datos, entrenamiento y despliegue sobre hardware de bajo coste (SO-100/SO-101 y cámaras OpenCV).
- Evaluación comparativa de políticas VLA: sirve como referencia de política entrenada con 20.000 pasos sobre 50 episodios para comparar, en igualdad de condiciones de hardware, contra ACT, Diffusion Policy u otras políticas de LeRobot sobre la misma tarea.
- Pruebas de robustez en condiciones controladas: al estar entrenado con 50 episodios y tres vistas, permite medir experimentalmente la degradación ante cambios de iluminación, posición inicial del objeto o presencia de distractores, sin necesidad de reentrenar.
- Prototipado de estaciones de montaje o empaquetado de precisión reducida: tareas de recogida y colocación de piezas ligeras donde no se exija repetibilidad industrial, usando la instrucción textual para parametrizar la consigna.
- Banco de pruebas para integración de hardware: validación del cableado, calibración y sincronización de cámaras y brazo antes de escalar a políticas de mayor tamaño o a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no incluye tabla de tareas, número de ensayos ni tasas de éxito en robot real. Tampoco se proporcionan métricas de entrenamiento (pérdida final, curvas de aprendizaje) ni cifras de latencia o frecuencia de control alcanzada.

## Requisitos de hardware

- Memoria estimada para inferencia: con 450.046.176 parámetros, los pesos ocupan aproximadamente 1,8 GB en fp32 y 0,9 GB en fp16/bf16 (coincide con el tamaño de repositorio de 0,9 GB). A ello hay que sumar la memoria de activaciones de tres cámaras de 256x256 y el búfer del bucle de control; en la práctica, un presupuesto de 2-4 GB de VRAM es suficiente en fp16 para un lote de tamaño 1.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM resulta suficiente para la inferencia; se puede usar desde una GTX 1650/RTX 3050 hasta una RTX 4090, A100 o H100 sin que el modelo aproveche su capacidad. La configuración de entrenamiento documentada emplea `--policy.device=cuda`, con lote 4, lo que también cabe en GPU de gama media.
- Cabe en GPU de consumo: sí. Al tratarse de ~450 M de parámetros, es viable en tarjetas de gama de entrada y media; la model card afirma explícitamente que SmolVLA puede desplegarse en hardware de consumo. Para despliegue embebido, una Jetson Orin es una opción razonable por rango de memoria, aunque no se documenta oficialmente.
- Opciones de despliegue: herramientas de LeRobot, concretamente `lerobot-rollout` para inferencia en robot real y `lerobot-train` para reentrenamiento, sobre PyTorch. No se publican pesos GGUF ni soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una política VLA de este tipo.
- Latencia y throughput: no disponibles. No se publican cifras de frecuencia de control (Hz), tiempo de inferencia por paso ni rendimiento sostenido en ninguna GPU concreta.
- Requisitos de software y hardware adicionales: LeRobot 0.6.2 o compatible, un brazo `so_follower` con su puerto serie, y cámaras compatibles con OpenCV (el ejemplo usa 640x480 a 30 FPS), cuyos nombres deben coincidir con las claves de observación del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ngustj/smolvla_paper_cup_50ep_20k | 450.046.176 | No disponible | Pick-and-place de vaso de papel (ajuste fino) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| lerobot/smolvla_base | No disponible en la informacion | No disponible | Política VLA base, preentrenada y reajustable | No disponible en la informacion | HuggingFace (modelo base declarado) |
| Otras políticas de LeRobot (ACT, Diffusion Policy, pi0) | No disponible en la informacion | No disponible | Manipulación robótica por imitación | No disponible en la informacion | HuggingFace / repositorio LeRobot |

La única comparación documentada con datos es frente al modelo base: este checkpoint añade 20.000 pasos de ajuste fino sobre 50 episodios de una tarea concreta, manteniendo el mismo número de parámetros. No se dispone de cifras de rendimiento del base ni de alternativas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card no reporta ningún resultado en robot real (ni ensayos ni tasa de éxito), por lo que el rendimiento funcional de la política es desconocido.
- Conjunto de datos muy reducido: 50 episodios y 27.579 fotogramas para una sola tarea, lo que hace probable el sobreajuste y una generalización pobre a posiciones, iluminación u objetos distintos de los vistos en el entrenamiento.
- Especialización extrema: el modelo ejecuta una única consigna ("coger el vaso de papel y colocarlo sobre la nota amarilla") sobre un único tipo de robot (`so_follower`). No es un modelo de propósito general ni reutilizable directamente para otras tareas.
- Ambigüedad en la configuración de cámaras: la ficha declara `top` y `wrist` como cámaras, pero la tabla de entradas exige tres claves (`camera1`, `camera2`, `camera3`). Una discrepancia en los nombres o en el número de cámaras puede impedir la inferencia.
- Dependencia del entorno original: cambios en el robot, la calibración, la altura de las cámaras o la iluminación pueden degradar el comportamiento de forma no documentada.
- Sin datos de sesgo ni de seguridad: no hay análisis de sesgos, ni protocolos de parada segura, ni evaluación de riesgos en entornos con personas. El uso en espacios compartidos exige supervisión y medidas de seguridad externas.
- Idiomas no declarados: no se especifica qué lenguas admite la entrada de instrucción, más allá de la tarea en inglés usada en el entrenamiento.
- Licencia: apache-2.0 permite uso comercial del checkpoint, pero el usuario debe verificar las condiciones del modelo base `lerobot/smolvla_base` y del resto de componentes del ecosistema LeRobot, así como las licencias del conjunto de datos.
- Madurez y trazabilidad: 0 descargas, 0 likes y fechas de creación y actualización del 14 de septiembre de 2026, lo que indica un artefacto sin validación por parte de la comunidad; no se ha publicado informe de entrenamiento, curvas ni comparación con una línea base.
- Rendimiento en tiempo real desconocido: sin datos de latencia, no puede garantizarse que la política alcance la frecuencia de control necesaria para una tarea dinámica.
- Alucinación en el sentido generativo no aplica, pero sí el fallo silencioso: la política puede producir trayectorias plausibles pero incorrectas sin señal de error, lo que obliga a incluir comprobaciones externas de éxito de la tarea.
- Los resultados de la búsqueda web proporcionada no contienen información relevante sobre este modelo (enlaces a foros y páginas de soporte sin relación), por lo que no aportan contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngustj/smolvla_paper_cup_50ep_20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/ngustj/paper_cup_pick_place
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ngustj/paper_cup_pick_place
