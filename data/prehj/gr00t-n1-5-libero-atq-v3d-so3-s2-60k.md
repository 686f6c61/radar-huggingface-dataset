# prehj/GR00T-N1.5-libero-atq-v3d-so3-s2-60k

## Resumen

GR00T-N1.5-libero-atq-v3d-so3-s2-60k es un checkpoint de política robótica (vision-language-action) publicado por el usuario prehj, obtenido por ajuste fino del modelo base nvidia/GR00T-N1.5-3B sobre las suites de manipulación LIBERO. Su particularidad no es el backbone, sino la cabeza de acción: incorpora un esquema de cuantización de acciones (ATQ, action quantization) implementado como una mezcla de expertos (MoE) con cuatro expertos de acción, un decodificador fino de 1x y decodificadores comprimidos que agrupan varios pasos de control en una sola acción.

La innovación principal es que el enrutado hacia los decodificadores comprimidos lo decide una compuerta (conf gate) entrenada a partir de etiquetas generadas por un VLM sobre el dataset prehj/libero-conf-labels-v3d (16.286 filas, 1.693 episodios, stride 16), con un umbral tau = 0,55. El router interno solo selecciona el horizonte dentro del grupo elegido. El checkpoint se ha entrenado 60.000 pasos con batch 64 (2 GPU × 32 por dispositivo) y semilla 42.

Sobre 2.000 episodios de evaluación en bucle cerrado (40 tareas × 50 episodios), el modelo alcanza una tasa de éxito global de 0,881 con una velocidad efectiva media de 1,450x respecto a la política sin compresión, llegando a 1,875x en libero_object. Es relevante para quien investiga aceleración de políticas VLA en robótica, porque demuestra que la compresión de acciones puede condicionarse a la dificultad de la tarea, en lugar de aplicarse de forma uniforme.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base GR00T N1.5 (vision-language-action) con cabeza de acción MoE de cuantización de acciones (ATQ); detalles internos del backbone no disponibles |
| Parámetros totales | 2.829.861.577 (≈2,83 mil millones, dato real de safetensors) |
| Parámetros activos | No disponible (la ficha describe cuatro expertos de acción con horizontes [16, 7, 3, 8], pero no indica cuántos se activan por paso ni su reparto de parámetros) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Nota: el tag "action-quantization" se refiere a la compresión temporal de acciones, no a la cuantización numérica de los pesos |
| Idiomas soportados | No disponible |
| Licencia | other (otra); hereda las condiciones del modelo base nvidia/GR00T-N1.5-3B |
| Formato de pesos | safetensors, 2 shards (model-00001-of-00002.safetensors, model-00002-of-00002.safetensors) con model.safetensors.index.json |
| Tamaño del repositorio | 8,0 GB |
| Modalidad / pipeline | robotics |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Expertos MoE (horizonte, span, plan de bloques, compresión) | main (16, 16, 1×16, 1x); m8 (7, 16, 2,3,2,3,2,2,2, 2,29x); m4 (3, 8, 2,3,2); n8 (8, 8, 1×8, 1x) |
| moe_expert_horizons | [16, 7, 3, 8] |
| Umbral de confianza (tau) | 0,55 |
| Dimensiones de acción discretas | [6] (el valor del bloque se toma como última muestra; si la lista queda vacía las acciones se suman y producen valores -2/-3) |
| Reducción de mezcla de acciones | sum |
| Fusión de rotaciones | SO(3) (rotation_merge_spec en config.json) |
| Entrenamiento | 60.000 pasos, batch 64 (2 GPU × 32 por dispositivo), semilla 42 |
| Dataset de etiquetas | prehj/libero-conf-labels-v3d (solo VLM, sin columna de contacto; 16.286 filas, 1.693 episodios, stride 16) |
| Fecha de creación en HuggingFace | 18 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint parte de nvidia/GR00T-N1.5-3B y añade una cabeza de acción en configuración de mezcla de expertos. Un mismo policy contiene un decodificador fino (1x) y varios decodificadores comprimidos; la compuerta de confianza, entrenada a partir de etiquetas derivadas de un VLM, decide si se usa el grupo fino o el comprimido, y el router escoge únicamente el horizonte dentro del grupo seleccionado. Cada experto tiene asignado un horizonte (16, 7, 3 y 8 pasos), un span y un plan de bloques que determina cómo se agrupan las acciones finas (por ejemplo, 2,3,2,3,2,2,2 para m8, con compresión 2,29x, o 2,3,2 para m4 sobre span 8). La reducción de las acciones mezcladas es una suma, con la excepción de las dimensiones declaradas como discretas (la dimensión 6, el gripper), donde se usa el último valor del bloque porque se trata de un comando absoluto.

La segunda innovación técnica es la fusión de rotaciones en SO(3): en lugar de sumar los incrementos de rotación de los bloques comprimidos, se desnormalizan, se convierten a cuaterniones, se componen en orden temporal y se vuelven a normalizar. El autor reporta un error angular de 1e-14 rad frente a la referencia calculada con scipy. En cuanto a la velocidad, LIBERO replanifica cada 5 pasos finos, de modo que una fila comprimida equivale a la suma de 2 a 3 acciones finas; por eso el chunk comprimido se ejecuta a 2,5x y no a 2,29x, y la velocidad efectiva responde a la fórmula 1 + ratio de compresión × (2,5 − 1). El entrenamiento se realizó durante 60.000 pasos con batch 64 sobre 2 GPU y semilla 42. El repositorio contiene únicamente pesos y ficheros necesarios para inferencia (config.json, los dos shards de safetensors, el índice, experiment_cfg/metadata.json con las estadísticas de normalización y trainer_state.json); no se incluyen optimizer.pt, rng_state_* ni scheduler.pt, por lo que no se puede reanudar el entrenamiento desde este checkpoint.

## Capacidades

- Generación de acciones de manipulación robótica en formato de chunk, con horizontes de 16, 7, 3 y 8 pasos según el experto seleccionado.
- Selección dinámica de la granularidad de acción mediante una compuerta de confianza aprendida de etiquetas VLM, con umbral tau ajustable (0,55 por defecto).
- Decodificación dual: un decodificador fino de 1x y decodificadores comprimidos de hasta 2,29x de ratio de compresión (2,5x de ejecución efectiva con replan = 5).
- Fusión temporal de rotaciones en SO(3) con composición de cuaterniones, con error angular de 1e-14 rad frente a scipy.
- Tratamiento diferenciado de dimensiones discretas de acción (dimensión 6, gripper) usando el último valor del bloque en lugar de la suma.
- Ejecución en bucle cerrado en las suites de LIBERO: libero_spatial, libero_object, libero_goal y libero_10.
- Servicio de política mediante servidor websocket propio (scripts/serve_policy_moe.py, cabecera moe, puerto configurable).
- Tool calling / function calling: no disponible, no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no aplicable en el sentido de agentes de texto; la política replanifica cada 5 pasos finos y encadena chunks de acción.
- Capacidades multilingües: no disponibles. No se documenta comportamiento de lenguaje, pese a que el backbone sea un modelo vision-language-action.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la documentación del checkpoint.

## Casos de uso

- Investigación en compresión de acciones para políticas VLA: el checkpoint sirve como referencia reproducible para medir cómo la agrupación temporal de acciones afecta a la tasa de éxito, comparando el grupo fino con los grupos comprimidos dentro del mismo modelo.
- Evaluación comparativa en LIBERO: con eval_taskwise_gr00t_moe.py se pueden replicar los 40 escenarios × 50 episodios por suite y contrastar la tasa de éxito (0,881 global) y los pasos medios por episodio (120,9).
- Control de un brazo manipulador simulado con controlador OSC: el servidor websocket entrega chunks de acción normalizados que el controlador ejecuta; requiere desactivar el recorte de acción del brazo porque las acciones comprimidas superan el rango ±1.
- Ajuste de la curva velocidad/éxito por tarea: modificando --conf-threshold se puede desplazar la compuerta entre el grupo fino y el comprimido; por ejemplo, en libero_object la compresión es alta (0,778) porque soporta bien la agrupación, mientras que en libero_spatial es casi nula (0,056) porque se degrada 0,160 al 2x.
- Generación de trayectorias sintéticas de manipulación: el modelo puede generar episodios completos en LIBERO a 1,45x de velocidad efectiva media, útiles como datos de imitación o para aumentar el conjunto de evaluación.
- Estudio de técnicas de fusión geométrica: la implementación SO(3) del mergue de rotaciones es directamente reutilizable para comparar contra la suma simple de deltas en cualquier política que comprima acciones.
- Docencia e introducción a la robótica aprendida: el repositorio incluye comandos concretos de servicio y de rollout que permiten reproducir el ciclo completo (servidor + entorno MuJoCo) sin infraestructura propietaria.
- Servicio multi-cliente en simulación: un único servidor de política en el puerto 8000 puede atender varios entornos LIBERO concurrentes, con el coste de un solo proceso de inferencia.

## Benchmarks y rendimiento

Evaluación en bucle cerrado, 40 tareas × 50 episodios por suite, sin recorte de acción del brazo (los clips de PD, par y límites de actuador de MuJoCo se mantienen), con tau = 0,55:

| Suite | Episodios | Éxitos | Tasa de éxito | Ratio de compresión | Velocidad efectiva | Pasos medios en éxito |
|---|---:|---:|---:|---:|---:|---:|
| libero_spatial | 500 | 473 | 0,946 | 0,056 | 1,035 | 103,6 |
| libero_object | 500 | 434 | 0,868 | 0,778 | 1,875 | 98,5 |
| libero_goal | 500 | 450 | 0,900 | 0,455 | 1,375 | 86,3 |
| libero_10 | 500 | 406 | 0,812 | 0,524 | 1,459 | 203,5 |
| Total | 2000 | 1763 | 0,881 | 0,518 | 1,450 | 120,9 |

Notas metodológicas del autor: el ratio de compresión está ponderado por chunk y los pasos medios en éxito están ponderados por episodio. La velocidad efectiva se calcula como 1 + ratio de compresión × (2,5 − 1), donde 2,5 procede de que LIBERO replanifica cada 5 pasos finos y cada fila comprimida agrupa entre 2 y 3 acciones finas. No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros), que además no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 2.829.861.577 parámetros: aproximadamente 11,3 GB en fp32, 5,7 GB en bf16/fp16, 2,8 GB en int8 y 1,4 GB en int4.
- VRAM total estimada para inferencia con el servidor de política: en el entorno de 8-12 GB en bf16, sumando activaciones, buffers del entorno y el codificador visual del backbone. Cifra orientativa, no publicada por el autor.
- Cabe en GPU de consumo: sí, en bf16 debería caber en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB), así como en tarjetas de 12 GB con margen ajustado. No hay requisitos mínimos declarados por el autor.
- GPU recomendadas: no disponibles. El autor solo indica que el entrenamiento usó 2 GPU con batch por dispositivo de 32, sin especificar el modelo de GPU.
- Opciones de despliegue: las documentadas son el servidor websocket propio del repositorio GR00T-action-quantization (scripts/serve_policy_moe.py con --head moe, --data-config libero_conf y --embodiment-tag new_embodiment) y el script de rollout gr00t/eval/libero/eval_taskwise_gr00t_moe.py. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no se publican latencias absolutas. La única métrica de rendimiento disponible es la aceleración efectiva medida en simulación: 1,035x en libero_spatial, 1,875x en libero_object, 1,375x en libero_goal, 1,459x en libero_10 y 1,450x de media.
- Requisito de configuración: es obligatorio servir con --data-config libero_conf. El portador de conf está en action_keys y, si se sirve con la configuración stock libero, los segmentos de desnormalización quedan desalineados.
- Requisito de ficheros: experiment_cfg/metadata.json es imprescindible; sin las estadísticas de normalización las acciones no se pueden invertir.

## Comparativa con modelos similares

No se han proporcionado datos comparativos con otros modelos en la información disponible. La única referencia directa es el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Rendimiento en LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prehj/GR00T-N1.5-libero-atq-v3d-so3-s2-60k | 2,83 mil millones | No disponible | 0,881 de éxito global en 2000 episodios; 1,450x de velocidad efectiva | other | HuggingFace, 0 descargas, 0 likes |
| nvidia/GR00T-N1.5-3B (base) | ≈3 mil millones (según el nombre del modelo) | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada (consultar la ficha de NVIDIA) | HuggingFace |

No se dispone de cifras de éxito, velocidad, contexto ni licencia de otras alternativas de la misma categoría (por ejemplo, otras variantes de GR00T N1.5 ajustadas a LIBERO u otros modelos VLA abiertos), por lo que cualquier comparación numérica sería especulativa. El propio autor aporta la comparación interna entre los grupos fino y comprimido, que puede usarse como línea base de ablación: la degradación de libero_spatial a 2x de compresión es de −0,160, mientras que libero_object soporta la compresión sin colapso.

## Limitaciones y advertencias

- Evaluación exclusivamente en simulación: todos los resultados proceden de LIBERO sobre MuJoCo. No hay evidencia publicada de transferencia a un robot físico.
- Supuesto de evaluación no estándar: los resultados se obtuvieron eliminando el recorte de acción del brazo en el controlador OSC, porque las acciones comprimidas superan ±1. Un controlador con clipping activo puede comportarse de forma distinta y degradar el rendimiento.
- Dependencia estricta de la configuración: servir con --data-config libero_conf es obligatorio; usar la configuración stock libero desalinea la desnormalización de acciones.
- Dependencia de metadata.json: sin las estadísticas de normalización del repositorio, las acciones generadas no se pueden revertir a su escala original.
- Sensibilidad al umbral tau: el checkpoint está ajustado a tau = 0,55. Cambiar el umbral desplaza la relación entre velocidad y éxito, y puede degradar suites sensibles a la compresión como libero_spatial.
- Etiquetas generadas por VLM: la compuerta se entrena sobre prehj/libero-conf-labels-v3d, un dataset etiquetado automáticamente por un VLM, sin columna de contacto y con 16.286 filas y 1.693 episodios. Los sesgos o errores del etiquetador se transfieren a la política de enrutado.
- Idiomas no documentados: no se especifica comportamiento multilingüe ni su utilidad fuera del control robótico.
- Licencia "other": las condiciones concretas no se detallan en la información proporcionada y heredan las del modelo base nvidia/GR00T-N1.5-3B. Es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de reproducción.
- Checkpoint de solo inferencia: al no incluir optimizer.pt, rng_state_* ni scheduler.pt, no permite reanudar el entrenamiento ni reproducir la trayectoria exacta de optimización.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto libre; el riesgo equivalente es la generación de acciones fuera de distribución en estados no vistos, que puede provocar fallos de manipulación no detectados sin supervisión externa.
- Sin datos de latencia ni de rendimiento absoluto por GPU, lo que dificulta planificar capacidad en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prehj/GR00T-N1.5-libero-atq-v3d-so3-s2-60k
- Dataset de etiquetas de confianza: https://huggingface.co/datasets/prehj/libero-conf-labels-v3d
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Código de cuantización de acciones (rama jimin-dev-label-gated): https://github.com/rakybond007/GR00T-action-quantization
- Resultado de la búsqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo (los resultados correspondían a páginas de soporte de Microsoft y no guardan relación con el checkpoint).
