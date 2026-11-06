# lucaskim72/connectailab-rl-lucasbrain-v17-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v17-humanoid-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO para control continuo sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. Lo publica el usuario `lucaskim72` en el contexto del curso de RL de CONNECT AI LAB × AI CITY BUILDERS, y no es un modelo de lenguaje: es una política neuronal que mapea observaciones del simulador a acciones articulares de un humanoide simulado.

El modelo resuelve el problema clásico de locomoción bípeda en MuJoCo: mantenerse en pie y desplazarse hacia delante maximizando la recompensa del entorno, que suma +5 por paso erguido, velocidad×1.25 por avance y penaliza el consumo excesivo de fuerza. Sobre esa recompensa base, el autor añade un conjunto de términos de "postura" (torso, cintura, pecho, rodillas, centro de masas, equilibrio, etc.) con coeficientes configurables, lo que constituye la innovación principal de esta versión.

La relevancia es acotada: se trata de un artefacto educativo y experimental, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y con la model card íntegramente en coreano. No compite con modelos fundacionales ni con librerías de RL de referencia, pero documenta de forma inusualmente detallada la curva de entrenamiento y el efecto de cada término de recompensa añadido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (MLP, detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control continuo, episodios de hasta 1000 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch) + `added_scores.py` (código de recompensa) |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Semilla | 9000 |
| Episodio máximo | 1000 pasos |
| Criterio de terminación | altura fuera de rango 1.0–2.0 |

## Arquitectura y entrenamiento

La política se entrena con PPO sobre el entorno `Humanoid-v5` de Gymnasium con backend MuJoCo, un problema de control continuo de alta dimensión con observaciones propioceptivas y acciones articulares continuas. La model card no detalla el número de capas, el tamaño de las capas ocultas ni la función de activación de la red; solo se indica que los pesos están en `model.pt` y que ese fichero contiene "los números de la red neuronal y los multiplicadores" de la recompensa añadida.

El entrenamiento se organiza en una progresión documentada de versiones: v1 (1M de pasos, learning rate 3e-4) como línea base, v7 (1M de pasos, lr 1e-4) como mejor variante de esa comparación, v13 (2M de pasos), v14 (4M de pasos, con el mejor checkpoint en 3,7M) y v15 (lr 3e-5 partiendo de v14, el mejor según media de 10 episodios no vistos). Sobre v15 se aplica una segunda fase de ajuste con recompensas de postura incrementales (v15.1 a v15.25), donde cada iteración añade o modifica un término: torso, brazos, pies, cintura/pecho, equilibrio, rodillas, centro de masas, elevación de pie, inclinación, etc. Los coeficientes finales de la v17 son: torso 0, cintura 0,4, pecho 0,4, equilibrio 0, rodillas 1, centro 1, elevación 1, sobreflexión 0,25, pie alto 0,25, avance 1, inclinación 0,5, plegado 1, hombros 0,25, dirección 1, brazos 0,2 y pies 0,25.

La innovación técnica destacable no está en la arquitectura sino en la ingeniería de recompensa: la función de recompensa aumentada vive en `added_scores.py`, descargable por separado con `hf_hub_download`, y los multiplicadores están embebidos en `model.pt`, lo que permite reconstruir la señal de entrenamiento exacta. La model card reporta para esta versión una puntuación de entorno de 9341,9 en 1000 pasos con un avance de 57,71.

## Capacidades

- Control continuo de un humanoide simulado de MuJoCo: locomoción bípeda, mantenimiento del equilibrio y desplazamiento hacia delante.
- Política estocástica/determinista de PPO reutilizable para evaluación con acciones deterministas (la model card indica que la reproducción se hizo con "acciones fijas").
- Recompensa aumentada configurable mediante coeficientes de postura embebidos en los pesos y replicables con `added_scores.py`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión, audio ni capacidades multilingües: es exclusivamente una política de RL.
- No hay modo "thinking", ni generación de texto, ni API conversacional.

## Casos de uso

- Investigación en locomoción bípeda: usar la política como baseline reproducible en `Humanoid-v5` para comparar variantes de PPO, learning rate o presupuesto de pasos, dado que la model card documenta la curva completa v1→v15.
- Estudio de ingeniería de recompensa: replicar los términos de postura de `added_scores.py` y medir su efecto aislado sobre la puntuación del entorno, ya que la tabla de v15.1 a v15.25 cuantifica el impacto de cada adición.
- Docencia de RL: ejemplo práctico de PPO con control continuo para un curso introductorio, con checkpoints intermedios y gráficas de evaluación incluidas.
- Fine-tuning con recompensas personalizadas: partir de los pesos v17 y añadir nuevos términos (por ejemplo, simetría de marcha o eficiencia energética) sin reentrenar desde cero.
- Evaluación de estabilidad y robustez: medir la puntuación del agente bajo perturbaciones del simulador o cambios de semilla para analizar la varianza de la política.
- Reproducción de resultados: regenerar la puntuación de 9341,9 con semilla 9000 y acciones deterministas, útil para verificar pipelines de evaluación en MuJoCo.
- Base para transferencia sim-to-real en robótica de bajo coste: la política puede servir como punto de partida para *domain randomization*, aunque requiere validación adicional.

## Benchmarks y rendimiento

La model card no presenta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. Los datos de rendimiento disponibles son las puntuaciones del entorno `Humanoid-v5`:

| Version | Pasos de entrenamiento | Learning rate | Puntuacion entorno | Avance |
|---|---|---|---|---|
| v1 (base) | 1M | 3e-4 | no disponible en la ficha | no disponible |
| v7 | 1M | 1e-4 | mejor de su comparación (valor no indicado) | no disponible |
| v13 | 2M | 1e-4 | en ascenso al terminar | no disponible |
| v14 | 4M (mejor en 3,7M) | 1e-4 | no indicado | no disponible |
| v15 (mejor) | continuacion de v14 | 3e-5 | mejor media de 10 episodios no vistos | no disponible |
| v17 (esta ficha) | continuacion con recompensa aumentada | no disponible | 9341,9 | 57,71 |

No se han publicado resultados de benchmarks estándar en la información disponible. Las puntuaciones intermedias de la fase de postura (v15.1 a v15.25) oscilan entre 6668,0 y 8811,1, con la v17 en 9341,9.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una política MLP para `Humanoid-v5` típicamente ocupa del orden de megabytes, aunque el tamaño exacto no está disponible. El repositorio pesa 0,0 GB según Hugging Face.
- GPU recomendadas: no es necesario GPU para inferencia; cualquier CPU moderna puede ejecutar la política. Para entrenamiento continuado, una GPU consumer (RTX 3060 o superior) acelera MuJoCo y el bucle de PPO.
- Cabe en cualquier GPU consumer e incluso en CPU; el cuello de botella es el simulador MuJoCo, no la red.
- Opciones de despliegue: PyTorch nativo cargando `model.pt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). Requiere Gymnasium y MuJoCo instalados.
- Latencia y throughput: no disponibles. Dependen del paso de simulación de MuJoCo y del hardware; la evaluación se hace sobre episodios de hasta 1000 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v17-humanoid-ppo | PPO (RL) | Humanoid-v5 | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| Stable-Baselines3 PPO (referencia) | PPO (RL) | Humanoid-v5 | configurable | no aplica | MIT | GitHub, ampliamente usado |
| CleanRL PPO | PPO (RL) | Humanoid-v5 | configurable | no aplica | MIT | GitHub, single-file |
| RL Zoo / sb3-contrib | Colección de políticas | Humanoid-v5 | variable | no aplica | MIT | Hugging Face / GitHub |

La comparación es cualitativa: no hay datos públicos de rendimiento de este checkpoint frente a las implementaciones de referencia, y la licencia del modelo no está declarada, lo que limita su uso comercial frente a alternativas con licencia MIT.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; cualquier uso conversacional es inválido.
- Sesgos conocidos: no documentados; el comportamiento está acoplado al simulador `Humanoid-v5` y no se ha validado fuera de él.
- Riesgo de sobreajuste al entorno: la puntuación de 9341,9 corresponde a una semilla y a una configuración concretas; la varianza entre episodios no se reporta.
- Limitación de idioma: la model card está en coreano y no hay traducción oficial; puede dificultar la reproducibilidad para equipos hispanohablantes.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial permitido. Verificar con el autor antes de cualquier despliegue productivo.
- Reproducibilidad: los coeficientes de postura están embebidos en `model.pt` y la lógica en `added_scores.py`; sin ambos ficheros no se puede reconstruir la señal de entrenamiento.
- Caveat de producción: 0 descargas y 0 likes, sin revisión comunitaria; tratar como artefacto experimental, no como componente validado.
- El criterio de terminación (altura fuera de 1,0–2,0) puede truncar episodios y afectar a comparaciones con otros agentes que usen criterios distintos.

## Enlaces

- Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v17-humanoid-ppo
- Fichero de recompensa aumentada: `added_scores.py` en el mismo repositorio (descargable vía `hf_hub_download`)
- Pesos: `model.pt` en el mismo repositorio
- Entorno: `Humanoid-v5` de Gymnasium (https://gymnasium.farama.org/) con backend MuJoCo (https://mujoco.org/)
- Curso de referencia: CONNECT AI LAB × AI CITY BUILDERS, lección 6 de RL con PPO
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
