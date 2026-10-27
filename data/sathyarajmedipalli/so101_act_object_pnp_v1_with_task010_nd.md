# SathyarajMedipalli/so101_act_object_pnp_v1_with_task010_ND

## Resumen

`so101_act_object_pnp_v1_with_task010_ND` es una política de imitación para robótica real entrenada con el método **ACT (Action Chunking with Transformers)** y publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular de un robot SO-101 (`so_follower`, vector de 6 dimensiones) y de dos cámaras RGB de 480×640 (una en la pinza, `gripper_camera`, y otra de vista general, `overview_camera`), predice directamente un vector de acción de 6 dimensiones. Su única tarea declarada es «Pickup object» (recoger un objeto).

El modelo lo desarrolla el usuario SathyarajMedipalli y se apoya en la implementación de referencia de ACT incluida en LeRobot. El checkpoint tiene 51.668.614 parámetros (~51,7 M) y un tamaño de repositorio de 0,2 GB en safetensors, por lo que es un modelo muy ligero, pensado para ejecutarse en el bucle de control de un robot de sobremesa a 30 FPS, no para servirse en un clúster.

Su relevancia es la de un artefacto de referencia reproducible: documenta de forma completa el pipeline (dataset de 10 episodios y 2688 fotogramas, 5000 pasos de entrenamiento, AdamW, learning rate 1e-5, batch 32, semilla 1000, LeRobot 0.6.2) y permite replicar el flujo de entrenamiento y despliegue de ACT sobre hardware SO-101. Conviene subrayar que no se ha publicado ninguna evaluación en robot real, de modo que debe tratarse como una política experimental y no como un sistema validado en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE, respaldos visuales tipo ResNet y predicción de *chunks* de acciones |
| Parámetros totales | 51.668.614 (~51,7 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Cada inferencia consume una observación (estado 6-D + 2 imágenes 3×480×640) y emite un *chunk* de acciones |
| Tipos de cuantización | No documentados por el autor; el repo solo publica safetensors, sin variantes GGUF, ONNX ni precisiones alternativas declaradas |
| Idiomas soportados | No aplica: la política no procesa lenguaje natural. La cadena de tarea («Pickup object») es una etiqueta heredada del dataset y no condiciona la acción |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de checkpoint de LeRobot); repositorio de 0,2 GB |

Entradas y salidas declaradas en la model card:

| Dirección | Feature | Tipo | Shape |
|---|---|---|---|
| Entrada | `observation.state` | STATE | `(6,)` |
| Entrada | `observation.images.gripper_camera` | VISUAL | `(3, 480, 640)` |
| Entrada | `observation.images.overview_camera` | VISUAL | `(3, 480, 640)` |
| Salida | `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación propuesto en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). En lugar de predecir una acción por paso, el modelo estima un *chunk* de acciones futuras a partir de la observación actual (imágenes codificadas mediante respaldos convolucionales y estado propioceptivo), lo que reduce el error de acumulación típico del *behavior cloning* paso a paso y estabiliza el control. La variante implementada en LeRobot añade un cuello variational (CVAE) sobre el token CLS durante el entrenamiento, de forma que el modelo aprende una distribución de estilos de ejecución en lugar de una única trayectoria determinista; en inferencia se usa el prior (media cero), por lo que el coste adicional desaparece. La model card no detalla el tamaño del *chunk*, la profundidad del transformer ni el número de cabezas de atención, de modo que esos hiperparámetros concretos deben consultarse en el checkpoint (`config.json`) del repositorio.

El entrenamiento se realizó íntegramente con el dataset `SathyarajMedipalli/Task_001_object_pickup_ND_50ep_20261027_031504`: 10 episodios, 2688 fotogramas a 30 FPS, una única tarea («Pickup object»), teleoperados sobre un SO-101 con dos cámaras. La configuración declarada es de 5000 pasos con batch de 32, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. No se menciona aumento de datos, mezcla de datasets, ni fases de RLHF/DPO (no aplicables en este paradigma). El volumen de datos es muy reducido: con 2688 fotogramas y 5000 pasos × 32 muestras, el modelo ve del orden de 160 000 muestras, es decir, aproximadamente 60 pasadas sobre el dataset, lo que sitúa el riesgo de sobreajuste como principal preocupación técnica.

## Capacidades

- Manipulación visomotora de una sola tarea: recogida de objetos («Pickup object») con un robot SO-101 (`so_follower`), emitiendo acciones de 6 grados de libertad.
- Predicción de *chunks* de acciones, que amortigua el coste de inferencia y suaviza la ejecución frente al control paso a paso.
- Fusión de dos vistas de cámara (pinza y vista general) con el estado propioceptivo de 6 dimensiones.
- Control reactivo a 30 FPS: el dataset y la configuración de cámaras están alineados con ese régimen de captura.
- Ejecución mediante `lerobot-rollout` con la estrategia `base`, sin grabación de episodios, o con grabación si se cambia de estrategia.
- No soporta *tool calling*, ni razonamiento multi-paso, ni agentes, ni generación de texto, código, matemáticas, visión general o audio. No hay modo *thinking* ni capacidades multimodales fuera del par de cámaras especificado.

## Casos de uso

- **Validación de un pipeline completo de imitación sobre SO-101**: sirve como referencia reproducible de extremo a extremo (grabación → entrenamiento con `lerobot-train` → despliegue con `lerobot-rollout`) para equipos que montan por primera vez un robot de bajo coste y quieren comprobar que la cadena de calibración, cámaras y FPS es correcta antes de invertir en más datos.
- **Línea base para comparar métodos**: al ser un ACT de 51,7 M de parámetros con configuración documentada (5000 pasos, lr 1e-5, batch 32), permite medir la mejora de Diffusion Policy, SmolVLA u otras políticas sobre el mismo dataset y el mismo robot.
- **Docencia y laboratorio**: práctica guiada de *behavior cloning* con un dataset pequeño (10 episodios, 2688 fotogramas) donde el alumnado puede entrenar en una GPU de consumo y observar el efecto del sobreajuste y de la variación de iluminación.
- **Prueba de concepto de pick-and-place en línea de montaje didáctica**: la política puede recoger objetos en posiciones próximas a las vistas en entrenamiento; es adecuada para demostraciones controladas, no para celdas productivas sin validación adicional.
- **Recolecta de datos incrementales**: usar esta política como punto de partida y añadir episodios con nuevas posiciones, objetos o iluminación, comparando la tasa de éxito antes y después del reentrenamiento para cuantificar la ganancia de datos.
- **Verificación de infrastructure de inferencia**: medir latencia real de un modelo de 51,7 M de parámetros con dos cámaras a 480×640 en Jetson, Raspberry Pi o GPU de consumo, y decidir si el hardware cumple el presupuesto de 33 ms por paso del bucle a 30 FPS.
- **Generación de datos sintéticos de evaluación**: al ser determinista en inferencia (se usa el prior del CVAE), es útil para reproducir trayectorias y analizar sensibilidad del control ante perturbaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía («No evaluation results have been provided for this policy yet»), sin tabla de ensayos, éxitos ni tasas de acierto en robot real. Tampoco se reportan métricas del dataset de entrenamiento (pérdida final, error de acción) ni comparaciones con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB. Los pesos en fp32 ocupan ~207 MB (51,7 M × 4 bytes); en fp16, ~103 MB. Los tensores de activación de dos imágenes 3×480×640 y un *chunk* de acciones son despreciables frente a los pesos.
- **GPU recomendadas**: cualquier GPU con ≥2 GB de VRAM sirve. Una RTX 4090 o A100 están sobredimensionadas para inferencia, aunque aceleran el reentrenamiento. Para despliegue embebido son razonables Jetson Orin Nano, Jetson Orin NX o incluso CPU de escritorio.
- **GPU de consumo**: cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y similares. En CPU (x86 moderno) la inferencia por paso es viable, aunque el cuello de botella real será la captura y decodificación de dos flujos de cámara a 30 FPS.
- **Opciones de despliegue**: `lerobot-rollout` (PyTorch) es la vía documentada; el ecosistema LeRobot permite exportación a otros runtimes, pero el autor no publica artefactos ONNX, TensorRT ni GGUF, por lo que cualquier optimización requiere conversión propia.
- **Latencia y throughput**: no disponibles. El presupuesto de control implícito es de 33 ms por paso (30 FPS); la predicción por *chunks* reduce el número de pasadas del transformer por segundo, pero no se han publicado mediciones.
- **Periféricos**: dos cámaras USB/OpenCV configuradas a 640×480 y 30 FPS, más el puerto serie del `so_follower`. Los nombres de cámara deben coincidir exactamente con `gripper_camera` y `overview_camera`.

## Comparativa con modelos similares

Cifras orientativas de conocimiento general del ecosistema LeRobot; no verificadas en la información proporcionada y sujetas a variación según checkpoint.

| Modelo | Enfoque | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, SO-101) | Imitación con *action chunking* + CVAE | 51,7 M | Estado 6-D + 2 cámaras 480×640 | apache-2.0 | Hugging Face, vía LeRobot |
| ACT de referencia (LeRobot) | Mismo método, distinto dataset/robot | Depende de la configuración | Estado + cámaras | apache-2.0 (implementación) | Hugging Face, vía LeRobot |
| Diffusion Policy (LeRobot) | Política de difusión sobre acciones | No disponible | Estado + cámaras | apache-2.0 (implementación) | Hugging Face, vía LeRobot |
| SmolVLA (LeRobot) | VLA ligera, condicionada por lenguaje | ~450 M | Estado + cámaras + instrucción textual | apache-2.0 | Hugging Face |

Diferencias clave frente a las alternativas: este checkpoint es el más pequeño de la comparativa y el único de la lista con una única tarea y 10 episodios de entrenamiento; no acepta instrucciones en lenguaje natural (SmolVLA sí), y no dispone de evaluación publicada que permita situarlo frente a Diffusion Policy o SmolVLA en tasa de éxito.

## Limitaciones y advertencias

- **Sobreajuste probable**: 10 episodios y 2688 fotogramas para 51,7 M de parámetros y ~5000 pasos con batch 32. La política memorizará posiciones, fondos e iluminación del set de grabación.
- **Sin evaluación publicada**: no hay tasa de éxito ni número de ensayos. No debe asumirse ningún nivel de fiabilidad en robot real.
- **Una sola tarea y una sola encarnación**: entrenada para «Pickup object» sobre `so_follower`. No generaliza a otras tareas, objetos ni brazos sin reentrenamiento.
- **Dependencia del montaje de cámaras**: los nombres, la resolución (480×640), el FPS (30) y la pose de `gripper_camera` y `overview_camera` deben replicarse; un cambio de encuadre invalida la política.
- **Ausencia de *grounding* lingüístico**: la cadena «Pickup object» es una etiqueta del dataset, no una condición del modelo; no se puede reorientar la tarea con un prompt.
- **Riesgo de alucinación equivalente**: en robótica se traduce en acciones plausibles pero incorrectas (colisiones, agarres fallidos) sin señal de incertidumbre calibrada. El uso del prior del CVAE en inferencia elimina la diversidad estocástica, lo que puede enmascarar la multimodalidad aprendida.
- **Sesgos**: heredados del operador que teleoperó los 10 episodios (velocidad, estilo de agarre, posiciones preferidas) y del entorno de grabación.
- **Licencia**: el modelo es apache-2.0, lo que permite uso comercial con atribución y aviso de cambios. La licencia del dataset de entrenamiento no se declara en la información disponible y debe comprobarse por separado antes de un uso comercial.
- **Caveat de producción**: sin evaluación, con 10 episodios y sin mecanismos de seguridad, no es apto para entornos donde un fallo de agarre tenga consecuencias físicas o económicas. Requiere límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SathyarajMedipalli/so101_act_object_pnp_v1_with_task010_ND
- Dataset de entrenamiento: https://huggingface.co/datasets/SathyarajMedipalli/Task_001_object_pickup_ND_50ep_20261027_031504
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=SathyarajMedipalli/Task_001_object_pickup_ND_50ep_20261027_031504
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
