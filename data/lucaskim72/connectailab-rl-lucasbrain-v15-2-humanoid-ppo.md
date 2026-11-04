# lucaskim72/connectailab-rl-lucasbrain-v15.2-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v15.2-humanoid-ppo` es una política de aprendizaje por refuerzo (no un modelo de lenguaje) entrenada con PPO para control continuo del entorno `Humanoid-v5` de Gymnasium/MuJoCo. Lo desarrolla Lucas Kim (AI Build Master) en el marco del curso de RL de CONNECT AI LAB × AI CITY BUILDERS, y resuelve el problema de locomoción bípeda: dado un vector de observación de 348 dimensiones, emite 17 acciones continuas (una por articulación, en el rango -0.4 a 0.4) para que un humanoide simulado se mantenga en pie y avance.

El artefacto es un `model.pt` de PyTorch que contiene los pesos de una red PPO con dos cabezas (política gaussiana y función de valor), capas ocultas de 256 unidades y normalización de observaciones activada. La versión v15.2 parte del checkpoint de 3,7 millones de pasos de v14 y aplica un ajuste fino con learning rate 3e-5, acumulando 6.611.520 pasos totales de entrenamiento.

Es relevante como referencia reproducible de un pipeline PPO completo sobre un entorno de control continuo de alta dimensionalidad, con una metodología de ablación explícita (un hiperparámetro por experimento) documentada a lo largo de cinco versiones encadenadas (v1, v7, v13, v14, v15). No es un modelo de propósito general: su utilidad está acotada al entorno `Humanoid-v5` y a tareas de investigación o docencia en RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected con dos cabezas (política gaussiana + función de valor), entrenada con PPO |
| Parametros totales | no disponible (capas ocultas de 256 unidades; el número exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 348 dimensiones por paso |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin versiones cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`), más script auxiliar `added_scores.py` |
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Dimension de observacion | 348 |
| Dimension de accion | 17 articulaciones, cada una en [-0.4, 0.4] |
| Algoritmo | PPO con política gaussiana, clip 0.2, gamma 0.99, lambda 0.95 |
| Learning rate | 3e-5 |
| Pasos totales de entrenamiento | 6.611.520 |
| Mundos paralelos | 8 |
| Horizonte por mundo | 512 pasos (4.096 experiencias por actualización) |
| Épocas por actualización | 10 |
| Exploración (bonus) | 0.0 |
| Normalización de observaciones | activada |

## Arquitectura y entrenamiento

La política es una red feed-forward con dos cabezas: una cabeza de política que parametriza una distribución gaussiana sobre las 17 acciones continuas (media y desviación típica por articulación, con la media recortada al rango [-0.4, 0.4] en evaluación) y una cabeza de valor que estima el retorno esperado. La entrada es un vector de 348 dimensiones que resume el estado del cuerpo (posiciones, velocidades y contactos del humanoide). Las capas ocultas son de 256 unidades, un aumento respecto a las 64 usadas en experimentos previos con entornos de menor dimensionalidad (por ejemplo, el entorno de coche tipo `Roadster`), justificado por el salto de 7 a 348 dimensiones de observación. Se aplica normalización de observaciones.

El entrenamiento sigue PPO con recolección on-policy: 8 copias del entorno en paralelo, 512 pasos por entorno (4.096 transiciones por iteración), 10 épocas de optimización por lote, clip de 0.2, gamma 0.99 y GAE con lambda 0.95. La desviación inicial de la gaussiana es de aproximadamente 0.14, manteniendo exploración acotada desde el principio dado el límite de 0.4 por articulación. La progresión documentada es: v1 (1M pasos, lr 3e-4) como línea base; v7 (1M pasos, lr 1e-4) como mejor condición de la primera comparación; v13 (2M pasos, mismos hiperparámetros que v7); v14 (extensión a 4M pasos, conservando el mejor checkpoint en 3,7M); y v15 (lr 3e-5 sobre el checkpoint de 3,7M), que obtiene la mejor media en 10 episodios de validación. La innovación metodológica destacable no es arquitectónica sino experimental: ablaciones de un solo factor (clip, número de mundos, learning rate, pasos totales, tamaño oculto, bonus de exploración, gamma, normalización) documentadas de forma explícita.

Además del reward estándar de `Humanoid-v5`, esta versión incorpora una puntuación de postura añadida durante el entrenamiento, con multiplicadores de 0.4 para el torso, 0.2 para los brazos y 0.0 para los pies. Los multiplicadores se almacenan junto a los pesos en `model.pt`, y la fórmula de suma vive en `added_scores.py` dentro del mismo repositorio. Las puntuaciones reportadas en la model card corresponden al reward del entorno, no al reward aumentado.

## Capacidades

- Control continuo de locomoción bípeda en `Humanoid-v5`: mantener el equilibrio y desplazarse hacia delante aplicando pares articulares dentro de [-0.4, 0.4].
- Política determinista en evaluación: usa la media de la gaussiana sin ruido de exploración, con recorte al rango de acción.
- Estimación de valor: la segunda cabeza proporciona una predicción de retorno utilizable para diagnóstico o para inicializar un crítico en ajustes finos.
- Robustez ante 348 dimensiones de observación gracias a la normalización de entradas.
- Entrenamiento on-policy reproducible: hiperparámetros completos publicados (clip, gamma, lambda, épocas, horizonte, número de mundos).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: es exclusivamente una política de control.
- No generaliza fuera de `Humanoid-v5`: el espacio de observación y acción está fijado por ese entorno.

## Casos de uso

- Docencia de PPO en control continuo: el repositorio incluye la secuencia completa v1 → v7 → v13 → v14 → v15, lo que permite mostrar en clase cómo afecta cada hiperparámetro (learning rate, pasos totales, tamaño oculto, clip) al retorno, con checkpoints intermedios disponibles.
- Línea base para investigación en locomoción: sirve como referencia PPO "vanilla" contra la que comparar variantes (SAC, TD3, PPO con reward shaping, curricula) sobre `Humanoid-v5`, con una puntuación de validación de 6.926,0 de media en 10 episodios.
- Punto de partida para ajuste fino con reward shaping: los multiplicadores de postura (torso 0.4, brazos 0.2, pies 0.0) y `added_scores.py` permiten reentrenar con una función de recompensa modificada partiendo de un checkpoint ya competente, en lugar de desde cero.
- Inicialización de un crítico o de una política en pipelines de RL jerárquico: la cabeza de valor entrenada puede reutilizarse como aproximador de retorno para un nivel superior de control (por ejemplo, un planificador de dirección).
- Generación de datos de demostración para imitation learning: ejecutando la política determinista se obtienen trayectorias de 1.000 pasos con retorno alto que pueden servir como dataset para behavior cloning o para inicializar otros algoritmos.
- Pruebas de infraestructura de simulación: al ser un artefacto pequeño (0,0 GB) con dependencias estándar (PyTorch, Gymnasium, MuJoCo), es útil para validar entornos de ejecución, contenedores o pipelines de evaluación antes de escalar a modelos mayores.
- Reproducción de resultados: los 10 episodios de validación usan semillas fijas (9000 a 9009), lo que permite verificar de forma exacta la puntuación reportada en una máquina distinta.

## Benchmarks y rendimiento

Los únicos datos publicados son los de validación del propio autor sobre `Humanoid-v5`, con semillas 9000 a 9009 (10 episodios). No se comparan con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Retorno medio (10 episodios, semillas 9000-9009) | 6.926,0 |
| Longitud media de episodio | 1.000,0 pasos (máximo del entorno) |
| Desplazamiento medio hacia delante | 26,76026144874147 |
| Retorno en el episodio de la semilla 9000 | 6.945,4 (1.000 pasos, avance 27,01) |
| Pasos totales de entrenamiento | 6.611.520 |

No se han publicado resultados de benchmarks frente a otros algoritmos (SAC, TD3, A2C) ni frente a otras implementaciones de PPO en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. La red es un MLP con capas ocultas de 256 unidades y entrada de 348 dimensiones; los pesos ocupan del orden de unos pocos MB, muy por debajo de 1 GB.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; el cuello de botella real es la simulación MuJoCo, no la inferencia de la red. Una RTX 3060 o superior permite ejecutar varios entornos en paralelo sin problema.
- Cabe en cualquier GPU de consumo e incluso en CPU: la inferencia por paso es una multiplicación de matrices pequeña. Para entrenamiento desde cero conviene GPU, pero para evaluar el checkpoint la CPU es viable.
- Opciones de despliegue: carga directa con `torch.load` sobre `model.pt`; no hay versiones GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto. El script `added_scores.py` se descarga con `huggingface_hub.hf_hub_download`.
- Latencia y throughput: no disponibles de forma explícita. Dado el tamaño de la red, la latencia por paso está dominada por `env.step()` de MuJoCo; con `mujoco` o `gymnasium` en modo headless se pueden alcanzar miles de pasos por segundo en CPU para la política.
- Almacenamiento: el repositorio ocupa 0,0 GB según HuggingFace, es decir, unos pocos MB.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints de PPO para `Humanoid-v5` con los que comparar directamente en la documentación proporcionada. Como referencia cualitativa, se comparan las propias versiones del autor, que sí están documentadas:

| Version | Learning rate | Pasos totales | Observaciones |
|---|---|---|---|
| v1 (línea base) | 3e-4 | 1.000.000 | Punto de partida de las ablaciones |
| v7 | 1e-4 | 1.000.000 | Mejor condición de la primera comparación |
| v13 | 1e-4 | 2.000.000 | El retorno seguía subiendo al terminar |
| v14 | 1e-4 | 4.000.000 | Mejor checkpoint en 3,7M; el retorno cayó al seguir entrenando |
| v15 (este) | 3e-5 | 6.611.520 | Mejor media en 10 episodios de validación |

Frente a alternativas de la misma categoría (SAC, TD3, A2C sobre `Humanoid-v5`), no hay datos de rendimiento en la información disponible. Tampoco se dispone de comparación con implementaciones de referencia como Stable-Baselines3 o CleanRL.

## Limitaciones y advertencias

- Especialización total: la política solo es válida para `Humanoid-v5` con su espacio de observación (348 dimensiones) y acción (17 articulaciones). No es transferible a otros robots, morfologías ni entornos sin reentrenamiento.
- Licencia no especificada: no se indica licencia en la model card ni en los metadatos de HuggingFace. Sin una licencia explícita, el uso comercial queda en un limbo legal; conviene contactar con el autor antes de integrarlo en un producto.
- Sin datos de sesgo ni de robustez fuera de distribución: no se documenta el comportamiento ante perturbaciones (empujes, cambios de masa, fricción variable) ni ante condiciones distintas de las semillas de validación.
- Riesgo de sobreajuste a las semillas de evaluación: las 10 semillas de validación (9000-9009) son fijas y conocidas, por lo que la puntuación de 6.926,0 puede no reflejar el rendimiento en semillas no vistas. No se reporta un conjunto de test independiente.
- Reward shaping no estándar: el entrenamiento incluye una puntuación de postura añadida (torso 0.4, brazos 0.2, pies 0.0) que no forma parte del reward oficial de `Humanoid-v5`. Las puntuaciones reportadas son del entorno, pero el comportamiento aprendido está moldeado por ese término extra, lo que puede introducir un sesgo postural respecto a políticas entrenadas solo con el reward nativo.
- Sin garantías de robustez física: el entorno es una simulación MuJoCo; el paso a un humanoide real requeriría sim-to-real (domain randomization, adaptación de dinámica) que no está cubierto.
- Documentación mayoritariamente en coreano: la model card está redactada en coreano, lo que puede dificultar la reproducibilidad para equipos que no lo lean.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de terceros ni de uso en producción.
- Sin versiones cuantizadas ni exportaciones a ONNX/TorchScript: la integración requiere PyTorch y el código de definición de la red, que no se publica de forma explícita en la información disponible (solo `model.pt` y `added_scores.py`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.2-humanoid-ppo
- Script de puntuación añadida: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.2-humanoid-ppo/blob/main/added_scores.py
- Entorno `Humanoid-v5` (Gymnasium): https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- Contacto del autor: lucaskim72@gmail.com
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código de entrenamiento ni demos adicionales del autor.
