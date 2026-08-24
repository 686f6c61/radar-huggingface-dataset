# franecki/pi0_soarm101_full_v203_50k

## Resumen

`franecki/pi0_soarm101_full_v203_50k` es un modelo de visión-lenguaje-acción (VLA) obtenido mediante fine-tuning completo del modelo base `lerobot/pi0_base` (OpenPI π₀, de Physical Intelligence) sobre un conjunto de datos propio de manipulación robótica. El autor, franecki, lo ha entrenado específicamente para el brazo robótico SO-ARM101 Pro, con la tarea de recoger una botella blanca y colocarla dentro de un círculo de cinta negra. El modelo genera secuencias de acciones (action chunks) de 50 pasos en 6 dimensiones a partir de observaciones de dos cámaras (superior y de pinza) y del estado articular del robot.

El fine-tuning se realizó congelando el codificador visual SigLIP (0,41B parámetros) y actualizando todos los demás componentes: el modelo de lenguaje Gemma-2B, el Action Expert de 300M y las proyecciones, sumando 3,09B parámetros entrenables. El entrenamiento duró 50.000 pasos con batch 8, aproximadamente 5,1 épocas sobre 203 episodios (77.944 frames), con una pérdida final en torno a 0,05. El modelo se distribuye en formato safetensors con pesos bf16 completos, listos para cargar sin necesidad de fusión.

Este modelo es relevante porque demuestra un flujo de fine-tuning completo (no LoRA) de un VLA de 3,5B parámetros para una tarea robótica concreta, con requisitos de hardware accesibles (GPU con 8GB de VRAM o Jetson AGX Orin) y una metodología documentada que puede replicarse para otras tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en transformer (pi0_base): SigLIP vision encoder + Gemma-2B language model + Action Expert 300M |
| Parametros totales | 3.501.372.176 |
| Parametros activos | 3.501.372.176 (no es MoE, todos activos) |
| Longitud de contexto | no disponible (el modelo base pi0 procesa imágenes y texto, pero no se documenta la ventana exacta) |
| Tipos de cuantizacion | bf16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Ingles (prompt de tarea fijo); otros idiomas no documentados |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi0_base`, un VLA de la familia OpenPI desarrollado por Physical Intelligence. La arquitectura combina un codificador visual SigLIP (que procesa las imágenes de las cámaras), un modelo de lenguaje Gemma-2B (que interpreta la instrucción textual) y un Action Expert de 300M parámetros que genera las acciones del robot. En este fine-tuning se congeló el codificador visual (0,41B parámetros) y se actualizaron completamente el modelo de lenguaje, el Action Expert y todas las capas de proyección (3,09B parámetros), sin usar LoRA.

El entrenamiento se realizó con el framework LeRobot (versión 0.4.4, fork de Seeed-Projects) sobre el dataset `franecki/pill_bottle_203`, que contiene 203 episodios de demostración con 77.944 frames, capturados con cámaras fijas. Se usó bfloat16 con gradient checkpointing, batch de 8, y una tasa de aprendizaje con decaimiento coseno desde 2,5e-5 hasta 2,5e-6 a lo largo de los 50.000 pasos. La pérdida de entrenamiento convergió a aproximadamente 0,05. El prompt de tarea es fijo y debe respetarse exactamente, incluyendo el punto final: `Pick up the white pill bottle and place it inside the black tape circle.`

## Capacidades

- Control de manipulacion robotica: genera secuencias de acciones (action chunks) de 50 pasos con 6 grados de libertad para el brazo SO-ARM101 Pro.
- Percepcion multimodal: procesa simultaneamente dos imagenes (camara superior 640x480 y camara de pinza 640x480) y el estado articular del robot (6 dimensiones normalizadas entre -100 y 100).
- Ejecucion de tareas pick-and-place: especificamente entrenado para recoger una botella blanca y colocarla en un circulo de cinta negra.
- Inferencia en tiempo real: capaz de operar a 0,5-1 Hz en hardware embebido como Jetson AGX Orin, con latencia de 0,5-2 segundos por inferencia.
- No incluye capacidades de chat, generacion de texto general, tool calling ni razonamiento simbolico; es un modelo puramente orientado a acciones robotica.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio o produccion: el modelo puede integrarse en un sistema robotico SO-ARM101 Pro para realizar la tarea de recoger y colocar objetos de forma repetitiva, con una tasa de exito dependiente de la consistencia de la configuracion de camaras e iluminacion.
- Investigacion en aprendizaje por demostracion: sirve como referencia para estudiar el efecto del fine-tuning completo frente a LoRA o fine-tuning solo del Action Expert, comparando con los modelos `pi0_soarm101_lora` y `pi0_soarm101_expert_only` publicados por el mismo autor.
- Desarrollo de pipelines de entrenamiento VLA: el flujo documentado (dataset, configuracion de entrenamiento, despliegue) puede replicarse para otras tareas de manipulacion, adaptando el prompt y las observaciones.
- Pruebas de despliegue en hardware embebido: el modelo esta validado en Jetson AGX Orin 64GB, lo que permite evaluar el rendimiento de VLAs de 3,5B en plataformas de bajo consumo.
- Benchmarking de controladores de bajo nivel: al generar action chunks de 50 pasos, puede usarse para comparar estrategias de ejecucion (ejecucion completa del chunk, re-planificacion a diferentes frecuencias, etc.).
- Educacion en robotica y VLA: el modelo y su documentacion sirven como caso practico para ensenar fine-tuning de modelos de vision-lenguaje-accion en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Al tratarse de un modelo de robotica, la evaluacion se centra en la tarea especifica de manipulacion. La model card reporta una perdida de entrenamiento convergida a ~0,05, pero no proporciona metricas de exito en el mundo real (tasa de exito, numero de intentos, etc.). Tampoco se comparan resultados con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 8 GB segun la model card (pesos bf16 de ~6,6 GB). Con cuantizacion a 8 bits o 4 bits podria reducirse, pero no se documenta.
- GPU recomendadas: cualquier GPU NVIDIA con 8 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100). En Jetson AGX Orin 64GB funciona correctamente.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 8 GB o mas, aunque la inferencia puede ser lenta en las mas modestas.
- Opciones de despliegue: LeRobot (fork de Seeed-Projects) con `PI0Policy.from_pretrained()`, tambien puede usarse con openpi (repositorio `Maelic/openpi-SO100`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de robotica, no de texto.
- Latencia y throughput: en Jetson AGX Orin 64GB, la inferencia tarda entre 0,5 y 2 segundos por paso, permitiendo una frecuencia de control de 0,5-1 Hz. En GPUs de datacenter (A100/H100) se espera una latencia menor, pero no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de fine-tuning | Tarea | Licencia |
|---|---|---|---|---|---|
| `franecki/pi0_soarm101_full_v203_50k` | 3,5B | no disponible | Full fine-tuning (vision congelada) | Pick-and-place botella | no disponible |
| `franecki/pi0_soarm101_lora` | 3,5B (LoRA) | no disponible | LoRA | Pick-and-place botella | no disponible |
| `franecki/pi0_soarm101_expert_only` | 3,5B (solo Action Expert) | no disponible | Fine-tuning solo Action Expert | Pick-and-place botella | no disponible |
| `lerobot/pi0_base` | 3,5B | no disponible | Preentrenamiento general | Manipulacion general | Apache 2.0 (segun OpenPI) |

Los tres modelos de franecki comparten la misma base y tarea, diferenciandose en la estrategia de fine-tuning. El modelo full (este) actualiza 3,09B parametros, mientras que el LoRA actualiza un subconjunto mucho menor y el expert_only solo el Action Expert. No se dispone de comparativas de rendimiento entre ellos. El modelo base `pi0_base` es el punto de partida y tiene una licencia Apache 2.0, pero la licencia de los fine-tunings no esta especificada.

## Limitaciones y advertencias

- Tarea muy especifica: el modelo solo ejecuta la tarea de recoger la botella blanca y colocarla en el circulo de cinta negra. No generaliza a otros objetos, posiciones o variaciones del prompt.
- Prompt fijo obligatorio: la instruccion debe coincidir exactamente, incluyendo el punto final. Cualquier variacion puede degradar el rendimiento.
- Dependencia de la configuracion de captura: las camaras deben mantener la misma posicion e iluminacion que durante la recopilacion de datos. Cambios en el entorno pueden causar fallos.
- Sesgo del dataset: los datos provienen de un unico brazo robotico (SO-ARM101 Pro) y un unico escenario. El modelo no ha sido evaluado en otros robots ni entornos.
- Riesgo de alucinacion en acciones: como cualquier VLA, puede generar acciones incorrectas o inconsistentes si las observaciones se alejan de la distribucion de entrenamiento.
- Licencia no especificada: no se indica la licencia del modelo fine-tuneado, lo que puede limitar su uso comercial o de redistribucion. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Tokenizer con ruta absoluta: la configuracion del modelo apunta a `/root/data/paligemma_tokenizer`; es necesario ajustar esta ruta o copiar los archivos del tokenizer al desplegar en otro sistema.
- Sin metricas de exito publicadas: no hay datos de tasa de exito en el mundo real, por lo que el rendimiento esperado en produccion es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/franecki/pi0_soarm101_full_v203_50k
- Perfil del autor: https://huggingface.co/franecki
- Dataset de entrenamiento: https://huggingface.co/datasets/franecki/pill_bottle_203
- Repositorio openpi-SO100 (fine-tuning de pi0 para SO-100/SO-101): https://github.com/Maelic/openpi-SO100
- Repositorio soarm101_openpi (proyecto openpi para SO-ARM101): https://github.com/sustechxzd/soarm101_openpi
- Sitio oficial de OpenPI: https://www.openpi.net/english.html
