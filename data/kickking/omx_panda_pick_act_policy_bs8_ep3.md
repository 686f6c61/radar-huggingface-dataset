# kickking/omx_panda_pick_act_policy_bs8_ep3

## Resumen

`kickking/omx_panda_pick_act_policy_bs8_ep3` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. La desarrolla el usuario kickking y se distribuye a través del Hub de Hugging Face usando la librería LeRobot. El modelo resuelve una tarea concreta de manipulación: recoger un objeto con un robot de tipo `omx_f` equipado con una cámara (`camera1`), aprendiendo de demostraciones teleoperadas.

La política consume el estado del robot (vector de 6 dimensiones) y una imagen RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros totales y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware robótico, no para despliegue en servidores de texto. La innovación central de ACT es predecir trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad de la ejecución.

El modelo se entrenó sobre el dataset `kickking/omx_panda_pick_1101` (30 episodios, 11.660 fotogramas a 15 FPS) durante 4.372 pasos con batch size 8, optimizador AdamW y learning rate 1e-05. Es relevante como ejemplo reproducible de entrenamiento de políticas de imitación con LeRobot 0.6.1, aunque no cuenta con resultados de evaluación publicados ni descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder visual (procesa la imagen RGB de la cámara), un encoder del estado proprioceptivo (vector de 6 dimensiones) y un decoder transformer que genera secuencias de acciones. En lugar de predecir una única acción por paso, el modelo predice un chunk de acciones futuras, lo que mitiga el problema de acumulación de errores típico de las políticas paso a paso y permite ejecutar movimientos más suaves. El paper original introduce además una técnica de regularización del estilo de acción (action chunking con CVAE) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.1 sobre 30 episodios y 11.660 fotogramas a 15 FPS del dataset `kickking/omx_panda_pick_1101`, con 4.372 pasos, batch size 8, AdamW y learning rate 1e-05, semilla 1000. La tarea se etiqueta simplemente como "0". No se documenta composición del dataset más allá del número de episodios y fotogramas, ni si hubo aumentos de datos o variaciones de iluminación y posiciones de objetos.

## Capacidades

- Generación de acciones de manipulación robótica: produce vectores de acción de 6 dimensiones a partir de observaciones de estado e imagen.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles mediante un encoder visual integrado.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de chunks de acciones: genera secuencias cortas de acciones en lugar de pasos individuales, mejorando la estabilidad.
- Ejecución en tiempo real: diseñado para correr sobre el robot con LeRobot (`lerobot-rollout`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Recogida automatizada de objetos en laboratorio: la política se ejecuta sobre un robot `omx_f` con la cámara `camera1` para recoger el objeto de la tarea "0", usando `lerobot-rollout` con `--policy.path` apuntando al repositorio.
- Reproducción de experimentos de imitación: sirve como referencia para comparar configuraciones de ACT (batch size, pasos, learning rate) en tareas de pick-and-place.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT entrenado con LeRobot, puede reutilizarse como inicialización para nuevas tareas de manipulación con el mismo robot.
- Validación de pipelines de LeRobot: útil para probar el flujo completo de entrenamiento, subida al Hub y despliegue con `lerobot-rollout` en un entorno controlado.
- Docencia y demostraciones de robótica: ejemplo compacto (0,2 GB) para ilustrar aprendizaje por imitación con transformers en cursos o talleres.
- Benchmark interno de infraestructura robótica: permite medir latencia de inferencia y throughput en el robot `omx_f` antes de escalar a políticas más grandes.
- Prototipado de automatización de picking: punto de partida para evaluar si ACT es suficiente antes de invertir en datasets mayores o métodos más complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, la huella en memoria es del orden de cientos de MB, holgada para cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, incluidas RTX 3060, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs consumer modernas, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kickking/omx_panda_pick_act_policy_bs8_ep3 | 51,7 M | Estado (6,) + imagen 480x640 | Pick con robot omx_f | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de LeRobot (genéricas) | Variable según checkpoint | Estado + imagen | Manipulación diversa | Apache 2.0 (típicamente) | Hugging Face |
| Diffusion Policy (referencia) | No disponible | Estado + imagen | Manipulación | No disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Tarea única y muy específica: entrenada para la tarea "0" con un robot `omx_f` y una cámara concreta; no generaliza a otros robots, cámaras o tareas sin reentrenamiento.
- Dataset pequeño: 30 episodios y 11.660 fotogramas, lo que limita la robustez frente a variaciones de iluminación, posiciones de objetos o distracciones.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje; no admite prompts textuales ni tool calling.
- Riesgo de sobreajuste al entorno de grabación: cambios en la cámara, la mesa o el objeto pueden degradar el comportamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria ni retroalimentación.
- El comando de ejemplo de la model card contiene una errata en el nombre del repositorio (`act_pilicy` en lugar de `act_policy`), lo que puede provocar fallos si se copia literalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_panda_pick_act_policy_bs8_ep3
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_panda_pick_1101
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kickking/omx_panda_pick_1101
