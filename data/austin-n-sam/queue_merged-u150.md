# austin-n-sam/queue_merged-u150

## Resumen

El modelo `austin-n-sam/queue_merged-u150` es un modelo de lenguaje de gran tamaño desarrollado por el usuario de HuggingFace Austin&Sam, con un peso total de 35.107.181.936 parámetros (aproximadamente 35,1 mil millones). Está etiquetado como `qwen3_5_moe`, lo que indica que se basa en la arquitectura de mezcla de expertos (MoE) de la familia Qwen 3.5, y también como `image-text-to-text`, lo que sugiere capacidad de procesar entradas multimodales (imagen y texto) para generar texto. El modelo es un merge (fusión) de pesos, cuyo modelo base es `vera6/affine-5g4yy75zuz-t6`, y ha sido entrenado adicionalmente con técnicas de optimización offline (DPO) y presenta un modo de razonamiento (`reason-v4`).

A pesar de su reciente publicación (agosto de 2026), el modelo tiene acceso restringido en HuggingFace (gated), por lo que los usuarios deben aceptar condiciones para descargarlo. Su licencia es Apache 2.0, lo que permite uso comercial y modificación. No se dispone de información pública sobre el contexto de entrenamiento, datos utilizados o benchmarks, lo que limita la evaluación objetiva de su rendimiento. No obstante, su tamaño y arquitectura lo sitúan en la categoría de modelos de código abierto de gama media-alta, aptos para tareas de generación de texto, razonamiento y posiblemente visión por computadora.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen 3.5, variante `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de pesos (`queue_merged`) cuyo modelo base es `vera6/affine-5g4yy75zuz-t6`, un modelo de la serie "affine" con identificador `5g4yy75zuz-t6`. La etiqueta `qwen3_5_moe` indica que la arquitectura subyacente corresponde a la familia Qwen 3.5 en su variante de mezcla de expertos, aunque no se especifican detalles como el número de expertos, la dimensión del feed-forward o el mecanismo de enrutamiento. El tag `sn120` podría referirse a 120 capas o a un identificador interno de configuración, pero no hay confirmación oficial.

En cuanto al entrenamiento, los metadatos indican el uso de `offline-dpo`, es decir, optimización de preferencias directa (DPO) aplicada fuera de línea sobre el modelo base, probablemente para alinear las respuestas con preferencias humanas o mejorar la calidad del razonamiento. La etiqueta `reason-v4` sugiere que el modelo incorpora un modo de razonamiento explícito, posiblemente similar a los modos "thinking" de otros modelos, aunque no se detalla su implementación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas adicionales como RLHF.

## Capacidades

- Generación de texto conversacional y de formato libre, dado su pipeline `text-generation`.
- Procesamiento de entradas multimodales: la etiqueta `image-text-to-text` indica que el modelo puede recibir imágenes junto con texto y producir respuestas textuales, lo que lo habilita para tareas de descripción de imágenes, respuesta a preguntas visuales o razonamiento sobre contenido visual.
- Razonamiento avanzado: el tag `reason-v4` apunta a una capacidad de razonamiento multi-paso, posiblemente con un modo de pensamiento explícito, aunque no se especifican detalles técnicos.
- Alineación por preferencias: el uso de DPO offline sugiere que las respuestas están optimizadas para ser útiles y seguras, reduciendo comportamientos no deseados.
- Capacidad de conversación multi-turno, típica de modelos de la familia Qwen.
- No se dispone de información sobre soporte de tool calling, function calling o capacidades de agente, aunque es posible que estén presentes dado el origen Qwen.

## Casos de uso

- Asistente virtual multimodal: el modelo puede procesar capturas de pantalla o fotografías junto con preguntas del usuario, respondiendo con explicaciones detalladas. Adecuado para soporte técnico remoto o ayuda en tareas visuales.
- Generación de descripciones de imágenes para accesibilidad: dado su pipeline image-text-to-text, puede generar textos alternativos (alt text) automáticamente para imágenes en sitios web o documentos.
- Razonamiento visual en entornos educativos: un profesor podría subir una imagen de un problema de geometría y el modelo explicaría los pasos de resolución, aprovechando su modo de razonamiento.
- Chatbot de atención al cliente con contexto visual: si el cliente envía una foto de un producto defectuoso, el modelo puede interpretar la imagen y ofrecer una respuesta de troubleshooting.
- Análisis de documentos técnicos con figuras: en ingeniería o medicina, el modelo puede leer diagramas o gráficos y resumir su contenido, combinando comprensión visual y textual.
- Prototipado de aplicaciones de visión-lenguaje: desarrolladores pueden usar el modelo como base para experimentar con tareas de VQA (visual question answering) o captioning, gracias a su licencia Apache 2.0 y su formato safetensors compatible con Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Se recomienda realizar evaluaciones propias antes de utilizarlo en producción.

## Requisitos de hardware

- VRAM estimada: con 35,1 B parámetros en precisión FP16, se necesitarían aproximadamente 70 GB de VRAM solo para los pesos. Si se aplica cuantización (por ejemplo, 8 bits o 4 bits), el requisito podría reducirse a 35-40 GB, pero no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para inferencia en FP16 se requieren GPUs de datacenter como A100 80GB, H100 80GB o A6000 48GB (esta última insuficiente para FP16 completo). Para cuantización 8 bits, una RTX 4090 (24 GB) podría ser suficiente si el modelo es MoE con pocos parámetros activos, pero al no conocerse el número de expertos activos, no se puede confirmar.
- En consumer GPU: no se puede garantizar que quepa en GPUs de consumo sin cuantización agresiva (4 bits), que degradaría la calidad.
- Opciones de despliegue: al ser compatible con Transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es posible usar Ollama si se genera un archivo Modelfile. No hay información sobre latencia o throughput.
- Se recomienda probar con la herramienta de profiling de HuggingFace (por ejemplo, `optimum-benchmark`) para medir el rendimiento real en el hardware disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa objetiva con otros modelos. Aunque el tag `qwen3_5_moe` sugiere parentesco con Qwen 3.5, no hay datos públicos sobre el rendimiento de este merge frente a modelos como Qwen 3.5 MoE original, Mixtral 8x22B o DeepSeek-V3. Tampoco se conocen los parámetros activos ni el contexto, por lo que cualquier comparación sería especulativa. Se recomienda consultar el modelo base `vera6/affine-5g4yy75zuz-t6` para obtener más contexto, aunque también carece de documentación pública.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, lo que obliga a los usuarios a compartir su información de contacto y aceptar condiciones antes de descargarlo. Esto puede dificultar su adopción en entornos corporativos.
- Sin documentación técnica: no hay paper, blog ni documentación oficial que describa la arquitectura, el entrenamiento o las limitaciones específicas. Toda la información proviene de metadatos.
- Riesgo de alucinación: al no conocerse los datos de entrenamiento ni las técnicas de alineación más allá de DPO, no se puede evaluar la fiabilidad de las respuestas. Es probable que presente alucinaciones en temas especializados.
- Sesgos desconocidos: no se han publicado estudios de sesgo ni evaluaciones de equidad. El modelo podría reflejar sesgos presentes en los datos de entrenamiento del modelo base.
- Limitaciones de contexto: al no especificarse la longitud de contexto, se desconoce si puede manejar documentos largos o conversaciones extensas. Se recomienda asumir un contexto de 8K-16K tokens hasta que se confirme.
- Compatibilidad multimodal incierta: aunque la etiqueta `image-text-to-text` sugiere soporte de visión, no se ha verificado su funcionamiento real ni la calidad de las respuestas visuales.
- Sin garantía de producción: dado que es un modelo reciente, sin benchmarks ni comunidad activa (0 descargas, 0 likes), no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austin-n-sam/queue_merged-u150
- Perfil del autor: https://huggingface.co/austin-n-sam/models
- Modelo relacionado (también gated): https://huggingface.co/austin-n-sam/queue_merged-u83
