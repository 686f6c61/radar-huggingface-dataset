# jhd0313/smolvla_move-box

## Resumen

SmolVLA Move-Box es un modelo vision-lenguaje-acción (VLA) compacto, resultado del ajuste fino del modelo base lerobot/smolvla_base sobre un conjunto de datos de demostraciones robóticas propio. Lo desarrolla el usuario jhd0313 y se publica bajo licencia Apache 2.0 a través de la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica: mover una caja, partiendo de observaciones visuales y del estado de las articulaciones del robot.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB. Sigue la arquitectura SmolVLA descrita en el artículo arXiv:2506.01844, un diseño VLA compacto pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para despliegues de robótica de bajo coste y para experimentación en laboratorio.

Su relevancia actual radica en que demuestra el flujo completo de LeRobot: grabación de datos con un robot so_follower, ajuste fino de un modelo base preentrenado y despliegue mediante el comando lerobot-rollout. Es un ejemplo práctico de imitación robótica de extremo a extremo, aunque su alcance está limitado a la tarea y al entorno con los que se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje y una cabeza de acciones para producir comandos motores directamente a partir de imágenes y del estado del robot. El modelo consume cuatro entradas visuales (tres cámaras de 3×256×256 y una cámara vacía de 3×480×640) junto con un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones. El ajuste fino se realizó sobre lerobot/smolvla_base con 5000 pasos de entrenamiento, batch size de 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.0.

El conjunto de datos de entrenamiento es jhd0313/move-box_20261008_100955, con 50 episodios y 10.668 fotogramas a 30 FPS, todos correspondientes a la tarea "Move the box". No se especifica en la información disponible si hubo RLHF, DPO ni detalles sobre la composición del dataset más allá de la tarea única. El robot empleado es de tipo so_follower con cámaras overhead y wrist.

## Capacidades

- Generación de acciones motoras de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Control robótico de manipulación para la tarea específica de mover una caja.
- Procesamiento multimodal con múltiples cámaras (hasta cuatro entradas visuales).
- Ejecución en hardware de consumo gracias a su tamaño compacto de 450 millones de parámetros.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.

## Casos de uso

- Manipulación de objetos en línea de montaje: el modelo puede ejecutar la tarea de mover cajas en un puesto de trabajo robotizado, usando las cámaras overhead y wrist para localizar y desplazar el objeto.
- Investigación en imitación robótica: sirve como punto de partida para estudiar el ajuste fino de modelos VLA sobre datos propios, con un flujo reproducible mediante lerobot-train.
- Prototipado rápido en laboratorio: al caber en hardware de consumo, permite validar políticas de manipulación sin acceso a clústeres de GPU.
- Docencia y formación: útil para enseñar el ciclo completo de grabación de datos, entrenamiento y despliegue en robótica de bajo coste.
- Automatización de tareas repetitivas de pick-and-place: la política puede adaptarse a variantes de la tarea moviendo la caja entre posiciones conocidas.
- Benchmark de referencia para comparar políticas VLA compactas: al publicarse con configuración de entrenamiento detallada, permite reproducir y comparar resultados con otras políticas LeRobot.
- Despliegue en robots so_follower: integración directa mediante lerobot-rollout con la configuración de cámaras y puerto del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en precisión completa se estima alrededor de 1,8 GB de pesos, y menos de 1 GB en cuantización de 8 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; el artículo de SmolVLA indica despliegue en hardware de consumo.
- Compatibilidad con GPU de consumo: sí, por el tamaño reducido del modelo; se espera que quepa en tarjetas con 8 GB o más de VRAM (estimación orientativa).
- Opciones de despliegue: LeRobot (lerobot-rollout para inferencia y lerobot-train para entrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jhd0313/smolvla_move-box | 450 M | no disponible | Mover caja (so_follower) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Base VLA general | Apache 2.0 | Hugging Face |
| Otras políticas LeRobot | no disponible | no disponible | Tareas específicas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea ("Move the box") y un único tipo de robot (so_follower); su generalización a otras tareas u objetos no está garantizada.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito.
- El conjunto de entrenamiento es reducido (50 episodios, 10.668 fotogramas), lo que puede limitar la robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos limitados puede presentar comportamientos frágiles fuera de la distribución de entrenamiento.
- Riesgo de alucinación en el sentido de generar acciones no válidas o inseguras fuera del entorno entrenado; se recomienda supervisión humana en despliegues reales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se especifican idiomas soportados; la interacción con el modelo es mediante la tarea textual "Move the box" y observaciones visuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhd0313/smolvla_move-box
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/jhd0313/move-box_20261008_100955
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jhd0313/move-box_20261008_100955
