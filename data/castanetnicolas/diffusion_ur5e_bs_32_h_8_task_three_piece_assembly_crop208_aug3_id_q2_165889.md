# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop208_aug3_ID_q2_165889

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop208_aug3_ID_q2_165889` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real. El modelo resuelve una tarea concreta de manipulación de contacto intensivo: insertar la primera pieza en una base e insertar después la segunda pieza encima de esta, dentro de un entorno de tipo MimicGen.

A diferencia de los modelos de lenguaje, este artefacto no genera texto: consume observaciones del robot (estado de 9 dimensiones y dos cámaras RGB de 256x256) y produce trayectorias de acción de 7 dimensiones. Su relevancia es práctica y acotada: sirve como ejemplo reproducible de cómo entrenar y desplegar una política de difusión con LeRobot sobre un robot tipo panda y un dataset sintético de 220 episodios.

El modelo tiene 278.014.859 parámetros y un repositorio de 1,1 GB en formato safetensors. La model card no documenta arquitectura interna detallada, idiomas ni resultados de evaluación, por lo que esta ficha se limita a los datos verificables publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa; backbone no detallado en la model card) |
| Parametros totales | 278.014.859 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción de acciones no documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (arXiv:2303.04137), que formula el control visuomotor como un proceso generativo de difusión: en lugar de regresar una acción única, el modelo genera trayectorias de acción multimodales y suaves, lo que mejora el comportamiento en tareas con contacto rico. La model card no especifica el backbone concreto (por ejemplo, U-Net convolucional o transformer), el número de pasos de difusión ni el horizonte de predicción, aunque el nombre del repositorio sugiere un horizonte de 8 pasos (`H_8`).

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image256`, compuesto por 220 episodios y 73.864 fotogramas a 20 FPS, con imágenes de 256x256. La configuración publicada incluye 300.000 pasos de entrenamiento, batch size de 32, optimizador Adam, learning rate 1e-4 y semilla 1000. No se documentan datos de RLHF, DPO ni aumentos de datos específicos, pese a que el nombre del repositorio incluye `aug3` y `crop208`.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para control de un robot manipulador tipo panda.
- Percepción visual desde dos cámaras: `agentview` y `robot0_eye_in_hand`, ambas a 256x256 píxeles.
- Fusión de estado propioceptivo de 9 dimensiones con observaciones visuales.
- Ejecución de una tarea de ensamblaje de dos piezas con inserción secuencial.
- Control de contacto rico gracias a la formulación generativa por difusión.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento, visión general, audio ni generación de texto.

## Casos de uso

- Ensamblaje de precisión en línea de producción: la política ejecuta la inserción secuencial de dos piezas sobre una base, tarea representativa de operaciones de montaje que requieren alineación fina y control de fuerza.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de Diffusion Policy con el mismo dataset y configuración de entrenamiento.
- Prototipado rápido con LeRobot: el comando `lerobot-rollout` permite desplegar la política en un robot panda real en minutos, útil para validar hardware y calibración de cámaras.
- Generación de datos sintéticos y aumento: el dataset MimicGen asociado permite estudiar la transferencia de políticas entrenadas con datos generados a entornos reales.
- Benchmark interno de manipulación: puede usarse como línea base para medir mejoras en tareas de ensamblaje con contacto antes de entrenar políticas propias.
- Docencia y formación en robótica: ejemplo completo de pipeline de datos, entrenamiento y despliegue con LeRobot para cursos prácticos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 millones de parámetros en fp32 el peso ocupa aproximadamente 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no documentadas por el autor; por tamaño, una RTX 4090, RTX 3090 o superior es suficiente, e incluso GPUs de gama media podrían ejecutar la política.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM, aunque no se publica una cifra oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA mediante `--policy.device=cuda` en entrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control está condicionada por la tasa de 20 FPS del dataset y por el hardware de inferencia, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Diffusion Policy, LeRobot) | 278 M | no aplica | Ensamblaje de dos piezas | apache-2.0 | Hugging Face |
| Otras políticas Diffusion Policy en LeRobot Hub | variable | no aplica | Manipulación diversa | variable | Hugging Face |
| Políticas ACT en LeRobot Hub | variable | no aplica | Manipulación diversa | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La política está entrenada para una única tarea y un único tipo de robot (panda); no generaliza a otras tareas sin reentrenamiento.
- No se han publicado evaluaciones en robot real, por lo que se desconoce la tasa de éxito y la robustez ante variaciones de posición, iluminación o distractores.
- El dataset de entrenamiento es sintético (MimicGen), lo que puede introducir una brecha de dominio respecto al entorno físico real.
- Las cámaras y sus nombres deben coincidir exactamente con las claves de observación (`agentview`, `robot0_eye_in_hand`); un cambio de configuración invalida la política.
- No se documentan sesgos, pero al ser un modelo robótico específico no aplican consideraciones de sesgo lingüístico; sí aplican riesgos de seguridad física en la manipulación.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop208_aug3_ID_q2_165889
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
