# HashtagRobotics/smolvla-tic-tac-toe-games-1-15-120k

## Resumen

El modelo `HashtagRobotics/smolvla-tic-tac-toe-games-1-15-120k` es un ajuste fino completo del checkpoint base `lerobot/smolvla_base` para controlar un brazo robótico SO-101 en la tarea de colocar bloques de colores en un tablero de tres en raya. Desarrollado por Hashtag Robotics, este artefacto forma parte de un sistema más amplio donde un agente de razonamiento decide el movimiento legal y la política de bajo nivel convierte esa instrucción en acciones físicas. El modelo consume dos imágenes RGB (cámara global y cámara del efector), el estado del robot de seis dimensiones y una instrucción de lenguaje natural, y predice secuencias de 50 acciones articulares mediante un experto de acciones basado en flow matching.

Con 450 millones de parámetros, es un modelo compacto dentro de la familia SmolVLA, diseñado para funcionar en hardware asequible. Su relevancia radica en demostrar que un VLA de tamaño reducido puede ejecutar tareas de manipulación reales con precisión, y en servir como referencia reproducible para la comunidad de robótica de código abierto. El entrenamiento se realizó sobre 195 episodios de un dataset público de tres en raya, con 120.000 pasos de optimización, y el checkpoint se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM backbone `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` + action expert con flow matching) |
| Parametros totales | 450.046.176 (500 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (instrucción limitada a 48 tokens) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (instrucciones en inglés por defecto, no documentado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors de 906.712.520 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, compuesta por un VLM ligero preentrenado (`SmolVLM2-500M-Video-Instruct`) que procesa imágenes y texto, y un experto de acciones entrenado con flow matching. Este experto genera un chunk de 50 acciones de seis dimensiones (posición de las articulaciones del hombro, codo, muñeca y pinza) a partir de las características visuales y lingüísticas. El entrenamiento se realizó mediante ajuste fino completo del checkpoint `lerobot/smolvla_base` sobre el dataset `HashtagRobotics/tic-tac-toe-so101-block-a-clean-v1`, que contiene 195 episodios de colocación de bloques con dos cámaras y comandos en lenguaje natural. Se aplicaron 120.000 pasos de optimización, y el preprocesador serializado renombra las claves de imagen del dataset (`observation.images.top` → `observation.images.camera1` y `observation.images.wrist` → `observation.images.camera2`). Las acciones se normalizan con la media y desviación del conjunto de entrenamiento, y se desnormalizan a la salida.

## Capacidades

- Control de brazo robótico de seis grados de libertad (SO-101) para tareas de pick-and-place y manipulación.
- Seguimiento de instrucciones en lenguaje natural (hasta 48 tokens) para seleccionar la acción física correspondiente.
- Predicción de acciones por chunks de 50 pasos temporales mediante flow matching.
- Procesamiento de dos cámaras RGB simultáneas (vista global y vista del efector).
- Integración con el ecosistema LeRobot (versión 0.6.1) para entrenamiento y despliegue.
- Capacidad de ejecutar movimientos de pinza (apertura/cierre) junto con posicionamiento articular.
- Apto para tareas de imitación learning con datos de demostración humana.

## Casos de uso

- Automatización de juegos de mesa físicos: el modelo puede ejecutar movimientos de tres en raya sobre un tablero real, sirviendo como base para sistemas de entretenimiento o demostración en ferias y museos.
- Investigación en aprendizaje por imitación: permite estudiar la transferencia de políticas VLA a hardware real con un coste reducido, gracias a su tamaño compacto y a la disponibilidad de código y datos abiertos.
- Prototipado de sistemas de manipulación guiada por lenguaje: su capacidad de interpretar instrucciones textuales lo hace útil para validar pipelines de lenguaje-acción en entornos de laboratorio.
- Educación en robótica: puede integrarse en cursos de robótica inteligente para enseñar conceptos de VLA, flow matching y control de brazos articulados, dado su bajo requisito de hardware.
- Desarrollo de asistentes robóticos para tareas repetitivas de pick-and-place en líneas de montaje pequeñas, donde la precisión y el coste son críticos.
- Evaluación de políticas de control para el brazo SO-101 en entornos simulados o reales, sirviendo como baseline para comparar otras técnicas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta métricas offline ni tasas de éxito físico, y advierte explícitamente que no se fabrican puntuaciones donde no existen resultados publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa ~906 MB en safetensors (probablemente en FP16 o BF32). Con cuantización adicional podría caber en GPUs de 4 GB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para inferencia en tiempo real. Para entrenamiento o ajuste fino, se recomienda una GPU con 12 GB o más (RTX 4070, A100, etc.).
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas de gama media gracias al tamaño compacto del modelo.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot (versión 0.6.1) y se integra con el framework `strands-robots` para ejecución en el brazo SO-101. No se mencionan despliegues con vLLM u Ollama, ya que no es un modelo de generación de texto estándar.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HashtagRobotics/smolvla-tic-tac-toe-games-1-15-120k` | 450M | 48 tokens de instrucción | Manipulación SO-101 (tres en raya) | Apache-2.0 | HuggingFace |
| `lerobot/smolvla_base` | 450M | no disponible | VLA general para manipulación | Apache-2.0 | HuggingFace |
| `cagataydev/smolvla-tictactoe` | 450M (estimado) | no disponible | Manipulación SO-101 (tres en raya, bloque A) | no especificada | HuggingFace |

No se dispone de comparaciones con modelos más grandes como OpenVLA (7B) porque el enfoque de SmolVLA es la eficiencia, y no hay datos de rendimiento público para esta tarea concreta.

## Limitaciones y advertencias

- El modelo no decide la estrategia del juego; solo ejecuta movimientos físicos. La selección del movimiento legal corresponde a un agente externo, por lo que no es autónomo en tareas de razonamiento.
- Requiere una calibración precisa de las cámaras y una correspondencia exacta entre los nombres de las cámaras (`camera1` y `camera2`) y las posiciones físicas. Un intercambio entre cámara superior y cámara del efector produce una grave distribución shift.
- La instrucción de lenguaje está limitada a 48 tokens, lo que restringe la complejidad de los comandos que puede procesar.
- No se han publicado evaluaciones de rendimiento físico (tasa de éxito en el mundo real), por lo que no hay garantías de robustez en entornos no controlados.
- El entrenamiento se realizó sobre un único dataset de 195 episodios, lo que puede limitar la generalización a otros entornos o variaciones de iluminación, textura o disposición de objetos.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo depende de hardware específico (brazo SO-101) y de la infraestructura de LeRobot, lo que condiciona su aplicación práctica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HashtagRobotics/smolvla-tic-tac-toe-games-1-15-120k
- Dataset de entrenamiento: https://huggingface.co/datasets/HashtagRobotics/tic-tac-toe-so101-block-a-clean-v1
- Repositorio GitHub del proyecto: https://github.com/Hashtag-Robotics/so101-tic-tac-toe
- Historia del proyecto: https://hashtagrobotics.tr/so101-tic-tac-toe
- Paper de SmolVLA (arXiv): https://arxiv.org/html/2506.01844v1
- Blog de SmolVLA en HuggingFace: https://huggingface.co/blog/smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo similar de cagataydev: https://huggingface.co/cagataydev/smolvla-tictactoe
