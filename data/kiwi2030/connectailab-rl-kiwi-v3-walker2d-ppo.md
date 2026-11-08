# kiwi2030/connectailab-rl-kiwi-v3-Walker2d-ppo

## Resumen

`connectailab-rl-kiwi-v3-Walker2d-ppo` es un agente de control continuo entrenado con PPO (Proximal Policy Optimization) sobre el entorno `Walker2d-v5` de MuJoCo, publicado por el autor `kiwi2030` en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal de reinforcement learning que controla un robot bípedo simulado de dos dimensiones para que camine manteniendo una velocidad objetivo de 2 m/s.

El modelo pertenece a una serie de experimentos del autor enmarcados en CONNECT AI LAB, junto a otros artefactos como `connectailab-rl-kiwi-v3-lunarlander` (DQN para aterrizaje) o `connectailab-rl-kiwi-v2` (PPO para decisiones de empresa). La versión v3 se distingue de las anteriores por modificar tanto el espacio de observación (de 17 a 23 dimensiones, añadiendo las 6 acciones previas) como la función de recompensa, sustituyendo el incentivo de avance rápido por una recompensa gaussiana centrada en 2 m/s, con penalizaciones explícitas por rotación del torso y por cambios bruscos de acción.

El interés del artefacto es fundamentalmente didáctico y experimental: documenta de forma inusualmente detallada la comparación entre v1, v2 y v3 sobre 200 episodios con semillas fijas, incluyendo métricas de calidad de marcha (ratio de vuelo, desviación de inclinación del torso, RMS de velocidad angular). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño declarado es de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (PPO) sobre entorno MuJoCo `Walker2d-v5`; topología de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pesos de Stable-Baselines3 (`.zip`); no se especifica safetensors ni GGUF |
| Libreria | stable-baselines3 |
| Entorno | `Walker2d-v5` (Gymnasium / MuJoCo) |
| Dimension de observacion | 23 (17 originales + 6 acciones previas) |
| Dimension de accion | continua, 6 (no confirmado explicitamente en la card) |
| Presupuesto de entrenamiento | 1.007.616 pasos (~1M) |
| Semilla de entrenamiento | 0 |
| Hiperparametros | learning rate 4e-4, bonus de exploracion 0.001 |
| Objetivo de control | velocidad de 2 m/s con rotacion y cambios de accion suavizados |

## Arquitectura y entrenamiento

La política se entrena con PPO mediante Stable-Baselines3 sobre el entorno `Walker2d-v5` de MuJoCo. La card no detalla la topología de la red (número de capas ni unidades), por lo que ese dato queda como no disponible. Lo relevante desde el punto de vista técnico son las dos modificaciones introducidas en v3 respecto a v1 y v2:

- **Observación ampliada a 23 dimensiones**: a las 17 observaciones originales del entorno se añaden las 6 acciones ejecutadas en el paso anterior, lo que da al agente información sobre su propia dinámica de control reciente.
- **Recompensa rediseñada**: se conservan las componentes originales de supervivencia y coste de control, pero la recompensa de avance se reemplaza por una gaussiana `2 × exp(−0.5 × ((v − 2) / 0.5)²)` centrada en 2 m/s. Se añaden dos penalizaciones: `0.05 × ω²` sobre la velocidad angular del torso y `0.1 × Σ(a_t − a_{t−1})²` sobre la variación de acción entre pasos consecutivos.

El entrenamiento usa semilla 0, learning rate 4e-4 y bonus de exploración 0.001, con un total de 1.007.616 pasos. La física del entorno y las condiciones de terminación originales se mantienen intactas. La implementación exacta de la recompensa está en `reward_wrapper.py`, que debe usarse junto con los pesos y las estadísticas de normalización de observaciones; el autor advierte explícitamente que el modelo no funciona de forma aislada sin esos tres componentes.

## Capacidades

- Control continuo de un robot bípedo simulado en MuJoCo, con locomoción estable durante episodios de hasta 1000 pasos.
- Seguimiento de velocidad objetivo: mantiene una velocidad media de 1.883 m/s frente al objetivo de 2 m/s, con error absoluto medio de 0.2766 m/s y RMSE de 0.4454 m/s.
- Suavizado del control: reduce la velocidad angular RMS del torso a 1.4829 rad/s (frente a ~3.15 rad/s en v1 y v2) y el RMS de cambio de acción a 0.1142 (frente a ~0.14 en las versiones previas).
- Estabilidad a largo plazo: alcanza 1000 pasos en el 99.00% de los episodios evaluados, con una media de 996.60 pasos y 15.01 m de desplazamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento. Es un agente puramente motor.

## Casos de uso

- **Investigación en control continuo con RL**: servir como línea base reproducible para comparar variantes de función de recompensa en `Walker2d-v5`, gracias a la semilla fija y al registro completo de hiperparámetros.
- **Estudio de recompensas basadas en objetivos gaussianos**: el modelo es un ejemplo directo de cómo sustituir una recompensa de avance monótona por una gaussiana centrada en un objetivo, y de cómo eso sacrifica rendimiento en la métrica original (5.112 → 2.869 puntos de recompensa por defecto) a cambio de control más suave.
- **Análisis de calidad de marcha**: las métricas publicadas (ratio de vuelo, desviación de inclinación, RMS angular) permiten usarlo como sujeto de estudio en trabajos sobre naturalidad de la locomoción simulada.
- **Docencia en reinforcement learning**: el repositorio incluye `run_model.py`, `requirements.txt`, `reward_wrapper.py` y un vídeo de reproducción, lo que lo convierte en un material didáctico autocontenido para cursos de PPO.
- **Pruebas de robustez de políticas PPO**: evaluar el agente bajo perturbaciones del entorno (viento, fricción, ruido de observación) para medir cuánto degrada su seguimiento de velocidad.
- **Generación de datos de demostración**: usar los rollouts del agente como datos sintéticos de locomoción para entrenar políticas por imitación o para validar pipelines de simulación a realidad.
- **Comparación entre versiones de un mismo experimento**: la card ofrece una tabla de v1, v2 y v3 sobre las mismas 200 semillas, útil para estudiar el efecto de cambiar el espacio de observación y la recompensa de forma aislada.

## Benchmarks y rendimiento

Evaluación sobre 200 episodios (semillas 1000000–1000199), acciones deterministas y estadísticas de normalización fijas:

| Metrica | v1 | v2 | v3 |
|---|---:|---:|---:|
| Pasos de entrenamiento | 1M | 1M | 1M |
| Learning rate | 3e-4 | 4e-4 | 4e-4 |
| Bonus de exploracion | 0.0 | 0.001 | 0.001 |
| Dimension de observacion | 17 | 17 | 23 |
| Objetivo de entrenamiento | avance rapido | avance rapido | 2 m/s y control suave |
| Recompensa original media | 5.112,89 | 5.351,40 | 2.869,75 |
| Distancia media recorrida | 32,93 m | 34,83 m | 15,01 m |
| Pasos de supervivencia medios | 1.000,00 | 1.000,00 | 996,60 |
| Tasa de llegada a 1000 pasos | 100,00% | 100,00% | 99,00% |
| Velocidad media | 4,116 m/s | 4,354 m/s | 1,883 m/s |

Métricas específicas de seguimiento de velocidad en v3 (200 episodios):

| Metrica | Resultado |
|---|---:|
| Velocidad objetivo | 2,0 m/s |
| Error absoluto medio de velocidad | 0,2766 m/s |
| RMSE de error de velocidad | 0,4454 m/s |
| Proporcion en banda 1,75–2,25 m/s | 63,11% |
| Recompensa nueva media | 2.567,34 |

Diagnóstico de marcha sobre los mismos 20 episodios (semillas 1000000–1000019, excluyendo los primeros 100 pasos):

| Metrica | v1 | v2 | v3 |
|---|---:|---:|---:|
| Proporcion sin contacto de ambos pies | 59,3278% | 55,2278% | 46,6389% |
| Desviacion tipica de inclinacion del torso | 8,8110° | 8,8732° | 10,0848° |
| RMS de velocidad angular del torso | 3,1538 rad/s | 3,1525 rad/s | 1,4829 rad/s |
| RMS de cambio de accion | 0,1431 | 0,1440 | 0,1142 |
| Duracion media de fase aerea | 0,1512 s | 0,1245 s | 0,1763 s |

## Requisitos de hardware

- **VRAM**: no disponible. El tamaño del repositorio es de 0.0 GB y la topología de la red no se publica, por lo que no se puede estimar con rigor. Para una política PPO de este tipo en MuJoCo, la inferencia suele ser viable en CPU.
- **GPU recomendadas**: no disponible. No se documentan requisitos de GPU ni se han publicado mediciones en acelerador.
- **Compatibilidad con GPU de consumo**: no confirmada. No hay datos que permitan afirmar que cabe o no en una RTX 4090 u otras tarjetas de consumo.
- **Opciones de despliegue**: Stable-Baselines3 con `model.predict()` es la vía documentada por el autor (`python run_model.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- **Latencia y throughput**: no disponible. No se publican tiempos de inferencia ni pasos por segundo.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Pasos | Observacion | Objetivo | Licencia |
|---|---|---|---|---|---|---|
| connectailab-rl-kiwi-v3-Walker2d-ppo | Walker2d-v5 | PPO | 1.007.616 | 23 | 2 m/s suave | no disponible |
| connectailab-rl-kiwi-v2 | Walker2d-v5 | PPO | 1M | 17 | avance rapido | no disponible |
| connectailab-rl-kiwi-v1 | Walker2d-v5 | PPO | 1M | 17 | avance rapido | no disponible |
| connectailab-rl-kiwi-v3-lunarlander | LunarLander | DQN | no disponible | no disponible | aterrizaje | no disponible |

La comparación más directa es con v1 y v2 del mismo autor, cuyos resultados se recogen en las tablas anteriores. No se dispone de datos de modelos de terceros sobre `Walker2d-v5` en la información proporcionada, por lo que la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- **Ámbito estrictamente simulado**: el agente opera en `Walker2d-v5` de MuJoCo. No hay evidencia de transferencia a un robot físico ni de robustez frente a cambios de dinámica, fricción o ruido.
- **Dependencia de componentes auxiliares**: el modelo requiere `reward_wrapper.py` y las estadísticas de normalización de observaciones entrenadas. Usar solo el `.zip` de pesos produce resultados incorrectos.
- **Peor rendimiento en la métrica original**: la recompensa por defecto de Walker2d cae de 5.351,40 (v2) a 2.869,75 (v3) y la distancia media de 34,83 m a 15,01 m. El autor advierte explícitamente que no debe usarse la recompensa original para ordenar la calidad de marcha entre versiones, porque los objetivos de entrenamiento difieren.
- **Seguimiento de velocidad imperfecto**: solo el 63,11% del tiempo se mantiene en la banda de 1,75–2,25 m/s, con un error absoluto medio de 0,2766 m/s.
- **Inestabilidad de inclinación**: la desviación típica de inclinación del torso sube a 10,0848° frente a ~8,8° en v1 y v2, lo que sugiere un control de orientación menos firme pese a la menor velocidad angular.
- **Muestra de diagnóstico pequeña**: las métricas de marcha se calculan sobre 20 episodios y el propio autor señala que las longitudes de muestra pueden diferir, remitiendo a `gait_diagnostics.json`.
- **Licencia no especificada**: no se declara licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- **Riesgo de alucinación y sesgos**: no aplica en el sentido habitual, al no ser un modelo generativo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-Walker2d-ppo
- Perfil del autor: https://huggingface.co/kiwi2030
- Versión v2 (PPO, decisiones de empresa): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Teacher v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- LunarLander v3 (DQN): https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- LINK-01 v1: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- MEETORY: https://meetory.kr
- YouTube del autor: https://www.youtube.com/@kiwi_overai
- Vídeo de simulación: `connectailab-rl-kiwi-v3-Walker2d-ppo.replay.mp4` (incluido en el repositorio)
- Registro de evaluación: `connectailab-rl-kiwi-v3-Walker2d-ppo.evaluation.json` (incluido en el repositorio)
