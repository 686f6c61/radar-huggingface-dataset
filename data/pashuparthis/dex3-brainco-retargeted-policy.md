# pashuparthis/dex3-brainco-retargeted-policy

## Resumen

`pashuparthis/dex3-brainco-retargeted-policy` es una política robótica de tipo vision-language-action (VLA) construida sobre GR00T N1.7 de NVIDIA. Resuelve una tarea concreta de manipulación: un robot humanoide Unitree G1 debe coger una manzana y dejarla en un plato, operando con manos BrainCo Revo2 Touch. El interés técnico no está en la tarea, sino en el salto de embodiment: la política original fue entrenada con manos Dex3-1 (siete actuadores y tres dedos por mano) y se ha adaptado a las Revo2 (seis actuadores y cinco dedos) sin ningún demostrador humano.

La adaptación se hizo en dos etapas. Primero, una capa de retargeting analítica traduce las órdenes de dedo de Dex3-1 al espacio de articulaciones de las Revo2, manteniendo intacto el espacio de acción de 50 dimensiones de la política. Por sí sola, esa capa eleva la tasa de éxito de 0,00 a 0,06. Después se recolectaron los éxitos de la propia política retargetizada y se multiplicaron con Isaac Lab Mimic hasta 2.647 demostraciones, que se usaron para un fine-tuning supervisado. El resultado es este checkpoint, con 3.144.016.000 parámetros (unos 3,14 mil millones) y 6,9 GB de pesos en safetensors.

El modelo es relevante porque documenta un caso de transferencia entre morfologías con resultados medidos bajo protocolo comparable: 0,30 de éxito con las manos para las que se diseñó la política base frente a 0,50 con unas manos que nunca había visto. La model card es inusualmente explícita sobre los fallos, lo que lo convierte en un buen ejemplo de ficha técnica honesta para investigación en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en GR00T N1.7: torre de visión, proyector, modelo de lenguaje congelado y cabeza de acción con flow-matching (difusión) |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo de lenguaje permanece congelado durante el fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,9 GB |
| Pipeline declarado | robotics |
| Etiqueta de embodiment | `new_embodiment` |
| Espacio de accion | 50 dimensiones, en coordenadas Dex3-1 |
| Horizonte de accion | 40 pasos (0,8 s a 50 Hz) |
| Observaciones | Camara de cabeza a 480x640 y estado articular de 43 dimensiones |
| Modelo base | nvidia/GN1x-Tuned-Arena-G1-Static-PickNPlace |
| Dataset de entrenamiento | pashuparthis/mimic_apple_pick_and_place |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política sigue la receta de IsaacLab-Arena sobre GR00T N1.7: un modelo de lenguaje congelado que actúa como columna vertebral semántica, una torre de visión con su proyector para procesar la cámara de cabeza (480x640) y una cabeza de acción de flow-matching que genera el chunk de acciones. Durante el fine-tuning solo se entrenaron la torre de visión, el proyector, el componente VLLN y la cabeza de acción de difusión; el modelo de lenguaje permaneció congelado. El entrenamiento se hizo con `embodiment_tag="new_embodiment"`, horizonte de acción de 40 pasos (0,8 s a 50 Hz) y una pérdida final de flow-matching de 0,0103.

Los datos de entrenamiento son 2.647 episodios y 1.304.904 fotogramas procedentes del dataset `pashuparthis/mimic_apple_pick_and_place` (partición `r2r3`). Se dieron 10.000 pasos con batch global de 240 y tasa de aprendizaje 1e-4 sobre 3 GPU RTX PRO 6000 Blackwell. La innovación clave no está en la arquitectura, sino en el pipeline de transferencia: una capa de retargeting analítica convierte las 7 articulaciones y 3 dedos de Dex3-1 en las 6 articulaciones y 5 dedos de las Revo2, manteniendo el interfaz de 50 dimensiones de la política. Después, los propios éxitos de la política retargetizada se multiplicaron con Isaac Lab Mimic para generar las demostraciones de fine-tuning, sin intervención humana en ningún punto. Las 2.647 demostraciones son en realidad repeticiones de 22 trayectorias fuente, con una única orientación de muñeca y una única profundidad de cierre.

## Capacidades

- Generación de acciones motoras de 50 dimensiones para un robot humanoide Unitree G1 con manos BrainCo Revo2 Touch, a partir de observaciones visuales y de estado articular.
- Control de una tarea de pick-and-place: coger una manzana y depositarla en un plato.
- Percepción visual mediante cámara de cabeza a 480x640 y fusión con estado articular de 43 dimensiones.
- Ejecución de chunks de acción de 40 pasos (0,8 s a 50 Hz) con 4 pasos de denoising en la cabeza de difusión.
- Transferencia cross-embodiment: la misma política, con la capa de retargeting, opera una morfología de mano distinta a la de su entrenamiento original.
- Ejecución dentro del ecosistema Isaac Lab / IsaacLab-Arena, servida por ZeroMQ a un cliente.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning, visión general, audio ni capacidades multilingües: el modelo está especializado exclusivamente en control robótico.

## Casos de uso

- Investigación en transferencia cross-embodiment: el modelo sirve como caso de estudio reproducible de cómo adaptar una política entrenada para una mano a otra morfología sin demostraciones humanas, usando retargeting analítico más fine-tuning sobre éxitos autogenerados.
- Generación automática de datos sintéticos en simulación: el pipeline de Isaac Lab Mimic usado aquí (2.647 episodios a partir de 22 trayectorias) se puede reutilizar como plantilla para escalar datasets de manipulación en Isaac Lab.
- Evaluación de robustez ante jitter de aparición: el modelo permite medir la degradación de éxito según la caja de spawn (0,50 dentro de ±5 cm, 0,00 a ±10 cm), útil para caracterizar límites de generalización espacial.
- Prototipado de pipelines de simulación a real con Unitree G1: la política se sirve vía ZeroMQ a un cliente IsaacLab-Arena, lo que facilita integrarla en entornos de simulación antes de cualquier despliegue físico.
- Benchmarking de infraestructura de entrenamiento VLA: las 10.000 iteraciones con batch global 240 sobre 3 RTX PRO 6000 Blackwell sirven como referencia de coste computacional para fine-tuning de políticas VLA de ~3,14 mil millones de parámetros.
- Estudio de fallos en agarre: el modo de fallo documentado (la mano cierra una sola vez, la manzana rueda y la política continúa sin reintentar) es un caso útil para investigar recuperación de errores y currículos de datos con diversidad de aproximación.
- Base para fine-tuning adicional en tareas de manipulación con manos de cinco dedos, partiendo de un checkpoint que ya habla el espacio de acción de las Revo2 a través de la capa de retargeting.

## Benchmarks y rendimiento

Los resultados de la model card corresponden a la misma tarea y término de éxito (`galileo_g1_static_pick_and_place`, manzana al plato) a 50 Hz. El jitter de spawn y el timeout se indican por fila porque no son comparables entre valores distintos.

| Politica | Manos | Spawn, timeout | Exito |
|---|---|---|---|
| GN1x base, congelada | Dex3-1 | fijo, 6 s | 0,65 (13/20) |
| GN1x base, congelada | Dex3-1 | ±5 cm, 14 s | 0,30 (6/20) |
| GN1x base + solo retargeting | Revo2 | fijo, 6 s | 0,06 (6/100) |
| Este checkpoint | Revo2 | ±5 cm, 14 s | 0,50 (25/50) |
| Este checkpoint | Revo2 | ±10 cm, 14 s | 0,00 |

Datos adicionales de la model card:

- La comparación válida es entre las filas dos y cuatro, medidas bajo el mismo protocolo: 0,30 con las manos para las que se construyó la política y 0,50 con manos que nunca había visto.
- Dentro de la caja de ±5 cm, los fallos son posicionales: 0,78 de éxito en la mitad más cercana al plato frente a 0,41 en la mitad lejana, con degradación monótona según la distancia al plato.
- Los episodios exitosos terminan entre 5 y 8,5 s; todos los fallos consumen los 14 s completos.
- La cobertura de demostraciones por celda de la caja de spawn era uniforme (165-199 episodios por celda) mientras el éxito variaba de 0,17 a 1,00.
- La pérdida final fue de 0,0103 de flow-matching; según la model card, deja de ser informativa a partir de cierto punto del entrenamiento.
- Los 979 episodios adicionales generados para reforzar las celdas débiles no produjeron mejora medible: 0,55 en el paso 8000 y 0,50 en el paso 10000.

No se han encontrado resultados de benchmarks adicionales en la información disponible. Las búsquedas web realizadas no devolvieron material relacionado con este modelo.

## Requisitos de hardware

- Entrenamiento documentado: 3 GPU RTX PRO 6000 Blackwell, 10.000 pasos con batch global 240.
- VRAM de inferencia: no disponible como dato oficial. Como referencia orientativa basada en los 3,14 mil millones de parámetros, en fp16 el peso ronda los 6,3 GB, en int8 unos 3,1 GB y en int4 unos 1,6 GB, cantidades a las que hay que sumar el coste de la torre de visión y de los búferes de observación (480x640). Estas cifras son estimaciones, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Dado el tamaño, una GPU consumer de gama alta con 16 GB o más de VRAM podría alojar los pesos en precisión reducida, pero no hay validación publicada de este escenario.
- Cabe en GPU consumer: no confirmado por el autor.
- Opciones de despliegue: `Gr00tPolicy` desde un checkout de Isaac-GR00T que soporte N1.7, servido por ZeroMQ a un cliente IsaacLab-Arena. El código de servicio y evaluación vive en `5_gr00t_finetune/` del repositorio `dex3_brainco_retargeting`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no tendría sentido al tratarse de un modelo VLA y no de un LLM de texto.
- Latencia y throughput: no disponibles. El único dato temporal es el horizonte de acción de 40 pasos (0,8 s a 50 Hz) y 4 pasos de denoising.
- Dependencia crítica: el checkpoint por sí solo no basta sobre las manos Revo2. Es obligatorio disponer de la capa de retargeting, porque la política sigue emitiendo acciones en coordenadas Dex3-1.

## Comparativa con modelos similares

La información disponible solo permite comparar este checkpoint con sus propios antecesores directos, todos dentro de la misma familia GR00T N1.7 / GN1x.

| Modelo | Manos | Parametros | Spawn, timeout | Exito | Licencia |
|---|---|---|---|---|---|
| GN1x base, congelada | Dex3-1 | no disponible | fijo, 6 s | 0,65 (13/20) | no disponible |
| GN1x base, congelada | Dex3-1 | no disponible | ±5 cm, 14 s | 0,30 (6/20) | no disponible |
| GN1x base + solo retargeting | Revo2 | no disponible | fijo, 6 s | 0,06 (6/100) | no disponible |
| Este checkpoint | Revo2 | 3,14 mil millones | ±5 cm, 14 s | 0,50 (25/50) | no disponible |

No se dispone de datos de parámetros, contexto ni licencia de los modelos base en la información proporcionada, ni de alternativas externas de la misma categoría (por ejemplo, otras políticas VLA para manipulación con manos antropomórficas). Por tanto, la comparativa con modelos de terceros queda como no disponible.

## Limitaciones y advertencias

- Generalización espacial muy limitada: 0,50 de éxito dentro de ±5 cm de jitter y 0,00 a ±10 cm. La política no generaliza fuera de su caja de entrenamiento.
- Sesgo posicional dentro de la propia caja: 0,78 de éxito en la mitad cercana al plato frente a 0,41 en la mitad lejana, con degradación monótona según la distancia.
- Ausencia total de reintentos: si el agarre falla, la mano cierra una sola vez, la manzana rueda y la política sigue hasta el plato y simula un depósito con la mano vacía hasta agotar el timeout. Ninguno de los 2.647 episodios contiene una recuperación.
- Falta de diversidad de aproximación: los 2.647 episodios son repeticiones de 22 trayectorias fuente, con una sola orientación de muñeca y una sola profundidad de cierre. Añadir más datos del mismo tipo no mejora el resultado (979 episodios extra no aportaron mejora medible).
- Filtro de éxito en la recolección de datos: el harvester descartó los fallos, lo que sesga el dataset hacia episodios limpios y elimina cualquier ejemplo de recuperación.
- La pérdida de entrenamiento deja de ser informativa en algún punto del proceso, según la propia model card, por lo que no sirve como criterio fiable de selección de checkpoint.
- Métrica de éxito ambigua: el término de terminación del entorno también se activa si la manzana es empujada a la región del plato en lugar de transportada. El autor verificó fotograma a fotograma todas las tasas citadas.
- Dependencia externa no incluida: los pesos no funcionan sobre las Revo2 sin la capa de retargeting y el asset del robot, distribuidos por separado en el repositorio de GitHub.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Hay que consultar al autor antes de cualquier despliegue en producción.
- Idiomas y contexto: no disponibles. El modelo de lenguaje está congelado y el modelo está especializado en control robótico, no en tareas de lenguaje.
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto; el riesgo equivalente es la ejecución de una secuencia de acción plausible pero incorrecta, sin señal de error ni reintento.
- Despliegue en producción: no hay datos publicados de latencia, throughput ni validación en hardware real. Todo lo reportado proviene de simulación (Isaac Lab / IsaacLab-Arena).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pashuparthis/dex3-brainco-retargeted-policy
- Modelo base: https://huggingface.co/nvidia/GN1x-Tuned-Arena-G1-Static-PickNPlace
- Dataset de entrenamiento: https://huggingface.co/datasets/pashuparthis/mimic_apple_pick_and_place
- Repositorio del pipeline (asset de Revo2, capa de retargeting, generación de datos y harness de evaluación): https://github.com/pashuparthis/dex3_brainco_retargeting
- Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
