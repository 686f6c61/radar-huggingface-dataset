# Guccimam/connectailab-rl-shibalove-v1-link01-walk-ppo

## Resumen

`connectailab-rl-shibalove-v1-link01-walk-ppo` es una política de control de locomoción bípeda entrenada con PPO (Proximal Policy Optimization) sobre el simulador MuJoCo, dentro del entorno `Link01Walk-v0` del paquete `link01-gym`. La desarrolla el autor identificado como "shibalove" en el marco de los proyectos de AI CITY BUILDERS y CONNECT AI LAB, orientados a investigación en aprendizaje por refuerzo y Physical AI. No es un modelo de lenguaje: es un checkpoint de política (actor-critic) para controlar los 14 motores articulares de un robot bípedo denominado LINK-01.

El problema que resuelve es el aprendizaje desde cero de una marcha bípeda estable: partiendo de una política sin conocimiento previo, el agente debe mantener el equilibrio y desplazarse hacia delante a una velocidad objetivo de 0,18 m/s. Para evitar el mínimo local típico de "quedarse de pie sin avanzar", el autor combina una arquitectura actor-critic asimétrica (actor 64×64 con Tanh, crítico 256×256), normalización de observaciones mediante `VecNormalize` y una guía de ritmo de marcha basada en CPG (Central Pattern Generator).

Es relevante como ejemplo reproducible y de bajo coste computacional de un pipeline completo de RL para robótica: entrenamiento en 2.015.232 pasos y 6,54 minutos con 16 entornos paralelos, y evaluación declarada de 4,064 m recorridos por episodio de 20 s con 0 caídas por minuto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor-critic asimétrica para RL: actor MLP 64×64 con activación Tanh, crítico MLP 256×256 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); observación de 51 dimensiones |
| Tipos de cuantización | no disponible (checkpoint `model.zip` de Stable-Baselines3; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` |

## Arquitectura y entrenamiento

La política es una red neuronal feed-forward con arquitectura actor-critic asimétrica: el actor, que genera la acción, usa dos capas ocultas de 64 unidades con activación Tanh; el crítico, que estima el valor del estado, usa dos capas de 256 unidades. El espacio de observación es continuo de 51 dimensiones y el de acción es continuo de 14 dimensiones, correspondientes a los 14 motores articulares del robot con una postura base de ±0,18 rad. La asimetría permite un crítico más expresivo para la estimación de valor mientras se mantiene un actor compacto y rápido en inferencia.

El entrenamiento se realizó con PPO en el entorno `Link01WalkGuided-v0` (variante guiada del `Link01Walk-v0` de `link01-gym` sobre MuJoCo), con 16 entornos en paralelo, `n_steps=1024`, `batch_size=256`, `n_epochs=10`, `lr=0.0003`, `gamma=0.99`, `gae_lambda=0.95`, `clip=0.2`, `ent_coef=0.005` y semilla 42, totalizando 2.015.232 pasos en 6,54 minutos. La innovación técnica destacada es la incorporación de una guía de ritmo de marcha basada en CPG junto con la normalización de observaciones (`VecNormalize`), que según el autor permite superar el mínimo local de "quedarse quieto de pie" y alcanzar una marcha bípeda cruzada natural. No se documentan fases de RLHF ni DPO, algo por otra parte ajeno a este tipo de política.

## Capacidades

- Control de locomoción bípeda: genera comandos continuos de 14 articulaciones para desplazar al robot hacia delante.
- Seguimiento de velocidad objetivo: entrenado para una consigna de 0,18 m/s; en evaluación alcanza 0,2032 m/s de media.
- Mantenimiento de equilibrio: 0 caídas por minuto declaradas en la evaluación de 5 episodios de 20 s.
- Marcha cruzada bípeda: el autor indica que la guía CPG produce un patrón de paso cruzado natural en lugar de un arrastre o marcha estática.
- Integración con Stable-Baselines3: la política se carga con la API estándar de SB3 y requiere el `vecnormalize.pkl` para normalizar observaciones.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo "thinking": es una política de control, no un modelo generativo.

## Casos de uso

- Investigación en locomoción bípeda: punto de partida reproducible para estudiar cómo la guía CPG y la normalización de observaciones afectan a la emergencia de la marcha en un robot de 14 articulaciones.
- Docencia de RL con PPO: ejemplo completo y de coste mínimo (6,54 minutos de entrenamiento) para ilustrar un pipeline de SB3 con entornos paralelos, `VecNormalize` y evaluación por episodios.
- Benchmark de referencia para `Link01Walk-v0`: sirve como línea base de distancia, velocidad y tasa de caídas contra la que comparar nuevas políticas en el mismo entorno.
- Simulación de controladores antes del despliegue físico: validar en MuJoCo la política antes de transferirla al LINK-01 real, reduciendo riesgo de daños en hardware.
- Estudio de mínimos locales en RL: la política documenta explícitamente cómo se superó el mínimo local de "quedarse de pie", útil para analizar estrategias de recompensa y guiado.
- Pruebas de robustez y curriculum: al estar entrenada en la variante `Link01WalkGuided-v0`, permite evaluar la degradación al retirar la guía CPG o al cambiar la consigna de velocidad.
- Reproducción de experimentos: la semilla 42 y los hiperparámetros publicados permiten replicar el entrenamiento y comparar variantes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`). Evaluación sobre `Link01Walk-v0` con consigna de 0,18 m/s, 5 episodios de 20 s.

| Métrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 4,064 m |
| Velocidad media de avance | 0,2032 m/s |
| Caídas por minuto | 0,0 |
| Pasos de entrenamiento | 2.015.232 |
| Tiempo de entrenamiento | 6,54 minutos |
| Entornos paralelos | 16 |

No se han publicado resultados comparativos con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el actor es un MLP de 64×64 sobre 51 entradas y 14 salidas, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU para inferencia; para reentrenamiento, una GPU consumer (por ejemplo, RTX 3060 o superior) es suficiente dado el bajo coste declarado (6,54 minutos con 16 entornos).
- Cabe en GPU consumer: sí, sin restricciones prácticas; también en CPU para inferencia en tiempo real.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`) junto con `VecNormalize.load` para el `vecnormalize.pkl`; el `actor.json` permite exportar la política a otros runtimes. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño de la red, la inferencia por paso de simulación es del orden de microsegundos en CPU, pero no se aporta medición oficial.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables en la documentación proporcionada. Como referencia de categoría, cabría contrastar con otras políticas PPO de locomoción en MuJoCo (por ejemplo, las de `gymnasium`/`MuJoCo` o `Isaac Gym`), pero no se han aportado datos de parámetros, contexto ni rendimiento de esas alternativas, por lo que la comparación cuantitativa queda como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-shibalove-v1-link01-walk-ppo | no disponible | no aplica (obs. 51 dim.) | 4,064 m/20 s; 0,2032 m/s; 0 caídas/min | no disponible | HuggingFace, 0 descargas |
| Alternativas de locomoción bípeda en MuJoCo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resultados no verificados: las métricas de la model card están marcadas como `verified: false`; no hay evaluación independiente.
- Sin licencia declarada: la ausencia de licencia impide asumir derechos de uso comercial o de redistribución; hay que contactar con el autor antes de cualquier uso en producción.
- Especificidad de entorno: la política está entrenada para `Link01Walk-v0` con 51 observaciones y 14 acciones; no es transferible a otro robot o morfología sin reentrenamiento.
- Dependencia de la guía CPG: el entrenamiento se realizó en `Link01WalkGuided-v0`; el comportamiento al desactivar la guía en despliegue no está documentado.
- Evaluación limitada: solo 5 episodios de 20 s y una única consigna de velocidad (0,18 m/s); no se reporta robustez ante perturbaciones, terreno irregular ni cambios de carga.
- Riesgo de sobreajuste al simulador: no se documenta transferencia sim-to-real ni domain randomization.
- Sin datos de sesgo, alucinación o multilingüismo: no aplican a una política de control, pero tampoco se aporta información sobre sesgos de comportamiento (por ejemplo, asimetrías de marcha).
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad en el momento de la consulta.
- Tamaño de repo declarado de 0,0 GB: conviene verificar la integridad de los artefactos (`model.zip`, `vecnormalize.pkl`, `actor.json`) antes de usarlos.

## Enlaces

- HuggingFace: https://huggingface.co/Guccimam/connectailab-rl-shibalove-v1-link01-walk-ppo
- Vídeo de replay: https://huggingface.co/Guccimam/connectailab-rl-shibalove-v1-link01-walk-ppo/resolve/main/replay.mp4
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios del entorno `link01-gym` ni demos adicionales.
