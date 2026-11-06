# ethanCSL/openarm_insertbattery_lerobot_real_gr00t_v02

## Resumen

`ethanCSL/openarm_insertbattery_lerobot_real_gr00t_v02` es una política de robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. El checkpoint ha sido ajustado para una tarea concreta de manipulación bimanual: coger una estación de carga con el brazo izquierdo e insertar una batería en ella con el brazo derecho, sobre un robot de tipo `openarm_umeow`.

Técnicamente se trata de un modelo de 3.144.016.000 parámetros (aproximadamente 3,1 mil millones) distribuidos en 12,6 GB de pesos en formato safetensors, que combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching. La política consume el estado propioceptivo del robot (vector de 16 dimensiones) y tres cámaras RGB de 480x640 (cuerpo, muñeca y muñeca derecha), y produce un vector de acción de 16 dimensiones a 30 FPS.

Su relevancia es doble: por un lado demuestra el flujo completo de LeRobot para ajustar un modelo fundacional de robótica a una tarea industrial concreta (inserción de batería en una estación de carga); por otro, sirve como referencia práctica de cómo adaptar GR00T N1.7 a un robot y un dataset reales. El modelo se publica bajo licencia Apache 2.0, aunque no cuenta con descargas ni likes en el momento de redactar esta ficha y no incluye resultados de evaluación en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 (3,1 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 12,6 GB) |
| Tipo de robot | `openarm_umeow` |
| Cámaras de entrada | `body_cam`, `wrist_cam`, `right_wrist_cam` (3 x 480 x 640) |
| Estado de entrada | `observation.state` de shape (16,) |
| Salida de acción | vector de shape (16,) |
| Frecuencia de entrenamiento | 30 FPS |
| Librería | LeRobot 0.6.2 |
| Dataset de entrenamiento | `ethanCSL/openarm_insertbattery_lerobot_real_v02` (55 episodios, 41.360 frames) |

## Arquitectura y entrenamiento

La política se basa en GR00T N1.7, el modelo fundacional abierto de NVIDIA para robots humanoides. La arquitectura es un sistema de dos componentes: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las tres cámaras y la instrucción en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. Este diseño permite un comportamiento cross-embodiment, es decir, la misma base puede adaptarse a distintas morfologías de robot mediante ajuste fino.

El ajuste fino se realizó con LeRobot 0.6.2 sobre el dataset `openarm_insertbattery_lerobot_real_v02`, compuesto por 55 episodios y 41.360 frames grabados a 30 FPS en un robot real. La tarea es bimanual: el brazo izquierdo coge la estación de carga y el brazo derecho inserta la batería. La configuración de entrenamiento reportada es de 40.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se especifica en la información disponible el número de tokens de entrenamiento del backbone, la composición del dataset más allá de la tarea, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones multimodales (tres cámaras RGB + estado propioceptivo de 16 dimensiones).
- Ejecución de tareas de manipulación bimanual: la política está entrenada específicamente para coger una estación de carga con el brazo izquierdo e insertar una batería con el brazo derecho.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como prompt de texto en el comando de rollout.
- Control en bucle cerrado a 30 FPS, con predicción de vectores de acción de 16 dimensiones.
- Integración con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento o ajuste fino adicional.
- Capacidad de reentrenamiento sobre nuevos datasets mediante `--policy.type=groot`, lo que permite adaptar la política a otras tareas del mismo robot.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; el modelo es una política de robótica, no un LLM conversacional.

## Casos de uso

- Automatización de ensamblaje de baterías: la política ejecuta la secuencia completa de coger la estación de carga con el brazo izquierdo e insertar la batería con el brazo derecho, adecuada para líneas de montaje de pequeños dispositivos electrónicos donde la tarea esté bien delimitada.
- Prueba de concepto de manipulación bimanual con GR00T N1.7: sirve como referencia para equipos que quieran validar el flujo de ajuste fino de un modelo fundacional de NVIDIA sobre un robot `openarm_umeow` antes de invertir en datasets propios.
- Generación de datos sintéticos y aumentación: al estar entrenado sobre 55 episodios reales a 30 FPS, puede usarse como baseline para comparar políticas entrenadas con más datos o con variaciones de iluminación y posiciones.
- Investigación en imitación visual-motora: el modelo permite estudiar cómo un backbone visión-lenguaje condiciona la generación de acciones mediante flow matching en tareas de inserción precisa.
- Despliegue en entornos de laboratorio con hardware OpenArm: la política se ejecuta con `lerobot-rollout` sobre el robot `openarm_umeow` y tres cámaras, lo que facilita reproducir experimentos en un banco de pruebas físico.
- Formación y docencia en robótica de imitación: el repositorio incluye comandos completos de inferencia y entrenamiento, útil para cursos prácticos sobre LeRobot y modelos fundacionales de robótica.
- Base para ajuste fino en tareas relacionadas: al ser Apache 2.0 y estar en formato safetensors, puede reentrenarse con `lerobot-train` sobre nuevos datasets del mismo robot para tareas como pick-and-place o inserción de otros conectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3,1 B parámetros en precisión completa (fp32) ocuparía aproximadamente 12,6 GB, lo que coincide con el tamaño del repo; en fp16/bf16 rondaría los 6,3 GB y en cuantizaciones de 8 bits aproximadamente 3,1 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Para un modelo de este tamaño, una GPU con al menos 16 GB de VRAM (RTX 4090, RTX A5000, L4) sería suficiente en fp16, y una A100 o H100 aportaría margen para procesar las tres cámaras a 30 FPS con baja latencia.
- ¿Cabe en GPU de consumo? Probablemente sí en fp16 en tarjetas con 16 GB o más (RTX 4080/4090, RTX 5070 Ti y superiores), aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para una política de robótica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la frecuencia del dataset de entrenamiento, pero no se reportan tiempos de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethanCSL/openarm_insertbattery_lerobot_real_gr00t_v02` | 3,1 B | no disponible | Política GR00T N1.7 ajustada a tarea | Apache 2.0 | Hugging Face (0 descargas) |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot ACT / Diffusion | no disponible | no disponible | Políticas de imitación específicas por tarea | no disponible | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El modelo base GR00T N1.7 y las políticas ACT/Diffusion de LeRobot son las referencias naturales, pero no se han facilitado sus especificaciones numéricas en esta ficha.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "coger la estación de carga con el brazo izquierdo e insertar la batería con el brazo derecho" sobre el robot `openarm_umeow`; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: la model card indica que no hay resultados de éxito en robot real, por lo que se desconoce la tasa de acierto y la robustez ante variaciones de posición, iluminación o distracciones.
- Dataset pequeño: 55 episodios y 41.360 frames son un volumen limitado, lo que puede provocar sobreajuste a las condiciones exactas de grabación.
- Dependencia de hardware concreto: requiere el robot `openarm_umeow` y tres cámaras con nombres e índices específicos (`body_cam`, `wrist_cam`, `right_wrist_cam`); cambiar la configuración de cámaras invalida la política.
- Dependencia de la instrucción exacta: el prompt de tarea debe coincidir con el usado en entrenamiento para un comportamiento fiable.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante escenas no vistas, con riesgo de colisiones o daños en el robot y en los objetos.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del modelo base GR00T N1.7 y de los componentes Cosmos-Reason2/Qwen3-VL, así como las de las dependencias de LeRobot.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, sin garantía de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_insertbattery_lerobot_real_gr00t_v02
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_insertbattery_lerobot_real_v02
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_insertbattery_lerobot_real_v02
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
