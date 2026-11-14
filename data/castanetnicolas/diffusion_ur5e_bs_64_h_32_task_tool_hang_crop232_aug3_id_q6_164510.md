# castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q6_164510

## Resumen

`castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q6_164510` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy (papel arXiv 2303.04137) y publicada mediante la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica: insertar un gancho en una base para construir un marco y colgar una llave inglesa en el gancho. Está pensado para ejecutarse sobre un robot tipo `panda` (aunque el identificador del repositorio menciona UR5e, la model card indica `panda`) con dos cámaras: una vista lateral (`sideview`) y una cámara en la muñeca (`robot0_eye_in_hand`).

La arquitectura es una política de difusión que trata el control visuomotor como un proceso generativo: en lugar de predecir una única acción, genera trayectorias de acción suaves y multi-paso, lo que la hace especialmente adecuada para tareas de manipulación con contactos ricos. El checkpoint contiene 278.014.919 parámetros almacenados en formato safetensors (1,1 GB), una cifra coherente con una red de difusión convolucional con dos entradas visuales de 3×256×256 píxeles.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, publicación y despliegue de políticas de imitación en robótica real. No obstante, se trata de un modelo muy específico de una única tarea, sin resultados de evaluación publicados y con cero descargas, por lo que su utilidad práctica fuera de ese escenario concreto es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor) |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción H=32 según el identificador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, que formula la generación de acciones como un proceso de difusión: parte de ruido y lo denoisa iterativamente hasta producir una secuencia de acciones (`action` de dimensión 7). Las observaciones de entrada son el estado del robot (`observation.state`, vector de 9 dimensiones) y dos imágenes RGB de 3×256×256 (`sideview` y `robot0_eye_in_hand`). El identificador del repositorio codifica hiperparámetros de entrenamiento: batch size 64 (`BS_64`), horizonte de predicción 32 (`H_32`), recorte a 232 píxeles (`crop232`), aumento de datos (`aug3`) y 6 pasos de difusión en inferencia (`q6`).

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/robomimic_tool_hang_ph_image256`: 200 episodios, 95.962 fotogramas a 20 FPS, tarea "Insert the hook into the base to build a frame, then hang the wrench on the hook". Se ejecutaron 100.000 pasos con optimizador Adam, learning rate 0,0001 y semilla 1000. No se documenta composición adicional del dataset, ni uso de RLHF/DPO (no aplica en imitación), ni innovaciones técnicas más allá del propio método Diffusion Policy.

## Capacidades

- Generación de trayectorias de acción multi-paso y suaves para control visuomotor (salida de 7 dimensiones).
- Manipulación robótica con contactos ricos: inserción de piezas y colocación de objetos (tarea tool_hang).
- Fusión de percepción visual (dos cámaras) con estado proprioceptivo del robot.
- Ejecución autónoma de una política de imitación entrenada por demostración.
- Integración con el stack LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso lingüístico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales fuera del control robótico.

## Casos de uso

- Automatización de ensamblaje tipo "tool hang": el modelo ejecuta la secuencia de insertar un gancho en una base y colgar una llave, adecuado porque fue entrenado específicamente sobre esa tarea con 200 episodios.
- Investigación en imitación robótica: sirve como referencia reproducible de Diffusion Policy en LeRobot para comparar hiperparámetros (batch size, horizonte, pasos de difusión) en tareas de contacto.
- Pruebas de despliegue en robot `panda` con dos cámaras: permite validar el pipeline `lerobot-rollout` con `--strategy.type=base` y tarea textual, útil para calibrar hardware y cámaras.
- Benchmark interno de manipulación de precisión: al requerir inserción y colocación, es un caso exigente para medir tasas de éxito en laboratorio.
- Reentrenamiento y transferencia: el checkpoint y su configuración sirven de base para `lerobot-train` con datasets propios y ajuste de hiperparámetros.
- Docencia y demostraciones: ejemplo didáctico de política de difusión visuomotora dentro del ecosistema LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 M de parámetros en safetensors (1,1 GB), la inferencia en precisión nativa requiere del orden de 1-2 GB de VRAM, más overhead de activaciones por las dos imágenes de 256×256.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; para entrenamiento con batch size 64 se recomienda GPU de gama alta (A100, H100, RTX 4090) por el coste de memoria de las activaciones.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no hay cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con PyTorch y CUDA; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; el dataset se grabó a 20 FPS, lo que orienta sobre la frecuencia de control esperada, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_UR5e_BS_64_H_32_TASK_tool_hang (este modelo) | 278 M | H=32 (según identificador) | Sin evaluación publicada | apache-2.0 | Hugging Face (0 descargas) |
| Otras políticas Diffusion Policy en LeRobot | no disponible | no disponible | no disponible | variable | Hugging Face |
| Políticas ACT en LeRobot | no disponible | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas concretas; la información proporcionada no incluye resultados comparables.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado solo para la tarea tool_hang; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito que permitan valorar su fiabilidad en producción.
- Cero descargas y cero likes: escasa validación por parte de la comunidad.
- Posible inconsistencia entre el identificador (`UR5e`) y la model card (`panda`): verificar el robot objetivo antes de desplegar.
- Dependencia de las cámaras y nombres de observación exactos (`sideview`, `robot0_eye_in_hand`); cambios de montaje o iluminación pueden degradar el rendimiento.
- Riesgo de sobreajuste al dataset de 200 episodios y a la configuración de aumento de datos empleada.
- No aplica sesgo lingüístico ni alucinación textual; el riesgo equivalente es fallo de ejecución física.
- Licencia apache-2.0 permite uso comercial, pero sin garantías ni soporte del autor.
- No hay información sobre sesgos, limitaciones de idioma ni caveats adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q6_164510
- Dataset: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
