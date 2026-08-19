# cjfrown/taxi-assignment

## Resumen

El modelo `cjfrown/taxi-assignment` es un agente de aprendizaje por refuerzo (reinforcement learning) basado en el algoritmo clásico Q-Learning, entrenado específicamente para resolver el entorno `Taxi-v3` de OpenAI Gym. Fue publicado por el usuario `cjfrown` en Hugging Face, aparentemente como parte de una tarea académica o asignación práctica, tal como sugiere el nombre del repositorio. El agente aprende una política de control que permite a un taxi recoger a un pasajero en una ubicación determinada y dejarlo en su destino dentro de un grid de 5x5, optimizando la recompensa acumulada.

El modelo se distribuye como un archivo pickle (`q-learning.pkl`) que contiene la tabla Q aprendida, junto con los metadatos del entorno. No se trata de un modelo de lenguaje ni de un transformer, sino de una implementación de Q-Learning tabular, un método de RL sin redes neuronales. Su relevancia es principalmente educativa: sirve como ejemplo de implementación de Q-Learning y como punto de partida para comparar con algoritmos más avanzados. No hay información pública sobre el tamaño de la tabla Q, los hiperparámetros de entrenamiento ni la licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (sin red neuronal) |
| Parametros totales | No disponible (tabla Q de dimensiones no especificadas; el entorno Taxi-v3 tiene 500 estados y 6 acciones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica (almacenado como pickle) |
| Idiomas soportados | No disponibles (no es un modelo de texto) |
| Licencia | No disponible |
| Formato de pesos | Pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El modelo emplea Q-Learning, un algoritmo de aprendizaje por refuerzo off-policy basado en la ecuación de Bellman. El agente mantiene una tabla Q que asigna un valor a cada par estado-acción. En el entorno `Taxi-v3`, el espacio de estados está definido por la posición del taxi (25 celdas), la ubicación del pasajero (4 posibles) y el destino (4 posibles), lo que da 500 estados discretos. El espacio de acciones incluye 6 acciones: mover el taxi en las cuatro direcciones, recoger al pasajero y dejarlo. El agente aprende actualizando la tabla Q tras cada paso utilizando la recompensa recibida y el valor máximo de la tabla en el siguiente estado.

No se proporcionan detalles sobre el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento ni la estrategia de exploración (por ejemplo, epsilon-greedy). La model card indica que el archivo contiene también el `env_id` (`Taxi-v3`) y sugiere que se debe comprobar si el entorno se creó con `is_slippery=False` u otros parámetros. No hay evidencia de técnicas avanzadas como redes profundas, DPO o RLHF.

## Capacidades

- Resolución del entorno `Taxi-v3`: el agente es capaz de generar una secuencia de acciones (movimientos, recogida y entrega) para completar un episodio con una recompensa media de 7,52 ± 2,74 según los datos declarados.
- Aprendizaje de política óptima o subóptima mediante Q-Learning tabular.
- Almacenamiento y carga sencilla del modelo entrenado mediante `load_from_hub` de Hugging Face.
- No tiene capacidades de generación de texto, razonamiento, código, visión, tool calling ni ninguna otra tarea fuera del entorno de RL específico.

## Casos de uso

- **Demostración educativa de Q-Learning**: el modelo sirve como ejemplo práctico para estudiantes de aprendizaje por refuerzo. Se puede cargar en un notebook y ejecutar episodios en `Taxi-v3` para visualizar cómo el agente aprende a navegar y completar la tarea.
- **Comparación de algoritmos de RL**: al ser un agente Q-Learning tabular, puede usarse como línea base para comparar con métodos más avanzados como DQN, SARSA o policy gradient en el mismo entorno.
- **Prueba de integración de Hugging Face RL**: el repositorio demuestra el flujo de publicación y carga de modelos de RL en Hugging Face, útil para desarrolladores que quieran aprender a compartir sus propios agentes.
- **Generación de datos para análisis**: el agente puede ejecutarse para recolectar trayectorias (estado, acción, recompensa) que sirvan para análisis estadístico o para entrenar otros modelos.
- **Evaluación de hiperparámetros**: dado que el código de entrenamiento no se incluye, el modelo puede servir para probar diferentes políticas de explotación (por ejemplo, greedy vs. epsilon) sobre la tabla Q almacenada.
- **Benchmark de entornos Gym**: el archivo `q-learning.pkl` puede utilizarse para validar que el entorno `Taxi-v3` se comporta según lo esperado en distintas versiones de Gymnasium.

## Benchmarks y rendimiento

El autor declara en la model card un único resultado para el entorno `Taxi-v3`:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.52 +/- 2.74 | No |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) porque el modelo no está diseñado para tareas de lenguaje o razonamiento general. La recompensa media indicada es baja en comparación con la recompensa máxima posible de 20 por episodio (si el taxi completa la tarea sin penalizaciones), lo que sugiere que el agente no ha convergido a una política óptima o que el entorno incluye estocasticidad. No hay comparación con otros agentes en el mismo entorno en la información disponible.

## Requisitos de hardware

- **VRAM**: No requiere GPU. La tabla Q para `Taxi-v3` tiene 500 estados × 6 acciones = 3000 valores, que ocupan menos de 1 MB en memoria.
- **CPU**: Cualquier CPU moderna puede ejecutar inferencia y entrenamiento en menos de un segundo.
- **GPU recomendada**: No aplica.
- **Despliegue**: El modelo se carga directamente en Python con `pickle` o mediante la utilidad `load_from_hub` de Hugging Face. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia**: Inferencia instantánea (microsegundos por paso) al ser una simple consulta a la tabla Q.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables publicados en Hugging Face para `Taxi-v3` con Q-Learning tabular. Existen numerosos repositorios con agentes para el mismo entorno (por ejemplo, `Anagha1/Taxi-assignment`), pero no se han encontrado datos de rendimiento o especificaciones que permitan una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Entorno específico**: El agente solo funciona en `Taxi-v3` con la misma configuración de observaciones y acciones. No generaliza a otros entornos ni a variaciones del grid (por ejemplo, cambios en el tamaño del mapa).
- **Rendimiento subóptimo**: La recompensa media declarada (7,52 ± 2,74) está muy por debajo del máximo teórico de 20, lo que indica que la política aprendida no es óptima. Puede cometer errores frecuentes como recoger al pasajero en el lugar equivocado o dar vueltas innecesarias.
- **Sesgos y alucinaciones**: No aplica, al no ser un modelo generativo de texto.
- **Licencia**: No se especifica ninguna licencia. El uso comercial queda en un limbo legal; se recomienda contactar al autor antes de cualquier uso productivo.
- **Formato de archivo**: El modelo se guarda en pickle, un formato que puede ejecutar código arbitrario al cargarlo. Solo debe cargarse desde fuentes fiables.
- **Falta de documentación**: No hay información sobre hiperparámetros, número de episodios, política de exploración ni versión exacta de Gym/Gymnasium utilizada. Esto dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cjfrown/taxi-assignment
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/ (referencia estándar, no incluida en la información proporcionada)
