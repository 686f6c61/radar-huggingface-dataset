# mulligan/sim-square-narrow-r01-mulligan-idql

## Resumen

sim-square-narrow-r01-mulligan-idql es un agente de control robótico entrenado con IDQL (Implicit Diffusion Q-Learning) para la tarea de simulación sim-square-narrow. Lo publica la organización mulligan en Hugging Face como parte del proyecto Mulligan, una plataforma de entrenamiento y evaluación comparativa de políticas robóticas cuyos resultados se publican en Policy Arena. No es un modelo de lenguaje: es una política estado-acción que recibe observaciones del entorno simulado y emite comandos de control.

El modelo combina un actor de difusión (diffusion policy) con un crítico escalar entrenado mediante IQL, una variante offline de Q-learning que evita consultar acciones fuera de la distribución de los datos. Se distribuye como cinco checkpoints independientes (semillas 1 a 5) más ficheros de normalización, todos ellos en formato PyTorch. El entrenamiento se detuvo en el paso 150001 y procede de artefactos de Weights & Biases verificados por hash.

Su relevancia es metodológica y de reproducibilidad: forma parte de una campaña de auto-mejora con DAgger (agregación de datos iterativa) sobre la tarea Square, y publica tanto las evaluaciones por semilla como los conjuntos de datos de teleoperación y de rollouts de política utilizados. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación más que un modelo orientado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión (diffusion policy) con crítico escalar IQL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política estado-acción, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en precisión completa como checkpoint PyTorch |
| Idiomas soportados | no aplica (sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickle) + normalizadores `stats.json` |
| Tarea | sim-square-narrow |
| Ronda del modelo | R1 |
| Brazo (arm) | mulligan |
| Celda de campana | `sq_d0_r1_ours_mining_beta05_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política es un agente IDQL en modo basado en estado (*state-based*), es decir, consume el vector de estado del entorno y no imágenes. El componente de actor es un modelo de difusión que genera acciones muestreando de una distribución implícita aprendida; el componente crítico es un Q-funcion escalar entrenado con IQL, que aproxima el valor esperado mediante expectile regression sin necesidad de evaluar acciones fuera del conjunto de datos. Esta separación permite aprovechar datos offline (teleoperación y rollouts previos) sin sufrir la extrapolación errónea típica de los métodos actor-crítico clásicos. Los artefactos de Weights & Biases asociados llevan el nombre `iql_ddpg_bc_idql_nutassemblysquare`, lo que indica que la implementación combina IQL con componentes de DDPG y behavioral cloning.

El entrenamiento se enmarca en una campaña de auto-mejora con DAgger: los conjuntos de datos declarados son teleoperación con SOBOL (`sim-square-narrow-c00-teleop-sobol`), datos agregados por DAgger (`sim-square-narrow-c01-dagger-mulligan`) y rollouts de política (`sim-square-narrow-c01-sobol-policy-rollouts`). La campaña se ejecutó en cinco tareas paralelas (`task26` a `task30`) sobre el mismo commit y se detuvo en el paso 150001 en todos los casos; no se especifica en la información disponible el número total de transiciones, la composición exacta del dataset, ni si hubo fases de RLHF/DPO (conceptos que, por otra parte, no aplican a este dominio). La reproducibilidad está documentada mediante los commits `1d6f645075c7` (semillas 1 a 3) y `55e127140163` (semillas 4 y 5), y los ficheros se describen como copias byte a byte de los artefactos de W&B con MD5 verificado contra el manifiesto y SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico de manipulación en simulación para la tarea sim-square-narrow, a partir de observaciones de estado.
- Generación de acciones mediante muestreo de difusión, lo que permite representar distribuciones multimodales de comportamiento.
- Estimación de valor fuera de línea mediante el crítico IQL, útil para filtrar o ponderar acciones candidatas.
- Ejecución de políticas en bucle cerrado con evaluación sobre una rejilla de estados iniciales retenidos.
- Soporte de flujo de mejora iterativa tipo DAgger: los checkpoints están pensados para generar rollouts que se reincorporan al entrenamiento.
- Reproducibilidad multi-semilla: cinco políticas entrenadas de forma independiente sobre la misma configuración.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje, capacidades multilingües ni entradas de visión; no es un modelo de propósito general.

## Casos de uso

- Investigación en offline RL: reproducir y analizar la variabilidad entre semillas de IDQL sobre una misma tarea, usando los cinco checkpoints publicados y sus resultados de evaluación por semilla.
- Benchmarking de algoritmos de imitación: comparar IDQL frente a otras familias (por ejemplo, DDPG+BC o IQL puro) bajo idéntica rejilla de estados iniciales, aprovechando que el proyecto publica evaluaciones en Policy Arena.
- Generación de datos para auto-mejora: ejecutar las políticas en el simulador para producir nuevos rollouts y reincorporarlos como datos de entrenamiento en una ronda DAgger posterior, que es el propósito explícito de la campaña.
- Validación de pipelines de simulación: usar el agente como carga de trabajo de referencia para verificar que un entorno sim-square-narrow reproduce las tasas de éxito publicadas (en torno al 92-95 % según semilla).
- Inicialización para ajuste fino en ensamblaje: partir de estos checkpoints y refinar sobre variantes de la tarea (por ejemplo, geometrías más estrechas o piezas distintas) en lugar de entrenar desde cero.
- Estudios de robustez ante estados iniciales: la evaluación se realizó sobre una rejilla de estados iniciales retenidos, de modo que el modelo sirve para medir sensibilidad a la condición inicial con 8000 rollouts por semilla.
- Docencia y divulgación sobre offline RL: el repositorio incluye pesos, normalizadores y metadatos de procedencia, lo que facilita construir prácticas reproducibles sin necesidad de reentrenar.
- Análisis de coste computacional en inferencia: al ser un actor de difusión basado en estado, permite medir el coste por paso de control frente a políticas deterministas más simples.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las tasas de éxito de la evaluación sobre rejilla de estados iniciales retenidos (8000 rollouts por semilla, columna `N` = 1 en la tabla original).

| Dataset de evaluacion | Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| sim-square-narrow-r00-r03-eval | seed-1 | 8000 | 7552 | 94,40 % |
| sim-square-narrow-r00-r03-eval | seed-2 | 8000 | 7359 | 91,99 % |
| sim-square-narrow-r00-r03-eval | seed-3 | 8000 | 7437 | 92,96 % |
| sim-square-narrow-r00-r03-eval | seed-4 | 8000 | 7400 | 92,50 % |
| sim-square-narrow-r00-r03-eval | seed-5 | 8000 | 7604 | 95,05 % |
| **Agregado** | 1-5 | **40000** | **37352** | **93,38 %** |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a este dominio. Tampoco se publican métricas de retorno, número de pasos por episodio ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,4 GB e incluye cinco checkpoints, por lo que cada uno ronda aproximadamente los 280 MB en disco; el consumo en memoria dependerá del entorno de simulación, no solo del modelo.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no confirmado por el autor. Dado el tamano aproximado del checkpoint, es plausible que la política quepa en GPU de consumo, pero el cuello de botella real suele ser el simulador de la tarea sim-square-narrow, que no se describe.
- Opciones de despliegue: no se documentan. Los pesos son pickles de PyTorch pensados para cargarse con el código de investigación de Mulligan en los commits indicados (`1d6f645075c7` y `55e127140163`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que además son runtimes de modelos de lenguaje y no aplican a este tipo de política.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad: la propia model card indica que los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros agentes sobre la misma tarea que permitan una comparación cuantitativa (por ejemplo, frente a variantes `auto-iql-n32` u otras celdas de campaña, de las que solo consta la existencia de datasets de rollouts, sin métricas de éxito publicadas en este contexto). La comparación estrictamente disponible es interna al propio modelo, entre las cinco semillas recogidas en la sección de benchmarks.

## Limitaciones y advertencias

- Es un modelo específico de tarea: solo produce acciones válidas para sim-square-narrow y solo en el entorno de simulación para el que fue entrenado.
- Entrada basada en estado, no en visión: no acepta imágenes ni observaciones visuales, lo que limita su transferencia a configuraciones con percepción.
- Sesgo de los datos de entrenamiento: al depender de teleoperación humana y de rollouts de políticas previas, hereda las distribuciones y posibles sesgos de esas demostraciones.
- Riesgo de alucinación en el sentido clásico: no aplica; en su lugar, existe riesgo de generalización errónea fuera de la distribución de estados cubierta por la rejilla de evaluación.
- Variabilidad entre semillas: la tasa de éxito oscila entre el 91,99 % y el 95,05 %, una horquilla de más de tres puntos que conviene tener en cuenta al seleccionar un checkpoint.
- Idiomas y contexto: no aplica, pero implica que ninguna capacidad de lenguaje, razonamiento simbólico o diálogo está disponible.
- Licencia MIT: permite uso comercial y modificación, pero la licencia no cubre los datos de terceros ni el entorno de simulación necesario para ejecutar la política.
- Procedencia y seguridad: los ficheros son pickles de PyTorch; cargarlos de fuentes no confiables es un riesgo de ejecución de código.
- Sin métricas de latencia, throughput ni requisitos de hardware publicados, la planificación de un despliegue en producción requiere medirlos por cuenta propia.
- Actividad nula en el repositorio (0 descargas, 0 likes) y sin mantenimiento declarado más allá de la fecha de publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulligan/sim-square-narrow-r01-mulligan-idql
- Organización Mulligan en Hugging Face: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset sim-square-narrow-c00-teleop-sobol: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset sim-square-narrow-c00-teleop-sobol (árbol de ficheros): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol/tree/main
- Dataset sim-square-narrow-c01-dagger-mulligan: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Dataset sim-square-narrow-c01-sobol-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de evaluación sim-square-narrow-r00-r03-eval: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset sim-square-narrow-c01-auto-iql-n32-policy-rollouts: https://claru.ai/datasets/mulligan-sim-square-narrow-c01-auto-iql-n32-policy-rollouts
