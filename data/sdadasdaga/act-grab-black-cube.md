# sdadasdaga/act-grab-black-cube

## Resumen

El modelo `sdadasdaga/act-grab-black-cube` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario sdadasdaga y entrenado con el framework LeRobot de Hugging Face, utilizando datos teleoperados de un robot tipo `so_follower` con una cámara frontal. El objetivo de la tarea es que el robot agarre un cubo negro, una tarea de manipulación sencilla pero representativa para validar el pipeline de entrenamiento e inferencia.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones), un tamaño reducido que lo hace adecuado para ejecutarse en hardware de consumo. Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su relevancia radica en que demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en robótica, y sirve como ejemplo de referencia para tareas similares de agarre.

Al ser un modelo de robótica, no procesa lenguaje natural, sino que recibe imágenes y estado del robot para generar comandos de acción. No se han publicado resultados de evaluación en el mundo real, por lo que su rendimiento efectivo en entornos no controlados no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT utiliza un transformer codificador-decodificador que, a partir de observaciones (imagen y estado del robot), predice un chunk de acciones futuras en lugar de una única acción. Esto permite una ejecución más estable y reduce el error acumulativo en tareas de manipulación.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre un dataset de 30 episodios teleoperados (9.000 frames a 30 FPS) de la tarea "Grab the black cube". La configuración de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control de robot manipulador para tareas de agarre de objetos (específicamente un cubo negro).
- Entrada multimodal: imagen RGB (480x640) y vector de estado del robot (6 dimensiones).
- Salida de acciones continuas (6 dimensiones) que representan comandos de movimiento.
- Capacidad de ejecución en tiempo real con el robot `so_follower` mediante el comando `lerobot-rollout`.
- Integración nativa con el ecosistema LeRobot, lo que facilita la reproducción y adaptación.
- No soporta tool calling, agentes ni razonamiento multi-step en el sentido de los modelos de lenguaje; su "razonamiento" se limita a la predicción de acciones.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede integrarse en un brazo robótico para agarrar y mover piezas en un entorno controlado, reduciendo la intervención humana.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de distintos hiperparámetros, arquitecturas o tamaños de dataset en tareas de manipulación.
- Prototipado rápido de políticas robóticas: gracias a su pequeño tamaño y al flujo de LeRobot, permite validar rápidamente nuevas tareas de agarre con pocos datos (30 episodios).
- Entrenamiento de operarios en robótica colaborativa: el modelo puede utilizarse en entornos educativos para demostrar cómo se entrena y despliega una política de control.
- Benchmarking de hardware: al ser ligero (51,7M parámetros), es útil para comparar el rendimiento de diferentes GPUs o dispositivos embebidos en inferencia robótica.
- Base para fine-tuning: el checkpoint puede adaptarse a nuevas tareas de agarre con objetos de distinta forma o color mediante transferencia de aprendizaje, siempre que se disponga de datos teleoperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. Por tanto, no es posible comparar cuantitativamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~51,7M parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 200 MB de pesos). Cualquier GPU moderna con al menos 2 GB de VRAM es suficiente.
- GPUs recomendadas: tarjetas de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060 o superiores. También puede ejecutarse en CPU para pruebas lentas, aunque no es recomendable para tiempo real.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU de gama media actual.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, por lo que se ejecuta mediante el comando `lerobot-rollout` en un robot compatible. También puede cargarse con PyTorch y safetensors para inferencia personalizada.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño, se espera una latencia de milisegundos en GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

Existen otros modelos ACT en Hugging Face para tareas similares, como `tobdeu/act_black_cube_v2` y `AdilZtn/act_grab_red_cube_main_long_migrated_pre_post_12`. Sin embargo, no se dispone de información detallada sobre sus parámetros, rendimiento o configuración de entrenamiento, por lo que no es posible realizar una comparación técnica rigurosa. A continuación se muestra una tabla con los datos disponibles:

| Modelo | Parametros | Tarea | Licencia | Evaluacion |
|---|---|---|---|---|
| sdadasdaga/act-grab-black-cube | 51.668.614 | Agarrar cubo negro | Apache 2.0 | No publicada |
| tobdeu/act_black_cube_v2 | No disponible | Agarrar cubo negro | No disponible | No disponible |
| AdilZtn/act_grab_red_cube_main_long_migrated_pre_post_12 | ~51.7M (estimado) | Agarrar cubo rojo | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Grab the black cube" con un robot `so_follower` y una cámara frontal. No generaliza a otros objetos, posiciones o configuraciones de cámara sin un fine-tuning adicional.
- No hay resultados de evaluación en robot real, por lo que su tasa de éxito en condiciones no controladas es desconocida. Podría presentar sobreajuste al dataset de entrenamiento (30 episodios).
- La dependencia de la posición de la cámara y la iluminación puede afectar significativamente el rendimiento en entornos diferentes.
- Al ser un modelo de imitación, hereda los sesgos de las demostraciones teleoperadas (por ejemplo, trayectorias subóptimas del operador).
- No se han documentado riesgos de seguridad específicos, pero cualquier despliegue en robots físicos debe realizarse con supervisión humana y medidas de seguridad adecuadas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asegurarse de cumplir con las condiciones de atribución si redistribuye el modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sdadasdaga/act-grab-black-cube)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sdadasdaga/grab-black-cube-30ep_20260819_183734)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
