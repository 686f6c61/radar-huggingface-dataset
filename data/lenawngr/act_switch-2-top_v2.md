# lenawngr/ACT_switch-2-top_v2

## Resumen

El modelo `lenawngr/ACT_switch-2-top_v2` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más estable y preciso en tareas de manipulación. Este modelo concreto ha sido entrenado sobre el dataset `lenawngr/SWITCH-2-top`, que parece corresponder a una tarea de manipulación de un interruptor (posiblemente de una consola Nintendo Switch 2, aunque no se especifica en la documentación).

Con 51,6 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en robots con recursos limitados. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. La relevancia de este modelo radica en su demostración de cómo entrenar políticas de imitación de bajo coste con LeRobot, un ecosistema open source que facilita la reproducción y el despliegue en hardware robótico asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con decodificador autoregresivo |
| Parametros totales | 51.595.910 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de chunks de acciones) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (modelo de control robotico, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un transformer con un decodificador autoregresivo para predecir una secuencia de acciones futuras (un "chunk") a partir de observaciones actuales. A diferencia de los metodos que predicen una sola accion por paso, ACT genera un bloque de acciones que el robot ejecuta de forma continua, lo que reduce la acumulacion de errores y mejora la suavidad del movimiento. El modelo se entrena con datos teleoperados, es decir, demostraciones realizadas por un humano que controla el robot de forma remota.

El entrenamiento se ha realizado con LeRobot, la libreria de Hugging Face para robotica, que proporciona pipelines estandarizados para entrenamiento, evaluacion y despliegue. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de refinamiento como RLHF o DPO. El dataset `lenawngr/SWITCH-2-top` contiene las demostraciones utilizadas, pero su tamano y contenido especifico no estan documentados en la informacion disponible.

## Capacidades

- Control robotico por imitacion: el modelo aprende a replicar acciones demostradas, generando secuencias de comandos para actuadores (por ejemplo, posiciones de articulaciones o velocidades).
- Prediccion de chunks de acciones: en lugar de emitir una accion por paso, genera bloques de acciones que permiten un movimiento mas fluido y robusto.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y evaluacion de LeRobot, incluyendo robots como SO-100 y otros soportados.
- Ejecucion en tiempo real: gracias a su tamano reducido (51M parametros), puede ejecutarse en hardware embebido o GPUs de gama baja con latencia baja.
- No soporta procesamiento de lenguaje natural, vision general ni tool calling: es un modelo puramente motor, especializado en una tarea de manipulacion concreta.

## Casos de uso

- Automatizacion de tareas repetitivas en laboratorio: el modelo puede controlar un brazo robotico para accionar interruptores o botones en entornos de prueba, liberando a los investigadores de tareas manuales.
- Prototipado rapido de politicas robotica: gracias a LeRobot, se puede entrenar y desplegar este modelo en pocas horas sobre un robot SO-100, ideal para validar conceptos de manipulacion.
- Educacion en robotica: sirve como ejemplo didactico de aprendizaje por imitacion con ACT, permitiendo a estudiantes reproducir el entrenamiento y observar el comportamiento resultante.
- Control de robots de bajo coste: al ser un modelo ligero, puede ejecutarse en un mini PC o una GPU integrada, reduciendo el coste total del sistema robotico.
- Investigacion en generalizacion de tareas: el modelo puede servir como punto de partida para estudiar la transferencia de politicas entre diferentes configuraciones de interruptores o entornos.
- Demostraciones en ferias o eventos: un robot equipado con este modelo puede realizar la tarea de encender/apagar un interruptor de forma autonoma, mostrando capacidades de IA en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de tasas de exito, metricas de precision ni comparaciones con otros modelos en el repositorio ni en la documentacion asociada.

## Requisitos de hardware

- VRAM estimada: con 51,6M parametros, el modelo en FP32 ocupa aproximadamente 206 MB; en FP16, unos 103 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (por ejemplo, GTX 1650, RTX 3060, RTX 4090) o incluso CPU para inferencia no critica en tiempo real.
- Compatibilidad con consumer GPU: si, es totalmente viable en hardware de consumo.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia; tambien se puede exportar a ONNX o TensorRT para optimizacion, aunque no se documenta en el repositorio.
- Latencia y throughput: no se dispone de mediciones oficiales, pero dado el tamano del modelo, se espera una latencia inferior a 10 ms en una GPU moderna y un throughput suficiente para control en tiempo real (tipicamente 10-50 Hz).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para esta tarea. ACT es un metodo conocido en la comunidad de robotica, y existen alternativas como Diffusion Policy o Behavior Transformers, pero no hay datos publicados que permitan una comparacion cuantitativa con este modelo concreto. Se recomienda consultar la literatura de ACT (arxiv:2304.13705) para referencias generales.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para una tarea concreta (accionar un interruptor) y no generaliza a otras tareas sin reentrenamiento.
- Dependencia de datos teleoperados: la calidad del comportamiento depende directamente de la calidad y diversidad de las demostraciones del dataset `lenawngr/SWITCH-2-top`.
- Sin informacion sobre sesgos: no se han documentado sesgos especificos, pero al ser un modelo de imitacion, puede replicar sesgos presentes en las demostraciones (por ejemplo, variaciones en la velocidad o trayectoria del operador).
- Riesgo de alucinacion: no aplica, ya que no genera texto ni contenido simbolico; el riesgo se limita a acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de contexto (numero de observaciones y acciones) no esta documentada; puede afectar a la robustez en entornos dinamicos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las patentes asociadas. No hay restricciones adicionales conocidas.
- Para produccion: se recomienda validar el modelo en el robot real antes de un despliegue autonomo, y considerar mecanismos de seguridad (parada de emergencia) dado que es un sistema fisico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lenawngr/ACT_switch-2-top_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/SWITCH-2-top
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arxiv:2304.13705)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
