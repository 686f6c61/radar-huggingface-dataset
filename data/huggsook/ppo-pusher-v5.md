# huggsook/ppo-pusher-v5

## Resumen

El modelo `huggsook/ppo-pusher-v5` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo Proximal Policy Optimization (PPO) mediante la librería Stable-Baselines3, sobre el entorno Gymnasium Pusher-v5 de MuJoCo. El entorno consiste en un brazo robótico de 7 grados de libertad que debe empujar un cilindro (objeto) hasta una posición objetivo usando su extremo (fingertip). El autor, huggsook, ha publicado además un visualizador web interactivo en 3D basado en Three.js que permite explorar el comportamiento del agente en tiempo real, manipular la posición del objetivo o del objeto, y observar la evolución del entrenamiento a través de checkpoints en los pasos 0, 10 000, 25 000 y 50 000.

Este modelo no es un modelo de lenguaje ni de visión; se trata de un policy network de RL para control continuo. Su relevancia radica en que ofrece una herramienta educativa y de prototipado para quienes estudian algoritmos de control robótico, permitiendo visualizar la convergencia de recompensas, las pérdidas de policy y value, y exportar los pesos entrenados junto con los scripts de entrenamiento. La licencia MIT facilita su uso comercial y académico sin restricciones significativas.

No se dispone de información pública sobre la arquitectura interna de la red neuronal (número de capas, neuronas, funciones de activación), el número total de parámetros, ni detalles del proceso de entrenamiento más allá de los checkpoints mencionados. Tampoco se han publicado resultados de benchmarks comparativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de policy para control continuo (detalles no disponibles) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entorno de simulacion, no procesamiento de secuencias) |
| Tipos de cuantizacion | No aplica (no es un modelo de lenguaje) |
| Idiomas soportados | No disponible (la interfaz web esta en ingles) |
| Licencia | MIT |
| Formato de pesos | No especificado (probablemente .zip con pesos de PyTorch, segun la funcionalidad de exportacion) |

## Arquitectura y entrenamiento

El agente se basa en el algoritmo PPO (Proximal Policy Optimization) implementado en Stable-Baselines3, una librería estándar para RL en Python. PPO es un método on-policy que optimiza una política mediante recortes de la razón de probabilidad, combinando estabilidad y eficiencia de muestra. El entorno de entrenamiento es Pusher-v5 de Gymnasium, que utiliza MuJoCo como motor de física. El objetivo es mover el objeto (cilindro) hasta una posición meta usando el extremo del brazo, con un espacio de acción continuo de 7 dimensiones (torques de las articulaciones) y observaciones que incluyen posiciones y velocidades de las articulaciones, así como la posición del objeto y del objetivo.

No se han publicado detalles sobre la arquitectura de la red (por ejemplo, si es un MLP de 2 o 3 capas, tamaño de las capas ocultas, funciones de activación), ni sobre el número de episodios, la tasa de aprendizaje, el tamaño del batch o el uso de normalización de observaciones. La model card menciona checkpoints en los pasos 0, 10 000, 25 000 y 50 000, lo que sugiere un entrenamiento incremental con guardado periódico de pesos. Tampoco se indica si se aplicaron técnicas adicionales como reward shaping o curriculum learning.

## Capacidades

- Control de un brazo robótico de 7 DOF en el entorno Pusher-v5 para empujar un objeto hasta una posición objetivo.
- Visualización 3D interactiva en tiempo real mediante Three.js, con cinemática inversa, colisiones físicas y trazado de trayectorias.
- Manipulación interactiva: el usuario puede arrastrar el objetivo o el objeto con el ratón para probar la adaptabilidad del agente en tiempo real.
- Checkpoints de entrenamiento: permite alternar entre el agente sin entrenar (paso 0), novato (10k), intermedio (25k) y maestro (50k) para observar la evolución del comportamiento.
- Telemetría en vivo con Chart.js: muestra la curva de convergencia de recompensas y la dinámica de pérdidas de policy y value.
- Exportación de un paquete comprimido (.zip) con los pesos del modelo entrenado, los scripts de entrenamiento en PyTorch y los registros de telemetría.

## Casos de uso

- Educación en aprendizaje por refuerzo: el visualizador 3D permite a estudiantes de robótica o RL comprender cómo un agente aprende a controlar un brazo articulado, comparando el comportamiento en distintos checkpoints de entrenamiento.
- Investigación en control de manipuladores: sirve como banco de pruebas para evaluar la robustez de PPO en tareas de empuje con contacto físico, y para experimentar con modificaciones del entorno o de la recompensa.
- Demostración de algoritmos de RL en entornos continuos: útil para presentaciones o talleres donde se necesita una demostración visual e interactiva de PPO sin requerir infraestructura de entrenamiento.
- Prototipado de sistemas de control: los pesos exportados pueden integrarse en pipelines de simulación más amplios (por ejemplo, ROS + Gazebo) para probar el policy en escenarios adicionales.
- Análisis de curvas de aprendizaje: la telemetría integrada permite estudiar la convergencia de recompensas y las pérdidas, útil para depurar hiperparámetros o comparar variantes de PPO.
- Desarrollo de interfaces de visualización para RL: el proyecto puede servir como referencia para construir dashboards interactivos de otros entornos de Gymnasium o MuJoCo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas cuantitativas como recompensa media por episodio, tasa de éxito en la tarea de empuje, ni comparaciones con otros agentes (por ejemplo, SAC, TD3 o HD-PPO) en el mismo entorno.

## Requisitos de hardware

- La herramienta de visualización es una aplicación web estática (sdk: static), por lo que se ejecuta en el navegador sin necesidad de GPU ni de un servidor dedicado. Solo se requiere un navegador moderno con soporte para WebGL (Three.js).
- Para el entrenamiento del agente (si se desea reproducir o extender), se necesitaría una máquina con CPU y, opcionalmente, GPU para acelerar las operaciones de red neuronal. No se especifican requisitos mínimos en la documentación.
- El modelo en sí, al ser un policy network pequeño (típicamente un MLP de pocas capas), puede ejecutarse en cualquier CPU moderna para inferencia en tiempo real dentro del navegador.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, etc.) porque no es un modelo de lenguaje; la inferencia se realiza mediante el código JavaScript incluido en la aplicación web.

## Comparativa con modelos similares

| Modelo | Enfoque | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| huggsook/ppo-pusher-v5 | PPO estándar (Stable-Baselines3) | Pusher-v5 | MIT | HuggingFace |
| LTU-AI/hdppo-Pusher-v5 | HD-PPO (hyperdimensional computing + PPO) | Pusher-v5 | No especificada | HuggingFace |
| hwihwalab/pusher-v5-ppo | PPO con telemetría avanzada | Pusher-v5 | No especificada | HuggingFace + GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia del modelo de huggsook es su visualizador 3D interactivo y la funcionalidad de exportación de pesos, mientras que LTU-AI explora una variante con hiperdimensional computing y hwihwalab se centra en un "cockpit de telemetría" para ingeniería. No hay información sobre el rendimiento relativo en términos de recompensa o éxito en la tarea.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de visión; no puede procesar texto, imágenes ni audio. Su única función es el control del brazo robótico en el entorno Pusher-v5.
- El agente está entrenado específicamente para el entorno Pusher-v5; no se ha demostrado generalización a otros entornos o tareas de manipulación.
- No se han publicado detalles sobre la robustez del policy ante perturbaciones, cambios en la dinámica o condiciones iniciales variadas.
- La visualización 3D depende de WebGL; en navegadores o dispositivos sin soporte, la herramienta puede no funcionar correctamente.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento del modelo en aplicaciones de producción.
- No se dispone de información sobre sesgos o alucinaciones, ya que no es un modelo generativo de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huggsook/ppo-pusher-v5
- Modelo similar LTU-AI/hdppo-Pusher-v5: https://huggingface.co/LTU-AI/hdppo-Pusher-v5
- Modelo similar hwihwalab/pusher-v5-ppo: https://huggingface.co/hwihwalab/pusher-v5-ppo
- Repositorio GitHub de hwihwalab: https://github.com/Hwihwa-Lab/pusher-v5-ppo
- Documentación del entorno Pusher en Gymnasium: https://gymnasium.farama.org/environments/mujoco/pusher/
- Notebook de entrenamiento PPO para Pusher-v5 (Berkeley): https://militzer.berkeley.edu/EPS109/final_projects_2025/024/final_project_demo.ipynb
