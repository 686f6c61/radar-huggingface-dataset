# ImKyungjin/pi05-so101-cvpr2027-realworld-office-fullft70k-headft20k

## Resumen

El modelo `pi05-so101-cvpr2027-realworld-office-fullft70k-headft20k` es un checkpoint de política robótica basado en la arquitectura pi0.5 (pi05), desarrollado por el usuario ImKyungjin y publicado en Hugging Face bajo la librería LeRobot. Se trata de un ajuste fino (fine-tuning) del modelo general `pi05-so101-cvpr2027-realworld-general-fullft-70k-step70000`, especializado en una tarea concreta de manipulación con el brazo robótico SO101: recoger dos rotuladores de pizarra de una mesa y colocarlos en un soporte rojo. El modelo resuelve el problema de adaptar una política generalista de imitación a una tarea específica de oficina mediante entrenamiento supervisado sobre 40 demostraciones humanas.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje generalista, sino un artefacto de investigación en robótica de imitación (imitation learning) orientado a la evaluación en el benchmark CVPR2027. El modelo tiene 3.616.757.520 parámetros totales, de los cuales solo 693.422.112 son entrenables en esta fase (el llamado "action expert" y las proyecciones de acción/tiempo), mientras que el backbone VLM permanece congelado en los pesos del modelo general de 70.000 pasos. El repositorio ocupa 14,5 GB y se distribuye en formato safetensors junto con tokenizer y procesador.

Es importante subrayar que el autor indica explícitamente que no se han evaluado las tasas de éxito en robot real para este checkpoint de adaptación, y que se trata de un fine-tuning ordinario, no de la propuesta metodológica "Proposed" del paper. Por tanto, debe tratarse como un artefacto reproducible de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (pi05): VLM backbone con experto de acción (flow matching) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | 693.422.112 (action expert y proyecciones de acción/tiempo entrenables; VLM congelado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (instrucción en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5, que combina un backbone de tipo vision-language model (VLM) con un experto de acción entrenado mediante flow matching. En este checkpoint concreto, el VLM se mantiene congelado en los pesos del modelo general `pi05-so101-cvpr2027-realworld-general-fullft-70k-step70000` (70.000 pasos de fine-tuning completo sobre el dataset general), y solo se entrenan el experto de acción y las proyecciones asociadas de acción y tiempo (693.422.112 parámetros). La política genera acciones mediante 10 pasos de denoising por flow matching, con un chunk de 50 acciones y un horizonte de ejecución de 10.

El entrenamiento de esta adaptación se realizó sobre el dataset "Office Marker", compuesto por 40 demostraciones humanas y 21.389 frames, con la instrucción fija `Pick up the two whiteboard markers from the table and put them in the red holder.` Se usó batch de 8, optimizador AdamW con betas (0,9; 0,95), eps 1e-8, weight decay 0,01, recorte global de gradiente de 1,0, LR pico de 2,5e-5 con warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-6, autocast en bf16 y semilla 1000. Las acciones y estados son 6 posiciones absolutas nativas de articulación/pinza (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper), y el autor advierte explícitamente que no deben interpretarse como deltas cartesianos ni radianes. La normalización emplea las estadísticas originales del entrenamiento General, incluidas en el repositorio.

## Capacidades

- Generación de acciones robóticas de manipulación para el brazo SO101 a partir de observaciones visuales e instrucción en lenguaje natural.
- Ejecución de una tarea específica de pick-and-place: recoger dos rotuladores de pizarra y depositarlos en un soporte rojo.
- Control de 6 grados de libertad nativos (5 articulaciones + pinza) con posiciones absolutas.
- Procesamiento de dos cámaras RGB mapeadas a los slots del modelo: cámara física `top` al slot `base_0_rgb` y cámara física `front` al slot `left_wrist_0_rgb` (este último es un slot del modelo, no una cámara de muñeca física).
- Preprocesado de imagen con letterbox RGB a 224x224.
- Generación de trayectorias por chunks de 50 acciones con horizonte de ejecución de 10 y 10 pasos de denoising.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito; es un modelo puramente de política visomotora.

## Casos de uso

- Investigación en imitación robótica: servir como checkpoint de referencia para reproducir el experimento de adaptación de un modelo general a una tarea de oficina con solo 40 demostraciones, evaluando la transferencia desde el modelo General de 70k.
- Evaluación comparativa en el benchmark CVPR2027: el modelo está etiquetado explícitamente para este benchmark, por lo que su uso principal es la comparación de metodologías de fine-tuning (full FT vs. head FT) en tareas reales de manipulación.
- Estudio de congelación de backbone: al mantener el VLM congelado y entrenar solo el experto de acción, permite analizar cuánta capacidad de adaptación reside en el experto de acción frente al backbone visual-lingüístico.
- Reproducción de pipelines LeRobot: el repositorio incluye tokenizer, procesador y el script `experiment_code/load_export.py`, lo que facilita la integración en flujos de entrenamiento e inferencia de LeRobot para experimentos académicos.
- Validación de exportación de pesos: el archivo `export_verification.json` permite verificar tensor a tensor la correspondencia con el checkpoint de cabeza final y el VLM General congelado, útil para auditar pipelines de exportación.
- Docencia y divulgación en robótica de imitación: como ejemplo didáctico de cómo se compone una política pi0.5, cómo se mapean cámaras a slots y cómo se normalizan estados y acciones con estadísticas heredadas.
- Pruebas de integración hardware-software: permite validar la cadena completa (cámaras, brazo SO101, servidor de inferencia, LeRobot) en una tarea acotada antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las tasas de éxito en robot real no han sido evaluadas para este checkpoint de adaptación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.616.757.520 parámetros en bf16, los pesos ocupan aproximadamente 7,2 GB; en fp32, unos 14,5 GB (coincide con el tamaño del repositorio). A ello hay que sumar el coste de activaciones del VLM y del experto de acción, por lo que se recomienda al menos 16-24 GB de VRAM para inferencia cómoda en bf16.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una NVIDIA A100 (40/80 GB), H100 o L40S son adecuadas; una RTX 4090 (24 GB) podría ser suficiente en bf16 si el pipeline de LeRobot no requiere grandes lotes.
- ¿Cabe en GPU de consumo? Probablemente sí en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16, siempre que se gestione con cuidado el uso de memoria del VLM congelado; no hay confirmación oficial.
- Opciones de despliegue: LeRobot (librería nativa del modelo), con el script `experiment_code/load_export.py` para carga y exportación. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a un modelo de política robótica.
- Latencia y throughput: no disponibles. El modelo ejecuta 10 pasos de denoising por chunk de 50 acciones con horizonte de ejecución de 10, lo que condiciona la frecuencia de control, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-cvpr2027-realworld-office-fullft70k-headft20k (este) | 3.616.757.520 (693.422.112 entrenables) | no disponible | Manipulación SO101, tarea Office Marker | no disponible | Hugging Face (LeRobot) |
| ImKyungjin/pi05-so101-cvpr2027-realworld-general-fullft-70k-step70000 (modelo base) | no disponible en la información | no disponible | Política general SO101 | no disponible | Hugging Face (LeRobot) |
| Otros checkpoints pi05/so101 del mismo autor | no disponible | no disponible | Variantes de tarea | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que no se han evaluado las tasas de éxito en robot real para este checkpoint; no debe asumirse un rendimiento validado.
- Es un fine-tuning ordinario, no la propuesta metodológica "Proposed" del paper; no debe citarse como innovación metodológica.
- La política está especializada en una única instrucción y tarea (Office Marker); no generaliza a otras tareas sin reentrenamiento.
- Las acciones son posiciones absolutas nativas de articulación/pinza, no deltas cartesianos ni radianes; interpretarlas mal produce comandos incorrectos en el robot.
- El mapeo de cámaras es contraintuitivo: la cámara física `front` se asigna al slot `left_wrist_0_rgb`, que no es una cámara de muñeca física; un mapeo incorrecto degrada el rendimiento.
- La normalización depende de las estadísticas del entrenamiento General incluidas en el repositorio; usar otras estadísticas invalida las predicciones.
- El repositorio contiene solo pesos de inferencia, no estado del optimizador; no es reanudable para entrenamiento sin pasos adicionales.
- Las rutas de servidor en `experiment.json` documentan procedencia, no son dependencias portables; hay que resolver el tokenizer localmente.
- Licencia no disponible: no se puede confirmar el uso comercial permitido.
- Idiomas no disponibles: la instrucción está en inglés y no se documenta soporte multilingüe.
- Riesgo de sobreajuste a las 40 demostraciones (21.389 frames) y a las condiciones de iluminación, disposición de mesa y cámara del dataset original.
- No se documentan sesgos, pero al ser un modelo visomotor entrenado con datos limitados, puede fallar ante cambios de apariencia de los rotuladores, del soporte o del fondo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi05-so101-cvpr2027-realworld-office-fullft70k-headft20k
- Modelo base: https://huggingface.co/ImKyungjin/pi05-so101-cvpr2027-realworld-general-fullft-70k-step70000
- Librería LeRobot: https://github.com/huggingface/lerobot
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos específicos de este checkpoint.
