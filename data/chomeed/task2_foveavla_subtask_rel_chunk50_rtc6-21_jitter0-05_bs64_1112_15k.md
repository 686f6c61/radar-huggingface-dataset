# chomeed/task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_15k

## Resumen

`task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_15k` es un checkpoint de política robótica Visión-Lenguaje-Acción (VLA) desarrollado por el usuario `chomeed`, consistente en un ajuste fino de `lerobot/pi05_base` (la variante pi0.5 de Physical Intelligence integrada en LeRobot) enriquecida con la extensión FoveaVLA. El modelo resuelve una tarea concreta de manipulación robótica: la inserción de un cable en un módulo de control con un brazo equipado de mano diestra, empleando seis cámaras y un estado propioceptivo de 25 dimensiones. Su interés radica en que combina predicción explícita de subtareas de alto nivel, atención foveal (recortes dirigidos por caja) y entrenamiento con retardo de inferencia simulado (RTC, *Real-Time Chunking*), tres técnicas que atacan problemas clásicos de los VLA en producción: la coherencia a largo plazo, el coste computacional de la visión y la discontinuidad entre chunks de acciones.

El checkpoint corresponde a 15.000 de las 30.000 actualizaciones de optimizador previstas (paso de bucle 30.000), con una pérdida de entrenamiento de 0,118 en ese punto. El repositorio ocupa 16,6 GB y contiene 4.145.527.568 parámetros en formato safetensors. No se trata de un modelo de propósito general, sino de un artefacto de investigación muy especializado, ligado a un dataset privado de inserción de cables (`chomeed/first_cable_insertion_uncased`) y a una bifurcación específica de LeRobot (`lerobot_foveavla`, rama `subtask-rtc`).

La relevancia actual del modelo es metodológica más que de producto: documenta con precisión cómo se entrena y se sirve un VLA con decodificación por chunks, prefijo RTC y *foveación* condicionada por subtarea, e incluye los procesadores de normalización en el propio repo para reproducir la inferencia. No obstante, su licencia no está declarada, no tiene descargas ni validación externa y su uso queda restringido, en la práctica, a quien replique el stack de hardware y software del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (VLM + experto de acciones con flow matching) con extensión FoveaVLA y predicción de subtareas |
| Parametros totales | 4.145.527.568 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor entrena en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (las instrucciones/subtareas del dataset están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (más procesadores `policy_preprocessor_*` y `policy_postprocessor_*` en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y añade la variante `pi05_foveavla_subtask` implementada en la rama `subtask-rtc` del repositorio `HDR-SRL/lerobot_foveavla`. La arquitectura sigue el esquema pi0.5: un VLM que procesa observaciones multimodales y texto, y un experto de acciones separado que genera chunks de acciones mediante *flow matching*. La innovación FoveaVLA introduce dos mecanismos. Primero, el VLM escribe explícitamente la subtarea actual tras el prompt (por ejemplo, «grasp the cable with the right hand», «turn the head to the center» o «insert the cable into the control module») y el experto de acciones condiciona su predicción sobre ese texto. Segundo, tras la respuesta se predicen 4 ranuras de caja por cámara (zed_mini, d405_left, d405_right) que estiman la caja de cada cámara en t+8, discretizada en 4 clases sobre 1024 bins; el experto de acciones nunca ve esas cajas, pero el pipeline de foveación las usa para recortar la imagen de entrada en la siguiente consulta.

El entrenamiento se realizó con LeRobot 0.6.2, batch efectivo de 64 (32 por GPU en una B200 con acumulación de gradiente 2), AdamW con lr pico 2,5e-05, warmup de 2.000 pasos y decaimiento coseno hasta 2,5e-06 a lo largo de 60.000 pasos de bucle (equivalentes a 30.000 actualizaciones). Se usó autocast bf16 con pesos maestros fp32 y *gradient checkpointing*. Las entradas son 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) más un estado de 25 dimensiones; la salida es un chunk de 50 acciones de 10 dimensiones con `n_action_steps=30`, expresadas en espacio relativo al estado actual salvo tres articulaciones de la mano (right_thumb_joint1, right_index_joint2, right_index_joint3), que se mantienen absolutas. La normalización usa las estadísticas de la rama `rel_chunk50` del dataset y las etiquetas de subtarea de la rama `foveavla_subtask_early45f`.

Dos detalles técnicos destacan. El primero es el entrenamiento con RTC (Black et al. 2025, arXiv:2512.05964): cada muestra recibe un retardo de inferencia simulado d, con probabilidad 0,1 de d=0 (primer chunk sin prefijo) y, en caso contrario, uniforme en [6, 21] pasos (200-700 ms a 30 Hz); las primeras d acciones entran limpias (tiempo de flujo 0) en el experto y se excluyen de la pérdida de flujo. El segundo es el *crop jitter*: durante la fase de inserción, la ventana de recorte se desplaza hasta un 5 % de su ancho y alto de forma uniforme, de modo que el modelo ve recortes tan imperfectos como los que él mismo generará, sin mover los objetivos de caja. En fase de inserción la vista de recorte usa exactamente la caja de la consulta anterior estirada al tamaño de recorte; en las fases de agarre y giro de cabeza, la vista de recorte se enmascara de la atención como si faltara una cámara. La pérdida combina flujo, 0,1 × entropía cruzada de subtarea y, solo en inserción, 0,1 × entropía cruzada de caja.

## Capacidades

- Predicción de chunks de acciones robóticas de 10 dimensiones y 50 pasos (30 ejecutados) para un brazo con mano diestra, en espacio relativo al estado actual salvo tres articulaciones absolutas.
- Predicción explícita de subtareas de alto nivel en lenguaje natural, que condicionan al experto de acciones.
- Foveación dirigida por cajas: estimación de la caja de interés por cámara en t+8 y uso de recortes para la siguiente consulta.
- Procesamiento multimodal con 6 cámaras simultáneas y estado propioceptivo de 25 dimensiones.
- Soporte de *Real-Time Chunking* en inferencia: acepta `inference_delay` y `prev_chunk_left_over` y arranca el chunk con el prefijo exacto de acciones no ejecutadas, lo que permite ejecución continua entre chunks.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni audio.
- Capacidad multilingüe: no disponible; las subtareas del dataset están en inglés.

## Casos de uso

- Inserción de cables en un módulo de control con un brazo robótico de laboratorio: es el caso para el que fue entrenado; el modelo predice la subtarea, la caja de interés y el chunk de acciones a partir de las seis cámaras y el estado, y el RTC permite encadenar chunks sin discontinuidades.
- Investigación en políticas VLA con foveación: sirve como referencia reproducible para estudiar si el recorte dirigido por caja reduce el coste visual sin degradar la precisión en tareas de precisión submilimétrica.
- Estudio de RTC y latencia en robótica: el checkpoint está entrenado con retardos simulados de 6 a 21 pasos, por lo que es un banco de pruebas para medir el efecto de la latencia real de inferencia en la continuidad de la política.
- Replicación de experimentos de subtask prediction: el modelo escribe la subtarea antes de actuar, lo que permite instrumentar y auditar la coherencia entre intención declarada y acción ejecutada en un pipeline de evaluación.
- Base para ajuste fino en tareas de ensamblaje similares: al derivar de `lerobot/pi05_base` y publicar los procesadores de normalización, puede reentrenarse sobre otros datasets de manipulación con la misma interfaz de 6 cámaras y estado de 25 dimensiones.
- Docencia y divulgación de VLA: el README documenta con detalle la configuración de entrenamiento, las pérdidas y el flujo de inferencia, lo que lo hace útil como ejemplo didáctico de un stack LeRobot completo.
- No se recomienda su uso en producción general: la licencia no está declarada y el modelo está atado a un hardware y dataset concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en el paso 15.000 (0,118), que no es comparable con métricas de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.145.527.568 parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB (coincide con el tamaño del repo). A ello hay que sumar el coste de las seis cámaras y del VLM, no cuantificado en la información.
- GPU de entrenamiento documentada: 1 × NVIDIA B200 con batch 32 y acumulación de gradiente 2.
- GPU recomendadas para inferencia: no disponibles. Por tamaño de pesos, cabría en GPUs de 24 GB o más en bf16, pero el autor no publica requisitos ni latencias medidas.
- Cabe en GPU de consumo: probablemente sí en términos de pesos (p. ej., RTX 4090 de 24 GB en bf16), pero no verificado ni documentado.
- Opciones de despliegue: LeRobot 0.6.2 con el paquete `lerobot_policy_pi05_foveavla` (rama `subtask-rtc`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un VLA con experto de acciones.
- Latencia y throughput: no disponibles. El entrenamiento simula retardos de 200-700 ms a 30 Hz, lo que da una idea del orden de magnitud asumido, pero no son medidas reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 + FoveaVLA) | 4.145.527.568 | no disponible | Inserción de cables, 6 cámaras, chunk 50 | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base pi0.5 de propósito general | no disponible en la información | Hugging Face (modelo base) |
| Otros VLA de la familia pi0/pi0.5 | no disponible en la información | no disponible | Manipulación robótica general | no disponible en la información | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución; es un riesgo legal directo para producción.
- Modelo especializado en una única tarea (inserción de cables) y un único montaje de hardware (6 cámaras concretas, estado de 25 dimensiones, mano diestra con tres articulaciones absolutas); no es un VLA de propósito general.
- Checkpoint intermedio: solo 15.000 de 30.000 actualizaciones; el autor no reporta evaluación final ni comparación con el checkpoint completo.
- Sin descargas ni validación externa (0 descargas, 0 likes en el momento de la ficha); no hay evidencia independiente de robustez.
- Dependencia de una bifurcación no estándar de LeRobot (`lerobot_foveavla`, rama `subtask-rtc`) y de LeRobot 0.6.2 con tiempo de flujo por token; LeRobot 0.6.1 no es compatible con el RTC entrenado.
- RTC con límites estrictos: retardos inferiores a 6 se elevan a 6 y superiores a 21 se rechazan, lo que puede degradar la ejecución si la latencia real cae fuera de ese rango.
- La foveación depende de cajas predichas por el propio modelo; errores de caja en t+8 pueden propagarse al recorte de la siguiente consulta (mitigado parcialmente por el *crop jitter* del 5 %).
- Riesgo de alucinación de subtareas: el VLM puede declarar una subtarea incorrecta y condicionar con ello al experto de acciones; no se documentan mecanismos de verificación.
- Sesgos: no documentados; el dataset de entrenamiento es privado y de un único entorno, por lo que el modelo hereda sus sesgos de iluminación, disposición de cámaras y geometría.
- Idiomas: no se documenta soporte multilingüe; las subtareas están en inglés.
- Sin datos de benchmarks, latencia ni VRAM medida: cualquier estimación de despliegue es una extrapolación a partir del número de parámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/first_cable_insertion_uncased
- Repositorio del framework (rama `subtask-rtc`): https://github.com/HDR-SRL/lerobot_foveavla/tree/subtask-rtc
- Paper de RTC (Black et al. 2025): https://arxiv.org/abs/2512.05964
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/wk74j3bv
