# Dongkkka/Task905-GR00T-Molmo-30k

## Resumen

Task905-GR00T-Molmo-30k es un checkpoint de políticas robóticas (vision-language-action, VLA) publicado por el usuario Dongkkka, que combina el modelo base NVIDIA GR00T N1.7-3B con un adaptador LoRA de MolmoPoint-8B para detección de puntos. Está entrenado específicamente para una única tarea del conjunto SH5: «Pick up a white sanitary pad with the right hand», sobre un robot con dos brazos de 7 grados de libertad cada uno, dos manos de 20 grados de libertad y sensores táctiles de 45 valores por mano.

El modelo resuelve el problema de generar trayectorias de acción de 40 pasos temporales a partir de observaciones multimodales (imagen de cabeza, estado articular, estado táctil y una instrucción en lenguaje natural), con un contrato de entrada y salida muy estricto definido por el processor guardado. Su relevancia es la de un artefacto de investigación reproducible: incluye el código de inferencia modificado de GR00T (necesario porque el código oficial de NVIDIA no soporta la ruta táctil ni Molmo), las estadísticas de normalización y un adaptador de detección de puntos que se aplica una sola vez por episodio.

Se trata de un modelo de nicho, no de propósito general: el autor advierte explícitamente de que el loss offline no equivale a tasa de éxito en el robot, que solo se soporta batch y horizonte de 1 (`B=1, T=1`) y que la ejecución real exige verificar el robot config, el orden de acciones y las condiciones de seguridad. El repositorio ocupa 12,6 GB y requiere además un checkpoint nativo externo de MolmoPoint-8B de unos 35 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (transformer VLA) + adaptador LoRA MolmoPoint-8B para detección de puntos; ruta táctil con `finger_mlp` (45 → 32 dimensiones) |
| Parametros totales | 3B en el backbone GR00T (según nomenclatura `GR00T-N1.7-3B`); MolmoPoint-8B se carga como modelo separado. Total combinado no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | coreano (`ko`); las instrucciones de tarea del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards) + `config.json`, `processor_config.json`, `statistics.json`, `embodiment_id.json`, `complete.json`, bundle `molmo/` |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre NVIDIA GR00T N1.7-3B, con un embodiment personalizado `new_embodiment` (SH5). La entrada combina imagen RGB de cabeza (`cam_left_head`, redimensionada directamente a 256×256, sin letterbox), estado articular de 54 dimensiones (brazo izquierdo 7 + brazo derecho 7 + mano izquierda 20 + mano derecha 20), estado táctil de 90 valores (2 manos × 5 × 9 taxeles, proyectados a 32 dimensiones mediante un `finger_mlp`) y una descripción de tarea en lenguaje natural. La salida son 40 pasos temporales de 54 acciones absolutas no EEF, agrupadas en cuatro bloques `[left_arm(7), right_arm(7), left_hand(20), right_hand(20)]`, desnormalizadas con las estadísticas guardadas.

El entrenamiento se realizó sobre el dataset Task 905 MCAP (LeRobot v2.1 a 30 Hz), con 87 episodios divididos en 78 de entrenamiento y 9 de validación, durante 30.010 pasos (se publica el checkpoint de 30.000). El adaptador MolmoPoint se entrenó a 25.000 pasos para detectar un punto de referencia sobre el primer frame de cada episodio; ese punto se usa como overlay fijo (círculo magenta opaco de radio 1 % del lado corto) en los frames posteriores. El autor subraya que el loss offline no es un indicador de tasa de éxito en el robot y que el código oficial de NVIDIA GR00T no puede leer la ruta táctil ni Molmo de este checkpoint: es obligatorio usar el archivo `Isaac-GR00T-molmo-inference-source.tar.gz` incluido.

## Capacidades

- Generación de acciones robóticas de 40 pasos a 30 Hz para una tarea de manipulación bimanual con pinza de dos dedos y sensor táctil.
- Procesamiento multimodal conjunto de imagen RGB, estado articular, estado táctil y descripción de tarea en lenguaje natural.
- Detección de puntos de referencia mediante el adaptador LoRA de MolmoPoint-8B, ejecutada una sola vez por episodio sobre el primer frame.
- Soporte de instrucciones en lenguaje natural por episodio (`annotation.human.task_description`), en formato `B=1, T=1`.
- Gestión de estado episódico mediante `policy.reset()`, `get_action(..., options={"episode_start": True})` y `policy.close()`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento general; es una política de robot de una sola tarea.
- Capacidad multilingüe limitada al coreano como idioma declarado y al inglés en las instrucciones de tarea del dataset.

## Casos de uso

- Reproducción de experimentos VLA: el repositorio incluye el código de inferencia modificado y las estadísticas exactas, lo que permite replicar el pipeline GR00T + Molmo con la misma configuración de entrenamiento.
- Investigación en manipulación bimanual con feedback táctil: el modelo consume 90 valores táctiles por paso y demuestra cómo integrar taxeles en un VLA de 3B, útil para estudiar el efecto del tacto en tareas de agarre.
- Evaluación de arquitecturas de detección de puntos para políticas robóticas: el adaptador MolmoPoint-25k sirve como referencia para comparar estrategias de grounding visual de una sola inferencia por episodio frente a detección por frame.
- Benchmark de contratos de entrada/salida en robótica: el repositorio define de forma explícita formas, órdenes y unidades (54 articulaciones, 90 taxeles, 40 pasos, 30 Hz), lo que lo convierte en un caso de estudio para validación de interfaces policy-robot.
- Base para fine-tuning en tareas de recogida con mano derecha: al estar entrenado sobre un embodiment SH5 concreto, puede servir de inicialización para tareas similares del mismo robot y mismo dataset.
- Docencia y divulgación: ejemplo completo y reproducible de un pipeline VLA con dos entornos Python separados, verificación de hashes SHA256 y gestión de checkpoints nativos externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara `model-index: []` y el autor indica explícitamente que el loss offline no representa la tasa de éxito de la tarea en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio pesa 12,6 GB en safetensors (GR00T 3B + bundle) y requiere además el checkpoint nativo MolmoPoint-8B, de unos 35 GB, cargado en un proceso separado.
- GPU recomendadas: no disponibles en la información proporcionada. El autor indica `--device cuda` y `--molmo-device cuda`, y advierte de que se necesita memoria GPU suficiente para cargar el modelo nativo de Molmo.
- ¿Cabe en GPU de consumo? No disponible. Por el tamaño combinado (3B + 8B en procesos separados) es previsible que requiera GPUs de datacenter, pero no hay confirmación en la información.
- Opciones de despliegue: servidor de inferencia propio `gr00t.eval.run_gr00t_server` con dos entornos Python separados (GR00T: Python 3.12, Torch 2.9, Transformers 4.57.3; Molmo: `requirements-molmo.txt` y commit fijado de `allenai/molmo2`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte de que la carga de Molmo y la primera detección añaden latencia adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Task905-GR00T-Molmo-30k | 3B (GR00T) + 8B (MolmoPoint) | no disponible | VLA de una tarea (SH5, recogida) | Apache 2.0 | Hugging Face, requiere checkpoint nativo externo de 35 GB |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | VLA generalista | no disponible en la información | Hugging Face (base de este checkpoint) |
| allenai/MolmoPoint-8B | 8B | no disponible | Detección de puntos / grounding visual | no disponible en la información | Hugging Face y tarball nativo de Ai2 |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de una sola tarea: entrenado exclusivamente para «Pick up a white sanitary pad with the right hand» sobre el robot SH5; no generaliza a otras instrucciones ni embodiments.
- El loss offline no equivale a tasa de éxito real en el robot; el autor lo advierte de forma explícita.
- Solo soporta `B=1, T=1`; no hay soporte por lotes ni horizontes múltiples.
- El código oficial de NVIDIA GR00T no puede cargar este checkpoint: es obligatorio usar el archivo `Isaac-GR00T-molmo-inference-source.tar.gz` incluido.
- Requiere un checkpoint nativo externo de MolmoPoint-8B (unos 35 GB) que no está en el repositorio; el `model.safetensors` de `allenai/MolmoPoint-8B` en Hugging Face no es compatible por diferencia de formato.
- Necesita dos entornos Python separados con versiones fijadas de Torch, Transformers y del código de Molmo; mezclar entornos provoca fallos de carga.
- El punto de detección se fija en el primer frame y no se actualiza aunque la escena o la cámara se muevan; no hay seguimiento ni numeración.
- Si la generación se trunca o el punto no es válido, se lanza una excepción y el episodio debe reiniciarse con `policy.reset()`.
- Antes de ejecutar en un robot real hay que verificar el robot config, el orden de acciones, las unidades físicas y las condiciones de seguridad; el autor no valida el despliegue físico.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de acciones, el riesgo se traduce en trayectorias inválidas más que en texto incorrecto.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint depende de pesos base de NVIDIA GR00T y Ai2 MolmoPoint cuyas licencias deben verificarse por separado.
- Idioma declarado coreano; las instrucciones de tarea del dataset están en inglés, lo que puede afectar a la generalización lingüística.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dongkkka/Task905-GR00T-Molmo-30k
- Modelo base GR00T: https://huggingface.co/nvidia/GR00T-N1.7-3B (revisión `2fc962b973bccdd5d8ce4f67cc63b264d6886495`)
- Modelo MolmoPoint-8B en Hugging Face: https://huggingface.co/allenai/MolmoPoint-8B
- Checkpoint nativo MolmoPoint-8B (tarball Ai2): https://storage.googleapis.com/oe-training-public/MolmoPoint-0325/MolmoPoint-8B.tar
- Código nativo de Molmo (commit fijado): https://github.com/allenai/molmo2/tree/f3cb1085fbb97c4a4d7fdcadd77cf871bf37a88a
- Dataset Task 905 MCAP: https://huggingface.co/datasets/RobotisSW/Task_000905_Pick_up_a_white_sanitary_pad_with_right_hand_MCAP (revisión `40d213313f1fc619052a424b6bdf510a5dba51a2`)
- Registro de entrenamiento en W&B: https://wandb.ai/donggunkim-kyung-hee-university/sh5-gr00t-molmo/runs/task905-molmo-87ep-b128-100k-20261109
