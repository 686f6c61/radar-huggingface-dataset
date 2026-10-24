# loopwatt/loopwatt_peg_act

## Resumen

`loopwatt/loopwatt_peg_act` es una política de manipulación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face Hub a través de la librería LeRobot. No es un modelo de lenguaje: es un modelo visomotor de aprendizaje por imitación que, a partir de dos cámaras RGB (`front` y `wrist`) y del estado articular de 6 dimensiones de un brazo `so_follower`, predice directamente una acción de 6 dimensiones para ejecutar la tarea "Pick up the peg and insert it into the hole" (coger una clavija e insertarla en el orificio).

El modelo tiene 51.598.982 parámetros (unos 51,6 M) en pesos safetensors, un tamaño de repositorio de 0,2 GB y licencia Apache 2.0. Se entrenó durante 50.000 pasos con batch de 32, optimizador AdamW y tasa de aprendizaje 1e-5 sobre un único dataset propio de 65 episodios y 33.887 fotogramas a 30 FPS. Es, por tanto, una política especializada de un solo task, no un modelo generalista.

Su relevancia es la habitual de las políticas ACT en LeRobot: reproducen una tarea de inserción de precisión con hardware de bajo coste y sirven como línea base reproducible para investigación en imitación y para comparar con métodos como Diffusion Policy. Conviene señalar que el autor no ha publicado resultados de evaluación en robot real y que el modelo acumula 0 descargas y 1 like en el momento de redactar esta ficha, por lo que su fiabilidad efectiva es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación con transformer encoder-decoder y componente CVAE, según el paper 2304.13705 |
| Parametros totales | 51.598.982 (51,6 M) |
| Longitud de contexto | No aplica en el sentido de LLM. La política consume la observación actual (estado de 6 dims + 2 imágenes de 3x480x640) y emite un chunk corto de acciones; el tamaño exacto del chunk no está documentado en la model card |
| Tipos de cuantizacion | No disponible. Solo se publican pesos safetensors; no se documentan variantes FP16, ONNX ni GGUF |
| Idiomas soportados | No disponible. La instrucción de tarea con la que se entrenó está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |

| Entrada / salida | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.front` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper 2304.13705 (*Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*). En lugar de predecir un único paso de acción, el modelo predice un chunk de acciones futuras, lo que reduce el error de compounding y suaviza la ejecución. La formulación del método combina un componente generativo tipo CVAE con un transformer encoder-decoder que integra las observaciones visuales y propioceptivas. La model card de este repositorio no detalla la configuración concreta de la política (backbone visual, número de capas, tamaño del chunk ni dimensión del latente CVAE), por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `loopwatt/loopwatt_peg_clean`: 65 episodios teleoperados, 33.887 fotogramas a 30 FPS (unas 521 muestras por episodio, aproximadamente 17 segundos de trayectoria por episodio) y una única instrucción de tarea en inglés. La configuración declarada es de 50.000 pasos con batch de 32 (1,6 millones de muestras de acción procesadas), optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta ningún proceso de RLHF, DPO ni ajuste por refuerzo, algo coherente con un pipeline estándar de imitación supervisada.

## Capacidades

- Manipulación visomotora de precisión: ejecuta la secuencia completa de coger una clavija e insertarla en un orificio, con control a 30 FPS.
- Política multi-cámara: fusiona dos flujos RGB de 480x640 (`front` y `wrist`), lo que aporta tanto contexto global de la escena como detalle fino de la pinza.
- Control de brazo de 6 grados de libertad: entrada de estado de 6 dimensiones y salida de acción de 6 dimensiones, compatible con el robot `so_follower` de LeRobot.
- Predicción por chunks de acción: genera varias acciones por inferencia, lo que mejora la estabilidad frente a políticas paso a paso.
- Condicionamiento por instrucción de tarea: acepta el texto de tarea en el pipeline de LeRobot, aunque el modelo solo se ha entrenado con la instrucción "Pick up the peg and insert it into the hole".
- Integración nativa con LeRobot: se ejecuta con `lerobot-rollout` y se puede reentrenar con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código ni matemáticas. Tampoco tiene capacidades de audio ni de visión general (no describe imágenes).

## Casos de uso

- Automatización de inserción peg-in-hole en una célula de montaje: la política está entrenada específicamente para alinear y insertar una clavija, una operación habitual en ensamblaje de precisión donde el control por trayectoria fija es frágil ante variaciones de posición.
- Prototipado de bajo coste con brazo SO-100/SO-101: al ejecutarse con el tipo de robot `so_follower` y dos cámaras USB estándar, permite validar una tarea de manipulación en un banco de laboratorio sin hardware industrial.
- Punto de partida para fine-tuning con datos propios: el checkpoint y la configuración de entrenamiento (50.000 pasos, batch 32, lr 1e-5) sirven como inicialización para tareas de inserción similares con el mismo robot y montaje de cámaras.
- Línea base reproducible en investigación de imitación: permite comparar ACT frente a otros métodos (Diffusion Policy, VLA ligeros) sobre el mismo dataset de 65 episodios y la misma métrica de tasa de éxito.
- Docencia y demostraciones de aprendizaje por imitación: el dataset es público y visualizable, y el flujo completo (grabar, entrenar, desplegar) se cubre con la documentación de LeRobot.
- Evaluación de robustez ante cambios de dominio: útil para medir la degradación de la política al variar iluminación, fondo, posición inicial de la clavija o ligeras diferencias de calibración entre robots del mismo modelo.
- Generación de datos de comparación para estudios de chunking: al predecir chunks de acción, permite analizar el efecto del tamaño de chunk en suavidad y tasa de éxito en tareas de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: *"No evaluation results have been provided for this policy yet"*. No existen datos de tasa de éxito en robot real, número de ensayos, ni comparaciones con otras políticas sobre el mismo dataset. Tampoco se han publicado métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 0,2 GB (51,6 M de parámetros). Sumando activaciones de dos imágenes de 3x480x640 y del transformer, una estimación prudente es de 2 a 4 GB de VRAM. Es una estimación, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente para inferencia. Una RTX 3060, RTX 4060 o RTX 4090 cubren el caso con holgura; para entrenamiento, el paper original de ACT utilizó una RTX 2080 Ti, y este entrenamiento de 50.000 pasos con batch 32 es asumible en una GPU de gama media.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida; la latencia sería el factor limitante, no la memoria.
- Despliegue: LeRobot mediante `lerobot-rollout` con `--strategy.type=base` y `--policy.path=loopwatt/loopwatt_peg_act`. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama; estas herramientas no son aplicables a una política de robótica de este tipo.
- Latencia y throughput: no publicados. El bucle de control está pensado para 30 FPS (33 ms por paso), pero no se especifica si la inferencia cumple ese presupuesto en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Observación / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loopwatt/loopwatt_peg_act` | 51,6 M | Estado 6 dims + 2 cámaras 480x640 | Peg-in-hole con `so_follower` | Apache 2.0 | Hub, 0 descargas |
| `hukewei/act_peg_in_optical` | No disponible | No disponible | Peg-in-hole con ACT | No disponible | Hub |
| ACT (referencia del paper 2304.13705) | No disponible en esta ficha | Bimanual, baja coste | Manipulación fina bimanual | No disponible | Paper y código de referencia |

No se dispone de datos de rendimiento (tasa de éxito, latencia) de ninguna de las alternativas, por lo que la comparación cuantitativa no es posible. Frente a políticas VLA generalistas, este modelo es dos o tres órdenes de magnitud más pequeño y solo cubre una tarea, a cambio de un coste de inferencia muy inferior y de no requerir un LLM en el bucle de control.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Sobreajuste probable al dataset: 65 episodios de una única tarea, un único montaje de cámaras y presumiblemente un rango estrecho de posiciones de la clavija.
- Alta sensibilidad al dominio: cambios de iluminación, fondo, posición de cámara, calibración del robot o un robot distinto del mismo modelo pueden degradar la política hasta el fallo.
- Dependencia estricta de los nombres de cámara: las claves de observación deben ser exactamente `front` y `wrist`; un nombre distinto rompe la inferencia.
- No es un modelo de lenguaje: no comprende instrucciones libres ni generaliza a otras tareas expresadas en texto. La instrucción de tarea es fija.
- No transferible a otras morfologías: la salida de 6 dimensiones está acoplada al robot `so_follower`.
- Riesgo de acciones erráticas fuera de distribución: al ser una política de imitación sin mecanismo explícito de seguridad, conviene operar con límites de par, parada de emergencia y espacio de trabajo despejado.
- El riesgo de alucinación en el sentido de LLM no aplica; el fallo típico es una trayectoria incorrecta o un bloqueo en el contacto.
- Licencia Apache 2.0 en el modelo, que permite uso comercial y modificación con atribución. La licencia del dataset `loopwatt/loopwatt_peg_clean` no se especifica en la información disponible y debe verificarse antes de un uso comercial.
- Madurez nula en la comunidad: 0 descargas y 1 like, sin issues ni validaciones de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loopwatt/loopwatt_peg_act
- Dataset de entrenamiento: https://huggingface.co/datasets/loopwatt/loopwatt_peg_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=loopwatt/loopwatt_peg_clean
- Paper de ACT: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Política ACT comparable en el Hub: https://huggingface.co/hukewei/act_peg_in_optical
