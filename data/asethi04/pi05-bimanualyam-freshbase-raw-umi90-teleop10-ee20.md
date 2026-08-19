# ASethi04/pi05-BimanualYAM-freshbase-raw-umi90-teleop10-ee20

## Resumen

Este checkpoint, identificado como `pi05-BimanualYAM-freshbase-raw-umi90-teleop10-ee20`, es un modelo de robótica basado en la arquitectura π₀.₅ (pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y publicado en el repositorio openpi. El autor, ASethi04, lo ha entrenado con la librería LeRobot para tareas de manipulación bimanual, concretamente la tarea de recoger naranjas y colocarlas en un cuenco. Se trata de un checkpoint de investigación, entrenado durante 12.000 pasos de optimizador con una mezcla de datos de demostración UMI (90%) y teleoperación (10%). El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y los pesos se almacenan en formato safetensors, ocupando 16,6 GB en el repositorio.

La relevancia de este modelo radica en que explora el entrenamiento de VLAs bimanuales con datos heterogéneos, combinando dos conjuntos de datos distintos (UMI con lidar dual y teleoperación con cámara ultrawide). Al ser un checkpoint de investigación, no está destinado a uso en producción sin validación adicional, pero sirve como referencia para la comunidad de robótica que trabaja con π₀.₅ y LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo (π₀.₅) |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de visión-lenguaje-acción basado en flujo (flow matching), que extiende π₀ con mejor generalización en entornos abiertos mediante co-entrenamiento sobre datos heterogéneos. El checkpoint concreto se entrena con LeRobot, usando una transformación de acciones relativa al estado actual: para cada brazo se predicen las coordenadas xyz, las dos primeras filas de la matriz de rotación y el valor de apertura del gripper normalizado, todo ello en un horizonte de 24 pasos (H24). La acción se calcula como `inverse(T_t) @ T_(t+k)` para k=1..24, con el brazo izquierdo primero y luego el derecho. No se usa padding terminal y se ejecuta exactamente la secuencia de 24 pasos.

Los datos de entrenamiento combinan un 90% de demostraciones UMI (dataset `brandonyang/dual-lidar-umi-independent`) y un 10% de teleoperación (dataset `brandonyang/yam-ultrawide-teleop`). El entrenamiento se realizó durante 12.000 pasos de optimizador con semilla 1000. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado con demostraciones.

## Capacidades

- Control robótico bimanual: el modelo genera acciones de posición y rotación para dos brazos simultáneamente, con control fino del gripper.
- Visión-lenguaje-acción: integra entradas visuales (probablemente imágenes de cámaras) y posibles instrucciones en lenguaje natural para ejecutar tareas de manipulación.
- Ejecución de tareas de pick-and-place: la tarea de entrenamiento consiste en recoger naranjas y colocarlas en un cuenco, lo que demuestra capacidad para manipulación de objetos.
- Uso de datos heterogéneos: entrenado con dos conjuntos de datos diferentes (UMI y teleoperación), lo que puede mejorar la robustez frente a variaciones en la distribución de datos.
- Integración con LeRobot: el modelo está empaquetado como un checkpoint de LeRobot, lo que facilita su despliegue en entornos robóticos que usan esa librería.

## Casos de uso

- Investigación en manipulación bimanual: el modelo sirve como punto de partida para estudiar el efecto de la mezcla de datos UMI y teleoperación en el rendimiento de tareas de dos brazos.
- Desarrollo de políticas de control para robots colaborativos: se puede integrar en un pipeline de LeRobot para controlar robots con dos brazos en tareas de ensamblaje o clasificación de objetos.
- Evaluación de generalización en entornos abiertos: al ser un checkpoint de π₀.₅, permite probar la capacidad del modelo para adaptarse a escenarios no vistos durante el entrenamiento.
- Benchmarking de VLAs en robótica: investigadores pueden comparar este checkpoint con otros de la misma familia (p. ej., los listados en los resultados de búsqueda) para medir el impacto de diferentes proporciones de datos.
- Teleoperación asistida: el modelo puede usarse como política de respaldo en sistemas de teleoperación, donde el operador proporciona demostraciones y el modelo aprende a imitarlas.
- Educación y formación en robótica: sirve como ejemplo práctico de entrenamiento de un VLA con LeRobot, útil para cursos y talleres sobre aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de éxito, precisión ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- El repositorio ocupa 16,6 GB, lo que sugiere pesos en precisión fp32 (4 bytes por parámetro). Para cargar el modelo en fp32 se necesitan al menos 16 GB de VRAM.
- Con cuantización a fp16 (8 GB) o int8 (4 GB) se podría reducir el requisito, pero no se han publicado archivos cuantizados.
- Se recomienda una GPU con al menos 24 GB de VRAM para inferencia en fp32 (p. ej., RTX 3090/4090, A100, H100). Para fp16, una GPU de 12-16 GB podría ser suficiente.
- El despliegue puede realizarse con LeRobot, que es la librería de referencia, o mediante el sistema openpi de Physical Intelligence. No se mencionan vLLM, llama.cpp u otras herramientas, ya que es un modelo de robótica, no de texto.
- La latencia y el throughput dependen del hardware y del entorno de inferencia; no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05-BimanualYAM-freshbase-raw-umi90-teleop10-ee20` (este) | 4,14 B | no disponible | Manipulación bimanual (pick-and-place) | no disponible | HuggingFace (checkpoint de investigación) |
| `pi05-BimanualYAM-umi75-teleop25-rotation-contracted-ee20-4k` | no disponible | no disponible | Manipulación bimanual con contracción de rotación | no disponible | HuggingFace |
| `pi05-BimanualYAM-yam-ultrawide-teleop-ee20-measured-fk-12k` | no disponible | no disponible | Manipulación bimanual con FK medida | no disponible | HuggingFace |
| π₀.₅ (modelo base de Physical Intelligence) | no publicado | no disponible | VLA generalista | Apache 2.0 (según openpi) | Repositorio openpi, paper arXiv |

Nota: los datos de los checkpoints alternativos no están disponibles en la información proporcionada. La comparativa se basa únicamente en los nombres y la descripción de la model card.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de producción. El propio autor advierte que el uso en hardware real requiere verificación de seguridad, límites articulares y de colisión, y comprobaciones de éxito I2RT.
- No se especifica la licencia, por lo que el uso comercial es incierto. Se debe contactar al autor o consultar el repositorio openpi para aclarar los términos.
- No hay información sobre sesgos, pero al ser un modelo entrenado en datos de demostración específicos (naranjas y cuenco), puede no generalizar a otros objetos o entornos.
- La longitud de contexto no está documentada; se desconoce cuántas imágenes o instrucciones puede procesar simultáneamente.
- El modelo solo ha sido entrenado para una tarea concreta; no es un VLA generalista y no se recomienda su uso fuera de ese ámbito sin reentrenamiento.
- No se han publicado métricas de rendimiento, por lo que no se puede evaluar su fiabilidad ni compararlo cuantitativamente con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-raw-umi90-teleop10-ee20
- Checkpoint alternativo (umi75-teleop25): https://huggingface.co/ASethi04/pi05-BimanualYAM-umi75-teleop25-rotation-contracted-ee20-4k
- Checkpoint alternativo (teleop ultrawide): https://huggingface.co/ASethi04/pi05-BimanualYAM-yam-ultrawide-teleop-ee20-measured-fk-12k
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Paper de π₀.₅ (arXiv): https://arxiv.org/abs/2504.16054
- Documentación de openpi en DeepWiki: https://deepwiki.com/Physical-Intelligence/openpi
