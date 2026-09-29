# mulligan/sim-square-narrow-r01-sobol-free-cf-divl

## Resumen

sim-square-narrow-r01-sobol-free-cf-divl es una política de control robótico entrenada para la tarea de simulación `sim-square-narrow`, una variante estrecha de una tarea de ensamblaje tipo NutAssemblySquare. No es un modelo de lenguaje ni un modelo multimodal: es un agente basado en estado (state-based), es decir, consume observaciones vectoriales del entorno y produce acciones de control, sin cámara ni entrada de imagen. Lo publica el usuario `mulligan` como parte del marco de investigación Mulligan, con evaluación pública en Policy Arena.

Técnicamente, el checkpoint combina un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r01-sobol-free-cf-idql`, con un crítico DIVL de naturaleza distribucional. Se trata por tanto de una variante de la familia de métodos actor-crítico off-policy que el propio nombre de los artefactos de entrenamiento identifica como `iql_ddpg_bc_idql_divl`. El resultado es un artefacto de 1,4 GB que contiene cinco semillas independientes (seed-1 a seed-5), cada una en su propia carpeta, más un fichero `stats.json` con estadísticas de normalización.

Su relevancia es fundamentalmente metodológica: permite comparar el efecto de sustituir el crítico del modelo padre por un crítico distribucional manteniendo el actor fijo, algo poco habitual en publicaciones de este tipo. La evaluación sobre una rejilla de estados iniciales held-out con 8.000 rollouts por semilla arroja una tasa de éxito media del 91,49 %, con una variabilidad entre semillas de aproximadamente 3,4 puntos porcentuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusión congelado (heredado del modelo padre) más crítico DIVL distribucional; agente basado en estado, sin entrada visual |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica; horizonte de episodio no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; consume observaciones vectoriales) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickle) más `stats.json` |
| Tarea | sim-square-narrow |
| Ronda del modelo | R1 |
| Brazo experimental | sobol-free-cf |
| Celda de campana | `sq_d0_r1_ours_sobol_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamaño del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

El agente sigue el esquema de actor-crítico con actor de difusión: un actor que genera acciones mediante un proceso de difusión y un crítico que estima valor. En este release concreto el actor no se reentrena, sino que se congela y se reutiliza el del modelo `sim-square-narrow-r01-sobol-free-cf-idql`; lo que cambia es el crítico, que pasa a ser un crítico DIVL distribucional. Esa separación permite aislar el efecto del crítico sobre el rendimiento final. El número de pasos de difusión, la dimensionalidad de las observaciones y el tamaño exacto de las redes no se detallan en la información disponible.

El nombre de los artefactos de entrenamiento (`iql_ddpg_bc_idql_divl_nutassemblysquare`) indica que el pipeline cubre varias familias de métodos off-policy —IQL, DDPG+BC e IDQL— junto con DIVL, y que la tarea base del entorno es NutAssemblySquare de RoboSuite. El entrenamiento se ejecuta durante 150.001 pasos y se replica con cinco semillas (1 a 5), cada una registrada como artefacto de W&B independiente con el mismo commit de código `3053203fc3df`.

Los datos de entrenamiento proceden de tres conjuntos: `sim-square-narrow-c00-teleop-sobol` (demostraciones de teleoperación con muestreo Sobol), `sim-square-narrow-c01-dagger-sobol-free-cf` (iteraciones DAgger sobre esa base) y `sim-square-narrow-c01-sobol-policy-rollouts` (rollouts de la propia política, 100 episodios de observaciones solo de estado, sin cámara). No se documenta en la información disponible el número total de transiciones, la composición proporcional del dataset ni el uso de RLHF o DPO, que en cualquier caso no aplican a este tipo de modelo.

## Capacidades

- Generación de acciones de control continuas para la tarea de ensamblaje simulado `sim-square-narrow`, a partir de observaciones de estado.
- Ejecución de la tarea desde una rejilla de estados iniciales held-out, con tasas de éxito del 89,5 % al 92,9 % según semilla.
- Muestreo estocástico de acciones mediante el actor de difusión, lo que permite diversidad de trayectorias entre rollouts.
- Estimación de valor distribucional por parte del crítico DIVL, utilizable para análisis de incertidumbre durante el entrenamiento.
- Reproducción de resultados con cinco semillas independientes, lo que permite calcular intervalos de variabilidad.
- Generación de datos de política (rollouts) susceptibles de alimentar nuevas iteraciones de DAgger o de minería de datos.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes conversacionales, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo de razonamiento explícito, visión, audio ni cualquier otra modalidad distinta del estado vectorial.

## Casos de uso

- Comparación controlada de críticos en investigación de aprendizaje por refuerzo: al compartir actor con `sim-square-narrow-r01-sobol-free-cf-idql`, permite medir de forma aislada el efecto de un crítico distribucional frente a uno convencional.
- Línea base en experimentos de imitación y RL offline: sirve como referencia reproducible con cinco semillas para evaluar métodos nuevos sobre la tarea `sim-square-narrow`.
- Generación de datos sintéticos de política: los rollouts del agente pueden volcarse a un dataset para alimentar rondas posteriores de DAgger, tal como se hizo en la ronda c01.
- Validación previa a transferencia a hardware real: la evaluación sobre rejilla held-out con 8.000 episodios por semilla da una estimación de robustez antes de arriesgar un montaje físico.
- Auditoría de robustez frente a condiciones iniciales: la rejilla de 32 estados iniciales permite identificar en qué configuraciones de partida falla el agente y con qué frecuencia.
- Estudio de variabilidad entre semillas: la presencia de cinco checkpoints independientes permite cuantificar la dispersión del rendimiento (de 89,5 % a 92,9 %) y decidir si un método es estable.
- Integración en un pipeline de auto-mejora: el artefacto encaja en un bucle de minería de datos tipo `square-dagger-mining` que selecciona episodios y reentrena políticas.
- Docencia y reproducción de resultados: al ser un artefacto pequeño y con licencia MIT, es apto para prácticas de RL offline en simulación sin necesidad de clúster.

## Benchmarks y rendimiento

El único dato de rendimiento disponible es la evaluación del autor sobre una rejilla de estados iniciales held-out, con 32 estados iniciales y 8.000 rollouts por semilla (250 rollouts por estado inicial), registrada en el dataset `sim-square-narrow-r00-r03-eval`.

| Semilla | Estados iniciales (N) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 8000 | 7161 | 89,51 % |
| seed-2 | 32 | 8000 | 7431 | 92,89 % |
| seed-3 | 32 | 8000 | 7347 | 91,84 % |
| seed-4 | 32 | 8000 | 7257 | 90,71 % |
| seed-5 | 32 | 8000 | 7398 | 92,48 % |
| Media | 32 | 40000 | 36594 | 91,49 % |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a este tipo de modelo. Tampoco se proporcionan métricas de recompensa media, longitud de episodio ni tasas de éxito de los modelos de referencia de la misma campaña.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. Al tratarse de un agente basado en estado y no de un transformer de lenguaje, la huella en memoria es reducida; el repositorio completo, con cinco semillas y estadísticas, ocupa 1,4 GB, lo que supone aproximadamente 0,28 GB por semilla incluyendo posibles estados de optimizador.
- GPU recomendadas: no disponible. Cualquier GPU CUDA moderna es suficiente; el modelo no requiere memoria de GPU significativa y puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí, incluidas tarjetas de gama media y baja, dado el tamaño del artefacto. No hay confirmación explícita en la información disponible.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `policy.pt`, acompañado de `stats.json`). No aplican servidores de inferencia para modelos de lenguaje como vLLM, TGI, Ollama o llama.cpp, al no tratarse de un modelo generativo de texto.
- Latencia y throughput: no disponibles. El coste por acción depende del número de pasos de difusión del actor, que no se especifica; conviene medirlo en el entorno de destino antes de cualquier despliegue en tiempo real.
- Advertencia de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza, tal como indica el propio autor.

## Comparativa con modelos similares

| Modelo | Relacion | Actor | Critico | Semillas | Tasa de exito | Licencia |
|---|---|---|---|---|---|---|
| sim-square-narrow-r01-sobol-free-cf-divl | Este modelo | Difusion congelado | DIVL distribucional | 1-5 | 91,49 % (media) | MIT |
| sim-square-narrow-r01-sobol-free-cf-idql | Modelo padre; aporta el actor congelado | Difusion congelado | IDQL | no disponible | no disponible | MIT |
| Familia sim-square-narrow r00-r03 | Conjunto de referencia de la campana | no disponible | no disponible | no disponible | no disponible (evaluados en el mismo dataset) | no disponible |

Comparativas con alternativas externas: no disponible. La información proporcionada solo cubre modelos de la propia campaña Mulligan y no incluye métricas de rendimiento de los otros artefactos, por lo que no es posible establecer una comparación cuantitativa más allá de la identidad de actor entre este modelo y su padre.

## Limitaciones y advertencias

- Especialización extrema: el agente está entrenado exclusivamente para `sim-square-narrow` y no generaliza a otras tareas, entornos o morfologías sin reentrenamiento.
- Entrada solo de estado: no procesa imágenes ni otro tipo de observaciones sensoriales, lo que limita su aplicabilidad directa a configuraciones con cámara.
- Riesgo de fallo en producción: aunque la tasa media de éxito es del 91,49 %, entre el 7,1 % y el 10,5 % de los rollouts fallan según la semilla, suficiente para requerir mecanismos de recuperación en un sistema real.
- Variabilidad entre semillas de 3,4 puntos porcentuales, lo que obliga a evaluar con múltiples semillas antes de extraer conclusiones.
- Sesgos conocidos: no disponibles. No se documenta análisis de sesgo, y en este dominio el concepto se traduce en sesgo hacia los estados iniciales y las trayectorias presentes en los datos de teleoperación y DAgger.
- Riesgo de alucinación: no aplica a un modelo de lenguaje, pero sí existe el fenómeno análogo de ejecutar acciones plausibles que no completan la tarea; los datos de evaluación reflejan que ocurre en torno al 8,5 % de los casos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. Conviene verificar las licencias de los datasets asociados, que pueden diferir (el dataset de teleoperación figura como Apache 2.0).
- Riesgo de seguridad al cargar los pesos: los `.pt` son pickles y pueden ejecutar código arbitrario; deben cargarse solo desde el repositorio oficial o en entornos aislados.
- Sin garantía de transferencia a hardware real: toda la evidencia disponible procede de simulación, sin validación en un montaje físico.
- Mantenimiento incierto: el repositorio registra cero descargas y cero likes, y no se documenta soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-sobol-free-cf-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r01-sobol-free-cf-idql
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset de DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-sobol-free-cf
- Dataset de rollouts de política: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Arena de evaluación de políticas: https://arena.mulligan.page
- Ficha del dataset de rollouts en claru.ai: https://claru.ai/datasets/mulligan-sim-square-narrow-c01-sobol-policy-rollouts
