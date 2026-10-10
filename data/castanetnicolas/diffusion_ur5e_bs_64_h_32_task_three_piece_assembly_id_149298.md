# castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_three_piece_assembly_ID_149298

## Resumen

La ficha describe `castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_three_piece_assembly_ID_149298`, una política de imitación visuomotora entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un *policy* de robótica que implementa Diffusion Policy (Chi et al., arXiv:2303.04137), un método que trata el control visuomotor como un proceso generativo de difusión y produce trayectorias de acción suaves de múltiples pasos, especialmente indicado para tareas de manipulación con contacto rico (inserciones, ensamblajes). El autor es el usuario de Hugging Face `castanetnicolas`, que publica una familia de políticas con la misma receta y distintos hiperparámetros y tareas.

El modelo consume observaciones de estado propioceptivo de 9 dimensiones y dos cámaras RGB a 84x84 píxeles (`agentview` y `robot0_eye_in_hand`), y emite un vector de acción de 7 dimensiones (posición y orientación del efector final más apertura del gripper). Tiene 278.014.699 parámetros y un repositorio de 1,1 GB, coherente con un checkpoint en fp32. La tarea concreta aprendida es "Insert the first piece into the base, then insert the second piece on top of it" sobre un dataset de 200 episodios y 67.101 fotogramas grabados a 20 FPS.

Su relevancia es acotada pero clara: sirve como referencia reproducible de Diffusion Policy dentro del ecosistema LeRobot y como punto de partida para *fine-tuning* o para experimentos de sim2real en ensamblaje de precisión. Hay que tener en cuenta que el repositorio no incluye resultados de evaluación, no tiene descargas ni *likes* y presenta una discrepancia entre el nombre (`UR5e`) y el tipo de robot declarado en la model card (`panda`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: DDPM condicional sobre secuencias de acción, con codificadores visuales convolucionales y U-Net temporal 1D (según arXiv:2303.04137) |
| Parametros totales | 278.014.699 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Ventana de observación y horizonte de predicción no especificados en la model card; el nombre del repositorio sugiere horizonte de 32 pasos de acción y batch de 64 |
| Tipos de cuantizacion | No disponible. El repositorio solo publica un checkpoint en safetensors (~1,1 GB, consistente con fp32); no hay variantes cuantizadas |
| Idiomas soportados | No aplica. La política no consume lenguaje; la instrucción de tarea es un metadato fijo de entrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones de entrada y salida declaradas por el autor:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (9,) |
| `observation.images.agentview` | VISUAL | (3, 84, 84) |
| `observation.images.robot0_eye_in_hand` | VISUAL | (3, 84, 84) |
| `action` | ACTION | (7,) |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy: en lugar de regresar directamente una acción, aprende a desruidar una secuencia completa de acciones condicionada por las observaciones. En la implementación de LeRobot esto se materializa en codificadores visuales convolucionales (típicamente ResNet con *spatial softmax*) para cada cámara, una proyección MLP del estado propioceptivo y una U-Net temporal 1D que aplica condicionamiento FiLM con el vector de observación. El muestreo es de tipo DDPM/DDIM, y en ejecución se emplea control de horizonte recedente: se predice un bloque de acciones y se ejecuta un subconjunto antes de volver a planificar, lo que da trayectorias más suaves y estables que el comportamiento reactivo paso a paso.

El entrenamiento se hizo con LeRobot 0.6.1 sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image84`: 200 episodios, 67.101 fotogramas a 20 FPS, con el nombre del dataset indicando generación tipo MimicGen a partir de una demostración fuente y observaciones a 84x84. La configuración declarada es de 140.000 pasos de entrenamiento, batch size 64, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. La model card no detalla el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; en el caso de políticas de imitación estos términos no aplican del mismo modo, ya que el objetivo es de *behavior cloning* sobre demostraciones. Tampoco se documenta ninguna innovación técnica adicional más allá del propio Diffusion Policy.

## Capacidades

- Generación de trayectorias de acción visuomotoras de 7 dimensiones (efector final y gripper) a partir de dos vistas RGB y estado propioceptivo de 9 dimensiones.
- Manipulación con contacto rico: el método de difusión está diseñado específicamente para inserciones y ensamblajes, donde las políticas regresivas suelen fallar.
- Ejecución de una tarea concreta de ensamblaje de tres piezas ("Insert the first piece into the base, then insert the second piece on top of it").
- Control a la frecuencia de operación de LeRobot (entrenado a 20 FPS), compatible con bucles de control de tiempo real en `lerobot-rollout`.
- No hay soporte de *tool calling* ni de *function calling*: no es un modelo de lenguaje ni un agente de texto.
- No hay capacidades multilingües, de visión general (VQA, OCR, descripción de imágenes) ni de audio.
- No hay modo de razonamiento (`thinking`), ni generación de código, ni matemáticas.
- Compatible con el ecosistema LeRobot para *rollout* en robot real y para *fine-tuning* sobre nuevos datasets con `lerobot-train`.

## Casos de uso

- Ensamblaje de precisión en línea de montaje: la política está entrenada exactamente para insertar dos piezas sucesivamente en una base, un escenario de *peg-in-hole* donde el control generativo de difusión aporta trayectorias suaves y tolerantes a la incertidumbre.
- Investigación en sim2real: el dataset de origen tiene nomenclatura MimicGen y observaciones a 84x84, típicas de simulación; la política sirve para estudiar la transferencia de simulación a un robot real y medir la degradación de éxito.
- *Baseline* reproducible de Diffusion Policy: al estar publicada con configuración completa (pasos, batch, optimizador, semilla, versión de LeRobot), permite comparaciones controladas frente a ACT u otras políticas de imitación en el mismo banco de pruebas.
- Punto de partida para *fine-tuning*: con `lerobot-train --policy.type=diffusion` se puede reentrenar sobre datos propios de otra tarea o de otro robot, aprovechando los 140.000 pasos ya realizados como inicialización.
- Generación de datos y aumentación de demostraciones: la política entrenada puede desplegarse para producir trayectorias adicionales que amplíen datasets pequeños de ensamblaje antes de reentrenar.
- Evaluación de hardware de manipulación: al requerir únicamente dos cámaras RGB de baja resolución y un robot de 7 grados de libertad, es útil para validar cadenas de percepción, calibración y *timing* de control en laboratorio.
- Automatización de tareas de montaje cooperativo en investigación robótica: con LeRobot y ROS se puede integrar en una celda con dos brazos, usando esta política como controlador de la fase de inserción de una de las piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente: "No evaluation results have been provided for this policy yet". El repositorio no incluye tablas de tasa de éxito, número de ensayos ni comparaciones con otras políticas. Tampoco hay resultados de simulación publicados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 1,1 GB; sumando activaciones de las dos torres visuales y de la U-Net temporal, un presupuesto de 2 a 4 GB de VRAM es suficiente. Dato no confirmado por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 es más que suficiente para inferencia en tiempo real; en entornos de laboratorio también cabe en A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más de VRAM, dado el tamaño de 278 M de parámetros.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) es la vía documentada en la model card. Al no ser un modelo de lenguaje, no aplican vLLM, llama.cpp, Ollama ni TGI; el despliegue es PyTorch más el *stack* de LeRobot sobre ROS o controladores directos del robot.
- Latencia y throughput estimados: no disponibles. La referencia operativa es la frecuencia de entrenamiento de 20 FPS del dataset y la frecuencia de las cámaras configuradas en el ejemplo de la model card (640x480 a 30 FPS).
- Requisitos de entrenamiento: no disponibles en detalle. La configuración declarada de 140.000 pasos con batch 64 y Adam es asumible en una única GPU moderna, pero el autor no indica el hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / salida | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `diffusion_UR5e_BS_64_H_32_TASK_three_piece_assembly_ID_149298` (este) | 278.014.699 | Ensamblaje de tres piezas, acción (7,) | 200 episodios, 67.101 fotogramas, 20 FPS | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `castanetnicolas/diffusion_UR5e_BS_32_H_64` | No disponible | Política de difusión, mismo autor y familia | No disponible | No disponible en la información recogida | Hugging Face |
| `castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_nut_assembly_square` | No disponible | Ensamblaje de tuerca cuadrada | No disponible | No disponible en la información recogida | Hugging Face |
| RDT-1B | 1.000 M (1B) | Diffusion Transformer de imitación, predice hasta 64 acciones | Preentrenado con más de 1 M de episodios multi-robot | No disponible en la información recogida | Repositorio y README públicos en GitHub |
| ACT (Action Chunking with Transformers, familia LeRobot) | No disponible en la información recogida | Política de imitación con *action chunking* | Depende del dataset de entrenamiento | No disponible en la información recogida | Disponible a través de LeRobot |

La comparación directa con ACT y con RDT-1B es únicamente cualitativa: no hay cifras de éxito publicadas para este checkpoint, de modo que no puede afirmarse que supere o quede por debajo de ninguna alternativa. La diferencia más marcada con RDT-1B es de escala y de datos: RDT-1B parte de preentrenamiento multi-robot con más de un millón de episodios, mientras que este modelo se entrena desde cero sobre una única tarea y 200 episodios.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara explícitamente que no hay resultados de éxito en robot real ni en simulación. Cualquier uso en producción requiere una validación propia.
- Discrepancia de nomenclatura: el identificador del repositorio menciona `UR5e`, pero la model card declara `robot type: panda`. Es imprescindible verificar sobre qué plataforma se entrenó realmente antes de desplegarlo, porque la correspondencia entre observaciones, cinemática y acciones depende de ello.
- Especialización extrema: la política está entrenada para una única tarea de ensamblaje de tres piezas. No generaliza a otras tareas ni acepta instrucciones nuevas en lenguaje.
- Sin condicionamiento por lenguaje: la instrucción de tarea es un metadato fijo, no una entrada del modelo. No se puede cambiar el objetivo en tiempo de ejecución.
- Resolución de entrada muy baja (84x84 por cámara): suficiente para el entrenamiento de imitación, pero limita la percepción de detalles finos que podrían afectar a inserciones precisas.
- Brecha sim2real probable: el dataset tiene nomenclatura MimicGen y observaciones de baja resolución, típicas de entornos generados. El rendimiento en un robot físico con iluminación, fricción y posiciones distintas a las de entrenamiento no está cuantificado y puede degradarse notablemente.
- Riesgo de sobreajuste a posiciones y apariencias del dataset: con solo 200 episodios de una tarea, cambios en la posición inicial de las piezas, iluminación o elementos distractores pueden provocar fallos.
- Sesgos: no hay análisis publicado de sesgos. En robótica, el sesgo relevante es de distribución (objetos, fondos, condiciones de la cámara) y depende enteramente de los datos de entrenamiento, no documentados en detalle.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cite adecuadamente. La cita recomendada por el autor es la de LeRobot (Cadene et al., 2024) junto con el artículo de Diffusion Policy.
- Advertencias para producción: 0 descargas y 0 likes, sin *issues* ni validación de la comunidad; el repositorio es un artefacto de experimento, no un modelo mantenido. Además, la licencia Apache 2.0 no cubre posibles patentes de terceros relacionadas con el método de difusión aplicado a control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_three_piece_assembly_ID_149298
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Artículo de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Checkpoint relacionado del mismo autor: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_64
- Checkpoint relacionado del mismo autor: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_nut_assembly_square
- README de RDT-1B en GitHub (modelo comparable de difusión para robótica): https://github.com/ElementForever2022/RoboticsDiffusionTransformer_UR5e/blob/main/orig_README2.md
- Simulación ROS2 y Gazebo de ensamblaje con UR5e (referencia de contexto): https://github.com/zitongbai/UR5e_Vision_Assemble
- Dataset de demostración relacionado (three piece assembly, UR5e, 500 episodios, distinto del usado aquí): https://claru.ai/datasets/oliverhausdoerfer-demo-src-three-piece-assembly-task-d1-robot-ur5e-gripper-robotiq85gripper
