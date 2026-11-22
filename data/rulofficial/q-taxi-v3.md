# RulOfficial/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo que implementa Q-Learning tabular sobre el entorno `Taxi-v3` de Gymnasium. Lo publica el usuario RulOfficial en Hugging Face y no es un modelo de lenguaje ni una red neuronal profunda: se trata de una tabla Q de 500 estados por 6 acciones almacenada como array NumPy (`q_table.npy`), entrenada con un bucle de Q-Learning clásico durante 8000 episodios. El repositorio incluye además el script de entrenamiento reproducible, los hiperparámetros y las evidencias gráficas del proceso.

Su relevancia es fundamentalmente didáctica y de verificación: sirve como referencia de una implementación correcta de Q-Learning tabular con exploración epsilon-greedy y como artefacto reproducible para asignaturas o cursos de refuerzo. El autor declara haber superado un umbral de certificación interna (puntuación `mean_reward - std_reward` de 5,13 frente al mínimo exigido de 4,5) con la semilla 42.

No debe confundirse con un modelo generativo: no procesa lenguaje, no tiene parámetros entrenables en el sentido habitual ni ventana de contexto. Su "entrada" es el estado discreto del entorno Taxi-v3 (500 estados posibles) y su "salida" es una de las 6 acciones discretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q de 500 estados x 6 acciones) |
| Parametros totales | 3000 valores Q (500 x 6), almacenados en `q_table.npy` |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno discreto de 500 estados) |
| Tipos de cuantizacion | no disponible (array NumPy de precisión nativa) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `.npy` (NumPy) |
| Entorno | Gymnasium `Taxi-v3` |
| Episodios de entrenamiento | 8000 |
| Episodios de evaluacion | 100 |
| Hiperparametros | alpha=0.7, gamma=0.99, epsilon inicial=1.0, epsilon minimo=0.01 |
| Semilla | 42 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular puro, sin aproximación funcional. La tabla Q tiene dimensiones 500 x 6, correspondientes a los 500 estados discretos de `Taxi-v3` y a las 6 acciones del entorno (moverse en cuatro direcciones, recoger pasajero y dejarlo). La actualización sigue la regla clásica de Bellman con tasa de aprendizaje alpha=0.7 y factor de descuento gamma=0.99.

El entrenamiento se ejecutó durante 8000 episodios con política epsilon-greedy, partiendo de epsilon=1.0 (exploración total) y decaimiento hasta un mínimo de 0.01. Se fijó la semilla 42 para garantizar reproducibilidad, y el script `train_q_learning.py` junto con `requirements.txt` permiten replicar el proceso. Durante el entrenamiento se visitaron 404 de los 500 estados, y durante la evaluación 227. No hay datos sobre la composición del dataset (no aplica: el entorno es sintético y determinista en su dinámica), ni sobre RLHF/DPO (no aplica a este paradigma).

## Capacidades

- Resolución del entorno `Taxi-v3` de Gymnasium mediante política greedy sobre la tabla Q aprendida.
- Recogida y entrega de pasajeros en las cuatro ubicaciones del entorno con navegación por la cuadrícula.
- Reproducibilidad completa del entrenamiento a partir del script y la semilla declarada.
- Inspección de la tabla Q como artefacto de análisis (valores por estado-acción).
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episódico del entorno.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo de razonamiento extendido, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio sirve como ejemplo completo y reproducible de Q-Learning tabular, con hiperparámetros documentados y evidencias de convergencia para usar en prácticas de asignatura.
- Verificación de implementaciones propias: comparar la tabla Q y las curvas de recompensa con las de este repositorio permite validar un bucle de Q-Learning casero sobre el mismo entorno y semilla.
- Referencia de umbral de rendimiento: la puntuación `mean_reward - std_reward` de 5,13 frente al umbral de 4,5 constituye una línea base concreta para evaluar variantes (distintos alpha, gamma o schedules de epsilon).
- Estudio de cobertura de estados: los datos de 404 estados visitados en entrenamiento y 227 en evaluación permiten analizar la exploración y detectar estados infravisitados en políticas epsilon-greedy.
- Punto de partida para extensiones: la tabla Q puede inicializarse desde `q_table.npy` y afinarse con más episodios o con variantes como SARSA o Double Q-Learning para comparar estabilidad.
- Demostración de pipelines de Hugging Face para RL: el uso de `model-index` y del pipeline `reinforcement-learning` sirve como plantilla para publicar agentes tabulares con métricas declaradas y evidencias adjuntas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por terceros):

| Metrica | Valor |
|---|---|
| Recompensa media (100 episodios de evaluacion) | 7,66 |
| Desviacion estandar de la recompensa | 2,53 |
| Puntuacion mean - std | 5,13 |
| Umbral requerido | 4,5 |
| Resultado | Umbral superado |
| Estados visitados en entrenamiento | 404 / 500 |
| Estados visitados en evaluacion | 227 / 500 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia consiste en indexar un array NumPy de 3000 valores, sin uso de GPU.
- GPU recomendadas: ninguna; el entrenamiento y la evaluación se ejecutan en CPU en segundos o pocos minutos.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB y la tabla Q pesa unos pocos kilobytes.
- Opciones de despliegue: ejecución directa con Python, NumPy y Gymnasium mediante `train_q_learning.py`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma medida, pero al tratarse de una búsqueda en tabla la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Paradigma | Parametros | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-Taxi-v3 (este) | Q-Learning tabular | 3000 valores Q | Taxi-v3 | no disponible | Hugging Face |
| Agente DQN sobre Taxi-v3 | Deep Q-Network | red neuronal (miles de parametros) | Taxi-v3 | variable segun implementacion | implementaciones de referencia en librerias de RL |
| Agente tabular SARSA sobre Taxi-v3 | SARSA tabular | 3000 valores Q | Taxi-v3 | variable | implementaciones de referencia en librerias de RL |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita al paradigma y al tamaño del artefacto.

## Limitaciones y advertencias

- Específico del entorno `Taxi-v3`: la tabla Q no es transferible a otros entornos ni a tareas de lenguaje.
- Sesgos: la política depende de la semilla 42 y del schedule de exploración empleado; otras semillas pueden producir tablas distintas y coberturas menores.
- Riesgo de generalización pobre: con 404 de 500 estados visitados en entrenamiento, 96 estados podrían tener valores Q poco fiables si no se visitaron o se visitaron muy pocas veces.
- Varianza alta: la desviación estándar de 2,53 sobre una media de 7,66 indica una recompensa episódica variable; el umbral se supera por margen estrecho (5,13 frente a 4,5).
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución sin consultar al autor.
- Métricas no verificadas: el campo `verified: false` en el `model-index` indica que los resultados no han sido validados por un tercero.
- Sin mantenimiento aparente: el repositorio tiene 0 descargas y 0 likes, y no hay garantía de soporte ni de actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RulOfficial/q-Taxi-v3
- Entorno Taxi-v3 de Gymnasium (documentación oficial): https://gymnasium.farama.org/environments/toy_text/taxi/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
