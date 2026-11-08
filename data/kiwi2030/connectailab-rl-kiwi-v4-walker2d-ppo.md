# kiwi2030/connectailab-rl-kiwi-v4-Walker2d-ppo

## Resumen

`connectailab-rl-kiwi-v4-Walker2d-ppo` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre el entorno `Walker2d-v5` de MuJoCo. Lo publica el usuario `kiwi2030` en el marco de CONNECT AI LAB, una línea de experimentos de aprendizaje por refuerzo que incluye modelos previos sobre LunarLander, decisiones de empresa y navegación de robots. No es un modelo de lenguaje: es un agente de locomoción bípeda que mapea observaciones del entorno a acciones de torque continuas.

El objetivo declarado del experimento es mantener una velocidad de avance de 2 m/s con control suave, penalizando explícitamente la rotación del torso, los cambios bruscos de acción, la inclinación del cuerpo y el vuelo simultáneo de ambos pies. Para ello se amplía la observación de 17 a 23 dimensiones añadiendo las seis acciones previas, y se sustituye la recompensa de velocidad original por una gaussiana centrada en 2 m/s.

La relevancia del modelo es más metodológica que práctica: la propia model card documenta que el experimento v4 fracasa en su objetivo. En la evaluación de 200 episodios con semilla fija, el agente no completa los 1000 pasos en ningún caso (0/200), con una media de 252,06 pasos y 1,433 m/s. Es un caso útil de ingeniería de recompensas en control continuo y de cómo penalizaciones mal calibradas degradan la estabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para PPO (Stable-Baselines3); capas y tamaños no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | pesos de Stable-Baselines3 (`.zip`), acompañados de estadísticas de normalización y `reward_wrapper.py` |

## Arquitectura y entrenamiento

El agente es una política PPO entrenada con Stable-Baselines3 sobre `Walker2d-v5` (MuJoCo). La observación se amplía de 17 a 23 dimensiones concatenando las seis acciones del paso anterior, lo que introduce memoria de corto plazo sobre la dinámica de control. La recompensa combina un término gaussiano de seguimiento de velocidad, `2 × exp(−0.5 × ((v − 2)/0.5)²)`, con penalizaciones cuadráticas sobre la velocidad angular del torso (0,05), el cambio de acción (0,1), la inclinación del torso en radianes (1,0) y una penalización fija de 0,5 por cada paso con ambos pies sin contacto (contacto definido como fuerza normal > 0,001 N). Se conservan la recompensa de supervivencia y el coste de control originales, así como la física y las condiciones de terminación del entorno.

Hiperparámetros declarados: tasa de aprendizaje 4e-4, bonus de exploración 0,001, semilla 0 y un presupuesto objetivo de un millón de pasos (1.007.616 reales). No se documenta el tamaño de la red, el número de entornos paralelos ni el desglose del dataset, ya que el entrenamiento es puramente por interacción con el simulador. Existe además una variante de reexperimento a 4 m/s documentada en `retry-4ms/README.md`, que sobrevive 200/200 episodios pero con velocidad media de −0,0058 m/s, es decir, una política que permanece en el sitio.

## Capacidades

- Control continuo de locomoción bípeda en `Walker2d-v5`: genera torques articulares a partir de observaciones de 23 dimensiones.
- Seguimiento de velocidad objetivo (2 m/s en el modelo principal; 4 m/s en el reexperimento), con error absoluto medio de 0,6545 m/s en la evaluación de 200 episodios.
- Regularización del comportamiento: reducción medida de la asimetría de contacto entre pies (de 37,31 a 0,52 puntos porcentuales frente a v3) y de la velocidad angular del torso (de 1,483 a 0,807 rad/s).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión ni audio: es un agente de control, no un modelo generativo.
- Requiere obligatoriamente las estadísticas de normalización de observaciones y el `reward_wrapper.py` para reproducir el comportamiento evaluado.

## Casos de uso

- Investigación en ingeniería de recompensas: el modelo sirve como caso documentado de cómo una combinación de penalizaciones (inclinación, cambio de acción, vuelo) puede degradar la estabilidad frente a versiones anteriores; útil para estudiar el equilibrio entre objetivos de calidad y supervivencia.
- Reproducción de experimentos de RL: con semilla fija y el wrapper de recompensa incluido, permite replicar exactamente las 200 evaluaciones reportadas y auditar la metodología.
- Docencia de PPO y Stable-Baselines3: ejemplo ejecutable de modificación de observaciones y recompensas sobre un entorno Gymnasium/MuJoCo estándar.
- Análisis de métricas de marcha: los ficheros de diagnóstico (`gait_diagnostics.json`, `evaluation.json`) permiten estudiar asimetría de contacto, tiempo de vuelo y suavidad de control.
- Comparación de variantes de política: la serie v1–v4 con la misma semilla y presupuesto de entrenamiento permite analizar el efecto de la tasa de aprendizaje, el bonus de exploración y la dimensionalidad de la observación.
- Base para ablaciones: el código de recompensa es un punto de partida para probar formulaciones alternativas de seguimiento de velocidad en `Walker2d-v5`.

## Benchmarks y rendimiento

Evaluación con semillas 1000000–1000199, acciones deterministas y estadísticas de normalización fijas:

| Métrica | v1 | v2 | v3 | v4 |
|---|---:|---:|---:|---:|
| Pasos de entrenamiento | 1.000.000 | 1.000.000 | 1.000.000 | 1.000.000 |
| Tasa de aprendizaje | 3e-4 | 4e-4 | 4e-4 | 4e-4 |
| Bonus de exploración | 0,0 | 0,001 | 0,001 | 0,001 |
| Dimensión de observación | 17 | 17 | 23 | 23 |
| Recompensa original media | 5.112,89 | 5.351,40 | 2.869,75 | 611,50 |
| Distancia media | 32,93 m | 34,83 m | 15,01 m | 2,89 m |
| Pasos de supervivencia medios | 1.000,00 | 1.000,00 | 996,60 | 252,06 |
| Episodios que alcanzan 1000 pasos | 100,00 % | 100,00 % | 99,00 % | 0,00 % |
| Velocidad media | 4,116 m/s | 4,354 m/s | 1,883 m/s | 1,433 m/s |

Métricas específicas de seguimiento de velocidad de v4 (200 episodios):

| Métrica | Valor |
|---|---:|
| Velocidad objetivo | 2,0 m/s |
| Error absoluto medio de velocidad | 0,6545 m/s |
| RMSE del error de velocidad | 0,9503 m/s |
| Proporción en banda 1,75–2,25 m/s | 55,47 % |
| Recompensa nueva media | 478,35 |

Diagnóstico de marcha sobre los mismos 20 episodios (semillas 1000000–1000019, excluyendo los primeros 100 pasos):

| Métrica | v1 | v2 | v3 | v4 |
|---|---:|---:|---:|---:|
| Proporción sin contacto en ambos pies | 59,3278 % | 55,2278 % | 46,6389 % | 56,0840 % |
| RMS de inclinación del torso | 25,4064° | 19,2079° | 22,0003° | 20,0649° |
| Diferencia de ratio de contacto pie izquierdo/derecho | 5,5500 pp | 15,7056 pp | 37,3111 pp | 0,5248 pp |
| Desviación típica de inclinación del torso | 8,8110° | 8,8732° | 10,0848° | 10,2206° |
| RMS de velocidad angular del torso | 3,1538 rad/s | 3,1525 rad/s | 1,4829 rad/s | 0,8067 rad/s |
| RMS de cambio de acción | 0,1431 | 0,1440 | 0,1142 | 0,0536 |
| Duración media de fase aérea | 0,1512 s | 0,1245 s | 0,1763 s | 0,3109 s |

Reexperimento a 4 m/s: 200/200 episodios sobreviven, pero con velocidad media de −0,0058 m/s (política estática). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU: suficiente para ejecutar la política; el coste dominante es la simulación MuJoCo, no la red neuronal.
- GPU: no necesaria para inferencia; el entrenamiento PPO de un millón de pasos puede ejecutarse en GPU de consumo (RTX 3060/4060 o superiores) o incluso en CPU, aunque con mayor tiempo.
- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y no se declaran parámetros.
- Despliegue: `stable-baselines3` con `gymnasium` y `mujoco`; se ejecuta con `pip install -r requirements.txt` y `python run_model.py`.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del paso de simulación de MuJoCo y del hardware.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Pasos | Supervivencia (1000 pasos) | Velocidad media | Licencia |
|---|---|---|---:|---:|---:|---|
| kiwi v4 (este) | Walker2d-v5, obs. 23 | PPO | 1.000.000 | 0,00 % | 1,433 m/s | no disponible |
| kiwi v3 | Walker2d-v5, obs. 23 | PPO | 1.000.000 | 99,00 % | 1,883 m/s | no disponible |
| kiwi v2 | Walker2d-v5, obs. 17 | PPO | 1.000.000 | 100,00 % | 4,354 m/s | no disponible |
| kiwi v1 | Walker2d-v5, obs. 17 | PPO | 1.000.000 | 100,00 % | 4,116 m/s | no disponible |

No se dispone de comparación con políticas de referencia externas (por ejemplo, las publicadas en RL Baselines3 Zoo o en la literatura de PPO sobre MuJoCo) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor reconoce que v4 no logra una marcha natural: 0/200 episodios alcanzan los 1000 pasos y la media es de 252,06 pasos.
- El error de seguimiento de velocidad es alto (MAE 0,6545 m/s, RMSE 0,9503 m/s) y solo el 55,47 % del tiempo se mantiene en la banda 1,75–2,25 m/s.
- La proporción de pasos sin contacto en ambos pies sube al 56,08 %, lo que indica un patrón de salto más que una marcha alternante; el autor advierte explícitamente que la simetría de contacto no implica marcha correcta.
- El reexperimento a 4 m/s produce una política estática (velocidad media ≈ 0 m/s), inservible para locomoción.
- Dependencia estricta de `reward_wrapper.py` y de las estadísticas de normalización: sin ellos, el comportamiento no es reproducible.
- La licencia no está declarada, lo que impide asumir derechos de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- No hay información sobre sesgos, robustez ante perturbaciones ni transferencia a hardware real; el modelo está entrenado y evaluado únicamente en simulación.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v4-Walker2d-ppo
- Perfil del autor: https://huggingface.co/kiwi2030
- Modelo previo v3 (LunarLander, DQN): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Modelo previo v2 (Connect Tycoon): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Política docente v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- Modelo v1 (LINK-01): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Modelo dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- Reexperimento a 4 m/s: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v4-Walker2d-ppo/tree/main/retry-4ms
- Canal de YouTube del autor: https://www.youtube.com/@kiwi_overai
- Proyecto MEETORY: https://meetory.kr
