# poplolioi11/deep-rl-unit6-panda-20261105

## Resumen

`poplolioi11/deep-rl-unit6-panda-20261105` es un checkpoint de aprendizaje por refuerzo publicado en Hugging Face por el usuario poplolioi11 (Chen-Yu Chu). No se trata de un modelo de lenguaje, sino de una política neuronal entrenada con el algoritmo A2C (Advantage Actor-Critic) de Stable-Baselines3 para resolver la tarea `PandaReachDense-v3` del entorno panda-gym, en la que un brazo robótico simulado en PyBullet debe alcanzar una posición objetivo en el espacio tridimensional. El modelo se entrenó desde inicialización aleatoria durante un millón de pasos, seleccionando el checkpoint de 983.040 pasos mediante un conjunto de validación separado de 20 episodios.

El interés de esta ficha es acotado: se trata de un artefacto educativo vinculado a la unidad 6 del curso Deep RL de Hugging Face, no de un modelo de propósito general. Su relevancia radica en que documenta de forma reproducible un pipeline completo de RL (entrenamiento, normalización de observaciones, validación y holdout independiente), con métricas declaradas y verificación de recarga desde cero. La licencia MIT permite reutilización sin restricciones.

El modelo se distribuye como checkpoint de framework (política `MultiInputPolicy` de Stable-Baselines3 junto con estadísticas `VecNormalize`), sin pesos en formato safetensors ni GGUF, y no soporta inferencia de texto, visión ni ninguna de las capacidades asociadas a los modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal `MultiInputPolicy` (A2C, Advantage Actor-Critic) sobre observaciones dict de panda-gym; red actor-crítico MLP con extractor de características para observaciones multimodales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el entorno es un MDP con observaciones por paso) |
| Tipos de cuantizacion | no disponible (checkpoint de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de Stable-Baselines3 (`.zip` de PyTorch) acompañado de estadísticas `VecNormalize`; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

La política sigue el esquema actor-crítico de A2C implementado en Stable-Baselines3 2.9.2 con `MultiInputPolicy`, que procesa observaciones en formato diccionario (típicamente estado de articulaciones y posición del objetivo en `PandaReachDense-v3`). El entrenamiento se realizó desde inicialización aleatoria, sin políticas preentrenadas importadas ni modificación de la función de recompensa, durante un millón de pasos en el entorno original panda-gym 3.0.7 con PyBullet 3.2.7 en modo DIRECT. El checkpoint final corresponde al paso 983.040, elegido mediante un conjunto de validación separado de 20 episodios.

El paquete incluye las estadísticas de `VecNormalize` correspondientes, que deben mantenerse junto a los pesos: la evaluación congela las estadísticas de normalización y desactiva la normalización de recompensa. La verificación se realizó sobre un holdout independiente de 100 episodios (semillas 90000 a 90099), con recarga desde cero de los artefactos. El entorno de software declarado es Python 3.12, PyTorch 2.9.1, Gymnasium 0.29.1 y NumPy 1.26.4. No se documentan innovaciones técnicas adicionales (sin decodificación especulativa, atención lineal ni mecanismos híbridos, por la naturaleza del modelo).

## Capacidades

- Control de un brazo robótico simulado para alcanzar una posición objetivo 3D en `PandaReachDense-v3`.
- Aprendizaje por refuerzo con recompensa densa basada en la distancia al objetivo.
- Procesamiento de observaciones multimodales en formato diccionario mediante `MultiInputPolicy`.
- Inferencia determinista o estocástica según la configuración de la política A2C.
- Evaluación reproducible con estadísticas de normalización congeladas.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Docencia y reproducción de RL: sirve como referencia funcional de la unidad 6 del curso Deep RL de Hugging Face, permitiendo a estudiantes comparar su propia implementación de A2C con un checkpoint verificado en holdout.
- Baseline para experimentos de control robótico: puede usarse como punto de partida para comparar algoritmos alternativos (PPO, SAC, TD3) sobre el mismo entorno panda-gym con idéntico protocolo de evaluación.
- Validación de pipelines de entrenamiento: el par pesos + `VecNormalize` permite comprobar que una infraestructura de evaluación reproduce el retorno declarado (-0,1845 ± 0,1343) antes de escalar a tareas más complejas.
- Pruebas de integración de Stable-Baselines3: útil para verificar versiones de PyTorch, Gymnasium y panda-gym en un entorno controlado antes de desplegar entrenamientos largos.
- Estudio de normalización de observaciones: el paquete documenta explícitamente cómo congelar estadísticas `VecNormalize` en evaluación, un detalle habitualmente omitido y fuente frecuente de discrepancias de rendimiento.
- Simulación educativa de alcance robótico: para demostraciones en asignaturas de robótica o RL aplicado donde se necesite una política que alcance objetivos en PyBullet sin entrenamiento previo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente por Hugging Face):

| Tarea | Dataset/entorno | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | PandaReachDense-v3 | mean_reward | -0,18448486 +/- 0,13427638 |

Datos adicionales del holdout declarado (100 episodios, semillas 90000-90099): media de retorno bruto -0,18448486, desviación estándar poblacional 0,13427638, media menos una desviación -0,31876124. El autor indica que los 100 episodios alcanzaron la condición de éxito original del entorno.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño típico de una política A2C para `PandaReachDense-v3` (MLP de pocas capas), la inferencia cabe holgadamente en cualquier GPU consumer, aunque no se publican cifras.
- GPU recomendadas: no se especifican; cualquier GPU compatible con PyTorch 2.9.1 es suficiente. La simulación PyBullet en modo DIRECT es CPU-bound, por lo que la GPU no es el cuello de botella.
- GPU consumer: sí, previsiblemente cualquier modelo con soporte CUDA o incluso ejecución en CPU.
- Opciones de despliegue: carga directa con Stable-Baselines3 (`A2C.load`) junto con `VecNormalize.load`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| poplolioi11/deep-rl-unit6-panda-20261105 | A2C | PandaReachDense-v3 | no disponible | no aplica | MIT | Hugging Face |
| Políticas de referencia del curso Deep RL (unidad 6) | A2C/PPO | PandaReachDense-v3 | no disponible | no aplica | según repositorio del curso | GitHub de Hugging Face |
| Otros checkpoints panda-gym en Hugging Face | variable (PPO, SAC, A2C) | PandaReachDense-v3 y variantes | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a aspectos de disponibilidad y licencia.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve `PandaReachDense-v3`; no generaliza a otras tareas, entornos ni modalidades.
- Sin capacidades de lenguaje, visión ni razonamiento simbólico; no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- El rendimiento declarado no ha sido verificado de forma independiente por Hugging Face (`verified: false`); procede del autor.
- La evaluación requiere mantener juntas las estadísticas `VecNormalize` y los pesos, con normalización de recompensa desactivada; un uso incorrecto produce resultados distintos a los publicados.
- El código fuente de entrenamiento permanece privado, lo que limita la reproducibilidad completa del pipeline.
- Los archivos son checkpoints de framework: deben cargarse solo artefactos de confianza, ya que la deserialización de PyTorch puede ejecutar código arbitrario.
- El autor declara explícitamente que no reclama dominio humano independiente ni reconocimiento oficial del curso; el paquete solo registra comprobaciones locales.
- No se documentan sesgos ni riesgos de alucinación por no ser un modelo generativo; el riesgo principal es de sobreajuste al entorno simulado y de transferencia nula a un robot físico sin ajuste adicional.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías.

## Enlaces

- Hugging Face: https://huggingface.co/poplolioi11/deep-rl-unit6-panda-20261105
- Notebook de la unidad 6 del curso Deep RL (Hugging Face): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/main/notebooks/unit6/unit6.ipynb
- Repositorio del curso Deep RL: https://github.com/huggingface/deep-rl-class
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- panda-gym: https://github.com/qgallouedec/panda-gym
- PyBullet: https://pybullet.org
