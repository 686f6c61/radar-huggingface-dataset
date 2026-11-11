# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_ID_q1_164493

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_ID_q1_164493` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y publicada mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política de imitación para robótica de manipulación que transforma observaciones (estado del robot y dos cámaras de 84x84 píxeles) en secuencias de acciones de 7 dimensiones. El autor es el usuario `castanetnicolas`, y el modelo está pensado para la tarea concreta de ensamblaje de tres piezas ("Insert the first piece into the base, then insert the second piece on top of it").

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un solo autor, con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados y entrenado sobre un dataset derivado de MimicGen. Su interés técnico radica en que ejemplifica el flujo de trabajo completo de LeRobot (entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) aplicado a una tarea de manipulación con contacto rico, donde Diffusion Policy suele superar a las políticas deterministas tipo LSTM o ACT.

El modelo tiene 278.014.699 parámetros (dato real del fichero safetensors), un repositorio de 1,1 GB y licencia Apache 2.0. No dispone de ventana de contexto ni de capacidades lingüísticas: su "entrada" es un tensor de estado de 9 dimensiones más dos imágenes RGB de 3x84x84, y su "salida" es un vector de acción de 7 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor, condicionada por observaciones) |
| Parametros totales | 278.014.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; horizonte de predicción de acciones H=8 según el nombre del repo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 1,1 GB) |

## Arquitectura y entrenamiento

Diffusion Policy (Chi et al., 2023, arXiv:2303.04137) formula el control visuomotor como un proceso generativo: en lugar de predecir una acción de forma determinista, aprende la distribución condicional de secuencias de acciones mediante un modelo de difusión (típicamente una U-Net 1D sobre el eje temporal) que se entrena con pérdida de denoising. En inferencia se parte de ruido gaussiano y se aplican pasos de muestreo iterativo condicionados por las observaciones, lo que produce trayectorias multimodales y suaves, ventajosas en tareas de inserción con contacto. La observación se compone de un vector de estado de 9 dimensiones y dos cámaras (`agentview` y `robot0_eye_in_hand`) a resolución 84x84; la salida es una acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image84`: 200 episodios, 67.101 frames a 20 FPS, generados a partir de MimicGen para la tarea de ensamblaje de tres piezas. La configuración reportada es de 200.000 pasos, batch size 32, optimizador Adam, learning rate 1e-4 y semilla 1000. No se documenta el número de tokens ni composición de datos (no aplica), ni si hubo fases de RLHF/DPO (no aplica a imitación). El nombre del repositorio sugiere un horizonte de predicción H=8 y batch size 32, aunque el autor no detalla el número de pasos de difusión ni la arquitectura exacta del denoiser.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para manipulación robótica con contacto rico (inserciones, ensamblaje).
- Control visuomotor a partir de dos cámaras RGB de baja resolución (84x84) más estado proprioceptivo de 9 dimensiones.
- Ejecución de la tarea específica "Insert the first piece into the base, then insert the second piece on top of it" sobre un robot tipo `panda` (según model card) y, por el nombre del repo, sobre UR5e.
- Despliegue en tiempo real mediante `lerobot-rollout` con `--strategy.type=base` y duración configurable.
- Reentrenamiento o fine-tuning con `lerobot-train` sobre datasets en formato LeRobot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, multilingüismo, visión general, audio ni modo thinking: es una política de acción, no un modelo generativo de texto.

## Casos de uso

- Ensamblaje de precisión en línea de montaje: la política ejecuta la inserción secuencial de dos piezas sobre una base, tarea representativa de operaciones de ajuste con tolerancias estrechas donde la generación de trayectorias suaves de Diffusion Policy reduce picos de fuerza.
- Investigación en imitación robótica: sirve como referencia reproducible del pipeline LeRobot (dataset MimicGen → entrenamiento → rollout) para comparar políticas de difusión frente a ACT o LSTM en el mismo benchmark.
- Generación de datos sintéticos y aumento de dataset: al estar entrenada sobre MimicGen, puede emplearse para estudiar la transferencia sim-a-real y la sensibilidad a variaciones de posición de objetos.
- Prototipado rápido de políticas en laboratorio: con 1,1 GB de pesos y dos cámaras de 84x84, el despliegue cabe en una estación de trabajo con una sola GPU consumer, lo que facilita ciclos de iteración cortos.
- Benchmark interno de robustez: al no haber evaluación publicada, el equipo puede usarla como línea base para medir tasas de éxito propias bajo condiciones controladas (posiciones, iluminación, distractores).
- Formación y docencia: ejemplo didáctico de política de difusión condicionada por observaciones, útil para explicar denoising aplicado a acciones y el formato de datasets LeRobot.
- Automatización de tareas de pick-and-place con contacto: la salida de 7 dimensiones (posición + orientación + pinza) permite integrarla en controladores de robots de 6-7 ejes tipo panda/UR5e.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 M parámetros en precisión FP32 los pesos ocupan aproximadamente 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM, aunque el consumo real depende del número de pasos de difusión y del tamaño de batch.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia; para reentrenar con batch size 32 y 200.000 pasos se recomienda una GPU con al menos 12-16 GB (RTX 4080/4090, A100, H100) para acortar tiempos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más para inferencia; el entrenamiento completo requiere más memoria y tiempo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 20 FPS según el dataset de entrenamiento, lo que fija un objetivo de 50 ms por paso de control, pero el autor no reporta latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Salida | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|---|
| Este modelo (diffusion, three_piece_assembly) | Diffusion Policy | 278 M | estado (9,) + 2 imagenes 84x84 | accion (7,) | Apache 2.0 | No |
| Diffusion Policy original (Chi et al., 2023) | Diffusion Policy | no disponible en la informacion | observaciones visuales y de estado | acciones | no disponible en la informacion | Si, en paper |
| ACT (Action Chunking Transformer, LeRobot) | Transformer de imitacion | no disponible en la informacion | imagenes + estado | chunk de acciones | Apache 2.0 (LeRobot) | Si, en paper original |
| Politicas LSTM/BC en LeRobot | Imitacion determinista | no disponible en la informacion | imagenes + estado | accion | Apache 2.0 (LeRobot) | Variable |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto; la comparación se limita a categoría, modalidad y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, ni en simulación ni en robot real, por lo que no puede afirmarse que la política funcione fuera del dataset de entrenamiento.
- Especialización extrema: entrenada para una única tarea de ensamblaje de tres piezas; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del dataset MimicGen: los 200 episodios y 67.101 frames provienen de generación automática, con posible brecha sim-a-real no cuantificada.
- Ambigüedad de robot: la model card declara `panda` mientras el nombre del repositorio menciona UR5e; debe verificarse la morfología y el espacio de acciones antes de desplegar.
- Resolución de cámara muy baja (84x84): puede perder detalles finos relevantes para inserciones precisas.
- Riesgo de sobreajuste al entorno de entrenamiento: iluminación, posiciones de objeto y calibración de cámaras deben replicarse fielmente.
- Sin soporte lingüístico ni de razonamiento: no debe emplearse como modelo de texto, agentes o tool calling.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de validación hace desaconsejable su uso en producción sin una evaluación propia exhaustiva.
- Cero descargas y cero likes: no hay evidencia de uso por terceros ni de reproducibilidad independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_ID_q1_164493
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
