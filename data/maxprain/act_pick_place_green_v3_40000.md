# MaxPrain/act_pick_place_green_v3_40000

## Resumen

`MaxPrain/act_pick_place_green_v3_40000` es una política robótica de manipulación entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el framework LeRobot 0.7.0 de Hugging Face. Su cometido es controlar un brazo robótico de bajo coste SO-101 para realizar una tarea de pick-and-place: coger un cubo verde de una posición fija de la mesa y depositarlo en una caja. No es un modelo de lenguaje ni un modelo fundacional multimodal; es un controlador visomotor específico de tarea.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors. Consume dos flujos de vídeo (cámaras `top` y `wrist` a 640×480 y 30 fps) más el estado de las seis articulaciones del brazo, y emite bloques de 100 acciones correspondientes a los objetivos de las seis articulaciones. Fue entrenado durante 40.000 pasos con 30 episodios de teleoperación (leader/follower) a 30 fps, ejecutando el entrenamiento en Hugging Face Jobs sobre una instancia `a10g-small`.

Su relevancia es acotada pero práctica: demuestra un flujo completo de entrenamiento y despliegue de políticas de imitación para robótica de bajo coste con herramientas open source (LeRobot), y se integra en un proyecto mayor (un dispensador controlado por voz) donde un detector de color HSV decide qué política invocar. No obstante, es una política de un solo escenario, sin evaluación rigurosa de tasa de éxito y sin capacidad de generalización a cambios de posición, iluminación o escena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica con el string `pick the green cube and place it in the box`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer que aprende una política de imitación a partir de demostraciones, prediciendo secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. En esta instancia, la entrada combina dos imágenes de cámara (`top` y `wrist`, 640×480, 30 fps) con el estado de las seis articulaciones del SO-101, y la salida son bloques de 100 acciones con los objetivos de las seis articulaciones.

El entrenamiento se realizó con `lerobot-train --policy.type=act` durante 40.000 pasos sobre el dataset `MaxPrain/pick_place_green_v3`, compuesto por 30 episodios de teleoperación con un par leader/follower SO-101 a 30 fps. El dataset incluye demos base y demos adicionales con cubos ya presentes en la caja, de modo que la política se emplea cuando la caja ya contiene cubos. No se documenta uso de RLHF, DPO ni ningún proceso de refinamiento por refuerzo; es imitación supervisada pura. No se especifican el número de tokens de entrenamiento (no aplica) ni innovaciones técnicas más allá del propio chunking de acciones de ACT.

## Capacidades

- Control visomotor de un brazo SO-101 de seis articulaciones para una tarea concreta de pick-and-place.
- Fusión de dos vistas de cámara (`top` y `wrist`) con el estado propioceptivo de las articulaciones.
- Predicción de secuencias de 100 acciones por inferencia (action chunking), lo que suaviza la trayectoria y reduce la frecuencia efectiva de replanificación.
- Ejecución de la tarea especificada mediante el string `pick the green cube and place it in the box`.
- Integración con LeRobot 0.7.0 mediante `lerobot-rollout` para despliegue en robot real.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües, de visión general o de audio.
- No entiende colores: la selección de política por color la realiza un componente externo (detector HSV sobre la cámara `top`).

## Casos de uso

- Demostración educativa de un pipeline completo de imitación robótica: sirve para ilustrar el ciclo dataset de teleoperación → entrenamiento con LeRobot → despliegue con `lerobot-rollout` en un brazo SO-101 de bajo coste.
- Automatización de una celda de pick-and-place con posición de pieza fija: la política repite una trayectoria aprendida hacia un punto conocido de la mesa, adecuada para entornos de laboratorio o prototipos donde la geometría no cambia.
- Módulo de una arquitectura multi-política orquestada por visión: combinada con un detector de color HSV que decide qué política lanzar según el color del cubo en cada posición, como hace el proyecto original del autor.
- Manipulación con caja parcialmente llena: al haberse entrenado también con cubos ya dentro de la caja, puede operar en escenarios donde la caja no está vacía.
- Base para fine-tuning con datos propios: al estar en LeRobot y con licencia Apache 2.0, sirve como punto de partida para reentrenar con nuevas posiciones, objetos o iluminaciones.
- Pruebas de integración hardware/software en robótica de bajo coste: útil para validar cámaras, puertos, límites de movimiento (`max_relative_target=10`) y sincronización a 30 fps antes de escalar a tareas más complejas.
- Referencia para investigación en action chunking: permite estudiar el efecto del tamaño de chunk (100 acciones) y del número de demos (30 episodios) en la estabilidad del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la tasa de éxito no se ha medido con rigor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors en un repo de 0,2 GB, la huella de pesos es del orden de cientos de MB, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el entrenamiento se realizó en una `a10g-small` (Hugging Face Jobs); para inferencia no se especifica GPU concreta. El ejemplo de uso del autor emplea `--device=mps`, es decir, Apple Silicon.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM; también en MPS (Apple Silicon) según el comando de ejemplo.
- Opciones de despliegue: `lerobot-rollout` (LeRobot 0.7.0) con `--strategy.type=base`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles. El bucle de control opera a 30 fps y la política emite chunks de 100 acciones; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MaxPrain/act_pick_place_green_v3_40000` | ACT (LeRobot) para SO-101 | 51.668.614 | no aplica | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | ACT (LeRobot) | variable según modelo | no aplica | variable | Hugging Face |
| Políticas de imitación tipo Diffusion Policy | Diffusion Policy | variable | no aplica | variable | Repos de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- La política no entiende colores: repite una trayectoria aprendida para una única posición de la mesa. Si se mueve la pila de cubos, seguirá yendo al punto donde se entrenó.
- Entrenada con pocas decenas de demos (30 episodios) en una sola mesa y una sola iluminación; la generalización a otras condiciones no está garantizada.
- La tasa de éxito no se ha medido con rigor; no hay métricas publicadas de fiabilidad.
- Con manos o cuerpos dentro de la imagen de la cámara `top`, la trayectoria cambia y el comportamiento puede degradarse.
- Las pilas de varios cubos requieren corregir la altura sumando un pequeño offset a `shoulder_lift` durante el agarre, según indica el autor.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de ejecutar movimientos incorrectos ante entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; el autor advierte de que no es un producto sanitario y que los «medicamentos» del proyecto son cubos de colores.
- No es un modelo de propósito general: no procesa lenguaje natural, no responde preguntas y no sirve para tareas distintas del pick-and-place entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxPrain/act_pick_place_green_v3_40000
- Dataset de entrenamiento: https://huggingface.co/datasets/MaxPrain/pick_place_green_v3
- Repositorio del proyecto (código, servicio del robot, agente de voz y documentación): https://github.com/maxprain12/lucia-so101-dispensador
- LeRobot (framework): https://github.com/huggingface/lerobot
