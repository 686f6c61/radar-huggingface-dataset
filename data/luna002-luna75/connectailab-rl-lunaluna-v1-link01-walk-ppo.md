# Luna002-Luna75/connectailab-rl-lunaluna-v1-link01-walk-ppo

## Resumen

`connectailab-rl-lunaluna-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 para controlar la locomoción de un robot bípedo simulado denominado LINK-01. El modelo ha sido publicado por el usuario Luna002-Luna75 en el marco de las prácticas del curso de reinforcement learning de AI CITY BUILDERS, en colaboración con CONNECT AI LAB. No es un modelo de lenguaje: es una política neuronal que mapea observaciones (51 dimensiones) a acciones motoras (14 dimensiones correspondientes a las articulaciones del robot).

El problema que resuelve es concreto: aprender desde cero una marcha estable hacia delante en el entorno `Link01Walk-v0`, construido sobre el simulador físico MuJoCo a través de `link01-gym`. El agente se evalúa con comandos de velocidad de 0,18 m/s durante 5 episodios de 20 segundos cada uno, obteniendo 4,14 m recorridos por episodio, una velocidad media de 0,207 m/s y cero caídas por minuto.

Su relevancia es fundamentalmente didáctica y de investigación en robótica simulada: sirve como referencia reproducible de un pipeline PPO completo (entrenamiento, normalización de observaciones y exportación de política) para quienes trabajan en locomoción de bípedos dentro del ecosistema MuJoCo. El repositorio tiene un tamaño de 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning (PPO, Stable-Baselines3); topología de la red no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 51 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl`, `actor.json` |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clip* 0,2) y optimizador con tasa de aprendizaje 0,0003. La configuración de entrenamiento reportada incluye 2.000.000 de pasos totales, 16 entornos paralelos (`n_envs`), 256 pasos por entorno y por actualización (`n_steps`), completando el entrenamiento en 15,13 minutos. El entorno utilizado durante el entrenamiento es `Link01WalkGuided-v0`, una variante guiada del entorno de evaluación `Link01Walk-v0`, ambos pertenecientes al paquete `link01-gym` sobre MuJoCo.

El espacio de observación tiene 51 dimensiones y el de acciones 14, correspondientes a las articulaciones del robot bípedo LINK-01, con una postura base de ±0,18 rad. El repositorio incluye un fichero `vecnormalize.pkl`, lo que indica que las observaciones (y probablemente las recompensas) se normalizaron durante el entrenamiento; este fichero es imprescindible para reproducir la inferencia con las mismas estadísticas. También se incluye `actor.json`, presumiblemente una exportación de la política del actor para su uso fuera de Stable-Baselines3. No se detalla la composición de la función de recompensa ni el número de tokens o episodios de entrenamiento más allá de los pasos indicados.

## Capacidades

- Control motor de locomoción bípeda: genera acciones articulares de 14 grados de libertad para desplazar el robot LINK-01 hacia delante.
- Seguimiento de comandos de velocidad: entrenado y evaluado con comandos de 0,18 m/s, alcanzando 0,207 m/s de media.
- Estabilidad de marcha: 0,0 caídas por minuto en las pruebas reportadas.
- Aprendizaje desde cero: la política se entrena mediante PPO sin demostraciones previas.
- Inferencia con normalización de observaciones: requiere cargar `vecnormalize.pkl` junto con el modelo.
- Exportación de política: el fichero `actor.json` permite extraer el actor para despliegues alternativos.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento explícito, al no ser un modelo de lenguaje.

## Casos de uso

- Reproducción de prácticas docentes de RL: cargar `model.zip` y `vecnormalize.pkl` en Stable-Baselines3 con el entorno `Link01Walk-v0` para verificar el resultado del entrenamiento y comparar hiperparámetros en el curso de AI CITY BUILDERS.
- Línea base para experimentos de locomoción: usar este agente como referencia de rendimiento (4,14 m por episodio de 20 s, 0,207 m/s) al probar variantes de recompensa, observaciones o algoritmos en `link01-gym`.
- Estudio de estabilidad en bípedos: analizar la política entrenada con cero caídas por minuto para identificar patrones de marcha estables y trasladarlos a otros controladores.
- Despliegue en simulación MuJoCo: integrar el agente en pipelines de evaluación automatizada que ejecuten rollouts en `Link01Walk-v0` y registren métricas de distancia y velocidad.
- Extracción del actor para inferencia ligera: emplear `actor.json` para ejecutar la política en un runtime sin Stable-Baselines3, por ejemplo en un bucle de control propio sobre MuJoCo.
- Docencia y talleres de PPO: ilustrar el flujo completo de entrenamiento (16 entornos, 2M de pasos, normalización vectorizada) como ejemplo reproducible en 15 minutos de cómputo.
- Comparación de algoritmos de RL: confrontar PPO con SAC o TD3 sobre el mismo entorno y las mismas métricas declaradas en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Entorno | Metrica | Valor |
|---|---|---|---|
| Walking | Link01Walk-v0 | Distancia por 20 s (m) | 4,14 |
| Walking | Link01Walk-v0 | Velocidad media hacia delante (m/s) | 0,207 |
| Walking | Link01Walk-v0 | Caidas por minuto | 0,0 |

Protocolo de evaluación: comandos de 0,18 m/s, 5 episodios de 20 segundos cada uno. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y la red es de pequeña escala, por lo que la inferencia debería caber en cualquier GPU consumer, aunque no se especifica.
- GPU recomendadas: no disponible; para entrenamiento con 16 entornos MuJoCo en paralelo se recomienda una GPU dedicada, pero el autor no indica modelo concreto.
- GPU consumer: presumiblemente compatible con tarjetas de gama media o baja, dado el tiempo de entrenamiento reportado (15,13 minutos), aunque no se confirma.
- Opciones de despliegue: Stable-Baselines3 (carga de `model.zip` con `vecnormalize.pkl`), inferencia personalizada a partir de `actor.json`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros agentes de locomoción para el robot LINK-01 ni modelos comparables publicados con métricas equivalentes en `Link01Walk-v0`.

## Limitaciones y advertencias

- Los resultados de los benchmarks están marcados como no verificados (`verified: false`) en el model-index; proceden únicamente del autor.
- El modelo está entrenado y evaluado exclusivamente en el entorno simulado `Link01Walk-v0`; no hay evidencia de transferencia a hardware físico ni a otros robots.
- El rendimiento se ha medido solo con comandos de 0,18 m/s; no se reporta comportamiento con comandos de velocidad distintos ni con perturbaciones.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial ni la redistribución.
- No se especifican sesgos, pero al ser una política entrenada con una recompensa concreta puede exhibir comportamientos frágiles fuera de la distribución de entrenamiento.
- La inferencia requiere el fichero `vecnormalize.pkl`; omitirlo altera las observaciones y degrada la política.
- El repositorio no registra descargas ni likes, y su tamaño es de 0,0 GB, lo que sugiere que los artefactos podrían no estar efectivamente subidos o son de tamaño mínimo; conviene verificar la integridad de los ficheros antes de usarlo.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni emplearse para tareas de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-v1-link01-walk-ppo
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
