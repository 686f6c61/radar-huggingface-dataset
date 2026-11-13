# felsager/pi05_cube2cross_v2_wrist_drop

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para la generalización en entornos abiertos. Este repositorio concreto, `felsager/pi05_cube2cross_v2_wrist_drop`, es un ajuste fino del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la librería LeRobot. El modelo resuelve una tarea de manipulación robótica muy específica: recoger un cubo de un color determinado (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 24,5 GB. Consume observaciones compuestas por el estado del robot (vector de 10 dimensiones) y dos flujos de imagen de 480x640 píxeles procedentes de cámaras cenital y de muñeca, produciendo como salida un vector de acción de 10 dimensiones. Está entrenado para el robot `ur5e_hand_e` con pinza.

Es relevante ahora porque demuestra el flujo de trabajo de ajuste fino de modelos VLA de gran tamaño sobre hardware asequible (un brazo UR5e con pinza), y porque forma parte del ecosistema LeRobot de Hugging Face, que estandariza el entrenamiento, la evaluación y el despliegue de políticas de imitación robótica. No obstante, se trata de un modelo de nicho, sin descargas ni validación externa publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence; implementación LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Tipo de robot | ur5e_hand_e |
| Cámaras | top, wrist (480x640, 3 canales) |
| Entrada de estado | observation.state, shape (10,) |
| Salida de acción | action, shape (10,) |
| Tamaño del repositorio | 24,5 GB |
| Librería | lerobot |
| Modelo base | lerobot/pi05_base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del VLA π₀.₅ de Physical Intelligence, cuya implementación en LeRobot se adapta del repositorio OpenPI. π₀.₅ evoluciona π₀ para generalizar a entornos y situaciones completamente nuevas no vistas durante el entrenamiento. La arquitectura combina un codificador visual (que procesa dos cámaras simultáneamente), un codificador de estado del robot y un decodificador de acciones que genera comandos motores de 10 dimensiones. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, mecanismo de atención, etc.) en la información proporcionada.

El entrenamiento se realizó sobre el conjunto de datos `felsager/vla_cubes_cross_v2`, que contiene 1000 episodios y 493.474 fotogramas a 30 FPS. Las tareas cubiertas son cuatro variantes de "recoger el cubo [color] y colocarlo sobre la cruz roja", con colores azul, verde, amarillo y rojo. La configuración de entrenamiento fue: 30.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 0, LeRobot versión 0.6.2. No se especifica si hubo RLHF, DPO u otras técnicas de alineación, ni la composición exacta del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para un brazo UR5e con pinza, incluyendo posiciones y posiblemente apertura/cierre de la pinza.
- Percepción visual multimodal: procesa dos cámaras simultáneas (cenital y de muñeca) para localizar objetos y planificar la acción.
- Ejecución de tareas de pick-and-place: recoger un cubo de color específico y colocarlo sobre una cruz roja, con cuatro variantes de color.
- Generalización limitada al dominio de entrenamiento: el modelo base π₀.₅ está diseñado para generalizar a entornos nuevos, pero este ajuste fino está especializado en la tarea concreta de cubos y cruces.
- Integración con LeRobot: soporta el flujo de trabajo completo de LeRobot para entrenamiento, evaluación y despliegue mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües, modo thinking, visión general, audio u otras capacidades cognitivas.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de recoger un cubo de color y colocarlo sobre una cruz roja en un entorno controlado, usando las cámaras cenital y de muñeca para localizar los objetos y planificar la trayectoria. Es adecuado para demostraciones de investigación en manipulación robótica.
- Prototipado rápido de políticas de imitación: al estar integrado en LeRobot, permite a investigadores clonar el repositorio, ejecutar `lerobot-rollout` con un UR5e y validar el comportamiento en menos de una hora, sirviendo como punto de partida para nuevos ajustes finos.
- Generación de datos sintéticos o aumento de dataset: el modelo puede ejecutarse en modo rollout para generar trayectorias adicionales que alimenten nuevos entrenamientos, aunque no se especifica si el script soporta grabación de episodios (con `--strategy.type=base` no se graban).
- Educación y formación en robótica: sirve como ejemplo didáctico de un pipeline completo de VLA, desde la grabación de datos hasta el despliegue, para cursos sobre aprendizaje por imitación y modelos fundacionales en robótica.
- Benchmarking de infraestructura de inferencia: permite medir latencia y throughput de un VLA de 4,1B parámetros en hardware concreto (GPU consumer o profesional) dentro del ecosistema LeRobot.
- Investigación en generalización de políticas: al ser un ajuste fino sobre π₀.₅, se puede utilizar para estudiar cómo el ajuste fino especializa un modelo base generalista y qué capacidades se pierden o retienen.
- Integración en líneas de montaje simuladas: aunque no se especifica soporte para simulación, el modelo podría evaluarse en entornos simulados compatibles con UR5e para validar la política antes de desplegarla en el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, un modelo de 4,1B parámetros en precisión FP16 requiere aproximadamente 8,3 GB solo para los pesos, más el overhead de activaciones y el codificador visual; en FP32 serían unos 16,6 GB. No se confirma la precisión de los pesos en el repositorio.
- GPU recomendadas: no disponible. Por el tamaño del modelo, una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40GB, H100) sería plausible, pero no se confirma.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 16 GB o más (RTX 4090, RTX 4080 Super, etc.) si se usa FP16, pero no se dispone de confirmación oficial.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), con soporte para `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de robótica de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_wrist_drop | 4,14B | no disponible | Pick-and-place de cubos sobre cruz roja (UR5e) | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base para ajuste fino | gemma | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado exclusivamente para cuatro tareas de pick-and-place con cubos de colores sobre una cruz roja; no generaliza a otras tareas, objetos o disposiciones sin un nuevo ajuste fino.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad y tasa de acierto.
- Dependencia del hardware: requiere un robot UR5e con pinza y dos cámaras configuradas exactamente con los nombres `top` y `wrist`, a 480x640 y 30 FPS; cualquier desviación en la configuración puede degradar el rendimiento.
- Sesgos conocidos: no disponible. Al estar entrenado con un dataset limitado (1000 episodios, cuatro colores), puede presentar sesgos hacia posiciones, iluminaciones y disposiciones presentes en los datos.
- Riesgo de alucinación: en el contexto de robótica, se traduce en acciones erróneas o inseguras; no hay mecanismos de seguridad documentados.
- Limitaciones de contexto o idioma: no se especifica longitud de contexto ni soporte multilingüe; las instrucciones de tarea están en inglés y limitadas a las cuatro frases del dataset.
- Restricciones de licencia: licencia `gemma`, que impone términos de uso de Gemma; es necesario revisar las condiciones para uso comercial, especialmente en productos derivados.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad; no se recomienda su uso en producción sin una evaluación exhaustiva en el robot objetivo.
- Tamaño del repositorio: 24,5 GB, lo que requiere espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_wrist_drop
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible en la información proporcionada
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
