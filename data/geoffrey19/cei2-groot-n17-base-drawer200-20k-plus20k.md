# Geoffrey19/cei2-groot-n17-base-drawer200-20k-plus20k

## Resumen

GR00T N1.7 es un modelo fundacional de visión-lenguaje-acción (VLA) para robótica desarrollado por NVIDIA, y este repositorio contiene un ajuste fino completo (*full fine-tune*) realizado por el usuario Geoffrey19 sobre el checkpoint base `nvidia/GR00T-N1.7-3B`. El modelo está especializado en una única tarea de manipulación real: abrir un cajón, recoger un objeto de la mesa, colocarlo dentro y cerrar el cajón, ejecutada con un brazo Franka FR3 de 7 articulaciones y una mano LEAP de 16 articulaciones. El entrenamiento totaliza 40.000 pasos distribuidos en dos fases de 20.000 pasos cada una, partiendo del modelo `Geoffrey19/cei2-groot-n17-base-drawer200`, que a su vez ya había sido ajustado 20.000 pasos desde el checkpoint original de NVIDIA.

La arquitectura subyacente es la de GR00T N1.7, un transformer multimodal de aproximadamente 3.140 millones de parámetros (3,14 B, 1.030 tensores en float32) que combina un codificador visual, un backbone de lenguaje y una cabeza de acción que predice *chunks* de 16 pasos de posiciones articulares relativas al estado. El modelo consume una única cámara RGB exterior de 640×480 y un vector de estado de 23 posiciones articulares absolutas en radianes, y devuelve acciones en el mismo espacio de 23 dimensiones.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de *post-training* de un VLA sobre hardware real (FR3 + LEAP) con datos teleoperados; por otro, ilustra las particularidades prácticas de desplegar estos modelos, como la permutación del orden de articulaciones entre el dataset original y el modelo, o la ausencia de un conjunto de evaluación separado. La licencia NVIDIA limita el uso a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (transformer multimodal visión-lenguaje-acción) |
| Parametros totales | 3.144.016.000 (3,14 B), 1.030 tensores |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robótica) |
| Licencia | NVIDIA License (uso no comercial, investigación y evaluación) |
| Formato de pesos | safetensors (3 shards: `model-00001-of-00003.safetensors` a `model-00003-of-00003.safetensors`) + `model.safetensors.index.json` |
| Libreria | gr00t |
| Pipeline | robotics |
| Tamano del repositorio | 12,6 GB |
| Modelo base | Geoffrey19/cei2-groot-n17-base-drawer200 (ajustado desde nvidia/GR00T-N1.7-3B) |
| Embodiment | NEW_EMBODIMENT; estado/accion `arm[0:7]`, `hand[7:23]`; video `exterior_1` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, un sistema VLA que integra percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. La cabeza de acción produce *chunks* de 16 pasos de objetivos articulares relativos al estado (`NON_EEF`), y la política suma de nuevo el estado para emitir posiciones absolutas. La normalización emplea percentiles q01/q99 mapeados a −1/+1 con recorte, y las estadísticas de acciones relativas se calculan por paso de chunk a partir de este dataset (`statistics.json`, idéntico en ambas fases). El ajuste fino es completo: `--tune-llm --tune-visual`, más proyector y cabeza de acción.

Los datos de entrenamiento son 200 episodios teleoperados reales sobre FR3 + LEAP, con 114.493 fotogramas a 15 Hz, una cámara RGB exterior de 640×480 y estado/acción de 23 posiciones articulares absolutas en radianes (donde `action[t]` es la posición medida 1/15 s después, no el comando enviado). Se usaron los 200 episodios completos, sin *split* de validación. El entrenamiento se ejecutó en una sola GPU con precisión mixta bfloat16 sobre pesos float32, batch de 32, 40.000 pasos en dos fases de 20.000 (con reinicio del estado del optimizador en el paso 20.000), tasa de aprendizaje pico de 2e-5 tras 500 pasos de *warmup* y decaimiento coseno, y *weight decay* de 1e-5. La pérdida media de entrenamiento bajó de 1,0683 (pasos 0–100) a 0,0167 (pasos 39.000–40.000).

Una innovación práctica relevante es la gestión explícita del orden de articulaciones: el modelo opera en un orden distinto al del dataset original (con `mcp_forward` antes de `mcp_side` en cada dedo), documentado con la permutación `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]`, que el cliente debe aplicar al estado entrante y de nuevo a las acciones devueltas.

## Capacidades

- Generación de acciones motoras de manipulación: predice *chunks* de 16 pasos de posiciones articulares absolutas (23 dims) para brazo FR3 (7 joints) y mano LEAP (16 joints).
- Control visomotor a partir de una única cámara RGB exterior de 640×480.
- Ejecución de una tarea compuesta de cuatro etapas: abrir cajón, recoger objeto de la mesa, colocarlo dentro y cerrar el cajón.
- Condicionamiento por instrucción de tarea en lenguaje natural (campo `annotation.human.task_description`).
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no RLHF/DPO).
- Soporte de *tool calling* / *function calling*: no disponible (modelo de robótica, no de texto).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión general, audio: no disponibles.

## Casos de uso

- Automatización de una celda de pick-and-place con cajón: el modelo ejecuta la secuencia completa abrir-recoger-colocar-cerrar sobre un FR3 + LEAP, adecuado para prototipos de manipulación de una sola tarea en laboratorio.
- Investigación en aprendizaje por imitación: sirve como punto de partida (*post-training*) para estudiar cómo el ajuste fino desde un VLA fundacional afecta a la pérdida de *flow matching* en tareas reales.
- Reproducción de experimentos de teleoperación: con 200 episodios a 15 Hz y una sola cámara, es un caso asequible para validar pipelines de conversión LeRobot → GR00T (`scripts/lerobot_images_to_groot.py`).
- Benchmark interno de despliegue VLA: permite medir latencia y throughput de un modelo de 3,14 B en una GPU concreta antes de escalar a tareas más complejas.
- Estudio de normalización y espacio de acciones: la política relativa-al-estado con percentiles q01/q99 es un ejemplo concreto para comparar esquemas de normalización en manipulación.
- Base para *fine-tuning* en variantes de la misma tarea (otros objetos, otras posiciones de cajón) reutilizando el mismo *embodiment* y la misma configuración de modalidades (`cei2_groot_config.py`).
- Validación de la gestión del orden de articulaciones: útil para probar clientes que apliquen la permutación `P` antes y después de la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay *split* de evaluación ni comprobación de éxito por episodio, por lo que no se reportan métricas de calidad de política. Solo se documenta la pérdida de entrenamiento (ajuste a los episodios, no medida de calidad):

| Pasos | GR00T desde base | GR00T desde CEI |
|---|---|---|
| 0–100 | 1,0683 | 0,1939 |
| 9.900–10.000 | 0,0489 | 0,0288 |
| 19.000–20.000 | 0,0284 | 0,0161 |
| 20.000–20.100 | 0,0284 | 0,0159 |
| 29.900–30.000 | 0,0252 | 0,0166 |
| 39.000–40.000 | 0,0167 | 0,0115 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3,14 B parámetros en float32 los pesos ocupan aproximadamente 12,6 GB, por lo que se requiere al menos una GPU con ~16 GB para cargar el checkpoint sin cuantización.
- GPU recomendadas: el autor entrenó en una sola GPU (modelo no especificado); por tamaño, encajan A100, H100 o RTX 4090. No se documentan requisitos oficiales de NVIDIA para esta variante ajustada.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en float32; en GPUs de 16 GB requeriría cuantización, para la cual no se publican formatos.
- Opciones de despliegue: librería `gr00t` (Isaac-GR00T); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (cei2-groot-n17-base-drawer200-20k-plus20k) | 3,14 B | no disponible | Manipulación FR3 + LEAP (cajón) | NVIDIA License (no comercial) | Hugging Face |
| nvidia/GR00T-N1.7-3B | ~3 B | no disponible | VLA fundacional general | NVIDIA License | Hugging Face |
| Geoffrey19/cei2-groot-n17-base-drawer200 | 3,14 B | no disponible | Misma tarea, 20k pasos | NVIDIA License | Hugging Face |
| Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200-40k | no disponible | no disponible | Misma tarea desde CEI mid-training | NVIDIA License | Hugging Face |

## Limitaciones y advertencias

- Licencia NVIDIA: uso limitado a investigación y evaluación no comercial; no apto para producción comercial sin licencia adicional.
- Sin conjunto de evaluación: los 200 episodios se usaron para entrenamiento y no se verificó el éxito por episodio, por lo que no hay evidencia cuantitativa de generalización.
- Tarea única y altamente especializada: solo abre/coloca/cierra cajón con un objeto concreto; no es un modelo generalista.
- Dependencia estricta del orden de articulaciones: el cliente debe aplicar la permutación `P` al estado y a las acciones; usarlo en el orden del dataset original produce acciones incorrectas.
- Una sola cámara RGB de 640×480 y estado de 23 dims: cualquier cambio de sensor, resolución o embodiment invalida el modelo.
- Riesgo de sobreajuste a las demostraciones (pérdida de entrenamiento muy baja, 0,0167) sin métricas de validación que lo confirmen o desmientan.
- Posibles sesgos de los datos teleoperados (posiciones, velocidades y objetos limitados al dataset `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200`).
- Riesgo de alucinación motora: al ser una política, puede generar trayectorias no válidas fuera de la distribución de entrenamiento; requiere supervisión y límites de seguridad en el robot.
- Idiomas soportados no documentados; el condicionamiento por instrucción no está validado en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-drawer200-20k-plus20k
- Modelo base (fase 1): https://huggingface.co/Geoffrey19/cei2-groot-n17-base-drawer200
- Run relacionado desde CEI mid-training: https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200-40k
- Checkpoint original de NVIDIA: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Dataset de demostraciones: `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200` (no se proporciona URL directa en la información disponible)
