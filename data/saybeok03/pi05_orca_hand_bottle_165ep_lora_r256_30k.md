# saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_30k

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) denominada pi05, un fine-tuning mediante LoRA del modelo base lerobot/pi05_base, que a su vez adapta π₀.₅ de Physical Intelligence para el ecosistema LeRobot de Hugging Face. El modelo está entrenado para ejecutar una única tarea de manipulación robótica —"move the bottle"— sobre un brazo con mano Orca, y se distribuye como checkpoint de imitación listo para desplegar en un robot real mediante el comando `lerobot-rollout`.

La relevancia de este modelo es acotada y práctica: no es un modelo de propósito general, sino una política especializada que demuestra el flujo completo de LeRobot para grabar datos, entrenar con LoRA sobre un VLA preentrenado y ejecutar control motor a partir de tres cámaras y un vector de estado de 20 dimensiones. El repositorio ocupa 3,0 GB y se publica bajo licencia Apache 2.0.

El entrenamiento se realizó sobre el dataset saybeok03/orca-hand-bottle, con 165 episodios y 141.740 fotogramas a 30 FPS, durante 30.000 pasos con un rango de LoRA de 256. No hay resultados de evaluación publicados ni métricas de éxito en robot real, por lo que debe considerarse un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), adaptación LeRobot del repositorio OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repositorio no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo orientado a acciones, no a diálogo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | lerobot/pi05_base |
| Fine-tuning | LoRA, rango 256, 30.000 pasos |
| Entradas | observation.state (20,), observation.images.bottom (3, 480, 640), observation.images.wrist (3, 480, 640), observation.images.realsense (3, 480, 640) |
| Salidas | action (20,) |
| Dataset de entrenamiento | saybeok03/orca-hand-bottle (165 episodios, 141.740 fotogramas, 30 FPS) |
| Tarea | "move the bottle." |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de π₀.₅ de Physical Intelligence, un VLA que combina un codificador visual multi-cámara, un backbone de lenguaje y un cabezal de acciones continuas. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La política consume tres flujos de imagen a 480x640 píxeles (cámara inferior, cámara de muñeca y RealSense) junto con un vector de estado propioceptivo de 20 dimensiones, y produce un vector de acción también de 20 dimensiones.

El entrenamiento consistió en un fine-tuning LoRA (rango 256) sobre lerobot/pi05_base durante 30.000 pasos, con batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset contiene 165 episodios de la tarea "move the bottle" grabados a 30 FPS con una mano Orca. No se documenta el número de tokens de preentrenamiento del modelo base, la composición del corpus original ni si hubo etapas de RLHF o DPO; esa información corresponde a la model card de lerobot/pi05_base y no está incluida en este repositorio.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 20 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas (bottom, wrist, realsense) a resolución 480x640.
- Imitación de una tarea concreta: "move the bottle", condicionada por el prompt de tarea.
- Generalización limitada al dominio de entrenamiento: el modelo base π₀.₅ está diseñado para generalizar a entornos nuevos, pero el fine-tuning LoRA restringe fuertemente el comportamiento a la distribución del dataset Orca.
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y entrenable con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni diálogo multilingüe: es una política de control, no un modelo conversacional.

## Casos de uso

- Manipulación de botellas en laboratorio: el modelo ejecuta la tarea "move the bottle" sobre un brazo con mano Orca, usando las tres cámaras como entrada; es adecuado porque fue entrenado específicamente sobre 165 episodios de esa tarea y esa configuración de sensores.
- Reproducción de experimentos de imitación: sirve como referencia para validar el pipeline de LeRobot (grabación, entrenamiento LoRA, rollout) en un montaje concreto, comparando el éxito con el modelo base lerobot/pi05_base.
- Punto de partida para fine-tuning adicional: al ser un LoRA de rango 256, puede reutilizarse como inicialización para tareas de pick-and-place similares con la misma mano y cámaras, reduciendo el coste frente a entrenar desde el base.
- Docencia y formación en robótica de imitación: permite a un equipo montar un robot, grabar episodios y ejecutar una política VLA real sin entrenar desde cero.
- Pruebas de integración hardware-software: útil para verificar la calibración de cámaras, la latencia del bucle de control a 30 FPS y la correspondencia entre nombres de cámaras y claves de observación.
- Benchmark interno de despliegue: sirve para medir throughput y estabilidad en distintas GPU antes de invertir en un modelo mayor o en un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de ensayos, tasa de éxito ni comparación con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 3,0 GB en safetensors, por lo que el checkpoint en precisión original podría requerir del orden de 3-6 GB solo en pesos, más memoria para activaciones de tres imágenes a 480x640.
- GPU recomendadas: no documentadas por el autor. Para un VLA de este tamaño, una RTX 4090 (24 GB) o una A100/H100 son opciones razonables, pero no hay confirmación oficial.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8-16 GB si se ejecuta en FP16, aunque no está verificado ni documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es la vía oficial descrita en la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: la captura de datos se realizó a 30 FPS, pero no se publican cifras de latencia de inferencia ni de frecuencia de control efectiva en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_30k | no disponible | no disponible | "move the bottle" (Orca, 3 cámaras) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base para fine-tuning | no disponible en esta ficha | Hugging Face |
| π₀.₅ (Physical Intelligence, OpenPI) | no disponible | no disponible | VLA de propósito general | no disponible en esta ficha | Repositorio OpenPI |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada; la comparación se limita a procedencia, tarea y licencia.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito en robot real, por lo que no puede afirmarse que la política funcione de forma fiable.
- Especialización extrema: entrenada solo para "move the bottle" con una mano Orca y tres cámaras concretas; no generalizará a otras tareas, objetos o configuraciones de sensores.
- Dependencia de la configuración de hardware: los nombres de cámara (`bottom`, `wrist`, `realsense`) y el vector de estado de 20 dimensiones deben coincidir exactamente con los del robot de destino.
- Riesgo de sobreajuste al dataset: 165 episodios y 30.000 pasos con LoRA r=256 sobre un dataset pequeño pueden producir comportamientos frágiles ante cambios de iluminación, posición del objeto o distracciones.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual hereda los sesgos de los datos de preentrenamiento del base, no descritos aquí.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base lerobot/pi05_base y π₀.₅ deben verificarse por separado, ya que sus términos no se detallan en este repositorio.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues documentados.
- Idiomas no aplicables: no es un modelo de texto; cualquier expectativa de generación lingüística o multilingüe queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_30k
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/orca-hand-bottle
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/orca-hand-bottle
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
