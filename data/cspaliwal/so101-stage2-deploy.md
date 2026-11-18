# cspaliwal/so101-stage2-deploy

## Resumen

so101-stage2-deploy es un paquete de despliegue publicado en Hugging Face por el usuario cspaliwal que contiene un checkpoint de política robótica entrenado con el framework LeRobot (versión 0.4.4) para el brazo robótico de bajo coste SO-101. No se trata de un modelo de lenguaje, sino de una política de imitación basada en la arquitectura ACT (Action Chunking Transformer) que mapea observaciones visuales de dos cámaras USB (overhead y wrist) más el estado articular a secuencias de acciones motoras sobre servos Feetech STS3215.

El repositorio empaqueta el checkpoint principal de 10.000 pasos (`so101_stage2_act_010000`, con loss 0.038 y media móvil de 50 pasos de 0.0530) junto con scripts auxiliares de empaquetado (`pack_stage2_real.py`), inferencia (`inference.json`) y política (`policy.py`). El tamaño total del repositorio es de 0,8 GB, coherente con un modelo ACT de tamaño reducido y sus ficheros de normalización asociados.

Su relevancia radica en que documenta un flujo de trabajo completo de ajuste fino sobre datos reales de teleoperación para una tarea de manipulación concreta (recogida de cubos y traslado a bandeja), incluyendo advertencias críticas sobre el empaquetado de estadísticas de normalización y sobre los límites físicos del gripper. Es material de referencia para quien replique el pipeline, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación visomotora |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación multi-paso, `n_action_steps` configurable a 25 o 15) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), más ficheros JSON de configuración y safetensors de normalización/desnormalización |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT (Action Chunking Transformer), un transformer que predice trozos de acciones (action chunks) a partir de observaciones visuales y propioceptivas. En este caso concreto, el modelo consume imágenes de dos cámaras USB (una cenital o *scene* y otra en la muñeca o *wrist*) junto con el estado articular del brazo SO-101, y produce secuencias de acciones articulares y de gripper. El checkpoint principal se entrenó durante 10.000 pasos (aproximadamente 53,2 épocas) con una loss final de 0,038 y una media móvil de 50 pasos de 0,0530; existe un checkpoint de respaldo de 5.000 pasos (loss 0,069, media 0,0664, 27,9 épocas) con una aumentación UVC más ligera.

El flujo documentado recomienda un ajuste fino ("warm-start") exclusivamente sobre datos reales de teleoperación (30-50 demostraciones limpias), sin mezclar datos simulados, para que LeRobot 0.4.4 recalcule las estadísticas de normalización de estado/acción y la fotometría de las cámaras UVC reales. El presupuesto de entrenamiento sugerido es de 5.000 pasos con `batch_size=16` y `lr=1e-5` para 35-50 demostraciones, o 2.500 pasos para unas 20 demostraciones, ejecutado en una RTX 4090 (10-12 minutos). Una innovación operativa destacable es la regla de empaquetado: los pesos deben ir siempre acompañados de los ficheros `policy_preprocessor_step_3_normalizer_processor.safetensors` y `policy_postprocessor_step_0_unnormalizer_processor.safetensors`, ya que mezclar pesos nuevos con estadísticas antiguas corrompe los objetivos articulares en el brazo real.

## Capacidades

- Manipulación robótica visomotora: genera secuencias de acciones articulares y de gripper para el brazo SO-101 a partir de dos vistas de cámara.
- Predicción por chunks de acción: emite bloques de 25 acciones (configurable a 15) por inferencia, lo que reduce la frecuencia de replanificación.
- Control de gripper con límites físicos configurables (`gripper_min=6.0`, `gripper_max=58.0`, ampliable a 68.0) y modo `snap_gripper` desactivado por defecto para evitar sobrecargas de corriente en servos Feetech STS3215.
- Ejecución en múltiples backends de dispositivo: la política declara selección `cuda -> mps -> cpu`.
- Ajuste fino sobre datos propios: compatible con `lerobot-train` y el dataset de teleoperación real `ppprock11/so101_real_biec`.
- No dispone de capacidades de lenguaje, tool calling, razonamiento simbólico, visión general, audio ni multilingüismo.

## Casos de uso

- Replicación de la tarea de pick-and-place de cubos: el checkpoint de 10.000 pasos sirve como base cero-shot para recoger cubos y depositarlos en una bandeja, siempre que se verifiquen las cámaras cenital y de muñeca antes de grabar.
- Ajuste fino con datos propios de laboratorio: partiendo del checkpoint base, se pueden grabar 30-50 demostraciones de teleoperación real y reentrenar 5.000 pasos en una RTX 4090 en unos 10-12 minutos para adaptar la política a una nueva disposición de mesa.
- Investigación en imitación robótica de bajo coste: el paquete permite estudiar el efecto de mezclar datos simulados y reales, y por qué el autor recomienda evitar la mezcla para no desviar las estadísticas de normalización.
- Validación de pipelines de empaquetado LeRobot: los scripts `pack_stage2_real.py` e `inference.json` documentan cómo empaquetar correctamente los seis ficheros de runtime y evitar el error de mezclar pesos con normalizadores antiguos.
- Despliegue en hardware de consumo: al ejecutarse en `cuda`, `mps` o `cpu` y con un repositorio de 0,8 GB, es viable en estaciones con GPU consumer para pruebas de laboratorio.
- Docencia y formación en robótica: el playbook detalla la verificación de cámaras, el anclaje de soportes y la eliminación de episodios defectuosos, lo que lo convierte en material didáctico para prácticas de teleoperación y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos aportados son métricas de entrenamiento (loss 0,038 y media móvil de 50 pasos de 0,0530 para el checkpoint de 10.000 pasos; loss 0,069 y media de 0,0664 para el de 5.000 pasos), que no constituyen benchmarks de evaluación comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio (0,8 GB) sugiere un modelo compacto que probablemente cabe en GPUs consumer de gama media, pero no se confirma.
- GPU recomendadas: RTX 4090 para entrenamiento (10-12 minutos por ejecución de 5.000 pasos); se desaconsejan explícitamente las T4 por su lentitud en el pipeline end-to-end.
- Cabe en GPU consumer: sí, según el flujo documentado, con una RTX 4090 como referencia para el ajuste fino.
- Opciones de despliegue: LeRobot 0.4.4 con `lerobot-train` para entrenamiento y la política `policy.py` para inferencia; selección automática de dispositivo `cuda -> mps -> cpu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se indica que 25 pasos de acción equivalen a 833 ms y 15 pasos a 500 ms, lo que da una idea del horizonte temporal de control, no de la latencia de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas robóticas (por ejemplo, otras variantes de ACT, Diffusion Policy o VLA como RT-2 u OpenVLA) ni datos que permitan establecer una comparación rigurosa en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de capacidades de texto, razonamiento simbólico, tool calling o multilingüismo; cualquier uso fuera del control robótico SO-101 no está soportado.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de corrupción por empaquetado incorrecto: copiar `model.safetensors` sin los ficheros de normalización/desnormalización asociados invalida los objetivos articulares en el brazo real.
- Fragilidad ante cambios físicos: la política depende de la posición de las cámaras y de la mesa; el autor exige fijar con cinta los soportes antes de grabar para evitar derivas de extrínsecos.
- Riesgo de sobrecarga mecánica: activar `snap_gripper: true` puede provocar bloqueos por sobrecorriente en los servos Feetech STS3215 y desalinear el cubo.
- Dependencia de la versión de LeRobot: el flujo está atado a `lerobot==0.4.4`; otras versiones pueden cambiar el formato de los normalizadores.
- Sin datos de evaluación publicados: no hay benchmarks que permitan estimar la tasa de éxito de la política en tareas nuevas.
- Idiomas y sesgos: no aplica en el sentido habitual, pero no hay información sobre sesgos de comportamiento en manipulación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cspaliwal/so101-stage2-deploy
- Dataset de teleoperación real referenciado: `ppprock11/so101_real_biec` (no se proporciona URL directa en la información disponible)
- Portal de políticas del autor: https://academy.nwaves.ai/policies
- Framework LeRobot: no se proporciona URL en la información disponible
- Paper de ACT (Action Chunking Transformer): no se proporciona URL en la información disponible
