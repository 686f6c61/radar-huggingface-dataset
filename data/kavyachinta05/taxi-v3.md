# KavyaChinta05/Taxi-v3

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (RL) entrenado mediante Q-Learning tabular para resolver el entorno Taxi-v3, un clásico problema de control en OpenAI Gym/Gymnasium. Lo desarrolló KavyaChinta05 como parte de la unidad 2 del curso de Deep Reinforcement Learning de Hugging Face. En lugar de una red neuronal o un modelo de lenguaje, el agente almacena una tabla Q que mapea combinaciones de estado-acción a valores esperados, lo que le permite decidir el siguiente movimiento en el entorno sin necesidad de GPU.

La relevancia del modelo es didáctica y metodológica: sirve como ejemplo de referencia de un algoritmo de RL tabular y como punto de partida para entender el entrenamiento y la evaluación de agentes en espacios discretos. No es un modelo de lenguaje ni una arquitectura de deep learning; su tamaño y contexto no son aplicables en el sentido tradicional. La Q-table está guardada en el fichero `q-learning.pkl` y se puede cargar desde el repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (sin red neuronal) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | q-learning.pkl (tabla Q en pickle) |

## Arquitectura y entrenamiento

El modelo no utiliza una arquitectura neuronal. Se trata de un agente de RL tabular que aplica Q-Learning: aprende una función de valor Q(s,a) para cada par estado-acción del entorno Taxi-v3. El entrenamiento se realizó durante 50.000 episodios con una tasa de aprendizaje de 0.8, un factor de descuento gamma de 0.95 y una política epsilon-greedy con epsilon inicial de 1.0, mínimo de 0.05 y un decaimiento de 0.0001. No se utilizaron datos externos ni técnicas como RLHF o DPO; la única fuente de señal es la recompensa del propio entorno. No presenta innovaciones técnicas: se basa en el algoritmo Q-Learning clásico.

## Capacidades

- Política de decisión para el Taxi-v3: el agente aprende a recoger a un pasajero en una ubicación y dejarlo en el destino correcto, minimizando el número de pasos y acciones ilegales.
- No es un modelo de lenguaje: no genera texto, no traduce, no responde preguntas y no soporta tool calling ni uso de funciones.
- No es un modelo multimodal: no procesa imágenes ni audio.
- Almacenamiento en formato pickle: se puede cargar con Python y usar directamente con el entorno Taxi-v3.
- Requiere el entorno de Gymnasium/OpenAI Gym para su ejecución.

## Casos de uso

1. **Material docente para cursos de RL**: el modelo es un ejemplo práctico de cómo implementar Q-Learning tabular. Los instructores pueden cargar la Q-table, ejecutar el agente en Taxi-v3 y mostrar cómo la política aprendida mejora con el entrenamiento.

2. **Baseline para comparar algoritmos**: investigadores que trabajan en RL tabular pueden comparar sus métodos (SARSA, Expected SARSA, etc.) contra esta Q-table. Permite validar convergencia y política óptima en el mismo entorno.

3. **Demostraciones interactivas en notebooks**: se puede visualizar el comportamiento del agente paso a paso, observando cómo la tabla Q se actualiza en tiempo real si se re-entrena, o simplemente evaluar la política ya entrenada.

4. **Pruebas de integración con el Hub de Hugging Face**: sirve para verificar el funcionamiento de `huggingface_hub.load_from_hub` con modelos de RL, ya que el modelo se distribuye como un fichero pickle en un repositorio de Hugging Face.

5. **Investigación sobre exploración y explotación**: los estudiantes pueden modificar los parámetros de epsilon-greedy y estudiar cómo afectan a la recompensa media. El modelo proporciona un punto de partida para experimentos reproducibles.

6. **Prototipos de control en espacios discretos**: aunque no es apto para producción, el modelo demuestra cómo se puede resolver un problema de control discreto con una tabla Q, sirviendo como referencia para entornos con estados y acciones finitas.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 |

El autor declara en la model card que la evaluación se realizó sobre 100 episodios, con una puntuación de certificación de 4.85 y una puntuación requerida de 4.50. Estos datos no están verificados por Hugging Face (verified: false).

## Requisitos de hardware

- VRAM estimada: 0 GB; no requiere GPU.
- El modelo se ejecuta en cualquier CPU, incluso en entornos de muy bajos recursos.
- Despliegue: se carga mediante `pickle.load(open('q-learning.pkl', 'rb'))` o con `huggingface_hub.load_from_hub(repo_id='KavyaChinta05/Taxi-v3', filename='q-learning.pkl')`.
- No es compatible con vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje.
- Latencia: cada decisión es una consulta a una tabla, por lo que el tiempo de respuesta es del orden de microsegundos.

## Comparativa con modelos similares

| Modelo | Autor/repo | Rendimiento (mean reward) | Licencia |
|---|---|---|---|
| Q-Learning Agent (este modelo) | KavyaChinta05/Taxi-v3 | 7.56 +/- 2.71 | No disponible |
| Q-Learning Agent | huggingcats/Taxi-v3 | No disponible | No disponible |
| Q-Learning Agent | tizayi/taxi-v3 | No disponible | No disponible |

No se dispone de información sobre el rendimiento ni la licencia de los modelos comparables, por lo que no es posible realizar una comparación más detallada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede procesar texto ni generar respuestas. Su uso está restringido al entorno Taxi-v3.
- Licencia no especificada: al no indicar licencia en la model card, el uso comercial o redistribución requiere verificación con el autor.
- Rendimiento no verificado: la métrica de recompensa media está marcada como "verified: false", lo que significa que no ha sido validada externamente por Hugging Face.
- Variabilidad de resultados: la desviación estándar de 2.71 indica que el comportamiento del agente puede variar significativamente entre episodios.
- Dependencia de formato pickle: el modelo se entrega como un fichero .pkl, lo que puede generar incompatibilidades entre versiones de Python o con otros entornos.
- Sin soporte para agentes modernos: no tiene capacidad de tool calling, ni razonamiento multi-paso, ni memoria conversacional.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/KavyaChinta05/Taxi-v3
- Repositorio similar: https://huggingface.co/huggingcats/Taxi-v3
- Repositorio similar: https://huggingface.co/tizayi/taxi-v3
