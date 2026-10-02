# mulligan/sim-square-narrow-r00-baseline-idql

## Resumen

sim-square-narrow-r00-baseline-idql es un agente de aprendizaje por refuerzo offline publicado por el usuario mulligan dentro del proyecto Mulligan, una campaña de entrenamiento y evaluación de políticas robóticas. No es un modelo de lenguaje: se trata de un IDQL (Implicit Diffusion Q-Learning) basado en estado, compuesto por un actor de difusión y un crítico IQL escalar. El repositorio contiene cinco checkpoints (uno por semilla, de la 1 a la 5), cada uno con un fichero `policy.pt` en formato PyTorch y un `stats.json` con los normalizadores.

El modelo resuelve una tarea concreta de manipulación simulada denominada sim-square-narrow, correspondiente a la ronda R0 y al brazo baseline de la celda de campaña `sq_d0_r0_baseline_uniform`, con entrenamiento detenido en el paso 150001. Se entrenó sobre el dataset de teleoperación sim-square-narrow-c00-teleop-baseline y su rendimiento se mide sobre una rejilla retenida de estados iniciales, con tasas de éxito que oscilan entre el 67,23 % y el 75,28 % según semilla y configuración de evaluación.

Su relevancia es la de un punto de referencia reproducible: al publicar checkpoints por semilla, configuraciones de ejecución y resultados de evaluación por rollout, permite comparar rondas y brazos posteriores de la misma campaña (por ejemplo, los agentes de las rondas c01 y r02) bajo un protocolo común. Está liberado con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (diffusion policy) con critico IQL escalar, entrenamiento offline, basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de control roboticos, no de lenguaje; no se documenta ventana de observaciones) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints PyTorch sin variantes cuantizadas |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickle) + `stats.json` con normalizadores |
| Tarea | sim-square-narrow (manipulacion simulada) |
| Ronda / brazo | R0 / baseline |
| Celda de campana | `sq_d0_r0_baseline_uniform` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | robotics |
| Autor | mulligan |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor generativo de tipo difusión que produce acciones y un crítico Q escalar entrenado con IQL (Implicit Q-Learning) que sirve para seleccionar o ponderar las muestras generadas. Todo el pipeline es offline, es decir, aprende exclusivamente del dataset de demostraciones y rollouts registrados, sin interacción adicional con el entorno durante el entrenamiento. La política es "state-based": consume vectores de estado del simulador, no imágenes, lo que reduce drásticamente el coste computacional frente a políticas visomotoras.

Los datos de entrenamiento provienen del dataset sim-square-narrow-c00-teleop-baseline, generado por teleoperación. No se especifica en la información disponible el número de transiciones, la composición exacta del dataset ni si se aplicaron fases posteriores de ajuste (RLHF, DPO u otras, que por otra parte no son habituales en este dominio). El repositorio declara cinco semillas independientes, todas entrenadas hasta el paso 150001, y referencia los ficheros de configuración de cada ejecución (`release/run-configs/sim-square-narrow-r00-baseline-idql__seed-N.json`), alojados en el repositorio de código de Mulligan, que también contiene las recetas para reentrenar cada checkpoint.

Como elemento de trazabilidad, el autor indica que el SHA-256 de cada fichero está registrado en `release.json` y advierte de que los ficheros `.pt` son pickles de PyTorch. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal ni similares), ya que no se trata de un transformer de lenguaje.

## Capacidades

- Control robótico offline en simulación para la tarea sim-square-narrow: genera acciones a partir de observaciones de estado.
- Política generativa por difusión: el actor produce acciones mediante un proceso de denoising, lo que permite modelar distribuciones multimodales de acciones.
- Selección de acciones guiada por crítico: el crítico IQL escalar permite puntuar o filtrar las muestras generadas por el actor.
- Normalización de observaciones y acciones incluida: cada checkpoint va acompañado de `stats.json`.
- Reproducibilidad por semilla: cinco checkpoints independientes, cada uno con su configuración de ejecución y su evaluación asociada.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento explícito: no es un modelo de lenguaje ni un modelo multimodal.
- No se documentan capacidades de generalización fuera de la tarea sim-square-narrow ni transferencia a hardware real.

## Casos de uso

- Referencia base (baseline) en investigación de RL offline: sirve como punto de comparación frente a brazos y rondas posteriores de la misma campaña (c01, r02) que publican sus propias evaluaciones sobre la rejilla retenida.
- Reproducción de experimentos: con los run-configs y las recetas del repositorio de Mulligan, un equipo puede reentrenar cada semilla y verificar los resultados publicados, algo poco habitual en modelos de robótica liberados sin código.
- Estudio de variabilidad entre semillas: las cinco semillas permiten analizar la dispersión de la tasa de éxito (del 67,23 % al 75,28 % según configuración), útil para dimensionar intervalos de confianza en experimentos comparativos.
- Evaluación de algoritmos de selección de acciones: al disponer de actor de difusión y crítico separados, es posible experimentar con distintas estrategias de filtrado o remuestreo sobre las mismas muestras generadas.
- Punto de partida para ajuste fino con datos propios: el esquema IDQL admite reentrenamiento sobre otros datasets de teleoperación de la misma familia de tareas, usando estos checkpoints como inicialización.
- Docencia y prototipado en RL offline: el tamaño del repositorio (1,4 GB para cinco semillas más configuraciones) y el carácter basado en estado hacen que sea manejable para prácticas y pruebas de concepto en una sola máquina.
- Auditoría de pipelines de evaluación: el enlace con el dataset sim-square-narrow-r00-r03-eval, que contiene los resultados por rollout, permite auditar cómo se calculan las tasas de éxito publicadas.

## Benchmarks y rendimiento

La model card no incluye benchmarks de lenguaje (MMLU, HumanEval, GSM8K ni equivalentes), ya que no es un modelo de lenguaje. Publica en su lugar tasas de éxito sobre una rejilla retenida de estados iniciales. Se reproduce la tabla tal cual aparece, con la columna "N" sin interpretación documentada, y se anade la tasa calculada a partir de los conteos aportados.

| Dataset de evaluacion | Semilla | N | Exitos | Tasa de exito calculada |
|---|---|---|---|---|
| sim-square-narrow-r00-r03-eval | seed-1 | 1 | 5722/8000 | 71,53 % |
| sim-square-narrow-r00-r03-eval | seed-1 | 32 | 5457/8000 | 68,21 % |
| sim-square-narrow-r00-r03-eval | seed-2 | 1 | 5929/8000 | 74,11 % |
| sim-square-narrow-r00-r03-eval | seed-2 | 32 | 5808/8000 | 72,60 % |
| sim-square-narrow-r00-r03-eval | seed-3 | 1 | 6022/8000 | 75,28 % |
| sim-square-narrow-r00-r03-eval | seed-3 | 32 | 5835/8000 | 72,94 % |
| sim-square-narrow-r00-r03-eval | seed-4 | 1 | 5931/8000 | 74,14 % |
| sim-square-narrow-r00-r03-eval | seed-4 | 32 | 5771/8000 | 72,14 % |
| sim-square-narrow-r00-r03-eval | seed-5 | 1 | 5645/8000 | 70,56 % |
| sim-square-narrow-r00-r03-eval | seed-5 | 32 | 5378/8000 | 67,23 % |
| Media de las cinco semillas | — | 1 | 2917,8/8000 (media) | 73,12 % |
| Media de las cinco semillas | — | 32 | 2824,9/8000 (media) | 70,62 % |

Observaciones a partir de los datos disponibles: la configuración N=1 supera a N=32 en las cinco semillas, con una diferencia media de aproximadamente 2,5 puntos porcentuales; la mejor semilla con N=1 es la 3 (75,28 %) y la peor es la 5 (70,56 %). No se proporcionan resultados de modelos de terceros en la misma tarea, por lo que no es posible establecer una comparación externa con los datos disponibles.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio ocupa 1,4 GB en total, pero esa cifra incluye los cinco checkpoints, los ficheros de estadísticas y los metadatos, por lo que no permite deducir la memoria necesaria para cargar una sola política.
- GPU recomendadas: no disponibles. Al tratarse de una política basada en estado (sin codificador de visión ni transformer de lenguaje), es razonable esperar que la inferencia quepa en una única GPU, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: no confirmado. No se documenta ningún requisito mínimo de hardware.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores similares, que además no aplican a este tipo de modelo. La carga prevista es mediante PyTorch, en un entorno de confianza, a partir de `policy.pt` y `stats.json`, con los run-configs del repositorio de código de Mulligan para reentrenamiento.
- Latencia y throughput: no disponibles. Nota técnica: los actores de difusión requieren varios pasos de denoising por cada acción generada, lo que afecta directamente a la latencia de control, pero el número de pasos no está documentado en la información disponible.
- Coste de entrenamiento: no disponible (se conoce únicamente el paso final, 150001).

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Licencia | Evaluacion publicada |
|---|---|---|---|---|
| mulligan/sim-square-narrow-r00-baseline-idql | sim-square-narrow | IDQL (actor de difusion + critico IQL escalar) | MIT | Si (10 celdas de evaluacion, semillas 1 a 5) |
| mulligan/sim-square-narrow-r02-auto-plain-il-n1-idql | sim-square-narrow (ronda R2) | IDQL (variante de la misma familia) | no disponible en la informacion recopilada | no disponible en la informacion recopilada |
| Alternativas de terceros (Diffusion Policy, IQL, IDQL de otros autores) | no disponible | no disponible | no disponible | no disponible |

La informacion recopilada no incluye resultados numericos de modelos comparables, incluido el propio sim-square-narrow-r02-auto-plain-il-n1-idql, del que solo consta la pagina de HuggingFace. Por tanto, no es posible presentar una comparativa cuantitativa. La comparacion relevante para este checkpoint es interna a la campana Mulligan: r00 (baseline) frente a los brazos automaticos c01 y las rondas posteriores, que publican sus propios datasets de rollouts.

## Limitaciones y advertencias

- Seguridad de carga: los ficheros `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse; deben cargarse unicamente en entornos de confianza, tal como advierte el propio autor.
- Sin validacion de la comunidad: el modelo acumula 0 descargas y 0 likes, por lo que no existe verificacion independiente de sus resultados ni de su correcto funcionamiento.
- Ambito muy restringido: es una politica especifica para la tarea sim-square-narrow en simulacion; no es un modelo de proposito general y no se documenta su rendimiento en otras tareas.
- Dependencia del estado del simulador: al ser "state-based", requiere el vector de observaciones exacto con el que fue entrenado y los normalizadores de `stats.json`; no procesa imagenes ni sensores crudos.
- Transferencia a hardware real no demostrada: no hay evidencia de sim-to-real ni de robustez ante perturbaciones fisicas.
- Variabilidad entre semillas: la tasa de exito varia entre el 67,23 % y el 75,28 %, lo que implica que la eleccion de semilla influye de forma apreciable en el resultado; conviene reportar el conjunto completo y no una unica semilla.
- Sesgos: no documentados explicitamente, pero la politica hereda los sesgos del dataset de teleoperacion sim-square-narrow-c00-teleop-baseline (estilo y cobertura del operador, distribucion de estados iniciales).
- Alucinacion en sentido estricto: no aplica. Si aplica el riesgo de generar acciones fuera de distribucion o potencialmente inseguras: el critico IQL no ofrece garantias de seguridad ni de restricciones duras.
- Idiomas: no aplica; no hay interfaz de lenguaje.
- Licencia: MIT, permisiva y compatible con uso comercial, pero la licencia cubre el artefacto de software, no garantiza idoneidad para un despliegue fisico.
- Significado de la columna "N" de las evaluaciones no documentado en la informacion disponible, lo que dificulta interpretar las dos configuraciones de evaluacion y su comparacion directa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r00-baseline-idql
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page
- Dataset de entrenamiento (teleoperacion baseline): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de evaluacion con resultados por rollout: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de rollouts de politica compartida (c01, auto BC n1): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de rollouts de politica IQL n32 (c01): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Variante de la misma familia, ronda R2: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-plain-il-n1-idql
- Listado de datasets de la familia sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
