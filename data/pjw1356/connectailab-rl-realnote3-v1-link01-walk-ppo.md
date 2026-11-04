# pjw1356/connectailab-rl-realnote3-v1-link01-walk-ppo

## Resumen

`connectailab-rl-realnote3-v1-link01-walk-ppo` es un modelo de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3. Lo desarrolla el usuario `pjw1356` en el contexto del proyecto CONNECT AI LAB y está orientado al control de la locomoción de un robot bípedo denominado LINK-01, simulado en MuJoCo a través del entorno `Link01Walk-v0` (paquete `link01-gym`). No es un modelo de lenguaje: es una política neuronal que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones correspondientes a las articulaciones del robot.

El modelo resuelve el problema de iniciar una marcha bípeda estable desde cero mediante RL, incorporando una guía de ritmo de marcha basada en CPG (Central Pattern Generator) y normalización de observaciones. Según la model card, se entrenó durante 300 000 pasos (9,72 minutos de cómputo) sin sufrir caídas, con una arquitectura de política de dos capas de 64 unidades y una red de valor de dos capas de 256 unidades.

Es relevante como ejemplo reproducible de un pipeline de RL con Stable-Baselines3 aplicado a robótica de locomoción, y por su carácter didáctico (asociado a la sesión 7 de un curso de RL de AI CITY BUILDERS). El rendimiento real es, sin embargo, muy limitado: la velocidad media declarada es de 0,0065 m/s, muy inferior a la comandada de 0,18 m/s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal MLP (actor [64, 64], crítico [256, 256]) entrenada con PPO sobre Stable-Baselines3 |
| Parametros totales | no disponible (no se declara el recuento; estimable en decenas de miles a partir de las arquitecturas declaradas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de RL, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `model.zip` de Stable-Baselines3, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` |
| Entorno | `Link01Walk-v0` (MuJoCo, `link01-gym`) |
| Dimensiones observación / acción | 51 / 14 |
| Hiperparámetros | lr 0,0003, clip 0,2, gamma 0,99, 300 000 pasos |

## Arquitectura y entrenamiento

El modelo es una política PPO con redes separadas para actor y crítico, ambas de tipo perceptrón multicapa. El actor tiene dos capas ocultas de 64 unidades y el crítico dos capas de 256 unidades; recibe observaciones de 51 dimensiones y emite 14 acciones continuas correspondientes a las articulaciones del robot LINK-01, con una postura base de ±0,18 rad. El entrenamiento se realizó con Stable-Baselines3 sobre el entorno `Link01Walk-v0` de MuJoCo, con normalización de observaciones mediante `VecNormalize` (cuyas estadísticas se guardan en `vecnormalize.pkl`).

La innovación declarada por el autor es la incorporación de una guía de ritmo de marcha basada en CPG (Central Pattern Generator) junto con la normalización de observaciones, lo que según la model card permite al robot iniciar una marcha erguida estable sin caerse durante los 300 000 pasos de entrenamiento. No se detalla la composición del dataset (al tratarse de RL, los datos se generan por interacción con el simulador), ni si hubo fases adicionales de ajuste fino o recompensas específicas más allá de los hiperparámetros indicados.

## Capacidades

- Control de locomoción bípeda: genera acciones articulares continuas para mantener el robot erguido y desplazarse hacia delante en el simulador MuJoCo.
- Estabilidad postural: declara 0,0 caídas por minuto durante la evaluación de 5 episodios de 20 segundos.
- Integración con Stable-Baselines3: la política puede cargarse con `PPO.load()` y ejecutarse junto con las estadísticas de `VecNormalize`.
- Exportación parcial de la política: incluye `actor.json` para inspección o reutilización de la red del actor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador de RL específico de una tarea.
- No dispone de modo de razonamiento ni de generación de texto.

## Casos de uso

- Investigación en locomoción bípeda: servir como línea base reproducible de PPO sobre MuJoCo para comparar con otros algoritmos (SAC, TD3) o variantes de recompensa en el entorno `Link01Walk-v0`.
- Docencia de RL: utilizarlo como ejemplo práctico en cursos introductorios (la model card lo vincula a la sesión 7 de un curso de RL), ya que el pipeline completo (entrenamiento, normalización y evaluación) está documentado.
- Prototipado de controladores en simulación: emplear la política como punto de partida para ajustes finos con recompensas que premien mayor velocidad, dado que la velocidad actual es muy baja.
- Validación de pipelines de entrenamiento: comprobar la integración de Stable-Baselines3 con `VecNormalize` y entornos MuJoCo personalizados antes de escalar a entrenamientos más largos.
- Reproducción de experimentos: verificar los hiperparámetros y el número de pasos declarados para reproducir el resultado de 0,129 m por episodio.
- Análisis de estabilidad: estudiar por qué una política que no cae apenas avanza, como caso de estudio de desajuste entre recompensa y objetivo de velocidad comandada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Valor | Contexto |
|---|---|---|
| Distancia por episodio de 20 s | 0,129 m | Comando 0,18 m/s, 5 episodios × 20 s |
| Velocidad media de avance | 0,0065 m/s | Frente a 0,18 m/s comandados |
| Caídas por minuto | 0,0 | Durante la evaluación |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima (menos de 1 GB); la política es una MLP pequeña y el cuello de botella es la simulación MuJoCo, no la red.
- GPU recomendadas: no es necesaria GPU para la inferencia de la política; cualquier CPU moderna es suficiente. Para reentrenar, una GPU consumer (RTX 3060 o superior) acelera el paso de simulación, aunque el entrenamiento declarado de 300 000 pasos se completó en 9,72 minutos.
- Cabe en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: carga con Stable-Baselines3 (`PPO.load`) junto con `VecNormalize.load`; requiere el paquete `link01-gym` y MuJoCo para ejecutar el entorno.
- Latencia y throughput: no disponibles; dependen de la velocidad de simulación de MuJoCo, no de la red.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, este modelo se sitúa en la categoría de políticas PPO para locomoción en MuJoCo (similar en enfoque a los entornos de Gymnasium/MuJoCo como `Walker2d` o `Humanoid`), pero no se han publicado métricas comparativas que permitan una tabla rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-realnote3-v1-link01-walk-ppo | no disponible | no aplica | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy bajo: la velocidad media (0,0065 m/s) es aproximadamente 27 veces inferior a la comandada (0,18 m/s); el robot se mantiene erguido pero apenas avanza.
- Resultados no verificados: las métricas de la model card están marcadas como `verified: false` y no hay evidencia externa de reproducción.
- Entrenamiento corto: 300 000 pasos y 9,72 minutos de cómputo sugieren una política poco convergida para locomoción.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Específico de un entorno: depende de `link01-gym` y de la versión concreta de MuJoCo; cambios en el entorno invalidan la política.
- Dependencia de `vecnormalize.pkl`: omitir las estadísticas de normalización degrada o anula el comportamiento.
- Sin validación en robot físico: no hay información sobre transferencia sim-to-real.
- Sesgos y alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo es de sobreajuste al simulador y de comportamiento frágil ante perturbaciones no vistas.
- Documentación en coreano: la model card está redactada en coreano, lo que puede dificultar la interpretación de detalles técnicos.

## Enlaces

- HuggingFace: https://huggingface.co/pjw1356/connectailab-rl-realnote3-v1-link01-walk-ppo
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios del entorno `link01-gym` ni demos adicionales.
