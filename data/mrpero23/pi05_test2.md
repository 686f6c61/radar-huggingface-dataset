# mrpero23/pi05_test2

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para la generalización en entornos abiertos y para el control de robots manipuladores. Esta ficha concreta corresponde a un *fine-tuning* del modelo base `lerobot/pi05_base` publicado por el usuario `mrpero23` bajo el identificador `pi05_test2`, orientado a una única tarea de manipulación robótica: colocar un cubo en un cuenco ("place the cube in the bowl").

El modelo se distribuye a través de la librería LeRobot de Hugging Face y emplea el formato de pesos safetensors. Cuenta con aproximadamente 4.143 millones de parámetros (4,14 B) y un repositorio de 73,4 GB, lo que refleja el peso de los múltiples checkpoints y del estado del optimizador. Se trata de un ajuste fino de imitación supervisada sobre un dataset propio de 116 episodios y 100.992 fotogramas a 30 FPS, capturado con un robot de tipo `so_follower` y tres cámaras.

Su relevancia es acotada: no es un modelo de propósito general, sino una política robótica especializada y de autor individual (23 descargas, 0 *likes* en el momento de redactar esta ficha), útil como ejemplo reproducible del flujo de entrenamiento de LeRobot con π₀.₅ y como punto de partida para experimentos de imitación en robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Physical Intelligence), implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower |
| Camaras de entrada | fix, grip, fix1 (3 × 480 × 640, RGB) |
| Entrada de estado | observation.state, forma (6,) |
| Salida | action, forma (6,) |
| Dataset de entrenamiento | mrpero23/test2_20261101_202636_clean (116 episodios, 100.992 fotogramas, 30 FPS) |
| Tarea entrenada | "place the cube in the bowl" |
| Pasos de entrenamiento | 15.000 |
| Batch size | 24 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 73,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo de visión-lenguaje-acción que combina un *backbone* de visión-lenguaje con un cabezal de acciones para producir comandos motores de forma continua. La implementación disponible en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni sobre el proceso de preentrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF/DPO u otras técnicas de alineación).

El ajuste fino documentado se realizó mediante imitación supervisada sobre el dataset `mrpero23/test2_20261101_202636_clean`, compuesto por 116 episodios y 100.992 fotogramas grabados a 30 FPS con tres cámaras (vista fija, vista de pinza y una segunda vista fija). El entrenamiento se ejecutó durante 15.000 pasos con un *batch size* de 24, optimizador AdamW y una tasa de aprendizaje de 2,5e-05, usando la semilla 1000 y LeRobot 0.6.1. No se documentan innovaciones técnicas adicionales específicas de este ajuste (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones de 6 dimensiones a partir de observaciones multimodales (estado del robot y tres cámaras RGB).
- Ejecución de una tarea concreta de *pick-and-place*: "place the cube in the bowl".
- Percepción visual multimodal: procesa simultáneamente tres flujos de imagen de 480 × 640 píxeles (vista fija, vista de pinza y segunda vista fija).
- Condicionamiento por instrucción en lenguaje natural: la política acepta una descripción de tarea como entrada (parámetro `--task` en el *rollout*).
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de generación de texto libre, razonamiento simbólico, código, matemáticas, *tool calling*, agentes multi-paso ni modo *thinking*. El modelo es una política de acción, no un asistente conversacional.

## Casos de uso

- Replicación de experimentos de imitación robótica: sirve como referencia reproducible para validar el flujo completo de LeRobot (grabación de datos, entrenamiento y *rollout*) con π₀.₅ sobre un robot `so_follower`.
- Automatización de tareas de *pick-and-place* en laboratorio: el modelo ejecuta la tarea "place the cube in the bowl" en un entorno controlado, adecuado para demostraciones y pruebas de concepto.
- Base para *fine-tuning* de nuevas tareas: al partir de `lerobot/pi05_base` y estar publicado con licencia Apache 2.0, puede reentrenarse con datasets propios para otras tareas de manipulación.
- Evaluación de generalización en robótica: permite medir cómo se comporta una política entrenada con 116 episodios ante variaciones de posición de objetos o iluminación (siempre que se documenten los resultados, que aquí no se aportan).
- Docencia y formación: ejemplo didáctico de un *pipeline* VLA completo, desde la captura de datos hasta el despliegue en hardware real.
- Investigación en imitación supervisada con múltiples cámaras: el uso de tres vistas (incluida la de pinza) permite estudiar el impacto de la configuración sensorial en el rendimiento de la política.
- Integración en *benchmarks* internos de robótica: como línea base frente a otros modelos LeRobot (por ejemplo, SmolVLA) entrenados sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~4,14 B parámetros, en precisión completa (FP32) se requerirían en torno a 16,6 GB solo para pesos; en FP16/BF16, unos 8,3 GB; en cuantizaciones de 8 bits, unos 4,1 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no están confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar GPUs con al menos 16-24 GB de VRAM (RTX 4090, A100, H100) para inferencia en FP16, aunque no se documenta.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas con 16 GB o más en FP16, y en 8-12 GB con cuantización, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=mrpero23/pi05_test2`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrpero23/pi05_test2 | ~4,14 B | no disponible | Pick-and-place (cubo en cuenco) | Apache 2.0 | Hugging Face (23 descargas) |
| mrpero23/smolvla_test2 | no disponible | no disponible | Robotica (mismo dataset de entrenamiento) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | Modelo base VLA π₀.₅ | Apache 2.0 | Hugging Face |

La comparación con `smolvla_test2` es especialmente pertinente porque, según los resultados de búsqueda, se entrenó sobre el mismo dataset (`mrpero23/test2_20261101_202636_clean`), lo que permite una comparación directa de arquitecturas (SmolVLA frente a π₀.₅) sobre idénticos datos. No se dispone de métricas de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("place the cube in the bowl") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 116 episodios y ~101.000 fotogramas son una base limitada; es probable que el modelo sea sensible a cambios de iluminación, posición de objetos o configuración de cámara.
- Dependencia de la configuración de hardware: las tres cámaras (`fix`, `grip`, `fix1`) y sus índices deben coincidir exactamente con los usados en el entrenamiento para que la política funcione.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento, con riesgo físico para el robot y el entorno.
- Sesgos: no documentados, pero inherentes a los datos de captura (posición de cámara, entorno de laboratorio, objetos concretos).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la licencia del modelo base `lerobot/pi05_base` y de la arquitectura π₀.₅ original.
- Repositorio de gran tamaño (73,4 GB): la descarga y el almacenamiento pueden ser costosos.
- Autor individual con pocas descargas: no hay garantía de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrpero23/pi05_test2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mrpero23/test2_20261101_202636_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrpero23/test2_20261101_202636_clean
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de LeRobot para π₀.₅: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo comparable SmolVLA del mismo autor: https://huggingface.co/mrpero23/smolvla_test2
- Perfil del autor: https://huggingface.co/mrpero23
