# seriintan/turbovla_frazier

## Resumen

El modelo `seriintan/turbovla_frazier` es una política de control robótico basada en aprendizaje por imitación, entrenada con el framework LeRobot de Hugging Face. Desarrollado por Seri Intan Kuala, el modelo implementa la arquitectura TurboVLA, una variante de los modelos de visión-lenguaje-acción (VLA) orientada a la manipulación robótica en tiempo real. Su propósito es ejecutar la tarea específica de "pick and place" de un objeto denominado Frazier en una cesta azul, utilizando un robot tipo `so_follower` con dos cámaras (frontal y de pinza).

Con 216 millones de parámetros y un tamaño de repositorio de 0,9 GB, el modelo está diseñado para ser ligero y desplegable en hardware de consumo. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. La relevancia actual radica en la creciente adopción de políticas de imitación entrenadas con LeRobot para automatizar tareas de manipulación en entornos controlados, ofreciendo una alternativa reproducible y de código abierto a los sistemas propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TurboVLA (política de visión-lenguaje-acción basada en transformadores) |
| Parametros totales | 216.072.210 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (no aplica directamente; el modelo procesa imágenes y estado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TurboVLA es una arquitectura de política de imitación que combina codificadores visuales con un transformador de acción, diseñada para ejecutar comandos de manipulación a partir de observaciones de cámara y estado del robot. El modelo procesa dos flujos de imagen (frontal y pinza) a 480×640 píxeles junto con un vector de estado de 6 dimensiones, y produce una acción de 6 dimensiones (probablemente posición y orientación del efector final). No se dispone de detalles internos sobre el mecanismo de atención o si incorpora decodificación especulativa u otras innovaciones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 100 episodios y 52.442 fotogramas a 30 FPS, correspondientes a la tarea "Pick and place Frazier to blue basket". Se usaron 20.000 pasos de entrenamiento con batch de 16, optimizador AdamW y tasa de aprendizaje de 5e-05. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al aprendizaje supervisado de comportamiento.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción multimodal: integra dos cámaras (frontal y de pinza) para localizar y manipular objetos.
- Aprendizaje por imitación: reproduce la tarea demostrada en el dataset de entrenamiento.
- Ejecución en tiempo real: diseñado para inferencia de baja latencia en entornos robóticos.
- Integración con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robótica (rollout, entrenamiento, visualización).
- No soporta generación de texto, tool calling, agentes conversacionales ni capacidades multilingües, al ser un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick and place en líneas de montaje: el modelo puede integrarse en un robot `so_follower` para recoger y colocar piezas en ubicaciones fijas, reduciendo la intervención manual.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y compatibilidad con LeRobot, permite iterar sobre nuevas tareas con pocos datos (100 episodios) y desplegar en hardware de bajo coste.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre entornos simulados y reales, o para comparar arquitecturas VLA.
- Educación en robótica: puede utilizarse en laboratorios docentes para demostrar el ciclo completo de recogida de datos, entrenamiento y despliegue de una política.
- Control de brazos robóticos en entornos de logística interna: la tarea de "pick and place" es un caso típico en almacenes; el modelo puede adaptarse a variaciones de la tarea con fine-tuning.
- Benchmarking de frameworks de robótica: al estar publicado con LeRobot, permite evaluar el rendimiento de la librería en tareas reales y comparar con otras implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No hay datos de éxito, tasa de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 216M de parámetros y entradas de imagen de 480×640, se estima un consumo de 1-2 GB en FP32, reducible con cuantización (aunque no se ofrecen pesos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 3060) es suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con hardware de consumo: sí, el modelo es lo bastante pequeño para ejecutarse en GPUs de gama media e incluso en CPU con latencias mayores (no se especifican tiempos).
- Opciones de despliegue: el ecosistema LeRobot ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, al ser un modelo de robótica, no de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo de acción continua, se espera una inferencia en el rango de milisegundos en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de robótica (p. ej., ACT, Diffusion Policy, OpenVLA). El autor ha publicado otras variantes (`turbovla-frazier-sim-v3`, `turbovla-frazier-single-tool-v2`) que podrían servir para comparar, pero no se han encontrado métricas ni especificaciones detalladas de las mismas. Se recomienda consultar el repositorio de LeRobot para benchmarks generales de políticas de imitación.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea y un robot concreto (`so_follower`); no generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Dependencia de las condiciones de captura: cambios de iluminación, fondo o posición de la cámara pueden degradar el rendimiento, ya que no se reportan técnicas de aumento de datos.
- Riesgo de alucinación en acciones: como cualquier política de imitación, puede generar comandos erróneos ante observaciones fuera de la distribución de entrenamiento, lo que en robótica puede causar movimientos inseguros.
- Sin evaluación en robot real: la model card indica que no hay resultados de éxito, por lo que el rendimiento real es desconocido.
- Limitaciones de idioma y contexto: no aplica, al ser un modelo no lingüístico.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset asociado (`seriintan/frazier_dataset_20260901_151518`) tiene su propia licencia que debe verificarse antes de su uso.
- Requisitos de calibración: el robot y las cámaras deben estar calibrados según las especificaciones de LeRobot para que las observaciones coincidan con las del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/turbovla_frazier
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Otras variantes del autor: https://huggingface.co/seriintan/turbovla-frazier-sim-v3 y https://huggingface.co/seriintan/turbovla-frazier-single-tool-v2
