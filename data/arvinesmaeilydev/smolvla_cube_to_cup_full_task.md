# arvinesmaeilydev/smolvla_cube_to_cup_full_task

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico mediante aprendizaje por imitación. Este repositorio concreto contiene un fine-tuning del modelo base `lerobot/smolvla_base` para la tarea de recoger un cubo y colocarlo en un recipiente, entrenado con 50 episodios de demostración teleoperadas. El modelo combina un encoder de visión SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que predice las acciones del robot, todo ello con aproximadamente 450 millones de parámetros.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede fine-tunearse con pocos datos (50 episodios) para tareas robóticas específicas, manteniendo un rendimiento competitivo y siendo desplegable en hardware de consumo. El entrenamiento se realizó con la librería LeRobot, lo que facilita la reproducción y el despliegue en robots reales tipo SO-101 (so_follower). El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (SigLIP vision encoder + SmolLM2 language model + action expert) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-language-action que combina tres componentes principales: un encoder de vision SigLIP que procesa imagenes de camaras, un modelo de lenguaje SmolLM2 que interpreta instrucciones y razona sobre la escena, y un action expert que decodifica las acciones del robot. La arquitectura esta disenada para ser eficiente y desplegable en hardware de consumo, a diferencia de modelos VLA mas grandes como RT-2 o OpenVLA. En este fine-tuning, el vision encoder y el modelo de lenguaje permanecen congelados, y solo se entrenan el action expert y las proyecciones, aproximadamente 50 millones de parametros.

El entrenamiento se realizo con el dataset `arvinesmaeilydev/PickUpTheCube_50`, que contiene 50 episodios y 19.419 frames a 30 FPS, capturados con tres camaras (256x256 píxeles) en un robot SO-101. La configuracion de entrenamiento incluye 20.000 pasos, batch size de 4, optimizador AdamW con learning rate de 0.0001 y semilla 1000. El modelo se entreno con la libreria LeRobot version 0.6.1, que proporciona el pipeline completo de recoleccion de datos, entrenamiento y despliegue.

## Capacidades

- Control robótico por imitación: el modelo predice acciones de 6 grados de libertad (posicion y orientacion del efector final) a partir de observaciones visuales y del estado del robot.
- Percepcion visual multi-camara: procesa simultaneamente tres flujos de imagen a 256x256 píxeles, lo que permite al robot localizar objetos y planificar movimientos.
- Ejecucion de tareas de pick-and-place: especificamente entrenado para recoger un cubo y colocarlo en un recipiente, con generalizacion a posiciones aleatorizadas del objeto.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo despliegue con `lerobot-rollout` y entrenamiento con `lerobot-train`.
- Fine-tuning eficiente: al congelar el encoder de vision y el modelo de lenguaje, el entrenamiento requiere solo ~50M de parametros entrenables, lo que reduce significativamente los requisitos de computo.
- Inferencia en tiempo real: disenado para operar a 30 FPS en hardware de consumo, adecuado para control robótico en bucle cerrado.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo puede integrarse en estaciones de trabajo roboticas para tareas repetitivas de recogida y colocacion de objetos, reduciendo el tiempo de ciclo frente a la teleoperacion manual.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de fine-tuning eficiente de VLA con pocos datos, comparando el rendimiento frente a metodos como ACT o Diffusion Policy.
- Prototipado rapido de tareas roboticas: con solo 50 episodios de demostracion, un investigador puede adaptar el modelo a nuevas tareas en menos de un dia de entrenamiento en una GPU consumer.
- Educacion en robótica: el modelo y su pipeline de entrenamiento completo (dataset, codigo, documentacion) permiten a estudiantes reproducir un sistema de manipulacion robótica de principio a fin.
- Benchmarking de VLA en hardware asequible: al ser un modelo de 450M de parametros, puede ejecutarse en GPUs como RTX 3060 o 4090, lo que permite comparar el rendimiento de VLA sin necesidad de infraestructura de datacenter.
- Desarrollo de sistemas de manipulacion con generalizacion limitada: para entornos controlados donde la variabilidad es acotada (posiciones fijas de objetos, iluminacion constante), el modelo ofrece una solucion robusta y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas como tasa de exito en la tarea, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero al ser un modelo de 450M de parametros, se estima que requiere entre 2 y 4 GB de VRAM en FP32, y menos de 2 GB con cuantizacion.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo esta disenado explicitamente para desplegarse en hardware de consumo.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar el modelo en robot real. Tambien es compatible con el ecosistema Hugging Face (transformers, safetensors).
- Latencia y throughput: no disponible, pero el diseno apunta a operar a 30 FPS en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | no disponible | VLA para imitacion | Apache 2.0 | Hugging Face |
| ACT (Action Chunking Transformer) | ~80M | no aplica | Transformer para imitacion | MIT | Codigo abierto |
| OpenVLA | 7B | no disponible | VLA generalista | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | VLA generalista | Propietaria | No publico |

SmolVLA se posiciona como una alternativa de menor tamano frente a OpenVLA (7B) y RT-2 (55B), sacrificando generalidad por eficiencia y despliegue en hardware asequible. Frente a ACT, que es un modelo puramente de imitacion sin componente de lenguaje, SmolVLA anade razonamiento visual-linguistico, lo que puede mejorar la generalizacion a variaciones de la tarea.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo se entreno con solo 50 episodios de un unico robot (SO-101) y una unica tarea, por lo que no generalizara a otros robots, camaras o tareas sin fine-tuning adicional.
- Riesgo de alucinacion en acciones: como cualquier modelo de aprendizaje por imitacion, puede producir acciones incorrectas ante observaciones fuera de la distribucion de entrenamiento (nuevas posiciones de objetos, cambios de iluminacion, objetos desconocidos).
- Limitaciones de generalizacion: el modelo no es un VLA generalista; esta especializado en la tarea "pick up the cube" y no debe usarse para otras tareas sin reentrenamiento.
- Sin evaluacion en robot real: la model card no reporta resultados de evaluacion fisica, por lo que el rendimiento real en el robot no esta verificado.
- Dependencia de calibracion: el despliegue requiere que las camaras y el robot esten calibrados de forma consistente con el dataset de entrenamiento; cambios en la disposicion fisica degradaran el rendimiento.
- Idioma: al ser un modelo de robótica, no soporta interaccion en lenguaje natural; las instrucciones se codifican como tareas discretas en el dataset.

## Enlaces

- Repositorio del modelo: https://huggingface.co/arvinesmaeilydev/smolvla_cube_to_cup_full_task
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_50
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Blog de fine-tuning de SmolVLA en SO-101: https://ggando.com/blog/smolvla-so101/
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_50
