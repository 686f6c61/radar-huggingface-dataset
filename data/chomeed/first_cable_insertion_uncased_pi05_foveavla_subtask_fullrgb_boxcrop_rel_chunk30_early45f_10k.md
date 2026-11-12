# chomeed/first_cable_insertion_uncased_pi05_foveavla_subtask_fullrgb_boxcrop_rel_chunk30_early45f_10k

## Resumen

Este repositorio contiene un checkpoint de investigación (10.000 de 30.000 pasos de optimización) de un modelo de visión-lenguaje-acción (VLA) para robótica, construido a partir de `lerobot/pi05_base` y fine-tuneado con la variante `pi05_foveavla_subtask` del framework LeRobot 0.6.2. El autor es `chomeed` y el modelo está especializado en una única tarea de manipulación: la inserción de un cable en un módulo de control con un brazo robótico (entorno denominado `hyundai_duet`). No es un modelo de lenguaje general, sino una política de control que mapea observaciones multimodales (seis cámaras y un vector de estado de 25 dimensiones) a secuencias de acciones de 10 dimensiones.

La innovación principal es la combinación de predicción de subtareas de alto nivel con foveación: el componente VLM escribe primero la subtarea actual (por ejemplo, "grasp the cable with the right hand" o "insert the cable into the control module") y el experto en acciones condiciona su salida a ese texto. Además, cuatro slots por cámara predicen la caja del objeto en el instante t+8, y en las subtareas de inserción se alimenta al modelo un recorte (crop) de la cámara centrado en esa caja, emulando una mirada foveal.

El modelo tiene 4.145.527.568 parámetros y un tamaño de repositorio de 16,6 GB. Su relevancia es acotada: se trata de un artefacto de experimentación reproducible (incluye los procesadores de normalización y un enlace a la ejecución de Weights & Biases), no de un modelo listo para producción ni de propósito general. La licencia no está declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (transformer VLM + experto en acciones con flow matching), variante `pi05_foveavla_subtask` de LeRobot |
| Parametros totales | 4.145.527.568 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (las subtareas se generan en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) + estado de 25 dimensiones |
| Salida | acción de 10 dimensiones, chunk de 30 pasos (`n_action_steps` 30) |
| Espacio de acciones | relativo al estado actual (`use_relative_actions=true`); absolutos: right_thumb_joint1, right_index_joint2, right_index_joint3 |
| Dataset de entrenamiento | `chomeed/first_cable_insertion_uncased` (rama `rel_chunk30`) |
| Modelo base | `lerobot/pi05_base` |
| Framework | LeRobot 0.6.2, `pi05_foveavla_subtask` (repo `HDR-SRL/lerobot_foveavla`, rama `subtask`) |
| Paso de entrenamiento | 10.000 de 30.000 actualizaciones (loop step 20.000) |
| Loss de entrenamiento en ese paso | 0,141 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5: un modelo de visión-lenguaje que procesa las imágenes de las cámaras y el prompt, más un experto en acciones que genera trayectorias mediante flow matching condicionado a la representación del VLM. Sobre esa base, la variante `foveavla_subtask` añade dos mecanismos. Primero, el VLM emite una subtarea en texto tras el prompt y el experto en acciones condiciona su predicción a esa subtarea. Segundo, cuatro slots de caja por cámara (zed_mini, d405_left, d405_right) predicen la caja del objeto en t+8 mediante 4 clases sobre 1024 bins; estas cajas no llegan nunca al experto en acciones. En las subtareas de inserción, el recorte de cada cámara se rellena con la caja de la consulta anterior estirada al tamaño del crop, mientras que en "grasp" y "turn the head" el crop se enmascara fuera de la atención como si la cámara faltase (`fovea_mask_empty_crops`). La pérdida combina flow matching, entropía cruzada de subtarea (peso 0,1) y, solo en inserción, entropía cruzada de caja (peso 0,1).

El entrenamiento se realizó con batch efectivo de 64 (32 por GPU en una B200 con acumulación de gradiente 2), AdamW con lr pico de 2,5e-05, warmup de 2000 pasos y decaimiento coseno hasta 2,5e-06 a lo largo de 60.000 loop steps, precisión bf16 con pesos maestros fp32 y gradient checkpointing. La normalización usa las estadísticas de la rama `rel_chunk30`: acciones del brazo relativas al estado actual sobre chunks de 30 pasos, los tres comandos de mano en absoluto y cuantiles de estado sobre todas las frames. Las etiquetas de subtarea (giro de cabeza desde 1,5 s antes del movimiento, derivadas de las articulaciones de cabeza de la rama `joint_states`) no están publicadas en el Hub y se escribieron en la raíz local de entrenamiento; las estadísticas realmente usadas sí se incluyen en los safetensors `policy_preprocessor_*` y `policy_postprocessor_*` del repositorio.

## Capacidades

- Control robótico de manipulación: genera chunks de 30 acciones de 10 dimensiones a partir de seis vistas de cámara y un estado de 25 dimensiones.
- Predicción explícita de subtareas de alto nivel en texto ("grasp the cable with the right hand", "turn the head to the center", "insert the cable into the control module"), que condicionan al experto en acciones.
- Foveación aprendida: predicción de cajas de objeto a t+8 y uso de recortes de cámara en las subtareas de inserción.
- Condicionamiento multimodal con seis cámaras simultáneas, incluidas dos vistas foveales dedicadas.
- Acciones relativas al estado actual para el brazo, con tres articulaciones de mano en espacio absoluto.
- No dispone de capacidades de lenguaje general, tool calling, agentes, matemáticas ni generación de código; es una política de robot especializada.
- Capacidades multilingües: no disponibles; las subtareas se generan en inglés.

## Casos de uso

- Inserción de cable en módulo de control: es el caso de uso literal del checkpoint; se usaría cargando la política con sus procesadores y llamando a `predict_action_chunk` en bucle cerrado sobre el robot `hyundai_duet`, aprovechando el chunk de 30 acciones para reducir la frecuencia de inferencia.
- Investigación en foveación para VLA: permite comparar el rendimiento con y sin recortes de cámara en la subtarea de inserción, ya que el modelo enmascara los crops en las subtareas de agarre y giro de cabeza.
- Estudio de predicción de subtareas como señal intermedia: el modelo expone `last_subtask` y `last_box`, lo que facilita analizar si la subtarea predicha correlaciona con el éxito de la inserción.
- Reproducción de experimentos de fine-tuning: al incluir los procesadores de normalización y el enlace a W&B, sirve como punto de partida para reentrenar sobre el dataset `first_cable_insertion_uncased` con la rama `subtask` de `lerobot_foveavla`.
- Evaluación de acciones relativas frente a absolutas: el uso de `use_relative_actions=true` con tres articulaciones absolutas permite estudiar la estabilidad del control en tareas de precisión submilimétrica como la inserción.
- Base para destilación o inicialización de políticas específicas: el checkpoint a 10.000 pasos puede servir de inicialización para otros entrenamientos sobre el mismo robot o tareas de cableado similares.
- Docencia y divulgación sobre VLA: su tamaño (4,1 mil millones de parámetros) y su naturaleza acotada lo hacen manejable para demostrar el pipeline completo de LeRobot en un solo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la loss de entrenamiento en el paso 10.000: 0,141 (combinación de flow matching y entropía cruzada de subtarea, más entropía cruzada de caja en inserción). No hay tasas de éxito en la tarea, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,1 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB (coincide con el tamaño del repositorio). A ello hay que sumar el coste de procesar seis cámaras y el estado, que no está cuantificado.
- GPU de entrenamiento documentada: una NVIDIA B200 con batch de 32 por GPU y acumulación de gradiente 2.
- GPU recomendadas para inferencia: no disponibles; por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) sería suficiente para los pesos, pero no hay datos de latencia ni de memoria pico real.
- Cabe en GPU de consumo: probablemente sí en cuanto a pesos (una RTX 4090 de 24 GB), pero no está verificado por el autor.
- Opciones de despliegue: LeRobot 0.6.2 con el paquete `lerobot_policy_pi05_foveavla` instalado desde `git+https://github.com/HDR-SRL/lerobot_foveavla@subtask`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no están pensados para políticas de robot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`pi05_foveavla_subtask`) | 4.145.527.568 | no disponible | Inserción de cable, robot `hyundai_duet` | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible en la información | no disponible | VLA base π0.5, propósito general robótico | no disponible | Hugging Face (modelo base) |
| π0.5 (referencia original) | no disponible en la información | no disponible | VLA con generalización open-world | no disponible | Paper en pi.website |

La comparación cuantitativa con alternativas no está disponible: no se conocen resultados de benchmarks de este checkpoint ni de `lerobot/pi05_base` en la información proporcionada, y no se han identificado otras políticas comparables del mismo tamaño y tarea.

## Limitaciones y advertencias

- Es un checkpoint intermedio (10.000 de 30.000 actualizaciones); no representa el modelo final del entrenamiento y su rendimiento puede ser inferior al de un checkpoint completado.
- Especializado en una única tarea y un único entorno (`hyundai_duet`, inserción de cable); no generaliza a otras tareas, objetos ni robots sin reentrenamiento.
- Requiere seis cámaras con nombres y calibración concretos (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y un estado de 25 dimensiones; un montaje distinto invalida su uso.
- Las etiquetas de subtarea no están publicadas en el Hub: se generaron localmente a partir de las articulaciones de cabeza, lo que limita la reproducibilidad exacta del entrenamiento.
- El recorte foveal depende de la caja predicha en la consulta anterior; una caja errónea puede degradar la inserción, y no hay métricas publicadas de robustez ante ese fallo.
- Riesgo de alucinación en la subtarea textual: el VLM puede emitir una subtarea incoherente con el estado real, y el experto en acciones condiciona su salida a ella.
- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no disponibles; las subtareas están en inglés, lo que puede afectar a integraciones que esperen otro idioma.
- Sin benchmarks ni tasas de éxito publicadas: no hay evidencia cuantitativa de que el modelo funcione en producción.
- Sin datos de sesgos: no se ha documentado ningún análisis de sesgo, y el dataset de entrenamiento no está descrito en detalle en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/first_cable_insertion_uncased_pi05_foveavla_subtask_fullrgb_boxcrop_rel_chunk30_early45f_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/first_cable_insertion_uncased
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio del framework (rama `subtask`): https://github.com/HDR-SRL/lerobot_foveavla/tree/subtask
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/3nsg7nyl
- Paper de π0.5: https://www.pi.website/download/pi05.pdf
