# IntelligentDecisionLab/xlerobot-coffee-model-sim-a-vision-pos

## Resumen

El repositorio `IntelligentDecisionLab/xlerobot-coffee-model-sim-a-vision-pos` contiene un conjunto de políticas robóticas entrenadas con ACT (Action Chunking with Transformers) para el robot XLeRobot de 17 grados de libertad (DoF), dentro del proyecto "Coffee Automata" del AS-CITI Intelligent Decision Lab. Se trata de la variante "Método A" (visión + posición) entrenada exclusivamente con datos de simulación, y forma parte de una cuadrícula de modelos que comparan dominio (simulación vs real), método (A vs B), dimensión de acción (17-D vs 6-D) y número de cámaras (1 vs 2).

Cada carpeta del repositorio es un modelo preentrenado completo para una tarea concreta (colocar taza, pulsar botón, transferir taza a bandeja, etc.), con dos versiones de espacio de acción: `*_17dof` que predice los 17 grados de libertad completos, y `*_6dof` que predice solo el brazo que actúa. El modelo se distribuye bajo licencia Apache 2.0, usa la librería LeRobot y ocupa 12,4 GB. No se proporcionan datos de parámetros totales, contexto ni idiomas, ya que es un modelo de robótica no lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vanilla ACT (Action Chunking with Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (via LeRobot `pretrained_model`) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura ACT (Action Chunking with Transformers), una política de transformadores que predice secuencias de acciones (chunks) a partir de observaciones de estado y visión. En este repositorio hay dos variantes:

- **17-DoF**: observación `state[17]` compuesta por 12 posiciones de articulaciones de ambos brazos, 2 posiciones de cabeza y velocidad lineal x/y/theta de la base. Predice `action[17]` (mismas dimensiones, con velocidades para la base).
- **6-DoF**: observación `state[6]` y `action[6]` limitadas al brazo que ejecuta la tarea (derecho para `t2_push_button`, izquierdo para el resto). Esta variante sirve para evaluar si la pérdida media de ACT sobre 17 dimensiones diluye la señal en los ejes relevantes.

El entrenamiento se realizó con 100k pasos, `chunk_size` 100, `n_action_steps` 100, batch 8 y semilla 1000, idéntico para todos los modelos del repositorio. Los datos provienen de grabaciones de simulación a 20 fps con una única cámara (head). Se aplicó una normalización con suelo (`floor`) de 1e-2 para estado/acción y 1e-5 para HPI, según la regla `xlerobot_norm_floor` documentada en el postmortem del proyecto. No se utilizó RLHF ni DPO; es aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de un manipulador móvil dual de 17 DoF (XLeRobot).
- Ejecución de tareas de manipulación específicas: colocar una taza, pulsar un botón, transferir una taza a una bandeja y mover la bandeja a una mesa.
- Predicción de secuencias de acciones (chunking) de hasta 100 pasos de acción.
- Percepción visual mediante cámara RGB en la cabeza del robot.
- Dos espacios de acción: completo (17-DoF) o solo el brazo actuante (6-DoF).
- Compatible con LeRobot estándar para carga y despliegue.
- Sin capacidades lingüísticas ni de razonamiento simbólico; es exclusivamente un controlador motor.

## Casos de uso

- **Automatización de máquinas de café en entornos simulados**: el modelo puede ejecutar la cadena completa de preparación de café (colocar taza, pulsar botón, transferir taza, mover bandeja) en un simulador, sirviendo como banco de pruebas para algoritmos de manipulación.
- **Investigación en aprendizaje por imitación**: los checkpoints con barrido de pasos permiten estudiar el efecto del sobreajuste (100k pasos sobre ~50 episodios) y seleccionar el mejor punto de parada para una tarea dada.
- **Comparación de espacios de acción**: los pares 17-DoF vs 6-DoF permiten analizar cómo afecta la dimensionalidad de la acción a la precisión en tareas de manipulación, útil para diseñar políticas más eficientes.
- **Desarrollo de estrategias de sim-to-real**: al estar entrenado en simulación, sirve como punto de partida para transferir políticas al robot real, especialmente comparándolo con los modelos del repositorio `…-real-…` del mismo proyecto.
- **Evaluación de políticas en bucle cerrado**: los modelos pueden integrarse en entornos de simulación para medir el error de predicción de acción y el éxito de tarea, aunque aún no se han publicado métricas de éxito en robot real.
- **Educación y prototipado**: como ejemplo de aplicación de ACT con LeRobot sobre una plataforma de bajo coste (XLeRobot), es útil para cursos de robótica y aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este es un modelo de control robótico, no un modelo de lenguaje. Sin embargo, la model card incluye una comparación interna entre las variantes 17-DoF y 6-DoF basada en el error de predicción de acción sobre los 6 articulaciones del brazo actuante, evaluada en 22 pares (12 de simulación con 1 cámara, 10 de real con 2 cámaras). Los resultados son:

| Set | n | Δ medio (17-DoF vs 6-DoF) | IC 95% |
|---|---|---|---|
| Sim, 1 cámara | 12 | +4,2% | [−5,1%, +13,5%] |
| Real, 2 cámaras | 10 | +9,4% | [−5,2%, +23,9%] |
| Combinado | 22 | +6,5% | [−1,7%, +14,7%] |

Un valor positivo indica menor error para el modelo 17-DoF. Todos los intervalos contienen el cero y el 6-DoF gana en 11 de 22 pares, por lo que ambos son estadísticamente indistinguibles en precisión. No se reportan métricas de éxito de tarea en robot real.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron GPUs RTX PRO 6000 Blackwell (para modelos de 1 cámara) y RTX 5090 (para modelos de 2 cámaras). No se especifica la VRAM consumida.
- **Inferencia**: no se proporcionan requisitos oficiales. Dado que ACT es un modelo transformer relativamente pequeño (comparado con LLMs), se estima que puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM, aunque no hay datos confirmados.
- **Despliegue**: compatible con LeRobot (carga mediante `ACTPolicy.from_pretrained`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, que son para modelos de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos robóticos comparables en la misma categoría. El repositorio menciona un compañero, `IntelligentDecisionLab/xlerobot-coffee-model-sim-b-force`, que usa el método B (fuerza) en simulación, pero no se proporcionan sus especificaciones ni rendimiento. Por tanto, la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- **Entrenamiento offline sin validación en robot real**: las políticas no tienen métricas de éxito en hardware real; la comparación 17-DoF vs 6-DoF se basa solo en error de predicción de acción, que puede no correlacionarse con el éxito en bucle cerrado.
- **Confusión entre número de cámaras y tamaño del dataset**: la comparación 1 cámara vs 2 cámaras no es controlada, porque el conjunto de 2 cámaras tiene 5–6 veces más episodios.
- **Posible sobreajuste**: 100k pasos sobre ~50 episodios equivale a ~90–110 épocas, lo que sugiere overfitting. Se proporciona un barrido de checkpoints para seleccionar el mejor paso, pero no se garantiza que el último sea el óptimo.
- **Sin datos de simulación con 2 cámaras**: no se puede evaluar el efecto de la cámara en transferencia sim→real.
- **Restricciones de la licencia**: Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de rendimiento en entornos reales.
- **Dependencia de la plataforma XLeRobot**: el modelo está diseñado específicamente para el hardware XLeRobot de 17 DoF; no es portable a otros robots sin adaptación.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-sim-a-vision-pos)
- [Repositorio compañero (método B, fuerza)](https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-sim-b-force)
- [GitHub XLeRobot (proyecto original)](https://github.com/Vector-Wangel/XLeRobot)
- [GitHub XLeRobot (fork con hardware)](https://github.com/ggs2ggs/XLeRobot)
