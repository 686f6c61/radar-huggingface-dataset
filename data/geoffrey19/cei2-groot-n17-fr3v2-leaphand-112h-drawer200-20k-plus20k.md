# Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200-20k-plus20k

## Resumen

GR00T N1.7 es un modelo de política robótica (vision-language-action, VLA) desarrollado por NVIDIA dentro del proyecto Isaac-GR00T. Esta ficha concreta, publicada por el usuario Geoffrey19, es un ajuste fino completo sobre demostraciones reales de teleoperación con un brazo Franka FR3 (7 articulaciones) y una mano LEAP (16 articulaciones) para la tarea de abrir un cajón, recoger un objeto, colocarlo dentro y cerrarlo. El modelo parte de un checkpoint de preentrenamiento intermedio denominado CEI-2.0, que a su vez deriva de GR00T N1.7 entrenado sobre 112 horas del dataset DROID retargetizado al embodiment FR3 + LEAP.

El modelo tiene 3.144.016.000 parámetros en precisión float32 (1.030 tensores) y se distribuye en formato safetensors con un tamaño de repositorio de 12,6 GB. El entrenamiento consistió en dos fases consecutivas de 20.000 pasos cada una (40.000 en total), con batch 32, learning rate pico de 2e-5 con decaimiento coseno y precisión mixta bfloat16 sobre pesos float32. La pérdida media de la segunda fase (pasos 39.000-40.000) fue de 0,0115, frente a 0,0167 del mismo ajuste partiendo del checkpoint base de GR00T.

Es relevante porque documenta un flujo completo de posentrenamiento de un VLA sobre hardware real de bajo coste relativo (FR3 + LEAP), con todos los detalles de normalización, orden de articulaciones y configuración de modalidades expuestos de forma reproducible. La licencia NVIDIA limita su uso a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (vision-language-action, transformer multimodal con flow matching para la cabeza de acciones) |
| Parametros totales | 3.144.016.000 (1.030 tensores, float32) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de robotica; instrucciones de tarea en texto) |
| Licencia | NVIDIA License (nvidia-license), uso limitado a investigacion y evaluacion no comercial |
| Formato de pesos | safetensors (3 shards: model-0000{1,2,3}-of-00003.safetensors) + model.safetensors.index.json |

## Arquitectura y entrenamiento

El modelo es un GR00T N1.7, un VLA que combina un backbone visual y un modelo de lenguaje con una cabeza de acciones basada en flow matching que genera chunks de 16 pasos de objetivos articulares relativos al estado (NON_EEF). La entrada incluye una cámara RGB exterior (`exterior_1`, 640×480), el estado de 23 articulaciones en radianes y la descripción textual de la tarea (`annotation.human.task_description`). El ajuste fino fue completo: `--tune-llm --tune-visual`, proyector y cabeza de acciones. La normalización usa percentiles q01/q99 mapeados a −1/+1 con recorte, y las estadísticas de acciones relativas se calculan por paso de chunk a partir de este dataset (`statistics.json`, idéntico en ambas fases).

Los datos de entrenamiento son 200 episodios reales de teleoperación sobre FR3 + LEAP, con 114.493 fotogramas a 15 Hz, del dataset `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200`. Se usaron los 200 episodios sin split de validación ni verificación de éxito por episodio, por lo que no hay evaluación publicada. El entrenamiento se dividió en dos fases de 20.000 pasos con batch 32: la primera con 500 pasos de calentamiento hasta 2e-5 y decaimiento coseno, y la segunda reiniciando el estado del optimizador y el schedule desde el checkpoint de 20.000 pasos. La pérdida media pasó de 0,1939 (pasos 0-100, partiendo del checkpoint CEI) a 0,0115 (pasos 39.000-40.000).

Una innovación operativa destacable es la documentación explícita del orden de articulaciones: el modelo trabaja en el orden del robot CEI `fr3v2_leaphand` (con `mcp_forward` antes de `mcp_side` en cada dedo), y el cliente debe aplicar la permutación `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]` al estado entrante y de nuevo a las acciones devueltas. `joint_order.json` lista ambos órdenes.

## Capacidades

- Generación de acciones motoras: produce chunks de 16 pasos de posiciones articulares absolutas (7 del brazo FR3 + 16 de la mano LEAP) a partir de observaciones visuales y de estado.
- Control visuomotor: integra una cámara RGB exterior de 640×480 con el estado de 23 articulaciones para guiar la política.
- Ejecución de tareas de manipulación compuestas: la tarea entrenada encadena abrir cajón, recoger objeto, colocarlo dentro y cerrar.
- Condicionamiento por instrucción en lenguaje natural: acepta descripciones de tarea mediante `annotation.human.task_description`.
- Soporte de embodiment concreto: `NEW_EMBODIMENT` con campos `arm[0:7]`, `hand[7:23]`, vídeo `exterior_1`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; es un modelo específico de política robótica.

## Casos de uso

- Automatización de pick-and-place en almacén: el modelo puede ejecutar la secuencia abrir-contenedor, recoger-objeto, depositar y cerrar sobre una celda FR3 + LEAP, usando la cámara exterior como única entrada visual y el chunk de 16 pasos para generar trayectorias suaves a 15 Hz.
- Investigación en imitación con hardware de bajo coste: sirve como punto de partida para estudiar cómo el preentrenamiento sobre DROID retargetizado (112 h) transfiere a una tarea concreta con solo 200 episodios y 40.000 pasos de ajuste.
- Reproducción de pipelines VLA: al incluir `experiment_cfg/`, `statistics.json`, `trainer_state.json` y `cei2_groot_config.py`, permite reproducir el posentrenamiento y comparar la receta CEI frente al checkpoint base (`cei2-groot-n17-base-drawer200-40k`).
- Benchmark de retargeting de embodiment: útil para evaluar la calidad de la conversión de demostraciones DROID a FR3 + LEAP y el efecto del orden de articulaciones en el despliegue.
- Docencia y prototipado en robótica de manipulación: la tarea del cajón es un caso canónico para prácticas de teleoperación, normalización por percentiles y control por chunks.
- Base para ajuste a tareas análogas: al estar completamente ajustado con `--tune-llm --tune-visual`, puede servir de inicialización para tareas de manipulación con el mismo embodiment, aunque la licencia restringe el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay split de validación ni verificación de éxito por episodio, por lo que no se reporta evaluación. Solo se ofrecen pérdidas de entrenamiento (no medidas de calidad de política):

| Pasos | GR00T desde base | GR00T desde CEI |
|---|---|---|
| 0–100 | 1,0683 | 0,1939 |
| 9.900–10.000 | 0,0489 | 0,0288 |
| 19.000–20.000 | 0,0284 | 0,0161 |
| 20.000–20.100 | 0,0284 | 0,0159 |
| 29.900–30.000 | 0,0252 | 0,0166 |
| 39.000–40.000 | 0,0167 | 0,0115 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,14 B parámetros en float32, los pesos ocupan unos 12,6 GB; en bfloat16 bajarían a unos 6,3 GB, aunque no se publican pesos en esa precisión. Añadiendo activaciones y buffers de visión, se recomienda al menos 16 GB de VRAM en float32 y 12 GB en bfloat16.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090 (24 GB) y RTX A6000 (48 GB) son suficientes para inferencia en float32.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080/4070 Ti Super (16 GB) si se convierte a bfloat16, aunque esa conversión no está documentada por el autor.
- Opciones de despliegue: el modelo usa `library_name: gr00t`, por lo que el stack natural es Isaac-GR00T de NVIDIA; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no es un LLM de texto).
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es 15 Hz, lo que da una referencia de ciclo de 66 ms por paso de política, pero no se publican medidas de latencia real del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (cei2-groot-n17-...-20k-plus20k) | 3,14 B | no disponible | Manipulación FR3 + LEAP (cajón) | NVIDIA License (solo investigación) | Hugging Face, 0 descargas |
| Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200 | no disponible | no disponible | Misma tarea, 20.000 pasos | NVIDIA License | Hugging Face |
| Geoffrey19/cei2-groot-n17-base-drawer200-40k | no disponible | no disponible | Misma tarea desde checkpoint base | NVIDIA License | Hugging Face |
| GR00T N1.7 (NVIDIA, base) | no disponible en la información | no disponible | VLA generalista | NVIDIA License | GitHub Isaac-GR00T |

## Limitaciones y advertencias

- Licencia NVIDIA restrictiva: uso limitado a investigación y evaluación no comercial; no apto para producción comercial sin licencia adicional.
- Sin evaluación: no hay split de validación ni verificación de éxito por episodio, por lo que se desconoce la tasa real de éxito de la política.
- Específico de tarea y embodiment: entrenado solo para la secuencia abrir-recoger-colocar-cerrar con FR3 + LEAP y una única cámara exterior; no generaliza a otras tareas, brazos, manos ni configuraciones de cámara sin nuevo ajuste.
- Riesgo de sobreajuste a los 200 episodios: la pérdida de entrenamiento baja a 0,0115 sin datos de validación que confirmen generalización.
- Orden de articulaciones crítico: el cliente debe aplicar la permutación `P` al estado y a las acciones; ignorarla produce comandos incorrectos. El README del dataset de origen pide el orden de motor sin permutación, lo que no aplica a este modelo.
- Dependencia de la normalización: `statistics.json` es parte del contrato; usar otras estadísticas invalida las acciones relativas.
- Sin datos de sesgos, alucinación o multilingüismo: al ser un modelo de política, esos ejes no aplican igual que en un LLM, pero tampoco se documentan análisis de robustez ante cambios de iluminación, oclusiones o variaciones de la escena.
- Fecha de creación futura (2026-11-19) en los metadatos de Hugging Face, lo que puede indicar inconsistencias en el registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200-20k-plus20k
- Modelo base (20.000 pasos): https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200
- Misma receta desde checkpoint base: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-drawer200-40k
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Dataset DROID: https://droid-dataset.github.io/
