# fromziro/MrPong

## Resumen

MrPong es un agente de aprendizaje por refuerzo (RL) desarrollado por el usuario fromziro (FromZero) para jugar al Pong 2D a un nivel competitivo. Se trata de un perceptrón multicapa (MLP) con arquitectura actor-crítico compartida, diseñado específicamente para controlar una pala en un entorno de tenis de mesa simulado. El modelo recibe un vector de observación de 16 dimensiones (coordenadas de la pelota, velocidades, momento de la pala, puntos de intercepción calculados por raycasting y aperturas del campo contrario) y produce una acción discreta entre tres movimientos posibles: quedarse quieto, subir o bajar.

El modelo se entrenó con Proximal Policy Optimization (PPO) durante 10 millones de pasos de entorno, enfrentándose a una variedad de oponentes que incluyen lógica heurística de distinta dificultad, agentes minimax con profundidad 1 y 2, y oponentes de self-play (tanto la política activa como checkpoints históricos). El resultado es un agente que gana o empata la gran mayoría de partidas contra oponentes lógicos, aunque no logra vencer al oponente "imposible" (reacción de 0 ms). Con solo 28.484 parámetros, el modelo es extremadamente ligero y puede ejecutarse en CPU sin requisitos especiales.

Su relevancia radica en ser un ejemplo claro y reproducible de entrenamiento de RL con self-play y PPO en un entorno de control 2D, con una implementación compacta y documentada. No es un modelo de lenguaje ni de visión; es un controlador neuronal especializado en una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP actor-crítico compartido (`MrPongMLPForRL`) |
| Parametros totales | 28.484 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de control RL, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MLP con una arquitectura actor-crítico compartida. Según la model card, el tamaño oculto declarado es de 160 unidades, aunque el texto descriptivo menciona "dos capas ocultas de 192 unidades cada una" (existe una inconsistencia en la documentación del autor). La observación de 16 dimensiones se procesa a través de dos capas ocultas con activación Tanh, y la representación resultante se comparte entre la cabeza del actor (que produce logits categóricos sobre las 3 acciones) y la cabeza del crítico (que estima el valor escalar del estado V(s)). El número total de capas es 3 (incluyendo la capa de salida).

El entrenamiento se realizó con PPO, con 12 entornos paralelos, 128 pasos de rollout por actualización, 4 épocas de PPO, minibatch de 64, factor de descuento gamma 0.99, GAE lambda 0.95, coeficiente de clip 0.20, coeficiente de valor 0.50, coeficiente de entropía 0.02, norma de gradiente máxima 0.75, tasa de aprendizaje 3.5e-4 con anneal, y un total de 10 millones de timesteps. La longitud máxima de rally se fijó en 1500 pasos.

La estrategia de entrenamiento incluyó una mezcla de oponentes: lógica fácil, media, difícil realista (con horizonte de percepción humano y raycasting de rebotes), imposible (0 ms de reacción), minimax con profundidad 1 y 2, agente aleatorio, y self-play tanto contra la política activa como contra checkpoints históricos (muestreados entre 5 y 75 guardados atrás). Esta diversidad de oponentes fuerza al agente a desarrollar estrategias robustas y no sobreajustarse a un único estilo de juego.

## Capacidades

- Control de agente en Pong 2D: recibe un vector de observación de 16 dimensiones y emite una acción discreta (quedarse, subir, bajar) para mover la pala.
- Juego autónomo: el modelo es capaz de mantener rallies largos y ganar partidas contra oponentes heurísticos de dificultad variable.
- Inferencia en tiempo real en CPU: gracias a su tamaño reducido (28.484 parámetros), puede ejecutarse en tiempo real incluso en hardware modesto.
- Integración con entorno de simulación: el repositorio incluye scripts de inferencia para jugar contra el agente en terminal o simular partidas entre IA.
- Exportación de vídeo: permite grabar partidas en formato MP4 para análisis visual.
- Self-play: el modelo se entrenó contra versiones de sí mismo, lo que le confiere cierta robustez frente a estrategias similares.

## Casos de uso

- Investigación en RL y self-play: el modelo sirve como ejemplo didáctico de entrenamiento con PPO y oponentes mixtos. Los investigadores pueden estudiar cómo la diversidad de oponentes afecta a la robustez de la política aprendida.
- Benchmark de algoritmos de RL: al ser un entorno de control discreto y de baja dimensionalidad, puede utilizarse como punto de comparación para nuevos algoritmos de aprendizaje por refuerzo.
- Enseñanza de conceptos de RL: por su simplicidad y documentación clara, es adecuado para cursos y tutoriales sobre actor-crítico, PPO y entrenamiento con self-play.
- Simulación de comportamientos en juegos 2D: el modelo puede integrarse en motores de juego simples para generar oponentes controlados por IA en juegos tipo Pong.
- Prueba de infraestructuras de despliegue de modelos pequeños: al ser un safetensors de menos de 30 KB, es útil para validar pipelines de inferencia en dispositivos embebidos o edge.
- Generación de datos de entrenamiento para otros modelos: las partidas simuladas pueden usarse para crear conjuntos de datos de demostración para aprendizaje por imitación o RL offline.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación frente a distintos oponentes tras el entrenamiento (1000 partidas por oponente, con empates posibles):

| Oponente | Win % | Draw % | Loss % | Record (W/D/L) | Rally medio |
|---|---:|---:|---:|---:|---:|
| Easy Logic | 99.7% | 0.0% | 0.3% | 997W / 0D / 3L | 1.7 hits |
| Medium Logic | 99.0% | 0.2% | 0.8% | 990W / 2D / 8L | 17.3 hits |
| Realistic Hard | 86.6% | 8.1% | 5.3% | 866W / 81D / 53L | 33.9 hits |
| Impossible Hard | 0.0% | 98.4% | 1.6% | 0W / 984D / 16L | 64.8 hits |
| Minimax Depth 1 | 43.0% | 55.8% | 1.2% | 430W / 558D / 12L | 32.2 hits |
| Minimax Depth 2 | 78.4% | 20.3% | 1.3% | 784W / 203D / 13L | 23.7 hits |
| Random Agent | 100.0% | 0.0% | 0.0% | 1000W / 0D / 0L | 0.9 hits |
| Self-Play Mirror | 1.6% | 96.1% | 2.3% | 16W / 961D / 23L | 50.5 hits |

El modelo pierde un máximo del 5.3% de las partidas contra oponentes lógicos, y empata casi siempre contra el oponente "imposible" (reacción de 0 ms), lo que indica que su rendimiento está cerca del límite teórico de la tarea. No se han publicado comparativas con otros modelos de RL en el mismo entorno.

## Requisitos de hardware

- El modelo tiene solo 28.484 parámetros, lo que ocupa aproximadamente 114 KB en FP32 (menos de 0.1 MB). La VRAM necesaria es insignificante.
- Puede ejecutarse en cualquier CPU moderna sin GPU. La inferencia es prácticamente instantánea (una pasada por un MLP de 3 capas con 160 unidades ocultas).
- Para el entrenamiento, el autor utilizó 12 entornos paralelos; un solo núcleo de CPU es suficiente para reproducir el entrenamiento completo en unas horas.
- Opciones de despliegue: el script `inference.py` incluido permite jugar en terminal o simular partidas. También puede integrarse en cualquier framework de RL que cargue pesos safetensors (PyTorch).
- No se requieren bibliotecas especiales más allá de `torch` y `transformers` para la carga.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos RL específicamente entrenados para Pong con arquitectura y tamaño comparables en el ecosistema público. Los agentes RL clásicos de Pong (como los entrenados con DQN o A3C) suelen tener arquitecturas convolucionales y tamaños mucho mayores, pero no existen métricas estandarizadas de comparación con este modelo. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en Pong 2D con observaciones de 16 dimensiones. No generaliza a otros juegos, tareas o entornos.
- La documentación presenta inconsistencias (tamaño oculto 160 vs 192, referencias a "Mrs. Pong" en el texto), lo que puede generar confusión al reproducir la arquitectura exacta.
- No es un modelo de lenguaje ni de visión; no procesa texto, imágenes ni audio.
- El modelo no logra ganar al oponente "imposible" (0 ms de reacción), aunque empata en el 98.4% de las partidas, lo que sugiere que su rendimiento está limitado por la física del entorno y la frecuencia de decisión.
- No se han publicado análisis de sesgos o comportamientos no deseados más allá de los resultados de evaluación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no tiene valor comercial directo fuera de contextos educativos o de investigación.
- El repositorio no incluye el código de entrenamiento completo (solo el de inferencia), por lo que la reproducibilidad exacta del entrenamiento puede verse limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fromziro/MrPong
- Perfil del autor: https://huggingface.co/fromziro
- Búsqueda de modelos de fromziro: https://huggingface.co/models?other=fromziro
