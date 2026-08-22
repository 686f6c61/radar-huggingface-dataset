# leegoheun/ppo-pusher-v5

## Resumen

`leegoheun/ppo-pusher-v5` es un modelo de control robótico basado en aprendizaje por refuerzo, desarrollado por el usuario `leegoheun` y publicado en Hugging Face. El modelo implementa el algoritmo Proximal Policy Optimization (PPO) mediante la librería Stable-Baselines3, entrenado sobre el entorno `Pusher-v5` de Gymnasium/MuJoCo. Su objetivo es controlar un brazo robótico de 7 grados de libertad para empujar un cilindro sobre una mesa hasta una posición objetivo, una tarea clásica de manipulación robótica.

La arquitectura es una red neuronal MLP con tres capas ocultas (23 → 64 → 64 → 7), que mapea el estado del entorno (23 dimensiones) a acciones de torque continuas en el rango [-1, 1] para cada articulación. El modelo fue entrenado durante 100 000 timesteps y alcanza una recompensa media de evaluación de -39.05 en el entorno estándar. Aunque el tamaño del repositorio es mínimo (0.0 GB) y las descargas son nulas, el modelo constituye un ejemplo práctico de aplicación de PPO en robótica simulada, útil como referencia para experimentos y comparativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (23 → 64 → 64 → 7) con activación ReLU |
| Parametros totales | no disponible (red neuronal pequeña, aproximadamente 6 000 parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documenta) |
| Idiomas soportados | en, ko (etiquetas del modelo, no capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | zip (archivo `ppo_pusher.zip` de Stable-Baselines3) |

## Arquitectura y entrenamiento

El modelo implementa PPO (Proximal Policy Optimization) con una política MLP de dos capas ocultas de 64 neuronas cada una. La entrada es el vector de estado de 23 dimensiones del entorno `Pusher-v5` (posiciones y velocidades de 7 articulaciones, posición del efector final, posición del objeto y objetivo). La salida es una distribución gaussiana sobre el espacio de acciones continuas de 7 dimensiones.

El entrenamiento se realizó durante 100 000 timesteps con un learning rate de 3e-4, batch size de 64, n_steps de 2048, gamma de 0.99, GAE lambda de 0.95 y clip range de 0.2. No se emplearon técnicas de RLHF ni DPO; es un entrenamiento de refuerzo directo sobre el entorno simulado. No hay innovaciones técnicas destacadas más allá de la configuración estándar de PPO con Stable-Baselines3.

## Capacidades

- Control de un brazo robótico de 7 grados de libertad en el entorno MuJoCo `Pusher-v5`.
- Generación de acciones de torque continuas para empujar objetos hacia una posición objetivo.
- Decodificación determinista o estocástica mediante `model.predict(obs, deterministic=True)`.
- Ejecución en bucle de episodios completos (reseteo automático al terminar).
- Funciona con Gymnasium y Stable-Baselines3; no requiere GPU para inferencia.
- No dispone de capacidades de tool calling, agentes, visión o procesamiento de lenguaje.

## Casos de uso

- **Investigación en aprendizaje por refuerzo**: permite reproducir y comparar resultados de PPO en un entorno de referencia estándar, ideal para validar nuevos algoritmos o hiperparámetros.
- **Prototipado de control robótico**: sirve como punto de partida para pruebas de control de brazo robótico en simulación antes de transferir a hardware real.
- **Educación en robótica**: se puede usar en cursos y talleres para demostrar cómo se entrena una política de control con PPO y cómo se carga un modelo preentrenado.
- **Evaluación de métricas de rendimiento**: el valor de recompensa media (-39.05) puede servir como referencia para comparar mejoras en algoritmos de refuerzo.
- **Integración en pipelines de simulación**: puede integrarse en flujos de trabajo que requieran control de un brazo robótico, como generación de datos para aprendizaje por imitación o planificación de trayectorias.
- **Benchmark de entornos**: permite verificar la correcta instalación de Gymnasium y MuJoCo, así como la reproducibilidad de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, salvo el siguiente dato oficial del autor:

| Entorno | Métrica | Valor |
|---|---|---|
| Pusher-v5 | Mean Evaluation Reward | -39.05 |

No se proporcionan comparaciones con otros modelos ni métricas adicionales (e.g., éxito de episodio, distancia al objetivo).

## Requisitos de hardware

- **Inferencia en CPU**: el modelo es extremadamente ligero (≈6 000 parámetros), por lo que puede ejecutarse en cualquier CPU sin GPU. El entorno MuJoCo en modo `render_mode="human"` requiere una GPU o soporte de gráficos, pero la política en sí no.
- **VRAM estimada**: 0 GB (no se usa GPU para la red neuronal).
- **GPU recomendada**: ninguna; cualquier GPU moderna es excesiva.
- **Despliegue**: se carga con `PPO.load()` de Stable-Baselines3; no requiere servidores de inferencia como vLLM o Ollama.
- **Latencia**: inferior a 1 ms por paso en CPU (medición no documentada, pero esperable por el tamaño).
- **Throughput**: puede ejecutar cientos de pasos por segundo en CPU estándar.

## Comparativa con modelos similares

Existen otros agentes entrenados en el mismo entorno, como `LTU-AI/hdppo-Pusher-v5` (que usa una variante híbrida de PPO con hyperdimensional computing), pero no se dispone de datos de rendimiento comparables en la información recopilada. No se incluye tabla comparativa por falta de datos verificados.

## Limitaciones y advertencias

- El modelo fue entrenado con solo 100 000 timesteps, lo que puede no alcanzar el rendimiento óptimo para la tarea; la recompensa media negativa (-39.05) indica que aún no resuelve el problema de forma robusta.
- No se ha evaluado su comportamiento en variantes del entorno (por ejemplo, cambios en la dinámica o en la geometría del objeto), por lo que su generalización es limitada.
- No se documentan sesgos, pero al ser un modelo de control no aplica el riesgo de alucinación típico de los modelos de lenguaje.
- La licencia MIT permite uso comercial y modificación, pero el autor no garantiza la idoneidad para producción.
- El repositorio no incluye el código de entrenamiento ni configuraciones adicionales, solo el archivo de pesos `.zip`.
- El modelo está etiquetado para los idiomas `en` y `ko`, pero esto no implica capacidades de procesamiento de lenguaje; es una etiqueta descriptiva del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/ppo-pusher-v5
- Entorno `Pusher-v5` en Gymnasium: https://gymnasium.farama.org/environments/mujoco/pusher/
- Modelo similar (referencia): https://huggingface.co/LTU-AI/hdppo-Pusher-v5
- Documentación de PPO en Stable-Baselines3: no disponible en la búsqueda web.
