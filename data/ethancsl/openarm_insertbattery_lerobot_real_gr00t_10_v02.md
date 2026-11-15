# ethanCSL/openarm_insertbattery_lerobot_real_gr00t_10_v02

## Resumen

Este repositorio contiene una política de imitación robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto para razonamiento y habilidades de robots humanoides. El modelo combina un backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, y predice acciones motoras condicionadas por visión, lenguaje y propiocepción. La política concreta está especializada en una única tarea de manipulación bimanual: coger una estación de carga con el brazo izquierdo e insertar una batería en ella con el brazo derecho, sobre un robot de tipo `openarm_umeow`.

El interés de esta ficha es doble. Por un lado, documenta un ejemplo real de fine-tuning de GR00T N1.7 mediante LeRobot 0.6.2, lo que permite ver el flujo completo de entrenamiento y despliegue de una política de imitación con datos teleoperados. Por otro, sirve como referencia de las dimensiones de entrada y salida esperadas por el modelo en este robot concreto: estado de 16 dimensiones, tres cámaras RGB a 480x640 y una salida de acción también de 16 dimensiones.

El modelo tiene 3.144.016.000 parámetros en pesos safetensors y un repositorio de 12,6 GB. Se entrenó durante 20.000 pasos con un batch de 8 sobre un dataset de solo 10 episodios y 7.440 frames a 30 FPS. No se han publicado resultados de evaluación en el repositorio, por lo que su rendimiento real en robot no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en lenguaje natural, pero no se documentan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura subyacente es GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment para robots humanoides. Combina un backbone de razonamiento vision-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de cámara y la instrucción de tarea, con un transformer de acciones que genera trayectorias mediante flow matching. La política consume `observation.state` de forma `(16,)`, tres imágenes RGB de forma `(3, 480, 640)` procedentes de `body_cam`, `wrist_cam` y `right_wrist_cam`, y produce una acción de forma `(16,)`.

El fine-tuning se realizó con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_insertbattery_lerobot_real_10_v02`, compuesto por 10 episodios y 7.440 frames grabados a 30 FPS en un robot real `openarm_umeow`. La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta composición del dataset más allá de la tarea única, ni si hubo fases de RLHF o DPO; se trata de aprendizaje por imitación supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Generación de acciones motoras bimanuales condicionadas por visión, lenguaje y propiocepción para la tarea de inserción de batería en estación de carga.
- Procesamiento de tres flujos visuales simultáneos (cámara corporal y dos cámaras de muñeca) a resolución 480x640.
- Interpretación de instrucciones en lenguaje natural como condicionamiento de tarea ("Pick up the charging station with the left arm, and insert battery in it with the right arm").
- Control de un espacio de acción de 16 dimensiones sobre el robot `openarm_umeow`.
- Despliegue en robot real mediante `lerobot-rollout` con estrategia base y duración configurable.
- Reentrenamiento sobre nuevos datasets mediante `lerobot-train` con `--policy.type=groot`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; el modelo está especializado en control robótico.

## Casos de uso

- Automatización de ensamblaje de baterías: la política ejecuta la secuencia completa de coger la estación de carga con el brazo izquierdo e insertar la batería con el derecho, adecuada para líneas de montaje de pequeños dispositivos electrónicos donde la tarea es repetitiva y estable.
- Investigación en imitación bimanual: sirve como punto de partida para estudiar cómo GR00T N1.7 generaliza a partir de solo 10 episodios y 7.440 frames, y para comparar configuraciones de entrenamiento (pasos, batch, learning rate) sobre una misma tarea.
- Benchmark de políticas robóticas: al estar entrenada con LeRobot 0.6.2 y publicar la configuración exacta, permite reproducir el pipeline y medir la variabilidad entre ejecuciones con la misma semilla y dataset.
- Prototipado rápido en laboratorio: con `lerobot-rollout` y `--duration=60` se puede validar en robot real en menos de un minuto de ejecución, lo que facilita iteraciones cortas sobre la política.
- Base para fine-tuning con más datos: el checkpoint puede reentrenarse con `lerobot-train` sobre datasets ampliados para mejorar robustez ante cambios de posición, iluminación o distracciones.
- Docencia y formación en robótica de manipulación: el repositorio incluye comandos completos de despliegue y entrenamiento, lo que lo convierte en un ejemplo didáctico del ciclo teleoperación-entrenamiento-despliegue con LeRobot.
- Integración en pipelines de evaluación continua: al ser un artefacto LeRobot estándar, puede cargarse en scripts de evaluación automatizada para comparar checkpoints de la misma familia GR00T.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita de que no se han proporcionado resultados en robot real (trials, éxitos, tasa de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144.016.000 parámetros en safetensors, una estimación en fp16 rondaría los 6,3 GB solo de pesos, más el estado del backbone vision-lenguaje y los buffers de flow matching; en fp32 se duplicaría. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponibles. El comando de entrenamiento de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de pesos, cabría en GPUs con 12-16 GB o más en precisión reducida, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política robótica.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según el dataset de entrenamiento, pero no se publica latencia medida en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethanCSL/openarm_insertbattery_lerobot_real_gr00t_10_v02` | 3.144.016.000 | no disponible | Inserción de batería bimanual en `openarm_umeow` | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment para humanoides | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot de la misma familia | no disponible | no disponible | Tareas de manipulación específicas | variable | Hugging Face |

No se dispone de datos de benchmarks ni de modelos comparables con métricas publicadas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot (`openarm_umeow`); no se espera que funcione en otras tareas, objetos o morfologías sin reentrenamiento.
- Dataset muy reducido: solo 10 episodios y 7.440 frames, lo que limita la robustez ante variaciones de posición, iluminación, distracciones o cambios en la estación de carga.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Riesgo de sobreajuste: con 20.000 pasos sobre 10 episodios, es plausible un sobreajuste a las trayectorias demostradas; no se documentan técnicas de regularización ni aumentación de datos.
- Dependencia de las cámaras: los nombres y la configuración de las cámaras (`body_cam`, `wrist_cam`, `right_wrist_cam`) deben coincidir exactamente con los usados en entrenamiento; cualquier cambio invalida la política.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: al ser un modelo de control robótico, estos riesgos se trasladan a errores de ejecución motora más que a generación de texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias del backbone subyacente (Cosmos-Reason2/Qwen3-VL) y de los datos de entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_insertbattery_lerobot_real_gr00t_10_v02
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_insertbattery_lerobot_real_10_v02
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_insertbattery_lerobot_real_10_v02
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
