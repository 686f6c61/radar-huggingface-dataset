# logits/pi05_robodojo_step5000

## Resumen

El modelo `logits/pi05_robodojo_step5000` es un checkpoint de un modelo de visión-lenguaje-acción (VLA) basado en π₀.₅ (Pi05) de Physical Intelligence, entrenado como baseline sobre el benchmark RoboDojo y exportado en el paso 5000 de entrenamiento. El autor, identificado como "logits", lo ha publicado en HuggingFace utilizando la librería LeRobot, lo que facilita su integración en pipelines de robótica existentes.

Este modelo pertenece a la familia de políticas robóticas que combinan percepción visual, comprensión del lenguaje y generación de acciones para control end-to-end de robots. Su relevancia radica en que sirve como punto de referencia (baseline) para evaluar el rendimiento de otros métodos en el benchmark RoboDojo, un entorno de evaluación neutral y académico para tareas de manipulación robótica. Con aproximadamente 4,93 mil millones de parámetros, se sitúa en el rango de los modelos VLA de tamaño medio, aunque no se dispone de detalles sobre su arquitectura interna específica más allá de la referencia a π₀.₅.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en π₀.₅ (Physical Intelligence) |
| Parametros totales | 4.933.375.760 (~4,93B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA desarrollado por Physical Intelligence que co-entrena con datos diversos (demostraciones robóticas, datos web y subtareas semánticas) para lograr generalización en entornos abiertos. La implementación en LeRobot está adaptada del repositorio OpenPI. Sin embargo, para este checkpoint concreto no se han publicado detalles específicos sobre la arquitectura interna (tipo de transformer, mecanismos de atención, etc.) ni sobre el proceso de entrenamiento más allá de la mención a RoboDojo como dataset y el paso 5000 de exportación. Se desconoce si se aplicaron técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Control robótico end-to-end: genera acciones de articulación directamente a partir de observaciones visuales y comandos en lenguaje natural.
- Generalización open-world: hereda las capacidades de π₀.₅ para tareas de manipulación en entornos no vistos durante el entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Soporte de tool calling: no disponible (no se menciona en la información proporcionada).
- Capacidades multilingües: no disponible (el modelo está orientado a acciones robóticas, no a procesamiento de lenguaje general).

## Casos de uso

- Evaluación de políticas robóticas en RoboDojo: el modelo sirve como baseline para comparar el rendimiento de otros métodos en las tareas del benchmark, permitiendo medir progreso en manipulación robótica.
- Investigación en aprendizaje por imitación: al ser un checkpoint intermedio (step 5000), puede utilizarse para estudiar la dinámica de entrenamiento y la evolución de las capacidades a lo largo del tiempo.
- Desarrollo de sistemas de control robotico en simulacion: puede desplegarse en entornos simulados compatibles con LeRobot para probar algoritmos de control y planificación.
- Transferencia a tareas de manipulacion especificas: aunque no se han documentado casos concretos, al estar basado en π₀.₅ podría adaptarse mediante fine-tuning a tareas como ensamblaje, recogida y colocación de objetos, o interacción con herramientas.
- Benchmarking de hardware: al ser un modelo de ~4,93B parámetros, puede utilizarse para medir el rendimiento de GPUs y sistemas embebidos en inferencia de VLA.
- Educacion y formacion en robotica: como modelo abierto (aunque sin licencia especificada), puede servir para enseñar conceptos de VLA y aprendizaje por refuerzo en cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo está entrenado en RoboDojo, pero no se proporcionan métricas de rendimiento (éxito en tareas, precisión de acciones, etc.) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,93B parámetros en precisión FP32, los pesos ocuparían ~19,7 GB (coincide con el tamaño del repo). En FP16/BF16, ~9,9 GB. En cuantización INT8, ~4,9 GB, pero no se ofrecen archivos cuantizados.
- GPU recomendadas: para inferencia en FP16, una GPU con al menos 12 GB de VRAM (p. ej., RTX 4070 Ti, RTX 4080, A10) sería suficiente. Para entrenamiento o fine-tuning, se recomienda una GPU con 24 GB o más (RTX 3090, RTX 4090, A100).
- Si cabe en consumer GPU: sí, en GPUs de gama alta con 16-24 GB de VRAM, siempre que se use FP16 o cuantización.
- Opciones de despliegue: al ser un modelo de LeRobot, puede ejecutarse con las herramientas de LeRobot (entrenamiento, evaluación, inferencia). También podría convertirse a otros formatos (GGUF, ONNX) si se dispone de las herramientas adecuadas, aunque no se proporcionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| logits/pi05_robodojo_step5000 | 4,93B | no disponible | VLA (π₀.₅) | no disponible | HuggingFace |
| lerobot/pi05_base | no disponible | no disponible | VLA (π₀.₅) | no disponible | HuggingFace |
| OpenVLA (openvla/openvla-7b) | 7B | no disponible | VLA (Prismatic) | MIT | HuggingFace |
| π₀ (Physical Intelligence) | no publicado | no disponible | VLA | no disponible | No público |

Nota: los datos de OpenVLA y π₀ provienen de conocimiento general, no de la información proporcionada. No se dispone de comparativas de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado en datos de robótica, puede heredar sesgos de los entornos de entrenamiento (p. ej., distribución de objetos, configuraciones de robots).
- Riesgo de alucinacion: en el contexto de VLA, puede generar acciones incorrectas o no seguras si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; es probable que el modelo esté optimizado para comandos en inglés, pero no se confirma.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si se permite uso comercial o modificación. Se recomienda contactar al autor antes de usar en producción.
- Caveat para produccion: al ser un checkpoint de baseline (step 5000), no se ha validado su robustez en entornos reales. Es necesario realizar pruebas exhaustivas de seguridad antes de cualquier despliegue físico.

## Enlaces

- HuggingFace: https://huggingface.co/logits/pi05_robodojo_step5000
- Repositorio RoboDojo: https://github.com/robodojo-benchmark/RoboDojo
- Modelo base π₀.₅ en LeRobot: https://huggingface.co/lerobot/pi05_base
- Documentación de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Paper de π₀.₅: https://arxiv.org/html/2504.16054v1
- Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
