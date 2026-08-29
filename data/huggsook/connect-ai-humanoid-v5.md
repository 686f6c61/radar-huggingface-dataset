# huggsook/connect-ai-Humanoid-v5

## Resumen

`huggsook/connect-ai-Humanoid-v5` es un modelo de aprendizaje por refuerzo (reinforcement learning) que aprende a controlar un robot humanoide bípedo de 17 articulaciones en el entorno `Humanoid-v5` de Gymnasium, un simulador físico 3D de alta complejidad. Fue desarrollado por huggsook (KANG HYE SOOK) con Connect-AI Studio y publicado en Hugging Face en agosto de 2026. El proyecto resuelve el problema de la locomoción bípeda estable y el equilibrio dinámico mediante el algoritmo PPO (Proximal Policy Optimization) implementado con Stable-Baselines3.

La política entrenada es una red MlpPolicy (Actor-Critic) que procesa 376 observaciones sensoriales y produce 17 acciones de par motor para las articulaciones del robot. El entrenamiento se realizó durante 100,000 timesteps, alcanzando una recompensa media por episodio de 6540.5. El repositorio incluye herramientas adicionales de visualización 3D con Three.js, un inspector de activación de la red neuronal y un sistema de exportación de paquetes, lo que lo convierte en un ejemplo completo de pipeline de RL en entornos de física 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (Actor-Critic con MlpPolicy) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponibles (no es modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ppo_humanoid_weights.json, vec_normalize_stats.json (empaquetado en ZIP) |

## Arquitectura y entrenamiento

El modelo emplea PPO con política `MlpPolicy`, un esquema Actor-Critic con Generalized Advantage Estimation (GAE). Los hiperparámetros declarados son: learning rate de 3e-4 con optimizador Adam, batch size de 64, buffer de rollout de 2048 pasos por actualización, 10 épocas de optimización por update, gamma de 0.99, lambda de GAE de 0.95, clip range de 0.2 y coeficiente de entropía de 0.0. Se aplica normalización de observaciones y recompensas mediante `VecNormalize`.

El entrenamiento se realizó durante 100,000 timesteps en el entorno `Humanoid-v5`, que simula un robot bípedo con 17 grados de libertad, 376 observaciones de entrada y 17 acciones de par motor. No se especifica la composición del dataset (no aplica, al ser un entorno de simulación) ni se menciona el uso de RLHF o DPO. Como innovación técnica destacable, el proyecto incorpora un simulador físico 3D basado en Three.js con seguimiento del centro de masas, detección de contacto de pies con el suelo y simulación de perturbaciones externas (empuje y viento), además de un inspector en tiempo real de las activaciones de la red neuronal.

## Capacidades

- Locomoción bípeda estable: control de 17 articulaciones para caminar y mantener el equilibrio en un entorno 3D con física realista.
- Equilibrio dinámico ante perturbaciones: el entorno simula fuerzas externas (empujes, viento) que la política debe contrarrestar.
- Seguimiento del centro de masas (CoM): monitorización y control del punto de gravedad del robot durante la marcha.
- Detección de contacto de pies: análisis de las fuerzas de contacto con el suelo para ajustar la postura.
- Visualización 3D en tiempo real: renderizado interactivo del agente mediante Three.js, con curvas de recompensa por episodio, media móvil de 10 episodios, pérdidas de critic y actor, y entropía de la política.
- Inspector de activación neuronal: visualización en vivo de las 376 entradas sensoriales, capas ocultas y las 17 salidas de par motor.
- Exportación de paquetes: descarga en un solo ZIP de los pesos entrenados, estadísticas de normalización, logs CSV de entrenamiento y capturas del viewport 3D.

## Casos de uso

- Investigación en robótica de control: el modelo sirve como referencia para estudiar políticas de locomoción bípeda en simulación, permitiendo analizar cómo las observaciones sensoriales se traducen en pares articulares mediante el inspector de activaciones.
- Validación de algoritmos de RL: al estar entrenado con PPO en un entorno complejo de 17-DoF, puede usarse como punto de partida para comparar variantes del algoritmo (PPO con entropía adaptativa, SAC, TD3) bajo el mismo protocolo de evaluación.
- Educacion en aprendizaje por refuerzo: el entorno visual 3D y las curvas de recompensa en tiempo real lo convierten en una herramienta didactica para explicar el funcionamiento de Actor-Critic, GAE y la normalizacion de observaciones.
- Prototipado de controladores antes del paso a hardware: la simulacion de perturbaciones (empuje y viento) permite validar la robustez de una politica antes de trasladarla a un robot fisico, reduciendo costes y riesgos.
- Benchmarking de entornos de simulacion: el proyecto incluye logs CSV completos de la trayectoria de entrenamiento, utiles para comparar la convergencia de PPO en Humanoid-v5 frente a otros entornos de MuJoCo o PyBullet.
- Demostracion de pipelines RL completos: desde el entrenamiento hasta la visualizacion y exportacion, sirve como plantilla de referencia para construir proyectos de RL con Stable-Baselines3, Gymnasium y Three.js.

## Benchmarks y rendimiento

El autor declara en el model-index de la model card el siguiente resultado, sin verificacion independiente (verified: false):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | Humanoid-v5 | Mean Episode Reward | 6540.5 |

No se han publicado comparaciones con otros modelos entrenados en el mismo entorno ni datos adicionales de rendimiento (desviacion estandar, tasa de exito, etc.) en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 0.0 GB, lo que indica un modelo de red MLP pequeno con pesos serializados en JSON.
- Inferencia: ejecutable en CPU sin necesidad de GPU; la prediccion de acciones requiere un forward pass de una red densa con 376 entradas y 17 salidas, despreciable en computo.
- Entrenamiento: 100,000 timesteps con PPO en Humanoid-v5 es asumible en CPU, aunque una GPU acelera las actualizaciones del mini-batch de 64 muestras.
- Despliegue: requiere Stable-Baselines3 y Gymnasium en Python; el entorno debe instanciarse con `gym.make("Humanoid-v5")` y la politica con `PPO.load("ppo_humanoid.zip", env=env)`.
- Visualizacion: el viewport 3D con Three.js se sirve como pagina estatica (HTML/JS) y no requiere hardware especifico mas alla de un navegador moderno.
- Latencia: no disponible; al tratarse de un MLP pequeno, se espera una latencia de milisegundos por prediccion en CPU.

## Comparativa con modelos similares

No disponible. No se han publicado en la informacion proporcionada comparaciones con otros modelos entrenados en Humanoid-v5 (por ejemplo, variantes de PPO con distintos hiperparametros, SAC o TD3 sobre el mismo entorno). Una comparativa rigurosa requeriria ejecutar los mismos episodios de evaluacion con el mismo protocolo de normalizacion y semilla.

## Limitaciones y advertencias

- Entrenamiento limitado: solo 100,000 timesteps, una cantidad reducida para un entorno de control continuo de alta dimension como Humanoid-v5; es probable que la politica no haya convergido a un comportamiento optimo.
- Coeficiente de entropia 0.0: la ausencia de bonus de exploracion puede provocar convergencia prematura a politicas suboptimas y reduccion de la diversidad de comportamientos.
- Rendimiento no verificado: el valor de Mean Episode Reward de 6540.5 esta marcado como verified: false, por lo que no ha sido confirmado por una entidad independiente.
- Licencia no disponible: no se especifica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o la redistribucion de los pesos.
- Sin normalizacion cargada por defecto: el codigo de ejemplo incluye comentado el `VecNormalize.load`, por lo que si no se cargan las estadisticas de normalizacion, la evaluacion puede producir resultados inconsistentes con el entrenamiento.
- No es un modelo de lenguaje: no genera texto ni soporta tareas de NLP; su unica funcion es el control de un agente en el entorno Humanoid-v5.
- Dependencia de librerias: requiere Stable-Baselines3, Gymnasium y versiones compatibles de Python; la carga del modelo puede fallar si el entorno no esta correctamente registrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggsook/connect-ai-Humanoid-v5
- Perfil del autor: https://huggingface.co/huggsook
- Busqueda de modelos Humanoid-v5 en Hugging Face: https://huggingface.co/models?other=Humanoid-v5
