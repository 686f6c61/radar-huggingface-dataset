# lenawngr/ACT_svla_so100_pickplace

## Resumen

ACT_svla_so100_pickplace es una politica de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face por el usuario lenawngr dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un controlador neuronal que, a partir de observaciones visuales y del estado del robot, predice secuencias cortas de acciones (chunks) para que un brazo robótico SO100 ejecute tareas de recogida y colocación (pick and place).

El modelo se ha entrenado sobre el dataset lerobot/svla_so100_pickplace, que contiene 50 episodios teleoperados repartidos en 5 posiciones distintas de un cubo, con 10 episodios por posición. Esa repetición de variaciones busca mejorar la generalización de la politica ante pequeñas diferencias de colocación del objeto.

Con 51.668.614 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB en formato safetensors, se trata de un checkpoint ligero y fácil de desplegar en hardware modesto. Su relevancia actual está en que sirve como referencia reproducible de ACT dentro de LeRobot y como punto de partida para tareas de manipulación de bajo coste, así como baseline frente a politicas más recientes tipo VLA como SmolVLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador CVAE para aprendizaje por imitacion |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplicable (modelo denso, no es MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje; produce chunks de acciones a partir de observaciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplicable / no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | lerobot/svla_so100_pickplace |
| Paper de referencia | arXiv:2304.13705 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación fina. La arquitectura combina un codificador de visión (backbone convolucional) con un transformer encoder-decoder y un codificador CVAE que modela la variabilidad de las demostraciones humanas durante el entrenamiento. En inferencia se usa la componente del decodificador para generar la secuencia de acciones. La referencia técnica es el paper arXiv:2304.13705, vinculado al desarrollo de manipulación bimanual con hardware de bajo coste.

El entrenamiento de este checkpoint es puramente supervisado por imitación a partir de teleoperación: el dataset lerobot/svla_so100_pickplace contiene 50 episodios grabados sobre 5 posiciones distintas de un cubo (10 episodios por posición) con un brazo SO100. No se documenta en la información disponible el uso de RLHF, DPO ni de fases de refinamiento por refuerzo. Tampoco se detallan el número total de tokens o muestras efectivas, la composición exacta del dataset ni innovaciones adicionales como decodificación especulativa o atención lineal, por lo que esos datos quedan como no disponibles.

## Capacidades

- Control de manipulación pick and place: genera comandos de acción para un brazo SO100 follower a partir de observaciones visuales y del estado del robot.
- Predicción por chunks de acciones, orientada a reducir la acumulación de error frente a politicas de paso único.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas explícitas ni simulación.
- Percepción visual: consume imágenes de cámara como entrada (el número y resolución de cámaras no se detalla en la información disponible).
- Generalización limitada a variaciones de posición del objeto dentro del rango cubierto por el dataset de entrenamiento (5 posiciones).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso simbólico ni planificación basada en lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de pensamiento (thinking), audio ni visión de propósito general.

## Casos de uso

- Recogida y colocación de cubos con SO100: el modelo reproduce la tarea exacta para la que fue entrenado, colocando un cubo en una posición objetivo a partir de las 5 variantes vistas durante el entrenamiento.
- Punto de partida para transfer learning: al ser un checkpoint ACT completo, se puede reentrenar la cabeza de acciones con un dataset propio de otra tarea de manipulación, reutilizando el backbone visual y el transformer.
- Docencia e investigación en robótica de bajo coste: sirve para ilustrar el flujo completo de LeRobot (entrenamiento, evaluación con lerobot-record y despliegue en hardware real) sin requerir GPU de gama alta.
- Baseline de comparación para politicas VLA: permite contrastar ACT frente a modelos como SmolVLA entrenados sobre el mismo dataset, aislando el efecto de la arquitectura.
- Automatización de tareas repetitivas de pick and place en laboratorio: clasificación de piezas pequeñas o alimentación de estaciones de trabajo donde las posiciones estén dentro del rango entrenado.
- Validación de pipelines de evaluación: el comando lerobot-record con --episodes permite medir tasas de éxito por episodio y comparar configuraciones de cámara, iluminación o calibración.
- Generación de políticas iniciales para ajuste fino con pocas demostraciones: al ser un modelo pequeño, iterar sobre él en ciclos cortos de entrenamiento es viable en una única GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas para este checkpoint concreto. Los datos de rendimiento del método ACT en el paper de referencia corresponden a otros entornos y configuraciones de hardware, por lo que no son directamente extrapolables a este modelo.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 207 MB solo para pesos (51,67 M de parámetros), más activaciones y buffers de imagen; en la práctica por debajo de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 103 MB para pesos, con requisitos totales igualmente inferiores a 1 GB.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3060, RTX 4090 y similares, y también en GPU integradas con soporte CUDA o ROCm.
- Inferencia en CPU viable dado el tamaño del modelo, aunque la latencia puede no cumplir requisitos de control en tiempo real.
- Plataformas embebidas tipo NVIDIA Jetson (Nano, Orin) son candidatas razonables por el reducido tamaño del modelo.
- Despliegue mediante la libreria lerobot (PyTorch), con los comandos lerobot-train y lerobot-record documentados por el autor.
- vLLM, TGI y Ollama no son aplicables, ya que están orientados a modelos de lenguaje y no a politicas de robótica.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lenawngr/ACT_svla_so100_pickplace | ACT (transformer + CVAE) | 51,7 M | Vision + estado del robot | Apache 2.0 | Hugging Face, libreria lerobot |
| zonglin11/svla_so100_pickplace | SmolVLA (VLA, finetuned desde lerobot/smolvla_base) | No disponible | Vision + lenguaje + estado | No disponible | Hugging Face |
| lerobot/smolvla_base | SmolVLA (VLA) | No disponible | Vision + lenguaje + estado | No disponible | Hugging Face |
| Diffusion Policy (referencia LeRobot) | Politica generativa basada en difusion | No disponible | Vision + estado del robot | No disponible | Repositorio LeRobot |

La diferencia principal entre ACT y las alternativas tipo SmolVLA es que estas últimas incorporan lenguaje natural como entrada y pertenecen a la familia de modelos vision-language-action, mientras que ACT es una politica de imitacion pura, más pequena y sin componente lingüística. No se dispone de datos comparativos de rendimiento entre estos modelos sobre el dataset svla_so100_pickplace en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance restringido a una tarea: el modelo está entrenado exclusivamente para pick and place con un SO100 y no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeno: 50 episodios sobre 5 posiciones de cubo implican una cobertura limitada de posiciones, iluminaciones y condiciones de la mesa.
- Riesgo de fallo ante cambios de dominio: modificaciones en cámara, calibración, fondo o tipo de objeto pueden degradar gravemente la politica.
- No aplica el concepto de alucinación en el sentido de los modelos de lenguaje, pero sí existe riesgo de acciones incorrectas o inseguras ante observaciones fuera de distribución.
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling, lo que impide su uso en agentes conversacionales o pipelines de automatización basados en texto.
- No se documentan sesgos demográficos ni lingüísticos porque el modelo no procesa texto ni datos personales; el sesgo relevante es el de las demostraciones de teleoperación concretas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se atribuya correctamente; conviene revisar también la licencia del dataset de entrenamiento.
- El repositorio no registra descargas ni likes y no incluye métricas de evaluación, por lo que no hay evidencia publicada de su fiabilidad en producción.
- Requiere hardware físico SO100 y el ecosistema LeRobot para su despliegue real, lo que limita su uso a entornos con ese brazo disponible.
- La fecha de creación y actualización del repositorio no permite inferir un historial de mantenimiento o soporte posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_svla_so100_pickplace
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so100_pickplace
- Paper de ACT (Hugging Face Papers): https://huggingface.co/papers/2304.13705
- Paper de ACT (arXiv): https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Documentacion de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Modelo relacionado (SmolVLA sobre el mismo dataset): https://huggingface.co/zonglin11/svla_so100_pickplace
- Pagina de alternativas al dataset: https://truelabel.ai/datasets/huggingface/lerobot-svla-so100-pickplace
