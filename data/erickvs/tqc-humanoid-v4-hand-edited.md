# erickvs/tqc-Humanoid-v4-hand-edited

## Resumen

`erickvs/tqc-Humanoid-v4-hand-edited` es una versión modificada manualmente del agente TQC (Truncated Quantile Critics) `sb3/tqc-Humanoid-v3` del RL Baselines3 Zoo, publicado por el usuario erickvs. No se trata de un modelo de lenguaje, sino de una política de control continuo entrenada por refuerzo para la tarea `Humanoid-v4` de Gymnasium/MuJoCo, que consiste en que un humanoide simulado camine hacia delante sin caer. El modelo base es el TQC más rápido del zoo, pero sobre el MuJoCo actual cae en aproximadamente dos de cada tres episodios.

La contribución principal es una edición de pesos realizada a mano, sin reentrenamiento, sin gradientes y sin búsqueda automática. Se aplican cuatro cambios quirúrgicos: una reparación de las 84 observaciones de fuerza de contacto (índices 292 a 375) que el agente original trataba como siempre cero por un bug de `mujoco-py`; un sesgo perceptivo de +0,2 m/s en la velocidad frontal y −0,15 m/s en la lateral; y un escalado de 0,7 en la capa de salida. El resultado reduce la tasa de caídas del 64,65% al 0,05% en 2.000 episodios, manteniendo una velocidad de avance de 2,47 m/s.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de edición de pesos en políticas RL y de las incompatibilidades entre versiones de entornos de simulación. Por otro, sirve como referencia metodológica sobre cómo un cambio de versión en MuJoCo (el paso de `mujoco-py` a MuJoCo moderno) puede invalidar silenciosamente checkpoints entrenados con observaciones incompletas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (actor-crítico TQC con cuantiles truncados); política determinista con salida `0.4 · tanh(mu(...))` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 376 dimensiones por paso |
| Tipos de cuantización | no disponible (pesos en float32; existe `actor.safetensors` con los seis tensores del actor) |
| Idiomas soportados | no aplica (modelo de control, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ZIP de Stable-Baselines3 (`tqc-Humanoid-v4-edited.zip`) y `actor.safetensors` |

## Arquitectura y entrenamiento

El modelo es un agente TQC (Truncated Quantile Critics), un algoritmo actor-crítico *off-policy* que modela la distribución del retorno mediante múltiples cuantiles y trunca los más altos para reducir el sesgo por sobreestimación. La política es una red fully-connected que recibe las 376 observaciones de `Humanoid-v4` y produce las acciones continuas del humanoide. El checkpoint base `sb3/tqc-Humanoid-v3` fue entrenado originalmente en el RL Baselines3 Zoo; este repositorio no reentrena el modelo, sino que modifica 4.625 pesos y pone a cero otros 21.504 en la primera capa.

Los cambios aplicados son cuatro. Primero, la reparación de compatibilidad: los pesos de primera capa correspondientes a las 84 observaciones de fuerza de contacto (índices 292 a 375) se fijan a cero, ya que en el entrenamiento original esas entradas eran siempre cero por un bug de `mujoco-py`. Segundo, se desplazan los sesgos de primera capa para que la red perciba su velocidad frontal y la de cada cuerpo 0,2 m/s por encima de la real. Tercero, se aplica un desplazamiento análogo de −0,15 m/s en la velocidad lateral hacia el lado al que mira el torso. Cuarto, los pesos y sesgos de la capa final se multiplican por 0,7, suavizando las acciones antes del `tanh`. Los críticos y la cabeza de log-std son los originales. La edición se realizó bajo reglas estrictas que prohibían gradientes, optimizadores, ajuste de pesos a datos y búsqueda automática, por parte de dos editores de IA (Claude Fable 5.1 y Claude Opus 5.5, según la model card).

## Capacidades

- Control continuo de locomoción bípeda en el entorno `Humanoid-v4` de MuJoCo (376 observaciones, acciones continuas).
- Política determinista con salida acotada por `0.4 · tanh(...)`.
- Caminata estable durante el episodio completo en el 99,95% de los episodios evaluados (2.000 episodios, semillas 2.000.000 a 2.001.999).
- Velocidad de avance media de 2,47 m/s, ligeramente inferior a la del modelo base (2,34 m/s reportado en la tabla para el base sin editar, aunque el texto indica que el base es el más rápido del zoo).
- Inferencia sin dependencia de Stable-Baselines3 mediante `actor.safetensors` y la fórmula `action = 0.4 * tanh(mu(relu(latent_pi.2(relu(latent_pi.0(obs))))))`.
- No soporta tool calling, agentes, multilingüismo ni generación de texto: es una política de control, no un modelo generativo.

## Casos de uso

- Evaluación de robustez de políticas RL: el modelo sirve como referencia de agente que completa el episodio de forma fiable, útil para comparar la estabilidad de nuevos checkpoints de `Humanoid-v4` bajo el mismo conjunto de semillas.
- Reparación de checkpoints heredados: el procedimiento de poner a cero los pesos de las observaciones de contacto es directamente reutilizable para otros agentes del zoo entrenados con `mujoco-py` (la model card cita que la misma reparación lleva `sac-Humanoid-v3` de 447 a 6.291 de retorno).
- Docencia e investigación en edición de pesos: caso documentado de intervención manual sobre una red sin reentrenamiento, con ablaciones cuantificadas (quitar cada parte de la edición eleva las caídas al 17,8%, 2,0% y 11,2%).
- Benchmarking de entornos de simulación: permite medir el impacto del cambio de versión de MuJoCo en checkpoints antiguos, comparando el comportamiento con y sin la reparación de observaciones.
- Generación de vídeos y demos de locomoción: los clips incluidos y el script `example.py` permiten reproducir episodios deterministas para visualización o material divulgativo.
- Base para experimentos de control robusto: al ser determinista y estable, es un punto de partida adecuado para estudiar sensibilidad a perturbaciones o para inicializar políticas en tareas derivadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados; `verified: false`). Evaluación sobre 2.000 episodios de `Humanoid-v4`, semillas 2.000.000 a 2.001.999, acciones deterministas, código de evaluación propio en float64:

| Modelo | Retorno medio | Caídas | Velocidad de avance |
|---|---|---|---|
| **Este modelo** | **7.949** | **0,05%** | 2,47 m/s |
| `sb3/sac-Humanoid-v3` (con reparación) | 6.251 | 1,05% | 1,15 m/s |
| `sb3/td3-Humanoid-v3` (con reparación) | 5.542 | 1,15% | 0,67 m/s |
| `sb3/tqc-Humanoid-v3` (con reparación, sin editar) | 5.412 | 64,65% | 2,34 m/s |

Diferencias pareadas sobre las mismas semillas con intervalos bootstrap del 95%: +2.538 (+2.430 a +2.645) frente al TQC sin editar, y +1.699 (+1.680 a +1.720) frente a SAC, con mejor puntuación en 1.999 de los 2.000 episodios. Cargado mediante Stable-Baselines3 (float32), el modelo obtiene 7.951 con 0,2% de caídas en un conjunto separado de 500 semillas. El `model-index` declara `mean_reward` de 7.949,36 ± 140,50 en `Humanoid-v4`.

## Requisitos de hardware

- El modelo es una red neuronal pequeña (política fully-connected sobre 376 entradas); la inferencia cabe holgadamente en CPU y no requiere GPU.
- VRAM estimada: inferior a 1 GB en cualquier configuración; no se dispone de cifras oficiales.
- GPU recomendadas: no necesarias; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera el renderizado, no la inferencia.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Stable-Baselines3 2.9.2 con sb3-contrib 2.9.2, Gymnasium 1.4.0 y MuJoCo 4.0.0 (versiones probadas); también carga directa de `actor.safetensors` sin SB3.
- Latencia y throughput: no disponibles; al ser una red pequeña, la latencia por paso es dominada por el paso de simulación de MuJoCo, no por la red.

## Comparativa con modelos similares

| Modelo | Algoritmo | Retorno medio | Caídas | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | TQC editado | 7.949 | 0,05% | 2,47 m/s | MIT | Hugging Face |
| `sb3/tqc-Humanoid-v3` | TQC | 5.412 (con reparación) | 64,65% | 2,34 m/s | MIT (zoo) | Hugging Face |
| `sb3/sac-Humanoid-v3` | SAC | 6.251 (con reparación) | 1,05% | 1,15 m/s | MIT (zoo) | Hugging Face |
| `sb3/td3-Humanoid-v3` | TD3 | 5.542 (con reparación) | 1,15% | 0,67 m/s | MIT (zoo) | Hugging Face |

## Limitaciones y advertencias

- Entorno fijado: solo válido para `Humanoid-v4` (376 observaciones); `Humanoid-v5` usa observaciones distintas y el modelo no es compatible.
- Solo acciones deterministas: el muestreo de la política estocástica no ha sido probado.
- Fine-tuning no probado: el ZIP incluye estados de optimizador nuevos y no incluye buffer de replay.
- La edición está diseñada para este checkpoint concreto; los mismos valores no se trasladan a otros agentes.
- Resultados no verificados de forma independiente (`verified: false`); proceden del código de evaluación del propio autor, y la carga vía Stable-Baselines3 altera episodios individuales (aunque no las medias).
- Riesgo de sobreajuste a las semillas de desarrollo: los editores dispusieron de 30 ejecuciones de prueba en semillas de desarrollo, lo que puede introducir sesgo de selección pese a la evaluación en semillas separadas.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base del zoo debe citarse adecuadamente.
- No es un modelo de lenguaje: no aplican sesgos lingüísticos, alucinación textual ni capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erickvs/tqc-Humanoid-v4-hand-edited
- Modelo base: https://huggingface.co/sb3/tqc-Humanoid-v3
- Vídeo comparativo (misma semilla): https://huggingface.co/erickvs/tqc-Humanoid-v4-hand-edited/resolve/main/videos/side_by_side_seed4.mp4
- Vídeo primeras cuatro semillas: https://huggingface.co/erickvs/tqc-Humanoid-v4-hand-edited/resolve/main/videos/first_four_seeds.mp4
- Repositorio de referencia en GitHub: https://github.com/ytl0314/RL_humanoid_v4_TQC
