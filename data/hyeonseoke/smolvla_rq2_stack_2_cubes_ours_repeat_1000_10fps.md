# HyeonseokE/smolvla_rq2_stack_2_cubes_ours_repeat_1000_10fps

## Resumen
Este repositorio aloja una política robótica de tipo vision-language-action (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base`. Lo publica el usuario HyeonseokE dentro del ecosistema LeRobot de Hugging Face y su función es ejecutar una única tarea de manipulación: apilar un bloque verde sobre uno rojo ("Stack the green block on the red block"). El modelo consume observaciones visuales de varias cámaras y el estado propioceptivo del robot, y produce comandos de acción de 6 grados de libertad.

El interés de esta ficha radica en que SmolVLA es una familia de VLA compacta (este checkpoint tiene 450.046.176 parámetros, unos 450 M) pensada para ejecutarse en hardware de consumo, a diferencia de VLA de gran escala como OpenVLA (7B). El modelo se entrenó por imitación sobre un dataset propio de 100 episodios y 35.964 fotogramas capturados a 10 FPS con un robot `so101_follower`, lo que lo convierte en un ejemplo reproducible de flujo de trabajo LeRobot: grabar demostraciones, ajustar la política y desplegarla.

Conviene tratarlo como un artefacto experimental y de investigación más que como un producto: tiene 0 descargas y 0 "likes", no incluye resultados de evaluación en robot real y presenta algunas incoherencias internas en la definición de entradas (se detallan en las advertencias). Es relevante ahora porque ejemplifica la tendencia hacia VLA pequeños, ajustables y desplegables en GPU de gama media.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA). Detalle interno de capas no disponible |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el tamano del repo, 0.9 GB, es compatible con precision de 16 bits) |
| Idiomas soportados | no disponible (la instruccion de tarea observada esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento
Se trata de una política VLA que fusiona tres modalidades de entrada: imágenes de cámara, estado del robot y una instrucción de lenguaje en texto. La salida son vectores de acción de dimensión 6 (claves `action` y `action.radian_urdf0`). El modelo card describe SmolVLA como un VLA compacto y eficiente que alcanza rendimiento competitivo con coste computacional reducido y puede desplegarse en hardware de consumo. No se detalla en la información proporcionada la composición interna (backbone de visión-lenguaje, módulo de acción, tipo de decodificación ni mecanismo de generación de acciones).

El entrenamiento es de imitación (behavior cloning) sobre el dataset `HyeonseokE/rq2_stack_2_cubes_ours_repeat_100_10fps`: 100 episodios, 35.964 fotogramas a 10 FPS, con la tarea única "Stack the green block on the red block". La configuración de entrenamiento reportada es de 28.050 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.0. El modelo parte de `lerobot/smolvla_base` por ajuste fino. No se indica en la información disponible si hubo RLHF, DPO u otras fases de alineamiento, ni el volumen de tokens o composición del corpus de preentrenamiento del modelo base.

## Capacidades
- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so101_follower` equipado con pinza.
- Percepción visual multi-cámara: consume imágenes de varias cámaras (según el modelo card, hasta tres entradas visuales de 256x256 y estado propioceptivo de dimensión 6).
- Condicionamiento por lenguaje: acepta una instrucción de tarea en texto (en este checkpoint, la tarea de apilar bloques).
- Ejecución de una tarea concreta: apilar el bloque verde sobre el bloque rojo.
- Inferencia en tiempo real compatible con la frecuencia de control del dataset (10 FPS).
- Integración con el ecosistema LeRobot para rodaje, entrenamiento y despliegue.
- No consta soporte de tool calling, function calling, agentes multi-paso, visión generalista, audio ni modo de razonamiento (thinking) en la información disponible.

## Casos de uso
- Automatización de pick-and-place de laboratorio: usar la política para apilar piezas pequeñas en una celda de ensayo, aprovechando que el dataset de entrenamiento demuestra exactamente esa tarea.
- Banco de pruebas de imitación (imitation learning): emplear este checkpoint como referencia reproducible para comparar estrategias de recogida de datos y ajuste fino dentro de LeRobot.
- Generación de datos y evaluación de pipelines: servir como política base para medir tasas de éxito en robot real antes de escalar a otras tareas.
- Docencia e investigación en robótica: demostrar un flujo completo de VLA compacto (grabar con `so101_follower`, entrenar y desplegar) con hardware asequible.
- Desarrollo de controladores sobre SO-101: integrar la política en una pila de control que traduzca las acciones de 6 dimensiones a trayectorias del brazo.
- Pruebas de despliegue en el borde (edge): validar la ejecución de un VLA de ~450 M en GPU de gama media o incluso en CPU para tareas sencillas.
- Recolección de referencias para ajuste fino posterior: partir de este checkpoint para entrenar variantes con nuevos objetos o posiciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política ("No evaluation results have been provided for this policy yet"), por lo que no se dispone de tasas de éxito, número de ensayos ni condiciones de prueba.

## Requisitos de hardware
- Tamaño de pesos: el repositorio ocupa 0,9 GB, coherente con ~450 M de parámetros en precisión de 16 bits.
- VRAM estimada para inferencia: del orden de 1 a 2 GB para los pesos y varios cientos de MB adicionales para activaciones; cifra exacta no disponible.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en A100/H100 si se busca máxima holgura.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo actuales y en muchas integradas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch. No están indicados en la información disponible servidores de inferencia tipo vLLM o TGI, que no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles. La frecuencia de captura del dataset es de 10 FPS, lo que sugiere un régimen de control del orden de 10 Hz como referencia, sin confirmación oficial.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_rq2_stack_2_cubes_ours_repeat_1000_10fps | 450.046.176 | no disponible | Sin resultados publicados | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base (modelo base) | Tamaño de la misma familia SmolVLA; cifra exacta no disponible | no disponible | Reportado en el articulo 2506.01844; cifras no disponibles aqui | apache-2.0 | Hugging Face |
| VLA de gran escala (p. ej. OpenVLA) | Del orden de miles de millones; cifra exacta no verificada en esta informacion | no disponible | no disponible | no disponible | no disponible |

Nota: solo el modelo base está directamente relacionado con este checkpoint. Cualquier otra comparación con VLA de mayor tamaño debe verificarse en sus respectivas fichas, ya que en la información proporcionada no se incluyen datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- Ausencia total de evaluación: no hay tasas de éxito ni pruebas en robot real; el rendimiento real es desconocido.
- Especialización extrema: la política está entrenada para una única tarea ("Stack the green block on the red block") y no generaliza necesariamente a otros objetos, posiciones o instrucciones.
- Incoherencia en las entradas: el modelo card lista las cámaras como `top` y `left_wrist`, pero la tabla de entradas define `observation.images.camera1`, `camera2` y `camera3`. Esta discrepancia puede provocar errores de configuración al desplegar la política.
- Discrepancia de nombres: el identificador del modelo usa `repeat_1000` mientras que el dataset referenciado usa `repeat_100`; conviene verificar que el dataset enlazado es el realmente usado.
- Dependencia de hardware específico: requiere un robot `so101_follower` con la distribución de cámaras y el calibrado con los que se recogieron los datos; cambios de cámara, iluminación o montaje degradan el comportamiento.
- Riesgo de sobreajuste al entorno de captura: al proceder de un dataset pequeño (100 episodios), es probable que la política sea sensible a variaciones de posición, iluminación o elementos distractores.
- Sesgos: no se documentan sesgos específicos, pero el modelo solo ha visto una tarea y un entorno concretos.
- Licencia: apache-2.0 permite uso comercial, pero la ausencia de evaluación y el estado experimental desaconsejan su uso en producción sin validación previa.
- Idiomas y contexto de lenguaje: no se documenta soporte multilingüe; la instrucción de tarea observada está en inglés.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_rq2_stack_2_cubes_ours_repeat_1000_10fps
- Articulo de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_stack_2_cubes_ours_repeat_100_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_stack_2_cubes_ours_repeat_100_10fps
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
