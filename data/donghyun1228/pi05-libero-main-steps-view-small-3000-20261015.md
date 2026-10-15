# Donghyun1228/pi05-libero-main-steps-view-small-3000-20261015

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario Donghyun1228 bajo el identificador `pi05-libero-main-steps-view-small-3000-20261015`. Se trata de una variante de un modelo vision-lenguaje-acción (VLA) derivada de π₀.₅ (Pi05) y adaptada al banco de pruebas LIBERO, un entorno de referencia para el estudio de transferencia de conocimiento en aprendizaje robótico multitarea y de por vida. La etiqueta principal del autor es `inverse-dynamics`, lo que indica que el ajuste se centra en un modelo de dinámica inversa (IDM) sobre las representaciones visuales.

El checkpoint forma parte de una familia de experimentos del mismo autor en la que se comparan recetas de entrenamiento variando únicamente el número de actualizaciones completadas, los pasos de checkpoint retenidos y las rutas de salida. En concreto, este fichero corresponde a la configuración `view_small` con 3000 actualizaciones completadas (paso bruto 2999), muestreada de una trayectoria continua de 5000 actualizaciones. La model card es explícita: la evaluación está pendiente y no se reclama ninguna tasa de éxito.

La relevancia del modelo es fundamentalmente metodológica. Permite reproducir y auditar una receta concreta de entrenamiento (LLM congelado, LoRA sobre el experto de acción con multiplicador 0.1, entrenamiento nativo con FSDP2, semilla 42) y comparar el efecto del número de pasos sobre las representaciones visuales aprendidas, dentro del ecosistema openpi y del benchmark LIBERO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de π₀.₅ (Pi05); experto de acción con adaptación LoRA. Modelo de dinámica inversa (IDM) sobre las vistas |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor exporta el estado de entrenamiento en bruto, sin indicar cuantización) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones en lenguaje natural para robótica; no se declaran idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explícita; repositorio de 6,9 GB, librería `openpi` (el autor menciona exportación de «raw train-state parameters») |

## Arquitectura y entrenamiento

El modelo parte de π₀.₅ (Pi05), un modelo VLA con generalización en entornos abiertos desarrollado por Physical Intelligence, coentrenado con demostraciones robóticas y datos multimodales a gran escala. Según la información disponible, π₀.₅ soporta únicamente la cabeza de acción basada en *flow matching*, tanto en entrenamiento como en inferencia. Sobre esta base, el checkpoint aquí descrito aplica un procedimiento de dinámica inversa: el LLM subyacente permanece congelado y solo se adapta el experto de acción mediante LoRA, con multiplicador de visión 1 y multiplicador LoRA de acción 0.1.

La receta concreta documentada en la model card es la siguiente: entrenamiento nativo con identificador `622c8d28`, batch de 32, semilla 42, paralelismo FSDP2, 500 pasos de *warmup*, tasa de aprendizaje pico y final de 1e-5, y actualización limitada al IDM. Se emplean los datos de contacto denso existentes y el preajuste original. El despliegue se describe como «raw non-EMA», con muñeca de origen (*source wrist*) y normalización original. Todos los checkpoints de la comparativa comparten la misma trayectoria de entrenamiento, y los pesos fuente congelados fueron verificados de forma independiente. Las tres variantes de la comparativa solo difieren en el número total de actualizaciones, los pasos de checkpoint retenidos y las rutas de salida.

## Capacidades

- Modelo de dinámica inversa (IDM) orientado a la predicción de acciones a partir de observaciones visuales y estado, dentro del marco VLA de π₀.₅.
- Condicionamiento por instrucciones en lenguaje natural para tareas de manipulación robótica (capacidad heredada de la arquitectura π₀.₅).
- Procesamiento de observaciones visuales multimodales, incluyendo cámara base y cámara de muñeca (la receta distingue explícitamente entre `base-camera encoder` y `wrist_img encoder` en la familia de checkpoints relacionados).
- Ejecución de tareas de horizonte largo en entornos LIBERO (manipulación multitarea y aprendizaje de por vida), según la descripción del benchmark.
- Adaptación mediante LoRA sobre el experto de acción, manteniendo congelado el LLM.
- Soporte de entrenamiento con FSDP2 y despliegue mediante la librería `openpi`.

## Casos de uso

- Investigación en transferencia de conocimiento en robótica: sirve como punto de comparación para medir cómo evolucionan las representaciones visuales y el experto de acción a lo largo de una trayectoria de entrenamiento de 5000 actualizaciones, comparando este checkpoint de 3000 pasos con los de 1000 pasos de la misma familia.
- Estudio de dinámica inversa (IDM): permite analizar qué información visual resulta necesaria para inferir acciones en tareas de contacto denso, aislando el efecto del IDM respecto al resto de componentes congelados.
- Reproducción de experimentos: la receta documenta semilla (42), batch (32), esquema de paralelismo (FSDP2) y tasas de aprendizaje, lo que facilita la replicación exacta del entrenamiento en otros entornos.
- Punto de partida para nuevos ajustes con LoRA: al mantener el LLM congelado y adaptar solo el experto de acción, el checkpoint puede reutilizarse como base para adaptaciones posteriores sobre tareas de manipulación específicas sin reentrenar el modelo completo.
- Auditoría de pesos fuente congelados: el autor verifica de forma independiente los pesos fuente congelados y publica auditorías de hashes en checkpoints relacionados, lo que permite validar la integridad del proceso de transferencia.
- Banco de pruebas para comparativas de recetas: dado que las variantes solo cambian el contador de actualizaciones y las rutas de salida, es útil para aislar el impacto del número de pasos de entrenamiento en el rendimiento (cuando exista evaluación).
- Evaluación en LIBERO: al estar entrenado y pensado para este benchmark, puede integrarse en las rutinas de evaluación de manipulación multitarea y aprendizaje de por vida que define LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito (*success rate*).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,9 GB, pero al tratarse de una exportación del estado de entrenamiento en bruto («raw non-EMA deployment»), ese tamaño no permite derivar de forma fiable el peso del modelo en inferencia.
- GPU recomendadas: no disponibles. El autor documenta entrenamiento con FSDP2 y batch de 32, lo que implica despliegues multigpu en fase de entrenamiento, sin que se especifiquen modelos concretos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es `openpi`. La familia π₀.₅ dispone también de versiones gestionadas mediante LeRobot, con soporte de la cabeza de acción por *flow matching*.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Pasos / variante | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-libero-main-steps-view-small-3000-20261015 (este) | 3000 actualizaciones (paso bruto 2999) sobre trayectoria de 5000 | IDM, `view_small`, LoRA de acción 0.1 | apache-2.0 | HuggingFace (0 descargas) |
| pi05-libero-source-free-split-vision-view-large-1000-20261010 | 1000 | IDM con visión solo objetivo; encoder de cámara base adaptado y `wrist_img` restaurado de los pesos fuente en bfloat16 | no disponible en la información | HuggingFace |
| pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011 | 1000 | Exportación de estado de entrenamiento en bruto tras 1000 actualizaciones IDM solo objetivo; 51 hojas exportadas auditadas por hash | no disponible en la información | HuggingFace |
| pi05_libero_finetuned (LeRobot) | no disponible | π₀.₅ VLA ajustado y evaluado en LIBERO | no disponible en la información | ModelScope |
| pi05_libero_base (LeRobot) | no disponible | Checkpoint base π₀.₅ para LIBERO | no disponible en la información | ModelScope |

## Limitaciones y advertencias

- Evaluación pendiente: la model card afirma explícitamente que no se reclama ninguna tasa de éxito. No debe asumirse ningún nivel de rendimiento medido.
- Checkpoint de investigación: el objetivo es la comparación de recetas de entrenamiento, no el despliegue en producción.
- Despliegue en bruto sin EMA: el checkpoint se describe como «raw non-EMA», es decir, sin media móvil exponencial, lo que puede afectar a la estabilidad del comportamiento en inferencia.
- Dependencia de una trayectoria concreta: los resultados solo son comparables dentro de la misma trayectoria de 5000 actualizaciones y con la misma semilla (42) y receta.
- Sesgos: no disponible. No se documentan análisis de sesgo.
- Riesgo de alucinación: no disponible. No se documenta para este checkpoint.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: apache-2.0, permisiva para uso comercial según los términos de dicha licencia, aunque se recomienda verificar las condiciones de los pesos base de π₀.₅ de los que deriva.
- Compatibilidad: el autor advierte que π₀.₅ soporta únicamente la cabeza de acción por *flow matching*; otros componentes pueden no ser compatibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-steps-view-small-3000-20261015
- Checkpoint relacionado (split-vision, view-large, 1000): https://huggingface.co/Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010
- Checkpoint relacionado (raw-common, vision-yaw30, 1000): https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011
- Repositorio GitHub del autor (LIBERO_view): https://github.com/Donghyun1228/LIBERO_view
- π₀.₅ ajustado en LIBERO (LeRobot, ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned
- π₀.₅ base para LIBERO (LeRobot, ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_base
