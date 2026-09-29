# mulligan/sim-square-broad-r02-mining-no-cf-idql

## Resumen

`mulligan/sim-square-broad-r02-mining-no-cf-idql` es un agente de control robótico basado en estados, no un modelo de lenguaje. Se trata de una implementación del algoritmo IDQL (Implicit Q-Learning as an Actor-Critic method with diffusion policies): un actor de difusión acompañado de un crítico IQL escalar. El modelo resuelve la tarea de simulación `sim-square-broad` dentro de la campaña de investigación Mulligan, y se publica como checkpoint de PyTorch (`policy.pt`) junto con los normalizadores (`stats.json`) por cada semilla.

El repositorio lo mantiene el usuario `mulligan` y pertenece a la ronda R2, brazo `mining-no-cf`, celda de campaña `sq_d1_r2_ours_mining_nocf_human_only`. Incluye cinco semillas independientes (1 a 5), todas entrenadas hasta el paso 250001, lo que permite evaluar la varianza entre ejecuciones de un mismo pipeline. El tamaño total del repositorio es de 1,4 GB y la licencia es MIT, lo que facilita su reutilización y su integración en pipelines de investigación.

Su relevancia es de tipo metodológico: forma parte de un esfuerzo por publicar artefactos de aprendizaje por refuerzo offline con trazabilidad completa (artefactos de Weights & Biases, commits de Git, comprobaciones MD5 y SHA-256), algo poco habitual en el ecosistema de robótica. Está pensado para investigadores que quieran reproducir resultados, servir de línea base frente a otros brazos de la misma campaña o partir de una política preentrenada para iteraciones posteriores de DAgger o minería de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor-crítico IDQL: actor de difusión (diffusion policy) más crítico IQL escalar |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (política de control basada en estados; ventana de historia no disponible) |
| Tipos de cuantización | no disponible (se distribuyen checkpoints PyTorch en la precisión de entrenamiento) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, serializado como pickle) más `stats.json` con normalizadores |
| Tarea | `sim-square-broad` (simulación) |
| Ronda y brazo | R2, `mining-no-cf` |
| Celda de campaña | `sq_d1_r2_ours_mining_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema IDQL: el actor es una política de difusión que genera acciones mediante un proceso de denoising iterativo, mientras que el crítico es un estimador de valor IQL entrenado con regresión por expectil, sin consultar acciones fuera de la distribución de datos. La combinación permite un actor expresivo (difusión) sin necesidad de evaluar el crítico sobre acciones generadas, lo que reduce la inestabilidad típica de los métodos actor-crítico en régimen offline. Según la model card, el agente es "state-based", es decir, consume observaciones de estado de baja dimensión en lugar de píxeles, aunque la composición exacta del vector de observación no se detalla.

Los datos de entrenamiento provienen de cinco conjuntos publicados por la misma organización: `sim-square-broad-c00-teleop-sobol` (teleoperación), `sim-square-broad-c01-dagger-mining-no-cf` y `sim-square-broad-c02-dagger-mining-no-cf` (rondas de DAgger con minería), y `sim-square-broad-c01-sobol-policy-rollouts` y `sim-square-broad-c02-mulligan-policy-rollouts` (rollouts de políticas previas). No se especifica el número total de transiciones ni la composición porcentual del dataset. Tampoco se documenta el uso de RLHF ni de DPO, algo esperable por tratarse de un agente de control y no de un modelo generativo de texto. La innovación destacable es de procedencia y reproducibilidad: los ficheros son copias byte a byte de los artefactos de Weights & Biases listados, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`, con el commit de Git de cada ejecución indicado.

## Capacidades

- Generación de acciones de control para la tarea simulada `sim-square-broad` a partir de observaciones de estado de baja dimensión.
- Muestreo de acciones mediante un actor de difusión, con la consiguiente posibilidad de obtener políticas multimodales en lugar de una única acción determinista.
- Normalización de entradas y salidas incluida en el propio repositorio mediante `stats.json`, lo que simplifica la integración en un bucle de evaluación.
- Cinco semillas independientes que permiten medir la variabilidad del pipeline de entrenamiento y construir intervalos de confianza en la evaluación.
- Punto de partida reutilizable para rondas posteriores de DAgger o de minería de datos dentro de la misma campaña.
- No admite tool calling ni function calling.
- No incorpora capacidades de agente, planificación multi-paso ni razonamiento simbólico.
- No soporta capacidades multilingües.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta soporte multimodal de ningún tipo.

## Casos de uso

- Línea base de aprendizaje por refuerzo offline: usar los cinco checkpoints como referencia de rendimiento para comparar nuevas variantes del algoritmo sobre `sim-square-broad`, aprovechando que el paso de entrenamiento (250001) y los datos de origen están fijados y son idénticos entre semillas.
- Investigación en bucles de auto-mejora con DAgger: el brazo `mining-no-cf` está diseñado para iteraciones de recolección de datos guiadas por minería, de modo que estos pesos pueden actuar como política inicial que genere rollouts para la siguiente ronda de agregación de datos.
- Evaluación comparativa en Policy Arena: el proyecto publica evaluaciones en `arena.mulligan.page`, por lo que el checkpoint puede enviarse o contrastarse contra otros brazos de la misma campaña para estudiar el efecto de las decisiones de diseño del dataset.
- Reproducción de resultados publicados: al incluir los commits de Git, los artefactos de W&B y los hashes MD5 y SHA-256, sirve para verificar la reproducibilidad de un experimento de RL offline en un entorno académico o industrial.
- Estudio de robustez ante distribuciones iniciales amplias: la tarea se denomina `sim-square-broad`, lo que sugiere una distribución amplia de configuraciones iniciales; la política permite medir la generalización frente a condiciones de partida variadas dentro del simulador.
- Aprendizaje por imitación y comparación de algoritmos: al ser un agente IDQL basado en estados, se puede contrastar de forma directa con políticas de behavior cloning puras o con variantes IQL sin actor de difusión, reutilizando los mismos conjuntos de datos públicos.
- Generación de datos sintéticos de política: los rollouts producidos por estos checkpoints pueden emplearse como datos adicionales para entrenar otros agentes, algo coherente con la existencia del conjunto `sim-square-broad-c01-sobol-policy-rollouts`.
- Referencia en simulación para investigación en transferencia sim-to-real: aunque el modelo no incluye validación en hardware real, una política entrenada en simulación puede usarse como punto de partida para estudios de brecha de realidad, siempre con la advertencia de que no hay evidencia de transferencia documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, retorno medio ni comparaciones numéricas con otros agentes. El repositorio menciona que este modelo está referenciado por los metadatos del conjunto de evaluación `mulligan/sim-square-broad-r00-r03-eval`, pero no se proporcionan las métricas asociadas en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con un repositorio de 1,4 GB repartido entre cinco semillas, cada checkpoint ocupa del orden de 280 MB si la distribución es uniforme (cálculo propio a partir del tamaño del repositorio), pero se desconoce la arquitectura interna del actor de difusión y del crítico, por lo que no se puede convertir ese tamaño en una cifra fiable de VRAM.
- GPU recomendadas: no hay recomendaciones publicadas. Por el tamaño del artefacto y el carácter state-based del agente, es plausible ejecutarlo en GPU de gama media o incluso en CPU, pero esta afirmación es una estimación y no un dato verificado.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o más de VRAM si el checkpoint entra completo en memoria, sin confirmación por parte del autor.
- Opciones de despliegue: PyTorch con carga directa del `.pt` y de `stats.json`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste por acción depende del número de pasos de denoising del actor de difusión, que no se especifica en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el material proporcionado. No se han publicado especificaciones, parámetros ni métricas de otros agentes de la misma tarea que permitan construir una comparación rigurosa. Las etiquetas del repositorio mencionan otros brazos y rondas de la misma campaña (`mining-no-cf`, `sobol`, `mulligan`, rondas R0 a R3), pero no se aportan sus fichas técnicas ni sus resultados, por lo que no es posible tabular diferencias de parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con datos de teleoperación y de políticas previas, la política hereda las preferencias y los sesgos de comportamiento de esas demostraciones, pero no hay análisis publicado al respecto.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que no genera texto. Sí existe el riesgo equivalente de producir acciones no válidas o fuera de distribución cuando el estado observado se aleja de los datos de entrenamiento.
- Limitaciones de contexto o idioma: no aplica el concepto de ventana de contexto de lenguaje. El modelo es específico de la tarea `sim-square-broad` y de su espacio de observación; no es transferible directamente a otras tareas sin reentrenamiento.
- Alcance de la tarea: es un agente de simulación. No hay evidencia documentada de funcionamiento en un robot físico ni de robustez frente a ruido sensorial real.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia. No se imponen restricciones adicionales conocidas.
- Seguridad en la carga: los ficheros `.pt` son serializaciones pickle de PyTorch y la propia model card advierte de que deben cargarse únicamente en entornos de confianza, ya que el proceso de deserialización puede ejecutar código arbitrario.
- Reproducibilidad: las semillas 1 y 2 comparten el commit `f287d9fd523f`, mientras que las semillas 3, 4 y 5 usan commits distintos (`b7eb874de716`, `e2aa8f858c00` y `d9730bd99f37`), lo que implica que el código no es idéntico entre todas las ejecuciones y debe tenerse en cuenta al interpretar la varianza entre semillas.
- Madurez: el repositorio registra cero descargas y cero "likes" en el momento de la consulta, y fue creado el 28 de septiembre de 2026, con actualización posterior el mismo día. No hay evidencia de uso independiente ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-mining-no-cf-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset DAgger ronda 01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mining-no-cf
- Dataset de rollouts de política ronda 01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset DAgger ronda 02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mining-no-cf
- Dataset de rollouts de política ronda 02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts
- Dataset de evaluación que referencia al modelo: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset relacionado, variante DAgger Mulligan: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mulligan
- Dataset relacionado, rollouts de política IQL: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts

Nota: el resto de resultados de la búsqueda web (calendario de lanzamientos de modelos, noticias sobre OpenAI y sobre Meta) no guardan relación con este modelo y se han descartado.
