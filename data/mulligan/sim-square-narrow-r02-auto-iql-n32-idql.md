# mulligan/sim-square-narrow-r02-auto-iql-n32-idql

## Resumen

sim-square-narrow-r02-auto-iql-n32-idql es un agente de aprendizaje por refuerzo offline publicado por la organización Mulligan dentro de su campaña de investigación en robótica simulada. No es un modelo de lenguaje: es una política de control entrenada para la tarea «sim-square-narrow», que corresponde al ensamblaje de una tuerca cuadrada (NutAssemblySquare) en un entorno simulado. El agente es de tipo IDQL (Implicit Q-Learning con políticas de difusión): combina un actor de difusión con un crítico Q escalar entrenado con IQL, y consume observaciones de estado, no píxeles.

El artefacto se distribuye como un checkpoint de PyTorch (`policy.pt`) junto con ficheros `stats.json` de normalización, con cinco semillas independientes (seed-1 a seed-5) entrenadas hasta el paso 150001. El repositorio completo ocupa 1,4 GB. Forma parte de la ronda R2 del brazo «auto-iql-n32» (celda de campaña `sq_d0_r2_auto_iql_n32`) y se apoya en un pipeline iterativo de tipo DAgger que reinyecta rollouts de la propia política en el entrenamiento.

Su relevancia es acotada pero concreta: proporciona una línea base reproducible en RL offline con cinco semillas, evaluación sobre una rejilla de estados iniciales reservada y procedencia verificable (copias byte a byte de artefactos de Weights & Biases, con MD5 y SHA-256 registrados). Es material de investigación para comparar algoritmos de RL offline y políticas de difusión en manipulación, no un componente listo para producción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente IDQL: actor de difusión con crítico IQL escalar, sobre observaciones de estado (no píxeles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones de estado por paso de control) |
| Tipos de cuantización | no disponible (solo se publica el checkpoint PyTorch en la precisión de entrenamiento) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`, pickle) más `stats.json` con normalizadores; 1,4 GB el repositorio completo (cinco semillas) |

Otros datos declarados en la model card:

| Parámetro | Valor |
|---|---|
| Tarea | sim-square-narrow |
| Ronda del modelo | R2 |
| Brazo | auto-iql-n32 |
| Celda de campaña | `sq_d0_r2_auto_iql_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Commits de código | 1505a6e630ac (semillas 1 y 2), 85fab86c0ecd (semilla 3), 8a4888abdca4 (semilla 4), 8ac67ea860e3 (semilla 5) |
| Descargas / me gusta en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

IDQL es una familia de algoritmos de RL offline en la que un actor generativo de difusión modela la distribución de acciones y un crítico Q entrenado con IQL (Implicit Q-Learning) estima el valor de las acciones candidatas; el actor se guía hacia las acciones de mayor valor según el crítico en lugar de depender únicamente de la imitación. En esta publicación el agente es explícitamente «state-based», es decir, el actor de difusión opera sobre vectores de estado del simulador y no sobre imágenes. La model card no detalla dimensiones de observación ni de acción, número de capas, tamaño de la red ni número de pasos de difusión, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó durante 150001 pasos en cada una de las cinco semillas. Los nombres de los artefactos de Weights & Biases (`iql_ddpg_bc_idql_nutassemblysquare_...`) sugieren que el código de entrenamiento combina componentes de IQL, DDPG+BC e IDQL, aunque la model card no lo confirma de forma explícita. Los datos de entrenamiento proceden de tres fuentes declaradas: una línea base de teleoperación (`sim-square-narrow-c00-teleop-baseline`) y dos rondas de rollouts generados por la propia política automática (`c01-auto-iql-n32-policy-rollouts` y `c02-auto-iql-n32-policy-rollouts`), lo que configura un bucle de auto-mejora del tipo DAgger: la política recoge datos, se reentrena con ellos y vuelve a desplegarse. No se indica en la información disponible el número total de transiciones, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Control robótico de manipulación: genera acciones continuas para completar la tarea sim-square-narrow (ensamblaje de tuerca cuadrada) a partir de observaciones de estado.
- Política entrenada por RL offline: no requiere interacción en línea durante la inferencia, solo el estado actual del entorno.
- Generación de rollouts: puede ejecutarse en el simulador para producir trayectorias que alimentan rondas posteriores de entrenamiento (los datasets c02 y c03 se construyen con este tipo de rollouts).
- Reproducibilidad multi-semilla: cinco checkpoints independientes entrenados hasta el mismo paso, lo que permite medir varianza entre semillas.
- Evaluación sobre condiciones iniciales reservadas: el modelo fue evaluado en una rejilla de estados iniciales no vista durante el entrenamiento.
- Sin capacidades de lenguaje: no soporta generación de texto, razonamiento simbólico ni conversación.
- Sin tool calling ni function calling.
- Sin soporte de agentes multi-paso basados en lenguaje ni planificación con herramientas externas.
- Sin capacidades multilingües, de visión, audio o «modo pensamiento».

## Casos de uso

- Recolección de datos para entrenamiento iterativo: la política se despliega en el simulador para generar rollouts que se incorporan como nuevos datasets (`c02`, `c03`) y realimentan la siguiente ronda de entrenamiento, siguiendo el esquema DAgger observado en los nombres de los artefactos.
- Línea base reproducible en investigación de RL offline: con cinco semillas, un paso de entrenamiento fijo (150001) y commits de código identificados, sirve para comparar algoritmos alternativos bajo condiciones controladas.
- Evaluación comparativa en plataformas de referencia: el modelo está pensado para aparecer en Policy Arena, donde se pueden contrastar políticas de distintas rondas y brazos de la misma campaña.
- Estudio de políticas de difusión en control: al ser un actor de difusión sobre estados, permite analizar el efecto del número de pasos de difusión, el escalado del crítico o el equilibrio entre imitación y maximización de valor.
- Análisis de robustez y varianza entre semillas: la horquilla de éxito observada (76,76 %–80,95 %) permite estudiar la sensibilidad del algoritmo a la inicialización y a las condiciones iniciales de evaluación.
- Destilación a políticas más rápidas: en investigación, el actor de difusión puede usarse como profesor para destilar un estudiante determinista con menor coste de inferencia, útil si se busca control en tiempo real.
- Evaluación automatizada de criterios de seguridad: sirve como sujeto de pruebas en un banco de evaluación que verifique tasas de éxito y modos de fallo antes de considerar cualquier transferencia fuera del simulador.
- Generación de datos sintéticos para preentrenamiento: las trayectorias etiquetadas con resultado (éxito o fallo) pueden reutilizarse para preentrenar o filtrar políticas de la misma tarea NutAssemblySquare.

## Benchmarks y rendimiento

La model card publica una evaluación sobre una rejilla de estados iniciales reservada, con 32 estados iniciales por semilla y 8000 rollouts evaluados por semilla. Las tasas de éxito derivadas de esos recuentos son las siguientes:

| Semilla | Estados iniciales | Rollouts evaluados | Éxitos | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | 32 | 8000 | 6388 | 79,85 % |
| seed-2 | 32 | 8000 | 6358 | 79,48 % |
| seed-3 | 32 | 8000 | 6476 | 80,95 % |
| seed-4 | 32 | 8000 | 6183 | 77,29 % |
| seed-5 | 32 | 8000 | 6141 | 76,76 % |
| Media (semillas 1-5) | 32 | 8000 | 31546 | 78,87 % |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, ni comparaciones numéricas con otras políticas de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, el repositorio completo (cinco semillas) ocupa 1,4 GB, por lo que cada semilla rondaría los 280 MB; el modelo debería caber holgadamente en GPUs de consumo.
- GPUs recomendadas: no especificadas por el autor. Por tamaño del checkpoint, cualquier GPU con unos pocos gigabytes de VRAM sería suficiente para cargar la política, aunque no hay cifras oficiales.
- Viabilidad en GPU de consumo: probable según el tamaño del artefacto, pero no confirmada por el autor.
- Opciones de despliegue: no aplican herramientas de servido de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI. El checkpoint se carga directamente con PyTorch, y requiere un entorno de confianza porque los ficheros `.pt` son pickles de PyTorch.
- Dependencias adicionales: el agente necesita el entorno de simulación correspondiente a la tarea sim-square-narrow y los normalizadores de `stats.json` para preprocesar observaciones.
- Latencia y throughput: no disponibles. El coste de inferencia de un actor de difusión depende del número de pasos de difusión, dato que no se publica.

## Comparativa con modelos similares

No se han proporcionado resultados comparables de otras políticas en la información disponible.

| Modelo | Tipo | Parámetros | Contexto | Tasa de éxito | Licencia |
|---|---|---|---|---|---|
| sim-square-narrow-r02-auto-iql-n32-idql | IDQL (actor de difusión + crítico IQL) | no disponible | no aplica | 78,87 % de media (semillas 1-5) | MIT |
| Otros brazos y rondas de la campaña Mulligan (r00-r03) | no disponible | no disponible | no aplica | no disponible | no disponible |
| Políticas de referencia de la familia IQL / DDPG+BC | no disponible | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy estrecho: la política está entrenada exclusivamente para la tarea sim-square-narrow; no generaliza a otras tareas ni a variaciones del entorno sin reentrenamiento.
- Entrada basada en estado: no procesa imágenes ni observaciones visuales, lo que limita su aplicabilidad directa a plataformas reales que dependen de percepción.
- Tasa de fallo no despreciable: en torno al 21 % de los rollouts evaluados no alcanzan el éxito, con una variación entre semillas de 76,76 % a 80,95 %.
- Dependencia de la distribución de evaluación: los resultados corresponden a una rejilla de estados iniciales concreta; el rendimiento fuera de esa distribución no está documentado.
- Riesgo de sobreajuste al simulador: no hay evidencia publicada de transferencia a un robot físico ni de robustez frente a ruido, latencia o dinámicas no modeladas.
- Seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch; deben cargarse únicamente en entornos de confianza, tal y como advierte el propio autor.
- Trazabilidad limitada en cuanto a arquitectura: no se documentan dimensiones de observación y acción, tamaño de red ni hiperparámetros, lo que dificulta reproducir el entrenamiento desde cero.
- Licencia MIT: permite uso comercial y modificación con atribución, pero la licencia no cubre posibles dependencias del simulador ni las condiciones de uso de los datasets asociados.
- Idiomas y sesgos: no aplica análisis de sesgos lingüísticos, ya que el modelo no procesa lenguaje natural; el riesgo relevante es el sesgo de las demostraciones de teleoperación y de los rollouts usados para entrenar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-iql-n32-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de entrenamiento (teleoperación): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de entrenamiento (rollouts de política, ronda 1): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de entrenamiento (rollouts de política, ronda 2): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-n32-policy-rollouts
- Dataset de rollouts que referencia al modelo (ronda 3): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-iql-n32-policy-rollouts
- Dataset de evaluación con resultados por rollout: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Listado de datasets con la etiqueta sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
