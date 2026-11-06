# hope6803/connectailab-rl-jarample-v1-link01-walk-ppo

## Resumen

`connectailab-rl-jarample-v1-link01-walk-ppo` es un modelo de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3. Su objetivo es controlar la locomoción de un robot bípedo simulado denominado LINK-01 dentro del entorno `Link01Walk-v0`, construido sobre el simulador físico MuJoCo a través del paquete `link01-gym`. No es un modelo de lenguaje ni un transformer generativo: es una política de control que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones (una por articulación).

El modelo ha sido publicado por el usuario `hope6803` como parte del programa educativo Connect AI Lab (curso de IA de refuerzo "AI CITY BUILDERS", lección 7) y se presenta como un artefacto de referencia para el aprendizaje de políticas de marcha desde cero. El autor declara un entrenamiento de 2.200.000 pasos en aproximadamente 29,7 minutos, con 8 entornos paralelos, y reporta una marcha estable sin caídas en las pruebas declaradas.

Su relevancia es principalmente didáctica y de investigación en robótica simulada: sirve como punto de partida reproducible para experimentar con PPO en locomoción bípeda, comparar hiperparámetros y validar pipelines de entrenamiento en MuJoCo. El repositorio tiene un tamaño de 0,0 GB y, en el momento de la consulta, cero descargas y cero likes, lo que indica que es un artefacto recién publicado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL (PPO) sobre red neuronal, implementada con Stable-Baselines3; no se especifica la topología exacta de la red |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 51 dimensiones por paso |
| Tipos de cuantizacion | no disponible (no procede para políticas RL; el artefacto se distribuye como `model.zip`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` |
| Entorno de entrenamiento | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Dimensiones de observación / acción | 51 / 14 (14 articulaciones, postura base ±0,18 rad) |
| Algoritmo e hiperparámetros | PPO; lr 0,0003, clip 0,2, n_envs 8, gamma 0,99, gae_lambda 0,95, ent_coef 0,005 |
| Pasos de entrenamiento | 2.200.000 (29,7 minutos declarados) |

## Arquitectura y entrenamiento

El modelo es una política PPO entrenada con Stable-Baselines3 sobre el entorno `Link01Walk-v0`, que simula un robot bípedo LINK-01 de 14 articulaciones en MuJoCo. La observación tiene 51 dimensiones y la acción 14 dimensiones continuas, con una postura base de referencia de ±0,18 rad. El entrenamiento se realizó con 8 entornos paralelos, tasa de aprendizaje 0,0003, recorte de política (`clip`) de 0,2, factor de descuento gamma de 0,99, lambda GAE de 0,95 y coeficiente de entropía de 0,005, durante 2.200.000 pasos.

No se detalla en la información disponible la composición de la red neuronal (número de capas, unidades por capa, función de activación) ni si se aplicaron técnicas adicionales como recompensas de conformación, currículo de comandos o domain randomization. Tampoco se especifica el diseño exacto de la función de recompensa del entorno `Link01Walk-v0`. El artefacto incluye las estadísticas de normalización de observaciones (`vecnormalize.pkl`), lo que implica que la inferencia debe aplicarlas para reproducir el comportamiento entrenado.

## Capacidades

- Control de locomoción bípeda: genera comandos articulares continuos para que el robot LINK-01 avance en línea recta dentro de la simulación.
- Marcha estable sin caídas: el autor declara 0,0 caídas por minuto en las pruebas de evaluación.
- Seguimiento de comandos de velocidad: evaluado con un comando de 0,18 m/s, aunque la velocidad media alcanzada declarada es de 0,1128 m/s.
- Política de extremo a extremo desde observaciones de 51 dimensiones a acciones de 14 dimensiones.
- Reproducibilidad en MuJoCo mediante `link01-gym` y Stable-Baselines3.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el modelo como referencia resuelta en un curso de PPO, cargando `model.zip` y `vecnormalize.pkl` con Stable-Baselines3 para inspeccionar la política y reproducir la evaluación declarada.
- Punto de partida para fine-tuning: continuar el entrenamiento con `model.learn()` sobre `Link01Walk-v0` para explorar hiperparámetros alternativos (lr, ent_coef, n_envs) y comparar curvas de recompensa frente a la política original.
- Evaluación comparativa de algoritmos: emplear esta política PPO como línea base frente a SAC, TD3 o A2C en el mismo entorno bípedo, midiendo distancia recorrida, velocidad media y caídas por minuto con el mismo protocolo (5 episodios de 20 s).
- Validación de pipelines de simulación: integrar el modelo en pruebas automatizadas de `link01-gym` para detectar regresiones en el simulador MuJoCo o en las versiones de dependencias (gymnasium, Stable-Baselines3).
- Investigación en control de bajo nivel: analizar las acciones articulares generadas (`actor.json`) para estudiar patrones de marcha, simetría y uso de la postura base de ±0,18 rad.
- Demostraciones y material divulgativo: reproducir el vídeo `replay.mp4` del repositorio para ilustrar resultados de RL en robótica dentro de talleres o presentaciones del programa Connect AI Lab.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre el entorno `Link01Walk-v0` con comando de 0,18 m/s, 5 episodios de 20 segundos:

| Metrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 2,257 m |
| Velocidad media de avance | 0,1128 m/s |
| Caídas por minuto | 0,0 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que no es un modelo de lenguaje. Tampoco se aportan métricas de recompensa acumulada, error de seguimiento de comando ni desviación lateral.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y la política es una red neuronal pequeña, por lo que la inferencia cabe holgadamente en cualquier GPU consumer, aunque no se especifica la arquitectura exacta.
- GPU recomendadas: no se especifican; para entrenamiento con 8 entornos MuJoCo paralelos se recomienda una GPU con soporte CUDA (por ejemplo, RTX 3060 o superior), aunque el autor no indica el hardware utilizado.
- GPU consumer: sí, previsiblemente cualquier GPU consumer moderna puede ejecutar la inferencia; el cuello de botella real es la simulación MuJoCo, que puede ejecutarse en CPU.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load("model.zip")` junto con `VecNormalize.load("vecnormalize.pkl")`), entorno `link01-gym` y MuJoCo. No se mencionan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput: no disponibles. El entrenamiento declarado de 2.200.000 pasos en 29,7 minutos con 8 entornos implica aproximadamente 1.235 pasos de entorno por segundo en el hardware del autor, dato derivado y no confirmado explícitamente.

## Comparativa con modelos similares

No se dispone en la información proporcionada de otros modelos comparables publicados por el mismo autor ni de métricas de referencia en `Link01Walk-v0`. Como alternativas conceptuales de la misma categoría (políticas RL para locomoción bípeda en MuJoCo) podrían citarse políticas entrenadas con PPO o SAC en entornos como Gymnasium `BipedalWalker-v3` o MuJoCo `Humanoid-v4`, pero no se aportan datos de rendimiento comparables en la documentación disponible.

| Modelo | Entorno | Algoritmo | Observación / acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jarample-v1-link01-walk-ppo | Link01Walk-v0 | PPO (SB3) | 51 / 14 | no disponible | Hugging Face |
| Políticas de referencia en BipedalWalker-v3 | BipedalWalker-v3 | PPO / SAC | 24 / 4 | según implementación | no disponible en esta ficha |
| Políticas de referencia en Humanoid-v4 | Humanoid-v4 | PPO / SAC | 376 / 17 | según implementación | no disponible en esta ficha |

## Limitaciones y advertencias

- Resultados no verificados: las métricas de la model card están marcadas con `verified: false` y no han sido replicadas de forma independiente.
- Ámbito muy restringido: la política solo se ha evaluado en `Link01Walk-v0` con un comando de 0,18 m/s; no hay evidencia de generalización a otras velocidades, terrenos, perturbaciones o variantes del robot.
- Rendimiento modesto: la velocidad media declarada (0,1128 m/s) es inferior al comando de 0,18 m/s, lo que sugiere un error de seguimiento no cuantificado.
- Dependencia fuerte del entorno: requiere `link01-gym`, MuJoCo y la versión concreta de Stable-Baselines3; cambios de versión pueden alterar el comportamiento.
- Normalización obligatoria: debe cargarse `vecnormalize.pkl` junto con `model.zip`; omitirlo invalida las observaciones y degrada la política.
- Licencia no disponible: no se especifican términos de uso comercial, redistribución ni atribución; no debe asumirse uso libre en producción.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay informes de terceros sobre su robustez.
- No apto para despliegue físico directo: no se documenta transferencia sim-to-real, domain randomization ni robustez ante ruido de sensores o latencias.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de simulación derivados del diseño del entorno y de la función de recompensa.

## Enlaces

- Hugging Face: https://huggingface.co/hope6803/connectailab-rl-jarample-v1-link01-walk-ppo
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de `link01-gym` ni demos adicionales.
