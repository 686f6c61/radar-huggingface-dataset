# jeremyary/push-can-act-v2

## Resumen

El modelo `jeremyary/push-can-act-v2` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado con el framework LeRobot de Hugging Face sobre un conjunto de datos teleoperado de 50 episodios (19 708 fotogramas a 30 FPS) para la tarea de empujar una lata desde una marca de inicio hasta una marca de fin. El modelo consume observaciones de tres cámaras (muñeca izquierda, cabeza y muñeca derecha) junto con el estado del robot (12 dimensiones) y produce acciones de 12 dimensiones.

Con 51,68 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en robots manipuladores. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas de imitación con LeRobot, y sirve como punto de partida para investigadores que trabajan en manipulación robótica. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer encoder-decoder |
| Parametros totales | 51 680 908 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto; ventana de observación: 3 imágenes 480x640 + estado 12 dims) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, es un modelo de control) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir un fragmento de acciones futuras (action chunk) a partir de observaciones actuales. En este caso, el encoder procesa las imágenes de tres cámaras (izquierda, derecha y cabeza) junto con el estado del robot, y el decoder genera una secuencia de acciones de 12 dimensiones. La arquitectura está implementada en PyTorch a través de la librería LeRobot.

El entrenamiento se realizó con 100 000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000. El conjunto de datos proviene de teleoperación y contiene 50 episodios de la tarea "empujar la lata desde la marca de inicio hasta la marca de fin". No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico por imitación: predice acciones de 12 dimensiones (posiciones articulares o comandos de efector final) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen (muñeca izquierda, cabeza, muñeca derecha) y el estado del robot.
- Ejecución en tiempo real: diseñado para inferencia a 30 FPS, compatible con el pipeline de LeRobot.
- Generalización limitada a la tarea específica de empuje de objetos en un entorno fijo.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades lingüísticas.

## Casos de uso

- Automatización de tareas de empuje en líneas de montaje: el modelo puede integrarse en un robot bi_so_follower para empujar piezas entre marcas predefinidas, reduciendo la intervención manual en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar métodos de action chunking frente a políticas de un solo paso, permitiendo reproducir experimentos con LeRobot.
- Desarrollo de pipelines de robótica con LeRobot: el repositorio incluye instrucciones completas para entrenar y desplegar, útil para equipos que quieran adoptar el flujo de trabajo de Hugging Face.
- Pruebas de robustez visual: al usar tres cámaras, se puede evaluar cómo afectan cambios de iluminación u oclusiones parciales al rendimiento de la política.
- Educación en robótica: un ejemplo didáctico de cómo entrenar una política de imitación con datos teleoperados y desplegarla en hardware real.
- Benchmarking de hardware: al ser un modelo pequeño (51 M parámetros), es adecuado para medir latencia y throughput en GPUs de consumo o incluso en dispositivos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas en la documentación del modelo.
- Dado el tamaño de 51,68 millones de parámetros y la entrada de tres imágenes de 480x640, se estima que la inferencia puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque esta cifra es una estimación razonable basada en el tamaño del modelo y no en datos oficiales.
- El despliegue se realiza mediante el framework LeRobot, que soporta PyTorch y CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para entrenamiento, se requiere una GPU con suficiente memoria para el lote de 8 y las imágenes; una RTX 3090 o superior sería adecuada, pero no hay confirmación oficial.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (políticas ACT entrenadas con LeRobot) en la información proporcionada. No hay métricas de rendimiento ni resultados de evaluación que permitan una comparación objetiva.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de empujar una lata entre dos marcas; no generaliza a otras tareas ni a variaciones significativas del entorno (posición de objetos, iluminación, distracciones).
- Depende de la configuración exacta de cámaras y robot (bi_so_follower); cualquier cambio en la disposición de los sensores o en la cinemática del robot puede degradar el rendimiento.
- No se han realizado evaluaciones formales en robot real; la model card indica que no hay resultados de éxito reportados.
- El conjunto de datos es pequeño (50 episodios), lo que puede limitar la robustez frente a variaciones no vistas durante el entrenamiento.
- Al ser un modelo de imitación, hereda los sesgos del operador que teleoperó los datos; no se han documentado sesgos específicos.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el hardware y el entorno cumplen con los requisitos de seguridad para robótica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jeremyary/push-can-act-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/jeremyary/push-can-test_20260828_112658
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
