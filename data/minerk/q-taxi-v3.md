# MinerK/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular sobre el entorno Taxi-v3 de Gymnasium (antiguo OpenAI Gym). Lo publica el usuario MinerK en Hugging Face como artefacto de un experimento de RL clásico, no como un modelo de lenguaje: no contiene pesos de red neuronal, sino una tabla Q serializada en formato pickle. Su relevancia es, por tanto, didáctica y de referencia para reproducir pipelines de RL con la librería `stable-baselines3` y el formato de model card de Hugging Face.

El entorno Taxi-v3 es un problema discreto de 500 estados y 6 acciones en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadrícula. El agente aprende una política que maximiza la recompensa acumulada; el autor declara una recompensa media de 7,52 ± 2,72 en la evaluación, un valor bajo respecto al óptimo teórico del entorno (en torno a 8-9 por episodio con política cuasi-óptima), lo que sugiere un entrenamiento correcto pero no completamente convergido.

No hay información sobre arquitectura neuronal, tamaño de parámetros, contexto, idiomas ni licencia. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones, lo que lo sitúa como un artefacto de práctica personal más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre 500 estados discretos x 6 acciones) |
| Parametros totales | no disponible (tabla Q, no red neuronal; tamaño exacto no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL discreto, sin contexto textual) |
| Tipos de cuantizacion | no aplica (pesos en pickle, no cuantizables) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El modelo implementa Q-Learning clásico, un método de diferencias temporales off-policy que actualiza una tabla Q(s, a) mediante la regla de Bellman con tasa de aprendizaje y factor de descuento. El entorno Taxi-v3 tiene un espacio de estados discreto de 500 elementos y un espacio de acciones de 6 (moverse norte, sur, este, oeste, recoger pasajero y dejar pasajero), por lo que la tabla Q resultante es de tamaño manejable y se serializa directamente a disco.

El autor no documenta hiperparámetros (tasa de aprendizaje, epsilon de exploración, número de episodios, política de decaimiento), composición de datos ni técnicas de refinamiento. La model card únicamente indica que se trata de un agente entrenado con Q-Learning y proporciona un fragmento de código para cargarlo con `load_from_hub` y reconstruir el entorno con `gym.make(model["env_id"])`. Tampoco se especifica si el entorno se ejecutó con `is_slippery=False` u otras variantes, aunque la propia model card advierte de que puede ser necesario añadir atributos adicionales al reconstruir el entorno.

## Capacidades

- Resolución del entorno Taxi-v3: el agente aprende una política para recoger y dejar pasajeros en una cuadrícula discreta de 5x5 con cuatro ubicaciones de recogida/entrega.
- Toma de decisiones secuencial en espacios de estados y acciones discretos.
- Aprendizaje por refuerzo off-policy mediante Q-Learning tabular.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del propio entorno de RL.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión, audio ni ninguna modalidad adicional.
- No es un modelo generativo: no produce texto ni código.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo mínimo y reproducible de un agente Q-Learning entrenado sobre un entorno de Gymnasium, útil en cursos introductorios de RL.
- Verificación de pipelines de `stable-baselines3` y del formato de model card de Hugging Face: permite comprobar que la carga con `load_from_hub` y la reconstrucción del entorno funcionan correctamente.
- Punto de partida para comparativas de algoritmos: puede usarse como baseline tabular frente a métodos de RL profundo (DQN, PPO) en Taxi-v3 para ilustrar diferencias de sample efficiency y estabilidad.
- Pruebas de integración de entornos Gymnasium en notebooks y scripts de evaluación: el agente se carga en pocas líneas y no requiere GPU.
- Experimentos de análisis de políticas: al ser una tabla Q explícita, permite inspeccionar los valores Q por estado y acción, útil para estudiar convergencia y exploración.
- Reproducción de resultados declarados: el valor de recompensa media 7,52 ± 2,72 puede replicarse con semillas controladas para contrastar la variabilidad del entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,52 ± 2,72 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia consiste en consultar una tabla Q en CPU.
- GPU recomendadas: ninguna; cualquier CPU es suficiente.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y Raspberry Pi.
- Despliegue: carga directa del pickle con `load_from_hub` y reconstrucción del entorno con `gym.make`; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del bucle de simulación del entorno, no del modelo.
- Almacenamiento: el repositorio ocupa 0,0 GB según Hugging Face (tamaño efectivo del pickle no declarado).

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinerK/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | 7,52 ± 2,72 | no disponible | Hugging Face |
| Alternativas de RL profundo (DQN, PPO) sobre Taxi-v3 | Red neuronal | Taxi-v3 | no disponible | variable | múltiples repositorios |
| Agentes Q-Learning de referencia en tutoriales de SB3 | Q-Learning tabular | Taxi-v3 | no disponible | variable | documentación de SB3 |

No se dispone de datos comparativos verificables en la información proporcionada; la comparativa anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en Taxi-v3; no generaliza a otros entornos ni tareas.
- La recompensa media declarada (7,52 ± 2,72) presenta una desviación alta y no está verificada; puede reflejar una política no óptima o evaluación con pocas semillas.
- No hay información sobre licencia, lo que impide determinar si su uso comercial está permitido.
- El formato pickle puede suponer un riesgo de seguridad al deserializar archivos de origen no confiable; conviene auditar el contenido antes de cargarlo.
- La carga requiere reconstruir el entorno con los mismos atributos (por ejemplo, `is_slippery`) usados en el entrenamiento; de lo contrario, el comportamiento puede degradarse.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, código, razonamiento ni tareas de NLP.
- No hay documentación de hiperparámetros ni de número de episodios, lo que dificulta la reproducibilidad exacta.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/MinerK/q-Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de stable-baselines3: https://stable-baselines3.readthedocs.io/
