# nberezny/act_hybobs_dense

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `nberezny/act_hybobs_dense`, es una política entrenada con LeRobot sobre el dataset `franka_pick_place_hybobs_dense` para la tarea de recoger un cubo rojo y colocarlo sobre un cuadrado azul, usando un robot Franka Panda en simulación.

El modelo consume dos flujos de imagen (cámara cenital y cámara de muñeca) a resolución 240x320 junto con un vector de estado de 27 dimensiones, y produce un vector de acción de 10 dimensiones. Con 51,6 millones de parámetros y un tamaño de repositorio de 0,8 GB, es un modelo compacto orientado a inferencia en tiempo real a 20 FPS, no a razonamiento general.

Es relevante como ejemplo reproducible de extremo a extremo del pipeline de LeRobot: dataset público de 800 episodios y 26.837 frames, configuración de entrenamiento documentada y comandos de despliegue listos para usar. No obstante, carece de licencia declarada, de resultados de evaluación publicados y de idiomas soportados, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.602.058 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | `observation.images.overhead` (3, 240, 320), `observation.images.wrist` (3, 240, 320), `observation.state` (27,) |
| Salidas | `action` (10,) |
| Tipo de robot | `franka_panda_sim_hybrid_dense_rel` |
| Librería | lerobot |
| Tarea | "Pick up the red cube and place it on the blue square." |
| Dataset de entrenamiento | `nberezny/franka_pick_place_hybobs_dense` (800 episodios, 26.837 frames, 20 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un codificador visual (procesa las dos cámaras, cenital y de muñeca) con un codificador de estado y un decodificador que genera un chunk de acciones de forma autorregresiva. La innovación central del método es predecir secuencias cortas de acciones en lugar de una acción por paso, lo que mitiga el problema de acumulación de errores típico de las políticas paso a paso y permite un control más suave y consistente. El paper de referencia es el 2304.13705 de arXiv.

El entrenamiento se realizó con LeRobot 0.7.0 durante 100.000 pasos, con batch size 8, optimizador AdamW y learning rate 1e-05, sobre 800 episodios teleoperados (26.837 frames a 20 FPS) del dataset `franka_pick_place_hybobs_dense`. La model card no detalla la composición exacta del dataset, la presencia de aumentos de datos ni si se aplicó regularización adicional; tampoco se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores al aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones de control robótico para manipulación (pick and place) en un robot Franka Panda simulado.
- Predicción de chunks de acciones de 10 dimensiones a partir de observaciones multimodales (dos cámaras + estado proprioceptivo de 27 dimensiones).
- Aprendizaje por imitación a partir de datos teleoperados; no requiere definición explícita de recompensas.
- Control reactivo a 20 FPS, adecuado para bucles de control de baja latencia.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, audio ni generación de texto.
- No dispone de modo "thinking" ni de planificación simbólica.

## Casos de uso

- Automatización de pick and place en simulación: la política ejecuta la tarea "recoger el cubo rojo y colocarlo en el cuadrado azul" sobre el robot `franka_panda_sim_hybrid_dense_rel`, sirviendo como base para pipelines de manipulación simulada antes del traslado a hardware real.
- Benchmark de referencia para aprendizaje por imitación: al tener configuración de entrenamiento y dataset públicos, permite reproducir experimentos y comparar variantes de ACT con cambios en hiperparámetros o aumentos de datos.
- Generación de datos sintéticos de manipulación: el modelo puede ejecutar rollouts en simulación para producir trayectorias adicionales que alimenten el entrenamiento de otras políticas.
- Evaluación de robustez visual: al depender de dos cámaras (cenital y muñeca), es útil para estudiar cómo afectan cambios de iluminación, oclusión o posición de cámara al éxito de la tarea.
- Docencia y formación en robótica: el flujo completo (grabar datos, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) es un ejemplo didáctico de extremo a extremo con comandos reproducibles.
- Integración en entornos de investigación con LeRobot: sirve como política de referencia para comparar con otros métodos de imitación (diffusion policy, VQ-BeT, etc.) dentro del mismo framework.
- Prototipado de control relativo: el sufijo `rel` del tipo de robot sugiere acciones relativas, útil para estudiar estabilidad del control en tareas de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en precisión fp32 el modelo ocupa aproximadamente 0,2 GB de pesos, por lo que la VRAM vendrá dominada por los buffers de las dos cámaras (2 x 3 x 240 x 320) y el estado de inferencia, no por los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre debería ser suficiente; no se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no hay confirmación oficial de modelos concretos (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: LeRobot con `lerobot-rollout` (comando documentado en la model card); también es posible cargar los pesos safetensors con PyTorch directamente.
- Latencia y throughput: no disponibles; la tasa de entrenamiento fue de 20 FPS, pero no se documenta el rendimiento de inferencia.
- Entorno: requiere el paquete `lerobot` (versión de entrenamiento 0.7.0) y acceso a las cámaras configuradas con los nombres `overhead` y `wrist`.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nberezny/act_hybobs_dense | 51,6 M | ACT (imitación) | no aplica | no disponible | Hugging Face |
| Diffusion Policy | no disponible | Política de difusión | no aplica | no disponible | Repositorios de investigación |
| VQ-BeT | no disponible | Transformer con cuantización vectorial | no aplica | no disponible | Repositorios de investigación |
| Otras políticas ACT en LeRobot Hub | variable | ACT | no aplica | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los modelos citados son referencias metodológicas del ecosistema LeRobot y no se dispone de sus especificaciones concretas en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin resultados de evaluación publicados: no hay tasas de éxito verificadas, ni en simulación ni en robot real.
- Entrenado exclusivamente en simulación (`franka_panda_sim_hybrid_dense_rel`): el traslado a un robot físico requiere verificación y probablemente reentrenamiento o ajuste fino.
- Tarea única y muy acotada: "recoger el cubo rojo y colocarlo en el cuadrado azul"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia estricta de la configuración de cámaras: los nombres `overhead` y `wrist` y las resoluciones 240x320 deben coincidir con las del entrenamiento.
- Riesgo de sobreajuste al dataset de 800 episodios y a una única semilla (1000); no se documenta validación cruzada.
- Sesgos conocidos: no documentados; en robótica, los sesgos suelen aparecer como preferencias por posiciones, colores o condiciones de iluminación presentes en los datos de teleoperación.
- Riesgo de alucinación en el sentido de acciones no válidas o fuera de distribución ante observaciones novedosas; no hay mecanismo de seguridad documentado.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no debe evaluarse como tal.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_hybobs_dense
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_hybobs_dense
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_hybobs_dense
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
