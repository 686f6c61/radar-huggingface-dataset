# Emadodin/act_so101_manual_v1

## Resumen

`Emadodin/act_so101_manual_v1` es una política de imitación (imitation learning) para robótica basada en el método ACT (Action Chunking with Transformers), publicado originalmente por Zhao et al. en 2023 (arXiv:2304.13705). El modelo ha sido entrenado y publicado con la librería LeRobot de Hugging Face por el usuario Emadodin, y está diseñado para controlar un brazo robótico de tipo `so101` en una tarea concreta: coger un cubo verde y colocarlo en una zona objetivo.

A diferencia de los modelos de lenguaje, esta política consume observaciones multimodales (dos cámaras de 480x640 y un vector de estado de 6 dimensiones) y produce directamente comandos de acción de 6 dimensiones, sin generar texto. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, se trata de un modelo compacto pensado para inferencia en tiempo real sobre hardware robótico de bajo coste.

Su relevancia es limitada pero específica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) y como punto de partida para quien quiera entrenar políticas propias en el robot SO-101. No es un modelo de propósito general ni tiene capacidades de razonamiento simbólico, lenguaje o visión más allá de las dos cámaras configuradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (no procesa lenguaje; tarea fija en inglés como texto de prompt) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de compounding y mejora la estabilidad en tareas de manipulación. La arquitectura combina un backbone visual (procesa las dos cámaras `wrist` y `top` a 480x640) con un transformer que fusiona las observaciones visuales y el estado proprioceptivo de 6 dimensiones, y un decoder que emite acciones de 6 dimensiones. El modelo incorpora el mecanismo de *temporal ensembling* característico de ACT para suavizar las predicciones entre chunks.

El entrenamiento se realizó sobre el dataset `Emadodin/so101_pickplace_manual_extra_v1`, con 111 episodios, 78.225 frames a 50 FPS y una única tarea: "pick the green cube and place it in the target zone". La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.7.0. No se documenta composición del dataset más allá del número de episodios ni si hubo aumentación de datos, RLHF o DPO (no aplicables en este paradigma).

## Capacidades

- Control robótico de manipulación pick-and-place sobre el robot `so101` para la tarea específica de coger un cubo verde y depositarlo en una zona objetivo.
- Percepción visual multimodal a partir de dos cámaras (muñeca y vista superior) a resolución 480x640.
- Fusión de estado proprioceptivo de 6 dimensiones con observaciones visuales.
- Predicción de chunks de acciones de 6 dimensiones con temporal ensembling.
- Ejecución en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes multi-step, razonamiento simbólico ni generación de texto.
- No tiene capacidades multilingües ni de visión general: las cámaras están fijadas a la configuración de entrenamiento.
- No dispone de thinking mode, audio ni otras capacidades especiales.

## Casos de uso

- **Automatización de pick-and-place en laboratorio:** el modelo ejecuta la tarea "pick the green cube and place it in the target zone" sobre un SO-101, útil como banco de pruebas reproducible para comparar configuraciones de cámara, iluminación o posiciones de objeto.
- **Base para fine-tuning con datos propios:** al ser un checkpoint ACT entrenado con LeRobot 0.7.0, se puede reentrenar con `lerobot-train` sobre un dataset propio del mismo robot para adaptar la política a nuevas tareas de manipulación.
- **Validación de pipelines de imitation learning:** sirve para verificar de extremo a extremo el flujo `lerobot-rollout` → `lerobot-train` → despliegue, incluyendo calibración de robot, mapeo de cámaras y claves de observación.
- **Docencia y divulgación en robótica:** ejemplo compacto (0,2 GB, 51,7 M de parámetros) para explicar ACT, action chunking y temporal ensembling en cursos o talleres con hardware asequible.
- **Investigación en robustez visual:** permite estudiar cómo afectan cambios de iluminación, distractores o posiciones del cubo al éxito de una política ACT entrenada con 111 episodios.
- **Prototipado de estaciones de pick-and-place de bajo coste:** el tamaño reducido del modelo permite ejecutarlo en un PC con GPU consumer conectado al brazo, sin necesidad de infraestructura de servidor.
- **Generación de datos sintéticos comparativos:** al ser una política entrenada con un dataset público y visualizable, se puede usar como referencia para comparar contra políticas entrenadas con datasets ampliados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas ACT sobre el mismo robot.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma oficial. Con 51,7 M de parámetros en safetensors (≈0,2 GB en fp32), la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM; el cuello de botella real es el procesamiento de dos streams de vídeo a 480x640.
- **GPU recomendadas:** cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para pruebas de baja frecuencia, aunque no se documenta latencia.
- **Cabe en GPU consumer:** sí, con amplio margen, dado el tamaño del checkpoint.
- **Opciones de despliegue:** `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Emadodin/act_so101_manual_v1`; el entrenamiento se realiza con `lerobot-train --policy.type=act`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- **Latencia y throughput:** no disponibles. La model card no reporta frecuencia de inferencia efectiva ni latencia por chunk; el dataset se grabó a 50 FPS, pero no se especifica la tasa de control en despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Emadodin/act_so101_manual_v1` | 51,7 M | Pick-and-place SO-101, 2 cámaras 480x640, estado 6D | no disponible | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | no disponible | Distintas tareas y robots | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | Manipulación con difusión de acciones | variable | Hugging Face |
| Políticas VLA tipo π0 / OpenVLA | no disponible | Control generalista guiado por lenguaje | variable | Hugging Face / repos públicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada. La comparación se limita a categoría (políticas de imitation learning en LeRobot) y a disponibilidad; no se han publicado métricas que permitan ordenarlas por tasa de éxito.

## Limitaciones y advertencias

- **Licencia no especificada:** la model card indica "More Information Needed"; no se puede garantizar el uso comercial sin contactar con el autor.
- **Sin evaluación publicada:** no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable en producción.
- **Tarea única y cerrada:** entrenada exclusivamente para "pick the green cube and place it in the target zone"; no generaliza a otros objetos, colores o posiciones sin reentrenamiento.
- **Dataset pequeño:** 111 episodios y 78.225 frames, lo que limita la robustez frente a variaciones de iluminación, distractores o cambios de posición.
- **Dependencia de la configuración de cámaras:** las claves `observation.images.wrist` y `observation.images.top` deben coincidir exactamente con las del despliegue; un mapeo distinto invalida la política.
- **Riesgo de sobreajuste al robot concreto:** el entrenamiento se realizó sobre un SO-101 concreto; diferencias de calibración, fricción o cableado pueden degradar el comportamiento.
- **Sin capacidades de lenguaje ni razonamiento:** no admite instrucciones en lenguaje natural más allá del texto fijo de la tarea, ni tool calling, ni agentes.
- **Sin datos de sesgo o alucinación:** no aplican en el sentido habitual de modelos de lenguaje, pero sí existe riesgo de acciones erráticas fuera de distribución que pueden dañar el robot o el entorno; se recomienda supervisión humana.
- **Sin cuantizaciones publicadas:** no hay versiones GGUF, AWQ ni GPTQ; el despliegue está atado al formato safetensors de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Emadodin/act_so101_manual_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Emadodin/so101_pickplace_manual_extra_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Emadodin/so101_pickplace_manual_extra_v1
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
