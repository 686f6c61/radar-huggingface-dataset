# ResidentEvian/act_100_episodes_varying_pos

## Resumen

`ResidentEvian/act_100_episodes_varying_pos` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada en HuggingFace Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor entrenado para una tarea robótica concreta de manipulación —coger un cubo azul y depositarlo en una caja naranja con posiciones variables— sobre un robot de tipo `so_follower` (Standard Open Arm, formato SO-100/SO-101 de LeRobot). El modelo consume el estado articular de 6 dimensiones y dos flujos de imagen RGB de 480×640 (cámara superior y cámara de muñeca), y produce un vector de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un peso de repositorio de 0,2 GB en formato safetensors, lo que lo hace extremadamente ligero y desplegable en hardware de consumo. Fue entrenado con 100 episodios de teleoperación (51.805 fotogramas a 30 FPS) durante 20.000 pasos con AdamW y learning rate de 1e-05, usando LeRobot 0.6.1. La licencia es Apache 2.0, sin restricciones para uso comercial.

Su relevancia es la de un ejemplo reproducible de pipeline de imitation learning de extremo a extremo: dataset público, configuración de entrenamiento documentada y comando de rollout listo para ejecutar. No obstante, es una política de un solo autor, con cero likes y sin resultados de evaluación publicados, por lo que debe tratarse como una referencia técnica más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ACT predice chunks de acción) |
| Tipos de cuantizacion | no disponible (pesos safetensors en FP32/BF16 según checkpoint de LeRobot) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error compuesto y mejora la estabilidad en tareas de manipulación. La arquitectura combina un backbone visual (encoder de imágenes) con un transformer que fusiona las observaciones —estado de 6 dimensiones y dos cámaras RGB de 480×640— y genera el vector de acción de 6 dimensiones. El modelo fue entrenado desde cero con el dataset `ResidentEvian/blue-cube-into-box-varying-position_20261015_123135`, compuesto por 100 episodios y 51.805 fotogramas a 30 FPS, con la instrucción de tarea "Grab the blue cube and put it in the orange box, varying positions".

La configuración de entrenamiento documentada es: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.1. No se especifica el número de tokens de entrenamiento (no aplica), la composición detallada del dataset más allá de los episodios y fotogramas, ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco se documentan innovaciones técnicas más allá del propio método ACT (chunking de acciones, que es la contribución central del paper arXiv:2304.13705).

## Capacidades

- Control visomotor de manipulación robótica: coger un cubo azul y depositarlo en una caja naranja, con variación de posiciones.
- Fusión de estado propioceptivo (6 dimensiones) y dos cámaras RGB (superior y de muñeca) a 480×640.
- Predicción de chunks de acción de 6 dimensiones para el robot `so_follower`.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia `base`.
- Entrenamiento reproducible con `lerobot-train` y `--policy.type=act`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades más allá del control robótico específico.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta la secuencia de coger el cubo azul y soltarlo en la caja naranja, útil como banco de pruebas para validar hardware SO-100/SO-101 y el pipeline de LeRobot antes de escalar a tareas más complejas.
- **Reproducción de experimentos de imitation learning**: al estar el dataset y la configuración de entrenamiento publicados, sirve para replicar resultados de ACT y comparar hiperparámetros (pasos, batch size, learning rate) en un entorno controlado.
- **Base para fine-tuning en tareas de manipulación similares**: con 51,7 M de parámetros y 0,2 GB de pesos, se puede reentrenar o ajustar con un dataset propio de pocos centenares de episodios en una GPU de consumo.
- **Docencia y formación en robótica**: ejemplo completo de flujo teleoperación → dataset → entrenamiento → rollout, con comandos CLI documentados, adecuado para cursos prácticos de robot learning.
- **Validación de pipelines de datos**: el dataset de 100 episodios y 51.805 fotogramas permite probar herramientas de visualización, conversión y aumento de datos de LeRobot sin necesidad de grabar datos propios.
- **Prototipado de controladores en simulación o hardware de bajo coste**: al ser Apache 2.0 y ligero, se puede integrar en entornos de investigación con presupuesto limitado para experimentar con políticas ACT antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; con 51,7 M de parámetros y pesos en FP32, el modelo ocupa aproximadamente 0,2 GB, por lo que la VRAM necesaria es muy reducida (por debajo de 2 GB incluyendo buffers de imagen y activaciones).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; se documenta soporte para `--policy.device=cuda`. Una RTX 3060, RTX 4060 o superior es más que suficiente.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU para inferencia (aunque la latencia será mayor).
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput estimados**: no disponibles. Al operar a 30 FPS con dos cámaras de 480×640, el cuello de botella probable es la captura y el preprocesado de imagen más que el propio modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ResidentEvian/act_100_episodes_varying_pos` | 51,7 M | no aplica | Pick-and-place cubo azul en caja naranja | Apache 2.0 | HuggingFace Hub, 35 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Tareas de manipulación diversas | Apache 2.0 (LeRobot) | HuggingFace Hub / documentación LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación visomotora | Apache 2.0 (LeRobot) | HuggingFace Hub / documentación LeRobot |
| Políticas VQ-BeT / TDMPC (LeRobot) | no disponible | no aplica | Manipulación y control | Apache 2.0 (LeRobot) | HuggingFace Hub / documentación LeRobot |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica fiable con estas alternativas; la comparación es únicamente cualitativa y basada en la disponibilidad documentada.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito ni ensayos documentados, por lo que se desconoce su fiabilidad real en el robot objetivo.
- **Alta especificidad de tarea**: entrenado exclusivamente para "coger el cubo azul y ponerlo en la caja naranja con posiciones variables"; no generaliza a otras tareas, objetos o colores sin reentrenamiento.
- **Dependencia del hardware**: diseñado para `so_follower` con cámaras `top` y `wrist` a 480×640 y 30 FPS; cambios de cámara, resolución o montaje pueden degradar el rendimiento.
- **Dataset pequeño**: 100 episodios y 51.805 fotogramas es un volumen modesto; puede presentar sobreajuste a condiciones de iluminación, fondo y posiciones vistas en entrenamiento.
- **Riesgo de alucinación de acciones**: como toda política de imitación, puede generar comandos plausibles pero incorrectos ante observaciones fuera de distribución, sin mecanismo de verificación interno.
- **Sesgos**: no documentados; al ser un modelo robótico, los sesgos relevantes serían los del dataset de teleoperación (posiciones, iluminación, operador), no sesgos lingüísticos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- **Madurez**: 0 likes y 35 descargas, creado y actualizado el mismo día (2026-10-25), sin historial de mantenimiento; tratarlo como artefacto de investigación, no como componente de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ResidentEvian/act_100_episodes_varying_pos
- Dataset de entrenamiento: https://huggingface.co/datasets/ResidentEvian/blue-cube-into-box-varying-position_20261015_123135
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ResidentEvian/blue-cube-into-box-varying-position_20261015_123135
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
