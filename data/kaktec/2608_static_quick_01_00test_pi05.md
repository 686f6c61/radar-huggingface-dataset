# kaKTEC/2608_static_quick_01_00test_pi05

## Resumen

Este modelo es un fine-tune del modelo base `lerobot/pi05_base`, que a su vez es una implementación de π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence para la generalización en entornos abiertos. El fine-tune ha sido realizado con la librería LeRobot de Hugging Face, sobre un dataset específico de demostraciones robóticas para la tarea "Carrying a White Cube" (transportar un cubo blanco). El modelo está pensado para ser ejecutado en un robot tipo `so_follower` con dos cámaras (superior y de muñeca), y produce acciones de 6 grados de libertad a partir de observaciones de estado y visión.

La relevancia de este modelo radica en que permite evaluar la capacidad de π₀.₅ para adaptarse a tareas concretas mediante fine-tuning con pocos datos (60 episodios), un escenario típico en robótica de imitación. Al estar basado en un modelo fundacional de última generación, hereda su arquitectura de flujo (flow matching) y su capacidad de co-entrenamiento con datos heterogéneos, aunque este fine-tune concreto se limita a una única tarea. El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, con backbone de visión-lenguaje y action expert (flow matching) |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica directamente; el modelo procesa imágenes y estado, no texto largo) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `lerobot/pi05_base` es una implementación de π₀.₅, un VLA que combina un codificador de visión-lenguaje con un "action expert" que genera acciones mediante flow matching. Según el paper de Physical Intelligence, π₀.₅ se co-entrena con datos heterogéneos: demostraciones robóticas, datos web y subtareas semánticas, lo que le permite generalizar a entornos y situaciones no vistas durante el entrenamiento. La arquitectura concreta del backbone (por ejemplo, el tamaño del transformer de visión o del decodificador de acciones) no se detalla en la información disponible.

Este fine-tune se entrenó con LeRobot (versión 0.6.1) sobre el dataset `kaKTEC/2608_static_quick_01_00test_20260820_170746`, que contiene 60 episodios y 10.983 fotogramas a 30 FPS, con la tarea "Carrying a White Cube". El entrenamiento se realizó durante 60.000 pasos con un batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000. No se especifica si se usaron técnicas de RLHF o DPO; el proceso es de imitación supervisada (behavior cloning) sobre las demostraciones.

## Capacidades

- Control de robot manipulador: el modelo toma como entrada el estado del robot (6 valores) y dos imágenes RGB (superior y de muñeca, de 480x640 píxeles) y produce una acción de 6 dimensiones (probablemente posiciones o velocidades articulares).
- Ejecución de tareas de manipulación: entrenado específicamente para transportar un cubo blanco, aunque al estar basado en π₀.₅ podría heredar cierta capacidad de generalización a otras tareas similares (no verificado en este fine-tune).
- Procesamiento multimodal: integra visión (dos cámaras) y propriocepción (estado del robot) para generar acciones.
- No incluye generación de texto, tool calling, ni capacidades de agente conversacional; es un modelo puramente de control robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: este modelo sirve como punto de partida para estudiar cómo el fine-tuning de un VLA fundacional se comporta con datasets pequeños (60 episodios) en tareas de manipulación.
- Automatización de tareas repetitivas en entornos controlados: por ejemplo, en una celda de laboratorio donde un robot debe recoger y mover objetos de una posición fija a otra, aprovechando la tarea específica para la que fue entrenado.
- Evaluación de generalización en robótica: al comparar este fine-tune con el modelo base `pi05_base` o con otros fine-tunes de la misma familia, se puede medir el impacto del dataset y del entrenamiento en el rendimiento real.
- Desarrollo de pipelines de entrenamiento con LeRobot: sirve como ejemplo de cómo entrenar y desplegar políticas VLA con la herramienta `lerobot-train` y `lerobot-rollout`, útil para equipos que quieran replicar el flujo.
- Pruebas de hardware robótico: al ser un modelo ligero (4,14 B parámetros), puede ejecutarse en GPUs de consumo para validar la integración de cámaras, actuadores y el bucle de control en un robot `so_follower`.
- Benchmarking de modelos VLA en tareas concretas: este fine-tune puede utilizarse como referencia para comparar el rendimiento de π₀.₅ frente a otros modelos como GR00T N1.7 en la misma tarea, aunque no se han publicado resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito en la tarea, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B parámetros en precisión FP16, se necesitan aproximadamente 8,3 GB de VRAM solo para los pesos. Añadiendo memoria para activaciones y buffers, se recomienda al menos 12 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: una RTX 3090, RTX 4090, A100 (40 GB) o similar. En GPUs con menos de 12 GB podría ser necesario usar cuantización (no disponible en este repo) o reducir el batch.
- Compatibilidad con GPUs de consumo: sí, una RTX 3080/3090 o superior puede ejecutar el modelo, aunque la latencia dependerá de la resolución de las imágenes (480x640) y del tamaño del modelo.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que se puede ejecutar con `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). También es posible exportarlo a otros formatos (ONNX, TensorRT) si se desea optimizar, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un paso de inferencia (procesar dos imágenes y generar una acción) podría tardar del orden de decenas de milisegundos, pero esto es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kaKTEC/2608_static_quick_01_00test_pi05 (este) | 4,14 B | no disponible | Apache 2.0 | Hugging Face (safetensors) |
| lerobot/pi05_base | no disponible (presumiblemente similar) | no disponible | Apache 2.0 | Hugging Face |
| GR00T N1.7 (NVIDIA) | no disponible | no disponible | no disponible | Hugging Face (según búsqueda) |

No se dispone de datos de rendimiento comparativo (benchmarks) para estos modelos en la misma tarea. La comparativa se limita a características generales; π₀.₅ es un VLA de flujo, mientras que GR00T N1.7 usa un backbone Cosmos-Reason2/Qwen3-VL y un action transformer de flow matching, según la búsqueda web. No se pueden extraer conclusiones cuantitativas sin evaluaciones publicadas.

## Limitaciones y advertencias

- No hay resultados de evaluación: el modelo no ha sido probado en el robot real según la model card, por lo que su rendimiento real es desconocido. Cualquier uso en producción requiere una validación exhaustiva.
- Entrenamiento en una única tarea: el fine-tune se ha realizado solo para "Carrying a White Cube". La generalización a otras tareas u objetos no está garantizada, a pesar de que el modelo base π₀.₅ tenga capacidades de open-world.
- Dependencia de las cámaras y del robot: el modelo espera exactamente dos cámaras (top y wrist) con resoluciones específicas (480x640) y un robot `so_follower`. Cambios en la configuración del hardware pueden degradar el rendimiento.
- Riesgo de alucinación en acciones: como cualquier modelo de aprendizaje automático, puede generar acciones incorrectas o inseguras en situaciones no vistas. Es imprescindible implementar mecanismos de seguridad (límites de velocidad, paradas de emergencia) al desplegarlo en un robot real.
- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con un dataset pequeño y particular, puede estar sesgado hacia las condiciones de captura (iluminación, fondo, posición del cubo).
- Licencia: Apache 2.0 permite uso comercial, pero se debe citar la fuente y mantener el aviso de copyright. No hay restricciones adicionales conocidas.
- Formato de pesos: solo safetensors; no se ofrecen cuantizaciones GGUF o similares, lo que limita su uso en entornos con poca VRAM.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/kaKTEC/2608_static_quick_01_00test_pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/kaKTEC/2608_static_quick_01_00test_20260820_170746
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio openpi (código fuente de π₀.₅): https://github.com/Physical-Intelligence/openpi
- Paper de π₀.₅: https://www.pi.website/download/pi05.pdf
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
