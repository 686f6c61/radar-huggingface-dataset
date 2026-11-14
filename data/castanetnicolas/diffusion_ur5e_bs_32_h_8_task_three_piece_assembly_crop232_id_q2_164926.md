# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_ID_q2_164926

## Resumen

Se trata de una política de imitación visuomotora entrenada con el método Diffusion Policy y publicada en el ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica: insertar dos piezas sobre una base (ensamblaje de tres piezas). No es un modelo de lenguaje: es un controlador que, a partir de dos imágenes de cámara y del estado articular del robot, genera una trayectoria de acciones de 7 dimensiones a 20 FPS.

La arquitectura subyacente es una política de difusión (formulación DDPM/DDIM sobre acciones), tal como describe el paper Diffusion Policy (arXiv:2303.04137). El modelo tiene 278.014.919 parámetros en formato safetensors y un tamaño de repositorio de 1,1 GB. La entrada combina un vector de estado de 9 dimensiones con dos imágenes RGB de 256×256 (vista del agente y vista de la muñeca del robot).

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un pipeline de aprendizaje por imitación en LeRobot 0.6.1, entrenado sobre el dataset MimicGen de ensamblaje de tres piezas con 220 episodios y 73.864 fotogramas. No dispone de evaluación publicada ni de descargas, por lo que debe tratarse como un artefacto experimental de un autor individual, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa por difusión) |
| Parámetros totales | 278.014.919 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación por paso, sin contexto textual) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica mediante una cadena de texto fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `panda` (según model card) |
| Cámaras | `agentview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state`, forma `(9,)` |
| Entradas visuales | `(3, 256, 256)` por cámara |
| Salida de acción | `action`, forma `(7,)` |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image256` |
| Episodios / fotogramas | 220 episodios / 73.864 fotogramas a 20 FPS |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador / LR | Adam / 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La política sigue el enfoque Diffusion Policy: en lugar de predecir una acción de forma directa, modela la distribución de secuencias de acciones como un proceso de difusión generativo, lo que produce trayectorias multimodales y suaves, adecuadas para manipulación con contacto rico. La observación se compone de un vector de estado de 9 dimensiones y dos imágenes de 256×256 píxeles (vista global `agentview` y vista en la muñeca `robot0_eye_in_hand`), que se codifican y condicionan el proceso de denoising.

El entrenamiento es de imitación supervisada sobre el dataset MimicGen de ensamblaje de tres piezas (220 episodios, 73.864 fotogramas a 20 FPS), durante 300.000 pasos con batch size 32, optimizador Adam y tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.1. La model card no documenta uso de RLHF, DPO ni aumentos de datos adicionales, ni innovaciones técnicas más allá del propio método Diffusion Policy. La tarea entrenada es: «Insert the first piece into the base, then insert the second piece on top of it».

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para control visuomotor de un robot tipo `panda`.
- Manipulación con contacto rico (ensamblaje por inserción de piezas), el punto fuerte declarado de Diffusion Policy.
- Condicionamiento multimodal: estado articular de 9 dimensiones más dos vistas RGB de 256×256.
- Ejecución en bucle cerrado a 20 FPS mediante `lerobot-rollout`.
- Tarea parametrizada por una cadena de texto fija; no hay comprensión de lenguaje libre ni instrucciones variables.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de visión general, audio ni modo «thinking».

## Casos de uso

- Ensamblaje de precisión en línea de montaje: la política ejecuta la inserción de dos piezas sobre una base, tarea para la que fue entrenada, con trayectorias suaves generadas por difusión que toleran el contacto físico.
- Reproducción de referencia en investigación en imitación: sirve para replicar el pipeline de Diffusion Policy en LeRobot 0.6.1 y comparar hiperparámetros (300.000 pasos, batch 32, LR 1e-4) sobre el mismo dataset.
- Base para fine-tuning con datos propios: al estar en formato LeRobot y safetensors, se puede reentrenar con `lerobot-train` sobre un dataset propio del mismo tipo de robot y cámaras.
- Evaluación de robustez visuomotora: útil para estudiar cómo afectan cambios de iluminación, posición de objetos o distracciones a una política de difusión entrenada con solo 220 episodios.
- Docencia y formación en robótica de manipulación: ejemplo completo y reproducible de aprendizaje por imitación con observaciones multimodales y salida de acciones continuas.
- Integración en bancos de pruebas de simulación a realidad: el modelo se entrenó con datos MimicGen (generados en simulación), por lo que es un candidato para estudiar la brecha sim-to-real en ensamblaje.
- Prototipado de controladores de bajo coste computacional: con 278 M de parámetros y 1,1 GB de pesos, se puede desplegar en una estación de trabajo con una sola GPU consumer para pruebas de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», sin tabla de ensayos, éxitos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 M de parámetros en FP32 los pesos ocupan aproximadamente 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs con 8 GB o más, sumando el coste de los codificadores visuales y del proceso de difusión.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con soporte CUDA y al menos 8 GB de VRAM es suficiente (RTX 3060/4060 en adelante). Para entrenamiento con batch 32 y dos cámaras a 256×256 se recomienda 16 GB o más (RTX 4080/4090, A100, H100).
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) con backend PyTorch/CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 20 FPS, lo que marca el ritmo de inferencia esperado, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (diffusion, ensamblaje 3 piezas) | Diffusion Policy, LeRobot | 278.014.919 | Estado 9-D + 2 imágenes 256×256; acción 7-D | apache-2.0 | Hugging Face, 0 descargas |
| Diffusion Policy original (paper 2303.04137) | Diffusion Policy, referencia académica | no disponible | Configurable por tarea | no disponible | Paper y código de referencia |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni ensayos en robot real, por lo que se desconoce su fiabilidad efectiva.
- Tarea única y muy restringida: solo realiza el ensamblaje de tres piezas descrito; no generaliza a otras tareas ni objetos.
- Entrenada con datos MimicGen (simulación): es previsible una brecha sim-to-real no cuantificada.
- Requiere correspondencia exacta de observaciones: los nombres de cámara (`agentview`, `robot0_eye_in_hand`), las resoluciones 256×256 y la forma del estado (9,) deben coincidir con el entorno de despliegue.
- Sin datos de sesgos: no se documentan sesgos, pero al ser un modelo de control no lingüístico el riesgo relevante es de fallo físico en la manipulación, no de sesgo social.
- Riesgo de alucinación no aplicable en el sentido de los LLM; el riesgo equivalente es generar trayectorias inválidas o inseguras fuera de la distribución de entrenamiento.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero «likes»: artefacto experimental sin validación por la comunidad.
- Sin información sobre cuantizaciones ni despliegue en hardware de borde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_ID_q2_164926
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
