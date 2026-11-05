# allapp/connectailab-rl-allapp-v1-link01-walk-ppo

## Resumen

`connectailab-rl-allapp-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 para el control de la locomoción de un robot bípedo simulado denominado LINK-01. El modelo ha sido publicado por el usuario `allapp` en el marco del programa formativo "AI CITY BUILDERS" (lección 7 de IA con refuerzo) del CONNECT AI LAB, y su propósito es didáctico: servir como ejemplo reproducible de un pipeline completo de RL con MuJoCo.

El entorno de entrenamiento es `Link01Walk-v0`, definido en el paquete `link01-gym`, con observaciones de 51 dimensiones y acciones de 14 dimensiones correspondientes a las articulaciones del robot. El agente se entrenó durante 200.000 pasos (aproximadamente 9,65 minutos de cómputo) con una recompensa orientada a caminar a una velocidad de consigna de 0,18 m/s.

Es relevante ahora como referencia educativa y como punto de partida reproducible para experimentos de locomoción bípeda con PPO, pero no como un controlador de producción: el rendimiento declarado por el autor es muy bajo (0,013 m recorridos por episodio de 20 s, es decir, 0,0007 m/s), lo que indica que la política no ha convergido a una marcha funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con PPO (Stable-Baselines3); topología de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl`, `actor.json` |

Especificaciones del entorno y del entrenamiento, según la model card:

| Parametro | Valor |
|---|---|
| Entorno | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Dimension de observacion | 51 |
| Dimension de accion | 14 (14 articulaciones, postura base ±0,18 rad) |
| Algoritmo | PPO |
| Pasos de entrenamiento | 200.000 |
| Tiempo de entrenamiento | 9,65 minutos |
| Learning rate | 0,0003 |
| Gamma | 0,99 |
| GAE lambda | 0,95 |
| Clip range | 0,2 |
| Entornos paralelos | 4 |
| Consigna de velocidad en evaluacion | 0,18 m/s |
| Episodios de evaluacion | 5 × 20 s |

## Arquitectura y entrenamiento

El modelo es una política de RL, no un transformer ni un modelo generativo. Se entrenó con PPO, un algoritmo actor-crítico con recorte de la ratio de probabilidad (*clip*) para limitar la magnitud de las actualizaciones, sobre el entorno de simulación física MuJoCo `Link01Walk-v0`. La observación de 51 dimensiones alimenta una red neuronal cuya arquitectura concreta (número de capas y unidades) no se detalla en la información disponible; las acciones de 14 dimensiones se emiten como comandos articulares con una postura base limitada a ±0,18 rad.

El entrenamiento utilizó 4 entornos paralelos, 200.000 pasos totales, una tasa de aprendizaje de 3e-4, factor de descuento 0,99, GAE lambda 0,95 y clip de 0,2, con normalización de observaciones mediante `VecNormalize` (el fichero `vecnormalize.pkl` es imprescindible para reproducir la inferencia). No se documenta el diseño de la función de recompensa, la composición del dataset (no aplica, es aprendizaje por interacción) ni el uso de técnicas adicionales como *reward shaping* o currículo. La política exportada en `actor.json` sugiere que se separó el actor para despliegue ligero.

## Capacidades

- Control motor de un robot bípedo simulado (LINK-01) mediante comandos articulares continuos de 14 dimensiones.
- Locomoción hacia delante a baja velocidad de consigna (0,18 m/s) en el entorno `Link01Walk-v0`.
- Estabilidad postural: el autor declara 0 caídas por minuto en la evaluación de 5 episodios de 20 s.
- Inferencia con Stable-Baselines3 (`model.zip`) y con el actor exportado (`actor.json`).
- No soporta *tool calling*, ni razonamiento multi-paso, ni capacidades multilingües, ni visión, ni audio: es un agente de control, no un modelo de lenguaje.
- No dispone de modo *thinking* ni de ninguna capacidad generativa.

## Casos de uso

- Docencia de aprendizaje por refuerzo: reproducción del pipeline completo (entorno MuJoCo, PPO con Stable-Baselines3, normalización de observaciones y evaluación) en un curso introductorio, gracias a que el entrenamiento completo cabe en menos de 10 minutos de cómputo.
- Línea base (*baseline*) de locomoción bípeda: sirve como referencia mínima contra la que comparar políticas mejor entrenadas, dado que su rendimiento declarado es muy bajo y fácil de superar.
- Pruebas de infraestructura de simulación: validación de la instalación de `link01-gym`, MuJoCo y Stable-Baselines3 antes de abordar experimentos más costosos.
- Experimentos de ablación: punto de partida para variar hiperparámetros (learning rate, número de entornos, pasos de entrenamiento) y medir el efecto sobre la velocidad media y la distancia recorrida.
- Integración en entornos de evaluación automatizada: el par `model.zip` + `vecnormalize.pkl` permite cargar el agente en un *script* de evaluación y generar métricas de forma reproducible.
- Demostración de despliegue de políticas en formato ligero: el `actor.json` puede utilizarse para ejemplificar la exportación de una política a un runtime de inferencia sin la dependencia completa de Stable-Baselines3.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor | Entorno / condicion |
|---|---|---|
| Distancia por episodio de 20 s | 0,013 m | `Link01Walk-v0`, consigna 0,18 m/s, 5 episodios |
| Velocidad media de avance | 0,0007 m/s | `Link01Walk-v0`, consigna 0,18 m/s |
| Caidas por minuto | 0,0 | `Link01Walk-v0`, 5 episodios de 20 s |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,0 GB) y la naturaleza del modelo (política de RL de pequeña dimensión con observación de 51 y acción de 14), se trata de un modelo extremadamente ligero que puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA es suficiente, y la CPU es viable tanto para inferencia como para el entrenamiento declarado (9,65 minutos para 200.000 pasos con 4 entornos).
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load` con `model.zip` y `vecnormalize.pkl`), inferencia directa del actor exportado (`actor.json`) y simulación con MuJoCo a través de `link01-gym`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con el mismo entorno (`Link01Walk-v0`) ni con la misma configuración de robot LINK-01. Como referencia cualitativa de la categoría (políticas PPO para locomoción bípeda en MuJoCo), existen trabajos como los entornos `Walker2d` y `Humanoid` de Gymnasium/MuJoCo, pero no se dispone de datos de rendimiento de este modelo frente a ellos en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-allapp-v1-link01-walk-ppo | no disponible | no aplica | 0,0007 m/s (declarado) | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy limitado: la velocidad media declarada (0,0007 m/s) está tres órdenes de magnitud por debajo de la consigna (0,18 m/s), lo que indica que la política no ha aprendido una marcha funcional. No es apta para control real de un robot.
- Entrenamiento corto: 200.000 pasos y 9,65 minutos son insuficientes para converger en tareas de locomoción bípeda; el resultado debe interpretarse como una instantánea intermedia del aprendizaje, no como un modelo final.
- Métricas no verificadas: los resultados de la model card están marcados como `verified: false` y proceden únicamente del autor.
- Dependencia del entorno: el agente solo es válido para `Link01Walk-v0`; fuera de esa distribución de observaciones su comportamiento es impredecible.
- Dependencia de la normalización: es necesario cargar `vecnormalize.pkl` junto con `model.zip`; omitirlo altera las observaciones y degrada la política.
- Licencia no disponible: no se especifican términos de uso, por lo que no se puede confirmar la viabilidad de uso comercial.
- Sesgos y alucinación: no aplica en el sentido habitual de los modelos de lenguaje, pero sí existe el riesgo de comportamientos no deseados (oscilaciones, políticas degeneradas) fuera de las condiciones de evaluación.
- Idiomas y contexto: no aplica; el modelo no procesa texto.
- Advertencia para producción: no debe desplegarse en un robot físico sin una validación exhaustiva en simulación y un análisis de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allapp/connectailab-rl-allapp-v1-link01-walk-ppo
- Repositorio del autor en HuggingFace: https://huggingface.co/allapp
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org
- No se han encontrado en la información disponible enlaces al paquete `link01-gym`, al paper de PPO ni a demos adicionales.
