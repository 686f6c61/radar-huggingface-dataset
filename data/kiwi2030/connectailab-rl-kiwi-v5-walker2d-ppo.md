# kiwi2030/connectailab-rl-kiwi-v5-Walker2d-ppo

## Resumen

`connectailab-rl-kiwi-v5-Walker2d-ppo` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 sobre el entorno `Walker2d-v5` de MuJoCo, dentro del benchmark Gymnasium. La publica el usuario kiwi2030 en el marco de sus experimentos Connect AI Lab, una serie de pruebas de aprendizaje por refuerzo que abarca entornos como LunarLander, LINK-01 y este Walker2d. No es un modelo de lenguaje: es una política neuronal que controla un robot bípedo simulado para que avance la mayor distancia posible sin caer.

El objetivo declarado del autor es maximizar la distancia recorrida y el tiempo de supervivencia, no la naturalidad de la marcha ni la alternancia de pasos. La versión v5 parte de la política v2 y añade aproximadamente un millón de pasos de entrenamiento adicionales (unos dos millones acumulados), con ajustes en la tasa de aprendizaje, el bonus de exploración, el `clip_range` y la introducción de `target_kl`. En la evaluación de 200 episodios con semillas fijas y hasta 5000 pasos, v5 alcanza una distancia media de 215,513 m frente a los 185,328 m de v2, con una tasa de finalización del 99,5 % frente al 100 % de v2.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible, con métricas detalladas y material de evaluación publicado, útil para quien quiera estudiar curvas de mejora en PPO sobre control continuo o reutilizar la política como línea base. No tiene aplicación directa en producción de texto ni en tareas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 64×64 (política y función de valor) sobre observaciones de 17 dimensiones; salida de acción continua |
| Parametros totales | no disponible (red pequeña, 64×64; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 17 dimensiones por paso |
| Tipos de cuantizacion | no disponible (pesos de política RL; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pesos de Stable-Baselines3 (`.zip`), con fichero aparte de normalización de observaciones |
| Entorno | `Walker2d-v5` (Gymnasium / MuJoCo) |
| Algoritmo | PPO (Stable-Baselines3) |
| Semilla | 0 |
| Entrenamiento acumulado | ~2.015.232 pasos (v2 + ~1.007.616 adicionales) |
| Hiperparámetros clave | lr 1e-4, gamma 0.99, GAE 0.95, clip_range 0.1, target_kl 0.02, n_steps 1024, batch 256, n_epochs 10, 8 entornos |

## Arquitectura y entrenamiento

La política es una red neuronal totalmente conectada de dos capas de 64 unidades, típica de Stable-Baselines3 para control continuo, que recibe las 17 dimensiones de observación del Walker2d y emite acciones continuas sobre las articulaciones. Se entrena con PPO, un algoritmo actor-crítico con recorte de la ratio de probabilidad, usando 8 entornos paralelos, `n_steps` de 1024, minibatch de 256 y 10 épocas por actualización. La función de recompensa es la original de Walker2d: peso de recompensa de avance 1,0, recompensa de supervivencia y coste de control, sin modificaciones de velocidad objetivo, postura ni penalización por contacto de pies.

El cambio respecto a v2 combina varios ajustes simultáneos: tasa de aprendizaje de 4e-4 a 1e-4, bonus de exploración de 0,001 a 0,0001, `clip_range` de 0,2 a 0,1 y la incorporación de `target_kl` de 0,02. Además, el límite de episodios de entrenamiento sube de 1000 a 5000 y se parte de la política v2 (con sus estadísticas de normalización) para acumular unos dos millones de pasos. El autor advierte explícitamente de que al cambiar múltiples parámetros a la vez no es posible aislar el efecto individual de cada uno. No se documenta uso de RLHF, DPO ni decodificación especulativa, ya que el modelo no es de lenguaje.

## Capacidades

- Control continuo de un robot bípedo simulado en `Walker2d-v5`: locomoción hacia delante maximizando distancia y supervivencia.
- Política determinista reutilizable con observaciones normalizadas fijas (requiere el fichero de normalización junto a los pesos).
- Ejecución mediante `run_model.py` tras instalar `requirements.txt`, con Stable-Baselines3 y MuJoCo.
- Evaluación reproducible: el autor publica los registros de 200 episodios, configuración, tablas comparativas en JSON y un manifiesto SHA256.
- Vídeo de replay en 2D proyectado a partir de las coordenadas de geometría reales de MuJoCo (no es render OpenGL).
- No soporta tool calling, function calling, agentes multi-paso, multilingüismo, visión, audio ni modo de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Línea base de PPO en control continuo: sirve para comparar nuevas variantes de hiperparámetros sobre Walker2d-v5 con métricas de distancia y supervivencia ya publicadas.
- Estudio de curvas de mejora entre versiones: la serie v1–v5 con evaluaciones estandarizadas de 200 episodios permite analizar el efecto de ajustes de lr, clip y target_kl sobre el rendimiento.
- Reproducción de experimentos: los registros de 200 semillas, la configuración y el manifiesto SHA256 permiten replicar la evaluación y verificar resultados.
- Docencia de aprendizaje por refuerzo: un ejemplo pequeño y autocontenido de entrenamiento PPO con Stable-Baselines3, útil para prácticas de laboratorio.
- Investigación sobre el compromiso distancia-supervivencia: v5 mejora la distancia media pero baja 0,5 puntos porcentuales la tasa de finalización, un caso concreto para estudiar trade-offs en recompensas de locomoción.
- Generación de material visual de simulación: el replay 2D proyectado desde coordenadas de MuJoCo sirve para ilustrar el comportamiento de la política en documentación o presentaciones.
- Calibración de entornos de evaluación: el contraste entre la métrica estándar de 1000 pasos y la extendida de 5000 pasos muestra cómo cambia la conclusión según el horizonte de evaluación.

## Benchmarks y rendimiento

Datos publicados por el autor. Evaluación con semillas 1000000–1000199, acciones deterministas, normalización de observaciones fija.

Comparación v2 frente a v5, máximo 5000 pasos (40 s):

| Métrica (200 episodios, máx. 5000 pasos) | v2 | v5 |
|---|---:|---:|
| Episodios que alcanzan 5000 pasos (%) | 100,000 | 99,500 |
| Pasos de supervivencia medios | 5000,000 | 4977,515 |
| Distancia media (m) | 185,328 | 215,513 |
| Distancia mediana (m) | 185,311 | 216,470 |
| Distancia percentil 10 (m) | 185,180 | 216,087 |
| Recompensa original media | 28151,773 | 31903,137 |

Evaluación estándar de 1000 pasos, 200 episodios, serie v1–v5:

| Métrica (200 episodios, máx. 1000 pasos) | v1 | v2 | v3 | v4 | v5 |
|---|---:|---:|---:|---:|---:|
| Episodios que alcanzan 1000 pasos (%) | 100,000 | 100,000 | 99,000 | 0,000 | 99,500 |
| Distancia media (m) | 32,930 | 34,833 | 15,011 | 2,889 | 40,716 |
| Pasos de supervivencia medios | 1000,000 | 1000,000 | 996,600 | 252,055 | 997,515 |
| Recompensa original media | 5112,886 | 5351,402 | 2869,747 | 611,498 | 6084,382 |

Mejora declarada de v5 frente a v2 en la evaluación larga: +16,29 % en distancia media, +30,185 m de diferencia media por semilla y aumento de distancia en 199 de 200 episodios. El autor señala que no demuestra estabilidad indefinida más allá de los 40 segundos.

## Requisitos de hardware

- VRAM estimada: mínima. La red es un MLP de 64×64; la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con soporte CUDA acelera el entrenamiento, no la inferencia. Para reentrenar, una GPU de gama media es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.), y también en CPU.
- Despliegue: Stable-Baselines3 (carga de `.zip`), MuJoCo y Gymnasium; no aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser una red de dos capas de 64 unidades, la latencia por paso sería del orden de microsegundos en GPU y de milisegundos en CPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Pasos de entrenamiento | Distancia media (1000 pasos) | Licencia |
|---|---|---|---:|---:|---|
| connectailab-rl-kiwi-v5-Walker2d-ppo | Walker2d-v5 | PPO | ~2.015.232 | 40,716 m | no disponible |
| connectailab-rl-kiwi-v2-Walker2d-ppo | Walker2d-v5 | PPO | ~1.007.616 | 34,833 m | no disponible |
| connectailab-rl-kiwi-v1-link01 | LINK-01 | PPO | no disponible | no aplica | no disponible |
| connectailab-rl-kiwi-v3-lunarlander | LunarLander | DQN | no disponible | no aplica | no disponible |

No se dispone de comparación con políticas Walker2d de terceros (por ejemplo, las del zoo de RL de Stable-Baselines3 o resultados de la literatura) en la información proporcionada.

## Limitaciones y advertencias

- Es una política de control, no un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no soporta tool calling.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de reutilizarla en producción.
- El autor reconoce un compromiso entre distancia y supervivencia: v5 recorre más distancia pero completa menos episodios (99,5 % frente a 100 % de v2); no debe interpretarse como mejora en ambos objetivos.
- Los resultados no demuestran estabilidad más allá de los 40 segundos (5000 pasos); el horizonte de evaluación está acotado.
- Los cambios de hiperparámetros entre v2 y v5 se aplicaron de forma conjunta, por lo que no se puede atribuir la mejora a un parámetro concreto.
- La evaluación usa semillas fijas y acciones deterministas; el rendimiento en otras condiciones no está documentado.
- El vídeo de replay es una proyección 2D de coordenadas de MuJoCo, no un render OpenGL, y un solo episodio no representa la evaluación completa de 200.
- Depende de la versión de MuJoCo, Gymnasium y Stable-Baselines3; cambios de versión pueden alterar la dinámica y los resultados.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución más allá del entorno simulado; el modelo no ha sido validado en un robot físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v5-Walker2d-ppo
- Versión anterior v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-Walker2d-ppo
- Perfil del autor: https://huggingface.co/kiwi2030
- Experimento LunarLander v3: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Experimento LINK-01 v1: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Connect Tycoon v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Connect Tycoon teacher v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- Guía de viajes MEETORY: https://meetory.kr
- Canal de YouTube del autor: https://www.youtube.com/@kiwi_overai
