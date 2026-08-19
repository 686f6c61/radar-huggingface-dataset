# peter1111aaaa/my_smolVLA_new_v1

## Resumen
El modelo `peter1111aaaa/my_smolVLA_new_v1` es un fine-tuning del modelo base `lerobot/smolvla_base`, un vision-language-action (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. Este checkpoint concreto ha sido entrenado por el usuario peter1111aaaa para tareas de manipulación robótica con un robot tipo `omx_follower` equipado con tres cámaras. El problema que resuelve es el control robótico basado en instrucciones en lenguaje natural y observaciones visuales, permitiendo ejecutar tareas como recoger objetos y depositarlos en una cesta. Su relevancia radica en que SmolVLA está diseñado para funcionar en hardware de consumo, lo que democratiza el acceso a la robótica avanzada. El modelo tiene 450.046.176 parámetros, se distribuye en formato safetensors y está bajo licencia Apache 2.0.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | `lerobot/smolvla_base` |
| Robot objetivo | omx_follower |
| Camaras | front, wrist (tres vistas en total) |
| Tamano del repo | 0.9 GB |

## Arquitectura y entrenamiento
SmolVLA combina un codificador visual, un modelo de lenguaje y un experto de acciones. Este fine-tuning parte del checkpoint preentrenado `lerobot/smolvla_base` y se entrena con el dataset `peter1111aaaa/omx-smolvla-dataset_20260813_142158`, que contiene 271 episodios y 103.712 fotogramas a 30 FPS. Las entradas incluyen el estado del robot (6 dimensiones) y tres vistas de camara de 256x256, mientras que la salida es una accion de 6 dimensiones. El entrenamiento se realizo con 50.000 pasos, batch size 8, optimizador AdamW y tasa de aprendizaje 0.0001, usando la libreria LeRobot 0.6.2. No se mencionan tecnicas como RLHF o DPO; se trata de un fine-tuning supervisado de imitacion.

## Capacidades
- Generacion de acciones de control robotico a partir de observaciones visuales y estado del robot.
- Interpretacion de instrucciones en lenguaje natural para tareas de manipulacion.
- Procesamiento de multiples vistas de camara (tres en este modelo).
- Especializacion en tareas de recogida y colocacion de objetos en cestas, segun el dataset de entrenamiento.
- Integracion con el ecosistema LeRobot para entrenamiento y despliegue.
- No soporta tool calling ni agentes conversacionales; su funcion es exclusivamente robotica.

## Casos de uso
- Manipulacion domestica: el robot puede recoger objetos como bananas, galletas o helados y colocarlos en una cesta siguiendo instrucciones en lenguaje natural.
- Limpieza de superficies: tareas como "clean up the table" o "clear the workspace" permiten usar el modelo para ordenar mesas de forma autonoma.
- Preparacion de pedidos en almacenes: el modelo puede clasificar productos en cestas segun la instruccion recibida, agilizando procesos de picking.
- Automatizacion de tareas repetitivas en lineas de montaje: al ser un fine-tuning especifico, puede desplegarse para operaciones de pick-and-place.
- Investigacion en robotica: sirve como base para probar algoritmos de aprendizaje por imitacion y control en hardware asequible.
- Educacion: permite a estudiantes experimentar con VLA en robots de bajo coste sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks especificos para este fine-tuning en la informacion disponible. El modelo base SmolVLA reporta resultados en el paper (arXiv:2506.01844), pero no se proporcionan datos concretos para esta variante. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware
- Con 450 millones de parametros, el modelo puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM en FP16 (los pesos ocupan aproximadamente 0.9 GB, mas overhead de activaciones).
- GPUs recomendadas: RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10 o L4.
- Es adecuado para inferencia en tiempo real en robots con hardware embebido como Jetson Orin.
- Opciones de despliegue: LeRobot ofrece scripts de rollout, y el modelo puede exportarse a formatos como ONNX o TensorRT para optimizacion.
- Latencia estimada: no disponible, pero al ser compacto se espera que sea inferior a 100 ms por paso en una GPU moderna.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (base) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Propietaria | No publica |

SmolVLA es significativamente mas pequeno que OpenVLA y RT-2, lo que lo hace mas adecuado para despliegue en edge. Sin embargo, no se dispone de comparativas de rendimiento directas en este documento.

## Limitaciones y advertencias
- El modelo esta entrenado para un conjunto especifico de tareas (recogida y colocacion de objetos) y puede no generalizar a otras tareas sin fine-tuning adicional.
- No se especifican los idiomas soportados; probablemente este entrenado principalmente en ingles, dado el dataset.
- Al ser un modelo de imitacion, puede alucinar acciones si las observaciones difieren del dominio de entrenamiento.
- No se han documentado sesgos, pero es recomendable evaluar el comportamiento en entornos variados.
- La licencia Apache 2.0 permite uso comercial, pero hay que verificar las restricciones de los modelos base y datasets utilizados.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal y no ha sido validado por la comunidad.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/peter1111aaaa/my_smolVLA_new_v1)
- [Paper SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Blog de Hugging Face sobre SmolVLA](https://huggingface.co/blog/smolvla)
- [Documentacion de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Dataset de entrenamiento](https://huggingface.co/datasets/peter1111aaaa/omx-smolvla-dataset_20260813_142158)
