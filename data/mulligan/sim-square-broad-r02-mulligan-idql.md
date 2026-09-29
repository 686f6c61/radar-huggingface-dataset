# mulligan/sim-square-broad-r02-mulligan-idql

## Resumen

sim-square-broad-r02-mulligan-idql es un agente de aprendizaje por refuerzo offline (offline RL) desarrollado por el equipo de Mulligan para la tarea robótica simulada `sim-square-broad`. No es un modelo de lenguaje: es una política de control basada en estado (state-based), implementada como IDQL (Implicit Diffusion Q-Learning), es decir, un actor de difusión acompañado de un crítico escalar entrenado con IQL. El repositorio publica los pesos en PyTorch (`policy.pt`) junto con los normalizadores de observaciones y acciones (`stats.json`) para cinco semillas independientes.

El modelo pertenece a la ronda R2 del brazo `mulligan` dentro de la campaña `sq_d1_r2_ours_mining_freecf_human_only`, y se entrenó hasta el paso 250001. Cada semilla se publica con su propio checkpoint y está vinculada a un artefacto de Weights & Biases concreto, con el commit de Git del código de investigación utilizado. El repositorio ocupa 1,4 GB en total (aproximadamente 280 MB por semilla, incluyendo los cinco checkpoints y sus ficheros de estadísticas).

Su relevancia es doble. Por un lado, documenta una política de manipulación con una tasa de éxito alta y medida de forma sistemática sobre una rejilla de estados iniciales held-out (30 000 rollouts por semilla). Por otro, forma parte de una infraestructura de comparación reproducible: los datasets de teleoperación, DAgger y rollouts de política están publicados, y existe un dataset de evaluación común (`sim-square-broad-r00-r03-eval`) que permite contrastar esta política con otras variantes de la misma campaña.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL (Implicit Diffusion Q-Learning): actor de difusión con crítico escalar IQL; agente de RL offline basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplicable (no procesa secuencias de texto, sino observaciones de estado del entorno) |
| Tipos de cuantizacion | no disponible; no aplicable (no se publican versiones cuantizadas, solo checkpoints PyTorch) |
| Idiomas soportados | no disponible; no aplicable (agente de control, sin entrada o salida de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`policy.pt`, pickle de PyTorch) + `stats.json` con normalizadores |
| Tarea | sim-square-broad (manipulación robótica simulada) |
| Ronda del modelo | R2 |
| Brazo | mulligan |
| Celda de campaña | `sq_d1_r2_ours_mining_freecf_human_only` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB (aproximadamente 280 MB por semilla) |
| Pipeline declarado | robotics |
| Código de entrenamiento | repositorio de investigación de Mulligan, commits `f287d9fd523f`, `b7eb874de716`, `f01386d527ed`, `29155d0f0dcb` |

## Arquitectura y entrenamiento

IDQL combina dos componentes. El actor es una política de difusión que modela la distribución de acciones, lo que permite representar políticas multimodales sin colapsarlas a una media (un problema habitual en políticas deterministas entrenadas con behavioral cloning sobre datos heterogéneos). El crítico es una Q-función escalar entrenada con Implicit Q-Learning (IQL), que evita consultar acciones fuera de la distribución del dataset y usa regresión por expectiles para aproximar el valor óptimo sin necesidad de muestrear acciones del actor durante el entrenamiento. El nombre de los artefactos de W&B (`iql_ddpg_bc_idql_square_d1_...`) sugiere que el pipeline incluye variantes de IQL, DDPG+BC e IDQL sobre la misma base de código.

Los datos de entrenamiento provienen de cinco datasets publicados por el propio equipo: teleoperación con SOBOL (`sim-square-broad-c00-teleop-sobol`), DAgger generado con la política Mulligan en dos rondas (`c01-dagger-mulligan`, `c02-dagger-mulligan`), y rollouts de política tanto de SOBOL como de Mulligan (`c01-sobol-policy-rollouts`, `c02-mulligan-policy-rollouts`). Se trata, por tanto, de un régimen de aprendizaje por refuerzo offline con mezcla de demostraciones humanas y datos on-policy agregados iterativamente mediante DAgger. La model card no especifica el número total de transiciones, la composición exacta por fuente ni si se aplicó filtrado de calidad (`mining`, `freecf` aparecen en el nombre de la celda de campaña, pero sin detalle). Tampoco se documenta ninguna innovación adicional más allá del propio esquema actor de difusión + crítico IQL.

## Capacidades

- Control robótico de manipulación en simulación para la tarea `sim-square-broad`, a partir de observaciones de estado (no de imágenes).
- Generación de acciones multimodales mediante muestreo de difusión, lo que permite representar distintas estrategias válidas ante un mismo estado.
- Ejecución de políticas entrenadas con datos heterogéneos (teleoperación humana más rollouts de políticas previas) sin colapso a la media del dataset.
- Evaluación determinista y reproducible: cinco semillas independientes permiten medir varianza entre entrenamientos.
- Integración con el ecosistema de evaluación de Mulligan (Policy Arena) y con el dataset de evaluación `sim-square-broad-r00-r03-eval`.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión, audio ni modo de razonamiento explícito: esas capacidades no aplican a un agente de control basado en estado.

## Casos de uso

- Investigación en RL offline: usar los cinco checkpoints como línea base reproducible para comparar nuevos algoritmos (IQL, DQL, Diffusion Policy, TD3+BC) sobre exactamente los mismos datos y la misma rejilla de evaluación held-out.
- Estudio de multimodalidad de políticas: al ser un actor de difusión, permite analizar si la política mantiene modos de acción distintos o se concentra en uno, comparándolo con variantes deterministas del mismo pipeline.
- Análisis de varianza entre semillas: las tasas de éxito por semilla (81,8 %–82,8 %) permiten cuantificar la estabilidad del método frente a la inicialización aleatoria antes de invertir en más entrenamientos.
- Inicialización de políticas para DAgger: el checkpoint R2 puede servir como política base para generar nuevos rollouts y alimentar una ronda posterior de agregación de datos, replicando el esquema c00 → c01 → c02 del propio repositorio.
- Banco de pruebas de simulación a escala: con 30 000 rollouts por semilla ya ejecutados, es un punto de partida para medir coste de evaluación, paralelización y throughput del simulador antes de escalar a otras tareas.
- Reproducción de experimentos: los artefactos incluyen el commit de Git y el identificador del artefacto de W&B, lo que permite reconstruir el pipeline de entrenamiento exacto en un entorno de investigación.
- Docencia en RL offline: servir de ejemplo completo y con licencia MIT de un pipeline IDQL con datos mixtos, evaluación por rejilla de estados iniciales y publicación de checkpoints.

## Benchmarks y rendimiento

La model card publica una evaluación sobre una rejilla de estados iniciales held-out, con 30 000 rollouts por semilla (dataset `sim-square-broad-r00-r03-eval`). Se reproduce a continuación, añadiendo la tasa de éxito calculada a partir de los conteos publicados:

| Semilla | Dataset de evaluacion | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-broad-r00-r03-eval | 30000 | 24664 | 82,21 % |
| seed-2 | sim-square-broad-r00-r03-eval | 30000 | 24829 | 82,76 % |
| seed-3 | sim-square-broad-r00-r03-eval | 30000 | 24547 | 81,82 % |
| seed-4 | sim-square-broad-r00-r03-eval | 30000 | 24601 | 82,00 % |
| seed-5 | sim-square-broad-r00-r03-eval | 30000 | 24587 | 81,96 % |
| Media (calculada) | sim-square-broad-r00-r03-eval | 150000 | 123228 | 82,15 % |

No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros algoritmos (por ejemplo, MMLU, HumanEval o GSM8K no aplican a este tipo de modelo). Las tasas anteriores son la unica metrica de rendimiento documentada, y corresponden a exito en la tarea de simulacion, no a capacidades de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de escala, el repositorio completo ocupa 1,4 GB para cinco semillas, es decir, aproximadamente 280 MB por checkpoint; el modelo es un agente basado en estado y no requiere el presupuesto de memoria de un transformer de gran tamano. La cifra exacta depende de la dimension de la red del actor y del critico, que la model card no detalla.
- GPU recomendadas: no disponible. Dado el tamano del checkpoint, el cuello de botella realista en evaluacion es el simulador (30 000 rollouts por semilla), no la inferencia del modelo; el paralelismo del simulador determina el hardware necesario.
- Compatibilidad con GPU de consumo: probable en cualquier GPU consumer actual e incluso en CPU, segun el tamano del checkpoint; se trata de una estimacion derivada del tamano del repositorio, no de un requisito publicado.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) junto con `stats.json` para normalizar observaciones y acciones, usando el codigo de investigacion de Mulligan en los commits indicados. No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ya que esas herramientas estan orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la informacion proporcionada. La comparacion siguiente es cualitativa y se limita a la categoria de algoritmo y al formato de publicacion; los campos sin dato figuran como no disponible.

| Modelo / algoritmo | Categoria | Parametros | Contexto | Rendimiento en sim-square-broad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r02-mulligan-idql (este modelo) | RL offline, actor de difusion + critico IQL escalar | no disponible | no aplica (entrada de estado) | 82,15 % de exito medio (5 semillas, 150 000 rollouts) | MIT | Checkpoints PyTorch en HuggingFace |
| IQL puro (sin actor de difusion) | RL offline, expectile regression | no disponible | no aplica | no disponible | depende de la implementacion | Codigo de referencia publico, sin checkpoints de esta tarea |
| Diffusion Policy con behavioral cloning | Imitacion supervisada con actor de difusion | no disponible | no aplica | no disponible | depende de la implementacion | Codigo de referencia publico; no hay checkpoint equivalente en esta campana |
| DDPG+BC | RL offline / imitacion con actor determinista | no disponible | no aplica | no disponible | depende de la implementacion | Aparece en la nomenclatura de los artefactos de W&B, sin checkpoint publicado en este repositorio |

## Limitaciones y advertencias

- Dominio cerrado: la politica esta entrenada exclusivamente para la tarea `sim-square-broad` en simulacion. No hay evidencia publicada de transferencia a un robot real ni a otras tareas.
- Sin resultados comparativos: no se publican numeros frente a otras variantes de la misma campana ni frente a la literatura, por lo que no es posible situar la tasa de exito del 82,15 % en un contexto relativo.
- Dependencia de los normalizadores: `stats.json` es imprescindible; cargar `policy.pt` sin aplicar la normalizacion correcta produce acciones invalidas silenciosamente.
- Riesgo de seguridad al cargar pesos: la propia model card advierte que los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en entornos de confianza.
- Trazabilidad limitada a un paso de entrenamiento: solo se publica el checkpoint del paso 250001, sin curvas de aprendizaje ni checkpoints intermedios, lo que impide analizar la evolucion del rendimiento o diagnosticar sobreajuste.
- Varianza entre semillas reducida pero no nula: el rango observado (81,82 %–82,76 %) es estrecho, pero se limita a cinco semillas; no hay intervalos de confianza ni analisis estadistico publicados.
- Idiomas y capacidades de lenguaje: no aplicables. Este modelo no genera texto, no soporta tool calling y no puede usarse en ninguna tarea de procesamiento de lenguaje natural.
- Ausencia de documentacion de sesgos: no se documentan sesgos de la politica (por ejemplo, dependencia de la distribucion de estados iniciales de la rejilla de evaluacion) ni limitaciones de generalizacion fuera de esa rejilla.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia ni soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-mulligan-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset DAgger ronda 1: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mulligan
- Dataset de rollouts SOBOL ronda 1: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset DAgger ronda 2: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mulligan
- Dataset de rollouts Mulligan ronda 2: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre el proyecto Mulligan; los unicos resultados obtenidos correspondian a sitios sin relacion con el contenido. No se han localizado papers, blogs ni demos adicionales.
