# mulligan/sim-square-narrow-r03-auto-iql-n32-divl

## Resumen

sim-square-narrow-r03-auto-iql-n32-divl es un agente de control robótico basado en estado (state-based) entrenado para la tarea simulada `sim-square-narrow`, publicado por la organización Mulligan dentro de su campaña de investigación en aprendizaje por refuerzo offline. No es un modelo de lenguaje: se trata de una política que mapea observaciones de estado a acciones, empaquetada como `policy.pt` junto con un fichero `stats.json` de normalización. La ficha se publica como parte del ecosistema Mulligan, con evaluación abierta en Policy Arena.

El modelo combina un actor de difusión congelado procedente del checkpoint padre `sim-square-narrow-r03-auto-iql-n32-idql` con un crítico DIVL de tipo distribucional, según indica la propia model card. El nombre del artefacto de entrenamiento (`iql_ddpg_bc_idql_divl`) sugiere una combinación de componentes IQL, DDPG+BC, IDQL y DIVL, aunque el autor no detalla la composición exacta del pipeline. El repositorio ocupa 1,4 GB e incluye cinco semillas (seed-1 a seed-5), todas entrenadas hasta el paso 150001.

La relevancia del modelo es metodológica: forma parte de una campaña comparativa por rondas (R3) y brazos (`auto-iql-n32`) que permite medir el efecto de sustituir el crítico del agente padre por un crítico distribucional DIVL, manteniendo el actor congelado. Los resultados de evaluación publicados en rejilla de estados iniciales retenidos sitúan la tasa de éxito entre el 77,14 % y el 81,10 % según semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL offline con actor de difusión (congelado, heredado del checkpoint padre) y crítico DIVL distribucional; sin arquitectura transformer documentada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política paso a paso sobre observaciones de estado); no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en precisión original; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`, pickle de PyTorch) más `stats.json`; un directorio por semilla (seed-1 a seed-5) |
| Tarea | sim-square-narrow |
| Ronda de modelo | R3 |
| Brazo | auto-iql-n32 |
| Celda de campana | `sq_d0_r3_auto_iql_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Tipo de observacion | estado (state-based; sin vision) |
| Commit de entrenamiento | `3053203fc3df` |

## Arquitectura y entrenamiento

La model card describe el modelo como un agente basado en estado que conserva el actor de difusión congelado de su modelo padre (`sim-square-narrow-r03-auto-iql-n32-idql`) y añade un crítico DIVL distribucional. Es decir, el entrenamiento de esta ronda no modifica el generador de acciones: se limita a aprender un crítico distinto sobre las mismas trayectorias, lo que convierte este release en un experimento controlado sobre el componente de valor. Los identificadores de los artefactos de W&B (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indican que el pipeline de investigación combina componentes IQL, DDPG+BC, IDQL y DIVL, si bien el autor no publica la descripción formal de la arquitectura ni de sus hiperparámetros.

Los datos de entrenamiento proceden de cuatro conjuntos: un baseline de teleoperación (`sim-square-narrow-c00-teleop-baseline`) y tres rondas de rollouts generados por la propia política (`c01`, `c02` y `c03`, todas variantes `auto-iql-n32-policy-rollouts`). Este esquema corresponde a un proceso iterativo de recolección de datos con la política en el bucle, habitual en el aprendizaje por refuerzo offline con minería tipo DAgger, tal como sugiere el nombre del proyecto de W&B (`square-dagger-mining-01a`). No se documentan el número total de transiciones, la composición exacta del dataset ni si hubo etiquetado humano adicional. Los cinco checkpoints publicados son copias byte a byte de los artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`.

## Capacidades

- Generación de acciones de control a partir de observaciones de estado para la tarea `sim-square-narrow` (variante de ensamblaje tipo NutAssemblySquare en simulación).
- Política de difusión para la generación de acciones, heredada congelada del checkpoint padre.
- Estimación de valor mediante un crítico DIVL distribucional, orientado a la evaluación y mejora de políticas en RL offline.
- Ejecución de despliegues de evaluación en rejilla de estados iniciales retenidos, con resultados por rollout publicados en el dataset de evaluación.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Capacidades multilingües: no aplica.
- No se documentan capacidades de generalización fuera de la tarea `sim-square-narrow`.

## Casos de uso

- Investigación en RL offline: servir como punto de comparación controlado frente al modelo padre `sim-square-narrow-r03-auto-iql-n32-idql`, ya que comparte actor congelado y solo cambia el crítico, lo que aísla el efecto de DIVL en la tasa de éxito.
- Replicación de experimentos: al incluir cinco semillas con el mismo commit de entrenamiento (`3053203fc3df`), permite estimar la varianza entre semillas (77,14 %–81,10 % de éxito) y validar la reproducibilidad de la campaña R3.
- Generación de datos sintéticos por rollout: el agente puede desplegarse en simulación para producir nuevos conjuntos de trayectorias etiquetadas, como los que ya alimentan las fases c01, c02 y c03 de la campaña.
- Evaluación de críticos distribucionales: útil para estudiar si un crítico DIVL ofrece estimaciones de valor más informativas que las alternativas IDQL en tareas de ensamblaje con contacto.
- Transferencia sim-a-real en robótica de manipulación: la política entrenada en `sim-square-narrow` puede emplearse como inicialización o como referencia para experimentos de ajuste fino en entornos físicos equivalentes, siempre que exista un mapeo de observaciones de estado equivalente.
- Análisis de robustez ante estados iniciales: la evaluación sobre 32 estados iniciales retenidos con 8000 rollouts por semilla permite estudiar la sensibilidad de la política a condiciones de partida distintas.
- Docencia y divulgación en RL offline: el repositorio es pequeño (1,4 GB para cinco semillas) y la licencia MIT facilita su uso en material docente y cursos prácticos de aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K en la información disponible (el modelo no es un sistema de lenguaje). Los únicos datos de rendimiento son las evaluaciones sobre rejilla de estados iniciales retenidos del dataset `sim-square-narrow-r00-r03-eval`, con 32 estados iniciales por semilla y 8000 rollouts por semilla (250 rollouts por estado inicial, derivado aritméticamente):

| Semilla | N (estados iniciales) | Exitos | Rollouts | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 6245/8000 | 8000 | 78,06 % |
| seed-2 | 32 | 6358/8000 | 8000 | 79,48 % |
| seed-3 | 32 | 6488/8000 | 8000 | 81,10 % |
| seed-4 | 32 | 6412/8000 | 8000 | 80,15 % |
| seed-5 | 32 | 6171/8000 | 8000 | 77,14 % |
| Agregado (5 semillas) | 160 | 31674/40000 | 40000 | 79,19 % |

El autor indica que los resultados por rollout están disponibles en el dataset de evaluación enlazado. No se publican comparaciones con otros brazos o rondas dentro de la model card.

## Requisitos de hardware

- El número de parámetros no está publicado, por lo que no es posible estimar con rigor la VRAM necesaria. Al tratarse de una política basada en estado (sin visión ni transformer documentado), el orden de magnitud es muy inferior al de un modelo de lenguaje de tamaño medio.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El entrenamiento se realizó con el código de investigación de Mulligan en el commit `3053203fc3df`, sin que se especifique el hardware empleado.
- Ajuste en GPU de consumo: plausible en cualquier GPU de consumo moderna por el tipo de modelo, pero no confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables). El consumo esperado es mediante carga directa del fichero `policy.pt` con PyTorch y el `stats.json` asociado.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 1,4 GB; desplegar una única semilla requiere solo el subdirectorio correspondiente.

## Comparativa con modelos similares

| Modelo | Tipo | Semillas | Paso | Tasa de exito publicada | Licencia | Notas |
|---|---|---|---|---|---|---|
| sim-square-narrow-r03-auto-iql-n32-divl (este) | Actor de difusion congelado + critico DIVL distribucional | 5 | 150001 | 77,14 %–81,10 % (media 79,19 %) | MIT | Objeto de esta ficha |
| [sim-square-narrow-r03-auto-iql-n32-idql](https://huggingface.co/mulligan/sim-square-narrow-r03-auto-iql-n32-idql) | Actor de difusion padre, critico IDQL | 5 (segun ficha del padre) | 150001 | no disponible | MIT | Origen del actor congelado de este modelo |
| sim-square-narrow-c03-auto-iql-success-bc-n32 | Politica de rollouts (variante success-bc) | no disponible | no disponible | no disponible | no disponible | Existe como dataset de 100 episodios de observaciones de estado |
| sim-square-narrow-c03-baseline-policy-rollouts | Politica uniforme de referencia (baseline) | no disponible | no disponible | no disponible | no disponible | Dataset de 100 episodios de ejecuciones de una politica uniforme |

No se dispone de resultados numéricos de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la naturaleza del agente, la licencia y la disponibilidad de checkpoints.

## Limitaciones y advertencias

- Modelo específico de una única tarea (`sim-square-narrow`); no hay evidencia publicada de generalización a otras tareas o entornos.
- Rendimiento dependiente de la semilla: el rango observado abarca 3,96 puntos porcentuales (77,14 %–81,10 %), lo que obliga a reportar medias sobre varias semillas en cualquier comparación.
- Entrada limitada a observaciones de estado: no procesa imágenes ni texto, por lo que no es utilizable en pipelines multimodales.
- Sesgos conocidos: no documentados por el autor; en RL offline son habituales los sesgos derivados de la distribución de datos de comportamiento (teleoperación y rollouts de la propia política), que pueden favorecer estados visitados con frecuencia.
- Riesgo de sobreajuste a la rejilla de evaluación: los datos de éxito corresponden a estados iniciales retenidos, pero no se documenta una validación externa independiente ni evaluación en hardware real.
- Los ficheros `.pt` son pickles de PyTorch; la propia model card advierte de que deben cargarse únicamente en entornos de confianza, ya que la deserialización de pickles puede ejecutar código arbitrario.
- Licencia MIT: permite uso comercial, modificación y redistribución, con la única obligación de conservar el aviso de copyright y la licencia. No se documentan restricciones adicionales por uso.
- El repositorio mide 1,4 GB para cinco semillas; conviene descargar solo el subdirectorio necesario en entornos con almacenamiento limitado.
- La fecha de creación registrada en HuggingFace (2026-09-29) y las fechas de los artefactos de W&B (20260831) son posteriores a la fecha de consulta habitual, dato que conviene verificar antes de citar el release.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue en producción sin pruebas previas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-auto-iql-n32-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r03-auto-iql-n32-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperación baseline: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-n32-policy-rollouts
- Dataset de rollouts c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-iql-n32-policy-rollouts
- Dataset de rollouts (variante success-bc): https://claru.ai/datasets/mulligan-sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
- Dataset de rollouts (baseline uniforme): https://claru.ai/datasets/mulligan-sim-square-narrow-c03-baseline-policy-rollouts
- Explorador de datasets con etiqueta sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
- Paper o informe técnico: no disponible
