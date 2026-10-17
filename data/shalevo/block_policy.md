# shalevo/block_policy

## Resumen

`shalevo/block_policy` es una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot y una imagen de cámara frontal, y produce comandos de acción de 6 grados de libertad. La desarrolla el usuario `shalevo` y está pensada para la tarea concreta de manipulación de bloques, entrenada a partir de 50 episodios de teleoperación.

El modelo resuelve el problema clásico de la robótica por imitación: aprender una política de control a partir de demostraciones humanas sin necesidad de modelar explícitamente la dinámica del entorno. ACT predice "trozos" (chunks) de acciones futuras en lugar de un único paso, lo que reduce la varianza temporal y el error de composición, y suele alcanzar tasas de éxito elevadas en tareas de manipulación fina.

Con 51.668.614 parámetros y un peso en repositorio de solo 0,2 GB, es un modelo pequeño y desplegable en hardware modesto. Su relevancia es práctica: sirve como ejemplo reproducible de un flujo LeRobot completo (grabación de datos, entrenamiento y despliegue en un robot `so_follower`), aunque carece de licencia declarada y de resultados de evaluación publicados. La fecha de creación del repositorio es el 17 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual; imitación supervisada |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (predice chunks de acción; el tamaño de chunk no figura en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea están vacías en el dataset) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot (0.6.2 en entrenamiento) |
| Tipo de robot | `so_follower` |
| Camaras | `front` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que emplea un transformer para predecir secuencias de acciones (chunks) en lugar de un único paso de control. La política recibe como observación el vector de estado del robot (6 dimensiones) y una imagen RGB de 480x640 desde una cámara frontal, y devuelve un vector de acción de 6 dimensiones. Esta formulación con chunks reduce la acumulación de errores y la varianza temporal inherente al control paso a paso.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `shalevo/record-block_20261016_222846`, compuesto por 50 episodios y 20.357 fotogramas grabados a 30 FPS. La configuración de entrenamiento fue: 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se indica en la model card si se aplicaron etapas de RLHF, DPO ni ningún ajuste posterior; tampoco se documenta la composición del dataset más allá del número de episodios y fotogramas. El campo de tarea (`Task(s)`) figura vacío.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 grados de libertad a partir de estado articular e imagen.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere modelado explícito del entorno).
- Predicción de chunks de acción, lo que aporta suavidad y estabilidad temporal en la ejecución.
- Ejecución en bucle cerrado sobre un robot `so_follower` mediante `lerobot-rollout`.
- Alimentado por una única cámara frontal (`front`), sin fusión multisensorial adicional documentada.
- No dispone de capacidad de lenguaje, tool calling, agentes ni razonamiento multi-paso: es un controlador específico de tarea.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión general, audio).

## Casos de uso

- Automatización de una tarea de recogida y colocación de bloques en un banco de laboratorio: la política reproduce la secuencia aprendida de manipulación sobre el robot `so_follower` con la cámara frontal como única entrada.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el efecto del número de episodios, la tasa de aprendizaje o el tamaño de chunk en la tasa de éxito.
- Docencia y formación en robótica: ejemplo completo y ligero (0,2 GB) del flujo LeRobot, desde la grabación hasta el despliegue con `lerobot-rollout`.
- Banco de pruebas de hardware: al ser un modelo pequeño, permite validar la calibración del robot, las cámaras y los puertos antes de invertir en entrenamientos más costosos.
- Prototipado de pipelines de teleoperación a imitación: reutilizable como plantilla para grabar nuevos datasets y reentrenar con `lerobot-train` sobre otras tareas.
- Comparación de métodos de imitación: base para contrastar ACT frente a otras políticas (por ejemplo, diffusion policy) sobre el mismo dataset de bloques.
- Reproducción de experimentos: al publicarse la configuración exacta de entrenamiento, permite reproducir el resultado con la semilla 1000.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente el aviso de que no se han proporcionado resultados de evaluación para esta política («No evaluation results have been provided for this policy yet»). No se dispone de tasas de éxito, número de ensayos ni condiciones de prueba. El artículo de referencia del método ACT (arXiv:2304.13705) reporta resultados propios, pero no son atribuibles a esta política concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,67 M de parámetros, el peso en fp32 ocupa aproximadamente 207 MB y en fp16 unos 103 MB; a ello hay que sumar las activaciones del codificador visual y los búferes de imagen, por lo que el consumo total es bajo y apto para GPU de gama de entrada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente; se indica `--policy.device=cuda` en los ejemplos de entrenamiento.
- Compatibilidad con GPU de consumo: previsiblemente sí, en tarjetas tipo RTX 3060, RTX 4060 o superiores, dado el reducido tamaño del modelo. No confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=shalevo/block_policy`); el entrenamiento se realiza con `lerobot-train` y `--policy.type=act`.
- Latencia y throughput: no disponibles. La ejecución está pensada a 30 FPS de captura de cámara, pero no se documenta el rendimiento de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de esta política ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia cualitativa:

| Modelo | Metodo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shalevo/block_policy | ACT (LeRobot) | 51.668.614 | no disponible | no disponible | Hugging Face, 0 descargas |
| Otras politicas ACT de LeRobot | ACT | no disponible | no disponible | variable | Hugging Face |
| Diffusion Policy | difusion para control | no disponible | no disponible | no disponible | repositorios de investigacion |

No se han encontrado en la información disponible modelos equivalentes con los que comparar parámetros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política, incluso sobre la tarea para la que fue entrenada.
- Licencia no declarada: la model card marca la licencia como «More Information Needed», por lo que no se puede confirmar el uso comercial. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Especialización extrema: está entrenada únicamente para un robot `so_follower` con una cámara `front` y una tarea concreta (manipulación de bloques); no es una política generalizable a otros robots, cámaras o tareas.
- Dataset muy reducido: 50 episodios y 20.357 fotogramas (unos 11 minutos a 30 FPS) aumentan el riesgo de sobreajuste a las posiciones, iluminación y objetos vistos durante la grabación.
- El campo de tarea del dataset está vacío, lo que dificulta saber qué instrucción o condición de tarea se usó.
- Sin datos sobre sesgos, robustez ante distractores, cambios de iluminación u objetos nuevos; en imitación robótica estos factores afectan directamente al éxito.
- Riesgo de fallo silencioso: una política de imitación puede producir acciones plausibles pero incorrectas ante observaciones fuera de distribución, sin señal de incertidumbre.
- No aplica el concepto de alucinación textual, pero sí el de generalización errónea fuera del dominio de entrenamiento.
- Repositorio con 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shalevo/block_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/shalevo/record-block_20261016_222846
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shalevo/record-block_20261016_222846
- Articulo ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
