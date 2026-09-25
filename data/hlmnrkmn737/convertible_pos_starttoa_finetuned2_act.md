# hlmnrkmn737/convertible_pos_startToA_fineTuned2_act

## Resumen

El modelo `hlmnrkmn737/convertible_pos_startToA_fineTuned2_act` es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv 2304.13705. Lo desarrolla el usuario de HuggingFace `hlmnrkmn737` y se ha entrenado y publicado con LeRobot 0.6.0, la librería de HuggingFace para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular y dos vistas de cámara, y produce comandos de acción de 6 grados de libertad.

El problema que resuelve es la manipulación robótica de precisión: la tarea concreta aprendida consiste en coger una plataforma convertible y colocarla sobre el soporte en la posición superior del teclado. ACT aborda este tipo de tareas prediciendo fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error acumulado y las discontinuidades típicas de las políticas que deciden paso a paso. La política tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y un peso de repositorio de 0,2 GB.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el formato de datos, el entrenamiento y el despliegue de políticas robóticas en abierto. Esto permite reproducir el entrenamiento, sustituir el dataset y reentrenar la política, o desplegarla directamente sobre un robot `so_follower` con dos cámaras, sin necesidad de infraestructura propietaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con transformer y chunking de acciones |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; predice chunks de acciones a partir de observaciones) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; el modelo procesa imágenes y estado articular, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot 0.6.0 |
| Tipo de robot | so_follower |
| Camaras | top_view, front_view |
| Entradas | observation.state (6,), observation.images.top_view (3, 480, 640), observation.images.front_view (3, 480, 640) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que aprende a partir de datos teleoperados y predice secuencias cortas de acciones en lugar de un único paso de control. La política combina percepción visual con el estado propioceptivo del robot: en este caso, dos flujos de imagen RGB de 480x640 píxeles (vistas `top_view` y `front_view`) y un vector de estado de 6 dimensiones, a partir de los cuales genera un vector de acción también de 6 dimensiones. La referencia metodológica completa está en el artículo arXiv 2304.13705, citado en la model card.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `hlmnrkmn737/convertible_pos_startToA_fineTuned2_20260925_merged_recomputed_stats`, que contiene 150 episodios y 105.562 fotogramas capturados a 30 FPS. Las dos variantes de la instrucción de tarea registradas son "pick up the convertible platform and place it on the support at top of keyboard position" y su versión con mayúscula inicial. La configuración de entrenamiento documentada es de 10.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documentan en la información disponible detalles adicionales sobre aumentos de datos, composición exacta del dataset, número de tokens de entrenamiento ni fases de ajuste por refuerzo o preferencias (RLHF/DPO), que en cualquier caso no son habituales en este tipo de políticas.

## Capacidades

- Manipulación robótica visomotora: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Fusión de dos vistas de cámara (`top_view` y `front_view`) a 480x640 con el estado articular de 6 dimensiones.
- Predicción por chunks de acciones, orientada a reducir la acumulación de error y suavizar la ejecución en tareas de pick-and-place.
- Ejecución de la tarea específica de recoger una plataforma convertible y depositarla sobre el soporte en la posición superior del teclado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas de 30 FPS.
- Compatibilidad con el flujo de trabajo de LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento o ajuste con nuevos datos.
- No dispone de soporte de tool calling, function calling, agentes, capacidades multilingües, modo de razonamiento, visión general o audio: es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- Automatización de pick-and-place de precisión: la política ejecuta la secuencia completa de coger la plataforma convertible y situarla sobre el soporte, con las dos vistas de cámara como entrada para localizar el objeto y el punto de destino.
- Integración en una celda de montaje de periféricos: puede emplearse como controlador de la fase de colocación de componentes sobre soportes, siempre que la disposición física coincida con la del dataset de entrenamiento.
- Teleoperación asistida y recogida de datos: sirve de política base para comparar la ejecución autónoma con la demostración humana y registrar episodios adicionales que alimenten el siguiente ciclo de entrenamiento.
- Punto de partida para ajuste fino: con `lerobot-train` y un dataset propio se puede reentrenar la política para variantes de la misma tarea o para un robot del mismo tipo con distinta disposición de cámaras.
- Investigación en aprendizaje por imitación: permite reproducir y evaluar el comportamiento de ACT sobre un caso concreto y contrastarlo con otras políticas del ecosistema LeRobot bajo el mismo dataset.
- Validación de hardware y calibración: útil como prueba funcional de un montaje `so_follower` con dos cámaras, verificando puertos, índices de cámara y frecuencias antes de abordar tareas más complejas.
- Demostraciones y material docente: al ser un repositorio pequeño (0,2 GB) y con licencia Apache 2.0, es adecuado para ejemplos reproducibles de despliegue de políticas robóticas en abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación vacía, con la indicación de que no se han proporcionado resultados de evaluación para esta política. No se dispone, por tanto, de tasas de éxito, número de ensayos por tarea ni condiciones de evaluación (posiciones de objeto, iluminación, distractores o robot distinto).

| Metrica | Valor |
|---|---|
| Tasa de exito en tarea real | no disponible |
| Numero de ensayos | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | no aplica (no es un modelo de lenguaje) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parámetros, los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 aproximadamente 103 MB. El consumo real lo domina el codificador visual que procesa dos flujos de 480x640 a 30 FPS, no los pesos de la política.
- GPUs recomendadas: cualquier GPU con soporte CUDA de gama media o superior es suficiente por capacidad de memoria; el factor limitante es la latencia del bucle de control, no el tamaño del modelo.
- Cabe en GPU de consumo: sí, con margen amplio en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes. También es candidata razonable para inferencia en CPU o en dispositivos embebidos tipo Jetson, aunque no se han documentado medidas en la información disponible.
- Opciones de despliegue: flujo nativo de LeRobot mediante `lerobot-rollout` con `--policy.path=hlmnrkmn737/convertible_pos_startToA_fineTuned2_act` y `--strategy.type=base`; reentrenamiento con `lerobot-train`. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La ejecución debe sostener el bucle a 30 FPS para coincidir con la frecuencia del dataset de entrenamiento; no se han publicado mediciones de latencia por paso.

## Comparativa con modelos similares

No se dispone de datos verificables en la informacion proporcionada para establecer una comparativa numérica con alternativas. La busqueda web realizada devolvio únicamente datasets relacionados del mismo autor, no modelos comparables con especificaciones o resultados publicados.

| Modelo | Parametros | Contexto / tarea | Licencia | Resultados publicados |
|---|---|---|---|---|
| convertible_pos_startToA_fineTuned2_act (este modelo) | 51,7 M | Politica ACT para so_follower, tarea pick-and-place | apache-2.0 | no disponibles |
| Otras politicas ACT del ecosistema LeRobot | no disponible | Politicas de imitacion con chunking de acciones | habitualmente apache-2.0 | no disponible en la informacion proporcionada |
| Politicas alternativas de imitacion (por ejemplo, Diffusion Policy) | no disponible | Control visomotor por difusion | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en la tarea, así como su robustez ante cambios de posición, iluminación o presencia de distractores.
- Sesgos de datos: la política se ha entrenado con 150 episodios y 105.562 fotogramas de una única tarea y una única configuración física; es probable que se degrade fuera de esa distribución.
- Dependencia del montaje de hardware: las cámaras deben llamarse `top_view` y `front_view` y colocarse de forma coherente con el dataset original. Cambios de montaje, resolución o frecuencia rompen la correspondencia entrenamiento-inferencia.
- Riesgo de fallo silencioso: al ser una política de control, un error no se manifiesta como una respuesta incorrecta de texto, sino como una acción física errónea sobre el robot. Se recomienda limitar velocidades y fuerzas y disponer de parada de emergencia.
- Sobreajuste a la instrucción de tarea: las dos variantes de instrucción registradas difieren solo en mayúsculas, lo que sugiere un vocabulario de tareas muy reducido y poca capacidad de generalización a otras órdenes.
- Idiomas y modalidades: no procesa texto ni audio, por lo que no aplican capacidades multilingües ni de conversación.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece ninguna garantía sobre el comportamiento del modelo; el usuario asume el riesgo de despliegue.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales externas de validación por parte de la comunidad.
- Fecha de creación futura respecto a la fecha habitual de consulta (2026-09-25), dato a verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hlmnrkmn737/convertible_pos_startToA_fineTuned2_act
- Dataset de entrenamiento: https://huggingface.co/datasets/hlmnrkmn737/convertible_pos_startToA_fineTuned2_20260925_merged_recomputed_stats
- Visualizacion del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hlmnrkmn737/convertible_pos_startToA_fineTuned2_20260925_merged_recomputed_stats
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset relacionado: https://huggingface.co/datasets/hlmnrkmn737/convertible_pos_startToA_fineTuned_20260924
- Dataset relacionado: https://huggingface.co/datasets/hlmnrkmn737/convertible_pos_startToA_20260915_102825
- Ficha del dataset en Claru: https://claru.ai/datasets/hlmnrkmn737-convertible-pos-starttoa-20260915-102825
