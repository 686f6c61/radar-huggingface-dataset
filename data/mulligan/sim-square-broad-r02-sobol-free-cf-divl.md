# mulligan/sim-square-broad-r02-sobol-free-cf-divl

## Resumen

sim-square-broad-r02-sobol-free-cf-divl es un agente de control para robótica entrenado con aprendizaje por refuerzo offline sobre la tarea simulada `sim-square-broad`. Lo publica el proyecto Mulligan, un esfuerzo de investigación que documenta campañas completas de experimentos (brazos, rondas, semillas y artefactos de W&B) junto con sus conjuntos de datos de teleoperación, DAgger y rollouts de política. No es un modelo de lenguaje ni un modelo fundacional multimodal: es un artefacto de política (policy) en formato PyTorch que consume observaciones de estado y produce acciones de control.

Técnicamente, el modelo reutiliza el actor de difusión congelado del modelo padre `sim-square-broad-r02-sobol-free-cf-idql` y sustituye su crítico por un crítico DIVL de tipo distribucional. Se liberan cinco semillas independientes (1 a 5), todas entrenadas hasta el paso 250001, lo que permite estudiar varianza entre semillas en un mismo brazo experimental (`sobol-free-cf`) y celda de campaña (`sq_d1_r2_ours_sobol_freecf_human_only`).

Su relevancia es metodológica: forma parte de una comparativa interna de rondas (R2) dentro de un pipeline de RL offline con IQL, DDPG+BC, IDQL y DIVL, con procedencia verificable byte a byte frente a los artefactos de Weights & Biases (MD5 contra el manifiesto, SHA-256 en `release.json`). El repo ocupa 1,4 GB en total, aproximadamente 280 MB por semilla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente actor-crítico para RL offline: actor de difusión congelado (heredado del modelo padre) y crítico DIVL distribucional |
| Parámetros totales | no disponible (el autor no publica el recuento; ver estimación en "Requisitos de hardware") |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: agente de política sobre estados; el autor no documenta la dimensionalidad del vector de observación |
| Tipos de cuantización | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle: `policy.pt` junto con `stats.json`, una carpeta por semilla (`seed-1` a `seed-5`) |
| Tarea | sim-square-broad |
| Ronda del modelo | R2 |
| Brazo experimental | sobol-free-cf |
| Celda de campaña | `sq_d1_r2_ours_sobol_freecf_human_only` |
| Semillas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 250001 |
| Pipeline de HuggingFace | robotics |
| Tamaño del repositorio | 1,4 GB |
| Commit de entrenamiento | 551416bff972 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un agente actor-crítico de RL offline. El actor es una política de difusión que se hereda congelada del checkpoint `sim-square-broad-r02-sobol-free-cf-idql`; el componente nuevo de esta ficha es el crítico, de tipo DIVL y con formulación distribucional, que aprende una distribución del retorno en lugar de una estimación puntual. El pipeline de entrenamiento declarado en los nombres de los artefactos combina IQL, DDPG+BC, IDQL y DIVL (`iql_ddpg_bc_idql_divl_square_d1_...`), es decir, una receta híbrida de aprendizaje por imitación con regularización por BC y evaluación de valor offline.

Los datos de entrenamiento proceden de cinco conjuntos publicados por el propio proyecto: teleoperación (`sim-square-broad-c00-teleop-sobol`), dos rondas de DAgger con comportamiento humano (`sim-square-broad-c01-dagger-sobol-free-cf` y `sim-square-broad-c02-dagger-sobol-free-cf`) y dos rondas de rollouts de política (`sim-square-broad-c01-sobol-policy-rollouts` y `sim-square-broad-c02-mulligan-policy-rollouts`). No se especifican en la información disponible el número de transiciones, la composición exacta del dataset ni el uso de RLHF o DPO (categorías que, por otra parte, no aplican a un agente de control). Cada checkpoint es copia byte-idéntica del artefacto de W&B correspondiente, verificado con MD5 y con SHA-256 registrado en `release.json`.

## Capacidades

- Control de manipulación en simulación sobre la tarea `sim-square-broad`, a partir de observaciones de estado (no de imágenes).
- Ejecución de políticas multi-paso con actor de difusión, apto para tareas que requieren multimodalidad en la distribución de acciones.
- Estimación de valor distribucional mediante el crítico DIVL, útil para análisis de incertidumbre y para selección de acciones tipo IDQL.
- Generación de rollouts de política reutilizables como datos de entrenamiento para rondas posteriores de DAgger o de minería de datos.
- Reproducibilidad experimental: cinco semillas independientes con el mismo commit de código y el mismo paso de entrenamiento.
- Trazabilidad de procedencia: correspondencia declarada entre carpeta de semilla, artefacto de W&B, nombre de run y commit de Git.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes conversacionales, razonamiento multi-paso simbólico ni capacidades multilingües.
- No tiene entrada de visión, audio ni modalidad de texto.

## Casos de uso

- Evaluación comparativa de algoritmos de RL offline: sirve como brazo DIVL de referencia frente al brazo IDQL de la misma campaña, permitiendo aislar el efecto de cambiar el crítico manteniendo el actor congelado.
- Generación de datos para DAgger: los rollouts de esta política pueden incorporarse a rondas posteriores de agregación de datos, tal como el propio proyecto hace con `mulligan-policy-rollouts`.
- Estudio de varianza entre semillas: con cinco semillas al mismo paso de entrenamiento, es posible estimar la dispersión del éxito (77-81% según semilla, ver benchmarks) antes de decidir si una mejora algorítmica es significativa.
- Inicialización de políticas para variantes de la tarea: al conservar un actor de difusión entrenado, resulta un punto de partida razonable para afinar en tareas de manipulación relacionadas dentro del mismo simulador.
- Auditoría de reproducibilidad: el par `policy.pt` + `stats.json` junto con `release.json` permite reconstruir la cadena artefacto de W&B → fichero publicado y verificar integridad por hash.
- Investigación sobre críticos distribucionales: el checkpoint permite analizar la distribución de retornos aprendida y su efecto en la selección de acciones frente a críticos escalares.
- Docencia y prototipado en RL offline: al ser un artefacto pequeño (≈280 MB por semilla), se puede cargar y ejecutar en un entorno de laboratorio sin infraestructura de GPU de gran escala.
- Despliegue sim-to-real con reservas: solo como punto de partida para fine-tuning, ya que la información disponible no documenta validación en hardware físico.

## Benchmarks y rendimiento

La evaluación declarada usa una rejilla de estados iniciales reservada (held-out), con N=32 y resultados por rollout registrados en el conjunto `sim-square-broad-r00-r03-eval`. Los porcentajes de la última columna son cálculo propio a partir de los éxitos y el total publicados.

| Semilla | Conjunto de evaluación | N | Éxitos / total | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | sim-square-broad-r00-r03-eval | 32 | 23130 / 30000 | 77,10% |
| seed-2 | sim-square-broad-r00-r03-eval | 32 | 24382 / 30000 | 81,27% |
| seed-3 | sim-square-broad-r00-r03-eval | 32 | 23530 / 30000 | 78,43% |
| seed-4 | sim-square-broad-r00-r03-eval | 32 | 23249 / 30000 | 77,50% |
| seed-5 | sim-square-broad-r00-r03-eval | 32 | 22979 / 30000 | 76,60% |
| Media (5 semillas) | sim-square-broad-r00-r03-eval | 32 | 117270 / 150000 | 78,18% |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, ni comparaciones contra políticas externas al proyecto. Tampoco se documenta la desviación típica entre semillas; el rango observado es de 4,67 puntos porcentuales entre el mejor (81,27%) y el peor (76,60%).

## Requisitos de hardware

- VRAM: no disponible de forma explícita. Estimación no confirmada por el autor: 1,4 GB de repositorio entre cinco semillas equivale a ≈280 MB por semilla; si el checkpoint almacena actor y crítico en fp32 (4 bytes por parámetro), el orden de magnitud sería de decenas de millones de parámetros, lo que en inferencia ocuparía unos cientos de MB.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU con varios GB de VRAM es suficiente; no se requiere A100 ni H100 para inferencia del agente.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier tarjeta de gama media o alta (por ejemplo, series RTX 30/40), e incluso inferencia en CPU para una política de este tamaño; se trata de una estimación, no de un dato publicado.
- Opciones de despliegue: PyTorch cargando `policy.pt` en un entorno de confianza. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como consideración cualitativa, un actor de difusión requiere varios pasos de denoising por acción, por lo que su coste por paso de control es mayor que el de una política determinista tipo MLP, pero no se publican medidas.
- La evaluación reportada se realizó en simulación con el código de investigación de Mulligan en el commit `551416bff972`; no se documentan requisitos de tiempo real ni de controlador físico.

## Comparativa con modelos similares

Solo se dispone de un comparable documentado dentro de la información proporcionada: el modelo padre del que se hereda el actor congelado. El resto de brazos de la campaña no se detallan en los datos disponibles.

| Modelo | Actor | Crítico | Tarea / ronda | Semillas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r02-sobol-free-cf-divl (este) | Difusión congelado del padre | DIVL distribucional | sim-square-broad / R2 / arm sobol-free-cf | 5 | MIT | HuggingFace |
| sim-square-broad-r02-sobol-free-cf-idql | Difusión | IDQL | sim-square-broad / R2 / arm sobol-free-cf | no disponible | no disponible | HuggingFace |
| Otros agentes comparables (mismo tamaño o misma tarea) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado publicaciones de referencia (RoboMimic, Diffusion Policy, IQL original, etc.) en los resultados web disponibles, por lo que no se incluye comparación con políticas externas.

## Limitaciones y advertencias

- El `.pt` es un pickle de PyTorch: solo debe cargarse en entornos de confianza, tal como advierte el propio autor en la sección de procedencia.
- La evaluación se limita a una rejilla de estados iniciales reservada con N=32; no hay datos sobre generalización fuera de esa distribución ni sobre robustez a perturbaciones.
- La tasa de éxito media del 78,18% implica que aproximadamente una de cada cinco ejecuciones falla; no es un agente con garantías de éxito para producción sin supervisión.
- La variabilidad entre semillas (76,60%-81,27%) es apreciable: cualquier comparación contra otro brazo debería tenerla en cuenta para no atribuir a la mejora algorítmica diferencias dentro del ruido.
- No se documentan sesgos específicos del modelo, pero un agente entrenado con datos de teleoperación humano y DAgger hereda los sesgos de comportamiento de la política experta y del propio simulador.
- Riesgo de alucinación: no aplica en el sentido de un modelo generativo de lenguaje; sí existe riesgo de acciones fuera de distribución con consecuencias en el entorno, especialmente en escenarios no cubiertos por los estados de entrenamiento.
- Limitaciones de idioma y contexto: ninguna aplicable, ya que no procesa texto.
- Licencia MIT, que permite uso comercial del artefacto. No obstante, los artefactos de W&B y los conjuntos de datos referenciados pueden tener condiciones propias; conviene revisarlas por separado.
- No se documenta validación en robot físico (sim-to-real) ni latencia en bucle cerrado.
- La información disponible no incluye hiperparámetros, arquitectura de red detallada (número de capas, dimensión de embeddings, pasos de difusión) ni composición exacta de los datasets, lo que dificulta la reproducción completa sin el código de investigación.
- Búsqueda web: los resultados recuperados no contenían información técnica relevante sobre este modelo; todas las fuentes útiles son las enlazadas a continuación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-sobol-free-cf-divl
- Modelo padre (actor congelado, IDQL): https://huggingface.co/mulligan/sim-square-broad-r02-sobol-free-cf-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Portal del proyecto: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset DAgger ronda 01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-sobol-free-cf
- Dataset de rollouts de política ronda 01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset DAgger ronda 02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-sobol-free-cf
- Dataset de rollouts de política ronda 02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relevantes sobre este modelo.
