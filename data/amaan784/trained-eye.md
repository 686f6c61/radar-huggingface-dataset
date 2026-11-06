# amaan784/trained-eye

## Resumen

Trained Eye es un adaptador QLoRA (PEFT) para el modelo multimodal `meta-models/Muse-Glimmer-30B`, desarrollado por amaan784 en el contexto del proyecto homónimo Trained Eye, orientado a gafas inteligentes (smart glasses) con visión en primera persona. El adaptador no es un modelo autónomo: requiere los pesos del modelo base en la revisión `a4e59da52a7bc87ae7251dd5545c0dd437c44b68`. Su función es concreta y acotada: dada una única imagen de cámara en primera persona y una condición expresada en el prompt, responde sí o no sobre si esa condición se cumple en la escena.

El adaptador se entrenó simultáneamente en dos habilidades (la ejecución de entrenamiento se denomina `product`): detectar que un quemador de cocina se ha quedado encendido (`burner_left_on`) y detectar que la puerta del frigorífico se ha quedado abierta (`fridge_left_open`). El modelo base Glimmer genera un razonamiento breve antes de la respuesta final, por lo que la inferencia práctica consiste en leer el último token `yes` o `no` y calibrar la probabilidad de `yes` a partir de los logprobs de la parte superior.

El interés actual del artefacto es doble: por un lado, demuestra un patrón de adaptación de sub-30B multimodales a tareas de vigilancia visual de alta especificidad con muy pocos datos (300 imágenes generadas por habilidad); por otro, documenta un flujo de despliegue realista (fusión del adaptador, servicio con vLLM y lectura de logprobs) con métricas de latencia y coste comparadas frente al modelo base y frente a Muse Spark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer multimodal Muse-Glimmer-30B; rank 32 en todas las proyecciones de atención y MLP de las capas del modelo de lenguaje; torre de visión sin modificar |
| Parametros totales | Adaptador de 767 MB; el modelo base no se distribuye en este repositorio (tamaño de parámetros del base: no disponible) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en 4 bits con bitsandbytes (QLoRA); pesos del adaptador en safetensors; el despliegue documentado usa el base en bf16 tras `merge_and_unload()` |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuración PEFT en `adapter_config.json`, más `config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rank 32 sobre todas las proyecciones de atención y MLP de las capas del modelo de lenguaje del base Muse-Glimmer-30B; la torre de visión queda intacta. El entrenamiento se realizó con Axolotl en modalidad QLoRA (cuantización de 4 bits con bitsandbytes), lo que explica que el repositorio contenga únicamente los pesos del adaptador y no los del modelo base. El adaptador se distribuye junto con el procesador de imagen, el tokenizador y la plantilla de chat empleada para construir los prompts, de modo que la inferencia reproduce exactamente el formato de entrenamiento.

Los datos de entrenamiento son 300 imágenes generadas por habilidad (600 en total), producidas mediante edición con Muse Image a partir de fotogramas de enseñanza; cada imagen lleva asociada una respuesta (sí, o no para un caso casi-fallo) y el SHA-256 tanto del fotograma editado como de la imagen resultante, registrados en `manifests/<skill>.jsonl`. Las imágenes generadas y los fotogramas originales no se publican. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO; el ajuste es supervisado sobre pares imagen-condición-respuesta. La innovación destacable no está en la arquitectura sino en el flujo de uso: el base emite razonamiento breve antes de la respuesta, y la decisión se toma leyendo el último token `yes`/`no` y su probabilidad calibrada con `top_logprobs`, con una regla de histéresis (la probabilidad debe mantenerse por encima de un umbral durante una ventana de retención) para disparar la alerta.

## Capacidades

- Clasificación visual binaria de una condición expresada en lenguaje natural sobre un único fotograma en primera persona: responde `yes` o `no`.
- Dos habilidades entrenadas de forma explícita: `burner_left_on` (quemador encendido sin olla) y `fridge_left_open` (puerta del frigorífico abierta con interior iluminado visible).
- Discriminación de casi-fallos definidos por el autor: quemador apagado, quemador encendido con olla encima, quemador vecino apagado, rejilla o papel de aluminio sin llama; puertas cerradas, cajón inferior del congelador, armario de cocina cerrado o puerta de despensa abierta que no es el frigorífico.
- Generación de razonamiento breve antes de la respuesta final (hereda el comportamiento del base Glimmer).
- Exposición de logprobs para calibrar la confianza de la respuesta y aplicar umbrales con histéresis.
- Procesamiento de imagen con relleno (padding) a 512 x 512 píxeles con barras negras, no recorte.
- No soporta tool calling, agentes multi-paso, audio, visión general fuera de las dos condiciones entrenadas ni otros idiomas distintos del inglés.

## Casos de uso

- Vigilancia de seguridad en cocina para gafas inteligentes: el adaptador recibe cada fotograma de la cámara en primera persona y responde si hay un quemador encendido sin recipiente; la alerta se dispara solo cuando la probabilidad de `yes` supera un umbral calibrado durante una ventana de retención, lo que reduce falsos positivos por destellos o reflejos puntuales.
- Aviso de frigorífico abierto en el hogar: integrado en el flujo continuo de la cámara de las gafas, detecta que la puerta ha quedado abierta con el interior iluminado y notifica al usuario, con discriminación explícita frente a armarios y cajones del congelador.
- Asistencia a personas mayores o con deterioro cognitivo: recordatorios automáticos de apagar el fuego o cerrar el frigorífico sin requerir que el usuario interactúe con la aplicación, usando la captura pasiva de las gafas.
- Automatización doméstica basada en eventos visuales: el resultado binario calibrado puede publicarse como evento en un bus (MQTT, webhook) para encender extractores, cerrar electrodomésticos conectados o registrar incidencias.
- Auditoría y supervisión de cocinas profesionales: despliegue sobre grabaciones o streams de cámaras fijas en primera persona para detectar quemadores encendidos sin menaje al cierre de turno, con revisión humana de las alertas.
- Evaluación de plataformas de visión egocéntrica: sirve como referencia reproducible de ajuste fino con muy pocos datos (300 imágenes por habilidad) para comparar latencia, coste y precisión frente al base y frente a alternativas como Muse Spark en despliegues con vLLM.
- Investigación en calibración de modelos multimodales: el uso de `top_logprobs` sobre el token final y la regla de histéresis constituyen un caso práctico para estudiar umbrales y tasas de falsos positivos en clasificación visual binaria con modelos generativos.

## Benchmarks y rendimiento

Los resultados publicados se limitan a las dos habilidades, evaluadas sobre cocinas distintas filmadas en primera persona con teléfonos móviles. La model card reporta F1 por fotograma de 0,87 para el modelo ajustado, 0,88 para el base Glimmer y 0,94 para Muse Spark; latencia de 1,64 s por fotograma frente a 2,53 s del base y 11,80 s de Spark; y coste de 4,00 USD por hora frente a 16,53 USD por hora de Spark. La tabla de precisión y recall por fotograma y por habilidad aparece truncada en la información disponible.

| Modelo | F1 por fotograma | Latencia por fotograma | Coste por hora |
|---|---|---|---|
| Trained Eye (adaptador sobre Glimmer 30B) | 0,87 | 1,64 s | 4,00 USD |
| Muse-Glimmer-30B (base) | 0,88 | 2,53 s | no disponible |
| Muse Spark | 0,94 | 11,80 s | 16,53 USD |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa 767 MB, pero requiere cargar el modelo base Muse-Glimmer-30B completo para inferencia.
- El despliegue documentado fusiona el adaptador en el base en bf16 sobre una GPU H100 de 80 GB y sirve con la imagen `vllm/vllm-openai:muse-glimmer` de vLLM.
- VRAM estimada para el base en bf16: no disponible de forma explícita; por el tamaño del repositorio y el uso de una H100 de 80 GB, se requiere al menos una GPU de clase数据中心 con memoria amplia.
- Cabe en GPU de consumo: no disponible en la información proporcionada; no se documenta ningún despliegue en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: vLLM con `logprobs` activados, `top_logprobs` 10, hasta 512 tokens nuevos y `chat_template_kwargs` `{"reasoning_strength": "low"}`. La carga del adaptador con `--enable-lora` de vLLM no arrancó para este modelo en esa imagen, por lo que se recomienda la fusión previa con `merge_and_unload()` de PEFT. No se documenta soporte con llama.cpp, Ollama ni TGI.
- Latencia medida: 1,64 s por fotograma en el despliegue descrito; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 por fotograma | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Trained Eye (adaptador) | Adaptador de 767 MB sobre base de 30B | no disponible | 0,87 | 1,64 s | apache-2.0 | Hugging Face (adaptador) |
| Muse-Glimmer-30B (base) | 30B (según nombre) | no disponible | 0,88 | 2,53 s | no disponible | Hugging Face |
| Muse Spark | no disponible | no disponible | 0,94 | 11,80 s | no disponible | no disponible |

La comparación se limita a la tarea de vigilancia visual de las dos habilidades entrenadas; no hay datos comparativos en benchmarks generales ni en otras tareas multimodales.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: sin los pesos del base Muse-Glimmer-30B en la revisión exacta indicada no funciona.
- Solo cubre dos condiciones concretas y en inglés; no generaliza a otras tareas de vigilancia ni a otros idiomas.
- Entrenado con 300 imágenes generadas por habilidad, lo que limita la diversidad de escenas, iluminación, cocinas y dispositivos; el rendimiento puede degradarse fuera del dominio de las cocinas filmadas en primera persona con teléfono.
- Riesgo de alucinación inherente al modelo base: Glimmer genera razonamiento antes de responder, por lo que la respuesta final debe extraerse del último token `yes`/`no` y no del texto de razonamiento.
- La alerta requiere calibración del umbral sobre clips etiquetados propios y una ventana de retención; sin ese ajuste, la tasa de falsos positivos no está controlada.
- No se publican las imágenes de entrenamiento ni los clips de test, lo que impide reproducir exactamente la evaluación.
- Licencia apache-2.0 para el adaptador; el uso del modelo base queda sujeto a sus propios términos, que no se detallan en la información disponible.
- El soporte de LoRA en caliente con vLLM no funcionó en la imagen probada; en producción debe preverse la fusión del adaptador y el almacenamiento del modelo fusionado.

## Enlaces

- Hugging Face: https://huggingface.co/amaan784/trained-eye
- Repositorio de código: https://github.com/amaan784/trained-eye
- Playground: https://aas2438--trained-eye-playground-web.us-east.modal.run
- Explicación del funcionamiento: https://aas2438--trained-eye-playground-web.us-east.modal.run/how-it-works
- Ejecuciones de entrenamiento (W&B): https://wandb.ai/amaan784-columbia-university/trained-eye
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B (revisión `a4e59da52a7bc87ae7251dd5545c0dd437c44b68`)
