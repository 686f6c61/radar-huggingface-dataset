# hwihwalab/lunarlander-v3-d3qn

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con el algoritmo Dueling Double Deep Q-Network (D3QN) para resolver el entorno LunarLander-v3 de Gymnasium. Desarrollado por el usuario hwihwalab, el agente controla un módulo de aterrizaje con el objetivo de posarse de forma segura en una plataforma designada, gestionando cuatro acciones discretas (motor principal, thruster izquierdo, thruster derecho e inactividad). La arquitectura emplea streams separados de valor de estado y ventaja por acción, con una red de 8 entradas, dos capas ocultas de 128 neuronas con normalización de capa y una capa de salida de 4 unidades. El modelo alcanza una recompensa media de evaluación de 200 o más, umbral considerado como "resuelto" en este entorno. Su relevancia radica en ser un ejemplo práctico de cómo combinar Double DQN y Dueling DQN con reward shaping personalizado para estabilizar el entrenamiento en tareas de control continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double DQN (D3QN) con streams de valor y ventaja separados (8→128→128→64→4) |
| Parametros totales | no disponible (red pequeña, no se especifica el número exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control, observación de 8 dimensiones) |
| Tipos de cuantizacion | no aplica (pesos en FP32) |
| Idiomas soportados | no aplica (agente de control) |
| Licencia | no disponible |
| Formato de pesos | PyTorch .pth |

## Arquitectura y entrenamiento

La red neuronal del agente sigue el esquema Dueling DQN: una capa de entrada de 8 neuronas (coordenadas X e Y, velocidades lineales Vx y Vy, ángulo de pitch, velocidad angular, y contacto de las patas izquierda y derecha), dos capas ocultas de 128 unidades con LayerNorm y activación ReLU, y dos ramas separadas: una para el valor de estado (64→1) y otra para las ventajas por acción (64→4). La salida combina el valor con las ventajas restando la media de estas últimas, lo que mejora la estabilidad del aprendizaje. El entrenamiento utiliza Double DQN para mitigar la sobreestimación de los valores Q, con actualizaciones suaves del target network (tau = 0.001), un buffer de experiencia de 100 000 transiciones, batch size de 64, learning rate de 5e-4 con optimizador AdamW, pérdida Huber (Smooth L1) y gradient clipping. Además, se aplica un reward shaping personalizado que estabiliza el ángulo de pitch, amortigua la velocidad de touchdown y recompensa el aterrizaje en el centro de la plataforma. La exploración sigue un esquema epsilon-greedy que decae de 1.0 a 0.05 durante el entrenamiento.

## Capacidades

- Control autónomo de aterrizaje en el entorno LunarLander-v3 de Gymnasium.
- Toma de decisiones en tiempo real basada en observaciones continuas de 8 dimensiones.
- Manejo de un espacio de acciones discreto con 4 acciones (inactividad, thruster izquierdo, motor principal, thruster derecho).
- Aprendizaje por refuerzo con exploración epsilon-greedy y actualización de red target mediante soft updates.
- No dispone de capacidades de lenguaje natural, visión, generación de texto ni tool calling.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como implementación de referencia para estudiar el comportamiento de D3QN en un entorno de control continuo, permitiendo analizar la separación de valor y ventaja.
- Benchmarking de algoritmos: puede utilizarse como baseline para comparar el rendimiento de otras variantes de DQN (DQN estándar, Double DQN, Dueling DQN) en el mismo entorno.
- Educación en RL: adecuado para demostrar conceptos como replay buffer, target networks, Double DQN y Dueling DQN en un entorno visual e interactivo.
- Evaluación de reward shaping: permite experimentar con diferentes funciones de recompensa personalizadas y observar su impacto en la convergencia y la calidad del aterrizaje.
- Pruebas de robustez: al ser un agente entrenado, puede someterse a perturbaciones en las observaciones o en la dinámica del entorno para evaluar su tolerancia a variaciones.
- Integración en pipelines de evaluación de agentes RL: puede cargarse fácilmente con PyTorch y Gymnasium para reproducir episodios de evaluación y registrar métricas de rendimiento.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado, no verificado de forma independiente:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | Gymnasium LunarLander-v3 | Mean Evaluation Reward | 200.0+ (Solved) |

No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- No requiere GPU; puede ejecutarse en CPU sin problemas, dado el reducido tamaño de la red neuronal.
- Memoria RAM mínima (menos de 1 GB) para cargar el modelo y ejecutar el entorno.
- Compatible con cualquier máquina que tenga instalados Python, PyTorch y Gymnasium.
- No se han publicado datos de latencia o throughput, pero al ser una red de pocas capas, la inferencia es prácticamente instantánea en hardware moderno.
- Opciones de despliegue: se puede ejecutar directamente con el código proporcionado en la model card, o integrarse en scripts de evaluación personalizados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros agentes DQN para LunarLander-v3 en la información proporcionada. Existen repositorios similares en Hugging Face, como `allen73/lunarlander-v3-dqn-physical-ai`, pero no se han encontrado métricas comparables publicadas. Por tanto, no es posible realizar una comparativa cuantitativa en este momento.

## Limitaciones y advertencias

- El agente está entrenado exclusivamente para el entorno LunarLander-v3 y no es generalizable a otros entornos o tareas de control.
- No posee capacidades de procesamiento de lenguaje, visión ni interacción con herramientas.
- La licencia del modelo no está especificada, por lo que su uso comercial es incierto y requiere consultar al autor.
- El resultado de recompensa media (200.0+) no ha sido verificado de forma independiente; se basa en la declaración del autor.
- El rendimiento puede degradarse si se modifica la versión de Gymnasium o los parámetros del entorno (por ejemplo, gravedad o fricción).
- Al ser un modelo de RL, su comportamiento depende de la semilla aleatoria y de las condiciones iniciales del entorno; puede requerir varios episodios para observar un rendimiento consistente.

## Enlaces

- [Hugging Face: hwihwalab/lunarlander-v3-d3qn](https://huggingface.co/hwihwalab/lunarlander-v3-d3qn)
