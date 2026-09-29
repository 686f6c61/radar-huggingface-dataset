# mulligan/sim-square-narrow-r03-mulligan-repair-no-r3roll-divl

## Resumen

El modelo `mulligan/sim-square-narrow-r03-mulligan-repair-no-r3roll-divl` es un agente de control robótico basado en estado (sin observaciones visuales) entrenado para la tarea `sim-square-narrow`, una variante estrecha de la tarea de ensamblaje de una pieza cuadrada (NutAssemblySquare) en el dominio simulado de robosuite. Lo publica la organización `mulligan` como parte de su infraestructura de investigación Mulligan, con evaluaciones alojadas en Policy Arena y los datasets asociados en su organización de HuggingFace.

Técnicamente no es un modelo de lenguaje: es una política de aprendizaje por refuerzo compuesta por un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r03-mulligan-repair-no-r3roll-idql`, y un crítico DIVL distribucional entrenado en esta ronda. El repositorio contiene un único checkpoint por semilla (`policy.pt` y `stats.json`), con cinco semillas (1 a 5), en el paso de entrenamiento 150001.

Su relevancia es la de un artefacto de investigación reproducible en RL offline/online para manipulación: documenta el pipeline de auto-mejora con DAgger sobre varios ciclos de datos (c00 a c03), registra la procedencia byte a byte frente a los artefactos de Weights & Biases y publica resultados de evaluación sobre un grid de estados iniciales retenido, con tasas de éxito entre el 95,65 % y el 98,01 % según semilla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor de difusión congelado (heredado del modelo padre) más crítico DIVL distribucional; agente basado en estado, sin percepción visual |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; la entrada es el vector de estado de la simulación, no una secuencia de texto) |
| Tipos de cuantización | no disponible (los pesos se distribuyen como pickles de PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) más `stats.json` de normalización por semilla |
| Tarea | `sim-square-narrow` (ensamblaje cuadrado, variante estrecha) |
| Ronda del modelo | R3 |
| Brazo experimental | `mulligan-repair-no-r3roll` |
| Celda de campaña | `sq_d0_r3_repair_ours_grid_cell_bonus_b1p0_freecf_human_only_no_r3roll` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamaño del repositorio | 1,4 GB (estimación aproximada de 280 MB por semilla, incluyendo `policy.pt` y `stats.json`) |
| Fecha de creación | 2026-09-29 |
| Última actualización | 2026-09-29 |

## Arquitectura y entrenamiento

El agente separa dos componentes. El actor es una política de difusión que se toma congelada del modelo padre `sim-square-narrow-r03-mulligan-repair-no-r3roll-idql`, de modo que esta publicación no reentrena el generador de acciones. Sobre esa base se entrena un crítico DIVL de naturaleza distribucional, es decir, que modela la distribución del retorno en lugar de únicamente su valor esperado. La nomenclatura de los artefactos de origen (`iql_ddpg_bc_idql_divl_nutassemblysquare`) indica que el pipeline combina aprendizaje Q implícito (IQL), actor-crítico determinista con clonación de comportamiento (DDPG+BC) e IDQL implícito junto con el crítico DIVL, aunque la model card no detalla hiperparámetros ni la configuración exacta de la red.

Los datos de entrenamiento proceden de seis conjuntos publicados por el propio autor: demostraciones teleoperadas (`sim-square-narrow-c00-teleop-sobol`), agregaciones DAgger de las fases c01, c02 y c03, y rollouts de política de las fases c01 y c02. Esto configura un ciclo de auto-mejora iterativa con intervención humana o de un profesor `human_only` y sin rollouts de la ronda 3 (`no-r3roll`), tal como indica el nombre de la celda de campaña. El entrenamiento se detiene en el paso 150001 y se replica con cinco semillas bajo el mismo commit de código (`3053203fc3df`); los ficheros publicados son copias idénticas en bytes a los artefactos de W&B, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`. La model card no especifica número de tokens, composición exacta de los datasets, ni si se aplicaron fases adicionales de ajuste fino más allá del ciclo DAgger descrito.

## Capacidades

- Control robótico de manipulación: genera acciones de bajo nivel para completar la tarea de ensamblaje cuadrado en la variante estrecha del simulador.
- Entrada basada en estado: consume el vector de estado de la simulación (propiocepción y estado de los objetos), sin cámara ni entrada multimodal.
- Política de difusión: el actor produce acciones mediante muestreo generativo, apto para distribuciones de acción multimodales.
- Estimación distribucional del valor: el crítico DIVL permite razonar sobre la distribución del retorno, no solo sobre la media.
- Reproducibilidad multi-semilla: cinco checkpoints independientes con el mismo paso de entrenamiento y el mismo commit.
- Evaluación sobre grid de estados iniciales: los resultados publicados corresponden a un grid retenido, con 8000 rollouts por semilla.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, ni capacidades multilingües.
- No dispone de modo de razonamiento explícito, visión ni audio.

## Casos de uso

- Investigación en RL offline y online: sirve como punto de comparación reproducible para estudiar cómo un crítico distribucional afecta al rendimiento cuando el actor permanece congelado, con cinco semillas y un mismo commit de código.
- Ablación controlada de críticos: al compartir actor con el modelo padre `...-idql`, permite aislar la contribución del crítico DIVL frente a IDQL en la misma tarea y con el mismo grid de evaluación.
- Generación de datos de política para reentrenamiento: los rollouts de este agente pueden incorporarse a un nuevo ciclo DAgger, tal como se hizo con `sim-square-narrow-c02-mulligan-policy-rollouts` y `c01-sobol-policy-rollouts`.
- Profesor para destilación o clonación de comportamiento: al tratarse de un actor congelado con alto índice de éxito, es un candidato razonable para generar demostraciones con las que entrenar políticas más ligeras o con entradas reducidas.
- Banco de pruebas de infraestructura de RL: con 8000 rollouts por semilla sobre 32 estados iniciales, es útil para validar pipelines de evaluación masiva, registro de artefactos y verificación de integridad de checkpoints.
- Estudio de robustez ante condiciones iniciales: la evaluación por estado inicial permite identificar en qué regiones del grid falla el agente, información directamente utilizable para el muestreo de nuevas condiciones en el siguiente ciclo de auto-mejora.
- Inicialización para experimentos sim-to-real: puede servir como punto de partida en investigación de transferencia, con la salvedad de que al ser un agente basado en estado requiere que el entorno real proporcione una estimación de estado equivalente.
- Referencia docente en cursos de RL para robótica: ilustra un caso completo de ciclo DAgger con procedencia verificable y licencia permisiva.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son los de la evaluación sobre el grid retenido de estados iniciales, con 8000 rollouts por semilla (32 estados iniciales en el dataset de evaluación `sim-square-narrow-r00-r03-eval`). No se han publicado resultados de otros benchmarks (por ejemplo, comparativas con políticas de referencia del dominio) en la información disponible.

| Semilla | Rollouts | Éxitos | Tasa de éxito |
|---|---|---|---|
| seed-1 | 8000 | 7724 | 96,55 % |
| seed-2 | 8000 | 7680 | 96,00 % |
| seed-3 | 8000 | 7652 | 95,65 % |
| seed-4 | 8000 | 7841 | 98,01 % |
| seed-5 | 8000 | 7699 | 96,24 % |
| Media (5 semillas) | 40000 | 38596 | 96,49 % |

La variabilidad entre semillas es reducida: el rango va del 95,65 % al 98,01 %, con una desviación típica poblacional aproximada de 0,82 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada: no disponible. El número de parámetros del actor y del crítico no se publica; el repositorio completo ocupa 1,4 GB para las cinco semillas, lo que sitúa cada checkpoint en el orden de cientos de megabytes y sugiere que la inferencia es viable en hardware muy modesto, pero es una inferencia, no un dato confirmado.
- GPU recomendadas: no disponible. Por el tipo de agente (basado en estado, con actor de difusión y crítico de tamaño moderado) cabe esperar que cualquier GPU con soporte CUDA funcione, incluidas tarjetas de gama de entrada.
- Compatibilidad con GPU de consumo: probablemente sí en cualquier GPU de consumo reciente, dado el tamaño del repositorio, aunque no hay confirmación oficial.
- CPU: no hay datos publicados sobre latencia en CPU; el muestreo del actor de difusión requiere varios pasos de denoising, lo que penaliza la inferencia sin acelerador.
- Opciones de despliegue: no se documenta ninguna integración con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). El uso previsto es cargar `policy.pt` con PyTorch dentro del entorno de simulación y del código de investigación de Mulligan en el commit indicado. La exportación a TorchScript u ONNX no está documentada.
- Latencia y throughput: no disponibles. El factor limitante principal es el número de pasos de difusión del actor, que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea / dominio | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `sim-square-narrow-r03-mulligan-repair-no-r3roll-divl` (este modelo) | Actor de difusión congelado + crítico DIVL distribucional | `sim-square-narrow`, ensamblaje cuadrado en simulación | no disponible | no aplica | 96,49 % de éxito medio en 40000 rollouts (grid retenido) | MIT | HuggingFace, 5 semillas |
| `mulligan/sim-square-narrow-r03-mulligan-repair-no-r3roll-idql` (modelo padre) | Actor de difusión + crítico IDQL | misma tarea | no disponible | no aplica | no disponible en la información proporcionada | MIT (según el ecosistema del autor) | HuggingFace |
| Diffusion Policy (Chi et al.) | Política de difusión para manipulación visual | manipulación robótica con entrada visual | no disponible | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | código y pesos públicos |
| IDQL (Hansen-Estruch et al.) | IQL implícito con actor de difusión | RL offline sobre D4RL y robomimic | no disponible | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | código público |
| IQL (Kostrikov et al.) | Aprendizaje Q implícito | RL offline genérico | no disponible | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | código público |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han proporcionado resultados de esos modelos sobre `sim-square-narrow` ni cifras de parámetros de este checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo. Al tratarse de una política entrenada con datos de teleoperación y de ciclos DAgger, hereda las limitaciones de cobertura de esos datos y puede degradarse en estados iniciales fuera de la distribución del grid de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo análogo de producir acciones confiadas y erróneas cuando el estado queda fuera de la distribución soportada, sin ninguna señal de incertidumbre calibrada publicada.
- Limitación de contexto e idioma: el modelo no procesa lenguaje natural ni secuencias de texto; no tiene ventana de contexto ni capacidades multilingües.
- Ausencia de percepción visual: al ser un agente basado en estado, no puede utilizarse directamente con cámaras u observaciones de píxeles, lo que limita de forma importante su transferencia a un entorno real sin un estimador de estado añadido.
- Dominio muy restringido: está especializado en una única tarea simulada (`sim-square-narrow`) y no es un modelo de propósito general. No hay evidencia publicada de transferencia a otras tareas.
- Cobertura de la evaluación: el grid retenido contiene 32 estados iniciales. Las tasas de éxito cercanas al 96 % son sólidas dentro de ese grid, pero no garantizan el mismo rendimiento en configuraciones iniciales distintas ni ante perturbaciones no contempladas en la simulación.
- Distribución de pesos insegura por diseño: los ficheros `.pt` son pickles de PyTorch, y la propia model card advierte de que deben cargarse únicamente en un entorno de confianza, ya que la deserialización de un pickle puede ejecutar código arbitrario.
- Dependencia del código de investigación: los checkpoints se entrenaron y evaluaron con el código de Mulligan en el commit indicado; no se documenta una API de inferencia estable ni una versión publicada del entorno.
- Licencia: MIT, que permite uso comercial y modificación, pero únicamente sobre los pesos y su código asociado; no cubre posibles restricciones de los simuladores o datasets de terceros utilizados en el entrenamiento.
- Anomalía temporal: las fechas de creación y actualización del repositorio aparecen como 2026-09-29, posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el artefacto.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin reportes independientes de reproducción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-repair-no-r3roll-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-repair-no-r3roll-idql
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de demostraciones teleoperadas: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Dataset de rollouts de política c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan
- Dataset de rollouts de política c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mulligan
- Organización del autor en HuggingFace: https://huggingface.co/mulligan
- Página del proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page
- Búsqueda web: no se han encontrado enlaces adicionales relevantes. Los resultados disponibles no guardan relación con el modelo ni con el proyecto Mulligan.
