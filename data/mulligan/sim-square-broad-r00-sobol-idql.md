# mulligan/sim-square-broad-r00-sobol-idql

## Resumen

sim-square-broad-r00-sobol-idql es un agente de aprendizaje por refuerzo offline publicado por el usuario mulligan dentro del proyecto Mulligan (Mulligan Research / Policy Arena). No es un modelo de lenguaje: es una política de control robótico basada en estado, entrenada para la tarea de simulación denominada sim-square-broad. Internamente sigue el esquema IDQL, es decir, un actor de difusión acompañado de un crítico IQL escalar. Los pesos se distribuyen como un checkpoint de PyTorch (`policy.pt`) junto con un fichero `stats.json` que contiene los normalizadores de observaciones y acciones.

El repositorio agrupa cinco semillas de entrenamiento (seed-1 a seed-5), todas detenidas en el paso 250001, y cada una procede de un artefacto de Weights & Biases distinto de la campaña `self-improving/square-d1-dagger-mining-01a`. El identificador de la celda de campaña es `sq_d1_r0_ours_sobol`, lo que sitúa este checkpoint en la ronda R0 (ronda inicial de referencia) del brazo de muestreo etiquetado como `sobol`. El tamaño total del repositorio es de 1,4 GB, lo que equivale aproximadamente a 280 MB por semilla.

Su relevancia es acotada pero clara: se trata de un punto de referencia reproducible (los ficheros son copias byte a byte de los artefactos originales, verificadas por MD5 y con SHA-256 registrado en `release.json`) para evaluar algoritmos de RL offline en una tarea de manipulación con distribución amplia de estados iniciales. La evaluación publicada sobre una rejilla de estados iniciales retenida arroja una tasa de éxito agregada del 54,23 % sobre 150.000 rollouts, con una variabilidad entre semillas de aproximadamente 1,25 puntos porcentuales. El modelo se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente IDQL: actor de difusión (generación de acciones por denoising) con crítico IQL escalar; política basada en estado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje; no existe ventana de tokens) |
| Tipos de cuantización | no disponible (se distribuyen checkpoints en precisión nativa de PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no tiene interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de PyTorch (`policy.pt`, serializado como pickle) más `stats.json` con normalizadores; una carpeta por semilla |
| Tarea | sim-square-broad |
| Ronda del modelo | R0 |
| Brazo / celda de campaña | sobol / `sq_d1_r0_ours_sobol` |
| Semillas incluidas | 1, 2, 3, 4 y 5 |
| Paso de entrenamiento | 250001 |
| Dataset de entrenamiento | mulligan/sim-square-broad-c00-teleop-sobol |
| Dataset de evaluación | mulligan/sim-square-broad-r00-r03-eval |
| Tamaño del repositorio | 1,4 GB (≈280 MB por semilla, valor derivado) |
| Pipeline declarado en HuggingFace | robotics |

## Arquitectura y entrenamiento

La arquitectura es un agente IDQL compuesto por dos piezas. El actor es un modelo de difusión que representa la distribución de acciones condicionada al estado: en inferencia se generan varias acciones candidatas mediante un proceso iterativo de denoising y, a continuación, el crítico escalar selecciona la candidata con mayor valor estimado. El crítico se entrena con el objetivo IQL (regresión por expectiles, sin consultar acciones fuera de la distribución del dataset), lo que evita el problema de sobreestimación típico de los métodos actor-crítico estándar en RL offline. La política consume observaciones de estado, no píxeles, tal como indica la propia model card ("State-based IDQL agent").

No se detallan en la información disponible ni el número de parámetros de la red de difusión, ni el número de pasos de denoising, ni la composición exacta del dataset de teleoperación. Los nombres de los artefactos de origen (`iql_ddpg_bc_idql_square_d1_...`, campaña `dagger-mining-01a`) apuntan a un proceso de entrenamiento iterativo con agregación de datos tipo DAgger en el que conviven variantes IQL, DDPG+BC e IDQL, pero esta lectura es una inferencia a partir de los identificadores y no un dato confirmado por el autor. Lo que sí consta es que cada semilla se entrenó hasta el paso 250001 y que los checkpoints son copias verificadas por MD5 de los artefactos de W&B, con el commit de Git asociado a cada ejecución.

## Capacidades

- Generación de acciones continuas para control robótico en la tarea sim-square-broad, a partir de observaciones de estado.
- Política multimodal: al modelar la distribución de acciones con difusión, puede representar múltiples modos de comportamiento en lugar de colapsar a una media.
- Selección de acción guiada por valor: muestreo de varias candidatas y reordenación mediante el crítico IQL, lo que mejora la calidad de la acción frente a un actor de difusión puro.
- Aprendizaje puramente offline: se entrena sin interacción con el entorno, a partir de un dataset de teleoperación fijo.
- Robustez entre semillas: cinco checkpoints independientes con comportamiento agregado comparable (54,23 % ± 1,25 puntos porcentuales de éxito).
- Generalización a estados iniciales variados: la evaluación se realiza sobre una rejilla retenida de estados iniciales con 30.000 rollouts por semilla.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Línea base de referencia en investigación en RL offline: sirve como punto de comparación reproducible (cinco semillas, paso fijo 250001) frente a nuevos algoritmos evaluados en la misma tarea y sobre la misma rejilla de estados iniciales.
- Punto de partida para fine-tuning con datos propios en simulación: al ser un checkpoint IDQL entrenado con teleoperación, se puede continuar el entrenamiento con nuevos datos del mismo entorno para adaptar el comportamiento sin partir de cero.
- Inicialización de un bucle de mejora iterativa tipo DAgger: los checkpoints pueden desplegarse en el simulador para recolectar nuevos rollouts, corregirlos y reentrenar, encadenando rondas sucesivas (el repositorio ya documenta las rondas R0 y R03 en la evaluación).
- Evaluación de robustez frente a la distribución inicial: los cinco seeds permiten medir la varianza del algoritmo ante cambios en la inicialización y detectar si una mejora es significativa o ruido estadístico.
- Componente de bajo nivel en una jerarquía de control: un planificador de alto nivel puede emitir subobjetivos y delegar la ejecución motora fina en esta política, que consume estado y devuelve acciones continuas.
- Generación de datos etiquetados para otros modelos: los rollouts del agente en simulación, con sus resultados de éxito o fracaso, sirven para construir datasets de imitación filtrada o para entrenar modelos de valor.
- Validación de infraestructura de entrenamiento y despliegue: al incluir hashes MD5 y SHA-256 y commits concretos, es útil como caso de prueba para verificar pipelines de reproducción, versionado de artefactos y carga de checkpoints.
- Estudio de la multimodalidad en políticas de manipulación: la combinación de actor de difusión y crítico escalar permite analizar experimentalmente cómo afecta el remuestreo guiado por valor al éxito en tareas con ambigüedad de acción.

## Benchmarks y rendimiento

Evaluación sobre rejilla de estados iniciales retenida, 30.000 rollouts por semilla (dataset mulligan/sim-square-broad-r00-r03-eval). Los porcentajes son cálculos derivados de los conteos publicados por el autor.

| Semilla | Éxitos / rollouts | Tasa de éxito |
|---|---|---|
| seed-1 | 16424 / 30000 | 54,75 % |
| seed-2 | 15808 / 30000 | 52,69 % |
| seed-3 | 16397 / 30000 | 54,66 % |
| seed-4 | 15968 / 30000 | 53,23 % |
| seed-5 | 16741 / 30000 | 55,80 % |
| Agregado (5 semillas) | 81338 / 150000 | 54,23 % (desviación típica entre semillas ≈ 1,25 puntos porcentuales) |

No se han publicado en la información disponible resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales de retorno, longitud de episodio o tasa de éxito por rango de estado inicial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información. Como referencia derivada del tamaño del repositorio, cada semilla ocupa aproximadamente 280 MB, por lo que el checkpoint completo de una semilla cabe holgadamente en GPUs de consumo (por ejemplo, gamas RTX xx60/xx70/xx80 con 8-16 GB). Esta cifra es orientativa y no sustituye a una medición real.
- GPU recomendadas: no especificadas por el autor. Al ser una política basada en estado con red de difusión de tamaño no declarado, se espera que cualquier GPU con soporte CUDA sea suficiente; no se requiere A100 ni H100.
- Viabilidad en GPU de consumo: probable, dado el tamaño del checkpoint, aunque no hay confirmación oficial.
- CPU: técnicamente viable para cargar el modelo, pero el muestreo por difusión (varios pasos de denoising por acción más el remuestreo de candidatas por el crítico) penaliza la latencia en ausencia de GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni TensorRT/ONNX, que en cualquier caso no aplican a este tipo de modelo. El uso previsto es cargar `policy.pt` con PyTorch junto a `stats.json` y ejecutar la política dentro del simulador correspondiente a la tarea sim-square-broad.
- Latencia y throughput: no disponibles. Dependen del número de pasos de denoising y del número de candidatas evaluadas por el crítico, parámetros que no se detallan en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye otros checkpoints comparables con especificaciones declaradas. Los únicos elementos alternativos mencionados son las familias de algoritmos que aparecen en los nombres de los artefactos de origen, sin datos públicos asociados en esta ficha.

| Modelo | Familia | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-broad-r00-sobol-idql | IDQL (actor de difusión + crítico IQL escalar) | no disponible | no aplica | Apache 2.0 | HuggingFace, 5 semillas |
| IQL (familia citada en los artefactos de origen) | RL offline basado en valor, sin actor explícito de difusión | no disponible | no aplica | no disponible | no disponible |
| DDPG+BC (familia citada en los artefactos de origen) | Actor-crítico determinista con regularización por imitación | no disponible | no aplica | no disponible | no disponible |
| Diffusion Policy (familia de referencia del actor) | Política de difusión sin remuestreo por crítico | no disponible | no aplica | no disponible | no disponible |

No se dispone de cifras de rendimiento de las alternativas sobre la misma tarea y la misma rejilla de evaluación, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Tasa de fracaso no trivial: el 45,77 % de los 150.000 rollouts de evaluación terminaron en fallo, de modo que el agente no es fiable para ejecución autónoma sin supervisión.
- Ámbito restringido a una única tarea: el modelo está entrenado exclusivamente para sim-square-broad y no se documenta transferencia a otras tareas ni a entornos reales.
- Dependencia de estado privilegiado: al ser una política "state-based", requiere acceso al vector de estado del simulador; no procesa imágenes ni observaciones sensoriales crudas.
- Ausencia de validación en robot real: toda la evidencia publicada procede de simulación, por lo que no hay garantía de comportamiento ante la brecha sim-a-real.
- Riesgo de acciones inseguras o fuera de distribución: como todo agente de RL offline, puede producir acciones degeneradas ante estados no vistos durante el entrenamiento; el remuestreo por el crítico mitiga pero no elimina este riesgo.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, ya que el modelo no genera texto. El equivalente es la generación de trayectorias erróneas con alta confianza del crítico.
- Sesgos de los datos: al entrenarse con teleoperación humana (dataset sim-square-broad-c00-teleop-sobol), hereda las limitaciones y sesgos de las demostraciones, cuya composición no se detalla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre conservando el aviso de licencia y sin garantías por parte del autor.
- Seguridad al cargar los pesos: la propia model card advierte de que los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en un entorno de confianza.
- Madurez y adopción: el repositorio registra 0 descargas y 0 valoraciones positivas en el momento de la consulta, sin validación independiente por parte de terceros.
- Advertencia sobre metadatos: las fechas de creación y actualización del repositorio (2026-09-28) son posteriores a las habituales de publicación, por lo que conviene verificar la procedencia y la vigencia de los artefactos antes de integrarlos en un flujo de producción.
- Idiomas: no aplica. No existe soporte de lenguaje natural, ni instrucciones en texto ni diálogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r00-sobol-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organización mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page

Nota: la búsqueda web asociada a esta ficha devolvió únicamente páginas generales de ChatGPT (chatgpt.com, openai.com), sin relación con este modelo ni con el proyecto Mulligan, por lo que no se han incorporado. No se han localizado en la información proporcionada artículos, papers, repositorios de código o demos adicionales específicos de este checkpoint.
