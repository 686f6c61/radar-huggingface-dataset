# inhastupid/act_test

## Resumen

`inhastupid/act_test` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de control visuomotor que mapea observaciones (estado articular de 6 dimensiones y una imagen RGB de 480x640) a comandos de acción de 6 dimensiones. El autor lo ha entrenado y subido al Hub mediante LeRobot 0.7.1, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El modelo resuelve una tarea concreta de manipulación: "Pick the object and place it on the target". Se entrenó sobre un dataset propio de 32 episodios y 19.200 fotogramas grabados a 30 FPS con un robot de tipo `so_follower` (brazo SO-100/SO-101 de bajo coste) y una única cámara cenital. Con 51,67 millones de parámetros y un repositorio de 0,2 GB, es un modelo pequeño que cabe en cualquier GPU consumer y que puede ejecutarse en tiempo real sobre hardware asequible.

Su relevancia es la de un artefacto de referencia y prueba de concepto: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) en una tarea de pick-and-place. No obstante, al tratarse de un test con solo 500 pasos de entrenamiento y sin evaluación publicada, no debe considerarse un modelo listo para producción ni generalizable fuera de su configuración exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume una observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (modelo visuomotor, sin entrada ni salida de texto) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de un único paso, lo que reduce el error de acumulación y suaviza el control. La política consume dos modalidades: `observation.state`, un vector de 6 dimensiones con el estado articular, y `observation.images.top`, una imagen RGB de 3x480x640 procedente de una cámara cenital. La salida es `action`, un vector de 6 dimensiones. El modelo incorpora el mecanismo habitual de ACT con un encoder visual (ResNet) y un transformer encoder-decoder con consultas de acciones aprendidas, aunque la model card no detalla la configuración exacta de capas ni dimensiones ocultas.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `inhastupid/pick_place_20261116_163948`, compuesto por 32 episodios y 19.200 fotogramas a 30 FPS de la tarea "Pick the object and place it on the target". La configuración fue de 500 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifica si hubo aumento de datos, qué robot concreto se usó más allá de `so_follower`, ni la composición exacta de posiciones de objetos. El número de pasos es muy bajo para una política de imitación, lo que sugiere un experimento de validación más que un entrenamiento convergido.

## Capacidades

- Control visuomotor de un brazo robótico de 6 grados de libertad a partir de una imagen cenital y el estado articular.
- Predicción de chunks de acciones para ejecución fluida a 30 FPS.
- Ejecución de una única tarea de pick-and-place: "Pick the object and place it on the target".
- Aprendizaje por imitación a partir de datos de teleoperación, sin recompensa explícita.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Prueba de concepto de pick-and-place con brazo SO-100/SO-101: sirve para validar la cadena completa de LeRobot (grabación, entrenamiento y despliegue) en un banco de laboratorio antes de invertir en datasets mayores.
- Docencia y formación en aprendizaje por imitación: el modelo y su dataset asociado permiten ilustrar cómo ACT aprende de teleoperación con solo 32 episodios y 500 pasos de entrenamiento.
- Benchmark interno de infraestructura: al ser un modelo de 51,7 M de parámetros y 0,2 GB, se puede usar para medir latencia de inferencia y throughput en distintas GPUs consumer con `lerobot-rollout`.
- Base para fine-tuning: el checkpoint puede servir como inicialización para una tarea similar con más episodios, aprovechando que LeRobot permite reentrenar con `--policy.type=act`.
- Reproducción de experimentos: útil para comparar configuraciones de ACT (número de pasos, batch size, learning rate) sobre el mismo dataset de referencia.
- Automatización de tareas repetitivas de laboratorio en un entorno controlado: recogida y colocación de objetos ligeros con iluminación y posiciones similares a las del dataset de entrenamiento.
- Validación de pipelines de evaluación en robótica: sirve como política de referencia para probar harness de evaluación antes de desplegar políticas más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de trials, éxitos ni tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el cuello de botella es el encoder visual y el buffer de imagen 3x480x640, por lo que se recomienda al menos 2-4 GB de VRAM para operar con comodidad.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para entrenamiento con batch size 8 y 500 pasos, una RTX 3090 o superior es suficiente.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 en adelante), e incluso es viable en CPU para inferencia a baja frecuencia, aunque no a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (recomendado por el autor), o integración directa con la API de políticas de LeRobot en Python.
- Latencia y throughput estimados: no disponibles. El modelo está pensado para ejecutarse a 30 FPS (33 ms por paso) en el robot `so_follower`, pero no se han publicado mediciones de latencia reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `inhastupid/act_test` (este) | 51,67 M | Estado 6D + imagen 480x640 | Pick-and-place con `so_follower` | no disponible | Hugging Face, LeRobot |
| ACT original (paper 2304.13705) | no disponible en la informacion | Estado + imagen | Manipulación bimanual (ALOHA) | código abierto (MIT en el repo original, no confirmado aquí) | Repo de referencia, no en Hub |
| Políticas LeRobot de la comunidad (p. ej. Diffusion Policy) | variable | Estado + imagen | Manipulación diversa | variable según autor | Hugging Face, LeRobot |

No se dispone de datos de benchmarks ni de parámetros comparables de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce si la política funciona de forma fiable.
- Entrenamiento muy corto: 500 pasos con batch size 8 es un régimen de prueba, no de convergencia; es probable que la política esté infraentrenada.
- Dataset pequeño y no diverso: 32 episodios con una sola cámara cenital y una única tarea limitan la generalización a nuevas posiciones, iluminaciones u objetos.
- Dependencia del hardware exacto: entrenado para `so_follower` con cámara `top` a 480x640 y 30 FPS; cambios en la cámara, su montaje o la frecuencia degradarán el rendimiento.
- Licencia no especificada: no se puede confirmar el uso comercial; la model card deja la licencia como "[More Information Needed]".
- Sin soporte multilingüe ni de texto: no es adecuado para tareas de NLP, generación de código ni razonamiento.
- Riesgo de sobreajuste y de fallos silenciosos: al no haber métricas, cualquier despliegue debe ir acompañado de un protocolo de evaluación propio con múltiples trials.
- Nombre del repositorio (`act_test`) y autor (`inhastupid`) sugieren un artefacto de prueba, no un modelo mantenido ni soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inhastupid/act_test
- Dataset de entrenamiento: https://huggingface.co/datasets/inhastupid/pick_place_20261116_163948
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=inhastupid/pick_place_20261116_163948
