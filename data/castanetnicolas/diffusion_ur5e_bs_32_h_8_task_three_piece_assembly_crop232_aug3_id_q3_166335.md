# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q3_166335

## Resumen

Se trata de una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante la librería LeRobot de Hugging Face. El autor es el usuario castanetnicolas y el modelo resuelve una tarea concreta de manipulación robótica: insertar dos piezas en una base, una sobre otra (three piece assembly). No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de imitación que mapea observaciones (estado articular de 9 dimensiones y dos cámaras RGB de 256x256) a acciones de 7 dimensiones.

La arquitectura sigue el enfoque Diffusion Policy, que formula el control visuomotor como un proceso generativo de difusión: en lugar de predecir una acción única, el modelo genera trayectorias de acción multimodales y suaves, lo que resulta especialmente adecuado para tareas de manipulación con contactos ricos. El checkpoint contiene 278.014.919 parámetros en formato safetensors y ocupa 1,1 GB en el repositorio.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento y despliegue) sobre un robot tipo panda, con licencia Apache 2.0 y un dataset asociado de 220 episodios y 73.864 fotogramas a 20 FPS. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo por difusión) |
| Parametros totales | 278.014.919 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (9,) |
| observation.images.agentview | VISUAL | (3, 256, 256) |
| observation.images.robot0_eye_in_hand | VISUAL | (3, 256, 256) |
| action | ACTION | (7,) |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un paradigma que trata el control visuomotor como un proceso generativo de difusión. La política aprende a producir trayectorias de acción multimodales condicionadas por las observaciones visuales y propioceptivas, lo que mitiga el problema de promediado en distribuciones de acciones multimodales típico de los regresores directos y favorece la suavidad temporal en tareas de ensamblaje con contacto. La información disponible no detalla el número de pasos de difusión, el tipo de backbone visual ni la configuración exacta de la red, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, con batch size 32, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. El dataset asociado, castanetnicolas/mimicgen_three_piece_assembly_d1_image256, contiene 220 episodios y 73.864 fotogramas a 20 FPS, generados en el entorno MimicGen para la tarea "Insert the first piece into the base, then insert the second piece on top of it.". Las cámaras utilizadas son agentview y robot0_eye_in_hand, y el robot declarado en la model card es panda, aunque el identificador del repositorio menciona UR5e. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores, algo esperable en imitación supervisada.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para control de un brazo robótico en tareas de ensamblaje.
- Percepción visual a partir de dos cámaras RGB de 256x256 (vista externa y vista en la muñeca del robot).
- Condicionamiento por estado propioceptivo de 9 dimensiones.
- Ejecución de tareas de manipulación con contacto rico, donde la generación multimodal de acciones aporta ventajas frente a políticas deterministas.
- Despliegue mediante el comando lerobot-rollout con la estrategia base, sin grabación de episodios.
- Entrenamiento reproducible con lerobot-train usando el dataset asociado.
- No dispone de tool calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es una política de control específica de tarea.

## Casos de uso

- Ensamblaje de precisión en línea de montaje: la política ejecuta la inserción secuencial de dos piezas sobre una base, aprovechando la generación de trayectorias suaves para gestionar los contactos entre piezas.
- Investigación en imitación robótica: sirve como checkpoint de referencia para reproducir el pipeline completo de LeRobot (grabación, entrenamiento y despliegue) y comparar variantes de Diffusion Policy.
- Evaluación de robustez visuomotora: al depender de dos cámaras, permite estudiar cómo afectan cambios de iluminación, posición de objetos o distracciones al éxito de la tarea.
- Prototipado rápido en laboratorio: con 1,1 GB de pesos y 278 millones de parámetros, se puede cargar y ejecutar en una estación de trabajo con GPU consumer para pruebas de corta duración.
- Generación de datos sintéticos y aumento de datasets: el modelo y su dataset MimicGen asociado permiten experimentar con aumento de datos (el identificador incluye aug3) y analizar el efecto en el rendimiento.
- Formación y docencia: ejemplo didáctico de política de difusión para robótica, con comandos CLI documentados y dataset visualizable en el Space de LeRobot.
- Integración en bancos de pruebas de manipulación: útil como baseline de tarea única frente a políticas más generales en entornos controlados tipo MimicGen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 millones de parámetros en precisión completa (FP32) los pesos ocupan aproximadamente 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs consumer con 8 GB o más, asumiendo overhead de activaciones y procesamiento de imágenes.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia, y una RTX 4090, A100 o H100 aportarían margen para entrenamiento o despliegue por lotes.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM para inferencia.
- Opciones de despliegue: LeRobot mediante lerobot-rollout (estrategia base) y entrenamiento con lerobot-train; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 20 FPS según el dataset de entrenamiento, pero no se publican mediciones de latencia del despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q3_166335 | 278.014.919 | Diffusion Policy (LeRobot) | Estado (9,) + 2 imágenes 256x256 | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas Diffusion Policy en LeRobot Hub | no disponible | Diffusion Policy | variable según tarea | variable | Hugging Face |
| Políticas ACT en LeRobot Hub | no disponible | Action Chunking Transformer | variable según tarea | variable | Hugging Face |
| Políticas basadas en VLA generalistas | no disponible | Vision-Language-Action | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Política específica de una única tarea: solo ejecuta la inserción secuencial de dos piezas descrita en el dataset; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Ambigüedad de plataforma: la model card declara robot tipo panda, mientras que el identificador del repositorio menciona UR5e; conviene verificar la correspondencia antes de desplegar.
- Dependencia de las cámaras: requiere exactamente las vistas agentview y robot0_eye_in_hand con los nombres de observación del entrenamiento; cambios de cámara, calibración o iluminación pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset MimicGen de 220 episodios y 73.864 fotogramas, con posibles fallos ante posiciones de objetos o distracciones no vistas.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución; al ser una política de control, el riesgo se manifiesta como fallos de manipulación, no como texto incorrecto.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea desaconsejan su uso directo en producción sin validación propia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q3_166335
- Dataset asociado: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset en LeRobot Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
