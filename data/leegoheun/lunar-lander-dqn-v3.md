# leegoheun/lunar-lander-dqn-v3

## Resumen

`lunar-lander-dqn-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Deep Q-Network (DQN) para resolver el entorno LunarLander-v3 de Gymnasium. El modelo ha sido desarrollado por el usuario leegoheun y se distribuye a través de Hugging Face Hub. Su objetivo es aprender una política de control que permita aterrizar una nave lunar simulada de forma segura y eficiente, maximizando la recompensa acumulada.

El agente utiliza una red neuronal densa de dos capas ocultas de 128 neuronas cada una, con una entrada de 8 dimensiones (posición, velocidad, ángulo y contacto de las patas) y una salida de 4 acciones discretas (motor principal, motores laterales e inactividad). Se ha entrenado durante 1500 episodios con una política de exploración epsilon-greedy que decae de 1.0 a 0.05, combinando Experience Replay y una red objetivo para estabilizar el aprendizaje. Este modelo es relevante como referencia didáctica y práctica para tareas de control continuo en entornos de simulación, aunque su alcance se limita al entorno concreto para el que fue diseñado.

La recompensa media declarada por el autor es de 200 puntos en LunarLander-v3, lo que indica que el agente es capaz de completar aterrizajes de forma consistente. No se trata de un modelo de lenguaje ni de una arquitectura multimodal, sino de una solución específica de aprendizaje por refuerzo con un ámbito de aplicación restringido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Deep Q-Network (DQN) con red neuronal feedforward de dos capas ocultas de 128 neuronas |
| Parámetros totales | no disponible (red pequeña, estimación aproximada de 18 000 parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura clásica de Deep Q-Network (DQN), propuesta por Mnih et al. (2015). La red neuronal recibe un vector de estado de 8 dimensiones correspondiente a la posición (x, y), velocidad lineal (x, y), ángulo, velocidad angular y contacto de las patas izquierda y derecha con el suelo. La salida es un vector de 4 valores Q, uno por cada acción discreta disponible en el entorno LunarLander-v3.

El entrenamiento se realizó durante 1500 episodios utilizando los siguientes hiperparámetros: tasa de aprendizaje 5e-4, factor de descuento gamma 0.99, tamaño de lote 64, buffer de experiencia de 100 000 transiciones y actualización de la red objetivo cada 4 pasos con un factor tau de 1e-3. La política de exploración epsilon-greedy parte de 1.0 y decae multiplicativamente con un factor de 0.996 hasta un mínimo de 0.05. Se emplearon Experience Replay y Target Network para estabilizar el aprendizaje, técnicas estándar en DQN.

El entrenamiento se realizó con PyTorch, y el checkpoint guardado incluye los pesos de la red Q local (`qnetwork_local`). No se indica el uso de técnicas adicionales como priorización de experiencias o dueling networks.

## Capacidades

- Control de aterrizaje lunar en el entorno LunarLander-v3 de Gymnasium: el modelo es capaz de tomar decisiones secuenciales para aterrizar una nave simulada.
- Procesamiento de estados continuos de baja dimensionalidad (8 variables) y emisión de acciones discretas (4 acciones posibles).
- Inferencia en tiempo real con baja latencia, gracias a su arquitectura ligera (menos de 20 mil parámetros).
- Reproducibilidad: el código de carga y evaluación está documentado en la model card, facilitando la reproducibilidad de los resultados.
- Integración con el ecosistema de Gymnasium y PyTorch: puede ser cargado y evaluado fácilmente con las herramientas estándar.
- No soporta tareas de lenguaje, visión ni interacción multimodal; su dominio se limita al control de sistemas simulados.

## Casos de uso

- Investigación y docencia en aprendizaje por refuerzo: el modelo sirve como ejemplo didáctico de implementación de DQN, permitiendo a estudiantes analizar el comportamiento de un agente entrenado y comparar con otros algoritmos.
- Benchmarking de algoritmos de RL: puede utilizarse como agente de referencia para evaluar mejoras en el entorno LunarLander-v3, como cambios en la función de recompensa o en la arquitectura de red.
- Desarrollo de sistemas de control autónomo: aunque limitado a simulación, el modelo demuestra la viabilidad de DQN para controlar sistemas dinámicos con espacio de estados continuo y acciones discretas, sirviendo de punto de partida para proyectos similares.
- Generación de datos de demostración: el agente puede generar trayectorias de aterrizaje exitosas que sirvan como datos para entrenar modelos de aprendizaje por imitación o para validar políticas en entornos de simulación.
- Pruebas de infraestructura de RL: al ser un modelo pequeño y rápido, es útil para verificar pipelines de entrenamiento, evaluación y despliegue de agentes de RL en entornos de producción o investigación.
- Demostraciones de integración con Gymnasium: sirve como ejemplo de cómo cargar un checkpoint desde Hugging Face Hub y ejecutarlo en un entorno estándar, útil para tutoriales y documentación técnica.

## Benchmarks y rendimiento

| Métrica | Valor | Dataset |
|---|---|---|
| Mean reward | 200.00 | LunarLander-v3 |

El valor de 200 de recompensa media es el declarado por el autor en la model card y no ha sido verificado de forma independiente. En el entorno LunarLander-v3, una recompensa de 200 puntos es el umbral para considerar que el aterrizaje se ha completado correctamente en la mayoría de las configuraciones, aunque el máximo teórico puede ser superior. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo es extremadamente ligero: la red neuronal tiene menos de 20 mil parámetros, por lo que la inferencia puede ejecutarse en CPU sin problemas.
- No se requiere GPU para evaluar el modelo; un ordenador convencional con PyTorch instalado es suficiente.
- La VRAM necesaria es despreciable (inferior a 0.1 GB incluso con overhead de PyTorch).
- El despliegue se puede realizar mediante Python y PyTorch directamente, sin necesidad de frameworks adicionales como vLLM o llama.cpp (no aplicables a este tipo de modelo).
- La latencia de inferencia es del orden de milisegundos en CPU, permitiendo ejecución en tiempo real con el entorno Gymnasium.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Al ser un modelo específico para un entorno de RL clásico, no existen alternativas públicas de referencia en Hugging Face con las mismas características. Se recomienda consultar el repositorio de Gymnasium para comparar con otros agentes de LunarLander.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno LunarLander-v3; no es generalizable a otros entornos o tareas sin reentrenamiento.
- La recompensa media de 200 está declarada por el autor y no ha sido verificada de forma independiente; puede variar en ejecuciones diferentes debido a la aleatoriedad del entorno.
- No se ha indicado la licencia del modelo, lo que puede limitar su uso comercial o en proyectos que requieran licencias claras.
- La arquitectura de red es fija (capas de 128 unidades) y no se han explorado variantes; no se incluyen técnicas avanzadas como dueling DQN o priorización de experiencias.
- El checkpoint se guarda en formato PyTorch, por lo que se requiere la instalación de PyTorch y Gymnasium para cargar y evaluar el modelo.
- El modelo no es un sistema de lenguaje ni multimodal; no debe confundirse con modelos de IA generativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/lunar-lander-dqn-v3
- Entorno LunarLander-v3 de Gymnasium: https://gymnasium.farama.org/environments/box2d/lunar_lander/
