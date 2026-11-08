# kiwi2030/connectailab-rl-kiwi-v6-Walker2d-ppo

## Resumen

`connectailab-rl-kiwi-v6-Walker2d-ppo` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre el entorno `Walker2d-v5` de MuJoCo. Lo desarrolla el usuario kiwi2030 dentro de una serie de experimentos de refuerzo denominada ConnectAILab, en la que cada versión (v1 a v6) ajusta hiperparámetros y acumula pasos de entrenamiento sobre la política anterior. El objetivo concreto de esta v6 es mantener la distancia recorrida de la v5 y alcanzar el 100 % de episodios completados en 5000 pasos (40 segundos de simulación).

El modelo no es un modelo de lenguaje ni un sistema multimodal: es un agente de control motor que aprende a hacer caminar a un bípedo simulado el mayor tiempo y distancia posible. Su relevancia es la de un artefacto reproducible de investigación en RL: documenta con detalle hiperparámetros, comparativas entre versiones y resultados de evaluación sobre 200 episodios con semillas fijas, lo que lo convierte en un caso de estudio útil para quien trabaje con PPO, entornos MuJoCo o evaluación determinista de políticas.

La arquitectura de la política es una MLP pequeña (64×64) sobre observaciones de 17 dimensiones del entorno Walker2d. El repositorio es de tamaño prácticamente nulo (0.0 GB declarados), lo que es coherente con un checkpoint de red neuronal de muy pocos parámetros. La licencia no está declarada y no se especifican idiomas, ya que no aplica al tratarse de un agente de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 64×64 sobre observaciones de 17 dimensiones (política actor-crítico de PPO, Stable-Baselines3) |
| Parametros totales | no disponible (MLP 64×64; el orden de magnitud es de miles de parámetros, no cuantificado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de control; ventana de observación de 17 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (control continuo, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint de Stable-Baselines3, presumiblemente `.zip`; no confirmado en la información) |

## Arquitectura y entrenamiento

La política es una red MLP de dos capas de 64 unidades que mapea el vector de observación de 17 dimensiones del entorno `Walker2d-v5` a acciones continuas de control articular. Se entrena con PPO usando 8 entornos en paralelo, `n_steps=1024`, `batch_size=256`, `n_epochs=10`, `gamma=0.99` y `GAE=0.95`. La recompensa es la estándar de Walker2d-v5: peso de avance 1.0, recompensa de supervivencia y coste de control, sin términos adicionales de velocidad objetivo, postura ni contacto de pies. La v6 parte de la política v5 y de sus estadísticas de normalización de observaciones, y añade 1.007.616 pasos de entrenamiento, hasta un acumulado de 3.022.848 pasos.

Los cambios de hiperparámetros respecto a v5 son: tasa de aprendizaje de 1e-4 a 5e-5, bonus de exploración de 0.0001 a 0, `clip_range` de 0.1 a 0.05 y `target_kl` de 0.02 a 0.01. El límite de episodio se mantiene en 5000 pasos. El autor advierte explícitamente que se cambiaron varios parámetros y la cantidad de entrenamiento a la vez, por lo que no es posible separar la contribución causal de cada modificación. No se documenta uso de RLHF ni de datos supervisados; es RL puro por interacción con el simulador.

## Capacidades

- Control motor continuo: genera acciones articulares para un bípedo simulado en MuJoCo (`Walker2d-v5`) con el objetivo de avanzar sin caer.
- Locomoción de larga duración: alcanza 5000 pasos (40 s de simulación) en el 100 % de los 200 episodios de evaluación con semillas fijas.
- Política determinista reproducible: la evaluación se realiza con acciones deterministas y normalización de observaciones fija.
- Estabilidad dentro del horizonte entrenado: mantiene la marcha durante los 5000 pasos del episodio; no se ha verificado estabilidad más allá de ese límite.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües.
- Integración con Stable-Baselines3: se carga como política PPO estándar y se ejecuta con el script `run_model.py` incluido en el repositorio.

## Casos de uso

- Reproducción de experimentos de RL: sirve como referencia para replicar un entrenamiento PPO sobre Walker2d-v5 con hiperparámetros documentados y comparar curvas de aprendizaje propias contra las cifras publicadas de v2, v5 y v6.
- Benchmark de algoritmos de control continuo: la política v6 puede usarse como línea base frente a SAC, TD3 o PPO con otras configuraciones, midiendo distancia media, tasa de finalización y recompensa original en las mismas 200 semillas.
- Estudio de ajuste fino de hiperparámetros: los cambios de `learning_rate`, `clip_range`, `target_kl` y bonus de exploración entre versiones permiten analizar el efecto de reducir la tasa de aprendizaje y la exploración en la fase final del entrenamiento.
- Docencia en aprendizaje por refuerzo: el repositorio incluye configuración JSON, resultados de evaluación y manifiesto SHA256, lo que facilita usarlo como ejemplo completo de ciclo entrenamiento-evaluación en un curso de RL.
- Pruebas de robustez y transferencia: la política puede evaluarse con perturbaciones en el estado inicial o en los parámetros del simulador para medir cuánto se degrada el rendimiento fuera de la distribución de evaluación declarada.
- Integración en pipelines de simulación: al ser un checkpoint de Stable-Baselines3, se puede cargar en scripts de Python para generar trayectorias sintéticas de marcha destinadas a análisis cinemático o a visualización.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y corresponden a 200 episodios con semillas 1000000–1000199, acciones deterministas y un máximo de 5000 pasos (40 s).

| Metrica (200 episodios, max. 5000 pasos) | v2 | v5 | v6 |
|---|---:|---:|---:|
| Episodios que alcanzan 5000 pasos (%) | 100.000 | 99.500 | 100.000 |
| Pasos de supervivencia medios | 5000.000 | 4977.515 | 5000.000 |
| Distancia media recorrida (m) | 185.328 | 215.513 | 225.319 |
| Distancia mediana (m) | 185.311 | 216.470 | 225.323 |
| Distancia percentil 10 (m) | 185.180 | 216.087 | 225.143 |
| Recompensa original media | 28151.773 | 31903.137 | 33151.336 |

| Metrica (200 episodios, primeros 1000 pasos) | v1 | v2 | v3 | v4 inicial | v4 reexperimento | v5 | v6 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Episodios que alcanzan 1000 pasos (%) | 100.000 | 100.000 | 99.000 | 0.000 | 100.000 | 99.500 | 100.000 |
| Distancia media (m) | 32.930 | 34.833 | 15.011 | 2.889 | -0.047 | 40.716 | 42.291 |
| Pasos de supervivencia medios | 1000.000 | 1000.000 | 996.600 | 252.055 | 1000.000 | 997.515 | 1000.000 |
| Recompensa original media | 5112.886 | 5351.402 | 2869.747 | 611.498 | 990.106 | 6084.382 | 6283.615 |

El autor indica que las métricas de 1000 pasos de v5 y v6 se calculan sobre los primeros 1000 pasos de las trayectorias largas, y que las versiones tienen objetivos e historiales de entrenamiento distintos, por lo que la recompensa original no permite un ranking único entre versiones. No se han publicado comparaciones con políticas de terceros ni resultados en benchmarks estándar de RL (por ejemplo, puntuaciones medias de Walker2d reportadas en la literatura).

## Requisitos de hardware

- VRAM estimada: mínima. La política es una MLP de 64×64 sobre 17 entradas; el checkpoint y la inferencia caben en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada para inferencia; cualquier GPU (RTX 3060 o superior) acelera la simulación, pero el cuello de botella es el paso de MuJoCo, no la red.
- Cabe en GPU consumer: sí, con margen amplio; también funciona en CPU.
- Opciones de despliegue: Stable-Baselines3 con `model.load()` y `model.predict()`, el script `run_model.py` incluido en el repositorio, y el entorno `Walker2d-v5` de MuJoCo con las versiones de `requirements.txt`.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen fundamentalmente de la velocidad del simulador MuJoCo y del número de entornos en paralelo, no del tamaño de la red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kiwi-v6-Walker2d-ppo | MLP 64×64 (no cuantificado) | Episodio de 5000 pasos (40 s) | 100 % de 200 episodios a 5000 pasos; 225.319 m de media | no disponible | Hugging Face (kiwi2030) |
| connectailab-rl-kiwi-v5-Walker2d-ppo | MLP 64×64 (no cuantificado) | Episodio de 5000 pasos | 99.5 % a 5000 pasos; 215.513 m de media | no disponible | Hugging Face (kiwi2030) |
| connectailab-rl-kiwi-v2-Walker2d-ppo | MLP 64×64 (no cuantificado) | Episodio de 5000 pasos | 100 % a 5000 pasos; 185.328 m de media | no disponible | Hugging Face (kiwi2030) |
| Políticas PPO de referencia de la literatura para Walker2d | no disponible | no disponible | no disponible en la información | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de políticas comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Generalización limitada: los resultados de 100 % de finalización y 225.319 m corresponden a 200 semillas concretas (1000000–1000199) con acciones deterministas y normalización de observaciones fija; no implican estabilidad en todos los estados iniciales posibles.
- Horizonte no verificado: no se ha comprobado la estabilidad más allá de los 5000 pasos (40 s); el comportamiento tras ese límite es desconocido.
- Confusión de variables en el ajuste: se modificaron simultáneamente tasa de aprendizaje, bonus de exploración, `clip_range`, `target_kl` y volumen de entrenamiento, por lo que no se puede atribuir la mejora a un cambio concreto.
- Dependencia del entorno: los resultados pueden variar con versiones distintas de Python, MuJoCo o Stable-Baselines3; el autor lo advierte explícitamente.
- Licencia no declarada: no hay licencia especificada en el repositorio, lo que impide asumir permisos de uso comercial o de redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Sesgos y alucinación: no aplican en el sentido habitual de modelos generativos, pero la política puede exhibir comportamientos no previstos (caídas, oscilaciones) fuera de la distribución de evaluación.
- Naturaleza del artefacto: es un agente de simulación, no un modelo de lenguaje; no debe evaluarse con métricas de NLP ni emplearse para tareas de texto, código o razonamiento.
- Trazabilidad de la evaluación: parte de los resultados de v2 y v5 se reutilizan de ejecuciones anteriores con la misma metodología, según declara el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v6-Walker2d-ppo
- Versión v2 del mismo experimento: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-Walker2d-ppo
- Perfil del autor: https://huggingface.co/kiwi2030
- Modelo dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- Connect Tycoon kiwi v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Connect Tycoon teacher v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- LunarLander kiwi v3: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- LINK-01 kiwi v1: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Guía de viajes MEETORY: https://meetory.kr
- Canal de YouTube kiwi_overai: https://www.youtube.com/@kiwi_overai
