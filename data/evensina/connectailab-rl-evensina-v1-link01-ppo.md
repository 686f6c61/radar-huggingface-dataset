# EvenSina/connectailab-rl-evensina-v1-link01-ppo

## Resumen

`connectailab-rl-evensina-v1-link01-ppo` es una política de control entrenada con PPO (Proximal Policy Optimization) para el robot humanoide bípedo LINK-01, un modelo físico de 14 grados de libertad (14-DOF) simulado en MuJoCo 3.3.4. Lo desarrolla Shin Hyeon-gu (EvenSina) en el marco del CONNECT AI LAB, y su función es generar comandos de par continuo en las 14 articulaciones para ejecutar marcha recta, giros, sentadilla y salto.

No es un modelo de lenguaje: es un "cerebro" de IA física (Physical AI) que mapea un vector de observación de 51 dimensiones a una acción de 14 dimensiones. La red es un perceptrón de tres capas (51→64→64→14) con activaciones Tanh y normalización de observaciones mediante media y desviación estándar en ejecución (running mean-std). El entrenamiento acumuló 400.000 pasos en 8 entornos vectorizados en paralelo.

Su relevancia es acotada: se trata de un artefacto de investigación y demostración educativa (parte del curso de RL "AI CITY BUILDERS"), no de un modelo de propósito general. El repositorio ocupa 0,0 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) para política PPO: Linear(51,64) → Tanh → Linear(64,64) → Tanh → Linear(64,14) |
| Parámetros totales | no disponible (estimación: ~9.500, calculada a partir de las dimensiones de capa; el autor no lo publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observación es un vector de 51 dimensiones por paso) |
| Tipos de cuantización | no disponible (pesos en `model.pt` y `actor.json`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `squat_jump_model.pt`) y JSON (`actor.json`, para simulador WebGL) |

## Arquitectura y entrenamiento

La política es una red neuronal densa de tres capas con activaciones Tanh, entrenada con PPO sobre el entorno `Link01Walk-v0` de MuJoCo 3.3.4. El espacio de observación tiene 51 dimensiones: cuaternión de orientación del cuerpo, velocidad angular, ángulos y velocidades angulares de las 14 articulaciones, y velocidad objetivo. El espacio de acción es continuo, de 14 dimensiones, con pares normalizados en el rango [-1,0, 1,0]. Las observaciones se normalizan con estadísticas running mean-std de 51 dimensiones, almacenadas junto a los pesos.

El entrenamiento se realizó con 8 entornos vectorizados en paralelo hasta un total de 400.000 pasos. El autor reporta una recompensa media de 1.907,68 puntos en las últimas 50 partidas, con una supervivencia media de 883,2 pasos y episodios completados de 500 fotogramas. Existe un segundo checkpoint (`squat_jump_model.pt`) especializado en sentadilla y salto. No se documentan detalles sobre composición del dataset (no aplica, es RL en simulación), función de recompensa, hiperparámetros de PPO ni procesos de RLHF/DPO.

## Capacidades

- Control de locomoción bípeda: marcha recta con bloqueo de rumbo por P-D heading lock sobre el giroscopio.
- Giros: rotación a izquierda y derecha mediante par diferencial y balanceo de roll.
- Postura estática: mantenimiento de posición erguida (stand) sin desplazamiento.
- Sentadilla profunda (squat) con estabilidad mantenida mientras se mantiene la orden.
- Salto con carga de impulso previo (jump) y fase aérea.
- Control en tiempo real por teclado (W, S, A, D, C, Space, Q) sobre visualización 3D.
- Exportación de pesos a JSON para simulador WebGL en navegador.
- No soporta tool calling, function calling, razonamiento multi-paso, multilingüismo ni modalidades de visión o audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio incluye curva de aprendizaje, vídeos de repetición y script de control, lo que permite reproducir el ciclo completo de entrenamiento PPO en MuJoCo como material de curso.
- Investigación en locomoción bípeda: sirve como línea base reproducible de 14-DOF para comparar variantes de recompensa, algoritmos (PPO frente a SAC o TD3) y estrategias de vectorización.
- Prototipado de controladores para humanoides: la política puede integrarse como referencia en un pipeline de simulación a real (sim2real) antes de transferir a hardware, siempre que la morfología coincida con LINK-01.
- Demostraciones interactivas: el script `control_robot.py` permite manipular el robot en tiempo real durante presentaciones o ferias, con detección global de teclado en Windows.
- Visualización web: `actor.json` habilita un playground WebGL en navegador sin instalación de Python, útil para divulgar resultados de RL.
- Pruebas de estabilidad postural: el modo squat mantenido permite evaluar la robustez del controlador ante perturbaciones y el comportamiento del balanceo de roll.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de entrenamiento:

| Métrica | Valor reportado |
|---|---|
| Pasos de entrenamiento acumulados | 400.000 (8 entornos vectorizados) |
| Recompensa media (últimas 50 partidas) | 1.907,68 |
| Supervivencia media | 883,2 pasos |
| Duración de episodio completado | 500 fotogramas |

No hay comparación con otras políticas ni resultados en tareas estándar de locomoción (por ejemplo, MuJoCo Gym o benchmarks de humanoides).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos de la política (red de ~9.500 parámetros); el cuello de botella es la simulación MuJoCo, no la red.
- GPU recomendadas: no se requiere GPU para la inferencia de la política; MuJoCo puede ejecutarse en CPU. Para entrenamiento con 8 entornos vectorizados, una GPU consumer (RTX 3060 o superior) es suficiente, aunque no se documentan requisitos oficiales.
- Cabe en cualquier GPU consumer e incluso en CPU; no hay versiones cuantizadas publicadas.
- Opciones de despliegue: PyTorch nativo (`model.pt`), JSON en simulador WebGL (`actor.json`) y script de control en Windows (`control_robot.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, existirían políticas PPO para humanoides en MuJoCo Gym (por ejemplo, entornos Humanoid de Gymnasium) y controladores de locomotion de otros laboratorios, pero no se aportan datos de parámetros, contexto, rendimiento ni licencia que permitan una comparación rigurosa. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ámbito muy restringido: la política está entrenada para una morfología concreta (LINK-01, 14 actuadores) y un entorno concreto (`Link01Walk-v0`); no es transferible sin reentrenamiento.
- Sin validación en hardware real: todos los resultados proceden de simulación MuJoCo; no hay evidencia de sim2real.
- Métricas no auditables de forma independiente: la recompensa y la supervivencia reportadas dependen de la función de recompensa del entorno, no publicada en detalle.
- Riesgo de sobreajuste al entorno: 400.000 pasos con 8 entornos es un presupuesto modesto; la robustez ante perturbaciones, terrenos irregulares o cambios de masa no está documentada.
- Sesgos y alucinación: no aplican en el sentido de modelos generativos, pero sí existe riesgo de comportamientos no previstos fuera de la distribución de observaciones de entrenamiento.
- Dependencia de Windows para el control por teclado: `control_robot.py` usa detección global de teclas específica de Windows.
- Repositorio sin descargas ni validación comunitaria: no hay señales externas de calidad más allá de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvenSina/connectailab-rl-evensina-v1-link01-ppo
- Repositorio del autor en Hugging Face: https://huggingface.co/EvenSina
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos distintos de los archivos incluidos en el propio repositorio (`control_robot.py`, `walk_replay.mp4`, `squat_jump_replay.mp4`, `learning_curve.png`, `connectailab.json`).
