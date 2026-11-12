# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_ID_q1_164926

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_ID_q1_164926` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy (arXiv:2303.04137) y publicada mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones (estado articular de 9 dimensiones y dos cámaras RGB de 256x256) a acciones de 7 dimensiones para un brazo robótico tipo `panda` (Franka Emika Panda / UR5e en el entorno de simulación MimicGen). El modelo trata el control como un proceso generativo de difusión, produciendo trayectorias de acción multimodales y suaves, lo que resulta especialmente útil en tareas de manipulación con contacto rico como el ensamblaje.

El modelo tiene 278.014.919 parámetros (dato real del archivo safetensors) y un tamaño de repositorio de 1,1 GB. Fue entrenado durante 300.000 pasos con batch size 32, optimizador Adam y learning rate 1e-4 sobre un dataset de 220 episodios y 73.864 frames a 20 FPS (MimicGen, tarea de ensamblaje de tres piezas). Es relevante ahora porque ejemplifica el flujo actual de imitación robótica reproducible en código abierto: entrenamiento con LeRobot, publicación en el Hub y despliegue con un único comando `lerobot-rollout`.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados, por lo que debe considerarse un checkpoint experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor; red de predicción de ruido sobre acciones) |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 2 cámaras 256x256 + estado de 9 dims, horizonte de predicción H=8 según el nombre del checkpoint) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la instrucción de tarea es una cadena de texto fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura sigue Diffusion Policy: un proceso de difusión condicionado por observaciones (estado de 9 dimensiones y dos imágenes RGB de 3x256x256, `agentview` y `robot0_eye_in_hand`) que genera secuencias de acciones de 7 dimensiones. El nombre del checkpoint indica un horizonte de predicción H=8 y batch size 32. La formulación como difusión permite representar distribuciones multimodales de acciones, lo que mitiga el problema de promediado en escenarios con múltiples soluciones válidas y produce trayectorias suaves, ventajosas en manipulación con contacto.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image256`: 220 episodios, 73.864 frames a 20 FPS, tarea "Insert the first piece into the base, then insert the second piece on top of it". Configuración: 300.000 pasos, batch size 32, optimizador Adam, learning rate 1e-4, semilla 1000. No se documenta en la información disponible el número de tokens ni composición de datos más allá del dataset citado, ni si hubo etapas de RLHF/DPO (no aplica en este paradigma de imitación).

## Capacidades

- Control visuomotor de manipulación robótica: genera acciones de 7 dimensiones a partir de estado articular e imágenes.
- Política de imitación entrenada específicamente para ensamblaje de tres piezas (inserción secuencial).
- Procesamiento de dos vistas de cámara simultáneas (`agentview` y `robot0_eye_in_hand`).
- Generación de trayectorias multimodales mediante difusión, adecuada para tareas con contacto.
- Integración con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible en el sentido de LLM; el modelo ejecuta una política de control de un solo paso de decisión por inferencia.
- Capacidades multilingües: no aplica.
- Capacidades especiales: ninguna documentada más allá del paradigma de difusión.

## Casos de uso

- Ensamblaje de precisión en línea de producción: el modelo ejecuta la inserción secuencial de dos piezas sobre una base, tarea para la que fue entrenado con 220 demostraciones; adecuado para validar pipelines de ensamblaje con robots tipo Panda.
- Investigación en imitación robótica: sirve como checkpoint de referencia para comparar variantes de Diffusion Policy (horizontes, batch size, resolución de imagen) sobre el mismo dataset MimicGen.
- Reproducción de experimentos: al estar publicado con configuración de entrenamiento completa (pasos, LR, semilla), permite replicar el entrenamiento con `lerobot-train` y contrastar resultados.
- Benchmark de manipulación con contacto: la naturaleza generativa de la difusión lo hace útil para estudiar el comportamiento en tareas de inserción donde el contacto es crítico.
- Base para fine-tuning en dominios similares: puede adaptarse a otras tareas de ensamblaje con datasets propios mediante el flujo de LeRobot.
- Docencia y formación en robótica de aprendizaje: ejemplo end-to-end de grabación de datos, entrenamiento y despliegue con comandos `lerobot-*`.
- Evaluación de infraestructura de despliegue: útil para medir latencia y throughput de políticas de difusión en hardware concreto antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 M de parámetros en precisión de entrenamiento (fp32) el peso ronda 1,1 GB, y en fp16 aproximadamente 0,56 GB, más overhead de activaciones de las dos cámaras 256x256.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer moderna (RTX 3060 12 GB o superior) debería ser suficiente para inferencia.
- ¿Cabe en consumer GPU? Sí, por tamaño de parámetros; no hay confirmación oficial del autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (diffusion, MimicGen three_piece_assembly) | 278 M | 2 cámaras 256x256 + estado 9 dims | Ensamblaje de tres piezas | apache-2.0 | Hugging Face (0 descargas) |
| Otras políticas LeRobot Diffusion Policy | no disponible | no disponible | Manipulación diversa | generalmente apache-2.0 | Hugging Face |
| ACT (Action Chunking Transformer, LeRobot) | no disponible | no disponible | Imitación robótica | apache-2.0 (LeRobot) | Hugging Face / GitHub |
| π0 / π0-fast (Physical Intelligence) | no disponible en la información proporcionada | no disponible | Control robótico generalista | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo está entrenado en un único dataset y una única tarea, por lo que su comportamiento fuera de esa distribución es impredecible.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero la política puede generar acciones no válidas ante observaciones fuera de distribución (nuevas posiciones de objetos, iluminación, distractores).
- Limitaciones de contexto o idioma: no aplica idioma; la instrucción de tarea es una cadena fija y el modelo no generaliza a otras tareas sin reentrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluación de robustez.
- Caveats para producción: cero descargas y cero likes, sin evaluación publicada, sin vídeo de demostración, sin tasas de éxito; no debe desplegarse en un entorno real sin validación previa. El checkpoint se entrenó en simulación (MimicGen) y el nombre menciona UR5e mientras la model card indica robot type `panda`; conviene verificar la correspondencia hardware-software antes de usarlo.
- Fecha de creación registrada en 2026-11-12, posterior a la fecha típica de consulta; verificar la vigencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_ID_q1_164926
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
