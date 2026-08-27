# HyeonseokE/smolvla_pull_cube_cap_1000_10fps

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) desarrollado por Hugging Face, disenado para ser compacto y eficiente, con solo 450 millones de parametros. Su objetivo principal es permitir el control robotico mediante instrucciones en lenguaje natural, ejecutable en hardware de consumo, lo que democratiza el acceso a la robotica avanzada. Este modelo concreto es un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado especificamente para la tarea de "tirar del cubo hasta el marcador objetivo" en un robot SO-101.

La relevancia de este modelo radica en su capacidad para ejecutar politicas roboticas complejas en GPUs de gama media, algo que tradicionalmente requeria hardware de alta gama. El fine-tuning se realizo con el dataset `HyeonseokE/pull_cube_cap_10fps`, que contiene 100 episodios y 31.714 fotogramas a 10 FPS, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un modelo de lenguaje y un modulo de accion para convertir observaciones visuales y estados del robot en comandos de actuacion. El modelo base fue preentrenado por Hugging Face y este repositorio contiene un fine-tuning especifico para la tarea de manipulacion de cubos. El entrenamiento se realizo con la libreria LeRobot, utilizando el optimizador AdamW con una tasa de aprendizaje de 0.0001, batch size de 64 y 24.750 pasos de entrenamiento. El dataset de entrenamiento contiene 100 episodios con 31.714 fotogramas a 10 FPS, capturados con dos camaras (superior y muneca izquierda) y estados del robot de 6 dimensiones.

El modelo consume como entrada tres imagenes de 256x256 píxeles (aunque la configuracion del robot indica dos camaras, la entrada acepta tres) y un vector de estado de 6 dimensiones, produciendo como salida un vector de accion de 6 dimensiones. El fine-tuning se realizo sobre el modelo base `lerobot/smolvla_base`, siguiendo el enfoque de aprendizaje por imitacion.

## Capacidades

- Control robotico por lenguaje natural: interpreta instrucciones como "tira del cubo hasta el marcador objetivo" y genera las acciones motoras correspondientes.
- Percepcion visual multimodal: procesa imagenes de multiples camaras (superior y muneca) para comprender el entorno.
- Aprendizaje por imitacion: entrenado mediante demostraciones humanas registradas en el dataset.
- Generacion de acciones continuas: produce vectores de accion de 6 dimensiones para control de brazo robotico.
- Despliegue en hardware de consumo: disenado para ejecutarse en GPUs de gama media, reduciendo los requisitos de hardware frente a otros VLA.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robotica, incluyendo entrenamiento, evaluacion y despliegue.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo puede controlar un brazo robotico SO-101 para tareas de empujar o tirar objetos hacia posiciones objetivo, util en entornos de investigacion en robotica.
- Automatizacion de tareas repetitivas en produccion: su capacidad para ejecutarse en hardware de consumo permite desplegar politicas de control en lineas de montaje sin necesidad de servidores GPU dedicados.
- Prototipado rapido de politicas robotica: los investigadores pueden fine-tunear este modelo base con sus propios datasets y desplegarlo en robots SO-101 en pocas horas.
- Educacion en robotica: su bajo coste computacional lo hace adecuado para laboratorios docentes donde los estudiantes pueden experimentar con VLA sin infraestructura cara.
- Investigacion en generalizacion de politicas: al ser un modelo abierto y compacto, sirve como punto de partida para estudiar la transferencia entre tareas y entornos.
- Desarrollo de asistentes roboticos domesticos: su eficiencia permite su integracion en robots de bajo coste para tareas de manipulacion sencillas en entornos domesticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion para esta politica concreta. El paper de SmolVLA (arXiv:2506.01844) reporta resultados comparativos del modelo base, pero no se dispone de datos especificos para este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero al tratarse de un modelo de 450M parametros, se estima que puede ejecutarse en GPUs con 8-12 GB de VRAM en precision FP16.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4070, o superiores. Tambien compatible con GPUs de datacenter como A10 o A100.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos principales del diseno de SmolVLA.
- Opciones de despliegue: LeRobot (oficial), con soporte para inferencia en tiempo real mediante `lerobot-rollout`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 | 55B | no disponible | propietaria | no publico |

SmolVLA se posiciona como una alternativa mucho mas ligera que OpenVLA (7B) o RT-2 (55B), sacrificando capacidad bruta por eficiencia y despliegue en hardware de consumo. No se dispone de comparativas de rendimiento directas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion limitada: este fine-tuning esta entrenado exclusivamente para la tarea de tirar de un cubo hacia un marcador; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del robot: las politicas estan calibradas para el robot SO-101 y pueden no transferirse directamente a otros brazos roboticos sin adaptacion.
- Sin resultados de evaluacion: la model card no reporta tasas de exito en el robot real, por lo que el rendimiento real no esta verificado.
- Sensibilidad a la configuracion de camaras: el modelo espera entradas de camaras especificas (superior y muneca izquierda); cambios en la disposicion pueden degradar el rendimiento.
- Riesgo de sobreajuste: entrenado con solo 100 episodios, puede no generalizar bien a variaciones en iluminacion, posiciones de objetos o distracciones.
- Licencia Apache 2.0: permite uso comercial, pero las patentes asociadas a la implementacion pueden tener implicaciones legales en algunos paises.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_pull_cube_cap_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/pull_cube_cap_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
