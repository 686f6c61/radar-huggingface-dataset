# mulligan/sim-square-broad-r01-auto-filtered-bc-n1-idql

## Resumen

sim-square-broad-r01-auto-filtered-bc-n1-idql es una política de control robótico entrenada con el algoritmo IDQL (Implicit Q-Learning con actor de difusión) para la tarea de simulación sim-square-broad, que reproduce un problema de ensamblaje tipo "square" (encaje de una pieza cuadrada en su hueco) en un entorno simulado. Lo publica el usuario mulligan dentro del proyecto Mulligan, un marco de investigación que organiza campañas de aprendizaje por imitación iterativo comparando distintas variantes de algoritmo, rondas y lotes de datos. El modelo es un agente basado en estado, no en visión: consume el vector de estado del simulador y produce acciones de control.

El problema que aborda es el de la mejora iterativa de políticas de imitación: el brazo "auto-filtered-bc-n1" parte de datos de teleoperación y de rollouts automáticos generados por una política compartida, y añade un paso de filtrado automático para quedarse con las trayectorias más útiles antes de entrenar. La ronda es la R1 y la celda de campaña declarada es "iterative-IL comparator", es decir, el checkpoint está pensado como comparador frente a otros brazos y rondas de la misma campaña.

El repositorio ocupa 1,4 GB e incluye un directorio por semilla (seed-1 a seed-5), cada uno con `policy.pt` (checkpoint PyTorch) y `stats.json` (normalizadores). El entrenamiento se detuvo en el paso 250001. La licencia es Apache 2.0. No se publican datos sobre número de parámetros, arquitectura de red concreta ni composición detallada del dataset más allá de los dos conjuntos enlazados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión (diffusion policy) con crítico IQL escalar; agente basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es un vector de estado del simulador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`policy.pt`, pickle) + `stats.json` con normalizadores |
| Tarea | sim-square-broad |
| Ronda / brazo | R1 / auto-filtered-bc-n1 |
| Celda de campana | iterative-IL comparator |
| Semillas publicadas | 1, 2, 3, 4, 5 (un directorio por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB (aproximadamente 0,28 GB por semilla) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura declarada es un agente IDQL state-based: un actor de difusión que genera acciones mediante un proceso de denoising iterativo, emparejado con un crítico IQL de valor escalar. IDQL combina el aprendizaje de valor fuera de política (IQL) con un actor expresivo de tipo diffusion policy, lo que permite representar distribuciones de acción multimodales sin necesidad de entrenamiento en línea con el entorno. El crítico se usa para seleccionar o ponderar las muestras de acción generadas por el actor. El modelo consume estado, no observaciones visuales, lo que simplifica la entrada pero limita su aplicabilidad a entornos que expongan el estado completo del simulador.

En cuanto a datos, el checkpoint se entrenó sobre los conjuntos `sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperación) y `sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts` (rollouts automáticos de una política compartida). Sus metadatos son referenciados por `sim-square-broad-c02-auto-filtered-bc-n1-policy-rollouts` y por el conjunto de evaluación `sim-square-broad-r00-r03-eval`, lo que sitúa al modelo dentro de un bucle de aprendizaje por imitación iterativo en el que los rollouts de una política alimentan el entrenamiento de la siguiente y se filtran automáticamente. No se especifican en la información disponible el número total de tokens o transiciones, la composición exacta del dataset, el uso de RLHF/DPO (no aplica a control robótico) ni innovaciones técnicas adicionales más allá del propio esquema IDQL y el filtrado automático del brazo "auto-filtered-bc-n1".

La procedencia está documentada con detalle: cada semilla es una copia byte a byte de un artefacto de Weights & Biases concreto (IDs de run y commits de Git listados semilla a semilla), con verificación MD5 contra el manifiesto del artefacto y SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico continuo en simulación para la tarea sim-square-broad (ensamblaje tipo square).
- Política de imitación entrenada a partir de demostraciones de teleoperación y rollouts automáticos filtrados.
- Selección de acciones multimodales gracias al actor de difusión, adecuada para tareas con múltiples soluciones válidas.
- Agente basado en estado: requiere el vector de estado del simulador como entrada, no imágenes.
- Aprendizaje fuera de política asistido por crítico IQL escalar.
- Reproducibilidad por semilla: se publican cinco semillas independientes que permiten estimar la varianza del método.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Comparador de imitación iterativa: sirve como referencia ("iterative-IL comparator") para medir si otros brazos de la campaña de entrenamiento mejoran la tasa de éxito en la misma tarea y con la misma rejilla de evaluación.
- Estudio de varianza entre semillas: al incluir cinco checkpoints del mismo paso de entrenamiento, permite analizar la dispersión de resultados (47,97 %–50,40 % de éxito) y decidir cuántas semillas son necesarias en experimentos futuros.
- Generación de datos para entrenamiento posterior: la política puede desplegarse en el simulador para producir rollouts que alimenten conjuntos como los de las fases c01 y c02, cerrando el bucle de aprendizaje por imitación iterativo.
- Warm-start de políticas más ligeras: el checkpoint puede usarse como inicialización o como profesor para destilar una política de inferencia más rápida que no requiera el proceso de denoising del actor de difusión.
- Evaluación de robustez ante estados iniciales: el conjunto `sim-square-broad-r00-r03-eval` usa una rejilla de estados iniciales reservados, de modo que el modelo puede emplearse para medir generalización a configuraciones no vistas.
- Prototipado de control para ensamblaje: en investigación de manipulación, permite validar pipelines completos de percepción de estado, normalización (`stats.json`) y bucle de control antes de trasladar el método a hardware real.
- Integración en pipelines de CI para investigación en RL: al ser un artefacto autocontenido de aproximadamente 0,28 GB por semilla con licencia Apache 2.0, se puede versionar y ejecutar en pruebas automáticas de regresión de rendimiento.
- Ablación del filtrado automático: comparar esta ronda R1 con otras rondas de la misma tarea para aislar la contribución del filtrado de datos y del esquema IDQL.

## Benchmarks y rendimiento

La única evaluación publicada es una rejilla de estados iniciales reservados con 30 000 rollouts por semilla. Los datos proceden del conjunto `sim-square-broad-r00-r03-eval`.

| Semilla | Rollouts | Éxitos | Tasa de éxito |
|---|---|---|---|
| seed-1 | 30000 | 15117 | 50,39 % |
| seed-2 | 30000 | 14557 | 48,52 % |
| seed-3 | 30000 | 15120 | 50,40 % |
| seed-4 | 30000 | 14392 | 47,97 % |
| seed-5 | 30000 | 14622 | 48,74 % |
| Media (5 semillas) | 150000 | 73808 | 49,21 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; no son aplicables a un agente de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia de tamano, el repositorio completo ocupa 1,4 GB para cinco semillas, es decir, aproximadamente 0,28 GB por checkpoint, lo que sugiere que el modelo es pequeno en terminos de memoria de pesos; la cifra exacta depende del número de parámetros y del tipo de dato, que no se publican.
- GPU recomendadas: no disponibles. Por el tamano del checkpoint, es plausible que cualquier GPU consumer reciente (por ejemplo, gama RTX) pueda ejecutarlo, pero esto no está confirmado por el autor.
- CPU: no confirmado. Dado el reducido tamano del artefacto, la inferencia en CPU es factible en principio, aunque la latencia del actor de difusión depende del número de pasos de denoising, que no se especifica.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama o TGI; no son aplicables, ya que no es un modelo de lenguaje. El checkpoint se carga directamente con PyTorch desde `policy.pt`, usando `stats.json` para normalizar entradas y salidas.
- Latencia y throughput: no disponibles. El coste computacional está dominado por el muestreo iterativo del actor de difusión y por la frecuencia de control del simulador, ninguno de los cuales se detalla en la información proporcionada.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch; deben cargarse únicamente en un entorno de confianza.

## Comparativa con modelos similares

No se dispone de métricas de modelos comparables en la información proporcionada. La campaña de Mulligan incluye otras rondas y brazos de la misma tarea (el conjunto de evaluación cubre las rondas r00 a r03, y existe la celda "iterative-IL comparator"), lo que sugiere comparadores internos directos, pero sus resultados no se detallan en esta ficha.

| Modelo | Tarea | Semillas | Evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-broad-r01-auto-filtered-bc-n1-idql | sim-square-broad | 5 | 49,21 % de éxito medio en 150000 rollouts | Apache 2.0 | HuggingFace |
| Otras rondas de la campana (r00–r03) | sim-square-broad | no disponible | no disponible | no disponible | no disponible |
| Otros brazos de la celda iterative-IL | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: no hay evidencia de transferencia a un robot real. La brecha sim-a-real no se aborda en la información publicada.
- Específico de una única tarea (sim-square-broad) y de un único tipo de entrada: no generaliza a otras tareas ni acepta observaciones visuales.
- Tasa de éxito cercana al 50 %: aproximadamente la mitad de los rollouts de evaluación fallan, lo que limita su uso como política autónoma sin supervisión.
- Sensibilidad a la semilla: el rendimiento varía entre el 47,97 % y el 50,40 % según la semilla, una dispersión de más de dos puntos porcentuales que debe tenerse en cuenta al comparar métodos.
- Dependencia de la normalización: el checkpoint requiere `stats.json` con los normalizadores correctos; usar estadísticas distintas puede degradar o invalidar las acciones generadas.
- Riesgo de sobreajuste a la rejilla de estados iniciales de evaluación, aunque el conjunto declarado sea de estados reservados; no se publican evaluaciones con perturbaciones de dinámica o ruido.
- Sesgos conocidos: no disponibles. En control robótico, el sesgo relevante es la cobertura del dataset de teleoperación, cuya composición no se detalla.
- Riesgo de seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch y pueden ejecutar código arbitrario al deserializarse; cárguelos solo en entornos de confianza, tal y como advierte el propio autor.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte por parte del autor; cite la procedencia de los artefactos de W&B si redistribuye copias.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-auto-filtered-bc-n1-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts de politica compartida: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de rollouts filtrados automaticamente: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-filtered-bc-n1-policy-rollouts
- Dataset de evaluacion r00-r03: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
