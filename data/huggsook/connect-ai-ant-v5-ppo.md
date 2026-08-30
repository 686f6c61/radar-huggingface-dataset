# huggsook/connect-ai-ant-v5-ppo

## Resumen

El modelo `huggsook/connect-ai-ant-v5-ppo` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver la tarea de locomoción cuadrúpeda en el entorno `Ant-v5` de Gymnasium, utilizando el motor de física MuJoCo. Desarrollado por el autor huggsook bajo la organización CONNECT-AI, este modelo coordina ocho actuadores de torque continuo en las cuatro patas de un robot hormiga para maximizar la velocidad de avance manteniendo el equilibrio postural.

El agente opera sobre un espacio de observación de 105 dimensiones y un espacio de acción continuo de 8 dimensiones, empleando una política MLP (MlpPolicy) implementada con Stable-Baselines3. Tras 100.352 pasos de entrenamiento, el modelo alcanza una recompensa por episodio superior a 359, una distancia máxima de avance de 3,49 metros y una velocidad media de 0,82 m/s, mostrando una marcha cuadrúpeda coordinada y estable.

La relevancia de este modelo radica en su aplicación como punto de partida para la investigación en control robótico, simulación física y algoritmos de aprendizaje por refuerzo, ofreciendo una implementación reproducible y documentada con métricas de evaluación detalladas. Su licencia MIT permite uso comercial y académico sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (Proximal Policy Optimization) con MlpPolicy (red MLP) |
| Parametros totales | no disponible (no se especifica el número de parámetros de la red) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (entorno de control continuo, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante estándar de PyTorch) |
| Idiomas soportados | no aplicable (modelo de control, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ZIP con pesos PyTorch (ppo_ant_final.zip), también disponible en safetensors? (no se indica, solo zip) |

## Arquitectura y entrenamiento

El modelo emplea el algoritmo PPO, un método de optimización de política basado en gradiente que combina ideas de A2C (múltiples trabajadores) y TRPO (región de confianza). La política es una red neuronal MLP (MlpPolicy) que mapea un espacio de observación continuo de 105 dimensiones (posiciones, velocidades, fuerzas de contacto y estados de las articulaciones) a un espacio de acción continuo de 8 dimensiones (torques aplicados a las articulaciones de las patas). El entrenamiento se realizó en el entorno `Ant-v5` de Gymnasium, que simula un robot cuadrúpedo con torso libre y cuatro patas, cada una con dos segmentos articulados.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 3.0e-4, `n_steps` de 2048, `batch_size` de 64, 10 épocas por actualización, factor de descuento gamma de 0.99, GAE lambda de 0.95, clip range de 0.2, coeficiente de función de valor de 0.5 y gradiente máximo normalizado a 0.5. Se utilizó una semilla fija (seed 0) para reproducibilidad. El entrenamiento se llevó a cabo durante 100.000 timesteps (con un checkpoint final a 100.352), evaluando el rendimiento en cinco etapas intermedias que muestran la progresión desde movimientos descoordinados hasta una marcha de alta velocidad.

## Capacidades

- Control continuo de locomoción cuadrúpeda: coordina 8 actuadores de torque para generar movimiento de avance en el plano X-Y.
- Equilibrio postural: mantiene la estabilidad del torso mientras se desplaza, ajustando las fuerzas de contacto entre las patas y el suelo.
- Adaptación a la física de MuJoCo: aprovecha el modelo dinámico realista del entorno para aprender estrategias de marcha eficientes.
- Evaluación determinista: el agente puede ejecutarse en modo `deterministic=True` para reproducir trayectorias consistentes.
- Integración con Stable-Baselines3: compatible con el ecosistema estándar de RL, permitiendo carga y evaluación mediante `PPO.load()`.
- Capacidad de reinicio y evaluación multi-episodio: el script de inferencia incluido permite ejecutar episodios consecutivos y reiniciar el entorno automáticamente.

## Casos de uso

- Investigación en control de robots cuadrúpedos: el modelo sirve como punto de partida para estudiar estrategias de marcha, transferencia a hardware real o algoritmos de adaptación. Su estructura simple y documentada facilita la modificación de recompensas o hiperparámetros.
- Benchmark de algoritmos de RL: dado que el entorno `Ant-v5` es un estándar en Gymnasium, este agente puede usarse como referencia para comparar el rendimiento de otros algoritmos (SAC, TD3, TRPO) bajo las mismas condiciones.
- Simulación para diseño de controladores: en entornos de simulación robótica, el modelo puede generar trayectorias de movimiento realistas para probar sistemas de planificación de rutas o evitar obstáculos.
- Educación en aprendizaje por refuerzo: el repositorio incluye scripts de entrenamiento y evaluación, lo que lo convierte en un recurso didáctico para enseñar PPO, control continuo y evaluación de políticas.
- Generación de datos sintéticos de movimiento: las trayectorias generadas pueden utilizarse para entrenar modelos de visión por computadora o algoritmos de imitación, proporcionando datos diversos de locomoción cuadrúpeda.
- Pruebas de robustez en entornos simulados: al variar la física del entorno o añadir perturbaciones, el modelo puede evaluarse para determinar su tolerancia a cambios en la dinámica, útil para estudios de sim-to-real.

## Benchmarks y rendimiento

Los resultados de entrenamiento se presentan en la siguiente tabla, extraída de la model card del autor. No se han publicado comparaciones con otros modelos en la información disponible.

| Etapa de entrenamiento | Timesteps | Recompensa por episodio | Distancia máxima X (m) | Velocidad media Vx (m/s) | Estado de la marcha |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Inicial (baseline) | 0 | -5.73 | 0.058 | 0.003 | Descoordinado / tambaleante |
| Checkpoint 1 | 20,000 | 431.33 | 3.087 | 0.154 | Aprendiendo coordinación de piernas |
| Checkpoint 2 | 40,000 | 406.88 | 5.077 | 0.254 | Locomoción acelerada |
| Checkpoint 3 | 60,000 | 278.10 | 1.850 | 0.180 | Ajuste de equilibrio y estabilidad |
| Checkpoint 4 | 80,000 | 132.06 | 1.722 | 0.184 | Ajuste de recuperación postural |
| Checkpoint 5 | 100,000 | 136.17 | 2.150 | 0.220 | Marcha cuadrúpeda refinada |
| Final (dominado) | 100,352 | 359.0+ | 3.49+ | 0.82+ | Sprint de alta velocidad |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El repositorio tiene un tamaño de 0.2 GB, lo que incluye pesos, checkpoints y archivos de visualización. El archivo de pesos `ppo_ant_final.zip` es ligero (probablemente unos pocos MB, aunque no se especifica el tamaño exacto).
- Inferencia en CPU: es suficiente para ejecutar episodios de evaluación. El entorno MuJoCo puede funcionar en CPU, aunque la velocidad depende del número de steps.
- Inferencia en GPU: no es estrictamente necesaria, pero puede acelerar el entrenamiento si se reutiliza el código. Una GPU con al menos 4 GB de VRAM es más que suficiente para este modelo.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 o superior) es adecuada; no se requieren GPUs de servidor.
- Opciones de despliegue: se puede ejecutar con el script de evaluación incluido, usando Stable-Baselines3 y Gymnasium. No es compatible directamente con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia estimada: no disponible, pero al ser una red MLP pequeña, la inferencia es prácticamente instantánea (menos de 1 ms por step en CPU moderna).

## Comparativa con modelos similares

No se han encontrado modelos comparables publicados en Hugging Face para el mismo entorno `Ant-v5` con PPO. Existen repositorios en GitHub (como `mturan33/mujoco-ant-ppo`) que implementan PPO desde cero para el mismo entorno, pero no ofrecen pesos preentrenados ni métricas comparables. Por tanto, no se dispone de una comparativa directa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el entorno `Ant-v5` de Gymnasium con MuJoCo. No es transferible directamente a otros entornos o robots sin reentrenamiento.
- La recompensa máxima de 359 se obtuvo en una evaluación concreta; el rendimiento puede variar ligeramente entre episodios debido a la estocasticidad del entorno.
- No se proporcionan métricas de robustez ante perturbaciones externas (viento, terrenos irregulares, cambios de fricción). El agente puede no generalizar bien fuera de las condiciones de entrenamiento.
- El entrenamiento se limitó a 100.000 timesteps, lo que puede ser insuficiente para alcanzar el rendimiento óptimo en tareas de control continuo más complejas.
- No se ha documentado el número de parámetros de la red neuronal, lo que dificulta estimar el coste computacional exacto de inferencia.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en aplicaciones de producción.
- El modelo no es un sistema de lenguaje ni de visión; su única capacidad es el control de locomoción en simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggsook/connect-ai-ant-v5-ppo
- Documentación de PPO en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
- Documentación del entorno Ant en Gymnasium: https://gymnasium.farama.org/environments/mujoco/ant/
- Repositorio de referencia (implementación PPO para Ant-v5): https://github.com/mturan33/mujoco-ant-ppo
- Espacio relacionado (Humanoid-v5 PPO): https://huggingface.co/spaces/huggsook/connect-ai-Humanoid-v5
