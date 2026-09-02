# omkarpatil/pick-blue-cylinder-right-arm-groot-sharednorm

## Resumen

Este modelo es un fine-tune del modelo fundacional de robótica `nvidia/GR00T-N1.7-3B`, desarrollado por Omkar Patil, para la tarea específica de recoger un cilindro azul con el brazo derecho en la plataforma bimanual ROBOTIS FFW SG2 Rev1. El ajuste se ha realizado con la receta *shared-norm*, que unifica la normalización de las observaciones y acciones entre un grupo de tres tareas relacionadas, permitiendo componer las políticas en el espacio de puntuaciones (score space) sin necesidad de transformaciones adicionales.

La relevancia de este modelo radica en que demuestra cómo adaptar un VLA (Vision-Language-Action) de propósito general a una tarea de manipulación concreta, manteniendo la compatibilidad con otras políticas del mismo grupo de composición. Con 3.144 millones de parámetros y un peso de 12,6 GB en precisión fp32, es un modelo de tamaño medio pensado para inferencia en robótica, entrenado sobre 25 episodios (4.796 frames) de la tarea. Su licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en transformer, derivado de GR00T N1.7-3B |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos fp32 en safetensors) |
| Idiomas soportados | no disponible (la instruccion de tarea esta en ingles, pero no se documenta soporte multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 3 shards) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de GR00T N1.7-3B, un VLA que procesa observaciones visuales (tres camaras: `cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) y estados del robot (22 dimensiones: brazos izquierdo y derecho, cabeza, elevador y odometria) para predecir acciones (16 dimensiones) en forma de chunks de 16 pasos a 15 fps, lo que equivale a un horizonte de aproximadamente 1,07 segundos.

El entrenamiento se realizó sin modificar el código de lanzamiento estándar de GR00T (`launch_finetune.py`). La única diferencia respecto a un fine-tune por defecto es el uso de estadísticas de normalización compartidas (shared-norm): se calcularon los percentiles q01/q99 sobre los 11.870 frames combinados de las tres tareas del grupo (pick-blue-cylinder-right-arm, pick-blue-cylinder-left-arm y blue-cylinder-handover) y se aplicaron de forma idéntica a cada una. Esto permite que las puntuaciones de las políticas sean directamente combinables, siempre que se verifique el mismo hash SHA-256 de las estadísticas (`c89d17a12a2d8642`).

El ajuste se ejecutó durante 20.000 pasos con un batch global de 32, learning rate de 1e-4, warmup del 5% y weight decay de 1e-5, alcanzando una pérdida final de 0,03856. Se utilizó precisión fp32 y atención PyTorch sdpa (no flash-attention-2), por lo que los resultados no son bit-reproducibles con builds de flash-attn. El entrenamiento completo tardó 3 horas y 56 minutos en una GPU A100-80GB.

## Capacidades

- Ejecuta la tarea de recoger un cilindro azul con el brazo derecho en la plataforma ROBOTIS FFW SG2 Rev1, siguiendo la instrucción en lenguaje natural "Pick up the blue cylinder".
- Control bimanual: aunque la tarea se centra en el brazo derecho, el modelo recibe estado completo de ambos brazos, cabeza, elevador y odometría (22 dims) y genera acciones para los 16 grados de libertad relevantes.
- Composición en espacio de puntuaciones: al pertenecer al grupo shared-norm, sus salidas pueden combinarse con las de los modelos hermanos (left-arm y handover) sin transformaciones adicionales, siempre que compartan el mismo hash de estadísticas.
- Inferencia directa: el checkpoint incluye los pesos en fp32 y los archivos de configuración del procesador, listos para cargar con la librería LeRobot.
- No incluye capacidades de generación de texto, razonamiento general, tool calling ni otras tareas de NLP; es un modelo puramente robótico de visión-lenguaje-acción.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un brazo ROBOTIS FFW SG2 Rev1 para recoger objetos específicos (cilindros azules) de forma repetitiva, útil en líneas de pruebas o clasificación.
- Composición de políticas para manipulación bimanual: combinando este modelo con sus hermanos left-arm y handover, se pueden crear secuencias complejas como recoger con una mano, pasar a la otra y entregar, sin necesidad de reentrenar.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de la normalización compartida en la composición de políticas VLA, comparando con variantes no-norm o per-embodiment.
- Desarrollo de sistemas de control robótico con instrucciones en lenguaje natural: demuestra cómo adaptar un modelo fundacional a una tarea concreta con pocos episodios (25), lo que puede servir de referencia para otros fine-tunes.
- Evaluación de hardware de inferencia: al ser un modelo de 3,14 B parámetros en fp32, es adecuado para medir el rendimiento de GPUs de gama media en cargas de trabajo robóticas en tiempo real.
- Benchmarking de pipelines de normalización: el hecho de que las estadísticas sean byte-idénticas entre los tres modelos permite validar herramientas de composición y verificación de integridad en sistemas multi-política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0,03856), que no es comparable con otras variantes debido a la diferencia en la escala de las normalizaciones. No hay datos de éxito en tareas, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 12,6 GB en fp32, por lo que se necesita al menos 16 GB de VRAM para cargarlo sin cuantización. Con cuantización a 8 bits o 4 bits (no incluida en el repo) podría reducirse, pero no se proporcionan versiones cuantizadas.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100-80GB son suficientes para inferencia en fp32. También podría ejecutarse en una RTX 3090 (24 GB) o similar.
- En consumer GPU: sí, cabe en GPUs de 24 GB como la RTX 3090/4090, pero no en tarjetas de 12 GB o menos sin cuantizar.
- Opciones de despliegue: al ser un modelo de la librería LeRobot, se puede cargar con su API estándar. No se menciona soporte para vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje, no a VLA robóticos.
- Latencia y throughput: no disponibles. El entrenamiento tardó 3h56m en una A100, pero la inferencia depende del hardware y del tamaño de batch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunes de GR00T para tareas específicas). El modelo base `nvidia/GR00T-N1.7-3B` es la referencia inmediata, pero no se han publicado métricas comparativas entre ambos. Tampoco hay datos de otros VLA como OpenVLA o RT-2 en este contexto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de tarea única: solo está entrenado para recoger un cilindro azul con el brazo derecho. No generaliza a otros objetos, colores o configuraciones sin un nuevo fine-tune.
- La composición con otros modelos solo es válida si comparten exactamente el mismo hash de estadísticas (`c89d17a12a2d8642`). Usar modelos con normalizaciones diferentes romperá la compatibilidad.
- El checkpoint no incluye `optimizer.pt` ni checkpoints intermedios, por lo que no es posible reanudar el entrenamiento desde este estado.
- La atención se ejecutó con PyTorch sdpa, no con flash-attention-2; los resultados pueden diferir ligeramente de una implementación con flash-attn, aunque ambas son atención exacta.
- La pérdida de entrenamiento (0,03856) no es comparable con la de modelos no-norm, ya que la escala de los objetivos es diferente.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con pocos episodios (25) y un único escenario, es probable que tenga baja robustez ante variaciones de iluminación, fondo o posición de la cámara.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7-3B tiene su propia licencia (NVIDIA Open Model License) que debe revisarse para cumplir con sus términos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/pick-blue-cylinder-right-arm-groot-sharednorm
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Página de investigación de GR00T N1.5 (referencia de la familia): https://research.nvidia.com/labs/gear/gr00t-n1_5/
