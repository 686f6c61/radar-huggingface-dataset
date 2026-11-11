# chomeed/first_cable_insertion_uncased_pi05_foveavla_subtask_fullrgb_boxcrop_rel_chunk30_early45f_5k

## Resumen

Este repositorio contiene un checkpoint de política robótica denominado `first_cable_insertion_uncased_pi05_foveavla_subtask_fullrgb_boxcrop_rel_chunk30_early45f_5k`, desarrollado por el usuario chomeed. Se trata de un ajuste fino del modelo base `lerobot/pi05_base` (pi0.5 de Physical Intelligence) sobre el dataset propio `chomeed/first_cable_insertion_uncased`, orientado a la tarea de inserción de cables en un módulo de control. El modelo incorpora la extensión FoveaVLA, que añade predicción de subtareas de alto nivel y mecanismos de foveación (recortes de imagen por cámara) para guiar el experto de acciones.

El modelo es un transformer multimodal visión-lenguaje-acción (VLA) con aproximadamente 4.145 millones de parámetros, entrenado con LeRobot 0.6.2 mediante el tipo de política `pi05_foveavla_subtask`. Recibe como entrada seis cámaras y un estado de 25 dimensiones, y produce un chunk de 30 acciones de 10 dimensiones relativas al estado actual.

Es relevante como ejemplo de investigación aplicada en robótica de manipulación fina: combina predicción de subtareas en lenguaje natural con atención foveada selectiva por cámara, una innovación que reduce el coste computacional al procesar solo las regiones de interés. El checkpoint corresponde al paso 5.000 de 30.000 actualizaciones del optimizador, por lo que es un modelo en fase temprana de entrenamiento y no una versión final consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA (pi0.5 + FoveaVLA con predicción de subtareas) |
| Parametros totales | 4.145.527.568 (~4,15 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bf16/fp32) |
| Idiomas soportados | no disponible (las subtareas se predicen en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, un VLA de tipo pi0.5, y le añade la extensión FoveaVLA con predicción de subtareas. La arquitectura consta de un componente VLM que, tras el prompt, genera primero el subtarea actual en lenguaje natural (por ejemplo, "grasp the cable with the right hand", "turn the head to the center" o "insert the cable into the control module"). Después de esa respuesta, cuatro slots de caja por cámara (zed_mini, d405_left, d405_right) predicen la caja de cada cámara en t+8 mediante 4 clases sobre 1024 bins. El experto de acciones condiciona sus predicciones sobre la subtarea generada, pero nunca ve las cajas predichas directamente; la foveación se aplica como recorte de imagen antes de la inferencia.

El entrenamiento se realizó con LeRobot 0.6.2, batch efectivo de 64 (32 por GPU en una B200 con acumulación de gradiente 2), optimizador AdamW con pico de learning rate 2.5e-05, warmup de 2000 pasos y decaimiento coseno hasta 2.5e-06 en 60.000 pasos de bucle (equivalentes a 30.000 actualizaciones). Se usó autocast bf16 con pesos maestros fp32 y gradient checkpointing. La pérdida de entrenamiento en este paso es 0.205, combinando flow matching con 0.1 × entropía cruzada de subtarea y, en subtareas de inserción, 0.1 × entropía cruzada de caja. Las acciones son relativas al estado actual (use_relative_actions=true), excepto tres comandos de mano que se mantienen absolutos (right_thumb_joint1, right_index_joint2, right_index_joint3). La normalización usa las estadísticas de la rama `rel_chunk30` del dataset, con acciones de brazo relativas sobre chunks de 30 pasos y cuantiles de estado sobre todos los frames.

## Capacidades

- Predicción de subtareas en lenguaje natural: el VLM genera la subtarea actual antes de producir acciones, permitiendo un razonamiento de alto nivel explícito y condicionamiento del experto de acciones.
- Foveación selectiva por cámara: recorta regiones de interés (cajas predichas) para la cámara correspondiente durante subtareas de inserción, enmascarando vistas sin ventana fuera de la atención.
- Control de manipulación fina con seis cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y estado de 25 dimensiones.
- Generación de chunks de acciones de 30 pasos con 10 dimensiones por acción, incluyendo comandos de mano.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso en el sentido de LLM; su "razonamiento" se limita a la predicción de subtareas.
- Capacidades multilingües: no disponibles; las subtareas se expresan en inglés.
- No se documentan capacidades de visión general, audio, matemáticas o código más allá de la percepción robótica.

## Casos de uso

- Inserción de cables en un módulo de control: el modelo está ajustado específicamente para esta tarea, usando la subtarea "insert the cable into the control module" y foveación sobre las cajas predichas para localizar el conector con precisión.
- Manipulación con múltiples cámaras en entornos de laboratorio: aprovecha las seis vistas (dos D405, una ZED Mini y sus versiones foveadas) para reconstruir la escena y generar acciones relativas robustas.
- Investigación en VLA con foveación: sirve como referencia reproducible para estudiar cómo la atención selectiva por cámara afecta la precisión en tareas de contacto fino.
- Control de manos diestras con comandos absolutos: los tres joints de mano (pulgar, índice) se mantienen absolutos, útil para tareas que requieren agarre preciso y repetible.
- Evaluación de checkpoints intermedios: al ser el paso 5.000 de 30.000, permite estudiar la curva de aprendizaje y comparar con checkpoints posteriores del mismo run.
- Integración en pipelines LeRobot: se puede cargar con `PI05FoveaVLASubtaskPolicy.from_pretrained` y usar `predict_action_chunk` con proveedores en vivo de subtarea y caja, facilitando experimentos de bucle cerrado.
- Reproducción de normalización: los procesadores pre/post incluidos en el repo permiten replicar exactamente las estadísticas de entrenamiento sin depender del dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en este checkpoint: 0.205 (paso 5.000 de 30.000 actualizaciones). No hay métricas de éxito en tarea, latencia ni throughput documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con ~4,15 mil millones de parámetros, en bf16 se requieren aproximadamente 8,3 GB solo para pesos, más activaciones y buffers de las seis cámaras, lo que sugiere un mínimo práctico en torno a 16-24 GB.
- GPU recomendadas: el entrenamiento se realizó en una B200; para inferencia se puede usar A100, H100 o GPUs consumer de gama alta con suficiente VRAM.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) o RTX 3090 (24 GB) con bf16, aunque no está confirmado; en GPUs de 16 GB podría requerir cuantización o reducción de batch.
- Opciones de despliegue: LeRobot con `lerobot_policy_pi05_foveavla` (instalación desde GitHub, rama `subtask`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que es una política robótica, no un LLM de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 + FoveaVLA) | ~4,15 mil M | no disponible | Inserción de cables con subtareas y foveación | no disponible | Hugging Face (chomeed) |
| lerobot/pi05_base | no disponible | no disponible | VLA general base | no disponible | Hugging Face (lerobot) |
| Otras variantes pi0.5 fine-tuned | no disponible | no disponible | Manipulación robótica | depende del repo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas; la comparación se limita a la relación de fine-tuning (este modelo deriva directamente de `lerobot/pi05_base`).

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 5.000 de 30.000 actualizaciones, por lo que su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Licencia no disponible: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido; se debe contactar al autor antes de cualquier despliegue productivo.
- Especialización estrecha: ajustado exclusivamente al dataset `first_cable_insertion_uncased`; no se espera generalización a otras tareas de manipulación.
- Dependencia de etiquetas de subtarea no publicadas: las etiquetas de subtarea usadas en entrenamiento no están en el Hub y fueron escritas en la raíz local; esto complica la reproducción exacta del entrenamiento.
- Riesgo de alucinación en subtareas: el VLM puede predecir subtareas incorrectas, condicionando erróneamente al experto de acciones; no se documentan mecanismos de verificación.
- Foveación dependiente de cajas predichas: si la caja predicha es errónea, el recorte puede excluir la región relevante; además, las vistas sin ventana se enmascaran fuera de la atención, lo que puede degradar la percepción.
- Idiomas: subtareas en inglés; no se documenta soporte multilingüe.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en tarea, lo que dificulta evaluar su idoneidad frente a alternativas.
- Sesgos: no documentados; al entrenar sobre un dataset propio y una única tarea, puede heredar sesgos de las condiciones de captura (iluminación, posiciones, hardware específico).

## Enlaces

- Hugging Face: https://huggingface.co/chomeed/first_cable_insertion_uncased_pi05_foveavla_subtask_fullrgb_boxcrop_rel_chunk30_early45f_5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/chomeed/first_cable_insertion_uncased
- Repositorio LeRobot FoveaVLA (rama `subtask`): https://github.com/HDR-SRL/lerobot_foveavla/tree/subtask
- Run de Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/3nsg7nyl
