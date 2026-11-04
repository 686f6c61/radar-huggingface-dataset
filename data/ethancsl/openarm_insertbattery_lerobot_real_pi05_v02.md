# ethanCSL/openarm_insertbattery_lerobot_real_pi05_v02

## Resumen

`ethanCSL/openarm_insertbattery_lerobot_real_pi05_v02` es un fine-tuning de política robótica del modelo π₀.₅ (Pi05) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. Se trata de un modelo Vision-Language-Action (VLA) entrenado para una tarea concreta de manipulación bimanual: coger una estación de carga con el brazo izquierdo e insertar una batería en ella con el brazo derecho, sobre el robot OpenArm (`openarm_umeow`).

El modelo parte de `lerobot/pi05_base` y se ha ajustado con un dataset propio de 55 episodios y 41.360 fotogramas a 30 FPS, grabados con tres cámaras (cuerpo, muñeca izquierda y muñeca derecha). Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y pesos en safetensors, el repositorio ocupa 9,4 GB.

Es relevante como ejemplo práctico de fine-tuning de un VLA de propósito general a una tarea industrial concreta (inserción de batería) usando el ecosistema LeRobot, lo que permite reproducir el pipeline completo de entrenamiento y despliegue en un robot real con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence; implementación LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | openarm_umeow |
| Cámaras de entrada | body_cam, wrist_cam, right_wrist_cam (3×224×224 RGB) |
| Entrada de estado | observation.state, shape (32,) |
| Salida de acción | action, shape (16,) |
| Dataset de entrenamiento | ethanCSL/openarm_insertbattery_lerobot_real_v02 |
| Episodios / fotogramas | 55 episodios / 41.360 fotogramas a 30 FPS |
| Pasos de entrenamiento | 6.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre π₀.₅ (Pi05), la evolución de π₀ de Physical Intelligence orientada a la generalización en entornos abiertos. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La política consume tres flujos visuales RGB de 224×224 píxeles (cámara de cuerpo y dos cámaras de muñeca) más un vector de estado de 32 dimensiones, y produce un vector de acción de 16 dimensiones por paso de control.

El fine-tuning se realizó sobre el dataset `ethanCSL/openarm_insertbattery_lerobot_real_v02` (55 episodios, 41.360 fotogramas a 30 FPS) durante 6.000 pasos con batch de 32, AdamW y learning rate de 2,5e-05, usando LeRobot 0.6.2. No se dispone de información sobre la composición exacta del dataset más allá de la tarea descrita, ni sobre si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente en imitation learning robótico) o innovaciones adicionales de decodificación. La tarea entrenada es bimanual: coger la estación de carga con el brazo izquierdo e insertar la batería con el brazo derecho.

## Capacidades

- Control robótico de manipulación bimanual: genera acciones de 16 dimensiones a partir de observaciones visuales y de estado para la tarea de inserción de batería.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas RGB de 224×224 (cuerpo, muñeca izquierda, muñeca derecha).
- Imitation learning / policy learning: reproduce la tarea aprendida a partir de demostraciones teleoperadas.
- Generalización limitada al dominio de la tarea entrenada (inserción de batería en estación de carga con OpenArm).
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable mediante `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual ni procesamiento de audio; el modelo está especializado en acción robótica, no en generación de lenguaje.

## Casos de uso

- Automatización de inserción de baterías en línea de montaje: el modelo ejecuta la secuencia bimanual de coger la estación y colocar la batería, adecuado para tareas repetitivas de ensamblaje con el robot OpenArm.
- Prototipado rápido de nuevas tareas de manipulación: sirve como plantilla de fine-tuning de π₀.₅ sobre un dataset propio (55 episodios) para validar pipelines de imitation learning en LeRobot.
- Investigación en VLA bimanual: permite estudiar la coordinación de dos brazos con tres cámaras y estado de 32 dimensiones en una tarea de precisión.
- Benchmark interno de despliegue robótico: utilizable como referencia para comparar latencia y tasa de éxito de π₀.₅ frente a otras políticas en el mismo hardware.
- Formación y demostración de pipelines LeRobot: el comando `lerobot-rollout` documentado facilita reproducir la inferencia en un robot real con fines didácticos.
- Reentrenamiento sobre nuevos objetos o posiciones: al estar bajo Apache 2.0 y basarse en `lerobot/pi05_base`, se puede ajustar a variantes de la tarea (otras estaciones de carga, otras baterías) con nuevos datasets.
- Evaluación de robustez ante cambios de iluminación o posiciones: el modelo puede usarse para medir la degradación de la política en condiciones distintas a las del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros en safetensors (fp32/bf16 según pesos), se estima un consumo de aproximadamente 8-9 GB en bf16 y en torno a 16 GB en fp32; no se dispone de cifras oficiales del autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con al menos 16 GB (RTX 4090, A100 40 GB, H100) resulta razonable para inferencia en precisión completa; no confirmado.
- GPU de consumo: probablemente cabe en una RTX 4090 (24 GB) en bf16, aunque no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento); no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ethanCSL/openarm_insertbattery_lerobot_real_pi05_v02 | ≈4,14 mil millones | no disponible | Inserción de batería bimanual (OpenArm) | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base de propósito general (π₀.₅) | no disponible en la información | Hugging Face (LeRobot) |
| π₀ (Pi0) de Physical Intelligence | no disponible en la información | no disponible | VLA de propósito general | no disponible en la información | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para la tarea "coger la estación de carga con el brazo izquierdo e insertar la batería con el brazo derecho" sobre el robot `openarm_umeow`; no se espera un comportamiento correcto fuera de ese dominio.
- Sin evaluación publicada: no hay tasa de éxito ni resultados en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 55 episodios y 41.360 fotogramas son una base limitada, lo que puede reducir la robustez ante variaciones de posición, iluminación o distracciones.
- Dependencia de hardware específico: requiere el robot OpenArm y tres cámaras con nombres e índices concretos (`body_cam`, `wrist_cam`, `right_wrist_cam`); cambios en la configuración de cámaras invalidan la política.
- Riesgo de sobreajuste al entorno de grabación: al no haberse documentado variabilidad en el dataset, es probable que el modelo falle ante objetos o escenas distintas a las de entrenamiento.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo de acción robótica el concepto de sesgo aplica a distribuciones de demostraciones, no a texto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base `lerobot/pi05_base` antes de un despliegue comercial.
- Sin datos de cuantización ni de despliegue en hardware de consumo: no se confirma que funcione en GPUs de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_insertbattery_lerobot_real_pi05_v02
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_insertbattery_lerobot_real_v02
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_insertbattery_lerobot_real_v02
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
