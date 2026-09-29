# mulligan/sim-square-narrow-r02-auto-iql-n32-divl

## Resumen

sim-square-narrow-r02-auto-iql-n32-divl es un agente de control robótico basado en estado, no un modelo de lenguaje. Lo publica el proyecto Mulligan (organización `mulligan` en HuggingFace) como parte de su campaña de auto-mejora sobre la tarea de simulación `sim-square-narrow`, una variante estrecha de una tarea de ensamblaje tipo nut assembly square en la que un manipulador debe insertar/ensamblar una pieza en una holgura reducida. El artefacto concreto es un par formado por un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r02-auto-iql-n32-idql`, y un crítico DIVL de tipo distributional entrenado en esta ronda.

El modelo corresponde a la ronda R2, brazo `auto-iql-n32`, celda de campaña `sq_d0_r2_auto_iql_n32`. Se distribuyen cinco checkpoints independientes (semillas 1 a 5), todos congelados en el paso de entrenamiento 150001, con un tamaño total de repositorio de 1,4 GB. Los ficheros son `policy.pt` y `stats.json` por semilla, copias byte a byte de artefactos de Weights & Biases verificadas por MD5 y con SHA-256 registrado en `release.json`.

Su relevancia es de investigación: sirve como punto de partida reproducible (cinco semillas) para ciclos posteriores de auto-mejora con DAgger y minería de rollouts, y como política base para generar los datasets de rollouts etiquetados por éxito que alimentan las siguientes rondas. La evaluación publicada sobre una rejilla de estados iniciales held-out da una tasa de éxito media del 78,3% (31.338 aciertos sobre 40.000 rollouts agregados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critic para control robótico: actor de difusión (diffusion policy) congelado + crítico DIVL distributional. No es un transformer ni un LLM |
| Parametros totales | no disponible (el repositorio no publica recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: agente state-based sin ventana de contexto; la longitud de episodio la fija el entorno `sim-square-narrow` (no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible / no aplica: solo se publican pesos en precisión original, sin versiones cuantizadas (FP16, INT8, GGUF ni similares) |
| Idiomas soportados | no aplica: no procesa lenguaje natural; consume observaciones de estado del simulador |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`policy.pt`) más `stats.json` por semilla |
| Tarea | `sim-square-narrow` (ensamblaje/inserción en holgura estrecha, simulación) |
| Ronda / brazo | R2 / `auto-iql-n32` |
| Celda de campaña | `sq_d0_r2_auto_iql_n32` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 (todos los checkpoints) |
| Modelo padre (actor congelado) | `mulligan/sim-square-narrow-r02-auto-iql-n32-idql` |
| Commit del código de investigación | `3053203fc3df` |
| Tamano del repositorio | 1,4 GB totales (≈280 MB por semilla, derivado del total) |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es un esquema actor-critic para aprendizaje por refuerzo offline y auto-mejora iterativa. El actor es una política de difusión (diffusion policy) que se mantiene congelada: en esta ronda no se reentrena, sino que se reutiliza el actor del modelo padre `sim-square-narrow-r02-auto-iql-n32-idql`, que a su vez proviene de la familia IDQL (implicit diffusion Q-learning). La novedad de este artefacto es el crítico: un crítico DIVL de tipo distributional, que modela la distribución del retorno en lugar de estimar únicamente su valor esperado.

El entrenamiento se enmarca en un pipeline de auto-mejora con minería de rollouts estilo DAgger, identificado en los artefactos de Weights & Biases como `iql_ddpg_bc_idql_divl_nutassemblysquare`. Los datos de entrenamiento declarados son tres datasets de la propia organización: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperación, línea base), `sim-square-narrow-c01-auto-iql-n32-policy-rollouts` y `sim-square-narrow-c02-auto-iql-n32-policy-rollouts` (rollouts generados por la política auto-IQL, presumiblemente con filtrado o ponderación por éxito). No se especifican en la información disponible el número de transiciones, la composición exacta del dataset ni si hubo fases de RLHF, DPO u optimización preferencial: esos mecanismos no aplican a un agente de control. Tampoco se detalla si el entrenamiento incluyó estado del optimizador en los ficheros publicados.

## Capacidades

- Control robótico basado en estado (state-based): produce acciones de manipulador a partir de observaciones del simulador, no de imágenes ni de texto.
- Ejecución de la tarea `sim-square-narrow`: inserción/ensamblaje de precisión en una holgura estrecha dentro del entorno de simulación.
- Estimación distributional del valor: el crítico DIVL modela la distribución del retorno, útil para evaluación offline de políticas (off-policy evaluation) y para decisiones conservadoras en RL offline.
- Ensemble implícito de cinco semillas: al publicarse cinco checkpoints independientes de la misma celda, permite construir ensembles por votación o por media de acciones y medir varianza entre semillas.
- Generación de datos: la política puede desplegarse en el simulador para producir datasets de rollouts etiquetados por resultado (éxito/fracaso), que es precisamente el mecanismo que alimenta las campañas c01/c02/c03.
- Reutilización del actor congelado: al mantener el actor fijo y variar solo el crítico, permite aislar el efecto del aprendizaje de valor en experimentos controlados.
- Tool calling / function calling: no soportado (no aplica).
- Agentes multi-step y razonamiento simbólico: no soportado; la política opera como controlador reactivo dentro de un episodio de simulación.
- Capacidades multilingües: no aplica.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible / no soportado.

## Casos de uso

- Investigación en aprendizaje por refuerzo offline: usar el par actor de difusión congelado + crítico DIVL distributional como banco de pruebas para comparar estimadores de valor, midiendo el impacto del crítico sobre la tasa de éxito en la rejilla de estados iniciales held-out.
- Punto de partida para la siguiente ronda de auto-mejora: inicializar un ciclo R3 de minería de rollouts estilo DAgger partiendo de estas cinco semillas, de modo que la nueva política se entrene sobre los fallos y aciertos de la ronda R2.
- Generación de datasets de imitación filtrados por éxito: desplegar las cinco semillas en el simulador para producir rollouts etiquetados y publicar el subconjunto de episodios exitosos como datos de behavior cloning, replicando el patrón de los datasets c01 y c02.
- Evaluación comparativa reproducible: emplear las cinco semillas como referencia estadística (media del 78,3% y desviación entre semillas de aproximadamente 1,2 puntos porcentuales) frente a otras variantes de la misma campaña en Policy Arena.
- Ensembles para robustez: combinar las cinco políticas por votación o media de acciones para reducir la varianza de la política individual, especialmente en estados iniciales cercanos a los bordes de la distribución evaluada.
- Análisis de incertidumbre y valor conservador: aprovechar la naturaleza distributional del crítico para estudiar estimaciones de riesgo (por ejemplo, cuantiles bajos del retorno) antes de desplegar una política en el simulador, un paso habitual en pipelines de RL offline.
- Destilación y compresión de políticas: tomar esta política como profesor para destilar un controlador más pequeño o de menor frecuencia de inferencia, evaluando la pérdida de tasa de éxito respecto al profesor.
- Replicación de experimentos: verificar la reproducibilidad del pipeline con los commits y artefactos de Weights & Biases documentados, comprobando que los `policy.pt` coinciden con los manifiestos por MD5.

## Benchmarks y rendimiento

Se publican resultados de evaluación sobre una rejilla de estados iniciales held-out, con 32 estados iniciales por semilla y 8.000 rollouts por semilla (N = 32 en la tabla original). Los porcentajes se han calculado a partir de los recuentos publicados.

| Semilla | Dataset de evaluacion | Estados iniciales (N) | Exitos | Rollouts | Tasa de exito |
|---|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 32 | 6243 | 8000 | 78,04% |
| seed-2 | sim-square-narrow-r00-r03-eval | 32 | 6310 | 8000 | 78,88% |
| seed-3 | sim-square-narrow-r00-r03-eval | 32 | 6415 | 8000 | 80,19% |
| seed-4 | sim-square-narrow-r00-r03-eval | 32 | 6214 | 8000 | 77,68% |
| seed-5 | sim-square-narrow-r00-r03-eval | 32 | 6156 | 8000 | 76,95% |
| Agregado | sim-square-narrow-r00-r03-eval | 160 | 31338 | 40000 | 78,35% |

Rango entre semillas: 76,95% a 80,19% (3,24 puntos porcentuales). No se han publicado en la información disponible resultados comparativos con otros modelos, ni métricas de retorno medio, longitud de episodio o tiempos de inferencia. El modelo padre (`...-idql`) se menciona como origen del actor, pero no se aportan sus cifras de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio completo ocupa 1,4 GB para cinco semillas (≈280 MB por semilla), por lo que un único checkpoint es probable que quepa en cualquier GPU de consumo; esta cifra es una derivación del tamaño del repositorio, no un dato publicado.
- GPU recomendadas: no disponibles. Para un agente state-based de este tamaño, cualquier GPU moderna (por ejemplo, RTX 3060 o superior) es probablemente suficiente, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: no confirmado oficialmente; por tamaño de checkpoint, muy probablemente sí en cualquier GPU de consumo con más de 2 GB de VRAM. También es plausible la ejecución en CPU, aunque no está documentada.
- Opciones de despliegue: no aplican los stacks habituales de servido de LLM (vLLM, llama.cpp, Ollama, TGI). El artefacto requiere el código de investigación de Mulligan en el commit `3053203fc3df` y un cargador de PyTorch para leer `policy.pt` junto con `stats.json`.
- Latencia y throughput: no disponibles.
- Requisito adicional: los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza.

## Comparativa con modelos similares

La información disponible no incluye métricas de modelos comparables de terceros, por lo que la comparación cuantitativa con alternativas es "no disponible". Se puede establecer una comparación estructural con los artefactos relacionados del propio proyecto:

| Modelo / artefacto | Tarea | Actor | Critico | Semillas | Tasa de exito publicada | Licencia |
|---|---|---|---|---|---|---|
| sim-square-narrow-r02-auto-iql-n32-divl (este) | sim-square-narrow | Difusión congelado (heredado) | DIVL distributional | 5 | 76,95% - 80,19% | MIT |
| sim-square-narrow-r02-auto-iql-n32-idql | sim-square-narrow | Difusión | IDQL (padre del actor) | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otros modelos de control de la misma categoria | manipulacion en simulacion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo simulación: no hay evidencia publicada de transferencia a un robot real (sim-to-real) ni de evaluación en hardware físico.
- Tasa de fallo apreciable: en torno al 21,6% de los rollouts agregados no alcanzan el éxito, con una variabilidad entre semillas de 3,24 puntos porcentuales, lo que obliga a considerar el ensemble o a filtrar por resultado en cualquier uso downstream.
- Sesgo de distribución: la política está ajustada a la distribución de estados de las demostraciones de teleoperación (c00) y de los rollouts de auto-IQL (c01, c02); su comportamiento fuera de esa distribución, o con estados iniciales distintos de la rejilla evaluada, no está caracterizado.
- Sobreencaje al entorno: está especializada en una única tarea (`sim-square-narrow`) y no es reutilizable directamente en otras tareas sin reentrenamiento.
- Sin capacidades de lenguaje, visión ni tool calling: no es un sustituto de un LLM en ningún flujo conversacional o de agentes basados en texto.
- Riesgo de seguridad al cargar los pesos: los `.pt` son pickles de PyTorch y pueden ejecutar código arbitrario al deserializarse; deben cargarse solo en entornos de confianza y, preferiblemente, en sandbox.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar por separado la licencia del código de investigación de Mulligan y de los datasets asociados, que no se detalla en la información disponible.
- Trazabilidad limitada: cero descargas y un único "like" en el momento de la consulta, lo que implica escasa validación externa independiente.
- Reproductibilidad dependiente del entorno: la propia model card advierte de que el entrenamiento y la evaluación se realizaron con el código de investigación en commits concretos, por lo que reproducir los resultados exige ese código y las dependencias del simulador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-iql-n32-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r02-auto-iql-n32-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de demostraciones: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-n32-policy-rollouts
- Dataset de rollouts c03 (relacionado): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-iql-n32-policy-rollouts
- Dataset de evaluación r00-r03: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Busqueda de datasets de la familia: https://huggingface.co/datasets?other=sim-square-narrow
- Dataset relacionado (variante broad, success-bc): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Espejo de dataset en claro.ai: https://claru.ai/datasets/mulligan-sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts
- Paper o informe técnico del modelo: no disponible en la información proporcionada
- Repositorio de código de entrenamiento: no disponible como enlace; solo se documenta el commit `3053203fc3df`
