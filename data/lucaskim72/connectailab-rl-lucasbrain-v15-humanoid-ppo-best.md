# lucaskim72/connectailab-rl-lucasbrain-v15-humanoid-ppo-best

## Resumen

`connectailab-rl-lucasbrain-v15-humanoid-ppo-best` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) para el entorno `Humanoid-v5` de Gymnasium/MuJoCo. No es un modelo de lenguaje ni un transformer generativo: es una red neuronal pequeña (perceptrón con capa oculta de 256 unidades) que controla un humanoide simulado de 17 articulaciones a partir de un vector de observación de 348 dimensiones. Lo publica Lucas Kim bajo la etiqueta CONNECT AI LAB × AI CITY BUILDERS como parte de una serie docente de seis lecciones sobre PPO.

El modelo resuelve el problema clásico de control continuo: mantener el equilibrio y desplazarse hacia delante en un entorno con recompensa compuesta (supervivencia, velocidad de avance y coste energético). La versión v15 es la mejor de la serie según la evaluación hold-out del propio autor, con una media de 6235,4 puntos sobre 10 episodios y una longitud media de 979,8 pasos (el máximo es 1000).

Su relevancia es fundamentalmente educativa y de referencia: documenta de forma muy detallada la progresión de hiperparámetros (learning rate, clipping, número de entornos, pasos totales) desde v1 hasta v15, lo que lo convierte en un caso de estudio útil para quien quiera reproducir un pipeline PPO en MuJoCo. El repositorio tiene 0 descargas y 0 likes, tamaño 0.0 GB y no declara licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (actor-crítico) para PPO, capa oculta de 256 unidades, distribución gaussiana sobre acciones continuas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 348 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch (`pytorch`, librería declarada); no se detalla el nombre de fichero |
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Espacio de observación | 348 dimensiones |
| Espacio de acción | 17 articulaciones, cada una en [-0.4, 0.4] |
| Algoritmo | PPO con clipping 0.2, GAE lambda 0.95, gamma 0.99 |
| Learning rate | 3e-05 |
| Entornos paralelos | 8 |
| Pasos totales de entrenamiento | 4.706.880 |
| Normalización de observaciones | activada |
| Semilla de evaluación | 9000–9009 (10 episodios) |

## Arquitectura y entrenamiento

La política es una red de dos cabezas compartidas (o separadas, la model card no lo detalla con precisión): una cabeza produce la media de la acción continua y otra estima el valor del estado. La acción se muestrea de una gaussiana cuya desviación típica inicial es aproximadamente 0.14, y en evaluación se usa la media determinista recortada al rango [-0.4, 0.4]. El entrenamiento emplea PPO con recolección on-policy: 8 entornos en paralelo × 512 pasos = 4096 transiciones por iteración, 10 épocas de reutilización por lote de 512 y clipping de la ratio de probabilidad a ±20 %.

La progresión documentada es explícita: v1 (1M pasos, lr 3e-4) como línea base; v7 baja el learning rate a 1e-4 manteniendo 1M pasos; v13 extiende a 2M pasos con la misma configuración; v14 continúa hasta 4M pasos desde los pesos de v13, quedándose con el checkpoint de 3,7M porque el rendimiento en evaluación decayó al seguir entrenando; v15 parte de ese checkpoint de 3,7M y reduce el learning rate a 3e-5, obteniendo la mejor media en 10 episodios no vistos. El autor también documenta variantes posteriores (v15.1 a v15.5) que añaden recompensas de postura (torso, brazos, pies, cintura, pecho, equilibrio), con la v15.4 alcanzando 7507,9 puntos en el entorno, aunque esas variantes no forman parte de este repositorio.

No hay innovaciones de arquitectura destacables: es PPO estándar aplicado a un entorno MuJoCo de alta dimensión, con normalización de observaciones y sin bonus de exploración (0.0 en la configuración final).

## Capacidades

- Control continuo de un humanoide simulado de 17 articulaciones en `Humanoid-v5`.
- Locomoción bípeda: mantenimiento del equilibrio y avance hacia delante durante hasta 1000 pasos por episodio.
- Política determinista en evaluación (se usa la media de la distribución gaussiana, sin ruido).
- Generalización limitada a las condiciones del entorno de entrenamiento (misma física MuJoCo, misma morfología).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Docencia de PPO en control continuo: el repositorio sirve como referencia reproducible de cómo afectan learning rate, clipping, número de entornos y pasos totales al rendimiento, con una tabla comparativa de variables incluidas en la model card.
- Línea base para experimentos de locomoción en MuJoCo: se puede cargar la política como punto de partida y comparar variantes propias (recompensas de postura, curricula, domain randomization) contra los 6235,4 puntos de media reportados.
- Estudio de estabilidad del entrenamiento: el caso de v14 (degradación al pasar de 3,7M a 4M pasos) ejemplifica el sobreentrenamiento en PPO y la utilidad de guardar checkpoints intermedios.
- Generación de datos de demostración para imitación: la política determinista puede rodar episodios y producir trayectorias (estado-acción) para entrenar un modelo de imitación o un controlador alternativo.
- Pruebas de infraestructura de RL: al ser un modelo pequeño, es adecuado para validar pipelines de entrenamiento distribuido, logging y evaluación hold-out con semillas fijas antes de escalar a entornos mayores.
- Visualización y divulgación: el GIF de replay incluido permite mostrar locomoción bípeda en charlas o material educativo sin necesidad de hardware robótico.

## Benchmarks y rendimiento

Los únicos datos disponibles son los del autor, medidos sobre 10 episodios hold-out con semillas 9000–9009:

| Métrica | Valor |
|---|---|
| Puntuación media (10 episodios) | 6235,4 |
| Longitud media del episodio | 979,8 pasos (máximo 1000) |
| Avance medio | 19,446725072411418 (unidades del entorno) |
| Puntuación de un episodio concreto (semilla 9000) | 6350,1 puntos, 1000 pasos, avance 19,61 |
| Pasos totales de entrenamiento | 4.706.880 |

No se han publicado comparaciones con otras políticas en la información disponible, ni resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K (no aplicables a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de decenas de MB; la red es un MLP con entrada de 348 dimensiones y capa oculta de 256, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada para inferencia; cualquier GPU con soporte PyTorch (RTX 3060 o superior) es más que suficiente. Para reentrenar, una GPU consumer moderna acelera el bucle de MuJoCo, aunque el cuello de botella suele ser la simulación en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 20xx, 30xx, 40xx) y en iGPU con PyTorch.
- Opciones de despliegue: PyTorch nativo cargando el state dict; integración con Gymnasium/MuJoCo para evaluación; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; dependen principalmente del paso de simulación MuJoCo, no de la red.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v15-humanoid-ppo-best | Humanoid-v5 | PPO | no disponible (MLP oculto 256) | 348 dims | no disponible | Hugging Face, 0 descargas |
| Políticas de referencia Stable-Baselines3 (PPO Humanoid-v5) | Humanoid-v5 | PPO | MLP 256×256 típicamente | 348 dims | MIT (SB3) | GitHub, ampliamente usadas |
| CleanRL PPO continuo | MuJoCo continuo (p. ej. HalfCheetah) | PPO | MLP configurable | variable | MIT | GitHub |
| Políticas del paper original de PPO (Schulman et al.) | MuJoCo (incluido Humanoid) | PPO | MLP | variable | según repositorio original | Referencia académica |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; las cifras de 6235,4 puntos solo son comparables dentro de la propia serie v1–v15 del autor.

## Limitaciones y advertencias

- Es una política específica para `Humanoid-v5`; no funciona fuera de ese entorno ni con morfologías o físicas distintas.
- La licencia no está declarada, lo que impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier explotación.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el conteo es impreciso; conviene verificar los ficheros antes de confiar en él.
- No hay información sobre sesgos, pero al ser un modelo de control no aplican los sesgos típicos de los LLM; sí aplica el riesgo de sobreajuste a las semillas y condiciones de entrenamiento.
- El rendimiento reportado proviene de una única evaluación hold-out de 10 episodios; no hay validación cruzada ni repetición con otras semillas, por lo que la varianza real es desconocida.
- La model card está mayoritariamente en coreano y la información técnica está mezclada con explicaciones divulgativas; algunos detalles (por ejemplo, la arquitectura exacta de las dos cabezas) no se especifican.
- El autor documenta degradación al continuar el entrenamiento más allá de 3,7M pasos en v14, lo que indica sensibilidad al sobreentrenamiento y la necesidad de checkpoints intermedios.
- No apto para producción robótica real sin transferencia sim-to-real, que no se ha documentado.

## Enlaces

- Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15-humanoid-ppo-best
- Entorno Gymnasium Humanoid-v5: https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- CleanRL: https://github.com/vwxyzjn/cleanrl
- Contacto del autor: lucaskim72@gmail.com
