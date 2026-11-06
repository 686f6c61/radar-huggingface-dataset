# Muhammad241198/act_M12_toolrem_30

## Resumen

`act_M12_toolrem_30` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), publicada por el usuario Muhammad241198 en Hugging Face y entrenada con la librería LeRobot de Hugging Face. El modelo no es un LLM ni un modelo de lenguaje: es un controlador visomotor que aprende a predecir secuencias cortas de acciones (chunks) a partir de observaciones visuales y del estado del robot, y está pensado para ejecutar tareas de manipulación sobre un brazo robótico de tipo SO-100.

El modelo resuelve el problema clásico de la imitación paso a paso: en lugar de predecir una única acción por fotograma (lo que amplifica el error acumulado y produce movimientos temblorosos), ACT predice un horizonte de acciones de forma conjunta, lo que da lugar a trayectorias más suaves y robustas. Está entrenado sobre el dataset `rbtrprjkt/m12-nut-tool_unfasten_nodepth`, orientado a la tarea de desatornillar o retirar una herramienta o tuerca, y no incluye información de profundidad (de ahí el sufijo `nodepth`).

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas open source con licencia Apache 2.0. Su tamaño (51,6 millones de parámetros) y su formato safetensors lo hacen ligero y desplegable en hardware modesto, aunque su ámbito de aplicación es muy específico: la tarea concreta para la que fue entrenado y la morfología del robot con el que se recogieron los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.613.319 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observación de la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo visomotor, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, libreria lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (típicamente ResNet preentrenado) con un transformer encoder-decoder que genera un chunk de acciones futuras a partir de las observaciones actuales. La innovación central es la predicción conjunta de un horizonte de acciones con un mecanismo de *temporal ensembling* que suaviza las transiciones entre chunks consecutivos durante la inferencia. El modelo cuenta con 51,6 millones de parámetros y se distribuye en safetensors dentro del ecosistema LeRobot.

El entrenamiento se realizó sobre el dataset `rbtrprjkt/m12-nut-tool_unfasten_nodepth`, compuesto por demostraciones teleoperadas de la tarea de retirada/desatornillado de una herramienta o tuerca. El sufijo `nodepth` indica que las observaciones no incluyen mapas de profundidad, por lo que la política depende exclusivamente de imágenes RGB y del estado de las articulaciones. No se dispone de información sobre el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización adicionales más allá de las del entrenamiento estándar de LeRobot.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de articulaciones a partir de imágenes RGB y del estado del robot.
- Predicción de chunks de acciones con horizonte fijo, lo que produce trayectorias más suaves que la imitación paso a paso.
- Ejecución de una tarea concreta de desatornillado o retirada de herramienta/tuerca sobre un brazo SO-100 follower.
- Integración nativa con LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de agente en el sentido de los LLM.
- No soporta lenguaje natural, visión general, audio ni matemáticas: su espacio de entrada y salida es estrictamente robótico.
- No es multilingüe ni procesa texto.

## Casos de uso

- Automatización de una célula de montaje con SO-100: la política ejecuta la secuencia de desatornillado aprendida de las demostraciones teleoperadas, adecuada porque el modelo fue entrenado exactamente para esa tarea y morfología.
- Prototipado rápido de políticas de imitación: sirve como referencia y punto de partida para comparar variantes de ACT sobre el mismo dataset, gracias a su tamaño reducido y a la integración con LeRobot.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de ACT sin profundidad y medir el impacto de eliminar el canal de depth en la tasa de éxito.
- Evaluación de robustez ante variaciones de iluminación o posición inicial: al ser un modelo ligero, se puede desplegar en bucles de evaluación con múltiples episodios (`--episodes=10`) y recoger estadísticas de éxito.
- Formación y docencia en robótica open source: el modelo y su pipeline de entrenamiento son un ejemplo completo y reproducible de un flujo LeRobot de extremo a extremo.
- Base para *fine-tuning* en tareas similares de manipulación con el mismo robot: al compartir arquitectura y formato con otras políticas ACT de LeRobot, se puede reentrenar con un dataset propio de desatornillado o ensamblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 millones de parámetros en safetensors (repo de 0,2 GB), la huella en memoria es del orden de cientos de MB, muy por debajo de una GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA capaz de ejecutar PyTorch; el flujo de entrenamiento de LeRobot usa `--policy.device=cuda`. Para entrenamiento se recomienda al menos una RTX 3090/4090 o superior; para inferencia, una GPU modesta es suficiente.
- Cabe en GPU consumer: sí, con amplio margen, incluidas GPUs de gama media con suficiente VRAM para el codificador visual y el transformer.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_M12_toolrem_30 | 51,6 M | no aplica | Desatornillado/retirada de herramienta con SO-100 | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT de LeRobot | variable | no aplica | Manipulación genérica teleoperada | Apache 2.0 (segun repo) | Hugging Face |
| Diffusion Policy (referencia del ecosistema LeRobot) | variable | no aplica | Manipulación visomotora | segun implementacion | Repos de investigación |
| RT-1 / RT-2 (modelos robóticos de gran escala) | cientos de M a miles de M | no aplica | Manipulación multi-tarea | no abierta en su mayoria | No disponibles como pesos abiertos comparables |

La comparación directa con RT-1/RT-2 no es homogénea: aquellos son modelos multi-tarea de gran escala, mientras que este es una política especializada de 51,6 M de parámetros entrenada para una única tarea.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea y un robot concretos (SO-100 follower); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Dependencia de la distribución de entrenamiento: cambios en iluminación, posición de la cámara, fondo o colocación inicial del objeto pueden degradar la tasa de éxito.
- Ausencia de profundidad: al usar el dataset `nodepth`, la política pierde información 3D que puede ser crítica en tareas de precisión como el desatornillado.
- Riesgo de sobreajuste a las demostraciones teleoperadas: con un número limitado de episodios, la política puede memorizar trayectorias en lugar de generalizar.
- Sin benchmarks publicados: no hay métricas de éxito verificables en la información disponible, por lo que la evaluación en producción debe hacerse empíricamente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento ni sobre la seguridad física del despliegue.
- Advertencia de seguridad física: cualquier despliegue en un robot real debe incluir límites de par, paradas de emergencia y supervisión, dado que el modelo no incorpora mecanismos de seguridad propios.
- Sin soporte de lenguaje ni de instrucciones en texto: no puede reutilizarse como agente conversacional ni como modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammad241198/act_M12_toolrem_30
- Paper de ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/rbtrprjkt/m12-nut-tool_unfasten_nodepth
