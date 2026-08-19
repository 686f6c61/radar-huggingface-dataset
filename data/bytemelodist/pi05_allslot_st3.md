# ByteMelodist/pi05_allslot_st3

## Resumen

`pi05_allslot_st3_s24000` es un checkpoint de política robótica basado en Pi0.5, un modelo de visión-lenguaje-acción (VLA) desarrollado por el ecosistema LeRobot/openpi. Este modelo concreto, publicado por ByteMelodist, está especializado en la **EBiM Task 2: manipulación de materiales deformables**, concretamente en la colocación de almohadillas térmicas sobre una superficie de cuatro ranuras. Se trata de un fine-tuning directo del checkpoint base `lerobot/pi05_base`, entrenado con 78 episodios de demostraciones grabadas con el propio sistema de captura de LeRobot.

El modelo combina un codificador de visión y lenguaje basado en PaliGemma (variante Gemma 2B) con un experto de acción de 300M parámetros, alcanzando un total de aproximadamente 4,14 mil millones de parámetros. Su espacio de acción es de 20 dimensiones e incluye control de base móvil, dos brazos FR3 de 7 grados de libertad, pinzas y altura de columna. La observación consiste en un vector de estado de 32 dimensiones y tres cámaras RGB de 224×224 píxeles. Está pensado para ser cargado con LeRobot ≥0.6 y evaluado en el benchmark EBiM Task 2.

La relevancia de este modelo radica en su enfoque práctico: es un ejemplo de fine-tuning de un VLA de propósito general para una tarea robótica concreta, con normalización por cuantiles y pipelines de pre/post-procesamiento incluidos junto a los pesos. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (PaliGemma variante Gemma 2B + action expert Gemma 300M) |
| Parametros totales | 4.143.404.816 (≈4,14B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de política robótica, no procesa texto de entrada) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (model.safetensors, 9,35 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi0.5, un VLA que combina un backbone de visión-lenguaje PaliGemma con variante `gemma_2b` y un experto de acción de 300M parámetros (`gemma_300m`). La política genera acciones en bloques de 50 pasos (`chunk_size` 50, `n_action_steps` 50) con 10 pasos de inferencia (difusión). El espacio de acción es de 20 dimensiones: velocidad de base (vx, vy, wz), posiciones absolutas de articulaciones de dos brazos FR3 (7 DOF cada uno), apertura de pinzas izquierda y derecha, y altura de columna (`spine.height.target`). La observación incluye un vector de estado de 32 dimensiones y tres imágenes RGB de 224×224 píxeles (base y dos muñecas).

El entrenamiento parte de `lerobot/pi05_base` y se realiza mediante fine-tuning supervisado con 78 episodios de demostraciones de colocación de almohadillas térmicas en cuatro ranuras, grabadas a 30 fps con el grabador de LeRobot. Se utilizó una división de evaluación del 5% y un backend de procesamiento de vídeo basado en pyav. El checkpoint corresponde al paso 24.000 de optimización. La normalización de estado y acción se realiza mediante cuantiles, con los pipelines de preprocesado y postprocesado guardados junto a los pesos para garantizar una normalización idéntica entre entrenamiento e inferencia.

## Capacidades

- Control de robot bimanual: genera comandos de acción completos para dos brazos FR3, pinzas y base móvil.
- Manipulación de materiales deformables: especializado en la colocación precisa de almohadillas térmicas, una tarea que requiere manejo de objetos no rígidos.
- Percepción multimodal: combina estado del robot (32 dimensiones) con tres vistas RGB de 224×224 píxeles.
- Generación de acciones en bloques: produce secuencias de 50 pasos de acción con 10 pasos de inferencia, lo que permite ejecución suave y planificada.
- Integración con LeRobot: compatible con la API de políticas de LeRobot ≥0.6, lo que facilita su despliegue en entornos de evaluación estándar.
- Reproducibilidad: incluye `train_config.json` con la configuración completa de entrenamiento y pipelines de normalización guardados junto a los pesos.

## Casos de uso

- Automatización de líneas de ensamblaje: el modelo puede controlar un robot bimanual para colocar almohadillas térmicas en posiciones específicas, reduciendo la intervención manual en procesos de fabricación.
- Investigación en manipulación deformable: sirve como punto de partida para estudiar estrategias de control con materiales no rígidos, donde los métodos tradicionales de planificación fallan.
- Evaluación de benchmarks robóticos: diseñado específicamente para la EBiM Task 2, permite comparar el rendimiento de Pi0.5 frente a otras políticas en una tarea estandarizada.
- Fine-tuning para tareas similares: al ser un checkpoint intermedio, puede servir como inicialización para otras tareas de manipulación con observaciones y espacios de acción similares.
- Despliegue en entornos de investigación con LeRobot: su integración directa con la librería facilita la reproducción de experimentos y la comparación con otros modelos.
- Validación de técnicas de normalización: el uso de cuantiles en lugar de normalización estándar ofrece un caso de estudio sobre el impacto de la normalización en políticas VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está orientado a la evaluación en la EBiM Task 2, pero no se incluyen métricas cuantitativas (éxito, precisión, etc.) en la model card ni en el repositorio.

## Requisitos de hardware

- Tamaño de pesos en bfloat16: aproximadamente 8,3 GB (4.143.404.816 parámetros × 2 bytes).
- VRAM estimada para inferencia: al menos 12 GB considerando el modelo en bfloat16 y overhead de activaciones, aunque el valor exacto depende del runtime y el batch size.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090, A10, A100, H100). No hay datos oficiales publicados.
- Compatibilidad con GPU de consumo: posible en RTX 4090 (24 GB) o RTX 4080 (16 GB) con cuantización, aunque el modelo se distribuye en bfloat16.
- Opciones de despliegue: LeRobot ≥0.6 como backend principal; también puede integrarse con openpi si se adapta la configuración.
- Latencia y throughput: no disponible; depende del hardware y de la configuración de inferencia (10 pasos de difusión por bloque de 50 acciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_allslot_st3` (este) | 4,14B | No aplica | Fine-tuning en EBiM Task 2 (78 episodios) | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` | 4,14B | No aplica | Preentrenamiento general en robótica | Apache 2.0 | HuggingFace |
| Pi0 (original) | 3,3B (aprox.) | No aplica | Preentrenamiento en datos robóticos diversos | Apache 2.0 | Repos de Physical Intelligence |

La comparación directa con otros modelos de política robótica no está disponible en la información proporcionada. `pi05_base` es el punto de partida de este fine-tuning, por lo que la diferencia principal radica en la especialización para la tarea de manipulación de materiales deformables. Pi0 original tiene una arquitectura similar pero con menos parámetros; sin embargo, no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la EBiM Task 2 (colocación de almohadillas térmicas en cuatro ranuras). Su rendimiento fuera de esta tarea no está garantizado.
- Datos de entrenamiento reducidos: solo 78 episodios, lo que puede limitar la generalización a variaciones del entorno (iluminación, posición de objetos, etc.).
- Sin evaluación publicada: no hay métricas de éxito ni comparativas con otras políticas, por lo que su rendimiento real es desconocido.
- Dependencia de la normalización: los pipelines de pre/post-procesamiento deben cargarse junto a los pesos; un error en su carga provocará inferencias incorrectas.
- Requisitos de hardware: al ser un modelo de 4,14B en bfloat16, requiere GPUs con suficiente VRAM; no es adecuado para dispositivos de bajo consumo.
- Sesgos y alucinaciones: al ser un modelo de política robótica, no genera texto, pero puede producir acciones subóptimas o inseguras si se usa fuera de su dominio de entrenamiento.
- Compatibilidad de versiones: requiere LeRobot ≥0.6; versiones anteriores pueden no ser compatibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ByteMelodist/pi05_allslot_st3
- Librería LeRobot: https://github.com/huggingface/lerobot
- Proyecto openpi (base de Pi0.5): https://github.com/Physical-Intelligence/openpi
- Modelo base `lerobot/pi05_base`: https://huggingface.co/lerobot/pi05_base
