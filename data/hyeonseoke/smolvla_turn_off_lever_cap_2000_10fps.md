# HyeonseokE/smolvla_turn_off_lever_cap_2000_10fps

## Resumen

SmolVLA es un modelo de vision-lenguaje-accion (VLA) compacto y eficiente desarrollado por Hugging Face, disenado para control robotico por imitacion. Este repositorio concreto contiene un ajuste fino del modelo base `lerobot/smolvla_base` para la tarea especifica de apagar una palanca, entrenado con el framework LeRobot. El modelo consume imagenes de camaras y el estado del robot, y produce acciones de control de 6 grados de libertad.

La relevancia de este modelo radica en su capacidad para ejecutar politicas roboticas en hardware de consumo, reduciendo los costes computacionales frente a los VLA mas grandes. Con aproximadamente 450 millones de parametros, SmolVLA demuestra que es posible obtener un rendimiento competitivo en tareas de manipulacion con un coste reducido, lo que democratiza el acceso a la robotica basada en aprendizaje. Este ajuste fino especifico esta entrenado para operar sobre un robot SO-101, utilizando dos camaras y una ventana de contexto visual de 256x256 pixeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con VLM compacto y experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de vision-lenguaje (VLM) preentrenado y compacto con un "experto de acciones" entrenado mediante flow matching. Dado un conjunto de imagenes y una instruccion en lenguaje natural, el modelo genera un fragmento de acciones (action chunk) que el robot ejecuta. Esta arquitectura permite aprovechar el conocimiento visual y linguistico del VLM preentrenado sin necesidad de entrenar desde cero, reduciendo significativamente los requisitos computacionales.

El ajuste fino de este repositorio se realizo con el framework LeRobot sobre el dataset `HyeonseokE/turn_off_lever_cap_10fps`, que contiene 100 episodios y 21.317 fotogramas a 10 FPS. La tarea consiste en "apagar la palanca; el indicador de estado debe ponerse en rojo". El entrenamiento se ejecuto durante 16.650 pasos con un tamano de lote de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001. El modelo base es `lerobot/smolvla_base` y el robot utilizado es un SO-101 follower con dos camaras (superior y muneca izquierda).

## Capacidades

- Control robotico por imitacion: genera acciones de 6 grados de libertad a partir de observaciones visuales y del estado del robot.
- Entrada multimodal: procesa hasta tres imagenes de 256x256 pixeles junto con el estado del robot (6 valores).
- Instrucciones en lenguaje natural: la tarea se especifica mediante texto, lo que permite adaptar el comportamiento del robot.
- Salida de acciones en chunk: produce secuencias de acciones que facilitan la ejecucion suave y coherente en el robot.
- Despliegue en hardware de consumo: disenado para ejecutarse en GPUs de gama media, sin necesidad de equipos de alta gama.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robotica.

## Casos de uso

- Automatizacion de tareas de laboratorio: el modelo puede controlar un brazo robotico para accionar interruptores o palancas en entornos de investigacion, liberando tiempo de los investigadores.
- Prototipado rapido de politicas roboticas: los desarrolladores pueden ajustar SmolVLA sobre sus propios datasets con pocos episodios y desplegarlo en robots SO-101 para validar conceptos.
- Educacion en robotica: al ejecutarse en hardware de consumo, es adecuado para cursos y talleres donde los estudiantes entrenan y evaluan politicas de manipulacion.
- Manipulacion de objetos en entornos controlados: el modelo puede aprender tareas como encender o apagar dispositivos, clasificar piezas o mover objetos entre posiciones fijas.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de flow matching, adaptacion de VLMs a robotica o generalizacion entre tareas.
- Control de robots de bajo coste: su eficiencia permite usarlo en plataformas roboticas economicas, ampliando el acceso a la robotica inteligente en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. El articulo original de SmolVLA (arXiv:2506.01844) reporta resultados comparativos, pero no se dispone de ellos en la documentacion de este repositorio especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion, pero al tratarse de un modelo de 450M de parametros, se estima que puede ejecutarse en GPUs con 8-12 GB de VRAM en precision FP16.
- GPU recomendadas: RTX 3060/3070/3080, RTX 4060/4070, o equivalentes de AMD con soporte ROCm. Para entrenamiento, se recomienda al menos 16 GB de VRAM.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos principales del diseno de SmolVLA.
- Opciones de despliegue: LeRobot (oficial), con soporte para inferencia en tiempo real sobre robots SO-101. Tambien puede integrarse con vLLM o TGI si se adapta el formato, aunque no esta documentado.
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|
| SmolVLA (este ajuste) | 450M | no disponible | Apache 2.0 | GPU de consumo |
| OpenVLA | 7B | no disponible | MIT | GPU profesional (A100) |
| RT-2 (Google) | 55B | no disponible | Propietaria | Infraestructura cloud |

SmolVLA se posiciona como una alternativa mucho mas ligera que OpenVLA o RT-2, sacrificando capacidad bruta por eficiencia y accesibilidad. Mientras que OpenVLA requiere GPUs profesionales para inferencia, SmolVLA puede ejecutarse en hardware de consumo, lo que lo hace adecuado para investigacion y despliegues en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de RT-2.

## Limitaciones y advertencias

- Sin resultados de evaluacion publicados: la model card no incluye metricas de exito en el robot real, por lo que se desconoce la tasa de exito real de la politica.
- Entrenamiento especifico para una tarea: el modelo esta ajustado para apagar una palanca concreta y puede no generalizar a otras tareas o variaciones del entorno sin reentrenamiento.
- Dependencia del hardware: requiere un robot SO-101 follower con la configuracion de camaras exacta utilizada durante el entrenamiento (superior y muneca izquierda).
- Riesgo de sobreajuste: con solo 100 episodios de entrenamiento, el modelo puede no generalizar bien ante cambios de iluminacion, posicion de objetos o distracciones.
- Idioma de las instrucciones: el dataset utiliza instrucciones en ingles; no se ha verificado el rendimiento con instrucciones en otros idiomas.
- Sin soporte de tool calling ni funciones de agente: es un modelo de control robotico puro, no un asistente conversacional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HyeonseokE/smolvla_turn_off_lever_cap_2000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/turn_off_lever_cap_10fps
- Articulo SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot (GitHub): https://github.com/huggingface/lerobot
