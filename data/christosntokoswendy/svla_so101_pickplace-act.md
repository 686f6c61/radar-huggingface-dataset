# ChristosNtokosWendy/svla_so101_pickplace-act

## Resumen

`svla_so101_pickplace-act` es una política robótica de manipulación (no un modelo de lenguaje) entrenada con el framework LeRobot 0.6.1 y publicada por el usuario `ChristosNtokosWendy`. Implementa el algoritmo ACT (Action Chunking Transformer), una arquitectura de aprendizaje por imitación que mapea observaciones visuales y proprioceptivas a secuencias de acciones motrices discretas, y que está pensada para ser desplegada sobre un brazo robótico de bajo coste SO-101 (versión `so100_follower`).

El modelo se ha entrenado sobre el dataset público `lerobot/svla_so101_pickplace` (50 episodios, 11.939 frames a 30 fps), con 2.000 pasos de entrenamiento y batch size 8, empleando la imagen de contenedor `ghcr.io/wendylabsinc/lerobot-train:lerobot-0.6.1`. El resultado es una política de 51,67 millones de parámetros (unos 0,2 GB en safetensors) que ejecuta la tarea concreta de *pick-and-place*, es decir, coger un objeto y colocarlo en una posición destino, a partir de demostraciones humanas.

Su relevancia radica en que ejemplifica el flujo actual de robótica open source de bajo coste: pocos datos, hardware asequible (SO-101) y un stack estandarizado (LeRobot) que permite reproducir el entrenamiento y el despliegue sin infraestructura propietaria. La licencia Apache 2.0 facilita su reutilización comercial y académica, aunque se trata de una política especializada en una única tarea y no de un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con chunking de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un LLM; la política condiciona sobre historial de observaciones y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de aprendizaje por imitación que combina un codificador visual (típicamente ResNet preentrenada) con un transformer que procesa el estado proprioceptivo del robot y genera *chunks* de acciones futuras en lugar de una única acción por paso. Esta predicción por bloques reduce el error de acumulación y suaviza la ejecución motriz, algo crítico en tareas de manipulación con hardware de bajo coste como el SO-101. La política se entrena mediante *behavior cloning* supervisado sobre pares observación-acción extraídos de demostraciones humanas.

En este caso el entrenamiento se realizó con LeRobot 0.6.1 durante 2.000 pasos y batch size 8, sobre el dataset `lerobot/svla_so101_pickplace` en formato LeRobotDataset v3.0 (commit `f641879e22172be7e8161d5e6c1503c2d2feb657`), que contiene 50 episodios y 11.939 frames grabados a 30 fps con el robot `so100_follower`. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura. La configuración completa del entrenamiento se conserva en el fichero `train_config.json` del repositorio.

## Capacidades

- Manipulación robótica de tipo *pick-and-place*: coger un objeto y depositarlo en una posición destino, a partir de imágenes de cámara y del estado del brazo.
- Entrada multimodal sensorial: procesa observaciones visuales (cámaras) y estado proprioceptivo del robot `so100_follower`.
- Predicción de secuencias de acciones (*action chunking*): genera bloques de acciones de control motriz en lugar de pasos individuales.
- Ejecución de una política de imitación entrenada sobre demostraciones humanas (50 episodios).
- Integración nativa con el ecosistema LeRobot: carga mediante `ACTPolicy.from_pretrained(...)`.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de generación de texto, código, matemáticas ni visión interpretativa.
- No incorpora *thinking mode*, audio ni modos de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política recibe las imágenes de cámara del SO-101 y emite chunks de acciones para coger piezas y colocarlas en una bandeja, aprovechando el entrenamiento específico sobre la tarea.
- Clasificación y reubicación de objetos pequeños: reutilizando la política como base y aplicando *fine-tuning* sobre un dataset propio con nuevas categorías de objetos.
- Laboratorio docente de robótica e imitación: sirve como ejemplo reproducible de extremo a extremo (dataset público + LeRobot + hardware SO-101) para prácticas de aprendizaje por imitación.
- Investigación en *behavior cloning*: base de comparación para estudiar variantes de ACT, tamaños de chunk o composición de datasets.
- Benchmarking de pipelines LeRobot: validación de que un flujo `wendy train` + LeRobot 0.6.1 produce políticas desplegables, comparando métricas de éxito en la tarea.
- Prototipado rápido en robótica de bajo coste: despliegue en un brazo SO-101 real o en simulación para validar una celda de manipulación antes de invertir en hardware industrial.
- Teleoperación asistida: uso de la política como capa de autonomía parcial que propone acciones mientras un operador supervisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,67 M de parámetros en fp32, el peso ocupa aproximadamente 207 MB; la inferencia completa con codificador visual y buffers adicionales se mantiene holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta la política sin problemas. GPU de datacenter (A100, H100) son innecesarias y sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia a baja frecuencia de control.
- Despliegue en borde: es viable en placas tipo NVIDIA Jetson (Orin Nano o superiores) para control en tiempo real del brazo.
- Opciones de despliegue: LeRobot con PyTorch (`ACTPolicy.from_pretrained`), contenedores del stack `wendylabsinc/lerobot-train`; no aplica vLLM, llama.cpp ni TGI, que son servidores de LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChristosNtokosWendy/svla_so101_pickplace-act | ACT (LeRobot) | 51.668.614 | svla_so101_pickplace | Apache 2.0 | HuggingFace |
| chirag1701/smolvla_so101_pickplace | SmolVLA (VLA) | no disponible | svla_so101_pickplace | no disponible | HuggingFace |
| chris241094/act-svla-so101-pickplace-v05 | ACT (LeRobot) | no disponible | svla_so101_pickplace | no disponible | HuggingFace |

Los tres modelos se entrenan sobre el mismo dataset de referencia (`lerobot/svla_so101_pickplace`), lo que permite compararlos cualitativamente en la tarea pick-and-place. SmolVLA incorpora un componente visión-lenguaje-acción de mayor tamaño y generalidad, mientras que las variantes ACT son políticas específicas de la tarea, más ligeras. No se dispone de parámetros, contexto ni métricas de rendimiento de las alternativas en la información consultada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea y el setup del dataset `svla_so101_pickplace`; no generaliza a otros objetos, posiciones o robots sin reentrenamiento o *fine-tuning*.
- Sin datos de evaluación: no se han publicado tasas de éxito, por lo que el rendimiento real en producción es desconocido.
- Dependencia del hardware: asume el robot `so100_follower` y una configuración de cámaras concreta; cambios de calibración, iluminación o montaje pueden degradar la política.
- Riesgo de fallo silencioso: al ser *behavior cloning*, puede ejecutar acciones plausibles pero incorrectas sin señal de error explícita.
- No es un modelo de lenguaje: no debe usarse para texto, código, razonamiento ni tareas multimodales interpretativas.
- Sesgos: los derivados de las demostraciones humanas del dataset (posiciones, objetos y estilo de manipulación del demostrador).
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar la licencia del dataset original y de las dependencias (LeRobot, pesos del codificador visual) antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ChristosNtokosWendy/svla_so101_pickplace-act
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Alternativa SmolVLA sobre el mismo dataset: https://huggingface.co/chirag1701/smolvla_so101_pickplace
- Alternativa ACT sobre el mismo dataset: https://huggingface.co/chris241094/act-svla-so101-pickplace-v05
- Visor del dataset y contexto SmolVLA: https://smolvla.net/index_en
- Ficha del dataset en DataTrain.AI: https://www.datatrain.ai/datasets/hf-lerobot-svla-so101-pickplace/
