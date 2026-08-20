# artnfull/connect-ai-artnfull-lunarlander

## Resumen

El modelo `artnfull/connect-ai-artnfull-lunarlander` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con una arquitectura Dueling Deep Q-Network (DQN) para resolver el entorno `LunarLander-v3` de Gymnasium. Desarrollado por el usuario artnfull, el agente aprende a controlar una nave lunar para que aterrice de forma estable y segura, maximizando la recompensa acumulada. Se trata de un ejemplo práctico de aplicación de técnicas de RL como Double DQN, dueling architecture, experiencia replay y actualización suave de la red objetivo.

El modelo es relevante porque demuestra cómo un agente relativamente pequeño (una red neuronal feedforward con capas ocultas de 128 y 64 neuronas) puede alcanzar una recompensa media de 200 sobre 100 episodios, el valor máximo posible en este entorno. Aunque no es un modelo de lenguaje ni de visión, su interés radica en su uso como referencia educativa y como punto de partida para experimentos de RL. La licencia MIT permite su uso libre, incluso comercial, y los pesos están disponibles en formato PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling DQN (red neuronal feedforward con ramas de valor y ventaja) |
| Parametros totales | no disponible (red pequeña, no declarado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de RL, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32, sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de control, aunque la documentación está en inglés y coreano) |
| Licencia | MIT |
| Formato de pesos | PyTorch (state_dict, archivo .pth) |

## Arquitectura y entrenamiento

El agente utiliza una arquitectura Dueling DQN, que separa la estimación del valor de estado \(V(s)\) y la ventaja de cada acción \(A(s,a)\). La red se compone de una capa de características compartida (8 entradas → 128 → 128, con ReLU) y dos ramas: una para el valor (128 → 64 → 1) y otra para la ventaja (128 → 64 → 4). La salida final combina ambas ramas mediante la fórmula \(V(s) + A(s,a) - \text{mean}(A(s,a))\).

El entrenamiento se realizó durante 1.000 episodios en el entorno `LunarLander-v3`, con una política de exploración epsilon que decae exponencialmente desde 1.0 hasta 0.05 (factor de decaimiento 0.997). Se empleó el optimizador AdamW (amsgrad=True) con una tasa de aprendizaje de 5e-4, función de pérdida Smooth L1 (Huber), factor de descuento gamma de 0.99, actualización suave de la red objetivo con tau=0.001, un buffer de experiencia de 100.000 transiciones y un tamaño de lote de 64. No se menciona el uso de técnicas adicionales como recompensas con forma (reward shaping) ni normalización de observaciones.

## Capacidades

- Control de aterrizaje en el entorno LunarLander-v3: el agente decide entre cuatro acciones discretas (no hacer nada, encender motor principal, orientarse a la izquierda o a la derecha) basándose en un vector de observación de 8 dimensiones (posición, velocidad, ángulo, contacto con el suelo, etc.).
- Toma de decisiones en tiempo real: la red es lo suficientemente pequeña para ejecutarse en CPU con latencia mínima, lo que permite su uso en simulaciones interactivas.
- Aprendizaje por refuerzo off-policy: gracias al buffer de experiencia y a la red objetivo, el agente puede aprender de transiciones pasadas de forma estable.
- No es un modelo de lenguaje: no genera texto, no comprende instrucciones en lenguaje natural ni soporta tool calling o agentes conversacionales.
- No tiene capacidades multimodales: no procesa imágenes ni audio; su entrada es exclusivamente el vector de estado del entorno.

## Casos de uso

- Demostración educativa de DQN y Dueling DQN: el modelo sirve como ejemplo funcional para estudiantes e investigadores que quieran entender cómo funciona el aprendizaje por refuerzo con redes neuronales. Se puede cargar y ejecutar en pocas líneas de código, como se muestra en la model card.
- Benchmark de algoritmos de RL: al alcanzar una recompensa media de 200 en LunarLander-v3, puede utilizarse como referencia para comparar otras arquitecturas o hiperparámetros en el mismo entorno.
- Base para experimentos de transferencia: los pesos preentrenados pueden servir como inicialización para tareas similares de control continuo o para estudiar la generalización entre variantes del entorno (por ejemplo, LunarLander-v2 o versiones con dinámica modificada).
- Simulación de control de vehículos: aunque el entorno es simplificado, el agente demuestra principios de control de aterrizaje que pueden extrapolarse a problemas de control de drones o naves en simuladores más complejos.
- Investigación en exploración y explotación: el esquema de decaimiento de epsilon y el uso de Double DQN pueden analizarse sobre este modelo para estudiar el equilibrio entre exploración y explotación en entornos con recompensas escasas.
- Integración en pipelines de RL: el modelo puede incorporarse en flujos de entrenamiento distribuido o en sistemas de evaluación automática de políticas, gracias a su formato PyTorch estándar y su licencia permisiva.

## Benchmarks y rendimiento

El autor declara en la model card un resultado de recompensa media de 200 sobre 100 episodios en el entorno `LunarLander-v3`. Este valor corresponde al máximo alcanzable en el entorno, lo que indica que el agente ha aprendido una política óptima o casi óptima. Sin embargo, el resultado no está verificado de forma independiente.

| Benchmark | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| LunarLander-v3-Dueling-DQN | LunarLander-v3 | Mean Reward (100 episodios) | 200.0 | No |

No se dispone de comparaciones con otros agentes en el mismo entorno dentro de la información proporcionada.

## Requisitos de hardware

- El modelo es extremadamente ligero: la red neuronal tiene solo unas pocas miles de parámetros (no declarados, pero estimables en torno a 20.000-30.000). Puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- VRAM: no requiere VRAM dedicada; si se usa CUDA, el consumo es despreciable (menos de 100 MB).
- GPU recomendada: ninguna en particular; una CPU es suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, cualquier GPU NVIDIA con soporte CUDA puede ejecutarlo, pero no es necesario.
- Opciones de despliegue: se puede cargar con PyTorch estándar y ejecutar dentro de un entorno Gymnasium. También es posible exportar los pesos a otros formatos (por ejemplo, ONNX) para su integración en otros frameworks.
- Latencia y throughput: al ser una red tan pequeña, la inferencia es del orden de microsegundos en CPU, permitiendo cientos de decisiones por segundo.

## Comparativa con modelos similares

No se dispone de información sobre otros agentes de RL para LunarLander publicados por el mismo autor o por terceros en la documentación proporcionada. Por tanto, no es posible realizar una comparativa cuantitativa con alternativas. Se recomienda consultar el leaderboard de Gymnasium o repositorios de RL para encontrar agentes comparables, aunque no se dispone de datos concretos en esta ficha.

## Limitaciones y advertencias

- El agente está entrenado exclusivamente para el entorno LunarLander-v3; no generaliza a otros entornos ni a variaciones con dinámica distinta sin reentrenamiento.
- La recompensa media de 200 es declarada por el autor y no ha sido verificada de forma independiente; podría variar con la semilla aleatoria o la versión del entorno.
- El modelo no procesa lenguaje natural ni imágenes; cualquier intento de usarlo como un modelo de IA conversacional o multimodal es inválido.
- La documentación está en coreano e inglés, lo que puede suponer una barrera para usuarios hispanohablantes, aunque el código de ejemplo es autodidacta.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la ausencia de sesgos en el comportamiento del agente.
- Al ser un modelo de RL, su comportamiento depende de la aleatoriedad del entorno; en episodios individuales puede fallar a pesar de la recompensa media alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artnfull/connect-ai-artnfull-lunarlander
- Perfil del autor en Hugging Face: https://huggingface.co/artnfull
- Repositorio de modelos del autor: https://huggingface.co/artnfull/models
- Perfil de GitHub del autor (artnfull-bot): https://github.com/artnfull-bot

No se han encontrado papers, blogs o demos adicionales asociados a este modelo específico.
