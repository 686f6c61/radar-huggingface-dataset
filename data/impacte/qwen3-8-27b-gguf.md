# impacte/Qwen3.8-27B-GGUF

## Resumen

El modelo **Qwen3.8-27B** es un modelo de lenguaje multimodal de 27 000 millones de parámetros desarrollado por Alibaba (Qwen) y distribuido en formato GGUF por el usuario `impacte` para su uso con llama.cpp y Ollama. Se trata de un modelo híbrido que combina atención lineal y atención completa (full attention) en 64 capas, lo que le permite manejar contextos nativos de hasta 262 144 tokens (256K) con un coste computacional reducido en comparación con arquitecturas puramente transformer. Además, es multimodal: acepta texto, imagen y vídeo mediante un proyector multimodal (`mmproj`) incluido en el repositorio.

La relevancia de esta ficha radica en que ofrece una configuración lista para ejecutar en hardware de consumo (24 GB de VRAM) con la KV cache alojada en RAM del sistema, lo que permite explotar el contexto largo sin necesidad de GPUs de datacenter. El modelo base está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones de producción. La cuantización Q4_K_M reduce el peso a 17,77 GB, manteniendo un equilibrio entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: linear attention + full attention (Qwen3.5 hybrid), 64 capas |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens (256K) nativo |
| Tipos de cuantizacion | Q4_K_M (principal), f16 para el proyector multimodal |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas de atención lineal (linear attention) con capas de atención completa (full attention). Esta combinación reduce la complejidad computacional del mecanismo de atención para secuencias largas, permitiendo un contexto de 256K tokens sin un aumento cuadrático del coste. El modelo tiene 64 capas y es multimodal, con un proyector separado (`mmproj`) que codifica imágenes y vídeo en el espacio de representación del texto.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El modelo base es de la familia Qwen3.8, desarrollada por Alibaba, y se distribuye bajo licencia Apache 2.0. La cuantización GGUF fue generada por el usuario `bartowski`, conocida por su calidad en la conversión de pesos.

## Capacidades

- Generación de texto y razonamiento: el modelo es de tipo *reasoning*, emite bloques de pensamiento (`thinking`) antes de la respuesta final (`response`), lo que mejora la calidad en tareas complejas.
- Multimodal: acepta entradas de texto, imagen y vídeo mediante el proyector multimodal incluido.
- Tool calling: soporta llamada a herramientas mediante el formato XML `<tool_call><function=...>`, lo que permite integrarlo en agentes y flujos de automatización.
- Contexto largo: ventana nativa de 262 144 tokens, adecuada para documentos extensos, análisis de código o conversaciones de muchos turnos.
- Compatibilidad con OpenAI API: el script `run-llamacpp.sh` expone un endpoint compatible con la API de chat completions de OpenAI, facilitando su integración con herramientas existentes.

## Casos de uso

- Análisis de documentos extensos: gracias a su contexto de 256K tokens, el modelo puede procesar libros completos, informes anuales o expedientes legales en una sola pasada, resumiendo y extrayendo información relevante sin necesidad de dividir el texto.
- Asistente multimodal para soporte técnico: al aceptar imágenes y vídeo, puede diagnosticar problemas a partir de capturas de pantalla o vídeos de error, generando respuestas con pasos de resolución.
- Generación y revisión de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisar pull requests, sugerir correcciones o generar tests automáticos.
- Chatbot conversacional de largo recorrido: la ventana de contexto amplia permite mantener conversaciones con historial extenso sin perder el hilo, útil en atención al cliente o asistentes personales.
- Procesamiento de vídeo para transcripción y análisis: el modelo puede recibir vídeo como entrada y generar descripciones, resúmenes o respuestas a preguntas sobre el contenido visual.
- RAG (Retrieval-Augmented Generation) con documentos grandes: al poder ingerir fragmentos largos de contexto, se reduce la necesidad de dividir los documentos en *chunks* pequeños, mejorando la coherencia de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: 24 GB para cargar todas las capas en GPU con cuantización Q4_K_M (17,77 GB de pesos + overhead).
- GPU recomendadas: la model card sugiere una configuración de dos GPUs (RTX 5060 Ti 16 GB + RTX 4060 Ti 8 GB) que suman 24 GB, aunque también es posible usar una sola GPU de 24 GB como RTX 3090, RTX 4090 o A5000.
- RAM del sistema: 128 GB recomendados para alojar la KV cache cuando se usa `--no-kv-offload`, lo que permite explotar el contexto completo de 256K tokens.
- Opciones de despliegue: llama.cpp (servidor con API OpenAI-compatible), Ollama (con limitación de contexto a 8K en 24 GB de VRAM), y potencialmente vLLM o TGI si se convierte a safetensors.
- Latencia y throughput: no disponible. El uso de `--no-kv-offload` traslada la KV cache a RAM, lo que puede aumentar la latencia en contextos muy largos, pero reduce los requisitos de VRAM.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (tamaño y capacidades multimodales). Se recomienda consultar benchmarks públicos de la familia Qwen3.8 o modelos como Llama 3.1 8B, Mistral 7B o Qwen2.5 7B para una referencia aproximada, aunque no se dispone de datos verificados en esta ficha.

## Limitaciones y advertencias

- Al ser un modelo de razonamiento, emite bloques de pensamiento que pueden aumentar la latencia y el consumo de tokens en comparación con modelos no razonadores.
- El uso de `--no-kv-offload` requiere una cantidad elevada de RAM del sistema (128 GB recomendados); con menos RAM, el contexto se verá limitado o el rendimiento se degradará.
- La cuantización Q4_K_M introduce una pérdida de precisión respecto al modelo en fp16, que puede ser relevante en tareas de alta sensibilidad numérica o razonamiento lógico.
- No se dispone de información sobre los idiomas soportados; es probable que el modelo base tenga un buen rendimiento en inglés y chino, pero no está confirmado.
- Aunque la licencia es Apache 2.0, es recomendable verificar los términos del modelo base en el repositorio oficial de Qwen para asegurar el cumplimiento en usos comerciales.
- El modelo puede alucinar en contextos ambiguos o cuando se le pide información factual no presente en su entrenamiento; se recomienda validación externa en aplicaciones críticas.

## Enlaces

- Repositorio GGUF: [https://huggingface.co/impacte/Qwen3.8-27B-GGUF](https://huggingface.co/impacte/Qwen3.8-27B-GGUF)
- Modelo base: [https://huggingface.co/Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Cuantización de bartowski: [https://huggingface.co/bartowski/Qwen3.8-27B-GGUF](https://huggingface.co/bartowski/Qwen3.8-27B-GGUF)
