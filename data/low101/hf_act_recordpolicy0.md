# Low101/hf_act_recordpolicy0

## Resumen

`Low101/hf_act_recordpolicy0` es una política robótica de imitación entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular de un brazo robótico y dos flujos de cámara, y produce directamente comandos de acción de 6 dimensiones. El repositorio pertenece al usuario Low101 y se publicó el 15 de octubre de 2026 con 0 descargas y 0 likes, por lo que se trata de un experimento reciente y sin validación comunitaria.

El modelo tiene 51.668.614 parámetros según el recuento real de los pesos en safetensors, y el repositorio ocupa 0,2 GB. Está especializado en una única tarea: "pick the green cube and place into a bin" (coger el cubo verde y depositarlo en un contenedor), aprendida a partir de 50 episodios de teleoperación y 32.589 fotogramas grabados a 30 FPS. El robot objetivo es un `so_follower` (el brazo seguidor del kit SO-101) con dos cámaras, una en la muñeca y otra frontal.

Su relevancia es la de un ejemplo reproducible extremo a extremo del flujo de trabajo de LeRobot: grabar con teleoperación, entrenar una política ACT y desplegarla con `lerobot-rollout`. Sirve como plantilla y como referencia de bajo coste para quien quiera montar aprendizaje por imitación en hardware asequible, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora; transformers sobre características de estado e imagen |
| Parametros totales | 51.668.614 (dato real de los pesos en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de un LLM. El horizonte de predicción corresponde al "action chunk" de ACT, cuyo tamaño no se especifica en la model card |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene el checkpoint original. No se publican variantes GGUF, int8 ni int4 |
| Idiomas soportados | no disponible; no es un modelo de lenguaje. Las instrucciones de tarea se pasan como cadena de texto fija ("task") y no hay evaluación multilingüe |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (etiqueta del repositorio); librería `lerobot`, tamaño del repo 0,2 GB |
| Tipo de robot | `so_follower` (SO-101, brazo seguidor) |
| Camaras | `wrist`, `front`, ambas a 480x640x3 |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de control del dataset | 30 FPS |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (chunks) en lugar de un único paso, lo que reduce el problema de acumulación de error típico de las políticas reactivas paso a paso. La model card describe el método y enlaza al artículo arXiv:2304.13705, pero no detalla la configuración concreta de esta instancia: no se especifica el backbone visual, el tamaño del chunk de acciones, el uso de ensamblado temporal (temporal ensembling) ni la dimensión de la latente del CVAE. Estos datos deben considerarse "no disponibles" para este repositorio en concreto.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Low101/lerobot-so101-first-act_20261015_205345`, compuesto por 50 episodios y 32.589 fotogramas a 30 FPS de la tarea "pick the green cube and place into a bin". La configuración registrada es de 20.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se documenta ninguna fase de RLHF, DPO ni aprendizaje por refuerzo: es aprendizaje supervisado puro sobre trayectorias teleoperadas. Tampoco se documentan aumentos de datos, mezcla de datasets ni innovaciones técnicas adicionales sobre el método ACT original.

## Capacidades

- Control visuomotor de un brazo SO-101 (`so_follower`) con 6 grados de libertad de acción a partir de dos vistas de cámara y el estado articular.
- Ejecución de una tarea de pick-and-place concreta y única: coger un cubo verde y dejarlo en un contenedor.
- Generación de chunks de acción, lo que permite movimientos más suaves y coherentes que una política de paso único (según la descripción del método en la model card).
- Consumo de observaciones multimodales: estado propioceptivo (`observation.state`, 6 valores) más dos imágenes RGB de 480x640.
- Integración con la pila de inferencia y evaluación de LeRobot mediante `lerobot-rollout` y `--policy.path`.
- Personalización mediante reentrenamiento o ajuste fino con `lerobot-train --policy.type=act` sobre datasets propios.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades de agente, modo "thinking", visión general, audio ni generación de texto. No es un modelo fundacional y no generaliza a tareas distintas de la entrenada.

## Casos de uso

- Recogida y clasificación de objetos pequeños en un banco de laboratorio: la política ejecuta el ciclo coger-cubo-depositar en un contenedor, útil como demostración funcional de un pipeline de imitación completo sobre hardware SO-101 de bajo coste.
- Prototipo de celda de pick-and-place en logística ligera: con 50 episodios y 32.589 fotogramas de entrenamiento, sirve para medir si el enfoque es viable antes de invertir en más datos y en un robot industrial.
- Punto de partida para ajuste fino: al ser un checkpoint ACT compatible con `lerobot-train`, se puede reentrenar con nuevos datasets y tareas sin partir de cero, reutilizando los backbones visuales ya ajustados a este montaje de cámaras.
- Evaluación comparativa de métodos de imitación: permite contrastar ACT frente a otras políticas disponibles en LeRobot (por ejemplo, Diffusion Policy) sobre el mismo dataset y el mismo robot, aunque esta ficha no aporta resultados de esa comparación.
- Docencia e investigación en robótica de bajo coste: el par dataset + política + comandos de rollout documenta el ciclo completo teleoperación-entrenamiento-despliegue para cursos y prácticas.
- Validación de infraestructura de inferencia en robot real: sirve para comprobar latencias, calibración de cámaras y estabilidad del bucle de control a 30 FPS antes de escalar a modelos mayores (VLA).
- Generación de datos de evaluación: ejecutar la política con `--strategy.type=base` permite grabar nuevos episodios que después se usan como referencia o como datos de corrección.
- Demostraciones reproducibles para terceros: el comando de rollout documentado y el dataset público permiten que otra persona replique el experimento con el mismo hardware y las mismas cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", y deja la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) sin rellenar. No existen, por tanto, datos de tasa de éxito, MMLU, HumanEval, GSM8K ni ninguna otra métrica aplicable.

## Requisitos de hardware

- Pesos en precisión original (FP32): 51.668.614 parámetros x 4 bytes ≈ 207 MB. En FP16/BF16 ≈ 103 MB; en int8 ≈ 52 MB. Son cifras calculadas a partir del recuento de parámetros, no medidas publicadas.
- VRAM estimada para inferencia: por debajo de 2 GB en FP32 incluyendo activaciones, dado el tamaño del modelo y dos entradas de imagen de 480x640x3. La memoria de activaciones está dominada por los dos flujos de cámara, no por los pesos. Estimación propia, no verificada en la información disponible.
- Cabe con holgura en cualquier GPU de consumo con 4 GB o más de VRAM: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090. También en GPUs de centro de datos (A100, H100, L40S), aunque estarían enormemente sobredimensionadas para 51,7 M de parámetros.
- Ejecución en CPU: técnicamente posible por tamaño, pero el bucle de control del dataset es de 30 FPS (33 ms por ciclo) y no hay datos publicados de latencia en CPU; el cumplimiento de ese presupuesto temporal no está garantizado.
- Opciones de despliegue: la vía documentada es LeRobot con `lerobot-rollout --policy.path=Low101/hf_act_recordpolicy0`. No se documentan conversiones a GGUF, ONNX, TensorRT ni soporte en vLLM, TGI u Ollama, que además están orientados a modelos de lenguaje y no aplican a esta política.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia de inferencia, frecuencia efectiva de control ni tasa de éxito en hardware real.

## Comparativa con modelos similares

Los datos de las filas correspondientes a otros modelos no proceden de la información proporcionada en esta búsqueda y deben verificarse en sus respectivas fichas antes de usarse. Solo la primera fila está respaldada por datos reales del repositorio.

| Modelo | Categoria | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Low101/hf_act_recordpolicy0` | ACT, imitacion visuomotora | 51.668.614 (real, safetensors) | chunk de acciones, tamano no especificado | no disponible | Hugging Face, libreria lerobot |
| Diffusion Policy (implementacion de LeRobot) | politica por difusion para robotica | no disponible / no verificado | horizonte de acciones configurable, no verificado | la del repositorio LeRobot | incluida en LeRobot |
| SmolVLA (Hugging Face) | VLA pequeno (vision-lenguaje-accion) | no verificado en esta busqueda | depende del modelo de lenguaje subyacente | no verificada | Hugging Face, LeRobot |
| pi0 / pi0.5 (Physical Intelligence) | VLA de gran escala | no verificado en esta busqueda | no verificado | no verificada | publicados por el autor |

Diferencias cualitativas que sí se pueden afirmar con la información disponible: este modelo es una política de tarea única entrenada con 50 episodios, mientras que las alternativas VLA están pensadas para generalizar a múltiples tareas e instrucciones en lenguaje natural. A cambio, con 51,7 M de parámetros es varios órdenes de magnitud más pequeno y se ejecuta en hardware de consumo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada en robot real. No debe asumirse que la política funciona solo porque el entrenamiento se completase.
- Entrenamiento muy reducido: 50 episodios y 32.589 fotogramas para una única tarea. Es esperable sobreajuste a posiciones de objeto, iluminación, fondo y disposición exacta de las cámaras del montaje original.
- Acoplamiento estricto al hardware: los nombres y las resoluciones de las cámaras (`wrist`, `front`, 480x640) y el tipo de robot (`so_follower`) deben coincidir exactamente. Cualquier cambio de montaje invalida la política.
- Sensibilidad a la calibración: errores de calibración del brazo o de las cámaras degradan directamente la correspondencia entre observación y acción.
- Sin generalización semántica: no entiende lenguaje natural de forma flexible ni puede recibir instrucciones nuevas. La cadena de tarea es fija y la política solo ha visto una tarea.
- Licencia no especificada: la model card indica "More Information Needed". Esto impide determinar si el uso comercial está permitido; en un contexto de producción debe tratarse como un riesgo legal hasta que el autor aclare la licencia.
- Sesgos y alucinación: no aplican sesgos lingüísticos por no ser un modelo de lenguaje, pero sí existe el equivalente robótico: la política puede producir trayectorias plausibles pero incorrectas ante estados fuera de distribución, sin señal de incertidumbre.
- Riesgo físico: es un controlador que mueve hardware real. Se requiere parada de emergencia, límites de par y supervisión humana durante cualquier prueba.
- Idoneidad para producción: baja. Es un artefacto de investigación y demostración; no hay versiones cuantizadas, ni soporte de servidores de inferencia, ni garantías de latencia a 30 FPS.
- Fechas de creación y actualización muy próximas (15 de octubre de 2026, con 8 segundos de diferencia): el repositorio no parece haber recibido mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Low101/hf_act_recordpolicy0
- Dataset de entrenamiento: https://huggingface.co/datasets/Low101/lerobot-so101-first-act_20261015_205345
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Low101/lerobot-so101-first-act_20261015_205345
- Articulo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con este modelo (generadores de nombres de habilidades, wikis de superpoderes y un hilo de Reddit sobre habilidades oculares). No se ha encontrado ninguna fuente externa adicional, analisis de terceros ni informe de evaluacion sobre `Low101/hf_act_recordpolicy0`.
