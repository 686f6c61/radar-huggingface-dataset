# puppet-robotics/golf-model-3-8fps-servos

## Resumen

`puppet-robotics/golf-model-3-8fps-servos` es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino de `lerobot/pi05_base`, el modelo π₀.₅ de Physical Intelligence implementado en LeRobot. El modelo está especializado en una única tarea robótica: "Play golf" (jugar al golf), ejecutada sobre un robot de tipo `oscar` con dos cámaras (`wrist` y `ego`) y un estado de 21 dimensiones. No es un modelo de lenguaje general, sino un controlador de imitación que traduce observaciones visuales y propioceptivas en comandos de acción de 19 dimensiones.

El modelo resuelve el problema de generar políticas de control robótico a partir de demostraciones: se ha entrenado con 172 episodios y 16.288 fotogramas grabados a 8 FPS del dataset `puppet-robotics/golf_3_servo_expected`. Su relevancia es acotada pero concreta: demuestra el flujo completo de ajuste fino de π₀.₅ en LeRobot para una tarea de manipulación específica, con un repositorio de 9,4 GB y 4.143.404.816 parámetros en formato safetensors.

La arquitectura subyacente es la de π₀.₅ (VLA basada en un transformer con codificador visual y decodificador de acciones), aunque la model card no detalla la composición interna ni el número de tokens de entrenamiento del modelo base. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el modelo se distribuye a través de la librería LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅ (Pi05), basada en transformer con codificador visual y decodificador de acciones; implementación LeRobot |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | `oscar` |
| Cámaras | `wrist` (3, 480, 640), `ego` (3, 720, 1280) |
| Estado de observación | `observation.state` (21,) |
| Salida de acción | `action` (19,) |
| Dataset de entrenamiento | `puppet-robotics/golf_3_servo_expected` (172 episodios, 16.288 fotogramas, 8 FPS) |
| Tarea | "Play golf" |
| Pasos de entrenamiento | 50.000 |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence, descrito por el autor como un modelo visión-lenguaje-acción diseñado para generalización en entornos abiertos. La model card no especifica la composición interna exacta (número de capas, dimensión oculta, mecanismo de atención) ni el número de tokens del preentrenamiento del modelo base. La información disponible confirma que se trata de una política de imitación que consume dos flujos de imagen (muñeca y ego) más un vector de estado de 21 dimensiones, y emite un vector de acción de 19 dimensiones.

El ajuste fino se realizó con 50.000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, sobre LeRobot 0.6.2. El dataset contiene 172 episodios y 16.288 fotogramas a 8 FPS de la tarea "Play golf". No se documenta en la información proporcionada si hubo RLHF, DPO ni ninguna fase de alineación adicional; tampoco se detalla la composición del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control robótico de imitación para la tarea "Play golf" sobre el robot `oscar`.
- Fusión de dos cámaras (vista de muñeca y vista ego) con un vector de estado propioceptivo de 21 dimensiones.
- Generación de acciones continuas de 19 dimensiones a partir de observaciones multimodales.
- Ejecución de políticas en tiempo real a 8 FPS mediante `lerobot-rollout`.
- Ajuste fino adicional sobre el modelo base `lerobot/pi05_base` con `lerobot-train`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni multilingüismo; estas no aplican a un modelo de robótica de este tipo.

## Casos de uso

- Automatización de la tarea de golf robótico: el modelo ejecuta la política entrenada sobre el robot `oscar` con las cámaras `wrist` y `ego`, reproduciendo la tarea "Play golf" tal como se demostró en los 172 episodios del dataset. Es adecuado porque está ajustado específicamente para esa configuración de sensores y actuadores.
- Base para ajuste fino de variantes de la tarea: al partir de `lerobot/pi05_base` y estar entrenado con `lerobot-train`, sirve como punto de partida para especializar la política en variantes del mismo entorno (posiciones de bola, palos o trayectorias) con nuevos datasets.
- Investigación en imitación visual-motora: permite reproducir el flujo completo de LeRobot (grabación, entrenamiento, rollout) con un caso concreto y un dataset público de 16.288 fotogramas, útil para comparar metodologías de VLA.
- Evaluación de generalización de π₀.₅: al derivar de un modelo diseñado para generalización en entornos abiertos, permite medir en un dominio acotado (golf) cuánto de esa generalización se conserva tras el ajuste fino.
- Despliegue en laboratorio con hardware `oscar`: el comando `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política sin grabar episodios, adecuado para pruebas de latencia y repetibilidad en un banco de pruebas.
- Docencia y demostraciones de robótica de imitación: el repositorio incluye instrucciones completas de instalación, calibración y ejecución, lo que facilita su uso en cursos o talleres con robots de tipo `oscar`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros en safetensors, una estimación orientativa en FP16 sería de aproximadamente 8,3 GB solo para pesos, pero el autor no publica cifras de VRAM ni de cuantización.
- GPU recomendadas: no disponible. La model card no especifica hardware de referencia ni GPU validadas.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (ejecución en robot) y `lerobot-train` (entrenamiento). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: la política opera a 8 FPS según el dataset de entrenamiento, pero no se publican cifras de latencia por inferencia ni de throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `puppet-robotics/golf-model-3-8fps-servos` | 4.143.404.816 | no disponible | "Play golf" sobre robot `oscar` | Apache 2.0 | Hugging Face (LeRobot) |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base para ajuste fino | no disponible en la información | Hugging Face (LeRobot) |
| Otras políticas LeRobot ajustadas | no disponible | no disponible | Tareas específicas | variable | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Play golf" sobre el robot `oscar` con las cámaras `wrist` y `ego`; no se espera que funcione en otras tareas, robots o configuraciones de sensores.
- Ausencia de evaluación: la model card declara que no hay resultados de éxito en robot real, por lo que se desconoce la tasa de acierto y la robustez ante variaciones de posición, iluminación o distractores.
- Dependencia del dataset: con solo 172 episodios y 16.288 fotogramas, el riesgo de sobreajuste al entorno de grabación es alto; no se documenta diversidad de escenarios.
- Sin datos de sesgos, alucinación o multilingüismo: al no ser un modelo de lenguaje general, estas categorías no aplican, pero tampoco se documentan sesgos visuales ni de dominio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias del modelo base `lerobot/pi05_base` y del dataset `puppet-robotics/golf_3_servo_expected`.
- Requisitos de hardware no publicados: no se confirma que el modelo quepa en GPU de consumo ni se ofrecen alternativas de cuantización.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puppet-robotics/golf-model-3-8fps-servos
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/puppet-robotics/golf_3_servo_expected
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=puppet-robotics/golf_3_servo_expected
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
