# ImKyungjin/pi0-stackcube-recovery-noise-30pct-40ep-convex

## Resumen

pi0-stackcube-recovery-noise-30pct-40ep-convex es un checkpoint de política robótica de tipo visión-lenguaje-acción (VLA) publicado por el usuario ImKyungjin en Hugging Face. Está basado en π₀ (Pi0) de Physical Intelligence y se distribuye a través de la implementación de LeRobot, que a su vez adapta el repositorio de código abierto OpenPI. El modelo recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones de control, en lugar de estar programado para una trayectoria fija.

El checkpoint contiene 3.501.372.176 parámetros (unos 3.500 millones) en formato safetensors, ocupa 7,0 GB en el repositorio y se publica bajo licencia Apache-2.0. Está especializado en apilado de cubos con recuperación ante perturbaciones: el identificador indica entrenamiento sobre el dataset `taewonkoo/stack_cube_recovery_noise_30pct_40ep` con ruido del 30% durante 40 épocas.

Es un artefacto de investigación reciente (creado el 11 de septiembre de 2026) y sin tracción pública: 0 descargas y 0 likes. Su relevancia es acotada: ilustra cómo se ajusta y se publica una política VLA sobre un dataset concreto dentro del ecosistema LeRobot, pero no incluye documentación técnica propia ni resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en π₀ (Pi0) de Physical Intelligence; implementación de LeRobot adaptada de OpenPI |
| Parámetros totales | 3.501.372.176 (3,50 mil millones) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible (la model card no especifica ventana de contexto; es una política de control, no un modelo de lenguaje de propósito general) |
| Tipos de cuantización | no disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | taewonkoo/stack_cube_recovery_noise_30pct_40ep |
| Tamaño del repositorio | 7,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Según la model card, π₀ es un modelo de visión-lenguaje-acción para control general de robots desarrollado por Physical Intelligence, presentado como el primer modelo fundacional de propósito general para robótica. La implementación publicada en este repositorio procede de LeRobot, que adapta el repositorio de código abierto OpenPI de Physical Intelligence. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atención, existencia de un experto de acciones o de decodificación especulativa), ni el número de tokens de entrenamiento, ni la composición del dataset: todos esos datos figuran como no disponibles.

El ajuste concreto que da nombre al repositorio se ha realizado sobre el dataset `taewonkoo/stack_cube_recovery_noise_30pct_40ep`, que por su denominación corresponde a una tarea de apilado de cubos con recuperación ante perturbaciones, con un 30% de ruido y 40 épocas de entrenamiento. No se especifica si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni qué innovaciones técnicas incorpora esta variante frente a π₀ original. El sufijo «convex» del identificador no aparece explicado en la model card.

## Capacidades

- Generación de acciones motoras a partir de entrada visual, con `pipeline_tag: robotics` y librería LeRobot.
- Interpretación de instrucciones en lenguaje natural para el control del robot, según la descripción general de la familia π₀.
- Control de distintos robots y tareas diversas en la formulación original de π₀; este checkpoint concreto está especializado en apilado de cubos.
- Recuperación ante perturbaciones: el entrenamiento con un 30% de ruido apunta a tolerancia a desviaciones respecto a la trayectoria nominal.
- Entrenamiento y evaluación reproducibles mediante `lerobot-train` y `lerobot-record`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, audio): no disponibles; la única modalidad documentada además de las acciones es la visual.

## Casos de uso

- Despliegue de la política de apilado en un robot de laboratorio: cargar el checkpoint con `lerobot-record --policy.path=<repo>` sobre un robot del tipo `so100_follower` para ejecutar la tarea del dataset y medir la tasa de éxito real.
- Investigación en aprendizaje por imitación: usar los 3,50 mil millones de parámetros como punto de partida para ajustar nuevas tareas de manipulación con pocas demostraciones, aprovechando que el formato safetensors es directamente cargable con LeRobot.
- Estudio de robustez ante perturbaciones: el régimen de ruido del 30% durante 40 épocas permite analizar experimentalmente cómo se recupera la política cuando se altera la posición de las piezas o la trayectoria.
- Comparativa interna de políticas VLA: evaluar esta variante frente a otras políticas del mismo ecosistema (por ejemplo, la política ACT que aparece en los comandos de ejemplo de la model card) sobre la misma tarea y el mismo robot.
- Docencia y prototipado en robótica: con 3.500 millones de parámetros en bf16 (unos 7 GB de pesos) cabe en una GPU de consumo, lo que permite montar prácticas de VLA sin clúster.
- Generación de datasets de evaluación: usar `lerobot-record --episodes=10` con el prefijo `eval_` para producir episodios etiquetados que sirvan como conjunto de test reproducible.
- Base para experimentos de sim2real: al ser un checkpoint independiente y de licencia permisiva, puede integrarse en pipelines que comparen la política entrenada con datos reales frente a variantes entrenadas en simulación, siempre que se documente la brecha observada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de éxito, error de trayectoria ni comparaciones cuantitativas, y la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (solo foros sin relación con robótica ni con VLA).

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 7,0 GB, cifra coherente con los 3.501.372.176 parámetros a 2 bytes por parámetro y con el tamaño del repositorio (7,0 GB).
- Pesos en fp32: aproximadamente 14,0 GB.
- Pesos en int8: aproximadamente 3,5 GB; en int4, aproximadamente 1,8 GB (estimaciones teóricas, no hay cuantizaciones publicadas en el repositorio).
- Estas cifras cubren solo los pesos: la inferencia real añade activaciones, imágenes de entrada y estado del robot, y el entrenamiento añade estados del optimizador.
- GPU de consumo: el modelo cabe en bf16 en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), y con más holgura si se cuantiza a 8 bits.
- GPU de servidor: A100 40/80 GB, H100, L40S o similares, no por requisito de memoria sino por latencia y por permitir varios entornos de entrenamiento en paralelo.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch. Los motores orientados a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a una política VLA de este tipo.
- Latencia y throughput: no disponible. No se publican medidas de tiempo de inferencia ni de frecuencia de control alcanzable.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. La tabla recoge únicamente lo que consta en la información proporcionada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0-stackcube-recovery-noise-30pct-40ep-convex | 3.501.372.176 | no disponible | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| π₀ (Pi0) original de Physical Intelligence | no disponible | no disponible | no disponible | no disponible | Repositorio OpenPI |
| Política ACT (referenciada en la model card) | no disponible | no disponible | no disponible | no disponible | LeRobot |

No hay cifras de MMLU, HumanEval, GSM8K ni equivalentes en robótica (tasas de éxito por tarea) para ninguno de los tres, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: 0 descargas, 0 likes y ningún benchmark publicado; el rendimiento real de la política es desconocido.
- Model card genérica de plantilla de LeRobot: no describe el ajuste concreto, no explica el sufijo «convex» ni detalla hiperparámetros, datos o criterios de selección del checkpoint.
- Los comandos de ejemplo de la propia model card usan `--policy.type=act`, que corresponde a otra política (ACT) y no necesariamente a este checkpoint π₀; deben revisarse antes de reutilizarlos.
- Especialización estrecha: el entrenamiento se limita al dataset de apilado de cubos con ruido; el comportamiento fuera de esa distribución (otros objetos, otras tareas, otras cámaras) no está caracterizado.
- Idioma: no se declara ninguno; se desconoce si la política responde correctamente a instrucciones en castellano.
- Sesgos: no evaluados ni documentados.
- Riesgo de error en la acción: en un modelo de control, el fallo se manifiesta como una acción física incorrecta, no como texto alucinado; no existen métricas de tasa de fallo publicadas.
- Sin cuantizaciones publicadas (GGUF, int8, int4), lo que complica el despliegue en hardware embebido o en robots con cómputo limitado.
- Licencia Apache-2.0 declarada, en principio compatible con uso comercial, pero el modelo deriva del proyecto OpenPI de Physical Intelligence; conviene verificar las condiciones del proyecto upstream antes de un uso comercial.
- Se trata de una política que emite acciones sobre hardware físico: cualquier despliegue requiere límites de par y fuerza, parada de emergencia y supervisión humana.
- Repositorio muy reciente y sin mantenimiento documentado; no hay garantía de compatibilidad con versiones futuras de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-stackcube-recovery-noise-30pct-40ep-convex
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/stack_cube_recovery_noise_30pct_40ep
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo; los enlaces devueltos correspondían a foros sin relación con robótica ni con modelos VLA.
