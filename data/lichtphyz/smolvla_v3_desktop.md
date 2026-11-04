# lichtphyz/smolvla_v3_desktop

## Resumen
SmolVLA v3 desktop es una política visión-lenguaje-acción (VLA) derivada de `lerobot/smolvla_base` y ajustada por el usuario lichtphyz para una tarea robótica concreta: un brazo SO-101 que recoge un bloque de madera y lo deposita en una caja. El modelo consume el estado articular (6 dimensiones) y dos cámaras (frontal y de muñeca, redimensionadas a 256×256) y emite un vector de acción de 6 dimensiones a 30 Hz. Con 450 millones de parámetros, es un modelo compacto pensado para control robótico en tiempo real, no para generación de texto general.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de fine-tuning de un VLA con LeRobot sobre 125 episodios teleoperados; por otro, sirve como referencia práctica de las limitaciones de estos modelos cuando se entrenan con la receta por defecto. El autor lo presenta explícitamente como una línea base ("first, quick attempt") y no como un resultado optimizado.

La arquitectura subyacente es SmolVLA, un VLA construido sobre el backbone vision-language SmolVLM2-500M, con un experto de acción entrenado mediante flow matching. El modelo se distribuye en safetensors y se ejecuta con la librería LeRobot 0.6.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM SmolVLM2-500M + experto de acción con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompt de tarea en inglés: "Put the block in the bin.") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0.9 GB) |

## Arquitectura y entrenamiento
SmolVLA combina un backbone vision-language SmolVLM2-500M con un experto de acción que genera trayectorias mediante flow matching (10 pasos de integración en la evaluación). El modelo recibe observaciones multimodales (estado articular de 6 dimensiones y hasta tres cámaras de 256×256; en este caso se usan dos, `front` y `wrist`, mapeadas a `camera1` y `camera2`, y `camera3` se ignora porque SmolVLA omite cámaras ausentes). La salida es un chunk de 50 acciones, equivalente a 1,7 s a 30 fps.

El fine-tuning se realizó con LeRobot 0.6.2 sobre el dataset `lichtphyz/so101_block_to_bin_v3`: 125 episodios y 55.677 fotogramas a 30 fps. La composición es 100 demostraciones de block-to-bin (bloque alineado a la rejilla, dos longitudes de bloque, aproximación hover-then-descend), 15 episodios "idle" (mesa vacía o bloque ya en la caja, brazo en reposo) y 10 episodios de recuperación (fallo de agarre, reagarre y depósito). Solo se entrenó el experto de acción; el codificador visual permaneció congelado. Se usaron 40.000 pasos con batch 32 (equivalente al recetario oficial de 20k pasos con batch 64), AdamW con LR 1e-4 y decaimiento coseno hasta 2,5e-6 durante 30k pasos, semilla 1000 y aumento de imagen (brillo, contraste, saturación, tono, nitidez y una pequeña transformación afín). El entrenamiento completo llevó 4 h 53 min en una RTX 4080. No se documenta RLHF ni DPO; el ajuste es de imitación supervisada sobre demostraciones.

## Capacidades
- Control robótico de manipulación: genera comandos articulares de 6 dimensiones (5 articulaciones más pinza) para un brazo SO-101 con servos STS3215 de 12 V.
- Percepción multimodal: procesa simultáneamente estado articular y dos flujos de cámara (frontal y de muñeca) a 640×480 y 30 fps de captura, redimensionados internamente a 256×256.
- Condicionamiento por lenguaje: acepta una instrucción textual de tarea, aunque en este ajuste solo se ha entrenado con la cadena exacta "Put the block in the bin.".
- Generación de chunks de acción: produce bloques de 50 acciones (1,7 s) que permiten decodificación con chunking en tiempo real.
- Ejecución con inferencia RTC (real-time chunking): el autor documenta que con inferencia síncrona por defecto el bucle de control baja a unos 9,5 Hz y el brazo da tirones en cada frontera de chunk; con RTC se mantiene el ritmo de 30 Hz.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking; es una política de acción, no un asistente conversacional.

## Casos de uso
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recogida de bloque y depósito en caja con dos cámaras, adecuado para prototipos de manipulación con brazos SO-101 de bajo coste.
- Línea base para comparación de políticas: sirve como referencia frente a ACT y Diffusion Policy entrenados sobre el mismo dataset (el autor publica `act_v3_aug_desktop` con 9/10 y `diffusion_v3_desktop` con 8/10), lo que permite evaluar el coste/beneficio de un VLA frente a métodos clásicos de imitación.
- Investigación en VLAs de pequeño tamaño: con 450 M de parámetros y entrenamiento en una sola RTX 4080 en menos de 5 horas, es un banco de pruebas asequible para estudiar recetas de fine-tuning, aumento de imagen y chunking.
- Docencia y reproducción de experimentos: el autor publica comandos de entrenamiento, dataset y episodios de evaluación, lo que facilita replicar el pipeline completo con LeRobot.
- Evaluación de inferencia en tiempo real: útil para medir el impacto del chunking (RTC frente a síncrono) en la suavidad del control y la frecuencia efectiva del bucle.
- Recuperación de fallos de agarre: el dataset incluye 10 episodios de reagarre, de modo que el modelo puede emplearse para estudiar comportamientos de recuperación en manipulación.
- Despliegue en hardware de consumo: al caber en una GPU de portátil (RTX 4070 Laptop se cita en la evaluación), permite prototipar control robótico sin infraestructura de datacenter.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo no es de propósito general. La única métrica publicada es la evaluación en robot real:

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real (10 episodios, hasta 30 s) | 7/10 |
| Frecuencia de control con inferencia RTC | 30 Hz |
| Frecuencia de control con inferencia sincrona por defecto | ~9,5 Hz (RTX 4070 Laptop) |
| Chunk de acciones | 50 acciones (1,7 s a 30 fps) |
| Pasos de flow matching | 10 |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (0,9 GB de repo), la inferencia en fp32 rondaría 1,8 GB y en fp16/bf16 unos 0,9 GB, sin contar activaciones ni buffers de imagen.
- GPU recomendadas: el autor cita una RTX 4070 Laptop GPU para la evaluación en tiempo real y una RTX 4080 para el entrenamiento (4 h 53 min). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, según la evidencia del autor en una RTX 4070 Laptop.
- Opciones de despliegue: LeRobot 0.6.2 con `lerobot-rollout` y `--inference.type=rtc`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: con RTC se alcanza el bucle a 30 Hz; con inferencia síncrona cae a ~9,5 Hz y aparecen tirones en cada frontera de chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (tarea block-to-bin) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lichtphyz/smolvla_v3_desktop | 450 M | no disponible | 7/10 en robot real | apache-2.0 | HuggingFace |
| lichtphyz/act_v3_aug_desktop | no disponible | no disponible | 9/10 en robot real | no disponible | HuggingFace |
| lichtphyz/diffusion_v3_desktop | no disponible | no disponible | 8/10 en robot real | no disponible | HuggingFace |
| lerobot/smolvla_base | ~450 M (base) | no disponible | no disponible (modelo base) | no disponible | HuggingFace |

Los tres modelos de la comparativa se entrenaron sobre el mismo dataset (`lichtphyz/so101_block_to_bin_v3`) y se evaluaron con el mismo protocolo de 10 episodios, según la model card.

## Limitaciones y advertencias
- El propio autor lo califica como primer intento rápido, con la receta por defecto y sin ajuste específico para la tarea o el robot; debe tratarse como línea base, no como el mejor resultado posible de SmolVLA.
- Evaluación única sobre 10 episodios: la incertidumbre estadística es alta y no se reportan intervalos de confianza ni repeticiones.
- Dependencia estricta del prompt: la cadena de tarea debe coincidir exactamente con la de entrenamiento ("Put the block in the bin."), porque SmolVLA la lee como condición de lenguaje.
- Dependencia de la disposición de cámaras y del espacio de trabajo: solo funciona con una colocación de cámaras y un entorno cercanos a los datos de entrenamiento.
- Sin soporte multilingüe demostrado; no hay datos de idiomas y el prompt está en inglés.
- Riesgo de alucinación en el sentido de acciones erróneas o inseguras: como política de imitación, puede generalizar mal fuera de la distribución (posiciones de bloque, iluminación, objetos distintos) y ejecutar movimientos no válidos.
- Sesgos no documentados: no se han publicado análisis de sesgo, robustez ni seguridad.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y los datasets asociados deben verificarse por separado.
- En producción exige inferencia RTC; con el modo síncrono por defecto el control se degrada a ~9,5 Hz y el brazo da tirones.
- No es un modelo de lenguaje general: no debe emplearse para generación de texto, código, matemáticas ni tareas conversacionales.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/lichtphyz/smolvla_v3_desktop
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/lichtphyz/so101_block_to_bin_v3
- Dataset de rollouts de evaluación: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lichtphyz/rollout_smolvla_v3_desktop
- Visualizador del dataset de entrenamiento: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lichtphyz/so101_block_to_bin_v3
- Colección SO-101 block-to-bin: https://huggingface.co/collections/lichtphyz/so-101-block-to-bin-act-vs-diffusion-policy-6ad6ca5c5e111b426bb1f8a6
- Repositorio de código y lecciones aprendidas: https://github.com/Lichtphyz/so101-block-to-bin
- LeRobot: https://github.com/huggingface/lerobot
- Modelo hermano ACT: https://huggingface.co/lichtphyz/act_v3_aug_desktop
- Modelo hermano Diffusion Policy: https://huggingface.co/lichtphyz/diffusion_v3_desktop
