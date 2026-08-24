# muniker/vla-jepa-so101-sort-210base-65ft-unfrozen-50steps-2camera

## Resumen

VLA-JEPA es un marco de preentrenamiento para modelos visión-lenguaje-acción (VLA) que combina un backbone de lenguaje Qwen3-VL-2B con un codificador de vídeo autosupervisado V-JEPA2 y una cabeza de acción basada en un DiT con flow-matching. Este checkpoint concreto, publicado por el usuario `muniker`, es una política de clasificación de bloques azules y rojos para el brazo robótico SO-ARM 101 de 6 grados de libertad. El modelo predice secuencias de 50 pasos de acción a partir de dos vistas de cámara (cámara del brazo y vista cenital), y se entrenó mediante fine-tuning de 65 episodios sobre un modelo base preentrenado con 210 episodios.

La relevancia de este modelo radica en que demuestra la viabilidad de entrenar políticas VLA con arquitectura JEPA en hardware de gama media (una GPU Intel Arc Pro) y con un presupuesto de datos muy reducido (65 episodios). Además, incorpora una innovación práctica: el uso de solo 4 pasos de Euler en la inferencia de flow-matching, lo que reduce la latencia a 45 ms por muestra sin pérdida significativa de precisión. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para ser usado con la librería `physicalai` y el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-2B-Instruct (backbone) + V-JEPA2 (encoder visual congelado) + DiT action head con flow-matching |
| Parametros totales | No disponible (backbone de 2B + head DiT; el total exacto no se publica) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-VL-2B-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | bf16 (pesos publicados); no se mencionan cuantizaciones adicionales |
| Idiomas soportados | No disponible (el modelo se centra en tareas robóticas, no en generación de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (presumiblemente, dado el tamaño de 4.6 GB y 877 tensores) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VLA-JEPA descrita en el paper arXiv 2602.10098. El backbone es Qwen3-VL-2B-Instruct, que procesa las observaciones visuales y el texto de la tarea. Un encoder V-JEPA2, congelado, genera representaciones latentes de los fotogramas futuros durante el preentrenamiento, actuando como un modelo del mundo. La cabeza de acción es un DiT (Diffusion Transformer) que utiliza flow-matching para predecir secuencias de acciones de 50 pasos (chunk_size = 50). En este checkpoint concreto, la torre de visión de Qwen3-VL es entrenable, mientras que el LLM y el encoder V-JEPA permanecen congelados.

El entrenamiento se realizó con Physical AI Studio sobre un conjunto de 65 episodios (22,759 fotogramas a 30 fps) de la tarea de clasificación de bloques. Se aplicaron 3 épocas (15,543 pasos de optimización) con una tasa de aprendizaje de 1e-5 para el backbone y 1e-4 para la cabeza de acción, con 500 pasos de warmup y decaimiento coseno hasta 1e-6. La normalización de acciones es MEAN_STD, calculada sobre el propio dataset de fine-tuning y almacenada en el checkpoint. No se usó aumento de datos (ni color ni recorte), lo que explica la sensibilidad al color del fondo observada en las evaluaciones.

## Capacidades

- Generación de acciones robóticas: predice secuencias de 50 pasos de posición articular (6 DOF) en grados, denormalizadas, para el brazo SO-ARM 101.
- Percepción multi-cámara: procesa simultáneamente dos vistas de 224×224 píxeles (cámara del brazo y vista cenital), ambas obligatorias.
- Comprensión de instrucciones: acepta una tarea textual (p. ej., "clasificar bloques azules y rojos") como entrada.
- Flow-matching con pocos pasos: usa 4 pasos de Euler en inferencia, lo que reduce la latencia a 45 ms por muestra sin degradación significativa.
- Fine-tuning eficiente: el diseño permite adaptar el modelo a nuevas tareas con pocos episodios (65 en este caso) y hardware modesto.
- Integración con LeRobot: compatible con el ecosistema LeRobot y la librería `physicalai` para entrenamiento y despliegue.

## Casos de uso

- Clasificación de objetos en robótica de laboratorio: el modelo puede ordenar bloques de colores en un escenario controlado, sirviendo como banco de pruebas para algoritmos de manipulación.
- Investigación en aprendizaje por imitación: al estar entrenado con solo 65 episodios, es un punto de partida para estudiar la eficiencia de datos en políticas VLA.
- Desarrollo de políticas con world models: su arquitectura JEPA permite investigar cómo el modelado latente del mundo mejora la generalización en tareas de manipulación.
- Benchmarking de hardware de gama media: al ejecutarse en una GPU Intel Arc Pro, demuestra que es posible entrenar VLAs sin hardware de alta gama, útil para laboratorios con recursos limitados.
- Evaluación de estrategias de fine-tuning: el checkpoint permite comparar el efecto de descongelar la torre de visión frente a mantenerla congelada, ya que existen versiones con y sin `unfrozen`.
- Estudio de la sensibilidad al entorno: su degradación documentada ante cambios de color de fondo lo convierte en un caso de estudio para robustez visual en robótica.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación open-loop sobre episodios reservados `[2, 28, 34, 38, 43, 61]` del dataset de fine-tuning, con 60 lotes / 480 muestras y comparación contra el modelo base de 210 episodios:

| Metrica | Modelo base (210 ep) | Este modelo | Cambio |
|---|---|---|---|
| MAE (grados) | 10.072 | 4.912 | −51.2% |
| RMSE (grados) | 14.221 | 7.529 | −47.1% |
| Pérdida validación normalizada | 0.8071 | 0.3140 | — |

Desglose por articulación (MAE en grados):

| Articulacion | Base | Este modelo | Δ |
|---|---|---|---|
| shoulder_pan | 8.12 | 3.95 | −51.4% |
| shoulder_lift | 16.72 | 6.93 | −58.6% |
| elbow_flex | 19.58 | 8.15 | −58.4% |
| wrist_flex | 6.61 | 4.54 | −31.3% |
| wrist_roll | 6.25 | 4.29 | −31.4% |
| gripper | 3.16 | 1.62 | −48.7% |

El error crece a lo largo del chunk: 2.93° en el paso 0, 5.04° en el paso 24 y 6.35° en el paso 49. La comparación por lotes emparejados muestra una mejora de +5.160° ± 0.35 (IC 95%, t = +28.9), ganando en 60/60 lotes. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo no está orientado a tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor. Con un backbone de 2B parámetros en bf16 (4.56 GB de pesos), se estima que cabría en GPUs con 6-8 GB de VRAM, aunque no hay confirmación oficial.
- GPU recomendadas: el entrenamiento se realizó en una Intel Arc Pro (XPU). Para inferencia, cualquier GPU moderna con soporte CUDA o XPU debería ser suficiente.
- Compatibilidad con GPU de consumo: probablemente sí (p. ej., RTX 3060 o superior), dado el tamaño del modelo, pero no está verificado.
- Opciones de despliegue: la librería `physicalai` y LeRobot; también es posible usar vLLM o TGI si se adapta el formato, aunque no está documentado.
- Latencia: 45 ms por muestra con 4 pasos de Euler; 105 ms con 32 pasos. El chunk de 50 acciones cubre 1.67 segundos, por lo que la latencia no es un cuello de botella.

## Comparativa con modelos similares

| Modelo | Backbone | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`muniker/vla-jepa-so101-sort-210base-65ft-unfrozen-50steps-2camera`) | Qwen3-VL-2B | Clasificación de bloques SO-101 | 2 cámaras, 50 pasos | Apache 2.0 | Hugging Face |
| `witsense-ai/so101_vla_jepa_v3` | Qwen3-VL-2B | Tareas SO-101 (pick-place) | No especificado | No especificada | Hugging Face |
| VLA-JEPA original (paper) | Qwen3-VL-2B | Múltiples tareas (Droid, LIBERO, etc.) | Variable | Apache 2.0 (según repo) | GitHub |

El modelo se distingue por su fine-tuning específico para clasificación de bloques con dos cámaras y por documentar explícitamente la sensibilidad al entorno. La alternativa `witsense-ai` cubre tareas de pick-place, pero no se dispone de detalles comparativos de rendimiento.

## Limitaciones y advertencias

- Sobreajuste severo: la pérdida de entrenamiento final es 0.0623 frente a 0.3010 de validación, un factor de 4.8×. El modelo memoriza el dataset de fine-tuning.
- Los pesos publicados corresponden a la última época, no al mejor checkpoint (época 0). La diferencia es del 0.5%, pero debe tenerse en cuenta.
- Sensibilidad al color de fondo: el modelo base puntúa 0.3057 en su propia validación pero 0.8071 en este dataset, una degradación de 2.6× atribuida al cambio de color de la alfombrilla. Sin aumento de datos de color, se espera degradación ante cambios de iluminación o superficie.
- Sin evaluación en bucle cerrado: todos los resultados son open-loop de un solo chunk contra ground truth grabado. No se han medido errores de acumulación, recuperación de estados fuera de distribución ni selección multimodal de acciones.
- Ejecución open-loop obligatoria: `n_action_steps: 50` implica que las 50 acciones se ejecutan sin realimentación, lo que limita su uso en tareas que requieran corrección en tiempo real.
- Compatibilidad de entrada: el modelo requiere exactamente dos cámaras en el orden `["arm-camera", "topview"]`. Si se carga con un dataset con otras cámaras, hay que fijar `camera_keys` explícitamente.
- Riesgo de alucinación: al ser un modelo de acción, no genera texto libre, pero la cabeza de acción puede producir comandos no válidos si se usa fuera de su distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muniker/vla-jepa-so101-sort-210base-65ft-unfrozen-50steps-2camera
- Paper VLA-JEPA: https://arxiv.org/abs/2602.10098
- Repositorio oficial VLA-JEPA: https://github.com/ginwind/VLA-JEPA
- Página del proyecto VLA-JEPA: https://ginwind.github.io/VLA-JEPA/
- Modelo similar en Hugging Face: https://huggingface.co/witsense-ai/so101_vla_jepa_v3
- Reproducción a pequeña escala: https://github.com/AmoghShrivastava/vlaJEPA
- Physical AI Studio: https://github.com/intel/physical-ai-studio
