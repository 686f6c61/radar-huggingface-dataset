# kvartal-13/taxi-v4

## Resumen

`kvartal-13/taxi-v4` es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno **Taxi-v3** de Gymnasium (el autor lo etiqueta internamente como "Taxi-v4", pero el dataset declarado en el model-index es Taxi-v3). No es un modelo de lenguaje ni una red neuronal profunda: es una tabla Q serializada en un fichero `q-learning.pkl` que se carga junto con los metadatos del entorno. Lo publica el usuario kvartal-13 en Hugging Face, con cero descargas y cero likes en el momento de la consulta, y sin licencia declarada.

El interés de esta ficha es acotado: sirve como ejemplo de artefacto de RL clásico empaquetado con el formato estándar de Hugging Face (tags `reinforcement-learning`, `model-index` con métricas, pipeline `reinforcement-learning`). No resuelve ningún problema de producción real; Taxi-v3 es un entorno de juguete con 500 estados discretos donde un agente tabular basta para converger. Su relevancia, por tanto, es pedagógica o de referencia, no comparativa frente a modelos generativos.

El resultado declarado es un `mean_reward` de **7,56 ± 2,71** sobre Taxi-v3, una cifra modesta que sugiere una política funcional pero lejos de la recompensa óptima típica del entorno (en torno a 8-9 con hiperparámetros bien ajustados). El repositorio ocupa 0,0 GB, coherente con una tabla Q pequeña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores Q estado-acción, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; tamaño dependiente del espacio de estados y acciones de Taxi-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (pesos discretos en `q-learning.pkl`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico: una tabla que mapea cada par (estado, acción) a un valor Q estimado, actualizada iterativamente con la regla de Bellman durante episodios de interacción con el entorno Taxi-v3. No hay red neuronal, ni atención, ni capas ocultas; el "modelo" es esencialmente un diccionario o array NumPy serializado. El pipeline de Hugging Face declarado es `reinforcement-learning`, y el autor etiqueta el artefacto como `custom-implementation`, lo que indica que no usó una librería estándar de RL empaquetada sino una implementación propia.

No se dispone de información sobre el número de episodios de entrenamiento, la política de exploración (epsilon-greedy u otra), la tasa de aprendizaje, el factor de descuento ni la configuración exacta del entorno (por ejemplo, si se usó `is_slippery=False`, que la propia model card sugiere comprobar). Tampoco se documenta si hubo entrenamiento con múltiples semillas ni cómo se calculó el intervalo de confianza del `mean_reward`. Todo ello impide reproducir el resultado a partir de la información publicada.

## Capacidades

- Resolución del entorno Taxi-v3 de Gymnasium: recoger pasajeros y dejarlos en su destino con la política aprendida.
- Toma de decisiones discreta sobre un espacio de acciones finito (6 acciones en Taxi-v3: mover en cuatro direcciones, recoger y dejar pasajero).
- Inferencia determinista a partir de la tabla Q (selección de la acción de mayor valor, presumiblemente).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de los LLM; su "razonamiento" es la política greedy sobre la tabla.
- No tiene capacidades multilingües.
- No tiene modo thinking, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el artefacto como ejemplo mínimo de agente Q-Learning empaquetado en Hugging Face para explicar el flujo `load_from_hub` + `gym.make`.
- Pruebas de integración de pipelines de RL: validar que un sistema de carga de modelos de Hugging Face maneja correctamente artefactos `.pkl` con metadatos de entorno.
- Baseline de referencia en Taxi-v3: comparar implementaciones propias de Q-Learning contra este agente con `mean_reward` 7,56 ± 2,71.
- Reproducción de experimentos educativos: cargar la tabla Q y analizar la política resultante estado por estado para estudiar convergencia.
- Generación de datos sintéticos de trayectorias: ejecutar el agente en el entorno para producir episodios de ejemplo en tutoriales o tests.
- Benchmarking de infraestructura de serving de RL: medir latencia de carga y de inferencia de un agente tabular como caso base trivial frente a políticas neuronales.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 +/- 2,71 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es una tabla Q en pickle de tamaño despreciable (repo de 0,0 GB).
- GPU recomendadas: ninguna; la inferencia es CPU-only y trivial.
- Cabe en cualquier consumer GPU y en cualquier CPU moderna, incluso en entornos embebidos.
- Despliegue: carga directa con `load_from_hub` de Hugging Face y `gym.make(model["env_id"])`; no requiere vLLM, llama.cpp, Ollama ni TGI, que no soportan este tipo de artefacto.
- Latencia y throughput: no disponibles; por la naturaleza tabular se espera latencia de microsegundos por paso, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kvartal-13/taxi-v4 | Q-Learning tabular | Taxi-v3 | mean_reward 7,56 ± 2,71 | no disponible | Hugging Face |
| Agentes Q-Learning de referencia en Taxi-v3 | Q-Learning tabular | Taxi-v3 | no disponible en esta consulta | variable | multiples repos y tutoriales |
| Políticas deep RL (DQN) para Taxi-v3 | Red neuronal | Taxi-v3 | no disponible en esta consulta | variable | implementaciones públicas |

No se dispone de datos comparativos verificados en la informacion proporcionada para establecer una comparación cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- El `mean_reward` de 7,56 ± 2,71 está marcado como no verificado y es inferior al rendimiento óptimo típico de Taxi-v3, lo que sugiere una política no del todo convergida.
- No hay licencia declarada: el uso comercial queda en un limbo legal y no se puede asumir permiso de reutilización.
- El artefacto es un `.pkl`, formato que ejecuta código al deserializarse; cargarlo de fuentes no confiables supone un riesgo de seguridad.
- La model card avisa de que pueden faltar atributos del entorno (`is_slippery=False`, etc.); cargar el entorno con una configuración distinta a la de entrenamiento invalida la política.
- No hay información sobre sesgos, pero al operar solo en un entorno de juguete no aplican sesgos sociales; sí aplica el riesgo de sobreajuste a la configuración exacta del entorno.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K, ni usarse para tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/kvartal-13/taxi-v4
- Entorno Taxi-v3 (Gymnasium): no disponible en la informacion proporcionada
- Paper de Q-Learning original (Watkins y Dayan, 1992): no disponible en la informacion proporcionada
- Repositorio o demo del autor: no disponible en la informacion proporcionada
