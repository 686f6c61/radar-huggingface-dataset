# L7-Robotics/pi05_so101_camera_setting_2026Nov_redcube_whitebowl_polarbear_greentray_v1

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para la generalización en entornos abiertos y situaciones no vistas durante el entrenamiento. Evoluciona el modelo π₀ original y se distribuye en el ecosistema LeRobot de Hugging Face, que adapta la implementación de referencia de OpenPI. El modelo consume observaciones multimodales (estado articular e imágenes de cámaras) y produce comandos de acción motora de forma directa.

La ficha que nos ocupa, `L7-Robotics/pi05_so101_camera_setting_2026Nov_redcube_whitebowl_polarbear_greentray_v1`, es un ajuste fino del modelo base `lerobot/pi05_base` sobre un conjunto de datos propio de 120 episodios y 51.494 fotogramas a 20 FPS. Está especializado en dos tareas concretas de manipulación robótica con un brazo SO-101: colocar una figura de oso polar en una bandeja verde y un cubo rojo en un cuenco blanco.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de repositorio de 9,4 GB en formato safetensors. Es relevante ahora porque demuestra el flujo completo de ajuste fino de un VLA de código abierto sobre hardware asequible (SO-101) y tareas de laboratorio reproducibles, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence (implementación LeRobot/OpenPI) |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico multimodal, no orientado a texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower (SO-101) |
| Cámaras | rear_top, right_side, wrist |
| Entrada observation.state | (6,) |
| Entrada visual | 3 × (3, 480, 640) |
| Salida action | (6,) |
| Tamaño del repositorio | 9,4 GB |
| Librería | lerobot |
| Versión de LeRobot | 0.5.2 |

## Arquitectura y entrenamiento

El modelo es un VLA basado en π₀.₅, la evolución del modelo π₀ de Physical Intelligence. La arquitectura combina un codificador visual y de lenguaje con un cabezal de acciones que genera comandos motores de 6 dimensiones a partir de tres vistas de cámara (480×640) y el estado articular del robot (6 dimensiones). La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. No se dispone de detalles adicionales sobre el número de tokens de entrenamiento del modelo base ni sobre el uso de RLHF/DPO en la información proporcionada.

El ajuste fino se realizó sobre el dataset `L7-Robotics/so101_camera_setting_2026Nov_redcube_whitebowl_polarbear_greentray_merge_v1`, con 120 episodios, 51.494 fotogramas a 20 FPS y dos tareas: "put the polar bear figurine on the green tray" y "put the red cube in the white bowl". La configuración de entrenamiento fue de 20.000 pasos, batch size 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. No se documentan innovaciones técnicas adicionales específicas de este ajuste fino.

## Capacidades

- Manipulación robótica de precisión: genera acciones de 6 grados de libertad para el brazo SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente tres cámaras (rear_top, right_side, wrist) a resolución 480×640.
- Ejecución de tareas de pick-and-place: colocar objetos en receptáculos designados (bandeja verde, cuenco blanco).
- Política de imitación entrenada por comportamiento: reproduce las trayectorias aprendidas del dataset de demostraciones.
- Generalización dentro del dominio de entrenamiento: el modelo base π₀.₅ está diseñado para generalizar a entornos nuevos, aunque este ajuste fino está especializado en las dos tareas del dataset.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, agentes multi-paso, capacidades multilingües de texto ni modo thinking.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta la tarea de colocar el cubo rojo en el cuenco blanco o el oso polar en la bandeja verde mediante `lerobot-rollout`, adecuado para demostraciones reproducibles de manipulación con SO-101.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar el ajuste fino de VLAs sobre datasets pequeños (120 episodios) y evaluar la transferencia del modelo base π₀.₅ a tareas concretas.
- **Prototipado de políticas robóticas en hardware asequible**: el brazo SO-101 es de bajo coste, y este modelo permite validar pipelines completos de captura de datos, entrenamiento y despliegue sin GPUs de gama alta.
- **Generación de datos sintéticos y aumento de dataset**: el modelo puede usarse para evaluar la calidad del dataset `merge_v1` y como referencia para comparar nuevas grabaciones con la misma configuración de cámaras.
- **Educación y formación en robótica**: permite a estudiantes ejecutar una política VLA preentrenada y observar el comportamiento de un modelo de visión-lenguaje-acción en un entorno controlado.
- **Benchmark interno de políticas VLA**: al estar ajustado sobre tareas y hardware específicos, sirve como línea base para comparar nuevas políticas o variantes de entrenamiento sobre el mismo conjunto de datos.
- **Integración en pipelines de LeRobot**: se puede invocar mediante `lerobot-rollout` con `--strategy.type=base` para ejecución continua durante 60 segundos o de forma indefinida, integrándose en flujos de evaluación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Con 4,14 mil millones de parámetros en safetensors (9,4 GB de repositorio), se requiere al menos una GPU con memoria suficiente para cargar los pesos; no se especifican cuantizaciones ni requisitos exactos.
- **GPU recomendadas**: no disponible. No se documentan GPU concretas (A100, H100, RTX 4090, etc.) en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no disponible. No se confirma si cabe en GPU de consumo ni en qué modelos.
- **Opciones de despliegue**: LeRobot mediante `lerobot-rollout` (ejecución en robot) y `lerobot-train` (entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo robótico.
- **Latencia y throughput**: no disponible. El dataset se grabó a 20 FPS y las cámaras se configuran a 30 FPS en el ejemplo de rollout, pero no se especifican métricas de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L7-Robotics/pi05_so101_..._v1 (este) | 4,14 mil millones | no disponible | 2 tareas pick-and-place (SO-101) | apache-2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | Modelo base VLA generalista | no disponible en la información | Hugging Face |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible en la información | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad cuando estos datos están disponibles.

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo está ajustado únicamente para dos tareas concretas ("put the polar bear figurine on the green tray" y "put the red cube in the white bowl") sobre un robot SO-101 con una configuración específica de tres cámaras. No se espera generalización fuera de ese dominio.
- **Sin resultados de evaluación**: la model card indica explícitamente que no se han proporcionado resultados de evaluación, por lo que no hay evidencia publicada de tasa de éxito.
- **Dataset pequeño**: 120 episodios y 51.494 fotogramas son un volumen reducido, lo que puede limitar la robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- **Dependencia de la configuración de hardware**: los nombres de cámara (rear_top, right_side, wrist) y el tipo de robot (so_follower) deben coincidir exactamente con los usados en el entrenamiento; cualquier cambio requiere reentrenamiento o ajuste.
- **Riesgo de alucinación motora**: como política de imitación, puede generar trayectorias incorrectas o inseguras ante situaciones no representadas en el dataset; se recomienda supervisión y límites de seguridad en el robot.
- **Sesgos**: no se documentan sesgos específicos, pero el dataset refleja las condiciones concretas de grabación (objetos, colores, posiciones), lo que puede introducir sesgo hacia esas configuraciones.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base y las dependencias (LeRobot, OpenPI) pueden tener sus propias condiciones que deben verificarse.
- **Idiomas**: no aplica como modelo de texto; las instrucciones de tarea son en inglés en los ejemplos proporcionados.
- **Sin cuantizaciones documentadas**: no se especifican formatos GGUF ni otras cuantizaciones, lo que limita opciones de despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/L7-Robotics/pi05_so101_camera_setting_2026Nov_redcube_whitebowl_polarbear_greentray_v1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/L7-Robotics/so101_camera_setting_2026Nov_redcube_whitebowl_polarbear_greentray_merge_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=L7-Robotics/so101_camera_setting_2026Nov_redcube_whitebowl_polarbear_greentray_merge_v1
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
