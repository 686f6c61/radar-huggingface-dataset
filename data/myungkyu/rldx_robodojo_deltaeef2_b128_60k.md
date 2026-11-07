# Myungkyu/rldx_robodojo_deltaeef2_b128_60k

## Resumen

rldx_robodojo_deltaeef2_b128_60k es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un fine-tuning del modelo base RLWRLD/RLDX-1-PT sobre el conjunto de datos RoboDojo-Benchmark/RoboDojo, en la configuración de co-entrenamiento en simulación con 35 tareas y 100 episodios por tarea, sobre un robot dual ARX X5 exportado en formato LeRobot. El modelo consume imágenes de tres cámaras (cabeza y muñecas izquierda y derecha), un estado de efector final de 16 dimensiones y la instrucción de la tarea, y produce objetivos de acción delta de efector final de 14 dimensiones por paso.

La relevancia de esta ficha es acotada pero concreta: se trata de una variante de espacio de acciones delta-EEF (segunda ejecución delta, con las raíces delta de RoboDojo reconstruidas con la corrección de etiquetas de siguiente estado) y se distribuye como baseline reproducible para el benchmark RoboDojo. El modelo tiene 6.912.896.320 parámetros según los pesos safetensors, un repositorio de 165,9 GB y se publica junto con checkpoints intermedios en los pasos 15.000, 30.000 y 45.000, además del checkpoint final tras 60.000 pasos con batch 128.

No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks en la información proporcionada. La model card es escueta y de carácter técnico-experimental, orientada a la reproducibilidad de experimentos más que a un uso comercial listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (modelo visión-lenguaje-acción; video length 4 / stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parametros totales | 6.912.896.320 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura RLDX-1-PT, un VLA que procesa secuencias de vídeo con longitud 4 y stride 2, tres vistas de cámara simultáneas (cabeza y muñecas izquierda y derecha) y un horizonte de acción de 50 pasos. La entrada combina las imágenes, un estado de efector final de 16 dimensiones (por brazo: posición xyz, cuaternión wxyz y gripper) y la instrucción de la tarea en lenguaje natural; la salida son objetivos delta de efector final de 14 dimensiones por paso (por brazo: delta de posición, delta de vector de rotación y gripper absoluto).

El fine-tuning se realizó sobre el conjunto RoboDojo en configuración de co-entrenamiento en simulación (35 tareas × 100 episodios, robot dual ARX X5, exportación oficial LeRobot). El entrenamiento usó batch de optimizador 128 y 60.000 pasos, con enmascaramiento de ruido en la dimensión de padding (action_noise_mask_dim=14) y state dropout de 0,5. El código empleado corresponde a RLWRLD/RLDX en la rama myungkyu/jitter-patch, commit 21f674b4. Se publican checkpoints intermedios en los pasos 15.000, 30.000 y 45.000, cada uno con su propio fichero SHA256SUMS, y el checkpoint final no incluye el estado del optimizador.

## Capacidades

- Generación de acciones robóticas de efector final en espacio delta a partir de instrucciones en lenguaje natural e imágenes de tres cámaras.
- Control bimanual sobre robot dual ARX X5 con representación de posición, orientación (cuaternión y vector de rotación) y gripper.
- Procesamiento multimodal: entrada visual multi-vista (cabeza, muñeca izquierda, muñeca derecha) combinada con estado propioceptivo del robot.
- Predicción de secuencias de acción con horizonte de 50 pasos.
- Ejecución de tareas de manipulación en simulación dentro del benchmark RoboDojo (35 tareas).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Baseline de investigación en RoboDojo: sirve como referencia reproducible para comparar nuevas variantes de espacio de acciones delta-EEF frente a los checkpoints publicados en los pasos 15.000, 30.000 y 45.000, gracias a la inclusión de SHA256SUMS por checkpoint.
- Evaluación de políticas bimanuales en simulación: el modelo está entrenado para el robot dual ARX X5 con exportación LeRobot, por lo que puede integrarse directamente en pipelines de evaluación que usen ese formato de datos y esa morfología.
- Estudio de representaciones de acción: al ser una variante delta-EEF con corrección de etiquetas de siguiente estado, permite analizar el impacto del espacio de acciones y del arreglo de etiquetas en el rendimiento de políticas VLA.
- Ablación de técnicas de regularización: el entrenamiento aplica enmascaramiento de ruido en la dimensión de padding y state dropout de 0,5, lo que facilita experimentos controlados sobre estas técnicas.
- Reentrenamiento o fine-tuning posterior: los pesos safetensors y la configuración que referencia el backbone y el tokenizer por hub id permiten partir de este modelo para adaptarlo a nuevas tareas o morfologías dentro del ecosistema LeRobot.
- Investigación sobre co-entrenamiento sim-to-real: la configuración de co-entrenamiento en simulación con 35 tareas y 100 episodios es un punto de partida para estudiar transferencia a entornos reales, aunque no se documentan resultados de transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 6.912.896.320 parámetros, una estimación orientativa en FP16 rondaría los 13-14 GB solo de pesos, y en BF16 cantidades similares, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros podría ser viable en GPUs con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo se distribuye como safetensors para uso con el código RLWRLD/RLDX.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 165,9 GB, lo que incluye el checkpoint final y los checkpoints intermedios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Myungkyu/rldx_robodojo_deltaeef2_b128_60k | 6.912.896.320 | no disponible | no disponible | no disponible | Hugging Face |
| Myungkyu/pi05_robodojo_deltaeef2_b128_60k | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| RLWRLD/RLDX-1-PT (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a los modelos identificados en la búsqueda web; no se dispone de datos de rendimiento, contexto ni licencia para ninguno de ellos.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución de los pesos.
- Modelo experimental de investigación: la model card no documenta evaluación fuera del benchmark RoboDojo ni resultados de transferencia a robots reales.
- Entrenado específicamente para el robot dual ARX X5 y el formato LeRobot; su aplicabilidad a otras morfologías o espacios de acciones no está validada.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no evaluado en la información disponible; en modelos VLA el riesgo se traduce en acciones incorrectas o inseguras ante instrucciones ambiguas.
- Limitaciones de contexto e idioma: no documentadas.
- El checkpoint final no incluye el estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- El repositorio ocupa 165,9 GB, lo que exige planificación de almacenamiento y ancho de banda para su descarga.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/rldx_robodojo_deltaeef2_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Variante comparable pi05: https://huggingface.co/Myungkyu/pi05_robodojo_deltaeef2_b128_60k
- Dataset: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Código: RLWRLD/RLDX, rama myungkyu/jitter-patch, commit 21f674b4 (no se proporciona URL directa)
