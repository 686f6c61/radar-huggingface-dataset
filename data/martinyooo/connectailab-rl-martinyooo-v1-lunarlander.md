# Martinyooo/connectailab-rl-martinyooo-v1-lunarlander

## Resumen

`connectailab-rl-martinyooo-v1-lunarlander` no es un modelo de lenguaje, sino una política de aprendizaje por refuerzo profundo: una red DQN (Deep Q-Network) entrenada para resolver el entorno `LunarLander-v3` de Gymnasium, en el que un módulo debe posarse sobre una plataforma entre dos banderas controlando tres motores. Lo desarrolla Martinyooo, un desarrollador independiente surcoreano, en el marco del curso de aprendizaje por refuerzo de CONNECT AI LAB en colaboración con AI CITY BUILDERS.

El modelo resuelve un problema de control discreto de baja dimensionalidad: recibe una observación de 8 números reales (posición x e y, velocidad x e y, ángulo, velocidad angular y contacto de cada una de las dos patas) y emite una de 4 acciones discretas (no hacer nada, motor izquierdo, motor principal, motor derecho). La red es un perceptrón multicapa de tres capas (8 → 128 → 128 → 4) con activaciones ReLU, lo que da un total de 18.180 parámetros entrenables y un checkpoint de aproximadamente 71 KB en FP32.

Su relevancia es formativa y de referencia, no de producción a gran escala: sirve como línea base reproducible y como ejemplo canónico de DQN con replay buffer y red objetivo sobre un entorno de control continuo discretizado. El autor declara una recompensa media de 233,6 en 10 episodios no vistos, por encima del umbral de 200 que el propio autor fija como criterio de éxito, aunque la métrica está marcada como no verificada y no se acompaña de desviación típica ni de número de semillas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) fully-connected: 8 → 128 → 128 → 4, activación ReLU, agente DQN (Deep Q-Network) con red objetivo |
| Parámetros totales | 18.180 (calculado a partir de las dimensiones declaradas: 1.152 + 16.512 + 516) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada es una observación de 8 valores numéricos por paso |
| Tipos de cuantización | No disponible; se publica un único checkpoint en coma flotante de 32 bits (FP32) |
| Idiomas soportados | No aplica (no procesa texto); la model card está redactada en coreano e inglés |
| Licencia | No disponible (no se especifica en el repositorio) |
| Formato de pesos | `model.pt`, `state_dict` de PyTorch (`torch.save`) cargable con `torch.load` |
| Entorno | Gymnasium `LunarLander-v3` (espacio de observación continuo de 8 dimensiones, espacio de acciones discreto de 4) |
| Librería | PyTorch |
| Tamaño del repositorio | 0,0 GB (incluye `model.pt` y `replay.mp4`) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura es una MLP de tres capas completamente conectadas con dos capas ocultas de 128 unidades y ReLU entre ellas, que aproxima la función Q(s, a) para las 4 acciones discretas del entorno. El agente sigue el esquema DQN clásico: selección de acción epsilon-greedy, almacenamiento de transiciones en un buffer de repetición, muestreo de minilotes y actualización de una red objetivo con sincronización periódica para estabilizar el entrenamiento. La model card describe la configuración exacta: 200.000 pasos totales de entrenamiento, 128 unidades ocultas, tasa de aprendizaje 0,0005, factor de descuento gamma 0,99, fracción de exploración 0,3, actualización de la red objetivo cada 500 pasos y tamaño de lote 128.

No se documentan detalles adicionales sobre el dataset (el agente genera sus propias transiciones por interacción con el simulador), sobre el número de semillas ejecutadas, sobre el uso de Double DQN, dueling heads ni prioritized experience replay, ni sobre la versión concreta de Gymnasium, PyTorch o las librerías auxiliares utilizadas. Tampoco se especifica si hubo ajuste fino posterior al punto de corte del entrenamiento ni cómo se seleccionó el checkpoint final entre los 200.000 pasos. No hay ninguna innovación técnica declarada más allá del DQN estándar, y el repositorio incluye un vídeo `replay.mp4` con una partida del agente como única evidencia cualitativa adicional.

## Capacidades

- Control de aterrizaje en `LunarLander-v3`: produce una acción discreta por paso a partir de una observación de 8 valores.
- Generalización limitada a episodios no vistos con semilla distinta de las de entrenamiento: el autor reporta una media de 233,6 en 10 episodios nuevos.
- Inferencia autocontenida: el `state_dict` se reconstruye con una `nn.Sequential` de tres capas y se ejecuta sin dependencias de entorno, solo PyTorch.
- Ejecución en CPU: no requiere GPU ni frameworks de servicio de modelos.
- Exportabilidad a otros formatos de inferencia (TorchScript, ONNX) mediante herramientas estándar de PyTorch, aunque el autor no publica exportaciones.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento explícito: es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- Docencia y formación en aprendizaje por refuerzo: el modelo sirve como referencia funcional en un curso de RL, ya que el código de carga y la arquitectura caben en nueve líneas y permiten al alumnado inspeccionar pesos y comparar contra su propia implementación.
- Prueba de regresión de implementaciones DQN: al tener una recompensa media declarada de 233,6 sobre un entorno determinista en su dinámica, puede usarse como caso de prueba para detectar regresiones en librerías propias de RL o en cambios de versión de Gymnasium.
- Línea base para búsqueda de hiperparámetros: cualquier experimento que modifique la tasa de aprendizaje, el tamaño del buffer o la frecuencia de actualización de la red objetivo puede contrastarse contra esta configuración de referencia fijada en 200.000 pasos.
- Generación de datos de demostración para imitación: el agente puede ejecutarse en bucle para recolectar trayectorias etiquetadas (observación → acción) que alimenten un modelo de comportamiento o un algoritmo de imitation learning.
- Validación de infraestructura de simulación: al ser un agente pequeño y de inferencia instantánea, es útil para verificar que un pipeline de simulación, reproducción de episodios o sistema de telemetría funciona antes de escalar a entornos más costosos.
- Demostración de control en sistemas empotrados o de tiempo real: con 18.180 parámetros y unos 71 KB en FP32, la política cabe en microcontroladores y sirve como ejemplo de despliegue de una política neuronal en hardware con recursos mínimos, aunque el entorno de aterrizaje sea simulado.
- Estudio de transferencia a control físico: como aproximación de un problema de guiado y aterrizaje, el modelo puede citarse como punto de partida conceptual para políticas de aterrizaje de drones o vehículos, si bien requeriría reentrenamiento sobre el simulador físico correspondiente.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index`, marcados explícitamente como no verificados (`verified: false`).

| Tarea | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Aprendizaje por refuerzo | LunarLander-v3 | `mean_reward` en 10 episodios no vistos (≥ 200 = éxito según el autor) | 233,6 | No |

No se han publicado resultados de otros benchmarks en la información disponible. En particular, no hay desviación típica, número de semillas, ni curva de aprendizaje, por lo que no es posible evaluar la estabilidad del resultado.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el checkpoint ocupa aproximadamente 71 KB en FP32 y la red completa cabe holgadamente en memoria principal.
- GPU recomendadas: ninguna. Cualquier CPU x86 o ARM moderna ejecuta la política en tiempos despreciables; una A100, H100 o RTX 4090 estaría totalmente sobredimensionada para este modelo.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU con soporte CUDA si se desea, pero sin ninguna ventaja práctica frente a CPU.
- Opciones de despliegue: PyTorch nativo (recomendado, tal como documenta el autor), exportación a TorchScript u ONNX Runtime, o reimplementación en NumPy. vLLM, TGI, llama.cpp y Ollama no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Por la topología (18.180 parámetros, dos productos matriciales de 8×128 y 128×128), una pasada forward en CPU es del orden de microsegundos, pero esta estimación no está respaldada por cifras del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `connectailab-rl-martinyooo-v1-lunarlander` | DQN (MLP 8-128-128-4) | 18.180 | LunarLander-v3 | No disponible | HuggingFace, 0 descargas |
| CleanRL DQN (referencia de implementación) | DQN, MLP configurable | No disponible en esta ficha | LunarLander, Atari | MIT (según el proyecto CleanRL) | Repositorio de código, no un checkpoint publicado |
| Stable-Baselines3 DQN (referencia de librería) | DQN, MLP con arquitectura configurable | No disponible en esta ficha | LunarLander, otros Gymnasium | MIT (según el proyecto SB3) | Librería pip, sin pesos preentrenados para LunarLander |
| Agentes PPO para LunarLander | PPO, MLP | No disponible en esta ficha | LunarLander | Variable según implementación | Múltiples implementaciones y tutoriales |

No hay datos públicos de rendimiento de las alternativas incluidos en esta ficha, por lo que la comparación numérica directa no está disponible. La diferencia principal frente a CleanRL y Stable-Baselines3 es que este repositorio publica pesos concretos y una métrica declarada, mientras que las librerías citadas ofrecen implementaciones entrenables pero no checkpoints resueltos para `LunarLander-v3`.

## Limitaciones y advertencias

- Es un modelo de dominio muy restringido: solo funciona con observaciones de 8 dimensiones y el conjunto de 4 acciones de `LunarLander-v3`; cualquier otro entorno requiere reentrenamiento.
- El resultado de 233,6 está autodeclarado y marcado como no verificado, sin desviación típica, sin número de semillas y sin curva de aprendizaje; la varianza de DQN en LunarLander puede ser alta entre ejecuciones.
- La licencia no está especificada: no hay autorización explícita de uso comercial, modificación ni redistribución, lo que constituye un riesgo legal para integración en productos.
- No hay información sobre sesgos ni sobre riesgos de alucinación en el sentido habitual, pero sí existe el riesgo típico de sobreajuste al simulador y de comportamiento frágil ante perturbaciones no vistas durante el entrenamiento.
- Falta documentación de reproducibilidad: no se indican versiones de PyTorch ni de Gymnasium, ni semillas, ni el criterio de selección del checkpoint, por lo que replicar exactamente el 233,6 puede no ser posible.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- El código de ejemplo de la model card usa identificadores en coreano, lo que puede requerir adaptación para copiarse en entornos con codificación distinta.
- La model card está en coreano e inglés; no hay documentación en castellano.
- No debe interpretarse como una política validada para aterrizaje físico real: opera sobre un simulador 2D con dinámica simplificada y recompensas diseñadas manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Martinyooo/connectailab-rl-martinyooo-v1-lunarlander
- Checkpoint de pesos: https://huggingface.co/Martinyooo/connectailab-rl-martinyooo-v1-lunarlander/blob/main/model.pt
- Vídeo de demostración: https://huggingface.co/Martinyooo/connectailab-rl-martinyooo-v1-lunarlander/blob/main/replay.mp4
- CONNECT AI LAB (repositorio del programa): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
