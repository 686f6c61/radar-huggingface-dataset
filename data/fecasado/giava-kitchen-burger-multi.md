# fecasado/giava-kitchen-burger-multi

## Resumen

`fecasado/giava-kitchen-burger-multi` es una política de robótica (policy) entrenada con LeRobot para ejecutar una tarea de manipulación concreta en cocina: coger la espátula (turner) para trasladar la hamburguesa de la sartén al pan en el plato. No es un modelo de lenguaje ni un modelo fundacional multimodal de propósito general: es un modelo de imitación (behavior cloning) que mapea observaciones sensoriales del robot a un vector de 26 acciones motoras. Lo publica el usuario `fecasado` bajo licencia Apache-2.0, con 235.899.950 parámetros (unos 236 M) y un repositorio de 0,9 GB en formato safetensors.

El interés técnico está en su modalidad de entrada: además de dos cámaras de punto de vista del robot (`left`, `right`) y una cámara cenital/de usuario (`user`), la model card declara una cámara de seguimiento ocular (`user_gaze`), y el nombre del método —`gaze_flow_matching`— sugiere un decodificador de acciones basado en flow matching condicionado por la mirada del operador. Esto lo sitúa en la línea de investigación que usa señales humanas pasivas (gaze, atención) como contexto adicional para políticas de imitación, un área activa dentro del ecosistema LeRobot.

Es relevante ahora por dos motivos prácticos: primero, LeRobot se ha consolidado como el marco de referencia para imitation learning en robótica open source, y este repositorio es un ejemplo reproducible de entrenamiento a 150.000 pasos sobre un dataset propio; segundo, sirve como punto de partida para quien quiera evaluar si la condicionalidad por mirada aporta ventaja frente a políticas puramente visuales. Sus limitaciones son igual de relevantes: cero descargas, cero likes, ninguna evaluación en robot real publicada y un dataset de un único entorno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de imitación `gaze_flow_matching` (LeRobot); decodificador de acciones por flow matching según el nombre del método. El detalle interno de capas no está documentado en la model card |
| Parámetros totales | 235.899.950 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación de un solo paso temporal. Frecuencia de entrenamiento: 15 FPS |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, sin esquemas de cuantización documentados) |
| Idiomas soportados | No disponible / no aplica: no procesa lenguaje natural. La tarea se pasa como cadena fija en la CLI |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |
| Tipo de robot | `blueberry_ros` |
| Cámaras declaradas | `left`, `right`, `user`, `user_gaze` |
| Entrada: estado propioceptivo | `observation.state`, shape `(55,)` |
| Entrada: imágenes | `observation.images.right`, `observation.images.left`, `observation.images.user`, shape `(240, 320, 3)` cada una |
| Salida | `action`, shape `(26,)` |
| Dataset de entrenamiento | `fecasado/burger-to-plate-good-320x240` (90 episodios, 130.353 frames, 15 FPS) |
| Pasos de entrenamiento | 150.000 (batch 128, AdamW, lr 1e-4, seed 1000, LeRobot 0.6.1) |

## Arquitectura y entrenamiento

La model card identifica el método como `gaze_flow_matching`, entrenado con LeRobot 0.6.1. Se trata de una política de aprendizaje por imitación que consume en cada paso un vector de estado de 55 dimensiones más tres imágenes RGB de 240×320 y emite un vector de acción continuo de 26 dimensiones, presumiblemente el estado articular o de efector final del robot `blueberry_ros`. El término "flow matching" designa la familia de modelos generativos que aprenden un campo de velocidades entre una distribución simple y la distribución de acciones expertas; en robótica se usa como alternativa a las cabezas gaussianas de ACT o a la difusión de Diffusion Policy, con la ventaja de requerir menos pasos de muestreo. La model card no especifica el número de pasos de integración ni la arquitectura del codificador visual, por lo que esos datos deben considerarse no disponibles.

El componente diferencial es la condicionalidad por mirada: la lista de cámaras incluye `user_gaze`, y el nombre del método la sitúa en el centro del diseño. Sin embargo, la tabla de entradas solo declara tres imágenes (`left`, `right`, `user`), no una cuarta para la mirada; es plausible que la señal de gaze se codifique dentro de las 55 dimensiones de `observation.state`, pero la documentación no lo aclara y conviene verificarlo inspeccionando el checkpoint antes de reutilizarlo.

El entrenamiento se hizo sobre 90 episodios y 130.353 frames a 15 FPS (aproximadamente 2,4 horas de datos efectivos) de una única tarea: "Pick up the turner to move the burger patty from the pan to the bread on the plate". No hay constancia de RLHF, DPO ni de fases de refinamiento posteriores; es behavior cloning puro sobre demostraciones, con 150.000 pasos y batch de 128. No se documentan aumentos de datos, composición del dataset más allá del recuento de episodios, ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de acciones motoras continuas de 26 dimensiones a partir de observaciones multimodales (estado propioceptivo de 55 dimensiones + tres vistas RGB).
- Ejecución de una tarea de manipulación específica de cocina: trasladar una hamburguesa de la sartén al pan con una espátula.
- Fusión de múltiples cámaras: punto de vista izquierdo, derecho y de usuario, lo que aporta información complementary sobre la escena y reduce la oclusión.
- Condicionalidad por señal de mirada (`user_gaze`), según el nombre del método y la lista de cámaras declarada.
- Control reactivo a 15 FPS, adecuado para lazos de control de baja/media frecuencia en manipulación doméstica.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes, planificación simbólica ni descomposición de tareas.
- No tiene capacidades de código, matemáticas, visión general (VQA), audio ni modo "thinking".
- No tiene capacidades multilingües: no procesa instrucciones en lenguaje natural; la tarea es un identificador fijo.
- No se documenta generalización a objetos, posiciones o tareas distintas de la entrenada.

## Casos de uso

- **Automatización de una estación de cocina de laboratorio**: la política ejecuta el ciclo sartén→pan de forma autónoma a 15 FPS, con `lerobot-rollout --strategy.type=base --duration=60`. Es adecuada porque el modelo está entrenado exactamente para esa secuencia y robot, sin necesidad de planificación simbólica.
- **Punto de partida para fine-tuning en tareas culinarias similares**: con `lerobot-train --policy.type=gaze_flow_matching --policy.repo_id=<nuevo>` se puede reentrenar sobre un dataset propio del mismo robot, reutilizando los 236 M de parámetros como inicialización en lugar de partir de cero.
- **Investigación sobre condicionalidad por mirada en imitation learning**: permite hacer ablaciones (entrenar la misma arquitectura sin `user_gaze` y comparar tasas de éxito) para medir cuantitativamente si la señal de atención humana aporta ventaja frente a políticas puramente visuales.
- **Generación de datos y aumento de datasets**: usar la política como generador de trayectorias candidatas en un simulador o en el robot real para filtrar después las ejecuciones exitosas y ampliar `burger-to-plate-good-320x240` más allá de los 90 episodios actuales.
- **Teleoperación asistida / shared autonomy**: integrarla como política de referencia que propone acciones mientras un operador humano supervisa, aprovechando que la mirada del usuario ya forma parte del espacio de observación.
- **Validación de pipelines de despliegue LeRobot**: sirve como banco de pruebas para medir latencia de inferencia, throughput de `lerobot-rollout` y compatibilidad de versiones (fue entrenada con LeRobot 0.6.1) antes de invertir en modelos mayores.
- **Docencia y prototipos en robótica**: por tamaño (236 M, repo de 0,9 GB) y licencia Apache-2.0, es viable en un laboratorio universitario con una GPU de gama media para demostrar el ciclo completo grabar→entrenar→desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", e incluye una plantilla de tabla de éxito (tareas, ensayos, éxitos, tasa) sin rellenar. No existen datos de MMLU, HumanEval, GSM8K ni de tasa de éxito en robot real, y estos últimos son los únicos relevantes para una política de manipulación.

| Métrica | Valor |
|---|---|
| Tasa de éxito en robot real | No disponible |
| Número de ensayos documentados | No disponible |
| MMLU / HumanEval / GSM8K | No aplica (no es un modelo de lenguaje) |
| Latencia de inferencia medida | No disponible |

## Requisitos de hardware

- **VRAM estimada (cálculo a partir de los 235,9 M de parámetros)**: ~0,95 GB solo para pesos en FP32; ~0,47 GB en FP16/BF16; ~0,24 GB en INT8. Sumando activaciones de tres flujos visuales a 240×320 y el grafo de flow matching, una estimación razonable de inferencia es de 2-3 GB en FP32 y 1,5-2 GB en FP16. Son estimaciones, no mediciones publicadas.
- **GPU recomendadas**: cualquier GPU con 8 GB o más sirve para inferencia (RTX 3060 Ti, RTX 4060, RTX 3070). Para reentrenamiento con batch 128 a 150.000 pasos, se recomienda 24 GB o más (RTX 3090, RTX 4090, A5000) o una A100/H100 si se busca reducir el tiempo de entrenamiento.
- **¿Cabe en GPU de consumo?**: sí, holgadamente. El checkpoint de 0,9 GB y los 236 M de parámetros permiten inferencia en GPUs de 6-8 GB e incluso en CPU, aunque a 15 FPS el margen temporal es de 66,7 ms por paso y la CPU puede no sostenerlo.
- **Opciones de despliegue**: `lerobot-rollout` (script oficial de la model card) sobre PyTorch; el resto del stack LeRobot para entrenamiento (`lerobot-train`). No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, que no aplican a políticas de acción continua.
- **Latencia y throughput**: no publicados. El límite superior viene impuesto por la frecuencia del dataset (15 FPS → 66,7 ms por inferencia) y por la frecuencia de las cámaras configuradas en el ejemplo de la model card (30 FPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Salida | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `fecasado/giava-kitchen-burger-multi` | 235.899.950 | estado (55,) + 3 imágenes 240×320 | acción (26,) | Apache-2.0 | No |
| `fecasado/giava-kitchen-burger-fpv` | No disponible | No disponible (variante FPV del mismo autor) | No disponible | No disponible | No disponible |
| `fecasado/gfm-kitchen-burger-23a` | No disponible | No disponible (misma familia `gaze_flow_matching`) | No disponible | No disponible | No disponible |
| ACT (implementación de referencia en LeRobot) | No disponible en la información proporcionada | Imágenes + estado | Acciones continuas | Apache-2.0 (LeRobot) | No disponible |
| Diffusion Policy (implementación de referencia en LeRobot) | No disponible en la información proporcionada | Imágenes + estado | Acciones continuas | Apache-2.0 (LeRobot) | No disponible |

La comparación cuantitativa con ACT o Diffusion Policy no es posible con los datos disponibles: no hay cifras de parámetros ni tasas de éxito publicadas para ninguna de las alternativas en la información consultada. La única comparación fiable es cualitativa: frente a ACT y Diffusion Policy, este modelo añade la modalidad de mirada y usa flow matching en lugar de cabezas gaussianas o difusión, a costa de un ecosistema mucho más pequeño (0 descargas, 0 likes) y de la ausencia total de validación externa.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: no hay tasa de éxito, ni número de ensayos, ni condiciones de prueba. No se puede afirmar que la política funcione de forma fiable en robot real.
- **Sobreajuste al entorno de entrenamiento**: 90 episodios de una sola tarea, un solo robot (`blueberry_ros`) y presumiblemente una sola cocina. Cambios de iluminación, posición de la sartén, tipo de espátula o altura del plato probablemente degraden el rendimiento.
- **Sesgos**: no se documentan sesgos demográficos ni sociales, pero sí un sesgo de distribución evidente hacia las trayectorias y condiciones de las 90 demostraciones. No se indica la diversidad de operadores que grabó los datos ni si hubo varias personas teleoperando.
- **Riesgo de drift y acumulación de error**: al ser behavior cloning puro sin mecanismo de corrección, los errores pequeños se acumulan a lo largo del episodio y no hay política de recuperación entrenada.
- **Riesgo físico**: es un modelo que controla un robot real con una espátula y una sartén. Cualquier despliegue exige parada de emergencia, límites de par y supervisión humana.
- **Inconsistencia documentada entre entrenamiento y ejecución**: el dataset se grabó a 240×320 y 15 FPS, pero el comando de ejemplo de `lerobot-rollout` configura las cámaras a 640×480 y 30 FPS, y además usa nombres de cámara genéricos (`<camera_1>`, `<camera_2>`) que deben coincidir con las claves `observation.images.left/right/user`. Es un punto de fallo probable en el primer despliegue.
- **Ambigüedad sobre la entrada de mirada**: `user_gaze` aparece en la lista de cámaras pero no en la tabla de entradas; no está documentado cómo se codifica la mirada. Si el pipeline de rollout no la suministra, el modelo puede comportarse de forma distinta a la del entrenamiento.
- **Licencia**: Apache-2.0 permite uso comercial y modificaciones con atribución, pero la licencia del dataset `fecasado/burger-to-plate-good-320x240` no se especifica en la información consultada y debe comprobarse por separado. Los datos de imagen de personas (cámara `user`) pueden requerir consideraciones de protección de datos si se reutilizan fuera del laboratorio original.
- **Idioma y contexto**: no aplica soporte multilingüe ni ventana de contexto; la tarea se fija como cadena literal en la CLI y no admite instrucciones en lenguaje natural.
- **Ecosistema inmaduro**: 0 descargas y 0 likes en el momento de la consulta, LeRobot 0.6.1 como versión de entrenamiento; cambios de versión del framework pueden romper la compatibilidad del checkpoint.
- **Búsquedas web contaminadas**: los resultados sobre "BurgerAI" de Stanford y sobre ingeniería de recetas de hamburguesas no guardan ninguna relación con este modelo pese a la coincidencia léxica; se descartan como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/giava-kitchen-burger-multi
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/burger-to-plate-good-320x240
- Visualización del dataset (Space de LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=fecasado/burger-to-plate-good-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo hermano (variante FPV): https://huggingface.co/fecasado/giava-kitchen-burger-fpv
- Modelo hermano (misma familia `gaze_flow_matching`): https://huggingface.co/fecasado/gfm-kitchen-burger-23a
