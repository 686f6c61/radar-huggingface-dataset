# iteratehack/everestai-smolvla

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo y democratizar el acceso a la robótica avanzada. Este repositorio concreto, `iteratehack/everestai-smolvla`, es un fine-tune del modelo base `lerobot/smolvla_base` para una tarea específica: abrir una bolsa con cremallera y mirar en su interior, utilizando un robot tipo `bi_so_follower` con tres cámaras. El modelo se ha entrenado con el dataset `shaanyp/FinalOpenBag_20260829_172524` mediante aprendizaje por imitación con la librería LeRobot, y está publicado bajo licencia Apache-2.0.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede adaptarse a tareas robóticas concretas con un coste computacional bajo, lo que permite su despliegue en entornos de investigación, educación y prototipado rápido sin necesidad de infraestructura de alto rendimiento. Al ser un fine-tune de un modelo base abierto, también sirve como ejemplo práctico del flujo de trabajo de LeRobot para entrenar políticas robóticas personalizadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, permitiendo que el robot interprete instrucciones en lenguaje natural y genere comandos de control a partir de observaciones visuales y del estado del robot. El modelo base fue preentrenado por Hugging Face y posteriormente fine-tuneado para tareas robóticas específicas. Este repositorio concreto se ha entrenado mediante aprendizaje por imitación (imitation learning) con LeRobot, utilizando el dataset `FinalOpenBag` que contiene 20 episodios y 15.630 frames a 30 FPS, con la tarea "Open the bag with the zipper and look in". La configuración de entrenamiento incluye 10.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0,0001 y semilla 1000. El modelo consume tres imágenes de cámaras (izquierda-muñeca, izquierda-superior, izquierda-lateral) de 480x640 píxeles y un vector de estado de 12 dimensiones, produciendo acciones de 12 dimensiones.

La principal innovación de SmolVLA es su eficiencia: con solo 450 millones de parámetros, logra un rendimiento competitivo en tareas de manipulación robótica a una fracción del coste computacional de modelos VLA más grandes, lo que permite su ejecución en GPUs de consumo. El fine-tune aquí presentado sigue esta filosofía, demostrando que es posible adaptar el modelo a una tarea concreta con un dataset relativamente pequeño.

## Capacidades

- Control robótico basado en visión y lenguaje: interpreta instrucciones como "Open the bag with the zipper and look in" y genera acciones de control.
- Entrada multimodal: procesa simultáneamente tres flujos de imagen (cámaras) y un vector de estado del robot.
- Salida de acciones continuas: genera un vector de 12 dimensiones que representa los comandos motores del robot.
- Fine-tuning específico: el modelo está especializado en la tarea de abrir una bolsa con cremallera, no es un agente generalista.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo scripts de rollout y entrenamiento.
- Eficiencia computacional: diseñado para hardware de consumo, con requisitos de memoria moderados.

## Casos de uso

- Automatización de tareas de manipulación en entornos controlados: el modelo puede ejecutar la tarea de abrir una bolsa con cremallera de forma autónoma, útil en líneas de empaquetado o laboratorios de robótica.
- Investigación en robótica de bajo coste: permite a grupos de investigación con recursos limitados experimentar con políticas VLA sin necesidad de GPUs de alta gama.
- Prototipado rápido de políticas robóticas: gracias a su pequeño tamaño y al flujo de LeRobot, se puede iterar rápidamente sobre nuevas tareas con datasets reducidos.
- Educación en robótica: sirve como ejemplo didáctico para enseñar aprendizaje por imitación y modelos VLA en cursos universitarios o talleres.
- Benchmarking de eficiencia: puede utilizarse como referencia para comparar el rendimiento de modelos VLA más grandes en tareas similares.
- Desarrollo de asistentes robóticos personales: en entornos domésticos o de oficina, un robot equipado con este modelo podría realizar tareas sencillas de manipulación, como abrir bolsas o cajas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se dispone de datos de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 450 millones de parámetros, en FP32 ocuparía aproximadamente 1,8 GB solo de pesos, pero con las imágenes de entrada y el overhead de inferencia se recomienda al menos 4-6 GB de VRAM. En FP16 o cuantizado, podría caber en GPUs con 4 GB.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4070, o superiores. También es viable en GPUs de generaciones anteriores con suficiente memoria.
- Compatibilidad con consumer GPUs: sí, es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y soporta inferencia en tiempo real. También puede integrarse con frameworks como vLLM o TGI, aunque no se documenta explícitamente para este modelo.
- Latencia y throughput: no se han publicado datos específicos, pero dado el tamaño reducido del modelo, se espera una latencia de inferencia en el orden de decenas de milisegundos en GPUs modernas, suficiente para control en tiempo real a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache-2.0 | VLA compacto, eficiente, para hardware de consumo |
| OpenVLA | 7B | no disponible | Apache-2.0 | VLA grande, requiere GPUs de alta gama |
| RT-2 (Google) | 55B | no disponible | Propietaria | VLA masivo, no open-source |

SmolVLA se posiciona como una alternativa mucho más ligera que OpenVLA o RT-2, sacrificando capacidad bruta por eficiencia y accesibilidad. No se dispone de comparativas de rendimiento directas en tareas similares, pero el diseño del modelo busca un equilibrio entre precisión y coste computacional.

## Limitaciones y advertencias

- Entrenamiento con dataset muy pequeño: solo 20 episodios, lo que puede limitar la generalización a variaciones de la tarea (posición de la bolsa, iluminación, etc.).
- Tarea específica: el modelo no es un agente generalista; solo sabe ejecutar la tarea para la que fue fine-tuneado.
- Sin evaluación en robot real: la model card no reporta resultados de éxito en despliegue físico, por lo que el rendimiento real no está verificado.
- Dependencia de la configuración de hardware: las cámaras y el robot deben coincidir exactamente con los utilizados en el entrenamiento (nombres de cámaras, resolución, tipo de robot).
- Riesgo de alucinación en la interpretación de instrucciones: como todo modelo de lenguaje, puede malinterpretar comandos si se le presentan variaciones no vistas en el entrenamiento.
- Idiomas: no se especifica soporte multilingüe; probablemente solo inglés, dado el dataset y la tarea.
- Licencia Apache-2.0: permite uso comercial, pero se debe citar el método original (SmolVLA) y LeRobot según la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iteratehack/everestai-smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/smolvla
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Dataset de entrenamiento: https://huggingface.co/datasets/shaanyp/FinalOpenBag_20260829_172524
