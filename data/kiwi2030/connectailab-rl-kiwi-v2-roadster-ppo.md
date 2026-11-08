# kiwi2030/connectailab-rl-kiwi-v2-roadster-ppo

## Resumen

`connectailab-rl-kiwi-v2-roadster-ppo` es un modelo de aprendizaje por refuerzo (reinforcement learning) para control continuo, publicado por el usuario kiwi2030 en Hugging Face. No es un modelo de lenguaje: se trata de una política neuronal entrenada con PPO (Proximal Policy Optimization) para controlar la propulsión y la rotación de un vehículo tipo roadster en un entorno de simulación denominado "roadster" dentro del ecosistema Connect AI Lab. El modelo se distribuye como un `state_dict` de PyTorch (`model.pt`) que define una red de política de 7 entradas y 2 salidas continuas.

El contexto del proyecto es experimental y educativo. El autor documenta una serie de experimentos de RL (decisión con Qwen, aterrizaje lunar con DQN, selección de rutas con PPO) y este roadster PPO es la versión v2 de una línea que incluye v1 y v3. La model card reporta métricas de evaluación concretas sobre 200 episodios con semillas fijas, y los resultados de la v2 son notablemente peores que los de las versiones vecinas: una tasa de aterrizaje del 0,0 % frente al 97,5 % de la v1 y el 88,5 % de la v3.

Por tanto, su relevancia no reside en el rendimiento (que es deficiente en la evaluación publicada) sino como artefacto reproducible de un experimento de RL con hiperparámetros documentados (pasos de entrenamiento, tasa de aprendizaje, bonus de exploración, semilla) y como ejemplo de política de control continuo de muy pequeño tamaño. No hay información sobre arquitectura de transformer, parámetros de lenguaje, contexto ni idiomas, ya que no aplica a este tipo de modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política neuronal para control continuo (entrada 7, salida 2, `continuous=True`); detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`model.pt`) |
| Algoritmo de entrenamiento | PPO (Proximal Policy Optimization) |
| Pasos de entrenamiento | 1.200.000 (1.200.128 pasos reales de recolección) |
| Tasa de aprendizaje | 0,0006 |
| Bonus de exploración | 0,2 |
| Semilla de entrenamiento | 0 |
| Entorno | Simulador "roadster" (definido en `로드스터_시뮬레이터.py`) |
| Librería | PyTorch |
| Tamaño del repositorio | 0,0 GB (pesos de muy pequeño tamaño) |

## Arquitectura y entrenamiento

La política es una red neuronal de pequeñas dimensiones cuya definición exacta (número de capas, unidades ocultas, funciones de activación) se encuentra en el archivo `model.py` del repositorio y no se detalla en la model card. La entrada tiene 7 dimensiones y la salida 2 dimensiones continuas, correspondientes al control de la intensidad de propulsión y de la rotación del roadster. El entrenamiento se realizó con PPO durante 1.200.000 pasos (1.200.128 pasos reales de recolección de experiencia), con tasa de aprendizaje 0,0006, bonus de exploración 0,2 y semilla 0.

La evaluación se llevó a cabo en 200 episodios separados con semillas de 1000000 a 1000199, usando la media de la acción (política determinista en evaluación). El resultado reportado es una tasa de aterrizaje del 0,0 %. La model card compara este resultado con las versiones v1 (1.000.000 pasos, lr 0,0005, bonus 0,0, 97,5 % de aterrizaje) y v3 (1.500.000 pasos, lr 0,0004, bonus 0,0, 88,5 %), lo que sugiere que el bonus de exploración de 0,2 y la tasa de aprendizaje más alta de la v2 degradaron la política en esta semilla. El autor advierte explícitamente que se trata de un único experimento con semilla 0. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Control continuo de un vehículo simulado: genera acciones de propulsión y rotación a partir de un vector de estado de 7 dimensiones.
- Aprendizaje por refuerzo con PPO: política entrenada para maximizar recompensa en el entorno roadster.
- Evaluación reproducible: métricas reportadas sobre 200 episodios con semillas fijas y política determinista (media de la acción).
- Inferencia ligera: el `state_dict` es de tamaño despreciable y puede ejecutarse en CPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente basado en lenguaje.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".
- No es un modelo generativo de texto.

## Casos de uso

- Reproducción de experimentos de RL: cargar `model.pt` con la definición de `model.py` y el simulador de `로드스터_시뮬레이터.py` para replicar el entrenamiento y la evaluación con semilla 0, útil para estudiar el efecto del bonus de exploración y la tasa de aprendizaje en PPO.
- Estudio de sensibilidad a hiperparámetros: comparar esta v2 (bonus 0,2, lr 0,0006) con las v1 y v3 del mismo autor para analizar cómo un bonus de exploración alto puede colapsar la política en control continuo.
- Docencia de PPO en control continuo: ejemplo mínimo de política (7 entradas, 2 salidas) para explicar la recolección de experiencia, el recorte de la ratio de probabilidad y la evaluación determinista.
- Baseline negativo en experimentos de RL: usar la tasa de aterrizaje del 0,0 % como referencia inferior frente a la que medir mejoras en variantes del entorno roadster.
- Pruebas de infraestructura de simulación: validar pipelines de carga de pesos PyTorch, gestión de semillas y ejecución de episodios de evaluación en un entorno ligero que no requiere GPU.
- Análisis de robustez de políticas: al ser una política fallida documentada, sirve para estudiar modos de fallo (por ejemplo, saturación de acciones o deriva) frente a políticas que sí aterrizan.

## Benchmarks y rendimiento

| Versión | Pasos de entrenamiento | Tasa de aprendizaje | Bonus de exploración | Tasa de aterrizaje (200 episodios, semillas 1000000–1000199) |
|---|---:|---:|---:|---:|
| v1 | 1.000.000 | 0,0005 | 0,0 | 97,5 % |
| v2 (este modelo) | 1.200.000 | 0,0006 | 0,2 | 0,0 % |
| v3 | 1.500.000 | 0,0004 | 0,0 | 88,5 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. Las cifras anteriores corresponden exclusivamente a la evaluación del entorno roadster descrita en la model card y proceden de una única semilla de entrenamiento (semilla 0).

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el `state_dict` de una red de 7 entradas y 2 salidas ocupa del orden de kilobytes, por lo que la inferencia cabe en CPU sin GPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU (incluso integrada) es suficiente si se desea acelerar la simulación.
- Cabe en cualquier GPU de consumo y también en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo cargando `model.pt` con la clase definida en `model.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del simulador y del hardware, no de la red, que es de coste despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Pasos | Tasa de aterrizaje | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| connectailab-rl-kiwi-v2-roadster-ppo | PPO, control continuo | Roadster | 1.200.000 | 0,0 % | no disponible | Hugging Face |
| connectailab-rl-kiwi-v1-link01 | PPO, decisión | LINK-01 | no disponible | no disponible | no disponible | Hugging Face |
| connectailab-rl-kiwi-v3-lunarlander | DQN, control | LunarLander | no disponible | no disponible | no disponible | Hugging Face |
| connectailab-rl-kiwi-v2-teacher | PPO, política docente | Entorno de decisión empresarial | no disponible | no disponible | no disponible | Hugging Face |

La comparación más directa es con las versiones v1 y v3 del mismo entorno roadster, cuyas tasas de aterrizaje (97,5 % y 88,5 %) se recogen en la tabla de benchmarks. No se dispone de datos de licencia ni de parámetros para ninguna de las alternativas listadas.

## Limitaciones y advertencias

- Rendimiento deficiente en la evaluación publicada: 0,0 % de tasa de aterrizaje en 200 episodios, frente a versiones anteriores del mismo autor.
- Resultado basado en una única semilla de entrenamiento (semilla 0); no hay evidencia de robustez estadística.
- La política se evalúa con la media de la acción; el comportamiento estocástico no está documentado.
- Sesgos conocidos: no disponibles; al ser un modelo de control en simulación, los sesgos relevantes serían los del propio simulador.
- Riesgo de alucinación: no aplica (no genera texto).
- Limitaciones de contexto o idioma: no aplican.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Es un artefacto experimental y educativo (Connect AI Lab, curso de RL), no una política validada para sistemas reales.
- Requiere los archivos `model.py`, `로드스터_시뮬레이터.py` y `requirements.txt` del repositorio para cargar y ejecutar el modelo; el repositorio figura con tamaño 0,0 GB, por lo que los pesos son mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-roadster-ppo
- Perfil del autor: https://huggingface.co/kiwi2030
- Modelo Connect Tycoon kiwi v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Modelo teacher v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2-teacher
- Modelo LunarLander kiwi v3: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Modelo LINK-01 kiwi v1: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Modelo dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
- Guía de viajes MEETORY: https://meetory.kr
- Canal de YouTube del autor: https://www.youtube.com/@kiwi_overai
