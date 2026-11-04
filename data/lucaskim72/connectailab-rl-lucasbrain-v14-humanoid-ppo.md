# lucaskim72/connectailab-rl-lucasbrain-v14-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v14-humanoid-ppo` es una política de aprendizaje por refuerzo entrenada con PPO para la tarea `Humanoid-v5` de Gymnasium/MuJoCo. No es un modelo de lenguaje: es una red neuronal de control continuo que observa 348 variables del estado del robot humanoide simulado y emite 17 fuerzas articulares en el rango [-0.4, 0.4]. Lo publica el autor independiente lucaskim72 como parte del curso de RL de CONNECT AI LAB × AI CITY BUILDERS.

La política es una red con dos cabezas (una para la media de la acción gaussiana y otra para el valor del estado), capas ocultas de 256 unidades y normalización de observaciones activada. Se entrenó durante 4 millones de pasos de entorno con 8 mundos paralelos (4096 experiencias por actualización), learning rate 0.0001, clip 0.2, gamma 0.99 y lambda 0.95. El checkpoint publicado corresponde al mejor punto de validación, alcanzado alrededor de los 3,7 millones de pasos.

La relevancia es acotada: se trata de un artefacto educativo y reproducible dentro de una serie de ablaciones (v1, v7, v13, v14, v15) diseñada para mostrar el efecto de variar un hiperparámetro cada vez. La model card reporta una media de 4944,9 puntos y una longitud media de episodio de 843,4 pasos en 10 episodios de validación con semillas 9000-9009, así como 4218,3 puntos, 712 pasos y 10,46 de desplazamiento en la reproducción con semilla 9000 usando acciones deterministas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward con dos cabezas (política gaussiana y función de valor), PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 348 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch (librería declarada: pytorch); el repositorio reporta 0.0 GB de tamaño |

Otros datos técnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Dimension del estado | 348 |
| Dimension de la accion | 17 articulaciones, cada una en [-0.4, 0.4] |
| Capas ocultas | 256 |
| Normalizacion de observaciones | activada |
| Algoritmo | PPO con política gaussiana |
| Total de pasos de entrenamiento | 4 000 000 |
| Learning rate | 0.0001 |
| Clip | 0.2 |
| Numero de mundos paralelos | 8 |
| Pasos por mundo por actualizacion | 512 (4096 experiencias por actualizacion) |
| Gamma | 0.99 |
| Lambda | 0.95 |
| Bonus de exploración | 0.0 |
| Epocas de reutilización por lote | 10 |
| Desviación inicial de la política | ~0.14 |
| Semilla del checkpoint | 9000 |

## Arquitectura y entrenamiento

La política sigue el esquema PPO estándar para control continuo: una red con dos cabezas que comparte tronco y capas ocultas de 256 unidades. Una cabeza produce la media de una distribución gaussiana sobre las 17 fuerzas articulares; la otra estima la función de valor. La desviación típica de la distribución parte de aproximadamente 0.14 y se usa solo durante el entrenamiento y la exploración; en evaluación se emplea la acción determinista (la media), recortada al rango [-0.4, 0.4].

El entrenamiento recoge 512 pasos por cada uno de los 8 entornos paralelos (4096 transiciones), actualiza la política durante 10 épocas sobre ese lote y descarta las experiencias (PPO on-policy). Se aplica ventaja generalizada (GAE) con gamma 0.99 y lambda 0.95, y recorte de la ratio de probabilidad a ±20 %. La normalización de observaciones se activa para homogeneizar las magnitudes dispares de las 348 variables de estado. La model card documenta una serie de ablaciones de un solo factor (clip 0.05/0.50, 4/16 mundos, learning rate 0.0003/0.001/0.0001, 500k/1M/2M pasos, 64 unidades ocultas, bonus de exploración 0.001, gamma 0.95, normalización desactivada) que sirven como material didáctico, aunque no se incluyen sus resultados numéricos completos en la información disponible.

## Capacidades

- Control motor continuo de un humanoide simulado: mantener el equilibrio y desplazarse hacia delante emitiendo 17 fuerzas articulares.
- Política determinista adecuada para despliegue en evaluación (se usa la media de la distribución gaussiana, sin muestreo).
- Robustez moderada dentro del régimen de entrenamiento: media de 4944,9 puntos y 843,4 pasos por episodio en 10 semillas de validación no vistas.
- Reproducibilidad parcial: la model card documenta hiperparámetros completos y semillas de evaluación.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües.
- No tiene visión, audio ni modo de razonamiento textual: su entrada es exclusivamente el vector de estado de MuJoCo.
- No es un modelo generativo de texto.

## Casos de uso

- Docencia de PPO en control continuo: el repositorio sirve como checkpoint de referencia para una clase práctica de 6 sesiones, comparando su curva de aprendizaje con las variantes v1, v7, v13 y v15 del mismo autor.
- Reproducción de experimentos de ablación: al estar documentados learning rate, clip, gamma, lambda y número de mundos, se puede partir de este checkpoint para estudiar el efecto de cambiar un único hiperparámetro y comparar contra las cifras publicadas.
- Punto de partida para fine-tuning de locomoción: reentrenar con PPO desde estos pesos en variantes de la tarea (cambios de recompensa, terreno o restricciones articulares) reduce el coste frente a entrenar desde cero.
- Validación de infraestructura de RL: sirve para comprobar que un pipeline de MuJoCo, Gymnasium y una implementación de PPO funcionan correctamente, ya que se conoce el rendimiento esperado (entorno a 4900 puntos en 10 episodios con semillas 9000-9009).
- Demostración de simulación en vídeo: la model card incluye una reproducción (replay.gif) con acción determinista, útil para material divulgativo sobre robótica simulada.
- Benchmark interno de algoritmos de RL: comparar PPO contra SAC o TD3 sobre `Humanoid-v5` partiendo de este baseline documentado.

## Benchmarks y rendimiento

Resultados reportados por el autor en `Humanoid-v5` (media de 10 episodios de validación con semillas 9000-9009, acción determinista):

| Metrica | Valor |
|---|---|
| Recompensa media (holdout 10 episodios) | 4944.9 |
| Longitud media de episodio | 843.4 pasos |
| Desplazamiento medio hacia delante | 11.515661679149815 |
| Recompensa en semilla 9000 (replay) | 4218.3 |
| Pasos en semilla 9000 (replay) | 712 |
| Desplazamiento en semilla 9000 (replay) | 10.46 |

No se han publicado comparaciones numéricas con otros modelos o políticas en la información disponible. La model card menciona un modelo posterior del mismo autor (v15) con learning rate 0.00003 que obtendría la media más alta en 10 episodios no vistos, pero no se incluyen sus cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. La red es un MLP con 348 entradas, capas ocultas de 256 y 17 salidas; con pesos en FP32 ocupa del orden de unos pocos megabytes. No se dispone del recuento exacto de parámetros en la información proporcionada.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1060, RTX 2060, RTX 3060 o superiores. También es viable en CPU para inferencia de un único entorno.
- Cabe en cualquier GPU consumer; no requiere memoria significativa.
- Opciones de despliegue: PyTorch directamente (cargar los pesos y ejecutar el forward), o exportación a ONNX/TorchScript, aunque la información disponible no confirma que se incluyan esos formatos. Para el entrenamiento con MuJoCo se necesita, además, un entorno con `mujoco` y `gymnasium`.
- Latencia y throughput: no disponibles. Al tratarse de un MLP, la inferencia por paso es del orden de microsegundos en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos numéricos de modelos comparables en la información proporcionada. Como referencias cualitativas de la misma categoría (políticas de control continuo en MuJoCo):

| Modelo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v14-humanoid-ppo | Humanoid-v5 | no disponible | no aplica | no disponible | HuggingFace (lucaskim72) |
| connectailab-rl-lucasbrain-v15 (mismo autor) | Humanoid-v5 | no disponible | no aplica | no disponible | Mencionado en la model card, no confirmado |
| Políticas PPO de referencia de Stable-Baselines3 | Humanoid-v5 y otros | no disponible | no aplica | MIT (SB3) | Repositorio público |
| Políticas SAC/TD3 de referencia de Stable-Baselines3 | Humanoid-v5 y otros | no disponible | no aplica | MIT (SB3) | Repositorio público |

Los datos de rendimiento de estas alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo funciona en `Humanoid-v5` con la parametrización exacta de observación (348 dimensiones) y acción (17 articulaciones, [-0.4, 0.4]). No es transferible directamente a otros robots o entornos sin reentrenamiento.
- Sin licencia declarada: no se especifica licencia en la información disponible, lo que impide asumir derechos de uso comercial. Conviene contactar con el autor antes de cualquier uso en producción.
- Sin datos de sesgo ni de robustez fuera de distribución: no se han publicado evaluaciones con perturbaciones, cambios de fricción o terreno.
- Riesgo de degradación por sobreentrenamiento: el propio autor indica que, tras el mejor punto en torno a los 3,7 millones de pasos, el rendimiento en validación descendió al seguir entrenando; el checkpoint publicado corresponde a ese mejor punto, no a los 4 millones de pasos.
- Reproducibilidad limitada: no se detalla el código de entrenamiento ni el código de evaluación en la información disponible, aunque se documentan hiperparámetros y semillas.
- Dependencia de MuJoCo/Gymnasium: el rendimiento depende de la versión exacta de `Humanoid-v5`; cambios en la dinámica o en la función de recompensa invalidan las cifras publicadas.
- Reputación y adopción nulas: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es 0.0 GB, por lo que conviene verificar la integridad de los pesos antes de usarlos.
- No apto para robótica real sin transferencia sim-to-real: no se aportan datos de despliegue físico ni de calibración.

## Enlaces

- HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v14-humanoid-ppo
- Entorno Humanoid-v5 en Gymnasium: https://gymnasium.farama.org/environments/mujoco/humanoid/
- Documentación de MuJoCo: https://mujoco.org/
- Stable-Baselines3 (implementación de referencia de PPO): https://github.com/DLR-RM/stable-baselines3
- Documentación de PPO en Stable-Baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
- Contacto del autor: lucaskim72@gmail.com
