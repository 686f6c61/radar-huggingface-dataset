# castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163714

## Resumen

`castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163714` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y distribuida a través del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica contact-rich: insertar dos piezas en una base, una sobre otra, a partir de observaciones visuales y propioceptivas del robot. No es un modelo de lenguaje: es una política de imitación que mapea observaciones (estado articular e imágenes de dos cámaras) a acciones de 7 dimensiones en un robot tipo panda.

La relevancia de esta ficha es acotada y específica: se trata de un artefacto reproducible de investigación en aprendizaje por imitación, con 274 millones de parámetros, entrenado durante 200.000 pasos sobre 200 episodios (67.101 frames a 20 FPS) del dataset MimicGen `three_piece_assembly`. Diffusion Policy modela el control visuomotor como un proceso generativo de difusión, lo que produce trayectorias de acción suaves y multimodales, ventajosas en tareas con contacto físico intenso.

El modelo está publicado con licencia Apache 2.0, en formato safetensors y librería LeRobot 0.6.1. No incluye evaluación en robot real en su model card, por lo que su utilidad práctica debe validarse antes de cualquier despliegue. El nombre del repositorio sugiere un robot UR5e, mientras que la model card declara `panda` como tipo de robot, una discrepancia que conviene verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), implementado en LeRobot |
| Parámetros totales | 274.086.635 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de acción H=16 según el nombre del repo, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política sigue el paradigma Diffusion Policy (paper arXiv:2303.04137): en lugar de predecir una acción de forma determinista, aprende la distribución condicional de secuencias de acciones mediante un proceso de difusión denoising. La entrada combina `observation.state` de forma `(9,)` con dos imágenes RGB de `(3, 84, 84)` procedentes de las cámaras `agentview` y `robot0_eye_in_hand`. La salida es un vector de acción de `(7,)`. El nombre del repositorio codifica hiperparámetros: `BS_128` (batch size 128), `H_16` (horizonte de predicción 16) y `UR5e`, aunque la model card declara robot `panda`.

El entrenamiento se realizó con LeRobot 0.6.1, optimizador Adam, learning rate 0.0001, semilla 1000 y 200.000 pasos sobre el dataset `mimicgen_three_piece_assembly_d1_image84` (200 episodios, 67.101 frames, 20 FPS). No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica a este tipo de política). La innovación técnica es la propia formulación generativa de la política, que captura multimodalidad en las trayectorias de acción.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para manipulación robótica contact-rich.
- Control visuomotor a partir de dos vistas RGB (cámara externa `agentview` y cámara en la muñeca `robot0_eye_in_hand`).
- Condicionamiento por estado propioceptivo de 9 dimensiones.
- Ejecución de la tarea específica de ensamblaje de tres piezas (inserción secuencial).
- Integración con el pipeline de inferencia de LeRobot (`lerobot-rollout`).
- No soporta tool calling, agentes, razonamiento multi-step simbólico, ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Ensamblaje de precisión en línea de montaje: la política ejecuta la inserción secuencial de dos piezas sobre una base, tarea para la que fue entrenada, usando las dos cámaras para corregir desviaciones durante el contacto.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible de Diffusion Policy sobre MimicGen para comparar variantes de arquitectura o hiperparámetros.
- Benchmark de políticas visuomotoras: permite evaluar en simulación o en robot real la robustez de una política de difusión frente a alternativas como ACT o VQ-BeT sobre la misma tarea.
- Generación de datos sintéticos de manipulación: al integrarse en MimicGen, puede usarse para estudiar la transferencia sim-a-real de políticas entrenadas con datos aumentados.
- Prototipado de pipelines LeRobot: útil como ejemplo funcional de entrenamiento e inferencia con `lerobot-train` y `lerobot-rollout` en un robot panda o UR5e.
- Docencia y formación en robótica: caso práctico de política de difusión con observaciones multimodales y acciones de 7 grados de libertad.
- Automatización de tareas de ensamblaje en laboratorio: validación de la política en un UR5e o panda real antes de industrializar el flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 274 M de parámetros en safetensors, la huella de pesos es de aproximadamente 1,1 GB (tamaño del repo), por lo que debería caber en GPUs consumer con holgura, pero no se confirma.
- GPU recomendadas: no disponible; LeRobot usa `--policy.device=cuda` en el ejemplo de entrenamiento, sin especificar modelo de GPU.
- ¿Cabe en GPU consumer? Muy probablemente sí por tamaño de pesos, pero no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Diffusion Policy, LeRobot) | Política de difusión visuomotora | 274 M | H=16 (según nombre del repo) | Apache 2.0 | Hugging Face |
| ACT (Action Chunking Transformer) | Política de imitación transformer | no disponible | no disponible | no disponible | LeRobot |
| VQ-BeT | Política de imitación con cuantización vectorial | no disponible | no disponible | no disponible | LeRobot |
| Diffusion Policy original (paper) | Política de difusión | no disponible | no disponible | no disponible | Código de referencia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay evaluación en robot real publicada; el éxito de la política no está validado empíricamente.
- Discrepancia entre el nombre del repo (`UR5e`) y la model card (`panda`): verificar el robot objetivo antes de desplegar.
- Entrenada exclusivamente para una tarea muy concreta (ensamblaje de tres piezas); no generaliza a otras tareas sin reentrenamiento.
- Depende de la configuración exacta de cámaras (`agentview`, `robot0_eye_in_hand`) y de sus nombres; cambios de montaje o iluminación pueden degradar el rendimiento.
- Dataset pequeño (200 episodios, 67.101 frames); riesgo de sobreajuste a posiciones y condiciones del dataset MimicGen.
- Sin datos de sesgos, alucinación o multilingüismo (no aplican como en LLMs), pero sí hay riesgo de fallos de contacto y colisiones en entornos no vistos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace recomendable una validación exhaustiva antes de producción.
- No se documentan requisitos de seguridad física para operar el robot con esta política.

## Enlaces

- Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_128_H_16_TASK_three_piece_assembly_ID_163714
- Dataset: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
