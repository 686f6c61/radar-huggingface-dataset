# Bigwaverobotics/lerobot_pack_parcels_into_small_box

## Resumen

`lerobot_pack_parcels_into_small_box` es una política de robótica entrenada con imitación (imitation learning) mediante el framework LeRobot de Hugging Face. La publica el usuario Bigwaverobotics y resuelve una tarea concreta de manipulación industrial: empaquetar paquetes en una caja pequeña dentro de un escenario de logística con cajas de distintos tamaños. No es un modelo de lenguaje, sino un controlador visuomotor que mapea observaciones (imágenes de cámara y estado del robot) a acciones de bajo nivel.

Técnicamente se trata de una política ACT (Action Chunking with Transformers) con backbone visual ResNet-18. Genera bloques de 50 acciones (`chunk_size: 50`) a partir de una única observación (`n_obs_steps: 1`), lo que reduce el error de acumulación típico de las políticas paso a paso y permite ejecutar gestos fluidos de pick-and-place. El checkpoint ocupa unos 197 MiB en safetensors y suma 51.637.904 parámetros.

Su relevancia es acotada pero clara: es un ejemplo reproducible de política industrial de empaquetado publicada con licencia Apache-2.0 y con el dataset de entrenamiento en abierto, lo que facilita replicar el pipeline de LeRobot en entornos de laboratorio o líneas de producción simuladas. No obstante, es un checkpoint de nicho, sin descargas ni validación externa publicada, pensado para integrarse en una pila LeRobot concreta más que para uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parámetros totales | 51.637.904 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; `n_obs_steps: 1`, `chunk_size: 50`) |
| Tipos de cuantización | no disponible (checkpoint en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~197 MiB) + JSON de configuración y procesadores |

## Arquitectura y entrenamiento

La política sigue la formulación ACT: un transformer que, dada una observación visual y propioceptiva, predice un chunk de 50 acciones futuras en lugar de una sola. La configuración declara `policy_type: act`, `policy_vision_backbone: resnet18`, `n_obs_steps: 1`, `chunk_size: 50` y `policy_n_action_steps: 50`, de modo que el modelo ejecuta el bloque completo antes de volver a observar. Este esquema, popularizado por el paper de ACT (Zhao et al., 2023), se usa habitualmente con regularización por mezcla temporal (temporal ensembling) para suavizar la transición entre chunks.

El entrenamiento es por imitación supervisada sobre el dataset `itdevhumanoid/lerobot_pack_parcels_into_small_box_dataset` (referenciado también como `bwr/dataset_20490` en la configuración de entrenamiento). No se documentan en la model card el número de episodios, la composición de las demostraciones, la resolución de las cámaras ni si hubo aumento de datos o entrenamiento multi-tarea. Tampoco se indica el uso de RLHF, DPO ni ninguna fase de refinamiento por refuerzo, algo esperable en una política de imitación pura. El artefacto incluye preprocesador y postprocesador (normalizador/desnormalizador de acciones) empaquetados junto con los pesos, lo que sugiere que el pipeline de LeRobot se aplicó de forma estándar.

## Capacidades

- Control visuomotor de manipulación robótica para la tarea de empaquetado de paquetes en caja pequeña.
- Generación de chunks de 50 acciones por inferencia, lo que permite movimientos continuos y reduce la frecuencia de recálculo.
- Condicionamiento sobre una única observación por paso (`n_obs_steps: 1`), típico de políticas reactivas de baja latencia.
- Integración nativa con LeRobot: carga mediante `ACTPolicy.from_pretrained(...)` y uso del preprocesador/postprocesador incluidos.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es un modelo de acción, no de lenguaje.
- No incluye modo "thinking", visión semántica, audio ni generación de texto.

## Casos de uso

- Empaquetado automatizado en línea de producción: la política ejecuta la secuencia pick-and-place de paquetes en cajas pequeñas, adecuada para celdas robotizadas donde la tarea está bien delimitada y las cámaras y la pinza están calibradas de antemano.
- Prototipado de pipelines LeRobot: sirve como referencia para validar la cadena completa (dataset, entrenamiento ACT, despliegue en robot) antes de escalar a tareas más complejas.
- Benchmark interno de manipulación: al ser un checkpoint pequeño (~197 MiB, 51,6 M de parámetros), permite comparar variantes de backbone, chunk size o número de cámaras con coste de cómputo bajo.
- Investigación en imitation learning: útil como baseline ACT reproducible sobre un dataset público de logística industrial para estudiar generalización entre configuraciones de caja.
- Simulación y gemelo digital: puede integrarse en entornos simulados tipo Isaac Sim o MuJoCo para validar la política antes de desplegarla en hardware real.
- Formación y demos docentes: ejemplo didáctico de política visuomotora con licencia permisiva para cursos de robótica y aprendizaje por imitación.
- Reentrenamiento con fine-tuning sobre datos propios: al estar en Apache-2.0 y con el dataset de origen disponible, es viable adaptarlo a una línea de empaquetado concreta con demostraciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición, curvas de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros y pesos en FP32 el modelo ocupa en torno a 200 MB, y en FP16 alrededor de 100 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real; A100/H100 no son necesarias para esta política, aunque pueden usarse en entrenamiento por lotes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM libre, e incluso en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot.policies.act.modeling_act.ACTPolicy`), con soporte del stack de Hugging Face; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del número de cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bigwaverobotics/lerobot_pack_parcels_into_small_box` | ACT + ResNet-18 | 51,6 M | `chunk_size: 50`, `n_obs_steps: 1` | Apache-2.0 | Hugging Face (0 descargas) |
| `lerobot/act_aloha_sim_transfer_cube_human` | ACT (referencia LeRobot) | no disponible | chunk configurable | Apache-2.0 | Hugging Face |
| `lerobot/diffusion_pusht` | Diffusion Policy (referencia LeRobot) | no disponible | horizonte de acciones configurable | Apache-2.0 | Hugging Face |
| OpenVLA (referencia generalista) | VLA basado en LLM | ~7 B | contexto de lenguaje | distinta (ver repo) | Hugging Face |

La comparación con OpenVLA es solo orientativa: este checkpoint es una política especializada y ligera, mientras que OpenVLA es un modelo visión-lenguaje-acción de propósito general con un orden de magnitud más de parámetros. No hay datos de rendimiento comparables publicados para este checkpoint.

## Limitaciones y advertencias

- Especialización extrema: solo está entrenado para la tarea de empaquetar paquetes en caja pequeña; no generaliza a otras tareas sin reentrenamiento.
- Sin métricas publicadas: no hay tasas de éxito, curvas de aprendizaje ni validación externa, por lo que su fiabilidad en producción es desconocida.
- Dependencia del entorno: la política asume una configuración concreta de cámaras, pinza y robot; cambios en iluminación, altura de cámara o tipo de objeto pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset: al no documentarse el número de episodios ni la diversidad de las demostraciones, es probable que la generalización sea limitada.
- Sin información sobre sesgos: no se documentan sesgos demográficos ni de otro tipo, pero tampoco análisis de robustez.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset de entrenamiento por separado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.
- La model card menciona rutas locales del autor (`/Users/mypark/...`) y un `repo_id` nulo en la configuración, lo que sugiere un empaquetado manual y no un pipeline automatizado de publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_pack_parcels_into_small_box
- Dataset de entrenamiento: https://huggingface.co/datasets/itdevhumanoid/lerobot_pack_parcels_into_small_box_dataset
- Framework LeRobot: https://github.com/huggingface/lerobot
- Repositorio LeRobot en Hugging Face (referencia de políticas ACT): https://huggingface.co/lerobot
