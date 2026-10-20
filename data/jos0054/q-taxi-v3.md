# jos0054/q-Taxi-v3

## Resumen

`jos0054/q-Taxi-v3` no es un modelo de lenguaje ni una red neuronal: es una **tabla Q tabular** entrenada con Q-learning clásico sobre el entorno `Taxi-v3` de Gymnasium. El autor la publica como artefacto de reinforcement learning con un único fichero de pesos (`qtable.npy`) y una model card mínima que documenta el entrenamiento y un ejemplo de uso con `gymnasium` y `huggingface_hub`. El repositorio ocupa 0,0 GB y no incluye tokenizador, configuración de transformer ni pesos en `safetensors`.

Su relevancia es, por tanto, didáctica y de referencia: sirve como ejemplo canónico de agente tabular resuelto con Q-learning, útil para comparar líneas base clásicas frente a métodos de deep RL (DQN, PPO) en el mismo entorno, y para ilustrar el formato de publicación de artefactos RL en HuggingFace. No debe evaluarse con criterios de LLM: no hay arquitectura transformer, ni contexto, ni capacidades de generación de texto, código o visión.

El autor declara un retorno medio de **7,52 ± 2,71** tras 25.000 episodios de entrenamiento, con una media menos una desviación típica de 4,81. La métrica está marcada como **no verificada** (`verified: false`).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-acción); no es un transformer ni una red neuronal |
| Parametros totales | no disponible (el espacio de estados y acciones del entorno determina el tamaño de la tabla; en la versión estándar de Gymnasium, 500 estados x 6 acciones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplicable: el agente observa un estado discreto por paso, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (no aplicable: tabla de valores en coma flotante almacenada en `.npy`) |
| Idiomas soportados | no disponible (no aplicable: no procesa lenguaje natural) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | `.npy` (NumPy), fichero `qtable.npy`; sin `safetensors` ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular con actualización de estilo TD(0) sobre pares estado-acción discretos: el agente mantiene una tabla de valores Q y selecciona la acción mediante `argmax` sobre la fila correspondiente al estado actual. El autor indica que el entrenamiento se realizó **desde cero durante 25.000 episodios**. No se documentan hiperparámetros (tasa de aprendizaje, factor de descuento, política de exploración epsilon-greedy, decaimiento) ni la semilla utilizada, lo que limita la reproducibilidad.

No hay datos sobre composición de dataset (el entorno es procedural), ni fases de RLHF, DPO o ajuste supervisado, ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se especifica si la tabla se inicializó a cero o con valores optimistas, ni si se aplicó alguna variante (SARSA, double Q-learning); la etiqueta del repo indica `custom-implementation`, es decir, una implementación propia del algoritmo.

## Capacidades

- Resolución del entorno `Taxi-v3` de Gymnasium: recogida y entrega de pasajeros en una cuadrícula discreta mediante política greedy sobre la tabla Q.
- Política determinista: para cada estado devuelve siempre la acción de mayor valor (`qtable[state].argmax()`).
- Inferencia sin dependencias de deep learning: solo requiere `numpy` y `gymnasium`.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente multi-paso más allá del bucle episódico del propio entorno.
- Sin capacidades multilingües, de generación de texto, código, matemáticas, visión o audio.
- Sin modo "thinking" ni razonamiento simbólico: la política es una búsqueda en tabla.

## Casos de uso

- **Línea base en investigación de RL**: usar el agente como referencia tabular frente a DQN o PPO en `Taxi-v3`, midiendo la brecha de rendimiento con el mismo protocolo de evaluación (episodios, semillas, retorno medio).
- **Docencia de Q-learning**: material de clase para ilustrar la ecuación de Bellman, la exploración epsilon-greedy y la convergencia de la tabla Q, con un artefacto descargable en una sola línea desde HuggingFace.
- **Test de integración de entornos Gymnasium**: validar pipelines de evaluación (`gym.make`, `step`, `reset`) con un agente que no requiere GPU ni frameworks de DL.
- **Prototipado de sistemas de despacho simplificados**: modelar la asignación de recogidas y entregas en una cuadrícula como problema de decisión secuencial y comparar la política tabular con heurísticas de distancia.
- **Verificación de reproducibilidad de artefactos**: comprobar el formato de publicación de políticas RL en el Hub (pesos `.npy`, `model-index`, snippet de carga) para definir plantillas internas de model cards.
- **Generación de datos de demostración**: producir trayectorias etiquetadas (estado, acción) para entrenar modelos de imitación o para pruebas de *offline RL* en un entorno de juguete.
- **Benchmarking de infraestructura de inferencia**: medir latencia de un paso de política puramente en CPU y en memoria, como cota inferior de comparación frente a políticas neuronales.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,52 +/- 2,71 | No |
| reinforcement-learning | Taxi-v3 | mean_reward - desviacion tipica (calculado por el autor) | 4,81 | No |

No se han publicado en la información disponible resultados comparativos con otros agentes (DQN, PPO, SARSA) sobre `Taxi-v3`, ni curvas de aprendizaje, ni número de episodios de evaluación. La desviación típica de 2,71 sobre una media de 7,52 indica una varianza alta en el retorno por episodio, coherente con una política que no siempre completa la entrega de forma óptima.

## Requisitos de hardware

- **VRAM**: 0 GB. La inferencia es una indexación en un array de NumPy; reside en RAM.
- **GPU**: no se requiere ninguna. Funciona en CPU, incluidas máquinas sin acelerador.
- **Consumer GPU**: irrelevante; cabe en cualquier equipo, incluida una Raspberry Pi, dado que el repositorio ocupa 0,0 GB.
- **Memoria RAM**: del orden de kilobytes para la tabla, más el overhead de `gymnasium`.
- **Despliegue**: carga directa con `numpy.load` + `huggingface_hub.hf_hub_download`. No aplican vLLM, llama.cpp, Ollama ni TGI (no hay pesos neuronales que servir).
- **Latencia y throughput**: no disponibles en la información proporcionada. Por la naturaleza de la operación (`argmax` sobre una fila), la latencia por paso es del orden de microsegundos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| jos0054/q-Taxi-v3 | Q-learning tabular | Taxi-v3 | tabla estado-acción (500 x 6 en la versión estándar) | no aplicable | 7,52 +/- 2,71 (no verificado) | no disponible |
| Alternativas DQN sobre Taxi-v3 | Deep RL | Taxi-v3 | no disponible | no aplicable | no disponible en la información | no disponible |
| Alternativas PPO sobre Taxi-v3 | Deep RL | Taxi-v3 | no disponible | no aplicable | no disponible en la información | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no responde preguntas y no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- **Licencia no declarada**: la ausencia de licencia impide asumir permisos de uso comercial o de redistribución; es necesario contactar con el autor antes de cualquier uso en producción.
- **Métrica no verificada**: el `mean_reward` de 7,52 proviene del propio autor, sin validación independiente ni detalle del protocolo de evaluación (número de episodios, semillas, política de exploración en test).
- **Varianza elevada**: desviación típica de 2,71 frente a media de 7,52; el propio autor reporta la resta media menos desviación (4,81), lo que sugiere episodios fallidos frecuentes.
- **Falta de hiperparámetros**: sin tasa de aprendizaje, gamma, epsilon ni semilla, la reproducibilidad del entrenamiento no está garantizada.
- **Sobreajuste al entorno**: la tabla Q solo es válida para la definición exacta de `Taxi-v3` de Gymnasium; cualquier cambio en la dinámica, en el espacio de estados o en las recompensas invalida la política.
- **Sin generalización**: no hay transferencia a otros entornos ni capacidad de adaptación sin reentrenamiento.
- **Resultados de búsqueda web no relevantes**: las consultas realizadas devolvieron únicamente contenido no técnico y ajeno al modelo, por lo que no se han podido incorporar referencias externas.

## Enlaces

- HuggingFace: https://huggingface.co/jos0054/q-Taxi-v3
- Fichero de pesos: https://huggingface.co/jos0054/q-Taxi-v3/blob/main/qtable.npy (ruta indicada en la model card)
- Entorno Gymnasium Taxi-v3: no disponible en la información proporcionada (la model card solo referencia `gym.make("Taxi-v3")`)
- Paper, blog, repositorio o demo adicionales: no disponibles; la búsqueda web no arrojó resultados relevantes
