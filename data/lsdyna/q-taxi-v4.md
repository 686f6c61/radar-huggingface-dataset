# lsdyna/q-Taxi-v4

## Resumen

El modelo `lsdyna/q-Taxi-v4` es un agente de aprendizaje por refuerzo (reinforcement learning) basado en Q-Learning tabular, entrenado específicamente para resolver el entorno `Taxi-v4` de Gymnasium. El autor, `lsdyna`, publica este repositorio como una implementación personalizada y minimalista: incluye la tabla Q aprendida, los hiperparámetros de entrenamiento, un vídeo de replay y el código fuente de entrenamiento y evaluación. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un agente clásico de RL con una tabla de valores Q explícita.

El problema que resuelve es el clásico de Taxi: un taxi debe recoger a un pasajero en una ubicación y dejarlo en su destino, minimizando el número de pasos y evitando acciones ilegales. La relevancia actual es principalmente didáctica y de referencia: sirve como ejemplo reproducible de Q-Learning tabular en un entorno discreto, y como punto de partida para comparar con algoritmos más modernos (DQN, SARSA, etc.). El repositorio tiene un tamaño de 0.0 GB, lo que indica que solo contiene archivos pequeños (tabla Q, JSON, MP4 y código).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q discreta) |
| Parametros totales | no disponible (tabla Q de dimensiones dependientes del espacio de estados y acciones de Taxi-v4) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (entorno de RL, no procesamiento de secuencias) |
| Tipos de cuantizacion | no aplicable (no es un modelo de pesos neuronales) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | pickle (archivo `q-learning.pkl` con la tabla Q y hiperparámetros) |

## Arquitectura y entrenamiento

El agente utiliza Q-Learning tabular, un algoritmo de aprendizaje por refuerzo sin red neuronal. La política se representa mediante una tabla Q donde cada entrada corresponde a un par estado-acción del entorno `Taxi-v4`. El espacio de estados de Taxi-v4 es discreto y finito (típicamente 500 estados: 5 posiciones de taxi, 5 destinos, 4 ubicaciones de pasajero y 5 estados de combustible en algunas variantes), y el espacio de acciones incluye 6 acciones (4 movimientos, recoger y dejar). El entrenamiento se realiza mediante actualizaciones iterativas de la ecuación de Bellman, explorando con una política epsilon-greedy.

No se especifican en la model card los hiperparámetros exactos (tasa de aprendizaje, factor de descuento, epsilon, número de episodios), aunque el archivo `q-learning.pkl` los contiene junto con la tabla Q. El código fuente `train_taxi.py` permite reproducir el entrenamiento y la evaluación. No se menciona el uso de técnicas avanzadas como redes neuronales, DPO o RLHF, ya que no son aplicables a este tipo de agente.

## Capacidades

- Resolver el entorno `Taxi-v4` de Gymnasium mediante una política greedy derivada de la tabla Q aprendida.
- Evaluación reproducible: el repositorio incluye `results.json` con métricas de 100 episodios de evaluación.
- Generación de un vídeo de replay (`replay.mp4`) que muestra la política greedy en acción.
- Carga sencilla del modelo en Python mediante `pickle` y `huggingface_hub`, permitiendo inspeccionar la tabla Q y los hiperparámetros.
- No dispone de capacidades de lenguaje natural, generación de texto, visión, tool calling, ni razonamiento multi-paso fuera del entorno de Taxi.

## Casos de uso

- Material didáctico para cursos de aprendizaje por refuerzo: el agente sirve como ejemplo completo y ejecutable de Q-Learning tabular, permitiendo a estudiantes analizar la tabla Q, el código de entrenamiento y los resultados de evaluación.
- Base para experimentos de comparación de algoritmos: se puede utilizar como referencia de rendimiento (mean reward 7.56) para contrastar con SARSA, DQN u otros métodos en el mismo entorno.
- Reproducción de resultados académicos: investigadores pueden verificar la implementación y los resultados declarados, ya que el código fuente está disponible.
- Demostración de integración con Hugging Face Hub: muestra cómo publicar y cargar artefactos de RL (tablas Q, métricas) en un repositorio estándar.
- Punto de partida para extensiones: se puede modificar el entorno (por ejemplo, cambiar el mapa o añadir obstáculos) y reentrenar el agente con el mismo código.
- Análisis de políticas aprendidas: inspeccionar la tabla Q para entender qué acciones prefiere el agente en cada estado, útil para depurar o visualizar el comportamiento.

## Benchmarks y rendimiento

El autor declara en la model card los siguientes resultados de evaluación, no verificados de forma independiente:

| Episodios | Recompensa media | Desviación estándar |
|---:|---:|---:|
| 100 | 7.5600 | 2.7067 |

No se han publicado comparaciones con otros agentes en el mismo entorno dentro de la información disponible. La recompensa media de 7.56 en Taxi-v4 es relativamente baja en comparación con soluciones óptimas (que suelen alcanzar recompensas positivas cercanas a 8-9 en promedio con políticas entrenadas durante más episodios), lo que sugiere un entrenamiento limitado o una configuración de hiperparámetros subóptima. No obstante, al no disponer de más detalles, estos datos deben interpretarse con cautela.

## Requisitos de hardware

- Al ser una tabla Q discreta, el modelo no requiere GPU ni VRAM. Cabe en cualquier CPU, incluso en sistemas embebidos o Raspberry Pi.
- El archivo `q-learning.pkl` tiene un tamaño mínimo (del orden de kilobytes), por lo que la carga en memoria es instantánea.
- La inferencia consiste en una consulta a la tabla Q (índice por estado y acción), con latencia del orden de microsegundos.
- No se requieren frameworks de inferencia como vLLM, llama.cpp u Ollama; basta con Python y las librerías estándar (`pickle`, `numpy` si se usa).
- El entrenamiento, si se desea reproducir, también es ligero: el entorno Taxi-v4 es computacionalmente barato y puede ejecutarse en CPU en pocos minutos.

## Comparativa con modelos similares

Existen otros repositorios en Hugging Face y GitHub con el mismo propósito (agente Q-Learning para Taxi-v4). A continuación se comparan los disponibles en la búsqueda web:

| Repositorio | Autor | Contenido | Recompensa media declarada | Licencia |
|---|---|---|---|---|
| `lsdyna/q-Taxi-v4` | lsdyna | Q-table, código, vídeo, métricas | 7.5600 ± 2.7067 | no disponible |
| `DitDahDitDit/q-Taxi-v4` | DitDahDitDit | no disponible (página sin detalles) | no disponible | no disponible |
| `afeng05/q-Taxi-v4` | afeng05 | Q-table, código, vídeo, métricas (similar) | no disponible | no disponible |
| `lucassvalentim/taxi-v4-qlearning` (GitHub) | lucassvalentim | Proyecto académico con entrenamiento, evaluación, visualización y análisis | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento entre estas implementaciones. Todas parecen seguir el mismo enfoque de Q-Learning tabular, por lo que las diferencias radican en la calidad del entrenamiento y la documentación.

## Limitaciones y advertencias

- El agente está especializado exclusivamente en el entorno `Taxi-v4`; no es generalizable a otros entornos ni tareas.
- No posee capacidades de procesamiento de lenguaje natural, visión ni razonamiento simbólico; es un autómata de decisión basado en tabla.
- La recompensa media declarada (7.56) no está verificada de forma independiente y podría no reflejar el rendimiento óptimo del entorno.
- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido; se recomienda contactar al autor antes de cualquier uso en producción.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que no incluye pesos de redes neuronales ni datasets; solo artefactos pequeños.
- No se proporcionan detalles sobre el proceso de entrenamiento (número de episodios, hiperparámetros), lo que dificulta la reproducibilidad exacta.
- La fecha de creación (2026-08-31) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o una publicación programada; no afecta al contenido técnico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lsdyna/q-Taxi-v4
- Repositorio similar de DitDahDitDit: https://huggingface.co/DitDahDitDit/q-Taxi-v4
- Repositorio similar de afeng05: https://huggingface.co/afeng05/q-Taxi-v4
- Proyecto académico en GitHub (lucassvalentim): https://github.com/lucassvalentim/taxi-v4-qlearning
- Artículo sobre TaxiTuner v4 (no relacionado directamente, pero aparece en la búsqueda): https://www.sayintentions.ai/blog/sayintentionsai-dynamic-tooltips-added-taxituner-v4-released
- Manual de Taxi Tuner v4 (contexto ajeno al modelo): https://kb.sayintentions.ai/article/taxi-tuner-v4-full-manual
