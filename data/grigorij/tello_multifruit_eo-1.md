# Grigorij/Tello_multifruit_eo-1

## Resumen

Grigorij/Tello_multifruit_eo-1 es un modelo de visión-lenguaje-acción (VLA) desarrollado por Grigorij y entrenado con el framework LeRobot. Se basa en la arquitectura EO-1, que combina un backbone Qwen2.5-VL para comprensión visual y lingüística con una cabeza de acción de flow-matching que denoisa chunks de acciones para el control robótico. El modelo está diseñado para controlar un dron Tello en tareas concretas de acercamiento a objetos: una manzana roja, una naranja y un tarro de arenques. Con aproximadamente 3,77 mil millones de parámetros, procesa imágenes de cámara frontal de 480x640 píxeles y un estado de dos variables, y genera acciones de cuatro dimensiones. Su relevancia radica en ser una implementación práctica del enfoque EO-1 dentro del ecosistema LeRobot, ofreciendo a desarrolladores un punto de partida reproducible para entrenar y desplegar políticas robóticas de imitación.

El modelo se publica con licencia MIT y se distribuye en formato safetensors, con un tamaño de repositorio de 7,6 GB. Al ser un modelo específico de robótica, no está pensado para tareas generales de lenguaje o visión, sino para ser ejecutado como política de control en tiempo real sobre un robot compatible. Su entrenamiento se realizó sobre un dataset propio de 149 episodios y 31 624 frames, con tres tareas de navegación visual. No se han publicado resultados de evaluación en la model card, por lo que su rendimiento en el mundo real debe validarse experimentalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EO-1 (Vision-Language-Action): backbone Qwen2.5-VL + cabeza de accion flow-matching |
| Parametros totales | 3.771.607.072 (3,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EO-1 es un transformer decoder-only unificado que integra decodificacion autoregresiva discreta con flow matching continuo para razonamiento encarnado multimodal y control robotico. En este modelo concreto, el backbone Qwen2.5-VL se encarga de la comprension de imagenes y lenguaje, mientras que una cabeza de accion basada en flow matching denoisa secuencias continuas de acciones a partir de las caracteristicas observacionales. Esta combinacion permite que el modelo reciba instrucciones en lenguaje natural y genere comandos de movimiento directamente.

El entrenamiento se realizo con el dataset Grigorij/Tello_multifruit_sum_two_state_vars, que contiene 149 episodios y 31 624 frames capturados a 30 FPS. Las tareas registradas son "Approach red apple", "Approach orange" y "Approach jar of herrings". La configuracion de entrenamiento incluye 30 000 pasos, batch size de 16, optimizador AdamW con learning rate de 0,0001 y semilla 1000, utilizando la version 0.6.2 de LeRobot. No se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento es de imitacion supervisada sobre las demostraciones.

## Capacidades

- Control robotico basado en vision: procesa imagenes en tiempo real (480x640) y genera acciones continuas de cuatro dimensiones para el robot.
- Comprension de instrucciones en lenguaje natural: las tareas se especifican como texto (p. ej., "Approach red apple") y el modelo las traduce en comandos de movimiento.
- Generacion de acciones mediante flow matching: la cabeza de accion denoisa chunks de acciones, permitiendo movimientos suaves y coherentes.
- Integracion nativa con LeRobot: se puede cargar y ejecutar directamente con las herramientas de rollout y entrenamiento de LeRobot.
- Entrenado para tareas de navegacion de acercamiento a objetos estaticos desde un dron Tello.
- No incluye tool calling, capacidades de agente general ni soporte multimodal mas alla de imagen y texto.

## Casos de uso

- Navegacion autonoma de drones en entornos controlados: el modelo puede servir como politica de bajo nivel para acercar el dron a objetivos visuales, como en tareas de inspeccion o seguimiento.
- Automatizacion de almacenes: acercamiento a objetos etiquetados (cajas, contenedores) para tareas de recogida o verificacion, siempre que se realice un fine-tuning con datos especificos del entorno.
- Investigacion en aprendizaje por imitacion: el modelo es util como referencia para estudiar el comportamiento de politicas VLA en robots aereos de bajo coste.
- Prototipado rapido de politicas robotica con LeRobot: permite a desarrolladores experimentar con el flujo completo de grabacion de datos, entrenamiento y despliegue sin partir de cero.
- Educacion en robotica: adecuado para cursos o talleres donde se ensena a entrenar y evaluar modelos de control basados en vision y lenguaje.
- Fine-tuning para tareas similares: al estar entrenado sobre un dataset pequeno, puede adaptarse a nuevos objetos o entornos con relativamente pocas demostraciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se proporcionan resultados de evaluacion. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,77 mil millones de parametros en FP16, los pesos ocupan aproximadamente 7,5 GB. Sumando activaciones y overhead del runtime, se recomienda al menos 12 GB de VRAM.
- GPU recomendadas: tarjetas con 16 GB o mas, como NVIDIA RTX 3090, RTX 4090, A10G o A100. GPUs de 8 GB (p. ej., RTX 3070) podrian funcionar con cuantizacion, aunque no se ofrecen pesos cuantizados en el repositorio.
- Compatibilidad con GPU de consumo: si, siempre que se disponga de suficiente VRAM. Para consumer GPUs, una RTX 3080/3090 o superior es adecuada.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot (PyTorch). No se proporcionan archivos GGUF ni compatibilidad con vLLM u Ollama al ser un modelo de robotica, no un LLM generico.
- Latencia y throughput: no disponibles. Depende del hardware, la resolucion de imagen y el tamaño de los chunks de accion.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos VLA. Se menciona en la busqueda web un modelo del mismo autor, Grigorij/Tello_multifruit_sum_lingbot, que utiliza la arquitectura LingBot-VA (un modelo de mundo de video-accion autoregresivo sobre Wan2.2). Sin embargo, no se han encontrado especificaciones tecnicas ni resultados de rendimiento para ese modelo. Otros VLA conocidos como OpenVLA (7B) o RT-2 no tienen datos publicos comparables en este contexto. Por tanto, la comparativa queda pendiente de la publicacion de evaluaciones.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha sido entrenado para tres tareas de acercamiento a objetos concretos con un dron Tello. No generaliza a otras tareas, objetos o robots sin un fine-tuning adicional.
- Sin resultados de evaluacion: no hay datos publicados sobre tasas de exito o errores en el mundo real, lo que impide conocer su fiabilidad en produccion.
- Dependencia del dataset: la calidad del comportamiento depende directamente de las demostraciones grabadas; variaciones de iluminacion, fondo o posicion de camara pueden degradar el rendimiento.
- Alucinacion de acciones: como cualquier modelo generativo, puede producir comandos de movimiento incoherentes o peligrosos si se enfrenta a entradas fuera de su distribucion de entrenamiento. Se recomienda supervisar el despliegue en robots fisicos.
- Sin soporte multilingue: las instrucciones se procesan en ingles; no se especifican otros idiomas.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario es responsable de validar el comportamiento del modelo en su aplicacion concreta.
- Contexto limitado: al ser un modelo de robotica que procesa imagenes, no maneja historiales largos de conversacion ni razonamiento de alto nivel; esta disenado para control reactivo.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/Grigorij/Tello_multifruit_eo-1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Grigorij/Tello_multifruit_sum_two_state_vars)
- [Paper de EO-1 (arXiv 2508.21112)](https://arxiv.org/pdf/2508.21112v5)
- [Repositorio GitHub de EO-1](https://github.com/EO-Robotics/EO1)
- [Pagina oficial de EO-1](https://eo-robotics.ai/eo-1)
- [Documentacion de LeRobot para eo1](https://huggingface.co/docs/lerobot/main/en/eo1)
