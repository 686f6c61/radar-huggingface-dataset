# HyeonseokE/smolvla_phase1_pick_place_A2_via4cm_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. Este repositorio concreto contiene un fine-tuning de la base `lerobot/smolvla_base` para una tarea específica de robótica: recoger un bloque rojo y colocarlo en un plato azul. El modelo tiene 450 millones de parámetros, lo que lo hace adecuado para hardware de consumo. Está entrenado con el framework LeRobot y utiliza un dataset de 100 episodios grabados a 10 FPS con tres cámaras (superior, muñeca izquierda y otra). Su relevancia radica en que demuestra cómo un VLA pequeño puede ejecutar tareas de manipulación robótica con un coste computacional reducido, facilitando su despliegue en robots reales sin necesidad de GPUs de alta gama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. En este caso, el modelo se ha fine-tuneado desde `lerobot/smolvla_base` para la tarea especifica de pick-and-place. El entrenamiento se realizo con el framework LeRobot, utilizando un dataset de 100 episodios (28.755 frames) a 10 FPS, con observaciones de estado (6 dimensiones) y tres imagenes de camaras (256x256 pixeles). La configuracion de entrenamiento incluye 22.450 pasos, batch size de 64, optimizador AdamW y learning rate de 0,0001. No se especifica el uso de RLHF o DPO; es un fine-tuning supervisado de imitacion.

## Capacidades

- Control robotico de manipulacion: el modelo genera acciones de 6 dimensiones (posiciones articulares) para un robot tipo `so101_follower`.
- Percepcion visual multimodal: procesa tres imagenes de camaras (superior, muñeca izquierda y otra) para entender la escena.
- Ejecucion de tareas de pick-and-place: especificamente entrenado para recoger un bloque rojo y colocarlo en un plato azul.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para robotica, permitiendo entrenamiento y despliegue sencillo.
- Bajo coste computacional: con 450M parametros, puede ejecutarse en GPUs de consumo.
- No es un modelo de lenguaje general: no soporta generacion de texto libre ni conversacion.

## Casos de uso

- Automatizacion de tareas de ensamblaje en lineas de produccion: el modelo puede controlar un brazo robotico para recoger y colocar piezas en posiciones especificas, gracias a su capacidad de percibir la escena con camaras y generar acciones precisas.
- Robotica educativa: al ser ligero y de codigo abierto, es ideal para laboratorios universitarios que quieran experimentar con VLA sin necesidad de infraestructura costosa.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para fine-tuning en nuevas tareas, ya que su tamaño reducido permite iterar rapidamente.
- Prototipado de soluciones roboticas en entornos simulados: puede desplegarse en simuladores como Isaac Sim para validar comportamientos antes de pasar al hardware real.
- Asistencia en almacenes: tareas de recogida y colocacion de objetos en cajas o estanterias, donde la precision y la velocidad son criticas.
- Desarrollo de robots domesticos: su bajo consumo permite integrarlo en robots de bajo coste para tareas como ordenar objetos o preparar mesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada: con 450M parametros, el modelo en FP16 ocupa aproximadamente 0,9 GB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna de consumo, como NVIDIA RTX 3060, RTX 4060, RTX 4090, o incluso GPUs integradas con suficiente memoria.
- Despliegue: compatible con LeRobot, que soporta inferencia en PyTorch. Tambien puede usarse con vLLM si se adapta, aunque no es lo habitual para modelos de robotica.
- Latencia: no disponible, pero al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos por inferencia en GPU moderna).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| SmolVLA (este) | 450M | no disponible | Apache-2.0 | Robotica pick-and-place |
| OpenVLA | 7B | no disponible | MIT | Robotica general |
| RT-2 | 55B | no disponible | no abierto | Robotica general |

SmolVLA es significativamente mas pequeño que OpenVLA y RT-2, lo que lo hace mas accesible para hardware de consumo, aunque su especializacion en una tarea concreta limita su generalidad.

## Limitaciones y advertencias

- Especializacion excesiva: el modelo solo ha sido entrenado para una tarea concreta (pick-and-place de un bloque rojo en un plato azul). No generaliza a otras tareas sin fine-tuning adicional.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad del dataset de entrenamiento, que solo incluye 100 episodios.
- Sin evaluacion publicada: no hay resultados de exito en robot real, por lo que su fiabilidad en produccion no esta demostrada.
- Requiere configuracion especifica: las camaras y el robot deben coincidir con los utilizados en el entrenamiento (so101_follower, camaras top y left_wrist).
- Posibles sesgos: el dataset puede tener sesgos en la posicion de los objetos, iluminacion o fondo, lo que afectaria al rendimiento en entornos diferentes.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales (verificar).

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A2_via4cm_1000_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A2_10fps_via4cm
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
