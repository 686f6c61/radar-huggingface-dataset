# Geoffrey19/cei2-pi05-fr3v2-leaphand-112h-wipe200-fp32

## Resumen

`Geoffrey19/cei2-pi05-fr3v2-leaphand-112h-wipe200-fp32` es una política de robótica basada en pi05, el modelo vision-language-action (VLA) de Physical Intelligence, afinada completamente sobre demostraciones reales de teleoperación con un brazo Franka FR3 y una mano LEAP. El modelo resuelve una única tarea de manipulación: coger el borrador y limpiar una pizarra blanca. Es relevante porque documenta un pipeline completo de preentrenamiento a gran escala (112 horas de DROID retargetizadas) seguido de fine-tuning sobre hardware real, con pesos en float32 listos para desplegar mediante la librería openpi.

La arquitectura subyacente es pi05, un transformer VLA que combina percepción visual, instrucción en lenguaje natural y estado proprioceptivo para generar chunks de 16 acciones absolutas de 23 dimensiones a 15 Hz. El checkpoint parte del mid-training `cei2_pi05_fr3v2_leaphand_absq` (paso 50.000) y se afina durante 20.000 pasos adicionales con batch 32 en una sola GPU. El resultado son 3.616.757.520 parámetros (812 tensores) almacenados en safetensors, con un tamaño de repositorio de 14,5 GB.

El interés práctico del modelo reside en su receta reproducible: normalización por cuantiles q01/q99, acciones absolutas en lugar de delta, y un mapeo explícito del orden de articulaciones entre el dataset y el modelo de robot. No obstante, al no existir split de validación ni resultados en robot real, debe tratarse como un artefacto de investigación más que como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (vision-language-action transformer, openpi) |
| Parametros totales | 3.616.757.520 (812 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en float32; no se documentan variantes GGUF/INT8 |
| Idiomas soportados | no disponible (instrucción en inglés en el prompt de la tarea) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) + metadata.pt + assets/wipe200/norm_stats.json |

## Arquitectura y entrenamiento

pi05 es un transformer multimodal que procesa una imagen RGB de cámara exterior (640×480), el estado articular (23 posiciones en radianes) y un prompt textual, y emite chunks de 16 acciones absolutas de 23 dimensiones. El entrenamiento usa un objetivo de flow matching, con pesos maestros y estado del optimizador en float32 y autocast en bfloat16, sin EMA. El fine-tuning parte del checkpoint de mid-training CEI-2.0 (`cei2_pi05_fr3v2_leaphand_absq`, paso 50.000), que a su vez se entrenó sobre 112 horas de DROID retargetizadas a FR3 + LEAP (34.274 episodios de vista única), con batch 1024 en 32 GPUs.

El fine-tuning final usa 199 episodios reales (99.133 frames a 15 Hz) de la tarea "Pick up the eraser and wipe the whiteboard clean", con 20.000 pasos, batch 32, learning rate pico 2e-5 tras 500 pasos de warmup y decaimiento coseno hasta 1e-6. La innovación técnica destacable es la gestión del orden de articulaciones: el dataset graba LEAP en orden de motor (`mcp_side`, `mcp_forward`, `pip`, `dip`), mientras el modelo de robot CEI usa `mcp_forward` antes de `mcp_side`; la configuración aplica la permutación `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]` de forma transparente, de modo que la política recibe y devuelve acciones en el orden original del robot. La normalización por cuantiles (q01/q99 mapeados a −1/+1) se toma de `assets/wipe200/norm_stats.json` y no debe recalcularse.

## Capacidades

- Generación de acciones robóticas: predice chunks de 16 posiciones articulares absolutas (23-D) a 15 Hz.
- Percepción visual: consume una imagen RGB exterior de 640×480.
- Condicionamiento por instrucción en lenguaje natural mediante prompt textual.
- Fusión estado-acción: integra el estado propioceptivo actual como entrada.
- Manipulación fina con mano antropomórfica: controla 7 articulaciones del FR3 y 16 de la mano LEAP.
- Ejecución de una tarea concreta de contacto físico con herramienta (borrador) sobre superficie (pizarra).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en imitación end-to-end: reproducir la receta de fine-tuning sobre hardware FR3 + LEAP para comparar políticas pi05 partiendo de base frente a mid-training CEI, usando la tabla de pérdidas de entrenamiento como referencia.
- Prototipado de tareas de limpieza con herramienta: desplegar la política en un banco de pruebas con pizarra blanca y borrador para estudiar el comportamiento de contacto y presión en tareas de wipe.
- Estudio de normalización y representación de acciones: comparar acciones absolutas con normalización por cuantiles frente a alternativas delta en el mismo setup, gracias a la configuración `cei2_pi05_wipe200_absq`.
- Validación de pipelines de retargeting: usar el modelo como consumidor final de los renders Gaussian-splatting de CEI-2.0 para evaluar si el mid-training sintético transfiere a teleoperación real.
- Base para fine-tuning en tareas adyacentes: partir de este checkpoint (paso 20.000) para adaptar la política a otras tareas de manipulación con la misma morfología FR3 + LEAP.
- Análisis de orden de articulaciones en robots diestros: emplear la permutación `P` documentada como caso de estudio para integración entre datasets de terceros y modelos de robot propios.
- Docencia y reproducción: material de referencia para cursos de aprendizaje por imitación robótica con openpi, dado que el repositorio incluye metadata de entrenamiento y estadísticas de normalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdida de entrenamiento (flow matching) por intervalos de pasos, sin split de validación ni evaluación en robot real:

| Pasos | pi05 desde base | pi05 desde CEI (este modelo) |
|---|---|---|
| 0–100 | 0,1284 | 0,1352 |
| 4.900–5.000 | 0,0150 | 0,0130 |
| 9.900–10.000 | 0,0113 | 0,0102 |
| 14.900–15.000 | 0,0084 | 0,0076 |
| 19.000–20.000 | 0,0066 | 0,0060 |

Estos valores son ajustes a los episodios de entrenamiento, no medidas de calidad de política, y solo comparan ejecuciones del mismo modelo entre sí.

## Requisitos de hardware

- VRAM estimada: los pesos en float32 ocupan aproximadamente 14,5 GB; en inferencia con autocast bfloat16 se puede reducir el consumo, pero el checkpoint publicado está en float32.
- GPU recomendadas: A100 40/80 GB o H100 para margen holgado; una RTX 4090 (24 GB) podría alojar los pesos en float32 pero deja poco espacio para activaciones y batch.
- Cabe en GPU de consumo: probablemente en RTX 4090 o RTX 3090 (24 GB) con batch 1 y precisión reducida; no confirmado en la documentación.
- Opciones de despliegue: librería openpi con `policy_config.create_trained_policy` y la configuración `cei2_pi05_wipe200_absq` registrada (imagen openpi de CEI-2.0). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles; la política genera 16 acciones por inferencia a 15 Hz, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 fr3v2 leaphand wipe200) | 3,62 B | no disponible | Wipe con FR3 + LEAP | apache-2.0 | Hugging Face, 0 descargas |
| `Geoffrey19/cei2-pi05-base-wipe200-fp32` | no disponible | no disponible | Misma tarea, partiendo de pi05 base | apache-2.0 | Hugging Face |
| `cei2_pi05_fr3v2_leaphand_absq` (mid-training CEI) | no disponible | no disponible | Mid-training DROID retargetizado | no disponible | Referenciado en la model card |
| pi05 base (Physical-Intelligence/openpi) | no disponible | no disponible | VLA generalista | no disponible | GitHub openpi |

La comparación directa con alternativas de la misma categoría (otros VLA de manipulación como GR00T) aparece en la model card solo como pérdidas de entrenamiento: GR00T desde CEI alcanza 0,0129 en el intervalo 19.000–20.000 frente a 0,0060 de pi05 desde CEI, pero no se dispone de parámetros, contexto ni resultados de evaluación para una comparación rigurosa.

## Limitaciones y advertencias

- Sin evaluación held-out ni resultados en robot real: todas las cifras publicadas son pérdida de entrenamiento.
- Una sola tarea, una sola escena y una sola cámara: la política no generaliza más allá de la pizarra y el borrador vistos en entrenamiento.
- Los datos de mid-training CEI son renders: el robot en esas imágenes es un Gaussian splatting compuesto sobre la escena real, lo que puede introducir sesgos visuales.
- Sincronización temporal alineada por reloj del host, no por trigger hardware, lo que puede afectar la consistencia estado-acción.
- Riesgo de alucinación de acciones: al no haber validación, no se puede descartar que la política genere trayectorias fuera de límites articulares en estados no vistos.
- Dependencia estricta de `assets/wipe200/norm_stats.json`: recalcular estadísticas sobre otros datos invalida el comportamiento esperado.
- Orden de articulaciones crítico: usar el orden equivocado (motor LEAP frente a orden CEI) produce acciones incorrectas; la configuración aplica `P`, pero cualquier integración manual debe replicarlo.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de garantías de rendimiento hace desaconsejable su uso en producción sin validación propia.
- Idiomas: no se documentan capacidades multilingües; el prompt de tarea está en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-pi05-fr3v2-leaphand-112h-wipe200-fp32
- Modelo hermano desde pi05 base: https://huggingface.co/Geoffrey19/cei2-pi05-base-wipe200-fp32
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Dataset DROID: https://droid-dataset.github.io/
- Dataset de la tarea: `zwx/wipe_whiteboard_franka_leap_15hz_absolute_200` (referenciado en la model card, sin URL directa proporcionada)
