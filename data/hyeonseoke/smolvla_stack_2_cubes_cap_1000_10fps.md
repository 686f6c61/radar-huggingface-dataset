# HyeonseokE/smolvla_stack_2_cubes_cap_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y la comunidad, que combina un modelo de lenguaje y visión (VLM) preentrenado con un experto de acciones entrenado mediante flow matching. Este modelo concreto, `HyeonseokE/smolvla_stack_2_cubes_cap_1000_10fps`, es un fine-tune de la base `lerobot/smolvla_base` realizado con LeRobot, especializado en la tarea de apilar un cubo verde sobre uno rojo con un robot manipulador SO-101.

El modelo resuelve el problema de control robótico por imitación a partir de instrucciones en lenguaje natural y observaciones visuales de múltiples cámaras. Su relevancia radica en que, con solo 450 millones de parámetros, puede ejecutarse en hardware de consumo, democratizando el acceso a la robótica basada en aprendizaje. Está entrenado con 100 episodios y 37 245 fotogramas a 10 FPS, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con VLM compacto y experto de acciones con flow matching |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un modelo de lenguaje y visión (VLM) compacto preentrenado, que procesa las imágenes de las cámaras y la instrucción textual, y de un experto de acciones entrenado con flow matching. Dadas varias imágenes y una instrucción en lenguaje natural, el modelo genera un chunk de acciones de 6 dimensiones que controlan el robot. La arquitectura está diseñada para ser eficiente y ejecutable en hardware de consumo, incorporando una pila de inferencia asíncrona para aumentar la tasa de control.

Este fine-tune se entrenó con LeRobot (versión 0.6.0) sobre el dataset `HyeonseokE/stack_2_cubes_cap_10fps`, que contiene 100 episodios y 37 245 fotogramas a 10 FPS de la tarea "Stack the green block on the red block". La configuración de entrenamiento incluye 29 050 pasos, batch size de 64, optimizador AdamW, learning rate de 0.0001 y semilla 1000. El modelo parte de los pesos de `lerobot/smolvla_base` y se fine-tunea para la tarea específica.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para apilar cubos, a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa tres imágenes de 256x256 píxeles (cámara superior, muñeca izquierda y una tercera cámara) junto con el estado del robot (6 valores).
- Instrucción en lenguaje natural: interpreta la tarea descrita textualmente, como "Stack the green block on the red block".
- Generación de chunks de acciones: produce secuencias de acciones (6 dimensiones) mediante flow matching, permitiendo un control suave y continuo.
- Fine-tune específico de tarea: adaptado a una tarea concreta de apilado, con capacidad de generalización limitada a variaciones del mismo escenario.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo scripts de rollout y entrenamiento.

## Casos de uso

- Automatización de tareas de apilado en laboratorios de robótica: el modelo puede controlar un robot SO-101 para apilar cubos de colores, sirviendo como banco de pruebas para algoritmos de imitación.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del fine-tune de un VLA base sobre una tarea específica, comparando rendimiento y robustez.
- Benchmarking de VLA en hardware de consumo: al tener solo 450M de parámetros, es ideal para evaluar la viabilidad de modelos de control robótico en GPUs de gama media.
- Desarrollo de asistentes robóticos educativos: puede integrarse en plataformas docentes para enseñar conceptos de visión-lenguaje-acción y control robótico.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede entrenar y desplegar en pocas horas, acelerando la iteración en entornos de investigación.
- Evaluación de generalización a variaciones de la tarea: aunque está entrenado para una tarea fija, puede probarse con diferentes posiciones iniciales de los cubos o condiciones de iluminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M de parámetros, en fp16 se requieren aproximadamente 0.9 GB de VRAM solo para los pesos, más overhead de activaciones. Cabe en GPUs con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, o cualquier GPU con al menos 4 GB de VRAM. También puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: mediante LeRobot con el comando `lerobot-rollout`, que gestiona la carga del modelo y la comunicación con el robot. No se mencionan otros frameworks como vLLM o llama.cpp, ya que es un modelo de robótica, no de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | No disponible | Apilado de cubos | Apache 2.0 | Hugging Face |
| OpenVLA (referencia) | 7B | No disponible | Manipulación general | MIT | Hugging Face |
| RT-2 (referencia) | 55B | No disponible | Manipulación general | No abierto | No disponible |

SmolVLA es significativamente más compacto que OpenVLA (7B) y RT-2 (55B), lo que permite su ejecución en hardware de consumo. Sin embargo, no se dispone de datos comparativos de rendimiento en la información proporcionada. La comparación se basa en el tamaño y la filosofía de diseño descrita en el paper.

## Limitaciones y advertencias

- Entrenado para una única tarea (apilar cubos) y con un robot específico (SO-101); no generaliza a otras tareas o robots sin reentrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real en el mundo físico no está verificado.
- El dataset de entrenamiento es limitado (100 episodios), lo que puede provocar sobreajuste a las condiciones específicas de captura.
- Depende de la configuración de cámaras y del estado del robot; cambios en la iluminación, posición de las cámaras o calibración pueden degradar el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y no incluye soporte técnico.
- No se especifican idiomas soportados; la instrucción está en inglés, por lo que el modelo puede no responder correctamente a instrucciones en otros idiomas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_cap_1000_10fps)
- [Paper de SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/stack_2_cubes_cap_10fps)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
