# OpenRAL/rskill-smolvla-franka_panda-libero_spatial-bf16

## Resumen

rskill-smolvla-franka_panda-libero_spatial-bf16 es un paquete de habilidad robótica (rSkill) publicado por OpenRAL que envuelve el modelo SmolVLA afinado sobre el conjunto de tareas LIBERO. SmolVLA es un modelo visión-lenguaje-acción (VLA) de aproximadamente 450 millones de parámetros, descrito en el artículo arXiv:2506.01844, diseñado para el control de manipuladores robóticos a partir de observaciones visuales y una instrucción en lenguaje natural. Este paquete concreto no copia los pesos: expone un manifiesto `rskill.yaml` que apunta al checkpoint upstream `lerobot/smolvla_libero` y añade comprobación de capacidades, presupuestos de latencia y registro local dentro del framework de agentes robóticos OpenRAL.

El modelo subyacente es un transformer VLA que combina un codificador visual, un codificador de lenguaje y una cabeza de acciones basada en flow matching. Genera trozos de acción (action chunks) de longitud 50, de los cuales se reejecutan 25 pasos por inferencia (replanificación a media chunk), empleando dos vistas RGB (muñeca y cenital) más un vector de propiocepción de 8 dimensiones. Está afinado específicamente para el embodiment Franka Panda en simulación LIBERO, con un contrato de observación-acción de 7 dimensiones por paso (delta de efector final en 6D más pinza).

Su relevancia actual radica en que demuestra un patrón de empaquetado reproducible para políticas VLA ligeras: con 1,2 GB de VRAM mínima en bf16 y un presupuesto de latencia de 150 ms por chunk, puede ejecutarse en GPU de consumo (RTX 3060/4060 Ti) o incluso en CPU con una penalización aproximada de 20×. La licencia Apache-2.0 permite uso comercial, lo que lo hace atractivo para prototipado de agentes manipuladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; transformer con cabeza de acciones por flow matching |
| Parametros totales | ~450 M (0,45 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (por defecto); fp32 disponible; no se documentan otras |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | pesos upstream en Hugging Face (`lerobot/smolvla_libero`); el paquete es un manifiesto `rskill.yaml`; librería `lerobot` (PyTorch) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto (~450 M de parámetros) que procesa dos vistas RGB de 224×224, un vector de propiocepción de 8 dimensiones (posición del efector final, eje-ángulo y pinza) y una cadena de tarea en lenguaje natural. La salida es una secuencia de acciones generada mediante flow matching con 10 pasos de muestreo, produciendo chunks de 50 acciones de las que se ejecutan 25 antes de replanificar. El modelo base es `lerobot/smolvla_base`, afinado sobre el conjunto de datos `HuggingFaceVLA/libero` para las cuatro suites de tareas de LIBERO (manipulación de sobremesa).

El preprocesamiento replica la convención del dataset LIBERO original: rotación de imágenes de 180° (`image_preprocessing.flip_180: true`) y dos cámaras (cenital y de muñeca). El contrato de acción es `delta_ee_6d_plus_gripper`: un delta de efector final en 6D mediante control OSC con escala `[0.05, 0.05, 0.05, 0.5, 0.5, 0.5]` más un valor de pinza, totalizando 7 dimensiones por paso. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica a partir de instrucciones en lenguaje natural y observaciones visuales.
- Control de un manipulador Franka Panda en simulación LIBERO (embodiment nativo validado).
- Procesamiento multimodal: dos cámaras RGB (cenital y muñeca) más propiocepción de 8 dimensiones.
- Generación de chunks de acción con replanificación a media chunk (chunk de 50, ejecución de 25).
- Flow matching para la generación de trayectorias de acción.
- Soporte de instrucciones condicionadas por tarea (task string) en inglés.
- Integración con el framework de agentes OpenRAL mediante manifiesto rSkill con comprobación de capacidades y presupuestos de latencia.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso genérico; es un modelo de política robótica, no un LLM conversacional.

## Casos de uso

- Investigación en manipulación de sobremesa: reproducción del benchmark LIBERO-Spatial y otras suites para comparar políticas VLA; el paquete incluye resultados de evaluación reproducibles localmente (`openral benchmark run`) con 0,90 de éxito en LIBERO-Spatial.
- Prototipado de agentes robóticos: integración en el framework OpenRAL como habilidad `s1`/`vla` con comprobación de capacidades y registro local, permitiendo componer políticas con monitores de recompensa (por ejemplo, `rskill-robometer_4b-any-general-nf4`).
- Despliegue en hardware de consumo: con 1,2 GB de VRAM mínima en bf16 cabe en RTX 3060/4060 Ti, lo que permite experimentar con políticas VLA sin acceso a clústeres.
- Simulación a gran escala: ejecución de barridos de evaluación sobre las cuatro suites de LIBERO con latencia de 150 ms por chunk.
- Educación y formación: estudio de arquitecturas VLA compactas y del patrón de empaquetado rSkill en cursos de robótica e IA.
- Validación de pipelines de percepción-acción: uso de las dos vistas RGB y el estado de 8 dimensiones para probar contratos de observación y preprocesamiento (rotación 180°, escala de deltas OSC).
- Fallback en CPU para depuración: ejecución con `--device cpu` (aproximadamente 20× más lenta) para pruebas funcionales sin GPU.

## Benchmarks y rendimiento

| Suite | Éxito | Episodios por tarea | Fuente |
|---|:---:|:---:|---|
| LIBERO-Spatial | 0,90 | 1 | `eval/libero_spatial.json` (reproducción local) |

El resto de suites de LIBERO aparecen truncadas en la información disponible. No se han publicado en la información proporcionada resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni métricas estándar de LLM, dado que se trata de un modelo de política robótica.

## Requisitos de hardware

- VRAM mínima: 1,2 GB en bf16 (0,93 GB de pesos al cargar, medido en RTX 4070).
- VRAM recomendada: ≥ 4 GiB para que co-resida el monitor de recompensa emparejado (`OpenRAL/rskill-robometer_4b-any-general-nf4`).
- GPU recomendadas: RTX 3060 / 4060 Ti como mínimo; cualquier GPU CUDA con ≥ 2 GiB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3060, 4060 Ti, 4070 y superiores.
- RAM: 4 GiB mínimo, 16 GiB recomendado.
- Almacenamiento: 2 GiB para pesos; SSD recomendado.
- Opciones de despliegue: framework OpenRAL (`openral rskill install`, `openral sim run`, `openral benchmark run`), librería `lerobot` sobre PyTorch; `torch.compile(policy, mode="reduce-overhead")` reduce latencia un 15-25 % tras el calentamiento.
- Latencia: presupuesto de 150 ms por chunk; tiempo máximo de ejecución de 60 s; fallback en CPU aproximadamente 20× más lento.
- Optimizaciones: bf16 reduce VRAM un 30 % frente a fp32 y latencia un 10-20 %.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otras políticas VLA como OpenVLA o π0) que permitan una comparación cuantitativa rigurosa. A continuación se indica lo que sí está documentado:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rskill-smolvla-franka_panda-libero_spatial-bf16 | ~450 M | no disponible | apache-2.0 | Hugging Face (paquete rSkill) |
| SmolVLA base (`lerobot/smolvla_base`) | ~450 M | no disponible | no disponible en la información | Hugging Face |
| Otras políticas VLA (OpenVLA, π0, etc.) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está afinado exclusivamente para el embodiment Franka Panda en simulación LIBERO; no se ha validado en otros robots ni en hardware real.
- Solo soporta instrucciones en inglés.
- El conjunto de evaluación local usa un único episodio por tarea, lo que limita la significación estadística del 0,90 reportado en LIBERO-Spatial.
- No se documentan sesgos específicos, pero al entrenarse sobre un dataset de simulación hereda las limitaciones de distribución de LIBERO (tareas de sobremesa, objetos y escenas acotados).
- Riesgo de fallo fuera de distribución: cambios en iluminación, cámaras, calibración o geometría del robot pueden degradar el rendimiento.
- La inferencia en CPU es aproximadamente 20× más lenta, lo que la hace inadecuada para control en tiempo real.
- El paquete no copia pesos: depende de la disponibilidad del checkpoint upstream `lerobot/smolvla_libero`.
- El despliegue recomendado asume co-residencia con un monitor de recompensa que consume VRAM adicional.
- Licencia Apache-2.0: permite uso comercial (`is_commercial_use_allowed: true`), pero debe verificarse la licencia de los pesos upstream y del dataset `HuggingFaceVLA/libero` para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-smolvla-franka_panda-libero_spatial-bf16
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
- Checkpoint upstream: https://huggingface.co/lerobot/smolvla_libero
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset LIBERO: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Proyecto LIBERO: https://libero-project.github.io/
- Monitor de recompensa emparejado: https://huggingface.co/OpenRAL/rskill-robometer_4b-any-general-nf4
