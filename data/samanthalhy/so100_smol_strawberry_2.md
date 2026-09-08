# samanthalhy/so100_smol_strawberry_2

## Resumen

El modelo `samanthalhy/so100_smol_strawberry_2` es una política de control robótico basada en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por el equipo de Hugging Face y entrenado con la biblioteca LeRobot. Ha sido creado por la usuaria Samantha Lee (samanthalhy) y está diseñado para controlar un brazo robótico SO100 en la tarea de recoger fresas, utilizando el dataset `so100_strawberry_2`.

SmolVLA destaca por su eficiencia computacional: logra un rendimiento competitivo a un coste reducido, lo que permite desplegarlo en hardware de consumo. El modelo presentado tiene 450 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,9 GB. Su arquitectura combina percepción visual y comprensión de instrucciones para generar acciones motoras, aunque no se especifica la longitud de contexto ni los idiomas soportados.

Este modelo es relevante para el campo de la robótica de aprendizaje por imitación, ya que ofrece una alternativa ligera a los VLA de gran tamaño, facilitando la experimentación y el despliegue en entornos de investigación y prototipado con hardware accesible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action model) |
| Parametros totales | 450.046.212 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura de visión-lenguaje-acción diseñada para ser compacta y eficiente. A diferencia de los modelos VLA tradicionales, SmolVLA reduce los costes computacionales manteniendo un rendimiento competitivo, lo que permite su ejecución en hardware de consumo. El modelo genera acciones motoras a partir de observaciones visuales y, potencialmente, instrucciones en lenguaje natural, aunque no se detalla el mecanismo exacto de atención ni la composición de sus componentes.

Ha sido entrenado con la biblioteca LeRobot, utilizando el dataset `samanthalhy/so100_strawberry_2` y partiendo del modelo base `lerobot/smolvla_base`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El entrenamiento se realizó en el marco de la tarea de recolección de fresas con un brazo robótico SO100.

## Capacidades

- Control de acciones robóticas: genera comandos motores para un brazo SO100 a partir de observaciones visuales.
- Percepción visual: procesa imágenes para localizar y manipular objetos, en este caso fresas.
- Integración con LeRobot: permite entrenar, evaluar y registrar episodios mediante la interfaz de LeRobot.
- Ejecución de tareas de manipulación: está especializado en la tarea de recoger fresas, siguiendo una política aprendida por imitación.
- No es un modelo de lenguaje conversacional: no soporta generación de texto libre, tool calling ni razonamiento multi-step fuera del ámbito robótico.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Recolección automatizada de fresas en invernaderos: el modelo puede controlar un brazo robótico SO100 para recoger fresas de forma autónoma, reduciendo la necesidad de mano de obra manual en tareas repetitivas.
- Investigación en manipulación robótica: sirve como base para estudiar políticas de aprendizaje por imitación en entornos de laboratorio, permitiendo comparar variantes de SmolVLA con otros enfoques.
- Prototipado rápido de políticas de control: gracias a su tamaño reducido, puede entrenarse y evaluarse rápidamente en estaciones de trabajo con GPU de consumo, acelerando el ciclo de desarrollo en robótica.
- Automatización de tareas de picking en almacenes: con adaptación a nuevos objetos y entornos, el modelo puede aplicarse a tareas de selección y colocación en logística, aunque requiere reentrenamiento.
- Benchmarking de algoritmos de aprendizaje por imitación: el modelo proporciona un punto de referencia reproducible para comparar el rendimiento de diferentes políticas en la tarea de recolección de fresas.
- Educación y demostraciones de robótica: al ser compacto y de código abierto, es adecuado para cursos y talleres donde se necesite un modelo funcional en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 450 millones de parámetros, lo que sugiere que puede ejecutarse en GPUs de consumo, pero no hay cifras confirmadas.
- GPU recomendadas: no disponible. Se recomienda consultar la documentación de LeRobot para requisitos específicos.
- Compatibilidad con GPU de consumo: probable, dado el tamaño reducido del modelo, aunque no está confirmado oficialmente.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), con soporte para CUDA. No se mencionan integraciones con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. El modelo pertenece a la familia SmolVLA de Hugging Face, pero no se dispone de datos de otros miembros de esa familia para establecer una comparación directa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado en un dataset limitado, puede heredar sesgos del entorno de recolección de fresas.
- Riesgo de alucinación: no aplica, ya que el modelo genera acciones motoras y no texto.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto; el modelo está especializado en una tarea visual-motora concreta.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero requiere conservar el aviso de copyright y la licencia en redistribuciones.
- Caveat importante para producción: el modelo ha sido entrenado específicamente para la tarea de recoger fresas con un brazo SO100, por lo que su capacidad de generalización a otros objetos, robots o entornos es limitada y requiere reentrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/samanthalhy/so100_smol_strawberry_2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/samanthalhy/so100_strawberry_2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
