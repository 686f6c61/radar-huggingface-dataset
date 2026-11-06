# lucaskim72/connectailab-rl-lucasbrain-v2-link01-walk-ppo

## Resumen

`connectailab-rl-lucasbrain-v2-link01-walk-ppo` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) mediante Stable-Baselines3 para el control de la locomoción de un robot bípedo simulado denominado LINK-01. El modelo ha sido desarrollado por Lucas Kim (lucaskim72) en el marco del programa CONNECT AI LAB, dentro de su serie de contenidos sobre IA y robótica, y se publica como artefacto reproducible de un experimento de entrenamiento desde cero.

No se trata de un modelo de lenguaje: no procesa texto ni genera lenguaje natural. Es un controlador neuronal que mapea observaciones de 51 dimensiones (estado de las articulaciones, sensores del robot) a acciones continuas de 14 dimensiones (pares o posiciones objetivo de las 14 articulaciones), aprendidas en el entorno de simulación `Link01Walk-v0` construido sobre MuJoCo. Su relevancia es acotada: sirve como referencia educativa y como punto de partida reproducible para experimentos de locomoción bípeda con PPO en entornos ligeros.

El entrenamiento se completó en 2.002.944 pasos, con un tiempo declarado de 16,41 minutos y 12 entornos paralelos, lo que indica un experimento de pequeña escala orientado a demostración más que a despliegue en producción. El repositorio ocupa 0.0 GB según la ficha de HuggingFace, coherente con una política de red pequeña (MLP) más los ficheros de normalización de observaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (MLP) entrenada con PPO; actor pi [64, 64], crítico vf [256, 256] |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de RL; observación de 51 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (normalización de observaciones), `actor.json` |
| Entorno de entrenamiento | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Dimensiones de observación / acción | 51 / 14 |
| Algoritmo | PPO (clip 0.2, lr 0.0003, gamma 0.99, GAE lambda 0.95, entropía 0.0) |
| Pasos de entrenamiento | 2.002.944 |
| Entornos paralelos | 12 |
| Tiempo de entrenamiento | 16,41 minutos |

## Arquitectura y entrenamiento

La política es una red de tipo perceptrón multicapa con dos capas ocultas de 64 unidades para el actor y dos capas de 256 unidades para el crítico, entrenada con PPO en su implementación de Stable-Baselines3. La observación de 51 dimensiones se normaliza mediante `VecNormalize` (fichero `vecnormalize.pkl`), una práctica habitual en RL para estabilizar el entrenamiento con magnitudes de sensores heterogéneas. La acción es continua de 14 dimensiones, correspondiente a las 14 articulaciones del robot, con una postura por defecto de ±0,18 rad.

El entrenamiento se realizó íntegramente en simulación con el entorno `Link01Walk-v0` del paquete `link01-gym` sobre MuJoCo, sin indicios de transferencia a hardware real ni de entrenamiento con datos demostrados (no se menciona imitation learning ni RLHF, que no aplican aquí). La configuración declarada (12 entornos paralelos, 2 millones de pasos, 16 minutos) sugiere una tarea de recompensa bien definida y un coste computacional bajo, probablemente ejecutado en CPU o en una GPU de consumo. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o currículos de recompensa.

## Capacidades

- Locomoción bípeda hacia delante en el entorno simulado `Link01Walk-v0`, con una velocidad media declarada de 0,2016 m/s.
- Mantenimiento del equilibrio: 0 caídas por minuto en las pruebas declaradas (5 episodios de 20 segundos con comando de 0,18 m/s).
- Control continuo de 14 articulaciones a partir de observaciones de 51 dimensiones.
- Recorrido de 4,032 m por episodio de 20 segundos en las condiciones de prueba indicadas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni de mecanismos de planificación explícita.

## Casos de uso

- Docencia y divulgación de RL: el modelo sirve como ejemplo reproducible de un pipeline completo de PPO con Stable-Baselines3, desde la definición del entorno MuJoCo hasta la evaluación con métricas de distancia, velocidad y caídas, útil en cursos y talleres.
- Punto de partida para experimentos de locomoción: investigadores pueden cargar `model.zip` y `vecnormalize.pkl` para hacer fine-tuning con nuevas recompensas o dominios aleatorizados, aprovechando que el coste de entrenamiento es de minutos.
- Comparación de algoritmos: al ser un artefacto pequeño y rápido de entrenar, permite contrastar PPO con SAC, TD3 o A2C bajo el mismo entorno `Link01Walk-v0` y las mismas métricas declaradas.
- Validación de entornos de simulación: sirve para comprobar que `link01-gym` y la definición de recompensas producen políticas estables, detectando errores de modelado antes de escalar a tareas mayores.
- Base para transferencia sim-to-real en robótica educativa: la política puede probarse en el robot físico LINK-01 o en un gemelo digital, aunque requeriría calibración y probablemente ajuste fino por la brecha de realidad.
- Demostraciones en vídeo y material de marketing técnico: el repositorio incluye `replay.mp4`, lo que facilita generar clips de la política caminando para presentaciones o publicaciones del laboratorio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), sobre el entorno `Link01Walk-v0` con comando de 0,18 m/s, 5 episodios de 20 segundos:

| Metrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 4,032 m |
| Velocidad media hacia delante | 0,2016 m/s |
| Caidas por minuto | 0,0 |

No se han publicado resultados comparativos con otros modelos o políticas en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: al tratarse de una MLP de dos capas de 64 unidades para el actor, la inferencia es prácticamente instantánea en cualquier CPU moderna; no requiere GPU.
- VRAM estimada: inferior a 1 GB en cualquier configuración; el cuello de botella es el simulador MuJoCo, no la red.
- GPU recomendadas: no necesarias; cualquier GPU de consumo (GTX 1650 o superior) acelera el reentrenamiento, pero no la inferencia.
- Cabe en GPU de consumo: sí, con enorme margen, dado el tamaño del repositorio (0.0 GB) y la arquitectura.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`), con `VecNormalize.load` para las observaciones; exportación del actor a JSON (`actor.json`) para integraciones ligeras; el simulador requiere MuJoCo y `link01-gym`.
- Latencia y throughput: no disponibles de forma oficial; por la arquitectura, la latencia de la política es despreciable frente al paso de simulación de MuJoCo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v2-link01-walk-ppo | PPO (MLP) | Link01Walk-v0 (MuJoCo) | no disponible (MLP 64/256) | no aplica | no disponible | HuggingFace |
| Políticas PPO de referencia de Stable-Baselines3 (p. ej. HalfCheetah, Walker2d) | PPO (MLP) | Gymnasium MuJoCo | del orden de decenas de miles | no aplica | MIT (código SB3) | Repositorio SB3 |
| Políticas de locomotion de MuJoCo Playground / Brax | PPO / otros | MuJoCo Playground | variable | no aplica | Apache 2.0 (mayoría) | Repositorios oficiales |

La comparación es cualitativa: no se dispone de resultados de benchmarks comunes entre estas políticas en la información proporcionada, por lo que no es posible establecer una comparación numérica rigurosa.

## Limitaciones y advertencias

- Resultados no verificados: las métricas de la model card están marcadas como `verified: false`; no hay evaluación independiente.
- Entrenamiento exclusivamente en simulación: no hay evidencia de transferencia al robot físico LINK-01 ni de robustez ante perturbaciones, terreno variable o dominios aleatorizados.
- Condiciones de prueba muy específicas: comando de 0,18 m/s, 5 episodios de 20 segundos; el rendimiento fuera de ese régimen (velocidades mayores, giros, terreno irregular) es desconocido.
- Licencia no disponible: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Escala reducida: 2 millones de pasos y 16 minutos de entrenamiento indican un experimento de demostración, no una política madura para producción.
- Dependencia del entorno: la política está acoplada a `Link01Walk-v0` y a la normalización de `vecnormalize.pkl`; usarla con otras observaciones o sin el fichero de normalización degradará el comportamiento.
- Sesgos y alucinaciones: no aplican en el sentido de los LLM, pero sí existe riesgo de sobreajuste a la distribución de entrenamiento y de fallos silenciosos ante estados fuera de distribución.
- Documentación mayoritariamente en coreano: la model card está redactada en coreano, lo que puede dificultar la reproducibilidad para equipos que no lo lean.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v2-link01-walk-ppo
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- Contacto del autor: lucaskim72@gmail.com
