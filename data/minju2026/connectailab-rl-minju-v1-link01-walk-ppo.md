# minju2026/connectailab-rl-minju-v1-link01-walk-ppo

## Resumen

`connectailab-rl-minju-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO (Proximal Policy Optimization) mediante Stable-Baselines3 para controlar la locomoción de un robot bípedo denominado LINK-01 dentro de un entorno de simulación MuJoCo llamado `Link01Walk-v0`, perteneciente al paquete `link01-gym`. Lo desarrolla el usuario `minju2026` en el contexto del programa formativo CONNECT AI LAB (lección 7 de "AI CITY BUILDERS" sobre RL). No es un modelo de lenguaje: es una política de control (actor) que mapea observaciones de 51 dimensiones a acciones continuas de 14 dimensiones correspondientes a las articulaciones del robot.

El modelo es relevante como ejemplo reproducible de un pipeline completo de RL para robótica: entrenamiento desde cero, normalización de observaciones con `VecNormalize`, exportación del actor a JSON y evaluación estandarizada sobre un entorno propio. No obstante, sus resultados declarados son muy limitados: el agente apenas avanza 0,025 m en 20 segundos (velocidad media de 0,0013 m/s), muy por debajo de la consigna de 0,18 m/s, aunque no registra caídas.

Se trata de un artefacto de carácter didáctico y experimental, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin información sobre idiomas ni sobre el dataset de entrenamiento más allá del entorno. El repositorio ocupa 0,0 GB y contiene los ficheros `model.zip`, `vecnormalize.pkl` y `actor.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política actor-crítico de red neuronal (MLP) entrenada con PPO sobre Stable-Baselines3; no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible (no se declara el número de parámetros de la red) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 51 dimensiones por paso y acción de 14 dimensiones |
| Tipos de cuantizacion | no disponible (no aplica a políticas RL de este tamaño) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (formato de Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización) y `actor.json` (exportación del actor) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (`clip` = 0,2) y tasa de aprendizaje de 0,0003. El espacio de observación tiene 51 dimensiones y el de acción 14 dimensiones continuas, una por articulación, con una postura por defecto de ±0,18 rad. El entrenamiento se realizó desde cero durante 200.000 pasos, con un tiempo declarado de 11,85 minutos, lo que sugiere un entrenamiento corto y probablemente en CPU o en una GPU de gama media. Las observaciones se normalizan mediante `VecNormalize`, cuyas estadísticas se guardan en `vecnormalize.pkl` y son imprescindibles para reproducir la inferencia.

No se especifica la composición del dataset (al ser RL, los datos provienen de la interacción con el simulador), ni si hubo recompensas de shaping, ni detalles sobre la arquitectura exacta de las redes (número de capas, unidades ocultas, función de activación). El entorno `Link01Walk-v0` (MuJoCo, paquete `link01-gym`) define la dinámica y la función de recompensa, pero no se documentan sus parámetros en la información disponible. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal, ya que no aplican a este tipo de modelo.

## Capacidades

- Control continuo de un robot bípedo LINK-01 con 14 articulaciones en simulación MuJoCo.
- Locomoción básica: el agente se mantiene en pie (0 caídas por minuto) durante episodios de 20 segundos.
- Seguimiento de consigna de velocidad nominal de 0,18 m/s, aunque el rendimiento real medido es de 0,0013 m/s.
- Inferencia determinista o estocástica mediante la política exportada en `actor.json`.
- Compatibilidad con el ecosistema Stable-Baselines3 para recarga, evaluación y ajuste fino.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo "thinking": no es un modelo generativo de texto.

## Casos de uso

- Docencia y formación en RL: sirve como ejemplo reproducible de un pipeline PPO completo (entorno, entrenamiento, normalización y exportación del actor) para cursos como el de CONNECT AI LAB.
- Reproducción de experimentos: permite verificar el flujo de entrenamiento con `stable-baselines3` y `VecNormalize` sobre el entorno `Link01Walk-v0`, útil para comparar hiperparámetros.
- Punto de partida para ajuste fino: al estar en formato `model.zip`, se puede recargar y continuar el entrenamiento con más pasos o recompensas rediseñadas para mejorar la velocidad.
- Evaluación comparativa de entornos: sirve como línea base de referencia (baseline) para medir si nuevas políticas mejoran la velocidad de 0,0013 m/s y la distancia de 0,025 m por episodio.
- Pruebas de integración de simulación a control: el `actor.json` facilita la exportación de la política a otros lenguajes o sistemas de control para prototipos de robótica.
- Investigación sobre estabilidad: el registro de 0 caídas por minuto permite estudiar políticas conservadoras que priorizan el equilibrio frente al desplazamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), evaluados sobre `Link01Walk-v0` con consigna de 0,18 m/s, 5 episodios de 20 segundos:

| Metrica | Valor declarado |
|---|---|
| Distancia por episodio de 20 s (m) | 0,025 |
| Velocidad media de avance (m/s) | 0,0013 |
| Caídas por minuto | 0,0 |

No se han publicado otros resultados de benchmarks en la información disponible, ni comparaciones con políticas alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una política MLP de este tipo (observación 51, acción 14) cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier RTX 3060, RTX 4090, A100 o H100 es sobredimensionada para la inferencia. Para reentrenar, una GPU consumer básica es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en placas integradas.
- Opciones de despliegue: inferencia directa con Stable-Baselines3 (`PPO.load`), exportación del actor a JSON para integración en otros runtimes, y simulación con MuJoCo y `link01-gym`.
- Latencia y throughput estimados: no disponibles; por el tamaño de la red, la latencia por paso debería ser del orden de microsegundos a milisegundos, pero no se aportan mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables de locomoción bípeda sobre el mismo entorno `Link01Walk-v0` ni alternativas con métricas publicadas en el mismo benchmark.

## Limitaciones y advertencias

- Rendimiento muy bajo: la velocidad media declarada (0,0013 m/s) está dos órdenes de magnitud por debajo de la consigna de 0,18 m/s; la distancia de 0,025 m en 20 s indica un desplazamiento prácticamente nulo.
- Entrenamiento corto (200.000 pasos, 11,85 minutos) que probablemente no basta para converger en una tarea de locomoción bípeda.
- Resultados no verificados (`verified: false`) y sin comparación con baselines; no deben tomarse como referencia de calidad.
- Sin licencia declarada: no se concede explícitamente permiso de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sin información sobre sesgos, ya que no es un modelo de lenguaje, pero sí sobre riesgos de sobreajuste al entorno simulado y de transferencia limitada a un robot físico.
- Dependencia crítica de `vecnormalize.pkl`: usar el modelo sin las estadísticas de normalización correspondientes produce resultados incorrectos.
- Sin documentación de la arquitectura de red, hiperparámetros de recompensa ni composición del entorno, lo que dificulta la reproducibilidad completa.
- No apto para tareas de generación de texto, razonamiento, código, visión ni agentes conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minju2026/connectailab-rl-minju-v1-link01-walk-ppo
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
