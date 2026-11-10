# sf7com/connectailab-rl-kenny-v1-link01-walk-ppo

## Resumen

`connectailab-rl-kenny-v1-link01-walk-ppo` es una política de control de locomoción entrenada con aprendizaje por refuerzo (PPO) para el robot bípedo simulado LINK-01 en el entorno `Link01Walk-v0`, implementado sobre MuJoCo a través de la librería `link01-gym`. Lo desarrolla el consultor de transformación con IA Kenny, en el marco de las actividades de CONNECT AI LAB y del curso de refuerzo "AI CITY BUILDERS" (7.ª lección). No es un modelo de lenguaje: es un artefacto de `stable-baselines3` que contiene una política entrenada para generar comandos articulares que hagan caminar al robot hacia delante a una velocidad objetivo.

El modelo resuelve el problema clásico de locomoción bípeda desde cero: partiendo de una política aleatoria, aprende a mantenerse en pie y a avanzar sin caerse. La observación tiene 51 dimensiones y la acción 14 (una por articulación, con desviación máxima de ±0.18 rad respecto a la postura por defecto). El entrenamiento se realizó con 32 entornos en paralelo, `n_steps` 512, `batch_size` 4096, 10 épocas por actualización, tasa de aprendizaje 3e-4, `gamma` 0.99, `gae_lambda` 0.95 y recorte de PPO de 0.2, con `log_std_init` de -0.5 y rango de velocidad de comando `vx` entre 0.12 y 0.22 m/s.

Es relevante como ejemplo reproducible y didáctico de un pipeline completo de RL para robótica: el autor publica no solo los pesos (`model.zip`) sino también el normalizador de observaciones (`vecnormalize.pkl`), la definición de la política (`actor.json`) y material audiovisual del progreso de aprendizaje. La evaluación declarada con comando de 0.18 m/s durante 5 episodios de 20 s arroja 4,211 m por episodio, 0,2105 m/s de velocidad media y 0 caídas por minuto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de PPO (stable-baselines3); perceptrón multicapa con observación de 51 dimensiones y acción continua de 14 dimensiones |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observación es un vector de estado de 51 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el artefacto es `model.zip` de PyTorch) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (stable-baselines3), `vecnormalize.pkl` (normalizador de observaciones), `actor.json` (definición de la política) |

## Arquitectura y entrenamiento

La política es una red de PPO con acción continua gaussiana sobre 14 articulaciones, entrenada con `stable-baselines3` sobre el entorno `Link01Walk-v0` de `link01-gym` (MuJoCo). La observación de 51 dimensiones codifica el estado del robot y el comando de velocidad; la acción se interpreta como desplazamiento angular respecto a la postura por defecto, limitado a ±0.18 rad por articulación. El entrenamiento usó 32 entornos vectorizados, `n_steps` 512, `batch_size` 4096, 10 épocas de optimización por actualización, `lr` 3e-4, `gamma` 0.99, `gae_lambda` 0.95 y recorte de PPO 0.2, con `log_std_init` de -0.5 y muestreo de velocidad de comando `vx` uniforme en [0.12, 0.22] m/s, semilla 0.

El autor reporta 2.015.232 pasos de entrenamiento efectivos (5,4 minutos de cómputo) y un total de 10.010.624 pasos ejecutados en el entorno, con selección del mejor checkpoint cada millón de pasos según la velocidad alcanzada. La curva de aprendizaje publicada muestra la progresión: política aleatoria con -0,93 m en 8 s y 6 caídas; 210.000 pasos con 0,02 m y 0 caídas (fase de mantenerse en pie); 2,02 millones de pasos (mejor) con 1,67 m y 0,208 m/s; y estabilización en torno a 1,62-1,64 m y 0,205-0,206 m/s hasta los 10,01 millones de pasos. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, por tratarse de un problema de control motor.

## Capacidades

- Generación de comandos articulares continuos para locomoción bípeda hacia delante en el simulador MuJoCo con el robot LINK-01.
- Seguimiento de comandos de velocidad dentro del rango entrenado (`vx` entre 0,12 y 0,22 m/s), con evaluación declarada a 0,18 m/s.
- Estabilidad sin caídas: 0 caídas por minuto en la evaluación declarada de 5 episodios × 20 s.
- Normalización de observaciones incluida (`vecnormalize.pkl`), necesaria para reproducir el comportamiento entrenado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes basados en lenguaje.
- No tiene capacidades multilingües ni procesamiento de texto, visión o audio.
- No dispone de modo "thinking" ni de mecanismos de cadena de pensamiento.

## Casos de uso

- Reproducción de experimentos de RL en robótica: cargar `model.zip` junto con `vecnormalize.pkl` en `stable-baselines3` y evaluar la política en `Link01Walk-v0` para verificar los 4,211 m por episodio declarados.
- Docencia de aprendizaje por refuerzo: el material del curso "AI CITY BUILDERS" y las curvas de progreso (aleatorio → 210k → 2,02M → 10,01M pasos) permiten ilustrar el bucle entrenamiento-evaluación y el efecto del checkpointing.
- Punto de partida para ajuste fino: reanudar el entrenamiento con otro rango de `vx`, otra recompensa o perturbaciones añadidas para estudiar transferencia y robustez en el robot LINK-01.
- Comparación de algoritmos: usar esta política PPO como línea base frente a SAC, TD3 o AMP en el mismo entorno `Link01Walk-v0` con idéntica semilla y presupuesto de pasos.
- Análisis de estabilidad: estudiar la evolución de la altura del centro de masas y del consumo de par a lo largo de los 10 millones de pasos para caracterizar el compromiso velocidad-estabilidad.
- Integración en pipelines de simulación a escala: al ser un artefacto pequeño de `stable-baselines3`, puede ejecutarse en paralelo en CPU para barridos de hiperparámetros o evaluación masiva de episodios.
- Base para transferencia sim-a-real: servir como política inicial para experimentos de domain randomization antes de un eventual despliegue en hardware LINK-01, aunque no se documenta ningún resultado en robot físico.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Tarea | Entorno | Metrica | Valor |
|---|---|---|---|
| walking | Link01Walk-v0 | Distancia por episodio de 20 s (m) | 4,211 |
| walking | Link01Walk-v0 | Velocidad media hacia delante (m/s) | 0,2105 |
| walking | Link01Walk-v0 | Caidas por minuto | 0,0 |

Progresión del aprendizaje publicada por el autor (8 s por episodio, comando 0,18 m/s):

| Checkpoint | Distancia en 8 s (m) | Velocidad media (m/s) | Caidas |
|---|---|---|---|
| Aleatorio (inicial) | -0,93 | -0,115 | 6 |
| 210.000 pasos | 0,02 | 0,002 | 0 |
| 2.020.000 pasos (mejor) | 1,67 | 0,208 | 0 |
| 4.010.000 pasos | 1,64 | 0,206 | 0 |
| 6.010.000 pasos | 1,63 | 0,206 | 0 |
| 10.010.000 pasos (final) | 1,62 | 0,205 | 0 |

No se han publicado comparaciones con otras políticas en el mismo entorno dentro de la información disponible.

## Requisitos de hardware

- Inferencia en CPU: la política es una red pequeña de `stable-baselines3`; el repositorio ocupa 0,0 GB, por lo que la inferencia cabe holgadamente en cualquier CPU moderna sin GPU.
- VRAM estimada: no aplica en la práctica; si se ejecuta en GPU, el consumo es inferior a 1 GB.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) acelera el entrenamiento, no la inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo; también en CPU sin aceleración.
- Opciones de despliegue: `stable-baselines3` (carga de `model.zip` + `vecnormalize.pkl`), con MuJoCo y `link01-gym` para el simulador. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El autor reporta 5,4 minutos de entrenamiento para 2.015.232 pasos efectivos, lo que da una idea del coste de cómputo del entrenamiento, no de la inferencia.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables entrenadas en `Link01Walk-v0` ni sobre resultados de otros algoritmos en el mismo entorno. Se indica "no disponible" para parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas.

| Modelo | Entorno | Algoritmo | Distancia (m/episodio) | Velocidad (m/s) | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-kenny-v1-link01-walk-ppo | Link01Walk-v0 | PPO | 4,211 | 0,2105 | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto de control motor, no un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento simbólico.
- La evaluación declarada está marcada como `verified: false`; los resultados (4,211 m, 0,2105 m/s, 0 caídas) provienen del propio autor y no han sido replicados de forma independiente en la información disponible.
- El rendimiento está acotado al rango de comandos de velocidad entrenado (`vx` en [0,12, 0,22] m/s); fuera de ese intervalo el comportamiento no está caracterizado.
- Depende del normalizador `vecnormalize.pkl`: cargar solo `model.zip` sin él puede degradar o invalidar la política.
- Entrenado exclusivamente en simulación MuJoCo (`Link01Walk-v0`); no hay evidencia de transferencia a hardware físico ni de robustez ante perturbaciones no modeladas.
- No se documentan sesgos de datos en el sentido habitual, pero sí un posible sobreajuste al entorno y a la semilla 0 empleada en el entrenamiento.
- La licencia no está disponible, por lo que el uso comercial queda sin marco legal explícito y requiere contactar con el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad de validación ni issues públicos.
- No se documentan limitaciones de contexto ni de idioma porque no aplican a este tipo de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sf7com/connectailab-rl-kenny-v1-link01-walk-ppo
- Repositorio `stable-baselines3`: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- `link01-gym`: no disponible (no se proporciona URL en la información disponible)
- CONNECT AI LAB: no disponible (no se proporciona URL en la información disponible)
- Curso "AI CITY BUILDERS", 7.ª lección de RL: no disponible (no se proporciona URL en la información disponible)
