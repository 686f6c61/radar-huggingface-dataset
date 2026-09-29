# mulligan/sim-square-broad-r00-baseline-first100-idql

## Resumen

`mulligan/sim-square-broad-r00-baseline-first100-idql` es un agente de control robótico para el simulador, publicado por la organización Mulligan dentro de su campaña de evaluación de políticas. No se trata de un modelo de lenguaje: es una política estado→acción entrenada con IDQL (Implicit Diffusion Q-Learning), es decir, un actor de difusión sobre el espacio de acciones combinado con un crítico Q escalar aprendido al estilo IQL. El repositorio contiene cinco checkpoints, uno por semilla (1 a 5), más los ficheros de normalización de observaciones y acciones.

El modelo resuelve la tarea `sim-square-broad` y corresponde a la ronda R0 con el brazo `baseline-first100`, dentro de la celda de campaña `sq_d1_r0_first100_baseline_uniform`. El entrenamiento se detiene en el paso 250001 y se realiza sobre el dataset de demostraciones de teleoperación `mulligan/sim-square-broad-c00-teleop-baseline-first100`, de 100 episodios. Es un artefacto de investigación orientado a servir de referencia base para comparaciones posteriores (la campaña incluye evaluaciones R0–R3) y para estudios de reproducibilidad entre semillas.

Su relevancia es metodológica: publica checkpoints byte a byte idénticos a los artefactos de Weights & Biases originales, con verificación MD5 contra el manifiesto y SHA-256 registrado en `release.json`, además de los commits de git exactos del código de investigación. Esto permite reproducir resultados de RL offline con actor de difusión sin depender de artefactos privados, algo poco habitual en la literatura de robótica. El repo ocupa 1,4 GB y tiene licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión (generativo sobre acciones) + crítico Q escalar entrenado con regresión expectil al estilo IQL; entrada basada en estado (no visión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política estado→acción; dimensionalidad del vector de estado no especificada en la model card) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como checkpoint PyTorch en precisión de entrenamiento |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | `policy.pt` (pickle de PyTorch) + `stats.json` (normalizadores), un directorio por semilla |
| Tarea | sim-square-broad |
| Ronda del modelo | R0 |
| Brazo | baseline-first100 |
| Celda de campaña | `sq_d1_r0_first100_baseline_uniform` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Dataset de entrenamiento | mulligan/sim-square-broad-c00-teleop-baseline-first100 |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura es IDQL (*Implicit Diffusion Q-Learning*): el actor es un modelo de difusión que genera distribuciones de acciones multimodales condicionadas al estado, y el crítico es un Q escalar (con conjunto de críticos) entrenado con un objetivo de tipo IQL basado en regresión expectil, que evita consultar acciones fuera de la distribución del dataset. La política final se extrae remuestreando del actor de difusión y seleccionando la acción mejor valorada por el crítico. La model card no detalla el número de capas, dimensión oculta ni tamaño del backbone del actor y del crítico, ni el número de pasos de difusión empleados en inferencia.

El entrenamiento es RL offline sobre el dataset de teleoperación `sim-square-broad-c00-teleop-baseline-first100`, con 100 episodios de demostración, y se ejecuta durante 250001 pasos para cada una de las cinco semillas. Los identificadores de los artefactos de W&B (`square-d1-dagger-mining-01a`) y de los commits de git (`56db5a8b9fca`, `112dc43003da`, `42cda0628b1c`) indican la procedencia exacta de cada checkpoint; las semillas 3, 4 y 5 comparten el commit `42cda0628b1c`, mientras que las semillas 1 y 2 corresponden a commits distintos. La model card no especifica si hubo RLHF, DPO u otras fases de ajuste, ni la composición detallada del dataset más allá de su origen teleoperado.

## Capacidades

- Control robótico continuo basado en estado: mapea observaciones de estado del simulador a acciones de manipulación en la tarea `sim-square-broad`.
- Modelado multimodal de acciones: al emplear un actor de difusión, la política puede representar distribuciones de acción multimodales propias de datos de teleoperación heterogéneos.
- Selección de acción guiada por valor: el crítico Q escalar permite filtrar o seleccionar muestras del actor en lugar de depender únicamente de la imitación.
- Reproducibilidad entre semillas: se publican cinco políticas independientes de la misma celda experimental, lo que permite cuantificar varianza de entrenamiento y de evaluación.
- Normalización incluida: cada semilla incorpora `stats.json` con los normalizadores necesarios para preprocesar observaciones y acciones.
- Integración con el código de investigación de Mulligan: los checkpoints se cargan con el código de los commits indicados.
- No soporta tool calling, function calling, agentes multi-paso, entrada de texto, visión, audio ni capacidades multilingües, ya que no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Reproducción de un baseline de RL offline: cargar `policy.pt` con el commit de git indicado y reejecutar la evaluación en `sim-square-broad` para verificar los resultados publicados en la ronda R0.
- Comparación algorítmica controlada: usar esta política como referencia base frente a variantes posteriores (rondas R1–R3 de la misma campaña) manteniendo fija la celda `sq_d1_r0_first100_baseline_uniform` y el dataset de 100 episodios.
- Estudio de varianza entre semillas: entrenar o evaluar con las cinco semillas publicadas para estimar la dispersión del rendimiento atribuible únicamente a la inicialización, sin cambiar datos ni hiperparámetros.
- Punto de partida para fine-tuning con DAgger o minería de datos: los identificadores de los artefactos (`square-d1-dagger-mining-01a`) y la estructura por semillas facilitan continuar el entrenamiento con datos adicionales capturados por políticas intermedias.
- Ablación de componentes: al ser una política IDQL pura sobre un dataset fijo, sirve para aislar la contribución del actor de difusión frente al crítico Q comparando contra políticas puramente conductuales (BC) entrenadas con el mismo dataset.
- Validación de infraestructura de evaluación de robótica: el par checkpoint + `stats.json` permite probar pipelines de evaluación en simulador, registro de métricas y trazabilidad de artefactos antes de lanzar campañas más costosas.
- Generación de trayectorias de referencia para el análisis R0–R3: el dataset de evaluación `sim-square-broad-r00-r03-eval` referencia este modelo en sus metadatos, de modo que la política puede emplearse como punto de comparación en el análisis agregado de la campaña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, retornos medios ni métricas de la tarea `sim-square-broad`, y no se proporcionan comparaciones numéricas con otras políticas. Existe un dataset de evaluación asociado (`mulligan/sim-square-broad-r00-r03-eval`) que referencia este modelo en sus metadatos, pero sus cifras no forman parte de la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. Como referencia derivada del tamaño del repositorio (1,4 GB para cinco semillas, aproximadamente 0,28 GB por semilla incluyendo `policy.pt` y `stats.json`), cada checkpoint individual debería caber holgadamente en GPUs de gama de entrada; esta estimación es propia y no está confirmada por el autor.
- GPU recomendadas: no especificadas. Al ser una política de tamaño reducido y estado-observación, la inferencia y el entrenamiento pueden ejecutarse en GPUs de consumo general; no se publican requisitos mínimos.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño de los checkpoints, aunque no se confirma oficialmente.
- Opciones de despliegue: carga directa del pickle de PyTorch (`policy.pt`) con el código de investigación de Mulligan en los commits indicados, más `stats.json` para la normalización. No se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste de inferencia depende, entre otros factores, del número de pasos de difusión del actor, que la model card no especifica.

## Comparativa con modelos similares

No se han proporcionado datos cuantitativos de modelos comparables en la información disponible. La siguiente tabla resume únicamente las diferencias cualitativas de familia algorítmica, marcando como "no disponible" todo aquello que no puede confirmarse con la información aportada:

| Modelo | Familia de política | Entrada | Licencia | Datos comparativos |
|---|---|---|---|---|
| sim-square-broad-r00-baseline-first100-idql | IDQL (actor de difusión + crítico Q escalar) | Estado | apache-2.0 | No disponible para el resto de filas |
| Políticas BC sobre el mismo dataset | Imitación conductual | Estado | no disponible | no disponible |
| Variantes IQL sin actor de difusión | IQL (actor determinista/gaussiano) | Estado | no disponible | no disponible |
| Otras políticas de la campaña Mulligan (rondas R1–R3) | no disponible | Estado | no disponible | no disponible |

No se dispone de cifras de rendimiento, tamaño de parámetros ni contexto que permitan una comparación numérica fiable con alternativas.

## Limitaciones y advertencias

- Seguridad de deserialización: los ficheros `.pt` son pickles de PyTorch; el propio autor advierte de que deben cargarse únicamente en un entorno de confianza. Cargar checkpoints de origen desconocido puede ejecutar código arbitrario.
- Dominio restringido: la política está entrenada exclusivamente para la tarea `sim-square-broad` en simulación y sobre 100 episodios de teleoperación. No hay evidencia de transferencia a hardware real ni a otras tareas, y el propio nombre del brazo (`baseline-first100`) sugiere un régimen de datos limitado.
- Entrada basada en estado: no procesa imágenes ni observaciones visuales, lo que limita su aplicabilidad directa a configuraciones con cámara sin un pipeline de estimación de estado previo.
- Ausencia de métricas publicadas: no se incluyen tasas de éxito ni curvas de aprendizaje, por lo que no es posible evaluar la calidad de la política sin ejecutar la evaluación por cuenta propia.
- Riesgo de sobreajuste al dataset: al tratarse de RL offline sobre demostraciones de un único operador o protocolo de teleoperación, es esperable un sesgo hacia los modos de comportamiento presentes en esos 100 episodios y una cobertura pobre de estados fuera de distribución.
- Idiomas: no aplica, pero conviene señalar que el modelo no procesa ni genera texto, por lo que no puede emplearse en tareas de lenguaje.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento de la política ni sobre su idoneidad para sistemas físicos; cualquier despliegue en un robot real requiere validación de seguridad independiente.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación externa de los resultados más allá de la publicada por el propio equipo.
- Trazabilidad dependiente de terceros: la reproducibilidad depende de artefactos de W&B y de commits del código de investigación de Mulligan, que podrían no ser accesibles públicamente en el futuro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r00-baseline-first100-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline-first100
- Dataset de evaluación que referencia el modelo: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Panel de evaluaciones Policy Arena: https://arena.mulligan.page
- Paper de IDQL (referencia algorítmica): no disponible en la información proporcionada
