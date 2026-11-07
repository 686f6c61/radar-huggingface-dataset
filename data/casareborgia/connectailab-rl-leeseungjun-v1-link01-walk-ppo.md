# casareborgia/connectailab-rl-leeseungjun-v1-link01-walk-ppo

## Resumen

`connectailab-rl-leeseungjun-v1-link01-walk-ppo` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 para que el robot bípedo LINK-01 aprenda a caminar desde cero en un entorno simulado de MuJoCo denominado `Link01Walk-v0`. El modelo forma parte de una serie de experimentos del programa educativo CONNECT AI LAB / AI CITY BUILDERS (Corea del Sur), identificados por el nombre del autor del experimento (`leeseungjun`) y la versión (`v1`).

La política recibe un vector de observación de 51 dimensiones y emite una acción continua de 14 dimensiones correspondientes a las articulaciones del robot, con una postura base de ±0,18 rad. El entrenamiento declarado abarca 1.024.000 pasos de entorno con 16 entornos en paralelo, lo que se tradujo en 4,39 minutos de tiempo de cómputo según la model card. El resultado es una marcha lenta pero estable: 3,889 m recorridos por episodio de 20 segundos (0,1944 m/s) sin caídas.

Su relevancia es acotada y fundamentalmente educativa o de reproducción: no es un modelo de lenguaje ni un sistema generalista, sino un artefacto de control motriz específico para un simulador propietario (`link01-gym`). Resulta útil como referencia para quienes replican pipelines de RL con Stable-Baselines3, VecNormalize y entornos MuJoCo, o para comparar políticas de locomoción bípeda en la misma familia de experimentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de red neuronal (actor-crítico) entrenada con PPO; arquitectura exacta de las capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 51 dimensiones, acción de 14 dimensiones |
| Tipos de cuantización | no disponible (pesos en formato `model.zip` de Stable-Baselines3) |
| Idiomas soportados | no aplica (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` |
| Entorno de entrenamiento | `Link01WalkGuided-v0` (link01-gym, MuJoCo) |
| Entorno de evaluación | `Link01Walk-v0` |
| Algoritmo | PPO (Stable-Baselines3) |
| Hiperparámetros | 16 entornos, `n_steps` 512, `lr` 8e-05, `gamma` 0.99, `gae_lambda` 0.95, `clip` 0.1, semilla 0 |
| Pasos de entrenamiento | 1.024.000 |
| Tiempo de entrenamiento | 4,39 minutos |

## Arquitectura y entrenamiento

El modelo es una política PPO de acción continua implementada con Stable-Baselines3 sobre el entorno `Link01WalkGuided-v0` del paquete `link01-gym`, que utiliza el motor físico MuJoCo. La observación tiene 51 componentes (estado del robot y señales del entorno) y la acción es un vector de 14 articulaciones con una postura por defecto de ±0,18 rad. El entrenamiento se realizó con 16 entornos vectorizados en paralelo, `n_steps` de 512, tasa de aprendizaje 8e-05, factor de descuento 0,99, `gae_lambda` 0,95, recorte de política 0,1 y semilla 0, acumulando 1.024.000 pasos en 4,39 minutos de cómputo.

La model card menciona explícitamente un ajuste de los pesos de recompensa ("보상 가중치 튜닝", es decir, tuning de reward shaping) como parte del proceso, lo que sugiere que la política final se obtuvo iterando sobre la función de recompensa del entorno guiado antes de evaluar en el entorno estándar `Link01Walk-v0`. No se documentan detalles sobre la topología de la red (número de capas, unidades, activaciones), el número de tokens o datos de preentrenamiento (no aplica), ni si hubo etapas adicionales de ajuste fino. El artefacto incluye un `vecnormalize.pkl`, lo que indica que la inferencia debe aplicarse con las mismas estadísticas de normalización de observaciones y recompensas usadas durante el entrenamiento.

## Capacidades

- Control locomotor bípedo: genera comandos articulares continuos de 14 dimensiones para que LINK-01 avance en línea recta en el simulador MuJoCo.
- Marcha estable a baja velocidad: mantiene una velocidad media de 0,1944 m/s bajo un comando de 0,18 m/s, con 0 caídas por minuto en la evaluación declarada.
- Generalización dentro del simulador: entrenado en `Link01WalkGuided-v0` y evaluado en `Link01Walk-v0`, lo que indica cierta transferencia entre variantes del mismo entorno.
- Integración con el ecosistema Stable-Baselines3: la política puede cargarse con `PPO.load()` y ejecutarse junto con `VecNormalize.load()`.
- Reproducibilidad: hiperparámetros, semilla y número de pasos están documentados, lo que permite replicar el experimento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión, audio ni modos de "pensamiento". No es un modelo generativo de texto.

## Casos de uso

- Reproducción de experimentos de RL: cargar `model.zip` y `vecnormalize.pkl` con Stable-Baselines3 para replicar la curva de aprendizaje y verificar los 1.024.000 pasos declarados, útil en docencia o auditoría de resultados.
- Línea base de locomoción bípeda: usar la política como referencia de rendimiento (0,1944 m/s, 0 caídas/min) al comparar nuevos entrenamientos con distintas recompensas o hiperparámetros en `Link01Walk-v0`.
- Estudio de reward shaping: dado que la model card menciona ajuste de pesos de recompensa, el modelo sirve para analizar cómo distintas ponderaciones afectan a la velocidad y estabilidad de la marcha.
- Simulación educativa en el aula: integrarlo en el programa CONNECT AI LAB / AI CITY BUILDERS como ejemplo práctico de PPO con entornos vectorizados y MuJoCo.
- Pruebas de pipelines de simulación a realidad: emplear la política como punto de partida para experimentos de transferencia sim-to-real en el robot LINK-01, aunque sin garantías de éxito dadas las limitaciones del entrenamiento.
- Validación de infraestructura de inferencia RL: comprobar el rendimiento de servidores o contenedores que ejecutan políticas Stable-Baselines3 con MuJoCo, midiendo latencia de paso y throughput.
- Docencia de PPO: desglosar los hiperparámetros (`lr` 8e-05, `clip` 0.1, `gae_lambda` 0.95) y su efecto en una tarea de control continuo con 51 observaciones y 14 acciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), evaluados en `Link01Walk-v0` con comando de 0,18 m/s, 5 episodios de 20 segundos:

| Métrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 3,889 m |
| Velocidad media de avance | 0,1944 m/s |
| Caídas por minuto | 0,0 |

No se han publicado resultados comparativos con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y la política es una red neuronal pequeña, por lo que la inferencia cabe holgadamente en cualquier GPU consumer, aunque no se especifica el número exacto de parámetros.
- GPU recomendadas: cualquiera con soporte para PyTorch, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100; el cuello de botella será la simulación MuJoCo, no la red.
- Cabe en GPU consumer: sí, con total probabilidad, dado el reducido tamaño del artefacto.
- Opciones de despliegue: Stable-Baselines3 con PyTorch, junto con `link01-gym` y MuJoCo para el entorno; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependerán del paso de simulación de MuJoCo y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métricas declaradas | Licencia |
|---|---|---|---|---|
| `connectailab-rl-leeseungjun-v1-link01-walk-ppo` (este) | PPO, locomoción bípeda | `Link01Walk-v0` | 3,889 m/20 s, 0,1944 m/s, 0 caídas/min | no disponible |
| `casareborgia/connectailab-rl-leeseungjun-ver1-roadster-ppo` | PPO, control continuo | no disponible | no disponible | no disponible |
| `ianrua/connectailab-rl-lee-hyunju-v1-link01` | Modelo de decisión textual sobre LINK-01 | CONNECT AI WORLD | no disponible | no disponible |

Los tres modelos pertenecen a la misma familia de experimentos de CONNECT AI LAB, pero abordan tareas distintas (locomoción con PPO, control de un roadster y decisión textual de marcha). No se dispone de datos suficientes para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo altamente específico: solo funciona con el entorno `link01-gym` y el robot LINK-01; no es reutilizable fuera de ese simulador.
- Rendimiento modesto: 0,1944 m/s es una velocidad muy baja, adecuada para demostración pero no para aplicaciones reales de locomoción.
- Evaluación limitada: 5 episodios de 20 segundos con una sola semilla; no hay intervalos de confianza ni evaluación estadística.
- Resultados no verificados: las métricas están marcadas como `verified: false` en el model-index.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Sin información sobre sesgos, robustez ante perturbaciones, terreno variable o transferencia sim-to-real.
- Dependencia de `vecnormalize.pkl`: usar la política sin las estadísticas de normalización originales producirá comportamientos incorrectos.
- Artefacto de tipo educativo: la model card está mayoritariamente en coreano y no documenta la arquitectura de red, lo que dificulta la auditoría técnica.
- Riesgo de sobreajuste al entorno guiado: la transferencia a `Link01Walk-v0` se declara, pero no se detalla la brecha entre ambos entornos.

## Enlaces

- Hugging Face: https://huggingface.co/casareborgia/connectailab-rl-leeseungjun-v1-link01-walk-ppo
- Modelo relacionado (roadster PPO): https://huggingface.co/casareborgia/connectailab-rl-leeseungjun-ver1-roadster-ppo
- Modelo relacionado (LINK-01 decisión textual): https://huggingface.co/ianrua/connectailab-rl-lee-hyunju-v1-link01
