# mulligan/sim-square-narrow-r02-auto-plain-il-n1-idql

## Resumen

El modelo `mulligan/sim-square-narrow-r02-auto-plain-il-n1-idql` es un agente de control robótico basado en estado (no visual) entrenado con el algoritmo IDQL, que combina un actor de difusión con un crítico IQL escalar. Lo publica la organización `mulligan` como parte del proyecto Mulligan, un banco de pruebas para aprendizaje por imitación iterativo en tareas de manipulación simulada. El artefacto no es un modelo de lenguaje: es una política de control empaquetada como checkpoint de PyTorch (`policy.pt`) junto con un fichero `stats.json` de normalizadores de observaciones y acciones.

La tarea objetivo es `sim-square-narrow`, correspondiente a la campaña de la ronda R2 y al brazo `auto-plain-il-n1`, dentro de la celda de campaña `iterative-IL comparator`. Se publican cinco semillas independientes (1 a 5), todas ellas detenidas en el paso de entrenamiento 150001. El material procede de artefactos de Weights & Biases y se distribuye con verificación de integridad: copias byte a byte con MD5 contrastado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`.

Su relevancia es doble. Por un lado, sirve como comparador público y reproducible frente a otros brazos de la misma campaña (por ejemplo, el baseline de teleoperación `c00` o los rollouts de política compartida `c01`). Por otro, documenta una metodología de entrenamiento iterativo con datos generados automáticamente: los conjuntos `c01` y `c02` de rollouts de política alimentan directamente el entrenamiento de este checkpoint. El repositorio ocupa 1,4 GB en total y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusión (diffusion policy) con crítico IQL escalar; agente IDQL sobre representación de estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el agente consume observaciones de estado, no secuencias de texto. El card no especifica horizonte de observación ni de acción |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precisión nativa de PyTorch, sin variantes cuantizadas |
| Idiomas soportados | no aplica / no disponible (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`, serializado con pickle) más `stats.json` con los normalizadores; una carpeta por semilla (`seed-1` a `seed-5`) |
| Tarea | `sim-square-narrow` |
| Ronda / brazo | R2 / `auto-plain-il-n1` |
| Celda de campaña | `iterative-IL comparator` |
| Paso de entrenamiento | 150001 |
| Numero de semillas | 5 |
| Tamano del repositorio | 1,4 GB |
| Verificación de integridad | MD5 contra el manifiesto del artefacto de W&B; SHA-256 en `release.json` |

## Arquitectura y entrenamiento

La política sigue el esquema IDQL (*Implicit Diffusion Q-Learning*): un actor generativo de tipo difusión que modela la distribución de acciones y un crítico escalar entrenado con IQL (*Implicit Q-Learning*), que permite explotar datos fuera de distribución sin consultar acciones no vistas. El nombre del artefacto de origen en W&B incluye también las etiquetas `iql_ddpg_bc_idql`, lo que indica que el pipeline de entrenamiento integra componentes de IQL, DDPG y bootstrapping con datos de comportamiento. La arquitectura interna exacta (número de capas, dimensión de las embeddings de difusión, pasos de denoising) no se detalla en la información disponible.

Todos los checkpoints se detuvieron en el paso 150001, entrenados con el código de investigación de Mulligan en los commits git indicados por semilla (`8058e129c7ac`, `1505a6e630ac`, `b72ccbd90fa0`, `5432d60be933`, `8ac67ea860e3`). Los datos de entrenamiento combinan tres conjuntos: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperación), `sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts` y `sim-square-narrow-c02-auto-plain-il-n1-policy-rollouts` (rollouts generados de forma automática por políticas previas). Este diseño corresponde a un bucle de imitación iterativa en el que el propio agente genera los datos que alimentan su siguiente ronda. No se documenta en el card el uso de RLHF, DPO ni fases de ajuste por preferencias humanas, algo que no aplica a este dominio.

## Capacidades

- Control robótico de manipulación en simulación para la tarea `sim-square-narrow`, a partir de observaciones de estado (no de imágenes).
- Generación de acciones mediante muestreo de difusión, condicionadas por el crítico IQL entrenado.
- Reutilización de datos offline: el crítico IQL permite aprovechar rollouts de políticas previas y datos de teleoperación en el mismo entrenamiento.
- Producción de rollouts de política reutilizables como dataset de entrenamiento para rondas posteriores (los conjuntos `c01`, `c02` y `c03` siguen este patrón).
- Reproducibilidad por semilla: cinco políticas independientes con trazabilidad completa hasta el artefacto de W&B y el commit de código.
- Normalización de entradas y salidas mediante `stats.json`, lo que facilita integrar el checkpoint en un bucle de control sin recalcular estadísticas.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el agente es exclusivamente basado en estado.

## Casos de uso

- Comparador de referencia en investigación sobre imitación iterativa: la celda `iterative-IL comparator` está pensada precisamente para medir este brazo (`auto-plain-il-n1`) frente a otros, con cinco semillas y 8000 rollouts de evaluación por semilla, lo que permite estimar varianza entre inicializaciones.
- Generación de datos sintéticos para la siguiente ronda de entrenamiento: el checkpoint puede desplegarse en el simulador para producir trayectorias que alimenten un conjunto del tipo `c03`, cerrando el bucle de auto-mejora.
- Punto de partida para ajuste fino en la tarea `sim-square-narrow`: al publicarse como checkpoint PyTorch con normalizadores incluidos, es directamente cargable desde el código de investigación de Mulligan para continuar el entrenamiento desde el paso 150001.
- Auditoría y reproducibilidad de resultados: la verificación MD5/SHA-256 y la correspondencia con artefactos de W&B permiten reconstruir exactamente qué política produjo cada conjunto de rollouts publicado.
- Evaluación de robustez ante condiciones iniciales: el conjunto `sim-square-narrow-r00-r03-eval` usa una rejilla de estados iniciales reservada (*held-out*), útil para medir generalización frente a variaciones de punto de partida.
- Estudio de ensamblado de políticas (ensembling) en control robótico: disponer de cinco semillas del mismo brazo y paso de entrenamiento permite analizar si promediar políticas o seleccionar la mejor mejora frente a la media individual del 64,6 % de éxito.
- Enseñanza y prototipado de algoritmos offline RL/IL: el par actor de difusión + crítico IQL, con datos y evaluaciones publicados, sirve como caso de estudio reproducible en cursos o tutoriales sobre IDQL.
- Despliegue en bucles de control en simulación: la política consume observaciones de estado y devuelve acciones; integrarla como paso de inferencia en un entorno tipo robomimic requiere el código de Mulligan, dado que no se publican exportaciones a ONNX, TensorRT ni formatos de servidor de inferencia.

## Benchmarks y rendimiento

El card publica resultados de evaluación sobre una rejilla de estados iniciales reservada, con 8000 rollouts por semilla. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este dominio.

| Semilla | Rollouts evaluados | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 5224 | 65,3 % |
| seed-2 | 8000 | 5193 | 64,9 % |
| seed-3 | 8000 | 5014 | 62,7 % |
| seed-4 | 8000 | 5195 | 64,9 % |
| seed-5 | 8000 | 5222 | 65,3 % |
| Media (calculo propio) | 40000 | 25848 | 64,6 % |

Los resultados provienen del conjunto `mulligan/sim-square-narrow-r00-r03-eval`. El card incluye una columna `N` con valor 1 en todas las filas sin aclarar su significado. La dispersión entre semillas es de 2,6 puntos porcentuales (de 62,7 % a 65,3 %). No se dispone de comparación numérica con otros brazos de la campaña en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican parámetros, tamaño de las redes del actor ni del crítico, ni precisiones de ejecución.
- GPU recomendadas: no disponible; el card no cita hardware de entrenamiento ni de evaluación.
- Encaje en GPU de consumo: no confirmado. Como referencia indirecta, el repositorio completo de cinco semillas ocupa 1,4 GB (aproximadamente 280 MB por semilla si la distribución es uniforme, dato no confirmado), un orden de magnitud compatible con checkpoints pequeños, pero esta afirmación es una inferencia y no un dato publicado.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni servidores de inferencia genéricos, que no aplican a este tipo de política. El despliegue previsto es mediante el código de investigación de Mulligan en los commits indicados, cargando `policy.pt` y `stats.json`.
- Latencia y throughput: no disponibles. El coste por paso depende del número de iteraciones de muestreo del actor de difusión, valor que no se especifica.

## Comparativa con modelos similares

No se dispone de datos numéricos de brazos alternativos en la información proporcionada. La siguiente tabla recoge únicamente la relación estructural entre este modelo y otros artefactos de la misma campaña, sin cifras de rendimiento.

| Modelo / artefacto | Tarea | Tipo | Semillas | Resultado publicado | Licencia |
|---|---|---|---|---|---|
| `sim-square-narrow-r02-auto-plain-il-n1-idql` (este modelo) | sim-square-narrow | IDQL: actor de difusión + crítico IQL escalar | 5 | 64,6 % de éxito medio sobre 40000 rollouts | MIT |
| `sim-square-narrow-c00-teleop-baseline` (conjunto de datos) | sim-square-narrow | Demostraciones de teleoperación (baseline humano) | no disponible | no disponible | no disponible |
| `sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts` (conjunto de datos) | sim-square-narrow | Rollouts de política compartida entrenada con BC | no disponible | no disponible | no disponible |
| `sim-square-narrow-c02-auto-iql-n32-policy-rollouts` (conjunto de datos) | sim-square-narrow | Rollouts de variante `auto-iql-n32` | no disponible | no disponible | no disponible |

No se identifican en la información disponible modelos comparables externos al proyecto Mulligan con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en el card. La política se entrena sobre demostraciones de teleoperación y rollouts de políticas previas, por lo que hereda las limitaciones de cobertura de esos datos (sesgo hacia las trayectorias y estados iniciales presentes en el conjunto de entrenamiento).
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de generalización fuera de distribución: ante estados iniciales alejados de la rejilla de entrenamiento, la tasa de éxito del 64,6 % no es extrapolable.
- Limitaciones de contexto o idioma: el agente es puramente basado en estado y de tarea única (`sim-square-narrow`); no soporta instrucciones en lenguaje natural, visión, audio ni cambio de tarea sin reentrenamiento.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. No se documentan restricciones adicionales de los conjuntos de datos asociados en la información disponible.
- Seguridad al cargar los pesos: los ficheros `.pt` son serializaciones de PyTorch basadas en pickle, y el propio card advierte que deben cargarse únicamente en entornos de confianza. Cargar un `policy.pt` de origen no verificado puede ejecutar código arbitrario.
- Brecha simulación-realidad: no se aporta ninguna evidencia de transferencia a un robot físico; todos los resultados son de simulación y sobre una única tarea.
- Soporte de mantenimiento: el modelo está ligado a commits concretos del código de investigación; sin ese código y sin los ficheros `stats.json` correspondientes, el checkpoint no es directamente utilizable con otras librerías.
- Volumen de validación: 8000 rollouts por semilla es una muestra amplia, pero la evaluación se realiza sobre una rejilla de estados iniciales reservada propia del proyecto; no hay resultados en benchmarks de terceros que permitan comparación independiente.
- Metadatos del repositorio: las fechas de creación y actualización que figuran en HuggingFace son 2026-09-29, posteriores a la fecha de consulta habitual, y las referencias internas de W&B apuntan a agosto de 2026. Se reproducen tal cual aparecen, sin interpretación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-plain-il-n1-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Conjunto de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Datos de entrenamiento (demostraciones de teleoperación): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Datos de entrenamiento (rollouts de política compartida con BC): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts
- Datos de entrenamiento (rollouts de política IL): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-plain-il-n1-policy-rollouts
- Conjunto referenciado por metadatos: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-plain-il-n1-policy-rollouts
- Explorador de conjuntos de la familia `sim-square-narrow` en HuggingFace: https://huggingface.co/datasets?other=sim-square-narrow
- Conjunto relacionado de la variante `auto-iql-n32` (índice de terceros): https://claru.ai/datasets/mulligan-sim-square-narrow-c02-auto-iql-n32-policy-rollouts

Nota sobre la búsqueda web: los resultados obtenidos no contienen información técnica sobre este modelo ni sobre el proyecto Mulligan. Las entradas recuperadas tratan sobre incidentes de seguridad de modelos de lenguaje de Google (Gemini) y no guardan relación con este artefacto. No se han encontrado papers, blogs ni repositorios adicionales relevantes.
