# axteam/Qwen3.5-122B-A10B-AWQ-4bit

## Resumen

Qwen3.5-122B-A10B-AWQ-4bit es una cuantización a 4 bits (AWQ INT4, W4A16) del modelo Qwen3.5-122B-A10B de Qwen, realizada por el usuario axteam y orientada al despliegue eficiente con vLLM. El modelo base es un MoE multimodal de 122B parámetros totales con unos 10B parámetros activos por token, que combina atención híbrida (linear-attention más full-attention) con una torre de visión y una cabecera de predicción multi-token (MTP). La versión cuantizada reduce el tamaño en disco a unos 78,8 GB, haciendo viable servir el modelo en una sola GPU de gama alta o en configuraciones de dos GPU.

Su relevancia radica en que ofrece las capacidades del modelo original —razonamiento con thinking mode, visión, generación de texto y arquitectura MoE eficiente— con un consumo de memoria muy inferior al de los pesos en BF16. Está publicado bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones, y se distribuye en formato compressed-tensors pensado específicamente para el stack de vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (linear-attention + full-attention), MoE (256 expertos + experto compartido), multimodal (visión), cabecera MTP |
| Parámetros totales | 125.086.497.008 (dato real de safetensors; ~122B nominales) |
| Parámetros activos | ~10B por token (MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa `--max-model-len 32768`) |
| Tipos de cuantización | AWQ INT4 W4A16 (pesos INT4 asimétricos, group size 32, escala BF16 + zero-point INT4; activaciones BF16); componentes sensibles en BF16 (~4% de parámetros) |
| Idiomas soportados | No disponible (el corpus de calibración es mayoritariamente coreano con corpus mixto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B emplea una arquitectura híbrida que combina capas de atención lineal (con componentes conv1d, A_log y dt_bias típicos de modelos tipo SSM/linear attention) con capas de atención completa, lo que reduce el coste de la caché KV en secuencias largas. Sobre esa base se sitúa un bloque MoE con 256 expertos más un experto compartido, activando unos 10B de los 122B parámetros totales en cada token. Incluye además una torre de visión con proyector para entrada de imágenes y una cabecera de predicción multi-token (MTP) que puede acelerar la decodificación.

La cuantización AWQ es post-training (PTQ), sin reentrenamiento: utiliza un pequeño conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) para identificar y proteger los canales de pesos salientes antes del redondeo a INT4. En esta build se mantienen en BF16 la torre de visión y el proyector, la cabecera MTP, todas las RMSNorm, los embeddings y el LM head, el router MoE y la puerta del experto compartido, y las partes no lineales de la atención lineal, aproximadamente el 4% de los parámetros, con el objetivo de preservar la calidad. El tokenizador, el chat template y el generation config son idénticos a los del original; solo config.json añade el bloque de quantization_config.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat estándar de Qwen.
- Razonamiento con thinking mode activado por defecto en el chat template (desactivable con `chat_template_kwargs={"enable_thinking": False}`).
- Comprensión de imágenes (pipeline image-text-to-text): acepta entrada de imagen mediante URL o data URI junto al texto.
- Arquitectura MoE con ~10B parámetros activos, que permite latencias de inferencia propias de un modelo mucho menor manteniendo la capacidad de uno de 122B.
- Cabecera de predicción multi-token (MTP) para acelerar la generación.
- Atención híbrida (linear + full attention) que reduce el coste de memoria de la caché KV en contextos largos.
- Compatibilidad con servidores OpenAI-compatible vía vLLM, lo que facilita la integración con tooling existente (tool calling y capacidades de agente dependen del modelo base; no se detalla en la información disponible).

## Casos de uso

- Servir un modelo grande de forma autosuficiente en una GPU: con ~78,8 GB en disco en INT4, el modelo cabe en una sola GPU de 80 GB (A100/H100), permitiendo despliegues de razonamiento avanzado sin clúster multi-nodo.
- Chatbots conversacionales con capacidad de razonamiento: el thinking mode por defecto permite respuestas elaboradas paso a paso en tareas complejas, con muestreo recomendado temperature 0,6, top_p 0,95 y top_k 20.
- Análisis de imágenes integrado en aplicaciones: se pueden enviar imágenes por URL o data URI para descripción, extracción de información visual o QA multimodal directamente desde un endpoint OpenAI-compatible.
- Procesamiento por lotes offline en Python: la API `LLM.chat()` de vLLM permite ejecutar volúmenes grandes de inferencia (clasificación, resumen, generación sintética de datos) sin exponer un servidor.
- Serving de solo texto optimizado: añadiendo `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se libera el presupuesto de memoria del encoder de visión cuando no se necesita multimodalidad.
- Contextos largos con memoria contenida: la combinación de atención lineal y KV-cache en FP8 (`--kv-cache-dtype fp8`) reduce aproximadamente a la mitad la memoria de caché, útil para documentos extensos o lotes grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de una cuantización PTQ, el rendimiento debería aproximarse al del modelo base Qwen3.5-122B-A10B, cuyos resultados tampoco constan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 78,8 GB solo de pesos; con caché KV y overhead de vLLM, se recomienda una GPU de 80 GB (o dos GPU de 48 GB con tensor parallel). Con `--max-model-len 32768` y KV-cache en FP8, una A100/H100 de 80 GB es suficiente.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB. En consumer no cabe en una RTX 4090 (24 GB); sería necesario al menos hardware profesional de 80 GB o multi-GPU consumer (por ejemplo, 4x RTX 3090/4090 con tensor parallel, no verificado en la documentación).
- No cabe en una única GPU consumer estándar; el tamaño en disco descarta despliegues en portátiles o GPU de 8-24 GB.
- Despliegue: diseñado para vLLM (`vllm serve` con servidor OpenAI-compatible en el puerto 8000, o inferencia offline con la clase `LLM`). No hay soporte documentado para llama.cpp, Ollama o TGI; el formato compressed-tensors está orientado a vLLM.
- Latencia y throughput: no disponibles; la activación de ~10B parámetros y la cabecera MTP sugieren latencias competitivas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-AWQ-4bit (esta ficha) | ~122B (125B reales) | ~10B | No disponible (ejemplo: 32.768) | Sí (visión) | Apache-2.0 |
| Qwen/Qwen3.5-122B-A10B (base, BF16) | ~122B | ~10B | No disponible | Sí (visión) | Apache-2.0 |
| Modelos MoE similares de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas concretas de terceros (por ejemplo, DeepSeek o Mixtral) en cuanto a rendimiento; la comparativa más directa es con el modelo base original, del que esta versión cuantizada reduce el tamaño en disco a ~78,8 GB a cambio de una posible pérdida mínima de calidad por la PTQ.

## Limitaciones y advertencias

- La cuantización AWQ se calibró con un corpus de 256 muestras con predominio de coreano, lo que puede degradar ligeramente la calidad en otros idiomas, incluido el castellano; conviene validar el modelo en el idioma de uso antes de producción.
- Al ser una cuantización PTQ sin reentrenamiento, existe una pérdida de calidad inherente al paso a INT4, aunque la protección de canales salientes y el 4% de parámetros en BF16 la minimizan.
- El riesgo de alucinación es el propio del modelo base; no hay datos publicados que lo cuantifiquen.
- La longitud máxima de contexto no está documentada en la model card; el ejemplo usa 32.768 tokens, pero el límite real del modelo base no consta.
- Los idiomas soportados no están especificados en los metadatos.
- En cuanto a licencia, Apache-2.0 permite uso comercial sin restricciones relevantes; los derechos sobre pesos, tokenizador y chat template originales pertenecen al equipo de Qwen.
- El modelo requiere vLLM (formato compressed-tensors); no es directamente compatible con llama.cpp, Ollama u otros runtimes de GGUF.
- La descarga del modelo es muy baja (22 descargas y 1 like en el momento de la ficha), por lo que es una build comunitaria sin respaldo oficial de Qwen; se recomienda validarla frente al modelo base antes de uso crítico.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.5-122B-A10B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
