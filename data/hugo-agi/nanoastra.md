# Hugo-AGI/nanoAstra

## Resumen

nanoAstra-9B es un modelo de lenguaje y visión (VLM) especializado en manipulación robótica, desarrollado por Hugo-AGI. Se inicializa a partir de Qwen3.5-9B y se entrena con más de 5.000 horas de datos de robots combinados con datos generales de VQA. Su particularidad es que actúa exclusivamente a través de su interfaz de texto nativa: no incorpora una cabeza de acción separada, sino que en cada punto de decisión escribe el progreso de la tarea y los siguientes pasos semánticos construidos a partir de primitivas de acción parametrizadas y reutilizables, como `move x +5.0` o `gripper open`.

El modelo resuelve el problema de convertir un VLM generalista en una política de manipulación robótica sin añadir módulos específicos de acción, lo que simplifica el despliegue y permite reutilizar el ecosistema de inferencia estándar de transformers y vLLM. Con 9.409.813.744 parámetros y pesos en safetensors, se distribuye bajo licencia Apache 2.0.

Es relevante ahora porque propone un enfoque de "fundamento" para la robótica basado en modelos de lenguaje de gran escala, con resultados medibles en el benchmark aleatorizado RoboTwin 2.0 (17,8 % de éxito en zero-shot). La longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Qwen3.5-9B (transformers) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

nanoAstra-9B se inicializa desde Qwen3.5-9B, un modelo de la familia Qwen 3.5, y se especializa mediante fine-tuning en manipulación robótica. La arquitectura subyacente es la de un transformer multimodal de tipo image-text-to-text, con el pipeline `image-text-to-text` y la librería `transformers`. El modelo no incorpora una cabeza de acción dedicada: la política se expresa en lenguaje natural estructurado, con primitivas de acción parametrizadas (`move x +5.0`, `gripper open`, `wait`), lo que permite reutilizar el interfaz de chat y el decodificado estándar.

El entrenamiento combina más de 5.000 horas de datos de robot con datos generales de VQA. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo espera el prompt de sistema del robot, las imágenes de cámara y el estado del robot en el formato construido por `nanoastra/prompt.py`, con el modo de pensamiento desactivado (`chat_template_kwargs: {"enable_thinking": false}`), y responde con un único objeto JSON que contiene el progreso y los pasos por brazo (izquierdo y derecho).

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes de cámara y estado del robot.
- Manipulación robótica mediante primitivas de acción parametrizadas expresadas en texto, sin cabeza de acción separada.
- Salida estructurada en JSON con campo `progress` y lista de `steps` por brazo (izquierdo y derecho), incluyendo la primitiva `wait`.
- Soporte de tareas bimanuales (campos `left` y `right` en la respuesta).
- Respuesta en lenguaje natural libre cuando no se proporciona el prompt de sistema del robot.
- Capacidades generales de VQA heredadas del entrenamiento con datos generales de VQA.
- Modo de pensamiento configurable mediante `enable_thinking` en el chat template.
- Integración con vLLM para servicio de los pesos y bucle cerrado desde el repositorio de código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo actúa como política de alto nivel que traduce observaciones visuales y estado del robot en secuencias de primitivas (`move`, `gripper open`), adecuado para entornos de investigación que ya dispongan de un bucle cerrado de control como el del repositorio `Hugo-AGI/nanoAstra`.
- Evaluación en benchmarks de manipulación: se puede ejecutar `scripts/eval_robotwin.py` sobre tareas como `place_empty_cup` para medir el éxito zero-shot en RoboTwin 2.0, gracias a la integración directa con el harness del proyecto.
- Tareas bimanuales: la salida JSON permite coordinar acciones de los brazos izquierdo y derecho de forma independiente, útil en escenarios que requieren agarre y colocación simultáneos.
- Investigación en VLMs como modelos fundacionales: sirve como base para estudiar la transferencia de modelos de lenguaje y visión a robótica sin cabezas de acción específicas, con pesos abiertos y licencia Apache 2.0.
- Prototipado de asistentes robóticos conversacionales: sin el prompt de sistema del robot, el modelo responde en lenguaje natural libre, lo que permite usarlo como VLM generalista en demostraciones o interfaces de usuario.
- Despliegue en infraestructura estándar de inferencia: al servirse con vLLM y usar `transformers`, se integra en pipelines existentes de modelos Qwen sin necesidad de tooling propietario.
- Generación de datos sintéticos de instrucciones robóticas: el formato de progreso y pasos parametrizados puede reutilizarse para anotar o aumentar datasets de manipulación.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| RoboTwin 2.0 (aleatorizado) | Tasa de éxito zero-shot | 17,8 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 9.400 millones de parámetros en precisión completa (fp16/bf16) requiere del orden de 18-19 GB solo para los pesos, más memoria para el procesador de visión y el KV cache; en cuantización de 8 bits rondaría los 9-10 GB y en 4 bits unos 5-6 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. El autor indica servir los pesos con vLLM, lo que en la práctica requiere GPUs con suficiente VRAM para el modelo y el contexto de imágenes.
- Cabe en consumer GPU: no confirmado. Por tamaño, sería viable en GPUs de 24 GB (por ejemplo, RTX 4090) en cuantizaciones de 8 o 4 bits, pero no hay datos oficiales.
- Opciones de despliegue: vLLM (recomendado por el autor mediante `scripts/serve.sh`), transformers y ecosistema compatible con safetensors. llama.cpp, Ollama y TGI no están mencionados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanoAstra-9B | 9.409.813.744 | no disponible | Manipulación robótica vía texto | apache-2.0 | Hugging Face |
| Qwen3.5-9B (modelo base) | ~9B (según base_model) | no disponible | VLM generalista | no disponible | Hugging Face |
| Alternativas robóticas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparables con otros modelos de manipulación, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El rendimiento zero-shot en RoboTwin 2.0 es del 17,8 %, lo que indica una tasa de éxito baja para uso en producción sin fine-tuning o adaptación adicional.
- El modelo está diseñado para funcionar con un prompt de sistema de robot y un formato de entrada específico (`nanoastra/prompt.py`); fuera de ese formato, las respuestas en lenguaje libre no constituyen una política de control fiable.
- Requiere el modo de pensamiento desactivado (`enable_thinking: false`) para el uso robótico previsto; no se documenta el comportamiento con el modo activado.
- Riesgo de alucinación inherente a los modelos de lenguaje: las primitivas de acción generadas pueden ser inválidas o inseguras para el robot físico, por lo que se necesita validación y límites de seguridad externos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el prompt de sistema y las primitivas están en inglés.
- Longitud de contexto: no disponible, lo que impide evaluar el manejo de historiales largos o múltiples imágenes.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que conviene verificar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- No se documentan tipos de cuantización soportados ni requisitos de hardware oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/Hugo-AGI/nanoAstra
- Paper: https://arxiv.org/abs/2611.29338
- Página del proyecto: https://nanoastra.github.io
- Código: https://github.com/Hugo-AGI/nanoAstra
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
