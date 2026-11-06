# mysterium99/smolvla_stage2c_complexity_4_to_fs

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. La ficha que nos ocupa, `mysterium99/smolvla_stage2c_complexity_4_to_fs`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio denominado `fs`, orientado a una única tarea de manipulación: recoger un perno y depositarlo en un cubo. El modelo consume el estado articular del robot y tres cámaras (gripper, vista superior y vista lateral) y produce un vector de acción de seis dimensiones.

El interés de esta publicación es acotado: se trata de un checkpoint de investigación, con cero descargas y cero likes en el momento de la consulta, entrenado con 26 episodios y 38.356 fotogramas a 30 FPS. No aporta innovaciones arquitectónicas sobre SmolVLA, sino una demostración de flujo de trabajo de fine-tuning en LeRobot 0.6.1 con 20.000 pasos de entrenamiento, batch de 8 y AdamW a tasa de aprendizaje 1e-4.

Con 450.046.176 parámetros totales y un repositorio de 0,9 GB, el modelo es desplegable en hardware de consumo, lo que encaja con la propuesta de valor de SmolVLA: políticas VLA de tamaño reducido que puedan ejecutarse en tiempo real sobre robots de bajo coste. La licencia Apache 2.0 facilita su reutilización, aunque la ausencia de resultados de evaluación publicados limita seriamente cualquier conclusión sobre su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según el método SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot | follower |
| Cámaras de entrada | gripper, newtop, newside |
| Entrada de estado | observation.state, shape (6,) |
| Entradas visuales | 3 cámaras, shape (3, 256, 256) cada una |
| Salida de acción | action, shape (6,) |
| Dataset de entrenamiento | fs (26 episodios, 38.356 fotogramas, 30 FPS) |
| Tarea entrenada | "Pick up the bolt and put it in the bucket" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 0 |
| Versión de LeRobot | 0.6.1 |
| Modelo base | lerobot/smolvla_base |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una política visión-lenguaje-acción compacta que combina percepción visual multi-cámara con el estado proprioceptivo del robot para predecir acciones de control. El modelo parte del checkpoint preentrenado `lerobot/smolvla_base` y se ha fine-tuneado sobre el dataset `fs`, compuesto por 26 episodios y 38.356 fotogramas capturados a 30 FPS para una única tarea de manipulación. La entrada se compone de un vector de estado de 6 dimensiones y tres imágenes RGB de 256x256 procedentes de las cámaras `gripper`, `newtop` y `newside`; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, con batch de 8, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 0. No se documenta en la model card el número de tokens de entrenamiento, la composición del corpus más allá del dataset `fs`, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en políticas de imitación robótica). Tampoco se detallan innovaciones técnicas específicas de esta variante más allá de las propias del método SmolVLA descrito en el paper. El sufijo `stage2c_complexity_4` del identificador sugiere una fase de un pipeline experimental del autor, pero no se aporta documentación que lo confirme.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos de imagen de 256x256 (gripper, vista superior, vista lateral).
- Ejecución de una tarea concreta de manipulación: "Pick up the bolt and put it in the bucket".
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- Operación en hardware de consumo: el tamaño del modelo (450 M parámetros) permite inferencia en GPUs de gama media según la propuesta de SmolVLA.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión general, audio): no disponibles; la visión está restringida a la percepción robótica de las tres cámaras de entrenamiento.

## Casos de uso

- Demostración de manipulación pick-and-place: el modelo puede ejecutar la tarea de recoger un perno y depositarlo en un cubo sobre un robot tipo follower, sirviendo como referencia para validar un montaje hardware completo en LeRobot.
- Reproducción de experimentos de imitación: investigadores pueden desplegar el checkpoint con `lerobot-rollout` para comparar el comportamiento de un fine-tuning sobre 26 episodios frente al modelo base `lerobot/smolvla_base`, evaluando el efecto del tamaño del dataset.
- Punto de partida para fine-tuning adicional: el checkpoint puede reentrenarse con `lerobot-train` sobre nuevos datasets para adaptar la política a objetos o entornos distintos, aprovechando que la licencia Apache 2.0 permite uso comercial.
- Validación de pipelines de datos robóticos: el dataset `fs` (38.356 fotogramas a 30 FPS) y este checkpoint asociado permiten probar herramientas de visualización, grabación y entrenamiento de LeRobot de extremo a extremo.
- Referencia educativa en robótica de imitación: útil en cursos o talleres para ilustrar el flujo completo grabación-calibración-entrenamiento-despliegue con un modelo VLA compacto.
- Pruebas de inferencia en hardware de consumo: con 450 M parámetros, el modelo permite medir latencia y viabilidad de políticas VLA en GPUs no empresariales, aunque no se publican cifras de throughput ni latencia.
- Benchmark interno de estabilidad de entrenamiento: la configuración documentada (20.000 pasos, batch 8, AdamW, lr 1e-4) sirve como receta reproducible para comparar hiperparámetros en tareas de manipulación simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito en robot real ni métricas de simulación verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros en safetensors y un repositorio de 0,9 GB, una estimación razonable en FP16 ronda 1-2 GB de pesos, más el coste de procesar tres imágenes de 256x256, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; SmolVLA se presenta como desplegable en hardware de consumo, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? Por tamaño de parámetros, previsiblemente sí en GPUs de consumo con suficiente VRAM, pero no hay confirmación del autor ni requisitos publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=mysterium99/smolvla_stage2c_complexity_4_to_fs`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles; no se publican mediciones de frecuencia de control alcanzable.
- Requisitos adicionales: robot tipo `follower`, tres cámaras configuradas con los nombres `gripper`, `newtop` y `newside`, y coincidencia exacta de las claves de observación con las del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_4_to_fs | 450.046.176 | no disponible | Pick-and-place de un perno en un cubo | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | Política VLA base preentrenada, fine-tuneable | no disponible en la información proporcionada | Hugging Face (modelo base citado) |
| Otras políticas VLA compactas (p. ej. variantes de SmolVLA publicadas en LeRobot) | no disponible | no disponible | Manipulación robótica por imitación | variable | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se publican métricas de éxito, latencia ni contexto para este checkpoint, y no se detallan las especificaciones del modelo base más allá de su identificador.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito en robot real ni en simulación, por lo que se desconoce si la política funciona de forma fiable.
- Dataset muy reducido: 26 episodios y una única tarea limitan la generalización; es previsible un sobreajuste al entorno, posiciones de objetos e iluminación de la grabación.
- Dependencia estricta de la configuración hardware: las tres cámaras deben nombrarse `gripper`, `newtop` y `newside` y montarse de forma equivalente a la del entrenamiento; cualquier cambio de montaje degradará el comportamiento.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero al ser una política de imitación hereda los sesgos y la distribución de las demostraciones humanas del dataset `fs`.
- Riesgo de alucinación en el sentido de acciones erróneas o inseguras: como toda política de imitación, puede producir comandos no válidos ante observaciones fuera de distribución; no se documentan medidas de seguridad.
- Idiomas: no aplica ni se documenta soporte multilingüe; el modelo no es un LLM de propósito general.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset `fs` antes de un despliegue productivo.
- Madurez: publicación con cero descargas y cero likes, creada y actualizada el mismo día, sin demo ni vídeo de validación; no debe considerarse un artefacto estable para producción.
- Nomenclatura ambigua: el sufijo `stage2c_complexity_4` no está documentado en la model card, lo que dificulta interpretar el contexto experimental del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_4_to_fs
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/fs
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fs
