# lookarooka/LunarLander-v3-DQN

## Resumen

El modelo `lookarooka/LunarLander-v3-DQN` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con una arquitectura **Dueling Double Deep Q-Network (DQN)** para resolver el entorno `LunarLander-v3` de Gymnasium. Desarrollado por el usuario `lookarooka`, este agente es capaz de realizar aterrizajes autónomos del módulo lunar con una recompensa media superior a 200 puntos, el umbral considerado como solucionado en este entorno de control clásico basado en Box2D.

El modelo se distribuye como un conjunto de pesos de red neuronal en formato PyTorch, junto con el código necesario para cargarlo y ejecutarlo. A diferencia de los modelos de lenguaje, este no procesa texto, sino un vector de estado continuo de 8 dimensiones que describe la posición, velocidad, ángulo y contacto de las patas del lander, y produce una acción discreta entre cuatro posibles (no operar, propulsor izquierdo, propulsor principal, propulsor derecho). Su relevancia radica en ser un ejemplo práctico y compacto de aplicación de técnicas de RL como Dueling DQN y Double DQN a un problema de control continuo.

El repositorio incluye además una referencia a una plataforma de control de misión web en tiempo real (LUNAR-LANDER-DQN), lo que sugiere un uso didáctico y de demostración. Es un modelo ligero, con menos de 40.000 parámetros, que puede ejecutarse en CPU sin necesidad de hardware especializado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double DQN (red feedforward con streams de valor y ventaja) |
| Parametros totales | No disponible (estimado ~34.500 según la arquitectura descrita) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada: vector de estado de 8 dimensiones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo implementa una variante del algoritmo DQN que combina dos mejoras conocidas: **Double DQN** (para reducir la sobreestimación de valores Q) y **Dueling DQN** (que separa la estimación del valor de estado y la ventaja de cada acción). La red neuronal es un perceptrón multicapa con una capa de entrada de 8 neuronas (las dimensiones del estado), dos capas ocultas de 128 unidades con activación ReLU, y dos ramas de salida: una para el valor de estado `V(s)` y otra para las ventajas `A(s,a)` de las 4 acciones posibles. La combinación de ambas ramas produce los valores Q finales.

El entrenamiento se realizó con los siguientes hiperparámetros: tasa de aprendizaje de `5e-4` con optimizador Adam, factor de descuento `gamma = 0.99`, actualización suave de la red objetivo con `tau = 0.005`, buffer de experiencia de 100.000 transiciones, tamaño de lote de 64 y una función de pérdida Smooth L1 (Huber). La exploración se gestionó mediante una política epsilon-greedy con decaimiento lineal desde `1.0` (exploración total) hasta `0.05` (explotación casi total). No se dispone de información detallada sobre el número total de episodios de entrenamiento ni sobre la composición del dataset de experiencias, más allá de lo que genera el propio entorno durante el proceso de aprendizaje.

## Capacidades

- Control autónomo de aterrizaje en el entorno `LunarLander-v3` de Gymnasium, con recompensa media superior a 200 puntos.
- Toma de decisiones secuencial en un espacio de acciones discreto de 4 acciones (no operar, propulsor izquierdo, propulsor principal, propulsor derecho).
- Procesamiento de un estado continuo de 8 dimensiones que incluye posición (x, y), velocidades lineales (vx, vy), ángulo, velocidad angular y contacto de las patas izquierda y derecha.
- Inferencia en modo evaluación con epsilon = 0, lo que garantiza una política determinista y reproducible.
- Integración con el ecosistema Gymnasium para evaluación y visualización con renderizado humano.
- Compatible con la plataforma de control de misión web LUNAR-LANDER-DQN, que permite monitorizar el aterrizaje en tiempo real.

## Casos de uso

- **Investigación en aprendizaje por refuerzo**: sirve como punto de partida para estudiar el efecto de las variantes Dueling y Double DQN en entornos de control continuo. Los investigadores pueden cargar los pesos y comparar el comportamiento con otras arquitecturas (DQN clásico, PPO, SAC) en el mismo entorno.
- **Educación y demostraciones prácticas**: el modelo es ideal para cursos de RL o robótica, ya que es ligero, se ejecuta en CPU y permite visualizar el aterrizaje en tiempo real. La plataforma web asociada facilita la demostración en clase o en seminarios.
- **Benchmark de algoritmos de RL**: al estar entrenado para resolver `LunarLander-v3`, puede utilizarse como referencia para validar nuevas implementaciones de algoritmos de refuerzo. Los resultados (recompensa media > 200) son comparables con los estándares de la comunidad.
- **Desarrollo de agentes para entornos Box2D**: el código y los hiperparámetros documentados sirven como plantilla para entrenar agentes en otros entornos de física 2D, como `BipedalWalker` o `CarRacing`, adaptando la red y el espacio de acciones.
- **Pruebas de integración con Gymnasium**: el modelo permite verificar que una instalación de Gymnasium funciona correctamente, ejecutando un episodio completo de aterrizaje y comprobando la recompensa acumulada.
- **Prototipado de sistemas de control basados en RL**: aunque el entorno es simplificado, la arquitectura del agente puede servir como base para experimentar con técnicas de simulación a real (sim-to-real) en sistemas de aterrizaje o navegación autónoma a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. La model card indica que el agente alcanza una **recompensa media superior a 200 puntos** en el entorno `LunarLander-v3`, lo que se considera el umbral de "solución" en este entorno. No se proporcionan métricas adicionales como desviación estándar, tasa de éxito en aterrizajes o comparación con otros algoritmos.

## Requisitos de hardware

- **VRAM**: no requiere GPU. El modelo tiene aproximadamente 34.500 parámetros, lo que ocupa menos de 1 MB en memoria.
- **GPU recomendada**: ninguna. Puede ejecutarse en cualquier CPU moderna.
- **Compatibilidad con GPU de consumo**: sí, pero innecesario. Cualquier GPU (incluso integrada) ejecutaría la inferencia instantáneamente.
- **Opciones de despliegue**: el modelo se carga directamente con PyTorch. Para integraciones más amplias, puede empaquetarse como un entorno Gymnasium o exponerse mediante una API REST. No es compatible con vLLM, llama.cpp u otros motores de inferencia de LLM, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: la inferencia es del orden de microsegundos por paso. Un episodio completo (típicamente menos de 1000 pasos) se ejecuta en menos de un segundo en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Recompensa media | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lookarooka/LunarLander-v3-DQN | Dueling Double DQN | > 200 | ~34.500 | No disponible | Hugging Face |
| allen73/lunarlander-v3-dqn-physical-ai | Double Dueling DQN | No disponible | No disponible | No disponible | Hugging Face |
| moona-ai/lunar-lander-v3-dqn | DQN | No disponible | No disponible | No disponible | Hugging Face |
| wtcherr/lunar-lander-dqn (GitHub) | DQN | No disponible | No disponible | No disponible | GitHub |

No se dispone de datos comparativos de rendimiento entre estos modelos. La información pública es escasa y no incluye métricas detalladas ni configuraciones de entrenamiento comparables.

## Limitaciones y advertencias

- **Sobreajuste al entorno específico**: el modelo está entrenado exclusivamente para `LunarLander-v3`. No es transferible a otros entornos sin reentrenamiento.
- **Falta de generalización**: al ser una red pequeña y especializada, no tiene capacidad para manejar variaciones fuera de la distribución del entorno original (por ejemplo, cambios en la física o en el espacio de acciones).
- **Dependencia de la semilla aleatoria**: el rendimiento puede variar ligeramente entre ejecuciones si no se fija la semilla, aunque el modo evaluación con epsilon = 0 es determinista.
- **Licencia no especificada**: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o la redistribución. Se recomienda contactar con el autor antes de utilizarlo en proyectos productivos.
- **Sin documentación de entrenamiento completa**: no se detallan el número de episodios, la duración del entrenamiento ni la configuración del entorno (por ejemplo, si se usó `LunarLander-v3` con parámetros por defecto). Esto dificulta la reproducibilidad.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de texto.
- **Sesgos**: no aplica, al no procesar datos lingüísticos o sociales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/LunarLander-v3-DQN
- Repositorio de entrenamiento y plataforma web: https://github.com/eery1677-lab/LUNAR-LANDER-DQN (mencionado en la model card)
- Entorno Gymnasium LunarLander-v3: https://gymnasium.farama.org/environments/box2d/lunar_lander/ (referencia estándar)
