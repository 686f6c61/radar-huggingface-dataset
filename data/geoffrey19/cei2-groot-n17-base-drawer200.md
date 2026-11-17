# Geoffrey19/cei2-groot-n17-base-drawer200

## Resumen

GR00T N1.7 post-entrenado sobre una tarea real de manipulación robótica: abrir un cajón, coger un objeto de la mesa, colocarlo dentro y cerrar el cajón. El modelo parte del checkpoint base `nvidia/GR00T-N1.7-3B` y ha sido ajustado completamente (full fine-tune) con 200 episodios de demostraciones teleoperadas sobre un brazo Franka FR3 de 7 articulaciones equipado con una mano LEAP de 16 articulaciones. Lo publica el usuario Geoffrey19 dentro del contexto del proyecto CEI (CEI-2.0), y es una de las variantes de una receta comparativa que incluye también modelos pi05.

Se trata de un modelo de política visomotora (vision-language-action, VLA) para robótica, no de un modelo de lenguaje conversacional. Con 3.144 millones de parámetros en float32 y un repositorio de 12,6 GB, consume observaciones consistentes en una cámara RGB exterior de 640×480 más el estado articular (23 posiciones absolutas en radianes) y produce chunks de 16 pasos de acciones relativas al estado que, sumadas de nuevo al estado, dan posiciones articulares absolutas.

Su relevancia es doble: por un lado demuestra el flujo de post-entrenamiento de GR00T N1.7 sobre hardware real (FR3 + LEAP) con una receta reproducible; por otro, documenta con precisión un detalle crítico de despliegue, el orden de las articulaciones, que difiere del orden motor del dataset original y exige aplicar una permutación explícita en el cliente. La licencia NVIDIA limita el uso a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (modelo visomotor VLA; transformer con torre visual, LLM y cabeza de acciones con flow matching) |
| Parametros totales | 3.144.016.000 (3,14 B; 1.030 tensores) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; entrenamiento en bfloat16 mixed precision) |
| Idiomas soportados | no disponible (las instrucciones de tarea se pasan como prompt de texto; no se documentan idiomas) |
| Licencia | NVIDIA License (nvidia-license), uso limitado a investigación y evaluación no comercial |
| Formato de pesos | safetensors (3 shards: `model-00001-of-00003.safetensors` … `model-00003-of-00003.safetensors`, más `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint `nvidia/GR00T-N1.7-3B`, un VLA que combina percepción visual, un modelo de lenguaje y una cabeza de acciones entrenada con un objetivo de flow matching. El ajuste activa `--tune-llm --tune-visual`, además del proyector y la cabeza de acciones, es decir, se actualizan todos los componentes principales. La configuración de modalidad define los campos `arm` (dims 0-6), `hand` (dims 7-22), la cámara `exterior_1` y la clave de anotación `annotation.human.task_description`; el split articular proviene de `dataset_modality.json`.

Los datos son 200 episodios teleoperados reales (114.493 frames a 15 Hz) del dataset `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200`, con una única cámara RGB exterior de 640×480 y estado/acción de 23 posiciones articulares absolutas en radianes. Las acciones se modelan como chunks de 16 pasos de objetivos relativos al estado (`NON_EEF`), con normalización por percentiles (q01/q99 mapeados a −1/+1 y recortados) y estadísticas de acción relativa calculadas por paso de chunk a partir de este dataset (`statistics.json`). El entrenamiento usó 20.000 pasos con batch 32 en una sola GPU, learning rate pico de 2e-5 con warmup del 2,5 % y decaimiento coseno, weight decay 1e-5 y precisión mixta bfloat16 sobre pesos float32. No se documenta RLHF ni DPO; es aprendizaje por imitación supervisado.

Una innovación práctica destacable es la gestión explícita del orden de articulaciones: el modelo opera en un orden distinto al orden motor del dataset (permutación `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]`), y el repositorio incluye `joint_order.json` con ambos órdenes y la conversión. El cliente debe aplicar `P` al estado antes de enviarlo y volver a aplicarla a las acciones devueltas. Los datos de entrenamiento en formato GR00T se escribieron ya en el orden del modelo mediante `scripts/lerobot_images_to_groot.py --joint_order …`.

## Capacidades

- Generación de acciones motoras para manipulación robótica: chunks de 16 pasos de posiciones articulares absolutas para brazo (7 dims) y mano (16 dims).
- Control visomotor a partir de una cámara RGB exterior de 640×480 y del estado articular actual.
- Ejecución de tareas compuestas descritas en lenguaje natural mediante el prompt de tarea (`annotation.human.task_description`), en este caso "abrir el cajón, coger el objeto de la mesa, colocarlo dentro y cerrar el cajón".
- Política de imitación especializada en una única tarea y un único embodiment (FR3 + LEAP).
- No se documenta soporte de tool calling, function calling, agentes multi-paso en el sentido de software, capacidades multilingües ni modos de razonamiento explícito.
- No se documentan capacidades de visión general, audio ni generación de texto conversacional.

## Casos de uso

- Automatización de una celda de pick-and-place con cajón: el modelo ejecuta la secuencia completa (abrir, coger, colocar, cerrar) sobre un FR3 con mano LEAP, adecuado porque está entrenado exactamente sobre esa tarea y ese embodiment.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de post-entrenamiento de GR00T N1.7 desde el checkpoint base, con configuración resuelta en `experiment_cfg/` y log en `trainer_state.json`.
- Comparación de recetas de post-entrenamiento: al existir una variante equivalente entrenada desde el checkpoint CEI (`cei2-groot-n17-fr3v2-leaphand-112h-drawer200`), permite estudiar el efecto del punto de partida sobre la pérdida de entrenamiento.
- Validación de pipelines de despliegue GR00T: útil para probar la integración de Isaac-GR00T, la configuración de modalidad (`cei2_groot_config.py`) y la normalización por percentiles en un entorno controlado.
- Estudio de ergonomía y control de manos diestras: el modelo emite 16 articulaciones de la mano LEAP con un orden documentado, lo que facilita analizar el control fino de dedos en tareas de agarre.
- Docencia y prototipado en robótica: como checkpoint de 3,14 B en float32, sirve para ilustrar el ciclo completo datos teleoperados → normalización → política → despliegue, sin requerir un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdida de entrenamiento (objetivo de flow matching propio de cada modelo), que son ajustes a los episodios de entrenamiento y no medidas de calidad de la política. Además, los 200 episodios se usaron íntegramente para entrenamiento, sin split de validación, y no se verificó el éxito por episodio.

| Pasos | pi05 desde base | pi05 desde CEI | GR00T desde base | GR00T desde CEI |
|---|---|---|---|---|
| 0–100 | 0,1616 | 0,2178 | 1,0683 | 0,1939 |
| 4.900–5.000 | 0,0244 | 0,0222 | 0,0686 | 0,0420 |
| 9.900–10.000 | 0,0183 | 0,0177 | 0,0489 | 0,0288 |
| 14.900–15.000 | 0,0118 | 0,0113 | 0,0337 | 0,0190 |
| 19.000–20.000 | 0,0100 | 0,0094 | 0,0284 | 0,0161 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,14 B parámetros en float32, los pesos ocupan aproximadamente 12,6 GB; en bfloat16 serían unos 6,3 GB, a lo que hay que sumar activaciones y buffers del pipeline GR00T.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se realizó en una sola GPU, sin especificar modelo.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos en bfloat16 podría encajar en GPUs con 16-24 GB, pero no hay datos de consumo real ni de requisitos del pipeline completo.
- Opciones de despliegue: Isaac-GR00T con la configuración de modalidad `cei2_groot_config.py` incluida en el repositorio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Geoffrey19/cei2-groot-n17-base-drawer200 (este) | 3,14 B | no disponible | FR3 + LEAP, tarea de cajón | NVIDIA License (no comercial) | Hugging Face |
| Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200 | no disponible | no disponible | Misma tarea, entrenado desde checkpoint CEI | no disponible | Hugging Face |
| nvidia/GR00T-N1.7-3B | 3 B (según nombre) | no disponible | Base VLA generalista | NVIDIA License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la única comparación publicada es la pérdida de entrenamiento de la tabla anterior.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea y un único embodiment (FR3 de 7 articulaciones + LEAP de 16); no generaliza a otras tareas, robots ni configuraciones de cámara sin reentrenamiento.
- Sin evaluación: no hay split de validación ni verificación de éxito por episodio; el cribado solo detectó problemas de datos (huecos en datos articulares superiores a 200 ms).
- Orden de articulaciones crítico: el modelo opera en el orden del modelo, no en el orden motor del dataset. Un cliente que no aplique la permutación `P` obtendrá acciones incorrectas.
- Licencia restrictiva: NVIDIA License limita el uso a investigación y evaluación no comercial; revisar `LICENSE` antes de cualquier uso en producción.
- Riesgo de alucinación motora: como política de imitación, puede producir trayectorias no válidas fuera de la distribución de las demostraciones (objetos distintos, posiciones iniciales distintas, iluminación distinta).
- Dependencia de la normalización: las estadísticas de `statistics.json` se calcularon sobre este dataset; usarlas con otra distribución de estados puede degradar el comportamiento.
- Pesos incompletos para reentrenamiento: no se incluyen el estado del optimizador, del scheduler ni del RNG, y falta `backbone.model.lm_head.weight` (no usado por el modelo de acciones).
- Sesgos: no documentados; al entrenarse con 200 demostraciones de un operador y un entorno concretos, hereda los sesgos de esa recolección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-drawer200
- Variante desde checkpoint CEI: https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Dataset de entrenamiento: `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200` (referenciado en la model card; no se proporciona URL directa)
