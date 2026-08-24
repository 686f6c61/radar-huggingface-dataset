# artnfull/connect-ai-artnfull-lerobot-so100-ppo

## Resumen

El modelo `connect-ai-artnfull-lerobot-so100-ppo` es una política de aprendizaje por refuerzo (RL) y clonación de comportamiento desarrollada por Connect AI Artnfull para el brazo robótico de 6 grados de libertad SO-ARM100 / SO-101, dentro del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea de manipulación sobre mesa: clasificación autónoma de cubos de colores (rojo, verde y azul) con precisión sub-milimétrica, así como tareas de pick-and-place de precisión sobre anillos objetivo.

La política se entrenó mediante un esquema progresivo de tres etapas (exploración, dominio del agarre y clasificación de precisión) y se distribuye bajo licencia Apache-2.0. Aunque el repositorio no publica arquitectura de red detallada ni parámetros, sí especifica el espacio de observación (14 dimensiones: ángulos articulares, velocidades, posición del efector final y del objeto) y el espacio de acción continuo de 6 dimensiones. El modelo incluye un simulador 3D interactivo accesible desde el navegador, lo que facilita su evaluación sin hardware físico.

Es relevante porque demuestra la viabilidad de entrenar políticas de manipulación robótica con RL en un brazo de bajo coste y código abierto, con métricas verificables de éxito y recompensa media, y porque se integra directamente con el framework LeRobot, que busca democratizar la robótica con IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL, red neuronal no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (tarea de control robótico, no procesamiento de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se menciona un archivo `policy_weights.json` como ejemplo de carga, pero no se detalla el formato real de los pesos) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna de la red (número de capas, tipo de red, etc.). Se sabe que es una política de aprendizaje por refuerzo entrenada con PPO (según el nombre del repositorio y el pipeline declarado). El espacio de observación es un vector continuo de 14 dimensiones que incluye ángulos articulares, velocidades, posición del efector final y posición del objeto. El espacio de acción es continuo de 6 dimensiones en el rango [-1, 1], correspondiente a los 6 grados de libertad del brazo (pan, lift, elbow, wrist, roll y apertura del gripper).

El entrenamiento se realizó en tres etapas progresivas:
1. **Exploración**: acciones aleatorias con ruido al 100% para descubrir movimientos básicos.
2. **Dominio del agarre**: se logra contacto físico y trayectorias de elevación (recompensa +45.0).
3. **Clasificación de precisión**: alineación óptima de cinemática inversa con despeje completo de la superficie de la mesa (recompensa +105.0, éxito 98.4%).

No se especifica el número de episodios, el tamaño del dataset de demostraciones (aunque se menciona "LeRobot SO100 Demonstration Dataset v2.0") ni si se usó RLHF o DPO (no aplica en este contexto). La librería utilizada es LeRobot, y el modelo se etiqueta con `imitation-learning` y `reinforcement-learning`, lo que sugiere un entrenamiento híbrido.

## Capacidades

- **Clasificación autónoma de cubos de colores**: el modelo es capaz de identificar, agarrar y clasificar cubos rojos, verdes y azules sobre una mesa, colocándolos en anillos objetivo con precisión sub-milimétrica (menor a 0.1 mm de error de agarre).
- **Pick-and-place de precisión**: puede realizar tareas de recogida y colocación sobre anillos en la mesa, con contacto controlado a una altura de 1.4 cm sobre la superficie.
- **Control de brazo robótico de 6 DOF**: genera acciones continuas de posición y velocidad para las articulaciones del SO-ARM100 / SO-101, incluyendo el gripper.
- **Simulación 3D interactiva**: se incluye un espacio de Hugging Face que permite probar el modelo en un simulador 3D en el navegador, sin necesidad de hardware físico.
- **Integración con LeRobot**: compatible con el framework LeRobot, lo que facilita su uso en pipelines de entrenamiento y evaluación de robótica.
- **Capacidad de generalización limitada**: el modelo está especializado en la tarea de clasificación de cubos y pick-and-place; no es un modelo multimodal ni de lenguaje.

## Casos de uso

- **Automatización de clasificación en líneas de producción**: el modelo puede integrarse en celdas robóticas para separar piezas por color o forma, reduciendo el tiempo de ciclo y mejorando la precisión frente a sistemas de visión tradicionales. Su alta tasa de éxito (98.4%) lo hace adecuado para entornos controlados.
- **Investigación en aprendizaje por refuerzo para robótica**: sirve como punto de partida para estudiar estrategias de exploración, recompensas densas y transferencia de políticas en brazos de bajo coste. Los investigadores pueden analizar las tres etapas de entrenamiento y adaptarlas a otras tareas.
- **Educación y formación en robótica**: al ser un modelo abierto con simulador 3D, permite a estudiantes y aficionados experimentar con control robótico sin necesidad de adquirir hardware. El espacio de simulación facilita la visualización de las acciones del modelo.
- **Prototipado rápido de soluciones de manipulación**: empresas o desarrolladores pueden evaluar la viabilidad de la clasificación por color en sus propios escenarios usando el simulador antes de invertir en hardware físico.
- **Benchmark para comparación de algoritmos de RL**: el modelo y sus métricas (reward medio 105, éxito 98.4%) pueden utilizarse como referencia para comparar nuevos algoritmos de RL en tareas de manipulación con SO-ARM100.
- **Despliegue en brazos robóticos de código abierto**: el modelo está diseñado para el SO-ARM100, un brazo imprimible en 3D y de bajo coste, por lo que puede desplegarse en laboratorios o makerspaces para automatizar tareas repetitivas de clasificación.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index de Hugging Face (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Tabletop Multi-Cube Color Sorting (SO-ARM100) | LeRobot SO100 Demonstration Dataset v2.0 | Mean Evaluation Reward | 105.0 |
| Tabletop Multi-Cube Color Sorting (SO-ARM100) | LeRobot SO100 Demonstration Dataset v2.0 | Color Sorting Success Rate (%) | 98.4 |

Adicionalmente, la model card incluye una tabla con resultados de una tarea de pick-and-place de precisión (recompensa media +85.0, éxito 99.1%), pero estos valores no aparecen en el model-index oficial, por lo que deben considerarse como declaraciones del autor sin verificación formal.

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser una política de control robótico con observaciones de baja dimensión (14 valores), el modelo es extremadamente ligero en comparación con modelos de lenguaje o visión. Es probable que pueda ejecutarse en CPU sin problema.
- **GPU recomendada**: no especificada. Para la simulación 3D interactiva, se requiere un navegador moderno con soporte WebGL; el espacio de Hugging Face se encarga de la ejecución en servidores de HF.
- **Compatibilidad con hardware de consumo**: sí, cualquier ordenador con navegador puede ejecutar el simulador. Para el despliegue en el brazo físico, se necesita un SO-ARM100 ensamblado y una placa de control compatible (por ejemplo, una placa con firmware LeRobot).
- **Opciones de despliegue**: el modelo se integra con LeRobot (PyTorch). Se puede cargar la política en un entorno de simulación o en el robot real mediante el framework LeRobot. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. En simulación, la latencia depende del navegador y del servidor de HF; en el robot real, dependerá del ciclo de control de LeRobot (típicamente 10-30 Hz).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de RL para SO-ARM100 con clasificación de cubos). El ecosistema LeRobot incluye otros modelos entrenados para SO-100/SO-101, pero no se proporcionan datos concretos en la información disponible. Por tanto, la comparativa se declara como no disponible.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está entrenado exclusivamente para la tarea de clasificación de cubos de colores y pick-and-place sobre mesa. No generaliza a otras tareas de manipulación sin reentrenamiento.
- **Dependencia del hardware**: está diseñado para el brazo SO-ARM100 / SO-101 específicamente. Usarlo en otro robot requeriría adaptar el espacio de observación y acción.
- **Riesgo de sobreajuste**: las métricas declaradas (98.4% de éxito) podrían estar sobreajustadas al entorno de simulación o al dataset de demostraciones; no hay evidencia de validación en el mundo real.
- **Sesgos y alucinación**: no aplica, al no ser un modelo de lenguaje. Sin embargo, en robótica, el equivalente a la alucinación es la ejecución de movimientos inseguros o erráticos si el modelo se encuentra con estados fuera de la distribución de entrenamiento.
- **Licencia**: Apache-2.0 permite uso comercial, modificación y redistribución, pero se recomienda revisar los términos de las dependencias (LeRobot, SO-ARM100).
- **Falta de documentación técnica**: no se detalla la arquitectura de red, el número de parámetros ni los hiperparámetros de entrenamiento, lo que dificulta la reproducibilidad y el análisis científico riguroso.
- **Formato de pesos no estándar**: el repositorio no aclara el formato real de los pesos (por ejemplo, safetensors, PyTorch .pt). El ejemplo de carga usa un JSON, lo que sugiere que podría ser una representación ligera, pero no se confirma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artnfull/connect-ai-artnfull-lerobot-so100-ppo
- Simulador 3D interactivo: https://huggingface.co/spaces/artnfull/connect-ai-artnfull-lerobot-so100-3d-simulator
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
- Tutorial de ensamblaje SO-101: https://huggingface.co/docs/lerobot/so101
