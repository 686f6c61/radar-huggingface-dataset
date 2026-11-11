# NADANAYO/connectailab-rl-nadanayo-v1-link01-walk-ppo

## Resumen

`connectailab-rl-nadanayo-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante Stable-Baselines3 para controlar la locomoción de un robot bípedo denominado LINK-01. El modelo ha sido desarrollado por el usuario NADANAYO en el marco del programa CONNECT AI LAB (AI CITY BUILDERS, curso 7 de IA y refuerzo) y resuelve la tarea de caminar hacia delante en el entorno simulado `Link01Walk-v0`, definido sobre el motor físico MuJoCo a través del paquete `link01-gym`.

No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una política de control entrenada desde cero (sin inicialización a partir de demostraciones) durante 2 millones de pasos de entorno, equivalentes a unos 91,56 minutos de entrenamiento. El agente recibe observaciones de 51 dimensiones y emite acciones continuas de 14 dimensiones correspondientes a las articulaciones del robot, con una postura base fijada en ±0,18 rad.

Su relevancia es acotada pero clara dentro del ámbito de la robótica simulada y la docencia en RL: sirve como referencia reproducible de un pipeline completo (entorno, entrenamiento PPO, normalización de observaciones y exportación de política) para un robot bípedo de 14 articulaciones, y como punto de partida para experimentos de locomoción en MuJoCo. El repositorio es de tamaño 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) implementada con Stable-Baselines3; red neuronal de política y crítica (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 51 dimensiones por paso |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones del fichero `model.zip`) |
| Idiomas soportados | no aplica (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (formato de Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` (exportación de la política) |

## Arquitectura y entrenamiento

El agente es una política PPO entrenada con Stable-Baselines3 sobre el entorno `Link01Walk-v0`, integrado en el paquete `link01-gym` y simulado con MuJoCo. El espacio de observación tiene 51 dimensiones y el espacio de acción es continuo de 14 dimensiones, una por cada articulación del robot bípedo LINK-01. La acción se interpreta como desplazamiento respecto a una postura base con un margen de ±0,18 rad.

El entrenamiento se realizó desde cero (sin imitación ni curriculum documentado) durante 2.000.000 de pasos, con una tasa de aprendizaje de 0,0003 y un parámetro de recorte (clip) de 0,2, en un total de 91,56 minutos de cómputo. El repositorio incluye además un fichero `vecnormalize.pkl` con las estadísticas de normalización de observaciones y recompensas, imprescindible para reproducir la inferencia con las mismas condiciones que en entrenamiento, y un `actor.json` con la política exportada. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni mecanismos híbridos, dado que no es un modelo generativo.

## Capacidades

- Locomoción bípeda hacia delante en el entorno simulado `Link01Walk-v0` (MuJoCo), con una velocidad media de 0,1509 m/s bajo comandos de 0,18 m/s.
- Control continuo de 14 articulaciones a partir de observaciones de 51 dimensiones.
- Estabilidad: 0 caídas por minuto registradas en la evaluación de 5 episodios de 20 segundos.
- Recorrido de aproximadamente 3,018 m por episodio de 20 segundos.
- Integración directa con Stable-Baselines3 para cargar el modelo (`PPO.load`) y ejecutar `predict` sobre observaciones normalizadas.
- Exportación de la política a `actor.json`, lo que permite reutilizarla fuera del ecosistema Python de SB3 (sujeto a implementación propia del consumidor).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Docencia y reproducción de pipelines de RL: el repositorio incluye el modelo, las estadísticas de normalización y la política exportada, lo que permite a estudiantes reproducir el ciclo completo de entrenamiento PPO sobre un robot bípedo en MuJoCo y comparar curvas de aprendizaje.
- Punto de partida para fine-tuning de locomoción: al estar entrenado desde cero con 2 millones de pasos, sirve como inicialización para tareas derivadas (terrenos irregulares, cambios de velocidad, giros) mediante ajuste fino con PPO sobre variantes del entorno `Link01Walk-v0`.
- Validación de entornos `link01-gym`: el agente actúa como referencia funcional para comprobar que una instalación del entorno, las versiones de MuJoCo y las dimensiones de observación/acción (51/14) son correctas antes de lanzar entrenamientos propios.
- Simulación de control de bajo nivel en robótica: la política puede integrarse en un bucle de simulación para estudiar estabilidad, consumo de articulaciones y seguimiento de comandos de velocidad en un bípedo de 14 grados de libertad.
- Benchmark interno de algoritmos PPO: sus métricas declaradas (3,018 m por episodio, 0,1509 m/s, 0 caídas/min) permiten comparar contra otras configuraciones de hiperparámetros o algoritmos alternativos en el mismo entorno.
- Pruebas de exportación de políticas: el fichero `actor.json` facilita experimentar con la inferencia de la política fuera de Stable-Baselines3, por ejemplo en un runtime en C++ o en un motor de inferencia ligero para simulación a mayor frecuencia.
- Demostración educativa en vídeo: el repositorio incluye un `replay.mp4` que documenta el comportamiento del agente, útil para materiales de curso o presentaciones del programa CONNECT AI LAB.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Entorno / condicion |
|---|---|---|
| Distancia por episodio (20 s) | 3,018 m | `Link01Walk-v0`, comando 0,18 m/s, 5 episodios × 20 s |
| Velocidad media hacia delante | 0,1509 m/s | `Link01Walk-v0`, comando 0,18 m/s |
| Caidas por minuto | 0,0 | `Link01Walk-v0`, 5 episodios × 20 s |

No se han publicado resultados comparativos con otros agentes ni métricas adicionales (recompensa media, desviación típica entre episodios, torque consumido) en la información disponible.

## Requisitos de hardware

- Al tratarse de una política de control de pequeña dimensión (observación de 51 y acción de 14), la inferencia es extremadamente ligera: cabe en CPU sin GPU dedicada y en cualquier GPU consumer, incluidas RTX 3060, RTX 4090 o incluso iGPU modernas.
- VRAM estimada para inferencia: no disponible de forma explícita; por la naturaleza del modelo (fichero `model.zip` de un repositorio de 0.0 GB) se sitúa muy por debajo de 1 GB.
- GPU recomendadas para reentrenamiento: no especificadas por el autor. Para 2 millones de pasos de PPO en MuJoCo, una GPU consumer (RTX 3060 o superior) o incluso CPU multinúcleo suele ser suficiente, aunque no se documentan tiempos por hardware.
- Despliegue: carga mediante `stable_baselines3.PPO.load("model.zip")` junto con `VecNormalize.load("vecnormalize.pkl")`; también es posible consumir `actor.json` con una implementación propia. No aplican opciones como vLLM, llama.cpp, Ollama o TGI, que son específicas de modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen de la frecuencia de control del entorno MuJoCo y del hardware, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `connectailab-rl-nadanayo-v1-link01-walk-ppo` (este) | PPO / SB3 | `Link01Walk-v0` (MuJoCo) | no disponible | no aplica | 3,018 m/episodio; 0,1509 m/s; 0 caídas/min | no disponible | Hugging Face |
| Políticas PPO de referencia de Stable-Baselines3 (p. ej. `Humanoid-v3`, `Walker2d-v3`) | PPO / SB3 | Gymnasium / MuJoCo | no disponible | no aplica | No comparable directamente: entornos distintos | MIT (código SB3) | Repositorio oficial de SB3 |
| Políticas de locomoción de MuJoCo Gym (p. ej. `HalfCheetah`, `Ant`) | PPO / SAC / TD3 | Gymnasium / MuJoCo | no disponible | no aplica | No comparable directamente: morfologías distintas | MIT (código Gym) | Repositorio oficial de Gymnasium |

No se dispone de información sobre otros agentes entrenados específicamente en `Link01Walk-v0` que permitan una comparación directa y justa con este modelo.

## Limitaciones y advertencias

- Es un modelo de control específico para un único entorno (`Link01Walk-v0`) y una única morfología (LINK-01, 14 articulaciones); no generaliza a otros robots ni a otros simuladores sin reentrenamiento o adaptación.
- El rendimiento se ha evaluado únicamente en simulación con MuJoCo; no hay evidencia de transferencia a hardware real (sim-to-real) ni de robustez ante perturbaciones, terreno irregular o ruido sensorial.
- La velocidad alcanzada (0,1509 m/s) queda por debajo del comando (0,18 m/s), lo que indica un error de seguimiento de aproximadamente el 16 %; no se documenta la causa ni la variabilidad entre episodios.
- La evaluación se limita a 5 episodios de 20 segundos; la muestra es pequeña y las métricas no están verificadas de forma independiente (`verified: false` en la model card).
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial ni la redistribución del modelo o de los ficheros asociados.
- No se documentan sesgos en el sentido de modelos lingüísticos, pero sí un sesgo de dominio evidente: la política solo ha visto el entorno y la distribución de comandos usados en entrenamiento.
- No se especifican los hiperparámetros completos de PPO (tamaño de red, número de épocas, tamaño de lote, coeficiente de entropía), lo que dificulta la reproducción exacta del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y no consta validación externa de la comunidad; debe tratarse como un artefacto educativo más que como un componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NADANAYO/connectailab-rl-nadanayo-v1-link01-walk-ppo
- Stable-Baselines3 (librería de entrenamiento): https://github.com/DLR-RM/stable-baselines3
- MuJoCo (motor físico del entorno): https://github.com/google-deepmind/mujoco
- Paquete `link01-gym` (entorno `Link01Walk-v0`): no disponible
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Programa CONNECT AI LAB / AI CITY BUILDERS: no disponible
