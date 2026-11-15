# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop208_ID_q4_164926

## Resumen

Este repositorio contiene una política de imitación basada en Diffusion Policy, entrenada con la librería LeRobot de Hugging Face para una tarea concreta de ensamblaje robótico: insertar dos piezas sobre una base. El modelo no es un LLM ni un modelo de lenguaje: es un controlador visuomotor que recibe el estado del robot (9 dimensiones) y dos imágenes de cámara de 256x256 píxeles, y produce una acción de 7 dimensiones. Está pensado para ejecutarse sobre un robot tipo `panda` (el nombre del repo menciona UR5e, pero la model card declara `panda` como robot type).

La relevancia es acotada: se trata de un artefacto de investigación reproducible, no de un modelo general. Su interés está en que ejemplifica el flujo completo de LeRobot (grabación de dataset, entrenamiento de política, publicación en el Hub y rollout), con un dataset MimicGen de 220 episodios y 73.864 frames a 20 FPS. La tarea es de manipulación con contacto ("contact-rich manipulation"), precisamente el escenario donde Diffusion Policy reporta ventajas frente a políticas deterministas.

El modelo tiene 278.014.859 parámetros en formato safetensors (1,1 GB de repo), licencia Apache 2.0 y fue creado en noviembre de 2026. No incluye resultados de evaluación en la información disponible, lo que limita cualquier juicio sobre su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), implementado en LeRobot 0.6.1 |
| Parametros totales | 278.014.859 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por el horizonte de predicción de acciones, valor no disponible) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la instrucción de tarea se pasa como texto fijo al rollout) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `panda` (según model card) |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state`, shape (9,) |
| Salida de acción | `action`, shape (7,) |
| Resolución de imagen | 256x256, 3 canales |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image256` (220 episodios, 73.864 frames, 20 FPS) |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador | Adam, learning rate 1e-4 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un proceso generativo: en lugar de predecir una única acción de forma determinista, el modelo aprende a denoizar trayectorias de acción completas, lo que produce movimientos suaves y multimodales. La arquitectura concreta (backbone visual, número de pasos de difusión, horizonte de predicción y de observación) no está detallada en la model card; los hiperparámetros del nombre del repo (`BS_32`, `H_8`, `crop208`) sugieren batch size 32, horizonte 8 y un recorte de imagen a 208 píxeles, pero esto es una inferencia a partir del identificador y no un dato confirmado.

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, con Adam a learning rate 1e-4 y semilla 1000, sobre el dataset MimicGen de ensamblaje de tres piezas. No se indica número de tokens (no aplica), composición del dataset más allá de los episodios y frames, ni si hubo aumento de datos, RLHF/DPO (no aplica en imitación) o técnicas de regularización. Tampoco se documenta la composición de las cámaras ni la variabilidad de posiciones de los objetos en el dataset.

## Capacidades

- Control visuomotor de manipulación robótica: genera trayectorias de acción de 7 dimensiones (típicamente pose del efector final más pinza) a partir de estado y dos vistas de cámara.
- Manipulación con contacto: la formulación por difusión está diseñada para tareas de ensamblaje e inserción, como la tarea de tres piezas de este repo.
- Política multimodal: al modelar la distribución de acciones, puede representar múltiples modos de ejecución válidos para una misma observación.
- Entrada multisensorial limitada: estado propioceptivo de 9 dimensiones más dos imágenes RGB de 256x256.
- Ejecución en bucle cerrado: el rollout de LeRobot reinyecta observaciones en cada paso de control.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, visión general, audio ni generación de texto. No es un modelo de lenguaje.

## Casos de uso

- Ensamblaje de precisión en línea de producción: la política ejecuta la inserción de dos piezas sobre una base, tarea para la que fue entrenada; es adecuada porque Diffusion Policy está pensada para contacto rico y secuencias de inserción.
- Investigación en imitación robótica: sirve como referencia reproducible del pipeline LeRobot (dataset MimicGen, entrenamiento con `lerobot-train`, rollout con `lerobot-rollout`) para comparar variantes de Diffusion Policy.
- Benchmark de manipulación con contacto: al estar entrenada sobre un dataset MimicGen concreto, permite medir tasas de éxito en una tarea estandarizada y comparar con otras políticas publicadas.
- Prototipado de sistemas de control visuomotor: integrable en un robot `panda` con dos cámaras (vista externa y ojo en la mano) para validar hardware, calibración y latencia antes de escalar a tareas más complejas.
- Generación de datos sintéticos y aumento de dataset: el rollout de la política puede usarse para producir episodios adicionales que alimenten entrenamientos posteriores o análisis de fallos.
- Docencia y formación en robótica de imitación: ejemplo completo y de tamaño moderado (278 M de parámetros, 1,1 GB) para demostrar el ciclo datos-entrenamiento-despliegue sin infraestructura pesada.
- Evaluación de robustez ante cambios de iluminación, posición de objetos o distracciones: la política puede testearse sistemáticamente en esas condiciones, aunque no se han publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 278 M de parámetros en fp32, los pesos ocupan aproximadamente 1,1 GB; en fp16, unos 0,56 GB, a lo que hay que sumar activaciones y buffers de las dos imágenes de 256x256.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia en fp32; una RTX 3060/4060 o superior es un punto de partida razonable, aunque no está confirmado.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo, pero no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 20 FPS según el dataset, pero el rendimiento real de inferencia no se ha publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Diffusion Policy, LeRobot) | Política de difusión visuomotora | 278 M | no disponible (H_8 en el nombre del repo, sin confirmar) | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas LeRobot del Hub (p. ej. ACT, TDMPC) | Políticas de imitación / RL | variable | variable | variable | Hugging Face |
| Diffusion Policy original (Cheng et al., 2023) | Política de difusión de referencia | no disponible | no disponible | no disponible | Paper y código |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable en producción.
- Especialización extrema: entrenada para una única tarea ("Insert the first piece into the base, then insert the second piece on top of it") y un único tipo de robot; no generaliza a otras tareas sin reentrenamiento.
- Ambigüedad de robot: el nombre del repo menciona `UR5e`, pero la model card declara `panda`; conviene verificar la correspondencia antes de desplegar.
- Dependencia de calibración: el rollout exige que los nombres e índices de cámara coincidan con las claves de observación (`agentview`, `robot0_eye_in_hand`) y que el puerto del robot sea correcto; un desajuste invalida la política.
- Riesgo de sobreajuste al dataset: 220 episodios y 73.864 frames son un volumen modesto; la variabilidad de posiciones, iluminación y distracciones no está documentada.
- Sesgos: no se documentan sesgos específicos; en robótica, los sesgos provienen de la distribución del dataset (posiciones, objetos, condiciones de cámara) y no se han analizado.
- Alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones incoherentes o inseguras fuera de la distribución de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar la seguridad física del despliegue.
- Idiomas: no aplica; la instrucción de tarea se pasa como texto fijo y no hay interfaz multilingüe.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop208_ID_q4_164926
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
