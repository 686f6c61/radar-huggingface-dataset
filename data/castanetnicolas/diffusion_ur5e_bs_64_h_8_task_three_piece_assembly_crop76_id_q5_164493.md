# castanetnicolas/diffusion_UR5e_BS_64_H_8_TASK_three_piece_assembly_crop76_ID_q5_164493

## Resumen

Este repositorio contiene una política de control visuomotor entrenada con el método Diffusion Policy sobre la librería LeRobot. No es un modelo de lenguaje ni un modelo generativo de texto: es una política de imitación para robótica manipulativa que trata el control motor como un proceso de difusión generativo, produciendo trayectorias de acción suaves y multimodales. El autor es `castanetnicolas` y el modelo se distribuye con licencia Apache 2.0.

El modelo está especializado en una única tarea de ensamblaje de tres piezas: insertar la primera pieza en la base y después la segunda encima. Consume observaciones de estado articular (vector de 9 dimensiones) y dos cámaras RGB de 84x84 píxeles (`agentview` y `robot0_eye_in_hand`), y emite un vector de acción de 7 dimensiones. Fue entrenado sobre el dataset `mimicgen_three_piece_assembly_d1_image84`, con 200 episodios y 67.101 fotogramas a 20 FPS.

Su relevancia es acotada y experimental: se publica como artefacto reproducible de un pipeline de entrenamiento con LeRobot 0.6.1, con 278 millones de parámetros en pesos safetensors y un tamaño de repositorio de 1,1 GB. No incluye resultados de evaluación en robot real ni métricas de éxito publicadas, por lo que debe considerarse una política de referencia para experimentación, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo por difusión) sobre LeRobot |
| Parametros totales | 278.014.699 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de política de imitación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política sigue el enfoque Diffusion Policy (paper arXiv 2303.04137), que formula el control visuomotor como un proceso de difusión condicionado por observaciones. En lugar de predecir una acción puntual, el modelo genera una secuencia de acciones (horizonte de acción de 8 pasos, según el nombre del repositorio `H_8`) mediante un proceso de denoising iterativo, lo que produce trayectorias suaves y permite representar distribuciones multimodales de comportamiento, algo especialmente útil en manipulación con contacto rico. La entrada combina el estado del robot (9 dimensiones) con dos imágenes de 84x84 píxeles de las cámaras `agentview` y `robot0_eye_in_hand`; la salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, con batch size de 64 (coherente con el sufijo `BS_64` del identificador), optimizador Adam, learning rate 1e-4 y semilla 1000. El dataset de entrenamiento es `castanetnicolas/mimicgen_three_piece_assembly_d1_image84`, con 200 episodios, 67.101 fotogramas a 20 FPS y la tarea "Insert the first piece into the base, then insert the second piece on top of it". No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de refinamiento por refuerzo; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para manipulación robótica mediante difusión.
- Control visuomotor a partir de dos vistas de cámara (vista de agente y vista de muñeca) más estado articular.
- Ejecución de una tarea concreta de ensamblaje de tres piezas con inserción secuencial.
- Compatible con el stack LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible (no aplica).
- Capacidades multilingües: no disponible (no aplica).
- Modo thinking, visión general, audio o generación de texto: no disponible (no aplica; la "visión" se limita a las dos cámaras de entrada de la política).

## Casos de uso

- Investigación en aprendizaje por imitación: servir como política de referencia reproducible para comparar variantes de Diffusion Policy con el mismo dataset y configuración de entrenamiento.
- Ensamblaje de precisión en laboratorio: ejecutar la secuencia de inserción de dos piezas sobre una base con un robot Panda, aprovechando la suavidad de las trayectorias generadas por difusión en tareas con contacto.
- Reentrenamiento y ajuste fino: usar el repositorio como punto de partida con `lerobot-train` para adaptar la política a nuevas posiciones de objeto o a un robot del mismo tipo.
- Evaluación de robustez visuomotora: medir la tasa de éxito bajo cambios de iluminación, posiciones de objeto o distractores, ya que el autor no publica resultados de evaluación y este análisis queda abierto.
- Docencia y formación en robótica: demostrar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) con un caso de ensamblaje acotado y un dataset de 200 episodios.
- Integración en pipelines de simulación a real: emplear la política entrenada sobre datos estilo MimicGen como base para experimentos de transferencia y comparación con políticas entrenadas en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen tasas de éxito, número de ensayos ni métricas de robot real documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 millones de parámetros en safetensors (aproximadamente 1,1 GB de pesos en precisión de entrenamiento), la inferencia cabe con holgura en GPUs de consumo, aunque el requisito exacto depende del framework y del preprocesado de imágenes.
- GPU recomendadas: no disponibles en la documentación; por tamaño, una RTX 3090 o RTX 4090 es suficiente para inferencia y para reentrenamiento con batch size 64, si bien no se especifica en la información proporcionada.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del modelo; no se confirma con datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento), con soporte de `--policy.device=cuda`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`castanetnicolas/diffusion_UR5e_...`) | Diffusion Policy (LeRobot) | 278 M | Horizonte de acción de 8 pasos; observación de 2 cámaras 84x84 + estado 9D | Apache 2.0 | Hugging Face |
| Otras políticas Diffusion Policy en LeRobot Hub | Diffusion Policy | no disponible | no disponible | variable | Hugging Face |
| Políticas ACT en LeRobot Hub | Action Chunking Transformer | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea de ensamblaje de tres piezas; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que su fiabilidad efectiva es desconocida.
- Dependencia de la configuración de cámaras: los nombres y la resolución de las cámaras (`agentview`, `robot0_eye_in_hand`, 84x84) deben coincidir exactamente con los de entrenamiento; cualquier cambio invalida la inferencia.
- Dependencia del robot: entrenada para el tipo `panda`; el identificador menciona `UR5e`, lo que sugiere posible desajuste entre el nombre del repositorio y el robot declarado en la model card, un riesgo a verificar antes de desplegar.
- Sesgos y alucinación: no aplican en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamientos fuera de distribución ante objetos, posiciones o iluminación distintos de los del dataset.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario asume la responsabilidad de validar la seguridad física del despliegue.
- Sin datos de cuantización ni de idiomas: no es un modelo de texto, por lo que estas filas no son aplicables.
- Dataset limitado: 200 episodios y 67.101 fotogramas pueden ser insuficientes para robustez ante variaciones; conviene ampliar datos antes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_8_TASK_three_piece_assembly_crop76_ID_q5_164493
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
