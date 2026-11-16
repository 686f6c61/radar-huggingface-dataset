# hansu0521/pick_and_place_model

## Resumen

`hansu0521/pick_and_place_model` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers) publicada en Hugging Face a través de la librería LeRobot. No es un modelo de lenguaje: es un controlador robótico que consume el estado articular de un robot `so_follower` (SO-101) y una imagen de una cámara de muñeca (`cam_wrist`, 480x640) para producir comandos de acción de 6 dimensiones. Su propósito concreto es ejecutar la tarea "pick dice" (coger un dado) sobre un robot de bajo coste.

El modelo fue entrenado con un dataset muy pequeño: 10 episodios de teleoperación, 3.879 fotogramas a 30 FPS, durante 1.000 pasos de entrenamiento con batch size 8 y learning rate 1e-5. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo ligero pensado para inferencia en tiempo real en hardware de consumo, no para despliegues a gran escala.

Su relevancia es fundamentalmente didáctica y de referencia: ilustra el flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para una tarea de manipulación simple. No cuenta con resultados de evaluación publicados ni con descargas o likes en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto experimental y no como una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política combina un codificador visual (procesa la imagen de `cam_wrist` de 3x480x640) con un transformer que, a partir del estado articular de 6 dimensiones y de la observación visual, genera una secuencia de acciones de 6 dimensiones. El modelo se entrenó sobre el dataset `hansu0521/pick_and_place` (10 episodios, 3.879 fotogramas, 30 FPS, tarea "pick dice") con 1.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.0.

No se dispone de información sobre la composición detallada del dataset, aumentos de datos, regularización ni sobre si se aplicaron técnicas adicionales de RLHF o DPO (no aplicables en este contexto de imitación). La innovación principal es la propia formulación de action chunking del paper de ACT, no una contribución original de este modelo.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` (SO-101).
- Percepción visual monocámara: procesa una imagen de muñeca de 480x640 a 30 FPS.
- Ejecución de la tarea "pick dice" (coger un dado) mediante imitación de teleoperación.
- Aprendizaje por imitación a partir de datos teleoperados (no requiere refuerzo explícito).
- Predicción de secuencias de acciones (action chunks) en lugar de pasos aislados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración educativa de LeRobot: reproducir el flujo completo de grabación, entrenamiento y despliegue con `lerobot-train` y `lerobot-rollout` sobre un SO-101, útil para talleres y tutoriales.
- Prototipado rápido de tareas pick-and-place: servir como punto de partida para validar la cadena hardware-software antes de escalar a datasets mayores.
- Benchmark interno de infraestructura: medir latencia y estabilidad de una política ACT de ~51M parámetros en un robot de bajo coste.
- Reentrenamiento con datos propios: usar el script de entrenamiento documentado para adaptar la política a nuevas posiciones de objeto o variaciones de iluminación.
- Investigación en aprendizaje por imitación con datos escasos: estudiar el comportamiento de ACT con solo 10 episodios y 1.000 pasos de entrenamiento.
- Pruebas de integración de cámaras y calibración: validar la configuración de `cam_wrist` y del bus del robot antes de abordar tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7M parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior es suficiente. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM; también es plausible su ejecución en CPU para pruebas, aunque no está documentado.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=hansu0521/pick_and_place_model`; requiere el paquete `lerobot` y acceso al puerto del robot y a la cámara OpenCV.
- Latencia y throughput estimados: no disponibles. El modelo opera a 30 FPS según el dataset de entrenamiento, pero no se ha publicado ninguna medición de latencia real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hansu0521/pick_and_place_model | ACT | 51.668.614 | no aplica | Apache 2.0 | Hugging Face (0 descargas) |
| HankLL/PickAndPlace1_Model | no disponible | no disponible | no aplica | no disponible | Hugging Face |
| junshin02/act_so101_pickplace | ACT | no disponible | no aplica | no disponible | Hugging Face |
| Po-lien/mobileai-pick-and-place-0512-2110 | no disponible (dataset) | no aplica | no aplica | no disponible | Hugging Face (dataset) |

No se dispone de datos de rendimiento comparables entre estas políticas; la comparación se limita a disponibilidad y licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (10 episodios, 3.879 fotogramas): alta probabilidad de sobreajuste y baja generalización a nuevas posiciones, iluminación u objetos.
- Sin resultados de evaluación publicados: no hay evidencia empírica de tasa de éxito en robot real.
- Entrenado exclusivamente para la tarea "pick dice" sobre un robot `so_follower` con una única cámara de muñeca; no es reutilizable directamente en otras tareas o morfologías.
- Dependencia estricta de la configuración de hardware: los nombres de cámara (`cam_wrist`) y las dimensiones (480x640, 30 FPS) deben coincidir con las del entrenamiento.
- Sin capacidades lingüísticas, de razonamiento ni de tool calling; no debe evaluarse como un modelo de lenguaje.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el tamaño del dataset desaconsejan su uso en producción sin validación adicional.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hansu0521/pick_and_place_model
- Dataset de entrenamiento: https://huggingface.co/datasets/hansu0521/pick_and_place
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hansu0521/pick_and_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
