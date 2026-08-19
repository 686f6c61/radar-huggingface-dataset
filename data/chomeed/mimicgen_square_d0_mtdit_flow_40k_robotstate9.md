# chomeed/mimicgen_square_d0_mtdit_flow_40k_robotstate9

## Resumen

`chomeed/mimicgen_square_d0_mtdit_flow_40k_robotstate9` es una política de robótica (policy) entrenada con la librería LeRobot para la tarea de manipulación `Square_D0` del benchmark MimicGen. El modelo usa una arquitectura `multi_task_dit` (Diffusion Transformer) con objetivo de flow-matching, y ha sido entrenado durante 40.000 pasos sobre un dataset generado sintéticamente con MimicGen, que produce demostraciones a gran escala a partir de un pequeño número de demostraciones humanas. Su relevancia radica en que demuestra cómo entrenar políticas de manipulación precisas con datos generados automáticamente, reduciendo el esfuerzo humano de recolección.

El modelo opera en un espacio de estado reducido (9 dimensiones: posición del efector final, cuaternión y apertura del gripper) y utiliza únicamente observaciones visuales de dos cámaras (agentview y eye-in-hand) para el estado de los objetos. Con 248,97 millones de parámetros, es un modelo relativamente compacto que puede ejecutarse en hardware de gama media. Está publicado bajo licencia no especificada y sus pesos están en formato safetensors, listos para cargar con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-task DiT (Diffusion Transformer) con flow-matching |
| Parametros totales | 248.966.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de robótica: `n_obs_steps=2`, `n_action_steps=24`, `horizon=32`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política se basa en un transformer de difusión multi-tarea (`multi_task_dit`) con objetivo de flow-matching, una variante de los modelos de difusión que aprende a interpolar entre ruido y acciones limpias mediante un flujo continuo. El modelo recibe como entrada las observaciones de dos cámaras RGB (cada una de 3×224×224) y un vector de estado del robot de 9 dimensiones (posición del efector final, cuaternión y apertura del gripper). A diferencia de otros modelos de la misma familia, aquí el estado se pre-recorta en el dataset, eliminando las 42 dimensiones privilegiadas de los objetos, lo que permite cargar el modelo con LeRobot estándar sin campos adicionales.

El entrenamiento se realizó sobre el dataset `chomeed/mimicgen_square_d0_224x224` (generado con MimicGen), con un batch size de 64, optimizador Adam con learning rate 2e-5 y scheduler coseno, durante 40.000 pasos. La inferencia usa 100 pasos de integración Euler para generar acciones de 7 dimensiones (control OSC_POSE más gripper). Las advertencias sobre tensores inesperados en el cargador de CLIP son benignas y no afectan al funcionamiento.

## Capacidades

- Control robótico de manipulación: genera comandos de posición/orientación del efector final (OSC_POSE) y apertura del gripper (7 dimensiones de acción).
- Percepción visual multimodal: utiliza dos cámaras (agentview y eye-in-hand) para observar la escena y el objeto, sin necesidad de estado privilegiado de los objetos.
- Generación de acciones con flow-matching: produce trayectorias suaves y coherentes mediante 100 pasos de integración Euler.
- Especialización en la tarea `Square_D0` de MimicGen: inserción de una pieza cuadrada en una ranura correspondiente, con éxito evaluado por el entorno robosuite.
- Compatibilidad con LeRobot: se carga directamente con la librería estándar, sin modificaciones de configuración.
- Inferencia en bucle cerrado: con `n_obs_steps=2` y `n_action_steps=24`, el modelo puede operar en tiempo real en entornos simulados.

## Casos de uso

- Automatización de ensamblaje en simulación: el modelo puede integrarse en entornos robosuite para ejecutar la tarea de inserción de piezas cuadradas, sirviendo como banco de pruebas para algoritmos de control basados en aprendizaje.
- Generación de datos para aprendizaje por refuerzo: al ser una política entrenada con demostraciones sintéticas, puede usarse para recolectar trayectorias de alta calidad que alimenten otros algoritmos.
- Evaluación de arquitecturas de difusión en robótica: su diseño `multi_task_dit` con flow-matching permite comparar el rendimiento de diferentes objetivos de entrenamiento en tareas de manipulación.
- Transferencia a tareas similares: aunque está especializado en `Square_D0`, el mismo pipeline puede adaptarse a otras tareas de MimicGen cambiando el dataset y reentrenando, lo que lo hace útil para investigación en generalización.
- Prototipado de sistemas de control visual: al depender solo de cámaras y estado del robot, sirve como referencia para desarrollar sistemas de control basados en visión sin marcadores ni sensores adicionales.
- Benchmarking de hardware de inferencia: con ~249M de parámetros, permite medir latencia y throughput de GPUs de gama media en cargas de trabajo de robótica en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona una curva de éxito por checkpoint (`square_d0_eval_success.png`) incluida en el repositorio, pero no se proporcionan valores concretos de tasa de éxito. Se recomienda consultar esa imagen o ejecutar una evaluación propia en el entorno robosuite para obtener métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~249M parámetros con dos entradas de imagen (224×224), la inferencia en FP32 requiere aproximadamente 1-2 GB de VRAM, aunque el uso real depende del batch y de la resolución interna del transformer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060) puede ejecutar la inferencia en tiempo real; para entrenamiento se recomienda una GPU con 8-12 GB (RTX 3070/3080, A4000).
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo actuales gracias a su tamaño moderado.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con los scripts de inferencia de LeRobot, o exportar a formatos como ONNX o TorchScript para entornos de producción. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependerá del hardware y de la configuración de integración (100 pasos Euler por acción).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. La model card menciona otro modelo del mismo autor (`chomeed/mimicgen_three_piece_assembly_d0_flow_matching_prior_40k_robotstate9`) que utiliza una configuración de estado diferente (51-D con recorte interno), pero no se ofrecen métricas comparativas. Tampoco hay datos públicos de otros modelos de LeRobot para la tarea `Square_D0` en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Especialización estricta: el modelo está entrenado únicamente para la tarea `Square_D0`; no generaliza a otras tareas u objetos sin reentrenamiento.
- Dependencia del entorno simulado: la evaluación se realiza en robosuite con renderizado OSMesa; el rendimiento en el mundo real puede degradarse significativamente por el cambio de dominio.
- Estado del robot limitado: al eliminar las dimensiones privilegiadas de los objetos, el modelo depende exclusivamente de la visión; si la cámara se ocluye o la iluminación cambia, la política puede fallar.
- Licencia no especificada: no se indica una licencia clara, lo que puede limitar su uso comercial o la redistribución; se recomienda contactar al autor antes de usarlo en producción.
- Sin benchmarks cuantitativos: la ausencia de métricas publicadas dificulta evaluar su rendimiento real frente a otras políticas.
- Advertencias de carga: los mensajes sobre tensores inesperados en CLIP son benignos, pero podrían confundir a usuarios noveles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chomeed/mimicgen_square_d0_mtdit_flow_40k_robotstate9
- Página oficial de MimicGen: https://mimicgen.github.io/
- Repositorio de MimicGen (fork con documentación): https://github.com/jayahn17/mimicgen
- Dataset usado (referencia): https://huggingface.co/datasets/chomeed/mimicgen_square_d0_224x224 (no verificado en la búsqueda, se infiere de la model card)
