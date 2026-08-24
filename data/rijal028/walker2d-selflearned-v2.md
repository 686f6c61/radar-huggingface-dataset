# rijal028/walker2d-selflearned-v2

## Resumen

El modelo **rijal028/walker2d-selflearned-v2** es una política de control para el entorno de locomoción bípeda `Walker2d-v2` de MuJoCo, desarrollada por el autor rijal028. Se trata de una red neuronal *feedforward* que ha sido entrenada mediante aprendizaje por refuerzo (RL) con un enfoque de *continual learning* y *lifelong retention*: el objetivo es que el agente aprenda a adaptarse de forma permanente a fallos de actuadores (en concreto, un bloqueo de la articulación de la rodilla derecha) sin necesidad de reentrenamiento ni de disparadores externos.

La relevancia del modelo radica en su método de entrenamiento, denominado *World-Model Discrepancy Guidance* con una tasa de aprendizaje óptima de `3.0 × 10⁻⁵`, que permite consolidar la experiencia de fallo directamente en los pesos de la red. Según la información del autor, el modelo mantiene un 100 % de retención del patrón de recuperación aprendido, mejorando en un +47,9 % la supervivencia ante fallos comparado con su baseline. No se proporcionan detalles sobre el número de parámetros, la arquitectura exacta ni la licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal *feedforward* (arquitectura no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de RL, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura se describe únicamente como una red neuronal *feedforward*; no se ofrecen detalles sobre el número de capas, unidades ocultas o función de activación. El entrenamiento se realiza en el entorno `Walker2d-v2` de MuJoCo, un problema de control de locomoción bípeda con observaciones continuas y acciones continuas. La innovación principal es el método *World-Model Discrepancy Guidance*, que utiliza un modelo de mundo para guiar el aprendizaje de la política, junto con una tasa de aprendizaje óptima fijada en `3.0 × 10⁻⁵`. Este método permite que el agente consolide la experiencia de fallo del actuador directamente en los pesos de la red, logrando una adaptación permanente sin necesidad de reentrenamiento externo. No se dispone de información sobre el tamaño del dataset de entrenamiento, el número de episodios ni el algoritmo base de RL utilizado (p. ej., PPO, SAC, etc.).

## Capacidades

- Control de la locomoción bípeda en el entorno `Walker2d-v2` de MuJoCo, con observaciones continuas (posiciones, velocidades, fuerzas de contacto) y acciones de torque en las articulaciones.
- **Adaptación a fallos de actuador**: el modelo es capaz de mantener la estabilidad y continuar caminando cuando la rodilla derecha se bloquea, un fallo que normalmente degrada severamente el rendimiento.
- **Retención a largo plazo**: la política conserva el patrón de recuperación aprendido en sesiones posteriores sin necesidad de un *trigger* externo (resultado de *zero-trigger retest*).
- No tiene capacidades de lenguaje, visión, *tool calling* ni otras funciones propias de modelos generativos.

## Casos de uso

- **Pruebas de robustez en robótica bípeda**: simular fallos de articulaciones (p. ej., bloqueo de rodilla) para evaluar la capacidad de recuperación de un agente antes de desplegarlo en robots reales.
- **Entrenamiento de políticas adaptativas en MuJoCo**: servir como base para investigar cómo consolidar experiencias de fallo en los pesos de una red sin reentrenamiento completo.
- **Benchmark de *continual learning* en RL**: comparar la retención y adaptación de este modelo frente a otros métodos de RL estándar en entornos con perturbaciones.
- **Investigación en *world-model discrepancy***: analizar cómo la guía basada en modelos de mundo puede mejorar la adaptación ante fallos inesperados en tareas de control.
- **Generación de datos de entrenamiento**: usar la política adaptativa para generar trayectorias de demostración de recuperación de fallos que sirvan para entrenar otros agentes.
- **Validación de algoritmos de *lifelong retention***: estudiar cómo el modelo mantiene el comportamiento aprendido en episodios posteriores sin olvido catastrófico.

## Benchmarks y rendimiento

El autor proporciona resultados de una prueba de retención con *zero trigger retest* (episodio 2) comparando el modelo con su baseline. Se presentan en la siguiente tabla:

| Metrica | Modelo v2 | Baseline | Diferencia |
|---|---|---|---|
| Total de pasos | 515 | 445 | +70 |
| Supervivencia ante fallo (rodilla derecha bloqueada) | 216 pasos | 146 pasos | +47,9 % |
| Distancia recorrida | +9,504 m | no disponible | - |
| Estado de retención | 100 % (recuerda el patrón de recuperación) | - | - |

No se han publicado otros benchmarks (p. ej., recompensa media, comparaciones con otros agentes de Walker2d) en la información disponible.

## Requisitos de hardware

- No se dispone de datos específicos sobre los requisitos de hardware del modelo.
- Al ser una red *feedforward* para un entorno de RL de baja dimensionalidad (observaciones de 17 dimensiones, acciones de 6), la inferencia es ligera y debería ejecutarse en cualquier CPU moderna o GPU de gama básica (p. ej., NVIDIA GTX 1650 o superior).
- El entorno MuJoCo requiere una CPU compatible con la biblioteca `mujoco` y puede ejecutarse sin GPU.
- No se indican opciones de despliegue específicas (vLLM, Ollama, etc.) porque no es un modelo de lenguaje; su uso típico es mediante un script de RL en Python con la librería `gymnasium` y el cargador de pesos correspondiente.

## Comparativa con modelos similares

| Modelo | Categoría | Método | Rendimiento | Licencia |
|---|---|---|---|---|
| `rijal028/walker2d-selflearned-v2` | RL, Walker2d | *World-Model Discrepancy Guidance* | +47,9 % en supervivencia a fallos vs baseline | no disponible |
| `devdharpatel/SAC-Walker2d-v2` | RL, Walker2d | Soft Actor-Critic (SAC) clásico | no publicado en la ficha | no disponible |
| Otros modelos de Walker2d en Hugging Face | RL, Walker2d | varios (PPO, SAC, etc.) | no publicado | variable |

No se dispone de datos cuantitativos comparables entre estos modelos, ya que no hay benchmarks públicos con las mismas métricas. La comparativa se limita a la información cualitativa de la model card.

## Limitaciones y advertencias

- **Datos de entrenamiento no documentados**: no se especifican el número de episodios, el algoritmo de RL base ni el método de selección de la tasa de aprendizaje óptima, lo que dificulta la reproducibilidad.
- **Alcance limitado**: el modelo está entrenado exclusivamente para el entorno `Walker2d-v2` de MuJoCo; no es transferible a otros entornos o tareas sin reentrenamiento.
- **Sesgos y alucinación**: no aplica, al ser un modelo de control y no generativo; no hay riesgo de alucinación textual.
- **Licencia desconocida**: al no disponer de licencia, no se garantiza el uso comercial o la redistribución. Se recomienda contactar al autor antes de usarlo en producción.
- **Validación limitada**: solo se ha publicado un test de retención con un único fallo (rodilla derecha); no se han evaluado otros tipos de fallos ni la robustez frente a ruido o perturbaciones.
- **Sin documentación técnica**: no hay *paper*, repositorio de código ni detalles de arquitectura, lo que impide una evaluación técnica profunda.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rijal028/walker2d-selflearned-v2)
- [Modelo comparativo: devdharpatel/SAC-Walker2d-v2](https://huggingface.co/devdharpatel/SAC-Walker2d-v2)
- [Repositorio de ejemplo: hasib2003/Walker_2d](https://github.com/hasib2003/Walker_2d)
