# leegoheun/connectailab-rl-duking-v1-link01-walk-ppo

## Resumen

`connectailab-rl-duking-v1-link01-walk-ppo` es un controlador de locomoción para un robot bípedo de 14 grados de libertad denominado LINK-01, entrenado con aprendizaje por refuerzo (PPO) mediante la librería Stable-Baselines3 sobre el entorno `Link01Walk-v0` de MuJoCo (paquete `link01-gym`). No es un modelo de lenguaje ni un transformer generativo: es una política Actor-Critic que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones correspondientes a las articulaciones del robot. Lo publica el usuario `leegoheun` bajo el paraguas de CONNECT AI LAB, en el contexto del curso "AI CITY BUILDERS 강화학습 AI 7강".

El modelo resuelve el problema de generar una marcha bípeda estable sin caídas a partir de entrenamiento desde cero con PPO, combinado con una fase de imitación guiada por CPG (generador de patrones centrales) mediante DAgger. Según la model card, el entrenamiento se realizó en 2.000.000 de pasos, con 16 entornos paralelos, en aproximadamente 11,73 minutos. El resultado declarado es una velocidad media de avance de 0,1952 m/s, 3,904 m recorridos por episodio de 20 segundos y 0 caídas por minuto.

Es relevante ahora por su carácter didáctico y reproducible: es un ejemplo compacto de pipeline de RL para robótica (entorno MuJoCo, PPO, VecNormalize, exportación de política a JSON) que sirve como referencia para quienes trabajan en locomoción bípeda o en control continuo con Stable-Baselines3. El repositorio es de tamaño 0.0 GB, con 0 descargas y 0 likes en el momento de la consulta, y no dispone de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política Actor-Critic (MLP) entrenada con PPO sobre Stable-Baselines3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); observación de 51 dimensiones por paso |
| Tipos de cuantizacion | no disponible (pesos en `model.zip` de SB3 y `actor.json`; no se documenta cuantización) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` (exportación de la política) |

## Arquitectura y entrenamiento

La política es un Actor-Critic propio de PPO implementado en Stable-Baselines3, con observaciones de 51 dimensiones (estado del robot y comandos) y acciones de 14 dimensiones (una por articulación, con postura base de ±0,18 rad). El entrenamiento combina una fase de imitación guiada por CPG con DAgger (1,04x según la model card) seguida de optimización con PPO. Los hiperparámetros declarados son: 2.000.000 de pasos, learning rate 0,0003, gamma 0,99, GAE lambda 0,95, clip 0,2, 16 entornos paralelos, `n_steps` 1024 y `batch_size` 256. El entorno es `Link01Walk-v0` de `link01-gym`, simulado en MuJoCo.

No se documenta la composición del dataset (al ser RL, la experiencia se genera por interacción con el simulador), ni el número de tokens, ni si hubo ajuste adicional tipo RLHF/DPO (no aplica). La innovación técnica destacable es la hibridación de una referencia CPG con DAgger para acelerar el aprendizaje de la marcha antes de la optimización pura con PPO, junto con la exportación de la política a `actor.json` para despliegue fuera de SB3.

## Capacidades

- Control de locomoción bípeda: genera comandos articulares continuos para un robot de 14 grados de libertad.
- Seguimiento de comandos de velocidad: el entorno de prueba fija una consigna de 0,18 m/s y el modelo alcanza 0,1952 m/s de media.
- Marcha estable sin caídas: 0,0 caídas por minuto en la evaluación declarada de 5 episodios de 20 segundos.
- Entrenamiento desde cero con PPO: no requiere demostraciones humanas, aunque usa una guía CPG en la fase de imitación.
- Exportación de política: incluye `actor.json` para inferencia desacoplada de Stable-Baselines3.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción bípeda: sirve como línea base reproducible para comparar variantes de PPO, DAgger o referencias CPG sobre el mismo entorno `Link01Walk-v0` y la misma métrica de velocidad y caídas.
- Docencia de aprendizaje por refuerzo: el pipeline completo (entorno MuJoCo, SB3, VecNormalize, exportación a JSON) encaja como práctica guiada en cursos de RL aplicado a robótica, como el propio "AI CITY BUILDERS 강화학습 AI 7강".
- Prototipado de controladores en simulación: permite validar de forma rápida arquitecturas de observación/acción y recompensas antes de trasladar el controlador a hardware real.
- Evaluación de estabilidad de marcha: la métrica de caídas por minuto y la velocidad media permiten construir comparativas entre políticas y ajustar hiperparámetros de PPO.
- Integración en pipelines de simulación a gran escala: al ser un `model.zip` de SB3, se puede cargar en scripts de barrido de hiperparámetros o de evaluación masiva con múltiples semillas.
- Generación de datos sintéticos de trayectorias: la política puede usarse para recolectar rollouts etiquetados en MuJoCo que alimenten otros entrenamientos (por ejemplo, imitación o aprendizaje por refuerzo offline).
- Despliegue embebido experimental: la exportación a `actor.json` facilita portar la política a un runtime ligero para pruebas en el robot LINK-01 o en un gemelo digital.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor | Entorno / condicion |
|---|---|---|
| Distancia por episodio de 20 s | 3,904 m | `Link01Walk-v0`, comando 0,18 m/s, 5 episodios x 20 s |
| Velocidad media de avance | 0,1952 m/s | `Link01Walk-v0`, comando 0,18 m/s |
| Caidas por minuto | 0,0 | `Link01Walk-v0`, 5 episodios x 20 s |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a este tipo de política).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política MLP de 51 a 14 dimensiones, la huella es minima y cabe en CPU.
- GPU recomendadas: no se especifican; para entrenamiento con 16 entornos MuJoCo paralelos es habitual usar una GPU de gama media o superior (por ejemplo, RTX 3090/4090 o A100), aunque no hay datos publicados.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamano reducido de la política; no se documenta una cifra concreta.
- Opciones de despliegue: Stable-Baselines3 (carga de `model.zip` con `vecnormalize.pkl`), exportación a `actor.json` para inferencia propia, y MuJoCo para simulación.
- Latencia y throughput: no disponibles; el entrenamiento declarado tardo 11,73 minutos para 2.000.000 de pasos con 16 entornos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Como referencia del mismo autor y familia, existen `leegoheun/connectailab-rl-duking-v1` y `leegoheun/connectailab-rl-duking-v2-link01`, pero no se han publicado sus especificaciones ni métricas en los resultados de búsqueda, por lo que no es posible establecer una comparativa cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-duking-v1-link01-walk-ppo | no disponible | no aplica | 0,1952 m/s; 0 caidas/min (declarado) | no disponible | Hugging Face |
| connectailab-rl-duking-v1 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| connectailab-rl-duking-v2-link01 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Los resultados de benchmarks estan marcados como no verificados (`verified: false`) y proceden unicamente del autor; conviene reproducirlos antes de usarlos como referencia.
- La evaluacion se limita a 5 episodios de 20 segundos en simulacion; no hay evidencia de robustez ante perturbaciones, terrenos variables o hardware real.
- El modelo esta especializado en una unica tarea (marcha hacia delante a 0,18 m/s) sobre un robot concreto (LINK-01, 14 grados de libertad); no es generalizable a otras morfologias sin reentrenamiento.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; se debe contactar con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero si existe riesgo de sobreajuste al simulador (sim-to-real gap) y de dependencia de la distribucion de observaciones del entorno `Link01Walk-v0`.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB; la madurez y el mantenimiento del proyecto son inciertos.
- La model card esta redactada en coreano y no incluye informacion sobre semillas, numero de evaluaciones independientes ni intervalos de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-v1-link01-walk-ppo
- Modelo relacionado v1: https://huggingface.co/leegoheun/connectailab-rl-duking-v1
- Modelo relacionado v2-link01: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org
