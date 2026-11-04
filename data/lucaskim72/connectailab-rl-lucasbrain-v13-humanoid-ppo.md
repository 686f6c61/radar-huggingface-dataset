# lucaskim72/connectailab-rl-lucasbrain-v13-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v13-humanoid-ppo` es una política de aprendizaje por refuerzo (no un modelo de lenguaje) entrenada con PPO para resolver la tarea `Humanoid-v5` del entorno MuJoCo de Gymnasium. La desarrolla Lucas Kim en el marco del curso de RL de CONNECT AI LAB × AI CITY BUILDERS, y su objetivo es controlar un humanoide simulado de 17 articulaciones a partir de un vector de observación de 348 dimensiones, emitiendo acciones continuas de par motor en el rango [-0,4, 0,4] por articulación.

Se trata de la decimotercera iteración de una serie de experimentos controlados (v1, v7, v13, v14, v15) en los que se varía un único hiperparámetro por versión para aislar su efecto sobre la recompensa. La v13 concreta extiende el entrenamiento de v7 (learning rate 0,0001) hasta 2 millones de pasos, manteniendo el resto de la configuración fija: 8 entornos paralelos, 512 pasos por entorno, clip de 0,2, red oculta de 256 unidades, gamma 0,99 y lambda 0,95.

El interés del modelo es fundamentalmente didáctico y de reproducibilidad: documenta con detalle la curva de aprendizaje, la descomposición de la función de recompensa (supervivencia, avance, coste de par, coste de contacto) y el efecto de cada hiperparámetro. No es un modelo generativo ni tiene capacidades lingüísticas, de visión o de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal densa (MLP) con dos cabezas (política gaussiana y crítica de valor), entrenada con PPO |
| Parámetros totales | no disponible (la model card solo indica capa oculta de 256 unidades; el recuento exacto no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (estado de 348 dimensiones por paso, episodios de hasta 1000 pasos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de control continuo, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio PyTorch, tamaño 0.0 GB según HuggingFace) |

Parámetros de entrenamiento y entorno relevantes:

| Parámetro | Valor |
|---|---|
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Dimensiones de observación | 348 |
| Dimensiones de acción | 17 articulaciones, rango [-0,4, 0,4] |
| Algoritmo | PPO con política gaussiana y normalización de observaciones |
| Capa oculta | 256 |
| Pasos totales de entrenamiento | 2.000.000 |
| Learning rate | 0,0001 |
| Clip (epsilon PPO) | 0,2 |
| Entornos paralelos | 8 |
| Pasos por entorno por actualización | 512 (4096 experiencias por update) |
| Épocas por update | 10 |
| Gamma | 0,99 |
| Lambda (GAE) | 0,95 |
| Bonus de exploración | 0,0 |
| Desviación inicial de la política | ~0,14 |
| Semilla de evaluación | 9000–9009 (10 episodios holdout) |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa con dos cabezas: una cabeza de política que parametriza una distribución gaussiana sobre las 17 acciones continuas (media y desviación por articulación) y una cabeza de valor que estima el retorno esperado. Las observaciones se normalizan antes de entrar en la red, decisión justificada por el salto de 7 a 348 dimensiones de estado respecto al entorno anterior (Roadster) del mismo curso. Las acciones se recortan al rango [-0,4, 0,4] en inferencia, usando únicamente la media de la distribución, sin muestreo estocástico.

El entrenamiento sigue el esquema PPO estándar: se recogen 4096 transiciones (8 entornos × 512 pasos), se calculan ventajas con GAE (gamma 0,99, lambda 0,95) y se actualiza la política durante 10 épocas con recorte de la ratio de probabilidad a ±20 % (clip 0,2). No se aplica bonus de entropía en la configuración final. La serie de experimentos varía un hiperparámetro por versión: v7 bajó el learning rate de 0,0003 a 0,0001, y v13 mantiene ese valor extendiendo el entrenamiento a 2 millones de pasos. Según la model card, en v13 la puntuación de evaluación seguía subiendo al terminar el entrenamiento, lo que motivó la extensión a v14 (4 millones de pasos) y el ajuste posterior a v15 (learning rate 0,00003), que obtuvo la mejor media en 10 episodios holdout.

## Capacidades

- Control continuo de un humanoide simulado: mantiene el equilibrio y genera una marcha hacia delante en `Humanoid-v5`.
- Política determinista en inferencia: emite la media de la distribución gaussiana, recortada a [-0,4, 0,4].
- Generalización limitada al entorno de entrenamiento: no se documenta transferencia a otros entornos o morfologías.
- Reproducibilidad: la model card detalla semillas, hiperparámetros y criterios de evaluación.
- Sin capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión ni audio.
- Sin soporte de tool calling ni de razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Docencia de PPO en control continuo: sirve como referencia ejecutable para explicar clip, GAE, normalización de observaciones y paralelización de entornos en un curso de RL.
- Estudio de ablaciones de hiperparámetros: la serie v1/v7/v13/v14/v15 permite analizar el efecto de learning rate y número de pasos sobre la recompensa final con un protocolo de evaluación fijo (10 semillas holdout).
- Punto de partida para fine-tuning en MuJoCo: se puede inicializar el entrenamiento desde estos pesos para experimentar con otras recompensas o variantes de `Humanoid`.
- Benchmark de infraestructura de RL: con 348 entradas, 17 salidas y 2 millones de pasos, es una carga ligera útil para medir throughput de frameworks de entrenamiento (Stable-Baselines3, CleanRL, etc.).
- Demostración visual de locomoción bípeda: el GIF de replay del repositorio sirve para material divulgativo sobre aprendizaje de la marcha.
- Comparación de algoritmos: como baseline PPO frente a SAC o TD3 en el mismo entorno para ilustrar diferencias en estabilidad y muestra necesaria.
- Pruebas de robustez ante perturbaciones: evaluar la política bajo ruido en observaciones o cambios en el modelo físico para estudiar la fragilidad de políticas sobreentrenadas en simulación.

## Benchmarks y rendimiento

Resultados publicados en la model card para esta versión (v13), evaluados sobre 10 semillas holdout (9000–9009):

| Métrica | Valor |
|---|---|
| Recompensa media (holdout 10 episodios) | 1167,1 puntos |
| Longitud media del episodio | 225,8 pasos |
| Avance medio | 1,0913183188231967 |
| Recompensa del replay mostrado (semilla 9000) | 1411,8 puntos, 268 pasos, avance 1,55 |

No se han publicado comparaciones numéricas con otros checkpoints de la serie (v1, v7, v14, v15) en la información disponible, salvo la afirmación cualitativa de que v15 obtiene la mejor media holdout y que v14 alcanzó su máximo en 3,7 millones de pasos antes de degradarse con más entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, por debajo de 100 MB; la red es un MLP con capa oculta de 256 unidades y 348 entradas, con pesos del orden de cientos de miles de parámetros.
- GPU recomendadas: cualquier GPU consumer moderna sirve para inferencia (GTX 1060, RTX 3060, RTX 4090); para entrenamiento con 8 entornos MuJoCo en CPU, una GPU de gama media acelera las actualizaciones pero el cuello de botella suele estar en la simulación.
- Cabe en cualquier GPU consumer e incluso en CPU para inferencia a tiempo real.
- Opciones de despliegue: inferencia directa con PyTorch; entrenamiento con Stable-Baselines3, CleanRL u otro framework PPO. No se documenta exportación a ONNX, TorchScript ni integración con vLLM, llama.cpp u Ollama (no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada; con esta arquitectura se espera un forward pass de microsegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Pasos entrenados | Recompensa holdout | Licencia |
|---|---|---|---|---|---|
| lucasbrain v13 (este) | Humanoid-v5 | PPO | 2.000.000 | 1167,1 (media 10 semillas) | no disponible |
| lucasbrain v15 (mismo autor) | Humanoid-v5 | PPO | no disponible | mejor media holdout según la model card, sin cifra publicada | no disponible |
| lucasbrain v1 (mismo autor) | Humanoid-v5 | PPO | 1.000.000 | no disponible | no disponible |
| Políticas de referencia de Gymnasium/MuJoCo | Humanoid-v5 | PPO/SAC | no disponible | no disponible | no disponible |

No se dispone de comparaciones con implementaciones de terceros (por ejemplo, Stable-Baselines3 Zoo) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas ni genera código. Cualquier uso en esos ámbitos es inaplicable.
- Licencia no especificada: no hay garantía de uso comercial; conviene contactar con el autor antes de cualquier despliegue en producto.
- Repositorio de 0.0 GB según HuggingFace: es posible que los pesos no estén subidos o que el tamaño reportado no refleje los ficheros reales; verificar antes de intentar cargarlo.
- Rendimiento limitado: recompensa media de 1167,1 frente a los ~5000 puntos que se obtendrían solo por supervivencia durante 1000 pasos; el agente cae de media a los ~226 pasos.
- Entrenado únicamente en `Humanoid-v5` con semillas de evaluación 9000–9009: riesgo de sobreajuste a esas condiciones y nula evidencia de transferencia a otros entornos o variaciones físicas.
- Alta varianza entre episodios: el replay de una sola semilla alcanza 1411,8 puntos frente a la media de 1167,1, lo que indica dispersión considerable.
- Entrenamiento incompleto: la propia model card señala que la puntuación seguía subiendo al terminar los 2 millones de pasos, por lo que esta versión no es la mejor de la serie.
- Sin documentación sobre sesgos, robustez o seguridad en simulación a realidad (sim-to-real); no debe usarse como controlador de un robot físico sin validación adicional.
- La model card está redactada en coreano con terminología pedagógica; algunos detalles técnicos (arquitectura exacta de capas, inicialización) no se especifican.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v13-humanoid-ppo
- Perfil del autor: https://huggingface.co/lucaskim72
- Contacto del autor: lucaskim72@gmail.com
- Entorno Humanoid-v5 (Gymnasium): https://gymnasium.farama.org/environments/mujoco/humanoid/
- Documentación de MuJoCo: https://mujoco.readthedocs.io/
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
