# ases200q2/roboverse_pick_cube_mujocoE100_act_20260912_0941

## Resumen

Este repositorio contiene una política robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación presentado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visual-motor que consume el estado del robot, su velocidad y una imagen de una única cámara (`main_camera`) para producir comandos de acción de 9 dimensiones. Ha sido entrenado y publicado por el usuario `ases200q2` mediante la librería LeRobot de HuggingFace, sobre un dataset propio de 100 episodios y 9.830 fotogramas a 30 FPS centrado en la tarea `pick_cube` (agarrar un cubo) con un robot de tipo `franka`.

El checkpoint tiene 51.674.761 parámetros y ocupa 0,2 GB en el repositorio, lo que lo sitúa en la categoría de políticas ligeras capaces de ejecutarse en hardware de consumo. Su relevancia es acotada y muy específica: sirve como referencia reproducible dentro del ecosistema LeRobot para tareas de manipulación pick-and-place, y como punto de partida para fine-tuning o para comparativas de métodos de imitación. No dispone de ningún resultado de evaluación publicado, ni descargas, ni validación por parte de la comunidad, por lo que su rendimiento real es desconocido.

Conviene subrayar que la fecha de creación registrada en el Hub es 2026-09-12 (posterior a la redacción habitual de fichas), dato que se reproduce tal cual figura en la información disponible. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual de tipo ResNet (política ACT, Action Chunking with Transformers) |
| Parametros totales | 51.674.761 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ACT opera sobre la observación actual y predice un chunk de acciones; no emplea ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; pesos distribuidos en precisión completa) |
| Idiomas soportados | no disponible / no aplica (política robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos declarados: tipo de robot `franka`; cámara `main_camera`; entradas `observation.state` (9,), `observation.velocity` (9,) y `observation.images.main_camera` (3, 240, 320); salida `action` (9,). Tamaño del repositorio: 0,2 GB. Librería: `lerobot`.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición típico de las políticas que actúan paso a paso. La arquitectura combina un codificador visual convolucional para las imágenes de cámara con un transformer que modela la secuencia de estados y acciones, habitualmente mediante un esquema de autoencoder variacional condicional (CVAE) que captura la variabilidad de las demostraciones humanas. El modelo se entrena por clonación de comportamiento sobre datos teleoperados, no mediante RLHF ni DPO, ya que no es un modelo generativo de lenguaje.

Según la model card, el entrenamiento se realizó con 40.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y la versión 0.6.1 de LeRobot. El dataset asociado (`ases200q2/roboverse-pick_cube-mujoco-E100`) contiene 100 episodios, 9.830 fotogramas a 30 FPS y la única tarea `pick_cube`. El nombre del dataset referencia MuJoCo y RoboVerse, lo que sugiere un origen en simulación o en un entorno basado en MuJoCo, extremo que la documentación proporcionada no confirma de forma explícita. No se detalla la composición del dataset más allá del número de episodios ni si hubo aumentos de datos.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 9 dimensiones a partir de estado, velocidad e imagen de cámara.
- Ejecución de la tarea única `pick_cube` sobre un robot Franka, presumiblemente en el entorno para el que se recogió el dataset.
- Predicción de chunks de acciones, lo que aporta cierta robustez temporal frente a políticas de un solo paso.
- Inferencia ligera: 51,7 millones de parámetros, ejecutable en hardware modesto.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües (no procesa texto).
- No incorpora modo de razonamiento (thinking mode), ni visión general más allá del codificador de la cámara de la tarea, ni audio.
- No se han documentado capacidades de generalización a otras tareas u objetos distintos del cubo.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política puede controlar un Franka para agarrar un cubo a partir de una cámara frontal, sirviendo de base para rutinas de manipulación repetitivas en entornos de investigación.
- Baseline en estudios de aprendizaje por imitación: al ser un ACT estándar entrenado con LeRobot, permite comparar de forma controlada frente a otros métodos (por ejemplo, políticas de difusión) usando el mismo dataset.
- Validación de pipelines de recogida de datos: el dataset de 100 episodios y 9.830 fotogramas a 30 FPS sirve para verificar el flujo completo de grabación, entrenamiento y despliegue con LeRobot.
- Experimentos de sim-to-real (si el dataset proviene de MuJoCo, como sugiere su nombre): permite evaluar la transferencia de una política entrenada en simulación a un Franka real, midiendo la caída de éxito.
- Fine-tuning para tareas cercanas: los pesos pueden servir como inicialización para nuevas tareas de manipulación sobre el mismo robot y la misma cámara, reduciendo el número de episodios necesarios.
- Docencia y demostraciones: su reducido tamaño permite ejecutar el entrenamiento y la inferencia en un portátil con GPU de consumo, lo que facilita su uso en cursos de robótica y aprendizaje automático.
- Pruebas de integración del stack LeRobot: el comando `lerobot-rollout` documentado en la model card permite comprobar de extremo a extremo la conexión con el robot y las cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, se desconoce la tasa de éxito real de la tarea `pick_cube`, así como cualquier métrica de robustez ante cambios de posición, iluminación u objetos distractores.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,67 millones de parámetros, los pesos ocupan aproximadamente 0,21 GB en fp32 y 0,10 GB en fp16; el consumo total con activaciones se mantiene holgadamente por debajo de 1 GB en uso típico.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 son ampliamente sobredimensionados para esta carga.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso puede ejecutarse en CPU para pruebas no críticas.
- Opciones de despliegue: el flujo oficial es LeRobot con PyTorch (comando `lerobot-rollout`); no es compatible con servidores de inferencia de LLM como vLLM, TGI u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: el control opera a 30 FPS en el dataset, lo que implica un presupuesto de 33 ms por paso; no se han publicado mediciones de latencia ni de throughput reales.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables concretos con parámetros, contexto o rendimiento verificables. A continuación se indica la comparativa a nivel de método, sin cifras inventadas:

| Modelo / método | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, `ases200q2`) | 51.674.761 | cámara 3x240x320, estado (9,), velocidad (9,) | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Otras políticas ACT de LeRobot | no disponible | no disponible | no disponible | no disponible | público en el Hub, datos no consultados |
| Políticas de difusión (Diffusion Policy) como familia alternativa | no disponible | típicamente imagen y estado | no disponible | no disponible | no disponible |

En ausencia de métricas publicadas y de modelos de referencia con datos verificables en esta búsqueda, no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito ni validación en robot real, por lo que no se puede garantizar su funcionamiento.
- Especialización extrema: solo se ha entrenado para la tarea `pick_cube`; no se espera que generalice a otros objetos, tareas o disposiciones.
- Sensibilidad a la configuración: depende de un único cámara (`main_camera`) con resolución 3x240x320 y de las claves de observación exactas usadas en el entrenamiento; cualquier cambio en el montaje o los nombres de las cámaras puede invalidar la política.
- Dataset reducido: 100 episodios y 9.830 fotogramas son un volumen pequeño, lo que incrementa el riesgo de sobreajuste y de degradación ante covariate shift propio de la clonación de comportamiento.
- Posible brecha sim-to-real: si los datos provienen de MuJoCo (como sugiere el nombre del dataset), la transferencia a hardware real no está demostrada.
- Sin capacidades lingüísticas ni de razonamiento: no procesa instrucciones en lenguaje natural ni puede encadenar subtareas simbólicas.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la ejecución de acciones plausibles pero incorrectas ante situaciones fuera de distribución.
- Sesgos: no se documentan sesgos específicos; en clonación de comportamiento, la política hereda las preferencias y los sesgos de las demostraciones teleoperadas.
- Licencia: Apache 2.0 permite uso comercial y modificación sin restricciones adicionales, aunque se recomienda citar el paper de ACT y LeRobot.
- Advertencia de producción: sin métricas ni validación externa, no debería desplegarse en entornos reales críticos sin una evaluación propia y exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ases200q2/roboverse_pick_cube_mujocoE100_act_20260912_0941
- Dataset de entrenamiento: https://huggingface.co/datasets/ases200q2/roboverse-pick_cube-mujoco-E100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ases200q2/roboverse-pick_cube-mujoco-E100
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
