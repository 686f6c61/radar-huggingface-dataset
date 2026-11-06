# chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F5

## Resumen

`act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F5` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario chenproject35 en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor entrenado con LeRobot que, a partir del estado articular del robot y dos cámaras (frontal y de muñeca), predice comandos de acción de 7 dimensiones para ejecutar una tarea concreta de pick-and-place sobre un robot `rebot_b601_follower`.

El modelo resuelve una tarea muy específica: "Pick up inreach2 and place it in the jig". Se entrenó con 60 episodios de teleoperación (58.148 fotogramas a 30 FPS) y 60.000 pasos de entrenamiento. Con 51,67 millones de parámetros y pesos en safetensors, es un modelo pequeño que cabe con holgura en GPU de consumo, lo que lo hace útil como referencia para reproducir flujos de imitation learning en robótica de bajo coste.

Su relevancia es doble: por un lado, demuestra el pipeline completo de LeRobot (grabación de datos, entrenamiento, rollout); por otro, el sufijo del nombre (`ood_cell4_hil_rac_r1_F5`) sugiere una variante orientada a evaluación fuera de distribución y con intervención humana (HIL), aunque el autor no documenta estos detalles en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parámetros totales | 51.670.663 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantización | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | No disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `rebot_b601_follower` |
| Cámaras de entrada | `cam_front`, `cam_wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (7,) |
| Salida de acción | `action` (7,) |
| Tamaño del repositorio | 7,4 GB |
| Librería | lerobot |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La política combina un codificador visual para las dos cámaras con un transformer que fusiona las observaciones y genera secuencias de acciones. El modelo tiene 51,67 M de parámetros, coherente con la escala típica de ACT en LeRobot.

El entrenamiento se realizó sobre el dataset `chenproject35/pick-and-place-b601-60ep-yaw0-v2`: 60 episodios, 58.148 fotogramas a 30 FPS, con una única tarea. La configuración reportada es de 60.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en este paradigma). El nombre del repositorio incluye indicios de evaluación OOD, intervención humana (HIL) y variantes (`rac_r1_F5`) que no están explicados en la model card.

## Capacidades

- Control visomotor para pick-and-place: predice acciones de 7 dimensiones a partir de estado articular y dos imágenes RGB.
- Ejecución de una tarea concreta: "Pick up inreach2 and place it in the jig".
- Entrada multimodal limitada a estado + visión (no hay texto, audio ni otras modalidades).
- Compatible con el pipeline de rollout de LeRobot (`lerobot-rollout`) sobre el robot `rebot_b601_follower`.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Automatización de pick-and-place en celda de laboratorio: el modelo ejecuta la secuencia de recogida y colocación en el jig sobre el robot `rebot_b601_follower`, usando las cámaras frontal y de muñeca para localizar la pieza.
- Reproducción de experimentos de imitation learning: sirve como política de referencia para validar el pipeline de LeRobot (grabación, entrenamiento y rollout) con 60 episodios y 60.000 pasos.
- Base para fine-tuning en tareas similares: al ser Apache 2.0 y tener solo 51,67 M de parámetros, se puede reentrenar con nuevos datasets de pick-and-place en hardware de consumo.
- Evaluación de robustez fuera de distribución: el sufijo `ood_cell4` sugiere su uso para medir degradación ante cambios de posición, iluminación o distractores en la celda 4.
- Pruebas de intervención humana (HIL): el sufijo `hil` apunta a escenarios donde un operador corrige la política durante el rollout, útil para estudiar estrategias de aprendizaje con correcciones.
- Docencia y prototipado en robótica: permite montar una demo completa de control visomotor con dos cámaras OpenCV a 640x480 y 30 FPS sin necesidad de GPUs de gama alta.
- Integración en bancos de pruebas de políticas robóticas: su tamaño reducido y formato safetensors facilitan cargarlo en scripts de evaluación automatizada junto con otras políticas ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de imagen (dos cámaras a 480x640x3) y el runtime, no por el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con varios GB de VRAM (p. ej. RTX 3060 en adelante); no se han publicado requisitos mínimos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) con `policy.path` apuntando al repositorio; el resto de runtimes (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F5` | 51,67 M | ACT (LeRobot) | Estado (7,) + 2 cámaras 480x640 | Apache 2.0 | Hugging Face |
| `chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4` | 51,7 M | ACT (LeRobot) | No disponible en detalle | No disponible | Hugging Face |
| Otras políticas ACT de LeRobot | Variable | ACT | Estado + visión | Variable (habitualmente Apache 2.0) | Hugging Face |

No se dispone de datos de rendimiento comparado (tasas de éxito, latencia) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para "Pick up inreach2 and place it in the jig"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez.
- Riesgo de sobreajuste al entorno de entrenamiento: al proceder de 60 episodios en una celda concreta, es probable que la política degrade ante cambios de iluminación, posición de objetos o configuración de cámara.
- Dependencia del hardware: requiere el robot `rebot_b601_follower` y cámaras con los nombres e índices exactos (`cam_front`, `cam_wrist`); un montaje distinto invalida las observaciones.
- Sin capacidades lingüísticas: no debe emplearse como modelo de texto, chat ni agentes conversacionales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia del dataset asociado.
- Ambigüedad en el nombre del repositorio: los sufijos `ood_cell4`, `hil`, `rac_r1_F5` no están documentados, lo que dificulta interpretar su propósito exacto en producción.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones (posiciones, objetos y condiciones limitadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F5
- Variante relacionada: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
