# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_aug3_ID_164248

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_aug3_ID_164248` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un modelo de robótica que transforma observaciones visuales y de estado del robot en secuencias de acciones de 7 dimensiones, tratando el control como un proceso generativo de difusión. El autor es el usuario de Hugging Face `castanetnicolas`, y el modelo se distribuye bajo licencia Apache 2.0.

El modelo está especializado en una única tarea de ensamblaje de tres piezas ("Insert the first piece into the base, then insert the second piece on top of it"), entrenada sobre el dataset `mimicgen_three_piece_assembly_d1_image84` con 200 episodios y 67.101 fotogramas a 20 FPS. La arquitectura es una red de difusión para políticas (Diffusion Policy, arXiv:2303.04137) con 278.014.699 parámetros totales, dos cámaras de entrada (`agentview` y `robot0_eye_in_hand`) a resolución 84x84 y una salida de acción de 7 dimensiones.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible dentro del ecosistema LeRobot, útil para estudiar manipulación rica en contacto y para reproducir el pipeline de entrenamiento e inferencia, pero no es un modelo generalista ni un modelo de lenguaje. El repositorio ocupa 1,1 GB y no cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora basada en difusión; red de difusión para generación de trayectorias de acción) |
| Parametros totales | 278.014.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción de acciones no especificado en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.1 |
| Tipo de robot | `panda` (según model card); el identificador del repo menciona `UR5e` |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state`, shape `(9,)` |
| Entrada visual | `(3, 84, 84)` por cámara |
| Salida de acción | `action`, shape `(7,)` |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image84` |
| Episodios / fotogramas | 200 episodios / 67.101 fotogramas a 20 FPS |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador | Adam |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

La política sigue el paradigma de Diffusion Policy: en lugar de predecir directamente una acción, modela la distribución de trayectorias de acción mediante un proceso de difusión generativo, lo que produce secuencias suaves y multimodales adecuadas para manipulación rica en contacto. La entrada combina un vector de estado de 9 dimensiones con dos imágenes RGB de 84x84 píxeles procedentes de las cámaras `agentview` y `robot0_eye_in_hand`; la salida es un vector de acción de 7 dimensiones por paso. El modelo tiene 278.014.699 parámetros y se distribuye en formato safetensors.

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, con batch size 32, optimizador Adam, learning rate 1e-4 y semilla 1000, sobre el dataset MimicGen de ensamblaje de tres piezas con 200 episodios y 67.101 fotogramas a 20 FPS. La información disponible no detalla la composición del dataset más allá de la tarea, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este contexto de imitación) ni innovaciones adicionales como decodificación especulativa o atención lineal. El sufijo del identificador (`crop76_aug3`) sugiere recorte a 76 píxeles y aumentación de datos, pero no se documenta explícitamente en la model card.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para control visuomotor, gracias al proceso de difusión.
- Manipulación rica en contacto: la tarea de ensamblaje de tres piezas requiere inserción precisa y contacto físico.
- Percepción visual desde dos cámaras simultáneas (`agentview` y `robot0_eye_in_hand`) a 84x84.
- Fusión de estado propioceptivo (9 dimensiones) con información visual.
- Especialización en una única tarea de ensamblaje; no es un modelo multitarea ni generalista.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento (thinking mode).
- Inferencia en tiempo real mediante `lerobot-rollout` con estrategia `base` y duración configurable.

## Casos de uso

- Reproducción de experimentos de Diffusion Policy: el modelo permite replicar el pipeline de entrenamiento e inferencia publicado en LeRobot sin reentrenar desde cero, útil para validar resultados de investigación en manipulación.
- Ensamblaje de precisión en laboratorio: la política está entrenada específicamente para insertar una primera pieza en una base y una segunda encima, un escenario de contacto rico donde la difusión genera trayectorias suaves y evita movimientos bruscos.
- Benchmark de referencia para comparar variantes de Diffusion Policy: al tener configuración de entrenamiento documentada (300.000 pasos, batch 32, lr 1e-4, semilla 1000), sirve como línea base reproducible.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado permiten ilustrar el flujo completo de LeRobot (grabación, entrenamiento, rollout) con un caso concreto.
- Pruebas de integración hardware-software: sirve para validar la calibración de cámaras y brazos tipo `panda`/`UR5e` en un entorno controlado antes de desplegar políticas más generales.
- Generación de datos sintéticos o aumentados: las trayectorias generadas por la política pueden emplearse para estudiar el comportamiento del controlador en condiciones de contacto, siempre dentro del dominio de la tarea entrenada.
- Evaluación de robustez frente a cambios de iluminación, posiciones de objeto o distracciones: la model card sugiere reportar estas condiciones en la evaluación, por lo que el modelo es un candidato para ese tipo de estudios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 278 millones de parámetros en safetensors y un repo de 1,1 GB, la inferencia en FP32 requiere del orden de 1,1 GB de pesos más activaciones y buffers de imágenes, por lo que es viable en GPUs de consumo.
- GPU recomendadas: no especificadas en la información. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política; no se documentan modelos concretos (A100, H100, RTX 4090).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path` apuntando al repo; entrenamiento con `lerobot-train --policy.type=diffusion`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card no reporta FPS de inferencia ni latencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (diffusion, three_piece_assembly) | Diffusion Policy para ensamblaje | 278.014.699 | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas LeRobot Diffusion Policy | Diffusion Policy para otras tareas | no disponible | no disponible | generalmente Apache 2.0 | Hub de Hugging Face (no se dispone de datos concretos en la información) |
| Políticas ACT (Action Chunking Transformer) en LeRobot | Transformer de imitación | no disponible | no disponible | no disponible | Hub de Hugging Face (no se dispone de datos concretos en la información) |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación rigurosa con alternativas. La comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea de ensamblaje de tres piezas; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de las cámaras: la política espera exactamente las claves `observation.images.agentview` y `observation.images.robot0_eye_in_hand` con resolución 84x84; cambios de cámara, calibración o encuadre degradan el rendimiento.
- Ambigüedad de robot: la model card indica `panda`, mientras que el identificador del repo menciona `UR5e`; debe verificarse la correspondencia hardware antes de desplegar.
- Sin datos de sesgos, alucinación o limitaciones lingüísticas: no aplican en el sentido habitual, pero el modelo puede fallar silenciosamente ante distribuciones de entrada fuera del dataset de entrenamiento (iluminación, posiciones, distractores).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin cuantizaciones documentadas: no se han publicado versiones GGUF ni int8/int4, lo que limita optimizaciones de despliegue en hardware restringido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- El sufijo del identificador (`crop76_aug3`) sugiere recorte y aumentación no documentados explícitamente, lo que puede afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_aug3_ID_164248
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
