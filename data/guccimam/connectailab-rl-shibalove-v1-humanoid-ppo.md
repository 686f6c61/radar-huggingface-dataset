# Guccimam/connectailab-rl-shibalove-v1-humanoid-ppo

## Resumen

`connectailab-rl-shibalove-v1-humanoid-ppo` es un modelo de aprendizaje por refuerzo (RL) desarrollado por el usuario Guccimam en el marco del CONNECT AI LAB. No es un modelo de lenguaje: es una política neuronal entrenada con PPO (Proximal Policy Optimization) para controlar la locomoción de un humanoide tridimensional en el entorno `Humanoid-v5` de MuJoCo, integrado en Gymnasium. El modelo transforma una observación de 348 dimensiones en 17 pares de torque continuo, uno por articulación.

El interés del modelo es acotado pero concreto: sirve como referencia reproducible de un agente PPO que pasa de caerse en 19 pasos (88,2 puntos) a completar el máximo de 1.000 pasos sin caer (5.960,6 puntos), con una media de 4.788,1 puntos y 827,6 pasos de supervivencia en las últimas 50 partidas. Es, por tanto, un punto de partida útil para quien quiera estudiar control continuo de alta dimensionalidad, no un componente listo para producción.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. No hay información sobre licencia, idiomas, benchmarks comparativos ni formato de pesos más allá del checkpoint `model.pt` de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-Critic MLP para PPO (capas ocultas de 256, activación Tanh, log-desviación estándar aprendible) |
| Parametros totales | no disponible (no se publica el recuento; con entrada 348 y salida 17 más capas de 256, el orden de magnitud es de cientos de miles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 348 dimensiones) |
| Tipos de cuantizacion | no disponible (no se documenta cuantización; el checkpoint se distribuye en `model.pt`) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, cargado con `torch.load`), con `obs_mean` y `obs_var` incluidos en el checkpoint |

## Arquitectura y entrenamiento

La política es una red Actor-Critic de tipo perceptrón multicapa con 256 unidades ocultas y activación Tanh, que emite una distribución gaussiana sobre acciones continuas con log-desviación estándar aprendible. La observación de 348 dimensiones combina posiciones y velocidades articulares, inercia del centro de masas y fuerzas de contacto externas, normalizadas en tiempo real mediante `RunningMeanStd`. La acción es un vector `Box(17,)` que agrupa el abdomen (3), las dos piernas (4 cada una) y los dos brazos (3 cada uno).

El entrenamiento usa PPO con 1.500.000 pasos totales, 16 entornos en paralelo, 512 pasos por entorno y actualización, tamaño de lote 512, 10 épocas de optimización por actualización, recorte de política de 0,2 y tasa de aprendizaje 3e-4. No se documentan fases de RLHF ni DPO, ni innovaciones como decodificación especulativa o atención lineal, que no aplican a este dominio. Tampoco se detalla la composición del dataset, porque no hay dataset: el modelo aprende por interacción con el simulador.

## Capacidades

- Control motor continuo de 17 articulaciones con torques simultáneos en un humanoide MuJoCo.
- Locomoción bípeda estable en 3D: el autor reporta hasta 1.000 pasos sin caída.
- Normalización en línea de observaciones mediante media y varianza guardadas en el checkpoint.
- Política determinista en inferencia (se usa la media de la distribución) o estocástica si se muestrea.
- Integración directa con Gymnasium mediante `gymnasium.make("Humanoid-v5")`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües.

## Casos de uso

- Estudio de referencia de PPO en control continuo: sirve para comparar curvas de aprendizaje y estabilidad frente a otras implementaciones sobre `Humanoid-v5`, gracias a los hiperparámetros publicados.
- Arranque en frío de proyectos de robótica simulada: cargar el checkpoint y evaluar la política en MuJoCo permite validar el pipeline de simulación antes de entrenar políticas propias.
- Ajuste fino con currículo: la política entrenada puede usarse como inicialización para variantes del entorno con perturbaciones, terreno irregular o recompensas modificadas.
- Docencia y divulgación de RL: la diferencia entre 19 pasos iniciales y 1.000 pasos finales es un ejemplo didáctico medible de convergencia de PPO.
- Pruebas de robustez y análisis de sensibilidad: evaluar la política con semillas distintas (`reset(seed=...)`) y medir la varianza de la recompensa acumulada.
- Base para transferencia sim-to-real exploratoria: aunque no hay evidencia de transferencia, el control por torque es el formato habitual en robots humanoides y permite experimentar con dominios aleatorizados.
- Reproducción de experimentos: el checkpoint incluye `obs_mean` y `obs_var`, lo que facilita replicar la normalización exacta del entrenamiento.

## Benchmarks y rendimiento

Los únicos datos publicados son los del propio autor sobre `Humanoid-v5`, sin comparación con otros modelos.

| Metrica | Valor |
|---|---|
| Recompensa antes del entrenamiento | 88,2 puntos (19 pasos, caída) |
| Mejor episodio tras entrenamiento | 5.960,6 puntos (1.000 pasos, máximo del entorno, sin caída) |
| Media de las últimas 50 partidas | 4.788,1 puntos |
| Supervivencia media (últimas 50 partidas) | 827,6 pasos |
| Pasos totales de entrenamiento | 1.500.000 |
| Entornos paralelos | 16 |

No se han publicado resultados de benchmarks comparativos con otros agentes en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: viable. La red es pequeña (capas de 256 unidades) y la latencia por paso es del orden de milisegundos en CPU moderna.
- GPU: no es necesaria para inferencia; cualquier GPU con soporte PyTorch acelera el bucle, pero el cuello de botella real es el paso de MuJoCo, no la red.
- VRAM estimada: inferior a 1 GB en inferencia; no hay datos publicados de consumo durante el entrenamiento.
- GPU recomendadas para reentrenar: no disponible en la documentación; por el volumen (1,5 millones de pasos y 16 entornos), una GPU de gama media es suficiente, pero el autor no lo especifica.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en equipos sin GPU dedicada.
- Despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje. El despliegue es un script Python con PyTorch, Gymnasium y MuJoCo.
- Latencia y throughput: no disponibles de forma medida; dependen de la velocidad de renderizado y del paso físico de MuJoCo.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints comparables en la documentación proporcionada. Como referencia cualitativa, los agentes de referencia de Stable-Baselines3 para `Humanoid-v5` (PPO con políticas MLP) son el punto de comparación habitual, pero no se han publicado métricas de este modelo frente a ellos.

| Modelo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-shibalove-v1-humanoid-ppo | Humanoid-v5 | no disponible | no aplica | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito estrictamente simulado: no hay evidencia de transferencia a hardware físico ni de robustez ante perturbaciones no vistas durante el entrenamiento.
- Repositorio sin descargas ni likes en el momento de la consulta y tamaño de 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el repositorio está vacío; conviene verificarlo antes de usarlo.
- Licencia no especificada: no se puede asumir uso comercial. Es necesario contactar con el autor antes de cualquier explotación.
- Dependencia de código externo: el ejemplo de carga importa `정책두뇌` desde `train_humanoid_ppo`, un módulo que no forma parte del repositorio de Hugging Face según la información disponible; sin él, la carga del `state_dict` requiere reimplementar la clase.
- Nombres de variables en coreano en el código de ejemplo, lo que puede dificultar el mantenimiento en equipos no familiarizados.
- Sin model card en inglés ni en castellano: la documentación está en coreano, lo que limita la revisión por parte de terceros.
- Sin datos de sesgos, alucinación ni limitaciones idiomáticas, porque no es un modelo de lenguaje; esos riesgos no aplican, pero sí aplica el riesgo de sobreajuste al entorno concreto `Humanoid-v5` con su configuración por defecto.
- La métrica de 5.960,6 puntos corresponde al mejor episodio, no a la media; la media de 4.788,1 puntos es la referencia realista de rendimiento.
- No se documenta la versión de MuJoCo, Gymnasium ni PyTorch usada, lo que puede provocar incompatibilidades al reproducir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Guccimam/connectailab-rl-shibalove-v1-humanoid-ppo
- Documentación de Gymnasium sobre `Humanoid-v5`: https://gymnasium.farama.org/environments/mujoco/humanoid/
- Documentación de MuJoCo: https://mujoco.readthedocs.io/
- PPO (paper original de Schulman et al.): https://arxiv.org/abs/1707.06347
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo concreto.
