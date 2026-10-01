# hmv619/ur5e_pi05_finetuned

## Resumen

`hmv619/ur5e_pi05_finetuned` es un checkpoint de política robótica obtenido mediante ajuste fino supervisado del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence. El ajuste lo publica el usuario hmv619 y está orientado a controlar un brazo robótico UR5e mediante imitación, tomando como entrada el estado de las articulaciones y una imagen de muñeca, y produciendo directamente vectores de acción de 7 dimensiones.

El modelo resuelve la tarea de manipulación concreta "Pick up the red object" y ha sido entrenado sobre un conjunto de datos muy reducido (2 episodios, 748 fotogramas a 50 FPS). Por su tamaño (~4.143 millones de parámetros) y su naturaleza de política de control, no es un modelo de lenguaje al uso, sino un componente de inferencia para robótica que se ejecuta con el ecosistema LeRobot. Su relevancia radica en demostrar el flujo de ajuste fino de π₀.₅ sobre hardware específico (UR5e) partiendo de un checkpoint preentrenado con más de 10 000 horas de datos de robot.

La arquitectura heredada de π₀.₅ es jerárquica y emplea una cabecera de *flow matching* para generar las acciones, lo que permite generalización a entornos nuevos. Este repositorio concreto es un ajuste de nicho, con cero descargas y cero valoraciones en el momento de redactar la ficha, y sin resultados de evaluación publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); transformer con cabecera de flow matching (implementación LeRobot/OpenPI de π₀.₅) |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (política robótica; la entrada es estado de articulaciones e imagen, no texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,4 GB |
| Modelo base | lerobot/pi05_base |
| Libreria | lerobot |
| Pipeline | robotics |
| Entradas | observation.state (7,), observation.images.wrist (3, 480, 640) |
| Salidas | action (7,) |
| Camaras | wrist |

## Arquitectura y entrenamiento

El modelo base π₀.₅ sigue un diseño jerárquico: primero se preentrena sobre una mezcla heterogénea de tareas y después se ajusta específicamente para manipulación móvil, combinando ejemplos de acciones de bajo nivel con "acciones semánticas" de alto nivel (predicción de subtareas como "coger..."). En este repositorio, la implementación procede de OpenPI y de LeRobot y, según la propia model card, solo se soporta la cabecera de *flow matching* tanto para entrenamiento como para inferencia. El preentrenamiento del modelo base se realizó sobre más de 10 000 horas de datos de robot, según se indica en las fuentes consultadas.

El ajuste fino de este checkpoint se ejecutó con LeRobot 0.6.2 durante 10 000 pasos, con tamaño de lote 1, optimizador AdamW y tasa de aprendizaje 2,5e-05 (semilla 1000). El conjunto de datos es `local/ur5e_pi0_dataset`, con 2 episodios, 748 fotogramas a 50 FPS y la tarea única "Pick up the red object". La política consume `observation.state` (7 dimensiones), una imagen de muñeca de 480×640 y devuelve un vector de acción de 7 dimensiones. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación adicionales, ni detalles sobre el número de tokens, la composición completa del dataset de preentrenamiento o innovaciones de decodificación.

## Capacidades

- Generación directa de acciones de control (7 dimensiones) para un brazo UR5e a partir de observaciones.
- Percepción visual mediante una cámara de muñeca (`observation.images.wrist`, 3×480×640).
- Condicionamiento por tarea ("Pick up the red object") en el flujo de ejecución.
- Ejecución de políticas de imitación de extremo a extremo entrenadas con LeRobot.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explícito como capacidades expuestas por el autor.
- Capacidades multilingües: no disponibles (la política no se presenta como modelo de texto, aunque herede un componente de lenguaje del VLM base).
- Capacidades especiales adicionales (modo *thinking*, visión general, audio): no disponibles en la información proporcionada.

## Casos de uso

- Recogida de objetos en laboratorio: el modelo ejecuta la tarea "Pick up the red object" sobre un UR5e con una única cámara de muñeca, adecuado para reproducir demostraciones de manipulación sencilla en un banco de pruebas.
- Investigación en aprendizaje por imitación: sirve como caso de referencia para estudiar cómo se comporta π₀.₅ con datasets muy pequeños (2 episodios, 748 fotogramas) y evaluar el sobreajuste.
- Evaluación de flujos de LeRobot: permite reproducir el pipeline completo de `lerobot-rollout` y `lerobot-train` con un checkpoint real ajustado, útil como plantilla didáctica.
- Pruebas de integración hardware-software: al estar ligado a un UR5e y a nombres de cámara concretos, es útil para validar la cadena de calibración, puertos y adquisición de imágenes.
- Punto de partida para ajustes posteriores: el propio autor recomienda partir de `lerobot/pi05_base`; este checkpoint puede servir como referencia de hiperparámetros (LR 2,5e-05, AdamW, 10 000 pasos) para nuevos entrenamientos.
- Comparación de comportamientos entre checkpoints π₀.₅: útil para contrastar este ajuste local con variantes como `lerobot/pi05_libero_base` o ajustes de terceros (`AiSaurabhPatil/openarm-pi05-finetuned`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito ni métricas de tarea verificables para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño de parámetros, un modelo denso de ~4,14 mil millones en bf16/fp16 requiere aproximadamente 8-9 GB de pesos, más el *overhead* del codificador visual y de activaciones.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 12-16 GB o más (por ejemplo RTX 4080/4090, RTX 3090), aunque el requisito exacto no está documentado por el autor.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, una GPU con al menos 16 GB sería lo prudente, y A100/H100 resultarían holgadas.
- Opciones de despliegue: ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`). No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp para este pipeline, al tratarse de una política robótica y no de un modelo de texto.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se registró a 50 FPS y la ejecución de ejemplo usa cámaras a 30 FPS, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hmv619/ur5e_pi05_finetuned | ~4,14 mil millones | no disponible | apache-2.0 | HuggingFace (0 descargas) | Ajuste para UR5e, tarea única, 2 episodios |
| lerobot/pi05_base | no disponible | no disponible | no disponible en la busqueda | HuggingFace | Checkpoint base de π₀.₅ en LeRobot, preentrenado con 10k+ horas |
| lerobot/pi05_libero_base | no disponible | no disponible | no disponible en la busqueda | HuggingFace | Variante orientada a los entornos LIBERO |
| AiSaurabhPatil/openarm-pi05-finetuned | no disponible | no disponible | no disponible en la busqueda | HuggingFace | Ajuste de π₀.₅ para robot bimanual OpenArm, acciones de 16 dimensiones, horizonte 16 |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente reducido: 2 episodios y 748 fotogramas para una única tarea, lo que implica un alto riesgo de sobreajuste al entorno y a la posición concreta de los objetos.
- Tarea única: únicamente se ha entrenado para "Pick up the red object"; no se puede esperar generalización a otras tareas sin nuevo ajuste.
- Dependencia del hardware: la política espera un estado de 7 dimensiones y una cámara de muñeca; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que no se puede afirmar fiabilidad en producción.
- Riesgo de alucinación / comportamiento errático: como política de imitación entrenada con pocos datos, puede producir acciones no válidas ante cambios de iluminación, posiciones o distracciones no vistas.
- Idiomas y contexto: no se documenta soporte multilingüe ni una longitud de contexto definida.
- Licencia: apache-2.0, que permite uso comercial, pero el usuario debe verificar las condiciones del modelo base `lerobot/pi05_base` y del dataset utilizado.
- Sesgos conocidos: no documentados por el autor.
- Trazabilidad: el repositorio tiene cero descargas y cero valoraciones; se desconoce su mantenimiento o soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmv619/ur5e_pi05_finetuned
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/local/ur5e_pi0_dataset
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Paper de π₀.₅: https://arxiv.org/html/2504.16054v1
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Variante comunitaria (openpi05): https://github.com/Integer003/openpi05
- Fork para UR5e (openpi-ur5e): https://github.com/F-Fer/openpi-ur5e
- Checkpoint π₀.₅ para LIBERO: https://huggingface.co/lerobot/pi05_libero_base
- Checkpoint π₀.₅ para OpenArm: https://huggingface.co/AiSaurabhPatil/openarm-pi05-finetuned
