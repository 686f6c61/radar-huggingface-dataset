# afdzxx/q-learning-taxi-v3-uah

## Resumen

`afdzxx/q-learning-taxi-v3-uah` no es un modelo de lenguaje, sino una política de aprendizaje por refuerzo (Q-Learning tabular) entrenada para resolver el entorno **Taxi-v4** de Gymnasium. Lo publica el usuario de Hugging Face `afdzxx` y su interés es fundamentalmente docente: sirve como artefacto reproducible de un agente clásico de RL dentro del entorno Taxi, un problema de planificación con 500 estados discretos en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones.

El repositorio es un ejemplo de cómo se serializa un agente Q-Learning (tabla Q con política greedy sobre estados discretos) usando el formato estándar de Hugging Face para RL (`q-learning.pkl` cargable con `load_from_hub`). No hay pesos neuronales, ni tokenizador, ni ventana de contexto: el "modelo" es una tabla de valores Q para los 500 estados del entorno Taxi-v4, con 6 acciones posibles por estado.

Su relevancia es acotada: no compite con LLMs ni con agentes basados en transformers. Es útil como referencia educativa, como baseline de comparación para algoritmos de RL más avanzados (DQN, PPO) sobre Taxi, y como ejemplo de integración con el ecosistema `stable-baselines3` / `gymnasium` y el hub de Hugging Face. El resultado declarado por el autor es un `mean_reward` de 7.56 ± 2.71, un valor bajo respecto al óptimo del entorno (alrededor de 8-9 con políticas bien entrenadas y hasta 13 con `is_slippery=False` y entrenamiento prolongado), lo que sugiere un agente con convergencia parcial o evaluado en condiciones estocásticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre estados discretos) |
| Parametros totales | 500 estados × 6 acciones = 3000 valores Q (aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno discreto con 500 estados) |
| Tipos de cuantizacion | no aplica (tabla de floats serializada en pickle) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning clásico, un método de diferencias temporales off-policy que aprende una función de valor-acción Q(s, a) mediante actualizaciones de la forma Q(s,a) ← Q(s,a) + α[r + γ·max_a' Q(s',a') − Q(s,a)]. En Taxi-v4 el espacio de estados es discreto y finito (500 estados: 25 posiciones del taxi × 5 posiciones de pasajero × 4 destinos), y el espacio de acciones tiene 6 elementos (moverse en cuatro direcciones, recoger y dejar pasajero). La tabla Q resultante tiene por tanto 500 × 6 entradas, serializadas en el archivo `q-learning.pkl` junto con metadatos como `env_id`.

No se dispone de información sobre hiperparámetros (tasa de aprendizaje α, factor de descuento γ, política de exploración ε-greedy y su decaimiento), número de episodios de entrenamiento ni semillas utilizadas. Tampoco se documenta si el entrenamiento se realizó con `is_slippery=True` (por defecto en Taxi-v4, con transiciones estocásticas) o con `is_slippery=False`, lo cual es determinante para interpretar el `mean_reward` reportado. La model card solo indica que se trata de una "custom-implementation" y muestra el snippet de carga con `load_from_hub`, advirtiendo de la necesidad de comprobar atributos del entorno como `is_slippery`.

## Capacidades

- Resolución del entorno Taxi-v4 de Gymnasium: recoger y dejar pasajeros en las cuatro ubicaciones del mapa con recompensas por paso y penalizaciones por recogidas/entregas ilegales.
- Política greedy determinista sobre la tabla Q aprendida; dado un estado discreto devuelve la acción de mayor valor Q.
- Integración con el ecosistema Gymnasium mediante `gym.make(model["env_id"])` y con el hub de Hugging Face vía `load_from_hub`.
- Serialización en formato pickle compatible con el estándar de Hugging Face para agentes de RL.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, razonamiento simbólico general, visión, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo mínimo y reproducible de Q-Learning tabular en un curso introductorio, cargándolo con `load_from_hub` y evaluándolo sobre Taxi-v4 con `stable-baselines3` o Gymnasium.
- Baseline de comparación: servir como referencia de rendimiento (7.56 ± 2.71 de recompensa media) frente a algoritmos más avanzados como DQN, PPO o A2C sobre el mismo entorno, para medir la mejora obtenida.
- Depuración de entornos Gymnasium: verificar el correcto funcionamiento de wrappers, versiones de Gymnasium y del pipeline de evaluación usando una política ya entrenada que no requiere cómputo.
- Pruebas de integración del hub de Hugging Face: validar flujos de `load_from_hub`, versionado de artefactos y reproducción de experimentos en pipelines de CI para proyectos de RL.
- Reproducción de experimentos: comparar el efecto de `is_slippery=True` frente a `False` reutilizando este agente como punto de partida y reentrenando con la misma configuración.
- Demostraciones educativas interactivas: construir visualizaciones del recorrido del taxi en un notebook para explicar la diferencia entre política óptima, política aleatoria y política parcialmente convergida.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 ± 2.71 |

No se han publicado otros resultados de benchmarks en la información disponible. No se dispone de comparación con políticas óptimas ni con otros agentes sobre el mismo entorno en la información proporcionada.

## Requisitos de hardware

- VRAM: 0 GB. La inferencia consiste en una búsqueda en una tabla de 3000 entradas en memoria principal; no requiere GPU.
- CPU: cualquier procesador moderno es suficiente; la latencia por paso es de microsegundos.
- GPU recomendadas: no aplica. No se necesita GPU para cargar ni evaluar el agente.
- Cabe en cualquier consumer GPU, e incluso en dispositivos sin GPU (Raspberry Pi, entornos CI con CPU).
- Opciones de despliegue: Python con `gymnasium` y `huggingface_hub` (`load_from_hub`), o `stable-baselines3` si se integra en un pipeline de RL. Compatible con notebooks Jupyter y scripts de evaluación estándar.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza tabular, la consulta es O(1) y el cuello de botella será el propio entorno Taxi, no el agente.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| afdzxx/q-learning-taxi-v3-uah | Q-Learning tabular | Taxi-v4 | ~3000 valores Q | no aplica | 7.56 ± 2.71 (mean_reward) | no disponible |
| Agente DQN sobre Taxi-v4 | Deep Q-Network | Taxi-v4 | red pequeña (MLP) | no aplica | no disponible en la información | varía |
| Agente PPO sobre Taxi-v4 | PPO | Taxi-v4 | red pequeña (MLP) | no aplica | no disponible en la información | varía |

No se dispone de datos de rendimiento de alternativas en la información proporcionada; la comparación se limita a la categoría algorítmica y al entorno. Taxi-v4 es un entorno de referencia habitual en cursos de RL, por lo que existen múltiples implementaciones públicas de Q-Learning y DQN, pero sus métricas no están disponibles aquí.

## Limitaciones y advertencias

- El `mean_reward` de 7.56 ± 2.71 es bajo respecto al óptimo del entorno Taxi-v4 (en torno a 8-9 con `is_slippery=True` y hasta ~13 con `is_slippery=False`), lo que sugiere convergencia parcial o evaluación con alta varianza.
- No se documentan hiperparámetros, número de episodios, semillas ni si se entrenó con `is_slippery=True` o `False`; la reproducibilidad es limitada.
- La licencia no está disponible, por lo que no se puede garantizar el uso comercial ni la redistribución del artefacto.
- El agente solo es válido para Taxi-v4; no generaliza a otros entornos ni a variantes del problema.
- No procesa lenguaje natural, imágenes ni audio; no debe confundirse con un modelo fundacional.
- El formato de pesos es pickle, lo que implica riesgos de seguridad al cargar archivos de origen no verificado (ejecución arbitraria de código). Se recomienda cargar solo desde fuentes de confianza y en entornos aislados.
- El resultado de la model-index está marcado como `verified: false`; no ha sido validado de forma independiente.
- No se dispone de información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de las limitaciones propias de un entorno discreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/afdzxx/q-learning-taxi-v3-uah
- Entorno Taxi-v4 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `load_from_hub` (Hugging Face Hub para RL): https://huggingface.co/docs/hub/en/models-downloading
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
