# aDaikiKamata/patch_policy_libero_object_tipsv2_bf16_smoke

## Resumen

Este modelo es una política de control robótico (policy) entrenada con la librería LeRobot de Hugging Face, diseñada para ejecutar tareas de manipulación en un brazo robótico Panda. Concretamente, se ha entrenado sobre el dataset `lerobot/libero_object_image`, que contiene 454 episodios de tareas de recoger objetos cotidianos (zumo de naranja, kétchup, queso crema, etc.) y colocarlos en una cesta. El modelo recibe como entrada dos imágenes de 256x256 píxeles (cámara fija y cámara de muñeca) junto con el estado del robot (8 dimensiones), y produce una acción de 7 dimensiones (posición y orientación del efector final).

Se trata de un modelo de tipo `patch_policy`, una arquitectura de política basada en parches de imagen implementada en LeRobot. El nombre del repositorio incluye `tipsv2_bf16_smoke`, lo que indica que es una versión de prueba (smoke test) con pesos en bfloat16 y probablemente una variante de entrenamiento con trucos o ajustes (tips v2). El modelo fue creado el 3 de septiembre de 2026 y no ha recibido descargas ni valoraciones, lo que sugiere que es un experimento de validación más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | patch_policy (LeRobot) - detalles internos no disponibles |
| Parametros totales | 211.886.599 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | bfloat16 (según nombre del repo), otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la model card. Se sabe que es un `patch_policy` de LeRobot, que típicamente procesa imágenes dividiéndolas en parches y las combina con el estado del robot para predecir acciones. El entrenamiento se realizó con el dataset `lerobot/libero_object_image` (454 episodios, 66.984 frames a 10 FPS) durante solo 100 pasos, con un batch size de 128, optimizador AdamW, learning rate de 5e-05 y semilla 1000. La versión de LeRobot utilizada fue la 0.6.2. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de aprendizaje por imitación supervisado. El número reducido de pasos (100) indica que es un entrenamiento de humo (smoke test) para verificar el pipeline, no un modelo convergido.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones (posición y orientación) para el brazo Panda.
- Percepción visual multimodal: procesa simultáneamente dos imágenes (cámara fija y cámara de muñeca) de 256x256 píxeles.
- Integración de estado: combina la información visual con el estado propioceptivo del robot (8 dimensiones).
- Ejecución de tareas de pick-and-place: entrenado para recoger objetos específicos y colocarlos en una cesta.
- Compatible con el ecosistema LeRobot: puede ejecutarse mediante `lerobot-rollout` y reentrenarse con `lerobot-train`.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Validación de pipelines de entrenamiento en LeRobot: al ser un smoke test, sirve para comprobar que la instalación, el dataset y el flujo de entrenamiento funcionan correctamente antes de lanzar entrenamientos completos.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este modelo como punto de partida para experimentar con el dataset LIBERO y la arquitectura patch_policy sin esperar horas de entrenamiento.
- Evaluación de la reproducibilidad en robótica: al tener una configuración de entrenamiento fija (100 pasos, batch 128, lr 5e-05), permite comparar el comportamiento de diferentes semillas o versiones de LeRobot.
- Demostración de inferencia en robot Panda: el modelo puede cargarse en un robot Panda real mediante `lerobot-rollout` para probar la integración hardware-software, aunque su rendimiento será limitado por el entrenamiento corto.
- Estudio de la influencia de la cuantización bf16 en políticas robóticas: al estar los pesos en bfloat16, se puede analizar el impacto de la precisión reducida en la calidad de las acciones generadas.
- Base para fine-tuning con más datos: aunque el modelo no es útil directamente, sus pesos pueden servir como inicialización para un entrenamiento más largo sobre el mismo dataset o tareas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas de éxito en tareas reales ni simuladas.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la model card.
- El tamaño del repositorio es de 2,8 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente esa cantidad de memoria. Para cargar el modelo en GPU se necesitaría al menos 3-4 GB de VRAM, aunque no hay confirmación oficial.
- Dado el tamaño de parámetros (211M), es probable que quepa en GPUs de consumo como una RTX 3060 (12 GB) o superior, pero no hay datos verificados.
- Para inferencia en robot, LeRobot recomienda usar una GPU NVIDIA con CUDA. El despliegue se realiza mediante el comando `lerobot-rollout` de la librería LeRobot, no con herramientas como vLLM u Ollama.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas para LIBERO). El autor tiene otros dos repositorios similares: `patch_policy_libero_object_tipsv2_smoke` (sin bf16) y `patch_policy_libero_object_smoke`, que probablemente sean variantes del mismo experimento. No hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de prueba (smoke test): entrenado solo con 100 pasos, no ha convergido y no es apto para uso en producción ni para tareas reales de manipulación.
- Sin evaluación: no se han reportado resultados de éxito en robot real ni en simulación, por lo que se desconoce su eficacia real.
- Específico para el robot Panda y las cámaras configuradas: las observaciones requieren exactamente dos imágenes (image y wrist_image) de 256x256 y un estado de 8 dimensiones. No funcionará con otros robots o configuraciones de sensores sin adaptación.
- Limitado a las tareas del dataset LIBERO: solo puede ejecutar las 10 tareas de recoger objetos y colocarlos en la cesta que se usaron en el entrenamiento.
- No es un modelo de lenguaje ni multimodal general: no procesa texto, audio ni otro tipo de datos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo sin garantías de rendimiento, su uso en aplicaciones comerciales sería arriesgado.
- Fecha de creación futura (2026): el modelo está fechado en septiembre de 2026, lo que puede indicar un error en el reloj del sistema o un repositorio de prueba.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/aDaikiKamata/patch_policy_libero_object_tipsv2_bf16_smoke)
- [Repositorio del dataset libero_object_image](https://huggingface.co/datasets/lerobot/libero_object_image)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Repositorio variante sin bf16](https://huggingface.co/aDaikiKamata/patch_policy_libero_object_tipsv2_smoke)
- [Repositorio variante smoke original](https://huggingface.co/aDaikiKamata/patch_policy_libero_object_smoke)
