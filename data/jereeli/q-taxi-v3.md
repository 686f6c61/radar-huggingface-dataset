# Jereeli/q-Taxi-v3

## Resumen

El modelo `Jereeli/q-Taxi-v3` es un agente de aprendizaje por refuerzo (RL) entrenado mediante el algoritmo clásico de Q-Learning tabular para resolver el entorno `Taxi-v3` de OpenAI Gym. El autor, Jereeli, lo publica como una implementación personalizada, probablemente con fines educativos o de demostración. El problema que aborda es el de navegación en un grid de 4x4: el agente debe recoger a un pasajero en una ubicación y dejarlo en su destino, minimizando las penalizaciones por pasos y acciones ilegales.

La relevancia actual reside en que sirve como ejemplo canónico de RL tabular, útil para entender los fundamentos del aprendizaje por refuerzo sin necesidad de redes neuronales. El modelo se distribuye como un único archivo `.pkl` (tabla Q) y no requiere infraestructura de hardware especializada. No se dispone de información sobre su licencia, idiomas o tamaño exacto de parámetros, aunque por su naturaleza la tabla Q tiene un tamaño fijo (500 estados × 6 acciones en Taxi-v3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500×6, inferido del entorno) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entorno RL, sin contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (entorno simulado, sin lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `.pkl` (pickle) |

## Arquitectura y entrenamiento

El modelo emplea Q-Learning tabular, un algoritmo de RL off-policy que aprende una función de valor de acción `Q(s,a)` mediante la actualización iterativa de la ecuación de Bellman. No utiliza red neuronal ni capas de atención; la política se deriva directamente de la tabla Q (por ejemplo, `argmax_a Q(s,a)`). El entrenamiento se realizó en el entorno `Taxi-v3` con la configuración `map_name="4x4"` y `is_slippery=False`, según se indica en el código de uso de la model card. No se proporcionan detalles sobre el número de episodios, tasa de aprendizaje, factor de descuento o estrategia de exploración. Tampoco se menciona el uso de técnicas como DPO, RLHF o decodificación especulativa, ya que no son aplicables a este tipo de agente.

## Capacidades

- Genera acciones discretas (6 movimientos posibles) para el entorno Taxi-v3.
- Aprende una política que maximiza la recompensa acumulada en el entorno específico para el que fue entrenado.
- No soporta tool calling, function calling, ni razonamiento multi-step en el sentido de modelos de lenguaje.
- No tiene capacidades multilingües ni de procesamiento de texto.
- No dispone de modo de pensamiento (thinking mode) ni capacidades de visión o audio.
- Su única función es la de navegar en el grid de Taxi-v3, recogiendo y dejando pasajeros.

## Casos de uso

- Material educativo para clases de aprendizaje por refuerzo: el modelo permite ilustrar cómo un agente Q-Learning aprende a resolver un problema de decisión secuencial, y puede ejecutarse en un notebook para demostrar la convergencia de la tabla Q.
- Baseline para comparación de algoritmos: investigadores y estudiantes pueden usar este agente como referencia para medir la mejora de métodos más avanzados (por ejemplo, Deep Q-Networks) en el mismo entorno.
- Validación de pipelines de RL: al ser ligero y rápido de cargar, sirve para probar entornos de entrenamiento, scripts de logging o sistemas de evaluación sin necesidad de GPUs.
- Prototipado de hiperparámetros: se puede modificar el código de entrenamiento (aunque no se incluye aquí) para experimentar con diferentes tasas de aprendizaje o factores de descuento, usando este modelo como punto de partida.
- Demostración de política óptima en un entorno discreto: el agente muestra cómo una tabla Q converge a una política determinista que resuelve el problema de navegación, útil para entender la dinámica del entorno.
- Integración en simuladores de robótica simple: aunque no es un caso real, el modelo puede servir como componente en un entorno simulado de gestión de flotas, donde se necesita un agente que aprenda a asignar tareas de transporte en un grid.

## Benchmarks y rendimiento

El autor declara en la model card un valor de `mean_reward` de `7.46 +/- 2.76` para el entorno Taxi-v3, con `verified: false`. Este dato no ha sido contrastado externamente. No se han publicado otros benchmarks (como MMLU, HumanEval, etc.) porque el modelo no es un LLM. No se dispone de comparativas con otros agentes en el mismo entorno.

## Requisitos de hardware

- Requisitos mínimos: cualquier CPU, incluso de un portátil básico, es suficiente para cargar y ejecutar el modelo.
- VRAM estimada: 0 MB (la tabla Q ocupa unos pocos kilobytes).
- GPUs recomendadas: ninguna; el modelo no se beneficia de GPU.
- Se puede ejecutar en entornos sin aceleración hardware, como Google Colab (CPU) o un ordenador personal.
- Opciones de despliegue: se carga mediante `load_from_hub` (probablemente de la librería `rl_zoo3`) o directamente con `pickle` en Python. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: la inferencia es instantánea (una operación de consulta a la tabla Q), con un tiempo de ejecución del orden de microsegundos por paso.

## Comparativa con modelos similares

Existen otros repositorios en Hugging Face con el mismo nombre `q-Taxi-v3`, como `kmirain/q-Taxi-v3` y `JorisCos/q-Taxi-v3`, que también son agentes Q-Learning para el mismo entorno. No se dispone de datos de rendimiento de estos modelos, por lo que no es posible realizar una comparación cuantitativa. La comparativa se limita a la existencia de múltiples implementaciones similares, lo que indica que es un problema de referencia común en la comunidad RL.

| Modelo | Autor | Recompensa media | Licencia | Fecha de creación |
|---|---|---|---|---|
| Jereeli/q-Taxi-v3 | Jereeli | 7.46 ± 2.76 | no disponible | 2026-08-30 |
| kmirain/q-Taxi-v3 | kmirain | no disponible | no disponible | no disponible |
| JorisCos/q-Taxi-v3 | JorisCos | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno Taxi-v3 con `map_name="4x4"` y `is_slippery=False`. No funcionará correctamente si se cambia el mapa o se activa el deslizamiento (slippery).
- No es un modelo de lenguaje ni un agente generalista; no puede procesar texto, imágenes ni audio.
- La recompensa media declarada no está verificada externamente, por lo que no se puede garantizar su reproducibilidad.
- La licencia no está especificada, lo que impide conocer si se permite uso comercial o modificación. Se recomienda contactar al autor antes de usarlo en proyectos productivos.
- El formato `.pkl` puede ejecutar código arbitrario al cargarse, por lo que se debe usar solo con fuentes de confianza.
- No se proporcionan detalles sobre el proceso de entrenamiento (episodios, hiperparámetros), lo que dificulta la reproducción exacta.
- El modelo no tiene capacidad de generalización a otros entornos o variantes de Taxi-v3.

## Enlaces

- [Hugging Face - Jereeli/q-Taxi-v3](https://huggingface.co/Jereeli/q-Taxi-v3)
- [Hugging Face - kmirain/q-Taxi-v3](https://huggingface.co/kmirain/q-Taxi-v3)
- [Hugging Face - JorisCos/q-Taxi-v3](https://huggingface.co/JorisCos/q-Taxi-v3)
- [GitHub - Paw565pl/taxi-v3-rl](https://github.com/Paw565pl/taxi-v3-rl)
- [Colab - Q-Learning with Taxi-v3](https://colab.research.google.com/gist/simoninithomas/466c81aa1c2a07dd14793240c6d033c5/q-learning-with-taxi-v3.ipynb)
