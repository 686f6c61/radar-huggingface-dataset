# paloik/Qwen3.8-27B-Uncensored-Heretic-MTP-int4-ov

## Resumen

Qwen3.8-27B-Uncensored-Heretic-MTP-int4-ov es una versión cuantizada en INT4 con formato OpenVINO IR del modelo `llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved`, un fine-tune "abliterated" (con los mecanismos de rechazo atenuados) del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario paloik y está pensado para ejecución local sobre hardware Intel (Core Ultra y GPUs Arc) mediante OpenVINO GenAI 2026.4 o superior, conservando la capacidad nativa de Multi-Token Prediction (MTP) del modelo original.

El interés principal de esta ficha radica en que combina tres elementos poco habituales: un modelo de gran tamaño (27B parámetros), una cuantización agresiva a INT4 optimizada para inferencia en dispositivos Intel, y la preservación de MTP, técnica de decodificación especulativa que acelera la generación al predecir varios tokens por paso. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card no detalla la arquitectura de visión.

Se trata de un modelo de investigación publicado bajo licencia Apache 2.0, con cero descargas y cero likes en el momento de la consulta, lo que indica que es una publicación muy reciente y sin validación comunitaria. La información disponible es escasa: no hay benchmarks, no se detallan idiomas soportados ni la composición del dataset de entrenamiento del fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); detalles de atención y capas no disponibles |
| Parametros totales | 27B (según nombre del modelo y modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (OpenVINO IR); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (INT4); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo es una cuantización INT4 a formato OpenVINO IR de un fine-tune abliterated sobre Qwen3.8-27B. La model card no aporta detalles sobre la arquitectura interna del modelo base (número de capas, tipo de atención, dimensiones ocultas) ni sobre el proceso de entrenamiento del fine-tune original (`llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved`). Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras.

La innovación técnica destacable es la preservación de Multi-Token Prediction (MTP) nativo tras la cuantización. MTP actúa como mecanismo de decodificación especulativa: el modelo predice varios tokens futuros en paralelo y los valida, lo que puede aumentar el throughput de generación. El ejemplo de la model card configura un `draft_model` sobre el mismo directorio y `num_assistant_tokens = 5`, lo que indica que la decodificación especulativa se gestiona a través de OpenVINO GenAI con un modelo borrador derivado del propio modelo. El proceso de abliteration reduce la tendencia del modelo a rechazar peticiones, modificando direcciones de activación asociadas a comportamientos de rechazo.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Generación de código: la model card incluye un ejemplo de petición de "async file watcher en Python" y etiqueta el modelo con `coding`.
- Procesamiento image-text-to-text según el `pipeline_tag`, lo que implica entrada multimodal de imagen y texto; el alcance exacto de la visión no está documentado.
- Multi-Token Prediction (MTP) nativo para decodificación especulativa acelerada.
- Comportamiento "uncensored"/abliterated: menor probabilidad de rechazar peticiones, orientado a investigación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en equipos Intel Core Ultra: el formato OpenVINO IR INT4 está optimizado para NPU/iGPU de portátiles con Core Ultra, permitiendo ejecutar un modelo de 27B en hardware de consumo con OpenVINO GenAI 2026.4+.
- Aceleración de generación con MTP: en aplicaciones interactivas (chat, autocompletado) donde la latencia importa, la decodificación especulativa con `num_assistant_tokens = 5` puede reducir el tiempo por token frente a decodificación autoregresiva estándar.
- Generación de código asistida en entornos sin GPU dedicada: el ejemplo de la model card (file watcher asíncrono en Python) ilustra su uso como asistente de programación local en workstations Intel.
- Investigación sobre alineación y abliteration: al ser un modelo con rechazos atenuados, sirve para estudiar cómo la eliminación de direcciones de rechazo afecta a la calidad, la seguridad y la coherencia de las respuestas.
- Prototipado de pipelines multimodales imagen-texto en hardware Intel: el `pipeline_tag` image-text-to-text permite experimentar con descripción de imágenes o VQA en GPUs Arc, aunque la documentación sobre visión es mínima.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la integración en productos comerciales, sujeto a las advertencias legales sobre contenido generado.
- Evaluación comparativa de cuantizaciones INT4: útil para medir la degradación de calidad de un modelo de 27B tras cuantizar a INT4 en OpenVINO frente a otras rutas (GGUF, AWQ, GPTQ).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 27B parámetros en INT4, el peso de los pesos ronda los 13-15 GB (estimación basada en 4 bits por parámetro más overhead de escalas y metadatos); no confirmado por el autor.
- Hardware objetivo declarado: Intel Core Ultra (iGPU/NPU) y GPUs Intel Arc, con OpenVINO GenAI 2026.4 o superior.
- GPUs recomendadas: GPUs Intel Arc (por ejemplo, Arc A770 o Arc B580) por la optimización OpenVINO; el ejemplo usa el dispositivo `"GPU"`. Compatibilidad con A100, H100 o RTX 4090 no está documentada, ya que OpenVINO no es la ruta típica para esas GPUs.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs Intel Arc con 16 GB o más de VRAM, y potencialmente en iGPU de Core Ultra con memoria compartida; no confirmado.
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai`), con `VLMPipeline`, `draft_model` para MTP y `SchedulerConfig` con prefix caching desactivado en el ejemplo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato OpenVINO IR no es directamente compatible con ellos.
- Latencia y throughput: no disponibles. La presencia de MTP sugiere mejoras de throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Heretic-MTP-int4-ov | 27B | no disponible | OpenVINO IR INT4 | Apache 2.0 | Cuantizado para Intel; MTP preservado |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | safetensors (previsible) | no disponible en esta ficha | Modelo original sin abliteration ni cuantización |
| llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved | 27B | no disponible | no disponible | no disponible | Fine-tune abliterated del que deriva esta versión |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: los mecanismos de rechazo están atenuados, por lo que puede generar contenido sensible, ofensivo o inseguro. No es adecuado para despliegues orientados al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la cuantización INT4 puede incrementarlo respecto al modelo en precisión completa, aunque no hay datos que lo confirmen.
- Sin benchmarks ni validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia independiente de calidad.
- Idiomas y contexto no documentados: no se puede garantizar el soporte multilingüe ni la ventana de contexto real.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara que es un modelo de investigación y que el usuario es responsable de verificar las salidas y cumplir la legislación aplicable.
- Dependencia de hardware Intel: el formato OpenVINO IR limita su uso a entornos con OpenVINO GenAI 2026.4+; no es portable a llama.cpp, vLLM u otros runners sin conversión.
- El ejemplo desactiva el prefix caching (`enable_prefix_caching=False`), lo que puede penalizar el rendimiento en conversaciones multi-turno con prefijos largos.
- La información sobre capacidades multimodales es mínima: el `pipeline_tag` indica image-text-to-text, pero no se documenta el codificador visual ni el rendimiento en tareas de visión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/paloik/Qwen3.8-27B-Uncensored-Heretic-MTP-int4-ov
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fine-tune intermedio: https://huggingface.co/llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved
- OpenVINO GenAI (documentación y repositorio): no disponible en la información proporcionada (enlace no incluido en la model card)
