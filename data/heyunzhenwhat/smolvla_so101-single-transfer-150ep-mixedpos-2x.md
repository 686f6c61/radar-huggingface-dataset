# heyunzhenwhat/smolvla_so101-single-transfer-150ep-mixedpos-2x

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para robótica. Con aproximadamente 450 millones de parámetros, se distingue por poder entrenarse en una sola GPU y desplegarse en hardware de consumo, incluidas GPUs de gama media e incluso CPU. Este modelo concreto, `heyunzhenwhat/smolvla_so101-single-transfer-150ep-mixedpos-2x`, es un fine-tuning del base `lerobot/smolvla_base` sobre un dataset específico de 150 episodios (42.950 frames) para la tarea de transferir una cinta a una zona marcada en un robot tipo `so_follower`. Se ha entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

La relevancia actual de SmolVLA radica en que democratiza el acceso a modelos de control robótico basados en VLA, que tradicionalmente requieren recursos computacionales elevados. Su arquitectura asíncrona, que separa percepción y predicción de acciones de la ejecución, permite tasas de control más altas con generación de acciones por lotes (chunked actions). Este modelo en particular es un ejemplo de fine-tuning sobre una tarea concreta, lo que demuestra la viabilidad de adaptar SmolVLA a dominios específicos con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA, con codificador multimodal y experto de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset, sin especificacion oficial) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual multi-camara, un codificador de lenguaje y un modulo de prediccion de acciones. La arquitectura se basa en un transformer que fusiona las observaciones (imagenes de camaras, estado del robot y una instruccion en lenguaje natural) para generar acciones de control. El paper original (arxiv:2506.01844) describe una pila de inferencia asincrona que desacopla la percepcion y la prediccion de la ejecucion, permitiendo mayores frecuencias de control con generacion de acciones por lotes.

Este modelo concreto es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `heyunzhenwhat/so101-single-transfer-150ep-mixedpos`. El dataset contiene 150 episodios, 42.950 frames a 30 FPS, con dos camaras (overhead y wrist) y la tarea "Move the tape into the taped area on the right". El entrenamiento se realizo con LeRobot 0.6.1, durante 20.000 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Control de robot basado en vision y lenguaje: recibe multiples vistas de camara (hasta tres, aunque en este modelo se usan dos), el estado del robot (6 dimensiones) y una instruccion textual, y produce acciones de 6 dimensiones.
- Generacion de acciones por lotes (chunked action generation) para mejorar la tasa de control.
- Inferencia asincrona que separa la percepcion de la ejecucion, reduciendo la latencia.
- Capacidad de fine-tuning sobre tareas especificas con pocos datos (150 episodios en este caso).
- Despliegue en hardware de consumo, incluidas GPUs de gama media y CPU (segun el paper).
- No se documentan capacidades de tool calling, agentes multi-paso ni razonamiento general, ya que es un modelo especializado en robótica.

## Casos de uso

- Automatizacion de tareas de manipulacion en entornos controlados: el modelo puede ejecutar tareas como transferir objetos entre zonas, basandose en instrucciones en lenguaje natural y vision por camara. Por ejemplo, en una linea de ensamblaje, podria mover piezas a una ubicacion designada.
- Robotica asistiva en laboratorios: investigadores pueden desplegar este modelo en robots economicos para experimentos de aprendizaje por imitacion, gracias a su bajo coste computacional.
- Prototipado rapido de politicas de control: al ser un fine-tuning sobre una tarea concreta, sirve como punto de partida para probar nuevas variantes de dataset o de entrenamiento sin necesidad de recursos masivos.
- Educacion en robotica: su despliegue en GPUs de consumo permite a estudiantes y desarrolladores experimentar con VLA sin infraestructura de alto rendimiento.
- Integracion en sistemas de robotica con LeRobot: al estar empaquetado con la libreria LeRobot, puede ejecutarse con comandos como `lerobot-rollout`, facilitando su integracion en pipelines existentes.
- Investigacion sobre transferencia de tareas: el nombre del modelo sugiere una configuracion de "single-transfer" y "mixedpos", lo que indica que puede ser util para estudiar la generalizacion de posiciones en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real. Por tanto, no hay datos comparativos de exito en tareas.

## Requisitos de hardware

- Al tratarse de un modelo de 450 millones de parametros, la inferencia es viable en GPUs de consumo con al menos 8 GB de VRAM, aunque no se proporcionan cifras exactas. El paper de SmolVLA menciona que puede desplegarse en GPUs de consumo e incluso CPU, pero este modelo concreto no especifica requisitos.
- GPUs recomendadas: no se indica una lista oficial, pero por el tamano del modelo, una RTX 3060, RTX 4060 o superior seria suficiente para inferencia. Para entrenamiento, el paper indica que es posible con una sola GPU (no se especifica cual).
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y de entrenamiento (`lerobot-train`). Tambien es compatible con la libreria de Hugging Face y puede cargarse con safetensors.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | no disponible | apache-2.0 | Hugging Face, fine-tuning de tarea especifica |
| OpenVLA | 7B | no disponible | MIT (investigacion) | Hugging Face, modelo general de VLA |
| RT-2 (Google) | 55B | no disponible | propietaria | no publico |

SmolVLA es significativamente mas pequeno que OpenVLA (7B) y RT-2 (55B), lo que lo hace mas adecuado para despliegue en hardware limitado. Sin embargo, no se dispone de comparativas de rendimiento directas en tareas de robotica, ya que este modelo no ha sido evaluado publicamente.

## Limitaciones y advertencias

- No hay resultados de evaluacion en robot real, por lo que su rendimiento real en tareas fisicas es desconocido.
- El modelo esta especializado en una tarea muy concreta (mover una cinta a una zona marcada) y puede no generalizar a otras tareas sin fine-tuning adicional.
- Los sesgos o alucinaciones no se han estudiado; al ser un modelo de control, el riesgo de acciones incorrectas podria tener consecuencias fisicas.
- No se especifican idiomas soportados; la instruccion del dataset esta en ingles, por lo que el uso en otros idiomas podria degradar el rendimiento.
- La licencia apache-2.0 permite uso comercial, pero se recomienda validar el comportamiento en el entorno de produccion antes de desplegarlo.
- Depende de la libreria LeRobot y de una configuracion de camaras especifica; cambios en la disposicion de camaras o en el robot pueden requerir reentrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/heyunzhenwhat/smolvla_so101-single-transfer-150ep-mixedpos-2x)
- [Dataset de entrenamiento](https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-150ep-mixedpos)
- [Paper de SmolVLA (arxiv)](https://arxiv.org/abs/2506.01844)
- [Sitio web de SmolVLA](https://smolvla.net/index_en)
- [Documentacion de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
