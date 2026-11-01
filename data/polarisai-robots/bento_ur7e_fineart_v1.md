# polarisai-robots/bento_ur7e_fineart_v1

## Resumen

FineART-VLA (`bento_ur7e_fineart_v1`) es una política robótica de imitación de extremo a extremo publicada por `polarisai-robots`, derivada mediante fine-tuning del modelo base `lerobot/FineART-VLA-subtask-midtrained`, desarrollado originalmente por Scale AI y Hugging Face. El modelo extiende la arquitectura π₀.₅ con una cabeza de lenguaje entrenada que predice la siguiente subtarea en lenguaje natural (System 2) y la ejecuta con un experto de acciones basado en flow matching (System 1), empleando una técnica de "aislamiento de conocimiento" para proteger el VLM preentrenado durante el ajuste.

Esta versión concreta está especializada en una tarea de manipulación bimanual: empaquetar un fiambrera (lunchbox) con piezas de pollo frito y brócoli, o con filetes de pescado y salchichas, usando un robot UR7e con dos cámaras (vista superior y muñecas). El modelo consume el estado articular de 14 dimensiones y tres flujos de imagen de 360x640 píxeles, y produce un vector de acción de 7 dimensiones.

Es relevante porque ejemplifica el patrón actual de políticas VLA (Vision-Language-Action) jerárquicas para robótica: razonamiento en lenguaje de alto nivel combinado con control motor de baja latencia, entrenado con el framework LeRobot de Hugging Face y distribuido con pesos en safetensors listos para desplegar en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA jerárquica basada en π₀.₅ (VLM + cabeza de lenguaje + experto de acciones con flow matching) |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tareas se expresan en inglés en el dataset de entrenamiento) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue el diseño FineART-VLA: un VLM preentrenado como columna vertebral, una cabeza de lenguaje entrenada que genera la siguiente subtarea en texto (System 2) y un experto de acciones que ejecuta esa subtarea mediante flow matching (System 1). La innovación clave es el "knowledge insulation", un mecanismo que evita que el entrenamiento de la cabeza de subtareas degrade las representaciones del VLM original. El modelo base fue mid-entrenado sobre el dataset bimanual FineART, anotado densamente a nivel de subtarea.

El fine-tuning específico de esta versión se realizó sobre el dataset `polarisai-robots/bento_ur7e_v5`, compuesto por 327 episodios y 661.700 fotogramas a 60 FPS, con dos tareas de empaquetado de fiambrera. La configuración de entrenamiento reportada es de 40.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 1000 y LeRobot 0.6.2. No se documentan detalles sobre el volumen total de tokens de entrenamiento ni sobre etapas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación bimanual de extremo a extremo sobre un robot UR7e.
- Predicción de subtareas en lenguaje natural (System 2) antes de la ejecución motora.
- Generación de acciones continuas de 7 dimensiones mediante flow matching (System 1).
- Procesamiento multimodal: estado articular de 14 dimensiones más tres cámaras RGB (superior, muñeca izquierda, muñeca derecha) a 360x640.
- Ejecución condicionada por instrucción de tarea en lenguaje natural (por ejemplo, "Pack me a lunchbox with two fried chicken pieces and two brocolli.").
- Soporte de tool calling / function calling: no disponible (no aplica a este tipo de modelo).
- Soporte de agentes multi-step: la descomposición en subtareas está integrada en el propio modelo, no expuesta como API de agentes.
- Capacidades multilingües: no disponible; las instrucciones del dataset están en inglés.
- Modo thinking, visión general o audio: no disponible más allá de la percepción visual robótica descrita.

## Casos de uso

- Automatización de líneas de empaquetado alimentario: el modelo puede ejecutar la tarea de colocar piezas de pollo, brócoli, pescado o salchichas en una fiambrera sobre un UR7e, sustituyendo la programación explícita de trayectorias por una política aprendida a partir de 327 demostraciones.
- Prototipado rápido de políticas de imitación en laboratorio: sirve como punto de partida para fine-tuning con el mismo modelo base (`lerobot/FineART-VLA-subtask-midtrained`) sobre nuevos datasets capturados con LeRobot.
- Investigación en VLA jerárquicos: permite estudiar empíricamente la separación System 2 / System 1 y el efecto del knowledge insulation en tareas de manipulación real.
- Evaluación de robustez de políticas bimanuales: al incluir vistas de ambas muñecas y una vista superior, es útil para analizar cómo afectan oclusiones y cambios de iluminación al rendimiento.
- Benchmark interno de referencia para nuevos modelos de manipulación: con 661.700 fotogramas a 60 FPS, el dataset asociado permite comparar políticas con y sin cabeza de subtareas.
- Despliegue en entornos controlados de demostración: mediante `lerobot-rollout` con `--strategy.type=base` se puede ejecutar la política en tiempo real durante un periodo acotado con `--duration`, útil para demos y validación de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parámetros en safetensors, una estimación orientativa en FP16 sería de aproximadamente 8-9 GB de pesos, más el overhead del VLM y de los buffers de imagen; en FP32 se duplicaría. Estas cifras son estimaciones de ingeniería, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) debería poder alojar el modelo en precisión reducida, aunque no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas con 16 GB o más, pero no está verificado por el autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para fine-tuning con `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El dataset se capturó a 60 FPS, pero no se especifica la frecuencia de control efectiva del modelo en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `polarisai-robots/bento_ur7e_fineart_v1` | ≈4,14 B | no disponible | VLA jerárquico (π₀.₅ + cabeza de lenguaje) | gemma | Hugging Face, 28 descargas |
| `lerobot/FineART-VLA-subtask-midtrained` | no disponible | no disponible | VLA jerárquico (modelo base) | no disponible en la información | Hugging Face |
| π₀.₅ (referencia citada) | no disponible | no disponible | VLA con flow matching | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones en robot real: no hay tasas de éxito ni número de ensayos, por lo que el rendimiento real es desconocido.
- El modelo está especializado en dos tareas muy concretas de empaquetado de fiambrera; su generalización a otros objetos, contenedores o instrucciones no está demostrada.
- Depende de un robot UR7e y de una configuración exacta de cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`); cambiar nombres, índices o resolución puede romper la inferencia.
- Dataset pequeño (327 episodios) y con dos tareas, lo que aumenta el riesgo de sobreajuste al entorno de captura (posiciones de objetos, iluminación, fondo).
- Licencia `gemma`: conviene revisar los términos de uso comercial de la licencia Gemma antes de desplegar en producción; no es una licencia permisiva genérica.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en un entorno de laboratorio concreto, puede fallar ante distribuciones visuales distintas.
- Riesgo de alucinación en la cabeza de lenguaje: puede predecir subtareas inconsistentes con el estado visual, sin que se haya caracterizado este fallo.
- Idiomas: las instrucciones de tarea están en inglés; no hay evidencia de soporte multilingüe.
- Fecha de creación en el Hub (2026-10-28) posterior a la fecha actual de referencia; verificar la vigencia y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/polarisai-robots/bento_ur7e_fineart_v1
- Modelo base: https://huggingface.co/lerobot/FineART-VLA-subtask-midtrained
- Dataset de entrenamiento: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=polarisai-robots/bento_ur7e_v5
- Guía FineART-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/fineart_vla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
