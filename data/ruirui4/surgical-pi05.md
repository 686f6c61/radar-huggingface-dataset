# ruirui4/surgical-pi05

## Resumen

El modelo `surgical-pi05` es un conjunto de políticas (policies) de aprendizaje por imitación basadas en π0.5, desarrolladas por el usuario ruirui4 y publicadas en Hugging Face. Está diseñado para tareas quirúrgicas del simulador SurRoL, un entorno de simulación robótica para cirugía. El repositorio contiene checkpoints de entrenamiento completos, incluyendo los pesos del modelo y el estado del optimizador, guardados cada 10.000 pasos. El tamaño total del repositorio es de 908,2 GB.

La relevancia de este modelo radica en la aplicación de técnicas de aprendizaje por imitación a la robótica quirúrgica, un área con alto potencial para la automatización de tareas de precisión. Al estar basado en π0.5 de LeRobot, puede ser utilizado como referencia para estudiar transferencia de habilidades en entornos simulados.

Sin embargo, la información disponible no detalla la arquitectura interna, el número de parámetros ni la longitud de contexto, por lo que las especificaciones técnicas deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tuning de políticas π0.5 (Pi0.5) sobre tareas quirúrgicas del simulador SurRoL. Según la model card, el repositorio contiene cinco ejecuciones de entrenamiento distintas: `bipegtransfer_pi05_compare_20260804`, `needlepick_pi05_aligned22d_grasp3_20260811`, `needlepick_pi05_compare_20260806`, `needleregrasp_pi05_compare_20260730` y `pegtransfer_pi05_compare_20260729`. Los checkpoints se guardan cada 10.000 pasos e incluyen tanto el modelo preentrenado (`pretrained_model/`) como el estado de entrenamiento (`training_state/`) para poder reanudar el entrenamiento.

No se especifica la composición del dataset, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El nombre de las tareas sugiere que los datos consisten en demostraciones de manipulación de instrumentos quirúrgicos como agujas y pinzas. La innovación técnica principal es el uso de π0.5 y LeRobot como framework de aprendizaje por imitación, aunque no se detallan más particularidades.

## Capacidades

- Control de robots en tareas quirúrgicas simuladas mediante políticas de aprendizaje por imitación.
- Manejo de instrumentos como agujas y pinzas en entornos SurRoL.
- Las tareas incluyen transferencia entre pinzas (`bipegtransfer`, `pegtransfer`), recogida de aguja (`needlepick`) y reagarre de aguja (`needleregrasp`).
- No se proporciona información sobre soporte de tool calling, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en robótica quirúrgica: el modelo puede ser utilizado para estudiar políticas de manipulación de agujas en simulación, sirviendo como base para comparar algoritmos de aprendizaje por imitación.
- Entrenamiento de robots quirúrgicos en SurRoL: las políticas pueden ejecutarse en el simulador para evaluar el desempeño en tareas de transferencia y reagarre de instrumentos.
- Transferencia de habilidades (transfer learning): los checkpoints reanudables permiten continuar el entrenamiento desde el último paso, lo que facilita experimentos de fine-tuning adicionales.
- Benchmarking de frameworks de robótica: al estar basado en LeRobot, es útil para comparar con otros modelos de políticas en el ámbito de la cirugía simulada.
- Educación y demostración: puede emplearse como ejemplo práctico de cómo se estructura un proyecto de aprendizaje por imitación con π0.5.
- Desarrollo de sistemas de teleoperación: las políticas aprendidas pueden integrarse en pipelines de control para asistir a cirujanos en tareas repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 908,2 GB, incluyendo checkpoints y estado del optimizador. No se indica el tamaño de los pesos de inferencia de forma aislada.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. Dado el tamaño, se requiere infraestructura de entrenamiento de alta capacidad, probablemente múltiples GPUs con memoria elevada.
- No se especifica si cabe en GPUs de consumo.
- Opciones de despliegue: LeRobot es el framework indicado para cargar los checkpoints (`pretrained_model/`). También podría usarse en entornos de simulación como SurRoL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. La model card no incluye referencias a otros modelos de políticas quirúrgicas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo ha sido entrenado en tareas quirúrgicas simuladas, por lo que puede presentar overfitting al simulador y no generalizar a robots reales.
- No se han publicado detalles sobre la composición de los datos de entrenamiento, lo que dificulta evaluar posibles sesgos.
- La dependencia del framework LeRobot y la estructura de checkpoints con estado de optimizador implican un uso principalmente para investigación y reanudación de entrenamiento.
- El repositorio no incluye instrucciones de inferencia fuera del contexto de LeRobot, por lo que el despliegue en producción requeriría adaptaciones.
- Al no existir benchmarks publicados, el rendimiento real no ha sido validado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruirui4/surgical-pi05

No se encontraron enlaces adicionales en los resultados de búsqueda.
