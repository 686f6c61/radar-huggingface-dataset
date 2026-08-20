# maitf/sanitized-main-liquid3-variant-b-act-optimized

## Resumen

El modelo `maitf/sanitized-main-liquid3-variant-b-act-optimized` es una política de aprendizaje por imitación para robótica, basada en el método Action Chunking with Transformers (ACT) propuesto por Zhao et al. (2023). Ha sido entrenado con la librería LeRobot de Hugging Face sobre un dataset propio del autor, `maitf/sanitized-main-liquid3-variant-b`, que contiene 76 episodios teleoperados de un robot tipo `so_follower` (SO-100) realizando la tarea de agarrar una taza, verter su contenido y dejarla en una posición neutra usando un palo. El modelo procesa imágenes de dos cámaras (vista cenital y vista de muñeca) junto con el estado del robot (6 dimensiones) y predice acciones de 6 dimensiones en forma de chunks, lo que permite un control suave y consistente.

Con 51,6 millones de parámetros, es un modelo compacto pensado para ejecutarse en tiempo real en hardware modesto. Su relevancia radica en que demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de manipulación en robots reales, con una licencia Apache 2.0 que permite uso comercial. No se han publicado resultados de evaluación en el repositorio, por lo que su rendimiento real en el robot no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en transformers que predice secuencias de acciones (chunks) en lugar de una única acción por paso. Esto reduce el error acumulativo y mejora la consistencia del movimiento. La política consume dos imágenes RGB (480x640) y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó con LeRobot versión 0.6.1, durante 20.000 pasos, con batch size de 32, optimizador AdamW y learning rate de 1e-5, con semilla 1000. El dataset de entrenamiento contiene 78.153 frames a 30 FPS, correspondientes a 76 episodios de teleoperación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento puramente de imitación supervisada.

## Capacidades

- Control robótico de precisión: predice acciones de 6 grados de libertad (posición y orientación del efector) en forma de chunks.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (cenital y de muñeca) con resolución 480x640.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad en la tarea específica entrenada.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural.
- No es multilingüe ni tiene capacidades de visión general; está especializado en la tarea de manipulación concreta.

## Casos de uso

- Automatización de tareas de pick-and-place: el modelo puede controlar un robot SO-100 para agarrar objetos, verter líquidos y reposicionarlos, como se demuestra en la tarea entrenada. Es adecuado porque ACT predice secuencias de acciones que mantienen la suavidad del movimiento.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este modelo como punto de partida para entrenar sus propias tareas con LeRobot, reutilizando la arquitectura y el flujo de entrenamiento.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el rendimiento de ACT en tareas de manipulación con dos cámaras y un robot de bajo coste.
- Demostración de LeRobot en entornos educativos: al ser un modelo pequeño y con licencia permisiva, es ideal para cursos de robótica que enseñen a entrenar y desplegar políticas en hardware real.
- Evaluación de generalización: se puede probar el modelo en variantes de la tarea (diferentes posiciones de la taza, iluminación, etc.) para medir su robustez y limitaciones.
- Desarrollo de sistemas de control en tiempo real: con 51 millones de parámetros, puede ejecutarse en GPUs de gama media o incluso en CPU para aplicaciones donde la latencia no sea crítica, aunque se recomienda GPU para el despliegue en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51,6 millones de parámetros, la inferencia en FP32 requiere aproximadamente 200 MB de VRAM (51,6M × 4 bytes). Con cuantización a FP16 o int8, el requisito baja a ~100 MB o ~50 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1650 o superior puede ejecutar la inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070 o superior).
- Compatibilidad con hardware consumer: sí, cabe en cualquier GPU moderna de consumo. También puede ejecutarse en CPU, aunque la velocidad de inferencia será menor.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También es posible exportar los pesos a otros formatos, aunque no se documentan conversiones a ONNX o TensorRT.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño del modelo y la naturaleza de la tarea, se espera una latencia de inferencia inferior a 50 ms en una GPU moderna, pero no hay valores oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el repositorio ni en la búsqueda web. Existen otras políticas ACT entrenadas con LeRobot en el Hub, pero no se han encontrado datos objetivos para comparar parámetros, rendimiento o licencia. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente con datos teleoperados de un único robot y una tarea específica; puede no generalizar a otras configuraciones de cámara, iluminación o dinámica del robot.
- Riesgo de alucinación: en robótica, el equivalente es la ejecución de acciones no seguras o fuera de la distribución de entrenamiento; no hay garantías de comportamiento seguro en situaciones no vistas.
- Limitaciones de contexto: al ser un modelo de control, no maneja lenguaje natural ni razonamiento simbólico; su "contexto" se limita a las observaciones visuales y de estado actuales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable de la seguridad en aplicaciones reales.
- Advertencia de producción: no se han publicado resultados de evaluación en robot real, por lo que su fiabilidad no está demostrada. Se recomienda validar exhaustivamente antes de cualquier despliegue en entornos no controlados.
- Dependencia del dataset: el rendimiento depende de la calidad de la teleoperación; si los episodios contienen errores o ruido, el modelo los replicará.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/maitf/sanitized-main-liquid3-variant-b-act-optimized)
- [Dataset de entrenamiento](https://huggingface.co/datasets/maitf/sanitized-main-liquid3-variant-b)
- [Dataset original sin sanitizar](https://huggingface.co/datasets/maitf/main-liquid3-variant-b)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
