# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_ID_165312

## Resumen

Se trata de una política de imitación robótica basada en Diffusion Policy, publicada en Hugging Face por el usuario `castanetnicolas` y entrenada con el framework LeRobot. El modelo resuelve una tarea de manipulación concreta y con contacto físico intenso: insertar dos piezas en una base (ensamblaje de tres piezas). No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado de las articulaciones e imágenes de dos cámaras) a acciones de 7 dimensiones.

La arquitectura sigue el planteamiento de Diffusion Policy (Chi et al., 2023, arXiv:2303.04137), que formula el control visuomotor como un proceso generativo de difusión y produce trayectorias de acción suaves y multimodales. El checkpoint contiene 278.014.919 parámetros (dato real de los pesos safetensors) y el repositorio ocupa 1,1 GB. Está entrenado sobre 220 episodios y 73.864 fotogramas a 20 FPS del dataset `mimicgen_three_piece_assembly_d1_image256`.

Su relevancia es acotada pero práctica: sirve como referencia reproducible de entrenamiento de Diffusion Policy con LeRobot 0.6.1 sobre un robot Panda, con dos cámaras de 256×256, y como punto de partida para quien quiera replicar o adaptar el pipeline de imitación a tareas de ensamblaje. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo por difusión) sobre LeRobot |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de predicción de acciones no especificado en la model card) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `panda` |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand` |
| Entrada `observation.state` | STATE, forma `(9,)` |
| Entrada `observation.images.agentview` | VISUAL, forma `(3, 256, 256)` |
| Entrada `observation.images.robot0_eye_in_hand` | VISUAL, forma `(3, 256, 256)` |
| Salida `action` | ACTION, forma `(7,)` |
| Tarea | "Insert the first piece into the base, then insert the second piece on top of it." |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image256` (220 episodios, 73.864 fotogramas, 20 FPS) |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador | Adam |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repo | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo: en lugar de regresar directamente una acción, aprende a denoizar una trayectoria de acciones condicionada por las observaciones (estado de 9 dimensiones y dos imágenes RGB de 256×256). Esto permite modelar distribuciones multimodales de acciones y genera movimientos suaves, lo que resulta adecuado para tareas de manipulación con contacto rico como el ensamblaje de piezas. La model card no detalla el número de pasos de difusión, el backbone visual exacto ni el horizonte de predicción de acciones; esos datos figuran como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, con batch size 32, optimizador Adam, learning rate 1e-4 y semilla 1000, sobre el dataset MimicGen de ensamblaje de tres piezas (220 episodios, 73.864 fotogramas, 20 FPS, imágenes a 256 px). No se documenta en la información disponible el uso de RLHF, DPO ni ningún ajuste posterior por refuerzo; se trata de aprendizaje por imitación supervisado. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de política.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para un robot Panda a partir de estado articular e imágenes de dos cámaras.
- Manipulación con contacto rico: inserción secuencial de dos piezas en una base.
- Política visuomotora condicionada por lenguaje de tarea (el prompt de tarea se pasa en el rollout), aunque no es un modelo generativo de texto.
- Entrada multimodal: estado propioceptivo `(9,)` más dos flujos visuales `(3, 256, 256)`.
- Ejecución en tiempo real mediante `lerobot-rollout` con estrategia base.
- Reentrenamiento y ajuste con `lerobot-train` sobre nuevos datasets LeRobot.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es un controlador de política, no un LLM.
- Capacidades multilingües: no aplica; no procesa ni genera lenguaje natural más allá del condicionamiento por texto de tarea.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Ensamblaje automatizado de precisión: el modelo ejecuta la inserción secuencial de dos piezas en una base sobre un robot Panda, aprovechando la generación de trayectorias suaves de Diffusion Policy para tareas con contacto físico y tolerancias ajustadas.
- Banco de pruebas para investigación en imitación: sirve como referencia reproducible (LeRobot 0.6.1, semilla y hiperparámetros documentados) para comparar variantes de Diffusion Policy o de representaciones visuales en tareas de ensamblaje.
- Generación de datos sintéticos y aumento de dataset: al estar entrenado sobre MimicGen, puede emplearse para estudiar la transferencia de políticas entrenadas con datos generados a entornos reales o simulados.
- Prototipado de pipelines de control visuomotor: integrable en flujos `lerobot-rollout` con dos cámaras y robot Panda para validar la cadena completa de percepción-acción antes de escalar a otras tareas.
- Formación y docencia en robótica de manipulación: ejemplo completo y ligero (1,1 GB) para ilustrar el ciclo registro de datos, entrenamiento y despliegue con LeRobot.
- Base para ajuste fino en tareas de ensamblaje similares: reentrenable con `lerobot-train` sobre datasets propios de inserción de piezas, reutilizando la arquitectura y los hiperparámetros publicados.
- Evaluación de robustez ante cambios de iluminación, posición de objetos o cámara: al estar documentadas las entradas exactas, permite medir la degradación de la política en condiciones distintas a las de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 millones de parámetros y pesos en fp32 el modelo ocupa aproximadamente 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (estimación a partir del tamaño del repo, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en fp32, y aún menos en fp16.
- GPU de consumo: sí cabe en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 20 FPS según la tasa del dataset de entrenamiento, pero no se publican mediciones de latencia de inferencia ni de éxito en robot real.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Salida | Licencia | Evaluación publicada |
|---|---|---|---|---|---|---|
| Este modelo (`castanetnicolas/diffusion_...`) | Diffusion Policy (LeRobot) | 278.014.919 | estado `(9,)` + 2 imágenes `(3,256,256)` | acción `(7,)` | Apache 2.0 | No |
| Otras políticas Diffusion Policy en LeRobot Hub | Diffusion Policy (LeRobot) | variable según checkpoint | variable | variable | habitualmente Apache 2.0 | variable; no disponible para comparación directa |
| Políticas ACT en LeRobot Hub | Action Chunking Transformer | variable según checkpoint | variable | variable | habitualmente Apache 2.0 | variable; no disponible para comparación directa |
| Políticas basadas en VLA (p. ej. RT-2, OpenVLA) | Modelos visión-lenguaje-acción | miles de millones | imágenes + instrucción textual | acciones | variable | no comparable directamente por escala y tarea |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para establecer una comparación cuantitativa con alternativas de la misma categoría; la comparación anterior es estructural.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que no puede garantizarse su funcionamiento fuera del entorno de entrenamiento.
- Especialización extrema: la política está entrenada para una única tarea ("Insert the first piece into the base, then insert the second piece on top of it.") y un único tipo de robot (`panda`); no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con `agentview` y `robot0_eye_in_hand`; cambios de montaje, resolución o calibración pueden degradar el comportamiento.
- Dataset limitado: 220 episodios y 73.864 fotogramas, procedentes de MimicGen (datos generados), lo que puede introducir una brecha entre simulación y realidad (sim-to-real gap).
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución; al ser un controlador, el riesgo principal es la ejecución de acciones inseguras ante observaciones no vistas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía por parte del autor.
- Sin cuantizaciones publicadas ni formatos alternativos (GGUF, ONNX); el despliegue queda ligado al ecosistema LeRobot.
- Repositorio sin descargas ni likes y creado en 2026-11-12, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_ID_165312
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Registro de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
