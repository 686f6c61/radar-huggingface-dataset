# mysterium99/smolvla_newtasks_to_manufacturing

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta, `mysterium99/smolvla_newtasks_to_manufacturing`, es un fine-tuning del modelo base `lerobot/smolvla_base` orientado a tareas de manipulación de hardware en un contexto de fabricación: recoger piezas de un operario humano, separar tuercas y tornillos en recipientes de colores y depositar hardware en un cubo.

El modelo resuelve el problema de la política de imitación específica de tarea: en lugar de entrenar desde cero, parte de un VLA preentrenado y se adapta con 150 episodios teleoperados (218.964 frames a 30 FPS) a tres tareas concretas de ensamblaje. Con 450 millones de parámetros y un repositorio de 0,9 GB, está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y talleres que quieren validar pipelines de imitación sin infraestructura de GPU de datacenter.

La arquitectura subyacente combina un codificador visual, un modelo de lenguaje pequeño y un cabezal de acciones que predice vectores de 6 dimensiones (posición y orientación del efector final), consumiendo tres cámaras RGB de 256x256 píxeles junto con el estado de 6 articulaciones. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta sobre transformer; política de imitación LeRobot |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras en un único transformer. La política consume tres flujos de imagen de 256x256 píxeles (cámaras `gripper`, `newtop` y `newside`), un vector de estado de 6 dimensiones correspondiente a las articulaciones del robot, y una instrucción textual de tarea; produce como salida un vector de acción de 6 dimensiones. El modelo base fue preentrenado por Hugging Face y este checkpoint lo especializa mediante fine-tuning supervisado con el dataset `manufacturing_finetune`.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 0. El dataset consta de 150 episodios teleoperados con 218.964 frames a 30 FPS, cubriendo tres tareas: "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket" y "Put all hardware in bucket". No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje por imitación puro sobre el modelo base.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot tipo `follow` a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas RGB (gripper, vista superior, vista lateral) a 256x256.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante un string de texto en el momento de la inferencia.
- Ejecución de tareas de ensamblaje: recogida de piezas de un operario, clasificación de tuercas y tornillos en recipientes diferenciados por color, y depósito de hardware en un cubo.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite inferencia en GPUs de gama media.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico; es una política de control, no un modelo de lenguaje general.

## Casos de uso

- Automatización de líneas de ensamblaje manual: el modelo puede recibir piezas de un operario y depositarlas en una zona delimitada, sustituyendo la tarea repetitiva de transferencia en un puesto de trabajo con robot colaborativo.
- Clasificación de componentes de ferretería: la política distingue tuercas y tornillos y los dirige a recipientes de colores distintos, útil en estaciones de kitting donde la separación manual introduce errores.
- Recogida y consolidación de hardware: la tarea "Put all hardware in bucket" permite agrupar piezas dispersas en un contenedor, aplicable a la preparación de pedidos o al reabastecimiento de contenedores en almacén.
- Prototipado rápido de políticas de imitación: con 150 episodios y 20.000 pasos de entrenamiento, sirve como plantilla para que un equipo replique el pipeline con sus propios datos y valide la viabilidad de un caso de uso antes de invertir en más recogida de datos.
- Investigación en manipulación con VLA compactos: el checkpoint permite estudiar el efecto del fine-tuning sobre un modelo base preentrenado en tareas de fabricación, comparando curvas de éxito frente a `lerobot/smolvla_base`.
- Formación y demostración en entornos educativos: al caber en GPUs de consumo y usar licencia Apache 2.0, es adecuado para cursos de robótica donde los alumnos despliegan y evalúan políticas en robots de bajo coste.
- Validación de hardware robótico: el modelo sirve como carga de trabajo de referencia para medir latencia de inferencia y throughput de control en distintas GPUs antes de adquirir hardware definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito por tarea ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros en fp32, los pesos ocupan aproximadamente 1,8 GB; en fp16/bf16, unos 0,9 GB. A ello hay que sumar el coste de los tres flujos de imagen de 256x256 y las activaciones, por lo que una estimación razonable es de 2 a 4 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o RTX 4090 son suficientes; también A100 o H100 si se busca máxima concurrencia, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas (RTX 20xx en adelante, e incluso iGPUs con suficiente memoria compartida para inferencia en CPU).
- Opciones de despliegue: `lerobot-rollout` (comando oficial de la model card) para ejecución en robot; `lerobot-train` para fine-tuning adicional; la librería LeRobot gestiona la carga del checkpoint safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de control.
- Latencia y throughput: no disponibles en la información proporcionada. El control se ejecuta a 30 FPS según la frecuencia del dataset, pero no se publican medidas de latencia por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_newtasks_to_manufacturing` | 450 M | VLA fine-tuned para fabricación | 3 cámaras 256x256 + estado 6D + instrucción | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | ~450 M | VLA base preentrenado | 3 cámaras 256x256 + estado + instrucción | Apache 2.0 | Hugging Face |
| Políticas de imitación tipo ACT / Diffusion Policy en LeRobot | variable (decenas de M) | Política de imitación sin componente lingüístico | imágenes + estado | Apache 2.0 (mayoría) | Hugging Face / LeRobot |
| Modelos VLA grandes tipo OpenVLA | ~7 B | VLA de gran escala | imágenes + instrucción | varía (a menudo con restricciones) | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: ni este checkpoint ni el modelo base publican tasas de éxito en las tareas de fabricación, por lo que no es posible establecer una jerarquía de rendimiento frente a ACT, Diffusion Policy u OpenVLA con los datos proporcionados.

## Limitaciones y advertencias

- Sin evaluación publicada: no existen tasas de éxito medidas en robot real, por lo que se desconoce la fiabilidad del checkpoint en las tres tareas declaradas.
- Especialización estrecha: la política está entrenada para tres tareas concretas con objetos, posiciones y una configuración de robot específicas; generalizará mal a otros objetos, disposiciones de cámara o brazos distintos.
- Dependencia de la configuración de cámaras: los nombres y la disposición de las cámaras (`gripper`, `newtop`, `newside`) deben coincidir con los del entrenamiento; cambiarlos invalida la política.
- Dataset pequeño: 150 episodios y 20.000 pasos de entrenamiento son un volumen reducido, lo que aumenta el riesgo de sobreajuste a las condiciones de recogida de datos (iluminación, posiciones iniciales, operario concreto).
- Sin componente conversacional ni de razonamiento: no debe emplearse como modelo de lenguaje, agente ni sistema de tool calling.
- Idiomas: la información disponible no documenta soporte multilingüe de las instrucciones; los ejemplos de la model card usan inglés.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los datos de entrenamiento (`manufacturing_finetune`) y de las dependencias de LeRobot antes de desplegar en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_newtasks_to_manufacturing
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cheat-sheet de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
