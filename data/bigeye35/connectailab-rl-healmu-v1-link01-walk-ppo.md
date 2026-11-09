# bigeye35/connectailab-rl-healmu-v1-link01-walk-ppo

## Resumen

`connectailab-rl-healmu-v1-link01-walk-ppo` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 para controlar la locomoción del robot bípedo LINK-01 en el entorno simulado `Link01Walk-v0`, construido sobre MuJoCo a través del paquete `link01-gym`. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 51 dimensiones a 14 acciones articulares continuas, pensado para que el robot camine hacia delante a una velocidad de consigna de 0,18 m/s.

El modelo lo publica el usuario `bigeye35` en el marco del programa formativo CONNECT AI LAB (curso de refuerzo "AI CITY BUILDERS", séptima sesión) y se presenta como un modelo de investigación colaborativa. La política se entrenó desde cero, sin inicialización a partir de un controlador previo, acumulando experiencia en cuatro instancias paralelas del entorno con normalización de observaciones mediante `VecNormalize`. La red de decisión es un perceptrón de dos capas ocultas de 64 unidades cada una.

Su relevancia es acotada y de carácter didáctico: sirve como referencia reproducible de un pipeline completo de RL para locomoción bípeda (entorno MuJoCo, PPO, normalización de observaciones, evaluación con métricas de distancia, velocidad y caídas). El rendimiento reportado es modesto: 2,398 m recorridos por episodio de 20 s, 0,1199 m/s de velocidad media y 2,4 caídas por minuto, por debajo de la consigna de 0,18 m/s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) de política para PPO; capas ocultas 64×64 |
| Parametros totales | no disponible (red 51→64→64→14, aproximadamente 8.500 parámetros según la topología declarada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de RL; observación de 51 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | Stable-Baselines3 (`.zip`), `vecnormalize_before_extra.pkl`, `actor.json` |

## Arquitectura y entrenamiento

La política es una red neuronal feedforward con dos capas ocultas de 64 neuronas, entrenada con PPO (learning rate 0,0003, clip range 0,2, semilla 42) sobre el entorno `Link01Walk-v0` de MuJoCo. El espacio de observación tiene 51 dimensiones y el de acciones 14 dimensiones continuas, correspondientes a las 14 articulaciones del robot, con una pose base de ±0,18 rad. La recolección de experiencia se paralelizó en cuatro instancias del entorno y se aplicó normalización de observaciones con `VecNormalize`, cuyo estado se guarda en `vecnormalize_before_extra.pkl` y debe cargarse junto con los pesos para reproducir la inferencia.

El entrenamiento acumuló 684.216 pasos en 37,34 minutos. El autor documenta una comparación entre dos checkpoints: al prolongar el entrenamiento disminuyeron las caídas, pero también la distancia recorrida, por lo que se seleccionó como versión final el checkpoint previo a ese entrenamiento extra (`model_before_extra.zip`), que ofrecía mayor desplazamiento. No se documentan técnicas adicionales como recompensas por imitación, curriculum learning, domain randomization ni decodificación especulativa; el pipeline es un PPO estándar de Stable-Baselines3.

## Capacidades

- Control de locomoción bípeda: genera comandos articulares continuos de 14 dimensiones para el robot LINK-01 en simulación MuJoCo.
- Marcha hacia delante a baja velocidad: alcanza 0,1199 m/s de media frente a la consigna de 0,18 m/s.
- Robustez parcial ante caídas: 2,4 caídas por minuto en la evaluación declarada.
- Política única multi-entorno: una sola red entrenada con experiencia agregada de cuatro instancias del entorno.
- Integración con Stable-Baselines3: carga directa mediante `PPO.load()` y `VecNormalize.load()`.
- Exportación de la política: incluye `actor.json` con la red de decisión en formato JSON.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento: es exclusivamente un controlador motor.

## Casos de uso

- Reproducción de experimentos de RL: cargar `model_before_extra.zip` y `vecnormalize_before_extra.pkl` con Stable-Baselines3 para replicar la evaluación declarada (5 episodios de 20 s, comando 0,18 m/s) y verificar las métricas de distancia, velocidad y caídas.
- Docencia y formación en RL: sirve como ejemplo completo y de bajo coste computacional (37 minutos de entrenamiento) de un pipeline PPO con entornos paralelos y normalización de observaciones en un curso de refuerzo.
- Punto de partida para fine-tuning: al ser una política desde cero, puede usarse como inicialización para experimentos de curriculum (velocidades crecientes, terrenos irregulares) o para probar variantes de recompensa que reduzcan las 2,4 caídas por minuto.
- Benchmark interno de entornos de locomoción: el par `Link01Walk-v0` más esta política permite comparar futuras implementaciones (SAC, TD3, PPO con recompensas shaping) contra una línea base documentada.
- Validación de pipelines de simulación a realidad: útil para estudiar la brecha sim-to-real en un bípedo de 14 articulaciones antes de invertir en entrenamientos más largos o con domain randomization.
- Pruebas de infraestructura de RL: por su tamaño mínimo (MLP 64×64), permite validar sistemas de entrenamiento distribuido, logging y evaluación sin consumir recursos de GPU relevantes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Entorno | Metrica | Valor |
|---|---|---|---|
| Walking | Link01Walk-v0 | Distancia por episodio de 20 s | 2,398 m |
| Walking | Link01Walk-v0 | Velocidad media de avance | 0,1199 m/s |
| Walking | Link01Walk-v0 | Caidas por minuto | 2,4 |

Protocolo de evaluación: comando de 0,18 m/s, 5 episodios de 20 s. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula; la política (MLP 51→64→64→14) ocupa unos pocos kilobytes y puede ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna basta para la inferencia. Para reentrenar, una GPU consumer modesta acelera la simulación, aunque MuJoCo suele estar limitado por CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en Raspberry Pi para inferencia.
- Despliegue: Stable-Baselines3 con PyTorch, MuJoCo y `link01-gym`; también es posible cargar `actor.json` en un runtime propio. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Métrica principal | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-healmu-v1-link01-walk-ppo | PPO, MLP 64×64 | Link01Walk-v0 (MuJoCo) | ~8.500 (según topología) | 0,1199 m/s; 2,4 caídas/min | no disponible |
| Políticas PPO de referencia de Stable-Baselines3 (p. ej. HalfCheetah, Walker2d) | PPO, MLP | Gymnasium MuJoCo | ~ tens de miles | recompensa por episodio (no comparable directamente) | MIT (código) |
| Alternativas de locomoción bípeda publicadas en la literatura (p. ej. políticas de Cassie o Atlas) | PPO/RL a gran escala | entornos propietarios | millones | velocidad y robustez superiores | no disponible |

No se dispone de datos públicos comparables para el mismo entorno `Link01Walk-v0`; la comparación con otras políticas de locomoción no es homogénea por diferencias de observación, acción y recompensa.

## Limitaciones y advertencias

- Rendimiento limitado: la velocidad media (0,1199 m/s) queda un 33 % por debajo de la consigna (0,18 m/s) y la tasa de caídas (2,4/min) es alta para uso real.
- Solo simulación: no hay evidencia de transferencia sim-to-real ni de domain randomization; el despliegue en el robot físico requeriría trabajo adicional.
- Dependencia del estado de normalización: sin `vecnormalize_before_extra.pkl` la política produce acciones incorrectas.
- Entorno específico: entrenada exclusivamente para `Link01Walk-v0` con 51 observaciones y 14 acciones; no es reutilizable en otras morfologías sin reentrenamiento.
- Licencia no disponible: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin verificación independiente: las métricas están marcadas como no verificadas y el repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad.
- Sesgos y alucinación: no aplica en el sentido de modelos generativos, pero la política puede exhibir comportamientos no deseados (caídas, deriva) fuera de la distribución de entrenamiento.
- Documentación escasa: la model card está en coreano y no detalla composición de recompensas, currículum ni criterios de parada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigeye35/connectailab-rl-healmu-v1-link01-walk-ppo
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- PPO (paper original): https://arxiv.org/abs/1707.06347
