# NADANAYO/connectailab-rl-nadanayo-v1-humanoid-ppo-1m

## Resumen

`connectailab-rl-nadanayo-v1-humanoid-ppo-1m` es un modelo de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO para control continuo en el entorno `Humanoid-v5` de Gymnasium sobre MuJoCo 3. Lo desarrolla el usuario NADANAYO en el marco del curso "AI CITY BUILDERS" (lección 7) del CONNECT AI LAB. No es un modelo de lenguaje: es una política neuronal que recibe un vector de 348 dimensiones del estado del simulador y emite 17 acciones continuas correspondientes a los motores articulares del humanoide.

El modelo se presenta como una política "completada" tras 1.000.000 de pasos de entrenamiento, con una puntuación media declarada de 521,4 en 10 episodios de prueba. Su relevancia es didáctica y de referencia: sirve como ejemplo reproducible de un pipeline PPO con entornos paralelos para una de las tareas de control continuo más difíciles de MuJoCo (locomoción bípeda de alta dimensionalidad).

La información pública es muy escasa: el repositorio ocupa 0,0 GB, no declara licencia ni idiomas, no incluye datos de benchmarks comparativos y no se especifica el formato exacto de los pesos más allá de la librería PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP): 348 -> Linear(256) -> Tanh -> Linear(256) -> Tanh -> 17 |
| Parametros totales | no disponible (estimacion aproximada a partir de las capas declaradas: ~94.000) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 348 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria declarada: PyTorch) |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa con dos capas ocultas de 256 unidades y activación Tanh, que mapea el vector de observación de 348 dimensiones del entorno `Humanoid-v5` a una acción continua en un espacio `Box(17)`. El entrenamiento emplea PPO con clipping de 0,2 (±20 %), 8 entornos paralelos, tasa de aprendizaje 3e-4 y coeficiente de entropía 0,0, durante un total de 1.000.000 de pasos. El entorno se ejecuta sobre MuJoCo 3 mediante Gymnasium.

No se documentan detalles sobre la inicialización de pesos, el tamaño de lote, el número de épocas por actualización, la función de ventaja (GAE u otra) ni la semilla utilizada. Tampoco se indica si se aplicó normalización de observaciones o recompensas, ni si hubo ajuste fino posterior. La innovación técnica destacable es la propia elección del entorno: `Humanoid-v5` es una de las tareas de control continuo de mayor dimensionalidad de acción en MuJoCo, y completar 1M de pasos con una MLP pequeña y entropía nula es un resultado de interés práctico para quienes replican el ejercicio.

## Capacidades

- Control continuo de 17 articulaciones a partir de 348 entradas sensoriales del simulador MuJoCo.
- Locomoción bípeda en el entorno `Humanoid-v5` (desplazamiento, equilibrio y coordinación de extremidades).
- Política determinista o estocástica según el modo de muestreo de la distribución de acciones de PPO.
- Inferencia de un único paso por observación: no mantiene estado recurrente ni memoria entre pasos.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye visión, audio ni modo "thinking".

## Casos de uso

- Docencia de RL: reproducción del ejercicio de la lección 7 del curso "AI CITY BUILDERS" para ilustrar un pipeline PPO completo con entornos paralelos y clipping.
- Línea base de referencia: comparar nuevas políticas (SAC, TD3, PPO con curriculum) contra una puntuación media declarada de 521,4 en `Humanoid-v5`.
- Estudio de sensibilidad de hiperparámetros: usar esta configuración (lr 3e-4, clip 0,2, entropía 0,0, 8 envs) como punto de partida para analizar el efecto de variar cada uno.
- Simulación de agentes articulados: integrar la política en pipelines de simulación MuJoCo para generar trayectorias de movimiento de un humanoide con fines de análisis cinemático.
- Pruebas de infraestructura de entrenamiento: validar throughput y estabilidad de un stack PyTorch + Gymnasium + MuJoCo antes de escalar a tareas más costosas.
- Transferencia a robótica simulada: emplear el controlador como política inicial en entornos de locomoción con morfología similar, siempre que se ajuste la dimensionalidad de observación y acción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Puntuacion media en 10 episodios de prueba (Humanoid-v5) | 521,4 |
| Pasos totales de entrenamiento | 1.000.000 |
| Entornos paralelos | 8 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB para los pesos de la MLP; el cuello de botella es la simulación MuJoCo, no la red.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior acelera el renderizado y la física si se usa GPU para MuJoCo.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia de la política; el entrenamiento con 8 entornos paralelos se beneficia de CPU multinúcleo.
- Opciones de despliegue: PyTorch nativo, exportación a TorchScript u ONNX, integración con Gymnasium/MuJoCo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entorno | Pasos de entrenamiento | Puntuacion declarada | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-nadanayo-v1-humanoid-ppo-1m | ~94.000 (MLP 348-256-256-17) | Humanoid-v5 | 1.000.000 | 521,4 (media de 10 episodios) | no disponible |
| Políticas PPO de referencia de Stable-Baselines3 | no disponible | Humanoid-v5 | variable | no disponible | MIT (librería) |
| Políticas SAC de referencia | no disponible | Humanoid-v5 | variable | no disponible | MIT (librería) |

No se dispone de datos numéricos de modelos comparables en la información proporcionada; la comparación se limita a la categoría de políticas de control continuo para `Humanoid-v5`.

## Limitaciones y advertencias

- La licencia no está declarada: no se puede asumir uso comercial sin confirmación del autor.
- La puntuación de 521,4 corresponde a una media de 10 episodios de prueba; no se aporta desviación típica, semilla ni protocolo de evaluación, por lo que la reproducibilidad no está garantizada.
- El modelo está especializado exclusivamente en `Humanoid-v5` con MuJoCo 3; no generaliza a otras morfologías ni a entornos reales sin reentrenamiento.
- La entropía de 0,0 durante el entrenamiento puede reducir la exploración y favorecer políticas poco robustas ante perturbaciones no vistas.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución; en RL, el riesgo principal es la fragilidad ante cambios en la dinámica del simulador.
- El repositorio ocupa 0,0 GB y no se especifica el formato de los pesos, lo que puede dificultar la carga directa sin inspeccionar los archivos.
- No se documentan idiomas ni capacidades lingüísticas porque no aplican a este tipo de modelo.

## Enlaces

- Hugging Face: https://huggingface.co/NADANAYO/connectailab-rl-nadanayo-v1-humanoid-ppo-1m
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
