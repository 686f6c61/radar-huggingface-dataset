# mulligan/sim-square-narrow-r02-auto-iql-success-bc-n32-idql

## Resumen

El modelo `sim-square-narrow-r02-auto-iql-success-bc-n32-idql` es un agente de aprendizaje por refuerzo offline para control robótico, publicado por el usuario `mulligan` dentro del proyecto Mulligan. No es un modelo de lenguaje: es una política de control basada en estado (sin visión, sin texto) entrenada para la tarea de simulación `sim-square-narrow`, que corresponde a una variante estrecha del ensamblaje de una tuerca cuadrada (square nut assembly) en un entorno simulado. La arquitectura es IDQL (Implicit Diffusion Q-Learning): un actor de difusión acompañado de un crítico IQL escalar, distribuida como un checkpoint PyTorch (`policy.pt`) junto con ficheros de normalización (`stats.json`).

El repositorio contiene cinco semillas independientes (seed-1 a seed-5), todas en el paso de entrenamiento 150001, entrenadas con el código de investigación de Mulligan y procedentes de artefactos de Weights & Biases. La ronda es R2 y el brazo experimental es `auto-iql-success-bc-n32`, lo que indica un pipeline de mejora iterativa de datos: se parte de teleoperación humana, se generan rollouts con una política IQL automática y después se filtran los rollouts exitosos para un ajuste por comportamiento (BC) sobre éxitos. Los checkpoints son copias byte a byte de los artefactos originales, verificadas por MD5 y con SHA-256 registrado en `release.json`.

Su relevancia es metodológica más que de producto: documenta un ciclo completo de auto-mejora de datos (teleop → rollouts automáticos → BC sobre éxitos → nueva política) con evaluación en una rejilla de estados iniciales retenida, y publica los resultados por semilla. El tamaño del repositorio es de 1,4 GB (cinco semillas), la licencia es MIT y no se declaran idiomas ni parámetros totales. El modelo no está pensado para inferencia de texto ni para tareas generales: es un artefacto de investigación reproducible para RL offline en robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión (diffusion policy) con crítico IQL escalar; agente basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); el agente consume observaciones de estado normalizadas con `stats.json` |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint PyTorch sin cuantizar) |
| Idiomas soportados | no aplica (modelo de control robótico, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`, pickle de PyTorch) más `stats.json` con normalizadores; cinco carpetas, una por semilla |
| Tarea | `sim-square-narrow` (ensamblaje de tuerca cuadrada, variante estrecha) |
| Ronda / brazo | R2 / `auto-iql-success-bc-n32` (celda de campaña `sq_d0_r2_auto_iql_success_bc_n32`) |
| Semillas incluidas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 150001 |
| Tamaño del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es IDQL (Implicit Diffusion Q-Learning), un método de RL offline en el que la política se parametriza como un modelo generativo de difusión y se guía en tiempo de inferencia mediante un crítico Q escalar entrenado con IQL (Implicit Q-Learning). El repositorio contiene exclusivamente el actor de difusión (`policy.pt`) y los normalizadores de observación y acción (`stats.json`); no se publican los pesos del crítico ni la configuración completa de la red en la información disponible. El agente es puramente state-based: no hay codificador visual ni procesamiento de lenguaje, por lo que la entrada es un vector de estado del simulador y la salida es una acción de control.

El entrenamiento combina tres fuentes de datos declaradas: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperación humana como base), `sim-square-narrow-c01-auto-iql-n32-policy-rollouts` (rollouts generados por una política IQL automática) y `sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts` (rollouts automáticos filtrados por éxito, usados para el ajuste por comportamiento). Este esquema de "DAgger mining" con filtrado por éxito es la innovación destacable: la política R2 se entrena con datos que incluyen sus propios aciertos, lo que refuerza la distribución de estados donde el agente ya tiene éxito. No se especifican en la información disponible el número total de transiciones, la composición exacta del dataset, ni si se aplicaron fases adicionales de RLHF/DPO (no aplicables en este dominio). Los checkpoints fueron entrenados y evaluados con el código de investigación de Mulligan en los commits git indicados por semilla (`ed2c0cd5603e`, `2671520c4b72`, `298d13044fab`, `318a490fd5c4`, `5ef560f3c869`).

## Capacidades

- Control robótico state-based: genera acciones de control continuas para la tarea de ensamblaje `sim-square-narrow` en simulación.
- Política de difusión multimodal: al parametrizar la acción como un proceso de difusión, puede representar distribuciones de acción multimodales, algo relevante en tareas de inserción con contactos.
- Guiado por crítico: el actor se combina con un crítico Q escalar, lo que permite seleccionar entre muestras de acción en función del valor estimado (característica del método IDQL).
- Reproducibilidad por semillas: se publican cinco semillas independientes del mismo brazo experimental, lo que permite medir varianza entre semillas.
- Generación de datos para auto-mejora: las políticas de esta familia se usan para producir rollouts que alimentan rondas posteriores de entrenamiento (por ejemplo, `c03-auto-iql-success-bc-n32-policy-rollouts` referencia este modelo en sus metadatos).
- Ajuste por comportamiento sobre éxitos: el brazo incluye entrenamiento con rollouts filtrados por éxito, orientado a consolidar comportamientos que ya funcionan.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, ni capacidades multilingües: no es un modelo de lenguaje.
- No hay capacidades de visión, audio ni modo de razonamiento explícito ("thinking mode") en la información disponible.

## Casos de uso

- Investigación en RL offline: usar los cinco checkpoints como línea base reproducible de IDQL en una tarea de inserción estrecha, comparando la varianza entre semillas frente a otros algoritmos (IQL, DDPG+BC, diffusion policy pura).
- Generación de datos sintéticos para auto-mejora: desplegar la política en el simulador para producir rollouts que, tras filtrarse por éxito, alimenten la siguiente ronda de entrenamiento (es exactamente el papel del dataset `c03` que referencia este modelo).
- Punto de partida para ajuste fino con demostraciones humanas: al incluir entrenamiento con teleoperación de base, el checkpoint puede servir como inicialización para un ciclo adicional de BC con nuevos datos de teleoperador.
- Evaluación comparativa de brazos experimentales: la celda de campaña `sq_d0_r2_auto_iql_success_bc_n32` permite contrastar este brazo contra otras variantes de la misma ronda (por ejemplo, variantes `sim-square-broad` o brazos sin filtrado por éxito) manteniendo la misma rejilla de estados iniciales.
- Estudio de sensibilidad a estados iniciales: la evaluación retenida usa una rejilla de estados iniciales (N=32) con miles de rollouts por semilla, lo que permite analizar en qué configuraciones iniciales falla la política y dirigir la recolección de datos a esas regiones.
- Prueba de infraestructura de evaluación de políticas: integrar el checkpoint en un bucle de simulación propio para validar el pipeline de inferencia (carga de `policy.pt` y normalización con `stats.json`) antes de escalar a otras tareas.
- Docencia y prácticas de RL offline: las cinco semillas, los datasets enlazados y los resultados por semilla forman un caso de estudio cerrado y verificable para cursos o tutoriales de RL offline aplicado a robótica.
- Referencia para transferencia sim-a-real (si se dispone del entorno físico equivalente): la tarea de ensamblaje de tuerca es un banco de pruebas habitual para estudiar la brecha sim-a-real, aunque no se aportan datos de transferencia en la información disponible.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son las evaluaciones en la rejilla de estados iniciales retenida del dataset `sim-square-narrow-r00-r03-eval`. Se presentan tal cual, con el porcentaje de éxito derivado aritméticamente a partir de los recuentos.

| Semilla | Dataset de evaluación | N (estados iniciales) | Éxitos | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 32 | 5846/8000 | 73,1 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 32 | 6097/8000 | 76,2 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 32 | 5976/8000 | 74,7 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 32 | 5911/8000 | 73,9 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 32 | 5817/8000 | 72,7 % |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo. Tampoco se publican comparaciones con otros algoritmos en la model card.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio completo (cinco semillas) ocupa 1,4 GB, de modo que cada checkpoint individual es de tamaño moderado; no se especifica la arquitectura de la red ni el número de parámetros.
- GPU recomendadas: no disponible. No se indican requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del artefacto y que se trata de una política state-based para un simulador, pero no hay confirmación en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un checkpoint de política de RL. El consumo esperado es mediante PyTorch, cargando `policy.pt` y aplicando `stats.json` para normalizar observaciones.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch; deben cargarse únicamente en un entorno de confianza, tal como advierte el propio autor en la sección de procedencia.
- Almacenamiento: 1,4 GB para el repositorio completo, más el espacio necesario para los datasets de entrenamiento y evaluación enlazados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otras políticas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, existen otros artefactos de la misma familia en la organización `mulligan`, de los que tampoco se aportan métricas:

| Alternativa | Tarea | Tipo de agente | Licencia | Disponibilidad |
|---|---|---|---|---|
| sim-square-narrow-r02-auto-iql-success-bc-n32-idql (este modelo) | sim-square-narrow | IDQL, actor de difusión + crítico IQL | MIT | HuggingFace, 5 semillas |
| Políticas de rondas/brazos previos de sim-square-narrow | sim-square-narrow | IQL / DDPG+BC según brazo | no disponible | organismos `mulligan` (R0-R3) |
| Variantes `sim-square-broad` | sim-square-broad | familia IDQL | no disponible | HuggingFace |
| IQL estándar / diffusion policy sin crítico | ensamblaje simulado | IQL o difusión | no disponible | no disponible en esta búsqueda |

La comparación con modelos de lenguaje como alternativa no procede: este artefacto resuelve un problema de control, no de generación de texto.

## Limitaciones y advertencias

- Dominio muy restringido: la política solo se ha entrenado para la tarea `sim-square-narrow`; no es reutilizable directamente en otras tareas sin reentrenamiento.
- Sin modalidad visual ni de lenguaje: no procesa imágenes, texto ni instrucciones; requiere un vector de estado del simulador con el mismo formato y normalización que `stats.json`.
- Dependencia del simulador: los resultados de éxito (72,7 %-76,2 %) corresponden a evaluación en simulación con una rejilla de estados iniciales concreta; no hay evidencia publicada de transferencia a un robot físico.
- Varianza entre semillas: el rango observado entre las cinco semillas es de aproximadamente 3,5 puntos porcentuales (72,7 %-76,2 %), por lo que conviene reportar resultados agregados por semilla y no un único número.
- Tasa de fallo no despreciable: entre el 23,8 % y el 27,3 % de los rollouts evaluados no tienen éxito, según semilla; en producción habría que prever recuperación ante fallos o intervención.
- Riesgo de sobreajuste al filtrado por éxito: al entrenar con rollouts filtrados por éxito, la política puede concentrarse en la distribución de estados donde ya triunfaba la política anterior, con cobertura limitada en estados de recuperación o fuera de distribución.
- Sesgos de los datos de origen: el dataset base es teleoperación humana (`c00-teleop-baseline`), por lo que hereda los sesgos y la cobertura limitada del operador; además, los rollouts automáticos pueden amplificar errores sistemáticos de la política previa.
- Seguridad al cargar pesos: `policy.pt` es un pickle de PyTorch y puede ejecutar código arbitrario al deserializarse; cargarlo solo en entornos de confianza, tal como advierte el autor.
- Licencia MIT: permite uso comercial y modificación, pero obliga a conservar el aviso de copyright y la licencia; no hay restricciones adicionales declaradas.
- Idiomas: no aplica; no hay soporte multilingüe que evaluar.
- No hay métricas de latencia, throughput ni coste computacional publicadas, lo que dificulta planificar despliegues en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-iql-success-bc-n32-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de entrenamiento base (teleoperación): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de entrenamiento (rollouts de política IQL automática): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de entrenamiento (rollouts filtrados por éxito): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset que referencia este modelo (ronda siguiente): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Busqueda de datasets de la familia sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
- Dataset relacionado de la variante broad: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Ficha de terceros del dataset c02: https://claru.ai/datasets/mulligan-sim-square-narrow-c02-auto-iql-n32-policy-rollouts
