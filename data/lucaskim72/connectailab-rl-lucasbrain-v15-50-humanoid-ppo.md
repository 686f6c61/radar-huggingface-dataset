# lucaskim72/connectailab-rl-lucasbrain-v15.50-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v15.50-humanoid-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. Lo publica el usuario `lucaskim72` en el marco del curso de RL de CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje: es una política neuronal que controla un cuerpo humanoide simulado mediante acciones continuas, y su "modelo" es un checkpoint de PyTorch (`model.pt`) con los pesos de la red y los coeficientes de las recompensas auxiliares.

El interés técnico del artefacto está en su bitácora de entrenamiento: el autor documenta una escalada de versiones (v1 a v15.50) con cambios controlados de hiperparámetros (learning rate, número de pasos) y, a partir de v15.1, una ingeniería de recompensas por partes (postura, brazos, pies, equilibrio, rodillas, centro de masa, etc.) con tablas de resultados por versión. La versión de esta ficha reporta una puntuación de entorno de 9264,5 puntos en 1000 pasos con un avance de 56,76 metros, según la model card.

Es relevante como ejemplo reproducible de *reward shaping* en control continuo y como material didáctico de PPO, no como componente listo para producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB (probablemente los pesos no están subidos o son de tamaño despreciable en la métrica de Hugging Face).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (PPO, control continuo); topología exacta no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en PyTorch `model.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), más `added_scores.py` con la fórmula de recompensas auxiliares |

## Arquitectura y entrenamiento

El agente se entrena con Proximal Policy Optimization (PPO) sobre `Humanoid-v5` de Gymnasium con el simulador MuJoCo. La política recibe el estado del humanoide (observaciones propioceptivas del entorno) y emite acciones continuas en el espacio de actuadores. La model card no detalla el número de capas, el tamaño de las capas ocultas ni el número exacto de parámetros; solo se indica que `model.pt` contiene "los números de la red neuronal y estos multiplicadores".

El entrenamiento se documenta como una cadena de experimentos con una única variable cambiada por versión: v1 como línea base con 1 millón de pasos y learning rate 0,0003; v7 baja el learning rate a 0,0001; v13 extiende a 2 millones de pasos; v14 continúa hasta 4 millones (mejor checkpoint en 3,7 millones); v15 baja el learning rate a 0,00003 partiendo de ese checkpoint. A partir de v15.1 se añaden recompensas de postura con multiplicadores explícitos: tronco 0, cintura 0,4, pecho 0,4, equilibrio 0, rodillas 1, centro 1, elevación 1, sobreflexión 0,25, pie alto 0,25, avance 1, inclinación 0,5, plegado 0,5, hombros 0,25, dirección 1, brazos 0,2 y pies 0,25. El episodio termina si la altura sale del rango 1,0–2,0 y dura como máximo 1000 pasos.

La innovación destacable no es arquitectónica sino metodológica: la separación entre la recompensa del entorno y las recompensas auxiliares, publicadas en `added_scores.py` para que sean auditables y reproducibles, junto con una tabla de ablación versión a versión que permite ver el efecto de cada término de *reward shaping*.

## Capacidades

- Control continuo de un humanoide simulado en MuJoCo (`Humanoid-v5`): locomoción bípeda, equilibrio y mantenimiento de postura.
- Política entrenada para maximizar recompensa compuesta: recompensa del entorno (supervivencia y velocidad de avance) más términos de postura.
- Avance documentado de 56,76 metros en 1000 pasos en la versión v15.50, con puntuación de entorno de 9264,5.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes multi-paso en el sentido de LLM; es un agente RL de un solo entorno.
- Sin capacidades multilingües, de visión, audio o modo *thinking*.
- Reproducible mediante `huggingface_hub` para descargar `added_scores.py` y, presumiblemente, `model.pt`.

## Casos de uso

- Docencia de PPO en control continuo: el repositorio sirve como caso de estudio de una cadena de experimentos con una variable por versión, útil para explicar búsqueda de hiperparámetros y *reward shaping* en un curso de RL.
- Investigación en *reward shaping*: la tabla de ablaciones v15.1–v15.50 permite analizar cómo cada término de recompensa (rodillas, centro, inclinación) afecta a la puntuación del entorno y al avance, y replicar el análisis con `added_scores.py`.
- Reproducción de experimentos: descargar `model.pt` y evaluar la política en `Humanoid-v5` con la misma configuración de episodio (1000 pasos, corte de altura 1,0–2,0) para verificar la puntuación reportada.
- Punto de partida para *fine-tuning* con PPO: el checkpoint v15.50 puede usarse como inicialización para probar nuevas recompensas auxiliares o variaciones del entorno, dado que el autor documenta el historial completo de partida.
- Estudio de estabilidad de políticas: las caídas de puntuación entre versiones (por ejemplo, v15.17 con 7037,3 frente a v15.16 con 8388,6) son un caso práctico para analizar la varianza del entrenamiento PPO y la sensibilidad al *reward shaping*.
- Benchmark interno de infraestructura RL: útil para medir tiempos de entrenamiento y evaluación en MuJoCo con distintas GPUs/CPUs antes de escalar a entornos más costosos.

## Benchmarks y rendimiento

La model card no presenta comparaciones con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K no aplican). Los únicos datos son las puntuaciones del entorno y las recompensas auxiliares por versión. Se reproducen las últimas entradas documentadas de la tabla del autor:

| Versión | Puntuación de entorno | Avance (m) | Rodillas | Centro | Elevación | Inclinación |
|---|---|---|---|---|---|---|
| v15.23 | 8743,7 | 49,71 | 906,2 | 436,1 | 451,8 | -126,4 |
| v15.24 | 8699,5 | 49,21 | 956,8 | 410,9 | 410,1 | -145,2 |
| v15.25 | 8811,1 | 50,61 | 872,4 | 475,4 | 471,0 | -40,1 |
| v15.26 | 8087,6 | 46,40 | 823,8 | 414,9 | — | — |
| v15.50 (esta ficha) | 9264,5 | 56,76 | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas internas del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de RL de tamaño no documentado, la inferencia cabe con alta probabilidad en cualquier GPU consumer, pero no se puede dar una cifra concreta.
- GPU recomendadas: no disponible. Para evaluación de un solo episodio, cualquier GPU con soporte PyTorch y MuJoCo es suficiente en la práctica; para reentrenamiento con PPO a millones de pasos se recomienda una GPU dedicada (A100, H100 o RTX 4090), aunque el autor no especifica el hardware usado.
- Cabe en GPU consumer: probablemente sí, dado que es una política de control continuo y no un LLM; sin confirmación del autor.
- Opciones de despliegue: PyTorch + Gymnasium + MuJoCo directamente; no se documentan exportaciones a ONNX, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con la misma configuración (PPO sobre `Humanoid-v5` con *reward shaping* por partes y bitácora de versiones). Las políticas de referencia habituales en RL (SAC, TD3, DreamerV3 sobre Humanoid) no están documentadas en la información proporcionada, por lo que no se ofrece tabla comparativa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v15.50-humanoid-ppo | no disponible | no aplica | 9264,5 en Humanoid-v5 (según autor) | no disponible | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite prompts; cualquier uso fuera del control del humanoide simulado requiere reentrenamiento.
- Sesgos conocidos: no documentados; en RL, el sesgo proviene del diseño de la recompensa y del entorno, y el autor no analiza sesgos de comportamiento más allá de las métricas.
- Riesgo de alucinación: no aplica en el sentido de LLM; el riesgo equivalente es que la política explote atajos de la recompensa (*reward hacking*), algo plausible con 16 términos de recompensa auxiliar y no evaluado explícitamente.
- Limitaciones de contexto o idioma: no aplica; el estado de observación y el horizonte de 1000 pasos son las únicas restricciones.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveat para producción: el repositorio tiene 0 descargas, 0 likes y tamaño de 0,0 GB; no hay garantía de que los pesos estén efectivamente subidos ni de que la puntuación de 9264,5 sea reproducible con el artefacto publicado.
- La evaluación se basa en una sola semilla (semilla 9000) y en la métrica del autor; no hay evaluación multi-semilla ni intervalos de confianza documentados.
- El formato `model.pt` implica dependencia de la versión de PyTorch y de la topología exacta de la red, que no se documenta; la carga puede fallar sin el código de definición del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.50-humanoid-ppo
- Repositorio de `added_scores.py` (mismo repo): https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.50-humanoid-ppo/blob/main/added_scores.py
- Entorno Gymnasium Humanoid-v5 (referencia del entorno, no enlazado en la model card): no disponible en la información proporcionada
- Paper de PPO (referencia del algoritmo, no enlazado en la model card): no disponible en la información proporcionada
- Repos, demos o blogs adicionales: no disponibles en la información proporcionada
