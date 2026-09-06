# mysterium99/smolvla-pre-25pct

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) diseñado para control robótico mediante aprendizaje por imitación. Desarrollado por el equipo de LeRobot de Hugging Face, este modelo concreto es un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado sobre un dataset de demostraciones para dos tareas de manipulación. Su principal atractivo es que logra un rendimiento competitivo con un coste computacional reducido, lo que permite ejecutarlo en hardware de consumo, una característica clave para la democratización de la robótica.

El modelo tiene 450.046.176 parámetros y se distribuye en formato `safetensors`, con un tamaño de repositorio de 0,9 GB. Al ser un modelo de política (policy), no genera texto ni mantiene un contexto de lenguaje; en su lugar, consume observaciones del estado del robot y de tres cámaras, y produce acciones de 6 dimensiones. Está entrenado con la librería LeRobot y licenciado bajo Apache-2.0, lo que permite su uso comercial con la atribución correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo VLA sin contexto de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision-accion, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de política de visión-lenguaje-acción. Su arquitectura combina un codificador visual (para procesar imágenes de cámaras), un codificador de estado (para las variables del robot) y un decodificador de acciones. En este fine-tuning, el modelo consume tres imágenes de 256x256 píxeles y un vector de estado de 6 dimensiones, y genera un vector de acción de 6 dimensiones. La arquitectura está diseñada para ser eficiente y desplegable en hardware de consumo, tal como se describe en el paper original (arXiv:2506.01844).

El entrenamiento se realizó con la librería LeRobot (versión 0.6.1), partiendo del modelo base `lerobot/smolvla_base`. El dataset utilizado es un conjunto de prueba (`test`) con 105 episodios y 98.752 frames a 30 FPS, correspondientes a las tareas "Push block from right side to left" y "Squeeze stress ball". La configuración de entrenamiento incluye 33.238 pasos, batch size de 8, optimizador AdamW, learning rate de 0,0001 y semilla 0. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación a partir de demostraciones.

## Capacidades

- Control robótico: genera acciones de 6 dimensiones (posiblemente posiciones o velocidades del efector) a partir de observaciones multimodales.
- Entrada multimodal: procesa el estado del robot (6,) y tres imágenes de 256x256 píxeles procedentes de cámaras (top, side, y una tercera).
- Aprendizaje por imitación: entrenado en demostraciones humanas o teleoperadas para dos tareas concretas de manipulación.
- Ejecución en tiempo real: al ser un modelo compacto, puede ejecutarse en hardware de consumo, lo que facilita su integración en robots reales.
- No soporta tool calling ni generación de texto: es un modelo de política, no un modelo de lenguaje.
- Capacidades multilingües: no aplica, ya que no procesa lenguaje natural.

## Casos de uso

- Manipulación de objetos en laboratorios de robótica: el modelo puede controlar un brazo robótico para tareas como empujar un bloque de derecha a izquierda, gracias a su entrenamiento específico en esta tarea.
- Investigación en aprendizaje por imitación: sirve como punto de partida para fine-tuning en nuevas tareas con pocas demostraciones, ya que parte de un modelo base preentrenado y solo necesita ajustarse con datos específicos.
- Automatización de tareas repetitivas en entornos controlados: en una línea de producción o un entorno de laboratorio, el modelo puede ejecutar acciones repetitivas como apretar objetos o empujar piezas, reduciendo la necesidad de programación explícita.
- Educación y prototipado rápido: gracias a su bajo coste computacional, puede desplegarse en GPUs de consumo, lo que permite a estudiantes y desarrolladores experimentar con políticas robóticas sin infraestructura costosa.
- Robótica doméstica sencilla: tareas como apretar una pelota de estrés o mover objetos en una mesa pueden ser automatizadas con este modelo, siempre que el robot disponga de las cámaras y el estado requeridos.
- Benchmarking de políticas VLA: al ser un fine-tuning de un modelo base conocido, permite comparar el rendimiento de diferentes estrategias de entrenamiento o dataset en tareas de manipulación.
- Integración en pipelines de LeRobot: el modelo se puede ejecutar directamente con el comando `lerobot-rollout`, lo que facilita su uso en robots reales y en sistemas de evaluación existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. Por tanto, no es posible presentar una tabla comparativa de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El tamaño del repositorio (0,9 GB) sugiere que los pesos se almacenan en precisión reducida, lo que implicaría un consumo de VRAM en el orden de 1-2 GB para inferencia.
- GPU recomendadas: no disponible. La descripción del modelo indica que está diseñado para desplegarse en hardware de consumo, por lo que GPUs como RTX 4090 o incluso modelos de gama media podrían ser suficientes, aunque no se especifica.
- Ejecución en consumer GPU: probablemente sí, dado el tamaño compacto del modelo, pero no hay datos confirmados.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch. También puede integrarse en pipelines de inferencia personalizados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es un fine-tuning de `lerobot/smolvla_base`, pero no se han proporcionado especificaciones de otros modelos de la misma categoría para establecer una comparación.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado en un dataset reducido (105 episodios) y en tareas concretas, puede presentar sesgos hacia los objetos y entornos de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir acciones incorrectas o no deseadas si se encuentra con observaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto: el modelo no procesa lenguaje natural; su "contexto" se limita a la ventana de observaciones (estado + imágenes) que recibe en cada paso.
- Limitaciones de idioma: no aplica, ya que no es un modelo de lenguaje.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen los cambios realizados.
- Caveat para producción: no se han publicado resultados de evaluación real en robot, por lo que el rendimiento en entornos no controlados es incierto. Se recomienda validar el modelo en el robot objetivo antes de su uso en producción.
- Dependencia de LeRobot: el modelo está pensado para ejecutarse con la librería LeRobot, lo que implica una dependencia de esa infraestructura.

## Enlaces

- HuggingFace: https://huggingface.co/mysterium99/smolvla-pre-25pct
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
